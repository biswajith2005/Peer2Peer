import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) { alert(message); return; }
  msg.innerText = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 50);
  setTimeout(() => {
    toast.classList.add('translate-y-10', 'opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 500);
  }, 2500);
}

// LOGIN
window.login = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showToast("Please enter email and password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(error.message);
    console.error("LOGIN ERROR:", error);
  }
};

// Show/hide the inline signup form
window.showSignupForm = () => {
  const f = document.getElementById("signupForm");
  if (f) f.classList.remove("hidden");
};
window.hideSignupForm = () => {
  const f = document.getElementById("signupForm");
  if (f) f.classList.add("hidden");
};

// Submit signup with additional profile details
window.submitSignup = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("signupName").value.trim();
  const department = document.getElementById("signupDepartment").value.trim();
  const year = document.getElementById("signupYear").value.trim();
  const offered = document.getElementById("signupOffered").value.trim();
  const wanted = document.getElementById("signupWanted").value.trim();

  if (!email || !password) {
    showToast("Please enter email and password");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters");
    return;
  }

  if (!name || !department) {
    showToast("Please provide your name and department");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user || auth.currentUser;

    const profileData = {
      name,
      department,
      year: year || "",
      skillsOffered: offered ? offered.split(",").map(s=>s.trim()).filter(Boolean) : [],
      skillsWanted: wanted ? wanted.split(",").map(s=>s.trim()).filter(Boolean) : [],
      honorScore: 0,
      skillsCount: 0,
      queriesCount: 0,
      answersCount: 0,
      requestsSent: 0,
      mockTestsCount: 0,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", user.uid), profileData);

    // Update auth profile displayName so it is available elsewhere
    try { await updateProfile(user, { displayName: name }); } catch (e) { /* ignore */ }

    // Show success message and redirect user to profile setup so they can immediately see/update their info
    showToast("Account created successfully — taking you to profile setup.");
    setTimeout(() => { window.location.href = "profile.html?setup=1"; }, 800);
  } catch (error) {
    showToast(error.message);
    console.error("SIGNUP ERROR:", error);
  }
};

// GOOGLE LOGIN
window.googleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // If signed in with Google, ensure we have a users doc
    const user = result.user || auth.currentUser;
    if (user) {
      // Check if users/{uid} exists and redirect to setup if missing
      try {
        const { getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          // create a minimal profile and send user to setup page
          const profileData = {
            name: user.displayName || "",
            department: "",
            year: "",
            skillsOffered: [],
            skillsWanted: [],
            honorScore: 0,
            skillsCount: 0,
            queriesCount: 0,
            answersCount: 0,
            requestsSent: 0,
            mockTestsCount: 0,
            createdAt: serverTimestamp()
          };
          await setDoc(doc(db, "users", user.uid), profileData);

          showToast("Welcome — please complete your profile.");
          setTimeout(() => { window.location.href = "profile.html?setup=1"; }, 800);
          return;
        }
      } catch (err) {
        console.error('Error checking user doc:', err);
      }
    }

    // Default behaviour: go to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(error.message);
    console.error("GOOGLE LOGIN ERROR:", error);
  }
};

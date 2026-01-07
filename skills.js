import { auth, db } from "./firebase.js";

import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* =========================
   SMALL TOAST
========================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  const msg = document.getElementById("toastMessage");
  if (!toast || !msg) { alert(message); return; }

  msg.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  }, 50);

  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => toast.classList.add("hidden"), 500);
  }, 2500);
}

/* =========================
   ADD SKILL (Publish Skill)
========================= */
window.addSkill = async () => {
  const title = document.getElementById("skillTitle").value.trim();
  const description = document.getElementById("skillDesc").value.trim();

  if (!title || !description) {
    showToast("Please fill all fields");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showToast("Please login first");
    return;
  }

  try {
    await addDoc(collection(db, "skills"), {
      title,
      description,
      mentorId: user.uid,
      createdAt: serverTimestamp()
    });

    showToast("Skill published and added to your profile");

    // clear form
    document.getElementById("skillTitle").value = "";
    document.getElementById("skillDesc").value = "";

    // increment publisher's skill count
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skillsCount: increment(1)
      });
    } catch (err) {
      if (err && err.code === 'not-found') {
        await setDoc(doc(db, 'users', user.uid), { skillsCount: 1 }, { merge: true });
      } else {
        console.error('INCREMENT SKILL COUNT ERROR:', err);
      }
    }

    // Add this skill title to user's skillsOffered array (so profile updates automatically)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skillsOffered: arrayUnion(title)
      });
    } catch (err) {
      if (err && err.code === 'not-found') {
        await setDoc(doc(db, 'users', user.uid), { skillsOffered: [title] }, { merge: true });
      } else {
        console.error('UPDATE USER SKILLS ERROR:', err);
      }
    }

  } catch (err) {
    console.error("PUBLISH SKILL ERROR:", err);
    if (err && err.code === 'permission-denied') {
      showToast('Permission denied: cannot publish skill. Ensure you are logged in and Firestore rules allow this write.');
    } else {
      showToast(`Failed to publish skill: ${err.message || 'unknown error'}`);
    }
  }
};

/* =========================
   LOAD SKILLS (MARKETPLACE) - realtime
========================= */
const skillGrid = document.getElementById("skillGrid");

const loadSkills = async () => {
  if (!skillGrid) return;

  const q = query(collection(db, "skills"), orderBy("createdAt", "desc"));

  onSnapshot(q, async (snapshot) => {
    skillGrid.innerHTML = "";
    if (snapshot.empty) {
      skillGrid.innerHTML = `
        <div class="col-span-full text-center text-gray-400">
          No skills published yet.
        </div>
      `;
      return;
    }

    // iterate docs and fetch mentor name
    for (const docSnap of snapshot.docs) {
      const skill = docSnap.data();
      let mentorName = "Unknown";

      if (skill.mentorId) {
        try {
          const u = await getDoc(doc(db, "users", skill.mentorId));
          if (u.exists()) mentorName = u.data().name || "User";
        } catch (e) { /* ignore */ }
      }

      skillGrid.innerHTML += `
        <div class="bg-white rounded-xl p-5 shadow-sm
                    transition-transform duration-200
                    hover:-translate-y-1 hover:shadow-lg min-h-[160px] flex flex-col">

          <h3 class="text-lg font-semibold">${skill.title}</h3>
          <p class="text-gray-600 text-sm mt-2 flex-1 overflow-hidden max-h-16">
            ${skill.description}
          </p>

          <div class="flex items-center justify-between gap-3 mt-4 text-sm text-gray-600">
            <div>By <a href="profile.html?uid=${skill.mentorId}" class="text-indigo-600 hover:underline">${mentorName}</a></div>
            <span class="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">Offered</span>
          </div>

          <a href="skill.html?skill=${docSnap.id}"
             class="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:underline">
            View & Exchange →
          </a>
        </div>
      `;
    }
  });
};

// Auth state: enable/disable publish button
const publishBtn = document.getElementById('skillPublishBtn');
const authHint = document.getElementById('skillAuthHint');

if (publishBtn) publishBtn.disabled = true;

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (publishBtn) publishBtn.disabled = !user;
  if (authHint) {
    if (user) authHint.classList.add('hidden');
    else authHint.classList.remove('hidden');
  }
});

// auto load on page open
loadSkills();

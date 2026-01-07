import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, onSnapshot } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Update dashboard with live profile data
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  // Subscribe to realtime changes so profile edits reflect immediately
  const unsubscribe = onSnapshot(userRef, (snap) => {
    const data = snap.exists() ? snap.data() : null;

    const avatar = document.getElementById("dashAvatar");
    const welcome = document.getElementById("dashWelcome");
    const sub = document.getElementById("dashSubtext");
    const honor = document.getElementById("dashHonor");
    const completed = document.getElementById("profileCompletedBadge");

    if (data) {
      const name = data.name || user.displayName || "User";
      if (avatar) avatar.innerText = (name || "U")[0].toUpperCase();
      if (welcome) welcome.innerText = `Welcome back ${name} 👋`;

      // build subtext including department, year and quick stats
      if (sub) {
        const parts = [];
        if (data.department) parts.push(data.department);
        if (data.year) parts.push(data.year);
        parts.push(`${data.skillsCount || 0} skills`);
        parts.push(`${data.queriesCount || 0} queries`);
        sub.innerText = parts.join(' • ');
      }

      // show a small skills preview
      const skillsEl = document.getElementById('dashSkills');
      if (skillsEl) skillsEl.innerText = (data.skillsOffered && data.skillsOffered.length) ? data.skillsOffered.slice(0,3).join(', ') : 'No skills yet';

      if (honor) honor.innerText = `Honor Score: ${data.honorScore || 0}`;
      if (completed) completed.classList.remove("hidden");
    } else {
      // No profile doc yet
      if (avatar) avatar.innerText = (user.displayName || "U")[0].toUpperCase();
      if (welcome) welcome.innerText = `Welcome back 👋`;
      if (sub) sub.innerText = `Complete your profile`;
      if (honor) honor.innerText = `Honor Score: 0`;
      if (completed) completed.classList.add("hidden");
    }
  });

  // cleanup on page unload
  window.addEventListener('beforeunload', () => unsubscribe());
});

// Logout
window.logout = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

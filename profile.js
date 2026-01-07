import { auth, db } from "./firebase.js";
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* =========================
   LOAD PROFILE (realtime)
========================= */
let _profileUnsubscribe = null;

window.loadProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "users", user.uid);

  // already subscribed
  if (_profileUnsubscribe) return;

  _profileUnsubscribe = onSnapshot(docRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    // HEADER
    document.getElementById("displayName").innerText = data.name || "User";
    document.getElementById("displayBranch").innerText = data.department || "-";
    document.getElementById("displayYear").innerText = data.year || "-";
    document.getElementById("avatar").innerText =
      (data.name || "U")[0].toUpperCase();

    // STATS
    if (document.getElementById("honorScore")) document.getElementById("honorScore").innerText = data.honorScore || 0;
    if (document.getElementById("skillsCount")) document.getElementById("skillsCount").innerText = data.skillsCount || 0;
    if (document.getElementById("queriesCount")) document.getElementById("queriesCount").innerText = data.queriesCount || 0;
    if (document.getElementById("answersCount")) document.getElementById("answersCount").innerText = data.answersCount || 0;

    // SKILLS
    document.getElementById("skillsOffered").innerText =
      (data.skillsOffered && data.skillsOffered.join(", ")) || "Not added";

    document.getElementById("skillsWanted").innerText =
      (data.skillsWanted && data.skillsWanted.join(", ")) || "Not added";

    // ABOUT
    document.getElementById("aboutMe").innerText =
      data.about || "No description added.";

    // MODAL INPUTS (keep them in sync)
    document.getElementById("nameInput").value = data.name || "";
    document.getElementById("branchInput").value = data.department || "";
    document.getElementById("yearInput").value = data.year || "";
    document.getElementById("aboutInput").value = data.about || "";
    document.getElementById("offeredInput").value =
      (data.skillsOffered && data.skillsOffered.join(", ")) || "";
    document.getElementById("wantedInput").value =
      (data.skillsWanted && data.skillsWanted.join(", ")) || "";
  });
};

/* =========================
   SAVE PROFILE
========================= */
window.saveProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const profileData = {
    name: document.getElementById("nameInput").value.trim(),
    department: document.getElementById("branchInput").value.trim(),
    year: document.getElementById("yearInput").value.trim(),
    about: document.getElementById("aboutInput").value.trim(),
    skillsOffered: document
      .getElementById("offeredInput")
      .value.split(",")
      .map(s => s.trim())
      .filter(Boolean),
    skillsWanted: document
      .getElementById("wantedInput")
      .value.split(",")
      .map(s => s.trim())
      .filter(Boolean),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, "users", user.uid), profileData, { merge: true });

  // Reload UI after save
  await loadProfile();
};

/* =========================
   AUTH LISTENER
========================= */
auth.onAuthStateChanged(user => {
  if (!user) {
    // unsubscribe profile listener when signed out
    if (typeof _profileUnsubscribe === 'function') {
      try { _profileUnsubscribe(); } catch (e) { /* ignore */ }
    }
    _profileUnsubscribe = null;
    window.location.href = "login.html";
  } else {
    loadProfile();
  }
});

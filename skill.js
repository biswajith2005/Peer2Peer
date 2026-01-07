import { auth, db } from "./firebase.js";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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

let skillId = null;
let skillData = null;
let mentorId = null;

export async function loadSkill() {
  const params = new URLSearchParams(window.location.search);
  skillId = params.get('skill');
  if (!skillId) {
    document.getElementById('skillContainer').innerText = 'No skill specified.';
    return;
  }

  const skillRef = doc(db, 'skills', skillId);
  const snap = await getDoc(skillRef);
  if (!snap.exists()) {
    document.getElementById('skillContainer').innerText = 'Skill not found.';
    return;
  }

  skillData = snap.data();
  mentorId = skillData.mentorId;

  document.getElementById('skillTitle').innerText = skillData.title || 'Untitled';
  document.getElementById('skillDescription').innerText = skillData.description || '';
  document.getElementById('skillMeta').innerText = `Posted: ${skillData.createdAt ? new Date(skillData.createdAt.toMillis()).toLocaleString() : '—'}`;

  const mentorLink = document.getElementById('mentorLink');
  if (mentorId) {
    mentorLink.href = `profile.html?uid=${mentorId}`;
    // Fetch mentor name
    try {
      const uSnap = await getDoc(doc(db, 'users', mentorId));
      if (uSnap.exists()) {
        const m = uSnap.data();
        mentorLink.innerText = m.name || 'Mentor profile';
      } else {
        mentorLink.innerText = 'Mentor profile';
      }
    } catch (e) { mentorLink.innerText = 'Mentor profile'; }
  } else {
    mentorLink.innerText = 'Mentor profile';
    mentorLink.href = '#';
  }

  // If current user is mentor, hide request button
  onAuthStateChanged(auth, (user) => {
    const btn = document.getElementById('requestBtn');
    if (!btn) return;
    if (user && mentorId && user.uid === mentorId) {
      btn.disabled = true;
      btn.innerText = 'This is your skill';
    } else {
      btn.disabled = false;
      btn.innerText = 'Request Exchange';
    }
  });
}

window.openRequestModal = () => {
  const m = document.getElementById('requestModal');
  if (!m) return;
  m.classList.remove('hidden');
  m.classList.add('flex');
}

window.closeRequestModal = () => {
  const m = document.getElementById('requestModal');
  if (!m) return;
  m.classList.remove('flex');
  m.classList.add('hidden');
}

window.sendSkillRequest = async () => {
  const user = auth.currentUser;
  if (!user) { showToast('Please login to send requests'); return; }
  if (!skillId || !mentorId) { showToast('Skill or mentor missing'); return; }

  const message = document.getElementById('requestMessage').value.trim();
  if (!message) { showToast('Please add a short message'); return; }

  const btn = document.getElementById('sendRequestBtn');
  btn.disabled = true;

  try {
    await addDoc(collection(db, 'skillRequests'), {
      skillId,
      fromUserId: user.uid,
      toUserId: mentorId,
      message,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    showToast('Request sent');
    document.getElementById('requestMessage').value = '';
    closeRequestModal();

    // increment sender's requestsSent counter
    try {
      await updateDoc(doc(db, 'users', user.uid), { requestsSent: increment(1) });
    } catch (err) {
      if (err && err.code === 'not-found') {
        await setDoc(doc(db, 'users', user.uid), { requestsSent: 1 }, { merge: true });
      } else {
        console.error('INCREMENT REQUESTS SENT ERROR:', err);
      }
    }
  } catch (err) {
    console.error('SEND REQUEST ERROR:', err);
    if (err && err.code === 'permission-denied') {
      showToast('Permission denied: cannot send request. Ensure you are logged in and Firestore rules allow this write.');
    } else {
      showToast(`Failed to send request: ${err.message || 'unknown error'}`);
    }
  } finally {
    btn.disabled = false;
  }
}

// Auto-run load
window.addEventListener('DOMContentLoaded', () => { loadSkill(); });

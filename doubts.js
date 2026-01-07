import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  collection,
  collectionGroup,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  setDoc,
  increment,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

/* ======================
   SUCCESS TOAST
====================== */
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

/* ======================
   POST QUERY
====================== */
window.postDoubt = async () => {
  const text = document.getElementById("doubtText").value.trim();
  const subject = document.getElementById("doubtSubject").value.trim();
  const anon = document.getElementById("doubtAnonymous")?.checked;

  if (!text || !subject) {
    showToast("Please enter subject and query");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showToast('Please login to post queries');
    return;
  }

  const askedBy = anon ? "anonymous" : user.uid;

  try {
    await addDoc(collection(db, "doubts"), {
      question: text,
      subject,
      askedBy,
      askedAt: serverTimestamp(),
      answersCount: 0
    });

    document.getElementById("doubtText").value = "";
    document.getElementById("doubtSubject").value = "";
    if (document.getElementById("doubtAnonymous")) document.getElementById("doubtAnonymous").checked = false;

    showToast("Query posted successfully!");

    // increment user's queries count
    try {
      await updateDoc(doc(db, 'users', user.uid), { queriesCount: increment(1) });
    } catch (err) {
      if (err && err.code === 'not-found') {
        await setDoc(doc(db, 'users', user.uid), { queriesCount: 1 }, { merge: true });
      } else {
        console.error('INCREMENT QUERY COUNT ERROR:', err);
      }
    }
  } catch (err) {
    console.error('POST QUERY ERROR:', err);
    if (err && err.code === 'permission-denied') {
      showToast('Permission denied: cannot post query. Ensure you are logged in and Firestore rules allow this write.');
    } else {
      showToast(`Failed to post query: ${err.message || 'unknown error'}`);
    }
  }
};

// enable/disable post button based on auth
const postBtn = document.getElementById('postDoubtBtn');
const doubtHint = document.getElementById('doubtAuthHint');
if (postBtn) postBtn.disabled = true;
if (doubtHint) doubtHint.classList.remove('hidden');

onAuthStateChanged(auth, (user) => {
  if (postBtn) postBtn.disabled = !user;
  if (doubtHint) {
    if (user) doubtHint.classList.add('hidden');
    else doubtHint.classList.remove('hidden');
  }
});

/* ======================
   LOAD RECENT QUERIES (SUBJECT-WISE) - realtime
====================== */
window.loadDoubts = async () => {
  const list = document.getElementById("doubtsList");
  const filterEl = document.getElementById("subjectFilter");
  const filter = filterEl ? filterEl.value : "all";

  list.innerHTML = "";

  const q = query(collection(db, "doubts"), orderBy("askedAt", "desc"));

  // unsubscribe previous listener if any
  if (window._doubtsUnsubscribe) window._doubtsUnsubscribe();

  window._doubtsUnsubscribe = onSnapshot(q, async (snapshot) => {
    list.innerHTML = "";

    if (!snapshot.size) {
      list.innerHTML = `<p class="text-gray-500">No queries found</p>`;
      return;
    }

    for (const d of snapshot.docs) {
      const data = d.data();
      if (filter !== "all" && data.subject !== filter) continue;

      const askedByDisplay = data.askedBy === "anonymous" ? "Anonymous" : `<a href=\"profile.html?uid=${data.askedBy}\" class=\"text-indigo-600 hover:underline\">View Profile</a>`;

      list.innerHTML += `
  <div class="bg-white p-6 rounded-xl shadow-sm">

    <div class="flex justify-between items-center">
      <div>
        <p class="font-semibold text-lg">${data.question}</p>
        <p class="text-sm text-gray-500">#${data.subject} • Posted by ${askedByDisplay}</p>
      </div>

      <div class="flex gap-3">
        <button
          onclick="toggleAnswer('${d.id}')"
          class="text-indigo-600 font-semibold text-sm"
        >
          Answer ▼
        </button>
        <button
          onclick="toggleAnswersList('${d.id}')"
          class="text-gray-600 text-sm underline"
        >
          View answers
        </button>
      </div>
    </div>

    <div id="answer-box-${d.id}" class="hidden mt-4">
      <input
        id="answer-${d.id}"
        placeholder="Write your answer..."
        class="w-full p-2 border rounded mb-2"
      />

      <button
        onclick="answerDoubt('${d.id}')"
        class="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Submit Answer
      </button>
    </div>

    <div id="answers-list-${d.id}" class="mt-4 hidden space-y-3"></div>

  </div>
`;
    }
  });
};
/* ======================
   TOGGLE ANSWER BOX
====================== */
window.toggleAnswer = (id) => {
  const box = document.getElementById(`answer-box-${id}`);
  box.classList.toggle("hidden");
};


/* ======================
   ANSWER QUERY
====================== */
window.answerDoubt = async (doubtId) => {
  const user = auth.currentUser;
  if (!user) { showToast('Please login to answer'); return; }

  const input = document.getElementById(`answer-${doubtId}`);
  const text = input.value.trim();
  if (!text) return;

  await addDoc(collection(db, "doubts", doubtId, "answers"), {
    text,
    answeredBy: user.uid,
    answeredAt: serverTimestamp()
  });

  await updateDoc(doc(db, "doubts", doubtId), {
    answersCount: increment(1)
  });

  input.value = "";

  showToast("Answer submitted successfully!");
  loadMyContributions();
  // increment user's answers count and honor score
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      answersCount: increment(1),
      honorScore: increment(1)
    });
  } catch (err) {
    if (err && err.code === 'not-found') {
      await setDoc(doc(db, 'users', user.uid), { answersCount: 1, honorScore: 1 }, { merge: true });
    } else {
      console.error('INCREMENT ANSWER/HONOR ERROR:', err);
    }
  }
  // reload answers list if visible
  if (document.getElementById(`answers-list-${doubtId}`) && !document.getElementById(`answers-list-${doubtId}`).classList.contains('hidden')) {
    loadAnswers(doubtId);
  }
};

// Load answers for a doubt
window.loadAnswers = async (doubtId) => {
  const container = document.getElementById(`answers-list-${doubtId}`);
  if (!container) return;
  container.innerHTML = '<p class="text-sm text-gray-500">Loading answers…</p>';

  const answersSnap = await getDocs(query(collection(db, "doubts", doubtId, "answers"), orderBy("answeredAt", "desc")));
  if (!answersSnap.size) {
    container.innerHTML = `<p class="text-gray-500">No answers yet</p>`;
    return;
  }

  container.innerHTML = "";
  for (const a of answersSnap.docs) {
    const ad = a.data();
    const userLink = ad.answeredBy ? `<a href=\"profile.html?uid=${ad.answeredBy}\" class=\"text-indigo-600 hover:underline\">View Profile</a>` : 'Anonymous';

    container.innerHTML += `
      <div class="p-3 rounded border">
        <p class="text-sm">${ad.text}</p>
        <p class="text-xs text-gray-500 mt-1">Answered by ${userLink}</p>
      </div>
    `;
  }
};

// Toggle answers list visibility and load when opening
window.toggleAnswersList = (doubtId) => {
  const container = document.getElementById(`answers-list-${doubtId}`);
  if (!container) return;
  container.classList.toggle('hidden');
  if (!container.classList.contains('hidden')) {
    loadAnswers(doubtId);
  }
};

/* ======================
   REAL-TIME MY CONTRIBUTIONS (collectionGroup)
====================== */
let _myContribUnsubscribe = null;

async function subscribeMyContributionsRealtime() {
  const container = document.getElementById("myContributions");
  const user = auth.currentUser;
  if (!user) return;

  // unsubscribe previous listener
  if (_myContribUnsubscribe) {
    try { _myContribUnsubscribe(); } catch (e) { /* ignore */ }
    _myContribUnsubscribe = null;
  }

  const q = query(
    collectionGroup(db, 'answers'),
    where('answeredBy', '==', user.uid),
    orderBy('answeredAt', 'desc')
  );

  _myContribUnsubscribe = onSnapshot(q, async (snapshot) => {
    if (!container) return;
    container.innerHTML = '';

    if (snapshot.empty) {
      container.innerHTML = `<p class="text-gray-500">No contributions yet</p>`;
      return;
    }

    // fetch parent doubts in parallel
    const items = await Promise.all(snapshot.docs.map(async (aDoc) => {
      const answerData = aDoc.data();
      const parentRef = aDoc.ref.parent.parent; // doubts/{doubtId}
      if (!parentRef) return null;
      try {
        const parentSnap = await getDoc(parentRef);
        if (!parentSnap.exists()) return null;
        const d = parentSnap.data();
        return {
          doubtId: parentRef.id,
          question: d.question,
          subject: d.subject,
          answerText: answerData.text
        };
      } catch (e) { return null; }
    }));

    const filtered = items.filter(Boolean);
    for (const it of filtered) {
      const questionEsc = it.question.replace(/'/g, "\\'");
      const subjectEsc = it.subject;
      const answerEsc = (it.answerText || '').replace(/'/g, "\\'");

      container.innerHTML += `
        <div
          onclick="openModal('${questionEsc}', '${subjectEsc}', '${answerEsc}')"
          class="cursor-pointer p-3 rounded-lg border hover:bg-indigo-50"
        >
          <p class="font-semibold text-sm">${it.question}</p>
          <p class="text-xs text-gray-500">#${it.subject}</p>
        </div>
      `;
    }
  });
}

// Keep legacy load as fallback
async function loadMyContributions() {
  const container = document.getElementById("myContributions");
  const user = auth.currentUser;
  if (!user) return;

  container.innerHTML = "";

  const doubtsSnapshot = await getDocs(collection(db, "doubts"));
  let found = false;

  for (const doubt of doubtsSnapshot.docs) {
    const answersSnapshot = await getDocs(
      collection(db, "doubts", doubt.id, "answers")
    );

    answersSnapshot.forEach(answer => {
      if (answer.data().answeredBy === user.uid) {
        found = true;

        const question = doubt.data().question.replace(/'/g, "\\'");
        const subject = doubt.data().subject;
        const answerText = answer.data().text.replace(/'/g, "\\'");

        container.innerHTML += `
          <div
            onclick="openModal('${question}', '${subject}', '${answerText}')"
            class="cursor-pointer p-3 rounded-lg border hover:bg-indigo-50"
          >
            <p class="font-semibold text-sm">${doubt.data().question}</p>
            <p class="text-xs text-gray-500">#${doubt.data().subject}</p>
          </div>
        `;
      }
    });
  }

  if (!found) {
    container.innerHTML = `<p class="text-gray-500">No contributions yet</p>`;
  }
}

/* ======================
   MODAL CONTROLS
====================== */
window.openModal = (question, subject, answer) => {
  document.getElementById("modalQuestion").innerText = question;
  document.getElementById("modalSubject").innerText = "#" + subject;
  document.getElementById("modalAnswer").innerText = answer;

  const modal = document.getElementById("contributionModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.closeModal = () => {
  const modal = document.getElementById("contributionModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
};

/* ======================
   INITIAL LOAD
====================== */
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadDoubts();
    // subscribe to real-time contributions (falls back to loader if needed)
    subscribeMyContributionsRealtime().catch(() => loadMyContributions());
  } else {
    // cleanup listeners when signed out
    if (window._doubtsUnsubscribe) { try { window._doubtsUnsubscribe(); } catch (e) {} window._doubtsUnsubscribe = null; }
    if (typeof _myContribUnsubscribe === 'function') { try { _myContribUnsubscribe(); } catch (e) {} _myContribUnsubscribe = null; }
  }
});

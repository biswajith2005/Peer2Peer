import { auth, db } from "./firebase.js";
import { addDoc, collection, serverTimestamp, updateDoc, increment, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

/* =========================
   PREVIOUS YEAR QUESTION PAPERS (FAKE PDF)
========================= */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) { alert(message); return; }
  const msg = document.getElementById("toastMessage");
  if (msg) msg.innerText = message;
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

window.loadQuestionPaper = () => {
  const subject = document.getElementById("subject").value;
  const year = document.getElementById("year").value;
  const semester = document.getElementById("semester").value;
  const examType = document.getElementById("examType").value;

  const container = document.getElementById("questionPaper");
  const fileName = `${subject}_${year}_${examType}.pdf`;

  container.innerHTML = `
    <h3 class="text-xl font-bold mb-4">
      ${subject} – ${year} – ${semester} (${examType} Exam)
    </h3>

    <div class="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
      <div>
        <p class="font-semibold">📄 ${fileName}</p>
        <p class="text-sm text-gray-500">Previous Year Question Paper</p>
      </div>

      <a href="./pdfs/${fileName}" download
        class="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold">
        Download
      </a>
    </div>
  `;

  container.classList.remove("hidden");
};

/* =========================
   AI MOCK TEST (DEMO VERSION)
========================= */
const AI_QUESTIONS = {
  DBMS: {
    Easy: [
      "Define database and DBMS.",
      "What is a primary key?",
      "What is normalization?"
    ],
    Medium: [
      "Explain ACID properties with examples.",
      "Explain different types of keys.",
      "What is indexing?"
    ],
    Hard: [
      "Explain transaction management in DBMS.",
      "Discuss normalization vs denormalization.",
      "Explain concurrency control techniques."
    ]
  },

  Java: {
    Easy: [
      "What is Java?",
      "Explain JVM.",
      "What is object-oriented programming?"
    ],
    Medium: [
      "Explain inheritance and polymorphism.",
      "Difference between JDK and JRE.",
      "Explain exception handling."
    ],
    Hard: [
      "Explain multithreading in Java.",
      "Explain garbage collection.",
      "Explain Java memory model."
    ]
  },

  DSA: {
    Easy: [
      "What is a data structure?",
      "Explain array.",
      "What is a stack?"
    ],
    Medium: [
      "Explain binary search.",
      "Explain linked list operations.",
      "What is time complexity?"
    ],
    Hard: [
      "Explain graph traversal algorithms.",
      "Explain dynamic programming.",
      "Explain AVL trees."
    ]
  }
};

window.generateAIMock = () => {
  const subject = document.getElementById("aiSubject").value;
  const difficulty = document.getElementById("aiDifficulty").value;
  const container = document.getElementById("aiTestSection");

  container.innerHTML = `
    <h3 class="text-lg font-bold mb-4">
      AI Generated Questions – ${subject} (${difficulty})
    </h3>
  `;

  const questions = AI_QUESTIONS[subject][difficulty];
  questions.forEach((q, i) => {
    container.innerHTML += `
      <p><b>Q${i + 1}.</b> ${q}</p>
    `;
  });

  container.classList.remove("hidden");

  // Persist generated test for logged-in users
  (async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "mockTests"), {
          subject,
          difficulty,
          questions,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        showToast('Mock test saved to your history');

        // increment user's mock test count
        try {
          await updateDoc(doc(db, 'users', user.uid), { mockTestsCount: increment(1) });
        } catch (err) {
          if (err && err.code === 'not-found') {
            await setDoc(doc(db, 'users', user.uid), { mockTestsCount: 1 }, { merge: true });
          } else {
            console.error('INCREMENT MOCK TEST COUNT ERROR:', err);
          }
        }
      }
    } catch (err) {
      console.error('SAVE MOCK ERROR:', err);
      showToast('Failed to save mock test');
    }
  })();
};

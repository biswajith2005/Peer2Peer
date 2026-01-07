# 🎓 Peer2Peer – Campus Peer-to-Peer Learning Platform

Peer2Peer is a **campus-focused peer-to-peer learning platform** that enables students to **teach, learn, and collaborate** by exchanging skills, solving doubts, and building reputation through real contributions.

This project is designed as a **scalable, real-world EdTech product** using **Firebase backend services** with a **clean, student-friendly UI**.

---

## 🌟 Key Features

### 🔐 Authentication
- Email & Password authentication  
- Google Sign-In  
- Secure session handling using Firebase Authentication  

### 👤 User Profile System
- Editable profile  
  - Name  
  - Branch  
  - Year  
  - About Me  
- Skills Offered & Skills Wanted  
- Persistent profile data stored in Firestore  
- Honor Score & activity statistics  

### 📊 Real-Time Dashboard
- Auto-updating dashboard using Firestore real-time listeners (`onSnapshot`)
- Displays:
  - Honor Score  
  - Students Helped  
  - Doubts Answered  
  - Sessions Hosted  
  - Badges Earned  

### 🤝 Peer Skill Exchange *(Planned / In Progress)*
- Request skills in exchange for another skill  
- Accept / reject skill requests  
- Track exchange completion  

### ❓ Anonymous Doubt Solving
- Post doubts anonymously  
- Answer doubts from peers  
- Automatic honor score updates on contributions  

### 🏆 Gamification
- Honor Score system  
- Badges & achievements  
- Contribution-based reputation model  

---

## 🛠️ Tech Stack

### Frontend
- HTML5  
- Tailwind CSS  
- JavaScript (ES Modules)

### Backend (BaaS)
- Firebase Authentication  
- Firebase Firestore (NoSQL Database)  
- Firebase real-time listeners (`onSnapshot`)

---

## 🧠 Architecture Overview

```text
Frontend (HTML / JS)
        ↓
Firebase SDK (CDN)
        ↓
Firebase Authentication
        ↓
Firestore Database

# Peer2Peer – Campus Peer-to-Peer Learning Platform

Peer2Peer is a campus-focused peer-to-peer learning platform that enables students to teach, learn, and collaborate by exchanging skills, solving doubts, and building reputation through real contributions.

The platform is designed as a scalable, real-world EdTech MVP built using Firebase backend services with a clean, student-friendly interface tailored for campus use.

---

## Project Overview

Peer2Peer provides a structured and trusted environment for students to share knowledge within their campus. Instead of relying on unorganized messaging groups or paid courses, students can learn directly from peers, contribute their expertise, and gain recognition through an honor-based reputation system.

---

## Key Features

### Authentication
- Email and password authentication  
- Google Sign-In  
- Secure session handling using Firebase Authentication  

### User Profile System
- Editable user profile including:
  - Name  
  - Branch  
  - Year  
  - About Me  
  - Skills offered and skills wanted  
- Persistent profile data stored in Cloud Firestore  
- Honor score and activity statistics tracking  

### Real-Time Dashboard
- Auto-updating dashboard using Firestore real-time listeners (`onSnapshot`)  
- Displays:
  - Honor score  
  - Students helped  
  - Doubts answered  
  - Sessions hosted  
  - Badges earned  

### Peer Skill Exchange (Planned / In Progress)
- Request skills in exchange for another skill  
- Accept or reject skill exchange requests  
- Track exchange completion status  

### Anonymous Doubt Solving
- Post doubts anonymously  
- Answer doubts from peers  
- Automatic honor score updates based on user contributions  

### Gamification
- Honor score–based reputation system  
- Badges and achievement milestones  
- Contribution-driven growth model  

---

## Tech Stack

### Frontend
- HTML5  
- Tailwind CSS  
- JavaScript (ES Modules)  

### Backend (BaaS)
- Firebase Authentication  
- Firebase Firestore (NoSQL Database)  
- Firestore real-time listeners (`onSnapshot`)  

---

## Architecture Overview

```text
Frontend (HTML / JavaScript)
          ↓
Firebase SDK (CDN)
          ↓
Firebase Authentication
          ↓
Firestore Database

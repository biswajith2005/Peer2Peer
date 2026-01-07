Steps to deploy Firestore rules and host the site (local workspace):

1. Install Firebase CLI:
   - npm install -g firebase-tools
2. Login and select project:
   - firebase login
   - firebase use peer2peer-46ac2
3. Deploy firestore rules and hosting:
   - firebase deploy --only firestore:rules,hosting

Notes:
- `firestore.rules` in the repo contains conservative rules that allow authenticated users to create skills, post queries, create skill requests, and save mock tests. Review carefully before deploying to your production project.
- Adjust the `public` directory in `firebase.json` if you'd prefer a different hosting root.
- After deploy, test the site while logged in; if writes are denied, check the Firebase Console > Firestore Rules and the browser console for detailed error messages.

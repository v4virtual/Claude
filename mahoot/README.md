# Exponent Lab

Exponent-law practice for IB MYP Year 10 Mathematics.

- **Learn**: 8 short visual lessons (product, quotient and power laws, zero and negative exponents, fractional exponents, same base, scientific notation, cheat sheet).
- **Practice**: random quizzes of 10, 15 or 20 questions from 24 question types, each with random numbers. You can pick a level (Mixed, 1–4, 5–6, 7–8). Every answer shows a full step-by-step solution and, for a wrong answer, the most likely mistake. Each quiz has a code (for example `7GK2QX-15M`) that a friend can type in to get exactly the same questions.
- **Battle**: a live classroom game. The host shares a room code, link or QR code. Everyone gets the same question with a timer, and fast, correct answers score the most points. A leaderboard and a podium are shown at the end.

Everything is static HTML and JavaScript, so it runs on GitHub Pages. Battle mode needs a free Firebase project to work across devices. Without one it runs as a demo between tabs in one browser.

## 1. Publish on GitHub Pages

1. Create a new **public** repository on GitHub, for example `exponent-lab`.
2. Upload everything in this folder. Keep the `js/` folder as it is.
3. In the repository go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/exponent-lab/` (in this repo: <https://v4virtual.github.io/Claude/mahoot/>).

Lessons and practice work straight away.

## 2. Switch on online battles (free Firebase project, about 10 minutes)

1. Go to <https://console.firebase.google.com> and click **Create a project**. Google Analytics is not needed.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.** Players do not need accounts. Each browser gets an anonymous ID.
3. **Build → Realtime Database → Create database.** Pick a location close to the school (for example `europe-west1`) and start in **locked mode**.
4. In Realtime Database, open the **Rules** tab, replace everything with the contents of `database.rules.json`, then click **Publish**.
5. Open **Project settings** (gear icon) → **General** → *Your apps* → click the **web** icon `</>`. Register an app (you do not need Firebase Hosting) and copy the `firebaseConfig` object.
6. Open `js/firebase-config.js` and replace `window.FIREBASE_CONFIG = null;` with your config, for example:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "your-project",
     appId: "1:1234567890:web:abc123"
   };
   ```

   Check that `databaseURL` is included. If it is missing, copy it from the top of the Realtime Database *Data* tab.
7. **Authentication → Settings → Authorized domains → Add domain**: `<your-username>.github.io`.
8. Commit the change. Open the site and go to **Battle**. The "Demo mode" note should be gone.

Notes:

- The Firebase web config is not a password. It only identifies your project. Who can read and write is controlled by the rules from step 4.
- The free Spark plan allows 100 simultaneous connections, which is enough for a class.
- A room is deleted when the host clicks **Close room**. Rooms left open can be deleted by hand in the Realtime Database *Data* tab.

## 3. Running a battle

**Host (teacher or student, ideally on the projector):** Battle → *Host a battle* → choose the number of questions, the level and the seconds per question → **Create room**. Players appear as they join. Click **Start battle**.
After each question the host screen shows the answer, how many got it right, the worked solution and the top 5. Click **Next question** to continue. The last screen shows a podium and the full ranking, with **Play again with new questions** for a rematch with the same players.

**Players:** scan the QR code, open the join link, or go to Battle and type the 5-character room code. Then pick a nickname. Work on paper, type the answer and click **Lock in answer** before the timer runs out. After each question players see whether they were right, their points and rank, and the full solution.

**Scoring:** a correct answer scores between 500 and 1000 points. Answering instantly gives 1000, answering at the last second gives 500. A wrong answer or no answer scores 0.

## 4. Privacy

- Practice answers never leave the student's browser.
- In a battle the room stores only the nicknames, scores and submitted answers of the players in that room, and they are deleted when the host closes the room. No email addresses or accounts are used.
- Ask students to use a nickname or first name, not their full name.

## 5. Test it on your computer

Browsers block the Firebase download when the page is opened as a file, so serve the folder instead:

```bash
cd exponent-lab
python3 -m http.server 8000
```

Then open <http://localhost:8000>. To try a battle without Firebase, open the site in two tabs: host in one, join in the other.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page layout, lessons, styles. The "Mr. P" quote is in the *Start here* section. |
| `js/questions.js` | The 24 question generators (random numbers, answers, likely mistakes, worked solutions) and the quiz builder. |
| `js/quizui.js` | Shows a question, checks the answer and writes the feedback. Shared by practice and battle. |
| `js/app.js` | Tabs, lesson widgets, practice quizzes and results. |
| `js/battle-net.js` | Battle networking: Firebase, or the local demo. |
| `js/battle-ui.js` | Battle screens for the host and the players. |
| `js/firebase-config.js` | Your Firebase config (step 2). |
| `database.rules.json` | Security rules to paste into Firebase (step 2.4). |

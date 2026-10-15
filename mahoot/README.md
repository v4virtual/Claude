# Mahoot

Learn, practice and battle your class on IB MYP topics. Live at <https://v4virtual.github.io/Claude/mahoot/>.

On the start page students pick **Year → Subject → Topic**. Each topic has:

- **Learn**: short lessons with worked examples.
- **Practice**: a new random quiz every time. Difficulty, number of questions and an optional timer per question all have ready-made defaults, so **Quick practice** starts in one click. Every answer shows a full worked solution and, for a wrong answer, the most likely mistake. Each quiz has a code (for example `D-7GK2QX-12-3`) that a friend can type in to get exactly the same questions.
- **Battle**: a live, Kahoot-style classroom game. The host shares a room code, link or QR code, and everyone gets the same timed question. Fast, correct answers score the most points. A leaderboard and a podium are shown at the end. **Host a battle** on the start page opens a room straight away with the default settings.

## Topics

| Year | Subject | Topic | What it covers |
| --- | --- | --- | --- |
| 8 | Math | Decimals | Comparing, ordering, adding, subtracting, multiplying, dividing, word problems (moved here from `decimal-quiz/`). Levels Warm-up to Expert. |
| 10 | Math | Exponent laws | 24 question types, 8 visual lessons. Levels Mixed, 1–4, 5–6, 7–8. |
| 10 | Math | Polynomials | Terms, coefficients and degree; naming; like terms; adding and subtracting; distributive property; FOIL, squares and difference of squares. |
| 8 | Science | Genetics and inheritance | DNA, genes and chromosomes; genotype and phenotype; dominant and recessive; homozygous and heterozygous; generated Punnett squares; diploid and haploid; Human Genome Project. |
| 10 | Science | Stoichiometry | Significant figures and measurement; scientific notation and units; moles and Avogadro's number; balancing (64 verified equations); mole ratios and mass-to-mass; limiting reactant; conservation of mass. |
| 8 | I&S | Business, markets and marketing | Needs and wants; goods and services; factors of production; markets; the 7Ps; target customers and value propositions; evaluating a pitch. |
| 8 | English | Science-fiction storytelling | Genre features, world-building, conflict and plot, foreshadowing and suspense, theme and symbol, language and editing, *The Veldt* (themes only, no quoted text). |
| 10 | English | The Hero's Journey | The 12 stages, archetypes, spotting stages in scenarios, myths and modern stories, *The Alchemist* (symbols and plot in our own words), choosing evidence. |
| 8 | Spanish | Present tense and everyday activities | Regular -ar/-er/-ir verbs (typed and multiple choice), agreement, everyday vocabulary, sentence completion, reading notices. |
| 10 | Spanish | Adolescence and daily life | Vocabulary, reflexive and stem-changing verbs, ponerse, reading, replies, correcting mistakes, matching meanings. |

Science, Math and Spanish verb questions are generated with random numbers or words; English, I&S and vocabulary use large banks of original items with shuffled answers. Levels for the new topics: Mixed (default), Core, Stretch, Challenge. Typed Spanish answers accept missing accents with a reminder, and there are buttons for á é í ó ú ñ.

## Games

The **Games** tab plays with the selected topic's questions (difficulty comes from the topic's practice settings).

- **Tower Defense**: colorful blocks with faces follow a sandy path across a grassy map (three maps: Zigzag, Snake, Spiral). Start with $150 and 20 health and buy turrets, then tap one to upgrade it (up to level 3) or sell it:

  | Turret | Cost | What it does |
  | --- | --- | --- |
  | Blaster | $50 | All-rounder |
  | Rapid | $80 | Very fast, weak shots |
  | Frost Tower | $90 | Icy pulse slows every block nearby |
  | Water Cannon | $100 | Lobs water that splashes an area and soaks blocks so they slow down |
  | Cannon | $120 | Slow, hits a whole group |
  | Tesla Coil | $140 | Lightning that jumps between up to 4 blocks |
  | Laser | $150 | Beam that gets stronger the longer it locks on |

  Each round sends more blocks (strength 1–5, about 10% tougher every round). A block that reaches the end costs health equal to its strength; at 0 health the game is over. After each of rounds 1–10 the player answers 1 question, and 3 questions after every later round; each correct answer adds $25 and every answer shows its explanation. Questions are either **Quick math** (ordering numbers, comparing, adding and subtracting, times tables, rounding; harder after rounds 10 and 20) or the **easiest on-the-spot questions from the selected topic**. The best round per topic is saved in the browser.

- **Tag** (2 or more players, played online like a battle): everyone runs around a big park that matches the season (autumn leaves, winter snow and pine trees, spring blossom, summer green). One random player starts as **IT**; touching a runner makes them IT. The player with the **least total time as IT** wins.

  | Who | Key | Ability |
  | --- | --- | --- |
  | Runners | <kbd>Space</kbd> | **Boost**: 10% faster for 10 s, then 10 s to recharge |
  | Runners | <kbd>Q</kbd> | **Invisible** for 5 s, once every 30 s |
  | IT | <kbd>Z</kbd> | **Attraction**: for 3 s every runner is pulled toward IT with heart eyes and can't do anything else. Once a minute |

  IT is always 5% faster but cannot boost or go invisible. A new IT is frozen for 2 s and can't tag back the player who tagged them for 3 s. Every 30 s each runner must answer a question (Quick math or easy questions from the selected topic, with a 5 s warning) and can't move until they answer, so they hide first: inside a bush or under a tree canopy only players right next to you can see you (they see your eyes peeking out). A right answer recharges your boost; a wrong one makes you dizzy for 3 s. Move with WASD or the arrow keys, or drag on the map on phones and tablets.

  One player hosts (Games → Tag → Create room) and shares the room code, link (`#tag-CODE`) or QR code. Before starting, the host chooses the length (2, 3, 5 or 8 minutes), 0–6 bots and their level (Easy, Normal, Hard), the questions and the season (Auto follows the calendar). At least 2 players are needed, and bots count, so you can play the host against bots. The host's browser acts as the referee: it runs the bots and the clock, picks IT and checks every tag, so the host should keep the game open until the end. Tag rooms are stored under `tag/` in the Realtime Database and need the rules from `database.rules.json`.

More game modes can be added as new files next to `js/game-td.js` and a card in `js/games.js`.

### Adding a topic

Each topic is one self-contained file in `js/topics/` that calls `registerTopic({...})` with its year, subject, levels, defaults, lessons, intro and question generators, using the helpers in `js/topic-kit.js`. Add its `<script>` line to `index.html` (after `js/topic-kit.js`, before `js/app.js`). A new year or subject appears in the picker automatically. See [`TOPIC_GUIDE.md`](TOPIC_GUIDE.md) for the question shapes, CSS classes and content rules.

## 1. Publish on GitHub Pages

1. Create a new **public** repository on GitHub, for example `exponent-lab`.
2. Upload everything in this folder. Keep the `js/` folder as it is.
3. In the repository go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/exponent-lab/`.

Lessons and practice work straight away. Battles need step 2.

## 2. Switch on online battles (free Firebase project, about 10 minutes)

1. Go to <https://console.firebase.google.com> and click **Create a project**. Google Analytics is not needed.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.** Players do not need accounts. Each browser gets an anonymous ID.
3. **Build → Realtime Database → Create database.** Pick a location close to the school (for example `europe-west1`) and start in **locked mode**.
4. In Realtime Database, open the **Rules** tab, replace everything with the contents of `database.rules.json`, then click **Publish**. Do this again whenever `database.rules.json` changes (Tag added a `tag` section; without it, creating a Tag room fails with PERMISSION_DENIED).
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
- A room is deleted when the host clicks **Close room**. Rooms left open can be deleted by hand in the Realtime Database *Data* tab (battles under `rooms`, Tag games under `tag`).
- In Tag each player sends their position about 10 times a second while moving, which is fine for a class on the free plan.

## 3. Running a battle

**Host (teacher or student, ideally on the projector):** on the start page pick the topic and click **Host a battle** (default settings), or go to Battle → *Host a battle* to choose the topic, difficulty, number of questions and seconds per question → **Create room**. Players appear as they join. Click **Start battle**.
After each question the host screen shows the answer, how many got it right, the worked solution and the top 5. Click **Next question** to continue. The last screen shows a podium and the full ranking, with **Play again with new questions** for a rematch with the same players.

**Players:** scan the QR code, open the join link, or go to Battle and type the 5-character room code. Then pick a nickname. Work on paper, type the answer and click **Lock in answer** before the timer runs out. After each question players see whether they were right, their points and rank, and the full solution.

**Scoring:** a correct answer scores between 500 and 1000 points. Answering instantly gives 1000, answering at the last second gives 500. A wrong answer or no answer scores 0.

## 4. Privacy

- Practice answers never leave the student's browser.
- In a battle the room stores only the nicknames, scores and submitted answers of the players in that room, and they are deleted when the host closes the room. A Tag room stores nicknames, colors, positions and question counts in the same way. No email addresses or accounts are used.
- Ask students to use a nickname or first name, not their full name.

## 5. Test it on your computer

Browsers block the Firebase download when the page is opened as a file, so serve the folder instead:

```bash
cd mahoot
python3 -m http.server 8000
```

Then open <http://localhost:8000>. To try a battle without Firebase, open the site in two tabs: host in one, join in the other.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page layout, topic intros, lessons, styles. The "Mr. P" quote is on the Start page. |
| `js/questions.js` | Exponent laws: the 24 question generators and the seeded random number source shared by all topics. |
| `js/topic-decimals.js` | Decimals: the question engine from the former decimal quiz, seeded. |
| `js/topics.js` | Topic registry (year, subject, levels, defaults) and quiz codes. |
| `js/topic-kit.js` | Helpers for writing topics (multiple choice, typed answers, ordering, boxes, seeded quiz builder). |
| `js/topics/*.js` | One file per topic added since: stoichiometry, polynomials, genetics, business, heros-journey, scifi, spanish-present, spanish-adolescence. |
| `js/game-td.js`, `js/games.js` | Tower Defense game logic, and the Games tab (drawing, shop, question breaks). |
| `js/game-tag.js`, `js/game-tag-ui.js` | Tag: the seasonal park, movement, bots and drawing; and the Tag screens (lobby, controls, questions, referee, results). |
| `js/topics/quick-math.js` | Quick mental-math questions used by games (hidden from the topic picker). |
| `TOPIC_GUIDE.md` | How to write a new topic. |
| `tools/validate-topics.js` | Checks every topic: `node tools/validate-topics.js`. Not loaded by the site. |
| `js/quizui.js` | Shows a question, checks the answer and writes the feedback. Shared by every topic, practice and battle. |
| `js/app.js` | Topic picker, tabs, lessons, practice quizzes with optional timer, results. |
| `js/battle-net.js` | Networking for battles and Tag: Firebase, or the local demo. |
| `js/battle-ui.js` | Battle screens for the host and the players. |
| `js/firebase-config.js` | Your Firebase config (step 2). |
| `database.rules.json` | Security rules to paste into Firebase (step 2.4). |

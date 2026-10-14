/* ===== Topic: Year 10 English, The Hero's Journey ===== */
(() => {
  /* ---------- shared helpers ---------- */
  const box = s => `<div class="quotebox">${s}</div>`;
  /* Bank item -> multiple choice. o: { x scenario, p prompt, a correct, w [[wrong, fb]...], why, key, hint } */
  const Q = (o, d) => {
    d = d || {};
    const q = {
      promptHtml:o.p || d.p,
      options:[{ html:o.a, correct:true }].concat(o.w.map(([h, f]) => ({ html:h, fb:f }))),
      workHtml:"<p>" + (o.why || d.why) + "</p>",
      key:o.key || d.key,
      hint:o.hint || d.hint
    };
    if (o.x) q.exprHtml = box(o.x);
    return Kit.mc(q);
  };

  /* ---------- the 12 stages ---------- */
  const ST = {
    ow:   { i:0,  n:"Ordinary World", act:"Departure",
            p:"Shows the hero's everyday life and what is missing from it, so the reader can measure the change later.",
            miss:"The Ordinary World is everyday life before anything disrupts it. This moment is not routine life." },
    call: { i:1,  n:"Call to Adventure", act:"Departure",
            p:"Disrupts normal life with a problem, message or opportunity that sets the quest in motion.",
            miss:"A Call to Adventure is the message or event that starts the quest. Nothing new is starting the quest here." },
    ref:  { i:2,  n:"Refusal of the Call", act:"Departure",
            p:"Shows the hero's fear or doubt, which makes the risk feel real and the hero easier to relate to.",
            miss:"Refusal of the Call needs the hero to hesitate, make excuses or say no. There is no reluctance here." },
    men:  { i:3,  n:"Meeting the Mentor", act:"Departure",
            p:"Gives the hero advice, training, a gift or the confidence needed to begin.",
            miss:"Meeting the Mentor needs a wiser guide who gives advice, training or a gift. No one plays that role here." },
    thr:  { i:4,  n:"Crossing the Threshold", act:"Departure",
            p:"Marks the point of no return, as the hero commits and enters the unfamiliar world.",
            miss:"Crossing the Threshold is the moment the hero first leaves the familiar world behind. That is not what happens here." },
    tests:{ i:5,  n:"Tests, Allies and Enemies", act:"Initiation",
            p:"Lets the hero learn the rules of the new world and find out who to trust.",
            miss:"Tests, Allies and Enemies are the early challenges and new relationships in the new world. This moment is not one of them." },
    app:  { i:6,  n:"Approach to the Inmost Cave", act:"Initiation",
            p:"Builds tension as the hero prepares for and moves toward the most dangerous place.",
            miss:"The Approach is the tense build-up just before the biggest danger. This moment is not that build-up." },
    ord:  { i:7,  n:"The Ordeal", act:"Initiation",
            p:"Puts the hero through the central crisis, a brush with death or total failure.",
            miss:"The Ordeal is the central life-or-death crisis. Nothing here is that low point." },
    rew:  { i:8,  n:"Reward (Seizing the Sword)", act:"Initiation",
            p:"Lets the hero claim the prize, knowledge or power won by surviving the ordeal.",
            miss:"The Reward is claiming a prize after surviving the ordeal. No prize is being won here." },
    road: { i:9,  n:"The Road Back", act:"Return",
            p:"Turns the hero toward home, often with a chase or a new danger that raises the stakes.",
            miss:"The Road Back is the hero heading home with the prize, often chased. The hero is not heading home here." },
    res:  { i:10, n:"Resurrection", act:"Return",
            p:"Tests the hero one final time at the climax, proving that the hero has truly changed.",
            miss:"Resurrection is the final test at the climax that proves the hero has changed. This is not that last test." },
    ret:  { i:11, n:"Return with the Elixir", act:"Return",
            p:"Brings the hero home changed, with something that helps or heals the ordinary world.",
            miss:"Return with the Elixir is coming home changed with something to share. The journey is not over here." }
  };
  const SK = Object.keys(ST);                       // in story order
  /* stages too close to use as random distractors */
  const CONF = { ow:["call","ret"], call:["ow","ref","men"], ref:["call","ow"], men:["call","thr"], thr:["call","tests","road"],
    tests:["thr","app","ord"], app:["tests","ord"], ord:["tests","app","res","rew"], rew:["ord","road","ret"],
    road:["rew","res","thr"], res:["ord","road","ret"], ret:["rew","ow","res"] };
  const ACTS = { Departure:"Departure (the hero leaves the known world: stages 1–5)",
    Initiation:"Initiation (the hero is tested in the special world: stages 6–9)",
    Return:"Return (the hero comes back changed: stages 10–12)" };

  function stageOptions(correct, near, n){
    const avoid = new Set([correct].concat(CONF[correct] || []));
    if (near) avoid.add(near[0]);
    const pool = shuffle(SK.filter(k => !avoid.has(k)));
    const opts = [{ html:ST[correct].n, correct:true }];
    if (near) opts.push({ html:ST[near[0]].n, fb:near[1] });
    for (const k of pool) { if (opts.length >= n) break; opts.push({ html:ST[k].n, fb:ST[k].miss }); }
    return opts;
  }

  /* ---------- scenario bank: [stage, scenario, clue, near?] ---------- */
  const SCEN1 = [
    ["ow", "Every morning, Ravi feeds the goats on his family's mountain farm, walks two hours to school and dreams of seeing the sea. Nothing in his village ever seems to change.", "Daily routine, a quiet longing, and nothing has happened yet."],
    ["ow", "On Station Kepler-9, Zoe repairs air filters on the night shift. She eats the same ration bar every day and has never seen a planet up close.", "Same job, same food, a small world: this is the life the adventure will interrupt."],
    ["call", "A sealed letter arrives for Sam: the king is ill, and only someone born on the night of the red moon can fetch the cure from the far mountains. Sam was born on that night.", "A message arrives that points straight at the hero and sets up the quest."],
    ["call", "During a routine shift, Zoe's radio picks up a distress signal from a ship that was declared lost twenty years ago.", "Something new breaks into ordinary life and demands action."],
    ["ref", "Sam reads the letter twice, then drops it in the fire. 'I am a baker's apprentice, not a hero,' he mutters. 'Someone else can go.'", "He burns the letter and says no: open reluctance."],
    ["ref", "Zoe reports the signal to her captain but begs not to be sent: 'I have never flown outside the station. Send a real pilot.'", "She asks not to go because she doubts herself."],
    ["men", "An old woman who once guarded the mountain pass teaches Sam to read the stars and gives him her compass. 'Trust it when you cannot trust your eyes,' she says.", "An experienced guide passes on a skill, a gift and advice."],
    ["men", "A retired pilot spends three nights training Zoe in the flight simulator, showing her how to land in zero gravity.", "Training from someone who has done it before is the mentor's job."],
    ["thr", "Sam walks past the last farmhouse and through the stone arch that marks the edge of the kingdom. Behind him, the gate guards close the doors.", "He leaves the known world and the doors close behind him: no going back."],
    ["thr", "Zoe's shuttle detaches from the station. She watches the docking lights shrink until they disappear, and there is not enough fuel to turn back.", "The familiar world disappears and turning back is impossible."],
    ["tests", "On the road, Sam must solve a riddle to cross a bridge, outrun a pack of wolves and share his bread with a wary girl who becomes his traveling companion.", "Several smaller challenges plus a new friend: he is learning the new world."],
    ["tests", "On the derelict ship, Zoe learns to read the strange control panels, makes friends with the repair robot and is attacked by a security drone.", "Learning the rules, gaining an ally and meeting an enemy."],
    ["app", "Sam and his companion reach the foot of the dragon's mountain. They study the cave entrance, sharpen their weapons and agree on a signal if things go wrong.", "Preparing and planning right before entering the most dangerous place."],
    ["app", "Zoe floats toward the sealed engine room, where the distress signal came from. She checks her oxygen gauge and rehearses the door codes one more time.", "Moving toward the danger and getting ready, but not yet facing it."],
    ["ord", "Inside the cave, the dragon pins Sam against the rock. His sword is broken and his companion is unconscious. He is certain he is about to die.", "The hero faces death in the most dangerous place: the central crisis."],
    ["ord", "The engine room seal fails and Zoe is thrown into the vacuum, her suit cracked and her oxygen alarm screaming.", "A brush with death at the heart of the danger."],
    ["rew", "Sam wakes beside the defeated dragon and finds the healing flower growing from the cave floor. He picks it carefully and wraps it in his cloak.", "Having survived, he claims the prize he came for."],
    ["rew", "Back inside the ship, Zoe downloads the lost crew's star map. It shows a safe route home that no one has known for twenty years.", "Surviving the crisis earns her valuable knowledge."],
    ["road", "With the flower in his cloak, Sam starts the long walk home, but the dragon's riders are following his tracks through the snow.", "Heading home with the prize, and being chased."],
    ["road", "Zoe sets course for home, but the ship's damaged engine is leaking and a meteor storm lies between her and the station.", "Turning toward home while new dangers raise the stakes."],
    ["res", "At the kingdom's gate, the dragon's master blocks Sam's way for one last duel. Using everything the old woman taught him, Sam wins and walks through, no longer afraid.", "One final test at the climax, won by using what he has learned."],
    ["res", "As the station comes into view, the ship's engine dies. Zoe steers through the docking bay by hand, using every skill she has learned, with seconds to spare.", "The last test proves how much she has changed since she begged not to go."],
    ["ret", "Sam arrives home and gives the healing flower to the king. He goes back to the bakery, but now the villagers come to him for advice.", "He is home, changed, and what he brings helps everyone."],
    ["ret", "Zoe shares the star map with the station council. For the first time in twenty years, ships can travel safely, and the people who once ignored her now ask for her help.", "She brings back something that improves life for her whole community."]
  ];
  const SCEN2 = [
    ["ow", "Mia is the reserve goalkeeper for her school team. She sits on the bench every match, cheering loudly but secretly sure she is not good enough to play.", "We see her normal life and her inner flaw (self-doubt) before anything changes."],
    ["ow", "Leo helps at his grandmother's bakery after school. He is good at fixing the old ovens, though he never tells anyone how much he misses his father, who left years ago.", "Everyday life plus a hidden wound the story will later heal."],
    ["call", "The coach pins up a notice: trials for the national under-16 team are next month, and each school may send one player. Mia's friends turn to look at her.", "An opportunity appears that could pull her out of her normal life."],
    ["call", "While clearing out the attic, Leo finds an old phone with one unread message from his missing father: 'If you get this, come to the lighthouse.'", "A message invites the hero to begin a journey."],
    ["ref", "Mia tells her coach she has a dentist appointment on the day of the trials. She does not have a dentist appointment.", "She makes an excuse to avoid the challenge."],
    ["ref", "Leo deletes the message. If his father wanted to see him, he tells himself, he would have come home years ago.", "He pushes the call away out of hurt and fear."],
    ["men", "The school caretaker, who once played professionally, stays late to practice penalties with Mia and tells her that every keeper is scared before a big game.", "An experienced figure trains her and gives her confidence."],
    ["men", "Leo's grandmother finally tells him the truth about his father and hands him the lighthouse key she has kept for ten years.", "Wise advice and a useful gift from an older figure."],
    ["thr", "Mia walks out of the tunnel into a stadium full of strangers in national team colors. Her school jersey is folded in her bag.", "She has left her familiar world (school) and stepped into a new one."],
    ["thr", "Leo steps off the last bus of the night in a coastal town he has never visited. The bus pulls away before he can change his mind.", "He enters an unfamiliar place and the way back closes behind him."],
    ["tests", "At training camp, Mia struggles with the faster pace, makes a friend in the striker Kai and clashes with Jo, the first-choice goalkeeper who wants her gone.", "Challenges, an ally and an enemy in the new world."],
    ["tests", "In the coastal town, Leo works out which locals will talk about his father, earns a fisherman's trust and is warned off by a man who owns the lighthouse land.", "He learns the rules, gains an ally and meets an enemy."],
    ["app", "The night before the final, Mia watches videos of the other team's penalty takers and writes notes on where each one aims. She cannot sleep.", "Preparing for the biggest challenge, with tension rising."],
    ["app", "Leo and the fisherman row out to the lighthouse at dusk. They tie the boat below the rocks and begin climbing the slippery stairs in silence.", "Creeping toward the most dangerous place."],
    ["ord", "In the semi-final, Mia lets in four goals and crashes into a post. Lying on the grass with her vision blurred, she hears the crowd chanting Jo's name and believes her dream is over.", "Total failure and a sense of 'death' of her dream: the central crisis."],
    ["ord", "At the top of the lighthouse, the land owner locks Leo inside the lamp room as a storm hits. The glass cracks, water pours in, and no one knows where he is.", "Trapped and in mortal danger in the most dangerous place."],
    ["rew", "Her team scrapes through the semi-final on goal difference. Watching the replay with the caretaker, Mia finally sees her mistake and learns to read a striker's body before the kick.", "Surviving the crisis gives her new knowledge: her prize."],
    ["rew", "When the storm passes, Leo finds a box hidden behind the lamp: letters his father wrote to him every year but never sent.", "After the crisis, he claims what he came for: the truth."],
    ["road", "After finding the hidden spring, the stranded hikers start the three-day trek back to the road, rationing every sip as a dust storm gathers behind them.", "Heading back with the prize while a new danger chases them."],
    ["road", "Leo starts rowing back to the harbor with the box of letters, but the land owner's motorboat is following him through the waves.", "Returning home with the prize, pursued."],
    ["res", "In the final, the game goes to penalties. Mia remembers the replay, reads the last striker's body and dives the right way. She saves it, and her team wins.", "The final test at the climax, passed by using what she learned."],
    ["res", "Back at the harbor, the land owner demands the letters. Leo, once too timid to speak up in class, refuses calmly in front of the whole town.", "A last confrontation that proves how much he has changed."],
    ["ret", "Back at school, Mia starts a goalkeeping club for younger students, teaching them that it is fine to feel scared before a big game.", "She shares what she gained with her community."],
    ["ret", "Leo returns to the bakery and reads one of his father's letters aloud to his grandmother. For the first time in years, they talk about him without anger.", "He brings back something that heals his family."]
  ];
  const SCEN3 = [
    ["ow", "Ana sweeps the floor of her uncle's repair shop in a dusty desert town, as she does every day. She keeps a hand-drawn map of the stars under her mattress and studies it each night.",
      "Her routine and her longing are shown before anything disrupts them.",
      ["call", "The map is a dream she already has, not a new message or event. A Call needs something to happen that disrupts her routine."]],
    ["call", "A stranger in a gray coat stops Ravi at the market and tells him the river spirits have chosen him to stop the coming flood. Before Ravi can answer, the stranger vanishes into the crowd.",
      "A messenger (a herald) delivers the news that starts the quest.",
      ["men", "The stranger brings the message but gives no training, advice or gift. Delivering the news is the herald's job, which marks the Call."]],
    ["ref", "Ravi tells his mother about the stranger, then goes back to herding goats as if nothing had happened. That night he lies awake, listening to the river rise.",
      "He has heard the Call and is choosing to ignore it.",
      ["ow", "Herding goats looks like everyday life, but he has already received the Call. Pretending nothing happened is a refusal, not his normal world."]],
    ["men", "Before Ravi leaves, he visits a blind ferryman who has crossed the river for sixty years. The ferryman teaches him to hear the water's moods and warns him never to cross at night.",
      "An older, wiser figure passes on knowledge and a warning.",
      ["tests", "An ally travels with the hero as an equal, and Tests happen in the new world. Ravi has not left yet, and the ferryman is a teacher, so this is the Mentor."]],
    ["thr", "Ravi pays the ferryman a coin and climbs into the boat. As it leaves the bank, he hears the village bells ring behind him for the last time.",
      "He leaves the familiar world and commits to the journey.",
      ["road", "The Road Back also involves a crossing, but it comes late, when the hero heads home. Ravi is leaving home to begin the adventure."]],
    ["tests", "Ravi's first week in the city is hard: a merchant cheats him, he gets lost in the flooded alleys, and he finally finds a street gang willing to share their shelter.",
      "Several smaller setbacks and a new group of allies while he learns the new world.",
      ["ord", "These setbacks are real, but they are smaller challenges. The Ordeal is one single, central crisis: a brush with death or total defeat."]],
    ["app", "Ravi and the gang slip into the abandoned dam tunnels, where the floodgates are controlled. Every step echoes. They pass warning signs and the bones of animals that wandered in.",
      "They are moving toward the danger, and dread is building.",
      ["ord", "They are approaching the danger, not yet facing it. The rising dread before the central crisis is the Approach."]],
    ["ord", "Deep in the dam tunnels, the floodgate jams and water roars in. Ravi is dragged under and, for a long moment, everything goes black.",
      "A brush with death inside the most dangerous place: the central crisis.",
      ["tests", "This is far bigger than an early test. Nearly drowning in the most dangerous place is the central crisis, the Ordeal."]],
    ["rew", "When the water drains, Ravi wakes on the tunnel floor holding the rusted key that opens the master floodgate. He also knows, now, that he can survive the river.",
      "Having survived the crisis, he gains a prize (the key) and new self-belief.",
      ["ret", "He has won the key, but he is still deep in the tunnels. The Elixir is brought home at the end and shared with the ordinary world."]],
    ["road", "With the key in hand, Ravi races back up through the tunnels toward the city, the water rising behind him and the gang leader shouting that they will not make it.",
      "He has the prize and is heading back, chased by danger.",
      ["thr", "Crossing the Threshold happens early, when the hero first enters the unknown. Here Ravi already has the prize and is heading back."]],
    ["res", "At the master floodgate, the gang leader turns on Ravi and grabs the key. Ravi, who once ran from every fight, stands firm, wins the key back and opens the gate just before the city floods.",
      "The final clash at the climax proves how much he has changed.",
      ["ord", "This is a life-or-death clash, but it is the final one, and it shows how much Ravi has changed. That proof of change at the climax is the Resurrection."]],
    ["ret", "The flood passes the city by. Ravi returns to his village with his knowledge of the river's moods and teaches the farmers when it is safe to plant.",
      "He is home, changed, sharing what he gained.",
      ["rew", "Reward is when the prize is first won, right after the ordeal. Here Ravi is home and sharing what he gained, which is the Elixir."]]
  ];
  function scenQ(item){
    const [st, x, clue, near] = item;
    const options = stageOptions(st, near, 4);
    return Kit.mc({
      promptHtml:"Which stage of the Hero's Journey does this moment show?",
      exprHtml:box(x), options,
      workHtml:`<p><b>${ST[st].n}</b>: ${ST[st].p}</p><p>Clue: ${clue}</p>`,
      key:"Name the stage by what the moment does for the journey, not by what it looks like.",
      hint:"Ask: is the hero at home, in the new world, or heading back? And what is at stake?"
    });
  }

  /* ---------- archetypes ---------- */
  const AR = {
    hero:  { n:"Hero", d:"The central character who leaves the known world, grows and makes sacrifices.",
             miss:"The hero is the central character whose journey we follow. This character is not the one on the journey." },
    mentor:{ n:"Mentor", d:"A wiser guide who trains, advises, protects or gives the hero a gift.",
             miss:"A mentor is a wiser guide who teaches or gives gifts. This character does not guide the hero." },
    tg:    { n:"Threshold guardian", d:"A figure who blocks the way at a key point and tests whether the hero is worthy to pass.",
             miss:"A threshold guardian blocks a doorway or path to test the hero. This character is not guarding a crossing." },
    herald:{ n:"Herald", d:"A messenger who announces a change and brings the Call to Adventure.",
             miss:"A herald brings news that starts the adventure. This character is not delivering a call." },
    shadow:{ n:"Shadow", d:"The main villain or dark force that the hero must finally defeat; it can also be the hero's inner darkness.",
             miss:"The shadow is the story's main dark force, the one the hero must finally defeat. This character is not that." },
    ally:  { n:"Ally", d:"A companion who travels with the hero and helps, supports or fights beside them.",
             miss:"An ally is a loyal companion who helps along the way. This character is not a steady helper." },
    trick: { n:"Trickster", d:"A mischief-maker who brings humor or chaos and questions the rules.",
             miss:"A trickster causes mischief and comic chaos. This character is not playing pranks or mocking the rules." },
    shape: { n:"Shapeshifter", d:"A character whose loyalty or nature keeps changing, so the hero cannot be sure whose side they are on.",
             miss:"A shapeshifter's loyalty keeps changing. This character's loyalty is not in question." }
  };
  const AK = Object.keys(AR);
  const ACONF = { hero:[], mentor:["herald","ally"], tg:["shadow"], herald:["mentor"], shadow:["tg","shape"],
    ally:["trick","mentor"], trick:["ally","shape"], shape:["trick","shadow"] };
  function archOptions(correct, n){
    const avoid = new Set([correct].concat(ACONF[correct]));
    const opts = [{ html:AR[correct].n, correct:true }];
    for (const k of shuffle(AK.filter(k => !avoid.has(k)))) { if (opts.length >= n) break; opts.push({ html:AR[k].n, fb:AR[k].miss }); }
    return opts;
  }
  const ARCH1 = [
    ["hero", "Kofi, a shy fisherman's son, is the one who sets out to find the stolen river stone. By the end, he has learned to lead others.", "The story follows his journey and his growth."],
    ["hero", "The story follows Dara, a teenage coder who must stop a rogue computer program. We see everything through her choices, her mistakes and her growth.", "She is the central character who changes."],
    ["hero", "Marisol, the youngest of five sisters, volunteers to cross the frozen sea when nobody else will. Her courage is tested at every step.", "She takes on the quest and is tested."],
    ["mentor", "An elderly beekeeper teaches the young hero to stay calm under pressure and gives her a silver whistle before she leaves.", "Teaching plus a gift: a mentor."],
    ["mentor", "A former champion, now a quiet gym owner, trains the boxer at dawn and tells her that a fight is won in the head first.", "Training and advice from experience."],
    ["mentor", "Grandma Ines once traveled the same mountain road. She draws the hero a map and tells her which paths to avoid.", "Experience passed on as guidance and a gift."],
    ["herald", "A wounded messenger staggers into the village square and gasps that the northern towers have fallen.", "He brings the news that starts the adventure."],
    ["herald", "A talking crow lands on the windowsill and tells the girl that the forest queen has summoned her.", "The crow delivers the call."],
    ["herald", "A nervous assistant rushes into the lab with news: the satellite has picked up a signal that should be impossible.", "The news disrupts normal life and sets the story moving."],
    ["shadow", "The Iron Duke wants to drain the lake to power his war machines and will destroy anyone who stands in his way. Defeating him is the goal of the whole story.", "The main villain the hero must defeat."],
    ["shadow", "The sorceress who cursed the hero's family waits at the heart of the castle. Every step of the quest leads toward the final battle with her.", "The central dark force at the end of the quest."],
    ["ally", "Tomas, the hero's loyal friend, carries the supplies, keeps watch at night and never leaves her side.", "A steady, loyal companion."],
    ["ally", "The ship's engineer repairs the hero's damaged suit and fights beside him when pirates board.", "Practical help and fighting side by side."],
    ["ally", "A stray dog follows the boy across the desert, finding water and warning him about snakes.", "A loyal helper on the journey."]
  ];
  const ARCH2 = [
    ["tg", "A troll sits on the only bridge out of the valley and lets no one pass unless they answer three questions.", "He guards a crossing point and tests the hero."],
    ["tg", "A strict border officer refuses to stamp the hero's papers until she can prove she has a good reason to enter the city.", "A gatekeeper who must be convinced before the hero can pass."],
    ["tg", "A robot sentry guards the airlock and scans every traveler. It lets through only those who know the old password.", "It blocks a doorway and tests whoever wants to pass."],
    ["tg", "The hero's older brother stands in the doorway and refuses to let her leave home for the competition until she proves she is serious.", "He blocks the way out at a key moment and tests her commitment."],
    ["trick", "A fox who loves pranks steals the king's crown just to watch the guards panic, and his jokes make even the hero laugh.", "Mischief and humor for their own sake."],
    ["trick", "A chatty street performer keeps mocking the serious knights, pointing out how silly their rules are, and causes chaos at the feast.", "Humor that questions the rules."],
    ["trick", "A mischievous robot reprograms the ship's kitchen to serve only pudding, then asks the crew why rules matter anyway.", "Comic chaos and questioning the rules."],
    ["shape", "The charming stranger helps the hero escape the city, then hands her to the guards, then helps her escape again. No one can tell whose side he is on.", "Changing loyalty is the mark of a shapeshifter."],
    ["shape", "A new teammate seems friendly but is secretly reporting the team's plans to the rival school. Later, she changes sides again and warns them.", "Her loyalty keeps shifting."],
    ["shape", "The captain's second-in-command is loyal one day and plotting mutiny the next, and the crew never knows which version will appear.", "Unclear, changing loyalty."],
    ["mentor", "A wise computer in the ship's library answers the cadet's questions, teaches him to navigate by the stars and urges him to trust his instincts.", "A non-human guide can still be a mentor: it teaches and advises."],
    ["shadow", "Deep in the network lives a program that wants to control every city's power grid. Everything the heroes do is aimed at stopping it, and the story ends with their final battle against it.", "A non-human dark force can still be the shadow."],
    ["ally", "A girl the hero rescued from wolves joins the journey and turns out to be a brilliant tracker who saves the group more than once.", "She becomes a loyal helper."],
    ["herald", "A coach's assistant hands the swimmer an envelope: she has been chosen for the national team trials.", "The envelope brings the Call."]
  ];
  function archQ(item){
    const [k, x, clue] = item;
    return Kit.mc({
      promptHtml:"Which archetype does this character best fit?",
      exprHtml:box(x), options:archOptions(k, 4),
      workHtml:`<p><b>${AR[k].n}</b>: ${AR[k].d}</p><p>Clue: ${clue}</p>`,
      key:"An archetype is a job in the story: judge the character by what they do for the hero.",
      hint:"What does this character do to or for the hero?"
    });
  }

  /* ---------- myths and modern stories ---------- */
  const MYTH2 = [
    { x:"In the Greek myth, the goddess Athena repeatedly guides Odysseus on his long journey home, giving him advice and disguising him when he finally reaches Ithaca.",
      p:"Which archetype does Athena fit here?", a:"Mentor",
      w:[["Shadow", "A shadow opposes the hero. Athena works to bring Odysseus home."],
         ["Trickster", "A trickster causes mischief for its own sake. Athena's help has a clear purpose."],
         ["Threshold guardian", "A threshold guardian blocks the way. Athena clears the way."]],
      why:"Athena advises, protects and equips Odysseus, which is the mentor's job. The word mentor comes from this myth: Athena takes the form of an old friend named Mentor to guide Odysseus's son." },
    { x:"Gilgamesh, the proud king of Uruk, gains a wild man named Enkidu as his closest friend. The two fight side by side against the monster Humbaba.",
      p:"Which archetype does Enkidu fit?", a:"Ally",
      w:[["Mentor", "Enkidu is an equal companion, not an older, wiser teacher."],
         ["Herald", "A herald brings news of the adventure. Enkidu joins the adventure."],
         ["Shadow", "Enkidu fights with Gilgamesh, not against him."]],
      why:"Enkidu travels and fights beside the hero as an equal friend. That makes him an ally." },
    { x:"Humbaba is the monster who guards the Cedar Forest. Gilgamesh and Enkidu must defeat him before they can enter it.",
      p:"Which archetype does Humbaba fit best?", a:"Threshold guardian",
      w:[["Mentor", "Humbaba teaches the heroes nothing; he tries to stop them."],
         ["Ally", "Humbaba fights against the heroes, not with them."],
         ["Herald", "Humbaba does not bring news of the adventure; he blocks it."]],
      why:"Humbaba stands at the entrance to a new world (the forest) and must be overcome before the heroes can pass. That is a threshold guardian." },
    { x:"Theseus enters the dark, twisting Labyrinth, unwinding a ball of thread behind him as he moves deeper toward the Minotaur's lair.",
      p:"Which stage of the Hero's Journey does this moment show?", a:"Approach to the Inmost Cave",
      w:[["Ordinary World", "Theseus is far from home, inside the most dangerous place."],
         ["Return with the Elixir", "He has not faced the monster yet, so nothing has been won or brought home."],
         ["Refusal of the Call", "Theseus volunteered for this quest. There is no hesitation here."]],
      why:"He is moving toward the most dangerous place, where the central crisis waits. That tense build-up is the Approach to the Inmost Cave." },
    { x:"In the center of the Labyrinth, Theseus fights the Minotaur in the dark. If he loses, he and the other young Athenians will die.",
      p:"Which stage of the Hero's Journey does this moment show?", a:"The Ordeal",
      w:[["Call to Adventure", "The quest began long before this. This is its central crisis."],
         ["Meeting the Mentor", "No guide is present; Theseus faces the monster alone."],
         ["Return with the Elixir", "He has not won anything yet; his life is on the line."]],
      why:"A life-or-death battle in the most dangerous place is the central crisis of the journey: the Ordeal." },
    { x:"Before Theseus enters the Labyrinth, Ariadne, the daughter of the king of Crete, gives him a ball of thread so that he can find his way back out.",
      p:"What job does the ball of thread do in the story?", a:"It is a gift from a helper that lets the hero survive the inmost cave and find his way back.",
      w:[["It is the prize Theseus set out to win.", "Theseus came to kill the Minotaur; the thread is a tool, not the prize."],
         ["It shows Theseus's ordinary life at home.", "The thread is given in Crete, far from home."],
         ["It is the message that calls Theseus to adventure.", "Theseus had already chosen the quest before he received it."]],
      why:"Helpers often give the hero a gift that is needed later. The thread lets Theseus escape the maze after the Ordeal." },
    { x:"King Polydectes wants Perseus out of the way, so he orders him to bring back the head of the Gorgon Medusa, a task no one is expected to survive.",
      p:"Which stage does the king's demand begin?", a:"Call to Adventure",
      w:[["Reward (Seizing the Sword)", "Nothing has been won yet; the quest is only being set."],
         ["Resurrection", "Resurrection is the final test at the end, not the start."],
         ["The Road Back", "Perseus has not even left yet, so he cannot be heading home."]],
      why:"The king's order disrupts Perseus's life and sets up the quest, which is the Call to Adventure." },
    { x:"The gods Athena and Hermes help Perseus prepare for his quest, and he receives magical gifts, including a polished shield that he can use as a mirror.",
      p:"Which stage of the Hero's Journey does this show?", a:"Meeting the Mentor",
      w:[["Refusal of the Call", "Perseus is preparing to go, not trying to avoid the quest."],
         ["The Road Back", "He has not faced Medusa yet, so he is not heading home."],
         ["Ordinary World", "Divine help and magic gifts are not part of his everyday life."]],
      why:"Wiser figures give the hero advice and gifts before the main danger. That is Meeting the Mentor." },
    { x:"Perseus cuts off Medusa's head while looking only at her reflection in his shield, because looking straight at her would turn him to stone.",
      p:"Which stage of the Hero's Journey does this show?", a:"The Ordeal",
      w:[["Call to Adventure", "The quest was set earlier. This is the moment it was all leading to."],
         ["Refusal of the Call", "Perseus is acting bravely, not holding back."],
         ["Return with the Elixir", "He is still in danger and far from home."]],
      why:"Facing a monster whose gaze means death is the central life-or-death crisis: the Ordeal." },
    { x:"Polydectes sent Perseus away hoping he would die. When Perseus returns, he uses Medusa's head to turn the king to stone and free his mother.",
      p:"Which archetype does King Polydectes fit best?", a:"Shadow",
      w:[["Mentor", "Polydectes wants Perseus dead, not trained or helped."],
         ["Ally", "Polydectes works against Perseus throughout the story."],
         ["Trickster", "There is nothing comic or playful about the king. He is a dangerous enemy."]],
      why:"Polydectes is the villain the hero finally defeats, so he fits the shadow." },
    { x:"On his journey home, Odysseus and his crew are trapped in the cave of the one-eyed giant Polyphemus. Odysseus blinds the giant and escapes by clinging to the bellies of sheep.",
      p:"In the long story of Odysseus's journey home, which stage does this adventure belong to?", a:"Tests, Allies and Enemies",
      w:[["Ordinary World", "This is a dangerous episode far from home, not everyday life."],
         ["Meeting the Mentor", "Polyphemus is an enemy, not a guide."],
         ["Refusal of the Call", "Odysseus is not avoiding the journey; he is surviving it."]],
      why:"The Cyclops is one of many dangers and enemies Odysseus meets on the way home. These episodes are tests of his cleverness." },
    { x:"The sorceress Circe first turns Odysseus's men into pigs. Later she becomes his host and helper, and she gives him advice for the journey ahead.",
      p:"Which archetype does Circe fit best?", a:"Shapeshifter",
      w:[["Hero", "Odysseus is the hero; Circe is someone he meets."],
         ["Herald", "Circe does not bring the call that starts the journey."],
         ["Shadow", "A shadow stays the hero's enemy. Circe changes from enemy to helper."]],
      why:"Circe's loyalty changes: first a threat, then a helper. A character whose side keeps changing is a shapeshifter." },
    { x:"Odysseus finally reaches home disguised as a beggar. He wins an archery contest no one else can complete, defeats the men who have taken over his house and is reunited with his wife, Penelope.",
      p:"Which stage of the Hero's Journey does this final confrontation show?", a:"Resurrection",
      w:[["Call to Adventure", "This is the end of the story, not its beginning."],
         ["Refusal of the Call", "Odysseus acts boldly; there is no hesitation."],
         ["Meeting the Mentor", "No guide teaches him here. He proves himself alone."]],
      why:"A last, decisive test at the climax, after the long road home, proves the hero's strength: Resurrection." },
    { x:"Gilgamesh finally finds a plant that can restore youth, but while he bathes, a snake steals it. He returns to Uruk without magic, but he accepts that all people die and takes pride in the great walls his people built.",
      p:"What is Gilgamesh's 'elixir' when he returns home?", a:"Wisdom: accepting that he is mortal and valuing what people build together.",
      w:[["The plant that restores youth.", "The snake steals the plant, so he cannot bring it home."],
         ["Immortality granted by the gods.", "He fails to become immortal; that is the point of the ending."],
         ["Enkidu, brought back from the dead.", "Enkidu does not return. His death is what started Gilgamesh's search."]],
      why:"The elixir does not have to be an object. Gilgamesh brings home a hard-won understanding that changes how he rules." },
    { x:"In a famous space film, a farm boy on a desert planet finds a hidden message from a captured princess, stored inside a small robot.",
      p:"In this moment, which archetype does the robot fit?", a:"Herald",
      w:[["Shadow", "The robot does not oppose the hero; it brings him news."],
         ["Threshold guardian", "The robot does not block the way; it opens it."],
         ["Mentor", "The robot carries the message but does not teach or train the boy."]],
      why:"The robot delivers the message that calls the hero to adventure. That is the herald's job." },
    { x:"The same farm boy says he cannot leave because he is needed for the harvest. Only after his home is destroyed does he agree to go.",
      p:"Which stage of the Hero's Journey does his first answer show?", a:"Refusal of the Call",
      w:[["Reward (Seizing the Sword)", "Nothing has been won; the journey has not started."],
         ["The Ordeal", "The central crisis comes much later, in the most dangerous place."],
         ["Resurrection", "Resurrection is the final test at the climax, not the start."]],
      why:"Saying 'I cannot go' and giving an excuse is a classic Refusal of the Call. Losing his home removes the excuse." },
    { x:"In a well-known fantasy series, an orphan boy living with unkind relatives learns on his eleventh birthday that he is a wizard, when a giant groundskeeper arrives with the news.",
      p:"In this moment, which archetype does the groundskeeper fit?", a:"Herald",
      w:[["Shadow", "The groundskeeper is friendly and opens up a new life for the boy."],
         ["Trickster", "He is not there to cause mischief; he delivers life-changing news."],
         ["Threshold guardian", "He does not block the way; he invites the boy through it."]],
      why:"He brings the news that changes everything and starts the adventure, which is the herald's role." },
    { x:"The boy wizard's relatives tear up his letters and even flee with him to a remote hut to stop him from going to the wizard school.",
      p:"Which archetype do the relatives fit best in this part of the story?", a:"Threshold guardian",
      w:[["Mentor", "They give no help or advice; they try to stop him."],
         ["Ally", "They work against the boy, not with him."],
         ["Herald", "They try to hide the call, not deliver it."]],
      why:"They stand between the hero and the new world and try to stop him crossing. That is a threshold guardian." },
    { x:"To reach his new school, the boy runs straight at a solid brick wall between two railway platforms and passes through it into a hidden world.",
      p:"Which stage of the Hero's Journey does this moment show?", a:"Crossing the Threshold",
      w:[["Ordinary World", "He is leaving his ordinary world behind, not living in it."],
         ["Reward (Seizing the Sword)", "Nothing has been won yet; the adventure is just beginning."],
         ["Return with the Elixir", "He is entering the special world, not coming home from it."]],
      why:"Passing through a barrier into a new, unfamiliar world is the clearest possible Crossing the Threshold." },
    { x:"A girl from a Kansas farm is carried by a tornado to a magical land. To get home, she follows a road to a wizard and gains three companions on the way.",
      p:"Which archetype do her three companions fit?", a:"Ally",
      w:[["Shadow", "The companions help her; they are not the villain."],
         ["Herald", "They do not bring the call; the tornado has already started her journey."],
         ["Threshold guardian", "They travel with her rather than blocking her way."]],
      why:"Companions who travel with the hero and help her along the way are allies." },
    { x:"At the end, the girl from Kansas learns she had the power to go home all along. She returns to her farm, grateful for her family.",
      p:"Which stage of the Hero's Journey does this show?", a:"Return with the Elixir",
      w:[["Call to Adventure", "This is the end of the story, not the event that starts it."],
         ["Refusal of the Call", "She wants to go home; she is not avoiding a quest."],
         ["Approach to the Inmost Cave", "The danger is over; she is home."]],
      why:"She comes home changed, and her 'elixir' is a new understanding of what home means." }
  ];
  const MYTH3 = [
    { x:"<b>A:</b> Theseus walks deeper into the Labyrinth toward the Minotaur.<br><b>B:</b> A farm boy and his friends are pulled aboard the enemy's huge battle station and creep through its corridors.",
      p:"What do these two moments have in common?", a:"Both heroes are entering the most dangerous place.",
      w:[["Both heroes meet a mentor who gives them a magical gift for the journey.", "Neither moment involves a guide giving a gift; both are about entering danger."],
         ["Both heroes return home changed.", "Both are still deep in enemy territory, far from home."],
         ["Both heroes refuse the call at first because they are afraid.", "Both are already well into the adventure."]],
      why:"Both are the Approach to the Inmost Cave: the hero enters the enemy's stronghold, where the central crisis waits. Comparing stories means matching what moments do, not what they look like." },
    { x:"<b>A:</b> Athena advises Odysseus and helps him in disguise.<br><b>B:</b> An old hermit, once a knight, teaches a farm boy about a mysterious energy and gives him his father's sword.",
      p:"What do these two characters have in common?", a:"Both act as mentors who guide the hero.",
      w:[["Both are heralds who arrive with the news that starts the adventure.", "They guide and equip the hero; they do not deliver the call."],
         ["Both are shapeshifters whose loyalty keeps changing.", "Both stay loyal to the hero throughout."],
         ["Both are threshold guardians who block the hero's path.", "Both help the hero forward rather than blocking him."]],
      why:"An ancient goddess and a space-age hermit look nothing alike, but they do the same job: the mentor, who guides and gives help or gifts." },
    { x:"<b>A:</b> King Polydectes sends Perseus to fetch the head of Medusa.<br><b>B:</b> An orphan boy learns he is a wizard and is invited to a hidden school.",
      p:"What do these two moments have in common?", a:"Both pull the hero out of ordinary life.",
      w:[["Both are the hero's central ordeal, a brush with death or failure.", "Both happen at the very start, long before any central crisis."],
         ["Both show the hero returning home with an elixir to share.", "Neither hero has gone anywhere yet."],
         ["Both show the hero's mentor dying.", "No one dies in either moment; each sets a journey in motion."]],
      why:"One is a deadly order and one is a joyful invitation, but both disrupt the ordinary world and start the quest: the Call to Adventure." },
    { x:"<b>A:</b> Gilgamesh comes home without immortality but accepts that he is mortal.<br><b>B:</b> A girl from Kansas comes home realizing how much her family and home mean to her.",
      p:"What do these two endings have in common?", a:"Both heroes bring home wisdom, not a magic object.",
      w:[["Both heroes win a magic object that they keep forever and use to rule.", "Gilgamesh loses the plant, and the girl's lesson is about home, not an object."],
         ["Both heroes fail and learn nothing.", "Both have clearly changed in how they see the world."],
         ["Both heroes refuse to go home and stay in the special world.", "Both actually return home."]],
      why:"The Elixir is often an inner change: an understanding the hero brings back to the ordinary world." },
    { x:"<b>A:</b> Humbaba guards the Cedar Forest against Gilgamesh and Enkidu.<br><b>B:</b> A boy's relatives destroy his letters to stop him from going to wizard school.",
      p:"What do these two have in common?", a:"Both try to block the hero from a new world.",
      w:[["Both are mentors who prepare the hero with training and gifts.", "Both stand in the hero's way rather than helping."],
         ["Both are the main villain, defeated at the story's climax.", "Both appear early, before the hero enters the new world, not as the final enemy."],
         ["Both bring the news that starts the adventure.", "They resist the adventure; they do not announce it."]],
      why:"A monster and a pair of grumpy relatives look very different, but both act as threshold guardians." },
    { x:"<b>A:</b> Ariadne gives Theseus a ball of thread before he enters the Labyrinth.<br><b>B:</b> Perseus receives a polished shield before he faces Medusa.",
      p:"What do these two moments have in common?", a:"Each hero gets a gift that helps him survive.",
      w:[["Each hero receives the reward for finishing the quest and returns home with it.", "The gifts come before the danger; a reward comes after it."],
         ["Each object is a symbol of the hero's ordinary world.", "Both objects are given for the adventure, not taken from home."],
         ["Each object is a trap set by the villain to lure the hero into danger.", "Both are given by helpers and both work."]],
      why:"Helpers and mentors often give a tool that is needed later in the Ordeal. Spotting this pattern helps you plan your own story." },
    { x:"<b>A:</b> Back home, Odysseus, still in disguise, wins an archery contest and defeats the men who took over his house.<br><b>B:</b> Back on his island, Perseus uses Medusa's head to defeat King Polydectes.",
      p:"What do these two moments have in common?", a:"Both heroes face a final showdown at home.",
      w:[["Both heroes refuse the call because they are afraid of failing.", "Both are acting decisively at the end of their journeys."],
         ["Both heroes are meeting their mentor for the first time.", "Neither is meeting a guide; each faces an enemy."],
         ["Both heroes are crossing the first threshold into the special world.", "The first threshold is crossed early; these moments are at the end."]],
      why:"In both, the last battle happens on home ground and proves what the hero has become. This matches the Resurrection." },
    { x:"<b>A:</b> A farm boy says he must stay for the harvest instead of joining the fight.<br><b>B:</b> A shy student says no when her friends ask her to run for class president, insisting she is not a leader.",
      p:"What do these two moments have in common?", a:"Both heroes make an excuse to avoid the call.",
      w:[["Both heroes are claiming their reward after surviving the ordeal.", "Nothing has been won; both are trying to avoid starting."],
         ["Both heroes are meeting a mentor.", "No guide appears in either moment."],
         ["Both heroes are facing their central ordeal in the inmost cave.", "Both are at the very beginning of their stories."]],
      why:"Fear dressed up as an excuse is the Refusal of the Call. It makes heroes feel human." },
    { x:"Myths from ancient Greece, ancient Mesopotamia and modern films often follow the same pattern of departure, testing and return.",
      p:"Which explanation for this is closest to Joseph Campbell's idea?", a:"People everywhere share the experience of leaving home, being tested and growing.",
      w:[["Modern writers copied the ancient myths word for word, changing only the names of the characters.", "Modern stories share a pattern, not the same words or plots."],
         ["Ancient storytellers in different places all read the same book.", "These cultures were far apart in time and place; the pattern is shared, not borrowed from one book."],
         ["The pattern only works for stories about gods and monsters.", "The pattern fits sports, school and family stories too."]],
      why:"Campbell called this shared pattern the monomyth. He argued it appears across cultures because it reflects how people grow and change." }
  ];

  /* ---------- The Alchemist (in our own words) ---------- */
  const ALC1 = [
    { x:"At the start of the novel, Santiago is a young shepherd in Andalusia, Spain. He travels the countryside with his flock and knows his sheep's habits well.",
      p:"Which stage of the Hero's Journey does this show?", a:"Ordinary World",
      w:[["The Ordeal", "Nothing dangerous is happening; this is his everyday life."],
         ["Reward (Seizing the Sword)", "He has not done anything yet to earn a reward."],
         ["The Road Back", "He has not left home, so he cannot be heading back."]],
      why:"Santiago's life with his sheep is the familiar world the journey will take him away from." },
    { x:"Santiago has a recurring dream about finding treasure at the Egyptian pyramids.",
      p:"Which stage of the Hero's Journey does the dream represent?", a:"Call to Adventure",
      w:[["Return with the Elixir", "The dream starts the journey; it does not end it."],
         ["The Ordeal", "The dream is an invitation, not a life-or-death crisis."],
         ["Resurrection", "Resurrection is the final test near the end of the story."]],
      why:"The dream disrupts Santiago's routine and points him toward a quest. That is the Call to Adventure." },
    { x:"An old man who says he is the King of Salem explains the idea of a Personal Legend to Santiago, encourages him to follow his dream and gives him two stones.",
      p:"Which archetype does Melchizedek, the King of Salem, fit best?", a:"Mentor",
      w:[["Shadow", "He helps Santiago; he is not an enemy."],
         ["Trickster", "He is serious and wise, not mischievous."],
         ["Threshold guardian", "He encourages Santiago to go, rather than blocking his path."]],
      why:"Melchizedek gives advice, wisdom and a gift (the stones), which is the mentor's role." },
    { x:"Santiago sells his sheep and crosses the sea from Spain to Tangier, in North Africa, where he does not speak the language.",
      p:"Which stage of the Hero's Journey does this show?", a:"Crossing the Threshold",
      w:[["Ordinary World", "He is leaving his ordinary world, not living in it."],
         ["Reward (Seizing the Sword)", "He has won nothing yet; the adventure is just beginning."],
         ["Return with the Elixir", "He is leaving home, not coming back."]],
      why:"Selling the sheep and crossing to another continent is his point of no return into an unfamiliar world." },
    { x:"In the desert, a mysterious alchemist becomes Santiago's guide. He teaches him to listen to his heart and to read the world around him.",
      p:"Which archetype does the alchemist fit best?", a:"Mentor",
      w:[["Shadow", "The alchemist helps Santiago reach his goal."],
         ["Trickster", "His lessons are serious, not playful mischief."],
         ["Hero", "Santiago is the hero; the alchemist guides him."]],
      why:"The alchemist teaches, tests and guides Santiago through the most dangerous part of his journey: a mentor." },
    { p:"In <i>The Alchemist</i>, what is a Personal Legend?", a:"The thing a person has always wanted to achieve: their true purpose in life.",
      w:[["A famous story told about a person's ancestors.", "It is about a person's own future, not their family's past."],
         ["A legend about the pyramids that everyone in Egypt knows.", "Every person has their own Personal Legend, not one shared story."],
         ["A set of rules for living a good life given by the king.", "The king explains the idea, but it is a personal purpose, not a rulebook."]],
      why:"The whole novel is about Santiago pursuing his Personal Legend, his true purpose." },
    { p:"Throughout the novel, Santiago learns to notice omens. What are omens in the story?", a:"Signs in the world that guide a person toward their Personal Legend.",
      w:[["Curses that bring bad luck.", "In the novel, omens guide and help; they are not curses."],
         ["Messages written down by the alchemist.", "Omens appear in nature and events, not in written notes."],
         ["Dreams about the past.", "Santiago's dream is about the future, and omens appear while he is awake."]],
      why:"Learning to read omens is part of Santiago's growth: he learns to see the world as full of guidance." },
    { x:"Santiago returns to the ruined church where his journey began, digs beneath the sycamore tree and finds a chest of treasure.",
      p:"Which stage of the Hero's Journey does this show?", a:"Return with the Elixir",
      w:[["Call to Adventure", "This ends the journey; it does not start it."],
         ["Refusal of the Call", "Santiago is acting on what he has learned, not refusing anything."],
         ["Meeting the Mentor", "He is alone; his mentors have already taught him what he needed."]],
      why:"He comes home changed and finds the treasure, along with everything he learned along the way." }
  ];
  const ALC2 = [
    { x:"Santiago's sheep follow him every day, caring only about food and water. They never wonder about anything beyond the next pasture.",
      p:"What do the sheep most likely represent?", a:"People who settle for a comfortable routine and never chase their dreams.",
      w:[["The treasure Santiago hopes to find, which is waiting for him far away in Egypt.", "The sheep are what he leaves behind, not what he is looking for."],
         ["Santiago's love for Fatima, the young woman he meets later at the desert oasis.", "Santiago meets Fatima much later, in the desert."],
         ["The dangers of the desert.", "The sheep belong to his safe, familiar life in Spain."]],
      why:"The sheep live only for food and water, with no wider purpose. They stand for people who never follow their Personal Legend." },
    { x:"Melchizedek gives Santiago two stones, Urim and Thummim. One means 'yes' and one means 'no', and they are for times when Santiago cannot read the omens.",
      p:"What do the stones most likely represent?", a:"Guidance in moments of doubt, though Santiago must learn to choose for himself.",
      w:[["Wealth: the king hopes the precious stones will make Santiago rich enough to stop working.", "They are precious, but they are given to help him decide, not to make him rich."],
         ["Santiago's fear of the desert.", "They are a source of help, not fear."],
         ["The two countries of his journey, Spain and Egypt, one light and one dark.", "Nothing in the story links the stones to countries; they answer yes and no."]],
      why:"The stones offer help when the omens are unclear, but the king urges Santiago to make his own decisions. The real goal is learning to read the world." },
    { x:"Soon after Santiago arrives in Tangier, a young man offers to guide him to the pyramids, then disappears in a busy market with all of Santiago's money.",
      p:"Which stage of the Hero's Journey does this show?", a:"Tests, Allies and Enemies",
      w:[["Approach to the Inmost Cave", "He is not preparing to enter the most dangerous place; this is an early setback in the new world."],
         ["Return with the Elixir", "This is near the start of the journey, not the end."],
         ["Meeting the Mentor", "The young man pretends to be a helper but gives no real guidance. He turns out to be an enemy."]],
      why:"In the new world, Santiago learns a hard first lesson about whom to trust. That is a test and an enemy." },
    { x:"The same young man seems friendly and helpful, then robs Santiago.",
      p:"Which archetype does the thief fit best?", a:"Shapeshifter",
      w:[["Mentor", "He teaches Santiago nothing on purpose; he only pretends to help."],
         ["Herald", "He does not bring the call; Santiago's journey has already begun."],
         ["Threshold guardian", "He does not block Santiago's way; he pretends to help and then betrays him."]],
      why:"A character who appears to be an ally but turns out to be a betrayer is a shapeshifter." },
    { x:"The crystal merchant has dreamed for years of making a pilgrimage to Mecca. He never goes, because he fears that once his dream comes true, he will have nothing left to live for.",
      p:"What idea does the crystal merchant most clearly represent?", a:"Some people keep their dreams safe by never trying to reach them.",
      w:[["Hard work and good ideas will always lead to wealth and success in business.", "His business improves, but his role in the story is about fear of fulfilling a dream."],
         ["Travel to faraway places is too dangerous for most people to attempt.", "He does not avoid Mecca because of danger, but because of what reaching it would mean."],
         ["Older people should always guide the young.", "It is Santiago who brings new ideas to the merchant's shop."]],
      why:"The merchant is a contrast to Santiago: someone who heard a call but chose to keep it as a dream." },
    { x:"The Englishman in the caravan has spent years reading books about alchemy. Santiago, meanwhile, learns by watching the desert, the caravan and the camels.",
      p:"Which contrast do these two characters show?", a:"Learning from books versus learning from experience.",
      w:[["Rich travelers versus poor travelers.", "Money is not the focus here; the way each one learns is."],
         ["Honest people versus people who lie to get what they want.", "Neither is lying; they simply learn in different ways."],
         ["Europe versus Africa.", "Both characters come from Europe."]],
      why:"The novel values learning through experience and paying attention to the world. The Englishman is a foil for Santiago." },
    { x:"At the oasis, Santiago meets Fatima and falls in love. She encourages him to continue his journey and promises to wait for him.",
      p:"Which archetype does Fatima fit best?", a:"Ally",
      w:[["Shadow", "Fatima supports Santiago; she is not an enemy."],
         ["Trickster", "There is nothing mischievous about her role."],
         ["Herald", "She does not bring the call; Santiago has been on his journey for a long time."]],
      why:"Fatima supports Santiago and urges him on, which makes her an ally." },
    { x:"Santiago sees two hawks fighting in the sky and understands it as a warning that an army will attack the oasis. He warns the tribal chieftains, and the oasis is saved.",
      p:"What does this moment show about Santiago?", a:"He has learned to read omens in the world around him.",
      w:[["He secretly wants to join the army and become a desert warrior.", "He warns others about the army but does not want to join it."],
         ["He is afraid of the desert.", "He acts boldly here, even though being wrong could be dangerous."],
         ["He believes the hawks are his allies and will protect the oasis.", "The hawks are a sign he interprets, not characters who help him."]],
      why:"Seeing meaning in the hawks shows Santiago's growth: he now understands the omens the king told him about." }
  ];
  const ALC3 = [
    { x:"In a monastery in the desert, the alchemist turns a piece of lead into gold, splits it into four pieces and keeps only one for himself.",
      p:"What does turning lead into gold most likely symbolize?", a:"Transformation: anything, including a person, can become its best self.",
      w:[["Greed: the alchemist secretly wants to become rich and powerful.", "He shares the gold and keeps only one piece, so the point cannot be greed."],
         ["Magic tricks that are used to fool and impress ordinary people.", "The novel treats alchemy seriously, as a metaphor, not as a trick."],
         ["The danger of the desert.", "The gold-making happens in a monastery and is about change, not danger."]],
      why:"Lead becoming gold mirrors Santiago becoming his best self by following his Personal Legend." },
    { x:"Captured by warring tribesmen, Santiago is given three days to turn himself into the wind, or he and the alchemist will be killed.",
      p:"Which stage of the Hero's Journey does this show?", a:"The Ordeal",
      w:[["Ordinary World", "This is a life-or-death test far from home."],
         ["Meeting the Mentor", "The alchemist is already his mentor; this is the test of what he has learned."],
         ["Return with the Elixir", "He is still in the desert and in great danger."]],
      why:"Facing death and having to draw on everything he has learned is Santiago's central crisis." },
    { x:"At the pyramids, Santiago is beaten by strangers. One of them laughs at him for crossing a desert because of a dream, and mentions his own dream of treasure in a ruined church in Spain, which he never bothered to follow.",
      p:"What does this twist reveal?", a:"The treasure was near home all along, but he needed the journey to find it.",
      w:[["Santiago's long journey across the desert was a complete waste of his time and money.", "He gained love, wisdom and the knowledge of where to dig. Without the journey, he would never have found the treasure."],
         ["The pyramids have no real meaning in the novel.", "The pyramids are where he learns where the treasure is; they matter to the journey."],
         ["Strangers can never be trusted, especially in a foreign country.", "The stranger's words actually lead him to the treasure."]],
      why:"The twist links the end to the beginning. The value of the journey lies in what Santiago became and learned." },
    { p:"The novel begins and ends at the same ruined church with a sycamore tree. What is the most likely effect of this circular structure?",
      a:"It shows the journey changed Santiago, even though he ends where he started.",
      w:[["It shows that nothing in Santiago's life has really changed since the opening chapter.", "He returns as a different person, with wisdom and love he did not have before."],
         ["It proves the dream was false.", "The dream leads him to real treasure, just not where he expected."],
         ["It suggests Santiago should never have left Spain and his sheep in the first place.", "He only learns where the treasure is because he made the journey."]],
      why:"A circular structure invites the reader to compare the hero at the start and at the end. The place is the same; the person is not." },
    { x:"Fatima tells Santiago to continue his journey and promises to wait for him.",
      p:"What does Fatima's choice suggest about love in the novel?", a:"True love supports a person's dream instead of holding them back.",
      w:[["Love is more important than any dream, so Santiago should stay at the oasis forever.", "Santiago is tempted to stay, but the novel suggests he must continue, and that real love lets him go."],
         ["Love always ends in loss.", "Santiago plans to return to Fatima, so the novel does not suggest this."],
         ["Falling in love makes people forget their goals and lose their way.", "Fatima does the opposite: she reminds him of his goal."]],
      why:"Fatima's encouragement shows that, in this novel, love and a Personal Legend can work together." },
    { p:"The desert in the novel is huge, silent and dangerous. What does it most likely represent for Santiago?",
      a:"A place of testing, where he learns patience and to listen.",
      w:[["Home and comfort, like the green fields of Andalusia that he left behind.", "The desert is unfamiliar and dangerous, the opposite of home."],
         ["Wealth and success.", "Santiago crosses the desert with little; the treasure is elsewhere."],
         ["His fear of love and of being close to other people.", "He finds love at an oasis in the desert; the desert itself is about testing and learning."]],
      why:"Like many special worlds in the Hero's Journey, the desert is where the hero is tested and transformed. There he learns to listen to the world and to his heart." },
    { p:"What do the pyramids most likely represent in the novel?", a:"The distant goal of his Personal Legend.",
      w:[["Death, and the fear that every journey must end.", "In this novel, the pyramids stand for a goal, not death."],
         ["Fatima and the oasis where Santiago falls in love.", "Fatima lives at the oasis, not at the pyramids."],
         ["Santiago's home in Spain.", "The pyramids are as far from home as he travels."]],
      why:"The pyramids are where the dream points and what pulls Santiago forward. Reaching them gives him the final piece of knowledge he needs." },
    { x:"Melchizedek asks Santiago for one tenth of his sheep in return for his help.",
      p:"What does this request suggest about following a Personal Legend?", a:"Following a dream requires giving something up.",
      w:[["Wise people are always secretly greedy for money and possessions.", "The request is a lesson about commitment, not about the king's greed."],
         ["Sheep are the most valuable thing a person can own.", "The sheep matter only because giving them up shows commitment."],
         ["Santiago should stay a shepherd and forget his dream.", "The king encourages him to leave, not to stay."]],
      why:"Paying a price is part of commitment. Santiago must let go of part of his old life to begin the new one." }
  ];

  /* ---------- choosing evidence ---------- */
  const EVI2 = [
    { claim:"Ines, the mentor, cares more about the hero's safety than about the quest.",
      a:"Ines refuses to hand over the map until Marisol promises to turn back if the ice cracks.",
      w:[["Ines is the oldest person in the village and has lived through more winters than anyone else.", "Her age does not show what she cares about."],
         ["Ines once crossed the frozen sea herself, many years ago, with only a sled and two dogs.", "This shows experience, not concern for Marisol's safety."],
         ["Ines lives in a small hut near the harbor.", "A setting detail; it says nothing about her priorities."]] },
    { claim:"Kofi is afraid to answer the call.",
      a:"When the elders ask Kofi to go, he stares at the floor and says his father needs him.",
      w:[["Kofi is the best swimmer in the village and can hold his breath longer than the older fishermen.", "This shows ability, not fear."],
         ["The river stone was stolen on the last night of the festival, while the whole village was dancing.", "This is about the plot, not about Kofi's feelings."],
         ["Kofi's sister later joins the journey.", "This is a later event about an ally, not Kofi's fear."]] },
    { claim:"The desert is presented as a dangerous threshold.",
      a:"Travelers who cross the dunes without a guide are never seen again.",
      w:[["The desert glows gold and orange at sunset, and the dunes look like waves frozen in place.", "This shows beauty, not danger."],
         ["The hero's village sits at the edge of the desert, beside the last well.", "This gives a location but no sense of danger."],
         ["Merchants use long lines of camels to carry salt and cloth across it every season.", "This suggests people cross it often, which weakens the claim."]] },
    { claim:"Dara's greatest enemy is her own self-doubt, not the rogue program.",
      a:"Each time Dara nearly solves the code, she deletes it, sure it must be wrong.",
      w:[["The rogue program has taken control of the city's traffic lights, and the streets are jammed for miles.", "This is about the outside threat, not Dara's self-doubt."],
         ["Dara has been coding since she was nine and won a national competition at twelve.", "This shows skill, not doubt."],
         ["Dara's friend brings her snacks while she works.", "This shows an ally's support, not Dara's inner struggle."]] },
    { claim:"The lighthouse is a symbol of hope for Leo.",
      a:"When Leo feels lost, he looks out at the lighthouse's distant flash and feels calmer.",
      w:[["The lighthouse was built more than a hundred years ago from stone carried by boat from the mainland.", "A fact about its age, with no link to hope."],
         ["The lighthouse is painted red and white.", "A visual detail with no link to Leo's feelings."],
         ["Leo's father once worked at the lighthouse, climbing its two hundred steps every night.", "This connects Leo's family to the place, but says nothing about hope."]] },
    { claim:"Ravi returns home with an 'elixir' that helps his whole community.",
      a:"Ravi teaches the farmers to read the river so they know when to plant.",
      w:[["Ravi is welcomed home with a huge feast, and the whole village dances until sunrise.", "This shows a celebration, not a benefit he brings."],
         ["Ravi has grown taller during the journey, and his old clothes no longer fit him.", "A physical change that does not help anyone else."],
         ["Ravi still keeps the key from the tunnels.", "An object he keeps for himself does not help the community."]] },
    { claim:"The meteor storm tests Zoe's courage.",
      a:"Although her hands shake, Zoe flies into the storm because it is the only way home.",
      w:[["The meteors are chunks of iron and ice, some as large as the station itself, tumbling at great speed.", "A scientific detail, not about courage."],
         ["Zoe's ship is old and slow.", "This shows difficulty, but not how Zoe responds to it."],
         ["Meteor storms are common in that part of space, especially during the long winter months.", "Background information, not Zoe's courage."]] },
    { claim:"Pip, the trickster, helps the hero see the truth.",
      a:"Pip's joke about the king's 'invisible army' shows the hero that the king has lied.",
      w:[["Pip wears a jacket covered in tiny silver bells that jingle whenever he walks through the castle.", "A costume detail, not about the truth."],
         ["Pip steals pies from the castle kitchen.", "Mischief, but it reveals nothing important."],
         ["Everyone in the castle, from the cook to the king's guards, finds Pip annoying.", "This shows how others see him, not what he reveals."]] }
  ];
  const EVI3 = [
    { claim:"Santiago grows more confident as the novel goes on.",
      a:"At the oasis, Santiago tells the chieftains about his vision, though he could be punished if wrong.",
      w:[["Santiago studied at a seminary as a boy, because his parents hoped he would become a priest.", "Background from before the story; it does not show change."],
         ["Santiago knows a lot about sheep.", "A skill he already had at the start, so it does not show growth."],
         ["Santiago travels with a large caravan across the desert, along with the Englishman.", "A plot fact that says nothing about confidence."]] },
    { claim:"<i>The Alchemist</i> suggests that people learn most by doing, not just by reading.",
      a:"Santiago struggles with the Englishman's books but learns a lot by watching the desert.",
      w:[["The Englishman carries a heavy bag of books on the caravan and reads whenever he can.", "This shows he likes books, but not which way of learning works better."],
         ["The caravan crosses the desert slowly.", "A plot detail with no link to learning."],
         ["Santiago once worked as a shepherd in Andalusia, moving his flock from village to village.", "Background, not a comparison of ways of learning."]] },
    { claim:"Melchizedek is a magical figure, not an ordinary old man.",
      a:"He knows details of Santiago's life that Santiago never told him.",
      w:[["He sits in the town square in ordinary clothes, looking like any other old man in town.", "This makes him seem ordinary, which works against the claim."],
         ["He asks for a tenth of Santiago's sheep.", "A payment, not proof of magic."],
         ["He talks with Santiago about the book Santiago has been reading on the bench.", "Any stranger could do this; it is not magical."]] },
    { claim:"Marisol's journey has changed her home for the better.",
      a:"When Marisol returns, the frozen harbor is full of fishing boats again.",
      w:[["Marisol is exhausted after the long journey and sleeps for two whole days when she gets home.", "This is about Marisol, not her home."],
         ["Marisol remembers her mother's songs on the way back.", "A memory, not a change in her home."],
         ["Marisol's boots are worn through, and her coat is torn in three places from the ice.", "Shows a long journey, not a change at home."]] },
    { claim:"Brother Hal, the threshold guardian, is testing the hero rather than trying to destroy him.",
      a:"Hal blocks the gate, but smiles and steps aside once the hero answers honestly.",
      w:[["Hal is the tallest monk in the monastery, and his shadow fills the whole doorway.", "Size says nothing about his intentions."],
         ["Hal has guarded the gate for thirty years, through storms, sieges and long winters.", "This shows experience, not whether he is testing."],
         ["Hal shouts at the hero to go home.", "This makes him seem hostile, which works against the claim."]] },
    { claim:"The Ordeal changes how Sam sees himself.",
      a:"After the dragon, Sam stops calling himself 'just an apprentice' and starts giving orders.",
      w:[["The dragon's cave smells of smoke and old bones, and its walls are black with soot.", "A setting detail, not about Sam's self-image."],
         ["Sam loses his sword in the fight.", "An event in the fight, not a change in how he sees himself."],
         ["Sam's companion is unconscious for the whole fight and wakes up only when it is over.", "About the companion, not Sam's view of himself."]] },
    { claim:"Mia's biggest obstacle is fear, not lack of skill.",
      a:"In training, Mia saves every shot, but in matches she freezes when the crowd chants.",
      w:[["Mia's gloves are two sizes too big, because they were handed down from her older cousin.", "Equipment, not fear."],
         ["Mia once let in four goals in a semi-final.", "This shows a bad game, but not whether fear or skill was the cause."],
         ["Mia practices every morning before school, even in the rain, and never misses a session.", "Shows dedication, not fear."]] },
    { claim:"The new world in Zoe's story is hostile and unwelcoming.",
      a:"The doors slam shut behind Zoe, and a voice repeats: 'Visitors will be removed.'",
      w:[["The ship's corridors are long and gray, lit by rows of dim blue lamps along the ceiling.", "Plain, but not clearly hostile."],
         ["The ship was built two hundred years ago.", "Its age is not proof of hostility."],
         ["Zoe finds a friendly repair robot on board, which helps her find the control room.", "This suggests the opposite of the claim."]] }
  ];
  function eviQ(it){
    return Kit.mc({
      promptHtml:"Which detail <b>best</b> supports this interpretation?",
      exprHtml:box("<b>Claim:</b> " + it.claim),
      options:[{ html:it.a, correct:true }].concat(it.w.map(([h, f]) => ({ html:h, fb:f }))),
      workHtml:`<p>The best evidence links directly to the key words of the claim. This detail shows it in action: <i>${it.a}</i></p><p>The other details are true to the story but are about something else, or they even weaken the claim.</p>`,
      key:"Strong evidence proves the exact claim; a detail that is merely about the same character or place is not enough.",
      hint:"Underline the key word in the claim (afraid, hope, changed...). Which detail shows that word in action?"
    });
  }

  /* ---------- planning a Hero's Journey story ---------- */
  const PLAN = [
    { x:"Nadia's plan: the hero defeats the villain easily in one chapter, with no setbacks.",
      p:"Which change would most strengthen her Ordeal?", a:"Have the hero nearly lose everything before finding a way through.",
      w:[["Add a longer description of the villain's castle, with its towers, gates and dungeons.", "Description adds atmosphere but not the crisis the Ordeal needs."],
         ["Give the hero a magic sword that wins every fight.", "This removes all risk, which makes the Ordeal even weaker."],
         ["Move the fight to the first chapter so the story starts with action.", "The Ordeal belongs in the middle of the journey, after the Approach."]],
      why:"The Ordeal must feel like a real brush with death or failure (captured, badly hurt, betrayed); otherwise the victory means little." },
    { x:"Omar's hero agrees to the quest instantly and never doubts himself.",
      p:"What would adding a Refusal of the Call do for the story?", a:"Show the hero's fear, so the danger feels real.",
      w:[["Make the story shorter and faster, so the reader gets to the action sooner.", "A refusal adds a scene; its purpose is emotional, not speed."],
         ["Remove the need for a mentor.", "A refusal often creates the need for a mentor to help the hero overcome doubt."],
         ["Give the villain a clear reason to attack the hero's village.", "The refusal is about the hero's inner fear, not the villain's motives."]],
      why:"Hesitation shows the stakes. If even the hero is scared, the reader believes the danger, and the hero is easier to relate to." },
    { x:"In Lina's plan, the hero returns home with treasure, but nothing about her or her village changes.",
      p:"Which revision best completes the Return with the Elixir?", a:"Show how she has changed and how what she gained helps her village.",
      w:[["End the story the moment she finds the treasure, so it finishes on a high.", "This skips the Return entirely."],
         ["Add another monster on the way home.", "That adds to the Road Back, but the ending still shows no change."],
         ["Describe the treasure in more detail: its color, its weight and its age.", "Detail does not show change or benefit."]],
      why:"The Elixir must make a difference: to the hero, to the ordinary world, or both." },
    { x:"In Jae's plan, the mentor gives the hero all the answers and defeats the final enemy for him.",
      p:"Why is this a weakness?", a:"The hero must win the climax himself; a mentor only prepares him.",
      w:[["Mentors should never appear again after the first chapter of a story.", "Mentors can return later; the problem is who wins the climax."],
         ["Mentors must always die.", "Many mentors die, but it is not a rule."],
         ["The mentor should be younger than the hero, so the reader trusts the hero more.", "Age is not the issue; the hero must act for himself."]],
      why:"If the mentor wins, the hero has not changed or proved anything. The Resurrection must belong to the hero." },
    { x:"A student is planning the opening of a Hero's Journey story.",
      p:"Which Ordinary World opening best prepares for the hero's change?", a:"Show the hero's daily life and a flaw or longing the journey will answer.",
      w:[["Start in the middle of the final battle, so the reader is hooked right away.", "That skips the Ordinary World, so the reader cannot measure the change."],
         ["List the twelve stages the hero will pass through.", "The structure should be invisible to the reader, not announced."],
         ["Describe the villain's childhood in detail, including where he grew up and why he turned evil.", "The Ordinary World is about the hero's life before the adventure."]],
      why:"A clear starting point, including a flaw or wish, gives the journey something to change." },
    { x:"A student wants the Resurrection in her story to feel earned.",
      p:"Which plan works best?", a:"The hero wins using a skill or lesson learned earlier in the journey.",
      w:[["A powerful stranger arrives at the last moment and defeats the villain for the hero.", "The hero must solve the final problem; a sudden rescue feels unearned."],
         ["The hero wakes up and it was all a dream.", "This cancels the journey and all its change."],
         ["The villain gives up and walks away for no clear reason.", "Without a real final test, nothing is proved."]],
      why:"An earned climax links back to earlier stages: the mentor's lesson, the tests or the reward." },
    { x:"Ben's plan jumps straight from the hero entering the enemy fortress to the final fight, in one sentence.",
      p:"Which choice would best build tension in the Approach to the Inmost Cave?", a:"Slow the pace, showing the heroes' fears and the danger ahead.",
      w:[["Skip straight to the celebration after the battle, to keep the story moving.", "That removes the build-up completely."],
         ["Add a comic scene about cooking dinner.", "Humor here releases tension instead of building it."],
         ["Summarize the fortress in a list of facts about its size, age and history.", "A list of facts gives information but not dread."]],
      why:"Tension grows when the reader has time to feel the danger getting closer." },
    { x:"In Theo's story, the hero crosses into the enchanted forest but can walk home any time she likes.",
      p:"What would make the threshold stronger?", a:"Make crossing a point of no return.",
      w:[["Add more allies in the forest to help her on the journey.", "Allies are useful, but they do not raise the stakes of the crossing."],
         ["Make the forest look exactly like her village.", "The special world should feel different from the ordinary world."],
         ["Have the hero cross back and forth several times in the first chapter.", "Easy back-and-forth makes the threshold even weaker."]],
      why:"A real threshold forces commitment: once the hero crosses, going back is impossible or very costly." }
  ];

  /* ---------- topic ---------- */
  const T = {
    id:"heros-journey", code:"H", year:10, subject:"English", name:"The Hero's Journey",
    blurb:"The 12 stages, character archetypes, spotting stages in stories, myths and modern stories, symbols in The Alchemist, and choosing evidence.",
    levels:Kit.LEVELS3, defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:45,
    skills:{
      stages:{ name:"The 12 stages: purpose, order and acts", short:"The stages", lesson:0 },
      arch:{ name:"Character archetypes", short:"Archetypes", lesson:1 },
      spot:{ name:"Identifying stages in stories", short:"Spot the stage", lesson:2 },
      myth:{ name:"Comparing myths and modern stories", short:"Myths and modern", lesson:3 },
      alch:{ name:"Symbolism and structure in The Alchemist", short:"The Alchemist", lesson:4 },
      evid:{ name:"Choosing evidence for an interpretation", short:"Evidence", lesson:5 }
    },
    lessons:[
      { title:"The 12 stages", heading:"One pattern, twelve stages, three acts", html:`
<p>In 1949, Joseph Campbell published <i>The Hero with a Thousand Faces</i>. He noticed that myths from all over the world share one pattern, which he called the <b>monomyth</b>. His original version has <b>17 stages</b> in <b>three acts</b>: <b>Departure</b>, <b>Initiation</b> and <b>Return</b>.</p>
<p>Christopher Vogler, a Hollywood story consultant, simplified it into the <b>12-stage version</b> that most schools teach. We use his stages.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>#</th><th>Stage</th><th>What it does</th></tr></thead>
<tbody>
<tr><td colspan="3"><b>Act 1: Departure</b></td></tr>
<tr><td>1</td><td>Ordinary World</td><td>Shows normal life and what is missing.</td></tr>
<tr><td>2</td><td>Call to Adventure</td><td>A problem, message or chance disrupts that life.</td></tr>
<tr><td>3</td><td>Refusal of the Call</td><td>The hero hesitates out of fear or doubt.</td></tr>
<tr><td>4</td><td>Meeting the Mentor</td><td>A guide gives advice, training or a gift.</td></tr>
<tr><td>5</td><td>Crossing the Threshold</td><td>The hero commits and enters the unknown.</td></tr>
<tr><td colspan="3"><b>Act 2: Initiation</b></td></tr>
<tr><td>6</td><td>Tests, Allies and Enemies</td><td>The hero learns the new world's rules and who to trust.</td></tr>
<tr><td>7</td><td>Approach to the Inmost Cave</td><td>Preparing for and moving toward the greatest danger.</td></tr>
<tr><td>8</td><td>The Ordeal</td><td>The central crisis: a brush with death or failure.</td></tr>
<tr><td>9</td><td>Reward (Seizing the Sword)</td><td>The hero claims a prize, knowledge or power.</td></tr>
<tr><td colspan="3"><b>Act 3: Return</b></td></tr>
<tr><td>10</td><td>The Road Back</td><td>The hero heads home, often chased.</td></tr>
<tr><td>11</td><td>Resurrection</td><td>A final test at the climax proves the hero has changed.</td></tr>
<tr><td>12</td><td>Return with the Elixir</td><td>The hero comes home with something that helps others.</td></tr>
</tbody></table></div>
<div class="rule"><span class="name">Memory hook</span><div class="law">Leave, be tested, come back changed.</div>
<p class="small">Stages 1–5 are about leaving, 6–9 about being tested, 10–12 about returning.</p></div>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">The pattern is a guide, not a checklist. Real stories may skip a stage, repeat one (many tests) or change the order slightly. When you design your own story, use the stages to give it shape, not to tick boxes.</p></div>` },
      { title:"Archetypes", heading:"Archetypes are jobs, not people", html:`
<p>An <b>archetype</b> is a character role that appears again and again in stories. Vogler describes eight common ones.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Archetype</th><th>Job in the story</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Hero</td><td>Leaves the known world, grows and makes sacrifices.</td><td>A shy goalkeeper who becomes a leader.</td></tr>
<tr><td>Mentor</td><td>Guides, trains, protects or gives a gift.</td><td>A retired pilot who trains the cadet.</td></tr>
<tr><td>Threshold guardian</td><td>Blocks the way at a key point and tests the hero.</td><td>A troll on the only bridge.</td></tr>
<tr><td>Herald</td><td>Brings the news that starts the adventure.</td><td>A messenger with a sealed letter.</td></tr>
<tr><td>Shadow</td><td>The main villain or dark force (sometimes the hero's own dark side).</td><td>The tyrant the hero must finally defeat.</td></tr>
<tr><td>Ally</td><td>A loyal companion who helps.</td><td>A friend who keeps watch at night.</td></tr>
<tr><td>Trickster</td><td>Brings mischief, humor and chaos; questions the rules.</td><td>A joking fox who steals the crown.</td></tr>
<tr><td>Shapeshifter</td><td>Loyalty or nature keeps changing.</td><td>A stranger who helps, betrays, then helps again.</td></tr>
</tbody></table></div>
<div class="rule"><span class="name">Test</span><div class="law">What does this character do to or for the hero?</div></div>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">One character can wear more than one mask. A mentor may also deliver the call (herald), and a threshold guardian may later become an ally. Judge by what the character does <b>at that moment</b>.</p></div>` },
      { title:"Spotting stages", heading:"Name the stage by what the moment does", html:`
<p>In an exam you will meet short extracts and must name the stage. Ask three questions.</p>
<ol class="steps">
<li><div><div class="m">Where is the hero?</div><p class="why">At home (stages 1–4 or 12), in the new world (6–9) or heading back (10–11)?</p></div></li>
<li><div><div class="m">What is at stake?</div><p class="why">Small tests or the biggest crisis? A first challenge or the last one?</p></div></li>
<li><div><div class="m">What changes?</div><p class="why">A message arrives (Call), a gift is given (Mentor), a prize is won (Reward), the hero proves growth (Resurrection).</p></div></li>
</ol>
<h3>Worked example</h3>
<div class="quotebox">The night before the final, Mia watches videos of the other team's penalty takers and writes notes on where each one aims. She cannot sleep.</div>
<p>Mia is in the new world, preparing for the biggest test, and the tension is rising, but the danger has not arrived yet. This is the <b>Approach to the Inmost Cave</b>.</p>
<div class="warn"><span class="name">Three pairs that get mixed up</span>
<p class="small"><b>Tests vs Ordeal:</b> many smaller challenges vs one central crisis.<br>
<b>Ordeal vs Resurrection:</b> the middle crisis vs the final test that proves the hero has changed.<br>
<b>Reward vs Return with the Elixir:</b> winning the prize vs bringing it home to help others.</p></div>` },
      { title:"Myths and modern stories", heading:"Old myths and new films share one skeleton", html:`
<p>Comparing stories means matching <b>functions</b>: what each moment or character does in the journey.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Story</th><th>Key moments</th></tr></thead>
<tbody>
<tr><td>Theseus (Greek)</td><td>Ariadne's thread (a helper's gift); the Labyrinth (inmost cave); the Minotaur (ordeal).</td></tr>
<tr><td>Perseus (Greek)</td><td>The king's deadly order (call); gifts from Athena and Hermes (mentor); Medusa (ordeal); defeating the king at home.</td></tr>
<tr><td>Odysseus (Greek)</td><td>A long road home full of tests (the Cyclops, Circe); Athena as mentor; a final contest at home.</td></tr>
<tr><td>Gilgamesh (Mesopotamian)</td><td>Enkidu (ally); Humbaba (threshold guardian); the lost plant of youth; returning home wiser about death.</td></tr>
<tr><td>A space film</td><td>A farm boy gets a message hidden in a robot (herald), refuses at first, then trains with an old hermit knight (mentor).</td></tr>
<tr><td>A boy-wizard story</td><td>Unkind relatives (threshold guardians); a giant brings the news (herald); a wall into a hidden world (threshold).</td></tr>
</tbody></table></div>
<div class="rule"><span class="name">Did you know?</span><p class="small">The word <b>mentor</b> comes from the <i>Odyssey</i>: the goddess Athena takes the form of an old friend named Mentor to guide Odysseus's son.</p></div>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">Do not compare surface details (both have swords, both are in a desert). Compare jobs: "both characters block the hero's way, so both are threshold guardians."</p></div>` },
      { title:"The Alchemist", heading:"Santiago's journey is a Hero's Journey", html:`
<p>In Paulo Coelho's novel, a young Andalusian shepherd, Santiago, follows a recurring dream of treasure at the Egyptian pyramids. The plot below is summarized in our own words.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Stage</th><th>In the novel</th></tr></thead>
<tbody>
<tr><td>Ordinary World</td><td>Life as a shepherd in Spain.</td></tr>
<tr><td>Call</td><td>The recurring dream of treasure at the pyramids.</td></tr>
<tr><td>Mentor</td><td>Melchizedek, King of Salem; later the alchemist.</td></tr>
<tr><td>Threshold</td><td>Selling his sheep and crossing to Tangier.</td></tr>
<tr><td>Tests, Allies, Enemies</td><td>Robbed in Tangier; working for the crystal merchant; the caravan and the Englishman; Fatima.</td></tr>
<tr><td>Ordeal</td><td>Given three days to turn himself into the wind, or die.</td></tr>
<tr><td>Return with the Elixir</td><td>Finding the treasure under the sycamore at the ruined church where he started.</td></tr>
</tbody></table></div>
<h3>Key symbols</h3>
<div class="two">
<div class="rule"><span class="name">Sheep</span><p class="small">A comfortable routine; people who never pursue their dreams.</p></div>
<div class="rule"><span class="name">Urim and Thummim</span><p class="small">Yes and no stones: guidance in moments of doubt, though Santiago must learn to decide for himself.</p></div>
<div class="rule"><span class="name">Omens</span><p class="small">Signs in the world that guide a person toward their Personal Legend.</p></div>
<div class="rule"><span class="name">The desert</span><p class="small">A place of testing, silence and learning to listen.</p></div>
<div class="rule"><span class="name">Lead into gold</span><p class="small">Transformation: becoming your best self.</p></div>
<div class="rule"><span class="name">Church and sycamore</span><p class="small">The treasure was near home all along; the journey changed the person who finds it.</p></div>
</div>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">Do not stop at the literal meaning ("the sheep are animals he looks after"). Ask what the object stands for in Santiago's journey. And never copy sentences from the novel into your work: explain in your own words.</p></div>` },
      { title:"Choosing evidence", heading:"The best evidence proves the exact claim", html:`
<p>An <b>interpretation</b> is a claim about meaning. Evidence must show that claim in action, not just mention the same character.</p>
<ol class="steps">
<li><div><div class="m">Find the key word in the claim.</div><p class="why">In "Kofi is afraid to answer the call", the key word is afraid.</p></div></li>
<li><div><div class="m">Look for a detail that shows that word.</div><p class="why">"He stares at the floor and makes an excuse" shows fear.</p></div></li>
<li><div><div class="m">Reject details that are true but off-target.</div><p class="why">"Kofi is the best swimmer" is about Kofi, but it shows skill, not fear.</p></div></li>
</ol>
<div class="rule"><span class="name">Rule</span><div class="law">Specific + directly linked = strong evidence</div></div>
<div class="warn"><span class="name">Two traps</span>
<p class="small">A detail can be about the right character but the wrong idea. And some details actually <b>weaken</b> the claim, for example "Hal shouts at the hero to go home" when the claim is that Hal is only testing him.</p></div>` }
    ],
    introHtml:`<h2>Six ideas that win marks</h2>
<p class="muted">Use these habits in every Hero's Journey question and in your own story design.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Know the order</h3><p class="small">Twelve stages in three acts: Departure, Initiation, Return.</p></div>
<div class="habit"><span class="hn">2</span><h3>Name the function</h3><p class="small">Ask what a moment does for the journey, not what it looks like.</p></div>
<div class="habit"><span class="hn">3</span><h3>Archetypes are jobs</h3><p class="small">Judge a character by what they do for the hero at that moment.</p></div>
<div class="habit"><span class="hn">4</span><h3>Compare patterns</h3><p class="small">Myths and modern stories match in function, not in surface details.</p></div>
<div class="habit"><span class="hn">5</span><h3>Read symbols</h3><p class="small">Ask what an object stands for in the hero's growth.</p></div>
<div class="habit"><span class="hn">6</span><h3>Prove the claim</h3><p class="small">Pick evidence that shows the claim's key word in action.</p></div>
</div>`,
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };

  /* ---------- generators ---------- */
  const ORDER_FRAMES = [
    "Put these # stages of the Hero's Journey in order, from first to last.",
    "A student's story plan uses these # stages. Put them in the order they should happen.",
    "Arrange these # stages in the order a hero meets them.",
    "Sort these # stages from the start of the journey to the end.",
    "A film follows the Hero's Journey closely. In what order would these # stages appear?",
    "Order these # stages, beginning with the one closest to the Ordinary World."
  ];
  function orderGen(k){
    return ctx => {
      const idx = shuffle([...Array(12).keys()]).slice(0, k).sort((a, b) => a - b);
      const names = idx.map(i => ST[SK[i]].n);
      return Kit.order({
        promptHtml:Kit.unique(ctx, ORDER_FRAMES, f => "of" + f).replace("#", k),
        inOrder:names, axis:["first", "last"],
        workHtml:"<p>" + idx.map(i => `${i + 1}. ${ST[SK[i]].n}`).join("<br>") + "</p><p>Remember the shape: leave (1–5), be tested (6–9), come back changed (10–12).</p>",
        key:"Leave, be tested, come back changed: the order follows the hero out and home again.",
        hint:"Decide first which act each stage belongs to: Departure, Initiation or Return."
      });
    };
  }
  const POOL = [
    /* Level 1 */
    { id:"purpose", skill:"stages", level:1, make(ctx){
      const k = Kit.unique(ctx, SK), others = shuffle(SK.filter(x => x !== k && !(CONF[k] || []).includes(x))).slice(0, 3);
      return Kit.mc({ promptHtml:`What is the main purpose of this stage: <b>${ST[k].n}</b>?`,
        options:[{ html:ST[k].p, correct:true }].concat(others.map(o => ({ html:ST[o].p, fb:`That describes ${ST[o].n}.` }))),
        workHtml:`<p><b>${ST[k].n}</b> is stage ${ST[k].i + 1} of 12, in the ${ST[k].act} act. ${ST[k].p}</p>`,
        key:"Each stage has a job in the story; know the job, not just the name.",
        hint:`Where does ${ST[k].n} come in the journey: the start, the middle or the end?` });
    } },
    { id:"name-stage", skill:"stages", level:1, make(ctx){
      const k = Kit.unique(ctx, SK, x => "n" + x);
      return Kit.mc({ promptHtml:"Which stage of the Hero's Journey does this describe?", exprHtml:box(ST[k].p),
        options:stageOptions(k, null, 4).map(o => o.correct ? o : Object.assign(o, { fb:`${o.html} is stage ${ST[SK.find(s => ST[s].n === o.html)].i + 1}: ${ST[SK.find(s => ST[s].n === o.html)].p}` })),
        workHtml:`<p>This is <b>${ST[k].n}</b>, stage ${ST[k].i + 1} of 12.</p>`,
        key:"Match the stage to its job in the story.",
        hint:"Picture a story you know. When does this happen?" });
    } },
    { id:"order4", skill:"stages", level:1, make:orderGen(4) },
    { id:"act", skill:"stages", level:1, make(ctx){
      const k = Kit.unique(ctx, SK, x => "a" + x), act = ST[k].act;
      const opts = ["Departure", "Initiation", "Return"].map(a => a === act ? { html:ACTS[a], correct:true }
        : { html:ACTS[a], fb:`${ST[k].n} is stage ${ST[k].i + 1}, which is not in stages ${a === "Departure" ? "1–5" : a === "Initiation" ? "6–9" : "10–12"}.` });
      return Kit.mc({ promptHtml:`Campbell grouped the journey into three acts. Which act does <b>${ST[k].n}</b> belong to?`,
        options:opts, workHtml:`<p>${ST[k].n} is stage ${ST[k].i + 1}, so it belongs to <b>${act}</b>. ${ST[k].p}</p>`,
        key:"Departure 1–5, Initiation 6–9, Return 10–12.",
        hint:"Is the hero leaving, being tested in the special world, or heading home?" });
    } },
    { id:"arch1", skill:"arch", level:1, make(ctx){ return archQ(Kit.unique(ctx, ARCH1)); } },
    { id:"arch-def", skill:"arch", level:1, make(ctx){
      const k = Kit.unique(ctx, AK, x => "d" + x);
      return Kit.mc({ promptHtml:"Which archetype matches this description?", exprHtml:box(AR[k].d),
        options:archOptions(k, 4), workHtml:`<p>This describes the <b>${AR[k].n}</b>.</p>`,
        key:"Archetypes are defined by their job in the hero's story.", hint:"Think of a film you know: who does this job?" });
    } },
    { id:"spot1", skill:"spot", level:1, make(ctx){ return scenQ(Kit.unique(ctx, SCEN1)); } },
    { id:"alch1", skill:"alch", level:1, make(ctx){ return Q(Kit.unique(ctx, ALC1), {
      key:"Map Santiago's journey onto the stages by asking what each event does for him.",
      hint:"Where is Santiago in his journey: at home, on the way, or back again?" }); } },
    /* Level 2 */
    { id:"order5", skill:"stages", level:2, make:orderGen(5) },
    { id:"missing", skill:"stages", level:2, make(ctx){
      const s = ri(0, 7), gap = s + ri(1, 3), seq = [s, s + 1, s + 2, s + 3, s + 4];
      const shown = seq.map(i => i === gap ? "<b>?</b>" : ST[SK[i]].n).join(" → ");
      const wrong = shuffle([...Array(12).keys()].filter(i => !seq.includes(i))).slice(0, 3);
      return Kit.mc({ promptHtml:"Which stage is missing from this sequence?", exprHtml:`<div class="display">${shown}</div>`,
        options:[{ html:ST[SK[gap]].n, correct:true }].concat(wrong.map(i => ({ html:ST[SK[i]].n,
          fb:`${ST[SK[i]].n} is stage ${i + 1}, so it comes ${i < gap ? "earlier" : "later"} in the journey.` }))),
        workHtml:`<p>The gap is stage ${gap + 1}: <b>${ST[SK[gap]].n}</b>. ${ST[SK[gap]].p}</p>`,
        key:"Knowing the order lets you spot what a story plan is missing.",
        hint:"Look at the stages on each side of the gap. What must happen between them?" });
    } },
    { id:"next", skill:"stages", level:2, make(ctx){
      const i = Kit.unique(ctx, [...Array(11).keys()], x => "nx" + x), nx = i + 1;
      const opts = [{ html:ST[SK[nx]].n, correct:true }];
      if (i > 0) opts.push({ html:ST[SK[i - 1]].n, fb:`${ST[SK[i - 1]].n} comes just before ${ST[SK[i]].n}, not after it.` });
      for (const j of shuffle([...Array(12).keys()].filter(j => j !== i && j !== nx && j !== i - 1))) {
        if (opts.length >= 4) break;
        opts.push({ html:ST[SK[j]].n, fb:`${ST[SK[j]].n} is stage ${j + 1}; the stage after ${ST[SK[i]].n} is stage ${nx + 1}.` });
      }
      return Kit.mc({ promptHtml:`Which stage comes directly after <b>${ST[SK[i]].n}</b>?`, options:opts,
        workHtml:`<p>${ST[SK[i]].n} is stage ${i + 1}. Stage ${nx + 1} is <b>${ST[SK[nx]].n}</b>: ${ST[SK[nx]].p}</p>`,
        key:"Each stage sets up the next one.", hint:"What does the hero need after this moment?" });
    } },
    { id:"arch2", skill:"arch", level:2, make(ctx){ return archQ(Kit.unique(ctx, ARCH2)); } },
    { id:"spot2", skill:"spot", level:2, make(ctx){ return scenQ(Kit.unique(ctx, SCEN2)); } },
    { id:"myth2", skill:"myth", level:2, make(ctx){ return Q(Kit.unique(ctx, MYTH2), {
      key:"Ancient myths and modern stories use the same stages and archetypes.",
      hint:"Ignore the costumes and monsters. What job does this moment or character do?" }); } },
    { id:"alch2", skill:"alch", level:2, make(ctx){ return Q(Kit.unique(ctx, ALC2), {
      key:"In The Alchemist, characters and objects stand for ideas about following your Personal Legend.",
      hint:"How does this connect to Santiago's Personal Legend?" }); } },
    { id:"evid2", skill:"evid", level:2, make(ctx){ return eviQ(Kit.unique(ctx, EVI2)); } },
    /* Level 3 */
    { id:"order6", skill:"stages", level:3, make:orderGen(6) },
    { id:"spot3", skill:"spot", level:3, make(ctx){ return scenQ(Kit.unique(ctx, SCEN3)); } },
    { id:"myth3", skill:"myth", level:3, make(ctx){ return Q(Kit.unique(ctx, MYTH3), {
      key:"Compare stories by function: what each moment or character does in the journey.",
      hint:"Name the stage or archetype for A, then for B. Do they match?" }); } },
    { id:"alch3", skill:"alch", level:3, make(ctx){ return Q(Kit.unique(ctx, ALC3), {
      key:"A symbol's meaning comes from its role in Santiago's journey, not its literal use.",
      hint:"What does this suggest about the novel's big idea: following your Personal Legend?" }); } },
    { id:"evid3", skill:"evid", level:3, make(ctx){ return eviQ(Kit.unique(ctx, EVI3)); } },
    { id:"plan", skill:"stages", level:3, make(ctx){ return Q(Kit.unique(ctx, PLAN), {
      key:"When you design a Hero's Journey, every stage must do its job: risk, change and return.",
      hint:"Which stage is weak in this plan, and what is that stage's job?" }); } }
  ];
  registerTopic(T);
})();

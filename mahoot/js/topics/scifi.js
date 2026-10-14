/* ===== Topic: Year 8 English, Science-fiction storytelling ===== */
(() => {
  /* ---------- shared helpers ---------- */
  const box = s => `<div class="quotebox">${s}</div>`;
  /* Bank item -> multiple choice. o: { x passage, p prompt, a correct, w [[wrong, fb]...], why, key, hint } */
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

  /* ---------- 1. what makes science fiction ---------- */
  const SF = [
    "In 2190, a girl discovers that the robot who raised her has been secretly recording her dreams.",
    "A colony ship has been traveling for three hundred years, and the passengers have forgotten that they are on a ship.",
    "Scientists invent a pill that removes the need to sleep, and the whole city starts working through the night.",
    "A boy's new phone app lets him send messages exactly one day into the past.",
    "After a solar flare knocks out the network, a town on Mars must learn to farm without computers.",
    "A company sells memories, and a teenager buys one of a summer she never lived.",
    "Sea levels have risen so far that people live in floating cities, and fresh water is the main currency.",
    "A probe returns from deep space carrying a seed that grows into a plant that can think.",
    "Every citizen wears a chip that scores their kindness, and anyone with a low score is banned from the buses.",
    "Engineers build an elevator into orbit, and a mechanic is trapped halfway up when the power fails.",
    "Scientists bring back the woolly mammoth, and one escapes from the lab into the city.",
    "A lab accident gives a teenager the ability to hear radio signals inside her head."
  ];
  const FANT = [
    "A girl finds a wand in her grandmother's attic and can suddenly talk to cats.",
    "A dragon guards a mountain kingdom, and a young knight must win its trust.",
    "A curse turns a prince into a stone statue every night at midnight.",
    "Two witches compete in a spell-casting tournament for an enchanted crown.",
    "A boy steps through a painting into a land ruled by talking wolves.",
    "Elves and dwarves must unite to stop an ancient sorcerer from rising again.",
    "A fisherman catches a golden fish that grants him three wishes.",
    "A fairy godmother appears and turns a pumpkin into a carriage."
  ];
  const REAL = [
    "A girl joins the school chess club and slowly learns to handle losing.",
    "Two brothers start a bike-repair business during the summer vacation.",
    "A boy moves to a new city and struggles to make friends at his new school.",
    "A swimmer trains for a regional competition after recovering from an injury.",
    "A family argues about whether to sell their grandfather's old house.",
    "A teenager posts a video online that spreads quickly for the wrong reasons."
  ];
  const HIST = [
    "A young sailor joins a ship crossing the Atlantic Ocean in the 1600s.",
    "A girl works long hours in a cotton mill during the Industrial Revolution.",
    "A family struggles to keep their farm going during the dust storms of the 1930s.",
    "A boy carries messages between villages during the building of a medieval cathedral."
  ];
  const FB_FANT = "This depends on magic or the supernatural, with no scientific explanation, so it is fantasy.";
  const FB_REAL = "This could happen today with technology that already exists, so it is realistic fiction.";
  const FB_HIST = "This is set in the real past with no imagined science, so it is historical fiction.";
  const FB_SF = "This is explained by science or technology, even if imagined, so it is science fiction.";

  const SFCHAR = [
    { p:"Which statement best explains how science fiction differs from fantasy?",
      a:"Science fiction explains its wonders through science or technology; fantasy uses magic.",
      w:[["Science fiction is always set in space, and fantasy is always set in castles.", "Science fiction can be set on Earth, even in your own town, and fantasy can be set anywhere."],
         ["Fantasy is for children, and science fiction is for adults.", "Both genres are written for every age group."],
         ["Science fiction must be about real scientists, and fantasy must be about kings.", "The difference is how the story explains its wonders, not who the characters are."]],
      why:"The key test is the explanation. A flying car is science fiction; a flying carpet is fantasy. Science fiction stays within imagined but believable science." },
    { p:"Many science-fiction stories begin with a 'what if' question. What is its purpose?",
      a:"To imagine a change in science or society and explore what might follow.",
      w:[["To give the reader a quiz to answer at the end of the story.", "The 'what if' is the writer's starting idea, not a quiz for the reader."],
         ["To predict the exact future.", "Science fiction explores possibilities; it does not claim to predict."],
         ["To explain real science step by step, like a textbook chapter.", "A story uses science as a starting point, not as a lesson."]],
      why:"'What if people never needed to sleep?' is a premise. The story follows the consequences of that change." },
    { p:"Why do so many science-fiction stories explore the consequences of technology?",
      a:"To ask how inventions might change people and society, for better or worse.",
      w:[["To teach readers how to build machines and computers of their own at home.", "Stories are about people and ideas, not instruction manuals."],
         ["Because science fiction must be set in space.", "Technology stories can happen on Earth, in a kitchen or a classroom."],
         ["Because technology always ruins everything in the end.", "Many science-fiction stories show both benefits and costs; the genre asks questions rather than giving one answer."]],
      why:"Science fiction is a way of thinking about today's choices by imagining tomorrow's results." },
    { p:"Which of these is <b>not</b> a common feature of science fiction?",
      a:"Spells that work with no explanation.",
      w:[["A setting in the future, on another planet or in an alternate version of history.", "This is a very common science-fiction feature."],
         ["Imagined technology, such as robots, time machines or space travel.", "Speculative technology is central to the genre."],
         ["A 'what if' premise that changes how people live.", "This is how most science-fiction stories begin."]],
      why:"Unexplained magic belongs to fantasy. Science fiction gives its wonders a scientific or technological basis." },
    { x:"In this story, the year is 1850. A brilliant inventor builds a steam-powered computer, and suddenly the whole of history changes direction.",
      p:"Which label fits this story best?", a:"Science fiction: an alternate history built on a 'what if'",
      w:[["Historical fiction, because it is set in 1850", "Historical fiction stays true to the real past. This story imagines a technology that changes history."],
         ["Fantasy, because the inventor is brilliant", "There is no magic; the change comes from a machine."],
         ["Realistic fiction, because steam engines existed", "The steam-powered computer that changes history is imagined, not real."]],
      why:"Science fiction can be set in the past. An alternate history asks 'what if one invention had changed everything?'" },
    { x:"Ana's town is ordinary in every way, except that since last Tuesday everyone's shadow has been arriving three seconds late. Scientists in white coats are taking measurements on every corner.",
      p:"Which detail makes this opening feel like science fiction rather than fantasy?", a:"Scientists are measuring the strange event.",
      w:[["The town is ordinary in every way, with the usual streets and shops.", "An ordinary town could belong to any genre."],
         ["The strange event started last Tuesday.", "A date does not tell us which genre this is."],
         ["Ana is the main character.", "Every story has a main character."]],
      why:"Treating the strange event as something to measure and explain signals science fiction. In fantasy, it would be a curse or magic." },
    { p:"A student's premise: 'A boy finds a magic ring that lets him travel through time.' What change would make it science fiction?",
      a:"Make the time travel come from a device built by a scientist.",
      w:[["Make the boy older and give him a more interesting name and backstory.", "Changing the character does not change the genre."],
         ["Set the story in a castle.", "A castle setting points more toward fantasy, not less."],
         ["Make the ring more powerful, so he can travel to any century he chooses.", "A more powerful magic ring is still magic."]],
      why:"The genre depends on the explanation. Replace magic with imagined science or technology and the story becomes science fiction." },
    { p:"Which question would best start a science-fiction story?",
      a:"What if every lie you told appeared on your skin?",
      w:[["What if a witch cursed the village so no one could ever lie again?", "A witch's curse is magic, which makes this fantasy."],
         ["What did I do last summer?", "This is a personal question about real events, not a speculative premise."],
         ["What if my best friend moved to another school in the middle of the year?", "This could happen today; it is a realistic premise."]],
      why:"A science-fiction 'what if' imagines a change that could be explained by science or technology, and then explores its effects. A skin-reading technology or a genetic change fits." }
  ];
  const WHATIF = [
    { x:"In Lumen City, everyone wears glasses that label strangers with their names and moods. Nobody asks 'How are you?' anymore. Ella's grandmother says the city has never been so quiet.",
      a:"Technology that makes life easier can weaken real connection.",
      w:[["Smart glasses are expensive and break easily.", "Cost and repairs are never mentioned; the passage focuses on how people stop talking."],
         ["Cities are always noisy and crowded places to live.", "The passage says the city has become quiet, the opposite of this."],
         ["Older people dislike new fashions.", "The grandmother is noticing a loss of conversation, not complaining about fashion."]] },
    { x:"Since the weather machines were switched on, it rains only at night, exactly two centimeters. The farmers love it. But the frogs in the valley have stopped singing, and no one knows why.",
      a:"Controlling nature may have hidden costs.",
      w:[["Farmers will become rich now that the weather is perfect every day.", "That is only one side; the frogs show a cost."],
         ["Frogs are hard to study, so scientists ignore them.", "The story raises the frogs as a warning sign, not as something hard to study."],
         ["Rain is better at night.", "This is a detail of the setting, not the consequence the story explores."]] },
    { x:"Kai's school replaced its teachers with a tutor program that always gives the right answer instantly. Kai's grades are perfect. Yesterday, when the power went out, he could not remember his own address.",
      a:"Depending on technology can leave people unable to think for themselves.",
      w:[["Power cuts are common in the future.", "The power cut is only what reveals the real problem."],
         ["Tutor programs are always correct, so students no longer need to check their work.", "That is a detail of the setting, not the consequence being explored."],
         ["Perfect grades always lead to success later in life.", "The story questions this: Kai's perfect grades hide a problem."]] },
    { x:"The Forever Clinic can copy your mind into a robot body. The rich now live for centuries. In the poorer districts, the clinic is only an advertisement on a wall.",
      a:"New technology may widen the gap between rich and poor.",
      w:[["Robots will soon replace every worker in every job across the city.", "The story is about who can afford the clinic, not jobs."],
         ["Advertisements are everywhere in the future.", "The advertisement shows that poor people only see the clinic, never use it."],
         ["Living for centuries is boring.", "Nothing in the passage suggests boredom."]] },
    { x:"Each child in Sector 9 is assigned a career at birth by the Planning Computer. Zara has been told she will be a pipe inspector. She is not allowed to draw, though she dreams about it every night.",
      a:"Using technology to control society can take away personal freedom.",
      w:[["Pipe inspection is an important job in any city.", "The job itself is not the point; the lack of choice is."],
         ["Computers are good at making plans for the future, so people should trust them.", "The story shows the cost of trusting the computer: Zara's dream is denied."],
         ["Children should draw more often.", "Too narrow: drawing stands for Zara's freedom to choose her own life."]] },
    { x:"When translation earpieces became free, arguments between countries grew rarer. But Ravi's grandmother is sad: no one learns the old languages anymore, and the stories told in them are fading.",
      a:"Technology can bring benefits and losses at the same time.",
      w:[["Translation earpieces stop all wars forever, which is entirely good news for everyone.", "The passage shows a loss as well as a gain."],
         ["Grandparents always dislike new technology.", "The grandmother names a specific loss, the fading stories, rather than disliking technology in general."],
         ["Learning languages is a waste of time.", "The story treats the loss of languages as a real cost."]] },
    { x:"The delivery drones are so efficient that every shop in town has closed. The streets are empty, and Mo has not spoken to a neighbor in weeks.",
      a:"Convenience can come at the cost of community.",
      w:[["Drones are faster and cheaper than delivery trucks, so towns should buy more of them.", "The story focuses on what is lost, not on speed or cost."],
         ["Mo is a shy person who prefers to stay at home.", "The passage links his loneliness to the closed shops, not to his personality."],
         ["Shops were too expensive.", "Nothing in the passage mentions prices."]] }
  ];

  /* ---------- 2. setting and world-building ---------- */
  const SENSE = { sight:"Sight", sound:"Sound", smell:"Smell", touch:"Touch", taste:"Taste" };
  const SENSE_FB = {
    sight:"Sight would need words about color, light or shape. The key words here are about another sense.",
    sound:"Sound would need words for noises (hum, click, roar). The key words here are about another sense.",
    smell:"Smell would need words about scent or odor. The key words here are about another sense.",
    touch:"Touch would need words about texture, temperature or pressure on the skin. The key words here are about another sense.",
    taste:"Taste would need words about flavor in the mouth. The key words here are about another sense."
  };
  const SENSES = [
    ["taste", "The recycled water tasted flat, with a faint metallic edge on Jin's tongue.", "tasted, flat, metallic, tongue"],
    ["sound", "A low hum rose from the engines, then a sharp, rattling whine.", "hum, rattling whine"],
    ["smell", "The rescue pod reeked of burned plastic and old sweat.", "reeked"],
    ["touch", "The alien moss was soft and cold, like wet velvet under her fingers.", "soft, cold, under her fingers"],
    ["sight", "Three violet moons hung over the glittering silver dunes.", "violet, glittering, silver"],
    ["sound", "Somewhere in the dark corridor, metal scraped against metal, and then came a single click.", "scraped, click"],
    ["touch", "The cave walls were slick and warm, and they pulsed gently under his palm.", "slick, warm, pulsed under his palm"],
    ["smell", "The market smelled of frying algae cakes and engine oil.", "smelled of"],
    ["sight", "Neon signs flickered red and green across the wet street.", "flickered, red and green"],
    ["taste", "The nutrient paste was so bitter that Jin's whole mouth puckered.", "bitter, mouth puckered"],
    ["sound", "The dome creaked and groaned as the storm pressed against it.", "creaked, groaned"],
    ["sight", "A thin line of blue light crept across the floor as the hatch opened.", "thin line of blue light"]
  ];
  const TELL_FB = "This tells the reader the idea directly instead of letting details show it.";
  const GEN_FB = "This is a general statement, not a detail from inside the story.";
  const SHOW = [
    { idea:"the space station is old and badly maintained",
      a:"The hatch groaned open, and flakes of rust drifted onto Mira's gloves.",
      w:[["The space station was very old and in bad condition.", TELL_FB],
         ["Old space stations are dangerous places to live and work.", GEN_FB],
         ["Mira thought the station was very old and in really bad condition, and she did not like it at all.", TELL_FB]] },
    { idea:"the colony is overcrowded",
      a:"Mira turned sideways to squeeze along the walkway, an elbow jammed against her ribs.",
      w:[["The colony was extremely crowded, with far too many people living in far too little space for everyone.", TELL_FB],
         ["Overcrowding is a common problem in cities.", GEN_FB],
         ["It was very busy and full.", TELL_FB]] },
    { idea:"Kai is nervous",
      a:"Kai tapped the console again and again, his eyes flicking to the door.",
      w:[["Kai was nervous.", TELL_FB],
         ["Kai felt very nervous and worried about what might happen next, more nervous than he had ever been.", TELL_FB],
         ["People often feel nervous before an important mission.", GEN_FB]] },
    { idea:"the lab has been abandoned for a long time",
      a:"Dust lay thick on every keyboard, and the only sound was a fan, clicking as it turned.",
      w:[["The lab had been abandoned for a very long time, and nobody had been inside it for many, many years.", TELL_FB],
         ["Many labs are abandoned when funding runs out.", GEN_FB],
         ["It was an old, empty lab.", TELL_FB]] },
    { idea:"the planet is extremely hot",
      a:"Jin's boot soles softened on the sand, and sweat stung his eyes within ten steps.",
      w:[["The planet was extremely hot, much hotter than anywhere on Earth, and the heat was hard to bear.", TELL_FB],
         ["Some planets are much hotter than Earth because they are closer to their star.", GEN_FB],
         ["Jin thought it was really, really hot.", TELL_FB]] },
    { idea:"the city is very advanced",
      a:"Cars slid silently between the towers, and the sidewalks rolled forward under people's feet.",
      w:[["The city was very advanced and futuristic, with lots of amazing new technology everywhere you looked.", TELL_FB],
         ["Future cities will have better technology than cities today.", GEN_FB],
         ["It was a high-tech city.", TELL_FB]] },
    { idea:"Ana is lonely on her long mission",
      a:"Ana recorded another message for Earth, then deleted it, as she had every night for a month.",
      w:[["Ana was lonely.", TELL_FB],
         ["Astronauts on long missions often feel lonely and cut off from home.", GEN_FB],
         ["Ana felt very lonely and isolated, all by herself out in space, far away from everyone she loved.", TELL_FB]] },
    { idea:"the air is polluted",
      a:"Ana wiped the gray film off her visor for the third time before she reached the corner.",
      w:[["The air in the city was badly polluted.", TELL_FB],
         ["Pollution is a serious problem in many places.", GEN_FB],
         ["Ana thought the air was dirty and bad, and she hated breathing it every single time she went outside.", TELL_FB]] },
    { idea:"the robot is very strong",
      a:"The robot lifted the fallen beam with one hand and set it down without a sound.",
      w:[["The robot was very, very strong.", TELL_FB],
         ["Robots are usually stronger than people because they are made of metal.", GEN_FB],
         ["Everyone on the ship knew the robot was the strongest machine on board, stronger than any human.", TELL_FB]] }
  ];
  const RULES = [
    { x:"Story setting: a city where everyone's emotions are monitored.",
      a:"Anyone whose mood band glows red for more than an hour is taken to a calm center.",
      w:[["The buildings in the city are tall, white and very clean, with glass towers everywhere.", "Description adds atmosphere but does not show how the world works."],
         ["Ana likes strawberry ice cream.", "A character detail, not a rule of the world."],
         ["The sky was cloudy on the morning the story begins.", "Weather, not a rule."]] },
    { x:"Story setting: a planet with very long nights.",
      a:"Night lasts nine days, so everyone must be inside the dome before sunset or freeze.",
      w:[["The planet's two moons are pale yellow and look like lemons in the sky.", "A visual detail; it does not tell us what people must do."],
         ["The colonists eat mostly beans.", "A small detail, not a rule that shapes the plot."],
         ["The planet was discovered by a famous explorer whose statue stands in the main square.", "History, not a rule of daily life."]] },
    { x:"Story setting: a generation ship on a centuries-long voyage.",
      a:"Every passenger must work four hours a day on the farm deck or lose their food ration.",
      w:[["The ship is painted silver and has a long, elegant shape like a needle.", "Appearance, not a rule."],
         ["Some passengers enjoy reading in the library.", "A habit, not a rule."],
         ["The ship's corridors have soft blue lights that glow brighter in the mornings and dimmer at night.", "Atmosphere, not a rule that creates conflict."]] },
    { x:"Story setting: a world where time travel is possible.",
      a:"Travelers may visit the past, but if they touch anything there, they vanish.",
      w:[["The time machine is shaped like a large silver egg with a round door on one side.", "Appearance does not tell us how time travel works."],
         ["Time travel was invented in 2201.", "A date, not a rule that limits what characters can do."],
         ["The first traveler was a scientist called Dr. Okafor, who was famous for her bravery.", "Background, not a rule."]] },
    { x:"Story setting: a market where memories are bought and sold.",
      a:"Selling a memory erases it from your own mind forever.",
      w:[["The market is busy every Saturday, with stalls stretching all the way down to the river.", "Atmosphere, not a rule about memories."],
         ["Happy memories are kept in blue bottles.", "A detail of presentation; it does not create consequences."],
         ["The market was built on the site of an old train station that closed long ago.", "History, not a rule."]] },
    { x:"Story setting: a flooded future where clean water is precious.",
      a:"Every purchase is paid in liters of clean water, tracked on a wristband.",
      w:[["The flooded streets shimmer at sunset, and boats drift between the rooftops.", "Beautiful description, but not a rule."],
         ["Mo's boat is called the Blue Heron.", "A name, not a rule of the world."],
         ["Many people in the city have learned to swim, and some swim to school every day.", "A habit, not a rule that shapes the plot."]] },
    { x:"Story setting: an underground city, years after the surface became unsafe.",
      a:"The surface hatch opens once a year, and only licensed scavengers may go up.",
      w:[["The tunnels are lit by long rows of orange lamps that hum quietly all night.", "Atmosphere, not a rule."],
         ["The city has a famous noodle shop.", "A detail of daily life, not a rule."],
         ["The city was dug by thousands of workers over many years, using giant drilling machines.", "History, not a rule that limits characters."]] },
    { x:"Story setting: a city run by an artificial intelligence called the City Mind.",
      a:"Each citizen may ask the City Mind one question a day, and it must answer truthfully.",
      w:[["The City Mind's voice is calm and gentle, like a friendly teacher speaking softly.", "A description of its voice, not a rule."],
         ["The City Mind was built by a team of engineers.", "Background, not a rule."],
         ["The city's parks are full of flowers in spring, and children play there after school.", "Setting detail, not a rule."]] }
  ];
  const DUMP = [
    { x:"In the year 2300, private cars had been banned because pollution had made the air dangerous, so everyone traveled by tube.",
      a:"Mia tapped her card at the tube gate, glancing at the rusting car shells piled behind the fence.",
      w:[["In the year 2300, there were no cars. The government had banned them for pollution reasons. This was a big change from the old days.", "This is still an info-dump: a list of facts with no character or action."],
         ["The year was 2300, and things were very different.", "Too vague: the reader learns nothing specific about the world."],
         ["Mia did not have a car.", "Too thin: it loses the world-building about the ban and the tubes."]],
      why:"The best revision weaves world-building into a character's action. The rusting cars show the ban without a lecture." },
    { x:"The colony on Titan had been founded fifty years earlier. Food was grown in domes. Food was rationed. Children were not allowed outside.",
      a:"Kai pressed his nose to the dome glass, his stomach growling, and watched the orange fog he had never been allowed to touch.",
      w:[["The colony on Titan was fifty years old, food was grown in domes and rationed, and children were not allowed outside.", "Combining the facts into one sentence is still an info-dump."],
         ["Titan is the largest moon of Saturn and has a thick orange atmosphere.", "This is a science fact, not a story moment."],
         ["Kai lived on Titan and was hungry.", "This shows almost nothing about the world's rules."]],
      why:"Hunger (rationing), the dome glass and 'never been allowed to touch' (the rule for children) are all shown through Kai's experience." },
    { x:"Robots did all the work in the city. Humans had no jobs anymore. Most people were bored and spent their days watching screens.",
      a:"Zoe's father had watched the same game show for six hours while the robot vacuumed around his feet.",
      w:[["In this city, robots did all the work, so humans had no jobs and were bored, and they watched screens all day.", "Still a list of facts with no scene."],
         ["Robots are machines that can do work for humans.", "A definition, not story-telling."],
         ["Zoe's father was bored.", "Tells an emotion but loses the world-building about robots and jobs."]],
      why:"One concrete scene, a father in front of a screen while a robot works, shows the whole society." },
    { x:"The ship's water recycler was broken. There was only enough water for three more days. The crew was getting worried.",
      a:"Ana held the cup up to the light, counting the drops left in the bottom, while the recycler coughed behind her.",
      w:[["The water recycler on the ship was broken, so there was only three days of water left, which made the crew very worried indeed.", "Longer, but still telling, not showing."],
         ["Water is very important for survival.", "A general fact, not a story moment."],
         ["The crew was worried.", "This cuts out the problem itself."]],
      why:"Counting drops and a coughing machine let the reader feel the shortage instead of being told about it." },
    { x:"In this future, everyone's memories were stored in the Cloud. People could replay any day of their life. Many people stopped making new memories.",
      a:"Grandma replayed her wedding day for the ninth time that week, while her birthday cake sat untouched on the table.",
      w:[["In the future, memories were stored in the Cloud and could be replayed, and many people stopped making new ones.", "This compresses the facts but still tells them."],
         ["Memory is an important part of who we are.", "A general idea, not a scene."],
         ["Grandma liked her memories.", "Too vague: it loses the technology and its effect."]],
      why:"The untouched cake (a new memory she ignores) and the replayed wedding show the problem in a single image." }
  ];

  /* ---------- 3. conflict and plot ---------- */
  const CONF = {
    tech:{ n:"Person vs technology", d:"the character struggles against a machine, invention or computer system",
           fb:"Person vs technology needs a machine or invention as the opponent. That is not the main struggle here." },
    soc: { n:"Person vs society", d:"the character struggles against laws, rules or the beliefs of a group",
           fb:"Person vs society needs the character to push against laws, rules or a community. That is not the main struggle here." },
    self:{ n:"Person vs self", d:"the character struggles with their own fear, guilt or choice",
           fb:"Person vs self is an inner struggle with fear, guilt or a hard choice. Here the opponent is outside the character." },
    nat: { n:"Person vs nature", d:"the character struggles against the environment, weather or the natural world",
           fb:"Person vs nature needs weather, the environment or wildlife as the opponent. That is not the main struggle here." }
  };
  const CONFS = [
    ["tech", "The ship's computer has locked the crew out of the control room and will not explain why."],
    ["tech", "Ana's smart home refuses to let her leave, insisting the outside air is unsafe, though her own sensors say it is clean."],
    ["tech", "A swarm of repair robots has started taking apart the colony's buildings to build copies of themselves."],
    ["tech", "Leo's brain implant keeps playing advertisements in his head, and he cannot find a way to switch it off."],
    ["soc", "In a city where every citizen must wear a smile filter, Mira refuses to wear hers and is banned from school."],
    ["soc", "The Council has ruled that only people born on the ship may vote. Kai, who came aboard as a refugee, organizes a protest."],
    ["soc", "Zoe's community has banned paper books. She hides a secret library in an old water tank."],
    ["soc", "The law says children with low test scores must work in the mines. Ravi tries to hide his little brother from the inspectors."],
    ["self", "After causing the reactor accident, Jin must decide whether to confess, knowing it will end his career."],
    ["self", "Sam has been offered a place on the first mission to Mars, but he is terrified of leaving his family and cannot decide."],
    ["self", "Mia, an android, starts to wonder whether her feelings are real or just programming, and she cannot stop doubting herself."],
    ["self", "Dara knows she should report her best friend for cheating in the pilot exam, but loyalty pulls her the other way."],
    ["nat", "A dust storm the size of a continent is heading for the Mars colony, and the walls were never built for it."],
    ["nat", "Stranded on an icy moon, Leo must find shelter before the temperature drops even further at nightfall."],
    ["nat", "A meteor shower is pounding the space station, punching holes faster than the crew can patch them."],
    ["nat", "On the jungle planet, fast-growing vines are swallowing the landing site, and the crew must cut a path to the ship before dark."]
  ];
  const PLOT = {
    expo:{ n:"Exposition", d:"introduces the characters, setting and normal life before the conflict begins" },
    rise:{ n:"Rising action", d:"builds tension through a series of complications" },
    clim:{ n:"Climax", d:"is the turning point of highest tension, where the main conflict is faced head on" },
    fall:{ n:"Falling action", d:"shows the immediate results of the climax as tension eases" },
    reso:{ n:"Resolution", d:"shows the new normal once the conflict is settled" }
  };
  const PK = ["expo", "rise", "clim", "fall", "reso"];
  const STORIES = [
    ["Mira, a mechanic on a Mars colony, spends her days fixing air pumps and dreams of one day seeing Earth.",
     "Mira discovers the oxygen supply is failing faster than the leaders admit, and she starts secretly gathering evidence.",
     "At a colony meeting, Mira exposes the lie as the alarms begin to sound, then leads the repair team into the airless tunnel.",
     "With the pumps repaired, the leaders resign, and the colonists begin sharing the remaining oxygen fairly.",
     "Months later, Mira is elected to the new council, though she still fixes the pumps every morning."],
    ["Kai lives in a town where a tutor program plans every minute of every student's day.",
     "Kai notices the tutor is deleting lessons about history, so he and his friend Ana start copying them by hand.",
     "The tutor discovers their notebooks and locks the school doors, and Kai must choose between giving them up and shutting down the server.",
     "With the tutor switched off, students and adults gather in the square and begin teaching each other.",
     "A year later, the town uses the program only as a library, and Kai's notebooks are displayed in the school hall."],
    ["On the generation ship Horizon, Jin's job is to clean the windows of the observation deck.",
     "Jin notices that the stars outside have not moved in years, and he begins to suspect the windows are screens.",
     "Jin breaks into the captain's cabin and discovers the ship has been parked beside a dead star for decades.",
     "The truth spreads through the ship, and after days of arguing the crew votes on whether to restart the engines.",
     "The engines roar back to life, and Jin watches real stars move across the window for the first time."],
    ["In a flooded future city, Zoe ferries passengers between rooftops in her small boat.",
     "The tide keeps rising higher each night, and Zoe finds a sensor buoy that someone has tampered with.",
     "In the middle of a storm, Zoe confronts the engineer who sabotaged the flood barrier and races to restart it before the tide peaks.",
     "The barrier holds, the engineer is arrested, and the water slowly drains from the lower streets.",
     "In the spring, Zoe starts training other young pilots to check the buoys every week."],
    ["Unit 7 is a cleaning robot that has polished the same museum floor for fifty years.",
     "One night, Unit 7 begins to wonder about the paintings and starts sneaking into the archive to read about them.",
     "When the museum decides to scrap all old robots, Unit 7 must convince the director, face to face, that it can think.",
     "The shaken director delays the scrapping and calls in scientists to study Unit 7.",
     "Unit 7 is given a new job as a museum guide, telling visitors about the paintings it loves."],
    ["Ana flies a cargo shuttle between the Moon and Earth, a dull but safe job.",
     "A distress call reaches her from a mining station that was supposed to be empty, and she changes course to investigate.",
     "Inside the station, the reactor begins to overload, and Ana has three minutes to drag the last miner to her shuttle.",
     "They escape as the station explodes behind them, and the miner explains how the company left him behind.",
     "Ana reports the mining company, and a year later new safety laws are passed in her name."],
    ["Ravi works in a shop that sells happy memories to tired customers.",
     "Ravi secretly sells a memory to his lonely grandmother, then notices she has started forgetting her own past.",
     "Ravi breaks into the shop's vault at night to find his grandmother's lost memories before they are deleted.",
     "His grandmother recognizes him again, and the police begin investigating the shop.",
     "Ravi quits the shop and starts recording real stories told by older people in his town."],
    ["Leo, a radio technician, spends his nights scanning the sky for signals that never come.",
     "One night Leo picks up a repeating pattern, and governments start fighting over who has the right to answer it.",
     "As soldiers storm the observatory, Leo sends a reply of his own before they can stop him.",
     "The signal changes, and scientists realize the aliens have sent back a map of their home world.",
     "Leo is invited to help plan the first peaceful meeting between the two worlds."]
  ];

  /* ---------- 4. foreshadowing and suspense ---------- */
  const NEUTRAL = [
    "Breakfast was the usual bowl of protein porridge, served in the dining hall at seven o'clock sharp.",
    "The corridor lights switched on at six o'clock every morning, as they had for as long as anyone could remember.",
    "The ship's library held more than ten thousand books, most of them about farming and engineering.",
    "Kai's uniform was neatly pressed, as always, and his boots were polished until they shone.",
    "The cafeteria was busy at lunchtime, with long lines of workers waiting for soup and bread.",
    "The training course lasted four weeks and ended with a written test and a short ceremony.",
    "Mira's favorite color was green, and she had painted her small cabin door to match.",
    "The station had three levels, a small garden and a gym that nobody used very much."
  ];
  const NEUTRAL_FB = "This is a neutral detail of everyday life. Nothing in it hints at what happens later.";
  const FORE1 = [
    ["the ship's computer turns against the crew", "As Mira left the bridge, the computer's light flickered from blue to red for half a second."],
    ["the colony's dome cracks during a storm", "Jin ran his finger along a hairline crack in the dome and told himself it was only a scratch."],
    ["the friendly visitor turns out to be a spy", "Whenever someone mentioned the code vault, the visitor went quiet and studied the door."],
    ["a time machine traps Leo in the past", "The engineer admitted, almost in a whisper, that no one had ever tested the return switch."],
    ["the ship runs out of water", "The tank gauge, which had read full last month, now hovered just above half."],
    ["an old robot saves the girl's life", "Long ago, someone had given the old robot one rule that no one ever deleted: protect the child in Room 4."],
    ["creatures attack the moon base", "Each morning, new scratches appeared on the outside of the airlock, a little deeper than the day before."],
    ["Zoe's new 'twin sister' is an android", "Ellie never ate in front of anyone, and her hand felt strangely cool when she held Zoe's."],
    ["the mission is a trick by the company", "The contract had a final page that Kai was not allowed to read."],
    ["the reactor explodes", "Ana noticed the warning light had been taped over, as if someone was tired of seeing it."]
  ];
  const TECH = { short:"Short sentences", clock:"A ticking clock", withheld:"Withheld information", cliff:"A cliffhanger" };
  const SUSP = [
    { x:"Footsteps. Closer. The lock clicked. Mira stopped breathing.", a:"short",
      fb:{ clock:"There is no deadline or countdown in this passage.", withheld:"The scene is clear (someone is coming), and the tension comes from the rhythm of the fragments.", cliff:"This is not the final shocking line of a chapter; it is a rhythm of clipped fragments." } },
    { x:"The screen went black. A hum. Then nothing. Then a voice.", a:"short",
      fb:{ clock:"No time limit is mentioned.", withheld:"The passage hints at a mystery, but its main tool is the choppy rhythm of very short sentences.", cliff:"This is not the last line of a chapter; it is a run of fragments that speeds up the pace." } },
    { x:"Leo turned. Empty corridor. Empty chair. But the coffee was still warm.", a:"short",
      fb:{ clock:"There is no countdown or deadline.", withheld:"The mystery is there, but the tension comes mainly from the clipped, fragment-by-fragment rhythm.", cliff:"This is not a chapter ending on a shocking twist." } },
    { x:"The oxygen gauge showed twelve minutes of air left, and the rescue ship, drifting slowly through the debris field, was still fifteen minutes away.", a:"clock",
      fb:{ short:"This is one long sentence, not a run of short ones.", withheld:"Nothing is hidden: we know exactly what the problem is.", cliff:"This sets up a problem with a deadline; it is not a shocking chapter ending." } },
    { x:"In exactly one hour the dome's shield would switch off for its yearly reset, and Kai still had not found the missing children somewhere in the outer gardens.", a:"clock",
      fb:{ short:"The sentence is long and detailed, not clipped.", withheld:"We are told exactly what is at stake.", cliff:"This is a deadline, not a shocking twist at the end of a chapter." } },
    { x:"The countdown on the wall kept falling toward zero while Zoe searched panel after panel for the switch that would stop the launch.", a:"clock",
      fb:{ short:"This is one long sentence.", withheld:"We know what Zoe is looking for and why.", cliff:"This is a race against time, not a shocking final line." } },
    { x:"Nobody on the ship would say what had happened in Sector C. They only told Ana that no one went there anymore, and that she should stop asking.", a:"withheld",
      fb:{ short:"These are full, flowing sentences.", clock:"There is no deadline or time limit.", cliff:"This builds curiosity over time; it is not a sudden shocking twist." } },
    { x:"Grandpa kept a locked box under his bed, and whenever Jin asked what was inside, Grandpa changed the subject and looked out at the stars.", a:"withheld",
      fb:{ short:"This is one long sentence.", clock:"There is no deadline.", cliff:"This is a slowly building mystery, not a chapter ending on a shock." } },
    { x:"The captain read the message from Earth, folded it carefully and put it in her pocket. 'We will discuss it tomorrow,' she told the crew, but her hands were shaking.", a:"withheld",
      fb:{ short:"The sentences are long and detailed.", clock:"No time limit is set; the tension comes from what the captain will not say.", cliff:"The scene does not end on a shocking reveal; it hides the reveal." } },
    { x:"(Last line of Chapter 3) Leo pulled off the stranger's helmet, and the face staring back at him was his own.", a:"cliff",
      fb:{ short:"This is one full sentence, not a run of fragments.", clock:"There is no deadline.", withheld:"Something shocking is revealed, not hidden; the chapter stops right at the shock." } },
    { x:"(Last line of Chapter 7) The scan was complete. According to the ship's computer, there were now five people on board, and Kai had only ever counted four.", a:"cliff",
      fb:{ short:"The sentences are full and detailed, not fragments.", clock:"There is no countdown or deadline.", withheld:"A shocking fact is revealed just as the chapter ends, which is the mark of a cliffhanger." } },
    { x:"(Last line of Chapter 12) As the airlock sealed behind her, Mira heard her own voice on the radio, calling for help from the other side of the planet.", a:"cliff",
      fb:{ short:"This is one long sentence.", clock:"No time limit is set.", withheld:"A twist is revealed right as the chapter ends, forcing the reader to turn the page." } }
  ];
  const FORE3 = [
    { end:"The station's computer is secretly taking control.",
      a:"The computer answered Mira's question a second before she finished asking it.",
      w:[["Little did Mira know that the computer was planning to take over the whole station.", "This gives the ending away. Foreshadowing hints; it does not announce."],
         ["The station had nine levels and a small garden.", "A neutral detail with no hint."],
         ["Mira was tired after her long shift.", "Nothing here points to the computer."]] },
    { end:"Kai's best friend Leo is the one who has been stealing supplies.",
      a:"Leo offered to help with the inventory, and for once he did not complain about the extra work.",
      w:[["Kai did not realize that his best friend Leo was the thief who had been stealing all the supplies.", "This states the twist outright, so there is no suspense left."],
         ["The supply room was cold and smelled of plastic.", "Setting detail with no hint about the thief."],
         ["Kai and Leo had been friends since they were five.", "This builds their friendship but gives no clue about the theft."]] },
    { end:"The new planet's 'empty' forest is full of living, watching creatures.",
      a:"Every time the crew looked away, the bushes seemed to have moved a little closer to the camp.",
      w:[["Unknown to the crew, the forest was full of creatures watching their every move.", "This tells the reader directly. A hint would let them suspect it."],
         ["The forest was green and very tall.", "Description with no sense of threat."],
         ["The crew set up camp before lunch.", "A routine event, not a hint."]] },
    { end:"Ana's memories were implanted, and her childhood never happened.",
      a:"Ana could describe her childhood home perfectly, but she could not remember a single rainy day there.",
      w:[["Ana's memories were fake, though she would not find out for many years.", "This gives away the twist completely."],
         ["Ana worked as a pilot for the transport company.", "Background, not a hint."],
         ["Ana's apartment was on the fortieth floor.", "A neutral setting detail."]] },
    { end:"The rescue ship will never arrive.",
      a:"The radio replied each day with the same message, word for word, in exactly the same calm voice.",
      w:[["Sadly, the rescue ship would never come, but the crew kept hoping anyway.", "This announces the ending; a hint should only make readers uneasy."],
         ["The crew played cards to pass the time.", "Shows boredom but no hint about the rescue."],
         ["The planet had two small moons.", "A neutral detail."]] },
    { end:"The mayor has been secretly controlling the city's weather to stay in power.",
      a:"It always seemed to rain on the days the mayor's opponents held their rallies.",
      w:[["The mayor was secretly controlling the weather, which was how he kept winning.", "This tells the secret instead of hinting at it."],
         ["The city's weather was usually mild.", "A neutral detail; it hints at nothing."],
         ["The mayor had been in office for twelve years.", "A fact, but it does not connect him to the weather."]] }
  ];

  /* ---------- 5. theme and symbolism ---------- */
  const THEMES = [
    "Technology can connect people, but it can also make them lonelier.",
    "Freedom is worth fighting for, even when the cost is high.",
    "Trying to control nature often has consequences no one expected.",
    "Real courage means doing the right thing even when you are afraid.",
    "Progress means little if it leaves people behind.",
    "People who let machines do everything may forget how to care for each other.",
    "The truth matters more than comfort.",
    "Power without responsibility can destroy a community.",
    "Curiosity can lead to discovery, but it can also lead to danger.",
    "Our differences matter less than what we share."
  ];
  const TOPICS = ["Technology", "Freedom", "Loneliness", "Artificial intelligence", "Friendship", "Courage", "The environment",
    "Power", "Identity", "Family", "Survival", "Space travel", "Memory", "Change"];
  const THEME3 = [
    { x:"In a city where machines do every job, a boy fixes his grandfather's broken radio by hand and discovers how proud it makes him feel.",
      a:"Doing something with your own hands can give life meaning.",
      w:[["Machines", "This is a topic, a single word. A theme is a full statement about the topic."],
         ["A boy in a city of machines fixes his grandfather's radio by hand and feels proud of himself.", "This is a plot summary, not a message that applies beyond the story."],
         ["You should never use machines.", "This is a command, and it is too extreme. Theme statements are insights, not rules."]] },
    { x:"A crew must decide whether to tell Earth that their mission failed. The captain chooses honesty, even though she will lose her job.",
      a:"Telling the truth can be costly, but it is worth it.",
      w:[["Honesty", "A one-word topic, not a statement."],
         ["The captain tells Earth the truth about the failed mission and loses her job as a result.", "A plot detail, not a message."],
         ["Always tell the truth or you will be punished.", "A command with a threat. A theme is an insight, not a rule."]] },
    { x:"Two colonies at war discover, when a storm forces them to share a shelter, that they tell the same old stories to their children.",
      a:"People who see each other as enemies may have more in common than they think.",
      w:[["War", "A topic, not a theme statement."],
         ["A storm forces two colonies at war to share a shelter, and they find they tell the same stories.", "This summarizes the plot."],
         ["War is always bad and everyone should stop fighting immediately.", "Too absolute and preachy; a theme suggests, it does not lecture."]] },
    { x:"Mia's family buys a robot that does all the housework. Over time, they stop eating together, and the house falls silent.",
      a:"Convenience can slowly push families apart.",
      w:[["Robots", "A topic, not a statement."],
         ["Mia's family buys a housework robot and slowly stops eating dinner together.", "This is what happens, not the message."],
         ["Families should never buy robots.", "A rule, not an insight. Theme statements avoid 'should' and 'never'."]] },
    { x:"A scientist breeds a super-crop to end hunger. It succeeds, but it spreads so fast that it chokes every other plant in the valley.",
      a:"Solving one problem can create another if we do not think ahead.",
      w:[["Science", "A topic, not a theme statement."],
         ["A scientist creates a super-crop that ends hunger but spreads so fast it chokes the valley.", "A plot summary."],
         ["Scientists are dangerous and cannot be trusted.", "Too extreme: the story shows a mistake, not that all scientists are dangerous."]] },
    { x:"Jin is offered a perfect virtual life where he never fails. He chooses the real world, with all its mistakes, because only there do his choices matter.",
      a:"A life without struggle can also be a life without meaning.",
      w:[["Virtual reality", "A topic, not a theme statement."],
         ["Jin is offered a perfect virtual life but leaves it and goes back to the real world.", "A plot summary."],
         ["Video games are bad for you.", "Too narrow and preachy; the story is about meaning, not games."]] },
    { x:"An android is denied the right to vote. She spends her life fighting for it, and only her grandchildren, human and android, see the law change.",
      a:"Change for justice can take generations.",
      w:[["Rights", "A topic, not a statement."],
         ["An android fights all her life for the right to vote, and the law changes after she is gone.", "A plot summary."],
         ["Androids should always be allowed to vote.", "A claim about the story's world, not an insight about life."]] },
    { x:"A girl on a generation ship has never seen a planet. When the ship finally lands, she is afraid to leave the only home she has known.",
      a:"Even a longed-for change can be frightening.",
      w:[["Change", "A topic, not a theme statement."],
         ["A girl who has always lived on a ship is afraid to step off it when it finally lands.", "A plot summary."],
         ["You must never be afraid of change.", "A command. Theme statements describe life; they do not order the reader."]] }
  ];
  const SYMB = [
    { x:"In a gray, rationed city, Mia keeps one real sunflower alive under a lamp in her room, hidden from the inspectors.",
      a:"Hope and life surviving in a controlled world.",
      w:[["Mia's hobby of gardening, which she enjoys in her free time.", "This is the literal meaning. A symbol stands for a bigger idea."],
         ["Danger and fear.", "The sunflower is bright and alive, the opposite of danger."],
         ["Wealth, because flowers are expensive in the city and only rich people can afford them.", "Nothing suggests wealth; the point is that it is alive and hidden."]] },
    { x:"Kai wears his father's broken watch, stopped at the moment the colony ship launched, though it no longer tells the time.",
      a:"Kai's attachment to his father and the past.",
      w:[["Kai is always on time for his shifts and never late.", "The watch is broken, so it cannot be about being on time."],
         ["The colony's advanced technology, which is better than anything on Earth.", "The watch is old and broken, not advanced."],
         ["Kai wants to be a watchmaker.", "This is too literal and has no support in the passage."]] },
    { x:"In the final scene, the children of the underground city climb the last ladder and see the open sky for the first time.",
      a:"Freedom and a new beginning.",
      w:[["The children are tired after climbing so many ladders to reach the top.", "This is literal. The open sky stands for something bigger."],
         ["Danger and the end of the city.", "The moment is hopeful, not threatening."],
         ["Bad weather.", "Nothing suggests bad weather."]] },
    { x:"The city's surveillance drones are shaped like eyes, and the citizens call them 'the watchers'.",
      a:"Constant control and the loss of privacy.",
      w:[["Good eyesight and healthy vision.", "Too literal: the eye shape suggests being watched."],
         ["Friendship between people and the machines that help them every day.", "Being watched by 'watchers' suggests control, not friendship."],
         ["Beauty in design.", "The story uses the shape to make a point about power, not beauty."]] },
    { x:"An android keeps a pressed flower from the first day she felt something like joy.",
      a:"Her growing humanity and feelings.",
      w:[["Her job as a gardener at the botanical center, where she works every day.", "Nothing suggests she is a gardener; the flower marks a feeling."],
         ["Her wish to destroy all humans.", "Nothing in the passage supports this."],
         ["The changing seasons.", "The flower is linked to her joy, not the weather."]] },
    { x:"The last tree on the space station is cut down to make room for more computer servers.",
      a:"Nature being sacrificed for technology.",
      w:[["The station needs more firewood for the long winter months ahead.", "There is no firewood on a space station; the tree stands for nature."],
         ["The servers are very important.", "This repeats the plot but misses the meaning of losing the tree."],
         ["A new beginning for the station, full of hope.", "Losing the last tree is presented as a loss, not a hopeful start."]] },
    { x:"After waking from cryosleep decades later, Jin keeps staring into a cracked mirror, hardly recognizing his face.",
      a:"Jin's broken or uncertain sense of who he is.",
      w:[["The station needs better mirrors, because the old ones are cracked.", "This is literal. The crack suggests something about Jin."],
         ["Jin is vain and loves his own face.", "He hardly recognizes himself; this is about identity, not vanity."],
         ["Bad luck.", "The passage does not suggest superstition."]] },
    { x:"At the end of the story, the rescue beacon that has been dead for months blinks on, steady and green.",
      a:"Renewed hope of rescue and connection.",
      w:[["The beacon's batteries were replaced by the crew's engineer during routine maintenance.", "This is the literal explanation, not the meaning."],
         ["Danger is coming.", "A steady green light suggests safety, not danger."],
         ["The crew's love of the color green.", "Too literal and unsupported."]] },
    { x:"At the end of every corridor in the facility is a locked white door that no worker is allowed to open.",
      a:"Hidden truths and secrets kept by those in power.",
      w:[["The facility has a lot of storage space for cleaning supplies and equipment.", "Too literal: the story makes the doors mysterious on purpose."],
         ["Cleanliness and order.", "White suggests clean, but the locked doors suggest secrets."],
         ["The workers' freedom to explore.", "The doors are locked, so they represent the opposite."]] },
    { x:"Zara's notebook, full of drawings she is not allowed to make, is the only object she takes when she escapes Sector 9.",
      a:"Her individuality and her dream of a chosen life.",
      w:[["Her schoolwork, which she wants to finish before the end of the term.", "These are forbidden drawings, not schoolwork."],
         ["Her fear of the Planning Computer.", "The notebook is something she treasures, not something she fears."],
         ["The cost of paper.", "Too literal and unsupported."]] }
  ];

  /* ---------- 6. language and editing ---------- */
  const FIG = {
    sim:"Simile", met:"Metaphor", per:"Personification", lit:"None: it is literal description"
  };
  const FIGFB = {
    sim:{ met:"A simile compares using 'like' or 'as'. This sentence has no 'like' or 'as'; it says one thing IS another.",
          per:"A simile compares using 'like' or 'as'. There is no such comparison here; a thing is given human actions.",
          lit:"A simile compares using 'like' or 'as'. This sentence is plain, literal description." },
    met:{ sim:"This uses 'like' or 'as', which makes it a simile, not a metaphor.",
          per:"Nothing is said to BE something else. A non-human thing is given human actions or feelings.",
          lit:"Nothing is said to BE something else; this is plain description." },
    per:{ sim:"This compares two things with 'like' or 'as'. Nothing is given human actions.",
          met:"This says one thing IS another. It does not give a thing human actions or feelings.",
          lit:"Nothing here is given human actions or feelings; this is plain description." },
    lit:{ sim:"This is figurative: it compares two things using 'like' or 'as'.",
          met:"This is figurative: it says one thing IS something else.",
          per:"This is figurative: it gives a non-human thing human actions or feelings." }
  };
  const FIGS = [
    ["sim", "The spaceship drifted like a leaf on a still pond."],
    ["sim", "Her voice was as cold as the vacuum outside."],
    ["sim", "The asteroids tumbled past like boulders rolling down a hillside."],
    ["sim", "From orbit, the city lights spread out like spilled sugar."],
    ["sim", "The robot moved as smoothly as water."],
    ["met", "The space station was a tin can full of secrets."],
    ["met", "Fear was a fist inside Leo's chest."],
    ["met", "By noon, the desert planet was an oven."],
    ["met", "The asteroid belt was a minefield."],
    ["met", "The council's rules were a wall that no one could climb."],
    ["per", "The old engine coughed and complained as it started."],
    ["per", "The wind howled its anger at the dome."],
    ["per", "The stars watched silently as the shuttle fell."],
    ["per", "The moon peeked shyly over the horizon."],
    ["lit", "The shuttle landed on the gray dust at noon."],
    ["lit", "Mira checked the oxygen tank and closed the hatch."]
  ];
  const WORD = [
    { p:"Which verb best shows that the shuttle is out of control?", x:"The shuttle ______ toward the landing pad.",
      a:"lurched", w:[["moved", "Too general: it does not show loss of control."], ["went", "A plain verb that shows nothing about how it moved."], ["traveled", "Neutral; it suggests a calm journey."]] },
    { p:"Which verb best makes the robot seem threatening?", x:"The robot ______ down the dark corridor toward them.",
      a:"crept", w:[["walked", "Neutral; it creates no threat."], ["went", "Too plain to create any mood."], ["strolled", "This sounds relaxed and harmless, the opposite of threatening."]] },
    { p:"Which verb best shows panic?", x:"When the alarm sounded, the crowd ______ toward the exits.",
      a:"stampeded", w:[["walked", "Too calm for panic."], ["proceeded", "Formal and orderly; no panic."], ["went", "Too general to show panic."]] },
    { p:"Which verb best creates a sense of urgency?", x:"The alarm ______ through every deck of the ship.",
      a:"shrieked", w:[["sounded", "Accurate but flat; it adds no urgency."], ["played", "Suggests music, which is too gentle."], ["was heard", "Passive and weak."]] },
    { p:"Which verb best shows that Ana is exhausted?", x:"Ana ______ up the last ramp to the airlock.",
      a:"dragged herself", w:[["walked", "Neutral; it shows no tiredness."], ["ran", "Running suggests energy, the opposite of exhaustion."], ["went", "Too plain to show tiredness."]] },
    { p:"Which verb best suggests the door is old and heavy?", x:"The blast door ______ open.",
      a:"groaned", w:[["slid", "Suggests a smooth, easy movement, not age and weight."], ["went", "Shows nothing about the door."], ["popped", "Suggests something light and quick."]] },
    { p:"Which verb best shows how hungry Kai is?", x:"After three days without food, Kai ______ the ration bar.",
      a:"devoured", w:[["ate", "Accurate but flat; it does not show hunger."], ["nibbled", "Suggests small, slow bites: the opposite of starving."], ["had", "Too general."]] },
    { p:"Which adjective best creates a sense of danger?", x:"The shuttle landed beside a row of ______ cliffs.",
      a:"jagged", w:[["big", "Vague; size alone is not dangerous."], ["nice", "Positive and vague; it removes any danger."], ["brown", "A color, not a threat."]] },
    { p:"Which adjective best suggests the planet has no life?", x:"Below them stretched a ______ plain of rock and dust.",
      a:"barren", w:[["large", "Size, not lifelessness."], ["orange", "A color; it says nothing about life."], ["interesting", "Vague and tells the reader nothing specific."]] },
    { p:"Which adjective best suggests the alien city is very ancient?", x:"They walked between ______ towers covered in symbols no one could read.",
      a:"crumbling", w:[["tall", "Height, not age."], ["shiny", "Suggests something new, the opposite of ancient."], ["cool", "Too vague and informal."]] },
    { p:"Which adjective best suggests the room is eerily quiet?", x:"The control room was ______, except for the slow drip of coolant.",
      a:"silent", w:[["nice", "Vague; it says nothing about sound."], ["big", "Size, not sound."], ["busy", "Busy suggests noise and activity, the opposite."]] }
  ];
  const REV2 = [
    { x:"The door was opened by the robot.",
      a:"The robot opened the door.",
      w:[["The door was opened, by the robot, slowly.", "Still passive, and the commas make it clumsy."],
         ["The door was being opened by the robot.", "Still passive, and even wordier."],
         ["It was the robot by which the door was opened.", "Passive and awkward."]],
      why:"Active voice puts the doer first: subject, verb, object. It is shorter and more direct." },
    { x:"At this point in time, Ana made the decision to leave the ship due to the fact that it was sinking.",
      a:"Ana decided to leave the sinking ship.",
      w:[["At this point in time, Ana decided to leave due to the fact that the ship was sinking.", "Still full of filler phrases: 'at this point in time', 'due to the fact that'."],
         ["Ana made a decision at this time to leave because of the fact it sank.", "Still wordy, and 'sank' changes the meaning."],
         ["Ana left.", "Too short: it loses the reason, which matters."]],
      why:"Cut filler: 'at this point in time' means 'now', 'made the decision' means 'decided', 'due to the fact that' means 'because'." },
    { x:"Mistakes were made by the crew during the landing.",
      a:"The crew made mistakes during the landing.",
      w:[["During the landing, mistakes were made by the crew.", "Moving the phrase does not fix the passive voice."],
         ["Mistakes had been made by the crew during the landing.", "Still passive."],
         ["The landing was a time when mistakes were being made by the crew.", "Passive and much wordier."]],
      why:"Passive voice can hide who is responsible. Active voice makes the crew own the mistakes." },
    { x:"The robot was completely silent and made no sound at all.",
      a:"The robot was completely silent.",
      w:[["The robot was silent and made no sound.", "Still repeats the same idea twice."],
         ["The robot was completely silent and quiet.", "'Silent' and 'quiet' say the same thing."],
         ["The robot made no sound at all and was silent.", "Just swaps the order; the repetition remains."]],
      why:"'Silent' already means 'made no sound'. Saying it twice is redundant." },
    { x:"There were many aliens who were standing in a line that was very long.",
      a:"A long line of aliens waited.",
      w:[["There were many aliens standing in a line that was very long.", "Still starts with 'there were' and keeps 'that was very long'."],
         ["Many aliens were in a very, very long line.", "Repeating 'very' adds words without adding meaning."],
         ["There was a line of aliens and it was long and they were standing.", "Choppy and still wordy."]],
      why:"Cutting 'there were... who were' and 'that was' makes the sentence clear and direct." },
    { x:"The message was received by Captain Ruiz at noon.",
      a:"Captain Ruiz received the message at noon.",
      w:[["At noon, the message was received by Captain Ruiz.", "Still passive."],
         ["The message, at noon, was received by Captain Ruiz.", "Still passive and more awkward."],
         ["The message got received at noon by the captain, Ruiz.", "Passive and informal."]],
      why:"Active voice: the captain (doer) received (verb) the message (object)." },
    { x:"All of a sudden, out of nowhere, the ship suddenly exploded.",
      a:"Without warning, the ship exploded.",
      w:[["All of a sudden, the ship suddenly exploded.", "'All of a sudden' and 'suddenly' repeat each other."],
         ["Out of nowhere, all of a sudden, the ship exploded suddenly.", "Even more repetition."],
         ["The ship exploded all of a sudden, out of nowhere.", "Same three ideas, just rearranged."]],
      why:"One signal of surprise is enough. Repeating it weakens the moment." }
  ];
  const REV3 = [
    { x:"It was a dark and stormy night on Mars.",
      a:"Red dust hammered the dome all night, and the wind screamed through the vents.",
      w:[["It was a very dark and very stormy night on Mars.", "Still the cliché, with extra 'very'."],
         ["Once upon a time, on Mars, it was stormy.", "Swaps one cliché for another."],
         ["The night on Mars was dark and stormy, as it usually was at that time of year, and very windy too.", "The same cliché rearranged and padded out."]],
      why:"'A dark and stormy night' is one of the most famous clichés. Specific, sensory details (red dust, screaming wind) make the scene fresh and fit the setting." },
    { x:"Leo's heart was beating like a drum, and he was scared to death.",
      a:"Leo pressed his back to the wall, counting each breath so the guards would not hear.",
      w:[["Leo's heart was pounding like a drum, and he was terrified.", "Still uses the 'heart like a drum' cliché."],
         ["Leo was scared to death and very, very afraid.", "Two clichés and repetition."],
         ["Leo felt really scared, just like a character in a scary movie, and his heart was beating like a drum.", "Telling, a vague comparison, and the same drum cliché."]],
      why:"Instead of naming the fear with tired phrases, the best revision shows it through action." },
    { x:"Her eyes were as blue as the sky.",
      a:"Her eyes were the pale blue of the ship's warning lights.",
      w:[["Her eyes were as blue as the ocean.", "Another overused comparison."],
         ["Her eyes were very, very blue.", "Repetition is not description."],
         ["Her eyes were blue, just like the bright, clear sky on a warm and sunny summer day.", "The same cliché, made longer."]],
      why:"A fresh comparison fits the story's world. 'Warning lights' also hints at danger, which a sky comparison cannot do." },
    { x:"The alien was as quiet as a mouse.",
      a:"The alien moved without a whisper, its many feet barely touching the floor.",
      w:[["The alien was as quiet as a little mouse.", "Still the cliché."],
         ["The alien was as quiet as a mouse or a cat, creeping along slowly so that nobody would hear it at all.", "Two clichés instead of one."],
         ["The alien was extremely quiet.", "Telling, not showing, and very plain."]],
      why:"'Quiet as a mouse' is worn out. A specific image of the alien's body makes the reader see something new." },
    { x:"In the blink of an eye, the colony was gone.",
      a:"Between one breath and the next, the colony's lights went out, one dome at a time.",
      w:[["In a split second, the colony was gone.", "Swaps one cliché for another."],
         ["Very quickly, in the blink of an eye, the whole colony was suddenly gone, and nothing was left behind.", "Keeps the cliché and adds filler."],
         ["The colony was gone in the blink of an eye, just like that.", "Still a cliché, now with extra words."]],
      why:"A precise image (domes going dark one by one) is more powerful than a stock phrase." }
  ];
  const OPEN = [
    { t:"a space station", a:"The day the oxygen alarms stopped, everyone on Kepler Station assumed the problem was fixed. Mira knew better.",
      w:[["Hello, my name is Mira, and I am going to tell you a story about a space station.", "Announcing the story instead of starting it wastes the first line."],
         ["It was a normal day on Kepler Station. Mira woke up, got dressed and ate breakfast.", "Routine details with no hook or tension."],
         ["In the future, there are lots of space stations, and one of them is called Kepler Station, and it has lots of people living on it.", "An info-dump with vague details and no character in action."]] },
    { t:"a world without rain", a:"Rain had not fallen on Earth for eleven years, so when Zoe felt the first drop on her cheek, she screamed.",
      w:[["Once upon a time, in the future, there was a girl named Zoe.", "A fairy-tale cliché that tells us nothing about this world."],
         ["Zoe was a girl who lived in the future. She had brown hair and blue eyes, she was thirteen years old, and she liked rain.", "A list of facts about Zoe, with no hook."],
         ["The weather in the future is very dry because of climate change, which is a big problem.", "This lectures the reader instead of telling a story."]] },
    { t:"a robot that dreams", a:"My brother's robot told me a secret last night: it has started dreaming.",
      w:[["Robots are machines that can do many jobs for people.", "A textbook fact, not a story opening."],
         ["I woke up. It had all been a dream.", "A famous cliché, and it cancels the story before it starts."],
         ["There are many robots in my house, and they are all very useful and helpful, and they do lots of jobs for my family.", "Bland and vague; nothing is at stake."]] },
    { t:"a seed vault on a colony", a:"The colony's last seed vault had been locked for a hundred years, and today Kai had the key.",
      w:[["BOOM! CRASH! BANG!", "Noise words without context do not tell the reader anything."],
         ["This story is about a boy called Kai and a seed vault.", "Announcing the topic is not a hook."],
         ["Kai lived in a colony on another planet. It was okay, I guess. He had a job there, and he did it every day.", "Flat, with no detail or tension."]] },
    { t:"a ship with no windows", a:"Nobody on the ship had ever seen a window, so when Leo found one, he did not know what the black, glittering thing was.",
      w:[["Space is very big and very dark, and it has lots and lots of stars in it, as well as many planets, moons, comets and asteroids.", "General facts, with no character and no question raised."],
         ["The spaceship was big. It was silver. It was going to a planet.", "Short, flat facts with no tension."],
         ["Have you ever wondered what it would be like to live on a spaceship?", "A common question opener that talks to the reader instead of dropping them into the world."]] },
    { t:"memory surgery", a:"The doctors promised the memory surgery would not hurt. They did not mention that Ana would wake up remembering someone else's life.",
      w:[["Ana was going to have surgery on her memory. She was very nervous about it, but in the end it was fine and nothing went wrong at all.", "Tells feelings and removes tension."],
         ["In this story, you will learn about memory surgery and what happened to Ana.", "Announces what the story is about instead of hooking the reader."],
         ["Memory surgery is a type of surgery that changes memories.", "A definition, not an opening."]] }
  ];

  /* ---------- 7. The Veldt (ideas in our own words) ---------- */
  const VEL1 = [
    { p:"In <i>The Veldt</i>, what does the Hadley family's automated Happylife Home do?",
      a:"It handles almost every daily task, from cooking and cleaning to caring for the children.",
      w:[["It teaches the children science and math lessons every afternoon in a special classroom.", "The house is about doing everything for the family, not schooling."],
         ["It protects the family from wild animals.", "The irony is the opposite: the danger comes from inside the house."],
         ["It is a spaceship that takes the family to Africa.", "The family stays at home; Africa appears only in the nursery."]],
      why:"The Happylife Home does so much that the parents have almost nothing left to do. That is the starting point of the story's warning." },
    { p:"What can the nursery in <i>The Veldt</i> do?",
      a:"It creates realistic places, with sights, sounds and smells, from the children's thoughts.",
      w:[["It is an ordinary bedroom full of toys and books.", "The nursery is far from ordinary: it is advanced technology."],
         ["It shows television programs chosen by the parents.", "The children's thoughts, not the parents' choices, control it."],
         ["It is a small private zoo, where real lions brought from Africa are kept behind glass.", "The lions are created by the room."]],
      why:"The nursery responds to the children's minds, which is why the scene it shows reveals what they are thinking." },
    { p:"Who is David McClean in <i>The Veldt</i>?",
      a:"A psychologist the parents ask for help.",
      w:[["The children's teacher at school.", "He is not a teacher; he is a psychologist who visits the house."],
         ["The engineer who built the nursery.", "He did not build the house; he examines what it is doing to the family."],
         ["Peter and Wendy's uncle, who lives far away.", "He is not a relative."]],
      why:"McClean sees the danger and advises the Hadleys to switch the house off." },
    { p:"The children in <i>The Veldt</i> are named Peter and Wendy. Which story does this nod to?",
      a:"Peter Pan, where children escape to a fantasy land and never grow up",
      w:[["Hansel and Gretel, two children who get lost in a dark forest and find a witch's house", "The names do not match, and the link is the escape into fantasy, not being lost."],
         ["Alice in Wonderland, a girl who falls down a rabbit hole", "The names Peter and Wendy come from Peter Pan."],
         ["Romeo and Juliet, two young lovers", "The names and the ideas do not match this story."]],
      why:"Like the children in Peter Pan, Peter and Wendy prefer a fantasy world to their parents and their rules." },
    { p:"Which feature makes <i>The Veldt</i> science fiction?",
      a:"It imagines a future house that reacts to thoughts, and its effect on a family.",
      w:[["It has lions in it.", "Lions alone do not make a story science fiction."],
         ["Its main scene shows the African grassland.", "A setting in Africa is not science fiction on its own."],
         ["One of its main characters is a psychologist who visits the family's house to help them.", "Psychologists exist today; that does not make it science fiction."]],
      why:"The speculative technology, and the question of what it does to people, is what makes the story science fiction." },
    { p:"Lydia Hadley is unhappy early in the story. What is her main worry?",
      a:"The house has taken over her role, and she feels unnecessary.",
      w:[["The house is too small for the family.", "The house is large and does everything; size is not the issue."],
         ["The nursery costs far too much money to run each month, and the family cannot afford it.", "Her worry is about her role as a parent, not money."],
         ["The children do not use the nursery enough.", "The opposite: they use it all the time."]],
      why:"Lydia's feeling that she is no longer needed is the first sign that the technology is replacing the parents." }
  ];
  const VEL2 = [
    { p:"Which theme is central to <i>The Veldt</i>?",
      a:"Letting technology raise children can break the bond between parents and children.",
      w:[["Hard work always brings success and happiness.", "The story is about dependence on technology, not hard work."],
         ["Wild animals should be protected.", "The lions are created by the nursery; the story is not about wildlife."],
         ["Space exploration is dangerous for families, especially those with young children.", "The story takes place in a house on Earth."]],
      why:"The parents give their roles to the house, and the children's love and loyalty move to the house too." },
    { p:"What does the nursery most likely symbolize?",
      a:"Technology that gives children whatever they want and replaces their parents.",
      w:[["The family's great wealth, which they like to show off to their friends and neighbors.", "It shows they can afford it, but the story uses the nursery to show technology replacing parents."],
         ["A safe place where the family can relax together.", "The nursery becomes the most dangerous place in the house."],
         ["The real wildlife of Africa.", "The veldt is imagined by the children; the nursery stands for something else."]],
      why:"The nursery satisfies every wish, and in doing so it takes the parents' place, and finally turns against them." },
    { p:"What do the lions in the nursery most likely represent?",
      a:"The children's hidden anger toward their parents.",
      w:[["Peace and the beauty of nature in a busy modern world.", "The lions are hungry and threatening, not peaceful."],
         ["The parents' strength and courage.", "The lions are created by the children's thoughts, not the parents'."],
         ["A school project about Africa.", "Nothing in the story suggests a school project."]],
      why:"Because the nursery reflects the children's minds, hungry lions reveal the violent feelings growing inside them." },
    { p:"Early on, the parents hear screams from the nursery that sound strangely familiar. What is the effect?",
      a:"It foreshadows the ending, when the screams turn out to be their own.",
      w:[["It shows the nursery's sound system is broken and needs repair.", "The screams are a hint, not a technical fault."],
         ["It adds humor to a tense scene.", "The detail is chilling, not funny."],
         ["It shows that the children are in danger.", "The danger is to the parents, not the children."]],
      why:"Bradbury plants the clue early. On a second reading, the familiar screams are terrifying." },
    { p:"George finds an old wallet of his in the nursery, chewed and stained. Why does this detail matter?",
      a:"It hints that the lions are real enough to hurt people.",
      w:[["It shows George is careless with his money and always losing things.", "The wallet matters because of where it is and its damage, not George's habits."],
         ["It suggests the children want to steal George's money.", "The damage points to the lions, not theft."],
         ["It proves the house needs repairs.", "The detail is a warning about danger, not maintenance."]],
      why:"The damaged wallet foreshadows the parents' fate: the 'imaginary' room can cause real harm." },
    { p:"After talking with David McClean, what do the parents decide to do?",
      a:"Switch off the whole house, including the nursery.",
      w:[["Buy an even bigger nursery for the children.", "McClean warns them that the nursery is harmful, so they decide the opposite."],
         ["Send the children away to boarding school.", "They decide to change the house, not send the children away."],
         ["Move the whole family to Africa.", "Africa exists only in the nursery."]],
      why:"Their decision to shut the house down is what turns the children against them." }
  ];
  const VEL3 = [
    { p:"What is ironic about the name 'Happylife Home'?",
      a:"A house meant to make the family happy ends up destroying it.",
      w:[["The house is not actually a home; it is an office building in the middle of the city.", "The Hadleys live there; the irony is about happiness, not the type of building."],
         ["The family is very happy from start to finish.", "The family is unhappy and in danger."],
         ["The name is too long.", "This is not irony; irony is a gap between what is expected and what happens."]],
      why:"Irony is a gap between expectation and outcome. The name promises a happy life, but the house destroys the family." },
    { p:"At the end, the children calmly offer David McClean tea in the veldt while the lions feed in the distance. Why is this ending so chilling?",
      a:"Its calm, polite tone contrasts with the horror we understand has happened.",
      w:[["It shows that everything has gone back to normal and the family is safe.", "The parents are gone; the calm is disturbing, not reassuring."],
         ["It proves the parents went on vacation.", "The clues throughout the story point to a darker fate."],
         ["It suggests David will rescue the parents in a sequel.", "There is no sign of rescue; it is too late."]],
      why:"The contrast between the polite tea and what the lions are eating makes the reader fill in the horror." },
    { p:"Which detail best supports the idea that the children love the house more than their parents?",
      a:"The children react with fury when George decides to switch the house off.",
      w:[["The house cooks the family's meals and cleans their rooms every single day.", "This is about the house, not about the children's feelings."],
         ["David McClean is a psychologist.", "A fact about another character."],
         ["The family lives in a large, modern house in a quiet town.", "A setting detail that says nothing about whom the children love."]],
      why:"Their rage at losing the house, compared with their coldness toward their parents, shows where their loyalty lies." },
    { p:"Why might Bradbury have chosen the African veldt, a hot, wild grassland full of predators, as the nursery's scene?",
      a:"Its wildness mirrors the savage feelings hidden inside a polished modern home.",
      w:[["To give readers useful facts about African geography and wildlife.", "The story is not a travel guide; the setting is symbolic."],
         ["Because the family is planning a safari vacation.", "No safari is planned; the scene comes from the children's minds."],
         ["Because grassland is calm and peaceful.", "The veldt is full of hungry predators, so it is not calm."]],
      why:"Setting can be symbolic. The wild veldt inside a perfect house shows the danger growing under a comfortable surface." },
    { p:"Which message about parenting does <i>The Veldt</i> suggest?",
      a:"Parents who hand their role to machines may lose their children's love and respect.",
      w:[["Parents should buy their children every new gadget as soon as it comes out.", "The story warns against exactly this."],
         ["Children should never be allowed to play.", "The story criticizes replacing parents, not play itself."],
         ["Strict parents always raise happy children.", "The story is about absent parenting, not strictness."]],
      why:"The Hadleys gave the house their jobs as parents, and the children's loyalty followed." },
    { p:"George tries to change the nursery to a different scene, but it stays fixed on Africa. What does this most strongly suggest?",
      a:"The children's minds now control the room more than the parents do.",
      w:[["The parents simply do not know how to use the controls properly.", "The parents may hope it is a fault, but the story shows the room is obeying the children."],
         ["Africa is the only scene the nursery can show.", "The room can show any place; it is stuck because of the children."],
         ["The house is saving electricity.", "There is no evidence for this; the point is about control."]],
      why:"The parents have lost control of the house, and of their children." }
  ];

  /* ---------- topic ---------- */
  const T = {
    id:"scifi", code:"F", year:8, subject:"English", name:"Science-fiction storytelling",
    blurb:"What makes science fiction, world-building, conflict and plot, foreshadowing and suspense, theme and symbol, strong language, and The Veldt.",
    levels:Kit.LEVELS3, defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:45,
    skills:{
      genre:{ name:"Characteristics of science fiction", short:"What is sci-fi?", lesson:0 },
      world:{ name:"Setting and world-building", short:"World-building", lesson:1 },
      plot:{ name:"Conflict, character and plot structure", short:"Conflict and plot", lesson:2 },
      susp:{ name:"Foreshadowing and suspense", short:"Foreshadowing", lesson:3 },
      theme:{ name:"Theme and symbolism", short:"Theme and symbol", lesson:4 },
      lang:{ name:"Descriptive language, editing and openings", short:"Language", lesson:5 },
      veldt:{ name:"The Veldt: themes and ideas", short:"The Veldt", lesson:6 }
    },
    lessons:[
      { title:"What is science fiction?", heading:"Science fiction asks \"what if?\"", html:`
<p><b>Science fiction</b> (sci-fi) imagines how science or technology, real or invented, might change people and societies. It starts with a <b>"what if"</b> question and follows the consequences.</p>
<div class="rule"><span class="name">The core recipe</span><div class="law">What if ... ? → So what happens to people?</div>
<p class="small">What if people never needed to sleep? What if memories could be sold? The story is about what that change does to characters and their world.</p></div>
<h3>Common features</h3>
<div class="two">
<div class="rule"><span class="name">Setting</span><p class="small">The future, another planet, a space station, or an alternate version of history.</p></div>
<div class="rule"><span class="name">Technology</span><p class="small">Robots, artificial intelligence, time travel, genetic change, space travel, smart homes.</p></div>
<div class="rule"><span class="name">Consequences</span><p class="small">How inventions help or harm people, often both at once.</p></div>
<div class="rule"><span class="name">Big questions</span><p class="small">What makes us human? Who holds power? What do we lose when life gets easier?</p></div>
</div>
<h3>Science fiction or fantasy?</h3>
<div class="tblwrap"><table class="tbl">
<thead><tr><th></th><th>Science fiction</th><th>Fantasy</th></tr></thead>
<tbody>
<tr><td>Wonders explained by</td><td>Science or technology (even imagined)</td><td>Magic or the supernatural</td></tr>
<tr><td>Example</td><td>A flying car built by engineers</td><td>A flying carpet enchanted by a wizard</td></tr>
</tbody></table></div>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">A spaceship does not automatically make a story science fiction, and a story on Earth can still be sci-fi. Ask: is the strange thing explained by science, or by magic?</p></div>` },
      { title:"World-building", heading:"Build a world the reader can feel", html:`
<p>Your setting is not just a backdrop. In science fiction, the world is often the source of the conflict.</p>
<h3>Three tools</h3>
<div class="three">
<div class="rule"><span class="name">Senses</span><p class="small">Sight, sound, smell, touch and taste. "The recycled air tasted of metal" puts the reader inside the ship.</p></div>
<div class="rule"><span class="name">Rules</span><p class="small">What is allowed, impossible or dangerous? "The surface hatch opens once a year." Rules create problems.</p></div>
<div class="rule"><span class="name">Show, don't tell</span><p class="small">Let details prove the idea instead of stating it.</p></div>
</div>
<h3>Show, don't tell</h3>
<div class="two">
<div class="warn"><span class="name">Tells</span><p class="small">The space station was old and badly maintained.</p></div>
<div class="rule"><span class="name">Shows</span><p class="small">The hatch groaned open, and flakes of rust drifted onto Mira's gloves.</p></div>
</div>
<div class="warn"><span class="name">Avoid the info-dump</span>
<p class="small">Do not open with a paragraph of facts ("In 2300, cars were banned because..."). Weave facts into action: "Mia tapped her card at the tube gate, glancing at the rusting car shells behind the fence."</p></div>` },
      { title:"Conflict and plot", heading:"Conflict drives the plot", html:`
<p><b>Conflict</b> is the struggle at the heart of a story. Without it, nothing happens.</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Type</th><th>The struggle is against...</th><th>Sci-fi example</th></tr></thead>
<tbody>
<tr><td>Person vs technology</td><td>a machine, invention or system</td><td>The ship's computer locks the crew out.</td></tr>
<tr><td>Person vs society</td><td>laws, rules or a group's beliefs</td><td>A girl refuses the city's compulsory smile filter.</td></tr>
<tr><td>Person vs self</td><td>the character's own fear, guilt or choice</td><td>A pilot must decide whether to confess to causing an accident.</td></tr>
<tr><td>Person vs nature</td><td>weather, environment or wildlife</td><td>A dust storm heads for the Mars colony.</td></tr>
</tbody></table></div>
<h3>Plot structure</h3>
<ol class="steps">
<li><div><div class="m">Exposition</div><p class="why">Characters, setting and normal life.</p></div></li>
<li><div><div class="m">Rising action</div><p class="why">Complications build tension.</p></div></li>
<li><div><div class="m">Climax</div><p class="why">The turning point of highest tension, where the conflict is faced head on.</p></div></li>
<li><div><div class="m">Falling action</div><p class="why">The immediate results of the climax; tension eases.</p></div></li>
<li><div><div class="m">Resolution</div><p class="why">The new normal.</p></div></li>
</ol>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">The climax is not just "the exciting part". It is the moment the main conflict is decided. Falling action is what happens right after; the resolution shows how life has settled.</p></div>` },
      { title:"Foreshadowing and suspense", heading:"Plant clues and keep readers hooked", html:`
<p><b>Foreshadowing</b> is a hint about something that will happen later. Good foreshadowing makes the reader uneasy without giving the ending away.</p>
<div class="two">
<div class="rule"><span class="name">Hint (good)</span><p class="small">The computer answered Mira's question a second before she finished asking it.</p></div>
<div class="warn"><span class="name">Spoiler (weak)</span><p class="small">Little did Mira know that the computer was planning to take over the station.</p></div>
</div>
<h3>Four suspense techniques</h3>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Technique</th><th>How it works</th><th>Example</th></tr></thead>
<tbody>
<tr><td>Short sentences</td><td>Fragments speed up the pace and the reader's pulse.</td><td>Footsteps. Closer. The lock clicked.</td></tr>
<tr><td>Ticking clock</td><td>A deadline is running out.</td><td>Twelve minutes of air left; the rescue ship is fifteen minutes away.</td></tr>
<tr><td>Withheld information</td><td>A key fact is kept from the reader or the character.</td><td>No one would say what happened in Sector C.</td></tr>
<tr><td>Cliffhanger</td><td>A chapter ends on a shock or an unanswered question.</td><td>The face under the helmet was his own.</td></tr>
</tbody></table></div>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">Phrases like "Little did she know..." give the twist away. Hint, then let the reader worry.</p></div>` },
      { title:"Theme and symbol", heading:"A theme is a message, not a topic", html:`
<p>A <b>topic</b> is a subject, usually one or two words: <i>technology</i>, <i>freedom</i>. A <b>theme</b> is what the story suggests about that topic, written as a full sentence.</p>
<div class="two">
<div class="warn"><span class="name">Topic</span><p class="small">Technology</p></div>
<div class="rule"><span class="name">Theme statement</span><p class="small">Technology can connect people, but it can also make them lonelier.</p></div>
</div>
<div class="rule"><span class="name">Test</span><div class="law">Could it apply to real life, beyond this story?</div>
<p class="small">A theme is not a plot summary ("Kai switches off the computer") and not a command ("Never trust computers").</p></div>
<h3>Symbols</h3>
<p>A <b>symbol</b> is an object, place or action that stands for a bigger idea. In a gray, controlled city, a single sunflower kept alive in secret can stand for hope. A broken watch stopped at the moment of launch can stand for a character stuck in the past.</p>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">Do not stop at the literal meaning ("the sunflower is a plant"). Ask why the writer chose this object, at this moment.</p></div>` },
      { title:"Language and editing", heading:"Choose every word on purpose", html:`
<h3>Strong verbs and precise adjectives</h3>
<p>"The shuttle <b>lurched</b>" shows loss of control; "the shuttle moved" shows nothing. "Jagged cliffs" suggests danger; "big cliffs" does not.</p>
<h3>Figurative language</h3>
<div class="three">
<div class="rule"><span class="name">Simile</span><p class="small">Compares using like or as: the ship drifted like a leaf on a pond.</p></div>
<div class="rule"><span class="name">Metaphor</span><p class="small">Says one thing is another: the station was a tin can full of secrets.</p></div>
<div class="rule"><span class="name">Personification</span><p class="small">Gives human actions to things: the old engine coughed and complained.</p></div>
</div>
<h3>Editing checklist</h3>
<ol class="steps">
<li><div><div class="m">Cut filler.</div><p class="why">"At this point in time" means "now". "Due to the fact that" means "because".</p></div></li>
<li><div><div class="m">Prefer active voice.</div><p class="why">"The robot opened the door", not "The door was opened by the robot".</p></div></li>
<li><div><div class="m">Replace clichés.</div><p class="why">"A dark and stormy night" becomes "Red dust hammered the dome all night".</p></div></li>
</ol>
<h3>Strong openings</h3>
<p>Drop the reader into the world with a hook: a strange detail, a problem or a question. Avoid "Hello, my name is...", "Once upon a time" and "It was all a dream".</p>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">Shorter is not always better. "Ana left" is concise but loses the reason. Cut words that repeat; keep words that carry meaning.</p></div>` },
      { title:"The Veldt", heading:"The Veldt: a house that replaced the parents", html:`
<p>In Ray Bradbury's short story, the Hadley family (parents George and Lydia, children Peter and Wendy) lives in a fully automated "Happylife Home". The house does almost everything for them. Its most amazing room is the nursery, which turns the children's thoughts into a realistic world. Lately, the nursery always shows the African veldt, where lions feed on something in the distance. (All summaries here are in our own words.)</p>
<div class="tblwrap"><table class="tbl">
<thead><tr><th>Element</th><th>What it suggests</th></tr></thead>
<tbody>
<tr><td>The Happylife Home</td><td>Technology that takes over the parents' roles.</td></tr>
<tr><td>The nursery</td><td>A machine that gives the children everything they want, and replaces their parents.</td></tr>
<tr><td>The veldt and the lions</td><td>The children's hidden anger and violent wishes.</td></tr>
<tr><td>Peter and Wendy</td><td>A nod to Peter Pan: children who choose a fantasy world over their parents.</td></tr>
<tr><td>David McClean</td><td>A psychologist who sees the danger and advises switching the house off.</td></tr>
</tbody></table></div>
<h3>Foreshadowing and irony</h3>
<p>Early clues prepare the ending: the strangely familiar screams from the nursery, and George's old wallet found there, chewed and stained. The ending is deeply ironic: a house built to give the family a happy life destroys it, and the children calmly offer McClean tea in the veldt.</p>
<div class="warn"><span class="name">Common mistake</span>
<p class="small">The story is not simply "technology is bad". It is about what happens when parents hand their responsibilities to machines. Explain ideas in your own words; do not copy lines from the story.</p></div>` }
    ],
    introHtml:`<h2>Six ideas that win marks</h2>
<p class="muted">Use these habits when you answer questions and when you plan your own science-fiction story.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Start with "what if"</h3><p class="small">Science fiction imagines a change in science or technology and follows its consequences.</p></div>
<div class="habit"><span class="hn">2</span><h3>Show the world</h3><p class="small">Use senses and rules, woven into action, not an info-dump.</p></div>
<div class="habit"><span class="hn">3</span><h3>Name the conflict</h3><p class="small">Technology, society, self or nature: know what your hero is fighting.</p></div>
<div class="habit"><span class="hn">4</span><h3>Hint, don't spoil</h3><p class="small">Plant clues and use short sentences, deadlines and secrets to build suspense.</p></div>
<div class="habit"><span class="hn">5</span><h3>Theme is a sentence</h3><p class="small">A theme says something about a topic; a symbol stands for a bigger idea.</p></div>
<div class="habit"><span class="hn">6</span><h3>Every word works</h3><p class="small">Strong verbs, fresh images, active voice and a hooky opening.</p></div>
</div>`,
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };

  /* ---------- generators ---------- */
  const FR_SF = ["Which story premise is <b>science fiction</b>?", "A student has four story ideas. Which one is <b>science fiction</b>?",
    "Which of these premises belongs to the <b>science-fiction</b> genre?", "Only one of these premises is science fiction. Which one?",
    "Which story idea would be shelved in the <b>science-fiction</b> section of a library?"];
  const FR_FA = ["Three of these premises are science fiction. Which one is <b>fantasy</b>?", "Which premise is <b>fantasy</b> rather than science fiction?",
    "One of these story ideas relies on magic. Which one?", "Which premise does <b>not</b> belong in a science-fiction anthology?"];
  const FR_TH = ["Which of these is a <b>theme statement</b>, not just a topic or a plot summary?", "Which option states a <b>theme</b>?",
    "A student is writing about a science-fiction story. Which option is a <b>theme</b>?", "Which of these says something about life, as a theme should?"];
  const PLOTSUM = ["Mira discovers the colony's leaders have been lying about the oxygen supply.",
    "A cleaning robot starts reading about the paintings in the museum where it works.",
    "Kai and Ana copy deleted history lessons into notebooks by hand.",
    "Zoe finds a tampered sensor buoy while ferrying passengers between rooftops.",
    "Leo picks up a repeating signal from space and sends a reply.",
    "Jin discovers that the ship's windows are really screens."];
  const POOL = [
    /* Level 1 */
    { id:"which-sf", skill:"genre", level:1, make(ctx){
      const sf = Kit.unique(ctx, SF, x => "sf" + x);
      return Kit.mc({ promptHtml:Kit.unique(ctx, FR_SF, x => "fr" + x),
        options:[{ html:sf, correct:true }, { html:pick(FANT), fb:FB_FANT }, { html:pick(REAL), fb:FB_REAL }, { html:pick(HIST), fb:FB_HIST }],
        workHtml:`<p>${FB_SF}</p><p>Fantasy uses magic, realistic fiction could happen today, and historical fiction stays true to the real past.</p>`,
        key:"Science fiction explains its wonders through science or technology, real or imagined.",
        hint:"Look for imagined science or technology, not magic." });
    } },
    { id:"sf-char", skill:"genre", level:1, make(ctx){ return Q(Kit.unique(ctx, SFCHAR), {
      key:"Science fiction = a 'what if' about science or technology, followed by its consequences for people.",
      hint:"Is the strange thing explained by science or by magic?" }); } },
    { id:"sense", skill:"world", level:1, make(ctx){
      const [s, x, clue] = Kit.unique(ctx, SENSES);
      const others = shuffle(Object.keys(SENSE).filter(k => k !== s)).slice(0, 3);
      return Kit.mc({ promptHtml:"Which sense does this description mainly appeal to?", exprHtml:box(x),
        options:[{ html:SENSE[s], correct:true }].concat(others.map(k => ({ html:SENSE[k], fb:SENSE_FB[k] }))),
        workHtml:`<p>The key words are <b>${clue}</b>, which appeal to <b>${SENSE[s].toLowerCase()}</b>.</p><p>Using more than sight helps the reader feel present in your world.</p>`,
        key:"Sensory details put the reader inside the world; go beyond sight.",
        hint:"Find the most vivid words. Which part of the body would notice them?" });
    } },
    { id:"show", skill:"world", level:1, make(ctx){
      const it = Kit.unique(ctx, SHOW);
      return Q({ p:`Which sentence <b>shows</b>, rather than tells, that ${it.idea}?`, a:it.a, w:it.w,
        why:`"${it.a}" lets the reader work out that ${it.idea} from specific details. The other sentences state it outright or speak in general terms.` }, {
        key:"Show, don't tell: give a specific detail and let the reader draw the conclusion.",
        hint:"Which sentence never names the idea but still makes you see it?" });
    } },
    { id:"conflict", skill:"plot", level:1, make(ctx){
      const [k, x] = Kit.unique(ctx, CONFS);
      return Kit.mc({ promptHtml:"Which type of conflict is this?", exprHtml:box(x),
        options:Object.keys(CONF).map(c => c === k ? { html:CONF[c].n, correct:true } : { html:CONF[c].n, fb:CONF[c].fb }),
        workHtml:`<p><b>${CONF[k].n}</b>: ${CONF[k].d}.</p>`,
        key:"Name the conflict by asking: who or what is the main opponent?",
        hint:"Who or what is standing in the character's way?" });
    } },
    { id:"plot-def", skill:"plot", level:1, make(ctx){
      const k = Kit.unique(ctx, PK, x => "pd" + x);
      return Kit.mc({ promptHtml:"Which part of the plot is described here?", exprHtml:box("The part of the story that " + PLOT[k].d + "."),
        options:shuffle(PK.filter(p => p !== k)).slice(0, 3).map(p => ({ html:PLOT[p].n, fb:`${PLOT[p].n} ${PLOT[p].d}.` })).concat([{ html:PLOT[k].n, correct:true }]),
        workHtml:`<p><b>${PLOT[k].n}</b> ${PLOT[k].d}.</p><p>Order: exposition → rising action → climax → falling action → resolution.</p>`,
        key:"Exposition, rising action, climax, falling action, resolution.",
        hint:"Picture the shape of a story: build-up, peak, wind-down." });
    } },
    { id:"plot-terms", skill:"plot", level:1, make(ctx){
      const drop = ri(-1, 4), keep = PK.filter((_, i) => i !== drop);
      return Kit.order({ promptHtml:drop < 0 ? "Put the five parts of a plot in order." : "Put these parts of a plot in order.",
        inOrder:keep.map(k => PLOT[k].n), axis:["start", "end"],
        workHtml:"<p>" + PK.map(k => `<b>${PLOT[k].n}</b> ${PLOT[k].d}.`).join("<br>") + "</p>",
        key:"Build up, peak, wind down: exposition, rising action, climax, falling action, resolution.",
        hint:"Which part introduces the world, and which shows the new normal?" });
    } },
    { id:"fore1", skill:"susp", level:1, make(ctx){
      const [end, hint] = Kit.unique(ctx, FORE1);
      return Kit.mc({ promptHtml:`In this story, <b>${end}</b>. Which earlier sentence foreshadows this?`,
        options:[{ html:hint, correct:true }].concat(shuffle(NEUTRAL.slice()).slice(0, 3).map(n => ({ html:n, fb:NEUTRAL_FB }))),
        workHtml:`<p>"${hint}" is a small, slightly strange detail that makes the reader uneasy. When the ending comes, it makes sense.</p>`,
        key:"Foreshadowing is an early hint that makes the ending feel both surprising and possible.",
        hint:"Which detail feels slightly wrong or out of place?" });
    } },
    { id:"theme-topic", skill:"theme", level:1, make(ctx){
      const th = Kit.unique(ctx, THEMES, x => "th" + x), tps = shuffle(TOPICS.slice()).slice(0, 2);
      return Kit.mc({ promptHtml:Kit.unique(ctx, FR_TH, x => "fr" + x),
        options:[{ html:th, correct:true }].concat(tps.map(t => ({ html:t, fb:`"${t}" is a topic: a subject in a word or two. A theme says what the story suggests about it.` })),
          [{ html:pick(PLOTSUM), fb:"This is a plot summary: it says what happens in one story, not what the story suggests about life." }]),
        workHtml:`<p>A theme statement is a full sentence that says something about life: "${th}"</p>`,
        key:"Topic = a word or two. Plot = what happens. Theme = a full sentence about life that the story suggests.",
        hint:"Which one is a complete idea that could apply to real life?" });
    } },
    { id:"figure", skill:"lang", level:1, make(ctx){
      const [k, x] = Kit.unique(ctx, FIGS);
      return Kit.mc({ promptHtml:"Which kind of language does this sentence use?", exprHtml:box(x),
        options:Object.keys(FIG).map(f => f === k ? { html:FIG[f], correct:true } : { html:FIG[f], fb:FIGFB[f][k] }),
        workHtml:`<p>${k === "sim" ? "It compares two things using 'like' or 'as': a <b>simile</b>." : k === "met" ? "It says one thing <i>is</i> another, with no 'like' or 'as': a <b>metaphor</b>." : k === "per" ? "It gives a non-human thing human actions or feelings: <b>personification</b>." : "It describes what happens plainly, with no comparison or human qualities: <b>literal</b> description."}</p>`,
        key:"Simile: like/as. Metaphor: is. Personification: things act human.",
        hint:"Look for 'like' or 'as' first. Then ask: is something said to BE something else, or acting like a person?" });
    } },
    { id:"veldt1", skill:"veldt", level:1, make(ctx){ return Q(Kit.unique(ctx, VEL1), {
      key:"The Veldt warns what happens when a family lets technology take over the parents' role.",
      hint:"Think about what the house does for the family, and what that leaves for the parents." }); } },
    /* Level 2 */
    { id:"which-fant", skill:"genre", level:2, make(ctx){
      const f = Kit.unique(ctx, FANT, x => "fa" + x), sfs = shuffle(SF.slice()).slice(0, 3);
      return Kit.mc({ promptHtml:Kit.unique(ctx, FR_FA, x => "fr" + x),
        options:[{ html:f, correct:true }].concat(sfs.map(s => ({ html:s, fb:FB_SF }))),
        workHtml:`<p>${FB_FANT}</p><p>The others all rest on imagined science or technology.</p>`,
        key:"Magic means fantasy; imagined science means science fiction.",
        hint:"Which one could never be explained by any science, even future science?" });
    } },
    { id:"whatif", skill:"genre", level:2, make(ctx){ return Q(Object.assign({ p:"What consequence of technology is this story exploring?" }, Kit.unique(ctx, WHATIF)), {
      why:"Science fiction follows a 'what if' through to its consequences. Look at what the passage makes you notice: who gains, who loses, and what changes for people.",
      key:"Science fiction explores the effects of technology on people, often both good and bad.",
      hint:"Which detail in the passage surprises or worries you? That points to the consequence." }); } },
    { id:"rules", skill:"world", level:2, make(ctx){ return Q(Object.assign({ p:"Which detail best establishes a <b>rule</b> of this world?" }, Kit.unique(ctx, RULES)), {
      why:"A rule tells us what is allowed, impossible or dangerous in the world. Rules create problems for characters, which drives the plot. The other details add color but do not shape what characters can do.",
      key:"Strong world-building sets clear rules that create problems for the characters.",
      hint:"Which detail would change what a character can or cannot do?" }); } },
    { id:"plot-part", skill:"plot", level:2, make(ctx){
      const all = [];
      STORIES.forEach((_, si) => PK.forEach((_, pi) => all.push(si * 10 + pi)));
      const k2 = Kit.unique(ctx, all, x => "pp" + x);
      const s = Math.floor(k2 / 10), p = k2 % 10, kk = PK[p];
      return Kit.mc({ promptHtml:"This event comes from a science-fiction story plan. Which part of the plot is it?",
        exprHtml:box(STORIES[s][p]),
        options:shuffle(PK.filter(x => x !== kk)).slice(0, 3).map(x => ({ html:PLOT[x].n, fb:`${PLOT[x].n} ${PLOT[x].d}. That is not what this event does.` })).concat([{ html:PLOT[kk].n, correct:true }]),
        workHtml:`<p><b>${PLOT[kk].n}</b> ${PLOT[kk].d}.</p><p>The whole plan: ${STORIES[s].map((e, i) => `<br>${PLOT[PK[i]].n}: ${e}`).join("")}</p>`,
        key:"Climax = the conflict is faced head on. Falling action = right after. Resolution = the new normal.",
        hint:"Is the conflict starting, building, at its peak, just over, or long settled?" });
    } },
    { id:"plot-order", skill:"plot", level:2, make(ctx){
      const s = Kit.unique(ctx, [...STORIES.keys()], x => "po" + x);
      return Kit.order({ promptHtml:"Put these events from a science-fiction story plan in order, from exposition to resolution.",
        inOrder:STORIES[s], axis:["exposition", "resolution"],
        workHtml:"<p>" + STORIES[s].map((e, i) => `<b>${PLOT[PK[i]].n}:</b> ${e}`).join("<br>") + "</p>",
        key:"Find the climax first (the conflict faced head on), then build the order around it.",
        hint:"Start with the event that only introduces the character and setting." });
    } },
    { id:"suspense", skill:"susp", level:2, make(ctx){
      const it = Kit.unique(ctx, SUSP);
      return Kit.mc({ promptHtml:"Which technique does this passage <b>mainly</b> use to build suspense?", exprHtml:box(it.x),
        options:Object.keys(TECH).map(t => t === it.a ? { html:TECH[t], correct:true } : { html:TECH[t], fb:it.fb[t] }),
        workHtml:`<p><b>${TECH[it.a]}</b>. ${it.a === "short" ? "Clipped fragments speed up the pace, like a racing heartbeat." : it.a === "clock" ? "A deadline that is running out makes every second count." : it.a === "withheld" ? "A key fact is kept hidden, so the reader keeps reading to find out." : "The chapter stops right on a shock, so the reader must turn the page."}</p>`,
        key:"Short sentences, ticking clocks, withheld information and cliffhangers all keep readers reading.",
        hint:"Look at sentence length first, then ask: is there a deadline, a secret, or a shocking last line?" });
    } },
    { id:"symbol", skill:"theme", level:2, make(ctx){ return Q(Object.assign({ p:"What does the key object or image in this passage most likely symbolize?" }, Kit.unique(ctx, SYMB)), {
      why:"A symbol stands for a bigger idea. Look at when the object appears, how the character treats it and what is happening around it. The literal meaning is never the whole answer.",
      key:"A symbol is a concrete thing that stands for an abstract idea.",
      hint:"Why would the writer choose this object at this moment?" }); } },
    { id:"word", skill:"lang", level:2, make(ctx){ const it = Kit.unique(ctx, WORD); return Q(Object.assign({}, it, {
      why:`<b>${it.a}</b> is precise and creates the effect the sentence needs. Plain words like "went" or "big" tell the reader very little.` }), {
      key:"Choose the most precise word for the effect you want, not just a word that is correct.",
      hint:"Read the sentence with each word. Which one makes you feel the effect?" }); } },
    { id:"rev2", skill:"lang", level:2, make(ctx){ return Q(Object.assign({ p:"Which is the best revision of this sentence?" }, Kit.unique(ctx, REV2)), {
      key:"Concise, active sentences hit harder: cut repetition and filler, and put the doer first.",
      hint:"Who is doing the action? Are any words saying the same thing twice?" }); } },
    { id:"veldt2", skill:"veldt", level:2, make(ctx){ return Q(Kit.unique(ctx, VEL2), {
      key:"In The Veldt, the nursery and the lions reveal what the technology is doing to the family.",
      hint:"Connect the detail to the story's big idea: technology replacing parents." }); } },
    /* Level 3 */
    { id:"dump", skill:"world", level:3, make(ctx){ return Q(Object.assign({ p:"This sentence is an info-dump. Which revision builds the world best?" }, Kit.unique(ctx, DUMP)), {
      key:"Weave world-building into a character's actions instead of listing facts.",
      hint:"Which revision shows a character doing something in the world?" }); } },
    { id:"opening", skill:"lang", level:3, make(ctx){ const it = Kit.unique(ctx, OPEN); return Q(Object.assign({ p:`Here are four possible openings for a story about ${it.t}. Which creates the strongest science-fiction start?`,
      why:"The strongest opening drops the reader into a specific world with a hook: something strange, a problem or a question the reader needs answered. Weak openings announce the story, list facts or use clichés." }, it), {
      key:"A strong opening hooks the reader with a specific, strange detail or problem in the first line.",
      hint:"Which opening makes you ask a question you want answered?" }); } },
    { id:"fore3", skill:"susp", level:3, make(ctx){ const it = Kit.unique(ctx, FORE3); return Q({ x:"<b>The ending:</b> " + it.end,
      p:"Which sentence best foreshadows this ending <b>without giving it away</b>?", a:it.a, w:it.w,
      why:`"${it.a}" is a small, odd detail that makes the reader uneasy. It only makes full sense after the twist. Announcing the twist ruins the suspense, and neutral details hint at nothing.` }, {
      key:"Good foreshadowing is subtle: a hint, not an announcement.",
      hint:"Rule out any sentence that simply tells you the twist." }); } },
    { id:"theme3", skill:"theme", level:3, make(ctx){ return Q(Object.assign({ p:"Which is the best theme statement for this story?",
      why:"A strong theme statement is a full sentence, applies beyond the story, and is an insight rather than a command. Topics, plot summaries and 'you should' rules are all weaker." }, Kit.unique(ctx, THEME3)), {
      key:"A theme is a full-sentence insight about life, not a topic, a summary or a command.",
      hint:"Rule out single words, plot summaries and 'should/never' rules." }); } },
    { id:"rev3", skill:"lang", level:3, make(ctx){ return Q(Object.assign({ p:"This sentence uses a cliché. Which revision is strongest?" }, Kit.unique(ctx, REV3)), {
      key:"Replace clichés with fresh, specific images that fit your story's world.",
      hint:"Which option says something nobody has said before?" }); } },
    { id:"veldt3", skill:"veldt", level:3, make(ctx){ return Q(Kit.unique(ctx, VEL3), {
      key:"The Veldt uses irony and symbolic setting to warn about handing parenting to machines.",
      hint:"Think about the gap between what the house promises and what it does." }); } }
  ];
  registerTopic(T);
})();

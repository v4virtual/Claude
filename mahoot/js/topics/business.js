/* ===== Topic: Year 8 I&S, Business, markets and marketing ===== */
(() => {
  const T = {
    id:"business", code:"B", year:8, subject:"I&S", name:"Business, markets and marketing",
    blurb:"Needs and wants, goods and services, factors of production, types of market, the 7Ps, target customers and judging a business pitch.",
    levels: Kit.LEVELS3,
    defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:45,
    skills:{
      needs:  { name:"Needs and wants", short:"Needs and wants", lesson:0 },
      goods:  { name:"Goods and services", short:"Goods and services", lesson:0 },
      fop:    { name:"Factors of production and their rewards", short:"Factors of production", lesson:1 },
      markets:{ name:"Types and purposes of markets", short:"Markets", lesson:2 },
      sevenp: { name:"The 7Ps of marketing", short:"The 7Ps", lesson:3 },
      target: { name:"Target customers and value propositions", short:"Target customers", lesson:4 },
      pitch:  { name:"Evaluating a business pitch", short:"Business pitch", lesson:5 }
    },
    lessons:[],
    introHtml:"",
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl).map(q => q.type === "num" && !q.answerHtml ? Object.assign(q, { answerHtml:(q.answer < 0 ? "−" : "") + (q.pre || "") + commas(Math.abs(q.answer)) + (q.suf || "") }) : q); }
  };

  /* ---------- helpers ---------- */
  const B = s => "<b>" + s + "</b>";
  const commas = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const $ = n => "$" + commas(n);
  const lc = s => s[0].toLowerCase() + s.slice(1);
  const NAMES = ["Sam", "Ana", "Leo", "Mia", "Ravi", "Zoe", "Omar", "Lina", "Kai", "Nora", "Theo", "Iris", "Yusuf", "Maya", "Jonah", "Priya", "Elena", "Tomas", "Aiko", "Ben", "Sofia", "Arjun"];
  /* money answers: accept 500000, 500,000, $500,000 and 2.5 or 2,5 */
  const money = s => {
    let t = String(s == null ? "" : s).trim().replace(/[$\s]/g, "").replace(/−/g, "-");
    if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, ""); else t = t.replace(",", ".");
    return /^-?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN;
  };
  function mcq(promptHtml, correct, wrongs, workHtml, key, hint, extra){
    return Kit.mc(Object.assign({ promptHtml, options:[{ html:correct, correct:true }].concat(wrongs.map(w => ({ html:w[0], fb:w[1] }))), workHtml, key, hint }, extra || {}));
  }
  function fromBank(ctx, bank, hint){
    const x = Kit.unique(ctx, bank, b => b.q + "|" + (b.ex || ""));
    return mcq(x.q, x.a, x.w, x.work, x.key, x.hint || hint || "Recall the definition, then test each option against it.", x.ex ? { exprHtml:x.ex } : null);
  }
  function fresh(ctx, make, keyOf){
    let x;
    for (let i = 0; i < 12; i++) { x = make(); if (!ctx.used.has(keyOf(x))) break; }
    ctx.used.add(keyOf(x));
    return x;
  }
  const AS = { Need:"a need", Want:"a want", Good:"a good", Service:"a service", B2B:"a B2B sale", B2C:"a B2C sale", "Physical market":"a physical market", "Online market":"an online market",
    Local:"a local market", National:"a national market", International:"an international market", "Mass market":"a mass market", "Niche market":"a niche market",
    Age:"segmentation by age", Income:"segmentation by income", Location:"segmentation by location", Lifestyle:"segmentation by lifestyle" };
  /* classify an item into one of several labeled groups */
  function classify(ctx, id, groups, prompt, defs, key, hint, keepOrder){
    const x = fresh(ctx, () => { const g = pick(Object.keys(groups)); return { g, item:pick(groups[g]) }; }, x => id + x.item);
    return Kit.mc({ promptHtml:prompt, exprHtml:'<div class="display">' + x.item + "</div>",
      options:Object.keys(groups).map(g => g === x.g ? { html:g, correct:true } : { html:g, fb:defs[g] + " This example is " + (AS[x.g] || lc(x.g)) + "." }),
      keepOrder:keepOrder !== false,
      workHtml:"<p>" + B(x.item) + ": " + B(x.g) + ". " + defs[x.g] + "</p>", key, hint });
  }

  /* ---------- needs and wants, goods and services ---------- */
  const NEEDS = ["Clean drinking water", "Basic food, such as rice, bread and vegetables", "A safe place to live", "A warm coat in a freezing winter",
    "Medicine a doctor prescribes for an illness", "A visit to a doctor when you are sick", "A toilet and clean water for washing"];
  const WANTS = ["A new gaming console", "Designer sneakers", "Concert tickets", "A music streaming subscription", "The newest smartphone model", "A box of chocolates",
    "A beach vacation", "A second pair of headphones", "A sports car", "Takeout pizza", "Movie tickets", "A gold necklace", "A fizzy drink", "A bigger TV",
    "Trendy sunglasses", "A gaming chair", "In-game skins for a video game", "A theme park ticket", "A designer handbag", "A drone with a camera"];
  const NW_DEF = { Need:"A need is something people must have to survive and stay healthy: food, water, shelter, basic clothing, healthcare.",
    Want:"A want is something people would like to have but can live without." };
  const GOODS = ["A bicycle", "A loaf of bread", "A textbook", "A smartphone", "A pair of jeans", "A bottle of shampoo", "A football", "A laptop", "A box of cereal",
    "A desk lamp", "A packet of seeds", "A reusable water bottle", "A skateboard", "A tube of toothpaste"];
  const SERVICES = ["A haircut", "A bus ride", "A dental check-up", "A piano lesson", "A phone screen repair", "A car wash", "Home insurance", "A guided museum tour",
    "A plumber fixing a leak", "Dog walking", "A taxi ride", "Online tutoring", "Delivery of a parcel", "A personal training session"];
  const GS_DEF = { Good:"A good is a physical (tangible) product you can touch, store and own.",
    Service:"A service is an activity done for you. It is intangible: you cannot touch or store it." };
  const GS_BANK = [
    { q:"What does intangible mean?", a:"It cannot be touched or stored, like a haircut or a lesson",
      w:[["It is very expensive", "Intangible is about being physical or not, not about price."], ["It is made in a factory", "Factory products are usually tangible goods."], ["It can only be bought online", "Intangible services can be bought anywhere."]],
      work:"<p>Services are <b>intangible</b>: you experience them but cannot hold them. Goods are <b>tangible</b>.</p>", key:"Goods are tangible; services are intangible." },
    { q:"A restaurant meal is best described as:", a:"A mix of a good (the food) and a service (cooking and serving it)",
      w:[["Only a good", "The cooking, serving and cleaning up are services you pay for too."], ["Only a service", "The food itself is a tangible good."], ["Neither a good nor a service", "It clearly includes both."]],
      work:"<p>Many purchases combine both: the <b>food</b> is a good and the <b>cooking and table service</b> are services.</p>", key:"Many products combine goods and services." },
    { q:"Which feature is typical of a service but not of a good?", a:"It is produced and used at the same time, so it cannot be stored for later",
      w:[["It can be kept on a shelf until someone buys it", "Goods can be stored; services cannot."], ["You own a physical object afterwards", "That is true of goods."], ["It is always free", "Services usually cost money, for example a haircut."]],
      work:"<p>A haircut happens while you are in the chair. You cannot make haircuts in advance and store them: services are produced and used <b>at the same time</b>.</p>", key:"Services cannot be stored; goods can." },
    { q:"A phone-repair shop sells new phone cases and also fixes broken screens. Which is correct?", a:"The cases are goods; the screen repairs are a service",
      w:[["Both are goods", "Fixing a screen is an activity done for the customer, so it is a service."], ["Both are services", "A phone case is a physical product you take home."], ["The cases are a service; the repairs are goods", "This is the wrong way round."]],
      work:"<p>The <b>case</b> is tangible, so it is a good. The <b>repair</b> is work done for you, so it is a service. Many businesses sell both.</p>", key:"Ask: can I hold it, or is it something done for me?" }
  ];

  /* ---------- factors of production ---------- */
  const FOP = {
    Land:["The field where a farmer grows wheat", "Oil under the ground that a company drills for", "Trees cut down for timber", "Fish caught in the ocean",
      "Iron ore dug out of a mine", "Fresh water taken from a lake by a bottling company", "The plot of ground a café is built on"],
    Labor:["The work of a chef cooking meals in a restaurant", "A delivery driver's time and effort", "A software developer writing code for an app", "A cashier serving customers",
      "A hairdresser cutting hair", "Factory workers assembling bikes", "A builder laying bricks"],
    Capital:["A delivery van", "An oven in a bakery", "A tractor on a farm", "Computers used by an office team", "A factory building", "A sewing machine in a clothing workshop",
      "A coffee machine in a café", "Tools in a repair shop", "A fishing boat", "Robots on a car assembly line"],
    Entrepreneurship:["The founder who risks her savings to start a food truck", "The person who has a business idea and organizes the other factors to make it happen",
      "An owner who decides to take the risk of opening a second store", "A student who starts a tutoring business and takes the loss if it fails"]
  };
  const FOP_DEF = { Land:"Land means natural resources: anything that comes from nature, like fields, water, minerals, forests and fish.",
    Labor:"Labor is the human effort, physical or mental, that workers put in.",
    Capital:"Capital means human-made goods used to produce other goods and services, like tools, machines, vehicles and buildings.",
    Entrepreneurship:"Entrepreneurship is having the idea, organizing the other factors and taking the risk." };
  const REWARD = { Land:"Rent", Labor:"Wages", Capital:"Interest", Entrepreneurship:"Profit" };
  const FOP_BIZ = [
    { b:"a wheat farm", Land:"the field where the wheat grows", Labor:"the farmhands' work at harvest time", Capital:"the tractor", Entrepreneurship:"the farmer who started the farm and risks her savings" },
    { b:"a café", Land:"the plot of ground the café stands on", Labor:"the barista's work making drinks", Capital:"the espresso machine", Entrepreneurship:"the owner who opened the café and takes the risk" },
    { b:"a fishing company", Land:"the fish in the sea", Labor:"the crew's work hauling in the nets", Capital:"the fishing boat", Entrepreneurship:"the founder who borrowed money to buy the first boat and carries the risk" },
    { b:"a delivery company", Land:"the plot of ground the depot is built on", Labor:"the drivers' work delivering parcels", Capital:"the delivery vans", Entrepreneurship:"the founder who planned the business and takes the risk" },
    { b:"a furniture workshop", Land:"the trees cut down for timber", Labor:"the carpenter's work", Capital:"the saws and drills", Entrepreneurship:"the owner who organizes everything and takes the risk" },
    { b:"a bottled-water company", Land:"the spring water from underground", Labor:"the factory workers' work", Capital:"the bottling machine", Entrepreneurship:"the founder who put her own money into the business" },
    { b:"a mining company", Land:"the copper ore in the ground", Labor:"the miners' work", Capital:"the drilling machines", Entrepreneurship:"the founder who risked money on finding the ore" }
  ];

  const FOP_HARD = [
    { q:"A farmer rents a field, hires two workers, buys a tractor with a bank loan and takes the risk of planting a new crop. Which payment is the reward for <b>capital</b>?", a:"The interest paid on the loan for the tractor",
      w:[["The rent paid for the field", "Rent is the reward for land (the field)."], ["The wages paid to the two workers", "Wages are the reward for labor."], ["The profit the farmer keeps if the crop sells well", "Profit is the reward for entrepreneurship."]],
      work:"<p>The tractor is <b>capital</b>, and the money to buy it was borrowed, so the lender's reward is <b>interest</b>. Field → rent; workers → wages; farmer's risk → profit.</p>", key:"Land → rent, labor → wages, capital → interest, entrepreneurship → profit." },
    { q:"Is a factory building land or capital?", a:"Capital, because people built it to help produce goods",
      w:[["Land, because it stands on the ground", "The ground under it is land, but the building itself is human-made, so it is capital."], ["Labor, because workers use it", "Labor is the workers' effort, not the building."], ["Entrepreneurship, because the owner chose it", "Entrepreneurship is the idea and risk-taking, not the building."]],
      work:"<p>Anything <b>made by people</b> and used to produce other goods or services is <b>capital</b>: buildings, machines, vehicles, tools.</p>", key:"Human-made production tools and buildings are capital." },
    { q:"A chef owns her own restaurant, cooks in the kitchen every night and carries the risk if it fails. Which factors of production does she provide herself?", a:"Labor (her cooking) and entrepreneurship (owning it and taking the risk)",
      w:[["Only labor", "She also owns the business and carries the risk, which is entrepreneurship."], ["Only land", "Land is a natural resource such as the ground or water."], ["Only capital", "Capital is the human-made equipment, such as the ovens."]],
      work:"<p>One person can provide more than one factor. Cooking is <b>labor</b>; organizing the business and taking the risk is <b>entrepreneurship</b>.</p>", key:"One person can supply more than one factor of production." },
    { q:"Which of these is <b>not</b> capital for a fishing company?", a:"The fish in the sea",
      w:[["The fishing boat", "A boat is human-made equipment, so it is capital."], ["The nets", "Nets are human-made tools, so they are capital."], ["The refrigerated truck", "A truck is a human-made vehicle used in production, so it is capital."]],
      work:"<p>The fish are a <b>natural resource</b>, so they count as <b>land</b>. The boat, nets and truck are human-made, so they are capital.</p>", key:"Natural resources are land; human-made tools are capital." },
    { q:"A small app company's main resources are its coders and its computers. Which two factors of production are these?", a:"Labor (the coders' work) and capital (the computers)",
      w:[["Land and labor", "Computers are human-made, so they are capital, not land."], ["Capital and entrepreneurship", "The coders' work is labor."], ["Land and capital", "The coders' work is labor, and nothing here is a natural resource."]],
      work:"<p>The coders' mental effort is <b>labor</b>. The computers are human-made tools, so they are <b>capital</b>.</p>", key:"Labor is human effort, physical or mental." },
    { q:"Rainwater that a farmer collects to water her crops is an example of which factor of production?", a:"Land",
      w:[["Capital", "The rain is natural; only human-made tools, such as the collection tank, are capital."], ["Labor", "Labor is human effort, not water."], ["Entrepreneurship", "Entrepreneurship is the idea and risk-taking."]],
      work:"<p>Water from nature is a <b>natural resource</b>, so it counts as <b>land</b>. The tank built to collect it would be capital.</p>", key:"Land includes all natural resources, not just ground." }
  ];

  /* ---------- markets ---------- */
  const MK1 = {
    B2B:["A bakery buys flour from a flour mill", "A car maker buys tires from a tire factory", "A restaurant buys tables from a furniture supplier", "A café buys coffee beans from a roaster",
      "A clothing brand pays a factory to sew its T-shirts", "A supermarket buys apples from a farm", "A delivery company buys vans from a vehicle maker", "An app developer pays a cloud company to host its servers"],
    B2C:["A student buys a sandwich from a café", "A family buys a TV from an electronics store", "A teenager buys a game from an app store", "A customer pays a salon for a haircut",
      "A runner buys shoes online from a sneaker brand", "A tourist rents a bike from a bike-rental company", "Parents pay a tutoring company for lessons", "A shopper buys groceries at a supermarket"]
  };
  const MK1_DEF = { B2B:"B2B (business to business) means a business sells to another business.", B2C:"B2C (business to consumer) means a business sells to individual people for their own use." };
  const MK2 = {
    "Physical market":["A farmers' market where people meet sellers face to face", "A shopping mall", "A street food market", "A car showroom", "A weekend flea market", "A local hardware store"],
    "Online market":["An online auction website", "An app store", "A website selling secondhand textbooks", "A social media shop where people order by message", "A food-delivery app", "An online ticket-booking site"]
  };
  const MK2_DEF = { "Physical market":"A physical market is a real place where buyers and sellers meet in person.", "Online market":"An online market is where buyers and sellers trade over the internet." };
  const MK3 = {
    Local:["A corner bakery selling to people in its neighborhood", "A window cleaner who works in one town", "A mobile hairdresser visiting homes in one small area", "A school uniform shop serving one town's schools"],
    National:["A bus company running routes between cities across one country", "A supermarket chain with stores across one country and none abroad", "A newspaper sold throughout one country", "A phone network that only covers one country"],
    International:["A sneaker brand selling to customers in 40 countries", "A coffee company that buys beans in Colombia and sells in Europe", "A streaming service available around the world", "A car maker exporting to Asia, Europe and Africa"]
  };
  const MK3_DEF = { Local:"A local market serves one town, city or neighborhood.", National:"A national market covers one whole country.", International:"An international market crosses borders into several countries." };
  const MK4 = {
    "Mass market":["Bottled water sold in every supermarket", "Basic white T-shirts", "Toothpaste", "A popular soft drink", "Ordinary paper towels", "Basic smartphones for everyday users"],
    "Niche market":["Handmade guitars for left-handed players", "Gluten-free dog treats", "Climbing shoes for professional climbers", "Vintage vinyl records", "Adaptive kayaks for paddlers with disabilities", "Luxury watches costing over $10,000"]
  };
  const MK4_DEF = { "Mass market":"A mass market is a very large market selling the same general product to lots of different customers.", "Niche market":"A niche market is a small, specialized part of a market with particular needs." };
  const MK_BANK = [
    { q:"What is a market?", a:"Any place or system where buyers and sellers exchange goods or services",
      w:[["Only an outdoor place where food is sold", "That is one kind of market, but markets can be online, local or worldwide, and sell anything."], ["A factory where goods are made", "A factory produces goods; a market is where they are bought and sold."], ["A list of a company's competitors", "Competitors are part of a market, but a market is where trading happens."]],
      work:"<p>A <b>market</b> is wherever buyers and sellers come together to trade: a street market, a shop, a website or an app.</p>", key:"Market = buyers and sellers coming together to trade." },
    { q:"What is one main purpose of a market?", a:"To bring buyers and sellers together so they can agree on prices and trade",
      w:[["To make sure every product is free", "Markets set prices; they do not make things free."], ["To stop businesses from competing", "Markets usually increase competition between sellers."], ["To produce raw materials", "Producing materials uses factors of production; markets are where trade happens."]],
      work:"<p>Markets let buyers find sellers, compare products and agree a <b>price</b>. Prices in a market help show what people want.</p>", key:"Markets bring buyers and sellers together and set prices." },
    { q:"What does B2B mean?", a:"Business to business: one business sells to another",
      w:[["Buyer to buyer", "B2B stands for business to business."], ["Business to buyer: a shop sells to the public", "Selling to the public is B2C (business to consumer)."], ["Back to basics", "It is a business term for business-to-business trade."]],
      work:"<p><b>B2B</b>: business to business, like a mill selling flour to a bakery. <b>B2C</b>: business to consumer, like the bakery selling bread to you.</p>", key:"B2B sells to businesses; B2C sells to consumers." },
    { q:"What is a niche market?", a:"A small, specialized part of a market with particular needs",
      w:[["A market where everything is sold cheaply", "Niche is about being specialized, not cheap. Niche products are often expensive."], ["The largest market in a country", "That sounds like a mass market."], ["A market that only exists online", "Niche markets can be online or physical."]],
      work:"<p>A <b>niche market</b> is small and specialized, like left-handed guitars. A <b>mass market</b> is huge and general, like toothpaste.</p>", key:"Niche = small and specialized; mass = large and general." },
    { q:"Who is a consumer?", a:"A person who buys and uses a good or service for their own use",
      w:[["A business that makes products", "That is a producer."], ["A worker in a factory", "Workers provide labor; they may also be consumers when they shop."], ["Someone who only sells things", "Sellers supply the market; consumers buy and use the products."]],
      work:"<p>A <b>consumer</b> is the final user: the person who buys a sandwich to eat it. In B2C markets, businesses sell to consumers.</p>", key:"Consumers buy goods and services for their own use." }
  ];
  const MK_HARD = [
    { q:"Many fans want tickets for a concert, but there are only a few seats. What is most likely to happen to the price of tickets?", a:"It rises, because demand is high and supply is limited",
      w:[["It falls, because the concert is popular", "When many buyers compete for few items, sellers can charge more."], ["It stays the same, because prices never change", "Market prices change with demand and supply."], ["It falls to zero", "There is no reason for tickets to become free."]],
      work:"<p>High <b>demand</b> (many buyers) and low <b>supply</b> (few seats) push the price <b>up</b>.</p>", key:"High demand + low supply → higher prices." },
    { q:"A new phone model is released, and fewer people want the old model. What will most likely happen to the price of the old model?", a:"It falls, because demand for it has dropped",
      w:[["It rises, because it is older", "Older products usually lose demand, so prices fall."], ["It stays the same", "When demand drops, sellers usually lower prices to sell their stock."], ["It rises, because it is now rare", "Shops still have plenty in stock, and fewer people want it."]],
      work:"<p>Lower <b>demand</b> with the same supply means sellers lower the price to attract buyers.</p>", key:"Lower demand → lower prices." },
    { q:"Strawberries are usually cheaper in summer than in winter. What is the best explanation?", a:"In summer supply is high, because they are in season",
      w:[["Nobody eats strawberries in summer", "People do buy them in summer. The difference is supply."], ["Shops are closed in winter", "Shops are open; there are simply fewer strawberries available."], ["Strawberries cost more to eat in summer", "The price paid depends on supply and demand, not the time you eat them."]],
      work:"<p>When strawberries are in season, <b>supply</b> is high, so prices fall. In winter they must be grown in greenhouses or imported, so supply is lower and prices rise.</p>", key:"High supply → lower prices." },
    { q:"Why might a small business choose a niche market instead of a mass market?", a:"There is less competition from big companies, and customers may pay more for something specialized",
      w:[["Because niche markets always have the most customers", "Niche markets are small; that is their point."], ["Because niche products never need marketing", "Every product needs marketing, including niche ones."], ["Because mass markets are illegal for small firms", "Small firms can sell in mass markets, but they face giant competitors."]],
      work:"<p>Big companies dominate <b>mass markets</b> with low prices. A small firm can win in a <b>niche</b> by serving special needs well and charging more.</p>", key:"Niche: fewer customers, but less competition and higher prices." },
    { q:"What is one advantage of selling in an online market for a new small business?", a:"It can reach customers far away without paying rent for a shop",
      w:[["Customers can touch the product before buying", "That is an advantage of a physical shop."], ["There is no competition online", "Online markets often have many competitors."], ["Delivery is always free for the business", "Delivery has costs that someone must pay."]],
      work:"<p>An <b>online market</b> lets a business reach national or international customers with lower costs than a physical shop.</p>", key:"Online: wide reach, lower premises costs, but strong competition." },
    { q:"A market has many sellers offering almost the same product. What usually happens?", a:"Sellers compete on price and quality, which benefits buyers",
      w:[["Prices rise sharply", "With many sellers, a seller who charges too much loses customers."], ["Buyers have fewer choices", "Many sellers means more choice."], ["Sellers stop trying to attract customers", "Competition makes sellers try harder."]],
      work:"<p><b>Competition</b> pushes sellers to lower prices or improve quality to win customers.</p>", key:"More competition → better prices and quality for buyers." }
  ];

  /* ---------- 7Ps ---------- */
  const PS = ["Product", "Price", "Place", "Promotion", "People", "Process", "Physical evidence"];
  const P_DEF = {
    Product:"Product is about what is sold: its features, quality, design and range.",
    Price:"Price is about how much customers pay, including deals and payment options.",
    Place:"Place is about where and how customers can get the product: locations, stores, online channels and delivery.",
    Promotion:"Promotion is about how the business tells and persuades customers: ads, social media and sponsorship.",
    People:"People is about the staff who serve customers: who is hired, how they are trained and how they behave.",
    Process:"Process is about the steps and systems for serving customers: ordering, booking, paying, tracking and waiting times.",
    "Physical evidence":"Physical evidence is what customers can see and touch that shows quality: the premises, the decor, the website's look and branded items."
  };
  const BIZ7 = [
    { n:"Rise & Shine Bakery", ds:["adds a gluten-free sourdough loaf to its range", "charges $3 per croissant, or 4 for $10", "opens a second stall at the weekend farmers' market",
      "posts videos of bread being baked on social media", "trains staff to explain which breads contain nuts", "introduces numbered tickets so customers are served in order",
      "installs a glass counter so customers can see the fresh bread"] },
    { n:"FixFast, a phone-repair shop", ds:["adds battery replacement to the repairs it offers", "charges a fixed $49 for any screen repair", "opens a repair kiosk inside a busy shopping mall",
      "sponsors a local youth soccer team, with its logo on the shirts", "hires certified technicians and trains them to explain repairs clearly", "sends a text message at each stage of the repair so customers can track it",
      "keeps a clean, bright workbench where customers can watch the repair"] },
    { n:"LoopBottle, an eco water-bottle startup", ds:["makes its bottle from recycled steel with a leak-proof lid", "sets the price at $25, higher than plastic bottles, to signal quality", "sells through its own website and in outdoor-equipment stores",
      "partners with hiking influencers who show the bottle on their trails", "trains its support team to answer questions about recycling", "puts a prepaid return label in every box so returns are easy",
      "designs a clean website with clear photos of the bottle"] },
    { n:"PixelQuest, a gaming app", ds:["adds a new level and a two-player mode", "is free to download, with optional $2 upgrades", "makes the app available in both major phone app stores",
      "runs short video ads on streaming platforms", "hires friendly moderators to help players in the chat", "lets players sign up in one tap with an existing account",
      "designs a polished app icon and store page with clear screenshots"] },
    { n:"Snip Studio, a hair salon", ds:["adds a new hair-coloring service", "offers a lower student price on weekdays", "opens in a street next to the train station",
      "posts before-and-after photos on social media", "trains stylists to greet every customer by name", "uses an online booking system so customers choose their own time slot",
      "redecorates the waiting area with comfortable chairs and plants"] },
    { n:"Taco Wheels, a food truck", ds:["adds a vegan taco to the menu", "charges $4 per taco or $10 for a meal deal", "parks outside the sports stadium on game days",
      "announces its location each day on social media", "hires a cook with years of street-food experience", "lets customers order and pay on their phones so the line moves faster",
      "paints the truck in bright colors with the menu clearly displayed"] },
    { n:"BrightPath, a tutoring service", ds:["adds exam-preparation courses for science", "charges $30 per hour, or $100 for four sessions", "offers lessons by video call as well as in a local library",
      "puts up posters in community centers", "only hires tutors who have teaching experience", "sends parents a short progress report after every lesson",
      "gives each student a neat workbook with the company's logo"] },
    { n:"CityCycle, a bike-rental company", ds:["adds electric bikes to its fleet", "charges $3 per hour, up to a maximum of $15 per day", "puts bike docks next to every metro station",
      "advertises on buses and in the city newspaper", "trains staff to help tourists choose safe routes", "lets riders unlock bikes by scanning a QR code in the app",
      "keeps every bike clean and painted in the same bright green"] },
    { n:"Stride, a sneaker brand", ds:["uses a new, lighter sole designed for runners", "launches a limited edition at a premium price of $180", "sells only in its own stores and on its website",
      "sponsors a well-known athlete to wear the sneakers in races", "trains store staff to measure customers' feet and recommend a size", "offers free 30-day returns through a simple online form",
      "builds a small running track in its flagship store so customers can test shoes"] },
    { n:"Corner Cup, a café", ds:["adds oat milk as an option for every drink", "raises the price of a latte from $4.00 to $4.50", "opens a takeaway window facing the street",
      "runs an advertisement in the local school newsletter", "trains baristas to remember regular customers' orders", "installs a self-order screen to cut waiting times",
      "uses comfortable seating, plants and soft lighting to create a relaxing space"] }
  ];
  const P7_HARD = [
    ["Customers say the shop is hard to find and far from public transport.", "Place"],
    ["Customers love the product, but most say they had never heard of the brand until a friend told them.", "Promotion"],
    ["Customers complain that staff were rude and could not answer their questions.", "People"],
    ["Online orders often arrive late because there is no clear system for packing and shipping them.", "Process"],
    ["Customers say the product breaks after only a few uses.", "Product"],
    ["Customers like the drink but say it costs twice as much as similar drinks nearby.", "Price"],
    ["Customers say the waiting room is dirty and the website looks unprofessional, so they doubt the quality.", "Physical evidence"],
    ["The menu has no vegetarian options, and many customers ask for them.", "Product"],
    ["Sales are low because the business has not posted on social media or advertised for months.", "Promotion"],
    ["Customers say the online booking form is confusing and takes too many steps.", "Process"],
    ["The bottle is only sold in one city, but people across the country want to buy it.", "Place"],
    ["A rival offers a similar service at a much lower price, and customers are switching.", "Price"],
    ["New staff have not been trained, so customers get different advice on each visit.", "People"],
    ["The shop's sign is faded and the shelves are messy, so passers-by think it has closed.", "Physical evidence"],
    ["People wait 20 minutes to pay because every order is written by hand.", "Process"],
    ["Customers want the phone case in more colors and sizes.", "Product"]
  ];

  /* ---------- target customers ---------- */
  const SEG = {
    Age:["A toy company designs products for children aged 3 to 5", "A travel company offers trips designed for people over 60", "A clothing brand aims its range at teenagers aged 13 to 17",
      "A bank offers a first account for 16- to 18-year-olds", "A game studio makes simple learning games for 6- to 8-year-olds"],
    Income:["A car brand sells luxury models to high earners", "A supermarket offers a budget range for shoppers on low incomes", "A jeweler targets wealthy customers with diamond watches",
      "A phone company sells a cheap, basic phone for customers on tight budgets", "A hotel offers $900-a-night suites for very rich travelers"],
    Location:["A snow-shovel company advertises only in cold northern regions", "A café targets office workers within a few blocks", "A surf shop focuses on customers living in coastal towns",
      "A grocery delivery service only serves one city", "A sunscreen brand advertises mainly in hot, sunny countries"],
    Lifestyle:["A brand targets people who care deeply about the environment", "A gym chain targets people who want a healthy, active life", "A snack company targets people who follow a vegan diet",
      "A travel company targets adventure lovers who enjoy extreme sports", "A camping-gear company targets people who love the outdoors"]
  };
  const SEG_DEF = { Age:"Age segmentation groups customers by how old they are.", Income:"Income segmentation groups customers by how much money they earn or can spend.",
    Location:"Location (geographic) segmentation groups customers by where they live or work.", Lifestyle:"Lifestyle segmentation groups customers by their interests, values and way of living." };
  const TG_BANK = [
    { q:"What is a target market?", a:"The specific group of customers a business aims to sell to",
      w:[["Everyone in the country", "Very few products suit everyone; businesses focus on the customers most likely to buy."], ["The place where products are made", "That is a factory or workshop."], ["The business's competitors", "Competitors sell to the same customers; they are not the target market."]],
      work:"<p>A <b>target market</b> is the group of customers a business focuses its product and marketing on.</p>", key:"Target market = the customers you aim to sell to." },
    { q:"What is market segmentation?", a:"Dividing a market into groups of customers with similar characteristics, such as age, income, location or lifestyle",
      w:[["Splitting a business into departments", "That is about how a business is organized, not its customers."], ["Selling the same product to everyone in the same way", "That is mass marketing, the opposite of segmentation."], ["Cutting the price of a product", "Price changes are not segmentation."]],
      work:"<p><b>Segmentation</b> divides customers into groups (segments) so a business can choose one to target.</p>", key:"Segment by age, income, location or lifestyle." },
    { q:"What is a value proposition?", a:"A clear statement of the benefit a product gives its customers and why it is better than other options",
      w:[["The price of the product", "Price is one of the 7Ps, not the value proposition."], ["The company's logo", "A logo is branding. A value proposition explains the benefit."], ["A list of the company's costs", "Costs are about the business, not what the customer gains."]],
      work:"<p>A <b>value proposition</b> answers: why should <i>this</i> customer buy <i>this</i> product instead of something else?</p>", key:"Value proposition = customer benefit + what makes it different." },
    { q:"What is a unique selling point (USP)?", a:"A feature or benefit that makes a product different from its competitors",
      w:[["Any product that is sold in only one shop", "A USP is about what makes the product different, not where it is sold."], ["The lowest price in the market", "A low price can be a USP, but a USP can be any distinctive feature."], ["The company's first sale", "A USP is a distinctive feature, not an event."]],
      work:"<p>A <b>USP</b> is what makes a product stand out, for example a bottle that keeps drinks cold for 24 hours.</p>", key:"USP = what makes you different." },
    { q:"Why do businesses segment their market?", a:"To design products and marketing for the customers most likely to buy",
      w:[["To avoid having any customers", "Segmentation helps a business find the right customers."], ["To make products more expensive to produce", "Segmentation is about customers, not production costs."], ["Because it is required by law", "It is a business choice, not a legal rule."]],
      work:"<p>Segmenting helps a business spend its marketing money on the right people and design a product they really want.</p>", key:"Segmentation focuses products and marketing on the most likely buyers." }
  ];
  const TARGET = [
    ["A focus app with exam timers and revision planners", "Secondary school and university students preparing for exams", [["Retired people who enjoy gardening", "They are not preparing for exams."], ["Toddlers learning to talk", "Toddlers do not take exams or use revision planners."], ["Professional chefs", "Nothing about the app is aimed at cooking."]]],
    ["Lightweight trail-running shoes with extra grip", "Active adults who run on hiking trails", [["Office workers who need formal shoes", "Trail shoes are not formal footwear."], ["Babies learning to walk", "These are adult running shoes."], ["People who never exercise", "The product is made for active runners."]]],
    ["A simple phone with large buttons and an emergency call button", "Older adults who want an easy-to-use phone", [["Teenage gamers", "Gamers want powerful phones, not simple ones."], ["Professional photographers", "They need excellent cameras, not large buttons."], ["App developers", "Developers want advanced features."]]],
    ["Organic baby-food pouches", "Parents of babies who care about healthy, organic food", [["Teenagers looking for snacks", "The product is made for babies."], ["Professional athletes", "Baby food is not designed for athletes."], ["Pet owners", "It is food for babies, not pets."]]],
    ["A $3,000 professional camera", "Professional photographers who can afford high-end equipment", [["Children buying their first camera", "The price and features are far beyond a beginner's needs."], ["Students on a tight budget", "$3,000 is too expensive for tight budgets."], ["People who only take photos on their phone", "They are unlikely to pay for a professional camera."]]],
    ["A dog-walking service available during work hours", "Busy dog owners who work long days", [["People who do not own pets", "They have no dog to walk."], ["Dog owners who work from home and walk their dogs themselves", "They already walk their dogs, so they need the service less."], ["Cat owners", "Cats do not usually need walking."]]],
    ["A meal-kit delivery service with 20-minute recipes", "Busy working adults who want quick, home-cooked meals", [["Professional chefs who cook all day", "Chefs do not need simple recipe kits."], ["Young children", "Children do not buy or cook meal kits."], ["People who never cook and only eat out", "They are unlikely to cook kits at home."]]],
    ["Online coding lessons for beginners aged 10 to 14", "Parents of 10- to 14-year-olds who are interested in technology", [["Expert software engineers", "The lessons are for beginners."], ["Retired people", "The lessons are designed for children aged 10 to 14."], ["Toddlers", "Toddlers are far too young."]]],
    ["A waterproof phone pouch", "Surfers and swimmers who take their phones to the beach", [["People who never go near water", "They do not need waterproofing."], ["Office workers at their desks", "Phones on desks rarely need waterproof pouches."], ["Librarians", "Nothing about a library needs a waterproof pouch."]]],
    ["An ergonomic gaming chair", "Gamers who play for long hours", [["People who rarely sit down", "A chair for long sessions does not suit them."], ["Babies", "This is adult furniture."], ["Marathon runners looking for running gear", "This is not running gear."]]],
    ["A luxury spa weekend", "High-income adults looking to relax", [["Students on a tight budget", "A luxury weekend is expensive."], ["Young children", "Spa weekends are aimed at adults."], ["Businesses buying office supplies", "This is a consumer leisure service, not an office supply."]]],
    ["Rain ponchos sold at a music festival", "Festival-goers attending in wet weather", [["People at home in sunny weather", "They have no need for a poncho."], ["Professional divers", "Divers need wetsuits, not ponchos."], ["Office managers", "Nothing about the poncho suits an office."]]],
    ["A board game designed for family nights", "Families with children aged 8 and over", [["Professional chess players", "They want serious competition, not a family game."], ["People who live alone and dislike games", "The game needs several players who enjoy games."], ["Babies", "Babies cannot play board games."]]],
    ["Reusable beeswax food wraps", "Eco-conscious households trying to use less plastic", [["People who do not care about waste", "The main benefit is reducing plastic."], ["Factories that need industrial packaging", "Small wraps are for homes, not factories."], ["Restaurants that need 10,000 wraps a day", "The product is designed for households."]]]
  ];
  const VP = [
    ["LoopBottle, a steel water bottle", "hikers", "Keeps water cold for 24 hours on the trail, and the leak-proof lid means no more wet backpacks.",
      [["We are the best bottle company in the world.", "Vague and unproven: it does not say what the customer gains."], ["Our bottle is made of steel.", "This is a feature, but it does not say why a hiker should care."], ["The perfect bottle for business meetings in luxury offices.", "This does not match the target customers (hikers)."]]],
    ["FitFold, a folding desk", "students with small bedrooms", "A full-size desk that folds flat against the wall in seconds, so a small bedroom still has room to move.",
      [["Desks are important for everyone.", "Too general: it gives no reason to choose this desk."], ["Our desk has four legs and a top.", "Every desk has these. There is no benefit or difference."], ["Buy it because our founder worked very hard on it.", "Customers buy benefits, not the founder's effort."]]],
    ["QuickPlate, a meal-kit service", "busy parents", "Healthy family dinners on the table in 20 minutes, with every ingredient measured and delivered to your door.",
      [["We sell food.", "Too vague: it says nothing about the benefit or what is different."], ["We have the nicest logo in the city.", "A logo is not a reason to buy a meal kit."], ["Gourmet recipes that take three hours, for professional chefs.", "This targets the wrong customers and the opposite of what busy parents want."]]],
    ["PlantPal, a soil sensor", "beginner plant owners", "No more guessing: your phone tells you exactly when each plant needs water.",
      [["Our sensor uses advanced technology.", "Vague: it does not say what the customer gains."], ["Plants are nice to have.", "True, but it gives no reason to buy this product."], ["Buy now because stocks are limited.", "This is pressure to buy, not a statement of value."]]],
    ["SnapLock, an app-controlled bike lock", "city commuters", "Unlock your bike with your phone in two seconds: no keys to lose, and an alert if anyone tampers with it.",
      [["Our lock is the best lock.", "Unproven and vague: no specific benefit."], ["Locks have existed for thousands of years.", "A fact about history, not a benefit."], ["A great lock for people who do not own bikes.", "This is the wrong target customer."]]],
    ["PawWalk, a dog-walking service", "busy workers", "Your dog gets a 45-minute walk while you are at work, with GPS updates and photos sent to your phone.",
      [["We like dogs.", "Nice, but it says nothing about the benefit to the owner."], ["We walk.", "Too vague: no benefit, nothing different."], ["The most expensive dog walk in town.", "A high price is not a benefit by itself."]]],
    ["QuizUp Daily, a revision app", "students preparing for exams", "Ten-minute daily quizzes matched to your exam syllabus, with instant feedback on every mistake.",
      [["We are an app.", "This describes what it is, not why it helps."], ["Learning is important.", "True, but it gives no reason to choose this app."], ["Fun color games for toddlers.", "This targets the wrong customers."]]],
    ["DryDash, a quick-dry towel", "swimmers", "Dries in 30 minutes and folds to the size of a phone, so your swim bag stays light and fresh.",
      [["Our towel is a towel.", "No benefit and nothing different."], ["Made by a company that has a nice website.", "The website is not a benefit of the towel."], ["A heavy, thick towel for luxury hotels.", "Wrong target, and the opposite of what swimmers want."]]]
  ];

  /* ---------- pitches ---------- */
  const PRODUCTS = [
    { p:"SnapLock", what:"a bike lock that unlocks with a phone app", u:"lock", pr:[40, 60], cost:[15, 25] },
    { p:"GreenSip", what:"reusable bamboo straws sold in packs of six", u:"pack", pr:[8, 12], cost:[2, 4] },
    { p:"PawTrail", what:"a GPS tag that clips onto a pet's collar", u:"tag", pr:[30, 45], cost:[12, 18] },
    { p:"DeskNest", what:"a desk organizer made from recycled cardboard", u:"organizer", pr:[15, 25], cost:[4, 8] },
    { p:"CrunchUp", what:"high-protein snack bars made from chickpeas", u:"box", pr:[10, 16], cost:[4, 6] },
    { p:"DryDash", what:"a quick-drying towel for swimmers", u:"towel", pr:[20, 30], cost:[6, 10] },
    { p:"GlowPath", what:"solar garden lights made from recycled plastic", u:"light", pr:[18, 28], cost:[6, 10] },
    { p:"FitFold", what:"a folding desk for small bedrooms", u:"desk", pr:[90, 140], cost:[40, 60] },
    { p:"ChargeCase", what:"a phone case with a built-in battery", u:"case", pr:[35, 55], cost:[14, 20] },
    { p:"PlantPal", what:"a soil sensor that tells you when to water your plants", u:"sensor", pr:[25, 40], cost:[8, 14] },
    { p:"LoopBottle", what:"a steel water bottle with a leak-proof lid", u:"bottle", pr:[22, 32], cost:[8, 12] },
    { p:"SockSwap", what:"fun mismatched sock sets sold in packs of three", u:"pack", pr:[12, 18], cost:[4, 6] }
  ];
  const plural = u => u === "box" ? "boxes" : u + "s";
  const head = (name, P) => '<div class="quotebox"><p><b>' + P.p + "</b>: " + P.what + ". Pitched by " + name + ".</p></div>";
  const STRONG = [
    (P) => commas(ri(4, 30) * 50) + " customers have already bought " + P.p + " at full price",
    (P) => "A chain of " + ri(5, 40) + " stores has signed an order for " + commas(ri(2, 20) * 100) + " " + plural(P.u),
    () => ri(35, 60) + "% of customers who bought it once have come back to buy again",
    (P) => commas(ri(3, 12) * 100) + " people have paid in advance for a " + P.u + " that will ship next month"
  ];
  const WEAK = [
    ["The founder's family and friends say they love it", "Family and friends are not a fair test: they want to be kind, and they may never pay for it."],
    ["The founder is very passionate and works on it every weekend", "Passion is good, but it is not evidence that customers will pay."],
    ["The logo and packaging have been professionally designed", "Good design helps, but it does not show that anyone will buy it."],
    ["The founder believes everyone will want one", "A belief is not evidence. Investors want proof from real customers."],
    ["A post about it got thousands of likes on social media", "Likes cost nothing. They do not show that people will pay."],
    ["The founder has already chosen the company colors", "Colors are a small detail, not evidence of demand."]
  ];
  const POSITIVE = [
    "Sales have grown every month for the last six months", "The founder has worked in this industry for eight years",
    "Customers rate it 4.7 out of 5 in reviews on its own website", "It has already won a regional young-entrepreneur award",
    "Two experienced staff members have already joined the team", "A supplier has agreed to lower prices for larger orders"
  ];

  /* ========== generators ========== */
  const POOL = [
    /* ---- needs and wants ---- */
    { id:"nw-classify", skill:"needs", level:1, make(ctx){
      return classify(ctx, "nw", { Need:NEEDS, Want:WANTS }, "Is this a need or a want?", NW_DEF,
        "Needs are essential for survival and health; wants are extras that make life nicer.", "Could a person survive and stay healthy without it?");
    } },
    { id:"nw-pick", skill:"needs", level:2, make(ctx){
      const x = fresh(ctx, () => ({ v:ri(0, 1), n:pick(NEEDS), ws:shuffle(WANTS.slice()).slice(0, 3), w:pick(WANTS), ns:shuffle(NEEDS.slice()).slice(0, 3) }), x => "np" + x.v + (x.v ? x.w : x.n));
      if (x.v === 0) return mcq("Which of these is a <b>need</b>?", x.n, x.ws.map(w => [w, w + " is a want: nice to have, but people can live without it."]),
        "<p>" + B(x.n) + " is essential for survival or health, so it is a need. The others are wants.</p>", "Needs are essential for survival and health.", "Which one could a person not do without?");
      return mcq("Which of these is a <b>want</b>?", x.w, x.ns.map(n => [n, n + " is a need: it is essential for survival or health."]),
        "<p>" + B(x.w) + ": people like to have it, but they can live without it, so it is a want.</p>", "Wants are extras; needs are essentials.", "Which one is a nice extra?");
    } },
    { id:"nw-same", skill:"needs", level:2, make(ctx){
      const BANK = [
        ["A basic warm coat for winter", "A designer coat costing $900", "Keeping warm is a need. A basic coat meets it; the designer label is a want."],
        ["Tap water to drink", "A bottle of luxury sparkling water", "Water is a need. Safe tap water meets it; the luxury brand is a want."],
        ["A simple meal of rice and vegetables", "A meal at an expensive restaurant", "Food is a need. A simple meal meets it; the restaurant experience is a want."],
        ["A small, safe apartment", "A mansion with a swimming pool", "Shelter is a need. A safe home meets it; the mansion's extras are wants."],
        ["Medicine prescribed for an infection", "Vitamin gummies in fun shapes", "Treating an illness is a need. Fun-shaped gummies are a want."],
        ["Basic shoes to walk to school", "Limited-edition sneakers", "Footwear can be a need. Basic shoes meet it; the limited edition is a want."]
      ];
      const b = Kit.unique(ctx, BANK, b => b[0]);
      return mcq("Both items below are about the same basic need. Which one is a <b>want</b>?", b[1], [[b[0], "This item meets the basic need, so it counts as a need."], ["Neither: they are both needs", "One of them goes far beyond what is needed to survive and stay healthy."]],
        "<p>" + b[2] + "</p>", "A need can be met simply; the expensive or fancy version is a want.", "Which option goes beyond what is actually necessary?");
    } },

    /* ---- goods and services ---- */
    { id:"gs-classify", skill:"goods", level:1, make(ctx){
      return classify(ctx, "gs", { Good:GOODS, Service:SERVICES }, "Is this a good or a service?", GS_DEF,
        "Goods are tangible things you can own; services are activities done for you.", "Can you hold it and take it home?");
    } },
    { id:"gs-tangible", skill:"goods", level:2, make(ctx){
      const x = fresh(ctx, () => ({ v:ri(0, 1), s:pick(SERVICES), gs:shuffle(GOODS.slice()).slice(0, 3), g:pick(GOODS), ss:shuffle(SERVICES.slice()).slice(0, 3) }), x => "gt" + x.v + (x.v ? x.g : x.s));
      if (x.v === 0) return mcq("Which of these is <b>intangible</b> (a service)?", x.s, x.gs.map(g => [g, g + " is a physical good you can touch and keep, so it is tangible."]),
        "<p>" + B(x.s) + " is something done for you. You cannot hold it or store it, so it is intangible.</p>", "Services are intangible; goods are tangible.", "Which one can you not hold in your hand?");
      return mcq("Which of these is <b>tangible</b> (a good)?", x.g, x.ss.map(s => [s, s + " is a service: an activity done for you, so it is intangible."]),
        "<p>" + B(x.g) + " is a physical product you can touch and keep, so it is tangible.</p>", "Goods are tangible; services are intangible.", "Which one could you put in a bag?");
    } },
    { id:"gs-bank", skill:"goods", level:2, make(ctx){ return fromBank(ctx, GS_BANK, "Ask: can I hold it, or is it something done for me?"); } },

    /* ---- factors of production ---- */
    { id:"fop-classify", skill:"fop", level:1, make(ctx){
      return classify(ctx, "fop", FOP, "Which factor of production is this?", FOP_DEF,
        "Land = nature; labor = human effort; capital = human-made tools; entrepreneurship = idea, organization and risk.", "Does it come from nature, from people's work, from human-made equipment, or from the risk-taker?");
    } },
    { id:"fop-which", skill:"fop", level:2, make(ctx){
      const x = fresh(ctx, () => ({ b:pick(FOP_BIZ), f:pick(Object.keys(FOP_DEF)) }), x => "fw" + x.b.b + x.f), b = x.b;
      const keys = Object.keys(FOP_DEF);
      return Kit.mc({ promptHtml:"In " + b.b + ", which of these is <b>" + lc(x.f) + "</b>?",
        options:keys.map(k => k === x.f ? { html:Cap(b[k]), correct:true } : { html:Cap(b[k]), fb:"That is " + lc(k) + ". " + FOP_DEF[k] }),
        workHtml:"<p>" + keys.map(k => B(k) + ": " + b[k]).join("<br>") + "</p><p>" + FOP_DEF[x.f] + "</p>",
        key:"Land = nature; labor = human effort; capital = human-made tools; entrepreneurship = idea and risk.", hint:"Recall what " + lc(x.f) + " means, then check each option." });
    } },
    { id:"fop-reward", skill:"fop", level:2, make(ctx){
      const x = fresh(ctx, () => ({ f:pick(Object.keys(REWARD)), n:pick(NAMES), v:ri(0, 1), job:pick(["chef at a restaurant", "driver for a delivery company", "cashier at a supermarket", "builder for a construction firm", "coder at an app company"]), biz:pick(["food truck", "bike-repair shop", "online T-shirt business", "tutoring company", "café"]) }), x => "fr" + x.f + x.v);
      const S = {
        Land:x.n + " owns a field and lets a farmer use it for a year.",
        Labor:x.n + " works as a " + x.job + ".",
        Capital:x.n + "'s savings are lent to a business so it can buy new machines.",
        Entrepreneurship:x.n + " starts a " + x.biz + " and takes the risk that it might fail. It succeeds."
      };
      const prompt = x.v ? "Which factor of production earns <b>" + lc(REWARD[x.f]) + "</b> as its reward?" : S[x.f] + " What reward does " + x.n + " receive for this?";
      const opts = x.v ? Object.keys(REWARD) : Object.values(REWARD);
      const correct = x.v ? x.f : REWARD[x.f];
      const owner = { Rent:"Land", Wages:"Labor", Interest:"Capital", Profit:"Entrepreneurship" };
      return Kit.mc({ promptHtml:prompt, keepOrder:true,
        options:opts.map(o => o === correct ? { html:o, correct:true } : { html:o, fb:x.v ? REWARD[o] + " is the reward for " + lc(o) + ", not " + lc(REWARD[x.f]) + "." : o + " is the reward for " + lc(owner[o]) + ". This example is " + lc(x.f) + "." }),
        workHtml:"<p>" + (x.v ? "" : S[x.f] + " This is " + B(lc(x.f)) + ". ") + "Rewards: land → <b>rent</b>, labor → <b>wages</b>, capital → <b>interest</b>, entrepreneurship → <b>profit</b>.</p>",
        key:"Land earns rent, labor earns wages, capital earns interest, entrepreneurship earns profit.", hint:"First decide which factor it is, then match its reward." });
    } },

    { id:"fop-hard", skill:"fop", level:3, make(ctx){ return fromBank(ctx, FOP_HARD, "Decide which factor each resource is, then match the reward."); } },

    /* ---- markets ---- */
    { id:"mk-def", skill:"markets", level:1, make(ctx){ return fromBank(ctx, MK_BANK); } },
    { id:"mk-type1", skill:"markets", level:1, make(ctx){
      return ri(0, 1)
        ? classify(ctx, "m1", MK1, "Is this a B2B or a B2C sale?", MK1_DEF, "B2B: the buyer is a business. B2C: the buyer is a consumer.", "Who is buying: a business or a person for their own use?")
        : classify(ctx, "m2", MK2, "Is this a physical market or an online market?", MK2_DEF, "Physical markets are real places; online markets trade over the internet.", "Do buyers and sellers meet in person?");
    } },
    { id:"mk-type2", skill:"markets", level:2, make(ctx){
      return ri(0, 1)
        ? classify(ctx, "m3", MK3, "Is this a local, national or international market?", MK3_DEF, "Local = one area; national = one country; international = several countries.", "How far away are the customers?")
        : classify(ctx, "m4", MK4, "Is this a mass market or a niche market?", MK4_DEF, "Mass = huge, general; niche = small, specialized.", "Is it for almost everyone, or for a small group with special needs?");
    } },
    { id:"mk-hard", skill:"markets", level:3, make(ctx){ return fromBank(ctx, MK_HARD, "Think about how many buyers there are (demand) and how much is available (supply)."); } },

    /* ---- 7Ps ---- */
    { id:"p7-classify", skill:"sevenp", level:1, make(ctx){
      const x = fresh(ctx, () => { const b = pick(BIZ7), i = ri(0, 6); return { b, i }; }, x => "p7" + x.b.n + x.i), P = PS[x.i];
      const others = shuffle(PS.filter(p => p !== P)).slice(0, 3);
      return Kit.mc({ promptHtml:"Which of the 7Ps does this decision belong to?", exprHtml:'<div class="quotebox"><p>' + B(x.b.n) + (x.b.n.includes(",") ? ", " : " ") + x.b.ds[x.i] + ".</p></div>",
        options:[{ html:P, correct:true }].concat(others.map(o => ({ html:o, fb:P_DEF[o] + " This decision is about " + lc(P) + "." }))),
        workHtml:"<p>" + P_DEF[P] + "</p><p>So this decision is " + B(P) + ".</p>",
        key:"Product, Price, Place, Promotion, People, Process, Physical evidence: name the P the decision changes.", hint:"Ask what the decision changes: the item, the cost, the location, the message, the staff, the steps, or what customers see?" });
    } },
    { id:"p7-pick", skill:"sevenp", level:2, make(ctx){
      const x = fresh(ctx, () => { const b = pick(BIZ7), i = ri(0, 6); return { b, i }; }, x => "pk" + x.b.n + x.i), P = PS[x.i];
      const others = shuffle([0, 1, 2, 3, 4, 5, 6].filter(j => j !== x.i)).slice(0, 3);
      return Kit.mc({ promptHtml:B(x.b.n) + (x.b.n.includes(",") ? "," : "") + " is planning its marketing mix. Which decision is about <b>" + P + "</b>?",
        options:[{ html:Cap(x.b.ds[x.i]), correct:true }].concat(others.map(j => ({ html:Cap(x.b.ds[j]), fb:"This is about " + PS[j] + ". " + P_DEF[PS[j]] }))),
        workHtml:"<p>" + P_DEF[P] + "</p><p>" + B(Cap(x.b.ds[x.i])) + " is the " + P + " decision.</p>",
        key:"Each decision in the marketing mix belongs to one P.", hint:P_DEF[P] });
    } },
    { id:"p7-fix", skill:"sevenp", level:3, make(ctx){
      const it = Kit.unique(ctx, P7_HARD, x => x[0]), P = it[1], name = pick(NAMES);
      const others = shuffle(PS.filter(p => p !== P)).slice(0, 3);
      return Kit.mc({ promptHtml:name + " runs a small business and reads this customer feedback. Which P should " + name + " improve first to fix the problem?", exprHtml:'<div class="quotebox"><p>' + it[0] + "</p></div>",
        options:[{ html:P, correct:true }].concat(others.map(o => ({ html:o, fb:"Changing " + lc(o) + " would not fix the main problem described. " + P_DEF[P] }))),
        workHtml:"<p>The problem is about " + B(lc(P)) + ". " + P_DEF[P] + "</p>",
        key:"Match the problem to the P that causes it, then fix that P.", hint:"What exactly are customers unhappy about?" });
    } },

    /* ---- target customers ---- */
    { id:"tg-def", skill:"target", level:1, make(ctx){ return fromBank(ctx, TG_BANK); } },
    { id:"tg-segment", skill:"target", level:2, make(ctx){
      return classify(ctx, "sg", SEG, "Which way of segmenting the market does this business use?", SEG_DEF,
        "Segment customers by age, income, location or lifestyle.", "Is the group defined by how old they are, how much they earn, where they are, or how they live?");
    } },
    { id:"tg-target", skill:"target", level:2, make(ctx){
      const it = Kit.unique(ctx, TARGET, x => x[0]);
      return mcq("Which is the most suitable target market for this product?", it[1], it[2],
        "<p>The product is " + lc(it[0]) + ". The customers who need it most and can buy it are " + B(lc(it[1])) + ".</p>",
        "Match the product's main benefit to the group that needs it most and can pay for it.", "Who has the problem that this product solves?", { exprHtml:'<div class="display">' + it[0] + "</div>" });
    } },
    { id:"tg-vp", skill:"target", level:3, make(ctx){
      const it = Kit.unique(ctx, VP, x => x[0]);
      return mcq("Which is the strongest value proposition for <b>" + it[0] + "</b>, aimed at <b>" + it[1] + "</b>?", it[2], it[3],
        "<p>A strong value proposition is <b>specific</b>, says what the <b>customer gains</b>, fits the <b>target market</b> and shows what is <b>different</b>. This statement does all of these: " + B(it[2]) + "</p>",
        "A value proposition = a specific benefit for the target customer + what makes it different.", "Which statement tells " + it[1] + " exactly what they gain?");
    } },

    /* ---- pitches ---- */
    { id:"pi-terms", skill:"pitch", level:1, make(ctx){ return fromBank(ctx, PITCH_BANK); } },
    { id:"pi-rev", skill:"pitch", level:2, make(ctx){
      const x = fresh(ctx, () => ({ P:pick(PRODUCTS), n:pick(NAMES), v:ri(0, 2), units:ri(4, 60) * 50 }), x => "pr" + x.P.p + x.v + x.units);
      const { P, n, v, units } = x, price = ri(P.pr[0], P.pr[1]), rev = price * units;
      if (v === 0) return { type:"num", promptHtml:n + "'s business, " + P.p + ", sold " + commas(units) + " " + plural(P.u) + " at " + $(price) + " each. What was the revenue?", exprHtml:head(n, P),
        answer:rev, pre:"$", parse:money, workHtml:"<p>Revenue = price × units sold = " + $(price) + " × " + commas(units) + " = " + B($(rev)) + ".</p>",
        key:"Revenue = price × quantity sold.", hint:"Multiply the price by the number sold.", mistakes:[{ when:{ v:price + units }, msg:"Revenue is price <b>times</b> units, not plus." }] };
      if (v === 1) { const costs = Math.round(rev * ri(40, 85) / 100 / 10) * 10, prof = rev - costs;
        return { type:"num", promptHtml:P.p + " had revenue of " + $(rev) + " last year and total costs of " + $(costs) + ". What was the profit?", exprHtml:head(n, P),
          answer:prof, pre:"$", parse:money, workHtml:"<p>Profit = revenue − costs = " + $(rev) + " − " + $(costs) + " = " + B($(prof)) + ".</p>",
          key:"Profit = revenue − costs.", hint:"Take the costs away from the revenue.", mistakes:[{ when:{ v:rev + costs }, msg:"Costs are subtracted from revenue, not added." }, { when:{ v:-prof }, msg:"Subtract the costs from the revenue, not the other way round." }] }; }
      return { type:"num", promptHtml:P.p + " made " + $(rev) + " in revenue by selling each " + P.u + " for " + $(price) + ". How many " + plural(P.u) + " did it sell?", exprHtml:head(n, P),
        answer:units, parse:money, workHtml:"<p>Units = revenue ÷ price = " + $(rev) + " ÷ " + $(price) + " = " + B(commas(units)) + ".</p>",
        key:"Revenue = price × units, so units = revenue ÷ price.", hint:"Work backwards: divide the revenue by the price.", mistakes:[{ when:{ v:rev * price }, msg:"Divide the revenue by the price; do not multiply." }] };
    } },
    { id:"pi-demand", skill:"pitch", level:2, make(ctx){
      const x = fresh(ctx, () => ({ P:pick(PRODUCTS), n:pick(NAMES), s:ri(0, STRONG.length - 1) }), x => "pd" + x.P.p);
      const strong = STRONG[x.s](x.P), weak = shuffle(WEAK.slice()).slice(0, 3);
      return mcq("An investor asks: <i>Do customers really want this?</i> Which part of the pitch is the strongest evidence?", strong, weak,
        "<p>" + B(strong) + " is evidence from real customers <b>spending money</b> (or committing to). Opinions, effort, likes and design do not prove that people will pay.</p>",
        "The best evidence of demand is real customers paying.", "Which option involves customers actually paying?", { exprHtml:head(x.n, x.P) });
    } },
    { id:"pi-val", skill:"pitch", level:3, make(ctx){
      const x = fresh(ctx, () => ({ P:pick(PRODUCTS), n:pick(NAMES), v:ri(0, 2), p:pick([5, 10, 20, 25, 40, 50]), V:ri(5, 60) * 20000 }), x => "pv" + x.v + x.p + x.V);
      const { P, n, v, p, V } = x, A = V * p / 100;
      if (v === 0) return { type:"num", promptHtml:n + " asks investors for " + $(A) + " in exchange for " + p + "% of " + P.p + ". What value does this put on the whole business?", exprHtml:head(n, P),
        answer:V, pre:"$", parse:money,
        workHtml:"<p>" + $(A) + " buys " + p + "%, so 100% is worth " + $(A) + " ÷ " + p / 100 + " = " + B($(V)) + ". (Or: " + $(A) + " ÷ " + p + " × 100.)</p>",
        key:"Valuation = amount offered ÷ share (as a decimal).", hint:"If " + p + "% is worth " + $(A) + ", what is 1% worth? Then 100%?",
        mistakes:[{ when:{ v:A * p / 100 }, msg:"You found " + p + "% of the offer. Work the other way: the offer is " + p + "% of the value." }, { when:{ v:A / p }, msg:"That is the value of 1%. Multiply by 100 for the whole business." }, { when:{ v:A * p }, msg:"Divide by the percentage as a decimal (" + p / 100 + "), do not multiply by " + p + "." }].filter(m => m.when.v !== V) };
      if (v === 1) return { type:"num", promptHtml:"An investor values " + P.p + " at " + $(V) + " and offers " + $(A) + ". What percentage of the business should the investor receive?", exprHtml:head(n, P),
        answer:p, suf:"%", parse:money, workHtml:"<p>Share = offer ÷ valuation × 100 = " + $(A) + " ÷ " + $(V) + " × 100 = " + B(p + "%") + ".</p>",
        key:"Equity % = amount invested ÷ valuation × 100.", hint:"What fraction of the whole business is " + $(A) + "?",
        mistakes:[{ when:{ v:p / 100 }, msg:"Right fraction, but give it as a percentage: multiply by 100." }, { when:{ v:100 - p }, msg:"That is the share the founder keeps." }].filter(m => m.when.v !== p) };
      return { type:"num", promptHtml:n + " values " + P.p + " at " + $(V) + " and wants to sell " + p + "% of it to an investor. How much money should " + n + " ask for?", exprHtml:head(n, P),
        answer:A, pre:"$", parse:money, workHtml:"<p>" + p + "% of " + $(V) + " = " + p / 100 + " × " + $(V) + " = " + B($(A)) + ".</p>",
        key:"Amount = share (as a decimal) × valuation.", hint:"Find " + p + "% of " + $(V) + ".",
        mistakes:[{ when:{ v:V / p }, msg:"Find " + p + "% of the value: multiply by " + p / 100 + ", do not divide by " + p + "." }].filter(m => m.when.v !== A) };
    } },
    { id:"pi-compare", skill:"pitch", level:3, make(ctx){
      const x = fresh(ctx, () => { const P = pick(PRODUCTS), n = pick(NAMES); let a, b; do { a = { p:pick([10, 20, 25, 40]), V:ri(5, 40) * 20000 }; b = { p:pick([10, 20, 25, 40]), V:ri(5, 40) * 20000 }; } while (a.V === b.V || a.p === b.p); return { P, n, a, b }; }, x => "pcmp" + x.a.V + x.b.V);
      const { P, n, a, b } = x, Aa = a.V * a.p / 100, Ab = b.V * b.p / 100, hi = a.V > b.V ? "A" : "B";
      const line = (L, o, amt) => "Offer " + L + ": " + $(amt) + " for " + o.p + "%";
      const big = a.p > b.p ? "A" : "B";
      return Kit.mc({ promptHtml:n + " receives two offers for " + P.p + ". Which offer values the whole business more highly?", exprHtml:'<div class="quotebox"><p>' + line("A", a, Aa) + "<br>" + line("B", b, Ab) + "</p></div>",
        options:[{ html:"Offer " + hi, correct:true }, { html:"Offer " + (hi === "A" ? "B" : "A"), fb:"Work out each valuation: amount ÷ share. Offer " + hi + " gives the higher value." },
          { html:"They value the business equally", fb:"The valuations are " + $(a.V) + " and " + $(b.V) + ", which are different." }],
        workHtml:"<p>Offer A: " + $(Aa) + " ÷ " + a.p / 100 + " = " + B($(a.V)) + ". Offer B: " + $(Ab) + " ÷ " + b.p / 100 + " = " + B($(b.V)) + ".</p><p>So Offer " + hi + " values the business more highly." + (big !== hi ? " Notice it is not the offer asking for the bigger share." : "") + "</p>",
        key:"Compare offers by valuation (amount ÷ share), not by the amount alone.", hint:"Find the valuation for each offer.", meta:{ a, b, hi } });
    } },
    { id:"pi-profit", skill:"pitch", level:3, make(ctx){
      const x = fresh(ctx, () => ({ P:pick(PRODUCTS), n:pick(NAMES), v:ri(0, 2) }), x => "pp" + x.P.p + x.v + x.n);
      const { P, n, v } = x, price = ri(P.pr[0], P.pr[1]), cost = ri(P.cost[0], P.cost[1]), m = price - cost;
      if (v === 0) {
        const units = ri(4, 40) * 50, fixed = ri(2, 30) * 500, prof = units * m - fixed;
        return { type:"num", promptHtml:P.p + " sells each " + P.u + " for " + $(price) + ". Each one costs " + $(cost) + " to make, and fixed costs (rent, website, insurance) are " + $(fixed) + " a year. If it sells " + commas(units) + " " + plural(P.u) + " in a year, what is the profit? (Use a minus sign for a loss.)",
          exprHtml:head(n, P), answer:prof, pre:"$", parse:money,
          workHtml:"<ol class=\"steps\"><li><div><div class=\"m\">Revenue = " + $(price) + " × " + commas(units) + " = " + $(price * units) + "</div><p class=\"why\">Price × units.</p></div></li>" +
            "<li><div><div class=\"m\">Total costs = " + $(cost) + " × " + commas(units) + " + " + $(fixed) + " = " + $(cost * units + fixed) + "</div><p class=\"why\">Cost per unit × units, plus fixed costs.</p></div></li>" +
            "<li><div><div class=\"m\">Profit = " + $(price * units) + " − " + $(cost * units + fixed) + " = " + (prof < 0 ? "−" + $(-prof) : $(prof)) + "</div><p class=\"why\">Revenue − total costs.</p></div></li></ol>",
          key:"Profit = revenue − (variable costs + fixed costs).", hint:"Find revenue, then total costs, then subtract.",
          mistakes:[{ when:{ v:units * m }, msg:"You forgot to subtract the fixed costs." }, { when:{ v:price * units - fixed }, msg:"You forgot the cost of making each " + P.u + "." }, { when:{ v:price * units }, msg:"That is the revenue. Subtract the costs." }].filter(mm => mm.when.v !== prof) };
      }
      if (v === 1) {
        const be = ri(4, 60) * 25, fixed = be * m;
        return { type:"num", promptHtml:P.p + " sells each " + P.u + " for " + $(price) + ", and each costs " + $(cost) + " to make. Fixed costs are " + $(fixed) + ". How many " + plural(P.u) + " must it sell to break even (make zero profit)?",
          exprHtml:head(n, P), answer:be, parse:money,
          workHtml:"<p>Each " + P.u + " adds " + $(price) + " − " + $(cost) + " = " + $(m) + " towards the fixed costs. Break-even = " + $(fixed) + " ÷ " + $(m) + " = " + B(commas(be)) + " " + plural(P.u) + ".</p>",
          key:"Break-even units = fixed costs ÷ (price − cost per unit).", hint:"How much does each sale contribute after paying for itself?",
          mistakes:[{ when:{ v:fixed / price }, msg:"Divide by the profit per unit (price − cost), not by the price." }].filter(mm => Math.abs(mm.when.v - be) > 1e-9) };
      }
      const p = pick([10, 20, 25, 40, 50]), prof = ri(4, 80) * 1000, share = prof * p / 100;
      return { type:"num", promptHtml:"An investor owns " + p + "% of " + P.p + ". This year the business makes a profit of " + $(prof) + ". If all the profit is shared out, how much does the investor receive?",
        exprHtml:head(n, P), answer:share, pre:"$", parse:money,
        workHtml:"<p>" + p + "% of " + $(prof) + " = " + p / 100 + " × " + $(prof) + " = " + B($(share)) + ".</p>",
        key:"An owner with p% equity gets p% of shared profits.", hint:"Find " + p + "% of the profit.",
        mistakes:[{ when:{ v:prof - share }, msg:"That is what the other owners receive." }].filter(mm => mm.when.v !== share) };
    } },
    { id:"pi-concern", skill:"pitch", level:3, make(ctx){
      const x = fresh(ctx, () => ({ P:pick(PRODUCTS), n:pick(NAMES), f:ri(0, 4), pos:shuffle(POSITIVE.slice()).slice(0, 3) }), x => "pc" + x.P.p);
      const { P, n, f, pos } = x, price = ri(P.pr[0], P.pr[1]);
      const FLAGS = [
        ["Each " + P.u + " costs " + $(price + ri(2, 8)) + " to make but sells for " + $(price), "Every sale loses money, so selling more makes the loss bigger."],
        ["There are no sales yet, but the founder values the business at $2,000,000", "A very high valuation with no sales has nothing to back it up."],
        ["A large company already sells an almost identical product for half the price", "Strong, cheaper competition could take most of the customers."],
        ["Over 80% of sales come from one customer, whose contract ends next month", "Losing that one customer would wipe out most of the sales."],
        ["The founder plans to spend most of the investment on a big launch party", "The money would not go into growing the business."]
      ];
      const fl = FLAGS[f], facts = shuffle([fl[0]].concat(pos));
      return mcq("Read the pitch. Which fact should worry an investor the most?", fl[0], pos.map(s => [s, "This is a strength of the pitch, not a worry."]),
        "<p>" + B(fl[0]) + ". " + fl[1] + " The other facts are strengths.</p>",
        "Look for risks to future profit: losses per sale, no evidence, strong competition or depending on one customer.", "Which fact threatens the business's ability to make a profit?",
        { exprHtml:'<div class="quotebox"><p><b>' + P.p + "</b>: " + P.what + ". Pitched by " + n + ".</p><ul>" + facts.map(x => "<li>" + x + "</li>").join("") + "</ul></div>" });
    } },
    { id:"pi-missing", skill:"pitch", level:3, make(ctx){
      const x = fresh(ctx, () => ({ P:pick(PRODUCTS), n:pick(NAMES), v:ri(0, 2), units:ri(4, 40) * 50 }), x => "pm" + x.P.p);
      const { P, n, v, units } = x, price = ri(P.pr[0], P.pr[1]), cost = ri(P.cost[0], P.cost[1]);
      const facts = [
        ["It sells for " + $(price) + " and " + commas(units) + " have been sold so far. Customers rate it highly, and it is different from rivals because " + pick(["it is made from recycled materials", "it is lighter than anything else on sale", "it comes with a lifetime guarantee"]) + ".",
          "How much it costs to make each " + P.u + ", so profit can be worked out", "Without costs, nobody can tell whether each sale makes or loses money."],
        ["It will sell for " + $(price) + " and costs " + $(cost) + " to make. The design is finished and the founder has found a factory.",
          "Evidence that customers will actually buy it, such as sales or pre-orders", "Without any sales or pre-orders, there is no proof of demand."],
        ["It sells for " + $(price) + ", costs " + $(cost) + " to make, and " + commas(units) + " have been sold in local shops.",
          "Who the competitors are and why customers would choose " + P.p + " instead", "An investor needs to know how the product stands out from similar products."]
      ][v];
      const minor = [["What color the packaging will be", "A small detail that will not decide whether the business succeeds."], ["How many followers the founder has on a personal account", "Personal followers are not business evidence."],
        ["Which city the founder grew up in", "This does not affect whether the business will make a profit."], ["Which font the website uses", "A small design detail, not key business information."]];
      return mcq("What is the most important information missing from this pitch?", facts[1], shuffle(minor).slice(0, 3),
        "<p>" + facts[2] + " Investors look for <b>demand</b> (sales), <b>costs and profit</b>, and <b>competition</b>.</p>",
        "A strong pitch shows demand, costs and profit, and how it beats competitors.", "Which missing fact would change whether an investor says yes?",
        { exprHtml:'<div class="quotebox"><p><b>' + P.p + "</b>: " + P.what + ". Pitched by " + n + ". " + facts[0] + "</p></div>" });
    } }
  ];
  function Cap(s){ return s[0].toUpperCase() + s.slice(1); }
  const PITCH_BANK = [
    { q:"In an investor pitch, what does <b>equity</b> mean?", a:"A share of ownership in the business",
      w:[["A loan that must be paid back with interest", "That is debt. Equity means the investor owns part of the business."], ["The total money from sales", "That is revenue."], ["The business's logo and brand", "That is branding."]],
      work:"<p>An investor who gets 10% <b>equity</b> owns 10% of the business and gets a share of its future profits.</p>", key:"Equity = a share of ownership." },
    { q:"What is <b>revenue</b>?", a:"The total money a business receives from sales (price × units sold)",
      w:[["Revenue minus costs", "That is profit."], ["The money spent making products", "Those are costs."], ["What the whole business is worth", "That is the valuation."]],
      work:"<p><b>Revenue</b> = price × quantity sold. It is not the same as profit, because costs have not been taken away yet.</p>", key:"Revenue = price × units sold." },
    { q:"What is <b>profit</b>?", a:"Revenue minus costs",
      w:[["Revenue plus costs", "Costs are taken away from revenue, not added."], ["The price of one product", "Price is what one unit sells for."], ["The money an investor puts in", "That is investment."]],
      work:"<p><b>Profit</b> = revenue − costs. If costs are bigger than revenue, the business makes a <b>loss</b>.</p>", key:"Profit = revenue − costs." },
    { q:"What is a business's <b>valuation</b>?", a:"What the whole business is said to be worth",
      w:[["The money it made last month", "That is revenue (or profit)."], ["The price of its cheapest product", "Valuation is about the whole business."], ["The number of staff it employs", "Staff numbers are not a valuation."]],
      work:"<p>If an investor pays $50,000 for 10%, the <b>valuation</b> is $50,000 ÷ 0.10 = $500,000.</p>", key:"Valuation = what the whole business is worth." },
    { q:"Why do investors want to see sales figures in a pitch?", a:"They are evidence that real customers will pay for the product",
      w:[["They show how creative the founder is", "Creativity is not measured by sales."], ["They prove the business will never fail", "Nothing guarantees success, but sales reduce the risk."], ["They are required to design a logo", "Sales figures have nothing to do with logos."]],
      work:"<p>Sales are <b>evidence of demand</b>. Opinions and likes are not.</p>", key:"Sales = evidence of demand." },
    { q:"Which of these is a <b>fixed cost</b> for a bakery (it stays the same however many loaves are sold)?", a:"Monthly rent for the shop",
      w:[["Flour", "More loaves need more flour, so it is a variable cost."], ["Paper bags for each loaf", "Each sale uses a bag, so this cost varies with sales."], ["Butter", "Butter use grows with the number of items baked: a variable cost."]],
      work:"<p><b>Fixed costs</b> (rent, insurance) stay the same whatever the sales. <b>Variable costs</b> (ingredients, packaging) rise with each unit made.</p>", key:"Fixed costs stay the same; variable costs rise with output." },
    { q:"What does an investor usually want in return for investing in a startup?", a:"A share of the business and its future profits",
      w:[["Nothing: investors give money as a gift", "Investors expect a return; a gift is a donation."], ["Free products for life, and nothing else", "Investors usually want equity and a share of profits."], ["To become the only employee", "Investors provide money; they rarely do the daily work."]],
      work:"<p>Investors take a <b>risk</b>. In return they want <b>equity</b>, so they share in the profits if the business succeeds.</p>", key:"Investors trade money for equity and future profit." }
  ];

  /* ========== lessons ========== */
  T.lessons = [
    { title:"Needs, wants, goods and services", heading:"Businesses meet needs and wants", html:`
<div class="two">
<div class="rule"><span class="name">Needs</span><p class="small">Things people must have to survive and stay healthy: food, water, shelter, basic clothing, healthcare.</p></div>
<div class="rule"><span class="name">Wants</span><p class="small">Things people would like but can live without: games, designer clothes, concert tickets, takeout.</p></div>
</div>
<p>A need can be met in a simple way or a fancy way. Food is a need, but a meal at an expensive restaurant is a want. A warm coat in winter is a need; a $900 designer coat is a want.</p>
<h3>Goods and services</h3>
<div class="two">
<div class="rule"><span class="name">Goods</span><p class="small"><b>Tangible</b> products you can touch, store and own: a bike, bread, a laptop.</p></div>
<div class="rule"><span class="name">Services</span><p class="small"><b>Intangible</b> activities done for you: a haircut, a bus ride, a lesson. They cannot be stored.</p></div>
</div>
<h3>Worked example</h3>
<p>A phone-repair shop sells cases (goods) and fixes screens (a service). A restaurant sells food (a good) plus cooking and serving (services). Many businesses sell both.</p>
<div class="warn"><span class="name">Common mistake</span><p class="small">"Expensive" does not mean "want", and "cheap" does not mean "need". Ask: could a person survive and stay healthy without it?</p></div>` },
    { title:"Factors of production", heading:"Four ingredients for every business", html:`
<p>To make any good or service, a business combines four <b>factors of production</b>.</p>
<div class="tblwrap"><table class="tbl">
<tr><th>Factor</th><th>What it is</th><th>Example</th><th>Reward</th></tr>
<tr><td><b>Land</b></td><td>Natural resources</td><td>A farmer's field, oil, fish, timber</td><td>Rent</td></tr>
<tr><td><b>Labor</b></td><td>Human effort, physical or mental</td><td>A chef's work, a coder's work</td><td>Wages</td></tr>
<tr><td><b>Capital</b></td><td>Human-made tools used to produce</td><td>A delivery van, an oven, a computer</td><td>Interest</td></tr>
<tr><td><b>Entrepreneurship</b></td><td>The idea, organization and risk-taking</td><td>The founder who starts the business</td><td>Profit</td></tr>
</table></div>
<h3>Worked example: a café</h3>
<p>The ground it stands on is <b>land</b>. The barista's work is <b>labor</b>. The coffee machine is <b>capital</b>. The owner who opened it and carries the risk provides <b>entrepreneurship</b>.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Capital means equipment made by people, like machines and vans, not just money. A building is capital, but the ground under it is land. Labor is the work, not the worker's tools.</p></div>` },
    { title:"Markets", heading:"Markets bring buyers and sellers together", html:`
<p>A <b>market</b> is anywhere buyers and sellers meet to trade: a street market, a mall, a website or an app. Markets help set <b>prices</b>: when many buyers want something scarce, the price rises; when there is plenty and few buyers, it falls.</p>
<div class="two">
<div class="rule"><span class="name">Who buys?</span><p class="small"><b>B2C</b> (business to consumer): a café sells a sandwich to you.<br><b>B2B</b> (business to business): a mill sells flour to the bakery.</p></div>
<div class="rule"><span class="name">Where?</span><p class="small"><b>Physical</b>: a real place, face to face.<br><b>Online</b>: websites and apps.</p></div>
<div class="rule"><span class="name">How far?</span><p class="small"><b>Local</b>: one area. <b>National</b>: one country. <b>International</b>: many countries.</p></div>
<div class="rule"><span class="name">How big?</span><p class="small"><b>Mass</b>: huge, general (toothpaste).<br><b>Niche</b>: small, specialized (left-handed guitars).</p></div>
</div>
<div class="warn"><span class="name">Common mistake</span><p class="small">The same product can be sold in different markets. A bakery selling bread to cafés is B2B; selling to shoppers is B2C. Read who the buyer is.</p></div>` },
    { title:"The 7Ps", heading:"Seven decisions in a marketing mix", html:`
<p>The <b>marketing mix</b> is the set of decisions a business makes to sell its product. Name the P by asking what the decision changes.</p>
<div class="tblwrap"><table class="tbl">
<tr><th>P</th><th>The question it answers</th><th>Example (a food truck)</th></tr>
<tr><td><b>Product</b></td><td>What are we selling?</td><td>Adds a vegan taco</td></tr>
<tr><td><b>Price</b></td><td>How much do customers pay?</td><td>$4 per taco, or $10 for a meal deal</td></tr>
<tr><td><b>Place</b></td><td>Where can customers get it?</td><td>Parks outside the stadium on game days</td></tr>
<tr><td><b>Promotion</b></td><td>How do customers find out?</td><td>Posts its location on social media</td></tr>
<tr><td><b>People</b></td><td>Who serves the customers?</td><td>Hires an experienced street-food cook</td></tr>
<tr><td><b>Process</b></td><td>What are the steps to buy?</td><td>Order and pay by phone to speed up the line</td></tr>
<tr><td><b>Physical evidence</b></td><td>What do customers see that shows quality?</td><td>A bright, clean truck with a clear menu</td></tr>
</table></div>
<h3>Fixing problems</h3>
<p>Customer complaints point to a P. "Too far away" → Place. "Never heard of you" → Promotion. "Rude staff" → People. "Booking takes forever" → Process.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Place is not the shop's decor: decor is physical evidence. Process is the steps a customer goes through; People is the staff themselves.</p></div>` },
    { title:"Target customers", heading:"Know exactly who you are selling to", html:`
<p>A <b>target market</b> is the group of customers a business aims at. <b>Segmentation</b> splits a market into groups with similar features.</p>
<div class="two">
<div class="rule"><span class="name">Age</span><p class="small">Toys for 3- to 5-year-olds; trips for over-60s.</p></div>
<div class="rule"><span class="name">Income</span><p class="small">Luxury cars for high earners; budget ranges for tight budgets.</p></div>
<div class="rule"><span class="name">Location</span><p class="small">Surf shops in coastal towns; snow shovels in cold regions.</p></div>
<div class="rule"><span class="name">Lifestyle</span><p class="small">Eco products for people who care about the environment; gyms for active people.</p></div>
</div>
<h3>Value proposition</h3>
<p>A <b>value proposition</b> tells the target customer what they gain and why this product beats the alternatives. A <b>USP</b> (unique selling point) is the feature that makes it different.</p>
<div class="rule"><span class="name">Weak vs strong</span><p class="small">Weak: "We are the best bottle company." Strong: "Keeps water cold for 24 hours on the trail, and the leak-proof lid means no wet backpacks." The strong one is specific, fits hikers and names a clear benefit.</p></div>
<div class="warn"><span class="name">Common mistake</span><p class="small">"Everyone" is not a target market. Listing a feature ("made of steel") is not a value proposition until you say why the customer cares.</p></div>` },
    { title:"Pitches and numbers", heading:"Judge a pitch by its evidence and numbers", html:`
<p>In a Shark Tank-style pitch, a founder asks investors for money in exchange for <b>equity</b> (a share of the business). Investors look for evidence, not enthusiasm.</p>
<div class="three">
<div class="rule"><span class="name">Revenue</span><div class="law">price × units</div></div>
<div class="rule"><span class="name">Profit</span><div class="law">revenue − costs</div></div>
<div class="rule"><span class="name">Valuation</span><div class="law">offer ÷ share</div></div>
</div>
<h3>Worked examples</h3>
<ol class="steps">
<li><div><div class="m">500 bottles at $25 = $12,500 revenue</div><p class="why">Revenue is price times units sold.</p></div></li>
<li><div><div class="m">Costs $9,000 → profit = $12,500 − $9,000 = $3,500</div><p class="why">Costs include making each unit (variable) and rent or insurance (fixed).</p></div></li>
<li><div><div class="m">$50,000 for 10% → valuation = $50,000 ÷ 0.10 = $500,000</div><p class="why">If 10% is worth $50,000, then 100% is worth ten times as much.</p></div></li>
<li><div><div class="m">Break-even: fixed costs ÷ (price − cost per unit)</div><p class="why">$3,000 fixed, $25 price, $10 cost → 3,000 ÷ 15 = 200 units.</p></div></li>
</ol>
<h3>What makes a pitch strong?</h3>
<p><b>Demand</b>: real sales or pre-orders. <b>Profit</b>: price above cost. <b>Difference</b>: a clear USP against competitors. Warning signs: selling below cost, no sales but a huge valuation, depending on one customer, a cheaper rival.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Revenue is not profit. Likes and compliments from friends are not evidence of demand. A bigger offer does not always mean a higher valuation: check the share too.</p></div>` }
  ];
  T.introHtml = `<h2>Six ideas that win marks</h2>
<p class="muted">Define each term, then prove you understand it with a specific example.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Need or want?</h3><p class="small">Needs keep you alive and healthy. Wants make life nicer. A fancy version of a need is a want.</p></div>
<div class="habit"><span class="hn">2</span><h3>Touch test</h3><p class="small">Goods are tangible; services are intangible activities done for you.</p></div>
<div class="habit"><span class="hn">3</span><h3>Land, labor, capital, enterprise</h3><p class="small">Nature, effort, human-made tools, idea and risk. Rewards: rent, wages, interest, profit.</p></div>
<div class="habit"><span class="hn">4</span><h3>Name the P</h3><p class="small">Ask what the decision changes: item, cost, location, message, staff, steps or what customers see.</p></div>
<div class="habit"><span class="hn">5</span><h3>Pick a segment</h3><p class="small">Target by age, income, location or lifestyle. Then say what that customer gains.</p></div>
<div class="habit"><span class="hn">6</span><h3>Show the numbers</h3><p class="small">Revenue = price × units. Profit = revenue − costs. Valuation = offer ÷ share.</p></div>
</div>`;

  registerTopic(T);
})();

/* ===== Topic: Year 8 Spanish, Present tense and everyday activities ===== */
(() => {
  /* ---------- shared helpers ---------- */
  const es = s => '<span class="es">' + s + "</span>";
  const cap = s => s.replace(/^((?:<[^>]+>)*)(.)/, (m, t, c) => t + c.toUpperCase());
  const plain = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const sh = a => shuffle(a.slice());
  const BLANK = "<b>_____</b>";

  /* Typed answer: drop "wrong" spellings that are really the right answer (or an accent-only variant of it), keep the first message per spelling */
  function txt(o){
    const ok = new Set(o.answers.map(plain)), seen = new Set();
    const wrong = (o.wrong || []).map(w => ({ msg:w.msg, answers:w.answers.filter(a => {
      if (!a) return false;
      const k = plain(a); if (ok.has(k) || seen.has(k)) return false; seen.add(k); return true;
    }) })).filter(w => w.answers.length);
    return Kit.text(Object.assign({ accentKeys:true }, o, { wrong }));
  }
  /* Multiple choice: correct option first, then priority distractors, then the rest; duplicates removed */
  function mc(o, correctHtml, pri, rest, n){
    n = n || 4;
    const seen = new Set([correctHtml]), options = [{ html:correctHtml, correct:true }];
    for (const c of [...sh(pri || []), ...sh(rest || [])]) {
      if (options.length >= n) break;
      if (!c || !c.html || seen.has(c.html)) continue;
      seen.add(c.html); options.push({ html:c.html, fb:c.fb });
    }
    return Kit.mc(Object.assign({}, o, { options }));
  }

  /* ---------- verbs ---------- */
  const PL = ["yo", "tú", "él / ella / usted", "nosotros", "vosotros", "ellos / ellas / ustedes"];
  const PRONS = [["yo"], ["tú"], ["él", "ella", "usted"], ["nosotros", "nosotras"], ["vosotros", "vosotras"], ["ellos", "ellas", "ustedes"]];
  const END = { ar:["o", "as", "a", "amos", "áis", "an"], er:["o", "es", "e", "emos", "éis", "en"], ir:["o", "es", "e", "imos", "ís", "en"] };
  const grp = inf => inf.slice(-2);
  const stem = inf => inf.slice(0, -2);
  const conj = (inf, p) => stem(inf) + END[grp(inf)][p];
  /* The ending from the wrong verb group: what students write when they mix up -ar / -er / -ir */
  function badGroup(inf, p){
    if (p === 0) return null;
    const g = grp(inf);
    const other = g === "ar" ? "er" : g === "er" ? (p === 3 || p === 4 ? "ir" : "ar") : (p === 3 || p === 4 ? "er" : "ar");
    return { form:stem(inf) + END[other][p], other };
  }
  const groupMsg = (inf, p) => { const b = badGroup(inf, p); return b ? "<i>" + b.form + "</i> uses an -" + b.other + " ending, but <i>" + inf + "</i> is an -" + grp(inf) + " verb, so it takes -" + END[grp(inf)][p] + "." : ""; };

  /* [infinitive, English, complements] — every verb here is completely regular in the present tense */
  const VERBS = [
    ["hablar", "to speak", ["español en clase", "por teléfono", "con el director"]],
    ["estudiar", "to study", ["matemáticas por la tarde", "en la biblioteca", "para el examen"]],
    ["trabajar", "to work", ["en un hospital", "los sábados", "en una tienda"]],
    ["escuchar", "to listen to", ["música en el autobús", "la radio", "al profesor de música"]],
    ["bailar", "to dance", ["salsa los viernes", "en la fiesta", "muy bien"]],
    ["cocinar", "to cook", ["la cena los domingos", "pasta", "para toda la familia"]],
    ["caminar", "to walk", ["al parque", "por la playa", "mucho"]],
    ["nadar", "to swim", ["en la piscina", "en el mar", "los martes"]],
    ["tomar", "to take / to drink", ["el autobús a las ocho", "un café", "apuntes en clase"]],
    ["comprar", "to buy", ["pan en la panadería", "ropa nueva", "fruta en el mercado"]],
    ["llegar", "to arrive", ["tarde al colegio", "a casa a las cinco", "temprano"]],
    ["mirar", "to look at / to watch", ["las fotos", "por la ventana", "el horario"]],
    ["practicar", "to practice", ["el piano", "fútbol después de clase", "deporte"]],
    ["desayunar", "to have breakfast", ["cereales", "a las siete", "en la cocina"]],
    ["cenar", "to have dinner", ["a las nueve", "en casa", "pescado"]],
    ["limpiar", "to clean", ["la cocina", "el baño", "la casa los sábados"]],
    ["ayudar", "to help", ["en casa", "a los vecinos", "con los deberes"]],
    ["viajar", "to travel", ["en tren", "a México en verano", "mucho"]],
    ["usar", "to use", ["el ordenador", "el móvil en casa", "una mochila azul"]],
    ["preparar", "to prepare", ["la comida", "una presentación", "el desayuno"]],
    ["cantar", "to sing", ["en el coro", "en la ducha", "muy bien"]],
    ["dibujar", "to draw", ["en clase de arte", "animales", "cómics"]],
    ["visitar", "to visit", ["a los abuelos", "un museo", "Madrid"]],
    ["necesitar", "to need", ["ayuda", "un lápiz", "dinero"]],
    ["esperar", "to wait for", ["el autobús", "a un amigo", "en la puerta"]],
    ["descansar", "to rest", ["los domingos", "después de comer", "en el sofá"]],
    ["ganar", "to win / to earn", ["el partido", "un premio", "mucho dinero"]],
    ["pagar", "to pay", ["la cuenta", "con tarjeta", "en efectivo"]],
    ["llevar", "to wear / to carry", ["uniforme", "una mochila", "gafas"]],
    ["terminar", "to finish", ["los deberes a las seis", "el proyecto", "el libro"]],
    ["enseñar", "to teach", ["inglés", "matemáticas", "en un colegio"]],
    ["buscar", "to look for", ["las llaves", "información en internet", "un libro"]],
    ["tocar", "to play (an instrument)", ["la guitarra", "el piano", "la batería"]],
    ["montar", "to ride", ["en bicicleta", "a caballo", "en monopatín"]],
    ["contestar", "to answer", ["las preguntas", "el teléfono", "en español"]],
    ["llamar", "to call", ["a los abuelos", "a la doctora", "por teléfono"]],
    ["sacar", "to take out / to get", ["buenas notas", "fotos", "la basura"]],
    ["charlar", "to chat", ["con los amigos", "en el recreo", "por la noche"]],
    ["patinar", "to skate", ["en el parque", "los fines de semana", "muy rápido"]],
    ["regresar", "to return", ["a casa a las cuatro", "tarde", "en autobús"]],
    ["comer", "to eat", ["en la cafetería", "fruta", "pizza los viernes"]],
    ["beber", "to drink", ["agua", "leche", "zumo de naranja"]],
    ["leer", "to read", ["novelas", "el periódico", "un libro en la cama"]],
    ["aprender", "to learn", ["francés", "a nadar", "mucho en clase"]],
    ["correr", "to run", ["en el parque", "cinco kilómetros", "muy rápido"]],
    ["comprender", "to understand", ["la lección", "las instrucciones", "el problema"]],
    ["vender", "to sell", ["ropa usada", "pasteles en el mercado", "libros"]],
    ["deber", "must / should", ["estudiar más", "hacer los deberes", "llegar a tiempo"]],
    ["creer", "to believe", ["en los fantasmas", "la historia", "en la magia"]],
    ["romper", "to break", ["un vaso", "las reglas", "el silencio"]],
    ["responder", "to reply", ["a los mensajes", "a las preguntas", "rápido"]],
    ["barrer", "to sweep", ["el suelo", "el patio", "la cocina"]],
    ["prometer", "to promise", ["volver pronto", "ayudar en casa", "estudiar más"]],
    ["vivir", "to live", ["en una casa grande", "cerca del colegio", "en Madrid"]],
    ["escribir", "to write", ["correos electrónicos", "en el diario", "un poema"]],
    ["abrir", "to open", ["la ventana", "la puerta", "los regalos"]],
    ["recibir", "to receive", ["muchos mensajes", "un regalo", "buenas noticias"]],
    ["compartir", "to share", ["la habitación", "la comida", "los apuntes"]],
    ["decidir", "to decide", ["el menú", "el plan para el sábado", "rápido"]],
    ["asistir", "to attend", ["a clase", "a un concierto", "a la reunión"]],
    ["subir", "to go up / to upload", ["la escalera", "fotos a internet", "al autobús"]],
    ["describir", "to describe", ["la casa", "la foto", "el problema"]],
    ["discutir", "to argue / to discuss", ["de política", "mucho", "el plan"]],
    ["imprimir", "to print", ["los documentos", "las fotos", "el horario"]],
    ["añadir", "to add", ["sal a la sopa", "azúcar al café", "un comentario"]],
    ["aplaudir", "to clap", ["al final del concierto", "mucho", "en el teatro"]],
    ["interrumpir", "to interrupt", ["la clase", "al director", "la reunión"]],
    ["dividir", "to divide / to split", ["la pizza en ocho trozos", "el trabajo", "los gastos"]],
    ["sufrir", "to suffer", ["mucho estrés", "con el calor", "en silencio"]]
  ];
  const V = Object.fromEntries(VERBS.map(v => [v[0], v]));
  const byGroup = g => VERBS.filter(v => grp(v[0]) === g);
  /* verbs whose complements also suit group subjects such as "la gente" or "el equipo" */
  const GROUPOK = ["hablar","estudiar","trabajar","escuchar","bailar","cenar","viajar","cantar","comer","beber","leer","aprender","correr","vivir","escribir","recibir","compartir","asistir","aplaudir","descansar","llegar","ganar","practicar","nadar","caminar"];
  const pickVerb = (groups) => { const g = pick(groups || ["ar", "er", "ir"]); return pick(byGroup(g)); };

  /* Subjects: [Spanish, person index, note] */
  const PRON_SUBJ = [["yo",0],["tú",1],["él",2],["ella",2],["usted",2],["nosotros",3],["nosotras",3],["ellos",5],["ellas",5],["ustedes",5]];
  const NAMED_SUBJ = [["Ana",2],["Leo",2],["mi hermano",2],["la profesora",2],["mi abuela",2],["el señor Ruiz",2],["Zoe",2],
    ["mis padres",5],["Leo y Mia",5],["mis amigos",5],["los estudiantes",5],["mis primas",5],["Sam y Ravi",5],
    ["mi hermana y yo",3],["Ravi y yo",3],["mis amigos y yo",3]];
  const TRICKY = [
    ["la gente",2,5,"<i>La gente</i> means “people”, but it is a singular word, so it takes the él / ella form."],
    ["mi familia",2,5,"<i>Mi familia</i> is one group, so the verb is singular (él / ella form)."],
    ["todo el mundo",2,5,"<i>Todo el mundo</i> means “everybody”, but it takes a singular verb."],
    ["el equipo",2,5,"<i>El equipo</i> (the team) is one group: singular verb."],
    ["la clase",2,5,"<i>La clase</i> is one group: singular verb."],
    ["usted",2,1,"<i>Usted</i> is the polite “you”, but it takes the él / ella form, not the tú form."],
    ["ustedes",5,4,"<i>Ustedes</i> (you all) always takes the ellos / ellas form."],
    ["mis amigos y yo",3,5,"Any subject that includes <i>yo</i> (“my friends and I”) is <i>nosotros</i>."],
    ["tú y yo",3,1,"<i>Tú y yo</i> (you and I) means “we”, so it takes the nosotros form."],
    ["mi hermana y yo",3,2,"<i>Mi hermana y yo</i> means “my sister and I”: that is <i>nosotros</i>."],
    ["vosotros",4,5,"<i>Vosotros</i> (you all, informal, Spain) has its own ending: -áis, -éis or -ís."],
    ["vosotras",4,3,"<i>Vosotras</i> (you all, informal, Spain) has its own ending: -áis, -éis or -ís."]];
  const personWord = p => ["yo", "tú", "él / ella", "nosotros", "vosotros", "ellos / ellas"][p];
  const subjLine = (s0, p) => PRONS[p].includes(s0.toLowerCase()) ? "Subject: " + es(s0) + "." : "Subject: " + es(s0) + " → <b>" + personWord(p) + "</b>.";

  /* Wrong typed answers for a conjugation */
  function conjWrong(inf, p){
    const w = [{ answers:[inf], msg:"<i>" + inf + "</i> is the infinitive (the dictionary form). Drop -" + grp(inf) + " and add the ending for " + PL[p] + ": -" + END[grp(inf)][p] + "." }];
    const b = badGroup(inf, p); if (b) w.push({ answers:[b.form], msg:groupMsg(inf, p) });
    for (let q = 0; q < 6; q++) if (q !== p) w.push({ answers:[conj(inf, q)], msg:"<i>" + conj(inf, q) + "</i> is the " + PL[q] + " form, but the subject here is " + PL[p] + "." });
    return w;
  }
  /* Wrong options (multiple choice) for a conjugation */
  function conjOptions(inf, p, trapP, trapMsg){
    const pri = [], rest = [];
    const b = badGroup(inf, p); if (b) pri.push({ html:es(b.form), fb:groupMsg(inf, p) });
    if (trapP != null) pri.push({ html:es(conj(inf, trapP)), fb:trapMsg });
    for (let q = 0; q < 6; q++) if (q !== p && q !== trapP && (q !== 4 || p === 4 || trapP === 4))
      rest.push({ html:es(conj(inf, q)), fb:"<i>" + conj(inf, q) + "</i> is the " + PL[q] + " form." });
    rest.push({ html:es(inf), fb:"<i>" + inf + "</i> is the infinitive. A verb with a subject must be conjugated." });
    return { pri, rest };
  }
  const tableHtml = inf => '<div class="tblwrap"><table class="tbl"><tbody>' +
    [0,1,2,3,4,5].map(p => "<tr><td>" + PL[p] + "</td><td>" + es(stem(inf) + "<b>" + END[grp(inf)][p] + "</b>") + "</td></tr>").join("") + "</tbody></table></div>";
  const conjWork = (inf, p) => "<p><i>" + inf + "</i> is an <b>-" + grp(inf) + "</b> verb. Drop -" + grp(inf) + " to get the stem <b>" + stem(inf) + "-</b>, then add the " + PL[p] + " ending <b>-" + END[grp(inf)][p] + "</b>: " + es(conj(inf, p)) + ".</p>";

  /* ---------- everyday vocabulary bank ---------- */
  /* [Spanish, English, category a/t/p, typed level 0 none / 2 single word / 3 phrase, other accepted answers, clash tag] */
  const VOC = [
    ["desayunar","to have breakfast","a",2],["almorzar","to have lunch","a",2],["cenar","to have dinner","a",2],
    ["merendar","to have an afternoon snack","a",2],["ir al colegio","to go to school","a",3,["ir a la escuela","ir al instituto"]],
    ["volver a casa","to go back home","a",3,["regresar a casa"]],["hacer los deberes","to do homework","a",3,["hacer la tarea","hacer las tareas"]],
    ["estudiar para un examen","to study for a test","a",0],["lavarse los dientes","to brush your teeth","a",3,["cepillarse los dientes"]],
    ["ducharse","to take a shower","a",2],["levantarse","to get up","a",2],["despertarse","to wake up","a",2],
    ["acostarse","to go to bed","a",2],["vestirse","to get dressed","a",2],["ver la tele","to watch TV","a",3,["ver la televisión","mirar la tele","mirar la televisión"]],
    ["escuchar música","to listen to music","a",3],["leer un libro","to read a book","a",3],["jugar al fútbol","to play soccer","a",3,["jugar fútbol"]],
    ["tocar la guitarra","to play the guitar","a",3],["montar en bicicleta","to ride a bike","a",3,["montar en bici","andar en bicicleta","andar en bici"]],
    ["pasear al perro","to walk the dog","a",3,["sacar al perro","pasear el perro"]],["sacar la basura","to take out the trash","a",3],
    ["poner la mesa","to set the table","a",3],["hacer la cama","to make the bed","a",3],["lavar los platos","to wash the dishes","a",3,["fregar los platos"]],
    ["ir de compras","to go shopping","a",3],["navegar por internet","to surf the internet","a",3,["navegar en internet"]],
    ["chatear con amigos","to chat online with friends","a",0],["descansar","to rest","a",2],
    ["dormir la siesta","to take a nap","a",3,["echar la siesta","tomar una siesta","echarse la siesta"]],
    ["tomar el autobús","to take the bus","a",3,["coger el autobús"]],["ir a pie","to go on foot","a",3,["ir andando","ir caminando"]],
    ["hacer deporte","to do sports","a",3,["hacer ejercicio","practicar deporte"]],["ordenar el cuarto","to tidy your room","a",3,["ordenar la habitación","ordenar mi cuarto","ordenar mi habitación"]],
    ["cocinar","to cook","a",2],["quedar con amigos","to meet up with friends","a",0,null,"friends"],["salir con amigos","to go out with friends","a",3,null,"friends"],
    ["dibujar","to draw","a",2],["trabajar","to work","a",2],["cantar en el coro","to sing in the choir","a",0],
    ["siempre","always","t",2],["nunca","never","t",2,["jamás"]],["a veces","sometimes","t",2],["casi nunca","hardly ever","t",2],
    ["a menudo","often","t",2,["con frecuencia","muchas veces"]],["normalmente","usually","t",2,["generalmente","por lo general"]],
    ["todos los días","every day","t",2,["cada día"]],["de vez en cuando","from time to time","t",3],["una vez a la semana","once a week","t",3],
    ["dos veces al mes","twice a month","t",3],["por la mañana","in the morning","t",3],["por la tarde","in the afternoon","t",3],
    ["por la noche","at night","t",3],["al mediodía","at noon","t",2],["los fines de semana","on weekends","t",3,null,"wk"],
    ["los lunes","on Mondays","t",2],["entre semana","on weekdays","t",3,["durante la semana"]],["después de clase","after class","t",3,["después de las clases"]],
    ["antes de cenar","before dinner","t",3],["temprano","early","t",2,null,"soon"],["tarde","late","t",2],["primero","first","t",2],
    ["luego","later","t",2,null,"then"],["después","afterward","t",2,null,"then"],["finalmente","finally","t",2,["por último","al final"]],
    ["a las ocho","at eight o'clock","t",3],["pronto","soon","t",2,null,"soon"],["todavía","still","t",2],["ya","already","t",2],
    ["la rutina","the routine","p",2,null,"sched"],["el horario","the timetable","p",2,null,"sched"],["el fin de semana","the weekend","p",3,null,"wk"],
    ["la biblioteca","the library","p",2],["el polideportivo","the sports center","p",2,null,"gym"],["el gimnasio","the gym","p",2,null,"gym"],
    ["la piscina","the swimming pool","p",2],["el centro comercial","the mall","p",3],["la cocina","the kitchen","p",2],
    ["el dormitorio","the bedroom","p",2,["la habitación","el cuarto"]],["el baño","the bathroom","p",2],["el recreo","recess (the school break)","p",2,["el descanso"]],
    ["el comedor","the dining hall","p",2],["el patio","the schoolyard","p",2],["la parada de autobús","the bus stop","p",3,["la parada del autobús","la parada"]],
    ["el despertador","the alarm clock","p",2],["la mochila","the backpack","p",2],["el uniforme","the uniform","p",2]
  ].map(r => ({ es:r[0], en:r[1], cat:r[2], typ:r[3], alt:r[4] || [], clash:r[5] || "" }));
  const IRREG_NOTE = { "ir al colegio":"<i>ir</i> is irregular (voy, vas, va…), so learn this one as a phrase.",
    "ir de compras":"<i>ir</i> is irregular, so learn this one as a phrase.", "ir a pie":"<i>ir</i> is irregular, so learn this one as a phrase.",
    "hacer los deberes":"<i>hacer</i> has an irregular yo form (hago).", "hacer la cama":"<i>hacer</i> has an irregular yo form (hago).",
    "hacer deporte":"<i>hacer</i> has an irregular yo form (hago).", "almorzar":"<i>almorzar</i> changes o → ue: almuerzo.",
    "merendar":"<i>merendar</i> changes e → ie: meriendo.", "lavarse los dientes":"<i>lavarse</i> is reflexive: me lavo los dientes.",
    "ducharse":"<i>ducharse</i> is reflexive: me ducho.", "levantarse":"<i>levantarse</i> is reflexive: me levanto.",
    "despertarse":"<i>despertarse</i> is reflexive with e → ie: me despierto.", "acostarse":"<i>acostarse</i> is reflexive with o → ue: me acuesto.",
    "vestirse":"<i>vestirse</i> is reflexive with e → i: me visto.", "jugar al fútbol":"<i>jugar</i> changes u → ue: juego.",
    "volver a casa":"<i>volver</i> changes o → ue: vuelvo.", "dormir la siesta":"<i>dormir</i> changes o → ue: duermo.",
    "ver la tele":"<i>ver</i> has an irregular yo form: veo.", "poner la mesa":"<i>poner</i> has an irregular yo form: pongo.",
    "salir con amigos":"<i>salir</i> has an irregular yo form: salgo." };
  const vocNote = v => IRREG_NOTE[v.es] ? " " + IRREG_NOTE[v.es] : "";
  function vocDistractors(v, lang){
    const okd = d => d !== v && d.en !== v.en && (!v.clash || d.clash !== v.clash);
    const same = VOC.filter(d => okd(d) && d.cat === v.cat), other = VOC.filter(d => okd(d) && d.cat !== v.cat);
    const f = d => ({ html:lang === "en" ? d.en : es(d.es), fb:"<i>" + d.es + "</i> means “" + d.en + "”." });
    return { pri:sh(same).slice(0, 3).map(f), rest:sh(other).slice(0, 2).map(f) };
  }
  const vocWrongTyped = v => VOC.filter(d => d !== v).map(d => ({ answers:[d.es, ...d.alt], msg:"<i>" + d.es + "</i> means “" + d.en + "”, not “" + v.en + "”." }));
  const noArt = s => s.replace(/^(el|la|los|las) /, "");

  /* Frequency words in context */
  const CONTEXT = [
    ["Odio el pescado, así que " + BLANK + " como pescado.", "nunca", ["siempre","a menudo","todos los días"], "You hate fish, so you <b>never</b> eat it."],
    ["Me encanta el fútbol: juego " + BLANK + ", de lunes a domingo.", "todos los días", ["nunca","una vez al mes","casi nunca"], "“From Monday to Sunday” means <b>every day</b>."],
    ["Me ducho " + BLANK + ", antes de ir al colegio.", "por la mañana", ["por la noche","después de clase","después de cenar"], "Before school is <b>in the morning</b>."],
    ["No tengo clase " + BLANK + ", así que el sábado y el domingo duermo hasta tarde.", "los fines de semana", ["los lunes","entre semana","todos los días"], "Saturday and Sunday are <b>the weekend</b>."],
    ["Voy a la piscina " + BLANK + ": solo los martes.", "una vez a la semana", ["todos los días","dos veces al día","nunca"], "Only on Tuesdays means <b>once a week</b>."],
    [BLANK + " hago los deberes y después veo la tele.", "Primero", ["Después","Nunca","Finalmente"], "<i>Primero … y después …</i> = first … and then …"],
    ["Mi hermano es muy puntual: " + BLANK + " llega tarde.", "nunca", ["siempre","a menudo","todos los días"], "A punctual person <b>never</b> arrives late."],
    ["Leo es muy perezoso: " + BLANK + " ayuda en casa.", "casi nunca", ["siempre","todos los días","a menudo"], "A lazy person <b>hardly ever</b> helps."],
    ["Como en el comedor " + BLANK + ", a las doce y media.", "al mediodía", ["por la noche","a medianoche","por la mañana temprano"], "12:30 is around <b>noon</b>."],
    ["Me levanto " + BLANK + " porque el autobús sale a las siete.", "temprano", ["tarde","a medianoche","por la noche"], "A bus at seven means you get up <b>early</b>."],
    ["Los domingos me levanto " + BLANK + ", a las once.", "tarde", ["temprano","muy temprano","de madrugada"], "Eleven o’clock is <b>late</b> for getting up."],
    ["Juego al tenis " + BLANK + ": los lunes y los jueves.", "dos veces a la semana", ["una vez al mes","todos los días","nunca"], "Mondays and Thursdays = <b>twice a week</b>."],
    ["Mi abuela vive lejos y la visitamos " + BLANK + ", en Navidad y en verano.", "dos veces al año", ["todos los días","cada semana","nunca"], "Christmas and summer = <b>twice a year</b>."],
    ["Ceno con mi familia " + BLANK + ", a las nueve.", "por la noche", ["por la mañana","al mediodía","antes de desayunar"], "Nine o’clock dinner is <b>at night</b>."]
  ];
  const FREQ_SCALE = ["nunca", "casi nunca", "a veces", "a menudo", "casi siempre", "siempre"];
  const FREQ_EN = { "nunca":"never", "casi nunca":"hardly ever", "a veces":"sometimes", "a menudo":"often", "casi siempre":"almost always", "siempre":"always" };

  /* ---------- notices and posters ---------- */
  /* { id, lvl, html, qs:[[question, correct, [[wrong, fb], ...], explanation, key]] } */
  const box = s => '<div class="quotebox" lang="es">' + s + "</div>";
  const NOTICES = [
    { id:"chess", lvl:1, html:box("<p><b>¡CLUB DE AJEDREZ!</b><br>Todos los martes, de 15:30 a 16:30, en el aula 12.<br>Para estudiantes de 12 a 14 años.<br>¡Es gratis! Habla con el profesor Gómez.</p>"), qs:[
      ["When does the club meet?", "Every Tuesday afternoon", [["Every Thursday afternoon","<i>Martes</i> is Tuesday; Thursday is <i>jueves</i>."],["Every day at 3:30","<i>Todos los martes</i> means every Tuesday, not every day."],["Every Tuesday morning","15:30 to 16:30 is in the afternoon."]], "<i>Todos los martes</i> = every Tuesday, and 15:30–16:30 is the afternoon.", "Days of the week: lunes, martes, miércoles, jueves, viernes, sábado, domingo."],
      ["How much does the club cost?", "Nothing: it is free", [["12 euros","12 is the room number (<i>aula 12</i>)."],["14 euros","14 is the oldest age in <i>de 12 a 14 años</i>."],["You pay Mr. Gómez each week","The poster says to talk to him, not pay him."]], "<i>¡Es gratis!</i> means “It's free!”", "<i>Gratis</i> = free (no cost)."]]},
    { id:"library", lvl:1, html:box("<p><b>BIBLIOTECA MUNICIPAL</b><br>Horario: de lunes a viernes, de 9:00 a 20:00.<br>Sábados: de 10:00 a 14:00. Domingos: cerrado.<br>En la biblioteca no se puede comer ni beber.</p>"), qs:[
      ["When is the library closed all day?", "On Sundays", [["On Saturdays","On Saturdays it is open from 10:00 to 14:00."],["On Mondays","Monday to Friday it is open 9:00–20:00."],["Every evening after 14:00","Only on Saturday does it close at 14:00."]], "<i>Domingos: cerrado</i> = Sundays: closed.", "<i>Abierto</i> = open, <i>cerrado</i> = closed."],
      ["What are you not allowed to do there?", "Eat or drink", [["Use the computers","Computers are not mentioned."],["Talk","Talking is not mentioned."],["Borrow books","Borrowing is not mentioned."]], "<i>No se puede comer ni beber</i> = you can't eat or drink.", "<i>No se puede …</i> = you can't … / it is not allowed."]]},
    { id:"pool", lvl:1, html:box("<p><b>PISCINA – NORMAS</b><br>1. Ducharse antes de nadar.<br>2. Usar gorro de baño.<br>3. Prohibido correr.<br>4. Los niños menores de 10 años nadan con un adulto.</p>"), qs:[
      ["What must you do before swimming?", "Take a shower", [["Eat something","Food is not mentioned."],["Run a lap","Running is forbidden (<i>prohibido correr</i>)."],["Talk to a lifeguard","Lifeguards are not mentioned."]], "<i>Ducharse antes de nadar</i> = shower before swimming.", "<i>Antes de</i> = before; <i>después de</i> = after."],
      ["What is forbidden?", "Running", [["Wearing a swim cap","Rule 2 says you must wear one (<i>usar gorro de baño</i>)."],["Swimming with an adult","Rule 4 asks young children to do this."],["Taking a shower","Rule 1 asks you to shower."]], "<i>Prohibido correr</i> = no running.", "<i>Prohibido</i> = forbidden."],
      ["Who has to swim with an adult?", "Children under 10", [["Children over 10","<i>Menores de</i> means younger than."],["Everyone","Only children under 10."],["Teenagers","The rule is about children under 10."]], "<i>Los niños menores de 10 años</i> = children under 10.", "<i>Menor de</i> = younger than / under; <i>mayor de</i> = older than."]]},
    { id:"textleo", lvl:1, html:box("<p>Hola, mamá. Estoy en casa de Zoe. Estudiamos para el examen de ciencias. Llego a casa a las siete. ¡Besos! Leo</p>"), qs:[
      ["Where is Leo?", "At Zoe's house", [["At school","<i>En casa de Zoe</i> = at Zoe's house."],["At home","He says he gets home at seven, so he is not home yet."],["At the library","The library is not mentioned."]], "<i>Estoy en casa de Zoe</i> = I'm at Zoe's house.", "<i>En casa de</i> + name = at someone's house."],
      ["What are Leo and Zoe doing?", "Studying for a science test", [["Doing a science experiment","<i>Estudiamos para el examen</i> = we are studying for the test."],["Watching TV","TV is not mentioned."],["Cooking dinner","Dinner is not mentioned."]], "<i>Estudiamos para el examen de ciencias.</i>", "<i>Examen</i> = test or exam."],
      ["When will Leo get home?", "At seven", [["At eleven","Seven is <i>siete</i>; eleven is <i>once</i>."],["At six","Six is <i>seis</i>."],["Tomorrow","He says <i>a las siete</i>."]], "<i>Llego a casa a las siete</i> = I get home at seven.", "<i>A las</i> + number = at … o'clock."]]},
    { id:"timetable", lvl:1, html:box("<p><b>HORARIO – LUNES (2.º B)</b><br>8:30 Matemáticas<br>9:30 Inglés<br>10:30 Recreo<br>11:00 Ciencias<br>12:00 Educación Física<br>13:00 Comida</p>"), qs:[
      ["What is the second class on Monday?", "English", [["Math","Math is the first class."],["Science","Science is at 11:00, after the break."],["PE","PE is at 12:00."]], "At 9:30 the timetable says <i>Inglés</i> = English.", "School subjects are often cognates: <i>matemáticas, ciencias, historia</i>."],
      ["What happens at 10:30?", "Break (recess)", [["Lunch","Lunch (<i>comida</i>) is at 13:00."],["PE","PE is at 12:00."],["Science","Science starts at 11:00."]], "<i>Recreo</i> = break / recess.", "<i>El recreo</i> = recess, the school break."],
      ["When is PE?", "At 12:00", [["At 8:30","8:30 is math."],["At 11:00","11:00 is science."],["At 13:00","13:00 is lunch."]], "<i>Educación Física</i> (physical education) is at 12:00.", "<i>Educación Física</i> = PE."]]},
    { id:"party", lvl:1, html:box("<p><b>¡FIESTA DE CUMPLEAÑOS!</b><br>Mia cumple 14 años.<br>Sábado 12 de mayo, a las 17:00. Calle Sol, 8.<br>Trae tu traje de baño: ¡hay piscina!<br>Contesta antes del jueves.</p>"), qs:[
      ["Why should guests bring a swimsuit?", "There is a pool", [["They are going to the beach","The beach is not mentioned."],["It is a sports party","Sports are not mentioned."],["It will rain","Rain is not mentioned."]], "<i>¡Hay piscina!</i> = there is a pool!", "<i>Hay</i> = there is / there are."],
      ["What should guests do before Thursday?", "Reply to the invitation", [["Buy a present","Presents are not mentioned."],["Arrive at the party","The party is on Saturday."],["Call Mia's parents","The notice only says to reply."]], "<i>Contesta antes del jueves</i> = reply before Thursday.", "<i>Contestar</i> = to answer / reply."],
      ["How old is Mia turning?", "14", [["12","12 is the date (<i>12 de mayo</i>)."],["17","17:00 is the time of the party."],["8","8 is the house number."]], "<i>Mia cumple 14 años</i> = Mia turns 14.", "<i>Cumplir años</i> = to have a birthday."]]},
    { id:"cat", lvl:1, html:box("<p><b>¡SE BUSCA GATO!</b><br>Se llama Bigotes. Es gris y blanco, pequeño y muy simpático. Lleva un collar rojo. Vive en la calle Luna. Si ves a Bigotes, llama a Sara: 600 111 222.</p>"), qs:[
      ["What color is the cat's collar?", "Red", [["Gray","Gray (<i>gris</i>) is the cat's fur."],["White","White (<i>blanco</i>) is the cat's fur."],["Blue","<i>Rojo</i> means red."]], "<i>Lleva un collar rojo</i> = it wears a red collar.", "Colors: <i>rojo</i> red, <i>gris</i> gray, <i>blanco</i> white, <i>azul</i> blue."],
      ["What does the cat look like?", "Small, gray and white", [["Big and black","<i>Pequeño</i> = small; <i>gris y blanco</i> = gray and white."],["Small and red","Red is the collar, not the cat."],["Big, gray and white","<i>Pequeño</i> means small."]], "<i>Es gris y blanco, pequeño</i>.", "<i>Grande</i> = big, <i>pequeño</i> = small."],
      ["What should you do if you see the cat?", "Call Sara", [["Take it to Luna Street","Luna Street is where it lives; the notice says to call."],["Feed it","Feeding is not mentioned."],["Send a photo","Photos are not mentioned."]], "<i>Si ves a Bigotes, llama a Sara</i> = if you see Bigotes, call Sara.", "<i>Llama</i> = call (an instruction)."]]},
    { id:"menu", lvl:1, html:box("<p><b>CAFETERÍA – MENÚ DEL DÍA (5 €)</b><br>Primer plato: sopa de verduras o ensalada<br>Segundo plato: pollo con arroz o pasta con tomate<br>Postre: fruta o yogur<br>Bebida: agua</p>"), qs:[
      ["How much does the menu of the day cost?", "5 euros", [["15 euros","The notice says 5 €."],["2 euros","2 is not mentioned."],["It is free","The price is 5 €."]], "<i>Menú del día (5 €)</i>.", "A Spanish <i>menú del día</i> is a set meal with a fixed price."],
      ["Which of these is a dessert?", "Yogurt", [["Salad","Salad is a first course (<i>primer plato</i>)."],["Chicken with rice","That is a second course."],["Vegetable soup","Soup is a first course."]], "<i>Postre: fruta o yogur</i> = dessert: fruit or yogurt.", "<i>Postre</i> = dessert."],
      ["What drink comes with the menu?", "Water", [["Orange juice","Juice is not mentioned."],["Milk","Milk is not mentioned."],["Soda","Soda is not mentioned."]], "<i>Bebida: agua</i> = drink: water.", "<i>Bebida</i> = drink, from <i>beber</i>."]]},
    { id:"study", lvl:1, html:box("<p><b>SALA DE ESTUDIO</b><br>Silencio, por favor.<br>Apaga el móvil.<br>Abierta todos los días de 8:00 a 21:00.</p>"), qs:[
      ["What should you do with your phone?", "Turn it off", [["Charge it","<i>Apaga</i> means switch off."],["Leave it at the entrance","The notice does not say that."],["Use it quietly","<i>Apaga el móvil</i> = turn off your phone."]], "<i>Apaga el móvil</i> = turn off your phone.", "<i>Apagar</i> = to turn off; <i>el móvil</i> = cell phone."],
      ["When is the study room open?", "Every day, 8:00 to 21:00", [["Weekdays only","<i>Todos los días</i> = every day."],["Only in the morning","It is open until 21:00."],["Only on weekends","<i>Todos los días</i> = every day."]], "<i>Abierta todos los días de 8:00 a 21:00</i>.", "<i>De … a …</i> = from … to …"]]},
    { id:"trip", lvl:2, html:box("<p><b>EXCURSIÓN AL MUSEO DE CIENCIAS</b><br>Los estudiantes de 2.º visitan el museo el viernes 3 de marzo. Salimos del colegio a las 8:45 en autobús y regresamos a las 15:00. Cada estudiante necesita traer la comida y 6 € para la entrada. Las familias deben firmar la autorización antes del lunes.</p>"), qs:[
      ["How do the students travel?", "By bus", [["By train","<i>En autobús</i> = by bus."],["On foot","They travel <i>en autobús</i>."],["By car","They travel <i>en autobús</i>."]], "<i>Salimos del colegio a las 8:45 en autobús</i>.", "<i>En</i> + transport: en autobús, en tren, en coche."],
      ["What does each student need to bring?", "Lunch and 6 euros", [["A permission slip and 3 euros","3 is the date (<i>3 de marzo</i>); the price is 6 €."],["Only 6 euros","They also need <i>la comida</i> (lunch)."],["A science book","Books are not mentioned."]], "<i>Necesita traer la comida y 6 € para la entrada</i>.", "<i>Traer</i> = to bring; <i>la entrada</i> = the ticket / entrance."],
      ["What must families do before Monday?", "Sign the permission form", [["Pay for the bus","The bus is not mentioned as a cost."],["Visit the museum","Only the students visit."],["Pick up the students at 15:00","15:00 is when they return; nothing says families must collect them."]], "<i>Las familias deben firmar la autorización</i>.", "<i>Deber</i> + infinitive = must; <i>firmar</i> = to sign."]]},
    { id:"sports", lvl:2, html:box("<p><b>POLIDEPORTIVO LAS PALMERAS</b><br>Clases de natación para jóvenes: lunes y miércoles, a las 18:00.<br>Yoga: martes y jueves, a las 19:30.<br>Las clases empiezan el 15 de septiembre. Inscripción en recepción o en nuestra página web. ¡La primera clase es gratis!</p>"), qs:[
      ["When are the swimming classes?", "Mondays and Wednesdays at 6 p.m.", [["Tuesdays and Thursdays at 7:30 p.m.","Those are the yoga classes."],["Every day at 6 p.m.","Only <i>lunes y miércoles</i>."],["Mondays and Wednesdays at 8 a.m.","18:00 is 6 p.m."]], "<i>Natación: lunes y miércoles, a las 18:00</i>.", "<i>Natación</i> = swimming (from <i>nadar</i>)."],
      ["How can you sign up?", "At reception or on the website", [["Only by phone","Phones are not mentioned."],["At the first class","Sign-up is <i>en recepción o en nuestra página web</i>."],["Only on September 15","That is the start date."]], "<i>Inscripción en recepción o en nuestra página web</i>.", "<i>Inscripción</i> = registration / sign-up."],
      ["What is special about the first class?", "It is free", [["It is longer","Length is not mentioned."],["It is on a Sunday","Days are Monday to Thursday."],["It is only for adults","The swimming classes are <i>para jóvenes</i>."]], "<i>¡La primera clase es gratis!</i>", "<i>Gratis</i> = free."]]},
    { id:"cine", lvl:2, html:box("<p>Oye, Sam, ¿vienes al cine esta tarde? Ana y yo vamos a ver la nueva película de terror a las seis. Ya tenemos tu entrada: la compramos por internet, así que no necesitas pagar en la taquilla. Esperamos en la puerta a las cinco y media. ¡Contesta pronto!</p>"), qs:[
      ["What time will they meet?", "At 5:30, at the door", [["At 6:00, at the door","The film starts at six; they meet at <i>las cinco y media</i>."],["At 5:00, inside","<i>Cinco y media</i> = half past five."],["At 6:30, at the ticket office","They meet <i>en la puerta</i> at 5:30."]], "<i>Esperamos en la puerta a las cinco y media</i>.", "<i>Y media</i> = half past."],
      ["Why doesn't Sam need to pay at the ticket office?", "His ticket was bought online", [["The film is free","They bought the ticket, so it is not free."],["Ana will pay at the door","The ticket is already bought <i>por internet</i>."],["He has a student card","Student cards are not mentioned."]], "<i>Ya tenemos tu entrada: la compramos por internet</i>.", "<i>Por internet</i> = online; <i>la taquilla</i> = ticket office."],
      ["What kind of film is it?", "A horror film", [["A comedy","<i>Terror</i> = horror."],["A documentary","<i>Película de terror</i> = horror film."],["A romantic film","<i>Película de terror</i> = horror film."]], "<i>La nueva película de terror</i>.", "<i>Película de terror</i> = horror movie."]]},
    { id:"loans", lvl:2, html:box("<p><b>AVISO</b><br>Los libros se prestan durante dos semanas. Si necesitas más tiempo, puedes renovar el préstamo una vez, en el mostrador o por teléfono. Los diccionarios no se prestan: solo se usan en la sala.</p>"), qs:[
      ["How long can you borrow a book?", "Two weeks", [["Two days","<i>Semanas</i> = weeks."],["One week","<i>Dos semanas</i> = two weeks."],["As long as you want","There is a limit of two weeks."]], "<i>Los libros se prestan durante dos semanas</i>.", "<i>Prestar</i> = to lend; <i>el préstamo</i> = the loan."],
      ["What is true about dictionaries?", "You can only use them in the room", [["You can borrow them for one week","<i>Los diccionarios no se prestan</i> = dictionaries are not lent."],["You can renew them by phone","Renewing is for books you can borrow."],["They are for sale","Selling is not mentioned."]], "<i>Solo se usan en la sala</i> = they are only used in the room.", "<i>Solo</i> = only."],
      ["How many times can you renew a loan?", "Once", [["Twice","<i>Una vez</i> = once."],["Every week","<i>Una vez</i> = one time."],["Never","You can renew <i>una vez</i>."]], "<i>Puedes renovar el préstamo una vez</i>.", "<i>Una vez</i> = once; <i>dos veces</i> = twice."]]},
    { id:"shelter", lvl:2, html:box("<p><b>¿TE GUSTA AYUDAR?</b><br>El refugio de animales de la ciudad busca voluntarios de 14 a 18 años. Los voluntarios pasean a los perros, limpian las jaulas y juegan con los gatos. Necesitamos ayuda los sábados por la mañana. No necesitas experiencia.</p>"), qs:[
      ["Who can volunteer?", "Young people aged 14 to 18", [["Anyone over 18","The age range is <i>de 14 a 18 años</i>."],["Only people with experience","<i>No necesitas experiencia</i>."],["Children under 14","The minimum age is 14."]], "<i>Busca voluntarios de 14 a 18 años</i>.", "<i>De … a … años</i> = aged … to …"],
      ["Which task do volunteers do?", "Walk the dogs", [["Feed the horses","Horses are not mentioned."],["Wash the cats","They play with the cats (<i>juegan con los gatos</i>)."],["Answer the phone","The phone is not mentioned."]], "<i>Pasean a los perros</i> = they walk the dogs.", "<i>Pasear al perro</i> = to walk the dog."],
      ["When is help needed?", "Saturday mornings", [["Saturday evenings","<i>Por la mañana</i> = in the morning."],["Every morning","Only <i>los sábados</i>."],["Sunday mornings","<i>Sábados</i> = Saturdays."]], "<i>Necesitamos ayuda los sábados por la mañana</i>.", "<i>Los sábados</i> = on Saturdays (every Saturday)."]]},
    { id:"recycle", lvl:2, html:box("<p><b>VECINOS:</b><br>El camión de la basura pasa los lunes, miércoles y viernes por la noche. El papel y el cartón van en el contenedor azul; el plástico y las latas, en el amarillo; el vidrio, en el verde. Por favor, no dejen bolsas en la escalera.</p>"), qs:[
      ["Where does glass go?", "In the green container", [["In the blue container","Blue is for paper and cardboard."],["In the yellow container","Yellow is for plastic and cans."],["On the stairs","The notice asks people not to leave bags there."]], "<i>El vidrio, en el verde</i>.", "<i>Vidrio</i> = glass; <i>verde</i> = green."],
      ["What are neighbors asked not to do?", "Leave bags on the stairs", [["Recycle cans","Cans go in the yellow container."],["Take out trash on Mondays","The truck comes on Mondays."],["Use the blue container","Blue is for paper."]], "<i>No dejen bolsas en la escalera</i>.", "<i>Dejar</i> = to leave (something somewhere)."],
      ["When does the garbage truck come?", "Monday, Wednesday and Friday nights", [["Every morning","It comes <i>por la noche</i>."],["Only on weekends","The days are Monday, Wednesday, Friday."],["Tuesday and Thursday nights","<i>Lunes, miércoles y viernes</i>."]], "<i>Pasa los lunes, miércoles y viernes por la noche</i>.", "<i>Por la noche</i> = at night."]]},
    { id:"lucas", lvl:2, html:box("<p>Hola, me llamo Lucas y tengo 15 años. Vivo en Valencia con mis padres y mi hermana. Busco un estudiante de intercambio para practicar inglés. Me gusta el baloncesto y toco la batería. Por las tardes estudio y los fines de semana monto en bicicleta con mis amigos.</p>"), qs:[
      ["Why is Lucas looking for an exchange student?", "To practice English", [["To learn to play the drums","He already plays the drums."],["To find a basketball team","He likes basketball, but that is not why he is writing."],["To visit Valencia","He lives in Valencia."]], "<i>Busco un estudiante de intercambio para practicar inglés</i>.", "<i>Para</i> + infinitive = in order to."],
      ["What does Lucas do on weekends?", "Rides his bike with friends", [["Studies","He studies <i>por las tardes</i> (in the afternoons)."],["Plays basketball","He likes basketball, but the weekend activity is cycling."],["Works","Work is not mentioned."]], "<i>Los fines de semana monto en bicicleta con mis amigos</i>.", "<i>Montar en bicicleta</i> = to ride a bike."],
      ["Which instrument does he play?", "The drums", [["The guitar","<i>La batería</i> = the drums."],["The piano","<i>La batería</i> = the drums."],["He doesn't play one","<i>Toco la batería</i>."]], "<i>Toco la batería</i> = I play the drums.", "<i>Tocar</i> + instrument = to play."]]},
    { id:"rain", lvl:2, html:box("<p><b>ATENCIÓN, JUGADORES</b><br>Por la lluvia, el partido de fútbol del sábado se cancela. Jugamos el próximo sábado a la misma hora. El entrenamiento del jueves es en el gimnasio, no en el campo.</p>"), qs:[
      ["Why is Saturday's game canceled?", "Because of the rain", [["Because of the heat","<i>Lluvia</i> = rain."],["The other team can't come","The reason is <i>por la lluvia</i>."],["The field is closed for repairs","The reason is the rain."]], "<i>Por la lluvia, el partido se cancela</i>.", "<i>La lluvia</i> = the rain; <i>llover</i> = to rain."],
      ["Where is Thursday's practice?", "In the gym", [["On the field","<i>No en el campo</i> = not on the field."],["At the pool","The pool is not mentioned."],["There is no practice","Practice happens, just in the gym."]], "<i>El entrenamiento del jueves es en el gimnasio</i>.", "<i>El entrenamiento</i> = training / practice."],
      ["When will the game be played?", "Next Saturday at the same time", [["On Thursday","Thursday is practice."],["Tomorrow","<i>El próximo sábado</i> = next Saturday."],["Next Saturday at a new time","<i>A la misma hora</i> = at the same time."]], "<i>Jugamos el próximo sábado a la misma hora</i>.", "<i>Próximo</i> = next; <i>mismo</i> = same."]]},
    { id:"books", lvl:2, html:box("<p><b>LIBRERÍA PÁGINAS</b><br>Abierto de lunes a sábado, de 10:00 a 14:00 y de 17:00 a 20:30.<br>Esta semana: 20 % de descuento en todos los cómics.<br>Aceptamos tarjeta.</p>"), qs:[
      ["What kind of shop is this?", "A bookstore", [["A library","False friend: <i>librería</i> = bookstore; library = <i>biblioteca</i>."],["A clothing store","<i>Librería</i> comes from <i>libro</i> (book)."],["A bakery","A bakery is a <i>panadería</i>."]], "<i>Librería</i> sells books; a <i>biblioteca</i> lends them.", "False friend: <i>librería</i> = bookstore, not library."],
      ["When is it closed on a weekday?", "Between 2 p.m. and 5 p.m.", [["All day Monday","It opens <i>de lunes a sábado</i>."],["After 5 p.m.","It reopens at 17:00 until 20:30."],["Before 2 p.m.","It is open 10:00–14:00."]], "It is open 10:00–14:00 and 17:00–20:30, so it is closed 14:00–17:00.", "Many Spanish shops close in the early afternoon."],
      ["What is on sale this week?", "Comics, 20% off", [["Everything, 20% off","Only <i>todos los cómics</i>."],["Comics, 2 for 1","It says <i>20 % de descuento</i>."],["Dictionaries, 20% off","The discount is <i>en todos los cómics</i>."]], "<i>20 % de descuento en todos los cómics</i>.", "<i>Descuento</i> = discount."]]},
    { id:"cooking", lvl:2, html:box("<p><b>TALLER DE COCINA PARA JÓVENES</b><br>Aprende a preparar platos fáciles y sanos.<br>Cada jueves cocinamos una receta de un país diferente.<br>Lugar: centro cultural, sala 3. Hora: de 17:00 a 19:00.<br>Precio: 15 € al mes, ingredientes incluidos.</p>"), qs:[
      ["What happens every Thursday?", "They cook a recipe from a different country", [["They eat at a restaurant","They cook (<i>cocinamos</i>)."],["They cook the same recipe","<i>Un país diferente</i> = a different country each time."],["They visit another country","They cook food from another country."]], "<i>Cada jueves cocinamos una receta de un país diferente</i>.", "<i>Cada</i> = each / every."],
      ["What does the price include?", "The ingredients", [["A cookbook","Books are not mentioned."],["Dinner at the cultural center","Only <i>ingredientes incluidos</i>."],["Transport","Transport is not mentioned."]], "<i>15 € al mes, ingredientes incluidos</i>.", "<i>Incluido</i> = included."],
      ["How often do you pay 15 euros?", "Once a month", [["Each class","<i>Al mes</i> = per month."],["Once a year","<i>Al mes</i> = per month."],["Once a week","The class is weekly, but the price is <i>al mes</i>."]], "<i>15 € al mes</i> = 15 euros per month.", "<i>Al mes</i> = per month; <i>a la semana</i> = per week."]]},
    { id:"council", lvl:3, html:box("<p><b>CONSEJO ESTUDIANTIL: ELECCIONES</b><br>¿Quieres representar a tu clase? Los candidatos deben presentar una lista de propuestas antes del 10 de octubre. Cada candidato da un discurso de dos minutos en la asamblea del día 15. Los estudiantes votan el día 17 durante la tutoría. Los resultados se publican en el tablón de anuncios.</p>"), qs:[
      ["What must candidates hand in by October 10?", "A list of proposals", [["A two-minute video","The two-minute speech is given live at the assembly."],["Their votes","Students vote on the 17th."],["A letter from a teacher","Letters are not mentioned."]], "<i>Deben presentar una lista de propuestas antes del 10 de octubre</i>.", "<i>Propuesta</i> = proposal / idea for change."],
      ["When do students vote?", "On the 17th, during homeroom", [["On the 15th, at the assembly","The 15th is the speeches."],["On October 10","That is the deadline for proposals."],["After school on the 17th","<i>Durante la tutoría</i> = during homeroom."]], "<i>Los estudiantes votan el día 17 durante la tutoría</i>.", "<i>La tutoría</i> = homeroom / tutor time."],
      ["Where will the results appear?", "On the bulletin board", [["At the assembly","The assembly is for speeches."],["In an email","Email is not mentioned."],["On the school website","<i>El tablón de anuncios</i> = the bulletin board."]], "<i>Los resultados se publican en el tablón de anuncios</i>.", "<i>Tablón de anuncios</i> = notice board."]]},
    { id:"museum", lvl:3, html:box("<p><b>MUSEO DE ARTE MODERNO</b><br>Entrada general: 8 €. Estudiantes con carné: 4 €. Menores de 12 años: gratis.<br>Los miércoles por la tarde la entrada es gratuita para todos.<br>Se permite hacer fotos sin flash. Las mochilas grandes se dejan en la consigna.</p>"), qs:[
      ["A 15-year-old with a student card visits on a Monday. How much do they pay?", "4 euros", [["Nothing","Free entry is for under-12s, or for everyone on Wednesday afternoons."],["8 euros","With a student card (<i>carné</i>) the price is 4 €."],["12 euros","12 is the age limit for free entry."]], "<i>Estudiantes con carné: 4 €</i>. Monday is not the free day.", "Read every condition: age, card and day."],
      ["When is entry free for everyone?", "Wednesday afternoons", [["Wednesday mornings","<i>Los miércoles por la tarde</i> = Wednesday afternoons."],["Every afternoon","Only on Wednesdays."],["Never","It is free <i>para todos</i> on Wednesday afternoons."]], "<i>Los miércoles por la tarde la entrada es gratuita para todos</i>.", "<i>Gratuito</i> = <i>gratis</i> = free."],
      ["What must visitors do with large backpacks?", "Leave them in the cloakroom", [["Carry them in their hands","They must be left in the <i>consigna</i>."],["Pay extra for them","No extra price is mentioned."],["Nothing: they are allowed","<i>Se dejan en la consigna</i> = they are left in the cloakroom."]], "<i>Las mochilas grandes se dejan en la consigna</i>.", "<i>La consigna</i> = cloakroom / bag storage."],
      ["What does the museum say about photos?", "Photos are allowed without flash", [["Photos are not allowed","<i>Se permite</i> = it is allowed."],["Photos cost 4 euros","No price is given for photos."],["Only flash photos are allowed","<i>Sin flash</i> = without flash."]], "<i>Se permite hacer fotos sin flash</i>.", "<i>Sin</i> = without; <i>con</i> = with."]]},
    { id:"families", lvl:3, html:box("<p>Queridas familias:<br>El jueves los estudiantes no tienen clase por la tarde porque los profesores asisten a una reunión. Las clases terminan a las 13:00 y el autobús escolar sale a las 13:15. Los estudiantes que comen en el comedor pueden quedarse hasta las 14:30.<br>Gracias. La dirección</p>"), qs:[
      ["Why is there no class on Thursday afternoon?", "The teachers have a meeting", [["It is a holiday","The reason is <i>los profesores asisten a una reunión</i>."],["The buses are not running","The bus leaves at 13:15."],["The cafeteria is closed","Students can eat in the cafeteria."]], "<i>Porque los profesores asisten a una reunión</i>.", "<i>Asistir a</i> = to attend (not “to assist”)."],
      ["Who can stay at school until 2:30?", "Students who eat in the cafeteria", [["All students","Only <i>los que comen en el comedor</i>."],["Students who take the bus","The bus leaves at 13:15."],["Teachers only","The sentence is about students."]], "<i>Los estudiantes que comen en el comedor pueden quedarse hasta las 14:30</i>.", "<i>Quedarse</i> = to stay."],
      ["When does the school bus leave on Thursday?", "At 1:15 p.m.", [["At 1:00 p.m.","Classes end at 13:00; the bus leaves at 13:15."],["At 2:30 p.m.","14:30 is the latest for cafeteria students."],["At 3:00 p.m.","13:15 is 1:15 p.m."]], "<i>El autobús escolar sale a las 13:15</i>.", "The 24-hour clock: 13:15 = 1:15 p.m."]]},
    { id:"tutor", lvl:3, html:box("<p><b>¿PROBLEMAS CON LAS MATEMÁTICAS?</b><br>Soy estudiante universitaria y doy clases particulares a estudiantes de 12 a 16 años. Preparo exámenes y ayudo con los deberes. Las clases son en la biblioteca del barrio, no en casa. Precio: 10 € la hora; la primera clase, de 30 minutos, es gratis. Llama por las tardes.</p>"), qs:[
      ["Where are the lessons?", "In the neighborhood library", [["At the student's home","<i>No en casa</i> = not at home."],["At the university","She is a university student, but lessons are <i>en la biblioteca del barrio</i>."],["Online","Online is not mentioned."]], "<i>Las clases son en la biblioteca del barrio, no en casa</i>.", "Watch for <i>no</i>: it can reverse the meaning."],
      ["What is free?", "The first 30-minute class", [["Every class for 12-year-olds","12 is the youngest age; it does not change the price."],["Homework help","Homework help costs the normal price."],["The first hour","The free class lasts 30 minutes."]], "<i>La primera clase, de 30 minutos, es gratis</i>.", "<i>Primero / primera</i> = first."],
      ["When should you call?", "In the afternoon", [["In the morning","<i>Por las tardes</i> = in the afternoons."],["At night","<i>Por las tardes</i> = in the afternoons."],["On weekends only","Weekends are not mentioned."]], "<i>Llama por las tardes</i>.", "<i>Por la tarde</i> = in the afternoon / early evening."]]},
    { id:"camp", lvl:3, html:box("<p><b>CAMPAMENTO DE VERANO EN LA SIERRA</b><br>Del 1 al 15 de julio. Para chicos y chicas de 11 a 15 años.<br>Actividades: senderismo, escalada, piragüismo y talleres de fotografía. Los participantes duermen en tiendas de campaña y cocinan en grupos. Es obligatorio saber nadar. Plazas limitadas: ¡inscríbete antes del 31 de mayo!</p>"), qs:[
      ["What is required to join the camp?", "Knowing how to swim", [["Owning a camera","Photography workshops are offered, but a camera is not required."],["Being 16 or older","The ages are 11 to 15."],["Knowing how to cook","They cook in groups, but this is not a requirement."]], "<i>Es obligatorio saber nadar</i> = knowing how to swim is required.", "<i>Obligatorio</i> = compulsory, required."],
      ["Where do participants sleep?", "In tents", [["In a hotel","<i>Tiendas de campaña</i> = tents."],["At home","They stay at the camp for two weeks."],["In stores","False friend: here <i>tiendas de campaña</i> means tents, not stores."]], "<i>Duermen en tiendas de campaña</i>.", "<i>Tienda</i> = store, but <i>tienda de campaña</i> = tent."],
      ["What does “plazas limitadas” tell you?", "Spaces are limited, so sign up early", [["The camp is in a small town square","Here <i>plazas</i> means places / spots."],["The camp is only for a few days","It runs July 1–15."],["The camp is free","Price is not mentioned."]], "<i>Plazas limitadas</i> = limited places, so register before May 31.", "<i>Plaza</i> can mean a town square or a place (spot) in a course."]]},
    { id:"busline", lvl:3, html:box("<p><b>AVISO A LOS VIAJEROS</b><br>Por obras en la calle Mayor, la línea 5 no para en la plaza del Mercado del 2 al 20 de noviembre. Los viajeros deben usar la parada provisional de la calle Prado, a 200 metros. Los horarios no cambian.</p>"), qs:[
      ["What changes for bus line 5?", "It does not stop at Plaza del Mercado", [["It does not run at all","Only one stop changes."],["It leaves at different times","<i>Los horarios no cambian</i> = the timetable doesn't change."],["It costs more","Price is not mentioned."]], "<i>La línea 5 no para en la plaza del Mercado</i>.", "<i>Parar</i> = to stop; <i>la parada</i> = the stop."],
      ["Why is this happening?", "There is construction on Calle Mayor", [["There is a market","<i>Plaza del Mercado</i> is just the name of the stop."],["There are not enough drivers","The reason is <i>por obras</i>."],["It is a holiday","The reason is <i>por obras</i>."]], "<i>Por obras en la calle Mayor</i> = because of roadworks on Calle Mayor.", "<i>Obras</i> = construction work."],
      ["What should passengers do?", "Use a temporary stop on Calle Prado", [["Walk to Calle Mayor","Calle Mayor has the roadworks."],["Take line 2","2 is a date (November 2)."],["Wait until November 2","The change starts on November 2."]], "<i>Deben usar la parada provisional de la calle Prado</i>.", "<i>Provisional</i> = temporary."]]},
    { id:"chat", lvl:3, html:box("<p><b>Mia:</b> ¿Estudiamos juntas mañana para el examen de historia?<br><b>Zoe:</b> Vale, pero por la mañana no puedo: trabajo en la tienda de mi tía hasta la una.<br><b>Mia:</b> Entonces, ¿a las cuatro en la biblioteca?<br><b>Zoe:</b> Perfecto. Yo llevo los apuntes y tú traes el libro.</p>"), qs:[
      ["Why can't Zoe meet in the morning?", "She works at her aunt's shop", [["She has a history test","The test is the reason they are studying."],["She goes to the library","They meet at the library at four."],["She is visiting her aunt at home","She works <i>en la tienda de mi tía</i>."]], "<i>Trabajo en la tienda de mi tía hasta la una</i>.", "<i>Tía</i> = aunt; <i>tienda</i> = shop."],
      ["What will Mia bring?", "The textbook", [["The notes","Zoe brings the notes (<i>yo llevo los apuntes</i>)."],["Snacks","Food is not mentioned."],["Her laptop","Only notes and the book are mentioned."]], "<i>Tú traes el libro</i>: Zoe says Mia brings the book.", "<i>Yo</i> and <i>tú</i> tell you who does what."],
      ["When and where will they meet?", "At four, at the library", [["At one, at the shop","Zoe works until one; they meet later."],["In the morning, at the library","Zoe can't in the morning."],["At four, at Zoe's house","The place is <i>la biblioteca</i>."]], "<i>¿A las cuatro en la biblioteca?</i> — <i>Perfecto.</i>", "<i>Entonces</i> = so / then."]]},
    { id:"lost", lvl:3, html:box("<p><b>OBJETOS PERDIDOS</b><br>En la secretaría hay muchos objetos perdidos: chaquetas, botellas de agua, un estuche azul y unas gafas. Si algo es tuyo, pasa a recogerlo antes del viernes 20. Después de esa fecha, la ropa se dona a una organización benéfica.</p>"), qs:[
      ["What happens after Friday the 20th?", "The clothes are given to charity", [["Everything is thrown away","Only clothes are mentioned, and they are donated."],["The office closes","Nothing says the office closes."],["The items are sold","<i>Se dona</i> = is donated."]], "<i>La ropa se dona a una organización benéfica</i>.", "<i>Donar</i> = to donate."],
      ["Where are the lost items?", "In the school office", [["In the classrooms","They are <i>en la secretaría</i>."],["In the gym","They are <i>en la secretaría</i>."],["At the charity","They go there only after the 20th."]], "<i>En la secretaría hay muchos objetos perdidos</i>.", "<i>La secretaría</i> = the (school) office."],
      ["Which item is mentioned?", "A blue pencil case", [["A red jacket","Jackets are mentioned, but no color."],["A blue backpack","<i>Estuche</i> = pencil case."],["A phone","Phones are not mentioned."]], "<i>Un estuche azul</i> = a blue pencil case.", "<i>El estuche</i> = pencil case; <i>la mochila</i> = backpack."]]},
    { id:"gym", lvl:3, html:box("<p><b>NUEVO HORARIO DEL GIMNASIO</b><br>A partir del lunes, el gimnasio abre a las 7:00 en vez de a las 8:00. Los fines de semana el horario no cambia. Los menores de 16 años solo pueden entrar acompañados de un adulto.</p>"), qs:[
      ["What changes from Monday?", "The gym opens an hour earlier", [["The gym opens an hour later","<i>A las 7:00 en vez de a las 8:00</i> = at 7 instead of 8: earlier."],["The weekend hours change","<i>Los fines de semana el horario no cambia</i>."],["The gym closes earlier","Only the opening time is mentioned."]], "<i>Abre a las 7:00 en vez de a las 8:00</i>.", "<i>En vez de</i> = instead of; <i>a partir de</i> = starting from."],
      ["Who needs an adult with them?", "People under 16", [["Everyone on weekends","The adult rule is about age, not days."],["People over 16","<i>Menores de 16</i> = under 16."],["Nobody","<i>Solo pueden entrar acompañados de un adulto</i>."]], "<i>Los menores de 16 años solo pueden entrar acompañados de un adulto</i>.", "<i>Acompañado de</i> = accompanied by."]]}
  ];

  /* ---------- topic ---------- */
  const T = {
    id:"spanish-present", code:"N", year:8, subject:"Spanish", name:"Present tense and everyday activities",
    blurb:"Regular -ar, -er and -ir verbs in the present, subject–verb agreement, daily-routine and frequency vocabulary, and reading short notices.",
    levels:Kit.LEVELS3, defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:30,
    skills:{
      regular:{ name:"Regular -ar, -er and -ir verbs", short:"Regular verbs", lesson:0 },
      choose:{ name:"Choosing the correct conjugation", short:"Choose the form", lesson:1 },
      agree:{ name:"Subject–verb agreement", short:"Agreement", lesson:2 },
      vocab:{ name:"Everyday-activity vocabulary", short:"Vocabulary", lesson:3 },
      complete:{ name:"Completing short sentences", short:"Complete the sentence", lesson:4 },
      notices:{ name:"Reading short notices and posters", short:"Notices", lesson:5 }
    },
    lessons:[
      { title:"Regular verbs", heading:"Three verb groups, one simple recipe", html:`
<p>Every Spanish verb in the dictionary ends in <b>-ar</b>, <b>-er</b> or <b>-ir</b>. This is the <b>infinitive</b> (<span class="es">hablar</span> = to speak). To use it with a subject, you <b>conjugate</b> it: drop the ending and add a new one that shows <i>who</i> does the action.</p>
<div class="rule"><span class="name">The recipe</span><div class="law">${es("habl<s>ar</s>")} → ${es("habl-")} → ${es("habl<b>amos</b>")}</div><p class="small">1. Find the group (-ar, -er or -ir). 2. Remove it to get the stem. 3. Add the ending for the subject.</p></div>
<h3>The endings</h3>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Subject</th><th>-ar: ${es("hablar")}</th><th>-er: ${es("comer")}</th><th>-ir: ${es("vivir")}</th></tr></thead><tbody>
<tr><td>yo</td><td>${es("habl<b>o</b>")}</td><td>${es("com<b>o</b>")}</td><td>${es("viv<b>o</b>")}</td></tr>
<tr><td>tú</td><td>${es("habl<b>as</b>")}</td><td>${es("com<b>es</b>")}</td><td>${es("viv<b>es</b>")}</td></tr>
<tr><td>él / ella / usted</td><td>${es("habl<b>a</b>")}</td><td>${es("com<b>e</b>")}</td><td>${es("viv<b>e</b>")}</td></tr>
<tr><td>nosotros / nosotras</td><td>${es("habl<b>amos</b>")}</td><td>${es("com<b>emos</b>")}</td><td>${es("viv<b>imos</b>")}</td></tr>
<tr><td>vosotros / vosotras</td><td>${es("habl<b>áis</b>")}</td><td>${es("com<b>éis</b>")}</td><td>${es("viv<b>ís</b>")}</td></tr>
<tr><td>ellos / ellas / ustedes</td><td>${es("habl<b>an</b>")}</td><td>${es("com<b>en</b>")}</td><td>${es("viv<b>en</b>")}</td></tr>
</tbody></table></div>
<div class="two">
<div><h3>Spot the pattern</h3><p class="small">-ar verbs keep an <b>a</b> in almost every ending. -er and -ir verbs share the <b>e</b> endings. They differ only for <b>nosotros</b> (-emos / -imos) and <b>vosotros</b> (-éis / -ís).</p></div>
<div><h3>Common regular verbs</h3><p class="small">-ar: ${es("estudiar, trabajar, escuchar, cocinar, nadar, llegar, desayunar, cenar")}<br>-er: ${es("comer, beber, leer, aprender, correr, vender, deber")}<br>-ir: ${es("vivir, escribir, abrir, recibir, compartir, asistir, subir")}</p></div>
</div>
<p><b>Worked example.</b> <span class="es">escribir</span>, nosotros → -ir verb → stem <span class="es">escrib-</span> → ending <b>-imos</b> → <span class="es">escribimos</span>.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Using the infinitive after a subject (<s>${es("yo hablar")}</s> → ${es("yo hablo")}).<br>Giving an -er verb an -ar ending (<s>${es("ella coma")}</s> → ${es("ella come")}).<br>Mixing -er and -ir for nosotros (<s>${es("vivemos")}</s> → ${es("vivimos")}).</p></div>` },
      { title:"Choosing the form", heading:"Find the subject first, then the ending", html:`
<p>In a sentence with a gap, two questions decide the verb form: <b>who</b> is the subject, and <b>which group</b> is the verb?</p>
<ol class="steps">
<li><div><div class="m">Find the subject: ${es("<b>Mis padres</b> ___ (trabajar) en un hospital.")}</div><p class="why">“My parents” = they → ellos form.</p></div></li>
<li><div><div class="m">Find the group: ${es("trabaj<b>ar</b>")}</div><p class="why">-ar verb, so the ellos ending is -an.</p></div></li>
<li><div><div class="m">${es("Mis padres <b>trabajan</b> en un hospital.")}</div><p class="why">Stem + ending. Check the whole sentence makes sense.</p></div></li>
</ol>
<div class="rule"><span class="name">Quick test</span><p class="small">Swap the subject for a pronoun in your head: <span class="es">la profesora</span> → ella, <span class="es">Leo y Mia</span> → ellos, <span class="es">mi hermana y yo</span> → nosotros.</p></div>
<h3>How wrong options are built</h3>
<div class="two">
<div><p class="small"><b>Wrong person:</b> ${es("trabajamos")} is a real word, but it means “we work”.</p></div>
<div><p class="small"><b>Wrong group:</b> ${es("comas")} looks like an -ar ending, but ${es("comer")} is an -er verb, so ${es("comes")}.</p></div>
</div>
<div class="warn"><span class="name">Trap</span><p class="small">The word next to the gap is not always the subject. In ${es("Los sábados <b>Ana</b> ___ (nadar)")}, the subject is Ana, not <i>los sábados</i>: ${es("Ana nada")}.</p></div>` },
      { title:"Agreement", heading:"The verb must agree with its subject", html:`
<p>Subject–verb agreement means the verb ending matches the person and number of the subject.</p>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Subject</th><th>Means</th><th>Ending (-ar / -er / -ir)</th></tr></thead><tbody>
<tr><td>${es("yo")}</td><td>I</td><td>-o / -o / -o</td></tr>
<tr><td>${es("tú")}</td><td>you (one friend)</td><td>-as / -es / -es</td></tr>
<tr><td>${es("él, ella, usted")}, one person or thing</td><td>he, she, you (formal)</td><td>-a / -e / -e</td></tr>
<tr><td>${es("nosotros, nosotras")}, “X y yo”</td><td>we</td><td>-amos / -emos / -imos</td></tr>
<tr><td>${es("vosotros, vosotras")}</td><td>you all (informal, Spain)</td><td>-áis / -éis / -ís</td></tr>
<tr><td>${es("ellos, ellas, ustedes")}, two or more</td><td>they, you all</td><td>-an / -en / -en</td></tr>
</tbody></table></div>
<div class="two">
<div class="rule"><span class="name">Usted and ustedes</span><p class="small">${es("Usted")} (polite you) uses the él form: ${es("¿Usted habla inglés?")}<br>${es("Ustedes")} (you all) uses the ellos form: ${es("Ustedes viven aquí.")}</p></div>
<div class="rule"><span class="name">“… y yo” = nosotros</span><p class="small">${es("Mi hermana y yo")} = we → ${es("comemos")}.<br>${es("Leo y Mia")} = they → ${es("comen")}.</p></div>
</div>
<div class="warn"><span class="name">Group words are singular</span><p class="small">${es("La gente")} (people), ${es("mi familia")}, ${es("el equipo")}, ${es("la clase")} and ${es("todo el mundo")} (everybody) take the <b>él / ella</b> form: ${es("La gente <b>baila</b> en la calle.")}</p></div>` },
      { title:"Everyday activities", heading:"Words for your day and how often you do things", html:`
<h3>Daily activities</h3>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Spanish</th><th>English</th><th>Spanish</th><th>English</th></tr></thead><tbody>
<tr><td>${es("desayunar")}</td><td>to have breakfast</td><td>${es("cenar")}</td><td>to have dinner</td></tr>
<tr><td>${es("ir al colegio")}</td><td>to go to school</td><td>${es("volver a casa")}</td><td>to go back home</td></tr>
<tr><td>${es("hacer los deberes")}</td><td>to do homework</td><td>${es("ver la tele")}</td><td>to watch TV</td></tr>
<tr><td>${es("lavarse los dientes")}</td><td>to brush your teeth</td><td>${es("acostarse")}</td><td>to go to bed</td></tr>
<tr><td>${es("pasear al perro")}</td><td>to walk the dog</td><td>${es("sacar la basura")}</td><td>to take out the trash</td></tr>
<tr><td>${es("poner la mesa")}</td><td>to set the table</td><td>${es("montar en bicicleta")}</td><td>to ride a bike</td></tr>
</tbody></table></div>
<p class="small muted">Some of these verbs are irregular (${es("ir, hacer, ver, poner, volver")}) or reflexive (${es("lavarse, acostarse")}). For now, learn them as phrases; you will meet their forms later.</p>
<h3>How often and when</h3>
<div class="two">
<div class="rule"><span class="name">Frequency, low to high</span><p class="small">${es("nunca")} (never) → ${es("casi nunca")} (hardly ever) → ${es("a veces")} (sometimes) → ${es("a menudo")} (often) → ${es("siempre")} (always)</p></div>
<div class="rule"><span class="name">Time expressions</span><p class="small">${es("por la mañana / tarde / noche")}, ${es("los fines de semana")}, ${es("los lunes")} (on Mondays), ${es("todos los días")}, ${es("una vez a la semana")}, ${es("después de clase")}</p></div>
</div>
<p><b>Example.</b> ${es("Los sábados siempre desayuno tarde.")} = On Saturdays I always have breakfast late.</p>
<div class="warn"><span class="name">Watch out</span><p class="small">${es("Tarde")} on its own means <b>late</b>; ${es("por la tarde")} means <b>in the afternoon</b>. ${es("Los lunes")} = every Monday; ${es("el lunes")} = on (this) Monday.</p></div>` },
      { title:"Completing sentences", heading:"Write the verb that fits the gap", html:`
<p>In a gap-fill you see the infinitive in brackets and type the conjugated form.</p>
<ol class="steps">
<li><div><div class="m">${es("Los fines de semana mis primos ___ (correr) en el parque.")}</div><p class="why">Subject: <i>mis primos</i> = ellos. Verb: -er.</p></div></li>
<li><div><div class="m">${es("corr- + en = corren")}</div><p class="why">Type only the verb: <b>corren</b>.</p></div></li>
</ol>
<div class="two">
<div class="rule"><span class="name">The subject can be missing</span><p class="small">Spanish often drops the pronoun because the ending already shows the person: ${es("(Nosotros) Vivimos en Lima.")} If a pronoun is given in brackets, use it.</p></div>
<div class="rule"><span class="name">Negatives</span><p class="small">Put ${es("no")} right before the verb: ${es("No bebo café.")} The ending does not change.</p></div>
</div>
<div class="rule"><span class="name">Where frequency words go</span><p class="small">${es("siempre, a veces, nunca")} usually go before the verb: ${es("Nunca cocino.")} Longer time phrases go at the start or the end: ${es("Leo nada <b>los martes</b>.")}</p></div>
<div class="warn"><span class="name">Accent check</span><p class="small">Vosotros endings carry an accent: ${es("habláis, coméis, vivís")}. Most other present-tense regular forms have no written accent: ${es("hablas")}, not <s>${es("hablás")}</s> in standard Spanish.</p></div>` },
      { title:"Reading notices", heading:"Read notices like a detective", html:`
<p>Short notices, posters and messages pack a lot of information into a few words. Do not translate every word: scan for what the question asks.</p>
<ol class="steps">
<li><div><div class="m">Read the question first.</div><p class="why">Know whether you need a day, a time, a price, a place or a rule.</p></div></li>
<li><div><div class="m">Scan for key words.</div><p class="why">Days, numbers, <i>gratis</i>, <i>prohibido</i>, <i>abierto / cerrado</i>.</p></div></li>
<li><div><div class="m">Check the small words.</div><p class="why"><i>no, sin, solo, antes de, después de, menores de</i> can flip the meaning.</p></div></li>
</ol>
<div class="quotebox" lang="es"><p><b>PISCINA MUNICIPAL</b><br>Abierta de martes a domingo, de 10:00 a 20:00. Lunes: cerrada.<br>Prohibido comer en el agua. Niños menores de 8 años, siempre con un adulto.</p></div>
<p class="small"><b>Example.</b> Can you swim on Monday? No: <span class="es">Lunes: cerrada</span>. Can a 10-year-old swim alone? Yes: the adult rule is only for under-8s.</p>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Notice word</th><th>Meaning</th><th>Notice word</th><th>Meaning</th></tr></thead><tbody>
<tr><td>${es("gratis / gratuito")}</td><td>free</td><td>${es("prohibido")}</td><td>forbidden</td></tr>
<tr><td>${es("abierto / cerrado")}</td><td>open / closed</td><td>${es("horario")}</td><td>opening hours, timetable</td></tr>
<tr><td>${es("la entrada")}</td><td>ticket, entrance</td><td>${es("se busca")}</td><td>wanted, looking for</td></tr>
<tr><td>${es("menores de")}</td><td>under (age)</td><td>${es("a partir de")}</td><td>starting from</td></tr>
</tbody></table></div>
<div class="warn"><span class="name">False friends</span><p class="small">${es("librería")} = bookstore (library = ${es("biblioteca")}); ${es("asistir")} = to attend; ${es("la carpeta")} = folder (carpet = ${es("alfombra")}); ${es("éxito")} = success (exit = ${es("salida")}).</p></div>` }
    ],
    introHtml:`<h2>Six ideas that win marks</h2><p class="muted">The present tense is the backbone of Spanish. Get these habits right and most sentences fall into place.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Group first</h3><p class="small">Check whether the verb is -ar, -er or -ir before you choose an ending.</p></div>
<div class="habit"><span class="hn">2</span><h3>Subject second</h3><p class="small">Turn the subject into a pronoun: <span class="es">mis padres</span> → ellos, <span class="es">Ana y yo</span> → nosotros.</p></div>
<div class="habit"><span class="hn">3</span><h3>Never leave the infinitive</h3><p class="small">After a subject, conjugate: <span class="es">yo estudio</span>, not <span class="es">yo estudiar</span>.</p></div>
<div class="habit"><span class="hn">4</span><h3>Nosotros: -emos or -imos</h3><p class="small">-er and -ir verbs only split here and for vosotros: <span class="es">comemos</span> but <span class="es">vivimos</span>.</p></div>
<div class="habit"><span class="hn">5</span><h3>Group words are singular</h3><p class="small"><span class="es">La gente, mi familia, el equipo</span> take the él / ella form.</p></div>
<div class="habit"><span class="hn">6</span><h3>Small words, big meaning</h3><p class="small">In notices, <span class="es">no, sin, solo, antes de</span> and <span class="es">menores de</span> change the answer.</p></div>
</div>`,
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };

  /* ---------- question makers ---------- */
  const proPick = p => pick(PRONS[p]);
  const typedAnswers = (inf, p) => [conj(inf, p), ...PRONS[p].map(x => x + " " + conj(inf, p))];

  function typedConj(ctx, groups, persons){
    let v, p;
    do { v = pickVerb(groups); p = pick(persons); } while (ctx.used.has("tc" + v[0] + p) && seededRandom() < 0.95);
    ctx.used.add("tc" + v[0] + p);
    const pr = proPick(p);
    return txt({ promptHtml:"Write the present tense of " + es(v[0]) + " (" + v[1] + ") for <b>" + pr + "</b>.",
      answers:typedAnswers(v[0], p), wrong:conjWrong(v[0], p),
      answerHtml:es(pr + " <b>" + conj(v[0], p) + "</b>"),
      workHtml:conjWork(v[0], p) + tableHtml(v[0]),
      key:"Infinitive minus -ar/-er/-ir, plus the ending for the subject.",
      hint:"Is it an -ar, -er or -ir verb? Which ending goes with " + pr + "?" });
  }
  function sentence(subj, inf, comp, filler){ return cap(subj) + " " + filler + " " + comp + "."; }

  function chooseQ(ctx, subjList, groups, trapMode){
    let s, v, comp;
    do { s = pick(subjList); v = pickVerb(groups); comp = pick(v[2]); } while (ctx.used.has("ch" + v[0] + s[0]) && seededRandom() < 0.95);
    if (trapMode) { while (!GROUPOK.includes(v[0])) v = pickVerb(); comp = pick(v[2]); }
    ctx.used.add("ch" + v[0] + s[0]);
    const p = s[1], right = conj(v[0], p);
    const { pri, rest } = conjOptions(v[0], p, s[2], s[3] ? "Trap: " + s[3] : null);
    return mc({ promptHtml:"Choose the verb form that completes the sentence.",
      exprHtml:'<div class="display">' + es(sentence(s[0], v[0], comp, BLANK)) + ' <span class="small muted">(' + v[0] + ")</span></div>",
      workHtml:"<p>" + subjLine(s[0], p) + (s[3] ? " " + s[3] : "") + "</p>" + conjWork(v[0], p) + "<p>" + es(sentence(s[0], v[0], comp, "<b>" + right + "</b>")) + "</p>",
      key:"Turn the subject into a pronoun, then add that pronoun's ending for the verb group.",
      hint:"Who is doing the action? Replace the subject with a pronoun." }, es(right), pri, rest);
  }

  function completeQ(ctx, subjList, groups, opts){
    opts = opts || {};
    let s, v, comp;
    do { s = pick(subjList); v = pickVerb(groups); comp = pick(v[2]); } while (ctx.used.has("co" + v[0] + s[0]) && seededRandom() < 0.95);
    if (opts.collective) { while (!GROUPOK.includes(v[0])) v = pickVerb(); comp = pick(v[2]); }
    ctx.used.add("co" + v[0] + s[0]);
    const p = s[1], right = conj(v[0], p);
    let pre = "", neg = opts.neg && seededRandom() < 0.5 ? "no " : "";
    const timeInComp = /(lunes|martes|miércoles|jueves|viernes|sábados|domingos|tarde|noche|mañana|semana|a las|después|temprano|verano)/.test(comp);
    const lead = opts.time && !timeInComp ? pick(["Los sábados, ", "Por la tarde, ", "Los fines de semana, ", "Después de clase, ", ""]) : "";
    if (opts.freq && !neg) pre = pick(["", "siempre ", "a veces ", "normalmente ", "nunca "]);
    const subjTxt = opts.drop ? "" : s[0];
    const body = (sj, verb) => {
      const core = (sj ? sj + " " : "") + neg + pre + verb + " " + comp + ".";
      return lead ? lead + core : cap(core);
    };
    const shownSubj = opts.drop ? "(" + s[0] + ") " : "";
    const wrong = conjWrong(v[0], p);
    if (s[2] != null && s[3]) wrong.unshift({ answers:[conj(v[0], s[2])], msg:s[3] });
    return txt({ promptHtml:"Type the correct present-tense form of the verb in brackets." + (opts.drop ? " The subject is given in brackets at the start." : ""),
      exprHtml:'<div class="display">' + es(shownSubj + body(subjTxt, BLANK + " (" + v[0] + ")")) + "</div>",
      answers:[right], wrong,
      answerHtml:es(right),
      workHtml:"<p>" + subjLine(s[0], p) + (s[3] ? " " + s[3] : "") + "</p>" + conjWork(v[0], p) +
        "<p>" + es((opts.drop ? "(" + s[0] + ") " : "") + body(subjTxt, "<b>" + right + "</b>")) + "</p>" + (neg ? "<p class=\"small\">" + es("No") + " goes before the verb and does not change the ending.</p>" : ""),
      key:"Find the subject, find the group, then type stem + ending.",
      hint:"Who does the action, and is " + es(v[0]) + " an -ar, -er or -ir verb?" });
  }

  function noticeQ(ctx, lvl){
    const n = Kit.unique(ctx, NOTICES.filter(x => x.lvl === lvl), x => x.id);
    const q = pick(n.qs);
    return mc({ promptHtml:"Read the notice. " + q[0], exprHtml:n.html,
      workHtml:"<p>" + q[3] + "</p>", key:q[4],
      hint:"Find the part of the notice that answers this question. Watch for small words like no, sin, solo." },
      q[1], q[2].map(w => ({ html:w[0], fb:w[1] })), []);
  }

  const P5 = [0, 1, 2, 3, 5];
  const POOL = [
    /* ===== Level 1 ===== */
    { id:"end-mc", skill:"regular", level:1, make(ctx){
      let g, p; do { g = pick(["ar","er","ir"]); p = pick(P5); } while (ctx.used.has("end" + g + p) && seededRandom() < 0.95);
      ctx.used.add("end" + g + p);
      const pri = [], rest = [];
      for (const h of ["ar","er","ir"]) if (h !== g) pri.push({ html:"-" + END[h][p], fb:"-" + END[h][p] + " is the " + PL[p] + " ending for <b>-" + h + "</b> verbs." });
      for (let q = 0; q < 6; q++) if (q !== p && q !== 4) rest.push({ html:"-" + END[g][q], fb:"-" + END[g][q] + " is the -" + g + " ending for " + PL[q] + "." });
      const ex = pick(byGroup(g))[0];
      return mc({ promptHtml:"Which ending goes on an <b>-" + g + "</b> verb for <b>" + PL[p] + "</b>?",
        workHtml:"<p>-" + g + " verbs take <b>-" + END[g][p] + "</b> for " + PL[p] + ". Example: " + es(ex) + " → " + es(conj(ex, p)) + ".</p>" +
          "<p class=\"small\">-ar: o, as, a, amos, áis, an · -er: o, es, e, emos, éis, en · -ir: o, es, e, imos, ís, en</p>",
        key:"-ar verbs use a in their endings; -er and -ir verbs use e (except -imos and -ís for -ir).",
        hint:"Say the forms of a model verb out loud: hablar, comer or vivir." }, "-" + END[g][p], pri, rest);
    }},
    { id:"type-ar", skill:"regular", level:1, make(ctx){ return typedConj(ctx, ["ar"], P5); } },
    { id:"form-mc", skill:"regular", level:1, make(ctx){
      let v, p; do { v = pickVerb(); p = pick(P5); } while (ctx.used.has("fm" + v[0] + p) && seededRandom() < 0.95);
      ctx.used.add("fm" + v[0] + p);
      const { pri, rest } = conjOptions(v[0], p);
      const pr = proPick(p);
      return mc({ promptHtml:"Which is the <b>" + pr + "</b> form of " + es(v[0]) + " (" + v[1] + ")?",
        workHtml:conjWork(v[0], p) + tableHtml(v[0]), key:"Each subject has its own ending; the infinitive is never used after a subject.",
        hint:"Drop -" + grp(v[0]) + " and add the " + pr + " ending." }, es(conj(v[0], p)), pri, rest);
    }},
    { id:"choose-pron", skill:"choose", level:1, make(ctx){ return chooseQ(ctx, PRON_SUBJ, null); } },
    { id:"agree-pron", skill:"agree", level:1, make(ctx){
      let v, p; do { v = pickVerb(); p = pick(P5); } while (ctx.used.has("ap" + v[0] + p) && seededRandom() < 0.95);
      ctx.used.add("ap" + v[0] + p);
      const f = conj(v[0], p);
      const label = q => ["yo", "tú", "él / ella / usted", "nosotros / nosotras", "vosotros / vosotras", "ellos / ellas / ustedes"][q];
      const rest = P5.filter(q => q !== p).map(q => ({ html:es(label(q)), fb:es(label(q)) + " would need " + es(conj(v[0], q)) + "." }));
      return mc({ promptHtml:"Which subject goes with the verb form " + es("<b>" + f + "</b>") + "?",
        workHtml:"<p>" + es(f) + " = " + es(stem(v[0])) + " + <b>-" + END[grp(v[0])][p] + "</b>, the " + PL[p] + " ending of an -" + grp(v[0]) + " verb (" + es(v[0]) + ", " + v[1] + ").</p>",
        key:"The ending tells you the subject: -o yo, -as/-es tú, -a/-e él, -amos/-emos/-imos nosotros, -an/-en ellos.",
        hint:"Look only at the ending. Which subject has that ending?" }, es(label(p)), rest, []);
    }},
    { id:"voc-es-en", skill:"vocab", level:1, make(ctx){
      const v = Kit.unique(ctx, VOC, x => x.es);
      const { pri, rest } = vocDistractors(v, "en");
      return mc({ promptHtml:"What does " + es("<b>" + v.es + "</b>") + " mean?",
        workHtml:"<p>" + es(v.es) + " = “" + v.en + "”." + vocNote(v) + "</p>",
        key:"Learn everyday activities as whole phrases, with their little words (al, la, los).",
        hint:"Look for a part of the phrase you already know." }, v.en, pri, rest);
    }},
    { id:"time-order", skill:"vocab", level:1, make(ctx){
      const sets = [
        { items:["por la mañana", "al mediodía", "por la tarde", "por la noche"], en:"morning → noon → afternoon → night", axis:["earliest","latest"], prompt:"Put these parts of the day in order, from earliest to latest." },
        { items:["desayunar", "almorzar", "merendar", "cenar"], en:"breakfast → lunch → afternoon snack → dinner", axis:["first meal","last meal"], prompt:"Put these meals in the order you eat them in a day." },
        { items:["el lunes", "el miércoles", "el viernes", "el domingo"], en:"Monday → Wednesday → Friday → Sunday", axis:["first","last"], prompt:"Put these days in order, starting from the beginning of the week." },
        { items:["el martes", "el jueves", "el sábado", "el domingo"], en:"Tuesday → Thursday → Saturday → Sunday", axis:["first","last"], prompt:"Put these days in order, starting from the beginning of the week." },
        { items:["desayunar", "ir al colegio", "volver a casa", "cenar"], en:"have breakfast → go to school → go back home → have dinner", axis:["first","last"], prompt:"Put these activities in the order of a normal school day." },
        { items:["a las siete de la mañana", "al mediodía", "a las cinco de la tarde", "a las diez de la noche"], en:"7 a.m. → noon → 5 p.m. → 10 p.m.", axis:["earliest","latest"], prompt:"Put these times in order, from earliest to latest in the day." }];
      const s = Kit.unique(ctx, sets, x => x.items[0] + x.items[2]);
      return Kit.order({ promptHtml:s.prompt, inOrder:s.items, axis:s.axis,
        workHtml:"<p>" + s.items.map(es).join(" → ") + "</p><p>" + s.en + "</p>",
        key:"Time words help you describe your routine in order.",
        hint:"Translate each one first, then put them on a timeline." });
    }},
    { id:"complete-1", skill:"complete", level:1, make(ctx){ return completeQ(ctx, PRON_SUBJ, ["ar"]); } },
    { id:"notice-1", skill:"notices", level:1, make(ctx){ return noticeQ(ctx, 1); } },

    /* ===== Level 2 ===== */
    { id:"type-all", skill:"regular", level:2, make(ctx){ return typedConj(ctx, ["ar","er","er","ir","ir"], P5); } },
    { id:"identify", skill:"regular", level:2, make(ctx){
      let v, p; do { v = pickVerb(["er","ir"]); p = pick(P5); } while (ctx.used.has("id" + v[0] + p) && seededRandom() < 0.95);
      ctx.used.add("id" + v[0] + p);
      const f = conj(v[0], p), g = grp(v[0]), other = g === "er" ? stem(v[0]) + "ir" : stem(v[0]) + "er";
      const lab = (inf, q) => es(inf) + ", " + PL[q];
      const pri = [{ html:lab(other, p), fb:"There is no verb " + es(other) + " here: " + es(v[0]) + " is the real infinitive (" + v[1] + ")." }];
      const rest = P5.filter(q => q !== p).map(q => ({ html:lab(v[0], q), fb:"The " + PL[q] + " form of " + es(v[0]) + " is " + es(conj(v[0], q)) + "." }));
      return mc({ promptHtml:"The form " + es("<b>" + f + "</b>") + " comes from which infinitive, and which subject?",
        workHtml:"<p>" + es(f) + " = " + es(stem(v[0])) + " + -" + END[g][p] + ". The infinitive is " + es(v[0]) + " (" + v[1] + "), and -" + END[g][p] + " is its " + PL[p] + " ending.</p>",
        key:"Split the form into stem + ending: the stem gives the verb, the ending gives the subject.",
        hint:"Cover the ending. What is left is the stem." }, lab(v[0], p), pri, rest);
    }},
    { id:"choose-named", skill:"choose", level:2, make(ctx){ return chooseQ(ctx, NAMED_SUBJ, null); } },
    { id:"agree-subj", skill:"agree", level:2, make(ctx){
      let v, comp, s; do { v = pickVerb(); comp = pick(v[2]); s = pick(NAMED_SUBJ.concat(PRON_SUBJ)); } while (ctx.used.has("as" + v[0] + s[1]) && seededRandom() < 0.95);
      ctx.used.add("as" + v[0] + s[1]);
      const p = s[1], f = conj(v[0], p);
      const pool = NAMED_SUBJ.concat(PRON_SUBJ).filter(x => x[1] !== p);
      const rest = sh(pool).map(x => ({ html:es(cap(x[0])), fb:es(cap(x[0])) + " is " + personWord(x[1]) + ", so it needs " + es(conj(v[0], x[1])) + "." }));
      return mc({ promptHtml:"Which subject fits the sentence?",
        exprHtml:'<div class="display">' + es(BLANK + " " + f + " " + comp + ".") + "</div>",
        workHtml:"<p>" + es(f) + " has the " + PL[p] + " ending (-" + END[grp(v[0])][p] + "), so the subject must be " + personWord(p) + ": " + es(cap(s[0])) + ".</p>",
        key:"Read the verb ending first; it tells you which subject is possible.",
        hint:"What person does the ending -" + END[grp(v[0])][p] + " show?" }, es(cap(s[0])), [], rest);
    }},
    { id:"agree-error", skill:"agree", level:2, make(ctx){
      const used = new Set(), sents = [];
      const all = NAMED_SUBJ.concat(PRON_SUBJ);
      while (sents.length < 4) {
        const s = pick(all), v = pickVerb();
        if (used.has(v[0]) || sents.some(x => x.s[1] === s[1] && seededRandom() < 0.7)) continue;
        used.add(v[0]); sents.push({ s, v, comp:pick(v[2]) });
      }
      const bad = ri(0, 3), b = sents[bad];
      const wp = pick(P5.filter(q => q !== b.s[1]));
      const opts = sents.map((x, i) => {
        const f = i === bad ? conj(x.v[0], wp) : conj(x.v[0], x.s[1]);
        return { html:es(cap(x.s[0]) + " " + f + " " + x.comp + "."), fb:i === bad ? "" : "This sentence is correct: " + es(x.s[0]) + " (" + personWord(x.s[1]) + ") takes " + es(f) + "." };
      });
      return mc({ promptHtml:Kit.unique(ctx, ["Which sentence has a subject–verb agreement mistake?", "One sentence uses the wrong verb ending for its subject. Which one?", "Find the sentence where the verb does <b>not</b> agree with the subject.", "Three sentences are correct. Which one has a mistake?"]),
        workHtml:"<p>In the wrong sentence " + es(b.s[0]) + " is " + personWord(b.s[1]) + ", but " + es(conj(b.v[0], wp)) + " is the " + PL[wp] + " form. Correct: " + es(cap(b.s[0]) + " <b>" + conj(b.v[0], b.s[1]) + "</b> " + b.comp + ".") + "</p>",
        key:"Check each sentence: subject → pronoun → expected ending.",
        hint:"For each sentence, turn the subject into a pronoun and check the ending." }, opts[bad].html, opts.filter((_, i) => i !== bad), []);
    }},
    { id:"voc-en-es", skill:"vocab", level:2, make(ctx){
      const v = Kit.unique(ctx, VOC, x => x.es);
      const { pri, rest } = vocDistractors(v, "es");
      return mc({ promptHtml:"Which is the Spanish for “<b>" + v.en + "</b>”?",
        workHtml:"<p>“" + v.en + "” = " + es(v.es) + "." + vocNote(v) + "</p>",
        key:"Learn everyday activities as whole phrases, with their little words (al, la, los).",
        hint:"Think of a sentence about your own day that uses this idea." }, es(v.es), pri, rest);
    }},
    { id:"voc-type-w", skill:"vocab", level:2, make(ctx){
      const v = Kit.unique(ctx, VOC.filter(x => x.typ === 2), x => x.es);
      const answers = [v.es, ...v.alt]; if (v.cat === "p") for (const a of [v.es, ...v.alt]) if (noArt(a) !== a) answers.push(noArt(a));
      return txt({ promptHtml:"Type the Spanish for “<b>" + v.en + "</b>”.", answers, wrong:vocWrongTyped(v),
        answerHtml:es(v.es), workHtml:"<p>“" + v.en + "” = " + es(v.es) + (v.alt.length ? " (also: " + v.alt.map(es).join(", ") + ")" : "") + "." + vocNote(v) + "</p>",
        key:"Spelling counts: write the word with its accents.", hint:"It starts with “" + v.es.charAt(0) + "”." });
    }},
    { id:"freq-order", skill:"vocab", level:2, make(ctx){
      let idx; do { idx = sh([0,1,2,3,4,5]).slice(0, 4).sort((a, b) => a - b); } while (ctx.used.has("fo" + idx.join()) && seededRandom() < 0.95);
      ctx.used.add("fo" + idx.join());
      const items = idx.map(i => FREQ_SCALE[i]);
      return Kit.order({ promptHtml:"Put these frequency words in order, from <b>least often</b> to <b>most often</b>.", inOrder:items, axis:["least often","most often"],
        workHtml:"<p>" + items.map(w => es(w) + " (" + FREQ_EN[w] + ")").join(" → ") + "</p>",
        key:"nunca → casi nunca → a veces → a menudo → casi siempre → siempre.",
        hint:"Translate each word, then picture a scale from 0% to 100%." });
    }},
    { id:"complete-2", skill:"complete", level:2, make(ctx){ return completeQ(ctx, NAMED_SUBJ, ["ar","er","ir"], { freq:true, time:true }); } },
    { id:"complete-drop", skill:"complete", level:2, make(ctx){ return completeQ(ctx, PRON_SUBJ, ["ar","er","ir"], { drop:true, neg:true }); } },
    { id:"notice-2", skill:"notices", level:2, make(ctx){ return noticeQ(ctx, 2); } },

    /* ===== Level 3 ===== */
    { id:"type-vos", skill:"regular", level:3, make(ctx){
      const mode = ri(0, 2);
      if (mode === 0) return typedConj(ctx, ["ar","er","ir"], [4]);
      if (mode === 1) return typedConj(ctx, ["er","ir"], [3, 4]);
      return typedConj(ctx, ["ar","er","ir"], [0,1,2,3,4,5]);
    }},
    { id:"identify-vos", skill:"regular", level:3, make(ctx){
      let v, p; do { v = pickVerb(["er","ir","ar"]); p = pick([3, 4, 4, 2, 5]); } while (ctx.used.has("iv" + v[0] + p) && seededRandom() < 0.95);
      ctx.used.add("iv" + v[0] + p);
      const f = conj(v[0], p);
      const opts = [0,1,2,3,4,5].filter(q => q !== p).map(q => ({ html:PL[q], fb:"The " + PL[q] + " form would be " + es(conj(v[0], q)) + "." }));
      return mc({ promptHtml:"Who is the subject of " + es("<b>" + f + "</b>") + " (from " + es(v[0]) + ")?",
        workHtml:"<p>-" + END[grp(v[0])][p] + " is the " + PL[p] + " ending for -" + grp(v[0]) + " verbs, so " + es(f) + " goes with " + PL[p] + ".</p>" + tableHtml(v[0]),
        key:"vosotros: -áis, -éis, -ís (with an accent); nosotros: -amos, -emos, -imos.",
        hint:"Compare the ending with the -" + grp(v[0]) + " table." }, PL[p], opts.filter(o => /vosotros|nosotros/.test(o.html) || seededRandom() < 0.5), opts);
    }},
    { id:"choose-tricky", skill:"choose", level:3, make(ctx){ return chooseQ(ctx, TRICKY, null, true); } },
    { id:"agree-only", skill:"agree", level:3, make(ctx){
      const subs = sh(TRICKY).slice(0, 4), good = ri(0, 3);
      const usedV = new Set();
      const opts = subs.map((s, i) => {
        let v; do { v = pick(VERBS.filter(x => GROUPOK.includes(x[0]))); } while (usedV.has(v[0])); usedV.add(v[0]);
        const comp = pick(v[2]);
        const f = i === good ? conj(v[0], s[1]) : conj(v[0], s[2]);
        return { html:es(cap(s[0]) + " " + f + " " + comp + "."), fb:i === good ? "" : "Mistake: " + s[3] + " Correct: " + es(cap(s[0]) + " " + conj(v[0], s[1]) + " " + comp + "."), s, v, comp };
      });
      const c = opts[good];
      return mc({ promptHtml:Kit.unique(ctx, ["Only <b>one</b> of these sentences is correct. Which one?", "Three of these sentences have an agreement mistake. Which sentence is <b>correct</b>?", "Which sentence has a verb that agrees with its subject?", "Pick the sentence with <b>no</b> agreement mistake."]),
        workHtml:"<p>" + es(c.s[0]) + " → " + personWord(c.s[1]) + ". " + c.s[3] + "</p><p>The others all use the ending of the wrong subject.</p>",
        key:"Group nouns are singular; “X y yo” is nosotros; usted is él form, ustedes is ellos form.",
        hint:"Replace each subject with a pronoun before you look at the verb." }, c.html, opts.filter((_, i) => i !== good), []);
    }},
    { id:"agree-fix", skill:"agree", level:3, make(ctx){
      let s, v; do { s = pick(TRICKY); v = pick(VERBS.filter(x => GROUPOK.includes(x[0]))); } while (ctx.used.has("af" + s[0] + v[0]) && seededRandom() < 0.95);
      ctx.used.add("af" + s[0] + v[0]);
      const comp = pick(v[2]), wrongF = conj(v[0], s[2]), right = conj(v[0], s[1]);
      const wrong = conjWrong(v[0], s[1]); wrong.unshift({ answers:[wrongF], msg:"That is the verb from the sentence; it is the one with the mistake." });
      return txt({ promptHtml:"This sentence has an agreement mistake. Type the <b>correct verb</b>.",
        exprHtml:'<div class="display">' + es(cap(s[0]) + " <u>" + wrongF + "</u> " + comp + ".") + "</div>",
        answers:[right], wrong, answerHtml:es(right),
        workHtml:"<p>" + s[3] + "</p><p>" + es(cap(s[0]) + " <b>" + right + "</b> " + comp + ".") + "</p>",
        key:"Decide the subject's person first; the verb ending must match it.",
        hint:"Which pronoun could replace " + es(s[0]) + "?" });
    }},
    { id:"voc-type-p", skill:"vocab", level:3, make(ctx){
      const v = Kit.unique(ctx, VOC.filter(x => x.typ === 3), x => x.es);
      const answers = [v.es, ...v.alt]; if (v.cat === "p") for (const a of [v.es, ...v.alt]) if (noArt(a) !== a) answers.push(noArt(a));
      return txt({ promptHtml:"Type the Spanish phrase for “<b>" + v.en + "</b>”.", answers, wrong:vocWrongTyped(v),
        answerHtml:es(v.es), workHtml:"<p>“" + v.en + "” = " + es(v.es) + (v.alt.length ? " (also accepted: " + v.alt.map(es).join(", ") + ")" : "") + "." + vocNote(v) + "</p>",
        key:"Learn phrases with their small words: al, a la, por la, los.", hint:"It has " + v.es.split(" ").length + " words and starts with “" + v.es.split(" ")[0] + "”." });
    }},
    { id:"voc-context", skill:"vocab", level:3, make(ctx){
      const c = Kit.unique(ctx, CONTEXT, x => x[0]);
      const enOf = w => { const f = VOC.find(x => x.es.toLowerCase() === w.toLowerCase()); return f ? f.en : ({ "dos veces al día":"twice a day", "una vez al mes":"once a month", "a medianoche":"at midnight", "dos veces al año":"twice a year", "cada semana":"every week", "por la mañana temprano":"early in the morning", "de madrugada":"in the early hours", "muy temprano":"very early", "antes de desayunar":"before breakfast", "después de cenar":"after dinner" })[w.toLowerCase()] || ""; };
      const fb = w => es(w) + (enOf(w) ? " means “" + enOf(w) + "”, which does not fit the clue." : " does not fit the clue.");
      return mc({ promptHtml:"Choose the expression that best completes the sentence.",
        exprHtml:'<div class="display">' + es(c[0]) + "</div>",
        workHtml:"<p>" + c[3] + "</p><p>" + es(c[0].replace(BLANK, "<b>" + c[1] + "</b>")) + "</p>",
        key:"Use the clue in the rest of the sentence to choose the time or frequency word.",
        hint:"Find the clue: a reason, a day, a time or a feeling." }, es(c[1]), c[2].map(w => ({ html:es(w), fb:fb(w) })), []);
    }},
    { id:"complete-3", skill:"complete", level:3, make(ctx){ return completeQ(ctx, TRICKY, ["ar","er","ir"], { collective:true, time:true }); } },
    { id:"notice-3", skill:"notices", level:3, make(ctx){ return noticeQ(ctx, 3); } }
  ];
  registerTopic(T);
})();

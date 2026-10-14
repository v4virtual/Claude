/* ===== Topic: Year 10 Spanish, Adolescence and daily life ===== */
(() => {
  /* ---------- shared helpers ---------- */
  const es = s => '<span class="es">' + s + "</span>";
  const cap = s => s.replace(/^((?:<[^>]+>)*)(.)/, (m, t, c) => t + c.toUpperCase());
  const plain = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const sh = a => shuffle(a.slice());
  const BLANK = "<b>_____</b>";
  function txt(o){
    const ok = new Set(o.answers.map(plain)), seen = new Set();
    const wrong = (o.wrong || []).map(w => ({ msg:w.msg, answers:w.answers.filter(a => {
      if (!a) return false;
      const k = plain(a); if (ok.has(k) || seen.has(k)) return false; seen.add(k); return true;
    }) })).filter(w => w.answers.length);
    return Kit.text(Object.assign({ accentKeys:true }, o, { wrong }));
  }
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
  const vary = (ctx, list) => Kit.unique(ctx, list);

  /* ---------- reflexive verbs ---------- */
  const PL = ["yo", "tú", "él / ella / usted", "nosotros", "vosotros", "ellos / ellas / ustedes"];
  const PRONS = [["yo"], ["tú"], ["él", "ella", "usted"], ["nosotros", "nosotras"], ["vosotros", "vosotras"], ["ellos", "ellas", "ustedes"]];
  const RP = ["me", "te", "se", "nos", "os", "se"];
  const END = { ar:["o", "as", "a", "amos", "áis", "an"], er:["o", "es", "e", "emos", "éis", "en"], ir:["o", "es", "e", "imos", "ís", "en"] };
  const BOOT = [0, 1, 2, 5];
  const CH = { ie:["e", "ie"], ue:["o", "ue"], i:["e", "i"] };
  const swapLast = (s, from, to) => { const k = s.lastIndexOf(from); return k < 0 ? s : s.slice(0, k) + to + s.slice(k + from.length); };
  /* [infinitive, English base, English 3rd person, stem change, complements [[es, en]], no-drop flag (sentence still makes sense without se)] */
  const REFL = [
    ["levantarse", "get up", "gets up", null, [["a las siete", "at seven"], ["temprano", "early"], ["tarde los domingos", "late on Sundays"]]],
    ["ducharse", "take a shower", "takes a shower", null, [["por la mañana", "in the morning"], ["después de entrenar", "after training"], ["con agua fría", "with cold water"]]],
    ["lavarse", "wash", "washes", null, [["la cara", "{pos} face"], ["las manos antes de comer", "{pos} hands before eating"], ["el pelo", "{pos} hair"]], true],
    ["peinarse", "comb {pos} hair", "combs {pos} hair", null, [["delante del espejo", "in front of the mirror"], ["antes de salir", "before going out"], ["muy rápido", "very quickly"]], true],
    ["vestirse", "get dressed", "gets dressed", "i", [["en cinco minutos", "in five minutes"], ["antes de desayunar", "before having breakfast"], ["muy rápido", "very quickly"]], true],
    ["acostarse", "go to bed", "goes to bed", "ue", [["a las once", "at eleven"], ["muy tarde", "very late"], ["temprano entre semana", "early on weekdays"]]],
    ["despertarse", "wake up", "wakes up", "ie", [["a las seis y media", "at six thirty"], ["con el despertador", "with the alarm clock"], ["muy temprano", "very early"]], true],
    ["divertirse", "have fun", "has fun", "ie", [["en las fiestas", "at parties"], ["con los amigos", "with friends"], ["en clase de teatro", "in drama class"]], true],
    ["aburrirse", "get bored", "gets bored", null, [["en clase de historia", "in history class"], ["los domingos", "on Sundays"], ["sin internet", "without the internet"]], true],
    ["enfadarse", "get angry", "gets angry", null, [["por nada", "over nothing"], ["cuando pierde el equipo", "when the team loses"], ["con facilidad", "easily"]]],
    ["preocuparse", "worry", "worries", null, [["por los exámenes", "about exams"], ["por el futuro", "about the future"], ["por la salud", "about health"]]],
    ["quejarse", "complain", "complains", null, [["de los deberes", "about homework"], ["del horario", "about the schedule"], ["de la comida del comedor", "about the cafeteria food"]]],
    ["relajarse", "relax", "relaxes", null, [["con música", "with music"], ["los fines de semana", "on weekends"], ["en el sofá", "on the sofa"]]],
    ["sentirse", "feel", "feels", "ie", [["bien", "fine"], ["mal", "bad"], ["mejor después de dormir", "better after sleeping"]]],
    ["llevarse", "get along", "gets along", null, [["bien con los vecinos", "well with the neighbors"], ["mal con el profesor de física", "badly with the physics teacher"], ["bien con todo el mundo", "well with everyone"]]],
    ["dormirse", "fall asleep", "falls asleep", "ue", [["en el sofá", "on the sofa"], ["enseguida", "right away"], ["con la tele puesta", "with the TV on"]], true],
    ["maquillarse", "put on makeup", "puts on makeup", null, [["para las fiestas", "for parties"], ["en el baño", "in the bathroom"]], true],
    ["afeitarse", "shave", "shaves", null, [["por la mañana", "in the morning"], ["cada dos días", "every other day"]], true],
    ["arreglarse", "get ready", "gets ready", null, [["para salir", "to go out"], ["para la fiesta", "for the party"]]],
    ["estresarse", "get stressed", "gets stressed", null, [["antes de los exámenes", "before exams"], ["con tantos deberes", "with so much homework"]], true],
    ["concentrarse", "concentrate", "concentrates", null, [["en la biblioteca", "in the library"], ["mejor por la mañana", "better in the morning"]]],
    ["cansarse", "get tired", "gets tired", null, [["muy rápido", "very quickly"], ["al subir la escalera", "going up the stairs"]], true],
    ["cepillarse", "brush", "brushes", null, [["los dientes", "{pos} teeth"], ["el pelo", "{pos} hair"]], true]
  ];
  const RV = Object.fromEntries(REFL.map(r => [r[0], r]));
  const base = inf => inf.slice(0, -2);              // levantar
  const grp = inf => base(inf).slice(-2);           // ar
  const stem = inf => base(inf).slice(0, -2);       // levant
  const changed = inf => { const c = RV[inf] && RV[inf][3]; return c ? swapLast(stem(inf), CH[c][0], CH[c][1]) : stem(inf); };
  const vform = (inf, p) => (BOOT.includes(p) ? changed(inf) : stem(inf)) + END[grp(inf)][p];
  const rform = (inf, p) => RP[p] + " " + vform(inf, p);
  const chName = c => c === "ie" ? "e → ie" : c === "ue" ? "o → ue" : "e → i";
  const tableR = inf => '<div class="tblwrap"><table class="tbl"><tbody>' +
    [0,1,2,3,4,5].map(p => "<tr><td>" + PL[p] + "</td><td>" + es("<b>" + RP[p] + "</b> " + vform(inf, p)) + "</td></tr>").join("") + "</tbody></table></div>";
  const workR = (inf, p) => {
    const c = RV[inf][3];
    let s = "<p>Pronoun for " + PL[p] + ": <b>" + RP[p] + "</b>. " + es(base(inf)) + " is an -" + grp(inf) + " verb, so the ending is <b>-" + END[grp(inf)][p] + "</b>.";
    if (c) s += BOOT.includes(p) ? " It is a stem-changing verb (" + chName(c) + "), and " + PL[p] + " is inside the “boot”, so the stem changes: " + es(changed(inf) + "-") + "."
                                 : " It is a stem-changing verb (" + chName(c) + "), but " + PL[p] + " is outside the “boot”, so the stem stays " + es(stem(inf) + "-") + ".";
    return s + " Answer: " + es(rform(inf, p)) + ".</p>";
  };
  function reflWrong(inf, p){
    const c = RV[inf][3], f = vform(inf, p), w = [];
    w.push({ answers:[f], msg:"Reflexive verbs need their pronoun: <b>" + RP[p] + "</b> " + f + "." });
    w.push({ answers:[inf, RP[p] + " " + base(inf), base(inf) + RP[p]], msg:"That is still the infinitive. Conjugate it: " + RP[p] + " + " + f + "." });
    for (let q = 0; q < 6; q++) if (RP[q] !== RP[p]) w.push({ answers:[RP[q] + " " + f], msg:"The pronoun must match the subject: " + PL[p] + " → <b>" + RP[p] + "</b>, not " + RP[q] + "." });
    if (c) {
      if (BOOT.includes(p)) w.push({ answers:[RP[p] + " " + stem(inf) + END[grp(inf)][p]], msg:es(base(inf)) + " is a stem-changing verb (" + chName(c) + "): the " + PL[p] + " form changes the stem to " + es(changed(inf) + "-") + "." });
      else w.push({ answers:[RP[p] + " " + changed(inf) + END[grp(inf)][p]], msg:"No stem change for " + PL[p] + ": the stem stays " + es(stem(inf) + "-") + ". Only yo, tú, él and ellos change." });
      if (c === "i") w.push({ answers:[RP[p] + " " + swapLast(stem(inf), "e", "ie") + END[grp(inf)][p]], msg:es(base(inf)) + " changes e → i, not e → ie." });
      if (c === "ie" && grp(inf) === "ir") w.push({ answers:[RP[p] + " " + swapLast(stem(inf), "e", "i") + END[grp(inf)][p]], msg:es(base(inf)) + " changes e → ie in the present, not e → i." });
    }
    if (grp(inf) === "ir" && (p === 3 || p === 4)) w.push({ answers:[RP[p] + " " + stem(inf) + END.er[p]], msg:"-ir verbs take -" + END.ir[p] + " here, not the -er ending -" + END.er[p] + "." });
    for (let q = 0; q < 6; q++) if (q !== p && rform(inf, q) !== rform(inf, p)) w.push({ answers:[rform(inf, q)], msg:es(rform(inf, q)) + " is the " + PL[q] + " form." });
    return w;
  }
  const typedR = (inf, p) => [rform(inf, p), ...PRONS[p].map(x => x + " " + rform(inf, p))];

  /* Subjects for sentences: [Spanish, person, English, possessive] */
  const SUBJ = [["yo",0,"I","my"],["tú",1,"You","your"],["mi hermano",2,"My brother","his"],["Ana",2,"Ana","her"],["la profesora",2,"The teacher","her"],
    ["Leo",2,"Leo","his"],["nosotros",3,"We","our"],["mi hermana y yo",3,"My sister and I","our"],["mis padres",5,"My parents","their"],
    ["mis amigos",5,"My friends","their"],["Zoe y Mia",5,"Zoe and Mia","their"],["ustedes",5,"You all","your"],["usted",2,"You","your"]];
  const SUBJ_VOS = [["vosotros",4,"You all","your"],["vosotras",4,"You all","your"]];
  const pWord = p => ["yo", "tú", "él / ella", "nosotros", "vosotros", "ellos / ellas"][p];
  const subjLine = (s, p) => PRONS[p].includes(s.toLowerCase()) ? "Subject: " + es(s) + "." : "Subject: " + es(s) + " → <b>" + pWord(p) + "</b>.";
  const enVerb = (r, s) => { const third = s[1] === 2 && s[2] !== "You"; return (third ? r[2] : r[1]); };
  const enSentence = (r, s, comp) => (s[2] + " " + enVerb(r, s) + " " + comp[1]).replace(/\{pos\}/g, s[3]) + ".";

  /* Leading verbs for reflexive infinitives: tener que / ir a / querer / necesitar */
  const LEADS = [
    { forms:["tengo que","tienes que","tiene que","tenemos que","tenéis que","tienen que"], en:"have to" },
    { forms:["voy a","vas a","va a","vamos a","vais a","van a"], en:"am / are / is going to" },
    { forms:["quiero","quieres","quiere","queremos","queréis","quieren"], en:"want to" },
    { forms:["necesito","necesitas","necesita","necesitamos","necesitáis","necesitan"], en:"need to" }];

  /* ---------- ponerse ---------- */
  const PON = ["me pongo", "te pones", "se pone", "nos ponemos", "os ponéis", "se ponen"];
  /* [Spanish subject, cue name (yo / tú) or "", person, gender, number, English] */
  const PSUBJ = [["yo","Mia",0,"f","s","I (Mia)"],["yo","Leo",0,"m","s","I (Leo)"],["tú","Zoe",1,"f","s","You (Zoe)"],["tú","Sam",1,"m","s","You (Sam)"],
    ["Ana","",2,"f","s","Ana"],["mi hermano","",2,"m","s","My brother"],["la profesora","",2,"f","s","The teacher"],["mi padre","",2,"m","s","My father"],
    ["Ravi","",2,"m","s","Ravi"],["mis amigas","",5,"f","p","My friends"],["mis hermanos","",5,"m","p","My brothers"],["Ana y Leo","",5,"m","p","Ana and Leo"],
    ["Zoe y Mia","",5,"f","p","Zoe and Mia"],["nosotras","",3,"f","p","We"],["nosotros","",3,"m","p","We"],["mis padres","",5,"m","p","My parents"],
    ["las chicas","",5,"f","p","The girls"],["mis primas","",5,"f","p","My cousins"]];
  const PSUBJ_VOS = [["vosotras","",4,"f","p","You all"],["vosotros","",4,"m","p","You all"]];
  /* [adjective (masc. sing.), English, situations [[es, en]]] */
  const ADJ = [
    ["nervioso", "nervous", [["antes de los exámenes", "before exams"], ["en las entrevistas", "in interviews"], ["antes de un partido importante", "before an important game"]]],
    ["rojo", "red (to blush)", [["en las presentaciones orales", "in oral presentations"], ["con los cumplidos", "with compliments"]]],
    ["triste", "sad", [["al final de las vacaciones", "at the end of vacation"], ["con las películas románticas", "with romantic movies"]]],
    ["contento", "happy", [["con las buenas notas", "with good grades"], ["cuando llegan las vacaciones", "when vacation comes"]]],
    ["furioso", "furious", [["cuando pierde el equipo", "when the team loses"], ["con las injusticias", "with injustice"]]],
    ["celoso", "jealous", [["con facilidad", "easily"]]],
    ["pálido", "pale", [["al ver sangre", "when seeing blood"]]],
    ["serio", "serious", [["en los momentos importantes", "at important moments"]]],
    ["enfermo", "sick", [["a menudo en invierno", "often in winter"]]],
    ["alegre", "cheerful", [["cuando sale el sol", "when the sun comes out"]]],
    ["feliz", "happy", [["con los regalos", "with presents"], ["en verano", "in summer"]]]
  ];
  const agreeAdj = (a, g, n) => {
    if (a === "feliz") return n === "p" ? "felices" : "feliz";
    if (/o$/.test(a)) return a.slice(0, -1) + (g === "f" ? "a" : "o") + (n === "p" ? "s" : "");
    return a + (n === "p" ? "s" : "");
  };
  const adjForms = a => a === "feliz" ? ["feliz", "felices"] : /o$/.test(a) ? ["o","a","os","as"].map(e => a.slice(0, -1) + e) : [a, a + "s"];
  const CLOTHES = [["el uniforme","the uniform"],["la chaqueta","the jacket"],["una gorra","a cap"],["el abrigo","the coat"],["las gafas de sol","sunglasses"],
    ["el pijama","pajamas"],["la sudadera","the sweatshirt"],["un vestido","a dress"],["la camiseta del equipo","the team shirt"],["las zapatillas de deporte","sneakers"],["la bufanda","the scarf"]];
  const showSubj = s => s[1] ? cap(s[0]) + ' <span class="small muted">(' + s[1] + ")</span>" : cap(s[0]);
  const ESTAR = ["estoy","estás","está","estamos","estáis","están"], SER = ["soy","eres","es","somos","sois","son"];

  /* ---------- vocabulary bank ---------- */
  /* [Spanish, English, category n/v/a, typed 0/2/3, other accepted answers, clash] */
  const VOC = [
    ["la adolescencia","adolescence","n",2],["el adolescente","the teenager","n",2,["la adolescente"]],["el estrés","stress","n",2],
    ["la presión de grupo","peer pressure","n",3],["las redes sociales","social media","n",3],["la autoestima","self-esteem","n",2],
    ["los cambios","changes","n",2],["la independencia","independence","n",2,null,"free"],["el horario","the schedule","n",2],
    ["la paga","the allowance (pocket money)","n",2],["la pubertad","puberty","n",2],["el aspecto físico","physical appearance","n",3],
    ["los granos","pimples","n",2],["la amistad","friendship","n",2],["el mejor amigo","best friend","n",3,["la mejor amiga"]],
    ["los celos","jealousy","n",2],["la libertad","freedom","n",2,null,"free"],["la responsabilidad","responsibility","n",2],
    ["las normas","rules","n",2,["las reglas"]],["el castigo","punishment","n",2],["el permiso","permission","n",2],
    ["la hora de llegada","curfew (the time you must be home)","n",3,["la hora de volver"]],["el móvil","the cell phone","n",2,["el celular","el teléfono móvil"]],
    ["la pantalla","the screen","n",2],["el acoso escolar","bullying","n",3],["el ciberacoso","cyberbullying","n",2],["la ansiedad","anxiety","n",2],
    ["la salud mental","mental health","n",3],["las notas","grades","n",2,["las calificaciones"]],["el consejo","advice","n",2],
    ["el apoyo","support","n",2],["la moda","fashion","n",2],["la identidad","identity","n",2],["los compañeros de clase","classmates","n",3],
    ["el trabajo a tiempo parcial","part-time job","n",3,["el trabajo de media jornada"]],["la brecha generacional","the generation gap","n",3],
    ["la intimidad","privacy","n",2,["la privacidad"]],["el respeto","respect","n",2],["la pandilla","group of friends","n",2,["el grupo de amigos"]],
    ["la etapa","stage (of life)","n",2],
    ["discutir con los padres","to argue with your parents","v",3,["discutir con mis padres"]],["llevarse bien con","to get along well with","v",3],
    ["llevarse mal con","to get along badly with","v",3],["tener confianza en","to have confidence in","v",3,["confiar en"],"trust"],["confiar en","to trust","v",0,null,"trust"],
    ["salir con amigos","to go out with friends","v",3],["crecer","to grow (up)","v",2],["madurar","to mature","v",2],["enamorarse","to fall in love","v",2],
    ["castigar","to punish","v",2],["volver tarde a casa","to come home late","v",3,["volver a casa tarde","llegar tarde a casa"]],
    ["engancharse a","to get hooked on","v",3],["apoyar","to support","v",2],["pedir consejo","to ask for advice","v",3],
    ["desahogarse","to let off steam","v",2],["encajar","to fit in","v",2],["ganar dinero","to earn money","v",3],["ahorrar","to save (money)","v",2],
    ["gastar","to spend (money)","v",2],["tener en común","to have in common","v",3],["hacer amigos","to make friends","v",3],
    ["independizarse","to become independent (leave home)","v",2],["echar de menos","to miss (someone)","v",3,["extrañar"]],
    ["compartir","to share","v",2],["respetar","to respect","v",2],["aprobar","to pass (an exam)","v",2],["suspender","to fail (an exam)","v",2,["reprobar"]],
    ["estresarse","to get stressed","v",2],["dormir lo suficiente","to get enough sleep","v",3],["burlarse de","to make fun of","v",3],
    ["estresado","stressed","a",2],["agobiado","overwhelmed","a",2],["tímido","shy","a",2],["inseguro","insecure","a",2],["maduro","mature","a",2],
    ["rebelde","rebellious","a",2],["comprensivo","understanding","a",2],["estricto","strict","a",2],["celoso","jealous","a",2],
    ["enfadado","angry","a",2,["enojado"]],["cansado","tired","a",2],["preocupado","worried","a",2]
  ].map(r => ({ es:r[0], en:r[1], cat:r[2], typ:r[3], alt:r[4] || [], clash:r[5] || "" }));
  const noArt = s => s.replace(/^(el|la|los|las) /, "");
  function vocAnswers(v){
    const a = [v.es, ...v.alt];
    if (v.cat === "n") for (const x of [v.es, ...v.alt]) a.push(noArt(x));
    if (v.cat === "a" && /o$/.test(v.es)) a.push(v.es.slice(0, -1) + "a");
    return [...new Set(a)];
  }
  function vocDistractors(v, lang){
    const okd = d => d !== v && d.en !== v.en && (!v.clash || d.clash !== v.clash);
    const f = d => ({ html:lang === "en" ? d.en : es(d.es), fb:"<i>" + d.es + "</i> means “" + d.en + "”." });
    return { pri:sh(VOC.filter(d => okd(d) && d.cat === v.cat)).slice(0, 3).map(f), rest:sh(VOC.filter(d => okd(d) && d.cat !== v.cat)).slice(0, 2).map(f) };
  }
  const VOC_NOTE = { "llevarse bien con":"Reflexive: <i>me llevo bien con mi hermana</i>.", "llevarse mal con":"Reflexive: <i>me llevo mal con mi vecino</i>.",
    "echar de menos":"<i>Echo de menos a mis amigos</i> = I miss my friends.", "discutir con los padres":"<i>Discutir</i> = to argue (it can also mean to discuss).",
    "la paga":"From <i>pagar</i> (to pay).", "suspender":"In Spain <i>suspender</i> = to fail; in much of Latin America <i>reprobar</i>.",
    "la intimidad":"False friend: <i>intimidad</i> here means privacy.", "el consejo":"<i>Un consejo</i> = a piece of advice; <i>consejos</i> = advice (several tips).",
    "desahogarse":"Reflexive: <i>me desahogo hablando con mi abuela</i>.", "la hora de llegada":"Literally “the arrival time”.",
    "la pandilla":"Informal: your group or gang of friends.", "confiar en":"<i>Confío en ti</i> = I trust you." };
  const vocNote = v => VOC_NOTE[v.es] ? " " + VOC_NOTE[v.es] : "";
  /* Vocabulary in context: [sentence, answer, distractors, explanation] */
  const VCTX = [
    ["Mis padres me dan diez euros de " + BLANK + " cada semana.", "paga", ["autoestima","presión de grupo","pantalla"], "Money from your parents each week is <i>la paga</i> (allowance)."],
    ["Paso demasiadas horas en las " + BLANK + ": Instagram, TikTok y YouTube.", "redes sociales", ["normas","notas","etapas"], "Instagram and TikTok are <i>redes sociales</i> (social media)."],
    ["Mis amigos quieren que fume, pero yo no quiero. Es la " + BLANK + ".", "presión de grupo", ["autoestima","paga","intimidad"], "Friends pushing you to do something is <i>la presión de grupo</i> (peer pressure)."],
    ["Tengo la " + BLANK + " muy baja: no me gusta mi aspecto y me siento inseguro.", "autoestima", ["amistad","independencia","pantalla"], "Not liking how you look is low <i>autoestima</i> (self-esteem)."],
    ["Mi hermano siempre lee mis mensajes. ¡No respeta mi " + BLANK + "!", "intimidad", ["horario","castigo","moda"], "Reading someone's messages invades their <i>intimidad</i> (privacy)."],
    ["Mañana tengo tres exámenes y estoy muy " + BLANK + ".", "agobiado", ["rebelde","maduro","comprensivo"], "Three exams tomorrow make you <i>agobiado</i> (overwhelmed)."],
    ["Mis padres nunca me escuchan; no son nada " + BLANK + ".", "comprensivos", ["rebeldes","tímidos","celosos"], "Parents who never listen are not <i>comprensivos</i> (understanding)."],
    ["Cuando estoy triste, hablo con mi abuela para " + BLANK + ".", "desahogarme", ["independizarme","aburrirme","castigarme"], "Talking to someone when you are sad helps you <i>desahogarte</i> (let off steam)."],
    ["Si saco malas notas, mis padres me " + BLANK + " sin móvil.", "castigan", ["apoyan","ahorran","aprueban"], "Taking away your phone after bad grades is a punishment: <i>me castigan</i>."],
    ["Saqué un 3 en el examen de física: ¡he " + BLANK + "!", "suspendido", ["aprobado","ahorrado","crecido"], "A 3 out of 10 is a fail: <i>he suspendido</i> (I failed)."],
    ["Mi mejor amiga y yo tenemos mucho en " + BLANK + ": nos gusta la misma música.", "común", ["confianza","moda","apoyo"], "<i>Tener mucho en común</i> = to have a lot in common."],
    ["Los fines de semana tengo que volver a casa a las diez: es mi " + BLANK + ".", "hora de llegada", ["horario escolar","pandilla","brecha generacional"], "The time you must be home is your <i>hora de llegada</i> (curfew)."],
    ["Mis padres y yo no entendemos las mismas cosas: es la " + BLANK + ".", "brecha generacional", ["presión de grupo","salud mental","pubertad"], "Different generations not understanding each other = <i>la brecha generacional</i>."],
    ["Ahorro parte de mi paga porque quiero comprar un " + BLANK + " nuevo.", "móvil", ["estrés","castigo","consejo"], "You save money to buy something: <i>un móvil nuevo</i>."]
  ];

  /* ---------- reading texts ---------- */
  const box = s => '<div class="quotebox" lang="es"><p>' + s + "</p></div>";
  /* { id, lvl, html, qs:[[question, correct, [[wrong, fb]...], explanation]] } */
  const TEXTS = [
    { id:"lucia", lvl:1, html:box("<b>El blog de Lucía</b><br>Hola, soy Lucía y tengo quince años. Entre semana me levanto a las siete menos cuarto y me ducho rápidamente. Después del colegio hago los deberes y, si tengo tiempo, salgo a correr con mi perro. Los fines de semana me relajo: me acuesto tarde y quedo con mis amigas. Lo que más me agobia es el horario del colegio: ¡empezamos a las ocho!"), qs:[
      ["What does Lucía find most stressful?", "The school timetable, which starts at eight", [["Running with her dog","Running is something she does when she has time; it is not described as stressful."],["Meeting her friends","That is part of how she relaxes on weekends."],["Going to bed late","She does that on weekends to relax."]], "<i>Lo que más me agobia es el horario del colegio</i> = what overwhelms me most is the school timetable."],
      ["When does Lucía get up on weekdays?", "At 6:45", [["At 7:15","<i>Menos cuarto</i> = quarter to, so 6:45."],["At 8:00","8:00 is when school starts."],["At 7:00","<i>Las siete menos cuarto</i> is a quarter before seven."]], "<i>Me levanto a las siete menos cuarto</i> = I get up at a quarter to seven."],
      ["What does she do after school if she has time?", "She goes running with her dog", [["She meets her friends","She meets friends on weekends."],["She takes a shower","She showers in the morning."],["She goes to bed","She goes to bed late on weekends."]], "<i>Si tengo tiempo, salgo a correr con mi perro</i>."]]},
    { id:"leo", lvl:1, html:box("<b>Mi peor día</b><br>Los lunes son mi peor día. Me despierto a las seis y media porque tengo entrenamiento de natación antes de clase. Me ducho en el polideportivo, me visto rápido y desayuno en el autobús. Por la tarde estoy tan cansado que a veces me duermo en el sofá antes de cenar."), qs:[
      ["Why does Leo wake up at 6:30 on Mondays?", "He has swimming practice before school", [["He has a test","No test is mentioned."],["The bus leaves at 6:30","6:30 is when he wakes up."],["He likes getting up early","He calls Monday his worst day."]], "<i>Tengo entrenamiento de natación antes de clase</i>."],
      ["Where does Leo eat breakfast?", "On the bus", [["At home","<i>Desayuno en el autobús</i>."],["At the sports center","He showers there; he eats on the bus."],["At school","<i>En el autobús</i> = on the bus."]], "<i>Desayuno en el autobús</i> = I have breakfast on the bus."],
      ["¿Qué le pasa a Leo a veces por la tarde?", "Se duerme en el sofá antes de cenar.", [["Se ducha en el polideportivo.","Eso lo hace por la mañana."],["Se despierta a las seis y media.","Eso es por la mañana."],["Va a entrenar.","El entrenamiento es antes de clase."]], "<i>A veces me duermo en el sofá antes de cenar</i>."]]},
    { id:"mia", lvl:1, html:box("<b>Mi propio dinero</b><br>No recibo paga, así que los sábados trabajo en la panadería de mi barrio. Gano cuarenta euros al día. Ahorro la mitad para un viaje con mis amigas en verano y gasto el resto en ropa y en el cine. Me gusta tener mi propio dinero porque me siento más independiente."), qs:[
      ["Why does Mia work on Saturdays?", "She doesn't get an allowance", [["She wants to become a baker","No future job is mentioned."],["Her friends work there","Her friends are only mentioned for the trip."],["She has to pay for school","School costs are not mentioned."]], "<i>No recibo paga, así que…</i> = I don't get an allowance, so…"],
      ["What does Mia do with half of her money?", "She saves it for a summer trip", [["She spends it on clothes","She spends <i>the rest</i> (el resto) on clothes and movies."],["She gives it to her parents","Her parents are not mentioned."],["She buys bread","She works in a bakery; she doesn't say she buys bread."]], "<i>Ahorro la mitad para un viaje con mis amigas en verano</i>."],
      ["How does earning money make her feel?", "More independent", [["More tired","Tiredness is not mentioned."],["Stressed","She says she likes it."],["Bored","She says she likes it."]], "<i>Me siento más independiente</i>."]]},
    { id:"ravi", lvl:1, html:box("<b>Más independencia</b><br>Este año mis padres me dejan ir solo al colegio en metro. Al principio estaba nervioso, pero ahora me encanta. Escucho música, leo o hablo con mis compañeros. Mis padres solo me piden una cosa: que les mande un mensaje cuando llego."), qs:[
      ["What new freedom does Ravi have this year?", "He goes to school alone by subway", [["He has his own phone","A phone is implied but not the new freedom."],["He can go out at night","Nights are not mentioned."],["He gets an allowance","Money is not mentioned."]], "<i>Mis padres me dejan ir solo al colegio en metro</i>."],
      ["How did Ravi feel at first?", "Nervous", [["Excited","<i>Estaba nervioso</i> = I was nervous."],["Bored","<i>Nervioso</i> = nervous."],["Angry","<i>Nervioso</i> = nervous."]], "<i>Al principio estaba nervioso, pero ahora me encanta</i>."],
      ["What do his parents ask him to do?", "Send them a message when he arrives", [["Call them every hour","They ask for one message on arrival."],["Read on the subway","Reading is something he chooses to do."],["Travel with classmates","He travels alone."]], "<i>Que les mande un mensaje cuando llego</i>."]]},
    { id:"day", lvl:1, html:box("<b>Entrevista</b><br>—¿Cómo es un día normal para ti?<br>—Bastante ocupado. Voy al instituto de ocho a tres, como en casa y luego tengo clases de guitarra dos veces a la semana. Por la noche chateo un rato con mis amigos, pero intento acostarme antes de las once."), qs:[
      ["How often does the student have guitar lessons?", "Twice a week", [["Every day","<i>Dos veces a la semana</i> = twice a week."],["Once a week","<i>Dos veces</i> = two times."],["On weekends","No days are given, only twice a week."]], "<i>Tengo clases de guitarra dos veces a la semana</i>."],
      ["Where does the student have lunch?", "At home", [["At school","<i>Como en casa</i> = I eat at home."],["At a friend's house","<i>En casa</i> = at home."],["At guitar class","<i>Como en casa</i>."]], "<i>Voy al instituto de ocho a tres, como en casa…</i>"],
      ["What does the student try to do?", "Go to bed before eleven", [["Chat with friends until eleven","They chat for a while, but try to go to bed before eleven."],["Get up before eleven","<i>Acostarme</i> = to go to bed."],["Study until eleven","Studying at night is not mentioned."]], "<i>Intento acostarme antes de las once</i>."]]},
    { id:"talk", lvl:1, html:box("<b>Noticias del colegio</b><br>Esta semana, la psicóloga del colegio da una charla sobre la autoestima para los estudiantes de cuarto. La charla es el miércoles a las once en el salón de actos. Después, los estudiantes pueden hacer preguntas de forma anónima. La asistencia es obligatoria."), qs:[
      ["What is the talk about?", "Self-esteem", [["Social media","The topic is <i>la autoestima</i>."],["Exams","The topic is <i>la autoestima</i>."],["Sleep","The topic is <i>la autoestima</i>."]], "<i>Una charla sobre la autoestima</i>."],
      ["How can students ask questions?", "Anonymously", [["By email to the psychologist","<i>De forma anónima</i> = anonymously."],["Only before the talk","They ask <i>después</i> (afterward)."],["They can't ask questions","They can, anonymously."]], "<i>Los estudiantes pueden hacer preguntas de forma anónima</i>."],
      ["Is the talk optional?", "No, attendance is required", [["Yes, it is optional","<i>Obligatoria</i> = compulsory."],["Only for students with problems","It is for all <i>estudiantes de cuarto</i>."],["Only on Wednesday afternoon","It is at eleven, and compulsory."]], "<i>La asistencia es obligatoria</i>."]]},
    { id:"phones", lvl:1, html:box("<b>Nueva norma</b><br>A partir de septiembre, los estudiantes no pueden usar el móvil durante el horario escolar. Los móviles deben estar apagados y dentro de la mochila. Si un profesor ve un móvil, lo guarda hasta el final del día. En caso de emergencia, las familias pueden llamar a la secretaría."), qs:[
      ["What is the new rule?", "No phones during school hours", [["Phones only at lunch","No exceptions are given during school hours."],["Phones must be left at home","They can be in the backpack, switched off."],["Phones must be on silent","They must be <i>apagados</i> (off)."]], "<i>Los estudiantes no pueden usar el móvil durante el horario escolar</i>."],
      ["What happens if a teacher sees a phone?", "The teacher keeps it until the end of the day", [["The student gets detention","No detention is mentioned."],["The teacher calls the family","Families call the office in emergencies."],["The teacher keeps it for a week","<i>Hasta el final del día</i> = until the end of the day."]], "<i>Lo guarda hasta el final del día</i>."],
      ["How can families contact students in an emergency?", "By calling the school office", [["By texting the student","Phones are off during school."],["By emailing the teacher","The notice says <i>llamar a la secretaría</i>."],["They can't","They can call the office."]], "<i>Las familias pueden llamar a la secretaría</i>."]]},
    { id:"diego", lvl:2, html:box("<b>Foro: ¿Alguien más?</b><br>Últimamente me siento muy estresado. Tengo exámenes casi todas las semanas y mis padres quieren que saque buenas notas. Por la noche me cuesta dormir porque pienso en todo lo que tengo que hacer. ¿Alguien tiene algún consejo? — Diego, 16 años"), qs:[
      ["Why does Diego write this post?", "To ask for advice about stress", [["To give advice to others","He asks: <i>¿Alguien tiene algún consejo?</i>"],["To complain about his friends","Friends are not mentioned."],["To share his good grades","He worries about grades; he doesn't share any."]], "He ends with a question asking for advice."],
      ["What happens to Diego at night?", "He finds it hard to sleep", [["He studies until late","He thinks about his tasks; he doesn't say he studies."],["He sleeps very well","<i>Me cuesta dormir</i> = I find it hard to sleep."],["He argues with his parents","No argument is mentioned."]], "<i>Me cuesta dormir</i>: <i>costar</i> here means to be hard."],
      ["What do Diego's parents want?", "For him to get good grades", [["For him to sleep more","Sleep is his problem, not their request."],["For him to have fewer exams","They can't control exams."],["For him to quit sports","Sports are not mentioned."]], "<i>Mis padres quieren que saque buenas notas</i>."]]},
    { id:"marta", lvl:2, html:box("<b>Consultorio: Marta responde</b><br>Querido Diego: Es normal sentirse así antes de los exámenes. Primero, organiza tu tiempo con un horario realista. Segundo, haz deporte: ayuda a reducir el estrés. Y, por último, habla con tus padres; seguro que prefieren verte tranquilo. Un abrazo, Marta."), qs:[
      ["What is Marta's first suggestion?", "Make a realistic schedule", [["Do sports","That is her second suggestion."],["Talk to his parents","That is her last suggestion."],["Study less","She does not say to study less."]], "<i>Primero, organiza tu tiempo con un horario realista</i>."],
      ["According to Marta, why should Diego do sports?", "It helps reduce stress", [["It helps him get better grades","She says it reduces stress."],["His parents want him to","His parents are mentioned in another tip."],["It helps him make friends","Friends are not mentioned."]], "<i>Haz deporte: ayuda a reducir el estrés</i>."],
      ["What does Marta think of Diego's feelings?", "They are normal before exams", [["They are a serious illness","<i>Es normal sentirse así</i>."],["He is exaggerating","She says they are normal."],["He should ignore them","She gives him ways to deal with them."]], "<i>Es normal sentirse así antes de los exámenes</i>."]]},
    { id:"survey1", lvl:2, html:box("<b>Encuesta: los jóvenes y el móvil</b><br>Hemos preguntado a 200 estudiantes de 14 a 16 años. El 70 % usa el móvil más de tres horas al día. Más de la mitad se acuesta después de medianoche entre semana. Solo el 15 % deja el móvil fuera de la habitación por la noche."), qs:[
      ["What percentage of students use their phone for more than three hours a day?", "70%", [["15%","15% leave the phone outside the bedroom."],["50%","<i>Más de la mitad</i> refers to going to bed after midnight."],["3%","3 is the number of hours."]], "<i>El 70 % usa el móvil más de tres horas al día</i>."],
      ["What do more than half of the students do?", "Go to bed after midnight on weekdays", [["Leave their phone outside the bedroom","Only 15% do that."],["Use their phone less than three hours","70% use it more than three hours."],["Get up before seven","Getting up is not mentioned."]], "<i>Más de la mitad se acuesta después de medianoche entre semana</i>."],
      ["What does only 15% do?", "Leave the phone outside the bedroom at night", [["Use the phone in bed","That is the opposite."],["Go to bed before midnight","The 15% is about the phone."],["Answer the survey","200 students answered."]], "<i>Solo el 15 % deja el móvil fuera de la habitación</i>."]]},
    { id:"ana", lvl:2, html:box("<b>Mi familia y yo</b><br>Me llevo bastante bien con mi madre: hablamos de todo y confío en ella. Con mi padre es diferente. Él es muy estricto y no me deja salir entre semana. A veces discutimos, pero luego hacemos las paces. Creo que poco a poco me va a dar más independencia."), qs:[
      ["Who does Ana talk to about everything?", "Her mother", [["Her father","Her father is <i>diferente</i>: strict."],["Her friends","Friends are not mentioned."],["Nobody","<i>Hablamos de todo</i> refers to her mother."]], "<i>Me llevo bastante bien con mi madre: hablamos de todo</i>."],
      ["What is Ana's father like?", "Very strict", [["Very understanding","<i>Estricto</i> = strict."],["Shy","<i>Estricto</i> = strict."],["Always absent","Nothing says he is absent."]], "<i>Él es muy estricto y no me deja salir entre semana</i>."],
      ["¿Qué pasa después de una discusión con su padre?", "Hacen las paces.", [["No se hablan durante días.","El texto dice <i>luego hacemos las paces</i>."],["Ana sale con sus amigos.","Él no la deja salir entre semana."],["Su padre le da más independencia.","Ana cree que eso va a pasar poco a poco, no después de cada discusión."]], "<i>Hacer las paces</i> = to make up."]]},
    { id:"sam", lvl:2, html:box("<b>Foro: la ropa de marca</b><br>En mi clase hay un grupo que siempre se burla de los que no llevan ropa de marca. Yo no tengo mucho dinero y a veces me siento mal. Mis amigos dicen que no es importante, pero me cuesta no pensar en eso. ¿Qué puedo hacer para no preocuparme tanto? — Sam"), qs:[
      ["What does the group in Sam's class make fun of?", "Students who don't wear brand-name clothes", [["Students who get bad grades","Grades are not mentioned."],["Students who don't have phones","Phones are not mentioned."],["Students who play sports","Sports are not mentioned."]], "<i>Se burla de los que no llevan ropa de marca</i>."],
      ["What do Sam's friends say?", "It is not important", [["Sam should buy new clothes","They say <i>no es importante</i>."],["Sam should tell a teacher","Teachers are not mentioned."],["Sam should join the group","They say it is not important."]], "<i>Mis amigos dicen que no es importante</i>."],
      ["What does Sam want to know?", "How to stop worrying so much", [["How to earn money","He mentions money, but he asks about worrying."],["Where to buy cheap clothes","He asks <i>qué puedo hacer para no preocuparme tanto</i>."],["How to make new friends","He already has friends."]], "<i>¿Qué puedo hacer para no preocuparme tanto?</i>"]]},
    { id:"sleep", lvl:2, html:box("<b>Los adolescentes y el sueño</b><br>Los expertos dicen que los adolescentes necesitan dormir entre ocho y diez horas. Sin embargo, muchos jóvenes duermen menos de siete. Una razón es el uso de pantallas antes de acostarse: la luz del móvil hace más difícil dormirse. Por eso, los médicos recomiendan apagar el móvil una hora antes de ir a la cama."), qs:[
      ["How much sleep do teenagers need, according to experts?", "Between eight and ten hours", [["Less than seven hours","That is how much many teens actually sleep."],["Exactly seven hours","Experts say eight to ten."],["One hour more than adults","No comparison with adults is made."]], "<i>Necesitan dormir entre ocho y diez horas</i>."],
      ["Why is it harder to fall asleep after using a phone?", "Because of the light from the screen", [["Because of the noise","The text mentions light."],["Because of stressful messages","The text mentions light."],["Because phones are expensive","Cost is not mentioned."]], "<i>La luz del móvil hace más difícil dormirse</i>."],
      ["What do doctors recommend?", "Turning off the phone an hour before bed", [["Sleeping with the phone off but nearby","They only mention switching it off an hour before bed."],["Using the phone for one hour a day","The hour is before bed."],["Going to bed at ten","No bedtime is given."]], "<i>Recomiendan apagar el móvil una hora antes de ir a la cama</i>."]]},
    { id:"survey2", lvl:2, html:box("<b>¿Qué nos preocupa?</b><br>En una encuesta de nuestro instituto, los estudiantes de 15 años dicen que sus mayores preocupaciones son los exámenes (45 %), su aspecto físico (25 %) y las relaciones con los amigos (20 %). Solo un 10 % menciona el dinero. Curiosamente, las chicas se preocupan más por los exámenes que los chicos."), qs:[
      ["What is the students' biggest worry?", "Exams", [["Physical appearance","That is second, with 25%."],["Friendships","That is third, with 20%."],["Money","Only 10% mention money."]], "<i>Los exámenes (45 %)</i>."],
      ["What percentage mention money?", "10%", [["20%","20% is relationships with friends."],["25%","25% is physical appearance."],["45%","45% is exams."]], "<i>Solo un 10 % menciona el dinero</i>."],
      ["Who worries more about exams?", "Girls", [["Boys","<i>Las chicas se preocupan más … que los chicos</i>."],["Both equally","The text says girls worry more."],["Teachers","Only students were surveyed."]], "<i>Las chicas se preocupan más por los exámenes que los chicos</i>."]]},
    { id:"survey3", lvl:2, html:box("<b>Resultados: ¿Cómo te llevas con tu familia?</b><br>El 60 % de los estudiantes dice que se lleva bien con sus padres. El 30 % discute a menudo, sobre todo por los deberes y la hora de volver a casa. El 10 % prefiere no contestar."), qs:[
      ["What percentage of students get along well with their parents?", "60%", [["30%","30% argue often."],["10%","10% preferred not to answer."],["90%","Only 60% say they get along well."]], "<i>El 60 % … se lleva bien con sus padres</i>."],
      ["What do families mainly argue about?", "Homework and what time to be home", [["Money and clothes","The text says <i>los deberes y la hora de volver a casa</i>."],["Phones and social media","Not mentioned here."],["Friends and parties","Not mentioned here."]], "<i>Sobre todo por los deberes y la hora de volver a casa</i>."],
      ["What did 10% of students do?", "They preferred not to answer", [["They argue every day","30% argue often."],["They live alone","Not mentioned."],["They get along badly with everyone","<i>Prefiere no contestar</i> = prefers not to answer."]], "<i>El 10 % prefiere no contestar</i>."]]},
    { id:"cyber", lvl:3, html:box("<b>Foro anónimo</b><br>Desde hace un mes, alguien publica comentarios crueles sobre mí en las redes sociales. No sé quién es. Me da vergüenza contárselo a mis padres. Cada vez que miro el móvil, me pongo nervioso y no puedo concentrarme en clase."), qs:[
      ["What has been happening for a month?", "Someone posts cruel comments about the writer online", [["The writer posts cruel comments","<i>Alguien publica comentarios … sobre mí</i>: someone else posts them."],["The writer's phone was stolen","Nothing is stolen."],["The writer argues with parents every day","The writer hasn't told the parents."]], "<i>Desde hace un mes</i> = for a month (and still going on)."],
      ["Why hasn't the writer told their parents?", "They feel embarrassed", [["The parents are away","Not mentioned."],["They know who is doing it","<i>No sé quién es</i> = I don't know who it is."],["They think it's not important","<i>Me da vergüenza</i> = I'm embarrassed."]], "<i>Me da vergüenza contárselo a mis padres</i>."],
      ["¿Qué le pasa al chico cuando mira el móvil?", "Se pone nervioso.", [["Se pone contento.","Dice <i>me pongo nervioso</i>."],["Se pone el abrigo.","<i>Ponerse</i> + ropa no tiene sentido aquí."],["Se duerme.","No se menciona."]], "<i>Cada vez que miro el móvil, me pongo nervioso</i>."]]},
    { id:"reply", lvl:3, html:box("<b>Respuesta de la orientadora</b><br>Lo que te pasa se llama ciberacoso y no es culpa tuya. Haz capturas de pantalla de los comentarios y bloquea a esa persona. Después, habla con un adulto de confianza: tus padres, un profesor o el orientador del colegio. No tienes que enfrentarte a esto solo."), qs:[
      ["What should the student do first?", "Take screenshots and block the person", [["Reply to the comments","She says to block, not reply."],["Delete their account","She doesn't say that."],["Find out who it is","She doesn't suggest that."]], "<i>Haz capturas de pantalla … y bloquea a esa persona</i>."],
      ["Who should the student talk to?", "A trusted adult", [["The person posting the comments","She says to block them."],["Only other students","She lists adults: parents, a teacher, the counselor."],["Nobody","<i>No tienes que enfrentarte a esto solo</i>."]], "<i>Habla con un adulto de confianza</i>."],
      ["What does the counselor say about blame?", "It is not the student's fault", [["It is partly the student's fault","<i>No es culpa tuya</i> = it's not your fault."],["The parents are to blame","Not said."],["Social media companies are to blame","Not said."]], "<i>No es culpa tuya</i>."]]},
    { id:"pablo", lvl:3, html:box("<b>Mi hermano</b><br>Mi hermano mayor, Pablo, tiene diecisiete años y está en una etapa difícil. Se encierra en su habitación, casi no habla en la cena y se enfada por todo. Mi madre dice que es normal en la adolescencia. Yo lo echo de menos, porque antes jugábamos juntos a los videojuegos."), qs:[
      ["How does Pablo behave?", "He shuts himself in his room and gets angry easily", [["He talks a lot at dinner","<i>Casi no habla</i> = he hardly talks."],["He plays video games with his sibling","They used to (<i>antes</i>), not now."],["He goes out every night","Not mentioned."]], "<i>Se encierra en su habitación … y se enfada por todo</i>."],
      ["What does their mother think?", "It is normal in adolescence", [["Pablo is ill","She says it is normal."],["Pablo should leave home","Not said."],["It is the younger sibling's fault","Not said."]], "<i>Mi madre dice que es normal en la adolescencia</i>."],
      ["How does the writer feel about Pablo?", "They miss him", [["They are angry with him","<i>Lo echo de menos</i> = I miss him."],["They are afraid of him","<i>Echar de menos</i> = to miss."],["They don't care","They miss the time they spent together."]], "<i>Lo echo de menos</i>: <i>echar de menos</i> = to miss someone."]]},
    { id:"elena", lvl:3, html:box("<b>Querida consejera:</b><br>Mi mejor amiga tiene un grupo nuevo de amigas y ya no quiere pasar tiempo conmigo. En el recreo se va con ellas y no me llama los fines de semana. Me siento triste y un poco celosa. ¿Debo hablar con ella o buscar otras amigas? — Elena"), qs:[
      ["What is Elena's problem?", "Her best friend spends time with a new group", [["She argues with her parents","Parents are not mentioned."],["She has no friends at all","She has (had) a best friend."],["Her friend is moving away","Not mentioned."]], "<i>Mi mejor amiga tiene un grupo nuevo de amigas</i>."],
      ["How does Elena feel?", "Sad and a little jealous", [["Angry and rebellious","<i>Triste y un poco celosa</i>."],["Happy for her friend","She feels sad."],["Bored","<i>Celosa</i> = jealous."]], "<i>Me siento triste y un poco celosa</i>."],
      ["What does Elena ask the advisor?", "Whether to talk to her friend or find new friends", [["How to join the new group","She asks <i>¿Debo hablar con ella o buscar otras amigas?</i>"],["How to stop being jealous","She mentions jealousy but asks about what to do."],["What to do at recess","Recess is where the problem shows."]], "<i>¿Debo hablar con ella o buscar otras amigas?</i>"]]},
    { id:"volunteer", lvl:3, html:box("<b>Mi experiencia</b><br>Los sábados por la mañana soy voluntaria en un comedor social. Sirvo comida, lavo los platos y hablo con la gente. Antes me quejaba mucho de mis problemas, pero ahora veo las cosas de otra manera. Me siento útil y he conocido a personas increíbles."), qs:[
      ["Where does the writer volunteer?", "At a soup kitchen", [["At a school cafeteria","<i>Comedor social</i> = soup kitchen (for people in need)."],["At a restaurant","She is a volunteer, not an employee."],["At a hospital","Not mentioned."]], "<i>Soy voluntaria en un comedor social</i>."],
      ["What has changed for the writer?", "She complains less and sees things differently", [["She complains more","<i>Antes me quejaba mucho</i>: she used to complain a lot."],["She now works there for money","She is a volunteer."],["She has stopped volunteering","She still goes every Saturday."]], "<i>Antes me quejaba mucho … ahora veo las cosas de otra manera</i>."],
      ["How does volunteering make her feel?", "Useful", [["Tired","<i>Me siento útil</i> = I feel useful."],["Bored","<i>Útil</i> = useful."],["Nervous","<i>Útil</i> = useful."]], "<i>Me siento útil</i>."]]},
    { id:"screens", lvl:3, html:box("<b>Opinión</b><br>Muchos adultos dicen que los jóvenes de hoy no saben divertirse sin pantallas. Yo no estoy de acuerdo. Mis amigos y yo jugamos al baloncesto, hacemos excursiones y vamos a conciertos. Es verdad que usamos mucho el móvil, pero también tenemos una vida fuera de internet."), qs:[
      ["What do many adults say?", "Young people can't have fun without screens", [["Young people don't use phones enough","The opposite."],["Young people play too much basketball","Basketball is the writer's example."],["Concerts are too expensive","Not mentioned."]], "<i>Los jóvenes de hoy no saben divertirse sin pantallas</i>."],
      ["Does the writer agree with them?", "No", [["Yes, completely","<i>Yo no estoy de acuerdo</i> = I don't agree."],["Only about concerts","The writer simply disagrees."],["The writer doesn't say","<i>No estoy de acuerdo</i>."]], "<i>Yo no estoy de acuerdo</i>."],
      ["What does the writer admit?", "They do use their phones a lot", [["They never go out","They play basketball, hike and go to concerts."],["They have no life offline","They say the opposite."],["Adults are right","They disagree with adults."]], "<i>Es verdad que usamos mucho el móvil</i> = it's true we use our phones a lot."]]},
    { id:"growth", lvl:3, html:box("<b>Cuando tenía catorce años</b><br>A los catorce años crecí diez centímetros en un año. De repente, la ropa no me quedaba bien y me sentía torpe. Además, me salieron granos y no quería hacerme fotos. Ahora, con dieciséis, me acepto como soy y mi autoestima es mucho más alta."), qs:[
      ["What happened when the writer was fourteen?", "They grew ten centimeters in a year", [["They moved to a new town","Not mentioned."],["They started a new school","Not mentioned."],["They broke their arm","<i>Torpe</i> means clumsy, but no injury is mentioned."]], "<i>Crecí diez centímetros en un año</i>."],
      ["Why didn't the writer want photos taken?", "Because of pimples", [["Because of their clothes","Clothes didn't fit, but the photo reason is the pimples."],["Because they were shy","Shyness is not mentioned."],["Because their phone was broken","Not mentioned."]], "<i>Me salieron granos y no quería hacerme fotos</i>."],
      ["¿Cómo es la autoestima del autor ahora?", "Mucho más alta.", [["Muy baja.","Dice <i>mucho más alta</i>."],["Igual que antes.","Ha cambiado: ahora se acepta como es."],["No lo dice.","Lo dice al final del texto."]], "<i>Ahora … mi autoestima es mucho más alta</i>."]]}
  ];

  /* ---------- appropriate responses: [lvl, context, message, correct reply, [[wrong, fb]...], why] ---------- */
  const RESP = [
    [1, "A friend asks you:", "¿A qué hora te levantas los sábados?", "Me levanto a las diez.", [["Se levanta a las diez.","<i>Se levanta</i> is about him or her; the question asks about <b>you</b>."],["Me acuesto a las diez.","<i>Acostarse</i> = to go to bed, not to get up."],["Los sábados juego al fútbol.","It doesn't answer <i>what time</i>."]], "The question uses <i>te levantas</i> (you), so the reply uses <i>me levanto</i> (I) and gives a time."],
    [1, "A friend asks you:", "¿Cuánto dinero recibes de paga?", "Mis padres me dan veinte euros al mes.", [["Gasto la paga en ropa.","It says what you spend it on, not how much you get."],["Sí, recibo paga.","<i>¿Cuánto?</i> asks how much; yes/no doesn't answer."],["Pago veinte euros.","<i>Pagar</i> = to pay, not to receive."]], "<i>¿Cuánto?</i> needs an amount."],
    [1, "A friend asks you:", "¿Qué te pones para ir al colegio?", "Me pongo el uniforme del colegio.", [["Me pongo nervioso en el colegio.","<i>Ponerse</i> + adjective = to become; the question is about clothes."],["Se pone el uniforme.","That is about someone else, not you."],["Voy al colegio en autobús.","It answers how you get there, not what you wear."]], "<i>¿Qué te pones?</i> = What do you put on? → <i>me pongo</i> + clothes."],
    [1, "A friend asks you:", "¿Qué haces para relajarte?", "Me relajo leyendo o dando un paseo.", [["Me estreso con los exámenes.","That is the opposite of relaxing."],["Se relaja en el sofá.","That is about someone else."],["Relajo a las nueve.","<i>Relajarse</i> needs <i>me</i>, and the reply doesn't say how."]], "Answer with <i>me relajo</i> + how."],
    [1, "You are writing to a close friend. Which is the best way to start?", "", "¡Hola, Zoe! ¿Qué tal?", [["Estimada Zoe:","<i>Estimada</i> is for formal letters."],["Muy señora mía:","That is a very formal business opening."],["Buenas tardes, ¿cómo está usted?","<i>Usted</i> is for adults you don't know well."]], "With friends use <i>tú</i> and informal greetings: <i>¡Hola! ¿Qué tal?</i>"],
    [1, "A classmate asks you:", "¿Usas mucho las redes sociales?", "Sí, unas dos horas al día, sobre todo por la noche.", [["Sí, usa el móvil.","<i>Usa</i> is about someone else."],["Las redes sociales son de Estados Unidos.","It doesn't answer the question."],["No, uso mucho.","<i>No</i> and <i>uso mucho</i> contradict each other."]], "A yes/no question about you: answer <i>sí / no</i> and add a detail in the yo form."],
    [2, "A friend asks you:", "¿Te llevas bien con tus hermanos?", "Me llevo muy bien con mi hermana, pero discuto con mi hermano.", [["Sí, llevo una mochila.","<i>Llevar</i> = to carry; <i>llevarse bien</i> = to get along."],["Tengo dos hermanos.","It doesn't say how you get along."],["Sí, se llevan bien.","That says <b>they</b> get along, not you."]], "<i>¿Te llevas bien…?</i> → <i>Me llevo bien / mal…</i>"],
    [2, "A friend asks you:", "¿Qué haces cuando te sientes triste?", "Hablo con mi mejor amiga o salgo a correr.", [["Me siento triste los lunes.","It says when, not what you do."],["Mi amiga está triste.","It's about your friend, not you."],["Hago los deberes a las cinco.","It doesn't relate to feeling sad."]], "<i>¿Qué haces cuando…?</i> asks for an action."],
    [2, "A friend asks you:", "¿Vienes a la fiesta de Zoe el sábado?", "No puedo: mis padres no me dejan salir hasta tarde.", [["Sí, fui ayer.","<i>Fui ayer</i> is past tense; the party is on Saturday."],["Sí, vienes.","<i>Vienes</i> = you come; answer about yourself."],["La fiesta es en casa de Zoe.","It doesn't say whether you are coming."]], "Answer the invitation: yes or no, with a reason, in the right tense."],
    [2, "The school counselor asks you:", "¿Cómo te sientes hoy?", "Un poco mejor, gracias. Ya no me siento tan agobiado.", [["Me siento en la silla.","<i>Me siento</i> can also mean “I sit down” (sentarse); this misreads the question."],["Se siente bien.","That is about someone else."],["Soy de Madrid.","It doesn't answer the question."]], "<i>¿Cómo te sientes?</i> asks how you feel."],
    [2, "A friend says:", "Mi madre no me deja usar el móvil después de las diez. ¿Y a ti?", "A mí tampoco. En mi casa la norma es igual.", [["A mí también me gusta el móvil.","It doesn't match: the topic is a rule, not liking phones."],["Mi madre se llama Ana.","It doesn't answer."],["Sí, deja el móvil en la mesa.","<i>Dejar</i> here means to allow, not to leave something."]], "<i>A mí tampoco</i> = me neither (agreeing with a negative)."],
    [2, "A friend asks you:", "¿Cuántas horas duermes normalmente?", "Unas ocho horas, pero entre semana duermo menos.", [["Duermo en mi habitación.","It says where, not how many hours."],["Me duermo en clase.","<i>Dormirse</i> = to fall asleep; it doesn't answer how many hours."],["Dormí diez horas ayer.","Past tense about yesterday; the question is about <i>normalmente</i>."]], "<i>¿Cuántas horas?</i> needs a number, in the present tense."],
    [2, "A friend asks you:", "¿Te gustan las redes sociales?", "Sí, me gustan, pero a veces me agobian.", [["Sí, me gusta.","<i>Las redes sociales</i> is plural: <i>me gustan</i>."],["No, no me gusto.","<i>Me gusto</i> means “I like myself”."],["Sí, le gustan.","<i>Le gustan</i> = he/she likes them."]], "Plural thing liked → <i>me gustan</i>."],
    [2, "A friend asks you:", "¿Vas a ayudar en casa este fin de semana?", "Sí, voy a limpiar mi cuarto y sacar la basura.", [["Sí, ayudé ayer.","Past tense; the question is about this weekend."],["Sí, mi hermano ayuda.","That's about your brother."],["No, voy a ayudar.","<i>No</i> and <i>voy a ayudar</i> contradict each other."]], "A question with <i>ir a</i> + infinitive is answered with <i>voy a</i> + infinitive."],
    [2, "A friend asks you:", "¿Prefieres estudiar solo o con amigos?", "Prefiero estudiar solo, porque me concentro mejor.", [["Sí, prefiero.","It's an either/or question; <i>sí</i> doesn't choose."],["Estudio matemáticas.","It names a subject, not a preference."],["Prefieren estudiar con amigos.","<i>Prefieren</i> = they prefer."]], "Choose one option and give a reason."],
    [2, "Your friend's mother asks you:", "¿Quieres tomar algo?", "Sí, un vaso de agua, por favor. Gracias.", [["¡Dame agua!","Too abrupt and rude for an adult host."],["Sí, quiero tomar el autobús.","<i>Tomar algo</i> here means to have a drink."],["No, gracias, tengo mucha sed.","Saying no while very thirsty doesn't make sense."]], "Polite replies use <i>por favor</i> and <i>gracias</i>."],
    [3, "A friend writes:", "Estoy muy estresada por los exámenes.", "¿Por qué no haces un horario de estudio y descansas un poco?", [["¡Qué bien! Me alegro mucho.","That reacts to good news; stress is bad news."],["Yo también estoy muy relajado.","<i>También</i> + relaxed contradicts her being stressed."],["Los exámenes son el lunes.","It gives information but no support."]], "Respond to a problem with sympathy or advice."],
    [3, "A friend asks you:", "¿Con quién te llevas mejor en tu familia?", "Con mi abuela: siempre me escucha.", [["Llevo a mi abuela al médico.","<i>Llevar</i> = to take someone somewhere."],["Mi familia es grande.","It doesn't say who."],["Con mi abuela: siempre discutimos.","Getting along best and always arguing contradict each other."]], "<i>¿Con quién…?</i> needs a person and a reason that fits."],
    [3, "A friend writes:", "Mañana tengo una entrevista para un trabajo de verano y estoy nervioso.", "¡Mucha suerte! Seguro que te va a ir muy bien.", [["¡Qué pena! Lo siento mucho.","An interview is not bad news."],["¿Por qué estás contento?","He said he is nervous, not happy."],["Yo no trabajo en verano.","It ignores his feelings."]], "Before an important event, wish someone luck: <i>¡Mucha suerte!</i>"],
    [3, "An elderly neighbor asks:", "¿Puede usted ayudarme con estas bolsas?", "Claro, señora, ahora mismo la ayudo.", [["No, ayúdate tú.","Rude, and uses <i>tú</i> with an older stranger."],["Vale, tío, te ayudo.","<i>Tío</i> is slang; too informal for an older neighbor."],["Las bolsas son de plástico.","It doesn't answer the request."]], "With older people you don't know well, use <i>usted</i> and polite words like <i>señora</i>."],
    [3, "A friend writes:", "Siempre discuto con mis padres por la hora de llegada. ¿Qué hago?", "Habla con ellos con calma y propón una hora razonable.", [["Llega cuando quieras y no digas nada.","That advice would make the conflict worse."],["Mis padres viven en Lima.","It doesn't answer."],["Yo también discuto con mis padres.","It shares, but doesn't answer <i>¿Qué hago?</i>"]], "<i>¿Qué hago?</i> asks for advice: use a command (<i>habla, propón</i>)."],
    [3, "Your teacher asks:", "¿Por qué llegas tarde?", "Lo siento, perdí el autobús.", [["Llego tarde mañana.","It talks about tomorrow; the teacher asks why you are late now."],["Porque me levanto temprano.","Getting up early doesn't explain being late."],["Lo siento, profe, ¡hasta luego!","It doesn't explain, and saying goodbye is odd."]], "<i>¿Por qué…?</i> needs a reason: <i>porque…</i> or an explanation."],
    [3, "A friend tells you:", "¡He aprobado todos los exámenes!", "¡Enhorabuena! ¡Qué bien!", [["¡Qué pena! Lo siento.","Passing is good news."],["Yo también suspendo mucho.","<i>Aprobar</i> = to pass; <i>suspender</i> = to fail."],["¿Por qué estás triste?","Nothing suggests sadness."]], "Congratulate good news: <i>¡Enhorabuena!</i>"],
    [3, "In an interview you are asked:", "¿Qué es lo más difícil de ser adolescente?", "Para mí, la presión de grupo y el estrés de los exámenes.", [["Tengo quince años.","It gives your age, not a difficulty."],["Lo más fácil es salir con amigos.","The question asks for the most difficult thing."],["Los adolescentes duermen mucho.","It doesn't name a difficulty."]], "<i>Lo más difícil</i> = the hardest thing."],
    [3, "You are writing an email to the head of your school. Which is the best way to end it?", "", "Atentamente, Sam Pérez", [["¡Besos!","Far too informal for a head of school."],["Chao, guapa.","Very informal, and inappropriate."],["Un abrazo fuerte.","Used with friends and family."]], "Formal emails end with <i>Atentamente</i> or <i>Un cordial saludo</i>."],
    [3, "A friend asks you:", "¿Tus padres te dejan salir los viernes?", "Sí, pero tengo que volver antes de las once.", [["Sí, mis padres salen los viernes.","It says your parents go out; the question is about you."],["No, me dejo el móvil en casa.","<i>Dejarse</i> algo = to leave something behind."],["Salgo con mis padres.","It doesn't answer whether they let you go out."]], "<i>Dejar</i> + infinitive = to let / allow."]
  ];

  /* ---------- common mistakes bank: [kind, wrong sentence, correct sentence, [[bad fix, fb]...], why, level] ---------- */
  const KINDS = { P:"a missing or wrong reflexive pronoun", S:"a wrong stem change", E:"ser used instead of estar", A:"an adjective that does not agree", G:"gusta / gustan (encanta / encantan) does not agree", V:"the verb does not agree with its subject" };
  const FIX = [
    ["E","Mi hermana es muy cansada hoy.","Mi hermana está muy cansada hoy.",[["Mi hermana está muy cansado hoy.","<i>Cansado</i> must agree with <i>hermana</i>: cansada."],["Mi hermana estoy muy cansada hoy.","<i>Estoy</i> is the yo form."]],"Tiredness is a temporary state, so use <i>estar</i>. <i>Hoy</i> is a clue."],
    ["G","Me gusta las redes sociales.","Me gustan las redes sociales.",[["Me gusto las redes sociales.","<i>Me gusto</i> = I like myself."],["Me gustan la redes sociales.","The article must be <i>las</i>."]],"The thing you like is plural, so <i>gustan</i>."],
    ["G","Me gustan salir con mis amigos.","Me gusta salir con mis amigos.",[["Me gusto salir con mis amigos.","<i>Gusto</i> is the wrong form."],["Yo gusta salir con mis amigos.","<i>Gustar</i> needs <i>me</i>: <i>(a mí) me gusta</i>."]],"An infinitive (<i>salir</i>) counts as singular: <i>me gusta</i>."],
    ["P","Yo levanto a las siete.","Yo me levanto a las siete.",[["Yo se levanta a las siete.","<i>Se levanta</i> is the él / ella form."],["Yo me levanta a las siete.","<i>Levanta</i> is the él / ella form; yo needs <i>levanto</i>."]],"<i>Levantarse</i> is reflexive: yo → <i>me levanto</i>."],
    ["S","Nosotros nos acuestamos tarde.","Nosotros nos acostamos tarde.",[["Nosotros se acostamos tarde.","Nosotros needs <i>nos</i>."],["Nosotros nos acuestan tarde.","<i>Acuestan</i> is the ellos form."]],"No stem change for nosotros: <i>nos acostamos</i>."],
    ["S","Mi madre se desperta a las seis.","Mi madre se despierta a las seis.",[["Mi madre se despiertan a las seis.","<i>Despiertan</i> is plural; mi madre is singular."],["Mi madre se despiertas a las seis.","<i>Despiertas</i> is the tú form."]],"<i>Despertarse</i> changes e → ie for él / ella: <i>se despierta</i>."],
    ["S","Yo me vesto en cinco minutos.","Yo me visto en cinco minutos.",[["Yo me viesto en cinco minutos.","<i>Vestirse</i> changes e → i, not e → ie."],["Yo se visto en cinco minutos.","Yo needs <i>me</i>."]],"<i>Vestirse</i> changes e → i: <i>me visto</i>."],
    ["A","Ellas están contentos con sus notas.","Ellas están contentas con sus notas.",[["Ellas son contentas con sus notas.","Feelings use <i>estar</i>."],["Ellas está contentas con sus notas.","<i>Está</i> is singular."]],"<i>Ellas</i> is feminine plural: <i>contentas</i>."],
    ["A","Mi amiga se pone nervioso en los exámenes.","Mi amiga se pone nerviosa en los exámenes.",[["Mi amiga se pongo nerviosa en los exámenes.","<i>Pongo</i> is the yo form."],["Mi amiga pone nerviosa en los exámenes.","<i>Ponerse</i> + adjective needs <i>se</i>."]],"The adjective agrees with <i>mi amiga</i>: <i>nerviosa</i>."],
    ["O","Yo me pono la chaqueta.","Yo me pongo la chaqueta.",[["Yo me pone la chaqueta.","<i>Pone</i> is the él / ella form."],["Yo pongo me la chaqueta.","The pronoun goes before the conjugated verb: <i>me pongo</i>."]],"<i>Ponerse</i> has an irregular yo form: <i>me pongo</i>."],
    ["S","Nosotros nos diviertimos en las fiestas.","Nosotros nos divertimos en las fiestas.",[["Nosotros se divertimos en las fiestas.","Nosotros needs <i>nos</i>."],["Nosotros nos divierten en las fiestas.","<i>Divierten</i> is the ellos form."]],"No stem change for nosotros: <i>nos divertimos</i>."],
    ["E","Leo se siente triste porque es enfermo.","Leo se siente triste porque está enfermo.",[["Leo se sente triste porque está enfermo.","<i>Sentirse</i> changes e → ie: <i>se siente</i>."],["Leo se siente tristes porque está enfermo.","<i>Triste</i> must be singular for Leo."]],"Being ill is a temporary state: <i>está enfermo</i>."],
    ["O","Me llevo bien de mi hermana.","Me llevo bien con mi hermana.",[["Me llevo buen con mi hermana.","<i>Bien</i> (well) is correct; <i>buen</i> is an adjective."],["Me lleva bien con mi hermana.","<i>Lleva</i> is the él / ella form."]],"<i>Llevarse bien</i> takes <i>con</i>."],
    ["E","Mis padres son preocupados por mis notas.","Mis padres están preocupados por mis notas.",[["Mis padres están preocupadas por mis notas.","<i>Padres</i> is masculine plural: <i>preocupados</i>."],["Mis padres está preocupados por mis notas.","<i>Está</i> is singular."]],"Worry is a state: <i>estar preocupado</i>."],
    ["V","La presión de grupo son un problema.","La presión de grupo es un problema.",[["La presión de grupo están un problema.","Identifying what something is uses <i>ser</i>."],["La presión de grupo eres un problema.","<i>Eres</i> is the tú form."]],"The subject is <i>la presión</i> (singular): <i>es</i>."],
    ["V","Las redes sociales es muy populares.","Las redes sociales son muy populares.",[["Las redes sociales es muy popular.","The subject is plural, so the verb and adjective are plural."],["Los redes sociales son muy populares.","<i>Redes</i> is feminine: <i>las</i>."]],"<i>Las redes sociales</i> is plural: <i>son</i>."],
    ["P","Yo aburro en clase de historia.","Yo me aburro en clase de historia.",[["Yo me aburre en clase de historia.","<i>Aburre</i> is the él / ella form."],["Yo se aburro en clase de historia.","Yo needs <i>me</i>."]],"<i>Aburrirse</i> = to get bored. Without <i>me</i>, <i>aburro</i> means “I bore (others)”."],
    ["P","Ella queja siempre de los deberes.","Ella se queja siempre de los deberes.",[["Ella me queja siempre de los deberes.","Ella needs <i>se</i>."],["Ella se quejan siempre de los deberes.","<i>Quejan</i> is plural."]],"<i>Quejarse</i> is always reflexive: <i>se queja</i>."],
    ["P","Vosotros se acostáis tarde.","Vosotros os acostáis tarde.",[["Vosotros os acuestáis tarde.","No stem change for vosotros."],["Vosotros nos acostáis tarde.","<i>Nos</i> is for nosotros."]],"Vosotros needs <i>os</i>: <i>os acostáis</i>."],
    ["E","Hoy soy muy aburrido porque no hay nada que hacer.","Hoy estoy muy aburrido porque no hay nada que hacer.",[["Hoy estoy muy aburridos porque no hay nada que hacer.","One speaker: singular <i>aburrido</i>."],["Hoy soy muy aburrida porque no hay nada que hacer.","<i>Soy aburrida</i> still means “I am boring”."]],"<i>Estar aburrido</i> = to be bored; <i>ser aburrido</i> = to be boring."],
    ["G","A mí me encanta los fines de semana.","A mí me encantan los fines de semana.",[["A mí me encanto los fines de semana.","<i>Encanto</i> is the wrong form."],["A mí me encantan el fines de semana.","<i>Fines</i> is plural: <i>los</i>."]],"<i>Encantar</i> works like <i>gustar</i>: plural thing → <i>encantan</i>."],
    ["G","¿Te gustan el horario nuevo?","¿Te gusta el horario nuevo?",[["¿Te gustas el horario nuevo?","<i>Gustas</i> means “you are liked”."],["¿Tú gusta el horario nuevo?","<i>Gustar</i> needs <i>te</i>."]],"<i>El horario</i> is singular: <i>gusta</i>."],
    ["P","Mis amigas y yo se llevamos muy bien.","Mis amigas y yo nos llevamos muy bien.",[["Mis amigas y yo nos llevan muy bien.","<i>Llevan</i> is the ellos form."],["Mis amigas y yo nos llevamos muy bueno.","<i>Bien</i> (well), not <i>bueno</i>."]],"<i>Mis amigas y yo</i> = nosotras → <i>nos llevamos</i>."],
    ["P","Mi hermano enfada cuando pierde su equipo.","Mi hermano se enfada cuando pierde su equipo.",[["Mi hermano se enfadan cuando pierde su equipo.","<i>Enfadan</i> is plural."],["Mi hermano se enfado cuando pierde su equipo.","<i>Enfado</i> is the yo form (or a noun)."]],"<i>Enfadarse</i> (to get angry) needs <i>se</i>."],
    ["V","Los adolescentes necesita más independencia.","Los adolescentes necesitan más independencia.",[["Los adolescentes necesitan más independiente.","<i>Independiente</i> is an adjective; you need the noun <i>independencia</i>."],["Los adolescente necesitan más independencia.","<i>Adolescentes</i> must be plural."]],"Plural subject: <i>necesitan</i>."],
    ["V","La gente están estresada.","La gente está estresada.",[["La gente está estresados.","<i>Gente</i> is feminine singular: <i>estresada</i>."],["La gente es estresada.","Stress is a state: <i>estar</i>."]],"<i>La gente</i> is singular: <i>está</i>."],
    ["O","Me siento muy bueno hoy.","Me siento muy bien hoy.",[["Me sento muy bien hoy.","<i>Sentirse</i> changes e → ie: <i>me siento</i>."],["Me siento muy buenos hoy.","Use the adverb <i>bien</i>, not an adjective."]],"To feel well = <i>sentirse bien</i>."],
    ["E","Ana tiene 15 años y es estresada por los exámenes.","Ana tiene 15 años y está estresada por los exámenes.",[["Ana es 15 años y está estresada por los exámenes.","Age uses <i>tener</i>: <i>tiene 15 años</i>."],["Ana tiene 15 años y está estresado por los exámenes.","<i>Estresada</i> must agree with Ana."]],"Stress is a temporary state: <i>está estresada</i>."],
    ["S","Tú te sentes muy solo últimamente.","Tú te sientes muy solo últimamente.",[["Tú se sientes muy solo últimamente.","Tú needs <i>te</i>."],["Tú te sientas muy solo últimamente.","<i>Te sientas</i> is from <i>sentarse</i> (to sit down)."]],"<i>Sentirse</i> changes e → ie for tú: <i>te sientes</i>."],
  ].map(r => ({ kind:r[0], bad:r[1], good:r[2], alts:r[3], why:r[4] }));

  /* ---------- statements and meanings: [Spanish, English, near-miss English, near-miss fb, idea] ---------- */
  const IDEAS = { R:"a good relationship with someone", C:"a conflict with someone", W:"a worry or negative feeling", L:"a rule or limit set by others", F:"something fun or relaxing", M:"money" };
  const MATCH = [
    ["Me llevo bien con mis padres.","I get along well with my parents.","I take my parents with me.","<i>Llevarse bien con</i> = to get along with; <i>llevar</i> alone = to take or carry.","R"],
    ["Discuto mucho con mi hermano.","I argue a lot with my brother.","I rarely argue with my brother.","<i>Mucho</i> = a lot.","C"],
    ["No tengo confianza en mí mismo.","I don't have confidence in myself.","I don't trust my friends.","<i>En mí mismo</i> = in myself.","W"],
    ["Paso demasiado tiempo en las redes sociales.","I spend too much time on social media.","I don't spend enough time on social media.","<i>Demasiado</i> = too much.",""],
    ["Mis padres no me dejan salir entre semana.","My parents don't let me go out on weekdays.","My parents don't let me go out on weekends.","<i>Entre semana</i> = on weekdays.","L"],
    ["Me pongo nervioso antes de los exámenes.","I get nervous before exams.","I get nervous after exams.","<i>Antes de</i> = before.","W"],
    ["Siento mucha presión de grupo.","I feel a lot of peer pressure.","I feel a lot of pressure from my teachers.","<i>Presión de grupo</i> = peer pressure (from people your age).","W"],
    ["Mi autoestima es baja.","My self-esteem is low.","My self-esteem is high.","<i>Baja</i> = low.","W"],
    ["Recibo una paga de diez euros a la semana.","I get an allowance of ten euros a week.","I pay ten euros a week.","<i>Recibir</i> = to receive; <i>la paga</i> = allowance.","M"],
    ["Necesito más independencia.","I need more independence.","I have too much independence.","<i>Necesito más</i> = I need more.",""],
    ["Mis padres me apoyan en todo.","My parents support me in everything.","My parents control everything I do.","<i>Apoyar</i> = to support.","R"],
    ["Me preocupo por mi aspecto físico.","I worry about my appearance.","I don't care about my appearance.","<i>Preocuparse por</i> = to worry about.","W"],
    ["Me quejo del horario del colegio.","I complain about the school timetable.","I like the school timetable.","<i>Quejarse de</i> = to complain about.",""],
    ["Me aburro los domingos por la tarde.","I get bored on Sunday afternoons.","I have fun on Sunday afternoons.","<i>Aburrirse</i> = to get bored.","W"],
    ["Me divierto mucho con mis amigos.","I have a lot of fun with my friends.","I argue a lot with my friends.","<i>Divertirse</i> = to have fun.",""],
    ["Me relajo escuchando música.","I relax by listening to music.","I get stressed when I listen to music.","<i>Relajarse</i> = to relax.","F"],
    ["Me siento agobiado con tantos deberes.","I feel overwhelmed with so much homework.","I feel relaxed because I have little homework.","<i>Agobiado</i> = overwhelmed; <i>tantos</i> = so many.","W"],
    ["Tengo que volver a casa antes de las diez.","I have to be home before ten.","I can come home after ten.","<i>Tengo que</i> = I have to; <i>antes de</i> = before.","L"],
    ["Mi hermana mayor es muy comprensiva.","My older sister is very understanding.","My younger sister is very strict.","<i>Mayor</i> = older; <i>comprensiva</i> = understanding.","R"],
    ["Mi padre es demasiado estricto.","My father is too strict.","My father is not strict enough.","<i>Demasiado</i> = too (much).",""],
    ["Me enfado cuando me critican.","I get angry when people criticize me.","I get sad when people praise me.","<i>Enfadarse</i> = to get angry; <i>criticar</i> = to criticize.",""],
    ["Es difícil encajar en un grupo nuevo.","It's hard to fit into a new group.","It's easy to make new friends.","<i>Difícil</i> = hard; <i>encajar</i> = to fit in.",""],
    ["El ciberacoso es un problema grave.","Cyberbullying is a serious problem.","Cyberbullying is not a real problem.","<i>Grave</i> = serious.",""],
    ["Ahorro dinero para comprar un móvil.","I'm saving money to buy a phone.","I spend all my money on my phone.","<i>Ahorrar</i> = to save.","M"],
    ["Echo de menos a mis amigos de primaria.","I miss my friends from elementary school.","I see my elementary school friends every day.","<i>Echar de menos</i> = to miss.","W"],
    ["Duermo menos de siete horas.","I sleep less than seven hours.","I sleep more than seven hours.","<i>Menos de</i> = less than.",""],
    ["Me acuesto tarde porque uso el móvil en la cama.","I go to bed late because I use my phone in bed.","I get up late because I use my phone in bed.","<i>Acostarse</i> = to go to bed; <i>levantarse</i> = to get up.",""],
    ["Mis padres confían en mí.","My parents trust me.","I trust my parents.","The subject is <i>mis padres</i>; <i>en mí</i> = in me.","R"],
    ["A veces me siento solo.","Sometimes I feel lonely.","I never feel lonely.","<i>A veces</i> = sometimes.","W"],
    ["Hablo con mi madre cuando tengo un problema.","I talk to my mom when I have a problem.","My mom talks to me when she has a problem.","<i>Hablo</i> = I talk; <i>tengo</i> = I have.","R"],
    ["Me cuesta concentrarme en clase.","I find it hard to concentrate in class.","I concentrate easily in class.","<i>Me cuesta</i> = I find it hard.",""],
    ["Quiero tener más libertad.","I want to have more freedom.","I already have a lot of freedom.","<i>Quiero más</i> = I want more.",""],
    ["La adolescencia es una etapa de muchos cambios.","Adolescence is a stage of many changes.","Adolescence is a stage with few changes.","<i>Muchos</i> = many.",""],
    ["No me llevo bien con mi padrastro.","I don't get along with my stepfather.","I get along well with my stepfather.","<i>No me llevo bien</i> = I don't get along.","C"],
    ["Mis amigos me presionan para fumar.","My friends pressure me to smoke.","My friends help me stop smoking.","<i>Presionar</i> = to pressure.",""],
    ["Paso los fines de semana con mi pandilla.","I spend weekends with my group of friends.","I spend weekends alone.","<i>Pandilla</i> = group of friends.",""],
    ["Mi madre me castiga sin móvil.","My mother punishes me by taking away my phone.","My mother buys me a new phone.","<i>Castigar</i> = to punish; <i>sin</i> = without.",""],
    ["Tengo que ayudar en casa para recibir la paga.","I have to help at home to get my allowance.","I get my allowance without helping at home.","<i>Tengo que</i> = I have to.",""],
    ["Me preocupa el futuro.","The future worries me.","I'm excited about the future.","<i>Me preocupa</i> = it worries me.","W"],
    ["Mi mejor amiga siempre me escucha.","My best friend always listens to me.","My best friend never listens to me.","<i>Siempre</i> = always.","R"],
    ["Los adolescentes necesitan dormir más.","Teenagers need to sleep more.","Teenagers sleep too much.","<i>Necesitan dormir más</i> = need to sleep more.",""],
    ["Me pongo la sudadera y salgo.","I put on my sweatshirt and go out.","I get sweaty and go out.","<i>Ponerse</i> + clothing = to put on.",""],
    ["Mi hermano se pone rojo cuando habla con chicas.","My brother blushes when he talks to girls.","My brother wears red when he talks to girls.","<i>Ponerse rojo</i> = to go red, to blush.",""],
    ["Prefiero quedar con mis amigos a estudiar.","I prefer meeting up with my friends to studying.","I prefer studying to meeting up with my friends.","The first thing after <i>prefiero</i> is the one preferred.",""],
    ["Me encanta ver series en el sofá los domingos.","I love watching TV series on the sofa on Sundays.","I hate watching TV series on the sofa on Sundays.","<i>Me encanta</i> = I love.","F"],
    ["Mis padres discuten conmigo por la hora de llegada.","My parents argue with me about my curfew.","My parents agree with me about my curfew.","<i>Discutir</i> = to argue.",""],
    ["Gasto toda mi paga en ropa.","I spend all my allowance on clothes.","I save all my allowance for clothes.","<i>Gastar</i> = to spend; <i>ahorrar</i> = to save.","M"],
    ["Los sábados hago surf y lo paso genial.","On Saturdays I go surfing and have a great time.","On Saturdays I go surfing and have a terrible time.","<i>Pasarlo genial</i> = to have a great time.","F"]
  ].map(r => ({ es:r[0], en:r[1], near:r[2], nearFb:r[3], idea:r[4] }));

  /* ---------- topic ---------- */
  const T = {
    id:"spanish-adolescence", code:"A", year:10, subject:"Spanish", name:"Adolescence and daily life",
    blurb:"Teen-life vocabulary, reflexive and stem-changing verbs, ponerse, reading blogs and forums, choosing replies and fixing common mistakes.",
    levels:Kit.LEVELS3, defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:40,
    skills:{
      vocab:{ name:"Vocabulary connected with adolescence", short:"Vocabulary", lesson:0 },
      reflexive:{ name:"Reflexive verbs and their pronouns", short:"Reflexive verbs", lesson:1 },
      ponerse:{ name:"Forms and uses of ponerse", short:"Ponerse", lesson:3 },
      reading:{ name:"Reading comprehension", short:"Reading", lesson:5 },
      response:{ name:"Selecting an appropriate response", short:"Best response", lesson:5 },
      correct:{ name:"Correcting common grammatical mistakes", short:"Fix the mistake", lesson:4 },
      matching:{ name:"Matching statements with meanings", short:"Meanings", lesson:5 }
    },
    lessons:[
      { title:"Teen life words", heading:"The words you need to talk about growing up", html:`
<p>To talk about adolescence you need words for feelings, relationships, rules and pressures. Learn nouns with their article (<span class="es">el / la</span>).</p>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Spanish</th><th>English</th><th>Spanish</th><th>English</th></tr></thead><tbody>
<tr><td>${es("la adolescencia")}</td><td>adolescence</td><td>${es("los cambios")}</td><td>changes</td></tr>
<tr><td>${es("el estrés")}</td><td>stress</td><td>${es("la ansiedad")}</td><td>anxiety</td></tr>
<tr><td>${es("la presión de grupo")}</td><td>peer pressure</td><td>${es("la autoestima")}</td><td>self-esteem</td></tr>
<tr><td>${es("las redes sociales")}</td><td>social media</td><td>${es("el ciberacoso")}</td><td>cyberbullying</td></tr>
<tr><td>${es("la independencia")}</td><td>independence</td><td>${es("la libertad")}</td><td>freedom</td></tr>
<tr><td>${es("el horario")}</td><td>schedule</td><td>${es("la paga")}</td><td>allowance</td></tr>
<tr><td>${es("la hora de llegada")}</td><td>curfew</td><td>${es("las normas")}</td><td>rules</td></tr>
</tbody></table></div>
<div class="two">
<div class="rule"><span class="name">Relationships</span><p class="small">${es("llevarse bien / mal con")} = to get along well / badly with<br>${es("discutir con los padres")} = to argue with your parents<br>${es("tener confianza en, confiar en")} = to trust<br>${es("salir con amigos")} = to go out with friends<br>${es("echar de menos")} = to miss (someone)</p></div>
<div class="rule"><span class="name">Feelings (adjectives)</span><p class="small">${es("estresado, agobiado")} = stressed, overwhelmed<br>${es("preocupado, enfadado, cansado")} = worried, angry, tired<br>${es("tímido, inseguro, celoso")} = shy, insecure, jealous<br>${es("comprensivo, estricto")} = understanding, strict</p></div>
</div>
<p><b>Example.</b> ${es("Me llevo bien con mi madre, pero discuto con mi padre por la hora de llegada.")} = I get along well with my mom, but I argue with my dad about my curfew.</p>
<div class="warn"><span class="name">False friends</span><p class="small">${es("discutir")} = to argue (as well as discuss); ${es("la intimidad")} = privacy; ${es("la carpeta")} = folder; ${es("suspender")} = to fail (an exam); ${es("aprobar")} = to pass.</p></div>` },
      { title:"Reflexive verbs", heading:"Reflexive verbs: the action comes back to you", html:`
<p>A reflexive verb has <span class="es">-se</span> on the infinitive (<span class="es">levantarse</span>, to get up). When you conjugate it, the <b>se</b> becomes a pronoun that matches the subject and goes <b>before</b> the verb.</p>
<div class="tblwrap"><table class="tbl"><thead><tr><th>Subject</th><th>Pronoun</th><th>${es("levantarse")}</th><th>${es("aburrirse")}</th></tr></thead><tbody>
<tr><td>yo</td><td><b>me</b></td><td>${es("me levanto")}</td><td>${es("me aburro")}</td></tr>
<tr><td>tú</td><td><b>te</b></td><td>${es("te levantas")}</td><td>${es("te aburres")}</td></tr>
<tr><td>él / ella / usted</td><td><b>se</b></td><td>${es("se levanta")}</td><td>${es("se aburre")}</td></tr>
<tr><td>nosotros</td><td><b>nos</b></td><td>${es("nos levantamos")}</td><td>${es("nos aburrimos")}</td></tr>
<tr><td>vosotros</td><td><b>os</b></td><td>${es("os levantáis")}</td><td>${es("os aburrís")}</td></tr>
<tr><td>ellos / ellas / ustedes</td><td><b>se</b></td><td>${es("se levantan")}</td><td>${es("se aburren")}</td></tr>
</tbody></table></div>
<div class="two">
<div class="rule"><span class="name">Routine</span><p class="small">${es("Me levanto a las siete, me ducho y me visto.")}<br>${es("Por la noche me lavo los dientes y me acuesto.")}</p></div>
<div class="rule"><span class="name">Feelings</span><p class="small">${es("aburrirse, enfadarse, preocuparse, quejarse, relajarse, divertirse, sentirse")}<br>${es("Me preocupo por los exámenes.")}</p></div>
</div>
<h3>With an infinitive</h3>
<p>After ${es("tener que, ir a, querer, necesitar")}, attach the pronoun to the end of the infinitive, matching the subject: ${es("Tengo que levantar<b>me</b> temprano.")} ${es("¿Vas a duchar<b>te</b>?")} (You may also put it before the first verb: ${es("<b>Me</b> tengo que levantar")}.)</p>
<p class="small">Body parts use <i>el / la / los</i>, not “my”: ${es("Me lavo <b>las</b> manos")} = I wash <b>my</b> hands.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Forgetting the pronoun: <s>${es("Yo levanto a las siete")}</s> → ${es("Yo me levanto")}.<br>The wrong pronoun: <s>${es("Nosotros se levantamos")}</s> → ${es("nos levantamos")}.<br>Some verbs change meaning without the pronoun: ${es("aburro")} = I bore (others); ${es("me aburro")} = I get bored.</p></div>` },
      { title:"Stem changes", heading:"Boot verbs: the stem changes, except for nosotros and vosotros", html:`
<p>Some verbs change the last vowel of their stem in the present tense. The change happens in four forms that make a “boot” shape in the table. <b>Nosotros</b> and <b>vosotros</b> are outside the boot and keep the original stem.</p>
<div class="tblwrap"><table class="tbl"><thead><tr><th></th><th>e → ie: ${es("despertarse")}</th><th>o → ue: ${es("acostarse")}</th><th>e → i: ${es("vestirse")}</th></tr></thead><tbody>
<tr><td>yo</td><td>${es("me desp<b>ie</b>rto")}</td><td>${es("me ac<b>ue</b>sto")}</td><td>${es("me v<b>i</b>sto")}</td></tr>
<tr><td>tú</td><td>${es("te desp<b>ie</b>rtas")}</td><td>${es("te ac<b>ue</b>stas")}</td><td>${es("te v<b>i</b>stes")}</td></tr>
<tr><td>él / ella / usted</td><td>${es("se desp<b>ie</b>rta")}</td><td>${es("se ac<b>ue</b>sta")}</td><td>${es("se v<b>i</b>ste")}</td></tr>
<tr><td>nosotros</td><td>${es("nos despertamos")}</td><td>${es("nos acostamos")}</td><td>${es("nos vestimos")}</td></tr>
<tr><td>vosotros</td><td>${es("os despertáis")}</td><td>${es("os acostáis")}</td><td>${es("os vestís")}</td></tr>
<tr><td>ellos / ellas / ustedes</td><td>${es("se desp<b>ie</b>rtan")}</td><td>${es("se ac<b>ue</b>stan")}</td><td>${es("se v<b>i</b>sten")}</td></tr>
</tbody></table></div>
<div class="rule"><span class="name">Learn the change with the verb</span><p class="small">e → ie: ${es("despertarse, divertirse, sentirse")} · o → ue: ${es("acostarse, dormirse")} · e → i: ${es("vestirse")}<br>No change: ${es("levantarse, ducharse, lavarse, peinarse, aburrirse, enfadarse, preocuparse, quejarse, relajarse, llevarse")}</p></div>
<p><b>Worked example.</b> ${es("Mis hermanos ___ (divertirse) en las fiestas.")} → ellos → pronoun <b>se</b> → e → ie inside the boot → ${es("se divierten")}.</p>
<div class="warn"><span class="name">Traps</span><p class="small">No change for nosotros: <s>${es("nos acuestamos")}</s> → ${es("nos acostamos")}.<br>${es("vestirse")} is e → i, not e → ie: <s>${es("me viesto")}</s> → ${es("me visto")}.<br>${es("me siento")} can be <i>I feel</i> (sentirse) or <i>I sit down</i> (sentarse): context decides.</p></div>` },
      { title:"Ponerse", heading:"Ponerse: to put on, and to become", html:`
<p><span class="es">Ponerse</span> is reflexive, and its yo form is irregular (<span class="es">-go</span>), like <span class="es">tener → tengo</span>.</p>
<div class="tblwrap"><table class="tbl"><tbody>
<tr><td>yo</td><td>${es("me <b>pongo</b>")}</td><td>nosotros</td><td>${es("nos ponemos")}</td></tr>
<tr><td>tú</td><td>${es("te pones")}</td><td>vosotros</td><td>${es("os ponéis")}</td></tr>
<tr><td>él / ella / usted</td><td>${es("se pone")}</td><td>ellos / ellas / ustedes</td><td>${es("se ponen")}</td></tr>
</tbody></table></div>
<div class="two">
<div class="rule"><span class="name">+ clothes = to put on</span><p class="small">${es("Me pongo el uniforme.")} I put on my uniform.<br>${es("Se ponen las gafas de sol.")} They put on their sunglasses.</p></div>
<div class="rule"><span class="name">+ adjective = to become, to get</span><p class="small">${es("Me pongo nervioso.")} I get nervous.<br>${es("Ana se pone roja.")} Ana blushes (goes red).</p></div>
</div>
<h3>The adjective agrees with the subject</h3>
<div class="tblwrap"><table class="tbl"><thead><tr><th></th><th>masculine</th><th>feminine</th></tr></thead><tbody>
<tr><td>singular</td><td>${es("Leo se pone nervios<b>o</b>")}</td><td>${es("Mia se pone nervios<b>a</b>")}</td></tr>
<tr><td>plural</td><td>${es("Ellos se ponen nervios<b>os</b>")}</td><td>${es("Ellas se ponen nervios<b>as</b>")}</td></tr>
</tbody></table></div>
<p class="small">Adjectives ending in -e only change for plural: ${es("triste → tristes")}. ${es("feliz → felices")}. A mixed group (${es("Ana y Leo")}) takes the masculine plural: ${es("se ponen contentos")}.</p>
<div class="warn"><span class="name">Watch out</span><p class="small"><s>${es("me pono")}</s> → ${es("me pongo")}.<br>${es("Se pone nerviosa")} (she <i>gets</i> nervous: a change) is different from ${es("es nerviosa")} (she is a nervous person) and ${es("está nerviosa")} (she <i>is</i> nervous right now).</p></div>` },
      { title:"Accuracy", heading:"Five mistakes examiners see again and again", html:`
<ol class="steps">
<li><div><div class="m">${es("Estoy nervioso")}, not <s>${es("soy nervioso")}</s> (right now)</div><p class="why">Feelings and temporary states use <b>estar</b>: ${es("estoy cansado, está preocupada, están estresados")}. <b>Ser</b> describes what someone is like: ${es("es tímido")}.</p></div></li>
<li><div><div class="m">${es("Mis amigas están content<b>as</b>")}</div><p class="why">Adjectives agree in gender and number with the person.</p></div></li>
<li><div><div class="m">${es("Me gust<b>a</b> el fútbol / Me gust<b>an</b> los videojuegos")}</div><p class="why"><i>Gustar</i> agrees with the thing liked, not with the person. An infinitive counts as singular: ${es("me gusta salir")}.</p></div></li>
<li><div><div class="m">${es("<b>Me</b> levanto")}, not <s>${es("levanto")}</s></div><p class="why">Reflexive verbs need the matching pronoun: me, te, se, nos, os, se.</p></div></li>
<li><div><div class="m">${es("nos acostamos")}, not <s>${es("nos acuestamos")}</s></div><p class="why">Stem changes only happen inside the boot (yo, tú, él, ellos).</p></div></li>
</ol>
<div class="two">
<div class="rule"><span class="name">ser or estar?</span><p class="small">${es("Mi padre es estricto.")} (character)<br>${es("Mi padre está enfadado.")} (feeling now)<br>${es("Estoy aburrido")} = I'm bored; ${es("soy aburrido")} = I'm boring!</p></div>
<div class="rule"><span class="name">Group words</span><p class="small">${es("La gente")} is singular: ${es("la gente está estresada")}. ${es("Mis amigas y yo")} = nosotras: ${es("nos llevamos bien")}.</p></div>
</div>
<div class="warn"><span class="name">Checklist</span><p class="small">For every sentence ask: Who is the subject? Does the verb agree? Is there a reflexive pronoun? Does the stem change? Do the adjectives agree? Is it ser or estar?</p></div>` },
      { title:"Reading and replying", heading:"Read for the main idea, then check the details", html:`
<p>Blogs, forum posts and advice columns about teen life use the same patterns again and again. Use them to read faster and reply better.</p>
<ol class="steps">
<li><div><div class="m">Read the questions first.</div><p class="why">Underline what you need: a reason (<i>¿por qué?</i>), a time, a feeling, a person.</p></div></li>
<li><div><div class="m">Find the key sentence, then read around it.</div><p class="why">Watch for <i>no, nunca, ya no, antes, ahora, solo, más que</i>: they change the meaning.</p></div></li>
<li><div><div class="m">Eliminate wrong options.</div><p class="why">Wrong answers often use a word from the text in the wrong place.</p></div></li>
</ol>
<div class="quotebox" lang="es"><p>Antes me llevaba mal con mi padre, pero ahora hablamos mucho y confío en él.</p></div>
<p class="small"><b>Example.</b> How does the writer get along with their father now? Well: <span class="es">antes</span> (before) it was bad, <span class="es">ahora</span> (now) they talk and the writer trusts him.</p>
<h3>Choosing a reply</h3>
<div class="two">
<div class="rule"><span class="name">Match the person</span><p class="small">${es("¿Te levantas temprano?")} → ${es("Sí, <b>me</b> levanto…")} The question uses tú, so you answer with yo.</p></div>
<div class="rule"><span class="name">Match the question word and tone</span><p class="small">${es("¿Cuánto?")} needs an amount, ${es("¿Por qué?")} a reason. Good news → ${es("¡Enhorabuena!")}; a problem → sympathy or advice. Use ${es("usted")} with adults you don't know well.</p></div>
</div>
<h3>Phrases that mislead</h3>
<p class="small">${es("echar de menos")} = to miss · ${es("me cuesta")} = I find it hard · ${es("llevarse bien")} = to get along · ${es("ponerse rojo")} = to blush · ${es("dejar")} + infinitive = to allow · ${es("pasarlo bien")} = to have a good time</p>
<div class="warn"><span class="name">Who is doing what?</span><p class="small">${es("Mis padres confían en mí")} = my parents trust me; ${es("confío en mis padres")} = I trust my parents. Check the verb ending.</p></div>` }
    ],
    introHtml:`<h2>Six ideas that win marks</h2><p class="muted">Talking about teen life is mostly about routines and feelings. These habits make your Spanish accurate.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Pronoun first</h3><p class="small">Reflexive verbs need <span class="es">me, te, se, nos, os, se</span> before the verb: <span class="es">me levanto</span>.</p></div>
<div class="habit"><span class="hn">2</span><h3>Mind the boot</h3><p class="small">Stem changes skip nosotros and vosotros: <span class="es">me acuesto</span> but <span class="es">nos acostamos</span>.</p></div>
<div class="habit"><span class="hn">3</span><h3>Pongo, not pono</h3><p class="small"><span class="es">Ponerse</span> has an irregular yo form: <span class="es">me pongo</span>.</p></div>
<div class="habit"><span class="hn">4</span><h3>Feelings use estar</h3><p class="small"><span class="es">Estoy nervioso</span>, <span class="es">está preocupada</span>. Ser is for personality.</p></div>
<div class="habit"><span class="hn">5</span><h3>Make it agree</h3><p class="small">Adjectives match the person: <span class="es">mis amigas se ponen nerviosas</span>.</p></div>
<div class="habit"><span class="hn">6</span><h3>Read the small words</h3><p class="small"><span class="es">no, ya no, antes, ahora, demasiado, menos de</span> change the meaning of a sentence.</p></div>
</div>`,
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl); }
  };

  /* ---------- question makers ---------- */
  const P5 = [0, 1, 2, 3, 5];
  const pickR = filt => pick(filt ? REFL.filter(filt) : REFL);
  const isStem = r => !!r[3];
  function freshR(ctx, tag, filt, subjList){
    let r, s, c, k = 0;
    do { r = pickR(filt); s = pick(subjList); c = pick(r[4]); k++; } while (ctx.used.has(tag + r[0] + s[1]) && k < 40);
    ctx.used.add(tag + r[0] + s[1]);
    return { r, s, c };
  }
  const sentR = (s, verb, comp) => cap(s[0] + " " + verb + " " + comp + ".");

  function reflTyped(ctx, filt, persons, tag){
    let r, p, k = 0;
    do { r = pickR(filt); p = pick(persons); k++; } while (ctx.used.has(tag + r[0] + p) && k < 40);
    ctx.used.add(tag + r[0] + p);
    const pr = pick(PRONS[p]);
    return txt({ promptHtml:"Write the present tense of " + es(r[0]) + " (to " + r[1].replace(/\{pos\}/g, "one's") + ") for <b>" + pr + "</b>. Include the reflexive pronoun.",
      answers:typedR(r[0], p), wrong:reflWrong(r[0], p), answerHtml:es(pr + " <b>" + rform(r[0], p) + "</b>"),
      workHtml:workR(r[0], p) + tableR(r[0]), lesson:isStem(r) ? 2 : 1,
      key:isStem(r) ? "Stem-changing verbs change in yo, tú, él and ellos only; the pronoun always matches the subject." : "Reflexive pronoun + conjugated verb: me levanto, te levantas, se levanta…",
      hint:"Which pronoun goes with " + pr + "?" + (isStem(r) ? " Is " + pr + " inside the boot?" : "") });
  }
  function reflSentTyped(ctx, filt, subjList, tag){
    const { r, s, c } = freshR(ctx, tag, filt, subjList);
    const p = s[1], ans = rform(r[0], p);
    return txt({ promptHtml:"Type the correct form of the reflexive verb, with its pronoun.",
      exprHtml:'<div class="display">' + es(cap(s[0] + " " + BLANK + " (" + r[0] + ") " + c[0] + ".")) + "</div>",
      answers:[ans], wrong:reflWrong(r[0], p), answerHtml:es(ans), lesson:isStem(r) ? 2 : 1,
      workHtml:"<p>" + subjLine(s[0], p) + "</p>" + workR(r[0], p) + "<p>" + es(sentR(s, "<b>" + ans + "</b>", c[0])) + " = " + enSentence(r, s, c) + "</p>",
      key:"Subject → pronoun → (stem change?) → ending.",
      hint:"Find the subject first, then choose me, te, se, nos, os or se." });
  }
  function reflOptions(inf, p){
    const pri = [], rest = [], c = RV[inf][3];
    if (c) {
      if (BOOT.includes(p)) pri.push({ html:es(RP[p] + " " + stem(inf) + END[grp(inf)][p]), fb:"This form forgets the stem change (" + chName(c) + ")." });
      else pri.push({ html:es(RP[p] + " " + changed(inf) + END[grp(inf)][p]), fb:"No stem change for " + PL[p] + ": only yo, tú, él and ellos change." });
      if (c === "i") pri.push({ html:es(RP[p] + " " + swapLast(stem(inf), "e", "ie") + END[grp(inf)][p]), fb:es(base(inf)) + " changes e → i, not e → ie." });
    }
    if (p !== 2 && p !== 5) pri.push({ html:es("se " + vform(inf, p)), fb:"The pronoun must match the subject: " + PL[p] + " → " + RP[p] + ", not se." });
    if (!RV[inf][5]) rest.push({ html:es(vform(inf, p)), fb:"The reflexive pronoun <b>" + RP[p] + "</b> is missing." });
    for (let q = 0; q < 6; q++) if (q !== p && q !== 4 && rform(inf, q) !== rform(inf, p)) rest.push({ html:es(rform(inf, q)), fb:es(rform(inf, q)) + " is the " + PL[q] + " form." });
    return { pri, rest };
  }

  function readingQ(ctx, lvl){
    const t = Kit.unique(ctx, TEXTS.filter(x => x.lvl === lvl), x => x.id);
    const q = pick(t.qs);
    return mc({ promptHtml:"Read the text. " + q[0], exprHtml:t.html, workHtml:"<p>" + q[3] + "</p>",
      key:"Find the sentence that answers the question; watch for words like no, ya no, antes, ahora, solo.",
      hint:"Find the part of the text that matches the question, then compare it with each option." },
      q[1], q[2].map(w => ({ html:w[0], fb:w[1] })), []);
  }
  function responseQ(ctx, lvl){
    const r = Kit.unique(ctx, RESP.filter(x => x[0] === lvl), x => x[2] + x[3]);
    const prompt = r[2] ? r[1] + " " + es("<b>" + r[2] + "</b>") + " Which reply is the most appropriate?" : r[1];
    return mc({ promptHtml:prompt, workHtml:"<p>" + es(r[3]) + "</p><p>" + r[5] + "</p>",
      key:"A good reply matches the person (tú → yo), the question word, the tense and the tone.",
      hint:"Who is being asked about, and what kind of information does the question want?" },
      es(r[3]), r[4].map(w => ({ html:es(w[0]), fb:w[1] })), []);
  }

  const POOL = [
    /* ===== Level 1 ===== */
    { id:"voc-es-en", skill:"vocab", level:1, make(ctx){
      const v = Kit.unique(ctx, VOC, x => x.es); const { pri, rest } = vocDistractors(v, "en");
      return mc({ promptHtml:"What does " + es("<b>" + v.es + "</b>") + " mean?", workHtml:"<p>" + es(v.es) + " = “" + v.en + "”." + vocNote(v) + "</p>",
        key:"Learn teen-life nouns with el / la, and verbs with their little words (con, en, de).", hint:"Is it a thing, an action or a feeling? Look for a part you recognize." }, v.en, pri, rest);
    }},
    { id:"voc-en-es", skill:"vocab", level:1, make(ctx){
      const v = Kit.unique(ctx, VOC, x => x.es); const { pri, rest } = vocDistractors(v, "es");
      return mc({ promptHtml:"Which is the Spanish for “<b>" + v.en + "</b>”?", workHtml:"<p>“" + v.en + "” = " + es(v.es) + "." + vocNote(v) + "</p>",
        key:"Learn teen-life nouns with el / la, and verbs with their little words (con, en, de).", hint:"Think of a sentence about your own life that uses this word." }, es(v.es), pri, rest);
    }},
    { id:"refl-pron", skill:"reflexive", level:1, make(ctx){
      const { r, s, c } = freshR(ctx, "rp", null, SUBJ);
      const p = s[1], opts = ["me","te","se","nos"].filter(x => x !== RP[p]).map(x => ({ html:es(x), fb:"<i>" + x + "</i> goes with " + PL[RP.indexOf(x)] + ", but the subject is " + es(s[0]) + "." }));
      return mc({ promptHtml:"The verb is " + es(r[0]) + ". Choose the reflexive pronoun that matches the subject.",
        exprHtml:'<div class="display">' + es(sentR(s, BLANK + " " + vform(r[0], p), c[0])) + "</div>",
        workHtml:"<p>" + subjLine(s[0], p) + " The pronoun for " + PL[p] + " is <b>" + RP[p] + "</b>.</p><p>" + es(sentR(s, "<b>" + RP[p] + "</b> " + vform(r[0], p), c[0])) + " = " + enSentence(r, s, c) + "</p>",
        key:"me, te, se, nos, os, se: the pronoun always matches the subject.", hint:"Who is the subject? Usted and ustedes use se." }, es(RP[p]), opts, []);
    }},
    { id:"refl-type1", skill:"reflexive", level:1, make(ctx){ return reflTyped(ctx, r => !isStem(r), P5, "rt1"); } },
    { id:"refl-meaning", skill:"reflexive", level:1, make(ctx){
      const pairs = { levantarse:"despertarse", despertarse:"levantarse", acostarse:"dormirse", dormirse:"acostarse", aburrirse:"divertirse", divertirse:"aburrirse",
        relajarse:"estresarse", estresarse:"relajarse", enfadarse:"preocuparse", preocuparse:"quejarse", quejarse:"enfadarse", ducharse:"afeitarse", afeitarse:"ducharse",
        vestirse:"arreglarse", arreglarse:"vestirse", peinarse:"maquillarse", maquillarse:"peinarse", concentrarse:"relajarse", cansarse:"aburrirse" };
      const subs = [SUBJ[0], SUBJ[2], SUBJ[6], SUBJ[8], SUBJ[3]];
      const { r, s, c } = freshR(ctx, "rm", x => pairs[x[0]], subs);
      const p = s[1], other = RV[pairs[r[0]]], s2 = pick(subs.filter(x => x[1] !== p && x[2] !== "Ana"));
      const right = enSentence(r, s, c);
      const pri = [{ html:enSentence(other, s, c), fb:es(other[0]) + " means “to " + other[1].replace(/\{pos\}/g, "one's") + "”, not “to " + r[1].replace(/\{pos\}/g, "one's") + "”." },
        { html:enSentence(r, s2, c), fb:"Wrong subject: " + es(RP[p] + " " + vform(r[0], p)) + " is the " + PL[p] + " form." }];
      const third = RV[pick(Object.keys(pairs).filter(k => k !== r[0] && k !== other[0]))];
      const rest = [{ html:enSentence(third, s, c), fb:es(third[0]) + " means “to " + third[1].replace(/\{pos\}/g, "one's") + "”." }];
      return mc({ promptHtml:"What does this sentence mean?", exprHtml:'<div class="display">' + es(sentR(s, rform(r[0], p), c[0])) + "</div>",
        workHtml:"<p>" + es(r[0]) + " = to " + r[1].replace(/\{pos\}/g, "one's") + "; " + es(rform(r[0], p)) + " is the " + PL[p] + " form.</p><p>" + right + "</p>",
        key:"Know each reflexive verb's meaning and read the subject from the pronoun and ending.", hint:"Translate the verb first, then check who does it." }, right, pri, rest);
    }},
    { id:"pon-form", skill:"ponerse", level:1, make(ctx){
      let s, cl, k = 0; do { s = pick(PSUBJ); cl = pick(CLOTHES); k++; } while (ctx.used.has("pf" + s[2] + cl[0]) && k < 30);
      ctx.used.add("pf" + s[2] + cl[0]);
      const p = s[2], ans = PON[p];
      const pri = [];
      if (p === 0) pri.push({ html:es("me pono"), fb:"The yo form of <i>poner</i> is irregular: <b>pongo</b>." });
      pri.push({ html:es(PON[p].split(" ")[1]), fb:"<i>Ponerse</i> needs the reflexive pronoun <b>" + RP[p] + "</b>." });
      if (p !== 0) pri.push({ html:es(RP[p] + " pongo"), fb:"<i>Pongo</i> is only for yo." });
      const rest = [0,1,2,3,5].filter(q => q !== p && PON[q] !== ans).map(q => ({ html:es(PON[q]), fb:es(PON[q]) + " is the " + PL[q] + " form." }));
      return mc({ promptHtml:"Choose the correct form of " + es("ponerse") + ".",
        exprHtml:'<div class="display">' + es(showSubj(s) + " " + BLANK + " " + cl[0] + " para salir.") + "</div>",
        workHtml:"<p>" + subjLine(s[0], p) + " " + es("Ponerse") + " for " + PL[p] + " is " + es(ans) + ". With clothes it means “to put on”.</p>",
        key:"me pongo, te pones, se pone, nos ponemos, os ponéis, se ponen.", hint:"Remember the irregular yo form." }, es(ans), pri, rest);
    }},
    { id:"pon-type", skill:"ponerse", level:1, make(ctx){
      let p, k = 0; do { p = pick([0,0,1,2,3,5]); k++; } while (ctx.used.has("pt" + p) && k < 20); ctx.used.add("pt" + p);
      const pr = pick(PRONS[p]), cl = pick(CLOTHES);
      const wrong = [{ answers:["me pono","pono","yo pono"], msg:"The yo form of <i>poner</i> is irregular: <b>pongo</b>, so <i>me pongo</i>." },
        { answers:[PON[p].split(" ")[1]], msg:"Add the reflexive pronoun: <b>" + PON[p] + "</b>." },
        { answers:["ponerse", RP[p] + " poner", "poner" + RP[p]], msg:"That is the infinitive. Conjugate it: " + PON[p] + "." }];
      for (let q = 0; q < 6; q++) if (q !== p) wrong.push({ answers:[PON[q]], msg:es(PON[q]) + " is the " + PL[q] + " form." });
      for (const x of RP) if (x !== RP[p]) wrong.push({ answers:[x + " " + PON[p].split(" ")[1]], msg:"The pronoun for " + PL[p] + " is <b>" + RP[p] + "</b>." });
      return txt({ promptHtml:"Complete with the correct form of " + es("ponerse") + " for <b>" + pr + "</b>.",
        exprHtml:'<div class="display">' + es(cap(pr) + " " + BLANK + " " + cl[0] + ".") + "</div>",
        answers:[PON[p], pr + " " + PON[p]], wrong, answerHtml:es(PON[p]),
        workHtml:"<p>" + es("Ponerse") + ": me pongo, te pones, se pone, nos ponemos, os ponéis, se ponen. For " + PL[p] + ": " + es(PON[p]) + ".</p><p>" + es(cap(pr) + " " + PON[p] + " " + cl[0] + ".") + " = " + ({0:"I",1:"You",2:pr === "él" ? "He" : pr === "ella" ? "She" : "You",3:"We",5:pr === "ustedes" ? "You all" : "They"})[p] + " put" + (p === 2 ? "s" : "") + " on " + cl[1] + ".</p>",
        key:"Ponerse + clothes = to put on. Yo form: me pongo.", hint:"Irregular yo form ends in -go." });
    }},
    { id:"fix-estar", skill:"correct", level:1, make(ctx){
      const subs = [["yo","Mia",0,"f","s"],["yo","Leo",0,"m","s"],["tú","Zoe",1,"f","s"],["mi hermana","",2,"f","s"],["mi padre","",2,"m","s"],["nosotras","",3,"f","p"],["mis padres","",5,"m","p"],["mis amigas","",5,"f","p"],["la gente","",2,"f","s"]];
      const adjs = [["cansado","tired"],["preocupado","worried"],["estresado","stressed"],["enfadado","angry"],["contento","happy"],["nervioso","nervous"],["agobiado","overwhelmed"],["enfermo","sick"],["triste","sad"]];
      const cues = ["hoy", "ahora", "esta semana", "por los exámenes", "después del partido"];
      let s, a, k = 0; do { s = pick(subs); a = pick(adjs); k++; } while (ctx.used.has("fe" + s[0] + a[0]) && k < 30);
      ctx.used.add("fe" + s[0] + a[0]);
      const p = s[2], adj = agreeAdj(a[0], s[3], s[4]), cue = pick(cues);
      const sent = v => es(showSubj(s) + " " + v + " muy " + adj + " " + cue + ".");
      const pri = [{ html:es(SER[p]), fb:"<i>" + SER[p] + "</i> is <b>ser</b>. Feelings and temporary states (" + cue + ") use <b>estar</b>." }];
      const rest = [0,1,2,3,5].filter(q => q !== p).map(q => ({ html:es(ESTAR[q]), fb:es(ESTAR[q]) + " is the " + PL[q] + " form of estar." }));
      return mc({ promptHtml:"Choose the correct verb.", exprHtml:'<div class="display">' + sent(BLANK) + "</div>",
        workHtml:"<p>" + es(adj) + " (" + a[1] + ") is a feeling or state, so use <b>estar</b>. " + subjLine(s[0], p) + " → " + es(ESTAR[p]) + ".</p><p>" + sent("<b>" + ESTAR[p] + "</b>") + "</p>",
        key:"Feelings and temporary states use estar: estoy nervioso, está cansada.", hint:"Is this a permanent characteristic or how someone feels right now?" }, es(ESTAR[p]), pri, rest);
    }},
    { id:"fix-gustar", skill:"correct", level:1, make(ctx){
      const who = [["A mí","me","I",0],["A ti","te","you",0],["A mi hermano","le","my brother",1],["A nosotros","nos","we",0],["A mis padres","les","my parents",0],["A mi amiga","le","my friend",1]];
      const things = [["el fútbol",0,"soccer"],["las redes sociales",1,"social media"],["los exámenes",1,"exams"],["la música pop",0,"pop music"],["salir con amigos",0,"going out with friends"],
        ["los videojuegos",1,"video games"],["el horario del colegio",0,"the school timetable"],["las normas de casa",1,"the house rules"],["dormir la siesta",0,"taking naps"],
        ["las películas de terror",1,"horror movies"],["los lunes",1,"Mondays"],["hacer deporte",0,"doing sports"],["la comida del comedor",0,"the cafeteria food"],["los conciertos",1,"concerts"]];
      let w, t, k = 0; do { w = pick(who); t = pick(things); k++; } while (ctx.used.has("fg" + t[0]) && k < 30);
      ctx.used.add("fg" + t[0]);
      const neg = seededRandom() < 0.4, right = t[1] ? "gustan" : "gusta";
      const line = v => es(w[0] + " " + (neg ? "no " : "") + w[1] + " " + v + " " + t[0] + ".");
      const opts = [{ html:es(t[1] ? "gusta" : "gustan"), fb:es(t[0]) + " is " + (t[1] ? "plural, so <b>gustan</b>." : "singular" + (/r$/.test(t[0].split(" ")[0]) ? " (an infinitive counts as singular)" : "") + ", so <b>gusta</b>.") },
        { html:es("gusto"), fb:"<i>Gusto</i> means “I please” (or is the noun “taste”). <i>Gustar</i> agrees with the thing liked." },
        { html:es(w[1] === "nos" ? "gustamos" : w[1] === "les" ? "gustáis" : "gustas"), fb:"<i>Gustar</i> agrees with the thing liked, not with the person." }];
      return mc({ promptHtml:"Choose the correct form of " + es("gustar") + ".", exprHtml:'<div class="display">' + line(BLANK) + "</div>",
        workHtml:"<p>With <i>gustar</i>, the verb agrees with the thing liked: " + es(t[0]) + " is " + (t[1] ? "plural" : "singular") + ", so " + es(right) + ".</p><p>" + line("<b>" + right + "</b>") + " = " + cap(w[2]) + (neg ? (w[3] ? " doesn't like " : " don't like ") : (w[3] ? " likes " : " like ")) + t[2] + ".</p>",
        key:"Me gusta + singular noun or infinitive; me gustan + plural noun.", hint:"Look at the thing that is liked: singular or plural?" }, es(right), opts, []);
    }},
    { id:"read-1", skill:"reading", level:1, make(ctx){ return readingQ(ctx, 1); } },
    { id:"resp-1", skill:"response", level:1, make(ctx){ return responseQ(ctx, 1); } },
    { id:"match-1", skill:"matching", level:1, make(ctx){
      const m = Kit.unique(ctx, MATCH, x => x.es);
      const rest = sh(MATCH.filter(x => x !== m)).slice(0, 3).map(x => ({ html:x.en, fb:"That is the meaning of " + es(x.es) }));
      return mc({ promptHtml:"What does this statement mean?", exprHtml:'<div class="display">' + es(m.es) + "</div>",
        workHtml:"<p>" + es(m.es) + " = " + m.en + "</p><p class=\"small\">" + m.nearFb + "</p>", key:"Find the verb and the subject first, then the key words.",
        hint:"Which words do you recognize? Who is doing what?" }, m.en, [], rest);
    }},

    /* ===== Level 2 ===== */
    { id:"voc-type", skill:"vocab", level:2, make(ctx){
      const v = Kit.unique(ctx, VOC.filter(x => x.typ === 2), x => x.es);
      const wrong = VOC.filter(d => d !== v).map(d => ({ answers:vocAnswers(d), msg:"<i>" + d.es + "</i> means “" + d.en + "”." }));
      return txt({ promptHtml:"Type the Spanish for “<b>" + v.en + "</b>”.", answers:vocAnswers(v), wrong, answerHtml:es(v.es),
        workHtml:"<p>“" + v.en + "” = " + es(v.es) + (v.alt.length ? " (also accepted: " + v.alt.map(es).join(", ") + ")" : "") + "." + vocNote(v) + "</p>",
        key:"Spell it with its accents; learn nouns with el / la.", hint:"It starts with “" + noArt(v.es).charAt(0) + "”." });
    }},
    { id:"refl-stem", skill:"reflexive", level:2, make(ctx){ return reflSentTyped(ctx, isStem, SUBJ.filter(s => BOOT.includes(s[1])), "rs"); } },
    { id:"refl-nos", skill:"reflexive", level:2, make(ctx){
      const subs = [["nosotros",3,"We","our"],["mi hermana y yo",3,"My sister and I","our"],["mis amigos y yo",3,"My friends and I","our"],["tú y yo",3,"You and I","our"]];
      const { r, s, c } = freshR(ctx, "rn", isStem, subs);
      const ans = rform(r[0], 3);
      const { pri, rest } = reflOptions(r[0], 3);
      return mc({ promptHtml:"Choose the correct form.", lesson:2,
        exprHtml:'<div class="display">' + es(sentR(s, BLANK, c[0])) + ' <span class="small muted">(' + r[0] + ")</span></div>",
        workHtml:"<p>" + subjLine(s[0], 3) + "</p>" + workR(r[0], 3) + "<p>" + es(sentR(s, "<b>" + ans + "</b>", c[0])) + "</p>",
        key:"Nosotros and vosotros are outside the boot: no stem change.", hint:"Is nosotros inside the boot?" }, es(ans), pri, rest);
    }},
    { id:"refl-sent", skill:"reflexive", level:2, make(ctx){ return reflSentTyped(ctx, null, SUBJ, "rse"); } },
    { id:"refl-mc", skill:"reflexive", level:2, make(ctx){
      const { r, s, c } = freshR(ctx, "rmc", isStem, SUBJ);
      const p = s[1], ans = rform(r[0], p); const { pri, rest } = reflOptions(r[0], p);
      return mc({ promptHtml:"Choose the correct form.", lesson:2,
        exprHtml:'<div class="display">' + es(sentR(s, BLANK, c[0])) + ' <span class="small muted">(' + r[0] + ")</span></div>",
        workHtml:"<p>" + subjLine(s[0], p) + "</p>" + workR(r[0], p) + "<p>" + es(sentR(s, "<b>" + ans + "</b>", c[0])) + "</p>",
        key:"Pronoun + (stem change inside the boot) + ending.", hint:"Check three things: pronoun, stem, ending." }, es(ans), pri, rest);
    }},
    { id:"pon-adj", skill:"ponerse", level:2, make(ctx){
      let s, a, k = 0; do { s = pick(PSUBJ); a = pick(ADJ); k++; } while (ctx.used.has("pa" + s[0] + s[1] + a[0]) && k < 30);
      ctx.used.add("pa" + s[0] + s[1] + a[0]);
      const sit = pick(a[2]), right = agreeAdj(a[0], s[3], s[4]);
      const desc = (g, n) => (n === "p" ? "plural" : "singular") + (/o$/.test(a[0]) ? (g === "f" ? " feminine" : " masculine") : "");
      const opts = adjForms(a[0]).filter(f => f !== right).map(f => {
        const g = /a$|as$/.test(f) ? "f" : "m", n = /s$/.test(f) ? "p" : "s";
        return { html:es(f), fb:es(f) + " is " + desc(g, n) + ", but " + es(s[0]) + (s[1] ? " (" + s[1] + ")" : "") + " is " + desc(s[3], s[4]) + "." };
      });
      return mc({ promptHtml:"Choose the adjective that agrees with the subject.",
        exprHtml:'<div class="display">' + es(showSubj(s) + " " + PON[s[2]] + " " + BLANK + " " + sit[0] + ".") + "</div>",
        workHtml:"<p>" + es(s[0]) + (s[1] ? " (" + s[1] + ")" : "") + " is " + desc(s[3], s[4]) + (s[0].includes(" y ") && s[3] === "m" ? " (a mixed group takes the masculine)" : "") + ", so " + es(right) + ".</p><p>" + es(showSubj(s) + " " + PON[s[2]] + " <b>" + right + "</b> " + sit[0] + ".") + "</p>",
        key:"With ponerse + adjective, the adjective agrees with the subject.", hint:"Is the subject masculine or feminine, singular or plural?" }, es(right), opts, []);
    }},
    { id:"pon-sent", skill:"ponerse", level:2, make(ctx){
      let s, a, k = 0; do { s = pick(PSUBJ); a = pick(ADJ); k++; } while (ctx.used.has("ps" + s[0] + a[0]) && k < 30);
      ctx.used.add("ps" + s[0] + s[1] + a[0]);
      const p = s[2], sit = pick(a[2]), adj = agreeAdj(a[0], s[3], s[4]);
      const wrong = [{ answers:["me pono"], msg:"Irregular yo form: <b>me pongo</b>." }, { answers:[PON[p].split(" ")[1]], msg:"Add the pronoun: <b>" + PON[p] + "</b>." },
        { answers:["ponerse"], msg:"Conjugate it: " + PON[p] + "." }];
      for (let q = 0; q < 6; q++) if (q !== p) wrong.push({ answers:[PON[q]], msg:es(PON[q]) + " is the " + PL[q] + " form." });
      return txt({ promptHtml:"Type the correct form of " + es("ponerse") + ".",
        exprHtml:'<div class="display">' + es(showSubj(s) + " " + BLANK + " " + adj + " " + sit[0] + ".") + "</div>",
        answers:[PON[p]], wrong, answerHtml:es(PON[p]),
        workHtml:"<p>" + subjLine(s[0], p) + " → " + es(PON[p]) + ". Here ponerse + adjective means “to get / become” (" + es(adj) + " = " + a[1] + ").</p><p>" + es(showSubj(s) + " <b>" + PON[p] + "</b> " + adj + " " + sit[0] + ".") + "</p>",
        key:"Ponerse + adjective = to become; the pronoun and ending match the subject.", hint:"Who is the subject? Remember me pongo." });
    }},
    { id:"pon-sense", skill:"ponerse", level:2, make(ctx){
      const want = seededRandom() < 0.5 ? "become" : "put on";
      const mk = (kind) => {
        const s = pick(PSUBJ.filter(x => !x[1]));
        if (kind === "become") { const a = pick(ADJ); return es(cap(s[0]) + " " + PON[s[2]] + " " + agreeAdj(a[0], s[3], s[4]) + " " + pick(a[2])[0] + "."); }
        return es(cap(s[0]) + " " + PON[s[2]] + " " + pick(CLOTHES)[0] + ".");
      };
      const right = mk(want), seen = new Set([right]), others = [];
      while (others.length < 3) { const h = mk(want === "become" ? "put on" : "become"); if (!seen.has(h)) { seen.add(h); others.push(h); } }
      return mc({ promptHtml:Kit.unique(ctx, ["In which sentence does " + es("ponerse") + " mean “to <b>" + want + "</b>”?", "Which sentence uses " + es("ponerse") + " to mean “to <b>" + want + "</b>”?"]),
        workHtml:"<p>" + es("Ponerse") + " + clothes = to put on. " + es("Ponerse") + " + adjective = to become / get.</p><p>" + right + "</p>",
        key:"Look at what follows ponerse: clothes (put on) or an adjective (become).", hint:"Is the word after ponerse a piece of clothing or a feeling?" },
        right, others.map(h => ({ html:h, fb:"Here ponerse is followed by " + (want === "become" ? "clothes, so it means “to put on”." : "an adjective, so it means “to become”.") })), []);
    }},
    { id:"fix-pick", skill:"correct", level:2, make(ctx){
      const f = Kit.unique(ctx, FIX, x => x.bad);
      const opts = f.alts.map(a => ({ html:es(a[0]), fb:a[1] })).concat([{ html:es(f.bad), fb:"That is the original sentence, which has the mistake." }]);
      return mc({ promptHtml:"This sentence has a mistake. Which is the correct version?", exprHtml:'<div class="display">' + es(f.bad) + "</div>",
        workHtml:"<p>" + f.why + "</p><p>" + es(f.good) + "</p>", lesson:4,
        key:"Check pronoun, stem change, ser/estar, agreement and gustar.", hint:"Go through the checklist: pronoun, stem, ser/estar, agreement." }, es(f.good), opts, []);
    }},
    { id:"fix-kind", skill:"correct", level:2, make(ctx){
      const f = Kit.unique(ctx, FIX.filter(x => KINDS[x.kind]), x => x.bad);
      const others = Object.keys(KINDS).filter(k => k !== f.kind).map(k => ({ html:KINDS[k], fb:"Not here: " + f.why }));
      return mc({ promptHtml:"What kind of mistake does this sentence have?", exprHtml:'<div class="display">' + es(f.bad) + "</div>",
        workHtml:"<p>Correct: " + es(f.good) + "</p><p>" + f.why + "</p>",
        key:"Naming the type of mistake helps you find it in your own writing.", hint:"Compare the verb, the pronoun and the adjectives with the subject." }, KINDS[f.kind], others, []);
    }},
    { id:"read-2", skill:"reading", level:2, make(ctx){ return readingQ(ctx, 2); } },
    { id:"resp-2", skill:"response", level:2, make(ctx){ return responseQ(ctx, 2); } },
    { id:"match-2", skill:"matching", level:2, make(ctx){
      const m = Kit.unique(ctx, MATCH, x => x.es);
      const rest = sh(MATCH.filter(x => x !== m)).slice(0, 2).map(x => ({ html:x.en, fb:"That is the meaning of " + es(x.es) }));
      return mc({ promptHtml:"Which is the best English meaning?", exprHtml:'<div class="display">' + es(m.es) + "</div>",
        workHtml:"<p>" + es(m.es) + " = " + m.en + "</p><p class=\"small\">" + m.nearFb + "</p>", key:"Small words (no, más, menos, antes, demasiado) and the subject decide the meaning.",
        hint:"Two options look similar. Check the small words carefully." }, m.en, [{ html:m.near, fb:m.nearFb }], rest);
    }},
    { id:"match-rev", skill:"matching", level:2, make(ctx){
      const m = Kit.unique(ctx, MATCH, x => x.es);
      const rest = sh(MATCH.filter(x => x !== m)).slice(0, 3).map(x => ({ html:es(x.es), fb:es(x.es) + " means: " + x.en }));
      return mc({ promptHtml:"Which Spanish statement means: <b>" + m.en + "</b>", workHtml:"<p>" + es(m.es) + " = " + m.en + "</p><p class=\"small\">" + m.nearFb + "</p>",
        key:"Match the verb and the key words, not just one familiar word.", hint:"Find the verb that matches the English verb." }, es(m.es), [], rest);
    }},

    /* ===== Level 3 ===== */
    { id:"voc-type-p", skill:"vocab", level:3, make(ctx){
      const v = Kit.unique(ctx, VOC.filter(x => x.typ === 3), x => x.es);
      const wrong = VOC.filter(d => d !== v).map(d => ({ answers:vocAnswers(d), msg:"<i>" + d.es + "</i> means “" + d.en + "”." }));
      return txt({ promptHtml:"Type the Spanish phrase for “<b>" + v.en + "</b>”.", answers:vocAnswers(v), wrong, answerHtml:es(v.es),
        workHtml:"<p>“" + v.en + "” = " + es(v.es) + (v.alt.length ? " (also accepted: " + v.alt.map(es).join(", ") + ")" : "") + "." + vocNote(v) + "</p>",
        key:"Learn whole phrases with their prepositions: llevarse bien <b>con</b>, confiar <b>en</b>.", hint:"It has " + v.es.split(" ").length + " words and starts with “" + v.es.split(" ")[0] + "”." });
    }},
    { id:"voc-context", skill:"vocab", level:3, make(ctx){
      const c = Kit.unique(ctx, VCTX, x => x[0]);
      const enOf = w => { const f = VOC.find(x => noArt(x.es) === w || x.es === w); return f ? f.en : ""; };
      return mc({ promptHtml:"Choose the word that best completes the sentence.", exprHtml:'<div class="display">' + es(c[0]) + "</div>",
        workHtml:"<p>" + c[3] + "</p><p>" + es(c[0].replace(BLANK, "<b>" + c[1] + "</b>")) + "</p>",
        key:"Use the clue in the rest of the sentence to choose the word.", hint:"Find the clue: a feeling, a reason or an example." },
        es(c[1]), c[2].map(w => ({ html:es(w), fb:es(w) + (enOf(w) ? " (" + enOf(w) + ")" : "") + " does not fit the clue." })), []);
    }},
    { id:"refl-vos", skill:"reflexive", level:3, make(ctx){ return seededRandom() < 0.5 ? reflTyped(ctx, null, [4], "rv") : reflSentTyped(ctx, null, SUBJ_VOS.concat(SUBJ.filter(s => s[1] === 3)), "rv2"); } },
    { id:"refl-inf", skill:"reflexive", level:3, make(ctx){
      const ROUTINE = ["levantarse","ducharse","lavarse","peinarse","vestirse","acostarse","despertarse","relajarse","arreglarse","concentrarse","divertirse","afeitarse","cepillarse","maquillarse","dormirse"];
      const { r, s, c } = freshR(ctx, "ri", x => ROUTINE.includes(x[0]), SUBJ);
      const p = s[1], L = pick(LEADS), ans = base(r[0]) + RP[p];
      const wrong = [{ answers:[r[0]], msg:"The pronoun must match the subject: " + PL[p] + " → " + RP[p] + ", so " + es(ans) + "." },
        { answers:[RP[p] + " " + base(r[0])], msg:"After a conjugated verb, attach the pronoun to the end of the infinitive: " + es(ans) + " (or put it before " + es(L.forms[p]) + ")." },
        { answers:[rform(r[0], p)], msg:"After " + es(L.forms[p]) + " you need the infinitive, not a conjugated form." }];
      for (const x of RP) if (x !== RP[p]) wrong.push({ answers:[base(r[0]) + x], msg:"The pronoun must match the subject (" + PL[p] + " → " + RP[p] + "), not " + x + "." });
      return txt({ promptHtml:"Complete with the infinitive of the reflexive verb, with the pronoun attached.",
        exprHtml:'<div class="display">' + es(cap(s[0] + " " + L.forms[p] + " " + BLANK + " (" + r[0] + ") " + c[0] + ".")) + "</div>",
        answers:[ans], wrong, answerHtml:es(ans),
        workHtml:"<p>" + subjLine(s[0], p) + " The infinitive stays as an infinitive after " + es(L.forms[p]) + ", but <i>-se</i> changes to match the subject: " + es(base(r[0]) + "<b>" + RP[p] + "</b>") + ".</p><p>" + es(cap(s[0] + " " + L.forms[p] + " <b>" + ans + "</b> " + c[0] + ".")) + "</p>",
        key:"After tener que / ir a / querer, the pronoun joins the infinitive: tengo que levantarme.", hint:"Keep the infinitive, but change -se to the right pronoun." });
    }},
    { id:"refl-need", skill:"reflexive", level:3, make(ctx){
      const pairs = [
        ["Mi padre", 2, "lava", "el coche los domingos", "las manos antes de comer", "washes the car", "washes his hands"],
        ["La madre", 2, "viste", "al bebé", "muy rápido por la mañana", "dresses the baby", "gets dressed"],
        ["Leo", 2, "levanta", "pesas en el gimnasio", "a las ocho", "lifts weights", "gets up"],
        ["El padre", 2, "acuesta", "a los niños a las nueve", "tarde los sábados", "puts the children to bed", "goes to bed"],
        ["Mia", 2, "peina", "a su hermana pequeña", "delante del espejo", "combs her little sister's hair", "combs her hair"],
        ["Yo", 0, "ducho", "al perro en el jardín", "por la mañana", "shower the dog", "take a shower"],
        ["Nosotros", 3, "lavamos", "los platos después de cenar", "la cara con agua fría", "wash the dishes", "wash our faces"],
        ["Mis padres", 5, "preocupan", "", "por mis notas", "", "worry about my grades"],
        ["La profesora", 2, "aburre", "a los estudiantes con sus clases largas", "en las reuniones", "bores the students", "gets bored"]];
      const it = Kit.unique(ctx, pairs, x => x[0] + x[2]);
      const needs = !it[3] || seededRandom() < 0.5, p = it[1];
      const comp = needs ? it[4] : it[3];
      const right = needs ? es(RP[p]) : "no pronoun";
      const opts = [needs ? { html:"no pronoun", fb:"Without " + RP[p] + " the verb would need an object; here the subject does the action to itself." }
                          : { html:es(RP[p]), fb:"There is an object (" + es(comp) + "): the subject does the action to someone or something else, so no reflexive pronoun." }];
      return mc({ promptHtml:"Does this sentence need the reflexive pronoun " + es(RP[p]) + "? Choose what goes in the gap.",
        exprHtml:'<div class="display">' + es(it[0] + " " + BLANK + " " + it[2] + " " + comp + ".") + "</div>",
        workHtml:"<p>" + (needs ? "The subject does the action to itself (" + it[6] + "), so use " + es(RP[p]) + ": " + es(it[0] + " <b>" + RP[p] + "</b> " + it[2] + " " + comp + ".")
                                 : "The action is done to someone or something else (" + it[5] + "), so there is no reflexive pronoun: " + es(it[0] + " " + it[2] + " " + comp + ".")) + "</p>",
        key:"Reflexive = the subject does the action to itself. With another object, drop the pronoun.", hint:"Who receives the action: the subject, or someone or something else?" }, right, opts.slice(0, 1), opts.slice(1));
    }},
    { id:"pon-adj-type", skill:"ponerse", level:3, make(ctx){
      const list = PSUBJ.concat(PSUBJ_VOS);
      let s, a, k = 0; do { s = pick(list); a = pick(ADJ.filter(x => x[0] !== "feliz" || seededRandom() < 0.5)); k++; } while (ctx.used.has("pat" + s[0] + s[1] + a[0]) && k < 30);
      ctx.used.add("pat" + s[0] + s[1] + a[0]);
      const right = agreeAdj(a[0], s[3], s[4]), sit = pick(a[2]);
      const wrong = adjForms(a[0]).filter(f => f !== right).map(f => ({ answers:[f], msg:es(f) + " does not agree with " + es(s[0]) + (s[1] ? " (" + s[1] + ")" : "") + "." }));
      return txt({ promptHtml:"Write the adjective in brackets in the correct form.",
        exprHtml:'<div class="display">' + es(showSubj(s) + " " + PON[s[2]] + " " + BLANK + " (" + a[0] + ") " + sit[0] + ".") + "</div>",
        answers:[right], wrong, answerHtml:es(right),
        workHtml:"<p>" + es(s[0]) + (s[1] ? " (" + s[1] + ")" : "") + " is " + (s[3] === "f" ? "feminine" : "masculine") + " " + (s[4] === "p" ? "plural" : "singular") + (s[0].includes(" y ") && s[3] === "m" ? " (mixed group → masculine)" : "") + ": " + es(a[0]) + " → " + es(right) + ".</p>",
        key:"-o adjectives have four forms (o, a, os, as); -e adjectives add -s; feliz → felices.", hint:"Gender and number of the subject?" });
    }},
    { id:"pon-translate", skill:"ponerse", level:3, make(ctx){
      let s, a, k = 0; do { s = pick(PSUBJ.filter(x => !x[1])); a = pick(ADJ.filter(x => /o$/.test(x[0]))); k++; } while (ctx.used.has("ptr" + s[0] + a[0]) && k < 30);
      ctx.used.add("ptr" + s[0] + a[0]);
      const p = s[2], sit = pick(a[2]), adj = agreeAdj(a[0], s[3], s[4]);
      const other = agreeAdj(a[0], s[3] === "f" ? "m" : "f", s[4]);
      const en = s[5] + " " + (a[0] === "rojo" ? (p === 2 ? "goes red" : "go red") : a[0] === "pálido" ? (p === 2 ? "turns pale" : "turn pale") : (p === 2 ? "gets " : "get ") + a[1]) + " " + sit[1] + ".";
      const S = (v, x) => es(cap(s[0]) + " " + v + " " + x + " " + sit[0] + ".");
      const right = S(PON[p], adj);
      const opts = [{ html:S(PON[p], other), fb:"The adjective must agree with " + es(s[0]) + ": " + es(adj) + "." },
        { html:S(PON[p].split(" ")[1], adj), fb:"Without the pronoun <b>" + RP[p] + "</b>, <i>poner</i> means to put something somewhere." },
        { html:S(SER[p], adj), fb:"<i>" + SER[p] + "</i> (ser) describes personality; “get / become” is <i>ponerse</i>." },
        { html:S(p === 2 ? "se ponen" : "se pone", adj), fb:"The verb must agree with " + es(s[0]) + ": " + es(PON[p]) + "." }];
      return mc({ promptHtml:"Which is the best translation? <b>" + en + "</b>",
        workHtml:"<p>“Get / become” + feeling = <i>ponerse</i> + adjective. " + es(s[0]) + " → " + es(PON[p]) + ", and the adjective agrees: " + es(adj) + ".</p><p>" + right + "</p>",
        key:"get + feeling → ponerse + agreeing adjective.", hint:"Check three things: ponerse (not ser), the pronoun and ending, and the adjective ending." }, right, opts, []);
    }},
    { id:"fix-none", skill:"correct", level:3, make(ctx){
      const f = Kit.unique(ctx, FIX, x => x.bad);
      const others = sh(FIX.filter(x => x !== f)).slice(0, 3).map(x => ({ html:es(x.bad), fb:"Mistake: " + x.why + " Correct: " + es(x.good) }));
      return mc({ promptHtml:Kit.unique(ctx, ["Only one of these sentences has <b>no</b> mistake. Which one?", "Which sentence is grammatically correct?", "Three of these sentences contain a mistake. Which one is correct?"]),
        workHtml:"<p>" + es(f.good) + " is correct. " + f.why + "</p>", lesson:4,
        key:"Check pronoun, stem change, ser/estar, agreement and gustar in every sentence.", hint:"Test each sentence against the checklist." }, es(f.good), others, []);
    }},
    { id:"fix-gen", skill:"correct", level:3, make(ctx){
      const { r, s, c } = freshR(ctx, "fg", null, SUBJ);
      const p = s[1], good = sentR(s, rform(r[0], p), c[0]), errs = [];
      if (!r[5]) errs.push({ html:es(sentR(s, vform(r[0], p), c[0])), fb:"The reflexive pronoun <b>" + RP[p] + "</b> is missing." });
      if (p !== 2 && p !== 5) errs.push({ html:es(sentR(s, "se " + vform(r[0], p), c[0])), fb:"<i>Se</i> is for él / ella / ellos; " + PL[p] + " needs <b>" + RP[p] + "</b>." });
      if (isStem(r)) errs.push(BOOT.includes(p) ? { html:es(sentR(s, RP[p] + " " + stem(r[0]) + END[grp(r[0])][p], c[0])), fb:"Missing stem change (" + chName(r[3]) + "): " + es(rform(r[0], p)) + "." }
                                               : { html:es(sentR(s, RP[p] + " " + changed(r[0]) + END[grp(r[0])][p], c[0])), fb:"No stem change for " + PL[p] + ": " + es(rform(r[0], p)) + "." });
      for (const q of sh([0,1,2,3,5].filter(q => q !== p))) errs.push({ html:es(sentR(s, RP[p] + " " + vform(r[0], q), c[0])), fb:"The verb ending must match " + es(s[0]) + ": " + es(rform(r[0], p)) + "." });
      return mc({ promptHtml:Kit.unique(ctx, ["Which sentence is correct?", "Pick the sentence with no mistake.", "Only one sentence is accurate. Which one?"]), lesson:isStem(r) ? 2 : 1,
        workHtml:"<p>" + subjLine(s[0], p) + "</p>" + workR(r[0], p) + "<p>" + es(good) + "</p>",
        key:"Pronoun, stem and ending must all match the subject.", hint:"Check the pronoun first, then the stem, then the ending." }, es(good), errs.slice(0, 2), errs.slice(2));
    }},
    { id:"read-3", skill:"reading", level:3, make(ctx){ return readingQ(ctx, 3); } },
    { id:"resp-3", skill:"response", level:3, make(ctx){ return responseQ(ctx, 3); } },
    { id:"match-idea", skill:"matching", level:3, make(ctx){
      const m = Kit.unique(ctx, MATCH.filter(x => x.idea), x => x.es);
      const others = Object.keys(IDEAS).filter(k => k !== m.idea).map(k => ({ html:IDEAS[k], fb:"The statement means: " + m.en }));
      return mc({ promptHtml:"Which idea does this statement express?", exprHtml:'<div class="display">' + es(m.es) + "</div>",
        workHtml:"<p>" + es(m.es) + " = " + m.en + " So it expresses " + IDEAS[m.idea] + ".</p>",
        key:"Understand the whole statement first, then decide what kind of idea it is.", hint:"Translate the statement, then ask: is it positive, negative, a rule or about money?" }, IDEAS[m.idea], others, []);
    }}
  ];
  registerTopic(T);
})();

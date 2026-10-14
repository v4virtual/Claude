/* ===== Topic: Year 8 Science, Genetics and inheritance ===== */
(() => {
  const T = {
    id:"genetics", code:"G", year:8, subject:"Science", name:"Genetics and inheritance",
    blurb:"DNA, genes and chromosomes, alleles, genotype and phenotype, Punnett squares, diploid and haploid cells, and the Human Genome Project.",
    levels: Kit.LEVELS3,
    defaultLevel:"M", lengths:[5,10,15,20], defaultLen:10, defaultSecs:60,
    skills:{
      dna:      { name:"DNA, genes and chromosomes", short:"DNA and genes", lesson:0 },
      genopheno:{ name:"Genotype and phenotype", short:"Genotype vs phenotype", lesson:1 },
      alleles:  { name:"Dominant and recessive alleles", short:"Dominant and recessive", lesson:1 },
      zygosity: { name:"Homozygous and heterozygous", short:"Homo- and heterozygous", lesson:1 },
      punnett:  { name:"Punnett squares, ratios and probability", short:"Punnett squares", lesson:2 },
      ploidy:   { name:"Diploid and haploid cells", short:"Diploid and haploid", lesson:4 },
      hgp:      { name:"Human Genome Project; inherited and acquired traits", short:"Genome and traits", lesson:5 }
    },
    lessons:[],
    introHtml:"",
    build(seed, len, lvl){ seedRng(seed); return Kit.build(T, POOL, len, lvl).map(q => q.type === "num" && !q.answerHtml ? Object.assign(q, { answerHtml:String(q.answer).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (q.suf || "") }) : q); }
  };

  /* ---------- small helpers ---------- */
  const B = s => "<b>" + s + "</b>";
  const GT = g => '<b class="num">' + g + "</b>";
  const low = s => s.toLowerCase();
  const isDom = c => c !== c.toLowerCase();
  const nDom = g => [...g].filter(isDom).length;
  const geno = (L, n) => n === 2 ? L + L : n === 1 ? L + low(L) : low(L) + low(L);
  const join = (a, b) => (!isDom(a) && isDom(b)) ? b + a : a + b;
  function cross(p1, p2){
    const cells = [[join(p1[0], p2[0]), join(p1[0], p2[1])], [join(p1[1], p2[0]), join(p1[1], p2[1])]];
    const counts = [0, 0, 0];
    cells.forEach(row => row.forEach(c => counts[nDom(c)]++));
    return { cells, counts };
  }
  function square(p1, p2, hide){
    const c = cross(p1, p2).cells;
    const td = (i, j) => hide && hide[0] === i && hide[1] === j ? "<td><mark>?</mark></td>" : "<td>" + c[i][j] + "</td>";
    return '<div class="tblwrap"><table class="tbl punnett"><tr><th></th><th>' + p2[0] + "</th><th>" + p2[1] + "</th></tr>" +
      [0, 1].map(i => "<tr><th>" + p1[i] + "</th>" + td(i, 0) + td(i, 1) + "</tr>").join("") + "</table></div>";
  }
  function genoRatio(L, k){
    const parts = [2, 1, 0].filter(n => k[n]).map(n => [k[n], geno(L, n)]);
    if (parts.length === 1) return "all " + parts[0][1];
    const g = parts.reduce((a, p) => gcd(a, p[0]), 0);
    return parts.map(p => p[0] / g + " " + p[1]).join(" : ");
  }
  function phenoRatio(t, k){
    const d = k[2] + k[1], r = k[0];
    if (!r) return "all " + t.d;
    if (!d) return "all " + t.r;
    const g = gcd(d, r);
    return d / g + " " + t.d + " : " + r / g + " " + t.r;
  }
  const crossName = (p1, p2) => GT(p1) + " × " + GT(p2);
  function pWork(t, p1, p2){
    const k = cross(p1, p2).counts;
    return "<p>Split each parent's two alleles into gametes. Each box gets one allele from its row and one from its column:</p>" + square(p1, p2) +
      "<p>Genotypes: " + B(genoRatio(t.L, k)) + ". Phenotypes: " + B(phenoRatio(t, k)) + ". Each box is 1 out of 4, which is 25%.</p>";
  }
  function mcq(promptHtml, correct, wrongs, workHtml, key, hint, extra){
    return Kit.mc(Object.assign({ promptHtml, options:[{ html:correct, correct:true }].concat(wrongs.map(w => ({ html:w[0], fb:w[1] }))), workHtml, key, hint }, extra || {}));
  }
  function fromBank(ctx, bank){
    const x = Kit.unique(ctx, bank, b => b.q + "|" + (b.ex || ""));
    return mcq(x.q, x.a, x.w, x.work, x.key, x.hint || "Recall the exact definition, then check each option against it.", x.ex ? { exprHtml:x.ex } : null);
  }
  /* Pick an item a generator has not used yet in this quiz (key is any string) */
  function fresh(ctx, make, keyOf, tries){
    let x;
    for (let i = 0; i < (tries || 12); i++) { x = make(); if (!ctx.used.has(keyOf(x))) break; }
    ctx.used.add(keyOf(x));
    return x;
  }

  /* ---------- trait bank (all classic single-gene examples with complete dominance) ---------- */
  const TRAITS = [
    { org:"pea plants", gene:"stem height", L:"T", d:"tall", r:"short", one:["a tall pea plant", "a short pea plant"] },
    { org:"pea plants", gene:"seed color", L:"Y", d:"yellow seeds", r:"green seeds" },
    { org:"pea plants", gene:"seed shape", L:"R", d:"round seeds", r:"wrinkled seeds" },
    { org:"pea plants", gene:"flower color", L:"P", d:"purple flowers", r:"white flowers", one:["a pea plant with purple flowers", "a pea plant with white flowers"] },
    { org:"pea plants", gene:"pod color", L:"G", d:"green pods", r:"yellow pods", one:["a pea plant with green pods", "a pea plant with yellow pods"] },
    { org:"guinea pigs", gene:"fur color", L:"B", d:"black fur", r:"white fur", one:["a black guinea pig", "a white guinea pig"] },
    { org:"mice", gene:"fur color", L:"B", d:"black fur", r:"brown fur", one:["a black mouse", "a brown mouse"] },
    { org:"fruit flies", gene:"wing shape", L:"N", d:"normal wings", r:"vestigial wings", one:["a fruit fly with normal wings", "a fruit fly with vestigial wings"],
      intro:"In fruit flies, the allele for <b>normal wings</b> (N) is dominant over the allele for <b>vestigial wings</b> (n), which are short and crumpled." },
    { org:"cattle", gene:"horns", L:"H", d:"hornless", r:"horned",
      intro:"In cattle, the allele for being <b>hornless</b> (H) is dominant over the allele for being <b>horned</b> (h)." },
    { org:"tomato plants", gene:"fruit color", L:"R", d:"red fruit", r:"yellow fruit", one:["a tomato plant with red fruit", "a tomato plant with yellow fruit"] },
    { org:"humans", gene:"cystic fibrosis", L:"F", d:"unaffected", r:"cystic fibrosis", human:true, noRec:true,
      intro:"Cystic fibrosis is an inherited condition caused by a recessive allele (f). People with at least one dominant allele (F) are <b>unaffected</b>." },
    { org:"humans", gene:"dimples", L:"D", d:"dimples", r:"no dimples", human:true,
      intro:"<i>Classroom model</i> (real dimple inheritance is more complex): the allele for <b>dimples</b> (D) is dominant over the allele for <b>no dimples</b> (d)." },
    { org:"humans", gene:"earlobe shape", L:"E", d:"free earlobes", r:"attached earlobes", human:true,
      intro:"<i>Classroom model</i> (real earlobe shape is influenced by more than one gene): the allele for <b>free earlobes</b> (E) is dominant over the allele for <b>attached earlobes</b> (e)." }
  ];
  const intro = t => t.intro || "In " + t.org + ", the allele for " + B(t.d) + " (" + t.L + ") is dominant over the allele for " + B(t.r) + " (" + low(t.L) + ").";
  const kid = t => t.human ? "child" : "offspring";
  const kids = t => t.human ? "children" : "offspring";
  const ALL_CROSSES = [[2, 2], [2, 1], [2, 0], [1, 1], [1, 0], [0, 0]];
  const MID = [[2, 1], [2, 0], [1, 1], [1, 0], [1, 1], [1, 0]]; // crosses worth drawing (Aa crosses weighted up)
  function pickCross(t, allowed){
    let list = (allowed || ALL_CROSSES).filter(c => !(t.noRec && (c[0] === 0 || c[1] === 0)));
    if (!list.length) list = [[1, 1]];
    const c = pick(list), s = ri(0, 1) ? c : [c[1], c[0]];
    return [geno(t.L, s[0]), geno(t.L, s[1])];
  }

  /* ---------- DNA ---------- */
  const COMP = { A:"T", T:"A", C:"G", G:"C" };
  const strandOf = n => Array.from({ length:n }, () => pick(["A", "T", "C", "G"])).join("");
  const spaced = s => s.split("").join(" ");
  const BASE_NAME = { A:"adenine (A)", T:"thymine (T)", C:"cytosine (C)", G:"guanine (G)" };

  const DNA_BANK = [
    { q:"What does DNA stand for?", a:"Deoxyribonucleic acid",
      w:[["Deoxyribose nuclear acid", "Close, but it is one word, deoxyribonucleic: nucleic acids were first found in the nucleus."], ["Double nucleus acid", "DNA is a double strand, but the letters do not stand for double or nucleus."], ["Dinucleotide acid", "DNA is made of many nucleotides, not two, and that is not what the letters stand for."]],
      work:"<p>DNA is short for <b>deoxyribonucleic acid</b>. It is the molecule that carries genetic information in all living things.</p>", key:"DNA = deoxyribonucleic acid, the molecule that stores genetic information." },
    { q:"What shape is a DNA molecule?", a:"A double helix: two strands twisted like a spiral ladder",
      w:[["A single straight strand", "DNA has two strands, joined by base pairs, and they are twisted."], ["A flat circle of protein", "DNA is not a protein. Proteins are made using the instructions in DNA."], ["A short, solid rod", "DNA is very long and thin, and has two twisted strands."]],
      work:"<p>DNA is a <b>double helix</b>: two strands twisted around each other. The rungs of the ladder are pairs of bases.</p>", key:"DNA is a double helix with base pairs as the rungs." },
    { q:"What is a gene?", a:"A section of DNA that codes for a protein, which affects a characteristic",
      w:[["A whole chromosome", "A chromosome is much bigger: it carries hundreds or thousands of genes."], ["One of the four bases A, T, C or G", "A gene is a long sequence of many bases, not a single base."], ["A type of cell that passes on traits", "Genes are inside cells; they are not cells themselves."]],
      work:"<p>A <b>gene</b> is a section of DNA. Its sequence of bases is the code for one protein, and that protein affects a characteristic.</p>", key:"Gene = a section of DNA that codes for a protein." },
    { q:"What is a chromosome?", a:"A long DNA molecule, tightly coiled around proteins, that carries many genes",
      w:[["A single gene", "One chromosome carries many genes along its length."], ["A sex cell such as a sperm or egg", "Sex cells are gametes. They contain chromosomes, but they are not chromosomes."], ["The membrane around the nucleus", "The nuclear membrane surrounds the chromosomes; it is not one."]],
      work:"<p>A <b>chromosome</b> is one very long DNA molecule, coiled up tightly with proteins. Each chromosome carries many genes.</p>", key:"Chromosome = one long coiled DNA molecule carrying many genes." },
    { q:"Where is most of the DNA in a human cell found?", a:"In the nucleus",
      w:[["In the cell membrane", "The membrane controls what enters and leaves the cell. It does not store DNA."], ["In the ribosomes", "Ribosomes use copies of the instructions to build proteins, but they do not store the DNA."], ["Floating freely in the cytoplasm", "In human cells the chromosomes are kept inside the nucleus."]],
      work:"<p>In human (and other animal and plant) cells, the chromosomes, and so almost all the DNA, are inside the <b>nucleus</b>.</p>", key:"DNA is stored in chromosomes inside the nucleus." },
    { q:"Which base pairs with adenine (A) in DNA?", a:"Thymine (T)",
      w:[["Guanine (G)", "Guanine pairs with cytosine (C), not with A."], ["Cytosine (C)", "Cytosine pairs with guanine (G)."], ["Adenine (A)", "A base never pairs with itself. A always pairs with T."]],
      work:"<p>The base-pairing rule: <b>A pairs with T</b>, and <b>C pairs with G</b>.</p>", key:"A–T and C–G: always." },
    { q:"Which base pairs with cytosine (C) in DNA?", a:"Guanine (G)",
      w:[["Thymine (T)", "Thymine pairs with adenine (A)."], ["Adenine (A)", "Adenine pairs with thymine (T)."], ["Cytosine (C)", "A base never pairs with itself. C always pairs with G."]],
      work:"<p>The base-pairing rule: <b>A pairs with T</b>, and <b>C pairs with G</b>.</p>", key:"A–T and C–G: always." },
    { q:"How many different bases are found in DNA?", a:"Four: A, T, C and G",
      w:[["Two: A and T", "There are two base pairs (A–T and C–G), but four different bases."], ["Twenty", "Twenty is the number of amino acids used to build proteins, not DNA bases."], ["Forty-six", "46 is the number of chromosomes in a human body cell."]],
      work:"<p>DNA uses four bases: adenine (A), thymine (T), cytosine (C) and guanine (G).</p>", key:"Four bases: A, T, C, G." },
    { q:"What carries the information in a gene?", a:"The order (sequence) of the bases",
      w:[["The color of the DNA", "DNA has no useful color; the information is in the base sequence."], ["How many chromosomes the cell has", "The chromosome number is the same in all your body cells. The information is in the order of bases."], ["The size of the nucleus", "The nucleus stores DNA, but the information is in the base sequence."]],
      work:"<p>Like letters in a sentence, the <b>order of the bases</b> (for example ATG CCA ...) is the code that tells the cell which protein to make.</p>", key:"The base sequence is the genetic code." },
    { q:"Which statement correctly links genes and chromosomes?", a:"Each chromosome carries many genes",
      w:[["Each gene carries many chromosomes", "This is the wrong way round. Genes are small sections of a chromosome."], ["Genes and chromosomes are the same thing", "A gene is just one section of a chromosome."], ["Each chromosome carries exactly one gene", "Chromosomes carry hundreds or thousands of genes."]],
      work:"<p>A chromosome is a long DNA molecule. A gene is one section of it, so one chromosome carries <b>many genes</b>.</p>", key:"Gene inside chromosome inside nucleus inside cell." },
    { q:"What is a genome?", a:"All the genetic material (DNA) of an organism",
      w:[["One gene", "A genome includes all of the genes, not just one."], ["One pair of chromosomes", "The genome includes every chromosome."], ["Only the genes for appearance", "The genome includes all of the DNA, whatever it codes for."]],
      work:"<p>A <b>genome</b> is the complete set of DNA in an organism: every chromosome and every gene.</p>", key:"Genome = all of an organism's DNA." },
    { q:"What are chromosomes made of?", a:"DNA coiled around proteins",
      w:[["Fats and sugars", "Chromosomes are made of DNA and protein."], ["Only protein", "The DNA is the most important part; the proteins help pack it."], ["Cell membrane", "The membrane surrounds the whole cell."]],
      work:"<p>A chromosome is a long DNA molecule wound tightly around proteins, so it fits inside the nucleus.</p>", key:"Chromosome = DNA + packing proteins." }
  ];
  const SIZE = ["Base pair (such as A–T)", "Gene", "Chromosome", "Nucleus", "Cell", "Organism"];

  /* ---------- alleles, genotype, zygosity banks ---------- */
  const ALLELE_BANK = [
    { q:"What is an allele?", a:"A different version of the same gene",
      w:[["A gene for a different characteristic", "Alleles are versions of the same gene, for example tall and short versions of the height gene."], ["A whole chromosome", "An allele is a version of one gene, a small part of a chromosome."], ["A sex cell", "Sex cells are called gametes."]],
      work:"<p>An <b>allele</b> is one version of a gene. The pea height gene has a tall allele (T) and a short allele (t).</p>", key:"Alleles are versions of the same gene." },
    { q:"What is a dominant allele?", a:"An allele that shows its effect even when only one copy is present",
      w:[["An allele that is the most common in a population", "Dominant does not mean common. Some dominant alleles are rare."], ["An allele that only shows when two copies are present", "That describes a recessive allele."], ["An allele that is always harmful", "Dominant says nothing about harmful or helpful."]],
      work:"<p>A <b>dominant</b> allele shows in the phenotype if at least one copy is present (TT or Tt).</p>", key:"Dominant: one copy is enough to show." },
    { q:"What is a recessive allele?", a:"An allele that only shows its effect when two copies are present",
      w:[["An allele that never shows its effect", "A recessive allele does show, when there are two copies (tt)."], ["An allele that is always rare", "Recessive does not mean rare. Some recessive alleles are very common."], ["An allele that shows even with one copy", "That describes a dominant allele."]],
      work:"<p>A <b>recessive</b> allele is hidden when a dominant allele is present. It only shows in a homozygous recessive organism (tt).</p>", key:"Recessive: needs two copies to show." },
    { q:"How is a recessive allele usually written?", a:"With a lowercase letter, such as t",
      w:[["With a capital letter, such as T", "Capital letters are used for dominant alleles."], ["With a different letter from the dominant allele", "Both alleles of one gene use the same letter, in two cases."], ["With a number, such as 2", "Alleles are written with letters."]],
      work:"<p>Use one letter per gene: a <b>capital</b> for the dominant allele (T) and a <b>lowercase</b> for the recessive allele (t).</p>", key:"Same letter, capital = dominant, lowercase = recessive." },
    { q:"How many alleles of each gene does a human body cell have?", a:"Two: one from each parent",
      w:[["One", "Gametes have one allele of each gene. Body cells have two."], ["Four", "Body cells have pairs of chromosomes, so two alleles of each gene."], ["46", "46 is the number of chromosomes, not alleles of one gene."]],
      work:"<p>Body cells have chromosomes in pairs, one of each pair from each parent, so they have <b>two alleles</b> of each gene.</p>", key:"Two alleles per gene: one from mother, one from father." },
    { q:"How many alleles of each gene does a gamete (sperm or egg) carry?", a:"One",
      w:[["Two", "Body cells carry two. Gametes are haploid, so they carry only one."], ["None", "A gamete must carry one allele of each gene so the offspring gets a full set."], ["Four", "Gametes have half as many chromosomes as body cells."]],
      work:"<p>Gametes are haploid: they carry <b>one allele</b> of each gene. At fertilization the two gametes together give the offspring two alleles.</p>", key:"Gametes carry one allele of each gene." }
  ];
  const ZYG_BANK = [
    { q:"What does homozygous mean?", a:"Having two identical alleles of a gene, such as TT or tt",
      w:[["Having two different alleles, such as Tt", "That is heterozygous."], ["Having only one allele", "Body cells always have two alleles of each gene."], ["Having only dominant alleles", "tt is homozygous too: homozygous recessive."]],
      work:"<p><b>Homo</b> means same: TT (homozygous dominant) or tt (homozygous recessive).</p>", key:"Homozygous = two identical alleles." },
    { q:"What does heterozygous mean?", a:"Having two different alleles of a gene, such as Tt",
      w:[["Having two identical alleles, such as TT", "That is homozygous."], ["Having two recessive alleles", "tt is homozygous recessive."], ["Having two genes for one trait", "It is about two different alleles of the same gene."]],
      work:"<p><b>Hetero</b> means different: one dominant and one recessive allele, such as Tt.</p>", key:"Heterozygous = two different alleles." },
    { q:"What is a carrier of a recessive condition?", a:"A heterozygous person who has one recessive allele but does not show the condition",
      w:[["A person with two recessive alleles", "They have the condition, so they are not just carriers."], ["A person with two dominant alleles", "They have no recessive allele to pass on."], ["A person who caught the condition from someone else", "Inherited conditions are not caught like infections."]],
      work:"<p>A <b>carrier</b> is heterozygous (for example Ff): the dominant allele hides the recessive one, but the recessive allele can be passed to children.</p>", key:"Carrier = heterozygous, shows the dominant phenotype." },
    { q:"What does pure-breeding mean?", a:"Homozygous, so it always passes on the same allele",
      w:[["Heterozygous, with one of each allele", "Heterozygous organisms can pass on either allele, so they do not breed true."], ["Having no recessive alleles", "A homozygous recessive (tt) organism is pure-breeding too."], ["Only able to breed with the same species", "That is true of all species. Pure-breeding means homozygous."]],
      work:"<p>A <b>pure-breeding</b> (true-breeding) organism is homozygous: TT or tt. All its gametes carry the same allele.</p>", key:"Pure-breeding = homozygous." }
  ];
  const GP_BANK = [
    { q:"What is a genotype?", a:"The alleles an organism has for a gene, such as Tt",
      w:[["The observable characteristic, such as tall", "That is the phenotype."], ["The number of chromosomes in a cell", "Chromosome number is not the genotype."], ["The environment an organism lives in", "Environment can affect phenotype, but genotype is about alleles."]],
      work:"<p><b>Genotype</b> = the letters: the pair of alleles (TT, Tt or tt).</p>", key:"Genotype = alleles (letters). Phenotype = what you observe." },
    { q:"What is a phenotype?", a:"The observable characteristic, such as tall or short",
      w:[["The pair of alleles, such as Tt", "That is the genotype."], ["A section of DNA", "That is a gene."], ["A cell with one set of chromosomes", "That is a haploid cell."]],
      work:"<p><b>Phenotype</b> = what you can see or measure: tall, purple flowers, blood group A.</p>", key:"Genotype = alleles (letters). Phenotype = what you observe." }
  ];

  /* ---------- ploidy ---------- */
  const ORGS = [
    { n:"fruit fly", c:8, kind:"insect" }, { n:"dog", c:78, kind:"animal" }, { n:"chimpanzee", c:48, kind:"animal" },
    { n:"pea plant", c:14, kind:"plant" }, { n:"cat", c:38, kind:"animal" }, { n:"horse", c:64, kind:"animal" },
    { n:"cow", c:60, kind:"animal" }, { n:"chicken", c:78, kind:"animal" }, { n:"mouse", c:40, kind:"animal" },
    { n:"rice plant", c:24, kind:"plant" }, { n:"corn (maize) plant", c:20, kind:"plant" }, { n:"pig", c:38, kind:"animal" },
    { n:"tomato plant", c:24, kind:"plant" }, { n:"rabbit", c:44, kind:"animal" }, { n:"sheep", c:54, kind:"animal" },
    { n:"gorilla", c:48, kind:"animal" }, { n:"onion plant", c:16, kind:"plant" }, { n:"human", c:46, kind:"animal" }
  ];
  const BODY = { animal:["skin cell", "muscle cell", "liver cell", "body cell"], insect:["body cell", "muscle cell"], plant:["leaf cell", "root cell"] };
  const GAM = { animal:["sperm cell", "egg cell"], insect:["sperm cell", "egg cell"], plant:["egg cell", "male gamete (from pollen)"] };
  const HUMAN_DIP = ["skin cell", "muscle cell", "liver cell", "nerve cell", "cheek cell", "bone cell", "white blood cell", "stomach lining cell", "zygote (fertilized egg)"];
  const HUMAN_HAP = ["sperm cell", "egg cell"];
  const aOrAn = s => (/^[aeiou]/i.test(s) ? "an " : "a ") + s;
  const Cap = s => s[0].toUpperCase() + s.slice(1);

  const PLOIDY_BANK = [
    { q:"Which cells in the human body are haploid?", a:"Gametes (sperm and egg cells)",
      w:[["Skin cells", "Skin cells are body cells, so they are diploid (46 chromosomes)."], ["A zygote (fertilized egg)", "Fertilization restores the diploid number, so a zygote is diploid."], ["Muscle cells", "Muscle cells are body cells, so they are diploid."]],
      work:"<p>Only <b>gametes</b> are haploid (n = 23 in humans). All other body cells are diploid (2n = 46).</p>", key:"Gametes are haploid; body cells are diploid." },
    { q:"What does diploid mean?", a:"The cell has two sets of chromosomes, in pairs",
      w:[["The cell has one set of chromosomes", "That is haploid."], ["The cell has two nuclei", "Diploid is about chromosome sets, not the number of nuclei."], ["The cell can divide into two", "Diploid describes the chromosome number."]],
      work:"<p><b>Diploid (2n)</b>: two sets of chromosomes, one set from each parent. In humans 2n = 46, which is 23 pairs.</p>", key:"Diploid = two sets (2n); haploid = one set (n)." },
    { q:"What does haploid mean?", a:"The cell has one set of chromosomes",
      w:[["The cell has two sets of chromosomes", "That is diploid."], ["The cell has half a chromosome", "Haploid cells have whole chromosomes, just one of each pair."], ["The cell has no nucleus", "Haploid gametes have a nucleus with one set of chromosomes."]],
      work:"<p><b>Haploid (n)</b>: one set of chromosomes, one from each pair. Human gametes have n = 23.</p>", key:"Haploid = one set of chromosomes (n)." },
    { q:"What is formed when a sperm cell fertilizes an egg cell?", a:"A zygote (fertilized egg), which is diploid",
      w:[["A gamete", "Gametes are the sperm and egg themselves."], ["A haploid cell", "n + n = 2n, so the new cell is diploid."], ["A chromosome", "Fertilization joins two cells; it does not make a chromosome."]],
      work:"<p>Fertilization joins two haploid gametes: n + n = 2n. The new diploid cell is the <b>zygote</b>.</p>", key:"Fertilization: n + n = 2n zygote." },
    { q:"Which type of cell division makes gametes?", a:"Meiosis",
      w:[["Mitosis", "Mitosis makes identical diploid body cells for growth and repair."], ["Fertilization", "Fertilization joins gametes; it does not make them."], ["Photosynthesis", "Photosynthesis is how plants make food, not a type of cell division."]],
      work:"<p><b>Meiosis</b> halves the chromosome number to make haploid gametes. <b>Mitosis</b> makes diploid body cells.</p>", key:"Meiosis makes gametes; mitosis makes body cells." },
    { q:"Which symbol stands for the haploid number of chromosomes?", a:"n",
      w:[["2n", "2n is the diploid number (two sets)."], ["4n", "4n would mean four sets of chromosomes."], ["n²", "The haploid number is just n."]],
      work:"<p><b>n</b> = number of chromosomes in one set (haploid). <b>2n</b> = two sets (diploid). Humans: n = 23, 2n = 46.</p>", key:"n = haploid, 2n = diploid." },
    { q:"Where does each of the 23 pairs of chromosomes in your body cells come from?", a:"One chromosome of each pair comes from each parent",
      w:[["Both chromosomes of a pair come from the mother", "One comes from the egg (mother) and one from the sperm (father)."], ["Pairs 1 to 11 from one parent and 12 to 23 from the other", "Each pair has one chromosome from each parent."], ["They are made new in the zygote", "They are inherited from the two gametes."]],
      work:"<p>The egg brings 23 chromosomes and the sperm brings 23. So each pair has <b>one from each parent</b>.</p>", key:"Each pair: one from mother, one from father." }
  ];
  const PLOIDY_HARD = [
    { q:"Why must gametes be haploid?", a:"So that when two gametes join at fertilization, the zygote has the normal diploid number",
      w:[["So that they can swim faster", "Speed has nothing to do with chromosome number."], ["So that the offspring has half as many chromosomes as its parents", "The offspring has the same number as its parents; halving in gametes prevents doubling."], ["Because gametes only need half their genes to work", "The reason is to keep the chromosome number constant from generation to generation."]],
      work:"<p>If gametes were diploid, the zygote would have 4n, and the number would double every generation. Haploid gametes give n + n = 2n, the same number as the parents.</p>", key:"Haploid gametes keep the chromosome number constant across generations." },
    { q:"A dog has 78 chromosomes in each body cell and a human has 46. What does this show?", a:"Chromosome number does not tell you how complex an organism is",
      w:[["Dogs are more complex than humans", "More chromosomes does not mean more complex."], ["Dogs have more DNA in every chromosome", "The number of chromosomes says nothing about how big each one is."], ["Dog gametes are diploid", "Dog gametes are haploid, with 39 chromosomes."]],
      work:"<p>Different species have different chromosome numbers (fruit fly 8, pea 14, human 46, dog 78). The number is not a measure of complexity.</p>", key:"Chromosome number varies between species and does not show complexity." },
    { q:"Which statement about mitosis and meiosis is correct?", a:"Mitosis makes diploid body cells; meiosis makes haploid gametes",
      w:[["Mitosis makes gametes; meiosis makes body cells", "This is the wrong way round."], ["Both halve the chromosome number", "Only meiosis halves it. Mitosis keeps it the same."], ["Both double the chromosome number", "Neither doubles it. Fertilization restores 2n from two n gametes."]],
      work:"<p><b>Mitosis</b>: growth and repair, 2n → 2n, identical cells. <b>Meiosis</b>: makes gametes, 2n → n.</p>", key:"Mitosis keeps 2n; meiosis halves to n." },
    { q:"A human zygote divides many times to form an embryo. How many chromosomes are in each embryo cell?", a:"46, because the cells are made by mitosis",
      w:[["23, because the number halves each division", "Mitosis copies the chromosomes first, so the number stays at 46."], ["92, because the number doubles", "The chromosomes are copied and then shared out, so each cell has 46."], ["It depends on which organ the cell becomes", "All body cells have the same 46 chromosomes."]],
      work:"<p>The embryo grows by <b>mitosis</b>, which makes identical diploid cells, so every cell has 46 chromosomes.</p>", key:"Growth is by mitosis: every body cell keeps 2n." }
  ];

  /* ---------- Human Genome Project, inherited and acquired ---------- */
  const HGP_BANK = [
    { q:"When was the Human Genome Project declared complete?", a:"2003",
      w:[["1953", "1953 is when the double-helix structure of DNA was described."], ["1990", "The project started in 1990 and took about 13 years."], ["1866", "1866 is when Mendel published his pea plant experiments."]],
      work:"<p>The Human Genome Project ran from <b>1990</b> and was declared complete in <b>2003</b>.</p>", key:"HGP: 1990 to 2003." },
    { q:"About how many base pairs are in one copy of the human genome?", a:"About 3 billion",
      w:[["About 20,000", "About 20,000 is the number of protein-coding genes, not base pairs."], ["About 46", "46 is the number of chromosomes in a body cell."], ["About 3 thousand", "Far too small: one gene alone can be thousands of base pairs long."]],
      work:"<p>One copy of the human genome is about <b>3 billion base pairs</b> long.</p>", key:"About 3 billion base pairs, about 20,000 protein-coding genes." },
    { q:"About how many protein-coding genes does the human genome contain?", a:"About 20,000",
      w:[["About 3 billion", "About 3 billion is the number of base pairs."], ["About 46", "46 is the number of chromosomes in a body cell."], ["About 1 million", "Far too many: the project found about 20,000, fewer than many expected."]],
      work:"<p>The project found about <b>20,000</b> protein-coding genes, far fewer than many scientists had expected.</p>", key:"About 20,000 protein-coding genes." },
    { q:"What was the main aim of the Human Genome Project?", a:"To read the sequence of bases in human DNA and identify the genes",
      w:[["To clone a human", "The project read DNA; it did not clone anyone."], ["To create new genes for people", "It mapped the genes that already exist."], ["To count the cells in the human body", "It was about DNA sequence, not cell numbers."]],
      work:"<p>The project <b>sequenced</b> (read the order of) about 3 billion base pairs of human DNA and located the genes.</p>", key:"HGP = reading the whole human DNA sequence." },
    { q:"Who carried out the Human Genome Project?", a:"An international team of scientists in many countries",
      w:[["One scientist working alone", "It was far too big for one person: thousands of scientists took part."], ["A single school", "It was a huge international research project."], ["Doctors in one hospital", "Scientists from many countries worked together on it."]],
      work:"<p>It was an <b>international</b> project involving scientists from countries including the USA, the UK, Japan, France, Germany and China.</p>", key:"The HGP was an international collaboration." },
    { q:"Which is a medical benefit of the Human Genome Project?", a:"Doctors can test for alleles linked to some inherited diseases",
      w:[["Everyone's genes can now be changed easily", "Reading genes is not the same as changing them."], ["All diseases have been cured", "It helps research, but most diseases are not cured."], ["People no longer inherit diseases", "Inheritance has not changed; we just understand it better."]],
      work:"<p>Knowing where genes are helps scientists find alleles linked to diseases, develop <b>genetic tests</b> and research new treatments.</p>", key:"Benefit: better diagnosis and research into treatments." }
  ];
  const INHERITED = ["Blood type", "Natural eye color", "Natural hair color", "Free or attached earlobes", "Cystic fibrosis", "Red-green color blindness",
    "Dimples", "A guinea pig's fur color", "The flower color of a pea plant", "The shape of a pea seed", "Natural hair texture (curly or straight)", "A tiger's stripe pattern"];
  const ACQUIRED = ["A scar from a fall", "A suntan", "The language a person speaks", "Being able to ride a bike", "Playing the piano", "A tattoo",
    "Pierced ears", "Dyed hair", "Large muscles from weight training", "An accent", "A broken arm", "A dog trained to sit", "A lizard's lost tail", "Knowing how to swim"];
  const BENEFITS = ["Finding alleles linked to inherited diseases", "Developing genetic tests that diagnose some conditions early", "Designing medicines that suit a person's genes",
    "Understanding how humans are related to other species", "Tracing human ancestry and migration", "Helping scientists research new treatments"];
  const CONCERNS = ["Who should be allowed to see a person's genetic information?", "Could employers or insurers treat people unfairly because of their genes?",
    "Should parents be able to choose the genes of their children?", "Is it fair to tell people they have a high risk of a disease that has no cure?",
    "Who owns genetic data, and who should profit from it?", "Could genetic data be shared without the person's consent?"];
  const HGP_HARD = [
    { q:"Identical twins have the same genotype, but one is heavier than the other. What is the best explanation?", a:"Phenotype depends on the environment (such as diet and exercise) as well as genotype",
      w:[["One twin must have different alleles", "Identical twins come from one zygote, so they have the same alleles."], ["Mass is an acquired trait that is passed on", "Acquired features are not passed on through genes."], ["Genes have no effect on mass", "Genes do affect body mass; the environment adds to the effect."]],
      work:"<p>Identical twins share their genotype, so differences between them come from the <b>environment</b>. Many traits depend on both.</p>", key:"Phenotype = genotype + environment." },
    { q:"Which statement about height in humans is most accurate?", a:"It is influenced by many genes and by the environment, such as diet",
      w:[["It is controlled by one gene with two alleles", "Height is influenced by many genes, not one."], ["It is purely acquired", "Tall parents tend to have tall children, so genes matter."], ["It is purely inherited", "Diet and health in childhood also affect height."]],
      work:"<p>Height is affected by <b>many genes</b> and by the <b>environment</b> (nutrition and health). Single-gene examples like pea height are simpler models.</p>", key:"Many human traits are influenced by many genes and the environment." },
    { q:"A student says: 'The Human Genome Project showed that every trait is controlled by a single gene.' Evaluate this claim.", a:"Incorrect: most traits are influenced by several genes and by the environment",
      w:[["Correct: each gene controls exactly one trait", "Most traits involve many genes, and one gene can affect several traits."], ["Correct: that is why there are 20,000 traits", "There is no one-gene-one-trait rule for most features."], ["Incorrect: genes do not affect traits", "Genes do affect traits; the claim is wrong because it oversimplifies."]],
      work:"<p>Single-gene traits (like cystic fibrosis) exist, but most traits, such as height or skin color, are influenced by <b>several genes</b> and the <b>environment</b>.</p>", key:"Most traits are polygenic and affected by the environment." },
    { q:"A bodybuilder developed large muscles by training. Will their children inherit large muscles?", a:"No: muscles built by training are acquired and are not coded in the DNA of gametes",
      w:[["Yes: anything a parent develops is passed on", "Only alleles in the gametes are inherited, and training does not change them."], ["Yes, but only to sons", "Acquired traits are not passed on to sons or daughters."], ["Only if both parents trained", "Training changes muscles, not the alleles in sperm or egg cells."]],
      work:"<p>Training is an environmental effect. It does not change the alleles in the parent's gametes, so <b>acquired traits are not inherited</b>.</p>", key:"Acquired traits are not passed on through genes." },
    { q:"Why are many people concerned about who can access their genetic information?", a:"It could be used to discriminate against them, for example by employers or insurers",
      w:[["Because genetic information is always wrong", "The concern is about misuse, not accuracy."], ["Because DNA tests change your genes", "A test reads DNA; it does not change it."], ["Because it is too expensive to store", "The ethical concern is privacy and fairness, not cost."]],
      work:"<p>Genetic data is personal and permanent. An ethical concern is that it could be used <b>unfairly</b>, so privacy and consent matter.</p>", key:"Ethics: privacy, consent and fairness in using genetic data." },
    { q:"One copy of the human genome has about 3 billion base pairs. A body cell is diploid. About how many base pairs of DNA are in the nucleus of a body cell?", a:"About 6 billion",
      w:[["About 3 billion", "A diploid cell has two copies of the genome, one from each parent."], ["About 1.5 billion", "A diploid cell has two copies of the genome, so the amount goes up, not down."], ["About 46 billion", "Do not multiply by the number of chromosomes; the 3 billion is already spread over 23 chromosomes."]],
      work:"<p>One genome copy (one set of 23 chromosomes) is about 3 billion base pairs. A diploid cell has <b>two sets</b>, so about 2 × 3 = 6 billion base pairs.</p>", key:"Diploid = two copies of the genome." }
  ];
  const HISTORY = [
    ["Mendel publishes his pea plant experiments", 1866], ["DNA (then called nuclein) is first isolated", 1869],
    ["The double-helix structure of DNA is described", 1953], ["The Human Genome Project begins", 1990], ["The Human Genome Project is declared complete", 2003]];

  /* ========== generators ========== */
  const POOL = [
    /* ---- DNA ---- */
    { id:"dna-def", skill:"dna", level:1, make(ctx){ return fromBank(ctx, DNA_BANK); } },
    { id:"dna-order", skill:"dna", level:1, make(){
      const k = ri(4, 5), start = ri(0, SIZE.length - k), idx = shuffle([...Array(SIZE.length).keys()]).slice(0, k).sort((a, b) => a - b);
      const items = (ri(0, 1) ? SIZE.slice(start, start + k) : idx.map(i => SIZE[i]));
      return Kit.order({ promptHtml:"Put these in order of size, from smallest to largest.", inOrder:items, axis:["smallest", "largest"],
        workHtml:"<p>A <b>base pair</b> is a tiny part of a <b>gene</b>; a gene is one section of a <b>chromosome</b>; chromosomes are kept in the <b>nucleus</b>; the nucleus is inside a <b>cell</b>; and an <b>organism</b> is made of cells.</p><p class=\"small\">Order: " + items.join(" → ") + ".</p>",
        key:"Base pair → gene → chromosome → nucleus → cell → organism.", hint:"Ask: which one is found inside which?" });
    } },
    { id:"dna-pair1", skill:"dna", level:1, make(ctx){
      const x = fresh(ctx, () => { const s = strandOf(ri(6, 8)); return { s, i:ri(0, s.length - 1) }; }, x => "p1" + x.s + x.i);
      const b = x.s[x.i], ans = COMP[b];
      const shown = x.s.split("").map((c, j) => j === x.i ? "<mark>" + c + "</mark>" : c).join(" ");
      return Kit.mc({ promptHtml:"Here is one strand of DNA. Which base pairs with the highlighted base on the other strand?", exprHtml:'<div class="display num">' + shown + "</div>",
        options:["A", "T", "C", "G"].map(c => c === ans ? { html:BASE_NAME[c], correct:true } : { html:BASE_NAME[c], fb:c === b ? "A base never pairs with itself." : "The pairs are A–T and C–G, so " + b + " pairs with " + ans + ", not " + c + "." }),
        keepOrder:true,
        workHtml:"<p>The highlighted base is " + B(BASE_NAME[b]) + ". Base-pairing rule: <b>A–T</b> and <b>C–G</b>, so it pairs with " + B(BASE_NAME[ans]) + ".</p>",
        key:"A pairs with T; C pairs with G.", hint:"Remember the two pairs: A with T, C with G." });
    } },
    { id:"dna-strand", skill:"dna", level:2, make(ctx){
      const s = fresh(ctx, () => strandOf(ri(6, 9)), s => "st" + s), c = s.split("").map(b => COMP[b]).join("");
      const ag = s.split("").map(b => ({ A:"G", G:"A", T:"C", C:"T" })[b]).join(""), ac = s.split("").map(b => ({ A:"C", C:"A", T:"G", G:"T" })[b]).join("");
      const work = "<p>Pair each base in turn: A → T, T → A, C → G, G → C.</p><div class=\"display num\">" + spaced(s) + "<br>" + spaced(c) + "</div>";
      const key = "Complementary strand: swap A with T and C with G, base by base.";
      if (ri(0, 1)) return Kit.mc({ promptHtml:"Which is the complementary strand for this DNA strand (read in the same direction)?", exprHtml:'<div class="display num">' + spaced(s) + "</div>",
        options:[{ html:'<span class="num">' + spaced(c) + "</span>", correct:true },
          { html:'<span class="num">' + spaced(s) + "</span>", fb:"This is the same strand copied. Each base must be replaced by its partner." },
          { html:'<span class="num">' + spaced(ag) + "</span>", fb:"This pairs A with G and C with T. The real pairs are A–T and C–G." },
          { html:'<span class="num">' + spaced(ac) + "</span>", fb:"This pairs A with C and G with T. The real pairs are A–T and C–G." }],
        workHtml:work, key, hint:"Go base by base: A with T, C with G." });
      return Kit.text({ promptHtml:"Write the complementary strand for this DNA strand, reading in the same direction (letters only, for example TAGC).", exprHtml:'<div class="display num">' + spaced(s) + "</div>",
        answers:[c, spaced(c), c.split("").join("-")], answerHtml:'<b class="num">' + c + "</b>",
        wrong:[{ answers:[s, spaced(s)], msg:"You copied the strand. Replace each base with its partner." }, { answers:[ag, spaced(ag)], msg:"You paired A with G and C with T. The pairs are A–T and C–G." }],
        workHtml:work, key, hint:"Go base by base: A with T, C with G." });
    } },
    { id:"dna-chargaff", skill:"dna", level:2, make(ctx){
      const x = fresh(ctx, () => ({ b:pick(["A", "T", "C", "G"]), p:ri(15, 35) }), x => "cg" + x.b + x.p), partner = COMP[x.b];
      return { type:"num", promptHtml:"A sample of DNA is " + x.p + "% " + BASE_NAME[x.b] + ". What percentage of the bases are " + BASE_NAME[partner] + "?", answer:x.p, suf:"%",
        workHtml:"<p>In double-stranded DNA every " + x.b + " is paired with " + (partner === "A" ? "an " : "a ") + partner + ", so there are exactly as many of each: " + B(x.p + "%") + ".</p>",
        key:"Paired bases come in equal amounts: %A = %T and %C = %G.", hint:"Which base is its partner? Partners are always present in equal numbers.",
        mistakes:[{ when:{ v:100 - x.p }, msg:"100 − " + x.p + " is the percentage of all the other bases, not just its partner." }, { when:{ v:(100 - 2 * x.p) / 2 }, msg:"That is the percentage of each base in the other pair." }] };
    } },
    { id:"dna-chargaff2", skill:"dna", level:3, make(ctx){
      const x = fresh(ctx, () => ({ b:pick(["A", "T", "C", "G"]), p:ri(12, 38) }), x => "cg2" + x.b + x.p), partner = COMP[x.b];
      const other = (x.b === "A" || x.b === "T") ? pick(["C", "G"]) : pick(["A", "T"]), ans = (100 - 2 * x.p) / 2;
      return { type:"num", promptHtml:"A sample of double-stranded DNA is " + x.p + "% " + BASE_NAME[x.b] + ". What percentage of the bases are " + BASE_NAME[other] + "?", answer:ans, suf:"%",
        workHtml:"<ol class=\"steps\"><li><div><div class=\"m\">" + partner + " = " + x.p + "%</div><p class=\"why\">" + x.b + " pairs with " + partner + ", so they are equal.</p></div></li>" +
          "<li><div><div class=\"m\">100 − " + x.p + " − " + x.p + " = " + (100 - 2 * x.p) + "%</div><p class=\"why\">This is shared between the other two bases.</p></div></li>" +
          "<li><div><div class=\"m\">" + (100 - 2 * x.p) + " ÷ 2 = " + ans + "%</div><p class=\"why\">" + other + " and its partner are equal, so halve it.</p></div></li></ol>",
        key:"%A = %T and %C = %G, and all four add up to 100%.", hint:"First find the partner's percentage, then share what is left between the other pair.",
        mistakes:[{ when:{ v:100 - x.p }, msg:"You subtracted only one base. Its partner has the same percentage, so subtract it twice." }, { when:{ v:100 - 2 * x.p }, msg:"That is the total for the other pair. Halve it, because the pair is split equally." }, { when:{ v:x.p }, msg:"That is the percentage of its partner, not of a base from the other pair." }] };
    } },

    /* ---- genotype and phenotype ---- */
    { id:"gp-classify", skill:"genopheno", level:1, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS), g = ri(0, 1); return { t, g, item:g ? geno(t.L, ri(0, 2)) : pick([t.d, t.r]) }; }, x => "gc" + x.t.gene + x.item);
      const isG = x.g === 1;
      return Kit.mc({ promptHtml:"For " + x.t.gene + " in " + x.t.org + ", is this a genotype or a phenotype?", exprHtml:'<div class="display">' + (isG ? GT(x.item) : B(x.item)) + "</div>",
        options:[{ html:"Genotype", correct:isG, fb:isG ? "" : "A genotype is written as a pair of allele letters. " + x.item + " is something you can observe." },
          { html:"Phenotype", correct:!isG, fb:!isG ? "" : x.item + " is a pair of allele letters, so it is a genotype." },
          { html:"A single allele", fb:isG ? x.item + " has two letters: it is the pair of alleles, which is the genotype." : "An allele is written as one letter. " + x.item + " is an observable characteristic." }].map(o => o.correct ? { html:o.html, correct:true } : { html:o.html, fb:o.fb }),
        workHtml:"<p><b>Genotype</b> = the pair of alleles, written as letters (" + geno(x.t.L, 2) + ", " + geno(x.t.L, 1) + ", " + geno(x.t.L, 0) + "). <b>Phenotype</b> = what you observe (" + x.t.d + ", " + x.t.r + "). So " + B(x.item) + " is a " + B(isG ? "genotype" : "phenotype") + ".</p>",
        key:"Genotype = letters; phenotype = what you can see or measure.", hint:"Is it letters, or something you could see?" });
    } },
    { id:"gp-def", skill:"genopheno", level:1, make(ctx){ return fromBank(ctx, GP_BANK); } },
    { id:"gp-pheno", skill:"genopheno", level:1, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS), n:ri(0, 2) }), x => "gp" + x.t.gene + x.t.org + x.n), t = x.t, g = geno(t.L, x.n), ans = x.n ? t.d : t.r;
      return Kit.mc({ promptHtml:intro(t) + " What is the phenotype of an individual with genotype " + GT(g) + "?",
        options:[{ html:ans, correct:true }, { html:x.n ? t.r : t.d, fb:x.n ? "There is a dominant allele (" + t.L + "), so the dominant phenotype shows." : "There is no dominant allele, so the recessive phenotype shows." },
          { html:"A blend of " + t.d + " and " + t.r, fb:"With a dominant and a recessive allele there is no blending: the dominant allele hides the recessive one." }],
        workHtml:"<p>" + GT(g) + (x.n ? " has at least one dominant allele (" + t.L + "), so the phenotype is " + B(t.d) + "." : " has two recessive alleles, so the recessive phenotype " + B(t.r) + " shows.") + "</p>",
        key:"One dominant allele is enough to show the dominant phenotype.", hint:"Is there a capital letter in the genotype?" });
    } },
    { id:"gp-same", skill:"genopheno", level:2, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS), v:ri(0, 1) }), x => "gs" + x.t.gene + x.t.org + x.v), t = x.t;
      const AA = geno(t.L, 2), Aa = geno(t.L, 1), aa = geno(t.L, 0);
      if (x.v === 0) return Kit.mc({ promptHtml:intro(t) + " Which two genotypes give the same phenotype?",
        options:[{ html:GT(AA) + " and " + GT(Aa), correct:true }, { html:GT(Aa) + " and " + GT(aa), fb:Aa + " shows " + t.d + " but " + aa + " shows " + t.r + "." }, { html:GT(AA) + " and " + GT(aa), fb:"These are opposite homozygous genotypes with different phenotypes." }],
        workHtml:"<p>" + AA + " and " + Aa + " both contain the dominant allele, so both show " + B(t.d) + ". Same phenotype, different genotypes.</p>",
        key:"You cannot always tell the genotype from the phenotype: AA and Aa look the same.", hint:"Which genotypes contain at least one capital letter?" });
      return Kit.mc({ promptHtml:intro(t) + " Which genotype or genotypes give the phenotype " + B(t.r) + "?",
        options:[{ html:GT(aa) + " only", correct:true }, { html:GT(Aa) + " and " + GT(aa), fb:Aa + " has a dominant allele, so it shows " + t.d + "." }, { html:GT(AA) + " only", fb:AA + " is homozygous dominant, so it shows " + t.d + "." }, { html:GT(AA) + " and " + GT(Aa), fb:"These both show the dominant phenotype, " + t.d + "." }],
        workHtml:"<p>A recessive phenotype only shows when there is no dominant allele: " + GT(aa) + " only.</p>",
        key:"The recessive phenotype needs two recessive alleles.", hint:"The recessive phenotype appears only when the dominant allele is missing." });
    } },

    /* ---- dominant and recessive alleles ---- */
    { id:"al-def", skill:"alleles", level:1, make(ctx){ return fromBank(ctx, ALLELE_BANK); } },
    { id:"al-count", skill:"alleles", level:2, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS), list:Array.from({ length:ri(5, 8) }, () => ri(0, 2)), rec:ri(0, 1) }), x => "ac" + x.t.L + x.list.join("") + x.rec);
      const t = x.t, gs = x.list.map(n => geno(t.L, n)), ans = x.list.filter(n => x.rec ? n === 0 : n > 0).length, ph = x.rec ? t.r : t.d;
      return { type:"num", promptHtml:intro(t) + " How many of these genotypes show the phenotype " + B(ph) + "?", exprHtml:'<div class="display num">' + gs.join(", ") + "</div>", answer:ans,
        workHtml:"<p>" + (x.rec ? "Only genotypes with no capital letter (" + geno(t.L, 0) + ") show " + t.r + "." : "Any genotype with at least one capital letter (" + geno(t.L, 2) + " or " + geno(t.L, 1) + ") shows " + t.d + ".") + " Count them: " + B(ans) + ".</p>",
        key:"Dominant phenotype: at least one capital. Recessive phenotype: no capitals.", hint:"Check each genotype for a capital letter.",
        mistakes:[{ when:{ v:x.list.filter(n => x.rec ? n !== 0 : n === 2).length }, msg:x.rec ? "You counted the genotypes that show the dominant phenotype." : "You only counted the homozygous dominant ones. Heterozygous genotypes show the dominant phenotype too." }].filter(m => m.when.v !== ans) };
    } },
    { id:"al-letters", skill:"alleles", level:2, make(ctx){
      const list = TRAITS.filter(t => !t.human && t.r[0].toUpperCase() !== t.L);
      const t = Kit.unique(ctx, list, t => "al" + t.gene + t.org), R = t.r[0].toUpperCase(), l = low(t.L);
      return Kit.mc({ promptHtml:"In " + t.org + ", " + t.d + " is dominant over " + t.r + ". Which way of writing the alleles follows the usual rule?",
        options:[{ html:t.L + " for " + t.d + ", " + l + " for " + t.r, correct:true },
          { html:t.L + " for " + t.d + ", " + R + " for " + t.r, fb:"Both alleles are versions of one gene, so they share one letter: capital for dominant, lowercase for recessive." },
          { html:l + " for " + t.d + ", " + t.L + " for " + t.r, fb:"This is reversed: the capital letter is for the dominant allele." },
          { html:t.L + " for " + t.d + ", " + low(R) + " for " + t.r, fb:"Use the same letter for both alleles of a gene, usually the first letter of the dominant trait." }],
        workHtml:"<p>Choose one letter for the gene (usually from the dominant trait): " + B(t.L) + " for the dominant allele (" + t.d + ") and " + B(l) + " for the recessive allele (" + t.r + ").</p>",
        key:"One gene, one letter: capital = dominant, lowercase = recessive.", hint:"Alleles of the same gene share one letter." });
    } },

    /* ---- homozygous and heterozygous ---- */
    { id:"zy-classify", skill:"zygosity", level:1, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS), n:ri(0, 2) }), x => "zc" + x.t.L + x.n + x.t.org), g = geno(x.t.L, x.n);
      const names = ["Homozygous recessive", "Heterozygous", "Homozygous dominant"];
      const why = ["two identical recessive alleles", "two different alleles", "two identical dominant alleles"];
      return Kit.mc({ promptHtml:"Which word describes the genotype " + GT(g) + "?", exprHtml:'<div class="display">' + GT(g) + "</div>",
        options:[2, 1, 0].map(n => n === x.n ? { html:names[n], correct:true } : { html:names[n], fb:names[n] + " means " + why[n] + ", but " + g + " has " + why[x.n] + "." }), keepOrder:true,
        workHtml:"<p>" + GT(g) + " has " + why[x.n] + ", so it is " + B(low(names[x.n])) + ".</p><p class=\"small\">Homo = same (TT or tt). Hetero = different (Tt).</p>",
        key:"Same letters = homozygous; different letters = heterozygous.", hint:"Are the two letters the same or different?" });
    } },
    { id:"zy-def", skill:"zygosity", level:1, make(ctx){ return fromBank(ctx, ZYG_BANK); } },
    { id:"zy-pure", skill:"zygosity", level:2, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS.filter(t => !t.human)), v:ri(0, 3) }), x => "zp" + x.t.gene + x.t.org + x.v), t = x.t;
      const AA = geno(t.L, 2), Aa = geno(t.L, 1), aa = geno(t.L, 0);
      const V = [
        ["Pure-breeding " + t.org + " with the phenotype " + B(t.d) + " have which genotype?", AA, [[Aa, "Heterozygous organisms are not pure-breeding: they can pass on either allele."], [aa, aa + " shows " + t.r + ", not " + t.d + "."]]],
        ["Pure-breeding " + t.org + " with the phenotype " + B(t.r) + " have which genotype?", aa, [[Aa, "Heterozygous organisms show " + t.d + " and are not pure-breeding."], [AA, AA + " shows " + t.d + "."]]],
        ["Which genotype is NOT pure-breeding?", Aa, [[AA, AA + " is homozygous, so all its gametes carry " + t.L + ": it is pure-breeding."], [aa, aa + " is homozygous, so all its gametes carry " + low(t.L) + ": it is pure-breeding."]]],
        ["Which genotype carries the allele for " + t.r + " but shows " + t.d + "?", Aa, [[AA, AA + " has no recessive allele."], [aa, aa + " shows " + t.r + "."]]]][x.v];
      return mcq(intro(t) + " " + V[0], GT(V[1]), V[2].map(w => [GT(w[0]), w[1]]),
        "<p>Pure-breeding means <b>homozygous</b> (" + AA + " or " + aa + "): every gamete carries the same allele. " + Aa + " is heterozygous, so it can pass on either allele and hides the recessive one.</p>",
        "Pure-breeding = homozygous; a hidden recessive allele = heterozygous.", "Homozygous organisms always pass on the same allele.");
    } },

    /* ---- Punnett squares ---- */
    { id:"pu-fill", skill:"punnett", level:1, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS), [p1, p2] = pickCross(t, [[2, 1], [2, 0], [1, 1], [1, 0]]); return { t, p1, p2, i:ri(0, 1), j:ri(0, 1) }; }, x => "pf" + x.t.L + x.p1 + x.p2 + x.i + x.j);
      const { t, p1, p2, i, j } = x, ans = cross(p1, p2).cells[i][j];
      return Kit.mc({ promptHtml:intro(t) + " A parent with genotype " + GT(p1) + " is crossed with a parent with genotype " + GT(p2) + ". Which genotype goes in the box marked ?", exprHtml:square(p1, p2, [i, j]),
        options:[2, 1, 0].map(n => geno(t.L, n)).map(g => g === ans ? { html:GT(g), correct:true } : { html:GT(g), fb:"Take the allele at the start of the row (" + p1[i] + ") and the allele at the top of the column (" + p2[j] + "). Together they make " + ans + ", not " + g + "." }),
        keepOrder:true,
        workHtml:"<p>The box is in row " + B(p1[i]) + " and column " + B(p2[j]) + ", so it gets one allele from each: " + p1[i] + " + " + p2[j] + " = " + GT(ans) + " (capital letter first).</p>" + square(p1, p2),
        key:"Each box gets one allele from its row and one from its column.", hint:"Look at the letter at the start of the row and the letter at the top of the column.",
        meta:{ kind:"fill", p1, p2, i, j, ans } });
    } },
    { id:"pu-read", skill:"punnett", level:1, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS), [p1, p2] = pickCross(t, [[2, 1], [2, 0], [1, 1], [1, 0], [1, 1]]); return { t, p1, p2, rec:ri(0, 1) }; }, x => "pr" + x.t.gene + x.t.org + x.p1 + x.p2 + x.rec);
      const { t, p1, p2, rec } = x, k = cross(p1, p2).counts, boxes = rec ? k[0] : k[1] + k[2], ans = boxes * 25, ph = rec ? t.r : t.d;
      return { type:"num", promptHtml:intro(t) + " This Punnett square shows the cross " + crossName(p1, p2) + ". What percentage of the " + kids(t) + " are expected to have the phenotype " + B(ph) + "?",
        exprHtml:square(p1, p2), answer:ans, suf:"%",
        workHtml:"<p>" + (rec ? "Only " + geno(t.L, 0) + " boxes show " + t.r : "Boxes with at least one " + t.L + " show " + t.d) + ". There " + (boxes === 1 ? "is 1 such box" : "are " + boxes + " such boxes") + " out of 4, and each box is 25%: " + boxes + " × 25 = " + B(ans + "%") + ".</p>",
        key:"Each box of a Punnett square is a 25% chance.", hint:"Count the boxes that give this phenotype. Each box is 1 out of 4.",
        mistakes:[{ when:{ v:100 - ans }, msg:"That is the percentage for the other phenotype." }, { when:{ v:boxes }, msg:"You counted boxes. Turn it into a percentage: each box is 25%." }].filter(m => m.when.v !== ans),
        meta:{ kind:"prob", p1, p2, target:rec ? "r" : "d", answer:ans } };
    } },
    { id:"pu-prob", skill:"punnett", level:2, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS), [p1, p2] = pickCross(t, MID); return { t, p1, p2, ask:ri(0, 3) }; }, x => "pp" + x.t.gene + x.t.org + x.p1 + x.p2 + x.ask);
      const { t, p1, p2 } = x, k = cross(p1, p2).counts;
      let target, what, ans;
      if (x.ask === 0) { target = "d"; what = "the phenotype " + B(t.d); ans = (k[2] + k[1]) * 25; }
      else if (x.ask === 1) { target = "r"; what = "the phenotype " + B(t.r); ans = k[0] * 25; }
      else if (x.ask === 2) { target = "g1"; what = "the heterozygous genotype " + GT(geno(t.L, 1)); ans = k[1] * 25; }
      else { const n = pick([2, 0]); target = "g" + n; what = "the genotype " + GT(geno(t.L, n)); ans = k[n] * 25; }
      const mistakes = [{ when:{ v:100 - ans }, msg:"That is the chance of the opposite outcome. Re-count the boxes that match the question." }];
      if (ans) mistakes.push({ when:{ v:ans / 100 }, msg:"Right idea, but give it as a percentage: multiply by 100." });
      return { type:"num", promptHtml:intro(t) + " Two parents are crossed: " + crossName(p1, p2) + ". What is the probability that one " + kid(t) + " has " + what + "? Give your answer as a percentage.",
        answer:ans, suf:"%", workHtml:pWork(t, p1, p2) + "<p>Matching boxes: " + ans / 25 + " out of 4, so " + B(ans + "%") + ".</p>",
        key:"Draw the square, count matching boxes, and multiply by 25%.", hint:"Draw the 2 × 2 Punnett square first.",
        mistakes:mistakes.filter(m => m.when.v !== ans), meta:{ kind:"prob", p1, p2, target, answer:ans } };
    } },
    { id:"pu-gratio", skill:"punnett", level:2, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS), [p1, p2] = pickCross(t, MID); return { t, p1, p2 }; }, x => "pg" + x.t.L + x.t.org + x.p1 + x.p2);
      const { t, p1, p2 } = x, L = t.L, correct = genoRatio(L, cross(p1, p2).counts);
      const others = [];
      ALL_CROSSES.forEach(c => { const a = geno(L, c[0]), b = geno(L, c[1]), r = genoRatio(L, cross(a, b).counts); if (r !== correct && !others.some(o => o[0] === r)) others.push([r, "That would come from the cross " + a + " × " + b + "."]); });
      others.push(["3 " + geno(L, 2) + " : 1 " + geno(L, 0), "This mixes up genotypes with the 3 : 1 phenotype ratio. Heterozygous offspring must be counted too."]);
      const wr = shuffle(others).slice(0, 3);
      return mcq(intro(t) + " What is the expected genotype ratio of the " + kids(t) + " from the cross " + crossName(p1, p2) + "?", correct, wr,
        pWork(t, p1, p2), "Genotype ratio counts each genotype separately: AA, Aa and aa.", "Draw the square and count each genotype.",
        { meta:{ kind:"gratio", p1, p2, L, answer:correct } });
    } },
    { id:"pu-pratio", skill:"punnett", level:2, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS), [p1, p2] = pickCross(t, MID); return { t, p1, p2 }; }, x => "pq" + x.t.gene + x.t.org + x.p1 + x.p2);
      const { t, p1, p2 } = x, L = t.L, k = cross(p1, p2).counts, correct = phenoRatio(t, k);
      const pool = [["all " + t.d, "All " + t.d + " needs at least one parent to be " + geno(L, 2) + "."],
        ["3 " + t.d + " : 1 " + t.r, "3 : 1 comes from " + geno(L, 1) + " × " + geno(L, 1) + "."],
        ["1 " + t.d + " : 1 " + t.r, "1 : 1 comes from " + geno(L, 1) + " × " + geno(L, 0) + "."],
        ["all " + t.r, "All " + t.r + " needs both parents to be " + geno(L, 0) + "."],
        ["1 " + t.d + " : 3 " + t.r, "With one gene and a dominant allele, no cross gives more recessive than dominant offspring unless all are recessive."],
        ["1 " + geno(L, 2) + " : 2 " + geno(L, 1) + " : 1 " + geno(L, 0), "That is a genotype ratio. The question asks for phenotypes."]].filter(o => o[0] !== correct);
      return mcq(intro(t) + " What is the expected phenotype ratio of the " + kids(t) + " from the cross " + crossName(p1, p2) + "?", correct, shuffle(pool).slice(0, 3),
        pWork(t, p1, p2), "Phenotype ratio: group AA and Aa together, because they look the same.", "Draw the square. Which boxes show the dominant phenotype?",
        { meta:{ kind:"pratio", p1, p2, L, d:t.d, r:t.r, answer:correct } });
    } },
    { id:"pu-back", skill:"punnett", level:3, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS.filter(t => !t.human)), v:ri(0, 2), N:pick([160, 200, 240, 320, 400, 480, 600, 800]) }), x => "pb" + x.t.gene + x.t.org + x.v);
      const { t, v, N } = x, L = t.L, AA = geno(L, 2), Aa = geno(L, 1), aa = geno(L, 0);
      const k = Math.floor(N / 80), noise = ri(-k, k);
      const d = v === 0 ? 3 * N / 4 + noise : v === 1 ? N / 2 + noise : 0, r = N - d;
      const ans = v === 0 ? [Aa, Aa] : v === 1 ? [Aa, aa] : [aa, aa];
      const cand = [[AA, aa], [AA, Aa], [Aa, Aa], [Aa, aa], [aa, aa], [AA, AA]].filter(c => !(c[0] === ans[0] && c[1] === ans[1]));
      const label = c => phenoRatio(t, cross(c[0], c[1]).counts);
      const wr = shuffle(cand).slice(0, 3).map(c => [c[0] + " × " + c[1], c[0] + " × " + c[1] + " would give " + label(c) + "."]);
      const desc = v === 2 ? "All " + N + " offspring had the phenotype " + B(t.r) + "." : "Of " + N + " offspring, " + d + " had the phenotype " + B(t.d) + " and " + r + " had the phenotype " + B(t.r) + ".";
      const ratioTxt = v === 0 ? "about 3 : 1" : v === 1 ? "about 1 : 1" : "all recessive";
      return Kit.mc({ promptHtml:intro(t) + " Two " + t.org + " were crossed. " + desc + " Which cross best explains these results?",
        options:[{ html:ans[0] + " × " + ans[1], correct:true }].concat(wr.map(w => ({ html:w[0], fb:w[1] }))),
        workHtml:"<p>The results are " + B(ratioTxt) + ". " + (v === 0 ? "A 3 : 1 ratio means both parents must carry the recessive allele and show the dominant phenotype: both are " + Aa + "."
          : v === 1 ? "A 1 : 1 ratio is what you get when a heterozygous parent is crossed with a homozygous recessive one." : "If every offspring is recessive, neither parent can have a dominant allele.") + "</p>" + pWork(t, ans[0], ans[1]),
        key:"3 : 1 means Aa × Aa; 1 : 1 means Aa × aa; all recessive means aa × aa.", hint:"Simplify the numbers to a ratio first, then match it to a cross.",
        lesson:3, meta:{ kind:"back", L, d, r, answer:ans, wrong:wr.map(w => w[0].split(" × ")) } });
    } },
    { id:"pu-test", skill:"punnett", level:3, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS.filter(t => t.one)), v:ri(0, 1), N:pick([20, 24, 30, 36, 40, 48, 60]) }), x => "pt" + x.t.gene + x.t.org + x.v);
      const { t, v, N } = x, AA = geno(t.L, 2), Aa = geno(t.L, 1), aa = geno(t.L, 0), half = N / 2 + ri(-2, 2);
      const res = v ? "Of the " + N + " offspring, " + half + " have the phenotype " + B(t.d) + " and " + (N - half) + " have the phenotype " + B(t.r) + "." : "All " + N + " offspring have the phenotype " + B(t.d) + ".";
      const ans = v ? Aa : AA;
      return Kit.mc({ promptHtml:intro(t) + " To find the genotype of " + t.one[0] + ", it is crossed with " + t.one[1] + " (" + aa + "). " + res + " What is the genotype of " + t.one[0].replace(/^a /, "the ") + "?",
        options:[{ html:GT(ans), correct:true }, { html:GT(v ? AA : Aa), fb:v ? AA + " × " + aa + " gives only " + Aa + " offspring, so none could show " + t.r + "." : "If it were " + Aa + ", about half the offspring would show " + t.r + "." },
          { html:GT(aa), fb:"It shows " + t.d + ", so it must have at least one dominant allele." }],
        workHtml:"<p>This is a <b>test cross</b>: cross the unknown with a homozygous recessive (" + aa + ").</p>" + pWork(t, ans, aa) +
          "<p>" + (v ? "Recessive offspring appeared, so the unknown parent must have given a " + low(t.L) + " allele: it is " + B(Aa) + "." : "No recessive offspring appeared in a large sample, so the unknown parent is almost certainly " + B(AA) + ".") + "</p>",
        key:"Test cross: any recessive offspring means the unknown parent is heterozygous.", hint:"What would each possible genotype give when crossed with " + aa + "?",
        lesson:3, meta:{ kind:"test", L:t.L, d:v ? half : N, r:v ? N - half : 0, answer:ans } });
    } },
    { id:"pu-count", skill:"punnett", level:3, make(ctx){
      const x = fresh(ctx, () => { const t = pick(TRAITS.filter(t => !t.human)), [p1, p2] = pickCross(t, [[1, 1], [1, 0], [2, 1]]); return { t, p1, p2, ask:ri(0, 2), N:pick([40, 80, 120, 160, 200, 240, 360, 400, 480, 600]) }; }, x => "pc" + x.t.gene + x.t.org + x.p1 + x.p2 + x.ask);
      const { t, p1, p2, N } = x, k = cross(p1, p2).counts;
      let boxes, what, target;
      if (x.ask === 0) { boxes = k[2] + k[1]; what = "the phenotype " + B(t.d); target = "d"; }
      else if (x.ask === 1) { boxes = k[0]; what = "the phenotype " + B(t.r); target = "r"; }
      else { boxes = k[1]; what = "the heterozygous genotype " + GT(geno(t.L, 1)); target = "g1"; }
      if (!boxes) { boxes = k[2] + k[1]; what = "the phenotype " + B(t.d); target = "d"; }
      const ans = N * boxes / 4;
      return { type:"num", promptHtml:intro(t) + " A cross " + crossName(p1, p2) + " produces " + N + " offspring. About how many would you expect to have " + what + "?",
        answer:ans, workHtml:pWork(t, p1, p2) + "<p>Probability = " + boxes + "/4. Expected number = " + boxes + "/4 × " + N + " = " + B(ans) + ".</p>",
        key:"Expected number = probability × total number of offspring.", hint:"Find the probability from the Punnett square, then multiply by " + N + ".",
        mistakes:[{ when:{ v:N - ans }, msg:"That is the expected number for the other outcome." }, { when:{ v:boxes * 25 }, msg:"That is the percentage. Now find that percentage of " + N + "." }].filter(m => m.when.v !== ans),
        lesson:3, meta:{ kind:"count", p1, p2, target, N, answer:ans } };
    } },
    { id:"pu-carriers", skill:"punnett", level:3, make(ctx){
      const x = fresh(ctx, () => ({ t:pick(TRAITS), v:ri(0, 3) }), x => "pk" + x.t.gene + x.t.org + x.v);
      const { t, v } = x, Aa = geno(t.L, 1), AA = geno(t.L, 2), aa = geno(t.L, 0);
      const story = (t.human ? "Two parents who both have the phenotype " + B(t.d) + " have a child with the phenotype " + B(t.r) + "."
        : "Two " + t.org + " that both have the phenotype " + B(t.d) + " produce an offspring with the phenotype " + B(t.r) + ".");
      const base = "<p>The " + kid(t) + " is " + aa + ", so it received one " + low(t.L) + " allele from <b>each</b> parent. Both parents show " + t.d + ", so each must also have a dominant allele (" + t.L + "): both are " + B(Aa) + ".</p>" + pWork(t, Aa, Aa);
      const key = "Two dominant-looking parents with a recessive offspring must both be heterozygous.";
      if (v === 0) return Kit.mc({ promptHtml:intro(t) + " " + story + " What are the genotypes of the parents?",
        options:[{ html:GT(Aa) + " and " + GT(Aa), correct:true }, { html:GT(AA) + " and " + GT(Aa), fb:"A parent with genotype " + AA + " can only pass on " + t.L + ", so the " + kid(t) + " could not be " + aa + "." },
          { html:GT(AA) + " and " + GT(AA), fb:"Neither parent would have a recessive allele to pass on." }, { html:GT(aa) + " and " + GT(aa), fb:"Then both parents would show " + t.r + ", not " + t.d + "." }],
        workHtml:base, key, hint:"Where did each of the offspring's two recessive alleles come from?", lesson:3, meta:{ kind:"carriers", L:t.L, answer:[Aa, Aa] } });
      const ask = [null, ["the phenotype " + B(t.r), 25, "r"], ["the phenotype " + B(t.d), 75, "d"], ["the genotype " + GT(Aa), 50, "g1"]][v];
      return { type:"num", promptHtml:intro(t) + " " + story + " What is the probability that their next " + kid(t) + " has " + ask[0] + "? Give your answer as a percentage.",
        answer:ask[1], suf:"%", workHtml:base + "<p>So the probability is " + B(ask[1] + "%") + ". Each " + kid(t) + " is a new, independent chance: earlier " + kids(t) + " do not change it.</p>",
        key, hint:"First work out the parents' genotypes, then draw the square.",
        mistakes:[{ when:{ v:100 - ask[1] }, msg:"That is the probability of the opposite outcome." }, { when:{ v:ask[1] / 100 }, msg:"Give it as a percentage: multiply by 100." }].filter(m => m.when.v !== ask[1]),
        lesson:3, meta:{ kind:"prob", p1:Aa, p2:Aa, target:ask[2], answer:ask[1] } };
    } },

    /* ---- diploid and haploid ---- */
    { id:"pl-def", skill:"ploidy", level:1, make(ctx){ return fromBank(ctx, PLOIDY_BANK); } },
    { id:"pl-human", skill:"ploidy", level:1, make(ctx){
      const x = fresh(ctx, () => { const hap = ri(0, 2) === 0; return { hap, cell:pick(hap ? HUMAN_HAP : HUMAN_DIP), mc:ri(0, 1) }; }, x => "ph" + x.cell + x.mc);
      const ans = x.hap ? 23 : 46;
      const work = "<p>A human " + x.cell + " is " + (x.hap ? "a gamete, so it is <b>haploid</b>: one set of 23 chromosomes." : "a body cell (not a gamete), so it is <b>diploid</b>: two sets, 46 chromosomes (23 pairs).") + "</p>";
      if (x.mc) return mcq("Is " + aOrAn("human " + x.cell) + " haploid or diploid?", x.hap ? "Haploid (23 chromosomes)" : "Diploid (46 chromosomes)",
        [[x.hap ? "Diploid (46 chromosomes)" : "Haploid (23 chromosomes)", x.hap ? "Gametes have half the usual number: one set of 23." : "Only gametes are haploid. This cell has the full 46."], ["Triploid (69 chromosomes)", "Normal human cells are not triploid."]],
        work, "Gametes are haploid (23); body cells and zygotes are diploid (46).", "Is it a gamete (sperm or egg)?");
      return { type:"num", promptHtml:"How many chromosomes are in " + aOrAn("human " + x.cell) + "?", answer:ans, workHtml:work,
        key:"Human body cells: 46 (diploid). Human gametes: 23 (haploid).", hint:"Is this cell a gamete (sperm or egg) or a body cell?",
        mistakes:[{ when:{ v:x.hap ? 46 : 23 }, msg:x.hap ? "46 is for body cells. Gametes have half: 23." : "23 is for gametes. This is a diploid cell with 46." }, { when:{ v:92 }, msg:"92 is double the diploid number. Human body cells have 46." }] };
    } },
    { id:"pl-other", skill:"ploidy", level:2, make(ctx){
      const x = fresh(ctx, () => ({ o:pick(ORGS.filter(o => o.n !== "human")), v:ri(0, 2) }), x => "po" + x.o.n + x.v);
      const { o, v } = x, n = o.c / 2, body = pick(BODY[o.kind]), gam = pick(GAM[o.kind]);
      let prompt, ans, mis;
      if (v === 0) { prompt = Cap(aOrAn(o.n + " " + body)) + " has " + o.c + " chromosomes. How many chromosomes are in " + aOrAn(o.n + " " + gam) + "?"; ans = n; mis = [{ when:{ v:o.c * 2 }, msg:"Gametes have half the diploid number, not double." }, { when:{ v:o.c }, msg:"That is the diploid number. Gametes are haploid." }]; }
      else if (v === 1) { prompt = Cap(aOrAn(o.n + " " + gam)) + " has " + n + " chromosomes. How many chromosomes are in " + aOrAn(o.n + " " + body) + "?"; ans = o.c; mis = [{ when:{ v:n / 2 }, msg:"Body cells are diploid: double the gamete number." }, { when:{ v:n }, msg:"That is the haploid number of the gamete." }]; }
      else { prompt = Cap(aOrAn(o.n + " " + body)) + " has " + o.c + " chromosomes. How many <b>pairs</b> of chromosomes is that?"; ans = n; mis = [{ when:{ v:o.c * 2 }, msg:"A pair is two chromosomes, so divide by 2." }]; }
      return { type:"num", promptHtml:prompt, answer:ans,
        workHtml:"<p>For the " + o.n + ", 2n = " + o.c + " (diploid body cells) and n = " + n + " (haploid gametes, or the number of pairs).</p>",
        key:"Haploid n = half the diploid 2n; the number of pairs is also n.", hint:"Body cells are 2n, gametes are n.", mistakes:mis.filter(m => m.when.v !== ans) };
    } },
    { id:"pl-cycle", skill:"ploidy", level:2, make(ctx){
      const o = Kit.unique(ctx, ORGS.filter(o => o.kind !== "plant"), o => "pc" + o.n), n = o.c / 2;
      const items = ["Parent body cell (2n = " + o.c + ")", "Meiosis makes gametes (n = " + n + ")", "Fertilization: sperm and egg join", "Zygote (2n = " + o.c + ")", "Mitosis makes new body cells (2n = " + o.c + ")"];
      return Kit.order({ promptHtml:"Put these stages of the " + o.n + " life cycle in order.", inOrder:items, axis:["first", "last"],
        workHtml:"<p>Body cells (2n) undergo <b>meiosis</b> to make haploid gametes (n). <b>Fertilization</b> joins two gametes: n + n = 2n, the zygote. The zygote grows by <b>mitosis</b>, so every new body cell keeps 2n.</p>",
        key:"2n → meiosis → n gametes → fertilization → 2n zygote → mitosis → 2n body cells.", hint:"Gametes must be made before fertilization can happen." });
    } },
    { id:"pl-fert", skill:"ploidy", level:3, make(ctx){
      const x = fresh(ctx, () => ({ o:pick(ORGS), v:ri(0, 3) }), x => "pf" + x.o.n + x.v);
      const { o, v } = x, n = o.c / 2, who = o.kind === "plant" ? ["egg cell", "male gamete"] : ["egg", "sperm"];
      const V = [
        [Cap(aOrAn(o.n + " body cell")) + " has " + o.c + " chromosomes. How many of them were inherited from its " + (o.kind === "plant" ? "male parent (through pollen)" : "father") + "?", n,
          "Each parent gives one set through its gamete, so half of the " + o.c + " (that is " + n + ") came from that parent.", [{ when:{ v:o.c }, msg:"Only one set of chromosomes comes from each parent." }]],
        [Cap(aOrAn(o.n + " " + who[0])) + " and " + who[1] + " each have " + n + " chromosomes. After fertilization, the zygote divides by mitosis to form an embryo. How many chromosomes are in each embryo cell?", o.c,
          "Fertilization: " + n + " + " + n + " = " + o.c + ". Mitosis copies all of them into each new cell, so each embryo cell has " + o.c + ".", [{ when:{ v:n }, msg:"Mitosis does not halve the number; only meiosis does." }, { when:{ v:o.c * 2 }, msg:"Mitosis keeps the number the same; it does not double it." }]],
        ["Imagine " + o.n + " gametes were made by mitosis instead of meiosis, so they were diploid (" + o.c + " chromosomes). How many chromosomes would a zygote have?", o.c * 2,
          "Two diploid gametes would give " + o.c + " + " + o.c + " = " + o.c * 2 + ". That is why gametes must be haploid: so the number stays at " + o.c + ".", [{ when:{ v:o.c }, msg:"That is what happens with normal haploid gametes. Here each gamete has " + o.c + "." }]],
        [Cap(aOrAn(o.n + " " + who[0])) + " has " + n + " chromosomes. How many chromosomes are in the cells of the adult " + o.n + " that grows from the fertilized " + who[0] + "?", o.c,
          "The " + who[1] + " also brings " + n + ", so the zygote has " + o.c + ". The adult grows by mitosis, so its body cells keep " + o.c + ".", [{ when:{ v:n }, msg:"That is the gamete number. Fertilization adds the other parent's set." }]]][v];
      return { type:"num", promptHtml:V[0], answer:V[1], workHtml:"<p>" + V[2] + "</p>",
        key:"Gametes n + n = zygote 2n, and mitosis keeps 2n in every body cell.", hint:"Track n and 2n step by step.", mistakes:V[3].filter(m => m.when.v !== V[1]) };
    } },
    { id:"pl-why", skill:"ploidy", level:3, make(ctx){ return fromBank(ctx, PLOIDY_HARD); } },

    /* ---- Human Genome Project, inherited and acquired ---- */
    { id:"hg-fact", skill:"hgp", level:1, make(ctx){ return fromBank(ctx, HGP_BANK); } },
    { id:"hg-inh", skill:"hgp", level:1, make(ctx){
      const x = fresh(ctx, () => { const inh = ri(0, 1) === 1; return { inh, item:pick(inh ? INHERITED : ACQUIRED) }; }, x => "hi" + x.item);
      return Kit.mc({ promptHtml:"Is this trait inherited or acquired?", exprHtml:'<div class="display">' + x.item + "</div>",
        options:[{ html:"Inherited (passed on in DNA)", correct:x.inh }, { html:"Acquired (developed during life)", correct:!x.inh }].map(o => o.correct ? { html:o.html, correct:true } : { html:o.html, fb:x.inh ? "This trait is controlled by alleles passed on from the parents." : "This is gained during life through the environment or learning; it is not coded in DNA." }),
        keepOrder:true,
        workHtml:"<p>" + B(x.item) + " is " + (x.inh ? "<b>inherited</b>: it is determined by alleles passed from parents through gametes." : "<b>acquired</b>: it develops during life from experience, learning or the environment, and it cannot be passed on through genes.") + "</p>",
        key:"Inherited traits come from alleles; acquired traits develop during life and are not passed on.", hint:"Could a newborn have it, coded in its DNA?" });
    } },
    { id:"hg-pick", skill:"hgp", level:2, make(ctx){
      const x = fresh(ctx, () => ({ inh:ri(0, 1), a:pick(INHERITED), b:shuffle(ACQUIRED.slice()).slice(0, 3), c:pick(ACQUIRED), d:shuffle(INHERITED.slice()).slice(0, 3) }), x => "hp" + x.inh + (x.inh ? x.a : x.c));
      if (x.inh) return mcq("Which of these could a child inherit from a parent through genes?", x.a, x.b.map(s => [s, s + " is acquired during life, so it is not passed on through genes."]),
        "<p>" + B(x.a) + " is controlled by alleles, which are passed on in gametes. The others are acquired during a lifetime.</p>", "Only traits coded in DNA can be inherited.", "Which one is coded in DNA?");
      return mcq("Which of these is an acquired trait?", x.c, x.d.map(s => [s, s + " is controlled by alleles passed on from the parents, so it is inherited."]),
        "<p>" + B(x.c) + " develops during life, so it is acquired. The others are controlled by genes.</p>", "Acquired traits develop during life and are not coded in DNA.", "Which one was gained through experience or the environment?");
    } },
    { id:"hg-ethic", skill:"hgp", level:2, make(ctx){
      const x = fresh(ctx, () => ({ v:ri(0, 1), c:pick(CONCERNS), bs:shuffle(BENEFITS.slice()).slice(0, 3), b:pick(BENEFITS), cs:shuffle(CONCERNS.slice()).slice(0, 3) }), x => "he" + x.v + (x.v ? x.b : x.c));
      if (x.v === 0) return mcq("Which of these is an <b>ethical question</b> raised by the Human Genome Project, rather than a scientific benefit?", x.c,
        x.bs.map(s => [s, "This is a benefit: it helps medicine or science. An ethical question asks what is right or fair."]),
        "<p>" + B(x.c) + " is an ethical question: it is about privacy, fairness or what we should do. The others are benefits.</p>",
        "Benefits are what we can do with the genome; ethical questions are about what we should do.", "Look for a question about right, wrong, fairness or privacy.");
      return mcq("Which of these is a <b>benefit</b> of the Human Genome Project?", x.b,
        x.cs.map(s => [s, "This is an ethical question or concern, not a benefit."]),
        "<p>" + B(x.b) + " is a benefit to medicine or science. The others are ethical questions.</p>",
        "Benefits are what we can do with the genome; ethical questions are about what we should do.", "Which one helps medicine or science?");
    } },
    { id:"hg-history", skill:"hgp", level:2, make(){
      const ev = shuffle(HISTORY.slice()).slice(0, 4).sort((a, b) => a[1] - b[1]);
      return Kit.order({ promptHtml:"Put these events in the history of genetics in time order.", inOrder:ev.map(e => e[0]), axis:["earliest", "latest"],
        workHtml:"<p>" + ev.map(e => B(e[1]) + ": " + e[0]).join("<br>") + "</p>",
        key:"Mendel 1866 → DNA isolated 1869 → double helix 1953 → HGP 1990 to 2003.", hint:"The Human Genome Project needed the double helix to be known first." });
    } },
    { id:"hg-hard", skill:"hgp", level:3, make(ctx){ return fromBank(ctx, HGP_HARD); } }
  ];

  /* ========== lessons ========== */
  T.lessons = [
    { title:"DNA, genes and chromosomes", heading:"DNA is a code stored in chromosomes", html:`
<p><b>DNA</b> (deoxyribonucleic acid) is the molecule that carries the instructions for building and running a living thing. It is found in the <b>nucleus</b> of each cell.</p>
<div class="visual">
<svg viewBox="0 0 520 120" width="100%" style="max-width:520px" role="img" aria-label="Nested sizes: cell contains nucleus contains chromosome contains gene contains base pairs">
<rect x="4" y="4" width="512" height="112" rx="16" style="fill:none;stroke:var(--blue);stroke-width:2"/>
<text x="18" y="26" style="fill:var(--blue);font-size:14px;font-weight:700">Cell</text>
<rect x="70" y="16" width="436" height="90" rx="40" style="fill:none;stroke:var(--teal);stroke-width:2"/>
<text x="90" y="64" style="fill:var(--teal);font-size:14px;font-weight:700">Nucleus</text>
<rect x="170" y="38" width="320" height="44" rx="22" style="fill:none;stroke:var(--red);stroke-width:2"/>
<text x="182" y="64" style="fill:var(--red);font-size:13px;font-weight:700">Chromosome</text>
<rect x="282" y="46" width="196" height="28" rx="8" style="fill:var(--hi);stroke:var(--ink);stroke-width:1.5"/>
<text x="292" y="65" style="fill:var(--ink);font-size:13px">Gene: A–T C–G G–C</text>
</svg>
<p class="small muted">Smallest to largest: base pair → gene → chromosome → nucleus → cell.</p>
</div>
<div class="three">
<div class="rule"><span class="name">DNA</span><p class="small">A <b>double helix</b>: two strands twisted like a spiral ladder. The rungs are pairs of <b>bases</b>.</p></div>
<div class="rule"><span class="name">Gene</span><p class="small">A <b>section of DNA</b> that codes for one protein. The protein affects a characteristic.</p></div>
<div class="rule"><span class="name">Chromosome</span><p class="small">One long DNA molecule coiled around proteins. It carries <b>many genes</b>. Human body cells have 46.</p></div>
</div>
<h3>Base pairing</h3>
<p>There are four bases: adenine (A), thymine (T), cytosine (C) and guanine (G). They always pair the same way, and the <b>order</b> of the bases is the code.</p>
<div class="rule"><span class="name">Base-pairing rule</span><div class="law">A – T &nbsp;&nbsp; C – G</div></div>
<h3>Worked example</h3>
<p>Strand: <span class="num">A T T G C A</span>. Swap each base for its partner: <span class="num">T A A C G T</span>.</p>
<p>Because the bases pair up, a DNA sample always has %A = %T and %C = %G. If A is 30%, then T is 30%, which leaves 40% for C and G: 20% each.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">A gene is not a chromosome: a chromosome carries many genes. A pairs with T (not G). The genome is all of an organism's DNA.</p></div>` },
    { title:"Alleles", heading:"Alleles decide what you see", html:`
<p>Genes come in different versions called <b>alleles</b>. The pea height gene has a tall allele and a short allele. Body cells have <b>two alleles</b> of each gene: one from each parent.</p>
<div class="two">
<div class="rule"><span class="name">Dominant allele</span><p class="small">Shows its effect even with <b>one copy</b>. Written with a capital letter: <span class="num">T</span>.</p></div>
<div class="rule"><span class="name">Recessive allele</span><p class="small">Only shows with <b>two copies</b>. Written with the same letter in lowercase: <span class="num">t</span>.</p></div>
</div>
<h3>Genotype and phenotype</h3>
<p>The <b>genotype</b> is the pair of alleles (the letters). The <b>phenotype</b> is the characteristic you can observe.</p>
<div class="tblwrap"><table class="tbl">
<tr><th>Genotype</th><th>Name</th><th>Phenotype (pea height)</th></tr>
<tr><td class="num">TT</td><td>homozygous dominant</td><td>tall</td></tr>
<tr><td class="num">Tt</td><td>heterozygous</td><td>tall</td></tr>
<tr><td class="num">tt</td><td>homozygous recessive</td><td>short</td></tr>
</table></div>
<p><b>Homo</b> means same (TT, tt); <b>hetero</b> means different (Tt). A homozygous organism is <b>pure-breeding</b>: all its gametes carry the same allele. A heterozygous person with a recessive allele for a condition is a <b>carrier</b>.</p>
<div class="warn"><span class="name">Common mistakes</span><p class="small">Dominant does not mean "more common" or "stronger". Use one letter for both alleles (T and t, not T and S). Write the capital first: Tt, not tT. TT and Tt look the same, so you cannot always read the genotype from the phenotype.</p></div>` },
    { title:"Punnett squares", heading:"A Punnett square shows every possible offspring", html:`
<p>A <b>Punnett square</b> predicts the offspring of a cross between two parents for one gene.</p>
<ol class="steps">
<li><div><div class="m">Write a key</div><p class="why">T = tall (dominant), t = short (recessive).</p></div></li>
<li><div><div class="m">Write the parents' genotypes</div><p class="why">Example: Tt × Tt.</p></div></li>
<li><div><div class="m">Split each parent into gametes</div><p class="why">Each gamete gets one allele: T or t. One parent goes on top, the other down the side.</p></div></li>
<li><div><div class="m">Fill in the four boxes</div><p class="why">Each box gets the allele from its row and its column. Capital first.</p></div></li>
<li><div><div class="m">Count genotypes and phenotypes</div><p class="why">Each box is 1 out of 4 = 25%.</p></div></li>
</ol>
<div class="visual">
<div class="tblwrap"><table class="tbl punnett"><tr><th></th><th>T</th><th>t</th></tr><tr><th>T</th><td>TT</td><td>Tt</td></tr><tr><th>t</th><td>Tt</td><td>tt</td></tr></table></div>
<p class="small">Tt × Tt: genotypes 1 TT : 2 Tt : 1 tt. Phenotypes 3 tall : 1 short. Chance of a short offspring = 1/4 = 25%.</p>
</div>
<div class="rule"><span class="name">Two kinds of ratio</span><p class="small"><b>Genotype ratio</b> counts TT, Tt and tt separately. <b>Phenotype ratio</b> groups TT with Tt because they look the same.</p></div>
<div class="warn"><span class="name">It is a probability</span><p class="small">The square shows chances, not exact numbers. Two Tt parents with four children will not always have exactly three tall and one short. Each child is a new 25% chance of tt.</p></div>` },
    { title:"Ratios and working backwards", heading:"Read a ratio and find the parents", html:`
<p>There are only six possible crosses for one gene. Learn their results and you can work in both directions.</p>
<div class="tblwrap"><table class="tbl">
<tr><th>Cross</th><th>Genotypes</th><th>Phenotypes</th></tr>
<tr><td class="num">TT × TT</td><td>all TT</td><td>all dominant</td></tr>
<tr><td class="num">TT × Tt</td><td>1 TT : 1 Tt</td><td>all dominant</td></tr>
<tr><td class="num">TT × tt</td><td>all Tt</td><td>all dominant</td></tr>
<tr><td class="num">Tt × Tt</td><td>1 TT : 2 Tt : 1 tt</td><td>3 dominant : 1 recessive</td></tr>
<tr><td class="num">Tt × tt</td><td>1 Tt : 1 tt</td><td>1 dominant : 1 recessive</td></tr>
<tr><td class="num">tt × tt</td><td>all tt</td><td>all recessive</td></tr>
</table></div>
<h3>Working backwards</h3>
<div class="two">
<div class="rule"><span class="name">Ratio clues</span><p class="small">About <b>3 : 1</b> → Tt × Tt.<br>About <b>1 : 1</b> → Tt × tt.<br>All recessive → tt × tt.</p></div>
<div class="rule"><span class="name">Test cross</span><p class="small">Cross a dominant-looking organism with tt. Any recessive offspring → it is <b>Tt</b>. All dominant (in a big sample) → it is <b>TT</b>.</p></div>
</div>
<h3>Worked example</h3>
<p>Two black guinea pigs have a white baby (bb). The baby got one b from each parent, and both parents are black, so both are <b>Bb</b>. Chance their next baby is white: Bb × Bb gives 1 out of 4, so 25%.</p>
<p>Expected numbers: probability × total. From Tt × Tt with 200 offspring, expect 1/4 × 200 = 50 short.</p>
<div class="warn"><span class="name">Common mistake</span><p class="small">Real counts are close to the ratio, not exact: 302 to 98 is "about 3 : 1". Simplify first, then match.</p></div>` },
    { title:"Diploid and haploid cells", heading:"Gametes carry half the chromosomes", html:`
<div class="two">
<div class="rule"><span class="name">Diploid (2n)</span><p class="small">Two sets of chromosomes, in pairs: one from each parent. All <b>body cells</b>. Human 2n = 46 (23 pairs).</p></div>
<div class="rule"><span class="name">Haploid (n)</span><p class="small">One set of chromosomes. <b>Gametes</b> (sperm and egg). Human n = 23.</p></div>
</div>
<h3>Why gametes are haploid</h3>
<p><b>Meiosis</b> halves the chromosome number to make gametes. At <b>fertilization</b> two gametes join: n + n = 2n. So the <b>zygote</b> has the same number as its parents. If gametes were diploid, the number would double every generation.</p>
<div class="rule"><span class="name">Life cycle</span><div class="law">2n → meiosis → n + n → fertilization → 2n zygote → mitosis → 2n</div></div>
<div class="tblwrap"><table class="tbl">
<tr><th>Organism</th><th>Body cell (2n)</th><th>Gamete (n)</th></tr>
<tr><td>Human</td><td class="num">46</td><td class="num">23</td></tr>
<tr><td>Fruit fly</td><td class="num">8</td><td class="num">4</td></tr>
<tr><td>Pea plant</td><td class="num">14</td><td class="num">7</td></tr>
<tr><td>Chimpanzee</td><td class="num">48</td><td class="num">24</td></tr>
<tr><td>Dog</td><td class="num">78</td><td class="num">39</td></tr>
</table></div>
<div class="warn"><span class="name">Common mistakes</span><p class="small">A zygote is diploid, not haploid. Mitosis (growth and repair) keeps 2n; only meiosis halves it. More chromosomes does not mean a more complex organism: a dog has 78.</p></div>` },
    { title:"Genome and traits", heading:"Reading the human genome", html:`
<h3>The Human Genome Project</h3>
<p>An international project that ran from <b>1990</b> and was declared complete in <b>2003</b>. Scientists read the order of the bases in human DNA and located the genes.</p>
<div class="three">
<div class="rule"><span class="name">Size</span><p class="small">About <b>3 billion</b> base pairs in one copy of the genome.</p></div>
<div class="rule"><span class="name">Genes</span><p class="small">About <b>20,000</b> protein-coding genes, fewer than many scientists expected.</p></div>
<div class="rule"><span class="name">Who</span><p class="small">Scientists in many countries, sharing their results publicly.</p></div>
</div>
<div class="two">
<div><h3>Benefits</h3><p class="small">Finding alleles linked to inherited diseases; genetic tests for early diagnosis; research into new treatments and medicines matched to a person's genes; understanding evolution and human ancestry.</p></div>
<div><h3>Ethical questions</h3><p class="small">Who can see your genetic data? Could employers or insurers discriminate? Should parents choose their children's genes? Should people be told about risks of diseases with no cure? Who owns the data?</p></div>
</div>
<h3>Inherited or acquired?</h3>
<div class="two">
<div class="rule"><span class="name">Inherited</span><p class="small">Controlled by alleles passed on in gametes: blood type, natural eye color, earlobe shape, cystic fibrosis.</p></div>
<div class="rule"><span class="name">Acquired</span><p class="small">Developed during life through the environment or learning: a scar, a suntan, the language you speak, riding a bike. <b>Not</b> passed on through genes.</p></div>
</div>
<div class="warn"><span class="name">Careful</span><p class="small">Many traits, such as height and body mass, are affected by <b>many genes and the environment</b>. Single-gene examples (pea height, cystic fibrosis) are the simplest cases.</p></div>` }
  ];
  T.introHtml = `<h2>Six ideas that win marks</h2>
<p class="muted">For a Criterion A test: learn the exact definitions, then practice using them on new examples.</p>
<div class="habits">
<div class="habit"><span class="hn">1</span><h3>Define precisely</h3><p class="small">Gene = section of DNA coding for a protein. Chromosome = long coiled DNA with many genes. Allele = version of a gene.</p></div>
<div class="habit"><span class="hn">2</span><h3>A–T, C–G</h3><p class="small">Pair bases one by one. In DNA, %A = %T and %C = %G.</p></div>
<div class="habit"><span class="hn">3</span><h3>Letters vs looks</h3><p class="small">Genotype is the letters (Tt). Phenotype is what you see (tall). TT and Tt look the same.</p></div>
<div class="habit"><span class="hn">4</span><h3>Draw the square</h3><p class="small">Every time: key, parents, gametes, four boxes, then count. Each box = 25%.</p></div>
<div class="habit"><span class="hn">5</span><h3>n and 2n</h3><p class="small">Body cells 2n (human 46), gametes n (23). Fertilization: n + n = 2n.</p></div>
<div class="habit"><span class="hn">6</span><h3>In the DNA?</h3><p class="small">Inherited traits come from alleles. Scars, tans and skills are acquired and are not passed on.</p></div>
</div>`;

  registerTopic(T);
})();

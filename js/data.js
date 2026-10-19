// ─────────────────────────────────────────────────────────────
//  Everything the page says lives here. Edit text in this file,
//  the layout in index.html / js/site.js picks it up.
// ─────────────────────────────────────────────────────────────
const GH = 'https://github.com/MoZainUlAbideen';

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/muhammad-zain-ul-abideen-nust/',
  github: GH,
  email: 'mu.zainulabideen@gmail.com',
  resume: 'resume/Muhammad-Zain-ul-Abideen-Resume.pdf',
  arena: 'https://m-zain-ul-abideen-portfolio.vercel.app/',
};

// Work section: each project becomes one stacking card.
// metric = the headline result shown large; shot = screenshot in assets/projects
export const PROJECTS = [
  {
    name: 'Earshot',
    kind: 'Speech + RAG',
    tagline: 'Ask any podcast a question and hear the exact moment it was answered.',
    metric: { from: '0.76', to: '0.93', label: 'recall@5 with a reranker over 875 passages' },
    points: [
      'Transcribes episodes with Whisper large-v3-turbo (2.65% WER, 0.55 s worst word-timestamp error) and links every claim to the second it was said.',
      'Benchmarked keyword, vector, hybrid and reranked search; reranking won on recall but cost 1.35 s vs 69 ms, so hybrid ships and the trade-off is documented.',
      'A verbatim quote checker with one repair pass raised answered questions from 77.8% to 93.3%.',
    ],
    tech: ['Python', 'Whisper', 'pgvector', 'Hybrid search'],
    live: 'https://earshot-ten-pi.vercel.app', repo: `${GH}/Earshot`,
    shot: 'assets/projects/earshot.jpg', tint: 'ember',
  },
  {
    name: 'Dehqan',
    kind: 'Computer vision',
    tagline: 'A crop doctor for Pakistani farmers that tells you when it is not sure.',
    metric: { from: '11.5%', to: '47.4%', label: 'accuracy on real field photos (lab: 95.5%)' },
    points: [
      '27-condition, 14-crop leaf-disease classifier with its lab-to-field gap measured and published, not hidden.',
      'Selective prediction defers to extension offices below 0.9 confidence (79% accuracy on answered photos), plus a zero-shot CLIP leaf gate and a segmentation severity grader (81.5% vs 42% baseline).',
      'Routes English, Roman Urdu and Urdu questions (90% on a frozen test set) and refuses pesticide-dose requests (7/7).',
    ],
    tech: ['Python', 'PyTorch', 'CLIP', 'Segmentation'],
    live: 'https://dehqan.vercel.app', repo: `${GH}/Dehqan`,
    shot: 'assets/projects/dehqan.jpg', tint: 'field',
  },
  {
    name: 'Parity',
    kind: 'Agents + vision',
    tagline: 'An AI web-accessibility auditor that finds, explains and fixes WCAG 2.2 issues.',
    metric: { from: '54%', to: '24/24', label: 'recall on a labelled benchmark, zero false alarms' },
    points: [
      'Combines axe-core in headless Chromium, a pixel-based contrast meter, a keyboard-navigation agent and a Gemini vision agent that rewrites faulty alt text.',
      'Consistency checks lifted vision-agent precision from 80% to 100%.',
      'FastAPI with a job queue, rate limits and SSRF protection; hybrid RAG over 1,092 W3C passages; 190+ tests.',
    ],
    tech: ['Python', 'FastAPI', 'Playwright', 'Gemini'],
    live: 'https://parity-iota-puce.vercel.app', repo: `${GH}/Parity`,
    shot: 'assets/projects/parity.jpg', tint: 'sky',
  },
  {
    name: 'Rehnuma',
    kind: 'Multimodal RAG',
    tagline: 'An Urdu/English copilot that audits Pakistani electricity bills.',
    metric: { to: '96.2%', label: 'field accuracy reading real bill photos · 0 invented numbers reached users' },
    points: [
      'A deterministic engine re-checks every figure a Gemini vision model reads and triggers targeted re-reads.',
      'Lexical hybrid RAG over 566 OCR’d regulatory clauses with a citation critic; query rewriting lifted Urdu top-5 retrieval from 0% to 83%.',
      '319 tests and 20 eval metrics gated in CI, Langfuse tracing with PII masking.',
    ],
    tech: ['Python', 'FastAPI', 'Next.js', 'Gemini'],
    live: 'https://rehnuma-kappa.vercel.app', repo: `${GH}/rehnuma`,
    shot: 'assets/projects/rehnuma.jpg', tint: 'dawn',
  },
  {
    name: 'EdgarIQ',
    kind: 'Multi-agent RAG',
    tagline: 'A grounded research copilot over live SEC filings.',
    metric: { from: '29%', to: '100%', label: 'golden-set accuracy after fixing wrong-quarter retrieval' },
    points: [
      'Planner → retriever → drafter → critic pipeline with a numeric checker that verifies every figure against the source text.',
      'Diagnosed a semantic-search failure that pulled near-identical filing periods, then fixed it with metadata-filtered hybrid retrieval.',
      'Eval harness with deterministic and LLM-as-judge grading, backed by 89 tests.',
    ],
    tech: ['Python', 'SEC EDGAR', 'Ollama', 'Groq'],
    live: 'https://edgar-iq-web.vercel.app', repo: `${GH}/Edgar_iq`,
    shot: 'assets/projects/edgariq.jpg', tint: 'dusk',
  },
  {
    name: 'Job Assistant',
    kind: 'RAG + browser extension',
    tagline: 'A Chrome extension and dashboard that scores how well your resume fits a job.',
    metric: null,
    points: [
      'Captures listings from your own LinkedIn / Indeed session and matches them semantically with sentence-transformers + FAISS.',
      'Fit score, gap analysis and grounded rewrite suggestions; auto-tailors a resume for jobs above 50% fit.',
    ],
    tech: ['FastAPI', 'Groq', 'FAISS', 'Chrome MV3'],
    repo: `${GH}/Job-Assistant-An-AI-Resume-Fit-Dashboard-Built-From-Scratch-FastAPI-Groq-RAG`,
    pipeline: ['Job listing', 'Embeddings + FAISS', 'Fit score & gaps', 'Tailored resume'],
    tint: 'stone',
  },
];

export const EXPERIENCE = [
  {
    role: 'Machine Learning Engineer Intern', org: 'RISETech', where: 'Islamabad, Pakistan', when: 'Jun – Aug 2025',
    points: [
      'Led feature extraction for a multi-sensor (vibration, magnetic, acoustic) vehicle classifier sorting passing traffic into LTV, HTV and no vehicle.',
      'Trained ensemble models (Random Forest, SVM, KNN, LDA, Extra Trees) that raised accuracy from 71% to 99%.',
      'Authored an IEEE-format research paper on the feature extraction method.',
    ],
  },
  {
    role: 'AI Engineer Intern', org: 'Software Productivity Strategists (SPS), NSTP', where: 'Islamabad, Pakistan', when: 'Jun – Aug 2024',
    points: [
      'Developed Python backend features for two flagship products: Business Management System and Cognitive Service Management.',
      'Deployed AI solutions on Microsoft Azure and improved analytics and reporting for a security system.',
    ],
  },
  {
    role: 'Collaborations Lead', org: 'WWF – Pakistan', where: 'Peshawar · Remote', when: 'Community work',
    href: 'https://www.linkedin.com/in/muhammad-zain-ul-abideen-nust/details/experience/',
    points: [
      'Led the collaborations team supporting WWF’s environmental education initiatives, promoting conservation and sustainable living through community engagement.',
    ],
  },
];

// From the current resume's Technical Skills
export const STACK = [
  ['LLM & Retrieval', ['RAG', 'Agentic workflows', 'Hybrid search (BM25, RRF)', 'Embeddings', 'Rerankers', 'Evals (Recall@k, MRR, LLM-as-judge)', 'Gemini', 'Groq', 'Langfuse']],
  ['ML & Vision', ['PyTorch', 'Scikit-learn', 'Image classification', 'Segmentation', 'CLIP', 'Selective prediction', 'Whisper']],
  ['Backend & Data', ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'REST APIs', 'SQLAlchemy', 'Playwright', 'Next.js']],
  ['MLOps & Cloud', ['Docker', 'GitHub Actions', 'CI/CD with eval gates', 'pytest', 'Git', 'Render', 'Vercel', 'Azure', 'GCP']],
];

export const CERTS = [
  { title: 'Google AI Professional Certificate', issuer: 'Google', href: 'https://www.coursera.org/account/accomplishments/professional-cert/certificate/V00M6JVIR24O' },
  { title: 'IBM AI Engineering Professional Certificate', issuer: 'IBM', href: 'https://www.coursera.org/account/accomplishments/specialization/0UEVNFVYBN8V' },
  { title: 'Advanced Machine Learning on Google Cloud', issuer: 'Google Cloud', href: 'https://www.coursera.org/account/accomplishments/specialization/8ZNO2FZQPFR5' },
  { title: 'IBM Machine Learning Professional Certificate', issuer: 'IBM', href: 'https://www.coursera.org/account/accomplishments/specialization/6AF4NKP5SG0W' },
  { title: 'Google Advanced Data Analytics', issuer: 'Google', href: 'https://www.coursera.org/account/accomplishments/specialization/2M7FIVKXPNCE' },
  { title: 'Google AI Essentials', issuer: 'Google', href: 'https://www.coursera.org/account/accomplishments/specialization/certificate/HFGV9W2AM02V' },
];

// "Beyond the code": left tabs, right accordion (like an FAQ)
export const BEYOND = [
  {
    id: 'sports', tab: 'Off the pitch', sub: 'Competitive sports fanatic',
    items: [
      { q: 'FC Barcelona', img: 'assets/life/fcb.png', photo: 'assets/life/player.jpg', photoAlt: 'Pedri in the FC Barcelona number 8 shirt',
        a: "The first complete football match I watched was the 2015 Champions League final, and I've never looked back since. It's a hard love affair with this team: they almost bottle the Champions League every year, but they dismantle Real Madrid three times a year.",
        quote: 'Never give up, sit down, or grieve, find another way!!', by: 'Pedri' },
      { q: 'Pakistan Cricket Team', img: 'assets/life/pak-star.png', photo: 'assets/life/player-akram.jpg', photoAlt: 'Wasim Akram celebrating a wicket',
        a: "This love affair has always been one-sided. Still can't believe how I end up seeing all their matches ball by ball. Some things are bigger than sports. After all, this is the only sport we play.",
        quote: 'First of all, convince yourself that you are the best, because the rest of your life is going to go proving this to others.', by: 'Wasim Akram' },
      { q: 'UFC', img: 'assets/life/ufc.png', photo: 'assets/life/player-khabib.jpg', photoAlt: 'Khabib Nurmagomedov at a UFC weigh-in',
        a: "My first ever experience was watching Khabib Nurmagomedov vs Conor McGregor in 2018. Since then I've followed the sport on and off, but always kept up with who the champions are in each division.",
        quote: 'Too much movies make your heart weak.', by: 'Khabib Nurmagomedov' },
      { q: 'Formula 1', img: 'assets/life/f1.png', photo: 'assets/life/player-alonso.jpg', photoAlt: 'Fernando Alonso in his Renault race suit',
        a: 'Only started following it closely recently, since playing the F1 video games on my PC, but I always knew a bit about F1.',
        quote: "I knew he'd hit the brakes. He has a wife and two kids at home, I don't.", by: 'Fernando Alonso' },
      { q: 'WWE · not competitive, but fascinating', img: 'assets/life/wwe.png', darkLogo: true, photo: 'assets/life/player-punk.jpg', photoAlt: 'CM Punk celebrating with the championship', wide: true,
        a: "Since childhood, I've always loved not only watching these scripted fights and the storytelling, but also practising them at home.",
        quote: "As long as you speak from your heart, you can't go wrong!!", by: 'CM Punk' },
    ],
  },
  {
    id: 'aspirations', tab: 'Aspirations', sub: 'Always climbing',
    items: [
      { q: 'Spain 2030', stadiums: [
          { img: 'assets/life/stadium-campnou.jpg', name: 'Spotify Camp Nou' },
          { img: 'assets/life/stadium-bernabeu.jpg', name: 'Santiago Bernabéu' },
          { img: 'assets/life/stadium-metropolitano.jpg', name: 'Metropolitano' },
        ],
        a: 'Spain co-hosts the 2030 FIFA World Cup with Portugal and Morocco, and I want to be there: in the stands, watching football live in these massive stadiums.' },
      { q: 'LeetCode', img: 'assets/life/leetcode.png',
        a: "Always got a bit jealous of these DSA freaks. I don't know if I'm going to ace this, but I practise LeetCode problems every other weekend.",
        link: { label: 'Follow along on GitHub', href: `${GH}/DSA_Python` } },
    ],
  },
  {
    id: 'vision', tab: 'The other portfolio', sub: 'Where this started',
    items: [
      { q: 'A Rocket League arena, driven by my desk toy', compare: 'assets/life/beyond-real-vs-game.jpg',
        a: "There's a small purple Mini 4WD on my desk, and every time I look at it, life resets. Rocket League is one of my all-time favourite games, so I rebuilt that car in 3D and made a football arena you can drive around, with the same work behind glowing podiums.",
        link: { label: 'Take it for a drive', href: 'https://m-zain-ul-abideen-portfolio.vercel.app/' } },
    ],
  },
];

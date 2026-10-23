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
// about = what it does in plain words; points = a little more detail; shot = screenshot in assets/projects
export const PROJECTS = [
  {
    name: 'Earshot',
    kind: 'Speech + RAG',
    tagline: 'Ask any podcast a question and hear the exact moment it was answered.',
    about: 'Type a question about a podcast and get a short answer back. Every quote in it links to the moment it was said, so one click plays the speaker saying it.',
    points: [
      'Turns hours of podcast audio into searchable text, with a timestamp on every word.',
      'Checks each quote word for word against the transcript before showing it, so nothing is made up.',
      'If the podcast never answered your question, it tells you so instead of guessing.',
    ],
    tech: ['Python', 'Whisper', 'pgvector', 'Hybrid search'],
    live: 'https://earshot-ten-pi.vercel.app', repo: `${GH}/Earshot`, note: 'notes/earshot-retrieval.html',
    shot: 'assets/projects/earshot.jpg', tint: 'ember',
  },
  {
    name: 'Dehqan',
    kind: 'Computer vision',
    tagline: 'A crop doctor for Pakistani farmers that tells you when it is not sure.',
    about: 'Photograph a sick leaf and Dehqan names the disease and what to do, in Urdu or English, by voice or text. When it isn’t sure, it says so and points the farmer to the local agriculture office.',
    points: [
      'Covers 13 crops, and is tested on real photos taken in fields, not just clean lab pictures.',
      'Turns away photos that aren’t leaves, and uses the live forecast to say when it’s safe to spray.',
      'Never answers pesticide-dose questions, because a wrong dose can do real harm.',
    ],
    tech: ['Python', 'PyTorch', 'CLIP', 'ONNX'],
    live: 'https://dehqan.vercel.app', repo: `${GH}/Dehqan`,
    shot: 'assets/projects/dehqan.jpg', tint: 'field',
  },
  {
    name: 'Parity',
    kind: 'Agents + vision',
    tagline: 'An AI web-accessibility auditor that finds, explains and fixes WCAG 2.2 issues.',
    about: 'Paste in a website link and Parity checks whether people with disabilities can use it, then explains each problem in plain words and suggests the fix.',
    points: [
      'Opens the site in a real browser and moves through it the way assistive technology would.',
      'An AI looks at each image and judges whether its description actually matches what’s shown.',
      'Every issue links back to the official accessibility rule it breaks.',
    ],
    tech: ['Python', 'FastAPI', 'Playwright', 'Gemini'],
    live: 'https://parity-iota-puce.vercel.app', repo: `${GH}/Parity`, note: 'notes/parity-doubt.html',
    shot: 'assets/projects/parity.jpg', tint: 'sky',
  },
  {
    name: 'Rehnuma',
    kind: 'Multimodal RAG',
    tagline: 'An Urdu/English copilot that audits Pakistani electricity bills.',
    about: 'Snap a photo of your electricity bill and Rehnuma re-checks every charge and tells you, in Urdu or English, if you were billed correctly. Ask about the rules and it quotes the exact regulation.',
    points: [
      'The sums are done by a calculator, not the AI, so the totals can be trusted.',
      'Works for homes with and without solar panels.',
      'Understands questions asked in Urdu as well as English.',
    ],
    tech: ['Python', 'FastAPI', 'Next.js', 'Gemini'],
    live: 'https://rehnuma-kappa.vercel.app', repo: `${GH}/rehnuma`, note: 'notes/rehnuma-cited-but-wrong.html',
    shot: 'assets/projects/rehnuma.jpg', tint: 'dawn',
  },
  {
    name: 'EdgarIQ',
    kind: 'Multi-agent RAG',
    tagline: 'A grounded research copilot over live SEC filings.',
    about: 'Ask about a US public company, like how its revenue changed last quarter, and EdgarIQ answers from its official SEC filings, showing the source for every figure.',
    points: [
      'Pulls filings straight from the SEC, so answers are never out of date.',
      'Separate AI steps plan the question, find the right pages, write the answer and then double-check it.',
      'Every number is checked against the filing before you see it.',
    ],
    tech: ['Python', 'SEC EDGAR', 'Ollama', 'Groq'],
    live: 'https://edgar-iq-web.vercel.app', repo: `${GH}/Edgar_iq`,
    shot: 'assets/projects/edgariq.jpg', tint: 'dusk',
  },
  {
    name: 'Dafa',
    kind: 'Legal RAG',
    tagline: 'Pakistan’s law, section by section, in English, Urdu or Roman Urdu.',
    about: 'Look up Pakistan’s Constitution or Penal Code in English, Urdu or Roman Urdu. Type “dafa 302” and the section opens straight away, with the official text and what it means in practice.',
    points: [
      'Shows the punishment, whether bail is allowed and which court hears the case, all on one page.',
      'Ask in everyday words and it finds the sections that apply.',
      'Every quote and penalty is checked against the official text, so it never misstates the law.',
    ],
    tech: ['Python', 'PyMuPDF', 'BM25', 'FastAPI'],
    live: 'https://dafa-ten.vercel.app', repo: `${GH}/Dafa`,
    shot: 'assets/projects/dafa.jpg', tint: 'teal',
  },
  {
    name: 'Job Assistant',
    kind: 'RAG + browser extension',
    tagline: 'A Chrome extension and dashboard that scores how well your resume fits a job.',
    about: 'Open a job on LinkedIn or Indeed and it tells you how well your resume fits, what’s missing and how to tailor it.',
    points: [
      'Gives each job a fit score and lists the skills you’re missing.',
      'Suggests resume changes that only use experience you actually have.',
      'Writes a tailored resume for jobs you’re a good match for.',
    ],
    tech: ['FastAPI', 'Groq', 'FAISS', 'Chrome MV3'],
    live: 'https://job-assistant-an-ai-resume-fit-dash.vercel.app/',
    shot: 'assets/projects/job-assistant.jpg',
    repo: `${GH}/Job-Assistant-An-AI-Resume-Fit-Dashboard-Built-From-Scratch-FastAPI-Groq-RAG`,
    pipeline: ['Job listing', 'Embeddings + FAISS', 'Fit score & gaps', 'Tailored resume'],
    tint: 'stone',
  },
];

export const EXPERIENCE = [
  {
    role: 'Machine Learning Engineer Intern', org: 'RISETech', logo: 'assets/logos/risetech.png', where: 'Islamabad, Pakistan', when: 'Jun – Aug 2025',
    points: [
      'Led feature extraction for a multi-sensor (vibration, magnetic, acoustic) vehicle classifier sorting passing traffic into LTV, HTV and no vehicle.',
      'Trained ensemble models (Random Forest, SVM, KNN, LDA, Extra Trees) that raised accuracy from 71% to 99%.',
      'Authored an IEEE-format research paper on the feature extraction method.',
    ],
  },
  {
    role: 'AI Engineer Intern', org: 'Software Productivity Strategists (SPS), NSTP', logo: 'assets/logos/sps.png', where: 'Islamabad, Pakistan', when: 'Jun – Aug 2024',
    points: [
      'Developed Python backend features for two flagship products: Business Management System and Cognitive Service Management.',
      'Deployed AI solutions on Microsoft Azure and improved analytics and reporting for a security system.',
    ],
  },
  {
    role: 'Collaborations Lead', org: 'WWF – Pakistan', logo: 'assets/logos/wwf.png', where: 'Peshawar · Remote', when: 'Community work',
    href: 'https://www.linkedin.com/in/muhammad-zain-ul-abideen-nust/details/experience/',
    points: [
      'Led the collaborations team supporting WWF’s environmental education initiatives, promoting conservation and sustainable living through community engagement.',
    ],
  },
  {
    role: 'Volunteer & Event Organizer', org: 'NUST Volunteers Club (NVC)', logo: 'assets/logos/nvc.png', where: 'NUST', when: 'University',
    points: [
      'Volunteered and organized numerous events under NVC, from debating competitions, award ceremonies and orientation ceremonies to farewells.',
    ],
  },
];

// From the current resume's Technical Skills
export const STACK = [
  ['LLM & Retrieval', ['RAG', 'Agentic workflows', 'Hybrid search (BM25, RRF)', 'Embeddings', 'Rerankers', 'Evals (Recall@k, MRR, LLM-as-judge)', 'Gemini', 'Groq', 'Langfuse'], ['Earshot', 'EdgarIQ', 'Rehnuma', 'Parity']],
  ['ML & Vision', ['PyTorch', 'Scikit-learn', 'Image classification', 'Segmentation', 'CLIP', 'ONNX Runtime', 'Selective prediction', 'Whisper'], ['Dehqan', 'Earshot', 'RISETech']],
  ['Backend & Data', ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'REST APIs', 'SQLAlchemy', 'Playwright', 'Next.js'], ['Earshot', 'Parity', 'Rehnuma', 'Job Assistant']],
  ['MLOps & Cloud', ['Docker', 'GitHub Actions', 'CI/CD with eval gates', 'pytest', 'Git', 'Render', 'Vercel', 'Azure', 'GCP'], ['Rehnuma', 'Earshot', 'SPS']],
];

// "How I build": each rule names the project where you can see it in the code
export const RULES = [
  { title: 'Measure before claiming.', body: 'Every number on this page comes from an eval on held-out data, run before the feature shipped.',
    proof: 'Earshot', fact: 'Five search designs scored on 45 paraphrased questions for recall, MRR and latency before one was picked.' },
  { title: 'Wrap the model in plain code.', body: 'A language model can invent a quote or a figure. A string match or an arithmetic check cannot be talked into accepting one.',
    proof: 'Rehnuma', fact: 'A deterministic engine re-checks every figure the vision model reads; zero invented numbers reached users.' },
  { title: 'Refuse rather than guess.', body: 'When confidence is low, the system says so and hands off, instead of producing a fluent wrong answer.',
    proof: 'Dehqan', fact: 'Defers to extension offices below 0.9 confidence and refuses pesticide-dose requests, 7 out of 7.' },
  { title: 'Publish the failure cases.', body: 'The gap between a demo and the real world is a result, so it goes in the README, not under the rug.',
    proof: 'Dehqan', fact: '95.5% in the lab, 61.6% on real field photos. Both numbers are on the project page.' },
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
        shots: [
          { src: 'assets/life/arena-dome-outside.jpg', alt: 'The arena from just under the glass dome, with the city skyline beyond it: the pitch, both goals, the podium booths, the crowd and the big screen' },
          { src: 'assets/life/arena-dome-inside.jpg', alt: 'Down on the pitch behind the purple car, the ball ahead and the city towers above the stands' },
          { src: 'assets/life/arena-wall.jpg', alt: 'The car driving up the curved glass wall, with the skyline behind it' },
          { src: 'assets/life/arena-city.jpg', alt: 'From above the city: the glass dome over the stadium, ringed by towers' },
        ],
        a: "Wanted to put Opus to work, so I asked it to build me a Rocket League-style video game. It made me this cracker of a thing anyway: my purple desk-toy Mini 4WD rebuilt in 3D, a glass-domed stadium, a red bot that takes 90 second matches far too seriously, and, somewhere between the goals, my actual work behind glowing podiums.",
        link: { label: 'Take it for a drive', href: 'https://m-zain-ul-abideen-portfolio.vercel.app/' } },
    ],
  },
];

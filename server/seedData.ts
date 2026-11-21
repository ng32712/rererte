export interface SeedProduct {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  productType: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  compareAtPrice?: number;
  priceNote?: string;
  isDemoProduct: boolean;
  featured: boolean;
  createdAt: string;
  cardBg: string;
  image: string;
  imageAlt: string;
  gallery: { src: string; alt: string; caption: string }[];
  whatsIncluded: string[];
  whoItIsFor: string[];
  benefits: string[];
  fileFormats: string[];
  compatibility: string[];
  faqs: { q: string; a: string }[];
  deliverableSummary: string;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: 'prod-solobiz-os',
    slug: 'solobiz-os',
    title: 'SoloBiz OS',
    subtitle: 'The simple business management system for independent professionals.',
    category: 'business-entrepreneurship',
    productType: 'Spreadsheet Workspace + Templates (.xlsx, Google Sheets, PDF)',
    shortDesc:
      'Manage your clients, quotes, invoices, payment follow-ups and business finances in one simple workspace.',
    fullDesc:
      'SoloBiz OS is designed for freelancers, consultants, and independent service providers who want clarity without subscribing to bloated CRM software. Everything lives in one structured workbook paired with clean, editable quote and invoice sheets plus a step-by-step setup guide.',
    price: 9,
    priceNote: 'Early-access test price (subject to validation)',
    isDemoProduct: false,
    featured: true,
    createdAt: '2026-11-10',
    cardBg: '#F7EDB8',
    image: '/assets/images/solobiz_os_showcase_1795209164172.jpg',
    imageAlt:
      'SoloBiz OS workspace open on laptop and tablet showing client tracker and financial overview',
    gallery: [
      {
        src: '/assets/images/solobiz_os_showcase_1795209164172.jpg',
        alt: 'SoloBiz OS Business Overview Dashboard on laptop',
        caption: 'Business Overview Dashboard & Revenue Summary',
      },
      {
        src: '/assets/images/cat_business_entrepreneurship_1795209165628.jpg',
        alt: 'Editable Quote & Invoice Templates on tablet and print',
        caption: 'Client Quote, Proposal & Invoice Templates',
      },
      {
        src: '/assets/images/craftedlabs_studio_story_1795209165556.jpg',
        alt: 'CraftedLabs digital product workspace setup',
        caption: 'Designed for calm daily operations',
      },
    ],
    whatsIncluded: [
      'Client & Lead Tracker (status pipeline, contact log, next follow-up date)',
      'Quote & Invoice Templates (auto-calculated totals, clean print/PDF export)',
      'Payment Follow-Up Tracker (overdue flags, reminder cadence log)',
      'Income & Expense Tracker (monthly categorization & net margin view)',
      'Business Overview Dashboard (revenue, outstanding invoices, top clients)',
      'Beginner Setup Guide (15-minute walkthrough in PDF & README)',
    ],
    whoItIsFor: [
      'Freelance designers, developers, writers, and independent consultants',
      'Solo studio founders managing 3-30 active client projects at a time',
      'Independent professionals replacing scattered notes and manual calculators',
    ],
    benefits: [
      'Track every lead, active quote, and unpaid invoice in under 5 minutes a day',
      'Zero monthly SaaS subscription fees — own your spreadsheet files outright',
      'Works offline in Excel or collaboratively in Google Sheets',
    ],
    fileFormats: ['.xlsx (Microsoft Excel)', 'Google Sheets Copy Link', 'Editable Invoice Docs', 'PDF Setup Guide'],
    compatibility: ['Microsoft Excel 2019+', 'Google Sheets (Free Account)', 'LibreOffice Calc', 'Apple Numbers (basic import)'],
    faqs: [
      {
        q: 'Do I need paid spreadsheet software to use SoloBiz OS?',
        a: 'No. You can duplicate the Google Sheets edition into any free Google account or open the .xlsx workbook in Excel or LibreOffice.',
      },
      {
        q: 'What is included in the $9 early-access edition?',
        a: 'You receive the core workbook tabs (Clients, Quotes & Invoices, Follow-ups, Income & Expenses, Overview Dashboard) and the Beginner Setup Guide. Because this is an early-access release, pricing and template extras are actively being validated.',
      },
      {
        q: 'Can I customize the currency (e.g. USD, RWF, EUR)?',
        a: 'Yes. The setup tab lets you switch the display currency symbol and formatting across all sheets.',
      },
    ],
    deliverableSummary:
      'Open the SoloBiz OS workbook, set your business name and currency in the Setup tab, log your first 3 leads in Client Tracker, and export your first PDF invoice.',
  },
  {
    id: 'prod-proposal-kit',
    slug: 'freelance-proposal-contract-kit',
    title: 'Freelance Proposal & Scope Kit',
    subtitle: 'Clear project proposals and milestone scopes that prevent scope creep.',
    category: 'business-entrepreneurship',
    productType: 'Document & Scope Templates (.docx, Google Docs, PDF)',
    shortDesc:
      'Demo catalog item: modular client proposal outlines, scope tables, and kickoff checklists for service businesses.',
    fullDesc:
      'A practical set of proposal and scope-of-work documents crafted to help independent professionals explain deliverables, timelines, and payment milestones in plain language.',
    price: 14,
    compareAtPrice: 19,
    isDemoProduct: true,
    featured: true,
    createdAt: '2026-11-04',
    cardBg: '#FFFDF7',
    image: '/assets/images/cat_business_entrepreneurship_1795209165628.jpg',
    imageAlt: 'Minimalist creative proposal and invoice sheets on a warm cream table',
    gallery: [
      {
        src: '/assets/images/cat_business_entrepreneurship_1795209165628.jpg',
        alt: 'Proposal and invoice layouts',
        caption: 'Editable Proposal & Scope Structure',
      },
    ],
    whatsIncluded: [
      '3-page Modular Client Proposal Template',
      'Statement of Work & Milestone Table',
      'Client Onboarding & Asset Request Checklist',
    ],
    whoItIsFor: [
      'Service freelancers tired of rewriting proposals from scratch',
      'Small studios standardizing client kickoff expectations',
    ],
    benefits: [
      'Clarifies revision limits and payment milestones before work starts',
      'Clean editorial layout ready to export as a crisp client PDF',
    ],
    fileFormats: ['.docx', 'Google Docs Template', 'PDF Reference'],
    compatibility: ['Google Docs', 'Microsoft Word', 'Apple Pages'],
    faqs: [
      {
        q: 'Is this a legal contract?',
        a: 'No — it provides plain-language scope and commercial terms templates for practical project alignment, not legal advice.',
      },
    ],
    deliverableSummary: 'Duplicate the proposal template, swap in your project milestones, and export to PDF.',
  },
  {
    id: 'prod-prompt-playbook',
    slug: 'prompt-architecture-playbook',
    title: 'Prompt Architecture Playbook',
    subtitle: 'Reusable system prompts and verification checklists for daily technical and editorial work.',
    category: 'ai-technology',
    productType: 'Digital Workbook & Prompt Library (Markdown, Notion-ready, PDF)',
    shortDesc:
      'Demo catalog item: structured patterns for drafting, summarizing, structuring data, and reviewing code with LLMs.',
    fullDesc:
      'Instead of random one-off prompt lists, this playbook organizes repeatable input-output patterns with constraints, verification steps, and real examples.',
    price: 12,
    isDemoProduct: true,
    featured: true,
    createdAt: '2026-10-28',
    cardBg: '#E5DDF5',
    image: '/assets/images/cat_ai_technology_1795209165972.jpg',
    imageAlt: 'Laptop displaying an organized AI prompt library and workflow system',
    gallery: [
      {
        src: '/assets/images/cat_ai_technology_1795209165972.jpg',
        alt: 'AI Prompt Library interface',
        caption: 'Categorized Prompt Patterns & Constraints',
      },
    ],
    whatsIncluded: [
      '40+ Structured Prompt Templates (Writing, Research, Coding, Ops)',
      'Hallucination & Fact-Check Review Checklist',
      'Markdown & CSV Import Bundle',
    ],
    whoItIsFor: [
      'Builders, researchers, and solo operators using AI tools daily',
      'Teams wanting consistent, repeatable prompt structures',
    ],
    benefits: [
      'Reduces back-and-forth edits with explicit output schemas',
      'Tool-agnostic markdown files you can keep anywhere',
    ],
    fileFormats: ['Markdown (.md)', '.csv', 'PDF Workbook'],
    compatibility: ['Any text editor', 'Notion', 'Obsidian', 'ChatGPT / Claude / Gemini'],
    faqs: [
      {
        q: 'Does this require a specific AI subscription?',
        a: 'No, all templates are plain-text structures usable in any modern AI chat or API workflow.',
      },
    ],
    deliverableSummary: 'Browse by task category, copy the structured prompt pattern, and fill in the bracketed context.',
  },
  {
    id: 'prod-editorial-landing-kit',
    slug: 'editorial-landing-ui-kit',
    title: 'Editorial Storefront UI Kit',
    subtitle: 'Clean React + Tailwind CSS section layouts inspired by modern digital magazines.',
    category: 'programming-design',
    productType: 'Frontend Code & Component Kit (.tsx, CSS Tokens, Guide)',
    shortDesc:
      'Demo catalog item: responsive editorial hero, category cards, comparison tables, and typography tokens in TypeScript.',
    fullDesc:
      'Built for developers and indie product makers who want spacious editorial rhythm rather than generic dark-mode SaaS clones.',
    price: 19,
    compareAtPrice: 26,
    isDemoProduct: true,
    featured: true,
    createdAt: '2026-11-01',
    cardBg: '#F8D7DF',
    image: '/assets/images/cat_programming_design_1795209165908.jpg',
    imageAlt: 'Minimalist website UI template and typography grid system on desktop display',
    gallery: [
      {
        src: '/assets/images/cat_programming_design_1795209165908.jpg',
        alt: 'Typography and grid system preview',
        caption: 'Modular Editorial Layout System',
      },
    ],
    whatsIncluded: [
      '12 Responsive React + TypeScript Section Components',
      'Tailwind CSS v4 Design Token Sheet',
      'Accessible Drawer, Modal & Filter Patterns',
    ],
    whoItIsFor: [
      'Frontend developers launching digital products or studio portfolios',
      'Design engineers who prefer readable, zero-bloat code',
    ],
    benefits: [
      'Clean semantic markup with accessible keyboard navigation',
      'Easy palette & font customization via CSS variables',
    ],
    fileFormats: ['.tsx Components', 'CSS Variables', 'README Setup'],
    compatibility: ['React 18/19', 'Vite', 'Next.js', 'Tailwind CSS v4'],
    faqs: [
      {
        q: 'Can I use these sections in client websites?',
        a: 'Yes, the demo license covers personal and single-studio client projects.',
      },
    ],
    deliverableSummary: 'Copy the tokens CSS and drop any modular React section directly into your Vite or Next.js project.',
  },
  {
    id: 'prod-study-os',
    slug: 'deep-focus-study-os',
    title: 'Deep Focus Study & Project OS',
    subtitle: 'Plan semesters, reading lists, and weekly deep-work blocks without clutter.',
    category: 'education-productivity',
    productType: 'Digital Planner & Tracker (.xlsx, Google Sheets, Printable PDF)',
    shortDesc:
      'Demo catalog item: structured course tracker, exam prep timeline, and weekly execution board for learners.',
    fullDesc:
      'A calm planning system combining weekly time-blocking with assignment milestones and spaced-review logs.',
    price: 8,
    isDemoProduct: true,
    featured: false,
    createdAt: '2026-10-18',
    cardBg: '#FFFDF7',
    image: '/assets/images/cat_education_productivity_1795209165162.jpg',
    imageAlt: 'Digital tablet displaying weekly study planner with index cards',
    gallery: [
      {
        src: '/assets/images/cat_education_productivity_1795209165162.jpg',
        alt: 'Weekly Study Planner layout',
        caption: 'Weekly Study & Milestone Board',
      },
    ],
    whatsIncluded: [
      'Semester Course & Deadline Matrix',
      'Weekly Deep-Work & Study Block Sheet',
      'Printable A4 / US Letter PDF Pack',
    ],
    whoItIsFor: [
      'University students, self-taught developers, and lifelong learners',
      'Anyone balancing coursework alongside freelance or part-time work',
    ],
    benefits: [
      'Keeps deadlines visible without notification fatigue',
      'Includes both digital spreadsheet and printable layouts',
    ],
    fileFormats: ['.xlsx', 'Google Sheets', 'Printable PDF'],
    compatibility: ['Google Sheets', 'Excel', 'GoodNotes / Tablet PDF apps'],
    faqs: [
      {
        q: 'Can I print the weekly pages?',
        a: 'Yes, the included A4 and Letter PDFs are formatted specifically for crisp black-and-white or color printing.',
      },
    ],
    deliverableSummary: 'Choose either the spreadsheet tracker or print the weekly A4 sheets for your desk.',
  },
  {
    id: 'prod-ai-workflow-mapper',
    slug: 'ai-workflow-sop-mapper',
    title: 'AI Workflow & SOP Mapper',
    subtitle: 'Document repeatable business operations and identify practical automation points.',
    category: 'ai-technology',
    productType: 'Process Templates & SOP Pack (.xlsx, Markdown, Guide)',
    shortDesc:
      'Demo catalog item: audit repetitive weekly tasks and map clean human-in-the-loop AI workflows.',
    fullDesc:
      'Built for small teams and solo operators who want to automate busywork responsibly without losing quality control.',
    price: 16,
    isDemoProduct: true,
    featured: false,
    createdAt: '2026-10-12',
    cardBg: '#E5DDF5',
    image: '/assets/images/cat_ai_technology_1795209165972.jpg',
    imageAlt: 'Workflow architecture and SOP grid on laptop',
    gallery: [
      {
        src: '/assets/images/cat_ai_technology_1795209165972.jpg',
        alt: 'Workflow SOP documentation grid',
        caption: 'Task Audit & SOP Mapping Matrix',
      },
    ],
    whatsIncluded: [
      'Time & Task Friction Audit Sheet',
      'Human-in-the-Loop SOP Template Pack',
      'Tool Integration Decision Worksheet',
    ],
    whoItIsFor: [
      'Operations-minded freelancers and small agency leads',
      'Makers turning messy habits into documented SOPs',
    ],
    benefits: [
      'Spots high-leverage tasks worth systematizing first',
      'Prevents brittle over-automation on client-facing work',
    ],
    fileFormats: ['.xlsx', 'Markdown', 'PDF'],
    compatibility: ['Excel', 'Google Sheets', 'Notion'],
    faqs: [
      {
        q: 'Do I need coding skills?',
        a: 'No coding is required; the worksheets focus on process clarity and plain-English checklists.',
      },
    ],
    deliverableSummary: 'Log one week of recurring tasks in the audit tab to prioritize your first three SOPs.',
  },
  {
    id: 'prod-grid-spec-book',
    slug: 'modular-grid-spec-book',
    title: 'Modular Grid & Typography Spec',
    subtitle: 'Practical spacing ratios, type scales, and responsive grid recipes for web projects.',
    category: 'programming-design',
    productType: 'Design System Reference & CSS Tokens (PDF, CSS, JSON)',
    shortDesc:
      'Demo catalog item: tested typographic pairings, container math, and clean CSS variable starter files.',
    fullDesc:
      'A concise visual handbook and token starter kit for designers and developers building legible, high-contrast web interfaces.',
    price: 11,
    isDemoProduct: true,
    featured: false,
    createdAt: '2026-10-05',
    cardBg: '#F8D7DF',
    image: '/assets/images/cat_programming_design_1795209165908.jpg',
    imageAlt: 'Typography hierarchy spec sheet on studio monitor',
    gallery: [
      {
        src: '/assets/images/cat_programming_design_1795209165908.jpg',
        alt: 'Typography and grid scale display',
        caption: 'Fluid Clamp Type Scale & Grid Ratios',
      },
    ],
    whatsIncluded: [
      '40-page Visual Grid & Type Scale Guide (PDF)',
      'Ready-to-use CSS Custom Properties & JSON Tokens',
      'Contrast & Spacing Audit Checklist',
    ],
    whoItIsFor: [
      'UI designers and frontend engineers refining visual hierarchy',
      'Solo builders who want reliable spacing and type math',
    ],
    benefits: [
      'Eliminates guesswork on line-height, measure, and fluid font clamps',
      'Pairs cleanly with Tailwind CSS or vanilla CSS projects',
    ],
    fileFormats: ['PDF Handbook', 'CSS', 'JSON Tokens'],
    compatibility: ['Any browser / CSS toolchain', 'Figma Variables'],
    faqs: [
      {
        q: 'Are fonts included?',
        a: 'The guide pairs open-source Google Fonts (Plus Jakarta Sans, Fraunces, DM Sans, DM Mono) with exact CSS setups.',
      },
    ],
    deliverableSummary: 'Import the CSS token variables into your root stylesheet and follow the 4-step grid checklist.',
  },
  {
    id: 'prod-weekly-ledger',
    slug: 'weekly-execution-habit-ledger',
    title: 'Weekly Execution & Habit Ledger',
    subtitle: 'A distraction-free weekly review sheet for tracking top priorities and steady progress.',
    category: 'education-productivity',
    productType: 'Digital & Printable Ledger (PDF, .xlsx)',
    shortDesc:
      'Demo catalog item: simple weekly priority planning, daily focus logs, and Friday reflection prompts.',
    fullDesc:
      'Designed to replace complex productivity apps with a single calm weekly page you can complete in ten minutes.',
    price: 7,
    isDemoProduct: true,
    featured: false,
    createdAt: '2026-09-29',
    cardBg: '#F7EDB8',
    image: '/assets/images/cat_education_productivity_1795209165162.jpg',
    imageAlt: 'Weekly execution planner cards and tablet layout',
    gallery: [
      {
        src: '/assets/images/cat_education_productivity_1795209165162.jpg',
        alt: 'Weekly Execution Ledger',
        caption: 'Minimalist Weekly Priority Sheet',
      },
    ],
    whatsIncluded: [
      'Digital Spreadsheet Weekly Ledger',
      'Printable Minimalist PDF (A4 & US Letter)',
      'Friday 10-Minute Review Guide',
    ],
    whoItIsFor: ['Makers, students, and solo founders wanting a calmer weekly rhythm'],
    benefits: ['Focuses on 3 weekly outcomes instead of endless task lists'],
    fileFormats: ['PDF', '.xlsx'],
    compatibility: ['Excel', 'Google Sheets', 'Any PDF reader or printer'],
    faqs: [
      {
        q: 'Is this undated?',
        a: 'Yes, every sheet is undated so you can start any Monday without wasted pages.',
      },
    ],
    deliverableSummary: 'Print one weekly sheet each Monday morning or duplicate the spreadsheet tab.',
  },
];

export const SEED_BLOG_ARTICLES = [
  {
    id: 'blog-1',
    slug: 'why-simple-spreadsheets-still-win-for-solo-businesses',
    category: 'Small Business',
    title: 'Why simple spreadsheets still beat bloated CRMs for solo professionals',
    excerpt:
      'When you manage 5 to 20 client projects, software setup overhead costs more time than it saves. Here is how to structure a calm single-workbook system.',
    publishedAt: 'November 12, 2026',
    readTime: '4 min read',
    image: '/assets/images/solobiz_os_showcase_1795209164172.jpg',
    imageAlt: 'SoloBiz OS spreadsheet dashboard on desk',
    body: [
      'Independent professionals rarely fail because they lack enterprise software. More often, momentum stalls under the weight of scattered tabs, unpaid invoices nobody followed up on, and tools designed for twenty-person sales teams.',
      'A well-structured spreadsheet does three things effortlessly: it keeps your active leads, quotes, and payment statuses visible on one screen; it works identically whether you are online or offline; and you own your financial data without another monthly subscription.',
      'That thinking shaped SoloBiz OS. Instead of burying daily cashflow behind menus, every tab answers one practical question: who needs a reply today, which invoice is due this week, and what did the business actually keep after expenses?',
    ],
  },
  {
    id: 'blog-2',
    slug: 'designing-repeatable-ai-workflows-without-losing-craft',
    category: 'AI Tools',
    title: 'Designing repeatable AI workflows without losing human craft',
    excerpt:
      'Prompting works best when treated like a specification sheet rather than a slot machine. Four habits that keep output grounded and useful.',
    publishedAt: 'November 05, 2026',
    readTime: '5 min read',
    image: '/assets/images/cat_ai_technology_1795209165972.jpg',
    imageAlt: 'Laptop displaying AI prompt architecture library',
    body: [
      'The gap between a frustrating AI draft and a genuinely helpful starting point usually comes down to missing constraints. Asking for "marketing copy" invites cliches; providing audience context, format rules, and forbidden buzzwords produces clarity.',
      'Start by saving the exact structure of prompts that worked well in a plain Markdown file. Over a few weeks, your best instructions turn into lightweight standard operating procedures.',
      'Most importantly, keep verification human. Check every number, link, and technical assumption before anything reaches a customer.',
    ],
  },
  {
    id: 'blog-3',
    slug: 'typographic-rhythm-and-calm-digital-storefronts',
    category: 'Programming & Design',
    title: 'Typographic rhythm: building storefronts that feel like editorial magazines',
    excerpt:
      'Why generous whitespace, restrained color blocking, and honest product framing earn more trust than urgency countdowns.',
    publishedAt: 'October 27, 2026',
    readTime: '4 min read',
    image: '/assets/images/cat_programming_design_1795209165908.jpg',
    imageAlt: 'Desktop monitor displaying editorial typography grid',
    body: [
      'Digital storefronts often borrow the loudest habits of discount marketplaces—flashing timers, stacked badges, and cramped cards. For thoughtful digital products, that noise works against trust.',
      'Treating a product page like an editorial feature gives buyers room to inspect what is actually inside: real file formats, compatibility notes, and clear use cases.',
      'Pair one expressive display scale with crisp tabular figures for pricing and specs, and keep interactive feedback swift and predictable.',
    ],
  },
  {
    id: 'blog-4',
    slug: 'ten-minute-weekly-reset-for-learners-and-makers',
    category: 'Digital Productivity',
    title: 'The ten-minute weekly reset for learners and independent makers',
    excerpt:
      'How a short Monday triage and Friday review keep long-term projects moving alongside daily client or study commitments.',
    publishedAt: 'October 19, 2026',
    readTime: '3 min read',
    image: '/assets/images/cat_education_productivity_1795209165162.jpg',
    imageAlt: 'Weekly planner tablet and study index cards',
    body: [
      'Long to-do lists blur the difference between urgent chores and meaningful progress. A ten-minute weekly reset separates the two.',
      'Pick at most three concrete outcomes that would make the week feel worthwhile. Block real calendar hours for them before reactive messages fill the gaps.',
      'On Friday afternoon, write two lines on what moved forward and what needs adjusting next Monday.',
    ],
  },
  {
    id: 'blog-5',
    slug: 'building-digital-products-from-kigali-for-global-buyers',
    category: 'Learning & Entrepreneurship',
    title: 'Shipping practical digital tools globally from an independent studio',
    excerpt:
      'Notes on researching cross-border payment rails, pricing experiments, and validating early-access tools honestly.',
    publishedAt: 'October 09, 2026',
    readTime: '5 min read',
    image: '/assets/images/craftedlabs_studio_story_1795209165556.jpg',
    imageAlt: 'Sunlit creative design studio desk with typography prints',
    body: [
      'Building digital tools from Rwanda for a global audience teaches practical discipline early: keep files lightweight, test payment providers that bridge local settlement and international cards, and validate demand before overbuilding.',
      'An early-access release—like SoloBiz OS at a $9 test price—lets real users test the templates in daily workflows and tell you what is missing before version two.',
      'Clarity, honesty about what is finished versus experimental, and dependable file delivery build lasting reputation.',
    ],
  },
];

export const SEED_DISCOUNT_CODES = [
  {
    code: 'WELCOME15',
    percentOff: 15,
    active: true,
    description: '15% off demo catalog test orders',
  },
  {
    code: 'MAKER10',
    percentOff: 10,
    active: true,
    description: '10% community reader discount',
  },
];

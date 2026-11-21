import type {
  BlogArticle,
  CategoryInfo,
  DiscountCode,
  FreeResource,
  Product,
} from '../types/store';

export const STUDIO_MEDIA = {
  solobizShowcase: '/assets/images/solobiz_os_showcase_1795209164172.jpg',
  catBusiness: '/assets/images/cat_business_entrepreneurship_1795209165628.jpg',
  catAi: '/assets/images/cat_ai_technology_1795209165972.jpg',
  catDesign: '/assets/images/cat_programming_design_1795209165908.jpg',
  catProductivity: '/assets/images/cat_education_productivity_1795209165162.jpg',
  studioStory: '/assets/images/craftedlabs_studio_story_1795209165556.jpg',
};

export const SHOWCASE_STAGES = [
  {
    src: STUDIO_MEDIA.solobizShowcase,
    alt: 'SoloBiz OS spreadsheet dashboard open on a laptop and tablet on a pale aqua and cream studio desk',
    title: 'SoloBiz OS Workspace',
    sub: 'Clients, quotes, invoices, and cashflow in one clean spreadsheet system',
  },
  {
    src: STUDIO_MEDIA.catBusiness,
    alt: 'Clean quote and invoice layouts next to a sage notebook and brass pen',
    title: 'Quote & Invoice Clarity',
    sub: 'Send crisp, itemized client proposals and follow up without awkward guesswork',
  },
  {
    src: STUDIO_MEDIA.catDesign,
    alt: 'Editorial website template grid and typography specification on studio monitor',
    title: 'Crafted Digital Templates',
    sub: 'Modular website kits, design specs, and documentation built for makers',
  },
  {
    src: STUDIO_MEDIA.catProductivity,
    alt: 'Weekly digital planner on tablet surrounded by structured cream and yellow study cards',
    title: 'Built for Real-World Work',
    sub: 'Lightweight tools designed for independent creators, learners, and small teams',
  },
];

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'business-entrepreneurship',
    name: 'Business & Entrepreneurship',
    shortDesc: 'Client trackers, invoice templates, and lean financial spreadsheets for solo operators.',
    cardBg: '#F7EDB8',
    image: STUDIO_MEDIA.catBusiness,
    imageAlt: 'Business planning sheets, invoice template, and sage notebook on cream desk',
  },
  {
    id: 'ai-technology',
    name: 'AI & Technology',
    shortDesc: 'Structured prompt libraries, workflow SOPs, and practical automation blueprints.',
    cardBg: '#E5DDF5',
    image: STUDIO_MEDIA.catAi,
    imageAlt: 'Laptop displaying an organized AI prompt library and workflow grid',
  },
  {
    id: 'programming-design',
    name: 'Programming & Design',
    shortDesc: 'Editorial landing templates, component grid specs, and clean frontend starter kits.',
    cardBg: '#F8D7DF',
    image: STUDIO_MEDIA.catDesign,
    imageAlt: 'Desktop monitor showing minimalist website layout grid and sketchbook',
  },
  {
    id: 'education-productivity',
    name: 'Education & Productivity',
    shortDesc: 'Focused study planners, weekly execution ledgers, and printable learning boards.',
    cardBg: '#FFFDF7',
    image: STUDIO_MEDIA.catProductivity,
    imageAlt: 'Tablet showing weekly planner surrounded by study index cards',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
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
    image: STUDIO_MEDIA.solobizShowcase,
    imageAlt: 'SoloBiz OS workspace open on laptop and tablet showing client tracker and financial overview',
    gallery: [
      {
        src: STUDIO_MEDIA.solobizShowcase,
        alt: 'SoloBiz OS Business Overview Dashboard on laptop',
        caption: 'Business Overview Dashboard & Revenue Summary',
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
    ],
    benefits: [
      'Track every lead, active quote, and unpaid invoice in under 5 minutes a day',
      'Zero monthly SaaS subscription fees — own your spreadsheet files outright',
    ],
    fileFormats: ['.xlsx (Microsoft Excel)', 'Google Sheets Copy Link', 'Editable Invoice Docs', 'PDF Setup Guide'],
    compatibility: ['Microsoft Excel 2019+', 'Google Sheets (Free Account)', 'LibreOffice Calc'],
    faqs: [
      {
        q: 'Do I need paid spreadsheet software to use SoloBiz OS?',
        a: 'No. You can duplicate the Google Sheets edition into any free Google account or open the .xlsx workbook in Excel or LibreOffice.',
      },
    ],
    deliverableSummary: 'Open SoloBiz OS, set your business name and currency, and export your first PDF invoice.',
  },
];

export const FREE_RESOURCES: FreeResource[] = [
  {
    id: 'free-invoice-starter',
    title: 'Solo Invoice & Payment Follow-Up Sheet',
    category: 'business-entrepreneurship',
    format: 'CSV + Setup Guide (.txt)',
    shortDesc:
      'A clean starter ledger for tracking client invoices, due dates, and polite payment reminders.',
    cardBg: '#FFFDF7',
    image: STUDIO_MEDIA.catBusiness,
    imageAlt: 'Invoice starter worksheet flat-lay',
    fileName: 'craftedlabs-solo-invoice-starter.csv',
    fileContent: [
      'Invoice_ID,Client_Name,Project,Issue_Date,Due_Date,Amount_USD,Status,Follow_Up_Note',
      'INV-001,Example Studio,Brand Audit,2026-11-01,2026-11-15,450.00,Paid,Thank-you note sent',
      'INV-002,Acme Co,Landing Page Sprint,2026-11-10,2026-11-24,850.00,Sent,Follow up 2 days before due date',
    ].join('\n'),
  },
  {
    id: 'free-ai-checklist',
    title: 'Practical AI Prompt Review Checklist',
    category: 'ai-technology',
    format: 'Markdown Guide (.md)',
    shortDesc:
      'A one-page checklist for structuring context, constraints, and verification before shipping AI-assisted work.',
    cardBg: '#E5DDF5',
    image: STUDIO_MEDIA.catAi,
    imageAlt: 'AI prompt structure workspace',
    fileName: 'craftedlabs-ai-prompt-checklist.md',
    fileContent: [
      '# CraftedLabs — Practical AI Prompt Review Checklist',
      '',
      '1. Define Role & Concrete Output Format (table, JSON, outline, code)',
      '2. Provide Source Context & Grounding Constraints (no invented stats)',
      '3. Specify Tone & Reading Level (plain language over buzzwords)',
      '4. Run Human Verification on every number, claim, and edge case',
    ].join('\n'),
  },
  {
    id: 'free-triage-board',
    title: 'Weekly Project Triage Worksheet',
    category: 'education-productivity',
    format: 'Markdown / Printable (.md)',
    shortDesc:
      'Sort what must ship this week, what can wait, and what to drop in under 10 minutes.',
    cardBg: '#F7EDB8',
    image: STUDIO_MEDIA.catProductivity,
    imageAlt: 'Weekly planner and study cards',
    fileName: 'craftedlabs-weekly-triage-worksheet.md',
    fileContent: [
      '# CraftedLabs — Weekly Project Triage Worksheet',
      '',
      '## Must Ship This Week (Max 3 Outcomes)',
      '- [ ] Outcome 1:',
      '- [ ] Outcome 2:',
      '- [ ] Outcome 3:',
    ].join('\n'),
  },
];

export const INITIAL_BLOG_ARTICLES: BlogArticle[] = [];
export const INITIAL_DISCOUNT_CODES: DiscountCode[] = [];

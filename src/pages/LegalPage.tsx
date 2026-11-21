import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const POLICIES = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'November 2026',
    paragraphs: [
      'CraftedLabs collects only the information needed to deliver digital files, authenticate your account via Firebase Authentication, and send newsletter notes when you explicitly opt in.',
      'We do not sell personal email addresses, and you may unsubscribe from resource or newsletter emails at any time.',
      'During Demo / Test Mode, order records and cart selections are stored locally in your browser storage without transmitting payment credentials.',
    ],
  },
  terms: {
    title: 'Terms of Use',
    updated: 'November 2026',
    paragraphs: [
      'Digital templates, spreadsheets, and guides from CraftedLabs are licensed for personal or single-business operational use unless otherwise noted on a specific product page.',
      'Redistributing, reselling, or packaging CraftedLabs templates as competing template kits is not permitted.',
      'SoloBiz OS ($9 early-access pricing) and demo catalog items are provided transparently with clear compatibility notes prior to purchase.',
    ],
  },
  refund: {
    title: 'Refund Policy',
    updated: 'November 2026',
    paragraphs: [
      'Because digital files are accessible immediately upon purchase, please review the format, compatibility list, and interactive previews before completing checkout.',
      'If a file arrives corrupted, fails to match its documented contents, or you run into a technical compatibility issue we cannot resolve, contact hello@craftedlabs.store within 14 days for assistance or a fair refund.',
      'Note: In Demo Checkout mode, no real funds are charged.',
    ],
  },
} as const;

export default function LegalPage() {
  const { type } = useParams<{ type: 'privacy' | 'terms' | 'refund' }>();
  const policy = POLICIES[type ?? 'privacy'] ?? POLICIES.privacy;

  return (
    <div className="pt-28 pb-24 min-h-[75vh] bg-[#FFFDF7] px-5">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3d5740] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to CraftedLabs
        </Link>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-[#202020]">
          {policy.title}
        </h1>
        <p className="text-xs text-[#777777]">Last updated {policy.updated}</p>
        <div className="space-y-4 text-base text-[#5C5C5C] leading-relaxed pt-2">
          {policy.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

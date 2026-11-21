import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { addSubscriber, isAdmin } = useStore();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'error' | 'done'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMsg('Enter a valid email address.');
      return;
    }
    if (!consent) {
      setStatus('error');
      setMsg('Please check the consent box to subscribe.');
      return;
    }
    try {
      await addSubscriber({
        email: email.trim(),
        consentGiven: true,
        source: 'newsletter',
      });
      setStatus('done');
      setMsg('Subscribed. Watch your inbox for practical resources.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMsg(err instanceof Error ? err.message : 'Subscription failed.');
    }
  };

  return (
    <footer className="bg-[#252426] text-[#FFFDF7] pt-16 pb-10">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        {/* Top Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/12">
          <div className="lg:col-span-4 space-y-4">
            <p className="font-display font-bold text-lg text-[#FFFDF7]">
              Digital tools. Smarter work. Better results.
            </p>
            <p className="text-sm text-white/70 max-w-[36ch] leading-relaxed">
              CraftedLabs designs spreadsheets, templates, AI playbooks, and
              learning systems for independent professionals and curious makers.
            </p>
            <div className="flex items-center gap-4 pt-2 text-sm text-white/75">
              <a
                href="mailto:hello@craftedlabs.store"
                className="hover:text-white underline underline-offset-4"
              >
                hello@craftedlabs.store
              </a>
              <span aria-hidden="true">·</span>
              <span>Kigali, Rwanda</span>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to="/shop" className="hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/product/solobiz-os" className="hover:text-white">
                  SoloBiz OS
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=business-entrepreneurship"
                  className="hover:text-white"
                >
                  Business &amp; Ops
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=ai-technology"
                  className="hover:text-white"
                >
                  AI &amp; Technology
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=programming-design"
                  className="hover:text-white"
                >
                  Programming &amp; Design
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to="/#free-resources" className="hover:text-white">
                  Free Resources
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white">
                  Editorial Journal
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">
                  About CraftedLabs
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white">
                  Customer Account
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="hover:text-white">
                    Store Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Inbox Notes
            </h3>
            <p className="text-sm text-white/70">
              New product launches, free templates, and studio notes. No spam.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2.5 pt-1">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  aria-label="Email address for newsletter"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-[#D6F0EE]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#3d5740] hover:bg-[#48634b] text-[#FFFDF7] text-sm font-semibold whitespace-nowrap shrink-0 btn-tactile cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
              <label className="flex items-start gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-[#3d5740]"
                />
                <span>I consent to receive CraftedLabs emails (unsubscribe anytime).</span>
              </label>
              {status !== 'idle' && (
                <p
                  className={`text-xs ${
                    status === 'done' ? 'text-[#D6F0EE]' : 'text-[#F8D7DF]'
                  }`}
                >
                  {msg}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Oversized Wordmark */}
        <div className="py-10 border-b border-white/12 overflow-hidden">
          <p className="font-display font-extrabold tracking-tighter leading-none text-[clamp(3.2rem,13vw,10.5rem)] text-[#FFFDF7] select-none">
            CraftedLabs
          </p>
        </div>

        {/* Bottom Legal Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/60">
          <span>© {new Date().getFullYear()} CraftedLabs. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/legal/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/legal/terms" className="hover:text-white">
              Terms of Use
            </Link>
            <Link to="/legal/refund" className="hover:text-white">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

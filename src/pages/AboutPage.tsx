import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { STUDIO_MEDIA } from '../data/catalog';

export default function AboutPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSent(false);
    if (!email.includes('@') || !message.trim() || !name.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || 'Could not send message.');
      } else {
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch {
      setError('Network error sending message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-[#D6F0EE]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#3d5740]">
              About CraftedLabs
            </p>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#202020] leading-[1.06] [text-wrap:balance]">
              To create useful, thoughtfully designed digital resources that make
              building, learning and working easier.
            </h1>
            <p className="text-base text-[#5C5C5C] leading-relaxed">
              CraftedLabs is an independent digital-products studio focused on
              practical spreadsheets, website templates, AI guides, and study
              systems. We build tools we would genuinely use ourselves—without
              subscription bloat or overstated promises.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#3d5740] hover:bg-[#314734] text-[#FFFDF7] text-sm font-semibold btn-tactile"
            >
              Explore the Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-[#202020]/12 bg-[#FFFDF7] p-3">
              <img
                src={STUDIO_MEDIA.studioStory}
                alt="CraftedLabs design studio table with layout mockups and typography sheets"
                referrerPolicy="no-referrer"
                className="w-full aspect-[16/10] object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-7">
            <p className="text-xs font-mono-tabular font-bold text-[#3d5740] mb-2">
              01. Simplicity First
            </p>
            <h2 className="font-display font-bold text-xl text-[#202020]">
              Zero software bloat
            </h2>
            <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed">
              Every spreadsheet, guide, and template opens cleanly in everyday
              tools like Excel, Google Sheets, Markdown, or standard browsers.
            </p>
          </div>

          <div className="rounded-2xl bg-[#F7EDB8]/70 border border-[#202020]/12 p-7">
            <p className="text-xs font-mono-tabular font-bold text-[#3d5740] mb-2">
              02. Honest Transparency
            </p>
            <h2 className="font-display font-bold text-xl text-[#202020]">
              No manufactured hype
            </h2>
            <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed">
              We clearly distinguish between early-access releases like SoloBiz
              OS ($9 validation pricing) and demo catalog concepts. Zero fake
              testimonials or inflated counters.
            </p>
          </div>

          <div className="rounded-2xl bg-[#E5DDF5]/70 border border-[#202020]/12 p-7">
            <p className="text-xs font-mono-tabular font-bold text-[#3d5740] mb-2">
              03. Quality Standards
            </p>
            <h2 className="font-display font-bold text-xl text-[#202020]">
              Readable &amp; portable files
            </h2>
            <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed">
              Clear documentation, beginner setup guides, and clean typography
              mean you can start using a file in minutes rather than hours.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-[#FFFDF7] border border-[#202020]/12 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display font-extrabold text-3xl text-[#202020]">
              Get in touch
            </h2>
            <p className="text-sm text-[#5C5C5C] leading-relaxed">
              Have feedback on SoloBiz OS, a question about file formats, or an
              idea for a future digital tool? Write directly to the studio.
            </p>
            <div className="space-y-3 pt-2 text-sm text-[#202020]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#3d5740]" />
                <span>hello@craftedlabs.store</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#3d5740]" />
                <span>Kigali, Rwanda · Serving global buyers</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
              />
            </div>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you are working on or how we can help..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-7 py-3 rounded-full bg-[#3d5740] hover:bg-[#314734] disabled:opacity-60 text-[#FFFDF7] text-sm font-semibold btn-tactile cursor-pointer"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            {error && <p className="text-xs text-red-700">{error}</p>}
            {sent && (
              <p className="text-xs font-semibold text-[#3d5740] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Message saved to CraftedLabs studio inbox.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

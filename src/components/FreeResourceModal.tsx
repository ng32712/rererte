import { useState, type FormEvent } from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { downloadFreeResourceFile } from '../lib/payments';

export default function FreeResourceModal() {
  const {
    activeFreeResource,
    setActiveFreeResource,
    addSubscriber,
    user,
  } = useStore();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!activeFreeResource) return null;

  const close = () => {
    setDownloaded(false);
    setError('');
    setSubmitting(false);
    setActiveFreeResource(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address to unlock this download.');
      return;
    }
    if (!consent) {
      setError('Please confirm consent so we can deliver this free resource.');
      return;
    }

    setSubmitting(true);
    try {
      await addSubscriber({
        firstName: firstName.trim() || undefined,
        email: email.trim(),
        consentGiven: true,
        source: 'free-resource',
        resourceName: activeFreeResource.title,
      });

      downloadFreeResourceFile(activeFreeResource);
      setDownloaded(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not unlock download right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#202020]/55 backdrop-blur-xs"
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-res-title"
        className="relative z-90 w-full max-w-md bg-[#FFFDF7] rounded-2xl border border-[#202020]/15 p-6 md:p-7 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#3d5740]">
              Free Resource · {activeFreeResource.format}
            </p>
            <h2
              id="free-res-title"
              className="font-display font-bold text-xl text-[#202020] mt-1"
            >
              {activeFreeResource.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close download modal"
            className="w-8 h-8 rounded-full border border-[#202020]/12 flex items-center justify-center text-[#5C5C5C] hover:bg-[#F4F1E8] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#5C5C5C] mt-3 leading-relaxed">
          {activeFreeResource.shortDesc}
        </p>

        {downloaded ? (
          <div className="mt-6 p-4 rounded-xl bg-[#D6F0EE]/60 border border-[#3d5740]/20">
            <div className="flex items-center gap-2 text-[#3d5740] font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Your download has started.</span>
            </div>
            <p className="text-xs text-[#5C5C5C] mt-1.5">
              File saved as <span className="font-mono-tabular">{activeFreeResource.fileName}</span>.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => downloadFreeResourceFile(activeFreeResource)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Again
              </button>
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-full border border-[#202020]/20 text-xs font-medium text-[#202020] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="free-first-name"
                className="block text-xs font-medium text-[#5C5C5C] mb-1"
              >
                First Name (optional)
              </label>
              <input
                id="free-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
              />
            </div>

            <div>
              <label
                htmlFor="free-email"
                className="block text-xs font-medium text-[#5C5C5C] mb-1"
              >
                Email Address
              </label>
              <input
                id="free-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#202020]/15 text-sm text-[#202020] focus:outline-none focus:border-[#3d5740]"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5C5C5C] leading-relaxed">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#3d5740]"
              />
              <span>
                Send me this free file and occasional CraftedLabs notes on new
                templates and tools. You can unsubscribe anytime.
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-700 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-full bg-[#3d5740] hover:bg-[#314734] disabled:opacity-60 text-[#FFFDF7] text-sm font-semibold inline-flex items-center justify-center gap-2 btn-tactile cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {submitting ? 'Unlocking...' : 'Download Free Resource'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

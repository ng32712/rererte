import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FREE_RESOURCES } from '../data/catalog';

export default function SearchModal() {
  const { searchOpen, setSearchOpen, products, blogArticles } = useStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const q = query.trim().toLowerCase();
  const matchedProducts = products.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.shortDesc.toLowerCase().includes(q) ||
      p.productType.toLowerCase().includes(q)
  );
  const matchedArticles = blogArticles.filter(
    (a) =>
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
  );
  const matchedFree = FREE_RESOURCES.filter(
    (r) => !q || r.title.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-80 flex items-start justify-center pt-20 px-4">
      <div
        className="fixed inset-0 bg-[#202020]/55 backdrop-blur-xs"
        onClick={() => setSearchOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search CraftedLabs"
        className="relative z-90 w-full max-w-2xl bg-[#FFFDF7] rounded-2xl border border-[#202020]/15 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#202020]/10">
          <Search className="w-5 h-5 text-[#3d5740] shrink-0" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SoloBiz OS, templates, AI playbooks, or articles..."
            className="w-full bg-transparent text-base text-[#202020] placeholder:text-[#777777] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="w-8 h-8 rounded-full hover:bg-[#F4F1E8] flex items-center justify-center text-[#5C5C5C] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#777777] mb-2.5">
              Products ({matchedProducts.length})
            </p>
            {matchedProducts.length === 0 ? (
              <p className="text-sm text-[#777777]">No matching products found.</p>
            ) : (
              <div className="space-y-2">
                {matchedProducts.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-[#D6F0EE]/45 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt={p.imageAlt}
                        className="w-12 h-10 rounded-lg object-cover border border-[#202020]/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#202020] truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-[#777777] truncate">
                          {p.productType}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-sm font-bold text-[#3d5740] shrink-0">
                      ${p.price}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {matchedFree.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#777777] mb-2">
                Free Resources ({matchedFree.length})
              </p>
              <div className="space-y-1.5">
                {matchedFree.map((res) => (
                  <Link
                    key={res.id}
                    to="/#free-resources"
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F7EDB8]/50 text-sm text-[#202020]"
                  >
                    <span>{res.title}</span>
                    <span className="text-xs font-semibold text-[#3d5740]">
                      Free
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {matchedArticles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#777777] mb-2">
                Journal & Articles ({matchedArticles.length})
              </p>
              <div className="space-y-1.5">
                {matchedArticles.slice(0, 3).map((art) => (
                  <Link
                    key={art.id}
                    to={`/blog/${art.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-[#F4F1E8] text-sm text-[#202020]"
                  >
                    <span className="truncate">{art.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#3d5740] shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

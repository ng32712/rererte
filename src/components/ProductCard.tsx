import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers, Plus } from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/store';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [imgError, setImgError] = useState(false);

  const categoryName =
    CATEGORIES.find((c) => c.id === product.category)?.name ?? 'Digital Tool';

  return (
    <article
      className="group rounded-2xl border border-[#202020]/10 overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: product.cardBg || '#FFFDF7' }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#E8EEEC] block"
      >
        {!imgError ? (
          <img
            src={product.image}
            alt={product.imageAlt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#D6F0EE] to-[#FFFDF7]">
            <Layers className="w-8 h-8 text-[#3d5740] mb-2" />
            <span className="font-display font-bold text-sm text-[#202020]">
              {product.title}
            </span>
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5C5C5C] mb-2">
            <span className="truncate">{categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap shrink-0 font-medium text-[#3d5740]">
              {product.isDemoProduct ? 'Demo Product' : 'Early Access'}
            </span>
          </div>

          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-display font-bold text-xl text-[#202020] group-hover:text-[#3d5740] transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed line-clamp-2">
            {product.shortDesc}
          </p>
        </div>

        <div className="pt-5 mt-5 border-t border-[#202020]/10 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono-tabular font-bold text-xl text-[#202020]">
              ${product.price}
            </span>
            {product.compareAtPrice && (
              <span className="font-mono-tabular text-xs text-[#777777] line-through">
                ${product.compareAtPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-[#202020]/15 bg-[#FFFDF7]/70 hover:bg-[#FFFDF7] text-xs font-semibold text-[#202020] whitespace-nowrap shrink-0 transition-colors"
            >
              Details
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => addToCart(product.id, true)}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#3d5740] hover:bg-[#314734] text-[#FFFDF7] text-xs font-semibold whitespace-nowrap shrink-0 btn-tactile cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

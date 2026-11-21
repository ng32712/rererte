import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileSpreadsheet,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import SoloBizInteractivePreview from '../components/SoloBizInteractivePreview';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, addToCart } = useStore();

  const product = products.find((p) => p.slug === slug);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-[75vh] bg-[#D6F0EE] px-5">
        <div className="max-w-lg mx-auto rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-10 text-center">
          <h1 className="font-display font-bold text-2xl text-[#202020]">
            Product not found
          </h1>
          <p className="text-sm text-[#5C5C5C] mt-2">
            The product you requested may have moved or been updated in the catalog.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3d5740] text-[#FFFDF7] text-sm font-semibold"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.category);
  const gallery =
    product.gallery.length > 0
      ? product.gallery
      : [{ src: product.image, alt: product.imageAlt, caption: product.title }];
  const activeMedia = gallery[activeImageIdx] ?? gallery[0];
  const related = products
    .filter((p) => p.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : b.category === product.category ? 1 : 0))
    .slice(0, 3);

  return (
    <div className="pt-24 pb-20 bg-[#D6F0EE]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs text-[#5C5C5C]">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 hover:text-[#202020] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <span>{category?.name}</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#202020] font-medium truncate">{product.title}</span>
        </div>

        {/* Main Split Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Gallery + Live Preview */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#E8EEEC]">
                <img
                  src={activeMedia.src}
                  alt={activeMedia.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-[#5C5C5C] px-2 pt-3 pb-1">
                {activeMedia.caption}
              </p>
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((g, idx) => (
                  <button
                    key={g.caption}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeImageIdx
                        ? 'border-[#3d5740]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={g.src}
                      alt={g.alt}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {product.slug === 'solobiz-os' && (
              <div className="pt-2">
                <SoloBizInteractivePreview />
              </div>
            )}
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-6 md:p-8 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C5C5C] mb-2">
                <span className="font-medium text-[#3d5740]">
                  {product.isDemoProduct ? 'Demo Product' : 'Early-Access Release'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{category?.name}</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight text-[#202020]">
                {product.title}
              </h1>
              <p className="text-base text-[#5C5C5C] mt-2 leading-relaxed">
                {product.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3 pb-5 border-b border-[#202020]/10">
              <span className="font-mono-tabular font-bold text-3xl text-[#202020]">
                ${product.price} USD
              </span>
              {product.compareAtPrice && (
                <span className="font-mono-tabular text-base text-[#777777] line-through">
                  ${product.compareAtPrice}
                </span>
              )}
              {product.priceNote && (
                <span className="text-xs text-[#3d5740] font-medium">
                  {product.priceNote}
                </span>
              )}
            </div>

            <div className="rounded-xl bg-[#D6F0EE]/55 border border-[#202020]/10 p-4 text-xs text-[#202020] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-[#3d5740]" />
                <span>Product Type: {product.productType}</span>
              </div>
              <p className="text-[#5C5C5C]">
                Instant digital access after completing the Demo Checkout flow.
              </p>
              {product.hasUploadedFile && product.deliverableFileName && (
                <p className="text-[#3d5740] font-medium font-mono-tabular">
                  Attached digital file: {product.deliverableFileName}
                </p>
              )}
            </div>

            <p className="text-sm text-[#5C5C5C] leading-relaxed">
              {product.fullDesc}
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => addToCart(product.id, true)}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#3d5740] hover:bg-[#314734] text-[#FFFDF7] font-semibold text-sm inline-flex items-center justify-center gap-2 btn-tactile cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart — ${product.price}
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart(product.id, false);
                  navigate('/checkout');
                }}
                className="py-3.5 px-6 rounded-full border border-[#202020]/20 hover:border-[#3d5740] text-[#202020] font-semibold text-sm btn-tactile cursor-pointer"
              >
                Demo Buy Now
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#5C5C5C] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#3d5740] shrink-0" />
              <span>
                Test-mode checkout · Files stay gated behind verified order records.
              </span>
            </div>

            {/* What's Included */}
            <div className="pt-5 border-t border-[#202020]/10">
              <h2 className="font-display font-bold text-base text-[#202020] mb-3">
                What&apos;s Included
              </h2>
              <ul className="space-y-2">
                {product.whatsIncluded.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[#5C5C5C]"
                  >
                    <Check className="w-4 h-4 text-[#3d5740] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formats & Compatibility */}
            <div className="pt-5 border-t border-[#202020]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-semibold text-[#202020] mb-1.5">
                  File Formats
                </h3>
                <ul className="space-y-1 text-[#5C5C5C]">
                  {product.fileFormats.map((f) => (
                    <li key={f}>· {f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#202020] mb-1.5">
                  Compatibility
                </h3>
                <ul className="space-y-1 text-[#5C5C5C]">
                  {product.compatibility.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Who it's for / Benefits / FAQ */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-7 space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-[#202020]">
                Who It&apos;s For
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-[#5C5C5C]">
                {product.whoItIsFor.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <span className="text-[#3d5740] font-bold">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 border-t border-[#202020]/10">
              <h2 className="font-display font-bold text-2xl text-[#202020]">
                Benefits &amp; Use Cases
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-[#5C5C5C]">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#3d5740] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl bg-[#FFFDF7] border border-[#202020]/12 p-7">
            <h2 className="font-display font-bold text-2xl text-[#202020] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-[#202020]/10">
              {product.faqs.map((faq, idx) => (
                <div key={faq.q} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-semibold text-sm text-[#202020] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#3d5740] transition-transform shrink-0 ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <p className="mt-2 text-sm text-[#5C5C5C] leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="font-display font-extrabold text-3xl text-[#202020] mb-8">
            More from CraftedLabs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function BlogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { blogArticles } = useStore();
  const [activeTopic, setActiveTopic] = useState('All');

  if (slug) {
    const article = blogArticles.find((a) => a.slug === slug);
    if (!article) {
      return (
        <div className="pt-32 pb-24 min-h-screen bg-[#D6F0EE] px-5">
          <div className="max-w-lg mx-auto rounded-2xl bg-[#FFFDF7] p-8 text-center">
            <h1 className="font-display font-bold text-2xl text-[#202020]">
              Article not found
            </h1>
            <Link
              to="/blog"
              className="mt-4 inline-flex px-5 py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold"
            >
              Back to Journal
            </Link>
          </div>
        </div>
      );
    }

    return (
      <article className="pt-28 pb-24 min-h-screen bg-[#FFFDF7]">
        <div className="max-w-[780px] mx-auto px-5">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3d5740] hover:underline mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Articles
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#777777] mb-3">
            <span className="font-semibold text-[#3d5740]">{article.category}</span>
            <span aria-hidden="true">·</span>
            <span>{article.publishedAt}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-[#202020] leading-[1.08] [text-wrap:balance]">
            {article.title}
          </h1>

          <div className="my-8 rounded-2xl overflow-hidden border border-[#202020]/10">
            <img
              src={article.image}
              alt={article.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full aspect-[16/10] object-cover"
            />
          </div>

          <div className="space-y-5 text-base md:text-lg text-[#202020]/90 leading-relaxed">
            {article.body.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-[#D6F0EE]/60 border border-[#202020]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-display font-bold text-base text-[#202020]">
                Explore tools mentioned in our journal
              </p>
              <p className="text-xs text-[#5C5C5C] mt-0.5">
                Start with SoloBiz OS or browse our free starter worksheets.
              </p>
            </div>
            <Link
              to="/product/solobiz-os"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#3d5740] text-[#FFFDF7] text-xs font-semibold whitespace-nowrap shrink-0"
            >
              View SoloBiz OS ($9)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  const topics = ['All', ...Array.from(new Set(blogArticles.map((a) => a.category)))];
  const visible =
    activeTopic === 'All'
      ? blogArticles
      : blogArticles.filter((a) => a.category === activeTopic);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#D6F0EE]">
      <div className="max-w-[1360px] mx-auto px-5 md:px-10">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3d5740] mb-2">
            CraftedLabs Editorial
          </p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-[#202020]">
            Ideas from the CraftedLabs desk.
          </h1>
          <p className="text-base text-[#5C5C5C] mt-3">
            Essays and practical field notes on small business systems, AI
            workflows, design craft, and steady learning.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setActiveTopic(topic)}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                activeTopic === topic
                  ? 'bg-[#3d5740] text-[#FFFDF7]'
                  : 'bg-[#FFFDF7] text-[#5C5C5C] border border-[#202020]/10 hover:text-[#202020]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((article) => (
            <article
              key={article.id}
              className="group rounded-2xl bg-[#FFFDF7] border border-[#202020]/10 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <Link
                  to={`/blog/${article.slug}`}
                  className="block aspect-[4/3] overflow-hidden bg-[#E8EEEC]"
                >
                  <img
                    src={article.image}
                    alt={article.imageAlt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-[#777777] mb-2">
                    <span className="font-medium text-[#3d5740]">
                      {article.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{article.publishedAt}</span>
                  </div>
                  <Link to={`/blog/${article.slug}`}>
                    <h2 className="font-display font-bold text-xl text-[#202020] group-hover:text-[#3d5740] transition-colors">
                      {article.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-[#5C5C5C] mt-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <Link
                  to={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3d5740] hover:underline"
                >
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

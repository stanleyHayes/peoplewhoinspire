import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaArrowRight,
  FaArrowLeft,
  FaTag,
  FaNewspaper,
  FaUser,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader';
import { PublicCardGridSkeleton } from '../components/ui/Skeleton';
import api from '../services/api';
import type { Post } from '../types';
import PageHero from '../components/ui/PageHero';
import Watermark from '../components/ui/Watermark';
import { FALLBACK_POSTS, IMAGES } from '../data/siteContent';

const POSTS_PER_PAGE = 9;

const postImageFallbacks = [
  {
    pattern: /community|mentorship|network|together/i,
    image: IMAGES.communityStudy,
  },
  {
    pattern: /conversation|youtube|guest|dialogue|story/i,
    image: IMAGES.conversationsTable,
  },
  {
    pattern: /fellowship|cohort|formation/i,
    image: IMAGES.fellowshipCohort,
  },
  {
    pattern: /program|masterclass|workshop|learning/i,
    image: IMAGES.programsWorkshop,
  },
  {
    pattern: /event|gathering|stage|live/i,
    image: IMAGES.eventsStage,
  },
  {
    pattern: /news|welcome|platform|launch|impact|leadership|purpose/i,
    image: IMAGES.heroConversation,
  },
];

const defaultPostImages = [
  IMAGES.heroConversation,
  IMAGES.communityStudy,
  IMAGES.conversationsTable,
];

function getBlogPostImage(post: Post, index = 0) {
  const uploadedImage = post.coverImage || post.image;
  if (uploadedImage && uploadedImage !== IMAGES.blogEditorial) return uploadedImage;

  const searchable = [
    post.category,
    post.title,
    post.excerpt,
    ...(post.tags || []),
  ].join(' ');

  return (
    postImageFallbacks.find((fallback) => fallback.pattern.test(searchable))?.image ||
    defaultPostImages[index % defaultPostImages.length]
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await api.get('/posts', {
        params: { page: pageNum, limit: POSTS_PER_PAGE },
      });
      // Handle both paginated and non-paginated responses
      if (response.data.posts) {
        setPosts(response.data.posts.length > 0 ? response.data.posts : FALLBACK_POSTS);
        setTotalPages(response.data.pagination.pages);
        setTotal(response.data.pagination.total || FALLBACK_POSTS.length);
        setPage(response.data.pagination.page);
      } else {
        setPosts(response.data.length > 0 ? response.data : FALLBACK_POSTS);
        setTotalPages(1);
        setTotal(response.data.length || FALLBACK_POSTS.length);
      }
    } catch {
      setPosts(FALLBACK_POSTS);
      setTotalPages(1);
      setTotal(FALLBACK_POSTS.length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchPosts(newPage);
  };

  const featuredPost = posts.find((post) => post.featured) || posts[0];
  const gridPosts = featuredPost ? posts.filter((post) => post._id !== featuredPost._id) : posts;
  const categories = Array.from(new Set(posts.map((post) => post.category).filter(Boolean))).slice(0, 5);

  return (
    <>
      <PageHero
        eyebrow="Our Blog"
        title={<>Insights &amp; <span className="text-gold-400">Stories</span></>}
        description="Explore thought leadership articles, stories of impact, and insights from the PWI community."
        image={IMAGES.blogEditorial}
        imageAlt="Editorial workspace for writing leadership stories"
        icon={FaNewspaper}
        stats={[
          { value: total.toString(), label: 'Articles' },
          { value: 'PWI', label: 'Insights' },
          { value: 'Stories', label: 'Format' },
          { value: 'Impact', label: 'Theme' },
        ]}
      />

      {/* Blog Posts */}
      <section className="relative overflow-hidden bg-white py-24">
        <Watermark variant="radar" position="top-right" opacity={0.05} />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <SectionHeader
            subtitle="Latest Articles"
            title="From Our Blog"
            description="Stay updated with the latest insights, stories, and resources from the PWI community."
          />

          {categories.length > 0 && (
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <span key={category} className="pwi-meta-pill">
                  <FaTag className="text-[10px] text-gold-500" />
                  {category}
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <PublicCardGridSkeleton count={6} />
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaNewspaper className="text-gold-400 text-3xl" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-navy-800 mb-3">
                No Posts Yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We're working on creating amazing content. Check back soon!
              </p>
            </motion.div>
          ) : (
            <>
              {featuredPost && (
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-12 overflow-hidden rounded-2xl border border-navy-950/10 bg-[#f7f5ef] shadow-2xl shadow-navy-950/10"
                >
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="group grid lg:grid-cols-[0.86fr_1fr]"
                  >
                    <div className="pwi-image-panel min-h-[360px] lg:min-h-[440px]">
                      <img
                        src={getBlogPostImage(featuredPost)}
                        alt={featuredPost.title}
                      />
                      <div className="absolute left-6 top-6 z-10 flex items-center gap-2 bg-gold-400 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-navy-950">
                        <span className="h-1.5 w-1.5 rounded-full bg-navy-950" />
                        Featured story
                      </div>
                      <div className="absolute bottom-0 left-0 z-10 w-full p-6">
                        <p className="max-w-sm text-sm font-medium leading-6 text-white/80">
                          A selected editorial note from the People Who Inspire community.
                        </p>
                      </div>
                    </div>
                    <div className="relative flex min-h-[360px] flex-col justify-between bg-white p-8 md:p-10 lg:p-12">
                      <div className="absolute right-8 top-8 hidden font-serif text-8xl font-bold leading-none text-navy-950/[0.04] md:block">
                        PWI
                      </div>
                      <div className="relative z-10">
                        <div className="mb-8 flex flex-wrap items-center gap-3">
                          <span className="pwi-eyebrow text-gold-600">Featured</span>
                          {featuredPost.category && (
                            <span className="rounded-full border border-navy-950/10 bg-[#fbfaf6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                              {featuredPost.category}
                            </span>
                          )}
                        </div>

                        <h3 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-navy-950 md:text-5xl">
                          {featuredPost.title}
                        </h3>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="relative z-10 mt-10 border-t border-navy-950/10 pt-6">
                        <div className="mb-6 flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-2">
                            <FaCalendarAlt className="text-xs text-gold-500" />
                            {new Date(featuredPost.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {featuredPost.author && (
                            <span className="inline-flex items-center gap-2">
                              <FaUser className="text-xs text-gold-500" />
                              {featuredPost.author}
                            </span>
                          )}
                        </div>
                        <span className="pwi-btn pwi-btn-dark group-hover:bg-gold-400 group-hover:text-navy-950">
                          Read Featured Story
                          <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post, index) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="group"
                  >
                    <Link to={`/blog/${post.slug}`} className="block h-full">
                      <div className="pwi-card pwi-card-hover h-full">
                        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-navy-800 to-navy-600">
                          <img
                            src={getBlogPostImage(post, index + 1)}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,13,0.04),rgba(8,8,13,0.58))]" />
                          {post.featured && (
                            <div className="absolute top-3 right-3 px-2.5 py-1 bg-gold-400 text-navy-900 rounded-lg text-xs font-bold">
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-3">
                            {post.category && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-600">
                                <FaTag className="text-[10px]" />
                                {post.category}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <FaCalendarAlt className="text-[10px]" />
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-navy-800 mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <span className="inline-flex items-center gap-2 text-gold-500 font-semibold text-sm">
                            Read More
                            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 mt-16"
                >
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <FaArrowLeft className="text-xs" /> Previous
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          p === page
                            ? 'bg-navy-800 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    Next <FaArrowRight className="text-xs" />
                  </button>
                </motion.div>
              )}

              {/* Results info */}
              <p className="text-center text-sm text-gray-400 mt-4">
                Showing {(page - 1) * POSTS_PER_PAGE + 1}–{Math.min(page * POSTS_PER_PAGE, total)} of {total} posts
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}

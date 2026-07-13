import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaUser, FaTag, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';
import type { Post } from '../types';
import { setDocumentMeta } from '../components/SEO';
import { setPageJsonLd } from '../components/JsonLd';
import { SITE } from '../config/site';
import PageHero from '../components/ui/PageHero';
import Markdown from '../components/ui/Markdown';
import { PublicArticleSkeleton } from '../components/ui/Skeleton';
import Watermark from '../components/ui/Watermark';
import { useSiteContent } from '../context/SiteContentContext';

export default function BlogPostPage() {
  const { images } = useSiteContent();
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  // Per-post SEO title/description once the post loads.
  useEffect(() => {
    if (post) {
      const coverImage = post.coverImage || post.image;
      setDocumentMeta(
        {
          title: `${post.title} | PWI Blog`,
          description: post.excerpt || SITE.defaultDescription,
          type: 'article',
          ...(coverImage ? { image: coverImage } : {}),
        },
        `/blog/${post.slug}`,
      );
      setPageJsonLd({
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || SITE.defaultDescription,
        url: `${SITE.url}/blog/${post.slug}`,
        mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
        ...(coverImage ? { image: coverImage } : {}),
        ...(post.createdAt ? { datePublished: post.createdAt } : {}),
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        author: {
          '@type': 'Person',
          name: post.author || 'People Who Inspire',
        },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          logo: { '@type': 'ImageObject', url: `${SITE.url}/favicon.svg` },
        },
        ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
      });
    }
    return () => setPageJsonLd(null);
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${slug}`);
        setPost(response.data);
      } catch {
        // Placeholder
        setPost({
          _id: '1',
          title: 'The Power of Purpose-Driven Leadership',
          slug: 'power-of-purpose-driven-leadership',
          excerpt: 'Discover how leading with purpose can transform your organization.',
          content: `
            <h2>What is Purpose-Driven Leadership?</h2>
            <p>Purpose-driven leadership is about leading with intention, aligning your actions with your values, and creating meaningful impact in every sphere of your influence. It goes beyond traditional management to encompass a holistic approach to leadership that prioritizes service, integrity, and community transformation.</p>
            <p>At People Who Inspire, we believe that the most effective leaders are those who have discovered their purpose and use it as the foundation for everything they do. These leaders don't just manage teams—they inspire movements.</p>
            <h2>The Five Pillars of Purpose-Driven Leadership</h2>
            <p><strong>1. Self-Awareness:</strong> Understanding your strengths, weaknesses, values, and the unique contribution you can make to the world.</p>
            <p><strong>2. Vision:</strong> Having a clear picture of the future you want to create and the ability to communicate that vision to others.</p>
            <p><strong>3. Integrity:</strong> Consistently aligning your actions with your values, even when it's difficult or unpopular.</p>
            <p><strong>4. Service:</strong> Putting the needs of others first and using your leadership position as a platform for serving your community.</p>
            <p><strong>5. Impact:</strong> Measuring success not by personal achievements, but by the positive change you create in the lives of others.</p>
            <h2>How to Begin Your Purpose-Driven Leadership Journey</h2>
            <p>Starting your journey as a purpose-driven leader begins with reflection. Take time to consider what matters most to you, what problems you feel compelled to solve, and what legacy you want to leave behind.</p>
            <p>Surround yourself with a community of like-minded leaders who share your values and can support your growth. Programs like the PWI Fellowship and Conversations series provide the perfect environment for this kind of intentional development.</p>
            <p>Remember, purpose-driven leadership is not a destination—it's a journey. Every day presents new opportunities to lead with intention, serve with excellence, and create lasting impact.</p>
          `,
          coverImage: '',
          author: 'Emmanuel Mbansi',
          category: 'Leadership',
          tags: ['leadership', 'purpose', 'impact'],
          published: true,
          featured: true,
          createdAt: '2025-01-15',
          updatedAt: '2025-01-15',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return <PublicArticleSkeleton />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-navy-800 mb-4">Post Not Found</h2>
          <Link to="/blog" className="text-gold-500 hover:text-gold-600">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow={post.category || 'PWI Blog'}
        title={post.title}
        description={post.excerpt || SITE.defaultDescription}
        image={post.coverImage || post.image || images.blogEditorial}
        imageAlt={post.title}
        icon={FaTag}
        actions={[
          {
            label: 'Back to Blog',
            to: '/blog',
            icon: <FaArrowLeft />,
            variant: 'secondary',
          },
        ]}
        meta={
          <div className="mb-5 space-y-3 text-sm">
            <span className="flex items-center gap-2 text-gold-300">
              <FaTag /> {post.category}
            </span>
            <span className="flex items-center gap-2 text-gray-300">
              <FaCalendarAlt />
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-2 text-gray-300">
              <FaUser /> {post.author}
            </span>
          </div>
        }
      />

      {/* Content */}
      <section className="relative overflow-hidden bg-white py-16">
        <Watermark variant="contours" position="top-right" opacity={0.04} className="h-auto w-[34rem]" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="pwi-card mx-auto max-w-3xl p-6 md:p-10"
          >
            <Markdown source={post.content} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-navy-800">Tags:</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="pwi-meta-pill normal-case tracking-normal"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog */}
            <div className="mt-12">
              <Link
                to="/blog"
                className="pwi-btn pwi-btn-dark"
              >
                <FaArrowLeft />
                Back to Blog
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

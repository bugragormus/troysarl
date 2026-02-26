import Head from "next/head";
import { format } from "date-fns";
import { Calendar, User, ArrowLeft, Share, MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";

// Fetching paths for static generation
export async function getStaticPaths() {
  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published");

    if (error) throw error;

    const paths = posts.map((post) => ({
      params: { slug: post.slug },
    }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    console.error("Error fetching paths:", error);
    return { paths: [], fallback: "blocking" };
  }
}

// Fetching dynamic content
export async function getStaticProps({ params }: { params: { slug: string } }) {
  try {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(`
        *,
        author:author_id (
            email,
            raw_user_meta_data
        )
      `)
      .eq("slug", params.slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
       return { notFound: true };
    }

    return {
      props: {
        post,
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error("Static props error:", error);
    Sentry.captureException(error);
    return { notFound: true };
  }
}

export default function BlogPostDetail({ post }: { post: any }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-gray-500">Loading Article...</div>;
  }

  const canonicalUrl = `https://troysarl.com/news/${post.slug}`;
  const authorName = post.author?.raw_user_meta_data?.full_name || post.author?.email?.split('@')[0] || "Troy Cars Editorial";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.meta_title || post.title,
          text: post.meta_description || post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
         // User cancelled or share failed silently
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <>
      <Head>
        <title>{post.meta_title || `${post.title} | Troy Cars News`}</title>
        <meta name="description" content={post.meta_description || post.excerpt || "Read this automotive article at Troy Cars SARL."} />
        {post.keywords && <meta name="keywords" content={post.keywords} />}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt} />
        {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}

        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.meta_description || post.excerpt,
              "image": post.cover_image || [],
              "author": {
                "@type": "Person",
                "name": authorName
              },
              "datePublished": post.published_at,
              "dateModified": post.updated_at,
              "publisher": {
                "@type": "Organization",
                "name": "Troy Cars SARL",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://troysarl.com/logo.png" // Placeholder
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
              }
            })
          }}
        />
      </Head>

      <div className="bg-gradient-to-br from-gray-50 to-gray-200/50 dark:from-[#050505] dark:to-[#111] min-h-screen py-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/news" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:underline mb-12 group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to News
          </Link>

          <header className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-10">
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
              <span className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded-full">
                <Calendar size={14} className="mr-2" />
                {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : "Draft"}
              </span>
              <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <User size={14} className="mr-2" />
                {authorName}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-8">
              {post.title}
            </h1>

            {post.excerpt && (
               <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-blue-500 pl-6 italic">
                   {post.excerpt}
               </p>
            )}

            <div className="mt-8 flex items-center justify-between">
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all font-medium shadow-sm"
                >
                  <Share2 size={18} />
                  <span>Share Article</span>
                </button>
            </div>
          </header>

          <article className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight 
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-img:rounded-3xl prose-img:shadow-2xl mb-24"
             dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </>
  );
}

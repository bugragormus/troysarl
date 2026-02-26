import Head from "next/head";
import { format } from "date-fns";
import { Calendar, User, ArrowLeft, Share, MapPin, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Sentry from "@sentry/react";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

// Initialize admin client strictly for server-side Next.js functions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetching paths for static generation
export async function getStaticPaths() {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug")
      .eq("status", "published");

    if (error) throw error;

    const paths = (posts || []).map((post) => ({
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
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
       console.error(`Post [${params.slug}] Fetch Error:`, error);
       return { notFound: true };
    }

    // Attempt to manually fetch author details if an author_id exists
    let authorData = null;
    if (post.author_id) {
       try {
           const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(post.author_id);
           if (userAuth && userAuth.user) {
               authorData = {
                   email: userAuth.user.email,
                   raw_user_meta_data: userAuth.user.user_metadata
               };
           }
       } catch (err) {
           console.error("DEBUG News: Failed to fetch author metadata:", err);
       }
    }

    return {
      props: {
        post: {
            ...post,
            author: authorData
        }
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

      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-b dark:from-premium-light dark:to-premium-dark py-32 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 py-12 lg:py-16 bg-white/80 dark:bg-gray-900/60 backdrop-blur-2xl rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none border border-white/60 dark:border-gray-700/50 mb-20 relative overflow-hidden">
          
          {/* Decorative Background Blob */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <Link href="/news" className="relative z-10 inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 mb-12 group transition-colors">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to News
          </Link>

          <header className="relative z-10 mb-12 border-b border-gray-200/50 dark:border-gray-800/80 pb-10">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">
              <span className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100/50 dark:border-blue-800/30">
                <Calendar size={14} className="mr-2" />
                {post.published_at ? format(new Date(post.published_at), "MMMM d, yyyy") : "Draft"}
              </span>
              <span className="flex items-center bg-gray-100/80 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">
                <User size={14} className="mr-2" />
                {authorName}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-8 tracking-tight">
              {post.title}
            </h1>

            {post.excerpt && (
               <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-blue-500 pl-6 italic font-medium">
                   {post.excerpt}
               </p>
            )}

            <div className="mt-10 flex items-center justify-between">
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all font-bold shadow-sm"
                >
                  <Share2 size={18} />
                  <span>Share Article</span>
                </button>
            </div>
          </header>

          <article className="relative z-10 prose prose-lg md:prose-xl dark:prose-invert max-w-none 
                prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-img:rounded-3xl prose-img:shadow-2xl mb-12"
             dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </>
  );
}

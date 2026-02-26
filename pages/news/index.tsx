import Head from "next/head";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, User, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function NewsIndex() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublishedPosts() {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, published_at, meta_description")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublishedPosts();
  }, []);

  return (
    <>
      <Head>
        <title>Latest News & Car Reviews | Troy Cars SARL</title>
        <meta name="description" content="Read the latest news, car reviews, and automotive guides from the experts at Troy Cars SARL." />
        <link rel="canonical" href="https://troysarl.com/news" />
        <meta property="og:title" content="Latest News & Car Reviews | Troy Cars SARL" />
        <meta property="og:description" content="Read the latest news, car reviews, and automotive guides from the experts at Troy Cars SARL." />
        <meta property="og:url" content="https://troysarl.com/news" />
        <meta property="og:type" content="blog" />
      </Head>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-[#0a0a0a] min-h-screen py-24 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">News & Guides</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Stay up to date with the newest arrivals, in-depth car reviews, and exclusive automotive insights from the Troy Cars team.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 h-80 animate-pulse shadow-sm border border-gray-100 dark:border-gray-800" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
              <FileText size={48} className="mx-auto text-gray-400 opacity-50 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No articles published yet</h2>
              <p className="text-gray-500">Check back later for exciting automotive news and reviews.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link href={`/news/${post.slug}`} key={post.id}>
                  <article 
                    className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all duration-300 group h-full flex flex-col cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wider">
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1.5" />
                        {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : "Draft"}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 flex-1 leading-relaxed">
                      {post.meta_description || post.excerpt || "Click to read the full article..."}
                    </p>
                    
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform mt-auto">
                      Read Article <ArrowRight size={18} className="ml-2" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";
import { useContentData, BlogPost } from "@/hooks/useContentData";
import { Edit, Trash2, Plus, Globe, FileText, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ContentManager() {
  const { posts, loading, fetchPosts, savePost, deletePost } = useContentData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentPost({
      status: "draft",
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      meta_title: "",
      meta_description: "",
      keywords: ""
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.slug) {
      toast.error("Title and SEO Slug are required.");
      return;
    }
    const success = await savePost(currentPost);
    if (success) {
      setIsEditing(false);
    }
  };

  if (loading && posts.length === 0) {
    return <div className="text-gray-500 animate-pulse p-8">Loading content...</div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold dark:text-white">
            {currentPost.id ? "Edit Post" : "Draft New Post"}
          </h2>
          <button 
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={currentPost.title || ""}
                  onChange={(e) => {
                     // Auto generate slug if creating new
                     const title = e.target.value;
                     const updates: any = { title };
                     if (!currentPost.id) {
                         updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                     }
                     setCurrentPost({ ...currentPost, ...updates });
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                  placeholder="e.g. Top 5 Luxury SUVs of 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug (SEO) *</label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl text-gray-500 text-sm">/news/</span>
                  <input
                    type="text"
                    required
                    value={currentPost.slug || ""}
                    onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-r-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                    placeholder="top-5-luxury-suvs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={currentPost.status || "draft"}
                  onChange={(e) => setCurrentPost({ ...currentPost, status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all appearance-none"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Published (Public)</option>
                  <option value="archived">Archived (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center mb-4">
                <Globe size={18} className="mr-2" />
                SEO Metadata
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Meta Title (Max 60 chars)</label>
                <input
                  type="text"
                  value={currentPost.meta_title || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, meta_title: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Meta Description (Max 160 chars)</label>
                <textarea
                  rows={2}
                  value={currentPost.meta_description || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, meta_description: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Article Content (HTML/Markdown support planned)</label>
             <textarea
                required
                rows={12}
                value={currentPost.content || ""}
                onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                className="w-full font-mono text-sm leading-relaxed px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 transition-all"
                placeholder="<p>Write your amazing car review here...</p>"
             />
          </div>

          <div className="pt-4 flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-800">
             <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
             >
                Cancel
             </button>
             <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center"
             >
                {currentPost.id ? "Update Post" : "Save & Create"}
             </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Content Manager (Blog)</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage SEO articles, news, and guides.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Write Article
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800/50">
          {posts.map((post) => (
            <li key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${post.status === "published" ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    {post.title}
                    {post.status === "published" ? (
                       <span className="ml-3 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full flex items-center">
                         <Globe size={10} className="mr-1" /> Published
                       </span>
                    ) : (
                       <span className="ml-3 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-700">
                         Draft
                       </span>
                    )}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    /news/{post.slug}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleEdit(post)}
                   className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                 >
                   <Edit size={18} />
                 </button>
                 <button 
                   onClick={() => deletePost(post.id)}
                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            </li>
          ))}
          {posts.length === 0 && (
            <li className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No articles found. Create your first piece of content to boost SEO!</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

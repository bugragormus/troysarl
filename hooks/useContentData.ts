import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  status: "draft" | "published" | "archived";
  meta_title: string;
  meta_description: string;
  keywords: string;
  published_at: string;
  created_at: string;
  views_count?: number;
}

export function useContentData() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin-content');
      if (!response.ok) throw new Error("Failed to load blog posts");
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePost = async (post: Partial<BlogPost>) => {
    try {
      const response = await fetch('/api/admin-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(post)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save post");
      }
      
      toast.success(`Post ${post.id ? 'updated' : 'created'} successfully!`);
      await fetchPosts();
      return true;
    } catch (error: any) {
      console.error("Failed to save post:", error);
      toast.error(error.message || "Failed to save post.");
      return false;
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this post?")) return false;
    try {
      const response = await fetch(`/api/admin-content?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Deletion failed");
      
      toast.success("Post deleted.");
      await fetchPosts();
      return true;
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error(error.message || "Deletion failed");
      return false;
    }
  };

  return {
    posts,
    loading,
    fetchPosts,
    savePost,
    deletePost
  };
}

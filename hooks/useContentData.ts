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
}

export function useContentData() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePost = async (post: Partial<BlogPost>) => {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      
      const postData = {
        ...post,
        author_id: userAuth?.user?.id,
        updated_at: new Date().toISOString()
      };

      if (post.status === "published" && !post.published_at) {
        postData.published_at = new Date().toISOString();
      }

      let error;
      if (post.id) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", post.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("blog_posts")
          .insert([postData]);
        error = insertError;
      }

      if (error) throw error;
      toast.success(`Post ${post.id ? 'updated' : 'created'} successfully!`);
      await fetchPosts();
      return true;
    } catch (error: any) {
      console.error("Failed to save post:", error);
      // More specific error handling for unique slugs
      if (error.code === '23505' && error.message.includes('slug')) {
         toast.error("This SEO slug is already in use. Please choose another.");
      } else {
         toast.error(error.message || "Failed to save post.");
      }
      return false;
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this post?")) return false;
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Post deleted.");
      await fetchPosts();
      return true;
    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast.error("Deletion failed");
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

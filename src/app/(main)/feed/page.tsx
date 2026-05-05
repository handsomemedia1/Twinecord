"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    isPremium: boolean;
    profile: { displayName: string } | null;
  };
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    isPremium: boolean;
    profile: { displayName: string, city: string, state: string } | null;
  };
  comments: Comment[];
};

export default function CommunityFeedPage() {
  const { data: session } = useSession();
  const isPremium = session?.user?.isPremium || false;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Post Creation
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // Comment Creation State (keyed by postId)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/feed");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !isPremium || isPosting) return;

    setIsPosting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent })
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setNewPostContent("");
      } else {
        alert("Failed to create post.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      const res = await fetch(`/api/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistically update the UI
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, comments: [...p.comments, data.comment] };
          }
          return p;
        }));
        // Clear input
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        // Expand comments if not already
        setExpandedComments(prev => ({ ...prev, [postId]: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-background border-x border-border flex flex-col pb-24 md:pb-0">
      
      {/* HEADER */}
      <div className="p-4 sm:p-6 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">Community Thread</h1>
        <p className="text-sm text-muted-foreground">Share encouragement, advice, and testimonies with the TwineCord community.</p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        
        {/* CREATE POST COMPONENT */}
        <div className="bg-card rounded-3xl border border-border p-4 shadow-sm relative overflow-hidden">
          {!isPremium && (
            <div className="absolute inset-0 bg-secondary/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-3xl p-6 text-center">
              <svg className="w-10 h-10 text-tc-gold mb-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2l2.5 5.5L18 8l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-.5L10 2z" clipRule="evenodd" /></svg>
              <h3 className="text-lg font-bold text-foreground mb-1">Premium Feature</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">Only Premium members can create public posts, helping us maintain a high-quality, intentional community feed.</p>
              <button className="px-6 py-2 bg-tc-primary text-white font-bold rounded-xl shadow-lg shadow-tc-primary/20 hover:scale-105 transition-transform">
                Upgrade to Premium
              </button>
            </div>
          )}

          <form onSubmit={handleCreatePost}>
            <div className="flex gap-4 mb-4">
              <div className="w-12 h-12 bg-secondary rounded-full relative overflow-hidden flex-shrink-0">
                <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
              </div>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                maxLength={1000}
                placeholder="Share something encouraging..." 
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-20 outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-between items-center border-t border-border pt-3">
              <div className="text-xs text-muted-foreground font-medium">
                {newPostContent.length} / 1000
              </div>
              <button 
                type="submit"
                disabled={!newPostContent.trim() || isPosting}
                className="px-6 py-2 bg-tc-primary hover:bg-tc-primary-dark text-white font-bold rounded-full transition-all disabled:opacity-50"
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* FEED POSTS */}
        {isLoading ? (
          <div className="flex justify-center py-12 text-tc-primary"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* Post Header */}
                <div className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full relative overflow-hidden flex-shrink-0">
                    <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                      {post.author.profile?.displayName || "Unknown"}
                      {post.author.isPremium && <svg className="w-3.5 h-3.5 text-tc-gold" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2l2.5 5.5L18 8l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-.5L10 2z" clipRule="evenodd" /></svg>}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()} • {post.author.profile?.city}, {post.author.profile?.state}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-5 pb-4 text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>

                {/* Post Actions */}
                <div className="px-5 py-3 border-t border-border flex items-center gap-6 text-sm font-semibold text-muted-foreground">
                  <button className="flex items-center gap-2 hover:text-tc-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    Like
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center gap-2 transition-colors ${expandedComments[post.id] ? "text-tc-primary" : "hover:text-tc-primary"}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {post.comments.length} Comments
                  </button>
                </div>

                {/* Hidden Comments Section (Facebook style) */}
                {expandedComments[post.id] && (
                  <div className="bg-secondary/20 border-t border-border">
                    {/* Add Comment Input */}
                    <div className="p-4 border-b border-border flex gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full relative overflow-hidden flex-shrink-0 mt-1">
                         <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                          placeholder="Write a comment..." 
                          className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tc-primary"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="px-4 py-2 bg-tc-primary/10 text-tc-primary hover:bg-tc-primary hover:text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="p-4 space-y-4">
                      {post.comments.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-2">No comments yet.</p>
                      ) : (
                        post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-secondary rounded-full relative overflow-hidden flex-shrink-0">
                               <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block">
                                <h5 className="font-bold text-xs text-foreground flex items-center gap-1 mb-0.5">
                                  {comment.author.profile?.displayName}
                                  {comment.author.isPremium && <svg className="w-3 h-3 text-tc-gold" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2l2.5 5.5L18 8l-4 4.5 1 6-5-3-5 3 1-6-4-4.5 5.5-.5L10 2z" clipRule="evenodd" /></svg>}
                                </h5>
                                <p className="text-sm text-foreground">{comment.content}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 ml-2">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

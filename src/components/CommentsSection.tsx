"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "./AuthModal";
import { MessageCircle, Send, Heart, Reply, Trash2, ChevronDown, ChevronUp, User, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  article_slug: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  user_id: string | null;
  is_approved: boolean;
  _likes: number;
  _userLiked: boolean;
  _replies?: Comment[];
}

export default function CommentsSection({ slug }: { slug: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const loadComments = async () => {
    // Load comments with like counts
    const { data: rawComments } = await supabase
      .from("article_comments")
      .select("*")
      .eq("article_slug", slug)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    const { data: likesData } = await supabase
      .from("comment_likes")
      .select("comment_id, user_id");

    const commentsList: Comment[] = (rawComments || []).map(c => ({
      ...c,
      _likes: (likesData || []).filter(l => l.comment_id === c.id).length,
      _userLiked: user ? (likesData || []).some(l => l.comment_id === c.id && l.user_id === user.id) : false,
      _replies: [],
    }));

    // Nest replies under parents
    const topLevel = commentsList.filter(c => !c.parent_id);
    const replies = commentsList.filter(c => c.parent_id);
    replies.forEach(r => {
      const parent = topLevel.find(t => t.id === r.parent_id);
      if (parent) parent._replies!.push(r);
    });

    setComments(topLevel);
    setLoading(false);
  };

  useEffect(() => { loadComments(); }, [slug, user]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string, text?: string) => {
    e.preventDefault();
    const body = text ?? content;
    if (!body.trim()) return;
    if (!user) { setShowAuth(true); return; }

    setSubmitting(true);
    const { error } = await supabase.from("article_comments").insert({
      article_slug: slug,
      author_name: profile?.display_name || user.email?.split("@")[0] || "User",
      content: body.trim(),
      user_id: user.id,
      parent_id: parentId || null,
      is_approved: true,
    });
    setSubmitting(false);
    if (!error) {
      if (parentId) { setReplyTo(null); setReplyContent(""); }
      else { setContent(""); setSubmitted(true); setTimeout(() => setSubmitted(false), 2000); }
      loadComments();
    }
  };

  const handleLike = async (commentId: string, liked: boolean) => {
    if (!user) { setShowAuth(true); return; }
    setLikeLoading(commentId);
    if (liked) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
    }
    setLikeLoading(null);
    loadComments();
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from("article_comments").delete().eq("id", commentId);
    loadComments();
  };

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c._replies?.length || 0), 0);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={loadComments} />}

      <h2 className="flex items-center gap-2 text-xl font-bold font-serif text-gray-900 dark:text-white mb-6">
        <MessageCircle size={20} className="text-amber-600" />
        Comments {totalCount > 0 && <span className="text-sm font-normal text-gray-400">({totalCount})</span>}
      </h2>

      {/* Main comment form */}
      <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
        {user ? (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
              {(profile?.display_name || user.email || "U")[0]}
            </div>
            <div className="flex-1">
              <textarea
                value={content} onChange={e => setContent(e.target.value)}
                rows={3} placeholder={`Share your thoughts as ${profile?.display_name || "yourself"}…`}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white dark:focus:bg-gray-800/80 resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">Signed in as <span className="font-medium text-gray-600 dark:text-gray-300">{profile?.display_name || user.email}</span></span>
                <button type="submit" disabled={submitting || !content.trim()}
                  className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {submitted ? "Posted!" : "Post"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowAuth(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2">
            <User size={15} /> Sign in to leave a comment
          </button>
        )}
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-amber-600" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-6">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              profile={profile}
              onLike={handleLike}
              onReply={setReplyTo}
              onDelete={handleDelete}
              likeLoading={likeLoading}
              replyTo={replyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmit}
              submitting={submitting}
              onShowAuth={() => setShowAuth(true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, user, profile, onLike, onReply, onDelete, likeLoading, replyTo, replyContent, setReplyContent, onSubmitReply, submitting, onShowAuth }: any) {
  const isReplying = replyTo?.id === comment.id;
  const isOwn = user && comment.user_id === user.id;

  return (
    <div>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
          {comment.author_name[0]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.author_name}</span>
              <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5 ml-1">
            <button onClick={() => onLike(comment.id, comment._userLiked)}
              disabled={likeLoading === comment.id}
              className={`inline-flex items-center gap-1 text-xs transition-colors ${comment._userLiked ? "text-red-500 dark:text-red-400" : "text-gray-400 hover:text-red-400"}`}>
              {likeLoading === comment.id
                ? <Loader2 size={12} className="animate-spin" />
                : <Heart size={12} fill={comment._userLiked ? "currentColor" : "none"} />}
              {comment._likes > 0 && <span>{comment._likes}</span>}
            </button>
            <button onClick={() => {
              if (!user) { onShowAuth(); return; }
              onReply(isReplying ? null : comment);
            }}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors">
              <Reply size={12} /> Reply
            </button>
            {isOwn && (
              <button onClick={() => onDelete(comment.id)}
                className="inline-flex items-center gap-1 text-xs text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors ml-auto">
                <Trash2 size={11} />
              </button>
            )}
          </div>

          {/* Reply input */}
          {isReplying && (
            <form onSubmit={(e) => onSubmitReply(e, comment.id, replyContent)} className="mt-3 flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-amber-700 uppercase">
                {(profile?.display_name || user?.email || "U")[0]}
              </div>
              <div className="flex-1">
                <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)}
                  rows={2} placeholder={`Reply to ${comment.author_name}…`} autoFocus
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" />
                <div className="flex gap-2 mt-1.5">
                  <button type="submit" disabled={submitting || !replyContent.trim()}
                    className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                    {submitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Reply
                  </button>
                  <button type="button" onClick={() => onReply(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1.5">Cancel</button>
                </div>
              </div>
            </form>
          )}

          {/* Nested replies */}
          {comment._replies?.length > 0 && (
            <div className="mt-3 ml-2 pl-3 border-l-2 border-gray-100 dark:border-gray-800 space-y-3">
              {comment._replies.map((reply: any) => (
                <div key={reply.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-400 uppercase border border-gray-200 dark:border-gray-700">
                    {reply.author_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-sm px-3 py-2.5">
                      <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{reply.author_name}</span>
                        <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{reply.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1">
                      <button onClick={() => onLike(reply.id, reply._userLiked)}
                        disabled={likeLoading === reply.id}
                        className={`inline-flex items-center gap-1 text-[11px] transition-colors ${reply._userLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
                        {likeLoading === reply.id ? <Loader2 size={10} className="animate-spin" /> : <Heart size={10} fill={reply._userLiked ? "currentColor" : "none"} />}
                        {reply._likes > 0 && <span>{reply._likes}</span>}
                      </button>
                      {user && reply.user_id === user.id && (
                        <button onClick={() => onDelete(reply.id)} className="text-[11px] text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors ml-auto">
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

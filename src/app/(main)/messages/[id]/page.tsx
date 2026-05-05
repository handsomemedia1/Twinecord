"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

export default function ChatThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Initialize Pusher Client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`chat-${threadId}`);
    
    channel.bind("new-message", (newMsg: Message) => {
      setMessages((prev) => {
        // Prevent duplicate messages if we are the sender (since fetchMessages might also run)
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      pusher.unsubscribe(`chat-${threadId}`);
    };
  }, [threadId]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const contentToSend = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const res = await fetch(`/api/messages/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend })
      });

      if (res.ok) {
        fetchMessages(); // Immediately refetch to show new message
      } else {
        setNewMessage(contentToSend); // Revert on failure
        alert("Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      setNewMessage(contentToSend); // Revert
    } finally {
      setIsSending(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || isReporting) return;
    setIsReporting(true);
    try {
      const otherUserId = messages.length > 0 
        ? (messages[0].senderId === currentUserId ? messages[0].receiverId : messages[0].senderId)
        : threadId.replace("inmail-", ""); // Best guess if no messages

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedId: otherUserId,
          reason: reportReason,
          matchId: threadId.startsWith("inmail-") ? null : threadId
        })
      });

      if (res.ok) {
        alert("Report submitted successfully. Admins will review the transcript.");
        setShowReportModal(false);
      } else {
        alert("Failed to submit report.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading && messages.length === 0) {
    return <div className="h-full flex items-center justify-center text-tc-primary"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-64px)] md:h-screen bg-background flex flex-col border-x border-border">
      
      {/* CHAT HEADER */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link href="/messages" className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="w-10 h-10 bg-secondary rounded-full relative overflow-hidden flex-shrink-0">
          <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
        </div>
        <div>
          <h2 className="font-bold text-foreground">Chat</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {/* Daily.co Video Call button placeholder */}
          <button className="p-2.5 bg-tc-primary/10 text-tc-primary rounded-full hover:bg-tc-primary/20 transition-colors" title="Start Video Call">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
          </button>
          <button 
            onClick={() => setShowReportModal(true)}
            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" 
            title="Report User"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
          </button>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-tc-blush/10">
        
        {/* Icebreaker or safety notice at top */}
        <div className="text-center my-6">
          <div className="inline-block bg-secondary/80 text-muted-foreground text-xs px-4 py-2 rounded-full font-medium shadow-sm">
            You matched! Keep conversations respectful and intentional.
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-br from-tc-primary to-rose-500 text-white rounded-tr-sm' 
                    : 'bg-card border border-border text-foreground rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button type="button" className="p-3 text-muted-foreground hover:text-tc-primary bg-secondary/50 hover:bg-secondary rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type an intentional message..." 
            className="flex-1 px-4 py-3 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tc-primary focus:border-tc-primary transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isSending}
            className="px-5 py-3 bg-tc-primary text-white font-bold rounded-xl hover:bg-tc-primary-dark transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center shadow-lg shadow-tc-primary/20"
          >
            <svg className="w-5 h-5 -rotate-45 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="text-lg font-bold text-foreground">Report User</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              If this user has behaved inappropriately, please submit a report. **Submitting this report will allow TwineCord Admins to securely review this chat transcript for safety investigations.**
            </p>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Please explain what happened..."
              className="w-full px-4 py-3 border border-border rounded-xl bg-background mb-4 resize-none h-24 focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 font-semibold text-foreground bg-secondary rounded-xl">Cancel</button>
              <button onClick={handleReport} disabled={isReporting || !reportReason.trim()} className="flex-1 py-2 font-semibold text-white bg-rose-600 rounded-xl disabled:opacity-50">Submit Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

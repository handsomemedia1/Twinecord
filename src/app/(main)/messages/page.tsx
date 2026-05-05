"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Conversation = {
  id: string; // match.id OR "inmail-{otherUserId}"
  isMatch: boolean;
  otherUser: {
    id: string;
    isPremium: boolean;
    profile: {
      displayName: string;
      photos: string; // JSON
    } | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
};

export default function MessagesInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-tc-primary"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="max-w-2xl mx-auto h-full bg-background border-x border-border flex flex-col">
      <div className="p-6 border-b border-border bg-card sticky top-0 z-10">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-tc-primary/10 rounded-full flex items-center justify-center text-tc-primary mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">When you match with someone or receive an InMail, the conversation will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <Link 
                key={conv.id} 
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors block"
              >
                <div className="w-14 h-14 bg-secondary rounded-full relative overflow-hidden flex-shrink-0">
                  <Image src="/couple-photo.png" alt="Profile" fill className="object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5 truncate">
                      {conv.otherUser.profile?.displayName}
                      {!conv.isMatch && (
                        <span className="text-[10px] font-bold bg-tc-gold/20 text-tc-gold px-1.5 py-0.5 rounded uppercase tracking-wider">InMail</span>
                      )}
                    </h4>
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage ? (
                      <>
                        {conv.lastMessage.senderId !== conv.otherUser.id && "You: "}
                        {conv.lastMessage.content}
                      </>
                    ) : (
                      <span className="italic">Say hello!</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

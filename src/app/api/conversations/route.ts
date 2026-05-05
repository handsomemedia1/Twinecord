import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // 1. Fetch active Matches (standard conversations)
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ]
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    // 2. Fetch Premium InMails (where current user is sender or receiver and matchId is null)
    const inMails = await prisma.message.findMany({
      where: {
        matchId: null,
        isPremiumDirectMessage: true,
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      include: {
        sender: { include: { profile: true } },
        receiver: { include: { profile: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group InMails by the other person
    const inMailThreadsMap = new Map();
    for (const msg of inMails) {
      const otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      
      if (!inMailThreadsMap.has(otherUserId)) {
        inMailThreadsMap.set(otherUserId, {
          id: `inmail-${otherUserId}`,
          otherUser,
          lastMessage: msg,
          isMatch: false
        });
      }
    }

    // Format Matches
    const formattedMatches = matches.map((match: typeof matches[0]) => {
      const isUser1 = match.user1Id === currentUserId;
      const otherUser = isUser1 ? match.user2 : match.user1;
      return {
        id: match.id,
        otherUser,
        lastMessage: match.messages[0] || null,
        isMatch: true
      };
    });

    // Combine and sort by last activity
    const allConversations = [...formattedMatches, ...Array.from(inMailThreadsMap.values())].sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ conversations: allConversations }, { status: 200 });

  } catch (error) {
    console.error("Conversations fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

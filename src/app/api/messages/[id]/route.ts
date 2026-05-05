import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

// GET messages for a specific thread
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const currentUserId = session.user.id;
    const { id: threadId } = await params;

    let messages = [];

    if (threadId.startsWith("inmail-")) {
      const otherUserId = threadId.replace("inmail-", "");
      messages = await prisma.message.findMany({
        where: {
          matchId: null,
          isPremiumDirectMessage: true,
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId }
          ]
        },
        orderBy: { createdAt: "asc" }
      });
    } else {
      // Standard Match
      const match = await prisma.match.findUnique({ where: { id: threadId } });
      if (!match || (match.user1Id !== currentUserId && match.user2Id !== currentUserId)) {
        return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
      }
      messages = await prisma.message.findMany({
        where: { matchId: threadId },
        orderBy: { createdAt: "asc" }
      });
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST a new message
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const currentUserId = session.user.id;
    const { id: threadId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: "Message cannot be empty" }, { status: 400 });
    }

    let newMessage;

    if (threadId.startsWith("inmail-")) {
      const otherUserId = threadId.replace("inmail-", "");
      
      // Enforce the 3 InMail limit per person if we want, but keeping it simple for now.
      // Must be premium to SEND an InMail initially, but replies are free. 
      // We will assume the UI gates the premium status.
      
      newMessage = await prisma.message.create({
        data: {
          senderId: currentUserId,
          receiverId: otherUserId,
          content,
          isPremiumDirectMessage: true
        }
      });
    } else {
      // Standard Match
      const match = await prisma.match.findUnique({ where: { id: threadId } });
      if (!match || (match.user1Id !== currentUserId && match.user2Id !== currentUserId)) {
        return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
      }
      
      const receiverId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;

      newMessage = await prisma.message.create({
        data: {
          matchId: threadId,
          senderId: currentUserId,
          receiverId: receiverId,
          content,
        }
      });
    }

    // Trigger Pusher Event
    await pusherServer.trigger(`chat-${threadId}`, "new-message", newMessage);

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

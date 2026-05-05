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

    // 1. Fetch Pending Received Requests
    const pendingRequests = await prisma.connectionRequest.findMany({
      where: {
        receiverId: currentUserId,
        status: "PENDING"
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Fetch Active Matches
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserId },
          { user2Id: currentUserId }
        ]
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Format matches so we just get the "other person"
    const formattedMatches = matches.map((match: typeof matches[0]) => {
      const isUser1 = match.user1Id === currentUserId;
      const otherUser = isUser1 ? match.user2 : match.user1;
      return {
        id: match.id,
        createdAt: match.createdAt,
        otherUser
      };
    });

    return NextResponse.json({ 
      pendingRequests, 
      matches: formattedMatches 
    }, { status: 200 });

  } catch (error) {
    console.error("Matches fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

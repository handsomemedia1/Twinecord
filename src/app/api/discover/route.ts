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

    // Fetch the current user's profile for the algorithm scoring
    const currentUserProfile = await prisma.profile.findUnique({
      where: { userId: currentUserId }
    });

    // 1. Fetch blocks
    const userBlocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: currentUserId },
          { blockedId: currentUserId }
        ]
      }
    });
    
    // 1.5 Find all users we've already interacted with
    const sentRequests = await prisma.connectionRequest.findMany({
      where: { senderId: currentUserId },
      select: { receiverId: true }
    });
    
    const receivedRequests = await prisma.connectionRequest.findMany({
      where: { receiverId: currentUserId, status: { in: ["PENDING", "ACCEPTED"] } },
      select: { senderId: true }
    });

    const matches1 = await prisma.match.findMany({
      where: { user1Id: currentUserId },
      select: { user2Id: true }
    });

    const matches2 = await prisma.match.findMany({
      where: { user2Id: currentUserId },
      select: { user1Id: true }
    });

    const excludedIds = new Set([
      currentUserId,
      ...sentRequests.map((r: { receiverId: string }) => r.receiverId),
      ...receivedRequests.map((r: { senderId: string }) => r.senderId),
      ...matches1.map((m: { user2Id: string }) => m.user2Id),
      ...matches2.map((m: { user1Id: string }) => m.user1Id),
      ...userBlocks.map((b: { blockerId: string; blockedId: string }) => b.blockerId === currentUserId ? b.blockedId : b.blockerId)
    ]);

    // 2. Fetch candidates (Profiles)
    // BIG TECH FILTER: Exclude shadowbanned users, paused accounts, and unverified accounts
    const rawCandidates = await prisma.profile.findMany({
      where: {
        userId: { notIn: Array.from(excludedIds) },
        user: { isShadowbanned: false },
        isPaused: false,
        verificationStatus: "VERIFIED",
        // Apply current user's filters
        ...(currentUserProfile?.filterDenomination ? { denomination: currentUserProfile.filterDenomination } : {})
      },
      include: {
        user: { select: { name: true, isPremium: true, role: true, isBoosted: true } }
      },
      take: 100, // Fetch pool to score
    });

    // 3. The 3-Pillar Match Scoring Algorithm
    // Calculate a dynamic score for each candidate to sort them
    const scoredCandidates = rawCandidates.filter(candidate => {
      // Manual Age filtering (SQLite Date math is tricky, so we filter in memory for demo)
      const age = new Date().getFullYear() - new Date(candidate.dateOfBirth).getFullYear();
      if (currentUserProfile) {
        if (age < currentUserProfile.filterMinAge || age > currentUserProfile.filterMaxAge) return false;
      }
      return true;
    }).map(candidate => {
      let score = 0;

      // ELON MUSK MODE: Massive algorithm boost for Admins
      if ((candidate.user as any).role === "ADMIN") {
        score += 1000;
      }

      // ADMIN GRANTED BOOST
      if ((candidate.user as any).isBoosted) {
        score += 500;
      }

      // Pillar 1: Location Priority (+30 points for same city, +10 for same state)
      if (currentUserProfile?.city && candidate.city?.toLowerCase() === currentUserProfile.city.toLowerCase()) {
        score += 30;
      } else if (currentUserProfile?.state && candidate.state?.toLowerCase() === currentUserProfile.state.toLowerCase()) {
        score += 10;
      }

      // Pillar 2: Denomination Alignment (+25 points)
      if (currentUserProfile?.denomination && candidate.denomination === currentUserProfile.denomination) {
        score += 25;
      }

      // Pillar 3: Intentionality / Love Philosophy
      // Very basic keyword matching for the demo. Real version would use embeddings/vector search.
      if (currentUserProfile?.lovePhilosophy && candidate.lovePhilosophy) {
        const myWords = currentUserProfile.lovePhilosophy.toLowerCase().split(" ");
        const theirWords = candidate.lovePhilosophy.toLowerCase().split(" ");
        const commonWords = myWords.filter((w: string) => w.length > 4 && theirWords.includes(w));
        score += (commonWords.length * 2); // +2 points per common significant word
      }

      return { ...candidate, matchScore: score };
    });

    // Sort by matchScore descending, then take top 20
    scoredCandidates.sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore);
    const candidates = scoredCandidates.slice(0, 20);

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    console.error("Discovery error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

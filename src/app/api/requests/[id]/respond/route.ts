import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const respondSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = respondSchema.parse(body);

    const { id: requestId } = await params;

    // 1. Find the request
    const request = await prisma.connectionRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // 2. Ensure the current user is the receiver
    if (request.receiverId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to respond to this request" }, { status: 403 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json({ message: "Request has already been processed" }, { status: 400 });
    }

    // 3. Update the request status
    await prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status }
    });

    // 4. If ACCEPTED, create a Match
    if (status === "ACCEPTED") {
      await prisma.match.create({
        data: {
          user1Id: request.senderId,
          user2Id: request.receiverId
        }
      });
    }

    return NextResponse.json({ message: `Request ${status.toLowerCase()} successfully` }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Respond error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

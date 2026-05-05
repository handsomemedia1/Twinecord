import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  receiverId: z.string(),
  answerToReview: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, answerToReview } = requestSchema.parse(body);

    if (session.user.id === receiverId) {
      return NextResponse.json({ message: "Cannot send request to yourself" }, { status: 400 });
    }

    // Check if the receiver exists and has a mandatory question
    const receiverProfile = await prisma.profile.findUnique({
      where: { userId: receiverId }
    });

    if (!receiverProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (receiverProfile.isReviewMandatory && !answerToReview) {
      return NextResponse.json({ message: "An answer to the review question is required" }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = await prisma.connectionRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId
        }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ message: "Request already sent" }, { status: 400 });
    }

    // Create the Connection Request
    const request = await prisma.connectionRequest.create({
      data: {
        senderId: session.user.id,
        receiverId,
        answerToReview,
        status: "PENDING"
      }
    });

    return NextResponse.json({ message: "Connection request sent successfully!", request }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Connection Request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

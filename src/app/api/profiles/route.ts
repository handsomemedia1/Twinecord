import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().min(2),
  dateOfBirth: z.string(),
  gender: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  denomination: z.string().optional(),
  churchName: z.string().optional(),
  baptized: z.string().optional(),
  attendanceFreq: z.string().optional(),
  relationshipGoal: z.string().optional(),
  lovePhilosophy: z.string().optional(),
  reviewQuestion: z.string().optional(),
  isReviewMandatory: z.boolean().default(false),
  photos: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = profileSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Upsert Profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        baptized: data.baptized === "Yes" ? true : data.baptized === "No" ? false : null,
      },
      create: {
        userId: session.user.id,
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        baptized: data.baptized === "Yes" ? true : data.baptized === "No" ? false : null,
      },
    });

    // Log the security event
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        action: "PROFILE_UPDATED",
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ message: "Profile saved successfully", profile }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

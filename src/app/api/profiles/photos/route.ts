import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { secureUrl } = await req.json();

    if (!secureUrl) {
      return NextResponse.json({ message: "No image URL provided" }, { status: 400 });
    }

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!currentProfile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const updatedPhotos = [...currentProfile.photos, secureUrl];

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { photos: updatedPhotos }
    });

    return NextResponse.json({ message: "Photo added", photos: updatedPhotos }, { status: 200 });

  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

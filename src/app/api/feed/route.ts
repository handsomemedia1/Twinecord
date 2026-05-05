import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1, "Post cannot be empty").max(1000, "Maximum 1000 characters allowed"),
  // imageUrls would be validated here
});

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        author: { isShadowbanned: false }
      },
      include: {
        author: {
          include: { profile: true }
        },
        comments: {
          where: {
            author: { isShadowbanned: false }
          },
          include: {
            author: { include: { profile: true } }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: [
        { author: { role: "asc" } }, // Admins first
        { author: { isBoosted: "desc" } }, // Then Boosted users
        { createdAt: "desc" } // Then by date
      ],
      take: 50 // Limit for demo
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Feed GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Enforce Premium Only
    if (!session.user.isPremium) {
      return NextResponse.json({ message: "Only Premium members can create posts." }, { status: 403 });
    }

    const body = await req.json();
    const { content } = postSchema.parse(body);

    const newPost = await prisma.post.create({
      data: {
        authorId: session.user.id,
        content,
      },
      include: {
        author: { include: { profile: true } },
        comments: true
      }
    });

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("Feed POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

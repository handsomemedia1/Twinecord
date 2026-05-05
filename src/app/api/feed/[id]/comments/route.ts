import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;
    const body = await req.json();
    const { content } = commentSchema.parse(body);

    // Verify post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        content,
      },
      include: {
        author: { include: { profile: true } }
      }
    });

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Comment POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

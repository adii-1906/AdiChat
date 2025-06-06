import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = await req.json(); // ✅ Only called once

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    await connectDB();

    const result = await Chat.deleteOne({ _id: chatId, userId }); // Check delete result

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Chat not found or not authorized" });
    }

    return NextResponse.json({ success: true, message: "Chat Deleted" });

  } catch (error) {
    console.error("Delete Chat Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

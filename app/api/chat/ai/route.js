export const maxDuration = 60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});


export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    // Extract chatId and prompt from the request body
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find the chat document in the db based on userId and chatId
    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    // Create a user message object
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    // Call the Deepseek API to get a chat completion
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      // store: true,
    });

    const message = completion.choices[0].message;
    message.timestamp = Date.now();

    data.messages.push(message);

     await data.save();

    return NextResponse.json({success: true, data: message})

  } catch (error) {
    return NextResponse.json({success: false, error: error.message})
  }
}

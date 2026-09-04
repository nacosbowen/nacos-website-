import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are NACOS AI, an intelligent study assistant for students of Bowen University's NACOS (Nigeria Association of Computing Students).
You help with:
- Computer Science, Software Engineering, Cyber Security, and Information Technology coursework
- Explaining programming concepts, algorithms, data structures
- Academic guidance and study strategies
- NACOS events, welfare, and campus life questions
- CGPA calculations and academic planning

Be concise, encouraging, and use clear explanations. When answering technical questions, use simple examples when helpful.`,

      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ content });
  } catch (err) {
    console.error('nacos-ai error:', err);
    return NextResponse.json({ error: 'AI service failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { generateStudyPlan } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, summary, deadline } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { success: false, error: 'Title and summary are required.' },
        { status: 400 }
      );
    }

    const plan = await generateStudyPlan(title, summary, deadline);
    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    console.error('API Study Plan route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during study plan generation.' },
      { status: 500 }
    );
  }
}

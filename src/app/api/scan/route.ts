import { NextResponse } from 'next/server';
import { extractFromText, extractFromImage, extractFromPdf } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, image, pdf, type } = body;

    if (type === 'image' && image) {
      // Image base64 extraction
      const result = await extractFromImage(image);
      return NextResponse.json({ success: true, data: result });
    }

    if (type === 'pdf' && pdf) {
      // PDF base64 extraction
      const result = await extractFromPdf(pdf);
      return NextResponse.json({ success: true, data: result });
    }

    if (type === 'text' && text) {
      // Text extraction
      const result = await extractFromText(text);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request parameters. "text", "image", or "pdf" required.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Scan route failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during notice parsing.' },
      { status: 500 }
    );
  }
}

// Gemini API integration for AI-powered notice extraction
// Set GEMINI_API_KEY in your .env.local file

import type { ExtractionResult, FeeDetail, TaskCard } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const EXTRACTION_PROMPT = `You are ScholarSync AI — an emotionally intelligent academic notice analyzer built for Indian college students. Your mission is to transform chaotic, institutional notices into calm, clear, actionable intelligence.

Analyze the provided notice and extract a comprehensive JSON object with these fields:

1. "title" — A concise, student-friendly title (not the exact bureaucratic heading)
2. "summary" — A 2-3 sentence factual summary of what this notice is about
3. "studentFriendlyExplanation" — THIS IS CRITICAL. Rewrite the ENTIRE notice in simple, friendly language as if explaining to a stressed student friend. Convert bureaucratic jargon into plain instructions. Example: "Students failing to remit examination fee..." → "Hey, you need to pay your exam fee before Friday, or your hall ticket might get blocked. Here's what to do..." Make it warm, clear, and calming. 3-5 sentences.
4. "deadline" — The most important deadline in ISO 8601 format (YYYY-MM-DDTHH:mm:ss), or null
5. "feeAmount" — The primary fee mentioned as a string (e.g. "₹2,500"), or null
6. "fees" — Array of ALL fees/fines/amounts mentioned. Each object: { "label": "description", "amount": "₹X,XXX", "type": "mandatory|optional|fine|refundable" }
7. "requiredDocuments" — Array of ALL documents, certificates, IDs, proofs mentioned
8. "priority" — "critical" (exam/fee deadlines within 3 days), "high" (within 7 days or important), "medium" (within 2 weeks), or "low" (informational)
9. "category" — One of: "exam", "assignment", "fee", "event", "scholarship", "placement", "sports", "cultural", "administrative", "other"
10. "importantActions" — Array of specific actions the student MUST take, in chronological order
11. "eventType" — Type of event/activity mentioned, or null
12. "noticeType" — "circular", "notice", "memo", "announcement", "timetable", "result", "order", or null
13. "department" — Issuing department name, or null
14. "issuingAuthority" — Person/office who issued it (e.g. "Dean of Examinations"), or null
15. "riskLevel" — "critical" (immediate academic/financial risk), "high" (significant consequences), "moderate" (should act soon), "low" (informational only)
16. "taskCards" — Generate 2-5 actionable task cards. Each: { "title": "short action", "description": "detailed instruction", "dueDate": "ISO date or null", "type": "payment|submission|registration|preparation|verification" }
17. "recommendations" — Array of 2-3 contextual AI tips for the student (e.g. "Keep the fee receipt safe for hall ticket collection", "Set a phone reminder 2 days before deadline")
18. "attendanceImpact" — If the notice mentions attendance shortage, detention, practical eligibility, or mandatory attendance, describe the impact. Otherwise null.
19. "emotionalContext" — "stressful" (exam pressure, fines, warnings), "neutral" (regular info), or "positive" (scholarships, achievements, good news)

IMPORTANT RULES:
- Return ONLY valid JSON. No markdown formatting, no backticks, no explanation text.
- All dates in ISO 8601 format. If year is unclear, assume current academic year.
- For Indian currency, use ₹ symbol.
- If information is not found, use null for strings and [] for arrays.
- The studentFriendlyExplanation should feel like a kind senior student explaining things, not a robot.
- Task cards should be practical and specific, not generic.`;

/** Default fallback result when Gemini is not configured or fails */
function createFallbackResult(overrides: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    id: `ext-${Date.now()}`,
    title: 'Notice Extraction',
    summary: 'AI extraction is not available. Please configure your Gemini API key in .env.local to enable automatic notice scanning.',
    studentFriendlyExplanation: 'The AI scanner needs a Gemini API key to work. Ask your admin to add GEMINI_API_KEY to the .env.local file.',
    deadline: null,
    feeAmount: null,
    fees: [],
    requiredDocuments: [],
    priority: 'medium',
    category: 'other',
    importantActions: ['Configure Gemini API key for full AI extraction'],
    eventType: null,
    noticeType: null,
    department: null,
    issuingAuthority: null,
    riskLevel: 'low',
    taskCards: [],
    recommendations: [],
    attendanceImpact: null,
    emotionalContext: null,
    rawText: '',
    extractedAt: new Date().toISOString(),
    source: 'text',
    ...overrides,
  };
}

/** Parse and validate extracted JSON from Gemini response */
function parseExtractionResponse(
  response: string,
  source: 'text' | 'image' | 'pdf',
  rawText: string
): ExtractionResult {
  // Try multiple JSON extraction strategies
  let parsed: any = null;

  // Strategy 1: Direct JSON parse
  try {
    parsed = JSON.parse(response);
  } catch {
    // Strategy 2: Extract JSON from markdown code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      try { parsed = JSON.parse(codeBlockMatch[1]); } catch { /* continue */ }
    }

    // Strategy 3: Find the first { ... } block
    if (!parsed) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { /* continue */ }
      }
    }
  }

  if (!parsed) {
    throw new Error('No valid JSON found in Gemini response');
  }

  // Validate and normalize fees array
  const fees: FeeDetail[] = Array.isArray(parsed.fees)
    ? parsed.fees.map((f: any) => ({
      label: f.label || 'Fee',
      amount: f.amount || '',
      type: ['mandatory', 'optional', 'fine', 'refundable'].includes(f.type) ? f.type : 'mandatory',
    }))
    : [];

  // Validate and normalize task cards
  const taskCards: TaskCard[] = Array.isArray(parsed.taskCards)
    ? parsed.taskCards.map((t: any) => ({
      title: t.title || 'Task',
      description: t.description || '',
      dueDate: t.dueDate || null,
      type: ['payment', 'submission', 'registration', 'preparation', 'verification'].includes(t.type)
        ? t.type
        : 'preparation',
    }))
    : [];

  return {
    id: `ext-${Date.now()}`,
    title: parsed.title || 'Untitled Notice',
    summary: parsed.summary || '',
    studentFriendlyExplanation: parsed.studentFriendlyExplanation || null,
    deadline: parsed.deadline || null,
    feeAmount: parsed.feeAmount || null,
    fees,
    requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments : [],
    priority: ['critical', 'high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : 'medium',
    category: parsed.category || 'other',
    importantActions: Array.isArray(parsed.importantActions) ? parsed.importantActions : [],
    eventType: parsed.eventType || null,
    noticeType: parsed.noticeType || null,
    department: parsed.department || null,
    issuingAuthority: parsed.issuingAuthority || null,
    riskLevel: ['critical', 'high', 'moderate', 'low'].includes(parsed.riskLevel) ? parsed.riskLevel : 'low',
    taskCards,
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    attendanceImpact: parsed.attendanceImpact || null,
    emotionalContext: ['stressful', 'neutral', 'positive'].includes(parsed.emotionalContext)
      ? parsed.emotionalContext
      : null,
    rawText,
    extractedAt: new Date().toISOString(),
    source,
  };
}

export async function extractFromText(text: string): Promise<ExtractionResult> {
  if (!GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 1500));
    return createFallbackResult({
      rawText: text,
      title: 'Notice (AI unavailable)',
      summary: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      source: 'text',
    });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(`${EXTRACTION_PROMPT}\n\nNotice:\n${text}`);
    const response = result.response.text();

    return parseExtractionResponse(response, 'text', text);
  } catch (error) {
    console.error('Gemini extraction failed:', error);
    return createFallbackResult({
      rawText: text,
      title: 'Extraction Failed',
      summary: 'AI extraction encountered an error. The raw text has been preserved.',
      source: 'text',
    });
  }
}

export async function extractFromImage(base64Image: string): Promise<ExtractionResult> {
  if (!GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 2000));
    return createFallbackResult({
      title: 'Image Notice (AI unavailable)',
      summary: 'Configure your Gemini API key to enable image-based notice scanning.',
      source: 'image',
    });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      },
    ]);

    const response = result.response.text();
    return parseExtractionResponse(response, 'image', '');
  } catch (error) {
    console.error('Gemini image extraction failed:', error);
    return createFallbackResult({
      title: 'Image Extraction Failed',
      summary: 'AI extraction encountered an error processing the image.',
      source: 'image',
    });
  }
}

export async function extractFromPdf(base64Pdf: string): Promise<ExtractionResult> {
  if (!GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 2000));
    return createFallbackResult({
      title: 'PDF Notice (AI unavailable)',
      summary: 'Configure your Gemini API key to enable PDF notice scanning.',
      source: 'pdf',
    });
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const cleanBase64 = base64Pdf.replace(/^data:application\/pdf;base64,/, '');

    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      },
    ]);

    const response = result.response.text();
    return parseExtractionResponse(response, 'pdf', '');
  } catch (error) {
    console.error('Gemini PDF extraction failed:', error);
    return createFallbackResult({
      title: 'PDF Extraction Failed',
      summary: 'AI extraction encountered an error processing the PDF.',
      source: 'pdf',
    });
  }
}

// ─── Study Plan ─────────────────────────────────────────────────────

const STUDY_PLAN_PROMPT = `You are an AI study strategist helping a student prepare for an upcoming academic event (exam, assignment, project, etc.).
Given a title, summary, and deadline, construct a highly customized 5-day study plan to ensure the student's success.
Format the output as a valid JSON object with the following schema:
{
  "title": "A custom title for the study plan (e.g., '5-Day Study Strategy for Physics midterm')",
  "durationDays": 5,
  "days": [
    {
      "day": 1,
      "focus": "A focused theme for this day (e.g., 'Core Concepts & Resource Gathering')",
      "tasks": [
        "A specific, concrete study task",
        "Another specific study task"
      ],
      "tips": [
        "A psychological or productivity tip for the day"
      ]
    }
  ]
}

The array "days" must contain exactly 5 days.
Only return the raw JSON object. Do not wrap it in markdown or triple backticks.`;

export interface StudyPlanDay {
  day: number;
  focus: string;
  tasks: string[];
  tips: string[];
}

export interface StudyPlan {
  title: string;
  durationDays: number;
  days: StudyPlanDay[];
}

function createFallbackStudyPlan(title: string): StudyPlan {
  return {
    title: `5-Day Study Plan: ${title}`,
    durationDays: 5,
    days: [
      {
        day: 1,
        focus: "Fundamentals & Scope Identification",
        tasks: [
          "Review core syllabus topics and gather lecture notes/slides",
          "Identify weak areas that require extra reading",
          "Set up a dedicated, clutter-free study workspace"
        ],
        tips: ["Spend no more than 30 minutes organizing. The goal is to start studying, not just planning."]
      },
      {
        day: 2,
        focus: "Deep Dive into Complex Theories",
        tasks: [
          "Study high-weightage topics first",
          "Solve 3 practice problems or write short essay outlines",
          "Create active recall flashcards for formulas/definitions"
        ],
        tips: ["Use the Pomodoro Technique: 25 minutes study, 5 minutes break. Repeat."]
      },
      {
        day: 3,
        focus: "Applied Practice & Active Recall",
        tasks: [
          "Take a mock quiz or test yourself on Day 2 active recall flashcards",
          "Review key textbook questions and compare with solved examples",
          "Discuss difficult topics with a peer or search quick tutorials online"
        ],
        tips: ["Struggling is good. Active recall is twice as effective as re-reading notes."]
      },
      {
        day: 4,
        focus: "Simulated Testing & Revision",
        tasks: [
          "Solve a full past year question paper under timed conditions",
          "Grade your answers objectively and note where you lost marks",
          "Do a thorough review of the mistakes and revise those specific units"
        ],
        tips: ["Try to replicate the exam environment as closely as possible to build confidence."]
      },
      {
        day: 5,
        focus: "Light Polish & Mental Preparedness",
        tasks: [
          "Do a high-level scan of your summary sheets and cheat-sheets",
          "Prepare your physical/digital exam materials (pens, calculator, ID cards)",
          "Get a solid 8 hours of sleep. A rested brain performs exponentially better"
        ],
        tips: ["Avoid learning new topics today. Focus on reinforcing what you already know."]
      }
    ]
  };
}

export async function generateStudyPlan(
  title: string,
  summary: string,
  deadline: string | null
): Promise<StudyPlan> {
  if (!GEMINI_API_KEY) {
    await new Promise((r) => setTimeout(r, 1500));
    return createFallbackStudyPlan(title);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `${STUDY_PLAN_PROMPT}\n\nNotice Details:\nTitle: ${title}\nSummary: ${summary}\nDeadline: ${deadline || 'None'}`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    let plan: StudyPlan;
    try {
      plan = JSON.parse(jsonMatch[0]) as StudyPlan;
    } catch {
      throw new Error('Failed to parse JSON response from Gemini');
    }

    if (!plan || typeof plan !== 'object' || !Array.isArray(plan.days) || plan.days.length === 0) {
      throw new Error('Invalid study plan structure');
    }

    return plan;
  } catch (error) {
    console.error('Gemini study plan generation failed:', error);
    return createFallbackStudyPlan(title);
  }
}

export const isGeminiConfigured = () => !!GEMINI_API_KEY;

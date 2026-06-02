# ScholarSync — Claude Integration Guide

## Project Overview
ScholarSync is an AI-native student OS built for 260M+ Indian students.
It helps students manage academic notices, deadlines, attendance, and scholarships.

## Current AI Stack
- Gemini 2.5 Flash — notice extraction and summarization

## Planned Claude Integration
- Replace/augment Gemini with Claude API for:
  - Smarter multi-document notice analysis
  - Conversational study assistant
  - Better reasoning on complex fee structures
  - Hindi/regional language notice understanding

## Tech Stack
- Next.js 16, React 19, TypeScript
- Firebase Auth + Firestore
- Tailwind CSS 4, Framer Motion

## Key Directories
- `src/lib/gemini.ts` — AI integration logic (Claude API goes here)
- `src/app/(dashboard)/scan/` — Notice scanner feature
- `src/components/scan/` — Scanner UI components

## Dev Commands
- `npm run dev` — start local server
- `npm run build` — production build

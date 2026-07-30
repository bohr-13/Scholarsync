# ScholarSync — Agent Guide

## Project Overview
ScholarSync is an AI-native student OS for 260M+ Indian students.
Helps manage academic notices, deadlines, attendance, and scholarships.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript 5
- Firebase Auth + Firestore
- Tailwind CSS 4, Framer Motion
- Gemini 3.6 Flash (AI engine)

## Key Files
- `src/lib/gemini.ts` — AI integration logic
- `src/lib/firestore.ts` — Database service layer
- `src/app/(dashboard)/scan/` — Notice scanner
- `src/types/index.ts` — Full TypeScript types

## Dev Commands
- `npm run dev` — start dev server
- `npm run build` — production build

## Important Notes
- Uses Next.js App Router — not Pages Router
- All AI calls go through `src/lib/gemini.ts`
- Firestore rules are user-scoped — never query without uid

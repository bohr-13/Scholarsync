require('@testing-library/jest-dom');
require('whatwg-fetch');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Firebase config to avoid initialization errors
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'fake-api-key';
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'fake-auth-domain';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'fake-project-id';
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'fake-storage-bucket';
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'fake-sender-id';
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'fake-app-id';

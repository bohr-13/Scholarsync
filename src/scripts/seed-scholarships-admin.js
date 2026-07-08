/**
 * Seed scholarships using Firebase Admin SDK.
 *
 * The Admin SDK bypasses Firestore security rules, so this script
 * works correctly even when client-side writes to /scholarships are blocked.
 *
 * Usage:
 *   1. Download a service account key from Firebase Console →
 *      Project Settings → Service Accounts → Generate New Private Key
 *   2. Save the JSON file somewhere safe (NOT in the repo)
 *   3. Run:
 *        set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
 *        node src/scripts/seed-scholarships-admin.js
 *
 *   OR set FIREBASE_SERVICE_ACCOUNT_PATH in .env.local:
 *        FIREBASE_SERVICE_ACCOUNT_PATH=C:\path\to\service-account.json
 */

const admin = require('firebase-admin');

// ─── Resolve credentials ─────────────────────────────────────────
const envPath = require('path').join(__dirname, '../../.env.local');
let serviceAccountPath;

if (require('fs').existsSync(envPath)) {
  const dotenvContent = require('fs').readFileSync(envPath, 'utf8');
  const env = {};
  dotenvContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });
  serviceAccountPath = env.FIREBASE_SERVICE_ACCOUNT_PATH;
}

serviceAccountPath =
  serviceAccountPath || process.env.GOOGLE_APPLICATION_COPY_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath || !require('fs').existsSync(serviceAccountPath)) {
  console.error(
    'Service account key not found.\n\n' +
    '1. Go to Firebase Console → Project Settings → Service Accounts\n' +
    '2. Click "Generate New Private Key"\n' +
    '3. Save the JSON file\n' +
    '4. Run:\n' +
    '     set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\service-account.json\n' +
    '     node src/scripts/seed-scholarships-admin.js\n' +
    '   OR add to .env.local:\n' +
    '     FIREBASE_SERVICE_ACCOUNT_PATH=C:\\path\\to\\service-account.json'
  );
  process.exit(1);
}

// ─── Initialize Admin SDK ────────────────────────────────────────
const serviceAccount = require(serviceAccountPath);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// ─── Scholarship data ────────────────────────────────────────────
const scholarships = [
  {
    name: "Central Sector Scheme of Scholarship for College and University Students (NSP)",
    title: "Central Sector Scheme of Scholarship for College and University Students (NSP)",
    provider: "Department of Higher Education, MHRD, Government of India",
    amount: "₹20,000 per annum",
    deadline: Timestamp.fromDate(new Date("2026-10-31T23:59:59.000Z")),
    deadlineString: "2026-10-31T23:59:59.000Z",
    state: "All India",
    course: "B.Tech",
    category: "General",
    gender: "all",
    eligibilityText: "Top 20th percentile in class 12th board, regular course, family income below ₹4.5 Lakhs per annum.",
    eligibility: {
      states: ["All India"],
      courses: ["B.Tech", "B.Sc", "B.Com", "BA", "BCA", "Medical"],
      incomeLimit: "₹4.5 Lakhs",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "all",
    },
    description: "This central sector scheme provides financial assistance to meritorious students from underprivileged families to meet a part of their day-to-day expenses while pursuing higher studies.",
    applyLink: "https://scholarships.gov.in/",
    applicationLink: "https://scholarships.gov.in/",
    tags: ["NSP", "Central Scheme", "Merit-cum-Means", "Undergraduate"],
    featured: true,
    requiredDocuments: [
      "Income Certificate issued by competent authority",
      "Mark Sheet of Class 12th showing marks & rank",
      "Caste Certificate (for SC/ST/OBC categories)",
      "Current Year College Fee Receipt",
      "Bonafide Student Certificate from Principal",
    ],
    createdAt: Timestamp.now(),
  },
  {
    name: "AICTE Pragati Scholarship Scheme for Girl Students (Degree)",
    title: "AICTE Pragati Scholarship Scheme for Girl Students (Degree)",
    provider: "All India Council for Technical Education (AICTE)",
    amount: "₹50,000 per annum",
    deadline: Timestamp.fromDate(new Date("2026-11-30T23:59:59.000Z")),
    deadlineString: "2026-11-30T23:59:59.000Z",
    state: "All India",
    course: "B.Tech",
    category: "General",
    gender: "female",
    eligibilityText: "Admitted to 1st year technical degree or lateral entry, max 2 girls per family, income below ₹8 Lakhs.",
    eligibility: {
      states: ["All India"],
      courses: ["B.Tech", "B.Arch", "B.Pharm"],
      incomeLimit: "₹8 Lakhs",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "female",
    },
    description: "An initiative by the Government of India and AICTE to support and encourage young women to pursue technical education. The scholarship provides significant financial aid for tuition fees, computer purchase, and other equipment.",
    applyLink: "https://scholarships.gov.in/",
    applicationLink: "https://scholarships.gov.in/",
    tags: ["AICTE", "Girls Only", "Technical Education", "Degree"],
    featured: true,
    requiredDocuments: [
      "Class 10th & 12th Academic Marksheets",
      "Annual Family Income Certificate",
      "College Bonafide Student Certificate",
      "Tuition Fee Paid Receipt",
      "Aadhaar Card",
    ],
    createdAt: Timestamp.now(),
  },
  {
    name: "AICTE Saksham Scholarship Scheme for Specially Abled Students (Degree)",
    title: "AICTE Saksham Scholarship Scheme for Specially Abled Students (Degree)",
    provider: "All India Council for Technical Education (AICTE)",
    amount: "₹50,000 per annum",
    deadline: Timestamp.fromDate(new Date("2026-11-30T23:59:59.000Z")),
    deadlineString: "2026-11-30T23:59:59.000Z",
    state: "All India",
    course: "B.Tech",
    category: "General",
    gender: "all",
    eligibilityText: "Specially-abled students with 40% or more disability, technical degree course, family income below ₹8 Lakhs.",
    eligibility: {
      states: ["All India"],
      courses: ["B.Tech", "B.Arch", "B.Pharm"],
      incomeLimit: "₹8 Lakhs",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "all",
    },
    description: "Saksham is a MHRD scheme being implemented by AICTE aimed at providing encouragement and support to specially-abled children to pursue technical education.",
    applyLink: "https://scholarships.gov.in/",
    applicationLink: "https://scholarships.gov.in/",
    tags: ["AICTE", "Specially Abled", "Technical", "Financial Aid"],
    featured: false,
    requiredDocuments: [
      "Disability Certificate issued by State/Central board (40% or more)",
      "Annual Income Certificate",
      "Bonafide Certificate from College Head",
      "Marksheet of Qualifying Board Exam",
      "Aadhaar Card",
    ],
    createdAt: Timestamp.now(),
  },
  {
    name: "AICTE Swanath Scholarship Scheme (Degree)",
    title: "AICTE Swanath Scholarship Scheme (Degree)",
    provider: "All India Council for Technical Education (AICTE)",
    amount: "₹50,000 per annum",
    deadline: Timestamp.fromDate(new Date("2026-11-15T23:59:59.000Z")),
    deadlineString: "2026-11-15T23:59:59.000Z",
    state: "All India",
    course: "B.Tech",
    category: "General",
    gender: "all",
    eligibilityText: "Orphaned children, wards of COVID-deceased, or martyrs' children. Technical degree, income below ₹8 Lakhs.",
    eligibility: {
      states: ["All India"],
      courses: ["B.Tech", "B.Arch", "B.Pharm"],
      incomeLimit: "₹8 Lakhs",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "all",
    },
    description: "AICTE Swanath scheme aims to support orphans, wards of parents deceased due to COVID-19, and children of martyrs to continue their education and build a bright future.",
    applyLink: "https://scholarships.gov.in/",
    applicationLink: "https://scholarships.gov.in/",
    tags: ["AICTE", "Social Support", "Technical", "Orphans"],
    featured: false,
    requiredDocuments: [
      "Death Certificate of Parents (for orphans)",
      "College Bonafide Certificate",
      "Annual Income Proof of Guardian",
      "Academic Marksheet of Class 12th",
    ],
    createdAt: Timestamp.now(),
  },
  {
    name: "Scholarship for Higher Education (SHE) - INSPIRE",
    title: "Scholarship for Higher Education (SHE) - INSPIRE",
    provider: "Department of Science and Technology (DST), Government of India",
    amount: "₹80,000 per annum",
    deadline: Timestamp.fromDate(new Date("2026-12-31T23:59:59.000Z")),
    deadlineString: "2026-12-31T23:59:59.000Z",
    state: "All India",
    course: "B.Sc",
    category: "General",
    gender: "all",
    eligibilityText: "Top 1% in Class 12 board, pursuing natural/basic science B.Sc, B.S., or Integrated M.Sc.",
    eligibility: {
      states: ["All India"],
      courses: ["B.Sc", "Integrated M.Sc"],
      incomeLimit: "No Limit (Must be top 1% in Class 12 Board Exam)",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "all",
    },
    description: "SHE is a component of Innovation in Science Pursuit for Inspired Research (INSPIRE) program. It offers 10,000 scholarships annually to attract talented youth to study natural and basic sciences.",
    applyLink: "https://www.online-inspire.gov.in/",
    applicationLink: "https://www.online-inspire.gov.in/",
    tags: ["DST", "Basic Sciences", "Research", "Pure Sciences"],
    featured: true,
    requiredDocuments: [
      "Class 12th Board Marksheet",
      "Class 10th Board Marksheet / DOB proof",
      "Endorsement Letter signed by College Principal",
      "Eligibility Note from respective School Board",
    ],
    createdAt: Timestamp.now(),
  },
  {
    name: "Bharti Airtel Scholarship for Tech & Innovation",
    title: "Bharti Airtel Scholarship for Tech & Innovation",
    provider: "Bharti Foundation",
    amount: "₹1,00,000 per annum",
    deadline: Timestamp.fromDate(new Date("2026-08-31T23:59:59.000Z")),
    deadlineString: "2026-08-31T23:59:59.000Z",
    state: "Karnataka",
    course: "B.Tech",
    category: "General",
    gender: "all",
    eligibilityText: "B.Tech or BCA programs in top selected institutes in Delhi, Karnataka, Maharashtra, Tamil Nadu, and Telangana. Family income < ₹8 Lakhs.",
    eligibility: {
      states: ["Delhi", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana"],
      courses: ["B.Tech", "BCA"],
      incomeLimit: "₹8 Lakhs",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "all",
    },
    description: "Supports outstanding engineering and tech students from disadvantaged families to pursue innovation-focused degrees, covering tuition, books, and living stipends.",
    applyLink: "https://bhartifoundation.org/",
    applicationLink: "https://bhartifoundation.org/",
    tags: ["Private", "Tech & Innovation", "Engineering", "Merit-based"],
    featured: true,
    requiredDocuments: [
      "Family Income Proof issued by competent authority",
      "Previous Academic Transcripts",
      "College Admission Allotment Letter",
      "Bonafide Proof of College Registration",
    ],
    createdAt: Timestamp.now(),
  },
  {
    name: "IET India Scholarship Award",
    title: "IET India Scholarship Award",
    provider: "The Institution of Engineering and Technology (IET) India",
    amount: "₹3,00,000",
    deadline: Timestamp.fromDate(new Date("2026-09-15T23:59:59.000Z")),
    deadlineString: "2026-09-15T23:59:59.000Z",
    state: "All India",
    course: "B.Tech",
    category: "General",
    gender: "all",
    eligibilityText: "UG engineering students in AICTE/UGC approved institutes in India. Based on technical performance, leadership, and academics. No income limit.",
    eligibility: {
      states: ["All India"],
      courses: ["B.Tech"],
      incomeLimit: "No Limit (Based on technical merit + leadership)",
      categories: ["General", "OBC", "SC", "ST"],
      gender: "all",
    },
    description: "One of the most prestigious engineering scholarship awards in India, designed to recognize and nurture academic excellence, leadership, and technical innovation among UG engineering students.",
    applyLink: "https://scholarships.theiet.in/",
    applicationLink: "https://scholarships.theiet.in/",
    tags: ["IET", "Engineering Award", "Technical Excellence", "UG"],
    featured: true,
    requiredDocuments: [
      "All Completed B.Tech Semesters Marksheets",
      "IET Membership Proof (optional)",
      "Bonafide Certificate from Head of Department",
      "Recent passport sized photograph",
    ],
    createdAt: Timestamp.now(),
  },
];

// ─── Seed ─────────────────────────────────────────────────────────
async function seed() {
  console.log('Seeding scholarships via Admin SDK (bypasses security rules)...');
  console.log(`Project: ${serviceAccount.project_id}\n`);

  const batch = db.batch();

  scholarships.forEach((item) => {
    const docId = item.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const docRef = db.collection('scholarships').doc(docId);
    batch.set(docRef, item);
    console.log(`  Queued: ${docId}`);
  });

  await batch.commit();
  console.log(`\nSuccessfully seeded ${scholarships.length} scholarships.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

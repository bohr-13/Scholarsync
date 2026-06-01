/**
 * Firestore Service Layer — ScholarSync
 *
 * Collections structure:
 *   users/{userId}                          → user profile document
 *   users/{userId}/tasks/{taskId}           → individual task documents
 *   users/{userId}/attendance/{subjectId}   → attendance records per subject
 *   users/{userId}/scannedNotices/{noticeId}→ AI-scanned notice results
 *
 * All data is scoped to the authenticated user's UID, ensuring each user
 * only ever reads/writes their own data.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  Task,
  SubjectAttendance,
  ExtractionResult,
  UserProfile,
  Scholarship,
  TaskCard,
  Priority,
  NoticeCategory,
  TodoList,
  TodoTask,
} from '@/types';
import { calculateAttendance } from '@/lib/utils';

// ─── Helper: Get user-scoped collection reference ───────────────────
function userCollection(userId: string, subcollection: string) {
  return collection(db, 'users', userId, subcollection);
}

function userDoc(userId: string) {
  return doc(db, 'users', userId);
}

// ─── TASKS ──────────────────────────────────────────────────────────

/** Add a new task for the authenticated user */
export async function addTask(
  userId: string,
  task: Omit<Task, 'id'>
): Promise<string> {
  const ref = await addDoc(userCollection(userId, 'tasks'), {
    ...task,
    createdAt: task.createdAt || new Date().toISOString(),
    _updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing task */
export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...updates,
    _updatedAt: serverTimestamp(),
  });
}

/** Delete a task */
export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
}

/** Subscribe to real-time task updates. Returns an unsubscribe function. */
export function onTasksSnapshot(
  userId: string,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    userCollection(userId, 'tasks'),
    orderBy('deadline', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Task[];
      callback(tasks);
    },
    (error) => {
      console.error('Tasks snapshot error:', error);
      onError?.(error);
    }
  );
}

// ─── ATTENDANCE ─────────────────────────────────────────────────────

/** Add a new subject attendance record */
export async function addAttendanceSubject(
  userId: string,
  subject: { name: string; code: string; attended: number; total: number }
): Promise<string> {
  const calc = calculateAttendance(subject.attended, subject.total);
  const ref = await addDoc(userCollection(userId, 'attendance'), {
    name: subject.name,
    code: subject.code,
    attended: subject.attended,
    total: subject.total,
    percentage: calc.percentage,
    safeBunks: calc.safeBunks,
    riskLevel: calc.riskLevel,
    _updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update attendance numbers for a subject */
export async function updateAttendanceSubject(
  userId: string,
  subjectId: string,
  attended: number,
  total: number
): Promise<void> {
  const calc = calculateAttendance(attended, total);
  const subjectRef = doc(db, 'users', userId, 'attendance', subjectId);
  await updateDoc(subjectRef, {
    attended,
    total,
    percentage: calc.percentage,
    safeBunks: calc.safeBunks,
    riskLevel: calc.riskLevel,
    _updatedAt: serverTimestamp(),
  });
}

/** Delete a subject attendance record */
export async function deleteAttendanceSubject(
  userId: string,
  subjectId: string
): Promise<void> {
  const subjectRef = doc(db, 'users', userId, 'attendance', subjectId);
  await deleteDoc(subjectRef);
}

/** Subscribe to real-time attendance updates */
export function onAttendanceSnapshot(
  userId: string,
  callback: (subjects: SubjectAttendance[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(userCollection(userId, 'attendance'));
  return onSnapshot(
    q,
    (snapshot) => {
      const subjects: SubjectAttendance[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SubjectAttendance[];
      callback(subjects);
    },
    (error) => {
      console.error('Attendance snapshot error:', error);
      onError?.(error);
    }
  );
}

// ─── SCANNED NOTICES ────────────────────────────────────────────────

/** Save a scanned notice extraction result */
export async function addScannedNotice(
  userId: string,
  result: Omit<ExtractionResult, 'id'>
): Promise<string> {
  const ref = await addDoc(userCollection(userId, 'scannedNotices'), {
    ...result,
    extractedAt: result.extractedAt || new Date().toISOString(),
    _updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Subscribe to real-time scanned notices updates */
export function onScannedNoticesSnapshot(
  userId: string,
  callback: (notices: ExtractionResult[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(userCollection(userId, 'scannedNotices'));
  return onSnapshot(
    q,
    (snapshot) => {
      const notices: ExtractionResult[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ExtractionResult[];
      callback(notices);
    },
    (error) => {
      console.error('Scanned notices snapshot error:', error);
      onError?.(error);
    }
  );
}

/** Delete a scanned notice */
export async function deleteScannedNotice(
  userId: string,
  noticeId: string
): Promise<void> {
  const noticeRef = doc(db, 'users', userId, 'scannedNotices', noticeId);
  await deleteDoc(noticeRef);
}

/** Add multiple tasks at once from AI-generated task cards */
export async function addTasksFromScan(
  userId: string,
  taskCards: TaskCard[],
  noticePriority: Priority = 'medium',
  noticeCategory: NoticeCategory = 'other',
  noticeTitle?: string
): Promise<string[]> {
  const batch: Promise<string>[] = [];
  for (const card of taskCards) {
    batch.push(
      addTask(userId, {
        title: card.title,
        description: card.description,
        deadline: card.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 days fallback if no due date
        priority: noticePriority,
        category: noticeCategory,
        status: 'pending',
        source: noticeTitle || 'AI Notice Scan',
        createdAt: new Date().toISOString(),
      })
    );
  }
  return Promise.all(batch);
}

// ─── USER PROFILE ───────────────────────────────────────────────────

/** Create or update the user profile document in Firestore */
export async function saveUserProfile(
  userId: string,
  profile: Partial<UserProfile> & { preferences?: Record<string, boolean> }
): Promise<void> {
  const profileRef = userDoc(userId);
  await setDoc(
    profileRef,
    {
      ...profile,
      _updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Get the user profile once */
export async function getUserProfile(
  userId: string
): Promise<(UserProfile & { preferences?: Record<string, boolean> }) | null> {
  const profileRef = userDoc(userId);
  const snap = await getDoc(profileRef);
  if (snap.exists()) {
    return { uid: userId, ...snap.data() } as UserProfile & {
      preferences?: Record<string, boolean>;
    };
  }
  return null;
}

/** Subscribe to real-time profile updates */
export function onUserProfileSnapshot(
  userId: string,
  callback: (
    profile: (UserProfile & { preferences?: Record<string, boolean> }) | null
  ) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const profileRef = userDoc(userId);
  return onSnapshot(
    profileRef,
    (snap) => {
      if (snap.exists()) {
        callback({
          uid: userId,
          ...snap.data(),
        } as UserProfile & { preferences?: Record<string, boolean> });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('User profile snapshot error:', error);
      onError?.(error);
    }
  );
}

// ─── SCHOLARSHIPS ───────────────────────────────────────────────────

/** Subscribe to global scholarships */
export function onScholarshipsSnapshot(
  callback: (scholarships: Scholarship[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'scholarships'));
  return onSnapshot(
    q,
    (snapshot) => {
      const results: Scholarship[] = snapshot.docs.map((d) => {
        const data = d.data();
        // Fallback for deadlineString to handle backwards-compatible dates
        const deadline = data.deadlineString || (data.deadline && typeof data.deadline.toDate === 'function' ? data.deadline.toDate().toISOString() : data.deadline);
        return {
          id: d.id,
          ...data,
          deadline, // overwrite with string ISO date for front-end safety
        };
      }) as Scholarship[];
      callback(results);
    },
    (error) => {
      console.error('Scholarships snapshot error:', error);
      onError?.(error);
    }
  );
}

/** Save a scholarship to user's savedScholarships subcollection */
export async function saveScholarship(
  userId: string,
  scholarshipId: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'savedScholarships', scholarshipId);
  await setDoc(ref, {
    savedAt: new Date().toISOString(),
  });
}

/** Remove a scholarship from user's savedScholarships subcollection */
export async function unsaveScholarship(
  userId: string,
  scholarshipId: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'savedScholarships', scholarshipId);
  await deleteDoc(ref);
}

/** Subscribe to user's saved scholarships list */
export function onSavedScholarshipsSnapshot(
  userId: string,
  callback: (savedIds: string[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'users', userId, 'savedScholarships'));
  return onSnapshot(
    q,
    (snapshot) => {
      const savedIds = snapshot.docs.map((d) => d.id);
      callback(savedIds);
    },
    (error) => {
      console.error('Saved scholarships snapshot error:', error);
      onError?.(error);
    }
  );
}

// ─── GPA STATE ──────────────────────────────────────────────────────

/** Save GPA predictor state */
export async function saveGpaState(userId: string, state: any): Promise<void> {
  const gpaRef = doc(db, 'users', userId, 'settings', 'gpa');
  await setDoc(
    gpaRef,
    {
      ...state,
      _updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Subscribe to real-time GPA state */
export function onGpaStateSnapshot(
  userId: string,
  callback: (state: any) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const gpaRef = doc(db, 'users', userId, 'settings', 'gpa');
  return onSnapshot(
    gpaRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('GPA state snapshot error:', error);
      onError?.(error);
    }
  );
}

// ─── SEED DATA ──────────────────────────────────────────────────────

/** Check if user has any tasks — used to determine if seed data should be loaded */
export async function userHasData(
  userId: string,
  subcollection: string
): Promise<boolean> {
  const snap = await getDocs(userCollection(userId, subcollection));
  return !snap.empty;
}

/**
 * Seed initial data for a new user.
 * Only called once when the user first signs up / has no existing data.
 * This populates the dashboard with starter content so it doesn't look empty.
 */
export async function seedUserData(
  userId: string,
  data: {
    tasks?: Omit<Task, 'id'>[];
    attendance?: { name: string; code: string; attended: number; total: number }[];
  }
): Promise<void> {
  const batch: Promise<string>[] = [];

  if (data.tasks) {
    for (const task of data.tasks) {
      batch.push(addTask(userId, task));
    }
  }

  if (data.attendance) {
    for (const subject of data.attendance) {
      batch.push(addAttendanceSubject(userId, subject));
    }
  }

  await Promise.all(batch);
}

// ─── AI GENERATED TODOLIST SYSTEM ───────────────────────────────────

/** Helper to strip undefined values recursively from an object so it's Firestore-safe */
function cleanFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = { ...obj };
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      console.warn(`[Firestore payload clean] Stripped invalid undefined field: "${key}"`);
      delete cleaned[key];
    } else if (cleaned[key] !== null && typeof cleaned[key] === 'object' && !Array.isArray(cleaned[key])) {
      cleaned[key] = cleanFirestorePayload(cleaned[key]);
    } else if (Array.isArray(cleaned[key])) {
      cleaned[key] = cleaned[key].map((item: any) => {
        if (item !== null && typeof item === 'object') {
          return cleanFirestorePayload(item);
        }
        return item;
      });
    }
  });
  return cleaned as T;
}

/** Add a new TodoList */
export async function addTodoList(
  userId: string,
  todoList: Omit<TodoList, 'id'>
): Promise<string> {
  const payload = cleanFirestorePayload({
    ...todoList,
    createdAt: todoList.createdAt || new Date().toISOString(),
    updatedAt: todoList.updatedAt || new Date().toISOString(),
    _updatedAt: serverTimestamp(),
  });
  const ref = await addDoc(userCollection(userId, 'todos'), payload);
  return ref.id;
}

/** Update an existing TodoList */
export async function updateTodoList(
  userId: string,
  listId: string,
  updates: Partial<TodoList>
): Promise<void> {
  const ref = doc(db, 'users', userId, 'todos', listId);
  const payload = cleanFirestorePayload({
    ...updates,
    updatedAt: new Date().toISOString(),
    _updatedAt: serverTimestamp(),
  });
  await updateDoc(ref, payload);
}

/** Delete a TodoList */
export async function deleteTodoList(
  userId: string,
  listId: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'todos', listId);
  await deleteDoc(ref);
}

/** Subscribe to real-time updates for TodoLists */
export function onTodoListsSnapshot(
  userId: string,
  callback: (todoLists: TodoList[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    userCollection(userId, 'todos'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const todoLists: TodoList[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TodoList[];
      callback(todoLists);
    },
    (error) => {
      console.error('Todo lists snapshot error:', error);
      onError?.(error);
    }
  );
}

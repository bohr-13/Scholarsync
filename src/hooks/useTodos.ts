'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onTodoListsSnapshot,
  addTodoList as fsAddTodoList,
  updateTodoList as fsUpdateTodoList,
  deleteTodoList as fsDeleteTodoList,
} from '@/lib/firestore';
import type { TodoList, TodoTask } from '@/types';

interface UseTodosReturn {
  todoLists: TodoList[];
  isLoading: boolean;
  error: string | null;
  createList: (
    title: string,
    description?: string,
    type?: 'ai-plan' | 'custom',
    initialTasks?: Omit<TodoTask, 'id' | 'createdAt' | 'updatedAt' | 'order'>[],
    sourceNoticeId?: string
  ) => Promise<string | null>;
  updateList: (listId: string, updates: Partial<TodoList>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addTask: (listId: string, text: string) => Promise<void>;
  updateTask: (listId: string, taskId: string, updates: Partial<TodoTask>) => Promise<void>;
  deleteTask: (listId: string, taskId: string) => Promise<void>;
  toggleTaskComplete: (listId: string, taskId: string) => Promise<void>;
  reorderTasks: (listId: string, tasks: TodoTask[]) => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const { user } = useAuth();
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time todo lists
  useEffect(() => {
    if (!user?.uid) {
      setTodoLists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onTodoListsSnapshot(
      user.uid,
      (lists) => {
        // Ensure tasks are sorted by order
        const sortedLists = lists.map((list) => ({
          ...list,
          tasks: Array.isArray(list.tasks)
            ? [...list.tasks].sort((a, b) => a.order - b.order)
            : [],
        }));
        setTodoLists(sortedLists);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Todo list hook subscription failed:', err);
        setError('Failed to sync todo lists.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Create a new TodoList
  const createList = useCallback(
    async (
      title: string,
      description: string = '',
      type: 'ai-plan' | 'custom' = 'custom',
      initialTasks: Omit<TodoTask, 'id' | 'createdAt' | 'updatedAt' | 'order'>[] = [],
      sourceNoticeId?: string
    ): Promise<string | null> => {
      if (!user?.uid) return null;
      try {
        const tasks: TodoTask[] = initialTasks.map((t, idx) => ({
          id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
          text: t.text,
          completed: t.completed ?? false,
          order: idx,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const newList: Omit<TodoList, 'id'> = {
          userId: user.uid,
          title,
          description,
          type,
          isManual: type === 'custom',
          sourceType: type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks,
          ...(sourceNoticeId ? { sourceNoticeId } : {}),
        };

        const id = await fsAddTodoList(user.uid, newList);
        return id;
      } catch (err) {
        console.error('Failed to create todo list:', err);
        setError('Failed to create todo list');
        return null;
      }
    },
    [user?.uid]
  );

  // Update a TodoList directly (e.g. rename title or description)
  const updateList = useCallback(
    async (listId: string, updates: Partial<TodoList>): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsUpdateTodoList(user.uid, listId, updates);
      } catch (err) {
        console.error('Failed to update todo list:', err);
        setError('Failed to update todo list');
      }
    },
    [user?.uid]
  );

  // Delete a TodoList
  const deleteList = useCallback(
    async (listId: string): Promise<void> => {
      if (!user?.uid) return;
      try {
        await fsDeleteTodoList(user.uid, listId);
      } catch (err) {
        console.error('Failed to delete todo list:', err);
        setError('Failed to delete todo list');
      }
    },
    [user?.uid]
  );

  // Add a task to an existing TodoList
  const addTask = useCallback(
    async (listId: string, text: string): Promise<void> => {
      if (!user?.uid) return;
      const list = todoLists.find((l) => l.id === listId);
      if (!list) return;

      const newTask: TodoTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        completed: false,
        order: list.tasks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await fsUpdateTodoList(user.uid, listId, {
          tasks: [...list.tasks, newTask],
        });
      } catch (err) {
        console.error('Failed to add task:', err);
        setError('Failed to add task');
      }
    },
    [user?.uid, todoLists]
  );

  // Update a specific task inside a TodoList
  const updateTask = useCallback(
    async (listId: string, taskId: string, updates: Partial<TodoTask>): Promise<void> => {
      if (!user?.uid) return;
      const list = todoLists.find((l) => l.id === listId);
      if (!list) return;

      const updatedTasks = list.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      });

      try {
        await fsUpdateTodoList(user.uid, listId, { tasks: updatedTasks });
      } catch (err) {
        console.error('Failed to update task:', err);
        setError('Failed to update task');
      }
    },
    [user?.uid, todoLists]
  );

  // Delete a specific task inside a TodoList
  const deleteTask = useCallback(
    async (listId: string, taskId: string): Promise<void> => {
      if (!user?.uid) return;
      const list = todoLists.find((l) => l.id === listId);
      if (!list) return;

      const filteredTasks = list.tasks
        .filter((task) => task.id !== taskId)
        // Reset order after deletion
        .map((task, idx) => ({ ...task, order: idx }));

      try {
        await fsUpdateTodoList(user.uid, listId, { tasks: filteredTasks });
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task');
      }
    },
    [user?.uid, todoLists]
  );

  // Toggle completion of a specific task
  const toggleTaskComplete = useCallback(
    async (listId: string, taskId: string): Promise<void> => {
      if (!user?.uid) return;
      const list = todoLists.find((l) => l.id === listId);
      if (!list) return;

      const updatedTasks = list.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completed: !task.completed,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      });

      try {
        await fsUpdateTodoList(user.uid, listId, { tasks: updatedTasks });
      } catch (err) {
        console.error('Failed to toggle task:', err);
        setError('Failed to toggle task');
      }
    },
    [user?.uid, todoLists]
  );

  // Reorder tasks inside a list (drag-and-drop integration)
  const reorderTasks = useCallback(
    async (listId: string, tasks: TodoTask[]): Promise<void> => {
      if (!user?.uid) return;

      const reordered = tasks.map((task, index) => ({
        ...task,
        order: index,
        updatedAt: new Date().toISOString(),
      }));

      try {
        await fsUpdateTodoList(user.uid, listId, { tasks: reordered });
      } catch (err) {
        console.error('Failed to reorder tasks:', err);
        setError('Failed to save tasks order');
      }
    },
    [user?.uid]
  );

  return {
    todoLists,
    isLoading,
    error,
    createList,
    updateList,
    deleteList,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
  };
}

import { create } from "zustand";
import {
  Task,
  Submission,
  LeaderboardEntry,
  CreateTaskInput,
  UpdateTaskInput,
  getTasks,
  getTask,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  getTaskSubmissions,
  submitSolution as submitSolutionApi,
  verifySubmission as verifySubmissionApi,
  rejectSubmission as rejectSubmissionApi,
  getLeaderboard,
  getMyPoints,
} from "@/lib/taskService";

interface TaskState {
  // Data
  tasks: Task[];
  selectedTask: Task | null;
  submissions: Submission[]; // Submissions for selected task (admin view)
  leaderboard: LeaderboardEntry[];
  userPoints: number;
  userRank: number | null;

  // Loading states
  loading: boolean;
  submissionsLoading: boolean;
  leaderboardLoading: boolean;

  // Edit mode
  editingTaskId: string | null;

  // Actions - Fetching
  fetchTasks: () => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  fetchTaskSubmissions: (taskId: string) => Promise<void>;
  fetchLeaderboard: (period?: "month" | "semester" | "all") => Promise<void>;
  fetchUserPoints: () => Promise<void>;

  // Actions - Admin Task Management
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  // Actions - Submissions
  submitSolution: (taskId: string, link: string) => Promise<Submission>;
  verifySubmission: (subId: string, points?: number) => Promise<Submission>;
  rejectSubmission: (subId: string) => Promise<Submission>;

  // Actions - UI State
  setSelectedTask: (task: Task | null) => void;
  setEditingTaskId: (id: string | null) => void;
  clearSubmissions: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  selectedTask: null,
  submissions: [],
  leaderboard: [],
  userPoints: 0,
  userRank: null,
  loading: false,
  submissionsLoading: false,
  leaderboardLoading: false,
  editingTaskId: null,

  // Fetch all tasks
  fetchTasks: async () => {
    set({ loading: true });
    try {
      const tasks = await getTasks();
      set({ tasks, loading: false });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Fetch single task
  fetchTask: async (id: string) => {
    set({ loading: true });
    try {
      const task = await getTask(id);
      set({ selectedTask: task, loading: false });
    } catch (error) {
      console.error("Failed to fetch task:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Fetch submissions for a task (admin)
  fetchTaskSubmissions: async (taskId: string) => {
    set({ submissionsLoading: true });
    try {
      const submissions = await getTaskSubmissions(taskId);
      set({ submissions, submissionsLoading: false });
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      set({ submissionsLoading: false });
      throw error;
    }
  },

  // Fetch leaderboard
  fetchLeaderboard: async (period: "month" | "semester" | "all" = "all") => {
    set({ leaderboardLoading: true });
    try {
      const leaderboard = await getLeaderboard(period);
      set({ leaderboard, leaderboardLoading: false });
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      set({ leaderboardLoading: false });
      throw error;
    }
  },

  // Fetch user's total points
  fetchUserPoints: async () => {
    try {
      const userPoints = await getMyPoints();
      // Calculate user's rank from leaderboard
      const { leaderboard } = get();
      set({ userPoints });
    } catch (error) {
      console.error("Failed to fetch user points:", error);
      throw error;
    }
  },

  // Create a new task (admin)
  createTask: async (data: CreateTaskInput) => {
    set({ loading: true });
    try {
      const task = await createTaskApi(data);
      const { tasks } = get();
      set({ tasks: [task, ...tasks], loading: false });
      return task;
    } catch (error) {
      console.error("Failed to create task:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Update a task (admin)
  updateTask: async (id: string, data: UpdateTaskInput) => {
    set({ loading: true });
    try {
      const task = await updateTaskApi(id, data);
      const { tasks } = get();
      set({
        tasks: tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
        editingTaskId: null,
        loading: false,
      });
      return task;
    } catch (error) {
      console.error("Failed to update task:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Delete a task (admin)
  deleteTask: async (id: string) => {
    set({ loading: true });
    try {
      await deleteTaskApi(id);
      const { tasks, selectedTask } = get();
      set({
        tasks: tasks.filter((t) => t.id !== id),
        selectedTask: selectedTask?.id === id ? null : selectedTask,
        submissions: selectedTask?.id === id ? [] : get().submissions,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ loading: false });
      throw error;
    }
  },

  // Submit a solution (user)
  submitSolution: async (taskId: string, link: string) => {
    try {
      const submission = await submitSolutionApi(taskId, link);
      // Refresh tasks to update submission status
      await get().fetchTasks();
      return submission;
    } catch (error) {
      console.error("Failed to submit solution:", error);
      throw error;
    }
  },

  // Verify a submission (admin)
  verifySubmission: async (subId: string, points?: number) => {
    set({ submissionsLoading: true });
    try {
      const submission = await verifySubmissionApi(subId, points);
      const { submissions } = get();
      set({
        submissions: submissions.map((s) =>
          s.id === subId ? { ...s, status: "VERIFIED", points: submission.points } : s
        ),
        submissionsLoading: false,
      });
      return submission;
    } catch (error) {
      console.error("Failed to verify submission:", error);
      set({ submissionsLoading: false });
      throw error;
    }
  },

  // Reject a submission (admin)
  rejectSubmission: async (subId: string) => {
    set({ submissionsLoading: true });
    try {
      const submission = await rejectSubmissionApi(subId);
      const { submissions } = get();
      set({
        submissions: submissions.map((s) =>
          s.id === subId ? { ...s, status: "REJECTED", points: 0 } : s
        ),
        submissionsLoading: false,
      });
      return submission;
    } catch (error) {
      console.error("Failed to reject submission:", error);
      set({ submissionsLoading: false });
      throw error;
    }
  },

  // UI State setters
  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
  setEditingTaskId: (id: string | null) => set({ editingTaskId: id }),
  clearSubmissions: () => set({ submissions: [] }),
}));

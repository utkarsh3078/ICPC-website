import api from "./axios";

// Types
export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  title: string;
  description: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags?: string[];
  constraints?: {
    timeLimit?: number; // in seconds (e.g., 1, 2)
    memoryLimit?: number; // in MB (e.g., 256, 512)
  };
  sampleTestCases?: TestCase[]; // Visible to users
  hiddenTestCases?: TestCase[]; // Only used for final judging
  testCases?: TestCase[]; // Legacy support
}

export interface Contest {
  id: string;
  title: string;
  problems: Problem[] | null;
  timer: number; // Duration in minutes (required)
  startTime: string; // ISO date string - scheduled start time (required)
  results: unknown[] | null;
  createdAt: string;
}

// Test case result for run code / submission results
export interface TestCaseResult {
  passed: boolean;
  index: number;
  input?: string;
  expected?: string;
  actual?: string;
  time?: string;
  memory?: number;
  error?: string;
  isHidden?: boolean;
}

// Run code result (synchronous, sample tests only)
export interface RunCodeResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  firstFailed: TestCaseResult | null;
  time?: string;
  memory?: number;
  compileError?: string;
}

// Submission result (includes all test cases)
export interface SubmissionResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  sampleCount?: number;
  hiddenCount?: number;
  testCaseResults?: TestCaseResult[];
  firstFailed: TestCaseResult | null;
  compileError?: string;
  time?: string;
  memory?: number;
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  problemIdx: number;
  userId: string;
  token: string | null;
  tokens?: string[];
  result: SubmissionResult | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

// API functions
export async function getContests(): Promise<Contest[]> {
  const response = await api.get("/contests");
  return response.data.data || response.data;
}

export async function getContest(id: string): Promise<Contest> {
  const response = await api.get(`/contests/${id}`);
  return response.data.data || response.data;
}

/**
 * Run code against sample test cases only (synchronous)
 * Rate limited to 10 runs per minute
 */
export async function runCode(
  contestId: string,
  problemIdx: number,
  source: string,
  language_id: number
): Promise<RunCodeResult> {
  const response = await api.post(`/contests/${contestId}/run`, {
    problemIdx,
    source,
    language_id,
  });
  return response.data.data || response.data;
}

/**
 * Submit solution for final judging (all test cases)
 */
export async function submitSolution(
  contestId: string,
  problemIdx: number,
  source: string,
  language_id: number
): Promise<ContestSubmission> {
  const response = await api.post(`/contests/${contestId}/submit`, {
    problemIdx,
    source,
    language_id,
  });
  return response.data.data || response.data;
}

export async function getMySubmissions(
  contestId: string
): Promise<ContestSubmission[]> {
  const response = await api.get(`/contests/${contestId}/submissions/me`);
  return response.data.data || response.data;
}

export async function getSubmission(
  submissionId: string
): Promise<ContestSubmission> {
  const response = await api.get(`/contests/submissions/${submissionId}`);
  return response.data.data || response.data;
}

export async function getContestHistory(): Promise<unknown[]> {
  const response = await api.get("/contests/history/me");
  return response.data.data || response.data;
}

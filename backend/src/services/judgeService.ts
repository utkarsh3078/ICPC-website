import axios, { AxiosInstance } from "axios";

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_KEY || "";
const JUDGE0_KEY_HEADER = process.env.JUDGE0_KEY_HEADER || "X-RapidAPI-Key";
const JUDGE0_TIMEOUT = parseInt(process.env.JUDGE0_TIMEOUT_MS || "15000", 10);

const http: AxiosInstance = axios.create({
  baseURL: JUDGE0_URL,
  timeout: JUDGE0_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

function authHeaders() {
  const h: any = {};
  if (JUDGE0_KEY) h[JUDGE0_KEY_HEADER] = JUDGE0_KEY;
  return h;
}

export const submitToJudge0 = async (
  source_code: string,
  language_id: number,
  stdin?: string
) => {
  const url = `/submissions?base64_encoded=false&wait=false`;
  const payload: any = { source_code, language_id };
  if (stdin) payload.stdin = stdin;

  try {
    const res = await http.post(url, payload, { headers: authHeaders() });
    // normalize to { token }
    const token =
      res.data?.token ||
      res.data?.token_id ||
      res.data?.submission_token ||
      null;
    return { token, raw: res.data };
  } catch (err: any) {
    const msg = err?.response?.data || err.message || err;
    throw new Error(`Judge0 submit failed: ${JSON.stringify(msg)}`);
  }
};

export const getJudge0Result = async (token: string) => {
  const url = `/submissions/${token}?base64_encoded=false`;
  try {
    const res = await http.get(url, { headers: authHeaders() });
    // normalize common fields
    const d = res.data;
    return {
      raw: d,
      status: d.status,
      stdout: d.stdout || d.stdout_text || d.stdout_decoded || null,
      stderr: d.stderr || d.stderr_text || d.stderr_decoded || null,
      time: d.time || d.cpu_time || null,
      memory: d.memory || null,
    };
  } catch (err: any) {
    const msg = err?.response?.data || err.message || err;
    throw new Error(`Judge0 get result failed: ${JSON.stringify(msg)}`);
  }
};

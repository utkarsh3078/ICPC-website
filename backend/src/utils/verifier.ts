import axios from 'axios';

// Stubbed verifier functions. Replace with real API calls if keys/endpoints are available.
export const verifyLeetCode = async (link: string) => {
  // Example: if link contains 'leetcode' return true
  if (!link) return false;
  if (link.includes('leetcode')) return true;
  // Placeholder: simulate network check
  return false;
};

export const verifyCodeforces = async (link: string) => {
  if (!link) return false;
  if (link.includes('codeforces') || link.includes('cf.com')) return true;
  return false;
};

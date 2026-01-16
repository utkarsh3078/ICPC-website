import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: string;
  NODE_ENV: string;
  JUDGE0_URL?: string;
  JUDGE0_KEY?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;
  SESSION_SECRET?: string;
  FRONTEND_URL?: string;
}

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
const weakSecrets = [
  "dev_secret",
  "test_secret",
  "changeme",
  "secret",
  "password",
];

function validateEnv(): EnvConfig {
  // Check required variables
  const missing: string[] = [];
  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long for security. " +
        "Generate a strong secret using: openssl rand -base64 32"
    );
  }

  if (weakSecrets.some((weak) => jwtSecret.toLowerCase().includes(weak))) {
    throw new Error(
      "JWT_SECRET appears to be a weak or default value. " +
        "Please use a cryptographically secure random string."
    );
  }

  // Validate NODE_ENV
  const validEnvs = ["development", "production", "test"];
  const nodeEnv = process.env.NODE_ENV || "development";
  if (!validEnvs.includes(nodeEnv)) {
    console.warn(
      `Warning: NODE_ENV "${nodeEnv}" is not standard. Using "development".`
    );
  }

  // Production-specific checks
  if (nodeEnv === "production") {
    if (process.env.DATABASE_URL?.includes("localhost")) {
      console.warn("Warning: Using localhost database URL in production");
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: jwtSecret,
    PORT: process.env.PORT || "5000",
    NODE_ENV: nodeEnv,
    JUDGE0_URL: process.env.JUDGE0_URL,
    JUDGE0_KEY: process.env.JUDGE0_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
  };
}

export const env = validateEnv();
export default env;

const pino: any = require("pino");
const pinoHttp: any = require("pino-http");
const path = require("path");

let logger: any;
// Allow overriding the hostname that appears in structured logs via LOG_HOSTNAME.
// Avoid passing an empty `base` option to pino because that removes default
// base fields (including the OS hostname). Only set `base` when explicitly
// requested via LOG_HOSTNAME so defaults remain intact.
const pinoOptions: any = { level: process.env.LOG_LEVEL || "info" };
if (process.env.LOG_HOSTNAME) {
  pinoOptions.base = { hostname: process.env.LOG_HOSTNAME };
}

try {
  if (process.env.LOG_TO_FILE === "true") {
    const rfs = require("rotating-file-stream");
    const logsPath = path.resolve(process.cwd(), "logs");
    const stream = rfs.createStream("app.log", {
      interval: "1d",
      path: logsPath,
    });
    logger = pino(pinoOptions, stream);
  } else {
    logger = pino(pinoOptions);
  }
} catch (err) {
  // Fallback to console logger if rotating-file-stream not available
  logger = pino(pinoOptions);
}

const reqLogger = pinoHttp({ logger });

export { logger, reqLogger };

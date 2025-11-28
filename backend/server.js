// Lightweight server starter for production
// After building with `npm run build` this will start the compiled JS
try {
  const app = require('./dist/index.js');
} catch (err) {
  console.error('Start the app via `npm run dev` for development, or build first for production.');
}

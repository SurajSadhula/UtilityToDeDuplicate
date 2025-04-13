const deduplicateTranslationFile = require("./deduplicate");

// Accept file path as a command-line argument
const filesPath = process.argv[2];

if (!filesPath) {
  console.error("Please specify the path to the file as an argument.");
  console.error("Usage: node index.js <path-to-translation-files>");
  process.exit(1);
}

deduplicateTranslationFile(filesPath);

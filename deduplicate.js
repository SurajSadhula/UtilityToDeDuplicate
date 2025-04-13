const fs = require("fs");
const path = require("path");
const analyzeAndProcessEnglishFile = require("./analyzeEnFile");
const processLanguageFile = require("./processLanguageFile");
const verifySharedKeysConsistency = require("./verify");
function deduplicateTranslationFile(directoryPath) {
  try {
    // 0. Verify if the directory exists
    if (!fs.existsSync(directoryPath)) {
      console.error(`Error: Directory "${directoryPath}" does not exist.`);
      return;
    }

    // 1. Verify if it's a directory
    if (!fs.statSync(directoryPath).isDirectory()) {
      console.error(`Error: "${directoryPath}" is not a directory.`);
      return;
    }

    // 2. Get all the .json files in the directory
    const langFiles = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(directoryPath, file));

    // 3. Find the en.json
    const enFile = langFiles.find(
      (f) => path.basename(f).toLowerCase() === "en.json"
    );

    if (!enFile) {
      console.error("Error: en.json not found");
      return;
    }

    // 4. Analyze AND process en.json first
    const { sharedValues, sectionsToClean } =
      analyzeAndProcessEnglishFile(enFile);

    // 5. Process other files (excluding en.json)
    langFiles.forEach((file) => {
      processLanguageFile(file, sharedValues, sectionsToClean);
    });

    console.log("All translations processed consistently");
    verifySharedKeysConsistency(directoryPath);
  } catch (error) {
    console.error("Processing failed:", error.message);
  }
}

module.exports = deduplicateTranslationFile;

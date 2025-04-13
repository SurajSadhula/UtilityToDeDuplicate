const fs = require("fs");
const path = require("path");

function normalizeString(str) {
  return str
    .replace(/[.,;:!?'"]/g, '')  // Remove common punctuation
    .trim()                      // Trim whitespace
    .toLowerCase();              // Normalize case
}
function analyzeAndProcessEnglishFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sharedValues = {};
    const sectionsToClean = {};
    let changesMade = false;
  
    // Step 1: Build valueToKeys map
    const valueToKeys = {};
    Object.keys(data).forEach((section) => {
      if (typeof data[section] === "object" && !Array.isArray(data[section])) {
        Object.keys(data[section]).forEach((key) => {
          const value = data[section][key];
          // Only process if the value is a string
          if (typeof value === "string") {
            const normalizedValue = normalizeString(value);
            if (!valueToKeys[normalizedValue]) valueToKeys[normalizedValue] = [];
            valueToKeys[normalizedValue].push({ section, key, originalValue: value });
          }
        });
      }
    });
  
    // Step 2: Identify shared values and collect all key-value pairs
    Object.keys(valueToKeys).forEach((value) => {
      const keys = valueToKeys[value];
      if (keys.length > 1) {
        const representativeValue = keys[0].originalValue;
        // For each key that shares this value, add it to sharedValues
        keys.forEach(({ key }) => {
          // Only add if it's a proper string key (not numeric index)
          if (isNaN(Number(key))) {
            sharedValues[key] = representativeValue;
          }
        });
  
        // Mark all occurrences for cleanup
        keys.forEach(({ section, key }) => {
          if (!sectionsToClean[section]) sectionsToClean[section] = [];
          sectionsToClean[section].push(key);
        });
      }
    });
  
    // Step 3: Apply cleanup to en.json
    Object.keys(sectionsToClean).forEach((section) => {
      if (data[section] && typeof data[section] === "object" && !Array.isArray(data[section])) {
        sectionsToClean[section].forEach((key) => {
          if (data[section][key] !== undefined) {
            delete data[section][key];
            changesMade = true;
          }
        });
      }
    });
  
    // Step 4: Add shared values section (only if we have valid shared keys)
    if (Object.keys(sharedValues).length > 0) {
      data.shared = sharedValues;
      changesMade = true;
    }
  
    // Step 5: Save changes to en.json if made
    if (changesMade) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✓ Processed ${path.basename(filePath)} (source)`);
    }

  return { sharedValues, sectionsToClean };
}

module.exports = analyzeAndProcessEnglishFile;

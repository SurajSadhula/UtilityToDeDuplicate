const fs = require("fs");
const path = require("path");
function processLanguageFile(filePath, sharedKeys, sectionsToClean) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let changesMade = false;
  
    // Initialize shared section if it doesn't exist
    if (!data.shared) {
      data.shared = {};
      changesMade = true;
    }
  
    // Step 1: Process all sections to move shared keys to shared section
    Object.keys(sectionsToClean).forEach((section) => {
      if (data[section]) {
        sectionsToClean[section].forEach((key) => {
          // If this key is in our sharedKeys list and exists in this section
          if (sharedKeys[key] && data[section][key] !== undefined) {
            // Move to shared section if not already there
            if (!data.shared[key]) {
              data.shared[key] = data[section][key];
              changesMade = true;
            }
            // Remove from original section
            delete data[section][key];
            changesMade = true;
          }
        });
      }
    });
  
    // // Step 2: Ensure all shared keys exist in the shared section
    // Object.keys(sharedKeys).forEach((key) => {
    //   if (!data.shared[key]) {
    //     data.shared[key] = sharedKeys[key];
    //     changesMade = true;
    //   }
    // });
  
    // Step 3: Save the file only if changes were made
    if (changesMade) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✓ Updated ${path.basename(filePath)} with shared keys`);
    } else {
      console.log(`- No changes needed for ${path.basename(filePath)}`);
    }
  
    return changesMade;
}

module.exports = processLanguageFile;

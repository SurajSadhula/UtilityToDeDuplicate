const fs = require('fs');
const path = require('path');

function verifySharedKeysConsistency(directoryPath) {
  // Get all JSON files in the directory
  const files = fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(directoryPath, file));

  if (files.length === 0) {
    console.log('No JSON files found in the directory');
    return;
  }

  // Collect shared keys from all files
  const sharedKeysMap = new Map();
  let referenceKeys = null;
  let hasErrors = false;

  files.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const filename = path.basename(file);
      
      if (!data.shared) {
        console.log(`❌ ${filename}: Missing 'shared' section`);
        hasErrors = true;
        return;
      }

      const currentKeys = Object.keys(data.shared).sort();
      
      // Set the first file's keys as reference
      if (referenceKeys === null) {
        referenceKeys = currentKeys;
        sharedKeysMap.set(filename, { keys: currentKeys, status: 'reference' });
        console.log(`✓ ${filename}: Set as reference (${currentKeys.length} keys)`);
        return;
      }

      // Compare with reference keys
      const isMatch = JSON.stringify(currentKeys) === JSON.stringify(referenceKeys);
      
      if (isMatch) {
        sharedKeysMap.set(filename, { keys: currentKeys, status: 'match' });
        console.log(`✓ ${filename}: Keys match reference (${currentKeys.length} keys)`);
      } else {
        const missingKeys = referenceKeys.filter(k => !currentKeys.includes(k));
        const extraKeys = currentKeys.filter(k => !referenceKeys.includes(k));
        
        sharedKeysMap.set(filename, { 
          keys: currentKeys, 
          status: 'mismatch',
          missing: missingKeys,
          extra: extraKeys
        });
        
        console.log(`❌ ${filename}: Key mismatch`);
        if (missingKeys.length > 0) console.log(`   Missing keys: ${missingKeys.join(', ')}`);
        if (extraKeys.length > 0) console.log(`   Extra keys: ${extraKeys.join(', ')}`);
        hasErrors = true;
      }
    } catch (error) {
      console.log(`⚠️ Error processing ${file}: ${error.message}`);
      hasErrors = true;
    }
  });

  // Summary report
  console.log('\n=== Summary ===');
  if (!hasErrors) {
    console.log('✅ All files have consistent shared keys');
  } else {
    console.log('❌ Found inconsistencies in shared keys');
  }

  return {
    hasErrors,
    referenceFile: files[0],
    referenceKeys,
    sharedKeysMap: Object.fromEntries(sharedKeysMap)
  };
}

module.exports = verifySharedKeysConsistency;
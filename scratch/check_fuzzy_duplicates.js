const fs = require('fs');

function normalizeName(name) {
  let normalized = name.toLowerCase();
  
  // Remove common words and phrases
  const wordsToRemove = [
    /government/g, /govt\./g, /govt/g,
    /autonomous/g, /state/g, /rural/g,
    /medical college and hospital/g,
    /medical college & hospital/g,
    /medical college/g,
    /institute of medical sciences and research/g,
    /institute of medical sciences/g,
    /institute of medical science/g,
    /institute of medical/g,
    /medical sciences/g,
    /medical science/g,
    /hospital and research centre/g,
    /hospital & research centre/g,
    /general hospital/g,
    /district general hospital/g,
    /hospital/g,
    /institute/g,
    /college/g,
    /university/g,
    /&/g, /and/g,
    /previously known as.*/g,
    /formerly known as.*/g,
    /\(previously known as.*\)/g,
    /  +/g
  ];
  
  wordsToRemove.forEach(regex => {
    normalized = normalized.replace(regex, ' ');
  });

  // Remove states mentioned in name
  const states = [
    'uttar pradesh', 'tamil nadu', 'maharashtra', 'karnataka', 'odisha',
    'telangana', 'assam', 'chhattisgarh', 'jammu & kashmir', 'jammu and kashmir',
    'west bengal', 'jharkhand', 'andhra pradesh', 'gujarat', 'manipur',
    'rajasthan', 'madhya pradesh', 'uttarakhand', 'goa', 'himachal pradesh',
    'puducherry', 'haryana', 'punjab', 'tripura', 'meghalaya', 'mizoram',
    'nagaland', 'arunachal pradesh', 'delhi', 'c.g.', 'cg', 'up'
  ];

  states.forEach(state => {
    normalized = normalized.replace(new RegExp('\\b' + state + '\\b', 'g'), ' ');
  });
  
  // Strip non-alphanumeric characters and collapse whitespaces
  normalized = normalized.replace(/[^a-z0-9]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

const fileContent = fs.readFileSync('scratch/all_colleges.txt', 'utf8');
const lines = fileContent.split('\n').filter(Boolean);

const colleges = lines.map(line => {
  // Line format: "1. ID: 123 | Name: XYZ | State: ABC | Fees: 123"
  const match = line.match(/^\d+\.\s+ID:\s+(\d+)\s+\|\s+Name:\s+(.*?)\s+\|\s+State:\s+(.*?)\s+\|\s+Fees:\s+(\d+)$/);
  if (!match) return null;
  return {
    id: parseInt(match[1]),
    name: match[2],
    state: match[3],
    fees: parseInt(match[4]),
    normalized: normalizeName(match[2])
  };
}).filter(Boolean);

const normMap = {};
colleges.forEach(c => {
  if (!normMap[c.normalized]) {
    normMap[c.normalized] = [];
  }
  normMap[c.normalized].push(c);
});

console.log('Fuzzy Duplicates Found:');
let duplicateGroupCount = 0;
Object.keys(normMap).forEach(key => {
  const list = normMap[key];
  if (list.length > 1) {
    duplicateGroupCount++;
    console.log(`\nGroup ${duplicateGroupCount} (Normalized: "${key}"):`);
    list.forEach(c => {
      console.log(`  - ID: ${c.id} | "${c.name}" | State: ${c.state} | Fees: ${c.fees}`);
    });
  }
});

console.log(`\nTotal Fuzzy Duplicate Groups: ${duplicateGroupCount}`);

const fs = require('fs');

function cleanWord(word) {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function getWordSet(name) {
  const ignore = new Set([
    'government', 'govt', 'medical', 'college', 'hospital', 'and', 'institute', 'of', 'sciences', 'science', 'research', 'centre', 'center', 'state', 'autonomous', 'dgh', 'general', 'gh'
  ]);
  const words = name.split(/\s+/).map(cleanWord).filter(w => w.length > 0 && !ignore.has(w));
  return new Set(words);
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

const fileContent = fs.readFileSync('scratch/all_colleges.txt', 'utf8');
const lines = fileContent.split('\n').filter(Boolean);

const colleges = lines.map(line => {
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 4) return null;
  const id = parseInt(parts[0].replace(/.*ID:\s+/, ''));
  const name = parts[1].replace(/Name:\s+/, '');
  const state = parts[2].replace(/State:\s+/, '');
  const fees = parseInt(parts[3].replace(/Fees:\s+/, ''));
  
  return { id, name, state, fees, wordSet: getWordSet(name) };
}).filter(Boolean);

console.log(`Checking ${colleges.length} colleges for same-state fuzzy name duplicates...`);

const duplicates = [];
for (let i = 0; i < colleges.length; i++) {
  for (let j = i + 1; j < colleges.length; j++) {
    const c1 = colleges[i];
    const c2 = colleges[j];
    if (c1.state.toLowerCase().trim() === c2.state.toLowerCase().trim()) {
      const sim = jaccardSimilarity(c1.wordSet, c2.wordSet);
      if (sim > 0.49) {
        duplicates.push({ c1, c2, similarity: sim });
      }
    }
  }
}

duplicates.sort((a, b) => b.similarity - a.similarity);

console.log(`\nPotential Same-State Duplicates (threshold Jaccard > 0.5):`);
duplicates.forEach(d => {
  console.log(`Similarity: ${(d.similarity * 100).toFixed(1)}% | State: ${d.c1.state}`);
  console.log(`  - ID: ${d.c1.id} | "${d.c1.name}" | Fees: ${d.c1.fees}`);
  console.log(`  - ID: ${d.c2.id} | "${d.c2.name}" | Fees: ${d.c2.fees}`);
});

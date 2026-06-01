const fs = require('fs');
const path = require('path');

const markdownTable = `
| Rank | College Name                                                     | State                     | Fees     |
| ---- | ---------------------------------------------------------------- | ------------------------- | -------- |
| 401  | Government Medical College, Eluru                                | Andhra Pradesh            | 26,500   |
| 402  | Fakhruddin Ali Ahmed Medical College, Barpeta                    | Assam                     | 23,900   |
| 403  | Government Medical College, Nandyal                              | Andhra Pradesh            | 15,000   |
| 404  | Tezpur Medical College, Tezpur                                   | Assam                     | 24,900   |
| 405  | Government Medical College, Yadadri                              | Telangana                 | 41,000   |
| 406  | Government Medical College, Jagtial                              | Telangana                 | 64,000   |
| 407  | Government Medical College, Karimnagar                           | Telangana                 | 41,000   |
| 408  | Government Medical College, Wanaparthy                           | Telangana                 | 64,000   |
| 409  | Government Medical College, Kamareddy                            | Telangana                 | 41,000   |
| 410  | Pabitra Mohan Pradhan Medical College & Hospital, Talcher        | Odisha                    | 36,900   |
| 411  | Shillong Medical College, Meghalaya                              | Meghalaya                 | 30,000   |
| 412  | Government Medical College, Rajanna Sircilla                     | Telangana                 | 41,000   |
| 413  | Andaman & Nicobar Islands Institute of Medical Sciences (ANIIMS) | Andaman & Nicobar Islands | 79,100   |
| 414  | GMERS Medical College, Rajpipla                                  | Gujarat                   | 3,75,000 |
| 415  | Government Medical College, Jangaon                              | Telangana                 | 41,000   |
| 416  | Saheed Rendo Majhi Medical College & Hospital, Bhawanipatna      | Odisha                    | 41,450   |
| 417  | Government Medical College, Narsampet                            | Telangana                 | 41,000   |
| 418  | Government Medical College, Machilipatnam                        | Andhra Pradesh            | 30,000   |
| 419  | Government Medical College, Mancherial                           | Telangana                 | 64,000   |
| 420  | Government Medical College, Jogulamba Gadwal                     | Telangana                 | 64,000   |
| 421  | Agartala Government Medical College, Agartala                    | Tripura                   | 1,15,500 |
| 422  | Government Medical College, Narayanpet                           | Telangana                 | 64,000   |
| 423  | Government Medical College, Vizianagaram                         | Andhra Pradesh            | 15,000   |
| 424  | Government Medical College, Paderu                               | Andhra Pradesh            | 15,000   |
| 425  | Government Medical College, Bhadradri Kothagudem                 | Telangana                 | 41,000   |
| 426  | Government Medical College, Medak                                | Telangana                 | 76,000   |
| 427  | Government Medical College, Vikarabad                            | Telangana                 | 41,000   |
| 428  | Lakhimpur Medical College, North Lakhimpur                       | Assam                     | 24,900   |
| 429  | Dhubri Medical College                                           | Assam                     | 24,900   |
| 430  | Government Medical College, Nirmal                               | Telangana                 | 59,200   |
| 431  | Government Medical College & Hospital, Phulbani                  | Odisha                    | 36,900   |
| 432  | Government Medical College, Kodangal                             | Telangana                 | 47,200   |
| 433  | Government Medical College, Mulugu                               | Telangana                 | 41,000   |
| 434  | Government Medical College, Kumuram Bheem Asifabad               | Telangana                 | 41,000   |
| 435  | Diphu Medical College & Hospital                                 | Assam                     | 30,000   |
| 436  | Government Medical College, Jayashankar Bhupalpally              | Telangana                 | 41,000   |
| 437  | Government Medical College, Churachandpur                        | Manipur                   | 45,700   |
| 438  | Kokrajhar Medical College                                        | Assam                     | 24,900   |
| 439  | Tomo Riba Institute of Health & Medical Sciences, Naharlagun     | Arunachal Pradesh         | 77,100   |
| 440  | Nalbari Medical College & Hospital, Dakhingaon, Nalbari          | Assam                     | 25,000   |
| 441  | JLN Institute of Medical Sciences (JLN IMS), Imphal              | Manipur                   | 45,700   |
| 442  | Nagaon Medical College                                           | Assam                     | 23,900   |
| 443  | Tinsukia Medical College & Hospital, Tinsukia                    | Assam                     | 24,000   |
| 444  | Zoram Medical College, Falkawn                                   | Mizoram                   | 96,850   |
| 445  | Nagaland Institute of Medical Science & Research, Kohima         | Nagaland                  | 1,61,500 |
`;

const lines = markdownTable.split('\n').map(l => l.trim()).filter(Boolean);
const sqlStatements = [];

lines.forEach(line => {
  if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('college name')) {
    const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
    if (parts.length >= 4) {
      const id = parseInt(parts[0]);
      const name = parts[1].replace(/'/g, "''");
      const state = parts[2].trim().replace(/'/g, "''");
      const fees = parseInt(parts[3].replace(/[^0-9]/g, ''));
      
      if (!isNaN(id) && name && state && !isNaN(fees)) {
        sqlStatements.push(`INSERT INTO public.college_preferences (id, college_name, state, fees)
VALUES (${id}, '${name}', '${state}', ${fees})
ON CONFLICT (id) DO UPDATE 
SET college_name = EXCLUDED.college_name, 
    state = EXCLUDED.state, 
    fees = EXCLUDED.fees;`);
      }
    }
  }
});

const migrationContent = `-- Migration to insert/update college preferences records from 401 to 445
-- Uses ON CONFLICT to insert if they are missing or update if they exist
-- Leaves the existing bond_details column untouched

BEGIN;

${sqlStatements.join('\n\n')}

-- Reset sequence to the new max id
SELECT setval(pg_get_serial_sequence('public.college_preferences', 'id'), COALESCE((SELECT MAX(id) FROM public.college_preferences), 1));

COMMIT;
`;

const targetPath = path.join(__dirname, '../supabase/migrations/20260602006000_update_colleges_401_to_445.sql');
fs.writeFileSync(targetPath, migrationContent);
console.log(`Generated migration with ${sqlStatements.length} statements at: ${targetPath}`);

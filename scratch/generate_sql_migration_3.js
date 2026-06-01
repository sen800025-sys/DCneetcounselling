const fs = require('fs');
const path = require('path');

const markdownTable = `
| Rank | College Name                                                                   | State           | Fees     |
| ---- | ------------------------------------------------------------------------------ | --------------- | -------- |
| 201  | Government Medical College, Badaun                                             | Uttar Pradesh   | 36,000   |
| 202  | Veer Chandra Singh Garhwali Government Institute of Medical Science & Research | Uttarakhand     | 1,45,000 |
| 203  | Government Medical College, Faizabad (Ayodhya)                                 | Uttar Pradesh   | 36,000   |
| 204  | Autonomous State Medical College, Etah                                         | Uttar Pradesh   | 36,000   |
| 205  | ESIC PGIMSR, Joka, Kolkata                                                     | West Bengal     | 1,00,000 |
| 206  | Government Medical College, Sawai Madhopur                                     | Rajasthan       | 1,19,280 |
| 207  | Government Medical College, Azamgarh                                           | Uttar Pradesh   | 40,800   |
| 208  | Government Medical College, Thiruvallur                                        | Tamil Nadu      | 20,003   |
| 209  | Rajkiya Medical College, Jalaun                                                | Uttar Pradesh   | 40,800   |
| 210  | Thoothukudi Medical College, Thoothukudi                                       | Tamil Nadu      | 18,073   |
| 211  | Government Medical College, Firozabad                                          | Uttar Pradesh   | 40,800   |
| 212  | Government Villupuram Medical College, Villupuram                              | Tamil Nadu      | 18,073   |
| 213  | Government Medical College, Karur                                              | Tamil Nadu      | 18,083   |
| 214  | Sagar Dutta Medical College & Hospital, Kolkata                                | West Bengal     | 6,600    |
| 215  | NEIGRIHMS, Shillong                                                            | Meghalaya       | 47,600   |
| 216  | Government Medical College, Nilgiris                                           | Tamil Nadu      | 18,073   |
| 217  | Rajarshee Chhatrapati Shahu Maharaj Government Medical College, Kolhapur       | Maharashtra     | 1,66,100 |
| 218  | Sri Jagannath Medical College & Hospital, Puri                                 | Odisha          | 37,950   |
| 219  | Government Medical College, Karauli                                            | Rajasthan       | 1,19,280 |
| 220  | Maharishi Chyawan Medical College, Koriawas                                    | Haryana         | 80,000   |
| 221  | MG Institute of Medical Sciences, Sevagram, Wardha                             | Maharashtra     | 4,61,410 |
| 222  | Chhattisgarh Institute of Medical Sciences, Bilaspur                           | Chhattisgarh    | 50,000   |
| 223  | Government Medical College, Kasaragod                                          | Kerala          | 31,715   |
| 224  | Government Medical College, Shivpuri                                           | Madhya Pradesh  | 1,30,000 |
| 225  | Maharshi Devraha Baba Autonomous State Medical College, Deoria                 | Uttar Pradesh   | 36,000   |
| 226  | Government Medical College, Banswara                                           | Rajasthan       | 1,19,280 |
| 227  | Government Medical College, Tonk                                               | Rajasthan       | 1,25,246 |
| 228  | Sundarlal Patwa Government Medical College, Mandsaur                           | Madhya Pradesh  | 1,14,000 |
| 229  | Government Medical College, Baran                                              | Rajasthan       | 1,68,000 |
| 230  | Government Medical College, Virudhunagar                                       | Tamil Nadu      | 18,073   |
| 231  | Virendra Kumar Sakhlecha Government Medical College, Neemuch                   | Madhya Pradesh  | 1,14,000 |
| 232  | Government Medical College, Bettiah                                            | Bihar           | 40,800   |
| 233  | Indira Gandhi Medical College & Research Institute, Puducherry                 | Puducherry      | 1,43,700 |
| 234  | Government Medical College, Jaisalmer                                          | Rajasthan       | 1,25,246 |
| 235  | Government Medical College, Purnea                                             | Bihar           | 40,800   |
| 236  | Government Medical College, Shahjahanpur                                       | Uttar Pradesh   | 40,800   |
| 237  | Government Medical College, Datia                                              | Madhya Pradesh  | 1,40,000 |
| 238  | Government Medical College, Khandwa                                            | Madhya Pradesh  | 1,00,000 |
| 239  | Siddhartha Medical College, Vijayawada                                         | Andhra Pradesh  | 25,600   |
| 240  | Dr. Vaishampayan Memorial Medical College, Solapur                             | Maharashtra     | 1,69,150 |
| 241  | Shaheed Nirmal Mahto Medical College & Hospital, Dhanbad                       | Jharkhand       | 8,500    |
| 242  | GMERS Medical College, Navsari                                                 | Gujarat         | 3,75,000 |
| 243  | Soban Singh Jeena Government Institute of Medical Science & Research, Almora   | Uttarakhand     | 1,73,000 |
| 244  | Government Medical College, Bahraich                                           | Uttar Pradesh   | 36,000   |
| 245  | Chhindwara Institute of Medical Sciences                                       | Madhya Pradesh  | 1,14,000 |
| 246  | Government Medical College & Hospital, Balasore                                | Odisha          | 55,450   |
| 247  | Mahatma Vidur Autonomous State Medical College, Bijnor                         | Uttar Pradesh   | 39,600   |
| 248  | Autonomous State Medical College, Fatehpur                                     | Uttar Pradesh   | 40,800   |
| 249  | Government Medical College, Basti                                              | Uttar Pradesh   | 36,000   |
| 250  | Shimoga Institute of Medical Sciences, Shivamogga                              | Karnataka       | 85,400   |
| 251  | Dr. Shankarrao Chavan Government Medical College, Nanded                       | Maharashtra     | 1,57,500 |
| 252  | Government Pudukkottai Medical College Hospital                                | Tamil Nadu      | 18,073   |
| 253  | Burdwan Medical College, Burdwan                                               | West Bengal     | 9,000    |
| 254  | Autonomous State Medical College, Hardoi                                       | Uttar Pradesh   | 36,000   |
| 255  | Autonomous State Medical College, Lalitpur                                     | Uttar Pradesh   | 40,800   |
| 256  | Government Medical College, Miraj                                              | Maharashtra     | 1,66,100 |
| 257  | Kakatiya Medical College, Warangal                                             | Telangana       | 52,000   |
| 258  | Government Medical College, Sheopur                                            | Madhya Pradesh  | 1,14,000 |
| 259  | Government Medical College, Dindigul                                           | Tamil Nadu      | 18,073   |
| 260  | Hassan Institute of Medical Sciences, Hassan                                   | Karnataka       | 75,000   |
| 261  | Kurnool Medical College, Kurnool                                               | Andhra Pradesh  | 25,600   |
| 262  | Thiruvannamalai Medical College, Thiruvannamalai                               | Tamil Nadu      | 18,073   |
| 263  | Government Medical College, Satna                                              | Madhya Pradesh  | 1,14,000 |
| 264  | ESIC Medical College & Hospital, Beltola, Guwahati                             | Assam           | 1,00,000 |
| 265  | Government Medical College, Namakkal                                           | Tamil Nadu      | 18,073   |
| 266  | Autonomous State Medical College, Siddharthnagar                               | Uttar Pradesh   | 36,000   |
| 267  | North Bengal Medical College, Darjeeling                                       | West Bengal     | 6,500    |
| 268  | Sri Venkateswara Medical College, Tirupati                                     | Andhra Pradesh  | 10,600   |
| 269  | Autonomous State Medical College, Pratapgarh                                   | Uttar Pradesh   | 36,000   |
| 270  | Government Medical College, Shahdol                                            | Madhya Pradesh  | 1,22,000 |
| 271  | Government Sivagangai Medical College, Sivagangai                              | Tamil Nadu      | 18,073   |
| 272  | Government Medical College & Hospital, Jalgaon                                 | Maharashtra     | 1,52,100 |
| 273  | Government Medical College, Udhampur                                           | Jammu & Kashmir | 27,060   |
| 274  | Autonomous State Medical College, Kanpur Dehat                                 | Uttar Pradesh   | 40,800   |
| 275  | Autonomous State Medical College, Jaunpur                                      | Uttar Pradesh   | 36,000   |
| 276  | Government Medical College, Akola                                              | Maharashtra     | 1,69,900 |
| 277  | Rajah Muthiah Medical College, Annamalai University                            | Tamil Nadu      | 18,100   |
| 278  | Autonomous State Medical College, Pilibhit                                     | Uttar Pradesh   | 40,800   |
| 279  | Autonomous State Medical College, Auraiya                                      | Uttar Pradesh   | 40,800   |
| 280  | Government Thiruvarur Medical College, Thiruvarur                              | Tamil Nadu      | 18,073   |
| 281  | Government Medical College, Krishnagiri                                        | Tamil Nadu      | 18,073   |
| 282  | Government Medical College, Ariyalur                                           | Tamil Nadu      | 19,823   |
| 283  | Government Medical College & Hospital, Chandrapur                              | Maharashtra     | 1,57,100 |
| 284  | Autonomous State Medical College, Mirzapur                                     | Uttar Pradesh   | 24,000   |
| 285  | Government Medical College, Seoni                                              | Madhya Pradesh  | 1,14,000 |
| 286  | Government Medical College, Rajnandgaon                                        | Chhattisgarh    | 50,000   |
| 287  | Barasat Government Medical College & Hospital                                  | West Bengal     | 6,644    |
| 288  | Autonomous State Medical College, Ghazipur                                     | Uttar Pradesh   | 36,000   |
| 289  | Autonomous State Medical College, Amethi                                       | Uttar Pradesh   | 36,000   |
| 290  | Government Medical College, Ambernath                                          | Maharashtra     | 1,70,756 |
| 291  | Autonomous State Medical College, Sultanpur                                    | Uttar Pradesh   | 36,000   |
| 292  | Gulbarga Institute of Medical Sciences, Gulbarga                               | Karnataka       | 82,950   |
| 293  | College of Medicine & JNM Hospital, Kalyani                                    | West Bengal     | 8,500    |
| 294  | Jannayak Karpoori Thakur Medical College & Hospital, Madhepura                 | Bihar           | 40,800   |
| 295  | ACSR Government Medical College, Nellore                                       | Andhra Pradesh  | 25,600   |
| 296  | Kodagu Institute of Medical Sciences, Kodagu                                   | Karnataka       | 82,650   |
| 297  | Autonomous State Medical College, Lakhimpur Kheri                              | Uttar Pradesh   | 36,000   |
| 298  | Rangaraya Medical College, Kakinada                                            | Andhra Pradesh  | 25,600   |
| 299  | Shri Bhausaheb Hire Government Medical College, Dhule                          | Maharashtra     | 1,65,760 |
| 300  | Autonomous State Medical College, Kaushambi                                    | Uttar Pradesh   | 36,000 |
`;

const lines = markdownTable.split('\n').map(l => l.trim()).filter(Boolean);
const sqlUpdates = [];

lines.forEach(line => {
  if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('college name')) {
    const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
    if (parts.length >= 4) {
      const id = parseInt(parts[0]);
      const name = parts[1].replace(/'/g, "''");
      const state = parts[2].trim().replace(/'/g, "''");
      const fees = parseInt(parts[3].replace(/[^0-9]/g, ''));
      
      if (!isNaN(id) && name && state && !isNaN(fees)) {
        sqlUpdates.push(`UPDATE public.college_preferences SET college_name = '${name}', state = '${state}', fees = ${fees} WHERE id = ${id};`);
      }
    }
  }
});

const migrationContent = `-- Migration to update college preferences records from 201 to 300
-- Leaves the existing bond_details column untouched

BEGIN;

${sqlUpdates.join('\n')}

COMMIT;
`;

const targetPath = path.join(__dirname, '../supabase/migrations/20260602004000_update_colleges_201_to_300.sql');
fs.writeFileSync(targetPath, migrationContent);
console.log(`Generated migration with ${sqlUpdates.length} updates at: ${targetPath}`);

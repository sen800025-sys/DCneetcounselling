const fs = require('fs');
const path = require('path');

const markdownTable = `
| Rank | College Name                                                                    | State           | Fees     |
| ---- | ------------------------------------------------------------------------------- | --------------- | -------- |
| 301  | Government Medical College, Kallakurichi                                        | Tamil Nadu      | 18,073   |
| 302  | Autonomous State Medical College, Gonda                                         | Uttar Pradesh   | 40,800   |
| 303  | Sheikh Bhikhari Medical College & Hospital, Hazaribagh                          | Jharkhand       | 3,180    |
| 304  | Government Medical College, Ramanathapuram                                      | Tamil Nadu      | 18,073   |
| 305  | Autonomous State Medical College, Kushinagar                                    | Uttar Pradesh   | 40,800   |
| 306  | Government Medical College, Latur                                               | Maharashtra     | 1,63,630 |
| 307  | Government Medical College & General Hospital, Satara                           | Maharashtra     | 1,71,100 |
| 308  | Bankura Sammilani Medical College, Bankura                                      | West Bengal     | 9,166    |
| 309  | Government Medical College, Singrauli                                           | Madhya Pradesh  | 1,14,000 |
| 310  | Baba Kinaram Autonomous State Medical College, Chandauli                        | Uttar Pradesh   | 40,800   |
| 311  | Vijayanagar Institute of Medical Sciences, Ballari                              | Karnataka       | 70,160   |
| 312  | Autonomous State Medical College, Sonbhadra                                     | Uttar Pradesh   | 40,800   |
| 313  | Government Medical College, Nagapattinam                                        | Tamil Nadu      | 18,073   |
| 314  | Shri Vasantrao Naik Government Medical College, Yavatmal                        | Maharashtra     | 1,65,600 |
| 315  | Karwar Institute of Medical Sciences, Karwar                                    | Karnataka       | 55,000   |
| 316  | Pt. Raghunath Murmu Medical College, Baripada                                   | Odisha          | 51,950   |
| 317  | Government Medical College, Maheshwaram                                         | Telangana       | 41,000   |
| 318  | Assam Medical College, Dibrugarh                                                | Assam           | 24,000   |
| 319  | Government Medical College & District General Hospital, Ratnagiri               | Maharashtra     | 1,66,100 |
| 320  | Bhima Bhoi Medical College & Hospital, Balangir                                 | Odisha          | 41,450   |
| 321  | Government Medical College, Mahabubnagar                                        | Telangana       | 64,000   |
| 322  | Swami Ramanand Teerth Rural Medical College, Ambajogai                          | Maharashtra     | 1,71,350 |
| 323  | Chamarajanagar Institute of Medical Sciences                                    | Karnataka       | 82,000   |
| 324  | Government Medical College, Amravati                                            | Maharashtra     | 1,69,900 |
| 325  | Lt. L.A.M. Government Medical College, Raigarh                                  | Chhattisgarh    | 50,000   |
| 326  | Government Medical College, Gondia                                              | Maharashtra     | 1,66,800 |
| 327  | Government Medical College, Rajouri                                             | Jammu & Kashmir | 26,250   |
| 328  | Government Medical College, Anantnag                                            | Jammu & Kashmir | 34,215   |
| 329  | Rajiv Gandhi Institute of Medical Sciences, Adilabad                            | Telangana       | 29,000   |
| 330  | Diamond Harbour Government Medical College                                      | West Bengal     | 6,730    |
| 331  | Government Medical College, Nandurbar                                           | Maharashtra     | 1,64,730 |
| 332  | Phulo Jhano Medical College, Dumka                                              | Jharkhand       | 20,100   |
| 333  | Chikkaballapura Institute of Medical Sciences                                   | Karnataka       | 85,000   |
| 334  | SVIMS Sri Padmavathi Medical College for Women, Tirupati                        | Andhra Pradesh  | 95,800   |
| 335  | Midnapore Medical College, Midnapore                                            | West Bengal     | 11,144   |
| 336  | Rajiv Gandhi Institute of Medical Sciences, Kadapa                              | Andhra Pradesh  | 10,600   |
| 337  | Government Medical College & Hospital, Alibag-Raigad                            | Maharashtra     | 1,70,746 |
| 338  | Government Medical College, Doda                                                | Jammu & Kashmir | 26,250   |
| 339  | Medinirai Medical College (Palamu Medical College), Palamu                      | Jharkhand       | 39,200   |
| 340  | Bidar Institute of Medical Sciences, Bidar                                      | Karnataka       | 71,750   |
| 341  | Rajmata Shrimati Devendra Kumari Singhdeo Government Medical College, Ambikapur | Chhattisgarh    | 53,500   |
| 342  | Government Medical College, Suryapet                                            | Telangana       | 29,000   |
| 343  | Regional Institute of Medical Sciences (RIMS), Imphal                           | Manipur         | 26,000   |
| 344  | Chandulal Chandrakar Memorial Government Medical College, Durg                  | Chhattisgarh    | 50,000   |
| 345  | Government Medical College, Nizamabad                                           | Telangana       | 41,000   |
| 346  | GMERS Medical College, Morbi                                                    | Gujarat         | 3,75,000 |
| 347  | Government Medical College, Ananthapuram                                        | Andhra Pradesh  | 25,600   |
| 348  | Chikkamagaluru Institute of Medical Sciences                                    | Karnataka       | 83,000   |
| 349  | GMERS Medical College, Porbandar                                                | Gujarat         | 3,75,000 |
| 350  | Lt. B.R.K. Government Medical College, Jagdalpur                                | Chhattisgarh    | 50,000   |
| 351  | Government Medical College, Siddipet                                            | Telangana       | 41,000   |
| 352  | Government Medical College, Quthbullapur                                        | Telangana       | 64,000   |
| 353  | Government Medical College, Nalgonda                                            | Telangana       | 12,000   |
| 354  | Gadag Institute of Medical Sciences                                             | Karnataka       | 97,750   |
| 355  | Deben Mahata Government Medical College & Hospital                              | West Bengal     | 6,520    |
| 356  | Raichur Institute of Medical Sciences, Raichur                                  | Karnataka       | 80,000   |
| 357  | Government Medical College & Hospital, Jalpaiguri                               | West Bengal     | 11,144   |
| 358  | Murshidabad Medical College & Hospital                                          | West Bengal     | 6,520    |
| 359  | Government Medical College, Parbhani                                            | Maharashtra     | 1,52,100 |
| 360  | Malda Medical College, Malda                                                    | West Bengal     | 6,500    |
| 361  | Government Medical College, Osmanabad                                           | Maharashtra     | 1,67,650 |
| 362  | Government Medical College, Sindhudurg                                          | Maharashtra     | 1,66,100 |
| 363  | RIMS, Ongole                                                                    | Andhra Pradesh  | 27,600   |
| 364  | Government Medical College, Buldhana                                            | Maharashtra     | 1,71,316 |
| 365  | Prafulla Chandra Sen Government Medical College & Hospital, Arambagh            | West Bengal     | 6,500    |
| 366  | Sarat Chandra Chattopadhyay Government Medical College & Hospital, Uluberia     | West Bengal     | 6,644    |
| 367  | Government Medical College, Mahasamund                                          | Chhattisgarh    | 49,500   |
| 368  | Jajati Keshari Medical College & Hospital, Jajpur                               | Odisha          | 41,450   |
| 369  | Government Medical College, Sundargarh                                          | Odisha          | 37,950   |
| 370  | Raiganj Government Medical College                                              | West Bengal     | 6,592    |
| 371  | RIMS, Srikakulam                                                                | Andhra Pradesh  | 25,600   |
| 372  | Koppal Institute of Medical Sciences                                            | Karnataka       | 80,650   |
| 373  | Jorhat Medical College & Hospital, Jorhat                                       | Assam           | 23,900   |
| 374  | Tamralipto Government Medical College & Hospital                                | West Bengal     | 6,644    |
| 375  | Government Medical College, Sangareddy                                          | Telangana       | 64,000   |
| 376  | Pragjyotishpur Medical College                                                  | Assam           | 32,400   |
| 377  | Government Medical College & Hospital, Keonjhar                                 | Odisha          | 37,950   |
| 378  | Silchar Medical College, Silchar                                                | Assam           | 17,900   |
| 379  | Government Medical College, Baramulla                                           | Jammu & Kashmir | 37,636   |
| 380  | Government Medical College, Bhandara                                            | Maharashtra     | 1,51,480 |
| 381  | Haveri Institute of Medical Sciences                                            | Karnataka       | 86,000   |
| 382  | Rampurhat Government Medical College                                            | West Bengal     | 6,520    |
| 383  | Government Medical College, Khammam                                             | Telangana       | 41,000   |
| 384  | Government Medical College, Ramagundam                                          | Telangana       | 64,000   |
| 385  | Government Medical College, Gadchiroli                                          | Maharashtra     | 1,78,740 |
| 386  | Maharaja Jitendra Narayan Medical College & Hospital, Cooch Behar               | West Bengal     | 6,500    |
| 387  | Government Medical College, Kanker                                              | Chhattisgarh    | 50,000   |
| 388  | Government Medical College, Jalna                                               | Maharashtra     | 1,69,837 |
| 389  | Government Medical College, Nagarkurnool                                        | Telangana       | 29,000   |
| 390  | Jhargram Government Medical College & Hospital                                  | West Bengal     | 8,144    |
| 391  | Yadgiri Institute of Medical Sciences                                           | Karnataka       | 79,100   |
| 392  | Government Medical College, Korba                                               | Chhattisgarh    | 50,000   |
| 393  | Government Medical College, Mahabubabad                                         | Telangana       | 41,000   |
| 394  | Saheed Laxman Nayak Medical College & Hospital, Koraput                         | Odisha          | 51,950   |
| 395  | Government Medical College, Handwara                                            | Jammu & Kashmir | 34,215   |
| 396  | Government Medical College, Washim                                              | Maharashtra     | 1,69,636 |
| 397  | Chitradurga Medical College & Research Institute                                | Karnataka       | 75,570   |
| 398  | Government Medical College, Hingoli                                             | Maharashtra     | 1,57,100 |
| 399  | Government Medical College, Rajamahendravaram                                   | Andhra Pradesh  | 15,000   |
| 400  | GMERS Medical College, Panchmahal Godhra                                        | Gujarat         | 3,75,000 |
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

const migrationContent = `-- Migration to update college preferences records from 301 to 400
-- Leaves the existing bond_details column untouched

BEGIN;

${sqlUpdates.join('\n')}

COMMIT;
`;

const targetPath = path.join(__dirname, '../supabase/migrations/20260602005000_update_colleges_301_to_400.sql');
fs.writeFileSync(targetPath, migrationContent);
console.log(`Generated migration with ${sqlUpdates.length} updates at: ${targetPath}`);

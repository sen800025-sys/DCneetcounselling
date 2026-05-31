const fs = require('fs');

// Mock browser globals
global.window = {
  _authUser: {
    id: 'user-id-123',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test Student' }
  },
  supabaseClient: {
    from: (table) => {
      console.log(`supabase.from('${table}') queried`);
      return {
        select: (cols) => {
          console.log(`supabase.select('${cols}') queried`);
          return {
            eq: (col, val) => {
              console.log(`supabase.eq('${col}', '${val}') queried`);
              return {
                maybeSingle: async () => {
                  if (table === 'preference_maker_users') {
                    // Return null profile to simulate new user
                    return { data: null, error: null };
                  }
                  return { data: null, error: null };
                },
                single: async () => ({ data: null, error: null })
              };
            },
            order: (col, opts) => {
              console.log(`supabase.order('${col}') queried`);
              return Promise.resolve({
                data: [
                  { id: '1', college_name: 'AIIMS New Delhi', state: 'Delhi', fees: 1628, bond_details: 'None' }
                ],
                error: null
              });
            }
          };
        }
      };
    }
  }
};

global.localStorage = {
  getItem: () => null,
  setItem: () => null
};

const domElements = {
  'section-preference-maker': {
    appendChild: () => {},
    querySelector: () => null,
    style: {}
  },
  'pmTableBody': null, // simulate initial load where layout is not rendered
  'pmDownloadForm': {
    reset: () => console.log('pmDownloadForm.reset() called')
  },
  'pmDownloadModal': {
    style: { display: 'none' }
  },
  'pdfName': { value: '' },
  'pdfCategory': { value: '' },
  'pdfMobileNum': { value: '' },
  'pdfScore': { value: '' },
  'pdfRank': { value: '' },
  'pdfDomicile': { value: '' },
  'pdfCourse': { value: '' }
};

global.document = {
  getElementById: (id) => {
    console.log(`document.getElementById('${id}') called`);
    return domElements[id] || null;
  },
  querySelector: (sel) => {
    console.log(`document.querySelector('${sel}') called`);
    return { style: { display: 'none' }, remove: () => {} };
  },
  querySelectorAll: () => [],
  createElement: (tag) => {
    console.log(`document.createElement('${tag}') called`);
    return { style: {}, innerHTML: '' };
  },
  body: {
    appendChild: (el) => console.log(`document.body.appendChild(el) called`)
  }
};

// Load preference_maker.js source code
let code = fs.readFileSync('frontend/web/js/preference_maker.js', 'utf8');

// Execute preference_maker.js
try {
  eval(code);
  console.log('preference_maker.js evaluated successfully');

  // Run async test inside IIFE equivalent flow
  (async function() {
    console.log('\n--- Running window.renderPreferenceMaker ---');
    window.renderPreferenceMaker();

    // Wait for the colleges to load from Supabase mock (since it uses microtask queue/promise resolve)
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log('\n--- Running pmOpenAddModalWithData ---');
    await window.pmOpenAddModalWithData(null, '1');
  })();
} catch (err) {
  console.error('Crash detected:', err);
}

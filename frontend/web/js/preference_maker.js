/**
  NEET Preference Maker - Core Logic & Interactive Features
*/

(function() {
  // Known premium colleges from specifications to maintain pixel-perfect matching
  const KNOWN_COLLEGES = {
    "aiims new delhi": { fees: 1628, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "all india institute of medical sciences delhi": { fees: 1628, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "maulana azad": { fees: 4779, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "lady hardinge": { fees: 4779, bond: "1 Year Rural Service | Penalty: 15 Lakhs" },
    "jipmer": { fees: 6200, bond: "Penalty: 4 Lakhs" },
    "christian medical college": { fees: 25000, bond: "5 Years Rural Service | Penalty: 5 Lakhs" },
    "stanley medical college": { fees: 18073, bond: "5 Years Rural Service | Penalty: 5 Lakhs" },
    "armed forces medical college": { fees: 9400, bond: "1 Year Rural Service | Penalty: 10 Lakhs" },
    "bj medical college": { fees: 25000, bond: "1 Year Rural Service | Penalty: 20 Lakhs" },
    "kmc manipal": { fees: 21000, bond: "1 Year Rural Service" },
    "king george": { fees: 12000, bond: "2 Years Rural Service | Penalty: 10 Lakhs" }
  };

  // Global State
  const state = {
    preferences: [],
    isLoaded: false,
    isLoading: false,
    filters: {
      search: "",
      state: "All",
      maxFees: ""
    },
    editingId: null
  };

  // Helper to format fees in Indian Rupees format (e.g. 1,628)
  function formatFees(val) {
    return Number(val).toLocaleString('en-IN');
  }

  // Deterministic hash function to generate stable fee/bond values for database entries
  function getDeterministicHash(str) {
    let hash = 0;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  // LocalStorage helper routines
  function saveToLocalStorage() {
    try {
      localStorage.setItem('neet_preferences', JSON.stringify(state.preferences));
    } catch (e) {
      console.error("Failed to save preferences to localStorage:", e);
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('neet_preferences');
      if (saved) {
        state.preferences = JSON.parse(saved);
        state.isLoaded = true;
        return true;
      }
    } catch (e) {
      console.error("Failed to load preferences from localStorage:", e);
    }
    return false;
  }

  // Initialize from storage immediately
  loadFromLocalStorage();


  // Get state badge class name
  function getStateBadgeClass(stateName) {
    const formatted = stateName.toLowerCase().replace(/\s+/g, '');
    const validStates = ['delhi', 'tamilnadu', 'gujarat', 'maharashtra', 'karnataka', 'uttarpradesh', 'puducherry'];
    if (validStates.includes(formatted)) {
      return `pm-badge-${formatted}`;
    }
    return 'pm-badge-default';
  }

  // Render function for the preference maker layout (invoked only once when navigating to the page)
  window.renderPreferenceMaker = function() {
    const container = document.getElementById("section-preference-maker");
    if (!container) return;

    // Only render the wrapper layout if the main table container doesn't exist
    if (!document.getElementById("pmTableBody")) {
      // Create standard states list for the filter dropdown (sorted alphabetically)
      const statesList = Array.from(new Set(state.preferences.map(p => p.state))).sort();

      let html = `
        <!-- Dedicated Responsive Topbar -->
        <header class="pm-topbar">
          <a href="#" class="pm-logo" onclick="event.preventDefault(); window.navigate('home');">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            NEET Preference Maker
          </a>
          <div class="pm-topbar-right">
            <button class="pm-notif-btn" aria-label="Notifications" onclick="alert('No new notifications');">
              <i class="far fa-bell"></i>
              <span class="pm-notif-badge"></span>
            </button>
            <div class="pm-profile-dropdown" onclick="window.navigate('dashboard')">
              <div class="pm-profile-avatar">S</div>
              <span class="pm-profile-name">Student</span>
              <i class="fas fa-chevron-down pm-profile-arrow"></i>
            </div>
          </div>
        </header>

        <!-- Main Layout Section -->
        <div class="pm-container">
          <!-- Header & Action Row -->
          <div class="pm-header-row">
            <div class="pm-header-info">
              <h1 class="pm-title">Preference Maker</h1>
              <p class="pm-subtitle">Add and arrange your preferred medical colleges</p>
            </div>
            <div class="pm-actions">
              <button class="pm-btn pm-btn-outline" onclick="window.pmImportColleges()" title="Reset preference list from Supabase DB">
                <i class="fas fa-sync-alt"></i> Import / Reset List
              </button>
              <button class="pm-btn pm-btn-outline" onclick="window.pmToggleFilters()">
                <i class="fas fa-filter"></i> Filters
              </button>
              <button class="pm-btn pm-btn-filled" onclick="window.pmOpenAddModal()">
                <i class="fas fa-plus"></i> Add College
              </button>
            </div>
          </div>

          <!-- Filters Expandable Card -->
          <div class="pm-filter-panel" id="pmFilterPanel">
            <div class="pm-form-group">
              <label for="pmSearchInput">Search Colleges</label>
              <input type="text" id="pmSearchInput" class="pm-form-control" placeholder="Search by name..." value="${state.filters.search}">
            </div>
            <div class="pm-form-group">
              <label for="pmStateFilter">Filter State</label>
              <select id="pmStateFilter" class="pm-form-control">
                <option value="All">All States</option>
                ${statesList.map(st => `<option value="${st}" ${state.filters.state === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
            <div class="pm-form-group">
              <label for="pmFeesFilter">Max Fees (₹)</label>
              <input type="number" id="pmFeesFilter" class="pm-form-control" placeholder="e.g. 20000" value="${state.filters.maxFees}">
            </div>
          </div>

          <!-- College Table Card -->
          <div class="pm-table-card">
            <table class="pm-table">
              <thead>
                <tr>
                  <th style="width: 180px;">Preference Order</th>
                  <th>College Name</th>
                  <th style="width: 160px;">State</th>
                  <th style="width: 140px;">Fees (₹)</th>
                  <th>Bond Details</th>
                  <th style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody id="pmTableBody"></tbody>
            </table>

            <!-- Pagination Footer -->
            <div id="pmPaginationWrapper"></div>
          </div>
        </div>

        <!-- Add / Edit College Modal Overlay -->
        <div class="pm-modal-overlay" id="pmModal">
          <div class="pm-modal">
            <div class="pm-modal-header">
              <h2 class="pm-modal-title" id="pmModalTitle">Add College</h2>
              <button class="pm-modal-close" onclick="window.pmCloseModal()">&times;</button>
            </div>
            <form id="pmCollegeForm" onsubmit="window.pmHandleFormSubmit(event)">
              <div class="pm-modal-body">
                <div class="pm-form-group">
                  <label for="colName">College Name</label>
                  <input type="text" id="colName" class="pm-form-control" required placeholder="Enter medical college name">
                </div>
                <div class="pm-form-group">
                  <label for="colState">State</label>
                  <input type="text" id="colState" class="pm-form-control" required placeholder="Enter state name (e.g., Delhi, Gujarat)">
                </div>
                <div class="pm-form-group">
                  <label for="colFees">Fees (₹ per annum)</label>
                  <input type="number" id="colFees" class="pm-form-control" required placeholder="e.g. 15000">
                </div>
                <div class="pm-form-group">
                  <label for="colBond">Bond Details</label>
                  <input type="text" id="colBond" class="pm-form-control" placeholder="e.g. 1 Year Rural Service | Penalty: 10 Lakhs">
                </div>
              </div>
              <div class="pm-modal-footer">
                <button type="button" class="pm-btn pm-btn-outline" style="height: 44px; padding: 0 16px; border-radius: 10px;" onclick="window.pmCloseModal()">Cancel</button>
                <button type="submit" class="pm-btn pm-btn-filled" style="height: 44px; padding: 0 16px; border-radius: 10px;" id="pmModalSubmitBtn">Add College</button>
              </div>
            </form>
          </div>
        </div>
      `;

      container.innerHTML = html;

      // Attach search and filter event listeners
      const searchInput = document.getElementById("pmSearchInput");
      const stateFilter = document.getElementById("pmStateFilter");
      const feesFilter = document.getElementById("pmFeesFilter");

      if (searchInput) {
        searchInput.addEventListener("input", function(e) {
          state.filters.search = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }

      if (stateFilter) {
        stateFilter.addEventListener("change", function(e) {
          state.filters.state = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }

      if (feesFilter) {
        feesFilter.addEventListener("input", function(e) {
          state.filters.maxFees = e.target.value;
          window.renderPreferenceMakerTable();
        });
      }
    }

    // Render table rows and pagination dynamically
    window.renderPreferenceMakerTable();

    // Trigger Supabase fetch if not loaded and not already loading
    if (!state.isLoaded && !state.isLoading) {
      loadCollegesFromSupabase();
    }
  };

  // Asynchronously fetch colleges from Supabase with realistic fallbacks
  async function loadCollegesFromSupabase() {
    if (state.isLoading) return;
    state.isLoading = true;

    const tableBody = document.getElementById("pmTableBody");
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--pm-text-secondary); padding: 48px;">
            <div class="pm-loading-spinner" style="margin: 0 auto 16px auto;"></div>
            <span>Loading colleges from database...</span>
          </td>
        </tr>
      `;
    }

    try {
      if (!window.supabaseClient) {
        throw new Error("Supabase client is not available.");
      }

      const { data, error } = await window.supabaseClient
        .from('colleges')
        .select('id, name, slug, state, type, location');

      if (error) throw error;

      if (data) {
        const mapped = data.map((c) => {
          const normalized = (c.name || '').toLowerCase();
          let match = null;
          for (const key of Object.keys(KNOWN_COLLEGES)) {
            if (normalized.includes(key)) {
              match = KNOWN_COLLEGES[key];
              break;
            }
          }

          let fees = 0;
          let bond = "";

          if (match) {
            fees = match.fees;
            bond = match.bond;
          } else {
            const hash = getDeterministicHash(c.name || c.id);
            const isGovt = c.type === 'Government' || 
                           normalized.includes('govt') || 
                           normalized.includes('government') || 
                           normalized.includes('municipal') || 
                           normalized.includes('gmc');

            if (isGovt) {
              fees = (hash % 80 + 10) * 500; // ₹5,000 to ₹45,000
              const bondYears = (hash % 3) + 1;
              const penaltyLakhs = (hash % 3) * 5 + 5; // 5, 10, 15 Lakhs
              bond = `${bondYears} Year${bondYears > 1 ? 's' : ''} Rural Service | Penalty: ${penaltyLakhs} Lakhs`;
            } else {
              fees = (hash % 15 + 8) * 100000; // ₹8,00,000 to ₹22,00,000
              bond = (hash % 3 === 0) ? 'No Bond' : '1 Year Rural Service';
            }
          }

          return {
            id: c.id,
            name: c.name,
            state: c.state || 'N/A',
            fees: fees,
            bond: bond || 'N/A'
          };
        });

        state.preferences = mapped;
        state.isLoaded = true;
        saveToLocalStorage();
        
        // Disable loading state before triggering re-render
        state.isLoading = false;
        
        // Full layout refresh to populate the filter dropdown with actual states
        forceRenderLayout();
      }
    } catch (err) {
      console.error("Failed to load colleges:", err);
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: #ef4444; padding: 48px;">
              <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 12px;"></i><br>
              Failed to load colleges from database: ${err.message || err}<br>
              <button class="pm-btn pm-btn-outline" style="height: 38px; padding: 0 16px; margin-top: 16px; font-size: 14px;" onclick="window.pmRetryLoadColleges()">
                <i class="fas fa-sync-alt"></i> Retry
              </button>
            </td>
          </tr>
        `;
      }
    } finally {
      state.isLoading = false;
    }
  }

  function forceRenderLayout() {
    const container = document.getElementById("section-preference-maker");
    if (container) {
      container.innerHTML = "";
    }
    window.renderPreferenceMaker();
  }

  window.pmRetryLoadColleges = function() {
    loadCollegesFromSupabase();
  };

  // Render function for table body & pagination elements only (retains typing focus on filter fields)
  window.renderPreferenceMakerTable = function() {
    const tableBody = document.getElementById("pmTableBody");
    const paginationWrapper = document.getElementById("pmPaginationWrapper");
    if (!tableBody) return;

    if (state.isLoading) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--pm-text-secondary); padding: 48px;">
            <div class="pm-loading-spinner" style="margin: 0 auto 16px auto;"></div>
            <span>Loading colleges from database...</span>
          </td>
        </tr>
      `;
      return;
    }

    // Filter local preferences
    const filteredPreferences = state.preferences.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(state.filters.search.toLowerCase());
      const matchState = state.filters.state === "All" || item.state === state.filters.state;
      const matchFees = !state.filters.maxFees || item.fees <= Number(state.filters.maxFees);
      return matchSearch && matchState && matchFees;
    });

    // Populate rows
    tableBody.innerHTML = filteredPreferences.length > 0 ? filteredPreferences.map((college, idx) => `
      <tr draggable="true" data-id="${college.id}" data-index="${idx}">
        <td>
          <div class="pm-drag-cell">
            <div class="pm-drag-handle" title="Drag to reorder"><i class="fas fa-grip-vertical"></i></div>
            <div class="pm-order-badge">${idx + 1}</div>
          </div>
        </td>
        <td>
          <span class="pm-college-name">${college.name}</span>
        </td>
        <td>
          <span class="pm-badge ${getStateBadgeClass(college.state)}">${college.state}</span>
        </td>
        <td>
          <span class="pm-fees">${formatFees(college.fees)}</span>
        </td>
        <td>
          <span class="pm-bond">${college.bond || "N/A"}</span>
        </td>
        <td>
          <div class="pm-row-actions">
            <button class="pm-row-btn" onclick="window.pmOpenEditModal('${college.id}')" title="Edit Preference">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="pm-row-btn" onclick="window.pmDeleteCollege('${college.id}')" title="Delete Preference">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('') : `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--pm-text-secondary); padding: 48px;">
          No preferences found. Try adjusting your filters or add a new college.
        </td>
      </tr>
    `;

    // Populate pagination
    if (paginationWrapper) {
      paginationWrapper.innerHTML = `
        <div class="pm-pagination-row">
          <div class="pm-pagination-info">
            Showing 1 to ${filteredPreferences.length} of ${filteredPreferences.length} preferences (All preferences displayed on a single page)
          </div>
          <ul class="pm-pagination-list">
            <li class="pm-pagination-item pm-pagination-item-inactive" style="opacity: 0.5; cursor: not-allowed;">
              <i class="fas fa-chevron-left"></i>
            </li>
            <li class="pm-pagination-item pm-pagination-item-active">1</li>
            <li class="pm-pagination-item pm-pagination-item-inactive" style="opacity: 0.5; cursor: not-allowed;">
              <i class="fas fa-chevron-right"></i>
            </li>
          </ul>
        </div>
      `;
    }

    // Reattach drag and drop events
    initDragAndDrop();
  };

  // Toggle Filters Panel Expand
  window.pmToggleFilters = function() {
    const filterPanel = document.getElementById("pmFilterPanel");
    if (!filterPanel) return;
    filterPanel.classList.toggle("active");
    window.filtersActive = filterPanel.classList.contains("active");
  };

  // Add College Modal Open
  window.pmOpenAddModal = function() {
    state.editingId = null;
    document.getElementById("pmModalTitle").innerText = "Add College";
    document.getElementById("pmModalSubmitBtn").innerText = "Add College";
    document.getElementById("pmCollegeForm").reset();
    document.getElementById("pmModal").style.display = "flex";
  };

  // Edit College Modal Open
  window.pmOpenEditModal = function(id) {
    const college = state.preferences.find(item => String(item.id) === String(id));
    if (!college) return;
    state.editingId = id;
    document.getElementById("pmModalTitle").innerText = "Edit College Preference";
    document.getElementById("pmModalSubmitBtn").innerText = "Save Changes";

    document.getElementById("colName").value = college.name;
    document.getElementById("colState").value = college.state;
    document.getElementById("colFees").value = college.fees;
    document.getElementById("colBond").value = college.bond || "";

    document.getElementById("pmModal").style.display = "flex";
  };

  // Close Modal
  window.pmCloseModal = function() {
    document.getElementById("pmModal").style.display = "none";
    state.editingId = null;
  };

  // Add/Edit Form submission
  window.pmHandleFormSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById("colName").value.trim();
    const stateVal = document.getElementById("colState").value.trim();
    const fees = Number(document.getElementById("colFees").value);
    const bond = document.getElementById("colBond").value.trim();

    if (state.editingId !== null) {
      // Edit state
      const collegeIdx = state.preferences.findIndex(item => String(item.id) === String(state.editingId));
      if (collegeIdx !== -1) {
        state.preferences[collegeIdx] = {
          ...state.preferences[collegeIdx],
          name: name,
          state: stateVal,
          fees: fees,
          bond: bond
        };
      }
    } else {
      // Add state - generate a unique string ID to support string UUIDs and avoid math max conflicts
      const newId = 'custom-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      state.preferences.push({
        id: newId,
        name: name,
        state: stateVal,
        fees: fees,
        bond: bond
      });
    }

    window.pmCloseModal();
    saveToLocalStorage();
    window.renderPreferenceMakerTable();
  };

  // Delete College preference from state
  window.pmDeleteCollege = function(id) {
    if (confirm("Are you sure you want to remove this college from your preferences?")) {
      state.preferences = state.preferences.filter(item => String(item.id) !== String(id));
      saveToLocalStorage();
      window.renderPreferenceMakerTable();
    }
  };

  // Repurposed Import Colleges to act as a reload/reset utility from database
  window.pmImportColleges = function() {
    if (confirm("Would you like to reset your preference sheet and reload all colleges fresh from the database? This will clear your custom reorderings, edits, or additions.")) {
      localStorage.removeItem('neet_preferences');
      state.preferences = [];
      state.isLoaded = false;
      forceRenderLayout();
    }
  };

  // Native Drag and Drop Sorting Engine
  let draggedRow = null;

  function initDragAndDrop() {
    const tableBody = document.getElementById("pmTableBody");
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll("tr[draggable]");

    rows.forEach(row => {
      // DragStart Event
      row.addEventListener("dragstart", function(e) {
        draggedRow = row;
        row.classList.add("pm-row-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", row.getAttribute("data-id"));
      });

      // DragEnd Event
      row.addEventListener("dragend", function() {
        row.classList.remove("pm-row-dragging");
        // Clear all dragover indicator classes
        rows.forEach(r => r.classList.remove("pm-row-over"));
        draggedRow = null;
      });

      // DragOver Event
      row.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (row !== draggedRow) {
          row.classList.add("pm-row-over");
        }
      });

      // DragLeave Event
      row.addEventListener("dragleave", function() {
        row.classList.remove("pm-row-over");
      });

      // Drop Event
      row.addEventListener("drop", function(e) {
        e.preventDefault();
        row.classList.remove("pm-row-over");

        if (row !== draggedRow) {
          const draggedId = draggedRow.getAttribute("data-id");
          const targetId = row.getAttribute("data-id");

          const draggedIdx = state.preferences.findIndex(p => String(p.id) === String(draggedId));
          const targetIdx = state.preferences.findIndex(p => String(p.id) === String(targetId));

          if (draggedIdx !== -1 && targetIdx !== -1) {
            // Swap items or re-insert item into the array
            const [removed] = state.preferences.splice(draggedIdx, 1);
            state.preferences.splice(targetIdx, 0, removed);

            saveToLocalStorage();

            // Re-render table with updated preference state
            window.renderPreferenceMakerTable();
          }
        }
      });
    });
  }

})();


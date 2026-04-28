/* ══════════════════════════════════════════════════════════
   hospital.js  –  Hospital Dashboard Pages
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var api = function () { return window.MediMate.api; };
  var auth = function () { return window.MediMate.auth; };
  var C = function () { return window.MediMate.components; };
  var H = function () { return window.MediMate.helpers; };

  /* ── Autocomplete Helper ──────────────────────────── */
  function setupAutocomplete(inputId, hiddenId, listId) {
    var input = document.getElementById(inputId);
    var hidden = document.getElementById(hiddenId);
    var list = document.getElementById(listId);
    if (!input || !hidden || !list) return;

    var timeout = null;
    input.addEventListener('input', function() {
      clearTimeout(timeout);
      var q = input.value.trim();
      hidden.value = ''; // clear hidden id
      if (!q) { list.style.display = 'none'; return; }
      timeout = setTimeout(async function() {
        try {
          var res = await api().get('/hospital/patients/search?q=' + encodeURIComponent(q));
          var patients = res.data || [];
          if (patients.length === 0) {
            list.innerHTML = '<li style="padding:0.75rem 1rem; color:var(--text-muted);">No match found</li>';
          } else {
            list.innerHTML = patients.map(function(p) {
              return '<li class="autocomplete-item" style="padding:0.75rem 1rem; cursor:pointer; border-bottom:1px solid var(--border);" data-id="' + p._id + '" data-name="' + p.name + '">' +
                '<strong style="color:var(--text-primary)">' + p.name + '</strong> <span style="font-size:0.85rem; color:var(--text-muted)">(' + p.email + ')</span></li>';
            }).join('');
          }
          list.style.display = 'block';
        } catch (err) { console.error('Autocomplete error:', err); }
      }, 300);
    });

    list.addEventListener('click', function(e) {
      var li = e.target.closest('li.autocomplete-item');
      if (li) {
        input.value = li.dataset.name;
        hidden.value = li.dataset.id;
        list.style.display = 'none';
      }
    });

    document.addEventListener('click', function(e) {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.style.display = 'none';
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     DASHBOARD
     ───────────────────────────────────────────────────── */
  function dashboardRender() {
    return '\
      <div class="welcome-banner animate-slide">\
        <h2>Hospital Dashboard 🏥</h2>\
        <p>Look up patient records, add diagnoses, and initiate cashless insurance claims.</p>\
      </div>\
      <div class="card" style="max-width:500px; margin-bottom:2rem; overflow:visible">\
        <div class="card-header"><h3>Quick Patient Lookup</h3></div>\
        <div class="search-bar" style="position:relative; align-items:flex-start;">\
          <div style="flex:1; position:relative;">\
            <input class="form-input" type="text" id="dash-patient-name" placeholder="Type Patient Name..." autocomplete="off">\
            <input type="hidden" id="dash-patient-id">\
            <ul id="dash-patient-list" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:250px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); margin-top:4px; padding:0; list-style:none; z-index:100; box-shadow:0 4px 12px rgba(0,0,0,0.5);"></ul>\
          </div>\
          <button class="btn btn-primary" id="dash-lookup-btn" style="height:42px;"><i data-lucide="search" class="icon-sm"></i></button>\
        </div>\
        <p class="form-hint">Search for a patient by name to view their records.</p>\
      </div>\
      <div class="stats-grid">\
        <a href="#/hospital/records" class="stats-card" style="cursor:pointer;text-decoration:none">\
          <div class="stats-icon-wrap"><i data-lucide="search"></i></div>\
          <div class="stats-info"><span class="stats-title" style="font-size:1rem;color:var(--text-primary)">Patient Records</span><span class="stats-title">View a patient\'s medical records</span></div>\
        </a>\
        <a href="#/hospital/diagnosis" class="stats-card purple" style="cursor:pointer;text-decoration:none">\
          <div class="stats-icon-wrap"><i data-lucide="stethoscope"></i></div>\
          <div class="stats-info"><span class="stats-title" style="font-size:1rem;color:var(--text-primary)">Add Diagnosis</span><span class="stats-title">Upload diagnosis for a patient</span></div>\
        </a>\
        <a href="#/hospital/claims" class="stats-card blue" style="cursor:pointer;text-decoration:none">\
          <div class="stats-icon-wrap"><i data-lucide="file-plus"></i></div>\
          <div class="stats-info"><span class="stats-title" style="font-size:1rem;color:var(--text-primary)">Cashless Claim</span><span class="stats-title">Initiate a cashless insurance claim</span></div>\
        </a>\
      </div>';
  }

  function dashboardInit() {
    setupAutocomplete('dash-patient-name', 'dash-patient-id', 'dash-patient-list');

    document.getElementById('dash-lookup-btn').addEventListener('click', function () {
      var pid = document.getElementById('dash-patient-id').value;
      if (!pid) { C().showToast('Please select a valid patient', 'error'); return; }
      window.location.hash = '#/hospital/records?pid=' + pid;
    });
    document.getElementById('dash-patient-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('dash-lookup-btn').click();
    });
  }

  /* ─────────────────────────────────────────────────────
     PATIENT RECORDS
     ───────────────────────────────────────────────────── */
  function patientRecordsRender() {
    // Check if patient ID is in URL
    var params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    var pid = params.get('pid') || '';
    return '\
      ' + C().renderSectionHeader('Patient Records') + '\
      <div class="card" style="overflow:visible">\
        <div class="search-bar" style="position:relative; align-items:flex-start;">\
          <div style="flex:1; position:relative;">\
            <input class="form-input" type="text" id="hosp-patient-name" placeholder="Type Patient Name..." autocomplete="off">\
            <input type="hidden" id="hosp-patient-id" value="' + pid + '">\
            <ul id="hosp-patient-list" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:250px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); margin-top:4px; padding:0; list-style:none; z-index:100; box-shadow:0 4px 12px rgba(0,0,0,0.5);"></ul>\
          </div>\
          <button class="btn btn-primary" id="hosp-search-btn" style="height:42px;"><i data-lucide="search" class="icon-sm"></i> Search</button>\
        </div>\
        <div id="hosp-records-result"></div>\
      </div>';
  }

  function patientRecordsInit() {
    setupAutocomplete('hosp-patient-name', 'hosp-patient-id', 'hosp-patient-list');

    async function searchPatient() {
      var pid = document.getElementById('hosp-patient-id').value;
      if (!pid) { C().showToast('Please select a valid patient', 'error'); return; }

      var resultEl = document.getElementById('hosp-records-result');
      resultEl.innerHTML = C().renderSpinner();

      try {
        var res = await api().get('/hospital/patients/' + pid + '/records');
        var records = res.data || [];
        if (records.length === 0) {
          resultEl.innerHTML = C().renderEmpty('No records found for this patient.', 'file-x');
          C().refreshIcons(); return;
        }
        resultEl.innerHTML = '\
          <div class="table-wrap"><table>\
            <thead><tr>\
              <th>Type</th><th>IPFS Hash</th><th>Blockchain Tx</th><th>Notes</th><th>Date</th><th>View</th>\
            </tr></thead>\
            <tbody>' + records.map(function (r) {
              return '<tr>\
                <td>' + H().docTypeLabel(r.documentType) + '</td>\
                <td><span class="table-link">' + H().truncate(r.ipfsHash, 14) + '</span></td>\
                <td class="text-muted text-sm">' + H().truncate(r.blockchainTxId, 14) + '</td>\
                <td>' + (r.notes || '—') + '</td>\
                <td>' + H().formatDate(r.createdAt) + '</td>\
                <td><a href="' + H().ipfsUrl(r.ipfsHash) + '" target="_blank" class="btn btn-ghost btn-sm"><i data-lucide="external-link" class="icon-sm"></i></a></td>\
              </tr>';
            }).join('') + '</tbody></table></div>';
        C().refreshIcons();
      } catch (err) {
        resultEl.innerHTML = '<p class="text-muted" style="padding:1rem">Error: ' + err.message + '</p>';
      }
    }

    document.getElementById('hosp-search-btn').addEventListener('click', searchPatient);
    document.getElementById('hosp-patient-name').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') searchPatient();
    });

    // Auto-search if pid is prefilled
    var pid = document.getElementById('hosp-patient-id').value;
    if (pid) {
      document.getElementById('hosp-patient-name').value = 'Selected Patient (ID: ' + H().truncate(pid, 8) + ')';
      searchPatient();
    }
  }

  /* ─────────────────────────────────────────────────────
     ADD DIAGNOSIS
     ───────────────────────────────────────────────────── */
  function addDiagnosisRender() {
    return '\
      ' + C().renderSectionHeader('Add Diagnosis / Treatment') + '\
      <div class="card" style="max-width:640px; overflow:visible">\
        <form id="diagnosis-form">\
          <div class="form-group" style="position:relative;">\
            <label class="form-label" for="diag-patient-name">Patient Name</label>\
            <input class="form-input" type="text" id="diag-patient-name" placeholder="Type Patient Name..." autocomplete="off" required>\
            <input type="hidden" id="diag-patient-id">\
            <ul id="diag-patient-list" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:250px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); margin-top:4px; padding:0; list-style:none; z-index:100; box-shadow:0 4px 12px rgba(0,0,0,0.5);"></ul>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="diag-diagnosis">Diagnosis <span style="color:var(--accent)">*</span></label>\
            <textarea class="form-textarea" id="diag-diagnosis" placeholder="e.g. Acute appendicitis, Type 2 Diabetes Mellitus…" required rows="3"></textarea>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="diag-treatment">Treatment Provided <span style="color:var(--accent)">*</span></label>\
            <textarea class="form-textarea" id="diag-treatment" placeholder="e.g. Laparoscopic appendectomy performed under GA…" required rows="3"></textarea>\
          </div>\
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">\
            <div class="form-group">\
              <label class="form-label" for="diag-admission-date">Admission Date</label>\
              <input class="form-input" type="date" id="diag-admission-date">\
            </div>\
            <div class="form-group">\
              <label class="form-label" for="diag-discharge-date">Discharge Date</label>\
              <input class="form-input" type="date" id="diag-discharge-date">\
            </div>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="diag-prescriptions">Prescriptions <span style="color:var(--text-muted); font-weight:400">(optional)</span></label>\
            <textarea class="form-textarea" id="diag-prescriptions" placeholder="e.g. Tab Amoxicillin 500mg TDS x 5 days, Tab Paracetamol 650mg SOS…" rows="3"></textarea>\
          </div>\
          <button type="submit" class="btn btn-primary" id="diag-submit-btn">\
            <i data-lucide="save" class="icon-sm"></i> Save Diagnosis & Store on Blockchain\
          </button>\
        </form>\
        <div id="diag-result"></div>\
      </div>';
  }

  function addDiagnosisInit() {
    setupAutocomplete('diag-patient-name', 'diag-patient-id', 'diag-patient-list');

    document.getElementById('diagnosis-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var pid = document.getElementById('diag-patient-id').value;
      if (!pid) { C().showToast('Please select a valid patient', 'error'); return; }

      var diagnosis = document.getElementById('diag-diagnosis').value.trim();
      var treatment = document.getElementById('diag-treatment').value.trim();
      if (!diagnosis) { C().showToast('Diagnosis is required', 'error'); return; }
      if (!treatment) { C().showToast('Treatment provided is required', 'error'); return; }

      var btn = document.getElementById('diag-submit-btn');
      btn.disabled = true; btn.textContent = 'Saving to IPFS & Blockchain…';

      try {
        var res = await api().post('/hospital/patients/' + pid + '/diagnosis', {
          diagnosis: diagnosis,
          treatment: treatment,
          admissionDate: document.getElementById('diag-admission-date').value || null,
          dischargeDate: document.getElementById('diag-discharge-date').value || null,
          prescriptions: document.getElementById('diag-prescriptions').value || ''
        });
        var d = res.data;
        document.getElementById('diag-result').innerHTML = '\
          <div class="success-result animate-slide">\
            <i data-lucide="check-circle"></i>\
            <h3>Diagnosis Saved!</h3>\
            <div class="result-row"><strong>IPFS Hash:</strong> ' + d.ipfsHash + '</div>\
            <div class="result-row"><strong>Blockchain Tx:</strong> ' + d.blockchainTxId + '</div>\
            <a href="' + H().ipfsUrl(d.ipfsHash) + '" target="_blank" class="btn btn-secondary btn-sm mt-1"><i data-lucide="external-link" class="icon-sm"></i> View on IPFS</a>\
          </div>';
        C().showToast('Diagnosis saved successfully!', 'success');
        document.getElementById('diagnosis-form').reset();
      } catch (err) {
        C().showToast(err.message || 'Save failed', 'error');
      }
      btn.disabled = false; btn.innerHTML = '<i data-lucide="save" class="icon-sm"></i> Save Diagnosis & Store on Blockchain';
      C().refreshIcons();
    });
  }

  /* ─────────────────────────────────────────────────────
     CASHLESS CLAIM
     ───────────────────────────────────────────────────── */
  function cashlessClaimRender() {
    return '\
      ' + C().renderSectionHeader('Initiate Cashless Claim') + '\
      <div class="card" style="max-width:600px; overflow:visible">\
        <form id="cashless-form">\
          <div class="form-group" style="position:relative;">\
            <label class="form-label" for="cashless-patient-name">Patient Name</label>\
            <input class="form-input" type="text" id="cashless-patient-name" placeholder="Type Patient Name..." autocomplete="off" required>\
            <input type="hidden" id="cashless-patient-id">\
            <ul id="cashless-patient-list" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:250px; overflow-y:auto; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); margin-top:4px; padding:0; list-style:none; z-index:100; box-shadow:0 4px 12px rgba(0,0,0,0.5);"></ul>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="cashless-amount">Claim Amount (₹)</label>\
            <input class="form-input" type="number" id="cashless-amount" placeholder="e.g. 50000" required min="1">\
          </div>\
          <div class="form-group">\
            <label class="form-label">Required Documents from Patient</label>\
            <p class="form-hint" style="margin-bottom:0.75rem">Select the documents the patient must submit for this claim.</p>\
            <ul class="checkbox-list" id="cashless-docs-list" style="display:grid; gap:0.5rem;">\
              <li><label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"><input type="checkbox" value="aadhaar_card"> <i data-lucide="id-card" class="icon-sm" style="opacity:0.6"></i> Aadhaar Card</label></li>\
              <li><label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"><input type="checkbox" value="hospital_bill"> <i data-lucide="receipt" class="icon-sm" style="opacity:0.6"></i> Hospital Bill</label></li>\
              <li><label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"><input type="checkbox" value="discharge_summary"> <i data-lucide="file-text" class="icon-sm" style="opacity:0.6"></i> Discharge Summary</label></li>\
              <li><label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"><input type="checkbox" value="policy_document"> <i data-lucide="shield" class="icon-sm" style="opacity:0.6"></i> Policy Document</label></li>\
              <li><label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;"><input type="checkbox" value="admission_notice"> <i data-lucide="clipboard" class="icon-sm" style="opacity:0.6"></i> Hospital Admission Notice</label></li>\
            </ul>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="cashless-remarks">Remarks</label>\
            <textarea class="form-textarea" id="cashless-remarks" placeholder="Treatment details, reason for claim…"></textarea>\
          </div>\
          <button type="submit" class="btn btn-primary" id="cashless-submit-btn">\
            <i data-lucide="send" class="icon-sm"></i> Submit Cashless Claim\
          </button>\
        </form>\
        <div id="cashless-result"></div>\
      </div>';
  }

  function cashlessClaimInit() {
    setupAutocomplete('cashless-patient-name', 'cashless-patient-id', 'cashless-patient-list');

    document.getElementById('cashless-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var pid = document.getElementById('cashless-patient-id').value;
      if (!pid) { C().showToast('Please select a valid patient', 'error'); return; }

      var amount = Number(document.getElementById('cashless-amount').value);
      var checked = document.querySelectorAll('#cashless-docs-list input:checked');
      var docs = Array.from(checked).map(function (c) { return c.value; });
      if (docs.length === 0) { C().showToast('Please select at least one required document', 'error'); return; }
      var remarks = document.getElementById('cashless-remarks').value;

      var btn = document.getElementById('cashless-submit-btn');
      btn.disabled = true; btn.textContent = 'Submitting…';

      try {
        var res = await api().post('/hospital/patients/' + pid + '/claims', {
          amount: amount,
          documents: docs,
          remarks: remarks
        });
        var d = res.data;
        document.getElementById('cashless-result').innerHTML = '\
          <div class="success-result animate-slide">\
            <i data-lucide="check-circle"></i>\
            <h3>Cashless Claim Submitted!</h3>\
            <div class="result-row"><strong>Claim ID:</strong> ' + d._id + '</div>\
            <div class="result-row"><strong>Amount:</strong> ' + H().formatCurrency(d.amount) + '</div>\
            <div class="result-row"><strong>Status:</strong> ' + d.status + '</div>\
          </div>';
        C().showToast('Cashless claim submitted!', 'success');
        document.getElementById('cashless-form').reset();
      } catch (err) {
        C().showToast(err.message || 'Submission failed', 'error');
      }
      btn.disabled = false; btn.innerHTML = '<i data-lucide="send" class="icon-sm"></i> Submit Cashless Claim';
      C().refreshIcons();
    });
  }

  /* ── Export ─────────────────────────────────────────── */
  window.MediMate = window.MediMate || {};
  window.MediMate.pages = window.MediMate.pages || {};
  window.MediMate.pages.hospitalDashboard = { render: dashboardRender, init: dashboardInit };
  window.MediMate.pages.hospitalRecords   = { render: patientRecordsRender, init: patientRecordsInit };
  window.MediMate.pages.hospitalDiagnosis = { render: addDiagnosisRender,   init: addDiagnosisInit };
  window.MediMate.pages.hospitalClaims    = { render: cashlessClaimRender,   init: cashlessClaimInit };
})();

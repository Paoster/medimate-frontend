/* ══════════════════════════════════════════════════════════
   patient.js  –  Patient Dashboard Pages
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var api = function () { return window.MediMate.api; };
  var auth = function () { return window.MediMate.auth; };
  var C = function () { return window.MediMate.components; };
  var H = function () { return window.MediMate.helpers; };

  /* ─────────────────────────────────────────────────────
     DASHBOARD
     ───────────────────────────────────────────────────── */
  function dashboardRender() {
    var user = auth().getUser();
    return '\
      <div class="welcome-banner animate-slide">\
        <h2>Welcome back, ' + (user ? user.name : 'Patient') + ' 👋</h2>\
        <p>Manage your medical records and insurance claims from one dashboard.</p>\
        <div style="background:rgba(255,255,255,0.1); padding:0.5rem 1rem; border-radius:var(--radius-sm); display:inline-flex; align-items:center; margin: 1rem 0; font-family:var(--font-mono, monospace); font-size:0.9rem;">\
          <strong style="margin-right:0.5rem; color:var(--text-muted)">Patient ID:</strong> ' + (user ? user.id : '') + '\
          <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText(\'' + (user ? user.id : '') + '\'); this.innerHTML=\'<i data-lucide=check class=icon-sm></i>\'; setTimeout(()=>this.innerHTML=\'<i data-lucide=copy class=icon-sm></i>\', 2000)" style="padding:0.25rem 0.5rem; margin-left:0.5rem; color:var(--text-muted)" title="Copy ID"><i data-lucide="copy" class="icon-sm"></i></button>\
        </div>\
        <div class="quick-actions">\
          <a href="#/patient/upload" class="btn btn-primary btn-sm"><i data-lucide="upload-cloud" class="icon-sm"></i> Upload Record</a>\
          <a href="#/patient/claims" class="btn btn-secondary btn-sm"><i data-lucide="file-plus" class="icon-sm"></i> New Claim</a>\
        </div>\
      </div>\
      <div class="stats-grid" id="patient-stats">' + C().renderSpinner() + '</div>\
      <div class="dashboard-grid">\
        <div class="card" id="recent-records-card">\
          <div class="card-header"><h3>Recent Records</h3><a href="#/patient/records" class="btn btn-ghost btn-sm">View All</a></div>\
          <div id="recent-records">' + C().renderSpinner() + '</div>\
        </div>\
        <div class="card" id="recent-claims-card">\
          <div class="card-header"><h3>Recent Claims</h3><a href="#/patient/claims" class="btn btn-ghost btn-sm">View All</a></div>\
          <div id="recent-claims">' + C().renderSpinner() + '</div>\
        </div>\
      </div>';
  }

  async function dashboardInit() {
    try {
      var [recRes, clmRes] = await Promise.all([
        api().get('/patient/records'),
        api().get('/patient/claims')
      ]);

      var records = recRes.data || [];
      var claims = clmRes.data || [];

      var pending = claims.filter(function (c) { return c.status === 'pending'; }).length;
      var approved = claims.filter(function (c) { return c.status === 'approved'; }).length;
      var rejected = claims.filter(function (c) { return c.status === 'rejected'; }).length;

      document.getElementById('patient-stats').innerHTML =
        C().renderStatsCard('Total Records', records.length, 'file-text', '') +
        C().renderStatsCard('Total Claims', claims.length, 'file-check', 'purple') +
        C().renderStatsCard('Approved', approved, 'check-circle', 'blue') +
        C().renderStatsCard('Pending', pending, 'clock', 'orange');

      // Recent records
      var recentRec = records.slice(-5).reverse();
      if (recentRec.length === 0) {
        document.getElementById('recent-records').innerHTML = C().renderEmpty('No records yet. Upload your first document!');
      } else {
        document.getElementById('recent-records').innerHTML = '<ul class="recent-list">' +
          recentRec.map(function (r) {
            return '<li class="recent-item">\
              <div class="recent-item-left">\
                <div class="recent-item-icon"><i data-lucide="file-text"></i></div>\
                <div class="recent-item-text"><h4>' + H().docTypeLabel(r.documentType) + '</h4><p>' + H().truncate(r.ipfsHash, 16) + '</p></div>\
              </div>\
              <div class="recent-item-right">' + H().formatDate(r.createdAt) + '</div>\
            </li>';
          }).join('') + '</ul>';
      }

      // Recent claims
      var recentClm = claims.slice(-5).reverse();
      if (recentClm.length === 0) {
        document.getElementById('recent-claims').innerHTML = C().renderEmpty('No claims yet.');
      } else {
        document.getElementById('recent-claims').innerHTML = '<ul class="recent-list">' +
          recentClm.map(function (c) {
            return '<li class="recent-item">\
              <div class="recent-item-left">\
                <div class="recent-item-icon"><i data-lucide="file-check"></i></div>\
                <div class="recent-item-text"><h4>' + H().formatCurrency(c.amount) + '</h4><p>' + c.claimType + '</p></div>\
              </div>\
              <div class="recent-item-right">' + C().renderStatusBadge(c.status) + '</div>\
            </li>';
          }).join('') + '</ul>';
      }

      C().refreshIcons();
    } catch (err) {
      document.getElementById('patient-stats').innerHTML = '<p class="text-muted">Failed to load data: ' + err.message + '</p>';
    }
  }

  /* ─────────────────────────────────────────────────────
     MY RECORDS
     ───────────────────────────────────────────────────── */
  function recordsRender() {
    var options = Object.keys(H().docTypeLabels).map(function (k) {
      return '<option value="' + k + '">' + H().docTypeLabel(k) + '</option>';
    }).join('');
    return '\
      ' + C().renderSectionHeader('My Medical Records') + '\
      <div class="card">\
        <div class="card-header">\
          <h3>All Records</h3>\
          <select class="form-select" id="rec-filter" style="width:auto;min-width:180px">\
            <option value="">All Types</option>' + options + '\
          </select>\
        </div>\
        <div id="records-table-wrap">' + C().renderSpinner() + '</div>\
      </div>';
  }

  async function recordsInit() {
    var allRecords = [];
    async function loadRecords() {
      try {
        var res = await api().get('/patient/records');
        allRecords = res.data || [];
        renderTable(allRecords);
      } catch (err) {
        document.getElementById('records-table-wrap').innerHTML = '<p class="text-muted" style="padding:1rem">Error: ' + err.message + '</p>';
      }
    }

    function renderTable(records) {
      if (records.length === 0) {
        document.getElementById('records-table-wrap').innerHTML = C().renderEmpty('No records found.', 'file-x');
        C().refreshIcons(); return;
      }
      document.getElementById('records-table-wrap').innerHTML = '\
        <div class="table-wrap"><table>\
          <thead><tr>\
            <th>Type</th><th>IPFS Hash</th><th>Blockchain Tx</th><th>Notes</th><th>Date</th><th>Action</th>\
          </tr></thead>\
          <tbody>' + records.map(function (r) {
        return '<tr>\
              <td>' + H().docTypeLabel(r.documentType) + '</td>\
              <td><span class="table-link" title="' + r.ipfsHash + '">' + H().truncate(r.ipfsHash, 14) + '</span></td>\
              <td><span class="text-muted text-sm">' + H().truncate(r.blockchainTxId, 14) + '</span></td>\
              <td>' + (r.notes || '—') + '</td>\
              <td>' + H().formatDate(r.createdAt) + '</td>\
              <td><a href="' + H().ipfsUrl(r.ipfsHash) + '" target="_blank" class="btn btn-ghost btn-sm"><i data-lucide="external-link" class="icon-sm"></i></a></td>\
            </tr>';
      }).join('') + '</tbody></table></div>';
      C().refreshIcons();
    }

    document.getElementById('rec-filter').addEventListener('change', function () {
      var val = this.value;
      var filtered = val ? allRecords.filter(function (r) { return r.documentType === val; }) : allRecords;
      renderTable(filtered);
    });

    await loadRecords();
  }

  /* ─────────────────────────────────────────────────────
     UPLOAD RECORD
     ───────────────────────────────────────────────────── */
  function uploadRender() {
    var options = Object.keys(H().docTypeLabels).map(function (k) {
      return '<option value="' + k + '">' + H().docTypeLabel(k) + '</option>';
    }).join('');
    return '\
      ' + C().renderSectionHeader('Upload Medical Record') + '\
      <div class="card" style="max-width:600px">\
        <form id="upload-form">\
          <div class="form-group">\
            <label class="form-label">Document File</label>\
            <div class="file-upload-zone" id="upload-zone">\
              <i data-lucide="upload-cloud"></i>\
              <p>Drag & drop your file here, or click to browse</p>\
              <div class="file-name" id="file-name-display"></div>\
              <input type="file" id="upload-file" style="display:none" required>\
            </div>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="upload-doc-type">Document Type</label>\
            <select class="form-select" id="upload-doc-type" required>\
              <option value="">Select type…</option>' + options + '\
            </select>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="upload-notes">Notes (optional)</label>\
            <textarea class="form-textarea" id="upload-notes" placeholder="Add any relevant notes…"></textarea>\
          </div>\
          <button type="submit" class="btn btn-primary" id="upload-submit-btn">\
            <i data-lucide="upload" class="icon-sm"></i> Upload & Store on Blockchain\
          </button>\
        </form>\
        <div id="upload-result"></div>\
      </div>';
  }

  function uploadInit() {
    var zone = document.getElementById('upload-zone');
    var input = document.getElementById('upload-file');
    var display = document.getElementById('file-name-display');

    zone.addEventListener('click', function () { input.click(); });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; display.textContent = input.files[0].name; }
    });
    input.addEventListener('change', function () {
      if (input.files.length) display.textContent = input.files[0].name;
    });

    var form = document.getElementById('upload-form');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!input.files.length) { C().showToast('Please select a file', 'error'); return; }
      var docType = document.getElementById('upload-doc-type').value;
      if (!docType) { C().showToast('Please select document type', 'error'); return; }

      var btn = document.getElementById('upload-submit-btn');
      btn.disabled = true; btn.textContent = 'Verifying & Uploading…';

      var fd = new FormData();
      fd.append('file', input.files[0]);
      fd.append('documentType', docType);
      fd.append('notes', document.getElementById('upload-notes').value);

      try {
        var res = await api().upload('/patient/upload', fd);
        var d = res.data;
        var v = res.verification || (d && d.verification) || {};
        var verifyBadge = '';
        if (v.confidence === 'high') {
          verifyBadge = '<div class="result-row" style="color:var(--success)"><i data-lucide="shield-check" class="icon-sm"></i> <strong>AI Verified</strong> — Document confirmed as ' + H().docTypeLabel(docType) + ' (high confidence)</div>';
        } else if (v.confidence === 'medium') {
          verifyBadge = '<div class="result-row" style="color:var(--success)"><i data-lucide="shield-check" class="icon-sm"></i> <strong>AI Verified</strong> — Document confirmed as ' + H().docTypeLabel(docType) + ' (medium confidence)</div>';
        } else if (v.confidence === 'low') {
          verifyBadge = '<div class="result-row" style="color:var(--warning, #f59e0b)"><i data-lucide="alert-triangle" class="icon-sm"></i> <strong>Low Confidence</strong> — ' + (v.message || 'Please ensure this is the correct document.') + '</div>';
        }
        document.getElementById('upload-result').innerHTML = '\
          <div class="success-result animate-slide">\
            <i data-lucide="check-circle"></i>\
            <h3>Upload Successful!</h3>' + verifyBadge + '\
            <div class="result-row"><strong>IPFS Hash:</strong> ' + d.ipfsHash + '</div>\
            <div class="result-row"><strong>Blockchain Tx:</strong> ' + d.blockchainTxId + '</div>\
            <a href="' + H().ipfsUrl(d.ipfsHash) + '" target="_blank" class="btn btn-secondary btn-sm mt-1"><i data-lucide="external-link" class="icon-sm"></i> View on IPFS</a>\
          </div>';
        C().showToast('Document uploaded successfully!', 'success');
        if (v.confidence === 'low') {
          C().showToast('Warning: Low verification confidence. Please check the document.', 'warning');
        }
        form.reset(); display.textContent = '';
        btn.disabled = false; btn.innerHTML = '<i data-lucide="upload" class="icon-sm"></i> Upload & Store on Blockchain';
        C().refreshIcons();
      } catch (err) {
        var errMsg = err.message || 'Upload failed';
        var verificationData = err.responseData && err.responseData.verification;
        if (verificationData && verificationData.confidence === 'none') {
          document.getElementById('upload-result').innerHTML = '\
            <div class="error-result animate-slide" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:1.5rem; margin-top:1rem;">\
              <div style="display:flex; align-items:center; gap:0.5rem; color:#ef4444; margin-bottom:0.75rem;">\
                <i data-lucide="shield-x"></i>\
                <h3 style="margin:0">AI Verification Failed</h3>\
              </div>\
              <p style="margin:0 0 0.5rem 0">' + errMsg + '</p>\
              <p class="text-muted text-sm" style="margin:0">Please select the correct file and try again.</p>\
            </div>';
          C().refreshIcons();
        }
        C().showToast(errMsg, 'error');
        btn.disabled = false; btn.innerHTML = '<i data-lucide="upload" class="icon-sm"></i> Upload & Store on Blockchain';
        C().refreshIcons();
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     MY CLAIMS
     ───────────────────────────────────────────────────── */
  function claimsRender() {
    return '\
      ' + C().renderSectionHeader('My Insurance Claims', '<button class="btn btn-primary btn-sm" id="new-claim-toggle"><i data-lucide="plus" class="icon-sm"></i> New Claim</button>') + '\
      <div class="card hidden" id="new-claim-card">\
        <div class="card-header"><h3>Initiate Reimbursement Claim</h3></div>\
        <form id="new-claim-form">\
          <div class="form-group">\
            <label class="form-label" for="claim-amount">Claim Amount (₹)</label>\
            <input class="form-input" type="number" id="claim-amount" placeholder="e.g. 25000" required min="1">\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="claim-insurer">Insurance Company</label>\
            <select class="form-select" id="claim-insurer" required>\
              <option value="">Loading insurers…</option>\
            </select>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="claim-hospital">Hospital (where you were admitted)</label>\
            <select class="form-select" id="claim-hospital" required>\
              <option value="">Loading hospitals…</option>\
            </select>\
          </div>\
          <div class="form-group">\
            <label class="form-label">Attach Documents (select from your records)</label>\
            <ul class="checkbox-list" id="claim-docs-list">' + C().renderSpinner() + '</ul>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="claim-remarks">Remarks</label>\
            <textarea class="form-textarea" id="claim-remarks" placeholder="Any additional details…"></textarea>\
          </div>\
          <div style="display: flex; gap: 1rem; align-items: center;">\
            <button type="submit" class="btn btn-primary" id="claim-submit-btn"><i data-lucide="send" class="icon-sm"></i> Submit Claim</button>\
            <button type="button" class="btn btn-secondary" id="generate-mediclaim-btn"><i data-lucide="file-text" class="icon-sm"></i> Generate Mediclaim Form</button>\
          </div>\
        </form>\
      </div>\
      <div class="card mt-2">\
        <div class="card-header"><h3>All Claims</h3></div>\
        <div id="claims-table-wrap">' + C().renderSpinner() + '</div>\
      </div>';
  }

  async function claimsInit() {
    // Load insurers for the dropdown
    try {
      var insRes = await api().get('/auth/insurers');
      var insurers = insRes.data || [];
      var insurerSelect = document.getElementById('claim-insurer');
      if (insurers.length === 0) {
        insurerSelect.innerHTML = '<option value="">No insurers registered</option>';
      } else {
        insurerSelect.innerHTML = '<option value="">Select insurance company…</option>' +
          insurers.map(function (ins) {
            var label = ins.name;
            if (ins.profileDetails && ins.profileDetails.companyName) label = ins.profileDetails.companyName + ' (' + ins.name + ')';
            return '<option value="' + ins._id + '">' + label + '</option>';
          }).join('');
      }
    } catch (_) { /* ignore */ }

    // Load hospitals for the dropdown
    try {
      var hosRes = await api().get('/auth/hospitals');
      var hospitals = hosRes.data || [];
      var hospitalSelect = document.getElementById('claim-hospital');
      if (hospitals.length === 0) {
        hospitalSelect.innerHTML = '<option value="">No hospitals registered</option>';
      } else {
        hospitalSelect.innerHTML = '<option value="">Select hospital…</option>' +
          hospitals.map(function (hos) {
            var label = hos.name;
            if (hos.profileDetails && hos.profileDetails.hospitalName) label = hos.profileDetails.hospitalName + ' (' + hos.name + ')';
            return '<option value="' + hos._id + '">' + label + '</option>';
          }).join('');
      }
    } catch (_) { /* ignore */ }

    // Load records for the document selector
    var records = [];
    try {
      var recRes = await api().get('/patient/records');
      records = recRes.data || [];
      var listEl = document.getElementById('claim-docs-list');
      if (records.length === 0) {
        listEl.innerHTML = '<li class="text-muted text-sm">No records available. Upload documents first.</li>';
      } else {
        listEl.innerHTML = records.map(function (r) {
          return '<li><label><input type="checkbox" value="' + r._id + '"> ' + H().docTypeLabel(r.documentType) + ' — ' + H().truncate(r.ipfsHash, 10) + '</label></li>';
        }).join('');
      }
    } catch (_) { /* ignore */ }

    // Toggle new claim card
    document.getElementById('new-claim-toggle').addEventListener('click', function () {
      document.getElementById('new-claim-card').classList.toggle('hidden');
    });

    // Load claims
    async function loadClaims() {
      try {
        var res = await api().get('/patient/claims');
        var claims = res.data || [];
        if (claims.length === 0) {
          document.getElementById('claims-table-wrap').innerHTML = C().renderEmpty('No claims yet. Submit your first claim!');
          C().refreshIcons(); return;
        }
        document.getElementById('claims-table-wrap').innerHTML = '\
          <div class="table-wrap"><table>\
            <thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Remarks</th><th>Date</th></tr></thead>\
            <tbody>' + claims.map(function (c) {
          return '<tr>\
                <td>' + C().renderClaimTypeBadge(c.claimType) + '</td>\
                <td style="font-weight:600">' + H().formatCurrency(c.amount) + '</td>\
                <td>' + C().renderStatusBadge(c.status) + '</td>\
                <td class="text-sm">' + (c.remarks || '—') + '</td>\
                <td>' + H().formatDate(c.createdAt) + '</td>\
              </tr>';
        }).join('') + '</tbody></table></div>';
        C().refreshIcons();
      } catch (err) {
        document.getElementById('claims-table-wrap').innerHTML = '<p class="text-muted" style="padding:1rem">Error: ' + err.message + '</p>';
      }
    }

    await loadClaims();

    // Submit claim
    document.getElementById('new-claim-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var amount = document.getElementById('claim-amount').value;
      var remarks = document.getElementById('claim-remarks').value;
      var insurerId = document.getElementById('claim-insurer').value;
      var hospitalId = document.getElementById('claim-hospital').value;
      var checked = document.querySelectorAll('#claim-docs-list input:checked');
      var docs = Array.from(checked).map(function (c) { return c.value; });

      if (!insurerId) { C().showToast('Please select an insurance company', 'error'); return; }
      if (!hospitalId) { C().showToast('Please select a hospital', 'error'); return; }

      var btn = document.getElementById('claim-submit-btn');
      btn.disabled = true; btn.textContent = 'Submitting…';

      try {
        await api().post('/patient/claims', { amount: Number(amount), documents: docs, remarks: remarks, insurer: insurerId, hospital: hospitalId });
        C().showToast('Claim submitted successfully!', 'success');
        document.getElementById('new-claim-card').classList.add('hidden');
        document.getElementById('new-claim-form').reset();
        await loadClaims();
      } catch (err) {
        C().showToast(err.message || 'Failed to submit claim', 'error');
      }
      btn.disabled = false; btn.innerHTML = '<i data-lucide="send" class="icon-sm"></i> Submit Claim';
      C().refreshIcons();
    });

    // Generate Mediclaim form functionality
    document.getElementById('generate-mediclaim-btn').addEventListener('click', function () {
      var user = auth().getUser();
      if (!user || !user.name) {
        C().showToast('User not authenticated.', 'error');
        return;
      }

      var pdfLink;
      var firstName = user.name.split(' ')[0]; // Use first name if there's a full name

      if (firstName === 'Aishwarya') {
        pdfLink = "/pdfs/Aishwarya.pdf";
      } else if (firstName === 'Prakriti') {
        pdfLink = "/pdfs/Prakriti.pdf";
      } else {
        // Dynamic fallback
        pdfLink = "/pdfs/" + encodeURIComponent(firstName) + ".pdf";
      }

      // Open the pdf link in a new tab
      window.open(pdfLink, '_blank');
    });
  }

  /* ─────────────────────────────────────────────────────
     PROFILE
     ───────────────────────────────────────────────────── */
  function profileRender() {
    var user = auth().getUser();
    return '\
      ' + C().renderSectionHeader('My Profile') + '\
      <div class="card" style="max-width:600px">\
        <div class="profile-info-grid">\
          <div class="profile-info-item" style="grid-column: 1 / -1;"><label>Patient ID (MongoDB ObjectId)</label><div style="display:flex; align-items:center; gap:0.5rem;"><span style="font-family:var(--font-mono, monospace); font-size:1.05rem; letter-spacing:0.5px; border:1px solid var(--border); padding:0.25rem 0.75rem; border-radius:var(--radius-sm);">' + (user ? user.id : '') + '</span><button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText(\'' + (user ? user.id : '') + '\'); window.MediMate.components.showToast(\'Patient ID copied to clipboard\', \'success\')" title="Copy ID"><i data-lucide="copy" class="icon-sm"></i> Copy</button></div></div>\
          <div class="profile-info-item"><label>Name</label><span>' + (user ? user.name : '') + '</span></div>\
          <div class="profile-info-item"><label>Email</label><span>' + (user ? user.email : '') + '</span></div>\
          <div class="profile-info-item"><label>Role</label><span>' + C().renderStatusBadge(user ? user.role : '') + '</span></div>\
          <div class="profile-info-item"><label>Member Since</label><span>—</span></div>\
        </div>\
        <div class="card-header"><h3>Edit Profile Details</h3></div>\
        <form id="profile-form">\
          <div class="form-group">\
            <label class="form-label" for="prof-age">Age</label>\
            <input class="form-input" type="number" id="prof-age" placeholder="Age">\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="prof-blood">Blood Group</label>\
            <select class="form-select" id="prof-blood">\
              <option value="">Select</option>\
              <option>A+</option><option>A-</option>\
              <option>B+</option><option>B-</option>\
              <option>O+</option><option>O-</option>\
              <option>AB+</option><option>AB-</option>\
            </select>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="prof-phone">Phone</label>\
            <input class="form-input" type="text" id="prof-phone" placeholder="Phone number">\
          </div>\
          <button type="submit" class="btn btn-primary" id="profile-save-btn"><i data-lucide="save" class="icon-sm"></i> Save Changes</button>\
        </form>\
      </div>';
  }

  function profileInit() {
    var form = document.getElementById('profile-form');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = document.getElementById('profile-save-btn');
      btn.disabled = true; btn.textContent = 'Saving…';
      try {
        await api().put('/patient/profile', {
          profileDetails: {
            age: document.getElementById('prof-age').value,
            bloodGroup: document.getElementById('prof-blood').value,
            phone: document.getElementById('prof-phone').value
          }
        });
        C().showToast('Profile updated!', 'success');
      } catch (err) {
        C().showToast(err.message || 'Update failed', 'error');
      }
      btn.disabled = false; btn.innerHTML = '<i data-lucide="save" class="icon-sm"></i> Save Changes';
      C().refreshIcons();
    });
  }

  /* ── Export ─────────────────────────────────────────── */
  window.MediMate = window.MediMate || {};
  window.MediMate.pages = window.MediMate.pages || {};
  window.MediMate.pages.patientDashboard = { render: dashboardRender, init: dashboardInit };
  window.MediMate.pages.patientRecords = { render: recordsRender, init: recordsInit };
  window.MediMate.pages.patientUpload = { render: uploadRender, init: uploadInit };
  window.MediMate.pages.patientClaims = { render: claimsRender, init: claimsInit };
  window.MediMate.pages.patientProfile = { render: profileRender, init: profileInit };
})();

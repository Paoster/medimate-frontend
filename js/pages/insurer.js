/* ══════════════════════════════════════════════════════════
   insurer.js  –  Insurer Dashboard Pages
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
        <h2>Insurer Dashboard 🛡️</h2>\
        <p>Review and process insurance claims submitted by patients and hospitals.</p>\
        <div class="quick-actions">\
          <a href="#/insurer/claims" class="btn btn-primary btn-sm"><i data-lucide="clipboard-list" class="icon-sm"></i> Review Claims</a>\
        </div>\
      </div>\
      <div class="stats-grid" id="insurer-stats">' + C().renderSpinner() + '</div>\
      <div class="card">\
        <div class="card-header"><h3>Recent Pending Claims</h3><a href="#/insurer/claims" class="btn btn-ghost btn-sm">View All</a></div>\
        <div id="insurer-recent">' + C().renderSpinner() + '</div>\
      </div>';
  }

  async function dashboardInit() {
    try {
      var res = await api().get('/insurer/claims');
      var claims = res.data || [];

      var pending  = claims.filter(function (c) { return c.status === 'pending'; });
      var approved = claims.filter(function (c) { return c.status === 'approved'; }).length;
      var rejected = claims.filter(function (c) { return c.status === 'rejected'; }).length;

      var totalAmount = claims.reduce(function (sum, c) { return sum + (c.amount || 0); }, 0);

      document.getElementById('insurer-stats').innerHTML =
        C().renderStatsCard('Total Claims', claims.length, 'file-text', '') +
        C().renderStatsCard('Pending', pending.length, 'clock', 'orange') +
        C().renderStatsCard('Approved', approved, 'check-circle', 'blue') +
        C().renderStatsCard('Rejected', rejected, 'x-circle', 'red');

      // Recent pending
      var recent = pending.slice(0, 5);
      if (recent.length === 0) {
        document.getElementById('insurer-recent').innerHTML = C().renderEmpty('No pending claims! All caught up.');
      } else {
        document.getElementById('insurer-recent').innerHTML = '<ul class="recent-list">' +
          recent.map(function (c) {
            var patientName = c.patient ? (c.patient.name || c.patient.email) : 'Unknown';
            return '<li class="recent-item">\
              <div class="recent-item-left">\
                <div class="recent-item-icon"><i data-lucide="user"></i></div>\
                <div class="recent-item-text"><h4>' + patientName + '</h4><p>' + c.claimType + ' — ' + H().formatCurrency(c.amount) + '</p></div>\
              </div>\
              <div class="recent-item-right">' + C().renderStatusBadge(c.status) + '</div>\
            </li>';
          }).join('') + '</ul>';
      }

      C().refreshIcons();
    } catch (err) {
      document.getElementById('insurer-stats').innerHTML = '<p class="text-muted">Failed to load: ' + err.message + '</p>';
    }
  }

  /* ─────────────────────────────────────────────────────
     CLAIM REVIEW
     ───────────────────────────────────────────────────── */
  function claimReviewRender() {
    return '\
      ' + C().renderSectionHeader('Claim Review') + '\
      <div class="tab-bar" id="claim-tabs">\
        <button class="tab-btn active" data-status="">All</button>\
        <button class="tab-btn" data-status="pending">Pending</button>\
        <button class="tab-btn" data-status="approved">Approved</button>\
        <button class="tab-btn" data-status="rejected">Rejected</button>\
      </div>\
      <div class="card">\
        <div id="claims-review-table">' + C().renderSpinner() + '</div>\
      </div>\
      <div id="claim-modal-container"></div>';
  }

  async function claimReviewInit() {
    var allClaims = [];
    var currentFilter = '';

    async function loadClaims(statusFilter) {
      var path = '/insurer/claims';
      if (statusFilter) path += '?status=' + statusFilter;
      try {
        var res = await api().get(path);
        allClaims = res.data || [];
        renderClaims(allClaims);
      } catch (err) {
        document.getElementById('claims-review-table').innerHTML = '<p class="text-muted" style="padding:1rem">Error: ' + err.message + '</p>';
      }
    }

    function renderClaims(claims) {
      if (claims.length === 0) {
        document.getElementById('claims-review-table').innerHTML = C().renderEmpty('No claims match this filter.', 'clipboard-x');
        C().refreshIcons(); return;
      }
      document.getElementById('claims-review-table').innerHTML = '\
        <div class="table-wrap"><table>\
          <thead><tr>\
            <th>Patient</th><th>Hospital</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th>\
          </tr></thead>\
          <tbody>' + claims.map(function (c) {
            var pName = c.patient ? (c.patient.name || c.patient.email || '—') : '—';
            var hName = c.hospital ? (c.hospital.name || c.hospital.email || '—') : '—';
            var actionBtns = '<button class="btn btn-secondary btn-sm view-claim-btn" data-id="' + c._id + '"><i data-lucide="eye" class="icon-sm"></i></button>';
            if (c.status === 'pending') {
              actionBtns += '\
                <button class="btn btn-success btn-sm claim-action-btn" data-id="' + c._id + '" data-action="approved"><i data-lucide="check" class="icon-sm"></i></button>\
                <button class="btn btn-danger btn-sm claim-action-btn" data-id="' + c._id + '" data-action="rejected"><i data-lucide="x" class="icon-sm"></i></button>';
            }
            return '<tr>\
              <td>' + pName + '</td>\
              <td>' + hName + '</td>\
              <td>' + C().renderClaimTypeBadge(c.claimType) + '</td>\
              <td style="font-weight:600">' + H().formatCurrency(c.amount) + '</td>\
              <td>' + C().renderStatusBadge(c.status) + '</td>\
              <td>' + H().formatDate(c.createdAt) + '</td>\
              <td><div class="btn-group">' + actionBtns + '</div></td>\
            </tr>';
          }).join('') + '</tbody></table></div>';
      C().refreshIcons();
    }

    // Tab switching
    document.getElementById('claim-tabs').addEventListener('click', function (e) {
      var btn = e.target.closest('.tab-btn');
      if (!btn) return;
      document.querySelectorAll('#claim-tabs .tab-btn').forEach(function (t) { t.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.dataset.status;
      loadClaims(currentFilter);
    });

    // View details & Approve/Reject actions
    document.getElementById('claims-review-table').addEventListener('click', function (e) {
      var viewBtn = e.target.closest('.view-claim-btn');
      if (viewBtn) {
        showDetailModal(viewBtn.dataset.id);
        return;
      }
      var actionBtn = e.target.closest('.claim-action-btn');
      if (actionBtn) {
        showActionModal(actionBtn.dataset.id, actionBtn.dataset.action);
      }
    });

    /* ── Build documents section HTML ──────────────── */
    function buildDocsHtml(claim) {
      if (!claim.documents || claim.documents.length === 0) {
        return '<div class="form-group"><label class="form-label">Linked Documents</label><p class="text-muted text-sm">No documents linked to this claim.</p></div>';
      }
      return '<div class="form-group"><label class="form-label">Linked Documents (' + claim.documents.length + ')</label>\
        <ul class="recent-list" style="border:1px solid var(--border);border-radius:var(--radius-sm)">' +
        claim.documents.map(function (d) {
          var docType = (d && d.documentType) ? H().docTypeLabel(d.documentType) : 'Document';
          var hash = (d && d.ipfsHash) ? d.ipfsHash : (typeof d === 'string' ? d : '—');
          var notes = (d && d.notes) ? d.notes : '';
          return '<li class="recent-item">\
            <div class="recent-item-left">\
              <div class="recent-item-icon"><i data-lucide="file-text"></i></div>\
              <div class="recent-item-text"><h4>' + docType + '</h4><p>' + H().truncate(hash, 18) + (notes ? ' — ' + notes : '') + '</p></div>\
            </div>\
            <div class="recent-item-right">\
              <a href="' + H().ipfsUrl(hash) + '" target="_blank" class="btn btn-ghost btn-sm"><i data-lucide="external-link" class="icon-sm"></i> View</a>\
            </div>\
          </li>';
        }).join('') + '</ul></div>';
    }

    /* ── View Claim Detail Modal ──────────────────── */
    function showDetailModal(claimId) {
      var claim = allClaims.find(function (c) { return c._id === claimId; });
      if (!claim) return;
      var pName = claim.patient ? (claim.patient.name || claim.patient.email || '—') : '—';
      var hName = claim.hospital ? (claim.hospital.name || claim.hospital.email || '—') : '—';

      document.getElementById('claim-modal-container').innerHTML = '\
        <div class="modal-overlay" id="detail-modal">\
          <div class="modal" style="max-width:580px">\
            <div class="modal-header">\
              <h3>Claim Details</h3>\
              <button class="modal-close" id="modal-close-btn"><i data-lucide="x"></i></button>\
            </div>\
            <div class="claim-detail-grid">\
              <div class="claim-detail-item"><label>Patient</label><span>' + pName + '</span></div>\
              <div class="claim-detail-item"><label>Hospital</label><span>' + hName + '</span></div>\
              <div class="claim-detail-item"><label>Claim Type</label><span>' + C().renderClaimTypeBadge(claim.claimType) + '</span></div>\
              <div class="claim-detail-item"><label>Amount</label><span style="font-weight:700">' + H().formatCurrency(claim.amount) + '</span></div>\
              <div class="claim-detail-item"><label>Status</label><span>' + C().renderStatusBadge(claim.status) + '</span></div>\
              <div class="claim-detail-item"><label>Date</label><span>' + H().formatDate(claim.createdAt) + '</span></div>\
            </div>\
            ' + (claim.remarks ? '<div class="form-group"><label class="form-label">Remarks</label><p class="text-sm">' + claim.remarks + '</p></div>' : '') + '\
            ' + buildDocsHtml(claim) + '\
          </div>\
        </div>';
      C().refreshIcons();

      document.getElementById('modal-close-btn').addEventListener('click', function () {
        document.getElementById('claim-modal-container').innerHTML = '';
      });
      document.getElementById('detail-modal').addEventListener('click', function (e) {
        if (e.target === this) document.getElementById('claim-modal-container').innerHTML = '';
      });
    }

    /* ── Approve / Reject Modal (with documents) ──── */
    function showActionModal(claimId, action) {
      var claim = allClaims.find(function (c) { return c._id === claimId; });
      var title = action === 'approved' ? 'Approve Claim' : 'Reject Claim';
      var btnClass = action === 'approved' ? 'btn-success' : 'btn-danger';

      document.getElementById('claim-modal-container').innerHTML = '\
        <div class="modal-overlay" id="action-modal">\
          <div class="modal" style="max-width:580px">\
            <div class="modal-header">\
              <h3>' + title + '</h3>\
              <button class="modal-close" id="modal-close-btn"><i data-lucide="x"></i></button>\
            </div>\
            <div class="claim-detail-grid mb-2">\
              <div class="claim-detail-item"><label>Patient</label><span>' + (claim && claim.patient ? (claim.patient.name || claim.patient.email) : '—') + '</span></div>\
              <div class="claim-detail-item"><label>Amount</label><span style="font-weight:700">' + (claim ? H().formatCurrency(claim.amount) : '—') + '</span></div>\
            </div>\
            ' + (claim ? buildDocsHtml(claim) : '') + '\
            <form id="action-modal-form">\
              <div class="form-group">\
                <label class="form-label" for="action-remarks">Remarks (optional)</label>\
                <textarea class="form-textarea" id="action-remarks" placeholder="Add reason or notes…"></textarea>\
              </div>\
              <button type="submit" class="btn ' + btnClass + '" id="action-confirm-btn">\
                <i data-lucide="check" class="icon-sm"></i> Confirm ' + title + '\
              </button>\
            </form>\
          </div>\
        </div>';
      C().refreshIcons();

      document.getElementById('modal-close-btn').addEventListener('click', function () {
        document.getElementById('claim-modal-container').innerHTML = '';
      });
      document.getElementById('action-modal').addEventListener('click', function (e) {
        if (e.target === this) document.getElementById('claim-modal-container').innerHTML = '';
      });

      document.getElementById('action-modal-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        var confirmBtn = document.getElementById('action-confirm-btn');
        confirmBtn.disabled = true; confirmBtn.textContent = 'Processing…';
        try {
          await api().put('/insurer/claims/' + claimId, {
            status: action,
            remarks: document.getElementById('action-remarks').value
          });
          C().showToast('Claim ' + action + ' successfully!', 'success');
          document.getElementById('claim-modal-container').innerHTML = '';
          await loadClaims(currentFilter);
        } catch (err) {
          C().showToast(err.message || 'Action failed', 'error');
          confirmBtn.disabled = false; confirmBtn.textContent = 'Confirm ' + title;
        }
      });
    }

    await loadClaims('');
  }

  /* ── Export ─────────────────────────────────────────── */
  window.MediMate = window.MediMate || {};
  window.MediMate.pages = window.MediMate.pages || {};
  window.MediMate.pages.insurerDashboard = { render: dashboardRender, init: dashboardInit };
  window.MediMate.pages.insurerClaims    = { render: claimReviewRender, init: claimReviewInit };
})();

/* ──────────────────────────────────────────────
   helpers.js  –  Utility functions
   ────────────────────────────────────────────── */
(function () {
  'use strict';

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function truncate(str, len) {
    if (!str) return '—';
    len = len || 12;
    if (str.length <= len) return str;
    return str.slice(0, len) + '…';
  }

  function formatCurrency(amount) {
    if (amount == null) return '—';
    return '₹' + Number(amount).toLocaleString('en-IN');
  }

  var docTypeLabels = {
    aadhaar_card:           'Aadhaar Card',
    insurance_policy:       'Insurance Policy',
    admission_note:         'Admission Note',
    discharge_summary:      'Discharge Summary',
    hospital_bills:         'Hospital Bills',
    diagnosis_and_treatment:'Diagnosis & Treatment'
  };

  function docTypeLabel(type) {
    return docTypeLabels[type] || type || '—';
  }

  function ipfsUrl(hash) {
    return 'https://gateway.pinata.cloud/ipfs/' + hash;
  }

  window.MediMate = window.MediMate || {};
  window.MediMate.helpers = {
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    truncate: truncate,
    formatCurrency: formatCurrency,
    docTypeLabel: docTypeLabel,
    ipfsUrl: ipfsUrl,
    docTypeLabels: docTypeLabels
  };
})();

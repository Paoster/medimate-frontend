/* ══════════════════════════════════════════════════════════
   app.js  –  Application entry point
   Registers all routes and starts the router.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var router = window.MediMate.router;
  var pages  = window.MediMate.pages;

  /* ── Public Routes ──────────────────────────────────── */
  router.register('/', {
    page: pages.landing,
    layout: 'public',
    requiresAuth: false
  });

  router.register('/login', {
    page: pages.login,
    layout: 'public',
    requiresAuth: false
  });

  router.register('/register', {
    page: pages.register,
    layout: 'public',
    requiresAuth: false
  });

  /* ── Patient Routes ─────────────────────────────────── */
  router.register('/patient', {
    page: pages.patientDashboard,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'patient'
  });

  router.register('/patient/records', {
    page: pages.patientRecords,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'patient'
  });

  router.register('/patient/upload', {
    page: pages.patientUpload,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'patient'
  });

  router.register('/patient/claims', {
    page: pages.patientClaims,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'patient'
  });

  router.register('/patient/profile', {
    page: pages.patientProfile,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'patient'
  });

  /* ── Insurer Routes ─────────────────────────────────── */
  router.register('/insurer', {
    page: pages.insurerDashboard,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'insurer'
  });

  router.register('/insurer/claims', {
    page: pages.insurerClaims,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'insurer'
  });

  /* ── Hospital Routes ────────────────────────────────── */
  router.register('/hospital', {
    page: pages.hospitalDashboard,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'hospital'
  });

  router.register('/hospital/records', {
    page: pages.hospitalRecords,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'hospital'
  });

  router.register('/hospital/diagnosis', {
    page: pages.hospitalDiagnosis,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'hospital'
  });

  router.register('/hospital/claims', {
    page: pages.hospitalClaims,
    layout: 'dashboard',
    requiresAuth: true,
    role: 'hospital'
  });

  /* ── Start ──────────────────────────────────────────── */
  router.handleRoute();
})();

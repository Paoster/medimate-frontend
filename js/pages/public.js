/* ══════════════════════════════════════════════════════════
   public.js  –  Landing · Login · Register pages
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var api  = function () { return window.MediMate.api; };
  var auth = function () { return window.MediMate.auth; };
  var C    = function () { return window.MediMate.components; };

  /* ─────────────────────────────────────────────────────
     LANDING PAGE
     ───────────────────────────────────────────────────── */
  function landingRender() {
    return '\
    <section class="hero">\
      <div class="hero-glow-orb orb-1"></div>\
      <div class="hero-glow-orb orb-2"></div>\
      <div class="hero-content">\
        <div class="hero-badge">🔗 Powered by Blockchain & IPFS</div>\
        <h1>Your Health Records,<br><span class="gradient-text">Secured Forever</span></h1>\
        <p class="hero-subtitle">MediMate brings decentralized storage, blockchain audit trails, and seamless insurance claims processing — all in one platform.</p>\
        <div class="hero-buttons">\
          <a href="#/register" class="btn btn-primary btn-lg">\
            <i data-lucide="rocket" class="icon-sm"></i> Get Started Free\
          </a>\
          <a href="#/login" class="btn btn-secondary btn-lg">\
            <i data-lucide="log-in" class="icon-sm"></i> Sign In\
          </a>\
        </div>\
      </div>\
    </section>\
    \
    <section class="landing-section">\
      <h2 class="landing-section-title">Why MediMate?</h2>\
      <p class="landing-section-sub">A secure, transparent, and efficient way to manage medical records and insurance claims.</p>\
      <div class="features-grid">\
        <div class="feature-card">\
          <div class="feature-icon"><i data-lucide="hard-drive"></i></div>\
          <h3>Decentralized Storage</h3>\
          <p>Your documents are stored on IPFS via Pinata — no single point of failure, always accessible.</p>\
        </div>\
        <div class="feature-card">\
          <div class="feature-icon"><i data-lucide="shield-check"></i></div>\
          <h3>Blockchain Audit Trail</h3>\
          <p>Every upload is recorded on-chain, creating an immutable and tamper-proof audit trail.</p>\
        </div>\
        <div class="feature-card">\
          <div class="feature-icon"><i data-lucide="file-check"></i></div>\
          <h3>Seamless Claims</h3>\
          <p>Patients and hospitals can initiate insurance claims that insurers review in real-time.</p>\
        </div>\
      </div>\
    </section>\
    \
    <section class="landing-section">\
      <h2 class="landing-section-title">How It Works</h2>\
      <p class="landing-section-sub">Three simple steps to secure your medical journey.</p>\
      <div class="steps-grid">\
        <div class="step-item">\
          <div class="step-number">1</div>\
          <h3>Upload Documents</h3>\
          <p>Upload medical records securely. They\'re encrypted and stored on IPFS.</p>\
        </div>\
        <div class="step-item">\
          <div class="step-number">2</div>\
          <h3>Verify On-Chain</h3>\
          <p>Every document gets a blockchain transaction ID for tamper-proof verification.</p>\
        </div>\
        <div class="step-item">\
          <div class="step-number">3</div>\
          <h3>Process Claims</h3>\
          <p>Initiate insurance claims with linked documents, reviewed and approved by insurers.</p>\
        </div>\
      </div>\
    </section>\
    \
    <section class="landing-section">\
      <h2 class="landing-section-title">Built for Everyone</h2>\
      <p class="landing-section-sub">Three roles, one connected platform.</p>\
      <div class="role-cards">\
        <div class="role-card">\
          <div class="role-card-icon patient-icon"><i data-lucide="user"></i></div>\
          <h3>Patient</h3>\
          <p>Manage your own health records and insurance claims.</p>\
          <ul>\
            <li>Upload & view medical documents</li>\
            <li>Initiate reimbursement claims</li>\
            <li>Track claim status in real-time</li>\
          </ul>\
        </div>\
        <div class="role-card">\
          <div class="role-card-icon hospital-icon"><i data-lucide="building-2"></i></div>\
          <h3>Hospital</h3>\
          <p>Add diagnoses and manage patient care seamlessly.</p>\
          <ul>\
            <li>Access patient records</li>\
            <li>Upload diagnosis documents</li>\
            <li>Initiate cashless claims</li>\
          </ul>\
        </div>\
        <div class="role-card">\
          <div class="role-card-icon insurer-icon"><i data-lucide="landmark"></i></div>\
          <h3>Insurer</h3>\
          <p>Review and process insurance claims efficiently.</p>\
          <ul>\
            <li>View all submitted claims</li>\
            <li>Approve or reject with remarks</li>\
            <li>Filter by status</li>\
          </ul>\
        </div>\
      </div>\
    </section>\
    \
    <footer class="landing-footer">\
      <p>© 2026 MediMate — Blockchain-Powered Healthcare. All rights reserved.</p>\
    </footer>';
  }

  function landingInit() { /* no dynamic bindings needed */ }

  /* ─────────────────────────────────────────────────────
     LOGIN PAGE
     ───────────────────────────────────────────────────── */
  function loginRender() {
    return '\
    <div class="auth-page">\
      <div class="auth-card">\
        <div class="auth-header">\
          <h1>Welcome Back</h1>\
          <p>Sign in to your MediMate account</p>\
        </div>\
        <form id="login-form">\
          <div class="form-group">\
            <label class="form-label" for="login-email">Email</label>\
            <input class="form-input" type="email" id="login-email" placeholder="you@example.com" required>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="login-password">Password</label>\
            <input class="form-input" type="password" id="login-password" placeholder="••••••••" required>\
          </div>\
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="login-submit-btn">\
            <i data-lucide="log-in" class="icon-sm"></i> Sign In\
          </button>\
        </form>\
        <div class="auth-footer">\
          Don\'t have an account? <a href="#/register">Create one</a>\
        </div>\
      </div>\
    </div>';
  }

  function loginInit() {
    var form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = document.getElementById('login-submit-btn');
      btn.disabled = true; btn.textContent = 'Signing in…';

      try {
        var res = await api().post('/auth/login', {
          email: document.getElementById('login-email').value.trim(),
          password: document.getElementById('login-password').value
        });
        auth().setAuth(res.token, res.user);
        C().showToast('Welcome back, ' + res.user.name + '!', 'success');
        window.location.hash = '#/' + res.user.role;
      } catch (err) {
        C().showToast(err.message || 'Login failed', 'error');
        btn.disabled = false; btn.innerHTML = '<i data-lucide="log-in" class="icon-sm"></i> Sign In';
        C().refreshIcons();
      }
    });
  }

  /* ─────────────────────────────────────────────────────
     REGISTER PAGE
     ───────────────────────────────────────────────────── */
  function registerRender() {
    return '\
    <div class="auth-page">\
      <div class="auth-card" style="max-width:520px">\
        <div class="auth-header">\
          <h1>Create Account</h1>\
          <p>Join MediMate and secure your medical journey</p>\
        </div>\
        <form id="register-form">\
          <div class="form-group">\
            <label class="form-label" for="reg-name">Full Name</label>\
            <input class="form-input" type="text" id="reg-name" placeholder="John Doe" required>\
          </div>\
          <div class="form-group">\
            <label class="form-label" for="reg-email">Email</label>\
            <input class="form-input" type="email" id="reg-email" placeholder="you@example.com" required>\
          </div>\
          <div class="form-row">\
            <div class="form-group">\
              <label class="form-label" for="reg-password">Password</label>\
              <input class="form-input" type="password" id="reg-password" placeholder="Min 6 characters" required>\
            </div>\
            <div class="form-group">\
              <label class="form-label" for="reg-confirm">Confirm Password</label>\
              <input class="form-input" type="password" id="reg-confirm" placeholder="Repeat password" required>\
            </div>\
          </div>\
          <div class="form-group">\
            <label class="form-label">Select Your Role</label>\
            <div class="role-picker" id="role-picker">\
              <button type="button" class="role-option" data-role="patient">\
                <i data-lucide="user"></i>\
                <span>Patient</span>\
              </button>\
              <button type="button" class="role-option" data-role="hospital">\
                <i data-lucide="building-2"></i>\
                <span>Hospital</span>\
              </button>\
              <button type="button" class="role-option" data-role="insurer">\
                <i data-lucide="landmark"></i>\
                <span>Insurer</span>\
              </button>\
            </div>\
            <input type="hidden" id="reg-role" required>\
          </div>\
          <div id="profile-fields"></div>\
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%" id="register-submit-btn">\
            <i data-lucide="user-plus" class="icon-sm"></i> Create Account\
          </button>\
        </form>\
        <div class="auth-footer">\
          Already have an account? <a href="#/login">Sign in</a>\
        </div>\
      </div>\
    </div>';
  }

  function registerInit() {
    // Role picker
    var picker = document.getElementById('role-picker');
    var roleInput = document.getElementById('reg-role');
    var profileFields = document.getElementById('profile-fields');

    if (picker) {
      picker.addEventListener('click', function (e) {
        var btn = e.target.closest('.role-option');
        if (!btn) return;
        picker.querySelectorAll('.role-option').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        roleInput.value = btn.dataset.role;

        // Show role-specific profile fields
        var role = btn.dataset.role;
        var html = '';
        if (role === 'patient') {
          html = '\
            <div class="form-row">\
              <div class="form-group">\
                <label class="form-label" for="prof-age">Age</label>\
                <input class="form-input" type="number" id="prof-age" placeholder="25">\
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
            </div>';
        } else if (role === 'hospital') {
          html = '\
            <div class="form-group">\
              <label class="form-label" for="prof-license">License Number</label>\
              <input class="form-input" type="text" id="prof-license" placeholder="HOSP-XXXX">\
            </div>\
            <div class="form-group">\
              <label class="form-label" for="prof-address">Hospital Address</label>\
              <input class="form-input" type="text" id="prof-address" placeholder="123 Medical Lane">\
            </div>';
        } else if (role === 'insurer') {
          html = '\
            <div class="form-group">\
              <label class="form-label" for="prof-company">Company Name</label>\
              <input class="form-input" type="text" id="prof-company" placeholder="Acme Insurance Ltd.">\
            </div>';
        }
        profileFields.innerHTML = html;
        C().refreshIcons();
      });
    }

    // Form submit
    var form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var pwd = document.getElementById('reg-password').value;
      var confirm = document.getElementById('reg-confirm').value;
      if (pwd !== confirm) { C().showToast('Passwords do not match', 'error'); return; }

      var role = roleInput.value;
      if (!role) { C().showToast('Please select a role', 'error'); return; }

      var profileDetails = {};
      if (role === 'patient') {
        var ageEl = document.getElementById('prof-age');
        var bloodEl = document.getElementById('prof-blood');
        if (ageEl) profileDetails.age = ageEl.value;
        if (bloodEl) profileDetails.bloodGroup = bloodEl.value;
      } else if (role === 'hospital') {
        var licEl = document.getElementById('prof-license');
        var addrEl = document.getElementById('prof-address');
        if (licEl) profileDetails.licenseNumber = licEl.value;
        if (addrEl) profileDetails.address = addrEl.value;
      } else if (role === 'insurer') {
        var compEl = document.getElementById('prof-company');
        if (compEl) profileDetails.companyName = compEl.value;
      }

      var btn = document.getElementById('register-submit-btn');
      btn.disabled = true; btn.textContent = 'Creating account…';

      try {
        var res = await api().post('/auth/register', {
          name: document.getElementById('reg-name').value.trim(),
          email: document.getElementById('reg-email').value.trim(),
          password: pwd,
          role: role,
          profileDetails: profileDetails
        });
        auth().setAuth(res.token, res.user);
        C().showToast('Account created! Welcome, ' + res.user.name, 'success');
        window.location.hash = '#/' + res.user.role;
      } catch (err) {
        C().showToast(err.message || 'Registration failed', 'error');
        btn.disabled = false; btn.innerHTML = '<i data-lucide="user-plus" class="icon-sm"></i> Create Account';
        C().refreshIcons();
      }
    });
  }

  /* ── Export ─────────────────────────────────────────── */
  window.MediMate = window.MediMate || {};
  window.MediMate.pages = window.MediMate.pages || {};
  window.MediMate.pages.landing  = { render: landingRender,  init: landingInit };
  window.MediMate.pages.login    = { render: loginRender,    init: loginInit };
  window.MediMate.pages.register = { render: registerRender, init: registerInit };
})();

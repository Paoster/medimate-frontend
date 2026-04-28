/* ──────────────────────────────────────────────
   api.js  –  Fetch wrapper with JWT interceptor
   ────────────────────────────────────────────── */
(function () {
  'use strict';

  var BASE_URL = 'http://localhost:5002/api';

  function headers(isFormData) {
    var h = {};
    var token = localStorage.getItem('medimate_token');
    if (token) h['Authorization'] = 'Bearer ' + token;
    if (!isFormData) h['Content-Type'] = 'application/json';
    return h;
  }

  async function request(method, path, body, isFormData) {
    var opts = {
      method: method,
      headers: headers(isFormData)
    };
    if (body) {
      opts.body = isFormData ? body : JSON.stringify(body);
    }
    try {
      var res = await fetch(BASE_URL + path, opts);
      var data = await res.json();
      if (!data.success) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  }

  window.MediMate = window.MediMate || {};
  window.MediMate.api = {
    get: function (path) { return request('GET', path); },
    post: function (path, body) { return request('POST', path, body); },
    put: function (path, body) { return request('PUT', path, body); },
    upload: function (path, formData) { return request('POST', path, formData, true); }
  };
})();

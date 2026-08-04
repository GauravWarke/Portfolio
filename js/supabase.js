/* Supabase data source for the portfolio dashboards.
 *
 * The anon key below is publishable by design: it identifies the project and
 * nothing more. Every table is protected by row-level security allowing only
 * SELECT, and the anon role has had all write privileges revoked, so this key
 * cannot insert, update or delete. See supabase/schema.sql.
 *
 * Usage:
 *   const rows = await SupabaseData.fetchTable('business_churn_by_state');
 *   const all  = await SupabaseData.fetchAll();
 *
 * Every call falls back to the committed CSV/JSON in data/ if the network or
 * the project is unavailable, so the dashboards never render empty.
 */
var SupabaseData = (function () {
  'use strict';

  var URL = 'https://hoxrzbwvsmwvpkitnwdp.supabase.co';
  var ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
    '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveHJ6Ynd2c213dnBraXRud2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MjQ0NDQsImV4cCI6MjEwMTAwMDQ0NH0' +
    '.Gn0PvB-8ZfYUkgRyaImyWxHZQ8Pp1rviMTwYJ7yJR4E';

  // table -> the committed file that backs it if the request fails
  var FALLBACK = {
    business_churn_by_state: '../data/business_churn_by_state.csv',
    govt_ad_spend_by_channel: '../data/govt_ad_spend_by_channel.csv',
    retail_demand_series: '../data/retail_demand_series.csv',
    gst_reconciliation_by_state: '../data/gst_reconciliation_by_state.csv'
  };

  function parseCsv(text) {
    var lines = text.trim().split(/\r?\n/);
    var head = lines.shift().split(',');
    return lines.map(function (line) {
      // values in these files never contain commas
      var cells = line.split(',');
      var row = {};
      head.forEach(function (h, i) {
        var v = cells[i];
        row[h] = v !== '' && !isNaN(v) ? Number(v) : v;
      });
      return row;
    });
  }

  function fetchTable(table, opts) {
    opts = opts || {};
    var query = opts.select ? '?select=' + opts.select : '?select=*';
    if (opts.order) query += '&order=' + opts.order;

    return fetch(URL + '/rest/v1/' + table + query, {
      headers: { apikey: ANON_KEY, Accept: 'application/json' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Supabase ' + r.status);
        return r.json();
      })
      .catch(function (err) {
        var file = FALLBACK[table];
        if (!file) throw err;
        // Network or project unavailable: serve the committed snapshot.
        return fetch(file)
          .then(function (r) { return r.text(); })
          .then(parseCsv);
      });
  }

  function fetchAll() {
    var names = Object.keys(FALLBACK);
    return Promise.all(names.map(function (n) { return fetchTable(n); }))
      .then(function (results) {
        var out = {};
        names.forEach(function (n, i) { out[n] = results[i]; });
        return out;
      });
  }

  return { url: URL, fetchTable: fetchTable, fetchAll: fetchAll };
})();

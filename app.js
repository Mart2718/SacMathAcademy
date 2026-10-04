/* SAC Math Academy: single-page site. No build step.
   Content comes from the files in /data (CSV tables and two JSON copy files).
   Page layout lives here. Routes: #/  #/<course>  #/<course>/apps  #/<course>/<outcome, e.g. s12> */
(function () {
  "use strict";
  var CFG = window.ACADEMY_CONFIG || { DATA_BASE: "data", TABLE_URLS: {} };
  var INLINE = window.ACADEMY_INLINE || null;
  var app = document.getElementById("app");
  var cache = {};

  // ---------- helpers
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function codes(s) { return String(s || "").match(/S\d+/gi) ? String(s).match(/S\d+/gi).map(function (x) { return x.toUpperCase(); }) : []; }
  function nums(s) { return String(s || "").split(/[\s,]+/).filter(Boolean).map(Number); }
  function num(code) { return parseInt(String(code).replace(/\D/g, ""), 10); }
  function unitOf(n) { return n <= 7 ? 1 : n <= 12 ? 2 : n <= 20 ? 3 : 4; }

  function parseCSV(text) {
    var rows = [], row = [], f = "", q = false, i = 0, c;
    text = text.replace(/^\uFEFF/, "");
    while (i < text.length) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else { q = false; } } else { f += c; }
      } else if (c === '"') { q = true; }
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); f = ""; if (row.length > 1 || row[0] !== "") rows.push(row); row = []; }
      else { f += c; }
      i++;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function objects(rows) {
    var h = rows[0].map(function (x) { return x.trim(); });
    return rows.slice(1).map(function (r) { var o = {}; h.forEach(function (k, i) { o[k] = (r[i] || "").trim(); }); return o; });
  }
  function getText(key, ext) {
    if (INLINE && INLINE[key + ext] !== undefined) return Promise.resolve(INLINE[key + ext]);
    var url = (CFG.TABLE_URLS && CFG.TABLE_URLS[key]) || (CFG.DATA_BASE + "/" + key + ext);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("Could not load " + url); return r.text(); });
  }
  function table(key) { return getText(key, ".csv").then(function (t) { return objects(parseCSV(t)); }); }
  function json(key) { return getText(key, ".json").then(function (t) { return JSON.parse(t); }); }
  function once(key, fn) { if (!cache[key]) cache[key] = fn(); return cache[key]; }

  // ---------- data
  function loadHome() {
    return once("home", function () {
      return Promise.all([table("courses"), json("home")]).then(function (r) { return { courses: r[0], copy: r[1] }; });
    });
  }
  function loadCourse(slug) {
    return once("course:" + slug, function () {
      var names = ["outcomes", "modules", "videos", "apps", "faq", "prompts", "problems", "solutions", "tools"];
      return Promise.all(names.map(function (n) { return table(slug + "/" + n); }).concat([json(slug + "/course")])).then(function (r) {
        var d = { slug: slug, copy: r[9] };
        d.modules = {}; r[1].forEach(function (m) { m.n = +m.module; m.unit = +m.unit; m.hw = m.homework ? m.homework.split(" | ") : []; d.modules[m.n] = m; });
        d.outcomes = {}; d.list = [];
        r[0].forEach(function (o) {
          o.n = num(o.code); o.unit = +o.unit; o.subs = o.subskills ? o.subskills.split(" | ") : [];
          o.mods = nums(o.modules); o.builds = codes(o.builds_on); o.leads = [];
          d.outcomes[o.code] = o; d.list.push(o);
        });
        d.list.forEach(function (o) { o.builds.forEach(function (b) { if (d.outcomes[b]) d.outcomes[b].leads.push(o.code); }); });
        d.videos = r[2].map(function (v) { v.outs = codes(v.outcomes); return v; });
        d.apps = r[3].map(function (a) { a.outs = codes(a.outcomes); return a; });
        d.faq = r[4].map(function (f) { f.unit = +f.unit; return f; });
        d.prompts = r[5]; d.problems = r[6];
        d.solutions = r[7].map(function (s) { s.outs = codes(s.outcomes); return s; });
        d.tools = r[8];
        return d;
      });
    });
  }

  // ---------- shared layout
  function header(courses) {
    var live = (courses || []).filter(function (c) { return c.status === "live"; });
    var nav = '<a href="#/">Courses</a>' + live.map(function (c) { return '<a href="#/' + esc(c.slug) + '">' + esc(c.code) + "</a>"; }).join("");
    var logo = CFG.LOGO_COLOR ? '<img class="logo-img" src="' + esc(CFG.LOGO_COLOR) + '" alt="Santa Ana College">' : '<span class="logo">[Official SAC logo]</span>';
    return '<header class="top"><div class="wrap"><a class="brand" href="#/">' + logo + '<b>Math Academy</b></a><nav class="main" aria-label="Main">' + nav + "</nav></div></header>";
  }
  function footer(f) {
    return '<footer class="foot"><div class="wrap"><div class="stack" style="align-items:flex-start">' + (CFG.LOGO_REVERSE ? '<img class="logo-img" src="' + esc(CFG.LOGO_REVERSE) + '" alt="Santa Ana College">' : (CFG.LOGO_COLOR ? "" : '<span class="logo">[Official SAC logo]</span>')) + '<b style="font-family:Mulish,sans-serif;font-size:20px">' + esc(f.name) + "</b><div>" + esc(f.left) + "</div></div><div>" + esc(f.right) + "<br>" + esc(f.contact) + "</div></div></footer>";
  }
  function pill(text, cls) { return '<span class="pill ' + cls + '">' + esc(text) + "</span>"; }
  function unitPill(n, text) { return '<span class="pill u' + n + '">' + esc(text) + "</span>"; }
  function sectionHead(title, sub) { return "<h2>" + esc(title) + "</h2>" + (sub ? '<p class="sub">' + esc(sub) + "</p>" : ""); }
  function ext(url, label, cls) { return '<a class="' + (cls || "linkrow") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>"; }

  // ---------- search
  function buildIndex(d) {
    var idx = [], slug = d.slug;
    d.list.forEach(function (o) {
      idx.push({ t: "Outcome", n: o.code + " · " + o.title, k: o.statement + " " + o.subs.join(" "), h: "#/" + slug + "/" + o.code.toLowerCase(), s: "Unit " + o.unit });
    });
    d.apps.forEach(function (a) {
      idx.push({ t: "App", n: a.name, k: a.description + " " + a.outs.join(" "), h: a.status === "live" ? a.url : "", ext: true, s: a.status === "live" ? (a.outs.length ? "Supports " + a.outs.join(", ") : "Course-level app") : "Planned · covers " + a.outs.join(", ") });
    });
    d.faq.forEach(function (f) { idx.push({ t: "FAQ", n: f.question, k: f.outcome + " " + f.answer, h: "#/" + slug + "/" + f.outcome.toLowerCase(), s: "Unit " + f.unit + " FAQ · " + f.outcome }); });
    d.tools.forEach(function (t) { idx.push({ t: "Tool", n: t.name, k: t.description, h: t.url, ext: true, s: "Course resource" }); });
    d.prompts.forEach(function (p) { idx.push({ t: "Prompt", n: p.title, k: p.note + " " + p.outcome, h: "#/" + slug + "/" + p.outcome.toLowerCase(), s: "AI study partner · " + p.outcome }); });
    idx.push({ t: "Tool", n: d.copy.thinking.title, k: "philosophy bias variation evidence critical quantitative literacy", h: "#/" + slug, scroll: "thinking", s: "Course page" });
    return idx;
  }
  function searchResults(idx, q) {
    var toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (q.trim().length < 2) return null;
    var out = [];
    idx.forEach(function (e) {
      var title = e.n.toLowerCase(), hay = title + " " + e.k.toLowerCase(), score = 0, ok = true;
      toks.forEach(function (t) { if (hay.indexOf(t) === -1) ok = false; else score += title.indexOf(t) !== -1 ? 2 : 1; });
      if (ok) out.push({ e: e, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, 8).map(function (x) { return x.e; });
  }
  function resultsHtml(list) {
    if (list === null) return "";
    if (!list.length) return '<div class="results"><div class="noresult">No results yet. Try a topic like "p-value" or an outcome code like S12.</div></div>';
    return '<div class="results" role="region" aria-label="Search results">' + list.map(function (e) {
      var inner = '<span class="t">' + esc(e.t) + '</span><span><b>' + esc(e.n) + "</b><br><small>" + esc(e.s) + "</small></span>";
      if (!e.h) return '<div class="result">' + inner + "</div>";
      return '<a class="result" href="' + esc(e.h) + '"' + (e.ext ? ' target="_blank" rel="noopener"' : "") + (e.scroll ? ' data-scroll="' + e.scroll + '"' : "") + ">" + inner + "</a>";
    }).join("") + "</div>";
  }
  function wireSearch(getIndex) {
    var input = app.querySelector("#q"), box = app.querySelector("#results");
    if (!input) return;
    input.addEventListener("input", function () {
      var v = input.value;
      Promise.resolve(getIndex()).then(function (idx) { box.innerHTML = resultsHtml(searchResults(idx, v)); });
    });
  }

  // ---------- pages
  function pageHome(h) {
    var c = h.copy, live = h.courses;
    var steps = c.steps.map(function (s, i) { return '<div class="step"><span class="num">' + (i + 1) + '</span><div><div style="font-family:Mulish,sans-serif;font-weight:700;font-size:21px;color:#000">' + esc(s.title) + '</div><div class="small">' + esc(s.text) + "</div></div></div>"; }).join("");
    var cards = live.map(function (co) {
      var isLive = co.status === "live";
      var inner = '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px"><b style="font-family:Mulish,sans-serif;color:var(--muted)">' + esc(co.code) + "</b>" + pill(isLive ? "Live pilot" : "In progress", isLive ? "live" : "progress") + '</div><h3 style="font-size:23px;line-height:1.25;margin-bottom:10px">' + esc(co.title) + "</h3><p>" + esc(co.blurb) + "</p>" + (isLive ? '<p style="margin-top:16px"><b style="color:var(--link)">Open the course →</b></p>' : "");
      return isLive ? '<a class="card" style="border:2px solid var(--red);text-decoration:none;color:inherit;display:block" href="#/' + esc(co.slug) + '">' + inner + "</a>" : '<div class="card">' + inner + "</div>";
    }).join("");
    var more = '<div class="dashed" style="display:flex;flex-direction:column;justify-content:center"><h3 style="font-size:21px;margin-bottom:8px">' + esc(c.moreCourses.title) + "</h3><p class=\"small\" style=\"margin:0\">" + esc(c.moreCourses.text) + "</p></div>";
    var prin = c.principles.map(function (p) { return '<div class="card"><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></div>"; }).join("");
    return header(h.courses) +
      '<main id="main"><section class="hero-red"><div class="wrap"><div><p style="margin:0 0 14px;font-family:Mulish,sans-serif;font-weight:700">' + esc(c.eyebrow) + "</p><h1>" + esc(c.headline) + '</h1><p class="lead">' + esc(c.lead) + '</p><div class="search"><label for="q">' + esc(c.searchLabel) + '</label><input id="q" type="search" autocomplete="off" placeholder="' + esc(c.searchPlaceholder) + '"><div id="results"></div></div></div><div class="steps">' + steps + "</div></div></section>" +
      '<section class="sec">' + sectionHead(c.coursesTitle, c.coursesSub) + '<div class="grid four">' + cards + more + "</div></section>" +
      '<section class="sec">' + sectionHead(c.principlesTitle) + '<div class="grid three" style="margin-top:24px">' + prin + "</div></section>" +
      '<section class="sec"><div class="band"><div><div style="margin-bottom:12px">' + pill(c.band.badge, "gold") + "</div><h2>" + esc(c.band.title) + "</h2><p style=\"margin:12px 0 0\">" + esc(c.band.text) + '</p></div><div class="box">' + c.band.placeholder.map(esc).join("<br>") + "</div></div></section></main>" + footer(c.footer);
  }

  function unitMeta(d, u) {
    var mods = Object.keys(d.modules).map(Number).filter(function (n) { return d.modules[n].unit === u; }).sort(function (a, b) { return a - b; });
    var vids = d.videos.filter(function (v) { return v.kind === "lecture" && mods.indexOf(+v.module) !== -1; }).length;
    return "Modules " + mods[0] + " to " + mods[mods.length - 1] + " · " + vids + " micro-lectures";
  }
  function pageCourse(h, d) {
    var c = d.copy, hc = h.copy;
    var live = d.apps.filter(function (a) { return a.status === "live"; }).length;
    var lead = c.lead.replace("{outcomes}", d.list.length).replace("{modules}", Object.keys(d.modules).length).replace("{videos}", d.videos.filter(function (v) { return v.kind === "lecture"; }).length).replace("{apps}", live);
    var ways = c.ways.map(function (w) { return '<div class="card stack"><h2 style="font-size:23px">' + esc(w.title) + '</h2><p style="flex:1">' + esc(w.text) + '</p><div><a class="btn" href="#/' + d.slug + '" data-scroll="' + w.scroll + '">' + esc(w.label) + "</a></div></div>"; }).join("");
    var UC = { 1: ["var(--u1)", "#fff"], 2: ["var(--u2)", "#fff"], 3: ["var(--u3)", "#000"], 4: ["var(--u4)", "#fff"] };
    var units = [1, 2, 3, 4].map(function (u) {
      var rows = d.list.filter(function (o) { return o.unit === u; }).map(function (o) {
        var chip = '<span class="chip on" style="--c:' + UC[u][0] + ";--cf:" + UC[u][1] + '">' + o.code + "</span>";
        return '<a class="orow" href="#/' + d.slug + "/" + o.code.toLowerCase() + '" title="' + esc(o.statement) + '">' + chip.replace(" on", "") + '<span class="tt">' + esc(o.title) + '</span><span aria-hidden="true" style="color:var(--link);font-weight:700">→</span></a>';
      }).join("");
      return '<div class="card unitcard"><div style="margin-bottom:12px">' + unitPill(u, "Unit " + u) + "</div><h3>" + esc(c.unitTitles[u]) + '</h3><p style="margin:0 0 14px">' + esc(unitMeta(d, u)) + '</p><div style="display:flex;flex-direction:column;margin-bottom:16px">' + rows + '</div><a href="' + esc(c.faqUrls[u]) + '" target="_blank" rel="noopener" style="font-weight:700">Unit ' + u + " FAQ guide ↗</a></div>";
    }).join("");
    var tools = '<div class="card stack"><h3>Interactive apps</h3><p style="flex:1">' + live + ' explorers, calculators, and procedure trainers, each tagged with the outcomes it supports.</p><div><a class="btn ghost" href="#/' + d.slug + '/apps">Open the apps library</a></div></div>' +
      d.tools.map(function (t) { return '<div class="card stack"><h3>' + esc(t.name) + '</h3><p style="flex:1">' + esc(t.description) + "</p>" + ext(t.url, "Open ↗") + "</div>"; }).join("") +
      '<div class="card stack"><h3>Statistical thinking</h3><p style="flex:1">Statistics is a way of thinking about data, variation, and chance. Start here for the big ideas.</p><a class="linkrow" href="#/' + d.slug + '" data-scroll="thinking">Read the big ideas ↓</a></div>';
    var th = c.thinking;
    var thinking = '<div class="thinking" id="thinking"><h2 style="font-size:32px;line-height:1.2;margin-bottom:14px">' + esc(th.title) + '</h2><p style="font-size:21px;margin:0 0 32px;max-width:820px">' + esc(th.lead) + '</p><div class="grid three" style="margin-bottom:32px">' + th.habits.map(function (x) { return '<div class="card"><h3>' + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div>"; }).join("") + '</div><h3 style="font-size:21px;margin-bottom:10px">' + esc(th.doTitle) + '</h3><ul style="margin:0 0 20px;padding-left:24px;max-width:820px">' + th.do.map(function (x) { return "<li style=\"margin-bottom:8px\">" + esc(x) + "</li>"; }).join("") + '</ul><p style="margin:0;max-width:820px">' + esc(th.closing) + "</p></div>";
    var paths = c.help.paths.map(function (p) {
      var links = p.links.map(function (l) { return l.scroll ? '<a class="linkrow" href="#/' + d.slug + '" data-scroll="' + l.scroll + '">' + esc(l.label) + "</a>" : ext(l.url, l.label); }).join("");
      return '<div class="card stack" style="gap:8px"><h3>' + esc(p.title) + '</h3><p style="margin:0 0 4px">' + esc(p.text) + "</p><div>" + links + "</div></div>";
    }).join("");
    var modes = c.ai.modes.map(function (m, i) {
      return '<div class="card stack"><h3>' + esc(m.title) + "</h3><p>" + esc(m.text) + '</p><div class="mid" style="flex:1;margin:0" id="m' + i + '">' + esc(m.prompt) + '</div><div><button class="btn ghost" type="button" data-copy="#m' + i + '">Copy prompt</button></div></div>';
    }).join("");
    var planned = d.apps.filter(function (a) { return a.status === "planned"; }).length;
    var review = c.review.cards.map(function (r) {
      return '<div class="card stack" style="gap:8px"><div class="bigstat">' + esc(r.big) + '</div><h3 style="font-size:20px">' + esc(r.title) + '</h3><p style="flex:1">' + esc(r.text) + "</p>" + (r.url ? ext(r.url, "Open ↗") : '<span class="small">In Canvas</span>') + "</div>";
    }).join("") + '<div class="card stack" style="gap:8px"><div class="bigstat">Soon</div><h3 style="font-size:20px">Retrieval practice apps</h3><p style="flex:1">Short, low-stakes question sets for each topic. An app that covers several outcomes appears on every outcome page it covers.</p><div>' + pill("Planned", "planned") + "</div></div>";
    return header(h.courses) +
      '<main id="main"><section class="hero-white"><div class="wrap"><p class="crumbs"><a href="#/">Academy</a> <span class="small">/</span> ' + esc(c.code) + '</p><h1>' + esc(c.title) + '</h1><p style="font-size:21px;margin:0 0 28px;max-width:780px" class="small">' + esc(lead) + '</p><div class="search"><label for="q">' + esc(c.searchLabel) + '</label><input id="q" type="search" autocomplete="off" placeholder="' + esc(c.searchPlaceholder) + '"><div id="results"></div></div></div></section>' +
      '<section class="sec tight"><div class="grid three">' + ways + "</div></section>" +
      '<section class="sec" id="units">' + sectionHead(c.unitsTitle, c.unitsSub) + '<div class="grid two">' + units + "</div></section>" +
      '<section class="sec" id="tools">' + sectionHead(c.toolsTitle, c.toolsSub) + '<div class="grid tools">' + tools + "</div></section>" +
      '<section class="sec">' + thinking + "</section>" +
      '<section class="sec" id="help">' + sectionHead(c.help.title, c.help.sub) + '<div class="grid tools">' + paths + "</div></section>" +
      '<section class="sec" id="ai">' + sectionHead(c.ai.title, c.ai.sub) + '<div class="grid tools" style="margin-bottom:20px">' + modes + '</div><p class="small" style="margin:0;max-width:820px">' + esc(c.ai.note) + "</p></section>" +
      '<section class="sec" id="review">' + sectionHead(c.review.title, c.review.sub) + '<div class="grid four">' + review + "</div></section></main>" + footer(hc.footer);
  }

  function pageApps(h, d) {
    var c = d.copy;
    var live = d.apps.filter(function (a) { return a.status === "live"; }), planned = d.apps.filter(function (a) { return a.status !== "live"; });
    function chips(a) { return a.outs.map(function (o) { return '<a class="chip on" style="--c:var(--navy);min-width:48px;min-height:36px;text-decoration:none;margin:0 6px 6px 0" href="#/' + d.slug + "/" + o.toLowerCase() + '">' + o + "</a>"; }).join(""); }
    var liveHtml = live.map(function (a) { return '<div class="card stack" style="gap:8px"><h3>' + esc(a.name) + "</h3><p>" + esc(a.description) + '</p><div>' + (a.outs.length ? '<span class="small">Covers: </span>' + chips(a) : '<span class="small">Course-level app</span>') + "</div>" + ext(a.url, "Launch ↗") + "</div>"; }).join("");
    var plannedHtml = planned.map(function (a) { return '<div class="dashed stack" style="gap:8px"><div>' + pill("Planned", "planned") + "</div><h3 style=\"font-size:20px\">" + esc(a.name) + '</h3><p class="small" style="margin:0">' + esc(a.description) + '</p><div><span class="small">Covers: </span>' + chips(a) + "</div></div>"; }).join("");
    return header(h.courses) + '<main id="main"><section class="hero-white"><div class="wrap"><p class="crumbs"><a href="#/">Academy</a> <span class="small">/</span> <a href="#/' + d.slug + '">' + esc(c.code) + '</a> <span class="small">/</span> Apps</p><h1>Interactive apps</h1><p style="font-size:21px;margin:0;max-width:780px" class="small">Every app lists the outcomes it covers. An app appears on each outcome page it covers.</p></div></section>' +
      '<section class="sec tight"><div class="grid tools">' + liveHtml + '</div></section><section class="sec">' + sectionHead("Planned retrieval practice apps", "Short question sets you answer from memory, with feedback after each one. Each covers a group of outcomes.") + '<div class="grid tools">' + plannedHtml + "</div></section></main>" + footer(h.copy.footer);
  }

  function pageOutcome(h, d, o) {
    var c = d.copy, slug = d.slug, n = o.n;
    var mods = o.mods.map(function (m) { return d.modules[m]; }).filter(Boolean);
    var vids = d.videos.filter(function (v) { return v.kind === "lecture" && v.outs.indexOf(o.code) !== -1; });
    var appVids = d.videos.filter(function (v) { return v.kind === "app" && v.outs.indexOf(o.code) !== -1; });
    var apps = d.apps.filter(function (a) { return a.status === "live" && a.outs.indexOf(o.code) !== -1; });
    var planned = d.apps.filter(function (a) { return a.status === "planned" && a.outs.indexOf(o.code) !== -1; });
    var faqs = d.faq.filter(function (f) { return f.outcome === o.code; });
    var prompts = d.prompts.filter(function (p) { return p.outcome === o.code; });
    var probs = d.problems.filter(function (p) { return p.outcome === o.code; });
    var sols = d.solutions.filter(function (s) { return s.outs.indexOf(o.code) !== -1; });
    var hw = []; mods.forEach(function (m) { m.hw.forEach(function (x) { if (hw.indexOf(x) === -1) hw.push(x); }); });
    var UC = { 1: "u1", 2: "u2", 3: "u3", 4: "u4" };
    function olink(code) { return d.outcomes[code] ? '<a href="#/' + slug + "/" + code.toLowerCase() + '">' + code + " " + esc(d.outcomes[code].title) + "</a>" : esc(code); }

    var counts = [vids.length + " micro-lectures", apps.length + (apps.length === 1 ? " app" : " apps"), faqs.length + " FAQ questions", (probs.length ? new Set(probs.map(function (p) { return p.problem; })).size : 0) + " sample problems", "1 skill check"].join(" · ");
    var fits = '<div class="card" style="background:var(--bg)"><h2 style="font-size:20px;margin-bottom:14px">Where this fits</h2>' +
      mods.map(function (m) { return '<p style="margin:0 0 4px"><b style="color:#000">Module ' + m.n + "</b></p><p style=\"margin:0 0 14px\" class=\"small\">" + esc(m.title) + "</p>"; }).join("") +
      (o.builds.length ? '<p style="margin:0 0 4px"><b style="color:#000">Builds on</b></p><p style="margin:0 0 14px" class="small">' + o.builds.map(olink).join(" · ") + "</p>" : "") +
      (o.leads.length ? '<p style="margin:0 0 4px"><b style="color:#000">Leads to</b></p><p style="margin:0" class="small">' + o.leads.map(olink).join(" · ") + "</p>" : "") + "</div>";

    // path steps
    var s1 = '<p class="small" style="margin:0 0 12px">Fill in the guided notes, then check your work against the solutions.</p><div style="display:flex;gap:12px;flex-wrap:wrap">' +
      mods.map(function (m) { return '<a class="btn" href="' + esc(m.notes_url) + '" target="_blank" rel="noopener">Module ' + m.n + ' guided notes ↗</a><a class="btn ghost" href="' + esc(m.solutions_url) + '" target="_blank" rel="noopener">Module ' + m.n + " solutions ↗</a>"; }).join("") + "</div>";
    function vidRow(v) { return '<a class="vid" href="https://www.youtube.com/watch?v=' + esc(v.video_id) + '" target="_blank" rel="noopener"><span class="play"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="#1D3969"/></svg></span><span><b>' + esc(v.title) + "</b></span></a>"; }
    var s2 = vids.length ? '<div class="stack" style="gap:4px">' + vids.map(vidRow).join("") + "</div>" : '<div class="empty">No micro-lectures are tagged to this outcome yet.</div>';
    if (appVids.length) s2 += '<p class="small" style="margin:16px 0 4px"><b style="color:#000">App walkthroughs</b></p><div class="stack" style="gap:4px">' + appVids.map(vidRow).join("") + "</div>";
    var s3 = apps.length ? '<p class="small" style="margin:0 0 12px">Change the inputs and watch what responds.</p><div style="display:flex;gap:12px;flex-wrap:wrap">' + apps.map(function (a) { return '<a class="btn ghost" href="' + esc(a.url) + '" target="_blank" rel="noopener" title="' + esc(a.description) + '">' + esc(a.name) + " ↗</a>"; }).join("") + "</div>" : '<div class="empty">No app is tagged to this outcome yet.</div>';
    var s4 = '<p class="small" style="margin:0">' + (probs.length ? "Try the sample problems below first. Then do " : "Do ") + (hw.length ? esc(hw.join("; ")) : "the homework for this module") + " from the module in Canvas.</p>";
    var note = o.art_of_stat_note;
    var aos = note ? (/not yet/i.test(note) ? '<div class="empty" style="margin-top:14px"><b style="color:#000">Open slot:</b> Art of Stat. ' + esc(note) + "</div>" : '<p class="small" style="margin:14px 0 0"><b style="color:#000">Art of Stat:</b> ' + esc(note) + ' <a href="https://docs.google.com/document/d/1GIj3xBRs4VYCK3FMfa2Y7JeqqXgsqIquA2IOi4FgaZU/edit" target="_blank" rel="noopener">Open the guide ↗</a></p>') : "";
    var s5 = '<p class="small" style="margin:0">Skill ' + n + " knowledge check. Ungraded, and open from Canvas.</p>" + aos;
    var steps = [["Read and fill in the guided notes", s1], ["Watch the micro-lectures", s2], ["Explore it in an app", s3], ["Practice", s4], ["Check yourself", s5]].map(function (s, i) {
      return '<div class="card pathstep"><span class="num">' + (i + 1) + '</span><div style="flex:1;min-width:0"><h3>' + esc(s[0]) + "</h3>" + s[1] + "</div></div>";
    }).join("");

    // try it first
    var tryHtml = "";
    if (probs.length) {
      var byProb = {}; probs.forEach(function (p) { (byProb[p.problem] = byProb[p.problem] || []).push(p); });
      var cards = Object.keys(byProb).map(function (k, pi) {
        var ps = byProb[k], hid = "hint-" + pi;
        var parts = ps.map(function (p, i) {
          var id = "a-" + pi + "-" + i;
          return '<div class="part"><div class="q"><b style="color:#000;flex:none">' + esc(p.part) + ")</b><span>" + esc(p.question) + '</span></div><div style="margin-top:12px"><button class="btn ghost" type="button" data-reveal="#' + id + '" aria-expanded="false" data-on="Hide the answer" data-off="Check my answer">Check my answer</button></div><div class="mid" id="' + id + '" hidden><b style="color:#000">Answer.</b> ' + esc(p.answer) + "</div></div>";
        }).join("");
        return '<div class="card"><div style="margin-bottom:12px">' + unitPill(o.unit, "Sample problem " + (pi + 1)) + '</div><p style="margin:0 0 16px">' + esc(ps[0].intro) + '</p><div><button class="btn ghost" type="button" data-reveal="#' + hid + '" aria-expanded="false" data-on="Hide the hint" data-off="Need a hint?">Need a hint?</button></div><div class="hintbox" id="' + hid + '" hidden><b style="color:#000">Hint.</b> ' + esc(ps[0].hint) + "</div>" + parts + "</div>";
      }).join("");
      var solLinks = sols.map(function (s) { return ext(s.url, s.title + " ↗"); }).join("");
      tryHtml = '<section class="sec">' + sectionHead("Try it first", "Work each problem on paper before you open anything. Then check your answer. Open the full solutions only if you need them.") + '<div class="grid two">' + cards + '</div><div class="card" style="margin-top:24px"><h3>If your answer does not match</h3><ul style="margin:8px 0 12px;padding-left:24px" class="small"><li style="margin-bottom:8px">Read the ' + o.code + " questions in the FAQ section below.</li><li style=\"margin-bottom:8px\">Paste the problem and your work into an AI study partner and ask it to find the first step where you went off track.</li><li>Open the full worked solutions.</li></ul>" + solLinks + "</div></section>";
    } else {
      tryHtml = '<section class="sec"><div class="dashed"><div style="margin-bottom:12px">' + pill("Planned", "planned") + '</div><h3 style="font-size:21px;margin-bottom:8px">Try it first</h3><p class="small" style="margin:0">Sample problems for ' + o.code + " are coming. They will come from the unit challenge problems, with a check for each answer.</p></div></section>";
    }
    var retr = planned.length ? '<section class="sec tight"><div class="dashed"><div style="margin-bottom:12px">' + pill("Planned", "planned") + '</div><h3 style="font-size:21px;margin-bottom:8px">Quick retrieval practice</h3><p class="small" style="margin:0 0 12px">' + esc(planned[0].description) + " [App to be built]</p><p class=\"small\" style=\"margin:0\"><b style=\"color:#000\">Covers:</b> " + planned[0].outs.join(", ") + "</p></div></section>" : "";
    var call = c.callouts && c.callouts[o.code];
    var callHtml = call ? '<section class="sec tight"><div class="callout"><h2>' + esc(call.title) + "</h2><p>" + esc(call.text) + "</p></div></section>" : "";

    // stuck
    var faqHtml = faqs.length ? faqs.map(function (f, i) {
      var id = "f" + i;
      var body = f.answer ? "<p style=\"margin:0 0 14px\" class=\"small\">" + esc(f.answer) + "</p><a href=\"" + esc(f.url) + '" target="_blank" rel="noopener" style="font-weight:700">Read more in the Unit ' + f.unit + " FAQ ↗</a>" : '<a href="' + esc(f.url) + '" target="_blank" rel="noopener" style="font-weight:700">Read the answer in the Unit ' + f.unit + " FAQ ↗</a>";
      return '<div class="faq"><button class="q" type="button" data-toggle="#' + id + '" aria-expanded="false"><span>' + esc(f.question) + '</span><span class="plus" aria-hidden="true">+</span></button><div class="a" id="' + id + '" hidden>' + body + "</div></div>";
    }).join("") : '<div class="empty">No FAQ questions are tagged to this outcome yet.</div>';
    var promptHtml = prompts.length ? prompts.map(function (p, i) {
      return '<div style="border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:14px"><div style="margin-bottom:8px">' + unitPill(o.unit, p.kind + " · " + o.code) + '</div><div style="font-family:Mulish,sans-serif;font-weight:700;color:#000;margin-bottom:' + (p.note ? "6px" : "10px") + '">' + esc(p.title) + "</div>" + (p.note ? '<p class="small" style="margin:0 0 10px">' + esc(p.note) + "</p>" : "") + '<div class="mid" id="p' + i + '" style="margin:0 0 12px">' + esc(p.text) + '</div><button class="btn ghost" type="button" data-copy="#p' + i + '">Copy prompt</button></div>';
    }).join("") : '<div class="empty" style="margin-bottom:14px">No prompts are written for this outcome yet. The study partner modes on the course page work for any outcome.</div><a class="btn ghost" href="#/' + slug + '" data-scroll="ai">Open the study partner modes</a>';
    var idx = d.list.indexOf(o), prev = d.list[idx - 1], next = d.list[idx + 1];
    var pn = '<section class="sec tight"><div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">' + (prev ? '<a class="btn ghost" href="#/' + slug + "/" + prev.code.toLowerCase() + '">← ' + prev.code + " " + esc(prev.title) + "</a>" : "<span></span>") + (next ? '<a class="btn ghost" href="#/' + slug + "/" + next.code.toLowerCase() + '">' + next.code + " " + esc(next.title) + " →</a>" : "") + "</div></section>";

    return header(h.courses) + '<main id="main"><section class="hero-white"><div class="wrap"><p class="crumbs"><a href="#/">Academy</a> <span class="small">/</span> <a href="#/' + slug + '">' + esc(c.code) + '</a> <span class="small">/</span> Unit ' + o.unit + ' <span class="small">/</span> ' + o.code + '</p><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:48px;align-items:start"><div><div style="margin-bottom:14px">' + unitPill(o.unit, "Unit " + o.unit + " · " + o.code) + "</div><h1>" + esc(o.title) + '</h1><p style="font-size:21px;margin:0 0 20px;color:var(--ink)">' + esc(o.statement) + '</p><ul class="small" style="margin:0 0 24px;padding-left:24px">' + o.subs.map(function (s) { return '<li style="margin-bottom:8px">' + esc(s) + "</li>"; }).join("") + '</ul><p class="small" style="margin:0">' + counts + "</p></div>" + fits + "</div></div></section>" +
      '<section class="sec">' + sectionHead("Your path through " + o.code, "Work top to bottom, or jump to the step you need.") + '<div class="stack" style="gap:16px">' + steps + "</div></section>" + tryHtml + retr + callHtml +
      '<section class="sec">' + sectionHead("When you are stuck on " + o.code, "Read the answer first. If another format works better for you, it is one click away.") + '<div class="grid two"><div><h3 style="font-size:21px;margin-bottom:14px">From the Unit ' + o.unit + ' FAQ</h3><div class="stack">' + faqHtml + '</div></div><div><h3 style="font-size:21px;margin-bottom:14px">Ask an AI study partner</h3><div class="card"><ol class="small" style="margin:0 0 20px;padding-left:24px"><li style="margin-bottom:6px"><b style="color:#000">Try the problem first.</b></li><li style="margin-bottom:6px">Paste a prompt below into Gemini, Claude, or ChatGPT so it coaches you.</li><li>On any assignment, add one line saying how you used AI. Quizzes and exams are AI-free.</li></ol>' + promptHtml + '<p class="small" style="margin:0">' + esc(c.stuckHelp) + "</p></div></div></div></section>" + pn + "</main>" + footer(h.copy.footer);
  }

  // ---------- routing
  var searchIdx = null;
  function allIndex(h) {
    if (searchIdx) return Promise.resolve(searchIdx);
    var live = h.courses.filter(function (c) { return c.status === "live"; });
    return Promise.all(live.map(function (c) { return loadCourse(c.slug); })).then(function (ds) {
      searchIdx = [].concat.apply([], ds.map(buildIndex)); return searchIdx;
    });
  }
  function route() {
    var parts = (location.hash || "#/").replace(/^#\/?/, "").split("/").filter(Boolean);
    app.innerHTML = '<div class="loading" role="status">Loading…</div>';
    loadHome().then(function (h) {
      if (!parts.length) { app.innerHTML = pageHome(h); document.title = "SAC Math Academy"; wireSearch(function () { return allIndex(h); }); return; }
      var co = h.courses.filter(function (c) { return c.slug === parts[0]; })[0];
      if (!co) { app.innerHTML = header(h.courses) + '<main id="main" class="sec"><h1>Page not found</h1><p><a href="#/">Back to the Academy</a></p></main>'; return; }
      return loadCourse(co.slug).then(function (d) {
        if (!parts[1]) { app.innerHTML = pageCourse(h, d); document.title = d.copy.code + " · SAC Math Academy"; wireSearch(function () { return allIndex(h); }); return; }
        if (parts[1] === "apps") { app.innerHTML = pageApps(h, d); document.title = "Apps · " + d.copy.code; return; }
        var o = d.outcomes[parts[1].toUpperCase()];
        if (!o) { app.innerHTML = header(h.courses) + '<main id="main" class="sec"><h1>Outcome not found</h1><p><a href="#/' + d.slug + '">Back to ' + esc(d.copy.code) + "</a></p></main>"; return; }
        app.innerHTML = pageOutcome(h, d, o); document.title = o.code + " " + o.title + " · " + d.copy.code;
      });
    }).then(function () {
      var h1 = app.querySelector("h1"); if (h1) { h1.setAttribute("tabindex", "-1"); }
      if (!window.__keepScroll) window.scrollTo(0, 0);
      window.__keepScroll = false;
    }).catch(function (e) {
      app.innerHTML = '<main id="main" class="sec"><h1>This page could not load</h1><p>' + esc(e.message) + '</p><p class="small">If you opened index.html straight from a folder, the data files cannot load. Open the site from Netlify or a local web server.</p></main>';
    });
  }

  // ---------- events
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toggle],[data-reveal],[data-copy],[data-scroll]");
    if (!t) return;
    if (t.hasAttribute("data-toggle")) {
      var box = app.querySelector(t.getAttribute("data-toggle")), open = box.hidden;
      box.hidden = !open; t.setAttribute("aria-expanded", open ? "true" : "false");
      var pl = t.querySelector(".plus"); if (pl) pl.textContent = open ? "−" : "+";
    } else if (t.hasAttribute("data-reveal")) {
      var b = app.querySelector(t.getAttribute("data-reveal")), o2 = b.hidden;
      b.hidden = !o2; t.setAttribute("aria-expanded", o2 ? "true" : "false");
      t.textContent = o2 ? t.getAttribute("data-on") : t.getAttribute("data-off");
    } else if (t.hasAttribute("data-copy")) {
      var txt = app.querySelector(t.getAttribute("data-copy")).textContent;
      var done = function () { var old = t.textContent; t.textContent = "Copied"; setTimeout(function () { t.textContent = old; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, done); } else { done(); }
    } else if (t.hasAttribute("data-scroll")) {
      e.preventDefault();
      var id = t.getAttribute("data-scroll"), go = function () { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
      var href = t.getAttribute("href") || "";
      if (href && href !== location.hash) { window.__keepScroll = true; location.hash = href; setTimeout(go, 400); } else { go(); }
    }
  });
  window.addEventListener("hashchange", route);
  route();
})();

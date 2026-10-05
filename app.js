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
  // If a data file is older than this code, these built-in copies keep the pages from breaking.
  var APP_VERSION = "2026-10-05.1";
  var COPY_DEFAULTS = {"ai": {"title": "AI study partner", "sub": "AI can support your learning when you use it thoughtfully. Try the problem yourself first, then use AI to get unstuck, check your thinking, and practice.", "stepsTitle": "How to use a prompt", "steps": ["Try the problem first. Write down what you tried and where you got stuck.", "Pick a prompt that matches your problem. A Concept prompt is for when you do not understand the idea. A Skill prompt is for when you cannot get started or finish a problem.", "Copy the prompt and paste it into Gemini, Claude, or ChatGPT. Replace every highlighted [bracket] with your problem, your work, or your numbers.", "Answer the questions it asks you. A good study partner asks questions and gives hints. If it just gives you the answer, type: \"Do not solve it for me. Ask me one question at a time.\"", "Check what you learned. Compare the explanation with your guided notes or micro-lecture, then use a follow-up prompt to test yourself.", "On an assignment, add one line saying how you used AI. Quizzes and exams are AI-free."], "followTitle": "Keep the conversation going", "followSub": "Do not stop after the AI's first response. Use these follow-ups to push your learning deeper.", "afterTitle": "After your session, ask yourself", "afterQuestions": ["What did I learn from this practice session? Did AI help me understand, or just give me an answer?", "How does this explanation compare to what we learned in class or in the textbook?", "What did I learn by questioning the AI's reasoning? How can I apply that thinking on an exam?"], "waysTitle": "Four ways to use AI to learn statistics", "waysSub": "These work for any topic. Copy a prompt, fill in the brackets, and paste it into Gemini, Claude, or ChatGPT.", "ways": [{"title": "AI as a brainstormer", "goal": "Generate ideas, simplify a concept, or plan how to study.", "prompts": ["I don't understand [concept]. Can you explain it simply?", "What are 3 ways to think about [topic]?", "How can I break down [topic] for my study guide?", "I'm studying [topic]. Motivate me."], "reflect": "What ideas did AI suggest that you had not thought of? Which ones will you try, and why?"}, {"title": "AI as a searcher", "goal": "Find explanations, definitions, or examples. Always verify what it tells you.", "prompts": ["Summarize the idea of [topic] using examples and analogies.", "What's the difference between a boxplot and a histogram?", "Explain [topic] to me at three levels, from elementary school to college.", "Can you give me 2 one-sample hypothesis test problems and walk me through them?"], "reflect": "How does this explanation compare to what we learned in class or in the textbook?"}, {"title": "AI as a tutor", "goal": "Practice solving problems and get guidance. Always try first before asking for help.", "prompts": ["Here's my solution to [problem]. Can you check my steps?", "Give me a [type of] problem and help me if I get stuck.", "I have an upcoming exam covering [topics]. Create a practice quiz for me and ask me each question one by one.", "Turn [topic] into flashcard-style questions and answers."], "reflect": "What did I learn from this practice session? Did AI help me understand, or just give me an answer?"}, {"title": "AI as a critical thinking partner", "goal": "Question the AI's answers, ask \"why\" at every step, and compare approaches.", "prompts": ["Why did you use a t-test instead of a z-test?", "Is there another way to solve this problem?", "Explain this visually instead of in words.", "Compare my solution to yours and explain any differences."], "reflect": "What did I learn by questioning the AI's reasoning? How can I apply that thinking during exams?"}], "reminders": ["Try first, then check with AI. You learn more by attempting problems yourself.", "Cross-reference AI responses with your notes, the textbook, or your instructor's materials.", "Use AI ethically. Do not submit AI-written work as your own. Use it to learn, not to shortcut.", "Quizzes and exams are AI-free."], "canvasNote": "In your Canvas course you also have a free AI chatbot called Nectir, which uses Claude.", "fallbackTitle": "No prompts are written for this outcome yet", "fallbackText": "Use the four ways to use AI on the course page, or try one of these starter prompts.", "fallbackPrompts": ["I am learning about [topic] in my introductory statistics class. I already tried the problem on my own. Explain the idea in plain language with one everyday analogy, then ask me one question to check that I understood.", "Act as a Socratic statistics tutor. Here is my problem: [paste problem]. Do not give me the answer or do the calculations. Ask me one question at a time, and give a small hint only when I am stuck.", "Here is a problem and my work: [paste problem and your steps]. Do not solve it for me. Find the first step where my reasoning goes wrong, explain why, and let me fix it myself."]}, "people": {"title": "Still stuck? Talk to a person", "items": [{"label": "Ask your class in Pronto", "text": "Post a picture of the problem. Explain what you do not understand or where you get stuck, and show what you already tried. Saying only \"I am stuck\" is not enough for us to help, so be as specific as you can. Pronto is for figuring out the thing you are missing, not for reteaching a whole concept."}, {"label": "Math Center", "text": "A free drop-in place to get help on individual problems you are stuck on, online by Zoom or in person.", "url": "https://www.sac.edu/studentservices/mathcenter/"}, {"label": "Learning Center", "text": "A good place to get help with the concepts of the class. You need to make an appointment.", "url": "https://www.sac.edu/studentservices/learningcenter/"}, {"label": "NetTutor", "text": "Free online tutoring if your class is online. Find the link in the left menu of your Canvas course."}]}, "midterm": {"title": "Midterm review", "covers": "S1 through S12", "lead": "It is important to accurately assess what you do or do not know so far. This is especially important before an exam. Rate your level of understanding for each skill below, then use your study list to decide what to review.", "legend": [{"key": "P", "label": "Proficient", "text": "I need a quick review."}, {"key": "B", "label": "Basic", "text": "I need to review and do problems."}, {"key": "N", "label": "Needs help", "text": "I need someone to explain it, or I need to re-watch the lecture videos."}], "privacy": "Your ratings are saved only in this browser, on this device. Nothing is sent anywhere.", "planTitle": "Your study list", "planEmpty": "Rate a skill and your study list will appear here.", "reviewNote": "If you cannot complete a problem or do not understand how to answer it, find the topic and review it in the guided notes, micro-lectures, online homework, textbook, or challenge problems. Each outcome page puts them in one place.", "practiceTitle": "Practice problems", "practiceText": "Use these practice problems as a learn check (a practice test) for yourself. The problems on the exam will be related in content and skills, but do not expect them to be identical. Try each one on paper first, then check your answer. If you cannot complete a problem or do not understand how to answer it, use the Review links to find where to study it.", "practiceUrl": "", "practiceLabel": "Open the review practice problems"}};
  function withDefaults(c) {
    c = c || {};
    if (!c.ai || !c.ai.ways || !c.ai.steps) c.ai = COPY_DEFAULTS.ai;
    if (!c.people || !c.people.items) c.people = COPY_DEFAULTS.people;
    if (!c.midterm || !c.midterm.legend) c.midterm = COPY_DEFAULTS.midterm;
    return c;
  }
  function paint(html, d) {
    app.innerHTML = html;
    if (d && d.copy && d.copy.siteVersion !== APP_VERSION) app.insertAdjacentHTML("afterbegin", '<div class="warnbar" role="alert">Some site files are out of date, so this page may look incomplete. Re-upload every file from the latest zip, keeping the same folder names. (Code version ' + esc(APP_VERSION) + "; course.json version " + esc((d.copy && d.copy.siteVersion) || "missing") + ".)</div>");
  }
  function loadHome() {
    return once("home", function () {
      return Promise.all([table("courses"), json("home")]).then(function (r) { return { courses: r[0], copy: r[1] }; });
    });
  }
  function loadCourse(slug) {
    return once("course:" + slug, function () {
      var names = ["outcomes", "modules", "videos", "apps", "faq", "prompts", "problems", "solutions", "tools", "checks", "midterm", "midtermproblems", "followups"];
      return Promise.all(names.map(function (n) { var p = table(slug + "/" + n); return (n === "checks" || n === "midterm" || n === "midtermproblems" || n === "followups") ? p.catch(function () { return []; }) : p; }).concat([json(slug + "/course")])).then(function (r) {
        var d = { slug: slug, copy: r[13] };
        d.checks = r[9]; d.midterm = r[10]; d.mproblems = r[11]; d.follow = r[12]; d.copy = withDefaults(d.copy);
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
    if (d.copy.midterm) idx.push({ t: "Tool", n: d.copy.midterm.title + " (" + d.copy.midterm.covers + ")", k: "midterm exam study checklist skills rate proficient basic needs help study list", h: "#/" + slug + "/midterm", s: "Rate your skills and get a study list" });
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
  function extLink(url, label, cls) { return '<a class="btn ' + (cls || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + " ↗</a>"; }
  function supportHtml(c) {
    var s = c.support;
    if (!s) { // older home.json
      var b = c.band || { badge: "", title: "", text: "", placeholder: [] };
      return '<section class="sec"><div class="band"><div><div style="margin-bottom:12px">' + pill(b.badge, "gold") + "</div><h2>" + esc(b.title) + "</h2><p style=\"margin:12px 0 0\">" + esc(b.text) + '</p></div><div class="box">' + (b.placeholder || []).map(esc).join("<br>") + "</div></div></section>";
    }
    var m = s.mathCenter;
    var hours = m.hours.map(function (r) { return '<li style="display:flex;justify-content:space-between;gap:16px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.35)"><b>' + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></li>"; }).join("");
    var btns = m.links.map(function (l, i) { return extLink(l.url, l.label, i === 0 ? "white" : "outline"); }).join("");
    var band = '<section class="sec" id="support"><div class="band"><div><h2>' + esc(s.title) + '</h2><p style="margin:12px 0 20px">' + esc(s.lead) + '</p><div style="display:flex;gap:12px;flex-wrap:wrap">' + btns + '</div></div><div class="box" style="border-style:solid"><h3 style="color:#fff;font-size:22px;margin:0 0 10px">' + esc(m.name) + '</h3><p style="margin:0 0 4px">' + esc(m.where) + '</p><p style="margin:0 0 12px">' + esc(m.online) + '</p><ul style="list-style:none;margin:0 0 12px;padding:0" aria-label="' + esc(m.hoursTitle) + '">' + hours + '</ul><p style="margin:0 0 8px">Phone: <a href="tel:' + esc(m.phone.replace(/[^0-9]/g, "")) + '" style="color:#fff;font-weight:700">' + esc(m.phone) + '</a></p><p style="margin:0;font-size:17px">' + esc(m.note) + "</p></div></div></section>";
    var cards = s.more.map(function (x) { return '<div class="card stack" style="gap:8px"><h3 style="font-size:20px">' + esc(x.name) + '</h3><p style="flex:1">' + esc(x.text) + '</p><a class="linkrow" href="' + esc(x.url) + '" target="_blank" rel="noopener">Visit ↗</a></div>'; }).join("");
    if (s.hope && s.hope.url) cards += '<div class="card stack" style="gap:8px"><h3 style="font-size:20px">' + esc(s.hope.name) + '</h3><p style="flex:1">' + esc(s.hope.text) + '</p><a class="linkrow" href="' + esc(s.hope.url) + '" target="_blank" rel="noopener">Visit ↗</a></div>';
    return band + '<section class="sec">' + sectionHead(s.moreTitle) + '<div class="grid tools" style="margin-top:20px">' + cards + "</div></section>";
  }
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
      supportHtml(c) + "</main>" + footer(c.footer);
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
    var ways = c.ways.map(function (w) { return '<div class="card stack"><h2 style="font-size:23px">' + esc(w.title) + '</h2><p style="flex:1">' + esc(w.text) + '</p><div>' + (w.href ? '<a class="btn" href="' + esc(w.href) + '">' + esc(w.label) + "</a>" : '<a class="btn" href="#/' + d.slug + '" data-scroll="' + w.scroll + '">' + esc(w.label) + "</a>") + "</div></div>"; }).join("");
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
    copyN = 0;
    var aiWays = c.ai.ways.map(function (w) {
      return '<div class="card stack"><h3>' + esc(w.title) + '</h3><p class="small" style="margin:0">' + esc(w.goal) + '</p>' + w.prompts.map(function (t) { return promptBox(t, w.title); }).join('<div style="height:8px"></div>') + '<p class="small" style="margin:0"><b style="color:#000">Reflect:</b> ' + esc(w.reflect) + "</p></div>";
    }).join("");
    var aiBlock = '<div class="card" style="margin-bottom:24px"><h3 style="font-size:22px;margin-bottom:12px">' + esc(c.ai.stepsTitle) + "</h3>" + stepsHtml(c.ai.steps) + '<p class="small" style="margin:0">' + esc(c.ai.canvasNote || "") + '</p></div><h3 style="font-size:24px;margin:0 0 6px">' + esc(c.ai.waysTitle) + '</h3><p class="sub" style="margin:0 0 20px">' + esc(c.ai.waysSub) + '</p><div class="grid tools" style="margin-bottom:24px">' + aiWays + '</div><div class="card"><h3 style="font-size:21px;margin-bottom:10px">Important reminders</h3><ul style="margin:0;padding-left:24px">' + c.ai.reminders.map(function (t) { return '<li style="margin-bottom:6px">' + esc(t) + "</li>"; }).join("") + "</ul></div>";
    var planned = d.apps.filter(function (a) { return a.status === "planned"; }).length;
    var review = c.review.cards.map(function (r) {
      return '<div class="card stack" style="gap:8px"><div class="bigstat">' + esc(r.big) + '</div><h3 style="font-size:20px">' + esc(r.title) + '</h3><p style="flex:1">' + esc(r.text) + "</p>" + (r.url ? (r.internal ? '<a class="linkrow" href="' + esc(r.url) + '">Open →</a>' : ext(r.url, "Open ↗")) : '<span class="small">In Canvas</span>') + "</div>";
    }).join("") + '<div class="card stack" style="gap:8px"><div class="bigstat">Soon</div><h3 style="font-size:20px">Retrieval practice apps</h3><p style="flex:1">Short, low-stakes question sets for each topic. An app that covers several outcomes appears on every outcome page it covers.</p><div>' + pill("Planned", "planned") + "</div></div>";
    return header(h.courses) +
      '<main id="main"><section class="hero-white"><div class="wrap"><p class="crumbs"><a href="#/">Academy</a> <span class="small">/</span> ' + esc(c.code) + '</p><h1>' + esc(c.title) + '</h1><p style="font-size:21px;margin:0 0 28px;max-width:780px" class="small">' + esc(lead) + '</p><div class="search"><label for="q">' + esc(c.searchLabel) + '</label><input id="q" type="search" autocomplete="off" placeholder="' + esc(c.searchPlaceholder) + '"><div id="results"></div></div></div></section>' +
      '<section class="sec tight"><div class="grid three">' + ways + "</div></section>" +
      '<section class="sec" id="units">' + sectionHead(c.unitsTitle, c.unitsSub) + '<div class="grid two">' + units + "</div></section>" +
      '<section class="sec" id="tools">' + sectionHead(c.toolsTitle, c.toolsSub) + '<div class="grid tools">' + tools + "</div></section>" +
      '<section class="sec">' + thinking + "</section>" +
      '<section class="sec" id="help">' + sectionHead(c.help.title, c.help.sub) + '<div class="grid tools">' + paths + "</div></section>" +
      '<section class="sec" id="ai">' + sectionHead(c.ai.title, c.ai.sub) + aiBlock + "</section>" +
      '<section class="sec" id="review">' + sectionHead(c.review.title, c.review.sub) + '<div class="grid four">' + review + "</div></section></main>" + footer(hc.footer);
  }

  // ---------- midterm review: rate your skills, get a study list
  var MKEY = function (d) { return "sacmath-midterm-" + d.slug; };
  function loadRatings(d) { try { return JSON.parse(localStorage.getItem(MKEY(d)) || "{}"); } catch (e) { return {}; } }
  function saveRatings(d, r) { try { localStorage.setItem(MKEY(d), JSON.stringify(r)); } catch (e) {} }
  function pageMidterm(h, d) {
    var c = d.copy, m = c.midterm, ratings = loadRatings(d);
    var legend = m.legend.map(function (l) { return '<li style="margin-bottom:6px"><b style="color:#000">' + esc(l.key) + " · " + esc(l.label) + ":</b> " + esc(l.text) + "</li>"; }).join("");
    var rows = d.midterm.map(function (it) {
      var outs = codes(it.outcomes);
      var chips = outs.map(function (o) { return '<a class="chip on" style="--c:var(--navy);min-width:48px;min-height:36px;text-decoration:none;margin:0 6px 6px 0" href="#/' + d.slug + "/" + o.toLowerCase() + '" title="' + esc(d.outcomes[o] ? d.outcomes[o].title : o) + '">' + o + "</a>"; }).join("");
      var radios = m.legend.map(function (l) {
        return '<label class="pbn"><input type="radio" name="m' + esc(it.order) + '" value="' + esc(l.key) + '" data-pbn="' + esc(it.order) + '"' + (ratings[it.order] === l.key ? " checked" : "") + '><span><b>' + esc(l.key) + "</b> " + esc(l.label) + "</span></label>";
      }).join("");
      return '<fieldset class="qz"><legend>' + esc(it.order) + ". " + esc(it.skill) + '</legend><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' + radios + '</div><div style="margin-top:8px"><span class="small">Review: </span>' + chips + "</div></fieldset>";
    }).join("");
    return header(h.courses) + '<main id="main"><section class="hero-white"><div class="wrap"><p class="crumbs"><a href="#/">Academy</a> <span class="small">/</span> <a href="#/' + d.slug + '">' + esc(c.code) + '</a> <span class="small">/</span> Midterm review</p><h1>' + esc(m.title) + ": " + esc(m.covers) + '</h1><p style="font-size:21px;margin:0 0 20px;max-width:780px">' + esc(m.lead) + '</p><ul class="small" style="margin:0 0 12px;padding-left:24px;max-width:780px">' + legend + '</ul><p class="small" style="margin:0">' + esc(m.privacy) + "</p></div></section>" +
      '<section class="sec tight"><div class="grid two"><div><h2 style="font-size:28px;margin-bottom:14px">Rate your skills</h2><div class="card" style="padding:12px 28px">' + rows + '</div></div><div><div id="plan" class="card" style="position:sticky;top:12px" aria-live="polite"></div></div></div></section>' +
      '<section class="sec" id="practice"><h2>' + esc(m.practiceTitle) + '</h2><p class="sub">' + esc(m.practiceText) + "</p>" + (d.mproblems.length ? midtermCards(d) : (m.practiceUrl ? ext(m.practiceUrl, m.practiceLabel + " ↗", "btn") : '<div class="empty">The review practice problems are coming here soon.</div>')) + '<p class="small" style="margin:20px 0 0;max-width:820px">' + esc(m.reviewNote) + "</p></section></main>" + footer(h.copy.footer);
  }
  function midtermCards(d) {
    var byP = {}, order = [];
    d.mproblems.forEach(function (r) { if (!byP[r.problem]) { byP[r.problem] = []; order.push(r.problem); } byP[r.problem].push(r); });
    order.sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); });
    var outsSeen = {};
    var cards = order.map(function (pid) {
      var ps = byP[pid], outs = codes(ps[0].outcomes); outs.forEach(function (o) { outsSeen[o] = 1; });
      var chips = outs.map(function (o) { return '<a class="chip on" style="--c:var(--navy);min-width:48px;min-height:36px;text-decoration:none;margin:0 6px 6px 0" href="#/' + d.slug + "/" + o.toLowerCase() + '" title="' + esc(d.outcomes[o] ? d.outcomes[o].title : o) + '">' + o + "</a>"; }).join("");
      var parts = ps.map(function (p, i) {
        var id = "mp-" + pid + "-" + i;
        return '<div class="part"><div class="q">' + (p.part ? '<b style="color:#000;flex:none">' + esc(p.part) + ")</b>" : "") + "<span>" + esc(p.question) + '</span></div><div style="margin-top:12px"><button class="btn ghost" type="button" data-reveal="#' + id + '" aria-expanded="false" data-on="Hide the answer" data-off="Check my answer">Check my answer</button></div><div class="mid" id="' + id + '" hidden><b style="color:#000">Answer.</b> ' + esc(p.answer) + "</div></div>";
      }).join("");
      return '<div class="card mpcard" data-outs="' + outs.join(" ") + '"><div style="margin-bottom:10px"><span class="pill progress">Problem ' + esc(pid) + '</span></div><div style="margin:0 0 12px">' + rich(ps[0].intro, true) + "</div>" + (ps[0].image ? imgs(ps[0].image, ps[0].image_alt) : "") + '<p class="small" style="margin:0 0 4px">Review: ' + chips + "</p>" + parts + "</div>";
    }).join("");
    var keys = Object.keys(outsSeen).sort(function (a, b) { return num(a) - num(b); });
    var filter = '<div role="group" aria-label="Show problems for an outcome" style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 20px"><button type="button" class="btn" data-mfilter="all" aria-pressed="true">All ' + order.length + "</button>" + keys.map(function (k) { return '<button type="button" class="btn ghost" data-mfilter="' + k + '" aria-pressed="false">' + k + "</button>"; }).join("") + "</div>";
    return filter + '<p id="mpcount" class="small" role="status" style="margin:0 0 12px">Showing all ' + order.length + ' problems.</p><div class="grid two" id="mpgrid">' + cards + "</div>";
  }
  function renderPlan(d) {
    var box = document.getElementById("plan"); if (!box) return;
    var m = d.copy.midterm, ratings = loadRatings(d), tot = d.midterm.length, done = 0, byOut = {};
    d.midterm.forEach(function (it) {
      var r = ratings[it.order]; if (!r) return; done++;
      if (r === "P") return;
      codes(it.outcomes).forEach(function (o) { var e = byOut[o] = byOut[o] || { N: 0, B: 0 }; e[r]++; });
    });
    var list = Object.keys(byOut).sort(function (a, b) { return (byOut[b].N * 2 + byOut[b].B) - (byOut[a].N * 2 + byOut[a].B) || num(a) - num(b); });
    var p = Object.keys(ratings).filter(function (k) { return ratings[k] === "P"; }).length;
    var html = '<h2 style="font-size:24px;margin-bottom:6px">' + esc(m.planTitle) + '</h2><p class="small" style="margin:0 0 12px">' + done + " of " + tot + " skills rated. " + p + " marked Proficient.</p>";
    if (!list.length) { html += '<p style="margin:0">' + (done ? "Nothing marked Basic or Needs help. Do a quick review with the self-check on each outcome page." : esc(m.planEmpty)) + "</p>"; }
    else {
      html += '<ol style="margin:0;padding-left:24px">' + list.map(function (o) {
        var e = byOut[o], parts = [];
        if (e.N) parts.push(e.N + (e.N === 1 ? " skill needs help" : " skills need help"));
        if (e.B) parts.push(e.B + (e.B === 1 ? " skill is basic" : " skills are basic"));
        return '<li style="margin-bottom:10px"><a href="#/' + d.slug + "/" + o.toLowerCase() + '" style="font-weight:700">' + o + " " + esc(d.outcomes[o] ? d.outcomes[o].title : "") + '</a><br><span class="small">' + parts.join(", ") + "</span></li>";
      }).join("") + '</ol><p class="small" style="margin:12px 0 0">Start at the top. Watch the micro-lectures, then try the sample problems and the self-check on each page.</p>';
    }
    if (done) html += '<div style="margin-top:12px"><button class="btn ghost" type="button" data-clear="1">Clear my ratings</button></div>';
    box.innerHTML = html;
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

  // ---------- self-check quiz (step 5 of an outcome page)
  function letter(i) { return String.fromCharCode(65 + i); }
  function split(s) { return s ? s.split(" | ") : []; }
  function rich(s, plain) {
    if (!s) return "";
    var out = "", rows = [];
    function flush() {
      if (!rows.length) return;
      out += '<div class="tblwrap"><table class="tbl">' + rows.map(function (r, i) {
        var cells = r.replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
        return "<tr>" + cells.map(function (c) { return i === 0 ? '<th scope="col">' + esc(c) + "</th>" : "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</table></div>";
      rows = [];
    }
    s.split("\n").forEach(function (line) {
      if (/^\s*\|/.test(line)) { rows.push(line.trim()); } else { flush(); if (line.trim()) out += '<p' + (plain ? "" : ' class="small"') + ' style="margin:0 0 10px">' + esc(line) + "</p>"; }
    });
    flush();
    return out;
  }
  function imgs(srcs, alts) {
    return split(srcs).map(function (u, i) { return '<img class="qimg" src="' + esc(u) + '" alt="' + esc(split(alts)[i] || "") + '">'; }).join("");
  }
  function numOk(got, key, tol) {
    var g = parseFloat(String(got).replace(/\u2212/g, "-").replace(/[$,%\s]/g, ""));
    if (isNaN(g)) return false;
    if (key.indexOf("..") !== -1) { var r = key.split(".."); return g >= parseFloat(r[0]) - 1e-9 && g <= parseFloat(r[1]) + 1e-9; }
    return Math.abs(g - parseFloat(key)) <= (tol || 0) + 1e-9;
  }
  function checkHtml(rows) {
    var out = "", note = null, nums = {};
    rows.forEach(function (r, qi) {
      if (r.type === "note") { note = r; return; }
      nums[r.qid.replace(/[a-z]+$/i, "")] = 1;
      var items = split(r.items), opts = split(r.options), oimgs = split(r.option_images), ans = r.answer;
      var stem = rich(r.stem) + (r.image ? imgs(r.image, r.image_alt) : "");
      var link = r.link_url ? '<p style="margin:0 0 10px"><a href="' + esc(r.link_url) + '" target="_blank" rel="noopener">' + esc(r.link_text || r.link_url) + " ↗</a></p>" : "";
      var body = "", show = "", id = "q" + qi;
      if (r.type === "mc" || r.type === "multi") {
        var kind = r.type === "mc" ? "radio" : "checkbox";
        body = opts.map(function (t, i) {
          var inner = oimgs[i] ? "<span><b>" + letter(i) + ".</b> " + imgs(oimgs[i], t) + "</span>" : "<span>" + esc(t) + "</span>";
          return '<label class="opt"><input type="' + kind + '" name="' + id + '" value="' + letter(i) + '">' + inner + "</label>";
        }).join("");
        show = ans.split(" ").map(function (a) { var k = a.toUpperCase().charCodeAt(0) - 65; return oimgs[k] ? "option " + letter(k) : esc(opts[k] || a); }).join("; ");
      } else if (r.type === "match") {
        var keys = ans.split(" ");
        body = items.map(function (it, i) {
          return '<div class="mrow"><label for="' + id + "-" + i + '">' + esc(it) + '</label><select id="' + id + "-" + i + '"><option value="">Choose…</option>' + opts.map(function (t, k) { return '<option value="' + letter(k).toLowerCase() + '">' + esc(t) + "</option>"; }).join("") + "</select></div>";
        }).join("");
        show = items.map(function (it, i) { return esc(it) + " → " + esc(opts[keys[i].toLowerCase().charCodeAt(0) - 97]); }).join("; ");
      } else if (r.type === "num") {
        var nk = ans.split(" | ");
        body = items.map(function (it, i) { return '<div class="mrow"><label for="' + id + "-" + i + '">' + esc(it) + '</label><input type="text" inputmode="decimal" autocomplete="off" id="' + id + "-" + i + '" data-num></div>'; }).join("");
        show = items.map(function (it, i) { return esc(it) + ": " + esc(nk[i].indexOf("..") !== -1 ? "between " + nk[i].replace("..", " and ") : nk[i]); }).join("; ");
      } else {
        var sa = split(ans);
        if (items.length) {
          body = items.map(function (it, i) { return '<div class="mrow"><label for="' + id + "-" + i + '">' + esc(it) + '</label><input type="text" id="' + id + "-" + i + '"></div>'; }).join("");
          body += '<div style="margin-top:12px"><button class="btn ghost" type="button" data-reveal="#' + id + 's" aria-expanded="false" data-on="Hide the sample answers" data-off="Show sample answers">Show sample answers</button></div><div class="mid" id="' + id + 's" hidden><b style="color:#000">Sample answers.</b><ul style="margin:8px 0 0;padding-left:24px">' + items.map(function (it, i) { return "<li>" + esc(it) + ": " + esc(sa[i] || "") + "</li>"; }).join("") + "</ul></div>";
        } else {
          body = '<textarea id="' + id + '-t" rows="3" aria-label="Your answer"></textarea><div style="margin-top:12px"><button class="btn ghost" type="button" data-reveal="#' + id + 's" aria-expanded="false" data-on="Hide the sample answer" data-off="Show a sample answer">Show a sample answer</button></div><div class="mid" id="' + id + 's" hidden><b style="color:#000">Sample answer.</b> ' + esc(ans) + "</div>";
        }
      }
      out += '<fieldset class="qz" data-type="' + esc(r.type) + '" data-ans="' + esc(ans) + '" data-tol="' + esc(r.tol) + '" data-show="' + show + '" data-expl="' + esc(r.explanation) + '"><legend>Question ' + esc(r.qid) + "</legend>" + stem + link + (r.prompt ? '<p style="margin:0 0 8px">' + esc(r.prompt) + "</p>" : "") + body + (r.type === "free" ? "" : '<div class="fb" hidden></div>') + "</fieldset>";
    });
    var count = Object.keys(nums).length;
    var src = note ? '<p class="small" style="margin:16px 0 0">' + esc(note.prompt) + (note.link_url ? ' <a href="' + esc(note.link_url) + '" target="_blank" rel="noopener">' + esc(note.link_text) + " ↗</a>" : "") + "</p>" : "";
    return '<button class="btn" type="button" data-reveal="#chk" aria-expanded="false" data-on="Hide the self-check" data-off="Start the self-check (' + count + ' questions)">Start the self-check (' + count + ' questions)</button><div id="chk" hidden style="margin-top:16px">' + out + '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:16px"><button class="btn" type="button" data-check="#chk">Check my answers</button><button class="btn ghost" type="button" data-retry="#chk">Try again</button><span id="score" role="status" style="font-weight:700;color:#000"></span></div>' + src + "</div>";
  }
  function gradeCheck(box) {
    var right = 0, total = 0;
    Array.prototype.forEach.call(box.querySelectorAll(".qz"), function (q) {
      var type = q.getAttribute("data-type"); if (type === "free") return;
      var ans = q.getAttribute("data-ans"), fb = q.querySelector(".fb"), c = 0, n = 1, tol = parseFloat(q.getAttribute("data-tol") || "0");
      if (type === "mc") { var sel = q.querySelector("input:checked"); c = sel && sel.value.toLowerCase() === ans.toLowerCase() ? 1 : 0; }
      else if (type === "multi") {
        var want = ans.toUpperCase().split(" ").sort().join(""), got = Array.prototype.map.call(q.querySelectorAll("input:checked"), function (i) { return i.value; }).sort().join("");
        c = want === got ? 1 : 0;
      } else if (type === "match") {
        var keys = ans.toLowerCase().split(" "); n = keys.length;
        Array.prototype.forEach.call(q.querySelectorAll("select"), function (s, i) { if (s.value === keys[i]) c++; });
      } else if (type === "num") {
        var nk = ans.split(" | "); n = nk.length;
        Array.prototype.forEach.call(q.querySelectorAll("input[data-num]"), function (inp, i) { if (numOk(inp.value, nk[i], tol)) c++; });
      }
      total += n; right += c;
      var ok = c === n, expl = q.getAttribute("data-expl");
      fb.hidden = false; fb.className = "fb " + (ok ? "good" : "bad");
      fb.innerHTML = (ok ? "<b>Correct.</b> " : "<b>Not quite.</b> ") + (n > 1 && !ok ? "You got " + c + " of " + n + ". " : "") + (ok ? "" : "The answer: " + q.getAttribute("data-show") + ". ") + (expl ? esc(expl) : "");
    });
    box.querySelector("#score").textContent = "You got " + right + " of " + total + ".";
  }
  function resetCheck(box) {
    Array.prototype.forEach.call(box.querySelectorAll("input[type=radio],input[type=checkbox]"), function (i) { i.checked = false; });
    Array.prototype.forEach.call(box.querySelectorAll("input[data-num]"), function (i) { i.value = ""; });
    Array.prototype.forEach.call(box.querySelectorAll("select"), function (s) { s.value = ""; });
    Array.prototype.forEach.call(box.querySelectorAll(".fb"), function (f) { f.hidden = true; f.innerHTML = ""; });
    box.querySelector("#score").textContent = "";
  }

  function phText(t) { return esc(t).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>'); }
  var copyN = 0;
  function promptBox(text, label) {
    var id = "cp" + (copyN++);
    return '<div class="mid" id="' + id + '" style="margin:0 0 12px">' + phText(text) + '</div><button class="btn ghost" type="button" data-copy="#' + id + '"' + (label ? ' aria-label="Copy the prompt: ' + esc(label) + '"' : "") + ">Copy prompt</button>";
  }
  function stepsHtml(steps) { return '<ol style="margin:0 0 20px;padding-left:24px">' + steps.map(function (t) { return '<li style="margin-bottom:8px">' + esc(t) + "</li>"; }).join("") + "</ol>"; }
  function peopleHtml(p, headTag) {
    return "<" + headTag + ' style="font-size:21px;margin:0 0 12px">' + esc(p.title) + "</" + headTag + ">" + p.items.map(function (it) {
      return '<p style="margin:0 0 12px"><b style="color:#000">' + (it.url ? '<a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.label) + " ↗</a>" : esc(it.label)) + ".</b> " + esc(it.text) + "</p>";
    }).join("");
  }
  function alsoNote(outcomeCell, here, slug) {
    var others = codes(outcomeCell).filter(function (c) { return c !== here; });
    if (!others.length) return "";
    return '<p class="small" style="margin:12px 0 0">This problem also covers ' + others.map(function (c) { return '<a href="#/' + slug + "/" + c.toLowerCase() + '">' + c + "</a>"; }).join(", ") + ".</p>";
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
    var probs = d.problems.filter(function (p) { return codes(p.outcome).indexOf(o.code) !== -1; });
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
    var aos = note ? (/not yet/i.test(note) ? '<div class="empty" style="margin-top:14px"><b style="color:#000">Open slot:</b> Art of Stat. ' + esc(note) + "</div>" : '<p class="small" style="margin:14px 0 0"><b style="color:#000">Art of Stat:</b> ' + esc(note) + ' <a href="https://artofstatguide.netlify.app/#library" target="_blank" rel="noopener">Open the Art of Stat Student Hub ↗</a></p>') : "";
    var chk = d.checks.filter(function (c) { return c.outcome === o.code; });
    var s5 = '<p class="small" style="margin:0 0 12px">Skill ' + n + " knowledge check. Practice only: it does not count toward your grade. The Canvas version is in your course." + (chk.length ? "" : " Questions for " + o.code + " are coming here soon.") + "</p>" + (chk.length ? checkHtml(chk) : "") + aos;
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
        return '<div class="card"><div style="margin-bottom:12px">' + unitPill(o.unit, "Sample problem " + (pi + 1)) + '</div>' + (ps[0].source ? '<p class="small" style="margin:0 0 10px">From the ' + esc(ps[0].source) + "</p>" : "") + '<div style="margin:0 0 16px">' + rich(ps[0].intro, true) + "</div>" + (ps[0].image ? imgs(ps[0].image, ps[0].image_alt) : "") + (ps[0].hint ? '<div><button class="btn ghost" type="button" data-reveal="#' + hid + '" aria-expanded="false" data-on="Hide the hint" data-off="Need a hint?">Need a hint?</button></div><div class="hintbox" id="' + hid + '" hidden><b style="color:#000">Hint.</b> ' + esc(ps[0].hint) + "</div>" : "") + alsoNote(ps[0].outcome, o.code, slug) + parts + "</div>";
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
    copyN = 100;
    var ai = c.ai, fu = d.follow.filter(function (f) { return +f.unit === o.unit; });
    var promptHtml = prompts.length ? prompts.map(function (p) {
      return '<div style="border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:14px"><div style="margin-bottom:8px">' + unitPill(o.unit, p.kind + " · " + o.code) + '</div><div style="font-family:Mulish,sans-serif;font-weight:800;color:#000;margin-bottom:6px">' + esc(p.title) + "</div>" + (p.note ? '<p class="small" style="margin:0 0 10px"><b style="color:#000">What this helps with:</b> ' + esc(p.note) + "</p>" : "") + promptBox(p.text, p.title) + "</div>";
    }).join("") : '<div class="empty" style="margin-bottom:14px"><b style="color:#000">' + esc(ai.fallbackTitle) + ".</b> " + esc(ai.fallbackText) + '</div>' + ai.fallbackPrompts.map(function (t) { return '<div style="border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:14px">' + promptBox(t, "starter prompt") + "</div>"; }).join("") + '<p style="margin:0 0 14px"><a class="btn ghost" href="#/' + slug + '" data-scroll="ai">See four ways to use AI</a></p>';
    var followHtml = fu.length ? '<h4 style="font-family:Mulish,sans-serif;font-weight:800;font-size:19px;margin:22px 0 4px;color:#000">' + esc(ai.followTitle) + '</h4><p class="small" style="margin:0 0 12px">' + esc(ai.followSub) + "</p>" + fu.map(function (f) { return '<div style="border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:14px"><div style="font-weight:700;color:#000;margin-bottom:8px">' + esc(f.label) + "</div>" + promptBox(f.text, f.label) + "</div>"; }).join("") : "";
    var afterHtml = '<h4 style="font-family:Mulish,sans-serif;font-weight:800;font-size:19px;margin:22px 0 8px;color:#000">' + esc(ai.afterTitle) + '</h4><ul style="margin:0 0 4px;padding-left:24px">' + ai.afterQuestions.map(function (q) { return '<li style="margin-bottom:6px">' + esc(q) + "</li>"; }).join("") + "</ul>";
    var idx = d.list.indexOf(o), prev = d.list[idx - 1], next = d.list[idx + 1];
    var pn = '<section class="sec tight"><div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">' + (prev ? '<a class="btn ghost" href="#/' + slug + "/" + prev.code.toLowerCase() + '">← ' + prev.code + " " + esc(prev.title) + "</a>" : "<span></span>") + (next ? '<a class="btn ghost" href="#/' + slug + "/" + next.code.toLowerCase() + '">' + next.code + " " + esc(next.title) + " →</a>" : "") + "</div></section>";

    return header(h.courses) + '<main id="main"><section class="hero-white"><div class="wrap"><p class="crumbs"><a href="#/">Academy</a> <span class="small">/</span> <a href="#/' + slug + '">' + esc(c.code) + '</a> <span class="small">/</span> Unit ' + o.unit + ' <span class="small">/</span> ' + o.code + '</p><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:48px;align-items:start"><div><div style="margin-bottom:14px">' + unitPill(o.unit, "Unit " + o.unit + " · " + o.code) + "</div><h1>" + esc(o.title) + '</h1><p style="font-size:21px;margin:0 0 20px;color:var(--ink)">' + esc(o.statement) + '</p><ul class="small" style="margin:0 0 24px;padding-left:24px">' + o.subs.map(function (s) { return '<li style="margin-bottom:8px">' + esc(s) + "</li>"; }).join("") + '</ul><p class="small" style="margin:0">' + counts + "</p></div>" + fits + "</div></div></section>" +
      '<section class="sec">' + sectionHead("Your path through " + o.code, "Work top to bottom, or jump to the step you need.") + '<div class="stack" style="gap:16px">' + steps + "</div></section>" + tryHtml + retr + callHtml +
      '<section class="sec">' + sectionHead("When you are stuck on " + o.code, "Read the answer first. If another format works better for you, it is one click away.") + '<div class="grid two"><div><h3 style="font-size:21px;margin-bottom:14px">From the Unit ' + o.unit + ' FAQ</h3><div class="stack">' + faqHtml + '</div></div><div><h3 style="font-size:21px;margin-bottom:14px">Ask an AI study partner</h3><div class="card"><h4 style="font-family:Mulish,sans-serif;font-weight:800;font-size:19px;margin:0 0 10px;color:#000">' + esc(ai.stepsTitle) + '</h4>' + stepsHtml(ai.steps) + promptHtml + followHtml + afterHtml + '</div><div class="card" style="margin-top:24px">' + peopleHtml(c.people, "h3") + "</div></div></div></section>" + pn + "</main>" + footer(h.copy.footer);
  }

  // ---------- routing
  var searchIdx = null;
  function allIndex(h) {
    if (searchIdx) return Promise.resolve(searchIdx);
    var live = h.courses.filter(function (c) { return c.status === "live"; });
    return Promise.all(live.map(function (c) { return loadCourse(c.slug); })).then(function (ds) {
      searchIdx = [].concat.apply([], ds.map(buildIndex));
      var sp = h.copy.support;
      if (sp) {
        searchIdx.push({ t: "Support", n: sp.mathCenter.name + ": hours and location", k: "tutoring zoom online in person L-204 " + sp.mathCenter.where, h: sp.mathCenter.links[0].url, ext: true, s: "Free math tutoring" });
        sp.more.forEach(function (x) { searchIdx.push({ t: "Support", n: x.name, k: x.text, h: x.url, ext: true, s: "Campus support" }); });
      }
      return searchIdx;
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
        if (!parts[1]) { paint(pageCourse(h, d), d); document.title = d.copy.code + " · SAC Math Academy"; wireSearch(function () { return allIndex(h); }); return; }
        if (parts[1] === "midterm" && d.copy.midterm) { paint(pageMidterm(h, d), d); document.title = "Midterm review · " + d.copy.code; renderPlan(d); return; }
        if (parts[1] === "apps") { paint(pageApps(h, d), d); document.title = "Apps · " + d.copy.code; return; }
        var o = d.outcomes[parts[1].toUpperCase()];
        if (!o) { app.innerHTML = header(h.courses) + '<main id="main" class="sec"><h1>Outcome not found</h1><p><a href="#/' + d.slug + '">Back to ' + esc(d.copy.code) + "</a></p></main>"; return; }
        paint(pageOutcome(h, d, o), d); document.title = o.code + " " + o.title + " · " + d.copy.code;
      });
    }).then(function () {
      var h1 = app.querySelector("h1"); if (h1) { h1.setAttribute("tabindex", "-1"); }
      if (!window.__keepScroll) window.scrollTo(0, 0);
      window.__keepScroll = false;
    }).catch(function (e) {
      app.innerHTML = '<main id="main" class="sec"><h1>This page could not load</h1><p>' + esc(e.message) + '</p><p class="small">This usually means a site file is missing, or one file is older than the others. Re-upload every file from the latest zip, keeping the same folder names. If you opened index.html straight from a folder, the data files cannot load, so open the site from Netlify or a local web server. (Code version ' + esc(APP_VERSION) + ')</p></main>';
    });
  }

  // ---------- events
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toggle],[data-reveal],[data-copy],[data-scroll],[data-check],[data-retry],[data-clear],[data-mfilter]");
    if (!t) return;
    if (t.hasAttribute("data-mfilter")) {
      var f = t.getAttribute("data-mfilter"), shown = 0;
      Array.prototype.forEach.call(app.querySelectorAll("[data-mfilter]"), function (b) { var on = b === t; b.setAttribute("aria-pressed", on ? "true" : "false"); b.className = "btn" + (on ? "" : " ghost"); });
      Array.prototype.forEach.call(app.querySelectorAll(".mpcard"), function (c) { var ok = f === "all" || (" " + c.getAttribute("data-outs") + " ").indexOf(" " + f + " ") !== -1; c.hidden = !ok; if (ok) shown++; });
      var cnt = app.querySelector("#mpcount"); if (cnt) cnt.textContent = f === "all" ? "Showing all " + shown + " problems." : "Showing " + shown + " problems that cover " + f + ".";
    }
    else if (t.hasAttribute("data-clear")) { var slug2 = location.hash.replace(/^#\/?/, "").split("/")[0]; loadCourse(slug2).then(function (d) { saveRatings(d, {}); Array.prototype.forEach.call(app.querySelectorAll("input[data-pbn]"), function (i) { i.checked = false; }); renderPlan(d); }); }
    else if (t.hasAttribute("data-check")) { gradeCheck(app.querySelector(t.getAttribute("data-check"))); }
    else if (t.hasAttribute("data-retry")) { resetCheck(app.querySelector(t.getAttribute("data-retry"))); }
    else if (t.hasAttribute("data-toggle")) {
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
  document.addEventListener("change", function (e) {
    var t = e.target; if (!t || !t.getAttribute || !t.getAttribute("data-pbn")) return;
    var slug = (location.hash.replace(/^#\/?/, "").split("/")[0]) || "stat-c1000";
    loadCourse(slug).then(function (d) { var r = loadRatings(d); r[t.getAttribute("data-pbn")] = t.value; saveRatings(d, r); renderPlan(d); });
  });
  window.addEventListener("hashchange", route);
  route();
})();

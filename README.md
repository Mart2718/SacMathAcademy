# SAC Math Academy: STAT C1000 hub

This is the live-site version of the hub we designed. It has no build step and no database. The pages read plain tables, so you change content by editing a table, not code.

## What is in this folder

- `index.html`, `app.js`, `styles.css`: the site itself. Leave these alone unless you want to change a page layout.
- `config.js`: one small settings file (see "Read from Google Sheets" below).
- `data/courses.csv`: the department page. One row per course card on the home page.
- `data/stat-c1000/`: everything for the STAT C1000 hub.
  - `outcomes.csv`, `modules.csv`, `videos.csv`, `apps.csv`, `faq.csv`, `prompts.csv`, `problems.csv`, `solutions.csv`, `tools.csv`: tables you edit often.
  - `course.json`: the wording of the course page (headline, statistical thinking, help paths, AI study partner modes, review cards, callouts).
- `data/home.json`: the wording of the Academy home page.

## How to edit

Open any `.csv` in Excel or Google Sheets. Keep the top row (the column names) exactly as it is. Save as CSV, then re-upload the folder to Netlify (see "Put it online").

Outcome codes are written like `S12`. A cell that lists several outcomes separates them with spaces, for example `S13 S14`.

| Table | One row is | Notes |
|---|---|---|
| outcomes | one learning outcome | `modules` lists module numbers. `subskills` are separated by ` | `. `builds_on` lists earlier outcomes. "Leads to" is worked out for you. `art_of_stat_note` text containing "not yet" shows as an open slot. |
| modules | one module | `notes_url` is the guided notes PDF. `solutions_url` is the solutions Doc. `homework` names are separated by ` | `. |
| videos | one YouTube video | `video_id` is the part after `v=`. `outcomes` is which outcome pages show it. `kind` is `lecture` or `app`. |
| apps | one app | `status` is `live` or `planned`. Planned apps show as placeholders until you add a `url` and change the status to `live`. |
| faq | one question | `answer` is optional. If it is empty the page links to the unit FAQ site. |
| prompts | one AI prompt for one outcome | `kind` is `Concept` or `Skill`. |
| problems | one part of one sample problem | Rows with the same `outcome` and `problem` form one problem. `answer` is what "Check my answer" reveals. |
| solutions | one solutions document | `outcomes` lists which outcome pages link to it. |
| tools | one course-level resource | Shown on the course page. |

### Common tasks

- **Add or replace a video:** add a row to `videos.csv` with its YouTube ID and the outcomes it belongs to.
- **Link a finished app:** in `apps.csv`, fill in `url` and change `status` from `planned` to `live`.
- **Add sample problems for an outcome:** add rows to `problems.csv`. Use the same outcome code and problem number for every part of one problem.
- **Add a course to the department page:** add a row to `data/courses.csv`. When that course has its own hub, copy the `data/stat-c1000` folder to `data/<new-slug>`, edit its tables, and set the row's `status` to `live`.

## Put it online (Netlify)

1. Unzip this folder.
2. In Netlify, open the site, go to Deploys, and drag the unzipped folder onto the drop area. This is the same way you deployed your other apps.
3. Open the site address. It will not work if you double-click `index.html`, because the browser blocks reading the data files from a folder. Netlify or any web server works.

## Read from Google Sheets (optional, no re-upload)

If you keep each table as a tab in a Google Sheet, publish each tab (File, Share, Publish to web, choose the tab and CSV). Then put the link in `config.js`, for example:

`TABLE_URLS: { "stat-c1000/faq": "https://docs.google.com/spreadsheets/d/e/.../pub?gid=123&single=true&output=csv" }`

After that, edits in the Sheet appear on the site within a few minutes with no upload.

## Check these before students use it

- **Sharing:** students must be able to open the Drive links (guided notes PDFs, solutions Docs, Art of Stat guide). Check each file's sharing setting.
- **Solutions link:** `solutions.csv` points to the Drive copy named "Copy of Solutions Unit 2 CP." Replace it with the Doc you want students to use.
- **Video tags are a draft.** I tagged each video to outcomes by its section number (for example 8.1 goes to S12). Check them, especially S18 and the Module 12 sections.
- **Module 14:** the first video slot on your module page repeated Module 1.1 Part 1. I used the 14.1 Part 1 video from your playlist instead. Fix the same slot on your MyOpenMath page.
- **Module 6:** the third video is titled "6.2 Part 3" on YouTube. I labeled it 6.1 Part 3.
- **App walkthrough videos:** seven videos from your playlist (type I and II errors, CI app, regression app, and others) are tagged to outcomes from their titles. I have not watched them.
- **"Builds on" links** in `outcomes.csv` are my draft of how outcomes depend on each other.
- **Sample problem answers** were computed by me, not copied from your key. Check them. In S12 problem 2 part b, "10% away" is read as 10 percentage points.
- **Practice problems** exist so far for S8, S10, S11, and S12 (from the Unit 2 challenge problems). The other outcomes show a "coming" placeholder.
- **Retrieval practice apps** are placeholders in `apps.csv` (one per group of outcomes). Edit or delete rows freely.
- **Logo:** the header uses the color logo. The footer has no logo until you add the reverse version. See "The SAC logo" below.
- **Captions:** SAC's brand guide expects human-edited closed captions on video. Your lecture videos are on YouTube, so check their captions.

## Design decisions to keep

- The hub is organized by **learning outcome**, not by chapter or module. Modules are a way to find outcomes, not the other way around.
- Apps and videos are **tagged to outcomes**. One app can cover several outcomes and appears on each outcome page it covers.
- The hub is school-wide, so term-specific items like a syllabus stay out. The course page opens with a grounding in the discipline (statistical thinking).
- Practice follows "try it first, check your answer, then open the solutions."
- AI study partner prompts ask students to attempt the problem first. Quizzes and exams are AI-free.
- Colors and fonts follow Santa Ana College's 2025 brand guide: red #9D1414 (also used for links), black, gold #FFB600, the STEM pathway navy #1D3969 for Math, and unit colors taken from the guide's chart-color order. Text is Mulish (Google's current version of the guide's Muli family). The minimum text size is 14 points (about 19 pixels) for accessibility. Note that sac.edu itself uses Montserrat for headings. If you prefer to match the live site, change the font name in `index.html` and `styles.css`.

## The SAC logo

The header uses `SAC_Logo.png`, the horizontal color logo (the guide's "Alternate Preferred Logo"). It has a white background, so it only works on white. That is why it appears in the white header and not in the black footer or the red hero.

SAC's brand guide says not to recreate, crop, stretch, or recolor the logo, and to use transparent, high-resolution files. Keep the logo at least 2 inches wide (about 192 pixels). The site shows it at 220 pixels.

To change the logo, upload the new file to the main folder of the repo (next to `index.html`) and set its exact file name in `config.js`. File names are case-sensitive.

If you want the logo on a dark background, get the reverse logo (white text, transparent) from the SAC Assets folder (page 37 of the brand guide, SAC login required) or email publicinformation@sac.edu. Ask at the same time for the Mathematics department descriptive signature. Then set `LOGO_REVERSE` in `config.js` and the footer will show it.

## Keep working on it

Continue in the Claude project "SAC Math Resource Hub." Share this folder or the changed tables and say what you want changed. The department page is the next page to design.

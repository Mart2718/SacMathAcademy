# SAC Math Academy

One website for every SAC math course hub, in one GitHub repo (`Mart2718/SacMathAcademy`). The Academy home page lists the courses. Each course hub lives inside this repo as its own folder under `data/`.

- **Live site:** https://sacmathacademy.netlify.app/ (connected to this repo)
- **Course hubs:** STAT C1000 at `#/stat-c1000` and Math 172 at `#/math-172`

The site has no build step and no database. The pages read plain tables, so you change content by editing a table, not code.

## Courses

| Course | Folder | Status | Layout |
|---|---|---|---|
| STAT C1000 | `data/stat-c1000/` | live | outcome layout (units, modules, videos, practice problems, self-checks) |
| Math 172 | `data/math-172/` | live | chapter layout (links each outcome to the textbook, FAQ, CheckIt, and labs) |
| Math 204 | none yet | in progress | |
| Math 180 | none yet | planned | |

The home page's course cards come from `data/courses.csv`. A course's `status` is `live`, `progress`, or `planned`.

## Publishing

**The live site updates itself.** `sacmathacademy.netlify.app` is connected to this repo. Every change saved to the `main` branch, whether edited on GitHub or pushed by Claude, is published in about a minute. There is nothing to drag or upload.

**`sacmathacademyfall2026.netlify.app` is a separate, older copy.** It was published by drag-and-drop, so it is not connected to GitHub and does not update. Either retire it or link it to this repo in Netlify (Site configuration, Build & deploy, Link repository).

**A yellow bar** at the top of a page means some files are older than the code. This happens when files are uploaded one at a time. Make sure every changed file is on `main`.

To test the site on your own computer, run a small web server in the folder. Double-clicking `index.html` does not work, because the browser blocks reading the data files from a folder.

## What is in this repo

- `index.html`, `app.js`, `styles.css`: the site itself, shared by every course. Leave these alone unless you want to change a page layout.
- `config.js`: one small settings file (logo file names and optional Google Sheets links).
- `SAC_Logo.png`: the header logo.
- `data/home.json`: the wording of the Academy home page, including the Math Center and support section.
- `data/courses.csv`: one row per course card on the home page.
- `data/stat-c1000/`: everything for the STAT C1000 hub (see "STAT C1000 hub" below).
- `data/math-172/`: everything for the Math 172 hub (see "Math 172 hub" below).
- `images/`: pictures for the STAT C1000 self-checks and sample problems.

## Add a new course hub

1. Add or update the course's row in `data/courses.csv`.
2. Make a folder `data/<slug>`, where the slug matches the row (for example `math-204`).
3. Pick a layout:
   - **Chapter layout (like Math 172):** for a course whose resources already live on other sites. Copy `data/math-172`, then edit its four files. Each outcome page links out to the textbook, FAQ, practice, and labs.
   - **Outcome layout (like STAT C1000):** for a course whose videos, practice problems, and self-checks live in the hub itself. Copy `data/stat-c1000` and edit its tables.
4. Set the row's `status` to `live`.

## Math 172 hub (chapter layout)

Math 172 uses the chapter layout, switched on by `"layout": "chapters"` in `data/math-172/course.json`. The course page shows Chapters 1 to 5 of *Building Toward Calculus* with their outcomes, a Foundational Fluency section (Chapter 6), tools, "When you are stuck" help, and the Math 172 Practice Partner. Each outcome page is a numbered path: textbook, FAQ and guided learning (plus lecture notes for TE1 to TE6), labs, CheckIt practice, CheckIt support, and the Practice Partner.

| File | One row is | Notes |
|---|---|---|
| `outcomes.csv` | one outcome | `chapter` 1 to 5 follows the textbook; chapter 6 is Foundational Fluency. The link columns are `book_url`, `exercises_url` (the book's online exercises), `faq_url` and `faq_label`, `support_url` (CheckIt support page), `checkit_url` (TBIL CheckIt bank), and `notes_url` (lecture notes). An empty cell hides that step or shows "coming." Titles and statements use TBIL's wording, except ST, EX, AF, and AM, which come from the textbook. |
| `chapters.csv` | one chapter | Title, textbook link, and the "Toward calculus" line on each chapter card. |
| `apps.csv` | one lab, fluency app, or tool | `kind` is `lab`, `fluency`, or `tool`. `outcomes` lists codes separated by spaces, and the app appears on each of those outcome pages. `status` is `live` or `planned`. |
| `course.json` | | Page wording, help paths, tools, the Practice Partner link, and the people-help list. |

### What Math 172 covers

- **38 outcomes in Chapters 1 to 5:** FN1 to FN6, LF1 to LF3, LF5, PR1 to PR9, TR1, TR2, TR5, PF1 to PF3, EL1 to EL7, and TE1 to TE6. LF4 and LF7 are no longer in the course.
- **12 Foundational Fluency skills (Chapter 6):** EQ1 to EQ5, LF6, TR3, TR4, ST, EX, AF, and AM. These come from the textbook and in-class work, not MyOpenMath.
- **Where the links point:** FAQ sites are `172<code>faq.netlify.app` (FN2 and FN3, LF2/LF3/LF5, PR1 and PR2, PR4 and PR5, and EL5 and EL6 share one site each). CheckIt support pages are `172checkit.netlify.app/<code>/`, from the `172-checkit-support` repo. Lecture notes are `172te<n>notes.netlify.app`.
- **Apps:** 12 labs, 5 fluency apps (EQ5, EX, AF, ST, AM), and 2 tools (Sentence Frames and the Standards Tracker). The EQ5 app is `172eq5quadraticfluency`. The duplicate `172quadfulencyeq5` is inactive and not linked.
- **Practice Partner:** the Playlab link is in `course.json` in two places (`tools` and `ai.partner`).

### Common Math 172 tasks

- **Add an outcome:** add a row to `outcomes.csv` with its chapter and links.
- **Link a new lab or app:** add a row to `apps.csv` with the outcome codes it supports.
- **Change a link** (for example, a renamed FAQ site): edit that cell in `outcomes.csv`.

### Planned for Math 172

- Quiz and exam prep pages (one per SLO group, using the STAT C1000 midterm review page as the model).
- Videos on outcome pages, if needed. They are already inside each FAQ site.

## STAT C1000 hub (outcome layout)

### How to edit

Open any `.csv` in Excel or Google Sheets. Keep the top row (the column names) exactly as it is. Save as CSV, then upload it to the same folder in this repo on GitHub. The live site updates on its own.

Outcome codes are written like `S12`. A cell that lists several outcomes separates them with spaces, for example `S13 S14`.

| Table | One row is | Notes |
|---|---|---|
| outcomes | one learning outcome | `modules` lists module numbers. `subskills` are separated by ` | `. `builds_on` lists earlier outcomes. "Leads to" is worked out for you. `art_of_stat_note` text containing "not yet" shows as an open slot. |
| modules | one module | `notes_url` is the guided notes PDF. `solutions_url` is the solutions Doc. `homework` names are separated by ` | `. |
| videos | one YouTube video | `video_id` is the part after `v=`. `outcomes` is which outcome pages show it. `kind` is `lecture` or `app`. |
| apps | one app | `status` is `live` or `planned`. Planned apps show as placeholders until you add a `url` and change the status to `live`. |
| faq | one question | `answer` is optional. If it is empty the page links to the unit FAQ site. |
| prompts | one AI prompt for one outcome | `kind` is `Concept` (for when the idea is unclear) or `Skill` (for when a problem is the trouble). `note` is the "what this helps with" line, and `text` is the prompt students copy. Put `[brackets]` around anything students should fill in and they show highlighted. These come from your Unit AI Study Partner pages. |
| followups | one "keep the conversation going" prompt for a unit | `unit` is 1 to 4, `label` is the heading, and `text` is the prompt. Every outcome page in that unit shows them. |
| problems | one part of one sample problem | Rows with the same `problem` id form one problem, so every problem needs its own unique id (for example `U1M1Q3`). `outcome` can list several outcomes, like `S4 S5`, and then the problem appears on every outcome page it covers, with a note saying where else it applies. `source` says which challenge problem it came from. `image` and `image_alt` add pictures (separate several with ` | `) and their descriptions. `hint` is optional. `answer` is what "Check my answer" reveals. Lines in `intro` that start with `|` become a table. |
| midterm | one skill on the Midterm Review checklist | `skill` is the text students rate, and `outcomes` is which outcome pages the "Review" links go to. Add or reorder rows to change the checklist. |
| midtermproblems | one part of one Midterm Review practice problem | Same idea as `problems`, but for the practice test on the Midterm Review page. `problem` is the problem number from your review, `outcomes` is which outcome pages its "Review" links go to, and `answer` is what "Check my answer" reveals. |
| checks | one question of a skill self-check | `type` is `mc` (one correct choice), `multi` (check all that apply), `match` (drop-down matching), `num` (type a number), `free` (write your own answer, with a sample answer), or `note` (an optional source line). For `mc` and `multi`, put the choices in `options` separated by ` | ` and the correct letter or letters in `answer` (for example `B` or `A C F`). For `match`, list the left side in `items`, the choices in `options`, and one letter per item in `answer` (for example `d a c e b`). For `num`, list one label per box in `items`, the correct values in `answer` separated by ` | `, and the allowed difference in `tol`. A range like `10..25` accepts any number from 10 to 25. Use `stem` for the scenario text. Lines that start with `|` in `stem` become a table. `image` and `image_alt` add a picture and its description. `option_images` puts a picture in each answer choice. |
| solutions | one solutions document | `outcomes` lists which outcome pages link to it. |
| tools | one course-level resource | Shown on the course page. |

### Common STAT C1000 tasks

- **Add or replace a video:** add a row to `videos.csv` with its YouTube ID and the outcomes it belongs to.
- **Link a finished app:** in `apps.csv`, fill in `url` and change `status` from `planned` to `live`.
- **Add sample problems for an outcome:** add rows to `problems.csv`. Use the same outcome code and problem number for every part of one problem.
- **Add a course to the department page:** see "Add a new course hub" above.

### Put it online (Netlify)

Save changes to the `main` branch of this repo. The live site updates on its own (see "Publishing" above).

### Read from Google Sheets (optional, no re-upload)

If you keep each table as a tab in a Google Sheet, publish each tab (File, Share, Publish to web, choose the tab and CSV). Then put the link in `config.js`, for example:

`TABLE_URLS: { "stat-c1000/faq": "https://docs.google.com/spreadsheets/d/e/.../pub?gid=123&single=true&output=csv" }`

After that, edits in the Sheet appear on the site within a few minutes with no upload.

### Check these before students use it

- **Sharing:** students must be able to open the Drive links (guided notes PDFs, solutions Docs). Check each file's sharing setting.
- **Solutions link:** `solutions.csv` points to the Drive copy named "Copy of Solutions Unit 2 CP." Replace it with the Doc you want students to use.
- **Video tags are a draft.** I tagged each video to outcomes by its section number (for example 8.1 goes to S12). Check them, especially S18 and the Module 12 sections.
- **Module 14:** the first video slot on your module page repeated Module 1.1 Part 1. I used the 14.1 Part 1 video from your playlist instead. Fix the same slot on your MyOpenMath page.
- **Module 6:** the third video is titled "6.2 Part 3" on YouTube. I labeled it 6.1 Part 3.
- **App walkthrough videos:** seven videos from your playlist (type I and II errors, CI app, regression app, and others) are tagged to outcomes from their titles. I have not watched them.
- **"Builds on" links** in `outcomes.csv` are my draft of how outcomes depend on each other.
- **Sample problem answers** were computed by me, not copied from your key. Check them. In S12 problem 2 part b, "10% away" is read as 10 percentage points.
- **AI study partner:** the how-to steps, the four ways to use AI, the reflection questions, and the people-help text come from your "AI to Support Learning Statistics" and "Getting Help When Stuck" pages. They live in the `ai` and `people` sections of `course.json`. Your "Master Prompting" examples are not included because they are not about statistics. Please check the six how-to steps, which are my wording.
- **Self-checks:** S1 through S12 have a working self-check in step 5, from your MyOpenMath knowledge checks. The answers match your keys, and I recomputed every numeric one. Please check what I wrote myself: the sample answers for the written questions (S1 question 1, S2 4a, S3 3b, 7b and 7d, S5 4b, S6 3), the short explanations, and the text descriptions of each picture. Several questions were drawn or typed in MyOpenMath, so I changed them to fit: drawing questions became choose-the-picture or sample-answer questions, and answers that were blanks in a table became labeled boxes. S4 question 2c (pick the pie chart) is left out because its pictures were not in the Word file. The S8 question 3b text said "34", and I read it as 3/4. The New York Times graph in S2 is linked, not copied.
- **Sample problems:** Unit 1 and Unit 2 problems come from your challenge problem Word files, with answers from your solutions Docs, and typos fixed. Module 3 problem 4 (Unit 1) is adapted: it gives the two quartiles instead of the class data set. Three answers are mine, so please check them: the sample comparison in Module 2 problem 1(b), the median and mean for Module 3 problem 3(c) (counted from the dot plot, 39 dots), and the text descriptions of each picture. The contingency tables from Unit 2 are typed as tables, not pictures.
- **Midterm Review:** the 40 skills and the 35 practice problems are from your Math 219 Midterm Review (Spring 2021), and I matched each skill and problem to the outcomes S1 to S12. Check those matches. Answers are from your key with your two corrections to 24b and 24c, which I confirmed (0.0437 and 0.0882). I also changed a few key entries that looked like typos, so please check them: problem 6a (the IQR for Math 219 reads about 33 on the graph, not 25), 28b (the key shows (24/26)(22/45); I used 2 × (24/46)(22/45) ≈ 0.510), 33c (the lower fence is 125 − 1.5(31) = 78.5, not 109.5; the conclusion is the same), and 34b (nq = 200(0.53)). I added answers the key skipped: 17d, 28c, and the checks shown for problems 3, 4, 7, 25, and 26. Problem 15's pie chart is described in words (Math 40%, English 45%, History 15%), and its answer assumes Math is 40%. The review's page still says Math 219, Spring 2021, and sections 1 to 7.
- **Practice problems** exist so far for S8, S10, S11, and S12 (from the Unit 2 challenge problems). The other outcomes show a "coming" placeholder.
- **Retrieval practice apps** are placeholders in `apps.csv` (one per group of outcomes). Edit or delete rows freely.
- **Logo:** the header uses the color logo. The footer has no logo until you add the reverse version. See "The SAC logo" below.
- **Captions:** SAC's brand guide expects human-edited closed captions on video. Your lecture videos are on YouTube, so check their captions.

## Design decisions to keep (all courses)

- Hubs are organized by **learning outcome**. Modules (STAT C1000) and chapters (Math 172) are ways to find outcomes, not the other way around.
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

## Support section on the home page

The "Get help online or in the Math Center" section and the "More ways to get support" cards come from the `support` part of `data/home.json`. The Math Center hours, room, phone, and Zoom link were copied from the Math Center page on sac.edu on October 5, 2026. Hours can change each semester, so check them at the start of each term. The Zoom link is the one posted on the Math Center page and may change. I left out the email address because that page lists a person's name in it.

To show the SAC Math Hope Academy card, put its web address in the `url` of the `hope` entry in `home.json`. The card stays hidden while `url` is empty. The Hope Academy logo is not on the page, because I do not have the official file.

## Art of Stat Student Hub

The course page, the "stuck" help, and each outcome's Art of Stat line link to https://artofstatguide.netlify.app/. To change the address, edit `tools.csv`, `course.json` (two places), and `app.js` (one place, near "Open the Art of Stat Student Hub"). The hub has no separate page for each tool, so the links go to the hub itself, to its tool chooser (`#finder`), or to its full library (`#library`). The Art of Stat line on each outcome page lists the hub entries for that outcome, from `art_of_stat_note` in `outcomes.csv`. Gaps stay as open slots: sampling distributions and the CLT (S12), margin of error and sample size (S13), and the one-mean t-test (S16).

## Keep working on it

Work on the Academy from a Claude project with access to this repo. STAT C1000 work has been in "SAC Math Resource Hub," and Math 172 work in "Math 172 Class Mode." Say which course and which table you want changed. Claude can push changes to `main`, and the live site updates on its own.

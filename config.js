/* SAC Math Academy: settings you may edit.

   LOGO: put the official Santa Ana College logo files in this same folder (next to index.html),
   then type their file names below. Use the files from the SAC Assets folder.
   LOGO_COLOR  = the full-color logo, shown on the white header.
   LOGO_REVERSE = the reverse (white text) logo, shown on the black footer.
   Leave them as "" and the site shows an "[Official SAC logo]" placeholder.

   DATA_BASE is where the tables live. Leave it as "data" to read the CSV files in the data folder.
   To read from Google Sheets instead, replace a file's path with its "Publish to web" CSV link.
   Example: TABLE_URLS["stat-c1000/faq"] = "https://docs.google.com/spreadsheets/d/e/.../pub?gid=123&single=true&output=csv"; */
window.ACADEMY_CONFIG = {
  LOGO_COLOR: "SAC_Logo.png",
  LOGO_REVERSE: "",
  DATA_BASE: "data",
  TABLE_URLS: {}
};

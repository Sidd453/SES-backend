SES - FULLY UPDATED (admin changes now reach the website)

WHAT WAS WRONG
 1. js/config.js was never loaded by the HTML, so the website called "/api" on its own host (no API there) and silently showed old built-in text.
 2. Admin config always pointed at Render even when testing locally (different database from the local website).
 3. CORS threw errors for unknown origins; server crashed if MongoDB was slow; Render free server sleeps.

WHAT IS FIXED
 - Website + admin auto-detect the backend: localhost -> http://localhost:5000/api, real domain -> https://ses-backend-e72d.onrender.com/api
 - Page never stays blank; shows saved copy / built-in text, then live data (one automatic reload when live data arrives)
 - Admin Page Content: collapsible sections, search, simple labels, sticky Save bar
 - Backend: safe CORS (localhost + srujaninfotech.com allowed), server listens first and retries MongoDB, /healthz, API cache 5s

HOW TO RUN LOCALLY
 backend : npm install ; npm run seed (first time) ; npm run dev     (http://localhost:5000/api/health)
 website : open with VS Code Live Server (index.html and admin/index.html)
 test    : change text in Admin > Page Content > Save > refresh website (Ctrl+Shift+R)
           Console must say: "SES: live content loaded from API"

DEPLOY
 Render env: NODE_ENV=production, MONGO_URI, JWT_SECRET, CLIENT_ORIGINS=https://ses.srujaninfotech.com, CLOUDINARY_*
 Atlas > Network Access > 0.0.0.0/0 ;  UptimeRobot ping https://ses-backend-e72d.onrender.com/api/health every 5 min
 NOTE: backend/.env contains real secrets - do not push it to GitHub; rotate the passwords if you already did.

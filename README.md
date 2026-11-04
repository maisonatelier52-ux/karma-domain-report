# Domain Report Manager

Next.js (App Router) + Tailwind CSS + Node.js API routes + MongoDB. Frontend and backend live in **one project**, so it deploys to Vercel as-is – there is no separate server and nothing runs on `localhost:5000`.

## Features
- Login (email `karama@gmail.com`, password `karma12345`)
- Add / edit / delete domains. Required: domain link, live or not, done by. Optional: client article links, Vercel, GitHub, Google Search Console links
- Search by domain name (e.g. `os-intel.com`) or by done-by name (shows a card for each domain that person did)
- Domain detail page with Open Graph image previews of each client article
- Download a report (PDF, Word, Excel) for one domain or all domains, with a checkbox for every field (all ticked by default)
- PDF and Word reports follow the layout of the "Day 1 Report" PDF

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
npm run seed         # optional: loads your 10 domains into MongoDB
```
The `.env` file is already filled in. Variables:

| Name | Purpose |
|------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Login credentials |
| `JWT_SECRET` | Signs the login cookie – use any long random string |

## Deploy to Vercel
1. **MongoDB Atlas → Network Access → Add IP address → Allow access from anywhere (`0.0.0.0/0`)**. Vercel uses changing IPs, so without this the app cannot reach the database.
2. Push the project to GitHub (the `.env` file is git-ignored) and import it in Vercel – or run `npx vercel` in this folder.
3. In Vercel → Project → Settings → Environment Variables add `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `JWT_SECRET` (same values as `.env`).
4. Deploy. All API calls use relative URLs (`/api/...`), so they work on any domain.

## Structure
```
app/api/*        backend (Node.js runtime): auth, domains CRUD, search, og image, report
app/(app)/*      dashboard, search, add, detail, edit pages
lib/reports/*    pdf.js, docx.js, xlsx.js report generators
lib/models/*     Mongoose model
middleware.js    protects all pages and APIs behind the login
```

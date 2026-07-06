# Melon Matrix CMS

The Melon Matrix website rebuilt as a **dynamic Node.js application** with a WordPress-style admin panel. The frontend design (layout, fonts, colors, animations, responsiveness) is identical to the original static site — it now renders from EJS templates backed by a MySQL database.

**Stack:** Node.js · Express.js · EJS (server-side rendering, SEO-friendly) · MySQL · express-session (MySQL-backed) · bcryptjs · Multer

---

## Features

### Public site
- All original pages: Home, About, Contact, Blog — pixel-identical design
- **Dynamic blog**: listing, single post page, category filtering, search, pagination, recent posts sidebar, related posts
- **Working contact form** — submissions stored in the database, visible in the admin
- **Newsletter subscribe** — footer + blog CTA forms store emails
- **SEO**: per-page/per-post meta title, description, keywords, canonical URL; Open Graph + Twitter cards; `sitemap.xml` (auto-generated); `robots.txt`; JSON-LD schema (Organization on home, BlogPosting on articles); SEO-friendly slugs

### Admin panel (`/admin`)
- Secure login (bcrypt password hashing, MySQL-backed sessions, login rate limiting)
- **Posts**: create, edit, delete; rich-text editor (Quill); save as draft or publish; featured image (upload or pick from media); category + tags; read time; full SEO fields per post
- **Categories & Tags**: create, rename, delete
- **Media library**: multi-upload images, copy URLs, delete
- **Pages**: edit the text content of Home / About / Contact / Blog pages + their SEO fields — no code needed
- **Settings**: site name, contact emails/phones, office addresses, social links — reflected across the site (footer, contact page, map section)
- **SMTP setup**: configure an outgoing mail server (host, port, SSL/STARTTLS, credentials, from name/email) from the admin — no `.env` editing needed. Includes a "Send test email" button and automatically emails you when a visitor submits the contact form (best-effort; never blocks the form if email fails)
- **Messages**: read/manage contact form submissions
- **Subscribers**: view/remove newsletter emails
- Dashboard with content stats

---

## Folder structure

```
melon-matrix-cms/
├── server.js              # App entry: middleware, sessions, routes
├── package.json
├── .env.example           # Copy to .env and fill in
├── config/
│   └── db.js              # MySQL connection pool
├── scripts/
│   └── setup.js           # Creates DB, tables, admin user, seeds content
├── middleware/
│   ├── auth.js            # requireAuth / guestOnly guards
│   └── locals.js          # Settings cache, flash messages, site URL
├── models/                # One module per table (plain SQL via mysql2)
├── controllers/           # Route handlers (site, blog, auth, admin)
├── routes/                # Express routers (site, blog, admin)
├── views/
│   ├── partials/          # head (SEO), navbar, footer, footer-map, icons
│   ├── site/              # home, about, contact, blog, post, 404
│   └── admin/             # dashboard, posts, media, pages, settings…
├── public/
│   ├── css/  styles.css (original) · extras.css (blog/post additions) · admin.css
│   ├── js/   script.js (original) · site.js · admin.js
│   └── assets/            # All original images
└── uploads/               # Admin-uploaded media (served at /uploads)
```

---

## Setup (local / Windows)

**Requirements:** Node.js 18+, MySQL 5.7+/8 (XAMPP, WAMP, or standalone MySQL all work).

```bash
cd melon-matrix-cms

# 1. Install dependencies
npm install

# 2. Configure environment
copy .env.example .env
#    Edit .env — set DB_PASSWORD (and DB_USER if not root),
#    a long random SESSION_SECRET, and your ADMIN_EMAIL / ADMIN_PASSWORD

# 3. Create database, tables, admin user + seed content
npm run setup

# 4. Run
npm run dev        # auto-restarts on file changes
# or: npm start
```

Open:
- Site → http://localhost:3000
- Admin → http://localhost:3000/admin (log in with ADMIN_EMAIL / ADMIN_PASSWORD from `.env`)

The setup script is safe to re-run; it only creates what's missing. It seeds the 10 blog posts from the original static site (4 case studies + 6 articles), all categories, and every page's editable text.

---

## Editing content (WordPress-style)

| What | Where |
|---|---|
| Write/edit/publish blog posts | Admin → **Posts** |
| Blog categories & tags | Admin → **Categories** / **Tags** |
| Upload images | Admin → **Media** (or directly in the post editor) |
| Page headlines, paragraphs, buttons, stats | Admin → **Pages** → pick a page |
| Page & post SEO (title/description/keywords/canonical) | **Pages** / **Posts** → SEO panel |
| Emails, phones, addresses, socials | Admin → **Settings** |
| Outgoing email (SMTP) | Admin → **Settings** → SMTP panel → Save, then **Send Test Email** |
| Contact form submissions | Admin → **Messages** |
| Newsletter emails | Admin → **Subscribers** |

Headings support light HTML (`<br />`, `<em>`, `<span class="text-red">`) so the design's italic/red emphasis is editable too.

### SMTP setup

Admin → **Settings** → *SMTP (outgoing email)*. Fill in your provider's details, tick **Enable SMTP**, save, then use **Send Test Email** to confirm it works before relying on it.

| Provider | Host | Port | SSL |
|---|---|---|---|
| Gmail (use an [App Password](https://myaccount.google.com/apppasswords), not your normal password) | `smtp.gmail.com` | 587 | off (STARTTLS) |
| Outlook / Microsoft 365 | `smtp.office365.com` | 587 | off (STARTTLS) |
| SendGrid | `smtp.sendgrid.net` | 587 | off (STARTTLS) |
| Mailgun | `smtp.mailgun.org` | 587 | off (STARTTLS) |
| Amazon SES | `email-smtp.<region>.amazonaws.com` | 587 | off (STARTTLS) |

Notes:
- Once saved, the password field always shows blank (it's never sent back to the browser) — leave it empty when re-saving other settings to keep the existing password, or type a new one to change it.
- When SMTP is enabled, every contact-form submission also emails a notification to the **Primary email** address (Settings → Contact). This is best-effort: if sending fails, the visitor's message is still saved and their form submission still succeeds.
- SMTP is optional — the site and admin work fully without it. Leave **Enable SMTP** off if you don't need outgoing email yet.

---

## Deployment (production)

1. **Server**: any Node host (VPS with Ubuntu, Railway, Render, cPanel with Node support…). Install Node 18+ and MySQL.
2. **Upload** the `melon-matrix-cms` folder (without `node_modules`), then `npm install --production`.
3. **.env** for production:
   ```
   NODE_ENV=production
   SITE_URL=https://yourdomain.com
   SESSION_SECRET=<long random string>
   DB_* = your production MySQL credentials
   ```
   `SITE_URL` matters — it's used in canonical URLs, OG tags, and sitemap.xml.
4. Run `npm run setup` once, then start with a process manager:
   ```bash
   npm i -g pm2
   pm2 start server.js --name melon-matrix
   pm2 save && pm2 startup
   ```
5. **Reverse proxy + HTTPS** (nginx example):
   ```nginx
   server {
     server_name yourdomain.com;
     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   ```
   Add TLS with certbot. `NODE_ENV=production` enables secure cookies and `trust proxy`.
6. **Back up** the MySQL database and the `uploads/` folder — that's all your content.

### Performance notes
- Static assets are served with 1-year cache headers in production.
- Settings are cached in memory (30s TTL) to avoid a query per request.
- For heavier traffic, put nginx in front for static files and/or add a CDN.

### Security notes
- Passwords hashed with bcrypt (cost 12); sessions stored in MySQL, `httpOnly` + `sameSite=lax` cookies, secure in production; login rate-limited (10 attempts / 15 min); admin area is `noindex` and disallowed in robots.txt.
- Uploads restricted to image MIME types, 8 MB max.
- The admin post editor stores HTML written by logged-in admins — treat admin accounts as trusted.
- The SMTP password is stored in the `settings` table like other config (not encrypted at rest) and is never re-sent to the browser after saving. Restrict database access accordingly, and prefer a provider App Password / API-key-as-password over your real account password.
- Suggested hardening if you add more users: CSRF tokens, 2FA, per-user roles.

---

## SEO reference

- `GET /sitemap.xml` — generated from pages + published posts + categories
- `GET /robots.txt` — allows all, blocks `/admin`, links the sitemap
- URLs: `/blog/my-post-slug`, `/blog/category/shopify`, `?q=` search results are `noindex`
- Every page/post outputs OG + Twitter card tags; posts add `BlogPosting` JSON-LD, home adds `Organization`

---

## Original static site

The original HTML files remain untouched one level up (`../index.html`, etc.). Once you're happy with the Node version in production, they can be archived.

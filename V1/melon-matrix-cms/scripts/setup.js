/**
 * One-time setup: creates the database, tables, the admin user,
 * default settings, editable page content, and seeds the blog with
 * the posts from the original static site.
 *
 * Safe to re-run: it only seeds data that doesn't exist yet.
 *
 *   npm run setup
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const DB_NAME = process.env.DB_NAME || "melon_matrix";

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("→ Creating database (if missing)…");
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.changeUser({ database: DB_NAME });

  console.log("→ Creating tables…");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(120) NOT NULL UNIQUE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      excerpt TEXT,
      content MEDIUMTEXT,
      featured_image VARCHAR(500) DEFAULT '',
      category_id INT NULL,
      status ENUM('draft','published') NOT NULL DEFAULT 'draft',
      read_time VARCHAR(20) DEFAULT '5 min',
      meta_title VARCHAR(255) DEFAULT '',
      meta_description VARCHAR(500) DEFAULT '',
      meta_keywords VARCHAR(500) DEFAULT '',
      canonical_url VARCHAR(500) DEFAULT '',
      published_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      INDEX idx_status_published (status, published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT fk_pt_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) DEFAULT '',
      mime_type VARCHAR(100) DEFAULT '',
      size INT DEFAULT 0,
      url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page_key VARCHAR(50) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      meta_title VARCHAR(255) DEFAULT '',
      meta_description VARCHAR(500) DEFAULT '',
      meta_keywords VARCHAR(500) DEFAULT '',
      canonical_url VARCHAR(500) DEFAULT '',
      content MEDIUMTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(190) NOT NULL,
      phone VARCHAR(50) DEFAULT '',
      company VARCHAR(150) DEFAULT '',
      service VARCHAR(100) DEFAULT '',
      budget VARCHAR(100) DEFAULT '',
      message TEXT,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // ---------- Admin user ----------
  const [users] = await conn.query("SELECT COUNT(*) AS n FROM users");
  if (!users[0].n) {
    const name = process.env.ADMIN_NAME || "Admin";
    const email = (process.env.ADMIN_EMAIL || "admin@melonmatrix.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const hash = await bcrypt.hash(password, 12);
    await conn.query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [name, email, hash]);
    console.log(`→ Admin user created: ${email} (password from ADMIN_PASSWORD in .env)`);
  } else {
    console.log("→ Admin user already exists, skipping.");
  }

  // ---------- Categories ----------
  const categories = [
    ["Case Study", "case-study"],
    ["Shopify", "shopify"],
    ["Marketing", "marketing"],
    ["SEO", "seo"],
    ["Growth", "growth"],
  ];
  await conn.query("INSERT IGNORE INTO categories (name, slug) VALUES ?", [categories]);
  const [catRows] = await conn.query("SELECT id, slug FROM categories");
  const cat = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  // ---------- Settings ----------
  const settings = {
    site_name: "Melon Matrix",
    tagline: "Performance Driven Digital Solutions",
    email_primary: "hello@melonmatrix.com",
    email_sales: "sales@melonmatrix.com",
    email_press: "press@melonmatrix.com",
    phone_primary: "+880 1842 909843",
    phone_secondary: "015-840-06977",
    address_canada: "77 City Centre Drive\nMississauga, ON L5B 1M5, Canada",
    address_bd: "New Circuit House Rd\nCox's Bazar-4700",
    main_office_phone: "(62) 1211 1121",
    main_office_email: "info@wecare.com",
    footer_about_text: "We help businesses grow through Shopify expertise, web development, and digital marketing.",
    working_hours: "Monday – Friday: 9:00 AM – 6:00 PM",
    facebook_url: "#",
    twitter_url: "#",
    instagram_url: "#",
    // SMTP (outgoing email) — disabled until configured from Admin → Settings.
    smtp_enabled: "0",
    smtp_host: "",
    smtp_port: "587",
    smtp_secure: "0",
    smtp_user: "",
    smtp_password: "",
    smtp_from_name: "",
    smtp_from_email: "",
    smtp_debug: "0",
  };
  await conn.query(
    "INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ?",
    [Object.entries(settings)]
  );

  // ---------- Pages (SEO + editable content) ----------
  const pages = [
    {
      key: "home",
      title: "Home",
      meta_title: "Melon Matrix — Performance Driven Digital Solutions",
      meta_description: "We build Shopify stores. Then we scale them. Performance-driven digital solutions for B2B brands.",
      content: {
        hero_eyebrow: "WE BUILD. YOU GROW.",
        hero_title: "Performance Driven <br />Digital Solutions.",
        hero_sub: "From strategy to execution, we help brands <br />grow smarter and scale faster.",
        hero_btn_primary: "Book A Quick Call",
        hero_btn_secondary: "Explore Solutions",
        trusted_text: "Trusted by 1,000+ businesses worldwide",
        driving_eyebrow: "B2B GROWTH. ENGINEERED.",
        driving_title: "Driving a Better Way of Doing Marketing to Help You <em>Succeed.</em>",
        driving_lead: "Growth solutions that transcend industry fluctuations— increasing your pipeline up to 45% at just a fourth of the in-house cost.",
        driving_btn: "Book A Quick Call",
        stat1_num: "45%", stat1_label: "MORE PIPELINE", stat1_desc: "Average increase for our clients",
        stat2_num: "75%", stat2_label: "LOWER IN-HOUSE EXECUTION COST", stat2_desc: "Save significantly without compromise",
        stat3_num: "50+", stat3_label: "B2B CLIENTS", stat3_desc: "Trusted by growth leaders across North America",
        services_title: "Our services",
        stories_eyebrow: "SHOPIFY, GROWTH ENGINE.",
        stories_title: "We build Shopify <br /><em>stories that scale.</em>",
        stories_lead: "Your Shopify Store Should Be a Revenue Machine - Not Just a Website. We design, develop, and optimize Shopify stores built for conversion, speed, and scalable growth.",
        stories_btn: "Book a Free Audit",
        systems_title: "Shopify Systems <br />Built for <em>Growth</em>",
        systems_lead: "Elevate your brand with a dedicated team of Shopify experts. From high-converting builds to ROI-driven marketing, we provide the technical edge and strategic insight needed to scale.",
        engine_title: "The Matrix <em>growth</em> engine",
        engine_lead: "Strategy, creative and optimization -built to grow your brand.",
        fix_title: "We Fix What's <span class=\"text-red\">Costing You Sales</span>",
        fix_text: "Small issues in your design or site structure can cost thousands in missed conversions. We audit your store to find what's holding shoppers back, then rebuild pages that guide them smoothly to checkout. The result is a faster, cleaner, and more profitable site you can measure in real results.",
        fix_btn: "Book an Assessment",
        pricing_title: "Maximize Your <br />Business <em>Impact</em>",
        pricing_lead: "Personalize your plan for custom solutions according to your business needs",
        case_eyebrow: "PROVEN RESULTS",
        case_title: "Case Study",
        case_lead: "Since 2017, we've helped B2B brands generate qualified pipeline, enter new markets, and scale growth with precision outreach.",
        case_lead2: "Explore a recent success story below.",
        case_btn: "View case study",
        testi_title: "What <span class=\"text-red\">Our Clients</span> Say",
        testi_lead: "Hear Directly Our Satisfied Partners",
        faq_title: "FAQ",
        faq_lead: "Dive into our success stories and see how we create impactful solutions for brands across industries.",
        trusted_title: "Trusted by our <br /><em>customers</em> &amp; partners",
        cta_title: "Get a free call",
        cta_text: "Personalize your plan for custom solutions according to your business needs",
        cta_btn: "Book an Assessment",
      },
    },
    {
      key: "about",
      title: "About Us",
      meta_title: "About Us — Melon Matrix",
      meta_description: "Melon Matrix is a performance-driven digital agency. Since 2017 we've helped B2B brands and Shopify merchants grow smarter and scale faster.",
      content: {
        hero_eyebrow: "ABOUT MELON MATRIX",
        hero_title: "We Build. <br /><em>You Grow.</em>",
        hero_sub: "A performance-driven digital agency helping brands grow smarter and scale faster since 2017.",
        story_eyebrow: "OUR STORY",
        story_title: "A growth partner, <br /><em>not a vendor.</em>",
        story_p1: "Melon Matrix started with a simple observation: most businesses don't need more tools or more traffic — they need a system. Strategy, creative, and optimization working together toward one number that matters: revenue.",
        story_p2: "Since 2017, we've built conversion-first Shopify storefronts, engineered full-funnel B2B campaigns, and helped brands enter new markets — from North America to EMEA. Our clients stay because we operate like an extension of their team, at a fraction of the in-house cost.",
        story_btn: "Book A Quick Call",
        stat1_num: "2017", stat1_label: "FOUNDED", stat1_desc: "Nearly a decade of shipping growth",
        stat2_num: "50+", stat2_label: "B2B CLIENTS", stat2_desc: "Trusted by growth leaders across North America",
        stat3_num: "1,000+", stat3_label: "BUSINESSES SERVED", stat3_desc: "Worldwide, across industries",
        stat4_num: "45%", stat4_label: "MORE PIPELINE", stat4_desc: "Average increase for our clients",
        values_title: "What we <em>stand for</em>",
        values_lead: "The principles behind every store we build and every campaign we run.",
        mission_title: "One Mission: <span class=\"text-red\">Measurable Growth</span>",
        mission_text: "We exist to turn websites into revenue machines. Whether it's a Shopify storefront, a B2B outbound engine, or a full-funnel marketing program, our job is the same — find what's holding growth back, fix it, and prove it with numbers you can see in your dashboard.",
        mission_btn: "Work With Us",
        team_title: "The people behind <em>the matrix</em>",
        team_lead: "A senior team of strategists, developers, and marketers — no hand-offs to juniors.",
        team1_name: "Team Member", team1_role: "Founder & CEO",
        team1_bio: "Sets the strategy behind every engagement and keeps the whole team pointed at one thing: client revenue.",
        team2_name: "Team Member", team2_role: "Head of Growth",
        team2_bio: "Owns performance marketing and outbound — the engine behind our clients' 45% average pipeline lift.",
        team3_name: "Team Member", team3_role: "Lead Shopify Developer",
        team3_bio: "Builds the conversion-first storefronts — fast, clean, and engineered to scale with the brand.",
        cta_title: "Get a free call",
        cta_text: "Personalize your plan for custom solutions according to your business needs",
        cta_btn: "Book an Assessment",
      },
    },
    {
      key: "contact",
      title: "Contact Us",
      meta_title: "Contact Us — Melon Matrix",
      meta_description: "Get in touch with Melon Matrix. Book a quick call, request a free audit, or visit our offices in Mississauga, Canada and Cox's Bazar, Bangladesh.",
      content: {
        hero_eyebrow: "GET IN TOUCH",
        hero_title: "Let's Talk About <br /><em>Your Growth.</em>",
        hero_sub: "Tell us where you are and where you want to be. We'll reply within one business day.",
        info_eyebrow: "WE BUILD. YOU GROW.",
        info_title: "Start the <em>conversation.</em>",
        info_lead: "Whether you need a Shopify store that converts, a full-funnel marketing engine, or a free audit of what's costing you sales — we're one message away.",
        form_title: "Book a quick call",
        form_intro: "Fill in the form and our team will get back to you with next steps.",
        hours_line2: "We respond within one business day.",
      },
    },
    {
      key: "blog",
      title: "Blog",
      meta_title: "Blog — Melon Matrix",
      meta_description: "Insights on Shopify, performance marketing, and B2B growth from the Melon Matrix team. Strategies, playbooks, and case breakdowns that scale.",
      content: {
        hero_eyebrow: "THE MATRIX BLOG",
        hero_title: "Insights That <br /><em>Drive Growth.</em>",
        hero_sub: "Playbooks, breakdowns, and strategies on Shopify, performance marketing, and scaling B2B brands.",
        cta_title: "Never miss a playbook",
        cta_text: "Get our latest growth insights delivered straight to your inbox.",
      },
    },
  ];

  for (const p of pages) {
    await conn.query(
      `INSERT IGNORE INTO pages (page_key, title, meta_title, meta_description, meta_keywords, canonical_url, content)
       VALUES (?, ?, ?, ?, '', '', ?)`,
      [p.key, p.title, p.meta_title, p.meta_description, JSON.stringify(p.content)]
    );
  }

  // ---------- Posts ----------
  const [postCount] = await conn.query("SELECT COUNT(*) AS n FROM posts");
  if (!postCount[0].n) {
    console.log("→ Seeding blog posts…");
    const posts = [
      {
        title: "AgentSense – Expanding into EMEA with Precision B2B Marketing",
        slug: "agentsense-emea-expansion",
        category: "case-study",
        image: "/assets/case_robot.png",
        read_time: "7 min",
        published_at: "2026-07-02 10:00:00",
        tags: "B2B, Outbound, EMEA",
        excerpt: "A targeted outbound system designed to unlock new-market pipeline with higher-quality conversations.",
        content: `<h2>The challenge</h2><p>AgentSense had strong product-market fit in North America but no reliable way to open conversations in EMEA. Cold lists produced noise, not pipeline, and the internal team was stretched thin.</p><h2>What we built</h2><p>We designed a precision outbound system: a tightly defined ICP, market-by-market messaging, and a multi-channel cadence that prioritized reply quality over raw volume.</p><h2>The results</h2><p>Within two quarters, AgentSense entered three new EMEA markets with a qualified pipeline and higher-quality conversations than any previous channel — all without adding headcount.</p><ul><li>New markets entered across EMEA</li><li>ICP-aligned outreach at scale</li><li>Higher conversion quality across the funnel</li></ul>`,
      },
      {
        title: "Northwind Retail – A Shopify Rebuild That Lifted Conversion 32%",
        slug: "northwind-retail-shopify-rebuild",
        category: "case-study",
        image: "/assets/dashboard.png",
        read_time: "6 min",
        published_at: "2026-06-28 10:00:00",
        tags: "Shopify, CRO",
        excerpt: "A conversion-first replatform that turned a slow storefront into a revenue machine in a single quarter.",
        content: `<h2>The challenge</h2><p>Northwind's legacy theme was slow, cluttered, and leaking revenue at every step of the funnel — especially on mobile, where most of their traffic lived.</p><h2>What we built</h2><p>A ground-up Shopify rebuild focused on speed, clarity, and mobile shopping. Every template was designed around a single question: does this help the shopper buy?</p><h2>The results</h2><p>Conversion rate jumped 32% in the first quarter after launch, page speed doubled, and the store hit record revenue two months running.</p>`,
      },
      {
        title: "Lumen Apparel – Seamless Migration to a Faster Storefront",
        slug: "lumen-apparel-migration",
        category: "case-study",
        image: "/assets/growth_engine.png",
        read_time: "5 min",
        published_at: "2026-06-20 10:00:00",
        tags: "Shopify, Migration",
        excerpt: "A full replatform from migration to launch that preserved SEO while slashing cart abandonment.",
        content: `<h2>The challenge</h2><p>Lumen Apparel needed to leave a legacy platform without losing years of SEO equity — and without a single day of downtime during their busiest season.</p><h2>What we built</h2><p>A meticulously planned migration: full URL mapping, redirects, structured data, and a rebuilt checkout flow designed to remove every point of friction.</p><h2>The results</h2><p>Zero downtime, preserved rankings, and a measurably faster storefront. Cart abandonment dropped and sales climbed from the first week after launch.</p>`,
      },
      {
        title: "Verde Goods – Full-Funnel Growth Built on Data",
        slug: "verde-goods-full-funnel-growth",
        category: "case-study",
        image: "/assets/robot.png",
        read_time: "8 min",
        published_at: "2026-06-13 10:00:00",
        tags: "Growth, Analytics",
        excerpt: "Strategy, creative, and optimization working as one system to drive record revenue and a brand that looks the part.",
        content: `<h2>The challenge</h2><p>Verde Goods had traffic but no system — disconnected campaigns, inconsistent creative, and no way to know what was actually driving revenue.</p><h2>What we built</h2><p>A full-funnel growth engine: unified tracking, a creative system aligned to the brand, and a testing program where every decision was backed by insight.</p><h2>The results</h2><p>Record revenue two months running and a brand that finally looks the part. Every dollar of spend is now accountable to pipeline.</p>`,
      },
      {
        title: "The Outbound System Behind a 45% Pipeline Lift",
        slug: "outbound-system-45-percent-pipeline",
        category: "marketing",
        image: "/assets/case_robot.png",
        read_time: "6 min",
        published_at: "2026-06-24 10:00:00",
        tags: "Outbound, B2B, Pipeline",
        excerpt: "How precision targeting and ICP-aligned outreach turned cold lists into qualified conversations for a B2B SaaS brand.",
        content: `<h2>Volume is not a strategy</h2><p>Most outbound fails because it optimizes for sends, not conversations. The fix starts with a ruthless definition of your ideal customer profile.</p><h2>The system</h2><p>Tight ICP, personalized first lines, multi-channel cadences, and a feedback loop between sales and marketing. Measure reply quality, not open rates.</p><h2>What to expect</h2><p>Applied consistently, this system has produced an average 45% pipeline lift across our B2B clients — at a fraction of the in-house cost.</p>`,
      },
      {
        title: "Migrating to Shopify Plus Without Losing a Sale",
        slug: "migrating-to-shopify-plus",
        category: "shopify",
        image: "/assets/growth_engine.png",
        read_time: "5 min",
        published_at: "2026-06-17 10:00:00",
        tags: "Shopify, Migration",
        excerpt: "A step-by-step playbook for seamless migration — preserving SEO, speed, and conversion through the switch.",
        content: `<h2>Plan the URL map first</h2><p>Every legacy URL needs a destination. Redirect maps are the single biggest factor in preserving SEO through a migration.</p><h2>Rebuild, don't copy</h2><p>A migration is the best moment you'll ever get to fix conversion problems. Audit the funnel before you rebuild it.</p><h2>Launch dark, then switch</h2><p>Run the new store in parallel, test everything with real orders, and cut over DNS during your quietest hour. Zero downtime is a planning outcome, not luck.</p>`,
      },
      {
        title: "Technical SEO for Shopify: The Checklist That Ranks",
        slug: "technical-seo-shopify-checklist",
        category: "seo",
        image: "/assets/robot.png",
        read_time: "7 min",
        published_at: "2026-06-09 10:00:00",
        tags: "SEO, Shopify",
        excerpt: "The under-the-hood fixes — speed, structure, and schema — that quietly move stores up the search results.",
        content: `<h2>Speed is a ranking factor</h2><p>Compress images, cut app bloat, and lazy-load below the fold. Most Shopify stores can halve their load time without touching design.</p><h2>Structure your data</h2><p>Product, review, and breadcrumb schema help search engines understand — and feature — your pages.</p><h2>Fix the crawl</h2><p>Collection filters, tag pages, and pagination create duplicate content by default. Canonical tags and a clean sitemap keep crawlers focused on pages that convert.</p>`,
      },
      {
        title: "CRO 101: Small Design Fixes, Big Revenue Gains",
        slug: "cro-101-design-fixes",
        category: "growth",
        image: "/assets/dashboard.png",
        read_time: "6 min",
        published_at: "2026-05-30 10:00:00",
        tags: "CRO, Design",
        excerpt: "Tiny issues in layout and structure can cost thousands. Here are the highest-leverage changes to test first.",
        content: `<h2>Start at checkout</h2><p>Errors, surprise costs, and forced account creation kill more revenue than any landing page ever will. Fix the end of the funnel first.</p><h2>Then the product page</h2><p>Above-the-fold clarity: what is it, why should I trust it, what happens when I click? Answer all three without scrolling.</p><h2>Test, don't guess</h2><p>Every change is a hypothesis. Small stores should run fewer, bigger tests — you need meaningful traffic per variant to learn anything real.</p>`,
      },
      {
        title: "Email & Automation Flows Every Store Should Run",
        slug: "email-automation-flows",
        category: "marketing",
        image: "/assets/case_robot.png",
        read_time: "5 min",
        published_at: "2026-05-21 10:00:00",
        tags: "Email, Automation",
        excerpt: "From welcome series to win-backs — the automated flows that recover revenue on autopilot.",
        content: `<h2>The big four</h2><p>Welcome series, abandoned cart, post-purchase, and win-back. These four flows typically drive 20–30% of email revenue on autopilot.</p><h2>Segment by intent</h2><p>A first-time browser and a repeat customer should never get the same message. Segmentation is where automation stops feeling automated.</p><h2>Measure per flow</h2><p>Track revenue per recipient, not open rates. Flows that don't pay for their place in the inbox get rewritten or retired.</p>`,
      },
      {
        title: "Building a Full-Funnel Growth Engine From Scratch",
        slug: "full-funnel-growth-engine",
        category: "growth",
        image: "/assets/growth_engine.png",
        read_time: "9 min",
        published_at: "2026-05-12 10:00:00",
        tags: "Growth, Strategy",
        excerpt: "Strategy, creative, and optimization working as one system — the framework behind our best client results.",
        content: `<h2>Discover</h2><p>Audit the funnel, the data, and the market. You cannot optimize what you haven't measured, and most growth problems are diagnosis problems.</p><h2>Create</h2><p>Design and build conversion-focused experiences that bring the strategy to life — storefronts, campaigns, and content that pull in one direction.</p><h2>Scale</h2><p>Optimize, test, and grow what works. Momentum becomes sustainable growth when every win is systematized instead of celebrated and forgotten.</p><h2>The outcomes</h2><ul><li>More visibility</li><li>Better conversions</li><li>Higher ROI</li></ul>`,
      },
    ];

    for (const p of posts) {
      const [result] = await conn.query(
        `INSERT INTO posts (title, slug, excerpt, content, featured_image, category_id, status, read_time,
          meta_title, meta_description, meta_keywords, canonical_url, published_at)
         VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, '', ?)`,
        [
          p.title, p.slug, p.excerpt, p.content, p.image, cat[p.category] || null, p.read_time,
          `${p.title} — Melon Matrix`, p.excerpt, p.tags.toLowerCase(), p.published_at,
        ]
      );
      // tags
      const names = p.tags.split(",").map((t) => t.trim()).filter(Boolean);
      for (const name of names) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        await conn.query("INSERT IGNORE INTO tags (name, slug) VALUES (?, ?)", [name, slug]);
        const [[tag]] = await conn.query("SELECT id FROM tags WHERE slug = ?", [slug]);
        await conn.query("INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", [result.insertId, tag.id]);
      }
    }
  } else {
    console.log("→ Posts already exist, skipping seed.");
  }

  await conn.end();
  console.log("\n✔ Setup complete.");
  console.log("  Start the site with:  npm run dev");
  console.log("  Admin panel:          /admin");
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});

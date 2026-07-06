const Page = require("../models/Page");
const Post = require("../models/Post");
const Category = require("../models/Category");
const Message = require("../models/Message");
const Subscriber = require("../models/Subscriber");
const Testimonial = require("../models/Testimonial");
const mailer = require("../utils/mailer");

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Build the meta object every page passes to the head partial.
function pageMeta(page, siteUrl, path) {
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || "",
    keywords: page.meta_keywords || "",
    canonical: page.canonical_url || `${siteUrl}${path}`,
    ogImage: `${siteUrl}/assets/logo.png`,
    ogType: "website",
  };
}

const servicePages = {
  "performance-marketing": {
    title: "Performance Marketing",
    meta_title: "Performance Marketing - Melon Matrix",
    meta_description: "ROI-focused paid media strategy, campaign management, creative testing, and conversion tracking for brands that need measurable growth.",
    meta_keywords: "performance marketing, paid media, PPC, campaign management",
    content: {
      hero_eyebrow: "PAID GROWTH, MEASURED.",
      hero_title: "Performance Marketing Built for <em>ROI.</em>",
      hero_sub: "We plan, launch, and optimize paid campaigns across the channels that matter, with clean tracking and creative testing tied to revenue.",
      hero_btn: "Plan My Campaigns",
      stat1_num: "ROI", stat1_label: "FIRST STRATEGY", stat1_desc: "Campaigns planned around measurable return",
      stat2_num: "A/B", stat2_label: "CREATIVE TESTING", stat2_desc: "Structured tests for offers, ads, and landing pages",
      stat3_num: "24/7", stat3_label: "TRACKING", stat3_desc: "Conversion data connected to decisions",
      stat4_num: "360", stat4_label: "FUNNEL VIEW", stat4_desc: "Traffic, landing pages, and follow-up aligned",
      why_eyebrow: "WHAT WE MANAGE",
      why_title: "Paid channels engineered to <em>perform.</em>",
      why_lead: "From strategy to optimization, we make paid traffic accountable to pipeline, sales, and profitable scale.",
      cards: [
        ["i-target", "Campaign Strategy", "Audience, offer, budget, and channel planning before a dollar is spent."],
        ["i-trending", "Paid Search & Social", "Launch and optimize campaigns across high-intent and discovery channels."],
        ["i-edit", "Creative Testing", "Structured ad, hook, and landing page tests to find what converts."],
        ["i-bar", "Reporting & Optimization", "Clear reporting rhythms and decisions based on performance data."]
      ],
      process_title: "A cleaner way to scale <em>paid growth.</em>",
      process_lead: "We connect the message, traffic source, landing page, and tracking so every campaign has a clear job.",
      pricing_title: "Performance Packages <br />Built to <em>Scale</em>",
      pricing_lead: "Paid media support for brands testing a channel, improving efficiency, or scaling aggressively.",
      case_title: "Traffic is useful only when it <em>converts.</em>",
      case_lead: "We pair campaigns with landing page feedback, tracking checks, and continuous optimization.",
      faq_title: "Performance Marketing <em>FAQs</em>",
      cta_title: "Ready to make paid traffic work harder?",
      cta_text: "Tell us your current channels, budget, and goals. We will map the next move.",
      cta_btn: "Book A Campaign Call"
    }
  },
  "marketing-automation": {
    title: "Marketing Automation",
    meta_title: "Marketing Automation - Melon Matrix",
    meta_description: "Automated email, CRM, lead nurturing, and lifecycle workflows that help brands convert and retain customers.",
    meta_keywords: "marketing automation, email automation, CRM automation, lead nurturing",
    content: {
      hero_eyebrow: "AUTOMATION THAT NURTURES.",
      hero_title: "Marketing Automation That Keeps <em>Moving.</em>",
      hero_sub: "We design automated workflows for leads, customers, and internal teams so every important moment gets the right follow-up.",
      hero_btn: "Build My Workflows",
      stat1_num: "24/7", stat1_label: "FOLLOW-UP", stat1_desc: "Automations working when your team is offline",
      stat2_num: "CRM", stat2_label: "CONNECTED", stat2_desc: "Lead and customer data routed correctly",
      stat3_num: "Email", stat3_label: "LIFECYCLES", stat3_desc: "Nurture, retention, and winback journeys",
      stat4_num: "Zero", stat4_label: "MANUAL CHASE", stat4_desc: "Fewer repeated tasks for your team",
      why_eyebrow: "WHAT WE AUTOMATE",
      why_title: "Workflows that turn interest into <em>action.</em>",
      why_lead: "We build the systems that catch leads, segment audiences, trigger messages, and keep your pipeline organized.",
      cards: [
        ["i-mail", "Email Journeys", "Welcome, nurture, cart, retention, and winback flows mapped around user intent."],
        ["i-settings", "CRM Automation", "Lead routing, tagging, scoring, and task creation for your sales process."],
        ["i-share", "Audience Segments", "Smarter lists based on behavior, source, lifecycle stage, and intent."],
        ["i-bar", "Flow Reporting", "Performance tracking so every automation can be improved over time."]
      ],
      process_title: "Automation with a clear <em>logic.</em>",
      process_lead: "We map the customer journey first, then build workflows that match real decisions and team handoffs.",
      pricing_title: "Automation Packages <br />Built to <em>Run</em>",
      pricing_lead: "From core email flows to CRM-connected lifecycle systems.",
      case_title: "Better timing creates better <em>conversion.</em>",
      case_lead: "Automation helps your brand respond faster, nurture longer, and keep fewer opportunities slipping away.",
      faq_title: "Marketing Automation <em>FAQs</em>",
      cta_title: "Ready to automate your follow-up?",
      cta_text: "Show us your current process and we will identify the workflows worth building first.",
      cta_btn: "Plan My Automations"
    }
  },
  "seo-organic-growth": {
    title: "SEO & Organic Growth",
    meta_title: "SEO & Organic Growth - Melon Matrix",
    meta_description: "Technical SEO, content strategy, and organic growth systems that help brands rank, earn trust, and compound traffic.",
    meta_keywords: "SEO, organic growth, technical SEO, content strategy",
    content: {
      hero_eyebrow: "ORGANIC GROWTH COMPOUNDS.",
      hero_title: "SEO Systems Built to <em>Compound.</em>",
      hero_sub: "We improve technical foundations, content structure, and search visibility so your website can earn better traffic over time.",
      hero_btn: "Audit My SEO",
      stat1_num: "Tech", stat1_label: "SEO FOUNDATION", stat1_desc: "Crawl, speed, metadata, schema, and structure",
      stat2_num: "Content", stat2_label: "ROADMAPS", stat2_desc: "Topics planned around demand and intent",
      stat3_num: "Rank", stat3_label: "TRACKING", stat3_desc: "Visibility measured across priority terms",
      stat4_num: "Long", stat4_label: "TERM VALUE", stat4_desc: "Work designed to compound beyond campaigns",
      why_eyebrow: "WHAT WE IMPROVE",
      why_title: "Rank higher with a stronger <em>foundation.</em>",
      why_lead: "SEO works best when technical health, content quality, and internal structure support the same strategy.",
      cards: [
        ["i-search", "SEO Audits", "Technical, content, and competitor audits that reveal the highest-leverage fixes."],
        ["i-settings", "Technical SEO", "Indexing, metadata, redirects, schema, page speed, and crawl improvements."],
        ["i-edit", "Content Strategy", "Keyword-informed content plans for service pages, blogs, and topical authority."],
        ["i-bar", "Rank Reporting", "Clear visibility tracking and monthly recommendations based on movement."]
      ],
      process_title: "Organic growth with <em>structure.</em>",
      process_lead: "We fix what blocks search engines, then build pages and content around clear search intent.",
      pricing_title: "SEO Packages <br />Built to <em>Compound</em>",
      pricing_lead: "SEO support for audits, technical cleanup, and ongoing organic growth.",
      case_title: "Search visibility needs both content and <em>clarity.</em>",
      case_lead: "We align page architecture, metadata, content, and internal links so each page has a stronger job.",
      faq_title: "SEO & Organic Growth <em>FAQs</em>",
      cta_title: "Ready to find your SEO gaps?",
      cta_text: "We will review your site structure, priority pages, and organic growth opportunities.",
      cta_btn: "Book An SEO Audit"
    }
  },
  "content-marketing": {
    title: "Content Marketing",
    meta_title: "Content Marketing - Melon Matrix",
    meta_description: "Content strategy, storytelling, blogs, case studies, and campaign assets that build trust and support sales.",
    meta_keywords: "content marketing, blog strategy, case studies, copywriting",
    content: {
      hero_eyebrow: "STORIES THAT SELL.",
      hero_title: "Content Marketing That Builds <em>Trust.</em>",
      hero_sub: "We create useful, conversion-aware content that explains your value, supports organic growth, and gives sales stronger proof.",
      hero_btn: "Plan My Content",
      stat1_num: "Blogs", stat1_label: "SEO CONTENT", stat1_desc: "Useful articles mapped to real search intent",
      stat2_num: "Cases", stat2_label: "PROOF ASSETS", stat2_desc: "Stories that make results easier to believe",
      stat3_num: "Copy", stat3_label: "CAMPAIGN READY", stat3_desc: "Content built for channels and landing pages",
      stat4_num: "Trust", stat4_label: "BUILT OVER TIME", stat4_desc: "A library that keeps working after publish",
      why_eyebrow: "WHAT WE CREATE",
      why_title: "Content that supports every stage of <em>growth.</em>",
      why_lead: "We turn expertise into clear assets your audience can find, understand, and act on.",
      cards: [
        ["i-edit", "Content Strategy", "Topic planning, editorial calendars, and content angles tied to business goals."],
        ["i-search", "SEO Articles", "Search-informed blog and guide content that can earn long-term traffic."],
        ["i-bar", "Case Studies", "Outcome-focused stories that give prospects confidence in your work."],
        ["i-share", "Campaign Assets", "Copy and content repurposed for email, social, ads, and landing pages."]
      ],
      process_title: "A practical content engine for <em>growth.</em>",
      process_lead: "We plan topics, write with intent, publish consistently, and keep improving what performs.",
      pricing_title: "Content Packages <br />Built to <em>Publish</em>",
      pricing_lead: "Support for strategy, monthly content production, and proof-building assets.",
      case_title: "Good content makes your expertise <em>visible.</em>",
      case_lead: "We help turn what your team knows into assets that educate buyers and support sales conversations.",
      faq_title: "Content Marketing <em>FAQs</em>",
      cta_title: "Ready to build your content engine?",
      cta_text: "Tell us your audience and offer. We will map the first content opportunities.",
      cta_btn: "Book A Content Call"
    }
  },
  "social-media-growth": {
    title: "Social Media Growth",
    meta_title: "Social Media Growth - Melon Matrix",
    meta_description: "Organic and paid social strategy, content planning, and growth systems for brands that need consistent visibility.",
    meta_keywords: "social media growth, social media marketing, organic social, paid social",
    content: {
      hero_eyebrow: "SOCIAL THAT SCALES.",
      hero_title: "Social Media Growth With <em>Strategy.</em>",
      hero_sub: "We plan and produce social content that keeps your brand visible, credible, and connected to the campaigns that drive growth.",
      hero_btn: "Grow My Social",
      stat1_num: "Plan", stat1_label: "CONTENT CALENDAR", stat1_desc: "Consistent posting around clear themes",
      stat2_num: "Reach", stat2_label: "ORGANIC + PAID", stat2_desc: "Visibility supported by smart distribution",
      stat3_num: "Brand", stat3_label: "CONSISTENCY", stat3_desc: "A sharper presence across channels",
      stat4_num: "Data", stat4_label: "INSIGHTS", stat4_desc: "Performance feedback for better content",
      why_eyebrow: "WHAT WE GROW",
      why_title: "A social presence people can <em>remember.</em>",
      why_lead: "We combine content systems, creative direction, and channel strategy so social becomes easier to sustain.",
      cards: [
        ["i-share", "Social Strategy", "Channel priorities, content pillars, cadence, and campaign alignment."],
        ["i-edit", "Content Planning", "Posts, hooks, captions, and creative concepts organized into a calendar."],
        ["i-trending", "Paid Social Support", "Boosted content and paid campaigns connected to landing pages and goals."],
        ["i-bar", "Performance Reviews", "Monthly insight on what to repeat, adjust, and stop doing."]
      ],
      process_title: "Consistent visibility without random <em>posting.</em>",
      process_lead: "We create a repeatable system around your audience, brand voice, proof, offers, and campaigns.",
      pricing_title: "Social Packages <br />Built to <em>Grow</em>",
      pricing_lead: "Social support for content planning, brand consistency, and paid amplification.",
      case_title: "Social works best when it has a <em>system.</em>",
      case_lead: "We build repeatable content pillars and campaign rhythms so each post supports a larger growth plan.",
      faq_title: "Social Media Growth <em>FAQs</em>",
      cta_title: "Ready to sharpen your social presence?",
      cta_text: "We will review your current channels and map the best growth rhythm.",
      cta_btn: "Book A Social Call"
    }
  },
  "brand-design-ui-ux": {
    title: "Brand Design & UI/UX",
    meta_title: "Brand Design & UI/UX - Melon Matrix",
    meta_description: "Brand identity, UI systems, and UX design for websites, apps, and digital products that need clarity and polish.",
    meta_keywords: "brand design, UI UX design, brand identity, product design",
    content: {
      hero_eyebrow: "DESIGN WITH CLARITY.",
      hero_title: "Brand Design &amp; UI/UX That Feels <em>Sharp.</em>",
      hero_sub: "We shape visual identity, interfaces, and user flows that make your brand easier to understand, trust, and use.",
      hero_btn: "Design My Brand",
      stat1_num: "Brand", stat1_label: "IDENTITY", stat1_desc: "Visual systems that feel coherent and usable",
      stat2_num: "UX", stat2_label: "FLOW", stat2_desc: "Journeys planned around real user decisions",
      stat3_num: "UI", stat3_label: "SYSTEMS", stat3_desc: "Reusable components for consistent experiences",
      stat4_num: "Launch", stat4_label: "READY FILES", stat4_desc: "Designs prepared for clean development handoff",
      why_eyebrow: "WHAT WE DESIGN",
      why_title: "Identity and interfaces that make action <em>obvious.</em>",
      why_lead: "Good design is not just visual polish. It helps users understand where they are, what matters, and what to do next.",
      cards: [
        ["i-pen", "Brand Identity", "Logos, color systems, typography, and visual direction for a stronger presence."],
        ["i-monitor", "UI Design", "Clean, responsive interfaces for websites, dashboards, tools, and landing pages."],
        ["i-target", "UX Strategy", "User flows, wireframes, and page structure designed around decisions."],
        ["i-grid", "Design Systems", "Reusable components and rules that keep future pages consistent."]
      ],
      process_title: "Design that moves from concept to <em>handoff.</em>",
      process_lead: "We clarify the brand, map the experience, design the interface, and prepare assets for build.",
      pricing_title: "Design Packages <br />Built for <em>Clarity</em>",
      pricing_lead: "Design support for brands, websites, interfaces, and product experiences.",
      case_title: "Better design reduces <em>friction.</em>",
      case_lead: "We focus on visual clarity, hierarchy, and interaction patterns that make the next step easy.",
      faq_title: "Brand Design & UI/UX <em>FAQs</em>",
      cta_title: "Ready for a sharper design system?",
      cta_text: "Tell us what you are building and we will map the identity or UX work needed.",
      cta_btn: "Book A Design Call"
    }
  }
};

function getServiceContent(pageKey, page) {
  const fallback = servicePages[pageKey];
  return {
    title: page?.title || fallback.title,
    meta_title: page?.meta_title || fallback.meta_title,
    meta_description: page?.meta_description || fallback.meta_description,
    meta_keywords: page?.meta_keywords || fallback.meta_keywords,
    canonical_url: page?.canonical_url || "",
    content: { ...fallback.content, ...(page?.content || {}) },
  };
}

exports.home = async (req, res, next) => {
  try {
    const page = await Page.findByKey("home");
    const meta = pageMeta(page, res.locals.siteUrl, "/");
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: res.locals.settings.site_name || "Melon Matrix",
      url: res.locals.siteUrl,
      logo: `${res.locals.siteUrl}/assets/logo.png`,
      email: res.locals.settings.email_primary || undefined,
      telephone: res.locals.settings.phone_primary || undefined,
    };
    const testimonials = await Testimonial.allByScope("home");
    res.render("site/home", { active: "home", content: page.content, meta, schema, testimonials });
  } catch (err) { next(err); }
};

exports.about = async (req, res, next) => {
  try {
    const page = await Page.findByKey("about");
    const meta = pageMeta(page, res.locals.siteUrl, "/about");
    res.render("site/about", { active: "about", content: page.content, meta, schema: null });
  } catch (err) { next(err); }
};

exports.contact = async (req, res, next) => {
  try {
    const page = await Page.findByKey("contact");
    const meta = pageMeta(page, res.locals.siteUrl, "/contact");
    res.render("site/contact", { active: "contact", content: page.content, meta, schema: null });
  } catch (err) { next(err); }
};

exports.shopify = async (req, res, next) => {
  try {
    const page = await Page.findByKey("shopify");
    const meta = pageMeta(page, res.locals.siteUrl, "/shopify");
    const testimonials = await Testimonial.allByScope("shopify");
    res.render("site/shopify", { active: "shopify", content: page.content, meta, schema: null, testimonials });
  } catch (err) { next(err); }
};

exports.webDesignDevelopment = async (req, res, next) => {
  try {
    const fallback = {
      title: "Web Design & Development",
      meta_title: "Web Design & Development - Melon Matrix",
      meta_description: "Conversion-focused web design and development for brands that need fast, polished, scalable websites.",
      meta_keywords: "web design, web development, website development, UI UX design",
      canonical_url: "",
      content: {},
    };
    const page = (await Page.findByKey("web-design-development")) || fallback;
    const meta = pageMeta(page, res.locals.siteUrl, "/web-design-development");
    res.render("site/web-design-development", { active: "web-design-development", content: page.content, meta, schema: null });
  } catch (err) { next(err); }
};

exports.servicePage = async (req, res, next) => {
  try {
    const pageKey = req.path.replace(/^\//, "");
    if (!servicePages[pageKey]) return next();
    const page = getServiceContent(pageKey, await Page.findByKey(pageKey));
    const meta = pageMeta(page, res.locals.siteUrl, `/${pageKey}`);
    res.render("site/service", { active: pageKey, content: page.content, meta, schema: null });
  } catch (err) { next(err); }
};

exports.contactSubmit = async (req, res) => {
  try {
    const { name = "", email = "", phone = "", company = "", service = "", budget = "", message = "" } = req.body;
    if (!name.trim() || !/.+@.+\..+/.test(email) || !message.trim()) {
      return res.status(422).json({ ok: false, error: "Please fill in your name, a valid email, and a message." });
    }
    const clean = {
      name: name.trim().slice(0, 150),
      email: email.trim().slice(0, 190),
      phone: phone.trim().slice(0, 50),
      company: company.trim().slice(0, 150),
      service: service.trim().slice(0, 100),
      budget: budget.trim().slice(0, 100),
      message: message.trim().slice(0, 5000),
    };
    await Message.create(clean);
    res.json({ ok: true });

    // Best-effort notification email — never blocks or fails the response to the visitor.
    const rows = [
      ["Name", clean.name],
      ["Email", clean.email],
      ["Phone", clean.phone],
      ["Company", clean.company],
      ["Service", clean.service],
      ["Budget", clean.budget],
    ].filter(([, v]) => v);
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nMessage:\n${clean.message}`;
    const html =
      `<h2>New contact form submission</h2>` +
      `<table cellpadding="6">${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`).join("")}</table>` +
      `<p><strong>Message:</strong><br />${escapeHtml(clean.message).replace(/\n/g, "<br />")}</p>`;
    mailer
      .sendMail({ subject: `New contact form submission — ${clean.name}`, text, html, replyTo: clean.email })
      .then((result) => {
        if (!result.sent) console.error("contact notification email failed:", result.reason);
      })
      .catch((err) => console.error("contact notification email failed:", err.message));
  } catch (err) {
    console.error("contactSubmit:", err);
    res.status(500).json({ ok: false, error: "Something went wrong. Please try again." });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    if (!/.+@.+\..+/.test(email)) {
      return res.status(422).json({ ok: false, error: "Please enter a valid email address." });
    }
    await Subscriber.create(email.slice(0, 190));
    res.json({ ok: true });
  } catch (err) {
    console.error("subscribe:", err);
    res.status(500).json({ ok: false, error: "Something went wrong. Please try again." });
  }
};

exports.sitemap = async (req, res, next) => {
  try {
    const siteUrl = res.locals.siteUrl;
    const staticUrls = [
      { loc: `${siteUrl}/`, priority: "1.0" },
      { loc: `${siteUrl}/shopify`, priority: "0.9" },
      { loc: `${siteUrl}/web-design-development`, priority: "0.9" },
      ...Object.keys(servicePages).map((slug) => ({ loc: `${siteUrl}/${slug}`, priority: "0.9" })),
      { loc: `${siteUrl}/about`, priority: "0.8" },
      { loc: `${siteUrl}/contact`, priority: "0.8" },
      { loc: `${siteUrl}/blog`, priority: "0.9" },
    ];
    const categories = await Category.allWithCounts();
    const posts = await Post.findPublished({ limit: 5000, offset: 0 });

    const urls = [
      ...staticUrls,
      ...categories
        .filter((c) => c.post_count > 0)
        .map((c) => ({ loc: `${siteUrl}/blog/category/${c.slug}`, priority: "0.6" })),
      ...posts.map((p) => ({
        loc: `${siteUrl}/blog/${p.slug}`,
        lastmod: (p.updated_at || p.published_at || new Date()).toISOString().slice(0, 10),
        priority: "0.7",
      })),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => {
          const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
          return `  <url><loc>${u.loc}</loc>${lastmod}<priority>${u.priority}</priority></url>`;
        })
        .join("\n") +
      `\n</urlset>`;

    res.type("application/xml").send(xml);
  } catch (err) { next(err); }
};

exports.robots = (req, res) => {
  res.type("text/plain").send(
    ["User-agent: *", "Disallow: /admin", "", `Sitemap: ${res.locals.siteUrl}/sitemap.xml`, ""].join("\n")
  );
};

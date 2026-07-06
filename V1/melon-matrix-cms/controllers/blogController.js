const path = require("path");
const ejs = require("ejs");
const Page = require("../models/Page");
const Post = require("../models/Post");
const Category = require("../models/Category");

const PER_PAGE = 9;

const CARDS_PARTIAL = path.join(__dirname, "..", "views", "site", "partials", "blog-cards.ejs");
const PAGINATION_PARTIAL = path.join(__dirname, "..", "views", "site", "partials", "blog-pagination.ejs");

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
}

function notFoundMeta(res) {
  return {
    title: "Page Not Found — Melon Matrix",
    description: "", keywords: "", canonical: "",
    ogImage: `${res.locals.siteUrl}/assets/logo.png`,
    ogType: "website", noindex: true,
  };
}

// Shared query: resolves the category, counts, current page and posts.
async function queryListing({ categorySlug, q, pageNum }) {
  let category = null;
  if (categorySlug) {
    category = await Category.findBySlug(categorySlug);
    if (!category) return { notFound: true };
  }

  const total = await Post.countPublished({ categorySlug, q });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, pageNum || 1), totalPages);
  const posts = await Post.findPublished({
    categorySlug,
    q,
    limit: PER_PAGE,
    offset: (current - 1) * PER_PAGE,
  });

  const basePath = categorySlug ? `/blog/category/${categorySlug}` : "/blog";
  return {
    category,
    posts,
    pagination: { current, totalPages, total, basePath, q: q || null },
  };
}

// Full page render (initial load / no-JS).
async function renderListing(req, res, next, { categorySlug = null } = {}) {
  try {
    const q = String(req.query.q || "").trim() || null;
    const pageNum = parseInt(req.query.page, 10) || 1;

    const data = await queryListing({ categorySlug, q, pageNum });
    if (data.notFound) return res.status(404).render("site/404", { active: null, meta: notFoundMeta(res) });

    const [pageRow, categories] = await Promise.all([Page.findByKey("blog"), Category.allWithCounts()]);
    const { category, posts, pagination } = data;

    const siteUrl = res.locals.siteUrl;
    let title = pageRow.meta_title || pageRow.title;
    if (category) title = `${category.name} — ${title}`;
    if (q) title = `Search: ${q} — ${title}`;

    const meta = {
      title,
      description: pageRow.meta_description || "",
      keywords: pageRow.meta_keywords || "",
      canonical: `${siteUrl}${pagination.basePath}${pagination.current > 1 ? `?page=${pagination.current}` : ""}`,
      ogImage: `${siteUrl}/assets/logo.png`,
      ogType: "website",
      noindex: Boolean(q),
    };

    res.render("site/blog", {
      active: "blog",
      content: pageRow.content,
      meta,
      schema: null,
      posts,
      categories,
      category,
      q,
      pagination,
    });
  } catch (err) { next(err); }
}

exports.index = (req, res, next) => renderListing(req, res, next, {});

exports.category = (req, res, next) => renderListing(req, res, next, { categorySlug: req.params.slug });

// JSON API: powers smooth (no-reload) category switching, search and pagination.
exports.apiPosts = async (req, res, next) => {
  try {
    const categorySlug = String(req.query.cat || "").trim() || null;
    const q = String(req.query.q || "").trim() || null;
    const pageNum = parseInt(req.query.page, 10) || 1;

    const data = await queryListing({ categorySlug, q, pageNum });
    if (data.notFound) return res.status(404).json({ ok: false, error: "Category not found." });

    const { category, posts, pagination } = data;
    const [gridHtml, paginationHtml] = await Promise.all([
      ejs.renderFile(CARDS_PARTIAL, { posts, fmtDate }),
      ejs.renderFile(PAGINATION_PARTIAL, { pagination }),
    ]);

    let note = "";
    if (q) {
      note = `${pagination.total} result${pagination.total === 1 ? "" : "s"} for “${q}”`;
      if (category) note += ` in ${category.name}`;
    }

    res.json({
      ok: true,
      gridHtml,
      paginationHtml,
      total: pagination.total,
      note,
      categorySlug: categorySlug || "",
      q: q || "",
      basePath: pagination.basePath,
      page: pagination.current,
    });
  } catch (err) { next(err); }
};

exports.single = async (req, res, next) => {
  try {
    const post = await Post.findBySlug(req.params.slug);
    if (!post) return res.status(404).render("site/404", { active: null, meta: notFoundMeta(res) });

    const [related, recent, categories, tags] = await Promise.all([
      Post.findRelated(post.category_id, post.id, 3),
      Post.findRecent(4, post.id),
      Category.allWithCounts(),
      Post.getTags(post.id),
    ]);

    const siteUrl = res.locals.siteUrl;
    const image = post.featured_image
      ? (post.featured_image.startsWith("http") ? post.featured_image : `${siteUrl}${post.featured_image}`)
      : `${siteUrl}/assets/logo.png`;

    const meta = {
      title: post.meta_title || `${post.title} — ${res.locals.settings.site_name || "Melon Matrix"}`,
      description: post.meta_description || post.excerpt || "",
      keywords: post.meta_keywords || "",
      canonical: post.canonical_url || `${siteUrl}/blog/${post.slug}`,
      ogImage: image,
      ogType: "article",
    };

    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: meta.description,
      image: [image],
      datePublished: post.published_at ? new Date(post.published_at).toISOString() : undefined,
      dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` },
      author: { "@type": "Organization", name: res.locals.settings.site_name || "Melon Matrix" },
      publisher: {
        "@type": "Organization",
        name: res.locals.settings.site_name || "Melon Matrix",
        logo: { "@type": "ImageObject", url: `${siteUrl}/assets/logo.png` },
      },
    };

    res.render("site/post", { active: "blog", meta, schema, post, related, recent, categories, tags });
  } catch (err) { next(err); }
};

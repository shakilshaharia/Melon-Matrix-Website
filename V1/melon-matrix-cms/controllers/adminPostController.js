const Post = require("../models/Post");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Media = require("../models/Media");

function flash(req, type, text) {
  req.session.flash = { type, text };
}

// ---------- Posts ----------

exports.list = async (req, res, next) => {
  try {
    const status = ["draft", "published"].includes(req.query.status) ? req.query.status : null;
    const q = String(req.query.q || "").trim() || null;
    const [posts, counts] = await Promise.all([Post.adminList({ status, q }), Post.counts()]);
    res.render("admin/posts", { title: "Posts", nav: "posts", posts, counts, status, q });
  } catch (err) { next(err); }
};

exports.createForm = async (req, res, next) => {
  try {
    const [categories, media] = await Promise.all([Category.all(), Media.all()]);
    res.render("admin/post-form", {
      title: "New Post",
      nav: "posts",
      post: {
        id: null, title: "", slug: "", excerpt: "", content: "", featured_image: "",
        category_id: null, status: "draft", read_time: "5 min",
        meta_title: "", meta_description: "", meta_keywords: "", canonical_url: "",
      },
      postTags: [],
      categories,
      media,
    });
  } catch (err) { next(err); }
};

exports.editForm = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      flash(req, "error", "Post not found.");
      return res.redirect("/admin/posts");
    }
    const [categories, media, postTags] = await Promise.all([Category.all(), Media.all(), Post.getTags(post.id)]);
    res.render("admin/post-form", { title: "Edit Post", nav: "posts", post, postTags, categories, media });
  } catch (err) { next(err); }
};

async function collectPostData(req, existing = null) {
  const body = req.body;
  const title = String(body.title || "").trim();

  // Slug: user-provided > existing > from title. Always unique.
  const requestedSlug = String(body.slug || "").trim() || (existing ? existing.slug : "") || title;
  const slug = await Post.uniqueSlug(requestedSlug, existing ? existing.id : 0);

  // Publish action comes from which submit button was pressed.
  const status = body.action === "publish" ? "published" : "draft";

  // Preserve the original publish date when re-saving a published post.
  let published_at = existing ? existing.published_at : null;
  if (status === "published" && !published_at) published_at = new Date();
  if (status === "draft") published_at = existing ? existing.published_at : null;

  // Featured image: a fresh upload wins, otherwise keep the value in the hidden field
  // (set by the media picker), which may also be cleared.
  let featured_image = String(body.featured_image || "").trim();
  if (req.file) {
    featured_image = `/uploads/${req.file.filename}`;
    await Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size: req.file.size,
      url: featured_image,
    });
  }

  return {
    title,
    slug,
    excerpt: String(body.excerpt || "").trim(),
    content: String(body.content || ""),
    featured_image,
    category_id: body.category_id ? Number(body.category_id) : null,
    status,
    read_time: String(body.read_time || "5 min").trim().slice(0, 20),
    meta_title: String(body.meta_title || "").trim().slice(0, 255),
    meta_description: String(body.meta_description || "").trim().slice(0, 500),
    meta_keywords: String(body.meta_keywords || "").trim().slice(0, 500),
    canonical_url: String(body.canonical_url || "").trim().slice(0, 500),
    published_at,
  };
}

exports.create = async (req, res, next) => {
  try {
    if (!String(req.body.title || "").trim()) {
      flash(req, "error", "A title is required.");
      return res.redirect("/admin/posts/new");
    }
    const data = await collectPostData(req);
    const id = await Post.create(data);
    const tagIds = await Tag.findOrCreateMany(req.body.tags);
    await Post.setTags(id, tagIds);
    flash(req, "success", data.status === "published" ? "Post published." : "Draft saved.");
    res.redirect(`/admin/posts/${id}/edit`);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await Post.findById(req.params.id);
    if (!existing) {
      flash(req, "error", "Post not found.");
      return res.redirect("/admin/posts");
    }
    if (!String(req.body.title || "").trim()) {
      flash(req, "error", "A title is required.");
      return res.redirect(`/admin/posts/${existing.id}/edit`);
    }
    const data = await collectPostData(req, existing);
    await Post.update(existing.id, data);
    const tagIds = await Tag.findOrCreateMany(req.body.tags);
    await Post.setTags(existing.id, tagIds);
    flash(req, "success", data.status === "published" ? "Post published." : "Draft saved.");
    res.redirect(`/admin/posts/${existing.id}/edit`);
  } catch (err) { next(err); }
};

exports.destroy = async (req, res, next) => {
  try {
    await Post.remove(req.params.id);
    flash(req, "success", "Post deleted.");
    res.redirect("/admin/posts");
  } catch (err) { next(err); }
};

// ---------- Categories ----------

exports.categories = async (req, res, next) => {
  try {
    const categories = await Category.allWithCounts();
    res.render("admin/categories", { title: "Categories", nav: "categories", categories });
  } catch (err) { next(err); }
};

exports.categoryCreate = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (name) {
      await Category.create(name);
      flash(req, "success", "Category added.");
    }
    res.redirect("/admin/categories");
  } catch (err) { next(err); }
};

exports.categoryUpdate = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (name) {
      await Category.update(req.params.id, name);
      flash(req, "success", "Category updated.");
    }
    res.redirect("/admin/categories");
  } catch (err) { next(err); }
};

exports.categoryDestroy = async (req, res, next) => {
  try {
    await Category.remove(req.params.id);
    flash(req, "success", "Category deleted. Its posts are now uncategorized.");
    res.redirect("/admin/categories");
  } catch (err) { next(err); }
};

// ---------- Tags ----------

exports.tags = async (req, res, next) => {
  try {
    const tags = await Tag.all();
    res.render("admin/tags", { title: "Tags", nav: "tags", tags });
  } catch (err) { next(err); }
};

exports.tagCreate = async (req, res, next) => {
  try {
    await Tag.findOrCreateMany(req.body.name);
    flash(req, "success", "Tag added.");
    res.redirect("/admin/tags");
  } catch (err) { next(err); }
};

exports.tagDestroy = async (req, res, next) => {
  try {
    await Tag.remove(req.params.id);
    flash(req, "success", "Tag deleted.");
    res.redirect("/admin/tags");
  } catch (err) { next(err); }
};

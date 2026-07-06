const db = require("../config/db");
const slugify = require("../utils/slugify");

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM posts p
  LEFT JOIN categories c ON c.id = p.category_id
`;

function buildPublicWhere({ categorySlug, q }) {
  const where = ["p.status = 'published'"];
  const params = [];
  if (categorySlug) {
    where.push("c.slug = ?");
    params.push(categorySlug);
  }
  if (q) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  return { clause: "WHERE " + where.join(" AND "), params };
}

const Post = {
  async findPublished({ categorySlug = null, q = null, limit = 9, offset = 0 } = {}) {
    const { clause, params } = buildPublicWhere({ categorySlug, q });
    const [rows] = await db.query(
      `${BASE_SELECT} ${clause} ORDER BY p.published_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    return rows;
  },

  async countPublished({ categorySlug = null, q = null } = {}) {
    const { clause, params } = buildPublicWhere({ categorySlug, q });
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM posts p LEFT JOIN categories c ON c.id = p.category_id ${clause}`,
      params
    );
    return rows[0].total;
  },

  async findBySlug(slug, { publishedOnly = true } = {}) {
    const extra = publishedOnly ? "AND p.status = 'published'" : "";
    const [rows] = await db.query(`${BASE_SELECT} WHERE p.slug = ? ${extra} LIMIT 1`, [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(`${BASE_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findRelated(categoryId, excludeId, limit = 3) {
    if (categoryId) {
      const [rows] = await db.query(
        `${BASE_SELECT} WHERE p.status = 'published' AND p.category_id = ? AND p.id != ?
         ORDER BY p.published_at DESC LIMIT ?`,
        [categoryId, excludeId, Number(limit)]
      );
      if (rows.length) return rows;
    }
    const [fallback] = await db.query(
      `${BASE_SELECT} WHERE p.status = 'published' AND p.id != ? ORDER BY p.published_at DESC LIMIT ?`,
      [excludeId, Number(limit)]
    );
    return fallback;
  },

  async findRecent(limit = 5, excludeId = 0) {
    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.status = 'published' AND p.id != ? ORDER BY p.published_at DESC LIMIT ?`,
      [excludeId, Number(limit)]
    );
    return rows;
  },

  async adminList({ status = null, q = null, categoryId = null } = {}) {
    const where = [];
    const params = [];
    if (status) { where.push("p.status = ?"); params.push(status); }
    if (categoryId) { where.push("p.category_id = ?"); params.push(categoryId); }
    if (q) { where.push("p.title LIKE ?"); params.push(`%${q}%`); }
    const clause = where.length ? "WHERE " + where.join(" AND ") : "";
    const [rows] = await db.query(
      `${BASE_SELECT} ${clause} ORDER BY p.updated_at DESC, p.id DESC`,
      params
    );
    return rows;
  },

  async counts() {
    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'published') AS published,
         SUM(status = 'draft') AS draft
       FROM posts`
    );
    return rows[0];
  },

  // Generate a slug that is unique in the posts table.
  async uniqueSlug(base, excludeId = 0) {
    let slug = slugify(base) || "post";
    let candidate = slug;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [rows] = await db.query("SELECT id FROM posts WHERE slug = ? AND id != ? LIMIT 1", [candidate, excludeId]);
      if (!rows.length) return candidate;
      n += 1;
      candidate = `${slug}-${n}`;
    }
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO posts
        (title, slug, excerpt, content, featured_image, category_id, status, read_time,
         meta_title, meta_description, meta_keywords, canonical_url, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title, data.slug, data.excerpt, data.content, data.featured_image,
        data.category_id, data.status, data.read_time,
        data.meta_title, data.meta_description, data.meta_keywords, data.canonical_url,
        data.published_at,
      ]
    );
    return result.insertId;
  },

  async update(id, data) {
    await db.query(
      `UPDATE posts SET
         title = ?, slug = ?, excerpt = ?, content = ?, featured_image = ?, category_id = ?,
         status = ?, read_time = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
         canonical_url = ?, published_at = ?
       WHERE id = ?`,
      [
        data.title, data.slug, data.excerpt, data.content, data.featured_image,
        data.category_id, data.status, data.read_time,
        data.meta_title, data.meta_description, data.meta_keywords, data.canonical_url,
        data.published_at, id,
      ]
    );
  },

  async remove(id) {
    await db.query("DELETE FROM posts WHERE id = ?", [id]);
  },

  async setTags(postId, tagIds) {
    await db.query("DELETE FROM post_tags WHERE post_id = ?", [postId]);
    if (tagIds.length) {
      const values = tagIds.map((tagId) => [postId, tagId]);
      await db.query("INSERT INTO post_tags (post_id, tag_id) VALUES ?", [values]);
    }
  },

  async getTags(postId) {
    const [rows] = await db.query(
      `SELECT t.* FROM tags t JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ? ORDER BY t.name`,
      [postId]
    );
    return rows;
  },
};

module.exports = Post;

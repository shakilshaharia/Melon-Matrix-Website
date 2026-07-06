// Turn any string into a URL-safe slug: "Shopify & CRO Tips!" -> "shopify-cro-tips"
function slugify(str) {
  return String(str || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 190);
}

module.exports = slugify;

const express = require("express");
const router = express.Router();
const site = require("../controllers/siteController");

router.get("/", site.home);
router.get("/shopify", site.shopify);
router.get("/web-design-development", site.webDesignDevelopment);
router.get("/performance-marketing", site.servicePage);
router.get("/marketing-automation", site.servicePage);
router.get("/seo-organic-growth", site.servicePage);
router.get("/content-marketing", site.servicePage);
router.get("/social-media-growth", site.servicePage);
router.get("/brand-design-ui-ux", site.servicePage);
router.get("/about", site.about);
router.get("/contact", site.contact);
router.post("/contact", site.contactSubmit);
router.post("/subscribe", site.subscribe);
router.get("/sitemap.xml", site.sitemap);
router.get("/robots.txt", site.robots);

module.exports = router;

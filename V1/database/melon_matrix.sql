-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: melon_matrix
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `melon_matrix`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `melon_matrix` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `melon_matrix`;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Case Study','case-study'),(2,'Shopify','shopify'),(3,'Marketing','marketing'),(4,'SEO','seo'),(5,'Growth','growth');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(50) DEFAULT '',
  `company` varchar(150) DEFAULT '',
  `service` varchar(100) DEFAULT '',
  `budget` varchar(100) DEFAULT '',
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT '',
  `mime_type` varchar(100) DEFAULT '',
  `size` int DEFAULT '0',
  `url` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (1,'p1.jpg','p1.jpg','image/jpeg',6948,'/assets/avatars/p1.jpg','2026-07-06 21:09:08'),(2,'p2.jpg','p2.jpg','image/jpeg',5242,'/assets/avatars/p2.jpg','2026-07-06 21:09:08'),(3,'p3.jpg','p3.jpg','image/jpeg',3539,'/assets/avatars/p3.jpg','2026-07-06 21:09:08'),(4,'case_robot.png','case_robot.png','image/png',2327441,'/assets/case_robot.png','2026-07-06 21:09:08'),(5,'client-2.svg','client-2.svg','image/svg+xml',63265,'/assets/clients/client-2.svg','2026-07-06 21:09:08'),(6,'client-5.webp','client-5.webp','image/webp',2494,'/assets/clients/client-5.webp','2026-07-06 21:09:08'),(7,'w-1.png','w-1.png','image/png',13789,'/assets/clients/w-1.png','2026-07-06 21:09:08'),(8,'w-10.png','w-10.png','image/png',2719,'/assets/clients/w-10.png','2026-07-06 21:09:08'),(9,'w-12.png','w-12.png','image/png',3327,'/assets/clients/w-12.png','2026-07-06 21:09:08'),(10,'w-14.png','w-14.png','image/png',9012,'/assets/clients/w-14.png','2026-07-06 21:09:08'),(11,'w-17.png','w-17.png','image/png',12360,'/assets/clients/w-17.png','2026-07-06 21:09:08'),(12,'w-18.png','w-18.png','image/png',21762,'/assets/clients/w-18.png','2026-07-06 21:09:09'),(13,'w-19.png','w-19.png','image/png',18960,'/assets/clients/w-19.png','2026-07-06 21:09:09'),(14,'w-3.png','w-3.png','image/png',4312,'/assets/clients/w-3.png','2026-07-06 21:09:09'),(15,'w-4.png','w-4.png','image/png',6178,'/assets/clients/w-4.png','2026-07-06 21:09:09'),(16,'w-6.png','w-6.png','image/png',4644,'/assets/clients/w-6.png','2026-07-06 21:09:09'),(17,'dashboard.png','dashboard.png','image/png',1055473,'/assets/dashboard.png','2026-07-06 21:09:09'),(18,'growth_engine.png','growth_engine.png','image/png',131222,'/assets/growth_engine.png','2026-07-06 21:09:09'),(19,'logo.png','logo.png','image/png',11353,'/assets/logo.png','2026-07-06 21:09:09'),(20,'logo_white.png','logo_white.png','image/png',11262,'/assets/logo_white.png','2026-07-06 21:09:09'),(21,'robot.png','robot.png','image/png',413559,'/assets/robot.png','2026-07-06 21:09:09'),(22,'shopify.png','shopify.png','image/png',43252,'/assets/shopify.png','2026-07-06 21:09:09'),(23,'t-10.png','t-10.png','image/png',12548,'/assets/trusted/t-10.png','2026-07-06 21:09:09'),(24,'t-11.png','t-11.png','image/png',5491,'/assets/trusted/t-11.png','2026-07-06 21:09:09'),(25,'t-12.png','t-12.png','image/png',9162,'/assets/trusted/t-12.png','2026-07-06 21:09:09'),(26,'t-14.png','t-14.png','image/png',23220,'/assets/trusted/t-14.png','2026-07-06 21:09:09'),(27,'t-15.png','t-15.png','image/png',35269,'/assets/trusted/t-15.png','2026-07-06 21:09:09'),(28,'t-16.png','t-16.png','image/png',36565,'/assets/trusted/t-16.png','2026-07-06 21:09:09'),(29,'t-17.png','t-17.png','image/png',26908,'/assets/trusted/t-17.png','2026-07-06 21:09:09'),(30,'t-18.png','t-18.png','image/png',59470,'/assets/trusted/t-18.png','2026-07-06 21:09:09'),(31,'t-19.png','t-19.png','image/png',17813,'/assets/trusted/t-19.png','2026-07-06 21:09:09'),(32,'t-2.svg','t-2.svg','image/svg+xml',63265,'/assets/trusted/t-2.svg','2026-07-06 21:09:09'),(33,'t-3.png','t-3.png','image/png',9560,'/assets/trusted/t-3.png','2026-07-06 21:09:09'),(34,'t-5.webp','t-5.webp','image/webp',2494,'/assets/trusted/t-5.webp','2026-07-06 21:09:09'),(35,'t-6.png','t-6.png','image/png',4948,'/assets/trusted/t-6.png','2026-07-06 21:09:09'),(36,'t-7.png','t-7.png','image/png',7985,'/assets/trusted/t-7.png','2026-07-06 21:09:09'),(37,'t-9.png','t-9.png','image/png',5471,'/assets/trusted/t-9.png','2026-07-06 21:09:09');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_key` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `meta_title` varchar(255) DEFAULT '',
  `meta_description` varchar(500) DEFAULT '',
  `meta_keywords` varchar(500) DEFAULT '',
  `canonical_url` varchar(500) DEFAULT '',
  `content` mediumtext,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_key` (`page_key`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'home','Home','Melon Matrix — Performance Driven Digital Solutions','We build Shopify stores. Then we scale them. Performance-driven digital solutions for B2B brands.','','','{\"hero_eyebrow\":\"WE BUILD. YOU GROW.\",\"hero_title\":\"Performance Driven <br />Digital Solutions.\",\"hero_sub\":\"From strategy to execution, we help brands <br />grow smarter and scale faster.\",\"hero_btn_primary\":\"Book A Quick Call\",\"hero_btn_secondary\":\"Explore Solutions\",\"trusted_text\":\"Trusted by 1,000+ businesses worldwide\",\"driving_eyebrow\":\"B2B GROWTH. ENGINEERED.\",\"driving_title\":\"Driving a Better Way of Doing Marketing to Help You <em>Succeed.</em>\",\"driving_lead\":\"Growth solutions that transcend industry fluctuations— increasing your pipeline up to 45% at just a fourth of the in-house cost.\",\"driving_btn\":\"Book A Quick Call\",\"stat1_num\":\"45%\",\"stat1_label\":\"MORE PIPELINE\",\"stat1_desc\":\"Average increase for our clients\",\"stat2_num\":\"75%\",\"stat2_label\":\"LOWER IN-HOUSE EXECUTION COST\",\"stat2_desc\":\"Save significantly without compromise\",\"stat3_num\":\"50+\",\"stat3_label\":\"B2B CLIENTS\",\"stat3_desc\":\"Trusted by growth leaders across North America\",\"services_title\":\"Our services\",\"stories_eyebrow\":\"SHOPIFY, GROWTH ENGINE.\",\"stories_title\":\"We build Shopify <br /><em>stories that scale.</em>\",\"stories_lead\":\"Your Shopify Store Should Be a Revenue Machine - Not Just a Website. We design, develop, and optimize Shopify stores built for conversion, speed, and scalable growth.\",\"stories_btn\":\"Book a Free Audit\",\"systems_title\":\"Shopify Systems <br />Built for <em>Growth</em>\",\"systems_lead\":\"Elevate your brand with a dedicated team of Shopify experts. From high-converting builds to ROI-driven marketing, we provide the technical edge and strategic insight needed to scale.\",\"engine_title\":\"The Matrix <em>growth</em> engine\",\"engine_lead\":\"Strategy, creative and optimization -built to grow your brand.\",\"fix_title\":\"We Fix What\'s <span class=\\\"text-red\\\">Costing You Sales</span>\",\"fix_text\":\"Small issues in your design or site structure can cost thousands in missed conversions. We audit your store to find what\'s holding shoppers back, then rebuild pages that guide them smoothly to checkout. The result is a faster, cleaner, and more profitable site you can measure in real results.\",\"fix_btn\":\"Book an Assessment\",\"pricing_title\":\"Maximize Your <br />Business <em>Impact</em>\",\"pricing_lead\":\"Personalize your plan for custom solutions according to your business needs\",\"case_eyebrow\":\"PROVEN RESULTS\",\"case_title\":\"Case Study\",\"case_lead\":\"Since 2017, we\'ve helped B2B brands generate qualified pipeline, enter new markets, and scale growth with precision outreach.\",\"case_lead2\":\"Explore a recent success story below.\",\"case_btn\":\"View case study\",\"testi_title\":\"What <span class=\\\"text-red\\\">Our Clients</span> Say\",\"testi_lead\":\"Hear Directly Our Satisfied Partners\",\"faq_title\":\"FAQ\",\"faq_lead\":\"Dive into our success stories and see how we create impactful solutions for brands across industries.\",\"trusted_title\":\"Trusted by our <br /><em>customers</em> &amp; partners\",\"cta_title\":\"Get a free call\",\"cta_text\":\"Personalize your plan for custom solutions according to your business needs\",\"cta_btn\":\"Book an Assessment\"}','2026-07-06 19:28:50'),(2,'about','About Us','About Us — Melon Matrix','Melon Matrix is a performance-driven digital agency. Since 2017 we\'ve helped B2B brands and Shopify merchants grow smarter and scale faster.','','','{\"hero_eyebrow\":\"ABOUT MELON MATRIX\",\"hero_title\":\"We Build. <br /><em>You Grow.</em>\",\"hero_sub\":\"A performance-driven digital agency helping brands grow smarter and scale faster since 2017.\",\"story_eyebrow\":\"OUR STORY\",\"story_title\":\"A growth partner, <br /><em>not a vendor.</em>\",\"story_p1\":\"Melon Matrix started with a simple observation: most businesses don\'t need more tools or more traffic — they need a system. Strategy, creative, and optimization working together toward one number that matters: revenue.\",\"story_p2\":\"Since 2017, we\'ve built conversion-first Shopify storefronts, engineered full-funnel B2B campaigns, and helped brands enter new markets — from North America to EMEA. Our clients stay because we operate like an extension of their team, at a fraction of the in-house cost.\",\"story_btn\":\"Book A Quick Call\",\"stat1_num\":\"2017\",\"stat1_label\":\"FOUNDED\",\"stat1_desc\":\"Nearly a decade of shipping growth\",\"stat2_num\":\"50+\",\"stat2_label\":\"B2B CLIENTS\",\"stat2_desc\":\"Trusted by growth leaders across North America\",\"stat3_num\":\"1,000+\",\"stat3_label\":\"BUSINESSES SERVED\",\"stat3_desc\":\"Worldwide, across industries\",\"stat4_num\":\"45%\",\"stat4_label\":\"MORE PIPELINE\",\"stat4_desc\":\"Average increase for our clients\",\"values_title\":\"What we <em>stand for</em>\",\"values_lead\":\"The principles behind every store we build and every campaign we run.\",\"mission_title\":\"One Mission: <span class=\\\"text-red\\\">Measurable Growth</span>\",\"mission_text\":\"We exist to turn websites into revenue machines. Whether it\'s a Shopify storefront, a B2B outbound engine, or a full-funnel marketing program, our job is the same — find what\'s holding growth back, fix it, and prove it with numbers you can see in your dashboard.\",\"mission_btn\":\"Work With Us\",\"team_title\":\"The people behind <em>the matrix</em>\",\"team_lead\":\"A senior team of strategists, developers, and marketers — no hand-offs to juniors.\",\"team1_name\":\"Team Member\",\"team1_role\":\"Founder & CEO\",\"team1_bio\":\"Sets the strategy behind every engagement and keeps the whole team pointed at one thing: client revenue.\",\"team2_name\":\"Team Member\",\"team2_role\":\"Head of Growth\",\"team2_bio\":\"Owns performance marketing and outbound — the engine behind our clients\' 45% average pipeline lift.\",\"team3_name\":\"Team Member\",\"team3_role\":\"Lead Shopify Developer\",\"team3_bio\":\"Builds the conversion-first storefronts — fast, clean, and engineered to scale with the brand.\",\"cta_title\":\"Get a free call\",\"cta_text\":\"Personalize your plan for custom solutions according to your business needs\",\"cta_btn\":\"Book an Assessment\"}','2026-07-06 19:28:50'),(3,'contact','Contact Us','Contact Us — Melon Matrix','Get in touch with Melon Matrix. Book a quick call, request a free audit, or visit our offices in Mississauga, Canada and Cox\'s Bazar, Bangladesh.','','','{\"hero_eyebrow\":\"GET IN TOUCH\",\"hero_title\":\"Let\'s Talk About <br /><em>Your Growth.</em>\",\"hero_sub\":\"Tell us where you are and where you want to be. We\'ll reply within one business day.\",\"info_eyebrow\":\"WE BUILD. YOU GROW.\",\"info_title\":\"Start the <em>conversation.</em>\",\"info_lead\":\"Whether you need a Shopify store that converts, a full-funnel marketing engine, or a free audit of what\'s costing you sales — we\'re one message away.\",\"form_title\":\"Book a quick call\",\"form_intro\":\"Fill in the form and our team will get back to you with next steps.\",\"hours_line2\":\"We respond within one business day.\"}','2026-07-06 19:28:50'),(4,'blog','Blog','Blog — Melon Matrix','Insights on Shopify, performance marketing, and B2B growth from the Melon Matrix team. Strategies, playbooks, and case breakdowns that scale.','','','{\"hero_eyebrow\":\"THE MATRIX BLOG\",\"hero_title\":\"Insights That <br /><em>Drive Growth.</em>\",\"hero_sub\":\"Playbooks, breakdowns, and strategies on Shopify, performance marketing, and scaling B2B brands.\",\"cta_title\":\"Never miss a playbook\",\"cta_text\":\"Get our latest growth insights delivered straight to your inbox.\"}','2026-07-06 19:28:50');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_tags`
--

DROP TABLE IF EXISTS `post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_tags` (
  `post_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`post_id`,`tag_id`),
  KEY `fk_pt_tag` (`tag_id`),
  CONSTRAINT `fk_pt_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_tags`
--

LOCK TABLES `post_tags` WRITE;
/*!40000 ALTER TABLE `post_tags` DISABLE KEYS */;
INSERT INTO `post_tags` VALUES (1,1),(5,1),(1,2),(5,2),(1,3),(2,4),(3,4),(6,4),(7,4),(2,5),(8,5),(3,7),(6,7),(4,8),(10,8),(4,9),(5,12),(7,15),(8,18),(9,19),(9,20),(10,22);
/*!40000 ALTER TABLE `post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text,
  `content` mediumtext,
  `featured_image` varchar(500) DEFAULT '',
  `category_id` int DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `read_time` varchar(20) DEFAULT '5 min',
  `meta_title` varchar(255) DEFAULT '',
  `meta_description` varchar(500) DEFAULT '',
  `meta_keywords` varchar(500) DEFAULT '',
  `canonical_url` varchar(500) DEFAULT '',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `fk_posts_category` (`category_id`),
  KEY `idx_status_published` (`status`,`published_at`),
  CONSTRAINT `fk_posts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,'AgentSense – Expanding into EMEA with Precision B2B Marketing','agentsense-emea-expansion','A targeted outbound system designed to unlock new-market pipeline with higher-quality conversations.','<h2>The challenge</h2><p>AgentSense had strong product-market fit in North America but no reliable way to open conversations in EMEA. Cold lists produced noise, not pipeline, and the internal team was stretched thin.</p><h2>What we built</h2><p>We designed a precision outbound system: a tightly defined ICP, market-by-market messaging, and a multi-channel cadence that prioritized reply quality over raw volume.</p><h2>The results</h2><p>Within two quarters, AgentSense entered three new EMEA markets with a qualified pipeline and higher-quality conversations than any previous channel — all without adding headcount.</p><ul><li>New markets entered across EMEA</li><li>ICP-aligned outreach at scale</li><li>Higher conversion quality across the funnel</li></ul>','/assets/case_robot.png',1,'published','7 min','AgentSense – Expanding into EMEA with Precision B2B Marketing — Melon Matrix','A targeted outbound system designed to unlock new-market pipeline with higher-quality conversations.','b2b, outbound, emea','','2026-07-02 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(2,'Northwind Retail – A Shopify Rebuild That Lifted Conversion 32%','northwind-retail-shopify-rebuild','A conversion-first replatform that turned a slow storefront into a revenue machine in a single quarter.','<h2>The challenge</h2><p>Northwind\'s legacy theme was slow, cluttered, and leaking revenue at every step of the funnel — especially on mobile, where most of their traffic lived.</p><h2>What we built</h2><p>A ground-up Shopify rebuild focused on speed, clarity, and mobile shopping. Every template was designed around a single question: does this help the shopper buy?</p><h2>The results</h2><p>Conversion rate jumped 32% in the first quarter after launch, page speed doubled, and the store hit record revenue two months running.</p>','/assets/dashboard.png',1,'published','6 min','Northwind Retail – A Shopify Rebuild That Lifted Conversion 32% — Melon Matrix','A conversion-first replatform that turned a slow storefront into a revenue machine in a single quarter.','shopify, cro','','2026-06-28 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(3,'Lumen Apparel – Seamless Migration to a Faster Storefront','lumen-apparel-migration','A full replatform from migration to launch that preserved SEO while slashing cart abandonment.','<h2>The challenge</h2><p>Lumen Apparel needed to leave a legacy platform without losing years of SEO equity — and without a single day of downtime during their busiest season.</p><h2>What we built</h2><p>A meticulously planned migration: full URL mapping, redirects, structured data, and a rebuilt checkout flow designed to remove every point of friction.</p><h2>The results</h2><p>Zero downtime, preserved rankings, and a measurably faster storefront. Cart abandonment dropped and sales climbed from the first week after launch.</p>','/assets/growth_engine.png',1,'published','5 min','Lumen Apparel – Seamless Migration to a Faster Storefront — Melon Matrix','A full replatform from migration to launch that preserved SEO while slashing cart abandonment.','shopify, migration','','2026-06-20 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(4,'Verde Goods – Full-Funnel Growth Built on Data','verde-goods-full-funnel-growth','Strategy, creative, and optimization working as one system to drive record revenue and a brand that looks the part.','<h2>The challenge</h2><p>Verde Goods had traffic but no system — disconnected campaigns, inconsistent creative, and no way to know what was actually driving revenue.</p><h2>What we built</h2><p>A full-funnel growth engine: unified tracking, a creative system aligned to the brand, and a testing program where every decision was backed by insight.</p><h2>The results</h2><p>Record revenue two months running and a brand that finally looks the part. Every dollar of spend is now accountable to pipeline.</p>','/assets/robot.png',1,'published','8 min','Verde Goods – Full-Funnel Growth Built on Data — Melon Matrix','Strategy, creative, and optimization working as one system to drive record revenue and a brand that looks the part.','growth, analytics','','2026-06-13 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(5,'The Outbound System Behind a 45% Pipeline Lift','outbound-system-45-percent-pipeline','How precision targeting and ICP-aligned outreach turned cold lists into qualified conversations for a B2B SaaS brand.','<h2>Volume is not a strategy</h2><p>Most outbound fails because it optimizes for sends, not conversations. The fix starts with a ruthless definition of your ideal customer profile.</p><h2>The system</h2><p>Tight ICP, personalized first lines, multi-channel cadences, and a feedback loop between sales and marketing. Measure reply quality, not open rates.</p><h2>What to expect</h2><p>Applied consistently, this system has produced an average 45% pipeline lift across our B2B clients — at a fraction of the in-house cost.</p>','/assets/case_robot.png',3,'published','6 min','The Outbound System Behind a 45% Pipeline Lift — Melon Matrix','How precision targeting and ICP-aligned outreach turned cold lists into qualified conversations for a B2B SaaS brand.','outbound, b2b, pipeline','','2026-06-24 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(6,'Migrating to Shopify Plus Without Losing a Sale','migrating-to-shopify-plus','A step-by-step playbook for seamless migration — preserving SEO, speed, and conversion through the switch.','<h2>Plan the URL map first</h2><p>Every legacy URL needs a destination. Redirect maps are the single biggest factor in preserving SEO through a migration.</p><h2>Rebuild, don\'t copy</h2><p>A migration is the best moment you\'ll ever get to fix conversion problems. Audit the funnel before you rebuild it.</p><h2>Launch dark, then switch</h2><p>Run the new store in parallel, test everything with real orders, and cut over DNS during your quietest hour. Zero downtime is a planning outcome, not luck.</p>','/assets/growth_engine.png',2,'published','5 min','Migrating to Shopify Plus Without Losing a Sale — Melon Matrix','A step-by-step playbook for seamless migration — preserving SEO, speed, and conversion through the switch.','shopify, migration','','2026-06-17 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(7,'Technical SEO for Shopify: The Checklist That Ranks','technical-seo-shopify-checklist','The under-the-hood fixes — speed, structure, and schema — that quietly move stores up the search results.','<h2>Speed is a ranking factor</h2><p>Compress images, cut app bloat, and lazy-load below the fold. Most Shopify stores can halve their load time without touching design.</p><h2>Structure your data</h2><p>Product, review, and breadcrumb schema help search engines understand — and feature — your pages.</p><h2>Fix the crawl</h2><p>Collection filters, tag pages, and pagination create duplicate content by default. Canonical tags and a clean sitemap keep crawlers focused on pages that convert.</p>','/assets/robot.png',4,'published','7 min','Technical SEO for Shopify: The Checklist That Ranks — Melon Matrix','The under-the-hood fixes — speed, structure, and schema — that quietly move stores up the search results.','seo, shopify','','2026-06-09 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(8,'CRO 101: Small Design Fixes, Big Revenue Gains','cro-101-design-fixes','Tiny issues in layout and structure can cost thousands. Here are the highest-leverage changes to test first.','<h2>Start at checkout</h2><p>Errors, surprise costs, and forced account creation kill more revenue than any landing page ever will. Fix the end of the funnel first.</p><h2>Then the product page</h2><p>Above-the-fold clarity: what is it, why should I trust it, what happens when I click? Answer all three without scrolling.</p><h2>Test, don\'t guess</h2><p>Every change is a hypothesis. Small stores should run fewer, bigger tests — you need meaningful traffic per variant to learn anything real.</p>','/assets/dashboard.png',5,'published','6 min','CRO 101: Small Design Fixes, Big Revenue Gains — Melon Matrix','Tiny issues in layout and structure can cost thousands. Here are the highest-leverage changes to test first.','cro, design','','2026-05-30 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(9,'Email & Automation Flows Every Store Should Run','email-automation-flows','From welcome series to win-backs — the automated flows that recover revenue on autopilot.','<h2>The big four</h2><p>Welcome series, abandoned cart, post-purchase, and win-back. These four flows typically drive 20–30% of email revenue on autopilot.</p><h2>Segment by intent</h2><p>A first-time browser and a repeat customer should never get the same message. Segmentation is where automation stops feeling automated.</p><h2>Measure per flow</h2><p>Track revenue per recipient, not open rates. Flows that don\'t pay for their place in the inbox get rewritten or retired.</p>','/assets/case_robot.png',3,'published','5 min','Email & Automation Flows Every Store Should Run — Melon Matrix','From welcome series to win-backs — the automated flows that recover revenue on autopilot.','email, automation','','2026-05-21 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50'),(10,'Building a Full-Funnel Growth Engine From Scratch','full-funnel-growth-engine','Strategy, creative, and optimization working as one system — the framework behind our best client results.','<h2>Discover</h2><p>Audit the funnel, the data, and the market. You cannot optimize what you haven\'t measured, and most growth problems are diagnosis problems.</p><h2>Create</h2><p>Design and build conversion-focused experiences that bring the strategy to life — storefronts, campaigns, and content that pull in one direction.</p><h2>Scale</h2><p>Optimize, test, and grow what works. Momentum becomes sustainable growth when every win is systematized instead of celebrated and forgotten.</p><h2>The outcomes</h2><ul><li>More visibility</li><li>Better conversions</li><li>Higher ROI</li></ul>','/assets/growth_engine.png',5,'published','9 min','Building a Full-Funnel Growth Engine From Scratch — Melon Matrix','Strategy, creative, and optimization working as one system — the framework behind our best client results.','growth, strategy','','2026-05-12 10:00:00','2026-07-06 19:28:50','2026-07-06 19:28:50');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('QqA8JifwkDsWKeJ_VoxI_Nr4KD_wPeZh',1783432818,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-07-07T14:00:17.884Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"userName\":\"Admin\"}'),('Umcs3gKKNGw52KqUcMJNmSSMKRfmNqVo',1783433677,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-07-07T14:03:03.214Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"userName\":\"Admin\"}'),('nw3VC9fFkoqsQ-QtOWw8IOrmqjjC6WGP',1783432852,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-07-07T14:00:51.685Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"userName\":\"Admin\"}'),('ov3OfBVcstFdht1GTO_rKvjRp1jX-TqH',1783432835,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-07-07T14:00:31.520Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"userName\":\"Admin\"}'),('rcbeJbvbcbj_4YsljHVwOU3ut0xuDQUh',1783432287,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-07-07T13:51:27.041Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"userName\":\"Admin\"}'),('zyJipHSzbGU0_jlmc2N0eWtPdHHwXZCV',1783432208,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-07-07T13:50:07.678Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"userId\":1,\"userName\":\"Admin\"}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('address_bd','New Circuit House Rd\r\nCox\'s Bazar-4700'),('address_canada','77 City Centre Drive\r\nMississauga, ON L5B 1M5, Canada'),('email_press','press@melonmatrix.com'),('email_primary','hello@melonmatrix.com'),('email_sales','sales@melonmatrix.com'),('facebook_url','#'),('footer_about_text','We help businesses grow through Shopify expertise, web development, and digital marketing.'),('instagram_url','#'),('main_office_email','info@wecare.com'),('main_office_phone','(62) 1211 1121'),('phone_primary','+880 1842 909843'),('phone_secondary','015-840-06977'),('site_name','Melon Matrix'),('smtp_debug','1'),('smtp_enabled','1'),('smtp_from_email','melonmatrixdns@gmail.com'),('smtp_from_name','Melon Matrix'),('smtp_host','smtp.Gmail.com'),('smtp_last_at','2026-07-07T06:02:56.285Z'),('smtp_last_detail','Test email sent to melonmatrixdns@gmail.com'),('smtp_last_status','ok'),('smtp_password','duygqnbgsmqfsmrb'),('smtp_port','587'),('smtp_secure','1'),('smtp_user','melonmatrixdns@gmail.com'),('tagline','Performance Driven Digital Solutions'),('twitter_url','#'),('working_hours','Monday – Friday: 9:00 AM – 6:00 PM');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribers`
--

DROP TABLE IF EXISTS `subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(190) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribers`
--

LOCK TABLES `subscribers` WRITE;
/*!40000 ALTER TABLE `subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'B2B','b2b'),(2,'Outbound','outbound'),(3,'EMEA','emea'),(4,'Shopify','shopify'),(5,'CRO','cro'),(7,'Migration','migration'),(8,'Growth','growth'),(9,'Analytics','analytics'),(12,'Pipeline','pipeline'),(15,'SEO','seo'),(18,'Design','design'),(19,'Email','email'),(20,'Automation','automation'),(22,'Strategy','strategy');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@melonmatrix.com','$2a$12$tRRy0ZqtWHsSh31nAZDB/.GZs5FtOuLh1cZbfMpXBlJht2BwBAlH2','2026-07-06 19:28:50');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 13:45:47

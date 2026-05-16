-- Capstify Database Schema
-- Run this in phpMyAdmin or via: mysql -u root < database.sql

CREATE DATABASE IF NOT EXISTS capstify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE capstify;

-- ── Admin ───────────────────────────────────────────────────────────────────
CREATE TABLE admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  session_token VARCHAR(255) DEFAULT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Site Settings ────────────────────────────────────────────────────────────
CREATE TABLE settings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  `key`      VARCHAR(100) NOT NULL UNIQUE,
  `value`    TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Product Categories ───────────────────────────────────────────────────────
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image       VARCHAR(500),
  sort_order  INT DEFAULT 0
);

-- ── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE products (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  category_id      INT NOT NULL,
  description      TEXT,
  images           JSON,
  price            INT DEFAULT NULL,
  whatsapp_message TEXT,
  shopee_url       VARCHAR(500),
  tiktok_url       VARCHAR(500),
  featured         TINYINT(1) DEFAULT 0,
  is_new_arrival   TINYINT(1) DEFAULT 0,
  sort_order       INT DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ── Analytics: Page Visits ───────────────────────────────────────────────────
CREATE TABLE analytics_visits (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  page       VARCHAR(255) NOT NULL,
  product_id INT DEFAULT NULL,
  ip_hash    VARCHAR(64),
  visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visited_at (visited_at),
  INDEX idx_product_id (product_id)
);

-- ── Analytics: CTA Clicks ────────────────────────────────────────────────────
CREATE TABLE analytics_clicks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  type       ENUM('whatsapp','shopee','tiktok') NOT NULL,
  ip_hash    VARCHAR(64),
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clicked_at (clicked_at),
  INDEX idx_type (type),
  INDEX idx_product_id (product_id)
);

-- ── Seed: Admin User (password: capstify2025) ────────────────────────────────
INSERT INTO admin_users (username, password) VALUES
('admin', '$2y$10$egL5wcMsFqpX9Gdcag66suQETOo0V/nGeQAQ6sOs0J.BNzkJ8dmnu');

-- ── Seed: Settings ───────────────────────────────────────────────────────────
INSERT INTO settings (`key`, `value`) VALUES
('hero_image',         ''),
('hero_article_name',  'The Season''s Crown'),
('hero_sub_copy',      'Headwear crafted for the ones who lead. New arrivals now in store.'),
('hero_button_label',  'Explore Collection'),
('whatsapp_number',    '6281234567890'),
('instagram_url',      ''),
('tiktok_url',         ''),
('shopee_store_url',   ''),
('footer_tagline',     'Crafted for the ones who lead.');

-- ── Seed: Categories ─────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Truckers',  'truckers',  'Breathable foam-front truckers built for all-day wear.', 1),
('Classic',   'classic',   'Timeless six-panel silhouettes in premium cotton twill.', 2),
('A Frame',   'a-frame',   'Structured five-panel A-frame caps with a crisp front.', 3),
('Baseball',  'baseball',  'Curved-brim baseball caps — the everyday essential.', 4),
('Snapback',  'snapback',  'Flat-brim snapbacks with adjustable closure for any fit.', 5);

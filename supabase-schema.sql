-- ============================================================
-- Capstify — Supabase Schema
-- Paste this into the Supabase SQL Editor and run it.
-- After running, also:
--   1. Go to Storage → Create bucket "product-images" → set to Public
--   2. Go to Auth → Users → Add user (your admin email + password)
-- ============================================================

-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image       TEXT,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  category_id      INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description      TEXT,
  images           JSONB DEFAULT '[]',
  price            INTEGER,
  whatsapp_message TEXT,
  shopee_url       TEXT,
  tiktok_url       TEXT,
  featured         BOOLEAN DEFAULT false,
  is_new_arrival   BOOLEAN DEFAULT false,
  sort_order       INTEGER DEFAULT 0,
  details          JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id         SERIAL PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_visits (
  id         SERIAL PRIMARY KEY,
  page       TEXT NOT NULL,
  product_id INTEGER,
  ip_hash    TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_at ON analytics_visits (visited_at);

CREATE TABLE IF NOT EXISTS analytics_clicks (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('whatsapp', 'shopee', 'tiktok')),
  ip_hash    TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clicks_at ON analytics_clicks (clicked_at);

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_clicks ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read catalog & settings
CREATE POLICY "public read categories"  ON categories       FOR SELECT USING (true);
CREATE POLICY "public read products"    ON products         FOR SELECT USING (true);
CREATE POLICY "public read settings"    ON settings         FOR SELECT USING (true);

-- Public: anyone can log analytics (no PII stored)
CREATE POLICY "public insert visits"    ON analytics_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert clicks"    ON analytics_clicks FOR INSERT WITH CHECK (true);

-- Admin (authenticated): full access to all tables
CREATE POLICY "admin all categories"    ON categories       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin all products"      ON products         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin all settings"      ON settings         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin read visits"       ON analytics_visits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin read clicks"       ON analytics_clicks FOR SELECT USING (auth.role() = 'authenticated');

-- ── Seed Data ─────────────────────────────────────────────────

INSERT INTO categories (id, name, slug, description, image, sort_order) VALUES
  (1, 'Truckers', 'truckers', 'Breathable foam-front truckers built for all-day wear.',   'https://images.unsplash.com/photo-1719934663694-41b6fdceb448?w=900&q=85&auto=format&fit=crop', 1),
  (2, 'Classic',  'classic',  'Timeless six-panel silhouettes in premium cotton twill.',  'https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=85&auto=format&fit=crop', 2),
  (3, 'A Frame',  'a-frame',  'Structured five-panel A-frame caps with a crisp front.',  'https://images.unsplash.com/photo-1733127547242-42a2e7ac12bb?w=900&q=85&auto=format&fit=crop', 3),
  (4, 'Baseball', 'baseball', 'Curved-brim baseball caps — the everyday essential.',      'https://images.unsplash.com/photo-1715608069265-f38ff5d8f234?w=900&q=85&auto=format&fit=crop', 4),
  (5, 'Snapback', 'snapback', 'Flat-brim snapbacks with adjustable closure for any fit.', 'https://images.unsplash.com/photo-1483103068651-8ce44652c331?w=900&q=85&auto=format&fit=crop', 5)
ON CONFLICT (id) DO NOTHING;

SELECT setval('categories_id_seq', 5);

INSERT INTO products (id, name, slug, category_id, description, details, images, price, whatsapp_message, shopee_url, tiktok_url, featured, is_new_arrival, sort_order, created_at) VALUES
  (1,'Forest Ranger','forest-ranger',1,'Built for the trail and the street alike. Foam front, mesh back, and a leather patch that ages like fine timber. The cap that goes where you go.',
    '{"specs":[{"label":"Material","value":"65% Cotton / 35% Polyester — Mesh: 100% Polyester"},{"label":"Fit","value":"Unstructured, Mid Profile"},{"label":"Closure","value":"Adjustable Snapback"},{"label":"Brim","value":"Pre-Curved"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Heat-pressed leather patch","Breathable 6-panel mesh back","Moisture-wicking sweatband","One size fits most"]}',
    '["https://images.unsplash.com/photo-1719934663694-41b6fdceb448?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1719934663722-63b567d14eea?w=900&q=85&auto=format&fit=crop"]',
    275000,'Hi Capstify! I want to order the Forest Ranger Trucker Cap. Please let me know the availability and how to proceed.','','',true,true,1,'2026-05-06 20:18:30'),
  (2,'Maple Standard','maple-standard',1,'The clean trucker. A foam front that holds its shape, mesh back that breathes, and a woven patch that speaks for itself. No fuss.',
    '{"specs":[{"label":"Material","value":"60% Cotton / 40% Polyester"},{"label":"Fit","value":"Structured, Mid Profile"},{"label":"Closure","value":"Adjustable Snapback"},{"label":"Brim","value":"Pre-Curved"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Woven patch label","Ventilated 6-panel mesh back","Adjustable snapback closure","One size fits most"]}',
    '["https://images.unsplash.com/photo-1719934663722-63b567d14eea?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1719934663694-41b6fdceb448?w=900&q=85&auto=format&fit=crop"]',
    250000,'Hi Capstify! I want to order the Maple Standard Trucker Cap. Please let me know the availability and how to proceed.','','',true,false,2,'2026-05-06 20:18:30'),
  (3,'The Signature','the-signature',2,'The six-panel cotton twill standard. Sits clean, wears clean, works everywhere from the corner store to the board room.',
    '{"specs":[{"label":"Material","value":"100% Cotton Twill"},{"label":"Fit","value":"Structured, Mid Profile"},{"label":"Closure","value":"Adjustable Brass Buckle"},{"label":"Brim","value":"Pre-Curved"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Six-panel construction","Tonal embroidered logo","Moisture-wicking sweatband","Brass buckle back strap"]}',
    '["https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?w=900&q=85&auto=format&fit=crop"]',
    290000,'Hi Capstify! I want to order The Signature Classic Cap. Please let me know the availability and how to proceed.','','',true,false,3,'2026-05-06 20:18:30'),
  (4,'Clean Slate','clean-slate',2,'Minimal. Structured. Ready for wherever the day takes you. The cap that lets your moves do the talking.',
    '{"specs":[{"label":"Material","value":"100% Premium Cotton Twill"},{"label":"Fit","value":"Structured, Mid Profile"},{"label":"Closure","value":"Adjustable Snapback"},{"label":"Brim","value":"Pre-Curved"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Clean front panel","Flat embroidered eyelets","Cotton sweatband","One size fits most"]}',
    '["https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=85&auto=format&fit=crop"]',
    265000,'Hi Capstify! I want to order the Clean Slate Classic Cap. Please let me know the availability and how to proceed.','','',false,true,4,'2026-05-06 20:18:30'),
  (5,'The Peak','the-peak',3,'Five panels, one intention: structured impact. The A-Frame silhouette sits sharp on any head and commands the room without trying.',
    '{"specs":[{"label":"Material","value":"100% Cotton Drill"},{"label":"Fit","value":"Structured, Mid Profile"},{"label":"Closure","value":"Adjustable Fabric Strap"},{"label":"Brim","value":"Pre-Curved"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Five-panel A-frame construction","Reinforced structured front","Woven label inside","One size fits most"]}',
    '["https://images.unsplash.com/photo-1733127547242-42a2e7ac12bb?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=85&auto=format&fit=crop"]',
    295000,'Hi Capstify! I want to order The Peak A Frame Cap. Please let me know the availability and how to proceed.','','',true,true,5,'2026-05-06 20:18:30'),
  (6,'Heritage A','heritage-a',3,'Vintage-washed canvas meets a sharp A-frame structure. A cap that looks better the more you wear it. Breaks in, never breaks down.',
    '{"specs":[{"label":"Material","value":"100% Washed Cotton Canvas"},{"label":"Fit","value":"Unstructured, Low Profile"},{"label":"Closure","value":"Adjustable Leather Strap"},{"label":"Brim","value":"Slightly Curved"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Vintage wash finish","Leather strap with brass buckle","Canvas sweatband","Soft front panel"]}',
    '["https://images.unsplash.com/photo-1733127547242-42a2e7ac12bb?w=900&q=85&auto=format&fit=crop"]',
    280000,'Hi Capstify! I want to order the Heritage A Cap. Please let me know the availability and how to proceed.','','',false,true,6,'2026-05-06 20:18:30'),
  (7,'The Everyday','the-everyday',4,'The curved-brim daily driver. Goes with everything, complements everyone. This is the one you reach for without thinking.',
    '{"specs":[{"label":"Material","value":"100% Cotton Twill"},{"label":"Fit","value":"Structured, Mid Profile"},{"label":"Closure","value":"Adjustable Snapback"},{"label":"Brim","value":"Curved, 3.5 inches"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Curved bill","Six-panel construction","Embroidered logo","Adjustable back closure"]}',
    '["https://images.unsplash.com/photo-1715608069265-f38ff5d8f234?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?w=900&q=85&auto=format&fit=crop"]',
    260000,'Hi Capstify! I want to order The Everyday Baseball Cap. Please let me know the availability and how to proceed.','','',true,false,7,'2026-05-06 20:18:30'),
  (8,'Ball Game','ball-game',4,'Classic baseball DNA, modern cut. Low profile, clean finish, curved brim that dips just right. The cap that started it all.',
    '{"specs":[{"label":"Material","value":"60% Cotton / 40% Polyester"},{"label":"Fit","value":"Structured, Low Profile"},{"label":"Closure","value":"Adjustable Hook & Loop"},{"label":"Brim","value":"Curved, 3.5 inches"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Low-profile crown","Curved brim","Embroidered ventilation eyelets","One size fits most"]}',
    '["https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1715608069265-f38ff5d8f234?w=900&q=85&auto=format&fit=crop"]',
    275000,'Hi Capstify! I want to order the Ball Game Baseball Cap. Please let me know the availability and how to proceed.','','',false,true,8,'2026-05-06 20:18:30'),
  (9,'Street Code','street-code',5,'Flat brim, bold statement. The snapback for those who move with intention. Wear it forward. Wear it proud.',
    '{"specs":[{"label":"Material","value":"100% Cotton Twill"},{"label":"Fit","value":"Structured, High Profile"},{"label":"Closure","value":"Flat Snapback"},{"label":"Brim","value":"Flat, 3 inches"},{"label":"Origin","value":"Made in Indonesia"}],"features":["Flat brim","High-profile crown","Embroidered graphic","Adjustable snap closure"]}',
    '["https://images.unsplash.com/photo-1483103068651-8ce44652c331?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?w=900&q=85&auto=format&fit=crop"]',
    285000,'Hi Capstify! I want to order the Street Code Snapback Cap. Please let me know the availability and how to proceed.','','',true,true,9,'2026-05-06 20:18:30'),
  (10,'Monochrome','monochrome',5,'All black. All flat. All business. The snapback without compromise — one colorway, zero distractions.',
    '{"specs":[{"label":"Material","value":"100% Wool Blend"},{"label":"Fit","value":"Structured, High Profile"},{"label":"Closure","value":"Plastic Snapback"},{"label":"Brim","value":"Flat, 3 inches"},{"label":"Origin","value":"Made in Indonesia"}],"features":["All-over tonal black","Flat brim","Embroidered tonal logo","One size fits most"]}',
    '["https://images.unsplash.com/photo-1627733041826-77dd65dc5a19?w=900&q=85&auto=format&fit=crop","https://images.unsplash.com/photo-1483103068651-8ce44652c331?w=900&q=85&auto=format&fit=crop"]',
    270000,'Hi Capstify! I want to order the Monochrome Snapback Cap. Please let me know the availability and how to proceed.','','',false,false,10,'2026-05-06 20:18:30')
ON CONFLICT (id) DO NOTHING;

SELECT setval('products_id_seq', 10);

INSERT INTO settings (key, value) VALUES
  ('hero_article_name', 'The Season''s Crown'),
  ('hero_sub_copy',     'Headwear crafted for the ones who lead. New arrivals now in store.'),
  ('hero_button_label', 'Explore Collection'),
  ('whatsapp_number',   '6281234567890'),
  ('instagram_url',     ''),
  ('shopee_store_url',  ''),
  ('tiktok_url',        ''),
  ('footer_tagline',    'Crafted for the ones who lead.'),
  ('hero_image',        '')
ON CONFLICT (key) DO NOTHING;

-- Demo catalog seed for store (idempotent by fixed UUIDs).
-- Safe to re-run: upserts categories/products and refreshes join links.

-- Categories: artículos (product)
INSERT INTO store_categories (id, name, slug, product_type, sort_order, is_active)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Miniaturas', 'demo-miniatures', 'product', 0, true),
  ('a1000000-0000-4000-8000-000000000002', 'Hogar', 'demo-home', 'product', 1, true),
  ('a1000000-0000-4000-8000-000000000003', 'Mecánica', 'demo-mechanics', 'product', 2, true),
  ('a1000000-0000-4000-8000-000000000004', 'Juguetes', 'demo-toys', 'product', 3, true),
  ('a1000000-0000-4000-8000-000000000005', 'Accesorios', 'demo-accessories', 'product', 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  product_type = EXCLUDED.product_type,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW(),
  deleted_at = NULL;

-- Categories: diseños (design)
INSERT INTO store_categories (id, name, slug, product_type, sort_order, is_active)
VALUES
  ('a2000000-0000-4000-8000-000000000001', 'Miniaturas', 'demo-miniatures', 'design', 0, true),
  ('a2000000-0000-4000-8000-000000000002', 'Mecánica', 'demo-mechanics', 'design', 1, true),
  ('a2000000-0000-4000-8000-000000000003', 'Decoración', 'demo-decoration', 'design', 2, true),
  ('a2000000-0000-4000-8000-000000000004', 'Utilitarios', 'demo-utilities', 'design', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  product_type = EXCLUDED.product_type,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW(),
  deleted_at = NULL;

-- Physical articles
INSERT INTO store_products (
  id, name, description, product_type, price_cents, discount_percent, currency,
  stock, image_url, digital_file_url, is_published, is_featured, created_at, updated_at, deleted_at
)
VALUES
  (
    'b1000000-0000-4000-8000-000000000001',
    'Maceta hexagonal 10 cm',
    'Maceta impresa en PLA mate. Ideal para suculentas chicas. Incluye plato drippy.',
    'product', 850000, NULL, 'ARS', 12, NULL, NULL, true, true,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '2 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'Soporte auriculares spiral',
    'Soporte de escritorio para auriculares. Base antideslizante y cable pass-through.',
    'product', 1250000, 15, 'ARS', 7, NULL, NULL, true, true,
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'Engranaje módulo 1.5 (set x3)',
    'Set de 3 engranajes PLA+ calibrados. Útiles para prototipos mecánicos y kits didácticos.',
    'product', 420000, NULL, 'ARS', 25, NULL, NULL, true, false,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'Miniatura dragón 8 cm',
    'Figura detallada con post-procesado liviano. Pintura opcional por encargo.',
    'product', 980000, 10, 'ARS', 4, NULL, NULL, true, true,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 hours', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    'Organizador de cables desk',
    'Canaleta para escritorio con tapa clip. Evita el lío de cables USB y cargadores.',
    'product', 560000, NULL, 'ARS', 18, NULL, NULL, true, false,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '4 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'Ficha de juego token hexagonal',
    'Pack de 10 tokens hexagonales. Buenas para board games o prototipos de mesa.',
    'product', 290000, 20, 'ARS', 40, NULL, NULL, true, false,
    NOW() - INTERVAL '9 days', NOW() - INTERVAL '5 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    'Soporte celular angular',
    'Ángulo ergonómico para videollamadas. Compatible con la mayoría de smartphones.',
    'product', 390000, NULL, 'ARS', 0, NULL, NULL, true, false,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000008',
    'Caja de engranajes demo',
    'Caja reductora demostrativa con ejes impresos. Ideal para talleres y cursos.',
    'product', 2450000, 25, 'ARS', 3, NULL, NULL, true, true,
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000009',
    'Llavero logo Pelambres',
    'Llavero compacto con logo en relieve. Regalo rápido o merch del taller.',
    'product', 150000, NULL, 'ARS', 50, NULL, NULL, true, false,
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000010',
    'Carcasa IoT 80x50 mm',
    'Carcasa bipartita con tornillos M3. Espacio para PCB y sensores pequeños.',
    'product', 1750000, NULL, 'ARS', 6, NULL, NULL, true, false,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000011',
    'Miniatura robot explorer',
    'Robot explorador estilo sci-fi. Buena base para pintar o customizar.',
    'product', 1120000, 5, 'ARS', 2, NULL, NULL, true, false,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '8 hours', NULL
  ),
  (
    'b1000000-0000-4000-8000-000000000012',
    'Borrador de escritorio (draft)',
    'Artículo de prueba en borrador: no debería verse en la tienda pública.',
    'product', 99900, NULL, 'ARS', 1, NULL, NULL, false, false,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL
  ),

-- Digital designs
  (
    'b2000000-0000-4000-8000-000000000001',
    'Kit engranajes spur (STL)',
    'Pack de engranajes spur listos para imprimir. Incluye variantes de dientes 12–48.',
    'design', 650000, NULL, 'ARS', NULL, NULL,
    'https://example.com/seed/spur-gears.zip', true, true,
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '1 day', NULL
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    'Maceta parametrizable',
    'Archivo 3MF + notas de impresión. Diámetro configurable en el README.',
    'design', 480000, 15, 'ARS', NULL, NULL,
    'https://example.com/seed/planter.3mf', true, true,
    NOW() - INTERVAL '11 days', NOW() - INTERVAL '2 days', NULL
  ),
  (
    'b2000000-0000-4000-8000-000000000003',
    'Miniatura dragón high-poly',
    'Modelo detallado para FDM fino o resina. Orientación sugerida incluida.',
    'design', 890000, NULL, 'ARS', NULL, NULL,
    'https://example.com/seed/dragon.stl', true, false,
    NOW() - INTERVAL '9 days', NOW() - INTERVAL '3 days', NULL
  ),
  (
    'b2000000-0000-4000-8000-000000000004',
    'Organizador modular cajón',
    'Módulos encastrables para cajones. Exportados en STL y 3MF.',
    'design', 520000, 10, 'ARS', NULL, NULL,
    'https://example.com/seed/drawer-org.zip', true, false,
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days', NULL
  ),
  (
    'b2000000-0000-4000-8000-000000000005',
    'Soporte auriculares remix',
    'Versión remix open-source con base más estable. Licencia incluida.',
    'design', 350000, NULL, 'ARS', NULL, NULL,
    'https://example.com/seed/headphone-stand.stl', true, false,
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NULL
  ),
  (
    'b2000000-0000-4000-8000-000000000006',
    'Carcasa sensor DHT22',
    'Carcasa ventilada para DHT22 / similares. Orificios de montaje M2.',
    'design', 290000, 20, 'ARS', NULL, NULL,
    'https://example.com/seed/dht22-case.stl', true, true,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours', NULL
  ),
  (
    'b2000000-0000-4000-8000-000000000007',
    'Token hex pack (diseño borrador)',
    'Diseño draft sin publicar para pruebas de admin.',
    'design', 120000, NULL, 'ARS', NULL, NULL,
    NULL, false, false,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  product_type = EXCLUDED.product_type,
  price_cents = EXCLUDED.price_cents,
  discount_percent = EXCLUDED.discount_percent,
  currency = EXCLUDED.currency,
  stock = EXCLUDED.stock,
  image_url = EXCLUDED.image_url,
  digital_file_url = EXCLUDED.digital_file_url,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at,
  deleted_at = NULL;

-- Refresh category links for seeded products
DELETE FROM store_product_categories
WHERE product_id IN (
  SELECT id FROM store_products
  WHERE id::text LIKE 'b1000000-%' OR id::text LIKE 'b2000000-%'
);

INSERT INTO store_product_categories (product_id, category_id, sort_order)
VALUES
  -- articles
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 0), -- hogar
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000005', 0), -- accesorios
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 1), -- hogar
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 0), -- mecánica
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 0), -- miniaturas
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', 1), -- juguetes
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000002', 0), -- hogar
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000005', 1), -- accesorios
  ('b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000004', 0), -- juguetes
  ('b1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000005', 0), -- accesorios
  ('b1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000003', 0), -- mecánica
  ('b1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000005', 0), -- accesorios
  ('b1000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000003', 0), -- mecánica
  ('b1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000001', 0), -- miniaturas
  ('b1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000004', 1), -- juguetes
  ('b1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000005', 0), -- draft

  -- designs
  ('b2000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000002', 0), -- mecánica
  ('b2000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000004', 0), -- utilitarios
  ('b2000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000003', 1), -- decoración
  ('b2000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000001', 0), -- miniaturas
  ('b2000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000004', 0), -- utilitarios
  ('b2000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000004', 0), -- utilitarios
  ('b2000000-0000-4000-8000-000000000006', 'a2000000-0000-4000-8000-000000000002', 0), -- mecánica
  ('b2000000-0000-4000-8000-000000000006', 'a2000000-0000-4000-8000-000000000004', 1), -- utilitarios
  ('b2000000-0000-4000-8000-000000000007', 'a2000000-0000-4000-8000-000000000001', 0)  -- draft
ON CONFLICT (product_id, category_id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order;

-- Soft-delete leftover manual test categories (not part of demo seed)
UPDATE store_categories
SET deleted_at = NOW(), updated_at = NOW()
WHERE deleted_at IS NULL
  AND lower(name) IN ('test', 'test 2');

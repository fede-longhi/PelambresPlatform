-- Optional percent discount on catalog price (price_cents stays the original)

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS discount_percent INTEGER NULL
    CHECK (
      discount_percent IS NULL
      OR (discount_percent > 0 AND discount_percent <= 100)
    );

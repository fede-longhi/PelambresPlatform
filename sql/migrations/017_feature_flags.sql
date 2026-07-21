-- Feature flags: global visibility + per-user allowlist (extensible by key)

CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flag_users (
  feature_key TEXT NOT NULL REFERENCES feature_flags(key) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (feature_key, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_users_user_id
  ON feature_flag_users(user_id);

INSERT INTO feature_flags (key, label, description, is_enabled)
VALUES (
  'store',
  'Tienda',
  'Catálogo público de productos y diseños (/store). Si está desactivada, solo la ven administradores y usuarios en la lista de acceso.',
  true
)
ON CONFLICT (key) DO NOTHING;

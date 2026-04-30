-- 在 Supabase SQL Editor 里跑这个

CREATE TABLE deals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  closer TEXT DEFAULT 'sam',
  source TEXT DEFAULT 'xhs',
  account TEXT DEFAULT '-',
  banks TEXT DEFAULT '-',
  amount NUMERIC DEFAULT 350,
  note TEXT DEFAULT '',
  stage TEXT DEFAULT 'lead',
  month TEXT DEFAULT '',
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启 Realtime（让你和Sam实时看到更新）
ALTER PUBLICATION supabase_realtime ADD TABLE deals;

-- 开启 RLS 但允许所有人读写（简单版，不需要登录）
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON deals
  FOR ALL
  USING (true)
  WITH CHECK (true);

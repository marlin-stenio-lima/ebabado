-- Tabela de Configuração do Site
CREATE TABLE site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT,
  attractions TEXT,
  rules TEXT,
  whatsapp_link TEXT,
  hero_title TEXT,
  hero_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  primary_color TEXT,
  secondary_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
-- Leitura pública (para o site principal)
CREATE POLICY "Public Read Site Config" ON site_config FOR SELECT USING (true);

-- Escrita apenas para autenticados (Admin)
CREATE POLICY "Admin Update Site Config" ON site_config FOR ALL USING (auth.role() = 'authenticated');

-- Inserir configuração padrão (vazia ou com dados placeholder)
INSERT INTO site_config (location, attractions, rules, whatsapp_link)
VALUES (
  'Local a definir',
  'Atrações a confirmar',
  'Regras do evento aqui',
  'https://wa.me/558681263022'
);

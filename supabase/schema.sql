-- Criação das Tabelas para o Acess Vibe

-- 1. Categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT, -- Nome do ícone (ex: 'beer', 'pizza')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Produtos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Vendas (Orders)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'money', 'pix', 'credit', 'debit'
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'canceled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Itens da Venda
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Simplificadas para MVP)
-- Leitura pública (para cardápio digital)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);

-- Escrita apenas para autenticados (Admin/Operador)
CREATE POLICY "Auth Insert Orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon'); -- Anon permitido para teste local se RLS estiver on, mas idealmente só auth.
-- Ajuste: Permitir Anon insert para facilitar testes iniciais se não tiver login real ainda.
CREATE POLICY "Enable insert for authenticated users only" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users only" ON products FOR ALL USING (auth.role() = 'authenticated');

-- Dados Iniciais (Seed)
INSERT INTO categories (name, icon) VALUES 
('Bebidas', 'beer'),
('Comidas', 'utensils'),
('Combos', 'layers');

-- Inserir produtos de exemplo (IDs gerados automaticamente, então precisaria de subquery, mas vamos simplificar)

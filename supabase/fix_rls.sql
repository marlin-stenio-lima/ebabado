-- Corrigir Políticas de Segurança (RLS) para Tabelas de Dados

-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas para evitar duplicidade/conflito
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Auth Insert Products" ON products;
DROP POLICY IF EXISTS "Auth Update Products" ON products;
DROP POLICY IF EXISTS "Auth Delete Products" ON products;

DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Auth Insert Categories" ON categories;
DROP POLICY IF EXISTS "Auth Update Categories" ON categories;
DROP POLICY IF EXISTS "Auth Delete Categories" ON categories;

-- 3. Criar Novas Políticas para PRODUTOS

-- Todo mundo pode VER os produtos (Leitura Pública)
CREATE POLICY "Public Read Products" ON products
FOR SELECT USING (true);

-- Apenas usuários LOGADOS podem CRIAR produtos
CREATE POLICY "Auth Insert Products" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas usuários LOGADOS podem EDITAR produtos
CREATE POLICY "Auth Update Products" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

-- Apenas usuários LOGADOS podem DELETAR produtos
CREATE POLICY "Auth Delete Products" ON products
FOR DELETE USING (auth.role() = 'authenticated');


-- 4. Criar Novas Políticas para CATEGORIAS (mesma lógica)

-- Todo mundo pode VER
CREATE POLICY "Public Read Categories" ON categories
FOR SELECT USING (true);

-- Apenas Logados podem CRIAR
CREATE POLICY "Auth Insert Categories" ON categories
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas Logados podem EDITAR
CREATE POLICY "Auth Update Categories" ON categories
FOR UPDATE USING (auth.role() = 'authenticated');

-- Apenas Logados podem DELETAR
CREATE POLICY "Auth Delete Categories" ON categories
FOR DELETE USING (auth.role() = 'authenticated');

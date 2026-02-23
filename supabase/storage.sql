-- Configuração do Storage para Imagens de Produtos

-- 1. Criar o Bucket 'product-images' (se não existir, o insert falha silenciosamente ou podemos ignorar erro, mas via SQL direto é mais garantido inserir na tabela 'buckets')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Segurança para o Storage

-- Permitir acesso PÚBLICO para leitura (para exibir no PDV e Cardápio)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );

-- Permitir Upload apenas para usuários Autenticados (Admin)
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Permitir Atualizar/Deletar apenas para usuários Autenticados
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

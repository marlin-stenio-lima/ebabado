
-- Add stock column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Function to atomically decrement stock
create or replace function decrement_stock(product_id uuid, quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set stock = stock - quantity
  where id = product_id AND stock >= quantity;
end;
$$;

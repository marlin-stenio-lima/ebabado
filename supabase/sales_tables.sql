-- Create Sales Table
create table if not exists sales (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  total_amount decimal(10,2) not null,
  payment_method text not null, -- 'money', 'credit', 'debit', 'pix'
  status text default 'completed'
);

-- Create Sale Items Table
create table if not exists sale_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  product_name text not null, -- Snapshot of name at time of sale
  quantity int not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null
);

-- Enable RLS
alter table sales enable row level security;
alter table sale_items enable row level security;

-- Create Policies (Allow all for now for public/anon dev, or authenticated)
create policy "Enable read access for all users" on sales for select using (true);
create policy "Enable insert access for all users" on sales for insert with check (true);

create policy "Enable read access for all users" on sale_items for select using (true);
create policy "Enable insert access for all users" on sale_items for insert with check (true);

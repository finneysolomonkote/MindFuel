/*
  # Create Products and Orders Tables

  ## Summary
  Creates tables for managing products and orders in the MindFuel AI platform.

  ## Tables Created
  1. `products` - Products for sale (workbooks, courses, coaching, subscriptions)
  2. `orders` - User purchase orders

  ## Security
  - Enable RLS on all tables
  - Users can read active products
  - Users can read their own orders
  - Users can create orders
  - Only admins can manage products and see all orders
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  product_type text NOT NULL,
  workbook_id uuid REFERENCES workbooks(id),
  price numeric(10, 2) NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  image_url text,
  features text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  payment_status text DEFAULT 'pending' NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active products"
  ON products FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

/*
  # Additional RLS Policies and Security

  1. Admin Policies
    - Admins can manage all content
    - Super admins have full access

  2. Helper Functions
    - is_admin() - Check if user is admin
    - is_super_admin() - Check if user is super admin
*/

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for books
CREATE POLICY "Admins can manage books" ON books FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage book chapters" ON book_chapters FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage book sections" ON book_sections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for workbooks
CREATE POLICY "Admins can manage workbooks" ON workbooks FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage workbook chapters" ON workbook_chapters FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage workbook sections" ON workbook_sections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for products
CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for quotes
CREATE POLICY "Admins can manage quotes" ON quotes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for practices
CREATE POLICY "Admins can manage practices" ON practices FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for taxonomy
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage tags" ON tags FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for AI
CREATE POLICY "Admins can manage AI prompts" ON ai_prompts FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage AI models" ON ai_models FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can view all usage logs" ON ai_usage_logs FOR SELECT TO authenticated USING (is_admin());

-- Admin can view all orders
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT TO authenticated USING (is_admin());

-- Admin can view all users
CREATE POLICY "Admins can view all users" ON users FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can update user roles" ON users FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

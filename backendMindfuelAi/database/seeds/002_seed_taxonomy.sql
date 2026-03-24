-- Sample categories
INSERT INTO categories (name, slug, description, icon, color, display_order) VALUES
('Mindset', 'mindset', 'Transform your thinking patterns', 'brain', '#4A90E2', 1),
('Productivity', 'productivity', 'Master your time and energy', 'zap', '#10B981', 2),
('Wellness', 'wellness', 'Physical and mental health', 'heart', '#F59E0B', 3),
('Leadership', 'leadership', 'Lead and inspire others', 'users', '#8B5CF6', 4)
ON CONFLICT (slug) DO NOTHING;

-- Sample tags
INSERT INTO tags (name, slug, type) VALUES
('beginner-friendly', 'beginner-friendly', 'difficulty'),
('practical', 'practical', 'topic'),
('mindfulness', 'mindfulness', 'topic'),
('habit-building', 'habit-building', 'skill')
ON CONFLICT (slug) DO NOTHING;

import { Request, Response } from 'express';
import { supabase } from '../../lib/supabase';
import { logger } from '@mindfuel/utils';

// Helper to convert error to logger format
const toLogMeta = (error: unknown): Record<string, any> => ({ error: String(error) });

// ===== CATEGORIES =====

export async function getCategories(req: Request, res: Response) {
  try {
    const { active } = req.query;

    let query = supabase
      .from('content_categories')
      .select('*')
      .order('sort_order');

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching categories:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('content_categories')
      .select('*, content_subcategories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Category not found' });

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch category' });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, slug, description, icon, color, sort_order, is_active, metadata } = req.body;

    const { data, error } = await supabase
      .from('content_categories')
      .insert({
        name,
        slug,
        description,
        icon,
        color,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error creating category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('content_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Category not found' });

    res.json({ data });
  } catch (error) {
    logger.error('Error updating category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to update category' });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('content_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error('Error deleting category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

export async function reorderCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { sort_order } = req.body;

    const { data, error } = await supabase
      .from('content_categories')
      .update({ sort_order })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    logger.error('Error reordering category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to reorder category' });
  }
}

// ===== SUBCATEGORIES =====

export async function getSubcategories(req: Request, res: Response) {
  try {
    const { active } = req.query;

    let query = supabase
      .from('content_subcategories')
      .select('*, content_categories(*)')
      .order('sort_order');

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching subcategories:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
}

export async function getSubcategoryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('content_subcategories')
      .select('*, content_categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Subcategory not found' });

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch subcategory' });
  }
}

export async function getSubcategoriesByCategory(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;
    const { active } = req.query;

    let query = supabase
      .from('content_subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order');

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching subcategories by category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
}

export async function createSubcategory(req: Request, res: Response) {
  try {
    const { category_id, name, slug, description, sort_order, is_active, metadata } = req.body;

    const { data, error } = await supabase
      .from('content_subcategories')
      .insert({
        category_id,
        name,
        slug,
        description,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error creating subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to create subcategory' });
  }
}

export async function updateSubcategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('content_subcategories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Subcategory not found' });

    res.json({ data });
  } catch (error) {
    logger.error('Error updating subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to update subcategory' });
  }
}

export async function deleteSubcategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('content_subcategories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    logger.error('Error deleting subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to delete subcategory' });
  }
}

// ===== TAGS =====

export async function getTags(req: Request, res: Response) {
  try {
    const { active, type } = req.query;

    let query = supabase
      .from('content_tags')
      .select('*')
      .order('name');

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching tags:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
}

export async function getTagById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('content_tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tag not found' });

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
}

export async function getTagsByType(req: Request, res: Response) {
  try {
    const { type } = req.params;
    const { active } = req.query;

    let query = supabase
      .from('content_tags')
      .select('*')
      .eq('type', type)
      .order('name');

    if (active === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    logger.error('Error fetching tags by type:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
}

export async function createTag(req: Request, res: Response) {
  try {
    const { name, slug, type, color, is_active, metadata } = req.body;

    const { data, error } = await supabase
      .from('content_tags')
      .insert({
        name,
        slug,
        type: type || 'general',
        color,
        is_active: is_active !== undefined ? is_active : true,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error creating tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to create tag' });
  }
}

export async function updateTag(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('content_tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tag not found' });

    res.json({ data });
  } catch (error) {
    logger.error('Error updating tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to update tag' });
  }
}

export async function deleteTag(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('content_tags')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    logger.error('Error deleting tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to delete tag' });
  }
}

// ===== WORKBOOK MAPPINGS =====

export async function getWorkbookTaxonomy(req: Request, res: Response) {
  try {
    const { workbookId } = req.params;

    const [categoriesRes, subcategoriesRes, tagsRes] = await Promise.all([
      supabase
        .from('workbook_category_map')
        .select('*, content_categories(*)')
        .eq('workbook_id', workbookId),
      supabase
        .from('workbook_subcategory_map')
        .select('*, content_subcategories(*)')
        .eq('workbook_id', workbookId),
      supabase
        .from('workbook_content_tags')
        .select('*, content_tags(*)')
        .eq('workbook_id', workbookId)
    ]);

    res.json({
      categories: categoriesRes.data || [],
      subcategories: subcategoriesRes.data || [],
      tags: tagsRes.data || []
    });
  } catch (error) {
    logger.error('Error fetching workbook taxonomy:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch workbook taxonomy' });
  }
}

export async function addWorkbookCategory(req: Request, res: Response) {
  try {
    const { workbookId } = req.params;
    const { category_id } = req.body;

    const { data, error } = await supabase
      .from('workbook_category_map')
      .insert({ workbook_id: workbookId, category_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding workbook category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add category' });
  }
}

export async function removeWorkbookCategory(req: Request, res: Response) {
  try {
    const { workbookId, categoryId } = req.params;

    const { error } = await supabase
      .from('workbook_category_map')
      .delete()
      .eq('workbook_id', workbookId)
      .eq('category_id', categoryId);

    if (error) throw error;

    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    logger.error('Error removing workbook category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove category' });
  }
}

export async function addWorkbookSubcategory(req: Request, res: Response) {
  try {
    const { workbookId } = req.params;
    const { subcategory_id } = req.body;

    const { data, error } = await supabase
      .from('workbook_subcategory_map')
      .insert({ workbook_id: workbookId, subcategory_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding workbook subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add subcategory' });
  }
}

export async function removeWorkbookSubcategory(req: Request, res: Response) {
  try {
    const { workbookId, subcategoryId } = req.params;

    const { error } = await supabase
      .from('workbook_subcategory_map')
      .delete()
      .eq('workbook_id', workbookId)
      .eq('subcategory_id', subcategoryId);

    if (error) throw error;

    res.json({ message: 'Subcategory removed successfully' });
  } catch (error) {
    logger.error('Error removing workbook subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove subcategory' });
  }
}

export async function addWorkbookTag(req: Request, res: Response) {
  try {
    const { workbookId } = req.params;
    const { tag_id } = req.body;

    const { data, error } = await supabase
      .from('workbook_content_tags')
      .insert({ workbook_id: workbookId, tag_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding workbook tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add tag' });
  }
}

export async function removeWorkbookTag(req: Request, res: Response) {
  try {
    const { workbookId, tagId } = req.params;

    const { error } = await supabase
      .from('workbook_content_tags')
      .delete()
      .eq('workbook_id', workbookId)
      .eq('tag_id', tagId);

    if (error) throw error;

    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    logger.error('Error removing workbook tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove tag' });
  }
}

// ===== BOOK MAPPINGS (Similar pattern) =====

export async function getBookTaxonomy(req: Request, res: Response) {
  try {
    const { bookId } = req.params;

    const [categoriesRes, subcategoriesRes, tagsRes] = await Promise.all([
      supabase
        .from('book_category_map')
        .select('*, content_categories(*)')
        .eq('book_id', bookId),
      supabase
        .from('book_subcategory_map')
        .select('*, content_subcategories(*)')
        .eq('book_id', bookId),
      supabase
        .from('book_content_tags')
        .select('*, content_tags(*)')
        .eq('book_id', bookId)
    ]);

    res.json({
      categories: categoriesRes.data || [],
      subcategories: subcategoriesRes.data || [],
      tags: tagsRes.data || []
    });
  } catch (error) {
    logger.error('Error fetching book taxonomy:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch book taxonomy' });
  }
}

export async function addBookCategory(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const { category_id } = req.body;

    const { data, error } = await supabase
      .from('book_category_map')
      .insert({ book_id: bookId, category_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding book category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add category' });
  }
}

export async function removeBookCategory(req: Request, res: Response) {
  try {
    const { bookId, categoryId } = req.params;

    const { error } = await supabase
      .from('book_category_map')
      .delete()
      .eq('book_id', bookId)
      .eq('category_id', categoryId);

    if (error) throw error;

    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    logger.error('Error removing book category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove category' });
  }
}

export async function addBookSubcategory(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const { subcategory_id } = req.body;

    const { data, error } = await supabase
      .from('book_subcategory_map')
      .insert({ book_id: bookId, subcategory_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding book subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add subcategory' });
  }
}

export async function removeBookSubcategory(req: Request, res: Response) {
  try {
    const { bookId, subcategoryId } = req.params;

    const { error } = await supabase
      .from('book_subcategory_map')
      .delete()
      .eq('book_id', bookId)
      .eq('subcategory_id', subcategoryId);

    if (error) throw error;

    res.json({ message: 'Subcategory removed successfully' });
  } catch (error) {
    logger.error('Error removing book subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove subcategory' });
  }
}

export async function addBookTag(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const { tag_id } = req.body;

    const { data, error } = await supabase
      .from('book_content_tags')
      .insert({ book_id: bookId, tag_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding book tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add tag' });
  }
}

export async function removeBookTag(req: Request, res: Response) {
  try {
    const { bookId, tagId } = req.params;

    const { error } = await supabase
      .from('book_content_tags')
      .delete()
      .eq('book_id', bookId)
      .eq('tag_id', tagId);

    if (error) throw error;

    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    logger.error('Error removing book tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove tag' });
  }
}

// ===== PRODUCT MAPPINGS =====

export async function getProductTaxonomy(req: Request, res: Response) {
  try {
    const { productId } = req.params;

    const [categoriesRes, tagsRes] = await Promise.all([
      supabase
        .from('product_category_map')
        .select('*, content_categories(*)')
        .eq('product_id', productId),
      supabase
        .from('product_content_tags')
        .select('*, content_tags(*)')
        .eq('product_id', productId)
    ]);

    res.json({
      categories: categoriesRes.data || [],
      tags: tagsRes.data || []
    });
  } catch (error) {
    logger.error('Error fetching product taxonomy:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to fetch product taxonomy' });
  }
}

export async function addProductCategory(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const { category_id } = req.body;

    const { data, error } = await supabase
      .from('product_category_map')
      .insert({ product_id: productId, category_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding product category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add category' });
  }
}

export async function removeProductCategory(req: Request, res: Response) {
  try {
    const { productId, categoryId } = req.params;

    const { error } = await supabase
      .from('product_category_map')
      .delete()
      .eq('product_id', productId)
      .eq('category_id', categoryId);

    if (error) throw error;

    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    logger.error('Error removing product category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove category' });
  }
}

export async function addProductTag(req: Request, res: Response) {
  try {
    const { productId } = req.params;
    const { tag_id } = req.body;

    const { data, error } = await supabase
      .from('product_content_tags')
      .insert({ product_id: productId, tag_id })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ data });
  } catch (error) {
    logger.error('Error adding product tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to add tag' });
  }
}

export async function removeProductTag(req: Request, res: Response) {
  try {
    const { productId, tagId } = req.params;

    const { error } = await supabase
      .from('product_content_tags')
      .delete()
      .eq('product_id', productId)
      .eq('tag_id', tagId);

    if (error) throw error;

    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    logger.error('Error removing product tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to remove tag' });
  }
}

// ===== BROWSE BY TAXONOMY =====

export async function browseByCategory(req: Request, res: Response) {
  try {
    const { categorySlug } = req.params;

    // Get category
    const { data: category, error: catError } = await supabase
      .from('content_categories')
      .select('*')
      .eq('slug', categorySlug)
      .eq('is_active', true)
      .single();

    if (catError || !category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get workbooks
    const { data: workbooks } = await supabase
      .from('workbook_category_map')
      .select('workbook_id, workbooks(*)')
      .eq('category_id', category.id);

    // Get books
    const { data: books } = await supabase
      .from('book_category_map')
      .select('book_id, books(*)')
      .eq('category_id', category.id);

    // Get products
    const { data: products } = await supabase
      .from('product_category_map')
      .select('product_id, products(*)')
      .eq('category_id', category.id);

    res.json({
      category,
      workbooks: workbooks?.map((w: any) => w.workbooks) || [],
      books: books?.map((b: any) => b.books) || [],
      products: products?.map((p: any) => p.products) || []
    });
  } catch (error) {
    logger.error('Error browsing by category:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to browse by category' });
  }
}

export async function browseBySubcategory(req: Request, res: Response) {
  try {
    const { subcategorySlug } = req.params;

    // Get subcategory with parent category
    const { data: subcategory, error: subError } = await supabase
      .from('content_subcategories')
      .select('*, content_categories(*)')
      .eq('slug', subcategorySlug)
      .eq('is_active', true)
      .single();

    if (subError || !subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    // Get workbooks
    const { data: workbooks } = await supabase
      .from('workbook_subcategory_map')
      .select('workbook_id, workbooks(*)')
      .eq('subcategory_id', subcategory.id);

    // Get books
    const { data: books } = await supabase
      .from('book_subcategory_map')
      .select('book_id, books(*)')
      .eq('subcategory_id', subcategory.id);

    res.json({
      subcategory,
      workbooks: workbooks?.map((w: any) => w.workbooks) || [],
      books: books?.map((b: any) => b.books) || []
    });
  } catch (error) {
    logger.error('Error browsing by subcategory:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to browse by subcategory' });
  }
}

export async function browseByTag(req: Request, res: Response) {
  try {
    const { tagSlug } = req.params;

    // Get tag
    const { data: tag, error: tagError } = await supabase
      .from('content_tags')
      .select('*')
      .eq('slug', tagSlug)
      .eq('is_active', true)
      .single();

    if (tagError || !tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Get workbooks
    const { data: workbooks } = await supabase
      .from('workbook_content_tags')
      .select('workbook_id, workbooks(*)')
      .eq('tag_id', tag.id);

    // Get books
    const { data: books } = await supabase
      .from('book_content_tags')
      .select('book_id, books(*)')
      .eq('tag_id', tag.id);

    // Get products
    const { data: products } = await supabase
      .from('product_content_tags')
      .select('product_id, products(*)')
      .eq('tag_id', tag.id);

    res.json({
      tag,
      workbooks: workbooks?.map((w: any) => w.workbooks) || [],
      books: books?.map((b: any) => b.books) || [],
      products: products?.map((p: any) => p.products) || []
    });
  } catch (error) {
    logger.error('Error browsing by tag:', toLogMeta(error));
    res.status(500).json({ error: 'Failed to browse by tag' });
  }
}

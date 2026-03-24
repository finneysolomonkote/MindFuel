import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as taxonomyHandlers from '../modules/taxonomy/taxonomy.handlers';

const router = Router();

// Categories
router.get('/categories', taxonomyHandlers.getCategories);
router.get('/categories/:id', taxonomyHandlers.getCategoryById);
router.post('/categories', auth, taxonomyHandlers.createCategory);
router.put('/categories/:id', auth, taxonomyHandlers.updateCategory);
router.delete('/categories/:id', auth, taxonomyHandlers.deleteCategory);
router.put('/categories/:id/reorder', auth, taxonomyHandlers.reorderCategory);

// Subcategories
router.get('/subcategories', taxonomyHandlers.getSubcategories);
router.get('/subcategories/:id', taxonomyHandlers.getSubcategoryById);
router.get('/categories/:categoryId/subcategories', taxonomyHandlers.getSubcategoriesByCategory);
router.post('/subcategories', auth, taxonomyHandlers.createSubcategory);
router.put('/subcategories/:id', auth, taxonomyHandlers.updateSubcategory);
router.delete('/subcategories/:id', auth, taxonomyHandlers.deleteSubcategory);

// Tags
router.get('/tags', taxonomyHandlers.getTags);
router.get('/tags/:id', taxonomyHandlers.getTagById);
router.get('/tags/type/:type', taxonomyHandlers.getTagsByType);
router.post('/tags', auth, taxonomyHandlers.createTag);
router.put('/tags/:id', auth, taxonomyHandlers.updateTag);
router.delete('/tags/:id', auth, taxonomyHandlers.deleteTag);

// Content Mappings - Workbooks
router.get('/workbooks/:workbookId/taxonomy', taxonomyHandlers.getWorkbookTaxonomy);
router.post('/workbooks/:workbookId/categories', auth, taxonomyHandlers.addWorkbookCategory);
router.delete('/workbooks/:workbookId/categories/:categoryId', auth, taxonomyHandlers.removeWorkbookCategory);
router.post('/workbooks/:workbookId/subcategories', auth, taxonomyHandlers.addWorkbookSubcategory);
router.delete('/workbooks/:workbookId/subcategories/:subcategoryId', auth, taxonomyHandlers.removeWorkbookSubcategory);
router.post('/workbooks/:workbookId/tags', auth, taxonomyHandlers.addWorkbookTag);
router.delete('/workbooks/:workbookId/tags/:tagId', auth, taxonomyHandlers.removeWorkbookTag);

// Content Mappings - Books
router.get('/books/:bookId/taxonomy', taxonomyHandlers.getBookTaxonomy);
router.post('/books/:bookId/categories', auth, taxonomyHandlers.addBookCategory);
router.delete('/books/:bookId/categories/:categoryId', auth, taxonomyHandlers.removeBookCategory);
router.post('/books/:bookId/subcategories', auth, taxonomyHandlers.addBookSubcategory);
router.delete('/books/:bookId/subcategories/:subcategoryId', auth, taxonomyHandlers.removeBookSubcategory);
router.post('/books/:bookId/tags', auth, taxonomyHandlers.addBookTag);
router.delete('/books/:bookId/tags/:tagId', auth, taxonomyHandlers.removeBookTag);

// Content Mappings - Products
router.get('/products/:productId/taxonomy', taxonomyHandlers.getProductTaxonomy);
router.post('/products/:productId/categories', auth, taxonomyHandlers.addProductCategory);
router.delete('/products/:productId/categories/:categoryId', auth, taxonomyHandlers.removeProductCategory);
router.post('/products/:productId/tags', auth, taxonomyHandlers.addProductTag);
router.delete('/products/:productId/tags/:tagId', auth, taxonomyHandlers.removeProductTag);

// Browse by taxonomy
router.get('/browse/category/:categorySlug', taxonomyHandlers.browseByCategory);
router.get('/browse/subcategory/:subcategorySlug', taxonomyHandlers.browseBySubcategory);
router.get('/browse/tag/:tagSlug', taxonomyHandlers.browseByTag);

export default router;

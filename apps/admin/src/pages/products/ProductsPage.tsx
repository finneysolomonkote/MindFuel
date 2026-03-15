import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  ShoppingCart,
  CloudUpload,
  Image as ImageIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../services/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  productCount?: number;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  isActive: boolean;
  image?: File;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Product Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '',
    isActive: true,
  });
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Category Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  });
  const [categoryFormErrors, setCategoryFormErrors] = useState<Record<string, string>>({});

  // Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchQuery, filterCategory]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          category: filterCategory !== 'all' ? filterCategory : undefined,
        },
      });
      setProducts(response.data.products || response.data);
      setTotalCount(response.data.total || response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/shop/categories');
      setCategories(response.data.categories || response.data);
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        categoryId: product.categoryId,
        stock: product.stock.toString(),
        isActive: product.isActive,
      });
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        stock: '',
        isActive: true,
      });
      setImagePreview(null);
    }
    setProductFormErrors({});
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      stock: '',
      isActive: true,
    });
    setProductFormErrors({});
    setImagePreview(null);
  };

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!productFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!productFormData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!productFormData.price || parseFloat(productFormData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!productFormData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (!productFormData.stock || parseInt(productFormData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required';
    }

    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFormData({ ...productFormData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProduct = async () => {
    if (!validateProductForm()) return;

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('name', productFormData.name);
      submitData.append('description', productFormData.description);
      submitData.append('price', productFormData.price);
      submitData.append('categoryId', productFormData.categoryId);
      submitData.append('stock', productFormData.stock);
      submitData.append('isActive', String(productFormData.isActive));

      if (productFormData.image) {
        submitData.append('image', productFormData.image);
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success',
        });
      } else {
        await api.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({
          open: true,
          message: 'Product created successfully',
          severity: 'success',
        });
      }

      handleCloseProductDialog();
      fetchProducts();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save product',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await api.put(`/products/${product.id}`, {
        isActive: !product.isActive,
      });
      setSnackbar({
        open: true,
        message: `Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
      fetchProducts();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update product',
        severity: 'error',
      });
    }
  };

  // Category Management
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        description: '',
      });
    }
    setCategoryFormErrors({});
    setCategoryDialogOpen(true);
  };

  const validateCategoryForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!categoryFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    setCategoryFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitCategory = async () => {
    if (!validateCategoryForm()) return;

    try {
      if (editingCategory) {
        await api.put(`/shop/categories/${editingCategory.id}`, categoryFormData);
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success',
        });
      } else {
        await api.post('/shop/categories', categoryFormData);
        setSnackbar({
          open: true,
          message: 'Category created successfully',
          severity: 'success',
        });
      }
      setCategoryDialogOpen(false);
      fetchCategories();
      fetchProducts();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save category',
        severity: 'error',
      });
    }
  };

  // Delete Functions
  const handleDeleteClick = (type: string, id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'product') {
        await api.delete(`/products/${itemToDelete.id}`);
        setSnackbar({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success',
        });
        fetchProducts();
      } else if (itemToDelete.type === 'category') {
        await api.delete(`/shop/categories/${itemToDelete.id}`);
        setSnackbar({
          open: true,
          message: 'Category deleted successfully',
          severity: 'success',
        });
        fetchCategories();
        fetchProducts();
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete item',
        severity: 'error',
      });
    }
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner message="Loading products..." />;
  }

  if (error && products.length === 0) {
    return <ErrorAlert error={error} onRetry={fetchProducts} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products Management</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => handleOpenCategoryDialog()}
          >
            Manage Categories
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenProductDialog()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(0);
                }}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {products.length === 0 && !loading ? (
        <EmptyState
          title="No products found"
          message="Get started by creating your first product"
          actionLabel="Add Product"
          onAction={() => handleOpenProductDialog()}
          icon={<ShoppingCart fontSize="inherit" />}
        />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrl ? (
                        <Box
                          component="img"
                          src={product.imageUrl}
                          alt={product.name}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ImageIcon sx={{ color: 'grey.400' }} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.description.substring(0, 50)}
                        {product.description.length > 50 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        ${product.price.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={product.isActive}
                            onChange={() => handleToggleActive(product)}
                            size="small"
                          />
                        }
                        label={
                          <Chip
                            label={product.isActive ? 'Active' : 'Inactive'}
                            color={product.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenProductDialog(product)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick('product', product.id, product.name)}
                        color="error"
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Categories</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.productCount || 0} products
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCategoryDialog(category)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick('category', category.id, category.name)}
                        color="error"
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onClose={handleCloseProductDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Create Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={productFormData.name}
              onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
              error={!!productFormErrors.name}
              helperText={productFormErrors.name}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={productFormData.description}
              onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
              error={!!productFormErrors.description}
              helperText={productFormErrors.description}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Price"
              type="number"
              value={productFormData.price}
              onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
              error={!!productFormErrors.price}
              helperText={productFormErrors.price}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <FormControl fullWidth required error={!!productFormErrors.categoryId}>
              <InputLabel>Category</InputLabel>
              <Select
                value={productFormData.categoryId}
                onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {productFormErrors.categoryId && (
                <Typography variant="caption" color="error">
                  {productFormErrors.categoryId}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Stock"
              type="number"
              value={productFormData.stock}
              onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
              error={!!productFormErrors.stock}
              helperText={productFormErrors.stock}
              fullWidth
              required
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Upload Product Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview && (
                <Box mt={2} display="flex" justifyContent="center">
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1 }}
                  />
                </Box>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={productFormData.isActive}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitProduct}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={categoryFormData.name}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
              error={!!categoryFormErrors.name}
              helperText={categoryFormErrors.name}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={categoryFormData.description}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitCategory} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={`Delete ${itemToDelete?.type}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

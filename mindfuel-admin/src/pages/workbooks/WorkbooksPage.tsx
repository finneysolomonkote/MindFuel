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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  MenuBook,
  Refresh,
  CloudUpload,
  Image as ImageIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../services/api';

interface Workbook {
  id: string;
  title: string;
  description: string;
  author: string;
  coverImageUrl?: string;
  isPublished: boolean;
  chapterCount?: number;
  embeddingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface WorkbookFormData {
  title: string;
  description: string;
  author: string;
  coverImage?: File;
  isPublished: boolean;
}

export default function WorkbooksPage() {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkbook, setEditingWorkbook] = useState<Workbook | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workbookToDelete, setWorkbookToDelete] = useState<Workbook | null>(null);
  const [formData, setFormData] = useState<WorkbookFormData>({
    title: '',
    description: '',
    author: '',
    isPublished: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Fetch workbooks
  useEffect(() => {
    fetchWorkbooks();
  }, [page, rowsPerPage, searchQuery]);

  const fetchWorkbooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/workbooks', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
        },
      });
      setWorkbooks(response.data.workbooks || response.data);
      setTotalCount(response.data.total || response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch workbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (workbook?: Workbook) => {
    if (workbook) {
      setEditingWorkbook(workbook);
      setFormData({
        title: workbook.title,
        description: workbook.description,
        author: workbook.author,
        isPublished: workbook.isPublished,
      });
      if (workbook.coverImageUrl) {
        setImagePreview(workbook.coverImageUrl);
      }
    } else {
      setEditingWorkbook(null);
      setFormData({
        title: '',
        description: '',
        author: '',
        isPublished: false,
      });
      setImagePreview(null);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingWorkbook(null);
    setFormData({
      title: '',
      description: '',
      author: '',
      isPublished: false,
    });
    setFormErrors({});
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.author.trim()) {
      errors.author = 'Author is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('author', formData.author);
      submitData.append('isPublished', String(formData.isPublished));

      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }

      if (editingWorkbook) {
        await api.put(`/workbooks/${editingWorkbook.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({
          open: true,
          message: 'Workbook updated successfully',
          severity: 'success',
        });
      } else {
        await api.post('/workbooks', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSnackbar({
          open: true,
          message: 'Workbook created successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
      fetchWorkbooks();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save workbook',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (workbook: Workbook) => {
    try {
      await api.put(`/workbooks/${workbook.id}`, {
        isPublished: !workbook.isPublished,
      });
      setSnackbar({
        open: true,
        message: `Workbook ${!workbook.isPublished ? 'published' : 'unpublished'} successfully`,
        severity: 'success',
      });
      fetchWorkbooks();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update workbook',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (workbook: Workbook) => {
    setWorkbookToDelete(workbook);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workbookToDelete) return;

    try {
      await api.delete(`/workbooks/${workbookToDelete.id}`);
      setSnackbar({
        open: true,
        message: 'Workbook deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setWorkbookToDelete(null);
      fetchWorkbooks();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete workbook',
        severity: 'error',
      });
    }
  };

  const handleTriggerReEmbedding = async (workbook: Workbook) => {
    try {
      await api.post(`/admin/ingestion/books/${workbook.id}`);
      setSnackbar({
        open: true,
        message: 'Re-embedding triggered successfully',
        severity: 'success',
      });
      fetchWorkbooks();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to trigger re-embedding',
        severity: 'error',
      });
    }
  };

  if (loading && workbooks.length === 0) {
    return <LoadingSpinner message="Loading workbooks..." />;
  }

  if (error && workbooks.length === 0) {
    return <ErrorAlert error={error} onRetry={fetchWorkbooks} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Workbooks Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Workbook
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search workbooks..."
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
      </Paper>

      {workbooks.length === 0 && !loading ? (
        <EmptyState
          title="No workbooks found"
          message="Get started by creating your first workbook"
          actionLabel="Add Workbook"
          onAction={() => handleOpenDialog()}
          icon={<MenuBook fontSize="inherit" />}
        />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cover</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Chapters</TableCell>
                  <TableCell>Embedding Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workbooks.map((workbook) => (
                  <TableRow key={workbook.id}>
                    <TableCell>
                      {workbook.coverImageUrl ? (
                        <Box
                          component="img"
                          src={workbook.coverImageUrl}
                          alt={workbook.title}
                          sx={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 50,
                            height: 70,
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
                        {workbook.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {workbook.description.substring(0, 60)}
                        {workbook.description.length > 60 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{workbook.author}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={workbook.isPublished}
                            onChange={() => handleTogglePublish(workbook)}
                            size="small"
                          />
                        }
                        label={
                          <Chip
                            label={workbook.isPublished ? 'Published' : 'Draft'}
                            color={workbook.isPublished ? 'success' : 'default'}
                            size="small"
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>{workbook.chapterCount || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={workbook.embeddingStatus || 'pending'}
                        color={
                          workbook.embeddingStatus === 'completed'
                            ? 'success'
                            : workbook.embeddingStatus === 'processing'
                            ? 'info'
                            : workbook.embeddingStatus === 'failed'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(workbook.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleTriggerReEmbedding(workbook)}
                        title="Trigger Re-embedding"
                      >
                        <Refresh />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(workbook)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(workbook)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorkbook ? 'Edit Workbook' : 'Create Workbook'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!formErrors.title}
              helperText={formErrors.title}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!formErrors.description}
              helperText={formErrors.description}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              error={!!formErrors.author}
              helperText={formErrors.author}
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
                Upload Cover Image
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
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                />
              }
              label="Published"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingWorkbook ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Workbook"
        message={`Are you sure you want to delete "${workbookToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setWorkbookToDelete(null);
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

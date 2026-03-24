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
  FormatQuote,
} from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../services/api';

interface Quote {
  id: string;
  text: string;
  author: string;
  sourceBook?: string;
  sourceBookId?: string;
  isActive: boolean;
  displayDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuoteFormData {
  text: string;
  author: string;
  sourceBook: string;
  isActive: boolean;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>({
    text: '',
    author: '',
    sourceBook: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch quotes
  useEffect(() => {
    fetchQuotes();
  }, [page, rowsPerPage, searchQuery]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/quotes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
        },
      });
      setQuotes(response.data.quotes || response.data);
      setTotalCount(response.data.total || response.data.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (quote?: Quote) => {
    if (quote) {
      setEditingQuote(quote);
      setFormData({
        text: quote.text,
        author: quote.author,
        sourceBook: quote.sourceBook || '',
        isActive: quote.isActive,
      });
    } else {
      setEditingQuote(null);
      setFormData({
        text: '',
        author: '',
        sourceBook: '',
        isActive: true,
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuote(null);
    setFormData({
      text: '',
      author: '',
      sourceBook: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.text.trim()) {
      errors.text = 'Quote text is required';
    }
    if (!formData.author.trim()) {
      errors.author = 'Author is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingQuote) {
        await api.put(`/quotes/${editingQuote.id}`, formData);
        setSnackbar({
          open: true,
          message: 'Quote updated successfully',
          severity: 'success',
        });
      } else {
        await api.post('/quotes', formData);
        setSnackbar({
          open: true,
          message: 'Quote created successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
      fetchQuotes();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save quote',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (quote: Quote) => {
    try {
      await api.put(`/quotes/${quote.id}`, {
        isActive: !quote.isActive,
      });
      setSnackbar({
        open: true,
        message: `Quote ${!quote.isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
      fetchQuotes();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update quote',
        severity: 'error',
      });
    }
  };

  const handleDeleteClick = (quote: Quote) => {
    setQuoteToDelete(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quoteToDelete) return;

    try {
      await api.delete(`/quotes/${quoteToDelete.id}`);
      setSnackbar({
        open: true,
        message: 'Quote deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
      fetchQuotes();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete quote',
        severity: 'error',
      });
    }
  };

  if (loading && quotes.length === 0) {
    return <LoadingSpinner message="Loading quotes..." />;
  }

  if (error && quotes.length === 0) {
    return <ErrorAlert error={error} onRetry={fetchQuotes} />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quotes Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Quote
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
          placeholder="Search quotes..."
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

      {quotes.length === 0 && !loading ? (
        <EmptyState
          title="No quotes found"
          message="Get started by creating your first quote"
          actionLabel="Add Quote"
          onAction={() => handleOpenDialog()}
          icon={<FormatQuote fontSize="inherit" />}
        />
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quote</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Source Book</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Display Date</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <Box display="flex" alignItems="start" gap={1}>
                        <FormatQuote sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ maxWidth: 400 }}>
                          {quote.text.substring(0, 150)}
                          {quote.text.length > 150 ? '...' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {quote.author}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {quote.sourceBook ? (
                        <Chip label={quote.sourceBook} size="small" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No source
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={quote.isActive}
                            onChange={() => handleToggleActive(quote)}
                            size="small"
                          />
                        }
                        label={
                          <Chip
                            label={quote.isActive ? 'Active' : 'Inactive'}
                            color={quote.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {quote.displayDate
                        ? new Date(quote.displayDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(quote)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(quote)}
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
          {editingQuote ? 'Edit Quote' : 'Create Quote'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Quote Text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              error={!!formErrors.text}
              helperText={formErrors.text}
              fullWidth
              multiline
              rows={4}
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
            <TextField
              label="Source Book"
              value={formData.sourceBook}
              onChange={(e) => setFormData({ ...formData, sourceBook: e.target.value })}
              fullWidth
              helperText="Optional: The book or source of this quote"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
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
            {submitting ? 'Saving...' : editingQuote ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Quote"
        message={`Are you sure you want to delete this quote by "${quoteToDelete?.author}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setQuoteToDelete(null);
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

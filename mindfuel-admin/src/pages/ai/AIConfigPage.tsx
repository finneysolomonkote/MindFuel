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
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Slider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Psychology,
  Settings,
  BarChart,
  DataObject,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../services/api';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  isActive: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface ModelConfig {
  id: string;
  name: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  isActive: boolean;
  createdAt: string;
}

interface UsageStats {
  date: string;
  queries: number;
  tokens: number;
  cost: number;
}

interface IngestionBook {
  id: string;
  title: string;
  embeddingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  lastIngestionAt?: string;
  chunkCount?: number;
  errorMessage?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AIConfigPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Prompt Templates State
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [promptFormData, setPromptFormData] = useState({
    name: '',
    description: '',
    template: '',
    category: '',
    isActive: false,
  });
  const [promptFormErrors, setPromptFormErrors] = useState<Record<string, string>>({});

  // Model Configs State
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [modelFormData, setModelFormData] = useState({
    name: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    topP: 1,
    isActive: false,
  });

  // Usage Stats State
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [totalQueries, setTotalQueries] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Ingestion State
  const [ingestionBooks, setIngestionBooks] = useState<IngestionBook[]>([]);

  // Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  useEffect(() => {
    if (tabValue === 0) {
      fetchPrompts();
    } else if (tabValue === 1) {
      fetchModelConfigs();
    } else if (tabValue === 2) {
      fetchUsageStats();
    } else if (tabValue === 3) {
      fetchIngestionBooks();
    }
  }, [tabValue]);

  // Prompt Templates Functions
  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/ai/prompts');
      setPrompts(response.data.prompts || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPromptDialog = (prompt?: PromptTemplate) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setPromptFormData({
        name: prompt.name,
        description: prompt.description,
        template: prompt.template,
        category: prompt.category,
        isActive: prompt.isActive,
      });
    } else {
      setEditingPrompt(null);
      setPromptFormData({
        name: '',
        description: '',
        template: '',
        category: '',
        isActive: false,
      });
    }
    setPromptFormErrors({});
    setPromptDialogOpen(true);
  };

  const validatePromptForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!promptFormData.name.trim()) errors.name = 'Name is required';
    if (!promptFormData.template.trim()) errors.template = 'Template is required';
    if (!promptFormData.category.trim()) errors.category = 'Category is required';
    setPromptFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPrompt = async () => {
    if (!validatePromptForm()) return;

    try {
      if (editingPrompt) {
        await api.put(`/ai/prompts/${editingPrompt.id}`, promptFormData);
        setSnackbar({ open: true, message: 'Prompt updated successfully', severity: 'success' });
      } else {
        await api.post('/ai/prompts', promptFormData);
        setSnackbar({ open: true, message: 'Prompt created successfully', severity: 'success' });
      }
      setPromptDialogOpen(false);
      fetchPrompts();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save prompt',
        severity: 'error',
      });
    }
  };

  const handleTogglePromptActive = async (prompt: PromptTemplate) => {
    try {
      await api.put(`/ai/prompts/${prompt.id}`, { isActive: !prompt.isActive });
      setSnackbar({
        open: true,
        message: `Prompt ${!prompt.isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
      fetchPrompts();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update prompt',
        severity: 'error',
      });
    }
  };

  // Model Configs Functions
  const fetchModelConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/ai/models');
      setModelConfigs(response.data.models || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch model configs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModelDialog = (model?: ModelConfig) => {
    if (model) {
      setEditingModel(model);
      setModelFormData({
        name: model.name,
        model: model.model,
        temperature: model.temperature,
        maxTokens: model.maxTokens,
        topP: model.topP,
        isActive: model.isActive,
      });
    } else {
      setEditingModel(null);
      setModelFormData({
        name: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        isActive: false,
      });
    }
    setModelDialogOpen(true);
  };

  const handleSubmitModel = async () => {
    try {
      if (editingModel) {
        await api.put(`/ai/models/${editingModel.id}`, modelFormData);
        setSnackbar({ open: true, message: 'Model config updated successfully', severity: 'success' });
      } else {
        await api.post('/ai/models', modelFormData);
        setSnackbar({ open: true, message: 'Model config created successfully', severity: 'success' });
      }
      setModelDialogOpen(false);
      fetchModelConfigs();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save model config',
        severity: 'error',
      });
    }
  };

  // Usage Stats Functions
  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/ai/usage');
      const stats = response.data.stats || response.data;
      setUsageStats(stats);

      // Calculate totals
      const queries = stats.reduce((sum: number, s: UsageStats) => sum + s.queries, 0);
      const tokens = stats.reduce((sum: number, s: UsageStats) => sum + s.tokens, 0);
      const cost = stats.reduce((sum: number, s: UsageStats) => sum + s.cost, 0);

      setTotalQueries(queries);
      setTotalTokens(tokens);
      setTotalCost(cost);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch usage stats');
    } finally {
      setLoading(false);
    }
  };

  // Ingestion Functions
  const fetchIngestionBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/ingestion/books');
      setIngestionBooks(response.data.books || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ingestion status');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerIngestion = async (bookId: string) => {
    try {
      await api.post(`/admin/ingestion/books/${bookId}`);
      setSnackbar({ open: true, message: 'Ingestion triggered successfully', severity: 'success' });
      fetchIngestionBooks();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to trigger ingestion',
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
      if (itemToDelete.type === 'prompt') {
        await api.delete(`/ai/prompts/${itemToDelete.id}`);
        setSnackbar({ open: true, message: 'Prompt deleted successfully', severity: 'success' });
        fetchPrompts();
      } else if (itemToDelete.type === 'model') {
        await api.delete(`/ai/models/${itemToDelete.id}`);
        setSnackbar({ open: true, message: 'Model config deleted successfully', severity: 'success' });
        fetchModelConfigs();
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">AI Configuration</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<Psychology />} label="Prompt Templates" iconPosition="start" />
          <Tab icon={<Settings />} label="Model Configs" iconPosition="start" />
          <Tab icon={<BarChart />} label="Usage Stats" iconPosition="start" />
          <Tab icon={<DataObject />} label="Ingestion Status" iconPosition="start" />
        </Tabs>

        {/* Prompt Templates Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenPromptDialog()}
            >
              Add Prompt Template
            </Button>
          </Box>

          {loading ? (
            <LoadingSpinner message="Loading prompts..." />
          ) : prompts.length === 0 ? (
            <EmptyState
              title="No prompt templates found"
              message="Create your first prompt template to get started"
              actionLabel="Add Prompt Template"
              onAction={() => handleOpenPromptDialog()}
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {prompt.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={prompt.category} size="small" />
                      </TableCell>
                      <TableCell>{prompt.description}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={prompt.isActive}
                              onChange={() => handleTogglePromptActive(prompt)}
                              size="small"
                            />
                          }
                          label={
                            <Chip
                              label={prompt.isActive ? 'Active' : 'Inactive'}
                              color={prompt.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPromptDialog(prompt)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick('prompt', prompt.id, prompt.name)}
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
          )}
        </TabPanel>

        {/* Model Configs Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModelDialog()}
            >
              Add Model Config
            </Button>
          </Box>

          {loading ? (
            <LoadingSpinner message="Loading model configs..." />
          ) : modelConfigs.length === 0 ? (
            <EmptyState
              title="No model configs found"
              message="Create your first model configuration"
              actionLabel="Add Model Config"
              onAction={() => handleOpenModelDialog()}
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Temperature</TableCell>
                    <TableCell>Max Tokens</TableCell>
                    <TableCell>Top P</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {config.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{config.model}</TableCell>
                      <TableCell>{config.temperature}</TableCell>
                      <TableCell>{config.maxTokens}</TableCell>
                      <TableCell>{config.topP}</TableCell>
                      <TableCell>
                        <Chip
                          label={config.isActive ? 'Active' : 'Inactive'}
                          color={config.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModelDialog(config)}
                          title="Edit"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick('model', config.id, config.name)}
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
          )}
        </TabPanel>

        {/* Usage Stats Tab */}
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <LoadingSpinner message="Loading usage statistics..." />
          ) : (
            <>
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Queries
                      </Typography>
                      <Typography variant="h4">{totalQueries.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Tokens
                      </Typography>
                      <Typography variant="h4">{totalTokens.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Cost
                      </Typography>
                      <Typography variant="h4">${totalCost.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Queries Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="queries" stroke="#8884d8" name="Queries" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Token Usage
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={usageStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tokens" fill="#82ca9d" name="Tokens" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Paper>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Queries</TableCell>
                      <TableCell align="right">Tokens</TableCell>
                      <TableCell align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usageStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell>{stat.date}</TableCell>
                        <TableCell align="right">{stat.queries.toLocaleString()}</TableCell>
                        <TableCell align="right">{stat.tokens.toLocaleString()}</TableCell>
                        <TableCell align="right">${stat.cost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </TabPanel>

        {/* Ingestion Status Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchIngestionBooks}
            >
              Refresh Status
            </Button>
          </Box>

          {loading ? (
            <LoadingSpinner message="Loading ingestion status..." />
          ) : ingestionBooks.length === 0 ? (
            <EmptyState title="No books found" message="No books available for ingestion" />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Chunks</TableCell>
                    <TableCell>Last Ingestion</TableCell>
                    <TableCell>Error</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ingestionBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {book.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={book.embeddingStatus}
                          color={
                            book.embeddingStatus === 'completed'
                              ? 'success'
                              : book.embeddingStatus === 'processing'
                              ? 'info'
                              : book.embeddingStatus === 'failed'
                              ? 'error'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{book.chunkCount || 0}</TableCell>
                      <TableCell>
                        {book.lastIngestionAt
                          ? new Date(book.lastIngestionAt).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {book.errorMessage && (
                          <Typography variant="caption" color="error">
                            {book.errorMessage.substring(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Refresh />}
                          onClick={() => handleTriggerIngestion(book.id)}
                          disabled={book.embeddingStatus === 'processing'}
                        >
                          Trigger Ingestion
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Prompt Template Dialog */}
      <Dialog open={promptDialogOpen} onClose={() => setPromptDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrompt ? 'Edit Prompt Template' : 'Create Prompt Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={promptFormData.name}
              onChange={(e) => setPromptFormData({ ...promptFormData, name: e.target.value })}
              error={!!promptFormErrors.name}
              helperText={promptFormErrors.name}
              fullWidth
              required
            />
            <TextField
              label="Category"
              value={promptFormData.category}
              onChange={(e) => setPromptFormData({ ...promptFormData, category: e.target.value })}
              error={!!promptFormErrors.category}
              helperText={promptFormErrors.category}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={promptFormData.description}
              onChange={(e) => setPromptFormData({ ...promptFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Template"
              value={promptFormData.template}
              onChange={(e) => setPromptFormData({ ...promptFormData, template: e.target.value })}
              error={!!promptFormErrors.template}
              helperText={promptFormErrors.template || 'Use {variable} for placeholders'}
              fullWidth
              multiline
              rows={6}
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={promptFormData.isActive}
                  onChange={(e) => setPromptFormData({ ...promptFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitPrompt} variant="contained">
            {editingPrompt ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Model Config Dialog */}
      <Dialog open={modelDialogOpen} onClose={() => setModelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingModel ? 'Edit Model Config' : 'Create Model Config'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Name"
              value={modelFormData.name}
              onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Model"
              value={modelFormData.model}
              onChange={(e) => setModelFormData({ ...modelFormData, model: e.target.value })}
              fullWidth
              required
              helperText="e.g., gpt-4, gpt-3.5-turbo, claude-3-opus"
            />
            <Box>
              <Typography gutterBottom>Temperature: {modelFormData.temperature}</Typography>
              <Slider
                value={modelFormData.temperature}
                onChange={(_, value) => setModelFormData({ ...modelFormData, temperature: value as number })}
                min={0}
                max={2}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            <TextField
              label="Max Tokens"
              type="number"
              value={modelFormData.maxTokens}
              onChange={(e) => setModelFormData({ ...modelFormData, maxTokens: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <Box>
              <Typography gutterBottom>Top P: {modelFormData.topP}</Typography>
              <Slider
                value={modelFormData.topP}
                onChange={(_, value) => setModelFormData({ ...modelFormData, topP: value as number })}
                min={0}
                max={1}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={modelFormData.isActive}
                  onChange={(e) => setModelFormData({ ...modelFormData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModelDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitModel} variant="contained">
            {editingModel ? 'Update' : 'Create'}
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

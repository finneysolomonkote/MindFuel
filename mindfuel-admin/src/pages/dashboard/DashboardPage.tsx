import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  People,
  MenuBook,
  ShoppingCart,
  TrendingUp,
  Psychology,
  AttachMoney,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

interface Stats {
  total_users: number;
  active_users_30d: number;
  total_books: number;
  total_orders: number;
  total_revenue: number;
  ai_queries_count: number;
  token_usage: number;
  token_cost: number;
  top_books?: Array<{ title: string; sales: number }>;
  recent_orders?: Array<any>;
  ai_usage_chart?: Array<{ date: string; queries: number; tokens: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/analytics/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorAlert error={error} onRetry={fetchStats} />;
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users || 0,
      icon: <People fontSize="large" />,
      color: '#2563eb',
    },
    {
      title: 'Active Users (30d)',
      value: stats.active_users_30d || 0,
      icon: <People fontSize="large" />,
      color: '#10b981',
    },
    {
      title: 'Total Books',
      value: stats.total_books || 0,
      icon: <MenuBook fontSize="large" />,
      color: '#f59e0b',
    },
    {
      title: 'Total Orders',
      value: stats.total_orders || 0,
      icon: <ShoppingCart fontSize="large" />,
      color: '#8b5cf6',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.total_revenue || 0).toFixed(2)}`,
      icon: <AttachMoney fontSize="large" />,
      color: '#10b981',
    },
    {
      title: 'AI Queries',
      value: stats.ai_queries_count || 0,
      icon: <Psychology fontSize="large" />,
      color: '#ec4899',
    },
    {
      title: 'Token Usage',
      value: (stats.token_usage || 0).toLocaleString(),
      icon: <TrendingUp fontSize="large" />,
      color: '#f97316',
    },
    {
      title: 'Token Cost',
      value: `$${(stats.token_cost || 0).toFixed(2)}`,
      icon: <AttachMoney fontSize="large" />,
      color: '#ef4444',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: card.color }}>{card.icon}</Box>
              <Box>
                <Typography variant="h4">{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}

        {stats.ai_usage_chart && stats.ai_usage_chart.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Usage Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.ai_usage_chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="queries"
                      stroke="#8b5cf6"
                      name="Queries"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tokens"
                      stroke="#f59e0b"
                      name="Tokens"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stats.top_books && stats.top_books.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Books
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.top_books}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {stats.recent_orders && stats.recent_orders.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recent_orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{order.user_email || 'N/A'}</TableCell>
                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={
                              order.status === 'completed'
                                ? 'success'
                                : order.status === 'pending'
                                ? 'warning'
                                : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

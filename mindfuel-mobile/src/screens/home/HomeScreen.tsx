import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { HomeStackParamList, DashboardData } from '../../types';
import { userApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import QuoteCard from '../../components/QuoteCard';
import BookCard from '../../components/BookCard';
import ProductCard from '../../components/ProductCard';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Avatar from '../../components/Avatar';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      const data = await userApi.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading && !dashboard) {
    return <LoadingSpinner fullScreen />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{user?.name || 'Friend'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as any)}>
          <Avatar uri={user?.avatar} name={user?.name} size={48} />
        </TouchableOpacity>
      </View>

      {/* Daily Quote */}
      {dashboard?.quote && <QuoteCard quote={dashboard.quote} />}

      {/* Continue Reading */}
      {dashboard?.continueReading && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Reading</Text>
          <Card style={styles.continueCard}>
            <View style={styles.continueContent}>
              <View style={styles.continueInfo}>
                <Text style={styles.continueTitle} numberOfLines={2}>
                  {dashboard.continueReading.book.title}
                </Text>
                <Text style={styles.continueChapter}>
                  Chapter {dashboard.continueReading.currentChapterId || 1}
                </Text>
                <ProgressBar
                  progress={dashboard.continueReading.progress}
                  style={styles.continueProgress}
                />
                <Text style={styles.continueProgressText}>
                  {Math.round(dashboard.continueReading.progress)}% Complete
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() =>
                navigation.navigate('Reader', {
                  bookId: dashboard.continueReading!.book.id,
                  chapterId: dashboard.continueReading!.currentChapterId,
                })
              }
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}

      {/* AI Coach Shortcut */}
      <TouchableOpacity
        style={styles.aiCard}
        onPress={() => navigation.navigate('AIChat' as any, {})}
      >
        <View style={styles.aiIcon}>
          <Text style={styles.aiEmoji}>🤖</Text>
        </View>
        <View style={styles.aiContent}>
          <Text style={styles.aiTitle}>Ask Your AI Coach</Text>
          <Text style={styles.aiSubtitle}>Get personalized guidance</Text>
        </View>
        <Text style={styles.aiArrow}>›</Text>
      </TouchableOpacity>

      {/* Progress Summary */}
      {dashboard?.stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{dashboard.stats.booksCompleted}</Text>
              <Text style={styles.statLabel}>Books Completed</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{dashboard.stats.readingStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{dashboard.stats.practicesCompleted}</Text>
              <Text style={styles.statLabel}>Practices</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{dashboard.stats.journalEntries || 0}</Text>
              <Text style={styles.statLabel}>Journal Entries</Text>
            </Card>
          </View>
        </View>
      )}

      {/* Recommended Practice */}
      {dashboard?.recommendedPractice && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Practice</Text>
          <Card style={styles.practiceCard}>
            <Text style={styles.practiceEmoji}>🧘</Text>
            <Text style={styles.practiceTitle}>{dashboard.recommendedPractice.title}</Text>
            <Text style={styles.practiceDescription}>
              {dashboard.recommendedPractice.description}
            </Text>
            <Text style={styles.practiceDuration}>
              {dashboard.recommendedPractice.duration} minutes
            </Text>
            <TouchableOpacity
              style={styles.practiceButton}
              onPress={() =>
                navigation.navigate('PracticeDetail', {
                  practiceId: dashboard.recommendedPractice!.id,
                })
              }
            >
              <Text style={styles.practiceButtonText}>Start Practice</Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}

      {/* Featured Products */}
      {dashboard?.featuredProducts && dashboard.featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shop' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
            {dashboard.featuredProducts.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <ProductCard
                  product={product}
                  onPress={() => navigation.navigate('ProductDetail' as any, { productId: product.id })}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  continueCard: {
    padding: 20,
  },
  continueContent: {
    marginBottom: 16,
  },
  continueInfo: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  continueChapter: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  continueProgress: {
    marginBottom: 8,
  },
  continueProgressText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aiIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiEmoji: {
    fontSize: 28,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  aiArrow: {
    fontSize: 32,
    color: '#4A90E2',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  practiceCard: {
    padding: 24,
    alignItems: 'center',
  },
  practiceEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  practiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  practiceDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  practiceDuration: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 16,
  },
  practiceButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  practiceButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  productItem: {
    width: width * 0.45,
    marginRight: 12,
  },
});

export default HomeScreen;

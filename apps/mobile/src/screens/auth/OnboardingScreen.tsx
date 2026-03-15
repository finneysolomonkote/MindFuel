import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const slides = [
  {
    id: '1',
    title: 'Welcome to MindFuel AI',
    description: 'Your personal AI-powered companion for self-growth and mindfulness',
    emoji: '🧠',
  },
  {
    id: '2',
    title: 'Read & Reflect',
    description: 'Access transformative workbooks and track your reading progress',
    emoji: '📚',
  },
  {
    id: '3',
    title: 'AI Coach',
    description: 'Get personalized guidance from your AI coach anytime, anywhere',
    emoji: '💬',
  },
  {
    id: '4',
    title: 'Practice & Grow',
    description: 'Daily practices, journaling, and goal tracking for continuous growth',
    emoji: '🌱',
  },
];

const goals = [
  { id: 'personal-growth', label: 'Personal Growth', icon: '🚀' },
  { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
  { id: 'productivity', label: 'Productivity', icon: '⚡' },
  { id: 'relationships', label: 'Relationships', icon: '❤️' },
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === slides.length;

  const handleNext = () => {
    if (currentIndex < slides.length) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    flatListRef.current?.scrollToEnd();
    setCurrentIndex(slides.length);
  };

  const handleGetStarted = () => {
    // In a real app, save selected goals to backend
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const renderGoalSelection = () => (
    <View style={styles.slide}>
      <Text style={styles.slideTitle}>What are your goals?</Text>
      <Text style={styles.slideDescription}>
        Select all that apply. We'll personalize your experience.
      </Text>
      <View style={styles.goalsContainer}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.goalCard, selectedGoals.includes(goal.id) && styles.goalCardSelected]}
            onPress={() => toggleGoal(goal.id)}
          >
            <Text style={styles.goalIcon}>{goal.icon}</Text>
            <Text style={[styles.goalLabel, selectedGoals.includes(goal.id) && styles.goalLabelSelected]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={[...slides, { id: 'goals' }]}
        renderItem={({ item }) => (item.id === 'goals' ? renderGoalSelection() : renderSlide({ item }))}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {[...slides, { id: 'goals' }].map((_, index) => (
            <View key={index} style={[styles.dot, currentIndex === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.buttons}>
          {!isLastSlide && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          <Button
            title={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
  },
  goalCard: {
    width: '45%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    margin: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  goalIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#4A90E2',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#4A90E2',
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
});

export default OnboardingScreen;

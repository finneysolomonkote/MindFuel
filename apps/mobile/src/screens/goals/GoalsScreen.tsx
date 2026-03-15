import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchGoals } from '../../store/slices/goalsSlice';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';

const GoalsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goals } = useAppSelector((state) => state.goals);

  useEffect(() => {
    dispatch(fetchGoals());
  }, []);

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 64 }}>🎯</Text>}
        title="No Goals Yet"
        message="Set your first goal and start your journey"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.goalCard}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalDescription}>{item.description}</Text>
            <ProgressBar progress={item.progress} style={styles.progress} />
            <Text style={styles.progressText}>{Math.round(item.progress)}% Complete</Text>
          </Card>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 16,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progress: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default GoalsScreen;

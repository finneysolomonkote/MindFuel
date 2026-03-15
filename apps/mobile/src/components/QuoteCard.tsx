import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyQuote } from '../types';

interface QuoteCardProps {
  quote: DailyQuote;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  return (
    <LinearGradient
      colors={['#4A90E2', '#6C63FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.icon}>💡</Text>
      <Text style={styles.text}>"{quote.text}"</Text>
      <Text style={styles.author}>— {quote.author}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    fontSize: 32,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#FFF',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  author: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    opacity: 0.9,
  },
});

export default QuoteCard;

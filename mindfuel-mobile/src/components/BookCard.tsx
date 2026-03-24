import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LibraryBook } from '../types';
import ProgressBar from './ProgressBar';

interface BookCardProps {
  book: LibraryBook;
  onPress: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: book.book.coverImage }} style={styles.cover} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.book.author}
        </Text>
        <ProgressBar progress={book.progress} height={4} style={styles.progress} />
        <Text style={styles.progressText}>{Math.round(book.progress)}% Complete</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
  },
  cover: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  content: {
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progress: {
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default BookCard;

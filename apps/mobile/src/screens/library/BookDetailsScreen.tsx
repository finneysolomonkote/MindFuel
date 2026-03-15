import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchLibraryBook, fetchChapters } from '../../store/slices/booksSlice';
import { LibraryStackParamList } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import Card from '../../components/Card';

type Props = NativeStackScreenProps<LibraryStackParamList, 'BookDetails'>;

const BookDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId } = route.params;
  const dispatch = useAppDispatch();
  const { currentBook, chapters, loading } = useAppSelector((state) => state.books);

  useEffect(() => {
    dispatch(fetchLibraryBook(bookId));
    dispatch(fetchChapters(bookId));
  }, [bookId]);

  if (loading || !currentBook) {
    return <LoadingSpinner fullScreen />;
  }

  const progress = Math.round(currentBook.progress);
  const completedChapters = currentBook.completedChapters.length;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: currentBook.book.coverImage }} style={styles.cover} />

      <View style={styles.content}>
        <Text style={styles.title}>{currentBook.book.title}</Text>
        <Text style={styles.author}>by {currentBook.book.author}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          <ProgressBar progress={progress} height={8} />
          <Text style={styles.chaptersText}>
            {completedChapters} of {chapters.length} chapters completed
          </Text>
        </View>

        <Button
          title={progress > 0 ? 'Continue Reading' : 'Start Reading'}
          onPress={() =>
            navigation.navigate('Reader', {
              bookId,
              chapterId: currentBook.currentChapterId || chapters[0]?.id,
            })
          }
          style={styles.readButton}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Book</Text>
          <Text style={styles.description}>{currentBook.book.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          {chapters.map((chapter, index) => {
            const isCompleted = currentBook.completedChapters.includes(chapter.id);
            return (
              <TouchableOpacity
                key={chapter.id}
                style={styles.chapterItem}
                onPress={() => navigation.navigate('Reader', { bookId, chapterId: chapter.id })}
              >
                <View style={styles.chapterInfo}>
                  <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </View>
                {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  cover: {
    width: '100%',
    height: 400,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
  },
  chaptersText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  readButton: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterNumber: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 2,
  },
  chapterTitle: {
    fontSize: 16,
    color: '#333',
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
  },
});

export default BookDetailsScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchChapter, updateReadingProgress } from '../../store/slices/booksSlice';
import { LibraryStackParamList } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Reader'>;

const { height } = Dimensions.get('window');

const ReaderScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId, chapterId } = route.params;
  const dispatch = useAppDispatch();
  const { currentChapter, loading } = useAppSelector((state) => state.books);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    if (chapterId) {
      dispatch(fetchChapter({ bookId, chapterId }));
    }
  }, [bookId, chapterId]);

  useEffect(() => {
    if (currentChapter && currentSectionIndex < currentChapter.sections.length) {
      const section = currentChapter.sections[currentSectionIndex];
      dispatch(updateReadingProgress({
        bookId,
        progress: {
          bookId,
          chapterId: currentChapter.id,
          sectionId: section.id,
          pageNumber: section.pageNumber,
          progress: ((currentSectionIndex + 1) / currentChapter.sections.length) * 100,
        },
      }));
    }
  }, [currentSectionIndex, currentChapter]);

  if (loading || !currentChapter) {
    return <LoadingSpinner fullScreen />;
  }

  const currentSection = currentChapter.sections[currentSectionIndex];
  const isFirstPage = currentSectionIndex === 0;
  const isLastPage = currentSectionIndex === currentChapter.sections.length - 1;

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Chapters', { bookId })}>
          <Text style={styles.chaptersButton}>Chapters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.chapterTitle}>{currentChapter.title}</Text>
        <Text style={styles.sectionTitle}>{currentSection.title}</Text>
        <Text style={styles.text}>{currentSection.content}</Text>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, isFirstPage && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstPage}
        >
          <Text style={[styles.navButtonText, isFirstPage && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.pageIndicator}>
          {currentSectionIndex + 1} / {currentChapter.sections.length}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, isLastPage && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={isLastPage}
        >
          <Text style={[styles.navButtonText, isLastPage && styles.navButtonTextDisabled]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.aiButton}
        onPress={() =>
          navigation.navigate('AIChat' as any, {
            context: {
              bookId,
              chapterId: currentChapter.id,
              sectionId: currentSection.id,
              pageNumber: currentSection.pageNumber,
            },
          })
        }
      >
        <Text style={styles.aiButtonText}>🤖 Ask AI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
  },
  chaptersButton: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 28,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  pageIndicator: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  aiButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  aiButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReaderScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchLibrary } from '../../store/slices/booksSlice';
import { LibraryStackParamList, LibraryBook } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import BookCard from '../../components/BookCard';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Library'>;

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { library, loading } = useAppSelector((state) => state.books);
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all');

  useEffect(() => {
    dispatch(fetchLibrary());
  }, []);

  const filteredLibrary = library.filter((book) => {
    if (filter === 'reading') return book.progress > 0 && book.progress < 100;
    if (filter === 'completed') return book.progress === 100;
    return true;
  });

  if (loading && library.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  if (library.length === 0) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 64 }}>📚</Text>}
        title="No Books Yet"
        message="Start building your library by exploring our collection"
        actionLabel="Browse Books"
        onAction={() => {}}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'reading' && styles.filterButtonActive]}
          onPress={() => setFilter('reading')}
        >
          <Text style={[styles.filterText, filter === 'reading' && styles.filterTextActive]}>
            Reading
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLibrary}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.bookItem}>
            <BookCard
              book={item}
              onPress={() => navigation.navigate('BookDetails', { bookId: item.book.id })}
            />
          </View>
        )}
        numColumns={2}
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
  filters: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },
  list: {
    padding: 16,
  },
  bookItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default LibraryScreen;

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../../store';
import { LibraryStackParamList } from '../../types';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Chapters'>;

const ChaptersScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookId } = route.params;
  const { chapters, currentBook } = useAppSelector((state) => state.books);

  return (
    <View style={styles.container}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isCompleted = currentBook?.completedChapters.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.chapterItem}
              onPress={() => navigation.navigate('Reader', { bookId, chapterId: item.id })}
            >
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterNumber}>Chapter {index + 1}</Text>
                <Text style={styles.chapterTitle}>{item.title}</Text>
              </View>
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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

export default ChaptersScreen;

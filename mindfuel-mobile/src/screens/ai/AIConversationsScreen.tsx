import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchConversations } from '../../store/slices/aiSlice';
import { AIStackParamList } from '../../types';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<AIStackParamList, 'AIConversations'>;

const AIConversationsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { conversations } = useAppSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchConversations());
  }, []);

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<Text style={{ fontSize: 64 }}>💬</Text>}
        title="No Conversations Yet"
        message="Start a conversation with your AI coach"
        actionLabel="New Conversation"
        onAction={() => navigation.navigate('AIChat', {})}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="New Conversation"
          onPress={() => navigation.navigate('AIChat', {})}
        />
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => navigation.navigate('AIChat', { conversationId: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.lastMessage} numberOfLines={2}>
              {item.lastMessage}
            </Text>
            <Text style={styles.date}>
              {new Date(item.lastMessageAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
  },
  conversationItem: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default AIConversationsScreen;

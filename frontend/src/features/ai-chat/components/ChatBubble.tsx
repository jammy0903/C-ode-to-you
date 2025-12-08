import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../../shared/types/api.types';

interface ChatBubbleProps {
  message: ChatMessage;
}

/**
 * 채팅 말풍선 컴포넌트 - 단순화 버전
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  // 완전한 null guard
  if (!message || typeof message !== 'object') {
    return (
      <View style={styles.bubble}>
        <Text style={styles.text}>[Invalid message]</Text>
      </View>
    );
  }

  const isUser = message?.role === 'user';
  const content = String(message?.content || '(빈 메시지)');

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.roleText}>{isUser ? '👤 나' : '🤖 AI'}</Text>
        <Text style={styles.text}>{content}</Text>
        <Text style={styles.debug}>[DEBUG: {JSON.stringify(message).substring(0, 100)}]</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: 'rgba(0, 200, 255, 0.3)',
    borderWidth: 1,
    borderColor: '#00ccff',
  },
  aiBubble: {
    backgroundColor: 'rgba(0, 255, 100, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff66',
  },
  roleText: {
    color: '#aaa',
    fontSize: 10,
    marginBottom: 4,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  debug: {
    color: '#ff0',
    fontSize: 12,
    marginTop: 8,
    backgroundColor: '#333',
    padding: 4,
  },
});

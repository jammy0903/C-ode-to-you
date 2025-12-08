import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { ChatMessage } from '../../../shared/types/api.types';
import { spacing, borderRadius, createShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface ChatBubbleProps {
  message: ChatMessage;
}

/**
 * 채팅 말풍선 컴포넌트 (미래지향적 디자인)
 * 사용자/AI 구분, 코드 블록 렌더링 지원
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';

  // 코드 블록 감지 (간단한 정규식)
  const codeBlockRegex = /```([\s\S]*?)```/g;

  // 마크다운 파싱 (간단한 버전)
  const parseContent = (content: string) => {
    const parts: Array<{ type: 'text' | 'code'; content: string }> = [];
    let lastIndex = 0;
    let match;

    codeBlockRegex.lastIndex = 0;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // 일반 텍스트
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }
      // 코드 블록
      parts.push({
        type: 'code',
        content: match[1].trim(),
      });
      lastIndex = match.index + match[0].length;
    }
    // 남은 텍스트
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const contentParts = parseContent(message.content ?? '');

  return (
    <XStack
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      style={styles.container}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {/* AI 아바타 */}
        {isAI && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}

        <YStack flex={1} gap={spacing.xs}>
          {contentParts.map((part, index) => {
            if (part.type === 'code') {
              return (
                <View key={index} style={styles.codeBlock}>
                  <Text style={styles.codeText}>{part.content}</Text>
                </View>
              );
            }
            return (
              <Text key={index} style={styles.text}>
                {part.content}
              </Text>
            );
          })}

          {/* 타임스탬프 */}
          <Text style={styles.timestamp}>
            {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </YStack>

        {/* 사용자 아바타 */}
        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
        )}
      </View>
    </XStack>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  userBubble: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00ffff',
    ...createShadow(0, 0, 10, 0, '#00ffff', 0.5),
  },
  aiBubble: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#00ff00',
    ...createShadow(0, 0, 8, 0, '#00ff00', 0.3),
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  aiAvatarText: {
    fontSize: 18,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  userAvatarText: {
    fontSize: 18,
  },
  text: {
    ...globalStyles.text,
    fontSize: 14,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: '#0d1117',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    marginVertical: spacing.xs,
  },
  codeText: {
    ...globalStyles.codeText,
    fontSize: 12,
    fontFamily: 'Orbitron-Regular',
  },
  timestamp: {
    ...globalStyles.textTertiary,
    fontSize: 10,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
});


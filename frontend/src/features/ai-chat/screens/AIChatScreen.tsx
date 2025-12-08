import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { ChatBubble } from '../components/ChatBubble';
import { ChatInput } from '../components/ChatInput';
import { useAIChat } from '../hooks/useAIChat';
import { Loading } from '../../../shared/components/Loading';
import { spacing, createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface AIChatScreenProps {
  route: {
    params: {
      problemId: string;
    };
  };
}

/**
 * 미래지향적인 AI 채팅 화면
 * 홀로그램 스타일, 네온 효과
 */
export const AIChatScreen: React.FC<AIChatScreenProps> = ({ route }) => {
  const { problemId } = route.params;
  const { messages, isLoading, isSending, error, sendMessage, requestReview } = useAIChat(problemId);
  const scrollViewRef = useRef<any>(null);
  const showInput = true;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // AI 응답 대기 중 펄스 애니메이션
  useEffect(() => {
    if (isSending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSending]);

  // 새 메시지가 추가되면 스크롤
  useEffect(() => {
    if ((messages?.length ?? 0) > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleRequestReview = async (code: string) => {
    await requestReview(code);
  };

  if (isLoading && (!messages || messages.length === 0)) {
    return <Loading fullScreen message="AI 채팅을 준비하는 중..." />;
  }

  return (
    <ScreenContainer safeArea padding={false} style={styles.container}>
      {/* 홀로그램 헤더 */}
      <View style={styles.header}>
        <XStack alignItems="center" justifyContent="center" padding={spacing.md}>
          <Animated.View
            style={[
              styles.aiIndicator,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Text style={styles.headerText}>AI 어시스턴트</Text>
        </XStack>
      </View>

      {/* 채팅 메시지 리스트 */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!messages || messages.length === 0 ? (
            <YStack alignItems="center" justifyContent="center" flex={1} minHeight={300}>
              <Text style={styles.emptyText}>
                🤖{'\n'}AI에게 질문해보세요!{'\n'}코드 리뷰나 힌트를 받을 수 있습니다.
              </Text>
            </YStack>
          ) : (
            <YStack gap={spacing.md} padding={spacing.md}>
              {messages.map((message, index) => (
                <ChatBubble
                  key={message?.id || `msg-${index}`}
                  message={message}
                />
              ))}
            </YStack>
          )}

          {/* 전송 중 표시 */}
          {isSending && (
            <XStack alignItems="center" gap={spacing.sm} padding={spacing.md}>
              <Animated.View
                style={[
                  styles.typingIndicator,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ]}
              />
              <Text style={styles.typingText}>AI가 입력 중...</Text>
            </XStack>
          )}
        </ScrollView>

        {/* 채팅 입력 */}
        {showInput && (
          <ChatInput
            onSend={handleSend}
            disabled={isSending}
            placeholder="코드에 대해 질문하거나 힌트를 요청하세요..."
          />
        )}
      </KeyboardAvoidingView>

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0f',
  },
  header: {
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    position: 'relative',
  },
  aiIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ffff',
    marginRight: spacing.sm,
    ...createShadow(0, 0, 8, 0, '#00ffff', 1),
  },
  headerText: {
    ...globalStyles.heading3,
    color: '#00ffff',
    ...createTextShadow(0, 0, 10, '#00ffff', 1),
  },
  chatContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyText: {
    ...globalStyles.textSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  typingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ffff',
    ...createShadow(0, 0, 8, 0, '#00ffff', 1),
  },
  typingText: {
    ...globalStyles.textTertiary,
    fontSize: 12,
    color: '#00ffff',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: '#ff0000',
    padding: spacing.md,
  },
  errorText: {
    ...globalStyles.text,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});


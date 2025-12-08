import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { ChatBubble } from '../../ai-chat/components/ChatBubble';
import { ChatInput } from '../../ai-chat/components/ChatInput';
import { useAIChat } from '../../ai-chat/hooks/useAIChat';
import { Loading } from '../../../shared/components/Loading';
import { spacing, createShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface EditorChatPanelProps {
  problemId: string;
  currentCode?: string;
  onNewMessage?: () => void;
}

/**
 * 코드 에디터 내장 AI 채팅 패널
 * 코딩하면서 실시간으로 AI와 대화
 */
export const EditorChatPanel: React.FC<EditorChatPanelProps> = ({
  problemId,
  currentCode,
  onNewMessage,
}) => {
  const { messages, isLoading, isSending, error, sendMessage, requestReview } = useAIChat(problemId);
  const scrollViewRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevMessageCount = useRef(messages?.length ?? 0);

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

  // 새 메시지 추가 시 스크롤 및 알림
  useEffect(() => {
    const currentLength = messages?.length ?? 0;
    if (currentLength > prevMessageCount.current) {
      onNewMessage?.();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    prevMessageCount.current = currentLength;
  }, [messages?.length, onNewMessage]);

  const handleSend = async (content: string) => {
    // 현재 코드 컨텍스트 포함
    await sendMessage(content, currentCode ? { code: currentCode } : undefined);
  };

  const handleRequestReview = async () => {
    if (currentCode) {
      await requestReview(currentCode);
    }
  };

  if (isLoading && (!messages || messages.length === 0)) {
    return <Loading fullScreen={false} message="채팅 준비 중..." />;
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <XStack alignItems="center" gap={spacing.sm}>
          <Animated.View
            style={[
              styles.aiIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Text style={styles.headerText}>AI 코딩 어시스턴트</Text>
        </XStack>

        {/* 코드 리뷰 요청 버튼 */}
        {currentCode && (
          <View
            style={styles.reviewButton}
            onTouchEnd={handleRequestReview}
          >
            <Text style={styles.reviewButtonText}>코드 리뷰</Text>
          </View>
        )}
      </View>

      {/* 채팅 메시지 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        {!messages || messages.length === 0 ? (
          <YStack alignItems="center" justifyContent="center" flex={1} padding={spacing.xl}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyText}>
              코드에 대해 질문하거나{'\n'}힌트를 요청해보세요!
            </Text>
            <Text style={styles.emptyHint}>
              현재 작성 중인 코드가{'\n'}자동으로 AI에게 전달됩니다.
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
            <Text style={styles.typingText}>AI가 분석 중...</Text>
          </XStack>
        )}
      </ScrollView>

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 입력 */}
      <ChatInput
        onSend={handleSend}
        disabled={isSending}
        placeholder="코드에 대해 질문하세요..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d1117',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  aiIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff00',
    ...createShadow(0, 0, 8, 0, '#00ff00', 1),
  },
  headerText: {
    ...globalStyles.heading3,
    color: '#00ff00',
    fontSize: 14,
  },
  reviewButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  reviewButtonText: {
    color: '#00ffff',
    fontSize: 12,
    fontFamily: 'Orbitron-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...globalStyles.text,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    ...globalStyles.textTertiary,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  typingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ff00',
    ...createShadow(0, 0, 8, 0, '#00ff00', 1),
  },
  typingText: {
    ...globalStyles.textTertiary,
    fontSize: 12,
    color: '#00ff00',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderTopWidth: 1,
    borderTopColor: '#ff0000',
    padding: spacing.sm,
  },
  errorText: {
    ...globalStyles.text,
    color: '#ff6b6b',
    textAlign: 'center',
    fontSize: 12,
  },
});

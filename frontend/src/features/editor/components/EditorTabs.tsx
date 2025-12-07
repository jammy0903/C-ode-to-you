import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { XStack } from 'tamagui';
import { colors, spacing, borderRadius, createShadow, createTextShadow } from '../../../shared/styles/theme';

export type EditorTabType = 'code' | 'chat';

interface EditorTabsProps {
  activeTab: EditorTabType;
  onTabChange: (tab: EditorTabType) => void;
  hasUnreadMessages?: boolean;
}

/**
 * 에디터/AI 채팅 탭 전환 컴포넌트
 * 네온 스타일 디자인
 */
export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  onTabChange,
  hasUnreadMessages = false,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // 읽지 않은 메시지 있을 때 펄스 애니메이션
  React.useEffect(() => {
    if (hasUnreadMessages && activeTab !== 'chat') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasUnreadMessages, activeTab]);

  return (
    <View style={styles.container}>
      <XStack style={styles.tabBar}>
        {/* 코드 에디터 탭 */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'code' && styles.activeTab]}
          onPress={() => onTabChange('code')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'code' && styles.activeTabText]}>
            {'</>'}
          </Text>
          <Text style={[styles.tabText, activeTab === 'code' && styles.activeTabText]}>
            코드
          </Text>
          {activeTab === 'code' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        {/* AI 채팅 탭 */}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeChatTab]}
          onPress={() => onTabChange('chat')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, activeTab === 'chat' && styles.activeChatTabText]}>
            🤖
          </Text>
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeChatTabText]}>
            AI 채팅
          </Text>
          {activeTab === 'chat' && <View style={styles.activeChatIndicator} />}

          {/* 읽지 않은 메시지 알림 */}
          {hasUnreadMessages && activeTab !== 'chat' && (
            <Animated.View
              style={[
                styles.unreadBadge,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          )}
        </TouchableOpacity>
      </XStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  activeChatTab: {
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  tabIcon: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Orbitron-Regular',
    color: colors.textTertiary,
  },
  activeTabText: {
    color: '#00ffff',
    ...createTextShadow(0, 0, 5, '#00ffff', 0.8),
  },
  activeChatTabText: {
    color: '#00ff00',
    ...createTextShadow(0, 0, 5, '#00ff00', 0.8),
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 2,
    backgroundColor: '#00ffff',
    borderRadius: 1,
    ...createShadow(0, 0, 8, 0, '#00ffff', 1),
  },
  activeChatIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 2,
    backgroundColor: '#00ff00',
    borderRadius: 1,
    ...createShadow(0, 0, 8, 0, '#00ff00', 1),
  },
  unreadBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.lg,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff00ff',
    ...createShadow(0, 0, 6, 0, '#ff00ff', 1),
  },
});

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { CodeMirrorWebView } from './CodeMirrorWebView';
import { EditorToolbar } from './EditorToolbar';
import { EditorTabs, EditorTabType } from './EditorTabs';
import { EditorChatPanel } from './EditorChatPanel';
import { ProblemHeaderBar } from '../../problems/components/ProblemHeaderBar';
import { useCodeEditor } from '../hooks/useCodeEditor';
import { useProblemDetail } from '../../problems/hooks/useProblemDetail';
import { colors, spacing, createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';
import { Problem } from '../../../shared/types/api.types';

interface CodeEditorProps {
  problemId: string;
  problem?: Problem | null;
  onRun?: () => void;
  onSubmit?: () => void;
  onProblemPress?: () => void;
}

const { width } = Dimensions.get('window');

/**
 * 미래지향적인 코드 에디터 화면
 * 네온 효과, 홀로그램 느낌의 디자인
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  problemId,
  problem: externalProblem,
  onRun,
  onSubmit,
  onProblemPress,
}) => {
  const { code, language, setCode, setLanguage, isDirty, lastSavedAt } = useCodeEditor(problemId);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<EditorTabType>('code');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // 외부에서 problem이 전달되면 fetch하지 않음
  const shouldFetch = !externalProblem;
  const { problem: fetchedProblem, isLoading: isProblemLoading } = useProblemDetail(problemId);
  const problem = externalProblem ?? fetchedProblem;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const scanlineAnimation = useRef(new Animated.Value(0)).current;

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: EditorTabType) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      setHasUnreadMessages(false);
    }
  }, []);

  // 새 메시지 수신 핸들러
  const handleNewMessage = useCallback(() => {
    if (activeTab !== 'chat') {
      setHasUnreadMessages(true);
    }
  }, [activeTab]);

  // 네온 글로우 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 스캔라인 애니메이션 (세련된 그라데이션 스캔 효과)
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanlineAnimation, {
        toValue: 1,
        duration: 8000, // 더 느리게 - 부드럽고 세련됨
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.4], // 더 은은하게
  });

  const scanlineTranslateY = scanlineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 800],
  });

  const scanlineOpacity = scanlineAnimation.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 0.15, 0.15, 0], // 부드럽게 페이드 인/아웃
  });

  return (
    <View style={styles.container}>
      {/* 홀로그램 스캔라인 효과 - 세련된 그라데이션 */}
      <Animated.View
        style={[
          styles.scanline,
          {
            transform: [{ translateY: scanlineTranslateY }],
            opacity: scanlineOpacity,
          },
        ]}
      />

      {/* 네온 테두리 글로우 */}
      <Animated.View
        style={[
          styles.glowBorder,
          {
            opacity: glowOpacity,
          },
        ]}
      />

      {/* 문제 정보 헤더 (상단 고정) */}
      <ProblemHeaderBar
        problem={problem}
        isLoading={isProblemLoading}
        onPress={onProblemPress}
      />

      {/* 탭 바 (코드/AI 채팅) */}
      <EditorTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasUnreadMessages={hasUnreadMessages}
      />

      {/* 코드 에디터 탭 */}
      {activeTab === 'code' && (
        <>
          {/* 에디터 툴바 */}
          <EditorToolbar
            language={language}
            onLanguageChange={setLanguage}
            onRun={onRun}
            onSubmit={onSubmit}
            isDirty={isDirty}
            lastSavedAt={lastSavedAt}
          />

          {/* 코드 에디터 영역 */}
          <View style={styles.editorContainer}>
            <CodeMirrorWebView
              code={code}
              language={language}
              onChange={setCode}
              theme="cyberpunk"
            />
          </View>

          {/* 상태 바 (하단) */}
          <XStack style={styles.statusBar} justifyContent="space-between" alignItems="center">
            <XStack gap={spacing.md} alignItems="center">
              {isDirty && (
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Animated.Text style={[styles.statusText, { opacity: glowOpacity }]}>
                    저장 중...
                  </Animated.Text>
                </View>
              )}
              {lastSavedAt && !isDirty && (
                <Text style={styles.statusText}>저장됨</Text>
              )}
            </XStack>
            <Text style={styles.statusText}>C 언어</Text>
          </XStack>
        </>
      )}

      {/* AI 채팅 탭 */}
      {activeTab === 'chat' && (
        <EditorChatPanel
          problemId={problemId}
          currentCode={code}
          onNewMessage={handleNewMessage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    position: 'relative',
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    width: '100%',
    height: 60, // 더 넓은 그라데이션 밴드
    zIndex: 1000,
    // 그라데이션 효과를 위한 배경 (위아래로 페이드)
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.2)',
    // 은은한 그라데이션 느낌의 그림자
    ...createShadow(0, 0, 30, 0, '#00ffff', 0.15),
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#00ffff',
    zIndex: 999,
    ...createShadow(0, 0, 20, 0, '#00ffff', 0.8),
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
    margin: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1a1a2e',
    ...createShadow(0, 0, 15, 0, '#00ffff', 0.3),
  },
  statusBar: {
    height: 40,
    backgroundColor: '#0a0a0f',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00ffff',
    ...createShadow(0, 0, 8, 0, '#00ffff', 1),
  },
  statusText: {
    color: '#00ffff',
    fontSize: 12,
    fontFamily: 'Orbitron-Regular',
    ...createTextShadow(0, 0, 5, '#00ffff', 1),
  },
});


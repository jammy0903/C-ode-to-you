import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { CodeMirrorWebView } from './CodeMirrorWebView';
import { EditorToolbar } from './EditorToolbar';
import { useCodeEditor } from '../hooks/useCodeEditor';
import { colors, spacing, createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface CodeEditorProps {
  problemId: string;
  onRun?: () => void;
  onSubmit?: () => void;
}

const { width } = Dimensions.get('window');

/**
 * 미래지향적인 코드 에디터 화면
 * 네온 효과, 홀로그램 느낌의 디자인
 */
export const CodeEditor: React.FC<CodeEditorProps> = ({ problemId, onRun, onSubmit }) => {
  const { code, language, setCode, setLanguage, isDirty, lastSavedAt } = useCodeEditor(problemId);
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const scanlineAnimation = useRef(new Animated.Value(0)).current;

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

  // 스캔라인 애니메이션 (홀로그램 효과)
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanlineAnimation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const scanlineTranslateY = scanlineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 1000],
  });

  return (
    <View style={styles.container}>
      {/* 홀로그램 스캔라인 효과 */}
      <Animated.View
        style={[
          styles.scanline,
          {
            transform: [{ translateY: scanlineTranslateY }],
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
    height: 2,
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
    zIndex: 1000,
    ...createShadow(0, 0, 10, 0, '#00ffff', 1),
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


import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { XStack } from 'tamagui';
import { spacing, borderRadius, createShadow, createTextShadow } from '../../../shared/styles/theme';

interface EditorToolbarProps {
  language: string;
  onRun?: () => void;
  onSubmit?: () => void;
}

/**
 * 미래지향적인 에디터 툴바
 * 네온 버튼, 홀로그램 효과
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  language,
  onRun,
  onSubmit,
}) => {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // 펄스 애니메이션 (제출 버튼)
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = (action: string, callback?: () => void) => {
    setPressedButton(action);
    setTimeout(() => {
      setPressedButton(null);
      callback?.();
    }, 150);
  };

  return (
    <View style={styles.toolbar}>
      {/* 언어 선택 */}
      <XStack gap={spacing.sm} alignItems="center">
        <Text style={styles.label}>언어:</Text>
        <TouchableOpacity
          style={[styles.languageButton, pressedButton === 'language' && styles.buttonPressed]}
          onPress={() => handlePress('language', () => {})}
        >
          <Text style={styles.languageText}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
      </XStack>

      {/* 액션 버튼들 */}
      <XStack gap={spacing.md} alignItems="center">
        {/* 실행 버튼 */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.runButton,
            pressedButton === 'run' && styles.buttonPressed,
          ]}
          onPress={() => handlePress('run', onRun)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>▶ 실행</Text>
        </TouchableOpacity>

        {/* 제출 버튼 (펄스 효과) */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.submitButton,
              pressedButton === 'submit' && styles.buttonPressed,
            ]}
            onPress={() => handlePress('submit', onSubmit)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>⚡ 제출</Text>
          </TouchableOpacity>
        </Animated.View>

      </XStack>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#0a0a0f',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  label: {
    color: '#00ffff',
    fontSize: 12,
    fontFamily: 'Orbitron-Regular',
  },
  languageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#1a1a2e',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#00ffff',
  },
  languageText: {
    color: '#00ffff',
    fontSize: 12,
    fontFamily: 'Orbitron-SemiBold',
    ...createTextShadow(0, 0, 5, '#00ffff', 1),
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderColor: '#00ff00',
    ...createShadow(0, 0, 8, 0, '#00ff00', 0.5),
  },
  submitButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
    borderColor: '#00ffff',
    ...createShadow(0, 0, 12, 0, '#00ffff', 0.8),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Orbitron-SemiBold',
    ...createTextShadow(0, 0, 3, '#00ffff', 1),
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});


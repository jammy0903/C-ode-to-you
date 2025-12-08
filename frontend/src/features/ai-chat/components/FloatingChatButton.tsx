import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { createShadow, createTextShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface FloatingChatButtonProps {
  onPress: () => void;
  visible?: boolean;
}

/**
 * 플로팅 AI 채팅 버튼 (미래지향적 디자인)
 * 홀로그램 효과, 펄스 애니메이션
 */
export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onPress,
  visible = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  // 펄스 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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

  // 회전 애니메이션 (홀로그램 효과)
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // 표시/숨김 애니메이션
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      {/* 홀로그램 링 효과 */}
      <Animated.View
        style={[
          styles.hologramRing,
          {
            transform: [{ rotate }],
          },
        ]}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>🤖</Text>
        <Text style={styles.buttonLabel}>AI</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hologramRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#00ffff',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow(0, 0, 20, 0, '#00ffff', 1),
  },
  buttonText: {
    fontSize: 24,
  },
  buttonLabel: {
    ...globalStyles.text,
    fontSize: 10,
    fontFamily: 'Orbitron-Bold',
    color: '#00ffff',
    marginTop: -4,
    ...createTextShadow(0, 0, 5, '#00ffff', 1),
  },
});


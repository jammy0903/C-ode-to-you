import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { XStack } from 'tamagui';
import { colors, spacing, borderRadius, createShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * 채팅 입력 필드 (미래지향적 디자인)
 * 네온 효과, 애니메이션
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  // 포커스 시 글로우 애니메이션
  React.useEffect(() => {
    if (isFocused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isFocused]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* 네온 글로우 효과 */}
      {isFocused && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      <XStack
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
        ]}
        alignItems="center"
        gap={spacing.sm}
      >
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={1000}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSend}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>▶</Text>
        </TouchableOpacity>
      </XStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1117',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    padding: spacing.md,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
  },
  inputContainer: {
    backgroundColor: '#0a0a0f',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: '#00ffff',
    borderWidth: 2,
    ...createShadow(0, 0, 10, 0, '#00ffff', 0.5),
  },
  input: {
    flex: 1,
    ...globalStyles.text,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...createShadow(0, 0, 12, 0, '#00ffff', 0.8),
  },
  sendButtonDisabled: {
    backgroundColor: '#1a1a2e',
  },
  sendButtonText: {
    color: '#0a0a0f',
    fontSize: 16,
    fontFamily: 'Orbitron-Bold',
  },
});


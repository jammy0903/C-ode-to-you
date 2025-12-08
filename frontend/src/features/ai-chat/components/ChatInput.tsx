import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Platform } from 'react-native';
import { colors, spacing, borderRadius, createShadow } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * 채팅 입력 필드
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '메시지를 입력하세요...',
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  }, [message, disabled, onSend]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleContainerPress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={1000}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          autoCapitalize="none"
          autoCorrect={false}
          showSoftInputOnFocus={true}
          contextMenuHidden={false}
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
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#1a1a2e',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 50,
    gap: spacing.sm,
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


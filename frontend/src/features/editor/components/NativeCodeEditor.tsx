import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

interface NativeCodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

/**
 * 네이티브 TextInput 기반 코드 에디터
 * - 키보드 100% 작동 보장
 * - 라인 번호 표시
 * - 사이버펑크 테마
 */
export const NativeCodeEditor: React.FC<NativeCodeEditorProps> = ({
  code,
  onChange,
}) => {
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [lineCount, setLineCount] = useState(1);

  // 라인 수 계산
  const updateLineCount = useCallback((text: string) => {
    const lines = text.split('\n').length;
    setLineCount(Math.max(lines, 1));
  }, []);

  const handleChangeText = useCallback((text: string) => {
    updateLineCount(text);
    onChange(text);
  }, [onChange, updateLineCount]);

  // 에디터 영역 터치 시 포커스
  const handleContainerPress = useCallback(() => {
    textInputRef.current?.focus();
  }, []);

  // 라인 번호 생성
  const renderLineNumbers = () => {
    const lines = [];
    for (let i = 1; i <= Math.max(lineCount, 20); i++) {
      lines.push(
        <Text key={i} style={styles.lineNumber}>
          {i}
        </Text>
      );
    }
    return lines;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.editorWrapper}>
        {/* 라인 번호 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.lineNumberContainer}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          {renderLineNumbers()}
        </ScrollView>

        {/* 코드 입력 영역 */}
        <ScrollView
          style={styles.codeContainer}
          horizontal={false}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          onScroll={(e) => {
            // 라인 번호 스크롤 동기화
            scrollViewRef.current?.scrollTo({
              y: e.nativeEvent.contentOffset.y,
              animated: false,
            });
          }}
          scrollEventThrottle={16}
        >
          <TextInput
            ref={textInputRef}
            style={styles.codeInput}
            value={code}
            onChangeText={handleChangeText}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            textAlignVertical="top"
            placeholder="// 여기에 C 코드를 작성하세요..."
            placeholderTextColor="#6e7681"
            keyboardType="default"
            returnKeyType="default"
            blurOnSubmit={false}
            scrollEnabled={false}
            underlineColorAndroid="transparent"
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  editorWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  lineNumberContainer: {
    width: 50,
    backgroundColor: '#0d1117',
    borderRightWidth: 1,
    borderRightColor: '#1a1a2e',
    paddingTop: 16,
    paddingRight: 8,
  },
  lineNumber: {
    color: '#6e7681',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 22,
    textAlign: 'right',
    paddingRight: 8,
  },
  codeContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  codeInput: {
    flex: 1,
    color: '#c9d1d9',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 22,
    padding: 16,
    paddingTop: 16,
    minHeight: 500,
    textAlignVertical: 'top',
  },
});

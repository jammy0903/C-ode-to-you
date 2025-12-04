import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { CodeEditor } from '../components/CodeEditor';
import { useSubmission } from '../../submissions/hooks/useSubmission';
import { useProblemDetail } from '../../problems/hooks/useProblemDetail';
import { colors } from '../../../shared/styles/theme';

interface CodeEditorScreenProps {
  route: {
    params: {
      problemId: string;
    };
  };
  navigation: any;
}

/**
 * 코드 에디터 화면
 * 문제 상세와 코드 에디터를 함께 표시
 */
export const CodeEditorScreen: React.FC<CodeEditorScreenProps> = ({ route, navigation }) => {
  const { problemId } = route.params;
  const { problem } = useProblemDetail(problemId);
  const { submitCode, currentSubmission, isSubmitting } = useSubmission(problemId);

  const handleRun = () => {
    // TODO: 코드 실행 로직
    console.log('Run code');
  };

  const handleSubmit = async () => {
    // TODO: 코드 제출 로직
    // const code = ...; // 에디터에서 가져오기
    // const submissionId = await submitCode(code, 'c');
    // if (submissionId) {
    //   navigation.navigate('SubmissionResult', { submissionId, problemId });
    // }
  };

  return (
    <ScreenContainer safeArea padding={false} style={styles.container}>
      <CodeEditor problemId={problemId} onRun={handleRun} onSubmit={handleSubmit} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0f',
  },
});


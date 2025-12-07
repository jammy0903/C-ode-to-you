import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Navigation 타입 정의
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Problems: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  ProblemList: undefined;
  ProblemDetail: { problemId: string };
  SubmissionResult: { submissionId: string };
};

// Screen Props 타입
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type ProblemListScreenProps = NativeStackScreenProps<MainStackParamList, 'ProblemList'>;
export type ProblemDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'ProblemDetail'>;
export type SubmissionResultScreenProps = NativeStackScreenProps<MainStackParamList, 'SubmissionResult'>;
export type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;


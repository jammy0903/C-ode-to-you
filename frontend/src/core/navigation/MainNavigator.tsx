import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProblemListScreen } from '../../features/problems/screens/ProblemListScreen';
import { ProblemDetailScreen } from '../../features/problems/screens/ProblemDetailScreen';
import { CodeEditorScreen } from '../../features/editor/screens/CodeEditorScreen';
import { SubmissionResultScreen } from '../../features/submissions/screens/SubmissionResultScreen';
import { AIChatScreen } from '../../features/ai-chat/screens/AIChatScreen';
import { ProfileScreen } from '../../features/profile/screens/ProfileScreen';

export type MainTabParamList = {
  Problems: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  ProblemList: undefined;
  ProblemDetail: { problemId: string };
  CodeEditor: { problemId: string };
  SubmissionResult: { submissionId: string; problemId: string };
  AIChat: { problemId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

// Problems Stack Navigator
const ProblemsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0a0f',
        },
        headerShadowVisible: false,
        headerTintColor: '#00ffff',
        headerTitleStyle: {
          fontFamily: 'Orbitron-SemiBold',
        },
        // Android 키보드 문제 해결
        animation: 'fade',
        fullScreenGestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="ProblemList" 
        component={ProblemListScreen}
        options={{ title: '문제 목록', headerShown: false }}
      />
      <Stack.Screen 
        name="ProblemDetail" 
        component={ProblemDetailScreen}
        options={{ title: '문제 상세' }}
      />
      <Stack.Screen 
        name="CodeEditor" 
        component={CodeEditorScreen}
        options={{ title: '코드 에디터' }}
      />
      <Stack.Screen 
        name="SubmissionResult" 
        component={SubmissionResultScreen}
        options={{ title: '제출 결과' }}
      />
      <Stack.Screen 
        name="AIChat" 
        component={AIChatScreen}
        options={{ title: 'AI 채팅' }}
      />
    </Stack.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tab.Screen 
        name="Problems" 
        component={ProblemsStack}
        options={{ title: '문제' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '프로필' }}
      />
    </Tab.Navigator>
  );
};


import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { YStack, XStack } from 'tamagui';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { Loading } from '../../../shared/components/Loading';
import { ProblemCard } from '../components/ProblemCard';
import { SearchBar } from '../components/SearchBar';
import { ProblemFilter } from '../components/ProblemFilter';
import { useProblems } from '../hooks/useProblems';
import { Problem } from '../../../shared/types/api.types';
import { colors, spacing } from '../../../shared/styles/theme';
import { globalStyles } from '../../../shared/styles/globalStyles';
import { ProblemListScreenProps } from '../../../shared/types/navigation.types';

/**
 * 문제 목록 화면
 * 문제 검색, 필터링, 무한 스크롤 지원
 */
export const ProblemListScreen: React.FC<ProblemListScreenProps> = ({ navigation }) => {
  const {
    problems,
    isLoading,
    isRefreshing,
    error,
    pagination,
    filters,
    setFilters,
    searchProblems,
    loadMore,
    refresh,
  } = useProblems();

  const handleProblemPress = (problem: Problem, navigation: any) => {
    navigation.navigate('ProblemDetail', { problemId: problem.id });
  };

  const renderProblem = ({ item }: { item: Problem }) => (
    <ProblemCard problem={item} onPress={() => handleProblemPress(item, navigation)} />
  );

  if (isLoading && problems.length === 0) {
    return <Loading fullScreen message="문제를 불러오는 중..." />;
  }

  return (
    <ScreenContainer safeArea padding={false}>
      <YStack flex={1} backgroundColor={colors.background}>
        {/* 검색 바 */}
        <YStack padding={spacing.md} backgroundColor={colors.backgroundSecondary}>
          <SearchBar onSearch={searchProblems} />
        </YStack>

        {/* 필터 */}
        <ProblemFilter filters={filters} onFilterChange={setFilters} />

        {/* 문제 목록 */}
        <FlatList
          data={problems}
          renderItem={renderProblem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <YStack alignItems="center" padding={spacing.xl}>
              <Text style={styles.emptyText}>문제를 찾을 수 없습니다</Text>
            </YStack>
          }
          ListFooterComponent={
            isLoading && problems.length > 0 ? (
              <Loading message="더 불러오는 중..." />
            ) : null
          }
        />

        {/* 에러 메시지 */}
        {error && (
          <YStack padding={spacing.md} backgroundColor={colors.error} opacity={0.9}>
            <Text style={styles.errorText}>{error}</Text>
          </YStack>
        )}
      </YStack>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  emptyText: {
    ...globalStyles.textSecondary,
    fontSize: 16,
  },
  errorText: {
    ...globalStyles.text,
    color: colors.text,
  },
});


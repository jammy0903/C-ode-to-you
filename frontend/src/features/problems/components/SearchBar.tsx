import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Input } from '../../../shared/components/Input';
import { colors } from '../../../shared/styles/theme';
import { useDebounce } from '../../../shared/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

/**
 * 문제 검색 바 컴포넌트
 * 디바운싱 적용
 */
export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  React.useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <Input
      placeholder="문제 번호 또는 제목으로 검색..."
      value={query}
      onChangeText={setQuery}
      style={styles.searchInput}
    />
  );
};

const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: colors.surface,
  },
});


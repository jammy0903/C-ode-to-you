import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from '../../../shared/components/Button';


interface KakaoButtonProps {
  onPress: () => void;
  loading?: boolean;
}

/**
 * Kakao 로그인 버튼 컴포넌트
 * Kakao 브랜드 색상 적용
 */
export const KakaoButton: React.FC<KakaoButtonProps> = ({ onPress, loading }) => {
  return (
    <Button
      title="카카오로 시작하기"
      onPress={onPress}
      variant="primary"
      size="large"
      loading={loading}
      fullWidth
      style={styles.kakaoButton}
    />
  );
};

const styles = StyleSheet.create({
  kakaoButton: {
    backgroundColor: '#FEE500', // Kakao 브랜드 색상
  },
});


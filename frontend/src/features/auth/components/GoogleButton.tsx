import React from 'react';
import { Button } from '../../../shared/components/Button';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
}

/**
 * Google 로그인 버튼 컴포넌트
 */
export const GoogleButton: React.FC<GoogleButtonProps> = ({ onPress, loading }) => {
  return (
    <Button
      title="Google로 시작하기"
      onPress={onPress}
      variant="outline"
      size="large"
      loading={loading}
      fullWidth
    />
  );
};


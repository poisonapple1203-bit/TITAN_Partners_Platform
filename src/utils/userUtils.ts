import { useAuthStore } from '../store/useAuthStore';

/**
 * 전역 사용자 명칭 매핑 유틸리티
 * 구글 ID 식별자를 노출할 닉네임으로 변환합니다.
 */
export function getDisplayName(user: string): string {
  if (user === '조핏' || user === 'poisonapple1203') {
    const nickname = useAuthStore.getState().user?.nickname;
    return nickname || '조핏';
  }
  if (user === '봉핏' || user === 'juribong2') {
    return '봉핏';
  }
  return user;
}

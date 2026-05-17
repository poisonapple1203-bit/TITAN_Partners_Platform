import { useAuthStore } from '../store/useAuthStore';

/**
 * 전역 사용자 명칭 매핑 유틸리티
 * '조핏'(내부 식별자)을 현재 로그인한 사용자의 닉네임으로 변환합니다.
 */
export function getDisplayName(user: string): string {
  if (user === '조핏') {
    const nickname = useAuthStore.getState().user?.nickname;
    return nickname || '조핏';
  }
  return user;
}

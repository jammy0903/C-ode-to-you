/**
 * Orbit 폰트 설정 가이드
 * 
 * Orbit 폰트를 사용하기 위한 설정 방법:
 * 
 * 방법 1: Google Fonts 사용 (권장)
 * - expo-google-fonts/orbitron 패키지 사용
 * - npm install @expo-google-fonts/orbitron
 * - fontLoader.ts에서 import하여 사용
 * 
 * 방법 2: 커스텀 폰트 파일 사용
 * - assets/fonts/ 폴더에 Orbit-Regular.ttf, Orbit-Bold.ttf 등 배치
 * - fontLoader.ts에서 require로 로드
 * 
 * 방법 3: 시스템 폰트 폴백
 * - Orbit 폰트가 없을 경우, 시스템 모노스페이스 폰트 사용
 * - fontLoader.ts에서 폴백 로직 구현
 * 
 * 현재 설정:
 * - fontLoader.ts에서 커스텀 폰트 파일을 로드하도록 설정됨
 * - 실제 폰트 파일이 없으면 에러가 발생할 수 있으므로,
 *   개발 단계에서는 폴백을 사용하거나 Google Fonts로 전환 권장
 */


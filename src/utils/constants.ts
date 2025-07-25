/* 지구 위 나라 면적 계산 */
export const TEXT_LABEL_OPTIONS = {
  CELL_SIZE: 1.5, // 나라 면적을 나눌 그리드 크기
  FONT_MULTIPLIER: 1.2, //나라 위 텍스트를 그리드의 몇 배로 지정할 것인지
};

/* 스크램블 애니메이션 */
export const SCRAMBLE_OPTIONS = {
  TEXT_DIFF_RATIO: 0.2, // 글자 수가 바뀐 정도 기준 (현재 20%)
  TEXT_TIME_DIFF: 30_000, // 마지막으로 업데이트 된 시각과의 최소 차이 (현재 30초)
};

/* 카메라 회전 */
export const CAMERA_OPTIONS = {
  START_Z: 8, //시작 카메라 줌아웃 정도
  END_Z: 2.5,
  ROTATION_DURATION: 1.5, // 회전 지속 시간
  ZOOM_DURATION: 1.5, // 줌인 시간
};

/* 로그인/회원가입 에러 코드 */
export const AUTH_ERROR_MESSAGES = {
  EMAIL_EXISTS: "Username is taken",
  PASSWORD_LENGTH: "Password too short",
  EMAIL_VERIFY: "Email not verified yet",
  INVALID_INPUT: "Invalid credentials",
  UNEXPECTED_ERROR: "Unexpected error has occurred",
  SIGNUP_SUCCESS: "VERIFICATION EMAIL SENT",
  LOGIN_SUCCESS: "ACCESS GRANTED",
  MISSING_INPUT: "MISSING INPUT",
  DEFAULT: null,
} as const;

export type ERROR_STATUS = keyof typeof AUTH_ERROR_MESSAGES;

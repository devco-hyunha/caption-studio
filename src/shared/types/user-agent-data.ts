/** navigator.userAgentData — 고엔트로피 API의 platform 필드만 소비 (lib.dom에 타입 없음) */
export interface UserAgentDataLite {
  platform: string;
}

export interface NavigatorLite {
  userAgentData?: UserAgentDataLite;
}

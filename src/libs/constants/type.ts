const SOCIAL_TYPE_VALUES = ['KAKAO'] as const;
type SOCIAL_TYPE = typeof SOCIAL_TYPE_VALUES[number];

export { SOCIAL_TYPE_VALUES, SOCIAL_TYPE };

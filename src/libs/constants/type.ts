const SOCIAL_TYPE_VALUES = ['KAKAO', 'GOOGLE'] as const;
type SOCIAL_TYPE = typeof SOCIAL_TYPE_VALUES[number];

const CHALLENGE_CATEGORY_TYPE_VALUES = ['etc', '제로웨이스트', '분리수거'] as const;
type CHALLENGE_CATEGORY_TYPE = typeof CHALLENGE_CATEGORY_TYPE_VALUES[number];

export { SOCIAL_TYPE_VALUES, SOCIAL_TYPE, CHALLENGE_CATEGORY_TYPE_VALUES, CHALLENGE_CATEGORY_TYPE };

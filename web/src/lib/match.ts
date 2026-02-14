type SearchFilter = {
  age?: string;
  occupation?: string;
  income?: string;
  experience?: string;
  nisa?: string;
  risk?: string;
  policy?: string;
  main_product?: string;
  sub_product?: string;
  ratio?: string;
};

type PostLike = {
  age: string;
  occupation: string;
  income: string;
  experience: string;
  nisa: string;
  risk: string;
  policy: string;
  main_product: string;
  sub_product: string;
  invest_ratio: number;
  cash_ratio: number;
};

export const TOTAL_MATCH_POINTS = 10;

export const calculateMatchScore = (post: PostLike, filter: SearchFilter): number => {
  let score = 0;
  if (filter.age && post.age === filter.age) score += 1;
  if (filter.occupation && post.occupation === filter.occupation) score += 1;
  if (filter.income && post.income === filter.income) score += 1;
  if (filter.experience && post.experience === filter.experience) score += 1;
  if (filter.nisa && post.nisa === filter.nisa) score += 1;
  if (filter.risk && post.risk === filter.risk) score += 1;
  if (filter.policy && post.policy === filter.policy) score += 1;
  if (filter.main_product && post.main_product === filter.main_product) score += 1;
  if (filter.sub_product && post.sub_product === filter.sub_product) score += 1;
  if (filter.ratio && `${post.invest_ratio} / ${post.cash_ratio}` === filter.ratio) score += 1;
  return score;
};

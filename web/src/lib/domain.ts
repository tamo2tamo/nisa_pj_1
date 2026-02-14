export const AGE_OPTIONS = ["20代", "30代", "40代", "50代", "60代+"] as const;
export const FAMILY_OPTIONS = ["独身", "既婚子なし", "既婚子あり", "その他"] as const;
export const HOUSING_OPTIONS = ["持家", "賃貸"] as const;
export const OCCUPATION_OPTIONS = ["会社員", "公務員", "自営業", "学生", "無職", "その他"] as const;
export const INCOME_OPTIONS = ["〜300", "300-500", "500-800", "800-1200", "1200〜", "回答しない"] as const;
export const EXPERIENCE_OPTIONS = ["〜1年", "1-3年", "3-5年", "5-10年", "10年以上"] as const;
export const NISA_OPTIONS = ["つみたてのみ", "成長のみ", "両方"] as const;
export const RISK_OPTIONS = ["低", "中", "高"] as const;
export const POLICY_OPTIONS = ["長期積立", "バランス", "攻め"] as const;
export const PRODUCT_OPTIONS = [
  "株（国内）",
  "株（海外）",
  "投信（国内インデックス）",
  "投信（海外インデックス）",
  "投信（国内アクティブ）",
  "投信（海外アクティブ）",
  "不動産（REIT）",
  "債券（国内）",
  "債券（海外）",
  "FX",
  "金",
  "その他",
] as const;
export const RATIO_OPTIONS = ["5 / 95", "10 / 90", "25 / 75", "50 / 50"] as const;

export const NG_WORDS = [
  "バカ",
  "アホ",
  "死ね",
  "最悪",
  "ゴミ",
  "詐欺",
  "絶対儲かる",
  "必ず儲かる",
  "今すぐ登録",
  "line追加",
  "dmください",
  "案件",
];

export type PostInput = {
  display_name: string;
  age: string;
  family: string;
  housing: string;
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
  perf_1y: number;
  perf_since: number;
  note: string;
};

export const parseRatio = (text: string) => {
  const [invest, cash] = text.split("/").map((v) => Number(v.trim()));
  return { invest: invest || 0, cash: cash || 0 };
};

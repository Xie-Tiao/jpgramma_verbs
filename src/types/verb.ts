/**
 * Types for Japanese Verb Classification & Conjugation
 */

export type VerbGroup = 'godan' | 'ichidan' | 'irregular';

export type VerbSubgroup =
  | 'kami-ichidan'   // 上一段 (-iru)
  | 'shimo-ichidan'  // 下一段 (-eru)
  | 'godan'          // 五段动词
  | 'sahen'          // サ行变格 (する)
  | 'kahen';         // カ行变格 (来る)

export type GodanEnding = 'u' | 'ku' | 'gu' | 'su' | 'tsu' | 'nu' | 'bu' | 'mu' | 'ru';

export interface ConjugationForm {
  form: string;
  kana: string;
  romaji: string;
  suffix: string;
  stem: string;
  ruleLabel: string;
  description: string;
}

export interface VerbConjugations {
  dictionary: ConjugationForm;     // 辞书形 / 基本形
  masu: ConjugationForm;           // ます形 (礼貌/敬体)
  masen: ConjugationForm;          // ません形 (礼貌否定)
  mashita: ConjugationForm;        // ました形 (礼貌过去)
  nai: ConjugationForm;            // ない形 (简体否定)
  nakatta: ConjugationForm;        // なかった形 (简体过去否定)
  te: ConjugationForm;             // て形 (连接/请求)
  ta: ConjugationForm;             // た形 (简体过去)
  ba: ConjugationForm;             // ば形 (假定形)
  potential: ConjugationForm;      // 可能形 (能/会)
  volitional: ConjugationForm;     // 意向形 / 意志形 (想/一起)
  imperative: ConjugationForm;     // 命令形
  passive: ConjugationForm;        // 被动态 (受身形)
  causative: ConjugationForm;      // 使役态 (使役形)
  causative_passive: ConjugationForm; // 使役受身态 (被迫做)
}

export interface VerbItem {
  id: string;
  kanji: string;
  reading: string;
  romaji: string;
  meaning: string;
  meaningEn: string;
  group: VerbGroup;
  subgroup: VerbSubgroup;
  isException?: boolean;
  exceptionNote?: string;
  stem: string;
  stemType: 'vowel-stem' | 'consonant-stem' | 'irregular';
  endingKana: string;
  precedingKana?: string;
  precedingVowel?: 'a' | 'i' | 'u' | 'e' | 'o';
  jlpt: 'N5' | 'N4' | 'N3' | 'N2';
  exampleSentence: {
    japanese: string;
    reading: string;
    chinese: string;
    english: string;
  };
  conjugations: VerbConjugations;
  confusedWith?: {
    kanji: string;
    reading: string;
    meaning: string;
    group: VerbGroup;
    distinction: string;
  };
}

export interface DecisionStep {
  stepNumber: number;
  title: string;
  description: string;
  conditionMet: boolean;
  explanation: string;
  highlightText: string;
  resultGroup?: VerbGroup;
}

export interface DiagnosticResult {
  verb: string;
  reading: string;
  romaji: string;
  group: VerbGroup;
  subgroup: VerbSubgroup;
  isException: boolean;
  steps: DecisionStep[];
  matchedVerb?: VerbItem;
  stemType: 'vowel-stem' | 'consonant-stem' | 'irregular';
  phoneticExplanation: string;
  conjugations: VerbConjugations;
}

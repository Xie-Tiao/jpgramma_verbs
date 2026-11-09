import { VerbGroup, VerbSubgroup, VerbItem } from '../types/verb';
import { VERBS_DATABASE } from '../data/verbs';
import { VERB_EXCEPTIONS } from '../data/exceptions';
import { toRomaji } from './kanaUtils';

export interface DeconjugatedCandidate {
  dictionaryForm: string;
  reading: string;
  romaji: string;
  meaning?: string;
  group: VerbGroup;
  subgroup?: VerbSubgroup;
  isException?: boolean;
  confidence: 'exact' | 'high' | 'possible';
  transformationSteps: {
    rule: string;
    description: string;
    currentWord: string;
  }[];
  matchedVerb?: VerbItem;
}

export interface LemmatizeResult {
  input: string;
  candidates: DeconjugatedCandidate[];
  primaryCandidate?: DeconjugatedCandidate;
}

interface SearchNode {
  currentWord: string;
  steps: {
    rule: string;
    description: string;
    currentWord: string;
  }[];
  depth: number;
}

// 50-sound mappings from a, i, e rows back to u row
const A_TO_U: Record<string, string> = {
  わ: 'う', か: 'く', が: 'ぐ', さ: 'す', た: 'つ', な: 'ぬ', ば: 'ぶ', ま: 'む', ら: 'る',
};
const I_TO_U: Record<string, string> = {
  い: 'う', き: 'く', ぎ: 'ぐ', し: 'す', ち: 'つ', に: 'ぬ', び: 'ぶ', み: 'む', り: 'る',
};
const E_TO_U: Record<string, string> = {
  え: 'う', け: 'く', げ: 'ぐ', せ: 'す', て: 'つ', ね: 'ぬ', べ: 'ぶ', め: 'む', れ: 'る',
};

const I_ROW_SOUNDS = new Set([
  'い', 'き', 'ぎ', 'し', 'じ', 'ち', 'ぢ', 'に', 'ひ', 'び', 'ぴ', 'み', 'り',
]);
const E_ROW_SOUNDS = new Set([
  'え', 'け', 'げ', 'せ', 'ぜ', 'て', 'で', 'ね', 'へ', 'べ', 'ぺ', 'め', 'れ',
]);

// Single Kanji Sahen verbs
const SINGLE_KANJI_SAHEN = new Set(['愛', '感', '得', '損', '期', '徹', '任', '信']);

// Check if a stem can grammatically be an Ichidan verb stem
function canBeIchidanStem(stem: string): boolean {
  if (!stem || stem.length === 0) return false;

  // If stem matches a known database verb stem (like 見, 着, 寝, 出, 居, 得)
  const knownDirectIchidan = VERBS_DATABASE.some(
    v => v.group === 'ichidan' && (v.kanji.startsWith(stem) || v.reading.startsWith(stem))
  );
  if (knownDirectIchidan) return true;

  // Forbidden endings that can never be an Ichidan stem
  const forbiddenEndings = [
    'ます', 'まし', 'ませ', 'です', 'でした', 'たい', 'たく', 'ない', 'なか',
    'て', 'で', 'た', 'だ', 'っ', 'ん', 'ず', 'ば', 'よう', 'ろう', 'そう',
    'る', 'す', 'く', 'む', 'ぬ', 'つ', 'ぶ', 'ぐ', 'う', 'お', 'あ',
    'いただき', 'なかっ', 'いなかっ', 'たかっ', '行っ', '待っ'
  ];
  for (const end of forbiddenEndings) {
    if (stem.endsWith(end)) return false;
  }

  const lastChar = stem.slice(-1);
  return I_ROW_SOUNDS.has(lastChar) || E_ROW_SOUNDS.has(lastChar);
}

// Check if a prefix is a valid noun stem for a Sahen compound verb [Noun] + する
function isValidNounForSahen(prefix: string): boolean {
  if (!prefix || prefix.length === 0) return false;

  // Disallow auxiliary or inflectional hiragana endings
  const forbiddenEndings = [
    'ます', 'まし', 'ませ', 'です', 'でした', 'たい', 'たく', 'ない', 'なか',
    'て', 'で', 'た', 'だ', 'み', 'ま', 'れ', 'られ', 'せ', 'させ', 'ず', 'ば',
    'っ', 'ん', 'る', 'い', 'え', 'よ', 'ろ', 'べ', 'き', 'ぎ', 'ち', 'に', 'ひ', 'び', 'ぴ', 'り', 'し'
  ];
  for (const end of forbiddenEndings) {
    if (prefix.endsWith(end)) return false;
  }

  // Purely Katakana loanwords (e.g. ドライブ, キャンセル, スタート)
  if (/^[\u30a0-\u30ffー]+$/.test(prefix)) return true;

  // 2 or more Kanji compound (e.g. 勉強, 開封, 散歩, 運動, 案内, 準備, 発送, 連絡)
  if (/^[\u4e00-\u9faf]{2,}$/.test(prefix)) return true;

  // Rare 1-kanji sahen verbs (e.g. 愛する, 感する)
  if (SINGLE_KANJI_SAHEN.has(prefix)) return true;

  // Kanji + Kanji or Kanji prefix without trailing okurigana
  if (prefix.length >= 2 && /[\u4e00-\u9faf]/.test(prefix)) {
    const lastChar = prefix.slice(-1);
    if (!/[\u3040-\u309f]/.test(lastChar)) {
      return true;
    }
  }

  return false;
}

// Words ending in these suffixes are inflected forms or invalid endings, NOT dictionary forms
const FORBIDDEN_DICT_ENDINGS = [
  'ます', 'です', 'でした', 'ません', 'ました', 'ない', 'たい', 'た', 'だ', 'て', 'で', 'ば', 'ず',
  'よう', 'ろう', 'そう', 'しつ', 'ませむ', 'ませぶ', 'ませぬ', 'しる', 'ありる', 'ありむ', 'ありぶ',
  'たくあり', 'せられ', 'させられ', 'てみ', 'でみ',
  'てむ', 'でむ', 'てす', 'でず', 'てく', 'でぐ', 'てぶ', 'でぶ', 'てぬ', 'でぬ', 'てつ', 'でつ', 'てる', 'でる', 'てう', 'でう',
  'なかっ', 'いなかっ', 'たかっ', 'なかつ', 'いなかつ', 'たかつ', 'なかう', 'いなかう', 'たかう',
  'いただきる', 'いただきれ', 'いただきら', 'いただきろ'
];

function isPlausibleDictionaryForm(word: string): boolean {
  if (!word || word.length < 2) return false;

  // In standard Japanese, no dictionary form ends with 'っ' followed by the verb ending kana (e.g. なかっつ)
  if (word[word.length - 2] === 'っ') return false;

  for (const end of FORBIDDEN_DICT_ENDINGS) {
    if (word.endsWith(end)) return false;
  }
  const lastChar = word.slice(-1);
  return ['う', 'く', 'ぐ', 'す', 'つ', 'ぬ', 'ぶ', 'む', 'る'].includes(lastChar);
}

// Suffix peelers with rules
interface PeelerRule {
  suffix: string;
  ruleName: string;
  ruleDesc: string;
  replacement?: string;
}

const PEELERS: PeelerRule[] = [
  // 1. 口语/句尾后缀 (Colloquial / Sentence enders)
  { suffix: 'でする', ruleName: '剥离句尾「でする」', ruleDesc: '去除句尾口语或输入冗余「でする」' },
  { suffix: 'でした', ruleName: '剥离敬体过去「でした」', ruleDesc: '去除句尾助动词「でした」' },
  { suffix: 'です', ruleName: '剥离敬体「です」', ruleDesc: '去除句尾礼貌助词「です」' },

  // 2. 复合愿望态 (たい-compound)
  { suffix: 'たくありませんでした', ruleName: '剥离愿望敬体过去否定', ruleDesc: '去除「たくありませんでした」，还原连用形' },
  { suffix: 'たくありません', ruleName: '剥离愿望敬体否定', ruleDesc: '去除「たくありません」，还原连用形' },
  { suffix: 'たくなかった', ruleName: '剥离愿望过去否定', ruleDesc: '去除「たくなかった」，还原连用形' },
  { suffix: 'たくない', ruleName: '剥离愿望否定', ruleDesc: '去除「たくない」，还原连用形' },
  { suffix: 'たかった', ruleName: '剥离愿望过去', ruleDesc: '去除「たかった」，还原连用形' },
  { suffix: 'たい', ruleName: '剥离愿望态', ruleDesc: '去除「たい」，还原连用形' },

  // 3. 敬体 (ます-compound)
  { suffix: 'ませんでした', ruleName: '剥离敬体过去否定', ruleDesc: '去除「ませんでした」，还原连用形' },
  { suffix: 'ました', ruleName: '剥离敬体过去肯定', ruleDesc: '去除「ました」，还原连用形' },
  { suffix: 'ません', ruleName: '剥离敬体否定', ruleDesc: '去除「ません」，还原连用形' },
  { suffix: 'ます', ruleName: '剥离敬体肯定', ruleDesc: '去除「ます」，还原连用形' },

  // 4. 补助动词体系 (〜てみる / 〜ている / 〜てしまう / 〜ておく / 授受)
  // 〜てみる / 〜でみる (尝试体验)
  { suffix: 'てみませんでした', ruleName: '剥离尝试敬体过去否定', ruleDesc: '去除「てみませんでした」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみませんでした', ruleName: '剥离尝试敬体过去否定(浊)', ruleDesc: '去除「でみませんでした」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみません', ruleName: '剥离尝试敬体否定', ruleDesc: '去除「てみません」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみません', ruleName: '剥离尝试敬体否定(浊)', ruleDesc: '去除「でみません」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみました', ruleName: '剥离尝试敬体过去', ruleDesc: '去除「てみました」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみました', ruleName: '剥离尝试敬体过去(浊)', ruleDesc: '去除「でみました」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみます', ruleName: '剥离尝试敬体肯定', ruleDesc: '去除「てみます」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみます', ruleName: '剥离尝试敬体肯定(浊)', ruleDesc: '去除「为みます」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみない', ruleName: '剥离尝试否定', ruleDesc: '去除「てみない」，还原为「て」形', replacement: 'て' },
  { suffix: '为みない', ruleName: '剥离尝试否定(浊)', ruleDesc: '去除「でみない」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみた', ruleName: '剥离尝试过去态', ruleDesc: '去除「てみた」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみた', ruleName: '剥离尝试过去态(浊)', ruleDesc: '去除「でみた」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみる', ruleName: '剥离尝试体验态', ruleDesc: '去除「てみる」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみる', ruleName: '剥离尝试体验态(浊)', ruleDesc: '去除「でみる」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみて', ruleName: '剥离尝试连接态', ruleDesc: '去除「てみて」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみて', ruleName: '剥离尝试连接态(浊)', ruleDesc: '去除「でみて」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみよう', ruleName: '剥离尝试意志态', ruleDesc: '去除「てみよう」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみよう', ruleName: '剥离尝试意志态(浊)', ruleDesc: '去除「でみよう」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみたい', ruleName: '剥离尝试愿望态', ruleDesc: '去除「てみたい」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみたい', ruleName: '剥离尝试愿望态(浊)', ruleDesc: '去除「でみたい」，还原为「で」形', replacement: 'で' },
  { suffix: 'てみ', ruleName: '剥离尝试连用形', ruleDesc: '去除「てみ」，还原为「て」形', replacement: 'て' },
  { suffix: 'でみ', ruleName: '剥离尝试连用形(浊)', ruleDesc: '去除「でみ」，还原为「で」形', replacement: 'で' },

  // 〜てしまう / 〜でしまう (完成/遗憾)
  { suffix: 'てしまいました', ruleName: '剥离完成/遗憾敬体过去', ruleDesc: '去除「てしまいました」，还原为「て」形', replacement: 'て' },
  { suffix: 'でしまいました', ruleName: '剥离完成/遗憾敬体过去(浊)', ruleDesc: '去除「でしまいました」，还原为「で」形', replacement: 'で' },
  { suffix: 'てしまいます', ruleName: '剥离完成/遗憾敬体肯定', ruleDesc: '去除「てしまいます」，还原为「て」形', replacement: 'て' },
  { suffix: 'でしまいます', ruleName: '剥离完成/遗憾敬体肯定(浊)', ruleDesc: '去除「でしまいます」，还原为「で」形', replacement: 'で' },
  { suffix: 'てしまった', ruleName: '剥离完成/遗憾过去态', ruleDesc: '去除「てしまった」，还原为「て」形', replacement: 'て' },
  { suffix: 'でしまった', ruleName: '剥离完成/遗憾过去态(浊)', ruleDesc: '去除「でしまった」，还原为「で」形', replacement: 'で' },
  { suffix: 'てしまう', ruleName: '剥离完成/遗憾态', ruleDesc: '去除「てしまう」，还原为「て」形', replacement: 'て' },
  { suffix: 'でしまう', ruleName: '剥离完成/遗憾态(浊)', ruleDesc: '去除「でしまう」，还原为「で」形', replacement: 'で' },
  { suffix: 'ちゃいました', ruleName: '剥离完成口语敬体', ruleDesc: '去除「ちゃいました」，还原为「て」形', replacement: 'て' },
  { suffix: 'じゃいました', ruleName: '剥离完成口语敬体(浊)', ruleDesc: '去除「じゃいました」，还原为「で」形', replacement: 'で' },
  { suffix: 'ちゃった', ruleName: '剥离完成口语过去', ruleDesc: '去除「ちゃった」，还原为「て」形', replacement: 'て' },
  { suffix: 'じゃった', ruleName: '剥离完成口语过去(浊)', ruleDesc: '去除「じゃった」，还原为「で」形', replacement: 'で' },
  { suffix: 'ちゃう', ruleName: '剥离完成口语态', ruleDesc: '去除「ちゃう」，还原为「て」形', replacement: 'て' },
  { suffix: 'じゃう', ruleName: '剥离完成口语态(浊)', ruleDesc: '去除「じゃう」，还原为「で」形', replacement: 'で' },

  // 〜ておく / 〜でおく (预先准备)
  { suffix: 'ておきました', ruleName: '剥离预备敬体过去', ruleDesc: '去除「ておきました」，还原为「て」形', replacement: 'て' },
  { suffix: 'でおきました', ruleName: '剥离预备敬体过去(浊)', ruleDesc: '去除「でおきました」，还原为「で」形', replacement: 'で' },
  { suffix: 'ておきます', ruleName: '剥离预备敬体肯定', ruleDesc: '去除「ておきます」，还原为「て」形', replacement: 'て' },
  { suffix: 'でおきます', ruleName: '剥离预备敬体肯定(浊)', ruleDesc: '去除「でおきます」，还原为「de」形', replacement: 'で' },
  { suffix: 'ておいた', ruleName: '剥离预先准备过去态', ruleDesc: '去除「ておいた」，还原为「て」形', replacement: 'て' },
  { suffix: 'でおいた', ruleName: '剥离预先准备过去态(浊)', ruleDesc: '去除「でおいた」，还原为「で」形', replacement: 'で' },
  { suffix: 'ておく', ruleName: '剥离预先准备态', ruleDesc: '去除「ておく」，还原为「て」形', replacement: 'て' },
  { suffix: 'でおく', ruleName: '剥离预先准备态(浊)', ruleDesc: '去除「でおく」，还原为「で」形', replacement: 'で' },
  { suffix: 'ときます', ruleName: '剥离预备口语敬体', ruleDesc: '去除「ときます」，还原为「て」形', replacement: 'て' },
  { suffix: 'どきます', ruleName: '剥离预备口语敬体(浊)', ruleDesc: '去除「どきます」，还原为「で」形', replacement: 'で' },
  { suffix: 'といた', ruleName: '剥离预备口语过去', ruleDesc: '去除「といた」，还原为「て」形', replacement: 'て' },
  { suffix: 'どいた', ruleName: '剥离预备口语过去(浊)', ruleDesc: '去除「どいた」，还原为「で」形', replacement: 'で' },
  { suffix: 'とく', ruleName: '剥离预备口语形', ruleDesc: '去除「とく」，还原为「て」形', replacement: 'て' },
  { suffix: 'どく', ruleName: '剥离预备口语形(浊)', ruleDesc: '去除「どく」，还原为「で」形', replacement: 'で' },

  // 〜ていく / 〜てくる (趋向与时间推移)
  { suffix: 'ていきました', ruleName: '剥离趋向敬体过去', ruleDesc: '去除「ていきました」，还原为「て」形', replacement: 'て' },
  { suffix: 'ていきます', ruleName: '剥离趋向敬体肯定', ruleDesc: '去除「ていきます」，还原为「て」形', replacement: 'て' },
  { suffix: 'ていった', ruleName: '剥离趋向过去态', ruleDesc: '去除「ていった」，还原为「て」形', replacement: 'て' },
  { suffix: 'ていく', ruleName: '剥离趋向态', ruleDesc: '去除「ていく」，还原为「て」形', replacement: 'て' },
  { suffix: 'てきました', ruleName: '剥离到来敬体过去', ruleDesc: '去除「てきました」，还原为「て」形', replacement: 'て' },
  { suffix: 'てきます', ruleName: '剥离到来敬体肯定', ruleDesc: '去除「てきます」，还原为「て」形', replacement: 'て' },
  { suffix: 'てきた', ruleName: '剥离到来过去态', ruleDesc: '去除「てきた」，还原为「て」形', replacement: 'て' },
  { suffix: 'てくる', ruleName: '剥离到来态', ruleDesc: '去除「てくる」，还原为「て」形', replacement: 'て' },

  // 〜てくれる / 〜てあげる / 〜てもらう (授受补助)
  { suffix: 'てくれました', ruleName: '剥离授受敬体过去', ruleDesc: '去除「てくれました」，还原为「て」形', replacement: 'て' },
  { suffix: 'てくれます', ruleName: '剥离授受敬体肯定', ruleDesc: '去除「てくれます」，还原为「て」形', replacement: 'て' },
  { suffix: 'てくれた', ruleName: '剥离授受过去', ruleDesc: '去除「てくれた」，还原为「て」形', replacement: 'て' },
  { suffix: 'てくれる', ruleName: '剥离授受态(为我做)', ruleDesc: '去除「てくれる」，还原为「て」形', replacement: 'て' },
  { suffix: 'てあげました', ruleName: '剥离授受敬体过去', ruleDesc: '去除「てあげました」，还原为「て」形', replacement: 'て' },
  { suffix: 'てあげます', ruleName: '剥离授受敬体肯定', ruleDesc: '去除「てあげます」，还原为「て」形', replacement: 'て' },
  { suffix: 'てあげた', ruleName: '剥离授受过去', ruleDesc: '去除「てあげた」，还原为「て」形', replacement: 'て' },
  { suffix: 'てあげる', ruleName: '剥离授受态(为他做)', ruleDesc: '去除「てあげる」，还原为「て」形', replacement: 'て' },
  { suffix: 'てもらいました', ruleName: '剥离授受敬体过去', ruleDesc: '去除「てもらいました」，还原为「て」形', replacement: 'て' },
  { suffix: 'てもらいます', ruleName: '剥离授受敬体肯定', ruleDesc: '去除「てもらいます」，还原为「て」形', replacement: 'て' },
  { suffix: 'てもらった', ruleName: '剥离授受过去', ruleDesc: '去除「てもらった」，还原为「て」形', replacement: 'て' },
  { suffix: 'てもらう', ruleName: '剥离授受态(请他做)', ruleDesc: '去除「てもらう」，还原为「て」形', replacement: 'て' },

  // 〜ている / 〜でいる (进行/状态)
  { suffix: 'ていませんでした', ruleName: '剥离进行敬体过去否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいませんでした', ruleName: '剥离进行敬体过去否定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ていません', ruleName: '剥离进行敬体否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいません', ruleName: '剥离进行敬体否定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ていました', ruleName: '剥离进行敬体过去', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいました', ruleName: '剥离进行敬体过去(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ています', ruleName: '剥离进行敬体肯定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいます', ruleName: '剥离进行敬体肯定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ていなかった', ruleName: '剥离进行简体过去否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいなかった', ruleName: '剥离进行简体过去否定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ていない', ruleName: '剥离进行简体否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいない', ruleName: '剥离进行简体否定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ていた', ruleName: '剥离进行简体过去', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいた', ruleName: '剥离进行简体过去(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'ている', ruleName: '剥离进行简体肯定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でいる', ruleName: '剥离进行简体肯定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'てい', ruleName: '剥离进行态连用', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でい', ruleName: '剥离进行态连用(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'てました', ruleName: '剥离进行口语敬体过去', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でました', ruleName: '剥离进行口语敬体过去(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'てます', ruleName: '剥离进行口语敬体肯定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でます', ruleName: '剥离进行口语敬体肯定(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'てた', ruleName: '剥离进行口语过去', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でた', ruleName: '剥离进行口语过去(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },
  { suffix: 'てる', ruleName: '剥离进行口语态', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'でる', ruleName: '剥离进行口语态(浊)', ruleDesc: '还原为连接「で」形', replacement: 'で' },

  // 5. 义务与禁止 (Must / Have to)
  { suffix: 'なければならなかった', ruleName: '剥离义务过去形', ruleDesc: '去除「なければならなかった」，还原为未然形' },
  { suffix: 'なければならない', ruleName: '剥离义务形 (必须)', ruleDesc: '去除「なければならない」，还原为未然形' },
  { suffix: 'なければいけない', ruleName: '剥离义务形 (必须)', ruleDesc: '去除「なければいけない」，还原为未然形' },
  { suffix: 'なくてはならない', ruleName: '剥离义务形 (必须)', ruleDesc: '去除「なくてはならない」，还原为未然形' },

  // 6. 否定形 (ない-compound)
  { suffix: 'なかった', ruleName: '剥离否定过去形', ruleDesc: '去除「なかった」，还原为未然形' },
  { suffix: 'ないで', ruleName: '剥离否定伴随「ないで」', ruleDesc: '去除「ないで」，还原为未然形' },
  { suffix: 'ない', ruleName: '剥离否定未然形', ruleDesc: '去除「ない」，还原为未然形' },

  // 7. 难易度与过度态
  { suffix: 'すぎた', ruleName: '剥离过度过去态', ruleDesc: '去除「すぎた」，还原连用形' },
  { suffix: 'すぎる', ruleName: '剥离过度态', ruleDesc: '去除「すぎる」，还原连用形' },
  { suffix: 'やすかった', ruleName: '剥离容易度过去态', ruleDesc: '去除「やすかった」，还原连用形' },
  { suffix: 'やすい', ruleName: '剥离容易度态', ruleDesc: '去除「やすい」，还原连用形' },
  { suffix: 'にくかった', ruleName: '剥离困难度过去态', ruleDesc: '去除「にくかった」，还原连用形' },
  { suffix: 'にくい', ruleName: '剥离困难度态', ruleDesc: '去除「にくい」，还原连用形' },
  { suffix: 'ながら', ruleName: '剥离伴随动作', ruleDesc: '去除「ながら」，还原连用形' },

  // 8. 语态层 (使役受身、使役、受身、可能)
  { suffix: 'させられた', ruleName: '剥离一段/サ变使役受身过去', ruleDesc: '去除「させられた (被迫做)」，还原为原形词干' },
  { suffix: 'させられる', ruleName: '剥离一段/サ变使役受身', ruleDesc: '去除「させられる (被迫做)」，还原为原形词干' },
  { suffix: 'させられ', ruleName: '剥离一段/サ变使役受身连用', ruleDesc: '去除「させられ (被迫做)」，还原为原形词干' },
  { suffix: 'せられた', ruleName: '剥离五段使役受身过去', ruleDesc: '去除「せられた (被迫做)」，还原为五段未然形' },
  { suffix: 'せられる', ruleName: '剥离五段使役受身', ruleDesc: '去除「せられる (被迫做)」，还原为五段未然形' },
  { suffix: 'せられ', ruleName: '剥离五段使役受身连用', ruleDesc: '去除「せられ (被迫做)」，还原为五段未然形' },
  { suffix: 'された', ruleName: '剥离约音使役受身/被动过去', ruleDesc: '去除「された」，还原为未然形' },
  { suffix: 'される', ruleName: '剥离约音使役受身/被动', ruleDesc: '去除「される」，还原为未然形' },
  { suffix: 'され', ruleName: '剥离约音使役受身/被动连用', ruleDesc: '去除「され」，还原为未然形' },

  { suffix: 'させた', ruleName: '剥离使役过去态', ruleDesc: '去除「させた (让做)」，还原为原形词干' },
  { suffix: 'させる', ruleName: '剥离使役态', ruleDesc: '去除「させる (让做)」，还原为原形词干' },
  { suffix: 'させ', ruleName: '剥离使役连用形', ruleDesc: '去除「させ (让做)」，还原为原形词干' },
  { suffix: 'せた', ruleName: '剥离五段使役过去', ruleDesc: '去除「せた (让做)」，还原五段未然形' },
  { suffix: 'せる', ruleName: '剥离五段使役态', ruleDesc: '去除「せる (让做)」，还原五段未然形' },
  { suffix: 'せ', ruleName: '剥离五段使役连用', ruleDesc: '去除「せ (让做)」，还原五段未然形' },

  { suffix: 'られた', ruleName: '剥离一段受身/可能过去', ruleDesc: '去除「られた」，还原一段词干' },
  { suffix: 'られる', ruleName: '剥离一段受身/可能态', ruleDesc: '去除「られる」，还原一段词干' },
  { suffix: 'られ', ruleName: '剥离一段受身/可能连用', ruleDesc: '去除「られ」，还原一段词干' },
  { suffix: 'れた', ruleName: '剥离五段受身/可能过去', ruleDesc: '去除「れた」，还原五段词干' },
  { suffix: 'れる', ruleName: '剥离五段受身/可能态', ruleDesc: '去除「れる」，还原五段词干' },
  { suffix: 'れ', ruleName: '剥离五段受身/可能连用', ruleDesc: '去除「れ」，还原五段词干' },

  // 9. 假定与命令
  { suffix: 'れば', ruleName: '剥离假定形', ruleDesc: '去除「れば」，还原为原形' },
  { suffix: 'ば', ruleName: '剥离假定「ば」', ruleDesc: '去除「ば」，还原为え段词干' },
  { suffix: 'ろ', ruleName: '剥离一段命令「ろ」', ruleDesc: '去除「ろ」，还原一段词干' },
  { suffix: 'よう', ruleName: '剥离一段意向「よう」', ruleDesc: '去除「よう」，还原一段词干' },
];

// Sahen compound verb conjugations: [Noun] + します/した/して/など
const SAHEN_CONJUGATIONS: { suffix: string; name: string }[] = [
  // 谦让使役授受 (〜させていただきます)
  { suffix: 'させていただきます', name: 'サ变使役谦让敬体肯定' },
  { suffix: 'させていただきました', name: 'サ变使役谦让敬体过去' },
  { suffix: 'させていただきませんでした', name: 'サ变使役谦让敬体过去否定' },
  { suffix: 'させていただきません', name: 'サ变使役谦让敬体否定' },
  { suffix: 'させていただきたい', name: 'サ变使役谦让愿望' },
  { suffix: 'させていただけます', name: 'サ变使役谦让可能' },
  { suffix: 'させていただいて', name: 'サ变使役谦让连接' },
  { suffix: 'させていただいた', name: 'サ变使役谦让过去' },
  { suffix: 'させていただき', name: 'サ变使役谦让连用' },
  { suffix: 'させていただく', name: 'サ变使役谦让形' },
  { suffix: 'せていただきます', name: 'サ变使役谦让敬体肯定' },
  { suffix: 'せていただきました', name: 'サ变使役谦让敬体过去' },
  { suffix: 'せていただく', name: 'サ变使役谦让形' },
  { suffix: 'せていただき', name: 'サ变使役谦让连用' },

  // 使役受身
  { suffix: 'させられたくありませんでした', name: 'サ变使役受身敬体过去否定' },
  { suffix: 'させられました', name: 'サ变使役受身敬体过去' },
  { suffix: 'させられません', name: 'サ变使役受身敬体否定' },
  { suffix: 'させられた', name: 'サ变使役受身过去' },
  { suffix: 'させられる', name: 'サ变使役受身' },
  { suffix: 'させられ', name: 'サ变使役受身连用' },
  { suffix: 'させました', name: 'サ变使役敬体过去' },
  { suffix: 'させません', name: 'サ变使役敬体否定' },
  { suffix: 'させたい', name: 'サ变使役愿望' },
  { suffix: 'させた', name: 'サ变使役过去' },
  { suffix: 'させる', name: 'サ变使役' },
  { suffix: 'させ', name: 'サ变使役连用' },

  // 被动态与进行 (〜されていなかった / されています / される)
  { suffix: 'されていませんでした', name: 'サ变被动敬体过去否定' },
  { suffix: 'されていません', name: 'サ变被动敬体否定' },
  { suffix: 'されていました', name: 'サ变被动敬体过去' },
  { suffix: 'されています', name: 'サ变被动敬体进行' },
  { suffix: 'されていなかった', name: 'サ变被动简体过去否定' },
  { suffix: 'されていない', name: 'サ变被动简体否定' },
  { suffix: 'されていた', name: 'サ变被动简体过去' },
  { suffix: 'されている', name: 'サ变被动状态/进行' },
  { suffix: 'されて', name: 'サ变被动连接形' },
  { suffix: 'されました', name: 'サ变被动敬体过去' },
  { suffix: 'されません', name: 'サ变被动敬体否定' },
  { suffix: 'された', name: 'サ变被动过去' },
  { suffix: 'される', name: 'サ变被动' },
  { suffix: 'され', name: 'サ变被动连用' },

  // 谦让语 (〜いたします)
  { suffix: 'いたしました', name: 'サ变谦让语敬体过去' },
  { suffix: 'いたしませんでした', name: 'サ变谦让语过去否定' },
  { suffix: 'いたしません', name: 'サ变谦让语否定' },
  { suffix: 'いたします', name: 'サ变谦让语敬体' },
  { suffix: 'いたしたく', name: 'サ变谦让语愿望连用' },
  { suffix: 'いたし', name: 'サ变谦让语连用' },
  { suffix: 'いたす', name: 'サ变谦让语原形' },

  // 可能形
  { suffix: 'できませんでした', name: 'サ变可能敬体过去否定' },
  { suffix: 'できません', name: 'サ变可能敬体否定' },
  { suffix: 'できました', name: 'サ变可能敬体过去' },
  { suffix: 'できない', name: 'サ变可能否定' },
  { suffix: 'できた', name: 'サ变可能过去' },
  { suffix: 'できる', name: 'サ变可能形' },
  { suffix: 'できて', name: 'サ变可能连接形' },

  // 基础敬体/简体
  { suffix: 'しませんでした', name: 'サ变敬体过去否定' },
  { suffix: 'しました', name: 'サ变敬体过去' },
  { suffix: 'しません', name: 'サ变敬体否定' },
  { suffix: 'します', name: 'サ变敬体肯定' },
  { suffix: 'しなかった', name: 'サ变简体过去否定' },
  { suffix: 'しない', name: 'サ变简体否定' },
  { suffix: 'した', name: 'サ变过去形' },
  { suffix: 'して', name: 'サ变连接形' },
  { suffix: 'しよう', name: 'サ变意志形' },
  { suffix: 'し', name: 'サ变连用形' },
];

/**
 * Intelligent Multi-pass Recursive Japanese Verb Lemmatizer
 */
export function lemmatizeVerb(rawInput: string): LemmatizeResult {
  const input = rawInput.trim();
  if (!input) {
    return { input: '', candidates: [] };
  }

  const candidates: DeconjugatedCandidate[] = [];
  const candidateKeys = new Set<string>();

  const registerCandidate = (cand: DeconjugatedCandidate) => {
    const key = `${cand.dictionaryForm}_${cand.group}`;
    if (!candidateKeys.has(key)) {
      candidateKeys.add(key);
      candidates.push(cand);
    }
  };

  // Helper: Try to resolve a word as a valid dictionary form
  const tryResolveDictionaryForm = (
    word: string,
    history: { rule: string; description: string; currentWord: string }[]
  ) => {
    if (!word) return;

    // Check A: Is it a direct match in VERBS_DATABASE?
    const dbMatch = VERBS_DATABASE.find(
      v => v.kanji === word || v.reading === word || v.romaji.toLowerCase() === word.toLowerCase()
    );
    if (dbMatch) {
      registerCandidate({
        dictionaryForm: dbMatch.kanji,
        reading: dbMatch.reading,
        romaji: dbMatch.romaji,
        meaning: dbMatch.meaning,
        group: dbMatch.group,
        subgroup: dbMatch.subgroup,
        isException: dbMatch.isException,
        confidence: 'exact',
        transformationSteps: history.length > 0
          ? [
              ...history,
              {
                rule: '字典收录原形命中',
                description: `成功还原并匹配至字典词条「${dbMatch.kanji}（${dbMatch.reading}）」。`,
                currentWord: dbMatch.kanji,
              },
            ]
          : [
              {
                rule: '输入即为辞书形',
                description: '输入本身即为标准动词辞书形（原形）。',
                currentWord: dbMatch.kanji,
              },
            ],
        matchedVerb: dbMatch,
      });
      return;
    }

    // Check B: Is it a known exception verb?
    const exc = VERB_EXCEPTIONS.find(e => e.kanji === word || e.reading === word);
    if (exc) {
      registerCandidate({
        dictionaryForm: exc.kanji,
        reading: exc.reading,
        romaji: exc.romaji,
        meaning: exc.meaning,
        group: 'godan',
        isException: true,
        confidence: 'high',
        transformationSteps: [
          ...history,
          {
            rule: '特殊五段字典命中',
            description: `成功还原为特殊五段动词「${exc.kanji}（${exc.reading}）」。`,
            currentWord: exc.kanji,
          },
        ],
      });
      return;
    }

    // Check C: Is it a compound 〜する? (e.g. 勉強する, 散歩する, 開封する)
    if (word.endsWith('する') && word.length >= 3) {
      // Disallow corruptions like ...まする or ...でする
      if (word.endsWith('まする') || word.endsWith('でする') || word.endsWith('たする')) {
        return;
      }
      const prefix = word.slice(0, -2);
      if (isValidNounForSahen(prefix)) {
        registerCandidate({
          dictionaryForm: word,
          reading: word,
          romaji: toRomaji(word),
          meaning: '进行 / 做（サ变动词）',
          group: 'irregular',
          subgroup: 'sahen',
          confidence: 'high',
          transformationSteps: [
            ...history,
            {
              rule: 'サ变复合原形确立',
              description: `还原为サ行变格复合动词「${word}」。`,
              currentWord: word,
            },
          ],
        });
        return;
      }
    }

    // Check D: Auxiliary compound form (e.g. 〜てみる, 〜させていただく)
    if (
      word.endsWith('てみる') ||
      word.endsWith('でみる') ||
      word.endsWith('させていただく') ||
      word.endsWith('せていただく') ||
      word.endsWith('されている') ||
      word.endsWith('される')
    ) {
      const isItadaku = word.endsWith('いただく');
      const isPassive = word.endsWith('されている') || word.endsWith('される');
      registerCandidate({
        dictionaryForm: word,
        reading: word,
        romaji: toRomaji(word),
        meaning: isItadaku
          ? '谦让使役授受（承蒙允许做...）'
          : isPassive
          ? '受身/被动态'
          : '尝试 / 试着做（复合补助动词）',
        group: isItadaku ? 'godan' : 'ichidan',
        subgroup: isItadaku ? 'godan' : 'kami-ichidan',
        confidence: 'high',
        transformationSteps: [
          ...history,
          {
            rule: isItadaku
              ? '复合使役谦让原形确立'
              : isPassive
              ? '被动态原形确立'
              : '复合补助动词原形确立',
            description: `确认为复合形态原形「${word}」。`,
            currentWord: word,
          },
        ],
      });
      return;
    }

    // Check E: General Morphological Candidate (e.g. 歌う, 探す, 壊す, 歩く)
    // ONLY allowed if it is a plausible dictionary form and has undergone actual reversal
    // or matches a pristine Kanji+kana dictionary form
    if (isPlausibleDictionaryForm(word) && (history.length > 0 || /^[\u4e00-\u9faf]+[うくぐすつぬぶむる]$/.test(word))) {
      const lastChar = word.slice(-1);
      if (['う', 'く', 'ぐ', 'す', 'つ', 'ぬ', 'ぶ', 'む'].includes(lastChar)) {
        registerCandidate({
          dictionaryForm: word,
          reading: word,
          romaji: toRomaji(word),
          meaning: '五段动词（辞书形）',
          group: 'godan',
          subgroup: 'godan',
          confidence: 'high',
          transformationSteps: [
            ...history,
            {
              rule: '五段动词形态确立',
              description: `根据活用词尾「${lastChar}」判定还原为五段动词（Group 1）「${word}」。`,
              currentWord: word,
            },
          ],
        });
      } else if (lastChar === 'る' && canBeIchidanStem(word.slice(0, -1))) {
        registerCandidate({
          dictionaryForm: word,
          reading: word,
          romaji: toRomaji(word),
          meaning: '一段动词（辞书形）',
          group: 'ichidan',
          subgroup: 'shimo-ichidan',
          confidence: 'high',
          transformationSteps: [
            ...history,
            {
              rule: '一段动词形态确立',
              description: `根据词干母音判定还原为一段动词（Group 2）「${word}」。`,
              currentWord: word,
            },
          ],
        });
      }
    }
  };

  // Special early check: If the raw input is already an auxiliary form like 〜てみます or 〜させていただきます
  for (const aux of [
    'させていただきます', 'させていただきました', 'させていただきません', 'させていただきませんでした',
    'させていただきたい', 'させていただけます', 'させていただき',
    'せていただきます', 'せていただきました', 'せていただき',
    'てみます', 'でみます', 'てみました', 'でみました', 'てみたい', 'でみたい', 'てみない', 'でみない', 'てみよう', 'でみよう', 'てみて', 'でみて'
  ]) {
    if (input.endsWith(aux)) {
      let auxBase = '';
      if (aux.includes('いただき')) {
        auxBase = input.slice(0, -aux.length) + (aux.startsWith('せ') ? 'せていただく' : 'させていただく');
      } else {
        auxBase = input.slice(0, -aux.length) + (aux.startsWith('で') ? 'でみる' : 'てみる');
      }
      tryResolveDictionaryForm(auxBase, [
        {
          rule: '复合形态识别',
          description: `识别到带有复合形态活用，对应复合词形「${auxBase}」。`,
          currentWord: auxBase,
        },
      ]);
    }
  }

  // BFS Queue for multi-layer stripping
  const queue: SearchNode[] = [{ currentWord: input, steps: [], depth: 0 }];
  const visitedStates = new Set<string>();

  // Check initial word directly
  tryResolveDictionaryForm(input, []);

  // Multi-pass BFS Search
  while (queue.length > 0) {
    const { currentWord, steps, depth } = queue.shift()!;
    if (depth > 6) continue; // Prevent infinite cycles

    if (visitedStates.has(currentWord)) continue;
    visitedStates.add(currentWord);

    // 1. Direct Resolution: Does currentWord immediately match a verb?
    tryResolveDictionaryForm(currentWord, steps);

    // 2. Special Irregular: する / 来る roots
    if (currentWord === '' || currentWord === 'し' || currentWord === 'さ' || currentWord === 'させ' || currentWord === 'させられ') {
      const suruVerb = VERBS_DATABASE.find(v => v.kanji === 'する');
      registerCandidate({
        dictionaryForm: 'する',
        reading: 'する',
        romaji: 'suru',
        meaning: '做 / 进行',
        group: 'irregular',
        subgroup: 'sahen',
        confidence: 'high',
        transformationSteps: [
          ...steps,
          {
            rule: 'サ行变格词根归位',
            description: `剥离所有活用形态后，词根确认为第 3 类不规则动词「する」。`,
            currentWord: 'する',
          },
        ],
        matchedVerb: suruVerb,
      });
    }

    if (currentWord === '来' || currentWord === 'こ' || currentWord === 'き' || currentWord === 'く' || currentWord === 'こさせ' || currentWord === 'こさせられ') {
      const kuruVerb = VERBS_DATABASE.find(v => v.kanji === '来る');
      registerCandidate({
        dictionaryForm: '来る',
        reading: 'くる',
        romaji: 'kuru',
        meaning: '来 / 到来',
        group: 'irregular',
        subgroup: 'kahen',
        confidence: 'high',
        transformationSteps: [
          ...steps,
          {
            rule: 'カ行变格词根归位',
            description: `剥离所有活用形态后，词根确认为第 3 类不规则动词「来る（くる）」。`,
            currentWord: '来る',
          },
        ],
        matchedVerb: kuruVerb,
      });
    }

    // 3. Check for Sahen Compounds: [Noun] + します/した/して/されない/など
    for (const conj of SAHEN_CONJUGATIONS) {
      if (currentWord.endsWith(conj.suffix) && currentWord.length >= conj.suffix.length) {
        const prefix = currentWord.slice(0, -conj.suffix.length);
        if (prefix === '') {
          // Pure する
          const suruVerb = VERBS_DATABASE.find(v => v.kanji === 'する');
          registerCandidate({
            dictionaryForm: 'する',
            reading: 'する',
            romaji: 'suru',
            meaning: '做 / 进行',
            group: 'irregular',
            subgroup: 'sahen',
            confidence: 'high',
            transformationSteps: [
              ...steps,
              {
                rule: `${conj.name}➔サ变原形`,
                description: `识别「${conj.suffix}」为不规则サ变动词活用，还原为「する」。`,
                currentWord: 'する',
              },
            ],
            matchedVerb: suruVerb,
          });
        } else if (isValidNounForSahen(prefix)) {
          const sahenDict = prefix + 'する';
          tryResolveDictionaryForm(sahenDict, [
            ...steps,
            {
              rule: `${conj.name}➔サ变复合原形`,
              description: `词干「${prefix}」搭配「${conj.suffix}」，还原为サ变复合动词「${sahenDict}」。`,
              currentWord: sahenDict,
            },
          ]);
        }
      }
    }

    // 4. Special Reverse Mapping for Godan 「す」 (e.g. 話す, 消す, 探す)
    // て形/た形: 〜して / 〜した
    if (currentWord.endsWith('して') || currentWord.endsWith('した')) {
      const baseStem = currentWord.slice(0, -2);
      if (baseStem.length >= 1) {
        const suCand = baseStem + 'す';
        tryResolveDictionaryForm(suCand, [
          ...steps,
          {
            rule: '五段「す」结尾连用/过去逆向溯源',
            description: `末尾「${currentWord.slice(-2)}」逆向还原为五段词尾「す」➔ ${suCand}`,
            currentWord: suCand,
          },
        ]);
      }
    }

    // 连用形: 〜し (e.g. 話し -> 話す)
    if (currentWord.endsWith('し') && !currentWord.endsWith('ない') && !currentWord.endsWith('たい')) {
      const baseStem = currentWord.slice(0, -1);
      if (baseStem.length >= 1) {
        const suCand = baseStem + 'す';
        tryResolveDictionaryForm(suCand, [
          ...steps,
          {
            rule: '五段「す」结尾连用形逆向溯源',
            description: `末尾「し」逆向还原为五段词尾「す」➔ ${suCand}`,
            currentWord: suCand,
          },
        ]);
      }
    }

    // 5. Try interpreting currentWord as an Ichidan stem (append 'る') ONLY IF phonetically valid
    if (canBeIchidanStem(currentWord)) {
      const ichidanCand = currentWord + 'る';
      tryResolveDictionaryForm(ichidanCand, [
        ...steps,
        {
          rule: '一段动词去「る」逆向补回',
          description: `一段动词词干「${currentWord}」末尾补回「る」= ${ichidanCand}`,
          currentWord: ichidanCand,
        },
      ]);
    }

    // 6. Try interpreting currentWord as a Godan stem
    // If last char is a-row (未然), i-row (连用), or e-row (假定/可能), map back to u-row
    if (currentWord.length >= 1) {
      const lastChar = currentWord.slice(-1);
      const stemPrefix = currentWord.slice(0, -1);

      // a-row -> u-row (e.g. 帰ら -> 帰る, 書か -> 書く, 飲ま -> 飲む)
      // Note: Words ending in 'た' or 'だ' are past tense (e.g. 食べた, 行った, なかった),
      // never bare a-row stems. Do not map 'た' to 'つ' if it's preceded by 'っ' or at depth 0.
      if (A_TO_U[lastChar]) {
        if (
          lastChar === 'た' &&
          (depth === 0 ||
            stemPrefix.endsWith('っ') ||
            stemPrefix.endsWith('か') ||
            stemPrefix.endsWith('な') ||
            stemPrefix.endsWith('まし') ||
            stemPrefix.endsWith('でし'))
        ) {
          // Skip: past tense marker
        } else {
          const uChar = A_TO_U[lastChar];
          const godanCand = stemPrefix + uChar;
          tryResolveDictionaryForm(godanCand, [
            ...steps,
            {
              rule: '五段未然形 (あ段) 映射回原形 (う段)',
              description: `末尾未然形假名「${lastChar}」映射回原形词尾「${uChar}」= ${godanCand}`,
              currentWord: godanCand,
            },
          ]);
        }
      }

      // i-row -> u-row (e.g. 帰り -> 帰る, 書き -> 書く, 飲み -> 飲む)
      if (
        I_TO_U[lastChar] &&
        !currentWord.endsWith('ない') &&
        !currentWord.endsWith('たい') &&
        !currentWord.endsWith('てみ') &&
        !currentWord.endsWith('でみ') &&
        !currentWord.endsWith('てい') &&
        !currentWord.endsWith('でい')
      ) {
        const uChar = I_TO_U[lastChar];
        const godanCand = stemPrefix + uChar;
        tryResolveDictionaryForm(godanCand, [
          ...steps,
          {
            rule: '五段连用形 (い段) 映射回原形 (う段)',
            description: `末尾连用形假名「${lastChar}」映射回原形词尾「${uChar}」= ${godanCand}`,
            currentWord: godanCand,
          },
        ]);
      }

      // e-row -> u-row (e.g. 書け -> 書く, 飲め -> 飲む)
      if (E_TO_U[lastChar] && lastChar !== 'て' && lastChar !== 'で') {
        const uChar = E_TO_U[lastChar];
        const godanCand = stemPrefix + uChar;
        tryResolveDictionaryForm(godanCand, [
          ...steps,
          {
            rule: '五段假定/可能形 (え段) 映射回原形 (う段)',
            description: `末尾假定/可能假名「${lastChar}」映射回原形词尾「${uChar}」= ${godanCand}`,
            currentWord: godanCand,
          },
        ]);
      }
    }

    // 7. Special Onbin (音便) Reverse Mapping for て/た forms
    // 行く特例
    if (currentWord === '行っ' || currentWord === 'いっ' || currentWord === '行って' || currentWord === '行った') {
      const ikuVerb = VERBS_DATABASE.find(v => v.kanji === '行く');
      registerCandidate({
        dictionaryForm: '行く',
        reading: 'いく',
        romaji: 'iku',
        meaning: '去 / 前往',
        group: 'godan',
        confidence: 'exact',
        transformationSteps: [
          ...steps,
          {
            rule: '促音便特例反推',
            description: `「${currentWord}」是动词「行く」独有的促音便特例，还原为「行く」。`,
            currentWord: '行く',
          },
        ],
        matchedVerb: ikuVerb,
      });
    }

    // 促音便: 〜って / 〜った / 〜っ
    if (currentWord.endsWith('って') || currentWord.endsWith('った') || currentWord.endsWith('っ')) {
      const cutLen = currentWord.endsWith('って') || currentWord.endsWith('った') ? 2 : 1;
      const baseStem = currentWord.slice(0, -cutLen);
      for (const endChar of ['う', 'つ', 'る']) {
        const cand = baseStem + endChar;
        tryResolveDictionaryForm(cand, [
          ...steps,
          {
            rule: '促音便 (っ) 逆向溯源',
            description: `促音便词干还原为五段词尾「${endChar}」= ${cand}`,
            currentWord: cand,
          },
        ]);
      }
    }

    // 拨音便: 〜んで / 〜んだ / 〜ん
    if (currentWord.endsWith('んで') || currentWord.endsWith('んだ') || currentWord.endsWith('ん')) {
      const cutLen = currentWord.endsWith('んで') || currentWord.endsWith('んだ') ? 2 : 1;
      const baseStem = currentWord.slice(0, -cutLen);
      for (const endChar of ['む', 'ぶ', 'ぬ']) {
        const cand = baseStem + endChar;
        tryResolveDictionaryForm(cand, [
          ...steps,
          {
            rule: '拨音便 (ん) 逆向溯源',
            description: `拨音便词干还原为五段词尾「${endChar}」= ${cand}`,
            currentWord: cand,
          },
        ]);
      }
    }

    // イ音便: 〜いて / 〜いた / 〜いで / 〜いだ
    if (currentWord.endsWith('いて') || currentWord.endsWith('いた')) {
      const baseStem = currentWord.slice(0, -2);
      const cand = baseStem + 'く';
      tryResolveDictionaryForm(cand, [
        ...steps,
        {
          rule: 'イ音便 (清音) 逆向溯源',
          description: `イ音便还原为五段词尾「く」= ${cand}`,
          currentWord: cand,
        },
      ]);
    }
    if (currentWord.endsWith('いで') || currentWord.endsWith('いだ')) {
      const baseStem = currentWord.slice(0, -2);
      const cand = baseStem + 'ぐ';
      tryResolveDictionaryForm(cand, [
        ...steps,
        {
          rule: 'イ音便 (浊音) 逆向溯源',
          description: `浊化イ音便还原为五段词尾「ぐ」= ${cand}`,
          currentWord: cand,
        },
      ]);
    }

    // 8. General te-form ending (〜て):
    // e.g. 食べて -> 食べ -> 食べる
    if (currentWord.endsWith('て') && !currentWord.endsWith('って') && !currentWord.endsWith('いて') && !currentWord.endsWith('して')) {
      const stem = currentWord.slice(0, -1);
      if (canBeIchidanStem(stem)) {
        const ichidanCand = stem + 'る';
        tryResolveDictionaryForm(ichidanCand, [
          ...steps,
          {
            rule: '一段动词「て」形还原为辞书形',
            description: `去「て」并补回「る」➔ ${ichidanCand}`,
            currentWord: ichidanCand,
          },
        ]);
      }
    }

    // 9. Branch into deeper stripping operations using PEELERS
    for (const p of PEELERS) {
      if (currentWord.endsWith(p.suffix) && currentWord.length >= p.suffix.length) {
        const stripped = currentWord.slice(0, -p.suffix.length);
        const nextWord = p.replacement ? stripped + p.replacement : stripped;

        if (nextWord !== currentWord && !visitedStates.has(nextWord)) {
          queue.push({
            currentWord: nextWord,
            steps: [
              ...steps,
              {
                rule: p.ruleName,
                description: `${p.ruleDesc}（剥离「${p.suffix}」➔ 剩余「${nextWord}」）`,
                currentWord: nextWord,
              },
            ],
            depth: depth + 1,
          });
        }
      }
    }
  }

  // Sort candidates intelligently
  candidates.sort((a, b) => {
    // 1. Direct matched verbs in database have highest priority
    if (a.matchedVerb && !b.matchedVerb) return -1;
    if (!a.matchedVerb && b.matchedVerb) return 1;

    // 2. Exception verbs have high priority
    if (a.isException && !b.isException) return -1;
    if (!a.isException && b.isException) return 1;

    // 3. Exact > High > Possible
    const confOrder = { exact: 0, high: 1, possible: 2 };
    if (confOrder[a.confidence] !== confOrder[b.confidence]) {
      return confOrder[a.confidence] - confOrder[b.confidence];
    }

    // 4. Prefer root base verb over compound auxiliary/passive/benefactive if both exist
    // E.g. prefer 発送する over 発送される / 発送されている, 連絡する over 連絡させていただく, 開封する over 開封してみる
    const aIsDerived =
      a.dictionaryForm.endsWith('てみる') ||
      a.dictionaryForm.endsWith('でみる') ||
      a.dictionaryForm.endsWith('いただく') ||
      a.dictionaryForm.endsWith('されている') ||
      (a.dictionaryForm.endsWith('される') && a.dictionaryForm.length >= 4);
    const bIsDerived =
      b.dictionaryForm.endsWith('てみる') ||
      b.dictionaryForm.endsWith('でみる') ||
      b.dictionaryForm.endsWith('いただく') ||
      b.dictionaryForm.endsWith('されている') ||
      (b.dictionaryForm.endsWith('される') && b.dictionaryForm.length >= 4);
    if (!aIsDerived && bIsDerived) return -1;
    if (aIsDerived && !bIsDerived) return 1;

    // 5. Prefer proper Sahen compound verbs (〜する) with multi-kanji/katakana nouns
    const aIsStrongSahen = a.group === 'irregular' && a.dictionaryForm.endsWith('する') && a.dictionaryForm.length >= 3;
    const bIsStrongSahen = b.group === 'irregular' && b.dictionaryForm.endsWith('する') && b.dictionaryForm.length >= 3;
    if (aIsStrongSahen && !bIsStrongSahen) return -1;
    if (!aIsStrongSahen && bIsStrongSahen) return 1;

    // 6. Shorter transformation steps (more direct) preferred
    return a.transformationSteps.length - b.transformationSteps.length;
  });

  return {
    input,
    candidates,
    primaryCandidate: candidates[0],
  };
}

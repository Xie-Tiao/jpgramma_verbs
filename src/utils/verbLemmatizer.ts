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

  // 4. 存续/进行与补助动词 (て-compounds)
  { suffix: 'ていませんでした', ruleName: '剥离进行敬体过去否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ていません', ruleName: '剥离进行敬体否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ていました', ruleName: '剥离进行敬体过去', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ています', ruleName: '剥离进行敬体肯定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ていなかった', ruleName: '剥离进行简体过去否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ていない', ruleName: '剥离进行简体否定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ていた', ruleName: '剥离进行简体过去', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'ている', ruleName: '剥离进行简体肯定', ruleDesc: '还原为连接「て」形', replacement: 'て' },
  { suffix: 'てしまった', ruleName: '剥离完成/遗憾过去态', ruleDesc: '去除「てしまった」，还原为「て」形', replacement: 'て' },
  { suffix: 'てしまう', ruleName: '剥离完成/遗憾态', ruleDesc: '去除「てしまう」，还原为「て」形', replacement: 'て' },
  { suffix: 'ておいた', ruleName: '剥离预先准备过去态', ruleDesc: '去除「ておいた」，还原为「て」形', replacement: 'て' },
  { suffix: 'ておく', ruleName: '剥离预先准备态', ruleDesc: '去除「ておく」，还原为「て」形', replacement: 'て' },
  { suffix: 'てみた', ruleName: '剥离尝试体验过去态', ruleDesc: '去除「てみた」，还原为「て」形', replacement: 'て' },
  { suffix: 'てみる', ruleName: '剥离尝试体验态', ruleDesc: '去除「てみる」，还原为「て」形', replacement: 'て' },

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

    // Check C: Is it a compound 〜する? (e.g. 勉強する, 散歩する, 運動する)
    if (word.endsWith('する') && word.length > 2) {
      registerCandidate({
        dictionaryForm: word,
        reading: word,
        romaji: toRomaji(word),
        meaning: '进行 / 做',
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
    }
  };

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
    // If currentWord is empty or special auxiliary stem
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
            description: `剥离所有辅助助词后，词根确认为第 3 类不规则动词「する」。`,
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
            description: `剥离所有辅助助词后，词根确认为第 3 类不规则动词「来る（くる）」。`,
            currentWord: '来る',
          },
        ],
        matchedVerb: kuruVerb,
      });
    }

    // 3. Try interpreting currentWord as an Ichidan stem (append 'る')
    if (currentWord.length >= 1) {
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

    // 4. Try interpreting currentWord as a Godan stem
    // If last char is a-row (未然), i-row (连用), or e-row (假定/可能), map back to u-row
    if (currentWord.length >= 1) {
      const lastChar = currentWord.slice(-1);
      const stemPrefix = currentWord.slice(0, -1);

      // a-row -> u-row (e.g. 帰ら -> 帰る, 書か -> 書く, 飲ま -> 飲む)
      if (A_TO_U[lastChar]) {
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

      // i-row -> u-row (e.g. 帰り -> 帰る, 書き -> 書く, 飲み -> 飲む)
      if (I_TO_U[lastChar]) {
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
      if (E_TO_U[lastChar]) {
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

    // 5. Special Onbin (音便) Reverse Mapping for て/た forms
    // 行く特例
    if (currentWord === '行っ' || currentWord === 'いっ') {
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

    // イ音便: 〜いて / 〜いた / 〜いで / 〜いだ / 〜い
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

    // 6. Branch into deeper stripping operations using PEELERS
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

    // 4. Shorter transformation steps (more direct) preferred
    return a.transformationSteps.length - b.transformationSteps.length;
  });

  return {
    input,
    candidates,
    primaryCandidate: candidates[0],
  };
}

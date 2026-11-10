import {
  VerbGroup,
  VerbSubgroup,
  VerbConjugations,
  DiagnosticResult,
  DecisionStep,
  VerbItem,
} from '../types/verb';
import { GODAN_TABLE, getKanaVowel, toRomaji } from './kanaUtils';
import { findException } from '../data/exceptions';

/**
 * Generate full conjugations for any verb given its stem, ending, and group
 */
export function generateConjugations(
  kanji: string,
  reading: string,
  group: VerbGroup,
  subgroup: VerbSubgroup,
  isException = false
): VerbConjugations {
  const endingKana = reading.slice(-1);
  const readingStem = reading.slice(0, -1);
  const kanjiStem = kanji.length > 1 && kanji.endsWith(endingKana) ? kanji.slice(0, -1) : kanji.slice(0, -1);

  // Group 3: Irregular (する / 来る)
  if (group === 'irregular') {
    if (kanji === '来る' || reading === 'くる') {
      return {
        dictionary: { form: '来る', kana: 'くる', romaji: 'kuru', suffix: 'る', stem: 'く', ruleLabel: '基本形', description: '原形' },
        masu: { form: '来ます', kana: 'きます', romaji: 'kimasu', suffix: 'ます', stem: 'き', ruleLabel: '连用形', description: '礼貌体 (敬体)' },
        masen: { form: '来ません', kana: 'きません', romaji: 'kimasen', suffix: 'ません', stem: 'き', ruleLabel: '连用否定', description: '礼貌否定' },
        mashita: { form: '来ました', kana: 'きました', romaji: 'kimashita', suffix: 'ました', stem: 'き', ruleLabel: '连用过去', description: '礼貌过去' },
        nai: { form: '来ない', kana: 'こない', romaji: 'konai', suffix: 'ない', stem: 'こ', ruleLabel: '未然形', description: '简体否定' },
        nakatta: { form: '来なかった', kana: 'こなかった', romaji: 'konakatta', suffix: 'なかった', stem: 'こ', ruleLabel: '未然过去否定', description: '简体过去否定' },
        te: { form: '来て', kana: 'きて', romaji: 'kite', suffix: 'て', stem: 'き', ruleLabel: '连用形+て', description: '连接形 / 句中停顿' },
        ta: { form: '来た', kana: 'きた', romaji: 'kita', suffix: 'た', stem: 'き', ruleLabel: '连用形+た', description: '简体过去' },
        ba: { form: '来れば', kana: 'くれば', romaji: 'kureba', suffix: 'れば', stem: 'く', ruleLabel: '假定形', description: '如果来' },
        potential: { form: '来られる', kana: 'こられる', romaji: 'korareru', suffix: 'られる', stem: 'こ', ruleLabel: '可能形', description: '能够来' },
        volitional: { form: '来よう', kana: 'こよう', romaji: 'koyou', suffix: 'よう', stem: 'こ', ruleLabel: '意向形', description: '来吧 / 想来' },
        imperative: { form: '来い', kana: 'こい', romaji: 'koi', suffix: 'い', stem: 'こ', ruleLabel: '命令形', description: '来！(命令)' },
        passive: { form: '来られる', kana: 'こられる', romaji: 'korareru', suffix: 'られる', stem: 'こ', ruleLabel: '被动态', description: '被来 (受害受身)' },
        causative: { form: '来させる', kana: 'こさせる', romaji: 'kosaseru', suffix: 'させる', stem: 'こ', ruleLabel: '使役态', description: '让...来' },
        causative_passive: { form: '来させられる', kana: 'こさせられる', romaji: 'kosaserareru', suffix: 'させられる', stem: 'こ', ruleLabel: '未然形「こ」+ させられる', description: '使役受身态 (被迫来)' },
      };
    }

    // Compound 〜する or plain する
    const prefix = kanji.endsWith('する') ? kanji.slice(0, -2) : '';
    const prefixKana = reading.endsWith('する') ? reading.slice(0, -2) : '';

    return {
      dictionary: { form: prefix + 'する', kana: prefixKana + 'する', romaji: toRomaji(prefixKana) + 'suru', suffix: 'する', stem: prefix, ruleLabel: '基本形', description: '原形' },
      masu: { form: prefix + 'します', kana: prefixKana + 'します', romaji: toRomaji(prefixKana) + 'shimasu', suffix: 'します', stem: prefix, ruleLabel: '连用形', description: '礼貌体 (敬体)' },
      masen: { form: prefix + 'しません', kana: prefixKana + 'しません', romaji: toRomaji(prefixKana) + 'shimasen', suffix: 'しません', stem: prefix, ruleLabel: '连用否定', description: '礼貌否定' },
      mashita: { form: prefix + 'しました', kana: prefixKana + 'しました', romaji: toRomaji(prefixKana) + 'shimashita', suffix: 'しました', stem: prefix, ruleLabel: '连用过去', description: '礼貌过去' },
      nai: { form: prefix + 'しない', kana: prefixKana + 'しない', romaji: toRomaji(prefixKana) + 'shinai', suffix: 'しない', stem: prefix, ruleLabel: '未然形', description: '简体否定' },
      nakatta: { form: prefix + 'しなかった', kana: prefixKana + 'しなかった', romaji: toRomaji(prefixKana) + 'shinakatta', suffix: 'しなかった', stem: prefix, ruleLabel: '未然过去否定', description: '简体过去否定' },
      te: { form: prefix + 'して', kana: prefixKana + 'して', romaji: toRomaji(prefixKana) + 'shite', suffix: 'して', stem: prefix, ruleLabel: '连用形+て', description: '连接形' },
      ta: { form: prefix + 'した', kana: prefixKana + 'した', romaji: toRomaji(prefixKana) + 'shita', suffix: 'した', stem: prefix, ruleLabel: '连用形+た', description: '简体过去' },
      ba: { form: prefix + 'すれば', kana: prefixKana + 'すれば', romaji: toRomaji(prefixKana) + 'sureba', suffix: 'すれば', stem: prefix, ruleLabel: '假定形', description: '如果做' },
      potential: { form: prefix + 'できる', kana: prefixKana + 'できる', romaji: toRomaji(prefixKana) + 'dekiru', suffix: 'できる', stem: prefix, ruleLabel: '可能形', description: '能够做' },
      volitional: { form: prefix + 'しよう', kana: prefixKana + 'しよう', romaji: toRomaji(prefixKana) + 'shiyou', suffix: 'しよう', stem: prefix, ruleLabel: '意向形', description: '做吧 / 打算做' },
      imperative: { form: prefix + 'しろ', kana: prefixKana + 'しろ', romaji: toRomaji(prefixKana) + 'shiro', suffix: 'しろ', stem: prefix, ruleLabel: '命令形', description: '做！(命令)' },
      passive: { form: prefix + 'される', kana: prefixKana + 'される', romaji: toRomaji(prefixKana) + 'sareru', suffix: 'される', stem: prefix, ruleLabel: '被动态', description: '被做' },
      causative: { form: prefix + 'させる', kana: prefixKana + 'させる', romaji: toRomaji(prefixKana) + 'saseru', suffix: 'させる', stem: prefix, ruleLabel: '使役态', description: '让...做' },
      causative_passive: { form: prefix + 'させられる', kana: prefixKana + 'させられる', romaji: toRomaji(prefixKana) + 'saserareru', suffix: 'させられる', stem: prefix, ruleLabel: '未然形 + させられる', description: '使役受身态 (被迫做)' },
    };
  }

  // Group 2: 一段动词 (る动词 / Vowel-stem)
  if (group === 'ichidan') {
    const kStem = kanjiStem;
    const rStem = readingStem;

    return {
      dictionary: { form: kanji, kana: reading, romaji: toRomaji(reading), suffix: 'る', stem: kStem, ruleLabel: '词干 + る', description: '原形 (辞书形)' },
      masu: { form: kStem + 'ます', kana: rStem + 'ます', romaji: toRomaji(rStem) + 'masu', suffix: 'ます', stem: kStem, ruleLabel: '直接切掉「る」+ ます', description: '礼貌体 (敬体)' },
      masen: { form: kStem + 'ません', kana: rStem + 'ません', romaji: toRomaji(rStem) + 'masen', suffix: 'ません', stem: kStem, ruleLabel: '去「る」+ ません', description: '礼貌否定' },
      mashita: { form: kStem + 'ました', kana: rStem + 'ました', romaji: toRomaji(rStem) + 'mashita', suffix: 'ました', stem: kStem, ruleLabel: '去「る」+ ました', description: '礼貌过去' },
      nai: { form: kStem + 'ない', kana: rStem + 'ない', romaji: toRomaji(rStem) + 'nai', suffix: 'ない', stem: kStem, ruleLabel: '直接切掉「る」+ ない', description: '简体否定' },
      nakatta: { form: kStem + 'なかった', kana: rStem + 'なかった', romaji: toRomaji(rStem) + 'nakatta', suffix: 'なかった', stem: kStem, ruleLabel: '去「る」+ なかった', description: '简体过去否定' },
      te: { form: kStem + 'て', kana: rStem + 'て', romaji: toRomaji(rStem) + 'te', suffix: 'て', stem: kStem, ruleLabel: '直接切掉「る」+ て', description: '连接形 (无音便)' },
      ta: { form: kStem + 'た', kana: rStem + 'た', romaji: toRomaji(rStem) + 'ta', suffix: 'た', stem: kStem, ruleLabel: '直接切掉「る」+ た', description: '简体过去' },
      ba: { form: kStem + 'れば', kana: rStem + 'れば', romaji: toRomaji(rStem) + 'reba', suffix: 'れば', stem: kStem, ruleLabel: '去「る」+ れば', description: '假定形' },
      potential: { form: kStem + 'られる', kana: rStem + 'られる', romaji: toRomaji(rStem) + 'rareru', suffix: 'られる', stem: kStem, ruleLabel: '去「る」+ られる', description: '可能形 (能够)' },
      volitional: { form: kStem + 'よう', kana: rStem + 'よう', romaji: toRomaji(rStem) + 'you', suffix: 'よう', stem: kStem, ruleLabel: '去「る」+ よう', description: '意向形 (想要/提议)' },
      imperative: { form: kStem + 'ろ', kana: rStem + 'ろ', romaji: toRomaji(rStem) + 'ro', suffix: 'ろ', stem: kStem, ruleLabel: '去「る」+ ろ', description: '命令形' },
      passive: { form: kStem + 'られる', kana: rStem + 'られる', romaji: toRomaji(rStem) + 'rareru', suffix: 'られる', stem: kStem, ruleLabel: '去「る」+ られる', description: '被动态' },
      causative: { form: kStem + 'させる', kana: rStem + 'させる', romaji: toRomaji(rStem) + 'saseru', suffix: 'させる', stem: kStem, ruleLabel: '去「る」+ させる', description: '使役态' },
      causative_passive: { form: kStem + 'させられる', kana: rStem + 'させられる', romaji: toRomaji(rStem) + 'saserareru', suffix: 'させられる', stem: kStem, ruleLabel: '去「る」+ させられる', description: '使役受身态 (被迫做)' },
    };
  }

  // Group 1: 五段动词 (う动词 / Consonant-stem)
  const godanRow = GODAN_TABLE[endingKana] || GODAN_TABLE['る'];
  const kStem = kanjiStem;
  const rStem = readingStem;

  // Special case: 行く (iku) -> 行って, 行った (促音便特例)
  let teSuffix = godanRow.te;
  let taSuffix = godanRow.ta;
  let onbinNote = godanRow.onbin;
  if (kanji === '行く' || reading === 'いく') {
    teSuffix = 'って';
    taSuffix = 'った';
    onbinNote = '特殊促音便 (っ)';
  }

  // Causative-passive for Godan:
  // - If ending in 'す' (e.g. 話す): Must use full form 話させられる (since さされる is forbidden)
  // - All other endings (e.g. 書く, 帰る, 飲む, 待つ): Modern standard contracted form (约音短形: 書かされる, 帰らされる)
  const isSuEnding = endingKana === 'す';
  const cpForm = isSuEnding ? kStem + 'させられる' : kStem + godanRow.a + 'される';
  const cpKana = isSuEnding ? rStem + 'させられる' : rStem + godanRow.a + 'される';
  const cpRomaji = isSuEnding ? toRomaji(rStem) + 'saserareru' : toRomaji(rStem + godanRow.a) + 'sareru';
  const cpSuffix = isSuEnding ? 'させられる' : godanRow.a + 'される';
  const cpRuleLabel = isSuEnding
    ? '词尾「す」变あ段「さ」+ せられる（避免「さされる」拗口严格禁止约音）'
    : `五段常用约音：词尾变あ段「${godanRow.a}」+ される（全称亦作「${godanRow.a}せられる」）`;

  return {
    dictionary: { form: kanji, kana: reading, romaji: toRomaji(reading), suffix: endingKana, stem: kStem, ruleLabel: 'う段原形', description: '原形 (辞书形)' },
    masu: { form: kStem + godanRow.i + 'ます', kana: rStem + godanRow.i + 'ます', romaji: toRomaji(rStem + godanRow.i) + 'masu', suffix: godanRow.i + 'ます', stem: kStem, ruleLabel: `词尾「${endingKana}」变い段「${godanRow.i}」+ ます`, description: '礼貌体 (敬体)' },
    masen: { form: kStem + godanRow.i + 'ません', kana: rStem + godanRow.i + 'ません', romaji: toRomaji(rStem + godanRow.i) + 'masen', suffix: godanRow.i + 'ません', stem: kStem, ruleLabel: `词尾变い段「${godanRow.i}」+ ません`, description: '礼貌否定' },
    mashita: { form: kStem + godanRow.i + 'ました', kana: rStem + godanRow.i + 'ました', romaji: toRomaji(rStem + godanRow.i) + 'mashita', suffix: godanRow.i + 'ました', stem: kStem, ruleLabel: `词尾变い段「${godanRow.i}」+ ました`, description: '礼貌过去' },
    nai: { form: kStem + godanRow.a + 'ない', kana: rStem + godanRow.a + 'ない', romaji: toRomaji(rStem + godanRow.a) + 'nai', suffix: godanRow.a + 'ない', stem: kStem, ruleLabel: `词尾「${endingKana}」变あ段「${godanRow.a}」+ ない`, description: '简体否定' },
    nakatta: { form: kStem + godanRow.a + 'なかった', kana: rStem + godanRow.a + 'なかった', romaji: toRomaji(rStem + godanRow.a) + 'nakatta', suffix: godanRow.a + 'なかった', stem: kStem, ruleLabel: `词尾变あ段「${godanRow.a}」+ なかった`, description: '简体过去否定' },
    te: { form: kStem + teSuffix, kana: rStem + teSuffix, romaji: toRomaji(rStem + teSuffix), suffix: teSuffix, stem: kStem, ruleLabel: `${onbinNote} + て`, description: '连接形 (发生音便)' },
    ta: { form: kStem + taSuffix, kana: rStem + taSuffix, romaji: toRomaji(rStem + taSuffix), suffix: taSuffix, stem: kStem, ruleLabel: `${onbinNote} + た`, description: '简体过去' },
    ba: { form: kStem + godanRow.e + 'ば', kana: rStem + godanRow.e + 'ば', romaji: toRomaji(rStem + godanRow.e) + 'ba', suffix: godanRow.e + 'ば', stem: kStem, ruleLabel: `词尾变え段「${godanRow.e}」+ ば`, description: '假定形' },
    potential: { form: kStem + godanRow.e + 'る', kana: rStem + godanRow.e + 'る', romaji: toRomaji(rStem + godanRow.e) + 'ru', suffix: godanRow.e + 'る', stem: kStem, ruleLabel: `词尾变え段「${godanRow.e}」+ る`, description: '可能形 (能够)' },
    volitional: { form: kStem + godanRow.o + 'う', kana: rStem + godanRow.o + 'う', romaji: toRomaji(rStem + godanRow.o) + 'u', suffix: godanRow.o + 'う', stem: kStem, ruleLabel: `词尾变お段「${godanRow.o}」+ う`, description: '意向形 (想要/提议)' },
    imperative: { form: kStem + godanRow.e, kana: rStem + godanRow.e, romaji: toRomaji(rStem + godanRow.e), suffix: godanRow.e, stem: kStem, ruleLabel: `词尾直接跳至え段「${godanRow.e}」`, description: '命令形' },
    passive: { form: kStem + godanRow.a + 'れる', kana: rStem + godanRow.a + 'れる', romaji: toRomaji(rStem + godanRow.a) + 'reru', suffix: godanRow.a + 'れる', stem: kStem, ruleLabel: `词尾变あ段「${godanRow.a}」+ れる`, description: '被动态' },
    causative: { form: kStem + godanRow.a + 'せる', kana: rStem + godanRow.a + 'せる', romaji: toRomaji(rStem + godanRow.a) + 'seru', suffix: godanRow.a + 'せる', stem: kStem, ruleLabel: `词尾变あ段「${godanRow.a}」+ せる`, description: '使役态' },
    causative_passive: { form: cpForm, kana: cpKana, romaji: cpRomaji, suffix: cpSuffix, stem: kStem, ruleLabel: cpRuleLabel, description: '使役受身态 (被迫做)' },
  };
}

/**
 * Diagnostic logic: Follows the exact 3-step decision flow requested
 */
export function diagnoseVerb(
  inputVerb: string,
  matchedKnownVerb?: VerbItem
): DiagnosticResult {
  const cleanInput = inputVerb.trim();
  const known = matchedKnownVerb;

  // Determine kanji and reading
  const kanji = known ? known.kanji : cleanInput;
  const reading = known ? known.reading : cleanInput;
  const romaji = known ? known.romaji : toRomaji(reading);

  const steps: DecisionStep[] = [];

  // Step 1: Check Irregular (Group 3: する / 来る)
  const isSuru = kanji === 'する' || reading === 'する' || kanji.endsWith('する') || reading.endsWith('する');
  const isKuru = kanji === '来る' || reading === 'くる' || reading === '来る';

  if (isSuru || isKuru) {
    steps.push({
      stepNumber: 1,
      title: '第一步：排除第 3 类（不规则动词）',
      description: '检查是否为「する」或「来る（くる）」',
      conditionMet: true,
      explanation: isKuru
        ? '匹配到「来る（くる）」，直接归为第 3 类不规则动词（カ行变格动词）！'
        : '匹配到「する」或其复合词（サ变动词），直接归为第 3 类不规则动词（サ行变格动词）！',
      highlightText: isKuru ? '来る' : 'する',
      resultGroup: 'irregular',
    });

    const conjugations = generateConjugations(kanji, reading, 'irregular', isKuru ? 'kahen' : 'sahen');
    return {
      verb: kanji,
      reading,
      romaji,
      group: 'irregular',
      subgroup: isKuru ? 'kahen' : 'sahen',
      isException: false,
      steps,
      matchedVerb: known,
      stemType: 'irregular',
      phoneticExplanation: '不规则动词的词干本身发音会发生特殊音变（如 くる -> きます -> こない；する -> します -> しない），不遵循常规辅音/元音规则。',
      conjugations,
    };
  }

  steps.push({
    stepNumber: 1,
    title: '第一步：排除第 3 类（不规则动词）',
    description: '检查是否为「する」或「来る（くる）」',
    conditionMet: false,
    explanation: `词尾既不是「する」，也不是「来る」，排除第 3 类不规则动词，进入第二步。`,
    highlightText: '非 する / 来る',
  });

  // Step 2: Check last kana: is it 'る'?
  const endingKana = reading.slice(-1);
  const readingStem = reading.slice(0, -1);
  const endsInRu = endingKana === 'る';

  if (!endsInRu) {
    steps.push({
      stepNumber: 2,
      title: '第二步：检查词尾是不是「る」',
      description: '观察词尾假名是否为「る」',
      conditionMet: true,
      explanation: `词尾是「${endingKana}」（非「る」），必定落在 う/く/ぐ/す/つ/ぬ/ぶ/む 上！100% 为【う动词（五段动词）】！`,
      highlightText: `词尾「${endingKana}」≠「る」`,
      resultGroup: 'godan',
    });

    const conjugations = generateConjugations(kanji, reading, 'godan', 'godan');
    return {
      verb: kanji,
      reading,
      romaji,
      group: 'godan',
      subgroup: 'godan',
      isException: false,
      steps,
      matchedVerb: known,
      stemType: 'consonant-stem',
      phoneticExplanation: `词尾是「${endingKana}」，属于辅音词干（Consonant-stem）。词尾必须在あ・い・う・え・お五段上跳跃变换元音（例如：${conjugations.nai.kana}、${conjugations.masu.kana}），以避免辅音直接碰撞！`,
      conjugations,
    };
  }

  steps.push({
    stepNumber: 2,
    title: '第二步：检查词尾是不是「る」',
    description: '观察词尾假名是否为「る」',
    conditionMet: false,
    explanation: '词尾正是「る」！需要查看倒数第二个假名的发音元音，并排除高频例外，进入第三步。',
    highlightText: '词尾是「る」',
  });

  // Step 3: Ends in 'る' -> Check preceding kana vowel
  // Extract the kana right before 'る'
  const secondLastKana = reading.length >= 2 ? reading.slice(-2, -1) : '';
  const vowel = getKanaVowel(secondLastKana);

  // Check known exception list first!
  const exceptionMatch = findException(kanji) || findException(reading);

  if (exceptionMatch) {
    steps.push({
      stepNumber: 3,
      title: '第三步：分析「る」前音与例外排查',
      description: '检查是否为伪装成一段的特殊五段动词',
      conditionMet: true,
      explanation: `【高频陷阱触发！】「${kanji}」虽然以「${secondLastKana}（${exceptionMatch.endingVowel}段音）+ る」结尾，外表极似一段动词，但它在语法上是正宗的【う动词（五段动词）】！其ます形为『${exceptionMatch.masuProof}』而非『${exceptionMatch.wrongMasu}』！`,
      highlightText: `特殊五段动词 (${exceptionMatch.masuProof})`,
      resultGroup: 'godan',
    });

    const conjugations = generateConjugations(kanji, reading, 'godan', 'godan', true);
    return {
      verb: kanji,
      reading,
      romaji,
      group: 'godan',
      subgroup: 'godan',
      isException: true,
      steps,
      matchedVerb: known,
      stemType: 'consonant-stem',
      phoneticExplanation: `历史音韵残留：该词在古日语中原本就属于四段活用（现代五段）。词根末尾是辅音 r-，所以它的变形依旧保留了五段变化，如「${readingStem}ら・り・る・れ・ろ」！`,
      conjugations,
    };
  }

  if (vowel === 'a' || vowel === 'u' || vowel === 'o') {
    steps.push({
      stepNumber: 3,
      title: '第三步：分析「る」前音段位',
      description: '判断倒数第二个假名属于哪一段',
      conditionMet: true,
      explanation: `「る」前面的假名是「${secondLastKana}」，发音落在【${vowel.toUpperCase()}段】（a / u / o 段）。按照发音规则，100% 为【う动词（五段动词）】！`,
      highlightText: `${secondLastKana} (${vowel.toUpperCase()}段) + る`,
      resultGroup: 'godan',
    });

    const conjugations = generateConjugations(kanji, reading, 'godan', 'godan');
    return {
      verb: kanji,
      reading,
      romaji,
      group: 'godan',
      subgroup: 'godan',
      isException: false,
      steps,
      matchedVerb: known,
      stemType: 'consonant-stem',
      phoneticExplanation: `「${secondLastKana}」是 ${vowel.toUpperCase()} 段音。结尾的「る」发音为辅音 r + u，五段变形时在ら行五段轮转（${readingStem}ら・り・る・れ・ろ）。`,
      conjugations,
    };
  }

  // Preceding vowel is 'i' or 'e' (and not in exception)
  const isKami = vowel === 'i';
  const subgroup: VerbSubgroup = isKami ? 'kami-ichidan' : 'shimo-ichidan';

  steps.push({
    stepNumber: 3,
    title: '第三步：分析「る」前音段位',
    description: '判断倒数第二个假名属于哪一段',
    conditionMet: true,
    explanation: `「る」前面的假名是「${secondLastKana}」，落在【${vowel ? vowel.toUpperCase() : 'I/E'}段】（${isKami ? '上一段 -i' : '下一段 -e'}），且未在特殊例外表中。确认为【る动词（一段动词）】！`,
    highlightText: `${secondLastKana} (${vowel ? vowel.toUpperCase() : 'i/e'}段) + る`,
    resultGroup: 'ichidan',
  });

  const conjugations = generateConjugations(kanji, reading, 'ichidan', subgroup);
  return {
    verb: kanji,
    reading,
    romaji,
    group: 'ichidan',
    subgroup,
    isException: false,
    steps,
    matchedVerb: known,
    stemType: 'vowel-stem',
    phoneticExplanation: `该词属于元音词干（Vowel-stem verbs），词干结尾就是纯净元音（${vowel}）。因此变形如同拆装积木：只需切掉词尾的「る」，直接换上「ます」、「ない」、「て」等语法后缀即可！`,
    conjugations,
  };
}

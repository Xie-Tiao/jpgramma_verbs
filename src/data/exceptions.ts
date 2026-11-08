/**
 * Curated list of Japanese verbs that end in -iru or -eru but are actually GODAN (う动词/五段动词)
 * These are the classic "Trap" verbs (特殊五段动词 / 例外五段)
 */

export interface VerbExceptionDetail {
  kanji: string;
  reading: string;
  romaji: string;
  meaning: string;
  meaningEn: string;
  jlpt: 'N5' | 'N4' | 'N3' | 'N2';
  endingVowel: 'i' | 'e';
  whyTrap: string;
  masuProof: string;
  wrongMasu: string;
  mnemonic: string;
  confusedPair?: {
    counterpartKanji: string;
    counterpartReading: string;
    counterpartMeaning: string;
    counterpartGroup: '一段动词 (る动词)' | '五段动词 (う动词)';
    counterpartMasu: string;
    tip: string;
  };
  sampleSentence: {
    jp: string;
    reading: string;
    zh: string;
  };
}

export const VERB_EXCEPTIONS: VerbExceptionDetail[] = [
  {
    kanji: '帰る',
    reading: 'かえる',
    romaji: 'kaeru',
    meaning: '回去 / 回家',
    meaningEn: 'return / go home',
    jlpt: 'N5',
    endingVowel: 'e',
    whyTrap: '虽然以「え段音 + る」结尾（ka-e-ru），极易被误认为下一段（る动词），但它是正宗的五段动词！',
    masuProof: '帰ります（kaerimasu）',
    wrongMasu: '帰ます（kaemasu ❌）',
    mnemonic: '回家就要“利（り）索”地回去 —— 帰ります！',
    confusedPair: {
      counterpartKanji: '変える',
      counterpartReading: 'かえる',
      counterpartMeaning: '改变 / 更换',
      counterpartGroup: '一段动词 (る动词)',
      counterpartMasu: '変えます（kaemasu）',
      tip: '帰る（回家）是五段（帰ります），而変える（改变）是一段（変えます）！',
    },
    sampleSentence: {
      jp: 'もう遅いので、そろそろ家に帰ります。',
      reading: 'もうおそいので、そろそろいえにかえります。',
      zh: '时间不早了，我差不多要回家了。',
    },
  },
  {
    kanji: '入る',
    reading: 'はいる',
    romaji: 'hairu',
    meaning: '进入 / 放入',
    meaningEn: 'enter / go into',
    jlpt: 'N5',
    endingVowel: 'i',
    whyTrap: '「い段音 + る」结尾（ha-i-ru），形似上一段动词，但词尾按五段变化。',
    masuProof: '入ります（hairimasu）',
    wrongMasu: '入ます（haimasu ❌）',
    mnemonic: '进门要有礼（り）貌 —— 入ります！',
    confusedPair: {
      counterpartKanji: '入れる',
      counterpartReading: 'いれる',
      counterpartMeaning: '装进 / 放入（他动词）',
      counterpartGroup: '一段动词 (る动词)',
      counterpartMasu: '入れます（iremasu）',
      tip: '入る（はいる）是自动词五段，入れる（いれる）是他动词一段。',
    },
    sampleSentence: {
      jp: 'どうぞ、部屋に入ってください。',
      reading: 'どうぞ、へやにはいってください。',
      zh: '请进房间来。',
    },
  },
  {
    kanji: '走る',
    reading: 'はしる',
    romaji: 'hashiru',
    meaning: '跑 / 奔跑',
    meaningEn: 'run',
    jlpt: 'N5',
    endingVowel: 'i',
    whyTrap: '以「し（i段音）+ る」结尾，看起来像上一段动词，实际按五段词尾变「り」。',
    masuProof: '走ります（hashirimasu）',
    wrongMasu: '走ます（hashimasu ❌）',
    mnemonic: '跑步要迈开两只手两只脚，跑出“り（ri）”律动！',
    sampleSentence: {
      jp: '毎朝、公園を走っています。',
      reading: 'まいあさ、こうえんをはしっています。',
      zh: '我每天早上都在公园跑步。',
    },
  },
  {
    kanji: '知る',
    reading: 'しる',
    romaji: 'shiru',
    meaning: '知道 / 了解',
    meaningEn: 'know / find out',
    jlpt: 'N5',
    endingVowel: 'i',
    whyTrap: '「し（i段）+ る」结尾。否定是「知らない」，如果是る动词就会变成「知ない❌」。',
    masuProof: '知ります（shirimasu）/ 知らない（shiranai）',
    wrongMasu: '知ます（shimasu ❌ 会与“做”撞车）',
    mnemonic: '知道不知道，看否定是不是“知らない”！',
    sampleSentence: {
      jp: 'そのニュースをまだ知りませんでした。',
      reading: 'そのニュースをまだしりませんでした。',
      zh: '我当时还不知道那个新闻。',
    },
  },
  {
    kanji: '切る',
    reading: 'きる',
    romaji: 'kiru',
    meaning: '切 / 剪 / 斩断',
    meaningEn: 'cut',
    jlpt: 'N5',
    endingVowel: 'i',
    whyTrap: '和“穿衣”的「着る」同音同字尾，但分类完全相反！切る是五段动词。',
    masuProof: '切ります（kirimasu）',
    wrongMasu: '切ます（kimasu ❌ 这成了着ます）',
    mnemonic: '剪纸切菜要分清“切利落（切ります）”！',
    confusedPair: {
      counterpartKanji: '着る',
      counterpartReading: 'きる',
      counterpartMeaning: '穿（衣服）',
      counterpartGroup: '一段动词 (る动词)',
      counterpartMasu: '着ます（kimasu）',
      tip: '切る（剪切）是五段（切ります/切った）；着る（穿衣）是一段（着ます/着た）！',
    },
    sampleSentence: {
      jp: '包丁で野菜を切ります。',
      reading: 'ほうちょうでやさいをきります。',
      zh: '用菜刀切蔬菜。',
    },
  },
  {
    kanji: '要る',
    reading: 'いる',
    romaji: 'iru',
    meaning: '需要 / 要',
    meaningEn: 'need / be required',
    jlpt: 'N5',
    endingVowel: 'i',
    whyTrap: '与表示“存在（在/有）”的「居る（いる）」发音完全一致，极易混淆。',
    masuProof: '要ります（irimasu）',
    wrongMasu: '要ます（imasu ❌ 变成了“居ます”）',
    mnemonic: '“需要”就要“用力（り）去争”，要ります！',
    confusedPair: {
      counterpartKanji: '居る',
      counterpartReading: 'いる',
      counterpartMeaning: '在 / 存在（人或动物）',
      counterpartGroup: '一段动词 (る动词)',
      counterpartMasu: '居ます（imasu）',
      tip: '要る（需要）是五段：要ります；居る（有人在）是一段：います。',
    },
    sampleSentence: {
      jp: 'ビザの申請にはパスポートが要ります。',
      reading: 'ビザのしんせいにはパスポートがいります。',
      zh: '申请签证需要护照。',
    },
  },
  {
    kanji: '喋る',
    reading: 'しゃべる',
    romaji: 'shaberu',
    meaning: '聊天 / 说话',
    meaningEn: 'chat / talk',
    jlpt: 'N4',
    endingVowel: 'e',
    whyTrap: '以「べ（e段）+ る」结尾，看起来像下一段动词，实际活用为五段。',
    masuProof: '喋ります（shaberimasu）',
    wrongMasu: '喋ます（shabemasu ❌）',
    mnemonic: '聊得热络（り）—— 喋ります！',
    sampleSentence: {
      jp: '友達と夜遅くまで楽しく喋りました。',
      reading: 'ともだちとよるおそくまでたのしくしゃべりました。',
      zh: '和朋友一直开心地聊到深夜。',
    },
  },
  {
    kanji: '減る',
    reading: 'へる',
    romaji: 'heru',
    meaning: '减少 / 变少',
    meaningEn: 'decrease / lessen',
    jlpt: 'N4',
    endingVowel: 'e',
    whyTrap: '单个汉字加上「る」，前音为「へ（e段）」，按五段动词变化。',
    masuProof: '減ります（herimasu）',
    wrongMasu: '減ます（hemasu ❌）',
    mnemonic: '体重减少了，整个人精神利（り）落了！',
    sampleSentence: {
      jp: '最近、お腹が空いて体重が減りました。',
      reading: 'さいきん、おなかがすいてたいじゅうがへりました。',
      zh: '最近总是饿，体重减少了。',
    },
  },
  {
    kanji: '蹴る',
    reading: 'ける',
    romaji: 'keru',
    meaning: '踢',
    meaningEn: 'kick',
    jlpt: 'N3',
    endingVowel: 'e',
    whyTrap: '日语中极少数单音节 e 段假名后跟「る」的五段动词。',
    masuProof: '蹴ります（kerimasu）',
    wrongMasu: '蹴ます（kemasu ❌）',
    mnemonic: '踢球踢得给力（り）—— 蹴ります！',
    sampleSentence: {
      jp: 'ボールを力強く蹴りました。',
      reading: 'ボールをちからづよくけりました。',
      zh: '用力踢了球。',
    },
  },
  {
    kanji: '滑る',
    reading: 'すべる',
    romaji: 'suberu',
    meaning: '滑 / 滑倒 / 考试失利',
    meaningEn: 'slip / slide',
    jlpt: 'N4',
    endingVowel: 'e',
    whyTrap: '「べ（e段）+ る」结尾，为五段动词。',
    masuProof: '滑ります（suberimasu）',
    wrongMasu: '滑ます（subemasu ❌）',
    mnemonic: '滑雪滑冰十分利（り）索！',
    sampleSentence: {
      jp: '冬の道は凍っていて滑りやすいです。',
      reading: 'ふゆのみちはこおっていてすべりやすいです。',
      zh: '冬天的路面结冰了，很容易滑倒。',
    },
  },
  {
    kanji: '限る',
    reading: 'かぎる',
    romaji: 'kagiru',
    meaning: '限定 / 限于 / 最好',
    meaningEn: 'limit / restrict',
    jlpt: 'N3',
    endingVowel: 'i',
    whyTrap: '「ぎ（i段）+ る」结尾，常用于文法「～に限る」，为五段动词。',
    masuProof: '限ります（kagirimasu）',
    wrongMasu: '限ます（kagimasu ❌）',
    mnemonic: '夏天限定（限ります）吃西瓜！',
    sampleSentence: {
      jp: '暑い夏は冷たいビールに限りますね。',
      reading: 'あついなつはつめたいビールにかぎりますね。',
      zh: '炎热的夏天最棒的就是冰镇啤酒了。',
    },
  },
  {
    kanji: '焦る',
    reading: 'あせる',
    romaji: 'aseru',
    meaning: '焦虑 / 着急 / 慌张',
    meaningEn: 'hurry / panic',
    jlpt: 'N3',
    endingVowel: 'e',
    whyTrap: '「せ（e段）+ る」结尾，五段动词。',
    masuProof: '焦ります（aserimasu）',
    wrongMasu: '焦ます（asemasu ❌）',
    mnemonic: '着急慌张更要稳住心力（り）！',
    sampleSentence: {
      jp: '試験時間が足りなくなって、とても焦りました。',
      reading: 'しけんじかんがたりなくなって、とてもあせりました。',
      zh: '考试时间不够了，感到非常焦虑。',
    },
  },
  {
    kanji: '握る',
    reading: 'にぎる',
    romaji: 'nigiru',
    meaning: '握 / 握住 / 捏(饭团)',
    meaningEn: 'grip / mold (sushi/onigiri)',
    jlpt: 'N3',
    endingVowel: 'i',
    whyTrap: '「ぎ（i段）+ る」结尾，但捏饭团（お握り）的り正来源于它的ます形！',
    masuProof: '握ります（nigirimasu）',
    wrongMasu: '握ます（nigimasu ❌）',
    mnemonic: '“おにぎり（饭团）”名字就是从“握り”来的，证明它是五段！',
    sampleSentence: {
      jp: '母がおいしいおにぎりを握ってくれました。',
      reading: 'ははがおいしいおにぎりをにぎってくれました。',
      zh: '母亲为我捏了美味的饭团。',
    },
  },
  {
    kanji: '湿る',
    reading: 'しめる',
    romaji: 'shimeru',
    meaning: '潮湿 / 湿润',
    meaningEn: 'become damp / moist',
    jlpt: 'N3',
    endingVowel: 'e',
    whyTrap: '发音为「しめる」，极易与一段动词「閉める（关门）」、「締める（系领带）」混淆！',
    masuProof: '湿ります（shimerimasu）',
    wrongMasu: '湿ます（shimemasu ❌ 变成了“閉めます”）',
    mnemonic: '下雨受潮湿润了（湿ります），五段词尾显身手！',
    confusedPair: {
      counterpartKanji: '閉める',
      counterpartReading: 'しめる',
      counterpartMeaning: '关上 / 关闭',
      counterpartGroup: '一段动词 (る动词)',
      counterpartMasu: '閉めます（shimemasu）',
      tip: '湿る（潮湿）是五段（湿ります）；閉める（关闭）是一段（閉めます）！',
    },
    sampleSentence: {
      jp: '雨で服が湿ってしまいました。',
      reading: 'あめでふくがしめってしまいました。',
      zh: '因为下雨衣服受潮了。',
    },
  },
  {
    kanji: '照る',
    reading: 'てる',
    romaji: 'teru',
    meaning: '照耀 / 放晴',
    meaningEn: 'shine',
    jlpt: 'N3',
    endingVowel: 'e',
    whyTrap: '「て（e段）+ る」结尾，为五段动词。',
    masuProof: '照ります（terimasu）',
    wrongMasu: '照ます（temasu ❌）',
    mnemonic: '晴天阳光普照（照ります）！',
    sampleSentence: {
      jp: '太陽が明るく照っています。',
      reading: 'たいようがあかるくてっています。',
      zh: '太阳明亮地照耀着。',
    },
  },
  {
    kanji: '散る',
    reading: 'ちる',
    romaji: 'chiru',
    meaning: '散落 / 凋谢',
    meaningEn: 'scatter / fall (leaves/petals)',
    jlpt: 'N3',
    endingVowel: 'i',
    whyTrap: '「ち（i段）+ る」结尾，为五段动词。',
    masuProof: '散ります（chirimasu）',
    wrongMasu: '散ます（chimasu ❌）',
    mnemonic: '樱花凋零飘落（散ります）促音便散った！',
    sampleSentence: {
      jp: '春風が吹いて、桜の花が散り始めました。',
      reading: 'はるかぜがふいて、さくらのはながちはじめました。',
      zh: '春风吹拂，樱花开始凋落了。',
    },
  },
];

/**
 * Quick Set for instant lookup
 */
export const EXCEPTION_VERB_SET = new Set(VERB_EXCEPTIONS.map(e => e.kanji).concat(VERB_EXCEPTIONS.map(e => e.reading)));

/**
 * Check if a word or reading is in the known exception set
 */
export function findException(query: string): VerbExceptionDetail | undefined {
  const clean = query.trim();
  return VERB_EXCEPTIONS.find(e => e.kanji === clean || e.reading === clean);
}

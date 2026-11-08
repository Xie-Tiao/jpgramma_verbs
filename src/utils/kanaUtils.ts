/**
 * Utility functions for Japanese kana, romaji, phonetic analysis, and audio synthesis
 */

// Japanese Kana to Vowel mapping
export const KANA_VOWEL_MAP: Record<string, 'a' | 'i' | 'u' | 'e' | 'o'> = {
  // a 段
  あ: 'a', か: 'a', が: 'a', さ: 'a', ざ: 'a', た: 'a', だ: 'a', な: 'a', は: 'a', ば: 'a', ぱ: 'a', ま: 'a', や: 'a', ら: 'a', わ: 'a',
  // i 段
  い: 'i', き: 'i', ぎ: 'i', し: 'i', じ: 'i', ち: 'i', ぢ: 'i', に: 'i', ひ: 'i', び: 'i', ぴ: 'i', み: 'i', り: 'i',
  // u 段
  う: 'u', く: 'u', ぐ: 'u', す: 'u', ず: 'u', つ: 'u', づ: 'u', ぬ: 'u', ふ: 'u', ぶ: 'u', ぷ: 'u', む: 'u', ゆ: 'u', る: 'u',
  // e 段
  え: 'e', け: 'e', げ: 'e', せ: 'e', ぜ: 'e', て: 'e', で: 'e', ね: 'e', へ: 'e', べ: 'e', ぺ: 'e', め: 'e', れ: 'e',
  // o 段
  お: 'o', こ: 'o', ご: 'o', そ: 'o', ぞ: 'o', と: 'o', ど: 'o', の: 'o', ほ: 'o', ぼ: 'o', ぽ: 'o', も: 'o', よ: 'o', ろ: 'o', を: 'o',
};

// Kana to Romaji dictionary (essential)
export const KANA_TO_ROMAJI: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  っ: '',
};

// 五段动词 9种词尾变化表
export const GODAN_TABLE: Record<string, { a: string; i: string; u: string; e: string; o: string; te: string; ta: string; onbin: string }> = {
  う: { a: 'わ', i: 'い', u: 'う', e: 'え', o: 'お', te: 'って', ta: 'った', onbin: '促音便 (っ)' },
  く: { a: 'か', i: 'き', u: 'く', e: 'け', o: 'こ', te: 'いて', ta: 'いた', onbin: 'イ音便 (い)' },
  ぐ: { a: 'が', i: 'ぎ', u: 'ぐ', e: 'げ', o: 'ご', te: 'いで', ta: 'いだ', onbin: 'イ音便 (い/浊化)' },
  す: { a: 'さ', i: 'し', u: 'す', e: 'せ', o: 'そ', te: 'して', ta: 'した', onbin: '无音便 (し)' },
  つ: { a: 'た', i: 'ち', u: 'つ', e: 'て', o: 'と', te: 'って', ta: 'った', onbin: '促音便 (っ)' },
  ぬ: { a: 'な', i: 'に', u: 'ぬ', e: 'ね', o: 'の', te: 'んで', ta: 'んだ', onbin: '拨音便 (ん/浊化)' },
  ぶ: { a: 'ば', i: 'び', u: 'ぶ', e: 'べ', o: 'ぼ', te: 'んで', ta: 'んだ', onbin: '拨音便 (ん/浊化)' },
  む: { a: 'ま', i: 'み', u: 'む', e: 'め', o: 'も', te: 'んで', ta: 'んだ', onbin: '拨音便 (ん/浊化)' },
  る: { a: 'ら', i: 'り', u: 'る', e: 'れ', o: 'ろ', te: 'って', ta: 'った', onbin: '促音便 (っ)' },
};

/**
 * Get vowel of a single kana character
 */
export function getKanaVowel(kana: string): 'a' | 'i' | 'u' | 'e' | 'o' | null {
  return KANA_VOWEL_MAP[kana] || null;
}

/**
 * Convert Hiragana string to Romaji
 */
export function toRomaji(kana: string): string {
  let result = '';
  for (let i = 0; i < kana.length; i++) {
    const char = kana[i];
    // Special case for double consonant っ
    if (char === 'っ') {
      const nextChar = kana[i + 1];
      if (nextChar && KANA_TO_ROMAJI[nextChar]) {
        const nextRomaji = KANA_TO_ROMAJI[nextChar];
        result += nextRomaji[0];
      }
      continue;
    }
    result += KANA_TO_ROMAJI[char] || char;
  }
  return result;
}

/**
 * Play Japanese text using browser Web Speech API
 */
export function speakJapanese(text: string, rate = 0.9) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;

    // Pick a natural Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.includes('JP'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech error:', err);
  }
}

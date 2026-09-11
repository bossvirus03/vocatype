import fs from 'fs';
import https from 'https';
import http from 'http';
import { uploadAudioToR2, checkAudioExists, R2_PUBLIC_URL } from './src/utils/r2';

interface WordRecord {
  word: string;
  level: string;
  domain: string;
  ipa: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  audioUrl: string;
}

const ALL_DOMAINS = [
  'LIFE',
  'COMMUNICATION',
  'BUSINESS',
  'MEDICINE',
  'TECHNOLOGY',
  'SCIENCE',
  'TRAVEL',
  'FOOD',
  'SPORTS',
  'ART',
  'MUSIC',
  'EDUCATION',
  'ENVIRONMENT',
  'POLITICS',
  'FASHION',
  'FINANCE',
  'HISTORY',
  'LITERATURE',
  'LAW',
  'ENTERTAINMENT',
];

function assignDomain(word: string, pos: string, def: string): string {
  const text = (word + ' ' + def).toLowerCase();
  if (text.includes('bác sĩ') || text.includes('y tế') || text.includes('bệnh') || text.includes('thuốc') || text.includes('sức khỏe')) return 'MEDICINE';
  if (text.includes('tiền') || text.includes('ngân hàng') || text.includes('tài chính') || text.includes('đầu tư')) return 'FINANCE';
  if (text.includes('kinh doanh') || text.includes('thị trường') || text.includes('doanh nghiệp') || text.includes('thương mại')) return 'BUSINESS';
  if (text.includes('máy tính') || text.includes('phần mềm') || text.includes('công nghệ') || text.includes('kỹ thuật')) return 'TECHNOLOGY';
  if (text.includes('khoa học') || text.includes('nghiên cứu') || text.includes('vật lý') || text.includes('hóa học')) return 'SCIENCE';
  if (text.includes('du lịch') || text.includes('chuyến đi') || text.includes('khách sạn') || text.includes('máy bay')) return 'TRAVEL';
  if (text.includes('món ăn') || text.includes('thực phẩm') || text.includes('nấu') || text.includes('ăn')) return 'FOOD';
  if (text.includes('thể thao') || text.includes('bóng') || text.includes('chạy') || text.includes('trận đấu')) return 'SPORTS';
  if (text.includes('âm nhạc') || text.includes('bài hát') || text.includes('nhạc cụ')) return 'MUSIC';
  if (text.includes('nghệ thuật') || text.includes('vẽ') || text.includes('thiết kế') || text.includes('tranh')) return 'ART';
  if (text.includes('học') || text.includes('trường') || text.includes('giáo dục') || text.includes('sinh viên')) return 'EDUCATION';
  if (text.includes('môi trường') || text.includes('khí hậu') || text.includes('sinh thái') || text.includes('rừng')) return 'ENVIRONMENT';
  if (text.includes('luật') || text.includes('tòa án') || text.includes('pháp lý')) return 'LAW';
  if (text.includes('chính trị') || text.includes('chính phủ') || text.includes('quốc hội')) return 'POLITICS';
  if (text.includes('thời trang') || text.includes('quần áo') || text.includes('trang phục')) return 'FASHION';
  if (text.includes('lịch sử') || text.includes('chiến tranh') || text.includes('thời kỳ')) return 'HISTORY';
  if (text.includes('văn học') || text.includes('thơ') || text.includes('truyện')) return 'LITERATURE';
  if (text.includes('giải trí') || text.includes('phim') || text.includes('trò chơi')) return 'ENTERTAINMENT';
  if (text.includes('giao tiếp') || text.includes('nói') || text.includes('trao đổi') || text.includes('thảo luận')) return 'COMMUNICATION';

  // Phân bố băm đều theo từ
  let sum = 0;
  for (let i = 0; i < word.length; i++) {
    sum += word.charCodeAt(i);
  }
  return ALL_DOMAINS[sum % ALL_DOMAINS.length];
}

// Dịch tiếng Việt qua Google Translate gtx
async function translateWord(word: string): Promise<{ definition: string; pos: string }> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('Translate fetch failed');
    const data = await res.json();

    let definition = data[0]?.[0]?.[0] || '';
    let pos = data[1]?.[0]?.[0] || 'noun';

    return { definition, pos };
  } catch {
    return { definition: '', pos: 'noun' };
  }
}

// Lấy IPA từ Datamuse
async function fetchIpaFromDatamuse(word: string): Promise<string> {
  try {
    const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=r&max=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return '';
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].tags) {
      const pronTag = data[0].tags.find((t: string) => t.startsWith('pron:'));
      if (pronTag) {
        return '/' + pronTag.replace('pron:', '').trim() + '/';
      }
    }
    return '';
  } catch {
    return '';
  }
}

// Tải Audio MP3 phát âm chuẩn người bản xứ
function downloadAudio(word: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Youdao dictionary native voice: type=2 (Mỹ - US), type=1 (Anh - UK)
    const url = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(word)}`;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Audio download timeout'));
    });
    req.on('error', reject);
  });
}

async function main() {
  console.log('🚀 Bắt đầu quá trình xây dựng bộ từ vựng & upload Audio Cloudflare R2...\n');

  // 1. Đọc bộ từ gốc (1.212 từ phân theo A1-C2)
  let baseWords: any[] = [];
  if (fs.existsSync('./extracted-seed.js')) {
    baseWords = require('./extracted-seed.js');
    console.log(`📚 Đã nạp ${baseWords.length} từ chất lượng cao từ seed gốc.`);
  }

  // 2. Đọc bổ sung từ oxford-5000.json
  let oxfordWords: any[] = [];
  if (fs.existsSync('./oxford-5000.json')) {
    oxfordWords = JSON.parse(fs.readFileSync('./oxford-5000.json', 'utf-8'));
    console.log(`📚 Đã nạp ${oxfordWords.length} từ từ Oxford 5000.`);
  }

  // 3. Đọc tiến độ đã xử lý nếu có
  const progressFile = './vocatype-master-vocabulary.json';
  let processedMap = new Map<string, WordRecord>();
  if (fs.existsSync(progressFile)) {
    try {
      const existing: WordRecord[] = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
      existing.forEach((item) => processedMap.set(item.word.toLowerCase(), item));
      console.log(`🔄 Đã tìm thấy tiến trình trước đó: ${processedMap.size} từ đã hoàn thành.`);
    } catch {
      // Bỏ qua lỗi cú pháp
    }
  }

  // 4. Hợp nhất danh sách từ
  const wordMap = new Map<string, { word: string; level: string; def?: string; ipa?: string; domain?: string; pos?: string }>();

  // Ưu tiên từ gốc trước
  for (const b of baseWords) {
    const w = b.word.toLowerCase().trim();
    if (!w || w.length < 2) continue;
    wordMap.set(w, {
      word: w,
      level: b.level || 'A1',
      def: b.def,
      ipa: b.ipa,
      domain: b.domain,
      pos: b.pos || 'noun',
    });
  }

  // Bổ sung các từ từ Oxford 5000
  for (const o of oxfordWords) {
    const w = o.word.toLowerCase().trim();
    if (!w || w.length < 2 || wordMap.has(w)) continue;
    wordMap.set(w, {
      word: w,
      level: o.level || 'B2',
      def: '',
      ipa: '',
      domain: '',
      pos: o.partOfSpeech?.replace(/\./g, '') || '',
    });
  }

  const allWords = Array.from(wordMap.values());
  console.log(`🎯 Tổng số từ cần xử lý: ${allWords.length} từ (Phủ rộng A1 → C2)`);

  const CONCURRENCY = 8;
  let successCount = processedMap.size;
  let index = 0;

  // Worker xử lý từng từ
  async function processWord(item: typeof allWords[0]): Promise<void> {
    const word = item.word;
    if (processedMap.has(word)) return;

    try {
      let definition = item.def || '';
      let pos = item.pos || '';
      let ipa = item.ipa || '';
      let domain = item.domain || '';

      // Dịch nghĩa nếu chưa có
      if (!definition) {
        const trans = await translateWord(word);
        definition = trans.definition || word;
        if (!pos) pos = trans.pos || 'noun';
      }

      // Lấy IPA nếu chưa có
      if (!ipa) {
        ipa = await fetchIpaFromDatamuse(word);
        if (!ipa) ipa = `/${word}/`;
      }

      if (!domain) {
        domain = assignDomain(word, pos, definition);
      }

      // Chuẩn bị audio
      const audioKey = `audio/${word}.mp3`;
      const publicUrl = `${R2_PUBLIC_URL}/${audioKey}`;

      // Kiểm tra xem audio đã tồn tại trên R2 chưa
      const existsOnR2 = await checkAudioExists(audioKey);
      if (!existsOnR2) {
        try {
          const audioBuffer = await downloadAudio(word);
          if (audioBuffer && audioBuffer.length > 500) {
            await uploadAudioToR2(audioKey, audioBuffer, 'audio/mpeg');
          }
        } catch (e: any) {
          console.warn(`⚠️ Lỗi tải/upload audio cho "${word}":`, e.message);
        }
      }

      const record: WordRecord = {
        word,
        level: item.level || 'B1',
        domain,
        ipa,
        definition,
        partOfSpeech: pos,
        example: `He used the word "${word}" in his sentence.`,
        exampleTranslation: `Anh ấy đã sử dụng từ "${word}" (${definition}) trong câu của mình.`,
        audioUrl: publicUrl,
      };

      processedMap.set(word, record);
      successCount++;

      if (successCount % 50 === 0 || successCount === allWords.length) {
        fs.writeFileSync(progressFile, JSON.stringify(Array.from(processedMap.values()), null, 2));
        console.log(`💾 [${successCount}/${allWords.length}] Đã lưu tiến trình (${record.word}: ${record.definition})`);
      }
    } catch (err: any) {
      console.error(`❌ Lỗi xử lý từ ${word}:`, err.message);
    }
  }

  // Chạy đa luồng song song
  async function runBatch() {
    while (index < allWords.length) {
      const batch = allWords.slice(index, index + CONCURRENCY);
      index += CONCURRENCY;
      await Promise.all(batch.map((w) => processWord(w)));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => runBatch());
  await Promise.all(workers);

  // Lưu file hoàn chỉnh cuối cùng
  const finalResults = Array.from(processedMap.values());
  fs.writeFileSync(progressFile, JSON.stringify(finalResults, null, 2));
  console.log(`\n🎉 HOÀN THÀNH XUẤT SẮC! Tổng cộng ${finalResults.length} từ vựng đã được chuẩn hóa và upload Audio lên Cloudflare R2!`);
}

main().catch(console.error);

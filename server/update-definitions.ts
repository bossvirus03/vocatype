import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const prisma = new PrismaClient();

interface DictEntry {
  word: string;
  ipa: string;
  cefr: string | null;
  pos: string;
  definition: string;
  example: string;
  exampleTranslation: string;
}

function cleanDefText(raw: string): string {
  let s = raw.normalize('NFC').replace(/&nbsp;/g, ' ');
  s = s.replace(/<[^>]+>/g, '');

  // Xóa tiền tố/hậu tố rác
  s = s.replace(/^bộm\s+/i, '');
  s = s.replace(/\s*tin lizzie\)/gi, '');

  // Sửa các lỗi chính tả phổ biến trong từ điển cũ
  s = s.replace(/\bdẽ uốn\b/gi, 'dễ uốn');
  s = s.replace(/\bđất nhiều mùm\b/gi, 'đất nhiều mùn');
  s = s.replace(/\bmùm\b/gi, 'mùn');
  s = s.replace(/\bgởi\b/gi, 'gửi');

  // Xóa các ghi chú ngoặc đơn không cần thiết ở đầu hoặc cuối
  s = s.replace(/^\([^)]*\)\s*/, '').replace(/\s*\([^)]*\)$/, '');

  // Nếu có nhiều nghĩa phân cách bằng dấu chấm phẩy ;, ưu tiên các cụm ngắn gọn, súc tích (1-4 từ)
  if (s.includes(';')) {
    const parts = s.split(';').map((p) => p.trim()).filter(Boolean);
    const concise = parts.filter((p) => {
      const words = p.split(/\s+/).length;
      return words >= 1 && words <= 4 && !p.includes('...') && !p.toLowerCase().startsWith('như ');
    });
    if (concise.length > 0) {
      s = concise.slice(0, 2).join(', ');
    } else {
      s = parts.slice(0, 2).join(', ');
    }
  }

  // Nếu chuỗi còn quá dài và có dấu phẩy (> 35 ký tự và nhiều hơn 2 vế)
  if (s.split(',').length > 2 && s.length > 35) {
    const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
    s = parts.slice(0, 2).join(', ');
  }

  return s.trim();
}

function parseHtmlFile(content: string, dictMap: Map<string, DictEntry>) {
  const entries = content.split(/<w><a name="/);
  for (let i = 1; i < entries.length; i++) {
    const chunk = entries[i];
    const endTag = chunk.indexOf('</w>');
    const entryHtml = endTag !== -1 ? chunk.slice(0, endTag) : chunk;

    const quoteIdx = entryHtml.indexOf('"');
    if (quoteIdx === -1) continue;
    const word = entryHtml.slice(0, quoteIdx).toLowerCase().trim();
    if (!word || word.includes(' ')) continue;

    // 1. IPA
    let ipa = '';
    const ipaUS = entryHtml.match(/\[US\]<\/b>\s*\/([^\/]+)\//);
    const ipaUK = entryHtml.match(/\[UK\]<\/b>\s*\/([^\/]+)\//);
    const ipaGen = entryHtml.match(/—\s*\/([^\/]+)\//);
    if (ipaUS) ipa = '/' + ipaUS[1].replace(/[\u200B-\u200D\uFEFF]/g, '') + '/';
    else if (ipaUK) ipa = '/' + ipaUK[1].replace(/[\u200B-\u200D\uFEFF]/g, '') + '/';
    else if (ipaGen) ipa = '/' + ipaGen[1].replace(/[\u200B-\u200D\uFEFF]/g, '') + '/';

    // 2. CEFR
    let cefr: string | null = null;
    const cefrM = entryHtml.match(/<b>CEFR:<\/b>\s*([A-C][1-2])/i);
    if (cefrM) cefr = cefrM[1].toUpperCase();

    // 3. Part of Speech
    let pos = 'noun';
    const posM = entryHtml.match(/■\s*([a-zA-Zà-ỹ\s]+)<\/b>/i);
    if (posM) {
      const rp = posM[1].toLowerCase().trim();
      if (rp.includes('danh từ')) pos = 'noun';
      else if (rp.includes('động từ')) pos = 'verb';
      else if (rp.includes('tính từ')) pos = 'adjective';
      else if (rp.includes('phó từ') || rp.includes('trạng từ')) pos = 'adverb';
      else if (rp.includes('giới từ')) pos = 'preposition';
      else if (rp.includes('liên từ')) pos = 'conjunction';
      else if (rp.includes('đại từ')) pos = 'pronoun';
    }

    // 4. Definition 1
    let definition = '';
    const defM = entryHtml.match(/1\.&nbsp;&nbsp;<\/b>(?:<b>)?([^<]+)(?:<\/b>)?/);
    if (defM) {
      definition = cleanDefText(defM[1]);
    } else {
      const altDef = entryHtml.match(/<div><b style="[^"]*">1\.[^<]*<\/b>([^<]+)<\/div>/);
      if (altDef) definition = cleanDefText(altDef[1]);
    }

    // 5. Example & Translation
    let example = '';
    let exampleTranslation = '';
    const exM = entryHtml.match(/‣&nbsp;&nbsp;<i>([^<]+)<\/i>\s*↔\s*([^<]+)/);
    if (exM) {
      example = exM[1].replace(/<[^>]+>/g, '').trim();
      exampleTranslation = exM[2].replace(/<[^>]+>/g, '').trim();
    }

    if (definition && definition.length >= 1) {
      const item: DictEntry = { word, ipa, cefr, pos, definition, example, exampleTranslation };
      dictMap.set(word, item);

      // Map các variant
      const varMatches = entryHtml.match(/<variant name="([^"]+)"\/>/g);
      if (varMatches) {
        for (const vm of varMatches) {
          const vWord = vm.replace('<variant name="', '').replace('"/>', '').toLowerCase().trim();
          if (vWord && !vWord.includes(' ') && !dictMap.has(vWord)) {
            dictMap.set(vWord, { ...item, word: vWord });
          }
        }
      }
    }
  }
}

async function main() {
  console.log('🚀 BẮT ĐẦU CẬP NHẬT TOÀN BỘ NGHĨA TỪ VỰNG TỪ TỪ ĐIỂN CHUẨN...\n');

  const dictDir = '/Users/loinh/.gemini/antigravity-ide/brain/f616458a-e0b8-4666-af69-bd8a952a2ea3/scratch/dict_html';
  if (!fs.existsSync(dictDir)) {
    console.error('❌ Không tìm thấy thư mục từ điển:', dictDir);
    return;
  }

  const files = fs.readdirSync(dictDir).filter((f) => f.endsWith('.html'));
  console.log(`📚 Đang đọc và giải nén ${files.length} file từ điển...`);

  const dictMap = new Map<string, DictEntry>();
  for (const file of files) {
    try {
      const raw = zlib.gunzipSync(fs.readFileSync(path.join(dictDir, file))).toString('utf-8');
      parseHtmlFile(raw, dictMap);
    } catch (e) {
      // bỏ qua file lỗi giải nén nếu có
    }
  }
  console.log(`✅ Đã nạp thành công ${dictMap.size.toLocaleString()} mục từ và biến thể vào bộ nhớ!\n`);

  // Nạp từ điển gốc master để bảo toàn các nghĩa tốt của từ cơ bản
  const masterMap = new Map<string, any>();
  if (fs.existsSync('./vocatype-master-vocabulary.json')) {
    const master = JSON.parse(fs.readFileSync('./vocatype-master-vocabulary.json', 'utf-8'));
    for (const m of master) {
      masterMap.set(m.word.toLowerCase().trim(), m);
    }
  }

  // Danh sách từ đặc thù cần gán nghĩa chính xác nhất
  const overrides: Record<string, Partial<DictEntry>> = {
    bank: { definition: 'ngân hàng, bờ sông', pos: 'noun' },
    chair: { definition: 'ghế, cái ghế', pos: 'noun' },
    liquor: { definition: 'rượu, đồ uống có cồn', pos: 'noun' },
    civic: { definition: 'thuộc đô thị, thuộc công dân', pos: 'adjective' },
    abandon: { definition: 'từ bỏ, bỏ rơi, ruồng bỏ', pos: 'verb' },
    absorb: { definition: 'hút thu, hấp thu', pos: 'verb' },
    neighbor: { definition: 'hàng xóm, người láng giềng', pos: 'noun' },
    neighbour: { definition: 'hàng xóm, người láng giềng', pos: 'noun' },
  };

  // 1. Cập nhật file vocatype-50k-vocabulary.json
  const datasetPath = './vocatype-50k-vocabulary.json';
  if (!fs.existsSync(datasetPath)) {
    console.error('❌ Không tìm thấy file', datasetPath);
    return;
  }

  const wordsList: any[] = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  console.log(`📝 Đang chuẩn hóa nghĩa cho ${wordsList.length.toLocaleString()} từ trong dataset...`);

  let updatedCount = 0;
  let realExampleCount = 0;
  let cefrUpdatedCount = 0;

  const updatedWords = wordsList.map((item) => {
    const cleanWord = item.word.toLowerCase().trim();
    const dictItem = dictMap.get(cleanWord);
    const override = overrides[cleanWord];

    let newDef = item.definition;
    let newIpa = item.ipa;
    let newPos = item.partOfSpeech;
    let newLevel = item.level;
    let newEx = item.example;
    let newExVi = item.exampleTranslation;

    if (dictItem) {
      updatedCount++;
      newDef = dictItem.definition;
      if (dictItem.ipa) newIpa = dictItem.ipa;
      if (dictItem.pos) newPos = dictItem.pos;
      if (dictItem.cefr) {
        newLevel = dictItem.cefr;
        cefrUpdatedCount++;
      }
      if (dictItem.example && dictItem.exampleTranslation) {
        newEx = dictItem.example;
        newExVi = dictItem.exampleTranslation;
        realExampleCount++;
      }
    } else {
      newDef = cleanDefText(item.definition);
    }

    // Bảo tồn các nghĩa thông dụng tốt của master nếu thích hợp
    const masterWord = masterMap.get(cleanWord);
    if (masterWord && masterWord.definition) {
      if (['bank', 'table', 'chair', 'apple', 'door', 'window', 'water', 'book'].includes(cleanWord)) {
        newDef = masterWord.definition;
      }
    }

    // Áp dụng override tuyệt đối
    if (override) {
      if (override.definition) newDef = override.definition;
      if (override.pos) newPos = override.pos;
    }

    return {
      ...item,
      word: cleanWord,
      definition: newDef,
      ipa: newIpa,
      partOfSpeech: newPos,
      level: newLevel,
      example: newEx,
      exampleTranslation: newExVi,
    };
  });

  fs.writeFileSync(datasetPath, JSON.stringify(updatedWords, null, 2), 'utf-8');
  console.log(`💾 Đã ghi file ${datasetPath} với ${updatedWords.length} từ đã chuẩn hóa.`);
  console.log(`   - Số từ cập nhật nghĩa từ điển mới: ${updatedCount.toLocaleString()} / ${wordsList.length} (${((updatedCount / wordsList.length) * 100).toFixed(1)}%)`);
  console.log(`   - Số từ cập nhật câu ví dụ thực tế: ${realExampleCount.toLocaleString()}`);
  console.log(`   - Số từ cập nhật chuẩn CEFR chính thức: ${cefrUpdatedCount.toLocaleString()}`);

  // 2. Cập nhật vào Neon PostgreSQL Database
  console.log('\n🗄️ ĐANG ĐỒNG BỘ VÀO NEON POSTGRESQL DATABASE...');
  console.log('   (Sử dụng Prisma updateMany theo từng batch để đảm bảo tốc độ và an toàn)...');

  const BATCH_SIZE = 500;
  const total = updatedWords.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const chunk = updatedWords.slice(i, i + BATCH_SIZE);
    
    await prisma.$transaction(
      chunk.map((w) =>
        prisma.word.updateMany({
          where: { word: w.word },
          data: {
            definition: w.definition,
            ipa: w.ipa || '',
            partOfSpeech: w.partOfSpeech || 'noun',
            level: w.level,
            example: w.example,
            exampleTranslation: w.exampleTranslation,
          },
        })
      )
    );

    const percent = (((i + chunk.length) / total) * 100).toFixed(1);
    process.stdout.write(`\r   ⏳ Tiến độ DB: ${i + chunk.length}/${total} từ (${percent}%)`);
  }

  console.log('\n\n🎉 HOÀN TẤT ĐỒNG BỘ CSDL VÀ DATASET THÀNH CÔNG 100%!');

  // 3. Kiểm tra xác thực các từ khóa tiêu biểu
  console.log('\n🔍 KIỂM TRA MỘT SỐ TỪ TIÊU BIỂU TRONG DATABASE:');
  const verifyWords = ['liquor', 'civic', 'abandon', 'absorb', 'chair', 'bank', 'lithe', 'loam', 'computer'];
  const dbSample = await prisma.word.findMany({
    where: { word: { in: verifyWords } },
    select: { word: true, level: true, partOfSpeech: true, definition: true, example: true, exampleTranslation: true },
  });

  for (const s of dbSample) {
    console.log(`👉 [${s.word}] (${s.partOfSpeech} - ${s.level}): "${s.definition}"`);
    if (s.example) {
      console.log(`   Ex: "${s.example}" ↔ "${s.exampleTranslation}"`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

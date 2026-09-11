import fs from 'fs';
import readline from 'readline';

interface WordItem {
  word: string;
  level: string;
  domain: string;
  ipa: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  audioUrl: string;
  rank: number;
}

// Kiểm tra ngữ nghĩa chuyên ngành chi tiết
function assignDomain(word: string, def: string): string {
  const text = (word + ' ' + def).toLowerCase();

  // Y tế & Sức khỏe
  if (
    text.includes('bác sĩ') || text.includes('y tế') || text.includes('bệnh') || text.includes('thuốc') ||
    text.includes('sức khỏe') || text.includes('cơ thể') || text.includes('giải phẫu') || text.includes('xương') ||
    text.includes('tế bào') || text.includes('virus') || text.includes('vi khuẩn') || text.includes('nhiễm trùng') ||
    text.includes('phẫu thuật') || text.includes('triệu chứng') || text.includes('điều trị') || text.includes('dược') ||
    text.includes('tim mạch') || text.includes('huyết áp') || text.includes('ung thư') || text.includes('não') ||
    text.includes('khám bệnh') || text.includes('bệnh viện') || text.includes('y khoa')
  ) return 'MEDICINE';

  // Tài chính & Ngân hàng
  if (
    text.includes('tiền tệ') || text.includes('ngân hàng') || text.includes('tài chính') || text.includes('cổ phiếu') ||
    text.includes('chứng khoán') || text.includes('tín dụng') || text.includes('lãi suất') || text.includes('khoản vay') ||
    text.includes('thuế') || text.includes('lạm phát') || text.includes('tiền gửi') || text.includes('tiết kiệm') ||
    text.includes('ngoại tệ') || text.includes('ngân sách') || text.includes('tài sản nợ')
  ) return 'FINANCE';

  // Kinh doanh & Doanh nghiệp
  if (
    text.includes('kinh doanh') || text.includes('doanh nghiệp') || text.includes('thương mại') || text.includes('buôn bán') ||
    text.includes('hợp đồng') || text.includes('tiếp thị') || text.includes('khách hàng') || text.includes('đối tác') ||
    text.includes('sản phẩm') || text.includes('doanh thu') || text.includes('lợi nhuận') || text.includes('công ty') ||
    text.includes('quản trị') || text.includes('thương hiệu') || text.includes('bán lẻ') || text.includes('tiêu thụ')
  ) return 'BUSINESS';

  // Công nghệ & Máy tính
  if (
    text.includes('máy tính') || text.includes('phần mềm') || text.includes('công nghệ') || text.includes('kỹ thuật số') ||
    text.includes('lập trình') || text.includes('dữ liệu') || text.includes('mạng internet') || text.includes('vi xử lý') ||
    text.includes('thuật toán') || text.includes('mã hóa') || text.includes('điện thoại') || text.includes('màn hình') ||
    text.includes('phần cứng') || text.includes('trí tuệ nhân tạo') || text.includes('máy chủ') || text.includes('tin học')
  ) return 'TECHNOLOGY';

  // Khoa học tự nhiên
  if (
    text.includes('khoa học') || text.includes('nghiên cứu khoa học') || text.includes('vật lý') || text.includes('hóa học') ||
    text.includes('nguyên tử') || text.includes('phân tử') || text.includes('vũ trụ') || text.includes('thiên văn') ||
    text.includes('hành tinh') || text.includes('thí nghiệm') || text.includes('toán học') || text.includes('hình học') ||
    text.includes('phương trình') || text.includes('trọng lực') || text.includes('bức xạ') || text.includes('năng lượng')
  ) return 'SCIENCE';

  // Du lịch & Khám phá
  if (
    text.includes('du lịch') || text.includes('khách sạn') || text.includes('máy bay') || text.includes('sân bay') ||
    text.includes('hành lý') || text.includes('hộ chiếu') || text.includes('chuyến bay') || text.includes('du khách') ||
    text.includes('kỳ nghỉ') || text.includes('khám phá') || text.includes('thắng cảnh') || text.includes('tua du lịch')
  ) return 'TRAVEL';

  // Ẩm thực & Đồ ăn
  if (
    text.includes('món ăn') || text.includes('thực phẩm') || text.includes('nấu ăn') || text.includes('nhà hàng') ||
    text.includes('gia vị') || text.includes('bánh mì') || text.includes('thịt') || text.includes('rau quả') ||
    text.includes('đầu bếp') || text.includes('đồ uống') || text.includes('cà phê') || text.includes('bia') ||
    text.includes('rượu') || text.includes('bữa ăn') || text.includes('xào') || text.includes('nướng')
  ) return 'FOOD';

  // Thể thao & Rèn luyện
  if (
    text.includes('thể thao') || text.includes('bóng đá') || text.includes('bóng rổ') || text.includes('bơi lội') ||
    text.includes('thi đấu') || text.includes('vận động viên') || text.includes('trận đấu') || text.includes('vô địch') ||
    text.includes('huy chương') || text.includes('tập luyện') || text.includes('sân vận động') || text.includes('cầu thủ') ||
    text.includes('thể dục') || text.includes('quần vợt') || text.includes('chạy bộ')
  ) return 'SPORTS';

  // Âm nhạc
  if (
    text.includes('âm nhạc') || text.includes('bài hát') || text.includes('nhạc cụ') || text.includes('giai điệu') ||
    text.includes('ca sĩ') || text.includes('nhạc sĩ') || text.includes('đàn guitar') || text.includes('đàn piano') ||
    text.includes('dàn nhạc') || text.includes('buổi hòa nhạc') || text.includes('ca khúc') || text.includes('hát')
  ) return 'MUSIC';

  // Nghệ thuật & Hội họa
  if (
    text.includes('nghệ thuật') || text.includes('hội họa') || text.includes('điêu khắc') || text.includes('bức tranh') ||
    text.includes('vẽ tranh') || text.includes('họa sĩ') || text.includes('triển lãm') || text.includes('bảo tàng') ||
    text.includes('thẩm mỹ') || text.includes('tác phẩm nghệ thuật')
  ) return 'ART';

  // Giáo dục & Học tập
  if (
    text.includes('giáo dục') || text.includes('trường học') || text.includes('giáo viên') || text.includes('sinh viên') ||
    text.includes('học sinh') || text.includes('đại học') || text.includes('bài giảng') || text.includes('thi cử') ||
    text.includes('học kỳ') || text.includes('bằng cấp') || text.includes('sách giáo khoa') || text.includes('giảng viên')
  ) return 'EDUCATION';

  // Môi trường & Thiên nhiên
  if (
    text.includes('môi trường') || text.includes('sinh thái') || text.includes('khí hậu') || text.includes('rừng') ||
    text.includes('động vật hoang dã') || text.includes('thực vật') || text.includes('ô nhiễm') || text.includes('thời tiết') ||
    text.includes('bão') || text.includes('lũ lụt') || text.includes('núi non') || text.includes('sông ngòi') ||
    text.includes('đại dương') || text.includes('biến đổi khí hậu') || text.includes('bảo tồn')
  ) return 'ENVIRONMENT';

  // Pháp luật & Tòa án
  if (
    text.includes('pháp luật') || text.includes('luật sư') || text.includes('tòa án') || text.includes('thẩm phán') ||
    text.includes('công lý') || text.includes('tội phạm') || text.includes('vi phạm pháp luật') || text.includes('hình sự') ||
    text.includes('dân sự') || text.includes('kiện tụng') || text.includes('bị cáo') || text.includes('bản án') ||
    text.includes('hiến pháp') || text.includes('điều luật')
  ) return 'LAW';

  // Chính trị & Ngoại giao
  if (
    text.includes('chính trị') || text.includes('chính phủ') || text.includes('quốc hội') || text.includes('tổng thống') ||
    text.includes('thủ tướng') || text.includes('bầu cử') || text.includes('ngoại giao') || text.includes('chính sách') ||
    text.includes('đảng phái') || text.includes('quốc gia') || text.includes('nhà nước') || text.includes('nghị viện')
  ) return 'POLITICS';

  // Thời trang & May mặc
  if (
    text.includes('thời trang') || text.includes('quần áo') || text.includes('trang phục') || text.includes('may mặc') ||
    text.includes('áo sơ mi') || text.includes('váy') || text.includes('giày dép') || text.includes('người mẫu thời trang') ||
    text.includes('bộ sưu tập thời trang') || text.includes('phụ kiện thời trang')
  ) return 'FASHION';

  // Lịch sử & Khảo cổ
  if (
    text.includes('lịch sử') || text.includes('triều đại') || text.includes('thời kỳ cổ đại') || text.includes('chiến tranh thế giới') ||
    text.includes('di tích lịch sử') || text.includes('hoàng gia') || text.includes('vua chúa') || text.includes('khảo cổ') ||
    text.includes('cổ vật') || text.includes('thế kỷ trước')
  ) return 'HISTORY';

  // Văn học
  if (
    text.includes('văn học') || text.includes('tiểu thuyết') || text.includes('thơ ca') || text.includes('truyện ngắn') ||
    text.includes('nhà văn') || text.includes('nhà thơ') || text.includes('cốt truyện') || text.includes('nhân vật văn học') ||
    text.includes('văn xuôi')
  ) return 'LITERATURE';

  // Giải trí & Điện ảnh
  if (
    text.includes('giải trí') || text.includes('phim ảnh') || text.includes('điện ảnh') || text.includes('rạp chiếu phim') ||
    text.includes('diễn viên') || text.includes('trò chơi điện tử') || text.includes('game') || text.includes('hài kịch') ||
    text.includes('truyền hình') || text.includes('show giải trí') || text.includes('thư giãn')
  ) return 'ENTERTAINMENT';

  // Giao tiếp & Ngôn ngữ
  if (
    text.includes('giao tiếp') || text.includes('thuyết trình') || text.includes('đàm thoại') || text.includes('chào hỏi') ||
    text.includes('phát biểu') || text.includes('ngôn ngữ') || text.includes('tin nhắn') || text.includes('thư từ') ||
    text.includes('trò chuyện') || text.includes('thảo luận')
  ) return 'COMMUNICATION';

  // MẶC ĐỊNH: Đời sống hàng ngày / Từ vựng thông dụng chung
  return 'LIFE';
}

function cleanDefinition(def: string): string {
  let d = def.replace(/\([^)]*\)/g, '').trim();
  d = d.replace(/^[-,;:.\s]+/, '').trim();
  if (d.includes(';')) d = d.split(';')[0].trim();
  if (d.includes(',')) {
    const parts = d.split(',');
    if (parts.length > 2) d = parts.slice(0, 2).join(',').trim();
  }
  return d || def;
}

function assignLevel(word: string): string {
  const len = word.length;
  if (len <= 4) return 'A1';
  if (len <= 5) return 'A2';
  if (len <= 7) return 'B1';
  if (len <= 9) return 'B2';
  if (len <= 11) return 'C1';
  return 'C2';
}

// Tính độ thông dụng (Rank càng nhỏ = Càng thông dụng)
function computeRank(word: string, hasExample: boolean, isCompound: boolean): number {
  const len = word.length;
  let baseScore = 5000;

  // Từ ngắn không có dấu gạch nối thường thông dụng hơn
  if (!isCompound) {
    if (len >= 3 && len <= 6) baseScore = 4000;
    else if (len <= 8) baseScore = 8000;
    else baseScore = 15000;
  } else {
    baseScore = 25000; // Từ ghép ít thông dụng hơn
  }

  // Từ có câu ví dụ chứng tỏ là từ có ngữ cảnh sử dụng thực tế
  if (hasExample) {
    baseScore -= 1000;
  }

  // Từ có các hậu tố học thuật / chuyên sâu thì rank cao hơn (ít thông dụng)
  if (word.endsWith('tion') || word.endsWith('ment') || word.endsWith('ness')) baseScore += 2000;
  if (word.endsWith('ology') || word.endsWith('isation') || word.endsWith('ization')) baseScore += 5000;
  if (word.endsWith('ability') || word.endsWith('lessness')) baseScore += 7000;

  return Math.max(3050, baseScore);
}

async function main() {
  console.log('🚀 Bắt đầu quá trình chuẩn hóa Lĩnh vực & Đánh chỉ số Thông dụng (Rank)...\n');

  const finalMap = new Map<string, WordItem>();

  // 1. Nạp và ưu tiên bộ 3.049 từ cốt lõi chuẩn Oxford CEFR (Rank 1 -> 3.049)
  if (fs.existsSync('./vocatype-master-vocabulary.json')) {
    const coreWords: any[] = JSON.parse(fs.readFileSync('./vocatype-master-vocabulary.json', 'utf-8'));
    let coreRank = 1;
    for (const w of coreWords) {
      const cleanWord = w.word.toLowerCase().trim();
      if (!cleanWord || cleanWord.length < 2) continue;

      // Chuẩn hóa lại domain của từ cốt lõi
      const correctedDomain = assignDomain(cleanWord, w.definition);

      finalMap.set(cleanWord, {
        word: cleanWord,
        level: w.level,
        domain: correctedDomain,
        ipa: w.ipa || '',
        definition: w.definition,
        partOfSpeech: w.partOfSpeech || 'noun',
        example: w.example || `This is an example of "${cleanWord}".`,
        exampleTranslation: w.exampleTranslation || `Đây là ví dụ cho từ "${cleanWord}".`,
        audioUrl: `https://pub-1366610845f540478990dea3a41db20c.r2.dev/audio/${cleanWord}.mp3`,
        rank: coreRank++, // 1 -> 3049: Đảm bảo luôn đứng đầu trong bài học
      });
    }
    console.log(`✅ Đã nạp ${finalMap.size} từ cốt lõi Oxford với Rank 1 - ${finalMap.size}.`);
  }

  // 2. Đọc từ điển lớn 109k từ
  const filePath = './english-vietnamese.txt';
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let currentWord: string | null = null;
    let currentIpa = '';
    let currentPos = '';
    let currentDefs: string[] = [];
    let currentExamples: string[] = [];

    const TARGET_COUNT = 55000;

    function commitCurrent() {
      if (!currentWord) return;
      const cleanWord = currentWord.toLowerCase().replace(/[^a-z-]/g, '').trim();

      if (
        cleanWord.length >= 2 &&
        cleanWord.length <= 20 &&
        !cleanWord.startsWith('-') &&
        !cleanWord.endsWith('-') &&
        !finalMap.has(cleanWord) &&
        currentDefs.length > 0
      ) {
        const rawDef = currentDefs[0];
        const def = cleanDefinition(rawDef);

        if (def && def.length > 1) {
          let example = `He used the word "${cleanWord}" in his sentence.`;
          let exampleTranslation = `Anh ấy đã sử dụng từ "${cleanWord}" (${def}) trong câu của mình.`;
          let hasRealExample = false;

          if (currentExamples.length > 0) {
            const exParts = currentExamples[0].split('+');
            if (exParts.length === 2 && exParts[0].trim().length > 3) {
              example = exParts[0].trim().replace(/_/g, ' ');
              exampleTranslation = exParts[1].trim();
              hasRealExample = true;
            }
          }

          let pos = currentPos ? currentPos.replace(/[*,\s]+/g, ' ').trim() : 'noun';
          if (pos.includes('danh từ')) pos = 'noun';
          else if (pos.includes('động từ')) pos = 'verb';
          else if (pos.includes('tính từ')) pos = 'adjective';
          else if (pos.includes('phó từ') || pos.includes('trạng từ')) pos = 'adverb';
          else if (!pos) pos = 'noun';

          const domain = assignDomain(cleanWord, def);
          const level = assignLevel(cleanWord);
          const rank = computeRank(cleanWord, hasRealExample, cleanWord.includes('-'));

          finalMap.set(cleanWord, {
            word: cleanWord,
            level,
            domain,
            ipa: currentIpa || '',
            definition: def,
            partOfSpeech: pos,
            example,
            exampleTranslation,
            audioUrl: `https://pub-1366610845f540478990dea3a41db20c.r2.dev/audio/${cleanWord}.mp3`,
            rank,
          });
        }
      }
    }

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('@')) {
        commitCurrent();
        if (finalMap.size >= TARGET_COUNT) break;

        const match = trimmed.match(/^@([^\/]+)(?:\s*\/(.*)\/)?/);
        if (match) {
          currentWord = match[1].trim();
          currentIpa = match[2] ? '/' + match[2].trim() + '/' : '';
        } else {
          currentWord = trimmed.replace(/^@/, '').trim();
          currentIpa = '';
        }
        currentPos = '';
        currentDefs = [];
        currentExamples = [];
      } else if (trimmed.startsWith('*')) {
        if (!currentPos) currentPos = trimmed.replace(/^\*\s*/, '').trim();
      } else if (trimmed.startsWith('-')) {
        currentDefs.push(trimmed.replace(/^-\s*/, '').trim());
      } else if (trimmed.startsWith('=')) {
        if (currentExamples.length < 2) currentExamples.push(trimmed.replace(/^=\s*/, '').trim());
      }
    }

    commitCurrent();
  }

  // 3. Sắp xếp toàn bộ từ vựng theo Rank tăng dần (Từ thông dụng nhất đứng trước)
  const allResults = Array.from(finalMap.values()).sort((a, b) => a.rank - b.rank);

  // Đánh lại số thứ tự rank từ 1 đến N liền mạch
  allResults.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  console.log(`\n🎉 Tổng số từ hoàn thiện: ${allResults.length} từ.`);

  // Thống kê phân bố Domain thực tế
  const domainStats: Record<string, number> = {};
  allResults.forEach(item => {
    domainStats[item.domain] = (domainStats[item.domain] || 0) + 1;
  });

  console.log('\n📊 Phân bố Lĩnh vực (Domains) mới theo ngữ nghĩa:');
  Object.entries(domainStats).sort((a, b) => b[1] - a[1]).forEach(([domain, count]) => {
    console.log(`   ${domain.padEnd(16)}: ${count} từ`);
  });

  const outputFile = './vocatype-50k-vocabulary.json';
  fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Đã lưu thành công ${allResults.length} từ vào ${outputFile}!`);
}

main().catch(console.error);

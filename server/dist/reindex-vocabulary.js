"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const BASIC_WORD_OVERRIDES = {
    it: { definition: 'nó, điều đó', pos: 'pronoun', level: 'A1' },
    he: { definition: 'anh ấy, ông ấy, nó', pos: 'pronoun', level: 'A1' },
    she: { definition: 'cô ấy, bà ấy', pos: 'pronoun', level: 'A1' },
    they: { definition: 'họ, chúng nó', pos: 'pronoun', level: 'A1' },
    we: { definition: 'chúng ta, chúng tôi', pos: 'pronoun', level: 'A1' },
    you: { definition: 'bạn, các bạn', pos: 'pronoun', level: 'A1' },
    i: { definition: 'tôi', pos: 'pronoun', level: 'A1' },
    me: { definition: 'tôi, mình', pos: 'pronoun', level: 'A1' },
    him: { definition: 'anh ấy, ông ấy', pos: 'pronoun', level: 'A1' },
    her: { definition: 'cô ấy, của cô ấy', pos: 'pronoun', level: 'A1' },
    his: { definition: 'của anh ấy, của ông ấy', pos: 'pronoun', level: 'A1' },
    my: { definition: 'của tôi', pos: 'pronoun', level: 'A1' },
    your: { definition: 'của bạn, của các bạn', pos: 'pronoun', level: 'A1' },
    our: { definition: 'của chúng tôi, của chúng ta', pos: 'pronoun', level: 'A1' },
    their: { definition: 'của họ, của chúng nó', pos: 'pronoun', level: 'A1' },
    pan: { definition: 'cái chảo', pos: 'noun', level: 'A1' },
    an: { definition: 'một (mạo từ)', pos: 'determiner', level: 'A1' },
    a: { definition: 'một (mạo từ)', pos: 'determiner', level: 'A1' },
    to: { definition: 'đến, hướng tới, để', pos: 'preposition', level: 'A1' },
    as: { definition: 'như là, khi, bởi vì', pos: 'conjunction', level: 'A1' },
    in: { definition: 'trong, ở trong', pos: 'preposition', level: 'A1' },
    on: { definition: 'trên, ở trên', pos: 'preposition', level: 'A1' },
    for: { definition: 'cho, dành cho', pos: 'preposition', level: 'A1' },
    with: { definition: 'với, cùng với', pos: 'preposition', level: 'A1' },
    by: { definition: 'bởi, bằng, bên cạnh', pos: 'preposition', level: 'A1' },
    at: { definition: 'ở, tại', pos: 'preposition', level: 'A1' },
    from: { definition: 'từ, bắt nguồn từ', pos: 'preposition', level: 'A1' },
    be: { definition: 'thì, là, ở', pos: 'verb', level: 'A1' },
    have: { definition: 'có, sở hữu', pos: 'verb', level: 'A1' },
    do: { definition: 'làm, thực hiện', pos: 'verb', level: 'A1' },
    should: { definition: 'nên, phải', pos: 'modal verb', level: 'A1' },
    constructor: { definition: 'người xây dựng, hàm khởi tạo', pos: 'noun', level: 'C1' },
    commensurable: { definition: 'có thể so sánh, thông ước', pos: 'adjective', level: 'C2' },
    caboodle: { definition: 'cả bọn, cả mớ', pos: 'noun', level: 'C2' },
    cavicorne: { definition: 'có sừng rỗng', pos: 'adjective', level: 'C2' },
    'gas-attack': { definition: 'tấn công bằng hơi độc', pos: 'noun', level: 'C2' },
    'grade-crossing': { definition: 'giao cắt đường bộ - sắt', pos: 'noun', level: 'C2' },
};
async function main() {
    console.log('🚀 BẮT ĐẦU RE-INDEX RANK & LEVEL TOÀN BỘ 55.000 TỪ THEO TẦN SUẤT CHUẨN...\n');
    const freqPath = '/Users/loinh/.gemini/antigravity-ide/brain/f616458a-e0b8-4666-af69-bd8a952a2ea3/scratch/top_500000.txt';
    if (!fs_1.default.existsSync(freqPath)) {
        console.error('❌ Không tìm thấy file tần suất:', freqPath);
        return;
    }
    console.log('📖 Đang nạp bảng tần suất 500,000 từ tiếng Anh Google Ngrams...');
    const freqLines = fs_1.default
        .readFileSync(freqPath, 'utf-8')
        .split('\n')
        .map((l) => l.trim().toLowerCase())
        .filter(Boolean);
    const freqMap = new Map();
    for (let i = 0; i < freqLines.length; i++) {
        const w = freqLines[i];
        if (!freqMap.has(w)) {
            freqMap.set(w, i + 1);
        }
    }
    console.log(`✅ Đã nạp ${freqMap.size.toLocaleString()} từ tần suất vào bộ nhớ!`);
    const oxfordMap = new Map();
    if (fs_1.default.existsSync('./oxford-5000.json')) {
        const oxList = JSON.parse(fs_1.default.readFileSync('./oxford-5000.json', 'utf-8'));
        for (const item of oxList) {
            if (item.word && item.level) {
                oxfordMap.set(item.word.toLowerCase().trim(), item.level.toUpperCase());
            }
        }
        console.log(`✅ Đã nạp ${oxfordMap.size.toLocaleString()} nhãn CEFR chuẩn Oxford!`);
    }
    const datasetPath = './vocatype-50k-vocabulary.json';
    const rawWords = JSON.parse(fs_1.default.readFileSync(datasetPath, 'utf-8'));
    console.log(`📊 Đang xử lý ${rawWords.length.toLocaleString()} từ trong kho từ vựng...\n`);
    const processedWords = rawWords.map((item) => {
        const cleanWord = item.word.toLowerCase().trim();
        const freq = freqMap.get(cleanWord) || 999999;
        const override = BASIC_WORD_OVERRIDES[cleanWord];
        let finalLevel = 'C2';
        if (override && override.level) {
            finalLevel = override.level;
        }
        else if (oxfordMap.has(cleanWord)) {
            finalLevel = oxfordMap.get(cleanWord);
        }
        else {
            if (freq <= 1200)
                finalLevel = 'A1';
            else if (freq <= 3500)
                finalLevel = 'A2';
            else if (freq <= 8000)
                finalLevel = 'B1';
            else if (freq <= 18000)
                finalLevel = 'B2';
            else if (freq <= 35000)
                finalLevel = 'C1';
            else
                finalLevel = 'C2';
        }
        let definition = item.definition;
        let pos = item.partOfSpeech || 'noun';
        if (override) {
            definition = override.definition;
            pos = override.pos;
        }
        if (!definition || definition.trim() === '') {
            definition = item.exampleTranslation || `Từ ${cleanWord}`;
        }
        return {
            ...item,
            word: cleanWord,
            definition: definition.trim(),
            partOfSpeech: pos,
            level: finalLevel,
            freqRank: freq,
        };
    });
    const byLevel = {
        A1: [],
        A2: [],
        B1: [],
        B2: [],
        C1: [],
        C2: [],
    };
    for (const w of processedWords) {
        if (byLevel[w.level]) {
            byLevel[w.level].push(w);
        }
        else {
            byLevel.C2.push(w);
        }
    }
    const finalUpdatedList = [];
    for (const lvl of Object.keys(byLevel)) {
        byLevel[lvl].sort((a, b) => a.freqRank - b.freqRank);
        byLevel[lvl].forEach((item, index) => {
            item.rank = index + 1;
            delete item.freqRank;
            finalUpdatedList.push(item);
        });
        console.log(`📌 Level ${lvl}: ${byLevel[lvl].length.toLocaleString()} từ (Rank 1 -> ${byLevel[lvl].length})`);
    }
    fs_1.default.writeFileSync(datasetPath, JSON.stringify(finalUpdatedList, null, 2), 'utf-8');
    console.log(`\n💾 Đã cập nhật file ${datasetPath} với thứ tự Rank chuẩn xác!`);
    console.log('\n🗄️ ĐANG ĐỒNG BỘ LẠI TOÀN BỘ VÀO NEON POSTGRESQL DATABASE...');
    await prisma.word.deleteMany({});
    console.log('✅ Đã dọn sạch dữ liệu cũ trong DB.');
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < finalUpdatedList.length; i += CHUNK_SIZE) {
        const chunk = finalUpdatedList.slice(i, i + CHUNK_SIZE);
        await prisma.word.createMany({
            data: chunk,
            skipDuplicates: true,
        });
        const percent = (((i + chunk.length) / finalUpdatedList.length) * 100).toFixed(1);
        process.stdout.write(`\r   ⏳ Tiến độ DB: ${i + chunk.length}/${finalUpdatedList.length} từ (${percent}%)`);
    }
    const dbCount = await prisma.word.count();
    console.log(`\n\n🎉 HOÀN TẤT! Tổng số từ trong CSDL: ${dbCount.toLocaleString()} từ.`);
    const topA1 = await prisma.word.findMany({
        where: { level: 'A1' },
        orderBy: { rank: 'asc' },
        take: 15,
        select: { word: true, rank: true, level: true, definition: true },
    });
    console.log('\n🔍 TOP 15 TỪ THÔNG DỤNG NHẤT CỦA LEVEL A1 TRONG DATABASE:');
    topA1.forEach((w) => {
        console.log(`   #${w.rank} [${w.word}]: ${w.definition}`);
    });
}
main()
    .catch((e) => console.error('❌ Lỗi:', e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=reindex-vocabulary.js.map
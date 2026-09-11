"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 BẮT ĐẦU ĐỒNG BỘ DATASET VÀO NEON DATABASE...\n');
    const datasetPath = './vocatype-50k-vocabulary.json';
    if (!fs_1.default.existsSync(datasetPath)) {
        console.error('❌ Không tìm thấy file:', datasetPath);
        return;
    }
    const rawData = JSON.parse(fs_1.default.readFileSync(datasetPath, 'utf-8'));
    console.log(`📊 Tổng số từ cần đồng bộ: ${rawData.length.toLocaleString()}`);
    const cleanedData = rawData.map((w) => {
        let exVi = w.exampleTranslation || '';
        if (exVi.startsWith('Anh ấy đã sử dụng từ')) {
            exVi = `Anh ấy đã sử dụng từ "${w.word}" (${w.definition}) trong câu của mình.`;
        }
        else {
            exVi = exVi.replace(/\bdẽ uốn\b/gi, 'dễ uốn')
                .replace(/\bđất nhiều mùm\b/gi, 'đất nhiều mùn')
                .replace(/\bmùm\b/gi, 'mùn');
        }
        return {
            word: w.word.toLowerCase().trim(),
            level: w.level,
            domain: w.domain || 'LIFE',
            ipa: w.ipa || '',
            definition: w.definition,
            partOfSpeech: w.partOfSpeech || 'noun',
            synonyms: w.synonyms || [],
            example: w.example || `This is an example of "${w.word}".`,
            exampleTranslation: exVi,
            audioUrl: w.audioUrl || `https://pub-1366610845f540478990dea3a41db20c.r2.dev/audio/${w.word.toLowerCase().trim()}.mp3`,
            rank: w.rank || 999999,
            additionalExamples: [],
        };
    });
    fs_1.default.writeFileSync(datasetPath, JSON.stringify(cleanedData, null, 2), 'utf-8');
    console.log('💾 Đã chuẩn hóa câu dịch ví dụ trong vocatype-50k-vocabulary.json');
    console.log('🗑️ Đang xóa sạch bảng Word trong Database để nạp mới...');
    await prisma.word.deleteMany({});
    console.log('✅ Đã xóa sạch dữ liệu cũ.');
    console.log('📥 Đang nạp 55,000 từ vựng đã chuẩn hóa vào Neon Database (batch 1,000 từ)...');
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < cleanedData.length; i += CHUNK_SIZE) {
        const chunk = cleanedData.slice(i, i + CHUNK_SIZE);
        await prisma.word.createMany({
            data: chunk,
            skipDuplicates: true,
        });
        const percent = (((i + chunk.length) / cleanedData.length) * 100).toFixed(1);
        console.log(`   ✅ Đã chèn ${i + chunk.length}/${cleanedData.length} từ (${percent}%)`);
    }
    const totalCount = await prisma.word.count();
    console.log(`\n🎉 HOÀN THÀNH! Tổng số từ trong Neon Database: ${totalCount.toLocaleString()} từ.`);
    console.log('\n🔍 KIỂM TRA MỘT SỐ TỪ TRONG DATABASE:');
    const testWords = ['liquor', 'civic', 'abandon', 'absorb', 'chair', 'bank', 'lithe', 'loam', 'computer'];
    const dbSample = await prisma.word.findMany({
        where: { word: { in: testWords } },
        select: { word: true, level: true, partOfSpeech: true, definition: true, example: true, exampleTranslation: true },
    });
    for (const s of dbSample) {
        console.log(`👉 [${s.word}] (${s.partOfSpeech} - ${s.level}): "${s.definition}"`);
        console.log(`   Ex: "${s.example}" ↔ "${s.exampleTranslation}"`);
    }
}
main()
    .catch((e) => {
    console.error('❌ Lỗi:', e);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=sync-to-db.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🗑️ Xóa dữ liệu cũ...');
    await prisma.word.deleteMany({});
    const dataPath = fs_1.default.existsSync('./vocatype-50k-vocabulary.json')
        ? './vocatype-50k-vocabulary.json'
        : fs_1.default.existsSync('./vocatype-master-vocabulary.json')
            ? './vocatype-master-vocabulary.json'
            : './oxford-5000.json';
    const rawData = JSON.parse(fs_1.default.readFileSync(dataPath, 'utf-8'));
    const wordData = rawData.map((w) => ({
        word: w.word.toLowerCase().trim(),
        level: w.level,
        domain: w.domain || 'LIFE',
        ipa: w.ipa || '',
        definition: w.definition || w.def || `Từ ${w.word}`,
        partOfSpeech: w.partOfSpeech || null,
        synonyms: w.synonyms || [],
        example: w.example || `This is an example of "${w.word}".`,
        exampleTranslation: w.exampleTranslation || `Đây là ví dụ cho từ "${w.word}".`,
        audioUrl: w.audioUrl || `https://pub-1366610845f540478990dea3a41db20c.r2.dev/audio/${w.word.toLowerCase().trim()}.mp3`,
        rank: w.rank || 999999,
        additionalExamples: [],
    }));
    const chunkSize = 1000;
    for (let i = 0; i < wordData.length; i += chunkSize) {
        const chunk = wordData.slice(i, i + chunkSize);
        await prisma.word.createMany({
            data: chunk,
            skipDuplicates: true,
        });
        console.log(`✅ Đã chèn ${i + chunk.length}/${wordData.length} từ`);
    }
    const total = await prisma.word.count();
    const byLevel = await prisma.word.groupBy({
        by: ['level'],
        _count: true,
        orderBy: { level: 'asc' },
    });
    console.log(`🎉 Hoàn thành! Tổng số từ trong CSDL: ${total}`);
    console.log('📊 Thống kê theo cấp độ:');
    byLevel.forEach(l => console.log(`   ${l.level}: ${l._count} từ`));
}
main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map
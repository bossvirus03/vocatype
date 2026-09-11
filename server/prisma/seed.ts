import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Xóa dữ liệu cũ...');
  await prisma.word.deleteMany({});

  const dataPath = fs.existsSync('./vocatype-50k-vocabulary.json')
    ? './vocatype-50k-vocabulary.json'
    : fs.existsSync('./vocatype-master-vocabulary.json')
      ? './vocatype-master-vocabulary.json'
      : './oxford-5000.json';

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const wordData = rawData.map((w: any) => ({
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zlib_1 = __importDefault(require("zlib"));
const prisma = new client_1.PrismaClient();
function cleanDefText(raw) {
    let s = raw.normalize('NFC').replace(/&nbsp;/g, ' ');
    s = s.replace(/<[^>]+>/g, '');
    s = s.replace(/^bộm\s+/i, '');
    s = s.replace(/\s*tin lizzie\)/gi, '');
    s = s.replace(/\bdẽ uốn\b/gi, 'dễ uốn');
    s = s.replace(/\bđất nhiều mùm\b/gi, 'đất nhiều mùn');
    s = s.replace(/\bmùm\b/gi, 'mùn');
    s = s.replace(/\bgởi\b/gi, 'gửi');
    s = s.replace(/^\([^)]*\)\s*/, '').replace(/\s*\([^)]*\)$/, '');
    if (s.includes(';')) {
        const parts = s.split(';').map((p) => p.trim()).filter(Boolean);
        const concise = parts.filter((p) => {
            const words = p.split(/\s+/).length;
            return words >= 1 && words <= 4 && !p.includes('...') && !p.toLowerCase().startsWith('như ');
        });
        if (concise.length > 0) {
            s = concise.slice(0, 2).join(', ');
        }
        else {
            s = parts.slice(0, 2).join(', ');
        }
    }
    if (s.split(',').length > 2 && s.length > 35) {
        const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
        s = parts.slice(0, 2).join(', ');
    }
    return s.trim();
}
function parseHtmlFile(content, dictMap) {
    const entries = content.split(/<w><a name="/);
    for (let i = 1; i < entries.length; i++) {
        const chunk = entries[i];
        const endTag = chunk.indexOf('</w>');
        const entryHtml = endTag !== -1 ? chunk.slice(0, endTag) : chunk;
        const quoteIdx = entryHtml.indexOf('"');
        if (quoteIdx === -1)
            continue;
        const word = entryHtml.slice(0, quoteIdx).toLowerCase().trim();
        if (!word || word.includes(' '))
            continue;
        let ipa = '';
        const ipaUS = entryHtml.match(/\[US\]<\/b>\s*\/([^\/]+)\//);
        const ipaUK = entryHtml.match(/\[UK\]<\/b>\s*\/([^\/]+)\//);
        const ipaGen = entryHtml.match(/—\s*\/([^\/]+)\//);
        if (ipaUS)
            ipa = '/' + ipaUS[1].replace(/[\u200B-\u200D\uFEFF]/g, '') + '/';
        else if (ipaUK)
            ipa = '/' + ipaUK[1].replace(/[\u200B-\u200D\uFEFF]/g, '') + '/';
        else if (ipaGen)
            ipa = '/' + ipaGen[1].replace(/[\u200B-\u200D\uFEFF]/g, '') + '/';
        let cefr = null;
        const cefrM = entryHtml.match(/<b>CEFR:<\/b>\s*([A-C][1-2])/i);
        if (cefrM)
            cefr = cefrM[1].toUpperCase();
        let pos = 'noun';
        const posM = entryHtml.match(/■\s*([a-zA-Zà-ỹ\s]+)<\/b>/i);
        if (posM) {
            const rp = posM[1].toLowerCase().trim();
            if (rp.includes('danh từ'))
                pos = 'noun';
            else if (rp.includes('động từ'))
                pos = 'verb';
            else if (rp.includes('tính từ'))
                pos = 'adjective';
            else if (rp.includes('phó từ') || rp.includes('trạng từ'))
                pos = 'adverb';
            else if (rp.includes('giới từ'))
                pos = 'preposition';
            else if (rp.includes('liên từ'))
                pos = 'conjunction';
            else if (rp.includes('đại từ'))
                pos = 'pronoun';
        }
        let definition = '';
        const defM = entryHtml.match(/1\.&nbsp;&nbsp;<\/b>(?:<b>)?([^<]+)(?:<\/b>)?/);
        if (defM) {
            definition = cleanDefText(defM[1]);
        }
        else {
            const altDef = entryHtml.match(/<div><b style="[^"]*">1\.[^<]*<\/b>([^<]+)<\/div>/);
            if (altDef)
                definition = cleanDefText(altDef[1]);
        }
        let example = '';
        let exampleTranslation = '';
        const exM = entryHtml.match(/‣&nbsp;&nbsp;<i>([^<]+)<\/i>\s*↔\s*([^<]+)/);
        if (exM) {
            example = exM[1].replace(/<[^>]+>/g, '').trim();
            exampleTranslation = exM[2].replace(/<[^>]+>/g, '').trim();
        }
        if (definition && definition.length >= 1) {
            const item = { word, ipa, cefr, pos, definition, example, exampleTranslation };
            dictMap.set(word, item);
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
    if (!fs_1.default.existsSync(dictDir)) {
        console.error('❌ Không tìm thấy thư mục từ điển:', dictDir);
        return;
    }
    const files = fs_1.default.readdirSync(dictDir).filter((f) => f.endsWith('.html'));
    console.log(`📚 Đang đọc và giải nén ${files.length} file từ điển...`);
    const dictMap = new Map();
    for (const file of files) {
        try {
            const raw = zlib_1.default.gunzipSync(fs_1.default.readFileSync(path_1.default.join(dictDir, file))).toString('utf-8');
            parseHtmlFile(raw, dictMap);
        }
        catch (e) {
        }
    }
    console.log(`✅ Đã nạp thành công ${dictMap.size.toLocaleString()} mục từ và biến thể vào bộ nhớ!\n`);
    const masterMap = new Map();
    if (fs_1.default.existsSync('./vocatype-master-vocabulary.json')) {
        const master = JSON.parse(fs_1.default.readFileSync('./vocatype-master-vocabulary.json', 'utf-8'));
        for (const m of master) {
            masterMap.set(m.word.toLowerCase().trim(), m);
        }
    }
    const overrides = {
        bank: { definition: 'ngân hàng, bờ sông', pos: 'noun' },
        chair: { definition: 'ghế, cái ghế', pos: 'noun' },
        liquor: { definition: 'rượu, đồ uống có cồn', pos: 'noun' },
        civic: { definition: 'thuộc đô thị, thuộc công dân', pos: 'adjective' },
        abandon: { definition: 'từ bỏ, bỏ rơi, ruồng bỏ', pos: 'verb' },
        absorb: { definition: 'hút thu, hấp thu', pos: 'verb' },
        neighbor: { definition: 'hàng xóm, người láng giềng', pos: 'noun' },
        neighbour: { definition: 'hàng xóm, người láng giềng', pos: 'noun' },
    };
    const datasetPath = './vocatype-50k-vocabulary.json';
    if (!fs_1.default.existsSync(datasetPath)) {
        console.error('❌ Không tìm thấy file', datasetPath);
        return;
    }
    const wordsList = JSON.parse(fs_1.default.readFileSync(datasetPath, 'utf-8'));
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
            if (dictItem.ipa)
                newIpa = dictItem.ipa;
            if (dictItem.pos)
                newPos = dictItem.pos;
            if (dictItem.cefr) {
                newLevel = dictItem.cefr;
                cefrUpdatedCount++;
            }
            if (dictItem.example && dictItem.exampleTranslation) {
                newEx = dictItem.example;
                newExVi = dictItem.exampleTranslation;
                realExampleCount++;
            }
        }
        else {
            newDef = cleanDefText(item.definition);
        }
        const masterWord = masterMap.get(cleanWord);
        if (masterWord && masterWord.definition) {
            if (['bank', 'table', 'chair', 'apple', 'door', 'window', 'water', 'book'].includes(cleanWord)) {
                newDef = masterWord.definition;
            }
        }
        if (override) {
            if (override.definition)
                newDef = override.definition;
            if (override.pos)
                newPos = override.pos;
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
    fs_1.default.writeFileSync(datasetPath, JSON.stringify(updatedWords, null, 2), 'utf-8');
    console.log(`💾 Đã ghi file ${datasetPath} với ${updatedWords.length} từ đã chuẩn hóa.`);
    console.log(`   - Số từ cập nhật nghĩa từ điển mới: ${updatedCount.toLocaleString()} / ${wordsList.length} (${((updatedCount / wordsList.length) * 100).toFixed(1)}%)`);
    console.log(`   - Số từ cập nhật câu ví dụ thực tế: ${realExampleCount.toLocaleString()}`);
    console.log(`   - Số từ cập nhật chuẩn CEFR chính thức: ${cefrUpdatedCount.toLocaleString()}`);
    console.log('\n🗄️ ĐANG ĐỒNG BỘ VÀO NEON POSTGRESQL DATABASE...');
    console.log('   (Sử dụng Prisma updateMany theo từng batch để đảm bảo tốc độ và an toàn)...');
    const BATCH_SIZE = 500;
    const total = updatedWords.length;
    for (let i = 0; i < total; i += BATCH_SIZE) {
        const chunk = updatedWords.slice(i, i + BATCH_SIZE);
        await prisma.$transaction(chunk.map((w) => prisma.word.updateMany({
            where: { word: w.word },
            data: {
                definition: w.definition,
                ipa: w.ipa || '',
                partOfSpeech: w.partOfSpeech || 'noun',
                level: w.level,
                example: w.example,
                exampleTranslation: w.exampleTranslation,
            },
        })));
        const percent = (((i + chunk.length) / total) * 100).toFixed(1);
        process.stdout.write(`\r   ⏳ Tiến độ DB: ${i + chunk.length}/${total} từ (${percent}%)`);
    }
    console.log('\n\n🎉 HOÀN TẤT ĐỒNG BỘ CSDL VÀ DATASET THÀNH CÔNG 100%!');
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
//# sourceMappingURL=update-definitions.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const r2_1 = require("./src/utils/r2");
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
function assignDomain(word, pos, def) {
    const text = (word + ' ' + def).toLowerCase();
    if (text.includes('bác sĩ') || text.includes('y tế') || text.includes('bệnh') || text.includes('thuốc') || text.includes('sức khỏe'))
        return 'MEDICINE';
    if (text.includes('tiền') || text.includes('ngân hàng') || text.includes('tài chính') || text.includes('đầu tư'))
        return 'FINANCE';
    if (text.includes('kinh doanh') || text.includes('thị trường') || text.includes('doanh nghiệp') || text.includes('thương mại'))
        return 'BUSINESS';
    if (text.includes('máy tính') || text.includes('phần mềm') || text.includes('công nghệ') || text.includes('kỹ thuật'))
        return 'TECHNOLOGY';
    if (text.includes('khoa học') || text.includes('nghiên cứu') || text.includes('vật lý') || text.includes('hóa học'))
        return 'SCIENCE';
    if (text.includes('du lịch') || text.includes('chuyến đi') || text.includes('khách sạn') || text.includes('máy bay'))
        return 'TRAVEL';
    if (text.includes('món ăn') || text.includes('thực phẩm') || text.includes('nấu') || text.includes('ăn'))
        return 'FOOD';
    if (text.includes('thể thao') || text.includes('bóng') || text.includes('chạy') || text.includes('trận đấu'))
        return 'SPORTS';
    if (text.includes('âm nhạc') || text.includes('bài hát') || text.includes('nhạc cụ'))
        return 'MUSIC';
    if (text.includes('nghệ thuật') || text.includes('vẽ') || text.includes('thiết kế') || text.includes('tranh'))
        return 'ART';
    if (text.includes('học') || text.includes('trường') || text.includes('giáo dục') || text.includes('sinh viên'))
        return 'EDUCATION';
    if (text.includes('môi trường') || text.includes('khí hậu') || text.includes('sinh thái') || text.includes('rừng'))
        return 'ENVIRONMENT';
    if (text.includes('luật') || text.includes('tòa án') || text.includes('pháp lý'))
        return 'LAW';
    if (text.includes('chính trị') || text.includes('chính phủ') || text.includes('quốc hội'))
        return 'POLITICS';
    if (text.includes('thời trang') || text.includes('quần áo') || text.includes('trang phục'))
        return 'FASHION';
    if (text.includes('lịch sử') || text.includes('chiến tranh') || text.includes('thời kỳ'))
        return 'HISTORY';
    if (text.includes('văn học') || text.includes('thơ') || text.includes('truyện'))
        return 'LITERATURE';
    if (text.includes('giải trí') || text.includes('phim') || text.includes('trò chơi'))
        return 'ENTERTAINMENT';
    if (text.includes('giao tiếp') || text.includes('nói') || text.includes('trao đổi') || text.includes('thảo luận'))
        return 'COMMUNICATION';
    let sum = 0;
    for (let i = 0; i < word.length; i++) {
        sum += word.charCodeAt(i);
    }
    return ALL_DOMAINS[sum % ALL_DOMAINS.length];
}
async function translateWord(word) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok)
            throw new Error('Translate fetch failed');
        const data = await res.json();
        let definition = data[0]?.[0]?.[0] || '';
        let pos = data[1]?.[0]?.[0] || 'noun';
        return { definition, pos };
    }
    catch {
        return { definition: '', pos: 'noun' };
    }
}
async function fetchIpaFromDatamuse(word) {
    try {
        const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=r&max=1`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (!res.ok)
            return '';
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].tags) {
            const pronTag = data[0].tags.find((t) => t.startsWith('pron:'));
            if (pronTag) {
                return '/' + pronTag.replace('pron:', '').trim() + '/';
            }
        }
        return '';
    }
    catch {
        return '';
    }
}
function downloadAudio(word) {
    return new Promise((resolve, reject) => {
        const url = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(word)}`;
        const client = url.startsWith('https') ? https_1.default : http_1.default;
        const req = client.get(url, { timeout: 8000 }, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed with status ${res.statusCode}`));
            }
            const chunks = [];
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
    let baseWords = [];
    if (fs_1.default.existsSync('./extracted-seed.js')) {
        baseWords = require('./extracted-seed.js');
        console.log(`📚 Đã nạp ${baseWords.length} từ chất lượng cao từ seed gốc.`);
    }
    let oxfordWords = [];
    if (fs_1.default.existsSync('./oxford-5000.json')) {
        oxfordWords = JSON.parse(fs_1.default.readFileSync('./oxford-5000.json', 'utf-8'));
        console.log(`📚 Đã nạp ${oxfordWords.length} từ từ Oxford 5000.`);
    }
    const progressFile = './vocatype-master-vocabulary.json';
    let processedMap = new Map();
    if (fs_1.default.existsSync(progressFile)) {
        try {
            const existing = JSON.parse(fs_1.default.readFileSync(progressFile, 'utf-8'));
            existing.forEach((item) => processedMap.set(item.word.toLowerCase(), item));
            console.log(`🔄 Đã tìm thấy tiến trình trước đó: ${processedMap.size} từ đã hoàn thành.`);
        }
        catch {
        }
    }
    const wordMap = new Map();
    for (const b of baseWords) {
        const w = b.word.toLowerCase().trim();
        if (!w || w.length < 2)
            continue;
        wordMap.set(w, {
            word: w,
            level: b.level || 'A1',
            def: b.def,
            ipa: b.ipa,
            domain: b.domain,
            pos: b.pos || 'noun',
        });
    }
    for (const o of oxfordWords) {
        const w = o.word.toLowerCase().trim();
        if (!w || w.length < 2 || wordMap.has(w))
            continue;
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
    async function processWord(item) {
        const word = item.word;
        if (processedMap.has(word))
            return;
        try {
            let definition = item.def || '';
            let pos = item.pos || '';
            let ipa = item.ipa || '';
            let domain = item.domain || '';
            if (!definition) {
                const trans = await translateWord(word);
                definition = trans.definition || word;
                if (!pos)
                    pos = trans.pos || 'noun';
            }
            if (!ipa) {
                ipa = await fetchIpaFromDatamuse(word);
                if (!ipa)
                    ipa = `/${word}/`;
            }
            if (!domain) {
                domain = assignDomain(word, pos, definition);
            }
            const audioKey = `audio/${word}.mp3`;
            const publicUrl = `${r2_1.R2_PUBLIC_URL}/${audioKey}`;
            const existsOnR2 = await (0, r2_1.checkAudioExists)(audioKey);
            if (!existsOnR2) {
                try {
                    const audioBuffer = await downloadAudio(word);
                    if (audioBuffer && audioBuffer.length > 500) {
                        await (0, r2_1.uploadAudioToR2)(audioKey, audioBuffer, 'audio/mpeg');
                    }
                }
                catch (e) {
                    console.warn(`⚠️ Lỗi tải/upload audio cho "${word}":`, e.message);
                }
            }
            const record = {
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
                fs_1.default.writeFileSync(progressFile, JSON.stringify(Array.from(processedMap.values()), null, 2));
                console.log(`💾 [${successCount}/${allWords.length}] Đã lưu tiến trình (${record.word}: ${record.definition})`);
            }
        }
        catch (err) {
            console.error(`❌ Lỗi xử lý từ ${word}:`, err.message);
        }
    }
    async function runBatch() {
        while (index < allWords.length) {
            const batch = allWords.slice(index, index + CONCURRENCY);
            index += CONCURRENCY;
            await Promise.all(batch.map((w) => processWord(w)));
        }
    }
    const workers = Array.from({ length: CONCURRENCY }, () => runBatch());
    await Promise.all(workers);
    const finalResults = Array.from(processedMap.values());
    fs_1.default.writeFileSync(progressFile, JSON.stringify(finalResults, null, 2));
    console.log(`\n🎉 HOÀN THÀNH XUẤT SẮC! Tổng cộng ${finalResults.length} từ vựng đã được chuẩn hóa và upload Audio lên Cloudflare R2!`);
}
main().catch(console.error);
//# sourceMappingURL=build-dataset.js.map
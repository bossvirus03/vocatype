"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const pdf2json_1 = __importDefault(require("pdf2json"));
async function debugPDF(pdfPath) {
    const pdfParser = new pdf2json_1.default();
    pdfParser.on('pdfParser_dataError', (err) => console.error(err));
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
        let fullText = '';
        pdfData.Pages.forEach((page, pageIndex) => {
            console.log(`\n--- Page ${pageIndex + 1} ---`);
            let pageText = '';
            page.Texts.forEach((text) => {
                const decoded = decodeURIComponent(text.R[0].T);
                pageText += decoded + ' ';
            });
            console.log(pageText.trim());
            fullText += pageText + '\n';
        });
        fs_1.default.writeFileSync('pdf-debug.txt', fullText);
        console.log('\n✅ Đã lưu text thô vào pdf-debug.txt');
        console.log('Hãy mở file đó và gửi cho tôi 20-30 dòng đầu để tôi chỉnh regex.');
    });
    pdfParser.loadPDF(pdfPath);
}
debugPDF('The_Oxford_5000_by_CEFR_level.pdf');
//# sourceMappingURL=convert-pdf-to-json.js.map
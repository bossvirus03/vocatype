import fs from 'fs';
import PDFParser from 'pdf2json';

async function debugPDF(pdfPath: string) {
  const pdfParser = new PDFParser();

  pdfParser.on('pdfParser_dataError', (err: any) => console.error(err));

  pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
    let fullText = '';

    pdfData.Pages.forEach((page: any, pageIndex: number) => {
      console.log(`\n--- Page ${pageIndex + 1} ---`);
      let pageText = '';

      page.Texts.forEach((text: any) => {
        const decoded = decodeURIComponent(text.R[0].T);
        pageText += decoded + ' ';
      });

      console.log(pageText.trim());
      fullText += pageText + '\n';
    });

    // Lưu text thô để xem
    fs.writeFileSync('pdf-debug.txt', fullText);
    console.log('\n✅ Đã lưu text thô vào pdf-debug.txt');
    console.log(
      'Hãy mở file đó và gửi cho tôi 20-30 dòng đầu để tôi chỉnh regex.',
    );
  });

  pdfParser.loadPDF(pdfPath);
}

// Chạy
debugPDF('The_Oxford_5000_by_CEFR_level.pdf'); // thay tên file nếu khác

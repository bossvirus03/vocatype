import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WordsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly levelsMetadata = {
    'A1': { name: 'Cơ bản (A1)', desc: 'Từ vựng rất đơn giản, dành cho người mới bắt đầu' },
    'A2': { name: 'Sơ cấp (A2)', desc: 'Từ vựng cơ bản, giao tiếp hàng ngày đơn giản' },
    'B1': { name: 'Trung cấp (B1)', desc: 'Từ vựng phổ thông, đủ để diễn đạt ý kiến' },
    'B2': { name: 'Trung cấp cấp cao (B2)', desc: 'Từ vựng đa dạng, có thể tranh luận nhiều chủ đề' },
    'C1': { name: 'Cao cấp (C1)', desc: 'Từ vựng học thuật, chuyên sâu và phong phú' },
    'C2': { name: 'Thành thạo (C2)', desc: 'Từ vựng phức tạp, tiệm cận người bản xứ' }
  };

  private readonly domainsMetadata = {
    'LIFE': { name: 'Đời sống (Daily Life)', desc: 'Từ vựng thông dụng trong cuộc sống hàng ngày' },
    'COMMUNICATION': { name: 'Giao tiếp (Communication)', desc: 'Từ vựng dùng trong đàm thoại và thuyết trình' },
    'BUSINESS': { name: 'Kinh doanh (Business)', desc: 'Từ vựng thương mại, tài chính và công sở' },
    'MEDICINE': { name: 'Y học & Sức khỏe (Medicine)', desc: 'Từ vựng chuyên ngành y tế, cơ thể và điều trị' },
    'TECHNOLOGY': { name: 'Công nghệ (Technology)', desc: 'Từ vựng về phần cứng, phần mềm và Internet' },
    'SCIENCE': { name: 'Khoa học (Science)', desc: 'Từ vựng về vật lý, hóa học, sinh học và vũ trụ' },
    'TRAVEL': { name: 'Du lịch (Travel)', desc: 'Từ vựng về khách sạn, hàng không và khám phá địa lý' },
    'FOOD': { name: 'Ẩm thực (Food & Dining)', desc: 'Từ vựng về các món ăn, nhà hàng và nấu nướng' },
    'SPORTS': { name: 'Thể thao (Sports)', desc: 'Từ vựng về các môn thể thao, thi đấu và tập luyện' },
    'ART': { name: 'Nghệ thuật (Art & Design)', desc: 'Từ vựng về hội họa, điêu khắc và thiết kế mỹ thuật' },
    'MUSIC': { name: 'Âm nhạc (Music)', desc: 'Từ vựng về nhạc cụ, thể loại và biểu diễn ca nhạc' },
    'EDUCATION': { name: 'Giáo dục (Education)', desc: 'Từ vựng về trường học, phương pháp dạy và học tập' },
    'ENVIRONMENT': { name: 'Môi trường (Environment)', desc: 'Từ vựng về biến đổi khí hậu, sinh thái và bảo tồn' },
    'POLITICS': { name: 'Chính trị (Politics)', desc: 'Từ vựng về chính phủ, luật lệ và bang giao quốc tế' },
    'FASHION': { name: 'Thời trang (Fashion)', desc: 'Từ vựng về trang phục, xu hướng và may mặc' },
    'FINANCE': { name: 'Tài chính (Finance)', desc: 'Từ vựng về ngân hàng, đầu tư và thị trường chứng khoán' },
    'HISTORY': { name: 'Lịch sử (History)', desc: 'Từ vựng về khảo cổ, sự kiện lịch sử và các triều đại' },
    'LITERATURE': { name: 'Văn học (Literature)', desc: 'Từ vựng về tác phẩm, tác giả và nghiên cứu phê bình' },
    'LAW': { name: 'Pháp luật (Law)', desc: 'Từ vựng về tòa án, hiến pháp và các quy định pháp lý' },
    'ENTERTAINMENT': { name: 'Giải trí (Entertainment)', desc: 'Từ vựng về điện ảnh, gameshow và hoạt động thư giãn' }
  };

  // Lấy danh sách Level và số lượng từ tương ứng
  async getLevels() {
    const counts = await this.prisma.word.groupBy({
      by: ['level'],
      _count: {
        id: true,
      },
    });

    const countMap = counts.reduce((acc, curr) => {
      acc[curr.level] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(this.levelsMetadata).map(key => ({
      id: key,
      ...this.levelsMetadata[key as keyof typeof this.levelsMetadata],
      wordCount: countMap[key] || 0
    }));
  }

  // Lấy danh sách Lĩnh vực và số lượng từ tương ứng
  async getDomains() {
    const counts = await this.prisma.word.groupBy({
      by: ['domain'],
      _count: {
        id: true,
      },
    });

    const countMap = counts.reduce((acc, curr) => {
      acc[curr.domain] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(this.domainsMetadata).map(key => ({
      id: key,
      ...this.domainsMetadata[key as keyof typeof this.domainsMetadata],
      wordCount: countMap[key] || 0
    }));
  }

  // Tìm kiếm từ vựng, hỗ trợ lọc theo Level và Domain
  async findAll(level?: string, domain?: string) {
    const filter: any = {};
    if (level) {
      filter.level = level.toUpperCase();
    }
    if (domain) {
      filter.domain = domain.toUpperCase();
    }
    return this.prisma.word.findMany({
      where: filter,
      orderBy: { word: 'asc' },
    });
  }

  // Lấy ngẫu nhiên N từ để luyện tập gõ (Luôn ưu tiên các từ thông dụng nhất của Level)
  async getRandom(level?: string, domain?: string, count: number = 10) {
    const filter: any = {};
    const lvl = level ? level.toUpperCase() : 'ALL';
    if (lvl !== 'ALL') {
      filter.level = lvl;
    }
    if (domain && domain.toUpperCase() !== 'ALL') {
      filter.domain = domain.toUpperCase();
    }

    const total = await this.prisma.word.count({ where: filter });
    if (total === 0) {
      throw new BadRequestException('Không tìm thấy từ vựng cho tiêu chí này');
    }

    // Giới hạn pool chỉ trong nhóm từ thông dụng nhất của Level đó
    let maxCommonRank = 300;
    if (lvl === 'A1') maxCommonRank = 250;
    else if (lvl === 'A2') maxCommonRank = 400;
    else if (lvl === 'B1') maxCommonRank = 600;
    else if (lvl === 'B2') maxCommonRank = 900;
    else if (lvl === 'C1') maxCommonRank = 1400;
    else if (lvl === 'C2') maxCommonRank = 2500;
    else maxCommonRank = 300; // ALL

    const poolSize = Math.min(total, maxCommonRank);
    const fetchSize = Math.min(poolSize, Math.max(count * 2, 30));
    const maxSkip = Math.max(0, poolSize - fetchSize);
    const skip = Math.floor(Math.random() * (maxSkip + 1));

    const sampleWords = await this.prisma.word.findMany({
      where: filter,
      skip,
      take: fetchSize,
      orderBy: { rank: 'asc' },
    });

    const shuffled = sampleWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Lấy danh sách từ vựng cho bài học cụ thể (từ 1 đến 20), sắp xếp các từ thông dụng nhất lên trước
  async getLessonWords(level: string, lessonNo: number, userId?: number) {
    if (lessonNo < 1 || lessonNo > 20) {
      throw new BadRequestException('Mã bài học phải từ 1 đến 20');
    }

    const filter: any = { level: level.toUpperCase() };

    let favoriteDomains: string[] = [];
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { favoriteDomains: true },
      });
      if (user && user.favoriteDomains?.length > 0) {
        favoriteDomains = user.favoriteDomains.map(d => d.toUpperCase());
      }
    }

    const wordsPerLesson = 15;

    // Nếu user có domain yêu thích, ưu tiên lấy từ domain yêu thích trước (theo rank thông dụng)
    if (favoriteDomains.length > 0) {
      const favWords = await this.prisma.word.findMany({
        where: { ...filter, domain: { in: favoriteDomains } },
        skip: (lessonNo - 1) * wordsPerLesson,
        take: wordsPerLesson,
        orderBy: [{ rank: 'asc' }, { word: 'asc' }],
      });

      if (favWords.length >= wordsPerLesson) {
        return favWords;
      }

      const remaining = wordsPerLesson - favWords.length;
      const otherWords = await this.prisma.word.findMany({
        where: { ...filter, domain: { notIn: favoriteDomains } },
        skip: (lessonNo - 1) * remaining,
        take: remaining,
        orderBy: [{ rank: 'asc' }, { word: 'asc' }],
      });

      return [...favWords, ...otherWords];
    }

    // Mặc định lấy bài học: Các bài học đầu (bài 1, 2, 3...) luôn là các từ thông dụng nhất của level đó
    const totalLevelWords = await this.prisma.word.count({ where: filter });
    if (totalLevelWords === 0) {
      throw new BadRequestException('Không tìm thấy từ vựng cho cấp độ này');
    }

    const skip = ((lessonNo - 1) * wordsPerLesson) % Math.max(1, totalLevelWords - wordsPerLesson);
    return this.prisma.word.findMany({
      where: filter,
      skip,
      take: wordsPerLesson,
      orderBy: [{ rank: 'asc' }, { word: 'asc' }],
    });
  }

  // Phục vụ audio phát âm trực tiếp từ Cloudflare R2
  async streamAudio(word: string, res: any) {
    const cleanWord = word.toLowerCase().trim();
    const audioKey = `audio/${cleanWord}.mp3`;

    try {
      const { getAudioStreamFromR2 } = await import('../utils/r2.js');
      const r2Audio = await getAudioStreamFromR2(audioKey);

      if (r2Audio && r2Audio.stream) {
        res.setHeader('Content-Type', r2Audio.contentType || 'audio/mpeg');
        if (r2Audio.contentLength) {
          res.setHeader('Content-Length', r2Audio.contentLength);
        }
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return r2Audio.stream.pipe(res);
      }

      // Tự động lưu cache vào Cloudflare R2 trong nền để các lần nghe sau được phục vụ trực tiếp từ R2
      import('../utils/r2.js').then(async ({ uploadAudioToR2 }) => {
        try {
          const https = await import('https');
          const voiceUrl = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(cleanWord)}`;
          https.get(voiceUrl, (voiceRes) => {
            if (voiceRes.statusCode === 200) {
              const chunks: Buffer[] = [];
              voiceRes.on('data', (c: Buffer) => chunks.push(c));
              voiceRes.on('end', () => {
                const buffer = Buffer.concat(chunks);
                if (buffer.length > 500) {
                  uploadAudioToR2(audioKey, buffer, 'audio/mpeg').catch(() => {});
                }
              });
            }
          });
        } catch {}
      });

      // Chuyển hướng ngay lập tức để phát âm không bị gián đoạn
      const fallbackUrl = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(cleanWord)}`;
      return res.redirect(fallbackUrl);
    } catch {
      return res.status(404).send('Không tìm thấy audio phát âm');
    }
  }
}


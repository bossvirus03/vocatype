"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WordsService = class WordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    levelsMetadata = {
        'A1': { name: 'Cơ bản (A1)', desc: 'Từ vựng rất đơn giản, dành cho người mới bắt đầu' },
        'A2': { name: 'Sơ cấp (A2)', desc: 'Từ vựng cơ bản, giao tiếp hàng ngày đơn giản' },
        'B1': { name: 'Trung cấp (B1)', desc: 'Từ vựng phổ thông, đủ để diễn đạt ý kiến' },
        'B2': { name: 'Trung cấp cấp cao (B2)', desc: 'Từ vựng đa dạng, có thể tranh luận nhiều chủ đề' },
        'C1': { name: 'Cao cấp (C1)', desc: 'Từ vựng học thuật, chuyên sâu và phong phú' },
        'C2': { name: 'Thành thạo (C2)', desc: 'Từ vựng phức tạp, tiệm cận người bản xứ' }
    };
    domainsMetadata = {
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
        }, {});
        return Object.keys(this.levelsMetadata).map(key => ({
            id: key,
            ...this.levelsMetadata[key],
            wordCount: countMap[key] || 0
        }));
    }
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
        }, {});
        return Object.keys(this.domainsMetadata).map(key => ({
            id: key,
            ...this.domainsMetadata[key],
            wordCount: countMap[key] || 0
        }));
    }
    async findAll(level, domain) {
        const filter = {};
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
    async getRandom(level, domain, count = 10) {
        const filter = {};
        if (level) {
            filter.level = level.toUpperCase();
        }
        if (domain) {
            filter.domain = domain.toUpperCase();
        }
        const words = await this.prisma.word.findMany({
            where: filter,
        });
        if (words.length === 0) {
            throw new common_1.BadRequestException('Không tìm thấy từ vựng cho tiêu chí này');
        }
        const shuffled = [...words].sort(() => 0.5 - Math.random());
        const selected = [];
        while (selected.length < count) {
            selected.push(...shuffled);
        }
        return selected.slice(0, count);
    }
    async getLessonWords(level, lessonNo, userId) {
        if (lessonNo < 1 || lessonNo > 20) {
            throw new common_1.BadRequestException('Mã bài học phải từ 1 đến 20');
        }
        const filter = { level: level.toUpperCase() };
        const allWords = await this.prisma.word.findMany({
            where: filter,
            orderBy: { word: 'asc' },
        });
        if (allWords.length === 0) {
            throw new common_1.BadRequestException('Không tìm thấy từ vựng cho cấp độ này');
        }
        let favoriteDomains = [];
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { favoriteDomains: true },
            });
            if (user) {
                favoriteDomains = user.favoriteDomains.map(d => d.toUpperCase());
            }
        }
        const prioritizedWords = [...allWords].sort((a, b) => {
            const aIsFav = favoriteDomains.includes(a.domain.toUpperCase()) ? 1 : 0;
            const bIsFav = favoriteDomains.includes(b.domain.toUpperCase()) ? 1 : 0;
            return bIsFav - aIsFav;
        });
        const totalWords = prioritizedWords.length;
        const wordsPerLesson = Math.max(12, Math.min(15, Math.ceil(totalWords / 20)));
        let startIdx = ((lessonNo - 1) * wordsPerLesson) % totalWords;
        let lessonWords = prioritizedWords.slice(startIdx, startIdx + wordsPerLesson);
        if (lessonWords.length < wordsPerLesson) {
            const needed = wordsPerLesson - lessonWords.length;
            lessonWords = [...lessonWords, ...prioritizedWords.slice(0, needed)];
        }
        return lessonWords;
    }
};
exports.WordsService = WordsService;
exports.WordsService = WordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WordsService);
//# sourceMappingURL=words.service.js.map
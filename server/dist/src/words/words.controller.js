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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordsController = void 0;
const common_1 = require("@nestjs/common");
const words_service_1 = require("./words.service");
const jwt_auth_optional_guard_1 = require("../auth/jwt-auth-optional.guard");
const user_decorator_1 = require("../auth/user.decorator");
let WordsController = class WordsController {
    wordsService;
    constructor(wordsService) {
        this.wordsService = wordsService;
    }
    async getLevels() {
        return this.wordsService.getLevels();
    }
    async getDomains() {
        return this.wordsService.getDomains();
    }
    async findAll(level, domain) {
        return this.wordsService.findAll(level, domain);
    }
    async getRandom(level, domain, count) {
        return this.wordsService.getRandom(level, domain, count);
    }
    async getLesson(level, lessonNo, user) {
        return this.wordsService.getLessonWords(level, lessonNo, user?.userId);
    }
    async getAudio(word, res) {
        return this.wordsService.streamAudio(word, res);
    }
};
exports.WordsController = WordsController;
__decorate([
    (0, common_1.Get)('levels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "getLevels", null);
__decorate([
    (0, common_1.Get)('domains'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "getDomains", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('random'),
    (0, common_1.UseGuards)(jwt_auth_optional_guard_1.JwtAuthOptionalGuard),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('domain')),
    __param(2, (0, common_1.Query)('count', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "getRandom", null);
__decorate([
    (0, common_1.Get)('lesson'),
    (0, common_1.UseGuards)(jwt_auth_optional_guard_1.JwtAuthOptionalGuard),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('lessonNo', common_1.ParseIntPipe)),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "getLesson", null);
__decorate([
    (0, common_1.Get)('audio/:word'),
    __param(0, (0, common_1.Param)('word')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "getAudio", null);
exports.WordsController = WordsController = __decorate([
    (0, common_1.Controller)('words'),
    __metadata("design:paramtypes", [words_service_1.WordsService])
], WordsController);
//# sourceMappingURL=words.controller.js.map
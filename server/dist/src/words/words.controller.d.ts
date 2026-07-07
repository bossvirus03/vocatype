import { WordsService } from './words.service';
export declare class WordsController {
    private readonly wordsService;
    constructor(wordsService: WordsService);
    getLevels(): Promise<({
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    })[]>;
    getDomains(): Promise<({
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    } | {
        wordCount: number;
        name: string;
        desc: string;
        id: string;
    })[]>;
    findAll(level?: string, domain?: string): Promise<{
        example: string;
        word: string;
        id: number;
        level: string;
        domain: string;
        ipa: string;
        definition: string;
        exampleTranslation: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRandom(level?: string, domain?: string, count?: number): Promise<{
        example: string;
        word: string;
        id: number;
        level: string;
        domain: string;
        ipa: string;
        definition: string;
        exampleTranslation: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getLesson(level: string, lessonNo: number, user?: any): Promise<{
        example: string;
        word: string;
        id: number;
        level: string;
        domain: string;
        ipa: string;
        definition: string;
        exampleTranslation: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}

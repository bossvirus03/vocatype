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
        definition: string;
        domain: string;
        id: number;
        word: string;
        level: string;
        ipa: string;
        partOfSpeech: string | null;
        synonyms: string[];
        example: string;
        exampleTranslation: string;
        additionalExamples: string[];
        audioUrl: string | null;
        rank: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getRandom(level?: string, domain?: string, count?: number): Promise<{
        definition: string;
        domain: string;
        id: number;
        word: string;
        level: string;
        ipa: string;
        partOfSpeech: string | null;
        synonyms: string[];
        example: string;
        exampleTranslation: string;
        additionalExamples: string[];
        audioUrl: string | null;
        rank: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getLesson(level: string, lessonNo: number, user?: any): Promise<{
        definition: string;
        domain: string;
        id: number;
        word: string;
        level: string;
        ipa: string;
        partOfSpeech: string | null;
        synonyms: string[];
        example: string;
        exampleTranslation: string;
        additionalExamples: string[];
        audioUrl: string | null;
        rank: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAudio(word: string, res: any): Promise<any>;
}

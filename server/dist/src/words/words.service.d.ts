import { PrismaService } from '../prisma/prisma.service';
export declare class WordsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly levelsMetadata;
    private readonly domainsMetadata;
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
    getLessonWords(level: string, lessonNo: number, userId?: number): Promise<{
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

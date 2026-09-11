import { S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
export declare const R2_BUCKET: string;
export declare const R2_PUBLIC_URL: string;
export declare const s3Client: S3Client;
export declare function checkAudioExists(key: string): Promise<boolean>;
export declare function uploadAudioToR2(key: string, buffer: Buffer, contentType?: string): Promise<string>;
export declare function getAudioStreamFromR2(key: string): Promise<{
    stream: Readable;
    contentLength?: number;
    contentType?: string;
} | null>;

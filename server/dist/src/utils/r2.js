"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.R2_PUBLIC_URL = exports.R2_BUCKET = void 0;
exports.checkAudioExists = checkAudioExists;
exports.uploadAudioToR2 = uploadAudioToR2;
exports.getAudioStreamFromR2 = getAudioStreamFromR2;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const accountId = process.env.R2_ACCOUNT_ID || '5650e3a8b5c944019e3ce90d359709f4';
const accessKeyId = process.env.R2_ACCESS_KEY || '2454d1fe3cb2a04e2c07dc5748077db0';
const secretAccessKey = process.env.R2_SECRET_KEY || '6950cc887d74b1b6a7450b0f7a12d3a8c0c0492441383bcf5a59dd53e9c5fc33';
exports.R2_BUCKET = process.env.R2_BUCKET || 'vocatype';
exports.R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || 'https://pub-1366610845f540478990dea3a41db20c.r2.dev').replace(/\/$/, '');
exports.s3Client = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
async function checkAudioExists(key) {
    try {
        await exports.s3Client.send(new client_s3_1.HeadObjectCommand({
            Bucket: exports.R2_BUCKET,
            Key: key,
        }));
        return true;
    }
    catch (e) {
        return false;
    }
}
async function uploadAudioToR2(key, buffer, contentType = 'audio/mpeg') {
    await exports.s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: exports.R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }));
    return `${exports.R2_PUBLIC_URL}/${key}`;
}
async function getAudioStreamFromR2(key) {
    try {
        const res = await exports.s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: exports.R2_BUCKET,
            Key: key,
        }));
        return {
            stream: res.Body,
            contentLength: res.ContentLength,
            contentType: res.ContentType || 'audio/mpeg',
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=r2.js.map
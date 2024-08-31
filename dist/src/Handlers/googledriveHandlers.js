"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_DRIVE_PRIVATE_KEY = void 0;
exports.createAudioFile = createAudioFile;
exports.listAndShareAudioFiles = listAndShareAudioFiles;
exports.createFolder = createFolder;
exports.deleteFolder = deleteFolder;
exports.getAllFilesInGoogleDriveFolder = getAllFilesInGoogleDriveFolder;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const Handlers_1 = require("../Handlers");
const extras_1 = require("../Helpers/extras");
exports.GOOGLE_DRIVE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5AIp9TJFU+KWo\nNRBW05llxSCCCEA8+/jmR1ddkveZ+++VKOBfLIKu+7rI5yQzogsoyJuiW72UzmUX\n7yS4My6Iem6+hF/YXXvslPWvTRBGEHF3QLRT77apYX8pzhdwSv577xBNzuLZqza5\neGVbwZ5jmoQyKKCMtT+b0eQy8Rd0zUkNQGxKufXWXvkVHrn7a2zMxc7Zg46kYbFu\nsJcQ2Oiij09yMUfR57HDyLxzToIX12Rf0qneAb/XUgSoXVBiPaOf03xlzNfnTPRi\nEPfC4ONKv56X6WMzTlu00wKO7P2Ko32vLUOQl2yZIolU2iqmM5Es2V629zEkKTfk\nyHQAV/IrAgMBAAECggEAF5eTkZ4BjJH24if+MOxkC//jAOIXew9w8sDXSdYToD3q\nFB312v08nx7392XOjo0UGjvW6RIE76SQbMhw6NKSFRJz6/TKmjd1tbpbSGMt95li\nNuB3/po7s4b85fJjt8zAfkKC1EFVWYfFf0p0topO7gnG4PSgYME+XtsZ3Es1gA3z\n9SLZEMfXFd7p0zddeuQZjFYStzUwwQDAHnQmaNw0Uk8VcTOatqsGQbWkecppp8Uk\njAP4MsUJJD3mQJ7dcIVfjei2vvat25y8qPEsNNflqS2IT8wVomFOAZ3TmtPknx8Z\n2+7Eo5IsJpyEFgr40i2ZmOre0v4rg42+H6f4MYXoeQKBgQDymRrY4KZfSBzIC90e\nTk20UWsm1LR6F11D8tezF14yQOZG3FL8Tw43+y3kHCD4MyknQpgBz0jp/gah8A6t\npI4y3ohjbkdqMFcNhdW0xQsT8WFvXCUu+2yqe9Yrx8NJEZiM4b8C2L6m9IQduvgX\n5mZRf1L4AKvSFKPdUQyLrNL4swKBgQDDOOWQ2kv0HLV3SObrJBXJ/VGG0kFKLhtC\nbOgC3aHSp1Vy3elTJS/6/nkNoCEiehM0ZQ8H+MCWduP9g5JvmxAAvlgz8o+uH4Rj\nwN4fgT1fsjkXKZ7hyngMgYMWr2iTtlwJiT3mOSl6dyg1Zb8/8OAUFtIVXCG6YW+l\nbW1IK+EsqQKBgQCszIOEAZhf/ASMNW8d/BZ7HxdcxFt9L5E+KgacSUPONc4QoTT3\nBPSSyXYpqiONxxtEHLobZ+N+0HM2+7/ozXKAJ2QststlhuMq/a54IXY/kUqewJq3\nuVzwnl6yNosSS9dGWjHtPCeo0jgc2SWIGJO+7xtRDWFVtV/275kpEEQB4wKBgB1u\nPm2P+1NZ4KGTA/z++6nv3pKMr/sW6FUjRfboorS3NVKT0dEPEiSsqGM9eMFR1gNY\nGOQCxEXqtoRJiZH5tnfmOjXao36EkdjYAqSNP0tl+uVbCPDRLTf1bmXFG+bo3wcx\nAXvrsi0cOZuTMznYfm+I4TMHKK6IceRmkssGknPBAoGAfLcrsPiwHMjRMfD42/pt\nv05lvTRL5Fwmg3WUNjtWaiyLk35TKrhwh3mIu76E+AZD7Jtucw51bgshzXT8Wg1A\nw5nNEAQrMoIIFwuXRuWqR8mhycKt0JGfVKVXhd541Hpxmh9muYgRlwM1Yco2H7sk\nD6VGignP68dKK4FwcfVfrJA=\n-----END PRIVATE KEY-----\n";
async function uploadFileToResumableSession(uploadUrl, filePath) {
    const fileStream = fs_1.default.createReadStream(filePath);
    const fileSize = fs_1.default.statSync(filePath).size;
    const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Length": fileSize.toString(),
            "Content-Type": "application/octet-stream",
        },
        body: fileStream,
    });
    if (!res.ok) {
        throw new Error(`Failed to upload file: ${res.statusText}`);
    }
    const fileData = await res.json();
    console.log("Uploaded file data:", fileData);
}
async function createAudioFile(audioFile) {
    const drive = googleapis_1.google.drive({ version: "v3", auth: Handlers_1.auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const filePath = audioFile.path;
    const fileName = audioFile.hapi.filename;
    const mimeType = audioFile.hapi.headers["content-type"];
    if (!folderId) {
        throw new Error("GOOGLE_DRIVE_FOLDER_ID is not defined");
    }
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };
    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType: mimeType,
                body: fs_1.default.createReadStream(filePath),
            },
            fields: "id",
            uploadType: "resumable",
        });
        const uploadUrl = response.headers.location;
        console.log("Resumable upload URL: ", uploadUrl);
        await uploadFileToResumableSession(uploadUrl, audioFile.path);
        console.log("File ID: ", response.data.id);
        return response.data.id;
    }
    catch (error) {
        console.error("Error uploading file: ", error);
    }
}
;
async function listAndShareAudioFiles() {
    // Initialize the Drive API client
    const drive = googleapis_1.google.drive({
        version: "v3",
        auth: Handlers_1.auth,
    });
    // Define the folder ID and MIME types for audio files
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // Replace with your actual folder ID
    try {
        // List files in the folder
        const listParams = {
            q: `'${folderId}' in parents and mimeType contains 'audio/' and trashed = false`,
            fields: 'files(id, name, mimeType)',
        };
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log('Audio files in the folder:', listResults.length);
        console.log(listResults);
        // Filter audio files
        const audioFiles = listResults.filter(file => extras_1.audioMimeTypes.includes(file.mimeType));
        // Share files and get links
        for (const file of audioFiles) {
            const fileId = file.id;
            if (!fileId) {
                console.warn(`File ID is missing for file: ${file.name}`);
                continue;
            }
            else {
                console.log(`Sharing fileId: ${fileId}`);
                // Set file permissions to public
                await drive.permissions.create({
                    fileId: file.id,
                    requestBody: {
                        role: "reader",
                        type: "anyone",
                    },
                });
                // Generate shareable link
                const link = `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
                console.log(`Name: ${file.name}, Shareable Link: ${link}`);
            }
        }
    }
    catch (error) {
        console.error('Error listing or sharing audio files:', error);
    }
}
async function createFolder(folderName) {
    const drive = googleapis_1.google.drive({ version: "v3", auth: Handlers_1.auth });
    const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
    };
    try {
        const folder = await drive.files.create({
            fields: "id",
            requestBody: fileMetadata,
        });
        console.log("Folder ID:", folder.data.id);
    }
    catch (error) {
        console.error("Error creating folder:", error);
    }
}
;
async function deleteFolder(folderId) {
    const drive = googleapis_1.google.drive({ version: "v3", auth: Handlers_1.auth });
    try {
        await drive.files.delete({
            fileId: folderId,
        });
        console.log("Folder deleted successfully");
    }
    catch (error) {
        console.error("Error deleting folder:", error);
    }
}
async function getAllFilesInGoogleDriveFolder() {
    const drive = googleapis_1.google.drive({ version: "v3", auth: Handlers_1.auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const listParams = {
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
    };
    try {
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log('Files in the folder:', listResults.length);
        console.log(listResults);
    }
    catch (error) {
        console.error('Error listing files:', error);
    }
}
//# sourceMappingURL=googledriveHandlers.js.map
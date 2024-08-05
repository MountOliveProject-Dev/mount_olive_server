"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAndShareAudioFiles = listAndShareAudioFiles;
exports.createAudioFile = createAudioFile;
exports.createFolder = createFolder;
exports.getAllFilesInGoogleDriveFolder = getAllFilesInGoogleDriveFolder;
const googleapis_1 = require("googleapis");
const Helpers_1 = require("../Helpers");
async function listAndShareAudioFiles() {
    // Initialize the Drive API client
    const drive = googleapis_1.google.drive({
        version: "v3",
        auth: Helpers_1.auth,
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
        const audioFiles = listResults.filter(file => Helpers_1.audioMimeTypes.includes(file.mimeType));
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
async function createAudioFile(audioFile) {
    const drive = googleapis_1.google.drive({ version: "v3", auth: Helpers_1.auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
        throw new Error("GOOGLE_DRIVE_FOLDER_ID is not defined");
    }
    const fileMetadata = {
        name: audioFile.name,
        parents: [folderId],
    };
    const media = {
        mimeType: audioFile.mimeType,
        body: audioFile.body,
    };
    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        console.log("File ID: ", response.data.id);
    }
    catch (error) {
        console.error("Error uploading file: ", error);
    }
    //1U_jSHkOwMQXhZif1Ah27BF32p0JsoUcx
}
;
async function createFolder(folderName) {
    const drive = googleapis_1.google.drive({ version: "v3", auth: Helpers_1.auth });
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
async function getAllFilesInGoogleDriveFolder() {
}
//# sourceMappingURL=googledriveHandlers.js.map
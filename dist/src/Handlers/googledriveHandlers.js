"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolder = createFolder;
exports.getFolder = getFolder;
exports.createAudioFile = createAudioFile;
exports.listAndShareAudioFiles = listAndShareAudioFiles;
exports.deleteFolder = deleteFolder;
exports.getAllFilesInGoogleDriveFolder = getAllFilesInGoogleDriveFolder;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const extras_1 = require("../Helpers/extras");
const credentialsString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log("Raw credentials string:", credentialsString);
let credentials;
try {
    credentials = JSON.parse(credentialsString || "{}");
    console.log("Parsed credentials:", credentials);
}
catch (error) {
    console.error("Error parsing credentials:", error);
}
// Check if required fields are present
if (!credentials.client_email) {
    console.error("client_email is missing from the credentials");
}
// Initialize the Google Drive API client
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
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
async function createFolder(request, h) {
    const { name } = request.payload;
    const fileMetadata = { name, mimeType: 'application/vnd.google-apps.folder', };
    try {
        const file = await drive.files.create({ requestBody: fileMetadata, fields: 'id', });
        return h.response({ message: "The folder " + name + "has been created successfully!!" }).code(201);
    }
    catch (error) {
        console.error('Error creating folder:', error);
        return h.response('Error creating folder').code(500);
    }
}
;
async function getFolder(request, h) {
    const { folderId } = request.params;
    try {
        const folder = await drive.files.get({ fileId: folderId, fields: 'id, name, mimeType', });
        return h.response(folder.data).code(200);
    }
    catch (error) {
        console.error('Error getting folder:', error);
        return h.response('Error getting folder').code(500);
    }
}
async function createAudioFile(audioFile) {
    const drive = googleapis_1.google.drive({ version: "v3", auth });
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
        auth,
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
// export async function createFolder(folderName: string) {
//   const drive = google.drive({ version: "v3", auth });
//   const fileMetadata = {
//     name: folderName,
//     mimeType: "application/vnd.google-apps.folder",
//   };
//   try {
//     const folder = await drive.files.create({
//       fields: "id",
//       requestBody: fileMetadata,
//     });
//     console.log("Folder ID:", folder.data.id);
//   } catch (error) {
//     console.error("Error creating folder:", error);
//   }
// };
async function deleteFolder(folderId) {
    const drive = googleapis_1.google.drive({ version: "v3", auth });
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
    const drive = googleapis_1.google.drive({ version: "v3", auth });
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
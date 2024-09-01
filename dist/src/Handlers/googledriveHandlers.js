"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioMimeTypes = void 0;
exports.createFolder = createFolder;
exports.getFolder = getFolder;
exports.deleteFolder = deleteFolder;
exports.createAudioFile = createAudioFile;
exports.listAndShareAudioFiles = listAndShareAudioFiles;
exports.getAllFilesInGoogleDriveFolder = getAllFilesInGoogleDriveFolder;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.audioMimeTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/vnd.wave",
    "audio/ogg",
    "audio/flac",
    "audio/aac",
    "audio/x-aac",
];
const credentials = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("Raw credentials string:", credentials);
if (!credentials.project_id) {
    console.error("project_id is missing from the credentials");
}
if (!credentials.private_key_id) {
    console.error("private_key_id is missing from the credentials");
}
if (!credentials.private_key) {
    console.error("private_key is missing from the credentials");
}
if (!credentials.client_email) {
    console.error("client_email is missing from the credentials");
}
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
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
    const fileMetadata = {
        name,
        mimeType: "application/vnd.google-apps.folder",
    };
    try {
        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: "id",
        });
        console.log("Folder ID: ", file.data.id);
        return h
            .response({
            message: `The folder ${name} has been created successfully!!`,
        })
            .code(201);
    }
    catch (error) {
        console.error("Error creating folder:", error);
        return h.response("Error creating folder").code(500);
    }
}
async function getFolder(request, h) {
    const { folderId } = request.params;
    try {
        const folder = await drive.files.get({
            fileId: folderId,
            fields: "id, name, mimeType",
        });
        return h.response(folder.data).code(200);
    }
    catch (error) {
        console.error("Error getting folder:", error);
        return h.response("Error getting folder").code(500);
    }
}
async function deleteFolder(request, h) {
    const { folderId } = request.params;
    try {
        await drive.files.delete({
            fileId: folderId,
        });
        return h.response("Folder deleted successfully").code(200);
    }
    catch (error) {
        console.error("Error deleting folder:", error);
        return h.response("Error deleting folder").code(500);
    }
}
async function createAudioFile(audioFile) {
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
        });
        console.log("File ID: ", response.data.id);
        return response.data.id;
    }
    catch (error) {
        console.error("Error uploading file: ", error);
    }
}
async function listAndShareAudioFiles() {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    try {
        const listParams = {
            q: `'${folderId}' in parents and mimeType contains 'audio/' and trashed = false`,
            fields: "files(id, name, mimeType)",
        };
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log("Audio files in the folder:", listResults.length);
        console.log(listResults);
        const audioFiles = listResults.filter((file) => exports.audioMimeTypes.includes(file.mimeType));
        for (const file of audioFiles) {
            const fileId = file.id;
            if (!fileId) {
                console.warn(`File ID is missing for file: ${file.name}`);
                continue;
            }
            else {
                console.log(`Sharing fileId: ${fileId}`);
                await drive.permissions.create({
                    fileId: file.id,
                    requestBody: {
                        role: "reader",
                        type: "anyone",
                    },
                });
                const link = `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
                console.log(`Name: ${file.name}, Shareable Link: ${link}`);
            }
        }
    }
    catch (error) {
        console.error("Error listing or sharing audio files:", error);
    }
}
async function getAllFilesInGoogleDriveFolder() {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const listParams = {
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType)",
    };
    try {
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log("Files in the folder:", listResults.length);
        console.log(listResults);
    }
    catch (error) {
        console.error("Error listing files:", error);
    }
}
//# sourceMappingURL=googledriveHandlers.js.map
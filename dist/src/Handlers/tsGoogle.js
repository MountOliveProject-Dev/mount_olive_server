"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
// Configure the Google Drive API client
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID,
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
});
const drive = googleapis_1.google.drive({ version: 'v3', auth });
async function createFile(folderId) {
    const fileMetadata = {
        name: "sample-file.txt",
        parents: [folderId],
    };
    const media = {
        mimeType: "text/plain",
        body: "Hello, World!",
    };
    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id",
    });
    console.log(response);
}
async function createFolder(name) {
    const fileMetadata = {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
    };
    const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
    });
    console.log(response);
    return response.data.id;
}
async function listFiles() {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const response = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: "files(id, name)",
    });
    console.log(response.data.files);
}
const folderId = createFolder("sample-folder");
createFile(folderId === null || folderId === void 0 ? void 0 : folderId.toString());
listFiles();
//# sourceMappingURL=tsGoogle.js.map
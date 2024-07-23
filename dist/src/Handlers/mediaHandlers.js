"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllVideoMediaHandler = exports.listAllAudioMediaHandler = exports.uploadAudioToGoogleDrive = void 0;
const Helpers_1 = require("../Helpers");
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CREDENTIALS_PATH = "path/to/your/credentials.json";
// Path to token.json for storing access and refresh tokens
const TOKEN_PATH = "path/to/your/token.json";
// Assuming you have a function to authenticate and get an auth client
async function getAuthenticatedClient() {
    // Your authentication logic here
    // This typically involves creating an OAuth2 client with your credentials
    // and obtaining an access token
    const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token
    let token;
    try {
        token = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
    }
    catch (error) {
        return new Error("Token file not found. You need to generate a new token.");
    }
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}
const uploadAudioToGoogleDrive = async (request, h) => {
    const file = request.payload.file; // Assuming the file is coming from the request payload
    const auth = await getAuthenticatedClient();
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    const fileMetadata = {
        name: "audio-file-name.mp3", // You can dynamically set the name based on the file details
        parents: ["your-folder-id"], // Optional: Specify if you want to upload to a specific folder
    };
    const media = {
        mimeType: "audio/mpeg", // Adjust based on your audio file type
        body: fs_1.default.createReadStream(path_1.default.join(__dirname, "path-to-your-audio-file")),
    };
    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id", // Specify the fields you want in the response
        });
        console.log("File ID: ", response.data.id); // Do something with the response, like sending the file ID back to the client
        return h.response({ fileId: response.data.id }).code(200);
    }
    catch (error) {
        console.error("Error uploading file: ", error);
        return h.response({ error: "Error uploading file" }).code(500);
    }
};
exports.uploadAudioToGoogleDrive = uploadAudioToGoogleDrive;
const listAllAudioMediaHandler = async (request, h) => {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_1.MediaType.AUDIO
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        if (!media) {
            console.log("No audio media found");
            return h.response({ message: "No audio media found" }).code(404);
        }
        return h.response(media).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get all audio media" }).code(500);
    }
};
exports.listAllAudioMediaHandler = listAllAudioMediaHandler;
const listAllVideoMediaHandler = async (request, h) => {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_1.MediaType.VIDEO
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        if (!media) {
            console.log("No video media found");
            return h.response({ message: "No video media found" }).code(404);
        }
        return h.response(media).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get all video media" }).code(500);
    }
};
exports.listAllVideoMediaHandler = listAllVideoMediaHandler;
//# sourceMappingURL=mediaHandlers.js.map
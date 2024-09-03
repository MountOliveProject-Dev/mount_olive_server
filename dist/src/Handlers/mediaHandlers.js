"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeAudioFileHandler = exports.listAllVideoMediaHandler = void 0;
exports.createFolder = createFolder;
exports.deleteFolder = deleteFolder;
exports.deleteManyFromGoogleDrive = deleteManyFromGoogleDrive;
exports.getAllFolders = getAllFolders;
exports.getAllFoldersInGoogleDrive = getAllFoldersInGoogleDrive;
exports.createVideoMediaHandler = createVideoMediaHandler;
exports.updateVideoMediaHandler = updateVideoMediaHandler;
exports.deleteVideoMediaHandler = deleteVideoMediaHandler;
exports.listAllAudioMediaHandler = listAllAudioMediaHandler;
exports.pushAudioToDriveHandler = pushAudioToDriveHandler;
exports.updateAudioFile = updateAudioFile;
const server_1 = __importDefault(require("../server"));
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const get_audio_duration_1 = require("get-audio-duration");
const dotenv_1 = __importDefault(require("dotenv"));
const Helpers_1 = require("../Helpers");
const notificationHandlers_1 = require("./notificationHandlers");
dotenv_1.default.config();
/**
 *
 *  Utils
 *
*/
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
async function createFolder(request, h) {
    const { prisma } = request.server.app;
    const { type, name } = request.payload;
    //check if name is it the format of folderType
    if (type !== Helpers_1.folderType.Audios && type !== Helpers_1.folderType.Images) {
        return h.response({ message: "Invalid folder type" }).code(400);
    }
    const fileMetadata = {
        name: name,
        mimeType: "application/vnd.google-apps.folder",
    };
    try {
        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: "id",
        });
        if (!file) {
            console.log("Failed to create folder");
            return h.response({ message: "Failed to create folder" }).code(400);
        }
        const folderId = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "create", {
            data: {
                folderId: file.data.id,
                name: name,
                folderType: type,
            },
        });
        if (!folderId) {
            console.log("Failed to create folder");
        }
        console.log("The folder " +
            name +
            " with Unique ID: " +
            file.data.id +
            " has been created successfully!!");
        return h
            .response({
            message: `The folder ${name} with Unique ID: ${file.data.id} has been created successfully!!`,
        })
            .code(201);
    }
    catch (error) {
        console.error("Error creating folder:", error);
        return h.response("Error creating folder").code(500);
    }
}
async function deleteFolder(request, h) {
    const { prisma } = request.server.app;
    const { folderId } = request.params;
    try {
        const deleteFolder = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "delete", {
            where: {
                folderId: folderId,
            },
        });
        if (deleteFolder) {
            const deleteFromGoogle = await drive.files.delete({
                fileId: folderId,
            });
            if (!deleteFromGoogle) {
                console.log("Failed to delete folder");
                return h.response({ message: "Failed to delete folder" }).code(400);
            }
            return h.response("Folder deleted successfully").code(200);
        }
        else {
            console.log("Failed to delete folder");
            return h.response({ message: "Failed to delete folder" }).code(400);
        }
    }
    catch (error) {
        console.error("Error deleting folder:", error);
        return h.response("Error deleting folder").code(500);
    }
}
async function deleteManyFromGoogleDrive(request, h) {
    try {
        const folders = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder'",
            fields: "files(id, name)",
        });
        if (!folders || !folders.data.files) {
            console.log("No folders found");
            return h.response({ message: "No folders found" }).code(404);
        }
        const folderIds = folders.data.files
            .map((folder) => folder.id)
            .filter((id) => id !== null && id !== undefined);
        for (let i = 0; i < folderIds.length; i++) {
            const deleteFolder = await drive.files.delete({
                fileId: folderIds[i],
            });
            if (!deleteFolder) {
                console.log("Failed to delete folder");
                return h
                    .response({ message: "Failed to delete the folder " })
                    .code(400);
            }
        }
        return h.response("All folders deleted successfully").code(200);
    }
    catch (error) {
        console.error("Error deleting folders:", error);
        return h.response("Error deleting folders").code(500);
    }
}
async function getAllFolders(request, h) {
    const { prisma } = request.server.app;
    try {
        const folders = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "findMany", {
            select: {
                folderId: true,
                name: true,
                folderType: true,
            },
        });
        return h.response(folders).code(200);
    }
    catch (error) {
        console.error("Error getting folders:", error);
        return h.response("Error getting folders").code(500);
    }
}
async function getAllFoldersInGoogleDrive(request, h) {
    try {
        const folders = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder'",
            fields: "files(id, name)",
        });
        return h.response(folders.data.files).code(200);
    }
    catch (error) {
        console.error("Error getting folders:", error);
        return h.response("Error getting folders").code(500);
    }
}
async function createAudioFile(name, description, duration, mimeType, path) {
    try {
        const prisma = server_1.default.app.prisma;
        const folderInfo = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "findFirst", {
            where: {
                folderType: Helpers_1.folderType.Audios,
            },
        });
        if (!folderInfo) {
            throw new Error("Audio folder not found");
        }
        const audioName = name + "-" + Date.now();
        const fileMetadata = {
            name: audioName,
            parents: [folderInfo.folderId],
        };
        const media = {
            mimeType: mimeType,
            body: fs_1.default.createReadStream(path),
        };
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        if (!response.data.id) {
            throw new Error("Failed to upload file to Google Drive");
        }
        // Set the file's sharing permissions to "anyone with the link"
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });
        // Get the shareable link
        const shareableLink = `https://drive.google.com/file/d/${response.data.id}/view?usp=sharing`;
        console.log(`The audio file ${name} with Unique ID: ${response.data.id} has been created successfully!`);
        const audio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "create", {
            data: {
                type: Helpers_1.MediaType.AUDIO,
                title: name,
                description: description || "No description provided",
                duration: duration || " 0 sec",
                url: shareableLink,
                fileId: response.data.id,
                postedAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
                storageFolder: {
                    connect: {
                        folderId: folderInfo.folderId,
                    },
                },
            },
        });
        if (!audio) {
            console.log("Failed to create audio media");
            throw new Error("Failed to create audio media");
        }
        const type = Helpers_1.NotificationType.AUDIO;
        const read = false;
        const notificationTitle = "A New Audio titled " + name + " has just been posted!";
        const specialKey = audio.uniqueId + Helpers_1.NotificationType.AUDIO;
        const notification = await (0, notificationHandlers_1.createMediaNotificationHandler)(audio.uniqueId, specialKey, notificationTitle, description, read, type);
        console.log(notification);
        if (!notification) {
            console.log("Failed to create notification for video media");
        }
        return shareableLink;
    }
    catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        throw error;
    }
}
// Helper function to format duration
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    let formatted = "";
    if (hours > 0) {
        formatted += `${hours}h `;
    }
    if (minutes > 0 || hours > 0) {
        formatted += `${minutes}m `;
    }
    formatted += `${secs}s`;
    return formatted.trim();
}
async function getDuration(filePath) {
    try {
        const duration = await (0, get_audio_duration_1.getAudioDurationInSeconds)(filePath);
        const formattedDuration = formatDuration(duration);
        console.log(`Duration: ${formattedDuration}`);
        return formattedDuration;
    }
    catch (error) {
        console.error("Error getting audio duration:", error);
        throw error;
    }
}
/**
 *
 *  create video media
 *
*/
//create Video media
async function createVideoMediaHandler(request, h) {
    const { prisma } = request.server.app;
    const { url, title, description } = request.payload;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "create", {
            data: {
                url: url,
                type: Helpers_1.MediaType.VIDEO,
                title: title,
                description: description,
                postedAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)()
            }
        });
        if (!media) {
            console.log("Failed to create video media");
            return h.response({ message: "Failed to create video media" }).code(400);
        }
        const type = Helpers_1.NotificationType.VIDEO;
        const read = false;
        const notificationTitle = "A New Video titled " + title + " has just been posted!";
        const specialKey = media.uniqueId + Helpers_1.NotificationType.VIDEO;
        const notification = await (0, notificationHandlers_1.createMediaNotificationHandler)(media.uniqueId, specialKey, notificationTitle, description, read, type);
        console.log(notification);
        if (!notification) {
            console.log("Failed to create notification for video media");
            return h.response({ message: "Failed to create notification for video media" }).code(400);
        }
        return h.response({ message: "The video was posted successfully" }).code(201);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to create video media" }).code(500);
    }
}
// update video media
async function updateVideoMediaHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId, url, title, description } = request.payload;
    try {
        const findMedia = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
            select: {
                mediaNotifications: {
                    select: {
                        notificationId: true,
                    },
                },
            },
        });
        if (!findMedia) {
            return h.response({ message: "Media not found" }).code(404);
        }
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "update", {
            where: {
                id: findMedia.id,
                uniqueId: uniqueId,
            },
            data: {
                url: url,
                description: description,
                title: title,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        if (!media) {
            console.log("Failed to update video media");
            return h.response({ message: "Failed to update video media" }).code(400);
        }
        const notificationTitle = "The Video titled " + title + " has just been updated!";
        const specialKey = media.uniqueId + Helpers_1.NotificationType.VIDEO;
        const notification = await (0, notificationHandlers_1.updateMediaNotificationHandler)(findMedia.mediaNotifications.notificationId, media.uniqueId, specialKey, notificationTitle, description, false, Helpers_1.NotificationType.VIDEO);
        if (!notification) {
            console.log("Failed to update notification for video media");
            return h.response({ message: "Failed to update notification for video media" }).code(400);
        }
        return h.response({ message: "The video was updated successfully" }).code(201);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to update video media" }).code(500);
    }
}
// delete video media
async function deleteVideoMediaHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId } = request.payload;
    try {
        const findMedia = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
            select: {
                id: true,
                mediaNotifications: {
                    select: {
                        notificationId: true,
                    },
                },
            },
        });
        if (!findMedia) {
            return h.response({ message: "Media not found" }).code(404);
        }
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "delete", {
            where: {
                id: findMedia.id
            }
        });
        if (!media) {
            console.log("Failed to delete video media");
            return h.response({ message: "Failed to delete video media" }).code(400);
        }
        const specialKey = findMedia.uniqueId + Helpers_1.NotificationType.VIDEO;
        const notification = await (0, notificationHandlers_1.deleteMediaNotificationHandler)(findMedia.mediaNotifications.notificationId, findMedia.uniqueId, specialKey, Helpers_1.NotificationType.VIDEO);
        if (!notification) {
            console.log("Failed to delete notification for video media");
            return h.response({ message: "Failed to delete notification for video media" }).code(400);
        }
        return h.response({ message: "The video was deleted successfully" }).code(201);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to delete video media" }).code(500);
    }
}
//list all video media
const listAllVideoMediaHandler = async (request, h) => {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_1.MediaType.VIDEO
            },
            orderBy: {
                postedAt: "desc"
            },
            select: {
                id: true,
                uniqueId: true,
                title: true,
                description: true,
                url: true,
                postedAt: true,
                updatedAt: true
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
/**
 *
 *  create audio media in google drive
 *
*/
// export const createAudioMediaHandler: Hapi.Lifecycle.Method = async (
//   request: Hapi.Request,
//   h: Hapi.ResponseToolkit
// ) => {
//   const { audioFile, name, description } = request.payload as AudioPayload;
//   console.log("...about to upload file to google drive");
//   if (!audioFile) {
//     return h.response({ error: "No file uploaded" }).code(400);
//   }
//   const filename = audioFile.hapi.filename;
//   const mimeType = audioFile.hapi.headers["content-type"];
//   console.log("File name:", filename);
//   const uploadsDir = path.join(__dirname, "uploads");
//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
//   }
//   const filePath = path.join(uploadsDir, filename);
//   console.log("File path:", filePath);
//   try {
//     // Wrap file writing in a promise to wait until it's fully completed
//     await new Promise<void>((resolve, reject) => {
//       const fileStream = fs.createWriteStream(filePath);
//       audioFile.pipe(fileStream);
//       fileStream.on("error", (err) => {
//         console.error("Error writing file:", err);
//         reject(err);
//       });
//       fileStream.on("finish", () => {
//         console.log("...file uploaded to server");
//         resolve();
//       });
//     });
//     console.log("...file done processing, about to upload to google drive");
//     // Use music-metadata to get the duration
//   //  const buffer = fs.readFileSync(filePath);
//   //  const metadata = audioMetadata.parse(buffer, mimeType);
//     const duration =  0;
//     console.log("Duration:", duration);
//     // Upload the file to Google Drive
//     const fileDetails = await createAudioFile(
//       audioFile,
//       name,
//       description,
//       duration,
//       mimeType,
//       filePath
//     );
//     console.log("File details:", fileDetails);
//     // Remove the file from the 'uploads' directory after processing
//     if (filePath && typeof filePath === "string") {
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.error("Error deleting file:", err);
//         }
//       });
//     }
//     console.log("File written successfully to uploads folder");
//     return h.response(fileDetails).code(200);
//   } catch (error) {
//     console.error("Error during file processing:", error);
//     return h
//       .response({ error: "Failed to upload file to Google Drive" })
//       .code(500);
//   }
// };
//list all audios
async function listAllAudioMediaHandler(request, h) {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_1.MediaType.AUDIO
            },
            orderBy: {
                postedAt: "desc"
            },
            select: {
                id: true,
                uniqueId: true,
                title: true,
                description: true,
                url: true,
                duration: true,
                postedAt: true,
                updatedAt: true
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
}
//upload audio to server
const storeAudioFileHandler = async (request, h) => {
    const { audioFile } = request.payload;
    if (!audioFile) {
        return h.response({ error: "No file uploaded" }).code(400);
    }
    const filename = audioFile.hapi.filename;
    const mimeType = audioFile.hapi.headers["content-type"];
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir);
    }
    const filePath = path.join(uploadsDir, filename);
    try {
        await new Promise((resolve, reject) => {
            const fileStream = fs_1.default.createWriteStream(filePath);
            audioFile.pipe(fileStream);
            fileStream.on("error", (err) => {
                console.error("Error writing file:", err);
                reject(err);
            });
            fileStream.on("finish", () => {
                resolve();
            });
        });
        console.log("filePath:" + filePath, "mimeType:" + mimeType, "filename:" + filename);
        return h.response({ filePath, mimeType, filename }).code(200);
    }
    catch (error) {
        console.error("Error during file processing:", error);
        return h.response({ error: "Failed to store file" }).code(500);
    }
};
exports.storeAudioFileHandler = storeAudioFileHandler;
//upload audio to google drive
async function pushAudioToDriveHandler(request, h) {
    const { name, description, filePath, mimeType } = request.payload;
    try {
        // Ensure the filePath is provided and is a string
        if (!filePath || typeof filePath !== 'string') {
            return h.response({ error: 'Invalid file path' }).code(400);
        }
        let duration = '';
        try {
            duration = await getDuration(filePath);
        }
        catch (durationError) {
            console.warn("Could not calculate duration, proceeding without it:", durationError);
        }
        const shareableLink = await createAudioFile(name, description, duration, mimeType, filePath);
        // Remove the file from the 'uploads' directory after processing
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });
        return h.response({ shareableLink }).code(200);
    }
    catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        return h
            .response({ error: "Failed to upload file to Google Drive" })
            .code(500);
    }
}
;
//update audio
async function updateAudioFile(request, h) {
    const prisma = request.server.app.prisma;
    const { uniqueId, name, description, filePath, mimeType } = request.payload;
    try {
        const findAudioId = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
            where: {
                uniqueId: uniqueId,
                type: Helpers_1.MediaType.AUDIO
            }, select: {
                fileId: true,
                id: true
            }
        });
        if (!findAudioId) {
            console.log("Audio not found");
            return h.response({ message: "Audio not found" }).code(404);
        }
        await drive.files.delete({
            fileId: findAudioId.fileId
        });
        await (0, Helpers_1.executePrismaMethod)(prisma, "media", "delete", {
            where: {
                id: findAudioId.id
            }
        });
        const durat = getDuration(filePath);
        const duration = durat.toString();
        const shareableLink = await createAudioFile(name, description, duration, mimeType, filePath);
        // Remove the file from the 'uploads' directory after processing
        if (filePath && typeof filePath === "string") {
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting file:", err);
                }
            });
        }
        return h.response({ shareableLink }).code(200);
    }
    catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        return h
            .response({ error: "Failed to upload file to Google Drive" })
            .code(500);
    }
}
//# sourceMappingURL=mediaHandlers.js.map
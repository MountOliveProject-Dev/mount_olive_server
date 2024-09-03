"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioMediaHandler = exports.listAllVideoMediaHandler = void 0;
exports.createVideoMediaHandler = createVideoMediaHandler;
exports.updateVideoMediaHandler = updateVideoMediaHandler;
exports.deleteVideoMediaHandler = deleteVideoMediaHandler;
exports.createFolder = createFolder;
exports.deleteFolder = deleteFolder;
exports.deleteManyFromGoogleDrive = deleteManyFromGoogleDrive;
exports.getAllFolders = getAllFolders;
exports.getAllFoldersInGoogleDrive = getAllFoldersInGoogleDrive;
exports.listAllAudioMediaHandler = listAllAudioMediaHandler;
const server_1 = __importDefault(require("../server"));
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const dotenv_1 = __importDefault(require("dotenv"));
const Helpers_1 = require("../Helpers");
const multer_1 = __importDefault(require("multer"));
const notificationHandlers_1 = require("./notificationHandlers");
const upload = (0, multer_1.default)({ dest: "uploads/" });
dotenv_1.default.config();
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
            }
        });
        if (!folderId) {
            console.log("Failed to create folder");
        }
        console.log("The folder " + name + " with Unique ID: " + file.data.id + " has been created successfully!!");
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
        const folderIds = folders.data.files.map((folder) => folder.id).filter((id) => id !== null && id !== undefined);
        for (let i = 0; i < folderIds.length; i++) {
            const deleteFolder = await drive.files.delete({
                fileId: folderIds[i],
            });
            if (!deleteFolder) {
                console.log("Failed to delete folder");
                return h.response({ message: "Failed to delete the folder " }).code(400);
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
async function createAudioFile(file, name, description, duration) {
    try {
        const prisma = server_1.default.app.prisma;
        const folderInfo = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "findFirst", {
            where: {
                folderType: Helpers_1.folderType.Audios,
            },
        });
        if (description === undefined || description === null) {
            description = "No description provided";
        }
        if (duration === undefined || duration === null) {
            duration = 0;
        }
        if (!folderInfo) {
            throw new Error("Audio folder not found");
        }
        if (!file) {
            throw new Error("No file uploaded");
        }
        const audioName = name + "-" + Date.now();
        const fileMetadata = {
            name: audioName,
            parents: [folderInfo.folderId],
        };
        const media = {
            mimeType: file.mimetype,
            body: fs_1.default.createReadStream(file.path),
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
                description: description,
                duration: duration,
                url: shareableLink,
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
        return shareableLink;
    }
    catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        throw error;
    }
}
const createAudioMediaHandler = async (request, h) => {
    const { audioFile, name, description } = request.payload;
    const file = audioFile.path;
    console.log(file, name, description, audioFile);
    try {
        const uploadMiddleware = upload.single("audioFile"); // 'audioFile' is the key for the file in the form data
        // Multer middleware processing
        await new Promise((resolve, reject) => {
            console.log("no error yet!");
            uploadMiddleware(request, h, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(null);
                console.log("no error yet!");
            });
        });
        console.log("no error yet!");
        if (!audioFile) {
            return h.response({ error: "No file uploaded" }).code(400);
        }
        const duration = await new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default.ffprobe(file, (err, metadata) => {
                if (err) {
                    return reject(err);
                }
                resolve(metadata.format.duration);
            });
        });
        console.log("Duration:", duration);
        // Upload the file to Google Drive
        const fileDetails = await createAudioFile(audioFile, name, description, duration);
        console.log("File details:", fileDetails);
        // Respond with the file ID from Google Drive
        return h.response(fileDetails).code(200);
    }
    catch (error) {
        // Remove the file from the 'uploads' directory
        fs_1.default.unlink(file, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });
        return h
            .response({ error: "Failed to upload file to Google Drive" })
            .code(500);
    }
};
exports.createAudioMediaHandler = createAudioMediaHandler;
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
//# sourceMappingURL=mediaHandlers.js.map
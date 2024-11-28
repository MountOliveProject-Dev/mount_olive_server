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
exports.storeThumbnailFileHandler = exports.storeAudioFileHandler = exports.listAllVideoMediaHandler = void 0;
exports.deleteGoogleDriveFolder = deleteGoogleDriveFolder;
exports.createFolder = createFolder;
exports.deleteFolder = deleteFolder;
exports.deleteManyFromGoogleDrive = deleteManyFromGoogleDrive;
exports.getAllFolders = getAllFolders;
exports.getAllFoldersInGoogleDrive = getAllFoldersInGoogleDrive;
exports.deleteThumbnailFromDrive = deleteThumbnailFromDrive;
exports.deleteThumbnailFromDriveHandler = deleteThumbnailFromDriveHandler;
exports.updateThumbnailHelper = updateThumbnailHelper;
exports.createThumbnailFile = createThumbnailFile;
exports.createVideoMediaHandler = createVideoMediaHandler;
exports.updateVideoMediaHandler = updateVideoMediaHandler;
exports.deleteVideoMediaHandler = deleteVideoMediaHandler;
exports.listAllAudioMediaHandler = listAllAudioMediaHandler;
exports.listAllImageMediaHandler = listAllImageMediaHandler;
exports.deleteAudioFileHandler = deleteAudioFileHandler;
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
const eventHandlers_1 = require("./eventHandlers");
dotenv_1.default.config();
/**
 *
 *  Utils
 *
*/
const credentials = {
    type: process.env.GOOGLE_TYPE,
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
    (0, Helpers_1.log)(Helpers_1.RequestType.READ, "project_id is missing from the credentials", Helpers_1.LogType.ERROR);
}
if (!credentials.private_key_id) {
    (0, Helpers_1.log)(Helpers_1.RequestType.READ, "private_key_id is missing from the credentials", Helpers_1.LogType.ERROR);
}
if (!credentials.private_key) {
    (0, Helpers_1.log)(Helpers_1.RequestType.READ, "private_key is missing from the credentials", Helpers_1.LogType.ERROR);
}
if (!credentials.client_email) {
    (0, Helpers_1.log)(Helpers_1.RequestType.READ, "client_email is missing from the credentials", Helpers_1.LogType.ERROR);
}
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = googleapis_1.google.drive({ version: "v3", auth });
async function deleteGoogleDriveFolder(request, h) {
    const { folderId } = request.params;
    try {
        const deleteFolder = await drive.files.delete({
            fileId: folderId,
        });
        if (!deleteFolder) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete folder", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to delete folder" }).code(400);
        }
        return h.response("Folder with Id " + folderId + " deleted successfully").code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete folder with Id " + folderId + "", Helpers_1.LogType.ERROR, error.toString());
        return h.response("Error deleting folder").code(500);
    }
}
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
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create folder", Helpers_1.LogType.ERROR);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create folder", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to create folder" }).code(400);
        }
        console.log("The folder " +
            name +
            " with Unique ID: " +
            file.data.id +
            " has been created successfully!!");
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Folder created successfully", Helpers_1.LogType.INFO);
        return h
            .response({
            message: `The folder ${name} with Unique ID: ${file.data.id} has been created successfully!!`,
        })
            .code(201);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create folder", Helpers_1.LogType.ERROR, error.toString());
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
                (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete folder", Helpers_1.LogType.ERROR);
                return h.response({ message: "Failed to delete folder" }).code(400);
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Folder deleted successfully", Helpers_1.LogType.INFO);
            return h.response("Folder deleted successfully").code(200);
        }
        else {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete folder", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to delete folder" }).code(400);
        }
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete folder", Helpers_1.LogType.ERROR, error.toString());
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
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "No folders found", Helpers_1.LogType.ERROR);
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
                (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the folder", Helpers_1.LogType.ERROR);
                return h
                    .response({ message: "Failed to delete the folder " })
                    .code(400);
            }
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "All folders deleted successfully", Helpers_1.LogType.INFO);
        return h.response("All folders deleted successfully").code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete folders", Helpers_1.LogType.ERROR, error.toString());
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
        if (!folders || folders.length === 0) {
            let details = "No folders found found in the database";
            let logtype = Helpers_1.LogType.WARNING;
            if (!folders) {
                details = "failed to get folders from the database:" + folders;
                logtype = Helpers_1.LogType.ERROR;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No folders found", logtype, details.toString());
            return h.response({ message: "No folders found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Folders found", Helpers_1.LogType.INFO);
        return h.response(folders).code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Failed to get folders", Helpers_1.LogType.ERROR, error.toString());
        return h.response("Error getting folders").code(500);
    }
}
async function getAllFoldersInGoogleDrive(request, h) {
    var _a;
    try {
        const folders = await drive.files.list({
            q: "mimeType='application/vnd.google-apps.folder'",
            fields: "files(id, name)",
        });
        if (!folders || !folders.data.files || folders.data.files.length === 0) {
            let details = "failed to get folders from Google Drive" + folders;
            let logtype = Helpers_1.LogType.ERROR;
            if (((_a = folders.data.files) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                details = "No folders found in Google Drive";
                logtype = Helpers_1.LogType.WARNING;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No folders found", logtype, details.toString());
            return h.response({ message: "No folders found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Folders found", Helpers_1.LogType.INFO);
        return h.response(folders.data.files).code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Failed to get folders", Helpers_1.LogType.ERROR, error.toString());
        return h.response("Error getting folders").code(500);
    }
}
async function createAudioFile(name, description, duration, mimeType, path, host) {
    try {
        const prisma = server_1.default.app.prisma;
        const folderInfo = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "findFirst", {
            where: {
                folderType: Helpers_1.folderType.Audios,
            },
        });
        if (!folderInfo) {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Audio folder not found", Helpers_1.LogType.ERROR);
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
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, `The audio file ${name} with Unique ID: ${response.data.id} has been created successfully!`, Helpers_1.LogType.INFO);
        const audio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "create", {
            data: {
                type: Helpers_1.MediaType.AUDIO,
                title: name,
                description: description || "No description provided",
                duration: duration || " 0 sec",
                url: shareableLink,
                host: host,
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
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create audio media", Helpers_1.LogType.ERROR);
            throw new Error("Failed to create audio media");
        }
        const type = Helpers_1.NotificationType.AUDIO;
        const read = false;
        const notificationTitle = "A New Audio titled " + name + " has just been posted!";
        const specialKey = audio.uniqueId + Helpers_1.NotificationType.AUDIO;
        const notification = await (0, notificationHandlers_1.createMediaNotificationHandler)(audio.uniqueId, specialKey, notificationTitle, description, read, type);
        if (!notification) {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create notification for audio media", Helpers_1.LogType.ERROR);
        }
        return shareableLink;
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create audio media", Helpers_1.LogType.ERROR, error.toString());
        throw error;
    }
}
async function deleteAudioFileFromDrive(fileId) {
    try {
        const deleteFile = await drive.files.delete({
            fileId: fileId,
        });
        if (!deleteFile) {
            console.log("Failed to delete file");
            return false;
        }
        return true;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
async function deleteThumbnailFromDrive(fileId) {
    try {
        const deleteFile = await drive.files.delete({
            fileId: fileId,
        });
        if (!deleteFile) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the image with id: " + fileId + " from Google Drive", Helpers_1.LogType.ERROR);
            return false;
        }
        return true;
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the image with id: " + fileId + " from Google Drive", Helpers_1.LogType.ERROR, err.toString());
        throw err;
    }
}
async function deleteThumbnailFromDriveHandler(request, h) {
    const { Id } = request.params;
    ;
    try {
        const deleteFile = await drive.files.delete({
            fileId: Id,
        });
        if (!deleteFile) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the image with id: " + Id + " from Google Drive", Helpers_1.LogType.ERROR);
            return h.response({ message: "Error deleting image" }).code(400);
        }
        return h.response({ message: "Image deleted successfully" }).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the image with id: " + Id + " from Google Drive", Helpers_1.LogType.ERROR, err.toString());
        return h.response({ message: "Error deleting image" }).code(500);
    }
}
async function updateAudioFileHelper(uniqueId, name, description, mimeType, findAudioId, path, reUploadMedia, host) {
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
        if (reUploadMedia === true) {
            await drive.files.delete({
                fileId: findAudioId,
            });
            const durat = getDuration(path);
            const duration = durat.toString();
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
            console.log(`The audio file ${name} with Unique ID: ${response.data.id} has been updated successfully!`);
            const findAudio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
                where: {
                    uniqueId: uniqueId,
                    type: Helpers_1.MediaType.AUDIO,
                },
            });
            if (!findAudio) {
                console.log("Audio not found");
                throw new Error("Audio not found");
            }
            const audio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "update", {
                where: {
                    uniqueId: uniqueId,
                    type: Helpers_1.MediaType.AUDIO,
                },
                data: {
                    title: name || findAudio.title,
                    description: description || findAudio.description,
                    duration: duration || " 0 sec",
                    url: shareableLink,
                    host: host || findAudio.host,
                    fileId: response.data.id,
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            });
            if (!audio) {
                console.log("Failed to update audio media");
                throw new Error("Failed to update audio media");
            }
            const type = Helpers_1.NotificationType.AUDIO;
            const read = false;
            const notificationTitle = "The Audio titled " + findAudio.title + " has just been updated!";
            const specialKey = audio.uniqueId + Helpers_1.NotificationType.AUDIO;
            const getNotification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findFirst", {
                where: {
                    notificationEngagements: {
                        specialKey: specialKey,
                    },
                },
            });
            const notification = await (0, notificationHandlers_1.updateMediaNotificationHandler)(getNotification.id, findAudio.id, specialKey, notificationTitle, description || findAudio.description, read, type);
            console.log(notification);
            if (!notification) {
                console.log("Failed to create notification for audio media");
            }
            // Remove the file from the 'uploads' directory after processing
            if (path && typeof path === "string") {
                fs_1.default.unlink(path, (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                    }
                });
            }
            return shareableLink;
        }
        else if (reUploadMedia === false) {
            const findAudio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
                where: {
                    uniqueId: uniqueId,
                    type: Helpers_1.MediaType.AUDIO,
                },
            });
            if (!findAudio) {
                console.log("Audio not found");
                throw new Error("Audio not found");
            }
            const audio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "update", {
                where: {
                    uniqueId: uniqueId,
                    type: Helpers_1.MediaType.AUDIO,
                },
                data: {
                    title: name || findAudio.title,
                    description: description || findAudio.description,
                    host: host || findAudio.host,
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            });
            if (!audio) {
                console.log("Failed to update audio media");
                throw new Error("Failed to update audio media");
            }
            const type = Helpers_1.NotificationType.AUDIO;
            const read = false;
            const notificationTitle = "The Audio titled " + findAudio.title + " has just been updated!";
            const specialKey = audio.uniqueId + Helpers_1.NotificationType.AUDIO;
            const getNotification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findFirst", {
                where: {
                    notificationEngagements: {
                        specialKey: specialKey,
                    }
                },
            });
            const notification = await (0, notificationHandlers_1.updateMediaNotificationHandler)(getNotification.id, findAudio.id, specialKey, notificationTitle, description || findAudio.description, read, type);
            console.log(notification);
            if (!notification) {
                console.log("Failed to create notification for audio media");
            }
            return findAudio.url;
        }
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}
async function updateThumbnailHelper(fileId, name, mimeType, path, reUploadMedia) {
    try {
        const prisma = server_1.default.app.prisma;
        const description = "Thumbnail for an event";
        const folderInfo = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "findFirst", {
            where: {
                folderId: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID,
                folderType: Helpers_1.folderType.Images,
            },
        });
        if (!folderInfo) {
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Thumbnail folder not found", Helpers_1.LogType.ERROR);
            throw new Error("Thumbnail folder not found");
        }
        if (reUploadMedia === true) {
            if (fileId === "") {
                const link = await (0, eventHandlers_1.pushThumbnailToDriveHandler)(name, path, mimeType);
                if (!link) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to upload thumbnail to Google Drive", Helpers_1.LogType.ERROR);
                    return "Error updating thumbnail";
                }
                const thumbnail = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "create", {
                    data: {
                        type: Helpers_1.MediaType.IMAGE,
                        title: name,
                        description: description,
                        url: link,
                        fileId: fileId,
                        postedAt: (0, Helpers_1.getCurrentDate)(),
                        updatedAt: (0, Helpers_1.getCurrentDate)(),
                        storageFolder: {
                            connect: {
                                folderId: folderInfo.folderId,
                            },
                        },
                    },
                });
                if (!thumbnail) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create thumbnail media", Helpers_1.LogType.ERROR);
                    throw new Error("Failed to create thumbnail media");
                }
                return link;
            }
            else if (fileId !== "" || fileId !== null) {
                {
                    const findThumbnailInDrive = await drive.files.get({
                        fileId: fileId,
                        fields: "id, name",
                    });
                    if (!findThumbnailInDrive) {
                        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Thumbnail found in Google Drive", Helpers_1.LogType.INFO);
                        return "Thumbnail not found";
                    }
                    const findThumbnail = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
                        where: {
                            fileId: fileId,
                            type: Helpers_1.MediaType.IMAGE,
                        },
                    });
                    if (!findThumbnail) {
                        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Thumbnail not found", Helpers_1.LogType.ERROR);
                        return "Thumbnail not found";
                    }
                    const deleteThumbnail = await drive.files.delete({
                        fileId: fileId,
                    });
                    if (!deleteThumbnail) {
                        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Thumbnail not found in Google Drive", Helpers_1.LogType.ERROR);
                        return "Failed to delete existing thumbnail";
                    }
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Thumbnail deleted successfully from Google Drive", Helpers_1.LogType.INFO);
                    const link = await (0, eventHandlers_1.pushThumbnailToDriveHandler)(name, path, mimeType);
                    if (!link) {
                        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to upload thumbnail to Google Drive", Helpers_1.LogType.ERROR);
                        return "Error updating thumbnail";
                    }
                    const newId = await (0, eventHandlers_1.extractFileIdFromDriveLink)(link);
                    if (!newId) {
                        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to extract file id from link", Helpers_1.LogType.ERROR);
                        return "Error updating thumbnail";
                    }
                    const deleteThumbnailFromDB = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "update", {
                        where: {
                            fileId: fileId,
                            type: Helpers_1.MediaType.IMAGE,
                            uniqueId: findThumbnail.uniqueId,
                        },
                        data: {
                            fileId: newId,
                            url: link,
                            updatedAt: (0, Helpers_1.getCurrentDate)(),
                        },
                    });
                    if (!deleteThumbnailFromDB) {
                        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update thumbnail from Db", Helpers_1.LogType.ERROR);
                        return "Failed to update existing thumbnail";
                    }
                    return link;
                }
            }
        }
        else {
            const getLink = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
                where: {
                    fileId: fileId,
                    type: Helpers_1.MediaType.IMAGE,
                },
            });
            if (!getLink) {
                (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Thumbnail not found", Helpers_1.LogType.ERROR);
                return "Thumbnail not found";
            }
            return getLink.url;
        }
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update thumbnail", Helpers_1.LogType.ERROR, err);
        throw err;
    }
}
async function createThumbnailFile(name, mimeType, path) {
    try {
        const prisma = server_1.default.app.prisma;
        const folderInfo = await (0, Helpers_1.executePrismaMethod)(prisma, "folder", "findFirst", {
            where: {
                folderId: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID,
                folderType: Helpers_1.folderType.Images,
            },
        });
        if (!folderInfo) {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Image folder not found", Helpers_1.LogType.ERROR);
            throw new Error("Image folder not found");
        }
        const thumbnailName = name + "-" + Date.now();
        const fileMetadata = {
            name: thumbnailName,
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
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to upload file to Google Drive", Helpers_1.LogType.ERROR);
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
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, `The thumbnail ${name} with Unique ID: ${response.data.id} has been created successfully!`, Helpers_1.LogType.INFO);
        const description = "Thumbnail for an event";
        const thumbnail = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "create", {
            data: {
                type: Helpers_1.MediaType.IMAGE,
                title: name,
                description: description,
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
        if (!thumbnail) {
            console.log("Failed to create thumbnail media");
            throw new Error("Failed to create thumbnail media");
        }
        return shareableLink;
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Error uploading file to Google Drive", Helpers_1.LogType.ERROR, error);
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
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, `Audio duration: ${formattedDuration}`, Helpers_1.LogType.INFO);
        return formattedDuration;
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Error getting audio duration", Helpers_1.LogType.ERROR, error);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create video media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to create video media" }).code(400);
        }
        const type = Helpers_1.NotificationType.VIDEO;
        const read = false;
        const notificationTitle = "A New Video titled " + title + " has just been posted!";
        const specialKey = media.uniqueId + Helpers_1.NotificationType.VIDEO;
        const notification = await (0, notificationHandlers_1.createMediaNotificationHandler)(media.uniqueId, specialKey, notificationTitle, description, read, type);
        if (!notification) {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create notification for video media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to create notification for video media" }).code(400);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Video media created successfully", Helpers_1.LogType.INFO);
        return h.response({ message: "The video was posted successfully" }).code(201);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create video media", Helpers_1.LogType.ERROR, err);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Media not found", Helpers_1.LogType.ERROR);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update video media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to update video media" }).code(400);
        }
        const notificationTitle = "The Video titled " + title + " has just been updated!";
        const specialKey = media.uniqueId + Helpers_1.NotificationType.VIDEO;
        const notification = await (0, notificationHandlers_1.updateMediaNotificationHandler)(findMedia.mediaNotifications.notificationId, media.uniqueId, specialKey, notificationTitle, description, false, Helpers_1.NotificationType.VIDEO);
        if (!notification) {
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update notification for video media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to update notification for video media" }).code(400);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Video media updated successfully", Helpers_1.LogType.INFO);
        return h.response({ message: "The video was updated successfully" }).code(201);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update video media", Helpers_1.LogType.ERROR, err);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Media not found", Helpers_1.LogType.ERROR);
            return h.response({ message: "Media not found" }).code(404);
        }
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "delete", {
            where: {
                id: findMedia.id
            }
        });
        if (!media) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete video media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to delete video media" }).code(400);
        }
        const specialKey = findMedia.uniqueId + Helpers_1.NotificationType.VIDEO;
        const notification = await (0, notificationHandlers_1.deleteMediaNotificationHandler)(findMedia.mediaNotifications.notificationId, findMedia.uniqueId, specialKey, Helpers_1.NotificationType.VIDEO);
        if (!notification) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete notification for video media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to delete notification for video media" }).code(400);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Video media deleted successfully", Helpers_1.LogType.INFO);
        return h.response({ message: "The video was deleted successfully" }).code(201);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete video media", Helpers_1.LogType.ERROR, err);
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
                updatedAt: "desc"
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
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No video media found", Helpers_1.LogType.ERROR);
            return h.response({ message: "No video media found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Video media found", Helpers_1.LogType.INFO);
        return h.response(media).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Failed to get all video media", Helpers_1.LogType.ERROR, err);
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
//audio media
const storeAudioFileHandler = async (request, h) => {
    const { audioFile } = request.payload;
    if (!audioFile) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "No file uploaded", Helpers_1.LogType.ERROR);
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
        const details = "filePath:" + filePath + " ,mimeType:" + mimeType + " ,filename:" + filename;
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "File uploaded successfully", Helpers_1.LogType.INFO, details);
        return h.response({ filePath, mimeType, filename }).code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to store file", Helpers_1.LogType.ERROR, error);
        return h.response({ error: "Failed to store file" }).code(500);
    }
};
exports.storeAudioFileHandler = storeAudioFileHandler;
async function listAllAudioMediaHandler(request, h) {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_1.MediaType.AUDIO
            },
            orderBy: {
                updatedAt: "desc"
            },
            select: {
                id: true,
                uniqueId: true,
                title: true,
                description: true,
                url: true,
                duration: true,
                host: true,
                postedAt: true,
                updatedAt: true
            }
        });
        if (!media || media.length === 0) {
            let details = "No audio media is empty";
            let logtype = Helpers_1.LogType.WARNING;
            if (!media) {
                details = "Media is undefined: " + media;
                logtype = Helpers_1.LogType.ERROR;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No audio media found", logtype, details);
            return h.response({ message: "No audio media found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Audio media found", Helpers_1.LogType.INFO);
        return h.response(media).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Failed to get all audio media", Helpers_1.LogType.ERROR, err);
        return h.response({ message: "Internal Server Error" + ":failed to get all audio media" }).code(500);
    }
}
async function listAllImageMediaHandler(request, h) {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_1.MediaType.IMAGE,
            },
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                id: true,
                uniqueId: true,
                title: true,
                description: true,
                url: true,
                duration: true,
                host: true,
                postedAt: true,
                updatedAt: true,
            },
        });
        if (!media || media.length === 0) {
            let details = "No image media is empty";
            let logtype = Helpers_1.LogType.WARNING;
            if (!media) {
                details = "Media is undefined: " + media;
                logtype = Helpers_1.LogType.ERROR;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No image media found", logtype, details);
            return h.response({ message: "No image media found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Image media found", Helpers_1.LogType.INFO);
        return h.response(media).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Failed to get all Image media", Helpers_1.LogType.ERROR, err);
        return h
            .response({
            message: "Internal Server Error" + ":failed to get all image media",
        })
            .code(500);
    }
}
//upload audio to server
async function deleteAudioFileHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId } = request.payload;
    try {
        const findAudio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "findUnique", {
            where: {
                uniqueId: uniqueId,
                type: Helpers_1.MediaType.AUDIO,
            },
            select: {
                id: true,
                fileId: true,
                mediaNotifications: {
                    select: {
                        notificationId: true,
                    },
                },
            },
        });
        if (!findAudio) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Audio not found", Helpers_1.LogType.ERROR);
            return h.response({ message: "Audio not found" }).code(404);
        }
        //delete 
        const deleteFromDrive = await deleteAudioFileFromDrive(findAudio.fileId);
        if (deleteFromDrive) {
            const deleteAudio = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "delete", {
                where: {
                    id: findAudio.id,
                },
            });
            if (!deleteAudio) {
                (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete audio media", Helpers_1.LogType.ERROR);
                return h.response({ message: "Failed to delete audio media" }).code(400);
            }
            const specialKey = findAudio.uniqueId + Helpers_1.NotificationType.AUDIO;
            const notification = await (0, notificationHandlers_1.deleteMediaNotificationHandler)(findAudio.mediaNotifications.notificationId, findAudio.uniqueId, specialKey, Helpers_1.NotificationType.AUDIO);
            if (!notification) {
                (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete notification for audio media", Helpers_1.LogType.ERROR);
                return h.response({ message: "Failed to delete notification for audio media" }).code(400);
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Audio media deleted successfully", Helpers_1.LogType.INFO);
            return h.response({ message: "Audio deleted successfully" }).code(201);
        }
        else {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete audio media", Helpers_1.LogType.ERROR);
            return h.response({ message: "Failed to delete audio media" }).code(400);
        }
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete audio media", Helpers_1.LogType.ERROR, error.toString());
        return h.response("Error deleting audio").code(500);
    }
}
//upload audio to google drive
async function pushAudioToDriveHandler(request, h) {
    const { name, description, filePath, mimeType, host } = request.payload;
    try {
        // Ensure the filePath is provided and is a string
        if (!filePath || typeof filePath !== 'string') {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Invalid file path", Helpers_1.LogType.ERROR);
            return h.response({ error: 'Invalid file path' }).code(400);
        }
        let duration = '';
        try {
            duration = await getDuration(filePath);
        }
        catch (durationError) {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Could not calculate duration, proceeding without it", Helpers_1.LogType.ERROR, durationError);
        }
        const shareableLink = await createAudioFile(name, description, duration, mimeType, filePath, host);
        // Remove the file from the 'uploads' directory after processing
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Audio uploaded successfully", Helpers_1.LogType.INFO);
        return h.response({ shareableLink }).code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to upload file to Google Drive", Helpers_1.LogType.ERROR, error);
        return h
            .response({ error: "Failed to upload file to Google Drive" })
            .code(500);
    }
}
;
//update audio
async function updateAudioFile(request, h) {
    const prisma = request.server.app.prisma;
    const { uniqueId, name, description, filePath, mimeType, reUploadMedia, host } = request.payload;
    try {
        let shareableLink = "";
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
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Audio not found", Helpers_1.LogType.ERROR);
            return h.response({ message: "Audio not found" }).code(404);
        }
        shareableLink = await updateAudioFileHelper(uniqueId, name, description, mimeType, findAudioId.fileId, filePath, reUploadMedia, host);
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Audio updated successfully", Helpers_1.LogType.INFO);
        return h.response({ shareableLink }).code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update audio media", Helpers_1.LogType.ERROR, error);
        return h
            .response({ error: "Failed to upload file to Google Drive" })
            .code(500);
    }
}
//eventthumbnail
const storeThumbnailFileHandler = async (request, h) => {
    const { thumbnailFile } = request.payload;
    if (!thumbnailFile) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "No file uploaded", Helpers_1.LogType.ERROR);
        return h.response({ error: "No file uploaded" }).code(400);
    }
    const filename = thumbnailFile.hapi.filename;
    const mimeType = thumbnailFile.hapi.headers["content-type"];
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir);
    }
    const filePath = path.join(uploadsDir, filename);
    try {
        await new Promise((resolve, reject) => {
            const fileStream = fs_1.default.createWriteStream(filePath);
            thumbnailFile.pipe(fileStream);
            fileStream.on("error", (err) => {
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Error writing file", Helpers_1.LogType.ERROR);
                reject(err);
            });
            fileStream.on("finish", () => {
                resolve();
            });
        });
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "File uploaded successfully", Helpers_1.LogType.INFO);
        return h.response({ filePath, mimeType, filename }).code(200);
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to store file", Helpers_1.LogType.ERROR);
        return h.response({ error: "Failed to store file" }).code(500);
    }
};
exports.storeThumbnailFileHandler = storeThumbnailFileHandler;
//# sourceMappingURL=mediaHandlers.js.map
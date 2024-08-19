"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllVideoMediaHandler = void 0;
exports.createVideoMediaHandler = createVideoMediaHandler;
exports.updateVideoMediaHandler = updateVideoMediaHandler;
exports.deleteVideoMediaHandler = deleteVideoMediaHandler;
const Helpers_1 = require("../Helpers");
const multer_1 = __importDefault(require("multer"));
const notificationHandlers_1 = require("./notificationHandlers");
const upload = (0, multer_1.default)({ dest: "uploads/" });
// export const createAudioMediaHandler : Hapi.Lifecycle.Method = async (
//   request: MulterRequest,
//   h
// ) => {
//   const uploadMiddleware = upload.single("audioFile"); // 'audioFile' is the key for the file in the form data
//   // Multer middleware processing
//   await new Promise((resolve, reject) => {
//     uploadMiddleware(request.raw.req, request.raw.res, (err) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(null);
//     });
//   });
//   const file = request.raw.req.file;
//   if (!file) {
//     return h.response({ error: "No file uploaded" }).code(400);
//   }
//   try {
//     // Upload the file to Google Drive
//     const fileId = await createAudioFile(file);
//     // Respond with the file ID from Google Drive
//     return h.response({ fileId }).code(200);
//   } catch (error) {
//     return h
//       .response({ error: "Failed to upload file to Google Drive" })
//       .code(500);
//   }
// };
//create video media
async function createVideoMediaHandler(request, h) {
    const { prisma } = request.server.app;
    const { url, category } = request.payload;
    try {
        const media = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "create", {
            data: {
                url: url,
                type: Helpers_1.MediaType.VIDEO,
                category: category,
                postedAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)()
            }
        });
        if (!media) {
            console.log("Failed to create video media");
            return h.response({ message: "Failed to create video media" }).code(400);
        }
        const descriptionNew = "A new video has been posted ";
        const notificationTitle = "A New Video has been posted";
        const specialKey = media.uniqueId + Helpers_1.NotificationType.MEDIA;
        const notification = await (0, notificationHandlers_1.createMediaNotificationHandler)(media.uniqueId, specialKey, notificationTitle, descriptionNew, false);
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
    const { uniqueId, url, category } = request.payload;
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
                uniqueId: uniqueId
            },
            data: {
                url: url,
                category: category,
                updatedAt: (0, Helpers_1.getCurrentDate)()
            }
        });
        if (!media) {
            console.log("Failed to update video media");
            return h.response({ message: "Failed to update video media" }).code(400);
        }
        const description = "The video with  ID " + uniqueId + " has just been updated!";
        const notificationTitle = "A Video has just been updated!";
        const specialKey = media.uniqueId + Helpers_1.NotificationType.MEDIA;
        const notification = await (0, notificationHandlers_1.updateMediaNotificationHandler)(findMedia.mediaNotifications.notificationId, media.uniqueId, specialKey, notificationTitle, description, false);
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
        const specialKey = findMedia.uniqueId + Helpers_1.NotificationType.MEDIA;
        const notification = await (0, notificationHandlers_1.deleteMediaNotificationHandler)(findMedia.mediaNotifications.notificationId, findMedia.uniqueId, specialKey);
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
// export const listAllAudioMediaHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
//     const { prisma } = request.server.app;
//     try{
//         const media = await executePrismaMethod(prisma, "media", "findMany", {
//             where: {
//                 type: MediaType.AUDIO
//             },
//             orderBy: {
//                 createdAt: "desc"
//             }
//         });
//         if(!media){
//             console.log("No audio media found");
//             return h.response({message: "No audio media found"}).code(404);
//         }
//         return h.response(media).code(200);
//     }catch(err){
//         console.log(err);
//         return h.response({message: "Internal Server Error" + ":failed to get all audio media"}).code(500);
//     }
// }
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
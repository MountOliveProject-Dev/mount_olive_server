"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllVideoMediaHandler = exports.listAllAudioMediaHandler = void 0;
exports.createVideoMediaHandler = createVideoMediaHandler;
const Helpers_1 = require("../Helpers");
const Helpers_2 = require("../Helpers");
const notificationHandlers_1 = require("./notificationHandlers");
//create video media
async function createVideoMediaHandler(request, h) {
    const { prisma } = request.server.app;
    const { title, description, thumbnail, url, duration, type, category } = request.payload;
    try {
        let thumbnailNew;
        let descriptionNew;
        if (thumbnail === undefined || thumbnail === null) {
            thumbnailNew = " ";
        }
        else {
            thumbnailNew = thumbnail;
        }
        if (description === undefined || description === null) {
            descriptionNew = " ";
        }
        else {
            descriptionNew = description;
        }
        const media = await (0, Helpers_2.executePrismaMethod)(prisma, "media", "create", {
            data: {
                title,
                descriptionNew,
                thumbnailNew,
                url,
                duration,
                type,
                category,
                createdAt: (0, Helpers_2.getCurrentDate)(),
                updatedAt: (0, Helpers_2.getCurrentDate)()
            }
        });
        if (!media) {
            console.log("Failed to create video media");
            return h.response({ message: "Failed to create video media" }).code(400);
        }
        const notificationTitle = "A New Video titled " + title + " has been posted";
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
const listAllAudioMediaHandler = async (request, h) => {
    const { prisma } = request.server.app;
    try {
        const media = await (0, Helpers_2.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_2.MediaType.AUDIO
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
        const media = await (0, Helpers_2.executePrismaMethod)(prisma, "media", "findMany", {
            where: {
                type: Helpers_2.MediaType.VIDEO
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
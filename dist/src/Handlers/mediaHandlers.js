"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllVideoMediaHandler = exports.listAllAudioMediaHandler = void 0;
const Helpers_1 = require("../Helpers");
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
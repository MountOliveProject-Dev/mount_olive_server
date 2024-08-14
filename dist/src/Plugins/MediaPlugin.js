"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaPlugin = void 0;
const mediaHandlers_1 = require("../Handlers/mediaHandlers");
const MediaValidators_1 = require("../Validators/MediaValidators");
exports.mediaPlugin = {
    name: 'app/media',
    dependencies: ['prisma'],
    register: async function (server) {
        server.route([
            {
                method: "GET",
                path: "/api/media/get-audios",
                handler: mediaHandlers_1.listAllAudioMediaHandler,
                options: {
                    auth: false,
                },
            },
            {
                method: "GET",
                path: "/api/media/get-all-posted-videos",
                handler: mediaHandlers_1.listAllVideoMediaHandler,
                options: {
                    auth: false,
                },
            },
            {
                method: "POST",
                path: "/api/media/post-video",
                handler: mediaHandlers_1.createVideoMediaHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: MediaValidators_1.createMediaInputValidator,
                        failAction: async (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/media/update-video",
                handler: mediaHandlers_1.updateVideoMediaHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: MediaValidators_1.updateMediaInputValidator,
                        failAction: async (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/media/delete-video",
                handler: mediaHandlers_1.deleteVideoMediaHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: MediaValidators_1.createMediaInputValidator,
                        failAction: async (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
        ]);
    }
};
//# sourceMappingURL=MediaPlugin.js.map
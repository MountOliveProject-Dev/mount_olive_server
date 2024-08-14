"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaPlugin = void 0;
const inert_1 = __importDefault(require("@hapi/inert"));
const mediaHandlers_1 = require("../Handlers/mediaHandlers");
const MediaValidators_1 = require("../Validators/MediaValidators");
exports.mediaPlugin = {
    name: "app/media",
    dependencies: ["prisma"],
    register: async function (server) {
        await server.register(inert_1.default);
        server.route([
            // {
            //   method: "POST",
            //   path: "/upload-audio",
            //   handler: createAudioMediaHandler,
            //   options: {
            //     auth: false,
            //     payload: {
            //       output: "stream",
            //       parse: true,
            //       multipart: true,
            //       maxBytes: 104857600, // Limit to 100MB
            //     },
            //     validate: {
            //       payload: createAudioFileValidator,
            //       failAction: (request, h, err) => {
            //         throw err;
            //       },
            //     },
            //   },
            // },
            // {
            //   method: "GET",
            //   path: "/api/media/get-audios",
            //   handler: listAllAudioMediaHandler,
            //   options: {
            //     auth: false,
            //   },
            // },
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
    },
};
//# sourceMappingURL=MediaPlugin.js.map
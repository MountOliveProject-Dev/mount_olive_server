"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaPlugin = void 0;
const inert_1 = __importDefault(require("@hapi/inert"));
const joi_1 = __importDefault(require("joi"));
const MediaValidators_1 = require("../Validators/MediaValidators");
const Handlers_1 = require("../Handlers");
exports.mediaPlugin = {
    name: "app/media",
    dependencies: ["prisma"],
    register: async function (server) {
        await server.register(inert_1.default);
        server.route([
            {
                method: "POST",
                path: "/upload-audio",
                handler: Handlers_1.createAudioMediaHandler,
                options: {
                    auth: false,
                    payload: {
                        output: "stream",
                        parse: true,
                        timeout: 120000,
                        multipart: true,
                        maxBytes: 104857600000, // Limit to 100MB
                    },
                    validate: {
                        payload: joi_1.default.object({
                            name: joi_1.default.string().required().label("Name"),
                            description: joi_1.default.string().optional().label("Description"),
                            audioFile: joi_1.default.any()
                                .required()
                                .meta({ swaggerType: "file" })
                                .label("Audio File"),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "GET",
                path: "/api/media/get-audios",
                handler: Handlers_1.listAllAudioMediaHandler,
                options: {
                    auth: false,
                },
            },
            {
                method: "GET",
                path: "/api/media/get-all-folders",
                handler: Handlers_1.getAllFolders,
                options: {
                    auth: false,
                },
            },
            {
                method: "GET",
                path: "/api/media/folders-in-drive",
                handler: Handlers_1.getAllFoldersInGoogleDrive,
                options: {
                    auth: false,
                },
            }, {
                method: "GET",
                path: "/api/media/delete-all-folders-in-drive",
                handler: Handlers_1.deleteManyFromGoogleDrive,
                options: {
                    auth: false,
                },
            },
            {
                method: "POST",
                path: "/api/media/delete-folder/{folderId}",
                handler: Handlers_1.deleteFolder,
                options: {
                    auth: false,
                },
            },
            {
                method: "POST",
                path: "/api/media/create-folder",
                handler: Handlers_1.createFolder,
                options: {
                    auth: false,
                    validate: {
                        payload: MediaValidators_1.createFolderInputValidator,
                        failAction: async (request, h, err) => {
                            throw { err, h };
                        },
                    },
                },
            },
            {
                method: "GET",
                path: "/api/media/get-all-posted-videos",
                handler: Handlers_1.listAllVideoMediaHandler,
                options: {
                    auth: false,
                },
            },
            {
                method: "POST",
                path: "/api/media/post-video",
                handler: Handlers_1.createVideoMediaHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: MediaValidators_1.createVideoMediaInputValidator,
                        failAction: async (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/media/update-video",
                handler: Handlers_1.updateVideoMediaHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: MediaValidators_1.updateVideoMediaInputValidator,
                        failAction: async (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/media/delete-video",
                handler: Handlers_1.deleteVideoMediaHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: joi_1.default.object({
                            uniqueId: joi_1.default.string().required(),
                        }),
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
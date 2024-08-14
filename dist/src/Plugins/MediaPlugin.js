"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaPlugin = void 0;
const mediaHandlers_1 = require("../Handlers/mediaHandlers");
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
                },
            }
        ]);
    }
};
//# sourceMappingURL=MediaPlugin.js.map
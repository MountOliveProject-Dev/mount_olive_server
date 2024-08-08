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
                path: "/api/media/get-videos",
                handler: mediaHandlers_1.listAllVideoMediaHandler,
                options: {
                    auth: false,
                },
            },
        ]);
    }
};
//# sourceMappingURL=MediaPlugin.js.map
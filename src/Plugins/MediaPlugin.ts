import Hapi from "@hapi/hapi";

import { createVideoMediaHandler, listAllAudioMediaHandler, listAllVideoMediaHandler } from "../Handlers/mediaHandlers";

export const mediaPlugin = {
    name: 'app/media',
    dependencies: ['prisma'],

    register: async function (server: Hapi.Server) {
        server.route([
          {
            method: "GET",
            path: "/api/media/get-audios",
            handler: listAllAudioMediaHandler,
            options: {
              auth: false,
            },
          },
          {
            method: "GET",
            path: "/api/media/get-videos",
            handler: listAllVideoMediaHandler,
            options: {
              auth: false,
            },
          },
          {
            method: "POST",
            path: "/api/media/post-video",
            handler: createVideoMediaHandler,
            options: {
              auth: false,
            },
          }
        ]);
    }
}
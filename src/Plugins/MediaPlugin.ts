import Hapi from "@hapi/hapi";

import {
  createVideoMediaHandler,
  listAllAudioMediaHandler,
  listAllVideoMediaHandler,
  updateVideoMediaHandler,
  deleteVideoMediaHandler,
} from "../Handlers/mediaHandlers";

import {
  updateMediaInputValidator,
  createMediaInputValidator,
} from "../Validators/MediaValidators";
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
            path: "/api/media/get-all-posted-videos",
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
              validate: {
                payload: createMediaInputValidator,
                failAction: async (request, h, err) => {
                  throw err;
                },
              },
            },
          },
          {
            method: "POST",
            path: "/api/media/update-video",
            handler: updateVideoMediaHandler,
            options: {
              auth: false,
              validate: {
                payload: updateMediaInputValidator,
                failAction: async (request, h, err) => {
                  throw err;
                },
              },
            },
          },
          {
            method: "POST",
            path: "/api/media/delete-video",
            handler: deleteVideoMediaHandler,
            options: {
              auth: false,
              validate: {
                payload: createMediaInputValidator,
                failAction: async (request, h, err) => {
                  throw err;
                },
              },
          },
        },
        ]);
    }
}
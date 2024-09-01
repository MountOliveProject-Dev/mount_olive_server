import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import {
  createVideoMediaHandler,
  // listAllAudioMediaHandler,
  listAllVideoMediaHandler,
  updateVideoMediaHandler,
  deleteVideoMediaHandler,
 
  //createAudioMediaHandler,
} from "../Handlers/mediaHandlers";
import Joi from "joi";
import {
  updateMediaInputValidator,
  createMediaInputValidator,
  updateVideoMediaInputValidator,
  createVideoMediaInputValidator,
  createAudioFileValidator,
} from "../Validators/MediaValidators";
import {
  getAllFilesInGoogleDriveFolder,
  getFolder,
  createFolder,
  deleteFolder,
} from "../Handlers";

export const mediaPlugin: Hapi.Plugin<void> = {
  name: "app/media",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    await server.register(Inert);
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
      {
        method: "GET",
        path: "/api/media/get-audios",
        handler: getAllFilesInGoogleDriveFolder,
        options: {
          auth: false,
        },
      },{
        method: "GET",
        path: "/api/media/get-folder/{folderId}",
        handler: getFolder,
        options: {
          auth: false,
        },
      },{
        method: "POST",
        path:"/api/media/delete-folder/{folderId}",
        handler: deleteFolder,
        options: {
          auth: false
      },
    },
      {
        method: "POST",
        path: "/api/media/create-folder",
        handler: createFolder,
        options: {
          auth: false,
          validate: {
            payload: Joi.object({
              name: Joi.string().required(),
            }),
            failAction: async (request, h, err) => {
              throw err;
            },
          },
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
            payload: createVideoMediaInputValidator,
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
            payload: updateVideoMediaInputValidator,
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
            payload: Joi.object({
              uniqueId: Joi.string().required(),
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
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Joi from "joi";
import {
  updateVideoMediaInputValidator,
  createVideoMediaInputValidator,
  createAudioFileValidator,
  updateAudioFileValidator,
  createFolderInputValidator,
} from "../Validators/MediaValidators";
import {
  createFolder,
  deleteFolder,
  getAllFolders,
  createVideoMediaHandler,
  listAllVideoMediaHandler,
  updateVideoMediaHandler,
  deleteVideoMediaHandler,
  storeAudioFileHandler,
  listAllAudioMediaHandler,
  getAllFoldersInGoogleDrive,
  deleteManyFromGoogleDrive,
  pushAudioToDriveHandler,
  storeThumbnailFileHandler,
  updateAudioFile,
  deleteAudioFileHandler,
  listAllImageMediaHandler,
  deleteThumbnailFromDriveHandler,
  createFoldersInDatabaseHandler,
  deleteAllFilesInGoogleDrive,
} from "../Handlers";

export const mediaPlugin: Hapi.Plugin<void> = {
  name: "app/media",
  dependencies: ["prisma"],
  register: async function (server: Hapi.Server) {
    await server.register(Inert);
    server.route([
      {
        method: "POST",
        path: "/upload-audio",
        handler: storeAudioFileHandler,
        options: {
          auth: false,
          payload: {
            output: "stream",
            parse: true,
            timeout: 3000000,
            multipart: true,
            maxBytes: 104857600000, // Limit to 100MB
          },
          validate: {
            payload: Joi.object({
              audioFile: Joi.any()
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
        method: "POST",
        path: "/upload-thumbnail",
        handler: storeThumbnailFileHandler,
        options: {
          auth: false,
          payload: {
            output: "stream",
            parse: true,
            timeout: 3000000,
            multipart: true,
            maxBytes: 10485760000000, // Limit to 100MB
            allow: "multipart/form-data",
          },
          validate: {
            payload: Joi.object({
              thumbnailFile: Joi.any()
                .required()
                .meta({ swaggerType: "file" })
                .label("thumbnail"),
            }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "POST",
        path: "/api/media/create-audio-media",
        handler: pushAudioToDriveHandler,
        options: {
          auth: false,
          validate: {
            payload: createAudioFileValidator,
            failAction: async (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "POST",
        path: "/api/media/update-audio",
        handler: updateAudioFile,
        options: {
          auth: false,
          validate: {
            payload: updateAudioFileValidator,
            failAction: async (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "POST",
        path: "/api/media/delete-audio",
        handler: deleteAudioFileHandler,
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
      {
        method: "GET",
        path: "/api/media/get-audios",
        handler: listAllAudioMediaHandler,
        options: {
          auth: false,
        },
      },
      //
      {
        method: "PUT",
        path: "/api/media/delete-thumbnail-from-drive/{Id}",
        handler: deleteThumbnailFromDriveHandler,
        options: {
          auth: false,
          validate: {
            params: Joi.object({
              Id: Joi.string().required(),
            }),
          },
        },
      },
      {
        method: "GET",
        path: "/api/media/get-images",
        handler: listAllImageMediaHandler,
        options: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/api/media/get-all-folders",
        handler: getAllFolders,
        options: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/api/media/folders-in-drive",
        handler: getAllFoldersInGoogleDrive,
        options: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/api/media/delete-all-folders-in-drive",
        handler: deleteManyFromGoogleDrive,
        options: {
          auth: false,
        },
      },
      {
        method: "POST",
        path: "/api/media/delete-folder/{folderId}",
        handler: deleteFolder,
        options: {
          auth: false,
        },
      }, //deleteAllFilesInGoogleDrive
      {
        method: "GET",
        path: "/api/media/delete-all-files-in-drive",
        handler: deleteAllFilesInGoogleDrive,
        options: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/api/media/create-folder-in-db",
        handler: createFoldersInDatabaseHandler,
        options: {
          auth: false,
        },
      },
      {
        method: "POST",
        path: "/api/media/create-folder",
        handler: createFolder,
        options: {
          auth: false,
          validate: {
            payload: createFolderInputValidator,
            failAction: async (request, h, err) => {
              throw { err, h };
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
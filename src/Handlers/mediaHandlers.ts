import Hapi from "@hapi/hapi";

import {
  executePrismaMethod,
  MediaType,
  MulterRequest,
  getCurrentDate,
  NotificationType,
} from "../Helpers";
import multer from "multer";
import {createAudioFile} from "../Handlers";
import { MediaInput } from "../Interfaces";
import {
  createMediaNotificationHandler,
  updateMediaNotificationHandler,
  deleteMediaNotificationHandler,
} from "./notificationHandlers";


const upload = multer({ dest: "uploads/" });

export const createAudioMediaHandler : Hapi.Lifecycle.Method = async (
  request: MulterRequest,
  h
) => {
  const uploadMiddleware = upload.single("audioFile"); // 'audioFile' is the key for the file in the form data

  // Multer middleware processing
  await new Promise((resolve, reject) => {
    uploadMiddleware(request.raw.req, request.raw.res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(null);
    });
  });

  const file = request.raw.req.file;

  if (!file) {
    return h.response({ error: "No file uploaded" }).code(400);
  }

  try {
    // Upload the file to Google Drive
    const fileId = await createAudioFile(file);
    // Respond with the file ID from Google Drive
    return h.response({ fileId }).code(200);
  } catch (error) {
    return h
      .response({ error: "Failed to upload file to Google Drive" })
      .code(500);
  }
};

//create video media

export async function createVideoMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {title, description, thumbnail, url, duration, category} = request.payload as MediaInput;
    

    try{
        let thumbnailNew;
        let descriptionNew;
        if(thumbnail === undefined || thumbnail === null){
            thumbnailNew = " ";
        }else {
            thumbnailNew = thumbnail;
        }
        if(description === undefined || description === null){
            descriptionNew = " ";
        }else {
            descriptionNew = description;
        }

        const media = await executePrismaMethod(prisma, "media", "create", {
            data: {
                title: title,
                description: descriptionNew,
                thumbnail: thumbnailNew,
                url: url,
                duration: duration,
                type: MediaType.VIDEO,
                category: category,
                createdAt: getCurrentDate(),
                updatedAt: getCurrentDate()
            }
        });
        if(!media){
            console.log("Failed to create video media");
            return h.response({message: "Failed to create video media"}).code(400);
        }
        const notificationTitle = "A New Video titled " + title + " has been posted";
        const specialKey = media.uniqueId + NotificationType.MEDIA;
        const notification = await createMediaNotificationHandler(
            media.uniqueId,
            specialKey,
            notificationTitle,
            descriptionNew,
            false
        );
        if(!notification){
            console.log("Failed to create notification for video media");
            return h.response({message: "Failed to create notification for video media"}).code(400);
        }
        
        return h.response({message:"The video was posted successfully"}).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to create video media"}).code(500);
    }

}
// update video media

export async function updateVideoMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {uniqueId, title, description, thumbnail, url, duration, category} = request.payload as MediaInput;
    
    try{
        const findMedia = await executePrismaMethod(
          prisma,
          "media",
          "findUnique",
          {
            where: {
              uniqueId: uniqueId,
            },
            select: {
              id: true,
              eventNotifications: {
                select: {
                  notificationId: true,
                },
              },
            },
          }
        );
        if (!findMedia) {
          return h.response({ message: "Media not found" }).code(404);
        }
        const media = await executePrismaMethod(prisma, "media", "update", {
            where: {
                id: findMedia.id,
                uniqueId: uniqueId
            },
            data: {
                title: title,
                description: description,
                thumbnail: thumbnail,
                url: url,
                duration: duration,
                category: category,
                updatedAt: getCurrentDate()
            }
        });
        if(!media){
            console.log("Failed to update video media");
            return h.response({message: "Failed to update video media"}).code(400);
        }


        const notificationTitle = "The Video titled " + title + " has just been updated!";
        const specialKey = media.uniqueId + NotificationType.MEDIA;
        const notification = await updateMediaNotificationHandler(
            findMedia.eventNotifications.notificationId,
            media.uniqueId,
            specialKey,
            notificationTitle,
            description,
            false
        );
        if(!notification){
            console.log("Failed to update notification for video media");
            return h.response({message: "Failed to update notification for video media"}).code(400);
        }



        return h.response({message:"The video was updated successfully"}).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to update video media"}).code(500);
    }
}

// delete video media
export async function deleteVideoMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {uniqueId} = request.payload as MediaInput;
    try{
        const findMedia = await executePrismaMethod(
          prisma,
          "media",
          "findUnique",
          {
            where: {
              uniqueId: uniqueId,
            },
            select: {
              id: true,
              eventNotifications: {
                select: {
                  notificationId: true,
                },
              },
            },
          }
        );
        if (!findMedia) {
          return h.response({ message: "Media not found" }).code(404);
        }
        const media = await executePrismaMethod(prisma, "media", "delete", {
            where: {
                id: findMedia.id
            }
        });
        if(!media){
            console.log("Failed to delete video media");
            return h.response({message: "Failed to delete video media"}).code(400);
        }
        const specialKey = findMedia.uniqueId + NotificationType.EVENT;
        const notification = await deleteMediaNotificationHandler(findMedia.eventNotifications.notificationId, findMedia.uniqueId, specialKey);
        if(!notification){
            console.log("Failed to delete notification for video media");
            return h.response({message: "Failed to delete notification for video media"}).code(400);
        }
        return h.response({message:"The video was deleted successfully"}).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to delete video media"}).code(500);
    }
}
export const listAllAudioMediaHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;

    try{
        const media = await executePrismaMethod(prisma, "media", "findMany", {
            where: {
                type: MediaType.AUDIO
            },
            orderBy: {
                createdAt: "desc"
            }

        });
        if(!media){
            console.log("No audio media found");
            return h.response({message: "No audio media found"}).code(404);
        }
        return h.response(media).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get all audio media"}).code(500);
    }
}

export const listAllVideoMediaHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;

    try{
        const media = await executePrismaMethod(prisma, "media", "findMany", {
            where: {
                type: MediaType.VIDEO
            },
            orderBy: {
                createdAt: "desc"
            }

        });
        if(!media){
            console.log("No video media found");
            return h.response({message: "No video media found"}).code(404);
        }
        return h.response(media).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get all video media"}).code(500);
    }
}
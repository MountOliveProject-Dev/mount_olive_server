import Hapi from "@hapi/hapi"; 
import { executePrismaMethod,NotificationType,MediaType,getCurrentDate } from "../Helpers";
import { MediaInput } from "../Interfaces";
import {createMediaNotificationHandler, updateMediaNotificationHandler,deleteMediaNotificationHandler} from "./notificationHandlers";

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


// list all video media



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
import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod,MediaType } from "../Helpers";


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
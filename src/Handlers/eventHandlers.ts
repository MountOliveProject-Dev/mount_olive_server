import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod } from "../Helpers";
import { EventInput } from "../Interfaces ";


export async function listEventsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;

    try{
        const events = await executePrismaMethod(prisma, "event", "findMany",
            {
                orderBy: [
                    {
                    createdAt: "asc",
                    },
                ],
            }
        );
        if(!events){
            return h.response({message: "No events found"}).code(404);
        }
        return h.response(events).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error"}).code(500);
    }
}

export async function createEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { title, description, thumbnail, date, host } = request.payload as EventInput;

    try{
        const event = await executePrismaMethod(prisma, "event", "create", {
            data: {
                title: title,
                description: description,
                thumbnail: thumbnail,
                date: date,
                host: host,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        });
        return h.response(event).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to create the event:" + title}).code(500);
    }
}

export async function updateEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { title, description, thumbnail, uniqueId, host, date } = request.payload as any;

    try{
        const event = await executePrismaMethod(prisma, "event", "update", {
            where: {
               uniqueId: uniqueId,
            },
            data: {
                title: title,
                description: description,
                thumbnail: thumbnail,
                date: date,
                host: host,
                updatedAt: new Date(),
            },
        });
        return h.response(event).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to update the event:" + title}).code(500);
    }
}

export async function deleteEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { uniqueId } = request.payload as EventInput;

    try{
        const event = await executePrismaMethod(prisma, "event", "delete", {
            where: {
                uniqueId: uniqueId,
            },
        });
        return h.response(event).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to delete the event:" + uniqueId}).code(500);
    }
}

export async function getEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { uniqueId } = request.payload as EventInput;

    try{
        const event = await executePrismaMethod(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
        });
        if(!event){
            return h.response({message: "Event not found"}).code(404);
        }
        return h.response(event).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get the event:" + uniqueId}).code(500);
    }
}

export async function searchEventByTitleOrUniqueIDHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { search } = request.payload as any;

    try{
        const event = await executePrismaMethod(prisma, "event", "findMany", {
            where: {
                OR: [
                    {
                        title: {
                            contains: search,
                        },
                    },
                    {
                        uniqueId: {
                            contains: search,
                        },
                    },
                ],
            },
        });
        if(!event){
            return h.response({message: "Event not found"}).code(404);
        }
        return h.response(event).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to search the event:" + search}).code(500);
    }
}

export async function listEventsByDateHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { date } = request.payload as any;

    try{
        const events = await executePrismaMethod(prisma, "event", "findMany", {
            where: {
                createdAt: date,
            },
        });
        if(!events){
            return h.response({message: "No events found"}).code(404);
        }
        return h.response(events).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to list events by date:" + date}).code(500);
    }
}

export async function listEventsByDateRangeHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { startDate, endDate } = request.payload as any;

    try{
        const events = await executePrismaMethod(prisma, "event", "findMany", {
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: startDate,
                        },
                    },
                    {
                        createdAt: {
                            lte: endDate,
                        },
                    },
                ],
            },
        });
        if(!events){
            return h.response({message: "No events found"}).code(404);
        }
        return h.response(events).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to list events by date range:" + startDate + " - " + endDate}).code(500);
    }
}
import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod, NotificationType } from "../Helpers";


export const listNotificationsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {

    const { prisma } = request.server.app;

    try{
        const notifications = await executePrismaMethod(prisma, "notification", "findMany", {});
        return h.response(notifications).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get the notifications"}).code(500);
    }
}

//list notifications by type
export const listNotificationsByTypeHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const type = request.params.type;
    try{
        const notifications = await executePrismaMethod(prisma, "notificationEngagements", "findMany", {
            where: {
                type: type
            }
        });
        return h.response(notifications).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get the notifications"}).code(500);
    }
}

export const getNotificationHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const notificationId = parseInt(request.params.id);
    try{
        const notification = await executePrismaMethod(prisma, "notification", "findFirst", {
            where: {
                id: notificationId
            }
        });
        if(notification){
            return h.response(notification).code(200);
        }else{
            return h.response({message: "Notification not found"}).code(404);
        }
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get the notification"}).code(500);
    }
}

export const createMediaNotificationHandler = async (mediaId: number, title: string, description: string, read: boolean) => {
    const { prisma } = server.app;
    try{
        const notification = await executePrismaMethod(prisma, "notification", "create", {
            data: {
                title: title,
                description: description,
                read: read
            },
            select: {
                id: true,
                title: true,
                description: true,
                read: true
            }
        });
        if(!notification){
            const message = "Failed to create the notification";
            return message;
        }

        const mediaNotificationEngagement = await executePrismaMethod(prisma, "notificationEngagements", "create", {
            data: {
                notificationId: notification.id,
                type: NotificationType.MEDIA,
                media:{
                    connect:{
                        id: mediaId
                    
                }
            }
        
        }
    });
        if(!mediaNotificationEngagement){
            const message = "Failed to create the notification engagement";
            return message;
        }
        const message = title + "  was created successfully";
        return message;
    }catch(err){
        const message = err + " :Failed to create the notification";
        return message;
    }
}

export const createEventNotificationHandler = async (eventId: string, title: string, description: string, read: boolean) => {
    const { prisma } = server.app;
    try{
        const notification = await executePrismaMethod(prisma, "notification", "create", {
            data: {
                title: title,
                description: description,
                read: read
            },
            select: {
                id: true,
                title: true,
                description: true,
                read: true
            }
        });
        if(!notification){
            const message = "Failed to create the notification";
            return message;
        }
        
        const mediaNotificationEngagement = await executePrismaMethod(prisma, "notificationEngagements", "create", {
            data: {
                notificationId: notification.id,
                type: NotificationType.EVENT,
                specialKey: eventId, 
                event:{
                    connect:{
                        uniqueId: eventId
                }
            }
        
        }
    });
        if(!mediaNotificationEngagement){
            const message = "Failed to create the notification engagement";
            return message;
        }
        const message = title + "  was created successfully";
        return message;
    }catch(err){
        const message = err + " :Failed to create the notification";
        return message;
    }
}

export const updateEventNotificationHandler = async (eventId: string, title: string, description: string, read: boolean) => {
    const { prisma } = server.app;
    try{
        const notification = await executePrismaMethod(prisma, "notification", "update", {
            where: {
                uniqueId: eventId
            },
            data: {
                title: title,
                description: description,
                read: read
            },
            select: {
                id: true,
                title: true,
                description: true,
                read: true
            }
        });
        if(!notification){
            const message = "Failed to update the notification";
            return message;
        }

        const mediaNotificationEngagement = await executePrismaMethod(prisma, "notificationEngagements", "update", {
            where: {
                notificationId: notification.id
            },
            data: {
                type: NotificationType.EVENT,
                event:{
                    connect:{
                        id: eventId
                    
                }
            }
        
        }
    });
        if(!mediaNotificationEngagement){
            const message = "Failed to update the notification engagement";
            return message;
        }
        const message = title + "  was updated successfully";
        return message;
    }catch(err){
        const message = err + " :Failed to update the notification";
        return message;
    }
}

export const updateMediaNotificationHandler = async (mediaId: number, title: string, description: string, read: boolean) => {
    const { prisma } = server.app;
    try{
        const notification = await executePrismaMethod(prisma, "notification", "update", {
            where: {
                id: mediaId
            },
            data: {
                title: title,
                description: description,
                read: read
            },
            select: {
                id: true,
                title: true,
                description: true,
                read: true
            }
        });
        if(!notification){
            const message = "Failed to update the notification";
            return message;
        }

        const mediaNotificationEngagement = await executePrismaMethod(prisma, "notificationEngagements", "update", {
            where: {
                notificationId: notification.id
            },
            data: {
                type: NotificationType.MEDIA,
                media:{
                    connect:{
                        id: mediaId
                    
                }
            }
        
        }
    });
        if(!mediaNotificationEngagement){
            const message = "Failed to update the notification engagement";
            return message;
        }
        const message = title + "  was updated successfully";
        return message;
    }catch(err){
        const message = err + " :Failed to update the notification";
        return message;
    }
}


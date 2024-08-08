"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventNotificationHandler = exports.updateEventNotificationHandler = exports.createEventNotificationHandler = exports.listNotificationsHandler = void 0;
const server_1 = __importDefault(require("../server"));
const Helpers_1 = require("../Helpers");
const listNotificationsHandler = async (request, h) => {
    const { prisma } = request.server.app;
    try {
        const notifications = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findMany", {
            orderBy: {
                createdAt: "desc"
            }
        });
        return h.response(notifications).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get the notifications" }).code(500);
    }
};
exports.listNotificationsHandler = listNotificationsHandler;
//list notifications by type
// export const listNotificationsByTypeHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
//     const { prisma } = request.server.app;
//     const type = request.params.type;
//     try{
//         const notifications = await executePrismaMethod(prisma, "engagementsManager", "findMany", {
//             where: {
//                 type: type
//             }
//         });
//         return h.response(notifications).code(200);
//     }catch(err){
//         console.log(err);
//         return h.response({message: "Internal Server Error" + ":failed to get the notifications"}).code(500);
//     }
// }
// export const getNotificationHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
//     const { prisma } = request.server.app;
//     const notificationId = parseInt(request.params.id);
//     try{
//         const notification = await executePrismaMethod(prisma, "notification", "findFirst", {
//             where: {
//                 id: notificationId
//             }
//         });
//         if(notification){
//             return h.response(notification).code(200);
//         }else{
//             return h.response({message: "Notification not found"}).code(404);
//         }
//     }catch(err){
//         console.log(err);
//         return h.response({message: "Internal Server Error" + ":failed to get the notification"}).code(500);
//     }
// }
// export const createMediaNotificationHandler = async (mediaId: number, title: string, description: string, read: boolean) => {
//     const { prisma } = server.app;
//     try{
//         const notification = await executePrismaMethod(prisma, "notification", "create", {
//             data: {
//                 title: title,
//                 description: description,
//                 read: read,
//                 createdAt: getCurrentDate(),
//                 updatedAt: getCurrentDate()
//             },
//             select: {
//                 id: true,
//                 title: true,
//                 description: true,
//                 read: true,
//                 createdAt: true,
//                 updatedAt: true
//             }
//         });
//         if(!notification){
//             const message = "Failed to create the notification";
//             return message;
//         }
//         const mediaNotificationEngagement = await executePrismaMethod(prisma, "engagementsManager", "create", {
//             data: {
//                 notificationId: notification.id,
//                 type: NotificationType.MEDIA,
//                 media:{
//                     connect:{
//                         id: mediaId
//                 }
//             }
//         }
//     });
//         if(!mediaNotificationEngagement){
//             const message = "Failed to create the notification engagement";
//             return message;
//         }
//         const message = title + "  was created successfully";
//         return message;
//     }catch(err){
//         const message = err + " :Failed to create the notification";
//         return message;
//     }
// }
///
//create event notification
const createEventNotificationHandler = async (eventId, specialKey, title, description, read) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "create", {
            data: {
                title: title,
                description: description,
                read: read,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
                notificationEngagements: {
                    create: {
                        type: Helpers_1.NotificationType.EVENT,
                        specialKey: specialKey,
                        event: {
                            connect: {
                                uniqueId: eventId,
                            },
                        },
                    },
                },
            },
        });
        if (notification === null || notification === undefined) {
            const message = "Failed to create the notification";
            console.log(message);
        }
        const message = "notification with ID " + notification.id + "  was created successfully";
        console.log(message);
        return message;
    }
    catch (err) {
        const message = err + " :Failed to create the notification!";
        console.log(message);
        return message;
    }
};
exports.createEventNotificationHandler = createEventNotificationHandler;
//update event notification
const updateEventNotificationHandler = async (notificationId, eventId, specialKey, title, description, read) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "update", {
            where: {
                id: notificationId,
                notificationEngagements: {
                    specialKey: specialKey,
                    type: Helpers_1.NotificationType.EVENT,
                    event: {
                        uniqueId: eventId,
                    },
                },
                data: {
                    title: title,
                    description: description,
                    read: read,
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            },
        });
        if (!notification) {
            const message = " Failed to update the notification :";
            console.log(notification + message);
        }
        const message = "notification with ID " + notification.id + " has been updated successfully";
        const code = 200;
        return { code, message };
    }
    catch (err) {
        const message = err + " :Failed to update the notification";
        const code = 500;
        return { code, message };
    }
};
exports.updateEventNotificationHandler = updateEventNotificationHandler;
//delete event notification
const deleteEventNotificationHandler = async (notificationId, eventId, specialKey) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findUnique", {
            where: {
                id: notificationId,
                notificationEngagements: {
                    specialKey: specialKey,
                    type: Helpers_1.NotificationType.EVENT,
                    event: {
                        uniqueId: eventId
                    }
                }
            }
        });
        if (!notification) {
            const message = "notification not found";
            console.log(message);
        }
        const deleteNotificationEngagement = await (0, Helpers_1.executePrismaMethod)(prisma, "engagementsManager", "delete", {
            where: {
                specialKey: specialKey,
                type: Helpers_1.NotificationType.EVENT,
                notificationId: notification.id,
                event: {
                    uniqueId: eventId
                }
            }
        });
        if (!deleteNotificationEngagement) {
            const message = "Failed to delete the notification engagement";
            console.log(message);
        }
        else {
            const deleteNotification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "delete", {
                where: {
                    id: notification.id
                }
            });
            if (!deleteNotification) {
                const message = "Failed to delete the notification";
                console.log(message);
            }
            const message = "Notification was deleted successfully";
            return message;
        }
    }
    catch (err) {
        const message = err + " :Failed to delete the notification";
        return message;
    }
};
exports.deleteEventNotificationHandler = deleteEventNotificationHandler;
///
// export const updateMediaNotificationHandler = async (mediaId: number, title: string, description: string, read: boolean) => {
//     const { prisma } = server.app;
//     try{
//         const notification = await executePrismaMethod(prisma, "notification", "update", {
//             where: {
//                 id: mediaId
//             },
//             data: {
//                 title: title,
//                 description: description,
//                 read: read
//             },
//             select: {
//                 id: true,
//                 title: true,
//                 description: true,
//                 read: true
//             }
//         });
//         if(!notification){
//             const message = "Failed to update the notification";
//             return message;
//         }
//         const mediaNotificationEngagement = await executePrismaMethod(prisma, "engagementsManager", "update", {
//             where: {
//                 notificationId: notification.id
//             },
//             data: {
//                 type: NotificationType.MEDIA,
//                 media:{
//                     connect:{
//                         id: mediaId
//                 }
//             }
//         }
//     });
//         if(!mediaNotificationEngagement){
//             const message = "Failed to update the notification engagement";
//             return message;
//         }
//         const message = title + "  was updated successfully";
//         return message;
//     }catch(err){
//         const message = err + " :Failed to update the notification";
//         return message;
//     }
// }
//# sourceMappingURL=notificationHandlers.js.map
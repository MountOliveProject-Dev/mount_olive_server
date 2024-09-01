"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaNotificationHandler = exports.updateMediaNotificationHandler = exports.createMediaNotificationHandler = exports.deleteEventNotificationHandler = exports.updateEventNotificationHandler = exports.createEventNotificationHandler = exports.listNotificationsHandler = void 0;
const server_1 = __importDefault(require("../server"));
const Helpers_1 = require("../Helpers");
const listNotificationsHandler = async (request, h) => {
    const { prisma } = request.server.app;
    let data = [];
    try {
        const notifications = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findMany", {
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                title: true,
                description: true,
                read: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!notifications) {
            console.log("No notifications found");
            return h.response({ message: "No notifications found" }).code(404);
        }
        const getMedia = await (0, Helpers_1.executePrismaMethod)(prisma, "engagementsManager", "findMany", {
            orderBy: {
                id: "asc"
            }, select: {
                id: true,
                notificationId: true,
                mediaId: true,
                eventId: true,
                videoStatus: true,
                audioStatus: true,
                eventStatus: true,
                media: {
                    select: {
                        id: true,
                        uniqueId: true,
                        title: true,
                        description: true,
                        url: true,
                        duration: true,
                        type: true,
                        postedAt: true,
                        updatedAt: true
                    }
                },
                event: {
                    select: {
                        id: true,
                        uniqueId: true,
                        title: true,
                        description: true,
                        location: true,
                        date: true,
                        time: true,
                        venue: true,
                        host: true,
                        thumbnail: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
        if (!getMedia) {
            console.log("No associated media found");
        }
        for (let i = 0; i < notifications.length; i++) {
            let type = "";
            let media = {};
            const notificationId = notifications[i].id;
            let notificationMedia = {};
            for (let j = 0; j < getMedia.length; j++) {
                if (getMedia[j].notificationId === notificationId && (getMedia[j].mediaId !== null || getMedia[j].mediaId !== undefined)) {
                    notificationMedia = getMedia[j].media;
                }
                if (getMedia[j].notificationId === notificationId && (getMedia[j].eventId !== null || getMedia[j].eventId !== undefined)) {
                    notificationMedia = getMedia[j].event;
                }
            }
            if (notificationMedia && getMedia[i].videoStatus === true) {
                type = Helpers_1.NotificationType.VIDEO;
                media = {
                    id: notificationMedia.id,
                    uniqueId: notificationMedia.uniqueId,
                    title: notificationMedia.title,
                    description: notificationMedia.description,
                    url: notificationMedia.url,
                    postedAt: notificationMedia.postedAt,
                    updatedAt: notificationMedia.updatedAt,
                };
            }
            if (notificationMedia && getMedia[i].audioStatus === true) {
                type = Helpers_1.NotificationType.AUDIO;
                media = {
                    id: notificationMedia.id,
                    uniqueId: notificationMedia.uniqueId,
                    title: notificationMedia.title,
                    description: notificationMedia.description,
                    url: notificationMedia.url,
                    duration: notificationMedia.duration,
                    postedAt: notificationMedia.postedAt,
                    updatedAt: notificationMedia.updatedAt,
                };
            }
            if (notificationMedia && getMedia[i].eventStatus === true) {
                type = Helpers_1.NotificationType.EVENT;
                media = {
                    id: notificationMedia.id,
                    uniqueId: notificationMedia.uniqueId,
                    title: notificationMedia.title,
                    createdAt: notificationMedia.createdAt,
                    updatedAt: notificationMedia.updatedAt,
                    date: notificationMedia.date,
                    time: notificationMedia.time,
                    location: notificationMedia.location,
                    venue: notificationMedia.venue,
                    host: notificationMedia.host,
                    description: notificationMedia.description,
                    thumbnail: notificationMedia.thumbnail,
                };
            }
            const notificationData = {
                notificationId: notifications[i].id,
                notificationTitle: notifications[i].title,
                notificationDescription: notifications[i].description,
                read: notifications[i].read,
                notificationCreatedAt: notifications[i].createdAt,
                notificationUpdatedAt: notifications[i].updatedAt,
                type: type,
            };
            const combinedData = {
                ...notificationData,
                ...media,
            };
            data.push(combinedData);
        }
        return h.response(data).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get the notifications" }).code(500);
    }
};
exports.listNotificationsHandler = listNotificationsHandler;
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
                        eventStatus: true,
                        videoStatus: false,
                        audioStatus: false,
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
        const notificationTitle = title;
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
            },
            data: {
                title: notificationTitle,
                description: description,
                read: read,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        console.log(notification);
        if (!notification) {
            const message = " Failed to update the notification :";
            console.log(notification + message);
            const code = 500;
            return { code, message };
        }
        else {
            const message = "notification with ID " + notification.id + " has been updated successfully";
            const code = 200;
            return { code, message };
        }
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
//create media notification
const createMediaNotificationHandler = async (mediaId, specialKey, title, description, read, type) => {
    const { prisma } = server_1.default.app;
    try {
        let videoStatus = false;
        let eventStatus = false;
        let audioStatus = false;
        if (type === Helpers_1.NotificationType.VIDEO) {
            videoStatus = true;
        }
        else if (type === Helpers_1.NotificationType.AUDIO) {
            audioStatus = true;
        }
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "create", {
            data: {
                title: title,
                description: description,
                read: read,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
                mediaNotifications: {
                    create: {
                        type: type,
                        eventStatus: eventStatus,
                        videoStatus: videoStatus,
                        audioStatus: audioStatus,
                        specialKey: specialKey,
                        media: {
                            connect: {
                                uniqueId: mediaId,
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
exports.createMediaNotificationHandler = createMediaNotificationHandler;
//update media notification
const updateMediaNotificationHandler = async (notificationId, mediaId, specialKey, title, description, read, type) => {
    const { prisma } = server_1.default.app;
    try {
        const notificationTitle = title;
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "update", {
            where: {
                id: notificationId,
                notificationEngagements: {
                    specialKey: specialKey,
                    type: type,
                    media: {
                        uniqueId: mediaId,
                    },
                },
            },
            data: {
                title: notificationTitle,
                description: description,
                read: read,
                updatedAt: (0, Helpers_1.getCurrentDate)(),
            },
        });
        console.log(notification);
        if (!notification) {
            const message = " Failed to update the notification :";
            console.log(notification + message);
            const code = 500;
            return { code, message };
        }
        else {
            const message = "notification with ID " + notification.id + " has been updated successfully";
            const code = 200;
            return { code, message };
        }
    }
    catch (err) {
        const message = err + " :Failed to update the notification";
        const code = 500;
        return { code, message };
    }
};
exports.updateMediaNotificationHandler = updateMediaNotificationHandler;
//delete media notification
const deleteMediaNotificationHandler = async (notificationId, mediaId, specialKey, type) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findUnique", {
            where: {
                id: notificationId,
                notificationEngagements: {
                    specialKey: specialKey,
                    type: type,
                    media: {
                        uniqueId: mediaId
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
                type: type,
                notificationId: notification.id,
                media: {
                    uniqueId: mediaId
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
exports.deleteMediaNotificationHandler = deleteMediaNotificationHandler;
//# sourceMappingURL=notificationHandlers.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaNotificationHandler = exports.updateMediaNotificationHandler = exports.createMediaNotificationHandler = exports.deleteEventNotificationHandler = exports.updateEventNotificationHandler = exports.createEventNotificationHandler = exports.listNotificationsHandler = void 0;
exports.checkIfThereAreNewNotifications = checkIfThereAreNewNotifications;
const server_1 = __importDefault(require("../server"));
const Helpers_1 = require("../Helpers");
const listNotificationsHandler = async (request, h) => {
    const { prisma } = request.server.app;
    let data = [];
    try {
        const notifications = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findMany", {
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                id: true,
                title: true,
                description: true,
                read: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!notifications || notifications.length === 0) {
            let details = "There are no notifications in the system";
            let logtype = Helpers_1.LogType.WARNING;
            if (!notifications) {
                details = "Failed to fetch notifications: " + notifications;
                logtype = Helpers_1.LogType.ERROR;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No notifications found", logtype, details);
            return h.response({ message: "No notifications found" }).code(404);
        }
        const mediaItems = await (0, Helpers_1.executePrismaMethod)(prisma, "engagementsManager", "findMany", {
            orderBy: {
                notificationId: "asc",
            },
            select: {
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
                        updatedAt: true,
                    },
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
                        updatedAt: true,
                    },
                },
            },
        });
        if (!mediaItems || mediaItems.length === 0) {
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No media items found", Helpers_1.LogType.WARNING);
            return h.response({ message: "No media items found" }).code(404);
        }
        for (const notification of notifications) {
            const notificationData = {
                notificationId: notification.id,
                notificationTitle: notification.title,
                notificationDescription: notification.description,
                read: notification.read,
                notificationCreatedAt: notification.createdAt,
                notificationUpdatedAt: notification.updatedAt,
                type: "",
            };
            const associatedMedia = mediaItems.find((media) => media.notificationId === notification.id);
            if (associatedMedia) {
                if (associatedMedia.videoStatus && associatedMedia.media) {
                    notificationData.type = Helpers_1.NotificationType.VIDEO;
                    Object.assign(notificationData, {
                        id: associatedMedia.media.id,
                        uniqueId: associatedMedia.media.uniqueId,
                        title: associatedMedia.media.title,
                        description: associatedMedia.media.description,
                        url: associatedMedia.media.url,
                        postedAt: associatedMedia.media.postedAt,
                        updatedAt: associatedMedia.media.updatedAt,
                    });
                }
                else if (associatedMedia.audioStatus && associatedMedia.media) {
                    notificationData.type = Helpers_1.NotificationType.AUDIO;
                    Object.assign(notificationData, {
                        id: associatedMedia.media.id,
                        uniqueId: associatedMedia.media.uniqueId,
                        title: associatedMedia.media.title,
                        description: associatedMedia.media.description,
                        url: associatedMedia.media.url,
                        duration: associatedMedia.media.duration,
                        postedAt: associatedMedia.media.postedAt,
                        updatedAt: associatedMedia.media.updatedAt,
                    });
                }
                else if (associatedMedia.eventStatus && associatedMedia.event) {
                    notificationData.type = Helpers_1.NotificationType.EVENT;
                    Object.assign(notificationData, {
                        id: associatedMedia.event.id,
                        uniqueId: associatedMedia.event.uniqueId,
                        title: associatedMedia.event.title,
                        createdAt: associatedMedia.event.createdAt,
                        updatedAt: associatedMedia.event.updatedAt,
                        date: associatedMedia.event.date,
                        time: associatedMedia.event.time,
                        location: associatedMedia.event.location,
                        venue: associatedMedia.event.venue,
                        host: associatedMedia.event.host,
                        description: associatedMedia.event.description,
                        thumbnail: associatedMedia.event.thumbnail,
                    });
                }
            }
            data.push(notificationData);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Notifications fetched successfully", Helpers_1.LogType.INFO);
        return h.response(data).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Internal Server Error: failed to get the notifications", Helpers_1.LogType.ERROR, err);
        return h
            .response({
            message: "Internal Server Error: failed to get the notifications",
        })
            .code(500);
    }
};
exports.listNotificationsHandler = listNotificationsHandler;
///
//create event notification
const createEventNotificationHandler = async (eventId, specialKey, title, description, read, thumbnailStatus) => {
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
                        thumbnailStatus: thumbnailStatus,
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
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, message, Helpers_1.LogType.INFO);
        return message;
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the notification", Helpers_1.LogType.ERROR, err);
        const message = err + " :Failed to create the notification!";
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
        if (!notification) {
            const message = " Failed to update the notification :";
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, message, Helpers_1.LogType.ERROR);
            const code = 500;
            return { code, message };
        }
        else {
            const message = "notification with ID " + notification.id + " has been updated successfully";
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, message, Helpers_1.LogType.INFO);
            const code = 200;
            return { code, message };
        }
    }
    catch (err) {
        const message = err + " :Failed to update the notification";
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, message, Helpers_1.LogType.ERROR, err);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.WARNING);
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
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.ERROR, deleteNotificationEngagement);
        }
        else {
            const deleteNotification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "delete", {
                where: {
                    id: notification.id
                }
            });
            if (!deleteNotification) {
                const message = "Failed to delete the notification";
                (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.ERROR, deleteNotification);
            }
            const message = "Notification was deleted successfully";
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.INFO);
            return message;
        }
    }
    catch (err) {
        const message = err + " :Failed to delete the notification";
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.ERROR, err);
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
        let thumbnailStatus = false;
        if (type === Helpers_1.NotificationType.VIDEO) {
            videoStatus = true;
        }
        else if (type === Helpers_1.NotificationType.AUDIO) {
            audioStatus = true;
        }
        else if (type === Helpers_1.NotificationType.IMAGE) {
            thumbnailStatus = true;
        }
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "create", {
            data: {
                title: title,
                description: description,
                read: read,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)(),
                notificationEngagements: {
                    create: {
                        type: type,
                        eventStatus: eventStatus,
                        videoStatus: videoStatus,
                        audioStatus: audioStatus,
                        thumbnailStatus: thumbnailStatus,
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
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, message, Helpers_1.LogType.ERROR);
            console.log(message);
        }
        const message = "notification with ID " + notification.id + "  was created successfully";
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, message, Helpers_1.LogType.INFO);
        return message;
    }
    catch (err) {
        const message = err + " :Failed to create the notification!";
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, message, Helpers_1.LogType.ERROR, err);
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
        if (!notification) {
            const message = " Failed to update the notification :";
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, message, Helpers_1.LogType.ERROR, notification);
            const code = 500;
            return { code, message };
        }
        else {
            const message = "notification with ID " + notification.id + " has been updated successfully";
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, message, Helpers_1.LogType.INFO);
            const code = 200;
            return { code, message };
        }
    }
    catch (err) {
        const message = err + " :Failed to update the notification";
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, message, Helpers_1.LogType.ERROR, err);
        const code = 500;
        return { code, message };
    }
};
exports.updateMediaNotificationHandler = updateMediaNotificationHandler;
//delete media notification
const deleteMediaNotificationHandler = async (notificationId, mediaId, specialKey, type) => {
    const { prisma } = server_1.default.app;
    try {
        let audio = false;
        let video = false;
        if (type === Helpers_1.NotificationType.AUDIO) {
            audio = true;
        }
        else if (type === Helpers_1.NotificationType.VIDEO) {
            video = true;
        }
        const notificationEngagements = await (0, Helpers_1.executePrismaMethod)(prisma, "engagementsManager", "findFirst", {
            where: {
                specialKey: specialKey,
                type: type,
                mediaId: mediaId,
                notificationId: notificationId
            },
            select: {
                id: true,
                notificationId: true,
            },
        });
        const deleteNotificationEngagement = await (0, Helpers_1.executePrismaMethod)(prisma, "engagementsManager", "delete", {
            where: {
                id: notificationEngagements.id,
            },
        });
        if (!deleteNotificationEngagement) {
            const message = "Failed to delete the notification";
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.ERROR, deleteNotificationEngagement);
        }
        const deleteNotification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "delete", {
            where: {
                id: notificationEngagements.notificationId,
            },
        });
        if (!deleteNotification) {
            const message = "Failed to delete the notification";
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.ERROR, deleteNotification.toString());
            return message;
        }
        return "notification has been deleted successfully";
    }
    catch (err) {
        const message = err + " :Failed to delete the notification";
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, message, Helpers_1.LogType.ERROR, err);
        return message;
    }
};
exports.deleteMediaNotificationHandler = deleteMediaNotificationHandler;
//function to check if there are any new notifications with 8 hours
async function checkIfThereAreNewNotifications(request, h) {
}
//# sourceMappingURL=notificationHandlers.js.map
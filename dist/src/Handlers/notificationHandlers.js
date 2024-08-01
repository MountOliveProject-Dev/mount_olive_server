"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMediaNotificationHandler = exports.deleteEventNotificationHandler = exports.updateEventNotificationHandler = exports.createEventNotificationHandler = exports.createMediaNotificationHandler = exports.getNotificationHandler = exports.listNotificationsByTypeHandler = exports.listNotificationsHandler = void 0;
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
const listNotificationsByTypeHandler = async (request, h) => {
    const { prisma } = request.server.app;
    const type = request.params.type;
    try {
        const notifications = await (0, Helpers_1.executePrismaMethod)(prisma, "notificationEngagements", "findMany", {
            where: {
                type: type
            }
        });
        return h.response(notifications).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get the notifications" }).code(500);
    }
};
exports.listNotificationsByTypeHandler = listNotificationsByTypeHandler;
const getNotificationHandler = async (request, h) => {
    const { prisma } = request.server.app;
    const notificationId = parseInt(request.params.id);
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "findFirst", {
            where: {
                id: notificationId
            }
        });
        if (notification) {
            return h.response(notification).code(200);
        }
        else {
            return h.response({ message: "Notification not found" }).code(404);
        }
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get the notification" }).code(500);
    }
};
exports.getNotificationHandler = getNotificationHandler;
const createMediaNotificationHandler = async (mediaId, title, description, read) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "create", {
            data: {
                title: title,
                description: description,
                read: read,
                createdAt: (0, Helpers_1.getCurrentDate)(),
                updatedAt: (0, Helpers_1.getCurrentDate)()
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
        if (!notification) {
            const message = "Failed to create the notification";
            return message;
        }
        const mediaNotificationEngagement = await (0, Helpers_1.executePrismaMethod)(prisma, "notificationEngagements", "create", {
            data: {
                notificationId: notification.id,
                type: Helpers_1.NotificationType.MEDIA,
                media: {
                    connect: {
                        id: mediaId
                    }
                }
            }
        });
        if (!mediaNotificationEngagement) {
            const message = "Failed to create the notification engagement";
            return message;
        }
        const message = title + "  was created successfully";
        return message;
    }
    catch (err) {
        const message = err + " :Failed to create the notification";
        return message;
    }
};
exports.createMediaNotificationHandler = createMediaNotificationHandler;
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
        const message = title + "  was created successfully";
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
const updateEventNotificationHandler = async (eventId, specialKey, title, description, read) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "update", {
            where: {
                notificationEngagements: {
                    specialKey: specialKey,
                    type: Helpers_1.NotificationType.EVENT,
                    event: {
                        uniqueId: eventId
                    }
                },
                data: {
                    title: title,
                    description: description,
                    read: read,
                    updatedAt: (0, Helpers_1.getCurrentDate)()
                }
            }
        });
        if (!notification) {
            const message = "Failed to update the notification";
            console.log(message);
        }
        const message = title + "  was updated successfully";
        return message;
    }
    catch (err) {
        const message = err + " :Failed to update the notification";
        return message;
    }
};
exports.updateEventNotificationHandler = updateEventNotificationHandler;
//delete event notification
const deleteEventNotificationHandler = async (eventId, specialKey) => {
    const { prisma } = server_1.default.app;
    try {
        const eventNotificationEngagement = await (0, Helpers_1.executePrismaMethod)(prisma, "notificationEngagements", "findUnique", {
            where: {
                specialKey: specialKey,
                type: Helpers_1.NotificationType.EVENT,
                event: {
                    uniqueId: eventId
                }
            }, select: {
                id: true,
                notificationId: true
            }
        });
        if (!eventNotificationEngagement) {
            const message = "Failed to get the notification engagement";
            console.log(message);
        }
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "delete", {
            where: {
                id: eventNotificationEngagement.notificationId
            }
        });
        if (!notification) {
            const message = "Failed to delete the notification";
            console.log(message);
        }
        const deleteEventNotificationEngagement = await (0, Helpers_1.executePrismaMethod)(prisma, "notificationEngagements", "delete", {
            where: {
                id: eventNotificationEngagement.id
            }
        });
        if (!deleteEventNotificationEngagement) {
            const message = "Failed to delete the notification engagement";
            console.log(message);
        }
        const message = "Notification was deleted successfully";
        return message;
    }
    catch (err) {
        const message = err + " :Failed to delete the notification";
        return message;
    }
};
exports.deleteEventNotificationHandler = deleteEventNotificationHandler;
///
const updateMediaNotificationHandler = async (mediaId, title, description, read) => {
    const { prisma } = server_1.default.app;
    try {
        const notification = await (0, Helpers_1.executePrismaMethod)(prisma, "notification", "update", {
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
        if (!notification) {
            const message = "Failed to update the notification";
            return message;
        }
        const mediaNotificationEngagement = await (0, Helpers_1.executePrismaMethod)(prisma, "notificationEngagements", "update", {
            where: {
                notificationId: notification.id
            },
            data: {
                type: Helpers_1.NotificationType.MEDIA,
                media: {
                    connect: {
                        id: mediaId
                    }
                }
            }
        });
        if (!mediaNotificationEngagement) {
            const message = "Failed to update the notification engagement";
            return message;
        }
        const message = title + "  was updated successfully";
        return message;
    }
    catch (err) {
        const message = err + " :Failed to update the notification";
        return message;
    }
};
exports.updateMediaNotificationHandler = updateMediaNotificationHandler;
//# sourceMappingURL=notificationHandlers.js.map
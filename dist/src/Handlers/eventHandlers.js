"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEventsHandler = listEventsHandler;
exports.createEventHandler = createEventHandler;
exports.updateEventHandler = updateEventHandler;
exports.deleteEventHandler = deleteEventHandler;
exports.getEventHandler = getEventHandler;
exports.searchEventByTitleOrUniqueIDHandler = searchEventByTitleOrUniqueIDHandler;
exports.listEventsByDateHandler = listEventsByDateHandler;
exports.listEventsByDateRangeHandler = listEventsByDateRangeHandler;
const server_1 = __importDefault(require("../server"));
const Helpers_1 = require("../Helpers");
const notificationHandlers_1 = require("./notificationHandlers");
const Helpers_2 = require("../Helpers");
const notificationHandlers_2 = require("./notificationHandlers");
async function listEventsHandler(request, h) {
    const { prisma } = server_1.default.app;
    try {
        const events = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findMany", {
            orderBy: [
                {
                    createdAt: "asc",
                },
            ],
        });
        if (!events) {
            return h.response({ message: "No events found" }).code(404);
        }
        return h.response(events).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" }).code(500);
    }
}
async function createEventHandler(request, h) {
    const { prisma } = request.server.app;
    const { title, description, thumbnail, date, host, time, location, venue } = request.payload;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "create", {
            data: {
                title: title,
                description: description,
                thumbnail: thumbnail,
                location: location,
                venue: venue,
                time: time,
                date: date,
                host: host,
                createdAt: (0, notificationHandlers_2.getCurrentDate)(),
                updatedAt: (0, notificationHandlers_2.getCurrentDate)(),
            },
        });
        if (!event) {
            return h.response({ message: "Failed to create the event" }).code(400);
        }
        const notificationTitle = "A New Event titled" + event.title + "has just been posted!";
        const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
        const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, description, false);
        if (!createNotification) {
            return h.response({ message: "Failed to create the notification" }).code(400);
        }
        return h.response(event).code(201);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to create the event:" + title }).code(500);
    }
}
async function updateEventHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { title, description, thumbnail, uniqueId, host, date, time, location, venue } = request.payload;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "update", {
            where: {
                uniqueId: uniqueId,
            },
            data: {
                title: title,
                description: description,
                thumbnail: thumbnail,
                date: date,
                host: host,
                time: time,
                location: location,
                venue: venue,
                updatedAt: (0, notificationHandlers_2.getCurrentDate)(),
            },
        });
        if (!event) {
            return h.response({ message: "Failed to update the event" }).code(400);
        }
        const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
        const notificationTitle = "The Event titled" + event.title + "has just been posted!";
        const updateNotification = await (0, notificationHandlers_1.updateEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, description, false);
        if (!updateNotification) {
            return h.response({ message: "Failed to update the notification" }).code(400);
        }
        return h.response(event).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to update the event:" + title }).code(500);
    }
}
async function deleteEventHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId } = request.payload;
    try {
        const findEvent = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
        });
        if (!findEvent) {
            return h.response({ message: "Event not found" }).code(404);
        }
        const specialKey = findEvent.uniqueId + Helpers_2.NotificationType.EVENT;
        const deleteNotification = await (0, notificationHandlers_1.deleteEventNotificationHandler)(findEvent.uniqueId, specialKey);
        if (!deleteNotification) {
            return h.response({ message: "Failed to delete the notification" }).code(400);
        }
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "delete", {
            where: {
                id: findEvent.id,
            },
        });
        const message = "Event with uniqueId: " + uniqueId + " was deleted successfully";
        return h.response().code(201).message(message);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to delete the event:" + uniqueId }).code(500);
    }
}
async function getEventHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { uniqueId } = request.params;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
        });
        if (!event) {
            return h.response({ message: "Event not found" }).code(404);
        }
        return h.response(event).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to get the event:" + uniqueId }).code(500);
    }
}
async function searchEventByTitleOrUniqueIDHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { search } = request.payload;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findMany", {
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
        if (!event) {
            return h.response({ message: "Event not found" }).code(404);
        }
        return h.response(event).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to search the event:" + search }).code(500);
    }
}
async function listEventsByDateHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { date } = request.payload;
    try {
        const events = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findMany", {
            where: {
                createdAt: date,
            },
        });
        if (!events) {
            return h.response({ message: "No events found" }).code(404);
        }
        return h.response(events).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to list events by date:" + date }).code(500);
    }
}
async function listEventsByDateRangeHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { startDate, endDate } = request.payload;
    try {
        const events = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findMany", {
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
        if (!events) {
            return h.response({ message: "No events found" }).code(404);
        }
        return h.response(events).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to list events by date range:" + startDate + " - " + endDate }).code(500);
    }
}
//# sourceMappingURL=eventHandlers.js.map
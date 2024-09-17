"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEventsHandler = listEventsHandler;
exports.pushThumbnailToDriveHandler = pushThumbnailToDriveHandler;
exports.createEventHandler = createEventHandler;
exports.updateEventHandler = updateEventHandler;
exports.createManyEventsHandler = createManyEventsHandler;
exports.extractFileIdFromDriveLink = extractFileIdFromDriveLink;
exports.deleteEventHandler = deleteEventHandler;
exports.getEventHandler = getEventHandler;
exports.searchEventByTitleOrUniqueIDHandler = searchEventByTitleOrUniqueIDHandler;
exports.listEventsByDateHandler = listEventsByDateHandler;
exports.listEventsByDateRangeHandler = listEventsByDateRangeHandler;
const server_1 = __importDefault(require("../server"));
const Helpers_1 = require("../Helpers");
const notificationHandlers_1 = require("./notificationHandlers");
const Helpers_2 = require("../Helpers");
const mediaHandlers_1 = require("./mediaHandlers");
const fs_1 = __importDefault(require("fs"));
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
async function pushThumbnailToDriveHandler(name, filePath, mimeType) {
    const prisma = server_1.default.app.prisma;
    try {
        // Ensure the filePath is provided and is a string
        if (!filePath || typeof filePath !== "string") {
            console.log("Invalid file path provided");
            return "Invalid file path provided";
        }
        const shareableLink = await (0, mediaHandlers_1.createThumbnailFile)(name, mimeType, filePath);
        // Remove the file from the 'uploads' directory after processing
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });
        return shareableLink;
    }
    catch (error) {
        console.error("Error uploading file to Google Drive:", error);
        return "Error uploading thumbnail to Google Drive";
    }
}
async function createEventHandler(request, h) {
    const { prisma } = request.server.app;
    const { title, description, date, host, time, location, venue, uploadThumbnail, name, mimeType, filePath, } = request.payload;
    try {
        if (uploadThumbnail === true) {
            const thumbnailLink = await pushThumbnailToDriveHandler(name, filePath, mimeType);
            const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "create", {
                data: {
                    title: title,
                    description: description,
                    location: location,
                    thumbnail: thumbnailLink,
                    venue: venue,
                    time: time,
                    date: date,
                    host: host,
                    createdAt: (0, Helpers_1.getCurrentDate)(),
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            });
            if (!event) {
                return h
                    .response({ message: "Failed to create the event" })
                    .code(400);
            }
            const notificationTitle = "A New Event titled " +
                event.title +
                " has just been posted!";
            const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
            const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, description, false, uploadThumbnail);
            if (!createNotification) {
                return h
                    .response({
                    message: "Failed to create the notification",
                })
                    .code(400);
            }
            return h.response(event).code(201);
        }
        else if (uploadThumbnail === false) {
            const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "create", {
                data: {
                    title: title,
                    description: description,
                    location: location,
                    venue: venue,
                    time: time,
                    date: date,
                    host: host,
                    createdAt: (0, Helpers_1.getCurrentDate)(),
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            });
            if (!event) {
                return h.response({ message: "Failed to create the event" }).code(400);
            }
            const notificationTitle = "A New Event titled " + event.title + " has just been posted!";
            const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
            const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, description, false, uploadThumbnail);
            if (!createNotification) {
                return h.response({ message: "Failed to create the notification" }).code(400);
            }
            return h.response(event).code(201);
        }
        else {
            return h.response({ message: "Bad request, thumbnail status is undefined" }).code(400);
        }
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to create the event:" + title }).code(500);
    }
}
//create an update events handler
async function updateEventHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId, title, description, date, host, time, location, venue, uploadThumbnail, name, mimeType, filePath, } = request.payload;
    let thumbnailLink = null;
    try { //
        const findEvent = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
            select: {
                id: true,
                eventNotifications: {
                    select: {
                        notificationId: true
                    }
                }
            }
        });
        if (!findEvent) {
            return h.response({ message: "Event not found" }).code(404);
        }
        if (uploadThumbnail === true && filePath !== null && mimeType !== null && name !== null) {
            const fileId = await extractFileIdFromDriveLink(findEvent.thumbnail);
            thumbnailLink = await (0, mediaHandlers_1.updateThumbnailHelper)(fileId, name, mimeType, filePath, uploadThumbnail);
            if (!thumbnailLink) {
                return h.response({ message: "Couldn't update thumbnail, please try again " }).code(400);
            }
            const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "update", {
                where: {
                    id: findEvent.id,
                    uniqueId: uniqueId,
                },
                data: {
                    title: title || findEvent.title,
                    description: description || findEvent.description,
                    thumbnail: thumbnailLink || findEvent.thumbnail,
                    location: location || findEvent.location,
                    venue: venue || findEvent.venue,
                    time: time || findEvent.time,
                    date: date || findEvent.date,
                    host: host || findEvent.host,
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            });
            if (!event) {
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            const notificationTitle = "The Event titled " + findEvent.title + " has just been updated!";
            const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
            const updateNotification = await (0, notificationHandlers_1.updateEventNotificationHandler)(findEvent.eventNotifications.notificationId, event.uniqueId, specialKey, notificationTitle, description, false);
            if (updateNotification.code == 500) {
                console.log(updateNotification.message);
                console.log("event deleted");
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            else if (updateNotification.code == 200) {
                return h.response({ message: "Event updated successfully!" }).code(201);
            }
        }
        else if (uploadThumbnail === false && filePath === null && mimeType === null && name === null) {
            const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "update", {
                where: {
                    id: findEvent.id,
                    uniqueId: uniqueId,
                },
                data: {
                    title: title || findEvent.title,
                    description: description || findEvent.description,
                    location: location || findEvent.location,
                    venue: venue || findEvent.venue,
                    time: time || findEvent.time,
                    date: date || findEvent.date,
                    host: host || findEvent.host,
                    updatedAt: (0, Helpers_1.getCurrentDate)(),
                },
            });
            if (!event) {
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            const notificationTitle = "The Event titled " + findEvent.title + " has just been updated!";
            const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
            const updateNotification = await (0, notificationHandlers_1.updateEventNotificationHandler)(findEvent.eventNotifications.notificationId, event.uniqueId, specialKey, notificationTitle, description, false);
            if (updateNotification.code == 500) {
                console.log(updateNotification.message);
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            else if (updateNotification.code == 200) {
                return h.response({ message: "Event updated successfully!" }).code(201);
            }
        }
        else {
            return h.response({ message: "Bad request, thumbnail status is undefined" }).code(400);
        }
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to update the event:" + uniqueId }).code(500);
    }
}
// create many events
async function createManyEventsHandler(request, h) {
    const { prisma } = request.server.app;
    const { events } = request.payload;
    // add the createdAt and updatedAt to events
    events.forEach((event) => {
        event.createdAt = (0, Helpers_1.getCurrentDate)();
        event.updatedAt = (0, Helpers_1.getCurrentDate)();
    });
    try {
        const createdEventIds = []; // Assuming IDs are strings, change to number[] if they are numbers
        for (const event of events) {
            const createdEvent = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "create", {
                data: event,
            });
            createdEventIds.push(parseInt(createdEvent.id));
        }
        console.log('Created event IDs:', createdEventIds);
        if (createdEventIds.length === 0) {
            return h.response({ message: "Failed to create the events" }).code(400);
        }
        //create notification for each event
        for (let i = 0; i < createdEventIds.length; i++) {
            //use the id from the createdEvents to get the uniqueId
            const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findUnique", {
                where: {
                    id: createdEventIds[i],
                },
                select: {
                    uniqueId: true,
                    title: true,
                    description: true,
                },
            });
            const notificationTitle = "A New Event titled " + event.title + " has just been posted!";
            const specialKey = event.uniqueId + Helpers_2.NotificationType.EVENT;
            const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, event.description, false, false);
            if (!createNotification) {
                return h
                    .response({ message: "Failed to create the notification" })
                    .code(400);
            }
        }
        return h.response().code(201);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to create the events" }).code(500);
    }
}
//create a function to extract the id from this link: https://drive.google.com/file/d/${response.data.id}/view?usp=sharing
async function extractFileIdFromDriveLink(link) {
    const splitLink = link.split("/");
    const fileId = splitLink[5];
    return fileId;
}
async function deleteEventHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId } = request.payload;
    try {
        const findEvent = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
            select: {
                id: true,
                uniqueId: true,
                thumbnail: true,
                eventNotifications: {
                    select: {
                        notificationId: true
                    }
                }
            }
        });
        console.log("found the event ", findEvent);
        if (!findEvent) {
            console.log("event not found");
            return h.response({ message: "Event not found" }).code(404);
        }
        let fileId;
        if (findEvent.thumbnail !== null) {
            fileId = await extractFileIdFromDriveLink(findEvent.thumbnail);
            console.log("file id", fileId);
        }
        const deleteThumbnail = await (0, mediaHandlers_1.deleteThumbnailFromDrive)(fileId);
        if (deleteThumbnail === true) {
            const specialKey = findEvent.uniqueId + Helpers_2.NotificationType.EVENT;
            const deleteNotification = await (0, notificationHandlers_1.deleteEventNotificationHandler)(findEvent.eventNotifications.notificationId, findEvent.uniqueId, specialKey);
            if (!deleteNotification) {
                console.log(deleteNotification);
                return h.response({ message: "Failed to delete the notification" }).code(400);
            }
            else {
                console.log("notification deleted");
                console.log(deleteNotification);
            }
            const eventDeletion = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "delete", {
                where: {
                    id: findEvent.id,
                },
            });
            if (!eventDeletion) {
                return h.response({ message: "Failed to delete the event" }).code(400);
            }
            else {
                console.log("event deleted");
            }
            const message = "Event with uniqueId: " + uniqueId + " was deleted successfully";
            return h.response(message).code(201).message(message);
        }
        else {
            console.log("Failed to delete the thumbnail: " + deleteThumbnail);
            return h.response({ message: "Failed to delete event" }).code(400);
        }
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
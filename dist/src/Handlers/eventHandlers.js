"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEventsHandler = listEventsHandler;
exports.pushThumbnailToDriveHandler = pushThumbnailToDriveHandler;
exports.pushThumbnailReplacementToDriveHandler = pushThumbnailReplacementToDriveHandler;
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
const mediaHandlers_1 = require("./mediaHandlers");
const fs_1 = __importDefault(require("fs"));
async function listEventsHandler(request, h) {
    const { prisma } = server_1.default.app;
    try {
        const events = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findMany", {
            orderBy: [
                {
                    updatedAt: "desc",
                },
            ],
        });
        if (!events || events.length === 0) {
            let details = "There are no events in the system";
            let logtype = Helpers_1.LogType.WARNING;
            if (!events) {
                details = "failed to retrieve events from the database" + details.toString();
                logtype = Helpers_1.LogType.ERROR;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "No events found", logtype, details);
            return h.response({ message: "No events found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Events found", Helpers_1.LogType.INFO);
        return h.response(events).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Internal Server Error", Helpers_1.LogType.ERROR, err.toString());
        return h.response({ message: "Internal Server Error" }).code(500);
    }
}
async function pushThumbnailToDriveHandler(name, filePath, mimeType) {
    const prisma = server_1.default.app.prisma;
    try {
        // Ensure the filePath is provided and is a string
        if (!filePath || typeof filePath !== "string") {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Invalid file path provided", Helpers_1.LogType.ERROR);
            return "Invalid file path provided";
        }
        const shareableLink = await (0, mediaHandlers_1.createThumbnailFile)(name, mimeType, filePath);
        // Remove the file from the 'uploads' directory after processing
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to delete file", Helpers_1.LogType.ERROR, err.toString());
            }
        });
        return shareableLink;
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Error uploading thumbnail to Google Drive", Helpers_1.LogType.ERROR, error.toString() || "Error uploading thumbnail to Google Drive");
        return "Error uploading thumbnail to Google Drive";
    }
}
async function pushThumbnailReplacementToDriveHandler(name, filePath, mimeType, uniqueId) {
    const prisma = server_1.default.app.prisma;
    try {
        // Ensure the filePath is provided and is a string
        if (!filePath || typeof filePath !== "string") {
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Invalid file path provided", Helpers_1.LogType.ERROR);
            return "Invalid file path provided";
        }
        const shareableLink = await (0, mediaHandlers_1.updateThumbnailFile)(name, mimeType, filePath, uniqueId);
        // Remove the file from the 'uploads' directory after processing
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to delete file", Helpers_1.LogType.ERROR, err.toString());
            }
        });
        return shareableLink;
    }
    catch (error) {
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Error uploading thumbnail to Google Drive", Helpers_1.LogType.ERROR, error.toString() || "Error uploading thumbnail to Google Drive");
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
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the event", Helpers_1.LogType.ERROR, event.toString());
                return h
                    .response({ message: "Failed to create the event" })
                    .code(400);
            }
            const notificationTitle = "A New Event titled " +
                event.title +
                " has just been posted!";
            const specialKey = event.uniqueId + Helpers_1.NotificationType.EVENT;
            const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, description, false, uploadThumbnail);
            if (!createNotification) {
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the notification", Helpers_1.LogType.ERROR, createNotification.toString());
                return h
                    .response({
                    message: "Failed to create the notification",
                })
                    .code(400);
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Event created successfully", Helpers_1.LogType.INFO);
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
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the event", Helpers_1.LogType.ERROR, event.toString());
                return h.response({ message: "Failed to create the event" }).code(400);
            }
            const notificationTitle = "A New Event titled " + event.title + " has just been posted!";
            const specialKey = event.uniqueId + Helpers_1.NotificationType.EVENT;
            const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, description, false, uploadThumbnail);
            if (!createNotification) {
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the notification", Helpers_1.LogType.ERROR, createNotification.toString());
                return h.response({ message: "Failed to create the notification" }).code(400);
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Event created successfully", Helpers_1.LogType.INFO);
            return h.response(event).code(201);
        }
        else {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Bad request, thumbnail status is undefined", Helpers_1.LogType.ERROR);
            return h.response({ message: "Bad request, thumbnail status is undefined" }).code(400);
        }
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Internal Server Error", Helpers_1.LogType.ERROR, err.toString());
        return h.response({ message: "Internal Server Error" + ":failed to create the event:" + title }).code(500);
    }
}
//create an update events handler
async function updateEventHandler(request, h) {
    const { prisma } = request.server.app;
    const { uniqueId, title, description, date, host, time, location, venue, uploadThumbnail, name, mimeType, filePath, } = request.payload;
    let thumbnailLink = null;
    try {
        const findEvent = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
            select: {
                id: true,
                thumbnail: true,
                eventNotifications: {
                    select: {
                        notificationId: true,
                    },
                },
            },
        });
        if (!findEvent) {
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Event not found", Helpers_1.LogType.WARNING);
            return h.response({ message: "Event not found" }).code(404);
        }
        if (uploadThumbnail === true) {
            let fileId = "";
            if (findEvent.thumbnail !== null &&
                findEvent.thumbnail !== undefined &&
                findEvent.thumbnail !== "Invalid file path provided" &&
                findEvent.thumbnail !== "Error uploading thumbnail to Google Drive") {
                fileId = await extractFileIdFromDriveLink(findEvent.thumbnail);
            }
            else if (findEvent.thumbnail === "Invalid file path provided" ||
                findEvent.thumbnail === "Error uploading thumbnail to Google Drive") {
                fileId = findEvent.thumbnail;
            }
            thumbnailLink = await (0, mediaHandlers_1.updateThumbnailHelper)(fileId, name, mimeType, filePath, uploadThumbnail);
            if (thumbnailLink === "Thumbnail not found") {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Thumbnail not found", Helpers_1.LogType.WARNING);
                return h.response({ message: "Thumbnail not found" }).code(404);
            }
            else if (thumbnailLink === "Error updating thumbnail") {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Error updating thumbnail", Helpers_1.LogType.ERROR);
                return h
                    .response({ message: "Couldn't update thumbnail, please try again" })
                    .code(400);
            }
            else {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, thumbnailLink.toString(), Helpers_1.LogType.INFO);
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
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update the event", Helpers_1.LogType.ERROR, event.toString());
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            const notificationTitle = "The Event titled " + findEvent.title + " has just been updated!";
            const specialKey = event.uniqueId + Helpers_1.NotificationType.EVENT;
            const updateNotification = await (0, notificationHandlers_1.updateEventNotificationHandler)(findEvent.eventNotifications.notificationId, event.uniqueId, specialKey, notificationTitle, description, false);
            if (updateNotification.code == 500) {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update the event", Helpers_1.LogType.ERROR, updateNotification.message);
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            else if (updateNotification.code == 200) {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Event updated successfully", Helpers_1.LogType.INFO);
                return h.response({ message: "Event updated successfully!" }).code(201);
            }
        }
        else if (uploadThumbnail === false) {
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
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update the event", Helpers_1.LogType.ERROR, event.toString());
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            const notificationTitle = "The Event titled " + findEvent.title + " has just been updated!";
            const specialKey = event.uniqueId + Helpers_1.NotificationType.EVENT;
            const updateNotification = await (0, notificationHandlers_1.updateEventNotificationHandler)(findEvent.eventNotifications.notificationId, event.uniqueId, specialKey, notificationTitle, description, false);
            if (updateNotification.code == 500) {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Failed to update the event", Helpers_1.LogType.ERROR, updateNotification.message);
                return h.response({ message: "Failed to update the event" }).code(400);
            }
            else if (updateNotification.code == 200) {
                (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Event updated successfully", Helpers_1.LogType.INFO);
                return h.response({ message: "Event updated successfully!" }).code(201);
            }
        }
        else {
            (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Bad request, thumbnail status is undefined", Helpers_1.LogType.ERROR);
            return h
                .response({ message: "Bad request, thumbnail status is undefined" })
                .code(400);
        }
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.UPDATE, "Internal Server Error", Helpers_1.LogType.ERROR, err.toString());
        return h
            .response({
            message: "Internal Server Error: failed to update the event: " + uniqueId,
        })
            .code(500);
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
        if (createdEventIds.length === 0) {
            (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the events", Helpers_1.LogType.ERROR);
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
            const specialKey = event.uniqueId + Helpers_1.NotificationType.EVENT;
            const createNotification = await (0, notificationHandlers_1.createEventNotificationHandler)(event.uniqueId, specialKey, notificationTitle, event.description, false, false);
            if (!createNotification) {
                (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Failed to create the notification", Helpers_1.LogType.ERROR, createNotification);
                return h
                    .response({ message: "Failed to create the notification" })
                    .code(400);
            }
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Events created successfully", Helpers_1.LogType.INFO);
        return h.response().code(201);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.CREATE, "Internal Server Error", Helpers_1.LogType.ERROR, err.toString());
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
        if (!findEvent) {
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Event not found ", Helpers_1.LogType.WARNING, findEvent.toString());
            return h.response({ message: "Event not found" }).code(404);
        }
        if (findEvent.thumbnail !== null) {
            const fileId = await extractFileIdFromDriveLink(findEvent.thumbnail);
            if (findEvent.thumbnail === "Invalid file path provided" ||
                findEvent.thumbnail ===
                    "Error uploading thumbnail to Google Drive" ||
                findEvent.thumbnail.contains("https://drive.google.com/") ===
                    false) {
                const specialKey = findEvent.uniqueId + Helpers_1.NotificationType.EVENT;
                const deleteNotification = await (0, notificationHandlers_1.deleteEventNotificationHandler)(findEvent.eventNotifications.notificationId, findEvent.uniqueId, specialKey);
                if (!deleteNotification) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the notification", Helpers_1.LogType.ERROR, deleteNotification === null || deleteNotification === void 0 ? void 0 : deleteNotification.toString());
                    return h
                        .response({ message: "Failed to delete the notification" })
                        .code(400);
                }
                else {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Notification deleted", Helpers_1.LogType.WARNING);
                }
                const eventDeletion = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "delete", {
                    where: {
                        id: findEvent.id,
                    },
                });
                if (!eventDeletion) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the event", Helpers_1.LogType.ERROR, eventDeletion.toString());
                    return h
                        .response({ message: "Failed to delete the event" })
                        .code(400);
                }
                else {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Event deleted", Helpers_1.LogType.INFO);
                }
                const message = "Event with uniqueId: " +
                    uniqueId +
                    " was deleted successfully";
                return h.response(message).code(201).message(message);
            }
            const deleteThumbnail = await (0, mediaHandlers_1.deleteThumbnailFromDrive)(fileId);
            if (deleteThumbnail === true) {
                const deleteThumbnailMedia = await (0, Helpers_1.executePrismaMethod)(prisma, "media", "delete", {
                    where: {
                        fileId: fileId,
                    },
                });
                if (!deleteThumbnailMedia) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the thumbnail", Helpers_1.LogType.ERROR, deleteThumbnailMedia.toString());
                }
                const specialKey = findEvent.uniqueId + Helpers_1.NotificationType.EVENT;
                const deleteNotification = await (0, notificationHandlers_1.deleteEventNotificationHandler)(findEvent.eventNotifications.notificationId, findEvent.uniqueId, specialKey);
                if (!deleteNotification) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the notification", Helpers_1.LogType.ERROR, deleteNotification === null || deleteNotification === void 0 ? void 0 : deleteNotification.toString());
                    return h
                        .response({ message: "Failed to delete the notification" })
                        .code(400);
                }
                else {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Notification deleted", Helpers_1.LogType.WARNING);
                }
                const eventDeletion = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "delete", {
                    where: {
                        id: findEvent.id,
                    },
                });
                if (!eventDeletion) {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the event", Helpers_1.LogType.ERROR, eventDeletion.toString());
                    return h
                        .response({ message: "Failed to delete the event" })
                        .code(400);
                }
                else {
                    (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Event deleted", Helpers_1.LogType.INFO);
                }
                const message = "Event with uniqueId: " +
                    uniqueId +
                    " was deleted successfully";
                return h.response(message).code(201).message(message);
            }
            else {
                (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the thumbnail", Helpers_1.LogType.ERROR, deleteThumbnail.toString());
                return h
                    .response({ message: "Failed to delete event" })
                    .code(400);
            }
        }
        const specialKey = findEvent.uniqueId + Helpers_1.NotificationType.EVENT;
        const deleteNotification = await (0, notificationHandlers_1.deleteEventNotificationHandler)(findEvent.eventNotifications.notificationId, findEvent.uniqueId, specialKey);
        if (!deleteNotification) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the notification", Helpers_1.LogType.ERROR, deleteNotification === null || deleteNotification === void 0 ? void 0 : deleteNotification.toString());
            return h
                .response({ message: "Failed to delete the notification" })
                .code(400);
        }
        else {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Notification deleted", Helpers_1.LogType.INFO);
        }
        const eventDeletion = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "delete", {
            where: {
                id: findEvent.id,
            },
        });
        if (!eventDeletion) {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Failed to delete the event", Helpers_1.LogType.ERROR, eventDeletion.toString());
            return h
                .response({ message: "Failed to delete the event" })
                .code(400);
        }
        else {
            (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Event deleted", Helpers_1.LogType.INFO);
        }
        const message = "Event with uniqueId: " + uniqueId + " was deleted successfully";
        return h.response(message).code(201).message(message);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.DELETE, "Internal Server Error", Helpers_1.LogType.ERROR, err.toString());
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
        if (!event || event.length === 0) {
            let details = "Event not found";
            let logtype = Helpers_1.LogType.WARNING;
            if (!event) {
                details = "failed to retrieve the event with id:" + uniqueId + " from the database" + event.toString();
                logtype = Helpers_1.LogType.ERROR;
            }
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Event not found", logtype, details);
            return h.response({ message: "Event not found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Event found", Helpers_1.LogType.INFO);
        return h.response(event).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Internal Server Error", Helpers_1.LogType.ERROR, err.toString());
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
            (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Event not found", Helpers_1.LogType.WARNING);
            return h.response({ message: "Event not found" }).code(404);
        }
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Event found", Helpers_1.LogType.INFO);
        return h.response(event).code(200);
    }
    catch (err) {
        (0, Helpers_1.log)(Helpers_1.RequestType.READ, "Internal Server Error", Helpers_1.LogType.ERROR, err);
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
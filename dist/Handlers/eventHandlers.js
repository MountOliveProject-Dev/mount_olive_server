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
    const { prisma } = server_1.default.app;
    const { title, description, thumbnail } = request.payload;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "create", {
            data: {
                title,
                description,
                thumbnail,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        });
        return h.response(event).code(201);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to create the event:" + title }).code(500);
    }
}
async function updateEventHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { title, description, thumbnail, uniqueId } = request.payload;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "update", {
            where: {
                uniqueId: uniqueId,
            },
            data: {
                title,
                description,
                thumbnail,
                updatedAt: new Date(),
            },
        });
        return h.response(event).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to update the event:" + title }).code(500);
    }
}
async function deleteEventHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { uniqueId } = request.payload;
    try {
        const event = await (0, Helpers_1.executePrismaMethod)(prisma, "event", "delete", {
            where: {
                uniqueId: uniqueId,
            },
        });
        return h.response(event).code(200);
    }
    catch (err) {
        console.log(err);
        return h.response({ message: "Internal Server Error" + ":failed to delete the event:" + uniqueId }).code(500);
    }
}
async function getEventHandler(request, h) {
    const { prisma } = server_1.default.app;
    const { uniqueId } = request.payload;
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
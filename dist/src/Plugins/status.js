"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusPlugin = void 0;
const Helpers_1 = require("../Helpers");
const joi_1 = __importDefault(require("joi"));
const Handlers_1 = require("../Handlers");
exports.statusPlugin = {
    name: "app/status",
    register: async function (server) {
        server.route([
            {
                // default status endpoint
                method: "GET",
                path: "/api/",
                handler: (_, h) => h.response({ up: true }).code(200),
                options: {
                    auth: false,
                },
            },
            {
                method: "GET",
                path: "/api/logs",
                handler: async (request, h) => {
                    const { prisma } = request.server.app;
                    //timestamp is a string
                    const logs = await (0, Helpers_1.executePrismaMethod)(prisma, "log", "findMany", {
                        orderBy: {
                            id: "desc",
                        }
                    });
                    if (!logs) {
                        return h.response({ message: "No logs found" }).code(404);
                    }
                    return h.response({ logs }).code(201);
                },
                options: {
                    auth: false,
                },
            },
            {
                method: "GET",
                path: "/api/logs/{year}/{month}/{day}",
                handler: async (request, h) => {
                    const { prisma } = request.server.app;
                    const { year, month, day } = request.params;
                    const startDate = `${year}-${month}-${day} 00:00`;
                    const endDate = `${year}-${month}-${day} 23:59`;
                    const logs = await (0, Helpers_1.executePrismaMethod)(prisma, "log", "findMany", {
                        where: {
                            timestamp: {
                                gte: startDate,
                                lt: endDate,
                            },
                        },
                    });
                    if (!logs) {
                        return h.response({ message: "No logs found" }).code(404);
                    }
                    return h.response({ logs }).code(201);
                },
                options: {
                    auth: false,
                    validate: {
                        params: joi_1.default.object({
                            year: joi_1.default.number().required(),
                            month: joi_1.default.number().required(),
                            day: joi_1.default.number().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "GET",
                path: "/api/logs/{year}/{month}",
                handler: async (request, h) => {
                    const { prisma } = request.server.app;
                    const { year, month } = request.params;
                    const startDate = `${year}-${month}-01 00:00`;
                    const endDate = `${year}-${month}-31 23:59`;
                    const logs = await (0, Helpers_1.executePrismaMethod)(prisma, "log", "findMany", {
                        where: {
                            timestamp: {
                                gte: startDate,
                                lt: endDate,
                            },
                        },
                    });
                    if (!logs) {
                        return h.response({ message: "No logs found" }).code(404);
                    }
                    return h.response({ logs }).code(201);
                },
                options: {
                    auth: false,
                    validate: {
                        params: joi_1.default.object({
                            year: joi_1.default.number().required(),
                            month: joi_1.default.number().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "GET",
                path: "/api/logs/{year}",
                handler: async (request, h) => {
                    const { prisma } = request.server.app;
                    const { year } = request.params;
                    const startDate = `${year}-01-01 00:00`;
                    const endDate = `${year}-12-31 23:59`;
                    const logs = await (0, Helpers_1.executePrismaMethod)(prisma, "log", "findMany", {
                        where: {
                            timestamp: {
                                gte: startDate,
                                lt: endDate,
                            },
                        },
                    });
                    if (!logs) {
                        return h.response({ message: "No logs found" }).code(404);
                    }
                    return h.response({ logs }).code(201);
                },
                options: {
                    auth: false,
                    validate: {
                        params: joi_1.default.object({
                            year: joi_1.default.number().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "PUT",
                path: "/api/delete-google-drive-folder/{folderId}",
                handler: Handlers_1.deleteGoogleDriveFolder,
                options: {
                    auth: false,
                    validate: {
                        params: joi_1.default.object({
                            folderId: joi_1.default.string().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
        ]);
    },
};
//# sourceMappingURL=status.js.map
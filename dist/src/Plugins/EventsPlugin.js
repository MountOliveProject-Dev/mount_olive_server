"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsPlugin = void 0;
const joi_1 = __importDefault(require("joi"));
const Handlers_1 = require("../Handlers");
const Validators_1 = require("../Validators");
exports.eventsPlugin = {
    name: "app/events",
    dependencies: ["prisma"],
    register: async function (server) {
        server.route([
            {
                method: "GET",
                path: "/api/events",
                handler: Handlers_1.listEventsHandler,
                options: {
                    auth: false,
                },
            },
            {
                method: "GET",
                path: "/api/events/{uniqueId}",
                handler: Handlers_1.getEventHandler,
                options: {
                    auth: false,
                    validate: {
                        params: joi_1.default.object({
                            uniqueId: joi_1.default.string().required(),
                        }),
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/events/create-event",
                handler: Handlers_1.createEventHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: Validators_1.createEventInputValidator,
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/events/create-many-event",
                handler: Handlers_1.createManyEventsHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: Validators_1.createManyEventsInputValidator,
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/events/update-event",
                handler: Handlers_1.updateEventHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: Validators_1.updateEventInputValidator,
                        failAction: (request, h, err) => {
                            throw err;
                        },
                    },
                },
            },
            {
                method: "POST",
                path: "/api/events/delete-event",
                handler: Handlers_1.deleteEventHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: joi_1.default.object({
                            uniqueId: joi_1.default.string().required(),
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
//# sourceMappingURL=EventsPlugin.js.map
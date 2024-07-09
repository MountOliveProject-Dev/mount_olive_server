"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsPlugin = void 0;
const Handlers_1 = require("../Handlers");
exports.eventsPlugin = {
    name: 'app/events',
    dependencies: ['prisma'],
    register: async function (server) {
        server.route({
            method: 'GET',
            path: '/api/events',
            handler: Handlers_1.listEventsHandler,
        });
    }
};
//# sourceMappingURL=EventsPlugin.js.map
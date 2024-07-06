"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsPlugin = void 0;
exports.eventsPlugin = {
    name: 'app/events',
    dependencies: ['prisma'],
    register: async function (server) {
        server.route({
            method: 'GET',
            path: '/events',
            handler: async () => {
                return {
                    ok: true
                };
            }
        });
    }
};
//# sourceMappingURL=EventsPlugin.js.map
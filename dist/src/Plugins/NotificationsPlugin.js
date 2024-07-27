"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsPlugin = void 0;
const Handlers_1 = require("../Handlers");
exports.notificationsPlugin = {
    name: 'app/notifications',
    dependencies: ['prisma'],
    register: async function (server) {
        server.route({
            method: "GET",
            path: "/api/notifications",
            handler: Handlers_1.listNotificationsHandler,
            options: {
                auth: false,
            },
        });
    }
};
//# sourceMappingURL=NotificationsPlugin.js.map
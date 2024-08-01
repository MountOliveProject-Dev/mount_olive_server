"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusPlugin = void 0;
exports.statusPlugin = {
    name: 'app/status',
    register: async function (server) {
        server.route({
            // default status endpoint
            method: 'GET',
            path: '/api/',
            handler: (_, h) => h.response({ up: true }).code(200),
            options: {
                auth: false,
            },
        });
    },
};
//# sourceMappingURL=status.js.map
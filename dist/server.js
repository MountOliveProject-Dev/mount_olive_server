"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
exports.startServer = startServer;
const dotenv_1 = __importDefault(require("dotenv"));
const hapi_1 = __importDefault(require("@hapi/hapi"));
const Plugins_1 = require("./Plugins");
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === "production";
const server = hapi_1.default.server({
    port: process.env.PORT || 8001,
    host: process.env.HOST || "localhost",
    routes: {
        cors: {
            origin: ["*"],
            credentials: true,
            headers: ["Accept", "Content-Type", "Authorization"],
            additionalHeaders: ["cache-control", "x-requested-with"],
            exposedHeaders: ["Access-Control-Allow-Origin"],
        },
    },
});
exports.default = server;
async function createServer() {
    if (!isProduction) {
        console.log("Running in development mode...");
    }
    else {
        console.log("Running in production mode...");
    }
    await server.register([Plugins_1.pm2plugin, Plugins_1.prismaPlugin]);
    await server.initialize();
    return server;
}
async function startServer(server) {
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
    return server;
}
process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuthPlugin = exports.API_AUTH_STRATEGY = void 0;
const HapiFirebaseAuth = __importStar(require("hapi-firebase-auth"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const Handlers_1 = require("../Handlers");
exports.API_AUTH_STRATEGY = "firebase";
exports.firebaseAuthPlugin = {
    name: "app/firebase-auth",
    register: async function (server) {
        await server.register({
            plugin: HapiFirebaseAuth,
            options: {
                firebase: {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY,
                },
                tokenOptions: {
                    audience: process.env.FIREBASE_PROJECT_ID,
                },
            },
        });
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY,
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        server.auth.strategy(exports.API_AUTH_STRATEGY, "firebase", {
            validate: Handlers_1.decodeAuthToken,
        });
        server.auth.default(exports.API_AUTH_STRATEGY);
        server.route({
            method: "GET",
            path: "/api/authenticated/sayHello",
            handler: async (request, h) => {
                return h.response({ message: "Hello, World!" }).code(200);
            },
            options: {
                auth: exports.API_AUTH_STRATEGY,
            },
        });
    },
};
//# sourceMappingURL=firebaseAuthPlugin.js.map
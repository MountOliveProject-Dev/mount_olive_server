"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAPIToken = validateAPIToken;
exports.createUserHandler = createUserHandler;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_JWT_SECRET";
const JWT_ALGORITHM = "HS256";
const Helpers_1 = require("../Helpers");
async function validateAPIToken(decoded, request, h) {
    const { prisma } = request.server.app;
    const { id, email, token } = decoded;
    try {
        const findUser = await (0, Helpers_1.executePrismaMethod)(prisma, "user", "findUnique", {
            where: {
                id: id,
                email: email,
            },
        });
        //
        if (!findUser) {
            console.log("User not found");
            return {
                isValid: false,
                errorMessage: "Invalid credentials! User does not exist",
            };
        }
        if (findUser.expiresAt < new Date() || !findUser.active) {
            console.log("User was inactive for too long, sign in again");
            if (findUser.token != token) {
                return {
                    isValid: false,
                    errorMessage: "Invalid Token",
                };
            }
            return {
                isValid: false,
                errorMessage: "User was inactive for too long, sign in again",
            };
        }
        return {
            isValid: true,
            credentials: {
                id: findUser.id,
                email: findUser.email,
                role: findUser.role,
                token: findUser.token
            },
        };
    }
    catch (err) {
        request.log(["error", "auth", "db"], `Failed to get information from database: ${err}`);
        return {
            isValid: false,
            errorMessage: "Validation Error, failed to get information from database",
        };
    }
}
function generateAuthToken(email, id, role) {
    const jwtPayload = { email, id, role };
    return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        noTimestamp: true,
    });
}
async function createUserHandler(request, h) {
    const { prisma } = request.server.app;
    const { email, role } = request.payload;
    try {
        const checkIfUserExists = await (0, Helpers_1.executePrismaMethod)(prisma, "user", "findUnique", {
            where: {
                email: email
            }
        });
        if (!checkIfUserExists) {
        }
        const user = await (0, Helpers_1.executePrismaMethod)(prisma, "user", "create", {
            data: {
                email: email,
                role: role,
                active: false,
                expiresAt: new Date(Date.now()),
            }
        });
        if (!user) {
        }
        const token = generateAuthToken(email, user.id, role);
        const updatedUser = await (0, Helpers_1.executePrismaMethod)(prisma, "user", "update", {
            where: {
                id: user.id,
            },
            data: {
                token: token,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                active: true,
            },
        });
    }
    catch (err) {
        console.log(err);
    }
}
//# sourceMappingURL=authHandlers.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeAuthToken = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const decodeAuthToken = async (decoded, request, h) => {
    try {
        // Verify the token using Firebase Admin SDK
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(decoded.token);
        // Extract user information from the decoded token
        const { email, name } = decodedToken;
        // Assuming the name is in the format "FirstName LastName"
        const [firstName, lastName] = name.split(" ");
        // Return credentials object to be accessible in request.auth.credentials
        return {
            isValid: true,
            credentials: {
                email,
                firstName,
                lastName,
            },
        };
    }
    catch (error) {
        // Handle token verification errors
        console.error("Error verifying Firebase token:", error);
        return { isValid: false };
    }
};
exports.decodeAuthToken = decodeAuthToken;
//# sourceMappingURL=authHandlers.js.map
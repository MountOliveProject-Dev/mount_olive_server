"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFirebaseUsers = getAllFirebaseUsers;
exports.verifyToken = verifyToken;
exports.verifyUser = verifyUser;
const Handlers_1 = require("../Handlers");
async function getAllFirebaseUsers() {
    try {
        const listUsersResult = await Handlers_1.fireBaseAdmin.auth().listUsers();
        const users = listUsersResult.users.map((userRecord) => ({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            disabled: userRecord.disabled,
        }));
        console.log("Users:", users);
    }
    catch (error) {
        console.error("Error listing users:", error);
    }
}
async function verifyToken(token) {
    try {
        const decodedToken = await Handlers_1.fireBaseAdmin.auth().verifyIdToken(token);
        console.log("Decoded Token:", decodedToken);
    }
    catch (error) {
        console.error("Error verifying token:", error);
    }
}
async function verifyUser(email) {
    try {
        const user = await Handlers_1.fireBaseAdmin.auth().getUserByEmail(email);
        console.log("User:", user);
    }
    catch (error) {
        console.error("Error verifying user:", error);
    }
}
//# sourceMappingURL=firebaseHandler.js.map
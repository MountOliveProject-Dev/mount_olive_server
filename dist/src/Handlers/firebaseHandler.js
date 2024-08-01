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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_PRIVATE_KEY = void 0;
exports.getAllFirebaseUsers = getAllFirebaseUsers;
exports.verifyToken = verifyToken;
exports.verifyUser = verifyUser;
const admin = __importStar(require("firebase-admin"));
const dotenv = __importStar(require("dotenv"));
exports.FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3iphWVYzR8bmJ\n6n7jckUFzLP0uyUxvrhzbvxc5Tyt7NfxfSr9lIgTVxiS1yz7OVMegmp1EpPafPA0\na29wIe5x+MpefYEpqcCZu/G0a9dmXpG8bxIEblVPW197JrT7ByUAGFt9zEAmYYpb\nCfFw8czoq/ceiKX0Skvf6ByKGnNWub+Fu/B4CSTGv1galn/PyhUZo6B7Fy0xqMO/\nq/vNV4KpWpYvxqOgc5voCG+Nd6vj5Gx9BK4/CLvpTzSKJHzcoCSOq+XzY188VGEJ\nrFwC3xAxFiFRjAzE3gDYQb8VXw4F6KwU+dfuJc1UtHc1SVdC1+DcI61s0OEQWP7v\nNpphvAshAgMBAAECggEAAaDAW7lj9VzAOUGmM1OtteeZ500Ufzt006b/ElEBDqJv\n3i4KLNzCQe9fHW0qTfi1MU/w0O3fHGxIskd5GNlfoDG8SuqMD3NBkaSmZb9rH0AJ\ne7w9m/S824rnylOzImLcjQKqS+/GReMpl7VpAvXfzB2pNr7U9pApkPq0NPTOPxaE\n0RY8WK6VSgAHtxUjEXEjV0ikwXiLmUGP02nh4ozpNnNI5g0ZO3oxiHoyngHMGvXH\nspfr+SSPkADAjo70IMGHIyJrh9ngLwBheJ1NTgr9THcyWWXvg8oX6rMzr1aYyr99\nusYyzByO2GvTGXnzyi1SVkS5mzuP1jnub53JGtDG/QKBgQDvHIMeMNwzjzCy/lrH\nd5v7ARcD4pmidgRqP9eGHrDAj3+1XcJmGV3GhrWCd4gKBA/SEa6w8x+VPAGHZ+qu\nc/m7Ul555ZrGzw5ONScGPp7PGQL+baBittAe8GhPjxvSToQ2SBoqIbsMup1oBv9m\n7iQJm2pUeryCgHeCIxVo7CUWYwKBgQDEgUuRYuOYsNeQDBD/XzLabd5SDeHsVpfb\nPYU+kSvdPzItDQgkXB2hXmwtGwnRe1feQ/45uqg6HvpBqhXk7y/9XBShuf2uH6Pc\nKMz3rtswSL3HlzpYk1q0ckW7KWb5cO3YJRykqkldFHqMwHrVCCYuoha0gVNA5YwC\nYDI9doW9qwKBgQCK+2qnCMVlXqxyze9cE4Thf7+t7W9Zg/mK/HK8rWgVdRNJCyds\niv/73d7w56N2FuhPNSHyDk7kQk2tM9Sv9A9LN1Rcy/2L41wwTyrQsWNDgwk/c98O\noa4U3a3z2H3WXvbwSjaTGKoNewb1KWQYowDlaKWEVxbtT9inFtdh9iiUewKBgQDA\nywYEN1yLk31684u9sX4oNkE4iixNf0vwKzTOhQnfQUCOWMnTOplLmGNUAcIpR/WW\nuWj05MBmfbwUrrZabZ3M2wnW/q74pkxTFai7nU+p2MRxzVrOSoxkm/T0QxOnyfdg\n6FBo8jWWYCA4diRNXHhxqk/Se0veURiDwDOqf92JjwKBgHXh8z+nkJjPoV1d/epF\n6XYP9HzeGElc0xIN0pOmwE3tedTH97AsZvQmdef7bKysoss/63qiQoJp23PGivg5\nK4b1ssbb3EejXWiMjVpdetwLrSzyVKfL6AtDRVuzTSS0ytNlXKPyDTtHsyRwEuR1\n7hTA6CkRUWoadyDNgMniw7TA\n-----END PRIVATE KEY-----\n";
dotenv.config();
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: exports.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});
exports.default = admin;
async function getAllFirebaseUsers() {
    try {
        const listUsersResult = await admin.auth().listUsers();
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
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log("Decoded Token:", decodedToken);
    }
    catch (error) {
        console.error("Error verifying token:", error);
    }
}
async function verifyUser(email) {
    try {
        const user = await admin.auth().getUserByEmail(email);
        console.log("User:", user);
    }
    catch (error) {
        console.error("Error verifying user:", error);
    }
}
//# sourceMappingURL=firebaseHandler.js.map
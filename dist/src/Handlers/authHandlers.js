"use strict";
// import Hapi, { server } from "@hapi/hapi";
// import admin from "firebase-admin";
// export const decodeAuthToken = async ( decoded, request: Hapi.Request, h: Hapi.ResponseToolkit) => {
//   try {
//     // Verify the token using Firebase Admin SDK
//     const decodedToken = await admin.auth().verifyIdToken(decoded.token);
//     // Extract user information from the decoded token
//     const { email, name } = decodedToken;
//     // Assuming the name is in the format "FirstName LastName"
//     const [firstName, lastName] = name.split(" ");
//     // Return credentials object to be accessible in request.auth.credentials
//     return {
//       isValid: true,
//       credentials: {
//         email,
//         firstName,
//         lastName,
//       },
//     };
//   } catch (error) {
//     // Handle token verification errors
//     console.error("Error verifying Firebase token:", error);
//     return { isValid: false };
//   }
// };
//# sourceMappingURL=authHandlers.js.map
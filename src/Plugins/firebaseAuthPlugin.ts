// import * as HapiFirebaseAuth from "hapi-firebase-auth";
// import Hapi from "@hapi/hapi";
// import admin from "firebase-admin";
// import {decodeAuthToken } from "../Handlers";

// export const API_AUTH_STRATEGY = "firebase";

// declare module '@hapi/hapi' {
//   export interface AuthCredentials {
//     email: string;
//     firstName: string;
//     lastName: string;
//   }
// }
// export const firebaseAuthPlugin: Hapi.Plugin<null> = {
//   name: "app/firebase-auth",
//   register: async function (server: Hapi.Server) {
//     await server.register({
//       plugin: HapiFirebaseAuth,
//       options: {
//         firebase: {
//           projectId: process.env.FIREBASE_PROJECT_ID,
//           clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//           privateKey: process.env.FIREBASE_PRIVATE_KEY,
//         },
//         tokenOptions: {
//           audience: process.env.FIREBASE_PROJECT_ID,
//         },
//       },
//     });

//     admin.initializeApp({
//         credential: admin.credential.cert({
//             projectId: process.env.FIREBASE_PROJECT_ID,
//             clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//             privateKey: process.env.FIREBASE_PRIVATE_KEY,
//         }),
//         databaseURL: process.env.FIREBASE_DATABASE_URL,
//     });


//     server.auth.strategy(API_AUTH_STRATEGY, "firebase", {
//       validate: decodeAuthToken,
//     });

//     server.auth.default(API_AUTH_STRATEGY);

//     server.route({
   
//         method: "GET",
//         path: "/api/authenticated/sayHello",
//         handler: async (request, h) => {
//             return h.response({ message: "Hello, World!" }).code(200);
//         },
//         options: {
//             auth: API_AUTH_STRATEGY,
//         },
//     });

//   },
// };

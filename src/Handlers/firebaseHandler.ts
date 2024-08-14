import Hapi from '@hapi/hapi';
import * as admin from 'firebase-admin';
import { fireBaseAdmin } from '../Handlers';
import * as dotenv from "dotenv";


export async function getAllFirebaseUsers() {
  try {
    const listUsersResult = await fireBaseAdmin.auth().listUsers();
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
    }));
    console.log("Users:", users);
  } catch (error) {
    console.error("Error listing users:", error);
    
  }
}

export async function verifyToken(token: string) {
  try {
    const decodedToken = await fireBaseAdmin.auth().verifyIdToken(token);
    console.log("Decoded Token:", decodedToken);
  } catch (error) {
    console.error("Error verifying token:", error);
  }
}

export async function verifyUser(email: string) {
  try {
    const user = await fireBaseAdmin.auth().getUserByEmail(email);
    console.log("User:", user);
  } catch (error) {
    console.error("Error verifying user:", error);
  }
}
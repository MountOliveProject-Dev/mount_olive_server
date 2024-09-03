import Hapi from "@hapi/hapi";
import  server from "../server";
import { google } from "googleapis";
import fs from "fs";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import dotenv from "dotenv";
import {
  executePrismaMethod,
  MediaType,
  getCurrentDate,
  NotificationType,
  folderType,
} from "../Helpers";

import multer from "multer";
import { MediaInput, folderInput } from "../Interfaces";
import {
  createMediaNotificationHandler,
  updateMediaNotificationHandler,
  deleteMediaNotificationHandler,
} from "./notificationHandlers";


const upload = multer({ dest: "uploads/" });
dotenv.config();


export async function createVideoMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {url, title, description} = request.payload as MediaInput;
    

    try{

   
        const media = await executePrismaMethod(prisma, "media", "create", {
            data: {
                url: url,
                type: MediaType.VIDEO,
                title: title,
                description: description,
                postedAt: getCurrentDate(),
                updatedAt: getCurrentDate()
            }
        });
        if(!media){
            console.log("Failed to create video media");
            return h.response({message: "Failed to create video media"}).code(400);
        }
        const type = NotificationType.VIDEO;
        const read = false;
        const notificationTitle = "A New Video titled " + title + " has just been posted!";
        const specialKey = media.uniqueId + NotificationType.VIDEO;
        const notification = await createMediaNotificationHandler(
            media.uniqueId,
            specialKey,
            notificationTitle,
            description,
            read,
            type,
        );
        console.log(notification);
        if(!notification){
            console.log("Failed to create notification for video media");
            return h.response({message: "Failed to create notification for video media"}).code(400);
        }
        
        return h.response({message:"The video was posted successfully"}).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to create video media"}).code(500);
    }

}
// update video media

export async function updateVideoMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {uniqueId, url, title, description} = request.payload as MediaInput;
    
    try{
        const findMedia = await executePrismaMethod(
          prisma,
          "media",
          "findUnique",
          {
            where: {
              uniqueId: uniqueId,
            },
            select: {
              mediaNotifications: {
                select: {
                  notificationId: true,
                },
              },
            },
          }
        );
        if (!findMedia) {
          return h.response({ message: "Media not found" }).code(404);
        }
        const media = await executePrismaMethod(prisma, "media", "update", {
          where: {
            id: findMedia.id,
            uniqueId: uniqueId,
          },
          data: {
            url: url,
            description: description,
            title: title,
            updatedAt: getCurrentDate(),
          },
        });
        if(!media){
            console.log("Failed to update video media");
            return h.response({message: "Failed to update video media"}).code(400);
        }

        const notificationTitle = "The Video titled " + title + " has just been updated!";
        const specialKey = media.uniqueId + NotificationType.VIDEO;
        const notification = await updateMediaNotificationHandler(
            findMedia.mediaNotifications.notificationId,
            media.uniqueId,
            specialKey,
            notificationTitle,
            description,
            false,
            NotificationType.VIDEO
        );
        if(!notification){
            console.log("Failed to update notification for video media");
            return h.response({message: "Failed to update notification for video media"}).code(400);
        }



        return h.response({message:"The video was updated successfully"}).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to update video media"}).code(500);
    }
}

// delete video media
export async function deleteVideoMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {uniqueId} = request.payload as MediaInput;
    try{
        const findMedia = await executePrismaMethod(
          prisma,
          "media",
          "findUnique",
          {
            where: {
              uniqueId: uniqueId,
            },
            select: {
              id: true,
              mediaNotifications: {
                select: {
                  notificationId: true,
                },
              },
            },
          }
        );
        if (!findMedia) {
          return h.response({ message: "Media not found" }).code(404);
        }
        const media = await executePrismaMethod(prisma, "media", "delete", {
            where: {
                id: findMedia.id
            }
        });
        if(!media){
            console.log("Failed to delete video media");
            return h.response({message: "Failed to delete video media"}).code(400);
        }
        const specialKey = findMedia.uniqueId + NotificationType.VIDEO;
        const notification = await deleteMediaNotificationHandler(
          findMedia.mediaNotifications.notificationId,
          findMedia.uniqueId,
          specialKey,
          NotificationType.VIDEO
        );
        if(!notification){
            console.log("Failed to delete notification for video media");
            return h.response({message: "Failed to delete notification for video media"}).code(400);
        }
        return h.response({message:"The video was deleted successfully"}).code(201);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to delete video media"}).code(500);
    }
}


export const listAllVideoMediaHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;

    try{
        const media = await executePrismaMethod(prisma, "media", "findMany", {
            where: {
                type: MediaType.VIDEO
            },
            orderBy: {
                postedAt: "desc"
            },
            select:{
                id: true,
                uniqueId: true,
                title: true,
                description: true,
                url: true,
                postedAt: true,
                updatedAt: true

            }

        });
        if(!media){
            console.log("No video media found");
            return h.response({message: "No video media found"}).code(404);
        }
        return h.response(media).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get all video media"}).code(500);
    }
}


/**
 *  
 *  create audio media in google drive
 * 
*/


const credentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};
if (!credentials.project_id) {
  console.error("project_id is missing from the credentials");
}
if (!credentials.private_key_id) {
  console.error("private_key_id is missing from the credentials");
}

if (!credentials.private_key) {
  console.error("private_key is missing from the credentials");
}
if (!credentials.client_email) {
  console.error("client_email is missing from the credentials");
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });



export async function createFolder(request: Hapi.Request,h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const {type,name} = request.payload as folderInput;
  //check if name is it the format of folderType
  if (type !== folderType.Audios && type !== folderType.Images) {
    return h.response({ message: "Invalid folder type" }).code(400);
  }
  const fileMetadata = {
    name:name,
    mimeType: "application/vnd.google-apps.folder",
  };
  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });
    if (!file) {
      console.log("Failed to create folder");
      return h.response({ message: "Failed to create folder" }).code(400);
    }

    const folderId = await executePrismaMethod(prisma, "folder", "create", {
      data: {
        folderId: file.data.id,
        name: name,
        folderType: type,
      }
    });
    if (!folderId) {
      console.log("Failed to create folder");
    }
    
    console.log("The folder " + name + " with Unique ID: " + file.data.id + " has been created successfully!!");

    return h
      .response({
        message: `The folder ${name} with Unique ID: ${file.data.id} has been created successfully!!`,
      })
      .code(201);
    
  } catch (error) {
    console.error("Error creating folder:", error);
    return h.response("Error creating folder").code(500);
  }
}

export async function deleteFolder(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma } = request.server.app;
  const { folderId } = request.params as { folderId: string };
  try {
    const deleteFolder = await executePrismaMethod(
      prisma,
      "folder",
      "delete",
      {
        where: {
          folderId: folderId,
        },
      }
    )
    if (deleteFolder) {
      const deleteFromGoogle = await drive.files.delete({
        fileId: folderId,
      });
      if (!deleteFromGoogle) {
        console.log("Failed to delete folder");
        return h.response({ message: "Failed to delete folder" }).code(400);
      }
      return h.response("Folder deleted successfully").code(200);
    } else {
      console.log("Failed to delete folder");
      return h.response({ message: "Failed to delete folder" }).code(400);
    }
    
  } catch (error) {
    console.error("Error deleting folder:", error);
    return h.response("Error deleting folder").code(500);
  }
}
export async function deleteManyFromGoogleDrive(request: Hapi.Request, h: Hapi.ResponseToolkit) {

  try {
    const folders = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    if (!folders || !folders.data.files) {
      console.log("No folders found");
      return h.response({ message: "No folders found" }).code(404);
    }
    const folderIds = folders.data.files.map((folder) => folder.id).filter((id): id is string => id !== null && id !== undefined);
    for (let i = 0; i < folderIds.length; i++) {
      const deleteFolder = await drive.files.delete({
        fileId: folderIds[i],
      });
      if (!deleteFolder) {
        console.log("Failed to delete folder");
        return h.response({ message: "Failed to delete the folder " }).code(400);
      }
    }
    return h.response("All folders deleted successfully").code(200);
  } catch (error) {
    console.error("Error deleting folders:", error);
    return h.response("Error deleting folders").code(500);
  }
}
export async function getAllFolders(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  try {
    const folders = await executePrismaMethod(prisma, "folder", "findMany", {
      select: {
        folderId: true,
        name: true,
        folderType: true,
      },
    });
    return h.response(folders).code(200);
  } catch (error) {
    console.error("Error getting folders:", error);
    return h.response("Error getting folders").code(500);
  }

}

export async function getAllFoldersInGoogleDrive(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  try {
    const folders = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    return h.response(folders.data.files).code(200);
  } catch (error) {
    console.error("Error getting folders:", error);
    return h.response("Error getting folders").code(500);
  }
}





interface AudioPayload {
  audioFile: any;
  name: string;
  description: string;
}


async function createAudioFile(
  file:any,
  name: string,
  description: string,
  duration: number,
  mimeType: string,
  path: string
) {
  try {
    const prisma = server.app.prisma;
    const folderInfo = await executePrismaMethod(
      prisma,
      "folder",
      "findFirst",
      {
        where: {
          folderType: folderType.Audios,
        },
      }
    );

    if (!folderInfo) {
      throw new Error("Audio folder not found");
    }

    if (!file) {
      throw new Error("No file uploaded");
    }
    const audioName = name + "-" + Date.now();
    const fileMetadata = {
      name: audioName,
      parents: [folderInfo.folderId],
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    if (!response.data.id) {
      throw new Error("Failed to upload file to Google Drive");
    }

    // Set the file's sharing permissions to "anyone with the link"
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Get the shareable link
    const shareableLink = `https://drive.google.com/file/d/${response.data.id}/view?usp=sharing`;

    console.log(
      `The audio file ${name} with Unique ID: ${response.data.id} has been created successfully!`
    );
    const audio = await executePrismaMethod(prisma, "media", "create", {
      data: {
        type: MediaType.AUDIO,
        title: name,
        description: description || "No description provided",
        duration: duration|| 0,
        url: shareableLink,
        postedAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
        storageFolder: {
          connect: {
            folderId: folderInfo.folderId,
          },
        },
      },
    });
    if (!audio) {
      console.log("Failed to create audio media");
      throw new Error("Failed to create audio media");
    }
    return shareableLink;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
}
export const createAudioMediaHandler: Hapi.Lifecycle.Method = async (
  request: Hapi.Request,
  h
) => {
  const { audioFile, name, description } = request.payload as AudioPayload;

  try {
       
        if (!audioFile) {
          return h.response({ error: "No file uploaded" }).code(400);
        }
        const filename = audioFile.hapi.filename;
        const mimeType = audioFile.hapi.headers["content-type"];

        const uploadsDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir);
        }
        const filePath = path.join(uploadsDir, filename);

        if (filePath && typeof filePath === "string") {
          // Remove the file from the 'uploads' directory
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            }
          });
        } 
      const uploadMiddleware = upload.single("audioFile"); // 'audioFile' is the key for the file in the form data

      // Multer middleware processing
      await new Promise((resolve, reject) => {

        uploadMiddleware(request, h, (err) => {
          if (err) {
            return reject("multer error"+err);
          }
          resolve(null);
          console.log("no error yet!");
        });
      });

      
      console.log("...file done processing, about to upload to google drive");

     
    console.log("File written successfully to uploads folder");
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          return reject(err);
        }
        resolve(metadata.format.duration);
      });
    });
    console.log("Duration:", duration);
    // Upload the file to Google Drive
    const fileDetails = await createAudioFile(
      audioFile,
      name,
      description,
      duration,
      mimeType,
      filePath
    );
    console.log("File details:", fileDetails);
    // Respond with the file ID from Google Drive
    return h.response(fileDetails).code(200);
  } catch (error) { 
    return h
      .response({ error: "Failed to upload file to Google Drive" })
      .code(500);
  }
};

export async function listAllAudioMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;

  try{
      const media = await executePrismaMethod(prisma, "media", "findMany", {
          where: {
              type: MediaType.AUDIO
          },
          orderBy: {
              postedAt: "desc"
          },
          select:{
              id: true,
              uniqueId: true,
              title: true,
              description: true,
              url: true,
              duration: true,
              postedAt: true,
              updatedAt: true
          }

      });
      if(!media){
          console.log("No audio media found");
          return h.response({message: "No audio media found"}).code(404);
      }
      return h.response(media).code(200);
  }catch(err){
      console.log(err);
      return h.response({message: "Internal Server Error" + ":failed to get all audio media"}).code(500);
  }
}




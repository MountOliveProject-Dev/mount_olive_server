import Hapi from "@hapi/hapi";
import  server from "../server";
import { google } from "googleapis";
import fs from "fs";
import * as path from "path";
import { getAudioDurationInSeconds } from "get-audio-duration";
import dotenv from "dotenv";
import {
  executePrismaMethod,
  MediaType,
  getCurrentDate,
  NotificationType,
  folderType,
  log,
  LogType,
  RequestType,
} from "../Helpers";

import { EventInput, MediaInput, folderInput } from "../Interfaces";
import {
  createMediaNotificationHandler,
  updateMediaNotificationHandler,
  deleteMediaNotificationHandler,
} from "./notificationHandlers";
import { extractFileIdFromDriveLink, pushThumbnailReplacementToDriveHandler, pushThumbnailToDriveHandler } from "./eventHandlers";



dotenv.config();

/**
 *  
 *  Utils
 * 
*/

const credentials = {
  type: process.env.GOOGLE_TYPE,
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
  log(RequestType.READ, "project_id is missing from the credentials", LogType.ERROR);
}
if (!credentials.private_key_id) {
  log(RequestType.READ, "private_key_id is missing from the credentials", LogType.ERROR);
}

if (!credentials.private_key) {
  log(RequestType.READ, "private_key is missing from the credentials", LogType.ERROR);
}
if (!credentials.client_email) {
  log(RequestType.READ, "client_email is missing from the credentials", LogType.ERROR);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

export async function deleteGoogleDriveFolder(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { folderId } = request.params as { folderId: string };
  try {
    const deleteFolder = await drive.files.delete({
      fileId: folderId,
    });
    if (!deleteFolder) {
      log(RequestType.DELETE, "Failed to delete folder", LogType.ERROR);
      return h.response({ message: "Failed to delete folder" }).code(400);
    }
    return h.response("Folder with Id " + folderId + " deleted successfully").code(200);
  } catch (error: any) {
    log(RequestType.DELETE, "Failed to delete folder with Id " + folderId +"", LogType.ERROR, error.toString());
    return h.response("Error deleting folder").code(500);
  }
}
export async function createFolder(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma } = request.server.app;
  const { type, name } = request.payload as folderInput;
  //check if name is it the format of folderType
  if (type !== folderType.Audios && type !== folderType.Images) {
    return h.response({ message: "Invalid folder type" }).code(400);
  }
  const fileMetadata = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
  };
  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });
    if (!file) {
      log(RequestType.CREATE, "Failed to create folder", LogType.ERROR);
      return h.response({ message: "Failed to create folder" }).code(400);
    }

    const folderId = await executePrismaMethod(prisma, "folder", "create", {
      data: {
        folderId: file.data.id,
        name: name,
        folderType: type,
      },
    });
    if (!folderId) {
      log(RequestType.CREATE, "Failed to create folder", LogType.ERROR);
      return h.response({ message: "Failed to create folder" }).code(400);
    }

    console.log(
      "The folder " +
        name +
        " with Unique ID: " +
        file.data.id +
        " has been created successfully!!"
    );
    log(RequestType.CREATE, "Folder created successfully", LogType.INFO);
    return h
      .response({
        message: `The folder ${name} with Unique ID: ${file.data.id} has been created successfully!!`,
      })
      .code(201);
  } catch (error: any) {
    log(RequestType.CREATE, "Failed to create folder", LogType.ERROR, error.toString());
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
    const deleteFolder = await executePrismaMethod(prisma, "folder", "delete", {
      where: {
        folderId: folderId,
      },
    });
    if (deleteFolder) {
      const deleteFromGoogle = await drive.files.delete({
        fileId: folderId,
      });
      if (!deleteFromGoogle) {
        log(RequestType.DELETE, "Failed to delete folder", LogType.ERROR);
        return h.response({ message: "Failed to delete folder" }).code(400);
      }
      log(RequestType.DELETE, "Folder deleted successfully", LogType.INFO);
      return h.response("Folder deleted successfully").code(200);
    } else {
     log(RequestType.DELETE, "Failed to delete folder", LogType.ERROR);
      return h.response({ message: "Failed to delete folder" }).code(400);
    }
  } catch (error: any) {
    log(RequestType.DELETE, "Failed to delete folder", LogType.ERROR, error.toString());
    return h.response("Error deleting folder").code(500);
  }
}
export async function deleteManyFromGoogleDrive(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const folders = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    if (!folders || !folders.data.files) {
      log(RequestType.DELETE, "No folders found", LogType.ERROR);
      return h.response({ message: "No folders found" }).code(404);
    }
    const folderIds = folders.data.files
      .map((folder) => folder.id)
      .filter((id): id is string => id !== null && id !== undefined);
    for (let i = 0; i < folderIds.length; i++) {
      const deleteFolder = await drive.files.delete({
        fileId: folderIds[i],
      });
      if (!deleteFolder) {
        log(RequestType.DELETE, "Failed to delete the folder", LogType.ERROR);
        return h
          .response({ message: "Failed to delete the folder " })
          .code(400);
      }
    }
    log(RequestType.DELETE, "All folders deleted successfully", LogType.INFO);
    return h.response("All folders deleted successfully").code(200);
  } catch (error: any) {
   log(RequestType.DELETE, "Failed to delete folders", LogType.ERROR, error.toString());
    return h.response("Error deleting folders").code(500);
  }
}
export async function getAllFolders(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma } = request.server.app;
  try {
    const folders = await executePrismaMethod(prisma, "folder", "findMany", {
      select: {
        folderId: true,
        name: true,
        folderType: true,
      },
    });
    if (!folders || folders.length === 0) {
      let details = "No folders found found in the database";
      let logtype = LogType.WARNING;
      if(!folders){
        details = "failed to get folders from the database:" + folders;
        logtype = LogType.ERROR;
      }
      log(RequestType.READ, "No folders found", logtype, details.toString());
      return h.response({ message: "No folders found" }).code(404);
    }
    log(RequestType.READ, "Folders found", LogType.INFO);
    return h.response(folders).code(200);
  } catch (error: any) {
    log(RequestType.READ, "Failed to get folders", LogType.ERROR, error.toString());
    return h.response("Error getting folders").code(500);
  }
}

export async function deleteAllFilesInGoogleDrive(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    
    //find each folder and delete all files in them
    
    const folders = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    if (!folders || !folders.data.files) {
      log(RequestType.DELETE, "No folders found", LogType.ERROR);
      return h.response({ message: "No folders found" }).code(404);
    }
    const folderIds = folders.data.files
      .map((folder) => folder.id)
      .filter((id): id is string => id !== null && id !== undefined);
    for (let i = 0; i < folderIds.length; i++) {
      const files = await drive.files.list({
        q: `'${folderIds[i]}' in parents`,
        fields: "files(id, name)",
      });
      if (!files || !files.data.files) {
        log(RequestType.DELETE, "No files found", LogType.ERROR);
        return h.response({ message: "No files found" }).code(404);
      }
      const fileIds = files.data.files
        .map((file) => file.id)
        .filter((id): id is string => id !== null && id !== undefined);
      for (let j = 0; j < fileIds.length; j++) {
        const deleteFile = await drive.files.delete({
          fileId: fileIds[j],
        });
        if (!deleteFile) {
          log(RequestType.DELETE, "Failed to delete the file", LogType.ERROR);
          return h.response({ message: "Failed to delete the file" }).code(400);
        }
      }
    }
    log(RequestType.DELETE, "All files deleted successfully", LogType.INFO);
    return h.response("All files deleted successfully").code(200);
  } catch (error: any) {
    log(RequestType.DELETE, "Failed to delete files", LogType.ERROR, error.toString());
    return h.response("Error deleting files").code(500);
  }
}
export async function getAllFoldersInGoogleDrive(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const folders = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder'",
      fields: "files(id, name)",
    });
    if (!folders || !folders.data.files|| folders.data.files.length === 0) {
      let details = "failed to get folders from Google Drive"+ folders;
      let logtype = LogType.ERROR;
      if(folders.data.files?.length === 0){
        details = "No folders found in Google Drive";
        logtype = LogType.WARNING;
      }
      log(RequestType.READ, "No folders found", logtype, details.toString());
      return h.response({ message: "No folders found" }).code(404);
    }
    log(RequestType.READ, "Folders found", LogType.INFO);
    return h.response(folders.data.files).code(200);
  } catch (error:any) {
    log(RequestType.READ, "Failed to get folders", LogType.ERROR, error.toString());
    return h.response("Error getting folders").code(500);
  }
}

async function createAudioFile(
  name: string,
  description: string,
  duration: string,
  mimeType: string,
  path: string,
  host:string
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
      log(RequestType.CREATE, "Audio folder not found", LogType.ERROR);
      throw new Error("Audio folder not found");
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
    log(
      RequestType.CREATE,
      `The audio file ${name} with Unique ID: ${response.data.id} has been created successfully!`,
      LogType.INFO
    );
  
    const audio = await executePrismaMethod(prisma, "media", "create", {
      data: {
        type: MediaType.AUDIO,
        title: name,
        description: description || "No description provided",
        duration: duration || " 0 sec",
        url: shareableLink,
        host:host,
        fileId: response.data.id,
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
      log(RequestType.CREATE, "Failed to create audio media", LogType.ERROR);
      throw new Error("Failed to create audio media");
    }
    const type = NotificationType.AUDIO;
    const read = false;
    const notificationTitle =
      "A New Audio titled " + name + " has just been posted!";
    const specialKey = audio.uniqueId + NotificationType.AUDIO;
    const notification = await createMediaNotificationHandler(
      audio.uniqueId,
      specialKey,
      notificationTitle,
      description,
      read,
      type
    );
    
    if (!notification) {
      log(
        RequestType.CREATE,
        "Failed to create notification for audio media",
        LogType.ERROR
      );
    }

    return shareableLink;
  } catch (error: any) {
    log(RequestType.CREATE, "Failed to create audio media", LogType.ERROR, error.toString());
    throw error;
  }
}
async function deleteAudioFileFromDrive(fileId: string){
  try{
    
    const deleteFile = await drive.files.delete({
      fileId: fileId,   
    });
    if (!deleteFile) {
      console.log("Failed to delete file");
      return false;
    }
    return true;
  }catch(err){
    console.log(err);
    throw err;
  }
}

export async function deleteThumbnailFromDrive(fileId: string){
  try{
    const deleteFile = await drive.files.delete({
      fileId: fileId,   
    });
    if (!deleteFile) {
      log(RequestType.DELETE, "Failed to delete the image with id: " +fileId+" from Google Drive", LogType.ERROR);
      
      return false;
    }
    return true;
  }catch(err:any){
    log(RequestType.DELETE, "Failed to delete the image with id: " +fileId+" from Google Drive", LogType.ERROR, err.toString());
   
    throw err;
  }
}
export async function deleteThumbnailFromDriveHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { Id } = request.params as EventInput; ;
  try {
    const deleteFile = await drive.files.delete({
      fileId: Id,
    });
    if (!deleteFile) {
      log(
        RequestType.DELETE,
        "Failed to delete the image with id: " + Id + " from Google Drive",
        LogType.ERROR
      );

      return h.response({message:"Error deleting image"}).code(400);
    }
    return h.response({message:"Image deleted successfully"}).code(200);
  } catch (err: any) {
    log(
      RequestType.DELETE,
      "Failed to delete the image with id: " + Id + " from Google Drive",
      LogType.ERROR,
      err.toString()
    );

    return h.response({message:"Error deleting image"}).code(500);
  }
}


async function updateAudioFileHelper(
  uniqueId: string,
  name: string,
  description: string,
  mimeType: string,
  findAudioId: string,
  path: string,
  reUploadMedia: boolean,
  host:string
){
  try{
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
    if(reUploadMedia === true){
      const deleteFromDrive = await drive.files.delete({
        fileId: findAudioId,
      });

      if (!deleteFromDrive) {
        console.log("Failed to delete existing audio from Google Drive");
        throw new Error("Failed to delete existing audio from Google Drive");
      }
      log(RequestType.DELETE, "Audio deleted successfully from Google Drive", LogType.INFO);
      const durat = getDuration(path);
      const duration = durat.toString();
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
        `The audio file ${name} with Unique ID: ${response.data.id} has been updated successfully!`
      );
      const findAudio = await executePrismaMethod(
        prisma,
        "media",
        "findUnique",
        {
          where: {
            uniqueId: uniqueId,
            type: MediaType.AUDIO,
          },
        }
      );
      if (!findAudio) {
        console.log("Audio not found");
        throw new Error("Audio not found");
      }
      const audio = await executePrismaMethod(prisma, "media", "update", {
        where: {
          uniqueId: uniqueId,
          type: MediaType.AUDIO,
        },
        data: {
          title: name || findAudio.title,
          description: description || findAudio.description,
          duration: duration || " 0 sec",
          url: shareableLink,
          host: host || findAudio.host,
          fileId: response.data.id,
          updatedAt: getCurrentDate(),
        },
      });
      if (!audio) {
        console.log("Failed to update audio media");
        throw new Error("Failed to update audio media");
      }
      const type = NotificationType.AUDIO;
      const read = false;
      const notificationTitle =
        "The Audio titled " + findAudio.title + " has just been updated!";
      const specialKey = audio.uniqueId + NotificationType.AUDIO;
      const getNotification = await executePrismaMethod(
        prisma,
        "notification",
        "findFirst",
        {
          where: {
            notificationEngagements: {
              specialKey: specialKey,
            },
          },
        }
      );
      if (!getNotification) {
        log(RequestType.READ, "Notification not found", LogType.ERROR);
        throw new Error("Notification not found");
      }
      const notification = await updateMediaNotificationHandler(
        getNotification.id,
        findAudio.uniqueId,
        specialKey,
        notificationTitle,
        description || findAudio.description,
        read,
        type
      );
      console.log(notification);
      if (!notification) {
        console.log("Failed to create notification for audio media");
      }
      // Remove the file from the 'uploads' directory after processing
      if (path && typeof path === "string") {
        fs.unlink(path, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          }
        });
      }
      return shareableLink;
    }else if(reUploadMedia === false){
        const findAudio = await executePrismaMethod(prisma, "media", "findUnique", {
        where: {
          uniqueId: uniqueId,
          type: MediaType.AUDIO,
        },
      });
      if (!findAudio) {
        console.log("Audio not found");
        throw new Error("Audio not found");
      }
      const audio = await executePrismaMethod(prisma, "media", "update", {
        where: {
          uniqueId: uniqueId,
          type: MediaType.AUDIO,
        },
        data: {
          title: name || findAudio.title,
          description: description || findAudio.description,
          host: host || findAudio.host,
          updatedAt: getCurrentDate(),
          },
        
      });
      if (!audio) {
        console.log("Failed to update audio media");
        throw new Error("Failed to update audio media");
      }
      const type = NotificationType.AUDIO;
      const read = false;
      const notificationTitle ="The Audio titled " + findAudio.title + " has just been updated!";
      const specialKey = audio.uniqueId + NotificationType.AUDIO;
      const getNotification = await executePrismaMethod(prisma, "notification", "findFirst", {
        where: {
          notificationEngagements:{
          specialKey: specialKey,
        }
        },
      });
      
      const notification = await updateMediaNotificationHandler(
        getNotification.id,
        findAudio.uniqueId,
        specialKey,
        notificationTitle,
        description || findAudio.description,
        read,
        type
      );
      console.log(notification);
      if (!notification) {
        console.log("Failed to create notification for audio media");
      }

      return findAudio.url;
    }
  }catch(err){
    console.log(err);
    throw err;
  }
}
export async function updateThumbnailHelper(
  fileId: string,
  name: string,
  mimeType: string,
  path: string,
  reUploadMedia: boolean
) {
  try {
    const prisma = server.app.prisma;
    const description = "Thumbnail for an event";

    const folderInfo = await executePrismaMethod(
      prisma,
      "folder",
      "findFirst",
      {
        where: {
          folderId: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID,
          folderType: folderType.Images,
        },
      }
    );
    if (!folderInfo) {
      log(RequestType.UPDATE, "Thumbnail folder not found", LogType.ERROR);
      throw new Error("Thumbnail folder not found");
    }
    if (reUploadMedia === true) {

      if (fileId === "" || fileId === null) {
        const uniqueId ="";
        const link = await pushThumbnailReplacementToDriveHandler(
          name,
          path,
          mimeType,
          uniqueId
        );
        if (!link) {
          log(
            RequestType.UPDATE,
            "Failed to upload thumbnail to Google Drive",
            LogType.ERROR
          );
          return "Error updating thumbnail";
        }
        fileId = await extractFileIdFromDriveLink(link);
        return link;
      } else {
        const findThumbnailInDrive: any = await drive.files.get({
          fileId: fileId,
          fields: "id, name",
        });
        if (!findThumbnailInDrive || findThumbnailInDrive.data.id !== fileId) {
          log(
            RequestType.UPDATE,
            "Thumbnail not found in Google Drive",
            LogType.INFO
          );
          return "Thumbnail not found";
        }
        const findThumbnail = await executePrismaMethod(
          prisma,
          "media",
          "findUnique",
          {
            where: {
              fileId: fileId,
              type: MediaType.IMAGE,
            },
          }
        );
        if (!findThumbnail) {
          log(RequestType.READ, "Thumbnail not found", LogType.ERROR);
          return "Thumbnail not found";
        }
        const deleteThumbnail = await drive.files.delete({
          fileId: fileId,
        });
        if (!deleteThumbnail) {
          log(
            RequestType.DELETE,
            "Failed to delete existing thumbnail from Google Drive",
            LogType.ERROR
          );
          return "Failed to delete existing thumbnail";
        }
        log(
          RequestType.DELETE,
          "Thumbnail deleted successfully from Google Drive",
          LogType.INFO
        );
        const link = await pushThumbnailReplacementToDriveHandler(
          name,
          path,
          mimeType,
          findThumbnail.uniqueId
        );
        if (!link) {
          log(
            RequestType.UPDATE,
            "Failed to upload thumbnail to Google Drive",
            LogType.ERROR
          );
          return "Error updating thumbnail";
        }
        const newId = await extractFileIdFromDriveLink(link);

        if (!newId) {
          log(
            RequestType.UPDATE,
            "Failed to extract file id from link",
            LogType.ERROR
          );
          return "Error updating thumbnail";
        }
        return link;
      }
    } else {
      const getLink = await executePrismaMethod(prisma, "media", "findUnique", {
        where: {
          fileId: fileId,
          type: MediaType.IMAGE,
        },
      });
      if (!getLink) {
        log(RequestType.READ, "Thumbnail not found", LogType.ERROR);
        return "Thumbnail not found";
      }
      return getLink.url;
    }
  } catch (err: any) {
    log(
      RequestType.UPDATE,
      "Failed to update thumbnail",
      LogType.ERROR,
      err.toString()
    );
    throw err;
  }
}
export async function createThumbnailFile(
  name: string,
  mimeType: string,
  path: string){

  try {
    const prisma = server.app.prisma;
    const folderInfo = await executePrismaMethod(
      prisma,
      "folder",
      "findFirst",
      {
        where: {
          folderId:process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID,
          folderType: folderType.Images,
        },
      }
    );
    
    if (!folderInfo) {
      log(RequestType.CREATE, "Image folder not found", LogType.ERROR);
      throw new Error("Image folder not found");
    }

   
    const thumbnailName = name + "-" + Date.now();
    const fileMetadata = {
      name: thumbnailName,
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
      log(RequestType.CREATE, "Failed to upload file to Google Drive", LogType.ERROR);
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
    log(
        RequestType.CREATE, 
        `The thumbnail ${name} with Unique ID: ${response.data.id} has been created successfully!`,
        LogType.INFO
      );
  
    const description = "Thumbnail for an event";
    const thumbnail = await executePrismaMethod(prisma, "media", "create", {
      data: {
        type: MediaType.IMAGE,
        title: name,
        description: description,
        url: shareableLink,
        fileId: response.data.id,
        postedAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
        storageFolder: {
          connect: {
            folderId: folderInfo.folderId,
          },
        },
      },
    });
    if (!thumbnail) {
      console.log("Failed to create thumbnail media");
      throw new Error("Failed to create thumbnail media");
    }
    return shareableLink;
  } catch (error:any) {
    log(RequestType.CREATE,"Error uploading file to Google Drive",LogType.ERROR, error);
    throw error;
  }
}

export async function updateThumbnailFile(
  name: string,
  mimeType: string,
  path: string,
  uniqueId: string,
) {
  try {
    const prisma = server.app.prisma;
    const folderInfo = await executePrismaMethod(
      prisma,
      "folder",
      "findFirst",
      {
        where: {
          folderId: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID,
          folderType: folderType.Images,
        },
      }
    );

    if (!folderInfo) {
      log(RequestType.CREATE, "Image folder not found", LogType.ERROR);
      throw new Error("Image folder not found");
    }

    const thumbnailName = name + "-" + Date.now();
    const fileMetadata = {
      name: thumbnailName,
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
      log(
        RequestType.CREATE,
        "Failed to upload file to Google Drive",
        LogType.ERROR
      );
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
    log(
      RequestType.CREATE,
      `The thumbnail ${name} with Unique ID: ${response.data.id} has been updated successfully!`,
      LogType.INFO
    );

    if(uniqueId === ""|| uniqueId === null){
      const thumbnail = await executePrismaMethod(prisma, "media", "create", {
        data: {
          type: MediaType.IMAGE,
          title: thumbnailName,
          description: "Thumbnail for an event",
          url: shareableLink,
          fileId: response.data.id,
          postedAt: getCurrentDate(),
          updatedAt: getCurrentDate(),
          storageFolder: {
            connect: {
              folderId: folderInfo.folderId,
            },
          },
        },
      });
      if (!thumbnail) {
        console.log("Failed to create thumbnail media");
        throw new Error("Failed to create thumbnail media");
      }
      return shareableLink;
    }else{
      const thumbnail = await executePrismaMethod(prisma, "media", "update", {
        where: {
          uniqueId: uniqueId,
          type: MediaType.IMAGE
        },
        data: {
          url: shareableLink,
          fileId: response.data.id,
          updatedAt: getCurrentDate(),
        },
      });
      if (!thumbnail) {
        console.log("Failed to create thumbnail media");
        throw new Error("Failed to create thumbnail media");
      }
      return shareableLink;
    }
  } catch (error: any) {
    log(
      RequestType.CREATE,
      "Error uploading file to Google Drive",
      LogType.ERROR,
      error
    );
    throw error;
  }
}



// Helper function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    formatted += `${minutes}m `;
  }
  formatted += `${secs}s`;

  return formatted.trim();
}

async function getDuration(filePath: string): Promise<string> {
  try {
    const duration = await getAudioDurationInSeconds(filePath);
    const formattedDuration = formatDuration(duration);
    log(RequestType.READ, `Audio duration: ${formattedDuration}`, LogType.INFO);
    return formattedDuration;
  } catch (error: any) {
    log(RequestType.READ, "Error getting audio duration", LogType.ERROR, error);
    console.error("Error getting audio duration:", error);
    throw error;
  }
}


/**
 *  
 *  create video media 
 * 
*/
//create Video media
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
            log(RequestType.CREATE, "Failed to create video media", LogType.ERROR, media.toString());
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
        
        if(!notification){
            log(RequestType.CREATE, "Failed to create notification for video media", LogType.ERROR, notification.toString());
            return h.response({message: "Failed to create notification for video media"}).code(400);
        }
        log(RequestType.CREATE, "Video media created successfully", LogType.INFO);
        return h.response({message:"The video was posted successfully"}).code(201);
    }catch(err:any){
        log(RequestType.CREATE, "Failed to create video media", LogType.ERROR, err);
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
          log(RequestType.UPDATE, "Media not found", LogType.ERROR);
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
            log(RequestType.UPDATE, "Failed to update video media", LogType.ERROR);
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
            log(RequestType.UPDATE, "Failed to update notification for video media", LogType.ERROR);
            return h.response({message: "Failed to update notification for video media"}).code(400);
        }


        log(RequestType.UPDATE, "Video media updated successfully", LogType.INFO);
        return h.response({message:"The video was updated successfully"}).code(201);
    }catch(err:any){
        log(RequestType.UPDATE, "Failed to update video media", LogType.ERROR, err);
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
              uniqueId: true,
              mediaNotifications: {
                select: {
                  id:true,
                  notificationId: true,
                },
              },
            },
          }
        );
        
        if (!findMedia) {
          log(RequestType.DELETE, "Media not found", LogType.ERROR);
          return h.response({ message: "Media not found" }).code(404);
        }
        
        const specialKey = findMedia.uniqueId + NotificationType.VIDEO;
        const notification = await deleteMediaNotificationHandler(
          findMedia.mediaNotifications.notificationId,
          findMedia.uniqueId,
          specialKey,
          NotificationType.VIDEO
        );
        
        if (
          notification === "notification not found" ||
          notification === "Failed to delete the notification"
        ) {
          log(
            RequestType.DELETE,
            "Failed to delete notification for video media",
            LogType.ERROR
          );
          return h
            .response({
              message: "Failed to video media",
            })
            .code(400);
        }else if (notification === "notification has been deleted successfully"){
          log(RequestType.DELETE, "Notification for video media deleted successfully", LogType.INFO);
        }else{
          log(RequestType.DELETE, "Failed to delete video media", LogType.ERROR);
          return h
            .response({
              message: "Failed to delete video media",
            })
            .code(400);
        }
          const media = await executePrismaMethod(prisma, "media", "delete", {
            where: {
              id: findMedia.id,
            },
          });
        if (!media) {
          log(
            RequestType.DELETE,
            "Failed to delete video media",
            LogType.ERROR
          );
          return h
            .response({ message: "Failed to delete video media" })
            .code(400);
        }
        log(RequestType.DELETE, "Video media deleted successfully", LogType.INFO);
        return h.response({message:"The video was deleted successfully"}).code(201);
    }catch(err:any){
        log(RequestType.DELETE, "Failed to delete video media", LogType.ERROR, err);
        return h.response({message: "Internal Server Error" + ":failed to delete video media"}).code(500);
    }
}
//list all video media
export const listAllVideoMediaHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;

    try{
        const media = await executePrismaMethod(prisma, "media", "findMany", {
            where: {
                type: MediaType.VIDEO
            },
            orderBy: {
                updatedAt: "desc"
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
            log(RequestType.READ, "No video media found", LogType.ERROR);
            return h.response({message: "No video media found"}).code(404);
        }
        log(RequestType.READ, "Video media found", LogType.INFO);
        return h.response(media).code(200);
    }catch(err:any){
        log(RequestType.READ, "Failed to get all video media", LogType.ERROR, err);
        return h.response({message: "Internal Server Error" + ":failed to get all video media"}).code(500);
    }
}


/**
 *  
 *  create audio media in google drive
 * 
*/



//list all audios
//audio media
export const storeAudioFileHandler: Hapi.Lifecycle.Method = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { audioFile } = request.payload as { audioFile: any };

  if (!audioFile) {
    log(RequestType.CREATE, "No file uploaded", LogType.ERROR);
    return h.response({ error: "No file uploaded" }).code(400);
  }

  const filename = audioFile.hapi.filename;
  const mimeType = audioFile.hapi.headers["content-type"];
  const uploadsDir = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filePath = path.join(uploadsDir, filename);

  try {
    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      audioFile.pipe(fileStream);

      fileStream.on("error", (err) => {
        console.error("Error writing file:", err);
        reject(err);
      });

      fileStream.on("finish", () => {
        resolve();
      });
    });

    const details = `filePath: ${filePath}, mimeType: ${mimeType}, filename: ${filename}`;
    log(
      RequestType.CREATE,
      "File uploaded successfully",
      LogType.INFO,
      details
    );
    return h.response({ filePath, mimeType, filename }).code(200);
  } catch (error: any) {
    log(RequestType.CREATE, "Failed to store file", LogType.ERROR, error);
    return h.response({ error: "Failed to store file" }).code(500);
  }
};
export async function createFoldersInDatabaseHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  try{
    const folder = await executePrismaMethod(prisma, "folder", "createMany", {
      data: [
        {
          folderType: folderType.Images,
          name:"Thumbnails",
          folderId: process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID||"",
        },
        {
          folderType: folderType.Audios,
          name:"Sermons",
          folderId: process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID||"",
        },
      ],
    });
    if (!folder) {
      log(RequestType.CREATE, "Failed to create folders in database", LogType.ERROR, "Folder is undefined"+folder.toString());
      return h.response({ message: "Failed to create folders in database" }).code(400);
    }
    log(RequestType.CREATE, "Folders created successfully", LogType.INFO);
    return h.response({ message: "Folders created successfully" }).code(201);

  }catch(err:any){
    log(RequestType.CREATE, "Failed to create folders in database", LogType.ERROR, err.toString());
    return h.response({ message: "Internal Server Error" + ":failed to create folders in database" }).code(500);
  }
}
export async function listAllAudioMediaHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;

  try{
      const media = await executePrismaMethod(prisma, "media", "findMany", {
          where: {
              type: MediaType.AUDIO
          },
          orderBy: {
              updatedAt: "desc"
          },
          select:{
              id: true,
              uniqueId: true,
              title: true,
              description: true,
              url: true,
              duration: true,
              host: true,
              postedAt: true,
              updatedAt: true
          }

      });
      if(!media || media.length === 0){
        let details = "No audio media is empty" 
        let logtype = LogType.WARNING
        if(!media){
          details = "Media is undefined: " + media
          logtype = LogType.ERROR
        }
          log(RequestType.READ, "No audio media found", logtype,details);
          return h.response({message: "No audio media found"}).code(404);
      }
      log(RequestType.READ, "Audio media found", LogType.INFO);
      return h.response(media).code(200);
  }catch(err:any){
      log(RequestType.READ, "Failed to get all audio media", LogType.ERROR, err);
      return h.response({message: "Internal Server Error" + ":failed to get all audio media"}).code(500);
  }
}

export async function listAllImageMediaHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma } = request.server.app;

  try {
    const media = await executePrismaMethod(prisma, "media", "findMany", {
      where: {
        type: MediaType.IMAGE,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        uniqueId: true,
        title: true,
        description: true,
        url: true,
        duration: true,
        host: true,
        postedAt: true,
        updatedAt: true,
      },
    });
    if (!media || media.length === 0) {
      let details = "No image media is empty";
      let logtype = LogType.WARNING;
      if (!media) {
        details = "Media is undefined: " + media;
        logtype = LogType.ERROR;
      }
      log(RequestType.READ, "No image media found", logtype, details);
      return h.response({ message: "No image media found" }).code(404);
    }
    log(RequestType.READ, "Image media found", LogType.INFO);
    return h.response(media).code(200);
  } catch (err: any) {
    log(RequestType.READ, "Failed to get all Image media", LogType.ERROR, err);
    return h
      .response({
        message: "Internal Server Error" + ":failed to get all image media",
      })
      .code(500);
  }
}
//upload audio to server
export async function deleteAudioFileHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  const { prisma } = request.server.app;
  const { uniqueId } = request.payload as { uniqueId: string };

  try {
    const findAudio = await executePrismaMethod(prisma, "media", "findUnique", {
      where: {
        uniqueId: uniqueId,
        type: MediaType.AUDIO,
      },
      select: {
        uniqueId: true,
        id: true,
        fileId: true,
        mediaNotifications: {
          select: {
            notificationId: true,
          },
        },
      },
    });
    if (!findAudio) {
      log(RequestType.DELETE, "Audio not found", LogType.ERROR);
      return h.response({ message: "Audio not found" }).code(404);
    }

    //delete 
    const deleteFromDrive = await deleteAudioFileFromDrive(findAudio.fileId);
    if(deleteFromDrive){
     
      const specialKey = findAudio.uniqueId + NotificationType.AUDIO;
      const notification = await deleteMediaNotificationHandler(
        findAudio.mediaNotifications.notificationId,
        findAudio.uniqueId,
        specialKey,
        NotificationType.AUDIO
      );
      
       if (
         notification === "notification not found" ||
         notification === "Failed to delete the notification"
       ) {
         log(
           RequestType.DELETE,
           "Failed to delete notification for audio media",
           LogType.ERROR
         );
         return h
           .response({
             message: "Failed to audio media",
           })
           .code(400);
       } else if (
         notification === "notification has been deleted successfully"
       ) {
         log(
           RequestType.DELETE,
           "Notification for audio media deleted successfully",
           LogType.INFO
         );
       } else {
         log(RequestType.DELETE, "Failed to delete audio media", LogType.ERROR);
         return h
           .response({
             message: "Failed to delete audio media",
           })
           .code(400);
       }
       const deleteAudio = await executePrismaMethod(
         prisma,
         "media",
         "delete",
         {
           where: {
             id: findAudio.id,
           },
         }
       );
       if (!deleteAudio) {
         log(RequestType.DELETE, "Failed to delete audio media", LogType.ERROR);
         return h
           .response({ message: "Failed to delete audio media" })
           .code(400);
       }
      log(RequestType.DELETE, "Audio media deleted successfully", LogType.INFO);
      return h.response({ message: "Audio deleted successfully" }).code(201);
    }else{
      log(RequestType.DELETE, "Failed to delete audio media", LogType.ERROR);
      return h.response({ message: "Failed to delete audio media" }).code(400);
    }
  } catch (error:any) {
    log(RequestType.DELETE, "Failed to delete audio media", LogType.ERROR, error.toString());
    return h.response("Error deleting audio").code(500);
  }
}
//upload audio to google drive
export async function pushAudioToDriveHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { name, description, filePath, mimeType,host } =
    request.payload as {
      name: string;
      description: string;
      filePath: string;
      mimeType: string;
      host:string;
    };

  try {
    // Ensure the filePath is provided and is a string
    if (!filePath || typeof filePath !== 'string') {
      log(RequestType.CREATE, "Invalid file path", LogType.ERROR);
      return h.response({ error: 'Invalid file path' }).code(400);
    }

    let duration = '';
    try {
      duration = await getDuration(filePath);
    } catch (durationError: any) {
      log(
        RequestType.CREATE,
        "Could not calculate duration, proceeding without it",
        LogType.ERROR,
        durationError
      );
     
    }

    const shareableLink = await createAudioFile(
      name,
      description,
      duration,
      mimeType,
      filePath,
      host
    );

    // Remove the file from the 'uploads' directory after processing
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
    log(RequestType.CREATE, "Audio uploaded successfully", LogType.INFO);
    return h.response({ shareableLink }).code(200);
  } catch (error:any) {
    log(RequestType.CREATE, "Failed to upload file to Google Drive", LogType.ERROR, error);
    return h
      .response({ error: "Failed to upload file to Google Drive" })
      .code(500);
  }
};
//update audio
export async function updateAudioFile(request: Hapi.Request, h: Hapi.ResponseToolkit){
  const prisma = request.server.app.prisma;
   const { uniqueId, name, description, filePath, mimeType, reUploadMedia,host } =
     request.payload as {
       name: string;
       description: string;
       filePath: string;
       mimeType: string;
       uniqueId: string;
       reUploadMedia: boolean;
       host:string;
     };
    try {
      let shareableLink : string = "";
      const findAudioId = await executePrismaMethod(
        prisma,
        "media",
        "findUnique",{
          where:{
            uniqueId: uniqueId,
            type: MediaType.AUDIO
          },select:{
            fileId:true,
            id: true
          }
        }
      );
      if (!findAudioId){
          log(RequestType.UPDATE, "Audio not found", LogType.ERROR);
          return h.response({ message: "Audio not found" }).code(404);
      }
      shareableLink = await updateAudioFileHelper(
        uniqueId,
        name,
        description,
        mimeType,
        findAudioId.fileId,
        filePath,
        reUploadMedia,
        host
      );
      log(RequestType.UPDATE, "Audio updated successfully", LogType.INFO);
      return h.response({ shareableLink }).code(200);
    } catch (error:any) {
      log(RequestType.UPDATE, "Failed to update audio media", LogType.ERROR, error);
    
      return h
        .response({ error: "Failed to upload file to Google Drive" })
        .code(500);
    }
}


//eventthumbnail
export const storeThumbnailFileHandler: Hapi.Lifecycle.Method = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { thumbnailFile } = request.payload as { thumbnailFile: any };

  if (!thumbnailFile) {
    log(RequestType.CREATE, "No file uploaded", LogType.ERROR);
    return h.response({ error: "No file uploaded" }).code(400);
  }

  const filename = thumbnailFile.hapi.filename;
  const mimeType = thumbnailFile.hapi.headers["content-type"];
  const uploadsDir = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  const filePath = path.join(uploadsDir, filename);

  try {
    await new Promise<void>((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      thumbnailFile.pipe(fileStream);

      fileStream.on("error", (err) => {
        log(RequestType.CREATE, "Error writing file", LogType.ERROR);
        reject(err);
      });

      fileStream.on("finish", () => {
        resolve();
      });
    });
    log(RequestType.CREATE, "File uploaded successfully", LogType.INFO);
    return h.response({ filePath, mimeType, filename }).code(200);
  } catch (error:any) {
    log(RequestType.CREATE, "Failed to store file", LogType.ERROR);
    return h.response({ error: "Failed to store file" }).code(500);
  }
};
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
} from "../Helpers";

import { MediaInput, folderInput } from "../Interfaces";
import {
  createMediaNotificationHandler,
  updateMediaNotificationHandler,
  deleteMediaNotificationHandler,
} from "./notificationHandlers";
import { file } from "googleapis/build/src/apis/file";



dotenv.config();

/**
 *  
 *  Utils
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
      console.log("Failed to create folder");
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
      console.log("Failed to create folder");
    }

    console.log(
      "The folder " +
        name +
        " with Unique ID: " +
        file.data.id +
        " has been created successfully!!"
    );

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
      console.log("No folders found");
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
        console.log("Failed to delete folder");
        return h
          .response({ message: "Failed to delete the folder " })
          .code(400);
      }
    }
    return h.response("All folders deleted successfully").code(200);
  } catch (error) {
    console.error("Error deleting folders:", error);
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
    return h.response(folders).code(200);
  } catch (error) {
    console.error("Error getting folders:", error);
    return h.response("Error getting folders").code(500);
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
    return h.response(folders.data.files).code(200);
  } catch (error) {
    console.error("Error getting folders:", error);
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

    console.log(
      `The audio file ${name} with Unique ID: ${response.data.id} has been created successfully!`
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
      console.log("Failed to create audio media");
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
    console.log(notification);
    if (!notification) {
      console.log("Failed to create notification for video media");
    }

    return shareableLink;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
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
      console.log("Failed to delete file");
      return false;
    }
    return true;
  }catch(err){
    console.log(err);
    throw err;
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
      await drive.files.delete({
        fileId: findAudioId,
      });
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
      const notification = await updateMediaNotificationHandler(
        getNotification.id,
        findAudio.id,
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
        findAudio.id,
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
  reUploadMedia: boolean,
){
   try {
     const prisma = server.app.prisma;
      const  description=  "Thumbnail for an event";
     const folderInfo = await executePrismaMethod(
       prisma,
       "folder",
       "findFirst",
       {
         where: {
           folderType: folderType.Images,
         },
       }
     );
     if (!folderInfo) {
       throw new Error("Thumbnail folder not found");
     }
     if (reUploadMedia === true) {
      
       
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
          console.log("Thumbnail not found");
          throw new Error("Thumbnail not found");
        }
         await drive.files.delete({
           fileId: fileId,
         });
       const thumbnailName = name || findThumbnail.title + "-" + Date.now();
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
         throw new Error("Failed to upload thumbnail to Google Drive");
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
         `The thumbnail  ${name} with Unique ID: ${response.data.id} has been updated successfully!`
       );
      
       const updateThumbnail = await executePrismaMethod(
         prisma,
         "media",
         "update",
         {
           where: {
             fileId: fileId,
             uniqueId: findThumbnail.uniqueId,
             type: MediaType.IMAGE,
           },
           data: {
             title: name || findThumbnail.title,
             description: description,
             url: shareableLink,
             fileId: response.data.id,
             updatedAt: getCurrentDate(),
           },
         }
       );
       if (!updateThumbnail) {
         console.log("Failed to update thumbnail");
         throw new Error("Failed to update thumbnail");
       }
       const type = NotificationType.IMAGE;
       const read = false;
       const notificationTitle =
         "The Thumbnail titled " + findThumbnail.title + " has just been updated!";
       const specialKey = findThumbnail.uniqueId + NotificationType.IMAGE;
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
       const notification = await updateMediaNotificationHandler(
         getNotification.id,
         findThumbnail.id,
         specialKey,
         notificationTitle,
         description,
         read,
         type
       );
       console.log(notification);
       if (!notification) {
         console.log("Failed to create notification for thumbnail media");
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
     } else if (reUploadMedia === false) {
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
         console.log("thumbnail not found");
         throw new Error("thumbnail not found");
       }
       const thumbnail = await executePrismaMethod(prisma, "media", "update", {
         where: {
           fileId: fileId,
           uniqueId: findThumbnail.uniqueId,
           type: MediaType.IMAGE,
         },
         data: {
           title: name || findThumbnail.title,
           updatedAt: getCurrentDate(),
         },
       });
       if (!thumbnail) {
         console.log("Failed to update thumbnail media");
         throw new Error("Failed to update thumbnail media");
       }
       const type = NotificationType.AUDIO;
       const read = false;
       const notificationTitle =
         "The Thumbnail titled " + findThumbnail.title + " has just been updated!";
       const specialKey = findThumbnail.uniqueId + NotificationType.IMAGE;
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

       const notification = await updateMediaNotificationHandler(
         getNotification.id,
         findThumbnail.id,
         specialKey,
         notificationTitle,
         description,
         read,
         type
       );
       console.log(notification);
       if (!notification) {
         console.log("Failed to create notification for thumbnai");
       }

       return findThumbnail.url;
     }
   } catch (err) {
     console.log(err);
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
          folderType: folderType.Images,
        },
      }
    );

    if (!folderInfo) {
      throw new Error("Image folder not found");
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
      `The thumbnail ${name} with Unique ID: ${response.data.id} has been created successfully!`
    );
    const description = "Thumbnail for an event";
    const audio = await executePrismaMethod(prisma, "media", "create", {
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
    if (!audio) {
      console.log("Failed to create thumbnail media");
      throw new Error("Failed to create thumbnail media");
    }
    return shareableLink;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
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
    console.log(`Duration: ${formattedDuration}`);
    return formattedDuration;
  } catch (error) {
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
//list all video media
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


// export const createAudioMediaHandler: Hapi.Lifecycle.Method = async (
//   request: Hapi.Request,
//   h: Hapi.ResponseToolkit
// ) => {
//   const { audioFile, name, description } = request.payload as AudioPayload;
//   console.log("...about to upload file to google drive");

//   if (!audioFile) {
//     return h.response({ error: "No file uploaded" }).code(400);
//   }

//   const filename = audioFile.hapi.filename;
//   const mimeType = audioFile.hapi.headers["content-type"];
//   console.log("File name:", filename);

//   const uploadsDir = path.join(__dirname, "uploads");
//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
//   }

//   const filePath = path.join(uploadsDir, filename);
//   console.log("File path:", filePath);

//   try {
//     // Wrap file writing in a promise to wait until it's fully completed
//     await new Promise<void>((resolve, reject) => {
//       const fileStream = fs.createWriteStream(filePath);
//       audioFile.pipe(fileStream);

//       fileStream.on("error", (err) => {
//         console.error("Error writing file:", err);
//         reject(err);
//       });

//       fileStream.on("finish", () => {
//         console.log("...file uploaded to server");
//         resolve();
//       });
//     });

//     console.log("...file done processing, about to upload to google drive");

//     // Use music-metadata to get the duration
//   //  const buffer = fs.readFileSync(filePath);
//   //  const metadata = audioMetadata.parse(buffer, mimeType);
//     const duration =  0;
//     console.log("Duration:", duration);

//     // Upload the file to Google Drive
//     const fileDetails = await createAudioFile(
//       audioFile,
//       name,
//       description,
//       duration,
//       mimeType,
//       filePath
//     );
//     console.log("File details:", fileDetails);

//     // Remove the file from the 'uploads' directory after processing
//     if (filePath && typeof filePath === "string") {
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.error("Error deleting file:", err);
//         }
//       });
//     }

//     console.log("File written successfully to uploads folder");
//     return h.response(fileDetails).code(200);
//   } catch (error) {
//     console.error("Error during file processing:", error);
//     return h
//       .response({ error: "Failed to upload file to Google Drive" })
//       .code(500);
//   }
// };


//list all audios
//audio media
export const storeAudioFileHandler: Hapi.Lifecycle.Method = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { audioFile } = request.payload as { audioFile: any };

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
    console.log(
      "filePath:" + filePath,
      "mimeType:" + mimeType,
      "filename:" + filename
    );
    return h.response({ filePath, mimeType, filename }).code(200);
  } catch (error) {
    console.error("Error during file processing:", error);
    return h.response({ error: "Failed to store file" }).code(500);
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
              host: true,
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
      console.log("Audio not found");
      return h.response({ message: "Audio not found" }).code(404);
    }

    //delete 
    const deleteFromDrive = await deleteAudioFileFromDrive(findAudio.fileId);
    if(deleteFromDrive){
      const deleteAudio = await executePrismaMethod(prisma, "media", "delete", {
        where: {
          id: findAudio.id,
        },
      });
      if (!deleteAudio) {
        console.log("Failed to delete audio media");
        return h.response({ message: "Failed to delete audio media" }).code(400);
      }
      const specialKey = findAudio.uniqueId + NotificationType.AUDIO;
      const notification = await deleteMediaNotificationHandler(
        findAudio.mediaNotifications.notificationId,
        findAudio.uniqueId,
        specialKey,
        NotificationType.AUDIO
      );
      if (!notification) {
        console.log("Failed to delete notification for audio media");
        return h.response({ message: "Failed to delete notification for audio media" }).code(400);
      }
      return h.response({ message: "Audio deleted successfully" }).code(201);
    }else{
      console.log("Failed to delete audio media from google drive");
      return h.response({ message: "Failed to delete audio media" }).code(400);
    }
  } catch (error) {
    console.error("Error deleting audio:", error);
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
      return h.response({ error: 'Invalid file path' }).code(400);
    }

    let duration = '';
    try {
      duration = await getDuration(filePath);
    } catch (durationError) {
      console.warn("Could not calculate duration, proceeding without it:", durationError);
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

    return h.response({ shareableLink }).code(200);
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
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
          console.log("Audio not found");
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
      return h.response({ shareableLink }).code(200);
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
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
        console.error("Error writing file:", err);
        reject(err);
      });

      fileStream.on("finish", () => {
        resolve();
      });
    });

    return h.response({ filePath, mimeType, filename }).code(200);
  } catch (error) {
    console.error("Error during file processing:", error);
    return h.response({ error: "Failed to store file" }).code(500);
  }
};
import {
  google, // The top level object used to access services
  drive_v3, // For every service client, there is an exported namespace
  Auth, // Namespace for auth related types
} from "googleapis";

import { auth, audioMimeTypes, GOOGLE_DRIVE_PRIVATE_KEY } from "../Helpers";



export async function createAudioFile (audioFile: any) {
  const drive = google.drive({ version: "v3", auth });
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not defined");
  }
  const fileMetadata = {
    name: audioFile.name,
    parents: [folderId],
  };

  const media = {
    mimeType: audioFile.mimeType,
    body: audioFile.body,
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("File ID: ", response.data.id);
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
  //1U_jSHkOwMQXhZif1Ah27BF32p0JsoUcx
};

export async function listAndShareAudioFiles() {
// Initialize the Drive API client
    const drive: drive_v3.Drive = google.drive({
    version: "v3",
    auth,
    });

// Define the folder ID and MIME types for audio files
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID // Replace with your actual folder ID
    try {
        // List files in the folder
        const listParams = {
        q: `'${folderId}' in parents and mimeType contains 'audio/' and trashed = false`,
        fields: 'files(id, name, mimeType)',
        };
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log('Audio files in the folder:', listResults.length)
        console.log(listResults);

        // Filter audio files
        const audioFiles = listResults.filter(file => audioMimeTypes.includes(file.mimeType!));

        // Share files and get links
        for (const file of audioFiles) {
            const fileId = file.id;

            if (!fileId) {
                console.warn(`File ID is missing for file: ${file.name}`);
                continue;
            } else {
                console.log(`Sharing fileId: ${fileId}`);
        // Set file permissions to public
                await drive.permissions.create({
                  fileId: file.id as string,
                  requestBody: {
                    role: "reader",
                    type: "anyone",
                  },
                });

            // Generate shareable link
                const link = `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
                console.log(`Name: ${file.name}, Shareable Link: ${link}`);
            }
        }
    } catch (error) {
        console.error('Error listing or sharing audio files:', error);
    }
}


export async function createFolder(folderName: string) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  try {
    const folder = await drive.files.create({
      fields: "id",
      requestBody: fileMetadata,
    });
    console.log("Folder ID:", folder.data.id);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
};

export async function deleteFolder(folderId: string) {
  const drive = google.drive({ version: "v3", auth });

  try {
    await drive.files.delete({
      fileId: folderId,
    });
    console.log("Folder deleted successfully");
  } catch (error) {
    console.error("Error deleting folder:", error);
  }
}

export async function getAllFilesInGoogleDriveFolder(){
    
    const drive = google.drive({ version: "v3", auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const listParams = {
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
    };
    try {
        const res = await drive.files.list(listParams);
        const listResults = res.data.files || [];
        console.log('Files in the folder:', listResults.length)
        console.log(listResults);
    } catch (error) {
        console.error('Error listing files:', error);
    }
    
}



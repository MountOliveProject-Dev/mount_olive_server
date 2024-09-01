import { google } from "googleapis";
import fs from "fs";
import Hapi from "@hapi/hapi";

export const audioMimeTypes = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/vnd.wave",
  "audio/ogg",
  "audio/flac",
  "audio/aac",
  "audio/x-aac",
];

const credentialsString = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("Raw credentials string:", credentialsString);

let credentials;
try {
  credentials = JSON.parse(credentialsString || "{}");
  console.log("Parsed credentials:", credentials);
} catch (error) {
  console.error("Error parsing credentials:", error);
}

if (!credentials.client_email) {
  console.error("client_email is missing from the credentials");
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

async function uploadFileToResumableSession(
  uploadUrl: string,
  filePath: string
) {
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": "application/octet-stream",
    },
    body: fileStream,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.statusText}`);
  }

  const fileData = await res.json();
  console.log("Uploaded file data:", fileData);
}

export async function createFolder(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { name } = request.payload as { name: string };
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });
    return h
      .response({
        message: `The folder ${name} has been created successfully!!`,
      })
      .code(201);
  } catch (error) {
    console.error("Error creating folder:", error);
    return h.response("Error creating folder").code(500);
  }
}

export async function getFolder(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { folderId } = request.params as { folderId: string };
  try {
    const folder = await drive.files.get({
      fileId: folderId,
      fields: "id, name, mimeType",
    });
    return h.response(folder.data).code(200);
  } catch (error) {
    console.error("Error getting folder:", error);
    return h.response("Error getting folder").code(500);
  }
}

export async function createAudioFile(audioFile: any) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const filePath = audioFile.path;
  const fileName = audioFile.hapi.filename;
  const mimeType = audioFile.hapi.headers["content-type"];
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not defined");
  }
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      },
      fields: "id",
    });
    console.log("File ID: ", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error("Error uploading file: ", error);
  }
}

export async function listAndShareAudioFiles() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  try {
    const listParams = {
      q: `'${folderId}' in parents and mimeType contains 'audio/' and trashed = false`,
      fields: "files(id, name, mimeType)",
    };
    const res = await drive.files.list(listParams);
    const listResults = res.data.files || [];
    console.log("Audio files in the folder:", listResults.length);
    console.log(listResults);

    const audioFiles = listResults.filter((file) =>
      audioMimeTypes.includes(file.mimeType!)
    );

    for (const file of audioFiles) {
      const fileId = file.id;

      if (!fileId) {
        console.warn(`File ID is missing for file: ${file.name}`);
        continue;
      } else {
        console.log(`Sharing fileId: ${fileId}`);
        await drive.permissions.create({
          fileId: file.id as string,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        const link = `https://drive.google.com/file/d/${file.id}/view?usp=sharing`;
        console.log(`Name: ${file.name}, Shareable Link: ${link}`);
      }
    }
  } catch (error) {
    console.error("Error listing or sharing audio files:", error);
  }
}

export async function deleteFolder(folderId: string) {
  try {
    await drive.files.delete({
      fileId: folderId,
    });
    console.log("Folder deleted successfully");
  } catch (error) {
    console.error("Error deleting folder:", error);
  }
}

export async function getAllFilesInGoogleDriveFolder() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const listParams = {
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
  };
  try {
    const res = await drive.files.list(listParams);
    const listResults = res.data.files || [];
    console.log("Files in the folder:", listResults.length);
    console.log(listResults);
  } catch (error) {
    console.error("Error listing files:", error);
  }
}

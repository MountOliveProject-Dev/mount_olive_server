import { google } from "googleapis";
import fs from "fs";
import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
dotenv.config();
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
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log("Raw credentials string:", credentials);


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

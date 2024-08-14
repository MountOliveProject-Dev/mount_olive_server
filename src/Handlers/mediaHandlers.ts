import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod,MediaType } from "../Helpers";
import multer from "multer";
import { MulterRequest } from "../Helpers";
import {createAudioFile} from "../Handlers";

const upload = multer({ dest: "uploads/" });

export const createAudioMediaHandler : Hapi.Lifecycle.Method = async (
  request: MulterRequest,
  h
) => {
  const uploadMiddleware = upload.single("audioFile"); // 'audioFile' is the key for the file in the form data

  // Multer middleware processing
  await new Promise((resolve, reject) => {
    uploadMiddleware(request.raw.req, request.raw.res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(null);
    });
  });

  const file = request.raw.req.file;

  if (!file) {
    return h.response({ error: "No file uploaded" }).code(400);
  }

  try {
    // Upload the file to Google Drive
    const fileId = await createAudioFile(file);
    // Respond with the file ID from Google Drive
    return h.response({ fileId }).code(200);
  } catch (error) {
    return h
      .response({ error: "Failed to upload file to Google Drive" })
      .code(500);
  }
};
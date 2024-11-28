import { Request } from "@hapi/hapi";
import { File } from "multer";
import { IncomingMessage, ServerResponse } from "http";

export enum MediaType {
  VIDEO = "Video",
  AUDIO = "Audio",
  IMAGE = "Image",
}

export enum NotificationType {
  VIDEO = "Video",
  AUDIO = "Audio",
  IMAGE ="Image",
  EVENT = "Event",
}


// Extend the Request interface to include Multer's `file` property
export interface MulterRequest extends Request {
  raw: {
    req: IncomingMessage & { file?: File }; // Extend the req property to include `file`
    res: ServerResponse<IncomingMessage>;
  };
}

export enum folderType {
  Audios = "Audios",
  Images = "Images"
}

export enum LogType{
  INFO = "Info",
  ERROR = "Error",
  WARNING = "Warning",
}

export enum RequestType{
 CREATE = "Create",
 UPDATE = "Update",
 DELETE = "Delete",
 READ = "Read",
}
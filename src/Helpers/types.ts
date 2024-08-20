import { Request } from "@hapi/hapi";
import { File } from "multer";
import { IncomingMessage, ServerResponse } from "http";

export enum MediaType {
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export enum NotificationType {
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  EVENT = "EVENT",
}


// Extend the Request interface to include Multer's `file` property
export interface MulterRequest extends Request {
  raw: {
    req: IncomingMessage & { file?: File }; // Extend the req property to include `file`
    res: ServerResponse<IncomingMessage>;
  };
}

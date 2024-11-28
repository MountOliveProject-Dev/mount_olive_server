import { LogType } from "@prisma/client";


export interface EventInput {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  createdAt: string;
  location: string;
  date: string;
  time: string;
  venue: string;
  host: string;
  updatedAt: string;
  uniqueId: string;
  uploadThumbnail: boolean;
  name:string;
  mimeType:string;
  filePath:string;
  Id:string;
}


//create modal for to create manyevents
export interface ManyEventInput {
  events: EventInput[];
}

import { MediaType, folderType } from "../Helpers";

export interface MediaInput {
  title: string;
  description: string;
  url: string;
  duration: number;
  type: MediaType;
  uniqueId : string;
  postedAt: string;
  updatedAt: string;
  host: string;
}

export interface folderInput{
  type: folderType;
  name: string
}

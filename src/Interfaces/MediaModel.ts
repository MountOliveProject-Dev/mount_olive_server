import { MediaType } from "../Helpers";

export interface MediaInput {
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: number;
  type: MediaType;
  uniqueId : string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

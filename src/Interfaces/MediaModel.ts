import { MediaType } from "../Helpers";

export interface MediaInput {
  id: number;
  title: String;
  description: String;
  thumbnail: String;
  url: String;
  duration: number;
  type: MediaType;
  category: String;
  createdAt: string;
  updatedAt: string;
}

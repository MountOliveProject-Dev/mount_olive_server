import { MediaType } from "../Helpers";

export interface MediaInput {
  id: number;
  title: String;
  description: String;
  coverPhoto: String;
  source: String;
  duration: number;
  type: MediaType;
  category: String;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
}

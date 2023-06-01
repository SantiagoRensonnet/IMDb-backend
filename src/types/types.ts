import { ObjectId } from "mongodb";
export interface PosterObject {
  mongoId: string;
  posterURL: string;
}
export interface PosterMap {
  [key: string]: PosterObject;
}
export type UpdateOperation = {
  updateOne: {
    filter: { _id: ObjectId };
    update: { $set: { posterURL: string } };
  };
};

import { Schema, models, model, Document } from "mongoose";

export interface ITag {
   name: string;
   questions: number;
}

// In case that  i need to get access to the document methods like _id
export interface ITagDoc extends ITag, Document {}

const TagSchema = new Schema<ITag>(
   {
      name: { type: String, required: true, unique: true },
      questions: { type: Number, default: 0 },
   },
   { timestamps: true }
);

export const Tag = models?.Tag || model<ITag>("Tag", TagSchema);

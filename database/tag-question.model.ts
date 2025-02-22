import { Schema, models, model, Types, Document } from "mongoose";

export interface ITagQuestion {
   tag: Types.ObjectId;
   question: Types.ObjectId;
}

// in case i need to get access to the document methods like _id
export interface ITagQuestionDoc extends ITagQuestion, Document {}

const TagQuestionSchema = new Schema<ITagQuestion>(
   {
      tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
      question: {
         type: Schema.Types.ObjectId,
         ref: "Question",
         required: true,
      },
   },
   { timestamps: true }
);

export const TagQuestion =
   models?.TagQuestion || model<ITagQuestion>("TagQuestion", TagQuestionSchema);

import { Schema, models, model, Types, Document } from "mongoose";

export interface IAnswer {
   author: Types.ObjectId;
   question: Types.ObjectId;
   content: string;
   upvotes: number;
   downvotes: number;
}

// In case that  i need to get access to the document methods like _id
export interface IAnswerDoc extends IAnswer, Document {}

const AnswerSchema = new Schema<IAnswer>(
   {
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      question: {
         type: Schema.Types.ObjectId,
         ref: "Question",
         required: true,
      },
      content: { type: String, required: true },
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
   },
   { timestamps: true }
);

export const Answer = models?.Answer || model<IAnswer>("Answer", AnswerSchema);

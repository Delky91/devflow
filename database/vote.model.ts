import { Schema, models, model, Types, Document } from "mongoose";

export interface IVote {
   author: Types.ObjectId;
   actionId: Types.ObjectId;
   actionType: string;
   voteType: string;
}

// in case i need to get access to the document methods like _id
export interface IVoteDoc extends IVote, Document {}

const VoteSchema = new Schema<IVote>(
   {
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      actionId: { type: Schema.Types.ObjectId, required: true },
      actionType: {
         type: String,
         enum: ["question", "answer"],
         required: true,
      },
      voteType: { type: String, enum: ["upvote", "downvote"], required: true },
   },
   { timestamps: true }
);

export const Vote = models?.Vote || model<IVote>("Vote", VoteSchema);

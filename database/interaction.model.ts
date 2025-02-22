import { model, models, Schema, Types } from "mongoose";

/* Interactions arefor the recomendation algorithm.
It is a collection of interactions between users and questions. */

export interface IInteraction {
   user: Types.ObjectId;
   action: string;
   actionId: Types.ObjectId;
   actionType: string;
}

// In case that  i need to get access to the document methods like _id
export interface IInteractionDoc extends IInteraction, Document {}

const InteractionSchema = new Schema<IInteraction>(
   {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      action: { type: String, required: true }, // 'upvote', 'downvote', 'view', 'ask_question',
      actionId: { type: Schema.Types.ObjectId, required: true }, // 'questionId', 'answerId',
      actionType: {
         type: String,
         enum: ["question", "answer"],
         required: true,
      },
   },
   { timestamps: true }
);

export const Interaction =
   models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);

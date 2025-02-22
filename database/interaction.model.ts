import { model, models, Schema, Types } from "mongoose";

/* Interactions arefor the recomendation algorithm.
It is a collection of interactions between users and questions. */

export interface IInteraction {
   user: Types.ObjectId;
   action: string;
   actionId: Types.ObjectId;
   actionType: "question" | "answer";
}

const InteractionSchema = new Schema<IInteraction>(
   {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      action: { type: String, required: true },
      // action id can be a question id, answer id or a user id
      actionId: { type: Schema.Types.ObjectId, required: true },
      actionType: {
         type: String,
         enum: ["question", "answer"],
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

export const Interaction =
   models?.Interaction || model<IInteraction>("Interaction", InteractionSchema);

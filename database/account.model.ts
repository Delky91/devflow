import { model, models, Schema, Types } from "mongoose";

export interface IAccount {
   userId: Types.ObjectId;
   name: string;
   image?: string;
   password?: string;
   provider: string; // can be a enum
   providerAccountId: string;
}

const AccountSchema = new Schema<IAccount>(
   {
      userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
      image: { type: String },
      password: { type: String },
      provider: { type: String, required: true },
      providerAccountId: { type: String, required: true },
   },
   {
      timestamps: true,
   }
);

export const Account =
   models?.account || model<IAccount>("Account", AccountSchema);

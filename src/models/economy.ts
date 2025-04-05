import mongoose, { Schema, Document } from "mongoose";

export interface IEconomy extends Document {
    userId: string;
    guildId: string;
    balance: number;
    bank: number;
    lastDaily: Date;
    lastWork: Date;
    workCount: number;
}

const EconomySchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    balance: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    lastDaily: { type: Date, default: new Date(0) },
    lastWork: { type: Date, default: new Date(0) },
    workCount: { type: Number, default: 0 }
}, { timestamps: true });

EconomySchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const Economy = mongoose.model<IEconomy>('Economy', EconomySchema);
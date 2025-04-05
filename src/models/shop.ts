import mongoose, { Schema, Document } from 'mongoose';

export interface IShopItem extends Document {
    guildId: string;
    name: string;
    description: string;
    price: number;
    role?: string;
    stock?: number;
}

const ShopItemSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    role: { type: String, default: null },
    stock: { type: Number, default: -1 } 
}, { timestamps: true });

export const ShopItem = mongoose.model<IShopItem>('ShopItem', ShopItemSchema);
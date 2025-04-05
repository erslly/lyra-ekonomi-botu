import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  userId: string;
  guildId: string;
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    purchasedAt: Date;
  }>;
}

const InventorySchema: Schema = new Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'ShopItem' },
    quantity: { type: Number, default: 1 },
    purchasedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

InventorySchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
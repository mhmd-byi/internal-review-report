import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArea extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const AreaSchema = new Schema<IArea>({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

// Prevent overwrite model error
const Area: Model<IArea> = mongoose.models.Area || mongoose.model<IArea>('Area', AreaSchema);

export default Area;

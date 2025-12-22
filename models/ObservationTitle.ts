import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IObservationTitle extends Document {
    title: string;
    area?: string; // Optional link to an area
    createdAt: Date;
    updatedAt: Date;
}

const ObservationTitleSchema = new Schema<IObservationTitle>({
    title: { type: String, required: true, unique: true },
    area: { type: String }, // Can be used for filtering
}, { timestamps: true });

// Prevent overwrite model error
const ObservationTitle: Model<IObservationTitle> = mongoose.models.ObservationTitle || mongoose.model<IObservationTitle>('ObservationTitle', ObservationTitleSchema);

export default ObservationTitle;

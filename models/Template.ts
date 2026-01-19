import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplate extends Document {
    area: string;
    title: string;
    risk: 'High' | 'Medium' | 'Low';
    actionPlan: string;
    background?: string;
    observation?: string;
    recommendation?: string;
    implication?: string;
    createdBy?: mongoose.Schema.Types.ObjectId;
    creatorName?: string;
}

const TemplateSchema = new Schema<ITemplate>({
    area: { type: String, required: true },
    title: { type: String, required: true },
    risk: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    actionPlan: { type: String, default: '' },
    background: { type: String, default: '' },
    observation: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    implication: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    creatorName: { type: String },
}, { timestamps: true });

// Prevent overwrite model error
const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;

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
}, { timestamps: true });

// Prevent overwrite model error
const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;

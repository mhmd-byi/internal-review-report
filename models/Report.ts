import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IObservation {
    id: string; // Client-side ID
    title: string;
    isNA: boolean;
    area: string;
    type: 'Financial' | 'Non Financial';
    risk: 'High' | 'Medium' | 'Low';
    financialImpact?: number;
    background: string;
    observation: string;
    recommendation: string;
    implication: string;
    actionPlan: string;
    targetDate?: Date;
    status: 'Open' | 'In-Progress' | 'Closed';
    responsibility: string;
    responsibilityPersonName?: string;
    reviewerNotes?: string;
}

export interface IReport extends Document {
    schoolName: string;
    location: string;
    period: string;
    auditDate: Date;
    preparedBy: string;
    observations: IObservation[];
    createdBy?: mongoose.Schema.Types.ObjectId;
    creatorName?: string;
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: mongoose.Schema.Types.ObjectId;
    assignedToName?: string;
    workflowStatus?: 'Draft' | 'Sent to Management' | 'Submitted by Management' | 'Approved' | 'Declined';
    isDraft?: boolean; // New field to distinguish between draft and saved reports

    // Approval workflow fields
    submittedAt?: Date;
    reviewedBy?: mongoose.Schema.Types.ObjectId;
    reviewedByName?: string;
    reviewedAt?: Date;
    adminReviewNotes?: string;
    declineReason?: string;
}

const ObservationSchema = new Schema<IObservation>({
    id: { type: String, required: true },
    title: { type: String, default: '' },
    isNA: { type: Boolean, default: false },
    area: { type: String, default: '' },
    type: { type: String, enum: ['Financial', 'Non Financial'], default: 'Non Financial' },
    risk: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    financialImpact: { type: Number },
    background: { type: String, default: '' },
    observation: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    implication: { type: String, default: '' },
    actionPlan: { type: String, default: '' },
    targetDate: { type: Date },
    status: { type: String, enum: ['Open', 'In-Progress', 'Closed'], default: 'Open' },
    responsibility: { type: String, default: '' },
    responsibilityPersonName: { type: String, default: '' },
    reviewerNotes: { type: String, default: '' },
}, { _id: false }); // Subdocument, no need for separate _id usually, but can have if needed.

const ReportSchema = new Schema<IReport>({
    schoolName: { type: String, default: 'MSB School' },
    location: { type: String, default: 'Rajkot' },
    period: { type: String, default: '' },
    auditDate: { type: Date, default: Date.now },
    preparedBy: { type: String, default: 'Internal Audit Team' },
    observations: [ObservationSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    creatorName: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String },
    workflowStatus: {
        type: String,
        enum: ['Draft', 'Sent to Management', 'Submitted by Management', 'Approved', 'Declined'],
        default: 'Draft'
    },
    isDraft: { type: Boolean, default: false },

    // Approval workflow fields
    submittedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedByName: { type: String },
    reviewedAt: { type: Date },
    adminReviewNotes: { type: String },
    declineReason: { type: String },
}, { timestamps: true });

// Prevent overwrite model error
const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;

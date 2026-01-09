import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    itsId: string;  // 8-digit numeric ID
    password?: string;
    role: 'admin' | 'user' | 'management';
    responsibility?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    itsId: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v: string) {
                return /^\d{8}$/.test(v);
            },
            message: 'ITS ID must be exactly 8 digits'
        }
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user', 'management'], default: 'user' },
    responsibility: { type: String },
}, { timestamps: true });

// Prevent overwrite model error
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

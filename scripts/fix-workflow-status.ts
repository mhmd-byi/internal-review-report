/**
 * Migration Script: Fix Missing Workflow Status
 * 
 * This script updates all reports in the database that have missing or null workflowStatus
 * values and sets them to 'Draft' by default.
 * 
 * Run this script once to fix existing data:
 * npx ts-node scripts/fix-workflow-status.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Report Schema (simplified for migration)
const ReportSchema = new mongoose.Schema({
    schoolName: String,
    location: String,
    period: String,
    auditDate: Date,
    preparedBy: String,
    observations: Array,
    workflowStatus: {
        type: String,
        enum: ['Draft', 'Sent to Management', 'Submitted by Management', 'Approved', 'Declined'],
        default: 'Draft'
    },
    isDraft: Boolean,
    assignedTo: mongoose.Schema.Types.ObjectId,
    assignedToName: String,
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true });

const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

async function fixWorkflowStatus() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Find all reports with missing or null workflowStatus
        const reportsToUpdate = await Report.find({
            $or: [
                { workflowStatus: null },
                { workflowStatus: { $exists: false } }
            ]
        });

        console.log(`\nFound ${reportsToUpdate.length} reports with missing workflowStatus`);

        if (reportsToUpdate.length === 0) {
            console.log('No reports need updating. All reports have a workflowStatus.');
            await mongoose.disconnect();
            return;
        }

        // Update each report
        let updatedCount = 0;
        for (const report of reportsToUpdate) {
            // Determine the appropriate status based on other fields
            let newStatus = 'Draft';

            if (report.assignedTo && report.assignedToName) {
                // If assigned to someone, it was likely sent to management
                newStatus = 'Sent to Management';
            }

            await Report.findByIdAndUpdate(report._id, {
                workflowStatus: newStatus
            });

            updatedCount++;
            console.log(`  Updated report ${report._id} - Set status to: ${newStatus}`);
        }

        console.log(`\n✓ Successfully updated ${updatedCount} reports`);
        console.log('\nMigration complete!');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');

    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
fixWorkflowStatus();

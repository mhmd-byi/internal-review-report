const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function verifyImport() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Define schema if not already defined
        const TemplateSchema = new mongoose.Schema({
            area: String,
            title: String,
            risk: String,
            actionPlan: String,
            background: String,
            observation: String,
            recommendation: String,
            implication: String,
        }, { timestamps: true });

        const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

        // Get total count
        const totalCount = await Template.countDocuments();
        console.log(`📊 Total Templates: ${totalCount}\n`);

        // Get areas
        const areas = await Template.distinct('area');
        console.log(`📁 Unique Areas (${areas.length}):`);
        areas.forEach(area => console.log(`   - ${area}`));

        // Get risk distribution
        const highRisk = await Template.countDocuments({ risk: 'High' });
        const mediumRisk = await Template.countDocuments({ risk: 'Medium' });
        const lowRisk = await Template.countDocuments({ risk: 'Low' });

        console.log(`\n⚠️ Risk Distribution:`);
        console.log(`   - High: ${highRisk}`);
        console.log(`   - Medium: ${mediumRisk}`);
        console.log(`   - Low: ${lowRisk}`);

        // Show sample template
        const sample = await Template.findOne().lean();
        console.log(`\n📝 Sample Template:`);
        console.log(`   Area: ${sample.area}`);
        console.log(`   Title: ${sample.title.substring(0, 50)}...`);
        console.log(`   Risk: ${sample.risk}`);
        console.log(`   Has Background: ${sample.background ? 'Yes' : 'No'}`);
        console.log(`   Has Observation: ${sample.observation ? 'Yes' : 'No'}`);
        console.log(`   Has Implication: ${sample.implication ? 'Yes' : 'No'}`);
        console.log(`   Has Recommendation: ${sample.recommendation ? 'Yes' : 'No'}`);
        console.log(`   Has Action Plan: ${sample.actionPlan ? 'Yes' : 'No'}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyImport();

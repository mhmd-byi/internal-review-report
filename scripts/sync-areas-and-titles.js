const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define schemas
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

const AreaSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

const ObservationTitleSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    area: { type: String },
}, { timestamps: true });

async function syncAreasAndTitles() {
    try {
        console.log('🚀 Starting synchronization of Areas and Observation Titles...\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);
        const Area = mongoose.models.Area || mongoose.model('Area', AreaSchema);
        const ObservationTitle = mongoose.models.ObservationTitle || mongoose.model('ObservationTitle', ObservationTitleSchema);

        // Get all templates
        const templates = await Template.find().lean();
        console.log(`📊 Found ${templates.length} templates\n`);

        // Extract unique areas
        const uniqueAreas = [...new Set(templates.map(t => t.area))].filter(Boolean);
        console.log(`📁 Found ${uniqueAreas.length} unique areas`);

        // Clear existing areas
        await Area.deleteMany({});
        console.log('   Cleared existing areas');

        // Insert new areas
        const areaDocuments = uniqueAreas.map(name => ({ name }));
        await Area.insertMany(areaDocuments);
        console.log(`   ✅ Inserted ${areaDocuments.length} areas\n`);

        // Extract unique observation titles with their areas
        const titleMap = new Map();
        templates.forEach(t => {
            if (t.title && !titleMap.has(t.title)) {
                titleMap.set(t.title, t.area);
            }
        });

        console.log(`📝 Found ${titleMap.size} unique observation titles`);

        // Clear existing observation titles
        await ObservationTitle.deleteMany({});
        console.log('   Cleared existing observation titles');

        // Insert new observation titles
        const titleDocuments = Array.from(titleMap.entries()).map(([title, area]) => ({
            title,
            area
        }));
        await ObservationTitle.insertMany(titleDocuments);
        console.log(`   ✅ Inserted ${titleDocuments.length} observation titles\n`);

        // Summary by area
        console.log('📊 Summary by Area:');
        for (const area of uniqueAreas) {
            const titlesInArea = templates.filter(t => t.area === area).length;
            console.log(`   ${area}: ${titlesInArea} observations`);
        }

        console.log('\n✅ Synchronization completed successfully!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Synchronization failed:');
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

syncAreasAndTitles();

const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define Template Schema
const TemplateSchema = new mongoose.Schema({
    area: { type: String, required: true },
    title: { type: String, required: true },
    risk: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    actionPlan: { type: String, default: '' },
    background: { type: String, default: '' },
    observation: { type: String, default: '' },
    recommendation: { type: String, default: '' },
    implication: { type: String, default: '' },
}, { timestamps: true });

const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

const FILE_PATH = path.join(__dirname, '../Attalim Report Responses.xlsx');

async function runMigration() {
    try {
        console.log('🚀 Starting migration...');

        // 1. Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected');

        // 2. Read Excel file
        console.log(`📄 Reading Excel file: ${FILE_PATH}`);
        const workbook = xlsx.readFile(FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Get raw data
        const rawData = xlsx.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false,
            blankrows: false,
        });

        if (!rawData.length) {
            throw new Error('Excel file is empty or no data found');
        }

        console.log(`📊 Total rows found: ${rawData.length}`);

        // Log first row to check headers
        console.log('📋 Excel headers found:', Object.keys(rawData[0]));

        // 3. Transform and validate data
        const templates = [];
        const errors = [];

        rawData.forEach((row, index) => {
            try {
                const rowNumber = index + 2; // Excel row number (accounting for header)

                // Extract and validate required fields
                const area = row['Area']?.toString().trim();
                const title = row['Observations']?.toString().trim();
                const riskLevel = row['Risk Level']?.toString().trim();

                if (!area) {
                    errors.push(`Row ${rowNumber}: Missing 'Area'`);
                    return;
                }

                if (!title) {
                    errors.push(`Row ${rowNumber}: Missing 'Observations' (title)`);
                    return;
                }

                // Map risk level
                let risk = 'Medium';
                if (riskLevel) {
                    const riskLower = riskLevel.toLowerCase();
                    if (riskLower.includes('high')) risk = 'High';
                    else if (riskLower.includes('low')) risk = 'Low';
                    else if (riskLower.includes('medium')) risk = 'Medium';
                }

                const template = {
                    area,
                    title,
                    risk,
                    background: row['Background']?.toString().trim() || '',
                    observation: row['Observation Text']?.toString().trim() || '',
                    implication: row['Implication']?.toString().trim() || '',
                    recommendation: row['Recommendation']?.toString().trim() || '',
                    actionPlan: row['Recommendation']?.toString().trim() || '',
                };

                templates.push(template);
            } catch (err) {
                errors.push(`Row ${index + 2}: ${err.message || 'Unknown error'}`);
            }
        });

        // Report errors if any
        if (errors.length > 0) {
            console.warn('⚠️ Validation warnings:');
            errors.forEach(err => console.warn(`  - ${err}`));
        }

        console.log(`✅ Valid templates to import: ${templates.length}`);

        if (templates.length === 0) {
            throw new Error('No valid templates found to import');
        }

        // 4. Delete existing templates
        console.log('🗑️ Clearing existing templates...');
        const deleteResult = await Template.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} existing records`);

        // 5. Insert new templates
        console.log('💾 Inserting new templates...');
        const insertResult = await Template.insertMany(templates, { ordered: false });
        console.log(`   Inserted ${insertResult.length} templates`);

        // 6. Summary statistics
        const areas = [...new Set(templates.map(t => t.area))];
        const riskCounts = {
            High: templates.filter(t => t.risk === 'High').length,
            Medium: templates.filter(t => t.risk === 'Medium').length,
            Low: templates.filter(t => t.risk === 'Low').length,
        };

        console.log('\n📊 Import Summary:');
        console.log(`   Total templates: ${insertResult.length}`);
        console.log(`   Unique areas: ${areas.length}`);
        console.log(`   Risk breakdown:`);
        console.log(`     - High: ${riskCounts.High}`);
        console.log(`     - Medium: ${riskCounts.Medium}`);
        console.log(`     - Low: ${riskCounts.Low}`);

        // 7. Sync Areas and ObservationTitles
        console.log('\n🔄 Syncing Areas and Observation Titles...');

        const AreaSchema = new mongoose.Schema({
            name: { type: String, required: true, unique: true },
        }, { timestamps: true });

        const ObservationTitleSchema = new mongoose.Schema({
            title: { type: String, required: true, unique: true },
            area: { type: String },
        }, { timestamps: true });

        const Area = mongoose.models.Area || mongoose.model('Area', AreaSchema);
        const ObservationTitle = mongoose.models.ObservationTitle || mongoose.model('ObservationTitle', ObservationTitleSchema);

        // Clear and insert areas
        await Area.deleteMany({});
        const areaDocuments = areas.map(name => ({ name }));
        await Area.insertMany(areaDocuments);
        console.log(`   ✅ Synced ${areaDocuments.length} areas`);

        // Clear and insert observation titles with area mapping
        await ObservationTitle.deleteMany({});
        const titleMap = new Map();
        templates.forEach(t => {
            if (t.title && !titleMap.has(t.title)) {
                titleMap.set(t.title, t.area);
            }
        });
        const titleDocuments = Array.from(titleMap.entries()).map(([title, area]) => ({
            title,
            area
        }));
        await ObservationTitle.insertMany(titleDocuments);
        console.log(`   ✅ Synced ${titleDocuments.length} observation titles`);

        console.log('\n✅ Migration and synchronization completed successfully!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error(error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

runMigration();

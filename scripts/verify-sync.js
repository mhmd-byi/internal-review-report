const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const AreaSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

const ObservationTitleSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    area: { type: String },
}, { timestamps: true });

async function verifySync() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Area = mongoose.models.Area || mongoose.model('Area', AreaSchema);
        const ObservationTitle = mongoose.models.ObservationTitle || mongoose.model('ObservationTitle', ObservationTitleSchema);

        // Get all areas
        const areas = await Area.find().sort({ name: 1 });
        console.log(`📁 Total Areas: ${areas.length}\n`);
        console.log('Areas:');
        areas.forEach((area, i) => {
            console.log(`   ${i + 1}. ${area.name}`);
        });

        // Get all observation titles
        const titles = await ObservationTitle.find().sort({ title: 1 });
        console.log(`\n📝 Total Observation Titles: ${titles.length}\n`);

        // Group titles by area
        const titlesByArea = {};
        titles.forEach(t => {
            if (!titlesByArea[t.area]) {
                titlesByArea[t.area] = [];
            }
            titlesByArea[t.area].push(t.title);
        });

        console.log('Observation Titles by Area:');
        Object.keys(titlesByArea).sort().forEach(area => {
            console.log(`\n   ${area} (${titlesByArea[area].length} titles):`);
            titlesByArea[area].slice(0, 3).forEach(title => {
                const truncated = title.length > 60 ? title.substring(0, 60) + '...' : title;
                console.log(`      - ${truncated}`);
            });
            if (titlesByArea[area].length > 3) {
                console.log(`      ... and ${titlesByArea[area].length - 3} more`);
            }
        });

        console.log('\n✅ Verification completed!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

verifySync();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const TemplateSchema = new mongoose.Schema({
    area: { type: String, required: true },
    title: { type: String, required: true },
    risk: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    actionPlan: { type: String, default: '' },
}, { timestamps: true });

const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

const initialTemplates = [
    // 1. INTERNAL CONTROLS AND FINANCIAL MANAGEMENT
    {
        area: 'Internal Controls and Financial Management',
        title: 'Minutes Register for Management Meetings is not maintained and no follow-up action taken.',
        risk: 'Medium',
        actionPlan: 'Mandatory to maintain minutes of meeting for both and as per Internal Idarah requirement as well as for statutory (Trust) requirements as well.'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'Petty cash balance not reconciled with physical Cash Available.',
        risk: 'High',
        actionPlan: 'Petty Cash & Physical Cash Should Reconcile'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'Construction books not maintained',
        risk: 'High',
        actionPlan: 'Books of accounts for funds received for construction are not maintained, only bank statement was made available, and receipt is not tallied with physical sheet. Ie two donations received in bank are not recorded on manual record maintained.'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'Donation Received from Dawat E Hadiyah not shown in Budget.',
        risk: 'High',
        actionPlan: 'All amounts receipt & payments need to be shown accurately in the budget & actuals.'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'Books of accounts are not maintained properly',
        risk: 'Medium',
        actionPlan: 'Timely entries are not passed in tally and need to be regularized.'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'Loan from Jamaat',
        risk: 'High',
        actionPlan: 'An Amount which belongs to MSB is collected in Jammat Account and is transferred to MSB. Which is classified as liabilities. However, the same is not a liability of school.'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'No Legal Status of School',
        risk: 'High',
        actionPlan: 'The school is not a legally registered entity, it does not have any physical presence or verifiable activities.'
    },
    {
        area: 'Internal Controls and Financial Management',
        title: 'Books of Account not maintained at school',
        risk: 'Low',
        actionPlan: 'The school\'s financial records are not maintained on-site as required but are instead held at the Jamaat office. This practice compromises transparency, causes delays in accounting, and results in inconsistent record-keeping.'
    },

    // 2. REVENUE & INCOME RECOGNITION
    {
        area: 'Revenue & Income Recognition',
        title: 'Garamat Money Deposit – record not maintained – Rs. 5,000 per student',
        risk: 'High',
        actionPlan: 'Implement Detailed Record-Keeping System. Need a proper book and record.'
    },
    {
        area: 'Revenue & Income Recognition',
        title: 'Outstanding Current year Admission fees for 24-25',
        risk: 'Medium',
        actionPlan: 'Outstanding fee dues must be recovered at the earliest to ensure financial stability. As of January, total receivables stand at ₹48.20 lakhs, while actual collections amount to ₹39.22 lakhs, leaving an unrecovered balance of ₹8.96 lakhs.'
    },
    {
        area: 'Revenue & Income Recognition',
        title: 'Admission fees register not reconciled with books',
        risk: 'High',
        actionPlan: 'The admission fee records are not properly reconciled. As of January, total receivables amount to ₹28.62 lakhs, while actual collections stand at ₹16.96 lakhs, resulting in an unreconciled difference of ₹11.66 lakhs. This sum of money is parked in books of Anjuman E Saifee book and no entry to this effect is passed.'
    },
    {
        area: 'Revenue & Income Recognition',
        title: 'The admission fee is parked in books of Anjuma E Saifee',
        risk: 'Medium',
        actionPlan: 'All fee collections must be recorded in the books of MSB and should not be utilized or parked under Anjuman E Saifee’s accounts. A journal entry to this is not yet passed or recorded.'
    },
    {
        area: 'Revenue & Income Recognition',
        title: 'Construction fund received for MSB is parked with Anjuman e Saifee',
        risk: 'High',
        actionPlan: '1. A sum of ₹40 lakhs is parked in the books of Anjuman E Saifee without any supporting documentation or records. 2. An amount of ₹50 lakhs has been allocated under the Hussaini Scheme, with no official records or minutes of meetings available. Both funds have been diverted from the Tamir Fund, which was designated for the construction of school buildings.'
    },
    {
        area: 'Revenue & Income Recognition',
        title: 'Cash & Bank reconciliation not done',
        risk: 'Medium',
        actionPlan: 'Cash and bank reconciliations must be conducted regularly and in a timely manner to ensure accuracy and financial integrity.'
    },

    // 3. EXPENSES & COST MANAGEMENT
    {
        area: 'Expenses & Cost Management',
        title: 'Lack of Authorization Matrix and Role Segregation for Petty Cash Expenses.',
        risk: 'Medium',
        actionPlan: 'Implement an authorization matrix and segregate duties for petty cash management.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Inadequate head while booking of expenses',
        risk: 'High',
        actionPlan: 'Revenue nature item should not be booked under capital and should be charged to P&L.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Lack of Inventory Records for Stationery',
        risk: 'Low',
        actionPlan: 'Implement an inventory management system for stationery.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Lack of Comparative Analysis for Major Expenses and Purchases',
        risk: 'High',
        actionPlan: 'Implement a policy for comparative analysis before finalizing significant purchases.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Payments Processed Based on Proforma Invoices/ Estimate, Photocopy Instead of Actual Invoices',
        risk: 'High',
        actionPlan: 'Ensure all payments are processed only against actual invoices and not on Proforma Invoices/ Estimate or Photocopy.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Lack of Purchase Orders',
        risk: 'High',
        actionPlan: 'Procurements are made without issuing any purchase order.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Implementation of Charts of Accounts & Cost Centers.',
        risk: 'Low',
        actionPlan: 'Based on the latest training and instructions from Idarah, they should maintain and start their books of account using cost centers. However, these instructions have been received lately and need time for implementation. This is considered as low as of now'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Rent Agreement expired',
        risk: 'Low',
        actionPlan: 'All rental agreements have expired and require immediate renewal. Additionally, security deposits of ₹1,00,000 and ₹5,00,000 remain with the landlords without valid documented confirmation.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'No Rent Agreement',
        risk: 'Low',
        actionPlan: 'Two Muraqeebin are residing in rental premises without any formal rental agreement in place.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Payment of Security deposit',
        risk: 'Low',
        actionPlan: 'Payment of Security deposit made on behalf of landowner, however the same is not recovered from landowner (torrent power). If the same is not recoverable, it needs to be expensed out'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Salary sheet not properly maintained',
        risk: 'Low',
        actionPlan: 'The salary sheets lack essential details and must be structured comprehensively to include elements such as absent days, deductions, and other relevant components.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'No sheet maintained for non-teaching staff salary.',
        risk: 'High',
        actionPlan: 'No records or details of non-teaching staff have been made available for verification.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Payments are made w/o approval/signature of Masool',
        risk: 'Medium',
        actionPlan: 'Proper approval needs to be maintained before payment of expenses.'
    },
    {
        area: 'Expenses & Cost Management',
        title: 'Salary expenses are not recorded under salary head.',
        risk: 'Medium',
        actionPlan: 'Salary expenses need to be recorded under salary head and not under any different head (recorded as Sports Expenses and huffaz Expenses)'
    },

    // 4. FIXED ASSETS
    {
        area: 'Fixed Assets',
        title: 'Fixed Assets Not Properly Identified and Lack of Comprehensive Physical Verification.',
        risk: 'Medium',
        actionPlan: 'FAR needs to be maintained. Conduct periodic physical counts of fixed assets and ensure proper identification.'
    },
    {
        area: 'Fixed Assets',
        title: 'Dead Stock register is not updated',
        risk: 'Medium',
        actionPlan: 'Maintain up-to-date Dead Stock register for better visibility and control over obsolete or non-moving inventory items'
    },
    {
        area: 'Fixed Assets',
        title: 'Fixed assets are purchased on call. Delivery challan and w/o any invoice',
        risk: 'High',
        actionPlan: 'Proper invoices for the purchase of fixed assets are not available for verification. This lack of documentation may also lead to compliance issues, difficulty in asset tracking, and potential financial misstatements.'
    },
    {
        area: 'Fixed Assets',
        title: 'Fixed asset purchased in the name of committee member.',
        risk: 'Medium',
        actionPlan: 'Certain fixed assets have been purchased in the name of a committee member instead of being registered under the institution. This practice raises concerns regarding ownership rights, transparency, and proper accounting treatment, potentially leading to legal and financial implications.'
    },

    // 5. LEGAL AND STATUTORY COMPLIANCE
    {
        area: 'Legal and Statutory Compliance',
        title: 'Non-Deduction of EPF, ESICS on Employee',
        risk: 'High',
        actionPlan: 'Employee Provident Fund (EPF) and Employees\' State Insurance Corporation (ESIC) contributions have not been deducted as required. Non-compliance with statutory payroll deductions may lead to legal penalties, financial liabilities, and regulatory scrutiny.'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'TDS not deducted on payments',
        risk: 'High',
        actionPlan: 'It is observed that payments are made without deducting TDS. To Deduct TDS promptly and remit to authorities.'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'TDS paid but no record of due',
        risk: 'Medium',
        actionPlan: 'TDS payments are recorded in books. However, its contra entry for due is not in records.'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'Minor are employed and paid',
        risk: 'High',
        actionPlan: 'It is observed that salary is paid staff who are underaged and are working on school premises.'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'Sale of Book',
        risk: 'High',
        actionPlan: '1. Sale of books upon profit is not allowed. 2. Sale of Books attract GST which is not levied. Sale of books not reconciled (no record of Due).'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'GST on Rent',
        risk: 'High',
        actionPlan: 'Goods and Services Tax (GST) on rent has not been appropriately accounted for or remitted. Non-compliance with GST regulations may result in tax liabilities, penalties, and regulatory scrutiny.'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'Expenses made via petty cash (10,000)',
        risk: 'High',
        actionPlan: 'Expenses amounting to ₹10,000 have been incurred through petty cash transactions. The absence of proper documentation and control over petty cash expenditures may lead to financial discrepancies, lack of transparency, and potential misuse of funds.'
    },
    {
        area: 'Legal and Statutory Compliance',
        title: 'PT Deducted not paid',
        risk: 'High',
        actionPlan: 'Professional Tax (PT) has been deducted from employees\' salaries but has not been remitted to the appropriate authorities. This non-compliance may result in penalties, legal consequences, and reputational risks for the organization.'
    },

    // 6. Other Observations
    {
        area: 'Other Observations',
        title: 'Data Backup',
        risk: 'Low',
        actionPlan: 'As informed to us, data is backed upon external hard disk. It is suggested to have a automated daily backup on cloud to save extra effort and data loss.'
    },
    {
        area: 'Other Observations',
        title: 'Tally Data not password protected',
        risk: 'Medium',
        actionPlan: 'Data is not protected by passwords and hence may lead to breach or wrongful access of data.'
    }
];

async function seedTemplates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Template.deleteMany({});
        console.log('Cleared existing templates');

        await Template.insertMany(initialTemplates);
        console.log(`Seeded ${initialTemplates.length} templates`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding templates:', error);
        process.exit(1);
    }
}

seedTemplates();

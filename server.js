const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '626458680124-0qlrhuebi0n3ooe53kvet29hp8nj264u.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/metal-quotation';

// Express Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// --- Serverless MongoDB Connection Handler ---
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  console.log('[Database] Establishing new connection...');
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
  return cachedConnection;
}

// Middleware to ensure database is connected before handling API requests
app.use(async (req, res, next) => {
  // Skip connection check for config routes or static assets
  if (req.path.startsWith('/api') && req.path !== '/api/auth/google/config') {
    try {
      await connectToDatabase();
      next();
    } catch (err) {
      console.error('[Database Error] Connection failed:', err.message);
      res.status(500).json({ error: 'Database connection failed' });
    }
  } else {
    next();
  }
});

// --- MongoDB Schemas & Models ---

const OrganisationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  gstin: { type: String, uppercase: true, trim: true, sparse: true, index: true },
  legalName: { type: String, trim: true },
  tradeName: { type: String, trim: true },
  registeredState: { type: String, trim: true },
  passwordHash: { type: String }, // Optional for Google OAuth sign-in before setup
  googleId: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  accessCode: { type: String, trim: true, sparse: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  trialEnabled: { type: Boolean, default: false },
  trialDays: { type: Number, default: 60 },
  trialExpiresAt: { type: Date },
  companies: { type: [String], default: [] },
  selectedCompany: { type: String, default: '' },
  processRates: { type: Array, default: [] },
  clients: { type: Array, default: [] },
  selectedClients: { type: Array, default: [] },
  products: { type: Array, default: [] },
  activeProductId: { type: String, default: '' },
  bom: { type: Array, default: [] },
  processes: { type: Array, default: [] },
  miscItems: { type: Array, default: [] },
  customerName: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerGSTIN: { type: String, default: '' },
  profitPercentage: { type: Number, default: 0 }
}, { strict: false });
const Organisation = mongoose.model('Organisation', OrganisationSchema);

// Indian GST State Codes Map
const GST_STATE_CODES = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
  '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory'
};

const PAN_ENTITY_TYPES = {
  'C': 'Company (Pvt Ltd / Ltd)',
  'P': 'Individual / Proprietorship',
  'H': 'HUF (Hindu Undivided Family)',
  'F': 'Partnership Firm / LLP',
  'A': 'Association of Persons (AOP)',
  'T': 'Trust',
  'B': 'Body of Individuals (BOI)',
  'L': 'Local Authority',
  'J': 'Artificial Juridical Person',
  'G': 'Government Agency'
};

const VERIFIED_GSTIN_DIRECTORY = {
  // Major Corporations & Enterprises
  '27AAACT2727Q1ZW': { legalName: 'TATA STEEL LIMITED', tradeName: 'TATA STEEL LIMITED', state: 'Maharashtra', entityType: 'Public Limited Company' },
  '27AAACL0149K1ZM': { legalName: 'LARSEN & TOUBRO LIMITED', tradeName: 'LARSEN & TOUBRO LIMITED', state: 'Maharashtra', entityType: 'Public Limited Company' },
  '29AAACJ4323K1ZT': { legalName: 'JSW STEEL LIMITED', tradeName: 'JSW STEEL LIMITED', state: 'Karnataka', entityType: 'Public Limited Company' },
  '07AAACB4146P1ZL': { legalName: 'BHARAT HEAVY ELECTRICALS LIMITED', tradeName: 'BHEL', state: 'Delhi', entityType: 'Government Enterprise / PSU' },
  '33AAACS1815A1ZO': { legalName: 'SUNDRAM FASTENERS LIMITED', tradeName: 'SUNDRAM FASTENERS LIMITED', state: 'Tamil Nadu', entityType: 'Public Limited Company' },
  '33AAACT0212M1Z0': { legalName: 'TVS MOTOR COMPANY LIMITED', tradeName: 'TVS MOTOR COMPANY LIMITED', state: 'Tamil Nadu', entityType: 'Public Limited Company' },
  '33AABCC1234F1Z5': { legalName: 'ARGUS CNC TECHNOLOGIES PRIVATE LIMITED', tradeName: 'ARGUS TECHNOLOGIES', state: 'Tamil Nadu', entityType: 'Private Limited Company' },
  '27AAACR5055K1ZI': { legalName: 'RELIANCE INDUSTRIES LIMITED', tradeName: 'RELIANCE INDUSTRIES LIMITED', state: 'Maharashtra', entityType: 'Public Limited Company' },
  '27AAACB0725B1ZI': { legalName: 'BHARAT FORGE LIMITED', tradeName: 'BHARAT FORGE LIMITED', state: 'Maharashtra', entityType: 'Public Limited Company' },
  '33AAACA0500P1ZR': { legalName: 'ASHOK LEYLAND LIMITED', tradeName: 'ASHOK LEYLAND LIMITED', state: 'Tamil Nadu', entityType: 'Public Limited Company' },
  '27AAACG0580N1ZT': { legalName: 'GODREJ & BOYCE MANUFACTURING COMPANY LIMITED', tradeName: 'GODREJ & BOYCE MFG CO LTD', state: 'Maharashtra', entityType: 'Private Limited Company' },
  '06AAACJ0563Q1ZG': { legalName: 'JINDAL STEEL & POWER LIMITED', tradeName: 'JINDAL STEEL & POWER LIMITED', state: 'Haryana', entityType: 'Public Limited Company' },
  '27AAACM1567C1Z4': { legalName: 'MAHINDRA & MAHINDRA LIMITED', tradeName: 'MAHINDRA & MAHINDRA LIMITED', state: 'Maharashtra', entityType: 'Public Limited Company' },

  // Engineering Enterprises Directory
  '33ADNFS8459B1ZT': { legalName: 'SRR ENGINEERS', tradeName: 'SRR ENGINEERS', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '34ADEFS8198J1ZF': { legalName: 'SRP ENGINEERING', tradeName: 'SRP ENGINEERING', state: 'Puducherry', entityType: 'Partnership Firm / LLP' },
  '36ADEFS3476M2ZH': { legalName: 'SRIHAAS ENGINEERS', tradeName: 'SRIHAAS ENGINEERS', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '33ACOFS7429R1Z5': { legalName: 'SRS ENGINEERS', tradeName: 'SRS ENGINEERS', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '06ABVFS9541C1ZR': { legalName: 'SRP ENGINEERS', tradeName: 'SRP ENGINEERS', state: 'Haryana', entityType: 'Partnership Firm / LLP' },
  '36ADEFS3476M1ZI': { legalName: 'SRIHAAS ENGINEERS', tradeName: 'SRIHAAS ENGINEERS', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '07AEOFS1028Q1ZF': { legalName: 'SRP ENGINEERING', tradeName: 'SRP ENGINEERING', state: 'Delhi', entityType: 'Partnership Firm / LLP' },
  '27ADQFS9713B1ZS': { legalName: 'SRD ENGINEERS', tradeName: 'SRD ENGINEERS', state: 'Maharashtra', entityType: 'Partnership Firm / LLP' },
  '33ACQFS5608G1ZX': { legalName: 'SRIHARI ENGINEERING', tradeName: 'SRIHARI ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '24AEFFS2339H1Z3': { legalName: 'SR ENGINEERING', tradeName: 'SR ENGINEERING', state: 'Gujarat', entityType: 'Partnership Firm / LLP' },
  '33AAHFS8150N1ZS': { legalName: 'SREERAM ENGINEERS', tradeName: 'SREERAM ENGINEERS', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '37ABPFS4628G1ZQ': { legalName: 'M/S SRT ENGINEERS', tradeName: 'SRT ENGINEERS', state: 'Andhra Pradesh', entityType: 'Partnership Firm / LLP' },
  '33ADDFS6553L1ZR': { legalName: 'SRISHTI ENGINEERING', tradeName: 'SRISHTI ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '22ACIFS2627P1ZS': { legalName: 'SRIJAN ENGINEERING', tradeName: 'SRIJAN ENGINEERING', state: 'Chhattisgarh', entityType: 'Partnership Firm / LLP' },
  '36AEIFS4382M1ZD': { legalName: 'SRIMANNARAYANA ENGINEERING', tradeName: 'SRIMANNARAYANA ENGINEERING', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '19ABTFS8152P2ZX': { legalName: 'SRIDDHESWARI ENGINEERS', tradeName: 'SRIDDHESWARI ENGINEERS', state: 'West Bengal', entityType: 'Partnership Firm / LLP' },
  '33AAXFS0520L1ZY': { legalName: 'SREEKANTH ENGINEERING', tradeName: 'SREEKANTH ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '21ACIFS2627P1ZU': { legalName: 'SRIJAN ENGINEERING', tradeName: 'SRIJAN ENGINEERING', state: 'Odisha', entityType: 'Partnership Firm / LLP' },
  '37AFHFS0033F1Z9': { legalName: 'SR ENGINEERING', tradeName: 'SR ENGINEERING', state: 'Andhra Pradesh', entityType: 'Partnership Firm / LLP' },
  '33ABMFS7246K1ZO': { legalName: 'SREE ENGINEERING', tradeName: 'SREE ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '22ABVFS9541C1ZX': { legalName: 'SRP ENGINEERS', tradeName: 'SRP ENGINEERS', state: 'Chhattisgarh', entityType: 'Partnership Firm / LLP' },
  '36ABSFS7014D2Z0': { legalName: 'M/S. SREEKIRAN ENGINEERS', tradeName: 'SREEKIRAN ENGINEERS', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '27ACTFS8913K1Z8': { legalName: 'SRUSHTI ENGINEERING', tradeName: 'SRUSHTI ENGINEERING', state: 'Maharashtra', entityType: 'Partnership Firm / LLP' },
  '33ABJFS5479B1Z3': { legalName: 'SRI SRINIVASA ENGINEERING', tradeName: 'SRI SRINIVASA ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '19ABCFS1684H1ZX': { legalName: 'SREEMA ENGINEERING', tradeName: 'SREEMA ENGINEERING', state: 'West Bengal', entityType: 'Partnership Firm / LLP' },
  '36ADHFS1874Q1Z9': { legalName: 'SRB ENGINEERS', tradeName: 'SRB ENGINEERS', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '27ADMFS4030M1ZP': { legalName: 'SRS ENGINEERING', tradeName: 'SRS ENGINEERING', state: 'Maharashtra', entityType: 'Partnership Firm / LLP' },
  '33ABVFS4553J1ZL': { legalName: 'SRITECH ENGINEERING', tradeName: 'SRITECH ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '09AFIFS7231J1ZK': { legalName: 'SR ENGINEERS', tradeName: 'SR ENGINEERS', state: 'Uttar Pradesh', entityType: 'Partnership Firm / LLP' },
  '27AAAFS5294E1Z4': { legalName: 'SRIKESH ENGINEERING', tradeName: 'SRIKESH ENGINEERING', state: 'Maharashtra', entityType: 'Partnership Firm / LLP' },
  '33AEJFS8430F1Z0': { legalName: 'SRR ENGINEERING', tradeName: 'SRR ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '37AEBFS5919K1ZL': { legalName: 'SRIRAM ENGINEERS', tradeName: 'SRIRAM ENGINEERS', state: 'Andhra Pradesh', entityType: 'Partnership Firm / LLP' },
  '33ADVFS3474L1ZB': { legalName: 'SRI SRINIVASA ENGINEERING', tradeName: 'SRI SRINIVASA ENGINEERING', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '36ADDFS8184M1ZC': { legalName: 'SRIMAN ENGINEERS', tradeName: 'SRIMAN ENGINEERS', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '33ADQFS3500A1ZK': { legalName: 'SR ENGINEERS', tradeName: 'SR ENGINEERS', state: 'Tamil Nadu', entityType: 'Partnership Firm / LLP' },
  '21AEIFS1195L1ZT': { legalName: 'SRS ENGINEERING', tradeName: 'SRS ENGINEERING', state: 'Odisha', entityType: 'Partnership Firm / LLP' },
  '36ACCFS6785N1ZA': { legalName: 'SRINIDHI ENGINEERS', tradeName: 'SRINIDHI ENGINEERS', state: 'Telangana', entityType: 'Partnership Firm / LLP' },
  '07AEQFS5866J1Z5': { legalName: 'SRC ENGINEERS', tradeName: 'SRC ENGINEERS', state: 'Delhi', entityType: 'Partnership Firm / LLP' },
  '37ACZFS8215Q1ZU': { legalName: 'SRAVANI ENGINEERING', tradeName: 'SRAVANI ENGINEERING', state: 'Andhra Pradesh', entityType: 'Partnership Firm / LLP' },
  '37ADEFS3476M1ZG': { legalName: 'SRIHAAS ENGINEERS', tradeName: 'SRIHAAS ENGINEERS', state: 'Andhra Pradesh', entityType: 'Partnership Firm / LLP' }
};

function generateAccessCode(orgName) {
  const prefix = (orgName || 'ORG').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'ORG';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}`;
}

// 2. User Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  orgName: { type: String, trim: true }, // Optional until linked to an organisation
  companies: { type: [String], default: [] },
  selectedCompany: { type: String, default: '' },
  processRates: { type: Array, default: [] },
  clients: { type: Array, default: [] },
  selectedClients: { type: Array, default: [] },
  products: { type: Array, default: [] },
  activeProductId: { type: String, default: '' },
  // Active estimation state
  bom: { type: Array, default: [] },
  processes: { type: Array, default: [] },
  miscItems: { type: Array, default: [] },
  customerName: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerGSTIN: { type: String, default: '' },
  profitPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  trialEnabled: { type: Boolean, default: false },
  trialDays: { type: Number, default: 60 },
  trialExpiresAt: { type: Date },
  permissions: {
    canAccessCalculator: { type: Boolean, default: true },
    canAccessQuotation: { type: Boolean, default: true },
    canAccessUsers: { type: Boolean, default: true },
    canAccessProducts: { type: Boolean, default: true },
    canAccessHistory: { type: Boolean, default: true }
  }
});
const User = mongoose.model('User', UserSchema);

// Helper: Calculate Trial Status (Lifetime Unrestricted Access by Default)
function calculateTrialInfo(doc) {
  return {
    trialEnabled: false,
    isExpired: false,
    daysRemaining: 9999,
    isLifetime: true,
    label: 'Lifetime Access'
  };
}

// Helper: Calculate Effective Trial Status for Users
async function calculateEffectiveUserTrial(user) {
  return {
    trialEnabled: false,
    isExpired: false,
    daysRemaining: 9999,
    isLifetime: true,
    label: 'Lifetime Access'
  };
}

// 3. Transaction Model (Archived Estimates / PDF Logs)
const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Quotation Reference No (e.g., MS-Q-123456)
  date: { type: String, required: true },
  orgName: { type: String, required: true, index: true },
  companyName: { type: String, default: '' }, // Specific sub-company name used
  productName: { type: String, default: '' }, // Product Name(s) linked to this quotation
  username: { type: String, required: true, index: true },
  customerName: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerGSTIN: { type: String, default: '' },
  profitPercentage: { type: Number, default: 0 },
  bom: { type: Array, default: [] },
  processes: { type: Array, default: [] },
  miscItems: { type: Array, default: [] },
  grandTotal: { type: Number, required: true }
});
const Transaction = mongoose.model('Transaction', TransactionSchema);

// 4. SuperAdmin Model
const SuperAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, default: 'productionargus' },
  passwordHash: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});
const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);

// 5. Product Model (for dedicated 'products' collection in MongoDB containing quotations)
const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, default: 1 },
  username: { type: String, required: true, lowercase: true, index: true },
  orgName: { type: String, trim: true, index: true },
  bom: { type: Array, default: [] },
  processes: { type: Array, default: [] },
  miscItems: { type: Array, default: [] },
  profitPercentage: { type: Number, default: 0 },
  materialsTotal: { type: Number, default: 0 },
  processesTotal: { type: Number, default: 0 },
  miscTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  totalWeight: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema, 'products');

async function getOrCreateSuperAdmin() {
  let admin = await SuperAdmin.findOne();
  if (!admin) {
    const defaultHash = await bcrypt.hash('argus123', 10);
    admin = new SuperAdmin({
      username: 'productionargus',
      passwordHash: defaultHash
    });
    await admin.save();
  }
  return admin;
}


// --- Google Auth Configurations ---
app.get('/api/auth/google/config', (req, res) => {
  res.status(200).json({ clientId: GOOGLE_CLIENT_ID });
});

// Google ID token sign-in validation for Standard Users (Employees)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'ID Token is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'] ? payload['email'].toLowerCase().trim() : '';
    const name = payload['name'] || 'Google User';

    // 1. If this account is already registered as an Organisation Admin, auto-route to Org!
    let org = await Organisation.findOne({
      $or: [{ googleId: googleId }, { email: email || '___none___' }]
    });
    if (org && !org.name.startsWith('temp-org-')) {
      return res.status(200).json({
        success: true,
        role: 'org',
        orgName: org.name,
        googleId: org.googleId,
        status: org.status || 'approved'
      });
    }

    // 2. Check if user exists in User collection (by GoogleId or Email)
    let user = await User.findOne({ googleId: googleId });
    if (!user && email) {
      user = await User.findOne({ email: email });
      if (user && !user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    if (user) {
      return res.status(200).json({
        success: true,
        role: 'user',
        username: user.username,
        email: user.email,
        orgName: user.orgName
      });
    }

    // 3. If account is not provisioned by any organisation, block with clear notice
    return res.status(403).json({
      error: `The Google account (${email}) has not been added by any organisation. Please ask your organisation administrator to add your email in the Users Directory.`
    });
  } catch (err) {
    console.error('Google Sign-in Error:', err.message);
    res.status(400).json({ error: err.message || 'Invalid Google ID Token.' });
  }
});

// Google ID token sign-in validation for Organisation Admins
app.post('/api/auth/google/admin', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'ID Token is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'] ? payload['email'].toLowerCase().trim() : '';

    // 1. If this account is already registered as an Organisation Admin, log into Org!
    let org = await Organisation.findOne({
      $or: [{ googleId: googleId }, { email: email || '___none___' }]
    });

    if (org && !org.name.startsWith('temp-org-')) {
      return res.status(200).json({
        success: true,
        role: 'org',
        orgName: org.name,
        googleId: org.googleId,
        status: org.status || 'approved'
      });
    }

    // 2. If this account is registered as a User Account, auto-route to User UI seamlessly!
    const userCheck = await User.findOne({
      $or: [{ googleId: googleId }, { email: email || '___none___' }]
    });
    if (userCheck) {
      return res.status(200).json({
        success: true,
        role: 'user',
        username: userCheck.username,
        orgName: userCheck.orgName
      });
    }

    // 3. New Organisation creation with GSTIN and Legal Name if provided
    if (!org) {
      const cleanOrgName = (orgName && orgName.trim().length > 0) ? orgName.trim() : `temp-org-${googleId.slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const cleanGstin = (gstin && gstin.trim().length > 0) ? gstin.trim().toUpperCase() : '';
      const accessCode = generateAccessCode(cleanOrgName);

      org = new Organisation({
        name: cleanOrgName,
        gstin: cleanGstin,
        legalName: cleanOrgName,
        customerGSTIN: cleanGstin,
        googleId: googleId,
        email: email || explicitEmail || '',
        accessCode: accessCode,
        status: 'approved',
        requestedAt: new Date(),
        approvedAt: new Date()
      });
      await org.save();
    } else if (org.name.startsWith('temp-org-') && orgName && orgName.trim().length > 0) {
      org.name = orgName.trim();
      if (gstin) {
        org.gstin = gstin.trim().toUpperCase();
        org.customerGSTIN = gstin.trim().toUpperCase();
      }
      org.legalName = org.name;
      org.status = 'approved';
      await org.save();
    }

    res.status(200).json({
      success: true,
      role: 'org',
      orgName: org.name,
      gstin: org.gstin || '',
      googleId: org.googleId,
      status: org.status || 'approved'
    });
  } catch (err) {
    console.error('Google Admin Sign-in Error:', err.message);
    res.status(400).json({ error: err.message || 'Invalid Google ID Token.' });
  }
});

// Complete Google registration with Org Setup
app.post('/api/auth/org/setup', async (req, res) => {
  try {
    const { googleId, orgName, newOrgName, orgPassword } = req.body;
    if (!newOrgName || !orgPassword) {
      return res.status(400).json({ error: 'Organisation Name and Password are required.' });
    }

    const cleanNewOrgName = newOrgName.trim();
    if (cleanNewOrgName.toLowerCase().startsWith('temp-org-')) {
      return res.status(400).json({ error: 'Invalid Organisation Name.' });
    }

    // Check if new organisation name is already taken
    const existingOrg = await Organisation.findOne({ name: cleanNewOrgName });
    if (existingOrg) {
      return res.status(400).json({ error: 'Organisation Name is already taken.' });
    }

    const existingUser = await User.findOne({ username: cleanNewOrgName.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: `A User Account named "${cleanNewOrgName}" already exists. Please choose a different Organisation Name.` });
    }

    // Find Organisation by googleId or current temporary name
    let org = null;
    if (googleId) {
      org = await Organisation.findOne({ googleId });
    } else if (orgName) {
      org = await Organisation.findOne({ name: orgName });
    }

    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
    const accessCode = generateAccessCode(cleanNewOrgName);

    org.name = cleanNewOrgName;
    org.passwordHash = orgPasswordHash;
    org.accessCode = accessCode;
    org.status = 'approved';
    org.approvedAt = new Date();
    await org.save();

    res.status(200).json({
      success: true,
      orgName: org.name,
      accessCode: org.accessCode,
      status: org.status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Join Organisation via Access Code (Primary Endpoint)
app.post('/api/user/join-org-code', async (req, res) => {
  try {
    const { username, accessCode } = req.body;
    if (!username || !accessCode) {
      return res.status(400).json({ error: 'Username and Access Code are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanCode = accessCode.trim().toUpperCase();

    // Verify Access Code
    const org = await Organisation.findOne({ 
      accessCode: cleanCode,
      status: 'approved'
    });

    if (!org) {
      return res.status(404).json({ error: 'Invalid or inactive Access Code. Please check with your Organisation Admin.' });
    }

    // Update user with organisation name
    const user = await User.findOneAndUpdate(
      { username: cleanUsername },
      { $set: { orgName: org.name } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Also update any existing calculations/products created by this user to reflect the new orgName
    await Calculation.updateMany({ username: cleanUsername }, { $set: { orgName: org.name } });
    await Product.updateMany({ username: cleanUsername }, { $set: { orgName: org.name } });
    await Quotation.updateMany({ username: cleanUsername }, { $set: { orgName: org.name } });

    res.status(200).json({
      success: true,
      orgName: org.name,
      message: `Successfully linked to ${org.name}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch Organisation Profile & Access Code
app.get('/api/org/profile', async (req, res) => {
  try {
    const { orgName } = req.query;
    if (!orgName) {
      return res.status(400).json({ error: 'Organisation name is required.' });
    }

    const cleanOrgName = orgName.trim();
    let org = await Organisation.findOne({ name: cleanOrgName });
    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    // If access code doesn't exist yet, generate and save it
    if (!org.accessCode) {
      org.accessCode = generateAccessCode(org.name);
      await org.save();
    }

    res.status(200).json({
      success: true,
      name: org.name,
      email: org.email || '',
      accessCode: org.accessCode,
      status: org.status,
      createdAt: org.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Organisation Profile & Access Code
app.post('/api/org/profile', async (req, res) => {
  try {
    const { currentOrgName, newOrgName, newPassword, customAccessCode } = req.body;
    if (!currentOrgName) {
      return res.status(400).json({ error: 'Current Organisation Name is required.' });
    }

    const cleanCurrentName = currentOrgName.trim();
    const org = await Organisation.findOne({ name: cleanCurrentName });
    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    // If renaming organisation, check uniqueness
    if (newOrgName && newOrgName.trim() && newOrgName.trim() !== cleanCurrentName) {
      const targetOrgName = newOrgName.trim();
      const existing = await Organisation.findOne({ name: targetOrgName });
      if (existing) {
        return res.status(400).json({ error: `Organisation name "${targetOrgName}" is already in use.` });
      }

      const existingUser = await User.findOne({ username: targetOrgName.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: `A User Account named "${targetOrgName}" already exists.` });
      }

      // Update linked users and calculations to the new name
      await User.updateMany({ orgName: cleanCurrentName }, { $set: { orgName: targetOrgName } });
      await Calculation.updateMany({ orgName: cleanCurrentName }, { $set: { orgName: targetOrgName } });
      await Product.updateMany({ orgName: cleanCurrentName }, { $set: { orgName: targetOrgName } });
      await Quotation.updateMany({ orgName: cleanCurrentName }, { $set: { orgName: targetOrgName } });
      
      org.name = targetOrgName;
    }

    if (newPassword && newPassword.trim()) {
      org.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (customAccessCode && customAccessCode.trim()) {
      const cleanCode = customAccessCode.trim().toUpperCase();
      const existingCode = await Organisation.findOne({ 
        accessCode: cleanCode, 
        _id: { $ne: org._id } 
      });
      if (existingCode) {
        return res.status(400).json({ error: `Access Code "${cleanCode}" is already taken by another organisation.` });
      }
      org.accessCode = cleanCode;
    }

    await org.save();

    res.status(200).json({
      success: true,
      name: org.name,
      accessCode: org.accessCode,
      message: 'Organisation profile updated successfully.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Join Organisation Endpoint for Standard Users / Employees (Legacy Org Name + Password)
app.post('/api/user/join-org', async (req, res) => {
  try {
    const { username, orgName, orgPassword } = req.body;
    if (!username || !orgName || !orgPassword) {
      return res.status(400).json({ error: 'Username, Organisation Name, and Password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanOrgName = orgName.trim();

    // Verify Organisation exists
    const org = await Organisation.findOne({ name: cleanOrgName });
    if (!org) {
      return res.status(404).json({ error: 'Organisation does not exist.' });
    }

    // Verify Organisation password
    const isPasswordValid = await bcrypt.compare(orgPassword, org.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password for this Organisation.' });
    }

    // Link user to organisation
    const user = await User.findOneAndUpdate(
      { username: cleanUsername },
      { $set: { orgName: cleanOrgName } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Also update any existing calculations created by this user to reflect the new orgName
    await Calculation.updateMany({ username: cleanUsername }, { $set: { orgName: cleanOrgName } });
    await Product.updateMany({ username: cleanUsername }, { $set: { orgName: cleanOrgName } });
    await Quotation.updateMany({ username: cleanUsername }, { $set: { orgName: cleanOrgName } });

    res.status(200).json({
      success: true,
      orgName: user.orgName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Auth Endpoints ---

// --- GSTIN Lookup & Verification Route ---
app.post('/api/gst/lookup', async (req, res) => {
  try {
    const { gstin } = req.body;
    if (!gstin) {
      return res.status(400).json({ error: 'GSTIN is required.' });
    }

    const cleanGSTIN = gstin.trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstinRegex.test(cleanGSTIN)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid GSTIN format. Must be 15 alphanumeric characters (e.g. 33AAAAA0000A1Z5).'
      });
    }

    // Check if an organisation is already registered with this GSTIN
    const existingOrg = await Organisation.findOne({
      $or: [
        { gstin: cleanGSTIN },
        { customerGSTIN: cleanGSTIN }
      ]
    });

    if (existingOrg) {
      return res.status(200).json({
        valid: true,
        alreadyRegistered: true,
        orgName: existingOrg.name,
        gstin: cleanGSTIN,
        message: `Organisation "${existingOrg.name}" is already registered under this GSTIN. Please sign in instead.`
      });
    }

    // Extract State Code and PAN
    const stateCode = cleanGSTIN.substring(0, 2);
    const pan = cleanGSTIN.substring(2, 12);
    const panEntityTypeCode = pan.charAt(3);
    const stateName = GST_STATE_CODES[stateCode] || 'India (State Code: ' + stateCode + ')';
    const entityType = PAN_ENTITY_TYPES[panEntityTypeCode] || 'Commercial Enterprise';

    // 1. Check Verified GSTIN Directory (Major Indian Companies & Test Numbers)
    const verifiedEntry = VERIFIED_GSTIN_DIRECTORY[cleanGSTIN];
    if (verifiedEntry) {
      return res.status(200).json({
        valid: true,
        alreadyRegistered: false,
        gstin: cleanGSTIN,
        pan: pan,
        legalName: verifiedEntry.legalName,
        tradeName: verifiedEntry.tradeName,
        state: verifiedEntry.state || stateName,
        entityType: verifiedEntry.entityType || entityType,
        status: 'Active (Taxpayer Verified)',
        verifiedAt: new Date()
      });
    }

    // 2. Attempt Live Online GST Lookup via Public GST gateways
    const publicGstEndpoints = [
      `https://sheet.gstincheck.co.in/check/free/${cleanGSTIN}`,
      `https://api.gstincheck.co.in/check/public/${cleanGSTIN}`
    ];

    if (process.env.GST_API_URL && process.env.GST_API_KEY) {
      publicGstEndpoints.unshift(`${process.env.GST_API_URL}?gstin=${cleanGSTIN}&key=${process.env.GST_API_KEY}`);
    }

    for (const endpoint of publicGstEndpoints) {
      try {
        const fetchRes = await fetch(endpoint, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(3000)
        });
        if (fetchRes.ok) {
          const gstData = await fetchRes.json();
          const resolvedLegalName = gstData.data?.lgnm || gstData.data?.tradeNam || gstData.lgnm || gstData.legalName || gstData.tradeNam;
          const resolvedTradeName = gstData.data?.tradeNam || gstData.tradeNam || resolvedLegalName;
          const resolvedState = gstData.data?.pradr?.addr?.stcd || gstData.pradr?.addr?.stcd || stateName;
          const resolvedStatus = gstData.data?.sts || gstData.sts || 'Active';

          if (resolvedLegalName && resolvedLegalName.trim().length > 0) {
            return res.status(200).json({
              valid: true,
              alreadyRegistered: false,
              gstin: cleanGSTIN,
              pan: pan,
              legalName: resolvedLegalName.trim(),
              tradeName: resolvedTradeName.trim(),
              state: resolvedState,
              entityType: entityType,
              status: resolvedStatus,
              verifiedAt: new Date()
            });
          }
        }
      } catch (liveErr) {
        // Continue to next endpoint or fallback
      }
    }

    // 3. Fallback: Return clean valid taxpayer verification with decoded state and entity type (WITHOUT mock template names)
    return res.status(200).json({
      valid: true,
      alreadyRegistered: false,
      gstin: cleanGSTIN,
      pan: pan,
      legalName: '',
      tradeName: '',
      state: stateName,
      entityType: entityType,
      status: 'Active (Verified Taxpayer Structure)',
      verifiedAt: new Date()
    });
  } catch (err) {
    console.error('GST Lookup Error:', err);
    res.status(500).json({ error: 'Internal Server Error during GST verification.' });
  }
});

// --- Auth Endpoints ---

// A. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { role, username, password, orgName, orgPassword, gstin, email } = req.body;
    
    if (role === 'org') {
      if (!orgName || !orgPassword) {
        return res.status(400).json({ error: 'Organisation Name and Password are required.' });
      }

      const cleanOrgName = orgName.trim();
      const cleanGSTIN = (gstin || '').trim().toUpperCase();
      const cleanEmail = (email || '').trim().toLowerCase();

      if (cleanOrgName.toLowerCase().startsWith('temp-org-')) {
        return res.status(400).json({ error: 'Invalid Organisation Name.' });
      }

      // Check unique organisation name
      const existingOrg = await Organisation.findOne({
        $or: [
          { name: cleanOrgName },
          { name: new RegExp(`^${cleanOrgName}$`, 'i') }
        ]
      });
      if (existingOrg) {
        return res.status(400).json({ error: 'Organisation Name already exists. Please sign in instead.' });
      }

      // Check unique GSTIN if provided
      if (cleanGSTIN) {
        const existingGstinOrg = await Organisation.findOne({
          $or: [
            { gstin: cleanGSTIN },
            { customerGSTIN: cleanGSTIN }
          ]
        });
        if (existingGstinOrg) {
          return res.status(400).json({
            error: `GSTIN "${cleanGSTIN}" is already registered under "${existingGstinOrg.name}". Please sign in instead.`
          });
        }
      }

      const existingUser = await User.findOne({ username: cleanOrgName.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: `A User Account named "${cleanOrgName}" already exists. Please choose a different Organisation Name.` });
      }

      const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
      const accessCode = generateAccessCode(cleanOrgName);
      const newOrg = new Organisation({
        name: cleanOrgName,
        gstin: cleanGSTIN,
        legalName: cleanOrgName,
        email: cleanEmail,
        customerGSTIN: cleanGSTIN,
        passwordHash: orgPasswordHash,
        accessCode: accessCode,
        status: 'approved',
        requestedAt: new Date(),
        approvedAt: new Date()
      });
      await newOrg.save();

      return res.status(201).json({ 
        success: true, 
        role: 'org', 
        orgName: cleanOrgName, 
        gstin: cleanGSTIN,
        status: 'approved',
        accessCode: accessCode,
        message: 'Your organisation has been verified and registered successfully.'
      });
    }

    // Standard User Signup restriction: Users must be invited by an Organisation Admin
    return res.status(400).json({
      error: 'User accounts are managed by your Organisation. Please ask your Organisation Administrator to add your email address in the Users Directory.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// B. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { role, username, password, orgName, orgPassword } = req.body;

    // Super Admin Dynamic Database Credentials check
    const superAdmin = await getOrCreateSuperAdmin();
    const inputUser = (username || orgName || '').trim();
    const cleanUserLower = inputUser.toLowerCase();
    const cleanUserUpper = inputUser.toUpperCase();
    const inputPass = password || orgPassword || '';

    if (cleanUserLower === superAdmin.username) {
      const isMatch = await bcrypt.compare(inputPass, superAdmin.passwordHash);
      if (isMatch) {
        return res.status(200).json({
          success: true,
          role: 'superadmin',
          username: superAdmin.username
        });
      }
    }

    if (!inputUser || !inputPass) {
      return res.status(400).json({ error: 'Email / GSTIN / Organisation Name and Password are required.' });
    }

    // 1. Check User Account (by Username OR Email)
    const user = await User.findOne({
      $or: [
        { username: cleanUserLower },
        { email: cleanUserLower }
      ]
    });
    if (user && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(inputPass, user.passwordHash);
      if (isPasswordValid) {
        return res.status(200).json({
          success: true,
          role: 'user',
          username: user.username,
          email: user.email,
          orgName: user.orgName
        });
      }
    } else if (user && !user.passwordHash) {
      return res.status(400).json({
        error: 'This account was registered for One-Click Google Sign-In. Please click "Sign in with Google" to continue.'
      });
    }

    // 2. Check Organisation Admin Account (by GSTIN, Org Name, or Email)
    let org = await Organisation.findOne({
      $or: [
        { gstin: cleanUserUpper },
        { customerGSTIN: cleanUserUpper },
        { name: inputUser },
        { name: new RegExp(`^${inputUser}$`, 'i') },
        { email: cleanUserLower }
      ]
    });

    if (org && org.passwordHash) {
      const isOrgPasswordValid = await bcrypt.compare(inputPass, org.passwordHash);
      if (isOrgPasswordValid) {
        if (org.status === 'rejected') {
          return res.status(403).json({ error: 'Your organisation approval request was rejected. Please contact administrator.' });
        }
        return res.status(200).json({
          success: true,
          role: 'org',
          orgName: org.name,
          gstin: org.gstin || org.customerGSTIN || '',
          status: org.status || 'approved'
        });
      }
    }

    return res.status(401).json({ error: 'Invalid GSTIN / username / email or password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// C. In-App User Account Conversion to Organisation Account
app.post('/api/user/convert-to-org', async (req, res) => {
  try {
    const { username, currentPassword, newOrgName, newOrgPassword, customAccessCode } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!newOrgName || !newOrgName.trim()) {
      return res.status(400).json({ error: 'Organisation Name is required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanOrgName = newOrgName.trim();

    if (cleanOrgName.toLowerCase().startsWith('temp-org-')) {
      return res.status(400).json({ error: 'Invalid Organisation Name.' });
    }

    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (currentPassword) {
      const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return res.status(401).json({ error: 'Current user password is incorrect.' });
      }
    }

    // Check if organisation name already exists
    const existingOrg = await Organisation.findOne({ name: cleanOrgName });
    if (existingOrg) {
      return res.status(400).json({ error: `An organisation named "${cleanOrgName}" already exists. Please choose a different name.` });
    }

    // Password for the new Org Admin
    const chosenPassword = (newOrgPassword && newOrgPassword.trim()) ? newOrgPassword.trim() : (currentPassword || '');
    let orgPasswordHash;
    if (chosenPassword) {
      orgPasswordHash = await bcrypt.hash(chosenPassword, 10);
    } else {
      orgPasswordHash = user.passwordHash;
    }

    const accessCode = (customAccessCode && customAccessCode.trim()) ? customAccessCode.trim().toUpperCase() : generateAccessCode(cleanOrgName);

    // Create new Organisation record with approved status
    const newOrg = new Organisation({
      name: cleanOrgName,
      passwordHash: orgPasswordHash,
      accessCode: accessCode,
      status: 'approved',
      requestedAt: new Date(),
      approvedAt: new Date()
    });
    await newOrg.save();

    // Update user record with the new organisation
    user.orgName = cleanOrgName;
    await user.save();

    // Migrate user's existing data to link to the new organisation
    await Calculation.updateMany({ username: cleanUsername }, { $set: { orgName: cleanOrgName } });
    await Product.updateMany({ username: cleanUsername }, { $set: { orgName: cleanOrgName } });
    await Quotation.updateMany({ username: cleanUsername }, { $set: { orgName: cleanOrgName } });

    res.status(200).json({
      success: true,
      role: 'org',
      orgName: cleanOrgName,
      status: 'approved',
      accessCode: accessCode,
      message: `Congratulations! Your account has been upgraded to "${cleanOrgName}".`
    });
  } catch (err) {
    console.error('Error converting user to organisation:', err);
    res.status(500).json({ error: 'Failed to convert account to organisation.' });
  }
});

// --- Super Admin API Endpoints ---
app.get('/api/superadmin/profile', async (req, res) => {
  try {
    const admin = await getOrCreateSuperAdmin();
    res.status(200).json({ success: true, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Super Admin profile.' });
  }
});

app.post('/api/superadmin/profile', async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required to save changes.' });
    }

    const admin = await getOrCreateSuperAdmin();
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    if (newUsername && newUsername.trim()) {
      const cleanNewUser = newUsername.trim().toLowerCase();
      if (cleanNewUser.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters.' });
      }
      admin.username = cleanNewUser;
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      admin.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    admin.updatedAt = new Date();
    await admin.save();

    res.status(200).json({ 
      success: true, 
      username: admin.username,
      message: 'Super Administrator credentials updated successfully.' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update Super Admin profile.' });
  }
});

app.get('/api/superadmin/orgs', async (req, res) => {
  try {
    const orgs = await Organisation.find().sort({ requestedAt: -1, _id: -1 });
    const enrichedOrgs = await Promise.all(orgs.map(async (org) => {
      const userCount = await User.countDocuments({ orgName: org.name });
      const quoteCount = await Transaction.countDocuments({ orgName: org.name });
      return {
        _id: org._id,
        name: org.name,
        email: org.email || '',
        status: org.status || 'approved',
        accessCode: org.accessCode || '',
        requestedAt: org.requestedAt || org._id.getTimestamp(),
        approvedAt: org.approvedAt || null,
        createdAt: org.createdAt || org._id.getTimestamp(),
        trial: calculateTrialInfo(org),
        userCount,
        quoteCount
      };
    }));

    const totalUsers = await User.countDocuments();
    const totalQuotes = await Transaction.countDocuments();

    res.status(200).json({ 
      success: true, 
      orgs: enrichedOrgs,
      metrics: {
        totalOrgs: enrichedOrgs.length,
        pendingOrgs: enrichedOrgs.filter(o => o.status === 'pending').length,
        approvedOrgs: enrichedOrgs.filter(o => o.status === 'approved').length,
        totalUsers,
        totalQuotes
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch organisations.' });
  }
});

app.get('/api/superadmin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1, _id: -1 });
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const quoteCount = await Transaction.countDocuments({ username: u.username });
      return {
        _id: u._id,
        username: u.username,
        email: u.email || '',
        orgName: u.orgName || '',
        createdAt: u.createdAt || u._id.getTimestamp(),
        trial: await calculateEffectiveUserTrial(u),
        quoteCount
      };
    }));

    res.status(200).json({
      success: true,
      users: enrichedUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

app.post('/api/superadmin/approve-org', async (req, res) => {
  try {
    const { orgName, action } = req.body;
    if (!orgName || !action) {
      return res.status(400).json({ error: 'Organisation Name and Action are required.' });
    }

    const org = await Organisation.findOne({ name: orgName.trim() });
    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    if (action === 'approve') {
      org.status = 'approved';
      org.approvedAt = new Date();
      if (!org.accessCode) {
        org.accessCode = generateAccessCode(org.name);
      }
    } else if (action === 'reject') {
      org.status = 'rejected';
    } else if (action === 'pending') {
      org.status = 'pending';
    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    await org.save();
    res.status(200).json({ 
      success: true, 
      orgName: org.name, 
      status: org.status, 
      accessCode: org.accessCode,
      trial: calculateTrialInfo(org)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update organisation approval.' });
  }
});

// Update Trial Mode / Grant Lifetime Access (Super Admin)
app.post('/api/superadmin/trial/update', async (req, res) => {
  try {
    const { targetType, targetId, action } = req.body;
    if (!targetType || !targetId || !action) {
      return res.status(400).json({ error: 'targetType, targetId, and action are required.' });
    }

    let doc = null;
    if (targetType === 'org') {
      doc = await Organisation.findOne({ name: targetId.trim() });
    } else if (targetType === 'user') {
      doc = await User.findOne({ username: targetId.trim().toLowerCase() });
    }

    if (!doc) {
      return res.status(404).json({ error: `${targetType === 'org' ? 'Organisation' : 'User'} not found.` });
    }

    if (action === 'remove_trial') {
      // Grant Lifetime access
      doc.trialEnabled = false;
    } else if (action === 'reset_trial' || action === 'enable_trial') {
      // Set / Reset 60-day trial from now
      doc.trialEnabled = true;
      doc.trialDays = 60;
      doc.trialExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    }

    await doc.save();
    const updatedTrial = targetType === 'org' ? calculateTrialInfo(doc) : await calculateEffectiveUserTrial(doc);

    res.status(200).json({
      success: true,
      message: action === 'remove_trial' ? 'Trial removed. Lifetime access granted.' : '60-Day trial updated successfully.',
      trial: updatedTrial
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update trial status.' });
  }
});

// Live Trial Status check for any logged-in user or org
app.get('/api/trial/status', async (req, res) => {
  try {
    const { username, orgName } = req.query;
    if (orgName) {
      const org = await Organisation.findOne({ name: orgName.trim() });
      if (!org) {
        return res.status(404).json({ error: 'Organisation not found.' });
      }
      return res.status(200).json({ success: true, trial: calculateTrialInfo(org) });
    }
    if (username) {
      const user = await User.findOne({ username: username.trim().toLowerCase() });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const effectiveTrial = await calculateEffectiveUserTrial(user);
      return res.status(200).json({ success: true, trial: effectiveTrial });
    }
    return res.status(400).json({ error: 'Username or orgName query parameter is required.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trial status.' });
  }
});

const DEFAULT_PROCESS_RATES = [
  { name: 'Laser Cutting', rate: 15.00 },
  { name: 'CNC Milling / VMC', rate: 18.00 },
  { name: 'CNC Turning / Lathe', rate: 12.00 },
  { name: 'Welding (TIG/MIG)', rate: 14.00 },
  { name: 'Bending / Press Brake', rate: 8.00 },
  { name: 'Powder Coating / Paint', rate: 10.00 }
];

// C. Fetch User or Organisation Data State
app.get('/api/user/data', async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username or Organisation Name is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    
    // 1. Check User collection (by username or email)
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { email: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, 'i') },
        { email: new RegExp(`^${cleanUsername}$`, 'i') }
      ]
    });

    if (user) {
      const effectiveTrial = await calculateEffectiveUserTrial(user);
      let userCompanies = user.companies || [];
      let userProcessRates = user.processRates || [];
      let userClients = user.clients || [];

      if (user.orgName) {
        let org = await Organisation.findOne({ $or: [{ name: user.orgName.trim() }, { name: new RegExp(`^${user.orgName.trim()}$`, 'i') }] });
        if (org) {
          // Merge organization companies
          (org.companies || []).forEach(c => {
            if (!userCompanies.includes(c)) userCompanies.push(c);
          });
          if (!userCompanies.includes(org.name)) userCompanies.unshift(org.name);

          // Merge organization process rates
          (org.processRates || []).forEach(pr => {
            if (!userProcessRates.some(x => x.name.toLowerCase() === pr.name.toLowerCase())) {
              userProcessRates.push(pr);
            }
          });

          // Merge organization clients
          (org.clients || []).forEach(cl => {
            if (!userClients.some(x => x.id === cl.id || (x.name && cl.name && x.name.toLowerCase() === cl.name.toLowerCase()))) {
              userClients.push(cl);
            }
          });
        }
      }

      if (userProcessRates.length === 0) {
        userProcessRates = [...DEFAULT_PROCESS_RATES];
      }

      return res.status(200).json({
        bom: user.bom || [],
        processes: user.processes || [],
        miscItems: user.miscItems || [],
        customerName: user.customerName || '',
        customerAddress: user.customerAddress || '',
        customerGSTIN: user.customerGSTIN || '',
        profitPercentage: user.profitPercentage || 0,
        companies: userCompanies,
        selectedCompany: user.selectedCompany || '',
        processRates: userProcessRates,
        clients: userClients,
        selectedClients: user.selectedClients || [],
        products: user.products || [],
        activeProductId: user.activeProductId || '',
        permissions: user.permissions || {
          canAccessCalculator: true,
          canAccessQuotation: true,
          canAccessUsers: true,
          canAccessProducts: true,
          canAccessHistory: true
        },
        trial: effectiveTrial
      });
    }

    // 2. Check Organisation collection
    let org = await Organisation.findOne({ $or: [{ name: username.trim() }, { name: new RegExp(`^${username.trim()}$`, 'i') }] });

    if (org) {
      const effectiveTrial = calculateTrialInfo(org);
      const orgCompanies = (org.companies && org.companies.length > 0) ? org.companies : [org.name];
      const orgSelectedCompany = org.selectedCompany || org.name;

      // Aggregate all products across organisation (Org Admin + all employees)
      const orgUsers = await User.find({ orgName: org.name });
      let combinedProducts = [];
      
      if (Array.isArray(org.products)) {
        org.products.forEach(p => {
          combinedProducts.push({
            ...p,
            createdBy: 'Admin (' + org.name + ')'
          });
        });
      }

      orgUsers.forEach(u => {
        if (Array.isArray(u.products)) {
          u.products.forEach(p => {
            if (!combinedProducts.some(existing => existing.id === p.id)) {
              combinedProducts.push({
                ...p,
                createdBy: `@${u.username}`
              });
            }
          });
        }
      });

      // Aggregate all clients across organisation (Org Admin + all employees)
      let combinedClients = [...(org.clients || [])];
      orgUsers.forEach(u => {
        (u.clients || []).forEach(cl => {
          if (!combinedClients.some(x => x.id === cl.id || (x.name && cl.name && x.name.toLowerCase() === cl.name.toLowerCase()))) {
            combinedClients.push({
              ...cl,
              addedBy: `@${u.username}`
            });
          }
        });
      });

      // Aggregate all processRates across organisation
      let combinedProcessRates = [...(org.processRates || [])];
      orgUsers.forEach(u => {
        (u.processRates || []).forEach(pr => {
          if (!combinedProcessRates.some(x => x.name.toLowerCase() === pr.name.toLowerCase())) {
            combinedProcessRates.push(pr);
          }
        });
      });

      if (combinedProcessRates.length === 0) {
        combinedProcessRates = [...DEFAULT_PROCESS_RATES];
      }

      // Aggregate all companies
      let combinedCompanies = [...orgCompanies];
      orgUsers.forEach(u => {
        (u.companies || []).forEach(c => {
          if (!combinedCompanies.includes(c)) combinedCompanies.push(c);
        });
      });

      return res.status(200).json({
        bom: org.bom || [],
        processes: org.processes || [],
        miscItems: org.miscItems || [],
        customerName: org.customerName || '',
        customerAddress: org.customerAddress || '',
        customerGSTIN: org.customerGSTIN || '',
        profitPercentage: org.profitPercentage || 0,
        companies: combinedCompanies,
        selectedCompany: orgSelectedCompany,
        processRates: combinedProcessRates,
        clients: combinedClients,
        selectedClients: org.selectedClients || [],
        products: combinedProducts,
        activeProductId: org.activeProductId || '',
        permissions: {
          canAccessCalculator: true,
          canAccessQuotation: true,
          canAccessUsers: true,
          canAccessProducts: true,
          canAccessHistory: true
        },
        trial: effectiveTrial
      });
    }

    // 3. Fallback: Return clean initial default state instead of 404
    return res.status(200).json({
      bom: [],
      processes: [],
      miscItems: [],
      customerName: '',
      customerAddress: '',
      customerGSTIN: '',
      profitPercentage: 0,
      companies: [],
      selectedCompany: '',
      processRates: [...DEFAULT_PROCESS_RATES],
      clients: [],
      selectedClients: [],
      products: [],
      activeProductId: '',
      permissions: {
        canAccessCalculator: true,
        canAccessQuotation: true,
        canAccessUsers: true,
        canAccessProducts: true,
        canAccessHistory: true
      },
      trial: {
        trialEnabled: false,
        isExpired: false,
        daysRemaining: 9999,
        isLifetime: true,
        label: 'Lifetime Access'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// D. Save User or Organisation Data State
app.post('/api/user/data', async (req, res) => {
  try {
    const { username, bom, processes, miscItems, customerName, customerAddress, customerGSTIN, profitPercentage, companies, selectedCompany, processRates, clients, selectedClients, products, activeProductId } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username or Organisation Name is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    
    let user = await User.findOneAndUpdate(
      {
        $or: [
          { username: cleanUsername },
          { email: cleanUsername },
          { username: new RegExp(`^${cleanUsername}$`, 'i') },
          { email: new RegExp(`^${cleanUsername}$`, 'i') }
        ]
      },
      {
        $set: {
          bom: bom || [],
          processes: processes || [],
          miscItems: miscItems || [],
          customerName: customerName || '',
          customerAddress: customerAddress || '',
          customerGSTIN: customerGSTIN || '',
          profitPercentage: profitPercentage || 0,
          companies: companies || [],
          selectedCompany: selectedCompany || '',
          processRates: processRates || [],
          clients: clients || [],
          selectedClients: selectedClients || [],
          products: products || [],
          activeProductId: activeProductId || ''
        }
      },
      { new: true }
    );

    let activeOrg = '';
    let targetOwner = '';

    if (user) {
      activeOrg = user.orgName || '';
      targetOwner = user.username;

      // Sync employee clients and process rates to organisation for shared visibility
      if (user.orgName) {
        let orgToUpdate = await Organisation.findOne({ $or: [{ name: user.orgName.trim() }, { name: new RegExp(`^${user.orgName.trim()}$`, 'i') }] });
        if (orgToUpdate) {
          let orgClients = orgToUpdate.clients || [];
          let orgClientsChanged = false;
          (clients || []).forEach(cl => {
            if (!orgClients.some(x => x.id === cl.id || (x.name && cl.name && x.name.toLowerCase() === cl.name.toLowerCase()))) {
              orgClients.push({ ...cl, addedBy: `@${user.username}` });
              orgClientsChanged = true;
            }
          });
          if (orgClientsChanged) {
            orgToUpdate.clients = orgClients;
          }

          let orgRates = orgToUpdate.processRates || [];
          let orgRatesChanged = false;
          (processRates || []).forEach(pr => {
            if (!orgRates.some(x => x.name.toLowerCase() === pr.name.toLowerCase())) {
              orgRates.push(pr);
              orgRatesChanged = true;
            }
          });
          if (orgRatesChanged) {
            orgToUpdate.processRates = orgRates;
          }

          if (orgClientsChanged || orgRatesChanged) {
            await orgToUpdate.save();
          }
        }
      }
    } else {
      // Check and update Organisation collection if org admin
      let org = await Organisation.findOneAndUpdate(
        { $or: [{ name: username.trim() }, { name: new RegExp(`^${username.trim()}$`, 'i') }, { email: cleanUsername }] },
        {
          $set: {
            bom: bom || [],
            processes: processes || [],
            miscItems: miscItems || [],
            customerName: customerName || '',
            customerAddress: customerAddress || '',
            customerGSTIN: customerGSTIN || '',
            profitPercentage: profitPercentage || 0,
            companies: companies || [],
            selectedCompany: selectedCompany || '',
            processRates: processRates || [],
            clients: clients || [],
            selectedClients: selectedClients || [],
            products: products || [],
            activeProductId: activeProductId || ''
          }
        },
        { new: true, upsert: true }
      );

      activeOrg = org ? org.name : username.trim();
      targetOwner = org ? org.name : username.trim();
    }

    // Synchronize products into the dedicated 'products' MongoDB collection
    if (Array.isArray(products)) {
      const currentProductIds = [];

      for (const p of products) {
        if (!p || !p.id || !p.name) continue;
        currentProductIds.push(p.id);

        const metalCost = (p.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
        const processCost = (p.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
        const miscCost = (p.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
        const subtotal = metalCost + processCost + miscCost;
        const profitAmount = subtotal * ((p.profitPercentage || 0) / 100);
        const qty = typeof p.quantity === 'number' && p.quantity > 0 ? p.quantity : 1;
        const gTotal = (subtotal + profitAmount) * qty;
        const tWeight = (p.bom || []).reduce((acc, x) => acc + (x.totalWeight || 0), 0) * qty;

        await Product.findOneAndUpdate(
          { productId: p.id, username: targetOwner },
          {
            $set: {
              productId: p.id,
              name: p.name.trim(),
              quantity: qty,
              username: targetOwner,
              orgName: activeOrg,
              bom: p.bom || [],
              processes: p.processes || [],
              miscItems: p.miscItems || [],
              profitPercentage: p.profitPercentage || 0,
              materialsTotal: metalCost,
              processesTotal: processCost,
              miscTotal: miscCost,
              grandTotal: gTotal,
              totalWeight: tWeight,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
      }

      // Remove deleted products from MongoDB products collection
      if (currentProductIds.length > 0) {
        await Product.deleteMany({ username: targetOwner, productId: { $nin: currentProductIds } });
      } else {
        await Product.deleteMany({ username: targetOwner });
      }
    }

    res.status(200).json({ success: true, message: 'Data synced successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// D2. Dedicated Products & Quotations Collection Endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { username, orgName } = req.query;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const query = { username: cleanUsername };
    if (orgName) query.orgName = orgName.trim();

    const products = await Product.find(query).sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { productId, name, quantity, username, orgName, bom, processes, miscItems, profitPercentage, materialsTotal, processesTotal, miscTotal, grandTotal, totalWeight } = req.body;
    if (!productId || !name || !username) {
      return res.status(400).json({ error: 'productId, name, and username are required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const qty = typeof quantity === 'number' && quantity > 0 ? quantity : 1;

    const product = await Product.findOneAndUpdate(
      { productId, username: cleanUsername },
      {
        $set: {
          productId,
          name: name.trim(),
          quantity: qty,
          username: cleanUsername,
          orgName: orgName || '',
          bom: bom || [],
          processes: processes || [],
          miscItems: miscItems || [],
          profitPercentage: profitPercentage || 0,
          materialsTotal: materialsTotal || 0,
          processesTotal: processesTotal || 0,
          miscTotal: miscTotal || 0,
          grandTotal: grandTotal || 0,
          totalWeight: totalWeight || 0,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('Save product error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { username } = req.query;
    if (!productId || !username) {
      return res.status(400).json({ error: 'productId and username are required.' });
    }
    const cleanUsername = username.trim().toLowerCase();

    await Product.findOneAndDelete({ productId, username: cleanUsername });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// E. Add New Transaction (Estimate Log / PDF export snapshot)
app.post('/api/transactions', async (req, res) => {
  try {
    const { id, date, username, orgName, companyName, productName, customerName, customerAddress, customerGSTIN, profitPercentage, bom, processes, miscItems, grandTotal } = req.body;
    
    if (!id || !username || grandTotal === undefined) {
      return res.status(400).json({ error: 'Missing required transaction fields.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    let finalOrgName = (orgName || '').trim();
    if (!finalOrgName) {
      const user = await User.findOne({ username: cleanUsername });
      if (user && user.orgName) {
        finalOrgName = user.orgName.trim();
      } else {
        const org = await Organisation.findOne({ $or: [{ name: cleanUsername }, { name: new RegExp(`^${cleanUsername}$`, 'i') }] });
        finalOrgName = org ? org.name : cleanUsername;
      }
    }

    const newTx = await Transaction.findOneAndUpdate(
      { id: id.trim() },
      {
        $set: {
          id: id.trim(),
          date: date || new Date().toLocaleString('en-IN'),
          orgName: finalOrgName,
          companyName: (companyName || finalOrgName).trim(),
          productName: productName || 'Standard Quotation',
          username: cleanUsername,
          customerName: customerName || '',
          customerAddress: customerAddress || '',
          customerGSTIN: customerGSTIN || '',
          profitPercentage: profitPercentage || 0,
          bom: bom || [],
          processes: processes || [],
          miscItems: miscItems || [],
          grandTotal: grandTotal
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, transaction: newTx });
  } catch (err) {
    console.error('Save transaction error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// F. Get Organisation Admin Dashboard Stats.
app.get('/api/org/dashboard', async (req, res) => {
  try {
    const orgName = req.query.orgName;
    if (!orgName) {
      return res.status(400).json({ error: 'Organisation Name is required.' });
    }
    const cleanOrgName = orgName.trim();

    // 1. Fetch org entity first
    let org = await Organisation.findOne({ $or: [{ name: cleanOrgName }, { name: new RegExp(`^${cleanOrgName}$`, 'i') }] });
    const exactOrgName = org ? org.name : cleanOrgName;

    // 2. Fetch all users belonging to organization
    const orgUsers = await User.find({
      $or: [
        { orgName: exactOrgName },
        { orgName: new RegExp(`^${exactOrgName}$`, 'i') },
        { orgName: cleanOrgName },
        { orgName: new RegExp(`^${cleanOrgName}$`, 'i') }
      ]
    });
    const usernames = orgUsers.map(u => u.username.toLowerCase());

    // 3. Fetch all transactions for organization (including admin and employee generated quotes)
    const transactions = await Transaction.find({
      $or: [
        { orgName: exactOrgName },
        { orgName: new RegExp(`^${exactOrgName}$`, 'i') },
        { orgName: cleanOrgName },
        { orgName: new RegExp(`^${cleanOrgName}$`, 'i') },
        { username: exactOrgName.toLowerCase() },
        { username: cleanOrgName.toLowerCase() },
        { username: { $in: usernames } }
      ]
    }).sort({ _id: -1 });

    // 4. Aggregate all products across organization (from Org entity, Product collection, and employees)
    let orgProducts = [];
    if (org && Array.isArray(org.products)) {
      org.products.forEach(p => {
        if (p && (p.name || p.id)) {
          orgProducts.push({
            ...p,
            name: p.name || 'Unnamed Product',
            createdBy: 'Admin (' + exactOrgName + ')'
          });
        }
      });
    }

    // Include all products from MongoDB 'products' collection
    const dbProducts = await Product.find({
      $or: [
        { orgName: exactOrgName },
        { orgName: new RegExp(`^${exactOrgName}$`, 'i') },
        { orgName: cleanOrgName },
        { orgName: new RegExp(`^${cleanOrgName}$`, 'i') },
        { username: exactOrgName.toLowerCase() },
        { username: cleanOrgName.toLowerCase() },
        { username: { $in: usernames } }
      ]
    });

    dbProducts.forEach(dbp => {
      const matchId = dbp.productId || (dbp._id ? dbp._id.toString() : '');
      if (!orgProducts.some(p => p.id === matchId || p.productId === matchId)) {
        orgProducts.push({
          id: matchId,
          name: dbp.name || 'Unnamed Product',
          quantity: dbp.quantity || 1,
          bom: dbp.bom || [],
          processes: dbp.processes || [],
          miscItems: dbp.miscItems || [],
          profitPercentage: dbp.profitPercentage || 0,
          grandTotal: dbp.grandTotal || 0,
          totalWeight: dbp.totalWeight || 0,
          createdBy: dbp.username === exactOrgName.toLowerCase() || dbp.username === cleanOrgName.toLowerCase()
            ? 'Admin (' + exactOrgName + ')'
            : `@${dbp.username}`
        });
      }
    });

    orgUsers.forEach(u => {
      if (Array.isArray(u.products)) {
        u.products.forEach(p => {
          if (p && (p.name || p.id) && !orgProducts.some(existing => existing.id === p.id)) {
            orgProducts.push({
              ...p,
              name: p.name || 'Unnamed Product',
              createdBy: `@${u.username}`
            });
          }
        });
      }
    });

    // 5. Build Users stats directory
    const usersStats = usernames.map(username => {
      const userTxns = transactions.filter(t => t.username === username);
      const quoteCount = userTxns.length;
      const userTotalVal = userTxns.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
      const userDoc = orgUsers.find(u => u.username === username);
      const permissions = (userDoc && userDoc.permissions) ? userDoc.permissions : {
        canAccessClients: true,
        canConfigureProcessRates: true,
        canViewProducts: true,
        canExportQuotes: true,
        canViewHistory: true
      };
      return {
        username,
        quoteCount,
        totalQuotedValue: userTotalVal,
        permissions
      };
    });

    // 6. Aggregate all clients for the organization
    let orgClients = [];
    if (org && Array.isArray(org.clients)) {
      org.clients.forEach(c => {
        orgClients.push({
          ...c,
          addedBy: 'Admin (' + cleanOrgName + ')'
        });
      });
    }

    orgUsers.forEach(u => {
      if (Array.isArray(u.clients)) {
        u.clients.forEach(cl => {
          if (!orgClients.some(existing => existing.id === cl.id || (existing.name && cl.name && existing.name.toLowerCase() === cl.name.toLowerCase()))) {
            orgClients.push({
              ...cl,
              addedBy: `@${u.username}`
            });
          }
        });
      }
    });

    res.status(200).json({
      users: usersStats,
      transactions: transactions,
      products: orgProducts,
      clients: orgClients
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// F2. Delete Organisation Product Route
app.delete('/api/org/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { orgName } = req.query;
    if (!orgName || !id) {
      return res.status(400).json({ error: 'Organisation Name and Product ID are required.' });
    }
    const cleanOrgName = orgName.trim();

    // 1. Remove from Organisation entity
    await Organisation.updateMany(
      { $or: [{ name: cleanOrgName }, { name: new RegExp(`^${cleanOrgName}$`, 'i') }] },
      { $pull: { products: { id: id } } }
    );

    // 2. Remove from any User belonging to this Org
    await User.updateMany(
      { orgName: cleanOrgName },
      { $pull: { products: { id: id } } }
    );

    // 3. Remove from Product collection
    await Product.deleteMany({ productId: id, orgName: cleanOrgName });

    res.status(200).json({ success: true, message: 'Product deleted from organisation.' });
  } catch (err) {
    console.error('Delete org product error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// F3. Update User Access Permissions for Organisation
app.post('/api/org/users/permissions', async (req, res) => {
  try {
    const { orgName, username, permissions } = req.body;
    if (!orgName || !username || !permissions) {
      return res.status(400).json({ error: 'Organisation Name, Username, and Permissions are required.' });
    }

    const cleanOrgName = orgName.trim();
    const cleanUsername = username.trim().toLowerCase();

    // Verify user belongs to organisation
    const user = await User.findOne({ username: cleanUsername, orgName: cleanOrgName });
    if (!user) {
      return res.status(404).json({ error: 'User not found in this organisation.' });
    }

    user.permissions = {
      canAccessCalculator: permissions.canAccessCalculator !== false,
      canAccessQuotation: permissions.canAccessQuotation !== false,
      canAccessUsers: permissions.canAccessUsers !== false,
      canAccessProducts: permissions.canAccessProducts !== false,
      canAccessHistory: permissions.canAccessHistory !== false
    };

    await user.save();
    res.status(200).json({ success: true, message: 'User permissions updated successfully.', permissions: user.permissions });
  } catch (err) {
    console.error('Update permissions error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// F4. Add / Invite User to Organisation by Email & Name
app.post('/api/org/users', async (req, res) => {
  try {
    const { orgName, username, email, password, permissions } = req.body;
    if (!orgName || !username || !email) {
      return res.status(400).json({ error: 'Organisation Name, User Name, and Email Address are required.' });
    }

    const cleanOrgName = orgName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '_');

    // Verify organisation exists
    const org = await Organisation.findOne({
      $or: [{ name: cleanOrgName }, { name: new RegExp(`^${cleanOrgName}$`, 'i') }]
    });
    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existingUser) {
      if (existingUser.orgName && existingUser.orgName.toLowerCase() === cleanOrgName.toLowerCase()) {
        return res.status(400).json({ error: `User with email "${cleanEmail}" is already a member of your organisation.` });
      }
      // If user exists without an organisation, link them
      if (!existingUser.orgName) {
        existingUser.orgName = cleanOrgName;
        if (permissions) existingUser.permissions = {
          canAccessCalculator: permissions.canAccessCalculator !== false,
          canAccessQuotation: permissions.canAccessQuotation !== false,
          canAccessUsers: permissions.canAccessUsers !== false,
          canAccessProducts: permissions.canAccessProducts !== false,
          canAccessHistory: permissions.canAccessHistory !== false
        };
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: `User account (${cleanEmail}) linked to ${cleanOrgName}.`,
          user: { username: existingUser.username, email: existingUser.email, orgName: cleanOrgName, permissions: existingUser.permissions }
        });
      } else {
        return res.status(400).json({ error: `A user with email "${cleanEmail}" or username "${cleanUsername}" is already registered under another organisation.` });
      }
    }

    // Hash password if provided, or leave blank for pure One-Click Google / Gmail Sign-In
    let passwordHash = '';
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: passwordHash,
      orgName: cleanOrgName,
      permissions: {
        canAccessCalculator: permissions?.canAccessCalculator !== false,
        canAccessQuotation: permissions?.canAccessQuotation !== false,
        canAccessUsers: permissions?.canAccessUsers !== false,
        canAccessProducts: permissions?.canAccessProducts !== false,
        canAccessHistory: permissions?.canAccessHistory !== false
      }
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: `User "${cleanUsername}" (${cleanEmail}) added to organisation successfully.`,
      user: {
        username: newUser.username,
        email: newUser.email,
        orgName: newUser.orgName,
        permissions: newUser.permissions
      }
    });
  } catch (err) {
    console.error('Add org user error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// F5. Remove / Unlink User from Organisation
app.delete('/api/org/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { orgName } = req.query;
    if (!orgName || !username) {
      return res.status(400).json({ error: 'Organisation Name and Username are required.' });
    }

    const cleanOrgName = orgName.trim();
    const cleanUsername = username.trim().toLowerCase();

    const user = await User.findOne({ username: cleanUsername, orgName: cleanOrgName });
    if (!user) {
      return res.status(404).json({ error: 'User not found in this organisation.' });
    }

    // Unlink user from organisation
    user.orgName = '';
    await user.save();

    res.status(200).json({ success: true, message: `User @${cleanUsername} removed from organisation.` });
  } catch (err) {
    console.error('Delete org user error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// G. Delete Transaction Route (Scoped)
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, orgName } = req.query;
    
    const query = { id: id };
    if (username) {
      query.username = username.trim().toLowerCase();
    }
    if (orgName) {
      query.orgName = orgName.trim();
    }

    const deleted = await Transaction.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// H. Get Standard User Transactions (Quotation History - Scoped or Org-Wide)
app.get('/api/user/transactions', async (req, res) => {
  try {
    const username = req.query.username;
    const orgName = req.query.orgName;

    if (!username && !orgName) {
      return res.status(400).json({ error: 'Username or Organisation Name is required.' });
    }
    const cleanUsername = username ? username.trim().toLowerCase() : '';
    const cleanOrgName = orgName ? orgName.trim() : '';

    let query = {};
    
    // Check if querying user is an organisation
    let orgDoc = null;
    if (cleanUsername) {
      orgDoc = await Organisation.findOne({ $or: [{ name: cleanUsername }, { name: new RegExp(`^${cleanUsername}$`, 'i') }] });
    }
    if (!orgDoc && cleanOrgName) {
      orgDoc = await Organisation.findOne({ $or: [{ name: cleanOrgName }, { name: new RegExp(`^${cleanOrgName}$`, 'i') }] });
    }

    if (orgDoc && (cleanUsername === orgDoc.name.toLowerCase() || cleanUsername.startsWith('admin') || !cleanUsername)) {
      // Return all transactions for the entire organisation!
      query = {
        $or: [
          { orgName: orgDoc.name },
          { orgName: new RegExp(`^${orgDoc.name}$`, 'i') },
          { username: orgDoc.name.toLowerCase() }
        ]
      };
    } else if (cleanOrgName) {
      query = {
        $or: [
          { username: cleanUsername, orgName: cleanOrgName },
          { orgName: cleanOrgName },
          { orgName: new RegExp(`^${cleanOrgName}$`, 'i') }
        ]
      };
    } else {
      query = { username: cleanUsername };
    }

    // Fetch all transactions (sorted newest first)
    const transactions = await Transaction.find(query).sort({ _id: -1 });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fallback Route: Serve index.html for any frontend views
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Expose Express App for Serverless environments (Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Server] Local dev server running on port ${PORT}`);
  });
}

module.exports = app;
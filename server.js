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
app.use(express.static(path.join(__dirname, 'public')));

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

// 1. Organisation Model
const OrganisationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String }, // Optional for Google OAuth sign-in before setup
  googleId: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  accessCode: { type: String, trim: true, sparse: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  trialEnabled: { type: Boolean, default: true },
  trialDays: { type: Number, default: 60 },
  trialExpiresAt: { type: Date }
});
const Organisation = mongoose.model('Organisation', OrganisationSchema);

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
  trialEnabled: { type: Boolean, default: true },
  trialDays: { type: Number, default: 60 },
  trialExpiresAt: { type: Date }
});
const User = mongoose.model('User', UserSchema);

// Helper: Calculate 60-Day Trial Status for a single document (User or Organisation)
function calculateTrialInfo(doc) {
  if (!doc) return { trialEnabled: true, isExpired: true, daysRemaining: 0, isLifetime: false };
  if (doc.trialEnabled === false) {
    return { trialEnabled: false, isExpired: false, daysRemaining: 9999, isLifetime: true, label: 'Lifetime Access' };
  }
  const created = doc.createdAt ? new Date(doc.createdAt) : (doc._id ? new Date(doc._id.getTimestamp()) : new Date());
  let expiresAt = doc.trialExpiresAt ? new Date(doc.trialExpiresAt) : null;
  if (!expiresAt) {
    const trialDays = doc.trialDays || 60;
    expiresAt = new Date(created.getTime() + trialDays * 24 * 60 * 60 * 1000);
  }
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  const isExpired = diffMs <= 0;
  return {
    trialEnabled: true,
    isExpired,
    daysRemaining,
    expiresAt: expiresAt.toISOString(),
    isLifetime: false
  };
}

// Helper: Calculate Effective Trial Status for Users (Inheriting Org Lifetime/Trial if linked)
async function calculateEffectiveUserTrial(user) {
  if (!user) return { trialEnabled: true, isExpired: true, daysRemaining: 0, isLifetime: false };
  
  // 1. Direct Lifetime Access granted to User
  if (user.trialEnabled === false) {
    return { trialEnabled: false, isExpired: false, daysRemaining: 9999, isLifetime: true, label: 'Lifetime Access' };
  }

  // 2. If User is linked to an Organisation, inherit Organisation's status
  if (user.orgName && user.orgName.trim()) {
    const org = await Organisation.findOne({ name: user.orgName.trim() });
    if (org) {
      // If Organisation has Lifetime Access, user inherits it completely
      if (org.trialEnabled === false) {
        return {
          trialEnabled: false,
          isExpired: false,
          daysRemaining: 9999,
          isLifetime: true,
          inheritedFromOrg: true,
          orgName: org.name,
          label: 'Corporate Lifetime Access'
        };
      }
      // If Org has specific active trial or expiration
      const orgTrial = calculateTrialInfo(org);
      return {
        ...orgTrial,
        inheritedFromOrg: true,
        orgName: org.name
      };
    }
  }

  // 3. Fallback to Standalone User's individual trial
  return calculateTrialInfo(user);
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
    const email = payload['email'];
    const name = payload['name'] || 'Google User';

    // Check if user already exists
    let user = await User.findOne({ googleId: googleId });
    if (!user) {
      // Create new standard user, initially with no organization linked
      const suggestedUsername = name.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
      user = new User({
        username: suggestedUsername,
        googleId,
        email: email.toLowerCase().trim(),
        orgName: ''
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      username: user.username,
      orgName: user.orgName
    });
  } catch (err) {
    console.error('Google Sign-in Error:', err.message);
    res.status(400).json({ error: 'Invalid Google ID Token.' });
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
    const email = payload['email'];

    // Check if Organisation already exists for this admin
    let org = await Organisation.findOne({ googleId: googleId });
    if (!org) {
      // Create new Organisation with a temporary placeholder name
      const tempName = `temp-org-${googleId.slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      org = new Organisation({
        name: tempName,
        googleId: googleId,
        email: email.toLowerCase().trim()
      });
      await org.save();
    }

    res.status(200).json({
      success: true,
      orgName: org.name,
      googleId: org.googleId,
      status: org.status || (org.name.startsWith('temp-org-') ? 'setup' : 'pending')
    });
  } catch (err) {
    console.error('Google Admin Sign-in Error:', err.message);
    res.status(400).json({ error: 'Invalid Google ID Token.' });
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

    const oldOrgName = org.name;
    const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
    org.name = cleanNewOrgName;
    org.passwordHash = orgPasswordHash;
    org.status = 'pending';
    org.requestedAt = new Date();
    if (!org.accessCode) {
      org.accessCode = generateAccessCode(cleanNewOrgName);
    }
    await org.save();

    // Cascade update orgName in User and Transaction documents
    if (oldOrgName !== cleanNewOrgName) {
      await User.updateMany({ orgName: oldOrgName }, { orgName: cleanNewOrgName });
      await Transaction.updateMany({ orgName: oldOrgName }, { orgName: cleanNewOrgName });
    }

    res.status(200).json({ success: true, orgName: cleanNewOrgName, accessCode: org.accessCode, status: 'pending' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Join Organisation via Access Code (Primary Endpoint)
app.post('/api/user/join-by-code', async (req, res) => {
  try {
    const { username, accessCode } = req.body;
    if (!username || !accessCode) {
      return res.status(400).json({ error: 'Username and Access Code are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanCode = accessCode.trim();

    const org = await Organisation.findOne({ 
      accessCode: { $regex: new RegExp(`^${cleanCode}$`, 'i') } 
    });

    if (!org) {
      return res.status(404).json({ error: 'Invalid Access Code. Please check with your organisation administrator.' });
    }

    if (org.status && org.status !== 'approved') {
      return res.status(400).json({ error: 'This organisation is currently pending approval by the administrator.' });
    }

    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.orgName = org.name;
    await user.save();

    res.status(200).json({ success: true, username: user.username, orgName: user.orgName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch Organisation Profile & Access Code
app.get('/api/org/profile', async (req, res) => {
  try {
    const orgName = req.query.orgName;
    if (!orgName) {
      return res.status(400).json({ error: 'Organisation name is required.' });
    }
    const cleanOrgName = orgName.trim();
    let org = await Organisation.findOne({ name: cleanOrgName });
    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    if (!org.accessCode) {
      org.accessCode = generateAccessCode(org.name);
      await org.save();
    }

    res.status(200).json({
      success: true,
      orgName: org.name,
      accessCode: org.accessCode,
      email: org.email || '',
      status: org.status || 'pending',
      trial: calculateTrialInfo(org)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Organisation Profile & Access Code
app.post('/api/org/profile', async (req, res) => {
  try {
    const { currentOrgName, newOrgName, accessCode, newPassword } = req.body;
    if (!currentOrgName) {
      return res.status(400).json({ error: 'Current organisation name is required.' });
    }

    const cleanCurrentName = currentOrgName.trim();
    const org = await Organisation.findOne({ name: cleanCurrentName });
    if (!org) {
      return res.status(404).json({ error: 'Organisation not found.' });
    }

    const targetOrgName = newOrgName ? newOrgName.trim() : cleanCurrentName;
    if (targetOrgName !== cleanCurrentName) {
      const existing = await Organisation.findOne({ name: targetOrgName });
      if (existing) {
        return res.status(400).json({ error: 'New organisation name is already taken.' });
      }
    }

    // Check access code uniqueness if updated
    if (accessCode) {
      const cleanCode = accessCode.trim().toUpperCase();
      const existingCode = await Organisation.findOne({ 
        accessCode: { $regex: new RegExp(`^${cleanCode}$`, 'i') },
        _id: { $ne: org._id }
      });
      if (existingCode) {
        return res.status(400).json({ error: 'This access code is already in use by another organisation.' });
      }
      org.accessCode = cleanCode;
    }

    if (newPassword) {
      org.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const oldName = org.name;
    org.name = targetOrgName;
    await org.save();

    // Cascade rename in Users and Transactions if name changed
    if (oldName !== targetOrgName) {
      await User.updateMany({ orgName: oldName }, { orgName: targetOrgName });
      await Transaction.updateMany({ orgName: oldName }, { orgName: targetOrgName });
    }

    res.status(200).json({
      success: true,
      orgName: org.name,
      accessCode: org.accessCode
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
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanOrgName = orgName.trim();

    // Verify Organisation exists
    const org = await Organisation.findOne({ name: cleanOrgName });
    if (!org) {
      return res.status(404).json({ error: 'Organisation does not exist.' });
    }

    // Verify Organisation password
    const isOrgPasswordValid = await bcrypt.compare(orgPassword, org.passwordHash);
    if (!isOrgPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password for this Organisation.' });
    }

    // Update User
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.orgName = cleanOrgName;
    await user.save();

    res.status(200).json({ success: true, username: user.username, orgName: user.orgName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// A. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { role, username, password, orgName, orgPassword } = req.body;
    
    if (role === 'org') {
      if (!orgName || !orgPassword) {
        return res.status(400).json({ error: 'Organisation Name and Password are required.' });
      }

      const cleanOrgName = orgName.trim();
      if (cleanOrgName.toLowerCase().startsWith('temp-org-')) {
        return res.status(400).json({ error: 'Invalid Organisation Name.' });
      }

      const existingOrg = await Organisation.findOne({ name: cleanOrgName });
      if (existingOrg) {
        return res.status(400).json({ error: 'Organisation Name already exists. Please sign in instead.' });
      }

      const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
      const accessCode = generateAccessCode(cleanOrgName);
      const newOrg = new Organisation({
        name: cleanOrgName,
        passwordHash: orgPasswordHash,
        accessCode: accessCode,
        status: 'pending',
        requestedAt: new Date()
      });
      await newOrg.save();

      return res.status(201).json({ 
        success: true, 
        role: 'org', 
        orgName: cleanOrgName, 
        status: 'pending',
        accessCode: accessCode,
        message: 'Your organisation approval request has been submitted to the Super Administrator.'
      });
    }

    // Standard User Signup
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and Password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Hash user password and create User
    const userPasswordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: cleanUsername,
      passwordHash: userPasswordHash,
      orgName: ''
    });
    await newUser.save();

    res.status(201).json({ success: true, role: 'user', username: cleanUsername, orgName: '' });
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
    const inputUser = (username || orgName || '').trim().toLowerCase();
    const inputPass = password || orgPassword || '';
    if (inputUser === superAdmin.username) {
      const isMatch = await bcrypt.compare(inputPass, superAdmin.passwordHash);
      if (isMatch) {
        return res.status(200).json({
          success: true,
          role: 'superadmin',
          username: superAdmin.username
        });
      }
    }

    if (role === 'user') {
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and Password are required.' });
      }
      const cleanUsername = username.trim().toLowerCase();
      const user = await User.findOne({ username: cleanUsername });
      if (!user) {
        // Check if an Organisation exists with this name and inform them
        const orgCheck = await Organisation.findOne({ name: username.trim() });
        if (orgCheck) {
          return res.status(403).json({
            error: 'This account is registered as an Organisation Admin account. Please select "Organisation Admin" to sign in.'
          });
        }
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      res.status(200).json({
        success: true,
        role: 'user',
        username: user.username,
        orgName: user.orgName
      });
    } else {
      // Organisation Role Login
      if (!orgName || !orgPassword) {
        return res.status(400).json({ error: 'Organisation Name and Password are required.' });
      }
      const cleanOrgName = orgName.trim();
      const org = await Organisation.findOne({ name: cleanOrgName });
      if (!org) {
        // Check if a normal user account exists with this name
        const userCheck = await User.findOne({ username: cleanOrgName.toLowerCase() });
        if (userCheck) {
          return res.status(403).json({
            error: 'This account is registered as a User Account. Please sign in under "User Account", or upgrade your account to an Organisation in your workspace settings.'
          });
        }
        return res.status(401).json({ error: 'Invalid organisation name or password.' });
      }

      const isOrgPasswordValid = await bcrypt.compare(orgPassword, org.passwordHash);
      if (!isOrgPasswordValid) {
        return res.status(401).json({ error: 'Invalid organisation name or password.' });
      }

      if (org.status === 'rejected') {
        return res.status(403).json({ error: 'Your organisation approval request was rejected. Please contact administrator.' });
      }

      res.status(200).json({
        success: true,
        role: 'org',
        orgName: org.name,
        status: org.status || 'approved'
      });
    }
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

// C. Fetch User Data State
app.get('/api/user/data', async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: cleanUsername });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const effectiveTrial = await calculateEffectiveUserTrial(user);

    res.status(200).json({
      bom: user.bom || [],
      processes: user.processes || [],
      miscItems: user.miscItems || [],
      customerName: user.customerName || '',
      customerAddress: user.customerAddress || '',
      customerGSTIN: user.customerGSTIN || '',
      profitPercentage: user.profitPercentage || 0,
      companies: user.companies || [],
      selectedCompany: user.selectedCompany || '',
      processRates: user.processRates || [],
      clients: user.clients || [],
      selectedClients: user.selectedClients || [],
      products: user.products || [],
      activeProductId: user.activeProductId || '',
      trial: effectiveTrial
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// D. Save User Data State
app.post('/api/user/data', async (req, res) => {
  try {
    const { username, bom, processes, miscItems, customerName, customerAddress, customerGSTIN, profitPercentage, companies, selectedCompany, processRates, clients, selectedClients, products, activeProductId } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    
    const user = await User.findOneAndUpdate(
      { username: cleanUsername },
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

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Synchronize products into the dedicated 'products' MongoDB collection
    if (Array.isArray(products)) {
      const activeOrg = user.orgName || '';
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
          { productId: p.id, username: cleanUsername },
          {
            $set: {
              productId: p.id,
              name: p.name.trim(),
              quantity: qty,
              username: cleanUsername,
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
        await Product.deleteMany({ username: cleanUsername, productId: { $nin: currentProductIds } });
      } else {
        await Product.deleteMany({ username: cleanUsername });
      }
    }

    res.status(200).json({ success: true });
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
    
    if (!id || !username || !orgName || grandTotal === undefined) {
      return res.status(400).json({ error: 'Missing required transaction fields.' });
    }

    const newTx = new Transaction({
      id,
      date,
      orgName: orgName.trim(),
      companyName: (companyName || orgName).trim(),
      productName: productName || '',
      username: username.trim().toLowerCase(),
      customerName: customerName || '',
      customerAddress: customerAddress || '',
      customerGSTIN: customerGSTIN || '',
      profitPercentage: profitPercentage || 0,
      bom: bom || [],
      processes: processes || [],
      miscItems: miscItems || [],
      grandTotal: grandTotal
    });

    await newTx.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
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

    // 1. Fetch all users belonging to organization
    const orgUsers = await User.find({ orgName: cleanOrgName }, 'username');
    const usernames = orgUsers.map(u => u.username);

    // 2. Fetch all transactions for organization
    const transactions = await Transaction.find({ orgName: cleanOrgName });

    // 3. Build Users stats directory
    const usersStats = usernames.map(username => {
      const userTxns = transactions.filter(t => t.username === username);
      const quoteCount = userTxns.length;
      const userTotalVal = userTxns.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
      return {
        username,
        quoteCount,
        totalQuotedValue: userTotalVal
      };
    });

    res.status(200).json({
      users: usersStats,
      transactions: transactions
    });
  } catch (err) {
    console.error(err);
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

// H. Get Standard User Transactions (Quotation History - Scoped)
app.get('/api/user/transactions', async (req, res) => {
  try {
    const username = req.query.username;
    const orgName = req.query.orgName;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    const cleanUsername = username.trim().toLowerCase();
    
    const query = { username: cleanUsername };
    if (orgName && orgName.trim()) {
      query.orgName = orgName.trim();
    }

    // Fetch all transactions belonging to this user (sorted newest first)
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
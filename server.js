const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
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
  passwordHash: { type: String, required: true }
});
const Organisation = mongoose.model('Organisation', OrganisationSchema);

// 2. User Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String }, // Optional for Google OAuth users
  googleId: { type: String, unique: true, sparse: true, index: true },
  email: { type: String, lowercase: true, trim: true },
  orgName: { type: String, required: true, trim: true },
  // Active estimation state
  bom: { type: Array, default: [] },
  processes: { type: Array, default: [] },
  miscItems: { type: Array, default: [] },
  customerName: { type: String, default: '' },
  customerAddress: { type: String, default: '' },
  customerGSTIN: { type: String, default: '' },
  profitPercentage: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

// 3. Transaction Model (Archived Estimates / PDF Logs)
const TransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Quotation Reference No (e.g., MS-Q-123456)
  date: { type: String, required: true },
  orgName: { type: String, required: true, index: true },
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


// --- Google Auth Configurations ---
app.get('/api/auth/google/config', (req, res) => {
  res.status(200).json({ clientId: GOOGLE_CLIENT_ID });
});

// Google ID token sign-in validation
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
    const name = payload['name'];

    // Check if user already exists
    const user = await User.findOne({ googleId: googleId });
    if (user) {
      return res.status(200).json({
        success: true,
        isNewGoogleUser: false,
        username: user.username,
        orgName: user.orgName
      });
    }

    // New Google User - Needs Organization Binding
    res.status(200).json({
      success: false,
      isNewGoogleUser: true,
      googleId,
      email,
      name
    });
  } catch (err) {
    console.error('Google Sign-in Error:', err.message);
    res.status(400).json({ error: 'Invalid Google ID Token.' });
  }
});

// Complete Google registration with Org Binding
app.post('/api/auth/google/register', async (req, res) => {
  try {
    const { googleId, email, username, orgName, orgPassword } = req.body;

    if (!googleId || !email || !username || !orgName || !orgPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanOrgName = orgName.trim();

    // Check if username already exists
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Check or create organization
    let org = await Organisation.findOne({ name: cleanOrgName });
    if (org) {
      const isOrgPasswordValid = await bcrypt.compare(orgPassword, org.passwordHash);
      if (!isOrgPasswordValid) {
        return res.status(401).json({ error: 'Incorrect password for this Organisation.' });
      }
    } else {
      const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
      org = new Organisation({
        name: cleanOrgName,
        passwordHash: orgPasswordHash
      });
      await org.save();
    }

    // Create User
    const newUser = new User({
      username: cleanUsername,
      googleId: googleId,
      email: email.toLowerCase().trim(),
      orgName: cleanOrgName
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      username: cleanUsername,
      orgName: cleanOrgName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// A. Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, orgName, orgPassword } = req.body;
    
    if (!username || !password || !orgName || !orgPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanOrgName = orgName.trim();

    // Check if user already exists
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    // Check or create organization
    let org = await Organisation.findOne({ name: cleanOrgName });
    if (org) {
      // Verify organization password
      const isOrgPasswordValid = await bcrypt.compare(orgPassword, org.passwordHash);
      if (!isOrgPasswordValid) {
        return res.status(401).json({ error: 'Incorrect password for this Organisation.' });
      }
    } else {
      // Create new Organisation
      const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
      org = new Organisation({
        name: cleanOrgName,
        passwordHash: orgPasswordHash
      });
      await org.save();
    }

    // Hash user password and create User
    const userPasswordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: cleanUsername,
      passwordHash: userPasswordHash,
      orgName: cleanOrgName
    });
    await newUser.save();

    res.status(201).json({ success: true, username: cleanUsername, orgName: cleanOrgName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// B. Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { role, username, password, orgName, orgPassword } = req.body;

    if (role === 'user') {
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and Password are required.' });
      }
      const cleanUsername = username.trim().toLowerCase();
      const user = await User.findOne({ username: cleanUsername });
      if (!user) {
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
        return res.status(401).json({ error: 'Invalid organisation name or password.' });
      }

      const isOrgPasswordValid = await bcrypt.compare(orgPassword, org.passwordHash);
      if (!isOrgPasswordValid) {
        return res.status(401).json({ error: 'Invalid organisation name or password.' });
      }

      res.status(200).json({
        success: true,
        role: 'org',
        orgName: org.name
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
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

    res.status(200).json({
      bom: user.bom || [],
      processes: user.processes || [],
      miscItems: user.miscItems || [],
      customerName: user.customerName || '',
      customerAddress: user.customerAddress || '',
      customerGSTIN: user.customerGSTIN || '',
      profitPercentage: user.profitPercentage || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// D. Save User Data State
app.post('/api/user/data', async (req, res) => {
  try {
    const { username, bom, processes, miscItems, customerName, customerAddress, customerGSTIN, profitPercentage } = req.body;
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
          profitPercentage: profitPercentage || 0
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// E. Add New Transaction (Estimate Log / PDF export snapshot)
app.post('/api/transactions', async (req, res) => {
  try {
    const { id, date, username, orgName, customerName, customerAddress, customerGSTIN, profitPercentage, bom, processes, miscItems, grandTotal } = req.body;
    
    if (!id || !username || !orgName || grandTotal === undefined) {
      return res.status(400).json({ error: 'Missing required transaction fields.' });
    }

    const newTx = new Transaction({
      id,
      date,
      orgName: orgName.trim(),
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

// F. Get Organisation Admin Dashboard Stats
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

// G. Delete Transaction Route
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findOneAndDelete({ id: id });
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }
    res.status(200).json({ success: true });
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
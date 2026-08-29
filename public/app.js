// =======================================================
// Quotation Suite: Core Calculations & Billing Management
// =======================================================

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Material Preset Database ---
const MATERIALS = [
  { id: 'steel', name: 'Steel (default)', density: 7.85 },
  { id: 'aluminum-1100', name: 'Aluminum 1100', density: 7.85 * 0.3462 },
  { id: 'aluminum-2011', name: 'Aluminum 2011', density: 7.85 * 0.3604 },
  { id: 'aluminum-2014', name: 'Aluminum 2014', density: 7.85 * 0.3568 },
  { id: 'aluminum-2017', name: 'Aluminum 2017', density: 7.85 * 0.3568 },
  { id: 'aluminum-2024', name: 'Aluminum 2024', density: 7.85 * 0.3533 },
  { id: 'aluminum-3003', name: 'Aluminum 3003', density: 7.85 * 0.3498 },
  { id: 'aluminum-5005', name: 'Aluminum 5005', density: 7.85 * 0.3462 },
  { id: 'aluminum-5052', name: 'Aluminum 5052', density: 7.85 * 0.3427 },
  { id: 'aluminum-5056', name: 'Aluminum 5056', density: 7.85 * 0.3356 },
  { id: 'aluminum-5083', name: 'Aluminum 5083', density: 7.85 * 0.3392 },
  { id: 'aluminum-5086', name: 'Aluminum 5086', density: 7.85 * 0.3392 },
  { id: 'aluminum-6061', name: 'Aluminum 6061', density: 7.85 * 0.3462 },
  { id: 'aluminum-6063', name: 'Aluminum 6063', density: 7.85 * 0.3462 },
  { id: 'aluminum-7050', name: 'Aluminum 7050', density: 7.85 * 0.3568 },
  { id: 'aluminum-7075', name: 'Aluminum 7075', density: 7.85 * 0.3568 },
  { id: 'aluminum-7178', name: 'Aluminum 7178', density: 7.85 * 0.3604 },
  { id: 'stainless-300', name: 'Stainless 300 Series', density: 7.85 * 1.030 },
  { id: 'stainless-400', name: 'Stainless 400 Series', density: 7.85 * 1.010 },
  { id: 'nickel-200', name: 'Nickel 200', density: 7.85 * 1.132 },
  { id: 'nickel-400', name: 'Nickel 400', density: 7.85 * 1.125 },
  { id: 'nickel-r405', name: 'Nickel R-405', density: 7.85 * 1.121 },
  { id: 'nickel-k500', name: 'Nickel K-500', density: 7.85 * 1.075 },
  { id: 'nickel-600', name: 'Nickel 600', density: 7.85 * 1.072 },
  { id: 'nickel-625', name: 'Nickel 625', density: 7.85 * 1.075 },
  { id: 'nickel-800h', name: 'Nickel 800H', density: 7.85 * 1.012 },
  { id: 'nickel-800at', name: 'Nickel 800AT', density: 7.85 * 1.012 },
  { id: 'nickel-825', name: 'Nickel 825', density: 7.85 * 1.037 },
  { id: 'nickel-330', name: 'Nickel 330', density: 7.85 * 1.012 },
  { id: 'nickel-20', name: 'Nickel 20', density: 7.85 * 1.030 },
  { id: 'nickel-c276', name: 'Nickel C-276', density: 7.85 * 1.132 },
  { id: 'nickel-254smo', name: 'Nickel 254SMO', density: 7.85 * 1.012 },
  { id: 'magnesium', name: 'Magnesium', density: 7.85 * 0.229 },
  { id: 'beryllium', name: 'Beryllium', density: 7.85 * 0.236 },
  { id: 'titanium', name: 'Titanium', density: 7.85 * 0.575 },
  { id: 'zirconium', name: 'Zirconium', density: 7.85 * 0.812 },
  { id: 'cast-iron', name: 'Cast Iron', density: 7.85 * 0.911 },
  { id: 'zinc', name: 'Zinc', density: 7.85 * 0.911 },
  { id: 'brass', name: 'Brass', density: 7.85 * 1.084 },
  { id: 'columbium', name: 'Columbium', density: 7.85 * 1.095 },
  { id: 'copper', name: 'Copper', density: 7.85 * 1.144 },
  { id: 'molybdenum', name: 'Molybdenum', density: 7.85 * 1.303 },
  { id: 'silver', name: 'Silver', density: 7.85 * 1.339 },
  { id: 'lead', name: 'Lead', density: 7.85 * 1.448 },
  { id: 'tantalum', name: 'Tantalum', density: 7.85 * 2.120 },
  { id: 'tungsten', name: 'Tungsten', density: 7.85 * 2.462 },
  { id: 'gold', name: 'Gold', density: 7.85 * 2.466 },
  { id: 'custom', name: 'Custom Material', density: 7.85 }
];

// --- Shape Definitions & Geometric Formulas ---
const SHAPES = {
  'round-bar': {
    name: 'Round Bar / Wire / Rod',
    icon: 'circle',
    fields: [
      { id: 'diameter', label: 'Diameter (d)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'diameter' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const d = toCm(dims.diameter, dims.diameterUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      return Math.PI * Math.pow(d / 2, 2) * l;
    }
  },
  'square-bar': {
    name: 'Square Bar',
    icon: 'square',
    fields: [
      { id: 'width', label: 'Side Width (w)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'width' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const w = toCm(dims.width, dims.widthUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      return Math.pow(w, 2) * l;
    }
  },
  'flat-bar': {
    name: 'Flat Bar / Sheet / Plate',
    icon: 'rectangle-horizontal',
    fields: [
      { id: 'width', label: 'Width (w)', defaultUnit: 'mm', defaultVal: 100, svgDim: 'width' },
      { id: 'thickness', label: 'Thickness (t)', defaultUnit: 'mm', defaultVal: 10, svgDim: 'thickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const w = toCm(dims.width, dims.widthUnit);
      const t = toCm(dims.thickness, dims.thicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      return w * t * l;
    }
  },
  'hexagonal-bar': {
    name: 'Hexagonal Bar',
    icon: 'hexagon',
    fields: [
      { id: 'widthAcrossFlats', label: 'Across Flats (s)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'widthAcrossFlats' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const s = toCm(dims.widthAcrossFlats, dims.widthAcrossFlatsUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      return (Math.sqrt(3) / 2) * Math.pow(s, 2) * l;
    }
  },
  'octagonal-bar': {
    name: 'Octagonal Bar',
    icon: 'octagon',
    fields: [
      { id: 'widthAcrossFlats', label: 'Across Flats (s)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'widthAcrossFlats' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const s = toCm(dims.widthAcrossFlats, dims.widthAcrossFlatsUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      return 2 * (Math.sqrt(2) - 1) * Math.pow(s, 2) * l;
    }
  },
  'round-tube': {
    name: 'Round Tube / Pipe',
    icon: 'circle-dot',
    fields: [
      { id: 'outerDiameter', label: 'Outer Diameter (d)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'outerDiameter' },
      { id: 'wallThickness', label: 'Wall Thickness (t)', defaultUnit: 'mm', defaultVal: 3, svgDim: 'wallThickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const d = toCm(dims.outerDiameter, dims.outerDiameterUnit);
      const t = toCm(dims.wallThickness, dims.wallThicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (t >= d / 2) return 0;
      return Math.PI * t * (d - t) * l;
    }
  },
  'square-tube': {
    name: 'Square Tube',
    icon: 'square',
    fields: [
      { id: 'width', label: 'Outer Width (w)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'width' },
      { id: 'wallThickness', label: 'Wall Thickness (t)', defaultUnit: 'mm', defaultVal: 3, svgDim: 'wallThickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const w = toCm(dims.width, dims.widthUnit);
      const t = toCm(dims.wallThickness, dims.wallThicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (t >= w / 2) return 0;
      return 4 * t * (w - t) * l;
    }
  },
  'rectangular-tube': {
    name: 'Rectangular Tube',
    icon: 'rectangle-horizontal',
    fields: [
      { id: 'width', label: 'Outer Width (w)', defaultUnit: 'mm', defaultVal: 80, svgDim: 'width' },
      { id: 'height', label: 'Outer Height (h)', defaultUnit: 'mm', defaultVal: 40, svgDim: 'height' },
      { id: 'wallThickness', label: 'Wall Thickness (t)', defaultUnit: 'mm', defaultVal: 3, svgDim: 'wallThickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const w = toCm(dims.width, dims.widthUnit);
      const h = toCm(dims.height, dims.heightUnit);
      const t = toCm(dims.wallThickness, dims.wallThicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (t >= w / 2 || t >= h / 2) return 0;
      return 2 * t * (w + h - 2 * t) * l;
    }
  },
  'angle': {
    name: 'Angle (L-profile)',
    icon: 'corner-down-right',
    fields: [
      { id: 'leg1Width', label: 'Leg 1 Width (w)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'leg1Width' },
      { id: 'leg2Width', label: 'Leg 2 Width (h)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'leg2Width' },
      { id: 'thickness', label: 'Thickness (t)', defaultUnit: 'mm', defaultVal: 5, svgDim: 'thickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const w = toCm(dims.leg1Width, dims.leg1WidthUnit);
      const h = toCm(dims.leg2Width, dims.leg2WidthUnit);
      const t = toCm(dims.thickness, dims.thicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (t >= w || t >= h) return 0;
      return (w + h - t) * t * l;
    }
  },
  'channel': {
    name: 'Channel (U-profile)',
    icon: 'align-justify',
    fields: [
      { id: 'webHeight', label: 'Web Height (H)', defaultUnit: 'mm', defaultVal: 100, svgDim: 'webHeight' },
      { id: 'flangeWidth', label: 'Flange Width (W)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'flangeWidth' },
      { id: 'thickness', label: 'Thickness (T)', defaultUnit: 'mm', defaultVal: 6, svgDim: 'thickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const h = toCm(dims.webHeight, dims.webHeightUnit);
      const w = toCm(dims.flangeWidth, dims.flangeWidthUnit);
      const t = toCm(dims.thickness, dims.thicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (t >= h / 2 || t >= w) return 0;
      return (h + 2 * w - 2 * t) * t * l;
    }
  },
  't-profile': {
    name: 'T-profile',
    icon: 'type',
    fields: [
      { id: 'flangeWidth', label: 'Flange Width (W)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'flangeWidth' },
      { id: 'stemHeight', label: 'Stem Height (H)', defaultUnit: 'mm', defaultVal: 50, svgDim: 'stemHeight' },
      { id: 'thickness', label: 'Thickness (T)', defaultUnit: 'mm', defaultVal: 5, svgDim: 'thickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const w = toCm(dims.flangeWidth, dims.flangeWidthUnit);
      const h = toCm(dims.stemHeight, dims.stemHeightUnit);
      const t = toCm(dims.thickness, dims.thicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (t >= w || t >= h) return 0;
      return (w + h - t) * t * l;
    }
  },
  'i-beam': {
    name: 'I-beam / H-beam',
    icon: 'columns',
    fields: [
      { id: 'beamHeight', label: 'Height (H)', defaultUnit: 'mm', defaultVal: 150, svgDim: 'beamHeight' },
      { id: 'flangeWidth', label: 'Flange Width (W)', defaultUnit: 'mm', defaultVal: 75, svgDim: 'flangeWidth' },
      { id: 'flangeThickness', label: 'Flange Thickness (Tf)', defaultUnit: 'mm', defaultVal: 8, svgDim: 'flangeThickness' },
      { id: 'webThickness', label: 'Web Thickness (Tw)', defaultUnit: 'mm', defaultVal: 6, svgDim: 'webThickness' },
      { id: 'length', label: 'Length (L)', defaultUnit: 'mm', defaultVal: 1000, svgDim: 'length' }
    ],
    calcVolume: (dims) => {
      const h = toCm(dims.beamHeight, dims.beamHeightUnit);
      const w = toCm(dims.flangeWidth, dims.flangeWidthUnit);
      const tf = toCm(dims.flangeThickness, dims.flangeThicknessUnit);
      const tw = toCm(dims.webThickness, dims.webThicknessUnit);
      const l = toCm(dims.length, dims.lengthUnit);
      if (2 * tf >= h || tw >= w) return 0;
      return (2 * w * tf + (h - 2 * tf) * tw) * l;
    }
  },
  'ring': {
    name: 'Ring / Washer / Hollow Disc',
    icon: 'circle-dot',
    fields: [
      { id: 'outerDiameter', label: 'Outer Diameter (OD)', defaultUnit: 'mm', defaultVal: 80, svgDim: 'outerDiameter' },
      { id: 'innerDiameter', label: 'Inner Diameter (ID)', defaultUnit: 'mm', defaultVal: 40, svgDim: 'innerDiameter' },
      { id: 'thickness', label: 'Thickness (T)', defaultUnit: 'mm', defaultVal: 10, svgDim: 'thickness' }
    ],
    calcVolume: (dims) => {
      const od = toCm(dims.outerDiameter, dims.outerDiameterUnit);
      const id = toCm(dims.innerDiameter, dims.innerDiameterUnit);
      const t = toCm(dims.thickness, dims.thicknessUnit);
      if (id >= od) return 0;
      return (Math.PI / 4) * (Math.pow(od, 2) - Math.pow(id, 2)) * t;
    }
  }
};

// --- Conversion / Formatting Helpers ---
function toCm(value, unit) {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  switch (unit) {
    case 'mm': return num * 0.1;
    case 'cm': return num;
    case 'm': return num * 100;
    case 'in': return num * 2.54;
    case 'ft': return num * 30.48;
    default: return num;
  }
}

function formatINR(value) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// --- Application State ---
let state = {
  currentUser: null,
  users: {}, // Loaded from local storage (credentials)
  activeShape: 'round-bar',
  activeMaterial: 'steel',
  density: 7.85,
  dimensions: {},
  globalUnit: 'mm',
  price: 0,
  priceUnit: 'kg',
  quantity: 1,
  
  // User isolated database contents
  products: [],
  activeProductId: '',
  currentTab: 'products',
  bom: [],
  processes: [],
  miscItems: [],
  customerName: '',
  customerAddress: '',
  customerGSTIN: '',
  profitPercentage: 0,
  companies: [],
  selectedCompany: '',
  transactionsHistory: [],
  processRates: [],
  clients: [],
  selectedClients: []
};

// --- DOM References ---
const DOM = {
  // Initial loading splash screen
  appInitialLoader: document.getElementById('app-initial-loader'),

  // Auth screen nodes
  authOverlay: document.getElementById('auth-overlay'),
  authForm: document.getElementById('auth-form'),
  authUsername: document.getElementById('auth-username'),
  authPassword: document.getElementById('auth-password'),
  authOrg: document.getElementById('auth-org'),
  authOrgPassword: document.getElementById('auth-org-password'),
  authOrgContainer: document.getElementById('auth-org-container'),
  authOrgPasswordContainer: document.getElementById('auth-org-password-container'),
  authUsernameContainer: document.getElementById('auth-username-container'),
  authPasswordContainer: document.getElementById('auth-password-container'),
  toggleAuthPasswordBtn: document.getElementById('toggle-auth-password'),
  toggleAuthPasswordIcon: document.getElementById('toggle-auth-password-icon'),
  toggleAuthOrgPasswordBtn: document.getElementById('toggle-auth-org-password'),
  toggleAuthOrgPasswordIcon: document.getElementById('toggle-auth-org-password-icon'),
  authRoleSelector: document.getElementById('auth-role-selector'),
  roleUserBtn: document.getElementById('role-user-btn'),
  roleOrgBtn: document.getElementById('role-org-btn'),
  authSubmitBtn: document.getElementById('auth-submit-btn'),
  authBtnText: document.getElementById('auth-btn-text'),
  authToggleBtn: document.getElementById('auth-toggle-btn'),
  authTogglePrompt: document.getElementById('auth-toggle-prompt'),
  authTitle: document.getElementById('auth-title'),
  authSubtitle: document.getElementById('auth-subtitle'),
  authErrorMsg: document.getElementById('auth-error-msg'),
  authThemeToggle: document.getElementById('auth-theme-toggle'),
  authSlideBtn0: document.getElementById('auth-slide-btn-0'),
  authSlideBtn1: document.getElementById('auth-slide-btn-1'),
  authSlideBtn2: document.getElementById('auth-slide-btn-2'),
  googleSigninDivider: document.getElementById('google-signin-divider'),
  googleSigninContainer: document.getElementById('google-signin-container'),
  googleSignInBtn: document.getElementById('google-signin-btn'),
  customGoogleSigninBtn: document.getElementById('custom-google-signin-btn'),
  adminLoginTriggerBtn: document.getElementById('admin-login-trigger-btn'),
  
  employeeOrgSetupCard: document.getElementById('employee-org-setup-card'),
  employeeOrgSetupForm: document.getElementById('employee-org-setup-form'),
  employeeSetupOrgName: document.getElementById('employee-setup-org-name'),
  employeeSetupOrgPassword: document.getElementById('employee-setup-org-password'),
  employeeOrgSetupError: document.getElementById('employee-org-setup-error'),

  googleLinkCard: document.getElementById('google-link-card'),
  googleLinkEmail: document.getElementById('google-link-email'),
  googleLinkUsername: document.getElementById('google-link-username'),
  googleLinkPassword: document.getElementById('google-link-password'),
  googleLinkOrg: document.getElementById('google-link-org'),
  googleLinkOrgPassword: document.getElementById('google-link-org-password'),
  googleLinkSubmitBtn: document.getElementById('google-link-submit-btn'),
  googleLinkCancelBtn: document.getElementById('google-link-cancel-btn'),

  orgSetupView: document.getElementById('org-setup-view'),
  orgSetupForm: document.getElementById('org-setup-form'),
  orgSetupName: document.getElementById('org-setup-name'),
  orgSetupPassword: document.getElementById('org-setup-password'),
  toggleOrgSetupPasswordBtn: document.getElementById('toggle-org-setup-password'),
  orgSetupError: document.getElementById('org-setup-error'),
  orgDashboardContent: document.getElementById('org-dashboard-content'),

  tabSettingsBtn: document.getElementById('tab-settings-btn'),
  tabSettingsContent: document.getElementById('tab-settings-content'),
  orgSettingsForm: document.getElementById('org-settings-form'),
  orgSettingsName: document.getElementById('org-settings-name'),
  orgSettingsPassword: document.getElementById('org-settings-password'),
  toggleOrgSettingsPasswordBtn: document.getElementById('toggle-org-settings-password'),
  orgSettingsSuccess: document.getElementById('org-settings-success'),
  orgSettingsError: document.getElementById('org-settings-error'),

  // Join Organisation by Code elements
  joinOrgBanner: document.getElementById('join-org-banner'),
  openJoinOrgBtn: document.getElementById('open-join-org-btn'),
  joinOrgModal: document.getElementById('join-org-modal'),
  closeJoinOrgModalBtn: document.getElementById('close-join-org-modal'),
  cancelJoinOrgBtn: document.getElementById('cancel-join-org-btn'),
  joinByCodeForm: document.getElementById('join-by-code-form'),
  joinOrgAccessCode: document.getElementById('join-org-access-code'),
  joinByCodeError: document.getElementById('join-by-code-error'),

  // Org Profile & Access Code modal
  orgProfileTriggerBtn: document.getElementById('org-profile-trigger-btn'),
  orgProfileNavName: document.getElementById('org-profile-nav-name'),
  orgProfileModal: document.getElementById('org-profile-modal'),
  closeOrgProfileModalBtn: document.getElementById('close-org-profile-modal'),
  cancelOrgProfileBtn: document.getElementById('cancel-org-profile-btn'),
  orgProfileForm: document.getElementById('org-profile-form'),
  orgProfileNameInput: document.getElementById('org-profile-name-input'),
  orgProfileAccessCodeInput: document.getElementById('org-profile-access-code-input'),
  copyAccessCodeBtn: document.getElementById('copy-access-code-btn'),
  copyAccessCodeIcon: document.getElementById('copy-access-code-icon'),
  regenerateAccessCodeBtn: document.getElementById('regenerate-access-code-btn'),
  orgProfileError: document.getElementById('org-profile-error'),
  orgProfileSuccess: document.getElementById('org-profile-success'),

  // Org Pending Approval View
  orgPendingView: document.getElementById('org-pending-view'),
  orgPendingDisplayName: document.getElementById('org-pending-display-name'),
  orgPendingRefreshBtn: document.getElementById('org-pending-refresh-btn'),
  orgPendingLogoutBtn: document.getElementById('org-pending-logout-btn'),

  // Super Administrator Portal
  superadminWrapper: document.getElementById('superadmin-wrapper'),
  superadminLogoutBtn: document.getElementById('superadmin-logout-btn'),
  superadminThemeToggle: document.getElementById('superadmin-theme-toggle'),
  superadminRefreshBtn: document.getElementById('superadmin-refresh-btn'),
  superadminSearchInput: document.getElementById('superadmin-search-input'),
  superadminTabAll: document.getElementById('superadmin-tab-all'),
  superadminTabPending: document.getElementById('superadmin-tab-pending'),
  superadminTabApproved: document.getElementById('superadmin-tab-approved'),
  superadminTabRejected: document.getElementById('superadmin-tab-rejected'),
  superadminTabUsers: document.getElementById('superadmin-tab-users'),
  superadminColName: document.getElementById('superadmin-col-name'),
  superadminColCode: document.getElementById('superadmin-col-code'),
  superadminColUsers: document.getElementById('superadmin-col-users'),
  superadminColStatus: document.getElementById('superadmin-col-status'),
  superadminOrgsTableBody: document.getElementById('superadmin-orgs-table-body'),
  superadminStatPending: document.getElementById('superadmin-stat-pending'),
  superadminStatApproved: document.getElementById('superadmin-stat-approved'),
  superadminStatUsers: document.getElementById('superadmin-stat-users'),
  superadminStatQuotes: document.getElementById('superadmin-stat-quotes'),
  superadminProfileBtn: document.getElementById('superadmin-profile-btn'),
  superadminNavUsername: document.getElementById('superadmin-nav-username'),
  superadminProfileModal: document.getElementById('superadmin-profile-modal'),
  closeSuperadminProfileModalBtn: document.getElementById('close-superadmin-profile-modal'),
  cancelSuperadminProfileBtn: document.getElementById('cancel-superadmin-profile-btn'),
  superadminProfileForm: document.getElementById('superadmin-profile-form'),
  superadminEditUsername: document.getElementById('superadmin-edit-username'),
  superadminCurrentPassword: document.getElementById('superadmin-current-password'),
  superadminNewPassword: document.getElementById('superadmin-new-password'),
  superadminConfirmPassword: document.getElementById('superadmin-confirm-password'),
  toggleSuperadminCurrPassword: document.getElementById('toggle-superadmin-curr-password'),
  toggleSuperadminNewPassword: document.getElementById('toggle-superadmin-new-password'),
  superadminProfileError: document.getElementById('superadmin-profile-error'),
  superadminProfileSuccess: document.getElementById('superadmin-profile-success'),

  // 60-Day Trial and Contact Modal elements
  trialStatusBanner: document.getElementById('trial-status-banner'),
  trialBannerText: document.getElementById('trial-banner-text'),
  trialBannerDays: document.getElementById('trial-banner-days'),
  trialStatusBannerOrg: document.getElementById('trial-status-banner-org'),
  trialBannerOrgText: document.getElementById('trial-banner-org-text'),
  trialBannerOrgDays: document.getElementById('trial-banner-org-days'),
  argusContactModal: document.getElementById('argus-contact-modal'),
  closeArgusContactModalBtn: document.getElementById('close-argus-contact-modal'),
  dismissArgusContactBtn: document.getElementById('dismiss-argus-contact-btn'),
  trialExpiredModal: document.getElementById('trial-expired-modal'),
  trialExpiredLogoutBtn: document.getElementById('trial-expired-logout-btn'),

  // Org Connect Prompt Banner
  orgSetupBanner: document.getElementById('org-setup-banner'),
  orgSetupBtn: document.getElementById('org-setup-btn'),
  orgSetupModal: document.getElementById('org-setup-modal'),
  orgSetupModalClose: document.getElementById('org-setup-modal-close'),
  orgSetupCancelBtn: document.getElementById('org-setup-cancel-btn'),

  // Company Selector Navbar Dropdown
  companySelectorTrigger: document.getElementById('company-selector-trigger') || document.getElementById('company-selector-btn'),
  companySelectorBtn: document.getElementById('company-selector-trigger') || document.getElementById('company-selector-btn'),
  companySelectorDropdown: document.getElementById('company-selector-dropdown'),
  companySelectorList: document.getElementById('company-selector-list'),
  addCompanyForm: document.getElementById('add-company-form'),
  addCompanyBtn: document.getElementById('add-company-btn'),
  newCompanyInput: document.getElementById('new-company-input'),
  
  // App console wrapper
  appWrapper: document.getElementById('app-wrapper'),
  returnToOrgAdminBtn: document.getElementById('return-to-org-admin-btn'),
  upgradeToOrgHeaderBtn: document.getElementById('upgrade-to-org-header-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  userDisplayOrg: document.getElementById('user-display-org'),
  userDisplayUsername: document.getElementById('user-display-username'),
  customerNameInput: document.getElementById('customer-name-input'),
  customerAddressInput: document.getElementById('customer-address-input'),
  customerGSTINInput: document.getElementById('customer-gstin-input'),
  navProductsBtn: document.getElementById('nav-products-btn'),
  navCalculatorBtn: document.getElementById('nav-calculator-btn'),
  navQuotationBtn: document.getElementById('nav-quotation-btn'),
  navHistoryBtn: document.getElementById('nav-history-btn'),
  mobileNavProductsBtn: document.getElementById('mobile-nav-products-btn'),
  mobileNavCalculatorBtn: document.getElementById('mobile-nav-calculator-btn'),
  mobileNavQuotationBtn: document.getElementById('mobile-nav-quotation-btn'),
  mobileNavHistoryBtn: document.getElementById('mobile-nav-history-btn'),
  productsView: document.getElementById('products-view'),
  calculatorView: document.getElementById('calculator-view'),
  quotationTabView: document.getElementById('quotation-tab-view'),
  userHistoryView: document.getElementById('user-history-view'),
  userHistoryTableBody: document.getElementById('user-history-table-body'),
  historySearchInput: document.getElementById('history-search-input'),

  // Convert to Org Modal
  convertToOrgModal: document.getElementById('convert-to-org-modal'),
  closeConvertToOrgModalBtn: document.getElementById('close-convert-to-org-modal-btn'),
  cancelConvertToOrgBtn: document.getElementById('cancel-convert-to-org-btn'),
  convertToOrgForm: document.getElementById('convert-to-org-form'),
  convertOrgNameInput: document.getElementById('convert-org-name-input'),
  convertOrgPasswordInput: document.getElementById('convert-org-password-input'),
  toggleConvertOrgPassword: document.getElementById('toggle-convert-org-password'),
  convertOrgAccessCodeInput: document.getElementById('convert-org-access-code-input'),
  convertToOrgErrorMsg: document.getElementById('convert-to-org-error-msg'),
  submitConvertToOrgBtn: document.getElementById('submit-convert-to-org-btn'),

  // Quick Add Product Modal (Quotation Tab)
  quickAddProductModal: document.getElementById('quick-add-product-modal'),
  closeQuickAddProductModalBtn: document.getElementById('close-quick-add-product-modal-btn'),
  cancelQuickAddProductBtn: document.getElementById('cancel-quick-add-product-btn'),
  quickAddProductForm: document.getElementById('quick-add-product-form'),
  quickProductNameInput: document.getElementById('quick-product-name-input'),
  quickProductQtyInput: document.getElementById('quick-product-qty-input'),
  submitQuickAddOnlyBtn: document.getElementById('submit-quick-add-only-btn'),
  submitQuickAddWorkingsBtn: document.getElementById('submit-quick-add-workings-btn'),

  // Products view nodes
  createProductForm: document.getElementById('create-product-form'),
  newProductNameInput: document.getElementById('new-product-name-input'),
  productsCountBadge: document.getElementById('products-count-badge'),
  productsSearchInput: document.getElementById('products-search-input'),
  productsListContainer: document.getElementById('products-list-container'),
  productsEmptyState: document.getElementById('products-empty-state'),

  // Calculator view nodes
  calculatorActiveProductBanner: document.getElementById('calculator-active-product-banner'),
  calculatorActiveProductName: document.getElementById('calculator-active-product-name'),
  calculatorActiveProductTag: document.getElementById('calculator-active-product-tag'),
  calculatorBackToProductsBtn: document.getElementById('calculator-back-to-products-btn'),
  calculatorGoToQuotationBtn: document.getElementById('calculator-go-to-quotation-btn'),
  addCalculationsToProductBtn: document.getElementById('add-calculations-to-product-btn'),
  clearCalculatorSheetBtn: document.getElementById('clear-calculator-sheet-btn'),
  clearAllQuotationsBtn: document.getElementById('clear-all-quotations-btn'),
  calcMetalCost: document.getElementById('calc-metal-cost'),
  calcProcessCost: document.getElementById('calc-process-cost'),
  calcMiscCost: document.getElementById('calc-misc-cost'),
  calcTotalCost: document.getElementById('calc-total-cost'),

  // Quotation view nodes
  quotationProductsCountBadge: document.getElementById('quotation-products-count-badge'),
  quotationProductsContainer: document.getElementById('quotation-products-container'),
  clearAllQuotationsBtn: document.getElementById('clear-all-quotations-btn'),
  addProcessProfileForm: document.getElementById('add-process-profile-form'),
  newProfileName: document.getElementById('new-profile-name'),
  newProfileRate: document.getElementById('new-profile-rate'),
  processProfilesList: document.getElementById('process-profiles-list'),
  editProcessModal: document.getElementById('edit-process-profile-modal'),
  closeEditProcessModalBtn: document.getElementById('close-edit-process-profile-modal'),
  cancelEditProcessModalBtn: document.getElementById('cancel-edit-process-profile-btn'),
  editProcessForm: document.getElementById('edit-process-profile-form'),
  editProcessOldName: document.getElementById('edit-process-old-name'),
  editProcessNameInput: document.getElementById('edit-process-name-input'),
  editProcessRateInput: document.getElementById('edit-process-rate-input'),
  editProcessHourlyHint: document.getElementById('edit-process-hourly-hint'),
  editProcessError: document.getElementById('edit-process-profile-error'),
  customConfirmModal: document.getElementById('custom-confirm-modal'),
  confirmModalTitle: document.getElementById('confirm-modal-title'),
  confirmModalMessage: document.getElementById('confirm-modal-message'),
  confirmModalCancelBtn: document.getElementById('confirm-modal-cancel-btn'),
  confirmModalActionBtn: document.getElementById('confirm-modal-action-btn'),
  confirmModalActionText: document.getElementById('confirm-modal-action-text'),

  // Client Directory & Modal DOM nodes
  openClientsModalBtn: document.getElementById('open-clients-modal-btn'),
  activeClientBadge: document.getElementById('active-client-badge'),
  appliedClientNamesDisplay: document.getElementById('applied-client-names-display'),
  clientsModal: document.getElementById('clients-modal'),
  closeClientsModalBtn: document.getElementById('close-clients-modal-btn'),
  addClientForm: document.getElementById('add-client-form'),
  clientFormTitle: document.getElementById('client-form-title'),
  clientFormIcon: document.getElementById('client-form-icon'),
  clientInputName: document.getElementById('client-input-name'),
  clientInputEmail: document.getElementById('client-input-email'),
  clientInputPhone: document.getElementById('client-input-phone'),
  clientInputAddress: document.getElementById('client-input-address'),
  clientInputGSTIN: document.getElementById('client-input-gstin'),
  cancelClientEditBtn: document.getElementById('cancel-client-edit-btn'),
  clientFormSubmitBtn: document.getElementById('client-form-submit-btn'),
  clientFormSubmitIcon: document.getElementById('client-form-submit-icon'),
  clientFormSubmitText: document.getElementById('client-form-submit-text'),
  clientSearchInput: document.getElementById('client-search-input'),
  modalClientsList: document.getElementById('modal-clients-list'),
  modalClientsCount: document.getElementById('modal-clients-count'),
  modalSelectedSummary: document.getElementById('modal-selected-summary'),
  modalClearClientsSelectionBtn: document.getElementById('modal-clear-clients-selection-btn'),
  modalApplyClientsBtn: document.getElementById('modal-apply-clients-btn'),
  importClientsExcelBtn: document.getElementById('import-clients-excel-btn'),
  clientsExcelFileInput: document.getElementById('clients-excel-file-input'),
  previewExcelTemplateBtn: document.getElementById('preview-excel-template-btn'),
  excelTemplateModal: document.getElementById('excel-template-modal'),
  closeExcelTemplateModalBtn: document.getElementById('close-excel-template-modal-btn'),
  closeExcelGuideBtn: document.getElementById('close-excel-guide-btn'),
  downloadSampleExcelBtn: document.getElementById('download-sample-excel-btn'),

  // Separate PDF Modal DOM nodes
  exportSeparatePDFBtn: document.getElementById('export-separate-pdf-btn'),
  separatePdfModal: document.getElementById('separate-pdf-modal'),
  closeSeparatePdfModalBtn: document.getElementById('close-separate-pdf-modal-btn'),
  closeSeparatePdfModalFooterBtn: document.getElementById('close-separate-pdf-modal-footer-btn'),
  separatePdfCount: document.getElementById('separate-pdf-count'),
  separatePdfDownloadAllBtn: document.getElementById('separate-pdf-download-all-btn'),
  separatePdfClientsList: document.getElementById('separate-pdf-clients-list'),

  // Org wrapper (Organisation Dashboard)
  orgWrapper: document.getElementById('org-wrapper'),
  orgDisplayTitle: document.getElementById('org-display-title'),
  orgUserDisplayName: document.getElementById('org-user-display-name'),
  orgOpenWorkspaceBtn: document.getElementById('org-open-workspace-btn'),
  orgDashboardOpenWorkspaceBtn: document.getElementById('org-dashboard-open-workspace-btn'),
  orgThemeToggle: document.getElementById('org-theme-toggle'),
  orgThemeToggleIconDark: document.getElementById('org-theme-toggle-icon-dark'),
  orgThemeToggleIconLight: document.getElementById('org-theme-toggle-icon-light'),
  orgLogoutBtn: document.getElementById('org-logout-btn'),
  statTotalUsers: document.getElementById('stat-total-users'),
  statTotalProducts: document.getElementById('stat-total-products'),
  statTotalQuotes: document.getElementById('stat-total-quotes'),
  statTotalValue: document.getElementById('stat-total-value'),
  tabUsersBtn: document.getElementById('tab-users-btn'),
  tabOrgProductsBtn: document.getElementById('tab-org-products-btn'),
  tabQuotesBtn: document.getElementById('tab-quotes-btn'),
  tabUsersContent: document.getElementById('tab-users-content'),
  tabOrgProductsContent: document.getElementById('tab-org-products-content'),
  tabQuotesContent: document.getElementById('tab-quotes-content'),
  orgUsersTableBody: document.getElementById('org-users-table-body'),
  orgProductsTableBody: document.getElementById('org-products-table-body'),
  orgQuotesTableBody: document.getElementById('org-quotes-table-body'),

  // Calculator inputs
  shapeGrid: document.getElementById('shape-grid'),
  shapeSelectMobile: document.getElementById('shape-select-mobile'),
  activeShapeBadge: document.getElementById('active-shape-badge'),
  materialSelect: document.getElementById('material-select'),
  densityInput: document.getElementById('density-input'),
  dimensionsContainer: document.getElementById('dimensions-container'),
  globalUnitSelector: document.getElementById('global-unit-selector'),
  priceInput: document.getElementById('price-input'),
  priceUnitSelect: document.getElementById('price-unit-select'),
  quantityInput: document.getElementById('quantity-input'),
  addToHistoryBtn: document.getElementById('add-to-history-btn'),
  resetBtn: document.getElementById('reset-btn'),

  // Calculation summaries
  resultWeightPrimary: document.getElementById('result-weight-primary'),
  resultWeightUnit: document.getElementById('result-weight-unit'),
  resultWeightLbs: document.getElementById('result-weight-lbs'),
  resultWeightGrams: document.getElementById('result-weight-grams'),
  resultWeightTonnes: document.getElementById('result-weight-tonnes'),
  resultVolume: document.getElementById('result-volume'),
  resultDensity: document.getElementById('result-density'),
  costResultCard: document.getElementById('cost-result-card'),
  resultCost: document.getElementById('result-cost'),
  costRateBadge: document.getElementById('cost-rate-badge'),

  // Unified quote list body
  historyList: document.getElementById('history-list'),
  globalNavBackBtn: document.getElementById('global-nav-back-btn'),
  exportPDFBtn: document.getElementById('export-pdf-btn'),
  exportPDFWithWorkingsBtn: document.getElementById('export-pdf-with-workings-btn'),
  exportSeparatePDFBtn: document.getElementById('export-separate-pdf-btn'),
  exportCSVBtn: document.getElementById('export-csv-btn'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),

  // Separate costing lists
  processesList: document.getElementById('processes-list'),
  miscList: document.getElementById('misc-list'),
  processTotalCostDisplay: document.getElementById('process-total-cost-display'),
  miscTotalCostDisplay: document.getElementById('misc-total-cost-display'),
  addProcessRowBtn: document.getElementById('add-process-row-btn'),
  addMiscRowBtn: document.getElementById('add-misc-row-btn'),

  // Grand summary labels
  grandMetalCost: document.getElementById('grand-metal-cost'),
  grandProcessCost: document.getElementById('grand-process-cost'),
  grandMiscCost: document.getElementById('grand-misc-cost'),
  profitPercentageInput: document.getElementById('profit-percentage-input'),
  profitAmountDisplay: document.getElementById('profit-amount-display'),
  grandTotalCost: document.getElementById('grand-total-cost'),
  ratioLegend: document.getElementById('ratio-legend'),
  ratioMaterialsBar: document.getElementById('ratio-materials-bar'),
  ratioProcessesBar: document.getElementById('ratio-processes-bar'),
  ratioMiscBar: document.getElementById('ratio-misc-bar'),

  themeToggle: document.getElementById('theme-toggle'),
  themeToggleIconDark: document.getElementById('theme-toggle-icon-dark'),
  themeToggleIconLight: document.getElementById('theme-toggle-icon-light')
};

// --- Initialization / Bootstrap ---
window.addEventListener('DOMContentLoaded', () => {
  loadThemeSettings();
  checkAuthenticationSession();
  initGoogleSignIn();
  
  // Register Auth Listeners
  if (DOM.authToggleBtn) DOM.authToggleBtn.addEventListener('click', toggleAuthMode);
  if (DOM.authForm) DOM.authForm.addEventListener('submit', handleAuthSubmit);
  if (DOM.logoutBtn) DOM.logoutBtn.addEventListener('click', handleLogout);
  if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.addEventListener('click', handleCustomGoogleSignInClick);
  if (DOM.employeeOrgSetupForm) DOM.employeeOrgSetupForm.addEventListener('submit', handleEmployeeOrgSetupSubmit);
  if (DOM.toggleAuthPasswordBtn) {
    DOM.toggleAuthPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.authPassword, DOM.toggleAuthPasswordBtn);
    });
  }
  if (DOM.toggleAuthOrgPasswordBtn) {
    DOM.toggleAuthOrgPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.authOrgPassword, DOM.toggleAuthOrgPasswordBtn);
    });
  }

  // Register Org Admin Listeners
  if (DOM.roleUserBtn) DOM.roleUserBtn.addEventListener('click', () => setAuthRole('user'));
  if (DOM.roleOrgBtn) DOM.roleOrgBtn.addEventListener('click', () => setAuthRole('org'));
  if (DOM.orgThemeToggle) DOM.orgThemeToggle.addEventListener('click', toggleTheme);
  if (DOM.orgLogoutBtn) DOM.orgLogoutBtn.addEventListener('click', handleLogout);
  if (DOM.tabUsersBtn) DOM.tabUsersBtn.addEventListener('click', () => setOrgTab('users'));
  if (DOM.tabOrgProductsBtn) DOM.tabOrgProductsBtn.addEventListener('click', () => setOrgTab('products'));
  if (DOM.tabQuotesBtn) DOM.tabQuotesBtn.addEventListener('click', () => setOrgTab('quotes'));
  if (DOM.tabSettingsBtn) DOM.tabSettingsBtn.addEventListener('click', () => setOrgTab('settings'));
  if (DOM.orgSetupForm) DOM.orgSetupForm.addEventListener('submit', handleOrgSetupSubmit);
  if (DOM.orgSettingsForm) DOM.orgSettingsForm.addEventListener('submit', handleOrgSettingsSubmit);
  if (DOM.toggleOrgSetupPasswordBtn) {
    DOM.toggleOrgSetupPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.orgSetupPassword, DOM.toggleOrgSetupPasswordBtn);
    });
  }
  if (DOM.toggleOrgSettingsPasswordBtn) {
    DOM.toggleOrgSettingsPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(DOM.orgSettingsPassword, DOM.toggleOrgSettingsPasswordBtn);
    });
  }

  // Join Org with Code Modal Listeners
  if (DOM.openJoinOrgBtn) DOM.openJoinOrgBtn.addEventListener('click', openJoinOrgModal);
  if (DOM.closeJoinOrgModalBtn) DOM.closeJoinOrgModalBtn.addEventListener('click', closeJoinOrgModal);
  if (DOM.cancelJoinOrgBtn) DOM.cancelJoinOrgBtn.addEventListener('click', closeJoinOrgModal);
  if (DOM.joinByCodeForm) DOM.joinByCodeForm.addEventListener('submit', handleJoinByCodeSubmit);

  // Org Profile & Access Code Listeners
  if (DOM.orgProfileTriggerBtn) DOM.orgProfileTriggerBtn.addEventListener('click', openOrgProfileModal);
  if (DOM.closeOrgProfileModalBtn) DOM.closeOrgProfileModalBtn.addEventListener('click', closeOrgProfileModal);
  if (DOM.cancelOrgProfileBtn) DOM.cancelOrgProfileBtn.addEventListener('click', closeOrgProfileModal);
  if (DOM.orgProfileForm) DOM.orgProfileForm.addEventListener('submit', handleSaveOrgProfileSubmit);
  if (DOM.regenerateAccessCodeBtn) DOM.regenerateAccessCodeBtn.addEventListener('click', generateRandomAccessCode);
  if (DOM.copyAccessCodeBtn) DOM.copyAccessCodeBtn.addEventListener('click', copyAccessCodeToClipboard);

  // Super Admin Listeners
  if (DOM.superadminLogoutBtn) DOM.superadminLogoutBtn.addEventListener('click', handleLogout);
  if (DOM.superadminThemeToggle) DOM.superadminThemeToggle.addEventListener('click', toggleTheme);
  if (DOM.superadminRefreshBtn) DOM.superadminRefreshBtn.addEventListener('click', loadSuperAdminOrgs);
  if (DOM.superadminSearchInput) DOM.superadminSearchInput.addEventListener('input', filterSuperAdminOrgs);
  if (DOM.superadminTabAll) DOM.superadminTabAll.addEventListener('click', () => setSuperAdminTab('all'));
  if (DOM.superadminTabPending) DOM.superadminTabPending.addEventListener('click', () => setSuperAdminTab('pending'));
  if (DOM.superadminTabApproved) DOM.superadminTabApproved.addEventListener('click', () => setSuperAdminTab('approved'));
  if (DOM.superadminTabRejected) DOM.superadminTabRejected.addEventListener('click', () => setSuperAdminTab('rejected'));
  if (DOM.superadminTabUsers) DOM.superadminTabUsers.addEventListener('click', () => setSuperAdminTab('users'));
  if (DOM.orgPendingRefreshBtn) DOM.orgPendingRefreshBtn.addEventListener('click', checkPendingOrgStatus);
  if (DOM.orgPendingLogoutBtn) DOM.orgPendingLogoutBtn.addEventListener('click', handleLogout);
  if (DOM.superadminProfileBtn) DOM.superadminProfileBtn.addEventListener('click', openSuperAdminProfileModal);
  if (DOM.closeSuperadminProfileModalBtn) DOM.closeSuperadminProfileModalBtn.addEventListener('click', closeSuperAdminProfileModal);
  if (DOM.cancelSuperadminProfileBtn) DOM.cancelSuperadminProfileBtn.addEventListener('click', closeSuperAdminProfileModal);
  if (DOM.superadminProfileForm) DOM.superadminProfileForm.addEventListener('submit', handleSaveSuperAdminProfileSubmit);
  if (DOM.toggleSuperadminCurrPassword) {
    DOM.toggleSuperadminCurrPassword.addEventListener('click', () => {
      togglePasswordVisibility(DOM.superadminCurrentPassword, DOM.toggleSuperadminCurrPassword);
    });
  }
  if (DOM.toggleSuperadminNewPassword) {
    DOM.toggleSuperadminNewPassword.addEventListener('click', () => {
      togglePasswordVisibility(DOM.superadminNewPassword, DOM.toggleSuperadminNewPassword);
    });
  }

  // Trial & Argus Contact Listeners
  document.querySelectorAll('.open-argus-contact-btn').forEach(btn => {
    btn.addEventListener('click', openArgusContactModal);
  });
  if (DOM.closeArgusContactModalBtn) DOM.closeArgusContactModalBtn.addEventListener('click', closeArgusContactModal);
  if (DOM.dismissArgusContactBtn) DOM.dismissArgusContactBtn.addEventListener('click', closeArgusContactModal);
  if (DOM.argusContactModal) {
    DOM.argusContactModal.addEventListener('click', (e) => {
      if (e.target === DOM.argusContactModal) closeArgusContactModal();
    });
  }
  if (DOM.trialExpiredLogoutBtn) DOM.trialExpiredLogoutBtn.addEventListener('click', handleLogout);

  // Company Selector Listeners
  if (DOM.companySelectorTrigger) {
    DOM.companySelectorTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.companySelectorDropdown) {
        DOM.companySelectorDropdown.classList.toggle('hidden');
        if (!DOM.companySelectorDropdown.classList.contains('hidden')) {
          renderCompanyDropdown();
        }
      }
    });
  }
  if (DOM.addCompanyForm) {
    DOM.addCompanyForm.addEventListener('submit', handleAddCompanySubmit);
  }
  document.addEventListener('click', (e) => {
    if (DOM.companySelectorDropdown && !DOM.companySelectorDropdown.contains(e.target)) {
      DOM.companySelectorDropdown.classList.add('hidden');
    }
  });

  // Global Back Button Listener
  if (DOM.globalNavBackBtn) DOM.globalNavBackBtn.addEventListener('click', handleGlobalBack);

  // Employee Navigation Switcher Listeners
  if (DOM.navProductsBtn) DOM.navProductsBtn.addEventListener('click', () => switchEmployeeView('products'));
  if (DOM.navCalculatorBtn) DOM.navCalculatorBtn.addEventListener('click', () => switchEmployeeView('calculator'));
  if (DOM.navQuotationBtn) DOM.navQuotationBtn.addEventListener('click', () => switchEmployeeView('quotation'));
  if (DOM.navHistoryBtn) DOM.navHistoryBtn.addEventListener('click', () => switchEmployeeView('history'));

  if (DOM.mobileNavProductsBtn) DOM.mobileNavProductsBtn.addEventListener('click', () => switchEmployeeView('products'));
  if (DOM.mobileNavCalculatorBtn) DOM.mobileNavCalculatorBtn.addEventListener('click', () => switchEmployeeView('calculator'));
  if (DOM.mobileNavQuotationBtn) DOM.mobileNavQuotationBtn.addEventListener('click', () => switchEmployeeView('quotation'));
  if (DOM.mobileNavHistoryBtn) DOM.mobileNavHistoryBtn.addEventListener('click', () => switchEmployeeView('history'));
  
  if (DOM.historySearchInput) DOM.historySearchInput.addEventListener('input', filterUserQuotationHistory);
  if (DOM.addProcessProfileForm) DOM.addProcessProfileForm.addEventListener('submit', handleAddProcessProfileSubmit);

  // Products View Listeners
  if (DOM.createProductForm) DOM.createProductForm.addEventListener('submit', handleCreateProductSubmit);
  if (DOM.productsSearchInput) DOM.productsSearchInput.addEventListener('input', filterProductsList);

  // Calculator View Product Navigators
  if (DOM.calculatorBackToProductsBtn) DOM.calculatorBackToProductsBtn.addEventListener('click', () => switchEmployeeView('products'));
  if (DOM.calculatorGoToQuotationBtn) DOM.calculatorGoToQuotationBtn.addEventListener('click', () => switchEmployeeView('quotation'));
  if (DOM.addCalculationsToProductBtn) DOM.addCalculationsToProductBtn.addEventListener('click', handleAddCalculationsToProduct);
  if (DOM.clearCalculatorSheetBtn) DOM.clearCalculatorSheetBtn.addEventListener('click', clearCalculatorSheet);
  if (DOM.clearAllQuotationsBtn) DOM.clearAllQuotationsBtn.addEventListener('click', clearAllProductsAndQuotations);

  // Edit Process Profile Modal Listeners
  if (DOM.closeEditProcessModalBtn) DOM.closeEditProcessModalBtn.addEventListener('click', closeEditProcessProfileModal);
  if (DOM.cancelEditProcessModalBtn) DOM.cancelEditProcessModalBtn.addEventListener('click', closeEditProcessProfileModal);
  if (DOM.editProcessForm) DOM.editProcessForm.addEventListener('submit', handleEditProcessProfileSubmit);
  if (DOM.editProcessRateInput) {
    DOM.editProcessRateInput.addEventListener('input', updateEditProcessHourlyHint);
  }

  // Confirmation Modal Listeners
  if (DOM.customConfirmModal) {
    DOM.confirmModalCancelBtn.addEventListener('click', hideConfirmModal);
    DOM.confirmModalActionBtn.addEventListener('click', () => {
      if (typeof confirmModalCallback === 'function') {
        confirmModalCallback();
      }
      hideConfirmModal();
    });
    DOM.customConfirmModal.addEventListener('click', (e) => {
      if (e.target === DOM.customConfirmModal) {
        hideConfirmModal();
      }
    });
  }

  // Register Form Event Handlers
  DOM.shapeSelectMobile.addEventListener('change', (e) => selectShape(e.target.value));
  DOM.materialSelect.addEventListener('change', handleMaterialChange);
  DOM.densityInput.addEventListener('input', handleDensityInput);
  DOM.priceInput.addEventListener('input', handlePriceInput);
  DOM.priceUnitSelect.addEventListener('change', handlePriceUnitChange);
  DOM.quantityInput.addEventListener('input', handleQuantityInput);
  DOM.addToHistoryBtn.addEventListener('click', addItemToBOM);
  if (DOM.customerNameInput) DOM.customerNameInput.addEventListener('input', handleCustomerNameInput);
  if (DOM.customerAddressInput) DOM.customerAddressInput.addEventListener('input', handleCustomerAddressInput);
  if (DOM.customerGSTINInput) DOM.customerGSTINInput.addEventListener('input', handleCustomerGSTINInput);
  if (DOM.profitPercentageInput) DOM.profitPercentageInput.addEventListener('input', handleProfitPercentageInput);
  
  // Document BOM quote handlers
  if (DOM.exportPDFBtn) DOM.exportPDFBtn.addEventListener('click', () => exportQuoteToPDF(null, false, null, false));
  if (DOM.exportPDFWithWorkingsBtn) DOM.exportPDFWithWorkingsBtn.addEventListener('click', () => exportQuoteToPDF(null, false, null, true));
  if (DOM.exportCSVBtn) DOM.exportCSVBtn.addEventListener('click', exportBOMToCSV);
  if (DOM.clearHistoryBtn) DOM.clearHistoryBtn.addEventListener('click', clearBOM);

  // Add row listeners for separate config cards
  if (DOM.addProcessRowBtn) DOM.addProcessRowBtn.addEventListener('click', addProcessRow);
  if (DOM.addMiscRowBtn) DOM.addMiscRowBtn.addEventListener('click', addMiscRow);

  // Client Directory modal triggers
  if (DOM.openClientsModalBtn) DOM.openClientsModalBtn.addEventListener('click', openClientsModal);
  if (DOM.closeClientsModalBtn) DOM.closeClientsModalBtn.addEventListener('click', closeClientsModal);
  if (DOM.addClientForm) DOM.addClientForm.addEventListener('submit', handleAddClientSubmit);
  if (DOM.cancelClientEditBtn) DOM.cancelClientEditBtn.addEventListener('click', handleCancelClientEdit);
  if (DOM.clientSearchInput) DOM.clientSearchInput.addEventListener('input', filterModalClients);
  if (DOM.modalClearClientsSelectionBtn) DOM.modalClearClientsSelectionBtn.addEventListener('click', clearModalClientsSelection);
  if (DOM.modalApplyClientsBtn) DOM.modalApplyClientsBtn.addEventListener('click', closeClientsModal);

  // Quick Add Product Modal (Quotation Tab)
  if (DOM.closeQuickAddProductModalBtn) DOM.closeQuickAddProductModalBtn.addEventListener('click', closeQuickAddProductModal);
  if (DOM.cancelQuickAddProductBtn) DOM.cancelQuickAddProductBtn.addEventListener('click', closeQuickAddProductModal);
  if (DOM.quickAddProductForm) {
    DOM.quickAddProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleQuickAddProduct(false);
    });
  }
  if (DOM.submitQuickAddWorkingsBtn) {
    DOM.submitQuickAddWorkingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleQuickAddProduct(true);
    });
  }
  if (DOM.quickAddProductModal) {
    DOM.quickAddProductModal.addEventListener('click', (e) => {
      if (e.target === DOM.quickAddProductModal) closeQuickAddProductModal();
    });
  }

  // Excel Client Import & Template Guide Listeners
  if (DOM.importClientsExcelBtn && DOM.clientsExcelFileInput) {
    DOM.importClientsExcelBtn.addEventListener('click', () => {
      DOM.clientsExcelFileInput.value = '';
      DOM.clientsExcelFileInput.click();
    });
    DOM.clientsExcelFileInput.addEventListener('change', handleClientsExcelFileSelected);
  }
  if (DOM.previewExcelTemplateBtn) {
    DOM.previewExcelTemplateBtn.addEventListener('click', openExcelTemplateModal);
  }
  if (DOM.closeExcelTemplateModalBtn) {
    DOM.closeExcelTemplateModalBtn.addEventListener('click', closeExcelTemplateModal);
  }
  if (DOM.closeExcelGuideBtn) {
    DOM.closeExcelGuideBtn.addEventListener('click', closeExcelTemplateModal);
  }
  if (DOM.downloadSampleExcelBtn) {
    DOM.downloadSampleExcelBtn.addEventListener('click', downloadSampleClientsExcel);
  }
  if (DOM.excelTemplateModal) {
    DOM.excelTemplateModal.addEventListener('click', (e) => {
      if (e.target === DOM.excelTemplateModal) closeExcelTemplateModal();
    });
  }

  if (DOM.clientsModal) {
    DOM.clientsModal.addEventListener('click', (e) => {
      if (e.target === DOM.clientsModal) {
        closeClientsModal();
      }
    });
  }

  // Separate PDF modal triggers
  if (DOM.exportSeparatePDFBtn) DOM.exportSeparatePDFBtn.addEventListener('click', openSeparatePDFModal);
  if (DOM.closeSeparatePdfModalBtn) DOM.closeSeparatePdfModalBtn.addEventListener('click', closeSeparatePDFModal);
  if (DOM.closeSeparatePdfModalFooterBtn) DOM.closeSeparatePdfModalFooterBtn.addEventListener('click', closeSeparatePDFModal);
  if (DOM.separatePdfDownloadAllBtn) DOM.separatePdfDownloadAllBtn.addEventListener('click', handleDownloadAllSeparatePDFs);

  if (DOM.separatePdfModal) {
    DOM.separatePdfModal.addEventListener('click', (e) => {
      if (e.target === DOM.separatePdfModal) {
        closeSeparatePDFModal();
      }
    });
  }



  // Org Admin Workspace & Return Buttons
  if (DOM.orgOpenWorkspaceBtn) DOM.orgOpenWorkspaceBtn.addEventListener('click', openOrgWorkspace);
  if (DOM.orgDashboardOpenWorkspaceBtn) DOM.orgDashboardOpenWorkspaceBtn.addEventListener('click', openOrgWorkspace);
  if (DOM.returnToOrgAdminBtn) DOM.returnToOrgAdminBtn.addEventListener('click', returnToOrgAdmin);

  // Upgrade to Organisation Modal Listeners
  if (DOM.upgradeToOrgHeaderBtn) DOM.upgradeToOrgHeaderBtn.addEventListener('click', openConvertToOrgModal);
  if (DOM.closeConvertToOrgModalBtn) DOM.closeConvertToOrgModalBtn.addEventListener('click', closeConvertToOrgModal);
  if (DOM.cancelConvertToOrgBtn) DOM.cancelConvertToOrgBtn.addEventListener('click', closeConvertToOrgModal);
  if (DOM.convertToOrgForm) DOM.convertToOrgForm.addEventListener('submit', handleConvertToOrgSubmit);
  if (DOM.toggleConvertOrgPassword && DOM.convertOrgPasswordInput) {
    DOM.toggleConvertOrgPassword.addEventListener('click', () => {
      togglePasswordVisibility(DOM.convertOrgPasswordInput, DOM.toggleConvertOrgPassword);
    });
  }

  // Theme switcher
  DOM.themeToggle.addEventListener('click', toggleTheme);
  if (DOM.authThemeToggle) DOM.authThemeToggle.addEventListener('click', toggleTheme);

  // Auth Slideshow Buttons
  if (DOM.authSlideBtn0) DOM.authSlideBtn0.addEventListener('click', () => { setAuthSlide(0); startAuthSlideshow(); });
  if (DOM.authSlideBtn1) DOM.authSlideBtn1.addEventListener('click', () => { setAuthSlide(1); startAuthSlideshow(); });
  if (DOM.authSlideBtn2) DOM.authSlideBtn2.addEventListener('click', () => { setAuthSlide(2); startAuthSlideshow(); });

  // Global inputs preset toggles (MM vs IN)
  document.querySelectorAll('#global-unit-selector .unit-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetUnit = btn.getAttribute('data-unit');
      applyGlobalUnitPreset(targetUnit);
    });
  });

  // Render static shapes and table presets once
  populateMaterialPresetsDropdown();
  renderShapeGrid();
  selectShape('round-bar');
});

// --- Authentication Controller (API Backend) ---
let authMode = 'login'; // login or signup
let authRole = 'user';  // user or org

function hideInitialLoader() {
  if (!DOM.appInitialLoader) return;
  DOM.appInitialLoader.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    DOM.appInitialLoader.classList.add('hidden');
  }, 300);
}

async function checkAuthenticationSession() {
  const loggedInUser = localStorage.getItem('metal-current-user');
  const loggedInUserType = localStorage.getItem('metal-current-user-type') || 'user';
  const loggedInOrg = localStorage.getItem('metal-current-org') || '';
  
  try {
    if (loggedInUser) {
      if (loggedInUserType === 'superadmin') {
        authenticateSuperAdmin();
      } else if (loggedInUserType === 'org') {
        // Authoritatively verify live approval status from database
        try {
          const res = await fetch(`/api/org/profile?orgName=${encodeURIComponent(loggedInUser)}`);
          const data = await res.json();
          const liveStatus = (res.ok && data.success && data.status) ? data.status : 'pending';
          localStorage.setItem('metal-current-org-status', liveStatus);
          authenticateOrg(loggedInUser, liveStatus);
        } catch (e) {
          const cachedStatus = localStorage.getItem('metal-current-org-status') || 'pending';
          authenticateOrg(loggedInUser, cachedStatus);
        }
      } else {
        authenticateUser(loggedInUser, loggedInOrg);
      }
    } else {
      showAuthOverlay(true);
      setAuthRole('user');
    }
  } finally {
    hideInitialLoader();
  }
}

// --- Full-Screen Auth Background Slideshow Controller ---
let currentAuthSlide = 0;
let authSlideTimer = null;

function setAuthSlide(index) {
  currentAuthSlide = (index + 3) % 3;
  for (let i = 0; i < 3; i++) {
    const slide = document.getElementById(`auth-slide-${i}`);
    const card = document.getElementById(`auth-topic-card-${i}`);
    const btn = document.getElementById(`auth-slide-btn-${i}`);

    if (slide) {
      if (i === currentAuthSlide) {
        slide.classList.remove('opacity-0');
        slide.classList.add('opacity-100');
      } else {
        slide.classList.remove('opacity-100');
        slide.classList.add('opacity-0');
      }
    }

    if (card) {
      if (i === currentAuthSlide) {
        card.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        card.classList.add('opacity-100', 'translate-y-0');
      } else {
        card.classList.add('hidden', 'opacity-0', 'translate-y-4');
        card.classList.remove('opacity-100', 'translate-y-0');
      }
    }

    if (btn) {
      const dot = btn.querySelector('span');
      if (i === currentAuthSlide) {
        btn.className = "auth-slide-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/25 border border-white/40 text-xs font-bold text-white transition-all";
        if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-cyan-400";
      } else {
        btn.className = "auth-slide-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white/80 transition-all";
        if (dot) dot.className = "w-1.5 h-1.5 rounded-full bg-white/40";
      }
    }
  }
  lucide.createIcons();
}

function startAuthSlideshow() {
  stopAuthSlideshow();
  setAuthSlide(currentAuthSlide);
  authSlideTimer = setInterval(() => {
    setAuthSlide(currentAuthSlide + 1);
  }, 6000);
}

function stopAuthSlideshow() {
  if (authSlideTimer) {
    clearInterval(authSlideTimer);
    authSlideTimer = null;
  }
}

function showAuthOverlay(show) {
  if (show) {
    DOM.authOverlay.classList.remove('hidden');
    DOM.appWrapper.classList.add('hidden');
    DOM.orgWrapper.classList.add('hidden');
    if (DOM.superadminWrapper) DOM.superadminWrapper.classList.add('hidden');
    startAuthSlideshow();
  } else {
    stopAuthSlideshow();
    DOM.authOverlay.classList.add('hidden');
    if (state.currentUserType === 'superadmin') {
      DOM.appWrapper.classList.add('hidden');
      DOM.orgWrapper.classList.add('hidden');
      if (DOM.superadminWrapper) DOM.superadminWrapper.classList.remove('hidden');
    } else if (state.currentUserType === 'org') {
      DOM.appWrapper.classList.add('hidden');
      DOM.orgWrapper.classList.remove('hidden');
      if (DOM.superadminWrapper) DOM.superadminWrapper.classList.add('hidden');
    } else {
      DOM.appWrapper.classList.remove('hidden');
      DOM.orgWrapper.classList.add('hidden');
      if (DOM.superadminWrapper) DOM.superadminWrapper.classList.add('hidden');
    }
  }
}

function toggleAuthMode(e) {
  if (e) e.preventDefault();
  DOM.authErrorMsg.classList.add('hidden');
  
  if (authMode === 'login') {
    authMode = 'signup';
    DOM.authTogglePrompt.textContent = "Already have an account?";
    DOM.authToggleBtn.textContent = "Sign In";
  } else {
    authMode = 'login';
    DOM.authTogglePrompt.textContent = "Don't have an account?";
    DOM.authToggleBtn.textContent = "Sign Up";
  }
  setAuthRole(authRole);
}

function setAuthRole(role) {
  authRole = role;
  DOM.authErrorMsg.classList.add('hidden');
  
  // Show Google Sign-in buttons in both User and Org Admin portals
  DOM.googleSigninDivider.classList.remove('hidden');
  DOM.googleSigninContainer.classList.remove('hidden');
  renderGoogleButton();

  // Always display the Sign In / Sign Up toggle prompt for both User and Org Admin
  DOM.authTogglePrompt.parentElement.classList.remove('hidden');
  DOM.authTogglePrompt.textContent = authMode === 'login' ? "Don't have an account?" : "Already have an account?";
  DOM.authToggleBtn.textContent = authMode === 'login' ? "Sign Up" : "Sign In";

  if (role === 'user') {
    DOM.roleUserBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-cyan-400 transition-all flex items-center justify-center gap-1.5";
    DOM.roleOrgBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";
    
    DOM.authUsernameContainer.classList.remove('hidden');
    DOM.authPasswordContainer.classList.remove('hidden');
    DOM.authUsername.setAttribute('required', 'true');
    DOM.authPassword.setAttribute('required', 'true');
    
    // Always hide org fields on employee login/signup (joined inside workspace instead)
    DOM.authOrgContainer.classList.add('hidden');
    DOM.authOrg.removeAttribute('required');
    DOM.authOrgPasswordContainer.classList.add('hidden');
    DOM.authOrgPassword.removeAttribute('required');
    
    DOM.authBtnText.textContent = authMode === 'login' ? "Sign In" : "Create Account";
    DOM.authTitle.textContent = authMode === 'login' ? "User Sign In" : "Create User Account";
    DOM.authSubtitle.textContent = authMode === 'login' ? "Sign in to access your metal calculations & quotations." : "Create your personal workspace account.";
  } else {
    DOM.roleOrgBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-cyan-400 transition-all flex items-center justify-center gap-1.5";
    DOM.roleUserBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";
    
    DOM.authUsernameContainer.classList.add('hidden');
    DOM.authPasswordContainer.classList.add('hidden');
    DOM.authUsername.removeAttribute('required');
    DOM.authPassword.removeAttribute('required');
    
    // Org Admin portal requires Organisation name and admin password
    DOM.authOrgContainer.classList.remove('hidden');
    DOM.authOrg.setAttribute('required', 'true');
    DOM.authOrgPasswordContainer.classList.remove('hidden');
    DOM.authOrgPassword.setAttribute('required', 'true');
    
    DOM.authTitle.textContent = authMode === 'login' ? "Organisation Portal Login" : "Register Organisation";
    DOM.authSubtitle.textContent = authMode === 'login' ? "Sign in to manage corporate control panel & rates." : "Register a corporate account for your company.";
    DOM.authBtnText.textContent = authMode === 'login' ? "Sign In as Admin" : "Register Organisation";
  }
  lucide.createIcons();
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  DOM.authErrorMsg.classList.add('hidden');
  
  const username = DOM.authUsername.value.trim().toLowerCase();
  const password = DOM.authPassword.value;
  const orgName = DOM.authOrg.value.trim();
  const orgPassword = DOM.authOrgPassword.value;

  try {
    if (authRole === 'user') {
      if (authMode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user', username, password })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          if (data.role === 'superadmin') {
            localStorage.setItem('metal-current-user', 'productionargus');
            localStorage.setItem('metal-current-user-type', 'superadmin');
            authenticateSuperAdmin();
            return;
          }

          if (data.role === 'org') {
            localStorage.setItem('metal-current-user', data.orgName);
            localStorage.setItem('metal-current-user-type', 'org');
            localStorage.setItem('metal-current-org-status', data.status || 'approved');
            authenticateOrg(data.orgName, data.status || 'approved');
          } else {
            localStorage.setItem('metal-current-user', data.username);
            localStorage.setItem('metal-current-user-type', 'user');
            localStorage.setItem('metal-current-org', data.orgName || '');
            authenticateUser(data.username, data.orgName || '');
          }
        } else {
          DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Invalid credentials.';
          DOM.authErrorMsg.classList.remove('hidden');
        }
      } else {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user', username, password })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          localStorage.setItem('metal-current-user', data.username);
          localStorage.setItem('metal-current-user-type', 'user');
          localStorage.setItem('metal-current-org', data.orgName || '');
          authenticateUser(data.username, data.orgName || '');
          // Show mandatory Access Code join modal immediately upon signup
          openJoinOrgModal();
        } else {
          DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Signup failed.';
          DOM.authErrorMsg.classList.remove('hidden');
        }
      }
    } else {
      // Organisation Role
      if (authMode === 'login') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'org', orgName, orgPassword })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          if (data.role === 'superadmin') {
            localStorage.setItem('metal-current-user', 'productionargus');
            localStorage.setItem('metal-current-user-type', 'superadmin');
            authenticateSuperAdmin();
            return;
          }

          if (data.role === 'org') {
            localStorage.setItem('metal-current-user', data.orgName);
            localStorage.setItem('metal-current-user-type', 'org');
            localStorage.setItem('metal-current-org-status', data.status || 'approved');
            authenticateOrg(data.orgName, data.status || 'approved');
          } else {
            localStorage.setItem('metal-current-user', data.username);
            localStorage.setItem('metal-current-user-type', 'user');
            localStorage.setItem('metal-current-org', data.orgName || '');
            authenticateUser(data.username, data.orgName || '');
          }
        } else {
          DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Invalid credentials.';
          DOM.authErrorMsg.classList.remove('hidden');
        }
      } else {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'org', orgName, orgPassword })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          localStorage.setItem('metal-current-user', data.orgName);
          localStorage.setItem('metal-current-user-type', 'org');
          localStorage.setItem('metal-current-org-status', data.status || 'pending');
          authenticateOrg(data.orgName, data.status || 'pending');
        } else {
          DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Organisation registration failed.';
          DOM.authErrorMsg.classList.remove('hidden');
        }
      }
    }
  } catch (err) {
    console.error('Auth Error:', err);
    DOM.authErrorMsg.querySelector('span').textContent = 'Server connection failed.';
    DOM.authErrorMsg.classList.remove('hidden');
  }
}

function togglePasswordVisibility(inputEl, btnEl) {
  if (!inputEl) return;
  const isPassword = inputEl.getAttribute('type') === 'password';
  inputEl.setAttribute('type', isPassword ? 'text' : 'password');
  if (btnEl) {
    const iconName = isPassword ? 'eye-off' : 'eye';
    btnEl.innerHTML = `<i data-lucide="${iconName}" class="w-4.5 h-4.5"></i>`;
    lucide.createIcons();
  }
}

function authenticateUser(username, orgName) {
  state.currentUser = username;
  state.currentUserType = 'user';
  state.userOrg = orgName || '';
  
  DOM.userDisplayUsername.textContent = `@${username}`;
  
  if (DOM.upgradeToOrgHeaderBtn) DOM.upgradeToOrgHeaderBtn.classList.remove('hidden');
  if (DOM.returnToOrgAdminBtn) DOM.returnToOrgAdminBtn.classList.add('hidden');

  if (!orgName) {
    DOM.userDisplayOrg.textContent = 'Personal Account (No Org)';
    if (DOM.joinOrgBanner) DOM.joinOrgBanner.classList.remove('hidden');
  } else {
    DOM.userDisplayOrg.textContent = orgName;
    if (DOM.joinOrgBanner) DOM.joinOrgBanner.classList.add('hidden');
  }

  loadUserData(username);
  showAuthOverlay(false);
  resetCalculatorForm();
  checkLiveTrialStatus('user', username);
  const savedTab = localStorage.getItem('metal-active-tab') || 'products';
  switchEmployeeView(savedTab);
  lucide.createIcons();
}

function authenticateOrg(orgName, status = 'pending') {
  state.currentUser = orgName;
  state.currentUserType = 'org';
  state.userOrg = orgName;
  try {
    localStorage.setItem('metal-current-org', orgName);
    localStorage.setItem('metal-current-org-status', status);
  } catch (e) {}
  
  if (DOM.orgProfileNavName) DOM.orgProfileNavName.textContent = orgName;
  if (DOM.upgradeToOrgHeaderBtn) DOM.upgradeToOrgHeaderBtn.classList.add('hidden');
  
  showAuthOverlay(false);

  // If temporary Google admin name, show the initial configuration form
  if (orgName && orgName.startsWith('temp-org-')) {
    DOM.orgDisplayTitle.textContent = 'Setup Pending';
    if (DOM.orgSetupView) DOM.orgSetupView.classList.remove('hidden');
    if (DOM.orgPendingView) DOM.orgPendingView.classList.add('hidden');
    if (DOM.orgDashboardContent) DOM.orgDashboardContent.classList.add('hidden');
    
    if (DOM.orgSetupName) DOM.orgSetupName.value = '';
    if (DOM.orgSetupPassword) DOM.orgSetupPassword.value = '';
    if (DOM.orgSetupError) DOM.orgSetupError.classList.add('hidden');
  } else if (status === 'approved') {
    // ONLY approved organisations can access the Corporate Control Panel!
    DOM.orgDisplayTitle.textContent = orgName;
    if (DOM.orgPendingView) DOM.orgPendingView.classList.add('hidden');
    if (DOM.orgSetupView) DOM.orgSetupView.classList.add('hidden');
    if (DOM.orgDashboardContent) DOM.orgDashboardContent.classList.remove('hidden');
    
    renderOrgDashboard();
    setOrgTab('users');
    checkLiveTrialStatus('org', orgName);
  } else {
    // For all pending / unapproved states, STRICTLY lock dashboard and show pending view
    DOM.orgDisplayTitle.textContent = 'Approval Pending';
    if (DOM.orgPendingView) {
      DOM.orgPendingView.classList.remove('hidden');
      if (DOM.orgPendingDisplayName) DOM.orgPendingDisplayName.textContent = orgName;
    }
    if (DOM.orgSetupView) DOM.orgSetupView.classList.add('hidden');
    if (DOM.orgDashboardContent) DOM.orgDashboardContent.classList.add('hidden');
  }
  
  lucide.createIcons();
}

// --- In-App Upgrade to Organisation Account Helpers ---
function openConvertToOrgModal() {
  if (!DOM.convertToOrgModal) return;
  if (DOM.convertToOrgErrorMsg) DOM.convertToOrgErrorMsg.classList.add('hidden');
  if (DOM.convertOrgNameInput) DOM.convertOrgNameInput.value = '';
  if (DOM.convertOrgPasswordInput) DOM.convertOrgPasswordInput.value = '';
  
  if (DOM.convertOrgAccessCodeInput) {
    const userSeed = (state.currentUser || 'ORG').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    DOM.convertOrgAccessCodeInput.value = `${userSeed}${Math.floor(10 + Math.random() * 90)}`;
  }
  
  DOM.convertToOrgModal.classList.remove('hidden');
  lucide.createIcons();
}

function closeConvertToOrgModal() {
  if (!DOM.convertToOrgModal) return;
  DOM.convertToOrgModal.classList.add('hidden');
}

async function handleConvertToOrgSubmit(e) {
  e.preventDefault();
  if (DOM.convertToOrgErrorMsg) DOM.convertToOrgErrorMsg.classList.add('hidden');

  const newOrgName = DOM.convertOrgNameInput ? DOM.convertOrgNameInput.value.trim() : '';
  const newOrgPassword = DOM.convertOrgPasswordInput ? DOM.convertOrgPasswordInput.value : '';
  const customAccessCode = DOM.convertOrgAccessCodeInput ? DOM.convertOrgAccessCodeInput.value.trim() : '';

  if (!newOrgName) {
    if (DOM.convertToOrgErrorMsg) {
      DOM.convertToOrgErrorMsg.querySelector('span').textContent = 'Please enter a valid Organisation Name.';
      DOM.convertToOrgErrorMsg.classList.remove('hidden');
    }
    return;
  }

  const submitBtn = DOM.submitConvertToOrgBtn;
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Upgrading...`;
    lucide.createIcons();
  }

  try {
    const res = await fetch('/api/user/convert-to-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.currentUser,
        newOrgName,
        newOrgPassword,
        customAccessCode
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      if (DOM.convertToOrgErrorMsg) {
        DOM.convertToOrgErrorMsg.querySelector('span').textContent = data.error || 'Failed to upgrade account.';
        DOM.convertToOrgErrorMsg.classList.remove('hidden');
      }
      return;
    }

    // Success! Update local storage credentials to Org
    closeConvertToOrgModal();
    localStorage.setItem('metal-current-user', data.orgName);
    localStorage.setItem('metal-current-user-type', 'org');
    localStorage.setItem('metal-current-org-status', 'approved');
    localStorage.setItem('metal-current-org', data.orgName);

    authenticateOrg(data.orgName, 'approved');

    showToast({
      title: 'Organisation Created!',
      message: `Your account is now upgraded to "${data.orgName}". Access Code: ${data.accessCode}`,
      type: 'success',
      duration: 6000
    });
  } catch (err) {
    console.error('Account conversion error:', err);
    if (DOM.convertToOrgErrorMsg) {
      DOM.convertToOrgErrorMsg.querySelector('span').textContent = 'Server connection failed.';
      DOM.convertToOrgErrorMsg.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      lucide.createIcons();
    }
  }
}

// --- Org Admin Workspace Navigation (Dual Mode Access) ---
function openOrgWorkspace() {
  if (state.currentUserType !== 'org') return;
  state.userOrg = state.currentUser;
  try {
    localStorage.setItem('metal-current-org', state.currentUser);
  } catch (e) {}

  DOM.orgWrapper.classList.add('hidden');
  DOM.appWrapper.classList.remove('hidden');
  
  if (DOM.returnToOrgAdminBtn) DOM.returnToOrgAdminBtn.classList.remove('hidden');
  if (DOM.upgradeToOrgHeaderBtn) DOM.upgradeToOrgHeaderBtn.classList.add('hidden');
  
  DOM.userDisplayOrg.textContent = state.currentUser;
  DOM.userDisplayUsername.textContent = `Admin (${state.currentUser})`;
  
  if (DOM.joinOrgBanner) DOM.joinOrgBanner.classList.add('hidden');
  
  loadUserData(state.currentUser);
  resetCalculatorForm();
  const savedTab = localStorage.getItem('metal-active-tab') || 'products';
  switchEmployeeView(savedTab);
  lucide.createIcons();

  showToast({
    title: 'Organisation Calculator Workspace',
    message: `Active as ${state.currentUser}. You have full access to calculate, build products & export quotes!`,
    type: 'info',
    duration: 4000
  });
}

function returnToOrgAdmin() {
  if (state.currentUserType !== 'org') return;
  DOM.appWrapper.classList.add('hidden');
  DOM.orgWrapper.classList.remove('hidden');
  renderOrgDashboard();
  lucide.createIcons();
}

// --- 60-Day Trial Controller & Contact Modal ---
function openArgusContactModal() {
  const modal = DOM.argusContactModal || document.getElementById('argus-contact-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeArgusContactModal() {
  const modal = DOM.argusContactModal || document.getElementById('argus-contact-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function updateTrialUI(trial) {
  if (!trial) return;

  if (trial.isLifetime || trial.trialEnabled === false) {
    // Lifetime access - remove all trial banners and unblock
    if (DOM.trialStatusBanner) DOM.trialStatusBanner.classList.add('hidden');
    if (DOM.trialStatusBannerOrg) DOM.trialStatusBannerOrg.classList.add('hidden');
    if (DOM.trialExpiredModal) DOM.trialExpiredModal.classList.add('hidden');
    return;
  }

  if (trial.isExpired) {
    // Expired - lock workspace with full-screen blocking modal
    if (DOM.trialStatusBanner) DOM.trialStatusBanner.classList.add('hidden');
    if (DOM.trialStatusBannerOrg) DOM.trialStatusBannerOrg.classList.add('hidden');
    if (DOM.trialExpiredModal) {
      DOM.trialExpiredModal.classList.remove('hidden');
      lucide.createIcons();
    }
    return;
  }

  // Active Trial: Hide expired modal, show remaining days banner
  if (DOM.trialExpiredModal) DOM.trialExpiredModal.classList.add('hidden');

  const days = trial.daysRemaining !== undefined ? trial.daysRemaining : 60;
  
  if (state.currentUserType === 'org') {
    if (DOM.trialStatusBannerOrg) {
      DOM.trialStatusBannerOrg.classList.remove('hidden');
      if (DOM.trialBannerOrgDays) DOM.trialBannerOrgDays.textContent = days;
    }
  } else if (state.currentUserType === 'user') {
    if (DOM.trialStatusBanner) {
      DOM.trialStatusBanner.classList.remove('hidden');
      if (DOM.trialBannerDays) DOM.trialBannerDays.textContent = days;
    }
  }
}

async function checkLiveTrialStatus(type, id) {
  try {
    const query = type === 'org' ? `orgName=${encodeURIComponent(id)}` : `username=${encodeURIComponent(id)}`;
    const res = await fetch(`/api/trial/status?${query}`);
    const data = await res.json();
    if (res.ok && data.success && data.trial) {
      updateTrialUI(data.trial);
    }
  } catch (err) {
    console.error('Failed to check trial status:', err);
  }
}

async function checkPendingOrgStatus() {
  const orgName = state.currentUser;
  if (!orgName) return;
  try {
    const res = await fetch(`/api/org/profile?orgName=${encodeURIComponent(orgName)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.status === 'approved') {
        localStorage.setItem('metal-current-org-status', 'approved');
        authenticateOrg(orgName, 'approved');
      } else {
        alert('Your organisation approval request is still pending review.');
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// --- Super Admin Controller ---
let superAdminOrgsData = [];
let superAdminUsersData = [];
let superAdminActiveTab = 'all';

function authenticateSuperAdmin() {
  const storedUser = localStorage.getItem('metal-current-user') || 'productionargus';
  state.currentUser = storedUser;
  state.currentUserType = 'superadmin';
  if (DOM.superadminNavUsername) DOM.superadminNavUsername.textContent = `@${storedUser}`;
  showAuthOverlay(false);
  loadSuperAdminOrgs();
  loadSuperAdminProfile();
  lucide.createIcons();
}

async function loadSuperAdminProfile() {
  try {
    const res = await fetch('/api/superadmin/profile');
    const data = await res.json();
    if (res.ok && data.success) {
      state.currentUser = data.username;
      localStorage.setItem('metal-current-user', data.username);
      if (DOM.superadminNavUsername) DOM.superadminNavUsername.textContent = `@${data.username}`;
    }
  } catch (err) {
    console.error(err);
  }
}

function openSuperAdminProfileModal() {
  if (!DOM.superadminProfileModal) return;
  if (DOM.superadminEditUsername) DOM.superadminEditUsername.value = state.currentUser || 'productionargus';
  if (DOM.superadminCurrentPassword) DOM.superadminCurrentPassword.value = '';
  if (DOM.superadminNewPassword) DOM.superadminNewPassword.value = '';
  if (DOM.superadminConfirmPassword) DOM.superadminConfirmPassword.value = '';
  if (DOM.superadminProfileError) DOM.superadminProfileError.classList.add('hidden');
  if (DOM.superadminProfileSuccess) DOM.superadminProfileSuccess.classList.add('hidden');
  DOM.superadminProfileModal.classList.remove('hidden');
  if (DOM.superadminCurrentPassword) DOM.superadminCurrentPassword.focus();
  lucide.createIcons();
}

function closeSuperAdminProfileModal() {
  if (!DOM.superadminProfileModal) return;
  DOM.superadminProfileModal.classList.add('hidden');
}

async function handleSaveSuperAdminProfileSubmit(e) {
  e.preventDefault();
  if (DOM.superadminProfileError) DOM.superadminProfileError.classList.add('hidden');
  if (DOM.superadminProfileSuccess) DOM.superadminProfileSuccess.classList.add('hidden');

  const newUsername = DOM.superadminEditUsername.value.trim().toLowerCase();
  const currentPassword = DOM.superadminCurrentPassword.value;
  const newPassword = DOM.superadminNewPassword.value;
  const confirmPassword = DOM.superadminConfirmPassword.value;

  if (newPassword && newPassword !== confirmPassword) {
    if (DOM.superadminProfileError) {
      DOM.superadminProfileError.textContent = 'New passwords do not match.';
      DOM.superadminProfileError.classList.remove('hidden');
    }
    return;
  }

  try {
    const res = await fetch('/api/superadmin/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        newUsername,
        newPassword: newPassword || undefined
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      state.currentUser = data.username;
      localStorage.setItem('metal-current-user', data.username);
      if (DOM.superadminNavUsername) DOM.superadminNavUsername.textContent = `@${data.username}`;
      if (DOM.superadminProfileSuccess) {
        DOM.superadminProfileSuccess.textContent = data.message || 'Settings updated successfully!';
        DOM.superadminProfileSuccess.classList.remove('hidden');
      }
      setTimeout(() => {
        closeSuperAdminProfileModal();
      }, 1200);
    } else {
      if (DOM.superadminProfileError) {
        DOM.superadminProfileError.textContent = data.error || 'Failed to update settings.';
        DOM.superadminProfileError.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error(err);
    if (DOM.superadminProfileError) {
      DOM.superadminProfileError.textContent = 'Server connection failed.';
      DOM.superadminProfileError.classList.remove('hidden');
    }
  }
}

async function loadSuperAdminOrgs() {
  try {
    const res = await fetch('/api/superadmin/orgs');
    const data = await res.json();
    if (res.ok && data.success) {
      superAdminOrgsData = data.orgs || [];
      if (DOM.superadminStatPending) DOM.superadminStatPending.textContent = data.metrics.pendingOrgs || 0;
      if (DOM.superadminStatApproved) DOM.superadminStatApproved.textContent = data.metrics.approvedOrgs || 0;
      if (DOM.superadminStatUsers) DOM.superadminStatUsers.textContent = data.metrics.totalUsers || 0;
      if (DOM.superadminStatQuotes) DOM.superadminStatQuotes.textContent = data.metrics.totalQuotes || 0;

      if (superAdminActiveTab === 'users') {
        loadSuperAdminUsers();
      } else {
        renderSuperAdminOrgs();
      }
    }
  } catch (err) {
    console.error('Super Admin fetch error:', err);
  }
}

async function loadSuperAdminUsers() {
  try {
    const res = await fetch('/api/superadmin/users');
    const data = await res.json();
    if (res.ok && data.success) {
      superAdminUsersData = data.users || [];
      renderSuperAdminUsers();
    }
  } catch (err) {
    console.error('Super Admin users fetch error:', err);
  }
}

function setSuperAdminTab(tab) {
  superAdminActiveTab = tab;
  document.querySelectorAll('.superadmin-tab-btn').forEach(btn => {
    btn.className = 'superadmin-tab-btn px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all';
  });
  const activeBtn = document.getElementById(`superadmin-tab-${tab}`);
  if (activeBtn) {
    activeBtn.className = 'superadmin-tab-btn px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white transition-all font-bold';
  }

  if (tab === 'users') {
    if (DOM.superadminColName) DOM.superadminColName.textContent = 'User Name / Email';
    if (DOM.superadminColCode) DOM.superadminColCode.textContent = 'Linked Organisation';
    if (DOM.superadminColUsers) DOM.superadminColUsers.classList.add('hidden');
    if (DOM.superadminColStatus) DOM.superadminColStatus.textContent = 'Account Role';
    loadSuperAdminUsers();
  } else {
    if (DOM.superadminColName) DOM.superadminColName.textContent = 'Organisation Name';
    if (DOM.superadminColCode) DOM.superadminColCode.textContent = 'Access Code';
    if (DOM.superadminColUsers) DOM.superadminColUsers.classList.remove('hidden');
    if (DOM.superadminColStatus) DOM.superadminColStatus.textContent = 'Status';
    renderSuperAdminOrgs();
  }
}

function filterSuperAdminOrgs() {
  if (superAdminActiveTab === 'users') {
    renderSuperAdminUsers();
  } else {
    renderSuperAdminOrgs();
  }
}

function renderSuperAdminOrgs() {
  if (!DOM.superadminOrgsTableBody) return;
  DOM.superadminOrgsTableBody.innerHTML = '';

  const searchVal = DOM.superadminSearchInput ? DOM.superadminSearchInput.value.trim().toLowerCase() : '';
  let filtered = superAdminOrgsData.filter(org => {
    const matchesSearch = !searchVal || org.name.toLowerCase().includes(searchVal) || (org.accessCode && org.accessCode.toLowerCase().includes(searchVal));
    const matchesTab = superAdminActiveTab === 'all' || org.status === superAdminActiveTab;
    return matchesSearch && matchesTab;
  });

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" class="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">No organisation records found matching current criteria.</td>`;
    DOM.superadminOrgsTableBody.appendChild(tr);
    return;
  }

  filtered.forEach(org => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60';

    let badgeHTML = '';
    if (org.status === 'pending') {
      badgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"><i data-lucide="clock" class="w-3 h-3"></i> Pending</span>`;
    } else if (org.status === 'approved') {
      badgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"><i data-lucide="check-circle" class="w-3 h-3"></i> Approved</span>`;
    } else {
      badgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"><i data-lucide="x-circle" class="w-3 h-3"></i> Rejected</span>`;
    }

    let trialBadgeHTML = '';
    if (org.trial && (org.trial.isLifetime || org.trial.trialEnabled === false)) {
      trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"><i data-lucide="shield-check" class="w-3 h-3"></i> Lifetime</span>`;
    } else if (org.trial && org.trial.isExpired) {
      trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Expired</span>`;
    } else {
      const d = org.trial ? org.trial.daysRemaining : 60;
      trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40"><i data-lucide="clock" class="w-3 h-3"></i> ${d}d left</span>`;
    }

    const reqDateStr = org.requestedAt ? new Date(org.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---';

    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i data-lucide="building" class="w-4 h-4 text-brand-500"></i>
          ${escapeHTML(org.name)}
        </div>
        ${org.email ? `<span class="text-[10px] text-slate-400 dark:text-slate-500">${escapeHTML(org.email)}</span>` : ''}
      </td>
      <td class="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
        ${org.accessCode ? escapeHTML(org.accessCode) : '<span class="text-slate-400">Not Assigned</span>'}
      </td>
      <td class="py-3 px-4 text-center">${trialBadgeHTML}</td>
      <td class="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">${org.userCount || 0}</td>
      <td class="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">${org.quoteCount || 0}</td>
      <td class="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">${reqDateStr}</td>
      <td class="py-3 px-4 text-center">${badgeHTML}</td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-1.5 flex-wrap">
          ${org.status !== 'approved' ? `
            <button type="button" class="btn-approve-org px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1" data-org-name="${escapeHTML(org.name)}">
              <i data-lucide="check" class="w-3 h-3"></i> Approve
            </button>
          ` : ''}
          ${org.status !== 'rejected' ? `
            <button type="button" class="btn-reject-org px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1" data-org-name="${escapeHTML(org.name)}">
              <i data-lucide="x" class="w-3 h-3"></i> Reject
            </button>
          ` : ''}
          ${(org.trial && (org.trial.isLifetime || org.trial.trialEnabled === false)) ? `
            <button type="button" class="btn-trial-enable px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all active:scale-95" data-org-name="${escapeHTML(org.name)}" title="Set 60-day trial mode">
              Set 60d Trial
            </button>
          ` : `
            <button type="button" class="btn-trial-lifetime px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1" data-org-name="${escapeHTML(org.name)}" title="Remove trial constraint and grant permanent lifetime access">
              <i data-lucide="zap" class="w-3 h-3"></i> Lifetime
            </button>
            <button type="button" class="btn-trial-reset px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95" data-org-name="${escapeHTML(org.name)}" title="Reset 60 days trial from today">
              Reset 60d
            </button>
          `}
        </div>
      </td>
    `;

    const approveBtn = tr.querySelector('.btn-approve-org');
    if (approveBtn) approveBtn.addEventListener('click', () => handleSuperAdminAction(org.name, 'approve'));

    const rejectBtn = tr.querySelector('.btn-reject-org');
    if (rejectBtn) rejectBtn.addEventListener('click', () => handleSuperAdminAction(org.name, 'reject'));

    const lifetimeBtn = tr.querySelector('.btn-trial-lifetime');
    if (lifetimeBtn) lifetimeBtn.addEventListener('click', () => handleUpdateTrial('org', org.name, 'remove_trial'));

    const resetBtn = tr.querySelector('.btn-trial-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => handleUpdateTrial('org', org.name, 'reset_trial'));

    const enableBtn = tr.querySelector('.btn-trial-enable');
    if (enableBtn) enableBtn.addEventListener('click', () => handleUpdateTrial('org', org.name, 'enable_trial'));

    DOM.superadminOrgsTableBody.appendChild(tr);
  });

  lucide.createIcons();
}

function renderSuperAdminUsers() {
  if (!DOM.superadminOrgsTableBody) return;
  DOM.superadminOrgsTableBody.innerHTML = '';

  const searchVal = DOM.superadminSearchInput ? DOM.superadminSearchInput.value.trim().toLowerCase() : '';
  let filtered = superAdminUsersData.filter(u => {
    return !searchVal || u.username.toLowerCase().includes(searchVal) || (u.email && u.email.toLowerCase().includes(searchVal)) || (u.orgName && u.orgName.toLowerCase().includes(searchVal));
  });

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" class="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-semibold">No standard user records found matching criteria.</td>`;
    DOM.superadminOrgsTableBody.appendChild(tr);
    return;
  }

  filtered.forEach(u => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60';

    let trialBadgeHTML = '';
    if (u.trial && (u.trial.isLifetime || u.trial.trialEnabled === false)) {
      if (u.trial.inheritedFromOrg) {
        trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40" title="Inherited from ${escapeHTML(u.trial.orgName || u.orgName)}"><i data-lucide="shield-check" class="w-3 h-3"></i> Org Lifetime</span>`;
      } else {
        trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"><i data-lucide="shield-check" class="w-3 h-3"></i> Lifetime</span>`;
      }
    } else if (u.trial && u.trial.isExpired) {
      trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Expired</span>`;
    } else {
      const d = u.trial ? u.trial.daysRemaining : 60;
      trialBadgeHTML = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40"><i data-lucide="clock" class="w-3 h-3"></i> ${d}d left</span>`;
    }

    const createdDateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---';

    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i data-lucide="user" class="w-4 h-4 text-brand-500"></i>
          @${escapeHTML(u.username)}
        </div>
        ${u.email ? `<span class="text-[10px] text-slate-400 dark:text-slate-500">${escapeHTML(u.email)}</span>` : ''}
      </td>
      <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
        ${u.orgName ? escapeHTML(u.orgName) : '<span class="text-slate-400 italic">Personal Account</span>'}
      </td>
      <td class="py-3 px-4 text-center">${trialBadgeHTML}</td>
      <td class="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200 hidden"></td>
      <td class="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">${u.quoteCount || 0}</td>
      <td class="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">${createdDateStr}</td>
      <td class="py-3 px-4 text-center"><span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Standard</span></td>
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-1.5 flex-wrap">
          ${(u.trial && (u.trial.isLifetime || u.trial.trialEnabled === false)) ? `
            <button type="button" class="btn-user-trial-enable px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-all active:scale-95" data-username="${escapeHTML(u.username)}" title="Set 60-day trial mode">
              Set 60d Trial
            </button>
          ` : `
            <button type="button" class="btn-user-trial-lifetime px-2.5 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1" data-username="${escapeHTML(u.username)}" title="Remove trial and grant lifetime access">
              <i data-lucide="zap" class="w-3 h-3"></i> Lifetime
            </button>
            <button type="button" class="btn-user-trial-reset px-2 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95" data-username="${escapeHTML(u.username)}" title="Reset 60 days trial from today">
              Reset 60d
            </button>
          `}
        </div>
      </td>
    `;

    const lifetimeBtn = tr.querySelector('.btn-user-trial-lifetime');
    if (lifetimeBtn) lifetimeBtn.addEventListener('click', () => handleUpdateTrial('user', u.username, 'remove_trial'));

    const resetBtn = tr.querySelector('.btn-user-trial-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => handleUpdateTrial('user', u.username, 'reset_trial'));

    const enableBtn = tr.querySelector('.btn-user-trial-enable');
    if (enableBtn) enableBtn.addEventListener('click', () => handleUpdateTrial('user', u.username, 'enable_trial'));

    DOM.superadminOrgsTableBody.appendChild(tr);
  });

  lucide.createIcons();
}

async function handleUpdateTrial(targetType, targetId, action) {
  try {
    const res = await fetch('/api/superadmin/trial/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, action })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (superAdminActiveTab === 'users') {
        loadSuperAdminUsers();
      } else {
        loadSuperAdminOrgs();
      }
    } else {
      alert(data.error || 'Failed to update trial status.');
    }
  } catch (err) {
    console.error('Trial update error:', err);
    alert('Server connection failed.');
  }
}

async function handleSuperAdminAction(orgName, action) {
  try {
    const res = await fetch('/api/superadmin/approve-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName, action })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      loadSuperAdminOrgs();
    } else {
      alert(data.error || 'Failed to process action.');
    }
  } catch (err) {
    console.error('Super Admin action error:', err);
    alert('Server connection failed.');
  }
}

// Join Org Modal Handlers
function openJoinOrgModal() {
  if (!DOM.joinOrgModal) return;
  if (DOM.joinOrgAccessCode) DOM.joinOrgAccessCode.value = '';
  if (DOM.joinByCodeError) {
    DOM.joinByCodeError.textContent = '';
    DOM.joinByCodeError.classList.add('hidden');
  }
  DOM.joinOrgModal.classList.remove('hidden');
  if (DOM.joinOrgAccessCode) DOM.joinOrgAccessCode.focus();
}

function closeJoinOrgModal() {
  if (DOM.joinOrgModal) DOM.joinOrgModal.classList.add('hidden');
}

async function handleJoinByCodeSubmit(e) {
  e.preventDefault();
  if (!DOM.joinOrgAccessCode) return;
  const accessCode = DOM.joinOrgAccessCode.value.trim();
  if (!accessCode) return;

  if (DOM.joinByCodeError) DOM.joinByCodeError.classList.add('hidden');

  try {
    const response = await fetch('/api/user/join-by-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.currentUser,
        accessCode: accessCode
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      localStorage.setItem('metal-current-org', data.orgName);
      state.userOrg = data.orgName;
      DOM.userDisplayOrg.textContent = data.orgName;
      if (DOM.joinOrgBanner) DOM.joinOrgBanner.classList.add('hidden');
      closeJoinOrgModal();
      loadUserData(state.currentUser);
      renderCompanyDropdown();
      if (data.trial) {
        updateTrialUI(data.trial);
      } else {
        checkLiveTrialStatus('user', state.currentUser);
      }
    } else {
      if (DOM.joinByCodeError) {
        DOM.joinByCodeError.textContent = data.error || 'Invalid Access Code.';
        DOM.joinByCodeError.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Join Org Error:', err);
    if (DOM.joinByCodeError) {
      DOM.joinByCodeError.textContent = 'Server connection failed.';
      DOM.joinByCodeError.classList.remove('hidden');
    }
  }
}

// Org Profile & Access Code Modal Handlers
let orgProfileCurrentOrgName = '';

async function openOrgProfileModal() {
  if (!DOM.orgProfileModal) return;
  if (DOM.orgProfileError) DOM.orgProfileError.classList.add('hidden');
  if (DOM.orgProfileSuccess) DOM.orgProfileSuccess.classList.add('hidden');

  const currentOrg = state.currentUser;
  orgProfileCurrentOrgName = currentOrg;
  if (DOM.orgProfileNameInput) DOM.orgProfileNameInput.value = currentOrg;

  try {
    const res = await fetch(`/api/org/profile?orgName=${encodeURIComponent(currentOrg)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      if (DOM.orgProfileNameInput) DOM.orgProfileNameInput.value = data.orgName || currentOrg;
      if (DOM.orgProfileAccessCodeInput) DOM.orgProfileAccessCodeInput.value = data.accessCode || '';
    }
  } catch (err) {
    console.error('Failed to load org profile:', err);
  }

  DOM.orgProfileModal.classList.remove('hidden');
  lucide.createIcons();
}

function closeOrgProfileModal() {
  if (DOM.orgProfileModal) DOM.orgProfileModal.classList.add('hidden');
}

function generateRandomAccessCode() {
  if (!DOM.orgProfileAccessCodeInput) return;
  const orgName = (DOM.orgProfileNameInput ? DOM.orgProfileNameInput.value : state.currentUser) || 'ORG';
  const prefix = orgName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'ORG';
  const rand = Math.floor(1000 + Math.random() * 9000);
  DOM.orgProfileAccessCodeInput.value = `${prefix}-${rand}`;
}

async function copyAccessCodeToClipboard() {
  if (!DOM.orgProfileAccessCodeInput) return;
  const code = DOM.orgProfileAccessCodeInput.value.trim();
  if (!code) return;

  try {
    await navigator.clipboard.writeText(code);
    if (DOM.copyAccessCodeIcon) {
      DOM.copyAccessCodeIcon.setAttribute('data-lucide', 'check');
      lucide.createIcons();
      setTimeout(() => {
        if (DOM.copyAccessCodeIcon) {
          DOM.copyAccessCodeIcon.setAttribute('data-lucide', 'copy');
          lucide.createIcons();
        }
      }, 2000);
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
  }
}

async function handleSaveOrgProfileSubmit(e) {
  e.preventDefault();
  if (DOM.orgProfileError) DOM.orgProfileError.classList.add('hidden');
  if (DOM.orgProfileSuccess) DOM.orgProfileSuccess.classList.add('hidden');

  const newOrgName = DOM.orgProfileNameInput ? DOM.orgProfileNameInput.value.trim() : '';
  const accessCode = DOM.orgProfileAccessCodeInput ? DOM.orgProfileAccessCodeInput.value.trim() : '';

  if (!newOrgName) {
    if (DOM.orgProfileError) {
      DOM.orgProfileError.textContent = 'Organisation Name cannot be empty.';
      DOM.orgProfileError.classList.remove('hidden');
    }
    return;
  }

  try {
    const res = await fetch('/api/org/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentOrgName: orgProfileCurrentOrgName || state.currentUser,
        newOrgName: newOrgName,
        accessCode: accessCode
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      state.currentUser = data.orgName;
      orgProfileCurrentOrgName = data.orgName;
      localStorage.setItem('metal-current-user', data.orgName);
      if (DOM.orgProfileNavName) DOM.orgProfileNavName.textContent = data.orgName;
      if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = data.orgName;
      
      if (DOM.orgProfileSuccess) {
        DOM.orgProfileSuccess.textContent = 'Organisation profile & access code updated successfully!';
        DOM.orgProfileSuccess.classList.remove('hidden');
      }

      renderOrgDashboard();
      setTimeout(() => {
        closeOrgProfileModal();
      }, 1200);
    } else {
      if (DOM.orgProfileError) {
        DOM.orgProfileError.textContent = data.error || 'Failed to update profile.';
        DOM.orgProfileError.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Save org profile error:', err);
    if (DOM.orgProfileError) {
      DOM.orgProfileError.textContent = 'Server connection failed.';
      DOM.orgProfileError.classList.remove('hidden');
    }
  }
}

function handleLogout() {
  localStorage.removeItem('metal-current-user');
  localStorage.removeItem('metal-current-user-type');
  localStorage.removeItem('metal-current-org');
  localStorage.removeItem('metal-current-org-status');
  localStorage.removeItem('metal-active-tab');
  localStorage.removeItem('metal-active-org-tab');
  sessionStorage.clear();
  
  state.currentUser = null;
  state.currentUserType = 'user';
  state.selectedCompany = '';
  state.companies = [];
  state.bom = [];
  state.processes = [];
  state.miscItems = [];
  state.processRates = [];
  state.clients = [];
  state.selectedClients = [];
  state.customerName = '';
  state.customerAddress = '';
  state.customerGSTIN = '';
  state.profitPercentage = 0;
  
  if (DOM.authUsername) DOM.authUsername.value = '';
  if (DOM.authPassword) DOM.authPassword.value = '';
  if (DOM.authOrg) DOM.authOrg.value = '';
  if (DOM.authOrgPassword) DOM.authOrgPassword.value = '';
  if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = '---';
  if (DOM.userDisplayUsername) DOM.userDisplayUsername.textContent = '---';
  
  showAuthOverlay(true);
  setAuthRole('user');
}

function setOrgTab(tab) {
  try {
    localStorage.setItem('metal-active-org-tab', tab);
  } catch (e) {}

  const activeClass = "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400 py-4 px-1 text-sm font-semibold flex items-center gap-2";
  const inactiveClass = "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-4 px-1 text-sm font-semibold flex items-center gap-2";
  
  if (DOM.tabUsersBtn) DOM.tabUsersBtn.className = tab === 'users' ? activeClass : inactiveClass;
  if (DOM.tabOrgProductsBtn) DOM.tabOrgProductsBtn.className = tab === 'products' ? activeClass : inactiveClass;
  if (DOM.tabQuotesBtn) DOM.tabQuotesBtn.className = tab === 'quotes' ? activeClass : inactiveClass;
  if (DOM.tabSettingsBtn) DOM.tabSettingsBtn.className = tab === 'settings' ? activeClass : inactiveClass;
  
  if (DOM.tabUsersContent) DOM.tabUsersContent.classList.toggle('hidden', tab !== 'users');
  if (DOM.tabOrgProductsContent) DOM.tabOrgProductsContent.classList.toggle('hidden', tab !== 'products');
  if (DOM.tabQuotesContent) DOM.tabQuotesContent.classList.toggle('hidden', tab !== 'quotes');
  if (DOM.tabSettingsContent) DOM.tabSettingsContent.classList.toggle('hidden', tab !== 'settings');

  if (tab === 'settings') {
    if (DOM.orgSettingsName) DOM.orgSettingsName.value = state.currentUser || '';
    if (DOM.orgSettingsPassword) DOM.orgSettingsPassword.value = '';
    if (DOM.orgSettingsSuccess) DOM.orgSettingsSuccess.classList.add('hidden');
    if (DOM.orgSettingsError) DOM.orgSettingsError.classList.add('hidden');
  }
}

async function renderOrgDashboard() {
  if (state.currentUserType !== 'org') return;
  const orgName = state.currentUser;

  const savedOrgTab = localStorage.getItem('metal-active-org-tab') || 'users';
  setOrgTab(savedOrgTab);

  try {
    const response = await fetch(`/api/org/dashboard?orgName=${encodeURIComponent(orgName)}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    
    const data = await response.json();
    const orgUsers = data.users || [];
    const transactions = data.transactions || [];
    const orgProducts = data.products || [];
    
    const totalUsers = orgUsers.length;
    const totalQuotes = transactions.length;
    const totalValue = transactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
    
    if (DOM.statTotalUsers) DOM.statTotalUsers.textContent = totalUsers;
    if (DOM.statTotalProducts) DOM.statTotalProducts.textContent = orgProducts.length;
    if (DOM.statTotalQuotes) DOM.statTotalQuotes.textContent = totalQuotes;
    if (DOM.statTotalValue) DOM.statTotalValue.textContent = formatINR(totalValue);
    
    // 1. Render Users Table
    if (DOM.orgUsersTableBody) {
      DOM.orgUsersTableBody.innerHTML = '';
      if (orgUsers.length === 0) {
        DOM.orgUsersTableBody.innerHTML = `
          <tr>
            <td colspan="3" class="py-4 text-center text-slate-400 italic">No users registered under this organisation yet.</td>
          </tr>
        `;
      } else {
        orgUsers.forEach(u => {
          const row = document.createElement('tr');
          row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800';
          row.innerHTML = `
            <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">@${u.username}</td>
            <td class="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">${u.quoteCount}</td>
            <td class="py-3 px-4 text-right font-mono font-semibold text-slate-850 dark:text-slate-200">${formatINR(u.totalQuotedValue)}</td>
          `;
          DOM.orgUsersTableBody.appendChild(row);
        });
      }
    }

    // 2. Render Organisation Products Table
    if (DOM.orgProductsTableBody) {
      DOM.orgProductsTableBody.innerHTML = '';
      if (orgProducts.length === 0) {
        DOM.orgProductsTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="py-8 text-center text-slate-400 italic">
              <div class="space-y-1">
                <p class="font-bold text-slate-700 dark:text-slate-300 text-xs">No Organisation Products Found</p>
                <p class="text-[11px]">When employees or admins create products, they will automatically appear here.</p>
              </div>
            </td>
          </tr>
        `;
      } else {
        orgProducts.forEach(prod => {
          const row = document.createElement('tr');
          row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs';

          const compCount = (prod.bom || []).length + (prod.processes || []).length + (prod.miscItems || []).length;
          const metalCost = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
          const processCost = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
          const miscCost = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
          const subtotal = metalCost + processCost + miscCost;
          const profitAmount = subtotal * ((prod.profitPercentage || 0) / 100);
          const qty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
          const gTotal = (subtotal + profitAmount) * qty;
          const tWeight = (prod.bom || []).reduce((acc, x) => acc + (x.totalWeight || 0), 0) * qty;

          row.innerHTML = `
            <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${escapeHTML(prod.name)}</td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                ${escapeHTML(prod.createdBy || '@user')}
              </span>
            </td>
            <td class="py-3 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">${compCount} Item(s)</td>
            <td class="py-3 px-4 text-center font-mono">${tWeight > 0 ? tWeight.toFixed(2) + ' kg' : '-'}</td>
            <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${formatINR(gTotal)}</td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button type="button" class="btn-org-product-workings inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-cyan-300 font-bold text-[11px] transition-all cursor-pointer" data-prod-id="${prod.id}" title="Launch Workspace & Calculate Product">
                  <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
                  <span>Workings</span>
                </button>
                <button type="button" class="btn-org-product-delete p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer" data-prod-id="${prod.id}" data-prod-name="${escapeHTML(prod.name)}" title="Delete Product">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          `;

          row.querySelector('.btn-org-product-workings').addEventListener('click', () => {
            openOrgWorkspace();
            selectProductForCalculation(prod.id);
          });

          row.querySelector('.btn-org-product-delete').addEventListener('click', () => {
            const pId = prod.id;
            const pName = prod.name;
            if (confirm(`Are you sure you want to remove product "${pName}" from the organisation?`)) {
              deleteOrgProduct(pId);
            }
          });

          DOM.orgProductsTableBody.appendChild(row);
        });
      }
    }
    
    // 3. Render Transactions Table
    if (DOM.orgQuotesTableBody) {
      DOM.orgQuotesTableBody.innerHTML = '';
      if (transactions.length === 0) {
        DOM.orgQuotesTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="py-4 text-center text-slate-400 italic">No transactions or quotes generated yet.</td>
          </tr>
        `;
      } else {
        const sortedTxns = [...transactions].reverse();
        sortedTxns.forEach(tx => {
          const row = document.createElement('tr');
          row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800';
          
          row.innerHTML = `
            <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium font-mono">${tx.date}</td>
            <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">@${tx.username}</td>
            <td class="py-3 px-4 text-slate-700 dark:text-slate-350">${tx.customerName || 'N/A'}</td>
            <td class="py-3 px-4 text-right font-mono font-semibold text-slate-850 dark:text-slate-200">${formatINR(tx.grandTotal || 0)}</td>
            <td class="py-3 px-4 text-center flex items-center justify-center gap-2">
              <button class="btn-pdf-view p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer" title="View PDF Report" data-tx-id="${tx.id}">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              <button class="btn-pdf-download p-1.5 text-brand-600 hover:bg-brand-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30 rounded-lg transition-all cursor-pointer" title="Download PDF Report" data-tx-id="${tx.id}">
                <i data-lucide="download" class="w-4 h-4"></i>
              </button>
              <button class="btn-pdf-delete p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer" title="Delete Transaction" data-tx-id="${tx.id}">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </td>
          `;
          
          row.querySelector(`.btn-pdf-view[data-tx-id="${tx.id}"]`).addEventListener('click', () => {
            exportQuoteToPDF(tx, true);
          });
          
          row.querySelector(`.btn-pdf-download[data-tx-id="${tx.id}"]`).addEventListener('click', () => {
            exportQuoteToPDF(tx);
          });
          
          row.querySelector(`.btn-pdf-delete[data-tx-id="${tx.id}"]`).addEventListener('click', () => {
            if (confirm("Are you sure you want to delete this transaction from history?")) {
              deleteTransaction(tx.id);
            }
          });
          
          DOM.orgQuotesTableBody.appendChild(row);
        });
      }
    }
    lucide.createIcons();
  } catch (err) {
    console.error(err);
  }
}

async function deleteOrgProduct(productId) {
  if (state.currentUserType !== 'org') return;
  try {
    const orgName = localStorage.getItem('metal-current-org') || state.currentUser;
    const response = await fetch(`/api/org/products/${encodeURIComponent(productId)}?orgName=${encodeURIComponent(orgName)}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      showToast({ title: 'Product Deleted', message: 'Product removed from organisation catalog.', type: 'info' });
      renderOrgDashboard();
    }
  } catch (err) {
    console.error('Delete org product error:', err);
  }
}

async function deleteTransaction(txId) {
  if (state.currentUserType !== 'org') return;
  
  try {
    const orgName = localStorage.getItem('metal-current-org') || state.currentUser;
    const response = await fetch(`/api/transactions/${txId}?orgName=${encodeURIComponent(orgName)}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      renderOrgDashboard();
      lucide.createIcons();
    }
  } catch (err) {
    console.error('Delete transaction failed:', err);
  }
}

// --- Data Isolation Loader & Sync ---
async function loadUserData(username) {
  try {
    const response = await fetch(`/api/user/data?username=${encodeURIComponent(username)}`);
    if (!response.ok) throw new Error('Failed to load user data from database.');

    const data = await response.json();
    state.products = (data.products || []).filter(p => {
      if (p.name === 'Default Product' && (!p.bom || p.bom.length === 0) && (!p.processes || p.processes.length === 0) && (!p.miscItems || p.miscItems.length === 0)) {
        return false;
      }
      return true;
    });
    state.activeProductId = data.activeProductId || '';

    // If active product exists, load its calculations, otherwise fallback to root
    if (state.products.length > 0) {
      if (!state.activeProductId) state.activeProductId = state.products[0].id;
      const act = getActiveProduct();
      if (act) {
        state.bom = act.bom || [];
        state.processes = act.processes || [];
        state.miscItems = act.miscItems || [];
        state.profitPercentage = act.profitPercentage || 0;
      } else {
        state.bom = data.bom || [];
        state.processes = data.processes || [];
        state.miscItems = data.miscItems || [];
        state.profitPercentage = data.profitPercentage || 0;
      }
    } else {
      state.bom = data.bom || [];
      state.processes = data.processes || [];
      state.miscItems = data.miscItems || [];
      state.profitPercentage = data.profitPercentage || 0;
    }
    
    state.customerName = data.customerName || '';
    if (DOM.customerNameInput) DOM.customerNameInput.value = state.customerName;

    state.customerAddress = data.customerAddress || '';
    if (DOM.customerAddressInput) DOM.customerAddressInput.value = state.customerAddress;

    state.customerGSTIN = data.customerGSTIN || '';
    if (DOM.customerGSTINInput) DOM.customerGSTINInput.value = state.customerGSTIN;

    if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = state.profitPercentage;

    state.companies = data.companies || [];
    state.selectedCompany = data.selectedCompany || '';
    
    // Update company selector display in navbar
    const defaultOrg = localStorage.getItem('metal-current-org') || 'Organisation';
    if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = state.selectedCompany || defaultOrg;

    // Load clients directory & selection
    state.clients = data.clients || [];
    state.selectedClients = data.selectedClients || [];
    updateAppliedClientsDisplay();

    // Load process rates registry
    state.processRates = data.processRates || [];
    renderProcessRatesRegistry();

    if (data.trial) {
      updateTrialUI(data.trial);
    }

    updateActiveProductHeader();
    updateAllDisplays();
    renderProductsList();
    renderQuotationTabView();
  } catch (err) {
    console.warn('Could not load user data from database:', err);
  }
}

function updateAllDisplays() {
  renderSeparateEditors();
  renderUnifiedTable();
}

async function saveUserDataToServer() {
  if (!state.currentUser) return;
  
  try {
    await fetch('/api/user/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.currentUser,
        products: state.products,
        activeProductId: state.activeProductId,
        bom: state.bom,
        processes: state.processes,
        miscItems: state.miscItems,
        customerName: state.customerName,
        customerAddress: state.customerAddress,
        customerGSTIN: state.customerGSTIN,
        profitPercentage: state.profitPercentage,
        companies: state.companies,
        selectedCompany: state.selectedCompany,
        processRates: state.processRates,
        clients: state.clients,
        selectedClients: state.selectedClients
      })
    });
  } catch (err) {
    console.error('Sync Error:', err);
  }
}

function renderCompanyDropdown() {
  if (!DOM.companySelectorList) return;
  DOM.companySelectorList.innerHTML = '';

  const defaultOrg = localStorage.getItem('metal-current-org') || 'Argus Metal Suite';
  if (!state.companies) state.companies = [];
  
  const allCompanies = [
    { name: defaultOrg, isDefault: true },
    ...state.companies.map(c => ({ name: c, isDefault: false }))
  ];

  const currentActive = state.selectedCompany || defaultOrg;

  allCompanies.forEach(comp => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all " +
      (comp.name === currentActive ? "bg-brand-50/70 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50" : "text-slate-700 dark:text-slate-300");

    // Selectable content area
    const content = document.createElement('div');
    content.className = "flex items-center space-x-2 flex-1 min-w-0 pr-2";
    
    // Checkmark if active
    if (comp.name === currentActive) {
      content.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 flex-shrink-0 text-brand-600 dark:text-brand-400"></i>`;
    } else {
      content.innerHTML = `<div class="w-3.5 h-3.5 flex-shrink-0"></div>`;
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = "truncate";
    nameSpan.textContent = comp.name;
    content.appendChild(nameSpan);

    if (comp.isDefault) {
      const defBadge = document.createElement('span');
      defBadge.className = "text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ml-1 flex-shrink-0";
      defBadge.textContent = "Primary";
      content.appendChild(defBadge);
    }

    content.addEventListener('click', () => {
      selectCompany(comp.isDefault ? '' : comp.name);
      if (DOM.companySelectorDropdown) DOM.companySelectorDropdown.classList.add('hidden');
    });

    item.appendChild(content);

    // Delete button for custom sub-companies
    if (!comp.isDefault) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = "button";
      deleteBtn.className = "text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all";
      deleteBtn.title = "Delete sub-company";
      deleteBtn.innerHTML = `<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>`;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteCompany(comp.name);
      });
      item.appendChild(deleteBtn);
    }

    DOM.companySelectorList.appendChild(item);
  });

  lucide.createIcons();
}

function selectCompany(companyName) {
  state.selectedCompany = companyName;
  const defaultOrg = localStorage.getItem('metal-current-org') || 'Argus Metal Suite';
  if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = companyName || defaultOrg;
  saveUserDataToServer();
  renderCompanyDropdown();
}

function handleAddCompanySubmit(e) {
  e.preventDefault();
  if (!DOM.newCompanyInput) return;

  const newComp = DOM.newCompanyInput.value.trim();
  if (!newComp) return;

  const defaultOrg = localStorage.getItem('metal-current-org') || 'Argus Metal Suite';
  if (!state.companies) state.companies = [];
  const existingList = [defaultOrg.toLowerCase(), ...state.companies.map(c => c.toLowerCase())];

  if (existingList.includes(newComp.toLowerCase())) {
    alert("This company profile name already exists.");
    return;
  }

  state.companies.push(newComp);
  state.selectedCompany = newComp;
  
  if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = newComp;
  DOM.newCompanyInput.value = '';

  saveUserDataToServer();
  renderCompanyDropdown();
}

function handleDeleteCompany(companyName) {
  showConfirmModal({
    title: 'Delete Sub-Company',
    message: `Are you sure you want to delete "${companyName}" from your company profiles?`,
    confirmText: 'Delete Profile',
    onConfirm: () => {
      state.companies = (state.companies || []).filter(c => c !== companyName);
      if (state.selectedCompany === companyName) {
        state.selectedCompany = '';
        const defaultOrg = localStorage.getItem('metal-current-org') || 'Argus Metal Suite';
        if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = defaultOrg;
      }
      saveUserDataToServer();
      renderCompanyDropdown();
    }
  });
}

let confirmModalCallback = null;

function showConfirmModal({ title, message, confirmText = 'Delete', onConfirm }) {
  if (!DOM.customConfirmModal) return;
  DOM.confirmModalTitle.textContent = title || 'Confirm Action';
  DOM.confirmModalMessage.textContent = message || 'Are you sure you want to proceed?';
  DOM.confirmModalActionText.textContent = confirmText;
  confirmModalCallback = onConfirm;

  DOM.customConfirmModal.classList.remove('hidden');
  lucide.createIcons();
}

function hideConfirmModal() {
  if (!DOM.customConfirmModal) return;
  DOM.customConfirmModal.classList.add('hidden');
  confirmModalCallback = null;
}

function renderProcessRatesRegistry() {
  if (!DOM.processProfilesList) return;
  DOM.processProfilesList.innerHTML = '';

  if (state.processRates.length === 0) {
    DOM.processProfilesList.innerHTML = `
      <div class="p-3 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs">
        No active process profiles configured.
      </div>
    `;
    return;
  }

  state.processRates.forEach(prof => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors";

    const details = document.createElement('div');
    details.className = "flex flex-col";
    details.innerHTML = `
      <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHTML(prof.name)}</span>
      <span class="text-[10px] text-slate-400 dark:text-slate-500">Rate: ₹${prof.rate.toFixed(2)}/min (₹${(prof.rate * 60).toFixed(2)}/hr)</span>
    `;

    const actions = document.createElement('div');
    actions.className = "flex items-center gap-1";

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = "text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 p-1 rounded transition-colors";
    editBtn.title = "Edit Process Profile";
    editBtn.innerHTML = `<i data-lucide="edit-2" class="w-4 h-4"></i>`;
    editBtn.addEventListener('click', () => {
      openEditProcessProfileModal(prof);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = "text-slate-400 hover:text-rose-500 p-1 rounded transition-colors";
    deleteBtn.title = "Delete Process Profile";
    deleteBtn.innerHTML = `<i data-lucide="trash-2" class="w-4 h-4"></i>`;
    deleteBtn.addEventListener('click', () => {
      showConfirmModal({
        title: 'Delete Process Profile',
        message: `Are you sure you want to delete "${prof.name}" from your active rates registry? Calculation rows will be updated automatically.`,
        confirmText: 'Delete Profile',
        onConfirm: () => {
          handleDeleteProcessProfile(prof.name);
        }
      });
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(details);
    item.appendChild(actions);
    DOM.processProfilesList.appendChild(item);
  });

  lucide.createIcons();
}

function openEditProcessProfileModal(prof) {
  if (!DOM.editProcessModal) return;
  if (DOM.editProcessOldName) DOM.editProcessOldName.value = prof.name;
  if (DOM.editProcessNameInput) DOM.editProcessNameInput.value = prof.name;
  if (DOM.editProcessRateInput) DOM.editProcessRateInput.value = prof.rate;
  if (DOM.editProcessError) DOM.editProcessError.classList.add('hidden');
  updateEditProcessHourlyHint();
  DOM.editProcessModal.classList.remove('hidden');
  if (DOM.editProcessNameInput) DOM.editProcessNameInput.focus();
  lucide.createIcons();
}

function closeEditProcessProfileModal() {
  if (!DOM.editProcessModal) return;
  DOM.editProcessModal.classList.add('hidden');
}

function updateEditProcessHourlyHint() {
  if (!DOM.editProcessHourlyHint || !DOM.editProcessRateInput) return;
  const rate = parseFloat(DOM.editProcessRateInput.value) || 0;
  DOM.editProcessHourlyHint.textContent = `Hourly: ₹${(rate * 60).toFixed(2)}/hr`;
}

function handleEditProcessProfileSubmit(e) {
  e.preventDefault();
  if (DOM.editProcessError) DOM.editProcessError.classList.add('hidden');

  const oldName = DOM.editProcessOldName.value;
  const newName = DOM.editProcessNameInput.value.trim();
  const newRate = parseFloat(DOM.editProcessRateInput.value);

  if (!newName || isNaN(newRate) || newRate < 0) {
    if (DOM.editProcessError) {
      DOM.editProcessError.textContent = 'Please enter a valid process name and non-negative rate.';
      DOM.editProcessError.classList.remove('hidden');
    }
    return;
  }

  // Check if renaming to another existing profile
  if (newName.toLowerCase() !== oldName.toLowerCase()) {
    const exists = state.processRates.some(p => p.name.toLowerCase() === newName.toLowerCase());
    if (exists) {
      if (DOM.editProcessError) {
        DOM.editProcessError.textContent = `A profile named "${newName}" already exists.`;
        DOM.editProcessError.classList.remove('hidden');
      }
      return;
    }
  }

  // Update in state.processRates
  const profileIndex = state.processRates.findIndex(p => p.name.toLowerCase() === oldName.toLowerCase());
  if (profileIndex !== -1) {
    state.processRates[profileIndex].name = newName;
    state.processRates[profileIndex].rate = newRate;
  } else {
    state.processRates.push({ name: newName, rate: newRate });
  }

  // Cascade update to any active process rows
  state.processes.forEach(p => {
    if (p.name && p.name.toLowerCase() === oldName.toLowerCase()) {
      p.name = newName;
      p.rate = newRate;
      p.cost = (p.duration || 0) * newRate;
    }
  });

  saveUserDataToServer();
  renderProcessRatesRegistry();
  renderSeparateEditors();
  updateAllDisplays();
  closeEditProcessProfileModal();
}

function handleAddProcessProfileSubmit(e) {
  e.preventDefault();
  if (!DOM.newProfileName || !DOM.newProfileRate) return;

  const name = DOM.newProfileName.value.trim();
  const rate = parseFloat(DOM.newProfileRate.value);

  if (!name || isNaN(rate) || rate < 0) {
    alert("Please enter a valid process name and non-negative rate.");
    return;
  }

  const nameExists = state.processRates.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    alert(`Process profile "${name}" already exists.`);
    return;
  }

  state.processRates.push({ name, rate });
  DOM.newProfileName.value = '';
  DOM.newProfileRate.value = '';

  saveUserDataToServer();
  renderProcessRatesRegistry();
  renderSeparateEditors();
}

function handleDeleteProcessProfile(name) {
  state.processRates = state.processRates.filter(p => p.name !== name);
  
  const nextProfile = state.processRates.length > 0 ? state.processRates[0] : null;

  // Re-assign any active row that was using this deleted profile
  state.processes.forEach(p => {
    if (p.name === name) {
      if (nextProfile) {
        p.name = nextProfile.name;
        p.rate = nextProfile.rate;
        p.cost = (p.duration || 0) * p.rate;
      } else {
        p.name = '';
        p.rate = 0;
        p.cost = 0;
      }
    }
  });

  saveUserDataToServer();
  renderProcessRatesRegistry();
  updateAllDisplays();
}

// --- Client Directory & Recipients Modal Controllers ---
function openClientsModal() {
  if (!DOM.clientsModal) return;
  DOM.clientsModal.classList.remove('hidden');
  if (DOM.clientSearchInput) DOM.clientSearchInput.value = '';
  renderModalClientsList(state.clients || []);
  updateModalSelectionSummary();
  lucide.createIcons();
}

function closeClientsModal() {
  if (!DOM.clientsModal) return;
  DOM.clientsModal.classList.add('hidden');
  updateAppliedClientsDisplay();
  saveUserDataToServer();
}

function updateAppliedClientsDisplay() {
  const count = state.selectedClients ? state.selectedClients.length : 0;
  
  if (DOM.activeClientBadge) {
    if (count === 0) {
      DOM.activeClientBadge.textContent = '0 Selected';
      DOM.activeClientBadge.className = 'bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold';
    } else if (count === 1) {
      DOM.activeClientBadge.textContent = '1 Selected';
      DOM.activeClientBadge.className = 'bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold';
    } else {
      DOM.activeClientBadge.textContent = `${count} Selected`;
      DOM.activeClientBadge.className = 'bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold';
    }
  }

  if (DOM.appliedClientNamesDisplay) {
    if (count === 0) {
      DOM.appliedClientNamesDisplay.textContent = 'None selected (Click "Client Details" to assign)';
      DOM.appliedClientNamesDisplay.className = 'font-semibold text-slate-400 dark:text-slate-500 text-xs';
    } else if (count === 1) {
      const c = state.selectedClients[0];
      const gstinTxt = c.gstin ? ` • ${c.gstin}` : '';
      DOM.appliedClientNamesDisplay.textContent = `${c.name}${gstinTxt}`;
      DOM.appliedClientNamesDisplay.className = 'font-bold text-brand-600 dark:text-cyan-400 text-xs';
    } else {
      const names = state.selectedClients.map(c => c.name).join(', ');
      DOM.appliedClientNamesDisplay.textContent = `${names} (${count} Clients)`;
      DOM.appliedClientNamesDisplay.className = 'font-bold text-brand-600 dark:text-cyan-400 text-xs';
    }
  }
}

function updateModalSelectionSummary() {
  const count = state.selectedClients ? state.selectedClients.length : 0;
  if (DOM.modalSelectedSummary) {
    DOM.modalSelectedSummary.textContent = `${count} client(s) selected for quotation`;
  }
}

function renderModalClientsList(clientList = []) {
  if (!DOM.modalClientsList) return;
  DOM.modalClientsList.innerHTML = '';
  
  if (DOM.modalClientsCount) {
    DOM.modalClientsCount.textContent = `${state.clients ? state.clients.length : 0} Clients`;
  }

  if (!clientList || clientList.length === 0) {
    DOM.modalClientsList.innerHTML = `
      <div class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
        <i data-lucide="users" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
        No clients found. Add a new client above!
      </div>
    `;
    lucide.createIcons();
    return;
  }

  clientList.forEach(client => {
    const isSelected = (state.selectedClients || []).some(sc => (sc.id && client.id && sc.id === client.id) || (sc.name && sc.name.toLowerCase() === client.name.toLowerCase()));
    const item = document.createElement('div');
    item.className = `p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer ${isSelected ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''}`;
    
    const addressStr = client.address ? ` • ${client.address}` : '';
    const emailStr = client.email ? ` • ${client.email}` : '';
    const phoneStr = client.phone ? ` • ${client.phone}` : '';
    const gstinStr = client.gstin ? ` • GSTIN: ${client.gstin}` : '';

    item.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <input type="checkbox" class="client-checkbox w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer" ${isSelected ? 'checked' : ''}>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate">${escapeHTML(client.name)}</span>
            ${isSelected ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">Selected</span>' : ''}
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${escapeHTML(client.address || 'No address specified')}${emailStr}${phoneStr}${gstinStr}</p>
        </div>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <button type="button" class="btn-edit-client p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all" title="Edit Client Details">
          <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
        </button>
        <button type="button" class="btn-delete-client p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all" title="Delete Client">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    // Toggle selection on row click
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-client') || e.target.closest('.btn-edit-client')) return;
      handleToggleClientSelection(client);
    });

    // Edit action
    item.querySelector('.btn-edit-client').addEventListener('click', (e) => {
      e.stopPropagation();
      handleStartEditClient(client);
    });
    
    // Delete action
    item.querySelector('.btn-delete-client').addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmModal({
        title: 'Delete Client',
        message: `Are you sure you want to delete "${client.name}" from your directory?`,
        confirmText: 'Delete Client',
        onConfirm: () => {
          handleDeleteClient(client.id || client.name);
        }
      });
    });

    DOM.modalClientsList.appendChild(item);
  });

  lucide.createIcons();
}

let editingClientId = null;

function handleStartEditClient(client) {
  if (!client) return;
  editingClientId = client.id || client.name;

  if (DOM.clientInputName) DOM.clientInputName.value = client.name || '';
  if (DOM.clientInputEmail) DOM.clientInputEmail.value = client.email || '';
  if (DOM.clientInputPhone) DOM.clientInputPhone.value = client.phone || '';
  if (DOM.clientInputAddress) DOM.clientInputAddress.value = client.address || '';
  if (DOM.clientInputGSTIN) DOM.clientInputGSTIN.value = client.gstin || '';

  if (DOM.clientFormTitle) DOM.clientFormTitle.textContent = "Edit Client Details";
  if (DOM.clientFormIcon) DOM.clientFormIcon.setAttribute('data-lucide', 'pencil');
  if (DOM.clientFormSubmitText) DOM.clientFormSubmitText.textContent = "Update Client";
  if (DOM.clientFormSubmitIcon) DOM.clientFormSubmitIcon.setAttribute('data-lucide', 'check');
  if (DOM.cancelClientEditBtn) DOM.cancelClientEditBtn.classList.remove('hidden');

  if (DOM.clientInputName) {
    DOM.clientInputName.focus();
    DOM.clientInputName.select();
  }

  lucide.createIcons();
}

function handleCancelClientEdit() {
  editingClientId = null;
  if (DOM.clientInputName) DOM.clientInputName.value = '';
  if (DOM.clientInputEmail) DOM.clientInputEmail.value = '';
  if (DOM.clientInputPhone) DOM.clientInputPhone.value = '';
  if (DOM.clientInputAddress) DOM.clientInputAddress.value = '';
  if (DOM.clientInputGSTIN) DOM.clientInputGSTIN.value = '';

  if (DOM.clientFormTitle) DOM.clientFormTitle.textContent = "Add New Client Company";
  if (DOM.clientFormIcon) DOM.clientFormIcon.setAttribute('data-lucide', 'user-plus');
  if (DOM.clientFormSubmitText) DOM.clientFormSubmitText.textContent = "Save Client to Directory";
  if (DOM.clientFormSubmitIcon) DOM.clientFormSubmitIcon.setAttribute('data-lucide', 'plus');
  if (DOM.cancelClientEditBtn) DOM.cancelClientEditBtn.classList.add('hidden');

  lucide.createIcons();
}

function handleToggleClientSelection(client) {
  if (!state.selectedClients) state.selectedClients = [];
  const idx = state.selectedClients.findIndex(sc => (sc.id && client.id && sc.id === client.id) || (sc.name && sc.name.toLowerCase() === client.name.toLowerCase()));
  
  if (idx >= 0) {
    state.selectedClients.splice(idx, 1);
  } else {
    state.selectedClients.push(client);
  }

  // Update primary state fields based on first selected client or clear
  if (state.selectedClients.length > 0) {
    state.customerName = state.selectedClients[0].name;
    state.customerAddress = state.selectedClients[0].address || '';
    state.customerGSTIN = state.selectedClients[0].gstin || '';
  } else {
    state.customerName = '';
    state.customerAddress = '';
    state.customerGSTIN = '';
  }

  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
  
  // Re-render list preserving active search
  const q = DOM.clientSearchInput ? DOM.clientSearchInput.value.trim().toLowerCase() : '';
  if (q) {
    filterModalClients();
  } else {
    renderModalClientsList(state.clients || []);
  }
}

function clearModalClientsSelection() {
  state.selectedClients = [];
  state.customerName = '';
  state.customerAddress = '';
  state.customerGSTIN = '';
  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
  renderModalClientsList(state.clients || []);
}

function handleAddClientSubmit(e) {
  e.preventDefault();
  const name = DOM.clientInputName.value.trim();
  const email = DOM.clientInputEmail ? DOM.clientInputEmail.value.trim() : '';
  const phone = DOM.clientInputPhone ? DOM.clientInputPhone.value.trim() : '';
  const address = DOM.clientInputAddress.value.trim();
  const gstin = DOM.clientInputGSTIN.value.trim().toUpperCase();

  if (!name) {
    alert('Please enter a client/company name.');
    return;
  }

  if (!state.clients) state.clients = [];

  if (editingClientId) {
    // Edit Mode: Update existing client
    const clientIdx = state.clients.findIndex(c => (c.id && c.id === editingClientId) || c.name === editingClientId);
    if (clientIdx >= 0) {
      const dup = state.clients.find((c, i) => i !== clientIdx && c.name.toLowerCase() === name.toLowerCase());
      if (dup) {
        alert(`Another client named "${name}" already exists in your directory.`);
        return;
      }

      state.clients[clientIdx].name = name;
      state.clients[clientIdx].email = email;
      state.clients[clientIdx].phone = phone;
      state.clients[clientIdx].address = address;
      state.clients[clientIdx].gstin = gstin;

      // Update in selectedClients if present
      if (state.selectedClients) {
        const selIdx = state.selectedClients.findIndex(sc => (sc.id && sc.id === editingClientId) || sc.name === editingClientId);
        if (selIdx >= 0) {
          state.selectedClients[selIdx].name = name;
          state.selectedClients[selIdx].email = email;
          state.selectedClients[selIdx].phone = phone;
          state.selectedClients[selIdx].address = address;
          state.selectedClients[selIdx].gstin = gstin;
        }
      }

      // Update primary state fields if first selected client
      if (state.selectedClients && state.selectedClients.length > 0) {
        state.customerName = state.selectedClients[0].name;
        state.customerAddress = state.selectedClients[0].address || '';
        state.customerGSTIN = state.selectedClients[0].gstin || '';
      }
    }

    handleCancelClientEdit();
    saveUserDataToServer();
    renderModalClientsList(state.clients);
    updateModalSelectionSummary();
    updateAppliedClientsDisplay();
    return;
  }
  
  const existing = state.clients.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    alert(`A client named "${name}" already exists in your directory.`);
    return;
  }

  const newClient = {
    id: 'cli_' + Date.now(),
    name,
    email,
    phone,
    address,
    gstin
  };

  state.clients.unshift(newClient);
  
  // Auto-select this newly created client
  if (!state.selectedClients) state.selectedClients = [];
  state.selectedClients.push(newClient);
  state.customerName = newClient.name;
  state.customerAddress = newClient.address;
  state.customerGSTIN = newClient.gstin;

  DOM.clientInputName.value = '';
  if (DOM.clientInputEmail) DOM.clientInputEmail.value = '';
  if (DOM.clientInputPhone) DOM.clientInputPhone.value = '';
  DOM.clientInputAddress.value = '';
  DOM.clientInputGSTIN.value = '';

  saveUserDataToServer();
  renderModalClientsList(state.clients);
  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
}

function handleDeleteClient(clientIdOrName) {
  if (!state.clients) return;
  state.clients = state.clients.filter(c => (c.id !== clientIdOrName && c.name !== clientIdOrName));
  if (state.selectedClients) {
    state.selectedClients = state.selectedClients.filter(sc => (sc.id !== clientIdOrName && sc.name !== clientIdOrName));
  }
  
  if (state.selectedClients && state.selectedClients.length > 0) {
    state.customerName = state.selectedClients[0].name;
    state.customerAddress = state.selectedClients[0].address || '';
    state.customerGSTIN = state.selectedClients[0].gstin || '';
  } else {
    state.customerName = '';
    state.customerAddress = '';
    state.customerGSTIN = '';
  }

  saveUserDataToServer();
  renderModalClientsList(state.clients);
  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
}

function filterModalClients() {
  if (!DOM.clientSearchInput) return;
  const q = DOM.clientSearchInput.value.trim().toLowerCase();
  
  if (!q) {
    renderModalClientsList(state.clients || []);
    return;
  }

  const filtered = (state.clients || []).filter(c => {
    const n = (c.name || '').toLowerCase();
    const em = (c.email || '').toLowerCase();
    const ph = (c.phone || '').toLowerCase();
    const a = (c.address || '').toLowerCase();
    const g = (c.gstin || '').toLowerCase();
    return n.includes(q) || em.includes(q) || ph.includes(q) || a.includes(q) || g.includes(q);
  });

  renderModalClientsList(filtered);
}

// --- Excel Import & Model Template Helpers ---
function openExcelTemplateModal() {
  if (!DOM.excelTemplateModal) return;
  DOM.excelTemplateModal.classList.remove('hidden');
  lucide.createIcons();
}

function closeExcelTemplateModal() {
  if (!DOM.excelTemplateModal) return;
  DOM.excelTemplateModal.classList.add('hidden');
}

function downloadSampleClientsExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Excel engine is still loading, please try again in a moment.');
    return;
  }

  const sampleData = [
    {
      "Client / Company Name": "Caterpillar Inc.",
      "Email Address": "procurement@caterpillar.com",
      "Phone Number": "+91 9876543210",
      "Address / Location": "Bangalore, India",
      "GSTIN Number": "29AAAAA0000A1Z5"
    },
    {
      "Client / Company Name": "L&T Heavy Engineering",
      "Email Address": "quotes@larsentoubro.com",
      "Phone Number": "+91 9845012345",
      "Address / Location": "Mumbai, India",
      "GSTIN Number": "27AAACL0123B1Z2"
    },
    {
      "Client / Company Name": "Tata Steel Structures",
      "Email Address": "orders@tatasteel.com",
      "Phone Number": "+91 9944011223",
      "Address / Location": "Jamshedpur, India",
      "GSTIN Number": "20AAACT1234C1Z3"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData, {
    header: ["Client / Company Name", "Email Address", "Phone Number", "Address / Location", "GSTIN Number"]
  });

  // Set column widths for clean appearance
  ws['!cols'] = [
    { wch: 26 }, // Client / Company Name
    { wch: 30 }, // Email Address
    { wch: 18 }, // Phone Number
    { wch: 25 }, // Address / Location
    { wch: 20 }  // GSTIN Number
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clients Directory");
  XLSX.writeFile(wb, "Argus_Client_Directory_Template.xlsx");
}

function handleClientsExcelFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (typeof XLSX === 'undefined') {
    alert('Excel processing engine is loading. Please try again.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        alert('The uploaded Excel file contains no worksheets.');
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rows || rows.length === 0) {
        alert('The uploaded spreadsheet contains no data rows.');
        return;
      }

      parseAndImportClientsData(rows);
    } catch (err) {
      console.error('Excel parse error:', err);
      alert('Failed to parse Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.');
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseAndImportClientsData(rows) {
  if (!state.clients) state.clients = [];
  let addedCount = 0;
  let duplicateCount = 0;
  let skippedBlankCount = 0;

  rows.forEach(row => {
    // Flexible column resolution across common naming variations
    let name = '';
    let email = '';
    let phone = '';
    let address = '';
    let gstin = '';

    for (const [key, rawVal] of Object.entries(row)) {
      const k = key.trim().toLowerCase();
      const val = String(rawVal || '').trim();

      if (k.includes('client') || k.includes('company') || k === 'name') {
        if (!name) name = val;
      } else if (k.includes('email') || k.includes('mail')) {
        if (!email) email = val;
      } else if (k.includes('phone') || k.includes('mobile') || k.includes('contact') || k.includes('tel')) {
        if (!phone) phone = val;
      } else if (k.includes('address') || k.includes('location') || k.includes('city') || k.includes('place')) {
        if (!address) address = val;
      } else if (k.includes('gst') || k.includes('gstin') || k.includes('tax')) {
        if (!gstin) gstin = val.toUpperCase();
      }
    }

    if (!name) {
      skippedBlankCount++;
      return;
    }

    // Check if client name already exists in state.clients (case-insensitive)
    const exists = state.clients.some(c => (c.name || '').toLowerCase() === name.toLowerCase());
    if (exists) {
      duplicateCount++;
      return;
    }

    const newClient = {
      id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      email,
      phone,
      address,
      gstin
    };

    state.clients.push(newClient);
    addedCount++;
  });

  if (addedCount > 0) {
    saveUserDataToServer();
    renderModalClientsList(state.clients);
    updateModalSelectionSummary();
    updateAppliedClientsDisplay();

    let msg = `Successfully imported ${addedCount} client(s) into your directory!`;
    if (duplicateCount > 0) {
      msg += ` (${duplicateCount} duplicate(s) skipped)`;
    }
    alert(msg);
  } else {
    if (duplicateCount > 0) {
      alert(`No new clients added: All ${duplicateCount} client(s) in the file already exist in your directory.`);
    } else {
      alert('No valid client records found in the uploaded file. Please check that column headers match the template.');
    }
  }
}

// --- Separate Client PDF Modal Controllers ---
function openSeparatePDFModal() {
  if (!DOM.separatePdfModal) return;
  const clients = state.selectedClients || [];
  
  if (clients.length === 0) {
    alert("Please select at least one client from 'Client Details' before exporting separate quotation PDFs.");
    return;
  }

  DOM.separatePdfModal.classList.remove('hidden');
  if (DOM.separatePdfCount) DOM.separatePdfCount.textContent = clients.length;
  renderSeparatePdfClientsList();
  lucide.createIcons();
}

function closeSeparatePDFModal() {
  if (!DOM.separatePdfModal) return;
  DOM.separatePdfModal.classList.add('hidden');
}

function renderSeparatePdfClientsList() {
  if (!DOM.separatePdfClientsList) return;
  DOM.separatePdfClientsList.innerHTML = '';
  
  const clients = state.selectedClients || [];
  if (clients.length === 0) {
    DOM.separatePdfClientsList.innerHTML = `
      <div class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
        No clients selected. Select clients from "Client Details" first.
      </div>
    `;
    return;
  }

  clients.forEach((client, idx) => {
    const card = document.createElement('div');
    card.className = "p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3";
    
    const gstinTxt = client.gstin ? ` • GSTIN: ${client.gstin}` : '';
    const addressTxt = client.address ? ` • ${client.address}` : '';

    card.innerHTML = `
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
            ${idx + 1}
          </span>
          <span class="text-xs font-bold text-slate-900 dark:text-white truncate">${client.name}</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 ml-7 truncate">${client.address || 'No address specified'}${gstinTxt}</p>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
        <button type="button" class="btn-preview-single-pdf inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all active:scale-95">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-500"></i> Preview
        </button>
        <button type="button" class="btn-download-single-pdf inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95">
          <i data-lucide="download" class="w-3.5 h-3.5"></i> Download PDF
        </button>
      </div>
    `;

    card.querySelector('.btn-preview-single-pdf').addEventListener('click', () => {
      exportSingleClientPDF(client, true);
    });

    card.querySelector('.btn-download-single-pdf').addEventListener('click', () => {
      exportSingleClientPDF(client, false);
    });

    DOM.separatePdfClientsList.appendChild(card);
  });

  lucide.createIcons();
}

function exportSingleClientPDF(client, shouldPreview = false) {
  if (!client) return;
  exportQuoteToPDF(null, shouldPreview, client);
}

function handleDownloadAllSeparatePDFs() {
  const clients = state.selectedClients || [];
  if (clients.length === 0) return;

  clients.forEach((client, idx) => {
    setTimeout(() => {
      exportSingleClientPDF(client, false);
    }, idx * 500);
  });
}

function handleGlobalBack() {
  if (state.currentUserType === 'org' && DOM.appWrapper && !DOM.appWrapper.classList.contains('hidden') && DOM.returnToOrgAdminBtn && !DOM.returnToOrgAdminBtn.classList.contains('hidden')) {
    returnToOrgAdmin();
    return;
  }

  if (state.tabHistory && state.tabHistory.length > 1) {
    state.tabHistory.pop(); // Remove current tab
    const prevTab = state.tabHistory.pop(); // Get previous tab
    switchEmployeeView(prevTab);
  } else if (state.currentTab && state.currentTab !== 'products') {
    switchEmployeeView('products');
  } else {
    window.history.back();
  }
}

function switchEmployeeView(view) {
  const targetView = view || 'products';
  if (!state.tabHistory) state.tabHistory = [];
  if (state.tabHistory.length === 0 || state.tabHistory[state.tabHistory.length - 1] !== targetView) {
    state.tabHistory.push(targetView);
    if (state.tabHistory.length > 25) state.tabHistory.shift();
  }
  state.currentTab = targetView;
  try {
    localStorage.setItem('metal-active-tab', state.currentTab);
  } catch (e) {}
  if (!DOM.navProductsBtn || !DOM.navCalculatorBtn || !DOM.navQuotationBtn || !DOM.navHistoryBtn) return;
  
  const activeClass = "px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 transition-all flex items-center gap-1.5";
  const inactiveClass = "px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-all flex items-center gap-1.5";

  const mobileActiveClasses = "mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 px-1 text-brand-600 dark:text-cyan-400 text-[10px] font-bold transition-all rounded-lg";
  const mobileInactiveClasses = "mobile-nav-btn flex flex-col items-center justify-center flex-1 py-1 px-1 text-slate-500 dark:text-slate-400 text-[10px] font-bold transition-all rounded-lg";
  
  // Set all desktop inactive
  DOM.navProductsBtn.className = inactiveClass;
  DOM.navCalculatorBtn.className = inactiveClass;
  DOM.navQuotationBtn.className = inactiveClass;
  DOM.navHistoryBtn.className = inactiveClass;

  // Set all mobile inactive
  if (DOM.mobileNavProductsBtn) DOM.mobileNavProductsBtn.className = mobileInactiveClasses;
  if (DOM.mobileNavCalculatorBtn) DOM.mobileNavCalculatorBtn.className = mobileInactiveClasses;
  if (DOM.mobileNavQuotationBtn) DOM.mobileNavQuotationBtn.className = mobileInactiveClasses;
  if (DOM.mobileNavHistoryBtn) DOM.mobileNavHistoryBtn.className = mobileInactiveClasses;

  DOM.productsView.classList.add('hidden');
  DOM.calculatorView.classList.add('hidden');
  DOM.quotationTabView.classList.add('hidden');
  DOM.userHistoryView.classList.add('hidden');

  if (view === 'products') {
    DOM.navProductsBtn.className = activeClass;
    if (DOM.mobileNavProductsBtn) DOM.mobileNavProductsBtn.className = mobileActiveClasses;
    DOM.productsView.classList.remove('hidden');
    renderProductsList();
  } else if (view === 'calculator') {
    DOM.navCalculatorBtn.className = activeClass;
    if (DOM.mobileNavCalculatorBtn) DOM.mobileNavCalculatorBtn.className = mobileActiveClasses;
    DOM.calculatorView.classList.remove('hidden');
    ensureActiveProduct();
    updateActiveProductHeader();
    updateAllDisplays();
  } else if (view === 'quotation') {
    DOM.navQuotationBtn.className = activeClass;
    if (DOM.mobileNavQuotationBtn) DOM.mobileNavQuotationBtn.className = mobileActiveClasses;
    DOM.quotationTabView.classList.remove('hidden');
    renderQuotationTabView();
  } else if (view === 'history') {
    DOM.navHistoryBtn.className = activeClass;
    if (DOM.mobileNavHistoryBtn) DOM.mobileNavHistoryBtn.className = mobileActiveClasses;
    DOM.userHistoryView.classList.remove('hidden');
    DOM.historySearchInput.value = '';
    loadUserQuotationHistory();
  }

  lucide.createIcons();
}

// --- Product and Quotations State Helpers ---
function getActiveProduct() {
  if (!state.products) state.products = [];
  return state.products.find(p => p.id === state.activeProductId) || null;
}

function ensureActiveProduct() {
  if (!state.products) state.products = [];
  if (state.products.length > 0) {
    if (!state.activeProductId || !state.products.some(p => p.id === state.activeProductId)) {
      state.activeProductId = state.products[0].id;
    }
  } else {
    state.activeProductId = '';
  }
}

function updateActiveProductHeader() {
  const prod = getActiveProduct();
  const name = prod ? prod.name : 'No Product Selected';
  if (DOM.calculatorActiveProductName) DOM.calculatorActiveProductName.textContent = name;
  if (DOM.calculatorActiveProductTag) DOM.calculatorActiveProductTag.textContent = prod ? `Product: ${name}` : 'No Product Selected';
}

function selectProductForCalculation(productId) {
  const prod = (state.products || []).find(p => p.id === productId);
  if (!prod) return;

  state.activeProductId = prod.id;
  state.bom = JSON.parse(JSON.stringify(prod.bom || []));
  state.processes = JSON.parse(JSON.stringify(prod.processes || []));
  state.miscItems = JSON.parse(JSON.stringify(prod.miscItems || []));
  state.profitPercentage = prod.profitPercentage || 0;
  if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = state.profitPercentage;

  switchEmployeeView('calculator');
}

function handleCreateProductSubmit(e) {
  e.preventDefault();
  if (!DOM.newProductNameInput) return;
  const name = DOM.newProductNameInput.value.trim();
  if (!name) return;

  if (!state.products) state.products = [];
  const newProd = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name,
    quantity: 1,
    inQuote: true,
    bom: [],
    processes: [],
    miscItems: [],
    profitPercentage: 0,
    createdAt: new Date().toISOString()
  };

  state.products.unshift(newProd);
  state.activeProductId = newProd.id;
  DOM.newProductNameInput.value = '';

  // Reset calculator buffer for the new product
  state.bom = [];
  state.processes = [];
  state.miscItems = [];
  state.profitPercentage = 0;
  if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = 0;

  saveUserDataToServer();
  switchEmployeeView('calculator');
}

function handleDeleteProduct(productId) {
  const prod = (state.products || []).find(p => p.id === productId);
  const name = prod ? prod.name : 'this product';
  showConfirmModal({
    title: 'Delete Product',
    message: `Are you sure you want to delete "${name}" and all its associated calculations?`,
    confirmText: 'Delete Product',
    onConfirm: () => {
      state.products = (state.products || []).filter(p => p.id !== productId);
      if (state.activeProductId === productId) {
        state.activeProductId = state.products.length > 0 ? state.products[0].id : '';
        if (state.activeProductId) {
          const next = getActiveProduct();
          state.bom = JSON.parse(JSON.stringify(next.bom || []));
          state.processes = JSON.parse(JSON.stringify(next.processes || []));
          state.miscItems = JSON.parse(JSON.stringify(next.miscItems || []));
          state.profitPercentage = next.profitPercentage || 0;
        } else {
          state.bom = [];
          state.processes = [];
          state.miscItems = [];
          state.profitPercentage = 0;
        }
      }
      saveUserDataToServer();
      if (state.currentTab === 'products') renderProductsList();
      if (state.currentTab === 'quotation') renderQuotationTabView();
      if (state.currentTab === 'calculator') updateAllDisplays();
    }
  });
}

// --- Modern Toast Notification Helper ---
function showToast(options) {
  let title = 'Notification';
  let message = '';
  let type = 'success';
  let duration = 3500;

  if (typeof options === 'string') {
    message = options;
    title = (type === 'error') ? 'Error' : 'Notice';
  } else if (options && typeof options === 'object') {
    type = options.type || 'success';
    title = options.title || (type === 'error' ? 'Error' : type === 'info' ? 'Information' : 'Success');
    message = options.message || '';
    if (typeof options.duration === 'number') duration = options.duration;
  }

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/10 transition-all duration-300 transform translate-y-2 opacity-0';

  let iconHTML = `<div class="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex-shrink-0"><i data-lucide="check-circle-2" class="w-5 h-5"></i></div>`;
  if (type === 'info') {
    iconHTML = `<div class="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800/80 flex-shrink-0"><i data-lucide="info" class="w-5 h-5"></i></div>`;
  } else if (type === 'error') {
    iconHTML = `<div class="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800/80 flex-shrink-0"><i data-lucide="alert-circle" class="w-5 h-5"></i></div>`;
  }

  toast.innerHTML = `
    ${iconHTML}
    <div class="flex-1 min-w-0">
      <h4 class="text-xs font-bold text-slate-900 dark:text-white">${escapeHTML(title)}</h4>
      <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHTML(message)}</p>
    </div>
    <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors flex-shrink-0">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  const removeToast = () => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  };

  closeBtn.addEventListener('click', removeToast);

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

function handleAddCalculationsToProduct() {
  ensureActiveProduct();
  let prod = getActiveProduct();
  if (!prod) {
    openQuickAddProductModal();
    showToast({
      title: 'Name Your Product',
      message: 'Please name this product to save your calculations to the quotation.',
      type: 'info',
      duration: 4000
    });
    return;
  }

  // Save current active calculator items to active product
  prod.bom = JSON.parse(JSON.stringify(state.bom || []));
  prod.processes = JSON.parse(JSON.stringify(state.processes || []));
  prod.miscItems = JSON.parse(JSON.stringify(state.miscItems || []));
  prod.profitPercentage = state.profitPercentage || 0;
  prod.inQuote = true;

  const metalCost = prod.bom.reduce((acc, x) => acc + (x.totalCost || 0), 0);
  const processCost = prod.processes.reduce((acc, x) => acc + (x.cost || 0), 0);
  const miscCost = prod.miscItems.reduce((acc, x) => acc + (x.cost || 0), 0);
  const subtotal = metalCost + processCost + miscCost;
  const profitAmount = subtotal * (prod.profitPercentage / 100);
  prod.grandTotal = subtotal + profitAmount;
  prod.totalWeight = prod.bom.reduce((acc, x) => acc + (x.totalWeight || 0), 0);
  prod.updatedAt = new Date().toISOString();

  saveUserDataToServer();

  const totalItems = prod.bom.length + prod.processes.length + prod.miscItems.length;
  showToast({
    title: 'Calculations Added',
    message: `Successfully added to "${prod.name}" (${totalItems} total line item${totalItems === 1 ? '' : 's'})`,
    type: 'success'
  });
  switchEmployeeView('quotation');
}

function clearCalculatorSheet() {
  showConfirmModal({
    title: 'Reset Calculation Sheet',
    message: 'Are you sure you want to clear current calculation parts and reset dimensions for this product?',
    confirmText: 'Reset Sheet',
    onConfirm: () => {
      state.bom = [];
      state.processes = [];
      state.miscItems = [];
      state.profitPercentage = 0;
      if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = 0;
      
      const prod = getActiveProduct();
      if (prod) {
        prod.bom = [];
        prod.processes = [];
        prod.miscItems = [];
        prod.profitPercentage = 0;
        prod.grandTotal = 0;
        prod.totalWeight = 0;
      }
      
      saveUserDataToServer();
      updateAllDisplays();
    }
  });
}

function clearAllProductsAndQuotations() {
  showConfirmModal({
    title: 'Clear Active Quotation Table',
    message: 'Are you sure you want to clear all products from the active quotation table? All your products and their calculations will remain safely saved in your Products tab.',
    confirmText: 'Clear Quotation Table',
    onConfirm: () => {
      (state.products || []).forEach(p => {
        p.inQuote = false;
      });
      saveUserDataToServer();
      renderQuotationTabView();
      renderProductsList();
      showToast({
        title: 'Quotation Table Cleared',
        message: 'Active quote cleared. All products remain safely saved in your Products tab.',
        type: 'info'
      });
    }
  });
}

function filterProductsList() {
  renderProductsList();
}

function renderProductsList() {
  if (!DOM.productsListContainer) return;
  DOM.productsListContainer.innerHTML = '';

  const q = DOM.productsSearchInput ? DOM.productsSearchInput.value.trim().toLowerCase() : '';
  const products = (state.products || []).filter(p => {
    if (!q) return true;
    return (p.name || '').toLowerCase().includes(q);
  });

  if (DOM.productsCountBadge) {
    const total = (state.products || []).length;
    DOM.productsCountBadge.textContent = `${total} Product${total === 1 ? '' : 's'}`;
  }

  if (products.length === 0) {
    if (DOM.productsEmptyState) DOM.productsEmptyState.classList.remove('hidden');
    DOM.productsListContainer.classList.add('hidden');
    return;
  }

  if (DOM.productsEmptyState) DOM.productsEmptyState.classList.add('hidden');
  DOM.productsListContainer.classList.remove('hidden');

  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group";

    const metalCount = (prod.bom || []).length;
    const processCount = (prod.processes || []).length;
    const miscCount = (prod.miscItems || []).length;
    const totalParts = metalCount + processCount + miscCount;

    const metalCost = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
    const processCost = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const miscCost = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const subtotal = metalCost + processCost + miscCost;
    const profitAmount = subtotal * ((prod.profitPercentage || 0) / 100);
    const grandTotal = subtotal + profitAmount;
    const isCurrentlyInQuote = prod.inQuote !== false;

    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/40 flex items-center justify-center font-black shadow-sm">
              <i data-lucide="package" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">${escapeHTML(prod.name)}</h3>
                ${isCurrentlyInQuote ? `
                  <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">In Quote</span>
                ` : `
                  <span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">In Library</span>
                `}
              </div>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">${totalParts} Line Item(s) configured • ${formatINR(grandTotal)}</span>
            </div>
          </div>
          <button type="button" class="btn-delete-product p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer" title="Delete Product from Catalog">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
        <button type="button" class="btn-open-calc flex-1 inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-sm active:scale-95 transition-all cursor-pointer">
          <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
          <span>Calculate / Workings</span>
        </button>
        ${isCurrentlyInQuote ? `
          <button type="button" class="btn-view-quotation inline-flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold py-2 px-3 rounded-xl text-xs active:scale-95 transition-all border border-emerald-200 dark:border-emerald-800/60 cursor-pointer" title="View in Quotation Table">
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>In Quote</span>
          </button>
        ` : `
          <button type="button" class="btn-add-to-quote inline-flex items-center justify-center gap-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-950/50 dark:hover:text-brand-400 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs active:scale-95 transition-all cursor-pointer" title="Add to Quotation Table">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Add to Quote</span>
          </button>
        `}
      </div>
    `;

    card.querySelector('.btn-open-calc').addEventListener('click', () => {
      selectProductForCalculation(prod.id);
    });

    const viewQuoteBtn = card.querySelector('.btn-view-quotation');
    if (viewQuoteBtn) {
      viewQuoteBtn.addEventListener('click', () => {
        switchEmployeeView('quotation');
      });
    }

    const addToQuoteBtn = card.querySelector('.btn-add-to-quote');
    if (addToQuoteBtn) {
      addToQuoteBtn.addEventListener('click', () => {
        prod.inQuote = true;
        saveUserDataToServer();
        showToast({
          title: 'Added to Quote',
          message: `"${prod.name}" has been added to your quotation.`,
          type: 'success'
        });
        renderProductsList();
      });
    }

    card.querySelector('.btn-delete-product').addEventListener('click', () => {
      handleDeleteProduct(prod.id);
    });

    DOM.productsListContainer.appendChild(card);
  });

  lucide.createIcons();
}

function openQuickAddProductModal() {
  if (DOM.quickAddProductModal) {
    if (DOM.quickProductNameInput) DOM.quickProductNameInput.value = '';
    if (DOM.quickProductQtyInput) DOM.quickProductQtyInput.value = '1';
    DOM.quickAddProductModal.classList.remove('hidden');
    setTimeout(() => {
      if (DOM.quickProductNameInput) DOM.quickProductNameInput.focus();
    }, 100);
    lucide.createIcons();
  }
}

function closeQuickAddProductModal() {
  if (DOM.quickAddProductModal) {
    DOM.quickAddProductModal.classList.add('hidden');
  }
}

function handleQuickAddProduct(openWorkingsNow = false) {
  if (!DOM.quickProductNameInput) return;
  const name = DOM.quickProductNameInput.value.trim();
  if (!name) {
    showToast({ title: 'Product Name Required', message: 'Please enter a product description or name.', type: 'warning' });
    return;
  }

  const rawQty = parseInt(DOM.quickProductQtyInput ? DOM.quickProductQtyInput.value : '1');
  const qty = (!isNaN(rawQty) && rawQty > 0) ? rawQty : 1;

  if (!state.products) state.products = [];
  const newProd = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name,
    quantity: qty,
    inQuote: true,
    bom: [],
    processes: [],
    miscItems: [],
    profitPercentage: 0,
    createdAt: new Date().toISOString()
  };

  state.products.push(newProd);
  state.activeProductId = newProd.id;
  closeQuickAddProductModal();

  if (openWorkingsNow) {
    // Reset calculator buffer for new product and jump to Workings
    state.bom = [];
    state.processes = [];
    state.miscItems = [];
    state.profitPercentage = 0;
    if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = 0;
    saveUserDataToServer();
    updateActiveProductHeader();
    switchEmployeeView('calculator');
    showToast({
      title: 'Product Created',
      message: `Opened Workings for "${newProd.name}". Add metal shapes & processes.`,
      type: 'success',
      duration: 3500
    });
  } else {
    saveUserDataToServer();
    renderQuotationTabView();
    showToast({
      title: 'Product Added',
      message: `"${newProd.name}" added to quotation. Click "Workings" to add calculations.`,
      type: 'success',
      duration: 3500
    });
  }
}

function renderQuotationTabView() {
  if (!DOM.quotationProductsContainer) return;
  DOM.quotationProductsContainer.innerHTML = '';

  const products = (state.products || []).filter(p => p.inQuote !== false);
  if (DOM.quotationProductsCountBadge) {
    DOM.quotationProductsCountBadge.textContent = `${products.length} Product${products.length === 1 ? '' : 's'} in Quotation`;
  }

  let totalMaterialsAll = 0;
  let totalProcessesAll = 0;
  let totalMiscAll = 0;
  let grandTotalAll = 0;

  // Compute product costs and subtotals
  products.forEach((prod) => {
    const prodQty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
    prod.quantity = prodQty;

    const unitMaterials = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
    const unitProcesses = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const unitMisc = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const unitSubtotal = unitMaterials + unitProcesses + unitMisc;
    const unitProfit = unitSubtotal * ((prod.profitPercentage || 0) / 100);
    const unitTotal = unitSubtotal + unitProfit;
    const unitWeight = (prod.bom || []).reduce((acc, x) => acc + (x.totalWeight || 0), 0);

    const prodTotal = unitTotal * prodQty;
    const totalWeight = unitWeight * prodQty;
    prod.unitTotal = unitTotal;
    prod.grandTotal = prodTotal;
    prod.totalWeight = totalWeight;

    totalMaterialsAll += unitMaterials * prodQty;
    totalProcessesAll += unitProcesses * prodQty;
    totalMiscAll += unitMisc * prodQty;
    grandTotalAll += prodTotal;
  });

  // Main Executive Quotation Table Container (Matching Sketch)
  const tableWrapper = document.createElement('div');
  tableWrapper.className = "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden";

  let rowsHTML = '';
  if (products.length === 0) {
    const totalCatalogCount = (state.products || []).length;
    rowsHTML = `
      <tr>
        <td colspan="7" class="py-12 px-4 text-center">
          <div class="space-y-3 max-w-sm mx-auto">
            <div class="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 mx-auto flex items-center justify-center shadow-inner">
              <i data-lucide="package-plus" class="w-6 h-6"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Quotation Sheet is Empty</h3>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                ${totalCatalogCount > 0 
                  ? `You have ${totalCatalogCount} product${totalCatalogCount === 1 ? '' : 's'} saved in your Products catalog.` 
                  : 'Add a new product to begin creating calculations.'}
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button type="button" id="quote-empty-add-prod-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add New Product</span>
              </button>
              ${totalCatalogCount > 0 ? `
                <button type="button" id="quote-empty-browse-catalog-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer">
                  <i data-lucide="folder-open" class="w-3.5 h-3.5"></i>
                  <span>Browse Products (${totalCatalogCount})</span>
                </button>
              ` : ''}
            </div>
          </div>
        </td>
      </tr>
    `;
  } else {
    products.forEach((prod, pIdx) => {
      const compCount = (prod.bom || []).length + (prod.processes || []).length + (prod.miscItems || []).length;
      const prodDate = prod.date || (prod.createdAt ? new Date(prod.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));
      
      // Breakdown rows for optional inspection
      let bomRowsHTML = '';
      if ((prod.bom || []).length > 0) {
        prod.bom.forEach((item) => {
          bomRowsHTML += `
            <tr class="border-b border-slate-100 dark:border-slate-800/60 text-xs">
              <td class="py-2 px-3 text-center w-12 select-none">
                <input type="checkbox" class="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer pdf-bom-toggle" data-bom-id="${item.id}" data-prod-id="${prod.id}" ${item.includeInPDF !== false ? 'checked' : ''} title="Include in PDF Export">
              </td>
              <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                ${escapeHTML(item.label || item.shapeName)}
                <span class="block text-[10px] text-slate-400 font-normal">${escapeHTML(item.dimDesc || '')} • ${item.unitWeight ? item.unitWeight.toFixed(2) + ' kg' : ''}</span>
              </td>
              <td class="py-2 px-3 text-center">${item.quantity || 1}</td>
              <td class="py-2 px-3 text-right font-mono">${item.rate > 0 ? '₹' + item.rate.toFixed(2) : '-'}</td>
              <td class="py-2 px-3 text-right font-mono font-bold">${formatINR(item.totalCost || 0)}</td>
            </tr>
          `;
        });
      }

      let procRowsHTML = '';
      if ((prod.processes || []).length > 0) {
        prod.processes.forEach((proc) => {
          procRowsHTML += `
            <tr class="border-b border-slate-100 dark:border-slate-800/60 text-xs">
              <td class="py-2 px-3 text-center w-12 select-none">
                <input type="checkbox" class="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer pdf-proc-toggle" data-proc-id="${proc.id}" data-prod-id="${prod.id}" ${proc.includeInPDF !== false ? 'checked' : ''} title="Include in PDF Export">
              </td>
              <td class="py-2 px-3 text-indigo-700 dark:text-indigo-300 font-semibold">${escapeHTML(proc.name)}</td>
              <td class="py-2 px-3 text-center">${proc.duration} min</td>
              <td class="py-2 px-3 text-right font-mono">₹${(proc.rate || 0).toFixed(2)}/min</td>
              <td class="py-2 px-3 text-right font-mono font-bold">${formatINR(proc.cost || 0)}</td>
            </tr>
          `;
        });
      }

      let miscRowsHTML = '';
      if ((prod.miscItems || []).length > 0) {
        prod.miscItems.forEach((misc) => {
          miscRowsHTML += `
            <tr class="border-b border-slate-100 dark:border-slate-800/60 text-xs">
              <td class="py-2 px-3 text-center w-12 select-none">
                <input type="checkbox" class="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer pdf-misc-toggle" data-misc-id="${misc.id}" data-prod-id="${prod.id}" ${misc.includeInPDF !== false ? 'checked' : ''} title="Include in PDF Export">
              </td>
              <td class="py-2 px-3 text-amber-700 dark:text-amber-300 font-semibold">${escapeHTML(misc.name)}</td>
              <td class="py-2 px-3 text-center">${misc.qty || 1}</td>
              <td class="py-2 px-3 text-right font-mono">₹${(misc.unitCost || 0).toFixed(2)}</td>
              <td class="py-2 px-3 text-right font-mono font-bold">${formatINR(misc.cost || 0)}</td>
            </tr>
          `;
        });
      }

      rowsHTML += `
        <!-- Main Product Row -->
        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
          <td class="py-4 px-3 text-center font-black text-slate-500 dark:text-slate-400 text-xs select-none">
            ${pIdx + 1}
          </td>
          <td class="py-4 px-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono select-none">
            ${escapeHTML(prodDate)}
          </td>
          <td class="py-4 px-5">
            <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span class="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">${escapeHTML(prod.name)}</span>
              <button type="button" class="btn-quote-workings inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-cyan-300 border border-brand-200 dark:border-brand-800/80 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer" data-prod-id="${prod.id}" title="Open Calculator to work and add calculations for this product">
                <i data-lucide="calculator" class="w-3.5 h-3.5 text-brand-500 dark:text-cyan-400"></i>
                <span>Workings</span>
              </button>
              ${compCount > 0 ? `
                <button type="button" class="btn-toggle-details text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer" data-prod-id="${prod.id}" title="Toggle component breakdown">
                  <span>(${compCount} item${compCount === 1 ? '' : 's'})</span>
                  <i data-lucide="chevron-down" class="w-3 h-3 transition-transform duration-200"></i>
                </button>
              ` : `
                <span class="text-[10px] text-slate-400 dark:text-slate-500 italic">(Empty - click Workings)</span>
              `}
            </div>
          </td>
          <td class="py-4 px-3 text-center">
            <input type="number" min="1" step="1" value="${prod.quantity}" data-prod-id="${prod.id}" class="quote-input-prod-qty w-16 text-center text-xs font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono shadow-inner transition-all" />
          </td>
          <td class="py-4 px-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
            ${formatINR(prod.unitTotal)}
          </td>
          <td class="py-4 px-4 text-right font-mono font-black text-slate-950 dark:text-white text-xs sm:text-sm">
            ${formatINR(prod.grandTotal)}
          </td>
          <td class="py-4 px-3 text-center">
            <button type="button" class="btn-quote-del-prod p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer" data-prod-id="${prod.id}" title="Remove Product from Quotation Table">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>

        <!-- Expandable Details Row (Hidden by default) -->
        <tr id="quote-details-${prod.id}" class="hidden bg-slate-50/60 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
          <td colspan="7" class="p-3 sm:px-8">
            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div class="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span>Calculated Components for ${escapeHTML(prod.name)}</span>
                <span class="text-slate-400 font-normal">Checked items are included in PDF Quotes</span>
              </div>
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase">
                    <th class="py-2 px-3 text-center w-12">PDF?</th>
                    <th class="py-2 px-3">Item / Process Description</th>
                    <th class="py-2 px-3 text-center">Qty / Duration</th>
                    <th class="py-2 px-3 text-right">Unit Rate</th>
                    <th class="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
                  ${(bomRowsHTML || procRowsHTML || miscRowsHTML) ? (bomRowsHTML + procRowsHTML + miscRowsHTML) : '<tr><td colspan="5" class="py-3 text-center text-slate-400 italic">No calculation items yet. Click Workings to add.</td></tr>'}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      `;
    });
  }

  tableWrapper.innerHTML = `
    <div class="overflow-x-auto scroller">
      <table class="w-full text-left border-collapse min-w-[720px]">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
            <th class="py-3.5 px-3 text-center w-14">Sl. No</th>
            <th class="py-3.5 px-3 text-center w-28">Date</th>
            <th class="py-3.5 px-5">Description</th>
            <th class="py-3.5 px-3 text-center w-24">QTY</th>
            <th class="py-3.5 px-4 text-right w-36">Rate</th>
            <th class="py-3.5 px-4 text-right w-36">AMT</th>
            <th class="py-3.5 px-3 text-center w-16">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          ${rowsHTML}
        </tbody>
        <tbody class="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <tr>
            <td colspan="7" class="py-3.5 px-6">
              <button type="button" id="quote-table-add-product-btn" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-800/80 hover:border-brand-500 dark:hover:border-brand-500 bg-brand-50/60 hover:bg-brand-50 dark:bg-brand-950/30 dark:hover:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm">
                <i data-lucide="plus-circle" class="w-4 h-4 text-brand-500"></i>
                <span>+ Add Product</span>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-slate-900 dark:bg-slate-950 text-white font-extrabold border-t-2 border-brand-500">
            <td colspan="5" class="py-4 px-6 text-right uppercase tracking-wider text-slate-300 font-bold text-xs sm:text-sm">
              Total Cost:
            </td>
            <td class="py-4 px-4 text-right font-mono text-base sm:text-lg font-black text-cyan-400">
              ${formatINR(grandTotalAll)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  DOM.quotationProductsContainer.appendChild(tableWrapper);

  // Attach Event Listeners
  const addBtn = tableWrapper.querySelector('#quote-table-add-product-btn');
  if (addBtn) {
    addBtn.addEventListener('click', openQuickAddProductModal);
  }

  const emptyAddBtn = tableWrapper.querySelector('#quote-empty-add-prod-btn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', openQuickAddProductModal);
  }

  const emptyBrowseBtn = tableWrapper.querySelector('#quote-empty-browse-catalog-btn');
  if (emptyBrowseBtn) {
    emptyBrowseBtn.addEventListener('click', () => switchEmployeeView('products'));
  }

  // Workings Button
  tableWrapper.querySelectorAll('.btn-quote-workings').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-prod-id');
      selectProductForCalculation(prodId);
    });
  });

  // Toggle Details
  tableWrapper.querySelectorAll('.btn-toggle-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-prod-id');
      const detailsRow = tableWrapper.querySelector(`#quote-details-${prodId}`);
      if (detailsRow) {
        detailsRow.classList.toggle('hidden');
        const icon = btn.querySelector('svg, i');
        if (icon) {
          icon.classList.toggle('rotate-180');
        }
      }
    });
  });

  // Remove Product from Quote Table (Leaves it safe in Products tab)
  tableWrapper.querySelectorAll('.btn-quote-del-prod').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-prod-id');
      const prod = (state.products || []).find(p => p.id === prodId);
      if (prod) {
        prod.inQuote = false;
        saveUserDataToServer();
        renderQuotationTabView();
        if (state.currentTab === 'products') renderProductsList();
        showToast({
          title: 'Removed from Quote',
          message: `"${prod.name}" removed from quotation table. It remains safely saved in your Products tab.`,
          type: 'info',
          duration: 3500
        });
      }
    });
  });

  // Quantity Multiplier Input
  tableWrapper.querySelectorAll('.quote-input-prod-qty').forEach(input => {
    input.addEventListener('input', (e) => {
      const prodId = e.target.getAttribute('data-prod-id');
      const prod = (state.products || []).find(p => p.id === prodId);
      if (prod) {
        const val = parseInt(e.target.value);
        const newQty = (isNaN(val) || val < 1) ? 1 : val;
        prod.quantity = newQty;
        saveUserDataToServer();
        renderQuotationTabView();
      }
    });
  });

  // Checkbox Toggles
  tableWrapper.querySelectorAll('.pdf-bom-toggle').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const pId = e.target.getAttribute('data-prod-id');
      const bId = e.target.getAttribute('data-bom-id');
      const prod = (state.products || []).find(p => p.id === pId);
      if (prod) {
        const bItem = (prod.bom || []).find(x => x.id === bId);
        if (bItem) {
          bItem.includeInPDF = e.target.checked;
          saveUserDataToServer();
        }
      }
    });
  });

  tableWrapper.querySelectorAll('.pdf-proc-toggle').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const pId = e.target.getAttribute('data-prod-id');
      const prId = e.target.getAttribute('data-proc-id');
      const prod = (state.products || []).find(p => p.id === pId);
      if (prod) {
        const prItem = (prod.processes || []).find(x => x.id === prId);
        if (prItem) {
          prItem.includeInPDF = e.target.checked;
          saveUserDataToServer();
        }
      }
    });
  });

  tableWrapper.querySelectorAll('.pdf-misc-toggle').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const pId = e.target.getAttribute('data-prod-id');
      const mId = e.target.getAttribute('data-misc-id');
      const prod = (state.products || []).find(p => p.id === pId);
      if (prod) {
        const mItem = (prod.miscItems || []).find(x => x.id === mId);
        if (mItem) {
          mItem.includeInPDF = e.target.checked;
          saveUserDataToServer();
        }
      }
    });
  });

  // Update summary globals if present
  if (DOM.grandMetalCost) DOM.grandMetalCost.textContent = formatINR(totalMaterialsAll);
  if (DOM.grandProcessCost) DOM.grandProcessCost.textContent = formatINR(totalProcessesAll);
  if (DOM.grandMiscCost) DOM.grandMiscCost.textContent = formatINR(totalMiscAll);
  if (DOM.grandTotalCost) DOM.grandTotalCost.textContent = formatINR(grandTotalAll);

  lucide.createIcons();
}

async function loadUserQuotationHistory() {
  if (!state.currentUser) return;
  DOM.userHistoryTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
        <div class="flex items-center justify-center gap-2">
          <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          Loading quotation history...
        </div>
      </td>
    </tr>
  `;

  try {
    const orgName = localStorage.getItem('metal-current-org') || '';
    const url = orgName 
      ? `/api/user/transactions?username=${encodeURIComponent(state.currentUser)}&orgName=${encodeURIComponent(orgName)}`
      : `/api/user/transactions?username=${encodeURIComponent(state.currentUser)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load transaction history.');

    const data = await response.json();
    state.transactionsHistory = data.transactions || [];
    renderUserQuotationHistory(state.transactionsHistory);
  } catch (err) {
    console.error('History load error:', err);
    DOM.userHistoryTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-rose-500 font-bold">
          Failed to load quotation history. Please try again.
        </td>
      </tr>
    `;
  }
}

function renderUserQuotationHistory(txns) {
  if (!DOM.userHistoryTableBody) return;
  DOM.userHistoryTableBody.innerHTML = '';

  if (txns.length === 0) {
    DOM.userHistoryTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
          No previous quotations found. Export some quotes to log them here.
        </td>
      </tr>
    `;
    return;
  }

  txns.forEach(tx => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800";
    
    let prodName = tx.productName || '';
    if (!prodName) {
      if (Array.isArray(tx.bom) && tx.bom.length > 0) {
        const firstLabel = tx.bom[0].label || '';
        const match = firstLabel.match(/^\[(.*?)\]/);
        prodName = match ? match[1] : (tx.bom[0].label || 'Standard Product');
      } else {
        prodName = 'Standard Product';
      }
    }

    const dateStr = tx.date || 'N/A';
    const refNo = tx.id || 'N/A';
    const compName = tx.companyName || tx.orgName || 'arguscnc.com';
    const client = tx.customerName || 'Valued Client';
    const total = tx.grandTotal > 0 ? `₹ ${tx.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹ 0.00';

    row.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
        <div class="flex items-center gap-2">
          <span class="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900/40 flex-shrink-0">
            <i data-lucide="package" class="w-3.5 h-3.5"></i>
          </span>
          <span class="truncate max-w-[150px]">${escapeHTML(prodName)}</span>
        </div>
      </td>
      <td class="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">${dateStr}</td>
      <td class="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">${refNo}</td>
      <td class="py-3 px-4 font-semibold text-brand-600 dark:text-cyan-400">${compName}</td>
      <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">${client}</td>
      <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">${total}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-1">
          <button type="button" class="btn-preview-pdf p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all" title="Preview PDF (New Tab)">
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
          <button type="button" class="btn-download-pdf p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all" title="Download PDF">
            <i data-lucide="file-down" class="w-4 h-4"></i>
          </button>
          <button type="button" class="btn-edit-pdf p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all" title="Load & Edit in Calculator">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button type="button" class="btn-delete-pdf p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all" title="Delete Quote">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;

    row.querySelector('.btn-preview-pdf').addEventListener('click', () => {
      exportQuoteToPDF(tx, true);
    });

    row.querySelector('.btn-download-pdf').addEventListener('click', () => {
      exportQuoteToPDF(tx, false);
    });

    row.querySelector('.btn-edit-pdf').addEventListener('click', () => {
      handleEditQuotation(tx);
    });

    row.querySelector('.btn-delete-pdf').addEventListener('click', () => {
      showConfirmModal({
        title: 'Delete Quotation',
        message: `Are you sure you want to delete quotation reference ${refNo}? This action cannot be undone.`,
        confirmText: 'Delete Quote',
        onConfirm: () => {
          deleteUserQuotation(tx.id);
        }
      });
    });

    DOM.userHistoryTableBody.appendChild(row);
  });

  lucide.createIcons();
}

function handleEditQuotation(tx) {
  if (!tx) return;

  // 1. Deep copy BOM items, processes, and other expenses into active state
  state.bom = Array.isArray(tx.bom) ? JSON.parse(JSON.stringify(tx.bom)) : [];
  state.processes = Array.isArray(tx.processes) ? JSON.parse(JSON.stringify(tx.processes)) : [];
  state.miscItems = Array.isArray(tx.miscItems) ? JSON.parse(JSON.stringify(tx.miscItems)) : [];
  
  // 2. Set customer and profit parameters
  state.customerName = tx.customerName || '';
  state.customerAddress = tx.customerAddress || '';
  state.customerGSTIN = tx.customerGSTIN || '';
  state.profitPercentage = typeof tx.profitPercentage === 'number' ? tx.profitPercentage : (parseFloat(tx.profitPercentage) || 0);

  if (tx.customerName && tx.customerName !== 'Valued Client') {
    const existingClient = (state.clients || []).find(c => c.name.toLowerCase() === tx.customerName.toLowerCase());
    if (existingClient) {
      state.selectedClients = [existingClient];
    } else {
      const restoredClient = {
        id: 'cli_' + Date.now(),
        name: tx.customerName,
        address: tx.customerAddress || '',
        gstin: tx.customerGSTIN || ''
      };
      if (!state.clients) state.clients = [];
      state.clients.unshift(restoredClient);
      state.selectedClients = [restoredClient];
    }
  } else {
    state.selectedClients = [];
  }
  updateAppliedClientsDisplay();

  // 3. Set selected sub-company if present
  if (tx.companyName) {
    state.selectedCompany = tx.companyName;
    if (DOM.userDisplayOrg) {
      DOM.userDisplayOrg.textContent = tx.companyName;
    }
  }

  // 4. Update DOM inputs
  if (DOM.customerNameInput) DOM.customerNameInput.value = state.customerName;
  if (DOM.customerAddressInput) DOM.customerAddressInput.value = state.customerAddress;
  if (DOM.customerGSTINInput) DOM.customerGSTINInput.value = state.customerGSTIN;
  if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = state.profitPercentage;

  // 5. Persist and update all UI views
  saveUserDataToServer();
  updateAllDisplays();

  // 6. Switch view back to Calculator
  switchEmployeeView('calculator');
}

function filterUserQuotationHistory() {
  if (!DOM.historySearchInput) return;
  const q = DOM.historySearchInput.value.trim().toLowerCase();

  if (!q) {
    renderUserQuotationHistory(state.transactionsHistory);
    return;
  }

  const filtered = state.transactionsHistory.filter(tx => {
    const prod = (tx.productName || '').toLowerCase();
    const refNo = (tx.id || '').toLowerCase();
    const client = (tx.customerName || '').toLowerCase();
    const compName = (tx.companyName || tx.orgName || '').toLowerCase();
    return prod.includes(q) || refNo.includes(q) || client.includes(q) || compName.includes(q);
  });

  renderUserQuotationHistory(filtered);
}

async function deleteUserQuotation(id) {
  try {
    const orgName = localStorage.getItem('metal-current-org') || '';
    const url = orgName
      ? `/api/transactions/${id}?username=${encodeURIComponent(state.currentUser)}&orgName=${encodeURIComponent(orgName)}`
      : `/api/transactions/${id}?username=${encodeURIComponent(state.currentUser)}`;
    const response = await fetch(url, {
      method: 'DELETE'
    });
    if (response.ok) {
      loadUserQuotationHistory();
    } else {
      alert('Failed to delete quotation.');
    }
  } catch (err) {
    console.error('Delete quote failed:', err);
    alert('Server connection failed.');
  }
}

function saveBOMToStorage() {
  saveUserDataToServer();
  updateAllDisplays();
}

function saveProcessesToStorage() {
  saveUserDataToServer();
  updateAllDisplays();
}

function saveMiscToStorage() {
  saveUserDataToServer();
  updateAllDisplays();
}

function handleCustomerNameInput(e) {
  state.customerName = e.target.value.trim();
  saveUserDataToServer();
}

function handleCustomerAddressInput(e) {
  state.customerAddress = e.target.value.trim();
  saveUserDataToServer();
}

function handleCustomerGSTINInput(e) {
  state.customerGSTIN = e.target.value.trim();
  saveUserDataToServer();
}

function handleProfitPercentageInput(e) {
  state.profitPercentage = parseFloat(e.target.value) || 0;
  saveUserDataToServer();
  recalculateGrandTotal();
}

// --- Google Authentication Handlers ---
let googleClientId = '626458680124-0qlrhuebi0n3ooe53kvet29hp8nj264u.apps.googleusercontent.com';
let pendingGoogleUser = null;
let googleInitialized = false;

async function initGoogleSignIn() {
  try {
    const response = await fetch('/api/auth/google/config');
    if (response.ok) {
      const data = await response.json();
      if (data && data.clientId) {
        googleClientId = data.clientId;
      }
    }
  } catch (err) {
    console.warn('Google config endpoint warning (using fallback clientId):', err);
  } finally {
    attemptGoogleInit();
  }
}

function attemptGoogleInit() {
  if (!googleClientId) return;

  const checkAndInit = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      if (!googleInitialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSignInCallback,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          googleInitialized = true;
        } catch (initErr) {
          console.error('Google ID initialize error:', initErr);
        }
      }
      renderGoogleButton();
      return true;
    }
    return false;
  };

  if (!checkAndInit()) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (checkAndInit() || attempts >= 30) {
        clearInterval(interval);
      }
    }, 200);
  }
}

// Expose to window for index.html SDK callback
window.attemptGoogleInit = attemptGoogleInit;

function renderGoogleButton() {
  if (window.google && window.google.accounts && window.google.accounts.id && DOM.googleSigninBtn) {
    const isDark = document.documentElement.classList.contains('dark');
    const containerWidth = DOM.googleSigninBtn.parentElement 
      ? DOM.googleSigninBtn.parentElement.offsetWidth 
      : (window.innerWidth - 64);
    const responsiveWidth = Math.max(200, Math.min(380, containerWidth || 320));
    
    try {
      DOM.googleSigninBtn.innerHTML = '';
      window.google.accounts.id.renderButton(
        DOM.googleSigninBtn,
        { 
          type: "standard",
          shape: "rectangular",
          theme: isDark ? "filled_black" : "outline", 
          size: "large", 
          text: "continue_with",
          width: String(responsiveWidth),
          logo_alignment: "left"
        }
      );

      // Verify if iframe was injected; if so, display official button; otherwise fallback cleanly
      setTimeout(() => {
        const hasIframe = DOM.googleSigninBtn && DOM.googleSigninBtn.querySelector('iframe');
        if (hasIframe) {
          if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.add('hidden');
          if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.remove('hidden');
        } else {
          if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.remove('hidden');
          if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.add('hidden');
        }
      }, 300);
    } catch (e) {
      console.warn('Google button render notice:', e);
      if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.remove('hidden');
      if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.add('hidden');
    }
  } else {
    // If GIS is not loaded yet, display custom fallback button
    if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.remove('hidden');
    if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.add('hidden');
  }
}

function handleCustomGoogleSignInClick() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('Google prompt status:', notification.getNotDisplayedReason ? notification.getNotDisplayedReason() : 'prompt dismissed');
        }
      });
    } catch (err) {
      console.warn('Google prompt exception:', err);
    }
  } else {
    showToast({
      title: 'Google Sign-In',
      message: 'Google authentication service is initializing. You can sign in using your username/password.',
      type: 'info',
      duration: 3500
    });
  }
}

// Re-render Google button on screen resize / orientation change for responsiveness
window.addEventListener('resize', () => {
  if (DOM.appWrapper && DOM.appWrapper.classList.contains('hidden') && DOM.orgWrapper && DOM.orgWrapper.classList.contains('hidden')) {
    renderGoogleButton();
  }
});

async function handleGoogleSignInCallback(response) {
  DOM.authErrorMsg.classList.add('hidden');
  const credential = response.credential;
  
  try {
    const isOrgAdmin = (authRole === 'org');
    const endpoint = isOrgAdmin ? '/api/auth/google/admin' : '/api/auth/google';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    
    const data = await res.json();
    if (!res.ok || !data.success) {
      DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Google Sign-in failed.';
      DOM.authErrorMsg.classList.remove('hidden');
      return;
    }
    
    // Auto-route dynamically based on the verified role from the backend
    if (data.role === 'org') {
      localStorage.setItem('metal-current-user', data.orgName);
      localStorage.setItem('metal-current-user-type', 'org');
      if (data.googleId) localStorage.setItem('metal-current-googleId', data.googleId);
      localStorage.setItem('metal-current-org-status', data.status || 'pending');
      authenticateOrg(data.orgName, data.status || 'pending');
      showToast({
        title: 'Signed In',
        message: `Welcome, Organisation Admin (${data.orgName})`,
        type: 'success',
        duration: 3500
      });
    } else {
      localStorage.setItem('metal-current-user', data.username);
      localStorage.setItem('metal-current-user-type', 'user');
      localStorage.setItem('metal-current-org', data.orgName || '');
      authenticateUser(data.username, data.orgName || '');
      showToast({
        title: 'Signed In',
        message: `Welcome, @${data.username}`,
        type: 'success',
        duration: 3500
      });
    }
  } catch (err) {
    console.error('Google Sign-in error:', err);
    DOM.authErrorMsg.querySelector('span').textContent = 'Server connection failed.';
    DOM.authErrorMsg.classList.remove('hidden');
  }
}

async function handleEmployeeOrgSetupSubmit(e) {
  e.preventDefault();
  DOM.employeeOrgSetupError.classList.add('hidden');

  const orgName = DOM.employeeSetupOrgName.value.trim();
  const orgPassword = DOM.employeeSetupOrgPassword.value;

  try {
    const res = await fetch('/api/user/join-org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.currentUser,
        orgName,
        orgPassword
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('metal-current-org', data.orgName);
      authenticateUser(state.currentUser, data.orgName);
    } else {
      DOM.employeeOrgSetupError.textContent = data.error || 'Failed to link Organisation.';
      DOM.employeeOrgSetupError.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Join org error:', err);
    DOM.employeeOrgSetupError.textContent = 'Server connection failed.';
    DOM.employeeOrgSetupError.classList.remove('hidden');
  }
}

async function handleOrgSetupSubmit(e) {
  e.preventDefault();
  DOM.orgSetupError.classList.add('hidden');

  const newOrgName = DOM.orgSetupName.value.trim();
  const orgPassword = DOM.orgSetupPassword.value;
  const googleId = localStorage.getItem('metal-current-googleId');

  try {
    const res = await fetch('/api/auth/org/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleId,
        orgName: state.currentUser,
        newOrgName,
        orgPassword
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('metal-current-user', data.orgName);
      localStorage.setItem('metal-current-org-status', data.status || 'pending');
      authenticateOrg(data.orgName, data.status || 'pending');
    } else {
      DOM.orgSetupError.textContent = data.error || 'Failed to configure Organisation.';
      DOM.orgSetupError.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Org Setup error:', err);
    DOM.orgSetupError.textContent = 'Server connection failed.';
    DOM.orgSetupError.classList.remove('hidden');
  }
}

async function handleOrgSettingsSubmit(e) {
  e.preventDefault();
  DOM.orgSettingsSuccess.classList.add('hidden');
  DOM.orgSettingsError.classList.add('hidden');

  const newOrgName = DOM.orgSettingsName.value.trim();
  const orgPassword = DOM.orgSettingsPassword.value;
  const googleId = localStorage.getItem('metal-current-googleId');

  try {
    const res = await fetch('/api/auth/org/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleId,
        orgName: state.currentUser,
        newOrgName,
        orgPassword
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('metal-current-user', data.orgName);
      state.currentUser = data.orgName;
      DOM.orgUserDisplayName.textContent = data.orgName;
      DOM.orgDisplayTitle.textContent = data.orgName;
      
      DOM.orgSettingsSuccess.textContent = 'Organisation details updated successfully!';
      DOM.orgSettingsSuccess.classList.remove('hidden');
      DOM.orgSettingsPassword.value = '';
    } else {
      DOM.orgSettingsError.textContent = data.error || 'Failed to update Organisation settings.';
      DOM.orgSettingsError.classList.remove('hidden');
    }
  } catch (err) {
    console.error('Org Settings Update error:', err);
    DOM.orgSettingsError.textContent = 'Server connection failed.';
    DOM.orgSettingsError.classList.remove('hidden');
  }
}

// --- Theme Manager ---
function loadThemeSettings() {
  const colorScheme = localStorage.getItem("color-scheme");
  const isDark = colorScheme === "dark" || (!colorScheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  updateThemeToggleUI(isDark);
  
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("color-scheme")) {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      updateThemeToggleUI(e.matches);
    }
  });
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains("dark");
  const targetMode = isCurrentlyDark ? "light" : "dark";
  
  if (targetMode === "dark") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("color-scheme", "dark");
    document.querySelector('meta[name="color-scheme"]').content = "dark";
    updateThemeToggleUI(true);
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("color-scheme", "light");
    document.querySelector('meta[name="color-scheme"]').content = "light";
    updateThemeToggleUI(false);
  }
  if (googleInitialized) {
    renderGoogleButton();
  }
}

function updateThemeToggleUI(isDark) {
  if (isDark) {
    DOM.themeToggleIconDark.classList.remove('hidden');
    DOM.themeToggleIconLight.classList.add('hidden');
    if (DOM.orgThemeToggleIconDark && DOM.orgThemeToggleIconLight) {
      DOM.orgThemeToggleIconDark.classList.remove('hidden');
      DOM.orgThemeToggleIconLight.classList.add('hidden');
    }
  } else {
    DOM.themeToggleIconDark.classList.add('hidden');
    DOM.themeToggleIconLight.classList.remove('hidden');
    if (DOM.orgThemeToggleIconDark && DOM.orgThemeToggleIconLight) {
      DOM.orgThemeToggleIconDark.classList.add('hidden');
      DOM.orgThemeToggleIconLight.classList.remove('hidden');
    }
  }
}

// --- Shape Selector Grid ---
function renderShapeGrid() {
  DOM.shapeGrid.innerHTML = '';
  Object.keys(SHAPES).forEach(key => {
    const shape = SHAPES[key];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shape-btn flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500';
    button.setAttribute('data-shape-id', key);
    
    let iconStr = shape.icon;
    button.innerHTML = `
      <div class="text-slate-500 dark:text-slate-400 mb-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md group-hover:bg-brand-50 transition-colors">
        <i data-lucide="${iconStr}" class="w-4 h-4"></i>
      </div>
      <span class="text-[9px] font-bold text-slate-700 dark:text-slate-350 select-none leading-tight">${shape.name.split(' / ')[0]}</span>
    `;
    
    button.addEventListener('click', () => selectShape(key));
    DOM.shapeGrid.appendChild(button);
  });
}

function selectShape(shapeId) {
  state.activeShape = shapeId;
  DOM.shapeSelectMobile.value = shapeId;
  DOM.activeShapeBadge.textContent = SHAPES[shapeId].name;

  document.querySelectorAll('#shape-grid button').forEach(btn => {
    const btnShapeId = btn.getAttribute('data-shape-id');
    if (btnShapeId === shapeId) {
      btn.classList.add('shape-btn-active');
      btn.querySelector('div').classList.add('bg-brand-100', 'text-brand-600', 'dark:bg-cyan-950/50', 'dark:text-cyan-400');
    } else {
      btn.classList.remove('shape-btn-active');
      btn.querySelector('div').classList.remove('bg-brand-100', 'text-brand-600', 'dark:bg-cyan-950/50', 'dark:text-cyan-400');
    }
  });

  document.querySelectorAll('.shape-svg').forEach(svg => svg.classList.add('hidden'));
  const activeSvg = document.getElementById(`svg-${shapeId}`);
  if (activeSvg) activeSvg.classList.remove('hidden');

  renderDimensionFields(shapeId);
  updateActivePresetGlobalButtonClass();
  calculate();
}

// --- Dynamic Form Builder ---
function renderDimensionFields(shapeId) {
  const shape = SHAPES[shapeId];
  DOM.dimensionsContainer.innerHTML = '';
  
  shape.fields.forEach(field => {
    let defaultUnit = field.defaultUnit;
    if (field.id !== 'length' && field.id !== 'thickness' && field.id !== 'wallThickness' && field.id !== 'flangeThickness' && field.id !== 'webThickness') {
      defaultUnit = state.globalUnit === 'mm' ? 'mm' : 'in';
    } else if (field.id === 'length') {
      defaultUnit = state.globalUnit === 'mm' ? 'mm' : 'in';
    }
    
    state.dimensions[field.id] = field.defaultVal;
    state.dimensions[`${field.id}Unit`] = defaultUnit;

    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-1';
    
    wrapper.innerHTML = `
      <label for="input-${field.id}" class="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
        ${field.label}
      </label>
      <div class="flex shadow-sm rounded-lg">
        <input type="number" id="input-${field.id}" step="any" min="0" value="${field.defaultVal}" 
          class="w-full rounded-l-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 font-semibold shadow-sm text-xs" 
          data-field-id="${field.id}">
        <select id="unit-${field.id}" class="rounded-r-lg border border-l-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 py-1.5 px-2 text-slate-700 dark:text-slate-350 font-bold focus:ring-brand-500 focus:border-brand-500 text-[11px] shadow-sm"
          data-field-id="${field.id}">
          <option value="mm" ${defaultUnit === 'mm' ? 'selected' : ''}>mm</option>
          <option value="cm" ${defaultUnit === 'cm' ? 'selected' : ''}>cm</option>
          <option value="m" ${defaultUnit === 'm' ? 'selected' : ''}>m</option>
          <option value="in" ${defaultUnit === 'in' ? 'selected' : ''}>in</option>
          <option value="ft" ${defaultUnit === 'ft' ? 'selected' : ''}>ft</option>
        </select>
      </div>
    `;

    const input = wrapper.querySelector('input');
    const select = wrapper.querySelector('select');
    
    input.addEventListener('input', (e) => {
      state.dimensions[field.id] = parseFloat(e.target.value) || 0;
      updateSVGDimensionLabels();
      calculate();
    });
    
    input.addEventListener('focus', () => highlightSVGDimension(field.svgDim, true));
    input.addEventListener('blur', () => highlightSVGDimension(field.svgDim, false));
    
    select.addEventListener('change', (e) => {
      state.dimensions[`${field.id}Unit`] = e.target.value;
      updateSVGDimensionLabels();
      calculate();
    });

    DOM.dimensionsContainer.appendChild(wrapper);
  });

  updateSVGDimensionLabels();
}

function applyGlobalUnitPreset(unit) {
  state.globalUnit = unit;
  updateActivePresetGlobalButtonClass();

  const activeFields = SHAPES[state.activeShape].fields;
  activeFields.forEach(field => {
    let targetUnit = unit;
    if (field.id === 'length') {
      targetUnit = unit === 'mm' ? 'mm' : 'in';
    }
    
    const inputSelect = document.getElementById(`unit-${field.id}`);
    if (inputSelect) {
      inputSelect.value = targetUnit;
      state.dimensions[`${field.id}Unit`] = targetUnit;
    }
  });

  updateSVGDimensionLabels();
  calculate();
}

function updateActivePresetGlobalButtonClass() {
  document.querySelectorAll('.unit-preset-btn').forEach(btn => {
    const btnUnit = btn.getAttribute('data-unit');
    if (btnUnit === state.globalUnit) {
      btn.className = 'unit-preset-btn px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-white dark:bg-slate-700 text-brand-600 dark:text-cyan-400 shadow-sm';
    } else {
      btn.className = 'unit-preset-btn px-2.5 py-0.5 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white';
    }
  });
}

// --- SVG Dimension Labels ---
function highlightSVGDimension(svgDimName, active) {
  const activeSvg = document.getElementById(`svg-${state.activeShape}`);
  if (!activeSvg || !svgDimName) return;
  
  const targetGroup = activeSvg.querySelector(`g[data-dim-group="${svgDimName}"]`);
  if (targetGroup) {
    if (active) {
      targetGroup.classList.add('dim-highlight');
    } else {
      targetGroup.classList.remove('dim-highlight');
    }
  }
}

function updateSVGDimensionLabels() {
  const activeSvg = document.getElementById(`svg-${state.activeShape}`);
  if (!activeSvg) return;

  const shape = SHAPES[state.activeShape];
  shape.fields.forEach(field => {
    const val = state.dimensions[field.id] || 0;
    const unit = state.dimensions[`${field.id}Unit`] || 'mm';
    const group = activeSvg.querySelector(`g[data-dim-group="${field.svgDim}"]`);
    
    if (group) {
      const textElem = group.querySelector('text');
      if (textElem) {
        const placeholderChar = field.svgDim === 'widthAcrossFlats' ? 's' : (field.svgDim === 'outerDiameter' ? 'd' : (field.svgDim === 'wallThickness' || field.svgDim === 'thickness' || field.svgDim === 'flangeThickness' ? 't' : field.svgDim.charAt(0)));
        if (val > 0) {
          textElem.textContent = `${val} ${unit}`;
        } else {
          textElem.textContent = placeholderChar;
        }
      }
    }
  });
}

// --- Material presets loader ---
function populateMaterialPresetsDropdown() {
  DOM.materialSelect.innerHTML = '';
  MATERIALS.forEach(mat => {
    const opt = document.createElement('option');
    opt.value = mat.id;
    opt.textContent = `${mat.name} (${mat.density.toFixed(2)} g/cm³)`;
    DOM.materialSelect.appendChild(opt);
  });
  
  DOM.materialSelect.value = state.activeMaterial;
  DOM.densityInput.value = state.density;
}

function handleMaterialChange(e) {
  const selectedId = e.target.value;
  state.activeMaterial = selectedId;
  const mat = MATERIALS.find(m => m.id === selectedId);
  if (mat) {
    state.density = mat.density;
    DOM.densityInput.value = mat.density;
    calculate();
  }
}

function handleDensityInput(e) {
  const inputVal = parseFloat(e.target.value);
  if (!isNaN(inputVal) && inputVal > 0) {
    state.density = inputVal;
    state.activeMaterial = 'custom';
    DOM.materialSelect.value = 'custom';
    calculate();
  }
}

// --- Pricing / Qty handlers ---
function handlePriceInput(e) {
  state.price = parseFloat(e.target.value) || 0;
  calculate();
}

function handlePriceUnitChange(e) {
  state.priceUnit = e.target.value;
  calculate();
}

function handleQuantityInput(e) {
  state.quantity = parseInt(e.target.value) || 1;
  calculate();
}

// --- Weight Calculation engine ---
let lastCalcResults = null;

function calculate() {
  const shape = SHAPES[state.activeShape];
  if (!shape) return;

  const volume = shape.calcVolume(state.dimensions);
  const weightG = volume * state.density;
  const weightKg = weightG / 1000;
  const weightLbs = weightKg * 2.20462262;
  const weightTonnes = weightKg / 1000;
  
  const batchWeightKg = weightKg * state.quantity;
  const batchWeightLbs = weightLbs * state.quantity;
  const batchWeightGrams = weightG * state.quantity;
  const batchWeightTonnes = weightTonnes * state.quantity;

  let cost = 0;
  if (state.price > 0) {
    if (state.priceUnit === 'kg') {
      cost = batchWeightKg * state.price;
    } else if (state.priceUnit === 'lb') {
      cost = batchWeightLbs * state.price;
    }
  }

  DOM.resultWeightPrimary.textContent = batchWeightKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  DOM.resultWeightUnit.textContent = 'kg';
  DOM.resultWeightLbs.textContent = batchWeightLbs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  DOM.resultWeightGrams.textContent = batchWeightGrams.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  DOM.resultWeightTonnes.textContent = batchWeightTonnes.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  
  DOM.resultVolume.textContent = `${volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cm³`;
  DOM.resultDensity.textContent = `${state.density.toFixed(2)} g/cm³`;

  if (state.price > 0) {
    DOM.costResultCard.classList.remove('hidden');
    DOM.resultCost.textContent = formatINR(cost);
    DOM.costRateBadge.textContent = `Based on ₹ ${state.price.toFixed(2)}/${state.priceUnit} rate for ${state.quantity} pcs`;
  } else {
    DOM.costResultCard.classList.add('hidden');
  }

  lastCalcResults = {
    shapeId: state.activeShape,
    shapeName: shape.name,
    materialName: MATERIALS.find(m => m.id === state.activeMaterial)?.name || 'Custom',
    dimensions: { ...state.dimensions },
    unitWeight: weightKg,
    totalWeight: batchWeightKg,
    volume: volume,
    density: state.density,
    quantity: state.quantity,
    rate: state.price,
    rateUnit: state.priceUnit,
    totalCost: cost
  };
}

// --- Render Separate Costing Config Cards (Above Unified BOM Table) ---
function renderSeparateEditors() {
  if (!state.currentUser) return;

  // 1. Process List
  DOM.processesList.innerHTML = '';
  let processCostSum = 0;

  // Render/Update the datalist for process options
  let datalistEl = document.getElementById('process-datalist-options');
  if (!datalistEl) {
    datalistEl = document.createElement('datalist');
    datalistEl.id = 'process-datalist-options';
    document.body.appendChild(datalistEl);
  }
  datalistEl.innerHTML = '';
  if (state.processRates && state.processRates.length > 0) {
    state.processRates.forEach(prof => {
      const opt = document.createElement('option');
      opt.value = prof.name;
      opt.label = `₹${prof.rate.toFixed(2)}/min`;
      datalistEl.appendChild(opt);
    });
  }
  
  if (state.processes.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="4" class="text-center py-6 text-slate-400 dark:text-slate-500 font-medium">
        No operations configured. Click "Add Operation" above.
      </td>
    `;
    DOM.processesList.appendChild(emptyRow);
  } else {
    state.processes.forEach((proc) => {
      processCostSum += proc.cost;
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors';

      row.innerHTML = `
        <td class="py-2.5 px-3">
          <div class="relative w-full max-w-[240px]">
            <input 
              type="text" 
              list="process-datalist-options"
              value="${escapeHTML(proc.name || '')}" 
              placeholder="Search or type operation..." 
              class="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm transition-all truncate" 
              data-proc-id="${proc.id}" 
              data-prop="name"
              autocomplete="off"
            >
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 dark:text-slate-500">
              <i data-lucide="search" class="w-3.5 h-3.5"></i>
            </div>
          </div>
        </td>
        <td class="py-2.5 px-3 text-center">
          <input type="number" min="0" value="${proc.duration}" class="table-input text-center w-14 font-bold" data-proc-id="${proc.id}" data-prop="duration">
        </td>
        <td class="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
          ${formatINR(proc.cost)}
        </td>
        <td class="py-2.5 px-3 text-center">
          <button class="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-450 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95" data-del-proc-id="${proc.id}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      `;

      const nameInput = row.querySelector('input[data-prop="name"]');
      const handleNameChange = (e) => {
        const newName = e.target.value.trim();
        proc.name = newName;
        const matchedProfile = state.processRates.find(p => p.name.toLowerCase() === newName.toLowerCase());
        if (matchedProfile) {
          proc.rate = matchedProfile.rate;
        }
        proc.cost = proc.duration * proc.rate;
        saveProcessesToStorage();
      };

      nameInput.addEventListener('change', handleNameChange);
      nameInput.addEventListener('input', (e) => {
        const newName = e.target.value.trim();
        const matchedProfile = state.processRates.find(p => p.name.toLowerCase() === newName.toLowerCase());
        if (matchedProfile) {
          proc.name = matchedProfile.name;
          proc.rate = matchedProfile.rate;
          proc.cost = proc.duration * proc.rate;
          saveProcessesToStorage();
        }
      });

      row.querySelector('input[data-prop="duration"]').addEventListener('change', (e) => {
        const val = parseInt(e.target.value) || 0;
        proc.duration = val;
        proc.cost = proc.duration * proc.rate;
        saveProcessesToStorage();
      });

      row.querySelector(`button[data-del-proc-id="${proc.id}"]`).addEventListener('click', () => {
        state.processes = state.processes.filter(x => x.id !== proc.id);
        saveProcessesToStorage();
      });

      DOM.processesList.appendChild(row);
    });
  }
  DOM.processTotalCostDisplay.textContent = formatINR(processCostSum);

  // 2. Misc Items List
  DOM.miscList.innerHTML = '';
  let miscCostSum = 0;

  if (state.miscItems.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" class="text-center py-6 text-slate-400 dark:text-slate-500 font-medium">
        No other expense items added. Click "Add Material" above.
      </td>
    `;
    DOM.miscList.appendChild(emptyRow);
  } else {
    state.miscItems.forEach((item) => {
      miscCostSum += item.cost;
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors';
      row.innerHTML = `
        <td class="py-2.5 px-3">
          <input type="text" value="${item.name}" class="table-input font-bold text-slate-800 dark:text-white w-full max-w-[200px]" data-misc-id="${item.id}" data-prop="name">
        </td>
        <td class="py-2.5 px-3 text-center">
          <input type="number" min="0" value="${item.qty}" class="table-input text-center w-12 font-bold" data-misc-id="${item.id}" data-prop="qty">
        </td>
        <td class="py-2.5 px-3 text-right">
          <div class="inline-flex items-center gap-0.5 justify-end">
            <span class="text-[10px] text-slate-450">₹</span>
            <input type="number" min="0" step="any" value="${item.unitCost}" class="table-input text-right w-16 font-bold" data-misc-id="${item.id}" data-prop="unitCost">
          </div>
        </td>
        <td class="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
          ${formatINR(item.cost)}
        </td>
        <td class="py-2.5 px-3 text-center">
          <button class="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-450 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95" data-del-misc-id="${item.id}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </td>
      `;

      row.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
          const prop = e.target.getAttribute('data-prop');
          let val = e.target.value;
          if (prop === 'qty') val = parseInt(val) || 0;
          if (prop === 'unitCost') val = parseFloat(val) || 0;
          item[prop] = val;
          item.cost = item.qty * item.unitCost;
          saveMiscToStorage();
        });
      });

      row.querySelector(`button[data-del-misc-id="${item.id}"]`).addEventListener('click', () => {
        state.miscItems = state.miscItems.filter(x => x.id !== item.id);
        saveMiscToStorage();
      });

      DOM.miscList.appendChild(row);
    });
  }
  DOM.miscTotalCostDisplay.textContent = formatINR(miscCostSum);

  lucide.createIcons();
}

// --- Unified Quote Sheet Renderer (BOM + Processes + Misc Merged - Read Only View for Sub-sections) ---
function renderUnifiedTable() {
  DOM.historyList.innerHTML = '';

  // ----------------------------------------------------
  // SECTION 1: Metal Components
  // ----------------------------------------------------
  const metalsHeaderRow = document.createElement('tr');
  metalsHeaderRow.className = 'bg-slate-50 dark:bg-slate-900 border-l-4 border-brand-500 select-none';
  metalsHeaderRow.innerHTML = `
    <td colspan="5" class="py-2.5 px-4 text-brand-600 dark:text-cyan-400 uppercase tracking-wider text-[10px] font-extrabold">
      1. Metal Shape Components (Raw Materials)
    </td>
  `;
  DOM.historyList.appendChild(metalsHeaderRow);

  if (state.bom.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'border-b border-slate-200 dark:border-slate-800/80';
    emptyRow.innerHTML = `
      <td colspan="5" class="text-center py-8 text-slate-400 dark:text-slate-500 font-medium">
        No metal components added. Use parameters card above to "Add to Quote".
      </td>
    `;
    DOM.historyList.appendChild(emptyRow);
  } else {
    state.bom.forEach((item) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors';
      
      const rateDesc = item.rate > 0 ? `₹${item.rate.toFixed(2)}/${item.rateUnit}` : '-';
      const costDesc = item.totalCost > 0 ? formatINR(item.totalCost) : '-';

      row.innerHTML = `
        <td class="py-3 px-4">
          <div class="flex flex-col">
            <input type="text" value="${item.label}" class="table-input font-bold text-slate-800 dark:text-white max-w-xs" data-item-id="${item.id}">
            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold ml-2">
              ${item.shapeName.split(' / ')[0]} (${item.dimDesc} • Unit Wt: ${item.unitWeight.toFixed(2)} kg)
            </span>
          </div>
        </td>
        <td class="py-3 px-4 text-center">
          <input type="number" min="1" value="${item.quantity}" class="table-input text-center w-16 font-bold" data-qty-item-id="${item.id}">
        </td>
        <td class="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
          ${rateDesc}
        </td>
        <td class="py-3 px-4 text-right font-bold text-slate-855 dark:text-slate-200 font-mono">
          ${costDesc}
        </td>
        <td class="py-3 px-4 text-center">
          <button class="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-450 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95" data-del-id="${item.id}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      `;

      // Inline edits for metals
      row.querySelector(`input[data-item-id="${item.id}"]`).addEventListener('change', (e) => {
        const newLabel = e.target.value.trim();
        if (newLabel) {
          item.label = newLabel;
          saveBOMToStorage();
        }
      });

      row.querySelector(`input[data-qty-item-id="${item.id}"]`).addEventListener('change', (e) => {
        const newQty = parseInt(e.target.value) || 1;
        item.quantity = newQty;
        item.totalWeight = item.unitWeight * newQty;
        if (item.rate > 0) {
          if (item.rateUnit === 'kg') {
            item.totalCost = item.totalWeight * item.rate;
          } else if (item.rateUnit === 'lb') {
            item.totalCost = item.totalWeight * 2.20462262 * item.rate;
          }
        }
        saveBOMToStorage();
      });

      row.querySelector(`button[data-del-id="${item.id}"]`).addEventListener('click', () => {
        state.bom = state.bom.filter(x => x.id !== item.id);
        saveBOMToStorage();
      });

      DOM.historyList.appendChild(row);
    });
  }

  // ----------------------------------------------------
  // SECTION 2: Process Operations (Read Only Summary)
  // ----------------------------------------------------
  const processesHeaderRow = document.createElement('tr');
  processesHeaderRow.className = 'bg-slate-50 dark:bg-slate-900 border-l-4 border-indigo-500 select-none';
  processesHeaderRow.innerHTML = `
    <td colspan="5" class="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] font-extrabold">
      2. Process Operations (Labor/Machining)
    </td>
  `;
  DOM.historyList.appendChild(processesHeaderRow);

  if (state.processes.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'border-b border-slate-200 dark:border-slate-800/80';
    emptyRow.innerHTML = `
      <td colspan="5" class="text-center py-4 text-slate-400 dark:text-slate-500 font-medium italic">
        No processes configured.
      </td>
    `;
    DOM.historyList.appendChild(emptyRow);
  } else {
    state.processes.forEach((proc) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-200/60 dark:border-slate-800/60 text-xs';
      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-white">
          <div class="flex flex-col ml-1">
            <span>${proc.name}</span>
            <span class="text-[10px] text-slate-450 font-semibold ml-1">
              Labor / Machinery Charges
            </span>
          </div>
        </td>
        <td class="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">
          ${proc.duration} min
        </td>
        <td class="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono">
          ₹${proc.rate.toFixed(2)}/min
        </td>
        <td class="py-3 px-4 text-right font-bold text-slate-855 dark:text-slate-200 font-mono">
          ${formatINR(proc.cost)}
        </td>
        <td class="py-3 px-4 text-center"></td>
      `;

      DOM.historyList.appendChild(row);
    });
  }

  // ----------------------------------------------------
  // SECTION 3: Other Expenses (Read Only Summary)
  // ----------------------------------------------------
  const miscHeaderRow = document.createElement('tr');
  miscHeaderRow.className = 'bg-slate-50 dark:bg-slate-900 border-l-4 border-amber-500 select-none';
  miscHeaderRow.innerHTML = `
    <td colspan="5" class="py-2.5 px-4 text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] font-extrabold">
      3. Other Expenses (Consumables / Bought-out)
    </td>
  `;
  DOM.historyList.appendChild(miscHeaderRow);

  if (state.miscItems.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'border-b border-slate-200 dark:border-slate-800/80';
    emptyRow.innerHTML = `
      <td colspan="5" class="text-center py-4 text-slate-400 dark:text-slate-500 font-medium italic">
        No other expenses configured.
      </td>
    `;
    DOM.historyList.appendChild(emptyRow);
  } else {
    state.miscItems.forEach((item) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-200/60 dark:border-slate-800/60 text-xs';
      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-white">
          <div class="flex flex-col ml-1">
            <span>${item.name}</span>
            <span class="text-[10px] text-slate-450 font-semibold ml-1">
              Consumables / Bought-out
            </span>
          </div>
        </td>
        <td class="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">
          ${item.qty} items
        </td>
        <td class="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono">
          ₹${item.unitCost.toFixed(2)} each
        </td>
        <td class="py-3 px-4 text-right font-bold text-slate-855 dark:text-slate-200 font-mono">
          ${formatINR(item.cost)}
        </td>
        <td class="py-3 px-4 text-center"></td>
      `;

      DOM.historyList.appendChild(row);
    });
  }

  // Refresh Lucide icons once render finishes
  lucide.createIcons();

  // Aggregate subtotal costs and print inside footer cells
  recalculateGrandTotal();
}

function addItemToBOM() {
  if (!lastCalcResults || lastCalcResults.totalWeight <= 0) {
    alert("Please enter valid positive dimensions before saving.");
    return;
  }

  const shape = SHAPES[state.activeShape];
  const descParts = [];
  shape.fields.forEach(f => {
    descParts.push(`${f.svgDim.toUpperCase()}=${state.dimensions[f.id]}${state.dimensions[`${f.id}Unit`]}`);
  });
  const dimDesc = descParts.join(' x ');

  const item = {
    id: Date.now().toString(),
    label: `${lastCalcResults.materialName} ${lastCalcResults.shapeName.split(' / ')[0]}`,
    shapeName: lastCalcResults.shapeName,
    materialName: lastCalcResults.materialName,
    dimDesc: dimDesc,
    unitWeight: lastCalcResults.unitWeight,
    quantity: lastCalcResults.quantity,
    totalWeight: lastCalcResults.totalWeight,
    rate: lastCalcResults.rate,
    rateUnit: lastCalcResults.rateUnit,
    totalCost: lastCalcResults.totalCost
  };

  state.bom.push(item);
  saveBOMToStorage();
}

// --- Reset / Clear Sheet ---
function clearBOM() {
  if (confirm("Are you sure you want to clear the entire quotation sheet? This resets all items, processes, and expenses.")) {
    state.bom = [];
    state.processes = [];
    state.miscItems = [];
    
    saveUserDataToServer();
    renderUnifiedTable();
  }
}

// --- Process / Misc costs row generators ---
function addProcessRow() {
  const defaultRate = (state.processRates && state.processRates.length > 0) 
    ? state.processRates[0] 
    : { name: '', rate: 0 };

  const newRow = {
    id: Date.now().toString(),
    name: defaultRate.name || '',
    duration: 0,
    rate: defaultRate.rate || 0,
    cost: 0
  };
  state.processes.push(newRow);
  saveProcessesToStorage();
}

function addMiscRow() {
  const newRow = {
    id: Date.now().toString(),
    name: 'Consumables / Shipping',
    qty: 1,
    unitCost: 100,
    cost: 100
  };
  state.miscItems.push(newRow);
  saveMiscToStorage();
}

// --- Grand Quotation Cost Aggregations ---
function recalculateGrandTotal() {
  const metalCost = state.bom.reduce((acc, x) => acc + x.totalCost, 0);
  const processCost = state.processes.reduce((acc, x) => acc + x.cost, 0);
  const miscCost = state.miscItems.reduce((acc, x) => acc + x.cost, 0);
  
  const subtotal = metalCost + processCost + miscCost;
  const profitAmount = subtotal * (state.profitPercentage / 100);
  const grandTotal = subtotal;

  // Print to calculator footer subtotals
  if (DOM.calcMetalCost) DOM.calcMetalCost.textContent = formatINR(metalCost);
  if (DOM.calcProcessCost) DOM.calcProcessCost.textContent = formatINR(processCost);
  if (DOM.calcMiscCost) DOM.calcMiscCost.textContent = formatINR(miscCost);
  if (DOM.profitAmountDisplay) DOM.profitAmountDisplay.textContent = formatINR(profitAmount);
  if (DOM.calcTotalCost) DOM.calcTotalCost.textContent = formatINR(subtotal + profitAmount);

  // If in quotation tab, update grand totals
  if (state.currentTab === 'quotation') {
    renderQuotationTabView();
  }

  if (DOM.ratioMaterialsBar && DOM.ratioProcessesBar && DOM.ratioMiscBar) {
    if (subtotal > 0) {
      const metalPct = (metalCost / subtotal) * 100;
      const processPct = (processCost / subtotal) * 100;
      const miscPct = (miscCost / subtotal) * 100;

      DOM.ratioMaterialsBar.style.width = `${metalPct}%`;
      DOM.ratioProcessesBar.style.width = `${processPct}%`;
      DOM.ratioMiscBar.style.width = `${miscPct}%`;

      if (DOM.ratioLegend) DOM.ratioLegend.textContent = `Materials (${metalPct.toFixed(0)}%) • Processes (${processPct.toFixed(0)}%) • Other (${miscPct.toFixed(0)}%)`;
    } else {
      DOM.ratioMaterialsBar.style.width = '0%';
      DOM.ratioProcessesBar.style.width = '0%';
      DOM.ratioMiscBar.style.width = '0%';
      if (DOM.ratioLegend) DOM.ratioLegend.textContent = 'Materials (0%) • Processes (0%) • Other (0%)';
    }
  }
}

// --- Save Transaction Helper ---
async function saveTransaction(grandTotal, activeClient = null) {
  if (!state.currentUser || state.currentUserType !== 'user') return;
  const orgName = localStorage.getItem('metal-current-org') || 'Metal Quotation Suite';
  const companyName = state.selectedCompany || orgName;
  
  const clientName = activeClient ? activeClient.name : (state.customerName || "Valued Client");
  const clientAddress = activeClient ? activeClient.address : (state.customerAddress || "");
  const clientGSTIN = activeClient ? activeClient.gstin : (state.customerGSTIN || "");

  const prodName = (state.products && state.products.length > 0)
    ? state.products.map(p => p.name).join(', ')
    : (getActiveProduct() ? getActiveProduct().name : 'Standard Product');

  const newTx = {
    id: `MS-Q-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleString('en-IN'),
    username: state.currentUser,
    orgName: orgName,
    companyName: companyName,
    productName: prodName,
    customerName: clientName,
    customerAddress: clientAddress,
    customerGSTIN: clientGSTIN,
    profitPercentage: state.profitPercentage || 0,
    bom: JSON.parse(JSON.stringify(state.bom)),
    processes: JSON.parse(JSON.stringify(state.processes)),
    miscItems: JSON.parse(JSON.stringify(state.miscItems)),
    grandTotal: grandTotal
  };
  
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });
    if (!response.ok) {
      console.error('Failed to log transaction on server');
    }
  } catch (err) {
    console.error('Error logging transaction:', err);
  }
}

function numberToWordsINR(amount) {
  if (isNaN(amount) || amount <= 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(num) {
    let str = '';
    if (num >= 100) {
      str += a[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '') + ' ';
    } else if (num > 0) {
      str += a[num] + ' ';
    }
    return str.trim();
  }

  const intPart = Math.floor(amount);
  const paise = Math.round((amount - intPart) * 100);

  let crore = Math.floor(intPart / 10000000);
  let remainder = intPart % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder %= 100000;
  let thousand = Math.floor(remainder / 1000);
  let hundreds = remainder % 1000;

  let result = '';
  if (crore > 0) result += convertGroup(crore) + ' Crore ';
  if (lakh > 0) result += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) result += convertGroup(thousand) + ' Thousand ';
  if (hundreds > 0) result += convertGroup(hundreds) + ' ';

  result = result.trim() + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convertGroup(paise) + ' Paise';
  }
  return result.trim() + ' Only';
}

// --- PDF Quotation Exporter (Executive Product Table + Optional Workings Pages) ---
function exportQuoteToPDF(txData = null, shouldPreview = false, targetClient = null, includeWorkingsPages = false) {
  if (txData && (txData instanceof Event || txData.preventDefault)) {
    txData = null;
  }
  const isHistoryExport = txData !== null;
  const creator = isHistoryExport ? txData.username : state.currentUser;

  // Group products to render in PDF
  let productList = [];

  if (isHistoryExport) {
    productList = [{
      name: txData.productName || 'Quoted Product',
      quantity: 1,
      bom: txData.bom || [],
      processes: txData.processes || [],
      miscItems: txData.miscItems || [],
      profitPercentage: 0
    }];
  } else if (state.products && state.products.length > 0) {
    productList = state.products
      .filter(p => p.inQuote !== false)
      .map(p => ({
        name: p.name,
        quantity: typeof p.quantity === 'number' && p.quantity > 0 ? p.quantity : 1,
        bom: p.bom || [],
        processes: p.processes || [],
        miscItems: p.miscItems || [],
        profitPercentage: p.profitPercentage || 0
      }));
  } else {
    productList = [{
      name: 'Quoted Product',
      quantity: 1,
      bom: state.bom || [],
      processes: state.processes || [],
      miscItems: state.miscItems || [],
      profitPercentage: state.profitPercentage || 0
    }];
  }

  if (productList.length === 0) {
    alert("No products in quotation sheet to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const displayCompanyName = isHistoryExport 
    ? (txData.companyName || txData.orgName || 'arguscnc.com') 
    : (state.selectedCompany || localStorage.getItem('metal-current-org') || (state.currentUserType === 'org' ? state.currentUser : '') || state.userOrg || (state.currentUser ? state.currentUser : 'arguscnc.com'));

  const dateStr = isHistoryExport ? txData.date.split(',')[0] : new Date().toLocaleDateString('en-IN');
  const quoteNum = isHistoryExport ? txData.id : `MS-Q-${Date.now().toString().slice(-6)}`;

  // ==========================================
  // --- PAGE 1: EXECUTIVE COMMERCIAL SUMMARY ---
  // ==========================================
  
  // Header Metadata block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(2, 112, 194); // Brand Blue (#0270c2)
  doc.text(displayCompanyName, 14, 20);
  
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("PRODUCT QUOTATION & CONSOLIDATED ESTIMATES", 14, 25);
  
  // Right-aligned quotation details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85); // Slate-700
  doc.text("QUOTATION DETAILS", 196, 18, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Reference No:  ${quoteNum}`, 196, 24, { align: "right" });
  doc.text(`Date of Issue:  ${dateStr}`, 196, 29, { align: "right" });
  doc.text(`Prepared By:   @${creator}`, 196, 34, { align: "right" });

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(14, 38, 196, 38);

  // Prepared For (Client Details) Box
  let clientsToRender = [];
  if (targetClient) {
    clientsToRender = [targetClient];
  } else if (isHistoryExport) {
    clientsToRender = [{
      name: txData.customerName || "Valued Client",
      address: txData.customerAddress || "",
      gstin: txData.customerGSTIN || ""
    }];
  } else if (state.selectedClients && state.selectedClients.length > 0) {
    clientsToRender = state.selectedClients;
  } else {
    clientsToRender = [{
      name: state.customerName || "Valued Client",
      address: state.customerAddress || "",
      gstin: state.customerGSTIN || ""
    }];
  }

  let boxHeight = 30;
  if (clientsToRender.length > 1) {
    boxHeight = Math.max(30, 14 + (clientsToRender.length * 12));
  }

  doc.setFillColor(248, 250, 252); // Slate-50 background tint
  doc.setDrawColor(226, 232, 240); // Slate-200 border
  doc.roundedRect(14, 43, 182, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(clientsToRender.length > 1 ? `CLIENT DETAILS (${clientsToRender.length} RECIPIENTS):` : "CLIENT DETAILS:", 19, 49);

  if (clientsToRender.length === 1) {
    const singleClient = clientsToRender[0];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(singleClient.name, 19, 56);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // Slate-600

    let infoY = 62;
    if (singleClient.address) {
      doc.text(`Address: ${singleClient.address}`, 19, infoY);
      infoY += 5;
    }
    if (singleClient.gstin) {
      doc.text(`GSTIN:   ${singleClient.gstin}`, 19, infoY);
    }
  } else {
    let clientY = 55;
    clientsToRender.forEach((cl, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text(`${i + 1}. ${cl.name}`, 19, clientY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105); // Slate-600
      const extraInfo = [
        cl.address ? `Address: ${cl.address}` : '',
        cl.gstin ? `GSTIN: ${cl.gstin}` : ''
      ].filter(Boolean).join('   |   ');

      if (extraInfo) {
        doc.text(extraInfo, 23, clientY + 4);
        clientY += 11;
      } else {
        clientY += 7;
      }
    });
  }

  let currentY = 43 + boxHeight + 8;

  // Executive Product Quotation Table
  const tableHeaders = [['Sl. No', 'Date', 'Description', 'QTY', 'Rate (INR)', 'AMT (INR)']];
  
  let grandTotalAll = 0;
  const tableRows = productList.map((prod, pIdx) => {
    const prodQty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
    const prodDate = prod.date || (prod.createdAt ? new Date(prod.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'));

    const unitMaterials = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
    const unitProcesses = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const unitMisc = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const unitSubtotal = unitMaterials + unitProcesses + unitMisc;
    const unitProfit = unitSubtotal * ((prod.profitPercentage || 0) / 100);
    const unitRate = unitSubtotal + unitProfit;
    const prodTotal = unitRate * prodQty;

    grandTotalAll += prodTotal;

    return [
      pIdx + 1,
      prodDate,
      prod.name || `Product ${pIdx + 1}`,
      prodQty,
      `Rs. ${unitRate.toFixed(2)}`,
      `Rs. ${prodTotal.toFixed(2)}`
    ];
  });

  // Footer row for Total Cost
  const tableFoot = [[
    { content: 'Total Cost:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9.5 } },
    { content: `Rs. ${grandTotalAll.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold', fontSize: 10, textColor: [2, 112, 194] } }
  ]];

  doc.autoTable({
    head: tableHeaders,
    body: tableRows,
    foot: tableFoot,
    startY: currentY,
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 9,
      lineColor: [203, 213, 225],
      lineWidth: 0.3
    },
    bodyStyles: {
      textColor: [15, 23, 42],
      fontSize: 9,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    footStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 9.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.3
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 24, halign: 'center', fontSize: 8 },
      2: { cellWidth: 'auto', fontStyle: 'bold' },
      3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 38, halign: 'right' },
      5: { cellWidth: 42, halign: 'right', fontStyle: 'bold' }
    },
    theme: 'grid'
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // Amount in Words
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Amount in Words:  ${numberToWordsINR(grandTotalAll)}`, 14, currentY);

  // =========================================================================
  // --- SUBSEQUENT PAGES: DETAILED WORKINGS (1 DEDICATED PAGE PER PRODUCT) ---
  // =========================================================================
  if (includeWorkingsPages && productList.length > 0) {
    productList.forEach((prod, pIdx) => {
      doc.addPage();
      let prodY = 20;

      // Product Workings Header Banner
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.setDrawColor(2, 112, 194); // Brand Blue accent
      doc.setLineWidth(0.6);
      doc.roundedRect(14, prodY, 182, 12, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(2, 112, 194);
      doc.text(`PRODUCT ${pIdx + 1}:  ${prod.name.toUpperCase()} (Qty: ${prod.quantity}) - DETAILED WORKINGS`, 19, prodY + 7.5);
      prodY += 18;

      const filteredBom = (prod.bom || []).filter(x => x.includeInPDF !== false);
      const filteredProcesses = (prod.processes || []).filter(x => x.includeInPDF !== false);
      const filteredMisc = (prod.miscItems || []).filter(x => x.includeInPDF !== false);

      // Table 1: Metal Components (BOM)
      if (filteredBom.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text("• Metal Components & Raw Material (BOM)", 16, prodY + 3);
        prodY += 6;

        const bomHeaders = [['#', 'Component Description', 'Specification Details', 'Qty', 'Unit Rate', 'Total Cost']];
        const bomRows = filteredBom.map((x, idx) => [
          idx + 1,
          x.label || x.shapeName,
          `${(x.shapeName || '').split(' / ')[0]} (${x.dimDesc || ''})`,
          `${(x.quantity || 1) * prod.quantity} pcs`,
          x.rate > 0 ? `Rs. ${x.rate.toFixed(2)} / ${x.rateUnit}` : '-',
          (x.totalCost || 0) > 0 ? `Rs. ${((x.totalCost || 0) * prod.quantity).toFixed(2)}` : '-'
        ]);

        doc.autoTable({
          head: bomHeaders,
          body: bomRows,
          startY: prodY,
          margin: { left: 14, right: 14 },
          headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8, lineColor: [226, 232, 240], lineWidth: 0.2 },
          bodyStyles: { textColor: [30, 41, 59], fontSize: 8, lineColor: [241, 245, 249], lineWidth: 0.2 },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 32, halign: 'right' },
            5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
          },
          theme: 'grid'
        });

        prodY = doc.lastAutoTable.finalY + 8;
      }

      // Table 2: Manufacturing & Process Costing
      if (filteredProcesses.length > 0) {
        if (prodY > 230) { doc.addPage(); prodY = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text("• Manufacturing & Machining Operations", 16, prodY + 3);
        prodY += 6;

        const processHeaders = [['#', 'Process / Operation Name', 'Duration', 'Rate (₹/min)', 'Total Process Cost']];
        const processRows = filteredProcesses.map((pItem, idx) => [
          idx + 1,
          pItem.name,
          `${(pItem.duration || 0) * prod.quantity} min`,
          `Rs. ${(pItem.rate || 0).toFixed(2)}`,
          `Rs. ${((pItem.cost || 0) * prod.quantity).toFixed(2)}`
        ]);

        doc.autoTable({
          head: processHeaders,
          body: processRows,
          startY: prodY,
          margin: { left: 14, right: 14 },
          headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8, lineColor: [226, 232, 240], lineWidth: 0.2 },
          bodyStyles: { textColor: [30, 41, 59], fontSize: 8, lineColor: [241, 245, 249], lineWidth: 0.2 },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          },
          theme: 'grid'
        });

        prodY = doc.lastAutoTable.finalY + 8;
      }

      // Table 3: Bought-Out & Miscellaneous Expenses
      if (filteredMisc.length > 0) {
        if (prodY > 230) { doc.addPage(); prodY = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text("• Bought-Out Hardware & Other Expenses", 16, prodY + 3);
        prodY += 6;

        const miscHeaders = [['#', 'Expense / Hardware Item', 'Quantity', 'Unit Rate (₹)', 'Total Amount']];
        const miscRows = filteredMisc.map((m, idx) => [
          idx + 1,
          m.name,
          `${(m.qty || 1) * prod.quantity} pcs`,
          `Rs. ${(m.unitCost || 0).toFixed(2)}`,
          `Rs. ${((m.cost || 0) * prod.quantity).toFixed(2)}`
        ]);

        doc.autoTable({
          head: miscHeaders,
          body: miscRows,
          startY: prodY,
          margin: { left: 14, right: 14 },
          headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8, lineColor: [226, 232, 240], lineWidth: 0.2 },
          bodyStyles: { textColor: [30, 41, 59], fontSize: 8, lineColor: [241, 245, 249], lineWidth: 0.2 },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          },
          theme: 'grid'
        });

        prodY = doc.lastAutoTable.finalY + 8;
      }

      // Product Cost Summary Box
      if (prodY > 220) { doc.addPage(); prodY = 20; }

      const uMat = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
      const uProc = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
      const uMisc = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
      const uSub = uMat + uProc + uMisc;
      const uProf = uSub * ((prod.profitPercentage || 0) / 100);
      const uTot = uSub + uProf;
      const pGrand = uTot * prod.quantity;

      const summaryBoxWidth = 100;
      const summaryBoxHeight = 44;
      const summaryBoxX = 96;
      const summaryBoxY = prodY;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);

      doc.text(`Materials (BOM):`, summaryBoxX + 6, summaryBoxY + 8);
      doc.text(`Rs. ${(uMat * prod.quantity).toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 8, { align: "right" });

      doc.text(`Processes / Machining:`, summaryBoxX + 6, summaryBoxY + 14);
      doc.text(`Rs. ${(uProc * prod.quantity).toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 14, { align: "right" });

      doc.text(`Other / Hardware Expenses:`, summaryBoxX + 6, summaryBoxY + 20);
      doc.text(`Rs. ${(uMisc * prod.quantity).toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 20, { align: "right" });

      doc.text(`Profit Margin (${prod.profitPercentage || 0}%):`, summaryBoxX + 6, summaryBoxY + 26);
      doc.text(`Rs. ${(uProf * prod.quantity).toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 26, { align: "right" });

      doc.setDrawColor(203, 213, 225);
      doc.line(summaryBoxX + 6, summaryBoxY + 30, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(2, 112, 194);
      doc.text(`Product Total (${prod.quantity} pcs):`, summaryBoxX + 6, summaryBoxY + 38);
      doc.text(`Rs. ${pGrand.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 38, { align: "right" });
    });
  }

  // Stamp custom footer and page numbers across all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Subtle divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 276, 196, 276);

    // "Thank you for your business!"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text("Thank you for your business!", 105, 281, { align: "center" });

    // "Powered by arguscnc.com"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("Powered by arguscnc.com", 105, 286, { align: "center" });

    // Page number
    doc.setFontSize(7.5);
    doc.text(`Page ${i} of ${pageCount}`, 196, 286, { align: "right" });
  }

  const primaryClientName = clientsToRender.length === 1 
    ? clientsToRender[0].name 
    : `Consolidated_${clientsToRender.length}_Clients`;
  const cleanClientName = primaryClientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const filePrefix = includeWorkingsPages ? 'Quotation_With_Workings' : 'Quotation';
  if (shouldPreview) {
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(`${filePrefix}_${cleanClientName}_${quoteNum}.pdf`);
  }

  // Save transaction to history if generated by active user
  if (!isHistoryExport) {
    const txClient = clientsToRender.length === 1 
      ? clientsToRender[0] 
      : { 
          name: clientsToRender.map(c => c.name).join(', '), 
          address: `${clientsToRender.length} Recipients Consolidated`, 
          gstin: '' 
        };
    saveTransaction(grandTotalAll, txClient);
  }
}


// --- CSV exporter ---
// --- CSV exporter ---
function exportBOMToCSV() {
  const hasProducts = state.products && state.products.length > 0;
  const hasCalculations = state.bom.length > 0 || state.processes.length > 0 || state.miscItems.length > 0;

  if (!hasProducts && !hasCalculations) {
    alert("Quotation sheet is empty! Add products and calculations to export.");
    return;
  }
  
  let csv = 'Product,Product Qty,Category,Item Label,Details,Line Qty/Duration,Unit Rate (INR),Total Cost (INR)\r\n';
  
  if (hasProducts) {
    const activeProducts = state.products.filter(p => p.inQuote !== false);
    activeProducts.forEach(p => {
      const pQty = typeof p.quantity === 'number' && p.quantity > 0 ? p.quantity : 1;
      // Metals
      (p.bom || []).forEach(item => {
        const rateDesc = item.rate > 0 ? `Rs. ${item.rate.toFixed(2)}/${item.rateUnit}` : '-';
        const totalCost = (item.totalCost || 0) * pQty;
        const qty = (item.quantity || 1) * pQty;
        csv += [
          `"${p.name.replace(/"/g, '""')}"`,
          pQty,
          'Metal Component',
          `"${(item.label || item.shapeName).replace(/"/g, '""')}"`,
          `"${(item.shapeName || '').split(' / ')[0]} (${item.dimDesc || ''})"`,
          qty,
          `"${rateDesc}"`,
          `"Rs. ${totalCost.toFixed(2)}"`
        ].join(',') + '\r\n';
      });

      // Processes
      (p.processes || []).forEach(proc => {
        const totalCost = (proc.cost || 0) * pQty;
        csv += [
          `"${p.name.replace(/"/g, '""')}"`,
          pQty,
          'Process Operation',
          `"${proc.name.replace(/"/g, '""')}"`,
          '"Labor/Machining"',
          `${proc.duration} min`,
          `"Rs. ${(proc.rate || 0).toFixed(2)}/min"`,
          `"Rs. ${totalCost.toFixed(2)}"`
        ].join(',') + '\r\n';
      });

      // Other Expenses
      (p.miscItems || []).forEach(item => {
        const totalCost = (item.cost || 0) * pQty;
        const qty = (item.qty || 1) * pQty;
        csv += [
          `"${p.name.replace(/"/g, '""')}"`,
          pQty,
          'Other Expense',
          `"${item.name.replace(/"/g, '""')}"`,
          '"Consumables/Other"',
          qty,
          `"Rs. ${(item.unitCost || 0).toFixed(2)}"`,
          `"Rs. ${totalCost.toFixed(2)}"`
        ].join(',') + '\r\n';
      });
    });
  } else {
    const fallbackName = (getActiveProduct()?.name || 'Product').replace(/"/g, '""');
    // Metals
    state.bom.forEach(item => {
      const rateDesc = item.rate > 0 ? `Rs. ${item.rate.toFixed(2)}/${item.rateUnit}` : '-';
      csv += [
        `"${fallbackName}"`,
        'Metal Component',
        `"${item.label.replace(/"/g, '""')}"`,
        `"${item.shapeName.split(' / ')[0]} (${item.dimDesc})"`,
        item.quantity,
        `"${rateDesc}"`,
        `"Rs. ${item.totalCost.toFixed(2)}"`
      ].join(',') + '\r\n';
    });

    // Processes
    state.processes.forEach(proc => {
      csv += [
        `"${fallbackName}"`,
        'Process Operation',
        `"${proc.name.replace(/"/g, '""')}"`,
        '"Labor/Machining"',
        `${proc.duration} min`,
        `"Rs. ${proc.rate.toFixed(2)}/min"`,
        `"Rs. ${proc.cost.toFixed(2)}"`
      ].join(',') + '\r\n';
    });

    // Other Expenses
    state.miscItems.forEach(item => {
      csv += [
        `"${fallbackName}"`,
        'Other Expense',
        `"${item.name.replace(/"/g, '""')}"`,
        '"Consumables/Other"',
        item.qty,
        `"Rs. ${item.unitCost.toFixed(2)}"`,
        `"Rs. ${item.cost.toFixed(2)}"`
      ].join(',') + '\r\n';
    });
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `metal-quotation-bom-quote-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- Reset Form ---
function resetCalculatorForm() {
  const shape = SHAPES[state.activeShape];
  shape.fields.forEach(field => {
    const input = document.getElementById(`input-${field.id}`);
    const select = document.getElementById(`unit-${field.id}`);
    if (input) input.value = field.defaultVal;
    if (select) select.value = field.defaultUnit;
    
    state.dimensions[field.id] = field.defaultVal;
    state.dimensions[`${field.id}Unit`] = field.defaultUnit;
  });

  state.price = 0;
  DOM.priceInput.value = '';
  state.quantity = 1;
  DOM.quantityInput.value = 1;

  updateSVGDimensionLabels();
  calculate();
}



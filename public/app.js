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
  orgSetupError: document.getElementById('org-setup-error'),
  orgDashboardContent: document.getElementById('org-dashboard-content'),

  tabSettingsBtn: document.getElementById('tab-settings-btn'),
  tabSettingsContent: document.getElementById('tab-settings-content'),
  orgSettingsForm: document.getElementById('org-settings-form'),
  orgSettingsName: document.getElementById('org-settings-name'),
  orgSettingsPassword: document.getElementById('org-settings-password'),
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
  logoutBtn: document.getElementById('logout-btn'),
  userDisplayOrg: document.getElementById('user-display-org'),
  userDisplayUsername: document.getElementById('user-display-username'),
  customerNameInput: document.getElementById('customer-name-input'),
  customerAddressInput: document.getElementById('customer-address-input'),
  customerGSTINInput: document.getElementById('customer-gstin-input'),
  navCalculatorBtn: document.getElementById('nav-calculator-btn'),
  navHistoryBtn: document.getElementById('nav-history-btn'),
  calculatorView: document.getElementById('calculator-view'),
  userHistoryView: document.getElementById('user-history-view'),
  userHistoryTableBody: document.getElementById('user-history-table-body'),
  historySearchInput: document.getElementById('history-search-input'),
  addProcessProfileForm: document.getElementById('add-process-profile-form'),
  newProfileName: document.getElementById('new-profile-name'),
  newProfileRate: document.getElementById('new-profile-rate'),
  processProfilesList: document.getElementById('process-profiles-list'),
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
  orgThemeToggle: document.getElementById('org-theme-toggle'),
  orgThemeToggleIconDark: document.getElementById('org-theme-toggle-icon-dark'),
  orgThemeToggleIconLight: document.getElementById('org-theme-toggle-icon-light'),
  orgLogoutBtn: document.getElementById('org-logout-btn'),
  statTotalUsers: document.getElementById('stat-total-users'),
  statTotalQuotes: document.getElementById('stat-total-quotes'),
  statTotalValue: document.getElementById('stat-total-value'),
  tabUsersBtn: document.getElementById('tab-users-btn'),
  tabQuotesBtn: document.getElementById('tab-quotes-btn'),
  tabUsersContent: document.getElementById('tab-users-content'),
  tabQuotesContent: document.getElementById('tab-quotes-content'),
  orgUsersTableBody: document.getElementById('org-users-table-body'),
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
  exportPDFBtn: document.getElementById('export-pdf-btn'),
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
  if (DOM.tabQuotesBtn) DOM.tabQuotesBtn.addEventListener('click', () => setOrgTab('quotes'));
  if (DOM.tabSettingsBtn) DOM.tabSettingsBtn.addEventListener('click', () => setOrgTab('settings'));
  if (DOM.orgSetupForm) DOM.orgSetupForm.addEventListener('submit', handleOrgSetupSubmit);
  if (DOM.orgSettingsForm) DOM.orgSettingsForm.addEventListener('submit', handleOrgSettingsSubmit);

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

  // Employee Navigation Switcher Listeners
  if (DOM.navCalculatorBtn) {
    DOM.navCalculatorBtn.addEventListener('click', () => switchEmployeeView('calculator'));
    DOM.navHistoryBtn.addEventListener('click', () => switchEmployeeView('history'));
    DOM.historySearchInput.addEventListener('input', filterUserQuotationHistory);
    DOM.addProcessProfileForm.addEventListener('submit', handleAddProcessProfileSubmit);
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
  DOM.exportPDFBtn.addEventListener('click', () => exportQuoteToPDF());
  DOM.exportCSVBtn.addEventListener('click', exportBOMToCSV);
  DOM.clearHistoryBtn.addEventListener('click', clearBOM);

  // Add row listeners for separate config cards
  DOM.addProcessRowBtn.addEventListener('click', addProcessRow);
  DOM.addMiscRowBtn.addEventListener('click', addMiscRow);

  // Client Directory modal triggers
  if (DOM.openClientsModalBtn) DOM.openClientsModalBtn.addEventListener('click', openClientsModal);
  if (DOM.closeClientsModalBtn) DOM.closeClientsModalBtn.addEventListener('click', closeClientsModal);
  if (DOM.addClientForm) DOM.addClientForm.addEventListener('submit', handleAddClientSubmit);
  if (DOM.cancelClientEditBtn) DOM.cancelClientEditBtn.addEventListener('click', handleCancelClientEdit);
  if (DOM.clientSearchInput) DOM.clientSearchInput.addEventListener('input', filterModalClients);
  if (DOM.modalClearClientsSelectionBtn) DOM.modalClearClientsSelectionBtn.addEventListener('click', clearModalClientsSelection);
  if (DOM.modalApplyClientsBtn) DOM.modalApplyClientsBtn.addEventListener('click', closeClientsModal);

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



  // Theme switcher
  DOM.themeToggle.addEventListener('click', toggleTheme);

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

function checkAuthenticationSession() {
  const loggedInUser = localStorage.getItem('metal-current-user');
  const loggedInUserType = localStorage.getItem('metal-current-user-type') || 'user';
  const loggedInOrg = localStorage.getItem('metal-current-org') || '';
  
  if (loggedInUser) {
    if (loggedInUserType === 'org') {
      authenticateOrg(loggedInUser);
    } else {
      authenticateUser(loggedInUser, loggedInOrg);
    }
  } else {
    showAuthOverlay(true);
    setAuthRole('user');
  }
}

function showAuthOverlay(show) {
  if (show) {
    DOM.authOverlay.classList.remove('hidden');
    DOM.appWrapper.classList.add('hidden');
    DOM.orgWrapper.classList.add('hidden');
  } else {
    DOM.authOverlay.classList.add('hidden');
    if (state.currentUserType === 'org') {
      DOM.appWrapper.classList.add('hidden');
      DOM.orgWrapper.classList.remove('hidden');
    } else {
      DOM.appWrapper.classList.remove('hidden');
      DOM.orgWrapper.classList.add('hidden');
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
    DOM.roleUserBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white transition-all";
    DOM.roleOrgBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all";
    
    DOM.authUsernameContainer.classList.remove('hidden');
    DOM.authPasswordContainer.classList.remove('hidden');
    DOM.authUsername.setAttribute('required', 'true');
    DOM.authPassword.setAttribute('required', 'true');
    
    // Always hide org fields on employee login/signup (joined inside workspace instead)
    DOM.authOrgContainer.classList.add('hidden');
    DOM.authOrg.removeAttribute('required');
    DOM.authOrgPasswordContainer.classList.add('hidden');
    DOM.authOrgPassword.removeAttribute('required');
    
    DOM.authBtnText.textContent = authMode === 'login' ? "Sign In" : "Sign Up";
    DOM.authTitle.textContent = authMode === 'login' ? "Argus Quotation Suite - Metal Calc Login" : "Argus Quotation Suite - Metal Calc Create Account";
    DOM.authSubtitle.textContent = authMode === 'login' ? "Sign in to access your metal calculations & quotes." : "Sign up to configure separate quotes and profiles.";
  } else {
    DOM.roleOrgBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white transition-all";
    DOM.roleUserBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all";
    
    DOM.authUsernameContainer.classList.add('hidden');
    DOM.authPasswordContainer.classList.add('hidden');
    DOM.authUsername.removeAttribute('required');
    DOM.authPassword.removeAttribute('required');
    
    // Org Admin portal requires Organisation name and admin password
    DOM.authOrgContainer.classList.remove('hidden');
    DOM.authOrg.setAttribute('required', 'true');
    DOM.authOrgPasswordContainer.classList.remove('hidden');
    DOM.authOrgPassword.setAttribute('required', 'true');
    
    DOM.authTitle.textContent = authMode === 'login' ? "Argus Quotation Suite - Metal Calc Organisation Portal Login" : "Argus Quotation Suite - Metal Calc Create Organisation Account";
    DOM.authSubtitle.textContent = authMode === 'login' ? "Sign in to access your organisation's control panel." : "Register your organisation to manage team members and quotes.";
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
          localStorage.setItem('metal-current-user', data.username);
          localStorage.setItem('metal-current-user-type', 'user');
          localStorage.setItem('metal-current-org', data.orgName);
          authenticateUser(data.username, data.orgName);
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
          localStorage.setItem('metal-current-org', data.orgName);
          authenticateUser(data.username, data.orgName);
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
          localStorage.setItem('metal-current-user', data.orgName);
          localStorage.setItem('metal-current-user-type', 'org');
          authenticateOrg(data.orgName);
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
          authenticateOrg(data.orgName);
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
  lucide.createIcons();
}

function authenticateOrg(orgName) {
  state.currentUser = orgName;
  state.currentUserType = 'org';
  
  if (DOM.orgProfileNavName) DOM.orgProfileNavName.textContent = orgName;
  
  showAuthOverlay(false);
  
  if (orgName && orgName.startsWith('temp-org-')) {
    DOM.orgDisplayTitle.textContent = 'Setup Pending';
    DOM.orgSetupView.classList.remove('hidden');
    DOM.orgDashboardContent.classList.add('hidden');
    
    DOM.orgSetupName.value = '';
    DOM.orgSetupPassword.value = '';
    DOM.orgSetupError.classList.add('hidden');
  } else {
    DOM.orgDisplayTitle.textContent = orgName;
    DOM.orgSetupView.classList.add('hidden');
    DOM.orgDashboardContent.classList.remove('hidden');
    
    renderOrgDashboard();
    setOrgTab('users');
  }
  
  lucide.createIcons();
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
  localStorage.removeItem('metal-current-googleId');
  
  state.currentUser = null;
  state.currentUserType = null;
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
  const activeClass = "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400 py-4 px-1 text-sm font-semibold flex items-center gap-2";
  const inactiveClass = "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-4 px-1 text-sm font-semibold flex items-center gap-2";
  
  DOM.tabUsersBtn.className = tab === 'users' ? activeClass : inactiveClass;
  DOM.tabQuotesBtn.className = tab === 'quotes' ? activeClass : inactiveClass;
  DOM.tabSettingsBtn.className = tab === 'settings' ? activeClass : inactiveClass;
  
  if (tab === 'users') {
    DOM.tabUsersContent.classList.remove('hidden');
    DOM.tabQuotesContent.classList.add('hidden');
    DOM.tabSettingsContent.classList.add('hidden');
  } else if (tab === 'quotes') {
    DOM.tabUsersContent.classList.add('hidden');
    DOM.tabQuotesContent.classList.remove('hidden');
    DOM.tabSettingsContent.classList.add('hidden');
  } else if (tab === 'settings') {
    DOM.tabUsersContent.classList.add('hidden');
    DOM.tabQuotesContent.classList.add('hidden');
    DOM.tabSettingsContent.classList.remove('hidden');
    
    DOM.orgSettingsName.value = state.currentUser || '';
    DOM.orgSettingsPassword.value = '';
    DOM.orgSettingsSuccess.classList.add('hidden');
    DOM.orgSettingsError.classList.add('hidden');
  }
}

async function renderOrgDashboard() {
  if (state.currentUserType !== 'org') return;
  const orgName = state.currentUser;

  try {
    const response = await fetch(`/api/org/dashboard?orgName=${encodeURIComponent(orgName)}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    
    const data = await response.json();
    const orgUsers = data.users || [];
    const transactions = data.transactions || [];
    
    const totalUsers = orgUsers.length;
    const totalQuotes = transactions.length;
    const totalValue = transactions.reduce((acc, t) => acc + (t.grandTotal || 0), 0);
    
    DOM.statTotalUsers.textContent = totalUsers;
    DOM.statTotalQuotes.textContent = totalQuotes;
    DOM.statTotalValue.textContent = formatINR(totalValue);
    
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
            <button class="btn-pdf-view p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg transition-all" title="View PDF Report" data-tx-id="${tx.id}">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button class="btn-pdf-download p-1.5 text-brand-600 hover:bg-brand-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30 rounded-lg transition-all" title="Download PDF Report" data-tx-id="${tx.id}">
              <i data-lucide="download" class="w-4 h-4"></i>
            </button>
            <button class="btn-pdf-delete p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all" title="Delete Transaction" data-tx-id="${tx.id}">
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
    lucide.createIcons();
  } catch (err) {
    console.error(err);
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
    state.bom = data.bom || [];
    state.processes = data.processes || [];
    state.miscItems = data.miscItems || [];
    
    state.customerName = data.customerName || '';
    if (DOM.customerNameInput) DOM.customerNameInput.value = state.customerName;

    state.customerAddress = data.customerAddress || '';
    if (DOM.customerAddressInput) DOM.customerAddressInput.value = state.customerAddress;

    state.customerGSTIN = data.customerGSTIN || '';
    if (DOM.customerGSTINInput) DOM.customerGSTINInput.value = state.customerGSTIN;

    state.profitPercentage = data.profitPercentage || 0;
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

    // Load or initialize process rates registry
    const defaultRates = [
      { name: "CNC Milling", rate: 10 },
      { name: "Laser Cutting", rate: 25 },
      { name: "Manual Labor", rate: 5 },
      { name: "TIG Welding", rate: 15 }
    ];
    state.processRates = (data.processRates && data.processRates.length > 0) ? data.processRates : defaultRates;
    renderProcessRatesRegistry();

    updateAllDisplays();
  } catch (err) {
    console.error(err);
    alert('Failed to connect to server database.');
  }
}

function updateAllDisplays() {
  renderSeparateEditors();
  renderUnifiedTable();
}

async function saveUserDataToServer() {
  const activeOrg = localStorage.getItem('metal-current-org');
  if (!state.currentUser || state.currentUserType !== 'user' || !activeOrg) return;
  
  try {
    await fetch('/api/user/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: state.currentUser,
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
      <span class="font-bold text-slate-800 dark:text-slate-200">${prof.name}</span>
      <span class="text-[10px] text-slate-400 dark:text-slate-500">Rate: ₹${prof.rate.toFixed(2)}/min (₹${(prof.rate * 60).toFixed(2)}/hr)</span>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = "text-slate-400 hover:text-rose-500 p-1 rounded transition-colors";
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

    item.appendChild(details);
    item.appendChild(deleteBtn);
    DOM.processProfilesList.appendChild(item);
  });

  lucide.createIcons();
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
    const gstinStr = client.gstin ? ` • GSTIN: ${client.gstin}` : '';

    item.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <input type="checkbox" class="client-checkbox w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer" ${isSelected ? 'checked' : ''}>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-900 dark:text-white truncate">${client.name}</span>
            ${isSelected ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">Selected</span>' : ''}
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${client.address || 'No address specified'}${gstinStr}</p>
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
      state.clients[clientIdx].address = address;
      state.clients[clientIdx].gstin = gstin;

      // Update in selectedClients if present
      if (state.selectedClients) {
        const selIdx = state.selectedClients.findIndex(sc => (sc.id && sc.id === editingClientId) || sc.name === editingClientId);
        if (selIdx >= 0) {
          state.selectedClients[selIdx].name = name;
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
    const a = (c.address || '').toLowerCase();
    const g = (c.gstin || '').toLowerCase();
    return n.includes(q) || a.includes(q) || g.includes(q);
  });

  renderModalClientsList(filtered);
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

function switchEmployeeView(view) {
  if (!DOM.navCalculatorBtn || !DOM.navHistoryBtn) return;
  
  const activeClass = "px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 transition-all flex items-center gap-1.5";
  const inactiveClass = "px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-all flex items-center gap-1.5";
  
  if (view === 'calculator') {
    DOM.navCalculatorBtn.className = activeClass;
    DOM.navHistoryBtn.className = inactiveClass;
    DOM.calculatorView.classList.remove('hidden');
    DOM.userHistoryView.classList.add('hidden');
  } else {
    DOM.navCalculatorBtn.className = inactiveClass;
    DOM.navHistoryBtn.className = activeClass;
    DOM.calculatorView.classList.add('hidden');
    DOM.userHistoryView.classList.remove('hidden');
    
    DOM.historySearchInput.value = '';
    loadUserQuotationHistory();
  }
}

async function loadUserQuotationHistory() {
  if (!state.currentUser) return;
  DOM.userHistoryTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
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
        <td colspan="6" class="py-8 text-center text-rose-500 font-bold">
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
        <td colspan="6" class="py-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
          No previous quotations found. Export some quotes to log them here.
        </td>
      </tr>
    `;
    return;
  }

  txns.forEach(tx => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800";
    
    const dateStr = tx.date || 'N/A';
    const refNo = tx.id || 'N/A';
    const compName = tx.companyName || tx.orgName || 'arguscnc.com';
    const client = tx.customerName || 'Valued Client';
    const total = tx.grandTotal > 0 ? `₹ ${tx.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹ 0.00';

    row.innerHTML = `
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
    const refNo = (tx.id || '').toLowerCase();
    const client = (tx.customerName || '').toLowerCase();
    const compName = (tx.companyName || tx.orgName || '').toLowerCase();
    return refNo.includes(q) || client.includes(q) || compName.includes(q);
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

      // Verify if iframe was injected; if not (e.g. origin mismatch or adblock), display custom button fallback
      setTimeout(() => {
        const hasIframe = DOM.googleSigninBtn && DOM.googleSigninBtn.querySelector('iframe');
        if (!hasIframe) {
          if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.remove('hidden');
          if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.add('hidden');
        } else {
          if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.add('hidden');
          if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.remove('hidden');
        }
      }, 600);
    } catch (e) {
      console.error('Failed to render Google button:', e);
      if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.remove('hidden');
      if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.add('hidden');
    }
  } else {
    // If GIS is not loaded yet or blocked, display custom fallback button
    if (DOM.customGoogleSigninBtn) DOM.customGoogleSigninBtn.classList.remove('hidden');
    if (DOM.googleSigninBtn) DOM.googleSigninBtn.classList.add('hidden');
  }
}

function handleCustomGoogleSignInClick() {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const currentOrigin = window.location.origin;
        console.warn('Google GIS prompt skipped or suppressed:', notification.getNotDisplayedReason());
        alert(`Google Cloud origin notice:\n\nPlease make sure your current domain:\n"${currentOrigin}"\nis added under "Authorized JavaScript origins" for your OAuth Client ID in Google Cloud Console.`);
      }
    });
  } else {
    const currentOrigin = window.location.origin;
    alert(`Google Authentication is loading or restricted.\n\nPlease verify that "${currentOrigin}" is added under "Authorized JavaScript origins" in Google Cloud Console (APIs & Services > Credentials).`);
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
    if (!res.ok) {
      DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Google Sign-in failed.';
      DOM.authErrorMsg.classList.remove('hidden');
      return;
    }
    
    if (isOrgAdmin) {
      localStorage.setItem('metal-current-user', data.orgName);
      localStorage.setItem('metal-current-user-type', 'org');
      localStorage.setItem('metal-current-googleId', data.googleId);
      authenticateOrg(data.orgName);
    } else {
      localStorage.setItem('metal-current-user', data.username);
      localStorage.setItem('metal-current-user-type', 'user');
      localStorage.setItem('metal-current-org', data.orgName);
      authenticateUser(data.username, data.orgName);
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
      authenticateOrg(data.orgName);
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
    button.className = 'shape-btn flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500';
    button.setAttribute('data-shape-id', key);
    
    let iconStr = shape.icon;
    button.innerHTML = `
      <div class="text-slate-500 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-brand-50 transition-colors">
        <i data-lucide="${iconStr}" class="w-5 h-5"></i>
      </div>
      <span class="text-[10px] font-bold text-slate-700 dark:text-slate-350 select-none leading-tight">${shape.name.split(' / ')[0]}</span>
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
    wrapper.className = 'space-y-1.5';
    
    wrapper.innerHTML = `
      <label for="input-${field.id}" class="block text-xs font-bold text-slate-500 dark:text-slate-400">
        ${field.label}
      </label>
      <div class="flex shadow-sm rounded-xl">
        <input type="number" id="input-${field.id}" step="any" min="0" value="${field.defaultVal}" 
          class="w-full rounded-l-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 font-semibold shadow-sm text-sm" 
          data-field-id="${field.id}">
        <select id="unit-${field.id}" class="rounded-r-xl border border-l-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 py-2 px-2.5 text-slate-700 dark:text-slate-350 font-bold focus:ring-brand-500 focus:border-brand-500 text-xs shadow-sm"
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
    <td colspan="6" class="py-2.5 px-4 text-brand-600 dark:text-cyan-400 uppercase tracking-wider text-[10px] font-extrabold">
      1. Metal Components (BOM)
    </td>
  `;
  DOM.historyList.appendChild(metalsHeaderRow);

  if (state.bom.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'border-b border-slate-200 dark:border-slate-800/80';
    emptyRow.innerHTML = `
      <td colspan="6" class="text-center py-8 text-slate-400 dark:text-slate-500 font-medium">
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
        <td class="py-3 px-4 text-center select-none w-16">
          <input type="checkbox" class="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" ${item.includeInPDF !== false ? 'checked' : ''} data-pdf-item-id="${item.id}">
        </td>
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

      row.querySelector(`input[data-pdf-item-id="${item.id}"]`).addEventListener('change', (e) => {
        item.includeInPDF = e.target.checked;
        saveBOMToStorage();
      });

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
    <td colspan="6" class="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] font-extrabold">
      2. Process Operations (Labor/Machining)
    </td>
  `;
  DOM.historyList.appendChild(processesHeaderRow);

  if (state.processes.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'border-b border-slate-200 dark:border-slate-800/80';
    emptyRow.innerHTML = `
      <td colspan="6" class="text-center py-4 text-slate-400 dark:text-slate-500 font-medium italic">
        No processes configured.
      </td>
    `;
    DOM.historyList.appendChild(emptyRow);
  } else {
    state.processes.forEach((proc) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-200/60 dark:border-slate-800/60 text-xs';
      row.innerHTML = `
        <td class="py-3 px-4 text-center select-none w-16">
          <input type="checkbox" class="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" ${proc.includeInPDF !== false ? 'checked' : ''} data-pdf-proc-id="${proc.id}">
        </td>
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

      row.querySelector(`input[data-pdf-proc-id="${proc.id}"]`).addEventListener('change', (e) => {
        proc.includeInPDF = e.target.checked;
        saveProcessesToStorage();
      });

      DOM.historyList.appendChild(row);
    });
  }

  // ----------------------------------------------------
  // SECTION 3: Other Expenses (Read Only Summary)
  // ----------------------------------------------------
  const miscHeaderRow = document.createElement('tr');
  miscHeaderRow.className = 'bg-slate-50 dark:bg-slate-900 border-l-4 border-amber-500 select-none';
  miscHeaderRow.innerHTML = `
    <td colspan="6" class="py-2.5 px-4 text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] font-extrabold">
      3. Other Expenses (Consumables / Bought-out)
    </td>
  `;
  DOM.historyList.appendChild(miscHeaderRow);

  if (state.miscItems.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'border-b border-slate-200 dark:border-slate-800/80';
    emptyRow.innerHTML = `
      <td colspan="6" class="text-center py-4 text-slate-400 dark:text-slate-500 font-medium italic">
        No other expenses configured.
      </td>
    `;
    DOM.historyList.appendChild(emptyRow);
  } else {
    state.miscItems.forEach((item) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-200/60 dark:border-slate-800/60 text-xs';
      row.innerHTML = `
        <td class="py-3 px-4 text-center select-none w-16">
          <input type="checkbox" class="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" ${item.includeInPDF !== false ? 'checked' : ''} data-pdf-misc-id="${item.id}">
        </td>
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

      row.querySelector(`input[data-pdf-misc-id="${item.id}"]`).addEventListener('change', (e) => {
        item.includeInPDF = e.target.checked;
        saveMiscToStorage();
      });

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
    : { name: 'Machining operation', rate: 10 };

  const newRow = {
    id: Date.now().toString(),
    name: defaultRate.name,
    duration: 10,
    rate: defaultRate.rate,
    cost: defaultRate.rate * 10
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

  // Print to footer subtotals
  DOM.grandMetalCost.textContent = formatINR(metalCost);
  DOM.grandProcessCost.textContent = formatINR(processCost);
  DOM.grandMiscCost.textContent = formatINR(miscCost);
  DOM.profitAmountDisplay.textContent = formatINR(profitAmount);
  DOM.grandTotalCost.textContent = formatINR(grandTotal);

  if (subtotal > 0) {
    const metalPct = (metalCost / subtotal) * 100;
    const processPct = (processCost / subtotal) * 100;
    const miscPct = (miscCost / subtotal) * 100;

    DOM.ratioMaterialsBar.style.width = `${metalPct}%`;
    DOM.ratioProcessesBar.style.width = `${processPct}%`;
    DOM.ratioMiscBar.style.width = `${miscPct}%`;

    DOM.ratioLegend.textContent = `Materials (${metalPct.toFixed(0)}%) • Processes (${processPct.toFixed(0)}%) • Other (${miscPct.toFixed(0)}%)`;
  } else {
    DOM.ratioMaterialsBar.style.width = '0%';
    DOM.ratioProcessesBar.style.width = '0%';
    DOM.ratioMiscBar.style.width = '0%';
    DOM.ratioLegend.textContent = 'Materials (0%) • Processes (0%) • Other (0%)';
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

  const newTx = {
    id: `MS-Q-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleString('en-IN'),
    username: state.currentUser,
    orgName: orgName,
    companyName: companyName,
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

// --- PDF Quotation Exporter (Premium Refinement) ---
function exportQuoteToPDF(txData = null, shouldPreview = false, targetClient = null) {
  if (txData && (txData instanceof Event || txData.preventDefault)) {
    txData = null;
  }
  const isHistoryExport = txData !== null;
  
  if (!isHistoryExport && !localStorage.getItem('metal-current-org')) {
    alert("Please link your account to an Organisation using the banner at the top of the page before generating/exporting quotes.");
    return;
  }

  const bom = isHistoryExport ? txData.bom : state.bom;
  const processes = isHistoryExport ? txData.processes : state.processes;
  const miscItems = isHistoryExport ? txData.miscItems : state.miscItems;
  const profitPercentage = isHistoryExport ? txData.profitPercentage : state.profitPercentage;
  const creator = isHistoryExport ? txData.username : state.currentUser;

  const filteredBom = bom.filter(x => x.includeInPDF !== false);
  const filteredProcesses = processes.filter(x => x.includeInPDF !== false);
  const filteredMisc = miscItems.filter(x => x.includeInPDF !== false);

  if (filteredBom.length === 0 && filteredProcesses.length === 0 && filteredMisc.length === 0) {
    alert("Nothing in the BOM / Costing tables to generate a quote. Add calculations first!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const displayCompanyName = isHistoryExport 
    ? (txData.companyName || txData.orgName) 
    : (state.selectedCompany || localStorage.getItem('metal-current-org') || 'arguscnc.com');

  const dateStr = isHistoryExport ? txData.date.split(',')[0] : new Date().toLocaleDateString('en-IN');
  const quoteNum = isHistoryExport ? txData.id : `MS-Q-${Date.now().toString().slice(-6)}`;

  // --- 1. Header Metadata block (Right-Aligned details) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(2, 112, 194); // Brand Blue (#0270c2)
  doc.text(displayCompanyName, 14, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("ESTIMATE & QUOTATION REPORT", 14, 25);
  
  // Right-aligned quotation details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
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

  // --- 2. Prepared For (Customer Name) Box ---
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

  let boxHeight = 34;
  if (clientsToRender.length > 1) {
    boxHeight = Math.max(34, 14 + (clientsToRender.length * 13));
  }

  doc.setFillColor(248, 250, 252); // Slate-50 background tint
  doc.setDrawColor(226, 232, 240); // Slate-200 border
  doc.roundedRect(14, 44, 182, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(clientsToRender.length > 1 ? `PREPARED FOR / RECIPIENTS (${clientsToRender.length}):` : "PREPARED FOR / CLIENT:", 19, 50);

  if (clientsToRender.length === 1) {
    const singleClient = clientsToRender[0];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(singleClient.name, 19, 57);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // Slate-600

    let infoY = 64;
    if (singleClient.address) {
      doc.text(`Address: ${singleClient.address}`, 19, infoY);
      infoY += 6;
    }
    if (singleClient.gstin) {
      doc.text(`GSTIN:   ${singleClient.gstin}`, 19, infoY);
    }
  } else {
    let clientY = 56;
    clientsToRender.forEach((cl, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text(`${i + 1}. ${cl.name}`, 19, clientY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // Slate-600
      const extraInfo = [
        cl.address ? `Address: ${cl.address}` : '',
        cl.gstin ? `GSTIN: ${cl.gstin}` : ''
      ].filter(Boolean).join('   |   ');

      if (extraInfo) {
        doc.text(extraInfo, 23, clientY + 4.5);
        clientY += 12;
      } else {
        clientY += 8;
      }
    });
  }

  let currentY = 44 + boxHeight + 6;

  // --- 3. Table 1: Metal Components (BOM) ---
  if (filteredBom.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text("1. Metal Components (BOM)", 14, currentY + 4);
    currentY += 7;

    const bomHeaders = [['#', 'Component Description', 'Specification Details', 'Qty', 'Unit Rate', 'Total Cost']];
    const bomRows = filteredBom.map((x, idx) => [
      idx + 1,
      x.label,
      `${x.shapeName.split(' / ')[0]} (${x.dimDesc})`,
      `${x.quantity} pcs`,
      x.rate > 0 ? `Rs. ${x.rate.toFixed(2)} / ${x.rateUnit}` : '-',
      x.totalCost > 0 ? `Rs. ${x.totalCost.toFixed(2)}` : '-'
    ]);

    doc.autoTable({
      head: bomHeaders,
      body: bomRows,
      startY: currentY,
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8.5, lineColor: [226, 232, 240], lineWidth: 0.2 },
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

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // --- 4. Table 2: Process & Labor Costing ---
  if (filteredProcesses.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text("2. Manufacturing & Process Costing", 14, currentY + 4);
    currentY += 7;

    const processHeaders = [['#', 'Process / Operation Name', 'Duration', 'Rate (₹/min)', 'Total Process Cost']];
    const processRows = filteredProcesses.map((p, idx) => [
      idx + 1,
      p.name,
      `${p.duration} min`,
      `Rs. ${p.rate.toFixed(2)}`,
      `Rs. ${p.cost.toFixed(2)}`
    ]);

    doc.autoTable({
      head: processHeaders,
      body: processRows,
      startY: currentY,
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8.5, lineColor: [226, 232, 240], lineWidth: 0.2 },
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

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // --- 5. Table 3: Bought-Out & Miscellaneous Expenses ---
  if (filteredMisc.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text("3. Other / Bought Out Expenses", 14, currentY + 4);
    currentY += 7;

    const miscHeaders = [['#', 'Expense / Hardware Item', 'Quantity', 'Unit Rate (₹)', 'Total Amount']];
    const miscRows = filteredMisc.map((m, idx) => [
      idx + 1,
      m.name,
      `${m.qty} pcs`,
      `Rs. ${m.unitCost.toFixed(2)}`,
      `Rs. ${m.cost.toFixed(2)}`
    ]);

    doc.autoTable({
      head: miscHeaders,
      body: miscRows,
      startY: currentY,
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold', fontSize: 8.5, lineColor: [226, 232, 240], lineWidth: 0.2 },
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

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Calculate subtotals
  const metalSubtotal = filteredBom.reduce((acc, x) => acc + x.totalCost, 0);
  const processSubtotal = filteredProcesses.reduce((acc, x) => acc + x.cost, 0);
  const miscSubtotal = filteredMisc.reduce((acc, x) => acc + x.cost, 0);
  const baseSubtotal = metalSubtotal + processSubtotal + miscSubtotal;
  const profitAmount = baseSubtotal * (profitPercentage / 100);
  const grandTotal = baseSubtotal;

  // Check if we need page break for summary box
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // --- 6. Executive Quotation Summary Block ---
  const summaryBoxWidth = 90;
  const summaryBoxHeight = 56;
  const summaryBoxX = 106;
  const summaryBoxY = currentY;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-500

  // Line 1: Metal
  doc.text("Materials Subtotal:", summaryBoxX + 6, summaryBoxY + 10);
  doc.text(`Rs. ${metalSubtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 10, { align: "right" });

  // Line 2: Processes
  doc.text("Processes Subtotal:", summaryBoxX + 6, summaryBoxY + 18);
  doc.text(`Rs. ${processSubtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 18, { align: "right" });

  // Line 3: Other Expenses
  doc.text("Other Expenses Subtotal:", summaryBoxX + 6, summaryBoxY + 26);
  doc.text(`Rs. ${miscSubtotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 26, { align: "right" });

  // Line 4: Profit Margin
  doc.text(`Profit Margin (${profitPercentage}%):`, summaryBoxX + 6, summaryBoxY + 34);
  doc.text(`Rs. ${profitAmount.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 34, { align: "right" });

  // Divider inside summary box
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.line(summaryBoxX + 6, summaryBoxY + 38, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 38);

  // Line 5: Grand Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald-600
  doc.text("GRAND TOTAL COST:", summaryBoxX + 6, summaryBoxY + 46);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, summaryBoxX + summaryBoxWidth - 6, summaryBoxY + 46, { align: "right" });

  // Footer notes stamp
  const footerY = 280;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("Thank you for your business!", 14, footerY);
  
  const primaryClientName = clientsToRender.length === 1 
    ? clientsToRender[0].name 
    : `Consolidated_${clientsToRender.length}_Clients`;
  const cleanClientName = primaryClientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  // Stamp all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("Powered by arguscnc.com", 14, 288);
    doc.text(`Page ${i} of ${pageCount}`, 196, 288, { align: "right" });
  }

  if (shouldPreview) {
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(`Quotation_${cleanClientName}_${quoteNum}.pdf`);
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
    saveTransaction(grandTotal, txClient);
  }
}


// --- CSV exporter ---
function exportBOMToCSV() {
  if (state.bom.length === 0 && state.processes.length === 0 && state.miscItems.length === 0) {
    alert("Quotation sheet is empty! Add calculations to export.");
    return;
  }
  
  let csv = 'Category,Item Label,Details,Qty/Factor,Unit Rate (INR),Total Cost (INR)\r\n';
  
  // Metals
  state.bom.forEach(item => {
    const rateDesc = item.rate > 0 ? `Rs. ${item.rate.toFixed(2)}/${item.rateUnit}` : '-';
    csv += [
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
      'Other Expense',
      `"${item.name.replace(/"/g, '""')}"`,
      '"Consumables/Other"',
      item.qty,
      `"Rs. ${item.unitCost.toFixed(2)}"`,
      `"Rs. ${item.cost.toFixed(2)}"`
    ].join(',') + '\r\n';
  });

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



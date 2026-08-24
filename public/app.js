// =======================================================
// Quotation Suite: Core Calculations & Billing Management
// =======================================================

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
  profitPercentage: 0
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
  googleSigninBtn: document.getElementById('google-signin-btn'),
  
  employeeOrgSetupCard: document.getElementById('employee-org-setup-card'),
  employeeOrgSetupForm: document.getElementById('employee-org-setup-form'),
  employeeSetupOrgName: document.getElementById('employee-setup-org-name'),
  employeeSetupOrgPassword: document.getElementById('employee-setup-org-password'),
  employeeOrgSetupError: document.getElementById('employee-org-setup-error'),

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
  
  // App console wrapper
  appWrapper: document.getElementById('app-wrapper'),
  logoutBtn: document.getElementById('logout-btn'),
  userDisplayOrg: document.getElementById('user-display-org'),
  userDisplayUsername: document.getElementById('user-display-username'),
  customerNameInput: document.getElementById('customer-name-input'),
  customerAddressInput: document.getElementById('customer-address-input'),
  customerGSTINInput: document.getElementById('customer-gstin-input'),

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
  DOM.authToggleBtn.addEventListener('click', toggleAuthMode);
  DOM.authForm.addEventListener('submit', handleAuthSubmit);
  DOM.logoutBtn.addEventListener('click', handleLogout);
  DOM.employeeOrgSetupForm.addEventListener('submit', handleEmployeeOrgSetupSubmit);

  // Register Org Admin Listeners
  DOM.roleUserBtn.addEventListener('click', () => setAuthRole('user'));
  DOM.roleOrgBtn.addEventListener('click', () => setAuthRole('org'));
  DOM.orgThemeToggle.addEventListener('click', toggleTheme);
  DOM.orgLogoutBtn.addEventListener('click', handleLogout);
  DOM.tabUsersBtn.addEventListener('click', () => setOrgTab('users'));
  DOM.tabQuotesBtn.addEventListener('click', () => setOrgTab('quotes'));
  DOM.tabSettingsBtn.addEventListener('click', () => setOrgTab('settings'));
  DOM.orgSetupForm.addEventListener('submit', handleOrgSetupSubmit);
  DOM.orgSettingsForm.addEventListener('submit', handleOrgSettingsSubmit);

  // Register Form Event Handlers
  DOM.shapeSelectMobile.addEventListener('change', (e) => selectShape(e.target.value));
  DOM.materialSelect.addEventListener('change', handleMaterialChange);
  DOM.densityInput.addEventListener('input', handleDensityInput);
  DOM.priceInput.addEventListener('input', handlePriceInput);
  DOM.priceUnitSelect.addEventListener('change', handlePriceUnitChange);
  DOM.quantityInput.addEventListener('input', handleQuantityInput);
  DOM.addToHistoryBtn.addEventListener('click', addItemToBOM);
  DOM.resetBtn.addEventListener('click', resetCalculatorForm);
  DOM.customerNameInput.addEventListener('input', handleCustomerNameInput);
  DOM.customerAddressInput.addEventListener('input', handleCustomerAddressInput);
  DOM.customerGSTINInput.addEventListener('input', handleCustomerGSTINInput);
  DOM.profitPercentageInput.addEventListener('input', handleProfitPercentageInput);
  
  // Document BOM quote handlers
  DOM.exportPDFBtn.addEventListener('click', () => exportQuoteToPDF());
  DOM.exportCSVBtn.addEventListener('click', exportBOMToCSV);
  DOM.clearHistoryBtn.addEventListener('click', clearBOM);

  // Add row listeners for separate config cards
  DOM.addProcessRowBtn.addEventListener('click', addProcessRow);
  DOM.addMiscRowBtn.addEventListener('click', addMiscRow);



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
    
    DOM.authTogglePrompt.parentElement.classList.remove('hidden');
    DOM.authBtnText.textContent = authMode === 'login' ? "Sign In" : "Sign Up";
    DOM.authTitle.textContent = authMode === 'login' ? "Quotation Suite Login" : "Create Account";
    DOM.authSubtitle.textContent = authMode === 'login' ? "Sign in to access your calculations & quotes." : "Sign up to configure separate quotes and profiles.";
  } else {
    DOM.roleOrgBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white transition-all";
    DOM.roleUserBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all";
    
    DOM.authUsernameContainer.classList.add('hidden');
    DOM.authPasswordContainer.classList.add('hidden');
    DOM.authUsername.removeAttribute('required');
    DOM.authPassword.removeAttribute('required');
    
    // Org Admin portal standard login only requires Organisation name and admin password
    DOM.authOrgContainer.classList.remove('hidden');
    DOM.authOrg.setAttribute('required', 'true');
    DOM.authOrgPasswordContainer.classList.remove('hidden');
    DOM.authOrgPassword.setAttribute('required', 'true');
    
    // Admins signup/register ONLY via Google OAuth, so hide the credential signup option toggle
    DOM.authTogglePrompt.parentElement.classList.add('hidden');
    authMode = 'login'; // Keep on login mode
    
    DOM.authTitle.textContent = "Organisation Portal Login";
    DOM.authSubtitle.textContent = "Sign in to access your organisation's control panel.";
    DOM.authBtnText.textContent = "Sign In as Admin";
  }
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
          body: JSON.stringify({ username, password })
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
    }
  } catch (err) {
    console.error('Auth Error:', err);
    DOM.authErrorMsg.querySelector('span').textContent = 'Server connection failed.';
    DOM.authErrorMsg.classList.remove('hidden');
  }
}

function authenticateUser(username, orgName) {
  state.currentUser = username;
  state.currentUserType = 'user';
  
  DOM.userDisplayUsername.textContent = `@${username}`;
  
  if (!orgName) {
    DOM.userDisplayOrg.textContent = 'Organisation Pending';
    DOM.employeeOrgSetupCard.classList.remove('hidden');
    DOM.employeeSetupOrgName.value = '';
    DOM.employeeSetupOrgPassword.value = '';
    DOM.employeeOrgSetupError.classList.add('hidden');
  } else {
    DOM.userDisplayOrg.textContent = orgName;
    DOM.employeeOrgSetupCard.classList.add('hidden');
    loadUserData(username);
  }
  
  showAuthOverlay(false);
  resetCalculatorForm();
  lucide.createIcons();
}

function authenticateOrg(orgName) {
  state.currentUser = orgName;
  state.currentUserType = 'org';
  
  DOM.orgUserDisplayName.textContent = orgName;
  
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

function handleLogout() {
  localStorage.removeItem('metal-current-user');
  localStorage.removeItem('metal-current-user-type');
  localStorage.removeItem('metal-current-org');
  localStorage.removeItem('metal-current-googleId');
  state.currentUser = null;
  state.currentUserType = null;
  
  DOM.authUsername.value = '';
  DOM.authPassword.value = '';
  DOM.authOrg.value = '';
  DOM.authOrgPassword.value = '';
  
  showAuthOverlay(true);
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
    const response = await fetch(`/api/transactions/${txId}`, {
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
    DOM.customerNameInput.value = state.customerName;

    state.customerAddress = data.customerAddress || '';
    DOM.customerAddressInput.value = state.customerAddress;

    state.customerGSTIN = data.customerGSTIN || '';
    DOM.customerGSTINInput.value = state.customerGSTIN;

    state.profitPercentage = data.profitPercentage || 0;
    DOM.profitPercentageInput.value = state.profitPercentage;

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
        profitPercentage: state.profitPercentage
      })
    });
  } catch (err) {
    console.error('Sync Error:', err);
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
let googleClientId = '';
let pendingGoogleUser = null;
let googleInitialized = false;

async function initGoogleSignIn() {
  try {
    const response = await fetch('/api/auth/google/config');
    const data = await response.json();
    googleClientId = data.clientId;
    
    if (!googleClientId) {
      console.warn('Google Client ID is missing. Please set GOOGLE_CLIENT_ID in your environment/.env file.');
      return;
    }
    
    attemptGoogleInit();
  } catch (err) {
    console.error('Failed to initialize Google Sign-In config:', err);
  }
}

function attemptGoogleInit() {
  const isSdkLoaded = window.googleSdkLoaded || (typeof window.google !== 'undefined');
  if (googleClientId && isSdkLoaded && window.google && !googleInitialized) {
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleSignInCallback
    });
    googleInitialized = true;
    renderGoogleButton();
  }
}

function renderGoogleButton() {
  if (window.google && DOM.googleSigninBtn) {
    const responsiveWidth = Math.max(200, Math.min(360, window.innerWidth - 64));
    window.google.accounts.id.renderButton(
      DOM.googleSigninBtn,
      { 
        theme: "outline", 
        size: "large", 
        width: String(responsiveWidth),
        logo_alignment: "left"
      }
    );
  }
}

// Re-render Google button on screen resize / orientation change for responsiveness
window.addEventListener('resize', () => {
  if (googleInitialized && DOM.appWrapper.classList.contains('hidden') && DOM.orgWrapper.classList.contains('hidden')) {
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
  
  if (state.processes.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="5" class="text-center py-6 text-slate-400 dark:text-slate-500 font-medium">
        No operations configured. Click "Add Process" above.
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
          <input type="text" value="${proc.name}" class="table-input font-bold text-slate-800 dark:text-white w-full max-w-[200px]" data-proc-id="${proc.id}" data-prop="name">
        </td>
        <td class="py-2.5 px-3 text-center">
          <input type="number" min="0" value="${proc.duration}" class="table-input text-center w-14 font-bold" data-proc-id="${proc.id}" data-prop="duration">
        </td>
        <td class="py-2.5 px-3 text-right">
          <div class="inline-flex items-center gap-0.5 justify-end">
            <span class="text-[10px] text-slate-450">₹</span>
            <input type="number" min="0" step="any" value="${proc.rate}" class="table-input text-right w-16 font-bold" data-proc-id="${proc.id}" data-prop="rate">
          </div>
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

      row.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
          const prop = e.target.getAttribute('data-prop');
          let val = e.target.value;
          if (prop === 'duration') val = parseInt(val) || 0;
          if (prop === 'rate') val = parseFloat(val) || 0;
          proc[prop] = val;
          proc.cost = proc.duration * proc.rate;
          saveProcessesToStorage();
        });
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
  const newRow = {
    id: Date.now().toString(),
    name: 'Machining operation',
    duration: 10,
    rate: 10,
    cost: 100
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
async function saveTransaction(grandTotal) {
  if (!state.currentUser || state.currentUserType !== 'user') return;
  const orgName = localStorage.getItem('metal-current-org') || 'Metal Quotation Suite';
  
  const newTx = {
    id: `MS-Q-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleString('en-IN'),
    username: state.currentUser,
    orgName: orgName,
    customerName: state.customerName || "Valued Client",
    customerAddress: state.customerAddress || "",
    customerGSTIN: state.customerGSTIN || "",
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
function exportQuoteToPDF(txData = null, shouldPreview = false) {
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
  const customerName = isHistoryExport ? txData.customerName : state.customerName;
  const customerAddress = isHistoryExport ? txData.customerAddress : state.customerAddress;
  const customerGSTIN = isHistoryExport ? txData.customerGSTIN : state.customerGSTIN;
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

  const orgName = isHistoryExport ? txData.orgName : (localStorage.getItem('metal-current-org') || 'Metal Quotation Suite');

  const clientName = customerName || "Valued Client";
  const dateStr = isHistoryExport ? txData.date.split(',')[0] : new Date().toLocaleDateString('en-IN');
  const quoteNum = isHistoryExport ? txData.id : `MS-Q-${Date.now().toString().slice(-6)}`;

  // --- 1. Header Metadata block (Right-Aligned details) ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(2, 112, 194); // Brand Blue (#0270c2)
  doc.text(orgName, 14, 20);
  
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
  const clientAddress = customerAddress || "";
  const clientGSTIN = customerGSTIN || "";

  doc.setFillColor(248, 250, 252); // Slate-50 background tint
  doc.setDrawColor(226, 232, 240); // Slate-200 border
  doc.roundedRect(14, 44, 182, 34, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("PREPARED FOR / CLIENT:", 19, 50);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(clientName, 19, 57);

  // Address and GSTIN (normal 8pt text)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate-600

  let infoY = 64;
  if (clientAddress) {
    doc.text(`Address: ${clientAddress}`, 19, infoY);
    infoY += 6;
  }
  if (clientGSTIN) {
    doc.text(`GSTIN:   ${clientGSTIN}`, 19, infoY);
  }

  let currentY = 84;

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
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5 },
      headStyles: { fillColor: [2, 112, 194], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      theme: 'striped',
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 27, halign: 'right' },
        5: { cellWidth: 27, halign: 'right' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // --- 4. Table 2: Process Operations (Labor/Machining) ---
  if (filteredProcesses.length > 0) {
    // Page break prevention
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Process Operations (Labor / Machining)", 14, currentY + 4);
    currentY += 7;

    const procHeaders = [['#', 'Process Operation', 'Category', 'Qty / Factor', 'Unit Rate', 'Total Cost']];
    const procRows = filteredProcesses.map((x, idx) => [
      idx + 1,
      x.name,
      'Processing Charge',
      `${x.duration} min`,
      `Rs. ${x.rate.toFixed(2)} / min`,
      `Rs. ${x.cost.toFixed(2)}`
    ]);

    doc.autoTable({
      head: procHeaders,
      body: procRows,
      startY: currentY,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }, // Indigo
      alternateRowStyles: { fillColor: [250, 250, 250] },
      theme: 'striped',
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 27, halign: 'right' },
        5: { cellWidth: 27, halign: 'right' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // --- 5. Table 3: Other Expenses ---
  if (filteredMisc.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Other Expenses (Consumables / Bought-out)", 14, currentY + 4);
    currentY += 7;

    const miscHeaders = [['#', 'Other Expense Item', 'Category', 'Qty', 'Unit Cost', 'Total Cost']];
    const miscRows = filteredMisc.map((x, idx) => [
      idx + 1,
      x.name,
      'Hardware / Consumable',
      x.qty,
      `Rs. ${x.unitCost.toFixed(2)}`,
      `Rs. ${x.cost.toFixed(2)}`
    ]);

    doc.autoTable({
      head: miscHeaders,
      body: miscRows,
      startY: currentY,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 2.5 },
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255] }, // Amber
      alternateRowStyles: { fillColor: [250, 250, 250] },
      theme: 'striped',
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 27, halign: 'right' },
        5: { cellWidth: 27, halign: 'right' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // --- 6. Summary Totals Card Block (Premium Right Aligned Box) ---
  const metalTotal = bom.reduce((acc, x) => acc + x.totalCost, 0);
  const processTotal = processes.reduce((acc, x) => acc + x.cost, 0);
  const miscTotal = miscItems.reduce((acc, x) => acc + x.cost, 0);
  
  const subtotal = metalTotal + processTotal + miscTotal;
  const profitVal = subtotal * (profitPercentage / 100);
  const grandTotal = subtotal;

  // Make sure totals block doesn't flow off-page.
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  // Draw clean boundary box for invoice totals
  const boxWidth = 110;
  const boxHeight = 58;
  const boxX = 86;
  const boxY = currentY + 4;

  doc.setFillColor(250, 250, 250); // very soft white/grey
  doc.setDrawColor(226, 232, 240); // Slate-200 border
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, "FD");

  // Summary Row lines
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500

  // Line 1: Materials
  doc.text("Materials Cost Subtotal:", boxX + 6, boxY + 11);
  doc.setFont("helvetica", "normal");
  doc.text(`Rs. ${metalTotal.toFixed(2)}`, boxX + boxWidth - 6, boxY + 11, { align: "right" });

  // Line 2: Processes
  doc.setFont("helvetica", "bold");
  doc.text("Processing Cost Subtotal:", boxX + 6, boxY + 18);
  doc.setFont("helvetica", "normal");
  doc.text(`Rs. ${processTotal.toFixed(2)}`, boxX + boxWidth - 6, boxY + 18, { align: "right" });

  // Line 3: Other Expenses
  doc.setFont("helvetica", "bold");
  doc.text("Other Expenses Subtotal:", boxX + 6, boxY + 25);
  doc.setFont("helvetica", "normal");
  doc.text(`Rs. ${miscTotal.toFixed(2)}`, boxX + boxWidth - 6, boxY + 25, { align: "right" });

  // Line 4: Profit Margin
  doc.setFont("helvetica", "bold");
  doc.text(`Profit Margin (${profitPercentage}%):`, boxX + 6, boxY + 32);
  doc.setFont("helvetica", "normal");
  doc.text(`Rs. ${profitVal.toFixed(2)}`, boxX + boxWidth - 6, boxY + 32, { align: "right" });

  // Divider Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(16, 185, 129); // Emerald-500
  doc.line(boxX, boxY + 37, boxX + boxWidth, boxY + 37);

  // Line 5: Grand Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129); // Emerald-600
  doc.text("GRAND TOTAL COST:", boxX + 6, boxY + 44);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, boxX + boxWidth - 6, boxY + 44, { align: "right" });

  // GST line below Grand Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("+GST charges", boxX + 6, boxY + 51);

  // Footer notes stamp
  currentY = boxY + boxHeight + 15;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("Thank you for your business!", 14, currentY);
  doc.text(`Generated electronically by ${orgName} via Quotation Suite. Subject to terms & conditions.`, 14, currentY + 4);

  const cleanClientName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  if (shouldPreview) {
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    doc.save(`Quotation_${cleanClientName}_${quoteNum}.pdf`);
  }

  // Save transaction to history if generated by active user
  if (!isHistoryExport) {
    saveTransaction(grandTotal);
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



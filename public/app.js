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
  { id: 'carbide-tungsten', name: 'Carbide / Tungsten Carbide (WC)', density: 14.80 },
  { id: 'carbide-silicon', name: 'Silicon Carbide (SiC)', density: 3.21 },
  { id: 'carbide-titanium', name: 'Titanium Carbide (TiC)', density: 4.93 },
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
  const num = typeof value === 'number' ? value : (parseFloat(value) || 0);
  return num.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatNumber(value, decimals = 2) {
  const num = typeof value === 'number' ? value : (parseFloat(value) || 0);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
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
  subCompanyProfiles: [],
  selectedCompany: '',
  selectedPdfTheme: localStorage.getItem('metal-pdf-theme') || 'modern-blue',
  savedQuotationsDirectory: [],
  transactionsHistory: [],
  processRates: [],
  clients: [],
  selectedClients: [],
  permissions: {
    canAccessClients: true,
    canConfigureProcessRates: true,
    canViewProducts: true,
    canExportQuotes: true,
    canViewHistory: true
  },
  // Daily metal market prices (fetched from Metals-API)
  metalPrices: {},        // { materialId: { available, pricePerKg, symbol, commodityName } }
  metalPricesDate: null,  // "2026-09-04"
  metalPricesFetchedAt: null
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
  authOrgGstin: document.getElementById('auth-org-gstin'),
  authOrgGstinContainer: document.getElementById('auth-org-gstin-container'),
  btnFetchGstin: document.getElementById('btn-fetch-gstin'),
  btnFetchGstinText: document.getElementById('btn-fetch-gstin-text'),
  authGstinStatus: document.getElementById('auth-gstin-status'),
  authOrgEmail: document.getElementById('auth-org-email'),
  authOrgEmailContainer: document.getElementById('auth-org-email-container'),
  authOrgContainer: document.getElementById('auth-org-container'),
  authOrgPasswordContainer: document.getElementById('auth-org-password-container'),
  authUsernameContainer: document.getElementById('auth-username-container'),
  authPasswordContainer: document.getElementById('auth-password-container'),
  toggleAuthPasswordBtn: document.getElementById('toggle-auth-password'),
  toggleAuthPasswordIcon: document.getElementById('toggle-auth-password-icon'),
  toggleAuthOrgPasswordBtn: document.getElementById('toggle-auth-org-password'),
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
  googleBtnLabel: document.getElementById('google-btn-label'),
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
  orgSettingsGstin: document.getElementById('org-settings-gstin'),
  orgSettingsWebsite: document.getElementById('org-settings-website'),
  orgSettingsAddress: document.getElementById('org-settings-address'),
  orgSettingsLogoInput: document.getElementById('org-settings-logo-input'),
  orgSettingsLogoUploadBtn: document.getElementById('org-settings-logo-upload-btn'),
  orgSettingsLogoRemoveBtn: document.getElementById('org-settings-logo-remove-btn'),
  orgSettingsLogoImg: document.getElementById('org-settings-logo-img'),
  orgSettingsLogoPlaceholder: document.getElementById('org-settings-logo-placeholder'),
  orgSettingsPhonesContainer: document.getElementById('org-settings-phones-container'),
  addOrgPhoneBtn: document.getElementById('add-org-phone-btn'),
  orgSettingsEmailsContainer: document.getElementById('org-settings-emails-container'),
  addOrgEmailBtn: document.getElementById('add-org-email-btn'),
  orgSettingsBankName: document.getElementById('org-settings-bank-name'),
  orgSettingsBankAccount: document.getElementById('org-settings-bank-account'),
  orgSettingsBankBranch: document.getElementById('org-settings-bank-branch'),
  orgSettingsBankIfsc: document.getElementById('org-settings-bank-ifsc'),
  orgSettingsBankUpi: document.getElementById('org-settings-bank-upi'),
  orgSettingsDeclaration: document.getElementById('org-settings-declaration'),
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

  // Org Profile & Access Code in Settings
  orgSettingsAccessCode: document.getElementById('org-settings-access-code'),
  copyAccessCodeBtn: document.getElementById('copy-access-code-btn'),
  copyAccessCodeIcon: document.getElementById('copy-access-code-icon'),
  regenerateAccessCodeBtn: document.getElementById('regenerate-access-code-btn'),

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
  
  // Sub-Companies Management (Settings Tab)
  btnShowAddSubCompany: document.getElementById('btn-show-add-subcompany'),
  subCompaniesListContainer: document.getElementById('subcompanies-list-container'),
  subCompanyFormContainer: document.getElementById('subcompany-form-container'),
  subCompanyFormTitle: document.getElementById('subcompany-form-title'),
  subCompanyEditorForm: document.getElementById('subcompany-editor-form'),
  subCompanyEditId: document.getElementById('subcompany-edit-id'),
  subCompanyInputName: document.getElementById('subcompany-input-name'),
  subCompanyInputGstin: document.getElementById('subcompany-input-gstin'),
  subCompanyInputWebsite: document.getElementById('subcompany-input-website'),
  subCompanyInputAddress: document.getElementById('subcompany-input-address'),
  subCompanyPhonesContainer: document.getElementById('subcompany-phones-container'),
  subCompanyEmailsContainer: document.getElementById('subcompany-emails-container'),
  addSubCompanyPhoneBtn: document.getElementById('add-subcompany-phone-btn'),
  addSubCompanyEmailBtn: document.getElementById('add-subcompany-email-btn'),
  subCompanyInputBankName: document.getElementById('subcompany-input-bank-name'),
  subCompanyInputBankAccount: document.getElementById('subcompany-input-bank-account'),
  subCompanyInputBankBranch: document.getElementById('subcompany-input-bank-branch'),
  subCompanyInputBankIfsc: document.getElementById('subcompany-input-bank-ifsc'),
  subCompanyInputBankUpi: document.getElementById('subcompany-input-bank-upi'),
  subCompanyInputDeclaration: document.getElementById('subcompany-input-declaration'),
  subCompanyFormCloseBtn: document.getElementById('subcompany-form-close-btn'),
  subCompanyFormCancelBtn: document.getElementById('subcompany-form-cancel-btn'),
  
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
  processOperationsModal: document.getElementById('process-operations-modal'),
  processOperationsModalTitle: document.getElementById('process-operations-modal-title'),
  processOperationsModalSubtitle: document.getElementById('process-operations-modal-subtitle'),
  processFormContainer: document.getElementById('process-form-container'),
  closeProcessOperationsModalBtn: document.getElementById('close-process-operations-modal-btn'),
  cancelProcessOperationsBtn: document.getElementById('cancel-process-operations-btn'),
  submitAddSelectedProcessesBtn: document.getElementById('submit-add-selected-processes-btn'),
  modalAddProcessForm: document.getElementById('modal-add-process-form'),
  modalNewProfileName: document.getElementById('modal-new-profile-name'),
  modalNewProfileRate: document.getElementById('modal-new-profile-rate'),
  modalNewProfileUnit: document.getElementById('modal-new-profile-unit'),
  processSearchInput: document.getElementById('process-search-input'),
  clearProcessSearchBtn: document.getElementById('clear-process-search-btn'),
  modalProcessesViewLimitSelect: document.getElementById('modal-processes-view-limit-select'),
  modalProcessProfilesList: document.getElementById('modal-process-profiles-list'),
  modalProcessCount: document.getElementById('modal-process-count'),
  modalSelectAllProcessesBtn: document.getElementById('modal-select-all-processes-btn'),
  modalDeselectAllProcessesBtn: document.getElementById('modal-deselect-all-processes-btn'),
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
  clientsModalTitle: document.getElementById('clients-modal-title'),
  clientsModalSubtitle: document.getElementById('clients-modal-subtitle'),
  clientFormContainer: document.getElementById('client-form-container'),
  closeClientsModalBtn: document.getElementById('close-clients-modal-btn'),
  addClientForm: document.getElementById('add-client-form'),
  clientFormTitle: document.getElementById('client-form-title'),
  clientFormIcon: document.getElementById('client-form-icon'),
  clientInputName: document.getElementById('client-input-name'),
  clientInputEmail: document.getElementById('client-input-email'),
  addClientEmailRowBtn: document.getElementById('add-client-email-row-btn'),
  clientEmailsContainer: document.getElementById('client-emails-container'),
  clientInputPhone: document.getElementById('client-input-phone'),
  addClientPhoneRowBtn: document.getElementById('add-client-phone-row-btn'),
  clientPhonesContainer: document.getElementById('client-phones-container'),
  clientInputAddress: document.getElementById('client-input-address'),
  clientInputGSTIN: document.getElementById('client-input-gstin'),
  cancelClientEditBtn: document.getElementById('cancel-client-edit-btn'),
  clientFormSubmitBtn: document.getElementById('client-form-submit-btn'),
  clientFormSubmitIcon: document.getElementById('client-form-submit-icon'),
  clientFormSubmitText: document.getElementById('client-form-submit-text'),
  clientSearchInput: document.getElementById('client-search-input'),
  clearClientSearchBtn: document.getElementById('clear-client-search-btn'),
  modalClientsList: document.getElementById('modal-clients-list'),
  modalClientsCount: document.getElementById('modal-clients-count'),
  modalSelectedClientsCount: document.getElementById('modal-selected-clients-count') || document.getElementById('modal-selected-summary'),
  modalSelectedSummary: document.getElementById('modal-selected-summary') || document.getElementById('modal-selected-clients-count'),
  modalClientsListCounter: document.getElementById('modal-clients-list-counter'),
  modalClientsViewLimitSelect: document.getElementById('modal-clients-view-limit-select'),
  modalSelectAllClientsBtn: document.getElementById('modal-select-all-clients-btn') || document.getElementById('modal-select-all-btn'),
  modalSelectAllBtn: document.getElementById('modal-select-all-clients-btn') || document.getElementById('modal-select-all-btn'),
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
  exportModalModeBadge: document.getElementById('export-modal-mode-badge'),

  // Quotation Section 1 & Section 4 controls
  orgOpenClientDirectoryBtn: document.getElementById('org-open-client-directory-btn'),
  orgSendEmailQuoteBtn: document.getElementById('org-send-email-quote-btn'),
  orgExportPdfQuoteBtn: document.getElementById('org-export-pdf-quote-btn'),
  orgExportPdfWorkingsBtn: document.getElementById('org-export-pdf-workings-btn'),

  // Email Quotation Modal
  emailQuoteModal: document.getElementById('email-quote-modal'),
  closeEmailQuoteModalBtn: document.getElementById('close-email-quote-modal-btn'),
  cancelEmailQuoteBtn: document.getElementById('cancel-email-quote-btn'),
  emailQuoteForm: document.getElementById('email-quote-form'),
  emailQuoteTo: document.getElementById('email-quote-to'),
  emailQuoteToRecipientsList: document.getElementById('email-quote-to-recipients-list'),
  emailQuoteSelectAllBtn: document.getElementById('email-quote-select-all-btn'),
  emailQuoteDeselectAllBtn: document.getElementById('email-quote-deselect-all-btn'),
  emailQuoteCustomTo: document.getElementById('email-quote-custom-to'),
  emailQuoteCc: document.getElementById('email-quote-cc'),
  emailQuoteSubject: document.getElementById('email-quote-subject'),
  emailQuoteMessage: document.getElementById('email-quote-message'),
  emailQuoteAttachmentName: document.getElementById('email-quote-attachment-name'),
  emailQuoteOpenPdfTabBtn: document.getElementById('email-quote-open-pdf-tab-btn'),
  emailQuotePdfIframe: document.getElementById('email-quote-pdf-iframe'),
  emailQuoteClientName: document.getElementById('email-quote-client-name'),
  emailQuoteError: document.getElementById('email-quote-error'),
  submitEmailQuoteBtn: document.getElementById('submit-email-quote-btn'),
  submitEmailQuoteText: document.getElementById('submit-email-quote-text'),

  // Org wrapper (Organisation Dashboard)
  orgWrapper: document.getElementById('org-wrapper'),
  orgDisplayTitle: document.getElementById('org-display-title'),
  orgHeaderRoleBadge: document.getElementById('org-header-role-badge'),
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
  sidebarToggleBtn: document.getElementById('sidebar-toggle-btn'),
  orgSidebar: document.getElementById('org-sidebar'),
  sidebarMetalCalcBtn: document.getElementById('sidebar-metal-calc-btn'),
  sidebarQuotationBtn: document.getElementById('sidebar-quotation-btn'),
  sidebarDirectoryBtn: document.getElementById('sidebar-directory-btn'),
  sidebarSettingsBtn: document.getElementById('sidebar-settings-btn'),
  sidebarUsersBtn: document.getElementById('sidebar-users-btn'),
  sidebarProductsBtn: document.getElementById('sidebar-products-btn'),
  sidebarQuotesBtn: document.getElementById('sidebar-quotes-btn'),
  sidebarLogoutBtn: document.getElementById('sidebar-logout-btn'),
  tabUsersBtn: document.getElementById('tab-users-btn'),
  tabOrgProductsBtn: document.getElementById('tab-org-products-btn'),
  tabQuotesBtn: document.getElementById('tab-quotes-btn'),
  tabDirectoryBtn: document.getElementById('tab-directory-btn'),
  tabSettingsBtn: document.getElementById('tab-settings-btn'),
  tabCalculatorContent: document.getElementById('tab-calculator-content'),
  tabQuotationContent: document.getElementById('tab-quotation-content'),
  tabDirectoryContent: document.getElementById('tab-directory-content'),
  orgCalcQuotationView: document.getElementById('org-calc-quotation-view'),
  orgCalcWorkingsView: document.getElementById('org-calc-workings-view'),
  orgSaveQuoteBtn: document.getElementById('org-save-quote-btn'),
  directoryQuotesTableBody: document.getElementById('directory-quotes-table-body'),
  directoryQuotesCountBadge: document.getElementById('directory-quotes-count-badge'),
  directorySearchInput: document.getElementById('directory-search-input'),
  viewDirectoryQuoteModal: document.getElementById('view-directory-quote-modal'),
  closeDirectoryQuoteModalBtn: document.getElementById('close-directory-quote-modal-btn'),
  closeDirectoryModalFooterBtn: document.getElementById('close-directory-modal-footer-btn'),
  deleteDirectoryModalBtn: document.getElementById('delete-directory-modal-btn'),
  loadDirectoryQuoteToWorkspaceBtn: document.getElementById('load-directory-quote-to-workspace-btn'),
  workingsBackToQuoteBtn: document.getElementById('workings-back-to-quote-btn'),
  workingsSaveReturnBtn: document.getElementById('workings-save-return-btn'),
  workingsInlineProductName: document.getElementById('workings-inline-product-name'),
  quoteGoToCalculatorBtn: document.getElementById('quote-go-to-calculator-btn'),
  calcGoToQuotationHeaderBtn: document.getElementById('calc-go-to-quotation-header-btn'),
  calculatorActiveProductTag: document.getElementById('calculator-active-product-tag'),
  tabUsersContent: document.getElementById('tab-users-content'),
  tabOrgProductsContent: document.getElementById('tab-org-products-content'),
  tabQuotesContent: document.getElementById('tab-quotes-content'),
  tabSettingsContent: document.getElementById('tab-settings-content'),
  orgImportClientsBtn: document.getElementById('org-import-clients-btn'),
  orgDownloadSampleBtn: document.getElementById('org-download-sample-btn'),
  orgClientSearchInput: document.getElementById('org-client-search-input'),
  orgClearClientSearchBtn: document.getElementById('org-clear-client-search-btn'),
  orgClientsCountBadge: document.getElementById('org-clients-count-badge'),
  orgClientsTableBody: document.getElementById('org-clients-table-body'),
  orgClientsViewLimitSelect: document.getElementById('org-clients-view-limit-select'),
  orgClientsPaginationContainer: document.getElementById('org-clients-pagination-container'),
  orgClientsPaginationInfo: document.getElementById('org-clients-pagination-info'),
  orgAddClientBtn: document.getElementById('org-add-client-btn'),
  orgQuotationItemsBody: document.getElementById('org-quotation-items-body'),
  orgAddProductBtn: document.getElementById('org-add-product-btn'),
  orgCalcSubtotal: document.getElementById('org-calc-subtotal'),
  orgCalcCgstRate: document.getElementById('org-calc-cgst-rate'),
  orgCalcCgstAmount: document.getElementById('org-calc-cgst-amount'),
  orgCalcSgstRate: document.getElementById('org-calc-sgst-rate'),
  orgCalcSgstAmount: document.getElementById('org-calc-sgst-amount'),
  orgCalcIgstRate: document.getElementById('org-calc-igst-rate'),
  orgCalcIgstAmount: document.getElementById('org-calc-igst-amount'),
  orgCalcRoundOff: document.getElementById('org-calc-round-off'),
  orgCalcGrandTotal: document.getElementById('org-calc-grand-total'),
  orgExportSeparatePdfBtn: document.getElementById('org-export-separate-pdf-btn'),
  orgExportMasterPdfBtn: document.getElementById('org-export-master-pdf-btn'),
  orgExportPdfWithWorkingsBtn: document.getElementById('org-export-pdf-with-workings-btn'),
  orgExportExcelBtn: document.getElementById('org-export-excel-btn'),
  orgClearQuotationBtn: document.getElementById('org-clear-quotation-btn'),
  productWorkingsModal: document.getElementById('product-workings-modal'),
  closeProductWorkingsModal: document.getElementById('close-product-workings-modal'),
  closeProductWorkingsFooterBtn: document.getElementById('close-product-workings-footer-btn'),
  editProductWorkingsWorkspaceBtn: document.getElementById('edit-product-workings-workspace-btn'),
  workingsProductTitle: document.getElementById('workings-product-title'),
  productWorkingsModalContent: document.getElementById('product-workings-modal-content'),
  orgUsersTableBody: document.getElementById('org-users-table-body'),
  orgProductsTableBody: document.getElementById('org-products-table-body'),
  orgProductsGrid: document.getElementById('org-products-grid'),
  orgProductsCountBadge: document.getElementById('org-products-count-badge'),
  orgProductsSearchInput: document.getElementById('org-products-search-input'),
  orgProductsSearchClear: document.getElementById('org-products-search-clear'),
  orgQuotesTableBody: document.getElementById('org-quotes-table-body'),
  orgOpenAddUserModalBtn: document.getElementById('org-open-add-user-modal-btn'),
  orgAddUserModal: document.getElementById('org-add-user-modal'),
  closeOrgAddUserModalBtn: document.getElementById('close-org-add-user-modal-btn'),
  cancelOrgAddUserBtn: document.getElementById('cancel-org-add-user-btn'),
  orgAddUserForm: document.getElementById('org-add-user-form'),
  orgAddUserName: document.getElementById('org-add-user-name'),
  orgAddUserEmail: document.getElementById('org-add-user-email'),
  orgAddUserPassword: document.getElementById('org-add-user-password'),
  addUserPermCalc: document.getElementById('add-user-perm-calc'),
  addUserPermQuote: document.getElementById('add-user-perm-quote'),
  addUserPermUsers: document.getElementById('add-user-perm-users'),
  addUserPermProducts: document.getElementById('add-user-perm-products'),
  addUserPermHistory: document.getElementById('add-user-perm-history'),
  userPermissionsModal: document.getElementById('user-permissions-modal'),
  closeUserPermissionsModalBtn: document.getElementById('close-user-permissions-modal-btn'),
  cancelUserPermissionsBtn: document.getElementById('cancel-user-permissions-btn'),
  userPermissionsForm: document.getElementById('user-permissions-form'),
  modalPermTargetUser: document.getElementById('modal-perm-target-user'),
  modalPermUsername: document.getElementById('modal-perm-username'),
  modalPermAllowAllBtn: document.getElementById('modal-perm-allow-all-btn'),
  modalPermRestrictAllBtn: document.getElementById('modal-perm-restrict-all-btn'),
  permCanAccessCalc: document.getElementById('perm-can-access-calc'),
  permCanAccessQuote: document.getElementById('perm-can-access-quote'),
  permCanAccessUsers: document.getElementById('perm-can-access-users'),
  permCanAccessProducts: document.getElementById('perm-can-access-products'),
  permCanAccessHistory: document.getElementById('perm-can-access-history'),

  // SVG Preview Containers
  svgPreviewContainer: document.getElementById('svg-preview-container'),
  workingsSvgPreviewContainer: document.getElementById('workings-svg-preview-container'),

  // Calculator inputs (Standalone & Workings)
  shapeGrid: document.getElementById('shape-grid'),
  shapeSelectMobile: document.getElementById('shape-select-mobile'),
  activeShapeBadge: document.getElementById('active-shape-badge'),
  materialSelect: document.getElementById('material-select'),
  materialSearchInput: document.getElementById('material-search-input'),
  materialDropdownToggleBtn: document.getElementById('material-dropdown-toggle-btn'),
  materialDropdownList: document.getElementById('material-dropdown-list'),
  materialPriceInfo: document.getElementById('material-price-info'),
  densityInput: document.getElementById('density-input'),
  dimensionsContainer: document.getElementById('dimensions-container'),
  globalUnitSelector: document.getElementById('global-unit-selector'),
  priceInput: document.getElementById('price-input'),
  priceUnitSelect: document.getElementById('price-unit-select'),
  quantityInput: document.getElementById('quantity-input'),
  addToHistoryBtn: document.getElementById('add-to-history-btn'),
  resetBtn: document.getElementById('reset-btn'),

  workingsShapeGrid: document.getElementById('workings-shape-grid'),
  workingsShapeSelectMobile: document.getElementById('workings-shape-select-mobile'),
  workingsActiveShapeBadge: document.getElementById('workings-active-shape-badge'),
  workingsMaterialSelect: document.getElementById('workings-material-select'),
  workingsMaterialSearchInput: document.getElementById('workings-material-search-input'),
  workingsMaterialDropdownToggleBtn: document.getElementById('workings-material-dropdown-toggle-btn'),
  workingsMaterialDropdownList: document.getElementById('workings-material-dropdown-list'),
  workingsMaterialPriceInfo: document.getElementById('workings-material-price-info'),
  workingsDensityInput: document.getElementById('workings-density-input'),
  workingsDimensionsContainer: document.getElementById('workings-dimensions-container'),
  workingsPriceInput: document.getElementById('workings-price-input'),
  workingsPriceUnitSelect: document.getElementById('workings-price-unit-select'),
  workingsQuantityInput: document.getElementById('workings-quantity-input'),
  workingsAddToHistoryBtn: document.getElementById('workings-add-to-history-btn'),
  workingsResetBtn: document.getElementById('workings-reset-btn'),

  // Calculation summaries (Standalone & Workings)
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

  workingsResultWeightPrimary: document.getElementById('workings-result-weight-primary'),
  workingsResultWeightUnit: document.getElementById('workings-result-weight-unit'),
  workingsResultWeightLbs: document.getElementById('workings-result-weight-lbs'),
  workingsResultWeightGrams: document.getElementById('workings-result-weight-grams'),
  workingsResultWeightTonnes: document.getElementById('workings-result-weight-tonnes'),
  workingsResultVolume: document.getElementById('workings-result-volume'),
  workingsResultDensity: document.getElementById('workings-result-density'),
  workingsCostResultCard: document.getElementById('workings-cost-result-card'),
  workingsResultCost: document.getElementById('workings-result-cost'),
  workingsCostRateBadge: document.getElementById('workings-cost-rate-badge'),

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
  selectProcessRowBtn: document.getElementById('select-process-row-btn'),
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
  initSidebarState();
  loadMetalPrices(); // Fetch daily metal market prices
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

  // GSTIN Lookup Listeners
  if (DOM.btnFetchGstin) {
    DOM.btnFetchGstin.addEventListener('click', fetchGstinDetails);
  }
  if (DOM.authOrgGstin) {
    DOM.authOrgGstin.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (e.target.value.trim().length === 15) {
        fetchGstinDetails();
      }
    });
  }

  if (DOM.sidebarToggleBtn) DOM.sidebarToggleBtn.addEventListener('click', toggleSidebar);
  if (DOM.orgThemeToggle) DOM.orgThemeToggle.addEventListener('click', toggleTheme);
  if (DOM.orgLogoutBtn) DOM.orgLogoutBtn.addEventListener('click', handleLogout);
  if (DOM.sidebarLogoutBtn) DOM.sidebarLogoutBtn.addEventListener('click', handleLogout);
  if (DOM.sidebarMetalCalcBtn) DOM.sidebarMetalCalcBtn.addEventListener('click', () => setOrgTab('calculator'));
  if (DOM.sidebarQuotationBtn) DOM.sidebarQuotationBtn.addEventListener('click', () => setOrgTab('quotation'));
  if (DOM.sidebarDirectoryBtn) DOM.sidebarDirectoryBtn.addEventListener('click', () => setOrgTab('directory'));
  if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.addEventListener('click', () => setOrgTab('users'));
  if (DOM.sidebarProductsBtn) DOM.sidebarProductsBtn.addEventListener('click', () => setOrgTab('products'));
  if (DOM.sidebarQuotesBtn) DOM.sidebarQuotesBtn.addEventListener('click', () => setOrgTab('quotes'));
  if (DOM.sidebarSettingsBtn) DOM.sidebarSettingsBtn.addEventListener('click', () => setOrgTab('settings'));
  if (DOM.orgSaveQuoteBtn) DOM.orgSaveQuoteBtn.addEventListener('click', handleSaveQuoteToDirectory);
  if (DOM.directorySearchInput) DOM.directorySearchInput.addEventListener('input', renderQuotationDirectory);
  if (DOM.closeDirectoryQuoteModalBtn) DOM.closeDirectoryQuoteModalBtn.addEventListener('click', closeViewDirectoryQuoteModal);
  if (DOM.closeDirectoryModalFooterBtn) DOM.closeDirectoryModalFooterBtn.addEventListener('click', closeViewDirectoryQuoteModal);
  if (DOM.viewDirectoryQuoteModal) {
    DOM.viewDirectoryQuoteModal.addEventListener('click', (e) => {
      if (e.target === DOM.viewDirectoryQuoteModal) closeViewDirectoryQuoteModal();
    });
  }
  if (DOM.quoteGoToCalculatorBtn) DOM.quoteGoToCalculatorBtn.addEventListener('click', () => setOrgTab('calculator'));
  if (DOM.calcGoToQuotationHeaderBtn) {
    DOM.calcGoToQuotationHeaderBtn.addEventListener('click', () => {
      saveUserDataToServer();
      setOrgTab('quotation');
    });
  }
  if (DOM.workingsBackToQuoteBtn) DOM.workingsBackToQuoteBtn.addEventListener('click', closeWorkingsAndReturnToQuote);
  if (DOM.workingsSaveReturnBtn) DOM.workingsSaveReturnBtn.addEventListener('click', saveWorkingsAndReturnToQuote);
  const saveCalcSheetBtn = document.getElementById('add-calculations-to-product-btn');
  if (saveCalcSheetBtn) saveCalcSheetBtn.addEventListener('click', saveWorkingsAndReturnToQuote);
  if (DOM.tabUsersBtn) DOM.tabUsersBtn.addEventListener('click', () => setOrgTab('users'));
  if (DOM.tabOrgProductsBtn) DOM.tabOrgProductsBtn.addEventListener('click', () => setOrgTab('products'));
  if (DOM.tabQuotesBtn) DOM.tabQuotesBtn.addEventListener('click', () => setOrgTab('quotes'));
  if (DOM.tabSettingsBtn) DOM.tabSettingsBtn.addEventListener('click', () => setOrgTab('settings'));
  if (DOM.orgSetupForm) DOM.orgSetupForm.addEventListener('submit', handleOrgSetupSubmit);
  if (DOM.orgSettingsForm) DOM.orgSettingsForm.addEventListener('submit', handleOrgSettingsSubmit);
  if (DOM.addOrgPhoneBtn) DOM.addOrgPhoneBtn.addEventListener('click', () => addOrgPhoneRow(''));
  if (DOM.addOrgEmailBtn) DOM.addOrgEmailBtn.addEventListener('click', () => addOrgEmailRow(''));
  setupOrgLogoHandlers();
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

  // Org Calculator & Quotation View Listeners
  if (DOM.orgImportClientsBtn) {
    DOM.orgImportClientsBtn.addEventListener('click', () => {
      if (DOM.clientsExcelFileInput) DOM.clientsExcelFileInput.click();
    });
  }
  if (DOM.orgDownloadSampleBtn) {
    DOM.orgDownloadSampleBtn.addEventListener('click', downloadSampleClientsExcel);
  }
  if (DOM.orgClientSearchInput) {
    DOM.orgClientSearchInput.addEventListener('input', (e) => {
      orgClientSearchQuery = (e.target.value || '').trim().toLowerCase();
      if (DOM.orgClearClientSearchBtn) {
        if (orgClientSearchQuery) {
          DOM.orgClearClientSearchBtn.classList.remove('hidden');
        } else {
          DOM.orgClearClientSearchBtn.classList.add('hidden');
        }
      }
      orgClientsVisibleLimit = 10;
      renderOrgCalculatorView();
    });
  }
  if (DOM.orgClearClientSearchBtn) {
    DOM.orgClearClientSearchBtn.addEventListener('click', () => {
      if (DOM.orgClientSearchInput) DOM.orgClientSearchInput.value = '';
      orgClientSearchQuery = '';
      DOM.orgClearClientSearchBtn.classList.add('hidden');
      renderOrgCalculatorView();
    });
  }
  if (DOM.orgOpenClientDirectoryBtn) {
    DOM.orgOpenClientDirectoryBtn.addEventListener('click', () => openClientsModal('select'));
  }
  if (DOM.orgAddClientBtn) {
    DOM.orgAddClientBtn.addEventListener('click', () => openClientsModal('add'));
  }
  if (DOM.orgAddProductBtn) {
    DOM.orgAddProductBtn.addEventListener('click', handleOrgAddProduct);
  }
  if (DOM.orgCalcCgstRate) {
    DOM.orgCalcCgstRate.addEventListener('focus', () => {
      const currentCgst = parseFloat(DOM.orgCalcCgstRate.value) || 0;
      const currentIgst = parseFloat(DOM.orgCalcIgstRate?.value) || 0;
      if (currentCgst === 0 && currentIgst > 0) {
        DOM.orgCalcCgstRate.value = lastEnteredCgstRate || 9;
        if (DOM.orgCalcSgstRate) DOM.orgCalcSgstRate.value = lastEnteredSgstRate || 9;
        if (DOM.orgCalcIgstRate) DOM.orgCalcIgstRate.value = '';
        calculateOrgQuotationTotals();
      }
    });
    DOM.orgCalcCgstRate.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        lastEnteredCgstRate = val;
        if (DOM.orgCalcIgstRate) DOM.orgCalcIgstRate.value = '';
      }
      calculateOrgQuotationTotals();
    });
  }
  if (DOM.orgCalcSgstRate) {
    DOM.orgCalcSgstRate.addEventListener('focus', () => {
      const currentSgst = parseFloat(DOM.orgCalcSgstRate.value) || 0;
      const currentIgst = parseFloat(DOM.orgCalcIgstRate?.value) || 0;
      if (currentSgst === 0 && currentIgst > 0) {
        DOM.orgCalcSgstRate.value = lastEnteredSgstRate || 9;
        if (DOM.orgCalcCgstRate) DOM.orgCalcCgstRate.value = lastEnteredCgstRate || 9;
        if (DOM.orgCalcIgstRate) DOM.orgCalcIgstRate.value = '';
        calculateOrgQuotationTotals();
      }
    });
    DOM.orgCalcSgstRate.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        lastEnteredSgstRate = val;
        if (DOM.orgCalcIgstRate) DOM.orgCalcIgstRate.value = '';
      }
      calculateOrgQuotationTotals();
    });
  }
  if (DOM.orgCalcIgstRate) {
    DOM.orgCalcIgstRate.addEventListener('input', (e) => {
      const raw = e.target.value.trim();
      const val = parseFloat(raw);
      if (raw !== '' && !isNaN(val) && val > 0) {
        const currentCgst = parseFloat(DOM.orgCalcCgstRate?.value) || 0;
        const currentSgst = parseFloat(DOM.orgCalcSgstRate?.value) || 0;
        if (currentCgst > 0) lastEnteredCgstRate = currentCgst;
        if (currentSgst > 0) lastEnteredSgstRate = currentSgst;
        if (DOM.orgCalcCgstRate) DOM.orgCalcCgstRate.value = '0';
        if (DOM.orgCalcSgstRate) DOM.orgCalcSgstRate.value = '0';
      }
      calculateOrgQuotationTotals();
    });
  }
  if (DOM.orgHeaderRoleBadge) {
    DOM.orgHeaderRoleBadge.addEventListener('click', () => {
      if (state.currentUserType !== 'user') {
        setOrgTab('settings');
      }
    });
  }
  if (DOM.orgSendEmailQuoteBtn) {
    DOM.orgSendEmailQuoteBtn.addEventListener('click', () => {
      openEmailQuoteModal();
    });
  }
  if (DOM.closeEmailQuoteModalBtn) {
    DOM.closeEmailQuoteModalBtn.addEventListener('click', closeEmailQuoteModal);
  }
  if (DOM.cancelEmailQuoteBtn) {
    DOM.cancelEmailQuoteBtn.addEventListener('click', closeEmailQuoteModal);
  }
  if (DOM.submitEmailQuoteBtn) {
    DOM.submitEmailQuoteBtn.addEventListener('click', handleSendEmailQuoteSubmit);
  }
  if (DOM.emailQuoteForm) {
    DOM.emailQuoteForm.addEventListener('submit', handleSendEmailQuoteSubmit);
  }
  if (DOM.emailQuoteSelectAllBtn) {
    DOM.emailQuoteSelectAllBtn.addEventListener('click', () => {
      if (DOM.emailQuoteToRecipientsList) {
        const cbs = DOM.emailQuoteToRecipientsList.querySelectorAll('.email-quote-recipient-checkbox');
        cbs.forEach(cb => { cb.checked = true; });
      }
    });
  }
  if (DOM.emailQuoteDeselectAllBtn) {
    DOM.emailQuoteDeselectAllBtn.addEventListener('click', () => {
      if (DOM.emailQuoteToRecipientsList) {
        const cbs = DOM.emailQuoteToRecipientsList.querySelectorAll('.email-quote-recipient-checkbox');
        cbs.forEach(cb => { cb.checked = false; });
      }
    });
  }
  if (DOM.emailQuoteOpenPdfTabBtn) {
    DOM.emailQuoteOpenPdfTabBtn.addEventListener('click', () => {
      if (currentEmailQuoteBlobUrl) {
        window.open(currentEmailQuoteBlobUrl, '_blank');
      }
    });
  }

  if (DOM.orgExportPdfQuoteBtn) {
    DOM.orgExportPdfQuoteBtn.addEventListener('click', () => {
      const selected = state.selectedClients || [];
      if (selected.length === 0) {
        alert("Please select or add at least one client company for this quotation.");
        openClientsModal();
        return;
      }
      openSeparatePDFModal(false);
    });
  }
  if (DOM.orgExportPdfWorkingsBtn) {
    DOM.orgExportPdfWorkingsBtn.addEventListener('click', () => {
      const selected = state.selectedClients || [];
      if (selected.length === 0) {
        alert("Please select or add at least one client company for this quotation.");
        openClientsModal();
        return;
      }
      openSeparatePDFModal(true);
    });
  }

  if (DOM.orgExportExcelBtn) {
    DOM.orgExportExcelBtn.addEventListener('click', exportBOMToCSV);
  }
  if (DOM.orgClearQuotationBtn) {
    DOM.orgClearQuotationBtn.addEventListener('click', () => {
      showConfirmModal({
        title: 'Clear Quotation Sheet',
        message: 'Are you sure you want to clear this active quotation sheet? All line items will be reset.',
        confirmText: 'Clear Sheet',
        onConfirm: () => {
          (state.products || []).forEach(p => { p.inQuote = false; });
          saveUserDataToServer();
          renderOrgCalculatorView();
          showToast({
            title: 'Quotation Cleared',
            message: 'Active quotation products have been reset.',
            type: 'info'
          });
        }
      });
    });
  }
  const backToQuoteBtn = document.getElementById('workings-back-to-quote-btn');
  if (backToQuoteBtn) backToQuoteBtn.addEventListener('click', closeWorkingsAndReturnToQuote);

  const saveReturnBtn = document.getElementById('workings-save-return-btn');
  if (saveReturnBtn) saveReturnBtn.addEventListener('click', saveWorkingsAndReturnToQuote);

  const addCalcBtn = document.getElementById('add-calculations-to-product-btn');
  if (addCalcBtn) addCalcBtn.addEventListener('click', saveWorkingsAndReturnToQuote);

  // Join Org with Code Modal Listeners
  if (DOM.openJoinOrgBtn) DOM.openJoinOrgBtn.addEventListener('click', openJoinOrgModal);
  if (DOM.closeJoinOrgModalBtn) DOM.closeJoinOrgModalBtn.addEventListener('click', closeJoinOrgModal);
  if (DOM.cancelJoinOrgBtn) DOM.cancelJoinOrgBtn.addEventListener('click', closeJoinOrgModal);
  if (DOM.joinByCodeForm) DOM.joinByCodeForm.addEventListener('submit', handleJoinByCodeSubmit);

  // Org Profile & Access Code in Settings Listeners
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

  // Company Selector & Sub-Company Listeners
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
  if (DOM.btnShowAddSubCompany) {
    DOM.btnShowAddSubCompany.addEventListener('click', () => openSubCompanyForm(null));
  }
  if (DOM.subCompanyEditorForm) {
    DOM.subCompanyEditorForm.addEventListener('submit', handleSaveSubCompanySubmit);
  }
  if (DOM.addSubCompanyPhoneBtn) {
    DOM.addSubCompanyPhoneBtn.addEventListener('click', () => addSubCompanyPhoneRow(''));
  }
  if (DOM.addSubCompanyEmailBtn) {
    DOM.addSubCompanyEmailBtn.addEventListener('click', () => addSubCompanyEmailRow(''));
  }
  if (DOM.subCompanyFormCloseBtn) {
    DOM.subCompanyFormCloseBtn.addEventListener('click', closeSubCompanyForm);
  }
  if (DOM.subCompanyFormCancelBtn) {
    DOM.subCompanyFormCancelBtn.addEventListener('click', closeSubCompanyForm);
  }

  document.addEventListener('click', (e) => {
    if (DOM.companySelectorDropdown && !DOM.companySelectorDropdown.contains(e.target) && DOM.companySelectorTrigger && !DOM.companySelectorTrigger.contains(e.target)) {
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
  if (DOM.shapeSelectMobile) DOM.shapeSelectMobile.addEventListener('change', (e) => selectShape(e.target.value));
  if (DOM.materialSelect) DOM.materialSelect.addEventListener('change', handleMaterialChange);
  if (DOM.densityInput) DOM.densityInput.addEventListener('input', handleDensityInput);
  if (DOM.priceInput) DOM.priceInput.addEventListener('input', handlePriceInput);
  if (DOM.priceUnitSelect) DOM.priceUnitSelect.addEventListener('change', handlePriceUnitChange);
  if (DOM.quantityInput) DOM.quantityInput.addEventListener('input', handleQuantityInput);
  if (DOM.addToHistoryBtn) DOM.addToHistoryBtn.addEventListener('click', addItemToBOM);
  if (DOM.resetBtn) DOM.resetBtn.addEventListener('click', resetCalculatorFields);

  if (DOM.workingsShapeSelectMobile) DOM.workingsShapeSelectMobile.addEventListener('change', (e) => selectShape(e.target.value));
  if (DOM.workingsMaterialSelect) DOM.workingsMaterialSelect.addEventListener('change', handleMaterialChange);
  if (DOM.workingsDensityInput) DOM.workingsDensityInput.addEventListener('input', handleDensityInput);
  if (DOM.workingsPriceInput) DOM.workingsPriceInput.addEventListener('input', handlePriceInput);
  if (DOM.workingsPriceUnitSelect) DOM.workingsPriceUnitSelect.addEventListener('change', handlePriceUnitChange);
  if (DOM.workingsQuantityInput) DOM.workingsQuantityInput.addEventListener('input', handleQuantityInput);
  if (DOM.workingsAddToHistoryBtn) DOM.workingsAddToHistoryBtn.addEventListener('click', addItemToBOM);
  if (DOM.workingsResetBtn) DOM.workingsResetBtn.addEventListener('click', resetCalculatorFields);

  setupMaterialSearchEvents();
  updateBoughtOutDatalist();
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
  if (DOM.selectProcessRowBtn) DOM.selectProcessRowBtn.addEventListener('click', () => openProcessOperationsModal('select'));
  if (DOM.addProcessRowBtn) DOM.addProcessRowBtn.addEventListener('click', () => openProcessOperationsModal('add'));
  if (DOM.addMiscRowBtn) DOM.addMiscRowBtn.addEventListener('click', addMiscRow);

  // Process Operations & Rate Configuration Modal Listeners
  if (DOM.closeProcessOperationsModalBtn) DOM.closeProcessOperationsModalBtn.addEventListener('click', closeProcessOperationsModal);
  if (DOM.cancelProcessOperationsBtn) DOM.cancelProcessOperationsBtn.addEventListener('click', closeProcessOperationsModal);
  if (DOM.submitAddSelectedProcessesBtn) DOM.submitAddSelectedProcessesBtn.addEventListener('click', handleAddSelectedProcesses);
  if (DOM.modalAddProcessForm) DOM.modalAddProcessForm.addEventListener('submit', handleModalAddProcessProfileSubmit);
  if (DOM.modalSelectAllProcessesBtn) DOM.modalSelectAllProcessesBtn.addEventListener('click', () => toggleAllModalProcesses(true));
  if (DOM.modalDeselectAllProcessesBtn) DOM.modalDeselectAllProcessesBtn.addEventListener('click', () => toggleAllModalProcesses(false));
  if (DOM.processSearchInput) {
    DOM.processSearchInput.addEventListener('input', (e) => {
      modalProcessSearchQuery = e.target.value.trim().toLowerCase();
      if (DOM.clearProcessSearchBtn) {
        DOM.clearProcessSearchBtn.classList.toggle('hidden', !modalProcessSearchQuery);
      }
      renderModalProcessProfilesList();
    });
  }
  if (DOM.clearProcessSearchBtn) {
    DOM.clearProcessSearchBtn.addEventListener('click', () => {
      if (DOM.processSearchInput) DOM.processSearchInput.value = '';
      modalProcessSearchQuery = '';
      DOM.clearProcessSearchBtn.classList.add('hidden');
      renderModalProcessProfilesList();
    });
  }
  if (DOM.modalProcessesViewLimitSelect) {
    DOM.modalProcessesViewLimitSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'all') {
        modalProcessesVisibleLimit = Infinity;
      } else {
        modalProcessesVisibleLimit = parseInt(val, 10) || 10;
      }
      renderModalProcessProfilesList();
    });
  }
  if (DOM.processOperationsModal) {
    DOM.processOperationsModal.addEventListener('click', (e) => {
      if (e.target === DOM.processOperationsModal) closeProcessOperationsModal();
    });
  }

  // Client Directory modal triggers
  if (DOM.openClientsModalBtn) DOM.openClientsModalBtn.addEventListener('click', openClientsModal);
  if (DOM.closeClientsModalBtn) DOM.closeClientsModalBtn.addEventListener('click', closeClientsModal);
  if (DOM.addClientEmailRowBtn) {
    DOM.addClientEmailRowBtn.addEventListener('click', () => {
      addClientEmailRow('');
      if (DOM.clientEmailsContainer) {
        const inputs = DOM.clientEmailsContainer.querySelectorAll('.client-email-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
      }
    });
  }
  if (DOM.addClientPhoneRowBtn) {
    DOM.addClientPhoneRowBtn.addEventListener('click', () => {
      addClientPhoneRow('');
      if (DOM.clientPhonesContainer) {
        const inputs = DOM.clientPhonesContainer.querySelectorAll('.client-phone-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
      }
    });
  }
  if (DOM.addClientForm) DOM.addClientForm.addEventListener('submit', handleAddClientSubmit);
  if (DOM.cancelClientEditBtn) DOM.cancelClientEditBtn.addEventListener('click', handleCancelClientEdit);
  if (DOM.clientSearchInput) DOM.clientSearchInput.addEventListener('input', filterModalClients);
  if (DOM.clearClientSearchBtn) {
    DOM.clearClientSearchBtn.addEventListener('click', () => {
      if (DOM.clientSearchInput) DOM.clientSearchInput.value = '';
      if (DOM.clearClientSearchBtn) DOM.clearClientSearchBtn.classList.add('hidden');
      filterModalClients();
    });
  }
  if (DOM.modalClientsViewLimitSelect) {
    DOM.modalClientsViewLimitSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'all') {
        modalClientsVisibleLimit = Infinity;
      } else {
        modalClientsVisibleLimit = parseInt(val, 10);
        if (isNaN(modalClientsVisibleLimit)) modalClientsVisibleLimit = 10;
      }
      filterModalClients();
    });
  }
  if (DOM.modalSelectAllBtn) DOM.modalSelectAllBtn.addEventListener('click', handleModalSelectAllClients);
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



  // User Permissions Modal Listeners
  if (DOM.closeUserPermissionsModalBtn) DOM.closeUserPermissionsModalBtn.addEventListener('click', closeUserPermissionsModal);
  if (DOM.cancelUserPermissionsBtn) DOM.cancelUserPermissionsBtn.addEventListener('click', closeUserPermissionsModal);
  if (DOM.userPermissionsForm) DOM.userPermissionsForm.addEventListener('submit', handleSaveUserPermissions);
  if (DOM.modalPermAllowAllBtn) DOM.modalPermAllowAllBtn.addEventListener('click', () => toggleAllUserPermissions(true));
  if (DOM.modalPermRestrictAllBtn) DOM.modalPermRestrictAllBtn.addEventListener('click', () => toggleAllUserPermissions(false));
  if (DOM.userPermissionsModal) {
    DOM.userPermissionsModal.addEventListener('click', (e) => {
      if (e.target === DOM.userPermissionsModal) closeUserPermissionsModal();
    });
  }

  // Add User Modal Listeners
  if (DOM.orgOpenAddUserModalBtn) DOM.orgOpenAddUserModalBtn.addEventListener('click', openAddUserModal);
  if (DOM.closeOrgAddUserModalBtn) DOM.closeOrgAddUserModalBtn.addEventListener('click', closeAddUserModal);
  if (DOM.cancelOrgAddUserBtn) DOM.cancelOrgAddUserBtn.addEventListener('click', closeAddUserModal);
  if (DOM.orgAddUserForm) DOM.orgAddUserForm.addEventListener('submit', handleAddUserSubmit);
  if (DOM.orgAddUserModal) {
    DOM.orgAddUserModal.addEventListener('click', (e) => {
      if (e.target === DOM.orgAddUserModal) closeAddUserModal();
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

  // Product Search Bar Listeners
  if (DOM.orgProductsSearchInput) {
    DOM.orgProductsSearchInput.addEventListener('input', (e) => {
      orgProductsSearchQuery = e.target.value.trim().toLowerCase();
      if (DOM.orgProductsSearchClear) {
        if (orgProductsSearchQuery.length > 0) {
          DOM.orgProductsSearchClear.classList.remove('hidden');
        } else {
          DOM.orgProductsSearchClear.classList.add('hidden');
        }
      }
      renderFilteredOrgProducts();
    });
  }

  if (DOM.orgProductsSearchClear) {
    DOM.orgProductsSearchClear.addEventListener('click', () => {
      if (DOM.orgProductsSearchInput) DOM.orgProductsSearchInput.value = '';
      orgProductsSearchQuery = '';
      DOM.orgProductsSearchClear.classList.add('hidden');
      renderFilteredOrgProducts();
      if (DOM.orgProductsSearchInput) DOM.orgProductsSearchInput.focus();
    });
  }

  // Theme switcher
  if (DOM.themeToggle) DOM.themeToggle.addEventListener('click', toggleTheme);
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
      setAuthMode('login');
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
    if (DOM.authOverlay) DOM.authOverlay.classList.remove('hidden');
    if (DOM.orgWrapper) DOM.orgWrapper.classList.add('hidden');
    if (DOM.superadminWrapper) DOM.superadminWrapper.classList.add('hidden');
    startAuthSlideshow();
  } else {
    stopAuthSlideshow();
    if (DOM.authOverlay) DOM.authOverlay.classList.add('hidden');
    if (state.currentUserType === 'superadmin') {
      if (DOM.orgWrapper) DOM.orgWrapper.classList.add('hidden');
      if (DOM.superadminWrapper) DOM.superadminWrapper.classList.remove('hidden');
    } else {
      if (DOM.orgWrapper) DOM.orgWrapper.classList.remove('hidden');
      if (DOM.superadminWrapper) DOM.superadminWrapper.classList.add('hidden');
    }
  }
}

function toggleAuthMode(e) {
  if (e) e.preventDefault();
  DOM.authErrorMsg.classList.add('hidden');
  
  if (authMode === 'login') {
    setAuthMode('signup');
  } else {
    setAuthMode('login');
  }
}

async function fetchGstinDetails() {
  if (!DOM.authOrgGstin) return;
  const gstinVal = DOM.authOrgGstin.value.trim().toUpperCase();
  if (!gstinVal) {
    if (DOM.authGstinStatus) {
      DOM.authGstinStatus.className = "mt-2 p-2.5 rounded-xl text-xs border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400";
      DOM.authGstinStatus.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i><span>Please enter a 15-character GSTIN number.</span></div>`;
      DOM.authGstinStatus.classList.remove('hidden');
      lucide.createIcons();
    }
    return;
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(gstinVal)) {
    if (DOM.authGstinStatus) {
      DOM.authGstinStatus.className = "mt-2 p-2.5 rounded-xl text-xs border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300";
      DOM.authGstinStatus.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i><span>Invalid GSTIN format. Example: 33AAAAA0000A1Z5</span></div>`;
      DOM.authGstinStatus.classList.remove('hidden');
      lucide.createIcons();
    }
    return;
  }

  if (DOM.btnFetchGstinText) DOM.btnFetchGstinText.textContent = "Verifying...";
  if (DOM.btnFetchGstin) DOM.btnFetchGstin.disabled = true;

  try {
    const res = await fetch('/api/gst/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gstin: gstinVal })
    });

    const data = await res.json();
    if (res.ok && data.valid) {
      if (data.alreadyRegistered) {
        if (DOM.authGstinStatus) {
          DOM.authGstinStatus.className = "mt-2 p-3 rounded-xl text-xs border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200";
          DOM.authGstinStatus.innerHTML = `
            <div class="flex items-start gap-2.5">
              <i data-lucide="info" class="w-4 h-4 shrink-0 text-amber-500 mt-0.5"></i>
              <div>
                <span class="font-bold block">Company Already Registered</span>
                <span class="text-[11px] opacity-90">${escapeHTML(data.message)}</span>
                <button type="button" onclick="setAuthMode('login')" class="mt-2 inline-flex items-center gap-1 font-bold text-xs text-indigo-600 dark:text-indigo-400 underline cursor-pointer">
                  <span>Sign In as ${escapeHTML(data.orgName)}</span> &rarr;
                </button>
              </div>
            </div>
          `;
          DOM.authGstinStatus.classList.remove('hidden');
        }
      } else {
        // Auto populate Legal / Trade name if resolved
        if (data.legalName) {
          if (DOM.authOrg) DOM.authOrg.value = data.legalName;
        }

        if (DOM.authGstinStatus) {
          DOM.authGstinStatus.className = "mt-2 p-3 rounded-xl text-xs border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200";
          DOM.authGstinStatus.innerHTML = `
            <div class="flex items-start gap-2.5">
              <i data-lucide="check-circle" class="w-4 h-4 shrink-0 text-emerald-500 mt-0.5"></i>
              <div class="space-y-0.5">
                <span class="font-bold text-[13px] block text-emerald-900 dark:text-emerald-100">${escapeHTML(data.legalName || 'Verified GST Taxpayer')}</span>
                <div class="text-[11px] text-emerald-700 dark:text-emerald-300 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span><strong>State:</strong> ${escapeHTML(data.state)}</span>
                  <span><strong>Entity:</strong> ${escapeHTML(data.entityType || 'Business')}</span>
                  <span><strong>Status:</strong> ${escapeHTML(data.status)}</span>
                </div>
              </div>
            </div>
          `;
          DOM.authGstinStatus.classList.remove('hidden');
        }

        if (!data.legalName && DOM.authOrg) {
          DOM.authOrg.focus();
        }
      }
    } else {
      if (DOM.authGstinStatus) {
        DOM.authGstinStatus.className = "mt-2 p-2.5 rounded-xl text-xs border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400";
        DOM.authGstinStatus.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i><span>${escapeHTML(data.error || 'Could not verify GSTIN.')}</span></div>`;
        DOM.authGstinStatus.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('GST fetch failed:', err);
    if (DOM.authGstinStatus) {
      DOM.authGstinStatus.className = "mt-2 p-2.5 rounded-xl text-xs border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400";
      DOM.authGstinStatus.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i><span>Failed to connect to verification service.</span></div>`;
      DOM.authGstinStatus.classList.remove('hidden');
    }
  } finally {
    if (DOM.btnFetchGstinText) DOM.btnFetchGstinText.textContent = "Verify";
    if (DOM.btnFetchGstin) DOM.btnFetchGstin.disabled = false;
    lucide.createIcons();
  }
}

function setAuthMode(mode) {
  authMode = mode;
  DOM.authErrorMsg.classList.add('hidden');
  if (DOM.authGstinStatus) DOM.authGstinStatus.classList.add('hidden');
  
  if (DOM.googleSigninContainer) DOM.googleSigninContainer.classList.remove('hidden');
  renderGoogleButton();

  if (mode === 'login') {
    if (DOM.authOrgGstinContainer) DOM.authOrgGstinContainer.classList.add('hidden');
    if (DOM.authOrgGstin) DOM.authOrgGstin.removeAttribute('required');
    if (DOM.authOrgContainer) DOM.authOrgContainer.classList.add('hidden');
    if (DOM.authOrg) DOM.authOrg.removeAttribute('required');
    if (DOM.authOrgEmailContainer) DOM.authOrgEmailContainer.classList.add('hidden');
    
    if (DOM.authTitle) DOM.authTitle.textContent = "Sign In to Workspace";
    if (DOM.authSubtitle) DOM.authSubtitle.textContent = "Sign in securely to your engineering workspace.";
    if (DOM.authTogglePrompt) DOM.authTogglePrompt.textContent = "New organization?";
    if (DOM.authToggleBtn) DOM.authToggleBtn.textContent = "Register with GSTIN";
    if (DOM.googleBtnLabel) DOM.googleBtnLabel.textContent = "Continue with Google";
  } else {
    if (DOM.authOrgGstinContainer) DOM.authOrgGstinContainer.classList.remove('hidden');
    if (DOM.authOrgGstin) {
      DOM.authOrgGstin.setAttribute('required', 'true');
      setTimeout(() => DOM.authOrgGstin.focus(), 100);
    }
    if (DOM.authOrgContainer) DOM.authOrgContainer.classList.remove('hidden');
    if (DOM.authOrg) DOM.authOrg.setAttribute('required', 'true');
    if (DOM.authOrgEmailContainer) DOM.authOrgEmailContainer.classList.remove('hidden');

    if (DOM.authTitle) DOM.authTitle.textContent = "Register Your Organisation";
    if (DOM.authSubtitle) DOM.authSubtitle.textContent = "Enter your GSTIN number to verify your business name and sign up with Google.";
    if (DOM.authTogglePrompt) DOM.authTogglePrompt.textContent = "Already registered?";
    if (DOM.authToggleBtn) DOM.authToggleBtn.textContent = "Sign In";
    if (DOM.googleBtnLabel) DOM.googleBtnLabel.textContent = "Register Organisation with Google";
  }
  lucide.createIcons();
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  DOM.authErrorMsg.classList.add('hidden');
  
  const username = DOM.authUsername.value.trim();
  const password = DOM.authPassword.value;
  const gstin = DOM.authOrgGstin ? DOM.authOrgGstin.value.trim().toUpperCase() : '';
  const email = DOM.authOrgEmail ? DOM.authOrgEmail.value.trim().toLowerCase() : '';
  const orgName = DOM.authOrg.value.trim();
  const orgPassword = DOM.authOrgPassword.value;

  try {
    if (authMode === 'login') {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
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
      // Company Registration with GSTIN
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'org', orgName, orgPassword, gstin, email })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('metal-current-user', data.orgName);
        localStorage.setItem('metal-current-user-type', 'org');
        localStorage.setItem('metal-current-org-status', data.status || 'approved');
        authenticateOrg(data.orgName, data.status || 'approved');
      } else {
        DOM.authErrorMsg.querySelector('span').textContent = data.error || 'Organisation registration failed.';
        DOM.authErrorMsg.classList.remove('hidden');
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
  
  if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = orgName || username;
  if (DOM.orgHeaderRoleBadge) DOM.orgHeaderRoleBadge.textContent = `@${username}`;
  if (DOM.userDisplayUsername) DOM.userDisplayUsername.textContent = `@${username}`;
  
  if (DOM.upgradeToOrgHeaderBtn) DOM.upgradeToOrgHeaderBtn.classList.remove('hidden');
  if (DOM.returnToOrgAdminBtn) DOM.returnToOrgAdminBtn.classList.add('hidden');
  if (DOM.sidebarSettingsBtn) DOM.sidebarSettingsBtn.classList.add('hidden');
  if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.classList.add('hidden');

  if (DOM.userDisplayOrg) {
    DOM.userDisplayOrg.textContent = orgName || 'Personal Account (No Org)';
  }
  if (DOM.joinOrgBanner) {
    DOM.joinOrgBanner.classList.toggle('hidden', !!orgName);
  }

  showAuthOverlay(false);
  if (DOM.orgPendingView) DOM.orgPendingView.classList.add('hidden');
  if (DOM.orgSetupView) DOM.orgSetupView.classList.add('hidden');
  if (DOM.orgDashboardContent) DOM.orgDashboardContent.classList.remove('hidden');

  loadUserData(username).then(() => {
    resetCalculatorForm();
    const savedOrgTab = localStorage.getItem('metal-active-org-tab') || localStorage.getItem('metal-active-tab') || 'calculator';
    setOrgTab(savedOrgTab);
  }).catch(() => {
    resetCalculatorForm();
    const savedOrgTab = localStorage.getItem('metal-active-org-tab') || localStorage.getItem('metal-active-tab') || 'calculator';
    setOrgTab(savedOrgTab);
  });
  lucide.createIcons();
}

function authenticateOrg(orgName, status = 'approved') {
  state.currentUser = orgName;
  state.currentUserType = 'org';
  state.userOrg = orgName;
  try {
    localStorage.setItem('metal-current-org', orgName);
    localStorage.setItem('metal-current-org-status', status);
  } catch (e) {}
  
  if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = orgName;
  if (DOM.orgHeaderRoleBadge) DOM.orgHeaderRoleBadge.textContent = 'ADMIN CONSOLE';
  if (DOM.sidebarSettingsBtn) DOM.sidebarSettingsBtn.classList.remove('hidden');
  if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.classList.remove('hidden');
  if (DOM.upgradeToOrgHeaderBtn) DOM.upgradeToOrgHeaderBtn.classList.add('hidden');
  applyUserPermissions({ canAccessClients: true, canConfigureProcessRates: true, canViewProducts: true, canExportQuotes: true, canViewHistory: true });
  
  showAuthOverlay(false);

  // If temporary Google admin name, show the initial configuration form
  if (orgName && orgName.startsWith('temp-org-')) {
    if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = 'Setup Pending';
    if (DOM.orgSetupView) DOM.orgSetupView.classList.remove('hidden');
    if (DOM.orgPendingView) DOM.orgPendingView.classList.add('hidden');
    if (DOM.orgDashboardContent) DOM.orgDashboardContent.classList.add('hidden');
    
    if (DOM.orgSetupName) DOM.orgSetupName.value = '';
    if (DOM.orgSetupPassword) DOM.orgSetupPassword.value = '';
    if (DOM.orgSetupError) DOM.orgSetupError.classList.add('hidden');
  } else {
    // Open Organisation Dashboard and Workspace immediately
    if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = orgName;
    if (DOM.orgPendingView) DOM.orgPendingView.classList.add('hidden');
    if (DOM.orgSetupView) DOM.orgSetupView.classList.add('hidden');
    
    const savedOrgViewMode = localStorage.getItem('metal-org-view-mode') || 'console';
    if (DOM.orgDashboardContent) DOM.orgDashboardContent.classList.remove('hidden');
    fetchAndRenderOrgDashboardData();
    loadUserData(orgName).then(() => {
      renderOrgDashboard();
      if (savedOrgViewMode === 'workspace') {
        openOrgWorkspace(true);
      } else {
        const savedOrgTab = localStorage.getItem('metal-active-org-tab') || 'calculator';
        setOrgTab(savedOrgTab);
      }
    }).catch(() => {
      renderOrgDashboard();
      if (savedOrgViewMode === 'workspace') {
        openOrgWorkspace(true);
      } else {
        const savedOrgTab = localStorage.getItem('metal-active-org-tab') || 'calculator';
        setOrgTab(savedOrgTab);
      }
    });
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
function openOrgWorkspace(isRefresh = false) {
  if (state.currentUserType !== 'org') return;
  setOrgTab('calculator');
  lucide.createIcons();
}

function returnToOrgAdmin() {
  if (state.currentUserType !== 'org') return;
  if (DOM.orgWrapper) DOM.orgWrapper.classList.remove('hidden');
  renderOrgDashboard();
  const savedOrgTab = localStorage.getItem('metal-active-org-tab') || 'calculator';
  setOrgTab(savedOrgTab);
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
  if (DOM.trialStatusBanner) DOM.trialStatusBanner.classList.add('hidden');
  if (DOM.trialStatusBannerOrg) DOM.trialStatusBannerOrg.classList.add('hidden');
  if (DOM.trialExpiredModal) DOM.trialExpiredModal.classList.add('hidden');
}

async function checkLiveTrialStatus(type, id) {
  // Lifetime access - trial constraints permanently disabled
  updateTrialUI();
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


let currentOrgLogoData = '';

function renderOrgLogoPreview(logoData) {
  currentOrgLogoData = logoData || '';
  if (currentOrgLogoData && currentOrgLogoData.trim()) {
    if (DOM.orgSettingsLogoImg) {
      DOM.orgSettingsLogoImg.src = currentOrgLogoData;
      DOM.orgSettingsLogoImg.classList.remove('hidden');
    }
    if (DOM.orgSettingsLogoPlaceholder) {
      DOM.orgSettingsLogoPlaceholder.classList.add('hidden');
    }
    if (DOM.orgSettingsLogoRemoveBtn) {
      DOM.orgSettingsLogoRemoveBtn.classList.remove('hidden');
    }
  } else {
    if (DOM.orgSettingsLogoImg) {
      DOM.orgSettingsLogoImg.src = '';
      DOM.orgSettingsLogoImg.classList.add('hidden');
    }
    if (DOM.orgSettingsLogoPlaceholder) {
      DOM.orgSettingsLogoPlaceholder.classList.remove('hidden');
    }
    if (DOM.orgSettingsLogoRemoveBtn) {
      DOM.orgSettingsLogoRemoveBtn.classList.add('hidden');
    }
  }
}

function setupOrgLogoHandlers() {
  if (DOM.orgSettingsLogoUploadBtn && DOM.orgSettingsLogoInput) {
    DOM.orgSettingsLogoUploadBtn.addEventListener('click', () => {
      DOM.orgSettingsLogoInput.click();
    });
  }

  if (DOM.orgSettingsLogoInput) {
    DOM.orgSettingsLogoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast({
          title: 'Image Too Large',
          message: 'Please select a logo image under 2MB.',
          type: 'error'
        });
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64Data = loadEvt.target.result;
        renderOrgLogoPreview(base64Data);
      };
      reader.readAsDataURL(file);
    });
  }

  if (DOM.orgSettingsLogoRemoveBtn) {
    DOM.orgSettingsLogoRemoveBtn.addEventListener('click', () => {
      renderOrgLogoPreview('');
      if (DOM.orgSettingsLogoInput) DOM.orgSettingsLogoInput.value = '';
    });
  }
}

// Multi-Phone Handlers
function renderOrgPhoneInputs(phones = []) {
  if (!DOM.orgSettingsPhonesContainer) return;
  DOM.orgSettingsPhonesContainer.innerHTML = '';

  const phoneList = Array.isArray(phones) && phones.length > 0 ? phones : [''];
  phoneList.forEach((phoneVal) => {
    addOrgPhoneRow(phoneVal);
  });
  lucide.createIcons();
}

function addOrgPhoneRow(value = '') {
  if (!DOM.orgSettingsPhonesContainer) return;
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 org-phone-row';
  row.innerHTML = `
    <div class="relative flex-1">
      <input type="tel" value="${escapeHTML(value)}" placeholder="e.g. +91 98765 43210" class="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-4 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 font-medium text-xs shadow-sm transition-all org-phone-input">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <i data-lucide="phone" class="w-3.5 h-3.5"></i>
      </div>
    </div>
    <button type="button" class="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all remove-phone-btn cursor-pointer" title="Remove Phone">
      <i data-lucide="trash-2" class="w-4 h-4"></i>
    </button>
  `;

  const removeBtn = row.querySelector('.remove-phone-btn');
  removeBtn.addEventListener('click', () => {
    const allRows = DOM.orgSettingsPhonesContainer.querySelectorAll('.org-phone-row');
    if (allRows.length <= 1) {
      row.querySelector('.org-phone-input').value = '';
    } else {
      row.remove();
    }
  });

  DOM.orgSettingsPhonesContainer.appendChild(row);
  lucide.createIcons();
}

// Multi-Email Handlers
function renderOrgEmailInputs(emails = []) {
  if (!DOM.orgSettingsEmailsContainer) return;
  DOM.orgSettingsEmailsContainer.innerHTML = '';

  const emailList = Array.isArray(emails) && emails.length > 0 ? emails : [''];
  emailList.forEach((emailVal) => {
    addOrgEmailRow(emailVal);
  });
  lucide.createIcons();
}

function addOrgEmailRow(value = '') {
  if (!DOM.orgSettingsEmailsContainer) return;
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 org-email-row';
  row.innerHTML = `
    <div class="relative flex-1">
      <input type="email" value="${escapeHTML(value)}" placeholder="e.g. contact@arguscnc.com" class="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-4 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 font-medium text-xs shadow-sm transition-all org-email-input">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <i data-lucide="mail" class="w-3.5 h-3.5"></i>
      </div>
    </div>
    <button type="button" class="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all remove-email-btn cursor-pointer" title="Remove Email">
      <i data-lucide="trash-2" class="w-4 h-4"></i>
    </button>
  `;

  const removeBtn = row.querySelector('.remove-email-btn');
  removeBtn.addEventListener('click', () => {
    const allRows = DOM.orgSettingsEmailsContainer.querySelectorAll('.org-email-row');
    if (allRows.length <= 1) {
      row.querySelector('.org-email-input').value = '';
    } else {
      row.remove();
    }
  });

  DOM.orgSettingsEmailsContainer.appendChild(row);
  lucide.createIcons();
}

// Org Profile & Access Code in Settings Handlers
async function loadOrgSettingsTab() {
  if (DOM.orgSettingsName) DOM.orgSettingsName.value = state.currentUser || '';
  if (DOM.orgSettingsGstin) DOM.orgSettingsGstin.value = '';
  if (DOM.orgSettingsWebsite) DOM.orgSettingsWebsite.value = '';
  if (DOM.orgSettingsAddress) DOM.orgSettingsAddress.value = '';
  if (DOM.orgSettingsDeclaration) DOM.orgSettingsDeclaration.value = '';
  if (DOM.orgSettingsBankName) DOM.orgSettingsBankName.value = '';
  if (DOM.orgSettingsBankAccount) DOM.orgSettingsBankAccount.value = '';
  if (DOM.orgSettingsBankBranch) DOM.orgSettingsBankBranch.value = '';
  if (DOM.orgSettingsBankIfsc) DOM.orgSettingsBankIfsc.value = '';
  if (DOM.orgSettingsBankUpi) DOM.orgSettingsBankUpi.value = '';
  renderOrgLogoPreview('');
  renderOrgPhoneInputs(['']);
  renderOrgEmailInputs(['']);
  if (DOM.orgSettingsSuccess) DOM.orgSettingsSuccess.classList.add('hidden');
  if (DOM.orgSettingsError) DOM.orgSettingsError.classList.add('hidden');

  try {
    const res = await fetch(`/api/org/profile?orgName=${encodeURIComponent(state.currentUser)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      if (DOM.orgSettingsName) DOM.orgSettingsName.value = data.name || state.currentUser;
      if (DOM.orgSettingsGstin) DOM.orgSettingsGstin.value = data.gstin || '';
      if (DOM.orgSettingsWebsite) DOM.orgSettingsWebsite.value = data.website || '';
      if (DOM.orgSettingsAddress) DOM.orgSettingsAddress.value = data.address || '';
      if (DOM.orgSettingsDeclaration) DOM.orgSettingsDeclaration.value = data.declaration || '';
      
      // Bank Details
      if (data.bankDetails) {
        if (DOM.orgSettingsBankName) DOM.orgSettingsBankName.value = data.bankDetails.bankName || '';
        if (DOM.orgSettingsBankAccount) DOM.orgSettingsBankAccount.value = data.bankDetails.accountNumber || '';
        if (DOM.orgSettingsBankBranch) DOM.orgSettingsBankBranch.value = data.bankDetails.branch || '';
        if (DOM.orgSettingsBankIfsc) DOM.orgSettingsBankIfsc.value = data.bankDetails.ifscCode || '';
        if (DOM.orgSettingsBankUpi) DOM.orgSettingsBankUpi.value = data.bankDetails.upiId || '';
      }

      // Logo
      renderOrgLogoPreview(data.logo || '');

      // Multi-Phone
      const phones = Array.isArray(data.phones) && data.phones.length > 0 ? data.phones : [''];
      renderOrgPhoneInputs(phones);

      // Multi-Email
      const emails = Array.isArray(data.emails) && data.emails.length > 0 ? data.emails : (data.email ? [data.email] : ['']);
      renderOrgEmailInputs(emails);
    }
  } catch (err) {
    console.error('Failed to load org profile in settings:', err);
  }
  lucide.createIcons();
}

function generateRandomAccessCode() {
  const codeInput = DOM.orgSettingsAccessCode;
  if (!codeInput) return;
  const orgName = (DOM.orgSettingsName ? DOM.orgSettingsName.value : state.currentUser) || 'ORG';
  const prefix = orgName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() || 'ORG';
  const rand = Math.floor(1000 + Math.random() * 9000);
  codeInput.value = `${prefix}-${rand}`;
}

async function copyAccessCodeToClipboard() {
  const codeInput = DOM.orgSettingsAccessCode;
  if (!codeInput) return;
  const code = codeInput.value.trim();
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
    showToast({
      title: 'Copied',
      message: 'Access code copied to clipboard.',
      type: 'success'
    });
  } catch (err) {
    console.error('Clipboard copy failed:', err);
  }
}

function handleLogout() {
  localStorage.removeItem('metal-current-user');
  localStorage.removeItem('metal-current-user-type');
  localStorage.removeItem('metal-current-org');
  localStorage.removeItem('metal-current-org-status');
  localStorage.removeItem('metal-org-view-mode');
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
  // Prevent employees/standard users from accessing Org Settings or restricted modules
  if (state.currentUserType === 'user') {
    if (tab === 'settings') return redirectToFirstAvailableTab();
    if (tab === 'calculator' && state.permissions?.canAccessCalculator === false) return redirectToFirstAvailableTab();
    if (tab === 'quotation' && state.permissions?.canAccessQuotation === false) return redirectToFirstAvailableTab();
    if (tab === 'users' && state.permissions?.canAccessUsers === false) return redirectToFirstAvailableTab();
    if (tab === 'products' && state.permissions?.canAccessProducts === false) return redirectToFirstAvailableTab();
    if (tab === 'quotes' && state.permissions?.canAccessHistory === false) return redirectToFirstAvailableTab();
  }

  try {
    localStorage.setItem('metal-active-org-tab', tab);
  } catch (e) {}

  const sidebarActive = "sidebar-nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-brand-700 dark:text-cyan-300 bg-brand-50/80 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 active:scale-98 transition-all cursor-pointer text-left shadow-sm";
  const sidebarInactive = "sidebar-nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent active:scale-98 transition-all cursor-pointer text-left";

  if (DOM.sidebarMetalCalcBtn) DOM.sidebarMetalCalcBtn.className = tab === 'calculator' ? sidebarActive : sidebarInactive;
  if (DOM.sidebarQuotationBtn) DOM.sidebarQuotationBtn.className = tab === 'quotation' ? sidebarActive : sidebarInactive;
  if (DOM.sidebarDirectoryBtn) DOM.sidebarDirectoryBtn.className = tab === 'directory' ? sidebarActive : sidebarInactive;
  if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.className = tab === 'users' ? sidebarActive : sidebarInactive;
  if (DOM.sidebarProductsBtn) DOM.sidebarProductsBtn.className = tab === 'products' ? sidebarActive : sidebarInactive;
  if (DOM.sidebarQuotesBtn) DOM.sidebarQuotesBtn.className = tab === 'quotes' ? sidebarActive : sidebarInactive;
  if (DOM.sidebarSettingsBtn) DOM.sidebarSettingsBtn.className = tab === 'settings' ? sidebarActive : sidebarInactive;

  // Enforce visibility based on user role and permissions
  if (state.currentUserType === 'user') {
    if (DOM.sidebarMetalCalcBtn) DOM.sidebarMetalCalcBtn.classList.toggle('hidden', state.permissions?.canAccessCalculator === false);
    if (DOM.sidebarQuotationBtn) DOM.sidebarQuotationBtn.classList.toggle('hidden', state.permissions?.canAccessQuotation === false);
    if (DOM.sidebarDirectoryBtn) DOM.sidebarDirectoryBtn.classList.toggle('hidden', state.permissions?.canAccessQuotation === false);
    if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.classList.toggle('hidden', state.permissions?.canAccessUsers === false);
    if (DOM.sidebarProductsBtn) DOM.sidebarProductsBtn.classList.toggle('hidden', state.permissions?.canAccessProducts === false);
    if (DOM.sidebarQuotesBtn) DOM.sidebarQuotesBtn.classList.toggle('hidden', state.permissions?.canAccessHistory === false);
    if (DOM.sidebarSettingsBtn) DOM.sidebarSettingsBtn.classList.add('hidden');
  } else {
    if (DOM.sidebarMetalCalcBtn) DOM.sidebarMetalCalcBtn.classList.remove('hidden');
    if (DOM.sidebarQuotationBtn) DOM.sidebarQuotationBtn.classList.remove('hidden');
    if (DOM.sidebarDirectoryBtn) DOM.sidebarDirectoryBtn.classList.remove('hidden');
    if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.classList.remove('hidden');
    if (DOM.sidebarProductsBtn) DOM.sidebarProductsBtn.classList.remove('hidden');
    if (DOM.sidebarQuotesBtn) DOM.sidebarQuotesBtn.classList.remove('hidden');
    if (DOM.sidebarSettingsBtn) DOM.sidebarSettingsBtn.classList.remove('hidden');
  }

  const activeClass = "border-b-2 border-brand-500 text-brand-600 dark:text-brand-400 py-4 px-1 text-sm font-semibold flex items-center gap-2";
  const inactiveClass = "border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-4 px-1 text-sm font-semibold flex items-center gap-2";
  
  if (DOM.tabUsersBtn) DOM.tabUsersBtn.className = tab === 'users' ? activeClass : inactiveClass;
  if (DOM.tabOrgProductsBtn) DOM.tabOrgProductsBtn.className = tab === 'products' ? activeClass : inactiveClass;
  if (DOM.tabQuotesBtn) DOM.tabQuotesBtn.className = tab === 'quotes' ? activeClass : inactiveClass;
  if (DOM.tabDirectoryBtn) DOM.tabDirectoryBtn.className = tab === 'directory' ? activeClass : inactiveClass;
  if (DOM.tabSettingsBtn) {
    if (state.currentUserType === 'user') {
      DOM.tabSettingsBtn.classList.add('hidden');
    } else {
      DOM.tabSettingsBtn.classList.remove('hidden');
      DOM.tabSettingsBtn.className = tab === 'settings' ? activeClass : inactiveClass;
    }
  }
  
  if (DOM.tabCalculatorContent) DOM.tabCalculatorContent.classList.toggle('hidden', tab !== 'calculator');
  if (DOM.tabQuotationContent) DOM.tabQuotationContent.classList.toggle('hidden', tab !== 'quotation');
  if (DOM.tabDirectoryContent) DOM.tabDirectoryContent.classList.toggle('hidden', tab !== 'directory');
  if (DOM.tabUsersContent) DOM.tabUsersContent.classList.toggle('hidden', tab !== 'users');
  if (DOM.tabOrgProductsContent) DOM.tabOrgProductsContent.classList.toggle('hidden', tab !== 'products');
  if (DOM.tabQuotesContent) DOM.tabQuotesContent.classList.toggle('hidden', tab !== 'quotes');
  if (DOM.tabSettingsContent) DOM.tabSettingsContent.classList.toggle('hidden', tab !== 'settings' || state.currentUserType === 'user');

  if (tab === 'directory') {
    renderQuotationDirectory();
  }

  if (tab === 'calculator') {
    if (state.products && state.activeProductIndex !== undefined && state.products[state.activeProductIndex]) {
      const activeProd = state.products[state.activeProductIndex];
      const tagEl = document.getElementById('calculator-active-product-tag');
      if (tagEl) tagEl.textContent = `Product: ${activeProd.name || 'Standard Product'}`;
    }
    updateAllDisplays();
    calculate();
    recalculateGrandTotal();
    updateSVGDimensionLabels();
  } else if (tab === 'quotation') {
    if (DOM.orgCalcQuotationView) DOM.orgCalcQuotationView.classList.remove('hidden');
    if (DOM.orgCalcWorkingsView) DOM.orgCalcWorkingsView.classList.add('hidden');
    renderOrgCalculatorView();
  } else if (tab === 'quotes' || tab === 'users' || tab === 'products') {
    fetchAndRenderOrgDashboardData();
  } else if (tab === 'settings') {
    if (state.currentUserType !== 'user') {
      loadOrgSettingsTab();
    }
  }

  lucide.createIcons();
}

function toggleSidebar(forceState) {
  if (!DOM.orgSidebar) return;
  const shouldCollapse = typeof forceState === 'boolean'
    ? forceState
    : !DOM.orgSidebar.classList.contains('collapsed');

  DOM.orgSidebar.classList.toggle('collapsed', shouldCollapse);
  try {
    localStorage.setItem('metal-sidebar-collapsed', shouldCollapse ? 'true' : 'false');
  } catch (e) {}
}

function initSidebarState() {
  try {
    const isCollapsed = localStorage.getItem('metal-sidebar-collapsed') === 'true';
    if (isCollapsed && DOM.orgSidebar) {
      DOM.orgSidebar.classList.add('collapsed');
    }
  } catch (e) {}
}

const activeEditingClientIds = new Set();
let modalClientsVisibleLimit = Infinity;
let modalClientSearchQuery = '';
let modalProcessSearchQuery = '';
let modalProcessesVisibleLimit = 10;
let lastEnteredCgstRate = 9;
let lastEnteredSgstRate = 9;
let saveUserDataDebounceTimer = null;

function debouncedSaveUserDataToServer() {
  clearTimeout(saveUserDataDebounceTimer);
  saveUserDataDebounceTimer = setTimeout(() => {
    saveUserDataToServer();
  }, 350);
}

function handleOrgAddClient() {
  if (!state.clients) state.clients = [];
  if (!state.selectedClients) state.selectedClients = [];
  const newId = 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const newClient = {
    id: newId,
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  };
  state.clients.unshift(newClient);
  state.selectedClients.unshift(newClient);
  activeEditingClientIds.add(newId);
  saveUserDataToServer();
  renderOrgCalculatorView();
  setTimeout(() => {
    const tableBody = document.getElementById('org-clients-table-body');
    if (tableBody) {
      const inputs = tableBody.querySelectorAll('.org-client-name-input');
      if (inputs.length > 0) inputs[0].focus();
    }
  }, 60);
}

function handleOrgAddProduct() {
  if (!state.products) state.products = [];
  const newProd = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: '',
    hsnCode: '7326.90',
    quantity: 1,
    unit: 'PCS',
    unitTotal: 0,
    discount: 0,
    grandTotal: 0,
    inQuote: true,
    savedToCatalog: false,
    bom: [],
    processes: [],
    miscItems: [],
    profitPercentage: 0,
    createdAt: new Date().toISOString()
  };
  state.products.push(newProd);
  saveUserDataToServer();
  renderOrgCalculatorView();
  setTimeout(() => {
    const tableBody = document.getElementById('org-quotation-items-body');
    if (tableBody) {
      const inputs = tableBody.querySelectorAll('.org-prod-name-input');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }
  }, 60);
}

function renderOrgCalculatorView() {
  if (!DOM.tabCalculatorContent) return;

  // Ensure button listeners are active
  const addClientBtn = document.getElementById('org-add-client-btn');
  if (addClientBtn && !addClientBtn.dataset.wired) {
    addClientBtn.dataset.wired = "true";
    addClientBtn.addEventListener('click', () => openClientsModal('add'));
  }
  const openDirectoryBtn = document.getElementById('org-open-client-directory-btn');
  if (openDirectoryBtn && !openDirectoryBtn.dataset.wired) {
    openDirectoryBtn.dataset.wired = "true";
    openDirectoryBtn.addEventListener('click', () => openClientsModal('select'));
  }
  const addProductBtn = document.getElementById('org-add-product-btn');
  if (addProductBtn && !addProductBtn.dataset.wired) {
    addProductBtn.dataset.wired = "true";
    addProductBtn.addEventListener('click', handleOrgAddProduct);
  }

  // 1. Render Attached / Selected Clients for this Quotation (Locked readonly by default, explicit Edit & Save)
  if (DOM.orgClientsTableBody) {
    const selectedClients = state.selectedClients || [];

    // Ensure every client has a unique ID
    selectedClients.forEach((client, idx) => {
      if (!client.id) {
        client.id = 'cli_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 5);
      }
    });

    // Update Client Count Badge
    if (DOM.orgClientsCountBadge) {
      DOM.orgClientsCountBadge.textContent = `${selectedClients.length} Client${selectedClients.length === 1 ? '' : 's'} Selected`;
    }

    if (selectedClients.length === 0) {
      DOM.orgClientsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-8 px-4 text-center text-slate-400 dark:text-slate-500 text-xs">
            <div class="flex flex-col items-center justify-center gap-2">
              <i data-lucide="building" class="w-7 h-7 text-slate-300 dark:text-slate-600"></i>
              <span class="font-semibold text-slate-700 dark:text-slate-300">No client company attached to this quotation.</span>
              <span class="text-[11px] text-slate-400">Click <strong class="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer" id="inline-open-clients-modal-btn">Select Client</strong> to choose recipient companies or <strong class="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer" id="inline-add-client-btn">+ Add Client</strong> to register a new client.</span>
            </div>
          </td>
        </tr>
      `;
      const inlineOpenBtn = document.getElementById('inline-open-clients-modal-btn');
      if (inlineOpenBtn) inlineOpenBtn.addEventListener('click', () => openClientsModal('select'));
      const inlineAddBtn = document.getElementById('inline-add-client-btn');
      if (inlineAddBtn) inlineAddBtn.addEventListener('click', () => openClientsModal('add'));
    } else {
      DOM.orgClientsTableBody.innerHTML = selectedClients.map((client) => {
        const isEditing = activeEditingClientIds.has(client.id);

        const emailsList = Array.isArray(client.emails) && client.emails.length > 0 ? client.emails : (client.email ? [client.email] : []);
        const phonesList = Array.isArray(client.phones) && client.phones.length > 0 ? client.phones : (client.phone || client.phoneNumber ? [client.phone || client.phoneNumber] : []);

        const inputClasses = "w-full py-1.5 px-2.5 rounded-lg border border-brand-500 ring-1 ring-brand-500/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs shadow-xs focus:outline-none";
        const textInputClasses = "w-full py-1.5 px-2.5 rounded-lg border border-brand-500 ring-1 ring-brand-500/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs shadow-xs focus:outline-none";

        if (isEditing) {
          return `
            <tr class="bg-indigo-50/30 dark:bg-indigo-950/20" data-id="${client.id}">
              <td class="py-2.5 px-3 align-top">
                <input type="text" class="org-client-name-input ${inputClasses}" placeholder="e.g. Caterpillar Inc." value="${escapeHTML(client.name || client.companyName || '')}" data-id="${client.id}">
              </td>
              <td class="py-2.5 px-3 align-top">
                <input type="text" class="org-client-email-input ${textInputClasses} font-mono" placeholder="dept1<d1@cat.com>, billing@cat.com" value="${escapeHTML(emailsList.join(', '))}" data-id="${client.id}">
              </td>
              <td class="py-2.5 px-3 align-top">
                <input type="text" class="org-client-phone-input ${textInputClasses}" placeholder="+91 9876543210, +91 9123456780" value="${escapeHTML(phonesList.join(', '))}" data-id="${client.id}">
              </td>
              <td class="py-2.5 px-3 align-top">
                <input type="text" class="org-client-addr-input ${textInputClasses}" placeholder="Bangalore, Karnataka" value="${escapeHTML(client.address || '')}" data-id="${client.id}">
              </td>
              <td class="py-2.5 px-3 align-top">
                <input type="text" class="org-client-gstin-input ${textInputClasses} font-mono uppercase font-bold" placeholder="29AAAC1234A1" value="${escapeHTML(client.gstin || client.gstinNumber || '')}" data-id="${client.id}">
              </td>
              <td class="py-2.5 px-3 text-center align-top">
                <div class="flex items-center justify-center gap-1">
                  <button type="button" class="org-save-client-btn p-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer" data-id="${client.id}" title="Save Client Changes">
                    <i data-lucide="check" class="w-4 h-4"></i>
                  </button>
                  <button type="button" class="org-remove-client-btn p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer" data-id="${client.id}" title="Remove Client from Quote">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }

        const emailsHtml = emailsList.length > 0
          ? `<div class="flex flex-wrap gap-1">${emailsList.map(em => `<span class="inline-block px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono break-all font-semibold">${escapeHTML(em)}</span>`).join('')}</div>`
          : '<span class="text-slate-400 text-xs">—</span>';

        const phonesHtml = phonesList.length > 0
          ? `<div class="flex flex-wrap gap-1">${phonesList.map(ph => `<span class="inline-block px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] break-words font-medium">${escapeHTML(ph)}</span>`).join('')}</div>`
          : '<span class="text-slate-400 text-xs">—</span>';

        const addressHtml = client.address 
          ? `<div class="text-xs text-slate-700 dark:text-slate-300 break-words whitespace-normal leading-relaxed">${escapeHTML(client.address)}</div>` 
          : '<span class="text-slate-400 text-xs">—</span>';

        const gstinHtml = (client.gstin || client.gstinNumber) 
          ? `<div class="font-mono text-xs font-bold uppercase text-slate-900 dark:text-white">${escapeHTML(client.gstin || client.gstinNumber)}</div>` 
          : '<span class="text-slate-400 text-xs">—</span>';

        return `
          <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors" data-id="${client.id}">
            <td class="py-2.5 px-3 align-top">
              <div class="font-bold text-slate-900 dark:text-white break-words text-xs leading-snug">${escapeHTML(client.name || client.companyName || '')}</div>
            </td>
            <td class="py-2.5 px-3 align-top min-w-[160px]">
              ${emailsHtml}
            </td>
            <td class="py-2.5 px-3 align-top min-w-[130px]">
              ${phonesHtml}
            </td>
            <td class="py-2.5 px-3 align-top max-w-[220px]">
              ${addressHtml}
            </td>
            <td class="py-2.5 px-3 align-top">
              ${gstinHtml}
            </td>
            <td class="py-2.5 px-3 text-center align-top">
              <div class="flex items-center justify-center gap-1">
                <button type="button" class="org-edit-client-btn p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all cursor-pointer" data-id="${client.id}" title="Edit Client Details">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button type="button" class="org-remove-client-btn p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer" data-id="${client.id}" title="Remove Client from Quote">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Wire Edit action
      DOM.orgClientsTableBody.querySelectorAll('.org-edit-client-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          activeEditingClientIds.add(id);
          renderOrgCalculatorView();
          setTimeout(() => {
            const row = DOM.orgClientsTableBody.querySelector(`tr[data-id="${id}"]`);
            if (row) {
              const inp = row.querySelector('.org-client-name-input');
              if (inp) {
                inp.focus();
                inp.select();
              }
            }
          }, 50);
        });
      });

      // Wire Save action
      DOM.orgClientsTableBody.querySelectorAll('.org-save-client-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const row = DOM.orgClientsTableBody.querySelector(`tr[data-id="${id}"]`);
          if (row) {
            const name = (row.querySelector('.org-client-name-input')?.value || '').trim();
            const emailRaw = (row.querySelector('.org-client-email-input')?.value || '').trim();
            const emails = emailRaw.split(',').map(s => s.trim()).filter(Boolean);
            const phoneRaw = (row.querySelector('.org-client-phone-input')?.value || '').trim();
            const phones = phoneRaw.split(',').map(s => s.trim()).filter(Boolean);
            const address = (row.querySelector('.org-client-addr-input')?.value || '').trim();
            const gstin = (row.querySelector('.org-client-gstin-input')?.value || '').trim().toUpperCase();

            const cIdx = state.selectedClients.findIndex(c => c.id === id);
            if (cIdx >= 0) {
              state.selectedClients[cIdx].name = name;
              state.selectedClients[cIdx].email = emails[0] || '';
              state.selectedClients[cIdx].emails = emails;
              state.selectedClients[cIdx].phone = phones[0] || '';
              state.selectedClients[cIdx].phones = phones;
              state.selectedClients[cIdx].address = address;
              state.selectedClients[cIdx].gstin = gstin;
            }

            const dirIdx = (state.clients || []).findIndex(c => c.id === id);
            if (dirIdx >= 0) {
              state.clients[dirIdx].name = name;
              state.clients[dirIdx].email = emails[0] || '';
              state.clients[dirIdx].emails = emails;
              state.clients[dirIdx].phone = phones[0] || '';
              state.clients[dirIdx].phones = phones;
              state.clients[dirIdx].address = address;
              state.clients[dirIdx].gstin = gstin;
            }

            if (state.selectedClients.length > 0) {
              state.customerName = state.selectedClients[0].name;
              state.customerAddress = state.selectedClients[0].address || '';
              state.customerGSTIN = state.selectedClients[0].gstin || '';
            }

            activeEditingClientIds.delete(id);
            saveUserDataToServer();
            renderOrgCalculatorView();
          }
        });
      });

      // Wire Remove action
      DOM.orgClientsTableBody.querySelectorAll('.org-remove-client-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          if (state.selectedClients) {
            const idx = state.selectedClients.findIndex(x => x.id === id);
            if (idx !== -1) state.selectedClients.splice(idx, 1);
          }
          activeEditingClientIds.delete(id);
          saveUserDataToServer();
          renderOrgCalculatorView();
        });
      });
    }
  }

  // 2. Render Quotation Line Items (In-line editable)
  if (DOM.orgQuotationItemsBody) {
    const products = (state.products || []).filter(p => p.inQuote !== false);

    if (products.length === 0) {
      DOM.orgQuotationItemsBody.innerHTML = `
        <tr>
          <td colspan="9" class="py-10 px-4 text-center text-slate-400 dark:text-slate-500 text-xs">
            <div class="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
              <div class="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-cyan-400 flex items-center justify-center">
                <i data-lucide="package-plus" class="w-5 h-5"></i>
              </div>
              <p class="font-semibold text-slate-700 dark:text-slate-300">Quotation Sheet is Empty</p>
              <span class="text-[11px]">Click <strong>+ Add Product</strong> below to add and type product details directly in the table.</span>
            </div>
          </td>
        </tr>
      `;
    } else {
      DOM.orgQuotationItemsBody.innerHTML = products.map((prod, idx) => {
        const prodQty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
        prod.quantity = prodQty;

        const hasCustomWorkings = (prod.bom && prod.bom.length > 0) || (prod.processes && prod.processes.length > 0) || (prod.miscItems && prod.miscItems.length > 0);
        let unitPrice = 0;
        if (hasCustomWorkings) {
          const unitMaterials = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
          const unitProcesses = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
          const unitMisc = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
          const unitSubtotal = unitMaterials + unitProcesses + unitMisc;
          const unitProfit = unitSubtotal * ((prod.profitPercentage || 0) / 100);
          unitPrice = unitSubtotal + unitProfit;
          prod.unitTotal = unitPrice;
        } else {
          unitPrice = typeof prod.unitTotal === 'number' ? prod.unitTotal : 0;
        }

        const discountPercent = typeof prod.discount === 'number' ? prod.discount : 0;
        const lineTotalBeforeDisc = unitPrice * prodQty;
        const lineDiscountAmt = lineTotalBeforeDisc * (discountPercent / 100);
        const lineFinalAmount = Math.max(0, lineTotalBeforeDisc - lineDiscountAmt);
        prod.grandTotal = lineFinalAmount;

        const hsnCode = prod.hsnCode || '7326.90';

        return `
          <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors" data-row-index="${idx}">
            <td class="py-2.5 px-3 text-center font-mono font-bold text-slate-500 text-xs">${idx + 1}</td>
            <td class="py-2.5 px-3">
              <input type="text" class="org-hsn-input w-24 py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold focus:border-brand-500 focus:ring-brand-500 shadow-xs" value="${escapeHTML(hsnCode)}" data-index="${idx}" placeholder="7326.90">
            </td>
            <td class="py-2.5 px-4">
              <div class="flex items-center gap-2">
                <input type="text" class="org-prod-name-input flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:border-brand-500 focus:ring-brand-500 shadow-xs" placeholder="Type Product / Component Name..." value="${escapeHTML(prod.name || '')}" data-index="${idx}">
                <button type="button" class="org-view-workings-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0" data-index="${idx}" title="View / Configure Costing Workings">
                  <i data-lucide="calculator" class="w-3 h-3"></i> Workings
                </button>
              </div>
            </td>
            <td class="py-2.5 px-3 text-center">
              <input type="number" class="org-item-qty-input w-16 text-center py-1.5 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:border-brand-500 focus:ring-brand-500 shadow-xs" min="0" step="any" value="${prodQty}" data-index="${idx}">
            </td>
            <td class="py-2.5 px-3 text-center">
              <input type="text" class="org-item-unit-input w-14 text-center py-1.5 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase focus:border-brand-500 focus:ring-brand-500 shadow-xs" value="${escapeHTML(prod.unit || 'PCS')}" data-index="${idx}">
            </td>
            <td class="py-2.5 px-3 text-right">
              <input type="number" class="org-prod-price-input w-24 text-right py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:border-brand-500 focus:ring-brand-500 shadow-xs" min="0" step="any" value="${unitPrice}" data-index="${idx}">
            </td>
            <td class="py-2.5 px-3 text-right">
              <div class="inline-flex items-center gap-1">
                <input type="number" class="org-item-discount-input w-14 text-center py-1.5 px-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs focus:border-brand-500 focus:ring-brand-500 shadow-xs" min="0" max="100" step="any" value="${discountPercent}" data-index="${idx}">
                <span class="text-[10px] text-slate-400 font-bold">%</span>
              </div>
            </td>
            <td class="py-2.5 px-4 text-right font-mono font-black text-brand-700 dark:text-cyan-300 text-xs">
              <span class="org-line-amount-span" data-index="${idx}">₹ ${formatNumber(lineFinalAmount)}</span>
            </td>
            <td class="py-2.5 px-3 text-center">
              <div class="flex items-center justify-center gap-1">
                <button type="button" class="org-save-product-btn p-1.5 ${prod.savedToCatalog ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40'} rounded-lg transition-all cursor-pointer" data-index="${idx}" title="${prod.savedToCatalog ? 'Saved to Products Catalog' : 'Save Product to Catalog'}">
                  <i data-lucide="${prod.savedToCatalog ? 'check-circle-2' : 'bookmark'}" class="w-4 h-4"></i>
                </button>
                <button type="button" class="org-remove-product-btn p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer" data-index="${idx}" title="Remove Item">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Event Listeners for inline inputs
      DOM.orgQuotationItemsBody.querySelectorAll('.org-prod-name-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          if (state.products && state.products[idx]) {
            state.products[idx].name = e.target.value.trim();
            saveUserDataToServer();
          }
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-hsn-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          if (state.products && state.products[idx]) {
            state.products[idx].hsnCode = e.target.value.trim();
            saveUserDataToServer();
          }
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-item-unit-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          if (state.products && state.products[idx]) {
            state.products[idx].unit = (e.target.value.trim() || 'PCS').toUpperCase();
            saveUserDataToServer();
          }
        });
      });

      const handleRowInputChange = (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        const prod = (state.products || [])[idx];
        if (!prod) return;

        const row = DOM.orgQuotationItemsBody.querySelector(`tr[data-row-index="${idx}"]`);
        if (!row) return;

        const qtyInput = row.querySelector('.org-item-qty-input');
        const priceInput = row.querySelector('.org-prod-price-input');
        const discInput = row.querySelector('.org-item-discount-input');
        const amountSpan = row.querySelector('.org-line-amount-span');

        const qty = Math.max(0, parseFloat(qtyInput.value) || 0);
        const price = Math.max(0, parseFloat(priceInput.value) || 0);
        const disc = Math.max(0, Math.min(100, parseFloat(discInput.value) || 0));

        prod.quantity = qty;
        prod.unitTotal = price;
        prod.discount = disc;

        const lineTotalBeforeDisc = price * qty;
        const lineDiscountAmt = lineTotalBeforeDisc * (disc / 100);
        const lineFinalAmount = Math.max(0, lineTotalBeforeDisc - lineDiscountAmt);
        prod.grandTotal = lineFinalAmount;

        if (amountSpan) {
          amountSpan.textContent = `₹ ${formatNumber(lineFinalAmount)}`;
        }

        calculateOrgQuotationTotals();
        saveUserDataToServer();
      };

      DOM.orgQuotationItemsBody.querySelectorAll('.org-item-qty-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          updateRowCalculations(idx);
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-prod-price-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          updateRowCalculations(idx);
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-item-discount-input').forEach(input => {
        input.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          updateRowCalculations(idx);
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-view-workings-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          openProductWorkingsModal(idx);
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-save-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          const product = products[idx];
          if (product) {
            const isFirstSave = !product.savedToCatalog;
            product.savedToCatalog = true;
            saveUserDataToServer();
            showToast({
              title: isFirstSave ? 'Product Saved' : 'Catalog Updated',
              message: `"${product.name || 'Product'}" has been ${isFirstSave ? 'saved to your Products Catalog' : 'updated in your catalog'}.`,
              type: 'success',
              duration: 3500
            });
            renderOrgCalculatorView();
            renderProductsList();
          }
        });
      });

      DOM.orgQuotationItemsBody.querySelectorAll('.org-remove-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          const product = products[idx];
          if (product) {
            product.inQuote = false;
            saveUserDataToServer();
            renderOrgCalculatorView();
          }
        });
      });
    }
  }

  // 3. Compute Net Tax Totals
  calculateOrgQuotationTotals();
  lucide.createIcons();
}

function calculateOrgQuotationTotals() {
  const products = (state.products || []).filter(p => p.inQuote !== false);
  
  let subtotal = 0;
  products.forEach(prod => {
    subtotal += (prod.grandTotal || 0);
  });

  const cgstRate = DOM.orgCalcCgstRate ? (parseFloat(DOM.orgCalcCgstRate.value) || 0) : 0;
  const sgstRate = DOM.orgCalcSgstRate ? (parseFloat(DOM.orgCalcSgstRate.value) || 0) : 0;
  const igstRate = DOM.orgCalcIgstRate ? (parseFloat(DOM.orgCalcIgstRate.value) || 0) : 0;

  const cgstAmount = subtotal * (cgstRate / 100);
  const sgstAmount = subtotal * (sgstRate / 100);
  const igstAmount = subtotal * (igstRate / 100);
  const rawTotal = subtotal + cgstAmount + sgstAmount + igstAmount;
  const roundedTotal = Math.round(rawTotal);
  const roundOff = roundedTotal - rawTotal;

  if (DOM.orgCalcSubtotal) DOM.orgCalcSubtotal.textContent = `₹ ${formatNumber(subtotal)}`;
  if (DOM.orgCalcCgstAmount) DOM.orgCalcCgstAmount.textContent = `₹ ${formatNumber(cgstAmount)}`;
  if (DOM.orgCalcSgstAmount) DOM.orgCalcSgstAmount.textContent = `₹ ${formatNumber(sgstAmount)}`;
  if (DOM.orgCalcIgstAmount) DOM.orgCalcIgstAmount.textContent = `₹ ${formatNumber(igstAmount)}`;
  if (DOM.orgCalcRoundOff) {
    const sign = roundOff >= 0 ? '+₹ ' : '-₹ ';
    DOM.orgCalcRoundOff.textContent = `${sign}${formatNumber(Math.abs(roundOff))}`;
  }
  if (DOM.orgCalcGrandTotal) DOM.orgCalcGrandTotal.textContent = `₹ ${formatNumber(roundedTotal)}`;
}

let activeWorkingsProductIndex = -1;

function openProductWorkingsModal(target) {
  let prod = null;
  let realIdx = -1;

  if (typeof target === 'object' && target !== null) {
    prod = target;
    realIdx = (state.products || []).findIndex(p => p.id === prod.id);
  } else if (typeof target === 'string') {
    realIdx = (state.products || []).findIndex(p => p.id === target);
    if (realIdx !== -1) prod = state.products[realIdx];
  } else if (typeof target === 'number') {
    const quoteProducts = (state.products || []).filter(p => p.inQuote !== false);
    if (quoteProducts[target]) {
      prod = quoteProducts[target];
      realIdx = (state.products || []).findIndex(p => p.id === prod.id);
    } else if (state.products && state.products[target]) {
      prod = state.products[target];
      realIdx = target;
    }
  }

  if (!prod) return;

  // If product exists but wasn't in state.products array yet, ensure it is added
  if (realIdx === -1) {
    if (!state.products) state.products = [];
    state.products.push(prod);
    realIdx = state.products.length - 1;
  }

  activeWorkingsProductIndex = realIdx;
  state.activeProductIndex = realIdx;
  state.activeProductId = prod.id || '';

  // Update Title/tag in the workings view
  const nameEl = document.getElementById('workings-inline-product-name');
  if (nameEl) {
    nameEl.textContent = `Product Workings: ${prod.name || 'Standard Product'}`;
  }
  const tagEl = document.getElementById('calculator-active-product-tag');
  if (tagEl) {
    tagEl.textContent = `Product: ${prod.name || 'Standard Product'}`;
  }

  // Populate active workspace state from product
  state.bom = Array.isArray(prod.bom) ? JSON.parse(JSON.stringify(prod.bom)) : [];
  state.processes = Array.isArray(prod.processes) ? JSON.parse(JSON.stringify(prod.processes)) : [];
  state.miscItems = Array.isArray(prod.miscItems) ? JSON.parse(JSON.stringify(prod.miscItems)) : [];
  state.profitPercentage = prod.profitPercentage || 0;
  state.quantity = prod.quantity || 1;

  if (DOM.quantityInput) DOM.quantityInput.value = state.quantity;
  if (DOM.workingsQuantityInput) DOM.workingsQuantityInput.value = state.quantity;
  if (DOM.profitPercentageInput) DOM.profitPercentageInput.value = state.profitPercentage;
  if (DOM.profitRangeSlider) DOM.profitRangeSlider.value = state.profitPercentage;

  // Switch to Quotation tab and display Workings View
  setOrgTab('quotation');
  if (DOM.orgCalcQuotationView) DOM.orgCalcQuotationView.classList.add('hidden');
  if (DOM.orgCalcWorkingsView) DOM.orgCalcWorkingsView.classList.remove('hidden');

  populateMaterialPresetsDropdown();
  renderShapeGrid();
  selectShape(state.activeShape || 'round-bar');
  renderSeparateEditors();
  renderUnifiedTable();
  recalculateGrandTotal();
  lucide.createIcons();

  // Scroll to top of main content area
  const mainEl = document.querySelector('main');
  if (mainEl) mainEl.scrollTop = 0;
}

function closeWorkingsAndReturnToQuote() {
  if (DOM.orgCalcWorkingsView) DOM.orgCalcWorkingsView.classList.add('hidden');
  if (DOM.orgCalcQuotationView) DOM.orgCalcQuotationView.classList.remove('hidden');
  renderOrgCalculatorView();
}

function saveWorkingsAndReturnToQuote() {
  if (state.activeProductIndex !== undefined && state.activeProductIndex >= 0 && state.products && state.products[state.activeProductIndex]) {
    const prod = state.products[state.activeProductIndex];
    prod.bom = JSON.parse(JSON.stringify(state.bom || []));
    prod.processes = JSON.parse(JSON.stringify(state.processes || []));
    prod.miscItems = JSON.parse(JSON.stringify(state.miscItems || []));
    prod.profitPercentage = state.profitPercentage || 0;
    prod.inQuote = true; // Restore/keep product visible in quotation sheet

    // Calculate unit total & grand total
    const totalMaterials = (prod.bom || []).reduce((acc, item) => acc + (item.totalCost || 0), 0);
    const totalProcesses = (prod.processes || []).reduce((acc, item) => acc + (item.cost || 0), 0);
    const totalMisc = (prod.miscItems || []).reduce((acc, item) => acc + (item.cost || 0), 0);
    const subtotal = totalMaterials + totalProcesses + totalMisc;
    const profitAmount = subtotal * (prod.profitPercentage / 100);
    const unitPrice = subtotal + profitAmount;

    prod.unitTotal = unitPrice;
    const disc = prod.discount || 0;
    prod.grandTotal = (unitPrice * (prod.quantity || 1)) * (1 - disc / 100);

    saveUserDataToServer();
    showToast({
      title: 'Workings Saved',
      message: `Calculations updated for "${prod.name || 'Product'}".`,
      type: 'success'
    });
  }

  if (DOM.orgCalcWorkingsView) DOM.orgCalcWorkingsView.classList.add('hidden');
  if (DOM.orgCalcQuotationView) DOM.orgCalcQuotationView.classList.remove('hidden');
  renderOrgCalculatorView();
}

function closeProductWorkingsModalHandler() {
  closeWorkingsAndReturnToQuote();
}

async function fetchAndRenderOrgDashboardData() {
  const orgName = state.currentUserType === 'org' ? state.currentUser : (state.userOrg || localStorage.getItem('metal-current-org') || '');
  if (!orgName) return;

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
            <td colspan="5" class="py-8 text-center text-slate-400 italic">No users registered under this organisation yet.</td>
          </tr>
        `;
      } else {
        orgUsers.forEach(u => {
          const row = document.createElement('tr');
          row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800';

          const p = u.permissions || {
            canAccessCalculator: true,
            canAccessQuotation: true,
            canAccessUsers: true,
            canAccessProducts: true,
            canAccessHistory: true
          };

          const badges = [
            { label: 'Calculator', allowed: p.canAccessCalculator !== false, icon: 'calculator' },
            { label: 'Quotation', allowed: p.canAccessQuotation !== false, icon: 'file-text' },
            { label: 'Users', allowed: p.canAccessUsers !== false, icon: 'users' },
            { label: 'Products', allowed: p.canAccessProducts !== false, icon: 'package' },
            { label: 'History', allowed: p.canAccessHistory !== false, icon: 'receipt' }
          ].map(b => {
            if (b.allowed) {
              return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60" title="${b.label}: Allowed">
                <i data-lucide="${b.icon}" class="w-2.5 h-2.5"></i> ${b.label}
              </span>`;
            } else {
              return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 line-through opacity-70" title="${b.label}: Restricted">
                <i data-lucide="${b.icon}" class="w-2.5 h-2.5"></i> ${b.label}
              </span>`;
            }
          }).join(' ');

          row.innerHTML = `
            <td class="py-3 px-4">
              <div class="font-bold text-slate-900 dark:text-white">@${escapeHTML(u.username)}</div>
              ${u.email ? `<div class="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5"><i data-lucide="mail" class="w-3 h-3 text-indigo-400"></i> ${escapeHTML(u.email)}</div>` : `<div class="text-[10px] text-slate-400 italic">No email linked</div>`}
            </td>
            <td class="py-3 px-4">
              <div class="flex flex-wrap items-center gap-1 max-w-[280px]">
                ${badges}
              </div>
            </td>
            <td class="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">${u.quoteCount}</td>
            <td class="py-3 px-4 text-right font-mono font-semibold text-slate-850 dark:text-slate-200">${formatINR(u.totalQuotedValue)}</td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button type="button" class="btn-user-permissions inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-all active:scale-95 cursor-pointer" data-username="${escapeHTML(u.username)}" title="Configure Access Permissions">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                  <span>Permissions</span>
                </button>
                <button type="button" class="btn-user-delete p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer" data-username="${escapeHTML(u.username)}" title="Remove User from Organisation">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </td>
          `;

          row.querySelector('.btn-user-permissions').addEventListener('click', () => {
            openUserPermissionsModal(u);
          });

          row.querySelector('.btn-user-delete').addEventListener('click', () => {
            handleDeleteOrgUser(u.username);
          });

          DOM.orgUsersTableBody.appendChild(row);
        });
      }
    }

    // 2. Render Organisation Products Card Grid
    orgProductsCache = orgProducts || [];
    renderFilteredOrgProducts();
    
    // 3. Render Transactions Table (Quotes History)
    if (DOM.orgQuotesTableBody) {
      DOM.orgQuotesTableBody.innerHTML = '';
      if (transactions.length === 0) {
        DOM.orgQuotesTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="py-6 text-center text-slate-400 italic">No transactions or quotes generated yet.</td>
          </tr>
        `;
      } else {
        const sortedTxns = [...transactions];
        sortedTxns.forEach(tx => {
          const row = document.createElement('tr');
          row.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800';
          
          row.innerHTML = `
            <td class="py-3 px-4 text-slate-600 dark:text-slate-400 font-medium font-mono">${tx.date}</td>
            <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">@${escapeHTML(tx.username || '')}</td>
            <td class="py-3 px-4 text-slate-700 dark:text-slate-350">${escapeHTML(tx.customerName || 'N/A')}</td>
            <td class="py-3 px-4 text-right font-mono font-semibold text-slate-850 dark:text-slate-200">${formatINR(tx.grandTotal || 0)}</td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button class="btn-pdf-view p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-lg transition-all cursor-pointer" title="View PDF Report" data-tx-id="${tx.id}">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
                <button class="btn-pdf-download p-1.5 text-brand-600 hover:bg-brand-50 dark:text-cyan-400 dark:hover:bg-cyan-950/30 rounded-lg transition-all cursor-pointer" title="Download PDF Report" data-tx-id="${tx.id}">
                  <i data-lucide="download" class="w-4 h-4"></i>
                </button>
                <button class="btn-pdf-edit p-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 rounded-lg transition-all cursor-pointer" title="Edit Quotation" data-tx-id="${tx.id}">
                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="btn-pdf-delete p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer" title="Delete Transaction" data-tx-id="${tx.id}">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </td>
          `;
          
          row.querySelector(`.btn-pdf-view[data-tx-id="${tx.id}"]`).addEventListener('click', () => {
            exportQuoteToPDF(tx, true);
          });
          
          row.querySelector(`.btn-pdf-download[data-tx-id="${tx.id}"]`).addEventListener('click', () => {
            exportQuoteToPDF(tx);
          });

          row.querySelector(`.btn-pdf-edit[data-tx-id="${tx.id}"]`).addEventListener('click', () => {
            handleEditQuotation(tx);
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

let orgProductsCache = [];
let orgProductsSearchQuery = '';

window.clearOrgProductSearch = function() {
  if (DOM.orgProductsSearchInput) DOM.orgProductsSearchInput.value = '';
  orgProductsSearchQuery = '';
  if (DOM.orgProductsSearchClear) DOM.orgProductsSearchClear.classList.add('hidden');
  renderFilteredOrgProducts();
};

function renderFilteredOrgProducts() {
  if (!DOM.orgProductsGrid) return;
  DOM.orgProductsGrid.innerHTML = '';

  const totalCount = orgProductsCache.length;
  const filtered = orgProductsSearchQuery
    ? orgProductsCache.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(orgProductsSearchQuery);
        const creatorMatch = (p.createdBy || '').toLowerCase().includes(orgProductsSearchQuery);
        const bomMatch = (p.bom || []).some(b => (b.material || '').toLowerCase().includes(orgProductsSearchQuery) || (b.shapeName || '').toLowerCase().includes(orgProductsSearchQuery));
        return nameMatch || creatorMatch || bomMatch;
      })
    : orgProductsCache;

  if (DOM.orgProductsCountBadge) {
    if (orgProductsSearchQuery && filtered.length !== totalCount) {
      DOM.orgProductsCountBadge.textContent = `${filtered.length} of ${totalCount} Product${totalCount === 1 ? '' : 's'}`;
    } else {
      DOM.orgProductsCountBadge.textContent = `${totalCount} Product${totalCount === 1 ? '' : 's'}`;
    }
  }

  if (totalCount === 0) {
    DOM.orgProductsGrid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center mb-3">
          <i data-lucide="package" class="w-6 h-6"></i>
        </div>
        <p class="font-bold text-slate-700 dark:text-slate-200 text-sm">No Organisation Products Found</p>
        <p class="text-xs text-slate-400">When employees or admins create products, they will automatically appear here as interactive cards.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  if (filtered.length === 0) {
    DOM.orgProductsGrid.innerHTML = `
      <div class="col-span-full py-10 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2.5">
        <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center">
          <i data-lucide="search-x" class="w-5 h-5"></i>
        </div>
        <p class="font-bold text-slate-700 dark:text-slate-200 text-xs">No products match "${escapeHTML(orgProductsSearchQuery)}"</p>
        <button type="button" onclick="clearOrgProductSearch()" class="text-xs font-bold text-brand-600 dark:text-cyan-400 hover:underline cursor-pointer">Clear Search</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  filtered.forEach((prod) => {
    const card = document.createElement('div');
    card.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-cyan-800/80 transition-all flex flex-col justify-between space-y-3.5 group relative";
    
    const rawCount = (prod.bom || []).length;
    const procCount = (prod.processes || []).length;
    const miscCount = (prod.miscItems || []).length;
    const compCount = rawCount + procCount + miscCount;

    const metalCost = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
    const processCost = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const miscCost = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
    const subtotal = metalCost + processCost + miscCost;
    const profitAmount = subtotal * ((prod.profitPercentage || 0) / 100);
    const qty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
    const unitPrice = subtotal + profitAmount;
    const gTotal = unitPrice * qty;
    const tWeight = (prod.bom || []).reduce((acc, x) => acc + (x.totalWeight || 0), 0) * qty;

    card.innerHTML = `
      <div class="space-y-2.5">
        <!-- Card Header: Title & Creator Badge -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-950/60 dark:to-cyan-950/40 text-brand-600 dark:text-cyan-400 border border-brand-200/60 dark:border-brand-800/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <i data-lucide="package" class="w-4.5 h-4.5"></i>
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-black text-slate-900 dark:text-white truncate" title="${escapeHTML(prod.name)}">${escapeHTML(prod.name)}</h4>
              <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                ${escapeHTML(prod.createdBy || '@admin')}
              </span>
            </div>
          </div>
          <button type="button" class="btn-card-delete text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer" title="Delete Product">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Metrics Grid -->
        <div class="bg-slate-50/70 dark:bg-slate-950/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Weight</span>
            <span class="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">${tWeight > 0 ? tWeight.toFixed(2) + ' kg' : '0.00 kg'}</span>
          </div>
          <div class="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400">Total Price</span>
            <span class="text-xs font-mono font-black text-brand-600 dark:text-cyan-400">${formatINR(gTotal)}</span>
          </div>
        </div>
      </div>

      <!-- Action Triggers -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button type="button" class="btn-card-workings flex-1 py-1.5 px-3 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-cyan-300 border border-brand-200 dark:border-brand-800/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95">
          <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
          <span>Workings</span>
        </button>
      </div>
    `;

    card.querySelector('.btn-card-workings').addEventListener('click', () => {
      openProductWorkingsModal(prod);
    });

    card.querySelector('.btn-card-delete').addEventListener('click', () => {
      showConfirmModal({
        title: 'Delete Product',
        message: `Are you sure you want to remove product "${prod.name}" from the organisation catalog?`,
        confirmText: 'Delete Product',
        onConfirm: () => {
          deleteOrgProduct(prod.id);
        }
      });
    });

    DOM.orgProductsGrid.appendChild(card);
  });

  lucide.createIcons();
}

async function renderOrgDashboard() {
  const savedOrgTab = localStorage.getItem('metal-active-org-tab') || 'calculator';
  setOrgTab(savedOrgTab);
  await fetchAndRenderOrgDashboardData();
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
      await fetchAndRenderOrgDashboardData();
      lucide.createIcons();
    }
  } catch (err) {
    console.error('Delete transaction failed:', err);
  }
}

// --- User Permissions Controller ---
function openUserPermissionsModal(userObj) {
  if (!DOM.userPermissionsModal) return;
  const username = typeof userObj === 'string' ? userObj : userObj.username;
  const p = (userObj && userObj.permissions) ? userObj.permissions : {
    canAccessCalculator: true,
    canAccessQuotation: true,
    canAccessUsers: true,
    canAccessProducts: true,
    canAccessHistory: true
  };

  if (DOM.modalPermTargetUser) DOM.modalPermTargetUser.value = username;
  if (DOM.modalPermUsername) DOM.modalPermUsername.textContent = `@${username}`;

  if (DOM.permCanAccessCalc) DOM.permCanAccessCalc.checked = p.canAccessCalculator !== false;
  if (DOM.permCanAccessQuote) DOM.permCanAccessQuote.checked = p.canAccessQuotation !== false;
  if (DOM.permCanAccessUsers) DOM.permCanAccessUsers.checked = p.canAccessUsers !== false;
  if (DOM.permCanAccessProducts) DOM.permCanAccessProducts.checked = p.canAccessProducts !== false;
  if (DOM.permCanAccessHistory) DOM.permCanAccessHistory.checked = p.canAccessHistory !== false;

  DOM.userPermissionsModal.classList.remove('hidden');
  lucide.createIcons();
}

function closeUserPermissionsModal() {
  if (!DOM.userPermissionsModal) return;
  DOM.userPermissionsModal.classList.add('hidden');
}

function toggleAllUserPermissions(allowAll) {
  if (DOM.permCanAccessCalc) DOM.permCanAccessCalc.checked = allowAll;
  if (DOM.permCanAccessQuote) DOM.permCanAccessQuote.checked = allowAll;
  if (DOM.permCanAccessUsers) DOM.permCanAccessUsers.checked = allowAll;
  if (DOM.permCanAccessProducts) DOM.permCanAccessProducts.checked = allowAll;
  if (DOM.permCanAccessHistory) DOM.permCanAccessHistory.checked = allowAll;
}

async function handleSaveUserPermissions(e) {
  e.preventDefault();
  const username = DOM.modalPermTargetUser.value;
  const orgName = localStorage.getItem('metal-current-org') || state.currentUser;

  if (!username || !orgName) return;

  const permissions = {
    canAccessCalculator: DOM.permCanAccessCalc ? DOM.permCanAccessCalc.checked : true,
    canAccessQuotation: DOM.permCanAccessQuote ? DOM.permCanAccessQuote.checked : true,
    canAccessUsers: DOM.permCanAccessUsers ? DOM.permCanAccessUsers.checked : true,
    canAccessProducts: DOM.permCanAccessProducts ? DOM.permCanAccessProducts.checked : true,
    canAccessHistory: DOM.permCanAccessHistory ? DOM.permCanAccessHistory.checked : true
  };

  try {
    const response = await fetch('/api/org/users/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName, username, permissions })
    });

    if (response.ok) {
      closeUserPermissionsModal();
      showToast({
        title: 'Permissions Saved',
        message: `Updated access permissions for @${username}.`,
        type: 'success'
      });
      renderOrgDashboard();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to update permissions.');
    }
  } catch (err) {
    console.error('Save permissions error:', err);
    alert('Server connection failed.');
  }
}

// --- Add User to Organisation Controller ---
function openAddUserModal() {
  if (!DOM.orgAddUserModal) return;
  if (DOM.orgAddUserForm) DOM.orgAddUserForm.reset();
  if (DOM.addUserPermCalc) DOM.addUserPermCalc.checked = true;
  if (DOM.addUserPermQuote) DOM.addUserPermQuote.checked = true;
  if (DOM.addUserPermUsers) DOM.addUserPermUsers.checked = true;
  if (DOM.addUserPermProducts) DOM.addUserPermProducts.checked = true;
  if (DOM.addUserPermHistory) DOM.addUserPermHistory.checked = true;
  
  DOM.orgAddUserModal.classList.remove('hidden');
  if (DOM.orgAddUserName) DOM.orgAddUserName.focus();
  lucide.createIcons();
}

function closeAddUserModal() {
  if (!DOM.orgAddUserModal) return;
  DOM.orgAddUserModal.classList.add('hidden');
}

async function handleAddUserSubmit(e) {
  e.preventDefault();
  const orgName = localStorage.getItem('metal-current-org') || state.currentUser;
  const name = (DOM.orgAddUserName ? DOM.orgAddUserName.value : '').trim();
  const email = (DOM.orgAddUserEmail ? DOM.orgAddUserEmail.value : '').trim().toLowerCase();
  const password = (DOM.orgAddUserPassword ? DOM.orgAddUserPassword.value : '').trim();

  if (!orgName || !name || !email) {
    alert('Organisation, Name, and Email are required.');
    return;
  }

  const permissions = {
    canAccessCalculator: DOM.addUserPermCalc ? DOM.addUserPermCalc.checked : true,
    canAccessQuotation: DOM.addUserPermQuote ? DOM.addUserPermQuote.checked : true,
    canAccessUsers: DOM.addUserPermUsers ? DOM.addUserPermUsers.checked : true,
    canAccessProducts: DOM.addUserPermProducts ? DOM.addUserPermProducts.checked : true,
    canAccessHistory: DOM.addUserPermHistory ? DOM.addUserPermHistory.checked : true
  };

  try {
    const response = await fetch('/api/org/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName,
        username: name,
        email,
        password,
        permissions
      })
    });

    const data = await response.json();
    if (response.ok) {
      closeAddUserModal();
      showToast({
        title: 'User Added Successfully',
        message: data.message || `User ${email} is now a team member of ${orgName}.`,
        type: 'success'
      });
      renderOrgDashboard();
    } else {
      alert(data.error || 'Failed to add user to organisation.');
    }
  } catch (err) {
    console.error('Add user error:', err);
    alert('Server connection failed while adding user.');
  }
}

async function handleDeleteOrgUser(username) {
  const orgName = localStorage.getItem('metal-current-org') || state.currentUser;
  if (!username || !orgName) return;

  if (!confirm(`Are you sure you want to remove user @${username} from ${orgName}?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/org/users/${encodeURIComponent(username)}?orgName=${encodeURIComponent(orgName)}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (response.ok) {
      showToast({
        title: 'User Removed',
        message: data.message || `User @${username} was removed from the organisation.`,
        type: 'info'
      });
      renderOrgDashboard();
    } else {
      alert(data.error || 'Failed to remove user.');
    }
  } catch (err) {
    console.error('Delete user error:', err);
    alert('Server connection failed.');
  }
}

function redirectToFirstAvailableTab() {
  const p = state.permissions || {};
  if (p.canAccessCalculator !== false) {
    setOrgTab('calculator');
  } else if (p.canAccessQuotation !== false) {
    setOrgTab('quotation');
  } else if (p.canAccessUsers !== false) {
    setOrgTab('users');
  } else if (p.canAccessProducts !== false) {
    setOrgTab('products');
  } else if (p.canAccessHistory !== false) {
    setOrgTab('quotes');
  }
}

function applyUserPermissions(permissions) {
  if (!permissions) return;
  state.permissions = { ...state.permissions, ...permissions };

  if (state.currentUserType === 'user') {
    // 1. Metal Calculator Access
    if (DOM.sidebarMetalCalcBtn) {
      DOM.sidebarMetalCalcBtn.classList.toggle('hidden', state.permissions.canAccessCalculator === false);
    }

    // 2. Quotation Access
    if (DOM.sidebarQuotationBtn) {
      DOM.sidebarQuotationBtn.classList.toggle('hidden', state.permissions.canAccessQuotation === false);
    }

    // 3. Users Directory Access
    if (DOM.sidebarUsersBtn) {
      DOM.sidebarUsersBtn.classList.toggle('hidden', state.permissions.canAccessUsers === false);
    }

    // 4. Products Tab Access
    if (DOM.sidebarProductsBtn) {
      DOM.sidebarProductsBtn.classList.toggle('hidden', state.permissions.canAccessProducts === false);
    }

    // 5. Quotation History Access
    if (DOM.sidebarQuotesBtn) {
      DOM.sidebarQuotesBtn.classList.toggle('hidden', state.permissions.canAccessHistory === false);
    }

    // Redirect if current tab is restricted
    const activeTab = state.currentTab || localStorage.getItem('metal-active-org-tab') || 'calculator';
    if (activeTab === 'calculator' && state.permissions.canAccessCalculator === false) {
      redirectToFirstAvailableTab();
    } else if (activeTab === 'quotation' && state.permissions.canAccessQuotation === false) {
      redirectToFirstAvailableTab();
    } else if (activeTab === 'users' && state.permissions.canAccessUsers === false) {
      redirectToFirstAvailableTab();
    } else if (activeTab === 'products' && state.permissions.canAccessProducts === false) {
      redirectToFirstAvailableTab();
    } else if (activeTab === 'quotes' && state.permissions.canAccessHistory === false) {
      redirectToFirstAvailableTab();
    }
  } else {
    // Org Admin has all tabs visible
    if (DOM.sidebarMetalCalcBtn) DOM.sidebarMetalCalcBtn.classList.remove('hidden');
    if (DOM.sidebarQuotationBtn) DOM.sidebarQuotationBtn.classList.remove('hidden');
    if (DOM.sidebarUsersBtn) DOM.sidebarUsersBtn.classList.remove('hidden');
    if (DOM.sidebarProductsBtn) DOM.sidebarProductsBtn.classList.remove('hidden');
    if (DOM.sidebarQuotesBtn) DOM.sidebarQuotesBtn.classList.remove('hidden');
  }
}

// --- Data Isolation Loader & Sync ---
async function loadUserData(username) {
  if (!username) return;
  const cleanUsername = username.trim().toLowerCase();

  // Instant local cache hydration before network completes
  try {
    const cachedClientsJson = localStorage.getItem(`metal-cached-clients-${cleanUsername}`);
    if (cachedClientsJson) {
      const parsed = JSON.parse(cachedClientsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.clients = parsed;
        if (state.currentUserType === 'org') {
          renderOrgCalculatorView();
        }
      }
    }
  } catch (e) {}

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
    state.products.forEach(p => {
      if (p.savedToCatalog === undefined) {
        p.savedToCatalog = true;
      }
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
    state.subCompanyProfiles = data.subCompanyProfiles || [];
    state.savedQuotationsDirectory = Array.isArray(data.savedQuotationsDirectory) ? data.savedQuotationsDirectory : [];
    state.selectedCompany = data.selectedCompany || '';
    
    // Update company selector display in navbar & settings tab
    const defaultOrg = localStorage.getItem('metal-current-org') || 'Organisation';
    if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = state.selectedCompany || defaultOrg;
    if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = state.selectedCompany || defaultOrg;
    renderCompanyDropdown();
    renderSubCompaniesListContainer();

    // Load clients directory & selection
    if (Array.isArray(data.clients) && data.clients.length > 0) {
      state.clients = data.clients;
      try {
        localStorage.setItem(`metal-cached-clients-${cleanUsername}`, JSON.stringify(state.clients));
      } catch (e) {}
    } else if (!state.clients || state.clients.length === 0) {
      state.clients = data.clients || [];
    }

    state.selectedClients = data.selectedClients || [];
    updateAppliedClientsDisplay();

    // Load process rates registry
    state.processRates = data.processRates || [];
    renderProcessRatesRegistry();

    // Apply Permissions
    if (data.permissions) {
      applyUserPermissions(data.permissions);
    } else {
      applyUserPermissions({
        canAccessClients: true,
        canConfigureProcessRates: true,
        canViewProducts: true,
        canExportQuotes: true,
        canViewHistory: true
      });
    }

    if (data.trial) {
      updateTrialUI(data.trial);
    }

    updateActiveProductHeader();
    updateAllDisplays();
    renderProductsList();
    renderQuotationTabView();
    renderQuotationDirectory();
    if (state.currentUserType === 'org') {
      renderOrgCalculatorView();
    }
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
  
  // Immediately persist clients to local cache
  try {
    if (Array.isArray(state.clients)) {
      localStorage.setItem(`metal-cached-clients-${state.currentUser.toLowerCase()}`, JSON.stringify(state.clients));
    }
  } catch (e) {}

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
        subCompanyProfiles: state.subCompanyProfiles,
        savedQuotationsDirectory: state.savedQuotationsDirectory,
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

  const defaultOrg = localStorage.getItem('metal-current-org') || 'Organisation';
  if (!state.companies) state.companies = [];
  if (!state.subCompanyProfiles) state.subCompanyProfiles = [];
  
  const seenNames = new Set();
  seenNames.add(defaultOrg.trim().toLowerCase());

  const allCompanies = [
    { name: defaultOrg, isDefault: true, id: null }
  ];

  state.subCompanyProfiles.forEach(p => {
    const key = (p.name || '').trim().toLowerCase();
    if (key && !seenNames.has(key)) {
      seenNames.add(key);
      allCompanies.push({ name: p.name, isDefault: false, id: p.id, gstin: p.gstin });
    }
  });

  state.companies.forEach(c => {
    const key = (c || '').trim().toLowerCase();
    if (key && !seenNames.has(key)) {
      seenNames.add(key);
      allCompanies.push({ name: c, isDefault: false, id: null });
    }
  });

  const currentActive = state.selectedCompany || defaultOrg;

  allCompanies.forEach(comp => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all " +
      (comp.name === currentActive ? "bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-900/50" : "text-slate-700 dark:text-slate-300");

    // Selectable content area
    const content = document.createElement('div');
    content.className = "flex items-center space-x-2 flex-1 min-w-0 pr-2";
    
    // Checkmark if active
    if (comp.name === currentActive) {
      content.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400"></i>`;
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
    } else if (comp.gstin) {
      const gstinBadge = document.createElement('span');
      gstinBadge.className = "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ml-1 flex-shrink-0 uppercase";
      gstinBadge.textContent = "GST";
      content.appendChild(gstinBadge);
    }

    content.addEventListener('click', () => {
      selectCompany(comp.isDefault ? '' : comp.name);
      if (DOM.companySelectorDropdown) DOM.companySelectorDropdown.classList.add('hidden');
    });

    item.appendChild(content);

    // Delete button for sub-companies
    if (!comp.isDefault) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = "button";
      deleteBtn.className = "text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer";
      deleteBtn.title = "Delete sub-company";
      deleteBtn.innerHTML = `<i data-lucide="trash-2" class="w-3.5 h-3.5"></i>`;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (comp.id) {
          handleDeleteSubCompanyProfile(comp.id);
        } else {
          handleDeleteCompany(comp.name);
        }
      });
      item.appendChild(deleteBtn);
    }

    DOM.companySelectorList.appendChild(item);
  });

  lucide.createIcons();
}

function selectCompany(companyName) {
  state.selectedCompany = companyName;
  const defaultOrg = localStorage.getItem('metal-current-org') || 'Organisation';
  if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = companyName || defaultOrg;
  if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = companyName || defaultOrg;
  saveUserDataToServer();
  renderCompanyDropdown();
  renderSubCompaniesListContainer();
}

// --- Sub-Companies Management (Settings Tab) ---
function renderSubCompaniesListContainer() {
  if (!DOM.subCompaniesListContainer) return;
  DOM.subCompaniesListContainer.innerHTML = '';

  const defaultOrg = localStorage.getItem('metal-current-org') || 'Organisation';
  const defaultOrgKey = defaultOrg.trim().toLowerCase();
  
  if (!state.subCompanyProfiles) state.subCompanyProfiles = [];
  if (!state.companies) state.companies = [];

  // Build unified sub-companies list
  const unifiedProfiles = [];
  const seenKeys = new Set();

  // 1. Include structured subCompanyProfiles
  state.subCompanyProfiles.forEach(p => {
    const key = (p.name || '').trim().toLowerCase();
    if (key && key !== defaultOrgKey && !seenKeys.has(key)) {
      seenKeys.add(key);
      unifiedProfiles.push(p);
    }
  });

  // 2. Include simple company names from state.companies
  state.companies.forEach(cName => {
    const key = (cName || '').trim().toLowerCase();
    if (key && key !== defaultOrgKey && !seenKeys.has(key)) {
      seenKeys.add(key);
      unifiedProfiles.push({
        id: `sub_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        name: cName,
        gstin: '',
        address: '',
        phones: [],
        emails: [],
        bankDetails: {},
        declaration: '',
        isSimple: true
      });
    }
  });

  if (unifiedProfiles.length === 0) {
    DOM.subCompaniesListContainer.innerHTML = `
      <div class="col-span-full py-8 px-4 text-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <i data-lucide="building-2" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2"></i>
        <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">No Sub-Companies Added</h4>
        <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
          Click the <strong>+ Add Sub-Company</strong> button above to register additional company branches, divisions, or subsidiary entities.
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const activeCompany = state.selectedCompany || defaultOrg;

  unifiedProfiles.forEach(subComp => {
    const isActive = subComp.name.toLowerCase() === activeCompany.toLowerCase();
    const card = document.createElement('div');
    card.className = `p-4 rounded-2xl border transition-all ${
      isActive 
        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80 shadow-sm' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
    }`;

    const phonesList = Array.isArray(subComp.phones) && subComp.phones.length > 0 ? subComp.phones.join(', ') : 'No phone';
    const emailsList = Array.isArray(subComp.emails) && subComp.emails.length > 0 ? subComp.emails.join(', ') : 'No email';
    const gstinBadge = subComp.gstin ? `<span class="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold uppercase border border-indigo-100 dark:border-indigo-900/40">GST: ${escapeHTML(subComp.gstin)}</span>` : '';

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-2.5">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">${escapeHTML(subComp.name)}</h4>
            ${isActive ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">Active Profile</span>' : ''}
            ${gstinBadge}
          </div>
          ${subComp.address ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">${escapeHTML(subComp.address)}</p>` : ''}
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button type="button" class="btn-edit-subcompany p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer" title="Edit Sub-Company">
            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" class="btn-delete-subcompany p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer" title="Delete Sub-Company">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="phone" class="w-3 h-3 text-slate-400 shrink-0"></i>
          <span class="truncate">${escapeHTML(phonesList)}</span>
        </div>
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="mail" class="w-3 h-3 text-slate-400 shrink-0"></i>
          <span class="truncate">${escapeHTML(emailsList)}</span>
        </div>
      </div>

      <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span class="text-[10px] text-slate-400">Use for quotation generation</span>
        ${!isActive ? `
          <button type="button" class="btn-switch-subcompany text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer">
            Set Active <i data-lucide="arrow-right" class="w-3 h-3"></i>
          </button>
        ` : '<span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><i data-lucide="check-circle-2" class="w-3 h-3"></i> Selected</span>'}
      </div>
    `;

    card.querySelector('.btn-edit-subcompany').addEventListener('click', () => {
      openSubCompanyForm(subComp.id);
    });

    card.querySelector('.btn-delete-subcompany').addEventListener('click', () => {
      handleDeleteSubCompanyProfile(subComp.id);
    });

    const switchBtn = card.querySelector('.btn-switch-subcompany');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        selectCompany(subComp.name);
      });
    }

    DOM.subCompaniesListContainer.appendChild(card);
  });

  lucide.createIcons();
}

function openSubCompanyForm(subCompId = null) {
  if (!DOM.subCompanyFormContainer) return;
  DOM.subCompanyFormContainer.classList.remove('hidden');
  DOM.subCompanyFormContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (subCompId) {
    const existing = (state.subCompanyProfiles || []).find(p => p.id === subCompId);
    if (existing) {
      if (DOM.subCompanyFormTitle) DOM.subCompanyFormTitle.textContent = "Edit Sub-Company Profile";
      if (DOM.subCompanyEditId) DOM.subCompanyEditId.value = existing.id;
      if (DOM.subCompanyInputName) DOM.subCompanyInputName.value = existing.name || '';
      if (DOM.subCompanyInputGstin) DOM.subCompanyInputGstin.value = existing.gstin || '';
      if (DOM.subCompanyInputWebsite) DOM.subCompanyInputWebsite.value = existing.website || '';
      if (DOM.subCompanyInputAddress) DOM.subCompanyInputAddress.value = existing.address || '';
      if (DOM.subCompanyInputBankName) DOM.subCompanyInputBankName.value = existing.bankDetails?.bankName || '';
      if (DOM.subCompanyInputBankAccount) DOM.subCompanyInputBankAccount.value = existing.bankDetails?.accountNumber || '';
      if (DOM.subCompanyInputBankBranch) DOM.subCompanyInputBankBranch.value = existing.bankDetails?.branch || '';
      if (DOM.subCompanyInputBankIfsc) DOM.subCompanyInputBankIfsc.value = existing.bankDetails?.ifscCode || '';
      if (DOM.subCompanyInputBankUpi) DOM.subCompanyInputBankUpi.value = existing.bankDetails?.upiId || '';
      if (DOM.subCompanyInputDeclaration) DOM.subCompanyInputDeclaration.value = existing.declaration || '';
      renderSubCompanyPhoneInputs(existing.phones || ['']);
      renderSubCompanyEmailInputs(existing.emails || ['']);
      return;
    }
  }

  // Create mode
  if (DOM.subCompanyFormTitle) DOM.subCompanyFormTitle.textContent = "Add New Sub-Company Profile";
  if (DOM.subCompanyEditId) DOM.subCompanyEditId.value = '';
  if (DOM.subCompanyInputName) DOM.subCompanyInputName.value = '';
  if (DOM.subCompanyInputGstin) DOM.subCompanyInputGstin.value = '';
  if (DOM.subCompanyInputWebsite) DOM.subCompanyInputWebsite.value = '';
  if (DOM.subCompanyInputAddress) DOM.subCompanyInputAddress.value = '';
  if (DOM.subCompanyInputBankName) DOM.subCompanyInputBankName.value = '';
  if (DOM.subCompanyInputBankAccount) DOM.subCompanyInputBankAccount.value = '';
  if (DOM.subCompanyInputBankBranch) DOM.subCompanyInputBankBranch.value = '';
  if (DOM.subCompanyInputBankIfsc) DOM.subCompanyInputBankIfsc.value = '';
  if (DOM.subCompanyInputBankUpi) DOM.subCompanyInputBankUpi.value = '';
  if (DOM.subCompanyInputDeclaration) DOM.subCompanyInputDeclaration.value = '';
  renderSubCompanyPhoneInputs(['']);
  renderSubCompanyEmailInputs(['']);
}

function closeSubCompanyForm() {
  if (!DOM.subCompanyFormContainer) return;
  DOM.subCompanyFormContainer.classList.add('hidden');
}

function renderSubCompanyPhoneInputs(phones = ['']) {
  if (!DOM.subCompanyPhonesContainer) return;
  DOM.subCompanyPhonesContainer.innerHTML = '';
  const list = Array.isArray(phones) && phones.length > 0 ? phones : [''];
  list.forEach(ph => addSubCompanyPhoneRow(ph));
}

function addSubCompanyPhoneRow(val = '') {
  if (!DOM.subCompanyPhonesContainer) return;
  const row = document.createElement('div');
  row.className = "flex items-center gap-2";
  row.innerHTML = `
    <input type="tel" class="subcompany-phone-input flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-slate-950 dark:text-white text-xs font-semibold" placeholder="e.g. +91 90929 92995" value="${escapeHTML(val)}">
    <button type="button" class="btn-remove-subcompany-phone p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
    </button>
  `;
  row.querySelector('.btn-remove-subcompany-phone').addEventListener('click', () => {
    row.remove();
    if (DOM.subCompanyPhonesContainer.children.length === 0) {
      addSubCompanyPhoneRow('');
    }
  });
  DOM.subCompanyPhonesContainer.appendChild(row);
  lucide.createIcons();
}

function renderSubCompanyEmailInputs(emails = ['']) {
  if (!DOM.subCompanyEmailsContainer) return;
  DOM.subCompanyEmailsContainer.innerHTML = '';
  const list = Array.isArray(emails) && emails.length > 0 ? emails : [''];
  list.forEach(em => addSubCompanyEmailRow(em));
}

function addSubCompanyEmailRow(val = '') {
  if (!DOM.subCompanyEmailsContainer) return;
  const row = document.createElement('div');
  row.className = "flex items-center gap-2";
  row.innerHTML = `
    <input type="email" class="subcompany-email-input flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-2 px-3 text-slate-950 dark:text-white text-xs font-semibold" placeholder="e.g. sales@company.com" value="${escapeHTML(val)}">
    <button type="button" class="btn-remove-subcompany-email p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
    </button>
  `;
  row.querySelector('.btn-remove-subcompany-email').addEventListener('click', () => {
    row.remove();
    if (DOM.subCompanyEmailsContainer.children.length === 0) {
      addSubCompanyEmailRow('');
    }
  });
  DOM.subCompanyEmailsContainer.appendChild(row);
  lucide.createIcons();
}

function handleSaveSubCompanySubmit(e) {
  e.preventDefault();
  if (!DOM.subCompanyInputName) return;

  const name = DOM.subCompanyInputName.value.trim();
  if (!name) {
    alert('Please enter a sub-company name.');
    return;
  }

  const editId = DOM.subCompanyEditId ? DOM.subCompanyEditId.value : '';
  const gstin = DOM.subCompanyInputGstin ? DOM.subCompanyInputGstin.value.trim().toUpperCase() : '';
  const website = DOM.subCompanyInputWebsite ? DOM.subCompanyInputWebsite.value.trim() : '';
  const address = DOM.subCompanyInputAddress ? DOM.subCompanyInputAddress.value.trim() : '';
  const declaration = DOM.subCompanyInputDeclaration ? DOM.subCompanyInputDeclaration.value.trim() : '';

  const phoneInputs = Array.from(document.querySelectorAll('.subcompany-phone-input'));
  const phones = phoneInputs.map(input => input.value.trim()).filter(Boolean);

  const emailInputs = Array.from(document.querySelectorAll('.subcompany-email-input'));
  const emails = emailInputs.map(input => input.value.trim()).filter(Boolean);

  const bankDetails = {
    bankName: DOM.subCompanyInputBankName ? DOM.subCompanyInputBankName.value.trim() : '',
    accountNumber: DOM.subCompanyInputBankAccount ? DOM.subCompanyInputBankAccount.value.trim() : '',
    branch: DOM.subCompanyInputBankBranch ? DOM.subCompanyInputBankBranch.value.trim() : '',
    ifscCode: DOM.subCompanyInputBankIfsc ? DOM.subCompanyInputBankIfsc.value.trim().toUpperCase() : '',
    upiId: DOM.subCompanyInputBankUpi ? DOM.subCompanyInputBankUpi.value.trim() : ''
  };

  if (!state.subCompanyProfiles) state.subCompanyProfiles = [];
  if (!state.companies) state.companies = [];

  if (editId) {
    // Edit existing profile
    const index = state.subCompanyProfiles.findIndex(p => p.id === editId);
    if (index !== -1) {
      const oldName = state.subCompanyProfiles[index].name;
      state.subCompanyProfiles[index] = {
        ...state.subCompanyProfiles[index],
        name, gstin, website, address, phones, emails, bankDetails, declaration
      };
      // Keep state.companies updated
      state.companies = state.companies.map(c => c === oldName ? name : c);
      if (state.selectedCompany === oldName) {
        state.selectedCompany = name;
      }
    }
  } else {
    // Create new profile
    const newId = `sub_${Date.now()}`;
    const newProfile = {
      id: newId,
      name, gstin, website, address, phones, emails, bankDetails, declaration,
      createdAt: new Date().toISOString()
    };
    state.subCompanyProfiles.push(newProfile);
    if (!state.companies.includes(name)) {
      state.companies.push(name);
    }
    state.selectedCompany = name;
  }

  saveUserDataToServer();
  renderCompanyDropdown();
  renderSubCompaniesListContainer();
  closeSubCompanyForm();
}

function handleDeleteSubCompanyProfile(subCompId) {
  const profile = (state.subCompanyProfiles || []).find(p => p.id === subCompId);
  const profileName = profile ? profile.name : 'this sub-company';

  showConfirmModal({
    title: 'Delete Sub-Company Profile',
    message: `Are you sure you want to delete "${profileName}" from your organisation profiles?`,
    confirmText: 'Delete Sub-Company',
    onConfirm: () => {
      state.subCompanyProfiles = (state.subCompanyProfiles || []).filter(p => p.id !== subCompId);
      if (profile) {
        state.companies = (state.companies || []).filter(c => c !== profile.name);
        if (state.selectedCompany === profile.name) {
          state.selectedCompany = '';
          const defaultOrg = localStorage.getItem('metal-current-org') || 'Organisation';
          if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = defaultOrg;
          if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = defaultOrg;
        }
      }
      saveUserDataToServer();
      renderCompanyDropdown();
      renderSubCompaniesListContainer();
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

// Global state filters for Process and Client modals (declared above near line 3066)

function openProcessOperationsModal(mode = 'add') {
  if (!DOM.processOperationsModal) return;
  DOM.processOperationsModal.classList.remove('hidden');

  if (mode === 'add') {
    if (DOM.processFormContainer) DOM.processFormContainer.classList.remove('hidden');
    if (DOM.processOperationsModalTitle) DOM.processOperationsModalTitle.textContent = "Add Operation & Configure Process Rates";
    if (DOM.processOperationsModalSubtitle) DOM.processOperationsModalSubtitle.textContent = "Select operations to add to your calculation or configure fixed rates";
    if (DOM.modalNewProfileName) DOM.modalNewProfileName.value = '';
    if (DOM.modalNewProfileRate) DOM.modalNewProfileRate.value = '';
  } else {
    if (DOM.processFormContainer) DOM.processFormContainer.classList.add('hidden');
    if (DOM.processOperationsModalTitle) DOM.processOperationsModalTitle.textContent = "Select Operations";
    if (DOM.processOperationsModalSubtitle) DOM.processOperationsModalSubtitle.textContent = "Search and select process operations to add to your calculation";
  }

  if (DOM.processSearchInput) DOM.processSearchInput.value = '';
  modalProcessSearchQuery = '';
  if (DOM.clearProcessSearchBtn) DOM.clearProcessSearchBtn.classList.add('hidden');
  if (DOM.modalProcessesViewLimitSelect) {
    if (modalProcessesVisibleLimit === Infinity) {
      DOM.modalProcessesViewLimitSelect.value = 'all';
    } else {
      DOM.modalProcessesViewLimitSelect.value = String(modalProcessesVisibleLimit);
    }
  }

  renderModalProcessProfilesList();
  lucide.createIcons();
}

function closeProcessOperationsModal() {
  if (!DOM.processOperationsModal) return;
  DOM.processOperationsModal.classList.add('hidden');
}

function renderProcessRatesRegistry() {
  renderModalProcessProfilesList();
}

function renderModalProcessProfilesList() {
  if (!DOM.modalProcessProfilesList) return;
  DOM.modalProcessProfilesList.innerHTML = '';

  let allProfiles = state.processRates || [];
  if (modalProcessSearchQuery) {
    const q = modalProcessSearchQuery.toLowerCase();
    allProfiles = allProfiles.filter(prof => {
      const name = (prof.name || '').toLowerCase();
      const unit = (prof.unit || '').toLowerCase();
      const rate = String(prof.rate || '');
      return name.includes(q) || unit.includes(q) || rate.includes(q);
    });
  }

  const count = allProfiles.length;
  if (DOM.modalProcessCount) DOM.modalProcessCount.textContent = count;

  if (count === 0) {
    DOM.modalProcessProfilesList.innerHTML = `
      <div class="p-6 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs space-y-1">
        <i data-lucide="info" class="w-5 h-5 mx-auto text-slate-400"></i>
        <p>${modalProcessSearchQuery ? 'No matching operations found.' : 'No active process profiles configured yet.'}</p>
        <p class="text-[11px]">${modalProcessSearchQuery ? 'Try another keyword or clear search.' : 'Use the form above to add your first machinery or labour rate.'}</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let visibleProfiles = allProfiles;
  if (modalProcessesVisibleLimit === 0) {
    visibleProfiles = [];
  } else if (modalProcessesVisibleLimit !== Infinity) {
    visibleProfiles = allProfiles.slice(0, modalProcessesVisibleLimit);
  }

  visibleProfiles.forEach((prof, idx) => {
    const unitLabelMap = {
      'Minute': { label: 'Min', rateSuffix: '/min' },
      'Hours': { label: 'Hrs:', rateSuffix: '/hr' },
      'Weight': { label: 'Kg:', rateSuffix: '/kg' },
      'Piece / Nos': { label: 'Qty:', rateSuffix: '/pc' },
      'Meter': { label: 'M:', rateSuffix: '/m' },
      'Area': { label: 'Sq.m:', rateSuffix: '/sq.m' },
      'Fixed': { label: 'Flat:', rateSuffix: ' Flat' }
    };
    const unitConfig = unitLabelMap[prof.unit] || { label: 'Min', rateSuffix: '/min' };

    const isMinute = !prof.unit || prof.unit.toLowerCase() === 'minute' || prof.unit.toLowerCase() === 'min';
    const unitBadgeHTML = isMinute
      ? `<span class="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"><i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> Min</span>`
      : `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">${escapeHTML(prof.unit || 'Minute')}</span>`;

    const inputPrefixHTML = isMinute
      ? `<i data-lucide="clock" class="w-3 h-3 text-slate-400"></i> Min`
      : escapeHTML(unitConfig.label);

    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors gap-3";

    item.innerHTML = `
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <input type="checkbox" id="modal-proc-check-${idx}" class="process-modal-checkbox w-4 h-4 text-brand-600 rounded cursor-pointer shrink-0" data-proc-name="${escapeHTML(prof.name)}" data-proc-rate="${prof.rate}" data-proc-unit="${escapeHTML(prof.unit || 'Minute')}">
        <label for="modal-proc-check-${idx}" class="flex flex-col cursor-pointer min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 dark:text-white truncate">${escapeHTML(prof.name)}</span>
            ${unitBadgeHTML}
          </div>
          <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Rate: ₹${prof.rate.toFixed(2)}${unitConfig.rateSuffix}</span>
        </label>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1">
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">${inputPrefixHTML}</span>
          <input type="number" min="0" step="any" value="10" class="process-modal-duration w-14 text-center text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" data-proc-name="${escapeHTML(prof.name)}">
        </div>

        <button type="button" class="text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-edit-proc" title="Edit Process Profile" data-proc-name="${escapeHTML(prof.name)}">
          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
        </button>
        <button type="button" class="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors btn-del-proc" title="Delete Process Profile" data-proc-name="${escapeHTML(prof.name)}">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    item.querySelector('.btn-edit-proc').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditProcessProfileModal(prof);
    });

    item.querySelector('.btn-del-proc').addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmModal({
        title: 'Delete Process Profile',
        message: `Are you sure you want to delete "${prof.name}" from your active rates registry? Active calculation rows will be updated automatically.`,
        confirmText: 'Delete Profile',
        onConfirm: () => {
          handleDeleteProcessProfile(prof.name);
        }
      });
    });

    DOM.modalProcessProfilesList.appendChild(item);
  });

  lucide.createIcons();
}

function toggleAllModalProcesses(selectAll) {
  const checkboxes = document.querySelectorAll('.process-modal-checkbox');
  checkboxes.forEach(cb => {
    cb.checked = selectAll;
  });
}

function handleAddSelectedProcesses() {
  const checkboxes = document.querySelectorAll('.process-modal-checkbox:checked');
  if (checkboxes.length === 0) {
    alert("Please select at least one operation to add to your calculation.");
    return;
  }

  checkboxes.forEach(cb => {
    const name = cb.getAttribute('data-proc-name');
    const rate = parseFloat(cb.getAttribute('data-proc-rate')) || 0;
    const unit = cb.getAttribute('data-proc-unit') || 'Minute';
    
    const durationInput = document.querySelector(`.process-modal-duration[data-proc-name="${name}"]`);
    const duration = durationInput ? (parseFloat(durationInput.value) || 0) : 0;

    const newRow = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
      name: name,
      unit: unit,
      duration: duration,
      rate: rate,
      cost: duration * rate
    };

    state.processes.push(newRow);
  });

  saveProcessesToStorage();
  closeProcessOperationsModal();
  renderSeparateEditors();

  showToast({
    title: 'Operations Added',
    message: `Added ${checkboxes.length} operation${checkboxes.length === 1 ? '' : 's'} to process costing.`,
    type: 'success'
  });
}

function handleModalAddProcessProfileSubmit(e) {
  e.preventDefault();
  if (!DOM.modalNewProfileName || !DOM.modalNewProfileRate) return;

  const name = DOM.modalNewProfileName.value.trim();
  const rate = parseFloat(DOM.modalNewProfileRate.value);
  const unit = DOM.modalNewProfileUnit ? DOM.modalNewProfileUnit.value : 'Minute';

  if (!name || isNaN(rate) || rate < 0) {
    alert("Please enter a valid process name and non-negative rate.");
    return;
  }

  const nameExists = (state.processRates || []).some(p => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    alert(`Process profile "${name}" already exists.`);
    return;
  }

  if (!state.processRates) state.processRates = [];
  state.processRates.push({ name, rate, unit });
  DOM.modalNewProfileName.value = '';
  DOM.modalNewProfileRate.value = '';
  if (DOM.modalNewProfileUnit) DOM.modalNewProfileUnit.value = 'Minute';

  saveUserDataToServer();
  renderModalProcessProfilesList();
  renderSeparateEditors();
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
  renderModalProcessProfilesList();
  renderSeparateEditors();
  updateAllDisplays();
  closeEditProcessProfileModal();
}

function handleDeleteProcessProfile(name) {
  state.processRates = (state.processRates || []).filter(p => p.name !== name);
  
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
  renderModalProcessProfilesList();
  renderSeparateEditors();
  updateAllDisplays();
}

// --- Client Directory & Recipients Modal Controllers ---
function openClientsModal(mode = 'select') {
  if (!DOM.clientsModal) return;
  DOM.clientsModal.classList.remove('hidden');

  if (mode === 'add') {
    if (DOM.clientFormContainer) DOM.clientFormContainer.classList.remove('hidden');
    if (DOM.clientsModalTitle) DOM.clientsModalTitle.textContent = "Add Client";
    if (DOM.clientsModalSubtitle) DOM.clientsModalSubtitle.textContent = "Register a new client company and select quotation recipients.";
    handleCancelClientEdit();
  } else {
    if (DOM.clientFormContainer) DOM.clientFormContainer.classList.add('hidden');
    if (DOM.clientsModalTitle) DOM.clientsModalTitle.textContent = "Select Client";
    if (DOM.clientsModalSubtitle) DOM.clientsModalSubtitle.textContent = "Select quotation recipients from your client directory.";
  }

  if (DOM.clientSearchInput) DOM.clientSearchInput.value = '';
  if (DOM.clearClientSearchBtn) DOM.clearClientSearchBtn.classList.add('hidden');
  
  // Default to showing all clients so imported lists are immediately visible
  if (modalClientsVisibleLimit === undefined || modalClientsVisibleLimit === 0) {
    modalClientsVisibleLimit = Infinity;
  }
  if (DOM.modalClientsViewLimitSelect) {
    DOM.modalClientsViewLimitSelect.value = (modalClientsVisibleLimit === Infinity) ? 'all' : String(modalClientsVisibleLimit);
  }

  filterModalClients();
  updateModalSelectionSummary();
  lucide.createIcons();
}

function closeClientsModal() {
  if (!DOM.clientsModal) return;
  DOM.clientsModal.classList.add('hidden');
  updateAppliedClientsDisplay();
  saveUserDataToServer();
  if (state.currentUserType === 'org') {
    renderOrgCalculatorView();
  }
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
      DOM.appliedClientNamesDisplay.textContent = 'None selected (Click "Client Directory" to assign)';
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

function renderModalClientsList(clientList = null) {
  if (!DOM.modalClientsList) return;
  DOM.modalClientsList.innerHTML = '';
  
  const allClients = state.clients || [];
  if (DOM.modalClientsCount) {
    DOM.modalClientsCount.textContent = `${allClients.length} Client${allClients.length === 1 ? '' : 's'} in Directory`;
  }

  const list = clientList !== null ? clientList : allClients;

  if (allClients.length === 0) {
    DOM.modalClientsList.innerHTML = `
      <div class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
        <i data-lucide="book-open" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
        No clients in directory yet. Add a new client or import from Excel!
      </div>
    `;
    if (DOM.modalClientsListCounter) DOM.modalClientsListCounter.textContent = '0 Clients';
    lucide.createIcons();
    return;
  }

  if (list.length === 0) {
    DOM.modalClientsList.innerHTML = `
      <div class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
        No clients matching your search.
      </div>
    `;
    if (DOM.modalClientsListCounter) DOM.modalClientsListCounter.textContent = '0 Matching';
    lucide.createIcons();
    return;
  }

  if (modalClientsVisibleLimit === 0) {
    DOM.modalClientsList.innerHTML = `
      <div class="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
        <i data-lucide="eye-off" class="w-8 h-8 mx-auto mb-1.5 opacity-40"></i>
        Clients are currently hidden. Select a limit from the dropdown above to display clients.
      </div>
    `;
    if (DOM.modalClientsListCounter) DOM.modalClientsListCounter.textContent = `Hidden (0 of ${list.length} clients)`;
    lucide.createIcons();
    return;
  }

  const limit = modalClientsVisibleLimit === Infinity ? list.length : modalClientsVisibleLimit;
  const visible = list.slice(0, limit);

  if (DOM.modalClientsListCounter) {
    if (visible.length >= list.length) {
      DOM.modalClientsListCounter.textContent = `Showing all ${list.length} client${list.length === 1 ? '' : 's'}`;
    } else {
      DOM.modalClientsListCounter.textContent = `Showing ${visible.length} of ${list.length} client${list.length === 1 ? '' : 's'}`;
    }
  }

  visible.forEach(client => {
    const isSelected = (state.selectedClients || []).some(sc => (sc.id && client.id && sc.id === client.id) || (sc.name && sc.name.toLowerCase() === client.name.toLowerCase()));
    const item = document.createElement('div');
    item.className = `p-3 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`;
    
    const emailsList = Array.isArray(client.emails) && client.emails.length > 0 ? client.emails : (client.email ? [client.email] : []);
    const phonesList = Array.isArray(client.phones) && client.phones.length > 0 ? client.phones : (client.phone || client.phoneNumber ? [client.phone || client.phoneNumber] : []);
    
    const emailsBadges = emailsList.map(em => `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono break-all font-semibold"><i data-lucide="mail" class="w-2.5 h-2.5"></i>${escapeHTML(em)}</span>`).join(' ');
    const phonesBadges = phonesList.map(ph => `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] break-words font-medium"><i data-lucide="phone" class="w-2.5 h-2.5"></i>${escapeHTML(ph)}</span>`).join(' ');
    const gstinBadge = client.gstin ? `<span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold uppercase">GSTIN: ${escapeHTML(client.gstin)}</span>` : '';

    item.innerHTML = `
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <input type="checkbox" class="client-checkbox w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0" ${isSelected ? 'checked' : ''}>
        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold text-slate-900 dark:text-white break-words">${escapeHTML(client.name)}</span>
            ${isSelected ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">Selected</span>' : ''}
          </div>
          ${client.address ? `<p class="text-[11px] text-slate-600 dark:text-slate-300 break-words whitespace-normal leading-relaxed">${escapeHTML(client.address)}</p>` : ''}
          <div class="flex items-center flex-wrap gap-1 pt-0.5">
            ${emailsBadges}
            ${phonesBadges}
            ${gstinBadge}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0 ml-2">
        <button type="button" class="btn-edit-client p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer" title="Edit Client Details">
          <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
        </button>
        <button type="button" class="btn-delete-client p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer" title="Delete Client from Directory">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    // Toggle selection on row or checkbox click
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

// --- Client Email Dynamic Input Manager ---
function renderClientEmailInputs(emails = ['']) {
  if (!DOM.clientEmailsContainer) return;
  DOM.clientEmailsContainer.innerHTML = '';
  const list = Array.isArray(emails) && emails.length > 0 ? emails : [''];
  list.forEach((emVal) => {
    addClientEmailRow(emVal);
  });
}

function addClientEmailRow(value = '') {
  if (!DOM.clientEmailsContainer) return;
  const row = document.createElement('div');
  row.className = 'flex items-center gap-1.5 client-email-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'client-email-input flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 text-xs font-semibold shadow-xs';
  input.placeholder = 'e.g. accounts<accounts@cat.com> or billing@cat.com';
  input.value = value || '';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex-shrink-0';
  removeBtn.title = 'Remove Email';
  removeBtn.innerHTML = '<i data-lucide="x" class="w-3.5 h-3.5"></i>';

  removeBtn.addEventListener('click', () => {
    const allRows = DOM.clientEmailsContainer.querySelectorAll('.client-email-row');
    if (allRows.length > 1) {
      row.remove();
    } else {
      input.value = '';
    }
  });

  row.appendChild(input);
  row.appendChild(removeBtn);
  DOM.clientEmailsContainer.appendChild(row);

  lucide.createIcons();
}

// --- Client Phone Dynamic Input Manager ---
function renderClientPhoneInputs(phones = ['']) {
  if (!DOM.clientPhonesContainer) return;
  DOM.clientPhonesContainer.innerHTML = '';
  const list = Array.isArray(phones) && phones.length > 0 ? phones : [''];
  list.forEach((phVal) => {
    addClientPhoneRow(phVal);
  });
}

function addClientPhoneRow(value = '') {
  if (!DOM.clientPhonesContainer) return;
  const row = document.createElement('div');
  row.className = 'flex items-center gap-1.5 client-phone-row';

  const input = document.createElement('input');
  input.type = 'tel';
  input.className = 'client-phone-input flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 text-xs font-semibold shadow-xs';
  input.placeholder = 'e.g. +91 9876543210';
  input.value = value || '';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex-shrink-0';
  removeBtn.title = 'Remove Phone';
  removeBtn.innerHTML = '<i data-lucide="x" class="w-3.5 h-3.5"></i>';

  removeBtn.addEventListener('click', () => {
    const allRows = DOM.clientPhonesContainer.querySelectorAll('.client-phone-row');
    if (allRows.length > 1) {
      row.remove();
    } else {
      input.value = '';
    }
  });

  row.appendChild(input);
  row.appendChild(removeBtn);
  DOM.clientPhonesContainer.appendChild(row);

  lucide.createIcons();
}

let editingClientId = null;

function handleStartEditClient(client) {
  if (!client) return;
  editingClientId = client.id || client.name;

  if (DOM.clientFormContainer) DOM.clientFormContainer.classList.remove('hidden');
  if (DOM.clientInputName) DOM.clientInputName.value = client.name || '';
  
  const clientEmails = Array.isArray(client.emails) && client.emails.length > 0 
    ? client.emails 
    : (client.email ? [client.email] : ['']);
  renderClientEmailInputs(clientEmails);

  const clientPhones = Array.isArray(client.phones) && client.phones.length > 0
    ? client.phones
    : (client.phone || client.phoneNumber ? [client.phone || client.phoneNumber] : ['']);
  renderClientPhoneInputs(clientPhones);

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
  renderClientEmailInputs(['']);
  renderClientPhoneInputs(['']);
  if (DOM.clientInputAddress) DOM.clientInputAddress.value = '';
  if (DOM.clientInputGSTIN) DOM.clientInputGSTIN.value = '';

  if (DOM.clientFormTitle) DOM.clientFormTitle.textContent = "Add New Client Company";
  if (DOM.clientFormIcon) DOM.clientFormIcon.setAttribute('data-lucide', 'user-plus');
  if (DOM.clientFormSubmitText) DOM.clientFormSubmitText.textContent = "Save Client";
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
  filterModalClients();
}

function handleModalSelectAllClients() {
  if (!state.selectedClients) state.selectedClients = [];
  const q = DOM.clientSearchInput ? DOM.clientSearchInput.value.trim().toLowerCase() : '';
  
  let candidates = state.clients || [];
  if (q) {
    candidates = candidates.filter(c => {
      const n = (c.name || '').toLowerCase();
      const allEm = (Array.isArray(c.emails) ? c.emails.join(' ') : (c.email || '')).toLowerCase();
      const allPh = (Array.isArray(c.phones) ? c.phones.join(' ') : (c.phone || '')).toLowerCase();
      const a = (c.address || '').toLowerCase();
      const g = (c.gstin || '').toLowerCase();
      return n.includes(q) || allEm.includes(q) || allPh.includes(q) || a.includes(q) || g.includes(q);
    });
  }

  candidates.forEach(client => {
    const exists = state.selectedClients.some(sc => (sc.id && client.id && sc.id === client.id) || (sc.name && sc.name.toLowerCase() === client.name.toLowerCase()));
    if (!exists) {
      state.selectedClients.push(client);
    }
  });

  if (state.selectedClients.length > 0) {
    state.customerName = state.selectedClients[0].name;
    state.customerAddress = state.selectedClients[0].address || '';
    state.customerGSTIN = state.selectedClients[0].gstin || '';
  }

  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
  filterModalClients();
}

function clearModalClientsSelection() {
  state.selectedClients = [];
  state.customerName = '';
  state.customerAddress = '';
  state.customerGSTIN = '';
  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
  filterModalClients();
}

function handleAddClientSubmit(e) {
  e.preventDefault();
  const name = DOM.clientInputName.value.trim();
  
  // Extract all email inputs
  const emailInputs = DOM.clientEmailsContainer ? DOM.clientEmailsContainer.querySelectorAll('.client-email-input') : [];
  const rawEmails = Array.from(emailInputs).map(inp => inp.value.trim()).filter(Boolean);
  const emails = rawEmails.length > 0 ? rawEmails : [];
  const primaryEmail = emails.length > 0 ? emails[0] : '';

  // Extract all phone inputs
  const phoneInputs = DOM.clientPhonesContainer ? DOM.clientPhonesContainer.querySelectorAll('.client-phone-input') : [];
  const rawPhones = Array.from(phoneInputs).map(inp => inp.value.trim()).filter(Boolean);
  const phones = rawPhones.length > 0 ? rawPhones : [];
  const primaryPhone = phones.length > 0 ? phones[0] : '';

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
      state.clients[clientIdx].email = primaryEmail;
      state.clients[clientIdx].emails = emails;
      state.clients[clientIdx].phone = primaryPhone;
      state.clients[clientIdx].phones = phones;
      state.clients[clientIdx].address = address;
      state.clients[clientIdx].gstin = gstin;

      // Update in selectedClients if present
      if (state.selectedClients) {
        const selIdx = state.selectedClients.findIndex(sc => (sc.id && sc.id === editingClientId) || sc.name === editingClientId);
        if (selIdx >= 0) {
          state.selectedClients[selIdx].name = name;
          state.selectedClients[selIdx].email = primaryEmail;
          state.selectedClients[selIdx].emails = emails;
          state.selectedClients[selIdx].phone = primaryPhone;
          state.selectedClients[selIdx].phones = phones;
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
    filterModalClients();
    updateModalSelectionSummary();
    updateAppliedClientsDisplay();
    if (state.currentUserType === 'org') {
      renderOrgCalculatorView();
    }
    return;
  }
  
  const existing = state.clients.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    alert(`A client named "${name}" already exists in your directory.`);
    return;
  }

  const newClient = {
    id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name,
    email: primaryEmail,
    emails: emails,
    phone: primaryPhone,
    phones: phones,
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
  renderClientEmailInputs(['']);
  renderClientPhoneInputs(['']);
  DOM.clientInputAddress.value = '';
  DOM.clientInputGSTIN.value = '';

  saveUserDataToServer();
  filterModalClients();
  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
  if (state.currentUserType === 'org') {
    renderOrgCalculatorView();
  }
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
  filterModalClients();
  updateModalSelectionSummary();
  updateAppliedClientsDisplay();
  if (state.currentUserType === 'org') {
    renderOrgCalculatorView();
  }
}

function filterModalClients() {
  if (!DOM.modalClientsList) return;
  const q = DOM.clientSearchInput ? DOM.clientSearchInput.value.trim().toLowerCase() : '';
  
  if (DOM.clearClientSearchBtn) {
    if (q) {
      DOM.clearClientSearchBtn.classList.remove('hidden');
    } else {
      DOM.clearClientSearchBtn.classList.add('hidden');
    }
  }

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
    orgClientsVisibleLimit = 10;
    orgClientSearchQuery = '';
    if (DOM.orgClientSearchInput) DOM.orgClientSearchInput.value = '';
    if (DOM.orgClearClientSearchBtn) DOM.orgClearClientSearchBtn.classList.add('hidden');
    saveUserDataToServer();
    renderModalClientsList(state.clients);
    updateModalSelectionSummary();
    updateAppliedClientsDisplay();
    renderOrgCalculatorView();

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
function openSeparatePDFModal(includeWorkings = false) {
  if (!DOM.separatePdfModal) return;
  state.separatePdfIncludeWorkings = includeWorkings;
  const clients = state.selectedClients || [];
  
  if (clients.length === 0) {
    alert("Please select at least one client before exporting separate quotation PDFs.");
    return;
  }

  DOM.separatePdfModal.classList.remove('hidden');
  if (DOM.separatePdfCount) DOM.separatePdfCount.textContent = clients.length;
  
  if (DOM.exportModalModeBadge) {
    if (includeWorkings) {
      DOM.exportModalModeBadge.textContent = "Quote with Workings";
      DOM.exportModalModeBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800";
    } else {
      DOM.exportModalModeBadge.textContent = "Commercial Quote";
      DOM.exportModalModeBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-cyan-400 border border-brand-200 dark:border-brand-800";
    }
  }

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
        <button type="button" class="btn-preview-single-pdf inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all active:scale-95 cursor-pointer">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-500"></i> Preview
        </button>
        <button type="button" class="btn-download-single-pdf inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer">
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
  exportQuoteToPDF(null, shouldPreview, client, state.separatePdfIncludeWorkings || false);
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
  const workingsView = document.getElementById('org-calc-workings-view');
  if (workingsView && !workingsView.classList.contains('hidden')) {
    closeWorkingsAndReturnToQuote();
    return;
  }

  if (state.tabHistory && state.tabHistory.length > 1) {
    state.tabHistory.pop();
    const prevTab = state.tabHistory.pop();
    setOrgTab(prevTab);
  } else {
    setOrgTab('calculator');
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
    savedToCatalog: true,
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
  const catalogProducts = (state.products || []).filter(p => p.savedToCatalog === true);
  const products = catalogProducts.filter(p => {
    if (!q) return true;
    return (p.name || '').toLowerCase().includes(q);
  });

  if (DOM.productsCountBadge) {
    const total = catalogProducts.length;
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
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">${escapeHTML(prod.name)}</h3>
                ${prod.createdBy ? `
                  <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                    ${escapeHTML(prod.createdBy)}
                  </span>
                ` : ''}
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

  const rawQty = parseFloat(DOM.quickProductQtyInput ? DOM.quickProductQtyInput.value : '1');
  const qty = (!isNaN(rawQty) && rawQty > 0) ? rawQty : 1;

  if (!state.products) state.products = [];
  const newProd = {
    id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name,
    quantity: qty,
    inQuote: true,
    savedToCatalog: false,
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
    if (state.currentUserType === 'org') {
      renderOrgCalculatorView();
    }
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
        <td colspan="6" class="py-12 px-4 text-center">
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
            <input type="number" min="0" step="any" value="${prod.quantity}" data-prod-id="${prod.id}" class="quote-input-prod-qty w-16 text-center text-xs font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono shadow-inner transition-all" />
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
          <td colspan="6" class="p-3 sm:px-8">
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
      <table class="w-full text-left border-collapse min-w-[650px]">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
            <th class="py-3.5 px-3 text-center w-14">Sl. No</th>
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
            <td colspan="6" class="py-3.5 px-6">
              <button type="button" id="quote-table-add-product-btn" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-800/80 hover:border-brand-500 dark:hover:border-brand-500 bg-brand-50/60 hover:bg-brand-50 dark:bg-brand-950/30 dark:hover:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm">
                <i data-lucide="plus-circle" class="w-4 h-4 text-brand-500"></i>
                <span>+ Add Product</span>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-slate-900 dark:bg-slate-950 text-white font-extrabold border-t-2 border-brand-500">
            <td colspan="4" class="py-4 px-6 text-right uppercase tracking-wider text-slate-300 font-bold text-xs sm:text-sm">
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
        const val = parseFloat(e.target.value);
        const newQty = (isNaN(val) || val < 0) ? 1 : val;
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

// --- Quotation Directory System ---

function handleSaveQuoteToDirectory() {
  const products = (state.products || []).filter(p => p.inQuote !== false);
  if (products.length === 0) {
    showToast({
      title: 'Quotation Empty',
      message: 'Your active quotation sheet has no items. Please add at least one product before saving.',
      type: 'warning',
      duration: 3500
    });
    return;
  }

  if (!Array.isArray(state.savedQuotationsDirectory)) {
    state.savedQuotationsDirectory = [];
  }

  let subtotal = 0;
  products.forEach(p => {
    subtotal += (p.grandTotal || 0);
  });

  const cgst = DOM.orgCalcCgstRate ? (parseFloat(DOM.orgCalcCgstRate.value) || 0) : 0;
  const sgst = DOM.orgCalcSgstRate ? (parseFloat(DOM.orgCalcSgstRate.value) || 0) : 0;
  const igst = DOM.orgCalcIgstRate ? (parseFloat(DOM.orgCalcIgstRate.value) || 0) : 0;

  let totalTaxRate = 0;
  if (igst > 0) {
    totalTaxRate = igst;
  } else {
    totalTaxRate = cgst + sgst;
  }
  const taxAmount = subtotal * (totalTaxRate / 100);
  const grandTotal = subtotal + taxAmount;

  const selectedClients = state.selectedClients || [];
  let clientName = 'Valued Client';
  let clientAddress = state.customerAddress || '';
  let clientGSTIN = state.customerGSTIN || '';

  if (selectedClients.length === 1) {
    clientName = selectedClients[0].name || 'Valued Client';
    clientAddress = selectedClients[0].address || '';
    clientGSTIN = selectedClients[0].gstin || '';
  } else if (selectedClients.length > 1) {
    clientName = selectedClients.map(c => c.name).join(', ');
    clientAddress = `${selectedClients.length} Recipients Consolidated`;
    clientGSTIN = '';
  } else if (state.customerName) {
    clientName = state.customerName;
  }

  const activeCompany = state.selectedCompany || state.currentUser || 'Argus Technologies';
  const quoteNum = state.savedQuotationsDirectory.length + 1;

  const newDirectoryEntry = {
    id: 'qdir_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    quoteNum: quoteNum,
    savedAt: new Date().toLocaleString('en-IN'),
    timestamp: Date.now(),
    companyName: activeCompany,
    customerName: clientName,
    customerAddress: clientAddress,
    customerGSTIN: clientGSTIN,
    selectedClients: JSON.parse(JSON.stringify(selectedClients)),
    products: JSON.parse(JSON.stringify(products)),
    profitPercentage: state.profitPercentage || 0,
    cgstRate: cgst,
    sgstRate: sgst,
    igstRate: igst,
    subtotal: subtotal,
    taxAmount: taxAmount,
    grandTotal: grandTotal
  };

  state.savedQuotationsDirectory.push(newDirectoryEntry);
  saveUserDataToServer();

  showToast({
    title: 'Quote Saved to Directory',
    message: `Quote #${quoteNum} for ${clientName} has been saved in the Quotation Directory!`,
    type: 'success',
    duration: 3500
  });

  renderQuotationDirectory();
}

function renderQuotationDirectory() {
  if (!DOM.directoryQuotesTableBody) return;

  const q = DOM.directorySearchInput ? DOM.directorySearchInput.value.trim().toLowerCase() : '';
  const dirEntries = (state.savedQuotationsDirectory || []).filter(entry => {
    if (!q) return true;
    const matchNum = entry.quoteNum && String(entry.quoteNum).includes(q);
    const matchClient = (entry.customerName || '').toLowerCase().includes(q);
    const matchCompany = (entry.companyName || '').toLowerCase().includes(q);
    const matchProd = (entry.products || []).some(p => (p.name || '').toLowerCase().includes(q));
    return matchNum || matchClient || matchCompany || matchProd;
  });

  if (DOM.directoryQuotesCountBadge) {
    const totalCount = (state.savedQuotationsDirectory || []).length;
    DOM.directoryQuotesCountBadge.textContent = `${totalCount} Saved Quote${totalCount === 1 ? '' : 's'}`;
  }

  if (dirEntries.length === 0) {
    DOM.directoryQuotesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center text-slate-400 dark:text-slate-500 italic">
          <div class="flex flex-col items-center justify-center gap-2">
            <i data-lucide="folder-archive" class="w-8 h-8 text-slate-300 dark:text-slate-700"></i>
            <span class="font-semibold text-slate-700 dark:text-slate-300 text-xs">No saved quotations in directory.</span>
            <span class="text-[11px] text-slate-400">Click <strong>Save Quote</strong> in the Quotation tab to save reference snapshots chronologically (#1, #2, #3...).</span>
          </div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  DOM.directoryQuotesTableBody.innerHTML = dirEntries.map((entry) => {
    const prodNames = (entry.products || [])
      .map(p => p.name || 'Product')
      .filter(Boolean)
      .join(', ');
    const prodSummary = prodNames.length > 50 ? prodNames.substring(0, 50) + '...' : (prodNames || 'Quotation Items');

    return `
      <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
        <td class="py-3 px-4 text-center font-mono font-black text-brand-600 dark:text-cyan-400 text-xs">
          #${entry.quoteNum}
        </td>
        <td class="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
          ${escapeHTML(entry.savedAt || '')}
        </td>
        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">
          <div>${escapeHTML(entry.customerName || 'Valued Client')}</div>
          ${entry.companyName ? `<span class="text-[10px] font-normal text-slate-400">${escapeHTML(entry.companyName)}</span>` : ''}
        </td>
        <td class="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
          ${escapeHTML(prodSummary)}
          <span class="text-[10px] text-slate-400 block">${(entry.products || []).length} Item(s)</span>
        </td>
        <td class="py-3 px-4 text-right font-mono font-black text-brand-700 dark:text-cyan-300 text-xs">
          ${formatINR(entry.grandTotal || 0)}
        </td>
        <td class="py-3 px-4 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="btn-view-dir-quote inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer" data-id="${entry.id}" title="View Details">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> View
            </button>
            <button type="button" class="btn-download-dir-quote inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer" data-id="${entry.id}" title="Download PDF">
              <i data-lucide="download" class="w-3.5 h-3.5"></i> PDF
            </button>
            <button type="button" class="btn-load-dir-quote inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800 transition-all cursor-pointer" data-id="${entry.id}" title="Load into Workspace">
              <i data-lucide="upload-cloud" class="w-3.5 h-3.5"></i> Load
            </button>
            <button type="button" class="btn-delete-dir-quote p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer" data-id="${entry.id}" title="Delete Reference">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  DOM.directoryQuotesTableBody.querySelectorAll('.btn-view-dir-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openViewDirectoryQuoteModal(id);
    });
  });

  DOM.directoryQuotesTableBody.querySelectorAll('.btn-download-dir-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      downloadDirectoryQuotePDF(id);
    });
  });

  DOM.directoryQuotesTableBody.querySelectorAll('.btn-load-dir-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      loadDirectoryQuoteToWorkspace(id);
    });
  });

  DOM.directoryQuotesTableBody.querySelectorAll('.btn-delete-dir-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      deleteDirectoryQuote(id);
    });
  });

  lucide.createIcons();
}

let activeDirectoryQuoteId = null;

function downloadDirectoryQuotePDF(id) {
  const entry = (state.savedQuotationsDirectory || []).find(e => e.id === id);
  if (!entry) {
    showToast('Quotation reference not found.', 'error');
    return;
  }

  const pdfTxData = {
    id: `Quote #${entry.quoteNum}`,
    date: entry.savedAt || new Date().toLocaleString('en-IN'),
    username: state.currentUser,
    companyName: entry.companyName || state.selectedCompany || state.currentUser,
    customerName: entry.customerName || 'Valued Client',
    customerAddress: entry.customerAddress || '',
    customerGSTIN: entry.customerGSTIN || '',
    products: entry.products || [],
    cgstRate: entry.cgstRate || 0,
    sgstRate: entry.sgstRate || 0,
    igstRate: entry.igstRate || 0,
    subtotal: entry.subtotal || 0,
    grandTotal: entry.grandTotal || 0
  };

  exportQuoteToPDF(pdfTxData, false, null, false);
}

function openViewDirectoryQuoteModal(id) {
  const entry = (state.savedQuotationsDirectory || []).find(e => e.id === id);
  if (!entry) return;

  activeDirectoryQuoteId = id;

  const titleEl = document.getElementById('directory-modal-title');
  const subtitleEl = document.getElementById('directory-modal-subtitle');
  const bodyEl = document.getElementById('directory-quote-modal-body');

  if (titleEl) titleEl.textContent = `Saved Quote Reference #${entry.quoteNum}`;
  if (subtitleEl) subtitleEl.textContent = `Saved on ${entry.savedAt || ''} • Issuer: ${entry.companyName || 'Organisation'}`;

  if (bodyEl) {
    const productsList = (entry.products || []).map((p, i) => `
      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
        <td class="py-2 px-3 font-mono font-bold text-slate-400 text-center">${i + 1}</td>
        <td class="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">${escapeHTML(p.name || 'Product')}</td>
        <td class="py-2 px-3 text-center font-mono">${p.quantity || 1} ${escapeHTML(p.unit || 'PCS')}</td>
        <td class="py-2 px-3 text-right font-mono">${formatINR(p.unitTotal || 0)}</td>
        <td class="py-2 px-3 text-right font-mono font-bold text-brand-600 dark:text-cyan-400">${formatINR(p.grandTotal || 0)}</td>
      </tr>
    `).join('');

    bodyEl.innerHTML = `
      <div class="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient Client / Company</span>
            <span class="font-extrabold text-slate-900 dark:text-white text-sm">${escapeHTML(entry.customerName || 'Valued Client')}</span>
            ${entry.customerGSTIN ? `<span class="block text-[11px] font-mono text-slate-500">GSTIN: ${escapeHTML(entry.customerGSTIN)}</span>` : ''}
            ${entry.customerAddress ? `<p class="text-[11px] text-slate-500 mt-1 whitespace-pre-line">${escapeHTML(entry.customerAddress)}</p>` : ''}
          </div>
          <div class="text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reference Number</span>
            <span class="font-mono font-black text-brand-600 dark:text-cyan-400 text-base">Quote #${entry.quoteNum}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Line Items</h4>
        <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-950 text-slate-500 font-bold uppercase text-[10px]">
                <th class="py-2 px-3 text-center w-10">#</th>
                <th class="py-2 px-3">Item Description</th>
                <th class="py-2 px-3 text-center">Qty</th>
                <th class="py-2 px-3 text-right">Unit Rate</th>
                <th class="py-2 px-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${productsList}
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <div class="w-full sm:w-64 space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <div class="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span class="font-mono">${formatINR(entry.subtotal || 0)}</span>
          </div>
          ${entry.taxAmount > 0 ? `
            <div class="flex justify-between text-slate-500">
              <span>Tax Amount:</span>
              <span class="font-mono">${formatINR(entry.taxAmount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
            <span>Grand Total:</span>
            <span class="font-mono font-black text-brand-600 dark:text-cyan-400 text-sm">${formatINR(entry.grandTotal || 0)}</span>
          </div>
        </div>
      </div>
    `;
  }

  const deleteBtn = document.getElementById('delete-directory-modal-btn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      deleteDirectoryQuote(id);
      closeViewDirectoryQuoteModal();
    };
  }

  const downloadModalBtn = document.getElementById('download-directory-modal-pdf-btn');
  if (downloadModalBtn) {
    downloadModalBtn.onclick = () => {
      downloadDirectoryQuotePDF(id);
    };
  }

  const loadBtn = document.getElementById('load-directory-quote-to-workspace-btn');
  if (loadBtn) {
    loadBtn.onclick = () => {
      loadDirectoryQuoteToWorkspace(id);
      closeViewDirectoryQuoteModal();
    };
  }

  if (DOM.viewDirectoryQuoteModal) DOM.viewDirectoryQuoteModal.classList.remove('hidden');
  lucide.createIcons();
}

function closeViewDirectoryQuoteModal() {
  if (DOM.viewDirectoryQuoteModal) DOM.viewDirectoryQuoteModal.classList.add('hidden');
  activeDirectoryQuoteId = null;
}

function loadDirectoryQuoteToWorkspace(id) {
  const entry = (state.savedQuotationsDirectory || []).find(e => e.id === id);
  if (!entry) return;

  if (Array.isArray(entry.selectedClients) && entry.selectedClients.length > 0) {
    state.selectedClients = JSON.parse(JSON.stringify(entry.selectedClients));
  } else if (entry.customerName && entry.customerName !== 'Valued Client') {
    state.customerName = entry.customerName || '';
    state.customerAddress = entry.customerAddress || '';
    state.customerGSTIN = entry.customerGSTIN || '';
  }

  updateAppliedClientsDisplay();

  if (Array.isArray(entry.products) && entry.products.length > 0) {
    state.products = JSON.parse(JSON.stringify(entry.products));
    state.products.forEach(p => { p.inQuote = true; });
  }

  if (typeof entry.cgstRate === 'number' && DOM.orgCalcCgstRate) {
    DOM.orgCalcCgstRate.value = entry.cgstRate;
  }
  if (typeof entry.sgstRate === 'number' && DOM.orgCalcSgstRate) {
    DOM.orgCalcSgstRate.value = entry.sgstRate;
  }
  if (typeof entry.igstRate === 'number' && DOM.orgCalcIgstRate) {
    DOM.orgCalcIgstRate.value = entry.igstRate > 0 ? entry.igstRate : '';
  }

  if (entry.companyName) {
    state.selectedCompany = entry.companyName;
    if (DOM.userDisplayOrg) DOM.userDisplayOrg.textContent = entry.companyName;
  }

  saveUserDataToServer();
  setOrgTab('quotation');
  renderOrgCalculatorView();

  showToast({
    title: 'Quote Loaded to Workspace',
    message: `Reference Quote #${entry.quoteNum} loaded into your live Quotation tab!`,
    type: 'success',
    duration: 3500
  });
}

function deleteDirectoryQuote(id) {
  if (!state.savedQuotationsDirectory) return;
  const idx = state.savedQuotationsDirectory.findIndex(e => e.id === id);
  if (idx !== -1) {
    const entry = state.savedQuotationsDirectory[idx];
    state.savedQuotationsDirectory.splice(idx, 1);

    state.savedQuotationsDirectory.forEach((e, index) => {
      e.quoteNum = index + 1;
    });

    saveUserDataToServer();
    renderQuotationDirectory();

    showToast({
      title: 'Directory Entry Deleted',
      message: `Quote #${entry ? entry.quoteNum : ''} reference removed from Quotation Directory.`,
      type: 'info',
      duration: 3000
    });
  }
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
      <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white">
        <div>${escapeHTML(client)}</div>
        ${tx.username ? `<span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">@${escapeHTML(tx.username)}</span>` : ''}
      </td>
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

  // Restore multi-product list or reconstruct product from quote
  if (Array.isArray(tx.products) && tx.products.length > 0) {
    state.products = JSON.parse(JSON.stringify(tx.products));
  } else {
    const prodName = tx.productName || 'Standard Product';
    const totalMaterials = (tx.bom || []).reduce((acc, item) => acc + (item.totalCost || 0), 0);
    const totalProcesses = (tx.processes || []).reduce((acc, item) => acc + (item.cost || 0), 0);
    const totalMisc = (tx.miscItems || []).reduce((acc, item) => acc + (item.cost || 0), 0);
    const subtotal = totalMaterials + totalProcesses + totalMisc;
    const profitAmount = subtotal * ((tx.profitPercentage || 0) / 100);
    const unitPrice = subtotal + profitAmount;
    
    state.products = [{
      id: 'prod_' + Date.now(),
      name: prodName,
      hsn: '7308',
      quantity: 1,
      unit: 'NOS',
      unitTotal: unitPrice,
      discount: 0,
      grandTotal: tx.grandTotal || unitPrice,
      profitPercentage: tx.profitPercentage || 0,
      bom: JSON.parse(JSON.stringify(tx.bom || [])),
      processes: JSON.parse(JSON.stringify(tx.processes || [])),
      miscItems: JSON.parse(JSON.stringify(tx.miscItems || [])),
      inQuote: true
    }];
  }

  // Restore clients for quote without overwriting master directory
  if (Array.isArray(tx.clients) && tx.clients.length > 0) {
    if (!state.clients) state.clients = [];
    tx.clients.forEach(tc => {
      if (!state.clients.some(sc => (sc.id && tc.id && sc.id === tc.id) || (sc.name && tc.name && sc.name.toLowerCase() === tc.name.toLowerCase()))) {
        state.clients.push(tc);
      }
    });
    state.selectedClients = JSON.parse(JSON.stringify(tx.selectedClients || tx.clients));
  } else if (tx.customerName && tx.customerName !== 'Valued Client') {
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

  // Restore tax rates
  if (typeof tx.cgstRate === 'number' && DOM.orgCalcCgstRate) {
    DOM.orgCalcCgstRate.value = tx.cgstRate;
  }
  if (typeof tx.sgstRate === 'number' && DOM.orgCalcSgstRate) {
    DOM.orgCalcSgstRate.value = tx.sgstRate;
  }
  if (typeof tx.igstRate === 'number' && DOM.orgCalcIgstRate) {
    DOM.orgCalcIgstRate.value = tx.igstRate > 0 ? tx.igstRate : '';
  }

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

  // 6. Switch view to Quotation Tab
  setOrgTab('quotation');
  renderOrgCalculatorView();

  showToast({
    title: 'Quotation Loaded for Editing',
    message: `Reference "${tx.id || ''}" for ${tx.customerName || 'Client'} is ready in Quotation tab.`,
    type: 'success'
  });
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

let oauth2TokenClient = null;

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
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true
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

function triggerGoogleOAuthPopup() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      if (!oauth2TokenClient) {
        oauth2TokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (!userinfoRes.ok) {
                  throw new Error('Failed to fetch user profile from Google.');
                }
                const userInfo = await userinfoRes.json();
                handleGoogleSignInCallback({
                  accessToken: tokenResponse.access_token,
                  userInfo: userInfo
                });
              } catch (err) {
                console.error('Google OAuth userinfo error:', err);
                if (DOM.authErrorMsg) {
                  DOM.authErrorMsg.querySelector('span').textContent = 'Google Authentication failed. Please try again.';
                  DOM.authErrorMsg.classList.remove('hidden');
                }
              }
            }
          }
        });
      }
      oauth2TokenClient.requestAccessToken();
    } catch (e) {
      console.error('Google OAuth popup error:', e);
      showToast({
        title: 'Google Sign-In',
        message: 'Unable to open Google sign-in window. Please check your browser popup blocker settings.',
        type: 'warning',
        duration: 4000
      });
    }
  } else {
    showToast({
      title: 'Google Sign-In',
      message: 'Google authentication service is initializing. Please try again in a moment or sign in with password.',
      type: 'info',
      duration: 3500
    });
  }
}

function handleCustomGoogleSignInClick() {
  if (window.google && window.google.accounts) {
    if (window.google.accounts.id) {
      try {
        let promptTriggered = false;
        window.google.accounts.id.prompt((notification) => {
          promptTriggered = true;
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const reason = notification.getNotDisplayedReason ? notification.getNotDisplayedReason() : 'prompt dismissed';
            console.warn('Google One Tap notice:', reason);
            triggerGoogleOAuthPopup();
          }
        });
        setTimeout(() => {
          if (!promptTriggered) {
            triggerGoogleOAuthPopup();
          }
        }, 500);
      } catch (err) {
        console.warn('Google One Tap exception, opening OAuth popup:', err);
        triggerGoogleOAuthPopup();
      }
    } else {
      triggerGoogleOAuthPopup();
    }
  } else {
    triggerGoogleOAuthPopup();
  }
}

// Re-render Google button on screen resize / orientation change for responsiveness
window.addEventListener('resize', () => {
  if (DOM.authOverlay && !DOM.authOverlay.classList.contains('hidden')) {
    renderGoogleButton();
  }
});

async function handleGoogleSignInCallback(response) {
  DOM.authErrorMsg.classList.add('hidden');
  
  try {
    const isRegisterOrg = (authMode === 'signup');
    const endpoint = isRegisterOrg ? '/api/auth/google/admin' : '/api/auth/google';
    
    let payloadBody = {};
    if (response.credential) {
      payloadBody.credential = response.credential;
    } else if (response.accessToken && response.userInfo) {
      payloadBody.accessToken = response.accessToken;
      payloadBody.userInfo = response.userInfo;
    } else {
      payloadBody = response;
    }

    if (isRegisterOrg) {
      if (DOM.authOrgGstin && DOM.authOrgGstin.value.trim()) {
        payloadBody.gstin = DOM.authOrgGstin.value.trim().toUpperCase();
      }
      if (DOM.authOrg && DOM.authOrg.value.trim()) {
        payloadBody.orgName = DOM.authOrg.value.trim();
      }
      if (DOM.authOrgEmail && DOM.authOrgEmail.value.trim()) {
        payloadBody.email = DOM.authOrgEmail.value.trim().toLowerCase();
      }
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadBody)
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
  if (DOM.orgSettingsSuccess) DOM.orgSettingsSuccess.classList.add('hidden');
  if (DOM.orgSettingsError) DOM.orgSettingsError.classList.add('hidden');

  const newOrgName = DOM.orgSettingsName ? DOM.orgSettingsName.value.trim() : '';
  const gstin = DOM.orgSettingsGstin ? DOM.orgSettingsGstin.value.trim().toUpperCase() : '';
  const website = DOM.orgSettingsWebsite ? DOM.orgSettingsWebsite.value.trim() : '';
  const address = DOM.orgSettingsAddress ? DOM.orgSettingsAddress.value.trim() : '';
  const declaration = DOM.orgSettingsDeclaration ? DOM.orgSettingsDeclaration.value.trim() : '';

  // Phones
  const phoneInputs = DOM.orgSettingsPhonesContainer ? DOM.orgSettingsPhonesContainer.querySelectorAll('.org-phone-input') : [];
  const phones = Array.from(phoneInputs).map(inp => inp.value.trim()).filter(Boolean);

  // Emails
  const emailInputs = DOM.orgSettingsEmailsContainer ? DOM.orgSettingsEmailsContainer.querySelectorAll('.org-email-input') : [];
  const emails = Array.from(emailInputs).map(inp => inp.value.trim().toLowerCase()).filter(Boolean);

  // Bank Details
  const bankDetails = {
    bankName: DOM.orgSettingsBankName ? DOM.orgSettingsBankName.value.trim() : '',
    accountNumber: DOM.orgSettingsBankAccount ? DOM.orgSettingsBankAccount.value.trim() : '',
    branch: DOM.orgSettingsBankBranch ? DOM.orgSettingsBankBranch.value.trim() : '',
    ifscCode: DOM.orgSettingsBankIfsc ? DOM.orgSettingsBankIfsc.value.trim().toUpperCase() : '',
    upiId: DOM.orgSettingsBankUpi ? DOM.orgSettingsBankUpi.value.trim() : ''
  };

  const accessCode = DOM.orgSettingsAccessCode ? DOM.orgSettingsAccessCode.value.trim() : '';

  if (!newOrgName) {
    if (DOM.orgSettingsError) {
      DOM.orgSettingsError.textContent = 'Organisation Name cannot be empty.';
      DOM.orgSettingsError.classList.remove('hidden');
    }
    return;
  }

  try {
    const res = await fetch('/api/org/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentOrgName: state.currentUser,
        newOrgName: newOrgName,
        gstin: gstin,
        website: website,
        address: address,
        declaration: declaration,
        logo: currentOrgLogoData,
        phones: phones,
        emails: emails,
        email: emails.length > 0 ? emails[0] : '',
        bankDetails: bankDetails,
        customAccessCode: accessCode
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const updatedName = data.name || newOrgName;
      localStorage.setItem('metal-current-user', updatedName);
      state.currentUser = updatedName;
      if (DOM.orgDisplayTitle) DOM.orgDisplayTitle.textContent = updatedName;
      if (DOM.orgUserDisplayName) DOM.orgUserDisplayName.textContent = updatedName;
      
      if (DOM.orgSettingsSuccess) {
        DOM.orgSettingsSuccess.textContent = 'Settings saved successfully!';
        DOM.orgSettingsSuccess.classList.remove('hidden');
      }

      showToast({
        title: 'Settings Saved',
        message: 'Settings updated successfully.',
        type: 'success'
      });
    } else {
      if (DOM.orgSettingsError) {
        DOM.orgSettingsError.textContent = data.error || 'Failed to update Organisation settings.';
        DOM.orgSettingsError.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Org Settings Update error:', err);
    if (DOM.orgSettingsError) {
      DOM.orgSettingsError.textContent = 'Server connection failed.';
      DOM.orgSettingsError.classList.remove('hidden');
    }
  }
}

// --- Theme Manager ---
function loadThemeSettings() {
  const colorScheme = localStorage.getItem("color-scheme");
  // Default to light theme unless explicitly chosen as 'dark'
  const isDark = colorScheme === "dark";
  
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  updateThemeToggleUI(isDark);
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
  if (DOM.themeToggleIconDark && DOM.themeToggleIconLight) {
    if (isDark) {
      DOM.themeToggleIconDark.classList.remove('hidden');
      DOM.themeToggleIconLight.classList.add('hidden');
    } else {
      DOM.themeToggleIconDark.classList.add('hidden');
      DOM.themeToggleIconLight.classList.remove('hidden');
    }
  }
  if (DOM.orgThemeToggleIconDark && DOM.orgThemeToggleIconLight) {
    if (isDark) {
      DOM.orgThemeToggleIconDark.classList.remove('hidden');
      DOM.orgThemeToggleIconLight.classList.add('hidden');
    } else {
      DOM.orgThemeToggleIconDark.classList.add('hidden');
      DOM.orgThemeToggleIconLight.classList.remove('hidden');
    }
  }
}

// --- Shape Selector Grid ---
function renderShapeGrid() {
  const grids = [DOM.shapeGrid, DOM.workingsShapeGrid].filter(Boolean);
  grids.forEach(grid => {
    grid.innerHTML = '';
    Object.keys(SHAPES).forEach(key => {
      const shape = SHAPES[key];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shape-btn flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer';
      button.setAttribute('data-shape-id', key);
      
      let iconStr = shape.icon;
      button.innerHTML = `
        <div class="text-slate-500 dark:text-slate-400 mb-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md group-hover:bg-brand-50 transition-colors">
          <i data-lucide="${iconStr}" class="w-4 h-4"></i>
        </div>
        <span class="text-[9px] font-bold text-slate-700 dark:text-slate-350 select-none leading-tight">${shape.name.split(' / ')[0]}</span>
      `;
      
      button.addEventListener('click', () => selectShape(key));
      grid.appendChild(button);
    });
  });

  // Populate SVGs into workings container if needed
  if (DOM.workingsSvgPreviewContainer && DOM.svgPreviewContainer && (DOM.workingsSvgPreviewContainer.children.length === 0 || !DOM.workingsSvgPreviewContainer.querySelector('svg'))) {
    DOM.workingsSvgPreviewContainer.innerHTML = DOM.svgPreviewContainer.innerHTML;
    DOM.workingsSvgPreviewContainer.querySelectorAll('svg[id]').forEach(svg => {
      const origId = svg.getAttribute('id');
      svg.setAttribute('id', `workings-${origId}`);
      svg.setAttribute('data-shape-id', origId.replace('svg-', ''));
    });
  }
}

function selectShape(shapeId) {
  state.activeShape = shapeId;
  if (DOM.shapeSelectMobile) DOM.shapeSelectMobile.value = shapeId;
  if (DOM.workingsShapeSelectMobile) DOM.workingsShapeSelectMobile.value = shapeId;
  if (DOM.activeShapeBadge) DOM.activeShapeBadge.textContent = SHAPES[shapeId].name;
  if (DOM.workingsActiveShapeBadge) DOM.workingsActiveShapeBadge.textContent = SHAPES[shapeId].name;

  document.querySelectorAll('#shape-grid button, #workings-shape-grid button').forEach(btn => {
    const btnShapeId = btn.getAttribute('data-shape-id');
    if (btnShapeId === shapeId) {
      btn.classList.add('shape-btn-active');
      const div = btn.querySelector('div');
      if (div) div.classList.add('bg-brand-100', 'text-brand-600', 'dark:bg-cyan-950/50', 'dark:text-cyan-400');
    } else {
      btn.classList.remove('shape-btn-active');
      const div = btn.querySelector('div');
      if (div) div.classList.remove('bg-brand-100', 'text-brand-600', 'dark:bg-cyan-950/50', 'dark:text-cyan-400');
    }
  });

  document.querySelectorAll('.shape-svg').forEach(svg => svg.classList.add('hidden'));
  document.querySelectorAll(`svg#svg-${shapeId}, svg#workings-svg-${shapeId}, svg[data-shape-id="${shapeId}"]`).forEach(svg => svg.classList.remove('hidden'));

  renderDimensionFields(shapeId);
  updateActivePresetGlobalButtonClass();
  calculate();
}

// --- Dynamic Form Builder ---
function renderDimensionFields(shapeId) {
  const shape = SHAPES[shapeId];
  const containers = [DOM.dimensionsContainer, DOM.workingsDimensionsContainer].filter(Boolean);
  containers.forEach(c => c.innerHTML = '');
  
  shape.fields.forEach(field => {
    let defaultUnit = field.defaultUnit;
    if (field.id !== 'length' && field.id !== 'thickness' && field.id !== 'wallThickness' && field.id !== 'flangeThickness' && field.id !== 'webThickness') {
      defaultUnit = state.globalUnit === 'mm' ? 'mm' : 'in';
    } else if (field.id === 'length') {
      defaultUnit = state.globalUnit === 'mm' ? 'mm' : 'in';
    }
    
    state.dimensions[field.id] = field.defaultVal;
    state.dimensions[`${field.id}Unit`] = defaultUnit;

    containers.forEach(container => {
      const wrapper = document.createElement('div');
      wrapper.className = 'space-y-1';
      
      wrapper.innerHTML = `
        <label class="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
          ${field.label}
        </label>
        <div class="flex shadow-sm rounded-lg">
          <input type="number" step="any" min="0" value="${field.defaultVal}" 
            class="w-full rounded-l-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-slate-950 dark:text-white focus:border-brand-500 focus:ring-brand-500 font-semibold shadow-sm text-xs" 
            data-field-id="${field.id}">
          <select class="rounded-r-lg border border-l-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 py-1.5 px-2 text-slate-700 dark:text-slate-350 font-bold focus:ring-brand-500 focus:border-brand-500 text-[11px] shadow-sm"
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
        const val = parseFloat(e.target.value) || 0;
        state.dimensions[field.id] = val;
        // Sync across containers
        document.querySelectorAll(`input[data-field-id="${field.id}"]`).forEach(inp => {
          if (inp !== e.target) inp.value = e.target.value;
        });
        updateSVGDimensionLabels();
        calculate();
      });
      
      input.addEventListener('focus', () => highlightSVGDimension(field.svgDim, true));
      input.addEventListener('blur', () => highlightSVGDimension(field.svgDim, false));
      
      select.addEventListener('change', (e) => {
        state.dimensions[`${field.id}Unit`] = e.target.value;
        document.querySelectorAll(`select[data-field-id="${field.id}"]`).forEach(sel => {
          if (sel !== e.target) sel.value = e.target.value;
        });
        updateSVGDimensionLabels();
        calculate();
      });

      container.appendChild(wrapper);
    });
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
    
    document.querySelectorAll(`select[data-field-id="${field.id}"]`).forEach(inputSelect => {
      inputSelect.value = targetUnit;
    });
    state.dimensions[`${field.id}Unit`] = targetUnit;
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
  const activeSvgs = document.querySelectorAll(`svg#svg-${state.activeShape}, svg#workings-svg-${state.activeShape}, svg[data-shape-id="${state.activeShape}"]`);
  if (!activeSvgs.length || !svgDimName) return;
  
  activeSvgs.forEach(activeSvg => {
    const targetGroup = activeSvg.querySelector(`g[data-dim-group="${svgDimName}"]`);
    if (targetGroup) {
      if (active) {
        targetGroup.classList.add('dim-highlight');
      } else {
        targetGroup.classList.remove('dim-highlight');
      }
    }
  });
}

function updateSVGDimensionLabels() {
  const activeSvgs = document.querySelectorAll(`svg#svg-${state.activeShape}, svg#workings-svg-${state.activeShape}, svg[data-shape-id="${state.activeShape}"]`);
  if (!activeSvgs.length) return;

  const shape = SHAPES[state.activeShape];
  activeSvgs.forEach(activeSvg => {
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
  });
}

// --- Material presets loader ---
// --- Material presets loader & Searchable Dropdown ---
function getActiveMaterialDisplayName() {
  if (state.activeMaterial === 'custom') {
    return `Custom (${Number(state.density).toFixed(2)} g/cm³)`;
  }
  const mat = MATERIALS.find(m => m.id === state.activeMaterial);
  return mat ? `${mat.name} (${mat.density.toFixed(2)} g/cm³)` : 'Steel (default) (7.85 g/cm³)';
}

function renderMaterialDropdownOptions(filterText = '', targetType = 'calculator') {
  const listEl = targetType === 'workings' ? DOM.workingsMaterialDropdownList : DOM.materialDropdownList;
  if (!listEl) return;
  listEl.innerHTML = '';

  const q = (filterText || '').trim().toLowerCase();
  const matches = MATERIALS.filter(m => {
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || String(m.density.toFixed(2)).includes(q);
  });

  if (matches.length === 0) {
    listEl.innerHTML = `
      <div class="p-3 text-center text-xs text-slate-400">
        No material presets found matching "${escapeHTML(filterText)}".
      </div>
    `;
    return;
  }

  matches.forEach(mat => {
    const isSelected = state.activeMaterial === mat.id;
    const priceData = state.metalPrices[mat.id];
    const priceBadge = priceData && priceData.available && priceData.pricePerKg
      ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shrink-0 ml-1 whitespace-nowrap">₹${formatMetalPrice(priceData.pricePerKg)}/kg</span>`
      : (mat.id === 'custom' ? '' : `<span class="text-[9px] text-slate-300 dark:text-slate-600 shrink-0 ml-1">—</span>`);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
      isSelected 
        ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-cyan-300 font-bold' 
        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
    }`;
    btn.innerHTML = `
      <span class="truncate">${escapeHTML(mat.name)}</span>
      <span class="flex items-center gap-1.5 shrink-0 ml-2">
        <span class="text-[10px] font-mono text-slate-400 dark:text-slate-500">${mat.density.toFixed(2)} g/cm³</span>
        ${priceBadge}
      </span>
    `;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectMaterialPreset(mat.id);
      hideAllMaterialDropdowns();
    });
    listEl.appendChild(btn);
  });
}

// Format metal price for display (e.g., 1520.50 → "1,520.50", 842500 → "8,42,500")
function formatMetalPrice(price) {
  if (!price || isNaN(price)) return '—';
  // Indian number formatting with ₹
  return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Fetch daily metal market prices from the server
async function loadMetalPrices() {
  try {
    const res = await fetch('/api/metal-prices');
    const data = await res.json();
    if (data.success && data.prices) {
      state.metalPrices = data.prices;
      state.metalPricesDate = data.date || null;
      state.metalPricesFetchedAt = data.fetchedAt || null;
      // Refresh the dropdown and price info
      updateMaterialPriceInfo();
    }
  } catch (err) {
    console.warn('[MetalPrices] Could not load metal prices:', err.message);
  }
}

// Update the market rate info line below the material selector
function updateMaterialPriceInfo() {
  const targets = [
    { el: DOM.materialPriceInfo },
    { el: DOM.workingsMaterialPriceInfo }
  ];
  
  const matId = state.activeMaterial;
  const priceData = state.metalPrices[matId];

  targets.forEach(({ el }) => {
    if (!el) return;
    if (!priceData || !priceData.available || !priceData.pricePerKg) {
      el.innerHTML = '';
      el.classList.add('hidden');
      return;
    }

    const dateStr = state.metalPricesDate
      ? new Date(state.metalPricesDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    const commodity = priceData.commodityName || priceData.symbol || '';
    
    el.innerHTML = `
      <i data-lucide="trending-up" class="w-3 h-3 text-emerald-500 shrink-0"></i>
      <span class="font-bold text-emerald-700 dark:text-emerald-400">₹${formatMetalPrice(priceData.pricePerKg)}/kg</span>
      <span class="text-slate-400 dark:text-slate-500">${commodity ? '• ' + escapeHTML(commodity) : ''}</span>
      ${dateStr ? `<span class="text-slate-300 dark:text-slate-600">• ${dateStr}</span>` : ''}
    `;
    el.classList.remove('hidden');
    lucide.createIcons({ nodes: [el] });
  });
}

function selectMaterialPreset(materialId) {
  const mat = MATERIALS.find(m => m.id === materialId);
  if (mat) {
    state.activeMaterial = mat.id;
    state.density = mat.density;
    syncMaterialPresetDisplays();
    if (DOM.densityInput) DOM.densityInput.value = mat.density;
    if (DOM.workingsDensityInput) DOM.workingsDensityInput.value = mat.density;
    updateMaterialPriceInfo();
    calculate();
  }
}

function syncMaterialPresetDisplays() {
  const displayVal = getActiveMaterialDisplayName();
  if (DOM.materialSearchInput) DOM.materialSearchInput.value = displayVal;
  if (DOM.workingsMaterialSearchInput) DOM.workingsMaterialSearchInput.value = displayVal;
  if (DOM.materialSelect) DOM.materialSelect.value = state.activeMaterial;
  if (DOM.workingsMaterialSelect) DOM.workingsMaterialSelect.value = state.activeMaterial;
  updateMaterialPriceInfo();
}

function hideAllMaterialDropdowns() {
  if (DOM.materialDropdownList) DOM.materialDropdownList.classList.add('hidden');
  if (DOM.workingsMaterialDropdownList) DOM.workingsMaterialDropdownList.classList.add('hidden');
}

function showMaterialDropdown(targetType = 'calculator') {
  hideAllMaterialDropdowns();
  const listEl = targetType === 'workings' ? DOM.workingsMaterialDropdownList : DOM.materialDropdownList;
  const inputEl = targetType === 'workings' ? DOM.workingsMaterialSearchInput : DOM.materialSearchInput;
  if (!listEl || !inputEl) return;
  
  renderMaterialDropdownOptions('', targetType);
  listEl.classList.remove('hidden');
}

function setupMaterialSearchEvents() {
  // Calculator Material Search
  if (DOM.materialSearchInput) {
    DOM.materialSearchInput.addEventListener('focus', () => {
      showMaterialDropdown('calculator');
      DOM.materialSearchInput.select();
    });
    DOM.materialSearchInput.addEventListener('input', (e) => {
      showMaterialDropdown('calculator');
      renderMaterialDropdownOptions(e.target.value, 'calculator');
    });
    DOM.materialSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideAllMaterialDropdowns();
        syncMaterialPresetDisplays();
      }
    });
  }
  if (DOM.materialDropdownToggleBtn) {
    DOM.materialDropdownToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.materialDropdownList && !DOM.materialDropdownList.classList.contains('hidden')) {
        hideAllMaterialDropdowns();
      } else {
        showMaterialDropdown('calculator');
        if (DOM.materialSearchInput) DOM.materialSearchInput.focus();
      }
    });
  }

  // Workings Material Search
  if (DOM.workingsMaterialSearchInput) {
    DOM.workingsMaterialSearchInput.addEventListener('focus', () => {
      showMaterialDropdown('workings');
      DOM.workingsMaterialSearchInput.select();
    });
    DOM.workingsMaterialSearchInput.addEventListener('input', (e) => {
      showMaterialDropdown('workings');
      renderMaterialDropdownOptions(e.target.value, 'workings');
    });
    DOM.workingsMaterialSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideAllMaterialDropdowns();
        syncMaterialPresetDisplays();
      }
    });
  }
  if (DOM.workingsMaterialDropdownToggleBtn) {
    DOM.workingsMaterialDropdownToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.workingsMaterialDropdownList && !DOM.workingsMaterialDropdownList.classList.contains('hidden')) {
        hideAllMaterialDropdowns();
      } else {
        showMaterialDropdown('workings');
        if (DOM.workingsMaterialSearchInput) DOM.workingsMaterialSearchInput.focus();
      }
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    const isInsideCalc = DOM.materialSearchInput && (DOM.materialSearchInput.contains(e.target) || (DOM.materialDropdownList && DOM.materialDropdownList.contains(e.target)) || (DOM.materialDropdownToggleBtn && DOM.materialDropdownToggleBtn.contains(e.target)));
    const isInsideWorkings = DOM.workingsMaterialSearchInput && (DOM.workingsMaterialSearchInput.contains(e.target) || (DOM.workingsMaterialDropdownList && DOM.workingsMaterialDropdownList.contains(e.target)) || (DOM.workingsMaterialDropdownToggleBtn && DOM.workingsMaterialDropdownToggleBtn.contains(e.target)));

    if (!isInsideCalc && !isInsideWorkings) {
      hideAllMaterialDropdowns();
      syncMaterialPresetDisplays();
    }
  });
}

function populateMaterialPresetsDropdown() {
  const selects = [DOM.materialSelect, DOM.workingsMaterialSelect].filter(Boolean);
  selects.forEach(select => {
    select.innerHTML = '';
    MATERIALS.forEach(mat => {
      const opt = document.createElement('option');
      opt.value = mat.id;
      opt.textContent = `${mat.name} (${mat.density.toFixed(2)} g/cm³)`;
      select.appendChild(opt);
    });
    select.value = state.activeMaterial;
  });
  
  syncMaterialPresetDisplays();
  if (DOM.densityInput) DOM.densityInput.value = state.density;
  if (DOM.workingsDensityInput) DOM.workingsDensityInput.value = state.density;
}

function handleMaterialChange(e) {
  const selectedId = e.target.value;
  selectMaterialPreset(selectedId);
}

function handleDensityInput(e) {
  const inputVal = parseFloat(e.target.value);
  if (!isNaN(inputVal) && inputVal > 0) {
    state.density = inputVal;
    state.activeMaterial = 'custom';
    syncMaterialPresetDisplays();
    if (DOM.densityInput && DOM.densityInput !== e.target) DOM.densityInput.value = inputVal;
    if (DOM.workingsDensityInput && DOM.workingsDensityInput !== e.target) DOM.workingsDensityInput.value = inputVal;
    calculate();
  }
}

// --- Pricing / Qty handlers ---
function handlePriceInput(e) {
  state.price = parseFloat(e.target.value) || 0;
  if (DOM.priceInput && DOM.priceInput !== e.target) DOM.priceInput.value = e.target.value;
  if (DOM.workingsPriceInput && DOM.workingsPriceInput !== e.target) DOM.workingsPriceInput.value = e.target.value;
  calculate();
}

function handlePriceUnitChange(e) {
  state.priceUnit = e.target.value;
  if (DOM.priceUnitSelect && DOM.priceUnitSelect !== e.target) DOM.priceUnitSelect.value = e.target.value;
  if (DOM.workingsPriceUnitSelect && DOM.workingsPriceUnitSelect !== e.target) DOM.workingsPriceUnitSelect.value = e.target.value;
  calculate();
}

function handleQuantityInput(e) {
  state.quantity = parseFloat(e.target.value) || 0;
  if (DOM.quantityInput && DOM.quantityInput !== e.target) DOM.quantityInput.value = e.target.value;
  if (DOM.workingsQuantityInput && DOM.workingsQuantityInput !== e.target) DOM.workingsQuantityInput.value = e.target.value;
  calculate();
}

function resetCalculatorFields() {
  selectShape(state.activeShape || 'round-bar');
  state.price = 0;
  state.quantity = 1;
  if (DOM.priceInput) DOM.priceInput.value = '';
  if (DOM.workingsPriceInput) DOM.workingsPriceInput.value = '';
  if (DOM.quantityInput) DOM.quantityInput.value = 1;
  if (DOM.workingsQuantityInput) DOM.workingsQuantityInput.value = 1;
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

  const primaryKgStr = batchWeightKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lbsStr = batchWeightLbs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const gStr = batchWeightGrams.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const tonnesStr = batchWeightTonnes.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const volStr = `${volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cm³`;
  const denStr = `${state.density.toFixed(2)} g/cm³`;
  const costRateBadgeStr = `Based on ₹ ${state.price.toFixed(2)}/${state.priceUnit} rate for ${state.quantity} pcs`;

  if (DOM.resultWeightPrimary) DOM.resultWeightPrimary.textContent = primaryKgStr;
  if (DOM.resultWeightUnit) DOM.resultWeightUnit.textContent = 'kg';
  if (DOM.resultWeightLbs) DOM.resultWeightLbs.textContent = lbsStr;
  if (DOM.resultWeightGrams) DOM.resultWeightGrams.textContent = gStr;
  if (DOM.resultWeightTonnes) DOM.resultWeightTonnes.textContent = tonnesStr;
  if (DOM.resultVolume) DOM.resultVolume.textContent = volStr;
  if (DOM.resultDensity) DOM.resultDensity.textContent = denStr;

  if (DOM.workingsResultWeightPrimary) DOM.workingsResultWeightPrimary.textContent = primaryKgStr;
  if (DOM.workingsResultWeightUnit) DOM.workingsResultWeightUnit.textContent = 'kg';
  if (DOM.workingsResultWeightLbs) DOM.workingsResultWeightLbs.textContent = lbsStr;
  if (DOM.workingsResultWeightGrams) DOM.workingsResultWeightGrams.textContent = gStr;
  if (DOM.workingsResultWeightTonnes) DOM.workingsResultWeightTonnes.textContent = tonnesStr;
  if (DOM.workingsResultVolume) DOM.workingsResultVolume.textContent = volStr;
  if (DOM.workingsResultDensity) DOM.workingsResultDensity.textContent = denStr;

  if (state.price > 0) {
    if (DOM.costResultCard) DOM.costResultCard.classList.remove('hidden');
    if (DOM.resultCost) DOM.resultCost.textContent = formatINR(cost);
    if (DOM.costRateBadge) DOM.costRateBadge.textContent = costRateBadgeStr;

    if (DOM.workingsCostResultCard) DOM.workingsCostResultCard.classList.remove('hidden');
    if (DOM.workingsResultCost) DOM.workingsResultCost.textContent = formatINR(cost);
    if (DOM.workingsCostRateBadge) DOM.workingsCostRateBadge.textContent = costRateBadgeStr;
  } else {
    if (DOM.costResultCard) DOM.costResultCard.classList.add('hidden');
    if (DOM.workingsCostResultCard) DOM.workingsCostResultCard.classList.add('hidden');
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

function getSavedBoughtOutItems() {
  let items = [];
  try {
    const raw = localStorage.getItem('metal-saved-bought-out-items');
    if (raw) items = JSON.parse(raw);
  } catch (e) {}

  if (!Array.isArray(items)) items = [];
  
  // Also collect from state.products and state.miscItems
  const known = new Set(items.map(i => (typeof i === 'string' ? i : i.name).trim().toLowerCase()));
  if (state.products) {
    state.products.forEach(p => {
      if (Array.isArray(p.miscItems)) {
        p.miscItems.forEach(m => {
          if (m && m.name && m.name.trim()) {
            const low = m.name.trim().toLowerCase();
            if (!known.has(low)) {
              known.add(low);
              items.push({ name: m.name.trim(), unitCost: m.unitCost || 0 });
            }
          }
        });
      }
    });
  }
  if (Array.isArray(state.miscItems)) {
    state.miscItems.forEach(m => {
      if (m && m.name && m.name.trim()) {
        const low = m.name.trim().toLowerCase();
        if (!known.has(low)) {
          known.add(low);
          items.push({ name: m.name.trim(), unitCost: m.unitCost || 0 });
        }
      }
    });
  }
  return items;
}

function saveBoughtOutItem(name, unitCost) {
  if (!name || !name.trim()) return;
  const cleanName = name.trim();
  let items = [];
  try {
    const raw = localStorage.getItem('metal-saved-bought-out-items');
    if (raw) items = JSON.parse(raw);
  } catch (e) {}
  if (!Array.isArray(items)) items = [];

  const existingIdx = items.findIndex(i => (typeof i === 'string' ? i : i.name).toLowerCase() === cleanName.toLowerCase());
  const entry = { name: cleanName, unitCost: typeof unitCost === 'number' && unitCost > 0 ? unitCost : 0 };
  if (existingIdx >= 0) {
    if (entry.unitCost > 0) items[existingIdx] = entry;
  } else {
    items.unshift(entry);
  }

  items = items.slice(0, 100);
  try {
    localStorage.setItem('metal-saved-bought-out-items', JSON.stringify(items));
  } catch (e) {}

  updateBoughtOutDatalist();
}

function updateBoughtOutDatalist() {
  let datalistEl = document.getElementById('misc-datalist-options');
  if (!datalistEl) {
    datalistEl = document.createElement('datalist');
    datalistEl.id = 'misc-datalist-options';
    document.body.appendChild(datalistEl);
  }
  datalistEl.innerHTML = '';
  const items = getSavedBoughtOutItems();
  items.forEach(it => {
    const name = typeof it === 'string' ? it : it.name;
    const unitCost = typeof it === 'object' && it.unitCost ? it.unitCost : 0;
    const opt = document.createElement('option');
    opt.value = name;
    if (unitCost > 0) opt.label = `₹${unitCost.toFixed(2)}`;
    datalistEl.appendChild(opt);
  });
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
          <input type="number" min="0" step="any" value="${proc.duration}" class="table-input text-center w-14 font-bold" data-proc-id="${proc.id}" data-prop="duration">
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
        const val = parseFloat(e.target.value) || 0;
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
  updateBoughtOutDatalist();
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
          <input 
            type="text" 
            list="misc-datalist-options"
            value="${escapeHTML(item.name || '')}" 
            placeholder="Search or type item..." 
            class="table-input font-bold text-slate-800 dark:text-white w-full max-w-[200px]" 
            data-misc-id="${item.id}" 
            data-prop="name"
            autocomplete="off"
          >
        </td>
        <td class="py-2.5 px-3 text-center">
          <input type="number" min="0" step="any" value="${item.qty}" class="table-input text-center w-12 font-bold" data-misc-id="${item.id}" data-prop="qty">
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

      const nameInput = row.querySelector('input[data-prop="name"]');
      const unitCostInput = row.querySelector('input[data-prop="unitCost"]');

      const handleNameUpdate = (e) => {
        const val = e.target.value.trim();
        item.name = val;
        
        // Check if matching saved item with unitCost
        const savedList = getSavedBoughtOutItems();
        const matched = savedList.find(s => (typeof s === 'string' ? s : s.name).toLowerCase() === val.toLowerCase());
        if (matched && typeof matched === 'object' && matched.unitCost > 0 && (!item.unitCost || item.unitCost === 0)) {
          item.unitCost = matched.unitCost;
          if (unitCostInput) unitCostInput.value = matched.unitCost;
        }

        saveBoughtOutItem(val, item.unitCost);
        item.cost = item.qty * item.unitCost;
        saveMiscToStorage();
      };

      nameInput.addEventListener('change', handleNameUpdate);
      nameInput.addEventListener('input', (e) => {
        item.name = e.target.value;
        const savedList = getSavedBoughtOutItems();
        const matched = savedList.find(s => (typeof s === 'string' ? s : s.name).toLowerCase() === e.target.value.trim().toLowerCase());
        if (matched && typeof matched === 'object' && matched.unitCost > 0 && (!item.unitCost || item.unitCost === 0)) {
          item.unitCost = matched.unitCost;
          if (unitCostInput) unitCostInput.value = matched.unitCost;
          item.cost = item.qty * item.unitCost;
          saveMiscToStorage();
        }
      });

      row.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
          const prop = e.target.getAttribute('data-prop');
          let val = e.target.value;
          if (prop === 'qty') val = parseFloat(val) || 0;
          if (prop === 'unitCost') {
            val = parseFloat(val) || 0;
            saveBoughtOutItem(item.name, val);
          }
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
          <input type="number" min="0" step="any" value="${item.quantity}" class="table-input text-center w-16 font-bold" data-qty-item-id="${item.id}">
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
        const newQty = parseFloat(e.target.value) || 0;
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
      3. Other Expenses (Bought Out / Packaging)
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
              Bought Out / Consumables
            </span>
          </div>
        </td>
        <td class="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-medium">
          ${item.qty}
        </td>
        <td class="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono">
          ₹${(item.unitCost || 0).toFixed(2)}
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
  if (!state.currentUser) return;
  const orgName = (state.currentUserType === 'org' ? state.currentUser : (state.userOrg || localStorage.getItem('metal-current-org') || state.currentUser));
  const companyName = state.selectedCompany || orgName;
  
  const clientName = activeClient ? activeClient.name : (state.customerName || "Valued Client");
  const clientAddress = activeClient ? activeClient.address : (state.customerAddress || "");
  const clientGSTIN = activeClient ? activeClient.gstin : (state.customerGSTIN || "");

  let prodName = '';
  if (state.products && state.products.length > 0) {
    prodName = state.products
      .filter(p => p.inQuote !== false)
      .map(p => (p.name || '').trim())
      .filter(Boolean)
      .join(', ');
  }
  if (!prodName) {
    const act = getActiveProduct();
    prodName = (act && act.name) ? act.name : (state.products && state.products[0] && state.products[0].name ? state.products[0].name : 'Metal Quotation');
  }

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
    bom: JSON.parse(JSON.stringify(state.bom || [])),
    processes: JSON.parse(JSON.stringify(state.processes || [])),
    miscItems: JSON.parse(JSON.stringify(state.miscItems || [])),
    products: Array.isArray(state.products) ? JSON.parse(JSON.stringify(state.products)) : [],
    clients: Array.isArray(state.clients) ? JSON.parse(JSON.stringify(state.clients)) : [],
    selectedClients: Array.isArray(state.selectedClients) ? JSON.parse(JSON.stringify(state.selectedClients)) : [],
    cgstRate: DOM.orgCalcCgstRate ? (parseFloat(DOM.orgCalcCgstRate.value) || 0) : 0,
    sgstRate: DOM.orgCalcSgstRate ? (parseFloat(DOM.orgCalcSgstRate.value) || 0) : 0,
    igstRate: DOM.orgCalcIgstRate ? (parseFloat(DOM.orgCalcIgstRate.value) || 0) : 0,
    grandTotal: grandTotal
  };
  
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });
    if (response.ok) {
      await fetchAndRenderOrgDashboardData();
    } else {
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

function getActiveClient() {
  if (state.selectedClients && state.selectedClients.length > 0) {
    return state.selectedClients[0];
  }
  if (state.customerName) {
    return {
      name: state.customerName,
      address: state.customerAddress || '',
      gstin: state.customerGSTIN || '',
      email: ''
    };
  }
  if (state.clients && state.clients.length > 0) {
    return state.clients[0];
  }
  return null;
}

async function getOrgProfileData(orgName) {
  const targetOrg = orgName || state.currentUser;
  if (!targetOrg) return null;
  if (state.orgProfile && (state.orgProfile.name === targetOrg || state.orgProfile.legalName === targetOrg)) {
    return state.orgProfile;
  }
  try {
    const res = await fetch(`/api/org/profile?orgName=${encodeURIComponent(targetOrg)}`);
    const data = await res.json();
    if (res.ok && data.success) {
      state.orgProfile = data;
      return data;
    }
  } catch (err) {
    console.error('Error fetching org profile for PDF:', err);
  }
  return state.orgProfile || null;
}

// // --- 10 Quotation PDF Themes Catalog ---
const PDF_THEMES = [
  {
    id: 'modern-blue',
    name: 'Modern Executive',
    tagline: 'Classic light blue headers with bold crimson branding and boxed frame (Ref 1)',
    primaryColor: [204, 0, 0],       // #cc0000
    headerFill: [218, 232, 248],     // #dae8f8
    headerText: [15, 23, 42],        // #0f172a
    borderColor: [30, 41, 59],       // #1e293b
    totalFill: [235, 243, 255],      // #ebf3ff
    totalText: [15, 23, 42],
    swatchPrimary: '#cc0000',
    swatchHeader: '#dae8f8',
    swatchBorder: '#1e293b'
  },
  {
    id: 'industrial-grid',
    name: 'Industrial Classic',
    tagline: 'Heavy black grid frame, centered header, split declaration & bank box (Ref 2)',
    primaryColor: [204, 0, 0],
    headerFill: [241, 245, 249],     // #f1f5f9
    headerText: [15, 23, 42],
    borderColor: [0, 0, 0],          // Pure Black Box
    totalFill: [248, 250, 252],
    totalText: [0, 0, 0],
    swatchPrimary: '#cc0000',
    swatchHeader: '#f1f5f9',
    swatchBorder: '#000000'
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy Banner',
    tagline: 'Solid Navy header banner, white company title, clean cyan accents',
    primaryColor: [15, 23, 42],      // #0f172a
    headerFill: [15, 23, 42],        // Solid Navy
    headerText: [255, 255, 255],    // White
    borderColor: [51, 65, 85],
    totalFill: [224, 242, 254],      // #e0f2fe
    totalText: [12, 74, 110],
    swatchPrimary: '#0f172a',
    swatchHeader: '#0f172a',
    swatchBorder: '#334155'
  },
  {
    id: 'minimal-charcoal',
    name: 'Minimalist Charcoal',
    tagline: 'Sleek borderless design, charcoal headers, subtle line dividers',
    primaryColor: [51, 65, 85],      // #334155
    headerFill: [241, 245, 249],     // #f1f5f9
    headerText: [30, 41, 59],
    borderColor: [226, 232, 240],    // Light slate border
    totalFill: [241, 245, 249],
    totalText: [15, 23, 42],
    swatchPrimary: '#334155',
    swatchHeader: '#f1f5f9',
    swatchBorder: '#e2e8f0'
  },
  {
    id: 'slate-tech',
    name: 'Slate Tech Modern',
    tagline: 'Tech-focused dark slate styling, cyan line item callouts',
    primaryColor: [2, 112, 194],     // #0270c2
    headerFill: [30, 41, 59],        // #1e293b
    headerText: [255, 255, 255],
    borderColor: [30, 41, 59],
    totalFill: [224, 242, 254],
    totalText: [3, 89, 157],
    swatchPrimary: '#0270c2',
    swatchHeader: '#1e293b',
    swatchBorder: '#1e293b'
  },
  {
    id: 'emerald-business',
    name: 'Emerald Business',
    tagline: 'Forest emerald green header accents with mint total callout box',
    primaryColor: [5, 150, 105],     // #059669
    headerFill: [209, 250, 229],     // #d1fae5
    headerText: [6, 78, 59],
    borderColor: [16, 185, 129],
    totalFill: [236, 253, 245],
    totalText: [4, 120, 87],
    swatchPrimary: '#059669',
    swatchHeader: '#d1fae5',
    swatchBorder: '#10b981'
  },
  {
    id: 'indigo-premium',
    name: 'Indigo Premium',
    tagline: 'Executive indigo accents with soft violet subtotals card',
    primaryColor: [79, 70, 229],     // #4f46e5
    headerFill: [238, 242, 255],     // #eef2ff
    headerText: [49, 46, 129],
    borderColor: [99, 102, 241],
    totalFill: [224, 231, 255],
    totalText: [67, 56, 202],
    swatchPrimary: '#4f46e5',
    swatchHeader: '#eef2ff',
    swatchBorder: '#6366f1'
  },
  {
    id: 'steel-metallic',
    name: 'Steel Heavy Metallic',
    tagline: 'Heavy engineered steel borders, bold metallic section blocks',
    primaryColor: [30, 41, 59],      // #1e293b
    headerFill: [203, 213, 225],     // #cbd5e1
    headerText: [15, 23, 42],
    borderColor: [71, 85, 105],
    totalFill: [226, 232, 240],
    totalText: [15, 23, 42],
    swatchPrimary: '#1e293b',
    swatchHeader: '#cbd5e1',
    swatchBorder: '#475569'
  },
  {
    id: 'crimson-executive',
    name: 'Crimson Bold',
    tagline: 'Deep crimson header bar with rose accent blocks',
    primaryColor: [185, 28, 28],     // #b91c1c
    headerFill: [254, 226, 226],     // #fee2e2
    headerText: [127, 29, 29],
    borderColor: [220, 38, 38],
    totalFill: [255, 228, 230],
    totalText: [159, 18, 57],
    swatchPrimary: '#b91c1c',
    swatchHeader: '#fee2e2',
    swatchBorder: '#dc2626'
  },
  {
    id: 'cyber-monochrome',
    name: 'Cyber Dark Modern',
    tagline: 'High-contrast monochrome layout with silver table headers',
    primaryColor: [15, 23, 42],      // #0f172a
    headerFill: [241, 245, 249],     // #f1f5f9
    headerText: [15, 23, 42],
    borderColor: [148, 163, 184],
    totalFill: [248, 250, 252],
    totalText: [15, 23, 42],
    swatchPrimary: '#0f172a',
    swatchHeader: '#f1f5f9',
    swatchBorder: '#94a3b8'
  }
];

function renderPdfThemeCards() {
  const container = document.getElementById('pdf-theme-cards-container');
  if (!container) return;

  const activeThemeId = state.selectedPdfTheme || 'modern-blue';
  const activeTheme = PDF_THEMES.find(t => t.id === activeThemeId) || PDF_THEMES[0];

  const activeThemeNameEl = document.getElementById('active-theme-name-display');
  if (activeThemeNameEl) activeThemeNameEl.textContent = activeTheme.name;

  container.innerHTML = PDF_THEMES.map(theme => {
    const isSelected = theme.id === activeThemeId;
    return `
      <div data-theme-id="${theme.id}" class="pdf-theme-card relative p-4 rounded-2xl border ${isSelected ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/40 ring-2 ring-brand-500/30' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'} shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              ${escapeHTML(theme.name)}
            </h4>
            ${isSelected ? `
              <span class="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-brand-600 text-white flex items-center gap-1">
                <i data-lucide="check" class="w-3 h-3"></i> Selected
              </span>
            ` : ''}
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">${escapeHTML(theme.tagline)}</p>
        </div>

        <!-- Visual Color Swatches Preview -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full border border-slate-300 shadow-xs" style="background-color: ${theme.swatchPrimary};" title="Primary Branding Color"></div>
            <div class="w-4 h-4 rounded-full border border-slate-300 shadow-xs" style="background-color: ${theme.swatchHeader};" title="Table Header Fill"></div>
            <div class="w-4 h-4 rounded-full border border-slate-300 shadow-xs" style="background-color: ${theme.swatchBorder};" title="Frame Border Color"></div>
          </div>
          <button type="button" class="text-[11px] font-bold text-brand-600 dark:text-cyan-400 group-hover:underline flex items-center gap-1">
            ${isSelected ? 'Active' : 'Apply Theme'} <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.pdf-theme-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const themeId = e.currentTarget.getAttribute('data-theme-id');
      selectPdfTheme(themeId);
    });
  });

  lucide.createIcons();
}

function selectPdfTheme(themeId) {
  state.selectedPdfTheme = themeId;
  localStorage.setItem('metal-pdf-theme', themeId);
  renderPdfThemeCards();

  // If email quote modal is open, refresh live preview iframe
  const emailModal = document.getElementById('email-quote-modal');
  if (emailModal && !emailModal.classList.contains('hidden')) {
    updateEmailModalPdfPreview();
  }

  showToast(`PDF Quotation theme changed to ${PDF_THEMES.find(t => t.id === themeId)?.name || 'selected theme'}.`, 'success');
}

function openPdfThemeSelectModal() {
  renderPdfThemeCards();
  const modal = document.getElementById('pdf-theme-select-modal');
  if (modal) modal.classList.remove('hidden');
}

function closePdfThemeSelectModal() {
  const modal = document.getElementById('pdf-theme-select-modal');
  if (modal) modal.classList.add('hidden');
}

// --- PDF Quotation Generator (Executive Product Table + Optional Workings Pages) ---
function generateQuotePDFDoc(txData = null, targetClient = null, includeWorkingsPages = false, orgProfile = null, overrideThemeId = null) {
  if (txData && (txData instanceof Event || txData.preventDefault)) {
    txData = null;
  }
  const isHistoryExport = txData !== null;
  const creator = isHistoryExport ? txData.username : state.currentUser;

  // Resolve PDF Theme
  const themeId = overrideThemeId || state.selectedPdfTheme || 'modern-blue';
  const theme = PDF_THEMES.find(t => t.id === themeId) || PDF_THEMES[0];

  // Group products to render in PDF
  let productList = [];

  if (isHistoryExport) {
    if (Array.isArray(txData.products) && txData.products.length > 0) {
      productList = txData.products.map(p => ({
        name: p.name || 'Quoted Product',
        hsnCode: p.hsnCode || p.hsn || '732690',
        quantity: typeof p.quantity === 'number' && p.quantity > 0 ? p.quantity : 1,
        unit: (p.unit || 'NOS').toUpperCase(),
        unitTotal: typeof p.unitTotal === 'number' && p.unitTotal > 0 ? p.unitTotal : 0,
        discount: typeof p.discount === 'number' ? p.discount : 0,
        grandTotal: typeof p.grandTotal === 'number' && p.grandTotal > 0 ? p.grandTotal : 0,
        bom: p.bom || [],
        processes: p.processes || [],
        miscItems: p.miscItems || [],
        profitPercentage: p.profitPercentage || 0
      }));
    } else {
      productList = [{
        name: txData.productName || 'Quoted Product',
        hsnCode: txData.hsnCode || '732690',
        quantity: 1,
        unit: txData.unit || 'NOS',
        unitTotal: txData.unitTotal || txData.amount || 0,
        discount: txData.discount || 0,
        grandTotal: txData.amount || 0,
        bom: txData.bom || [],
        processes: txData.processes || [],
        miscItems: txData.miscItems || [],
        profitPercentage: 0
      }];
    }
  } else if (state.products && state.products.length > 0) {
    productList = state.products
      .filter(p => p.inQuote !== false)
      .map(p => ({
        name: p.name,
        hsnCode: p.hsnCode || p.hsn || '732690',
        quantity: typeof p.quantity === 'number' && p.quantity > 0 ? p.quantity : 1,
        unit: (p.unit || 'NOS').toUpperCase(),
        unitTotal: typeof p.unitTotal === 'number' && p.unitTotal > 0 ? p.unitTotal : 0,
        discount: typeof p.discount === 'number' ? p.discount : 0,
        grandTotal: typeof p.grandTotal === 'number' && p.grandTotal > 0 ? p.grandTotal : 0,
        bom: p.bom || [],
        processes: p.processes || [],
        miscItems: p.miscItems || [],
        profitPercentage: p.profitPercentage || 0
      }));
  } else {
    productList = [{
      name: 'Quoted Product',
      hsnCode: '732690',
      quantity: 1,
      unit: 'NOS',
      unitTotal: 0,
      discount: 0,
      grandTotal: 0,
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
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const activeProfile = getActiveCompanyProfile(isHistoryExport, txData, orgProfile);
  const displayCompanyName = activeProfile.name || 'ARGUS TECHNOLOGIES';

  const orgGstin = activeProfile.gstin || (DOM.orgSettingsGstin ? DOM.orgSettingsGstin.value.trim() : '') || '33CZEPS8675J1ZN';
  const orgPhones = (activeProfile.phones && activeProfile.phones.length > 0 ? activeProfile.phones : ['9092992995', '99444 84944']);
  const orgAddress = activeProfile.address || (DOM.orgSettingsAddress ? DOM.orgSettingsAddress.value.trim() : '') || 'SF NO.515, Bharathiyar Road, Maniyakaranpalayam, Ganapathy (PO), Coimbatore - 641 006.';
  const orgEmail = (activeProfile.emails && activeProfile.emails.length > 0 ? activeProfile.emails[0] : (DOM.orgSettingsEmail ? DOM.orgSettingsEmail.value.trim() : '')) || 'info@arguscnc.com';
  const orgWebsite = activeProfile.website || (DOM.orgSettingsWebsite ? DOM.orgSettingsWebsite.value.trim() : '') || 'https://www.arguscnc.com';
  const orgLogo = activeProfile.logo || currentOrgLogoData || '';
  const bankDetails = (activeProfile.bankDetails && activeProfile.bankDetails.bankName) ? activeProfile.bankDetails : {
    bankName: 'CANARA BANK',
    accountNumber: '61381400000639',
    branch: 'PANKAJAMILLS',
    ifscCode: 'CNRB0016138',
    upiId: ''
  };
  const orgDeclaration = activeProfile.declaration || (DOM.orgSettingsDeclaration ? DOM.orgSettingsDeclaration.value.trim() : '') || 'We declare that this quotation shows the actual price of the goods described and that all particulars are true and correct. GST will be charged additionally.\nA 50% advance is payable on order confirmation, and the balance on delivery.\nAll our Transactions are subject to Coimbatore Jurisdiction.';

  const dateStr = isHistoryExport ? txData.date.split(',')[0] : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const quoteNum = isHistoryExport ? txData.id : `Q/${new Date().getFullYear().toString().slice(-2)}/${Date.now().toString().slice(-5)}`;

  // Prepared For (Client Details)
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
      name: state.customerName || (DOM.customerNameInput ? DOM.customerNameInput.value.trim() : "Valued Client"),
      address: state.customerAddress || (DOM.customerAddressInput ? DOM.customerAddressInput.value.trim() : ""),
      gstin: state.customerGSTIN || (DOM.customerGSTINInput ? DOM.customerGSTINInput.value.trim() : "")
    }];
  }

  const primaryClient = clientsToRender[0] || { name: 'Valued Client', address: '', gstin: '' };

  // Frame Coordinates
  const frameX = 14;
  const frameWidth = 182;
  const frameEndX = frameX + frameWidth; // 196
  const topY = 12;

  // ==========================================
  // --- PAGE 1: COMMERCIAL QUOTATION ---
  // ==========================================
  
  // 1. Top Bar: GSTIN (Left) & Cell (Right)
  doc.setDrawColor(theme.borderColor[0], theme.borderColor[1], theme.borderColor[2]);
  doc.setLineWidth(0.35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`GSTIN : ${orgGstin}`, frameX + 2, topY + 4.5);
  doc.text(`Cell : ${orgPhones.join(', ')}`, frameEndX - 2, topY + 4.5, { align: 'right' });

  // Divider below top bar
  const headerDivY = topY + 6.5; // 18.5
  doc.line(frameX, headerDivY, frameEndX, headerDivY);

  // Corporate Navy Solid Header Banner Option
  if (theme.id === 'corporate-navy') {
    doc.setFillColor(theme.headerFill[0], theme.headerFill[1], theme.headerFill[2]);
    doc.rect(frameX, headerDivY, frameWidth, 23.5, 'F');
  }

  // 2. Center Header: QUOTATION
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  if (theme.id === 'corporate-navy') {
    doc.setTextColor(255, 255, 255);
  } else {
    doc.setTextColor(theme.headerText[0], theme.headerText[1], theme.headerText[2]);
  }
  doc.text("QUOTATION", 105, headerDivY + 4.5, { align: "center" });

  // 3. Company Logo & Branding Info
  let hasLogo = false;
  if (orgLogo && typeof orgLogo === 'string' && orgLogo.startsWith('data:image')) {
    try {
      const format = orgLogo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(orgLogo, format, frameX + 2, headerDivY + 5.5, 22, 16, undefined, 'FAST');
      hasLogo = true;
    } catch (e) {
      console.warn('Could not add logo to PDF:', e);
      hasLogo = false;
    }
  }

  const compInfoX = hasLogo ? frameX + 26 : 105;
  const compAlign = hasLogo ? 'left' : 'center';

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  if (theme.id === 'corporate-navy') {
    doc.setTextColor(255, 255, 255);
  } else {
    doc.setTextColor(theme.primaryColor[0], theme.primaryColor[1], theme.primaryColor[2]);
  }
  doc.text(displayCompanyName.toUpperCase(), compInfoX, headerDivY + 11, { align: compAlign });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  if (theme.id === 'corporate-navy') {
    doc.setTextColor(226, 232, 240);
  } else {
    doc.setTextColor(51, 65, 85);
  }
  doc.text(orgAddress, compInfoX, headerDivY + 16, { align: compAlign, maxWidth: hasLogo ? 152 : 178 });

  const contactLine = [
    orgEmail ? `E-mail : ${orgEmail}` : '',
    orgWebsite ? `Website : ${orgWebsite}` : ''
  ].filter(Boolean).join('   |   ');
  if (contactLine) {
    doc.text(contactLine, compInfoX, headerDivY + 20.5, { align: compAlign });
  }

  // Divider below Company Header
  const clientSectionY = headerDivY + 23.5; // 42
  doc.line(frameX, clientSectionY, frameEndX, clientSectionY);

  // 4. Client Details (Left) vs Quotation Meta (Right)
  const clientSectionHeight = 28;
  const clientSectionEndY = clientSectionY + clientSectionHeight; // 70
  const metaSplitX = 124;

  // Vertical split between Client Details and Quotation Meta
  doc.line(metaSplitX, clientSectionY, metaSplitX, clientSectionEndY);

  // Left Column - Client Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(clientsToRender.length > 1 ? `Client Details (${clientsToRender.length} Recipients):` : "Client Details:", frameX + 2, clientSectionY + 4.5);

  if (clientsToRender.length === 1) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(primaryClient.name.toUpperCase(), frameX + 2, clientSectionY + 9.5, { maxWidth: metaSplitX - frameX - 4 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(primaryClient.address || '', frameX + 2, clientSectionY + 14, { maxWidth: metaSplitX - frameX - 4, lineHeightFactor: 1.15 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Client's GSTIN: ${primaryClient.gstin || '-'}`, frameX + 2, clientSectionEndY - 2.5);
  } else {
    let currClientY = clientSectionY + 9;
    clientsToRender.slice(0, 2).forEach((cl, i) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${i + 1}. ${cl.name.toUpperCase()}`, frameX + 2, currClientY, { maxWidth: metaSplitX - frameX - 4 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(cl.address || '', frameX + 5, currClientY + 3.5, { maxWidth: metaSplitX - frameX - 7 });
      currClientY += 8;
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(`Client's GSTIN: ${primaryClient.gstin || '-'}`, frameX + 2, clientSectionEndY - 2.5);
  }

  // Right Column - Quotation Meta (Quotation No & Date)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Quotation No  :", metaSplitX + 3, clientSectionY + 6.5);
  doc.text("Date          :", metaSplitX + 3, clientSectionY + 14.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(quoteNum, metaSplitX + 28, clientSectionY + 6.5);
  doc.text(dateStr, metaSplitX + 28, clientSectionY + 14.5);

  // 5. Line Items Table (autoTable)
  const tableHeaders = [['SL.NO', 'HSN / SAC CODE', 'DESCRIPTION', 'QUANTITY', 'UNIT', 'PRICE', 'AMOUNT(Rs.)']];
  
  let subtotalAll = 0;
  const tableRows = productList.map((prod, pIdx) => {
    const prodQty = typeof prod.quantity === 'number' && prod.quantity > 0 ? prod.quantity : 1;
    const hsn = prod.hsnCode || '732690';
    const desc = prod.name || `Product ${pIdx + 1}`;
    const unit = (prod.unit || 'NOS').toUpperCase();

    let unitPrice = prod.unitTotal || 0;
    if (unitPrice <= 0) {
      const unitMaterials = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
      const unitProcesses = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
      const unitMisc = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
      const unitSubtotal = unitMaterials + unitProcesses + unitMisc;
      const unitProfit = unitSubtotal * ((prod.profitPercentage || 0) / 100);
      unitPrice = unitSubtotal + unitProfit;
    }

    const discountPct = typeof prod.discount === 'number' ? prod.discount : 0;
    const lineTotalBeforeDisc = unitPrice * prodQty;
    const lineDiscountAmt = lineTotalBeforeDisc * (discountPct / 100);
    const lineFinalAmount = prod.grandTotal > 0 && Math.abs(prod.grandTotal - (lineTotalBeforeDisc - lineDiscountAmt)) < 1
      ? prod.grandTotal
      : Math.max(0, lineTotalBeforeDisc - lineDiscountAmt);

    subtotalAll += lineFinalAmount;

    return [
      pIdx + 1,
      hsn,
      desc,
      prodQty,
      unit,
      formatNumber(unitPrice),
      formatNumber(lineFinalAmount)
    ];
  });

  const cgstRate = DOM.orgCalcCgstRate ? (parseFloat(DOM.orgCalcCgstRate.value) || 0) : 9;
  const sgstRate = DOM.orgCalcSgstRate ? (parseFloat(DOM.orgCalcSgstRate.value) || 0) : 9;
  const igstRate = DOM.orgCalcIgstRate ? (parseFloat(DOM.orgCalcIgstRate.value) || 0) : 0;
  const cgstAmount = igstRate > 0 ? 0 : subtotalAll * (cgstRate / 100);
  const sgstAmount = igstRate > 0 ? 0 : subtotalAll * (sgstRate / 100);
  const igstAmount = igstRate > 0 ? subtotalAll * (igstRate / 100) : 0;
  const rawGrandTotal = subtotalAll + cgstAmount + sgstAmount + igstAmount;
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = roundedGrandTotal - rawGrandTotal;

  // Taxes and Totals Foot Rows
  const tableFoot = [
    [
      { content: 'Total Amount Before Tax', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fontSize: 7.5, cellPadding: { top: 1.5, right: 3, bottom: 1.5, left: 3 } } },
      { content: formatNumber(subtotalAll), styles: { halign: 'right', fontStyle: 'bold', fontSize: 7.5, cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 } } }
    ]
  ];

  if (igstRate > 0) {
    tableFoot.push([
      { content: `Add : IGST     ${igstRate} %`, colSpan: 6, styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 3, bottom: 1.2, left: 3 } } },
      { content: formatNumber(igstAmount), styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 } } }
    ]);
  } else {
    tableFoot.push(
      [
        { content: `Add : CGST     ${cgstRate} %`, colSpan: 6, styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 3, bottom: 1.2, left: 3 } } },
        { content: formatNumber(cgstAmount), styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 } } }
      ],
      [
        { content: `Add : SGST     ${sgstRate} %`, colSpan: 6, styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 3, bottom: 1.2, left: 3 } } },
        { content: formatNumber(sgstAmount), styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 } } }
      ]
    );
  }

  tableFoot.push(
    [
      { content: 'Round Off', colSpan: 6, styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 3, bottom: 1.2, left: 3 } } },
      { content: formatNumber(roundOff), styles: { halign: 'right', fontSize: 7.5, cellPadding: { top: 1.2, right: 2, bottom: 1.2, left: 2 } } }
    ],
    [
      { content: 'Total Amount After Tax', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, textColor: theme.totalText, fillColor: theme.totalFill, cellPadding: { top: 2, right: 3, bottom: 2, left: 3 } } },
      { content: formatNumber(roundedGrandTotal), styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, textColor: theme.totalText, fillColor: theme.totalFill, cellPadding: { top: 2, right: 2, bottom: 2, left: 2 } } }
    ]
  );

  doc.autoTable({
    head: tableHeaders,
    body: tableRows,
    foot: tableFoot,
    startY: clientSectionEndY,
    margin: { left: frameX, right: frameX },
    tableWidth: frameWidth,
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 2.2, right: 2, bottom: 2.2, left: 2 },
      overflow: 'linebreak',
      valign: 'middle',
      lineColor: theme.borderColor,
      lineWidth: 0.25
    },
    headStyles: {
      fillColor: theme.headerFill,
      textColor: theme.headerText,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
      valign: 'middle',
      lineColor: theme.borderColor,
      lineWidth: 0.35
    },
    bodyStyles: {
      textColor: [15, 23, 42],
      fontSize: 7.5,
      lineColor: theme.borderColor,
      lineWidth: 0.25
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [15, 23, 42],
      lineColor: theme.borderColor,
      lineWidth: 0.25
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 26, halign: 'center' },
      2: { cellWidth: 'auto', fontStyle: 'bold' },
      3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 21, halign: 'right' },
      6: { cellWidth: 23, halign: 'right', fontStyle: 'bold' }
    },
    theme: 'grid'
  });

  const afterTableY = doc.lastAutoTable.finalY;

  // 6. Rupees in Words Strip
  const wordsBoxY = afterTableY;
  const wordsBoxHeight = 6.5;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.35);
  doc.line(frameX, wordsBoxY, frameEndX, wordsBoxY);
  doc.line(frameX, wordsBoxY + wordsBoxHeight, frameEndX, wordsBoxY + wordsBoxHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rupees (in words) :  Rupees ${numberToWordsINR(roundedGrandTotal).replace(/ Only$/i, '')} only`, frameX + 2, wordsBoxY + 4.5);

  // 7. Declaration (Left) vs Bank Details (Right)
  const bottomBoxY = wordsBoxY + wordsBoxHeight;
  const bottomBoxHeight = 32;
  const bottomBoxEndY = bottomBoxY + bottomBoxHeight;
  const bankSplitX = 110;

  // Vertical line separating Declaration and Bank Details
  doc.line(bankSplitX, bottomBoxY, bankSplitX, bottomBoxEndY);

  // Left - Declaration
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Declaration", frameX + 2, bottomBoxY + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text(orgDeclaration, frameX + 2, bottomBoxY + 9, { maxWidth: bankSplitX - frameX - 4, lineHeightFactor: 1.25 });

  // Right - Company's Bank Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Company's Bank Details", frameEndX - 2, bottomBoxY + 4.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);

  const bankStartY = bottomBoxY + 9;
  const bankLabelX = bankSplitX + 4;
  const bankValX = frameEndX - 2;

  doc.text("Bank Name", bankLabelX, bankStartY);
  doc.setFont("helvetica", "bold");
  doc.text(bankDetails.bankName || '-', bankValX, bankStartY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text("Account Number", bankLabelX, bankStartY + 4.5);
  doc.setFont("helvetica", "bold");
  doc.text(bankDetails.accountNumber || '-', bankValX, bankStartY + 4.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text("Branch", bankLabelX, bankStartY + 9);
  doc.setFont("helvetica", "bold");
  doc.text(bankDetails.branch || '-', bankValX, bankStartY + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text("IFSC Code", bankLabelX, bankStartY + 13.5);
  doc.setFont("helvetica", "bold");
  doc.text(bankDetails.ifscCode || '-', bankValX, bankStartY + 13.5, { align: "right" });

  if (bankDetails.upiId) {
    doc.setFont("helvetica", "normal");
    doc.text("UPI ID / Number", bankLabelX, bankStartY + 18);
    doc.setFont("helvetica", "bold");
    doc.text(bankDetails.upiId, bankValX, bankStartY + 18, { align: "right" });
  }

  // 8. Outer Framing Box for Page 1
  doc.rect(frameX, topY, frameWidth, bottomBoxEndY - topY, 'S');

  // =========================================================================
  // --- SUBSEQUENT PAGES: DETAILED WORKINGS (1 DEDICATED PAGE PER PRODUCT) ---
  // =========================================================================
  if (includeWorkingsPages && productList.length > 0) {
    productList.forEach((prod, pIdx) => {
      doc.addPage();
      let prodY = topY;

      // Header Bar on workings pages
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`GSTIN : ${orgGstin}`, frameX + 2, prodY + 4.5);
      doc.text(`Cell : ${orgPhones.join(', ')}`, frameEndX - 2, prodY + 4.5, { align: 'right' });

      doc.line(frameX, prodY + 6.5, frameEndX, prodY + 6.5);

      // Product Header Banner
      doc.setFillColor(218, 232, 248);
      doc.rect(frameX, prodY + 6.5, frameWidth, 8.5, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`PRODUCT ${pIdx + 1}: ${prod.name.toUpperCase()} (QTY: ${prod.quantity}) - DETAILED WORKINGS`, 105, prodY + 12, { align: "center" });

      doc.line(frameX, prodY + 15, frameEndX, prodY + 15);
      let currWorkingsY = prodY + 18;

      const filteredBom = (prod.bom || []).filter(x => x.includeInPDF !== false);
      const filteredProcesses = (prod.processes || []).filter(x => x.includeInPDF !== false);
      const filteredMisc = (prod.miscItems || []).filter(x => x.includeInPDF !== false);

      // Table 1: Metal Components (BOM)
      if (filteredBom.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("• Metal Components & Raw Material (BOM)", frameX + 2, currWorkingsY);
        currWorkingsY += 3;

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
          startY: currWorkingsY,
          margin: { left: frameX, right: frameX },
          tableWidth: frameWidth,
          styles: { fontSize: 7, cellPadding: 1.8, lineColor: [30, 41, 59], lineWidth: 0.2 },
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 7, lineColor: [30, 41, 59], lineWidth: 0.25 },
          theme: 'grid'
        });

        currWorkingsY = doc.lastAutoTable.finalY + 6;
      }

      // Table 2: Processes
      if (filteredProcesses.length > 0) {
        if (currWorkingsY > 230) { doc.addPage(); currWorkingsY = topY + 10; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("• Manufacturing & Machining Operations", frameX + 2, currWorkingsY);
        currWorkingsY += 3;

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
          startY: currWorkingsY,
          margin: { left: frameX, right: frameX },
          tableWidth: frameWidth,
          styles: { fontSize: 7, cellPadding: 1.8, lineColor: [30, 41, 59], lineWidth: 0.2 },
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 7, lineColor: [30, 41, 59], lineWidth: 0.25 },
          theme: 'grid'
        });

        currWorkingsY = doc.lastAutoTable.finalY + 6;
      }

      // Table 3: Other Expenses
      if (filteredMisc.length > 0) {
        if (currWorkingsY > 230) { doc.addPage(); currWorkingsY = topY + 10; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text("• Bought-Out Hardware & Other Expenses", frameX + 2, currWorkingsY);
        currWorkingsY += 3;

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
          startY: currWorkingsY,
          margin: { left: frameX, right: frameX },
          tableWidth: frameWidth,
          styles: { fontSize: 7, cellPadding: 1.8, lineColor: [30, 41, 59], lineWidth: 0.2 },
          headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold', fontSize: 7, lineColor: [30, 41, 59], lineWidth: 0.25 },
          theme: 'grid'
        });

        currWorkingsY = doc.lastAutoTable.finalY + 6;
      }

      // Workings Summary Box
      const uMat = (prod.bom || []).reduce((acc, x) => acc + (x.totalCost || 0), 0);
      const uProc = (prod.processes || []).reduce((acc, x) => acc + (x.cost || 0), 0);
      const uMisc = (prod.miscItems || []).reduce((acc, x) => acc + (x.cost || 0), 0);
      const uSub = uMat + uProc + uMisc;
      const uProf = uSub * ((prod.profitPercentage || 0) / 100);
      const uTot = uSub + uProf;
      const pGrand = uTot * prod.quantity;

      const sBoxW = 90;
      const sBoxH = 36;
      const sBoxX = frameEndX - sBoxW;
      const sBoxY = currWorkingsY;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(30, 41, 59);
      doc.rect(sBoxX, sBoxY, sBoxW, sBoxH, 'FD');

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(`Materials (BOM):`, sBoxX + 4, sBoxY + 6);
      doc.text(`Rs. ${(uMat * prod.quantity).toFixed(2)}`, sBoxX + sBoxW - 4, sBoxY + 6, { align: "right" });

      doc.text(`Processes / Machining:`, sBoxX + 4, sBoxY + 11.5);
      doc.text(`Rs. ${(uProc * prod.quantity).toFixed(2)}`, sBoxX + sBoxW - 4, sBoxY + 11.5, { align: "right" });

      doc.text(`Other / Hardware Expenses:`, sBoxX + 4, sBoxY + 17);
      doc.text(`Rs. ${(uMisc * prod.quantity).toFixed(2)}`, sBoxX + sBoxW - 4, sBoxY + 17, { align: "right" });

      doc.text(`Profit Margin (${prod.profitPercentage || 0}%):`, sBoxX + 4, sBoxY + 22.5);
      doc.text(`Rs. ${(uProf * prod.quantity).toFixed(2)}`, sBoxX + sBoxW - 4, sBoxY + 22.5, { align: "right" });

      doc.line(sBoxX + 4, sBoxY + 25.5, sBoxX + sBoxW - 4, sBoxY + 25.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Product Total (${prod.quantity} pcs):`, sBoxX + 4, sBoxY + 31.5);
      doc.text(`Rs. ${pGrand.toFixed(2)}`, sBoxX + sBoxW - 4, sBoxY + 31.5, { align: "right" });

      // Outer border for workings page
      doc.rect(frameX, topY, frameWidth, Math.max(sBoxY + sBoxH + 4, 260) - topY, 'S');
    });
  }

  // 9. Bottom Center Footer across all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // "Thank you for your business!"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text("Thank you for your business!", 105, 283.5, { align: "center" });

    // "Powered by arguscnc.com"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("Powered by arguscnc.com", 105, 288, { align: "center" });

    // Page number
    doc.setFontSize(7);
    doc.text(`Page ${i} of ${pageCount}`, frameEndX, 288, { align: "right" });
  }

  const primaryClientName = clientsToRender.length === 1 
    ? clientsToRender[0].name 
    : `Consolidated_${clientsToRender.length}_Clients`;
  const cleanClientName = (primaryClientName || 'Client').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePrefix = includeWorkingsPages ? 'Quotation_With_Workings' : 'Quotation';

  return {
    doc,
    roundedGrandTotal,
    clientsToRender,
    cleanClientName,
    filePrefix,
    quoteNum,
    isHistoryExport
  };
}

// --- PDF Quotation Exporter (Invoked by UI buttons) ---
async function exportQuoteToPDF(txData = null, shouldPreview = false, targetClient = null, includeWorkingsPages = false) {
  const isHistoryExport = txData !== null && !(txData instanceof Event);
  const targetOrg = isHistoryExport ? (txData.companyName || txData.orgName) : state.currentUser;
  const orgProfile = await getOrgProfileData(targetOrg);

  const res = generateQuotePDFDoc(txData, targetClient, includeWorkingsPages, orgProfile);
  if (!res || !res.doc) return;

  if (shouldPreview) {
    const blobUrl = res.doc.output('bloburl');
    window.open(blobUrl, '_blank');
  } else {
    res.doc.save(`${res.filePrefix}_${res.cleanClientName}_${res.quoteNum}.pdf`);
  }

  // Save transaction to history if generated by active user
  if (!res.isHistoryExport) {
    const txClient = res.clientsToRender.length === 1 
      ? res.clientsToRender[0] 
      : { 
          name: res.clientsToRender.map(c => c.name).join(', '), 
          address: `${res.clientsToRender.length} Recipients Consolidated`, 
          gstin: '' 
        };
    saveTransaction(res.roundedGrandTotal, txClient);
  }
}

// --- Email Quotation Controller (Resend Flow) ---
let currentEmailQuoteData = null;
let currentEmailQuoteBlobUrl = null;

function extractCleanEmail(str) {
  if (!str) return '';
  const s = String(str).trim();
  const match = s.match(/<([^>]+)>/);
  if (match && match[1]) {
    return match[1].trim().toLowerCase();
  }
  return s.toLowerCase();
}

function formatEmailDisplayLabel(str) {
  if (!str) return { dept: '', email: '', full: '' };
  const s = String(str).trim();
  const match = s.match(/^([^<]+)<([^>]+)>$/);
  if (match && match[1] && match[2]) {
    const dept = match[1].trim();
    const email = match[2].trim();
    return { dept, email, full: `${dept} <${email}>` };
  }
  return { dept: '', email: s, full: s };
}

async function openEmailQuoteModal(txData = null, includeWorkings = false) {
  const isHistoryExport = txData !== null && !(txData instanceof Event);
  const targetOrg = isHistoryExport ? (txData.companyName || txData.orgName) : state.currentUser;
  const orgProfile = await getOrgProfileData(targetOrg);

  // If no client selected in active quotation
  if (!isHistoryExport) {
    const selected = state.selectedClients || [];
    if (selected.length === 0 && !state.customerName && (!state.clients || state.clients.length === 0)) {
      alert("Please select or add at least one client company before sending a quotation email.");
      openClientsModal();
      return;
    }
  }

  const res = generateQuotePDFDoc(txData, null, includeWorkings, orgProfile);
  if (!res || !res.doc) return;

  const primaryClient = res.clientsToRender[0] || { name: 'Valued Client', email: '', address: '' };
  
  // Aggregate all emails across selected clients
  let allClientEmails = [];
  (res.clientsToRender || []).forEach(cl => {
    if (Array.isArray(cl.emails) && cl.emails.length > 0) {
      cl.emails.forEach(em => {
        if (em && !allClientEmails.includes(em)) allClientEmails.push(em);
      });
    } else if (cl.email && !allClientEmails.includes(cl.email)) {
      allClientEmails.push(cl.email);
    }
  });

  if (allClientEmails.length === 0 && DOM.customerEmailInput && DOM.customerEmailInput.value.trim()) {
    allClientEmails.push(DOM.customerEmailInput.value.trim());
  }

  // Active Profile resolution for Email Modal
  const activeEmailProfile = getActiveCompanyProfile(isHistoryExport, txData, orgProfile);
  const orgDisplayName = activeEmailProfile.name || 'Argus Technologies';
  const orgEmail = (activeEmailProfile.emails && activeEmailProfile.emails.length > 0)
    ? activeEmailProfile.emails[0]
    : (orgProfile && orgProfile.emails && orgProfile.emails.length > 0 ? orgProfile.emails[0] : (DOM.orgSettingsEmail ? DOM.orgSettingsEmail.value.trim() : ''));

  const pdfFilename = `${res.filePrefix}_${res.cleanClientName}_${res.quoteNum}.pdf`;
  
  // Generate Data URI and Blob URL
  const pdfDataUri = res.doc.output('datauristring');
  if (currentEmailQuoteBlobUrl) {
    URL.revokeObjectURL(currentEmailQuoteBlobUrl);
  }
  const blob = res.doc.output('blob');
  currentEmailQuoteBlobUrl = URL.createObjectURL(blob);

  currentEmailQuoteData = {
    txData,
    res,
    pdfFilename,
    pdfDataUri,
    orgName: orgDisplayName,
    orgEmail: orgEmail,
    primaryClient
  };

  // Populate Recipients Checklist
  if (DOM.emailQuoteToRecipientsList) {
    DOM.emailQuoteToRecipientsList.innerHTML = '';
    
    if (allClientEmails.length === 0) {
      DOM.emailQuoteToRecipientsList.innerHTML = `
        <div class="p-2.5 text-center text-xs text-slate-400">
          No saved emails found for ${escapeHTML(primaryClient.name || 'this client')}. Add a recipient below.
        </div>
      `;
    } else {
      allClientEmails.forEach((rawEm) => {
        const parsed = formatEmailDisplayLabel(rawEm);
        const cleanEmail = extractCleanEmail(rawEm);

        const labelEl = document.createElement('label');
        labelEl.className = 'flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-xs';
        
        const deptBadge = parsed.dept 
          ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mr-1.5 shrink-0">${escapeHTML(parsed.dept)}</span>` 
          : '';

        labelEl.innerHTML = `
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <input type="checkbox" value="${escapeHTML(rawEm)}" class="email-quote-recipient-checkbox w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0" checked>
            <div class="min-w-0 flex-1 flex items-center gap-1.5 truncate">
              ${deptBadge}
              <span class="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs truncate">${escapeHTML(cleanEmail)}</span>
            </div>
          </div>
        `;

        DOM.emailQuoteToRecipientsList.appendChild(labelEl);
      });
    }
  }

  // Clear optional custom recipient field
  if (DOM.emailQuoteCustomTo) {
    DOM.emailQuoteCustomTo.value = '';
  }

  // Populate CC and other fields
  if (DOM.emailQuoteCc) DOM.emailQuoteCc.value = orgEmail;
  if (DOM.emailQuoteClientName) DOM.emailQuoteClientName.textContent = primaryClient.name ? `(${primaryClient.name})` : '';
  if (DOM.emailQuoteSubject) {
    DOM.emailQuoteSubject.value = `Quotation ${res.quoteNum} from ${orgDisplayName}`;
  }
  if (DOM.emailQuoteMessage) {
    DOM.emailQuoteMessage.value = `Dear ${primaryClient.name || 'Valued Customer'},\n\nPlease find attached our official quotation (${res.quoteNum}) for your requirements.\nTotal Amount: Rs. ${formatNumber(res.roundedGrandTotal)}\n\nKindly review and let us know if you need any further clarifications.\n\nBest regards,\n${orgDisplayName}`;
  }
  if (DOM.emailQuoteAttachmentName) {
    DOM.emailQuoteAttachmentName.textContent = pdfFilename;
  }
  if (DOM.emailQuotePdfIframe) {
    DOM.emailQuotePdfIframe.src = currentEmailQuoteBlobUrl;
  }
  if (DOM.emailQuoteError) {
    DOM.emailQuoteError.textContent = '';
    DOM.emailQuoteError.classList.add('hidden');
  }

  if (DOM.emailQuoteModal) {
    DOM.emailQuoteModal.classList.remove('hidden');
  }
  lucide.createIcons();
}

function closeEmailQuoteModal() {
  if (DOM.emailQuoteModal) {
    DOM.emailQuoteModal.classList.add('hidden');
  }
  if (currentEmailQuoteBlobUrl) {
    URL.revokeObjectURL(currentEmailQuoteBlobUrl);
    currentEmailQuoteBlobUrl = null;
  }
  if (DOM.emailQuotePdfIframe) {
    DOM.emailQuotePdfIframe.src = '';
  }
}

async function handleSendEmailQuoteSubmit(e) {
  if (e) e.preventDefault();
  if (!currentEmailQuoteData) return;

  // Gather all selected recipient checkboxes
  const checkedBoxes = DOM.emailQuoteToRecipientsList 
    ? DOM.emailQuoteToRecipientsList.querySelectorAll('.email-quote-recipient-checkbox:checked') 
    : [];
  const recipientValues = Array.from(checkedBoxes).map(cb => cb.value);

  // Add custom extra recipient if provided
  const customToVal = DOM.emailQuoteCustomTo ? DOM.emailQuoteCustomTo.value.trim() : '';
  if (customToVal) {
    const customList = customToVal.split(',').map(s => s.trim()).filter(Boolean);
    recipientValues.push(...customList);
  }

  const cleanToList = recipientValues.map(extractCleanEmail).filter(em => em && em.includes('@'));

  if (cleanToList.length === 0) {
    if (DOM.emailQuoteError) {
      DOM.emailQuoteError.textContent = 'Please select or add at least one valid Customer Email address (TO).';
      DOM.emailQuoteError.classList.remove('hidden');
    }
    return;
  }

  const ccEmail = DOM.emailQuoteCc ? DOM.emailQuoteCc.value.trim() : '';
  const subject = DOM.emailQuoteSubject ? DOM.emailQuoteSubject.value.trim() : '';
  const message = DOM.emailQuoteMessage ? DOM.emailQuoteMessage.value.trim() : '';

  if (DOM.emailQuoteError) DOM.emailQuoteError.classList.add('hidden');
  if (DOM.submitEmailQuoteBtn) DOM.submitEmailQuoteBtn.disabled = true;
  if (DOM.submitEmailQuoteText) DOM.submitEmailQuoteText.textContent = 'Sending Email...';

  try {
    const response = await fetch('/api/quote/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgName: state.currentUser || currentEmailQuoteData.orgName,
        companyName: currentEmailQuoteData.orgName,
        to: cleanToList,
        cc: ccEmail ? [ccEmail] : [],
        subject: subject,
        message: message,
        pdfBase64: currentEmailQuoteData.pdfDataUri,
        pdfFilename: currentEmailQuoteData.pdfFilename
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      showToast({
        title: 'Quotation Emailed',
        message: `Quotation sent successfully to ${cleanToList.length} recipient${cleanToList.length > 1 ? 's' : ''}!`,
        type: 'success'
      });

      // Save transaction to history if generated by active user and not history export
      const res = currentEmailQuoteData.res;
      if (!res.isHistoryExport) {
        const txClient = res.clientsToRender.length === 1 
          ? res.clientsToRender[0] 
          : { 
              name: res.clientsToRender.map(c => c.name).join(', '), 
              address: `${res.clientsToRender.length} Recipients Consolidated`, 
              gstin: '' 
            };
        saveTransaction(res.roundedGrandTotal, txClient);
      }

      closeEmailQuoteModal();
    } else {
      if (DOM.emailQuoteError) {
        DOM.emailQuoteError.textContent = data.error || 'Failed to send quotation email.';
        DOM.emailQuoteError.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.error('Email send error:', err);
    if (DOM.emailQuoteError) {
      DOM.emailQuoteError.textContent = 'Server connection failed while sending email.';
      DOM.emailQuoteError.classList.remove('hidden');
    }
  } finally {
    if (DOM.submitEmailQuoteBtn) DOM.submitEmailQuoteBtn.disabled = false;
    if (DOM.submitEmailQuoteText) DOM.submitEmailQuoteText.textContent = 'Send Quotation Email';
  }
}



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

// Global Theme Selector Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const toolbarBtn = document.getElementById('toolbar-select-theme-btn');
  if (toolbarBtn) {
    toolbarBtn.addEventListener('click', openPdfThemeSelectModal);
  }

  const exportBtn = document.getElementById('export-select-theme-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', openPdfThemeSelectModal);
  }

  const emailThemeBtn = document.getElementById('email-select-theme-btn');
  if (emailThemeBtn) {
    emailThemeBtn.addEventListener('click', openPdfThemeSelectModal);
  }

  const closeThemeBtn = document.getElementById('close-pdf-theme-modal-btn');
  if (closeThemeBtn) {
    closeThemeBtn.addEventListener('click', closePdfThemeSelectModal);
  }

  const closeThemeFooterBtn = document.getElementById('close-pdf-theme-footer-btn');
  if (closeThemeFooterBtn) {
    closeThemeFooterBtn.addEventListener('click', closePdfThemeSelectModal);
  }
});



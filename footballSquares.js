/**
 * GOOGLE SHEETS FOOTBALL SQUARES
 * League Creator & Management Platform Tool
 * v1.0 | 10/17/2026
 * Created by Ben Powers
 * ben.powers.creative@gmail.com
 * 
 * ------------------------------------------------------------------------
 * DESCRIPTION:
 * A series of Google Apps Scripts to manage a football squares game.
 * You may submit your squares via the sidebar menu or create a shareable web app.
 * Submit the outcomes of each quarters scoring and display the winners.
 * 
 * ------------------------------------------------------------------------
 * INSTRUCTIONS:
 * make a copy and try running the NFL Squares menu option; if you have trouble authorizing the script, please follow the instructions; if you have no menu, please refresh
 * 🏈 NFL Squares Menu:
 *  
 *  ⚙️ Configuration - Set pool parameters, limits, and payouts as well as define payment methods (sidebar tool)
 *  🎯 Pick Square - Bring up the sidebar for square selections by the pool manager
 *  📋 Open Web Form - Tool top open directly or copy the URL for the web form (only appears once deployed)
 *  
 *  💰 Edit Payouts - Tool to manually adjust what winning categories pay out and manually adjust values, including buy-in (only appears when paid pool is selected in Configuration)
 *  🧮 Set Numbers - Tool to set random values for the home and away scoring digits (can also set 0-9 standard order)
 *  ⭕ Clear Numbers - Removes values for home and away scoring digits
 *  🔄 Save Results & Reset Full Sheet - Removes scoring digits, entries, and clears pool field
 * 
 *  🌐 Web App Setup Guide - Sidebar instruction pop-up to explain how to make a web-based, shareable "Form"
 *  
 *  ❓ Help & Instructions - Setup instructions and contact info
 * 
 * ------------------------------------------------------------------------
 * If you're feeling generous and would like to support my work,
 * here's a link to support my wife, six kiddos, and me:
 * https://www.buymeacoffee.com/benpowers or https://venmo.com/benpowerscreative
 * 
 * Thanks for checking out the script!
 * 
 */
// ==========================================
// 0. GLOBAL VARIABLES
// ==========================================

const SCRIPT_VERSION = '1.0';
const SHEET_NAME = 'SQUARES';
const ENTRIES_SHEET = 'ENTRIES';
const WINNERS_SHEET = 'WINNERS';
const PAYOUTS_SHEET = 'PAYOUTS';
const GRID_SIZE = 10;
const NAMED_RANGE = 'SQUARES';
const TRI_HIGHLIGHT = ["#FFF282","#F1D850","#E4BD00"];

const PAYMENT_METHODS = [
  { key: 'paypal',  label: 'PayPal',   placeholder: 'Email or PayPal.me/name' },
  { key: 'venmo',   label: 'Venmo',    placeholder: '@username' },
  { key: 'cashapp', label: 'Cash App', placeholder: '$cashtag' },
  { key: 'zelle',   label: 'Zelle',    placeholder: 'Email or phone' },
  { key: 'other',   label: 'Other',    placeholder: 'Payment instructions (e.g. "Cash at the party", mailing address...)', multiline: true }
];

const NFL_DATA = {
  "ARI": { name: "Arizona Cardinals", colors: ["#9B2743", "#FFFFFF", "#A2AAAD", "#010101"], mascot: "🐦" },
  "ATL": { name: "Atlanta Falcons", colors: ["#010101", "#A6192E", "#FFFFFF", "#B2B4B2"], mascot: "🦜" },
  "BAL": { name: "Baltimore Ravens", colors: ["#24125F", "#FFFFFF", "#9A7611", "#010101"], mascot: "🐦⬛" },
  "BUF": { name: "Buffalo Bills", colors: ["#003087", "#C8102E", "#FFFFFF", "#091F2C"], mascot: "🐃" },
  "CAR": { name: "Carolina Panthers", colors: ["#101820", "#0085CA", "#B2B4B2", "#FFFFFF"], mascot: "🐈⬛" },
  "CHI": { name: "Chicago Bears", colors: ["#091F2C", "#DC4405", "#FFFFFF", "#010101"], mascot: "🐻" },
  "CIN": { name: "Cincinnati Bengals", colors: ["#010101", "#DC4405", "#FFFFFF", "#010101"], mascot: "🐅" },
  "CLE": { name: "Cleveland Browns", colors: ["#311D00", "#EB3300", "#FFFFFF", "#EDC8A3"], mascot: "🟠" },
  "DAL": { name: "Dallas Cowboys", colors: ["#0C2340", "#FFFFFF", "#87909A", "#7F9695"], mascot: "🤠" },
  "DEN": { name: "Denver Broncos", colors: ["#0C2340", "#FC4C02", "#FFFFFF", "#010101"], mascot: "🐴" },
  "DET": { name: "Detroit Lions", colors: ["#0069B1", "#FFFFFF", "#A2AAAD", "#010101"], mascot: "🦁" },
  "GB":  { name: "Green Bay Packers", colors: ["#183029", "#FFB81C", "#FFFFFF", "#010101"], mascot: "🧀" },
  "HOU": { name: "Houston Texans", colors: ["#1D1F2A", "#E4002B", "#FFFFFF", "#0072CE"], mascot: "🐂" },
  "IND": { name: "Indianapolis Colts", colors: ["#003A70", "#FFFFFF", "#A2AAAD", "#1D252D"], mascot: "🐎" },
  "JAX": { name: "Jacksonville Jaguars", colors: ["#006271", "#D29F13", "#010101", "#9A7611"], mascot: "🌴" },
  "KC":  { name: "Kansas City Chiefs", colors: ["#C8102E", "#FFB81C", "#FFFFFF", "#010101"], mascot: "🏹" },
  "LV":  { name: "Las Vegas Raiders", colors: ["#010101", "#A2AAAD", "#FFFFFF", "#87909A"], mascot: "🏴☠️" },
  "LAC": { name: "Los Angeles Chargers", colors: ["#0072CE", "#FFB81C", "#FFFFFF", "#0C2340"], mascot: "⚡" },
  "LAR": { name: "Los Angeles Rams", colors: ["#1E22AA", "#FFD100", "#D7D2CB", "#FFFFFF"], mascot: "🐏" },
  "MIA": { name: "Miami Dolphins", colors: ["#008C95", "#FC4C02", "#FFFFFF", "#005776"], mascot: "🐬" },
  "MIN": { name: "Minnesota Vikings", colors: ["#582C83", "#FFC72C", "#FFFFFF", "#010101"], mascot: "⚔️" },
  "NE":  { name: "New England Patriots", colors: ["#0C2340", "#C8102E", "#A2AAAD", "#FFFFFF"], mascot: "🥁" },
  "NO":  { name: "New Orleans Saints", colors: ["#010101", "#D3BC8D", "#FFFFFF", "#A28D5B"], mascot: "⚜️" },
  "NYG": { name: "New York Giants", colors: ["#001E62", "#A6192E", "#A2AAAD", "#FFFFFF"], mascot: "🏗️" },
  "NYJ": { name: "New York Jets", colors: ["#115740", "#FFFFFF", "#A2AAAD", "#010101"], mascot: "✈️" },
  "PHI": { name: "Philadelphia Eagles", colors: ["#004851", "#E3E5E6", "#545859", "#010101"], mascot: "🦅" },
  "PIT": { name: "Pittsburgh Steelers", colors: ["#010101", "#FFB81C", "#FFFFFF", "#C8102E"], mascot: "🏭" },
  "SF":  { name: "San Francisco 49ERS", colors: ["#A6192E", "#B9975B", "#FFFFFF", "#010101"], mascot: "⛏️" },
  "SEA": { name: "Seattle Seahawks", colors: ["#0C2340", "#78BE21", "#A2AAAD", "#FFFFFF"], mascot: "🌊" },
  "TB":  { name: "Tampa Bay Buccaneers", colors: ["#010101", "#A6192E", "#3D3935", "#DC4405"], mascot: "🏴☠️" },
  "TEN": { name: "Tennessee Titans", colors: ["#0C2340", "#418FDE", "#B2B4B2", "#C8102E"], mascot: "🛡️" },
  "WSH": { name: "Washington Commanders", colors: ["#651C32", "#FFB81C", "#FFFFFF", "#010101"], mascot: "🎖️" }
};

const REVERSE_TEAM_MAP = {};

for (const [key, team] of Object.entries(NFL_DATA)) {
  const lowerKey = key.toLowerCase();
  const lowerName = team.name.toLowerCase(); // "seattle seahawks"
  const nameParts = lowerName.split(" ");     // ["seattle", "seahawks"]

  // Map the abbreviation: "sea" -> "SEA"
  REVERSE_TEAM_MAP[lowerKey] = key;
  
  // Map the full name: "seattle seahawks" -> "SEA"
  REVERSE_TEAM_MAP[lowerName] = key;
  
  // Map city and nickname variations dynamically
  if (nameParts.length > 1) {
    const nickname = nameParts[nameParts.length - 1]; // "seahawks"
    const city = nameParts.slice(0, -1).join(" ");   // "seattle" (handles "tampa bay" too)
    
    REVERSE_TEAM_MAP[nickname] = key;
    REVERSE_TEAM_MAP[city] = key;
  }
}

// 2. Clear, high-performance lookup function
function findTeamByName(inputVal, fallbackCode) {
  if (!inputVal) return fallbackCode;
  
  const cleanInput = String(inputVal).trim().toLowerCase();
  
  // O(1) Instant Lookup
  return REVERSE_TEAM_MAP[cleanInput] || fallbackCode;
}

// ==========================================
// 1. MENU & UI INITIALIZATION
// ==========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu('🏈 NFL Squares');
  let props = {};
  let config = '';
  let configObj = {};
  let isInitialized = false;
  let deployed = false; 
  let isPaid = false;
  try {
    props = PropertiesService.getDocumentProperties();
  } catch (e) {}
  try {
    isInitialized = props.getProperty('initialized') === 'true';
  } catch (e) {}
  try {
    config = props.getProperty('squares_config');
    if (config) {
      configObj = JSON.parse(config);
      deployed = configObj?.deployed;
      isPaid = configObj?.isPaid;
    }

  } catch (e) {}

  if (!isInitialized) {
    menu.addItem('🚀 Authorize & Initialize Sheet', 'showHelpAndSupport');
  } else {
    menu.addItem('⚙️ Configuration', 'showSquaresConfigSidebar')
      .addItem('🎯 Pick Square', 'showSquarePicker');
      if (deployed || deployed == 'true') {
        menu.addItem('📋 Open Web Form', 'showSquaresLinkDialog');
      } else {
        menu.addItem('📋 Open Web Form','firstDeployWebAppUrlChecker');
      }
      menu.addItem('▶️ Start Game', 'startGame')
        .addSeparator()
      if (isPaid || isPaid == 'true') {
        menu.addItem('💰 Edit Payouts', 'showPayoutsDialog');
      }
      menu.addItem('🧮 Set Numbers', 'setNumbers')
      .addItem('⭕ Clear Numbers', 'clearNumbers')
      .addItem('🔄 Reset Full Sheet', 'saveAndReset');
      if (!deployed) {
        menu.addSeparator().addItem('🌐 Web App Setup Guide', 'showWebAppDeploymentGuide'); 
      }
      menu.addSeparator().addItem('❓ Help & Instructions', 'showHelpAndSupport');
  }
  menu.addToUi();
}

/**
 * Displays the Help / Initialization sidebar.
 * Serves as the menu target and button handler.
 */
function showHelpAndSupport() {
  const html = HtmlService.createHtmlOutputFromFile('footballSquaresHelp')
      .setTitle('NFL Squares Help & Settings')
      .setWidth(500)
      .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, ' ');
}

/**
 * Server-side function called by HTML template client-side JS.
 * Handles state detection for initial authorization vs standard support view.
 */
function getSupportPromptInfo() {
  const props = PropertiesService.getDocumentProperties();
  const isInitialized = props.getProperty('initialized') === 'true';

  let isFirstRun = false;

  if (!isInitialized) {
    // Mark as initialized on first manual run after OAuth approval
    props.setProperty('initialized', 'true');
    isFirstRun = true;
    
    // Refresh top menu to show updated menu options
    onOpen();
  }

  return {
    version: SCRIPT_VERSION,
    isFirstRun: isFirstRun
  };
}

function showSquarePicker() {
  getOrCreateEntriesSheet();
  const html = HtmlService.createHtmlOutputFromFile('footballSquaresPicker')
    .setTitle('🏈 NFL Squares Picker');
  SpreadsheetApp.getUi().showSidebar(html);
}

function doGet(e) {
  getOrCreateEntriesSheet();
  return HtmlService.createHtmlOutputFromFile('footballSquaresWebApp')
    .setTitle('🏈 NFL Football Squares')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

// ==========================================
// 1. CONFIGURATION SIDEBAR & PAYOUT EDITOR
// ==========================================

function showSquaresConfigSidebar() {
  const template = HtmlService.createTemplateFromFile('footballSquaresConfig');
  const html = template.evaluate()
    .setTitle('Configuration')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getSquaresConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const getVal = (name, fallback) => {
    const range = ss.getRangeByName(name);
    return range ? range.getValue() : fallback;
  };

  const groupName = String(getVal('TITLE', 'NFL Squares')).trim();  
  const awayTeam = String(getVal('AWAY', 'KANSAS CITY CHIEFS')).trim().toUpperCase();
  const homeTeam = String(getVal('HOME', 'INDIANAPOLIS COLTS')).trim().toUpperCase();
  const docProps = PropertiesService.getDocumentProperties();
  const savedProps = JSON.parse(docProps.getProperty('squares_config') || '{}');
  Logger.log(savedProps);
  const cost = savedProps?.cost || 10; 
  const minSquares = savedProps?.minSquares || 1;
  const maxSquares = savedProps?.maxSquares || 50;
  const disableAdditionalResponses = savedProps?.disableAdditionalResponses || false;
  const paymentMethods = savedProps?.paymentMethods || PAYMENT_METHODS;

  return {
    groupName: groupName,
    awayTeam: awayTeam,
    homeTeam: homeTeam,
    cost: cost,
    isPaid: cost > 0,
    minSquares: minSquares,
    maxSquares: maxSquares,
    disableAdditionalResponses: disableAdditionalResponses,
    commishCut: savedProps.commishCut !== undefined ? savedProps.commishCut : 0,
    winRules: savedProps.winRules || {},
    payouts: savedProps.payouts || {},
    paymentMethods: paymentMethods,
    nflData: NFL_DATA
  };
}

function processSquaresConfigSubmission(formObject) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Helper for safe team lookups
    const awayData = formObject.awayTeam && NFL_DATA[formObject.awayTeam] ? NFL_DATA[formObject.awayTeam] : null;
    const homeData = formObject.homeTeam && NFL_DATA[formObject.homeTeam] ? NFL_DATA[formObject.homeTeam] : null;

    // 1. Write text directly to TITLE, AWAY, and HOME named ranges
    const titleRange = ss.getRangeByName('TITLE');
    if (titleRange && formObject.groupName) {
      titleRange.setValue(formObject.groupName);
    }
    
    if (awayData) {
      const awayRange = ss.getRangeByName('AWAY');
      if (awayRange) awayRange.setValue(awayData.name.toUpperCase());

      const entAway = ss.getRangeByName('ENTRIES_AWAY');
      if (entAway) {
        entAway.setValue(awayData.name);
        if (awayData.colors) {
          entAway.setBackground(awayData.colors[0]);
          entAway.setFontColor(awayData.colors[1]);
        }
      }
      
      const entAwayScores = ss.getRangeByName('ENTRIES_SCORES_AWAY');
      if (entAwayScores && awayData.colors) {
        entAwayScores.setBackground(awayData.colors[0]);
        entAwayScores.setFontColor(awayData.colors[1]);
      }
    }

    if (homeData) { 
      const homeRange = ss.getRangeByName('HOME');
      if (homeRange) homeRange.setValue(homeData.name.toUpperCase());

      const entHome = ss.getRangeByName('ENTRIES_HOME');
      if (entHome) {
        entHome.setValue(homeData.name);
        if (homeData.colors) {
          entHome.setBackground(homeData.colors[0]);
          entHome.setFontColor(homeData.colors[1]);
        }
      }
      
      const entHomeScores = ss.getRangeByName('ENTRIES_SCORES_HOME');
      if (entHomeScores && homeData.colors) {
        entHomeScores.setBackground(homeData.colors[0]);
        entHomeScores.setFontColor(homeData.colors[1]);
      }
    }
    
    const updateTime = new Date().toISOString();
    const updatedTimeRange = ss.getRangeByName('ENTRIES_DATE_CONFIGURED');
    if (updatedTimeRange) {
      updatedTimeRange.setValue(updateTime);
    }

    // 2. Cost & Limits
    const isPaid = String(formObject.isPaid) === 'true';
    const cost = isPaid ? (parseFloat(formObject.cost) || 0) : 0;
    
    const costRange = ss.getRangeByName('ENTRIES_COST');
    if (costRange) {
      costRange.setValue(isPaid ? `$${cost}` : 'FREE');
    }
    
    const minSquares = parseInt(formObject.minSquares, 10) || 1;
    const maxSquares = parseInt(formObject.maxSquares, 10) || 50;
    
    const minMaxRange = ss.getRangeByName('ENTRIES_LIMITS');
    if (minMaxRange) {
      minMaxRange.setValue(`${minSquares} to ${maxSquares}`);
    }
    
    const disableAdditionalResponses = String(formObject.disableAdditionalResponses) === 'true';

    // Helper to prevent double-stringifying nested objects/arrays
    const parseIfString = (val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
      }
      return val || null;
    };

    // 3. Document Properties
    const docProps = PropertiesService.getDocumentProperties();
    const configToSave = {
      groupName: formObject.groupName || '',
      away: formObject.awayTeam || '',
      home: formObject.homeTeam || '',
      isPaid: isPaid,
      cost: cost,
      minSquares: minSquares,
      maxSquares: maxSquares,
      disableAdditionalResponses: disableAdditionalResponses,
      commishCut: parseFloat(formObject.commishCut) || 0,
      winRules: parseIfString(formObject.winRules),
      payouts: parseIfString(formObject.payouts),
      paymentMethods: parseIfString(formObject.paymentMethods),
      updatedAt: updateTime,
    };

    // Overwrites existing "squares_config" key cleanly
    docProps.setProperty('squares_config', JSON.stringify(configToSave));

    updatePayoutsSheetVisibility(isPaid);
    onOpen();

    ss.toast('Matchup and pool settings updated.', '🏈 Saved');
    Logger.log('🏈 Saved: Matchup and pool settings updated.');

    return { success: true };
  } catch (err) {
    Logger.log(`Error in processSquaresConfigSubmission: ${err.stack}`);
    throw new Error(err.message);
  }
}

// PAYOUTS EDITOR BACKEND

function showPayoutsDialog() {
  const html = HtmlService.createHtmlOutputFromFile('footballSquaresPayouts')
    .setTitle('Granular Payout Editor')
    .setWidth(680)
    .setHeight(480);
  SpreadsheetApp.getUi().showModalDialog(html, '💰 Granular Payout Control');
}

function getPayoutsData() {
  const configStr = PropertiesService.getDocumentProperties().getProperty('squares_config');
  if (!configStr) return null;
  
  const config = JSON.parse(configStr);
  
  // Provide defaults if the payouts object doesn't exist yet
  if (!config.payouts) {
    config.payouts = {
      main: { active: true, splits: [0, 0, 0, 0] },
      inverse: { active: false, splits: [0, 0, 0, 0] },
      adjacent: { active: false, splits: [0, 0, 0, 0] },
      diagonal: { active: false, splits: [0, 0, 0, 0] },
      commissioner: { value: 0, percent: 0 }
    };
  }
  return {
    cost: config.cost || 0,
    payouts: config.payouts
  };
}

function savePayoutsData(data) {
  const docProps = PropertiesService.getDocumentProperties();
  const configStr = docProps.getProperty('squares_config');
  if (!configStr) return { success: false, message: 'Configuration not found.' };
  
  const config = JSON.parse(configStr);
  
  // Update the cost and payouts
  config.cost = data.cost;
  config.payouts = data.payouts;
  
  // Resync percentages based on the hard dollars the user entered
  const pot = data.cost * 100;
  if (pot > 0) {
    config.commishCut = parseFloat(((data.payouts.commissioner.value / pot) * 100).toFixed(2));
    config.payouts.commissioner.percent = config.commishCut;
  }
  
  docProps.setProperty('squares_config', JSON.stringify(config));
  
  updatePayoutsSheetVisibility(config.isPaid && config.cost > 0);

  // Re-run the menu builder just in case they toggled cost to $0 (which hides it on next load)
  onOpen();
  
  return { success: true };
}

function viewConfig() {
  const saved = readConfig_() || {};
  Logger.log(`Found settings:`);
  Logger.log(JSON.stringify(saved));
}

// ==========================================
// 2. DATA PROVIDER FOR SIDEBAR & WEB APP
// ==========================================
const SYNC_CACHE_KEY = 'squares_sync_v1';
const SYNC_CACHE_TTL = 10; // seconds

// Raw, uncached sheet read. Used by getSyncData and by submitSquarePicks (inside the lock)
function readEntries_() {
  const sheet = getOrCreateEntriesSheet();
  const lastRow = sheet.getLastRow();
  const members = {};
  const takenSquares = {};

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 4).getValues().forEach(row => {
      const name = String(row[1] || '').trim();
      const sq = Number(row[2]);
      const color = String(row[3] || '#4CAF50').trim();
      if (name && Number.isInteger(sq) && sq >= 1 && sq <= 100) {
        takenSquares[sq] = { name: name, color: color };
        if (!members[name]) members[name] = { color: color, squares: [] };
        members[name].squares.push(sq);
      }
    });
  }
  return { members, takenSquares };
}

function readMatchup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const getVal = (name, fallback) => {
    const range = ss.getRangeByName(name);
    return range ? range.getValue() : fallback;
  };
  const awayTeam = String(getVal('AWAY', 'KANSAS CITY CHIEFS')).trim().toUpperCase();
  const homeTeam = String(getVal('HOME', 'INDIANAPOLIS COLTS')).trim().toUpperCase();
  const awayAbbr = findTeamByName(awayTeam, 'Kansas City Chiefs');
  const homeAbbr = findTeamByName(homeTeam, 'Indianapolis Colts');
  return {
    away: awayTeam,
    home: homeTeam,
    awayData: NFL_DATA[awayAbbr] || null,
    homeData: NFL_DATA[homeAbbr] || null
  };
}

/**
 * Reads and returns the complete 'squares_config' document property object,
 * applying fallbacks and normalizing primary config values.
 */
function readConfig_() {
  const rawProp = PropertiesService.getDocumentProperties().getProperty('squares_config');
  
  if (!rawProp) {
    return {
      groupName: '',
      away: '',
      home: '',
      isPaid: false,
      cost: 0,
      minSquares: 1,
      maxSquares: 100,
      disableAdditionalResponses: false,
      commishCut: 0,
      winRules: null,
      payouts: null,
      paymentMethods: {},
      activePaymentMethods: {}
    };
  }

  let saved = {};
  try {
    saved = JSON.parse(rawProp);
  } catch (e) {
    Logger.log(`Error parsing squares_config JSON: ${e.message}`);
    saved = {};
  }

  const isPaid = !!saved.isPaid;
  const pm = saved.paymentMethods || {};
  const activePay = {};

  // Extract active handles/details into a clean key-value dictionary
  if (isPaid) {
    Object.keys(pm).forEach(key => {
      const s = pm[key];
      if (!s || !s.enabled) return;
      const v = (key === 'other') ? s.paymentDetails : s.paymentHandle;
      if (v) activePay[key] = v;
    });
  }

  return {
    ...saved, // Retains all fields (groupName, away, home, winRules, payouts, etc.)
    isPaid: isPaid,
    cost: isPaid ? (Number(saved.cost) || 0) : 0,
    minSquares: Number(saved.minSquares) || 1,
    maxSquares: Number(saved.maxSquares) || 100,
    disableAdditionalResponses: !!saved.disableAdditionalResponses,
    commishCut: Number(saved.commishCut) || 0,
    paymentMethods: pm,            // Preserves raw structure (enabled state, handles, details)
    activePaymentMethods: activePay // Extracted map for easy handle lookups
  };
}

// Cached; this is what the client POLLS
function getSyncData() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get(SYNC_CACHE_KEY);
  if (hit) return JSON.parse(hit);

  const { members, takenSquares } = readEntries_();
  const data = {
    members: members,
    takenSquares: takenSquares,
    config: readConfig_(),
    matchup: readMatchup_()
  };
  try { cache.put(SYNC_CACHE_KEY, JSON.stringify(data), SYNC_CACHE_TTL); } catch (e) {}
  return data;
}

// Full payload for initial page load (and the sidebar). Includes newColor, which is never cached
function getPickerData() {
  const data = getSyncData();
  data.newColor = generateUniqueColor();
  Logger.log(JSON.stringify(data));
  return data;
}

// Optional alias in case anything already calls the new name
function getInitialPickerData() {
  return getPickerData();
}

function getOrCreateEntriesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ENTRIES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ENTRIES_SHEET);
    sheet.getRange(1, 1, 1, 4).setValues([['TIMESTAMP', 'NAME', 'SQUARE', 'COLOR']]);
    sheet.setFrozenRows(1);
    
    // Set up RESULTS section
    sheet.getRange(1, 6, 1, 3).setValues([['QUARTER', 'WINNER', 'PAYOUT/STATUS']]);
    sheet.getRange(2, 6, 4, 1).setValues([['Q1'], ['Q2'], ['Q3'], ['Q4']]);
    ss.setNamedRange('RESULTS', sheet.getRange(2, 7, 4, 2));
    
    // Set up ENTRIES_AWAY and ENTRIES_HOME
    sheet.getRange(7, 6).setValue("AWAY TEAM");
    const entAwayRange = sheet.getRange(8, 6, 1, 3);
    entAwayRange.merge();
    ss.setNamedRange('ENTRIES_AWAY', entAwayRange);
    
    sheet.getRange(10, 6).setValue("HOME TEAM");
    const entHomeRange = sheet.getRange(11, 6, 1, 3);
    entHomeRange.merge();
    ss.setNamedRange('ENTRIES_HOME', entHomeRange);
  } else {
    if (!ss.getRangeByName('RESULTS')) ss.setNamedRange('RESULTS', sheet.getRange(2, 7, 4, 2));
    if (!ss.getRangeByName('ENTRIES_AWAY')) {
      const r = sheet.getRange(8, 6, 1, 3);
      ss.setNamedRange('ENTRIES_AWAY', r);
    }
    if (!ss.getRangeByName('ENTRIES_HOME')) {
      const r = sheet.getRange(11, 6, 1, 3);
      ss.setNamedRange('ENTRIES_HOME', r);
    }
  }
  return sheet;
}

// ==========================================
// 3. SUBMISSION & GRID DISPLAY
// ==========================================

function submitSquarePicks(name, numbers, color) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: 'Server is busy. Please try submitting again.' };
  }

  try {
    // --- Sanitize input ---
    name = String(name || '').trim().replace(/^[=+\-@\s]+/, '').slice(0, 40); // no formula injection
    if (!name) return { success: false, message: 'Please enter a valid name.' };

    if (!Array.isArray(numbers)) return { success: false, message: 'Invalid selection.' };
    const nums = Array.from(new Set(numbers.map(Number)));
    if (!nums.length || nums.some(n => !Number.isInteger(n) || n < 1 || n > 100)) {
      return { success: false, message: 'Invalid square selection.' };
    }

    // --- Fresh, uncached read inside the lock ---
    const { members, takenSquares } = readEntries_(); 

    const clash = nums.filter(n => takenSquares[n]);
    if (clash.length) {
      return { success: false, message: `The following squares were already taken: ${clash.join(', ')}` };
    }

    // Existing members keep their stored color; new members get a validated one
    const existing = members[name];
    const finalColor = existing
      ? existing.color
      : (/^#[0-9a-f]{6}$/i.test(String(color)) ? color : '#4CAF50');

    // --- Enforce min/max server-side ---
    const config = readConfig_();
    const minSquares = config.minSquares || 1;
    const maxSquares = config.maxSquares || 50;
    const total = (existing ? existing.squares.length : 0) + nums.length;
    if (total > maxSquares) return { success: false, message: `Maximum is ${max} squares per person.` };
    if (total < minSquares) return { success: false, message: `Minimum is ${min} square(s) per person.` };

    // --- Write ---
    const sheet = getOrCreateEntriesSheet();
    const timestamp = new Date();
    const rows = nums.map(n => [timestamp, name, n, finalColor]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);

    nums.forEach(n => updateGridDisplay(n, name, finalColor));

    SpreadsheetApp.flush();
    CacheService.getScriptCache().remove(SYNC_CACHE_KEY);

    return { success: true, message: `Successfully claimed squares: ${nums.sort((a,b)=>a-b).join(', ')}!` };
  } catch (err) {
    return { success: false, message: 'Error saving picks: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

function updateGridDisplay(squareNumber, name, color) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const range = ss.getRangeByName(NAMED_RANGE);
  if (!range) return;

  const row = Math.floor((squareNumber - 1) / 10);
  const col = (squareNumber - 1) % 10;
  const cell = range.getCell(row + 1, col + 1);

  cell.setValue(name)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  if (color) {
    const textColor = (typeof getContrastingTextColor === 'function') 
      ? getContrastingTextColor(color) 
      : '#000000';
    cell.setBackground(color).setFontColor(textColor);
  }
}

function getAvailableSquares() {
  const sheet = getOrCreateEntriesSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return Array.from({ length: 100 }, (_, i) => i + 1);
  }
  
  const entries = sheet.getRange(2, 3, lastRow - 1, 1).getValues().flat();
  const takenSquares = new Set(entries.map(Number));
  
  const allSquares = Array.from({ length: 100 }, (_, i) => i + 1);
  return allSquares.filter(square => !takenSquares.has(square));
}

// ==========================================
// 4. NUMBER ASSIGNMENT & RANDOMIZATION
// ==========================================

function setNumbers(clear) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hor = ss.getRangeByName('AWAY_NUMBERS');
  const vert = ss.getRangeByName('HOME_NUMBERS');

  if (!hor || !vert) {
    SpreadsheetApp.getUi().alert('Error: Named ranges AWAY_NUMBERS and/or HOME_NUMBERS not found.');
    return;
  }

  if (clear === true) {
    hor.clearContent();
    vert.clearContent();
    ss.toast('Cleared numbers present on the sheet.', '⭕ Cleared');
    Logger.log('⭕ Cleared: Cleared numbers present on the sheet.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const hasExisting = hor.getValues().flat().some(v => v !== '') || vert.getValues().flat().some(v => v !== '');
  
  if (hasExisting) {
    const check = ui.alert('⚠️ Existing Numbers', 'The numbers ranges are not clear, are you sure you want to set new values?', ui.ButtonSet.YES_NO);
    if (check !== ui.Button.YES) return;
  }

  const random = ui.alert(
    '▶️ Randomize Numbers',
    'Do you want the numbers randomized?\n\nClick "Yes" for Random.\nClick "No" for 0-9.\nClick "Cancel" to abort.',
    ui.ButtonSet.YES_NO_CANCEL
  );

  if (random === ui.Button.YES) {
    hor.setValues([randomArray(true, false)]);
    vert.setValues(randomArray(true, true));
    ss.toast('Assigned randomized numbers.', '🎲 Done');
    Logger.log('🎲 Done: Assigned randomized numbers.');
  } else if (random === ui.Button.NO) {
    hor.setValues([randomArray(false, false)]);   
    vert.setValues(randomArray(false, true));
    ss.toast('Assigned sequential numbers (0-9).', '🔢 Done');
    Logger.log('🔢 Done: Assigned sequential numbers (0-9).');
  } else {
    ui.alert('❌ Canceled', 'Number setting canceled.', ui.ButtonSet.OK);
  }
}

function clearNumbers() {
  setNumbers(true);
}

function randomArray(shuffle, vertical) {  
  function shuffleArray(array) {
    const arr = [...array];
    for (let a = arr.length - 1; a > 0; a--) {
      const b = Math.floor(Math.random() * (a + 1));
      [arr[a], arr[b]] = [arr[b], arr[a]];
    }
    return arr;
  }
  
  let digits = Array.from({ length: 10 }, (_, x) => x);  
  if (shuffle) digits = shuffleArray(digits);
  if (vertical) digits = digits.map(x => [x]);
  
  return digits;
}

// ==========================================
// 5. COLOR PALETTE HELPERS
// ==========================================

function generateUniqueColor(baseColor) {
  const sheet = getOrCreateEntriesSheet();
  const lastRow = sheet.getLastRow();
  const existingColors = lastRow > 1 
    ? sheet.getRange(2, 4, lastRow - 1, 1).getValues().flat().filter(Boolean)
    : [];

  if (!baseColor) {
    const hue = Math.floor(Math.random() * 360);
    baseColor = hslToHex(hue, 70, 50);
  }
  
  let [h, s, l] = hexToHSL(baseColor);
  let attempts = 0;
  let newColor = baseColor;
  
  while (existingColors.includes(newColor) && attempts < 15) {
    h = (h + 37) % 360;
    s = Math.min(90, Math.max(40, s + (Math.random() * 20 - 10)));
    l = Math.min(65, Math.max(35, l + (Math.random() * 20 - 10)));
    newColor = hslToHex(h, s, l);
    attempts++;
  }
  
  return newColor;
}

function hexToHSL(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  if (s === 0) {
    const val = toHex(l);
    return `#${val}${val}${val}`;
  }

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const r = hue2rgb(p, q, h + 1/3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1/3);

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ==========================================
// 6. ONEDIT & WINNER EVALUATION
// ==========================================

function onEdit(e) {
  // Prevent errors if run manually from the editor
  if (!e || !e.range) return;
  
  const ss = e.source;
  
  // Helper to check if the cell the user just edited overlaps with our target ranges
  function isIntersecting(targetRange, testRange) {
    if (!targetRange || !testRange) return false;
    if (targetRange.getSheet().getName() !== testRange.getSheet().getName()) return false;
    return !(testRange.getLastRow() < targetRange.getRow() || 
             testRange.getRow() > targetRange.getLastRow() || 
             testRange.getLastColumn() < targetRange.getColumn() || 
             testRange.getColumn() > targetRange.getLastColumn());
  }

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  let editedScores = false;
  
  for (let q of quarters) {
    const awayRange = ss.getRangeByName(`${q}_AWAY`);
    const homeRange = ss.getRangeByName(`${q}_HOME`);
    
    const isAwayEdit = isIntersecting(awayRange, e.range);
    const isHomeEdit = isIntersecting(homeRange, e.range);
    
    if (isAwayEdit || isHomeEdit) {
      // --- SCORE PROGRESSION VALIDATION ---
      const teamStr = isAwayEdit ? 'AWAY' : 'HOME';
      const qIndex = quarters.indexOf(q);
      const editedScoreStr = e.range.getValue();
      const editedScore = parseInt(editedScoreStr, 10);
      
      // Only validate if a number was actually entered (ignores clears/deletes)
      if (editedScoreStr !== '' && !isNaN(editedScore)) {
        if (qIndex > 0) {
          const prevQ = quarters[qIndex - 1];
          const prevScoreStr = ss.getRangeByName(`${prevQ}_${teamStr}`).getValue();
          if (prevScoreStr !== '' && editedScore < parseInt(prevScoreStr, 10)) {
            ss.toast(`Score cannot drop! ${prevQ} was ${prevScoreStr}.`, '❌ Invalid Score');
            e.range.setValue(e.oldValue || ''); 
            return;
          }
        }
        if (qIndex < quarters.length - 1) {
          const nextQ = quarters[qIndex + 1];
          const nextScoreStr = ss.getRangeByName(`${nextQ}_${teamStr}`).getValue();
          if (nextScoreStr !== '' && editedScore > parseInt(nextScoreStr, 10)) {
            ss.toast(`Score cannot be higher than ${nextQ} (${nextScoreStr}).`, '❌ Invalid Score');
            e.range.setValue(e.oldValue || ''); 
            return;
          }
        }
      }
      editedScores = true;
      break; 
    }
  }

  // If a score was successfully edited or cleared, trigger a complete recalculation
  if (editedScores) {
    recalculateAllWinners(ss);
  }
}

/**
 * Reads all scores, evaluates all active win rules, logs payouts, and completely rebuilds the grid.
 */
function recalculateAllWinners(ss) {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  
  const awayNumsRange = ss.getRangeByName('AWAY_NUMBERS');
  const homeNumsRange = ss.getRangeByName('HOME_NUMBERS');
  const squaresRange = ss.getRangeByName('SQUARES');
  if (!awayNumsRange || !homeNumsRange || !squaresRange) return;

  const awayNums = awayNumsRange.getValues()[0];
  const homeNums = homeNumsRange.getValues().map(r => r[0]);

  // 1. Fetch current configurations & payouts rules
  const rawConfigStr = PropertiesService.getDocumentProperties().getProperty('squares_config');
  const config = rawConfigStr ? JSON.parse(rawConfigStr) : {};
  const rules = config.winRules || { adjWrap: true, diagWrap: true };
  const payoutsConfig = config.payouts || {
    main: { active: true, splits: [0,0,0,0] }, 
    inverse: { active: false, splits: [0,0,0,0] }, 
    adjacent: { active: false, splits: [0,0,0,0] }, 
    diagonal: { active: false, splits: [0,0,0,0] }
  };
  
  const isPaid = config.isPaid === true && config.cost > 0;

  // 2. Pre-fill memory dictionary for all 100 squares
  let winsBySquare = {};
  for(let i=1; i<=100; i++) {
    winsBySquare[i] = { 
      badges: [], 
      payouts: { main: [0,0,0,0], inverse: [0,0,0,0], adjacent: [0,0,0,0], diagonal: [0,0,0,0] } 
    };
  }

  let allWinEvents = [];

  // 3. Process every quarter's score
  for (let q of quarters) {
    let qIndex = quarters.indexOf(q);
    const aScore = ss.getRangeByName(`${q}_AWAY`).getValue();
    const hScore = ss.getRangeByName(`${q}_HOME`).getValue();
    
    if (aScore !== '' && hScore !== '') {
      const aDigit = parseInt(aScore, 10) % 10;
      const hDigit = parseInt(hScore, 10) % 10;
      
      if (!isNaN(aDigit) && !isNaN(hDigit)) {
        const colIdx = awayNums.findIndex(v => v !== '' && parseInt(v, 10) === aDigit);
        const rowIdx = homeNums.findIndex(v => v !== '' && parseInt(v, 10) === hDigit);
        
        if (colIdx !== -1 && rowIdx !== -1) {
          const mainSquare = (rowIdx * 10) + colIdx + 1;
          
          // MAIN WINNER
          let pMain = isPaid ? (payoutsConfig.main.splits[qIndex] || 0) : 1;
          allWinEvents.push({ quarter: q, type: 'main', sq: mainSquare, emoji: `${q}🏆`, payout: pMain, order: 1 });

          // INVERSE WINNER
          if (payoutsConfig.inverse && payoutsConfig.inverse.active) {
            const invColIdx = awayNums.findIndex(v => v !== '' && parseInt(v, 10) === hDigit);
            const invRowIdx = homeNums.findIndex(v => v !== '' && parseInt(v, 10) === aDigit);
            if (invColIdx !== -1 && invRowIdx !== -1) {
              const invSq = (invRowIdx * 10) + invColIdx + 1;
              let pInv = isPaid ? (payoutsConfig.inverse.splits[qIndex] || 0) : 1;
              allWinEvents.push({ quarter: q, type: 'inverse', sq: invSq, emoji: `${q}🔃`, payout: pInv, order: 2 });
            }
          }

          // ADJACENT WINNERS
          if (payoutsConfig.adjacent && payoutsConfig.adjacent.active) {
            const adjSquares = getSurroundingSquares(mainSquare, 'adjacent', rules.adjWrap);
            let pAdj = isPaid ? (payoutsConfig.adjacent.splits[qIndex] || 0) : 1;
            adjSquares.forEach(win => {
              allWinEvents.push({ quarter: q, type: 'adjacent', sq: win.sq, emoji: `${q}${win.effect}`, payout: pAdj, order: 3 });
            });
          }

          // DIAGONAL WINNERS
          if (payoutsConfig.diagonal && payoutsConfig.diagonal.active) {
            const diagSquares = getSurroundingSquares(mainSquare, 'diagonal', rules.diagWrap);
            let pDiag = isPaid ? (payoutsConfig.diagonal.splits[qIndex] || 0) : 1;
            diagSquares.forEach(win => {
              allWinEvents.push({ quarter: q, type: 'diagonal', sq: win.sq, emoji: `${q}${win.effect}`, payout: pDiag, order: 4 });
            });
          }
        }
      }
    }
  }

  // 4. Map Valid Entries to the Win Events
  const entriesMap = getEntriesMap();
  let validWinEvents = [];

  allWinEvents.forEach(evt => {
    let owner = entriesMap[evt.sq];
    if (owner) {
      evt.ownerName = owner.name;
      evt.color = owner.color; // Used for summary sheets
      validWinEvents.push(evt);
      
      // Update Grid Render object
      winsBySquare[evt.sq].badges.push(evt.emoji);
      winsBySquare[evt.sq].payouts[evt.type][quarters.indexOf(evt.quarter)] += evt.payout;
    }
  });

  // 5. Rebuild Grid Text, Backgrounds, and collect borders for winners
  let rtvArray = [];
  let bgArray = [];
  let fcArray = [];
  let winningA1s = []; 
  
  const sheet = squaresRange.getSheet();
  const startRow = squaresRange.getRow();
  const startCol = squaresRange.getColumn();

  for (let r = 0; r < 10; r++) {
    let rtvRow = [];
    let bgRow = [];
    let fcRow = [];
    
    for (let c = 0; c < 10; c++) {
      let sq = (r * 10) + c + 1;
      let owner = entriesMap[sq];
      let badges = winsBySquare[sq].badges;
      
      if (owner) {
        let nameStr = owner.name;
        let badgeStr = badges.join(' ');
        let fullText = badges.length > 0 ? `${nameStr}\n${badgeStr}` : nameStr;
        let rtvBuilder = SpreadsheetApp.newRichTextValue().setText(fullText);
        
        rtvBuilder.setTextStyle(0, nameStr.length, SpreadsheetApp.newTextStyle().setFontFamily("Lexend").setFontSize(11).setBold(true).build());
        
        if (badges.length > 0) {
          rtvBuilder.setTextStyle(nameStr.length, fullText.length, SpreadsheetApp.newTextStyle().setFontFamily("Lexend").setFontSize(8).setBold(false).build());
          winningA1s.push(sheet.getRange(startRow + r, startCol + c).getA1Notation());
        }
        
        rtvRow.push(rtvBuilder.build());
        bgRow.push(owner.color || '#ffffff');
        fcRow.push(typeof getContrastingTextColor === 'function' ? getContrastingTextColor(owner.color) : '#000000');
      } else {
        rtvRow.push(SpreadsheetApp.newRichTextValue().setText('').build());
        bgRow.push('#ffffff');
        fcRow.push('#000000');
      }
    }
    rtvArray.push(rtvRow);
    bgArray.push(bgRow);
    fcArray.push(fcRow);
  }

  // Apply Grid Data Instantly
  squaresRange.setRichTextValues(rtvArray);
  squaresRange.setBackgrounds(bgArray);
  squaresRange.setFontColors(fcArray);
  squaresRange.setWrap(true);
  
  squaresRange.setBorder(true, true, true, true, true, true, '#333333', SpreadsheetApp.BorderStyle.SOLID);
  if (winningA1s.length > 0) {
    sheet.getRangeList(winningA1s).setBorder(true, true, true, true, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_THICK);
  }

  // 6. Generate Side Sheets
  writePayoutsToEntries(winsBySquare, isPaid);
  generateWinnersSheet(ss, validWinEvents, isPaid);
  generatePayoutsSheet(ss, validWinEvents, isPaid);
  
  ss.toast('Grid, Winners, and Payouts updated based on current scores!', '✅ Scoring Complete', 5);
}

// ==========================================
// WINNERS & PAYOUTS SHEET GENERATION
// ==========================================

function generateWinnersSheet(ss, validWinEvents, isPaid) {
  let sheet = ss.getSheetByName('WINNERS');
  if (!sheet) {
    sheet = ss.insertSheet('WINNERS');
  }
  sheet.showSheet();

  // Enforce Exactly 4 Columns
  if (sheet.getMaxColumns() > 4) sheet.deleteColumns(5, sheet.getMaxColumns() - 4);
  if (sheet.getMaxColumns() < 4) sheet.insertColumnsAfter(sheet.getMaxColumns(), 4 - sheet.getMaxColumns());

  // Setup Header
  // sheet.getRange("A1").setValue("WINNERS").setFontWeight("bold").setFontFamily("Lexend").setFontSize(12);
  // sheet.getRange("A2:D2").setValues([["QUARTER", "COLOR", "NAME", "CONTEST"]])
  //      .setFontWeight("bold").setFontFamily("Lexend").setFontSize(10).setBackground("#000000").setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  
  // Clean Data area
  let maxRows = sheet.getMaxRows();
  if (maxRows >= 3) {
    sheet.getRange(3, 1, maxRows - 2, 4).clearContent().clearFormat().clearDataValidations();
  }

  if (validWinEvents.length === 0) return;

  // Group by Quarter, then by Owner to combine multi-winners
  const qGroups = {};
  validWinEvents.forEach(win => {
    let qNum = win.quarter.replace('Q', '');
    if (!qGroups[qNum]) qGroups[qNum] = {};
    if (!qGroups[qNum][win.ownerName]) {
      qGroups[qNum][win.ownerName] = { name: win.ownerName, color: win.color, wins: [], winCount: 0 };
    }
    
    let contestStr = win.emoji;
    if (isPaid) contestStr += ` ($${win.payout})`;
    
    qGroups[qNum][win.ownerName].wins.push(contestStr);
    qGroups[qNum][win.ownerName].winCount++;
  });

  let output = [];
  let colors = [];
  let mergeRanges = [];
  let startRow = 3;
  let minRows = 999;

  // Process Quarters Sorted 1 to 4
  Object.keys(qGroups).sort().forEach(qNum => {
    let members = Object.values(qGroups[qNum]);
    // Sort combined winners by Most Wins, then alphabetically
    members.sort((a, b) => b.winCount - a.winCount || a.name.localeCompare(b.name));
    
    let qStart = startRow + output.length;
    let numRows = members.length;
    minRows = Math.min(minRows, numRows);

    members.forEach((m, idx) => {
      output.push([idx === 0 ? qNum : "", "", m.name, m.wins.join(', ')]);
      colors.push(['#ffffff', m.color || '#ffffff', '#ffffff', '#ffffff']);
    });

    mergeRanges.push({ row: qStart, numRows: numRows });
  });

  // Most Wins Summary Row
  let globalWinCounts = {};
  validWinEvents.forEach(win => globalWinCounts[win.ownerName] = (globalWinCounts[win.ownerName] || 0) + 1);
  let maxWins = Math.max(...Object.values(globalWinCounts));
  let topWinners = Object.keys(globalWinCounts).filter(n => globalWinCounts[n] === maxWins);
  
  let summaryText = "";
  if (maxWins > 0) {
    summaryText = topWinners.length === 1 ? `${topWinners[0]} (${maxWins} Wins)` : `${topWinners.length}-Way Tie With ${maxWins} Wins`;
  }
  
  output.push(["MOST WINS", "", "", summaryText]);
  colors.push(['#f3f3f3', '#f3f3f3', '#f3f3f3', '#f3f3f3']);

  // Match Sheet Rows to Array Size precisely
  let requiredRows = 2 + output.length;
  if (sheet.getMaxRows() < requiredRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  } else if (sheet.getMaxRows() > requiredRows) {
    sheet.deleteRows(requiredRows + 1, sheet.getMaxRows() - requiredRows);
  }

  // Apply Values and Formatting
  let dataRange = sheet.getRange(3, 1, output.length, 4);
  dataRange.setValues(output);
  
  dataRange.setBackgrounds(colors);
  dataRange.setFontFamily("Lexend").setFontSize(10).setVerticalAlignment('middle');
  
  // Merge final row summary of most wins
  sheet.getRange(output.length + 2, 1, 1, 3).merge().setHorizontalAlignment('center');
  
  // 1. Standard thin borders everywhere first
  dataRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);

  // Determine uniform Quarter font size (Max 50, scales up by 10 per row)
  let qFontSize = Math.min(50, Math.max(10, minRows * 10));

  // 2. Apply Merges, Font Sizes, and Thick Borders
  mergeRanges.forEach(m => {
    // Apply thick bottom border to the ENTIRE block's bounding box
    sheet.getRange(m.row, 1, m.numRows, 4)
         .setBorder(null, null, true, null, null, null, '#000000', SpreadsheetApp.BorderStyle.SOLID_THICK);

    if (m.numRows > 1) {
      sheet.getRange(m.row, 1, m.numRows, 1).merge();
    }
    sheet.getRange(m.row, 1)
         .setFontSize(qFontSize)
         .setHorizontalAlignment('center')
         .setVerticalAlignment('middle')
         .setFontWeight('bold');
  });

  // Summary Row Merge and Styling
  let sumRow = 2 + output.length;
  sheet.getRange(sumRow, 1, 1, 4).setFontWeight('bold');
  sheet.getRange(sumRow, 3, 1, 2).setHorizontalAlignment('center');
  sheet.getRange(sumRow, 1, 1, 2).merge().setHorizontalAlignment('center'); // Merge "TOTAL" and "COLOR"
}

function generatePayoutsSheet(ss, validWinEvents, isPaid) {
  let sheet = ss.getSheetByName('PAYOUTS');
  
  if (!isPaid) {
    if (sheet) sheet.hideSheet();
    return;
  }

  if (!sheet) {
    sheet = ss.insertSheet('PAYOUTS');
  }
  sheet.showSheet();

  // Enforce Exactly 4 Columns
  if (sheet.getMaxColumns() > 4) sheet.deleteColumns(5, sheet.getMaxColumns() - 4);
  if (sheet.getMaxColumns() < 4) sheet.insertColumnsAfter(sheet.getMaxColumns(), 4 - sheet.getMaxColumns());

  // sheet.getRange("A1").setValue("PAYOUTS").setFontWeight("bold").setFontFamily("Lexend").setFontSize(12);
  // sheet.getRange("A2:D2").setValues([["COLOR", "MEMBER", "TOTAL PAYOUT", "WINNINGS BREAKDOWN"]])
  //      .setFontWeight("bold").setFontFamily("Lexend").setFontSize(10).setBackground("#000000").setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);

  let maxRows = sheet.getMaxRows();
  if (maxRows >= 3) {
    sheet.getRange(3, 1, maxRows - 2, 4).clearContent().clearFormat();
  }

  if (validWinEvents.length === 0) return;

  // Aggregate by owner
  let payoutsMap = {};
  validWinEvents.forEach(win => {
    if (!payoutsMap[win.ownerName]) {
      payoutsMap[win.ownerName] = { name: win.ownerName, color: win.color, total: 0, breakdowns: [] };
    }
    payoutsMap[win.ownerName].total += win.payout;
    payoutsMap[win.ownerName].breakdowns.push(`${win.emoji} ($${win.payout})`);
  });

  let payoutRows = Object.values(payoutsMap);
  payoutRows.sort((a, b) => b.total - a.total); // Sort desc by payout

  let output = [];
  let colors = [];
  payoutRows.forEach(p => {
    output.push(["", p.name, p.total, p.breakdowns.join(', ')]);
    colors.push([p.color || '#ffffff', '#ffffff', '#ffffff', '#ffffff']);
  });
  
  // Manage exact row count
  let requiredRows = 2 + output.length;
  if (sheet.getMaxRows() < requiredRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), requiredRows - sheet.getMaxRows());
  } else if (sheet.getMaxRows() > requiredRows) {
    sheet.deleteRows(requiredRows + 1, sheet.getMaxRows() - requiredRows);
  }

  if (output.length > 0) {
    let dataRange = sheet.getRange(3, 1, output.length, 4);
    dataRange.setValues(output);
    dataRange.setBackgrounds(colors);
    dataRange.setFontFamily("Lexend").setFontSize(10).setVerticalAlignment('middle');
    
    // Standard borders
    dataRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    
    // Format Currency
    sheet.getRange(3, 3, output.length, 1).setNumberFormat('$#,##0');
  }
}

/**
 * Writes the calculated payouts into the designated named ranges on the ENTRIES sheet.
 */
function writePayoutsToEntries(winsBySquare, isPaid) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sqRange = ss.getRangeByName('ENTRIES_SQUARE');
  if (!sqRange) return;
  
  const sqVals = sqRange.getValues();
  const numRows = sqVals.length;
  
  const categories = [
    { key: 'main', suffix: '' },
    { key: 'inverse', suffix: 'I' },
    { key: 'adjacent', suffix: 'A' },
    { key: 'diagonal', suffix: 'D' }
  ];
  
  const outData = {};
  for (let cat of categories) {
    outData[cat.key] = [[], [], [], []]; 
  }
  
  for (let i = 0; i < numRows; i++) {
    const sq = Number(sqVals[i][0]);
    
    if (sq >= 1 && sq <= 100 && winsBySquare[sq]) {
      const p = winsBySquare[sq].payouts;
      for (let cat of categories) {
        for (let q = 0; q < 4; q++) {
          let val = p[cat.key][q];
          outData[cat.key][q].push([val > 0 ? val : '']);
        }
      }
    } else {
      for (let cat of categories) {
        for (let q = 0; q < 4; q++) {
          outData[cat.key][q].push(['']);
        }
      }
    }
  }
  
  const formatStr = isPaid ? '$#,##0' : '0';
  for (let cat of categories) {
    for (let q = 0; q < 4; q++) {
      const rangeName = `ENTRIES_WIN_Q${q + 1}${cat.suffix}`;
      const targetRange = ss.getRangeByName(rangeName);
      
      if (targetRange) {
        const writeRange = targetRange.getSheet().getRange(targetRange.getRow(), targetRange.getColumn(), numRows, 1);
        writeRange.setValues(outData[cat.key][q]);
        writeRange.setNumberFormat(formatStr);
      }
    }
  }
}

// ==========================================
// WINNER HELPERS & GEOMETRY
// ==========================================

function getEntriesMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const map = {};
  
  const sqRange = ss.getRangeByName('ENTRIES_SQUARE');
  const nameRange = ss.getRangeByName('ENTRIES_NAME');
  const colorRange = ss.getRangeByName('ENTRIES_COLOR');
  
  if (!sqRange || !nameRange || !colorRange) return map;
  
  const sqVals = sqRange.getValues();
  const nameVals = nameRange.getValues();
  const colorVals = colorRange.getValues();
  
  for (let i = 0; i < sqVals.length; i++) {
    const sq = Number(sqVals[i][0]);
    const name = String(nameVals[i][0]).trim();
    const color = String(colorVals[i][0]).trim();
    
    if (name && sq >= 1 && sq <= 100) {
      map[sq] = { name: name, color: color };
    }
  }
  return map;
}

function getSurroundingSquares(squareNumber, type, wrap) {
  if (!squareNumber || squareNumber < 1 || squareNumber > 100) return [];
  
  const r = Math.floor((squareNumber - 1) / 10);
  const c = (squareNumber - 1) % 10;
  let offsets = [];
  
  if (type === 'adjacent') {
    offsets = [
      { dr: -1, dc: 0, icon: '⬆️' },
      { dr: 1,  dc: 0, icon: '⬇️' },
      { dr: 0,  dc: -1, icon: '⬅️' },
      { dr: 0,  dc: 1, icon: '➡️' }
    ];
  } else if (type === 'diagonal') {
    offsets = [
      { dr: -1, dc: -1, icon: '↖️' },
      { dr: -1, dc: 1,  icon: '↗️' },
      { dr: 1,  dc: -1, icon: '↙️' },
      { dr: 1,  dc: 1,  icon: '↘️' }
    ];
  } else {
    return [];
  }
  
  const results = [];
  for (let offset of offsets) {
    let newR = r + offset.dr;
    let newC = c + offset.dc;
    
    if (wrap) {
      if (newR < 0) newR = 9;
      if (newR > 9) newR = 0;
      if (newC < 0) newC = 9;
      if (newC > 9) newC = 0;
    } else {
      if (newR < 0 || newR > 9 || newC < 0 || newC > 9) continue;
    }
    
    results.push({ sq: (newR * 10) + newC + 1, effect: offset.icon });
  }
  return results;
}

// ==========================================
// 7. SHEET RESET & MAINTENANCE
// ==========================================
// ==========================================
// 7. SHEET RESET & MAINTENANCE
// ==========================================

function saveAndReset() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  let allScoresEntered = true;
  for (let q of quarters) {
    const aRange = ss.getRangeByName(`${q}_AWAY`);
    const hRange = ss.getRangeByName(`${q}_HOME`);
    if (!aRange || !hRange || aRange.getValue() === '' || hRange.getValue() === '') {
      allScoresEntered = false;
      break;
    }
  }

  const entriesSheet = ss.getSheetByName(ENTRIES_SHEET);
  const hasEntries = entriesSheet && entriesSheet.getLastRow() > 1;
  let warning;
  let check = true;

  if (allScoresEntered) {
    let save = ui.alert('Backup Contest', "All quarter scores are entered!\n\nWould you like to make a backup copy of the entries, winners, and payouts sheets for your records?", ui.ButtonSet.YES_NO_CANCEL);
    if (save == ui.Button.YES) {
      archiveContest(); 
      warning = ui.Button.OK;
      check = false;
    } else if (save == ui.Button.NO) {
      warning = ui.Button.OK;
      check = false;
    }
  }

  if (check && hasEntries) {
    warning = ui.alert('Reset Sheet', "It seems like the contest is incomplete (not all final scores for all four quarters are entered).\n\nAre you sure you want to proceed and reset the sheet? This will clear all entries, scores, and settings.", ui.ButtonSet.OK_CANCEL);
  } else if (check) {
    warning = ui.alert('Reset Sheet', "Would you like to reset the sheet?\n\nThis will clear all entries, scores, and settings.\n\nClick 'OK' to proceed. If needed, you can always use 'File' > 'Version History' to recover previous results.", ui.ButtonSet.OK_CANCEL);
  }
  
  if (warning == ui.Button.OK) {
    let namedRanges = ['AWAY', 'HOME', 'AWAY_NUMBERS', 'HOME_NUMBERS', 'SCORES', 'SQUARES', 'TITLE', 
        'ENTRIES_DATE_CONFIGURED', 'ENTRIES_DATE_SAVED', 'ENTRIES_COST', 'ENTRIES_LIMITS',
        'ENTRIES', // Covers time, name, square, and color  
        'RESULTS', // Covers win column for Q1, Q2, Q3, and Q4
        'ENTRIES_AWAY', 'ENTRIES_HOME', 'ENTRIES_AWAY_SCORES', 'ENTRIES_HOME_SCORES'];
    
    // For ENTRIES_AWAY and ENTRIES_HOME, we clear formatting too
    try {
      const entAway = ss.getRangeByName('ENTRIES_AWAY');
      if (entAway) entAway.clearContent().setBackground('#ffffff').setFontColor('#000000');
    } catch (e) {}
    try {
      const entAwayScores = ss.getRangeByName('ENTRIES_AWAY_SCORES');
      if (entAwayScores) entAwayScores.clearContent().setBackground('#ffffff').setFontColor('#000000');
    } catch (e) {}
    try {
      const entHome = ss.getRangeByName('ENTRIES_HOME');
      if (entHome) entHome.clearContent().setBackground('#ffffff').setFontColor('#000000');
    } catch (e) {}
    try {
      const entHomeScores = ss.getRangeByName('ENTRIES_HOME_SCORES');
      if (entHomeScores) entHomeScores.clearContent().setBackground('#ffffff').setFontColor('#000000');
    } catch (e) {}

    for (let a = 0; a < namedRanges.length; a++) {
      try {
        const range = ss.getRangeByName(namedRanges[a]);
        range.clearContent();
        if (namedRanges[a] == 'AWAY') { ss.getRangeByName(namedRanges[a]).setValue(`RUN CONFIGURATION IN MENU`)}
      } catch (err) {
        Logger.log(`Error with ${namedRanges[a]} when resetting sheet: ${err.stack}`);
      }
    }
    
    const squaresRange = ss.getRangeByName('SQUARES');
    if (squaresRange) {
      squaresRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    }
    
    const sheetSquares = ss.getSheetByName('SQUARES');
    if (sheetSquares) {
      sheetSquares.clearConditionalFormatRules();
      sheetSquares.hideRows(2, 3);
    }

    // Clear and Hide Summary Sheets using .clear() (wipes content + format safely)
    const winnersSheet = ss.getSheetByName('WINNERS');
    if (winnersSheet) {
      winnersSheet.clear();
      winnersSheet.hideSheet();
    }
    
    const payoutsSheet = ss.getSheetByName('PAYOUTS');
    if (payoutsSheet) {
      payoutsSheet.clear();
      payoutsSheet.hideSheet();
    }
    
    setWinnerFormats();
    setTeamFormats();

    // Revert doc properties
    const docProps = PropertiesService.getDocumentProperties();
    docProps.deleteProperty('squares_config');
    
    ss.toast('Successfully reset sheet.', '🔄 Reset');
    Logger.log('🔄 Reset: Successfully reset sheet.');
  } else {
    ss.toast('Canceled reset operation.', '❌ Canceled');
    Logger.log('❌ Canceled: Canceled reset operation.');
  }
}
/**
 * Creates hidden, timestamped backups of ENTRIES, WINNERS, and PAYOUTS.
 * Safely copies ENTRIES without duplicating Named Ranges, trims empty rows/cols, 
 * and handles naming collisions.
 */
function archiveContest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const timestamp = Utilities.formatDate(new Date(), tz, 'MM-dd-yy HH:mm');

  // Fetch the configuration to get the team abbreviations
  const docProps = PropertiesService.getDocumentProperties();
  const savedProps = JSON.parse(docProps.getProperty('squares_config') || '{}');
  // Fallbacks included just in case
  const home = savedProps.homeTeam || savedProps.home; 
  const away = savedProps.awayTeam || savedProps.away;
  
  // Create prefix name `AWAY@HOME`
  const prefix = (away && home) ? `${away}@${home}` : null;

  // 1. Update the "ENTRIES_DATE_SAVED" named range on the source sheet BEFORE copying
  // This ensures the timestamp gets stamped onto the backup copy!
  const dateSavedRange = ss.getRangeByName('ENTRIES_DATE_SAVED');
  if (dateSavedRange) {
    dateSavedRange.setValue(timestamp);
  }

  // --- HELPER FUNCTIONS ---
  // Helper to ensure a unique sheet name or overwrite an existing one safely
  function getSafeTargetSheet(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear(); 
    }
    return sheet;
  }

  // Helper to delete extra rows/cols to prevent file bloat
  function trimSheet(sheet, lastRow, lastCol) {
    const maxRows = sheet.getMaxRows();
    const maxCols = sheet.getMaxColumns();
    if (maxRows > lastRow && lastRow > 0) sheet.deleteRows(lastRow + 1, maxRows - lastRow);
    if (maxCols > lastCol && lastCol > 0) sheet.deleteColumns(lastCol + 1, maxCols - lastCol);
  }
  // ------------------------

  // 2. Archive ENTRIES (Special copy to avoid duplicating Named Ranges)
  const entries = ss.getSheetByName('ENTRIES');
  let eName = prefix ? `${prefix} - ${timestamp}` : `CONTEST - ${timestamp}`;
  
  if (entries) {
    const eCopy = getSafeTargetSheet(eName);
    const dataRange = entries.getDataRange();
    
    // Copy formats and values safely
    dataRange.copyTo(eCopy.getRange(1, 1), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    dataRange.copyTo(eCopy.getRange(1, 1), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);
    
    // Copy column widths
    const numColumns = dataRange.getNumColumns();
    for (let col = 1; col <= numColumns; col++) {
      eCopy.setColumnWidth(col, entries.getColumnWidth(col));
    }
    
    // Trim, freeze, and hide
    trimSheet(eCopy, dataRange.getLastRow(), numColumns);
    eCopy.setFrozenRows(entries.getFrozenRows());
    eCopy.setFrozenColumns(entries.getFrozenColumns());
    eCopy.hideSheet();
  }

  // 3. Archive WINNERS (using copyTo)
  const winners = ss.getSheetByName('WINNERS');
  if (winners) {
    let wName = prefix ? `${prefix} WINNERS - ${timestamp}` : `WINNERS - ${timestamp}`;
    let existing = ss.getSheetByName(wName);
    if (existing) ss.deleteSheet(existing); // Remove first to prevent copyTo naming collision
    
    const wCopy = winners.copyTo(ss);
    wCopy.setName(wName);
    wCopy.hideSheet();
  }
  
  // 4. Archive PAYOUTS (using copyTo, if it exists and is active)
  const payouts = ss.getSheetByName('PAYOUTS');
  if (payouts && !payouts.isSheetHidden()) {
    let pName = prefix ? `${prefix} PAYOUTS - ${timestamp}` : `PAYOUTS - ${timestamp}`;
    let existing = ss.getSheetByName(pName);
    if (existing) ss.deleteSheet(existing);
    
    const pCopy = payouts.copyTo(ss);
    pCopy.setName(pName);
    pCopy.hideSheet();
  }

  Logger.log(`💾 Successfully archived contest to new tabs prefixed with "${prefix || 'CONTEST'}".`);
  ss.toast(`Saved backup sheets for ${prefix ? prefix : "contest"} successfully.`, `💾 Saved Successfully`);
}
// ==========================================
// 8. WINNER & CONDITIONAL FORMATTING
// ==========================================

function setConditionalFormat(name, color) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const range = ss.getRangeByName('SQUARES');
  const sheet = range.getSheet();

  // Get existing conditional formatting rules
  const rules = sheet.getConditionalFormatRules();
   
  let rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(name)
    .setBackground(color)
    .setFontColor(getContrastingTextColor(color))
    .setRanges([range])
    .build();
  
  // Set the updated list of conditional format rules
  sheet.setConditionalFormatRules(rules.concat(rule));
}

function clearPickGrid() {
  // Reserved for clearing grid display selections
}

function setWinnerFormats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the ranges
  const squaresRange = ss.getRangeByName("SQUARES");
  squaresRange.setBackground('white');
  
  const sheet = squaresRange.getSheet();
  const rules = sheet.getConditionalFormatRules();
  
  // Define quarters
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  
  // Create single match rules (base brightness) - Added first so they're at the bottom of the stack
  quarters.forEach(quarter => {
    const singleMatchFormat = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([squaresRange])
      .whenFormulaSatisfied(createCombinationMatchFormula([quarter]))
      .setBackground(TRI_HIGHLIGHT[0])  // Gold background
      .setBold(true)
      .setItalic(true)
      .build();
    rules.unshift(singleMatchFormat);
  });

  // Create double match rules (medium brightness) - Added second
  const doubleCombs = getCombinations(quarters, 2);
  doubleCombs.forEach(comb => {
    const doubleMatchFormat = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([squaresRange])
      .whenFormulaSatisfied(createCombinationMatchFormula(comb))
      .setBackground(TRI_HIGHLIGHT[1])  // Orange background
      .setBold(true)
      .setItalic(true)
      .build();
    rules.unshift(doubleMatchFormat);
  });

  // Create triple match rules (brightest) - Added last so they're at the top
  const tripleCombs = getCombinations(quarters, 3);
  tripleCombs.forEach(comb => {
    const tripleMatchFormat = SpreadsheetApp.newConditionalFormatRule()
      .setRanges([squaresRange])
      .whenFormulaSatisfied(createCombinationMatchFormula(comb))
      .setBackground(TRI_HIGHLIGHT[2])  // OrangeRed background
      .setBold(true)
      .setItalic(true)
      .build();
    rules.unshift(tripleMatchFormat);
  });
  
  // Update the sheet's conditional formatting rules
  sheet.setConditionalFormatRules(rules);
}

function createMatchFormula(quarter) {
  return `AND(
    NOT(ISBLANK(INDIRECT("${quarter}_AWAY"))),
    NOT(ISBLANK(INDEX(INDIRECT("AWAY_NUMBERS"), 1, COLUMN() - COLUMN(INDIRECT("SQUARES")) + 1))),
    NOT(ISBLANK(INDEX(INDIRECT("HOME_NUMBERS"), ROW() - ROW(INDIRECT("SQUARES")) + 1, 1))),
    MOD(INDIRECT("${quarter}_AWAY"), 10) = INDEX(INDIRECT("AWAY_NUMBERS"), 1, COLUMN() - COLUMN(INDIRECT("SQUARES")) + 1),
    MOD(INDIRECT("${quarter}_HOME"), 10) = INDEX(INDIRECT("HOME_NUMBERS"), ROW() - ROW(INDIRECT("SQUARES")) + 1, 1)
  )`;
}

function createCombinationMatchFormula(quarters) {
  return `=AND(${quarters.map(q => createMatchFormula(q)).join(',')})`;
}

function getCombinations(arr, r) {
  if (r === 1) return arr.map(item => [item]);
  
  const combinations = [];
  
  arr.forEach((item, index) => {
    const remaining = arr.slice(index + 1);
    const subCombinations = getCombinations(remaining, r - 1);
    subCombinations.forEach(subComb => {
      combinations.push([item, ...subComb]);
    });
  });
  
  return combinations;
}

// ==========================================
// 9. NFL TEAM COLORS & VALIDATION
// ==========================================

function updateTeamHexFromGlobal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NFL');
  let valuesAll = [];
  let bgAll = [];
  let textAll = [];
  for (let a = 2; a <= sheet.getMaxRows(); a++) {
    const team = sheet.getRange(a, 1).getValue();
    const colors = NFL_DATA[team];
    let valuesRow = [team];
    let bgRow = [colors[0]];
    let textRow = [colors[1]];
    for (let b = 0; b < colors.length; b++) {
      if (colors[b]) {
        valuesRow.push(colors[b]);
        bgRow.push(colors[b]);
        textRow.push(getContrastingTextColor(colors[b]));
      } else {
        valuesRow.push('');
        bgRow.push('');
        textRow.push('');
      }
    }
    valuesAll.push(valuesRow);
    bgAll.push(bgRow);
    textAll.push(textRow);
  }
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns()).setValues(valuesAll).setBackgrounds(bgAll).setFontColors(textAll);
  ss.toast('Set all backgrounds and text colors to existing HEX values.', '🎨 Colors');
  Logger.log('🎨 Colors: Set all backgrounds and text colors to existing HEX values.');
}

function applyNFLTeamColorsAndValidation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Define the range where you want to apply the formatting (for example, cells A2:A32 for 32 teams)
  const away = ss.getRangeByName('SETUP_AWAY');
  const home = ss.getRangeByName('SETUP_HOME');

  // Create data validation rule for text (team names)
  const teamNames = Object.keys(NFL_DATA);
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(teamNames)
    .setAllowInvalid(false)
    .build();
  
  // Apply the data validation rule to the range
  away.setDataValidation(rule);
  home.setDataValidation(rule);
}

function setTeamFormats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ranges = {
    'Squares Teams Away': { 'names': ['AWAY'], 'reference': null, 'invert': false },
    'Squares Teams Home': { 'names': ['HOME'], 'reference': null, 'invert': true },
    'Away Scores': { 'names': ['Q1_AWAY', 'Q2_AWAY', 'Q3_AWAY', 'Q4_AWAY'], 'reference': 'AWAY', 'invert': false },
    'Home Scores': { 'names': ['Q1_HOME', 'Q2_HOME', 'Q3_HOME', 'Q4_HOME'], 'reference': 'HOME', 'invert': true }
  };
  Object.keys(ranges).forEach(range => {
    applyConditionalFormatting(ss, ranges[range], range);
  });
}

function applyConditionalFormatting(ss, data, dataName) {
  const sheet = ss.getRangeByName(data.names[0]).getSheet();
  const reference = data.reference;
  const invert = data.invert;
  const ranges = data.names.map(name => ss.getRangeByName(name));

  // Get existing conditional formatting rules
  const rules = sheet.getConditionalFormatRules();
  
  // Filter out any rules affecting the target range
  const filteredRules = rules.filter(rule => {
    const ruleRanges = rule.getRanges();
    return !ranges.some(targetRange => 
      ruleRanges.some(ruleRange => isInRange(targetRange, ruleRange))
    );
  });

  function isInRange(targetRange, ruleRange) {
    if (!targetRange || !ruleRange) {
      return false;
    }

    // Get boundaries for the target range
    const targetRangeTop = targetRange.getRow();
    const targetRangeBottom = targetRange.getLastRow();
    const targetRangeLeft = targetRange.getColumn();
    const targetRangeRight = targetRange.getLastColumn();

    // Get boundaries for the rule range
    const ruleRangeTop = ruleRange.getRow();
    const ruleRangeBottom = ruleRange.getLastRow();
    const ruleRangeLeft = ruleRange.getColumn();
    const ruleRangeRight = ruleRange.getLastColumn();

    // Check if target range fits entirely within the rule range boundaries
    return (
      targetRangeTop >= ruleRangeTop &&
      targetRangeBottom <= ruleRangeBottom &&
      targetRangeLeft >= ruleRangeLeft &&
      targetRangeRight <= ruleRangeRight
    );
  }
 
  // Add new rules for the team colors
  const newRules = Object.keys(NFL_DATA).map(abbr => {    
    let rule = SpreadsheetApp.newConditionalFormatRule().setRanges(ranges);
    let teamData = NFL_DATA[abbr];
    if (invert) {
      rule.setBackground(teamData.colors[1] == "#FFFFFF" ? teamData.colors[2] : teamData.colors[1])
        .setFontColor(teamData.colors[0]);
    } else {
      rule.setBackground(teamData.colors[0])
        .setFontColor(teamData.colors[1]);
    }
    if (reference) {
      rule.whenFormulaSatisfied('=index(indirect("' + reference + '"),1,1)="' + teamData.name.toUpperCase() + '"');
    } else {
      rule.whenTextEqualTo(teamData.name.toUpperCase() );
    }
    rule.build();
    return rule;
  });

  newRules.push(SpreadsheetApp.newConditionalFormatRule().setRanges(ranges).setBackground("#ffb81c").setFontColor("#000000").whenTextEqualTo("RUN CONFIGURATION IN MENU").build());
  newRules.push(SpreadsheetApp.newConditionalFormatRule().setRanges(ranges).setBackground("#ffb81c").setFontColor("#000000").whenTextEqualTo("").build());

  // Set the updated list of conditional format rules
  sheet.setConditionalFormatRules(filteredRules.concat(newRules));
  Logger.log(`Successfully set '${dataName}' named ranges for ${ranges.length} ranges`);
}

function updateTeamHexExisting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('NFL');
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();
  if (maxRows < 2) return;

  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  const values = sheet.getRange(2, 1, maxRows - 1, maxCols).getValues();
  const bgAll = [];
  const textAll = [];

  for (let r = 0; r < values.length; r++) {
    const bgRow = [];
    const textRow = [];
    for (let c = 0; c < values[r].length; c++) {
      const val = String(values[r][c]).trim();
      if (hexRegex.test(val)) {
        bgRow.push(val);
        textRow.push(getContrastingTextColor(val));
      } else {
        bgRow.push('#FFFFFF');
        textRow.push('#000000');
      }
    }
    bgAll.push(bgRow);
    textAll.push(textRow);
  }

  sheet.getRange(2, 1, values.length, maxCols)
       .setBackgrounds(bgAll)
       .setFontColors(textAll);

  ss.toast('Updated HEX backgrounds and text colors.', '🎨 Done');
  Logger.log('🎨 Done: Updated HEX backgrounds and text colors.');
}

// ==========================================
// 10. COLOR CONTRAST UTILITIES
// ==========================================

function getContrastingTextColor(hex) {
  // Remove '#' if present
  hex = hex.replace(/^#/, '');

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness (perceived luminance)
  const brightness = (0.299 * r) + (0.587 * g) + (0.114 * b);

  // Return white (#FFFFFF) for dark backgrounds, black (#000000) for light backgrounds
  return brightness < 128 ? "#FFFFFF" : "#000000";
}

// ==========================================
// 11. WEB APP DEPLOYMENT GUIDE
// ==========================================

/**
 * Displays a beginner-friendly visual guide explaining how to deploy
 * the Web App and create a shortened link for participants.
 */
function showWebAppDeploymentGuide() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('footballSquaresWebAppGuide')
    .setTitle('🌐 "Form" Guide for NFL Squares')
    .setWidth(520)
    .setHeight(650);
  
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
  Logger.log('🌐 Guide: Displayed Web App deployment guide modal.');
}

function getScriptURL() {
  try {
    const url = ScriptApp.getService().getUrl().replace(/\/dev$/, '/exec');
    
    if (url && url.length > 0) {
      Logger.log("🗳 Web App is deployed! URL: " + url);

      const docProps = PropertiesService.getDocumentProperties();
      const savedProps = JSON.parse(docProps.getProperty('squares_config') || '{}');
      savedProps.url = url;
      savedProps.deployed = true;
      docProps.setProperty('squares_config',JSON.stringify(savedProps));

      Logger.log("💾 Saved URL to document properties")
      
      return url;
    } else {
      Logger.log("⭕ No active web app deployment found or not running in a web app context.");
      return null;
    }
  } catch (e) {
    Logger.log("⚠️ Error or web app context missing: " + e.message);
    return null;
  }
}

// Finds the best available URL for the deployed web app
function getWebAppUrl() {
  const url = getScriptURL();
  if (url && /\/exec$/.test(url)) return { url: url, note: '' };
  if (url) {
    return {
      url: url,
      note: 'This looks like the test (/dev) link, which only editors can open. ' +
            'Use the guide to set up a deployment.'
    };
  }
  return { url: '', note: 'No deployment found. Deploy the script as a web app first, then try again.' };
}

/**
 * Checks web app deployment status and routes to either the link dialog 
 * or the deployment guide based on the payload returned by getWebAppUrl().
 */
function firstDeployWebAppUrlChecker() {
  const ui = SpreadsheetApp.getUi();
  let webAppPayload = null;

  // 1. Safely call getWebAppUrl
  try {
    if (typeof getWebAppUrl === 'function') {
      webAppPayload = getWebAppUrl();
    } else {
      Logger.log('getWebAppUrl function is not defined.');
    }
  } catch (err) {
    Logger.log(`Error calling getWebAppUrl: ${err.message}`);
  }

  // Helper to validate basic URL string format
  const isValidUrl = (urlStr) => {
    if (typeof urlStr !== 'string') return false;
    return urlStr.startsWith('http://') || urlStr.startsWith('https://');
  };

  // 2. Validate payload structure: url is a valid URL string and note is empty/blank
  const isDeployed = webAppPayload && 
                     isValidUrl(webAppPayload.url) && 
                     (!webAppPayload.note || webAppPayload.note.trim() === '');

  // 3. Route to dialog or deployment prompt
  if (isDeployed) {
    if (typeof showSquaresLinkDialog === 'function') {
      showSquaresLinkDialog();
    } else {
      ui.alert('Error', 'showSquaresLinkDialog function was not found.', ui.ButtonSet.OK);
    }
  } else {
    const response = ui.alert(
      'Web Form Not Deployed',
      'The web form deployment URL was not found or is not properly configured.\n\nWould you like to view the step-by-step instructions for deploying the Web App?',
      ui.ButtonSet.OK_CANCEL
    );

    if (response === ui.Button.OK) {
      if (typeof showWebAppDeploymentGuide === 'function') {
        showWebAppDeploymentGuide();
      } else {
        ui.alert('Error', 'showWebAppDeploymentGuide function was not found.', ui.ButtonSet.OK);
      }
    }
  }
}

// Fallback for when getUrl() only returns the /dev link
function setWebAppUrl() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Set Web App URL',
    'Paste the URL from Deploy → Manage deployments (it ends in /exec):',
    ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;

  var v = r.getResponseText().trim();
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(v)) {
    ui.alert('That does not look like a web app URL ending in /exec.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('WEB_APP_URL', v);
  ui.alert('Saved.');
}

function showSquaresLinkDialog() {
  var info = getWebAppUrl();
  var tpl = HtmlService.createTemplate(LINK_DIALOG_HTML_);
  tpl.url = info.url;
  tpl.note = info.note;
  var out = tpl.evaluate().setWidth(440).setHeight(160);
  SpreadsheetApp.getUi().showModalDialog(out, 'Squares Web App');
}

const LINK_DIALOG_HTML_ = `
<!DOCTYPE html>
<html>
<head>
<base target="_top">
<style>
  body { font-family: Arial, sans-serif; margin: 16px; color: #1e293b; }
  input { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; box-sizing: border-box; }
  .row { display: flex; gap: 8px; margin-top: 12px; }
  .btn { flex: 1; text-align: center; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; text-decoration: none; box-sizing: border-box; }
  .open { background: #16a34a; color: #fff; }
  .copy { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
  .note { margin-top: 12px; font-size: 12px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a; padding: 8px; border-radius: 6px; }
</style>
</head>
<body>
  <? if (url) { ?>
    <div style="font-weight:700; margin-bottom:6px;">Web App Link</div>
    <input id="url" type="text" readonly value="<?= url ?>" onclick="this.select()">
    <div class="row">
      <a class="btn open" href="<?= url ?>" target="_blank" rel="noopener">🏈 Open Page</a>
      <button class="btn copy" id="copyBtn" onclick="copyUrl()">📋 Copy Link</button>
    </div>
  <? } ?>
  <? if (note) { ?><div class="note"><?= note ?></div><? } ?>

  <script>
    var busy = false;

    function flash(ok) {
      var btn = document.getElementById('copyBtn');
      if (!btn || busy) return;
      busy = true;
      var oldText = btn.textContent;
      btn.textContent = ok ? '✓ Copied!' : 'Press Ctrl+C to copy';
      btn.style.background = ok ? '#dcfce7' : '#fee2e2';
      setTimeout(function () {
        btn.textContent = oldText;
        btn.style.background = '';
        busy = false;
      }, 1500);
    }

    function copyUrl() {
      var input = document.getElementById('url');
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      if (ok) { flash(true); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value).then(
          function () { flash(true); },
          function () { flash(false); }
        );
      } else {
        flash(false);
      }
    }
  </script>
</body>
</html>`;

// ==========================================
// 12. START GAME & VISIBILITY TOOLS
// ==========================================

function startGame() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  // 1. Check if the grid is full
  const entriesSheet = ss.getSheetByName('ENTRIES');
  let entriesCount = 0;
  if (entriesSheet) {
    entriesCount = Math.max(0, entriesSheet.getLastRow() - 1);
  }
  
  if (entriesCount < 100) {
    const response = ui.alert(
      '⚠️ Grid Incomplete', 
      `There are only ${entriesCount}/100 squares claimed.\n\nAre you sure you want to start the game and reveal the scoring rows?`, 
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }
  
  // 2. Unhide Rows 2, 3, and 4 on the SQUARES sheet
  const squaresSheet = ss.getSheetByName('SQUARES');
  if (squaresSheet) {
    squaresSheet.showRows(2, 3); // Unhides 3 rows starting at row 2
  }
  
  // 3. Unhide WINNERS sheet
  let winnersSheet = ss.getSheetByName('WINNERS');
  if (winnersSheet) winnersSheet.showSheet();
  
  // 4. Handle PAYOUTS sheet visibility
  const configStr = PropertiesService.getDocumentProperties().getProperty('squares_config');
  const config = configStr ? JSON.parse(configStr) : {};
  const isPaid = config.isPaid === true && config.cost > 0;
  
  let payoutsSheet = ss.getSheetByName('PAYOUTS');
  if (isPaid && payoutsSheet) {
    payoutsSheet.showSheet();
  } else if (!isPaid && payoutsSheet) {
    payoutsSheet.hideSheet();
  }
  
  // 5. Show Explanatory Dialog
  let msg = "The Quarterly Scoring cells (Rows 2-4) have been revealed on the SQUARES board!\n\n" +
            "HOW TO PLAY:\n" +
            "As the game progresses, simply enter the Home and Away scores for each quarter into those top cells.\n\n" +
            "The board will automatically evaluate the numbers, flag the winning squares with emojis and borders, and record all outcomes to the ENTRIES and WINNERS sheets.";
  
  if (isPaid) {
    msg += "\n\nSince this is a paid pool, the financial totals and leaderboard have also been revealed on the PAYOUTS sheet.";
  }
  
  ui.alert('▶️ Game Started!', msg, ui.ButtonSet.OK);
}

/**
 * Instantly hides the PAYOUTS sheet if the pool changes from Paid to Free
 */
function updatePayoutsSheetVisibility(isPaid) {
  if (isPaid) return; // If it's paid, we leave it alone (usually revealed on Start Game)
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('PAYOUTS');
  if (sheet) {
    sheet.hideSheet();
  }
}

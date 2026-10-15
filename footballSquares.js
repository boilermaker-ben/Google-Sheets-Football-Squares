/**
 * GOOGLE SHEETS FOOTBALL SQUARES
 * League Creator & Management Platform Tool
 * v1.0 | 10/14/2026
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
 *  🧮 Set Numbers - Tool to set random values for the home and away scoring digits (can also set 0-9 standard order)
 *  ⭕ Clear Numbers - Removes values for home and away scoring digits
 *  🔄 Save Results & Reset Full Sheet - Removes scoring digits, entries, and clears pool field
 * 
 *  🌐 Web App Setup Guide - Sidebar instruction pop-up to explain how to make a web-based, shareable "Form"
 *  
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
// 0. GLOBALS
// ==========================================

const SCRIPT_VERSION = '1.0';
const SHEET_NAME = 'SQUARES';
const ENTRIES_SHEET = 'ENTRIES';
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
  let isInitialized = false;
  let deployed = false; 
  try {
    props = PropertiesService.getDocumentProperties();
  } catch (e) {}
  try {
    isInitialized = props.getProperty('initialized') === 'true';
  } catch (e) {}
  try {
    const config = props.getProperty('squares_config');
    if (config) {
      deployed = JSON.parse()?.deployed;
    }
  } catch (e) {}

  if (!isInitialized) {
    menu.addItem('🚀 Authorize & Initialize Sheet', 'showHelpSidebar');
  } else {
    menu.addItem('⚙️ Configuration', 'showSquaresConfigSidebar')
      .addItem('🎯 Pick Square', 'showSquarePicker');
      if (deployed) {
        menu.addItem('📋 Open Web Form', 'showSquaresLinkDialog');
      } 
      menu.addSeparator()
      .addItem('🧮 Set Numbers', 'setNumbers')
      .addItem('⭕ Clear Numbers', 'clearNumbers')
      .addItem('🔄 Reset Full Sheet', 'saveAndReset');
      if (!deployed) {
        menu.addSeparator().addItem('🌐 Web App Setup Guide', 'showWebAppDeploymentGuide'); 
      }
      menu.addSeparator().addItem('❓ Help & Instructions', 'showHelpSidebar');
  }
  menu.addToUi();
}

/**
 * Displays the Help / Initialization sidebar.
 * Serves as the menu target and button handler.
 */
function showHelpSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('footballSquaresHelpSidebar')
    .setTitle('NFL Squares Help & Settings')
    .setWidth(350);
  
  SpreadsheetApp.getUi().showSidebar(html);
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
// 1. CONFIGURATION SIDEBAR
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
    payoutSplits: savedProps.payoutSplits || [25, 25, 25, 25],
    paymentMethods: paymentMethods,
    nflData: NFL_DATA
  };
}

function processSquaresConfigSubmission(formObject) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Write text directly to TITLE, AWAY, and HOME named ranges
    const titleRange = ss.getRangeByName('TITLE');
    if (titleRange && formObject.groupName) {
      titleRange.setValue(formObject.groupName);
    }
    
    const awayRange = ss.getRangeByName('AWAY');
    if (awayRange && formObject.awayTeam) {
      awayRange.setValue(NFL_DATA[formObject.awayTeam].name.toUpperCase());
    }

    const homeRange = ss.getRangeByName('HOME');
    if (homeRange && formObject.homeTeam) {
      homeRange.setValue(NFL_DATA[formObject.homeTeam].name.toUpperCase());
    }

    // Update ENTRIES_HOME and ENTRIES_AWAY
    if (formObject.awayTeam) {
      const entAway = ss.getRangeByName('ENTRIES_AWAY');
      if (entAway) {
        entAway.setValue(awayTeamName);
        entAway.setBackground(NFL_DATA[formObject.awayTeam].colors[0]);
        entAway.setFontColor(NFL_DATA[formObject.awayTeam].colors[1]);
      }
      const entAwayScores = ss.getRangeByName('ENTRIES_SCORES_AWAY');
      if (entAwayScores) {
        entAwayScores.setBackground(NFL_DATA[formObject.awayTeam].colors[0]);
        entAwayScores.setFontColor(NFL_DATA[formObject.awayTeam].colors[1]);
      }
    }

    if (formObject.homeTeam) { 
      const entHome = ss.getRangeByName('ENTRIES_HOME');
      if (entHome) {
        entHome.setValue(homeTeamName);
        entHome.setBackground(NFL_DATA[formObject.homeTeam].colors[0]);
        entHome.setFontColor(NFL_DATA[formObject.homeTeam].colors[1]);
      }
      const entHomeScores = ss.getRangeByName('ENTRIES_SCORES_HOME');
      if (entHomeScores) {
        entHomeScores.setBackground(NFL_DATA[formObject.homeTeam].colors[0]);
        entHomeScores.setFontColor(NFL_DATA[formObject.homeTeam].colors[1]);
      }
    }
    
    const updateTime = new Date().toISOString();
    const updatedTimeRange = ss.getRangeByName('ENTRIES_DATE_CONFIGURED');
    if (updatedTimeRange && updateTime) {
      updatedTimeRange.setValue(updateTime);
    }

    // 2. Cost & Limits
    const isPaid = formObject.isPaid === true || formObject.isPaid === 'true';
    const cost = isPaid ? (parseFloat(formObject.cost) || 0) : 0;
    
    const costRange = ss.getRangeByName('ENTRIES_COST');
    if (costRange) {
      if (isPaid) {
        costRange.setValue(`$${cost}`);
      } else {
        costRange.setValue('FREE');
      }
    }
    
    const minSquares = formObject.minSquares || 1;
    const maxSquares = formObject.maxSquares || 50;
    
    const minMaxRange = ss.getRangeByName('ENTRIES_LIMITS');
    if (minMaxRange) {
      minMaxRange.setValue(`${minSquares} to ${maxSquares}`);
    }
    
    const disableAdditionalResponses = formObject.disableAdditionalResponses || false;
    const paymentMethods = formObject.paymentMethods || null;

    // 3. Document Properties
    const docProps = PropertiesService.getDocumentProperties();
    const configToSave = {
      away: formObject.awayTeam,
      home: formObject.homeTeam,
      isPaid: isPaid,
      cost: cost,
      minSquares: minSquares,
      maxSquares: maxSquares,
      disableAdditionalResponses: disableAdditionalResponses,
      commishCut: parseFloat(formObject.commishCut) || 0,
      payoutSplits: formObject.payoutSplits || [25, 25, 25, 25],
      paymentMethods: paymentMethods,
      updatedAt: updateTime,
    };
    docProps.setProperty('squares_config', JSON.stringify(configToSave));

    ss.toast('Matchup and pool settings updated.', '🏈 Saved');
    Logger.log('🏈 Saved: Matchup and pool settings updated.');

    return { success: true };
  } catch (err) {
    Logger.log(`Error in processSquaresConfigSubmission: ${err.stack}`);
    throw new Error(err.message);
  }
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

function readConfig_() {
  const saved = JSON.parse(
    PropertiesService.getDocumentProperties().getProperty('squares_config') || '{}'
  );
  const pm = saved.paymentMethods || {};
  const pay = {};

  if (saved.isPaid) {
    Object.keys(pm).forEach(key => {
      const s = pm[key];
      if (!s || !s.enabled) return;
      const v = (key === 'other') ? s.paymentDetails : s.paymentHandle;
      if (v) pay[key] = v;
    });
  }

  return {
    isPaid: !!saved.isPaid,
    cost: saved.isPaid ? Number(saved.cost) || 0 : 0,
    minSquares: Number(saved.minSquares) || 1,
    maxSquares: Number(saved.maxSquares) || 100,
    disableAdditionalResponses: !!saved.disableAdditionalResponses,
    paymentMethods: pay
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
    const [, min, max] = readConfig_();
    const total = (existing ? existing.squares.length : 0) + nums.length;
    if (total > max) return { success: false, message: `Maximum is ${max} squares per person.` };
    if (total < min) return { success: false, message: `Minimum is ${min} square(s) per person.` };

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
  const qEmojis = { 'Q1': '1️⃣', 'Q2': '2️⃣', 'Q3': '3️⃣', 'Q4': '4️⃣' };
  
  for (let q of quarters) {
    const awayRange = ss.getRangeByName(`${q}_AWAY`);
    const homeRange = ss.getRangeByName(`${q}_HOME`);
    
    // Check if the cell edited belongs to the current quarter in the loop
    if (isIntersecting(awayRange, e.range) || isIntersecting(homeRange, e.range)) {
      
      // a) Toast and log that a score was entered
      ss.toast(`${qEmojis[q]} Score entered for ${q}!`, 'Score Updated');
      Logger.log(`${q} score was modified.`);
      
      // b) Evaluate if both home and away for the same quarter are recorded
      const aScore = awayRange.getValue();
      const hScore = homeRange.getValue();
      
      // Note: We check !== '' because a score of 0 is valid and evaluates to false if we just do !aScore
      if (aScore !== '' && hScore !== '') {
        Logger.log(`Both scores present for ${q}. Away: ${aScore}, Home: ${hScore}`);
        
        // Extract the last digits
        const aDigit = parseInt(aScore, 10) % 10;
        const hDigit = parseInt(hScore, 10) % 10;
        
        if (isNaN(aDigit) || isNaN(hDigit)) {
           Logger.log(`Invalid numbers in ${q} scores.`);
           return;
        }

        // Fetch grid numbers to find the indices
        const awayNumsRange = ss.getRangeByName('AWAY_NUMBERS');
        const homeNumsRange = ss.getRangeByName('HOME_NUMBERS');
        
        if (!awayNumsRange || !homeNumsRange) return;

        const awayNums = awayNumsRange.getValues()[0];
        const homeNums = homeNumsRange.getValues().map(r => r[0]);
        
        const colIdx = awayNums.findIndex(v => v !== '' && parseInt(v, 10) === aDigit);
        const rowIdx = homeNums.findIndex(v => v !== '' && parseInt(v, 10) === hDigit);
        
        if (colIdx === -1 || rowIdx === -1) {
          ss.toast('Missing numbers on the top/side of the grid. Cannot determine winner.', 'Error');
          return;
        }
        
        // Calculate square number (1-100) and get its current contents
        const squareNumber = (rowIdx * 10) + colIdx + 1;
        const squaresRange = ss.getRangeByName('SQUARES');
        const winningCell = squaresRange.getCell(rowIdx + 1, colIdx + 1);
        const currentContent = winningCell.getValue();
        
        // d) Toast testing message with the square # and its contents
        ss.toast(
          `Winner for ${q} is Square #${squareNumber}!\nCurrent contents: ${currentContent}`, 
          '🎯 Winner Found', 
          10 // 10 seconds duration so you have time to read it
        );
        Logger.log(`Winner for ${q} is Square #${squareNumber}. Current content: ${currentContent}`);
        
        // c) Write the payout to ENTRIES_WIN_Qx
        const winRangeName = `ENTRIES_WIN_${q}`;
        const winRange = ss.getRangeByName(winRangeName);
        
        if (winRange) {
          // Read configuration properties
          const rawConfigStr = PropertiesService.getDocumentProperties().getProperty('squares_config');
          const rawConfig = rawConfigStr ? JSON.parse(rawConfigStr) : {};
          const isPaid = rawConfig.isPaid === true;
          
          let payout = 1; // Default for free pools
          
          if (isPaid && rawConfig.cost > 0) {
            // Count total entries to calculate pot
            const entriesSheet = ss.getSheetByName('ENTRIES');
            // Subtract 1 for the header row
            const entriesCount = entriesSheet ? Math.max(0, entriesSheet.getLastRow() - 1) : 0;
            
            const commish = parseFloat(rawConfig.commishCut) || 0;
            const totalPot = (entriesCount * rawConfig.cost) - commish;
            const splits = rawConfig.payoutSplits || [25, 25, 25, 25];
            
            // Map Q1->0, Q2->1, Q3->2, Q4->3
            const qIndex = parseInt(q.replace('Q', '')) - 1;
            const splitPct = parseFloat(splits[qIndex]) || 0;
            
            payout = totalPot * (splitPct / 100);
          }
          
          // Write payout to the named range
          winRange.setValue(payout);
          Logger.log(`Wrote payout of ${payout} to ${winRangeName}.`);
        } else {
          Logger.log(`Warning: Named range ${winRangeName} not found on the sheet.`);
        }
      }
      // Exit loop once we process the edited quarter to save processing time
      break; 
    }
  }
}

function updateEntriesResults(quarter, squareNumber, entriesData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resultsRange = ss.getRangeByName('RESULTS');
  if (!resultsRange) return;
  
  // Find winner
  let winnerName = "";
  for (let row of entriesData) {
    if (Number(row[2]) === squareNumber) {
      winnerName = row[1];
      break;
    }
  }
  
  // Calculate payout
  const config = readConfig_();
  let payout = 1;
  if (config.isPaid && config.cost > 0) {
    const docProps = PropertiesService.getDocumentProperties();
    const savedProps = JSON.parse(docProps.getProperty('squares_config') || '{}');
    const commishCut = savedProps.commishCut || 0;
    const splits = savedProps.payoutSplits || [25, 25, 25, 25];
    
    const totalSquares = entriesData.length;
    const totalPot = totalSquares * config.cost;
    const potAfterCommish = totalPot - commishCut;
    
    let splitPercent = 25;
    if (quarter === 'Q1') splitPercent = splits[0] || 25;
    else if (quarter === 'Q2') splitPercent = splits[1] || 25;
    else if (quarter === 'Q3') splitPercent = splits[2] || 25;
    else if (quarter === 'Q4') splitPercent = splits[3] || 25;
    
    payout = potAfterCommish * (splitPercent / 100);
  }
  
  const qIndex = parseInt(quarter.replace('Q', '')) - 1;
  if (qIndex < resultsRange.getNumRows()) {
    resultsRange.getCell(qIndex + 1, 1).setValue(winnerName);
    if (resultsRange.getNumColumns() >= 2) {
      resultsRange.getCell(qIndex + 1, 2).setValue(payout);
    } else {
      resultsRange.offset(0, 1, resultsRange.getNumRows(), 1).getCell(qIndex + 1, 1).setValue(payout);
    }
  }
}

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
    let save = ui.alert('Backup Contest', "All quarter scores are entered!\n\nWould you like to make a copy of the entries sheet for your records?", ui.ButtonSet.YES_NO_CANCEL);
    if (save == ui.Button.YES) {
      archiveEntriesSheet();
      warning = ui.Button.OK;
      check = false;
    } else if (ui.Button.NO) {
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
    if (sheetSquares) sheetSquares.clearConditionalFormatRules();
    
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

function archiveEntriesSheet() {
  // 1. Get saved Document Properties
  const docProps = PropertiesService.getDocumentProperties();
  const savedProps = JSON.parse(docProps.getProperty('squares_config') || '{}');
  const home = savedProps.home;
  const away = savedProps.away;

  // 2. Format current date as YYYY-MM-DD
  const today = new Date();
  const dateString = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // 3. Get source spreadsheet and the ENTRIES sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName('ENTRIES') || ss.getActiveSheet();
  
  // 4. Update the "ENTRIES_DATE_SAVED" named range on the source sheet with the current date
  const dateSavedRange = ss.getRangeByName('ENTRIES_DATE_SAVED');
  if (dateSavedRange) {
    dateSavedRange.setValue(dateString);
  } else {
    Logger.log('Warning: Named range "ENTRIES_DATE_SAVED" was not found.');
  }

  // 5. Build the new tab name `${away}@${home} - ${dateString}`
  const newTabName = away && home ? `${away}@${home} - ${dateString}` : `CONTEST - ${dateString}`;

  // If a tab with this name already exists, delete or handle it to prevent duplicate tab errors
  let targetSheet = ss.getSheetByName(newTabName);
  if (!targetSheet) {
    targetSheet = ss.insertSheet(newTabName);
  } else {
    targetSheet.clear(); // Clear existing tab contents if re-running on the same day
  }

  // 6. Copy values, formatting, colors, and styles from source tab to target tab
  // Range.copyTo() WORKS here because both sheets are in the SAME spreadsheet!
  const sourceRange = sourceSheet.getDataRange();
  const targetRange = targetSheet.getRange(
    sourceRange.getRow(),
    sourceRange.getColumn(),
    sourceRange.getNumRows(),
    sourceRange.getNumColumns()
  );

  // Copy formatting (fonts, backgrounds, borders, alignment, number formats)
  sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  // Copy values (use PASTE_NORMAL if you want formulas copied instead of static values)
  sourceRange.copyTo(targetRange, SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  // Copy column widths so the layout matches perfectly
  const numColumns = sourceRange.getNumColumns();
  for (let col = 1; col <= numColumns; col++) {
    targetSheet.setColumnWidth(col, sourceSheet.getColumnWidth(col));
  }

  // 7. Clear values in named ranges on the original source sheet ("ENTRIES")
  const namedRanges = ss.getNamedRanges();
  namedRanges.forEach(namedRange => {
    const range = namedRange.getRange();
    // Verify the named range belongs to the ENTRIES source sheet
    if (range.getSheet().getName() === sourceSheet.getName()) {
      // Keep ENTRIES_DATE_SAVED intact, clear all other named ranges (e.g., ENTRIES)
      if (namedRange.getName() !== 'ENTRIES_DATE_SAVED') {
        range.clearContent(); // Clears cell values while keeping colors/formatting/borders intact
      }
    }
  });

  // 8. Delete extra rows and columns on the target sheet to match the source range exactly
  const maxRows = targetSheet.getMaxRows();
  const maxCols = targetSheet.getMaxColumns();
  const lastRow = sourceRange.getLastRow();
  const lastCol = sourceRange.getLastColumn();

  if (maxRows > lastRow) {
    targetSheet.deleteRows(lastRow + 1, maxRows - lastRow);
  }
  if (maxCols > lastCol) {
    targetSheet.deleteColumns(lastCol + 1, maxCols - lastCol);
  }

  Logger.log(`💾 Successfully archived "${sourceSheet.getName()}" to new tab "${newTabName}".`);
  ss.toast(`Saved entries sheet of ${home && away ? away + "@" + home : "contest"} to a separate sheet successfully`, `💾 Saved Successfully`);
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
      url: live,
      note: 'This looks like the test (/dev) link, which only editors can open. ' +
            'Use the guide to set up a deployment.'
    };
  }
  return { url: '', note: 'No deployment found. Deploy the script as a web app first, then try again.' };
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

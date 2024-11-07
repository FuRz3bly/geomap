import React, { createContext, useState } from 'react';

const dictionary = {
  waiting: 'Waiting For Response',
  received: 'Help is on the Way',
  responded: 'Report Responded',
  resolved: 'Report Resolved',
  departed: 'Responder Departed',
  arrived: 'Responder Arrived',
  "waiting_color": "bg-[#fcd34d]",
  "received_color": "bg-[#5eead4]",
  "responded_color": "bg-[#3b82f6]",
  "resolved_color": "bg-[#4ade80]",
  fire_station: 'Fire Station',
  police: 'Police Station',
  disaster: 'DRRMO',
  barangay: 'Barangay',
  "fire_station_color": "bg-[#ff6426]",
  "police_color": "bg-[#676eeb]",
  "disaster_color": "bg-[#478a3f]",
  "barangay_color": "bg-[#facc15]",
  firetruck: 'Firetruck',
  ambulance: 'Ambulance',
  structural_fire: "Structural Fire",
  vehicular_fire: "Vehicular Fire",
  fire_rescue: "Rescue",
  explosion: "Explosion Incident",
  wildfire: "Wildfire",
  traffic_accident: "Traffic Accident",
  robbery: "Robbery",
  assault: "Assault & Battery",
  active_shooting: "Active Shooting",
  missing_person: "Missing Person",
  disaster_accident: "Disaster Accident",
  search_and_rescue: "Search & Rescue",
  industrial_accident: "Industrial Accident",
  personal_safety: "Personal Safety",
  theft: "Theft",
  public_disturbance: "Public Disturbance",
  domestic_violence: "Domestic Violence",
  noise: "Alarming Noise",
  structural_fire_icon: "structuralFire",
  vehicular_fire_icon: "vehicularFire",
  fire_rescue_icon: "rescue",
  explosion_icon: "explosion",
  wildfire_icon: "wildfire",
  traffic_accident_icon: "vehicleCrash",
  robbery_icon: "burglary",
  assault_icon: "assault",
  active_shooting_icon: "murder",
  missing_person_icon: "missingPerson",
  disaster_accident_icon: "disaster_accident",
  search_and_rescue_icon: "searchRescue",
  industrial_accident_icon: "industrialAccident",
  personal_safety_icon: "personalSafety",
  theft_icon: "theft",
  public_disturbance_icon: "publicDisturbance",
  domestic_violence_icon: "abuse",
  noise_icon: "noise",
  fire_station_report_icon: "fireReportMarker",
  police_report_icon: "policeReportMarker",
  disaster_report_icon: "disasterReportMarker",
  barangay_report_icon: "barangayReportMarker",
  fire_station_report_select_icon: "fireReportMarkerSC",
  police_report_select_icon: "policeReportMarkerSC",
  disaster_report_select_icon: "disasterReportMarkerSC",
  barangay_report_select_icon: "barangayReportMarkerSC",
  fire_station_icon: "fireMarkerC",
  police_icon: "policeMarkerC",
  disaster_icon: "disasterMarkerC",
  barangay_icon: "barangayMarkerC",
  fire_station_select_icon: "fireMarkerSC",
  police_select_icon: "policeMarkerSC",
  disaster_select_icon: "disasterMarkerSC",
  barangay_select_icon: "barangayMarkerSC",
  fire_station_nearest: "fireMarkerN",
  police_select_nearest: "policeMarkerN",
  disaster_select_nearest: "disasterMarkerN",
  barangay_select_nearest: "barangayMarkerN",
  personal: "Personal",
  call: "Call",
  text: "Text",
  email: "Email",
  this_week: "This Week",
  last_week: "Last Week",
  last_last_week: "Further Week Back",
  calendar: "Calendar",
  fire_station_handle: [
    'structural_fire',
    'vehicular_fire',
    'fire_rescue',
    'explosion',
    'wildfire',
    'search_and_rescue'
  ],
  police_handle: [
    'personal_safety',
    'traffic_accident',
    'public_disturbance',
    'robbery',
    'theft',
    'assault',
    'domestic_violence',
    'active_shooting',
    'missing_person',
    'noise'
  ],
  disaster_handle: [
    'disaster_accident',
    'search_and_rescue',
    'industrial_accident',
    'missing_person'
  ],
  barangay_handle: [
    'personal_safety',
    'public_disturbance',
    'theft',
    'domestic_violence',
    'noise'
  ],
  fire_category: [
    'structural_fire',
    'fire_rescue',
    'explosion',
    'wildfire',
    'search_and_rescue'
  ],
  traffic_category: [
    'traffic_accident',
    'vehicular_fire',
  ],
  safety_category: [
    'personal_safety',
    'assault',
    'public_disturbance',
    'noise'
  ],
  theft_category: [
    'robbery',
    'theft'
  ],
  shooting_category: [
    'active_shooting'
  ],
  disaster_category: [
    'disaster_accident'
  ],
  password: 'Password',
  username: 'Username',
  firstName: 'First Name',
  middleName: 'Middle Name',
  lastName: 'Last Name',
  address: 'Address',
  phoneNumber: 'Phone Number',
  birthdate: 'Birthdate',
  'home/homes': 'Home',
  'home/profiles': 'Account',
  'home/maps': 'Map',
  'home/reports': 'File A Report',
  'home/details': 'Report Files',
  'home/statistics': 'Statistics',
  'home/documents': 'Documents',
  'home/helps': 'Help',
  'home/settings': 'Settings',
  'home/homes_icon': 'home',
  'home/profiles_icon': 'profile',
  'home/maps_icon': 'mapDefault',
  'home/reports_icon': 'report',
  'home/details_icon': 'details',
  'home/statistics_icon': 'statistics',
  'home/documents_icon': 'prints',
  'home/helps_icon': 'help',
  'home/settings_icon': 'settings'
};

// Export the translate function separately
export const translate = (key) => {
  return dictionary[key] || key;
};

let reportID = ''; // Store report ID for Parameters

// Function to get ID
export const getID = () => {
  return reportID;
}

// Contain ID
export const containID = (id) => {
  reportID = id;
}

let title = 'home/homes'; // Store title at the module level

// Function to get the title
export const getTitle = () => {
  return title;
};

// Function to set a new title
export const setTitle = (newTitle) => {
  title = newTitle;
};

let parsedReport = null;

export const getReport = () => {
  return parsedReport
};

export const containReport = (report) => {
  parsedReport = report
};

let theme = 'default'; // Store theme at the module level

export const getTheme = () => {
  return theme;
}

export const setTheme = (newTheme) => {
  console.log(newTheme);
  theme = newTheme;
};

const ToolsContext = createContext();

export const ToolsProvider = ({ children }) => { 
  const [turnEIM, setTurnEIM] = useState(false); // If EIM Button is pressed
  const [respo, setRespo] = useState(false); // If there is a Responder Coming
  const [resolved, setResolved] = useState(false); // If Resolved Button is pressed
  const [isOnDuty, setIsOnDuty] = useState(false); // If On Duty Button is pressed
  const [hasReport, sentReport] = useState(false); // If there is a Selected Report
  const [received, setReceived] = useState(false); // If Received button is pressed
  const [arrived, setArrived] = useState(false); // If Arrived Button is pressed

  const [isResponding, toggleResponse] = useState(false); // Toggle Responding Mode
  const [isAmenity, toggleAmenity] = useState(false); // Toggle All Amenities To Show For Range Checking

  return (
    <ToolsContext.Provider value={{ 
        dictionary,
        turnEIM, setTurnEIM, 
        respo, setRespo,
        resolved, setResolved,
        isOnDuty, setIsOnDuty,
        received, setReceived,
        hasReport, sentReport,
        isResponding, toggleResponse,
        isAmenity, toggleAmenity,
        arrived, setArrived
    }}>
      {children}
    </ToolsContext.Provider>
  );
};

export default ToolsContext;
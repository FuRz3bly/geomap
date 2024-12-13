import React, {  useState, useContext, useEffect, useRef } from 'react';
import { View, Text, Alert, ScrollView, Image, TouchableOpacity, TextInput, Linking, Share, TouchableHighlight, ActivityIndicator, BackHandler, Dimensions, LayoutAnimation, Platform, UIManager, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import UserContext from '../../../components/UserContext';
import ToolsContext, { getID, containID, getReport, containReport, translate, getTheme, setTheme } from '../../../components/ToolsContext';
import { router, useLocalSearchParams } from 'expo-router';

import { onSnapshot, collection, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; 

import ReportMap from '../../../components/maps/report_map';
import RespondMap from '../../../components/maps/respond_map';
import IntensityMap from '../../../components/maps/intensity_map';

import { icons, images } from '../../../constants'
import { Success, Failed, Receipt, Received, Arrived, Alerts, Arrival, Response, Resolved, Pins } from '../../../components/modals';

const filePath = `${FileSystem.cacheDirectory}temp/savedAmenity.json`;
const queryPath = `${FileSystem.cacheDirectory}temp/previousQueries.json`;

const MapScreen = ({ changePage, backPage, selectedMap, changeMap, status, savings, loadings, fails, hideMenu, dashboardReport, dashboardReceive, setDashboardReceive }) => {
  // Global Variables
  const { report } = useLocalSearchParams();
  const { user, isResponder, isDuty } = useContext(UserContext);
  const [loading, setLoading] = useState(true); // Add loading state
  const [keyboardVisible, setKeyboardVisible] = useState(false); // Keyboard Listener Component
  const searchRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0); // Keyboard Height Container
  const [submitLoading, setSubmitLoading] = useState(false); // Add Submit Loading state
  const { dictionary, respo, setRespo, resolved, setResolved, isOnDuty, setIsOnDuty, received, setReceived, hasReport, sentReport, 
  isResponding, toggleResponse, isAmenity, toggleAmenity, arrived, setArrived } = useContext(ToolsContext); // Global Tools Variables
  const { width, height } = Dimensions.get('screen'); // Screen Width and Height
  const [parsedReport, setParsedReport] = useState(null); // Parsed Report From Router Container
  const [userLocation, setUserLocation] = useState(null); // User Location Container
  // Modal Variables
  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const [isFailedVisible, setFailedVisible] = useState(false);
  const [isWarnVisible, setWarnVisible] = useState(false);
  const [isReceiptVisible, setReceiptVisible] = useState(false);
  const [isReceivedVisible, setReceivedVisible] = useState(false);
  const [isArriveVisible, setArriveVisible] = useState(false);
  const [isResponseVisible, setResponseVisible] = useState(false);
  const [isArrivalVisible, setArrivalVisible] = useState(false);
  const [isResolvedVisible, setResolvedVisible] = useState(false);
  const [isPinVisible, setPinVisible] = useState(false);
  const [successForm, setSuccessForm] = useState({ title: 'Login Success!', description: '' });
  const [failedForm, setFailedForm] = useState({ title: 'Login Failed!', description: '' });
  const [warnForm, setWarnForm] = useState({ title: 'Warning!', description: '' });
  const [receivedForm, setReceivedForm] = useState({ report: '', time: '', respo: '' });
  const [arriveForm, setArriveForm] = useState({ report: '', respo: '' });
  const [responseForm, setResponseForm] = useState({ report: '', id: '', time: '', user: '', respo: null });
  const [arrivalForm, setArrivalForm] = useState({ report: '', id: '', time: '', user: '' });
  const [resolvedForm, setResolvedForm] = useState({ report: '', respo: '' });
  // Semi-modal Variables
  const [buttonInfo, setButtonInfo] = useState({}); // Button Expand Information Container
  const buttonTimeouts = useRef({}); // Button Timeouts
  const [mainToolsVisible, setMainToolsVisible] = useState(false); // Visibility of Main Tools (Search & Refresh Map)
  const [key, setKey] = useState(0); // Unmounting Map for reset
  const [subToolsVisible, setSubToolsVisible] = useState(false); // Visibility of Sub Tools (Recenter, Traffic & Compass)
  const [isTraffic, setTraffic] = useState(false); // Toggle Traffic
  const [reportInfoVisible, setReportInfoVisible] = useState(false); // Toggle Report Callout/Information Display
  const [selectedReport, setSelectedReport] = useState(null); // Selected Report Container
  const [selectedReportID, setSelectedReportID] = useState(null); // Selected Report ID Container
  const [amenityInfoVisible, setAmenityInfoVisible] = useState(false); // Toggle Amenity Callout/Amenity Information Display
  const moreButtonCount = ['similarButton', 'shareButton', 'moreOptionsButton'].filter(button => buttonInfo[button]).length;
  const [selectedAmenity, setSelectedAmenity] = useState(null); // Selected Amenity Container
  const [selectedAmenityID, setSelectedAmenityID] = useState(null); // Selected Amenity ID Container
  const [amenityDistance, setAmenityDistance] = useState(null); // Selected Amenity Distance Container
  const [searchInfoVisible, setSearchInfoVisible] = useState(false); // Toggle Search Callout/Search Information Display
  const [symbolPanelVisible, setSymbolPanelVisible] = useState(false); // Toggle Legends / Symbol Panel
  const [mapOptions, setMapOptions] = useState(false); // Toggle Map Options
  const [legendsVisible, setLegendsVisible] = useState(false); // Legends Visibility Container
  const [themesVisible, setThemesVisible] = useState(false); // Themes Visibility Container
  const [legendsOptions, setLegendsOptions] = useState({
    stations: {
      visible: false
    },
    reports: {
      visible: false
    },
    respo: {
      visible: false
    }
  });
  const legends = {
    stations: [
      {name: 'Fire Stations', icon: icons.fireMarkerC},
      {name: 'Police Stations', icon: icons.policeMarkerC},
      {name: 'Disaster Risk Reduction Management Office', icon: icons.disasterMarkerC},
      {name: 'Barangay Hall', icon: icons.barangayMarkerC}
    ],
    reports: [
      {name: 'Fire Related Reports', icon: icons.fireReportMarker},
      {name: 'Police Related Reports', icon: icons.policeReportMarker},
      {name: 'Disaster Related Reports', icon: icons.disasterReportMarker},
      {name: 'Barangay Related Reports', icon: icons.barangayReportMarker}
    ],
    respo: [
      {name: 'Waiting Reports', icon: icons.reportWaiting},
      {name: 'Received Reports', icon: icons.reportReceived},
      {name: 'Responded Reports', icon: icons.reportResponded},
      {name: 'Resolved Reports', icon: icons.reportResolved}
    ]
  };
  const [mapTheme, setMapTheme] = useState('default'); // Map Theme Container
  const themes = [
    { name: 'default', icon: icons.mapDefault },
    { name: 'night', icon: icons.mapNight },
    { name: 'vintage', icon: icons.mapVintage },
    { name: 'wasp', icon: icons.mapWasp },
    { name: 'elevation', icon: icons.mapElevation }
  ];
  const [isResponded, setResponded] = useState(false); // Track if There Are Responded Reports
  // Search Variables
  const [searchQuery, setSearchQuery] = useState(''); // Search Query Container
  const [submitSearchQuery, setSubmitSearchQuery] = useState(''); // Submitted Search Query Container
  const [isSearchActive, setSearchActive] = useState(false); // Track when submitQuery is pressed
  const [searchResults, setSearchResults] = useState([]); // Search Results Container
  const [selectedResult, setSelectedResult] = useState(null); // Selected Result Container
  const [previousQuery, setPreviousQuery] = useState([]); // Track Previous Queries
  // Filter Varibles
  const [filterVisible, setFilterVisible] = useState(false); // Track if filter is Visible
  const [filterSearchVisible, setFilterSearchVisible] = useState(false); // Tracker if Search Filter is Visible
  const [searchMode, setSearchMode] = useState('amenities'); // Search Mode ('all', 'amenities(default)', 'reports')
  const [selectedSearchMode, setSelectedSearchMode] = useState(null) // Selected Search Mode
  const [filterMapVisible, setFilterMapVisible] = useState(false); // Tracker if Map Filter is Visible
  const [reportMarkerVisible, setReportMarkerVisible] = useState(true); // Report Markers Visible
  const [amenityMapOptionVisible, setAmenityMapOptionVisible] = useState(false); // Display Amenity Options Variable
  const [amenityTypes, setAmenityTypes] = useState(['fire_station', 'police', 'disaster', 'barangay']); // Amenities Displayed
  const [amenityCount, setAmenityCount] = useState({ fire_station: 0, police: 0, disaster: 0, barangay: 0 }); // Count Amenity Per Types
  const [isFindNearest, setFindNearest] = useState(false); // Tracker if Finding Nearest Amenity
  const [searchView, setSearchView] = useState('recent'); // Search View Select
  const [amenityIDSaved, setAmenityIDSaved] = useState([]);
  const [amenitySaved, setAmenitySaved] = useState([]); // Amenity Saved by the User
  // Props Variables
  const reportMapProps = {
    mapStatus: status,
    loadingMsg: loadings,
    successMsg: savings,
    errorMsg: fails,
    arriveVisible: openArriveModal,
    receiveMsg: setReceivedForm,
    arriveMsg: setArriveForm,
    resolveMsg: setResolvedForm,
    traffics: isTraffic,
  };
  // Reference Variables
  const reportMapRef = useRef(null);
  const respondMapRef = useRef(null);
  // Map Variables
  const [isIntensity, setIntensity] = useState(false); // Toggle Intensity Map
  // Category Variables
  const [activeCategories, setActiveCategories] = useState([]); // Category Buttons Container
  const [visibleCategories, setVisibleCategories] = useState(['fire', 'traffic', 'safety', 'theft', 'shooting', 'disaster']); // Categories Visible
  const [categoryState, setCategoryState] = useState({
    fire: {
      category: [],
      pallete: []
    },
    traffic: {
      category: [],
      pallete: []
    },
    safety: {
      category: [],
      pallete: []
    }
  }); // Categories Display Container
  // Responder Variables
  const [respoStatus, setRespoStatus] = useState('hawkwatch'); // Container of Responder Status
  const [respoReportInfoVisible, setRespoReportInfoVisible] = useState(false); // Toggle Respo Report Callout/Information Display
  const [selectedRespoReport, setSelectedRespoReport] = useState(null); // Selected Report Container
  const [selectedRespoReportID, setSelectedRespoReportID] = useState(null); // Selected Report ID Container
  const [reportStatus, setReportStatus] = useState(null); // Report Status Container
  const [dashboardLocateReport, setDashboardLocateReport] = useState(null); // Locate Dashboard Report
  const [selectedReportETA, setSelectedReportETA] = useState({ time: '0:00', eta: '0', distance: '0' }); // ETA to Report
  const [currentInstruction, setCurrentInstruction] = useState({ text: 'Wait', turnDistance: '0 mi' }); // Responder Instructions

  // Allow the back button action when the component is mounted
  useEffect(() => {
    const backAction = () => {
      if (isIntensity === true) {
        console.log('Exiting Intensity Map');
        setIntensity(false);
        changeMap('default');
        return true;
      } else {
        changePage('home/homes');
        return true; // Prevent default back action
      }
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, [isIntensity]);

  // Keyboard Listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        LayoutAnimation.configureNext({
          duration: 300,
          update: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity
          },
        });
        setKeyboardVisible(true);
        hideMenu(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext({
          duration: 300,
          update: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity
          },
        });
        setKeyboardVisible(false);
        hideMenu(false);
        setKeyboardHeight(0);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Taking the Parsed Report
  useEffect(() => {
    if (report) {
      try {
        const parsedReport = JSON.parse(report);
        console.log(parsedReport)
        setParsedReport(parsedReport);
        setReceiptVisible(true);
      } catch (error) {
        console.error('Failed to parse out parameter', error);
      }
    }
  }, [report]);

  useEffect(() => {
    setParsedReport(getReport());
    setReceiptVisible(true);
    containReport(null);
  }, [getReport, containReport]);

  useEffect(() => {
    setMapTheme(getTheme());
  }, [getTheme, setTheme])

  // Find the same amenity id and use that as data
  useEffect(() => {
    if (!selectedAmenityID) {
      return;
    }
  
    // Create a real-time listener for the amenity list
    const unsubscribe = onSnapshot(
      query(collection(db, 'amenity'), where('id', '==', selectedAmenityID)),
      (snapshot) => {
        if (!snapshot.empty) {
          const newAmenity = snapshot.docs[0].data();
  
          // Check if the new amenity data is different from the current selectedAmenity
          if (!selectedAmenity || JSON.stringify(newAmenity) !== JSON.stringify(selectedAmenity)) {
            setSelectedAmenity(newAmenity);
            toggleAmenityInfo(true);
          }
        }
      },
      (error) => {
        console.error('Error fetching amenities:', error);
      }
    );
  
    // Clean up the listener when component unmounts or selectedAmenityID changes
    return () => unsubscribe();
  }, [selectedAmenityID, selectedAmenity]); // Re-run whenever selectedAmenityID or selectedAmenity changes

  // Find the same report id and use that as data
  useEffect(() => {
    if (!selectedReportID) {
      return;
    }
  
    // Create a real-time listener for the reports list
    const unsubscribe = onSnapshot(
      query(collection(db, 'reports'), where('report_id', '==', selectedReportID)),
      (snapshot) => {
        if (!snapshot.empty) {
          const newReport = snapshot.docs[0].data();
          const report = snapshot.docs[0].data();

          // Check if the new report data is different from the current selectedReport
          if (!selectedReport || JSON.stringify(newReport) !== JSON.stringify(selectedReport)) {
            setSelectedReport(newReport)
            toggleReportInfo(true);
          }
        }
      },
      (error) => {
        console.error('Error fetching reports:', error);
      }
    );
  
    // Clean up the listener when component unmounts or selectedReportID changes
    return () => unsubscribe();
  }, [selectedReportID, selectedReport]); // Re-run whenever selectedReportID or selectedReport changes

  // Find the same report id and use that as data
  useEffect(() => {
    if (!selectedRespoReportID) {
      return;
    }
  
    // Create a real-time listener for the reports list
    const unsubscribe = onSnapshot(
      query(collection(db, 'reports'), where('report_id', '==', selectedRespoReportID)),
      (snapshot) => {
        if (!snapshot.empty) {
          const newReport = snapshot.docs[0].data();
          const report = snapshot.docs[0].data();

          // Check if the new report data is different from the current selectedReport
          if (!selectedRespoReport || JSON.stringify(newReport) !== JSON.stringify(selectedRespoReport)) {
            setSelectedRespoReport(newReport)
            toggleRespoReportInfo(true);
          }
        }
      },
      (error) => {
        console.error('Error fetching reports:', error);
      }
    );
  
    // Clean up the listener when component unmounts or selectedReportID changes
    return () => unsubscribe();
  }, [selectedRespoReportID, selectedRespoReport]); // Re-run whenever selectedRespoReportID or selectedRespoReport changes

  useEffect(() => {
    if (selectedMap === 'default') {
      return;
    } else if (selectedMap === 'intensity') {
      setIntensity(true);
    } else {
      return;
    }
  }, [selectedMap])

  // Loading Expanse Trigger
  useEffect(() => {
    return () => {
      // Clear all timeouts when the component unmounts
      Object.keys(buttonTimeouts.current).forEach((buttonId) => {
        if (buttonTimeouts.current[buttonId]) {
          clearTimeout(buttonTimeouts.current[buttonId]);
        }
      });
    };
  }, []);

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  /* Modal Buttons */
  // Close Success Modal
  const closeSModal = () => {
    setSuccessVisible(false)
  };
  
  // Close Failed Modal
  const closeFModal = () => {
    setFailedVisible(false)
  };

  // Close Report Receipt Modal
  const closeRModal = () => {
    setReceiptVisible(false)
  };

  const closeWModal = () => {
    setWarnVisible(false);
  }

  // Open Received Modal
  const openReceiveModal = (value) => {
    setReceivedVisible(value);
  };

  // Close Received Modal
  const closeReceiveModal = () => {
    setReceivedVisible(false)
  };

  // Open Arrive Modal
  const openArriveModal = (bool) => {
    setArriveVisible(bool);
  };

  // Close Arrive Modal
  const closeArriveModal = () => {
    setArriveVisible(false)
  };

  // Open Response Modal
  const openResponseModal = (value) => {
    setResponseVisible(value);
  };

  // Close Response Modal
  const closeResponseModal = () => {
    setResponseVisible(false);
  };

  // Open Arrival Modal
  const openArrivalModal = (bool) => {
    setArrivalVisible(bool);
  };

  // Close Arrival Modal
  const closeArrivalModal = () => {
    setArrivalVisible(false)
  };

  // Open Resolved Modal
  const openResolvedModal = (value) => {
    setResolvedVisible(value);
  };

  // Close Resolved Modal
  const closeResolvedModal = () => {
    setResolvedVisible(false);
  };

  // Open Pin Modal
  const openPinModal = (value) => {
    setPinVisible(value);
  };

  // Close Resolved Modal
  const closePinModal = () => {
    setPinVisible(false);
  };

  // Passive Functions
  const additionalHeight = filterVisible ? (filterSearchVisible || filterMapVisible ? height * 0.85 : height * 0.76) : height * 0.7
  const adjustedHeight = additionalHeight + (searchResults.length >= 5 ? (searchResults.length * 28) : 0);

  // Color Generator Function
  const colorGenerator = (key) => {
    const colorKey = dictionary[key + '_color'];
    return colorKey;
  };

  // Category Generator Function
  const categoryGenerator = (key) => {
    const categoryKey = dictionary[key + '_category']
    return categoryKey;
  };

  const getDirectionIcon = (instructionText) => {
    const lowerText = instructionText.toLowerCase();
      if (lowerText.includes('left') || lowerText.includes('west')) {
          return icons.turnLeft;
      } else if (lowerText.includes('right') || lowerText.includes('east')) {
          return icons.turnRight;
      } else if (lowerText.includes('north')) {
          return icons.turnStraight;
      } else if (lowerText.includes('south')) {
          return icons.turnBack;
      } else {
          return icons.turnStraight; // Default icon for straight movements
      }
  };

  // Distance Color Generator Function
  const distanceColorGenerator = (distance) => {
    if (distance < 500) {
      return 'bg-[#57b378]';
    } else if (distance < 3000) {
        return 'bg-[#fcd34d]';
    } else {
        return 'bg-[#ff6426]';
    }
  };

  // Report Button Function
  const handleReport = () => {
    changePage('home/reports');
  };

  // Navigate Button Function
  const handleNavigate = (amenity, location) => {
    if (amenity && location) {
      const originName = encodeURIComponent('Your Location');
      const destinationName = encodeURIComponent(`${amenity?.name} ${amenity?.description}`);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&origin_name=${originName}&destination=${destinationName}&destination_place_id=${amenity.name}`;
      Linking.openURL(url).then(() => {
      // Guide the user to follow directions in Google Maps
      // After the user manually closes Google Maps, they will return to your app
      }).catch((err) => {
        console.error('Failed to open Google Maps:', err);
      });
    }
  };

  // Refresh Button Function
  const handleRefresh = () => {
    setKey(prevKey => prevKey + 1);
    setSearchActive(true);
    setSearchQuery('');
    setFindNearest(false);
    setAmenityTypes(['fire_station', 'police', 'disaster', 'barangay']);
    setAmenityMapOptionVisible(false);
    setSearchView('recent');
    setSearchActive(false);
    setSearchResults([]);
  };

  // Compass Button Function
  const handleCompass = () => {
    if (reportMapRef.current) {
      reportMapRef.current.handleCompass();
    }
  };

  // Refocus Button Function
  const handleRecenter = () => {
    if (reportMapRef.current) {
      reportMapRef.current.handleRecenter();
    }
  };

  const handleRespoRecenter = () => {
    if (respondMapRef.current) {
      respondMapRef.current.handleFocus();
    }
  };

  // Toggle Button Information
  const toggleButtonInfo = (buttonId, value, resetDelay = 4000) => {
    // Initialize the new button state
    let newButtonInfo = {
      ...buttonInfo,
      [buttonId]: value,
    };
  
    // List of the buttons to be limited to two active at a time
    const buttons = ['similarButton', 'shareButton', 'moreOptionsButton'];
  
    // Check how many of the specified buttons are active (true)
    const activeButtons = buttons.filter(button => newButtonInfo[button]);
  
    // If three buttons are active, deactivate the first activated one
    if (activeButtons.length > 2) {
      const firstActivatedButton = activeButtons[0];
      newButtonInfo[firstActivatedButton] = false;
    }
  
    // Check if the button is firetruckButton or ambulanceButton
    if (buttonId === 'firetruckButton' || buttonId === 'ambulanceButton') {
      const oppositeButtonId = buttonId === 'firetruckButton' ? 'ambulanceButton' : 'firetruckButton';
  
      // When one of these buttons is active, hide the other
      newButtonInfo[oppositeButtonId] = !value;
  
      // Clear any existing timeout for the opposite button
      if (buttonTimeouts.current[oppositeButtonId]) {
        clearTimeout(buttonTimeouts.current[oppositeButtonId]);
      }
  
      // Start the reset timer for the opposite button (in reverse)
      if (!value) {
        buttonTimeouts.current[oppositeButtonId] = setTimeout(() => {
          LayoutAnimation.configureNext({
            duration: 200,
            update: {
              type: LayoutAnimation.Types.linear,
              property: LayoutAnimation.Properties.scaleX,
            },
          });
          setButtonInfo((prev) => ({
            ...prev,
            [oppositeButtonId]: true, // Show the opposite button when the current one hides
          }));
          buttonTimeouts.current[oppositeButtonId] = null; // Clear reference to the timeout
        }, resetDelay);
      }
    }
  
    // Update the state for the toggled button (common for all buttons)
    setButtonInfo(newButtonInfo);
  
    // Clear any existing timeout for the button being toggled
    if (buttonTimeouts.current[buttonId]) {
      clearTimeout(buttonTimeouts.current[buttonId]);
    }
  
    // If the button is being set to true, start the reset timer for it
    if (value) {
      buttonTimeouts.current[buttonId] = setTimeout(() => {
        LayoutAnimation.configureNext({
          duration: 200,
          update: {
            type: LayoutAnimation.Types.linear,
            property: LayoutAnimation.Properties.scaleX,
          },
        });
        setButtonInfo((prev) => ({
          ...prev,
          [buttonId]: false,
        }));
        buttonTimeouts.current[buttonId] = null; // Clear reference to the timeout
      }, resetDelay);
    }
  };

  // Toggle Category Buttons
  const toggleCategory = (category) => {
    LayoutAnimation.configureNext({
      duration: 150,
      update: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.scaleX,
      },
    });

    setActiveCategories((prevCategories) => {
        if (prevCategories.includes(category)) {
            return prevCategories.filter((cat) => cat !== category);
        } else {
            return [...prevCategories, category];
        }
    });
  };

  // Toggle Intensity Category Visibility
  const toggleCategoryVisible = (category) => {
    setVisibleCategories(prevCategories => {
      // Define the desired order of categories
      const order = ['fire', 'traffic', 'personal safety', 'theft', 'active shooting', 'disaster'];
  
      // Check if the amenityTypes array already includes the type
      if (prevCategories.includes(category)) {
        // Otherwise, filter out the type
        const updatedCategories = prevCategories.filter(cat => cat !== category);
        // Maintain the order of remaining types
        return updatedCategories.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      } else {
        // Add the type to the amenityTypes array
        const updatedCategories = [...prevCategories, category];
        // Maintain the order of all types
        return updatedCategories.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
    });
  };

  // Expand Main Tools Toggle
  const toggleMainTools = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity
      },
  });
  toggleButtonInfo('refreshButton', false);
  toggleButtonInfo('searchButton', false);
  setMainToolsVisible(!mainToolsVisible);
  };

  // Expand Sub Tools Toggle
  const toggleSubTools = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity
      },
  });
  toggleButtonInfo('compassButton', false);
  toggleButtonInfo('recenterButton', false);
  toggleButtonInfo('trafficButton', false);
  setSubToolsVisible(!subToolsVisible);
  };

  // Expand Report Informtion Toggle
  const toggleReportInfo = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setReportInfoVisible(value);
    toggleMapOption(false)
  };

  // Expand Report Informtion Toggle
  const toggleRespoReportInfo = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setRespoReportInfoVisible(value);
    toggleMapOption(false)
  };

  // Expand Amenity Information Toggle
  const toggleAmenityInfo = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setAmenityInfoVisible(value);
    toggleMapOption(false)
  };

  // Expand Symbols/Legends Panel Toggle
  const toggleSymbolPanel = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setSymbolPanelVisible(value);
  };

  // Toggle Map Option
  const toggleMapOption = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    if (value === true) {
      toggleButtonInfo('legendsButton', false)
      toggleAmenityInfo(false);
      toggleReportInfo(false);
      setMapOptions(value);
    } else {
      setMapOptions(value);
    }
  };

  // Toggle Legends Button
  const toggleLegends = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setLegendsVisible(value);
  };

  // Toggle Themes Button
  const toggleThemes = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setThemesVisible(value);
  };

  // Toggle Legends Options
  const toggleLegendsOptions = (value) => {
    LayoutAnimation.configureNext({
        duration: 200,
        update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.scaleXY
        },
    });

    setLegendsOptions(prevOptions => ({
        ...prevOptions,
        [value]: {
            ...prevOptions[value],
            visible: !prevOptions[value].visible
        }
    }));
  };

  // Call Button Function
  const handleCall = (phone) => {
    // Remove all non-numeric characters except the leading `+`
    const sanitizedNumber = phone.replace(/[^\d+]/g, '');
    
    // Handle local format that starts with `0`
    if (/^0\d{10}$/.test(sanitizedNumber)) {
      const formattedNumber = '+63' + sanitizedNumber.slice(1);
      Linking.openURL(`tel:${formattedNumber}`);
      return;
    }
  
    // Handle international format that starts with `+63`
    if (/^\+63\d{10}$/.test(sanitizedNumber)) {
      Linking.openURL(`tel:${sanitizedNumber}`);
    } else {
      console.warn('Invalid phone number format');
    }
  };

  // Share Button Function
  const handleShare = async (amenity) => {
    if (!amenity || !amenity.location) {
      console.error('Amenity location not available');
      return;
    }
  
    const { latitude, longitude } = amenity.location;
  
    // Construct Google Maps URL with the amenity name and description
    const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}(${encodeURIComponent(`${amenity.name} ${amenity.description}`)})`;
  
    try {
      // Use the Share API to share the Google Maps URL
      const result = await Share.share({
        message: `Check out this location: ${amenity.name} - ${amenity.description}\n${googleMapsUrl}`,
      });
  
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type: ', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing location:', error);
  
      // Fallback to open Google Maps directly if sharing fails
      Linking.openURL(googleMapsUrl).catch(err => console.error('Error opening Google Maps', err));
    }
  };

  // Save Amenity ID Function
  const handleSave = async (id) => {
    try {
      let savedAmenities = [...amenityIDSaved]; // Use current state as the base
      
      // Check if the amenity is already saved
      if (savedAmenities.includes(id)) {
        // Remove the ID if it already exists
        savedAmenities = savedAmenities.filter(savedId => savedId !== id);
        console.log('Amenity removed from saved list');
      } else {
        // Add the new amenity ID, ensuring no more than 6 are saved
        if (savedAmenities.length < 6) {
          savedAmenities.push(id);
          console.log('Amenity saved successfully');
        } else {
          console.log('Cannot save more than 6 amenities');
          return;
        }
      }
      
      // Update the state first to make it responsive
      setAmenityIDSaved(savedAmenities);

      // Save the updated list back to the file
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(savedAmenities));
    } catch (error) {
      console.error('Error saving amenity:', error);
    }
  };

  // Load Amenity ID Function
  const loadSave = async () => {
    try {
      // Check if the directory exists, if not, create it
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.cacheDirectory}temp`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}temp`, { intermediates: true });
      }
  
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      let savedAmenities = [];
  
      if (fileInfo.exists) {
        const savedData = await FileSystem.readAsStringAsync(filePath);
        savedAmenities = savedData ? JSON.parse(savedData) : [];
      }
  
      setAmenityIDSaved(savedAmenities);
    } catch (error) {
      console.error('Error loading saved amenities:', error);
    }
  };

  // Instantly Load Saved Amenity IDs when component mounts
  useEffect(() => {
    loadSave();
  }, []);

  // Load saved amenities to variable
  useEffect(() => {
    // Only load amenities if in 'saved' view and there are saved amenities
    if (amenityIDSaved.length > 0) {
      const loadSavedAmenities = async () => {
        try {
          const q = query(collection(db, 'amenity'), where('id', 'in', amenityIDSaved));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const savedAmenitiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAmenitySaved(savedAmenitiesData);
          });

          // Clean up the listener when component unmounts or amenityIDSaved changes
          return () => unsubscribe();
        } catch (error) {
          console.error('Error fetching saved amenities:', error);
        }
      };

      loadSavedAmenities();
    } else {
      // If no saved amenities or not in 'saved' view, reset the saved list
      setAmenitySaved([]);
    }
  }, [amenityIDSaved]);

  // Expand Amenity Informtion Toggle
  const toggleSearchInfo = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    toggleAmenityInfo(false);
    toggleReportInfo(false);
    setSearchInfoVisible(value);
    setMainToolsVisible(false);
    if (reportMapRef.current) {
      reportMapRef.current.handleAdjust()
    }
  };

  // Toggle More Filters
  const toggleFilters = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setFilterVisible(value);
    if (value === false) {
      setFilterSearchVisible(false)
      setFilterMapVisible(false)
    }
  };

  // Toggle Search Filter
  const toggleSearchFilters = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    if (filterMapVisible === true) {
      setFilterMapVisible(false);
      setTimeout(() => {
        LayoutAnimation.configureNext({
          duration: 200,
          update: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.scaleXY
          },
        });
        setFilterSearchVisible(!filterSearchVisible)
      }, 200)
    } else {
      LayoutAnimation.configureNext({
        duration: 200,
        update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.scaleXY
        },
      });
      setFilterSearchVisible(!filterSearchVisible);
    }
  };

  // Toggle Map Filter
  const toggleMapFilters = () => {
    if (filterSearchVisible === true) {
      LayoutAnimation.configureNext({
        duration: 200,
        update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.scaleXY
        },
      });
      setFilterSearchVisible(false);
      setTimeout(() => {
        LayoutAnimation.configureNext({
          duration: 200,
          update: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.scaleXY
          },
        });
        setFilterMapVisible(!filterMapVisible);
      }, 200)
    } else {
      LayoutAnimation.configureNext({
        duration: 200,
        update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.scaleXY
        },
      });
      setFilterMapVisible(!filterMapVisible);
    }
  };

  // Select Search Filter Mode
  const handleSelectMode = (mode) => {
    if (mode === 'all') {
      setSearchMode(mode);
      setReportMarkerVisible(true);
    } else if (mode === 'reports') {
      setReportMarkerVisible(true);
      setSearchMode(mode);
    } else {
      setSearchMode(mode);
    }
  }

  // Select Amenity Map Option Filter
  const toggleAmenityOptions = () => {
    setAmenityMapOptionVisible(!amenityMapOptionVisible)
  };

  // Select Amenity Types Selected Filter
  const toggleAmenityType = (type) => {
    setFindNearest(false);
  
    // Use functional state update to get the current state
    setAmenityTypes(prevAmenityTypes => {
      // Define the desired order of amenity types
      const order = ['fire_station', 'police', 'disaster', 'barangay'];
  
      // Check if the amenityTypes array already includes the type
      if (prevAmenityTypes.includes(type)) {
        // If it's the only type, do not remove it
        if (prevAmenityTypes.length === 1) {
          setWarnVisible(true);
          setWarnForm({title: 'Warning!', description: 'At least one amenity type\nmust be selected.'})
          return prevAmenityTypes; // Return the current state to prevent removal
        }
        // Otherwise, filter out the type
        const updatedAmenityTypes = prevAmenityTypes.filter(t => t !== type);
        // Maintain the order of remaining types
        return updatedAmenityTypes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      } else {
        // Add the type to the amenityTypes array
        const updatedAmenityTypes = [...prevAmenityTypes, type];
        // Maintain the order of all types
        return updatedAmenityTypes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      }
    });
  };  

  // Reset Amenity Options
  const resetAmenity = () => {
    setFindNearest(false);
    setAmenityTypes(['fire_station', 'police', 'disaster', 'barangay']);
  };

  // Find Nearest Function
  const handleFindNearest = () => {
    setFindNearest(true);
    hideSearchInfo(false);
  };

  // Route to Options
  const handleOptions = () => {
    changePage('home/settings');
  };

  // Hide Search Filter Bar
  const hideSearchInfo = (value) => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY
      },
    });
    setSearchInfoVisible(value);
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
    setSearchActive(false);
  };

  // Delete Previous Query Function
  const removePreviousQuery = async (query) => {
    try {
      // Read the existing previous queries from the file
      const fileInfo = await FileSystem.getInfoAsync(queryPath);
      let previousQueries = [];
  
      if (fileInfo.exists) {
        const savedData = await FileSystem.readAsStringAsync(queryPath);
        previousQueries = savedData ? JSON.parse(savedData) : [];
      }
  
      // Remove the query that matches the specified query
      previousQueries = previousQueries.filter(q => q !== query);
  
      // Save the updated list back to the file
      await FileSystem.writeAsStringAsync(queryPath, JSON.stringify(previousQueries));
      
      // Update the state
      setPreviousQuery(previousQueries);
    } catch (error) {
      console.error('Error removing previous query:', error);
    }
  };

  // Load Previous Queries Function
  const loadPreviousQueries = async () => {
    try {
      // Check if the directory exists, if not, create it
      const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.cacheDirectory}temp`);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}temp`, { intermediates: true });
      }

      const fileInfo = await FileSystem.getInfoAsync(queryPath);
      let previousQueries = [];

      if (fileInfo.exists) {
        const savedData = await FileSystem.readAsStringAsync(queryPath);
        previousQueries = savedData ? JSON.parse(savedData) : [];
      }

      setPreviousQuery(previousQueries);
    } catch (error) {
      console.error('Error loading previous queries:', error);
    }
  };

  // Save Previous Query Function
  const saveQuery = async (query) => {
    try {
      let previousQueries = [];

      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(queryPath);
      if (fileInfo.exists) {
        // Read the existing previous queries from the file
        const savedData = await FileSystem.readAsStringAsync(queryPath);
        previousQueries = savedData ? JSON.parse(savedData) : [];
      }

      // Remove the query if it already exists (avoid duplicates)
      previousQueries = previousQueries.filter(q => q !== query);

      // Add the query to the start of the array, ensuring no more than 6 are saved
      previousQueries = [query, ...previousQueries].slice(0, 6);

      // Save the updated list back to the file
      await FileSystem.writeAsStringAsync(queryPath, JSON.stringify(previousQueries));

      // Update the state with the new list
      setPreviousQuery(previousQueries);
    } catch (error) {
      console.error('Error saving query:', error);
    }
  };

  // Selecting Previous Query Function
  const selectQuery = (query) => {
    if (amenityInfoVisible === true) {
      toggleSearchInfo(true);
      toggleAmenityInfo(false);
      setSearchQuery(query);
      submitQuery(query);
      setSearchView('result');
    } else {
      setSearchQuery(query);
      submitQuery(query);
      setSearchView('result');
    }
  }

  // Delete Query Function
  const removeQuery = () => {
    setSearchQuery('');
    setSelectedSearchMode(null);
    setSelectedAmenity(null);
    setSearchView('recent');
    setFindNearest(false);
    setSearchActive(true);
    setSubmitLoading(false);
    setSearchResults([]);
    setSearchActive(false);
    if (reportMapRef.current) {
      reportMapRef.current.handleAdjust()
    }
  };

  // Submit Search Query Function
  const submitQuery = (query) => {
    //console.log(width, height);
    Keyboard.dismiss();
    setSearchView('result');
    if (query === submitSearchQuery) {
      setSelectedSearchMode(searchMode);
      setSubmitSearchQuery(submitSearchQuery);
      setSubmitLoading(false);
      setSearchActive(true);
      return;
    } else {
      toggleButtonInfo('resultButton', true);
      setSelectedSearchMode(searchMode);
      setSubmitSearchQuery(query);
      setSubmitLoading(true);
      setSearchActive(true);
      saveQuery(query);
    }
  };

  useEffect(() => {
    loadPreviousQueries();
  }, []);

  // Receive Search Query Results Function
  const handleSearchResults = (results) => {
    if (searchQuery === '') {
      return
    } else {
      setSearchResults(results);
    }
    setSubmitLoading(false);
  };

  // Selected Result Function
  const handleSelectResult = (id) => {
    if (searchView === 'saved') {
      toggleSearchInfo(false);
    }
    if (searchMode === 'amenities') {
      if (id === selectedAmenityID) {
        // If the ID is the same as the currently selected one, just toggle the info
        toggleAmenityInfo(true);
      } else {
        // If the ID is different, update the selected result and amenity
        setSelectedResult(id);
        setSelectedAmenityID(id);
      }
    } else if (searchMode === 'reports') {
      if (id === selectedReportID) {
        toggleReportInfo(true);
      } else {
        setSelectedResult(id);
        setSelectedReportID(id);
      }
    } else {
      const isAmenity = id.length > 11;

      if (isAmenity) {
        if (id === selectedAmenityID) {
          toggleAmenityInfo(true);
        } else {
          setSelectedResult(id);
          setSelectedAmenityID(id);
        }
      } else {
        if (id === selectedReportID) {
          toggleReportInfo(true);
        } else {
          setSelectedResult(id);
          setSelectedReportID(id);
        }
      }
    }
  };

  // Expand Report Info
  const handleExpand = (id) => {
    containID(id);
    changePage('home/details');
    status('loading');
    loadings('LOADING DATA');
  };

  // Ping Report
  const handlePing = async (id) => {
    try {
      const reportRef = doc(db, 'reports', id);
      const reportDoc = await getDoc(reportRef);
      if (reportDoc.exists()) {
          const reportData = reportDoc.data();
          if (reportData.ping !== undefined) {
            await updateDoc(reportRef, {
              ping: reportData.ping + 1
            });
          } else {
            await updateDoc(reportRef, {
              ping: 0
            });
          }
      }
    } catch (error) {
        console.error('Error fetching report data:', error);
    }
  };

  // Update Category Data
  const updateCategory = (name, newData) => {
    setCategoryState(prevState => ({
        ...prevState,
        [name]: {
            ...prevState[name],
            ...newData
        }
    }));
  };

  // Themes Buttons Components
  const ThemeButton = ({ theme, icon, isSelected, onPress }) => {
    return (
      <TouchableHighlight
        underlayColor={'#86ebaa'}
        className={`w-20 h-full ${isSelected ? 'bg-primary' : 'bg-white' } rounded-lg mr-2`}
        onPress={onPress}
        disabled={isSelected}
      >
        <View className="w-full h-full items-center justify-center">
          <Image
            tintColor={isSelected ? '#ffffff' : null}
            source={icon}
            className="w-[40%] h-[40%]"
            resizeMode='contain'
          />
          <Text className={`text-sm ${isSelected ? 'text-white font-rmedium' : 'text-black font-rbase'} pt-1`}>{`${theme.charAt(0).toUpperCase()}${theme.slice(1)}`}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  useEffect(() => {
    if (isDuty) {
      setIsOnDuty(true);
    }
  }, [isDuty]);

  const handleOnDuty = async () => {
    if (isOnDuty) {
      /* Alert.alert(
        'STATUS UPDATE',
        'YOU ARE NOW OFF DUTY',
        [{ text: 'OK' }]
      ); */
      const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            on_duty: false,
            amenity_key: null
        });

      setIsOnDuty(false);
    } else {
      /* Alert.alert(
        'STAY ALERT',
        'YOU ARE NOW ON DUTY',
        [{ text: 'OK' }]
      ); */
      openPinModal(true);
    };
    //setIsOnDuty(!isOnDuty);
    setSelectedReport(null);
  };

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const updatePIN = async (user) => {
    const amenityRef = doc(db, 'amenity', user.amenity_id);
    const amenitySnap = await getDoc(amenityRef);
    if (amenitySnap.exists()) {
      const amenityData = amenitySnap.data();
      const currentDate = new Date();
      const amenityKeyDate = amenityData.key_date ? new Date(amenityData.key_date.toDate()) : null;
      let newKey;

      if (!amenityKeyDate || amenityKeyDate < new Date(currentDate.setDate(currentDate.getDate() - 1))) {
        newKey = generatePin();
        await updateDoc(amenityRef, { amenity_key: newKey, key_date: new Date() });
      } else {
        newKey = amenityData.amenity_key;
      }

      /* const response = await fetch('http://192.168.100.19:3000/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: user.email,
            subject: 'Amenity PIN Code',
            text: `PIN - ${newKey}`,
        }),
      });

      if (!response.ok) {
          throw new Error('Failed to send email');
      } */

      return newKey;
    } else {
      console.error('Amenity document does not exist!');
        return null;
    }
  };

  const handleRequest = async () => {
    if (!user) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "User Error",
                body: "User not found",
            },
            trigger: null, // Trigger immediately
        });
        return;
    }

    try {
        const pin = await updatePIN(user);
        if (pin) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "PIN Requested",
                    body: `Requested PIN: ${pin}`,
                },
                trigger: null, // Trigger immediately
            });
        }
    } catch (error) {
        console.error('Error requesting PIN:', error);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Request Error",
                body: "An error occurred while requesting the PIN. Please try again later.",
            },
            trigger: null, // Trigger immediately
        });
    }
  };

  const handleReceive = (report) => {
    //setLoading(true);
    if (respondMapRef.current) {
      respondMapRef.current.handleResponse()
    }
    //setReceived(!received);
  };

  const handleRespoNavigate = (report, location = userLocation) => {
    if (report && location) {
        const originName = encodeURIComponent('Your Location');
        const destinationName = encodeURIComponent(`RID #${report.report_id}`);
        const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&origin_name=${originName}&destination=${report.report_location.latitude},${report.report_location.longitude}&destination_name=${destinationName}`;
        
        Linking.openURL(url).then(() => {
            // Guide the user to follow directions in Google Maps
            // After the user manually closes Google Maps, they will return to your app
        }).catch((err) => {
            console.error('Failed to open Google Maps:', err);
        });
        closeResponseModal();
    } else {
        console.log('Error: Invalid report or location');
    }
  };

  const handleArrived = (report) => {
    if (respondMapRef.current) {
      respondMapRef.current.handleArrival()
      setSelectedReport(null);
    }
    //setArrived(!arrived);
  };

  const handleResolve = () => {
    //setResolved(!resolved);
    if (reportMapRef.current) {
      reportMapRef.current.handleResolve()
    }
  };

  const handleFlag = async (id) => {
    const reportRef = doc(db, 'reports', id);
  
    try {
      await updateDoc(reportRef, {
        flag: false,
      });
      console.log('Flag updated to false');
    } catch (error) {
      console.error('Error updating flag:', error);
    }
  };

  // Re-route Button Function
  const handleReroute = () => {
    if (respondMapRef.current) {
      respondMapRef.current.reRoute();
    }
  };

  return (
    <SafeAreaView className={`w-full ${!keyboardVisible ? 'h-full top-0' : 'h-[105%] -top-3'} ${isIntensity ? 'bg-primary-dark' : 'bg-white'}`}>
      {/* Modals */}
      <Success visible={isSuccessVisible} onClose={closeSModal} title={successForm.title} description={successForm.description} />
      <Failed visible={isFailedVisible} onClose={closeFModal} title={failedForm.title} description={failedForm.description} />
      <Alerts visible={isWarnVisible} onClose={closeWModal} title={warnForm.title} description={warnForm.description} />
      <Receipt visible={isReceiptVisible} onClose={closeRModal} report={parsedReport} />
      <Received visible={isReceivedVisible} onClose={closeReceiveModal} onProceed={() => changePage('home/details')} report={receivedForm.report} time={receivedForm.time} respo={receivedForm.respo} />
      <Arrived visible={isArriveVisible} onClose={closeArriveModal} onProceed={() => changePage('home/details')} report={arriveForm.report} respo={arriveForm.respo} />
      <Response visible={isResponseVisible} onClose={closeResponseModal} onProceed={() => changePage('home/details')} onNavigate={closeResponseModal} report={responseForm.report} time={responseForm.time} id={responseForm.id} user={responseForm.user} />
      <Arrival visible={isArrivalVisible} onClose={closeArrivalModal} onProceed={() => changePage('home/details')} report={arrivalForm.report} time={arrivalForm.time} id={arrivalForm.id} user={arrivalForm.user} />
      <Resolved visible={isResolvedVisible} onClose={closeResolvedModal} onProceed={() => changePage('home/details')} report={resolvedForm.report} respo={resolvedForm.respo} />
      <Pins visible={isPinVisible} onClose={closePinModal} onProceed={() => setIsOnDuty(true)} onRequest={handleRequest} user={user}/>
      {/* Maps Container */}
      <View className={`w-full ${reportInfoVisible && !isIntensity || respoReportInfoVisible ? 'h-[70%]' : amenityInfoVisible && !isIntensity || mapOptions ? 'h-[55%]' : searchInfoVisible || symbolPanelVisible ? 'h-[30%]' : 'h-full'}`}>
        {!isOnDuty ? (
          <>
            {isIntensity ? (
              <IntensityMap
                mapStatus={status}
                loadingMsg={loadings}
                successMsg={savings}
                failMsg={fails}
                visibleCategories={visibleCategories}
                updateCategory={updateCategory}
                categoryState={categoryState}
              />
            ) : (
              <ReportMap 
                key={key} 
                ref={reportMapRef}
                {...reportMapProps}
                mapWarn={setWarnVisible}
                warnMsg={setWarnForm.description}
                userLocation={setUserLocation}
                receiveVisible={openReceiveModal}
                arriveVisible={openArriveModal}
                reportVisible={toggleReportInfo}
                resolveVisible={openResolvedModal}
                reportID={setSelectedReportID}
                selectedReport={setSelectedReport}
                amenityVisible={toggleAmenityInfo}
                amenityID={setSelectedAmenityID}
                selectedAmenity={setSelectedAmenity}
                distanceAmenity={setAmenityDistance}
                searchQuery={submitSearchQuery}
                searchMode={selectedSearchMode}
                searchVisible={hideSearchInfo}
                isSearchActive={isSearchActive}
                onSearchResults={handleSearchResults}
                selectedResult={selectedResult}
                reportMarkerVisible={reportMarkerVisible}
                includedAmenity={amenityTypes}
                amenityCount={setAmenityCount}
                findNearest={isFindNearest}
                theme={mapTheme}
                isResponded={setResponded}
              />
            )}
          </>
        ) : (
          <RespondMap
            ref={respondMapRef}
            mapStatus={status}
            loadingMsg={loadings}
            successMsg={savings}
            failMsg={fails}
            reportID={setSelectedRespoReportID}
            selectedReport={setSelectedRespoReport}
            reportETA={setSelectedReportETA}
            reportVisible={toggleRespoReportInfo}
            reportStatus={setReportStatus}
            respoStatus={setRespoStatus}
            userLocation={setUserLocation}
            responseVisible={openResponseModal}
            arrivalVisible={openArrivalModal}
            responseMsg={setResponseForm}
            arrivalMsg={setArrivalForm}
            locateReport={dashboardReport}
            dashboardReceiveReport={dashboardReceive}
            setDashboardReceiveReport={setDashboardReceive}
            respoInstruction={setCurrentInstruction}
          />
        )}
      </View>
      {/* Buttons Container */}
      {isResponder && (
        <View className={`${buttonInfo['dutyButton'] ? 'w-[45%]' : 'w-[15%]'} h-[8%] absolute top-[20%] right-[4%]`}>
          {/* Legend Button */}
          <TouchableHighlight
            underlayColor={"#3b8a57"} 
            className={`w-full h-full ${isIntensity ? 'bg-primary-125' : 'bg-primary'} rounded-xl shadow-md shadow-black`} 
            onLongPress={() => { 
                LayoutAnimation.configureNext({
                    duration: 100,
                    update: {
                        type: LayoutAnimation.Types.linear,
                        property: LayoutAnimation.Properties.scaleX
                    },
                }); 
                toggleButtonInfo('dutyButton', true)
            }}
            onPress={handleOnDuty}
          >
            <View className="w-full h-full items-center justify-center flex-row">
              {buttonInfo['dutyButton'] && (
                <View className="w-2/3 h-full justify-center items-end pr-2">
                  <Text className="text-left text-base font-rbase text-white">{isOnDuty ? 'Off Duty' : 'On Duty'}</Text>
                </View>
              )}
              <View className={`${buttonInfo['dutyButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                <Image 
                  tintColor={'#ffffff'}
                  source={!isOnDuty ? icons.offDuty : icons.onDuty}
                  className="w-[70%] h-[70%]"
                  resizeMode='contain'
                />
              </View>
            </View>
          </TouchableHighlight>
        </View>
      )}
      {!isIntensity && (
        <>
          {mapOptions ? (
            <View className={`${buttonInfo['legendsButton'] ? 'w-[45%]' : 'w-[15%]'} h-[8%] absolute top-[10%] -right-[20%]`}>
              {/* Legend Button */}
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className={`w-full h-full bg-primary rounded-xl shadow-md shadow-black`} 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('legendsButton', true)
                }}
                onPress={() => toggleMapOption(true)}
              >
                <View className="w-full h-full items-center justify-center flex-row">
                  {buttonInfo['legendsButton'] && (
                    <View className="w-2/3 h-full justify-center items-end pr-2">
                      <Text className="text-left text-base font-rbase text-white">{'Legend'}</Text>
                    </View>
                  )}
                  <View className={`${buttonInfo['legendsButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                    <Image 
                      tintColor={'#ffffff'}
                      source={icons.legends}
                      className="w-[50%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          ) : (
            <View className={`${buttonInfo['legendsButton'] ? 'w-[45%]' : 'w-[15%]'} h-[8%] absolute top-[10%] right-[4%]`}>
              {/* Legend Button */}
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className={`w-full h-full bg-primary rounded-xl shadow-md shadow-black`} 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('legendsButton', true)
                }}
                onPress={() => toggleMapOption(true)}
              >
                <View className="w-full h-full items-center justify-center flex-row">
                  {buttonInfo['legendsButton'] && (
                    <View className="w-2/3 h-full justify-center items-end pr-2">
                      <Text className="text-left text-base font-rbase text-white">{'Legend'}</Text>
                    </View>
                  )}
                  <View className={`${buttonInfo['legendsButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                    <Image 
                      tintColor={'#ffffff'}
                      source={icons.legends}
                      className="w-[50%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          )}
        </>
      )}
      {/* Return to Map Container */}
      {isIntensity && !symbolPanelVisible ? (
        <View className={`${buttonInfo['returnMapButton'] ? 'w-[45%]' : 'w-[15%]'} h-[8%] absolute top-[10%] right-[4%]`}>
        {/* Legend Button */}
        <TouchableHighlight
          underlayColor={"#3b8a57"} 
          className={`w-full h-full bg-primary-125 rounded-xl shadow-md shadow-black`} 
          onLongPress={() => { 
              LayoutAnimation.configureNext({
                  duration: 100,
                  update: {
                      type: LayoutAnimation.Types.linear,
                      property: LayoutAnimation.Properties.scaleX
                  },
              }); 
              toggleButtonInfo('returnMapButton', true)
          }}
          onPress={() => {
            setIntensity(false)
            changeMap('default')
            Notifications.cancelAllScheduledNotificationsAsync();
          }}
        >
          <View className="w-full h-full items-center justify-center flex-row">
            {buttonInfo['returnMapButton'] && (
              <View className="w-2/3 h-full justify-center items-end pr-2">
                <Text className="text-left text-base font-rbase text-white">{'Return to Map'}</Text>
              </View>
            )}
            <View className={`${buttonInfo['returnMapButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
              <Image 
                tintColor={'#ffffff'}
                source={icons.returnMap}
                className="w-[80%] h-[80%]"
                resizeMode='contain'
              />
            </View>
          </View>
        </TouchableHighlight>
        </View>
      ) : (
        <View className={`${buttonInfo['returnMapButton'] ? 'w-[45%]' : 'w-[15%]'} h-[8%] absolute top-[10%] -right-[60%]`}>
          {/* Legend Button */}
          <TouchableHighlight
            underlayColor={"#3b8a57"} 
            className={`w-full h-full bg-primary-125 rounded-xl shadow-md shadow-black`} 
            onLongPress={() => { 
                LayoutAnimation.configureNext({
                    duration: 100,
                    update: {
                        type: LayoutAnimation.Types.linear,
                        property: LayoutAnimation.Properties.scaleX
                    },
                }); 
                toggleButtonInfo('returnMapButton', true)
            }}
            onPress={() => {
              setIntensity(false)
              changeMap('default')
            }}
          >
            <View className="w-full h-full items-center justify-center flex-row">
              {buttonInfo['returnMapButton'] && (
                <View className="w-2/3 h-full justify-center items-end pr-2">
                  <Text className="text-left text-base font-rbase text-white">{'Return to Map'}</Text>
                </View>
              )}
              <View className={`${buttonInfo['returnMapButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                <Image 
                  tintColor={'#ffffff'}
                  source={icons.returnMap}
                  className="w-[80%] h-[80%]"
                  resizeMode='contain'
                />
              </View>
            </View>
          </TouchableHighlight>
        </View>
      )}
      {/* Main Buttons */}
      {!isOnDuty ? (
        <>
          {!searchInfoVisible && !isIntensity && !mapOptions ? (
            <View className={`w-[35%] h-[18%] absolute ${reportInfoVisible ? 'bottom-[38%] right-[4%]' : amenityInfoVisible ? 'bottom-[52%] right-[4%]' : searchInfoVisible ? 'bottom-[52%] -right-[90%]' : 'bottom-[3%] right-[4%]'}`}>
              {selectedAmenity && amenityInfoVisible && userLocation ? ( 
                <>
                  {/* Navigate Button */}
                  <TouchableHighlight
                    underlayColor={"#3b8a57"} 
                    className="w-[70%] h-[70%] absolute bottom-0 right-0 bg-primary rounded-3xl shadow-md shadow-black z-20" 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('navigateButton', true)
                    }}
                    onPress={() => handleNavigate(selectedAmenity, userLocation)}
                  >
                    <>
                        <View className="w-full h-full items-center justify-center">
                            {buttonInfo['navigateButton'] ? (
                                <>
                                    <Image
                                        tintColor='#ffffff'
                                        source={icons.navigateHome}
                                        className="w-[40%] h-[40%]"
                                        resizeMode='contain'
                                    />
                                    <Text className="text-lg text-white font-rmedium">NAVIGATE</Text>
                                </>
                            ) : (
                                <Image 
                                    tintColor='#ffffff'
                                    source={icons.navigateHome}
                                    className="w-[70%] h-[70%]"
                                    resizeMode='contain'
                                />
                            )}
                        </View>
                    </>
                  </TouchableHighlight>
                </>
              ) : (
                <>
                  {isResponded ? (
                    <>
                      {/* Resolve Button */}
                      <TouchableHighlight
                        underlayColor={"#3b8a57"} 
                        className="w-[70%] h-[70%] absolute bottom-0 right-0 bg-primary rounded-3xl shadow-md shadow-black z-20" 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('resolveButton', true)
                        }}
                        onPress={handleResolve}
                      >
                        <>
                            <View className="w-full h-full items-center justify-center">
                                {buttonInfo['resolveButton'] ? (
                                    <>
                                        <Image
                                            tintColor='#ffffff'
                                            source={icons.resolve}
                                            className="w-[40%] h-[40%]"
                                            resizeMode='contain'
                                        />
                                        <Text className="text-xl text-white font-rmedium">RESOLVE</Text>
                                    </>
                                ) : (
                                    <Image 
                                        tintColor='#ffffff'
                                        source={icons.resolve}
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                    />
                                )}
                            </View>
                        </>
                      </TouchableHighlight>
                    </>
                  ) : (
                    <>
                      {/* Report Button */}
                      <TouchableHighlight
                        underlayColor={"#3b8a57"} 
                        className="w-[70%] h-[70%] absolute bottom-0 right-0 bg-primary rounded-3xl shadow-md shadow-black z-20" 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('reportButton', true)
                        }}
                        onPress={handleReport}
                      >
                        <>
                            <View className="w-full h-full items-center justify-center">
                                {buttonInfo['reportButton'] ? (
                                    <>
                                        <Image
                                            tintColor='#ffffff'
                                            source={icons.reportHome}
                                            className="w-[40%] h-[40%]"
                                            resizeMode='contain'
                                        />
                                        <Text className="text-xl text-white font-rmedium">REPORT</Text>
                                    </>
                                ) : (
                                    <Image 
                                        tintColor='#ffffff'
                                        source={icons.reportHome}
                                        className="w-[70%] h-[70%]"
                                        resizeMode='contain'
                                    />
                                )}
                            </View>
                        </>
                      </TouchableHighlight>
                    </>
                  )}
                </>
              )}
              {/* Main Buttons Container */}
              <View className={`${buttonInfo['refreshButton'] || buttonInfo['searchButton'] ? 'w-[140%]' : 'w-[24%]'} ${!mainToolsVisible ? 'h-[6%]' : 'h-[130%] -top-[135%]'} ${height <= 900 ? '-right-[2%]' : 'right-[1%]'} absolute items-center`}>
                <View className={`w-full ${height <= 900 ? 'h-6' : 'h-8'} pr-4 mb-2 items-end justify-center`}>
                  <TouchableHighlight onPress={toggleMainTools} underlayColor={"#3b8a57"} className="w-16 h-full bg-primary items-center justify-center rounded-xl shadow-md shadow-black/80 z-30" activeOpacity={0.8}>
                    <Image 
                        tintColor="#ffffff"
                        source={mainToolsVisible ? icons.expandDown : icons.expandUp}
                        className="w-[50%] h-[50%]"
                        resizeMode='contain'
                    />
                  </TouchableHighlight>
                </View>
                {!mainToolsVisible ? (
                  <>
                    <View className="w-full h-0.5 pr-4 items-end justify-center -bottom-[500%]">
                      {/* Find Nearest Amenity */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['searchButton'] ? 'w-full' : 'w-16'} h-16 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('searchButton', true)
                        }}
                      >
                        <View className="w-full h-full items-center justify-center flex-row">
                          {buttonInfo['searchButton'] && (
                            <View className="w-2/3 h-full justify-center items-end pr-2">
                              <Text className="text-left text-base font-rbase text-primary-100">{'Search'}</Text>
                            </View>
                          )}
                          <View className={`${buttonInfo['searchButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                            <Image 
                              tintColor='#3b8a57'
                              source={icons.findNearest}
                              className="w-[60%] h-[60%]"
                              resizeMode='contain'
                            />
                          </View>
                        </View>
                      </TouchableHighlight>
                    </View>
                    <View className="w-full h-0.5 pr-4 items-end justify-center -bottom-[500%]">
                      {/* Refresh Map */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['refreshButton'] ? 'w-full' : 'w-16'} h-16 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('refreshButton', true)
                        }}
                        onPress={handleRefresh}
                      >
                        <View className="w-full h-full items-center justify-center flex-row">
                          {buttonInfo['refreshButton'] && (
                            <View className="w-2/3 h-full justify-center items-end pr-2">
                              <Text className="text-left text-base font-rbase text-primary-100">{'Refresh Map'}</Text>
                            </View>
                          )}
                          <View className={`${buttonInfo['refreshButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                            <Image 
                              tintColor='#3b8a57'
                              source={icons.refresh}
                              className="w-[60%] h-[60%]"
                              resizeMode='contain'
                            />
                          </View>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="w-full h-1/2 pr-4 items-end justify-center">
                      {/* Find Nearest Amenity */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['searchButton'] ? 'w-full' : 'w-16'} h-16 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('searchButton', true)
                        }}
                        onPress={() => toggleSearchInfo(true)}
                      >
                        <View className="w-full h-full items-center justify-center flex-row">
                          {buttonInfo['searchButton'] && (
                            <View className="w-2/3 h-full justify-center items-end pr-2">
                              <Text className="text-left text-base font-rbase text-primary-100">{'Search'}</Text>
                            </View>
                          )}
                          <View className={`${buttonInfo['searchButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                            <Image 
                              tintColor='#3b8a57'
                              source={icons.findNearest}
                              className="w-[60%] h-[60%]"
                              resizeMode='contain'
                            />
                          </View>
                        </View>
                      </TouchableHighlight>
                    </View>
                    <View className="w-full h-1/2 pr-4 items-end justify-center">
                      {/* Refresh Map */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['refreshButton'] ? 'w-full' : 'w-16'} h-16 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('refreshButton', true)
                        }}
                        onPress={handleRefresh}
                      >
                        <View className="w-full h-full items-center justify-center flex-row">
                          {buttonInfo['refreshButton'] && (
                            <View className="w-2/3 h-full justify-center items-end pr-2">
                              <Text className="text-left text-base font-rbase text-primary-100">{'Refresh Map'}</Text>
                            </View>
                          )}
                          <View className={`${buttonInfo['refreshButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                            <Image 
                              tintColor='#3b8a57'
                              source={icons.refresh}
                              className="w-[60%] h-[60%]"
                              resizeMode='contain'
                            />
                          </View>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </>
                )}
              </View>
              {/* Sub Buttons Container */}
              <View className={`${!subToolsVisible ? (height <= 900 ? 'w-[11%] right-[86%]' : 'w-[11%]') : buttonInfo['recenterButton'] || buttonInfo['compassButton'] || buttonInfo['trafficButton'] ? buttonInfo['trafficButton'] ? 'w-[152%] right-[110%]' : 'w-[150%] right-[105%]' : 'w-[150%] right-[105%]'} ${height <= 900 ? 'bottom-[24%]' : 'bottom-[24%]'} h-[11%] absolute items-center flex-row`}>
                <View className={`${height <= 900 ? 'w-10' : 'w-12'} h-full pr-4 mb-2 items-end justify-center`}>
                  <TouchableHighlight onPress={toggleSubTools} underlayColor={"#3b8a57"} className="w-full h-16 bg-primary items-center justify-center rounded-xl shadow-md shadow-black/80 z-30" activeOpacity={0.8}>
                    <Image 
                        tintColor="#ffffff"
                        source={subToolsVisible ? icons.nextBtn : icons.prevBtn}
                        className="w-[50%] h-[80%]"
                        resizeMode='contain'
                    />
                  </TouchableHighlight>
                </View>
                {!subToolsVisible ? (
                  <>
                    <View className={`w-1/3 h-full items-center justify-center -right-7 mb-2`}>
                      {/* Recenter to User */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['recenterButton'] ? 'w-full' : 'w-14'} h-14 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('recenterButton', true)
                        }}
                      >
                        <View className="w-full h-full items-center justify-center">
                          {buttonInfo['recenterButton'] ? (
                              <>
                                  <Image
                                      tintColor='#3b8a57'
                                      source={icons.mapFocus}
                                      className="w-[40%] h-[40%]"
                                      resizeMode='contain'
                                  />
                                  <Text className="text-sm text-primary-100 font-rmedium">{'FOCUS'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor='#3b8a57'
                                  source={icons.mapFocus}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                        </View>
                      </TouchableHighlight>
                    </View>
                    <View className={`w-1/3 h-full items-center justify-center -right-7 mb-2`}>
                      {/* Compass */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['compassButton'] ? 'w-full' : 'w-14'} h-14 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('compassButton', true)
                        }}
                      >
                        <View className="w-full h-full items-center justify-center">
                          {buttonInfo['compassButton'] ? (
                              <>
                                  <Image
                                      tintColor='#3b8a57'
                                      source={icons.compass}
                                      className="w-[50%] h-[50%]"
                                      resizeMode='contain'
                                  />
                                  <Text className="text-sm text-primary-100 font-rmedium">{'COMPASS'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor='#3b8a57'
                                  source={icons.compass}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                        </View>
                      </TouchableHighlight>
                    </View>
                    <View className={`w-1/3 h-full items-center justify-center -right-7 mb-2`}>
                      {/* Traffic */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['trafficButton'] ? 'w-full' : 'w-14'} h-14 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('trafficButton', true)
                        }}
                      >
                        <View className="w-full h-full items-center justify-center">
                          {buttonInfo['trafficButton'] ? (
                              <>
                                  <Image
                                      tintColor={'#3b8a57'}
                                      source={icons.traffic}
                                      className="w-[50%] h-[50%]"
                                      resizeMode='contain'
                                  />
                                  <Text className="text-sm text-primary-100 font-rmedium">{'TRAFFIC'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor={'#3b8a57'}
                                  source={icons.traffic}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                        </View>
                      </TouchableHighlight>
                    </View>
                  </>
                ) : (
                  <>
                    <View className={`${buttonInfo['recenterButton'] && 'mr-1'} w-1/3 h-full items-center justify-center mb-2`}>
                      {/* Recenter to User */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['recenterButton'] ? 'w-full' : 'w-14'} h-14 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('recenterButton', true)
                        }}
                        onPress={handleRecenter}
                      >
                        <View className="w-full h-full items-center justify-center">
                          {buttonInfo['recenterButton'] ? (
                              <>
                                  <Image
                                      tintColor='#3b8a57'
                                      source={icons.mapFocus}
                                      className="w-[40%] h-[40%]"
                                      resizeMode='contain'
                                  />
                                  <Text className="text-sm text-primary-100 font-rmedium">{'FOCUS'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor='#3b8a57'
                                  source={icons.mapFocus}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                        </View>
                      </TouchableHighlight>
                    </View>
                    <View className={`${buttonInfo['compassButton'] && 'ml-1'} w-1/3 h-full items-center justify-center mb-2`}>
                      {/* Compass */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['compassButton'] ? 'w-full' : 'w-14'} h-14 bg-white rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('compassButton', true)
                        }}
                        onPress={handleCompass}
                      >
                        <View className="w-full h-full items-center justify-center">
                          {buttonInfo['compassButton'] ? (
                              <>
                                  <Image
                                      tintColor='#3b8a57'
                                      source={icons.compass}
                                      className="w-[50%] h-[50%]"
                                      resizeMode='contain'
                                  />
                                  <Text className="text-sm text-primary-100 font-rmedium">{'COMPASS'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor='#3b8a57'
                                  source={icons.compass}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                        </View>
                      </TouchableHighlight>
                    </View>
                    <View className={`${buttonInfo['trafficButton'] && 'ml-1'} w-1/3 h-full items-center justify-center mb-2`}>
                      {/* Traffic */}
                      <TouchableHighlight
                        underlayColor={"#fffd99"} 
                        className={`${buttonInfo['trafficButton'] ? 'w-full' : 'w-14'} h-14 ${isTraffic ? 'bg-primary' : 'bg-white'} rounded-xl shadow-md shadow-black`} 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo('trafficButton', true)
                        }}
                        onPress={() => setTraffic(!isTraffic)}
                      >
                        <View className="w-full h-full items-center justify-center">
                          {buttonInfo['trafficButton'] ? (
                              <>
                                  <Image
                                      tintColor={!isTraffic ? '#3b8a57' : '#ffffff'}
                                      source={icons.traffic}
                                      className="w-[50%] h-[50%]"
                                      resizeMode='contain'
                                  />
                                  <Text className={`text-sm ${isTraffic ? 'text-white' : 'text-primary-100'} font-rmedium`}>{'TRAFFIC'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor={!isTraffic ? '#3b8a57' : '#ffffff'}
                                  source={icons.traffic}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                        </View>
                      </TouchableHighlight>
                    </View>
                  </>
                )}
              </View>
            </View>
          ) : isIntensity && !symbolPanelVisible && !mapOptions ? (
            <View className="w-[24.5%] h-[12.6%] absolute bottom-[3%] right-[4%]">
              {/* Intensity Legends Button */}
              <TouchableHighlight
                underlayColor={"#193b25"} 
                className="w-full h-full absolute bottom-0 right-0 bg-primary-125 rounded-3xl shadow-md shadow-black z-20" 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('symbolsButton', true)
                }}
                onPress={() => toggleSymbolPanel(true)}
              >
                <>
                    <View className="w-full h-full items-center justify-center">
                        {buttonInfo['symbolsButton'] ? (
                            <>
                                <Image
                                    tintColor='#ffffff'
                                    source={icons.symbols}
                                    className="w-[40%] h-[40%]"
                                    resizeMode='contain'
                                />
                                <Text className="text-xl text-white font-rmedium">LEGEND</Text>
                            </>
                        ) : (
                            <Image 
                                tintColor='#ffffff'
                                source={icons.symbols}
                                className="w-[60%] h-[60%]"
                                resizeMode='contain'
                            />
                        )}
                    </View>
                </>
              </TouchableHighlight>
            </View>
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          <View className={`${buttonInfo['respoFocusButton'] ? 'w-[45%]' : 'w-[15%]'} h-[8%] absolute top-[30%] right-[4%]`}>
            {/* Respo Focus Button */}
            <TouchableHighlight
              underlayColor={"#3b8a57"} 
              className={`w-full h-full bg-primary rounded-xl shadow-md shadow-black`} 
              onLongPress={() => { 
                  LayoutAnimation.configureNext({
                      duration: 100,
                      update: {
                          type: LayoutAnimation.Types.linear,
                          property: LayoutAnimation.Properties.scaleX
                      },
                  }); 
                  toggleButtonInfo('respoFocusButton', true)
              }}
              onPress={handleRespoRecenter}
            >
              <View className="w-full h-full items-center justify-center flex-row">
                {buttonInfo['respoFocusButton'] && (
                  <View className="w-2/3 h-full justify-center items-end pr-2">
                    <Text className="text-left text-base font-rbase text-white">{'Recenter'}</Text>
                  </View>
                )}
                <View className={`${buttonInfo['respoFocusButton'] ? 'w-16' : 'w-full'} h-full items-center justify-center`}>
                  <Image 
                    tintColor={'#ffffff'}
                    source={icons.mapFocus}
                    className="w-[60%] h-[60%]"
                    resizeMode='contain'
                  />
                </View>
              </View>
            </TouchableHighlight>
          </View>
          {respoStatus === 'hawkwatch' ? (
            <View className={`w-[35%] h-[18%] absolute ${reportInfoVisible || respoReportInfoVisible ? 'bottom-[38%] right-[4%]' : amenityInfoVisible ? 'bottom-[52%] right-[4%]' : searchInfoVisible ? 'bottom-[52%] -right-[90%]' : 'bottom-[3%] right-[4%]'}`}>
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className={`w-[70%] h-[70%] absolute bottom-0 right-0 ${selectedRespoReport && reportStatus === 'waiting' ? 'bg-primary' : 'bg-slate-400'} rounded-3xl shadow-md shadow-black z-20`} 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('receiveButton', true)
                }}
                disabled={!selectedRespoReport || reportStatus !== 'waiting'}
                onPress={() => handleReceive(selectedRespoReport)}
              >
                <>
                    <View className="w-full h-full items-center justify-center">
                        {buttonInfo['receiveButton'] ? (
                            <>
                                <Image
                                  tintColor={selectedRespoReport && reportStatus === 'waiting'  ? '#ffffff' : '#b8e3c7'}
                                  source={icons.receive}
                                  className="w-[40%] h-[40%]"
                                  resizeMode='contain'
                                />
                                <Text className="text-xl text-white font-rmedium">{'RECEIVE'}</Text>
                            </>
                        ) : (
                            <Image 
                                tintColor={selectedRespoReport || reportStatus !== 'responded' || reportStatus !== 'received' ? '#ffffff' : '#b8e3c7'}
                                source={icons.receive}
                                className="w-[70%] h-[70%]"
                                resizeMode='contain'
                            />
                        )}
                    </View>
                </>
              </TouchableHighlight>
            </View>
          ) : respoStatus === 'eaglestoop' ? (
            <>
              <View className={`w-[35%] h-[18%] absolute ${reportInfoVisible || respoReportInfoVisible ? 'bottom-[38%] right-[4%]' : amenityInfoVisible ? 'bottom-[52%] right-[4%]' : searchInfoVisible ? 'bottom-[52%] -right-[90%]' : 'bottom-[3%] right-[4%]'}`}>
                <TouchableHighlight
                  underlayColor={"#3b8a57"} 
                  className={"w-[70%] h-[70%] absolute bottom-0 right-0 bg-primary rounded-3xl shadow-md shadow-black z-20"} 
                  onLongPress={() => { 
                      LayoutAnimation.configureNext({
                          duration: 100,
                          update: {
                              type: LayoutAnimation.Types.linear,
                              property: LayoutAnimation.Properties.scaleX
                          },
                      }); 
                      toggleButtonInfo('arrivalButton', true)
                  }}
                  onPress={() => handleArrived()}
                >
                  <>
                      <View className="w-full h-full items-center justify-center">
                          {buttonInfo['arrivalButton'] ? (
                              <>
                                  <Image
                                      tintColor='#ffffff'
                                      source={icons.arrival}
                                      className="w-[40%] h-[40%]"
                                      resizeMode='contain'
                                  />
                                  <Text className="text-xl text-white font-rmedium">{'ARRIVED'}</Text>
                              </>
                          ) : (
                              <Image 
                                  tintColor='#ffffff'
                                  source={icons.arrival}
                                  className="w-[70%] h-[70%]"
                                  resizeMode='contain'
                              />
                          )}
                      </View>
                  </>
                </TouchableHighlight>
              </View>
              <View className={`w-[70%] h-[12%] absolute top-[10%] left-[4%] bg-primary rounded-2xl flex-row py-2`}>
                <View className="w-[25%] h-full items-center justify-center">
                  <Image 
                    tintColor="#ffffff"
                    source={getDirectionIcon(currentInstruction.text)}
                    className="w-[80%] h-[80%]"
                    resizeMode='contain'
                  />
                </View>
                <View className="w-[75%] h-full px-2">
                  <Text className={`text-2xl text-white font-psemibold`}>
                    {currentInstruction.turnDistance}
                  </Text>
                  <Text numberOfLines={2} className={`text-base text-white font-pregular text-justify`}>
                    {currentInstruction.text}
                  </Text>
                </View>
              </View>
              <View className={`w-[35%] h-[6%] absolute top-[24%] left-[4%] bg-primary rounded-lg overflow-hidden`}>
                <TouchableOpacity className="w-full h-full flex-row" onPress={handleReroute}>
                  <View className="w-[40%] h-full items-center justify-center">
                    <Image 
                      tintColor="#ffffff"
                      source={icons.refresh}
                      className="w-[60%] h-[60%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[60%] h-full px-2 justify-center">
                    <Text className={`text-sm text-white font-pmedium`}>
                      {'Re-route'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <></>
          )}
        </>
      )}
      {/* Report Information Display */}
      <View className={`w-full ${reportInfoVisible && !isIntensity ? 'h-[35%] bottom-0' : 'h-[35%] -bottom-80'} absolute rounded-t-3xl items-center bg-white overflow-hidden`}>
        {/* Top Notch */}
        <View className="w-full h-[13%] mb-3 justify-center items-center bg-white">
          <TouchableHighlight onPress={() => toggleReportInfo(false)} underlayColor={"#d9ffe6"} className="w-full h-full items-center justify-center z-10" activeOpacity={0.8}>
            <Image 
                tintColor="#57b378"
                source={reportInfoVisible ? icons.expandDown : icons.expandUp}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        {/* Body Container */}
        <View className="w-[94%] h-[87%]">
          {/* Title Container */}
          <View className="w-[92%] h-[20%] items-center justify-center mx-4 flex-row">
            <View className={`w-[2%] h-[80%] ${colorGenerator(selectedReport?.handler)}`} />
            <View className="w-[94%] h-full ml-3 justify-center">
              <Text className="text-xl text-black font-rmedium">{translate(selectedReport?.report_type)}</Text>
            </View>
          </View>
          {/* Text Container 1 */}
          <View className="w-[96%] h-[30%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-sm shadow-black/40 overflow-hidden">
            <View className={`${buttonInfo['moreDetailsButton'] ? 'w-[75%]' : 'w-[80%]'} h-[60%] justify-start flex-row ml-2`}>
              {/* Status Color */}
              <View className={`w-[3%] h-full ${colorGenerator(selectedReport?.report_status)}`} />
              <View className="w-[80%] h-full left-[30%] justify-center">
                {/* Report Status */}
                <Text className="text-base text-black font-rbase">{translate(selectedReport?.report_status)}</Text>
                {/* Report ID */}
                <Text className="text-base text-slate-400 font-rbase">{`RID #${selectedReport?.report_id}`}</Text>
              </View>
              <View>
              </View>
            </View>
            <View className={`${buttonInfo['moreDetailsButton'] ? 'w-[27%]' : 'w-[22%]'} h-full`}>
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className="w-full h-full bg-primary" 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('moreDetailsButton', true)
                }}
                onPress={() => handleExpand(selectedReport?.report_id)}
            >
              <>
                <View className="w-full h-full items-center justify-center">
                    {buttonInfo['moreDetailsButton'] ? (
                        <>
                            <Image
                                tintColor='#ffffff'
                                source={icons.externalLink}
                                className="w-[30%] h-[30%] mb-1"
                                resizeMode='contain'
                            />
                            <Text className="text-sm text-white font-rmedium text-center">{'MORE INFO'}</Text>
                        </>
                    ) : (
                        <Image 
                            tintColor='#ffffff'
                            source={icons.externalLink}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                        />
                    )}
                </View>
              </>
              </TouchableHighlight>
            </View>
          </View>
          {/* Text Container 2 */}
          <View className="w-[96%] h-[30%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-sm shadow-black/40 overflow-hidden">
            <View className={`${buttonInfo['pingButton'] ? 'w-[75%]' : 'w-[80%]'} h-full justify-center ml-2`}>
                {/* Report Address */}
                <Text className="text-base text-black font-rmedium">{selectedReport?.report_address}</Text>
                {/* Report Name */}
                <Text className="text-base text-slate-400 font-rbase">{translate(selectedReport?.handler)}</Text>
            </View>
            <View className={`${buttonInfo['pingButton'] ? 'w-[27%]' : 'w-[22%]'} h-full`}>
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className="w-full h-full bg-primary" 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('pingButton', true)
                }}
                onPress={() => handlePing(selectedReport?.report_id)}
            >
              <>
                <View className="w-full h-full items-center justify-center">
                    {buttonInfo['pingButton'] ? (
                        <>
                            <Image
                                tintColor='#ffffff'
                                source={icons.notification}
                                className="w-[40%] h-[40%]"
                                resizeMode='contain'
                            />
                            <Text className="text-sm text-white font-rmedium text-center">{'FOLLOW UP'}</Text>
                        </>
                    ) : (
                        <Image 
                            tintColor='#ffffff'
                            source={icons.notification}
                            className="w-[60%] h-[60%]"
                            resizeMode='contain'
                        />
                    )}
                </View>
            </>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
      {/* Respo Report Information Display */}
      <View className={`w-full ${respoReportInfoVisible ? 'h-[35%] bottom-0' : 'h-[35%] -bottom-80'} absolute rounded-t-3xl items-center bg-white overflow-hidden`}>
        {/* Top Notch */}
        <View className="w-full h-[13%] mb-3 justify-center items-center bg-white">
          {/* Top Notch */}
          <TouchableHighlight onPress={() => toggleRespoReportInfo(false)} underlayColor={"#d9ffe6"} className="w-full h-full items-center justify-center z-10" activeOpacity={0.8}>
            <Image 
                tintColor="#57b378"
                source={respoReportInfoVisible ? icons.expandDown : icons.expandUp}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        {/* Body Container */}
        <View className="w-[94%] h-[87%]">
          {/* Title Container */}
          <View className="w-[92%] h-[20%] items-center justify-center mx-4 flex-row">
            <View className={`w-[2%] h-[80%] ${colorGenerator(selectedRespoReport?.handler)}`} />
            <View className="w-[94%] h-full ml-3 justify-center">
              <Text className={`text-xl ${selectedRespoReport?.flag === false ? 'text-red-500' : 'text-black'} font-rmedium`}>{translate(selectedRespoReport?.report_type)}</Text>
            </View>
            {/* Arrival Time */}
            <View className="w-[50%] h-full absolute -right-2 bg-primary rounded-lg flex-row items-center justify-between">
              <View className="w-[35%] h-full items-center justify-center">
                <Text className={`text-base text-white font-rmedium pt-2`}>{`${selectedReportETA?.time}`}</Text>
                <Text className={`text-sm text-white font-rmedium -top-2`}>{'arrival'}</Text>
              </View>
              <View className="w-[1px] h-[80%] bg-white"/>
              <View className="w-[30%] h-full items-center justify-center">
                <Text className={`text-base text-white font-rmedium pt-2`}>{`${selectedReportETA?.eta}`}</Text>
                <Text className={`text-sm text-white font-rmedium -top-2`}>{'min'}</Text>
              </View>
              <View className="w-[1px] h-[80%] bg-white"/>
              <View className="w-[30%] h-full items-center justify-center">
                <Text className={`text-base text-white font-rmedium pt-2`}>{`${selectedReportETA?.distance}`}</Text>
                <Text className={`text-sm text-white font-rmedium -top-2`}>{'km'}</Text>
              </View>
            </View>
          </View>
          {/* Text Container 1 */}
          <View className="w-[96%] h-[30%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-sm shadow-black/40 overflow-hidden">
            <View className={`${buttonInfo['moreDetailsButton'] ? 'w-[75%]' : 'w-[80%]'} h-[60%] justify-start flex-row ml-2`}>
              {/* Status Color */}
              <View className={`w-[3%] h-full ${colorGenerator(selectedRespoReport?.report_status)}`} />
              <View className="w-[80%] h-full left-[30%] justify-center">
                {/* Report Status */}
                <Text className="text-base text-black font-rbase">{translate(selectedRespoReport?.report_status)}</Text>
                {/* Report ID */}
                <Text className="text-base text-slate-400 font-rbase">{`RID #${selectedRespoReport?.report_id}`}</Text>
              </View>
              <View>
              </View>
            </View>
            <View className={`${buttonInfo['moreDetailsButton'] ? 'w-[27%]' : 'w-[22%]'} h-full`}>
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className="w-full h-full bg-primary" 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('moreDetailsButton', true)
                }}
                onPress={() => handleExpand(selectedRespoReport?.report_id)}
            >
              <>
                <View className="w-full h-full items-center justify-center">
                    {buttonInfo['moreDetailsButton'] ? (
                        <>
                            <Image
                                tintColor='#ffffff'
                                source={icons.externalLink}
                                className="w-[30%] h-[30%] mb-1"
                                resizeMode='contain'
                            />
                            <Text className="text-sm text-white font-rmedium text-center">{'MORE INFO'}</Text>
                        </>
                    ) : (
                        <Image 
                            tintColor='#ffffff'
                            source={icons.externalLink}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                        />
                    )}
                </View>
              </>
              </TouchableHighlight>
            </View>
          </View>
          {/* Text Container 2 */}
          <View className="w-[96%] h-[30%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-sm shadow-black/40 overflow-hidden">
            <View className={`${buttonInfo['flagButton'] ? 'w-[75%]' : 'w-[80%]'} h-full justify-center ml-2`}>
                {/* Report Address */}
                <Text className="text-base text-black font-rmedium">{selectedRespoReport?.report_address}</Text>
                {/* Report Name */}
                <Text className="text-base text-slate-400 font-rbase">{translate(selectedRespoReport?.handler)}</Text>
            </View>
            <View className={`${buttonInfo['flagButton'] ? 'w-[27%]' : 'w-[22%]'} h-full`}>
              <TouchableHighlight
                underlayColor={"#3b8a57"} 
                className="w-full h-full bg-primary" 
                onLongPress={() => { 
                    LayoutAnimation.configureNext({
                        duration: 100,
                        update: {
                            type: LayoutAnimation.Types.linear,
                            property: LayoutAnimation.Properties.scaleX
                        },
                    }); 
                    toggleButtonInfo('flagButton', true)
                }}
                onPress={() => handleFlag(selectedRespoReport?.report_id)}
            >
              <>
                <View className="w-full h-full items-center justify-center">
                    {buttonInfo['flagButton'] ? (
                        <>
                            <Image
                                tintColor='#ffffff'
                                source={icons.flag}
                                className="w-[40%] h-[40%]"
                                resizeMode='contain'
                            />
                            <Text className="text-sm text-white font-rmedium text-center">{'FLAG'}</Text>
                        </>
                    ) : (
                        <Image 
                            tintColor='#ffffff'
                            source={icons.flag}
                            className="w-[60%] h-[60%]"
                            resizeMode='contain'
                        />
                    )}
                </View>
            </>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
      {/* Amenity Information Display */}
      <View className={`w-full ${amenityInfoVisible && !isIntensity ? 'h-[50%] bottom-0' : 'h-[50%] -bottom-[450px]'} absolute rounded-t-3xl items-center bg-white overflow-hidden`}>
        {/* Top Notch */}
        <View className="w-full h-[8%] mb-3 justify-center items-center bg-white">
          <TouchableHighlight onPress={() => toggleAmenityInfo(false)} underlayColor={"#d9ffe6"} className="w-full h-full items-center justify-center z-10" activeOpacity={0.8}>
            <Image 
                tintColor="#57b378"
                source={amenityInfoVisible ? icons.expandDown : icons.expandUp}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        {/* Title Container */}
        <View className="w-[96%] h-[12%] items-center justify-center mx-4 flex-row bg-white">
          <View className={`w-[2.5%] h-[80%] ${colorGenerator(selectedAmenity?.type)} left-[3%]`} />
          <View className="w-[94%] h-full left-[30%] justify-center">
            <Text className="w-[95%] text-xl text-black font-rmedium" numberOfLines={1} ellipsizeMode='tail'>
              {selectedAmenity?.name}
              {selectedAmenity?.description && !/(BFP|Barangay)/i.test(selectedAmenity.name) ? ` ${selectedAmenity.description}` : ''}
            </Text>
          </View>
        </View>
        {/* Text Container 1 */}
        <View className="w-[96%] h-[22%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-md shadow-black/40 overflow-hidden">
          {/* Distance Color */}
          <View className={`w-[3%] h-[80%] left-[10%] ${distanceColorGenerator(amenityDistance)}`} />
          <View className="w-[80%] h-full left-[30%] justify-center">
              {/* Distance to */}
              <Text className="text-base text-black font-rbase">{amenityDistance >= 1000 ? `${(amenityDistance / 1000).toFixed(2)} km` : `${amenityDistance} meters`}</Text>
              {/* Address */}
              <Text className="w-[88%] text-base text-slate-400 font-rbase" numberOfLines={1} ellipsizeMode='middle'>{selectedAmenity?.address}</Text>
          </View>
          <View className={`${buttonInfo['saveButton'] ? 'w-[22%]' : 'w-[22%]'} h-full`}>
            <TouchableHighlight
              underlayColor={"#3b8a57"} 
              className="w-full h-full bg-primary" 
              onLongPress={() => { 
                  LayoutAnimation.configureNext({
                      duration: 100,
                      update: {
                          type: LayoutAnimation.Types.linear,
                          property: LayoutAnimation.Properties.scaleX
                      },
                  }); 
                  toggleButtonInfo('saveButton', true)
              }}
              onPress={() => handleSave(selectedAmenity?.id)}
          >
            <>
              <View className="w-full h-full items-center justify-center">
                  {buttonInfo['saveButton'] ? (
                      <>
                          <Image
                              tintColor='#ffffff'
                              source={amenityIDSaved?.includes(selectedAmenity?.id) ? icons.saveS : icons.save}
                              className="w-[40%] h-[40%]"
                              resizeMode='contain'
                          />
                          <Text className="text-sm text-white font-rmedium text-center">{amenityIDSaved?.includes(selectedAmenity?.id) ? 'SAVED' : 'SAVE'}</Text>
                      </>
                  ) : (
                      <Image 
                          tintColor='#ffffff'
                          source={amenityIDSaved?.includes(selectedAmenity?.id) ? icons.saveS : icons.save}
                          className="w-[50%] h-[50%]"
                          resizeMode='contain'
                      />
                  )}
              </View>
            </>
            </TouchableHighlight>
          </View>
        </View>
        {/* Text Container 2 */}
        <View className="w-[96%] h-[22%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-md shadow-black/40 overflow-hidden">
          {/* Availability Color */}
          <View className={`w-[3%] h-[80%] left-[10%] bg-primary`} />
          <View className={`${buttonInfo['pingButton'] ? 'w-[75%]' : 'w-[80%]'} h-full justify-center left-[30%]`}>
              {/* Phone */}
              <Text className="text-base text-black font-rbase">{selectedAmenity?.phone?.length > 0 ? selectedAmenity.phone[0] : selectedAmenity?.email ? selectedAmenity.email : 'Unavailable'}</Text>
              {/* Address */}
              <Text className="text-base text-slate-400 font-rbase">{selectedAmenity?.hours?.everyday ? 'Open 24 Hours' : 'Monday-Friday, 7:00 AM - 5:00 PM'}</Text>
          </View>
          <View className={`${buttonInfo['callButton'] ? 'w-[22%]' : 'w-[22%]'} h-full`}>
            <TouchableHighlight
              underlayColor={"#3b8a57"} 
              className="w-full h-full bg-primary" 
              onLongPress={() => { 
                  LayoutAnimation.configureNext({
                      duration: 100,
                      update: {
                          type: LayoutAnimation.Types.linear,
                          property: LayoutAnimation.Properties.scaleX
                      },
                  }); 
                  toggleButtonInfo('callButton', true)
              }}
              onPress={() => handleCall('09208537663')}
          >
            <>
              <View className="w-full h-full items-center justify-center">
                  {buttonInfo['callButton'] ? (
                      <>
                          <Image
                              tintColor='#ffffff'
                              source={icons.call}
                              className="w-[40%] h-[40%]"
                              resizeMode='contain'
                          />
                          <Text className="text-sm text-white font-rmedium text-center">{'CALL'}</Text>
                      </>
                  ) : (
                      <Image 
                          tintColor='#ffffff'
                          source={icons.call}
                          className="w-[50%] h-[50%]"
                          resizeMode='contain'
                      />
                  )}
              </View>
            </>
            </TouchableHighlight>
          </View>
        </View>
        {/* Text Container 3 */}
        <View className="w-[96%] h-[22%] justify-center items-center flex-row bg-white rounded-lg mx-2 mt-2 px-2 shadow-md shadow-black/40 overflow-hidden">
            <View className="w-[98%] h-[80%] justify-center items-center flex-row">
              {/* Available Services */}
              <View className="w-[48%] h-full justify-center">
                <Text className="left-[4%] text-sm pb-2 text-slate-400 font-rbase">{'Available Services'}</Text>
                <View className="w-full h-[50%] flex-row overflow-hidden">
                  {/* Firetruck */}
                  {selectedAmenity?.services?.some(service => service.firetruck !== undefined) ? (
                    <View className={`w-full h-full`}>
                      <View className="w-full h-full flex-row">
                        <Image 
                          tintColor={selectedAmenity?.services?.some(service => service.firetruck) ? '#57b378' : '#94a3b8'}
                          source={icons.fireTruck}
                          className="w-[30%] h-[72%]"
                          resizeMode='contain'
                        />
                        <Text className={`text-sm ${selectedAmenity?.services?.some(service => service.firetruck) ? 'text-primary' : 'text-slate-400'} font-rmedium text-center left-[30%] pb-1`}>
                          {'FIRETRUCK'}
                        </Text>
                      </View>
                    </View>
                  ) : selectedAmenity?.services?.some(service => service.ambulance !== undefined) ? (
                    <View className={`w-full h-full`}>
                      <View className="w-full h-full flex-row">
                        <Image 
                          tintColor={selectedAmenity?.services?.some(service => service.ambulance) ? '#57b378' : '#94a3b8'}
                          source={icons.ambulance}
                          className="w-[30%] h-[70%]"
                          resizeMode='contain'
                        />
                        <Text className={`text-sm ${selectedAmenity?.services?.some(service => service.ambulance) ? 'text-primary' : 'text-slate-400'} font-rmedium text-center left-[30%] pb-1`}>
                          {'AMBULANCE'}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View className={`w-full h-full`}>
                      <View className="w-full h-full flex-row">
                        <Image 
                          tintColor={'#94a3b8'}
                          source={icons.policeCar}
                          className="w-[30%] h-[70%]"
                          resizeMode='contain'
                        />
                        <Text className="text-sm text-slate-400 font-rmedium text-center left-[30%] pb-1">
                          {'UNAVAILABLE'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              {/* Borderline */}
              <View className={`w-[4%] h-full ${moreButtonCount >= 2 ? 'right-[25%]' : 'right-[2%]'} items-center justify-center bg-white`}>
                <View className="h-[80%] border-l-0.5 border-slate-400" />
              </View>
              {/* Other Tools */}
              <View className={`${moreButtonCount >= 2 ? 'w-[50%] right-[2%]' : 'w-[48%]'} h-full flex-row justify-center items-center bg-white`}>
                <View className={`${buttonInfo['similarButton'] ? 'w-[40%] pr-1' : 'w-[33%]'} h-full items-center justify-center`}>
                  {/* Find Similar */}
                  <TouchableHighlight
                    underlayColor={"#3b8a57"} 
                    className={`${buttonInfo['similarButton'] ? 'w-full rounded-2xl' : 'w-12 rounded-full'} h-12 bg-primary`} 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('similarButton', true)
                    }}
                    onPress={() => selectQuery(selectedAmenity?.type)}
                  >
                    <View className="w-full h-full items-center justify-center">
                      {buttonInfo['similarButton'] ? (
                          <>
                              <Image
                                  tintColor='#ffffff'
                                  source={icons.findSimilar}
                                  className="w-[40%] h-[40%]"
                                  resizeMode='contain'
                              />
                              <Text className="text-sm text-white font-rmedium">{'SEARCH'}</Text>
                          </>
                      ) : (
                          <Image 
                              tintColor='#ffffff'
                              source={icons.findSimilar}
                              className="w-[50%] h-[50%]"
                              resizeMode='contain'
                          />
                      )}
                    </View>
                  </TouchableHighlight>
                </View>
                <View className={`${buttonInfo['shareButton'] ? 'w-[40%]' : 'w-[33%]'} h-full items-center justify-center`}>
                  {/* Share */}
                  <TouchableHighlight
                    underlayColor={"#3b8a57"} 
                    className={`${buttonInfo['shareButton'] ? 'w-full rounded-2xl' : 'w-12 rounded-full'} h-12 bg-primary`} 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('shareButton', true)
                    }}
                    onPress={() => handleShare(selectedAmenity)}
                  >
                    <View className="w-full h-full items-center justify-center">
                      {buttonInfo['shareButton'] ? (
                          <>
                              <Image
                                  tintColor='#ffffff'
                                  source={icons.share}
                                  className="w-[40%] h-[40%]"
                                  resizeMode='contain'
                              />
                              <Text className="text-sm text-white font-rmedium">{'SHARE'}</Text>
                          </>
                      ) : (
                          <Image 
                              tintColor='#ffffff'
                              source={icons.share}
                              className="w-[50%] h-[50%]"
                              resizeMode='contain'
                          />
                      )}
                    </View>
                  </TouchableHighlight>
                </View>
                <View className={`${buttonInfo['moreOptionsButton'] ? 'w-[40%] pl-1' : 'w-[33%]'} h-full items-center justify-center`}>
                  {/* More Options */}
                  <TouchableHighlight
                    underlayColor={"#3b8a57"} 
                    className={`${buttonInfo['moreOptionsButton'] ? 'w-full rounded-2xl' : 'w-12 rounded-full'} h-12 bg-primary`} 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('moreOptionsButton', true)
                    }}
                    onPress={handleOptions}
                  >
                    <View className="w-full h-full items-center justify-center">
                      {buttonInfo['moreOptionsButton'] ? (
                          <>
                              <Image
                                  tintColor='#ffffff'
                                  source={icons.moreDetails}
                                  className="w-[40%] h-[40%]"
                                  resizeMode='contain'
                              />
                              <Text className="text-sm text-white font-rmedium">{'OPTIONS'}</Text>
                          </>
                      ) : (
                          <Image 
                              tintColor='#ffffff'
                              source={icons.moreDetails}
                              className="w-[50%] h-[50%]"
                              resizeMode='contain'
                          />
                      )}
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
        </View>
      </View>
      {/* Search Display */}
      <View className={`w-full ${searchInfoVisible && !isIntensity ? `h-[75%] bottom-0` : 'h-[50%] -bottom-[450px]'} absolute rounded-t-3xl items-center bg-white overflow-hidden`}>
        {/* Top Notch */}
        <View className="w-full h-[6%] justify-center items-center">
          <TouchableHighlight onPress={() => toggleSearchInfo(false)} underlayColor={"#d9ffe6"} className="w-full h-full items-center justify-center z-10" activeOpacity={0.8}>
            <Image 
                tintColor="#57b378"
                source={searchInfoVisible ? icons.expandDown : icons.expandUp}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        {/* Search Container */}
        <View className={`w-full ${keyboardVisible ? 'h-[18%]' : 'h-[12%]'} justify-evenly flex-row border-b-[1px] border-primary-85`}>
          {/* Search Container */}
          <View className="w-full h-full items-center flex-row bg-white overflow-hidden">
            {/* Search Icon */}
            <Image 
              tintColor="#94A3B8"
              source={icons.search}
              className="w-[15%] h-[30%]"
              resizeMode='contain'
            />
            {/* Search Bar */}
            <TextInput
                className="w-[65%] h-full text-base font-rbase text-black pl-4 pr-10"
                placeholder={`Search - ${searchMode === 'all' ? 'All' : (searchMode === 'reports' ? 'Reports' : 'Amenities')}`}
                placeholderTextColor='#94A3B8'
                value={searchQuery}
                onSubmitEditing={() => submitQuery(searchQuery)}
                onChangeText={(value) => handleInputChange(value)}
                returnKeyType="search"
            />
            <TouchableOpacity className="w-[12%] h-[80%] items-center justify-center p-2 absolute right-[20%]" onPress={removeQuery} disabled={!searchQuery}>
              {searchQuery && (
                <Image 
                  tintColor="#57b378"
                  source={icons.close}
                  className="w-[50%] h-[50%]"
                  resizeMode='contain'
                />
              )}
            </TouchableOpacity>
            {/* Search Button */}
            <View className="w-[20%] h-full p-2">
              <TouchableHighlight underlayColor={"#3b8a57"} className="w-full h-full items-center justify-center bg-primary rounded-xl" onPress={() => submitQuery(searchQuery)} disabled={!searchQuery}>
                {!submitLoading ? (
                  <Image 
                    tintColor="#ffffff"
                    source={icons.search}
                    className="w-[50%] h-[50%]"
                    resizeMode='contain'
                  />
                ) : (
                  <ActivityIndicator size="large" color="#ffffff" />
                )}
              </TouchableHighlight>
            </View>
          </View>
        </View>
        {/* Filter Container */}
        <View className={`w-full ${filterVisible ? filterSearchVisible || filterMapVisible ? (keyboardVisible ? 'h-[54%]' : 'h-[36%]') : (keyboardVisible ? 'h-[34%]' : 'h-[24%]') : (keyboardVisible ? 'h-[18%]' : 'h-[12%]')} ${height <= 900 ? 'my-[1%]' : ''} justify-center bg-white overflow-hidden`}>
          {/* List of Filters */}
          <View className={`w-full ${filterVisible ? (filterSearchVisible || filterMapVisible ? 'h-[25%]' : 'h-[40%]') : 'h-0'} items-center flex-row pl-2 overflow-hidden`}>
            {/* Search Filter Button */}
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[35%] h-[80%] ${filterSearchVisible ? 'bg-primary' : 'bg-white border-[1px] border-slate-400'} rounded-xl mr-2`} onPress={toggleSearchFilters}>
                <View className="w-full h-full flex-row">
                  <View className="w-[75%] h-full items-center justify-center">
                    <Text className={`font-rbase text-base ${filterSearchVisible ? 'text-white' : 'text-black'}`}>{'Search Filter'}</Text>
                  </View>
                  <View className="w-[20%] h-full items-center justify-center">
                    <Image 
                      tintColor={filterSearchVisible ? '#ffffff' : '#000000'}
                      source={filterSearchVisible ? icons.arrowU : icons.arrowD}
                      className="w-[40%] h-[25%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
            </TouchableHighlight>
            {/* Map Filter Button */}
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[35%] h-[80%] ${filterMapVisible ? 'bg-primary' : 'bg-white border-[1px] border-slate-400'} rounded-xl mr-2`} onPress={toggleMapFilters}>
                <View className="w-full h-full flex-row">
                  <View className="w-[75%] h-full items-center justify-center">
                    <Text className={`font-rbase text-base ${filterMapVisible ? 'text-white' : 'text-black'}`}>{'Map Filter'}</Text>
                  </View>
                  <View className="w-[20%] h-full items-center justify-center">
                    <Image 
                      tintColor={filterMapVisible ? '#ffffff' : '#000000'}
                      source={filterMapVisible ? icons.arrowU : icons.arrowD}
                      className="w-[50%] h-[25%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
            </TouchableHighlight>
          </View>
          {/* Search Filter - Select One Container */}
          <View className={`w-full ${filterSearchVisible ? 'h-[40%]' : 'h-0'} justify-center pl-2 overflow-hidden`}>
            <Text className="font-rmedium text-base text-black pb-1">{'Select one'}</Text>
            <View className="w-full h-[40%] gap-x-2 flex-row">
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[20%] h-full ${searchMode === 'all' ? 'bg-slate-400' : 'bg-slate-200'} rounded-lg items-center justify-center`} onPress={() => handleSelectMode('all')}>
                <Text className={`font-rbase text-sm ${searchMode === 'all' ? 'text-white' : 'text-black'}`}>{'Show all'}</Text>
              </TouchableHighlight>
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[20%] h-full ${searchMode === 'reports' ? 'bg-slate-400' : 'bg-slate-200'} rounded-lg items-center justify-center`} onPress={() => handleSelectMode('reports')}>
                <Text className={`font-rbase text-sm ${searchMode === 'reports' ? 'text-white' : 'text-black'}`}>{'Reports'}</Text>
              </TouchableHighlight>
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[20%] h-full ${searchMode === 'amenities' ? 'bg-slate-400' : 'bg-slate-200'} rounded-lg items-center justify-center`} onPress={() => handleSelectMode('amenities')}>
                <Text className={`font-rbase text-sm ${searchMode === 'amenities' ? 'text-white' : 'text-black'}`}>{'Amenities'}</Text>
              </TouchableHighlight>
            </View>
          </View>
          {/* Map Filter - Marker Configuration Container */}
          <View className={`w-full ${filterMapVisible ? 'h-[40%]' : 'h-0'} justify-center overflow-hidden`}>
            <View className="w-full h-[60%] justify-evenly flex-row bg-white">
              {/* Report Marker Visibility */}
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[45%] h-full ${!reportMarkerVisible ? 'bg-primary' : 'bg-white border-[1px] border-slate-400'} rounded-lg justify-center mr-3`} onPress={() => setReportMarkerVisible(!reportMarkerVisible)}>
                <View className="w-full h-full flex-row">
                  <View className="w-[75%] h-full pl-4 justify-center">
                    <Text className={`font-rbase text-sm ${!reportMarkerVisible ? 'text-white' : 'text-black'}`}>{'Reports'}</Text>
                  </View>
                  <View className="w-[20%] h-full items-center justify-center">
                    <Image 
                      tintColor={!reportMarkerVisible ? '#ffffff' : '#000000'}
                      source={!reportMarkerVisible ? icons.eye : icons.eyeHide}
                      className="w-[80%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableHighlight>
              {/* Amenities Marker Count and Visibility */}
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[45%] h-full ${amenityMapOptionVisible ? 'bg-primary' : 'bg-white border-[1px] border-slate-400'} rounded-lg justify-center`} onPress={() => toggleAmenityOptions()}>
                <View className="w-full h-full flex-row">
                  <View className="w-[75%] h-full pl-4 justify-center">
                    <Text className={`font-rbase text-sm ${amenityMapOptionVisible ? 'text-white' : 'text-black'}`}>{'Amenities'}</Text>
                  </View>
                  <View className="w-[20%] h-full items-center justify-center">
                    <Image 
                      tintColor={amenityMapOptionVisible ? '#ffffff' : '#000000'}
                      source={amenityMapOptionVisible ? icons.arrowU : icons.arrowD}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          </View>
          {/* Toggle Filters - Filters Button */}
          <View className={`w-full ${filterVisible ? (filterSearchVisible || filterMapVisible ? 'h-[25%]' : 'h-[40%]') : 'h-[80%]'} justify-center pl-2 overflow-hidden`}>
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[30%] h-[80%] ${filterVisible ? 'bg-primary' : 'bg-white border-[1px] border-slate-400'} rounded-2xl`} onPress={() => toggleFilters(!filterVisible)}>
                <View className="w-full h-full flex-row">
                  <View className="w-[75%] h-full items-center justify-center">
                    <Text className={`font-rbase text-base ${filterVisible ? 'text-white' : 'text-black'}`}>{'Filters'}</Text>
                  </View>
                  <View className="w-[25%] h-full items-center justify-center">
                    <Image 
                      tintColor={filterVisible ? '#ffffff' : '#000000'}
                      source={filterVisible ? icons.arrowU : icons.arrowD}
                      className="w-[40%] h-[25%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
            </TouchableHighlight>
          </View>
        </View>
        {amenityMapOptionVisible ? (
          <View className="w-[95%] h-[55%] bg-white border-[1px] border-primary absolute items-center right-[3%] bottom-[2%] z-20 shadow-lg shadow-black">
            {/* Option Title */}
            <View className="w-full h-[18%] flex-row">
              <View className="w-[80%] h-full items-start justify-center">
                <Text className="pl-3 text-lg text-black font-rbold">{`Amenity Options`}</Text>
              </View>
              <View className="w-[20%] h-full items-center justify-center">
                <TouchableOpacity className="w-full h-full items-end justify-center pr-4" onPress={toggleAmenityOptions}>
                  <Image 
                    tintColor='#000000'
                    source={icons.close}
                    className="w-[30%] h-[30%]"
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Default Tools */}
            <View className="w-full h-[12%] pl-2 gap-x-2 flex-row">
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[20%] h-full rounded-lg items-center justify-center`} onPress={resetAmenity}>
                <Text className={`font-rbase text-sm text-blue-400`}>{'Select All'}</Text>
              </TouchableHighlight>
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-[20%] h-full rounded-lg items-center justify-center`} onPress={resetAmenity}>
                <Text className={`font-rbase text-sm text-blue-400`}>{'Reset'}</Text>
              </TouchableHighlight>
            </View>
            {/* Fire Station */}
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[95%] h-[10%] mt-2 rounded-lg justify-center bg-white`} onPress={() => toggleAmenityType('fire_station')}>
              <View className="w-full h-full flex-row">
                {/* Checkbox Logic */}
                <View className="w-[10%] h-full items-center justify-center">
                  <Image 
                    tintColor='#57b378'
                    source={amenityTypes.includes('fire_station') && amenityCount.fire_station > 0 ? icons.checkBoxCheck : icons.checkBox}
                    className="w-[70%] h-[70%]"
                    resizeMode='contain'
                  />
                </View>
                {/* Title */}
                <View className="w-[70%] pl-2 h-full justify-center">
                  <Text className="text-base text-black font-rbase">{`Fire Station`}</Text>
                </View>
                {/* Amenity Count */}
                <View className="w-[20%] h-full pr-2 justify-center items-end">
                  <Text className="text-base text-black font-rbase" numberOfLines={1}>{amenityCount?.fire_station ? amenityCount.fire_station : 0}</Text>
                </View>
              </View>
            </TouchableHighlight>
            {/* Police Station */}
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[95%] h-[10%] mt-1 rounded-lg justify-center bg-white`} onPress={() => toggleAmenityType('police')}>
              <View className="w-full h-full flex-row">
                {/* Checkbox Logic */}
                <View className="w-[10%] h-full items-center justify-center">
                  <Image 
                    tintColor='#57b378'
                    source={amenityTypes.includes('police') && amenityCount.police > 0 ? icons.checkBoxCheck : icons.checkBox}
                    className="w-[70%] h-[70%]"
                    resizeMode='contain'
                  />
                </View>
                {/* Title */}
                <View className="w-[70%] pl-2 h-full justify-center">
                  <Text className="text-base text-black font-rbase">{`Police Station`}</Text>
                </View>
                {/* Amenity Count */}
                <View className="w-[20%] h-full pr-2 justify-center items-end">
                  <Text className="text-base text-black font-rbase" numberOfLines={1}>{amenityCount?.police ? amenityCount.police : 0}</Text>
                </View>
              </View>
            </TouchableHighlight>
            {/* MDRRMO */}
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[95%] h-[10%] mt-1 rounded-lg justify-center bg-white`} onPress={() => toggleAmenityType('disaster')}>
              <View className="w-full h-full flex-row">
                {/* Checkbox Logic */}
                <View className="w-[10%] h-full items-center justify-center">
                  <Image 
                    tintColor='#57b378'
                    source={amenityTypes.includes('disaster') && amenityCount.disaster > 0 ? icons.checkBoxCheck : icons.checkBox}
                    className="w-[70%] h-[70%]"
                    resizeMode='contain'
                  />
                </View>
                {/* Title */}
                <View className="w-[70%] pl-2 h-full justify-center">
                  <Text className="text-base text-black font-rbase">{`DRRMO`}</Text>
                </View>
                {/* Amenity Count */}
                <View className="w-[20%] h-full pr-2 justify-center items-end">
                  <Text className="text-base text-black font-rbase" numberOfLines={1}>{amenityCount?.disaster ? amenityCount.disaster : 0}</Text>
                </View>
              </View>
            </TouchableHighlight>
            {/* Barangay */}
            <TouchableHighlight underlayColor={'#fffd99'} className={`w-[95%] h-[10%] mt-1 rounded-lg justify-center bg-white`} onPress={() => toggleAmenityType('barangay')}>
              <View className="w-full h-full flex-row">
                {/* Checkbox Logic */}
                <View className="w-[10%] h-full items-center justify-center">
                  <Image 
                    tintColor='#57b378'
                    source={amenityTypes.includes('barangay') && amenityCount.barangay > 0 ? icons.checkBoxCheck : icons.checkBox}
                    className="w-[70%] h-[70%]"
                    resizeMode='contain'
                  />
                </View>
                {/* Title */}
                <View className="w-[70%] pl-2 h-full justify-center">
                  <Text className="text-base text-black font-rbase">{`Barangay Hall`}</Text>
                </View>
                {/* Amenity Count */}
                <View className="w-[20%] h-full pr-2 justify-center items-end">
                  <Text className="text-base text-black font-rbase" numberOfLines={1}>{amenityCount?.barangay ? amenityCount.barangay : 0}</Text>
                </View>
              </View>
            </TouchableHighlight>
            {/* Show Nearest */}
            <View className="w-[95%] h-[15%] items-center justify-center absolute bottom-[4%]">
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-full h-[70%] rounded-xl items-center justify-center bg-primary`} onPress={handleFindNearest}>
                <Text className={`font-rbase text-base text-white`}>{'Show Nearest Amenity'}</Text>
              </TouchableHighlight>
            </View>
          </View>
        ) : (
          <></>
        )}
        {/* Search Body Container */}
        <View className="w-full">
          <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={searchResults.length >= 4} decelerationRate={'normal'} className={`w-full h-full bg-white`} contentContainerStyle={{ height: adjustedHeight }}>
            {searchResults.length >= 0 && searchView === 'result' ? (
              <View className="w-full h-12 justify-center flex-row border-b-[1px] border-slate-300">
                <View className="w-[45%] h-full items-center justify-center">
                  <TouchableHighlight
                    underlayColor={"#fffd99"} 
                    className="w-full h-full bg-white" 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('resultButton', true)
                    }}
                    onPress={() => setSearchView('result')}
                  >
                  <>
                    <View className="w-full h-full items-center justify-center">
                        {buttonInfo['resultButton'] ? (
                          <View className="w-full h-full flex-row">
                            <View className="w-[25%] h-full items-center justify-center">
                              <Image
                                tintColor='#000000'
                                source={searchView === 'result' ? icons.resultS : icons.result}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-[75%] h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{`${searchResults?.length} RESULTS`}</Text>
                            </View>
                          </View>
                        ) : (
                          <View className="w-full h-full justify-center flex-row">
                            <View className="w-full h-full items-center justify-center">
                              <Image 
                                tintColor='#000000'
                                source={searchView === 'result' ? icons.resultS : icons.result}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-6 h-6 absolute right-0 items-center rounded-full justify-center bg-white-500">
                              <Text className="text-sm text-white font-rmedium text-center">{`${searchResults?.length}`}</Text>
                            </View>
                          </View>
                        )}
                    </View>
                  </>
                  </TouchableHighlight>
                </View>
                <View className="w-[5%] h-full items-center justify-center">
                  <View className="h-[80%] border-0.5 border-slate-300"/>
                </View>
                <View className="w-[45%] h-full items-center justify-center">
                  <TouchableHighlight
                    underlayColor={"#fffd99"} 
                    className="w-full h-full bg-white" 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('savedButton', true)
                    }}
                    onPress={() => setSearchView('saved')}
                  >
                  <>
                    <View className="w-full h-full items-center justify-center">
                        {buttonInfo['savedButton'] ? (
                          <View className="w-full h-full flex-row">
                            <View className="w-[25%] h-full items-center justify-center">
                              <Image
                                tintColor='#000000'
                                source={searchView === 'saved' ? icons.saveS : icons.save}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-[75%] h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{'SAVED'}</Text>
                            </View>
                          </View>
                        ) : (
                          <View className="w-full h-full flex-row">
                            <View className="w-full h-full items-center justify-center">
                              <Image 
                                tintColor='#000000'
                                source={searchView === 'saved' ? icons.saveS : icons.save}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-0 h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{'SAVED'}</Text>
                            </View>
                          </View>
                        )}
                    </View>
                  </>
                  </TouchableHighlight>
                </View>
              </View>
            ) : (
              <View className="w-full h-12 justify-center flex-row border-b-[1px] border-slate-300">
                <View className="w-[45%] h-full items-center justify-center">
                  <TouchableHighlight
                    underlayColor={"#fffd99"} 
                    className="w-full h-full bg-white" 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('recentButton', true)
                    }}
                    onPress={() => setSearchView('recent')}
                  >
                  <>
                    <View className="w-full h-full items-center justify-center">
                        {buttonInfo['recentButton'] ? (
                          <View className="w-full h-full flex-row">
                            <View className="w-[25%] h-full items-center justify-center">
                              <Image
                                tintColor='#000000'
                                source={searchView === 'recent' ? icons.recentS : icons.recent}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-[75%] h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{'RECENT'}</Text>
                            </View>
                          </View>
                        ) : (
                          <View className="w-full h-full flex-row">
                            <View className="w-full h-full items-center justify-center">
                              <Image 
                                tintColor='#000000'
                                source={searchView === 'recent' ? icons.recentS : icons.recent}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-0 h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{'RECENT'}</Text>
                            </View>
                          </View>
                        )}
                    </View>
                  </>
                  </TouchableHighlight>
                </View>
                <View className="w-[5%] h-full items-center justify-center">
                  <View className="h-[80%] border-0.5 border-slate-300"/>
                </View>
                <View className="w-[45%] h-full items-center justify-center">
                  <TouchableHighlight
                    underlayColor={"#fffd99"} 
                    className="w-full h-full bg-white" 
                    onLongPress={() => { 
                        LayoutAnimation.configureNext({
                            duration: 100,
                            update: {
                                type: LayoutAnimation.Types.linear,
                                property: LayoutAnimation.Properties.scaleX
                            },
                        }); 
                        toggleButtonInfo('savedButton', true)
                    }}
                    onPress={() => setSearchView('saved')}
                >
                  <>
                    <View className="w-full h-full items-center justify-center">
                        {buttonInfo['savedButton'] ? (
                          <View className="w-full h-full flex-row">
                            <View className="w-[25%] h-full items-center justify-center">
                              <Image
                                tintColor='#000000'
                                source={searchView === 'saved' ? icons.saveS : icons.save}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-[75%] h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{'SAVED'}</Text>
                            </View>
                          </View>
                        ) : (
                          <View className="w-full h-full flex-row">
                            <View className="w-full h-full items-center justify-center">
                              <Image 
                                tintColor='#000000'
                                source={searchView === 'saved' ? icons.saveS : icons.save}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                              />
                            </View>
                            <View className="w-0 h-full justify-center">
                              <Text className="text-sm text-black font-rmedium text-center">{'SAVED'}</Text>
                            </View>
                          </View>
                        )}
                    </View>
                  </>
                  </TouchableHighlight>
                </View>
              </View>
            )}
            {previousQuery.length > 0 && searchView === 'recent' && (
              <>
                {previousQuery.map((query, index) => (
                  <TouchableHighlight key={index} underlayColor={'#fffd99'} className="w-full h-12 bg-white px-3" onPress={() => selectQuery(query)}>
                    <View className="w-full h-full items-center justify-center flex-row">
                      <View className="w-[10%] h-full items-center justify-center">
                        <Image
                          tintColor='#94a3b8'
                          source={icons.recentP}
                          className="w-[60%] h-[60%]"
                          resizeMode='contain'
                        />
                      </View>
                      <View className="w-[80%] pl-3 h-full justify-center">
                        <Text className="text-base text-black font-rbase">{query}</Text>
                      </View>
                      <View className="w-[10%] h-full items-center justify-center">
                        <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => removePreviousQuery(query)}>
                          <Image
                            tintColor='#000000'
                            source={icons.close}
                            className="w-[40%] h-[40%]"
                            resizeMode='contain'
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableHighlight>
                ))}
              </>
            )}
            {amenitySaved.length > 0 && searchView === 'saved' ? (
              <>
                {amenitySaved.map((save) => (
                  <TouchableHighlight key={save.id} underlayColor={'#fffd99'} className="w-full h-20 bg-white border-b-[1px] border-slate-400 px-3" onPress={() => handleSelectResult(save.id)}>
                    <View className="w-full h-full items-center justify-center flex-row">
                      <View className={`w-[5%] h-[80%] items-center justify-center`}>
                        <View className={`w-[30%] h-full ${colorGenerator(save?.type)}`} />
                      </View>
                      <View className="w-[95%] h-full justify-center">
                        <Text className="text-lg text-black font-rmedium">{`${save.name} ${save.description}`}</Text>
                        <Text className="text-base text-slate-400 font-rbase">{`${translate(save.type)}  |  ${save.address}`}</Text>
                      </View>
                    </View>
                  </TouchableHighlight>
                ))}
              </>
            ) : amenitySaved.length === 0 && searchView === 'saved' ? (
              <View className="w-full h-12 items-center justify-center">
                <Text className="text-base text-black font-rbase">No Saved Amenities Found</Text>
              </View>
            ) : (
              <></>
            )}
            {searchResults.length > 0 && searchView === 'result' ? (
              <>
                {searchResults.map((result) => (
                  <TouchableHighlight key={result.report_id || result.id} underlayColor={'#fffd99'} className="w-full h-20 bg-white border-b-[1px] border-slate-400 px-3" onPress={() => handleSelectResult(result.report_id || result.id)}>
                    <View className="w-full h-full items-center justify-center flex-row">
                      <View className={`w-[5%] h-[80%] items-center justify-center`}>
                        <View className={`w-[30%] h-full ${colorGenerator(result?.handler || result?.type)}`} />
                      </View>
                      <View className="w-[95%] h-full justify-center">
                        <Text className="text-lg text-black font-rmedium">{result.name ? `${result.name} ${result.description}` : translate(result.report_type)}</Text>
                        <Text className="text-base text-slate-400 font-rbase">{result.type ? `${translate(result.type)}  |  ${result.address}` : `RID #${result.report_id} |  ${result.report_address}`}</Text>
                      </View>
                    </View>
                  </TouchableHighlight>
                ))}
              </>
            ) : searchResults.length === 0 && searchView === 'result' ? (
              <View className="w-full h-12 items-center justify-center">
                <Text className="text-base text-black font-rbase">No Results Found</Text>
              </View>
            ) : (
              <></>
            )}
          </ScrollView>
        </View>
      </View>
      {/* Intensity Symbol/Legends Panel */}
      <View className={`w-full ${symbolPanelVisible ? `h-[75%] bottom-0` : 'h-[50%] -bottom-[450px]'} absolute rounded-t-3xl items-center bg-primary-dark overflow-hidden`}>
        {/* Top Notch */}
        <View className="w-full h-[6%] justify-center items-center">
          <TouchableHighlight onPress={() => toggleSymbolPanel(false)} underlayColor={"#223629"} className="w-full h-full items-center justify-center z-10" activeOpacity={0.8}>
            <Image 
                tintColor="#ffffff"
                source={symbolPanelVisible ? icons.expandDown : icons.expandUp}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        {/* For Scrollability */}
        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
          {/* Legend Title and Tools */}
          <View className="w-full h-12 justify-center border-b-[1px] border-slate-400 mb-2">
            <Text className="text-base text-white font-rmedium px-4">{'Legend'}</Text>
          </View>
          {categoryState && Object.keys(categoryState).map((categoryKey) => {
            const category = categoryState[categoryKey];
            const reports = category?.category ?? [];
            const pallete = category?.pallete ?? [];

            const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

            return (
              <View key={categoryKey} className={`w-full ${reports.length > 0 ? (activeCategories.includes(categoryKey) ? 'h-64 border-slate-400 border-b-[1px]' : 'h-12') : 'h-0'} overflow-hidden`}>
                {/* Display Category */}
                <TouchableHighlight underlayColor={"#3e664c"} className={`w-full ${activeCategories.includes(categoryKey) ? 'h-12' : 'h-full'}`} onPress={() => toggleCategory(categoryKey)}>
                  <View className="w-full h-full flex-row">
                    <View className="w-[85%] h-full pl-4 justify-center">
                      <Text className="font-rbase text-base text-white">{`${capitalizeFirstLetter(categoryKey)} Category`}</Text>
                    </View>
                    <View className="w-[15%] h-full items-center justify-center">
                      <Image
                        tintColor="#ffffff"
                        source={activeCategories.includes(categoryKey) ? icons.arrowU : icons.arrowD}
                        className="w-[20%] h-[20%]"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </TouchableHighlight>

                {/* Visible Categories */}
                <View
                  className={`w-[15%] ${
                    activeCategories.includes(categoryKey) ? 'h-12' : 'h-full'
                  } absolute right-[15%]`}
                >
                  <TouchableHighlight
                    underlayColor={"#3e664c"}
                    className="w-full h-full items-center justify-center rounded-full"
                    onPress={() => toggleCategoryVisible(categoryKey)}
                  >
                    <Image
                      tintColor="#ffffff"
                      source={visibleCategories.includes(categoryKey) ? icons.eyeHide : icons.eye}
                      className="w-[50%] h-[50%]"
                      resizeMode="contain"
                    />
                  </TouchableHighlight>
                </View>

                {/* Pallete Preview */}
                <View
                  className={`w-[10%] ${
                    activeCategories.includes(categoryKey) ? 'h-12' : 'h-full'
                  } absolute right-[35%] justify-center`}
                >
                  <View className="w-full h-[60%] items-center justify-center flex-row">
                    {pallete?.map((color, index) => (
                      <View key={index} style={{ width: '20%', height: '100%', backgroundColor: color }} />
                    ))}
                  </View>
                </View>

                {/* Ranges and Intensity */}
                <View className="w-full h-[82%]">
                  {/* Recent Cases */}
                  <View className="w-full h-[20%] flex-row items-center">
                    <View className="w-[35%] h-full justify-center">
                      <Text className="text-base text-white font-rbase px-4">Recent Cases:</Text>
                    </View>
                    <View className="w-[65%] h-full">
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="w-full h-full"
                        contentContainerStyle={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {categoryGenerator(categoryKey)?.map((handle) => {
                            const count = category?.category?.filter(report => report.report_type === handle).length || 0;
                            if (count > 0) {
                                return (
                                    <View key={handle} className="h-[80%] px-4 mx-1 justify-center items-center bg-white-500 rounded-3xl">
                                        <Text className="text-white text-sm font-rbase">{translate(handle)} ({count})</Text>
                                    </View>
                                );
                            }
                            return null;
                        })}
                        <View className="h-[80%] px-4 mx-1 justify-center items-center bg-white-500 rounded-3xl">
                          <Text className="text-white text-sm font-rbase">Total ({category?.category?.length || 0})</Text>
                        </View>
                      </ScrollView>
                    </View>
                  </View>

                  {/* Risk Levels */}
                  {['Dangerous Area', 'High Risk Area', 'Moderate Risk Area', 'Minimal Risk Area', 'Low Risk Area'].map(
                    (label, index) => (
                      <View key={index} className="w-full h-[15%] flex-row justify-center pl-4">
                        <View className="w-[10%] h-full items-center justify-center">
                          <View style={{ width: '70%', height: '70%', backgroundColor: pallete[4 - index] ?? '#000' }} />
                        </View>
                        <View className="w-[90%] h-full justify-center">
                          <Text className="text-base text-white font-rbase px-4">{label}</Text>
                        </View>
                      </View>
                    )
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
      {/* Map Options Display */}
      <View className={`w-full ${mapOptions ? 'h-[50%] bottom-0' : 'h-[50%] -bottom-[450px]'} absolute rounded-t-3xl items-center bg-white overflow-hidden`}>
        {/* Top Notch */}
        <View className="w-full h-[9%] mb-3 justify-center items-center bg-white">
          <TouchableHighlight onPress={() => toggleMapOption(false)} underlayColor={"#d9ffe6"} className="w-full h-full items-center justify-center z-10" activeOpacity={0.8}>
            <Image 
                tintColor="#57b378"
                source={mapOptions ? icons.expandDown : icons.expandUp}
                className="w-[30%] h-[30%]"
                resizeMode='contain'
            />
          </TouchableHighlight>
        </View>
        {/* Body Container */}
        <View className="w-[94%] h-[90%]">
          <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
            {/* Legends Title */}
            <View className={`w-full ${legendsVisible ? 'h-fit' : 'h-10'} border-b-[1px] border-slate-400 overflow-hidden`}>
              {/* Legends Expand Button */}
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-full ${legendsVisible ? 'h-10' : 'h-full'}`} onPress={() => toggleLegends(!legendsVisible)}>
                <View className="w-full h-full items-center flex-row">
                  <View className="w-[90%] h-full justify-center ">
                    <Text className="text-base text-black font-rbase px-2">{'Legends'}</Text>
                  </View>
                  <View className="w-[10%] h-full justify-center items-center pl-2">
                    <Image 
                      tintColor="#000000"
                      source={legendsVisible ? icons.expandUp : icons.expandDown}
                      className="w-[60%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableHighlight>
              {/* Stations */}
              <View className={`w-full ${legendsOptions.stations.visible ? 'h-52' : 'h-10'} overflow-hidden`}>
                <TouchableHighlight underlayColor={'#fffd99'} onPress={() => toggleLegendsOptions('stations')} className={`w-full ${legendsOptions.stations.visible ? 'h-10' : 'h-full'}`}>
                  <View className="w-full h-full items-center flex-row">
                    <View className="w-[90%] h-full justify-center ">
                      <Text className="text-base text-black font-rbase px-2">{'Stations'}</Text>
                    </View>
                    <View className="w-[10%] h-full justify-center items-center pl-2">
                      <Image 
                        tintColor="#000000"
                        source={legendsOptions.stations.visible ? icons.expandUp : icons.expandDown}
                        className="w-[60%] h-[50%]"
                        resizeMode='contain'
                      />
                    </View>
                  </View>
                </TouchableHighlight>
                {legendsOptions.stations.visible && legends.stations.map((item, index) => (
                  <View key={index} className="w-full h-10 flex-row">
                      <View className="w-[10%] h-full items-center justify-center">
                          <Image
                              source={item.icon}
                              className="w-[90%] h-[90%]"
                              resizeMode='contain'
                          />
                      </View>
                      <View className="w-[90%] h-full justify-center">
                          <Text className="text-base text-black font-rbase px-2">{item.name}</Text>
                      </View>
                  </View>
                ))}
              </View>
              {/* Reports */}
              {isDuty ? (
                <View className={`w-full ${legendsOptions.respo.visible ? 'h-52' : 'h-10'} overflow-hidden`}>
                  <TouchableHighlight underlayColor={'#fffd99'} onPress={() => toggleLegendsOptions('respo')} className={`w-full ${legendsOptions.respo.visible ? 'h-10' : 'h-full'}`}>
                    <View className="w-full h-full items-center flex-row">
                      <View className="w-[90%] h-full justify-center ">
                        <Text className="text-base text-black font-rbase px-2">{'Reports'}</Text>
                      </View>
                      <View className="w-[10%] h-full justify-center items-center pl-2">
                        <Image 
                          tintColor="#000000"
                          source={legendsOptions.respo.visible ? icons.expandUp : icons.expandDown}
                          className="w-[60%] h-[50%]"
                          resizeMode='contain'
                        />
                      </View>
                    </View>
                  </TouchableHighlight>
                  {legendsOptions.respo.visible && legends.respo.map((item, index) => (
                    <View key={index} className="w-full h-10 flex-row">
                        <View className="w-[10%] h-full items-center justify-center">
                            <Image
                                source={item.icon}
                                className="w-[90%] h-[90%]"
                                resizeMode='contain'
                            />
                        </View>
                        <View className="w-[90%] h-full justify-center">
                            <Text className="text-base text-black font-rbase px-2">{item.name}</Text>
                        </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className={`w-full ${legendsOptions.reports.visible ? 'h-52' : 'h-10'} overflow-hidden`}>
                  <TouchableHighlight underlayColor={'#fffd99'} onPress={() => toggleLegendsOptions('reports')} className={`w-full ${legendsOptions.reports.visible ? 'h-10' : 'h-full'}`}>
                    <View className="w-full h-full items-center flex-row">
                      <View className="w-[90%] h-full justify-center ">
                        <Text className="text-base text-black font-rbase px-2">{'Reports'}</Text>
                      </View>
                      <View className="w-[10%] h-full justify-center items-center pl-2">
                        <Image 
                          tintColor="#000000"
                          source={legendsOptions.reports.visible ? icons.expandUp : icons.expandDown}
                          className="w-[60%] h-[50%]"
                          resizeMode='contain'
                        />
                      </View>
                    </View>
                  </TouchableHighlight>
                  {legendsOptions.reports.visible && legends.reports.map((item, index) => (
                    <View key={index} className="w-full h-10 flex-row">
                        <View className="w-[10%] h-full items-center justify-center">
                            <Image
                                source={item.icon}
                                className="w-[90%] h-[90%]"
                                resizeMode='contain'
                            />
                        </View>
                        <View className="w-[90%] h-full justify-center">
                            <Text className="text-base text-black font-rbase px-2">{item.name}</Text>
                        </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {/* Themes Title */}
            <View className={`w-full ${themesVisible ? 'h-fit' : 'h-10'} border-b-[1px] border-slate-400 overflow-hidden`}>
              {/* Theme Expand Button */}
              <TouchableHighlight underlayColor={'#fffd99'} className={`w-full ${themesVisible ? 'h-10' : 'h-full'}`} onPress={() => toggleThemes(!themesVisible)}>
                <View className="w-full h-full items-center flex-row">
                  <View className="w-[90%] h-full justify-center ">
                    <Text className="text-base text-black font-rbase px-2">{'Themes'}</Text>
                  </View>
                  <View className="w-[10%] h-full justify-center items-center pl-2">
                    <Image 
                      tintColor="#000000"
                      source={themesVisible ? icons.expandUp : icons.expandDown}
                      className="w-[60%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableHighlight>
              {/* Theme Buttons */}
              <View className={`w-full ${themesVisible ? 'h-24' : 'h-0'} px-2 pb-2`}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                  {themes.map((theme) => (
                    <ThemeButton
                      key={theme.name}
                      theme={theme.name}
                      icon={theme.icon}
                      isSelected={mapTheme === theme.name}
                      onPress={() => {
                        setMapTheme(theme.name)
                        setTheme(theme.name)
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            </View>
            {/* Turn On EIM */}
            {!isOnDuty && (
              <TouchableHighlight 
              underlayColor={'#fffd99'} 
              className="w-full h-10 border-b-[1px] border-slate-400"
              onPress={() => {
                toggleMapOption(false)
                setIntensity(true)
                changeMap('intensity')
                Notifications.cancelAllScheduledNotificationsAsync();
              }}
            >
              <View className="w-full h-full items-center flex-row">
                <View className="w-[90%] h-full justify-center ">
                  <Text className="text-base text-black font-rbase px-2">{'Enable Intensity Map'}</Text>
                </View>
                <View className="w-[10%] h-full justify-center items-end pl-2">
                  <Image 
                    tintColor="#000000"
                    source={icons.nextBtn}
                    className="w-[80%] h-[50%]"
                    resizeMode='contain'
                  />
                </View>
              </View>
              </TouchableHighlight>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  )
}
export default MapScreen;
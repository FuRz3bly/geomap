import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { View, Text, Image, TextInput, Alert, ScrollView, BackHandler, ActivityIndicator, TouchableOpacity, TouchableHighlight, Dimensions, Keyboard, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useRouter, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Success, Failed, Warning, Terms } from '../../../components/modals';
import NetInfo from '@react-native-community/netinfo';

import { collection, setDoc, doc, getDocs, getDoc, updateDoc, GeoPoint, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../firebaseConfig';

import UserContext from '../../../components/UserContext';
import ToolsContext, { containReport } from '../../../components/ToolsContext';
import { images, icons } from '../../../constants';

const filePath = `${FileSystem.cacheDirectory}temp/appData.json`

const report_data = {
  structural_fire: { code: '01', defaultServices: ['firetruck'], handlers: ['fire_station'], firetruckDisabled: false },
  vehicular_fire: { code: '02', defaultServices: ['firetruck'], handlers: ['fire_station'], firetruckDisabled: false },
  fire_rescue: { code: '03', defaultServices: ['firetruck', 'ambulance'], handlers: ['fire_station'], firetruckDisabled: false },
  explosion: { code: '04', defaultServices: ['firetruck'], handlers: ['fire_station'], firetruckDisabled: false },
  wildfire: { code: '05', defaultServices: ['firetruck'], handlers: ['fire_station'], firetruckDisabled: false },
  traffic_accident: { code: '11', defaultServices: ['ambulance'], handlers: ['police'], firetruckDisabled: false },
  robbery: { code: '12', defaultServices: [], handlers: ['barangay', 'police'], firetruckDisabled: true },
  assault: { code: '13', defaultServices: ['ambulance'], handlers: ['police'], firetruckDisabled: true },
  active_shooting: { code: '14', defaultServices: ['ambulance'], handlers: ['police'], firetruckDisabled: true },
  missing_person: { code: '15', defaultServices: [], handlers: ['police', 'disaster'], firetruckDisabled: true },
  disaster_accident: { code: '21', defaultServices: ['ambulance'], handlers: ['disaster'], firetruckDisabled: false },
  search_and_rescue: { code: '22', defaultServices: [], handlers: ['disaster', 'fire_station'], firetruckDisabled: false },
  industrial_accident: { code: '23', defaultServices: ['ambulance'], handlers: ['disaster'], firetruckDisabled: true },
  personal_safety: { code: '31', defaultServices: [], handlers: ['barangay', 'police'], firetruckDisabled: true },
  theft: { code: '32', defaultServices: [], handlers: ['barangay', 'police'], firetruckDisabled: true },
  public_disturbance: { code: '33', defaultServices: [], handlers: ['barangay', 'police'], firetruckDisabled: false },
  domestic_violence: { code: '34', defaultServices: ['ambulance'], handlers: ['barangay', 'police'], firetruckDisabled: true },
  noise: { code: '35', defaultServices: [], handlers: ['barangay', 'police'], firetruckDisabled: true },
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ReportScreen = ({ changePage, backPage, savings, loadings, fails, status, hideMenu, fireBuilding, quickAction }) => {
  // Global Variables
  const { user } = useContext(UserContext); // Current User Data
  const { dictionary } = useContext(ToolsContext); // Global Variables for Tools & Dictionary Translator
  const { width } = Dimensions.get('screen'); // Width of screens for Changes
  const [loading, setLoading] = useState(false); // Loading Variable
  const [Aloading, setALoading] = useState(false); // Delete All Loading Variable
  // Modal Variables
  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const [isFailedVisible, setFailedVisible] = useState(false);
  const [isWarningVisible, setWarningVisible] = useState(false);
  const [isTermsVisible, setTermsVisible] = useState(false);
  const [successForm, setSuccessForm] = useState({ title: 'Login Success!', description: '' });
  const [failedForm, setFailedForm] = useState({ title: 'Login Failed!', description: '' });
  const [warningForm, setWarningForm] = useState({ title: 'Warning!', description: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const router = useRouter();

  // Report Form (Default)
  const default_report_form = {
    report_status: 'waiting',
    report_date: new Date(),
    incident_date: '',
    report_address: '',
    report_location: {
      latitude: 0,
      longitude: 0
    },
    report_type: '',
    handler: '',
    coms: '',
    injured: '',
    services: [],
    report_photos: [],
    description: '',
    flag: false
  };
  // Permissions Containers
  const [permission, requestPermission] = useCameraPermissions();
  // Report Details Containers
  const [report_form, set_report_form] = useState(default_report_form); // Report Form Container
  const [locationError, setLocationError] = useState(null); // Location Error Container
  // Report Dropdown Containers
  const [isEmergencyTypeVisible, setEmergencyTypeVisible] = useState(false); // Primary Emergency Type Logic
  const [currentType, setCurrentType] = useState(''); // Emergency Type Container
  /// Preferred Communication Components
  const [isPreferComsVisible, setPreferComsVisible] = useState(false); // Primary Preferred Communication Dropdown Logic
  const [selectedPreferComsOption, setSelectedPreferComsOption] = useState('personal'); // Preferred Communication Options Container
  // Time Dropdown Components
  const [isTimeVisible, setTimeVisible] = useState(false); // Primary Time Dropdown Logic
  const [selectedTimeOption, setSelectedTimeOption] = useState('current'); // Time Options Container
  const [currentTime, setCurrentTime] = useState(new Date()); // Current Time Container
  // Format Time from 3:31:20 AM to 23:23:54
  const options = {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'};
  const timeString = currentTime.toLocaleTimeString('en-US', options); // Counting Down Time Display
  // Address Dropdown Containers
  const [isAddressVisible, setAddressVisible] = useState(false); // Primary Address Logic
  const [selectedAddressOption, setSelectedAddressOption] = useState('current'); // Address Options Container
  const [currentAddress, setCurrentAddress] = useState('Unable to Locate'); // Current Address Container
  // Services Needed Dropdown Containers
  const [isServiceVisible, setServiceVisible] = useState(false); // Primary Service Dropdown Logic
  const [selectedServices, setSelectedServices] = useState([]); // Selected Services Container
  // Handler Dropdown Components
  const [isHandlerVisible, setHandlerVisible] = useState(false); // Primary Handler Dropdown Logic
  const [handlerOptions, setHandlerOptions] = useState([]); // Handler Options Container
  const [handlerSelection, setHandlerSelection] = useState(null); // Selected Handler Index Container
  const [selectedHandler, setSelectedHandler] = useState('') // Selected Handler Container
  /// Injured Components
  const [isInjuredVisible, setInjuredVisible] = useState(false); // Primary Injured Dropdown Logic
  const [isInjured, setInjured] = useState('no'); // Is Injured Container
  // Camera Tools and Containers
  const [photos, setPhotos] = useState([]); // Photos Containers
  const [facing, setFacing] = useState('back'); // Set Camera Facing Option
  const cameraRef = useRef(null); // Camera Reference
  const [cameraFullScreen, setCameraFullScreen] = useState(false); // Camera Fullscreen Checker
  const [isTorched, setTorched] = useState(false); // Enable Flashlight
  // Report Description Containers
  const [form, setForm] = useState({ description: '' });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // Lock Openers
  const [isLock, setLock] = useState(true); // Is Submit Button Locked?
  const [isDelete, setDelete] = useState(true); // Is Delete Button Locked?
  const [isLoaded, setIsLoaded] = useState(false); // Prevents auto-saving on load
  // Network Components
  const [noNetwork, setNoNetwork] = useState(false); // Storage if No Network
  const [networkLoading, setNetworkLoading] = useState(false); // If Network Checking

  // Function to create a directory and write the file
  const saveData = async (currentData, previousData, filePath) => {
    status('loading');
    loadings('SAVING DATA');
    try {
      // Filter only the changed data fields
      const changedData = {};
      
      Object.keys(currentData).forEach((key) => {
        if (JSON.stringify(currentData[key]) !== JSON.stringify(previousData[key])) {
          changedData[key] = currentData[key];
        }
      });
  
      // Only save if there are changes
      if (Object.keys(changedData).length > 0) {
        const tempDir = `${FileSystem.cacheDirectory}temp`;
        const dirInfo = await FileSystem.getInfoAsync(tempDir);
  
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
        }
  
        // Read the current saved data
        let savedData = previousData;
        if (Object.keys(savedData).length === 0) {
          savedData = {};
        }
  
        // Merge changed data with saved data and write to file
        const newSavedData = { ...savedData, ...changedData };
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(newSavedData));
        console.log('Changed data saved successfully');
        savings('DATA SAVED');
        status('success');
      } else {
        console.log('No changes detected, skipping save');
      }
    } catch (error) {
      fails('SAVING ERROR')
      console.error('Failed to save changed data:', error);
    }
  };

  // Function to load data from file with enhanced logging
  const loadData = async () => {
    try {
      status('loading');
      loadings('LOADING DATA');
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        //console.log('No data file found, using defaults');
        status('success');
        savings('DEFAULT SAVE');
        return;
      }

      // Read data from the file
      const data = await FileSystem.readAsStringAsync(filePath);
      const parsedData = JSON.parse(data);

      //console.log('Data loaded from file:', parsedData);

      // Update state from loaded data
      if (parsedData.report_form !== undefined) set_report_form(parsedData.report_form);
      if (parsedData.isEmergencyTypeVisible !== undefined) setEmergencyTypeVisible(parsedData.isEmergencyTypeVisible);
      if (parsedData.currentType !== undefined) setCurrentType(parsedData.currentType); handleEType(parsedData.currentType);
      if (parsedData.isPreferComsVisible !== undefined) setPreferComsVisible(parsedData.isPreferComsVisible);
      if (parsedData.selectedPreferComsOption !== undefined) setSelectedPreferComsOption(parsedData.selectedPreferComsOption);
      if (parsedData.isTimeVisible !== undefined) setTimeVisible(parsedData.isTimeVisible);
      if (parsedData.selectedTimeOption !== undefined) setSelectedTimeOption(parsedData.selectedTimeOption);
      if (parsedData.isAddressVisible !== undefined) setAddressVisible(parsedData.isAddressVisible);
      if (parsedData.selectedAddressOption !== undefined) setSelectedAddressOption(parsedData.selectedAddressOption);
      if (parsedData.currentAddress !== undefined) setCurrentAddress(parsedData.currentAddress);
      if (parsedData.isServiceVisible !== undefined) setServiceVisible(parsedData.isServiceVisible);
      if (parsedData.selectedServices !== undefined) setSelectedServices(parsedData.selectedServices);
      if (parsedData.isHandlerVisible !== undefined) setHandlerVisible(parsedData.isHandlerVisible);
      if (parsedData.handlerOptions !== undefined) setHandlerOptions(parsedData.handlerOptions);
      if (parsedData.handlerSelection !== undefined) setHandlerSelection(parsedData.handlerSelection);
      if (parsedData.selectedHandler !== undefined) setSelectedHandler(parsedData.selectedHandler);
      if (parsedData.isInjuredVisible !== undefined) setInjuredVisible(parsedData.isInjuredVisible);
      if (parsedData.isInjured !== undefined) setInjured(parsedData.isInjured);
      if (parsedData.form !== undefined) setForm(parsedData.form);

      setIsLoaded(true); // Indicate data has been loaded
      console.log('Data successfully loaded into state');
      status('success');
      savings('DATA LOADED');
    } catch (error) {
      status('error');
      fails('LOADING ERROR')
      console.error('Failed to load data:', error);
    }
  };

  // Using useFocusEffect to load data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (!isLoaded) {
        loadData();
      }
    }, [isLoaded])
  );

  // Back Button Handler with enhanced logging for saving data
  useEffect(() => {
    const backAction = async () => {
      try {
        // Load previous data to compare
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        let previousData = {};
        
        if (fileInfo.exists) {
          const savedData = await FileSystem.readAsStringAsync(filePath);
          previousData = JSON.parse(savedData);
        }

        const currentData = {
          report_form,
          isEmergencyTypeVisible,
          currentType,
          isPreferComsVisible,
          selectedPreferComsOption,
          isTimeVisible,
          selectedTimeOption,
          currentTime,
          isAddressVisible,
          selectedAddressOption,
          currentAddress,
          isServiceVisible,
          selectedServices,
          isHandlerVisible,
          handlerOptions,
          handlerSelection,
          selectedHandler,
          isInjuredVisible,
          isInjured,
          form,
        };

        // Save only the changed data
        await saveData(currentData, previousData, filePath);

        // Handle camera fullscreen exit
        if (cameraFullScreen === true) {
          console.log('Exiting fullscreen mode...');
          setCameraFullScreen(false);
          return true; // Prevent default back action
        } else {
          if (photos.length > 0) {
            setWarningForm({ title: 'Photo Warning!', description: 'Photo that you taken may not\nbe saved. Are you sure?' })
            setWarningVisible(true);
          } else {
            backPage();
            //changePage('home/homes');
          }
          return true; // Prevent default back action
        }
      } catch (error) {
        console.error('Failed to save data before exit', error);
        return false; // Allow the default back action if saving fails
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [
    cameraFullScreen, 
    report_form, 
    isEmergencyTypeVisible, 
    currentType, 
    isPreferComsVisible, 
    selectedPreferComsOption, 
    isTimeVisible, 
    selectedTimeOption, 
    currentTime, 
    isAddressVisible, 
    selectedAddressOption, 
    currentAddress, 
    isServiceVisible, 
    selectedServices, 
    isHandlerVisible, 
    handlerOptions, 
    handlerSelection, 
    selectedHandler, 
    isInjuredVisible, 
    isInjured, 
    form
  ]); // Add isLoaded dependency to ensure saveData works correctly

  // Translator of Values
  const translate = (key) => {
    return dictionary[key] || key;
  };

  const iconT = (handler) => {
    switch (handler) {
      case 'fire_station':
        return icons.fire_station;
      case 'police':
        return icons.police;
      case 'disaster':
        return icons.disaster;
      case 'barangay':
        return icons.barangay;
      default:
        return icons.municipalHall;
    }
  };

  // Detect If Internet is Slow
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected;
      const isSlow = state.details?.downlink && state.details.downlink < 0.5; // 0.5 Mbps as a slow threshold

      if (!isConnected || isSlow) {
        setNoNetwork(true);
      } else {
        setNoNetwork(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Time Countdown
  useEffect(() => {
    const intervalId = setInterval(() => {
    setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Request Location Permission and get Location/Address
  useEffect(() => {
    const getLocation = async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFailedForm({ title: 'Permission Denied!', description: 'Unable to access and locate user.' })
        setFailedVisible(true);
        setLocationError('Permission to access location was denied');
        return;
      }

      try {
        // Get current location
        let location = await Location.getCurrentPositionAsync({});
        // Reverse geocode to get address
        let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // If address is retrieved
        if (address.length > 0) {
          const addressComponents = [
            address[0].street,
            address[0].city,
            address[0].subregion || address[0].region,
            address[0].isoCountryCode
          ];

          // Filter non-empty components and format address
          const filteredAddressComponents = addressComponents.filter(component => component);
          const formattedAddress = filteredAddressComponents.join(', ');

          // Update state with the formatted address and location
          setCurrentAddress(formattedAddress);
          set_report_form((prevDetails) => ({
            ...prevDetails,
            report_location: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            },
          }));
        } else {
          setLocationError('Unable to retrieve address');
        }
      } catch (error) {
        setLocationError(error.message);
      }
    };

    getLocation();
  }, []);

  // Request Camera Permission
  useEffect(() => {
    (async () => {
      if (!permission || permission.status !== 'granted') {
        const { status } = await requestPermission();
        if (status !== 'granted') {
          setFailedForm({ title: 'Permission Denied!', description: 'Unable to access camera and capture evidence.' })
          setFailedVisible(true);
        }
      }
    })();
  }, [permission]);

  // Find the Address based on Latitude and Longitude
  const reverseGeocode = async (latitude, longitude) => {
    try {
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addressComponents = [
          address[0].street,
          address[0].city,
          address[0].subregion || address[0].region,
          address[0].isoCountryCode,
        ];
        return addressComponents.filter((comp) => comp).join(', ');
      }
      throw new Error('Unable to retrieve address');
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  };  

  // Submit Button Lock Logic
  useEffect(() => {
    if (currentType && selectedHandler && photos.length > 0) {
      setLock(false);
    }
  }, [currentType, selectedHandler, photos])

  // Delete Button Lock Logic
  useEffect(() => {
    if (currentType || selectedHandler || photos.length > 0 || form.description) {
      setDelete(false);
    }
  }, [currentType, selectedHandler, photos, form.description])

  // Keyboard Listener
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Quick Action Report Building on Fire
  useEffect(() => {
    if (fireBuilding === true) {
      handleEType('structural_fire');
      quickAction(false);
      handleInputChange('description', `May sunog po sa (address please).`);
    }
  }, [fireBuilding]);

  // Toggle Emergency Type (with animations)
  const toggleEmergencyType = () => {
    LayoutAnimation.configureNext({
      duration: 400,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setEmergencyTypeVisible(!isEmergencyTypeVisible)
  };

  // Toggle Handler (with animations)
  const toggleHandler = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setHandlerVisible(!isHandlerVisible)
  };

  // Toggle Preferred Communitcation (with animations)
  const toggleContactMethod = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setPreferComsVisible(!isPreferComsVisible)
  };

  // Toggle Time Options (with animation)
  const toggleTime = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setTimeVisible(!isTimeVisible)
  };

  // Toggle Address Options (with animation)
  const toggleAddress = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setAddressVisible(!isAddressVisible)
  };

  // Toggle Service Options (with animation)
  const toggleService = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setServiceVisible(!isServiceVisible)
  };

  // Toggle Injured Options (with animation)
  const toggleInjured = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setInjuredVisible(!isInjuredVisible)
  };

  // Toggle Camera Full Screen Function
  const toggleFullScreen = () => {
    setCameraFullScreen(!cameraFullScreen);
    hideMenu(true);
  };

  // Toggle Camera Facing Function
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Toggle Flashlight Function
  const toggleTorch = () => {
    setTorched(!isTorched);
  }

  // Take Picture Function
  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync();
      const location = await Location.getCurrentPositionAsync({});
      const photoData = {
        uri: photo.uri,
        timestamp: new Date(),
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      };

      setPhotos([photoData]); // If needed to store every photo use this => setPhotos([...photos, photoData]);
      setCameraFullScreen(!cameraFullScreen);
      setLoading(false);
      hideMenu(false);
    }
  };

  // Emergency Type Button Function
  const handleEType = (type) => {
    toggleEmergencyType()
    // Check if the type exists in report_data
    const reportTypeData = report_data[type];

    if (!reportTypeData) {
      console.log(`Unknown type: ${type}, using defaults`);
      // Use some default values or handle the error
      setSelectedServices([]);
      setHandlerOptions([]);
      setHandlerSelection(null);
      setHandlerVisible(false);
      setInjured('no');
      setServiceVisible(false);
      setInjuredVisible(false);
      return;
    }
    setCurrentType(type);
    setSelectedHandler('');

    const defaultServices = report_data[type].defaultServices || [];
    setSelectedServices(defaultServices);
    if (defaultServices.includes('ambulance')) {
      setInjured('yes');
      setServiceVisible(true);
      setInjuredVisible(true);
    } else {
      setInjured('no');
    }

    const handlers = report_data[type].handlers || [];
    setHandlerOptions(handlers);
    setHandlerSelection(null);
    setHandlerVisible(true);

    if (handlers.length === 1) {
      setSelectedHandler(handlers[0]);
      setHandlerVisible(false);
    }
  };

  // Select Handler Button Function
  const handleHandlerSelection = (handler) => {
    setSelectedHandler(handler);
    setHandlerSelection(handlerOptions.indexOf(handler));
    setPreferComsVisible(true);
  };

  // Services Button Function
  const handleServiceChange = (service) => {
    setSelectedServices((prevServices) => {
      let updatedServices;

      if (prevServices.includes(service)) {
        updatedServices = prevServices.filter((s) => s !== service); // Remove service if already selected
      } else {
        updatedServices = [...prevServices, service]; // Add service if not already selected
      }

      // Check if 'ambulance' is in the updated services and set the injured state accordingly
      if (service === 'ambulance') {
        setInjured(updatedServices.includes('ambulance') ? 'yes' : 'no');
      }

      return updatedServices;
    });
  };

  // Injured Button Function
  const handleInjured = (key) => {
    setInjured(key);
  
    setSelectedServices((prevServices) => {
      let updatedServices = [...prevServices];
  
      if (key === 'yes' && !prevServices.includes('ambulance')) {
        updatedServices.push('ambulance'); // Add 'ambulance' if not already selected
      } else if (key === 'no' && prevServices.includes('ambulance')) {
        updatedServices = prevServices.filter((s) => s !== 'ambulance'); // Remove 'ambulance' if selected
      }
  
      return updatedServices;
    });
  };

  // Report Description Function
  const handleInputChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // Generate Report Id Translator
  const generateReportId = async (type, handlerIndex) => {
    const typeCode = report_data[type].code || '00';
    const handlerCode = handlerIndex !== null ? handlerIndex.toString() : '0';
    const reportsSnapshot = await getDocs(collection(db, 'reports'));
    const reportCount = reportsSnapshot.size;
    return `0${typeCode}-${handlerCode}00-${String(reportCount + 1).padStart(3, '0')}`;
  };

  // Accept the Terms and Condition
  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setTermsVisible(false);
    handleSubmit(); // Proceed with submission
  };

  // Submit Button Function
  const handleSubmit = async () => {
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    // Check network connectivity and speed
    const netInfo = await NetInfo.fetch();
    const isSlow = netInfo.details?.downlink && netInfo.details.downlink < 0.5; // 0.5 Mbps as slow threshold

    if (!netInfo.isConnected || isSlow) {
      setNoNetwork(true);
      console.error("Network unavailable or too slow to proceed.");
      return;
    }

    setNoNetwork(false); // Reset if network is fine

    /* if (!termsAccepted) {
      setTermsVisible(true); // Show terms modal if not accepted
      return;
    } */

    setLoading(true);
    const storage = getStorage();
    const reportId = await generateReportId(currentType, handlerSelection);
  
    try {
      if (currentAddress === 'Unable to Locate') {
        console.log("Fetching address using report_location...");
        const address = await reverseGeocode(
          photos[0].location.latitude,
          photos[0].location.longitude
        );
        if (address) {
          setCurrentAddress(address); // Update the state
        }
      }

      const photoUploadPromises = photos.map(async (photo, index) => {
        const photoRef = ref(storage, `reports/${reportId}/photo_${index + 1}.jpg`);

        const response = await fetch(photo.uri);
        const blob = await response.blob();  

        await uploadBytes(photoRef, blob);
        const downloadURL = await getDownloadURL(photoRef);
        
        // Debug: Check if the download URL was obtained successfully
        console.log("Download URL for photo", index + 1, ":", downloadURL);
        
        return {
          uri: downloadURL,
          timestamp: photo.timestamp,
          location: photo.location,
        };
      });
  
      const uploadedPhotos = await Promise.all(photoUploadPromises);
      const incidentDate = Timestamp.fromDate(
        new Date(Math.min(...photos.map((photo) => new Date(photo.timestamp).getTime())))
      );
  
      const reportLocation = new GeoPoint(
        photos[0].location.latitude,
        photos[0].location.longitude
      );
  
      const newReport = {
        report_id: reportId,
        ...report_form,
        report_date: incidentDate,
        report_address: currentAddress,
        incident_date: (() => {
          const currentDate = new Date();
          switch (selectedTimeOption) {
            case 'current':
              return Timestamp.fromDate(currentDate); // Convert to Firestore Timestamp
            case 'lessHour':
              return Timestamp.fromDate(new Date(currentDate.getTime() - 15 * 60 * 1000)); // Less than an hour ago
            case 'quarterHour':
              return Timestamp.fromDate(new Date(currentDate.getTime() - 15 * 60 * 1000)); // Less than 15 minutes ago
            case 'halfHour':
              return Timestamp.fromDate(new Date(currentDate.getTime() - 30 * 60 * 1000)); // Within 30 minutes
            case 'moreHalfHour':
              return Timestamp.fromDate(new Date(currentDate.getTime() - 45 * 60 * 1000)); // More than 30 minutes
            default:
              return Timestamp.fromDate(currentDate); // Current date/time
          }
        })(),
        report_type: currentType,
        report_location: reportLocation,
        services: selectedServices,
        coms: selectedPreferComsOption,
        injured: isInjured,
        handler: selectedHandler,
        flag: null,
        ping: 0,
        report_photos: uploadedPhotos,
        description: form.description,
        user_report: {
          address: user.address,
          birthdate: user.birthdate,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          photo_id: user.photo_id,
          user_id: user.user_id,
          uid: user.uid,
          username: user.username
        }
      };
  
      await setDoc(doc(db, 'reports', reportId), newReport);
      console.log("Document written with ID: ", reportId);

      const userRef = doc(db, 'users', user.uid); // Reference to the user's document
      const userSnap = await getDoc(userRef); // Get the user's document

      if (userSnap.exists()) {
        const currentReportsCount = userSnap.data().reports || 0; // Get the current report count, default to 0 if not set
        await updateDoc(userRef, { reports: currentReportsCount + 1 }); // Increment the reports field by 1
        console.log("Updated user's report count to:", currentReportsCount + 1);
      }

      setLoading(false);
      set_report_form(default_report_form);
      setHandlerSelection(null);
      setHandlerOptions([]);
      setSelectedServices([]);
      setPhotos([]);
      containReport(newReport);
      changePage('home/maps');
    } catch (e) {
      console.error("Error adding document: ", e);
      setFailedForm({ title: 'Report Error!', description: 'Failed to submit report.' })
      setFailedVisible(true);
    }
  };

  // Delete Button Function
  const handleDelete = async () => {
    setLoading(true); // Set loading state
    set_report_form(default_report_form); // Reset report form
    try {
      const location = await Location.getCurrentPositionAsync({});// Fetch current location
      // Set the location to the report
      set_report_form((prevForm) => ({
        ...prevForm,
        report_location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      }));
    } catch (error) {
      console.error('Error getting location:', error);
    }
    setCurrentType(''); // Reset Current Type
    setSelectedPreferComsOption('personal');
    setSelectedTimeOption('current');
    setSelectedAddressOption('current');
    setHandlerOptions([]);
    setHandlerSelection(null);
    setSelectedHandler('');
    setSelectedServices([]);
    setInjured('no');
    setForm({ description: '' });
    setPhotos([]);
    setLock(true);
    setDelete(true);
    setLoading(false);
  };

  // Emergency Type Button Template
  const EmergencyButton = ({ emergency_type, icon, top_text, bottom_text}) => {
    return (
        <TouchableHighlight underlayColor={"#d9ffe6"} className="w-28 h-28 rounded-xl" onPress={() => handleEType(emergency_type)}>
            <View className={`items-center justify-center`}>
              <Image 
                tintColor={currentType === emergency_type ? '#57b378' : '#9c9c9c'}
                source={icon}
                className="w-16 h-16"
                resizeMode='contain'
              />
              <Text className={`pt-2 font-rbase text-sm text-center ${currentType === emergency_type ? "text-primary" : (currentType === '' ? 'text-black' : 'text-white-200')}`}>
                  {top_text}{'\n'}{bottom_text}
              </Text>
            </View>
        </TouchableHighlight>
    )
  };
  
  // Handler Button Template
  const HandlerButton = ({ handler, icon, text }) => {
    return (
      <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl mx-4 px-4 py-4" onPress={() => handleHandlerSelection(handler)}>
        <View className="items-center justify-center">
          <Image 
            tintColor={selectedHandler === handler ? '#57b378' : (selectedHandler === '' ? '#9c9c9c' : '#9c9c9c')}
            source={icon}
            className="w-16 h-16"
            resizeMode='contain'
          />
          <Text className={`pt-2 font-pregular text-sm text-center ${selectedHandler === handler ? "text-primary" : (selectedHandler === '' ? 'text-white-200' : 'text-white-200')}`}>
            {text}
          </Text>
        </View>
      </TouchableHighlight>
    )
  };

  const reconNetwork = async () => {
    try {
      setNetworkLoading(true);
  
      const netInfo = await NetInfo.fetch();
  
      if (netInfo.isConnected && netInfo.isInternetReachable) {
        setNoNetwork(false); // Network is available
        console.log("Reconnected to the internet.");
      } else {
        setNoNetwork(true); // Still no network
        console.warn("Still no network connection.");
  
        // Wait for 5 seconds before setting network loading to false
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error("Error checking network status:", error);
    } finally {
      setNetworkLoading(false); // Always clear the loading state
    }
  };  

  const currentReport = report_data[currentType] || {};
  const isFiretruckDisabled = currentReport.defaultServices?.includes('firetruck') || currentReport?.firetruckDisabled || false;

  const closeSModal = () => {setSuccessVisible(false)};
  const closeFModal = () => {setFailedVisible(false)};
  const closeWModal = () => {setWarningVisible(false)};
  const closeTModal = () => {setTermsVisible(false)};

  if (Aloading) {
    return (
      <SafeAreaView className="w-full h-full items-center justify-center bg-primary">
        <View className="items-center justify-center bg-white p-[5%] rounded-2xl">
          <ActivityIndicator size="100" color="#57b378" />
        </View>
      </SafeAreaView>
    )
  };

  if (noNetwork) {
    return (
        <SafeAreaView className="w-full h-full items-center justify-center bg-primary">
          <View className="w-[70%] h-[60%] items-center justify-center bg-white rounded-2xl">
            <Image 
              tintColor="#ff845c"
              source={icons.noNetwork}
              className="w-20 h-20"
              resizeMode='contain'
            />
            {/* Warning Title */}
            <Text className="text-warn text-2xl font-psemibold py-8" numberOfLines={1} ellipsizeMode='tail'>{'NO NETWORK'}</Text>
            {/* Warning Description */}
            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center pb-8" numberOfLines={3} ellipsizeMode='tail'>
              {'Please reconnect to continue reporting.'}
            </Text>
            {/* Buttons Available */}
            <View className="w-[80%] items-center justify-center">
              {/* Reconnect */}
              <TouchableHighlight className="py-3 px-4 bg-warn-100 rounded-2xl" underlayColor={"#ffc484"} onPress={reconNetwork}>
                {networkLoading ? (<ActivityIndicator size="large" color="#ffffff" />) : (<Text className="text-white text-base font-pregular text-center">{'Reconnect'}</Text>)}
              </TouchableHighlight>
            </View>
          </View>
        </SafeAreaView>
    )
  };

  return (
    <SafeAreaView className="w-full h-[104%] items-center -top-[4%] bg-primary-100 overflow-hidden">
      <Success visible={isSuccessVisible} onClose={closeSModal} title={successForm.title} description={successForm.description} />
      <Failed visible={isFailedVisible} onClose={closeFModal} title={failedForm.title} description={failedForm.description} />
      <Warning visible={isWarningVisible} onProceed={() => changePage('home/homes')} onClose={closeWModal} title={warningForm.title} description={warningForm.description} />
      <Terms visible={isTermsVisible} onClose={closeTModal} onAccept={handleTermsAccept} page={'view2'} tab={'report'} />
      {cameraFullScreen === false ? (
        <>
          <View className="h-full w-full bg-white top-[4%]">
          {/* Title Report */}
          <Text className="font-rbold text-2xl text-black pt-[5%] pb-[3%] left-[5%]">Report Document</Text>
          <Text className=" font-rbase text-base text-black left-[5%]">Please fillout all required fields.</Text>
          {/* Page Indicators */}
          <View className="w-full h-10 bg-white items-center justify-center flex-row px-[5%]">
            <View className="w-1/3 h-full justify-center">
              <View className="w-4 h-4 bg-primary rounded-full items-center justify-center z-10">
                <View className={`w-2 h-2 ${currentType && selectedHandler ? "bg-white" : "bg-primary"} rounded-full`}/>
              </View>
            </View>
            <View className="w-1/3 h-full items-center justify-center z-10">
              <View className="w-4 h-4 bg-primary rounded-full items-center justify-center">
                <View className={`w-2 h-2 ${photos.length > 0 ? "bg-white" : "bg-primary"} rounded-full`} />
              </View>
            </View>
            <View className="w-1/3 h-full justify-center z-10">
              <View className="w-4 h-4 bg-primary rounded-full items-center justify-center absolute right-0">
                <View className={`w-2 h-2 ${form.description ? "bg-white" : "bg-primary"} rounded-full`} />
              </View>
            </View>
            <View className="w-[92%] h-1 absolute bg-primary" />
          </View>
          <ScrollView className="w-full h-full" showsVerticalScrollIndicator={false}>
            <View className="mx-5">
              {/* Type of Emergency Dropdown Button */}
              <View className="py-1">
                {!isEmergencyTypeVisible ? (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleEmergencyType}>
                      <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                        <Text className={`${currentType ? "font-rmedium text-base" : "font-rbase text-base"} text-black`}>{currentType ? translate(currentType) : 'Type of Emergency'}
                          {currentType ? (<></>) : (<Text className="text-red-600">{"*"}</Text>)}
                        </Text>
                        <View className="absolute right-[5%] items-center justify-center">
                          <Image 
                            tintColor='#57b378'
                            source={currentType ? icons.check : (!isEmergencyTypeVisible ? icons.arrowD : icons.arrowU)}
                            className="w-3 h-3"
                            resizeMode='contain'
                          />
                        </View>
                      </View>
                    </TouchableHighlight>
                    <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                  </>
                ) : (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleEmergencyType}>
                      <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                        <Text className="font-rbase text-base text-black">WHAT was the Emergency?</Text>
                        <View className="absolute right-[5%] items-center justify-center">
                            <Image 
                                tintColor='#57b378'
                                source={currentType ? icons.check : (!isEmergencyTypeVisible ? icons.arrowD : icons.arrowU)}
                                className="w-3 h-3"
                                resizeMode='contain'
                            />
                        </View>
                      </View>
                    </TouchableHighlight>
                    <View className="border-b-2 border-x-2 border-primary rounded-b-xl overflow-hidden">
                      <View className="w-full items-center justify-center py-4">
                        {/*-Row 1-*/}
                        <View className="w-full items-center justify-between flex-row mb-2">
                          {/*-Personal-Safety-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'personal_safety'} icon={icons.personalSafety} top_text={'Personal'} bottom_text={'Safety'}/>
                          </View>
                          {/*-Structural-Fire-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'structural_fire'} icon={icons.structuralFire} top_text={'Structural'} bottom_text={'Fire'}/>
                          </View>
                          {/*-Traffic-Accident-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'traffic_accident'} icon={icons.traffic} top_text={'Traffic'} bottom_text={'Accident'}/>
                          </View>
                        </View>
                        {/*-Row-2-*/}
                        <View className="w-full items-center justify-between flex-row mb-2">
                          {/*-Theft-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'theft'} icon={icons.theft} top_text={'Theft'}/>
                          </View>
                          {/*-Public-Disturbance-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'public_disturbance'} icon={icons.publicDisturbance} top_text={'Public'} bottom_text={'Disturbance'}/>
                          </View>
                          {/*-Rescue-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'fire_rescue'} icon={icons.rescue} top_text={'Rescue'}/>
                          </View>
                        </View>
                        {/*-Row-3-*/}
                        <View className="w-full items-center justify-between flex-row mb-2">
                          {/*-Vehicular-Fire-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'vehicular_fire'} icon={icons.vehicularFire} top_text={'Vehicular'} bottom_text={'Fire'}/>
                          </View>
                          {/*-Wildfire-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'wildfire'} icon={icons.wildfire} top_text={'Wildfire'}/>
                          </View>
                          {/*-Explosion-Incident-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'explosion'} icon={icons.explosion} top_text={'Explosion'} bottom_text={'Incident'}/>
                          </View>
                        </View>
                        {/*-Row-4-*/}
                        <View className="w-full items-center justify-between flex-row mb-2">
                          {/*-Active-Shooting-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'active_shooting'} icon={icons.murder} top_text={'Active'} bottom_text={'Shooting'}/>
                          </View>
                          {/*-Assault-&-Battery-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'assault'} icon={icons.assault} top_text={'Assault'}/>
                          </View>
                          {/*-Domestic-Violence-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'domestic_violence'} icon={icons.abuse} top_text={'Domestic'} bottom_text={'Violence'}/>
                          </View>
                        </View>
                        {/*-Row-5-*/}
                        <View className="w-full items-center justify-between flex-row mb-2">
                          {/*-Missing-Person-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'missing_person'} icon={icons.missingPerson} top_text={'Missing'} bottom_text={'Person'}/>
                          </View>
                          {/*-Alarming-Noise-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'noise'} icon={icons.noise} top_text={'Alarming'} bottom_text={'Noise'}/>
                          </View>
                          {/*-Robbery-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'robbery'} icon={icons.burglary} top_text={'Robbery'}/>
                          </View>
                        </View>
                        {/*-Row-6-*/}
                        <View className="w-full items-center justify-between flex-row">
                          {/*-Search-&-Rescue-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'search_and_rescue'} icon={icons.searchRescue} top_text={'Search &'} bottom_text={'Rescue'}/>
                          </View>
                          {/*-Industrial-Accident-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'industrial_accident'} icon={icons.industrialAccident} top_text={'Industrial'} bottom_text={'Accident'}/>
                          </View>
                          {/*-Disaster-Accident-*/}
                          <View className="w-1/3 items-center">
                            <EmergencyButton emergency_type={'disaster_accident'} icon={icons.disaster_accident} top_text={'Disaster'} bottom_text={'Accident'}/>
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
              {/* Handler Selector Dropdown Button */}
              {handlerOptions.length > 1 ? (
                <>
                  <View className="py-1">
                    {!isHandlerVisible ? (
                      <>
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" activeOpacity={0.6} onPress={toggleHandler}>
                          <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                              <Text className={`${selectedHandler ? "font-rmedium text-base" : "font-rbase text-base"} text-black`}>{selectedHandler ? translate(selectedHandler) : 'Select Handler'}</Text>
                              <View className="absolute right-[5%] items-center justify-center">
                                  <Image 
                                      tintColor='#57b378'
                                      source={selectedHandler ? icons.check : (!isHandlerVisible ? icons.arrowD : icons.arrowU)}
                                      className="w-3 h-3"
                                      resizeMode='contain'
                                  />
                              </View>
                          </View>
                        </TouchableHighlight>
                        <View className="h-0 border-b-2 border-x-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                      </>
                    ) : (
                      <>
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" activeOpacity={0.6} onPress={toggleHandler}>
                          <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                              <Text className="font-rbase text-base text-black">WHO will handle your emergency?
                              {selectedHandler ? (<></>) : (<Text className="text-red-600">{"*"}</Text>)}
                              </Text>
                              <View className="absolute right-[5%] items-center justify-center">
                                  <Image 
                                      tintColor='#57b378'
                                      source={selectedHandler ? icons.check : (!isHandlerVisible ? icons.arrowD : icons.arrowU)}
                                      className="w-3 h-3"
                                      resizeMode='contain'
                                  />
                              </View>
                          </View>
                        </TouchableHighlight>
                        <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                          <View className="flex-row justify-center items-center">
                            {handlerOptions.map((handler) => (
                              <HandlerButton
                                key={handler}
                                handler={handler}
                                icon={iconT(handler)}
                                text={translate(handler)}
                              />
                            ))}
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                </>
              ) : (
                <></>
              )}
              {/* Preffered Communication Dropdown Button */}
              <View className="py-1">
                {!isPreferComsVisible ? (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleContactMethod}>
                      <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                          <Text className="font-rbase text-base text-black">Preferred Communication</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isPreferComsVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="h-0 border-b-2 border-x-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                  </>
                ) : (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleContactMethod}>
                      <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                          <Text className="font-rbase text-base text-black">HOW do you want to be Contacted?</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isPreferComsVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                      <View className="pt-1">
                        {/*-Personal-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedPreferComsOption('personal')}>
                          <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                  {selectedPreferComsOption === 'personal' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                              <Text className={`left-[80%] font-rbase text-base ${selectedPreferComsOption === 'personal' ? "text-primary" : 'text-black'}`}>{"Personal (Meet in location)"}</Text>
                          </View>
                        </TouchableHighlight>
                        {/*-Text-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedPreferComsOption('text')}>
                          <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                {selectedPreferComsOption === 'text' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                              <Text className={`left-[80%] font-rbase text-base ${selectedPreferComsOption === 'text' ? "text-primary" : 'text-black'}`}>{`Text (${user?.phone_number})`}</Text>
                          </View>
                        </TouchableHighlight>
                        {/*-Call-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedPreferComsOption('call')}>
                          <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                {selectedPreferComsOption === 'call' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                              <Text className={`left-[80%] font-rbase text-base ${selectedPreferComsOption === 'call' ? "text-primary" : 'text-black'}`}>{`Call (${user?.phone_number})`}</Text>
                          </View>
                        </TouchableHighlight>
                        {/*-Email-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedPreferComsOption('email')}>
                          <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                {selectedPreferComsOption === 'email' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                              <Text className={`left-[80%] font-rbase text-base  ${selectedPreferComsOption === 'email' ? "text-primary" : 'text-black'}`} numberOfLines={1} ellipsizeMode="tail">{`Email (${user?.email})`}</Text>
                          </View>
                        </TouchableHighlight>
                      </View>
                    </View>
                  </>
                )}
              </View>
              {/* Time of Emergency Dropdown Button*/}
              <View className="py-1">
                {!isTimeVisible ? (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleTime}>
                      <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                          <Text className="font-rbase text-base text-black">Time of Emergency</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isTimeVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-8 -z-10"/>
                  </>
                ) : (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleTime}>
                      <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                        <Text className="font-rbase text-base text-black">WHEN was the Emergency?</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isTimeVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                      <View className="pt-1">
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedTimeOption('current')}>
                            <View className="flex-row items-center py-2 pl-3">
                                <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                  <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                    {selectedTimeOption === 'current' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                  </View>
                                </View>
                                <Text className={`left-[80%] font-rbase text-base ${selectedTimeOption === 'current' ? "text-primary" : 'text-black'}`}>{`Just Now (${timeString})`}</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedTimeOption('lessHour')}>
                            <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                  {selectedTimeOption !== 'current' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                                <Text className={`left-[80%] font-rbase text-base ${selectedTimeOption !== 'current' ? "text-primary" : 'text-black'}`}>Within the past hour</Text>
                            </View>
                        </TouchableHighlight>
                        {selectedTimeOption !== 'current' && 
                          <View className="left-[11%]">
                            <TouchableOpacity onPress={() => setSelectedTimeOption('quarterHour')}>
                              <View className="flex-row items-center py-2 pl-3">
                                  <View className="w-5 h-5 items-center justify-center bottom-1">
                                  {(selectedTimeOption === 'lessHour' || selectedTimeOption === 'quarterHour') && (
                                      <Image 
                                          tintColor='#57b378'
                                          source={icons.check}
                                          className="w-5 h-5"
                                          resizeMode='contain'
                                      />
                                  )}
                                  </View>
                                  <Text className={`left-[80%] bottom-1 font-rbase text-base ${selectedTimeOption === 'lessHour' || selectedTimeOption === 'quarterHour' ? "text-primary" : 'text-black'}`}>Less than 15 Minutes</Text>
                              </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setSelectedTimeOption('halfHour')}>
                              <View className="flex-row items-center py-2 pl-3">
                                  <View className="w-5 h-5 items-center justify-center bottom-1">
                                  {selectedTimeOption === 'halfHour' && (
                                      <Image 
                                          tintColor='#57b378'
                                          source={icons.check}
                                          className="w-5 h-5"
                                          resizeMode='contain'
                                      />
                                  )}
                                  </View>
                                  <Text className={`left-[80%] bottom-1 font-rbase text-base ${selectedTimeOption === 'halfHour' ? "text-primary" : 'text-black'}`}>Within 30 Minutes</Text>
                              </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setSelectedTimeOption('moreHalfHour')}>
                              <View className="flex-row items-center py-2 pl-3">
                                  <View className="w-5 h-5 items-center justify-center bottom-1">
                                  {selectedTimeOption === 'moreHalfHour' && (
                                      <Image 
                                          tintColor='#57b378'
                                          source={icons.check}
                                          className="w-5 h-5"
                                          resizeMode='contain'
                                      />
                                  )}
                                  </View>
                                  <Text className={`left-[80%] bottom-1 font-rbase text-base ${selectedTimeOption === 'moreHalfHour' ? "text-primary" : 'text-black'}`}>More than 30 Minutes</Text>
                              </View>
                          </TouchableOpacity>
                          </View>
                        }
                      </View>
                    </View>
                  </> 
                )}
              </View>
              {/* Location of Emergency Dropdown Button */}
              {/* <View className="py-1">
                {!isAddressVisible ? (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleAddress}>
                      <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                          <Text className={`font-rbase text-base text-black`}>Address of Emergency</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isAddressVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                  </>
                ) : (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleAddress}>
                      <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                          <Text className="font-rbase text-base text-black">WHERE was the Emergency?</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isAddressVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                      <View className="py-1">
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedAddressOption('current')}>
                            <View className="flex-row items-center py-2 pl-3">
                                <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                  <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                    {selectedAddressOption === 'current' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                  </View>
                                </View>
                                <Text className={`w-[82%] left-[80%] font-rbase text-base ${selectedAddressOption === 'current' ? "text-primary" : 'text-black'}`} numberOfLines={1} ellipsizeMode="tail">{`Current (${currentAddress})`}</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => setSelectedAddressOption('other')}>
                            <View className="flex-row items-center py-2 pl-3">
                                <View className="w-[26px] h-[26px] mr-[6%] bg-primary items-center justify-center rounded-full">
                                  <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                    {selectedAddressOption !== 'current' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                  </View>
                                </View>
                                <Text className={`w-[82%] left-[10%] font-rbase text-base ${selectedAddressOption === 'other' ? "text-primary" : 'text-black'}`} numberOfLines={1} ellipsizeMode="tail">{`Account (${user?.address})`}</Text>
                            </View>
                        </TouchableHighlight>
                      </View>
                    </View>
                  </>
                )}
              </View> */}
              {/* Services Needed Dropdown Button */}
              <View className="py-1">
                {!isServiceVisible ? (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" activeOpacity={0.6} onPress={toggleService}>
                      <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                          <Text className="font-rbase text-base text-black">Services Needed</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isServiceVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                  </TouchableHighlight>
                  <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                </>
                ) : (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleService}>
                      <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                          <Text className="font-rbase text-base text-black">WHAT Services are Needed?</Text>
                          <View className="absolute right-[5%] items-center justify-center">
                              <Image 
                                  tintColor='#57b378'
                                  source={!isServiceVisible ? icons.arrowD : icons.arrowU}
                                  className="w-3 h-3"
                                  resizeMode='contain'
                              />
                          </View>
                      </View>
                    </TouchableHighlight>
                    <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                      <View className="py-4 flex-row gap-8 justify-center items-center">
                        {/*-Ambulance-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => handleServiceChange('ambulance')}>
                          <View className={`items-center justify-center`}>
                            <Image 
                                tintColor={selectedServices.includes('ambulance') ? "#57b378" : "#9c9c9c"}
                                source={icons.ambulance}
                                className="w-28 h-11"
                                resizeMode='contain'
                            />
                            <Text className={`pt-2 font-rbase text-sm text-center ${selectedServices.includes('ambulance') ? "text-primary" : 'text-white-200'}`}>
                                Ambulance
                            </Text>
                          </View>
                        </TouchableHighlight>
                        {/*-Firetruck-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" disabled={isFiretruckDisabled} onPress={() => handleServiceChange('firetruck')}>
                          <View className={`items-center justify-center`}>
                              <Image
                                  tintColor={selectedServices.includes('firetruck') ? (isFiretruckDisabled ? "#89cca1" : "#57b378") : (isFiretruckDisabled ? "#c9c9c9" : "#9c9c9c")}
                                  source={icons.fireTruck}
                                  className="w-28 h-11"
                                  resizeMode='contain'
                              />
                              <Text className={`pt-2 font-rbase text-sm text-center ${selectedServices.includes('firetruck') ? (isFiretruckDisabled ? 'text-[#89cca1]' : "text-primary") : (isFiretruckDisabled ? 'text-[#c9c9c9]' : 'text-white-200')}`}>
                                  Fire Truck
                              </Text>
                          </View>
                        </TouchableHighlight>
                      </View>
                    </View>
                  </>
                )}
              </View>
              {/* Injuries Dropdown Button */}
              <View className="py-1">
                {!isInjuredVisible ? (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleInjured}>
                      <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                        <Text className="font-rbase text-base text-black">Injuries</Text>
                        <View className="absolute right-[5%] items-center justify-center">
                            <Image 
                                tintColor='#57b378'
                                source={!isInjuredVisible ? icons.arrowD : icons.arrowU}
                                className="w-3 h-3"
                                resizeMode='contain'
                            />
                        </View>
                      </View>
                    </TouchableHighlight>
                    <View className="h-0 border-b-2 border-2 border-primary overflow-hidden rounded-b-xl -top-7 -z-10"/>
                  </>
                ) : (
                  <>
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl bg-white z-10" onPress={toggleInjured}>
                      <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                        <Text className="font-rbase text-base text-black">WAS anyone Injured?</Text>
                        <View className="absolute right-[5%] items-center justify-center">
                            <Image 
                                tintColor='#57b378'
                                source={!isInjuredVisible ? icons.arrowD : icons.arrowU}
                                className="w-3 h-3"
                                resizeMode='contain'
                            />
                        </View>
                      </View>
                    </TouchableHighlight>
                    <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                      <View className="py-1">
                        {/*-Yes-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => handleInjured('yes')}>
                          <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                  {isInjured === 'yes' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                              <Text className={`left-[80%] font-rbase text-base ${isInjured === 'yes' ? 'text-primary' : 'text-black'}`}>Yes</Text>
                          </View>
                        </TouchableHighlight>
                        {/*-No-*/}
                        <TouchableHighlight underlayColor={"#d9ffe6"} className="rounded-xl" onPress={() => handleInjured('no')}>
                          <View className="flex-row items-center py-2 pl-3">
                              <View className="w-[26px] h-[26px] bg-primary items-center justify-center rounded-full">
                                <View className="w-[86%] h-[86%] bg-white items-center justify-center rounded-full">
                                  {isInjured === 'no' && <View className="w-[56%] h-[56%] bg-primary items-center justify-center rounded-full"/>}
                                </View>
                              </View>
                              <Text className={`left-[80%] font-rbase text-base ${isInjured === 'no' ? 'text-primary' : 'text-black'}`}>No</Text>
                          </View>
                        </TouchableHighlight>
                      </View>
                    </View>
                  </>
                )}
              </View>
              <View className="py-3"/>
              {/* Snapshot Report */}
              <View className="w-[120%] h-[0.3%] -left-5 bg-primary" />
              <Text className="font-rbold text-2xl text-black py-[5%]">Snapshot Report</Text>
              <Text className=" font-rbase text-base text-black pb-[2%]">Please provide an photo for the report.</Text>
              {/* Toggle Camera Fullscreen */}
              <View className="py-1">
                <TouchableHighlight underlayColor={"#d9ffe6"} className={`${photos.length > 0 ? "rounded-t-xl" : "rounded-xl"}`} onPress={toggleFullScreen}>
                  <View className={`flex-row pl-3 py-2 ${photos.length > 0 ? "rounded-t-xl" : "rounded-xl"} border-2 border-primary items-center`}>
                    {photos.length > 0 ? (
                        <Text className="font-rbase text-base text-black">Retake Picture</Text>
                    ) : (
                        <>
                          <Text className="font-rbase text-base text-black">Toggle Camera
                            {photos.length > 0 ? (<></>) : (<Text className="text-red-600">{"*"}</Text>)}
                          </Text>
                        </>
                    )}
                    <View className="absolute right-[4%] items-center justify-center flex-row gap-x-5">
                      {photos.length > 0 ? (
                        <>
                          <Image 
                            tintColor='#57b378'
                            source={icons.check}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Image 
                            tintColor='#57b378'
                            source={icons.retakePhoto}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </>
                      ) : (
                        <Image 
                            tintColor='#57b378'
                            source={icons.camera}
                            className="w-5 h-5"
                            resizeMode='contain'
                        />
                      )}
                    </View>
                  </View>
                </TouchableHighlight>
                {photos.length  > 0 && (
                  <View className="border-b-2 border-x-2 border-primary rounded-b-xl items-center justify-center px-4">
                    <Image source={{ uri: photos[photos.length - 1].uri }} style={width < 400 ? { height: 400, width: 280 } : { height: 460, width: 330 }} resizeMode='contain' />
                  </View>
                )}
              </View>
              <View className="py-3"/>
              {/* Report Details */}
              <View className="w-[120%] h-[0.3%] -left-5 bg-primary" />
              <Text className="font-rbold text-2xl text-black py-[5%]">Report Details</Text>
              <Text className=" font-rbase text-base text-black pb-[2%]">Please write a description of Incident {"(OPTIONAL)"}.</Text>
              {/* Details Inputbox */}
              <View className="py-1">
                <View className="w-full h-32 bg-white border-primary border-2 rounded-2xl justify-center items-center px-4">
                  <TextInput
                    className="w-full text-md font-rbase text-black"
                    placeholder='Description'
                    multiline
                    numberOfLines={4}
                    placeholderTextColor='#94A3B8'
                    value={form.description}
                    onChangeText={(text) => handleInputChange('description', text)}>
                  </TextInput> 
                </View>
              </View>
            </View>
            <View className="py-[20%]"/>
          </ScrollView>
        </View>
        {!keyboardVisible ? (
          <View className="h-[8%] w-full items-center justify-center bg-primary/80 z-10 absolute bottom-0">
            <TouchableHighlight underlayColor={"#d9ffe6"} className={`${width < 400 ? "w-3/5 h-10" : "w-2/3 h-12"} rounded-3xl ${isLock ? "bg-primary-10" : "bg-white"} items-center justify-center`} onPress={handleSubmit} disabled={loading || isLock}>
              {loading ? (<ActivityIndicator size="large" color="#57b378" />) : (<Text className={`${isLock ? "text-primary-75" : "text-primary"} font-psemibold text-2xl`}>SUBMIT</Text>)}
            </TouchableHighlight>
            <TouchableHighlight underlayColor={"#d9ffe6"} className="absolute right-2 rounded-full" onPress={handleDelete} disabled={isDelete}>
              <View className="p-2 items-center justify-center">
                <Image 
                  tintColor={isDelete ? "#bfffd6" : "#ffffff"}
                  source={icons.deletePhoto}
                  className={`${width < 400 ? "w-8 h-8" : "w-10 h-10"}`}
                  resizeMode='contain'
                />
              </View>
            </TouchableHighlight>
          </View>
        ) : (
          <></>
        )}
        </>
      ) : (
        <>
          <CameraView style={{ width: '100%', height: '90%' }} facing={facing} ref={cameraRef} enableTorch={isTorched} flash='auto' />
          <View className="w-full h-[10%] bg-primary items-center justify-center">
            <TouchableHighlight underlayColor={"#bfffd6"} className={`bottom-[25%] w-28 h-28 z-20 absolute bg-white rounded-full items-center justify-center p-2`} onPress={takePicture} disabled={loading}>
              {loading ? (<ActivityIndicator size="large" color="#57b378" />) : (
                <Image 
                  tintColor="#57b378"
                  source={icons.capture}
                  className="w-[70%] h-[70%]"
                  resizeMode='contain'
                />
              )}
            </TouchableHighlight>
            <View className={`w-[138px] h-[138px] bottom-[4%] bg-primary rounded-full absolute p-2`}/>
            <View className="flex-row gap-48">
              <View className={`w-[57px] h-[57px] bg-white rounded-full items-center justify-center p-2`}>
                <TouchableHighlight underlayColor={"#bfffd6"} className={`w-[56px] h-[56px] ${facing === 'back' ? "bg-primary" : "bg-white"} rounded-full items-center justify-center p-2`} onPress={toggleCameraFacing} disabled={loading}>
                  <Image 
                    tintColor={facing === 'back' ? "#ffffff" : "#57b378"}
                    source={icons.flipCamera}
                    className="w-7 h-7"
                    resizeMode='contain'
                  /> 
                </TouchableHighlight>
              </View>
              <View className={`w-[57px] h-[57px] bg-white rounded-full items-center justify-center p-2`}>
                <TouchableHighlight underlayColor={"#bfffd6"} className={`w-[56px] h-[56px] ${!isTorched ? "bg-primary" : "bg-white"} rounded-full items-center justify-center p-2`} onPress={toggleTorch} disabled={loading}>
                  <Image 
                    tintColor={!isTorched ? "#ffffff" : "#57b378"}
                    source={icons.flash}
                    className="w-7 h-7"
                    resizeMode='contain'
                  /> 
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </>
      )}
      <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  );
};

export default ReportScreen;
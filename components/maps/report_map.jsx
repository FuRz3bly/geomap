import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useCallback, useRef } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Heatmap, Polyline } from 'react-native-maps';
import { getPreciseDistance, getDistance } from 'geolib';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router';

import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import UserContext from '../UserContext';
import ToolsContext from '../ToolsContext';
import { translate, containID, setTitle } from '../ToolsContext';

import { images, icons } from '../../constants';
import { default_theme, night_theme, vintage_theme, wasp_theme, elevation_theme } from '../../components/maps/themes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ReportMap = forwardRef((props, ref) => {
  const {
    mapStatus,
    mapWarn,
    loadingMsg,
    successMsg,
    warnMsg,
    errorMsg,
    receiveMsg,
    arriveMsg,
    resolveMsg,
    traffics,
    receiveVisible,
    arriveVisible,
    resolveVisible,
    reportVisible,
    reportID,
    userLocation,
    selectedReport,
    amenityVisible,
    amenityID,
    selectedAmenity,
    distanceAmenity,
    searchVisible,
    searchQuery,
    searchMode,
    isSearchActive,
    onSearchResults,
    selectedResult,
    reportMarkerVisible,
    includedAmenity,
    amenityCount,
    findNearest,
    theme,
    isResponded
  } = props; // Destructure props here

  // Global Variables
  const { user, isResponder } = useContext(UserContext); // User and User Role Container
  const { dictionary, turnEIM, setRespo, resolved, setResolved } = useContext(ToolsContext); // Tools Container
  const router = useRouter();
  // Modal Variables
  const [allReports, setAllReports] = useState(null); // Collection of All Reports
  const [alertShown, setAlertShown] = useState(false); // Flag to track if alert has been shown
  // Notification Based Containers
  const [notifiedReports, setNotifiedReports] = useState(new Set()); // Notification Traker
  // Local Variables
  const mapRef = useRef(null);
  const [markerKey, setMarkerKey] = useState(0);
  const [doneLoading, setDoneLoading] = useState(false);
  const [key, setKey] = useState(0);
  const [trackUser, setTrackUser] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [heading, setHeading] = useState(0);
  const [location, setLocation] = useState(null); // User Location Container
  const [amenities, setAmenities] = useState([]); // Amenities Container
  const [allAmenities, setAllAmenities] = useState([]); // All Amenities Container
  const [sortAmenities, setSortAmenities] = useState([]); // Sorted Amenities Container
  const [categoryAmenities, setCategoryAmenities] = useState([]); // Categorized Amenities by Type
  const [sortReports, setSortReports] = useState([]); // Sorted Reports Container
  const [reports, setReports] = useState([]); // All Pending User Reports Container
  const [selectReport, setSelectReport] = useState(null); // Selected Report Container
  const [nearestAmenity, setNearestAmenity] = useState(null); // Nearest Amenity Container
  const [mapTheme, setMapTheme] = useState(default_theme);
  const [receiveReport, setReceiveReport] = useState(null); // Received Report Container
  const [responderAmenity, setResponderAmenity] = useState([]); // Responder Amenity Container
  const [responderLocation, setResponderLocation] = useState({ latitude: 0, longitude: 0 });
  const [responseReport, setResponseReport] = useState(null); // Response Report Container
  const [responderRoute, setResponderRoute] = useState([]); // Current Route of Responder

  // Fetching Location Function
  const fetchLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    //mapStatus('loading');
    //loadingMsg('LOCATING USER');
    if (status !== 'granted') {
      mapStatus('error');
      errorMsg('PERMISSION DENIED');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    userLocation(location.coords)
    setLocation(location.coords);
    //mapStatus('success');
    //successMsg('LOCATION SET')

    // Subscribe to heading changes
    const headingSubscription = await Location.watchHeadingAsync(({ trueHeading }) => {
      setHeading(trueHeading); // Update heading state
    });

    // Cleanup function to stop heading updates
    return () => {
      headingSubscription.remove(); // Remove the subscription on cleanup
    };
  }, []);

  // Fetching Notifications Permission
  useEffect(() => {
    const configureNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        mapStatus('error');
        errorMsg('PERMISSION DENIED');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
    };
  
    configureNotifications();
  }, []);

  // Use effect to stop tracking view changes after initial render
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTracksViewChanges(false);
    }, 1000); // Delay for 1 second to ensure it's rendered properly

    return () => clearTimeout(timeout);
  }, []);

  // Fetching User Location
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    if (mapRef.current && location && !trackUser) { // Check if location is defined
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
      setTrackUser(true);
    }
  }, [mapRef, location, trackUser])
  
  // Real-time listener for Amenities, Received Report and Relevant Amenity
  useEffect(() => {
    //loadingMsg('FETCHING AMENITIES');
    const unsubscribe = onSnapshot(collection(db, 'amenity'), (snapshot) => {
      const amenityList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        responders: doc.data().responders.map(responder => responder.uid),
      }));
      // Containing All Amenities
      setAllAmenities(amenityList);
  
      onSnapshot(collection(db, 'reports'), (reportSnapshot) => {
        const reportsList = reportSnapshot.docs.map(doc => doc.data());
        // Finding if any report has receive status
        const receivedReport = reportsList.find(report => report.report_status === 'received');
        if (receivedReport && receivedReport.responder) { // If there is a received report
          const relevantAmenity = amenityList.find(amenity => amenity.id === receivedReport.responder.amenity.id);
          if (relevantAmenity) {
            // Only display the Amenity with the id from the report with receive status
            setAmenities([relevantAmenity]);
            setResponderAmenity([relevantAmenity]);
        
            if (mapRef.current) {
              const routeCoordinates = receivedReport.responder.route_coordinates || []; // Ensure route_coordinates exist
              
              if (routeCoordinates.length > 0) {
                // Zoom and fit the map to show the route
                mapRef.current.fitToCoordinates(routeCoordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              } else {
                // Fallback: Fit the map to the start and end points
                const coordinates = [
                  {
                    latitude: receivedReport.report_location.latitude,
                    longitude: receivedReport.report_location.longitude,
                  },
                  {
                    latitude: relevantAmenity.location.latitude,
                    longitude: relevantAmenity.location.longitude,
                  },
                ];
                mapRef.current.fitToCoordinates(coordinates, {
                  edgePadding: { top: 200, right: 100, bottom: 200, left: 100 },
                  animated: true,
                });
              }
            }
          }
        } else {
          const filteredAmenities = amenityList.filter(amenity =>
            ['fire_station', 'police', 'disaster', 'barangay'].includes(amenity.type)
          );
          
          if (location) { // If the location of the user is available
            const userLocation = {
              latitude: location.latitude,
              longitude: location.longitude,
            };
          
            // Calculate distance from user for each amenity
            const amenitiesWithDistance = filteredAmenities.map(amenity => {
              const distance = getPreciseDistance(
                userLocation,
                {
                  latitude: amenity.location.latitude,
                  longitude: amenity.location.longitude,
                }
              );
              return { ...amenity, distance };
            });
          
            // Sort amenities by distance (nearest to farthest)
            const sortedAmenities = amenitiesWithDistance.sort((a, b) => a.distance - b.distance);
            // Group amenities by type
            const groupedAmenities = {
              fire_station: [],
              police: [],
              disaster: [],
              barangay: []
            };
            sortedAmenities.forEach(amenity => {
              groupedAmenities[amenity.type].push(amenity);
            });
            // Store Categorized Amenities for later use
            setCategoryAmenities(groupedAmenities);

            // Merge amenities in the specified pattern based on distance (fire_station, police, disaster,...)
            const mergedAmenities = [];
            let i = 0;
            while (mergedAmenities.length < 6 && (groupedAmenities.fire_station[i] || groupedAmenities.police[i] || groupedAmenities.disaster[i])) { // Adjust this number if you want more than 6
              if (groupedAmenities.fire_station[i]) mergedAmenities.push(groupedAmenities.fire_station[i]);
              if (groupedAmenities.police[i]) mergedAmenities.push(groupedAmenities.police[i]);
              if (groupedAmenities.disaster[i]) mergedAmenities.push(groupedAmenities.disaster[i]);
              if (groupedAmenities.barangay[i]) mergedAmenities.push(groupedAmenities.barangay[i]);
              i++;
            }

            // Set amenities to display - 3 Nearest Fire Station, Police, Disaster, Barangay
            setAmenities(mergedAmenities.slice(0, 4));
            // Count the types of amenities
            const counts = {};
            mergedAmenities.slice(0, 4).forEach(amenity => {
              counts[amenity.type] = (counts[amenity.type] || 0) + 1;
            });
            amenityCount(counts);
            // Set all sorted amenities for finding nearest and stuff
            setSortAmenities(mergedAmenities);
          }      
        }
      });
    });
  
    return () => unsubscribe();
  }, [location]);

  // Real-time listener for Reports
  useEffect(() => {
    //loadingMsg('FETCHING REPORTS');
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportsList = snapshot.docs.map(doc => {
        const report = doc.data();
        if (report.responder) {
          const { first_name, last_name } = report.responder.full_name;
          report.responder.full_name = `${first_name} ${last_name}`;
        }
        return report;
      });
  
      setAllReports(reportsList);
  
      // Filter the reports based on the user ID and if not 'resolved'
      if (user) {
        const filteredReports = reportsList.filter(report =>
          report.user_report.user_id === user.user_id && report.report_status !== 'resolved'
        );
  
        // Find reports with 'received' and 'responded' status
        const receivedReport = filteredReports.find(report => report.report_status === 'received');
        const respondedReport = filteredReports.find(report => report.report_status === 'responded');
  
        const handleReport = (report, isReceived) => {
          if (!notifiedReports.has(report.report_id)) {
            setReports([report]);
  
            if (isReceived) {
              if (location) {
                const distance = getPreciseDistance(
                  { latitude: report.responder.amenity.location.latitude, longitude: report.responder.amenity.location.longitude },
                  { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
                );
                const estimatedArrivalTime = calculateArrivalTime(distance);
  
                receiveMsg({ report: report.report_type, time: report.responder.route_time.time || estimatedArrivalTime, respo: report.responder.full_name });
                containID(report.report_id);
                receiveVisible(true); // Show modal once
  
                receiveNotification({ report: report.report_type, id: report.report_id, time: report.responder.route_time.time || estimatedArrivalTime, respo: report.responder.full_name });
                setNotifiedReports(new Set(notifiedReports.add(report.report_id))); // Mark report as notified
              }
            } else {
              setRespo(true);
              setSelectReport(report);
              arriveMsg({ report: report.report_type, respo: report.responder.full_name });
              arriveVisible(true); // Show modal once
              containID(report.report_id);
              isResponded(true);
  
              arriveNotification({ report: report.report_type, id: report.report_id, respo: report.responder.full_name });
              setNotifiedReports(new Set(notifiedReports.add(report.report_id))); // Mark report as notified
            }
          }
        };
  
        if (receivedReport) {
          handleReport(receivedReport, true);
          setReceiveReport(receivedReport);
          setResponseReport(null);
          setSelectReport(receivedReport);
          setResponderRoute(receivedReport.responder.route_coordinates);
          setResponderLocation(receivedReport.responder.responder_location);
        } else if (respondedReport) {
          handleReport(respondedReport, false);
          setReceiveReport(null);
          setResponseReport(respondedReport);
          setSelectReport(respondedReport);
          setResponderRoute([]);
        } else {
          setReceiveReport(null);
          setResponseReport(null);
          setReports(filteredReports);
          setSortReports(filteredReports);
        }
      }
    });
    
    return () => unsubscribe();
  }, [user, location]);

  // If Searching Query on Amenities or All
  useEffect(() => {
    if (isSearchActive && searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
  
      let searchedAmenities = [];
      let searchedReports = [];
  
      if (searchMode === 'amenities' || searchMode === 'all') {
        searchedAmenities = allAmenities.filter((amenity) => 
          amenity.name.toLowerCase().includes(lowerCaseQuery) ||
          amenity.type.toLowerCase().includes(lowerCaseQuery) ||
          amenity.description.toLowerCase().includes(lowerCaseQuery) ||
          amenity.address.toLowerCase().includes(lowerCaseQuery)
        );
      }
  
      if (searchMode === 'reports' || searchMode === 'all') {
        searchedReports = sortReports.filter((report) => 
          report.report_type?.toLowerCase().includes(lowerCaseQuery) ||
          report.report_id?.includes(searchQuery.trim()) ||
          report.description?.toLowerCase().includes(lowerCaseQuery)
        );
      }
  
      if (searchMode === 'amenities') {
        onSearchResults(searchedAmenities);
        setAmenities(searchedAmenities);
        setReports(sortReports);
      } else if (searchMode === 'reports') {
        onSearchResults(searchedReports);
        setReports(searchedReports);
        setAmenities(sortAmenities.slice(0, 3));
      } else if (searchMode === 'all') {
        onSearchResults((prevResults) => {
          const combinedResults = [...prevResults, ...searchedAmenities, ...searchedReports];
          const uniqueResults = Array.from(new Set(combinedResults.map((a) => a.id || a.report_id)))
            .map((id) => combinedResults.find((a) => a.id === id || a.report_id === id));
          return uniqueResults;
        });
        setAmenities(searchedAmenities);
        setReports(searchedReports);
      }
  
      // Zoom to fit both amenities and reports
      const amenityCoordinates = searchedAmenities.map((amenity) => ({
        latitude: amenity.location.latitude,
        longitude: amenity.location.longitude,
      }));
      const reportCoordinates = searchedReports.map((report) => ({
        latitude: report.report_location.latitude,
        longitude: report.report_location.longitude,
      }));
      const coordinates = [...amenityCoordinates, ...reportCoordinates];
  
      if (coordinates.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      }
    } else {
      onSearchResults([]);
      setAmenities(sortAmenities.slice(0, 3));
      setReports(sortReports);
    }
  }, [isSearchActive, searchQuery, searchMode, allAmenities, sortReports]);
  
  // Finding the Nearest Amenity based on Type
  useEffect(() => {
    // If includedAmenity's change
    if (includedAmenity && categoryAmenities) {
      let mergedAmenities = [];
      let i = 0;
  
      // Loop to gather up to 4 amenities based on includedAmenity
      while (
        mergedAmenities.length < 4 &&
        (categoryAmenities.fire_station?.[i] || categoryAmenities.police?.[i] || categoryAmenities.disaster?.[i] || categoryAmenities.barangay?.[i])
      ) {
        if (includedAmenity.includes('fire_station') && categoryAmenities.fire_station?.[i]) {
          mergedAmenities.push(categoryAmenities.fire_station[i]);
        }
        if (includedAmenity.includes('police') && categoryAmenities.police?.[i]) {
          mergedAmenities.push(categoryAmenities.police[i]);
        }
        if (includedAmenity.includes('disaster') && categoryAmenities.disaster?.[i]) {
          mergedAmenities.push(categoryAmenities.disaster[i]);
        }
        if (includedAmenity.includes('barangay') && categoryAmenities.barangay?.[i]) {
          mergedAmenities.push(categoryAmenities.barangay[i]);
        }
        i++;
      }
  
      // Set amenities and count occurrences
      if (mergedAmenities.length > 0) {
        setAmenities(mergedAmenities.slice(0, 4)); // Ensure only 3 are shown
        const counts = {};
        mergedAmenities.slice(0, 4).forEach(amenity => {
          counts[amenity.type] = (counts[amenity.type] || 0) + 1;
        });
        amenityCount(counts); // Set the count of each amenity type
      }
    }
    // If findNearest is active
    if (location && findNearest) {
      // Find the nearest amenity per type immediately
      const nearestFire = categoryAmenities.fire_station[0];
      const nearestPolice = categoryAmenities.police[0];
      const nearestDisaster = categoryAmenities.disaster[0];
      const nearestBarangay = categoryAmenities.barangay[0];
      
      // Filter the amenities to be included based on includedAmenity
      const nearestAmenities = includedAmenity
      .map(type => { // Find if x.type is on the includedAmenity Array
        if (type === 'fire_station') return nearestFire;
        if (type === 'police') return nearestPolice;
        if (type === 'disaster') return nearestDisaster;
        if (type === 'barangay') return nearestBarangay;
        return null;
      })
      .filter(amenity => amenity); // Remove null values

      // Find the nearest amenity among the included ones
      const nearestAmenity = nearestAmenities.reduce((nearest, amenity) => {
        if (!nearest || (amenity && amenity.distance < nearest.distance)) {
          return amenity;
        }
        return nearest;
      }, null);
      handleAmenityMarker(nearestAmenity, nearestAmenity.distance);
      amenityID(nearestAmenity.id);

      // Zoom towards the nearest amenity on the map
      if (nearestAmenity && mapRef.current) {
        mapRef.current.fitToCoordinates([{
          latitude: nearestAmenity.location.latitude,
          longitude: nearestAmenity.location.longitude,
        }], {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      } else { return }
    }
  }, [location, findNearest, nearestAmenity, categoryAmenities, includedAmenity]);

  /* // Reset previous search results when search mode changes
  useEffect(() => {
    onSearchResults([]); // Clear previous search results when search mode changes
  }, [searchMode]); */

  // If Notification is Pressed
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const reportID = response.notification.request.content.data.reportID;
      
      // Log to ensure it's being captured correctly
      console.log('Notification Pressed, Report ID:', reportID);
      
      if (reportID) {
        // Debug the navigation step
        console.log('Navigating to home/homes with reportID:', reportID);
        
        // Navigate to the correct route
        router.push('home/homes');  // Try using '/home/homes' if needed
        containID(reportID); // Assuming containID handles the report ID correctly
        setTitle('home/details'); // Set title
      }
    });
  
    return () => {
      subscription.remove();
    };
  }, []);

  // Switch Theme
  useEffect(() => {
    switch (theme) {
      case 'night':
        setMapTheme(night_theme);
        break;
      case 'vintage':
        setMapTheme(vintage_theme);
        break;
      case 'wasp':
        setMapTheme(wasp_theme);
        break;
      case 'elevation':
        setMapTheme(elevation_theme);
        break;
      default:
        setMapTheme(default_theme);
    }
  }, [theme]);

  // If there is selected report and amenity in result
  useEffect(() => {
    if (selectedResult && mapRef.current && amenities && searchMode === 'amenities') {
      const selectAmenity = amenities.find(amenity => amenity.id === selectedResult)
      if (selectAmenity) {
        const { latitude, longitude } = selectAmenity.location;

        // Zoom in to the selected amenity location
        mapRef.current.animateToRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.01,  // Adjust these values to control zoom level
          longitudeDelta: 0.01,
        }, 1000);  // 1000ms animation duration

        if (location) {
          const distance = getDistance(
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: selectAmenity.location.latitude, longitude: selectAmenity.location.longitude }
          )
          handleAmenityMarker(selectAmenity, distance);
          searchVisible(false);
        }
      }
    } else if (selectedResult && mapRef.current && reports && searchMode === 'reports') {
      const selectReport = reports.find(report => report.report_id === selectedResult)
      if (selectReport && !responderAmenity) {
        // Zoom in to the selected report location
        mapRef.current.animateToRegion({
          latitude: selectReport.report_location.latitude,
          longitude: selectReport.report_location.longitude,
          latitudeDelta: 0.01,  // Adjust these values to control zoom level
          longitudeDelta: 0.01,
        }, 1000);  // 1000ms animation duration
        handleReportMarker(selectReport);
        searchVisible(false);
      }
    } else {
      if (selectedResult) {
        const isAmenity = selectedResult.length > 11;

        if (isAmenity) {
          const selectAmenity = amenities.find(amenity => amenity.id === selectedResult)
          if (selectAmenity) {
            const { latitude, longitude } = selectAmenity.location;

            // Zoom in to the selected amenity location
            mapRef.current.animateToRegion({
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.01,  // Adjust these values to control zoom level
              longitudeDelta: 0.01,
            }, 1000);  // 1000ms animation duration

            if (location) {
              const distance = getDistance(
                { latitude: location.latitude, longitude: location.longitude },
                { latitude: selectAmenity.location.latitude, longitude: selectAmenity.location.longitude }
              )
              handleAmenityMarker(selectAmenity, distance);
              searchVisible(false);
            }
          }
        } else {
          const selectedReport = reports.find(report => report.report_id === selectedResult)
          if (selectedReport && !responderAmenity) {
            // Zoom in to the selected report location
            mapRef.current.animateToRegion({
              latitude: selectedReport.report_location.latitude,
              longitude: selectedReport.report_location.longitude,
              latitudeDelta: 0.01,  // Adjust these values to control zoom level
              longitudeDelta: 0.01,
            }, 1000);  // 1000ms animation duration
            handleReportMarker(selectedReport);
            searchVisible(false);
          }
        }
      }
    }
  }, [selectedResult, searchMode]);

  // Function to calculate estimated arrival time
  const calculateArrivalTime = (distance, speed = 20) => {
    const timeInSeconds = distance / (speed / 3.6); // speed in m/s
    const timeInMinutes = Math.round(timeInSeconds / 60);
    return timeInMinutes;
  };

  // Icon Generator Function
  const icogenerator = (key, value) => {
    let iconKey;

    if (value === 'reports') {
      iconKey = dictionary[key + '_report_icon'];
    } else if (value === 'respond') {
      iconKey = dictionary[key + '_report_select_icon'];
    } else if (value === 'amenity') {
      iconKey = dictionary[key + '_icon'];
    } else if (value === 'nearest') {
      iconKey = dictionary[key + '_nearest'];
    } else {
      iconKey = dictionary[key + '_icon'];
    }
    return icons[iconKey] || null;
  };

  // Function to Receive Notifications
  const receiveNotification = ({ report, id, time, respo }) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Report Received',
        body: 
        `Report Type: ${translate(report)}  |  ETA: ${time} minutes \nResponder: ${respo}`,
        data: { reportID: id }
      },
      trigger: null, // Send immediately
    });
  };

  // Function to Arrive Notifications
  const arriveNotification = ({ report, id, respo }) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Responders Arrived',
        body: 
        `Report Type: ${translate(report)}  |  Responder: ${respo}`,
        data: { reportID: id }
      },
      trigger: null, // Send immediately
    });
  };

  // Marker Press Function
  const handleReportMarker = (report) => {
    amenityVisible(false);
    searchVisible(false);
    selectedReport(report);
    reportID(report.report_id);
    reportVisible(true);
  };

  // Marker Press Function
  const handleAmenityMarker = (amenity, distance) => {
    reportVisible(false);
    searchVisible(false);
    selectedAmenity(amenity);
    amenityID(amenity.id);
    distanceAmenity(distance);
    amenityVisible(true);
  };

  const handleMapPress = () => {
    reportVisible(false);
    searchVisible(false);
    amenityVisible(false);
  };

  const handleResolve = async () => {
    if (selectReport) {
      const reportRef = doc(db, 'reports', selectReport.report_id);
      const reportSnap = await getDoc(reportRef); // Fetch the current report document
      console.log(selectReport.report_id)
      // Show Resolved Alert
      resolveMsg({ report: selectReport.report_type, respo: selectReport.responder.full_name });
      resolveVisible(true);
      containID(selectReport.report_id);
      if (reportSnap.exists()) {
        const resolvedTime = new Date();
        // Get the existing report responder details
        const existingResponder = reportSnap.data().responder || {};
        // Update the existing report responder details
        const updatedResponder = {
          ...existingResponder,
          resolved_time: resolvedTime
        };
        // Update the status
        await updateDoc(reportRef, {
          report_status: 'resolved',
          responder: updatedResponder
        });
        //setRespo(false);
        isResponded(false);
        setReceiveReport(null);
        setResponseReport(null);
        setSelectReport(null);
      } else {
        console.error("No such document exists!");
      }
    }
  };

  useImperativeHandle(ref, () => ({
    handleCompass: () => {
      if (mapRef.current) {
        mapRef.current.animateCamera({
          heading: 0,
          pitch: 0,
        });
      }
    },
    handleRecenter: () => {
      if (mapRef.current && location) { // Check if location is defined
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    },
    handleAdjust: () => {
      if (mapRef.current && location) { // Check if location is defined
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }, 1000);
      }
    },
    handleResolve
  }));

  useEffect(() => {
    if (reports && amenities && location && !doneLoading) {
      //mapStatus('success');
      //successMsg('MARKERS LOADED');
      //setKey(prevKey => prevKey + 1);
      setDoneLoading(true);
    }
  }, [doneLoading]);

  return (
    <View>
      <MapView
        key={key}
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: location ? location.latitude : 14.197811048999133,
          longitude: location ? location.longitude : 120.88149481077414,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
        customMapStyle={mapTheme}
        showsUserLocation={true}
        showsBuildings={false}
        showsCompass={false}
        showsTraffic={traffics}
        showsMyLocationButton={false}
        zoomControlEnabled={false}
        toolbarEnabled={false}
        onPress={handleMapPress}
      >
        {amenities.map((amenity) => {
          // Calculate the distance and ETA for the valid reports
          if (location) {
            const distance = getDistance(
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: amenity.location.latitude, longitude: amenity.location.longitude }
            );

            return (
              <Marker
                key={`${amenity.id}-${markerKey}`}
                coordinate={{
                  latitude: amenity.location.latitude,
                  longitude: amenity.location.longitude,
                }}
                image={
                  amenity.type === 'police'
                    ? require('../../assets/icons/police-station-marker.png')
                    : amenity.type === 'disaster'
                    ? require('../../assets/icons/disaster-station-marker.png')
                    : amenity.type === 'barangay'
                    ? require('../../assets/icons/barangay-station-marker.png')
                    : require('../../assets/icons/fire-station-marker.png') // default icon
                }
                tracksViewChanges={tracksViewChanges}
                onPress={() => handleAmenityMarker(amenity, distance)}
              />
            )
          }
        })}
        {reportMarkerVisible && !receiveReport && !responseReport && reports.map((report) => (
          <Marker
            key={`${report.report_id}-${markerKey}`}
            coordinate={{
              latitude: report.report_location.latitude,
              longitude: report.report_location.longitude,
            }}
            image={
              report.handler === 'police'
                ? require('../../assets/icons/police-report-marker.png')
                : report.handler === 'disaster'
                ? require('../../assets/icons/disaster-report-marker.png')
                : report.handler === 'barangay'
                ? require('../../assets/icons/barangay-report-marker.png')
                : require('../../assets/icons/fire-report-marker.png') // default icon
            }
            tracksViewChanges={tracksViewChanges}
            onPress={() => handleReportMarker(report)}
          />
        ))}
        {reportMarkerVisible && [].concat(receiveReport || [], responseReport || []).map((report, index) => (
            <Marker
              key={`${index}-${markerKey}`}
              coordinate={{
                latitude: report.report_location.latitude,
                longitude: report.report_location.longitude,
              }}
              tracksViewChanges={tracksViewChanges}
              image={
                report.report_status === 'received' ? 
                (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-received-marker-select.png') : require('../../assets/icons/report-received-marker.png'))
                  : report.report_status === 'responded' ? 
                (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-responded-marker-select.png') : require('../../assets/icons/report-responded-marker.png'))
                  : report.report_status === 'resolved' ? 
                (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-resolved-marker-select.png') : require('../../assets/icons/report-resolved-marker.png'))
                  : (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-waiting-marker-select.png') : require('../../assets/icons/report-waiting-marker.png')) // default icon
              }
              onPress={() => handleReportMarker(report)}
            />
        ))}
        {receiveReport && responderLocation && (
          <Marker
            coordinate={
              responderLocation.latitude && responderLocation.longitude
                ? {
                  latitude: responderLocation.latitude,
                  longitude:responderLocation.longitude
                }
                : { latitude: 0, longitude: 0 }
            }
            anchor={{ x: 0.5, y: 0.5 }}
            image={
              responderAmenity.type === 'police'
                ? require('../../assets/icons/police-navigation.png')
                : responderAmenity.type === 'disaster'
                ? require('../../assets/icons/disaster-navigation.png')
                : responderAmenity.type === 'barangay'
                ? require('../../assets/icons/barangay-navigation.png')
                : require('../../assets/icons/bfp-navigation.png') // default icon
            }
          />
        )}
        {receiveReport && responderRoute && (
          <Polyline
            coordinates={responderRoute}
            strokeWidth={5}
            strokeColor="#42e3a8"
          />
        )}
      </MapView>
    </View>
  )
})

export default ReportMap;
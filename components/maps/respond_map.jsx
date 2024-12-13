import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useCallback, useRef } from 'react';
import { View, Button, Text, Alert, Image } from 'react-native';
import MapView, { Marker, Polygon, Callout, Circle, AnimatedRegion, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications'
import { getDistance, getPreciseDistance } from 'geolib';
import { router } from 'expo-router';
import { collection, onSnapshot, doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import UserContext from '../UserContext';
import ToolsContext, { translate, containID } from '../ToolsContext';

import { default_theme, night_theme, vintage_theme, wasp_theme, elevation_theme } from '../../components/maps/themes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const apiKeys = [
  'b12e2c1e-a2ef-4a09-8fc1-87ca55bc9c9b',
  '75f0e0dc-01c5-4f86-a991-c2d93cd88536',
  '5fe29a93-36b3-48c8-8ef4-58d84b88db48'
];

const geoapifyApiKey = 'd3c63d90e1d84f5e81326d82a2db8645'

const RespondMap = forwardRef((
  { mapStatus, 
    loadingMsg, 
    successMsg, 
    failMsg, 
    userLocation, 
    reportID, 
    selectedReport, 
    reportVisible, 
    respoStatus, 
    reportStatus, 
    responseVisible, 
    arrivalVisible, 
    responseMsg, 
    arrivalMsg, 
    locateReport, 
    dashboardReceiveReport, 
    setDashboardReceiveReport,
    reportETA,
    respoInstruction
  }, ref) => {

  // Global Variables
  const { user, isResponder } = useContext(UserContext); // User Container
  const { dictionary,
    received, setReceived,
    hasReport, sentReport,
    isResponding, toggleResponse,
    isAmenity, toggleAmenity,
    arrived, setArrived } = useContext(ToolsContext)

  // Location Variables
  const [location, setLocation] = useState(null); // User Location Container
  const [errorMsg, setErrorMsg] = useState(null); // Error Message Container
  const [heading, setHeading] = useState(0); // Device Heading
  const [responderLocation, setResponderLocation] = useState({ latitude: 0, longitude: 0 });
  const [currentInstruction, setCurrentInstruction] = useState({ text: 'Wait', turnDistance: '0 mi' }); // Responder instructions
  const proximityThreshold = 50; // Threshold to switch to the next instruction (in meters)
  const maxDisplayDistance = 5 * 1609.34; // 5 miles in meters
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);
  const [progress, setProgress] = useState(0); // 0 - 100, represents the percentage of the route traveled
  const responderRouteRef = useRef(responderRoute);

  // Notification Based Variables
  const [notifiedReports, setNotifiedReports] = useState(new Set()); // Notification Traker

  // Amenities Variables
  const [userAmenity, setUserAmenity] = useState(null); // User's Amenity Container
  const [amenityList, setAmenityList] = useState([]); // All Amenities Container
  const [status, setStatus] = useState('hawkwatch'); // Status of the User Container - hawkwatch (searching), eaglestoop (responding), duckperched (arrival)
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]); // Route to Report Container
  const [responderRoute, setResponderRoute] = useState([]); // Current Route of Responder
  const [responderInstructions, setResponderInstructions] = useState([]); // Responder Instructions
  const [locationSubscription, setLocationSubscription] = useState(null); // High-accuracy Tracking Subscription

  // Reports Variables
  const [reports, setReports] = useState([]); // All Reports Container
  const [respondedReports, setRespondedReports] = useState([]); // All Recent Responded Reports
  const [reportsList, setReportsList] = useState([]); // All Reports Container
  const [selectReport, setSelectReport] = useState(null); // Selected Report Container
  const [selectedRespondedReport, setSelectedRespondedReport] = useState(null); // Selected Responded Report Container
  const [respondReport, setRespondReport] = useState(null); // Responded Report Container
  const [destination, setDestination] = useState({ latitude: 0, longitude: 0 });
  
  // Reference Variables
  const mapRef = useRef(null); // Map View Reference

  // Calculate Estimated Time of Arrival (ETA)
  const calculateETA = (distance) => {
    const averageSpeed = 20; // km/h
    const time = distance / 1000 / averageSpeed * 60; // in minutes
    return Math.round(time);
  };

  useEffect(() => {
    return () => {
      setResponderRoute([]); // Reset when unmounting
    };
  }, []);

  let currentKeyIndex = 0;

  const getApiKey = () => {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
  };

  // Fetching Location Function (boosted to 2 secs and 5 meters)
  useEffect(() => {
    let subscription;
  
    const startLocationUpdates = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 2 }, // Update every 1 seconds or 2 meters
        (location) => {
          setLocation(location.coords);
          setResponderLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          userLocation(location.coords);
        }
      );
    };
  
    startLocationUpdates();
    return () => subscription && subscription.remove(); // Cleanup on unmount
  }, []);  

  // Locate, Respond Report or Zoom To User's Amenity
  useEffect(() => {
    let timer;

    if (status === 'eaglestoop') {
      navigatingMapView(responderLocation?.latitude, responderLocation?.longitude)
    } else {
      if (locateReport) {
        handleReportMarker(locateReport, locateReport.report_status)
    
        if (mapRef.current) {
          timer = setTimeout(() => {
            mapRef.current.animateToRegion({
              latitude: locateReport.report_location.latitude,
              longitude: locateReport.report_location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 1000);
          }, 1000);
        }
      } else if (dashboardReceiveReport) {
        handleReportMarker(dashboardReceiveReport, dashboardReceiveReport.report_status)
        //drawRoute(location, dashboardReceiveReport.report_location, 'car');
    
        if (mapRef.current) {
          timer = setTimeout(() => {
            mapRef.current.animateToRegion({
              latitude: dashboardReceiveReport.report_location.latitude,
              longitude: dashboardReceiveReport.report_location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 1000);
          }, 1000);
          handleResponse();
        }
      } else {
        timer = setTimeout(() => {
          mapRef.current.animateCamera(
            {
              center: {
                latitude: userAmenity.location.latitude,
                longitude: userAmenity.location.longitude,
              },
              zoom: 15,
            },
            { duration: 1000 }
          );
        }, 2000);
      }
    }
  
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [status, locateReport, dashboardReceiveReport, mapRef, userAmenity]);

  // Fetching Notifications Permission
  useEffect(() => {
    const configureNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access notifications was denied');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
    };
  
    configureNotifications();
  }, []);

  // Real-time listener from Amenity and Find User Amenity
  useEffect(() => {
    //mapStatus('loading');
    //loadingMsg('LOADING AMENITY');
    const unsubscribe = onSnapshot(collection(db, 'amenity'), snapshot => {
      const amenities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAmenityList(amenities); // Set All Amenities
      const matchedAmenity = amenities.find(amenity => amenity?.id === user?.amenity_id);
      if (matchedAmenity) {
        setUserAmenity(matchedAmenity); // Set Current User Amenity

        if (locateReport) {
          return;
        } else {
          if (mapRef.current) { // Move and Zoom Current User Amenity
            mapRef.current.animateToRegion({
              latitude: matchedAmenity.location.latitude,
              longitude: matchedAmenity.location.longitude,
              latitudeDelta: 0.12,
              longitudeDelta: 0.12,
            }, 1000);
          }
        }
      } else {
        //console.log('No matching amenity found');
      }
    }, error => {
      console.error('Error fetching amenities: ', error);
    });
    return () => unsubscribe();
  }, [user, locateReport]);

  // Function to send notifications
  const sendNotification = (report, type = 'new') => {
    const distance = getDistance(
      { latitude: userAmenity.location.latitude, longitude: userAmenity.location.longitude },
      { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
    );
    const estimatedArrivalTime = calculateETA(distance);

    const title = type === 'received' ? 'Report Received' : 'New Report Received';
    const body = type === 'received'
      ? `ID: #${report.report_id}  |  Reporter: ${report.user_report.full_name.first_name} ${report.user_report.full_name.last_name}\nDistance: ${distance > 1000 ? (distance / 1000).toFixed(2) + ' km' : distance + ' meters'}  |  ETA: ${estimatedArrivalTime} minutes`
      : `ID: #${report.report_id}  |  Reporter: ${report.user_report.full_name.first_name} ${report.user_report.full_name.last_name}\nDistance: ${distance > 1000 ? (distance / 1000).toFixed(2) + ' km' : distance + ' meters'}  |  ETA: ${estimatedArrivalTime} minutes`;

    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { reportID: report.report_id }
      },
      trigger: null, // Send immediately
    });
  };
  
  // Real-time listener for Reports
  useEffect(() => {
    //loadingMsg('LOADING REPORTS');
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reports = snapshot.docs.map(doc => {
        const report = doc.data();
        if (report.responder) {
          const { first_name, last_name } = report.responder.full_name;
          report.responder.full_name = `${first_name} ${last_name}`;
        }
        return report;
      });
      setReportsList(reports); // Set All Reports

      // Filter Reports based on RESPONDED STATUS
      const respondedReports = reports.filter(report => {
        return report.report_status === 'responded' && report.responder?.amenity?.id === userAmenity?.id;
      });
      setRespondedReports(respondedReports); // Set Responded Reports

      // Filter Reports based on RECEIVED STATUS and Same Handler as User's Amenity
      const receivedReports = reports.filter(report => {
        return report.report_status === 'received' && report.responder?.amenity?.id === userAmenity?.id;
      });
  
      // Check if there are Received Reports
      if (receivedReports.length > 0) {
        // If there are any received report
        setReports(receivedReports); // Set Reports to only the Received Report
        setStatus('eaglestoop'); // Set Status to Responding
        respoStatus('eaglestoop'); // Set Status Parent
        receivedReports.forEach(report => {
          /* if (!notifiedReports.has(report.report_id)) {
            sendNotification(report, 'received'); // Send Notification for Received Report
            setNotifiedReports(prev => new Set(prev).add(report.report_id)); // Add Notified Report for Avoiding Duplicate Notification
          } */
        });
        setRespondReport(receivedReports[0]);
        handleReportMarker(receivedReports[0], receivedReports[0].report_status);

        if (responderRoute.length === 0) {
          setResponderRoute(receivedReports[0].responder.route_coordinates);
        }

        if (receivedReports[0]?.responder?.route_time) {
          reportETA({
            time: receivedReports[0].responder.route_time?.time,
            eta: receivedReports[0].responder.route_time?.eta,
            distance: receivedReports[0].responder.route_time?.distance,
          });
        } else {
          return
        }
      } else {
        // If no received reports, filter reports based on WAITING status and nearest amenities logic
        const filteredReports = reports.filter(report => {
          if (report.report_status === 'waiting' && report.handler === userAmenity?.type) {
            setStatus('hawkwatch');
            respoStatus('hawkwatch')
            // Calculate distances to all amenities using geolib
            const distances = amenityList
              .filter(amenity => amenity.type === report.handler) // Filter by handler type
              .map(amenity => ({
                amenity,
                distance: getDistance(
                  { latitude: report.report_location.latitude, longitude: report.report_location.longitude },
                  { latitude: amenity.location.latitude, longitude: amenity.location.longitude }
                )
             }));
  
            // Sort by distance and get the 3 nearest amenities
            distances.sort((a, b) => a.distance - b.distance);
            const nearestAmenities = distances.slice(0, 3).map(d => d.amenity);
  
            // Check if userAmenity is one of the 3 nearest
            const nearbyReports = nearestAmenities.some(amenity => amenity.id === userAmenity.id);
            /* if (nearbyReports && !notifiedReports.has(report.report_id) && isResponder) {
              sendNotification(report); // Send Notification if New Report
              setNotifiedReports(prev => new Set(prev).add(report.report_id)); // Add Notified Report for Avoiding Duplicate Notification
            } */
            return nearbyReports;
          }
          return false;
        });
        setReports(filteredReports); // Set Filtered Reports = WAITING (TYPE) & NEAREST 3 AMENITIES
      }
    });
    return () => unsubscribe();
  }, [userAmenity, amenityList, isResponder, notifiedReports]);

  // Report Marker Function
  const handleReportMarker = async (report, status) => {
    if (status !== 'eaglestoop') {
      setSelectReport(report);
      reportStatus(status);
      reportID(reportID);
      selectedReport(report);
      reportVisible(true);

      if (status === 'received') {
        return;
      } else {
        await drawPath(
          { latitude: userAmenity.location.latitude, longitude: userAmenity.location.longitude },
          { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
        );
      }
    } else {
      return
    }
  };

  // Respond Map Function
  const handleMap = () => {
    if (selectReport && status !== 'eaglestoop') {
      setSelectReport(null);
      reportVisible(false);
      reportStatus(null);
    }
    setSelectedRespondedReport(null);
  };

  // Respond Button Function
  const handleResponse = async () => {
    if (selectReport && user && userAmenity) {
      const reportRef = doc(db, 'reports', selectReport.report_id);
  
      // Clear previous route
      setRouteCoordinates([]);
  
      if (responderLocation && selectReport) {
        await drawRespoPath(
          { latitude: responderLocation?.latitude, longitude: responderLocation?.longitude },
          { latitude: selectReport?.report_location?.latitude, longitude: selectReport?.report_location?.longitude },
          'drive',
          async (coordinates, formattedTime, totalDurationInMinutes, distanceInKilometers) => {
            // Responder Details To Be Recorded
            const responderDetails = {
              full_name: user.full_name,
              uid: user.uid,
              amenity: {
                id: userAmenity.id,
                name: userAmenity.name,
                description: userAmenity.description,
                type: userAmenity.type,
                address: userAmenity.address,
                location: userAmenity.location,
              },
              responder_status: 'departed',
              received_time: new Date(),
              responder_location: new GeoPoint(responderLocation.latitude, responderLocation.longitude),
              route_coordinates: coordinates, // Save route to the database
              route_time: {
                eta: totalDurationInMinutes, // ETA in minutes
                time: formattedTime, // Formatted time
                distance: distanceInKilometers, // Distance in kilometers
              },
            };
  
            setResponderRoute(coordinates); // Update state to draw route
            console.log(responderInstructions);
            navigatingMapView(responderLocation?.latitude, responderLocation?.longitude);
  
            // Update report status and save responder details
            await updateDoc(reportRef, {
              report_status: 'received',
              responder: responderDetails,
            });
  
            // Log for debugging
            console.log('Respo to Report ID:', selectReport.report_id);
            console.log('Route Time Data:', responderDetails.route_time);
  
            // Display Response Modal
            responseMsg({
              report: selectReport.report_type,
              id: selectReport.report_id,
              time: formattedTime,
              user: `${selectReport.user_report.full_name.first_name} ${selectReport.user_report.full_name.last_name}`,
              respo: selectReport,
            });
  
            reportID(selectReport.report_id);
            containID(selectReport.report_id);
            responseVisible(true);
  
            // Toggle Responding Process
            setStatus('eaglestoop'); // Set Status to Responding
            respoStatus('eaglestoop'); // Set Status Parent
  
            // Reset Selected Report
            setSelectReport(null);
  
            // Receive Report From Dashboard
            if (dashboardReceiveReport) {
              setDashboardReceiveReport(null);
            }
          }
        );
      }
    }
  };

  // Arrival Button Function
  const handleArrival = async () => {
    try {
      if (!respondReport) {
        console.error('No report to respond to.');
        return;
      }
  
      const reportRef = doc(db, 'reports', respondReport.report_id);
      const reportSnap = await getDoc(reportRef); // Fetch the current report document
  
      if (!reportSnap.exists()) {
        console.error("No such document exists!");
        return;
      }
  
      const arrivalTime = new Date();
      const reportData = reportSnap.data();
      const existingResponder = reportSnap.data().responder || {}; // Get the existing report responder details

      const receivedTime = existingResponder.received_time?.toDate(); // Convert Firestore timestamp to Date
      if (!receivedTime) {
        console.error('No received_time found in the report.');
        return;
      }

      const timeDifferenceMs = arrivalTime - receivedTime;
      const timeDifferenceMinutes = Math.round(timeDifferenceMs / 6000) / 10; // Convert milliseconds to minutes and round to 1 decimal place

      // Format the time difference as a string (e.g., "4.5 minutes")
      const timeDifferenceStr = `${timeDifferenceMinutes} minutes`;

      arrivalMsg({
        report: respondReport.report_type,
        id: respondReport.report_id,
        time: timeDifferenceStr, // Include the time difference in the arrival message
        user: `${respondReport.user_report.full_name.first_name} ${respondReport.user_report.full_name.last_name}`
      });
      containID(respondReport.report_id);
      arrivalVisible(true);

      setResponderRoute([]);

      respoStatus('duckperched');

      const updatedResponder = {
        ...existingResponder,
        arrival_time: arrivalTime,
        responder_status: 'arrived'
      }; // Update the existing report responder details
  
      // Update the status
      await updateDoc(reportRef, {
        report_status: 'responded',
        responder: updatedResponder
      });
  
      setRespondReport(null); // Clear the respond report state
    } catch (error) {
      console.error('Error handling arrival:', error);
    }
  };

  useEffect(() => {
    if (reports && userAmenity && !loadingStatus) {
      //mapStatus('success');
      //successMsg('MARKERS LOADED');
      setLoadingStatus(true);
    }
  });

  // Map View Navigation View
  const navigatingMapView = (latitude, longitude) => {
    mapRef.current.animateCamera({
      center: { latitude, longitude },
      zoom: 20, // Adjust zoom level as needed
      heading: 0, // Set heading if you want a specific orientation
      pitch: 45, // Set pitch for a tilted view
    });
  };

  // Drawing Route using GraphHopper
  const drawRoute = async (start, end, mode = 'car', callback) => {
    console.log('API Called');
    try {
      const apiKey = getApiKey();
      const response = await fetch(
        `https://graphhopper.com/api/1/route?point=${start.latitude},${start.longitude}&point=${end.latitude},${end.longitude}&vehicle=${mode}&locale=en&key=${apiKey}&points_encoded=false&simplify=false`
      );
      const data = await response.json();
  
      if (data.paths && data.paths.length > 0) {
        const coordinates = data.paths[0].points.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        })); // Transform [lon, lat] to [latitude, longitude]
  
        setRouteCoordinates(coordinates); // Update state to draw route
  
        if (callback) {
          callback(coordinates); // Pass coordinates to callback if provided
        }
      } else {
        console.error('No routes found');
      }
    } catch (error) {
      if (error.response && error.response.status === 429) { // Rate limit exceeded
        console.log('Rate limit exceeded, switching API key');
        return drawRoute(start, end, mode, callback); // Retry with the next API key
      } else {
        console.error('Error fetching route:', error);
      }
    }
  };

  // Drawing Route using Geoapify
  const drawPath = async (start, end, mode = 'drive', callback) => {
    setDestination(end);
    console.log('Geoapify API Called');
    try {
      const apiKey = geoapifyApiKey; // Replace with your Geoapify API Key
      const url = `https://api.geoapify.com/v1/routing?waypoints=${start.latitude},${start.longitude}|${end.latitude},${end.longitude}&mode=${mode}&apiKey=${apiKey}`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        console.error(`Geoapify API error: ${response.status} ${response.statusText}`);
        return;
      }
  
      const data = await response.json();
  
      if (!data.features || data.features.length === 0) {
        console.error('No features found in Geoapify response');
        return;
      }
  
      // Extract and format coordinates
      const coordinates = data.features[0].geometry.coordinates.flatMap(coord => {
        if (Array.isArray(coord) && coord.length === 2) {
          return [
            {
              latitude: coord[1],
              longitude: coord[0],
            },
          ];
        } else if (Array.isArray(coord) && Array.isArray(coord[0])) {
          return coord.map(innerCoord => ({
            latitude: innerCoord[1],
            longitude: innerCoord[0],
          }));
        } else {
          console.error('Unexpected coord format:', coord);
          return [];
        }
      });
  
      // Extract total duration for ETA
      const totalDurationInSeconds = data.features[0].properties.time; // Total duration in seconds
      const totalDistanceInMeters = data.features[0].properties.distance; // Total distance in meters
  
      // Calculate ETA
      const currentTime = new Date();
      const estimatedArrivalTime = new Date(currentTime.getTime() + totalDurationInSeconds * 1000);
  
      // Format time to "HH:MM" in 12-hour format without AM/PM
      const hours = estimatedArrivalTime.getHours();
      const minutes = estimatedArrivalTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${(hours % 12) || 12}:${minutes}`;
  
      // Format duration as "X.Y minutes"
      const totalDurationInMinutes = (totalDurationInSeconds / 60).toFixed(1); // 1 decimal place
  
      // Convert distance to kilometers
      const distanceInKilometers = (totalDistanceInMeters / 1000).toFixed(1); // 1 decimal place
  
      // Extract Instructions from coordinates
      const instructions = data.features[0].properties.legs?.flatMap(leg =>
        leg.steps?.map(step => ({
          text: step.instruction?.text || 'No instruction text available',
          distance: step.distance || 0,
          duration: step.duration || 0,
          startLocation: step.start_location
            ? {
                latitude: step.start_location.lat,
                longitude: step.start_location.lon,
              }
            : null,
          endLocation: step.end_location
            ? {
                latitude: step.end_location.lat,
                longitude: step.end_location.lon,
              }
            : null,
        })) || []
      );

      setRouteCoordinates(coordinates); // Update state to draw route
      setResponderInstructions(instructions); // Update and Store Instructions
  
      // Update the selectedReportETA state
      reportETA({
        time: formattedTime,
        eta: totalDurationInMinutes,
        distance: distanceInKilometers,
      });
  
      /* console.log(`ETA Time: ${formattedTime}`); // Log the formatted ETA time
      console.log(`ETA Duration: ${totalDurationInMinutes} minutes`); // Log the formatted duration
      console.log(`Total Distance: ${distanceInKilometers} km`); // Log the formatted distance */
  
      // Invoke the callback with the coordinates, formatted time, duration, and distance
      if (callback) {
        callback(coordinates, formattedTime, totalDurationInMinutes, distanceInKilometers);
      }
    } catch (error) {
      console.error('Error fetching Geoapify route:', error);
    }
  };

  // Reroute Responder Route
  const drawRespoPath = async (start, end, mode = 'drive', callback) => {
    setDestination(end);
    console.log('Geoapify API Called');
    try {
      const apiKey = geoapifyApiKey; // Replace with your Geoapify API Key
      const url = `https://api.geoapify.com/v1/routing?waypoints=${start.latitude},${start.longitude}|${end.latitude},${end.longitude}&mode=${mode}&apiKey=${apiKey}`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        console.error(`Geoapify API error: ${response.status} ${response.statusText}`);
        return;
      }
  
      const data = await response.json();
  
      if (!data.features || data.features.length === 0) {
        console.error('No features found in Geoapify response');
        return;
      }
  
      // Extract and format coordinates
      const coordinates = data.features[0].geometry.coordinates.flatMap(coord => {
        if (Array.isArray(coord) && coord.length === 2) {
          return [
            {
              latitude: coord[1],
              longitude: coord[0],
            },
          ];
        } else if (Array.isArray(coord) && Array.isArray(coord[0])) {
          return coord.map(innerCoord => ({
            latitude: innerCoord[1],
            longitude: innerCoord[0],
          }));
        } else {
          console.error('Unexpected coord format:', coord);
          return [];
        }
      });
  
      // Extract total duration for ETA
      const totalDurationInSeconds = data.features[0].properties.time; // Total duration in seconds
      const totalDistanceInMeters = data.features[0].properties.distance; // Total distance in meters
  
      // Calculate ETA
      const currentTime = new Date();
      const estimatedArrivalTime = new Date(currentTime.getTime() + totalDurationInSeconds * 1000);
  
      // Format time to "HH:MM" in 12-hour format without AM/PM
      const hours = estimatedArrivalTime.getHours();
      const minutes = estimatedArrivalTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${(hours % 12) || 12}:${minutes}`;
  
      // Format duration as "X.Y minutes"
      const totalDurationInMinutes = (totalDurationInSeconds / 60).toFixed(1); // 1 decimal place
  
      // Convert distance to kilometers
      const distanceInKilometers = (totalDistanceInMeters / 1000).toFixed(1); // 1 decimal place
  
      // Extract Instructions from coordinates
      const instructions = data.features[0].properties.legs?.flatMap(leg =>
        leg.steps?.map(step => ({
          text: step.instruction?.text || 'No instruction text available',
          distance: step.distance || 0,
          duration: step.duration || 0,
          startLocation: step.start_location
            ? {
                latitude: step.start_location.lat,
                longitude: step.start_location.lon,
              }
            : null,
          endLocation: step.end_location
            ? {
                latitude: step.end_location.lat,
                longitude: step.end_location.lon,
              }
            : null,
        })) || []
      );

      setResponderRoute(coordinates); // Update state to draw route
      setResponderInstructions(instructions); // Update and Store Instructions
  
      // Update the selectedReportETA state
      reportETA({
        time: formattedTime,
        eta: totalDurationInMinutes,
        distance: distanceInKilometers,
      });
  
      /* console.log(`ETA Time: ${formattedTime}`); // Log the formatted ETA time
      console.log(`ETA Duration: ${totalDurationInMinutes} minutes`); // Log the formatted duration
      console.log(`Total Distance: ${distanceInKilometers} km`); // Log the formatted distance */
  
      // Invoke the callback with the coordinates, formatted time, duration, and distance
      if (callback) {
        callback(coordinates, formattedTime, totalDurationInMinutes, distanceInKilometers);
      }
    } catch (error) {
      console.error('Error fetching Geoapify route:', error);
    }
  };  

  // Recording Responder Location
  /* useEffect(() => {
    if (status !== 'eaglestoop') {
      return;
    }

    let updateInterval;
    let prevLocation = null;

    const updateResponderLocation = async (newLocation, reportRef) => {
      console.log('Updating responder location:', newLocation); // Log new location
      const responderLocation = new GeoPoint(newLocation.latitude, newLocation.longitude);
      await updateDoc(reportRef, {
        'responder.responder_location': responderLocation,
      });
      console.log('Responder location updated in Firestore');
    };

    const checkAndUpdateLocation = async (newLocation, reportRef) => {
      if (prevLocation) {
        const distance = getDistance(
          { latitude: prevLocation.latitude, longitude: prevLocation.longitude },
          { latitude: newLocation.latitude, longitude: newLocation.longitude }
        );

        console.log('Distance moved:', distance); // Log distance moved

        if (distance > 5) { // If moved more than 5 meters
          await updateResponderLocation(newLocation, reportRef);
          prevLocation = newLocation; // Update the previous location
        }
      } else {
        await updateResponderLocation(newLocation, reportRef);
        prevLocation = newLocation;
      }
    };

    console.log('Status is eaglestoop, starting location update interval'); // Log status check
    updateInterval = setInterval(async () => {
      if (responderLocation) {
        const newLocation = {
          latitude: responderLocation.latitude,
          longitude: responderLocation.longitude,
        };
        const reportRef = doc(db, 'reports', respondReport.report_id);
        await checkAndUpdateLocation(newLocation, reportRef);
      }
    }, 2000); // 2 seconds

    return () => {
      console.log('Clearing update interval'); // Log interval clearance
      clearInterval(updateInterval); // Clear the interval
    };
  }, [status, responderLocation, respondReport]); */

  // Calling API If Responder Location Changed
  /* useEffect(() => {
    if (status !== 'eaglestoop') {
      return;
    }
  
    let drawPathInterval;
    let prevLocation = null; // Track the responder's last location
    const pathUpdateThreshold = 0; // Distance threshold to trigger API call (greater than 0 meters)
  
    const drawRoutePath = async (newLocation, respondReport) => {
      const distanceMoved = prevLocation
        ? getDistance(
            { latitude: prevLocation.latitude, longitude: prevLocation.longitude },
            { latitude: newLocation.latitude, longitude: newLocation.longitude }
          )
        : pathUpdateThreshold + 1; // Force the first update
  
      // Update the path only if the responder has moved any distance (greater than 0 meters)
      if (distanceMoved > pathUpdateThreshold) {
        await drawRespoPath(
          { latitude: newLocation.latitude, longitude: newLocation.longitude },
          { latitude: respondReport.report_location.latitude, longitude: respondReport.report_location.longitude },
          'drive',
          (coordinates, time, eta, distance) => {
            console.log('Route updated:', coordinates, time, eta, distance);
  
            // Update route_coordinates in the Firestore database
            const reportRef = doc(db, 'reports', respondReport.report_id);
            updateDoc(reportRef, {
              'responder.route_coordinates': coordinates,
            });
  
            // Check if responder has arrived at the destination
            if (
              getDistance(newLocation, {
                latitude: respondReport.report_location.latitude,
                longitude: respondReport.report_location.longitude,
              }) < 10 // 10 meters
            ) {
              handleArrival(); // Handle arrival logic
            }
          }
        );
  
        // Update tracking variables
        prevLocation = newLocation; // Update the previous location
      }
    };
  
    if (status === 'eaglestoop') {
      console.log('Status is eaglestoop, starting draw path interval');
      drawPathInterval = setInterval(async () => {
        if (responderLocation) {
          const newLocation = {
            latitude: responderLocation.latitude,
            longitude: responderLocation.longitude,
          };
          await drawRoutePath(newLocation, respondReport);
        }
      }, 2000); // Update interval
    }
  
    return () => {
      console.log('Clearing draw path interval');
      clearInterval(drawPathInterval);
    };
  }, [status, responderLocation, respondReport]); */

  /* useEffect(() => {
    if (!responderRoute || responderRoute.length === 0 || progress >= 100) return;
  
    const updateProgress = () => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1; // Adjust this to change the speed of the simulation
        return Math.min(newProgress, 100);
      });
    };
  
    const updatePolyline = () => {
      const travelDistance = (progress / 100) * responderRoute.length;
      const updatedCoordinates = responderRoute.slice(0, Math.ceil(travelDistance)); // Use Math.ceil to ensure it moves forward incrementally
      setPolylineCoordinates(updatedCoordinates);
    };
  
    const updateInstructions = () => {
      if (!responderLocation || !responderInstructions) return;
  
      const currentDistance = (progress / 100) * responderRoute.length;
      const nextInstruction = responderInstructions.find((instruction) => {
        if (instruction.startLocation) {
          const distanceToStart = getDistance(
            { latitude: responderLocation.latitude, longitude: responderLocation.longitude },
            { latitude: instruction.startLocation.latitude, longitude: instruction.startLocation.longitude }
          );
          return distanceToStart <= maxDisplayDistance;
        }
        return false; // Skip instructions without valid start locations
      });
  
      if (nextInstruction) {
        const distanceToStart = getDistance(
          { latitude: responderLocation.latitude, longitude: responderLocation.longitude },
          { latitude: nextInstruction.startLocation.latitude, longitude: nextInstruction.startLocation.longitude }
        );
  
        // Update the current instruction and distance if it changes
        if (
          nextInstruction.text !== currentInstruction.text ||
          (distanceToStart > proximityThreshold && distanceToStart !== currentInstruction.turnDistance)
        ) {
          const formattedDistance =
            distanceToStart > 1609.34
              ? `${(distanceToStart / 1609.34).toFixed(1)} mi`
              : `${distanceToStart.toFixed(0)} m`;
  
          setCurrentInstruction({
            text: nextInstruction.text,
            turnDistance: formattedDistance,
          });
  
          respoInstruction({
            text: nextInstruction.text,
            turnDistance: formattedDistance,
          });
        }
  
        // Switch to the next instruction if within the proximity threshold
        if (distanceToStart <= proximityThreshold) {
          const nextIndex = responderInstructions.indexOf(nextInstruction) + 1;
          if (nextIndex < responderInstructions.length) {
            const upcomingInstruction = responderInstructions[nextIndex];
  
            setCurrentInstruction({
              text: upcomingInstruction.text,
              turnDistance: `${(getDistance(
                { latitude: responderLocation.latitude, longitude: responderLocation.longitude },
                { latitude: upcomingInstruction.startLocation.latitude, longitude: upcomingInstruction.startLocation.longitude }
              ) / 1609.34).toFixed(1)} mi`,
            });
  
            respoInstruction({
              text: upcomingInstruction.text,
              turnDistance: `${(getDistance(
                { latitude: responderLocation.latitude, longitude: responderLocation.longitude },
                { latitude: upcomingInstruction.startLocation.latitude, longitude: upcomingInstruction.startLocation.longitude }
              ) / 1609.34).toFixed(1)} mi`,
            });
          }
        }
      }
    };
  
    // Update every interval (simulate every second or adjust as needed)
    const travelInterval = setInterval(() => {
      if (progress < 100) {
        updateProgress();
        updatePolyline();
        updateInstructions(); // Sync instructions with progress
      } else {
        clearInterval(travelInterval);
      }
    }, 1000); // Adjust interval to simulate real-time travel speed
  
    return () => clearInterval(travelInterval); // Cleanup on unmount or when progress reaches 100%
  }, [responderRoute, progress, responderLocation, responderInstructions, currentInstruction]); */

  const findClosestPointIndex = (currentLocation, route) => {
    let closestIndex = 0;
    let minDistance = Infinity;
  
    route.forEach((point, index) => {
      const distance = getDistance(
        { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
        { latitude: point.latitude, longitude: point.longitude }
      );
  
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
  
    return closestIndex;
  };

  useEffect(() => {
    if (
      status === 'eaglestoop' &&
      responderLocation &&
      Array.isArray(responderRoute) &&
      responderRoute.length > 0
    ) {
      const closestIndex = findClosestPointIndex(responderLocation, responderRoute);
  
      // Only update if the truncated route is different
      if (closestIndex > 0 && closestIndex < responderRoute.length) {
        const newRoute = responderRoute.slice(closestIndex);
        if (JSON.stringify(newRoute) !== JSON.stringify(responderRoute)) {
          setResponderRoute(newRoute);
        }
      }
    }
  }, [status, responderLocation]);  
  
  const reRoute = async () => {
    if (!responderLocation || !respondReport) {
      console.error('Responder location or report data is missing!');
      return;
    }
  
    console.log('Re-routing...');
  
    await drawRespoPath(
      { latitude: responderLocation.latitude, longitude: responderLocation.longitude },
      { latitude: respondReport.report_location.latitude, longitude: respondReport.report_location.longitude },
      'drive',
      (coordinates, formattedTime, eta, distance) => {
        console.log('Re-route completed:', { coordinates, formattedTime, eta, distance });
  
        // Update Firestore with new route coordinates
        const reportRef = doc(db, 'reports', respondReport.report_id);
        updateDoc(reportRef, {
          'responder.route_coordinates': coordinates,
        });
      }
    );
  };

  useImperativeHandle(ref, () => ({
    handleResponse, handleArrival, reRoute,
    handleFocus: () => {
      if (userAmenity && mapRef.current) {
          mapRef.current.animateCamera(
              {
                  center: {
                      latitude: userAmenity.location.latitude,
                      longitude: userAmenity.location.longitude,
                  },
                  zoom: 15, // Adjust zoom level as needed
              },
              { duration: 1000 } // Duration of animation in ms
          );
      }
    },
  }));


  return (
    <View>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: userAmenity ? userAmenity.location.latitude : 14.280289476946388,
          longitude: userAmenity ? userAmenity.location.longitude : 120.99322984482292,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={default_theme}
        showsMyLocationButton={false}
        zoomControlEnabled={false}
        toolbarEnabled={false}
        showsBuildings={false}
        showsCompass={false}
        showsTraffic={status === 'eaglestoop'}
        onPress={handleMap}
      >
        {userAmenity && (
          <Marker
            coordinate={{
              latitude: userAmenity?.location?.latitude,
              longitude: userAmenity?.location?.longitude,
            }}
            image={
              userAmenity.type === 'police'
                ? require('../../assets/icons/police-station-marker.png')
                : userAmenity.type === 'disaster'
                ? require('../../assets/icons/disaster-station-marker.png')
                : userAmenity.type === 'barangay'
                ? require('../../assets/icons/barangay-station-marker.png')
                : require('../../assets/icons/fire-station-marker.png') // default icon
            }
            title={userAmenity.name}
            description={userAmenity.description}
          />
        )}
        {status === 'eaglestoop' && responderLocation?.latitude && responderLocation?.longitude && (
          <Marker
            coordinate={
              responderLocation.latitude && responderLocation.longitude
                ? {
                  latitude: responderLocation?.latitude,
                  longitude:responderLocation?.longitude
                }
                : { latitude: 0, longitude: 0 }
            }
            anchor={{ x: 0.5, y: 0.5 }}
            image={
              userAmenity.type === 'police'
                ? require('../../assets/icons/police-navigation.png')
                : userAmenity.type === 'disaster'
                ? require('../../assets/icons/disaster-navigation.png')
                : userAmenity.type === 'barangay'
                ? require('../../assets/icons/barangay-navigation.png')
                : require('../../assets/icons/bfp-navigation.png') // default icon
            }
          />
        )}
        {reports.map(report => (
          <Marker
            key={report.report_id}
            coordinate={{
              latitude: report.report_location.latitude,
              longitude: report.report_location.longitude,
            }}
            image={
              report.report_status === 'received' ? 
              (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-received-marker-select.png') : require('../../assets/icons/report-received-marker.png'))
                : report.report_status === 'resolved'
                ? (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-resolved-marker-select.png') : require('../../assets/icons/report-resolved-marker.png'))
                : (selectReport?.report_id === report.report_id ? require('../../assets/icons/report-waiting-marker-select.png') : require('../../assets/icons/report-waiting-marker.png')) // default icon
            }
            onPress={() => {
              handleReportMarker(report, (report.report_status === 'received' ? 'received' : 'waiting'));
            }}
          />
        ))}
        {status !== 'eaglestoop' && respondedReports.map(report => (
          <Marker
            key={report.report_id}
            coordinate={{
              latitude: report.report_location.latitude,
              longitude: report.report_location.longitude,
            }}
            image={
              selectReport?.report_id === report.report_id
                ? require('../../assets/icons/report-responded-marker-select.png')
                : require('../../assets/icons/report-responded-marker.png')
            }
            onPress={() => handleReportMarker(report, 'responded')}
          />
        ))}
        {status !== 'eaglestoop' && routeCoordinates && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#57b378"
            strokeWidth={5}
            lineDashPattern={[5, 5]}
          />
        )}
        {responderRoute && responderRoute.length > 0 && (
          <Polyline
            coordinates={responderRoute}
            strokeWidth={5}
            strokeColor="#42e3a8"
          />
        )}
      </MapView>
    </View>
  );
})

export default RespondMap;
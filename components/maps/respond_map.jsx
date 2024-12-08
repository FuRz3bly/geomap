import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useCallback, useRef } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import MapView, { Marker, Polygon, Callout, Circle, AnimatedRegion } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications'
import { getDistance, getPreciseDistance } from 'geolib';
import { router } from 'expo-router';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
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

const RespondMap = forwardRef(({ mapStatus, loadingMsg, successMsg, failMsg, userLocation, reportID, selectedReport, reportVisible, respoStatus, reportStatus, responseVisible, arrivalVisible, responseMsg, arrivalMsg }, ref) => {
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
  // Notification Based Variables
  const [notifiedReports, setNotifiedReports] = useState(new Set()); // Notification Traker
  // Amenities Variables
  const [userAmenity, setUserAmenity] = useState(null); // User's Amenity Container
  const [amenityList, setAmenityList] = useState([]); // All Amenities Container
  const [status, setStatus] = useState('hawkwatch'); // Status of the User Container - hawkwatch (searching), eaglestoop (responding), duckperched (arrival)
  const [loadingStatus, setLoadingStatus] = useState(false);
  //const [amenityLocation, setAmenityLocation] = useState(null); // The location of the user's Amenity Container
  // Reports Variables
  const [reports, setReports] = useState([]); // All Reports Container
  const [respondedReports, setRespondedReports] = useState([]); // All Recent Responded Reports
  const [reportsList, setReportsList] = useState([]); // All Reports Container
  const [selectReport, setSelectReport] = useState(null); // Selected Report Container
  const [selectedRespondedReport, setSelectedRespondedReport] = useState(null); // Selected Responded Report Container
  const [respondReport, setRespondReport] = useState(null); // Responded Report Container
  // Reference Variables
  const mapRef = useRef(null); // Map View Reference

  // Calculate Estimated Time of Arrival (ETA)
  const calculateETA = (distance) => {
    const averageSpeed = 20; // km/h
    const time = distance / 1000 / averageSpeed * 60; // in minutes
    return Math.round(time);
  };

  // Fetching Location Function
  const fetchLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    userLocation(location.coords);
  }, []);
  
  // Fetching the Location
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

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
        if (mapRef.current) { // Move and Zoom Current User Amenity
          mapRef.current.animateToRegion({
            latitude: matchedAmenity.location.latitude,
            longitude: matchedAmenity.location.longitude,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
          }, 1000);
        }
      } else {
        //console.log('No matching amenity found');
      }
    }, error => {
      console.error('Error fetching amenities: ', error);
    });
    return () => unsubscribe();
  }, [user]);

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
          if (!notifiedReports.has(report.report_id)) {
            sendNotification(report, 'received'); // Send Notification for Received Report
            setNotifiedReports(prev => new Set(prev).add(report.report_id)); // Add Notified Report for Avoiding Duplicate Notification
          }
        });
        setRespondReport(receivedReports[0]);
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
            if (nearbyReports && !notifiedReports.has(report.report_id) && isResponder) {
              sendNotification(report); // Send Notification if New Report
              setNotifiedReports(prev => new Set(prev).add(report.report_id)); // Add Notified Report for Avoiding Duplicate Notification
            }
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
  const handleReportMarker = (report, status) => {
    if (status !== 'eaglestoop') {
      setSelectReport(report);
      reportStatus(status);
      reportID(reportID);
      selectedReport(report);
      reportVisible(true);
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
          location: userAmenity.location
        },
        responder_status: 'departed',
        received_time: new Date()
      };
      // Change report_status to 'waiting' to 'received'
      await updateDoc(reportRef, {
        report_status: 'received',
        responder: responderDetails
      });
      // Finding the Distance from Report to User's Amenity
      const distance = getPreciseDistance(
        { latitude: userAmenity.location.latitude, longitude: userAmenity.location.longitude },
        { latitude: selectReport.report_location.latitude, longitude: selectReport.report_location.longitude }
      );
      const estimatedArrivalTime = calculateETA(distance);
      console.log('Respo to Report ID: ', selectReport.report_id);
      // Display Response Modal
      responseMsg({ report: selectReport.report_type, id: selectReport.report_id, time: estimatedArrivalTime, user: `${selectReport.user_report.full_name.first_name} ${selectReport.user_report.full_name.last_name}`, respo: selectReport });
      reportID(selectReport.report_id);
      containID(selectReport.report_id);
      responseVisible(true);
      // Toggle Responding Process
      setStatus('eaglestoop'); // Set Status to Responding
      respoStatus('eaglestoop'); // Set Status Parent
      // Reset Selected Report
      setSelectReport(null);
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

  useImperativeHandle(ref, () => ({
    handleResponse, handleArrival,
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

  useEffect(() => {
    if (reports && userAmenity && !loadingStatus) {
      //mapStatus('success');
      //successMsg('MARKERS LOADED');
      setLoadingStatus(true);
    }
  });

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
        onPress={handleMap}
      >
        {userAmenity && (
          <Marker
            coordinate={{
              latitude: userAmenity.location.latitude,
              longitude: userAmenity.location.longitude,
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
        {/* {amenityList.map(amenity => (
          <Marker
            key={amenity.id}
            coordinate={{
              latitude: amenity.location.latitude,
              longitude: amenity.location.longitude,
            }}
            title={amenity.name}
            description={amenity.description}
            pinColor={'tan'}
          />
        ))} */}
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
            onPress={() => handleReportMarker(report, (report.report_status === 'received' ? 'received' : 'waiting'))}
          />
        ))}
        {respondedReports.map(report => (
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
      </MapView>
    </View>
  );
})

export default RespondMap;
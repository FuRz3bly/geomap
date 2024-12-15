import React, { forwardRef, useImperativeHandle, useEffect, useState, useContext, useCallback, useRef, useMemo } from 'react';
import { View, Text, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Heatmap, Circle } from 'react-native-maps';
import { getPreciseDistance, getDistance } from 'geolib';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

import UserContext from '../UserContext';
import ToolsContext from '../ToolsContext';
import { translate, containID, setTitle } from '../ToolsContext';

import { images, icons } from '../../constants';
import { default_theme, night_theme, wasp_theme, intensity_theme } from '../../components/maps/themes';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

const IntensityMap = ({ mapStatus, loadingMsg, successMsg, failMsg, visibleCategories, updateCategory, categoryState }) => {
    // Global Variables
    const { dictionary, turnEIM, setRespo, resolved, setResolved } = useContext(ToolsContext);
    const [location, setLocation] = useState(null); // User Location Container
    const [errorMsg, setErrorMsg] = useState(null); // Error Message Container
    // Flag to track if alert has been shown
    const [alertShown, setAlertShown] = useState({
        fire: false,
        traffic: false,
        safety: false,
        theft: false,
        shooting: false,
        disaster: false
    });
    const notificationQueue = []; // Limit notification to 4
    // Heatmap Variables
    const [allReports, setAllReports] = useState(null); // All Reports Container
    // Category Data Variable
    const [categoryData, setCategoryData] = useState({
        fire: {
            reports: null,
            description: null,
            gradient: ['#eab02a', '#f39f37', '#f08543', '#ed6b4e', '#de5054'],
            altGradient: ['#fae100', '#e58800', '#d45800', '#b31f11', '#9d0eb1'],
            proximityDistance: 100
        },
        traffic: {
            reports: null,
            description: null,
            gradient: ['#7ef29d', '#61cea1', '#48afa3', '#2a89a6', '#0f68a9'],
            proximityDistance: 100
        },
        safety: {
            reports: null,
            description: null,
            gradient: ['#f4f269', '#cfe26b', '#c4db6b', '#86c46e', '#5cb270'],
            proximityDistance: 100
        },
        theft: {
            reports: null,
            description: null,
            gradient: ['#4dc9e6', '#3f8dd4', '#3665c9', '#2b37bb', '#210cae'],
            proximityDistance: 100
        },
        shooting: {
            reports: null,
            description: null,
            gradient: ['#fc4778', '#c64a9b', '#ac4bab', '#714ed1', '#4951ea'],
            proximityDistance: 100
        },
        disaster: {
            reports: null,
            description: null,
            gradient: ['#9bae89', '#8da479', '#6e8d56', '#416d24', '#245804'],
            proximityDistance: 100
        }
    });
    // Weight Data
    const weightCategory = {
        fire: {
            structural_fire: 10,
            vehicular_fire: 6,
            fire_rescue: 5,
            explosion: 8,
            wildfire: 9,
            default: 1
        },
        traffic: {
            traffic_accident: 10,
            vehicular_fire: 6,
            default: 1
        },
        safety: {
            personal_safety: 5,
            assault: 10,
            public_disturbance: 8,
            noise: 4
        },
        theft: {
            robbery: 10,
            theft: 5
        },
        shooting: {
            active_shooting: 10
        },
        disaster: {
            disaster_accident: 10
        }
    }

    // Fetching Location Function
    const fetchLocation = useCallback(async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
    }, []);

    // Group Reports by Proximity
    const compressReports = (reports, proximityDistance = 100) => {
        const groupedReports = [];
    
        reports.forEach(report => {
            // Find existing group within proximity
            let foundGroup = groupedReports.find(group => {
                const distance = getPreciseDistance(
                    { latitude: group.latitude, longitude: group.longitude },
                    { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
                );
                return distance < proximityDistance; // Group if within proximityDistance
            });
    
            if (foundGroup) {
                foundGroup.reports.push(report); // Add to existing group
            } else {
                // Create a new group
                groupedReports.push({
                    latitude: report.report_location.latitude,
                    longitude: report.report_location.longitude,
                    reports: [report]
                });
            }
        });
    
        return groupedReports;
    }; // For Callout and Display

    // Fetching user location
    useEffect(() => {
        mapStatus('loading');
        loadingMsg('FETCHING LOCATION');
        fetchLocation();
    }, [fetchLocation]);

    // Real-time listener for Reports
    useEffect(() => {
        loadingMsg('RETRIEVING REPORTS');
        const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
            const reportsList = snapshot.docs.map(doc => doc.data());
    
            // Get the current date and month
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
    
            // Function to check if a report is from the current month
            const isReportFromCurrentMonth = (report) => {
                const reportDate = new Date(report.date); // Assuming `report.date` is a valid date string
                return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
            };
    
            // Separate and update each category's reports
            const updatedData = { ...categoryData };
            Object.keys(updatedData).forEach(category => {
                const filterCriteria = {
                    fire: report => dictionary.fire_category.includes(report.report_type),
                    traffic: report => dictionary.traffic_category.includes(report.report_type),
                    safety: report => dictionary.safety_category.includes(report.report_type),
                    theft: report => dictionary.theft_category.includes(report.report_type),
                    shooting: report => dictionary.shooting_category.includes(report.report_type),
                    disaster: report => dictionary.disaster_category.includes(report.report_type)
                };
            
                const filteredReports = reportsList
                    .filter(filterCriteria[category] || (() => false))
                    .filter(isReportFromCurrentMonth); // Apply the date filter
    
                updatedData[category].reports = filteredReports || [];
                updatedData[category].description = compressReports(filteredReports, updatedData[category].proximityDistance) || [];
    
                const newData = {
                    category: filteredReports,
                    pallete: categoryData[category].gradient
                };
                updateCategory(category, newData);
            });
            setCategoryData(updatedData);
        });
        return () => unsubscribe();
    }, []);

    // Send Notification Function
    const sendNotification = async (title, message, reportType, distance) => {
        notificationQueue.push({ title, message, reportType, distance });
        if (notificationQueue.length > 4) {
            notificationQueue.shift(); // Remove the oldest notification
        }
    
        for (const notification of notificationQueue) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: notification.title,
                    body: notification.message,
                    data: { reportType: notification.reportType, distance: notification.distance },
                },
                trigger: { seconds: 1 },
            });
        }
    };

    // Check for high heat points and show alert on map load or when turning on EIM
    useEffect(() => {
        if (location) {
            const userLocation = { latitude: location.latitude, longitude: location.longitude };
    
            // Define distance thresholds (in meters)
            const dangerouslyCloseDistance = 50;
            const nearDistance = 100;
    
            // Iterate over each category in categoryData
            Object.keys(categoryData).forEach(async (category) => {
                const categoryInfo = categoryData[category];
                const nearestReport = categoryInfo.reports && categoryInfo.reports.reduce((nearest, report) => {
                    const reportLocation = {
                        latitude: report.report_location.latitude,
                        longitude: report.report_location.longitude,
                    };
                    const distance = getPreciseDistance(userLocation, reportLocation);
                    return !nearest || distance < nearest.distance ? { report, distance } : nearest;
                }, null);
    
                // If there's a report within the category's proximity distance, send a notification
                if (nearestReport && nearestReport.distance < categoryInfo.proximityDistance && !alertShown[category]) {
                    setAlertShown((prev) => ({ ...prev, [category]: true }));
    
                    // Determine the warning level based on distance
                    let title, message;
                    const distanceMessage = nearestReport.distance >= 1000
                        ? `${(nearestReport.distance / 1000).toFixed(2)} kilometers away`
                        : `${nearestReport.distance} meters away`;
    
                    if (nearestReport.distance <= dangerouslyCloseDistance) {
                        title = "Danger!";
                        message = `Multiple Cases: ${translate(nearestReport.report.report_type)} | Distance: ${distanceMessage}`;
                    } else if (nearestReport.distance <= nearDistance) {
                        title = "Exercise Caution!";
                        message = `Multiple Cases: ${translate(nearestReport.report.report_type)} | Distance: ${distanceMessage}`;
                    } else {
                        title = "Safety Alert!";
                        message = `${translate(nearestReport.report.report_type)} | Distance: ${distanceMessage}`;
                    }
    
                    // Trigger notification
                    await sendNotification(title, message, nearestReport.report.report_type, nearestReport.distance);
    
                    // Reset the alert flag after notification
                    setAlertShown((prev) => ({ ...prev, [category]: false }));
                }
            });
        }
        mapStatus('success');
        successMsg('HEAT MAP LOADED')
    }, [location, categoryData]);

    // Passive Functions
    // Generating All Heatmap Points Per Category
    const categoryPoints = useMemo(() => {
        return Object.keys(categoryData).reduce((points, category) => {
            const categoryReports = categoryData[category]?.reports || [];
            points[category] = categoryReports.length > 0
                ? categoryReports.map(report => ({
                    latitude: report.report_location.latitude,
                    longitude: report.report_location.longitude,
                    weight: weightCategory[category][report.report_type] || 1,
                }))
                : null; // Set to null if no reports exist
            return points;
        }, {});
    }, [categoryData]);

    return (
    <View>
        <MapView
            style={{ width: '100%', height: '100%' }}
            initialRegion={{
                latitude: location ? location.latitude : 14.280289476946388,
                longitude: location ? location.longitude : 120.99322984482292,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
            }}
            customMapStyle={intensity_theme}
            showsUserLocation={true}
            showsCompass={false}
            showsTraffic={visibleCategories.length === 1 && visibleCategories.includes('traffic')}
            showsBuildings={false}
            showsMyLocationButton={false}
            zoomControlEnabled={false}
            toolbarEnabled={false}
        >
        {categoryData != null ? (
            <>
                {categoryPoints && Object.keys(categoryData).map(category => (
                    visibleCategories.includes(category) &&
                    categoryData[category]?.description && (
                        <React.Fragment key={category}>
                            {categoryPoints[category]?.length > 0 && (
                                <Heatmap
                                    points={categoryPoints[category]}
                                    opacity={0.8}
                                    radius={50}
                                    gradient={{
                                        colors: categoryData[category].gradient,
                                        startPoints: [0.1, 0.3, 0.5, 0.7, 1],
                                        colorMapSize: 256
                                    }}
                                />
                            )}
                            {location && categoryData[category]?.description.map((group, index) => {
                                const uniqueTypes = [...new Set(group.reports.map(report => translate(report.report_type)))];
                                const typesDisplay = uniqueTypes.length <= 2 
                                    ? uniqueTypes.join(' &\n') 
                                    : `${uniqueTypes.slice(0, 2).join(', ')} &\nothers`;
                                const distance = getDistance(
                                    { latitude: location.latitude, longitude: location.longitude },
                                    { latitude: group.latitude, longitude: group.longitude }
                                );
                                const distanceDisplay = distance < 10 
                                    ? 'Dangerously Close'
                                    : distance >= 1000 
                                        ? `${(distance / 1000).toFixed(2)} kilometers away`
                                        : `${distance} meters away`;

                                return (
                                    <Marker
                                        key={index}
                                        coordinate={{ latitude: group.latitude, longitude: group.longitude }}
                                        opacity={0}
                                    >
                                        <Callout>
                                            <View className="p-2 shadow-lg shadow-black">
                                                <Text className="text-base text-primary-300 font-rmedium text-center">
                                                    {group.reports.length > 1 ? `Multiple Cases (${group.reports.length})` : 'Recent Case'}
                                                </Text>
                                                <View style={{ borderBottomWidth: 0.5, borderColor: categoryData[category].gradient[4], marginVertical: 8 }} />
                                                <Text className="text-sm text-black font-rbase">
                                                    {group.reports.length > 1 ? typesDisplay : translate(group.reports[0].report_type)}
                                                </Text>
                                                <Text className={`text-xs ${distanceDisplay === 'Dangerously Close' ? 'text-red-500' : 'text-gray-500'} mt-2`}>
                                                    {distanceDisplay}
                                                </Text>
                                            </View>
                                        </Callout>
                                    </Marker>
                                );
                            })}
                        </React.Fragment>
                    )
                ))}
            </>
        ) : (
            <></>
        )}
        </MapView>
    </View>
    )
}
export default IntensityMap;
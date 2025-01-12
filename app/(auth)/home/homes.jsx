import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, TouchableHighlight, ScrollView, ActivityIndicator, BackHandler, Dimensions, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getDistance, getPreciseDistance } from 'geolib';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getFirestore, collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
const db = getFirestore(app);

import UserContext from '../../../components/UserContext';
import ToolsContext, { getID, containID, getReport, containReport, translate, getTheme, setTheme, getTitle, setTitle } from '../../../components/ToolsContext';
import { Success, Failed, Menu } from '../../../components/modals';
import { images, icons } from '../../../constants';

// User Pages
import ProfileScreen from './profiles';
import DetailScreen from './details';
import MapScreen from './maps';
import ReportScreen from './reports';

// Responder Pages
import FormScreen from './documents';
import StatisticsScreen from './statistics';
import HelpScreen from './helps';
import SettingsScreen from './settings';

// Admin Pages
import UserScreen from './users';
import RequestScreen from './requests';
import AmenityScreen from './amenities';
import AdminReportScreen from './admin-reports';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const HomeScreen = () => {
    // Global Variables
    const { user, isResponder, isAdmin, isDuty, typeAdmin } = useContext(UserContext); // User Container
    const { dictionary } = useContext(ToolsContext); // Dictionary Container
    const auth = getAuth(); // Authenticate User Login
    const { name } = useLocalSearchParams(); // Check Upon Logout
    const { width, height } = Dimensions.get('screen'); // Screen Size

    // Modal Variables
    const [isWelcomeVisible, setWelcomeVisible] = useState(false); // Welcome Modal Visibility Variable
    const [isFailedVisible, setFailedVisible] = useState(false); // Failed Modal Visibility Variable
    const [isMenuVisible, setMenuVisible] = useState(false); // Menu Modal Visibility Variable
    const [isShown, setShown] = useState(false); // Monitor if Modal is Shown
    const [failedForm, setFailedForm] = useState({ title: 'Login Failed!', description: '' }); // Fail Modal Title & Description
    const closeModal = () => {setWelcomeVisible(false)}; // Close Welcome Modal
    const closeFModal = () => {setFailedVisible(false)}; // Close Failed Modal
    const closeMenu = () => {setMenuVisible(false)}; // Close Menu

    // Pseudo-Modal Variables
    const [isLoadingVisible, setLoadingVisible] = useState(true);
    const [menuVisible, setLocalMenuVisible] = useState(false);
    const [status, setStatus] = useState('');
    const [expandTitle, setExpandTitle] = useState(true);
    const [expandStatus, setExpandStatus] = useState(false);
    const [statusLoading, setStatusLoading] = useState('LOADING DATA');
    const [statusSuccess, setStatusSuccess] = useState('DATA SAVED');
    const [statusFailed, setStatusFailed] = useState('ERROR SAVING');

    // Local Variables
    const [loading, setLoading] = useState(false); // Add loading state
    const [buttonLock, setButtonLock] = useState({}); // Button Lock - Prevent Double Tap
    const [title, setLocalTitle] = useState(getTitle());
    const [pageHistory, setPageHistory] = useState([]);
    const [key, setKey] = useState(0); // Unmounting Menu for reset
    const [profileImage, setProfileImage] = useState(null);
    const [protect, setProtect] = useState(false);
    const [reportBuildingFire, setReportBuildingFire] = useState(false);
    const [hasRequested, setRequested] = useState(false);
    const [mapSelect, setMapSelect] = useState('default');
    const [loginLoading, setLoginLoading] = useState(true);

    // Responder Variables
    const notifiedRequests = useRef(new Set()); // Use a Set to track IDs of approved requests to avoid duplicate notifications
    const [showReports, setShowReports] = useState(false); // 
    const [reportSelection, setReportSelection] = useState(null); // Report Type Selected
    const [dashboardSelection, setDashboardSelection] = useState('nearby'); // Dashboard Mode Selection Container
    const [expandDashboard, setExpandDashboard] = useState(false); // Expand Dashboard
    const [userAmenity, setUserAmenity] = useState(null); // User's Amenity Container
    const [respoReports, setRespoReports] = useState([]); // All Responder Reports
    const [sortedReports, setSortedReports] = useState([]); // Sort Reports Per Category
    const [reportsToday, setReportsToday] = useState([]); // Seperate Container for Reports Today
    const [receivedReports, setReceivedReports] = useState([]); // Seperate Containter for Received Reports
    const [expandedStates, setExpandedStates] = useState({}); // Expand States Per Reports
    const [selectedReport, setSelectedReport] = useState(null); // Selected Report
    const [receivedReport, setReceivedReport] = useState(null); // Received Report
    const [assisting, setAssisting] = useState(false); // Assist Respo

    // Admin Variables
    const [data, setData] = useState({
        users: {
            count: 0,
            data: [],
        },
        amenities: {
            count: 0,
            data: [],
            mostRecentKeyDate: 0
        },
        reports: {
            count: 0,
            data: [],
            chartData: { labels: [], data: [] },
            mostRecentReportDate: 0
        },
        requests: {
            count: 0,
            data: [],
            chartData: { labels: [], data: [] },
            newestTimestamp: 0
        },
    });
    
    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Passive Functions
    useEffect(() => {
    const timer = setTimeout(() => {
            setLoginLoading(false);
        }, 2000); // 2000 milliseconds = 2 seconds

        // Cleanup the timeout if the component unmounts
        return () => clearTimeout(timer);
    }, []);

    // Disable the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            handleBackButton();
            return true; 
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, []);

    // Store User's Amenity Data
    useEffect(() => {
        // Fetch and set the user's amenity directly
        if (user?.amenity_id && isResponder) {
            const userAmenityDoc = doc(db, 'amenity', user.amenity_id);
            const unsubscribeUserAmenity = onSnapshot(userAmenityDoc, (doc) => {
                if (doc.exists()) {
                    setUserAmenity({ id: doc.id, ...doc.data() });
                } else {
                    //console.log('User amenity not found');
                }
            }, error => {
                console.error('Error fetching user amenity: ', error);
            });
    
            return () => unsubscribeUserAmenity();
        }
    }, [user, isResponder]);

    // Show Welcome Modal Logic
    useEffect(() => {
        if (name && !isShown) {
          if (!isShown) {
            setWelcomeVisible(true);
            setShown(true);
          }
        }
    }, [name]);

    useEffect(() => {
        if (user) {
            if (user.profile) {
                setProfileImage(user.profile);
            }
        }
    }, [user]);

    // Sync Title Name
    useEffect(() => {
        setLocalTitle(getTitle());
    }, []);

    useEffect(() => {
        let timer;
      
        if (status === 'success') {
          // Timer for changing status to 'complete' after 5 seconds
          timer = setTimeout(() => {
            setStatus('complete');
            LayoutAnimation.configureNext({
              duration: 200,
              update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX,
              },
            });
          }, 5000); // 5 seconds
        }
      
        if (status === 'complete') {
          // Timer for exit animation and resetting status after animation
          timer = setTimeout(() => {
            LayoutAnimation.configureNext({
              duration: 200,
              update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
            });
      
            // Reset status after exit animation
            setStatus(' ');
          }, 100); // Short delay for exit animation
        }
      
        // Cleanup the timeout if the component unmounts or status changes
        return () => clearTimeout(timer);
    }, [status]);

    // Loading Expanse Trigger
    useEffect(() => {
        // Trigger the first toggle after
        const firstToggle = setTimeout(() => {
            LayoutAnimation.configureNext({
                duration: 200,
                update: {
                    type: LayoutAnimation.Types.linear,
                    property: LayoutAnimation.Properties.scaleX
                },
            });
            setExpandStatus(true);
        }, 2000);

        // Cleanup timeouts when the component is unmounted
        return () => {
            clearTimeout(firstToggle);
        };
    }, [expandStatus]);

    // Real-time listener for all tables
    useEffect(() => {
        if (isAdmin) {
            const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
                const users = snapshot.docs.map(doc => doc.data()) || [];
                let filteredUsers = users;
    
                if (typeAdmin === 'amenity') {
                    const amenityID = user.amenity_id;
                    const userAddressParts = user.address
                        .split(',')
                        .map(part => part.trim().toLowerCase())
                        .filter(part => part !== 'cavite'); // Exclude 'Cavite' from address parts
    
                    filteredUsers = users.filter(user => {
                        const userAmenityMatch = user.amenity_id === amenityID;
                        const userAddressMatch = user.address
                            .split(',')
                            .map(part => part.trim().toLowerCase())
                            .filter(part => part !== 'cavite') // Exclude 'Cavite' from address parts
                            .some(part => userAddressParts.includes(part));
                        return userAmenityMatch || userAddressMatch;
                    });
                }
    
                setData(prevData => ({
                    ...prevData,
                    users: {
                        count: filteredUsers.length,
                        data: filteredUsers,
                    },
                }));
            });
        
            const unsubscribeAmenities = onSnapshot(collection(db, 'amenity'), (snapshot) => {
                const amenities = snapshot.docs.map(doc => doc.data()) || [];
                let filteredAmenities = amenities;
    
                if (typeAdmin === 'amenity') {
                    const amenityID = user.amenity_id;
                    const userAddressParts = user.address
                        .split(',')
                        .map(part => part.trim().toLowerCase())
                        .filter(part => part !== 'cavite'); // Exclude 'Cavite' from address parts
    
                    filteredAmenities = amenities.filter(amenity => {
                        const amenityIDMatch = amenity.id === amenityID;
                        const amenityAddressMatch = amenity.address
                            .split(',')
                            .map(part => part.trim().toLowerCase())
                            .filter(part => part !== 'cavite') // Exclude 'Cavite' from address parts
                            .some(part => userAddressParts.includes(part));
                        return amenityIDMatch || amenityAddressMatch;
                    });
                }

                const mostRecentKeyDate = filteredAmenities.reduce((latest, amenity) => {
                    return amenity.key_date && (!latest || amenity.key_date.seconds > latest.seconds) ? amenity.key_date : latest;
                }, null);
    
                setData(prevData => ({
                    ...prevData,
                    amenities: {
                        count: filteredAmenities.length,
                        data: filteredAmenities,
                        mostRecentKeyDate
                    },
                }));
            });
        
            const unsubscribeReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
                const reports = snapshot.docs.map(doc => doc.data()) || [];
                let filteredReports = reports;
    
                if (typeAdmin === 'amenity') {
                    const amenityID = user.amenity_id;
                    const userAddressParts = user.address
                        .split(',')
                        .map(part => part.trim().toLowerCase())
                        .filter(part => part !== 'cavite'); // Exclude 'Cavite' from address parts
    
                    filteredReports = reports.filter(report => {
                        const responderAmenityIDMatch = report.responder?.amenity?.id === amenityID;
                        const reportAddressMatch = report.report_address
                            .split(',')
                            .map(part => part.trim().toLowerCase())
                            .filter(part => part !== 'cavite') // Exclude 'Cavite' from address parts
                            .some(part => userAddressParts.includes(part));
                        const responderAmenityAddressMatch = report.responder?.amenity?.address
                            .split(',')
                            .map(part => part.trim().toLowerCase())
                            .filter(part => part !== 'cavite') // Exclude 'Cavite' from address parts
                            .some(part => userAddressParts.includes(part));
    
                        return responderAmenityIDMatch || reportAddressMatch || responderAmenityAddressMatch;
                    });
                }

                const mostRecentReportDate = filteredReports.reduce((latest, report) => {
                    const photoTimestamp = report.report_photos?.[0]?.timestamp;
                    return photoTimestamp && (!latest || photoTimestamp.seconds > latest.seconds)
                        ? photoTimestamp
                        : latest;
                }, null);

                // Prepare chart data
                const chartData = prepareReportChartData(filteredReports);
    
                setData(prevData => ({
                    ...prevData,
                    reports: {
                        count: filteredReports.length,
                        data: filteredReports,
                        mostRecentReportDate,
                        chartData
                    },
                }));
            });
        
            const unsubscribeRequests = onSnapshot(collection(db, 'request'), (snapshot) => {
                const requests = snapshot.docs.map(doc => doc.data()) || [];
                let filteredRequests = requests;

                if (typeAdmin === 'amenity') {
                    const amenityID = user.amenity_id
                    filteredRequests = requests.filter(request => request.amenity_id === amenityID);
                }
                const newestRequestTimestamp = filteredRequests.reduce((latest, request) => {
                    const createdAt = request.createdAt;
                    // Check if createdAt exists and has a `seconds` property
                    if (createdAt && createdAt.seconds !== undefined) {
                        return createdAt.seconds > latest.seconds ? createdAt : latest;
                    }
                    return latest; // Return the current latest if createdAt is invalid
                }, filteredRequests[0]?.createdAt || { seconds: 0 });

                const chartData = prepareChartData(filteredRequests);
                setData(prevData => ({
                    ...prevData,
                    requests: {
                    count: filteredRequests.length,
                    data: filteredRequests,
                    chartData: chartData,
                    newestTimestamp: newestRequestTimestamp, // Store the newest timestamp
                    },
                }));
            });
        
            // Cleanup listeners on component unmount
            return () => {
                unsubscribeUsers();
                unsubscribeAmenities();
                unsubscribeReports();
                unsubscribeRequests();
            };
        } else {
          return;
        }
    }, [isAdmin, typeAdmin]);

    // Real-time listener of Reports in Municipality
    useEffect(() => {
        let previousReports = []; // To store the previous state of reports
        let soundInstance = null; // To manage the sound instance
        let isInitialLoad = true; // Flag to track the initial load
    
        const playNotificationSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(require('../../../assets/sounds/receive.mp3'));
                soundInstance = sound; // Save the instance
                await sound.setIsLoopingAsync(true); // Loop the sound
                await sound.playAsync();
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        };
    
        const stopNotificationSound = async () => {
            if (soundInstance) {
                try {
                    await soundInstance.stopAsync();
                    await soundInstance.unloadAsync();
                    soundInstance = null;
                } catch (error) {
                    console.error('Error stopping sound:', error);
                }
            }
        };
    
        if (userAmenity && isResponder && isDuty) {
            const amenityAddressParts = userAmenity.address
                .split(',')
                .map((part) => part.trim().toLowerCase())
                .filter((part) => part !== 'cavite');
    
            const unsubscribeReports = onSnapshot(
                collection(db, 'reports'),
                (snapshot) => {
                    const filteredReports = snapshot.docs
                        .map((doc) => ({ id: doc.id, ...doc.data() }))
                        .filter((report) => {
                            // Check if the report matches the user's amenity and doesn't have `request: 'delete'`
                            const reportAddressMatch = report.report_address
                                .split(',')
                                .map((part) => part.trim().toLowerCase())
                                .filter((part) => part !== 'cavite')
                                .some((part) => amenityAddressParts.includes(part));
    
                            const responderAmenityAddressMatch = report.responder?.amenity?.address
                                .split(',')
                                .map((part) => part.trim().toLowerCase())
                                .filter((part) => part !== 'cavite')
                                .some((part) => amenityAddressParts.includes(part));
    
                            return (
                                (report.responder?.amenity?.id === userAmenity.id ||
                                    reportAddressMatch ||
                                    responderAmenityAddressMatch) &&
                                report.request !== 'delete' // Exclude reports with `request: 'delete'`
                            );
                        });
    
                    // Skip alert and sound on initial load
                    if (isInitialLoad) {
                        previousReports = filteredReports; // Initialize previousReports
                        isInitialLoad = false; // Mark the initial load as complete
                    } else {
                        // Check for new reports
                        if (filteredReports.length > previousReports.length) {
                            const newReports = filteredReports.filter(
                                (report) => !previousReports.some((prevReport) => prevReport.id === report.id)
                            );
    
                            if (newReports.length > 0) {
                                playNotificationSound(); // Start playing the sound
                                Alert.alert(
                                    'New Reports Added',
                                    `${newReports.length} new report(s) available.`,
                                    [
                                        {
                                            text: 'OK',
                                            onPress: async () => {
                                                await stopNotificationSound(); // Stop the sound only after alert is dismissed
                                            },
                                        },
                                    ],
                                    { cancelable: false }
                                );
                            }
                        }
    
                        // Update previousReports with the current state
                        previousReports = filteredReports;
                    }
    
                    // Set state and sort reports
                    setRespoReports(filteredReports);
                    sortNearbyReports(filteredReports);
                },
                (error) => {
                    console.error('Error fetching reports: ', error);
                }
            );
    
            return () => {
                unsubscribeReports();
                stopNotificationSound(); // Ensure sound is stopped if the component unmounts
            };
        }
    }, [userAmenity, isResponder, isDuty]);

    useEffect(() => {
        // Initialize expanded states for new sorted reports
        const newExpandedStates = Array.isArray(sortedReports)
          ? sortedReports.reduce((acc, report) => {
              acc[report.id] = false;
              return acc;
            }, {})
          : {};
        setExpandedStates(newExpandedStates);
    }, [sortedReports]);

    useEffect(() => {
        const sortReports = () => {
            if (dashboardSelection === 'nearby') {
                sortNearbyReports(respoReports);
            } else if (dashboardSelection === 'recent') {
                // Sort by recent timestamp
                const sortedByRecent = respoReports.sort((a, b) => {
                    const timestampA = a.report_photos?.[0]?.timestamp?.toMillis() || 0;
                    const timestampB = b.report_photos?.[0]?.timestamp?.toMillis() || 0;
                    return timestampB - timestampA;
                });
        
                // Separate today's reports
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const reportsToday = sortedByRecent.filter(report => {
                    const reportDate = new Date(report.report_photos?.[0]?.timestamp?.toMillis());
                    return reportDate >= today;
                });
        
                // Remove today's reports from the sortedByRecent
                const sortedExcludingToday = sortedByRecent.filter(report => {
                    const reportDate = new Date(report.report_photos?.[0]?.timestamp?.toMillis());
                    return reportDate < today;
                }).slice(0, 10); // Limit to 10 after excluding today's reports
        
                setSortedReports(sortedExcludingToday);
                setReportsToday(reportsToday);
            } else if (dashboardSelection === 'active') {
                // Sort by status and distance
                const receivedReports = respoReports.filter(report => report.report_status === 'received')
                .map(report => {
                    const distance = getDistance(
                    { latitude: userAmenity.location.latitude, longitude: userAmenity.location.longitude },
                    { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
                    );
                    return { ...report, distance };
                }).sort((a, b) => a.distance - b.distance).slice(0, 5);
    
                const respondedReports = respoReports.filter(report => report.report_status === 'responded')
                .map(report => {
                    const distance = getDistance(
                    { latitude: userAmenity.location.latitude, longitude: userAmenity.location.longitude },
                    { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
                    );
                    return { ...report, distance };
                }).sort((a, b) => a.distance - b.distance).slice(0, 5);
    
                setSortedReports(respondedReports);
                setReceivedReports(receivedReports);
            }
        };
    
        if (respoReports?.length) {
            sortReports();
        }
    }, [dashboardSelection, respoReports, userAmenity]);

    // Provides Greeting if Morning, Afternoon and Evening
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning, ';
        if (hour < 18) return 'Good Afternoon, ';
        return 'Good Evening, ';
    };

    // Play Sound
    const playSound = async () => {
        const { sound } = await Audio.Sound.createAsync(require('../../../assets/sounds/menu-2.mp3'));
        await sound.playAsync();
    };

    // Expand Status from Logo to Text
    const toggleView = () => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX
            },
        });
        setExpandStatus(!expandStatus);
    };

    // Updated Minutes / Hours / Days / Weeks / Months Ago
    const formatTimeDifference = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInWeeks = Math.floor(diffInDays / 7);
        const diffInMonths = Math.floor(diffInDays / 30);
    
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
        } else if (diffInWeeks < 4) {
            return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
        } else {
            return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
        }
    };

    // Generate Responder Requests Chart Data
    const prepareChartData = (requests) => {
        if (!Array.isArray(requests)) {
          return { labels: [], data: [] };
        }
      
        const dateCountMap = {};
      
        requests.forEach(request => {
          const timestamp = request.createdAt;
          if (timestamp) {
            const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
            if (dateCountMap[formattedDate]) {
              dateCountMap[formattedDate]++;
            } else {
              dateCountMap[formattedDate] = 1;
            }
          }
        });
      
        const labels = Object.keys(dateCountMap);
        const data = Object.values(dateCountMap);
      
        return { labels, data };
    };

    // Generate Reports Chart Data
    const prepareReportChartData = (reports) => {
        if (!Array.isArray(reports)) {
            return { labels: [], data: [] };
        }

        const dateCountMap = {};

        reports.forEach(report => {
            const timestamp = report.report_photos?.[0]?.timestamp;

            if (timestamp) {
                const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);

                if (!isNaN(date.getTime())) {
                    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
                    dateCountMap[formattedDate] = (dateCountMap[formattedDate] || 0) + 1;
                }
            }
        });

        const sortedDates = Object.keys(dateCountMap).sort((a, b) => {
            const [aMonth, aDay] = a.split('/').map(Number);
            const [bMonth, bDay] = b.split('/').map(Number);

            return new Date(2024, bMonth - 1, bDay) - new Date(2024, aMonth - 1, aDay);
        });

        const labels = sortedDates.slice(0, 7);
        const data = labels.map(date => dateCountMap[date]);

        return { labels, data };
    };

    // Helper function to extract the relevant address parts
    const getRelevantAddressParts = (address) => {
        const parts = address.split(',').map(part => part.trim());
        if (parts.length > 1 && parts[parts.length - 1].toUpperCase() === 'PH') {
            return parts.slice(-3).slice(0, 2).join(', '); // Get the two parts before 'PH'
        }
        return parts.slice(-2).join(', '); // Get the last two parts
    };

    // Function to convert Firestore timestamp to a formatted time string
    const formatTime = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    };

    // Function to convert Firestore timestamp to a formatted date string (MM/DD/YYYY)
    const formatDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        const month = date.getMonth() + 1; // Months are 0-based, so add 1
        const day = date.getDate();
        const year = date.getFullYear();
        const monthStr = month < 10 ? '0' + month : month; // Add leading zero if needed
        const dayStr = day < 10 ? '0' + day : day; // Add leading zero if needed
        return `${monthStr}/${dayStr}/${year}`; // Format as MM/DD/YYYY
    };

    // Function to convert 
    const formatRelativeDate = (timestamp) => {
        if (!timestamp || typeof timestamp.seconds !== 'number') return 'Invalid date';
    
        // Convert Firebase timestamp to JavaScript Date
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        const now = new Date();
    
        const differenceInSeconds = Math.floor((now - date) / 1000);
    
        if (differenceInSeconds < 60) {
            return 'Just now';
        } else if (differenceInSeconds < 3600) {
            const minutes = Math.floor(differenceInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (differenceInSeconds < 86400) {
            const hours = Math.floor(differenceInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (differenceInSeconds < 604800) {
            const days = Math.floor(differenceInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (differenceInSeconds < 2592000) {
            const weeks = Math.floor(differenceInSeconds / 604800);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (differenceInSeconds < 31536000) {
            const months = Math.floor(differenceInSeconds / 2592000);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(differenceInSeconds / 31536000);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    };    

    // Function to count contributors
    const countContributors = (report) => {
        let count = 0;

        // Check if user_report exists and has a full_name field
        if (report.user_report && report.user_report.full_name) {
            count += 1;
        }

        // Check if responder exists and has a full_name field
        if (report.responder && report.responder.full_name) {
            count += 1;
        }

        if (report.responders && Array.isArray(report.responders)) {
            count += report.responders.length;
        }

        return count;
    };

    // Color Generator Function
    const colorGenerator = (key) => {
        const colorKey = dictionary[key + '_color'];
        return colorKey;
    };

    // Sort Reports Nearby
    const sortNearbyReports = (reports) => {
        if (!reports || reports.length === 0) {
            console.error("No reports available to sort.");
            setSortedReports([]);
            return;
        }
    
        //console.log("Initial reports:", reports);
    
        // Step 1: Filter reports with status 'waiting'
        const filteredReports = reports.filter(report => {
            //console.log("Evaluating report:", report);
    
            if (report.report_status !== 'waiting') return false;
    
            const userAmenityServices = userAmenity.services.reduce((acc, serviceObj) => {
                const [key, value] = Object.entries(serviceObj)[0];
                if (value) acc.push(key);
                return acc;
            }, []);
    
            //console.log("User services:", userAmenityServices);
    
            const reportServices = report.services || [];
            const handlerMatches = report.handler === userAmenity.type;
    
            const hasMatchingService = reportServices.some(service => userAmenityServices.includes(service));
    
            /*console.log({
                reportServices,
                handlerMatches,
                hasMatchingService,
                passes: hasMatchingService || (reportServices.length === 0 && handlerMatches),
            });*/
    
            return hasMatchingService || (reportServices.length === 0 && handlerMatches);
        });
    
        //console.log("Filtered reports (status 'waiting'):", filteredReports);
    
        // Step 2: Add reports with status 'received' and matching amenity ID
        const receivedReports = reports.filter(report =>
            report.report_status === 'received' && report.responder?.amenity?.id === userAmenity.id
        );
    
        //console.log("Received reports (status 'received'):", receivedReports);
    
        // Combine the two lists and remove duplicates
        const combinedReports = [
            ...filteredReports,
            ...receivedReports
        ];
    
        //console.log("Combined reports:", combinedReports);
    
        // Step 3: Validate and sort by distance
        const validReports = combinedReports.filter(report => {
            const isValidLocation =
                report.report_location &&
                report.report_location.latitude !== undefined &&
                report.report_location.longitude !== undefined &&
                userAmenity.location.latitude !== undefined &&
                userAmenity.location.longitude !== undefined;
    
            if (!isValidLocation) {
                console.error("Invalid location in report:", report);
            }
    
            return isValidLocation;
        });
    
        //console.log("Valid reports with proper locations:", validReports);
    
        const sortedByDistance = validReports
            .map(report => {
                const distanceInMeters = getDistance(
                    { latitude: userAmenity.location.latitude, longitude: userAmenity.location.longitude },
                    { latitude: report.report_location.latitude, longitude: report.report_location.longitude }
                );
    
                //console.log("Distance to report:", distanceInMeters, "meters for report ID:", report.id);
    
                // Format distance as 'm' or 'km'
                const formattedDistance =
                distanceInMeters < 1000
                    ? `${distanceInMeters.toFixed(0)} m`
                    : `${(distanceInMeters / 1000).toFixed(2)} km`;

            return { ...report, distance: formattedDistance };
            })
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)) // Sort by numerical distance
            .slice(0, 10); // Take the top 10 closest reports
    
        //console.log("Sorted reports by distance:", sortedByDistance);
    
        setSortedReports(sortedByDistance);
    };    

    // Check if user has pending and approved requests
    /* useEffect(() => {
        // Exit if `user` or `user.uid` is not defined
        if (!user || !user.uid) return;
    
        const db = getFirestore();
        const requestsRef = collection(db, 'request');
        const pendingQuery = query(
            requestsRef,
            where('user_uid', '==', user.uid)
        );
    
        // Use a Set to track IDs of approved requests to avoid duplicate notifications
        const notifiedRequests = useRef(new Set());
    
        // Set up a real-time listener for user's requests
        const unsubscribe = onSnapshot(
            pendingQuery,
            (querySnapshot) => {
                let hasPending = false;
                querySnapshot.forEach((doc) => {
                    const request = doc.data();
                    const requestId = doc.id;
    
                    if (request.status === 'pending') {
                        hasPending = true; // At least one pending request
                    } else if (request.status === 'approved' && !notifiedRequests.current.has(requestId)) {
                        // Trigger a notification only if this request hasn't been notified yet
                        Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Congratulations!",
                                body: "Your request has been approved!",
                            },
                            trigger: null, // Immediate notification
                        });
                        notifiedRequests.current.add(requestId); // Mark this request as notified
                    }
                });
                setRequested(hasPending); // Update based on pending requests
            },
            (error) => {
                console.error('Error checking pending requests:', error);
                setRequested(false); // Handle error case
            }
        );
    
        // Clean up the listener on component unmount or if user.uid changes
        return () => unsubscribe();
    }, [user]); */

    const toggleMenu = (bool) => {
        setLocalMenuVisible(bool);
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.scaleXY,
            },
        });
    };

    // Icon Generator Function
    const icogenerator = (key) => {
        const iconKey = dictionary[key + '_icon'];
        return icons[iconKey] || null;
    };

    // Logout Button Function
    const handleLogout = async () => {
        const currentUser = auth.currentUser;
        setPageHistory([]);
        setLoading(true);

        if (currentUser) {
            try {
                // Query Firestore to find the user document with the given email
                const q = query(collection(db, 'users'), where('email', '==', currentUser.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];

                    // Update the sessionToken field to null
                    await updateDoc(doc(db, 'users', userDoc.id), { session_token: null });

                    // Sign-out successful, navigate to login screen
                    await signOut(auth);
                    router.push('/log-in'); router.push({ pathname: '/log-in', params: { out: JSON.stringify({ title: 'Logout Successful!', description: 'You have been logged out.' })}, });
                    setMenuVisible(false); // If Menu Shows Up When Logging Out
                    setTitle('home/homes'); // Automatically Warps to Home Screen
                    setLoading(false);
                }
            } catch (error) {
                // Handle errors
                setFailedForm({ title: 'Logout Error!', description: error.message })
                setFailedVisible(true);
                setLoading(false);
            }
        }
    };

    // Menu Button Function
    const handlePress = (path) => {
        setTitle(path);
        setLocalTitle(path);
        // Add the current page to the history stack before navigating
        setPageHistory(prevHistory => [...prevHistory, title]);
        if (buttonLock[path]) return;
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleXY
            },
        });
        if (path === 'home/documents') {
            setExpandTitle(false);
        } else if (path === 'home/profiles') {
            setExpandTitle(true);
        }

        setButtonLock((prev) => ({ ...prev, [path]: true }));
        setTimeout(() => {
          setButtonLock((prev) => ({ ...prev, [path]: false }));
        }, 500); // Adjust delay as needed

    };

    // In Page Re-routing Function
    const handleChangePage = (path) => {
        playSound();
        setTitle(path);
        setLocalTitle(path);
        setKey(prevKey => prevKey + 1);
        
        // Add the current page to the history stack before navigating
        setPageHistory(prevHistory => [...prevHistory, title]);
        
        if (buttonLock[path]) return;
    
        setButtonLock((prev) => ({ ...prev, [path]: true }));
        setTimeout(() => {
            setButtonLock((prev) => ({ ...prev, [path]: false }));
        }, 500); // Adjust delay as needed
    };

    const handleBackButton = () => {
        if (pageHistory.length > 0) {
            const previousPage = pageHistory[pageHistory.length - 1];
            setPageHistory(prevHistory => prevHistory.slice(0, -1));
            setTitle(previousPage);
            setLocalTitle(previousPage);
            setKey(prevKey => prevKey + 1);
        }
    };

    const QAFire = (value) => {
        setReportBuildingFire(value);
        handleChangePage('home/reports');
    }

    // Show a loading indicator while checking the user type
    if (loading) {
        return (
            <SafeAreaView className="w-full h-full bg-white">
                {/* Menu Title */}
                <View className="w-full h-[10%] bg-primary flex-row">
                    {/* Menu Button */}
                    <View className="w-1/3 h-full">
                        <TouchableOpacity className="w-full h-full justify-center pl-4" onPress={() => setMenuVisible(true)} disabled>
                            <Image 
                                tintColor="#ffffff"
                                source={icons.menu}
                                className="w-[35%] h-[35%]"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Menu Title */}
                    <View className="w-1/3 h-full bg-primary justify-center items-center">
                        {title && (<Text className="font-rmedium text-white text-xl">{translate(title)}</Text>)}
                    </View>
                </View>
                {/* Status Indicator */}
                <View className="w-full h-[94%] -top-8 items-center overflow-hidden">
                    <TouchableOpacity className="w-full h-12 justify-center items-center absolute top-[6%] z-10" onPress={toggleView} activeOpacity={1} disabled>
                        {/* Loading Status */}
                        <View className="w-[50%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                            <View className="w-1/3 h-full justify-center">
                                <ActivityIndicator size="large" color="#57b378" />
                            </View>
                            <View className="w-2/3 h-full justify-center">
                                <Text className="font-rblack text-primary text-sm text-center" numberOfLines={1} ellipsizeMode="tail">
                                {'LOGGING OUT'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Error Document Preview Protector
    const handleMenu = (value) => {
        setMenuVisible(value);
        setProtect(true);
    };

    // Intensity Map Function
    const handleIntensity = () => {
        setMapSelect('intensity')
        handleChangePage('home/maps')
    };

    // Dashboard Mode Function
    const changeDashboard = (value) => {
        setDashboardSelection(value); // Updates the selection
    };

    // Expand Report
    const toggleExpandDashboard = (id) => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX
            },
        });
        setExpandedStates(prevStates => ({
            ...prevStates,
            [id]: !prevStates[id]
        }));
    };

    // Template Button
    const handleOK = (value) => {
        console.log(value);
    };

    // Go to Report Screen
    const handleMoreDetails = (id) => {
        containID(id);
        handleChangePage('home/details');
    };

    // Receive Report
    const handleReceive = (report) => {
        setReceivedReport(report);
        handleChangePage('home/maps');
    };

    // Assist Responder
    const handleAssist = (report) => {
        setSelectedReport(report);
        setAssisting(true);
        handleChangePage('home/maps');
    };

    // Locate Function
    const handleLocate = (report) => {
        setSelectedReport(report);
        handleChangePage('home/maps');
    };

    // Flag the Report as False
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

    // Handle to Request Delete
    const handleRequestDelete = async (id) => {
        const reportRef = doc(db, 'reports', id);
      
        try {
          await updateDoc(reportRef, {
            request: 'delete',
          });
          console.log('Request to Delete Report');
        } catch (error) {
          console.error('Error requesting deletion:', error);
        }
    };

    const { chartData, newestTimestamp } = data.requests;
    const reportChartData = data.reports.chartData;
    const activeUsers = data?.users?.data?.filter(user => user.session_token !== null) ?? [];
    const pendingRequests = data?.requests?.data?.filter(request => request.status === 'pending') ?? [];
    
    return (
        <SafeAreaView className="w-full h-full bg-white">
            {/* Modals */}
            <Success visible={isWelcomeVisible} onClose={closeModal} title={'Login Successful!'} description={`Welcome ${name} to GEOMAP`} />
            <Failed visible={isFailedVisible} onClose={closeFModal} title={failedForm.title} description={failedForm.description} />
            <Menu key={key} visible={isMenuVisible} onClose={closeMenu} respo={isResponder} logout={handleLogout} changePage={handlePress} admin={isAdmin} />
            {/* Menu Bar */}
            {!menuVisible ? (
                <>
                    <View className={`w-full h-[10%] ${mapSelect === 'intensity' ? 'bg-primary-125' : 'bg-primary'} flex-row z-10`}>
                        {/* Menu Button */}
                        <View className="w-[20%] h-full">
                            <TouchableOpacity className="w-full h-full justify-center items-center" onPress={() => handleMenu(true)}>
                                <Image 
                                    tintColor="#ffffff"
                                    source={icons.menu}
                                    className="w-[50%] h-[50%]"
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Menu Title */}
                        <View className="w-[60%] h-full justify-center items-center">
                            {(isAdmin || isResponder) && title === 'home/homes' ? (
                                <>
                                    <TouchableOpacity 
                                        className="w-full h-full items-center justify-center"
                                        onPress={() => {
                                            LayoutAnimation.configureNext({
                                                duration: 400,
                                                update: {
                                                    type: LayoutAnimation.Types.easeInEaseOut,
                                                    property: LayoutAnimation.Properties.scaleXY
                                                },
                                            });
                                            setExpandTitle(!expandTitle);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        {expandTitle ? (
                                            <Text className="font-rmedium text-white text-xl">{'Dashboard'}</Text>
                                        ) : (
                                            <Image
                                                tintColor='#ffffff'
                                                source={icons.dashboard}
                                                className="w-[30%] h-[30%]"
                                                resizeMode='contain'
                                            />
                                        )}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {title !== null && (
                                        <>
                                            <TouchableOpacity 
                                                className="w-full h-full items-center justify-center"
                                                onPress={() => {
                                                    LayoutAnimation.configureNext({
                                                        duration: 400,
                                                        update: {
                                                            type: LayoutAnimation.Types.easeInEaseOut,
                                                            property: LayoutAnimation.Properties.scaleXY
                                                        },
                                                    });
                                                    setExpandTitle(!expandTitle);
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                {expandTitle ? (
                                                    <Text className="font-rmedium text-white text-xl text-center">{translate(title)}</Text>
                                                ) : (
                                                    <Image
                                                        tintColor='#ffffff'
                                                        source={icogenerator(title)}
                                                        className="w-[30%] h-[30%]"
                                                        resizeMode='contain'
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                        {/* Other Buttons */}
                        <View className="w-[20%] h-full">
                            <TouchableOpacity className={`w-full h-full ${mapSelect === 'intensity' ? 'bg-primary-125' : 'bg-primary'} items-center justify-center rounded-full`} onPress={() => toggleMenu(true)}>
                                <Image 
                                    tintColor="#ffffff"
                                    source={icons.expandUp}
                                    className="w-[30%] h-[30%]"
                                    resizeMode='contain'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {isResponder && title === 'home/homes' && (
                        <View className="w-full h-[6%] bg-primary items-center z-10">
                            <View className="w-[90%] h-[80%] rounded-2xl flex-row overflow-hidden border-[1px] border-primary-125 z-10 absolute -top-[10%]">
                                {/* Nearby */}
                                <View className="w-1/3 h-full">
                                    <TouchableHighlight underlayColor={'#86ebaa'} className={`w-full h-full items-center justify-center ${dashboardSelection === 'nearby' ? 'bg-primary-125' : 'bg-primary'}`} onPress={() => changeDashboard('nearby')} disabled={dashboardSelection === 'nearby'}>
                                        <Text className={`${dashboardSelection === 'nearby' ? 'text-white font-psemibold' : 'text-primary-125 font-pregular'} text-base`}>{'Nearby'}</Text>
                                    </TouchableHighlight>
                                </View>
                                {/* Active */}
                                <View className="w-1/3 h-full">
                                    <TouchableHighlight underlayColor={'#86ebaa'} className={`w-full h-full items-center justify-center ${dashboardSelection === 'recent' ? 'bg-primary-125' : 'bg-primary'} border-x-[1px] border-primary-125`} onPress={() => changeDashboard('recent')} disabled={dashboardSelection === 'recent'}>
                                        <Text className={`${dashboardSelection === 'recent' ? 'text-white font-psemibold' : 'text-primary-125 font-pregular'} text-base`}>{'Recent'}</Text>
                                    </TouchableHighlight>
                                </View>
                                {/* Active */}
                                <View className="w-1/3 h-full">
                                    <TouchableHighlight underlayColor={'#86ebaa'} className={`w-full h-full items-center justify-center ${dashboardSelection === 'active' ? 'bg-primary-125' : 'bg-primary'} border-primary-125`} onPress={() => changeDashboard('active')} disabled={dashboardSelection === 'active'}>
                                        <Text className={`${dashboardSelection === 'active' ? 'text-white font-psemibold' : 'text-primary-125 font-pregular'} text-base`}>{'Active'}</Text>
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                    )}
                </>
            ) : (
                <View className={`w-full h-[3.5%] z-10 ${mapSelect === 'intensity' ? 'bg-primary-125' : 'bg-primary'} items-center justify-center`}>
                    <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => toggleMenu(false)} activeOpacity={0.8}>
                        <Image 
                            tintColor="#ffffff"
                            source={icons.expandDown}
                            className="w-[20%] h-[40%]"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
                </View>
            )}
            <View className={`w-full ${!menuVisible ? (height <= 900 ? 'h-[95%] -top-8' : 'h-[94%] -top-8') : (height <= 900 ? 'h-[101%] -top-[4%]' : 'h-full -top-[3.5%]')} items-center overflow-hidden`}>
                {/* Pseudo-Modals */}
                <TouchableOpacity className={`w-full h-12 justify-center items-center absolute top-[6%] z-10`} onPress={toggleView} activeOpacity={1}>
                    {status === 'loading' ? (
                        <>
                            {expandStatus ? (
                                /* Loading Frame */
                                <View className="w-[20%] h-full items-center justify-center bg-white rounded-3xl shadow-md shadow-black">
                                    <ActivityIndicator size="large" color="#57b378" />
                                </View>
                            ) : (
                                /* Loading Status */
                                <View className="w-[60%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                                    <View className="w-1/3 h-full justify-center">
                                        <ActivityIndicator size="large" color="#57b378" />
                                    </View>
                                    <View className="w-2/3 h-full justify-center">
                                        <Text className="font-rblack text-primary text-sm text-center" numberOfLines={1} ellipsizeMode="tail">
                                        {statusLoading}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : status === 'success' ? (
                        <>
                            {expandStatus ? (
                                /* Success Frame */
                                <View className={`w-[20%] h-12 items-center justify-center ${mapSelect === 'intensity' ? 'bg-primary-125' : 'bg-primary'} rounded-3xl shadow-md shadow-black`}>
                                    <Image
                                        tintColor={"#ffffff"}
                                        source={icons.check}
                                        className="w-[50%] h-[50%]"
                                        resizeMode='contain'
                                    />
                                </View>
                            ) : (
                                /* Success Status */
                                <View className="w-[60%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                                    <View className="w-1/3 h-full items-center justify-center bg-primary">
                                        <Image
                                            tintColor={"#ffffff"}
                                            source={icons.check}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="w-2/3 h-full justify-center">
                                        <Text className="font-rblack text-primary text-sm text-center" numberOfLines={1} ellipsizeMode='tail'>
                                            {statusSuccess}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : status === 'error' ? (
                        <>
                            {expandStatus ? (
                                /* Error Frame */
                                <View className="w-[20%] h-12 items-center justify-center bg-rose-500 rounded-3xl shadow-md shadow-black">
                                    <Image
                                        tintColor={"#ffffff"}
                                        source={icons.close}
                                        className="w-[50%] h-[50%]"
                                        resizeMode='contain'
                                    />
                                </View>
                            ) : (
                                /* Error Status */
                                <View className="w-[60%] h-12 items-center bg-white rounded-3xl flex-row overflow-hidden shadow-md shadow-black">
                                    <View className="w-1/3 h-full items-center justify-center bg-rose-500">
                                        <Image
                                            tintColor={"#ffffff"}
                                            source={icons.close}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="w-2/3 h-full justify-center">
                                        <Text className="font-rblack text-rose-500 text-sm text-center" numberOfLines={1} ellipsizeMode='tail'>
                                            {statusFailed}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    ) : status === 'complete' ? (
                        <>
                            <View className="w-2 h-2 items-center justify-center bg-white rounded-3xl shadow-md shadow-black">
                            </View>
                        </>
                    ) : (
                        <></>
                    )}
                </TouchableOpacity>
                {title === 'home/profiles' ? (
                    <ProfileScreen changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/details' ? (
                    <DetailScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} />
                ) : title === 'home/maps' ? (
                    <MapScreen 
                        selectedMap={mapSelect} 
                        changeMap={setMapSelect} 
                        changePage={handleChangePage} 
                        backPage={handleBackButton} 
                        status={setStatus} 
                        savings={setStatusSuccess} 
                        loadings={setStatusLoading} 
                        fails={setStatusFailed} 
                        hideMenu={toggleMenu} 
                        dashboardReport={selectedReport} 
                        dashboardReceive={receivedReport} 
                        setDashboardReceive={setReceivedReport}
                        isAssisting={assisting}
                    />
                ) : title === 'home/reports' ? (
                    <ReportScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} fails={setStatusFailed} hideMenu={toggleMenu} fireBuilding={reportBuildingFire} quickAction={setReportBuildingFire} />
                ) : title === 'home/statistics' ? (
                    <StatisticsScreen changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/documents' ? (
                    <FormScreen changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} previewProtect={protect} returnProtect={setProtect}/>
                ) : title === 'home/settings' ? (
                    <SettingsScreen changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/helps' ? (
                    <HelpScreen changePage={handleChangePage} backPage={handleBackButton}/>
                ) : title === 'home/users' ? (
                    <UserScreen data={data?.users?.data} changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/requests' ? (
                    <RequestScreen data={data?.requests?.data} changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/amenities' ? (
                    <AmenityScreen data={data?.amenities?.data} changePage={handleChangePage} backPage={handleBackButton} />
                ) : title === 'home/admin-reports' ? (
                    <AdminReportScreen data={data?.reports?.data} changePage={handleChangePage} backPage={handleBackButton} />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        {isAdmin ? (
                            <View className="w-full h-full bg-white items-center">
                                <View className="w-full h-full bg-white top-[4%] items-center">
                                    <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                        {/* Dashboard Totals */}
                                        <View className="w-[95%] h-32 mt-8">
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                {/* Total Users */}
                                                <View className="w-64 h-full flex-row items-center justify-start mr-2">
                                                    {/* Users Count */}
                                                    <View className="w-full h-[90%]">
                                                        <TouchableHighlight className="w-full h-full bg-white border-[#FB5012] border-[1px] rounded-3xl overflow-hidden items-center" underlayColor={'#fffd99'} onPress={() => handleChangePage('home/users')}>
                                                            <>
                                                                {/* Total Users */}
                                                                <View className="w-full h-[70%] flex-row">
                                                                    {/* Total User Count */}
                                                                    <View className="w-[60%] h-full justify-center pl-4">
                                                                        <Text className="text-white-500 font-pmedium text-base">{"Total Users"}</Text>
                                                                        <Text className="text-black font-psemibold text-xl">{data?.users?.count}</Text>
                                                                    </View>
                                                                    {/* User Icons */}
                                                                    <View className="w-[40%] h-full items-center justify-center pl-4">
                                                                        <View className="w-14 h-14 bg-[#FB5012] items-center justify-center rounded-xl">
                                                                            <Image
                                                                                tintColor="#ffffff"
                                                                                source={icons.aboutUs}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                <View className="w-full h-[1px] bg-[#FB5012]" />
                                                                {/* Active Users */}
                                                                <View className="w-full h-[30%] pl-4 justify-center bg-[#FB5012]">
                                                                    <Text className="text-white font-rbase text-sm pb-1">
                                                                        <Text className="font-rmedium">{`⬤  ${activeUsers?.length} `}</Text>
                                                                        {`${activeUsers?.length > 0 ? 'online users' : 'online user'} `}
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        </TouchableHighlight>
                                                    </View>
                                                </View>
                                                {/* Total Requests  */}
                                                <View className="w-64 h-full flex-row items-center justify-start mr-2">
                                                    {/* Requests Count */}
                                                    <View className="w-full h-[90%]">
                                                        <TouchableHighlight className="w-full h-full bg-white border-[#00D8D0] border-[1px] rounded-3xl overflow-hidden items-center" underlayColor={'#fffd99'} onPress={() => handleChangePage('home/requests')}>
                                                            <>
                                                                {/* All Requests */}
                                                                <View className="w-full h-[70%] flex-row">
                                                                    {/* All Requests Count */}
                                                                    <View className="w-[60%] h-full justify-center pl-4">
                                                                        <Text className="text-white-500 font-pmedium text-base">{"Total Requests"}</Text>
                                                                        <Text className="text-black font-psemibold text-xl">{data?.requests?.count}</Text>
                                                                    </View>
                                                                    {/* Requests Icons */}
                                                                    <View className="w-[40%] h-full items-center justify-center pl-4">
                                                                        <View className="w-14 h-14 bg-[#00D8D0] items-center justify-center rounded-xl">
                                                                            <Image
                                                                                tintColor="#ffffff"
                                                                                source={icons.request}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                <View className="w-full h-[1px] bg-[#00D8D0]" />
                                                                {/* Pending Requests */}
                                                                <View className="w-full h-[30%] pl-4 justify-center bg-[#00D8D0]">
                                                                    <Text className="text-white font-rbase text-sm pb-1">
                                                                        <Text className="font-rmedium">{`ⴵ  ${pendingRequests?.length} `}</Text>
                                                                        {'pending requests'}
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        </TouchableHighlight>
                                                    </View>
                                                </View>
                                                {/* Total Amenites */}
                                                <View className="w-64 h-full flex-row items-center justify-start mr-2">
                                                    {/* Amenities Count */}
                                                    <View className="w-full h-[90%]">
                                                        <TouchableHighlight className="w-full h-full bg-white border-[#D6CB00] border-[1px] rounded-3xl overflow-hidden items-center" underlayColor={'#fffd99'} onPress={() => handleChangePage('home/amenities')}>
                                                            <>
                                                                {/* All Amenities */}
                                                                <View className="w-full h-[70%] flex-row">
                                                                    {/* All Amenities */}
                                                                    <View className="w-[60%] h-full justify-center pl-4">
                                                                        <Text className="text-white-500 font-pmedium text-base">{"Total Amenities"}</Text>
                                                                        <Text className="text-black font-psemibold text-xl">{data?.amenities?.count}</Text>
                                                                    </View>
                                                                    {/* Amenities Icons */}
                                                                    <View className="w-[40%] h-full items-center justify-center pl-4">
                                                                        <View className="w-14 h-14 bg-[#D6CB00] items-center justify-center rounded-xl">
                                                                            <Image
                                                                                tintColor="#ffffff"
                                                                                source={icons.barangayLogo}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                <View className="w-full h-[1px] bg-[#D6CB00]" />
                                                                {/* Recent Generated Key */}
                                                                <View className="w-full h-[30%] pl-4 justify-center bg-[#D6CB00]">
                                                                    <Text className="text-white font-rbase text-sm pb-1">
                                                                        <Text className="font-rmedium">{`ⴵ  `}</Text>
                                                                        {`Updated ${formatTimeDifference(data.amenities.mostRecentKeyDate)}`}
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        </TouchableHighlight>
                                                    </View>
                                                </View>
                                                {/* Total Reports */}
                                                <View className="w-64 h-full flex-row items-center justify-start mr-2">
                                                    {/* Reports Count */}
                                                    <View className="w-full h-[90%]">
                                                        <TouchableHighlight className="w-full h-full bg-white border-[#00CF98] border-[1px] rounded-3xl overflow-hidden items-center" underlayColor={'#fffd99'} onPress={() => handleChangePage('home/admin-reports')}>
                                                            <>
                                                                {/* All Reports */}
                                                                <View className="w-full h-[70%] flex-row">
                                                                    {/* All Reports */}
                                                                    <View className="w-[60%] h-full justify-center pl-4">
                                                                        <Text className="text-white-500 font-pmedium text-base">{"Total Reports"}</Text>
                                                                        <Text className="text-black font-psemibold text-xl">{data?.reports?.count}</Text>
                                                                    </View>
                                                                    {/* Reports Icons */}
                                                                    <View className="w-[40%] h-full items-center justify-center pl-4">
                                                                        <View className="w-14 h-14 bg-[#00CF98] items-center justify-center rounded-xl">
                                                                            <Image
                                                                                tintColor="#ffffff"
                                                                                source={icons.detailHomeOn}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                <View className="w-full h-[1px] bg-[#00CF98]" />
                                                                {/* Active Users */}
                                                                <View className="w-full h-[30%] pl-4 justify-center bg-[#00CF98]">
                                                                    <Text className="text-white font-rbase text-sm pb-1">
                                                                        <Text className="font-rmedium">{`ⴵ  `}</Text>
                                                                        {`Updated ${formatTimeDifference(data.reports.mostRecentReportDate)}`}
                                                                    </Text>
                                                                </View>
                                                            </>
                                                        </TouchableHighlight>
                                                    </View>
                                                </View>
                                            </ScrollView>
                                        </View>
                                        {/* Statistics */}
                                        {chartData && chartData.labels.length > 0 && (
                                            <View className="w-[95%] h-[300px] items-center justify-end mt-4 border-[#00D8D0] border-[1px] rounded-3xl overflow-hidden">
                                                {/* Statistics */}
                                                <View className="w-[80%] h-[75%] items-center justify-center">
                                                    {chartData && chartData.labels.length > 0 ? (
                                                        <BarChart
                                                            data={{
                                                                labels: chartData.labels,
                                                                datasets: [{ data: chartData.data }]
                                                            }}
                                                            width={width}
                                                            height={200}
                                                            yAxisLabel=""
                                                            yAxisSuffix=""
                                                            fromZero={true}
                                                            chartConfig={{
                                                                backgroundGradientFrom: '#ffffff',
                                                                backgroundGradientTo: '#ffffff',
                                                                decimalPlaces: 0,
                                                                color: (opacity = 1) => `rgba(0, 216, 208, ${opacity})`,
                                                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                                style: { 
                                                                    borderRadius: 10, 
                                                                    paddingLeft: 20,
                                                                    paddingRight: 20
                                                                },
                                                                propsForBackgroundLines: {
                                                                    strokeWidth: 0.5,
                                                                    stroke: '#ffffff',
                                                                    strokeDasharray: '0',
                                                                },
                                                                propsForLabels: {
                                                                    fontSize: 12,
                                                                    fontWeight: 'bold',
                                                                }
                                                            }}
                                                            verticalLabelRotation={0}
                                                        />
                                                    ) : (
                                                        <ActivityIndicator size="large" color="#00D8D0" />
                                                    )}
                                                </View>
                                                {/* Information Below */}
                                                <View className="w-full h-[25%] bg-[#00D8D0] px-5 border-t-[1px] border-[#00D8D0]">
                                                    <Text className="text-white font-psemibold text-lg pt-3">{'Responder Requests'}</Text>
                                                    <Text className="text-slate-100 font-pregular text-sm">{`Updated ${formatTimeDifference(newestTimestamp)}`}</Text>
                                                </View>
                                            </View>
                                        )}
                                        {reportChartData && reportChartData.labels.length > 0 && (
                                            <View className="w-[95%] h-[300px] items-center justify-end mt-4 mb-16 border-[#00CF98] border-[1px] rounded-3xl overflow-hidden">
                                                {/* Statistics */}
                                                <View className="w-[80%] h-[75%] items-center justify-center">
                                                    <LineChart
                                                        data={{
                                                            labels: reportChartData.labels,
                                                            datasets: [{ data: reportChartData.data }]
                                                        }}
                                                        width={width} // Width of chart
                                                        height={200} // Height of chart
                                                        fromZero={true}
                                                        chartConfig={{
                                                            backgroundColor: '#fff',
                                                            backgroundGradientFrom: '#ffffff',
                                                            backgroundGradientTo: '#ffffff',
                                                            decimalPlaces: 0,
                                                            color: (opacity = 1) => `rgba(0, 207, 152, ${opacity})`,
                                                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                            style: {
                                                                borderRadius: 10, 
                                                                paddingLeft: 20,
                                                                paddingRight: 20
                                                            },
                                                            propsForDots: {
                                                                r: '5',
                                                                strokeWidth: '2',
                                                                stroke: '#00cf98',
                                                                fill: '#00cf98'
                                                            },
                                                        }}
                                                        style={{
                                                            marginVertical: 8,
                                                            borderRadius: 16,
                                                        }}
                                                    />
                                                </View>
                                                {/* Information Below */}
                                                <View className="w-full h-[25%] bg-[#00CF98] px-5 border-t-[1px] border-[#00CF98]">
                                                    <Text className="text-white font-psemibold text-lg pt-3">{'Report Statistics'}</Text>
                                                    <Text className="text-slate-100 font-pregular text-sm">{`Updated ${formatTimeDifference(data.reports.mostRecentReportDate)}`}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            </View>
                        ) : isResponder ? (
                            <View className="w-full h-full bg-white items-center">
                                {/* Reports Collection */}
                                <View className="w-full h-[90%] top-[3%] mt-2">
                                    <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                        <View className={`w-full ${sortedReports.length > 0 && dashboardSelection === 'nearby'  ? 'h-3' : 'h-0'}`}/>
                                        {/* Nearby Category */}
                                        {dashboardSelection === 'nearby' && (
                                            sortedReports?.length > 0 ? (
                                                sortedReports?.map((report) => (
                                                    !expandedStates[report?.report_id] ? (
                                                        <View key={report.report_id} className="w-[96%] h-fit">
                                                            <TouchableHighlight
                                                                underlayColor={'#fffd99'}
                                                                className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}
                                                                onPress={() => toggleExpandDashboard(report.report_id)}
                                                            >
                                                                <>
                                                                    {/* Report Title */}
                                                                    <View className="w-[90%] h-fit mb-[1%] mt-[4%] px-4">
                                                                        <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                            {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                        </Text>
                                                                        {/* Status Dot */}
                                                                        <View className={`w-3 h-3 ${colorGenerator(report.report_status)} rounded-full absolute -right-[7%]`}/>
                                                                    </View>
                                                                    {/* Address */}
                                                                    <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                        <Text className="w-[68%] text-slate-500 font-pregular text-xs">{`${report.report_address} - ${report.distance}`}</Text>
                                                                        {/* Responders and User Count */}
                                                                        <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                                            <View className="w-[40%] h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#64748b'}
                                                                                    source={icons.aboutUs}
                                                                                    className="w-[50%] h-[50%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center">
                                                                                <Text className={`text-slate-500 font-pregular text-xs text-right`}>
                                                                                    {countContributors(report)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </>
                                                            </TouchableHighlight>
                                                        </View>
                                                    ) : (
                                                        <View key={report.report_id} className="w-[96%] h-fit items-center justify-center">
                                                            {/* Expanded View */}
                                                            <View className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}>
                                                                {/* Status Top */}
                                                                <View className="w-full h-8 mt-[4%] mb-[2%] px-4">
                                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" >
                                                                        {/* Time of Emergency */}
                                                                        <View className={`h-full bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden mr-2 px-2`}>
                                                                            {/* Time Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.time}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatTime(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* Distance of Emergency */}
                                                                        <View className={`h-full bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden mr-2 px-2`}>
                                                                            {/* Distance Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.address}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Distance Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {report.distance}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* Ambulance Needed */}
                                                                        {report.services.includes('ambulance') && (
                                                                            <View className="h-full bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden mr-2 pl-2 pr-4">
                                                                                <View className="w-12 h-full items-center justify-center">
                                                                                    <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.ambulance}
                                                                                    className="w-[70%] h-[70%]"
                                                                                    resizeMode="contain"
                                                                                    />
                                                                                </View>
                                                                                <View className="h-full justify-center">
                                                                                    <Text className="text-white font-pregular text-xs">
                                                                                        {'Ambulance Needed'}
                                                                                    </Text>
                                                                                </View>
                                                                            </View>
                                                                        )}
                                                                        {/* Firetruck Needed */}
                                                                        {report.services.includes('firetruck') && (
                                                                            <View className="h-full bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden mr-2 pl-2 pr-4">
                                                                                <View className="w-12 h-full items-center justify-center">
                                                                                    <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.fireTruck}
                                                                                    className="w-[70%] h-[70%]"
                                                                                    resizeMode="contain"
                                                                                    />
                                                                                </View>
                                                                                <View className="h-full justify-center">
                                                                                    <Text className="text-white font-pregular text-xs">
                                                                                        {'Firetruck Needed'}
                                                                                    </Text>
                                                                                </View>
                                                                            </View>
                                                                        )}
                                                                        {/* ID of Emergency */}
                                                                        <View className={`h-full bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden mr-2 px-2`}>
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.reportPoster}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">{report.report_id}</Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* Padding Because ScrollView is Retarded */}
                                                                        <View className={`bg-white ${report.services.length === 1 ? 'mr-16' : report.services.length > 1 ? 'mr-24' : 'mr-10'}`} />
                                                                    </ScrollView>
                                                                </View>
                                                                {/* Report Name */}
                                                                <View className="w-[90%] h-fit mb-[1%] px-4">
                                                                <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                    {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                </Text>
                                                                </View>
                                                                {/* Address */}
                                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                    <Text className="w-[80%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                    {/* Responders and User Count */}
                                                                    <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                                                        <View className="w-[40%] h-full items-center justify-center">
                                                                            <Image
                                                                                tintColor={'#64748b'}
                                                                                source={icons.aboutUs}
                                                                                className="w-[70%] h-[70%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        <View className="h-full justify-center">
                                                                            <Text className={`text-slate-500 font-pregular text-sm text-right`}>{countContributors(report)}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                {/* Expanded Stuff */}
                                                                <View className="w-full h-14 justify-center">
                                                                    <TouchableHighlight
                                                                        underlayColor={'#fffd99'}
                                                                        className={`w-full h-full flex-row bg-primary items-center px-4`}
                                                                        onPress={() => toggleExpandDashboard(report.report_id)}
                                                                    >
                                                                        <>
                                                                        {/* Handler Type Icon */}
                                                                        <View className="w-[10%] h-[80%] justify-center">
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={report.handler === 'fire_station' ? icons.fireLogo : report.handler === 'police' ? icons.policeLogo : report.handler === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        {/* Event Description Text */}
                                                                        <View className="w-[90%] h-[80%] justify-center">
                                                                            <Text className="text-white font-pregular text-xs">
                                                                                {`${translate(report.report_status)}: ${translate(report.report_type)}`}
                                                                            </Text>
                                                                        </View>
                                                                        </>
                                                                    </TouchableHighlight>
                                                                    {/* More Details */}
                                                                    <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                                        <TouchableHighlight
                                                                            underlayColor={'#86ebaa'}
                                                                            className="w-full h-full items-center justify-center rounded-2xl"
                                                                            onPress={() => handleMoreDetails(report.report_id)}
                                                                        >
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={icons.nextArrowBtn}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </TouchableHighlight>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* Options */}
                                                            <View className="w-full h-10 mt-3">
                                                                <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                    {/* Locate Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 ml-8`}
                                                                        underlayColor={'#bfffd6'} 
                                                                        onPress={() => handleLocate(report)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#57b378'}
                                                                                    source={icons.mapFocus}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Locate'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                    {/* Flag Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-yellow-500 border-[1px] overflow-hidden px-6 mx-2`}
                                                                        underlayColor={'#fffd99'} 
                                                                        onPress={() => handleFlag(report.report_id)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#eab308'}
                                                                                    source={icons.flag}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Flag False'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                    {/* Request for Deletion Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-red-500 border-[1px] overflow-hidden px-6 mr-8`}
                                                                        underlayColor={'#ffb0b0'}
                                                                        onPress={() => handleRequestDelete(report.report_id)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#e62210'}
                                                                                    source={icons.deletePhoto}
                                                                                    className="w-[50%] h-[50%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Request for Deletion'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                </ScrollView>
                                                            </View>
                                                        </View>
                                                    )
                                                ))
                                            ) : (
                                                <></>
                                            )
                                        )}
                                        {dashboardSelection === 'nearby' && !sortedReports?.length > 0 &&
                                            <View className="w-full h-16 items-center justify-center bg-primary-125 py-2">
                                                <Text className="text-base text-white font-pmedium text-center">{!isDuty ? 'Turn-on Duty to view reports' : `Stay tuned for reports`}</Text>
                                            </View>
                                        }
                                        {/** Recent Category
                                         * Reports Today
                                         */}
                                        {dashboardSelection === 'recent' && reportsToday?.length > 0 &&
                                            <View className="w-full h-16 items-center justify-center bg-primary-125 py-2">
                                                <Text className="text-base text-white font-pmedium text-center">{`Reports Today`}</Text>
                                            </View>
                                        }
                                        {dashboardSelection === 'recent' && (
                                            reportsToday?.length > 0 ? (
                                                reportsToday?.map((report) => (
                                                    !expandedStates[report?.report_id] ? (
                                                        <View key={report.report_id} className="w-[96%] h-fit">
                                                            <TouchableHighlight
                                                                underlayColor={'#fffd99'}
                                                                className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}
                                                                onPress={() => toggleExpandDashboard(report.report_id)}
                                                            >
                                                                <>
                                                                    {/* Report Title */}
                                                                    <View className="w-[90%] h-fit mb-[1%] mt-[4%] px-4">
                                                                        <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                            {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                        </Text>
                                                                    </View>
                                                                    {/* Address */}
                                                                    <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                        <Text className="w-[68%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                        {/* Responders and User Count */}
                                                                        <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                                            <View className="w-[40%] h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#64748b'}
                                                                                    source={icons.aboutUs}
                                                                                    className="w-[50%] h-[50%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center">
                                                                                <Text className={`text-slate-500 font-pregular text-xs text-right`}>
                                                                                    {countContributors(report)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </>
                                                            </TouchableHighlight>
                                                        </View>
                                                    ) : (
                                                        <View key={report.report_id} className="w-[96%] h-fit items-center justify-center">
                                                            {/* Expanded View */}
                                                            <View className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}>
                                                                {/* Status Top */}
                                                                <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                        {/* Time of Emergency */}
                                                                        <View className={`h-full ml-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            {/* Time Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.time}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatTime(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* Date of Emergency */}
                                                                        <View className={`h-full mx-2 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            {/* Date Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.date}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatRelativeDate(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* ID of Emergency */}
                                                                        <View className={`h-full mr-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.reportPoster}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">{report.report_id}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </ScrollView>
                                                                </View>
                                                                {/* Report Name */}
                                                                <View className="w-[90%] h-fit mb-[1%] px-4">
                                                                <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                    {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                </Text>
                                                                </View>
                                                                {/* Address */}
                                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                    <Text className="w-[80%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                    {/* Responders and User Count */}
                                                                    <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                                                        <View className="w-[40%] h-full items-center justify-center">
                                                                            <Image
                                                                                tintColor={'#64748b'}
                                                                                source={icons.aboutUs}
                                                                                className="w-[70%] h-[70%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        <View className="h-full justify-center">
                                                                            <Text className={`text-slate-500 font-pregular text-sm text-right`}>{countContributors(report)}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                {/* Expanded Stuff */}
                                                                <View className="w-full h-14 justify-center">
                                                                    <TouchableHighlight
                                                                        underlayColor={'#fffd99'}
                                                                        className={`w-full h-full flex-row ${colorGenerator(report.handler)} items-center px-4`}
                                                                        onPress={() => toggleExpandDashboard(report.report_id)}
                                                                    >
                                                                        <>
                                                                        {/* Handler Type Icon */}
                                                                        <View className="w-[10%] h-[80%] justify-center">
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={report.handler === 'fire_station' ? icons.fireLogo : report.handler === 'police' ? icons.policeLogo : report.handler === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        {/* Event Description Text */}
                                                                        <View className="w-[90%] h-[80%] justify-center">
                                                                            <Text className="text-white font-pregular text-xs">
                                                                                {`${report.report_status.charAt(0).toUpperCase() + report.report_status.slice(1)} Event: ${translate(report.report_type)}`}
                                                                            </Text>
                                                                        </View>
                                                                        </>
                                                                    </TouchableHighlight>
                                                                    <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                                        <TouchableHighlight
                                                                            underlayColor={'#86ebaa'}
                                                                            className="w-full h-full items-center justify-center rounded-2xl"
                                                                            onPress={() => handleMoreDetails(report.report_id)}
                                                                        >
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={icons.nextArrowBtn}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </TouchableHighlight>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* Options */}
                                                            <View className="w-full h-10 mt-3">
                                                                <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                    {/* Assist Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2 ml-2`}
                                                                        underlayColor={'#bfffd6'} 
                                                                        onPress={() => handleAssist(report)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#57b378'}
                                                                                    source={icons.assist}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Assist'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                    {/* Locate Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2`}
                                                                        underlayColor={'#bfffd6'} 
                                                                        onPress={() => handleLocate(report)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#57b378'}
                                                                                    source={icons.mapFocus}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Locate'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                </ScrollView>
                                                            </View>
                                                        </View>
                                                    )
                                                )
                                            )
                                            ) : (
                                                <></>
                                            )
                                        )}
                                        {/* Recent Reports */}
                                        {dashboardSelection === 'recent' && (sortedReports?.length > 0 ?
                                            <View className={`w-full h-16 items-center justify-center bg-primary-125 py-2 ${reportsToday?.length > 0 ? 'mt-4' : ''}`}>
                                                <Text className="text-base text-white font-pmedium text-center">{`Recent Reports`}</Text>
                                            </View>
                                            : 
                                            <View className={`w-full h-16 items-center justify-center bg-primary-125 py-2 ${reportsToday?.length > 0 ? 'mt-4' : ''}`}>
                                                <Text className="text-base text-white font-pmedium text-center">{!isDuty ? 'Turn-on Duty to view reports' : `Stay tuned for reports`}</Text>
                                            </View>)
                                        }
                                        {dashboardSelection === 'recent' && sortedReports?.map((report) => (
                                            !expandedStates[report?.report_id] ? (
                                                <View key={report.report_id} className="w-[96%] h-fit">
                                                    <TouchableHighlight
                                                        underlayColor={'#fffd99'}
                                                        className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}
                                                        onPress={() => toggleExpandDashboard(report.report_id)}
                                                    >
                                                        <>
                                                            {/* Report Title */}
                                                            <View className="w-[90%] h-fit mb-[1%] mt-[4%] px-4">
                                                                <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                    {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                </Text>
                                                            </View>
                                                            {/* Address */}
                                                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                <Text className="w-[68%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                {/* Responders and User Count */}
                                                                <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                                    <View className="w-[40%] h-full items-center justify-center">
                                                                        <Image
                                                                            tintColor={'#64748b'}
                                                                            source={icons.aboutUs}
                                                                            className="w-[50%] h-[50%]"
                                                                            resizeMode='contain'
                                                                        />
                                                                    </View>
                                                                    <View className="h-full justify-center">
                                                                        <Text className={`text-slate-500 font-pregular text-xs text-right`}>
                                                                            {countContributors(report)}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </>
                                                    </TouchableHighlight>
                                                </View>
                                            ) : (
                                                <View key={report.report_id} className="w-[96%] h-fit items-center justify-center">
                                                    {/* Expanded View */}
                                                    <View className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}>
                                                        {/* Status Top */}
                                                        <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                {/* Time of Emergency */}
                                                                <View className={`h-full ml-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                    {/* Time Icons */}
                                                                    <View className="w-6 h-full items-center justify-center">
                                                                        <Image
                                                                            tintColor={'#ffffff'}
                                                                            source={icons.time}
                                                                            className="w-[60%] h-[60%]"
                                                                            resizeMode='contain'
                                                                        />
                                                                    </View>
                                                                    {/* Time Text */}
                                                                    <View className="h-full justify-center pl-[4%]">
                                                                        <Text className="text-white font-pregular text-xs">
                                                                            {formatTime(report.incident_date || report.report_date)}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                                {/* Date of Emergency */}
                                                                <View className={`h-full mx-2 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                    {/* Date Icons */}
                                                                    <View className="w-6 h-full items-center justify-center">
                                                                        <Image
                                                                            tintColor={'#ffffff'}
                                                                            source={icons.date}
                                                                            className="w-[60%] h-[60%]"
                                                                            resizeMode='contain'
                                                                        />
                                                                    </View>
                                                                    {/* Time Text */}
                                                                    <View className="h-full justify-center pl-[4%]">
                                                                        <Text className="text-white font-pregular text-xs">
                                                                            {formatRelativeDate(report.incident_date || report.report_date)}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                                {/* ID of Emergency */}
                                                                <View className={`h-full mr-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                    <View className="w-6 h-full items-center justify-center">
                                                                        <Image
                                                                            tintColor={'#ffffff'}
                                                                            source={icons.reportPoster}
                                                                            className="w-[60%] h-[60%]"
                                                                            resizeMode='contain'
                                                                        />
                                                                    </View>
                                                                    <View className="h-full justify-center pl-[4%]">
                                                                        <Text className="text-white font-pregular text-xs">{report.report_id}</Text>
                                                                    </View>
                                                                </View>
                                                            </ScrollView>
                                                        </View>
                                                        {/* Report Name */}
                                                        <View className="w-[90%] h-fit mb-[1%] px-4">
                                                        <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                            {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                        </Text>
                                                        </View>
                                                        {/* Address */}
                                                        <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                            <Text className="w-[80%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                            {/* Responders and User Count */}
                                                            <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                                                <View className="w-[40%] h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#64748b'}
                                                                        source={icons.aboutUs}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center">
                                                                    <Text className={`text-slate-500 font-pregular text-sm text-right`}>{countContributors(report)}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                        {/* Expanded Stuff */}
                                                        <View className="w-full h-14 justify-center">
                                                            <TouchableHighlight
                                                                underlayColor={'#fffd99'}
                                                                className={`w-full h-full flex-row ${colorGenerator(report.handler)} items-center px-4`}
                                                                onPress={() => toggleExpandDashboard(report.report_id)}
                                                            >
                                                                <>
                                                                {/* Handler Type Icon */}
                                                                <View className="w-[10%] h-[80%] justify-center">
                                                                    <Image
                                                                        tintColor={'#ffffff'}
                                                                        source={report.handler === 'fire_station' ? icons.fireLogo : report.handler === 'police' ? icons.policeLogo : report.handler === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                                        className="w-[50%] h-[50%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                {/* Event Description Text */}
                                                                <View className="w-[90%] h-[80%] justify-center">
                                                                    <Text className="text-white font-pregular text-xs">
                                                                        {`${report.report_status.charAt(0).toUpperCase() + report.report_status.slice(1)} Event: ${translate(report.report_type)}`}
                                                                    </Text>
                                                                </View>
                                                                </>
                                                            </TouchableHighlight>
                                                            <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                                <TouchableHighlight
                                                                    underlayColor={'#86ebaa'}
                                                                    className="w-full h-full items-center justify-center rounded-2xl"
                                                                    onPress={() => handleMoreDetails(report.report_id)}
                                                                >
                                                                    <Image
                                                                        tintColor={'#ffffff'}
                                                                        source={icons.nextArrowBtn}
                                                                        className="w-[50%] h-[50%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </TouchableHighlight>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    {/* Options */}
                                                    <View className="w-full h-10 mt-3">
                                                    <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                            {/* Locate Button */}
                                                            <TouchableHighlight
                                                                className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6`}
                                                                underlayColor={'#bfffd6'} 
                                                                onPress={() => handleLocate(report)}
                                                            >
                                                                <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                    <View className="w-6 h-full items-center justify-center">
                                                                        <Image
                                                                            tintColor={'#57b378'}
                                                                            source={icons.mapFocus}
                                                                            className="w-[80%] h-[80%]"
                                                                            resizeMode='contain'
                                                                        />
                                                                    </View>
                                                                    <View className="h-full justify-center pl-[4%]">
                                                                        <Text className="text-black font-pregular text-sm">{'Locate'}</Text>
                                                                    </View>
                                                                </View>
                                                            </TouchableHighlight>
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                            )
                                        ))}
                                        {/** Active Category
                                         * Received Reports
                                         */}
                                        {dashboardSelection === 'active' && 
                                            receivedReports?.length > 0 ? (
                                                receivedReports?.map((report) => (
                                                    !expandedStates[report?.report_id] ? (
                                                        <View key={report.report_id} className="w-[96%] h-fit">
                                                            <TouchableHighlight
                                                                underlayColor={'#fffd99'}
                                                                className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}
                                                                onPress={() => toggleExpandDashboard(report.report_id)}
                                                            >
                                                                <>
                                                                    {/* Report Title */}
                                                                    <View className="w-[90%] h-fit mb-[1%] mt-[4%] px-4">
                                                                        <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                            {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                        </Text>
                                                                    </View>
                                                                    {/* Address */}
                                                                    <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                        <Text className="w-[68%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                        {/* Responders and User Count */}
                                                                        <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                                            <View className="w-[40%] h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#64748b'}
                                                                                    source={icons.aboutUs}
                                                                                    className="w-[50%] h-[50%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center">
                                                                                <Text className={`text-slate-500 font-pregular text-xs text-right`}>
                                                                                    {countContributors(report)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </>
                                                            </TouchableHighlight>
                                                        </View>
                                                    ) : (
                                                        <View key={report.report_id} className="w-[96%] h-fit items-center justify-center">
                                                            {/* Expanded View */}
                                                            <View className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}>
                                                                {/* Status Top */}
                                                                <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                        {/* Time of Emergency */}
                                                                        <View className={`h-full ml-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            {/* Time Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.time}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatTime(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* Date of Emergency */}
                                                                        <View className={`h-full mx-2 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            {/* Date Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.date}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatRelativeDate(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* ID of Emergency */}
                                                                        <View className={`h-full mr-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.reportPoster}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">{report.report_id}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </ScrollView>
                                                                </View>
                                                                {/* Report Name */}
                                                                <View className="w-[90%] h-fit mb-[1%] px-4">
                                                                <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                    {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                </Text>
                                                                </View>
                                                                {/* Address */}
                                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                    <Text className="w-[80%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                    {/* Responders and User Count */}
                                                                    <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                                                        <View className="w-[40%] h-full items-center justify-center">
                                                                            <Image
                                                                                tintColor={'#64748b'}
                                                                                source={icons.aboutUs}
                                                                                className="w-[70%] h-[70%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        <View className="h-full justify-center">
                                                                            <Text className={`text-slate-500 font-pregular text-sm text-right`}>{countContributors(report)}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                {/* Expanded Stuff */}
                                                                <View className="w-full h-14 justify-center">
                                                                    <TouchableHighlight
                                                                        underlayColor={'#fffd99'}
                                                                        className={`w-full h-full flex-row ${colorGenerator(report.handler)} items-center px-4`}
                                                                        onPress={() => toggleExpandDashboard(report.report_id)}
                                                                    >
                                                                        <>
                                                                        {/* Handler Type Icon */}
                                                                        <View className="w-[10%] h-[80%] justify-center">
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={report.handler === 'fire_station' ? icons.fireLogo : report.handler === 'police' ? icons.policeLogo : report.handler === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        {/* Event Description Text */}
                                                                        <View className="w-[90%] h-[80%] justify-center">
                                                                            <Text className="text-white font-pregular text-xs">
                                                                                {`${report.report_status.charAt(0).toUpperCase() + report.report_status.slice(1)} Event: ${translate(report.report_type)}`}
                                                                            </Text>
                                                                        </View>
                                                                        </>
                                                                    </TouchableHighlight>
                                                                    <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                                        <TouchableHighlight
                                                                            underlayColor={'#86ebaa'}
                                                                            className="w-full h-full items-center justify-center rounded-2xl"
                                                                            onPress={() => handleMoreDetails(report.report_id)}
                                                                        >
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={icons.nextArrowBtn}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </TouchableHighlight>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* Options */}
                                                            <View className="w-full h-10 mt-3">
                                                                <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                    {/* Locate Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 ml-8`}
                                                                        underlayColor={'#bfffd6'} 
                                                                        onPress={() => handleLocate(report)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#57b378'}
                                                                                    source={icons.mapFocus}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Locate'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                    {/* Flag Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-yellow-500 border-[1px] overflow-hidden px-6 mx-2`}
                                                                        underlayColor={'#fffd99'} 
                                                                        onPress={() => handleFlag(report.report_id)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#eab308'}
                                                                                    source={icons.flag}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Flag False'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                    {/* Request for Deletion Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-red-500 border-[1px] overflow-hidden px-6 mr-8`}
                                                                        underlayColor={'#ffb0b0'}
                                                                        onPress={() => handleRequestDelete(report.report_id)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#e62210'}
                                                                                    source={icons.deletePhoto}
                                                                                    className="w-[50%] h-[50%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Request for Deletion'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                </ScrollView>
                                                            </View>
                                                        </View>
                                                    )
                                                ))
                                            ) : (
                                                <></>
                                            )
                                        }
                                        {/* Responder Reports */}
                                        {dashboardSelection === 'active' &&
                                            sortedReports?.length > 0 ? (
                                                sortedReports?.map((report) => (
                                                    !expandedStates[report?.report_id] ? (
                                                        <View key={report.report_id} className="w-[96%] h-fit">
                                                            <TouchableHighlight
                                                                underlayColor={'#fffd99'}
                                                                className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}
                                                                onPress={() => toggleExpandDashboard(report.report_id)}
                                                            >
                                                                <>
                                                                    {/* Report Title */}
                                                                    <View className="w-[90%] h-fit mb-[1%] mt-[4%] px-4">
                                                                        <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                            {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                        </Text>
                                                                    </View>
                                                                    {/* Address */}
                                                                    <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                        <Text className="w-[68%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                        {/* Responders and User Count */}
                                                                        <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                                            <View className="w-[40%] h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#64748b'}
                                                                                    source={icons.aboutUs}
                                                                                    className="w-[50%] h-[50%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center">
                                                                                <Text className={`text-slate-500 font-pregular text-xs text-right`}>
                                                                                    {countContributors(report)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                </>
                                                            </TouchableHighlight>
                                                        </View>
                                                    ) : (
                                                        <View key={report.report_id} className="w-[96%] h-fit items-center justify-center">
                                                            {/* Expanded View */}
                                                            <View className={`w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden`}>
                                                                {/* Status Top */}
                                                                <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                        {/* Time of Emergency */}
                                                                        <View className={`h-full ml-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            {/* Time Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.time}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatTime(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* Date of Emergency */}
                                                                        <View className={`h-full mx-2 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            {/* Date Icons */}
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.date}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            {/* Time Text */}
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">
                                                                                    {formatRelativeDate(report.incident_date || report.report_date)}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                        {/* ID of Emergency */}
                                                                        <View className={`h-full mr-6 ${colorGenerator(report.handler)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#ffffff'}
                                                                                    source={icons.reportPoster}
                                                                                    className="w-[60%] h-[60%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-white font-pregular text-xs">{report.report_id}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </ScrollView>
                                                                </View>
                                                                {/* Report Name */}
                                                                <View className="w-[90%] h-fit mb-[1%] px-4">
                                                                <Text className={`text-primary-300 font-psemibold text-sm`}>
                                                                    {`${getRelevantAddressParts(report.report_address)} - ${translate(report.report_type)}`}
                                                                </Text>
                                                                </View>
                                                                {/* Address */}
                                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                                    <Text className="w-[80%] text-slate-500 font-pregular text-xs">{report.report_address}</Text>
                                                                    {/* Responders and User Count */}
                                                                    <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                                                        <View className="w-[40%] h-full items-center justify-center">
                                                                            <Image
                                                                                tintColor={'#64748b'}
                                                                                source={icons.aboutUs}
                                                                                className="w-[70%] h-[70%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        <View className="h-full justify-center">
                                                                            <Text className={`text-slate-500 font-pregular text-sm text-right`}>{countContributors(report)}</Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                                {/* Expanded Stuff */}
                                                                <View className="w-full h-14 justify-center">
                                                                    <TouchableHighlight
                                                                        underlayColor={'#fffd99'}
                                                                        className={`w-full h-full flex-row ${colorGenerator(report.handler)} items-center px-4`}
                                                                        onPress={() => toggleExpandDashboard(report.report_id)}
                                                                    >
                                                                        <>
                                                                        {/* Handler Type Icon */}
                                                                        <View className="w-[10%] h-[80%] justify-center">
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={report.handler === 'fire_station' ? icons.fireLogo : report.handler === 'police' ? icons.policeLogo : report.handler === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </View>
                                                                        {/* Event Description Text */}
                                                                        <View className="w-[90%] h-[80%] justify-center">
                                                                            <Text className="text-white font-pregular text-xs">
                                                                                {`${report.report_status.charAt(0).toUpperCase() + report.report_status.slice(1)} Event: ${translate(report.report_type)}`}
                                                                            </Text>
                                                                        </View>
                                                                        </>
                                                                    </TouchableHighlight>
                                                                    <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                                        <TouchableHighlight
                                                                            underlayColor={'#86ebaa'}
                                                                            className="w-full h-full items-center justify-center rounded-2xl"
                                                                            onPress={() => handleMoreDetails(report.report_id)}
                                                                        >
                                                                            <Image
                                                                                tintColor={'#ffffff'}
                                                                                source={icons.nextArrowBtn}
                                                                                className="w-[50%] h-[50%]"
                                                                                resizeMode='contain'
                                                                            />
                                                                        </TouchableHighlight>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* Options */}
                                                            <View className="w-full h-10 mt-3">
                                                                <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                                    {/* Locate Button */}
                                                                    <TouchableHighlight
                                                                        className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6`}
                                                                        underlayColor={'#bfffd6'} 
                                                                        onPress={() => handleLocate(report)}
                                                                    >
                                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                            <View className="w-6 h-full items-center justify-center">
                                                                                <Image
                                                                                    tintColor={'#57b378'}
                                                                                    source={icons.mapFocus}
                                                                                    className="w-[80%] h-[80%]"
                                                                                    resizeMode='contain'
                                                                                />
                                                                            </View>
                                                                            <View className="h-full justify-center pl-[4%]">
                                                                                <Text className="text-black font-pregular text-sm">{'Locate'}</Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                </ScrollView>
                                                            </View>
                                                        </View>
                                                    )
                                                ))
                                            ) : (
                                                <></>
                                            )
                                        }
                                        <View className="w-full mb-6" />
                                    </ScrollView>
                                </View>
                            </View>
                        ) : (
                            <View className="w-full h-full bg-primary items-center justify-center">
                                {/* Community User - Home Screen */}
                                {!loginLoading && (<>
                                    {/* User Greetings */}
                                    <View className={`w-full h-[10%] items-center absolute top-[12%]`}>
                                        {/* User Greeting */}
                                        <Text className="text-white font-pregular text-2xl px-4">{getGreeting()}
                                            <Text className="font-pbold">
                                                {user ? user.full_name.first_name : 'User'}
                                            </Text>
                                        </Text>
                                    </View>
                                    {/* Report Button */}
                                    <View className="w-[80%] h-[50%] items-center justify-center">
                                        {/* Report Button */}
                                        <View className="w-80 h-80 bg-primary items-center justify-center rounded-full shadow-lg shadow-black">
                                            <TouchableHighlight underlayColor={"#fffd99"} className={`w-[80%] h-[80%] bg-white rounded-full items-center justify-center p-2`} onPress={() => handleChangePage('home/reports')}>
                                                <Image
                                                    tintColor="#57b378"
                                                    source={icons.reportDashboard}
                                                    className="w-[80%] h-[80%]"
                                                    resizeMode='contain'
                                                />
                                            </TouchableHighlight>
                                        </View>
                                        {/* Button Detail */}
                                        <Text className="text-white font-psemibold text-xl pt-8 text-center">
                                            {'File an Emergency\nby pressing the\n'}
                                            <Text className="text-2xl font-pbold text-white">
                                                {'REPORT BUTTON'}
                                            </Text>
                                        </Text>
                                    </View>
                                    {/* Quick Buttons */}
                                    <View className={`w-full h-[15%] items-center justify-center flex-row absolute bottom-0`}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                            {/* Intensity Map */}
                                            <TouchableHighlight underlayColor={'#acfcc8'} className="w-48 h-[70%] bg-white rounded-lg shadow-sm shadow-black ml-2 overflow-hidden" onPress={handleIntensity}>
                                                <View className="w-full h-full items-center flex-row">
                                                    <View className="w-[70%] h-[80%] justify-center pl-[8%]">
                                                        <Text className="text-primary-100 font-psemibold text-base">{"Intensity Map"}</Text>
                                                        <Text className="text-slate-400 font-pmedium text-xs">{'Enable Map Filter'}</Text>
                                                    </View>
                                                    <View className="w-[30%] h-[80%] items-center justify-center">
                                                        <Image 
                                                            source={icons.mapEIM}
                                                            className="w-[70%] h-[70%]"
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableHighlight>
                                            {/* Report History */}
                                            <TouchableHighlight underlayColor={'#acfcc8'} className="w-48 h-[70%] bg-white rounded-lg shadow-sm shadow-black mx-2 overflow-hidden" onPress={() => handleChangePage('home/details')}>
                                                <View className="w-full h-full items-center flex-row">
                                                <View className="w-[70%] h-[80%] justify-center pl-[8%]">
                                                        <Text className="text-primary-100 font-psemibold text-base">{"Report History"}</Text>
                                                        <Text className="text-slate-400 font-pmedium text-xs">{'Check Previous Reports'}</Text>
                                                    </View>
                                                    <View className="w-[30%] h-[80%] items-center justify-center">
                                                        <Image
                                                            tintColor={'#57b378'}
                                                            source={icons.detailHomeOn}
                                                            className="w-[70%] h-[70%]"
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableHighlight>
                                        </ScrollView>
                                    </View>
                                </>)}
                            </View>
                        )}
                    </View>
                )}
            </View>
            {/* Status Bar */}
            <StatusBar backgroundColor={mapSelect === 'intensity' ? '#3e664c' : '#57b378'} style={'light'} />
        </SafeAreaView>
    )
}

export default HomeScreen;
import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, TouchableHighlight, ScrollView, ActivityIndicator, BackHandler, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
import ToolsContext from '../../../components/ToolsContext';
import { Success, Failed, Menu } from '../../../components/modals';
import { translate, getTitle, setTitle } from '../../../components/ToolsContext';

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

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const HomeScreen = () => {
    // Global Variables
    const { user, isResponder, isAdmin, typeAdmin } = useContext(UserContext); // User Container
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
        setDashboardSelection(value);
    };

    // Expand Report
    const toggleExpandDashboard = (value) => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX
            },
        });
        setExpandDashboard(value);
    };

    // Template Button
    const handleOK = () => {
        return;
    };
    
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
                                    {isResponder ? (
                                        <View className="w-full h-[40%] rounded-2xl flex-row overflow-hidden border-[1px] border-primary-125 z-10">
                                            {/* Nearby */}
                                            <View className="w-1/3 h-full">
                                                <TouchableHighlight underlayColor={'#86ebaa'} className={`w-full h-full items-center justify-center ${dashboardSelection === 'nearby' ? 'bg-primary-125' : 'bg-primary'}`} onPress={() => changeDashboard('nearby')} disabled={dashboardSelection === 'nearby'}>
                                                    <Text className={`${dashboardSelection === 'nearby' ? 'text-white font-psemibold' : 'text-primary-125 font-pregular'} text-sm`}>{'Nearby'}</Text>
                                                </TouchableHighlight>
                                            </View>
                                            {/* Active */}
                                            <View className="w-1/3 h-full">
                                                <TouchableHighlight underlayColor={'#86ebaa'} className={`w-full h-full items-center justify-center ${dashboardSelection === 'active' ? 'bg-primary-125' : 'bg-primary'} border-x-[1px] border-primary-125`} onPress={() => changeDashboard('active')} disabled={dashboardSelection === 'active'}>
                                                    <Text className={`${dashboardSelection === 'active' ? 'text-white font-psemibold' : 'text-primary-125 font-pregular'} text-sm`}>{'Active'}</Text>
                                                </TouchableHighlight>
                                            </View>
                                            {/* All */}
                                            <View className="w-1/3 h-full">
                                                <TouchableHighlight underlayColor={'#86ebaa'} className={`w-full h-full items-center justify-center ${dashboardSelection === 'all' ? 'bg-primary-125' : 'bg-primary'}`} onPress={() => changeDashboard('all')} disabled={dashboardSelection === 'all'}>
                                                    <Text className={`${dashboardSelection === 'all' ? 'text-white font-psemibold' : 'text-primary-125 font-pregular'} text-sm`}>{'All'}</Text>
                                                </TouchableHighlight>
                                            </View>
                                        </View>
                                     ) : (
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
                                     )}
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
                    <MapScreen selectedMap={mapSelect} changeMap={setMapSelect} changePage={handleChangePage} backPage={handleBackButton} status={setStatus} savings={setStatusSuccess} loadings={setStatusLoading} fails={setStatusFailed} hideMenu={toggleMenu}/>
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
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        {isAdmin ? (
                            <View className="w-full h-full bg-white items-center">
                            </View>
                        ) : isResponder ? (
                            <View className="w-full h-full bg-white items-center">
                                {/* Reports Collection */}
                                <View className="w-full h-[85%] top-[4%]">
                                    <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                        {!expandDashboard ? (
                                            <View className="w-[96%] h-fit">
                                                <TouchableHighlight underlayColor={'#86ebaa'} className="w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden" onPress={() => toggleExpandDashboard(true)}>
                                                    <>
                                                        {/* Description */}
                                                        <View className="w-[90%] h-fit mb-[1%] mt-[4%] px-4">
                                                            <Text className="text-primary-300 font-psemibold text-base">{'Trece Martires, Cavite - Structural Fire'}</Text>
                                                        </View>
                                                        {/* Address of Emergency */}
                                                        <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                            <Text className="w-[80%] text-slate-500 font-pregular text-sm">{'Trece Martires - Indang Road, Trece Martires, Cavite'}</Text>
                                                            {/* People */}
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
                                                                    <Text className="text-slate-500 font-pregular text-sm text-right">{'12'}</Text>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </>
                                                </TouchableHighlight>
                                            </View>
                                        ) : (
                                            <View className="w-[96%] h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden">
                                                {/* Top Status */}
                                                <View className="w-full h-8 mt-[4%] mb-[2%] px-4">
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                        {/* Time of Emergency */}
                                                        <View className="h-full mx-2 bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden px-2">
                                                            <View className="w-6 h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={'#ffffff'}
                                                                    source={icons.notificationOn}
                                                                    className="w-[70%] h-[70%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[2%]">
                                                                <Text className="text-white font-pregular text-sm">{'12:23 PM'}</Text>
                                                            </View>
                                                        </View>
                                                        {/* Address of Emergency */}
                                                        <View className="h-full mx-2 bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden px-2">
                                                            <View className="w-6 h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={'#ffffff'}
                                                                    source={icons.address}
                                                                    className="w-[60%] h-[60%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[4%]">
                                                                <Text className="text-white font-pregular text-sm">{'125.56 km'}</Text>
                                                            </View>
                                                        </View>
                                                        {/* Ambulance Needed */}
                                                        {/* <View className="w-52 h-full mx-2 bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden px-2">
                                                            <View className="w-[20%] h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={'#ffffff'}
                                                                    source={icons.ambulance}
                                                                    className="w-[70%] h-[70%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="w-[80%] h-full justify-center">
                                                                <Text className="text-white font-pregular text-sm">{'Ambulance Needed'}</Text>
                                                            </View>
                                                        </View> */}
                                                    </ScrollView>
                                                </View>
                                                {/* Description */}
                                                <View className="w-[90%] h-fit mb-[1%] px-4">
                                                    <Text className="text-primary-300 font-psemibold text-base">{'Trece Martires, Cavite - Structural Fire'}</Text>
                                                </View>
                                                {/* Address of Emergency */}
                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                    <Text className="w-[80%] text-slate-500 font-pregular text-sm">{'Trece Martires - Indang Road, Trece Martires, Cavite'}</Text>
                                                    {/* People */}
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
                                                            <Text className="text-slate-500 font-pregular text-sm text-right">{'12'}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                {/* Expanded View */}
                                                <View className="w-full h-14 justify-center">
                                                    <TouchableHighlight underlayColor={'#86ebaa'} className="w-full h-full flex-row bg-primary items-center px-4" onPress={() => toggleExpandDashboard(false)}>
                                                        <>
                                                            {/* Handler Icon */}
                                                            <View className="w-[10%] h-[80%] justify-center">
                                                                <Image
                                                                    tintColor={'#ffffff'}
                                                                    source={icons.fireLogo}
                                                                    className="w-[50%] h-[50%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            {/* Status Event */}
                                                            <View className="w-[90%] h-[80%] justify-center">
                                                                <Text className="text-white font-pregular text-sm">{'Active Event: Small House Fire'}</Text>
                                                            </View>
                                                        </>
                                                    </TouchableHighlight>
                                                    {/* Next Button */}
                                                    <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                        <TouchableHighlight underlayColor={'#86ebaa'} className="w-full h-full items-center justify-center rounded-2xl" onPress={handleOK}>
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={icons.nextArrowBtn}
                                                                className="w-[70%] h-[70%]"
                                                                resizeMode='contain'
                                                            />
                                                        </TouchableHighlight>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
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
                                            <TouchableHighlight underlayColor={'#acfcc8'} className="w-48 h-[70%] bg-white rounded-lg shadow-sm shadow-black ml-2 overflow-hidden" onPress={() => handleChangePage('home/details')}>
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
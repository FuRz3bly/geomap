import { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, Image, Button, ScrollView, ActivityIndicator, BackHandler, TouchableOpacity, TouchableHighlight, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { onSnapshot, collection, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { getID, containID, translate } from '../../../components/ToolsContext';
import { images, icons } from '../../../constants';

const DetailScreen = ({ changePage, backPage, status, loadings, savings }) => {
    // Global Variables
    const { width, height } = Dimensions.get('screen');
    const { user, isResponder } = useContext(UserContext);
    const { dictionary } = useContext(ToolsContext);
    const [reportID, setLocalID] = useState(getID());
    // Local Variables
    const scrollRef = useRef(null); // Scroll View Reference
    const buttonScrollRef = useRef(null); // Buttons Reference
    const [btnScrollKey, setBtnScrollKey] = useState(0);
    const [loading, setLoading] = useState(true); // Add loading state
    const [photoLoading, setPhotoLoading] = useState(true); // Photo Loading Container
    const [userExpand, toggleUserExpand] = useState(false); // User Details Expand Container
    const [respoExpand, toggleRespoExpand] = useState(false); // Responder Details Expand Container
    const [reports, setReports] = useState([]); // Reports Container
    const [selectedReport, setSelectedReport] = useState(null); // Selected Report Container
    const [buttonInfo, toggleButtonInfo] = useState(false);
    
    const [userUID, setUserUID] = useState('');
    const [totalReports, setTotalReports] = useState(0);

    // Allow the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            //changePage('home/homes');
            backPage();
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setLocalID(getID());
    }, [getID, containID]);

    // Real-time listener and filter of reports
    useEffect(() => {
        status('loading');
        loadings('LOADING REPORTS');
        const fetchReports = () => {
            const q = query(collection(db, 'reports'));
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const reportsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
    
                // Filter reports by the logged-in user's UID
                const filteredReports = reportsList.filter(report => 
                    report.user_report?.uid === user?.uid || report.responder?.uid === user?.uid
                );
    
                filteredReports.sort((a, b) => {
                    const dateA = a.report_date ? new Date(a.report_date.seconds * 1000) : 0;
                    const dateB = b.report_date ? new Date(b.report_date.seconds * 1000) : 0;
                    return dateB - dateA;
                });
    
                setReports(filteredReports);
    
                // Check if a reportID is provided
                if (reportID) {
                    const matchingReport = filteredReports.find(report => report.report_id === reportID);
                    if (matchingReport) {
                        const reportIndex = filteredReports.findIndex(report => report.report_id === reportID);
                        
                        // Set the selected report and call toggleSelectedReport
                        setSelectedReport(matchingReport);
                        toggleSelectedReport(matchingReport, reportIndex); // Pass the report and index here

                        setBtnScrollKey(prevKey => prevKey + 1);
                        savings('REPORTS LOADED');
                        status('success');
                        setLoading(false);

                        buttonScrollRef.current?.scrollTo({ x: 0, animated: true });
                        containID(null);
                    }
                } else {
                    // Default to the newest report
                    setSelectedReport(filteredReports[0]);
                    savings('REPORTS LOADED');
                    status('success');
                    setLoading(false);
                    buttonScrollRef.current?.scrollTo({ x: 0, animated: true });
                }
            });
    
            // Cleanup listener on component unmount
            return () => unsubscribe();
        };
    
        fetchReports();
    }, [reportID, user?.uid]);

    useEffect(() => {
        const fetchUserReports = async () => {
            if (!userUID) return; // Only fetch if userUID is set
            
            try {
                const userDocRef = doc(db, 'users', userUID);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const totalReports = userData.reports || 0;
                    
                    setTotalReports(totalReports); // Update the state to display the total reports
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        fetchUserReports();
    }, [userUID]); // Fetch user data whenever userUID changes

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
            toggleButtonInfo(false);
        }, 4000);

        // Cleanup timeouts when the component is unmounted
        return () => {
            clearTimeout(firstToggle);
        };
    }, [buttonInfo]);

    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    // Passive Functions
    const additionalHeight = (userExpand ? 100 : 0) + (respoExpand ? 120 : 0);
    const adjustedHeight = height + additionalHeight;

    // Calculator of Time
    const calculator = ({ reportDate, receivedTime }) => {
        // Check if either date is undefined
        if (!reportDate || !receivedTime) {
          return "N/A";
        }
      
        // Helper function to convert input to JavaScript Date object
        const toDateObject = (date) => {
          if (typeof date.toDate === 'function') {
            return date.toDate(); // Firestore Timestamp
          } else {
            return new Date(date); // Regular Date or String
          }
        };
      
        // Convert the inputs to JavaScript Date objects
        const reportDateTime = toDateObject(reportDate);
        const receivedDateTime = toDateObject(receivedTime);
      
        // Get the difference in milliseconds
        const diffMs = receivedDateTime - reportDateTime;
      
        // Convert to seconds, minutes, and hours
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
      
        // Logic for displaying time difference
        if (diffMinutes < 1) {
          return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`;
        } else if (diffMinutes < 60) {
          return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        } else {
          return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
        }
    };

    // Format Phone number
    const formatNumber = (phoneNumber) => {
        if (!phoneNumber) {
          return '';
        }

        let formattedNumber;

        // Check if the phone number starts with '0'
        if (phoneNumber.startsWith('0')) {
          formattedNumber = phoneNumber.replace(/^0/, '(+63)-');
        } else {
          formattedNumber = `(+63)-${phoneNumber}`;
        }
      
        // Insert hyphens at the desired positions
        return formattedNumber.replace(/(\d{3})[- ]?(\d{3})[- ]?(\d{4})/, '$1-$2-$3');
    };

    // Icon Generator Function
    const colorGenerator = (key) => {
        const colorKey = dictionary[key + '_color'];
        return colorKey;
    };

    // If Photo is Loaded
    const loadPhoto = () => {
        setPhotoLoading(false);
    };

    // Report Buttons Pressed
    const toggleSelectedReport = (report, index) => {
        setSelectedReport(report);
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
        setPhotoLoading(true);
        toggleUserExpand(false);
        toggleRespoExpand(false);
        LayoutAnimation.configureNext({
            duration: 500,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
        });
        const buttonWidth = (width < 400 ? width/3 + 18 : 150);
        const offset = buttonWidth * index;

        // Scroll to the position of the selected report
        setTimeout(() => {
            buttonScrollRef.current?.scrollTo({ x: offset, animated: true });
        }, 200);
    };

    // Toggle User Expansions
    const handleUserExpand = (uid) => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
        });
        toggleUserExpand(!userExpand);
        setUserUID(uid);
    };

    // Toggle Responder Expansions
    const handleRespoExpand = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
        });
        toggleRespoExpand(!respoExpand);
    };

    // Print Button Pressed
    const handlePrint = (id) => {
        containID(id);
        changePage('home/documents');
        status('loading');
        loadings('LOADING DATA');
    };

    const reportFile = (report) => (
        <View className="w-full h-[90%] bg-white px-4 py-2">
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} decelerationRate={'normal'} className="w-full h-full" contentContainerStyle={{ width: width, height: adjustedHeight }}>
                {/* Report ID */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Report ID Label */}
                        <Text className="font-rbold text-base text-black text-justify">
                            {'Report ID:'}
                        </Text>
                    </View>
                    <View className="w-2 h-full mr-2"/>
                    <View className="w-4/6 h-full">
                        {/* Report ID */}
                        <Text className="font-rbase text-base text-black">
                            {`#${report?.report_id ? report.report_id : 'N/A'}`}
                        </Text>
                    </View>
                </View>
                {/* Status */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Status Label */}
                        <Text className="font-rbold text-base text-black text-justify">
                            {'Status:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full ${colorGenerator(report.report_status)} mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Status Details */}
                        <Text className="font-rbase text-base text-black">
                            {translate(report?.report_status ? report.report_status : 'N/A')}
                        </Text>
                    </View>
                </View>
                {/* Report Type */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Report Type Label */}
                        <Text className="font-rbold text-base text-black text-justify">
                            {'Report Type:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full ${colorGenerator(report?.handler)} mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Handler Details */}
                        <Text className="font-rbase text-base text-black">
                            {translate(report?.report_type ? report.report_type : 'N/A')}
                        </Text>
                    </View>
                </View>
                {/* Reporter Details */}
                {userExpand ? (
                    <TouchableHighlight underlayColor={"#bfffd6"} className={`w-[95%] ${respoExpand ? (height <= 900 ? 'h-[15%]' : 'h-[14%]') : (height <= 900 ? 'h-[17%]' : 'h-[15%]')} justify-center my-4 bg-white border-y-0.5 border-primary py-3`} onPress={() => handleUserExpand(report.user_report.uid)}>
                        <>
                            <View className="w-full h-6 flex-row">
                                {/* Full Name Label */}
                                <View className="w-2/6 h-full">
                                    <Text className="font-rbold text-base text-black text-justify">
                                        {'Full Name:'}
                                    </Text>
                                </View>
                                <View className="w-2 h-full mr-2"/>
                                {/* Full Name */}
                                <View className="w-3/6 h-full">
                                    <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                        {report?.user_report ? `${report.user_report?.full_name.first_name} ${report.user_report?.full_name.middle_name} ${report.user_report?.full_name.last_name}` : 'N/A'}
                                    </Text>
                                </View>
                                {/* Icon Expand */}
                                <View className="w-1/6 h-full justify-center">
                                    <Image 
                                        tintColor={'#57b378'}
                                        source={icons.expandUp}
                                        className="w-[40%] h-[40%] absolute right-[50%]"
                                        resizeMode='contain'
                                    />
                                </View>
                            </View>
                            <View className="w-full h-6 flex-row">
                                {/* Username Label */}
                                <View className="w-2/6 h-full">
                                    <Text className="font-rbold text-base text-black text-justify">
                                        {'Username:'}
                                    </Text>
                                </View>
                                <View className="w-2 h-full mr-2"/>
                                {/* Full Name */}
                                <View className="w-3/6 h-full">
                                    <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                        {report?.user_report ? report.user_report.username : 'N/A'}
                                    </Text>
                                </View>
                                <View className="w-1/6 h-full justify-center" />
                            </View>
                            <View className="w-full h-6 flex-row">
                                {/* Address Label */}
                                <View className="w-2/6 h-full">
                                    <Text className="font-rbold text-base text-black text-justify">
                                        {'Address:'}
                                    </Text>
                                </View>
                                <View className="w-2 h-full mr-2"/>
                                {/* Address */}
                                <View className="w-3/6 h-full">
                                    <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                        {report?.user_report ? report.user_report.address : 'N/A'}
                                    </Text>
                                </View>
                                <View className="w-1/6 h-full justify-center" />
                            </View>
                            <View className="w-full h-6 flex-row">
                                {/* Phone Number Label */}
                                <View className="w-2/6 h-full">
                                    <Text className="font-rbold text-base text-black text-justify">
                                        {'Phone Number:'}
                                    </Text>
                                </View>
                                <View className="w-2 h-full mr-2"/>
                                {/* Phone Number */}
                                <View className="w-3/6 h-full">
                                    <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                        {report?.user_report ? formatNumber(report.user_report.phone_number) : 'N/A'}
                                    </Text>
                                </View>
                                <View className="w-1/6 h-full justify-center" />
                            </View>
                            <View className="w-full h-6 flex-row">
                                {/* Email Label */}
                                <View className="w-2/6 h-full">
                                    <Text className="font-rbold text-base text-black text-justify">
                                        {'Email:'}
                                    </Text>
                                </View>
                                <View className="w-2 h-full mr-2"/>
                                {/* Email */}
                                <View className="w-3/6 h-full">
                                    <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                        {report?.user_report ? report.user_report.email : 'N/A'}
                                    </Text>
                                </View>
                                <View className="w-1/6 h-full justify-center" />
                            </View>
                            <View className="w-full h-6 flex-row">
                                {/* Total Reports Label */}
                                <View className="w-2/6 h-full">
                                    <Text className="font-rbold text-base text-black text-justify">
                                        {'Total Reports:'}
                                    </Text>
                                </View>
                                <View className="w-2 h-full mr-2"/>
                                {/* Total Reports */}
                                <View className="w-3/6 h-full">
                                    <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                        {String(totalReports !== undefined ? totalReports : 0).padStart(3, '0')}
                                    </Text>
                                </View>
                                <View className="w-1/6 h-full justify-center" />
                            </View>
                        </>
                    </TouchableHighlight>
                ) : (
                    <TouchableHighlight underlayColor={"#bfffd6"} className="w-[95%] h-[5%] my-4 justify-center bg-white border-y-0.5 border-primary" onPress={() => handleUserExpand(report.user_report.uid)}>
                        <View className="w-full h-[60%] flex-row">
                            {/* Reporter Label */}
                            <View className="w-2/6 h-full">
                                <Text className="font-rbold text-base text-black text-justify">
                                    {'Reporter:'}
                                </Text>
                            </View>
                            <View className="w-2 h-full mr-2"/>
                            {/* Reporter Name */}
                            <View className="w-3/6 h-full">
                                <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                    {report?.user_report ? `${report.user_report?.full_name.first_name} ${report.user_report?.full_name.last_name}` : 'N/A'}
                                </Text>
                            </View>
                            {/* Icon Expand */}
                            <View className="w-1/6 h-full justify-center">
                                <Image 
                                    tintColor={'#57b378'}
                                    source={icons.expandDown}
                                    className="w-[40%] h-[40%] absolute right-[50%]"
                                    resizeMode='contain'
                                />
                            </View>
                        </View>
                    </TouchableHighlight>
                )}
                {/* Contact Method */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Contact Method Label */}
                        <Text className="font-rbold text-base text-black text-justify" numberOfLines={1}>
                            {'Contact Method:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Contact Method */}
                        <Text className="font-rbase text-base text-black">
                            {translate(report?.coms ? report.coms : 'N/A')}
                        </Text>
                    </View>
                </View>
                {/* Report Date & Time */}
                <View className="w-[95%] h-12 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Report Date & Time Label */}
                        <Text className="font-rbold text-base text-black" numberOfLines={2}>
                            {'Report Date\n& Time:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full mr-2`} />
                    <View className="w-4/6 h-full justify-center">
                        {/* Report Date & Time */}
                        <Text className="font-rbase text-base text-black">
                        {report?.report_date
                        ? (typeof report.report_date.toDate === 'function'
                            ? report.report_date.toDate().toLocaleDateString()
                            : new Date(report.report_date).toLocaleDateString())
                        : 'N/A'}
                        {"  |  "}
                        {report?.report_date
                        ? (typeof report.report_date.toDate === 'function'
                            ? report.report_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(report.report_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                        : 'N/A'}
                        </Text>
                    </View>
                </View>
                {/* Incident Time */}
                {report?.incident_date ? (
                    <View className="w-[95%] h-6 flex-row">
                        <View className="w-2/6 h-full">
                            {/* Incident Time Label */}
                            <Text className="font-rbold text-base text-black" numberOfLines={2}>
                                {'Incident Time:'}
                            </Text>
                        </View>
                        <View className={`w-2 h-full mr-2`} />
                        <View className="w-4/6 h-full justify-center">
                            {/* Incident Date & Time */}
                            <Text className="font-rbase text-base text-black">
                            {report?.incident_date
                            ? (typeof report.incident_date.toDate === 'function'
                                ? report.incident_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(report.incident_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : 'N/A'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <></>
                )}
                {/* Location */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Location Label */}
                        <Text className="font-rbold text-base text-black text-justify" numberOfLines={1}>
                            {'Location:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Location */}
                        <Text className="font-rbase text-base text-black">
                            {report?.report_location?.latitude.toFixed(5)}{"   |   "}{report?.report_location?.longitude.toFixed(5)}
                        </Text>
                    </View>
                </View>
                {/* Address */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Address Label */}
                        <Text className="font-rbold text-base text-black text-justify" numberOfLines={1}>
                            {'Address:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Address */}
                        <Text className="font-rbase text-base text-black">
                            {report?.report_address ? report.report_address : 'N/A'}
                        </Text>
                    </View>
                </View>
                {/* Handler */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Handler Label */}
                        <Text className="font-rbold text-base text-black text-justify">
                            {'Handler:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full ${colorGenerator(report.handler)} mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Handler Details */}
                        <Text className="font-rbase text-base text-black">
                            {translate(report?.handler ? report.handler : 'N/A')}
                        </Text>
                    </View>
                </View>
                {/* Services */}
                <View className="w-[95%] h-6 flex-row">
                    <View className="w-2/6 h-full">
                        {/* Services Label */}
                        <Text className="font-rbold text-base text-black text-justify">
                            {'Services:'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full mr-2`} />
                    <View className="w-4/6 h-full">
                        {/* Services Details */}
                        <Text className="font-rbase text-base text-black">
                            {
                            report?.services && report.services.length > 0
                                ? report.services.map(service => translate(service)).join(', ')
                                : 'No Services Selected'
                            }
                        </Text>
                    </View>
                </View>
                {/* Responder Details */}
                {report?.responder ? (
                    <>
                        {respoExpand ? (
                            <TouchableHighlight underlayColor={"#bfffd6"} className={`w-[95%] ${userExpand ? (height <= 900 ? 'h-[18%]' : 'h-[16%]') : (height <= 900 ? 'h-[19%]' : 'h-[18%]')} my-4 justify-center bg-white border-y-0.5 border-primary`} onPress={handleRespoExpand}>
                                <>
                                    <View className="w-full h-6 flex-row">
                                        {/* Responder Full Name Label */}
                                        <View className="w-2/6 h-full">
                                            <Text className="font-rbold text-base text-black text-justify">
                                                {'Full Name:'}
                                            </Text>
                                        </View>
                                        <View className="w-2 h-full mr-2"/>
                                        {/* Responder Full Name */}
                                        <View className="w-3/6 h-full">
                                            <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                                {report?.responder ? `${report.responder?.full_name.first_name} ${report.responder?.full_name.middle_name} ${report.responder?.full_name.last_name}` : 'N/A'}
                                            </Text>
                                        </View>
                                        {/* Icon Expand */}
                                        <View className="w-1/6 h-full justify-center">
                                            <Image 
                                                tintColor={'#57b378'}
                                                source={icons.expandUp}
                                                className="w-[40%] h-[40%] absolute right-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                    <View className="w-full h-6 flex-row">
                                        {/* Status Label */}
                                        <View className="w-2/6 h-full">
                                            <Text className="font-rbold text-base text-black text-justify">
                                            {'Status:'}
                                            </Text>
                                        </View>
                                        <View className="w-2 h-full mr-2"/>
                                        {/* Responder Status */}
                                        <View className="w-3/6 h-full">
                                            <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                                {report?.responder ? translate(report.responder.responder_status) : 'N/A'}
                                            </Text>
                                        </View>
                                        <View className="w-1/6 h-full justify-center" />
                                    </View>
                                    <View className="w-full h-6 flex-row">
                                        {/* Amenity Label */}
                                        <View className="w-2/6 h-full">
                                            <Text className="font-rbold text-base text-black text-justify">
                                                {'Amenity:'}
                                            </Text>
                                        </View>
                                        <View className="w-2 h-full mr-2"/>
                                        {/* Amenity Name */}
                                        <View className="w-3/6 h-full">
                                            <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                                {report?.responder?.amenity ? report.responder.amenity.name : 'N/A'}
                                            </Text>
                                        </View>
                                        <View className="w-1/6 h-full justify-center" />
                                    </View>
                                    <View className="w-full h-6 flex-row">
                                        {/* Amenity Description Label */}
                                        <View className="w-2/6 h-full">
                                            <Text className="font-rbold text-base text-black text-justify">
                                                {'Description:'}
                                            </Text>
                                        </View>
                                        <View className="w-2 h-full mr-2"/>
                                        {/* Amenity Description */}
                                        <View className="w-3/6 h-full">
                                            <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                                {report?.responder?.amenity ? report.responder.amenity.description : 'N/A'}
                                            </Text>
                                        </View>
                                        <View className="w-1/6 h-full justify-center" />
                                    </View>
                                    <View className="w-full h-6 flex-row">
                                        {/* Amenity Location Label */}
                                        <View className="w-2/6 h-full">
                                            <Text className="font-rbold text-base text-black text-justify">
                                                {'Location:'}
                                            </Text>
                                        </View>
                                        <View className="w-2 h-full mr-2"/>
                                        {/* Amenity Location */}
                                        <View className="w-3/6 h-full">
                                            <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                                {report?.responder?.amenity ? `${report.responder.amenity.location.latitude.toFixed(5)}   |   ${report.responder.amenity.location.longitude.toFixed(5)}` : 'N/A'}
                                            </Text>
                                        </View>
                                        <View className="w-1/6 h-full justify-center" />
                                    </View>
                                    <View className="w-full h-12 flex-row">
                                        {/* Address Label */}
                                        <View className="w-2/6 h-full">
                                            <Text className="font-rbold text-base text-black text-justify">
                                                {'Address:'}
                                            </Text>
                                        </View>
                                        <View className="w-2 h-full mr-2"/>
                                        {/* Amenity Address */}
                                        <View className="w-3/6 h-full">
                                            <Text className="font-rbase text-base text-black" numberOfLines={2} ellipsizeMode='tail'>
                                                {report?.responder?.amenity ? report.responder.amenity.address : 'N/A'}
                                            </Text>
                                        </View>
                                        <View className="w-1/6 h-full justify-center" />
                                    </View>
                                </>
                            </TouchableHighlight>
                        ) : (
                            <TouchableHighlight underlayColor={"#bfffd6"} className="w-[95%] h-[5%] my-4 justify-center bg-white border-y-0.5 border-primary" onPress={handleRespoExpand}>
                                <View className="w-full h-[60%] flex-row">
                                    {/* Responder Label */}
                                    <View className="w-2/6 h-full">
                                        <Text className="font-rbold text-base text-black text-justify">
                                            {'Responder:'}
                                        </Text>
                                    </View>
                                    <View className="w-2 h-full mr-2"/>
                                    {/* Reporter Name */}
                                    <View className="w-3/6 h-full">
                                        <Text className="font-rbase text-base text-black" numberOfLines={1} ellipsizeMode='tail'>
                                            {report?.responder ? `${report.responder?.full_name.first_name} ${report.responder?.full_name.last_name}` : 'N/A'}
                                        </Text>
                                    </View>
                                    {/* Icon Expand */}
                                    <View className="w-1/6 h-full justify-center">
                                        <Image 
                                            tintColor={'#57b378'}
                                            source={icons.expandDown}
                                            className="w-[40%] h-[40%] absolute right-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                            </TouchableHighlight>
                        )}
                    </>
                ) : (
                    <></>
                )}
                {/* Received Time */}
                {report?.responder ? (
                    <View className="w-[95%] h-6 flex-row">
                        <View className="w-2/6 h-full">
                            {/* Received Time Label */}
                            <Text className="font-rbold text-base text-black" numberOfLines={2}>
                                {'Received Time:'}
                            </Text>
                        </View>
                        <View className={`w-2 h-full mr-2`} />
                        <View className="w-4/6 h-full justify-center">
                            {/* Received Time */}
                            <Text className="font-rbase text-base text-black">
                            {report?.responder?.received_time
                            ? (typeof report.responder.received_time.toDate === 'function'
                                ? report.responder.received_time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(report.responder.received_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : 'N/A'}
                            {"  |  "}
                            {report?.report_date && report?.responder?.received_time
                            ? calculator({ reportDate: report.report_date, receivedTime: report.responder.received_time })
                            : "N/A"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <></>
                )}
                {/* Arrival Time */}
                {report?.responder ? (
                    <View className="w-[95%] h-6 flex-row">
                        <View className="w-2/6 h-full">
                            {/* Arrival Time Label */}
                            <Text className="font-rbold text-base text-black" numberOfLines={2}>
                                {'Arrival Time:'}
                            </Text>
                        </View>
                        <View className={`w-2 h-full mr-2`} />
                        <View className="w-4/6 h-full justify-center">
                            {/* Arrival Time */}
                            <Text className="font-rbase text-base text-black">
                            {report?.responder?.arrival_time
                            ? (typeof report.responder.arrival_time.toDate === 'function'
                                ? report.responder.arrival_time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(report.responder.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : 'N/A'}
                            {"  |  "}
                            {report?.responder?.received_time && report?.responder?.arrival_time
                            ? calculator({ reportDate: report.responder.received_time, receivedTime: report.responder.arrival_time })
                            : "N/A"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <></>
                )}
                {/* Resolved Time */}
                {report?.responder ? (
                    <View className="w-[95%] h-6 flex-row">
                        <View className="w-2/6 h-full">
                            {/* Resolved Time Label */}
                            <Text className="font-rbold text-base text-black" numberOfLines={2}>
                                {'Resolved Time:'}
                            </Text>
                        </View>
                        <View className={`w-2 h-full mr-2`} />
                        <View className="w-4/6 h-full justify-center">
                            {/* Resolved Time */}
                            <Text className="font-rbase text-base text-black">
                            {report?.responder?.resolved_time
                            ? (typeof report.responder.resolved_time.toDate === 'function'
                                ? report.responder.resolved_time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(report.responder.resolved_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                            : 'N/A'}
                            {"  |  "}
                            {report?.responder?.arrival_time && report?.responder?.resolved_time
                            ? calculator({ reportDate: report.responder.arrival_time, receivedTime: report.responder.resolved_time })
                            : "N/A"}
                            </Text>
                        </View>
                    </View>
                ) : (
                <></>
                )}
                <View className="w-[95%] border-b-0.5 border-primary my-2" />
                {/* Evidence Provided */}
                <View className="w-[95%] h-6 flex-row mb-4">
                    <View className="w-2/6 h-full">
                        {/* Handler Label */}
                        <Text className="font-rbold text-base text-black">
                            {report?.report_photos && report.report_photos.length > 0 ? 'Evidence:' : 'No Evidence Provided.'}
                        </Text>
                    </View>
                    <View className={`w-2 h-full mr-2`} />
                </View>
                {report?.report_photos && report.report_photos.length > 0 ? (
                    report.report_photos.map((photo, index) => (
                        <View key={index} className="w-[228px] h-[300px] overflow-hidden">
                            {photoLoading ? (
                                <View className="w-full h-full bg-slate-400 items-center justify-center">
                                    <ActivityIndicator size="large" color="#ffffff" />
                                </View>
                            ) : null}
                            
                            <Image
                                source={{ uri: photo.uri }}
                                className="w-full h-full"
                                resizeMode="cover"
                                onLoadEnd={loadPhoto}
                            />
                        </View>
                    ))
                ) : (
                    <></>
                )}
                <View className={`w-[95%] border-b-0.5 border-primary ${report.report_photos.length > 0 ? 'my-4' : ''}`} />
            </ScrollView>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="w-full h-full bg-primary" />
        )
    }

    return (
        <SafeAreaView className="w-full h-full bg-primary">
            <View className="w-full h-full items-center">
                {selectedReport && reportFile(selectedReport)}
                <View className="w-full h-[8%]">
                    <ScrollView key={btnScrollKey} horizontal showsHorizontalScrollIndicator={false} ref={buttonScrollRef}>
                        {reports.map((report, index) => (
                            <View key={report.report_id} className={`h-full ${selectedReport && report.report_id === selectedReport.report_id ? "rounded-b-2xl bg-white" : ""} overflow-hidden justify-center`}>
                                <TouchableOpacity className="h-full items-center justify-center px-6" onPress={() => toggleSelectedReport(report, index)} disabled={selectedReport && report.report_id === selectedReport.report_id}>
                                    <Text className={`${selectedReport && report.report_id === selectedReport.report_id ? "font-rbold text-primary" : "font-rmedium text-white" } text-base`}>{'#'}{report.report_id}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
                {/* If there are no reports available */}
                {reports.length === 0 && (
                    <View className="w-full h-[90%] justify-center items-center -top-[8%] pt-4">
                        <View className="w-[60%] h-[60%] bg-white items-center justify-center rounded-3xl">
                            {/* Icon */}
                            <Image 
                                tintColor="#FFCC00"
                                source={icons.missing}
                                className="w-20 h-20"
                                resizeMode='contain'
                            />
                            {/* Missing Title */}
                            <Text className="text-missing-100 text-2xl font-psemibold py-8" numberOfLines={1} ellipsizeMode='tail'>MISSING?</Text>
                            {/* Missing Description */}
                            <Text className="w-[80%] text-slate-500 text-base font-pregular text-center pb-8" numberOfLines={3} ellipsizeMode='tail'>{'No Reports Available.\n File a report now.'}</Text>
                            {/* Buttons Available */}
                            <TouchableHighlight className="py-3 px-4 bg-missing-100 rounded-2xl" underlayColor={"#ff9d00"} onPress={() => changePage('home/reports')}>
                                <Text className="text-white text-base font-pregular text-center">PROCEED</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                )}
                {/* Print Button */}
                {isResponder && (
                    <TouchableHighlight
                        underlayColor={"#86ebaa"} 
                        className="w-24 h-24 absolute bottom-[13%] right-[4%] bg-primary rounded-3xl" 
                        onLongPress={() => { 
                            LayoutAnimation.configureNext({
                                duration: 100,
                                update: {
                                    type: LayoutAnimation.Types.linear,
                                    property: LayoutAnimation.Properties.scaleX
                                },
                            }); 
                            toggleButtonInfo(true);
                        }}
                        onPress={() => handlePrint(selectedReport.report_id)}
                    >
                        <>
                            <View className="w-full h-full items-center justify-center">
                                {buttonInfo ? (
                                    <>
                                        <Image 
                                            tintColor='#ffffff'
                                            source={icons.prints}
                                            className="w-[40%] h-[40%]"
                                            resizeMode='contain'
                                        />
                                        <Text className="text-xl text-white font-rmedium">PRINT</Text>
                                    </>
                                ) : (
                                    <Image 
                                        tintColor='#ffffff'
                                        source={icons.prints}
                                        className="w-[60%] h-[60%]"
                                        resizeMode='contain'
                                    />
                                )}
                            </View>
                        </>
                    </TouchableHighlight>
                )}
            </View>
            {/* Status Bar */}
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    );
};

export default DetailScreen;
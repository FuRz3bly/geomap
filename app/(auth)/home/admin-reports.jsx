import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { translate } from '../../../components/ToolsContext';

import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../../../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

import { images, icons } from '../../../constants';

const AdminReportScreen = ({ data, changePage, backPage }) => {
    const { user, isResponder } = useContext(UserContext); // User Container
    const { dictionary } = useContext(ToolsContext); // Dictionary Container
    const { width, height } = Dimensions.get('screen'); // Screen Width and Height
    // Local Variables
    const scrollRef = useRef(null); // Scroll View Reference
    const [expandDashboard, setExpandDashboard] = useState(false); // Expand Dashboard
    const [expandedStates, setExpandedStates] = useState(data.map(() => false));
    const [printLoading, setPrintLoading] = useState(false); // Add Print Loading State
    const [selectedReport, setSelectedReport] = useState(null); // Selected Report Container
    const [htmlContent, setHtmlContent] = useState(''); // HTML Container

    // Allow the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            backPage();
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, []);

    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Utility Functions
    const sortedReports = data
    .filter(user => (user.incident_date || user.report_date))
    .sort((a, b) => {
        // Extract the last 3 digits from the report_id
        const idA = parseInt(a.report_id.split('-')[2], 10);
        const idB = parseInt(b.report_id.split('-')[2], 10);
        return idA - idB; // Sort numerically
    });

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

    // Border Generator Function
    const borderGenerator = (key) => {
        const borderKey = dictionary[key + '_border'];
        return borderKey;
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

    // Generate HTML Document
    const generateDoc = (report) => {
        const formattedDate = report?.report_date
            ? (typeof report.report_date.toDate === 'function'
                ? report.report_date.toDate().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                    })
                : new Date(report.report_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                    }))
            : '';
        const formattedTime = report?.report_date
        ? (typeof report.report_date.toDate === 'function'
            ? report.report_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date(report.report_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        : '';

        const isServiceCalled = (service) => report.services && report.services.includes(service);

        // Section 1: Person Involved (Check for missing fields)
        const isPersonInvolvedMissing = !report?.user_report?.full_name ||
                                        !report?.user_report?.uid ||
                                        !report?.user_report?.address ||
                                        !report?.user_report?.phone_number ||
                                        !report?.user_report?.email ||
                                        !report?.responder?.full_name ||
                                        !report?.responder?.uid;

        // Section 2: Emergency Details (Check for missing fields)
        const isEmergencyDetailsMissing =   !report?.report_date ||
                                            !report?.report_type ||
                                            !report?.report_address ||
                                            !report?.description;

        // Section 3: Services (Check for missing services)
        const isServicesMissing = !report?.services;

        const personInvolvedHeadingClass = isPersonInvolvedMissing ? 'error-heading' : 'highlighted-heading';
        const emergencyDetailsHeadingClass = isEmergencyDetailsMissing ? 'error-heading' : 'highlighted-heading';
        const servicesHeadingClass = isServicesMissing ? 'error-heading' : 'highlighted-heading';

        let descriptionSection = "";

        if (report.description) {
            descriptionSection = `
                <p>Describe the Emergency: ${report.description}</p>
            `
        } else {
            descriptionSection = `
                <p class="error">Describe the Emergency: USER LEFT EMPTY.</p>
            `
        }

        return `
            <html>
                <head>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            background-color: white; 
                            margin: 0mm 2mm 0mm 3mm;
                            width: 210mm;
                            height: 297mm;
                            padding: 40px;
                            overflow: hidden;
                            transform: scale(1.1, 1.1);
                            transform-origin: left top;
                        }
                        .standard-heading { 
                            text-align: center; 
                            color: black; 
                            font-size: 18px; 
                            margin: 0;
                            padding: 12px;
                            background-color: transparent;
                        }
                        .highlighted-heading { 
                            text-align: center; 
                            color: white;
                            background-color: #57b378;
                            font-size: 18px;
                            margin: 0;
                            padding: 12px;
                        }
                        .error-heading {
                            text-align: center; 
                            color: white;
                            background-color: #de4e55;
                            font-size: 18px;
                            margin: 0;
                            padding: 12px;
                        }
                        p { 
                            font-size: 16px; 
                            margin: 0;
                            padding: 5px;
                        }
                        p.error { 
                            color: #de4e55;
                            font-size: 16px;
                            margin: 0;
                            padding: 5px;
                        }
                        .right-align {
                            text-align: right; 
                        }
                        .spacer {
                            height: 20px;
                            margin: 0; 
                        }
                        .contact-info {
                            display: flex;
                            justify-content: space-between;
                        }
                        .contact-info div {
                            flex: 1;
                            margin: 0;
                            padding: 5px;
                        }
                        .checkbox {
                            margin: 5px 0;
                        }
                        @page { 
                            size: A4;
                            margin: 0mm 0mm 0mm 0mm; 
                        }
                        @media print {
                            body {
                                max-width: 100%
                                max-height: 50%;
                                transform: scale(1.1);
                                transform-origin: left top;
                                margin: 0mm 10mm 0mm 2mm;
                            }
                        }
                    </style>
                </head>
                <body>
                    <p class="right-align">Report ID: #${report?.report_id}</p>
                    <h1 class="standard-heading">EMERGENCY REPORT FORM</h1>
                    <p>This form is for reporting of emergencies, accidents, and incidents. Responding officers must complete it and submit it within 24 hours of the event.</p>
                    <div class="spacer"></div>
                    <p>Date of Report: ${formattedDate}</p>
                    <p>Handler: ${report?.responder.amenity.name}</p>
                    <div class="spacer"></div>
                    <h1 class="${personInvolvedHeadingClass}">PERSON INVOLVED</h1>
                    <div class="spacer"></div>
                    <p><strong>Report Details:</strong></p>
                    <p>Full Name: ${report?.user_report?.full_name?.first_name} ${report.user_report.full_name.middle_name} ${report.user_report.full_name.last_name}</p>
                    <p>Identification: UID: ${report?.user_report.uid}</p>
                    <p>Address: ${report?.user_report?.address}</p>
                    <div class="contact-info">
                        <div>Phone: +63-${report?.user_report?.phone_number}</div>
                        <div>Email: ${report?.user_report?.email}</div>
                    </div>
                    <div class="spacer"></div>
                    <p><strong>Responder Details:</strong></p>
                    <p>Full Name: ${report?.responder?.full_name?.first_name} ${report?.responder?.full_name?.middle_name} ${report?.responder?.full_name?.last_name}</p>
                    <p>Identification: UID: ${report?.responder?.uid}</p>
                    <div class="spacer"></div>
                    <h1 class="${emergencyDetailsHeadingClass}">EMERGENCY DETAILS</h1>
                    <div class="spacer"></div>
                    <div class="contact-info">
                        <div>Date of Emergency: ${formattedDate}</div>
                        <div>Time: ${formattedTime}</div>
                    </div>
                    <p>Type of Emergency: ${translate(report?.report_type)}</p>
                    <p>Address: ${report?.report_address}</p>
                    ${descriptionSection}
                    <div class="spacer"></div>
                    <h1 class="${servicesHeadingClass}">SERVICES</h1>
                    <div class="spacer"></div>
                    <div class="contact-info">
                        <div>What Emergency Service(s) is called?: </div>
                        <div class="checkbox">
                            <input type="checkbox" ${isServiceCalled('ambulance') ? 'checked' : ''}> Ambulance
                        </div>
                        <div class="checkbox">
                            <input type="checkbox" ${isServiceCalled('firetruck') ? 'checked' : ''}> Firetruck
                        </div>
                    </div>
                </body>
            </html>
        `
    };

    // Button Functions
    // Template Buttons
    const handleOK = ( user ) => {
        console.log(user);
    };

    // Toggle Expand Per Users
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

    // Delete Function
    const handleDelete = async (id) => {
        try {
            // Reference the specific user document
            const reportRef = doc(db, 'reports', id);
    
            // Delete the document
            await deleteDoc(reportRef);
    
            // Define the folder path in Firebase Storage
            const folderPath = `reports/${id}/`;
    
            // Function to delete the folder and its contents
            const deleteStorageFolder = async (folderPath) => {
                const storage = getStorage();
                const folderRef = ref(storage, folderPath);
    
                // List all items (files) in the folder
                const listResult = await listAll(folderRef);
    
                // Create an array of delete promises for each item in the folder
                const deletePromises = listResult.items.map(itemRef => deleteObject(itemRef));
    
                // Wait for all delete promises to complete
                await Promise.all(deletePromises);
    
                // Optionally, you can delete any sub-folders if present
                const folderDeletePromises = listResult.prefixes.map(subFolderRef => deleteStorageFolder(subFolderRef.fullPath));
                await Promise.all(folderDeletePromises);
            };
    
            // Delete the folder and its contents
            await deleteStorageFolder(folderPath);
    
            alert('Report and associated folder deleted successfully!');
        } catch (error) {
            console.error('Error deleting report and folder:', error);
            alert('Failed to delete report and folder. Please try again.');
        }
    };

    const handleExport = async (report) => {
        const htmlDoc = generateDoc(report);
        setHtmlContent(htmlDoc);

        setPrintLoading(true);
        try {
            const { uri } = await Print.printToFileAsync({
                html: htmlDoc,
            });
            const newFileName = `report_form_${report?.report_id}.pdf`;
            const newUri = FileSystem.documentDirectory + newFileName;
            await FileSystem.moveAsync({ from: uri, to: newUri });
            await Sharing.shareAsync(newUri);
            setPrintLoading(false);
        } catch (error) {
            console.error("Error exporting file:", error);
            setPrintLoading(false);
        }
    };

    return (
        <SafeAreaView className="w-full h-full bg-white justify-center items-center">
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                {sortedReports?.length === 0 ? (
                    <View className="w-[96%] h-fit">
                        <TouchableHighlight
                            underlayColor={'#fffd99'}
                            className={`w-full h-fit bg-white border-[1px] border-warn mt-4 rounded-3xl overflow-hidden`}
                            disabled
                        >
                            <>
                                {/* No Data Available */}
                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                        {'Missing Reports'}
                                    </Text>
                                </View>
                                {/* Status */}
                                <View className={`mx-2 absolute top-[15%] right-[2%] bg-yellow-400 rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                    <View className="w-6 items-center justify-center">
                                        <Image
                                            tintColor={'#ffffff'}
                                            source={icons.missing}
                                            className="w-[70%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                        <Text className="text-white font-pregular text-xs">{'Missing'}</Text>
                                    </View>
                                </View>
                                {/* Missing Data */}
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{'No report data available.'}</Text>
                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image
                                                tintColor={'#64748b'}
                                                source={icons.missing}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center">
                                            <Text className="text-slate-500 font-pregular text-xs text-right">
                                                {'NaN'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        </TouchableHighlight>
                    </View>
                ) : (
                    <>
                        {sortedReports?.map((report) => (
                            !expandedStates[report?.report_id] ? (
                                <View key={report.report_id} className="w-[96%] h-fit">
                                    <TouchableHighlight
                                        underlayColor={'#fffd99'}
                                        className={`w-full h-fit bg-white border-[1px] ${borderGenerator(report.handler)} mt-4 rounded-3xl overflow-hidden`}
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
                                    <View className={`w-full h-fit bg-white border-[1px] ${borderGenerator(report.handler)} mt-4 rounded-3xl overflow-hidden`}>
                                        {/* Status Top */}
                                        <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                {/* Time of Emergency */}
                                                <View className={`h-full ml-6 ${colorGenerator(report.report_status)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
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
                                                <View className={`h-full mx-2 ${colorGenerator(report.report_status)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
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
                                                            {formatDate(report.incident_date || report.report_date)}
                                                        </Text>
                                                    </View>
                                                </View>
                                                {/* ID of Emergency */}
                                                <View className={`h-full mr-6 ${colorGenerator(report.report_status)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
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
                                                    onPress={handleOK}
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
                                            {/* Print Button */}
                                            <TouchableHighlight
                                                className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mx-2`}
                                                underlayColor={'#fffd99'} 
                                                onPress={() => handleExport(report)}
                                            >
                                                <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                    <View className="w-6 h-full items-center justify-center">
                                                        <Image
                                                            tintColor={'#57b378'}
                                                            source={icons.prints}
                                                            className="w-[80%] h-[80%]"
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                    <View className="h-full justify-center pl-[4%]">
                                                        <Text className="text-black font-pregular text-sm">{'Print'}</Text>
                                                    </View>
                                                </View>
                                            </TouchableHighlight>
                                            {/* Delete Button */}
                                            <TouchableHighlight
                                                className={`h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2`}
                                                underlayColor={'#fffd99'}
                                                onPress={() => handleDelete(report.report_id)}
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
                                                        <Text className="text-black font-pregular text-sm">{'Delete'}</Text>
                                                    </View>
                                                </View>
                                            </TouchableHighlight>
                                        </ScrollView>
                                    </View>
                                </View>
                            )
                        ))}
                    </>
                )}
                <View className="w-full mb-[5%]"/>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminReportScreen;
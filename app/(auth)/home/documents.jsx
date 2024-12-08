import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableHighlight, ActivityIndicator, BackHandler, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

import { onSnapshot, collection, query, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { getID, containID, translate } from '../../../components/ToolsContext';
import { images, icons } from '../../../constants';

const FormScreen = ({ savings, loadings, fails, status, changePage, backPage, previewProtect, returnProtect }) => {
    // Global Variables
    const { user } = useContext(UserContext); 
    const { dictionary } = useContext(ToolsContext);
    //const { reportID } = useLocalSearchParams();
    const { width, height } = Dimensions.get('screen');
    const [reportID, setLocalID] = useState(getID());

    const [loading, setLoading] = useState(false); // Add loading state
    const [saveLoading, setSaveLoading] = useState(false); // Add Save Loading State
    const [printOption, setPrintOption] = useState(false); // Toggle Print Options
    const [printLoading, setPrintLoading] = useState(false); // Add Print Loading State
    const [reports, setReports] = useState([]); // Collection of Reports 
    const [selectedReport, setSelectedReport] = useState(null); // Selected Report Container
    const [reportReq, setReportReq] = useState([]); // Required Report Fields
    const [updatedFields, setUpdatedFields] = useState({});
    const [docExpand, toggleDocExpand] = useState(false); // Report Row Tracker
    const [editExpand, toggleEditExpand] = useState(false);
    const [htmlContent, setHtmlContent] = useState(''); // HTML Container
    const [buttonInfo, toggleButtonInfo] = useState(false); // Button Info Tracker

    const [showName, setShowName] = useState(false); // Display extra fields for First, Middle and Last Names
    const [showDate, setShowDate] = useState(false); // Display Report Date Calendar Picker
    const [showIDate, setShowIDate] = useState(false); // Display Incident Date Calender Picker
    const [showTime, setShowTime] = useState(false); // Display Report Time Calendar Picker
    const [showRespoName, setShowRespoName] = useState(false); // Display extra fields for First, Middle and Last Responder Names

    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Allow the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            if (docExpand === true) {
                if (editExpand === true) {
                    toggleEditExpand(false);
                    return true;
                } else {
                    toggleDocExpand(false);
                    return true;
                }
            } else {
                backPage();
                //changePage('home/homes');
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, [editExpand, docExpand]);

    useEffect(() => {
        if (!user) return;
    
        const localID = getID();
        
        // If reportID is empty (null, undefined, or empty string), return early
        if (!localID) return;
    
        setLocalID(localID);
    }, [user]);

    useEffect(() => {
        if (previewProtect) {
            toggleDocExpand(false);
            returnProtect(false);
        } else {
            return;
        }
    }, [previewProtect])

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

    // Real-time listener and filter of reports
    useEffect(() => {
        if (!user) return;

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
                    setSelectedReport(matchingReport);
                    checkMissingFields(matchingReport); // Use the extracted data
                    const htmlDoc = generateDoc(matchingReport);
                    setHtmlContent(htmlDoc);
                    toggleDocExpand(true);
                    setLoading(false);
                    status('success');
                    savings('DOCUMENT LOADED');
                } else {
                    // Default to the newest report
                    setSelectedReport(filteredReports[0]);
                    setLoading(false);
                }
            });
    
            // Cleanup listener on component unmount
            return () => unsubscribe();
        };
    
        fetchReports();
    }, [reportID, user?.uid]);

    // Function to fetch and set the selected report from the database
    const findReport = async (reportId) => {
        try {
            const reportRef = doc(db, 'reports', reportId); // Get a reference to the document
            const reportDoc = await getDoc(reportRef); // Get the document snapshot
            if (reportDoc.exists()) { // Check if the document exists
                const reportData = reportDoc.data(); // Extract the data from the snapshot
                setSelectedReport(reportData); // Set the extracted data to state
                checkMissingFields(reportData); // Use the extracted data
                const htmlDoc = generateDoc(reportData);
                setHtmlContent(htmlDoc);
            } else {
                console.log('No such report!');
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    // Get Valid Date
    const getValidDate = (dateValue) => {
        if (!dateValue) {
            return new Date(); // Return current date if no date is provided
        }
        if (dateValue instanceof Date) {
            return dateValue; // Return if already a Date object
        } else if (dateValue?.toDate) {
            return dateValue.toDate(); // Firestore Timestamp, convert to Date object
        } else if (typeof dateValue === 'string') {
            return new Date(dateValue); // String date, convert to Date object
        } else {
            return new Date(); // Default to the current date
        }
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

    const checkMissingFields = (report) => {
        let missingFields = [];

        if (!report.report_id) missingFields.push('report_id');
        if (!report.report_date) missingFields.push('report_date');
        if (!report.responder) missingFields.push('responder');
        if (!report.user_report) missingFields.push('user_report');
        if (!report.report_address) missingFields.push('report_address');
        if (!report.description) missingFields.push('description');
        if (!report.report_type) missingFields.push('report_type');

        setReportReq(missingFields);
    };

    // Report Row Function
    const toggleSelectedReport = (report) => {
        setSelectedReport(report);
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity
            },
        });
        toggleDocExpand(true);

        checkMissingFields(report);

        const htmlDoc = generateDoc(report);
        setHtmlContent(htmlDoc);
    };

    // Handle input change for nested fields
    const handleInputChange = (field, value) => {
        setUpdatedFields((prevFields) => {
            const fieldParts = field.split('.'); // Split nested fields like 'user_report.phone_number'
            let updatedObject = { ...prevFields }; // Create a copy of the current state

            // Iterate through the field parts and update the nested field
            fieldParts.reduce((acc, part, index) => {
                if (index === fieldParts.length - 1) {
                    acc[part] = value; // Set the value for the final field part
                } else {
                    acc[part] = { ...acc[part] }; // Keep the nested structure intact
                }
                return acc[part];
            }, updatedObject);

            return updatedObject; // Return the updated state
        });
    };

    // Function to handle date selection
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || updatedFields.report_date;
        setShowDate(false);
        setShowIDate(false);
        setUpdatedFields((prevFields) => ({
            ...prevFields,
            report_date: currentDate, // Update report_date field with Date object
        }));
    };

    // Function to handle time selection
    const handleTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || updatedFields.report_date;
        setShowTime(false);
        if (selectedTime) {
            setUpdatedFields((prevFields) => ({
                ...prevFields,
                report_date: new Date(
                    getValidDate(prevFields.report_date).setHours(
                        selectedTime.getHours(),
                        selectedTime.getMinutes()
                    )
                ),
            }));
        }
    };

    // Function Toggle Servicees
    const toggleService = (service) => {
        setUpdatedFields((prevFields) => {
            const newServices = prevFields.services.includes(service)
                ? prevFields.services.filter((s) => s !== service) // Remove service if already in the array
                : [...prevFields.services, service]; // Add service if not in the array
            return {
                ...prevFields,
                services: newServices, // Update the services array
            };
        });
    };

    // Closed Button Function
    const handleClose = () => {
        LayoutAnimation.configureNext({
            duration: 300,
            update: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.scaleY
            },
        });
        setSelectedReport(null);
        toggleDocExpand(false);
        setHtmlContent('');
        containID(null);
    };

    // Print Function
    const handlePrint = () => {
        setPrintOption(true);
    };

    const toggleOption = async (option) => {
        setPrintLoading(true);
        await handleExport(option);
        setPrintOption(false);
    };

    const convertHTML = async (htmlContent) => {
        const document = new Document({
            sections: [{
                properties: {},
                children: []
            }]
        });
    
        // Parse HTML using htmlparser2
        const parsedHTML = parse(htmlContent, { decodeEntities: true });
    
        // Function to recursively process nodes
        const processNode = (node) => {
            if (node.type === 'text') {
                // Handle text nodes
                const paragraph = new Paragraph({
                    children: [new TextRun(node.data)],
                });
                document.addSection({
                    children: [paragraph],
                });
            } else if (node.type === 'tag') {
                if (node.name === 'p') {
                    // Handle paragraph tags specifically
                    const paragraph = new Paragraph({
                        children: [new TextRun(node.children.map(child => child.data).join(''))],
                    });
                    document.addSection({
                        children: [paragraph],
                    });
                }
                // Add additional handling for other HTML tags (like headings, lists, etc.) as needed
            }
    
            // Process child nodes recursively
            if (node.children) {
                node.children.forEach(processNode);
            }
        };
    
        // Process each top-level node
        parsedHTML.forEach(processNode);
    
        // Pack and write the document
        const buffer = await Packer.toBuffer(document);
        return buffer; // Return the buffer
    };

    const handleExport = async (format) => {
        setPrintLoading(true);
        try {
            if (format === 'pdf') {
                const { uri } = await Print.printToFileAsync({
                    html: htmlContent,
                });
                const newFileName = `report_form_${selectedReport?.report_id}.pdf`;
                const newUri = FileSystem.documentDirectory + newFileName;
                await FileSystem.moveAsync({ from: uri, to: newUri });
                await Sharing.shareAsync(newUri);
            } else if (format === 'word') {
                // Generate the DOCX directly from HTML
                const docxBuffer = await convertHTML(htmlContent);
                const docxFileName = `report_form_${selectedReport?.report_id}.docx`;
                const docxUri = FileSystem.documentDirectory + docxFileName;
    
                // Write the DOCX buffer to the filesystem
                await FileSystem.writeAsStringAsync(docxUri, docxBuffer.toString('base64'), {
                    encoding: FileSystem.EncodingType.Base64,
                });
    
                // Share the DOCX file
                await Sharing.shareAsync(docxUri);
            }
            setPrintLoading(false);
        } catch (error) {
            console.error("Error exporting file:", error);
            setPrintLoading(false);
        }
    };

    // Edit Function
    const handleEdit = (report) => {
        toggleEditExpand(true);
        setUpdatedFields(report);
    };
 
    // Save Function
    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const reportId = updatedFields?.report_id;
            const reportRef = doc(db, 'reports', reportId);
      
            // Update the document in Firestore with the updated fields
            await updateDoc(reportRef, {
              ...updatedFields, // Update only the fields that were modified
              handler: updatedFields?.handler,
              report_address: updatedFields?.report_address,
              report_date: updatedFields?.report_date || new Date(),
              report_id: updatedFields?.report_id,
              report_type: updatedFields?.report_type,
              responder: updatedFields?.responder,
              services: updatedFields?.services,
              user_report: updatedFields?.user_report
            });
      
            toggleEditExpand(false); // Close the edit mode
            setUpdatedFields({});
      
            // Fetch and set the selected report
            await findReport(reportId);
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating document:', error);
            setSaveLoading(false);
        }
    };

    // Report Row Template
    const reportRow = (report) => {
        return (
            <TouchableHighlight underlayColor={"#FDFFAE"} className="w-[95%] h-16 items-center justify-center bg-white" key={report?.report_id} onPress={() => toggleSelectedReport(report)}>
                <View className="w-full h-full pt-3 border-b-[0.5px] border-primary flex-row">
                    <View className="w-2/4 h-full pl-[4%]">
                        <Text className="font-psemibold text-primary text-xs">
                            {"#"}{report?.report_id}
                        </Text>
                        <Text className="font-psemibold text-primary-100 text-sm" numberOfLines={1} ellipsizeMode="tail">
                            {report?.user_report?.full_name?.first_name} {report?.user_report?.full_name?.last_name}
                        </Text>
                    </View>
                    <View className="w-1/4 h-full">
                        <Text className="font-psemibold text-primary text-xs mr-6">
                        {report?.report_date
                        ? (typeof report.report_date.toDate === 'function'
                            ? report.report_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(report.report_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                        : ''}
                        </Text>
                    </View>
                    <View className="w-1/4 h-full">
                        <Text className="font-psemibold text-primary text-xs">
                        {(() => {
                            const options = { year: 'numeric', month: 'long', day: 'numeric' };
                            
                            if (report?.report_date) {
                            const dateObj = typeof report.report_date.toDate === 'function'
                                ? report.report_date.toDate()  // Firestore Timestamp
                                : new Date(report.report_date);  // ISO string or other date

                            const formattedDate = dateObj.toLocaleDateString('en-US', options);
                            const [monthDay, year] = formattedDate.split(', ');
                            const [month, day] = monthDay.split(' ');
                            return `${month}\n${day}, ${year}`;
                            }

                            return '';
                        })()}
                        </Text>
                        <View className="w-[10%] h-full absolute right-3 pt-2">
                            <Image 
                                tintColor='#57b378'
                                source={icons.nextBtn}
                                className="w-6 h-6"
                                resizeMode='contain'
                            />
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    };

    return (
        <SafeAreaView className="w-full h-full bg-primary items-center overflow-hidden">
            {docExpand ? (
                <>
                    {editExpand ? (
                        <>
                            <View className="w-full h-full  bg-white justify-items-center">
                                <View className="absolute right-3 bottom-3 z-10">
                                    <TouchableHighlight
                                        underlayColor={"#86ebaa"} 
                                        className="w-24 h-24 bg-primary rounded-3xl overflow-hidden items-center" 
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
                                        onPress={handleSave}
                                        disabled={saveLoading}
                                    >
                                        <>
                                            <View className="w-full h-full items-center justify-center">
                                                {saveLoading ? (
                                                    <ActivityIndicator size="large" color="#ffffff" />
                                                ) : (
                                                    <>
                                                        {buttonInfo ? (
                                                            <>
                                                                <Image 
                                                                    tintColor='#ffffff'
                                                                    source={icons.verification}
                                                                    className="w-[50%] h-[50%]"
                                                                    resizeMode='contain'
                                                                />
                                                                <Text className="font-rmedium text-xl text-white">SAVE</Text>
                                                            </>
                                                        ) : (
                                                            <Image 
                                                                tintColor='#ffffff'
                                                                source={icons.verification}
                                                                className="w-[60%] h-[60%]"
                                                                resizeMode='contain'
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </View>
                                        </>
                                    </TouchableHighlight>
                                </View>
                                {selectedReport && (
                                    <ScrollView className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}}>
                                        {/* Title */}
                                        <Text className="font-pbold text-xl text-black py-[6%]">EMERGENCY REPORT FORM</Text>
                                        {/* Instructions */}
                                        <Text className="font-pregular text-sm text-black pb-[6%] w-[86%]">This form is for reporting of emergencies, accidents, and incidents. Responding officers must complete it and submit it within 24 hours of the event.</Text>
                                        <View className="w-[93%] justify-center">
                                            {/* Report ID */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Report ID:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-primary-hidden"
                                                    placeholder='Report ID'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.report_id ? `#${updatedFields?.report_id}` : ''}
                                                    onChangeText={(value) => handleInputChange('report_id', value)}
                                                />
                                            </View>
                                            {/* Report Date */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Date of Report:</Text>
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showDate? "border-black" : "border-primary"} justify-center items-center flex-row px-[10%]`}>
                                                <TextInput
                                                    className={`w-full text-md font-pmedium ${!showDate ? "text-black" : "text-primary"} ml-4`}
                                                    placeholder='Report Date'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.report_date
                                                        ? getValidDate(updatedFields?.report_date).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })
                                                        : '' } 
                                                />
                                                {/* Visible Password Button */}
                                                <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowDate(!showDate)}>
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={!showDate ? icons.editing : icons.edit}
                                                        className="w-6 h-6"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableHighlight>
                                            </View>
                                            {showDate ? (<>
                                                <DateTimePicker
                                                    mode="date"
                                                    display="default"
                                                    value={getValidDate(updatedFields?.report_date)} // Initial value of the DatePicker
                                                    onChange={handleDateChange}
                                                    themeVariant='dark'
                                                />
                                            </>) : (<></>)}
                                            {/* Handler */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Handler:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='Handler'
                                                    editable={true}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.responder?.amenity.name ? updatedFields.responder.amenity.name : ''}
                                                    onChangeText={(value) => handleInputChange('responder.amenity.name', value)}
                                                />
                                            </View>
                                            {/* Person Involved */}
                                            <View className="w-full h-16 bg-primary items-center justify-center my-[6%]">
                                                <Text className="font-pbold text-white text-lg">PERSON INVOLVED</Text>
                                            </View>
                                            {/* Report Details */}
                                            <Text className="font-pbold text-lg text-black pl-[4%] pb-[4%]">Report Details:</Text>
                                            {/* User Full Name */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Full Name:</Text>
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showName ? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%]`}>
                                                <TextInput
                                                    className={`w-full text-md font-pmedium ${!showName ? "text-black" : "text-primary-hidden"} ml-4`}
                                                    placeholder='User Full Name'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.user_report?.full_name ? `${updatedFields.user_report.full_name.first_name} ${updatedFields.user_report.full_name.middle_name} ${updatedFields.user_report.full_name.last_name}` : ''}
                                                />
                                                {/* Visible Password Button */}
                                                <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowName(!showName)}>
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={!showName ? icons.editing : icons.edit}
                                                        className="w-6 h-6"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableHighlight>
                                            </View>
                                            {showName ? (<>
                                                {/* User First Name */}
                                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">First Name:</Text>
                                                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                                    <TextInput
                                                        className="w-full text-md font-pmedium text-black"
                                                        placeholder='User First Name'
                                                        editable={true}
                                                        placeholderTextColor='#94A3B8'
                                                        value={updatedFields?.user_report?.full_name ? updatedFields.user_report.full_name.first_name : ''}
                                                        onChangeText={(value) => handleInputChange('user_report.full_name.first_name', value)}
                                                    />
                                                </View>
                                                {/* User Middle Name */}
                                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Middle Name:</Text>
                                                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                                    <TextInput
                                                        className="w-full text-md font-pmedium text-black"
                                                        placeholder='User Middle Name'
                                                        editable={true}
                                                        placeholderTextColor='#94A3B8'
                                                        value={updatedFields?.user_report?.full_name ? updatedFields.user_report.full_name.middle_name : ''}
                                                        onChangeText={(value) => handleInputChange('user_report.full_name.middle_name', value)}
                                                    />
                                                </View>
                                                {/* User Last Name */}
                                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Last Name:</Text>
                                                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                                    <TextInput
                                                        className="w-full text-md font-pmedium text-black"
                                                        placeholder='User Last Name'
                                                        editable={true}
                                                        placeholderTextColor='#94A3B8'
                                                        value={updatedFields?.user_report?.full_name ? updatedFields.user_report.full_name.last_name : ''}
                                                        onChangeText={(value) => handleInputChange('user_report.full_name.last_name', value)}
                                                    />
                                                </View>
                                            </>) : (<></>)}
                                            {/* Identification UID */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Identification: UID:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-primary-hidden"
                                                    placeholder='UID'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.user_report?.uid ? updatedFields.user_report.uid : ''}
                                                    onChangeText={(value) => handleInputChange('user_report.uid', value)}
                                                />
                                            </View>
                                            {/* User Address */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Address:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='User Address'
                                                    editable={true}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.user_report?.address ? updatedFields.user_report.address : ''}
                                                    onChangeText={(value) => handleInputChange('user_report.address', value)}
                                                />
                                            </View>
                                            {/* User Phone Number */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Phone:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='User Phone Number'
                                                    editable={true}
                                                    placeholderTextColor='#94A3B8'
                                                    keyboardType="numeric"
                                                    value={updatedFields.user_report?.phone_number ? `+63-${updatedFields.user_report.phone_number}` : ''}
                                                    onChangeText={(value) => {
                                                        const delPrefix = value.replace('+63-', ''); // Remove prefix before storing
                                                        handleInputChange('user_report.phone_number', delPrefix);
                                                    }}
                                                />
                                            </View>
                                            {/* User Email */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Email:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='User Email Address'
                                                    editable={true}
                                                    placeholderTextColor='#94A3B8'
                                                    keyboardType="email-address"
                                                    value={updatedFields?.user_report?.email ? updatedFields.user_report.email : ''}
                                                    onChangeText={(value) => handleInputChange('user_report.email', value)}
                                                />
                                            </View>
                                            {/* Responder Details */}
                                            <Text className="font-pbold text-lg text-black pl-[4%] py-[6%]">Responder Details:</Text>
                                            {/* Responder Full Name */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Full Name:</Text>
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showName ? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%]`}>
                                                <TextInput
                                                    className={`w-full text-md font-pmedium ${!showRespoName ? "text-black" : "text-primary-hidden"} ml-4`}
                                                    placeholder='Responder Full Name'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.responder?.full_name ? `${updatedFields.responder.full_name.first_name} ${updatedFields.responder.full_name.middle_name} ${updatedFields.responder.full_name.last_name}` : ''}
                                                />
                                                {/* Visible Password Button */}
                                                <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowRespoName(!showRespoName)}>
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={!showRespoName ? icons.editing : icons.edit}
                                                        className="w-6 h-6"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableHighlight>
                                            </View>
                                            {showRespoName ? (<>
                                                {/* Responder First Name */}
                                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">First Name:</Text>
                                                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                                    <TextInput
                                                        className="w-full text-md font-pmedium text-black"
                                                        placeholder='User First Name'
                                                        editable={true}
                                                        placeholderTextColor='#94A3B8'
                                                        value={updatedFields?.responder?.full_name ? updatedFields.responder.full_name.first_name : ''}
                                                        onChangeText={(value) => handleInputChange('responder.full_name.first_name', value)}
                                                    />
                                                </View>
                                                {/* User Middle Name */}
                                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Middle Name:</Text>
                                                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                                    <TextInput
                                                        className="w-full text-md font-pmedium text-black"
                                                        placeholder='User Middle Name'
                                                        editable={true}
                                                        placeholderTextColor='#94A3B8'
                                                        value={updatedFields?.responder?.full_name ? updatedFields.responder.full_name.middle_name : ''}
                                                        onChangeText={(value) => handleInputChange('responder.full_name.middle_name', value)}
                                                    />
                                                </View>
                                                {/* User Last Name */}
                                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Last Name:</Text>
                                                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                                    <TextInput
                                                        className="w-full text-md font-pmedium text-black"
                                                        placeholder='User Last Name'
                                                        editable={true}
                                                        placeholderTextColor='#94A3B8'
                                                        value={updatedFields?.responder?.full_name ? updatedFields.responder.full_name.last_name : ''}
                                                        onChangeText={(value) => handleInputChange('responder.full_name.last_name', value)}
                                                    />
                                                </View>
                                            </>) : (<></>)}
                                            {/* Responder Identification UID */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Identification: UID:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-primary-hidden"
                                                    placeholder='UID'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.responder?.uid ? updatedFields.responder.uid : ''}
                                                    onChangeText={(value) => handleInputChange('responder.uid', value)}
                                                />
                                            </View>
                                            {/* Emergency Details */}
                                            <View className="w-full h-16 bg-primary items-center justify-center my-[6%]">
                                                <Text className="font-pbold text-white text-lg">EMERGENCY DETAILS</Text>
                                            </View>
                                            {/* Incident Date */}
                                            <Text className="font-pregular text-base text-black py-[2%] pl-[4%]">Date of Emergency:</Text>
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showIDate? "border-black" : "border-primary"} justify-center items-center flex-row px-[10%]`}>
                                                <TextInput
                                                    className={`w-full text-md font-pmedium ${!showIDate ? "text-black" : "text-primary"} ml-4`}
                                                    placeholder='Report Date'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.report_date
                                                        ? getValidDate(updatedFields.report_date).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })
                                                        : '' } 
                                                />
                                                {/* Visible Password Button */}
                                                <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowIDate(!showIDate)}>
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={!showIDate ? icons.editing : icons.edit}
                                                        className="w-6 h-6"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableHighlight>
                                            </View>
                                            {showIDate ? (<>
                                                <DateTimePicker
                                                    mode="date"
                                                    display="default"
                                                    value={getValidDate(updatedFields?.report_date)}
                                                    onChange={handleDateChange}
                                                    themeVariant='dark'
                                                />
                                            </>) : (<></>)}
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showTime? "border-black" : "border-primary"} justify-center items-center flex-row px-[10%] mt-2`}>
                                                <TextInput
                                                    className={`w-full text-md font-pmedium ${!showTime ? "text-black" : "text-primary"} ml-4`}
                                                    placeholder='Report Time'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.report_date
                                                        ? getValidDate(updatedFields.report_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '' } 
                                                />
                                                {/* Visible Password Button */}
                                                <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowTime(!showTime)}>
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={!showTime ? icons.editing : icons.edit}
                                                        className="w-6 h-6"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableHighlight>
                                            </View>
                                            {showTime ? (<>
                                                <DateTimePicker
                                                    mode="time"
                                                    display="default"
                                                    value={getValidDate(updatedFields?.report_date)}
                                                    onChange={handleTimeChange}
                                                    themeVariant='light'
                                                />
                                            </>) : (<></>)}
                                            {/* Incident Type */}
                                            <Text className="font-pregular text-base text-black py-[2%] pl-[4%]">Type of Emergency:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='Report Type'
                                                    editable={false}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.report_type ? translate(updatedFields.report_type) : ''} 
                                                    onChangeText={(value) => handleInputChange('report_type', value)}
                                                />
                                            </View>
                                            {/* Emergency Address */}
                                            <Text className="font-pregular text-base text-black py-[2%] pl-[4%]">Address:</Text>
                                            <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='Report Address'
                                                    editable={true}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.report_address ? updatedFields.report_address : ''} 
                                                    onChangeText={(value) => handleInputChange('report_address', value)}
                                                />
                                            </View>
                                            {/* Description */}
                                            <Text className={`${reportReq.includes('description') ? "font-pmedium text-base text-black" : "font-pregular text-base text-black"} py-[2%] pl-[4%]`}>Describe The Emergency:</Text>
                                            <View className={`w-full h-32 bg-white rounded-2xl ${reportReq.includes('description') ? "border-primary" : "border-black"} border-2 justify-center items-center px-4`}>
                                                <TextInput
                                                    className="w-full text-md font-pmedium text-black"
                                                    placeholder='Report Description'
                                                    editable={true}
                                                    multiline
                                                    numberOfLines={4}
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.description ? updatedFields.description : ''} 
                                                    onChangeText={(value) => handleInputChange('description', value)}
                                                />
                                            </View>
                                            {/* Services */}
                                            <View className="w-full h-16 bg-primary items-center justify-center my-[6%]">
                                                <Text className="font-pbold text-white text-lg">SERVICES</Text>
                                            </View>
                                            {/* Selected Services */}
                                            <Text className="font-pregular text-base text-black py-[2%] pl-[4%]">{"What Emergency Service(s) is called?:"}</Text>
                                            <View className="w-full h-16 bg-white items-center flex-row pl-[4%] mb-[25%]">
                                                <TouchableHighlight underlayColor={"#86ebaa"} className="w-2/4 h-16 justify-center" onPress={() => toggleService('ambulance')}>
                                                    <View className="flex-row">
                                                        <Image 
                                                            tintColor='#000000'
                                                            source={updatedFields.services.includes('ambulance') ? icons.checkBoxCheck : icons.checkBox }
                                                            className="w-5 h-5"
                                                            resizeMode='contain'
                                                        />
                                                        <Text className="font-pregular text-base text-black pl-4">Ambulance</Text>
                                                    </View>
                                                </TouchableHighlight>
                                                <TouchableHighlight underlayColor={"#86ebaa"} className="w-2/4 h-16 justify-center" onPress={() => toggleService('firetruck')}>
                                                    <View className="flex-row">
                                                        <Image 
                                                            tintColor='#000000'
                                                            source={updatedFields.services.includes('firetruck') ? icons.checkBoxCheck : icons.checkBox }
                                                            className="w-5 h-5"
                                                            resizeMode='contain'
                                                        />
                                                        <Text className="font-pregular text-base text-black pl-4">Firetruck</Text>
                                                    </View>
                                                </TouchableHighlight>
                                            </View>
                                        </View>
                                    </ScrollView>
                                )}
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="w-full items-center pb-[4%] bg-primary"/>
                            <View className="w-full h-[5%] flex-row">
                                <View className="w-3/6 h-full bg-white items-center justify-center rounded-t-3xl">
                                    {selectedReport && <Text className="font-rbold text-primary-100 text-base">
                                        {selectedReport?.report_id}
                                    </Text>
                                    }
                                </View>
                            </View>
                            {/* Document Preview */}
                            <View className="items-center justify-center">
                                <View className={`overflow-hidden bg-white`} style={{ width: width * 1.1, height: height * 0.6 }}>
                                    <WebView
                                        originWhitelist={['*']}
                                        source={{ html: htmlContent }}
                                        style={{ flex: 1 }}
                                        scalesPageToFit={true}
                                    />
                                </View>
                            </View>
                            {/* Tools Available */}
                            <View className="w-full h-[10%] bg-primary-85 items-center justify-evenly flex-row rounded-b-3xl shadow-md shadow-black/80">
                                <TouchableHighlight underlayColor={"#FDFFAE"} className={`${reportReq.length > 0 ? 'w-1/6' : 'w-[30%]'} h-14 items-center justify-center bg-white rounded-2xl`} onPress={handleClose}>
                                    <View className="flex-row items-center justify-center">
                                        <Image 
                                            tintColor='#57b378'
                                            source={icons.close}
                                            className="w-5 h-5"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </TouchableHighlight>
                                {printOption && (
                                    <>
                                        <View className={`${reportReq.length > 0 ? 'w-[40%] left-[22%]' : 'w-[60%] right-[4%]'} h-14 bg-white absolute z-20 -top-[65%] items-center justify-center flex-row shadow-lg shadow-black`}>
                                            <View className="w-[49%] h-full">
                                                <TouchableHighlight underlayColor={"#FDFFAE"} className="w-full h-full items-center justify-center bg-white" onPress={() => toggleOption('pdf')}>
                                                    <Text className={`font-rbold text-primary`}>{'PDF'}</Text>
                                                </TouchableHighlight>
                                            </View>
                                            <View className="w-[1px] h-[80%] bg-primary" />
                                            <View className="w-[49%] h-full">
                                                <TouchableHighlight underlayColor={"#FDFFAE"} className="w-full h-full items-center justify-center bg-white" onPress={() => toggleOption('word')}>
                                                    <Text className={`font-rbold text-primary`}>{'DOCX'}</Text>
                                                </TouchableHighlight>
                                            </View>
                                        </View>
                                    </>
                                )}
                                <TouchableHighlight underlayColor={"#FDFFAE"} className={`${reportReq.length > 0 ? 'w-2/6' : 'w-[60%]'} h-14 bg-white rounded-2xl justify-center`} onPress={() => handleExport('pdf')} disabled={printLoading}>
                                    <View className="flex-row items-center justify-center">
                                        {printLoading ? (
                                            <ActivityIndicator size="large" color="#57b378" />
                                        ) : (
                                            <>
                                                <Text className={`right-[30%] font-rbold ${reportReq.length > 0 ? 'text-lg' : 'text-xl'} text-primary`}>PRINT</Text>
                                                <View className="absolute right-[15%] items-center justify-center">
                                                    <Image 
                                                        tintColor='#57b378'
                                                        source={icons.prints}
                                                        className={`${reportReq.length > 0 ? 'w-5 h-5' : 'w-6 h-6'}`}
                                                        resizeMode='contain'
                                                    />
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </TouchableHighlight>
                                {reportReq.length > 0 && (
                                    <TouchableHighlight underlayColor={"#FDFFAE"} className="w-2/6 h-14 bg-white rounded-2xl justify-center" onPress={() => handleEdit(selectedReport)}>
                                        <View className="flex-row items-center justify-center">
                                            <Text className="right-[30%] font-pbold text-lg text-primary">EDIT</Text>
                                            <View className="absolute right-[15%] items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.edit}
                                                    className="w-6 h-6"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                )}
                            </View>
                        </>
                    )}
                </>
            ) : (
                <>
                    <View className="w-full h-full pt-[4%] bg-white items-center">
                        <View className="items-center pb-[4%]">
                            <Text className="font-rblack text-primary-100 text-2xl">Available Documents</Text>
                        </View>
                        <View className="w-[95%] h-[6%] items-center border-y-[0.3px] border-primary-100 flex-row bg-white">
                            <View className="w-2/4 h-full justify-center pl-[4%]">
                                <Text className="font-rmedium text-primary-100 text-base">NAME</Text>
                            </View>
                            <View className="w-1/4 h-full justify-center">
                                <Text className="font-rmedium text-primary-100 text-base">TIME</Text>
                            </View>
                            <View className="w-1/4 h-fulljustify-center">
                                <Text className="font-rmedium text-primary-100 text-base">DATE</Text>
                            </View>
                        </View>
                        <ScrollView className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}}>
                            {reports.map((report) => (
                                reportRow(report)
                            ))}
                        </ScrollView>
                    </View>
                </>
            )}
            {/* Status Bar */}
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
        );
    };

    export default FormScreen;
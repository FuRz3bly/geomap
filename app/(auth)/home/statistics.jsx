import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, TouchableHighlight, Alert, ActivityIndicator, BackHandler, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { images, icons } from '../../../constants';

const StatisticsScreen = ({ changePage, backPage }) => {
  const { user } = useContext(UserContext);
  const { dictionary } = useContext(ToolsContext);
  const { height, width } = Dimensions.get('screen');

  const [amenity, setAmenity] = useState(null);
  const [reports, setReports] = useState([]);
  const [dateNow, setDateNow] = useState(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric',})); // IN HINDSIGHT ITS GOOD BUT THIS IS STUPID
  const [totalReports, setTotalReports] = useState(0); // Total Number of Reports
  const [reportTypeCounts, setReportTypeCounts] = useState({}); // Find all same report types and count
  const [reportHandle, setReportHandle] = useState([]); // Report Type Handles Container
  const [typeSelect, setTypeSelect] = useState('structural_fire'); // Current Report Type Container
  const [filteredReports, setFilteredReports] = useState([]);

  const [dataPoints, setDataPoints] = useState([0, 0, 0, 0, 0, 0, 0]); // 7 Points for Weekly Data
  const [selectedWeek, setSelectedWeek] = useState(new Date()); // Week selection
  const [filterWeekRange, setFilterWeekRange] = useState('this_week'); // Selected Week Range
  const [showDate, toggleDate] = useState(false); // Display Date Filters
  const [showCalendar, toggleCalendar] = useState(false); // Display Calendar Filters
  const [serviceMode, setServiceMode] = useState('reports'); // Set Mode for Stats

  const [highRespoTime, setHighRespoTime] = useState(0); // Highest Response Time
  const [highRespoID, setHighRespoID] = useState('') // Highest Response Time Report ID
  const [lowRespoTime, setLowRespoTime] = useState(0); // Lowest Response Time
  const [lowRespoID, setLowRespoID] = useState('') // Lowest Response Time Report ID
  const [aveRespoTime, setAveRespoTime] = useState(0); // Average Response Time

  const [highArriveTime, setHighArriveTime] = useState(0); // Highest Arrival Time
  const [highArriveDistance, setHighArriveDistance] = useState(0);
  const [highArriveID, setHighArriveID] = useState('') // Highest Arrival Time Report ID
  const [lowArriveTime, setLowArriveTime] = useState(0); // Lowest Arrival Time
  const [lowArriveDistance, setLowArriveDistance] = useState(0);
  const [lowArriveID, setLowArriveID] = useState('') // Lowest Arrival Time Report ID
  const [aveArriveTime, setAveArriveTime] = useState(0); // Average Arrival Time

  const [htmlContent, setHtmlContent] = useState(''); // HTML Container
  const [viewPDF, setViewPDF] = useState(false);
  const [viewOptions, setViewOptions] = useState(false);
  const webViewRef = useRef(null);

  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [selectedFromMonth, setSelectedFromMonth] = useState('Select Month');
  const [selectedToMonth, setSelectedToMonth] = useState('Select Month');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Select Month');

  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [isDateRange, setIsDateRange] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 
    'June', 'July', 'August', 'September', 'October', 
    'November', 'December'
  ];

  const years = [ 2024, 2025 ];

  const currentMonthIndex = new Date().getMonth();

  const fromMonths = selectedYear === 2025 ? [months[currentMonthIndex]] : months;
  const toMonths = fromMonths.filter((month) => month !== selectedFromMonth);

  // Update isDateRange based on the length of fromMonths
  useEffect(() => {
    if (fromMonths.length === 1) {
      setIsDateRange(false); // Disable date range if only one month is available
    }
  }, [fromMonths]);

  // Translator Function
  const translate = (key) => {
    return dictionary[key] || key;
  };

  // Icon Generator Function
  const icogenerator = (key) => {
    const iconKey = dictionary[key + '_icon'];
    return icons[iconKey] || null;
  };

  // Handle Generator Function
  const handlegenerator = (type) => {
    const handleType = dictionary[type + '_handle'];
    return handleType || null;
  };

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

  // Real-time Listener Amenity
  useEffect(() => {
    const unsubscribeAmenity = onSnapshot(collection(db, 'amenity'), (snapshot) => {
      const amenityList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        responders: doc.data().responders.map(responder => responder.uid),
      }));

      if (user) {
        const userAmenity = amenityList.find(
          amenity => amenity.responders && amenity.responders.includes(user.uid)
        );

        if (userAmenity) {
          setAmenity(userAmenity);
          setReportHandle(handlegenerator(userAmenity.type));
        }
      }
    });

    return () => unsubscribeAmenity();
  }, [user]);

  // Real-time Listener Reports
  useEffect(() => {
    if (!amenity) return;
  
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'reports'), where('responder.amenity.id', '==', amenity.id));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reportsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setReports(reportsList);
  
          if (serviceMode === 'reports') {
            generateChartData(reportsList); // Generate chart based on the selected filter
          } else if (serviceMode === 'reportType') {
            const filterReports = reportsList.filter(report => report.report_type === typeSelect);
            generateChartData(filterReports); // Generate chart based on the filtered reports
            setFilteredReports(filterReports); // Store Filtered All Reports
          } else if (serviceMode === 'respoTime') {
            generateTimeChartData(reportsList, serviceMode); // Generate chart based on the Report Time
          } else if (serviceMode === 'arriveTime') {
            generateTimeChartData(reportsList, serviceMode); // Generate chart based on the Arrival Time
          }
         });
  
        // Cleanup listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching reports: ", error);
        Alert.alert("Error", "Could not fetch reports. Please try again later.");
      }
    };
  
    fetchReports();
  }, [amenity, filterWeekRange, selectedWeek, serviceMode, typeSelect]);

  // Generator of Line Chart
  const generateChartData = (reportsList) => {
    // Get the current date
    const now = new Date();
    let startOfWeek, endOfWeek, startOfMonth, endOfMonth, daysInMonth;

    // Calculate start and end dates based on the filter
    if (filterWeekRange === 'this_week') {
      startOfWeek = new Date(selectedWeek);
      const currentDay = startOfWeek.getDay();
      
      // Adjust the week to start on Sunday (Sunday is 0)
      startOfWeek.setDate(startOfWeek.getDate() - currentDay); // Set to Sunday of this week
      startOfWeek.setHours(0, 0, 0, 0);

      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of this week
      endOfWeek.setHours(23, 59, 59, 999);
    } else if (filterWeekRange === 'last_week') {
      // Last week's Sunday to Saturday
      startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - now.getDay() - 7); // Go back to last Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Last week's Saturday
      endOfWeek.setHours(23, 59, 59, 999);
    } else if (filterWeekRange === 'last_last_week') {
      // Two weeks ago Sunday to Saturday
      startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - now.getDay() - 14); // Go back two Sundays
      startOfWeek.setHours(0, 0, 0, 0);

      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Two weeks ago Saturday
      endOfWeek.setHours(23, 59, 59, 999);
    } else {
      startOfWeek = new Date(selectedWeek);
      const currentDay = startOfWeek.getDay();
      
      // Adjust for week starting on Sunday
      startOfWeek.setDate(startOfWeek.getDate() - currentDay); // Set to Sunday of this week
      startOfWeek.setHours(0, 0, 0, 0);

      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of this week
      endOfWeek.setHours(23, 59, 59, 999);
    }

    // Create an array with 7 elements representing the days (Sunday to Saturday)
    const dayCounts = Array(7).fill(0);
    let totalReportsCount = 0;
    const typeCounts = {};

    // Loop through each report in the list
    reportsList.forEach((report) => {
      const receivedTime = report.responder?.received_time?.seconds
        ? new Date(report.responder.received_time.seconds * 1000)
        : null;

      // Only process if receivedTime is within the range from startOfWeek to endOfWeek
      if (receivedTime && receivedTime >= startOfWeek && receivedTime <= endOfWeek) {
        const reportDay = receivedTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        dayCounts[reportDay] += 1; // Increment the count for the corresponding day (Sunday is index 0)
        totalReportsCount += 1; // Count Reports

        // Count the report types
        const reportType = report.report_type || 'Unknown';
        if (!typeCounts[reportType]) {
          typeCounts[reportType] = 0;
        }
        typeCounts[reportType] += 1;
      }
    });

    setDataPoints(dayCounts); // Update the dataPoints state
    setTotalReports(totalReportsCount); // Update Total Reports
    setReportTypeCounts(typeCounts); // Update Total Report Type
  };

  // Time Generator of Line Chart
  const generateTimeChartData = (reportsList, mode) => { 
    const now = new Date();
    let startOfWeek, endOfWeek;
  
    // Calculate start and end dates based on the filter
    if (filterWeekRange === 'this_week') {
      startOfWeek = new Date(selectedWeek);
      const currentDay = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - currentDay); // Set to Sunday of this week
      startOfWeek.setHours(0, 0, 0, 0);
      
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of this week
      endOfWeek.setHours(23, 59, 59, 999);
    } else if (filterWeekRange === 'last_week') {
      // Last week's Sunday to Saturday
      startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - now.getDay() - 7); // Go back to last Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Last week's Saturday
      endOfWeek.setHours(23, 59, 59, 999);
    } else if (filterWeekRange === 'last_last_week') {
      // Two weeks ago Sunday to Saturday
      startOfWeek = new Date(now);
      startOfWeek.setDate(startOfWeek.getDate() - now.getDay() - 14); // Go back two Sundays
      startOfWeek.setHours(0, 0, 0, 0);
      
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Two weeks ago Saturday
      endOfWeek.setHours(23, 59, 59, 999);
    } else {
      startOfWeek = new Date(selectedWeek);
      const currentDay = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - currentDay); // Set to Sunday of this week
      startOfWeek.setHours(0, 0, 0, 0);
      
      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday of this week
      endOfWeek.setHours(23, 59, 59, 999);
    }
  
    // Create arrays to store the sum of response times and the count of reports for each day (Sunday to Saturday)
    const dayResponseSums = Array(7).fill(0); // Sum of response times per day
    const dayArriveSums = Array(7).fill(0); // Sum of arrival times per day
    const dayReportCounts = Array(7).fill(0);  // Count of reports per day
  
    let totalResponseSum = 0; // Total sum of all response times
    let totalArriveSum = 0; // Total sum of all arrival times
    let totalReportsCount = 0; // Total count of all reports

    let highestResponseTime = 0;
    let highestResponseTimeId = null;
    let lowestResponseTime = Infinity; // Initialize to Infinity
    let lowestResponseTimeId = null;

    let highestArriveTime = 0;
    let highestArriveTimeId = null;
    let lowestArriveTime = Infinity; // Initialize to Infinity
    let lowestArriveTimeId = null;

    let lowestTimePerKm = Infinity;
    let highestTimePerKm = 0;

    if (mode === 'respoTime') {
      // Loop through each report in the list
      reportsList.forEach((report) => {
        const reportDate = report?.report_date?.seconds
          ? new Date(report.report_date.seconds * 1000)
          : null;
        const receivedTime = report.responder?.received_time?.seconds
          ? new Date(report.responder.received_time.seconds * 1000)
          : null;
    
        // Ensure both dates are available and valid
        if (reportDate && receivedTime && receivedTime >= startOfWeek && receivedTime <= endOfWeek) {
          // Calculate the response time (in minutes)
          const responseTimeInMinutes = (receivedTime - reportDate) / (1000 * 60); // Convert ms to minutes
    
          // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
          const reportDay = receivedTime.getDay(); // Use responder.received_time to determine the day
    
          // Sum up the response times and count reports for each day
          dayResponseSums[reportDay] += responseTimeInMinutes;
          totalResponseSum += responseTimeInMinutes;
          dayReportCounts[reportDay] += 1;
          totalReportsCount += 1; // Track total reports for all days

          // Check if this report has the highest response time
          if (responseTimeInMinutes > highestResponseTime) {
            highestResponseTime = responseTimeInMinutes;
            highestResponseTimeId = report.report_id;
          }

          // Check if this report has the lowest response time (and avoid 0 response time)
          if (responseTimeInMinutes > 0 && responseTimeInMinutes < lowestResponseTime) {
            lowestResponseTime = responseTimeInMinutes;
            lowestResponseTimeId = report.report_id;
          }
        }
      });
    
      // Calculate the average response time for each day (Sunday to Saturday)
      const averageResponseTimes = dayResponseSums.map((sum, index) =>
        dayReportCounts[index] > 0 ? sum / dayReportCounts[index] : 0
      );

      const averageResponseTime = totalReportsCount > 0 ? totalResponseSum / totalReportsCount : 0;
    
      // Find the highest and lowest response times
      const filteredTimes = averageResponseTimes.filter(time => time > 0);
      const highestResponseTimes = filteredTimes.length > 0 ? Math.max(...filteredTimes) : 0;
      const lowestResponseTimes = filteredTimes.length > 0 ? Math.min(...filteredTimes) : 0;
    
      // Update the dataPoints state with average response times for each day
      setDataPoints(averageResponseTimes); // Each index represents Sunday to Saturday
      setTotalReports(totalReportsCount); // Update Total Reports
    
      // Set state for highest and lowest response times
      setHighRespoTime(highestResponseTime);
      setHighRespoID(highestResponseTimeId);
      setLowRespoTime(lowestResponseTime);
      setLowRespoID(lowestResponseTimeId);
      setAveRespoTime(averageResponseTime);
    } else {
      // Loop through each report in the list
      reportsList.forEach((report) => {
        const receivedTime = report.responder?.received_time?.seconds
          ? new Date(report.responder.received_time.seconds * 1000)
          : null;
        const arrivalTime = report.responder?.arrival_time?.seconds
          ? new Date(report.responder.arrival_time.seconds * 1000)
          : null;
      
        const distance = parseFloat(report.responder?.route_time?.distance) || 0; // Distance in kilometers
        
        if (receivedTime && arrivalTime && receivedTime >= startOfWeek && arrivalTime <= endOfWeek && distance > 0) {
          const arriveTimeInMinutes = (arrivalTime - receivedTime) / (1000 * 60); // Convert ms to minutes
          const timePerKm = arriveTimeInMinutes / distance;
      
          const receivedDay = arrivalTime.getDay(); 
          dayArriveSums[receivedDay] += arriveTimeInMinutes;
          totalArriveSum += arriveTimeInMinutes;
          dayReportCounts[receivedDay] += 1;
          totalReportsCount += 1;
      
          // Find the highest and lowest weighted arrival times (considering distance)
          if (timePerKm < lowestTimePerKm) {
            lowestTimePerKm = timePerKm;
            lowestArriveTime = arriveTimeInMinutes;
            lowestArriveTimeId = report.report_id;
            setLowArriveDistance(distance);
          }
        
          if (timePerKm > highestTimePerKm) {
            highestTimePerKm = timePerKm;
            highestArriveTime = arriveTimeInMinutes;
            highestArriveTimeId = report.report_id;
            setHighArriveDistance(distance);
          }
        }
      });
      
      // Calculating averages and setting states remains the same
      const averageArriveTimes = dayArriveSums.map((sum, index) =>
        dayReportCounts[index] > 0 ? sum / dayReportCounts[index] : 0
      );
      
      const averageArriveTime = totalReportsCount > 0 ? totalArriveSum / totalReportsCount : 0;
      
      setDataPoints(averageArriveTimes);
      setTotalReports(totalReportsCount);
      setHighArriveTime(highestArriveTime);
      setHighArriveID(highestArriveTimeId);
      setLowArriveTime(lowestArriveTime);
      setLowArriveID(lowestArriveTimeId);
      setAveArriveTime(averageArriveTime);      
    }
  };

  // Week Filter Function
  const handleWeekFilterChange = (filter) => {
    if (filter === 'this_week') {
      setSelectedWeek(new Date())
    }
    setFilterWeekRange(filter);
  };

  const serviceModeChange = (mode) => {
    setServiceMode(mode);
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(2);
    return `${m}M ${s}S`;
  };

  const generateDoc = (reports, amenity) => {
    // Translate report types and count occurrences
    const reportTypeCounts = reports.reduce((acc, report) => {
        const translatedType = translate(report.report_type); // Translate here
        acc[translatedType] = (acc[translatedType] || 0) + 1;
        return acc;
    }, {});

    const monthYear = isDateRange ? `${selectedFromMonth} - ${selectedToMonth} ${selectedYear}` : `${selectedMonth} ${selectedYear}`

    const totalReports = reports.length; // Calculate the total number of reports

    // Generate table rows for report statistics (type, count, percentage)
    const tableRows = Object.entries(reportTypeCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([type, count]) => {
          const percentage = ((count / totalReports) * 100).toFixed(2); // Calculate percentage
          return `
              <tr>
                  <td>${type}</td>
                  <td style="text-align: right;">${count}</td>
                  <td style="text-align: right;">${percentage}%</td>
                  <td>
                      <div style="
                          background-color: #57b378;
                          height: 20px;
                          width: ${percentage}%;
                          max-width: 100%;
                          margin: 5px 0;
                      "></div>
                  </td>
              </tr>
          `;
      })
      .join("");

    // Add bottom row for total
    const totalRow = `
      <tr>
          <td><strong>Total Report Types</strong></td>
          <td style="text-align: right;"><strong>${totalReports}</strong></td>
          <td colspan="2" style="text-align: right;"><strong>100.00%</strong></td>
      </tr>
    `;

    // Combine rows with total row
    const finalTableRows = tableRows + totalRow;

    const responseTimes = [];

    // Calculate response times for each report
    const responseTimeRows = reports
        .sort((a, b) => {
            const aTime = a.responder?.received_time?.seconds || 0;
            const bTime = b.responder?.received_time?.seconds || 0;
            return bTime - aTime; // Sort descending by received_time
        })
        .slice(0, 5) // Take only the 5 most recent reports
        .map((report) => {
            const receivedTime = report.responder?.received_time?.seconds
                ? new Date(report.responder.received_time.seconds * 1000)
                : null;
            const arrivalTime = report.responder?.arrival_time?.seconds
                ? new Date(report.responder.arrival_time.seconds * 1000)
                : null;

            const formatTime = (date) =>
                date
                    ? date.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })
                    : "N/A";

            const responseTimeInMinutes =
                receivedTime && arrivalTime
                    ? ((arrivalTime - receivedTime) / 60000).toFixed(2)
                    : "N/A"; // Convert to minutes if times are valid

            if (responseTimeInMinutes !== "N/A") {
                responseTimes.push(parseFloat(responseTimeInMinutes)); // Collect valid times
            }

            return `
                <tr>
                    <td>${report.report_id}</td>
                    <td style="text-align: right;">${formatTime(receivedTime)}</td>
                    <td style="text-align: right;">${formatTime(arrivalTime)}</td>
                    <td style="text-align: right;">${responseTimeInMinutes} mins</td>
                </tr>
            `;
        })
        .join("");

    const averageResponseTime = responseTimes.length
        ? (responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length).toFixed(2)
        : "N/A";
    
    const fastestResponseTime = Math.min(...responseTimes).toFixed(2) + " mins";
    const slowestResponseTime = Math.max(...responseTimes).toFixed(2) + " mins";
    const medianResponseTime = calculateMedian(responseTimes).toFixed(2) + " mins";

    function calculateMedian(arr) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const withinResponseTime = reports.filter((report) => {
      const receivedTime = report.responder?.received_time?.seconds
          ? new Date(report.responder.received_time.seconds * 1000)
          : null;
      const arrivalTime = report.responder?.arrival_time?.seconds
          ? new Date(report.responder.arrival_time.seconds * 1000)
          : null;
  
      if (receivedTime && arrivalTime) {
          const responseTimeInMinutes = (arrivalTime - receivedTime) / 60000;
          return responseTimeInMinutes <= 7; // Check against the ideal response time
      }
  
      return false; // Exclude invalid times
    }).length;

    const exceedingResponseTime = reports.filter((report) => {
      const receivedTime = report.responder?.received_time?.seconds
          ? new Date(report.responder.received_time.seconds * 1000)
          : null;
      const arrivalTime = report.responder?.arrival_time?.seconds
          ? new Date(report.responder.arrival_time.seconds * 1000)
          : null;
  
      if (receivedTime && arrivalTime) {
          const responseTimeInMinutes = (arrivalTime - receivedTime) / 60000;
          return responseTimeInMinutes > 7; // Check for exceeding the ideal response time
      }
  
      return false; // Exclude invalid times
    }).length;
  
    // Add the footer row
    const footerRow = `
        <tr>
            <th style="text-align: center;">Fastest</th>
            <th style="text-align: center;">Median</th>
            <th style="text-align: center;">Slowest</th>
            <th style="text-align: center;">Average</th>
        </tr>
        <tr>
            <td style="text-align: center;">${fastestResponseTime}</td>
            <td style="text-align: center;">${medianResponseTime}</td>
            <td style="text-align: center;">${slowestResponseTime}</td>
            <td style="text-align: center;">${averageResponseTime} mins</td>
        </tr>
    `;

    const reportTypeTable = `
        <table>
            <thead>
                <tr>
                    <th>Report Type</th>
                    <th>Count</th>
                    <th>Percent</th>
                    <th>Graph</th>
                </tr>
            </thead>
            <tbody>
                ${finalTableRows}
            </tbody>
        </table>
    `;

    const responseTimeTable = `
        <table>
            <thead>
                <tr>
                    <th>Report Type</th>
                    <th>Receive Time</th>
                    <th>Arrival Time</th>
                    <th>Response Time</th>
                </tr>
            </thead>
            <tbody>
                ${responseTimeRows}
                <tr>
                    <td colspan="4" style="height: 20px; border: none;"></td> <!-- Spacer Row -->
                </tr>
            </tbody>
            <tfoot>
                ${footerRow}
            </tfoot>
        </table>
    `;

    const unclassifiedCount = totalReports - Object.values(reportTypeCounts).reduce((a, b) => a + b, 0);
    const unclassifiedPercentage = ((unclassifiedCount / totalReports) * 100).toFixed(2);
    const notableTypes = Object.entries(reportTypeCounts)
      .slice(1, 3)
      .map(([type, count]) => `${type} (${count} ${count === 1 ? 'report' : 'reports'}, ${(count / totalReports * 100).toFixed(2)}%)`);

    const formattedNotableTypes = notableTypes.length > 1
        ? notableTypes.slice(0, -1).join(', ') + ' and ' + notableTypes.slice(-1)
        : notableTypes.join(', ');

    let responseSummary;

    // Helper function to format percentage
    const formatPercentage = (count, total) => ((count / total) * 100).toFixed(2);
    
    // Helper function to pluralize text
    const pluralize = (count, singular, plural) => (count === 1 ? singular : plural);
    
    // Determine response texts
    const totalResponseText = pluralize(totalReports, "response", "responses");
    const withinResponseText = pluralize(withinResponseTime, "response", "responses");
    const exceedingResponseText = pluralize(exceedingResponseTime, "response", "responses");
    
    // Construct the response summary
    if (totalReports === 0) {
        responseSummary = `No responses were documented during this period.`;
    } else if (withinResponseTime > 0 && exceedingResponseTime > 0) {
        const withinPercentage = formatPercentage(withinResponseTime, totalReports);
        const exceedingPercentage = formatPercentage(exceedingResponseTime, totalReports);
    
        if (withinResponseTime >= exceedingResponseTime) {
            responseSummary = `A total of ${totalReports} ${totalResponseText} was documented, with ${withinResponseTime} (${withinPercentage}%) ${withinResponseText} achieving the ideal response time of up to seven (7) minutes. However, ${exceedingResponseTime} (${exceedingPercentage}%) ${exceedingResponseText} exceeded this timeframe due to factors such as distance and traffic.`;
        } else {
            responseSummary = `A total of ${totalReports} ${totalResponseText} was documented. However, only ${withinResponseTime} (${withinPercentage}%) ${withinResponseText} achieved the ideal response time of up to seven (7) minutes, while the majority, ${exceedingResponseTime} (${exceedingPercentage}%) ${exceedingResponseText}, exceeded this timeframe due to factors such as distance and traffic.`;
    }
    } else if (withinResponseTime > 0) {
        const withinPercentage = formatPercentage(withinResponseTime, totalReports);
        responseSummary = `A total of ${totalReports} ${totalResponseText} was documented, with ${withinResponseTime} (${withinPercentage}%) ${withinResponseText} achieving the ideal response time of up to seven (7) minutes.`;
    } else {
        const exceedingPercentage = formatPercentage(exceedingResponseTime, totalReports);
        responseSummary = `A total of ${totalReports} ${totalResponseText} was documented, with ${exceedingResponseTime} (${exceedingPercentage}%) ${exceedingResponseText} exceeding the ideal response time of up to seven (7) minutes due to factors such as distance and traffic.`;
    }

    const standardResponseTime = 7;  // Standard response time in minutes

    const responseTimeByType = {};  // To store response times by report type

    // Collect response times per type
    reports.forEach((report) => {
        const translatedType = translate(report.report_type);  // Translate type
        const receivedTime = report.responder?.received_time?.seconds
            ? new Date(report.responder.received_time.seconds * 1000)
            : null;
        const arrivalTime = report.responder?.arrival_time?.seconds
            ? new Date(report.responder.arrival_time.seconds * 1000)
            : null;

        const responseTimeInMinutes =
            receivedTime && arrivalTime
                ? (arrivalTime - receivedTime) / 60000  // Calculate response time in minutes
                : null;

        if (responseTimeInMinutes !== null) {
            if (!responseTimeByType[translatedType]) {
                responseTimeByType[translatedType] = [];
            }
            responseTimeByType[translatedType].push(responseTimeInMinutes);  // Store response time
        }
    });

    // Compute average response times by type
    const responseTypeRows = Object.entries(responseTimeByType)
      .map(([type, times]) => {
          const averageTime = times.length 
              ? (times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(2) 
              : "N/A";

          const performanceStatus = averageTime !== "N/A" && parseFloat(averageTime) <= standardResponseTime
              ? "On Time"  // Within standard response time
              : "Delayed"; // Exceeds standard response time

          return `
              <tr>
                  <td>${type}</td>
                  <td style="text-align: right;">${averageTime} mins</td>
                  <td style="text-align: center;">${performanceStatus}</td>
              </tr>
          `;
      })
      .join("");

    // Final table
    const responseTimeByTypeTable = `
        <table>
          <thead>
              <tr>
                  <th>Report Type</th>
                  <th>Average Response Time</th>
                  <th>Timeliness</th>
              </tr>
          </thead>
          <tbody>
              ${responseTypeRows}
          </tbody>
        </table>
    `;

    const averageTimes = Object.values(responseTimeByType).map((times) =>
      times.length ? (times.reduce((sum, time) => sum + time, 0) / times.length) : null
    );
    
    // Filter out any null values
    const validAverageTimes = averageTimes.filter((time) => time !== null);
    
    const fastestAverageResponseTime = validAverageTimes.length 
        ? Math.min(...validAverageTimes).toFixed(2) 
        : "N/A";
    
    const slowestAverageResponseTime = validAverageTimes.length 
        ? Math.max(...validAverageTimes).toFixed(2) 
        : "N/A";

    return `
        <html>
            <head>
                <style>
                    body {
                      font-family: Arial, sans-serif;
                      background-color: white;
                      margin: 0mm 2mm 0mm 3mm;
                      width: 297mm; /* Switch width and height for landscape */
                      height: 210mm;
                      padding: 40px;
                      overflow: hidden;
                      transform: scale(1.1, 1.1);
                      transform-origin: left top;
                    }
                    .title-heading { 
                      text-align: center; 
                      color: black; 
                      font-size: 36px; 
                      margin: 0;
                      padding: 12px;
                      background-color: transparent;
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
                      font-size: 18px; 
                      margin: 0;
                      padding: 5px;
                    }
                    p.error { 
                      color: #de4e55;
                      font-size: 18px;
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
                    .table-container {
                      display: flex;
                      justify-content: space-between;
                    }
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 20px 0;
                      color: black;
                    }
                    table th, table td {
                      border: 1px solid black;
                      padding: 8px;
                      text-align: left;
                    }
                    table th {
                      background-color: white;
                      font-weight: bold;
                      text-align: center;
                    }
                    table tr:nth-child(even) {
                      background-color: #f9f9f9;
                    }
                    .page {
                      page-break-after: always;
                      width: 100%;
                    }
                    .page:last-child {
                      page-break-after: auto;
                    }
                    @page { 
                      size: A4 landscape;
                      margin: 0mm 0mm 0mm 0mm; 
                    }
                    @media print {
                      body {
                        max-width: 100%;
                        max-height: 50%;
                        transform: scale(1.1);
                        transform-origin: left top;
                        margin: 0mm 10mm 0mm 2mm;
                      }
                      .page {
                        page-break-after: always;
                      }
                    }
                </style>
            </head>
            <body>

              <!-- Page 1 -->
              <div class="page">
                <h1 class="title-heading">Monthly Report for ${monthYear}</h1>
                <div class="spacer"></div>
                <h1 class="highlighted-heading">I. EMERGENCY REPORTED</h1>
                <div class="spacer"></div>
                <p style="text-align: justify;">
                  This table summarizes all reports recorded at ${amenity?.name} ${amenity?.description} for ${monthYear}. 
                  It categorizes incidents by type, including ${handlegenerator(amenity?.type)?.map((key) => translate(key)).join(", ")}, with a detailed breakdown of counts, percentages, and graphical contributions.
                </p>
                  ${reportTypeTable}
                <p style="text-align: justify;">
                  Based on the data for ${amenity?.name} ${amenity?.description} during ${monthYear}, a total of ${totalReports} incidents were documented. 
                  Of these, ${Object.values(reportTypeCounts).reduce((a, b) => a + b, 0)} (${((Object.values(reportTypeCounts).reduce((a, b) => a + b, 0) / totalReports) * 100).toFixed(2)}%) were categorized into the listed types.
                  The most reported type was ${Object.entries(reportTypeCounts).sort((a, b) => b[1] - a[1])[0][0]}, with ${Object.entries(reportTypeCounts).sort((a, b) => b[1] - a[1])[0][1]} reports (${((Object.entries(reportTypeCounts).sort((a, b) => b[1] - a[1])[0][1] / totalReports) * 100).toFixed(2)}%). 
                  Other notable types includes ${formattedNotableTypes}.
                  ${
                    unclassifiedCount > 0
                      ? `This data underscores the need for focused responses, with ${unclassifiedCount} (${unclassifiedPercentage}%) remaining unclassified.`
                      : ""
                  }
                </p>
              </div>

              <!-- Page 2 -->
              <div class="page">
                <div class="spacer"></div>
                <h1 class="highlighted-heading">II. RESPONSE TIMES BY REPORT</h1>
                <div class="spacer"></div>
                <p style="text-align: justify;">
                  This table highlights the top 5 most recent incidents and their respective response times, showing the interval from when dispatch information was received to the time of arrival at the scene.
                  The ability of responding units to meet the standard response time of seven (7) minutes is reflected in the fastest, slowest, median, and average response times presented below.
                </p>
                  ${responseTimeTable}
                <p style="text-align: justify;">
                  The response table highlights the performance of response teams in attending to reported incidents. 
                  ${responseSummary}
                  The fastest recorded response time was ${fastestResponseTime} minutes, while the slowest was ${slowestResponseTime} minutes. 
                  The median response time, providing a clear picture of typical performance, was ${medianResponseTime} minutes, with an average response time of ${averageResponseTime} minutes. 
                  This data underscores the effectiveness of response units and highlights areas requiring improvement to ensure prompt emergency management.
                </p>
                <div class="spacer"></div>
              </div>

              <!-- Page 3 -->
              <div class="page">
                <div class="spacer"></div>
                <h1 class="highlighted-heading">III. RESPONSE TIMES BY TYPE</h1>
                <div class="spacer"></div>
                <p style="text-align: justify;">
                  This table categorizes incidents by type, including ${handlegenerator(amenity?.type)?.map((key) => translate(key)).join(", ")}, highlighting the average response time and efficiency of responses. Performance is evaluated against the standard response time of seven (7) minutes, indicating whether responses were timely or delayed for each incident category.
                </p>
                ${responseTimeByTypeTable}
                <p style="text-align: justify;">
                  The response time by type table provides a detailed view of response performance for each incident category. 
                  The fastest average response time among incident types was ${fastestAverageResponseTime} minutes, while the slowest was ${slowestAverageResponseTime} minutes. 
                  This breakdown highlights variations in response efficiency across different emergencies, emphasizing the importance of optimizing resource allocation and strategies for improved response times.
                  Performance is evaluated against the standard seven (7) minutes response time to identify areas needing enhanced readiness and rapid deployment.
                </p>
              </div>
            </body>
        </html>
    `;
  };

  const handleGen = async () => {
    setViewOptions(false);
  
    const filteredReports = reports.filter((report) => {
      const reportDateValue = report.report_date || report.incident_date;
      let reportDate;
  
      if (reportDateValue && reportDateValue.seconds !== undefined) {
        reportDate = new Date(reportDateValue.seconds * 1000); // Convert Firestore Timestamp to Date
      } else if (typeof reportDateValue === 'string' || typeof reportDateValue === 'number') {
        reportDate = new Date(reportDateValue);
      } else {
        console.warn("Skipping report with unrecognized date format:", report);
        return false;
      }
  
      if (isNaN(reportDate.getTime())) {
        console.warn("Invalid date in report:", reportDateValue);
        return false;
      }
  
      const reportYear = reportDate.getFullYear();
      const reportMonthIndex = reportDate.getMonth();
  
      if (isDateRange) {
        const fromMonthIndex = months.indexOf(selectedFromMonth);
        const toMonthIndex = months.indexOf(selectedToMonth);
        if (fromMonthIndex === -1 || toMonthIndex === -1) {
          console.warn("Invalid month range:", selectedFromMonth, selectedToMonth);
          return false;
        }
        return (
          reportYear === selectedYear &&
          reportMonthIndex >= fromMonthIndex &&
          reportMonthIndex <= toMonthIndex
        );
      } else {
        const selectedMonthIndex = months.indexOf(selectedMonth);
        if (selectedMonthIndex === -1) {
          console.warn("Invalid selected month:", selectedMonth);
          return false;
        }
        return reportYear === selectedYear && reportMonthIndex === selectedMonthIndex;
      }
    });
  
    // Early return if no matching reports
    if (filteredReports.length === 0) {
      alert('No reports found for the selected date range or month.');
      return;
    }
  
    setViewPDF(!viewPDF);
    const htmlDoc = generateDoc(filteredReports, amenity);
    setHtmlContent(htmlDoc);
  };  

  const print = async () => {
    try {      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });
      const newFileName = `statistics_form.pdf`;
      const newUri = FileSystem.documentDirectory + newFileName;
      await FileSystem.moveAsync({ from: uri, to: newUri });
      await Sharing.shareAsync(newUri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const reloadWeb = () => {
    if (webViewRef.current) {
      webViewRef.current.reload(); // Call the reload method
      const htmlDoc = generateDoc(reports, amenity);
      setHtmlContent(htmlDoc);
    }
  };

  const selectFromMonth = (month) => {
    setSelectedFromMonth(month);
    setIsFromDropdownOpen(false);
    // Reset "To" selection if it conflicts
    if (selectedToMonth === month) {
      setSelectedToMonth('Select Month');
    }
  };

  const selectToMonth = (month) => {
    setSelectedToMonth(month);
    setIsToDropdownOpen(false);
    // Reset "To" selection if it conflicts
    if (selectedFromMonth === month) {
      setSelectedFromMonth('Select Month');
    }
  };

  const selectYear = (year) => {
    setSelectedYear(year);
    setIsYearOpen(false);
  };

  const selectMonth = (month) => {
    setSelectedMonth(month);
    setIsDropdownOpen(false);
  };
  
  return (
    <SafeAreaView className="w-full h-full overflow-hidden">
      <View className="w-full h-full bg-primary items-center">
        {viewPDF && 
          <View className="w-full h-[110%] bg-black/50 items-center justify-center absolute z-40 -top-[10%]">
              <View className={`overflow-hidden bg-white`} style={{ width: width * 1.1, height: height * 0.69 }}>
                  <WebView
                      ref={webViewRef}
                      originWhitelist={['*']}
                      source={{ html: htmlContent }}
                      style={{ flex: 1 }}
                      scrollEnabled={true}
                      scalesPageToFit={false}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      injectedJavaScript={`
                          document.body.style.zoom = "0.35";
                          document.body.style.position = "relative";
                          document.body.style.left = "50%";
                          document.body.style.top = "24%";
                          document.body.style.transform = "translate(-50%, -50%)";
                          document.body.style.margin = "0";
                          document.body.style.padding = "0";
                          document.body.style.overflow = "hidden";
                      `}
                      androidHardwareAccelerationDisabled={false}
                  />
              </View>
              <View className="w-[30%] h-[6%] absolute bottom-[5%] right-[2%] z-20 items-end justify-center">
                  <TouchableHighlight className="w-full h-full bg-white px-4 py-1 rounded-2xl items-center justify-center" underlayColor={'#3b8a57'} onPress={print}>
                      <Text className="text-base font-rbase text-primary">{'PRINT'}</Text>
                  </TouchableHighlight>
              </View>
              <View className="w-[30%] h-[6%] absolute bottom-[5%] right-[35%] z-20 items-end justify-center">
                  <TouchableHighlight className="w-full h-full bg-white px-4 py-1 rounded-2xl items-center justify-center" underlayColor={'#3b8a57'} onPress={reloadWeb}>
                      <Text className="text-base font-rbase text-primary">{'RELOAD'}</Text>
                  </TouchableHighlight>
              </View>
              <View className="w-[20%] h-[6%] absolute bottom-[5%] left-[2%] z-20 items-end justify-center">
                  <TouchableHighlight className="w-full h-full bg-white px-4 py-1 rounded-2xl items-center justify-center" underlayColor={'#3b8a57'} onPress={() => setViewPDF(false)}>
                      <Image 
                          tintColor={"#57b378"}
                          source={icons.close}
                          className="w-[50%] h-[50%]"
                          resizeMode='contain'
                      />
                  </TouchableHighlight>
              </View>
          </View>
        }
        {viewOptions && 
          <View className="w-full h-full bg-black/50 items-center justify-center absolute z-40">
            <View className={`w-[95%] ${isDateRange ? 'h-[27%]' : 'h-[23%]'} bg-white`}>
              {isDateRange ? (
                <>
                  {/* From Dropdown */}
                  <View className="w-full h-10 mt-2 flex-row justify-between">
                    <View className="w-[20%] h-full justify-center pl-[3%]">
                      <Text className="text-base text-black font-rbase">{'From:'}</Text>
                    </View>
                    <View className="w-[75%] h-full justify-center mr-[3%]">
                      <View className="w-full h-[80%]">
                        <TouchableOpacity 
                          className="w-full h-full bg-white border-[1px] border-primary flex-row" 
                          onPress={() => setIsFromDropdownOpen(!isFromDropdownOpen)}
                        >
                          <View className="w-[90%] h-full justify-center pl-3">
                            <Text className="font-pregular text-sm text-primary-hidden">{selectedFromMonth === 'Select Month' ? 'Month' : selectedFromMonth}</Text> 
                          </View>
                          <View className="w-[10%] h-full items-end justify-center pr-3">
                            <Image 
                              tintColor='#94A3B8'
                              source={!isFromDropdownOpen ? icons.arrowD : icons.arrowU}
                              className="w-3 h-3"
                              resizeMode='contain'
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {isFromDropdownOpen && 
                        <View className="w-full absolute top-10 z-40">
                            <FlatList
                              data={fromMonths}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({ item }) => (
                                <TouchableHighlight
                                  underlayColor={'#fef08a'}
                                  className="p-2 border-b-[1px] border-gray-400 bg-white"
                                  onPress={() => selectFromMonth(item)}
                                >
                                  <Text className="font-pregular text-sm text-primary-hidden">{item}</Text>
                                </TouchableHighlight>
                              )}
                            />
                        </View>
                      }
                    </View>
                  </View>
                  {/* To Dropdown */}
                  <View className="w-full h-10 mt-1 flex-row justify-between">
                    <View className="w-[20%] h-full justify-center pl-[3%]">
                      <Text className="text-base text-black font-rbase">{'To:'}</Text>
                    </View>
                    <View className="w-[75%] h-full justify-center mr-[3%]">
                      <View className="w-full h-[80%]">
                        <TouchableOpacity 
                          className="w-full h-full bg-white border-[1px] border-primary flex-row" 
                          onPress={() => setIsToDropdownOpen(!isToDropdownOpen)}
                        >
                          <View className="w-[90%] h-full justify-center pl-3">
                            <Text className="font-pregular text-sm text-primary-hidden">{selectedToMonth === 'Select Month' ? 'Month' : selectedToMonth}</Text> 
                          </View>
                          <View className="w-[10%] h-full items-end justify-center pr-3">
                            <Image 
                              tintColor='#94A3B8'
                              source={!isToDropdownOpen ? icons.arrowD : icons.arrowU}
                              className="w-3 h-3"
                              resizeMode='contain'
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {isToDropdownOpen && 
                        <View className="w-full absolute top-10 z-40">
                            <FlatList
                              data={toMonths}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({ item }) => (
                                <TouchableHighlight
                                  underlayColor={'#fef08a'}
                                  className="p-2 border-b-[1px] border-gray-400 bg-white"
                                  onPress={() => selectToMonth(item)}
                                >
                                  <Text className="font-pregular text-sm text-primary-hidden">{item}</Text>
                                </TouchableHighlight>
                              )}
                            />
                        </View>
                      }
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Month Dropdown */}
                  <View className="w-full h-10 mt-2 flex-row justify-between">
                    <View className="w-[20%] h-full justify-center pl-[3%]">
                      <Text className="text-base text-black font-rbase">{'Month:'}</Text>
                    </View>
                    <View className="w-[75%] h-full justify-center mr-[3%]">
                      <View className="w-full h-[80%]">
                        <TouchableOpacity 
                          className="w-full h-full bg-white border-[1px] border-primary flex-row" 
                          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <View className="w-[90%] h-full justify-center pl-3">
                            <Text className="font-pregular text-sm text-primary-hidden">{selectedMonth === 'Select Month' ? 'Month' : selectedMonth}</Text> 
                          </View>
                          <View className="w-[10%] h-full items-end justify-center pr-3">
                            <Image 
                              tintColor='#94A3B8'
                              source={!isDropdownOpen ? icons.arrowD : icons.arrowU}
                              className="w-3 h-3"
                              resizeMode='contain'
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {isDropdownOpen && 
                        <View className="w-full absolute top-10 z-40">
                            <FlatList
                              data={fromMonths}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({ item }) => (
                                <TouchableHighlight
                                  underlayColor={'#fef08a'}
                                  className="p-2 border-b-[1px] border-gray-400 bg-white"
                                  onPress={() => selectMonth(item)}
                                >
                                  <Text className="font-pregular text-sm text-primary-hidden">{item}</Text>
                                </TouchableHighlight>
                              )}
                            />
                        </View>
                      }
                    </View>
                  </View>
                </>
              )}
              {/* Other Selection */}
              <View className="w-full h-10 mt-1 flex-row justify-end">
                {/* Year Dropdown */}
                <View className="w-[30%] h-full justify-center mr-[10%]">
                  <View className="w-full h-[80%]">
                      <TouchableOpacity 
                        className="w-full h-full bg-white border-[1px] border-primary flex-row" 
                        onPress={() => setIsYearOpen(!isYearOpen)}
                      >
                        <View className="w-[90%] h-full justify-center pl-3">
                          <Text className="font-pregular text-sm text-primary-hidden">{selectedYear}</Text> 
                        </View>
                        <View className="w-[10%] h-full items-end justify-center pr-3">
                          <Image 
                            tintColor='#94A3B8'
                            source={!isYearOpen ? icons.arrowD : icons.arrowU}
                            className="w-3 h-3"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                  </View>
                  {isYearOpen && 
                    <View className="w-full absolute top-8 z-40 border-primary border-[1px]">
                        <FlatList
                          data={years}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <TouchableHighlight
                              underlayColor={'#fef08a'}
                              className="p-2 border-b-[1px] border-gray-400 bg-white"
                              onPress={() => selectYear(item)}
                            >
                              <Text className="font-pregular text-sm text-primary-hidden">{item}</Text>
                            </TouchableHighlight>
                          )}
                        />
                    </View>
                  }
                </View>
                {/* Range Option */}
                <View className="w-[35%] h-full justify-center mr-[3%]">
                  <View className="w-full h-[80%]">
                      <TouchableOpacity 
                        className={`w-full h-full ${!isDateRange ? 'bg-white border-[1px] border-primary' : 'bg-primary'} flex-row`} 
                        onPress={() => setIsDateRange(!isDateRange)}
                      >
                        <View className="w-[90%] h-full justify-center pl-3">
                          <Text className={`font-pregular text-sm ${!isDateRange ? 'text-primary-hidden' : 'text-white'}`}>{'Date Range'}</Text> 
                        </View>
                        <View className="w-[10%] h-full items-end justify-center pr-3">
                          <Image 
                            tintColor={isDateRange ? '#ffffff' : '#94A3B8'}
                            source={isDateRange ? icons.check : icons.calendar}
                            className="w-3 h-3"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                  </View>
                </View>
              </View>
              {/* Generate Statistics */}
              <View className="w-full h-10 mt-3 items-center justify-center">
                <TouchableHighlight 
                  className={`w-[60%] h-full ${isDateRange ? (selectedFromMonth && selectedToMonth === 'Select Month' ? 'bg-primary-hidden' : 'bg-primary') : (selectedMonth === 'Select Month' ? 'bg-primary-hidden' : 'bg-primary')} rounded-2xl items-center justify-center`}
                  underlayColor={'#fef08a'} 
                  onPress={handleGen} 
                  disabled={isDateRange ? (selectedFromMonth && selectedToMonth === 'Select Month') : (selectedMonth === 'Select Month')}
                >
                  <View className="w-full h-full flex-row items-center justify-center">
                    <Image 
                      tintColor={"#ffffff"}
                      source={icons.prints}
                      className="w-[30%] h-[60%]"
                      resizeMode='contain'
                    />
                    <Text className={`w-[70%] text-white font-rbase text-base`}>{'Generate Statistics'}</Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        }
        <ScrollView contentContainerStyle={{height: height * 1.02, width: width}} showsVerticalScrollIndicator={false}>
          <View className="w-full bg-white" style={{ height: height * 1.02, width: width }}>
            <View className="w-full h-10 absolute top-0 z-30 items-center justify-center">
              <Text className="font-rbold text-white text-lg">{amenity ? `${amenity.name} ${amenity.description}` : ''}</Text>
            </View>
            <View className="w-full bg-primary" style={{ height: '20%', width: width, zIndex: 10 }}/>
            {/* Service Selection Button */}
            <View className="w-full h-10 justify-center -top-[14%] items-center px-5 z-30">
              <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                  <TouchableHighlight underlayColor={"#FDFFAE"} className={`h-full rounded-3xl ${serviceMode === "reports" ? "bg-white" : "bg-primary"} items-center justify-center px-6 mr-3`} onPress={() => serviceModeChange("reports")} disabled={serviceMode === "reports"}>
                    <Text className={`${serviceMode === "reports" ? "text-primary" : "text-white"} font-psemibold text-sm`}>Total Reports</Text>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={"#FDFFAE"} className={`h-full rounded-3xl ${serviceMode === "reportType" ? "bg-white" : "bg-primary"} items-center justify-center px-6 mr-3`} onPress={() => serviceModeChange("reportType")} disabled={serviceMode === "reportType"}>
                    <Text className={`${serviceMode === "reportType" ? "text-primary" : "text-white"} font-psemibold text-sm`}>Specific Reports</Text>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={"#FDFFAE"} className={`h-full rounded-3xl ${serviceMode === "respoTime" ? "bg-white" : "bg-primary"} items-center justify-center px-6 mr-3`} onPress={() => serviceModeChange("respoTime")} disabled={serviceMode === "respoTime"}>
                    <Text className={`${serviceMode === "respoTime" ? "text-primary" : "text-white"} font-psemibold text-sm`}>Response Time</Text>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor={"#FDFFAE"} className={`h-full rounded-3xl ${serviceMode === "arriveTime" ? "bg-white" : "bg-primary"} items-center justify-center px-6`} onPress={() => serviceModeChange("arriveTime")} disabled={serviceMode === "arriveTime"}>
                    <Text className={`${serviceMode === "arriveTime" ? "text-primary" : "text-white"} font-psemibold text-sm`}>Arrival Time</Text>
                  </TouchableHighlight>
              </ScrollView>
            </View>
            {/* Print Button */}
            <View className="w-24 h-12 absolute top-[45%] right-[5%] z-40 items-center justify-center">
                <TouchableHighlight className="w-full h-full bg-white border-[1px] border-primary rounded-2xl items-center justify-center" underlayColor={'#fef08a'} onPress={() => setViewOptions(true)}>
                  <Image 
                    tintColor={"#57b378"}
                    source={icons.prints}
                    className="w-[60%] h-[60%]"
                    resizeMode='contain'
                  />
                </TouchableHighlight>
            </View>
            {serviceMode === 'reports' ? (
              <>
                <View className="w-full -top-[12%] items-center justify-center z-10">
                  {/* Reports Statistics */}
                  <View className="bg-white items-center shadow-lg shadow-black-100 pb-3">
                    <View className="py-[5%] flex-row gap-x-[95px] justify-center">
                      <Text className="font-psemibold text-primary text-base left-[90%]">Report Statistics</Text>
                      {/* Filters */}
                      {showDate ? (
                        <TouchableOpacity className="h-8 px-[18px]" onPress={() => toggleDate(!showDate)}>
                          <View className="flex-row gap-x-2">
                            <Text className="font-pregular text-sm text-primary-hidden">{"FILTERS"}</Text>
                            <Image 
                              tintColor='#94A3B8'
                              source={icons.filter}
                              className="w-5 h-5"
                              resizeMode='contain'
                            />
                          </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity className="h-8 px-2" onPress={() => toggleDate(!showDate)}>
                          <View className="flex-row gap-x-2">
                            <Text className="font-pregular text-sm text-primary-hidden">{filterWeekRange === 'last_last_week' ? "FURTHER" : translate(filterWeekRange).toUpperCase()}</Text>
                            <Image 
                              tintColor='#94A3B8'
                              source={icons.filter2}
                              className="w-5 h-5"
                              resizeMode='contain'
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                    {dataPoints.length > 0 ? (
                      <LineChart
                        data={{
                          labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Days of the Week
                          datasets: [
                            {
                              data: dataPoints, // Y-axis data: number of reports per day
                              color: (opacity = 1) => `rgba(87, 179, 120, 1)`,
                              strokeWidth: 2,
                            },
                          ],
                        }}
                        width={width - 40} // Adjust width to fit the screen
                        height={220}
                        yAxisSuffix="" // No suffix needed, but this can be modified if necessary
                        yAxisInterval={1}
                        chartConfig={{
                          backgroundColor: '#ffffff',
                          backgroundGradientFrom: '#ffffff',
                          backgroundGradientTo: '#ffffff',
                          decimalPlaces: 0, // Show whole numbers (no decimal points)
                          color: (opacity = 1) => `rgba(87, 179, 120, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                          style: { borderRadius: 10 },
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: '5',
                            strokeWidth: '2',
                            stroke: '#57b378',
                            fill: '#ffffff'
                          },
                        // Customize the y-axis scale
                        propsForBackgroundLines: {
                          strokeWidth: 1,
                          stroke: '#e3e3e3',
                        },
                        // Define y-axis minimum and maximum values
                        yAxisMin: 0,
                        yAxisMax: 25,
                      }}
                        bezier
                        style={{
                          marginVertical: 8,
                          borderRadius: 0,
                        }}
                      />
                    ) : (
                      <Text className="font-psemibold text-primary text-xl text-center">No data available for chart.</Text>
                    )}
                    {showDate && (
                      <View className="w-32 h-[146px] px-2 bg-primary/80 absolute right-8 top-12 z-10">
                        <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("this_week")}>
                          <View className="flex-row gap-x-2 py-2">
                            <Image 
                              tintColor='#ffffff'
                              source={filterWeekRange === "this_week" ? icons.verified : icons.filter}
                              className="w-5 h-5"
                              resizeMode='contain'
                            />
                            <Text className="font-pregular text-sm text-white">{"THIS WEEK"}</Text>
                          </View>
                        </TouchableHighlight>
                        <View className="w-full h-[1px] bg-white"/>
                        <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_week")}>
                          <View className="flex-row gap-x-2 py-2">
                            <Image 
                              tintColor='#ffffff'
                              source={filterWeekRange === "last_week" ? icons.verified : icons.filter}
                              className="w-5 h-5"
                              resizeMode='contain'
                            />
                            <Text className="font-pregular text-sm text-white">{"LAST WEEK"}</Text>
                          </View>
                        </TouchableHighlight>
                        <View className="w-full h-[1px] bg-white"/>
                        <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_last_week")}>
                          <View className="flex-row gap-x-2 py-2">
                            <Image 
                              tintColor='#ffffff'
                              source={filterWeekRange === "last_last_week" ? icons.verified : icons.filter}
                              className="w-5 h-5"
                              resizeMode='contain'
                            />
                            <Text className="font-pregular text-sm text-white">{"FURTHER"}</Text>
                          </View>
                        </TouchableHighlight>
                        <View className="w-full h-[1px] bg-white"/>
                        <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => toggleCalendar(true)}>
                          <View className="flex-row gap-x-2 py-2">
                            <Image 
                              tintColor='#ffffff'
                              source={icons.calendar}
                              className="w-5 h-5"
                              resizeMode='contain'
                            />
                            <Text className="font-pregular text-sm text-white">{"CALENDAR"}</Text>
                          </View>
                        </TouchableHighlight>
                      </View>
                    )}
                    {showCalendar && (
                      <DateTimePicker
                        value={selectedWeek}
                        mode="date"
                        display="calendar"
                        onChange={(event, date) => {
                          handleWeekFilterChange("calendar");
                          toggleCalendar(false);
                          if (date) {
                            const pickedDate = new Date(date);
                          
                            // Calculate the start of the week (Sunday)
                            const currentDay = pickedDate.getDay();
                            const startOfWeek = new Date(pickedDate);
                            
                            startOfWeek.setDate(pickedDate.getDate() - currentDay);
                            startOfWeek.setHours(0, 0, 0, 0);
                          
                            // Update the selected week to start from Sunday
                            setSelectedWeek(startOfWeek); // This is the Sunday of the selected week
                          }
                        }}
                      />
                    )}
                  </View>
                </View>
                <View className="w-[95%] pl-6 items-center justify-center -top-[12%]">
                  <View className="h-16">
                    {/* Total Reports */}
                    <View className="w-full flex-row">
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">Total Reports</Text>
                          <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                            {reports && (<Text className="font-pblack text-white text-6xl pt-3 text-center">{reports.length}</Text>)}
                            {amenity && (<Text className="font-pregular text-white text-xs text-center" numberOfLines={2} ellipsizeMode="tail">{amenity.name} {amenity.description}</Text>)}
                            <Text className="font-pmedium text-white text-sm text-center">All Time</Text>
                        </View>
                      </View>
                      <View className="w-[51%] items-center">
                      <Text className="font-psemibold text-primary text-lg py-[21px]"/>
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          <Text className="font-pblack text-white text-6xl pt-3 text-center">{totalReports}</Text>
                          <Text className="font-pregular text-white text-xs text-center">as of {dateNow}</Text>
                          <Text className="font-pmedium text-white text-sm text-center">{translate(filterWeekRange)}</Text>
                        </View>
                      </View>
                    </View>
                    {/* Total Per Report Types */}
                    <View className="w-full justify-center h-52">
                      {reports.length > 0 && 
                        <Text className="font-psemibold text-primary text-lg pb-3 pt-6">
                          Total Per Report Type {`(${filterWeekRange === 'last_last_week' ? "FURTHER" : translate(filterWeekRange).toUpperCase()})`}
                        </Text>
                      }
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View className="flex-row gap-x-2">
                            {Object.entries(reportTypeCounts).map(([type, count]) => (
                              <View key={type} className="w-42 h-36 justify-center">
                                <View className="flex-row gap-x-1">
                                  <View className="items-center justify-center px-4 py-6 bg-primary rounded-l-2xl">
                                    <Image 
                                      tintColor='#ffffff'
                                      source={icogenerator(type)}
                                      className="w-20 h-20"
                                      resizeMode='contain'
                                    />
                                  </View>
                                  <View className="items-center justify-center px-4 py-6 bg-primary rounded-r-2xl">
                                    <Text className="font-pblack text-white text-6xl pt-3 text-center">{count}</Text>
                                    <Text className="font-pregular text-white text-xs text-center" numberOfLines={2} ellipsizeMode="tail">{translate(type)}</Text>
                                  </View>
                                </View>
                              </View>
                            ))}
                          </View>
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </>
            ) : serviceMode === 'reportType' ? (
              <>
                <View className="w-full -top-[12%] items-center justify-center z-10">
                {/* Reports Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-100 pb-3">
                  <View className="py-[5%] flex-row gap-x-[95px] justify-center">
                    <Text className="font-psemibold text-primary text-base left-[90%]">{"Report Statistics"}</Text>
                    {/* Filters */}
                    {showDate ? (
                      <TouchableOpacity className="h-8 px-[18px]" onPress={() => toggleDate(!showDate)}>
                        <View className="flex-row gap-x-2">
                          <Text className="font-pregular text-sm text-primary-hidden">{"FILTERS"}</Text>
                          <Image 
                            tintColor='#94A3B8'
                            source={icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity className="h-8 px-2" onPress={() => toggleDate(!showDate)}>
                        <View className="flex-row gap-x-2">
                          <Text className="font-pregular text-sm text-primary-hidden">{filterWeekRange === 'last_last_week' ? "FURTHER" : translate(filterWeekRange).toUpperCase()}</Text>
                          <Image 
                            tintColor='#94A3B8'
                            source={icons.filter2}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                  {dataPoints.length > 0 ? (
                    <LineChart
                      data={{
                        labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Days of the Week
                        datasets: [
                          {
                            data: dataPoints, // Y-axis data: number of reports per day
                            color: (opacity = 1) => `rgba(87, 179, 120, 1)`,
                            strokeWidth: 2,
                          },
                        ],
                      }}
                      width={width - 40} // Adjust width to fit the screen
                      height={220}
                      yAxisSuffix="" // No suffix needed, but this can be modified if necessary
                      yAxisInterval={1}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0, // Show whole numbers (no decimal points)
                        color: (opacity = 1) => `rgba(87, 179, 120, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: { borderRadius: 10 },
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '5',
                          strokeWidth: '2',
                          stroke: '#57b378',
                          fill: '#ffffff'
                        },
                      // Customize the y-axis scale
                      propsForBackgroundLines: {
                        strokeWidth: 1,
                        stroke: '#e3e3e3',
                      },
                      // Define y-axis minimum and maximum values
                      yAxisMin: 0,
                      yAxisMax: 25,
                    }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 0,
                      }}
                    />
                  ) : (
                    <Text className="font-psemibold text-primary text-xl text-center">No data available for chart.</Text>
                  )}
                  {showDate && (
                    <View className="w-32 h-[146px] px-2 bg-primary/80 absolute right-8 top-12 z-10">
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("this_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "this_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"THIS WEEK"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "last_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"LAST WEEK"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_last_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "last_last_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"FURTHER"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("calendar")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={icons.calendar}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"CALENDAR"}</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  )}
                  {showCalendar && (
                    <DateTimePicker
                      value={selectedWeek}
                      mode="date"
                      display="calendar"
                      onChange={(event, date) => {
                        toggleCalendar(false);
                        if (date) {
                          const pickedDate = new Date(date);
                        
                          // Calculate the start of the week (Sunday)
                          const currentDay = pickedDate.getDay();
                          const startOfWeek = new Date(pickedDate);
                          
                          startOfWeek.setDate(pickedDate.getDate() - currentDay);
                          startOfWeek.setHours(0, 0, 0, 0);
                        
                          // Update the selected week to start from Sunday
                          setSelectedWeek(startOfWeek); // This is the Sunday of the selected week
                        }
                      }}
                    />
                  )}
                </View>
                  {/* Service Selection Button */}
                  <View className="w-full h-16 px-5 top-5 items-center justify-center">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="items-center justify-center flex-row gap-x-2">
                        {reportHandle.map((type) => (
                          <TouchableHighlight key={type} underlayColor={"#FDFFAE"} className={`w-36 h-9 rounded-3xl ${typeSelect === type ? "bg-primary" : "bg-white"} items-center justify-center`} onPress={() => setTypeSelect(type)} disabled={typeSelect === type}>
                            <Text className={`${typeSelect === type ? "text-white" : "text-primary"} font-psemibold text-sm`}>{translate(type)}</Text>
                          </TouchableHighlight>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  <View className="w-[95%] pl-6 top-5 items-center justify-center">
                    <View className="h-16">
                      {/* Total Report Types */}
                      <Text className="font-psemibold text-primary text-lg py-5">{`Total ${translate(typeSelect)} Reports`}</Text>
                      <View className="w-full flex-row">
                        <View className="w-[52%]">
                            <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                              {reports && (<Text className="font-pblack text-white text-6xl pt-3 text-center">{filteredReports.length}</Text>)}
                              {amenity && (<Text className="font-pregular text-white text-xs text-center" numberOfLines={2} ellipsizeMode="tail">{amenity.name} {amenity.description}</Text>)}
                              <Text className="font-pmedium text-white text-sm text-center">All Time</Text>
                          </View>
                        </View>
                        <View className="w-[51%] items-center">
                          <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                            <Text className="font-pblack text-white text-6xl pt-3 text-center">{totalReports}</Text>
                            <Text className="font-pregular text-white text-xs text-center">as of {dateNow}</Text>
                            <Text className="font-pmedium text-white text-sm text-center">{translate(filterWeekRange)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : serviceMode === 'respoTime' ? (
              <>
                <View className="w-full -top-[12%] items-center justify-center z-10">
                {/* Respond Time Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-100 pb-3">
                  <View className="py-[5%] flex-row gap-x-[95px] justify-center">
                    <Text className="font-psemibold text-primary text-base left-[90%]">{"Response Statistics"}</Text>
                    {/* Filters */}
                    {showDate ? (
                      <TouchableOpacity className="h-8 px-[18px]" onPress={() => toggleDate(!showDate)}>
                        <View className="flex-row gap-x-2">
                          <Text className="font-pregular text-sm text-primary-hidden">{"FILTERS"}</Text>
                          <Image 
                            tintColor='#94A3B8'
                            source={icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity className="h-8 px-2" onPress={() => toggleDate(!showDate)}>
                        <View className="flex-row gap-x-2">
                          <Text className="font-pregular text-sm text-primary-hidden">{filterWeekRange === 'last_last_week' ? "FURTHER" : translate(filterWeekRange).toUpperCase()}</Text>
                          <Image 
                            tintColor='#94A3B8'
                            source={icons.filter2}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                  {dataPoints.length > 0 ? (
                    <LineChart
                      data={{
                        labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Days of the Week
                        datasets: [
                          {
                            data: dataPoints, // Y-axis data: number of reports per day
                            color: (opacity = 1) => `rgba(87, 179, 120, 1)`,
                            strokeWidth: 2,
                          },
                        ],
                      }}
                      width={width - 40} // Adjust width to fit the screen
                      height={220}
                      yAxisInterval={1}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 2, // Show whole numbers (no decimal points)
                        color: (opacity = 1) => `rgba(87, 179, 120, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: { borderRadius: 10 },
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '5',
                          strokeWidth: '2',
                          stroke: '#57b378',
                          fill: '#ffffff'
                        },
                      // Customize the y-axis scale
                      propsForBackgroundLines: {
                        strokeWidth: 1,
                        stroke: '#e3e3e3',
                      },
                      // Define y-axis minimum and maximum values
                      yAxisMin: 0,
                      yAxisMax: 25,
                    }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 0,
                      }}
                    />
                  ) : (
                    <Text className="font-psemibold text-primary text-xl text-center">No data available for chart.</Text>
                  )}
                  {showDate && (
                    <View className="w-32 h-[146px] px-2 bg-primary/80 absolute right-8 top-12 z-10">
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("this_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "this_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"THIS WEEK"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "last_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"LAST WEEK"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_last_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "last_last_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"FURTHER"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("calendar")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={icons.calendar}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"CALENDAR"}</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  )}
                  {showCalendar && (
                    <DateTimePicker
                      value={selectedWeek}
                      mode="date"
                      display="calendar"
                      onChange={(event, date) => {
                        toggleCalendar(false);
                        if (date) {
                          const pickedDate = new Date(date);
                        
                          // Calculate the start of the week (Sunday)
                          const currentDay = pickedDate.getDay();
                          const startOfWeek = new Date(pickedDate);
                          
                          startOfWeek.setDate(pickedDate.getDate() - currentDay);
                          startOfWeek.setHours(0, 0, 0, 0);
                        
                          // Update the selected week to start from Sunday
                          setSelectedWeek(startOfWeek); // This is the Sunday of the selected week
                        }
                      }}
                    />
                  )}
                </View>
                {/* Average Response Time */}
                <View className="w-[95%] pl-3">
                  <View className="h-16">
                    <View className="w-full flex-row">
                      {/* Average Response Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'AVERAGE\nResponse Time'}
                        </Text>
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          {/* Average Response Time Display */}
                          {aveRespoTime !== null && (
                            <>
                              <Text className="font-pblack text-white text-5xl pt-3 text-center">
                                {aveRespoTime >= 3600
                                  ? `${(aveRespoTime / 3600).toFixed(2)}`
                                  : aveRespoTime >= 60
                                  ? `${(aveRespoTime / 60).toFixed(2)}`
                                  : `${aveRespoTime.toFixed(2)}`}
                              </Text>
                              <Text className="font-pregular text-white text-xs text-center">
                                {aveRespoTime >= 60
                                  ? `Hour(s)`
                                  : aveRespoTime >= 1
                                  ? `Minute(s)`
                                  : `Second(s)`}
                              </Text>
                            </>
                          )}
                          <Text className="font-pmedium text-white text-sm text-center">
                            {translate(filterWeekRange)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                {/* Shortest and Longest */}
                <View className="w-[95%] top-[180px] pl-5 items-center justify-center">
                  <View className="h-16">
                    <View className="w-full flex-row">
                      {/* Shortest Response Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'SHORTEST\nResponse Time'}
                        </Text>
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          {lowRespoTime !== null && (
                            <>
                              <Text className="font-pblack text-white text-5xl pt-3 text-center">
                                {lowRespoTime >= 3600
                                  ? `${(lowRespoTime / 3600).toFixed(2)}`
                                  : lowRespoTime >= 60
                                  ? `${(lowRespoTime / 60).toFixed(2)}`
                                  : `${lowRespoTime.toFixed(2)}`}
                              </Text>
                              <Text className="font-pregular text-white text-xs text-center">
                                {lowRespoTime >= 60
                                  ? `Hour(s)`
                                  : lowRespoTime >= 1
                                  ? `Minute(s)`
                                  : `Second(s)`}
                              </Text>
                            </>
                          )}
                          <Text className="font-pmedium text-white text-sm text-center">
                            {translate(filterWeekRange)}
                          </Text>
                        </View>
                      </View>
                      {/* Longest Response Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'LONGEST\nResponse Time'}
                        </Text>
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          {highRespoTime !== null && (
                            <>
                              <Text className="font-pblack text-white text-5xl pt-3 text-center">
                                {highRespoTime >= 3600
                                  ? `${(highRespoTime / 3600).toFixed(2)}`
                                  : highRespoTime >= 60
                                  ? `${(highRespoTime / 60).toFixed(2)}`
                                  : `${highRespoTime.toFixed(2)}`}
                              </Text>
                              <Text className="font-pregular text-white text-xs text-center" numberOfLines={2} ellipsizeMode="tail">
                                {highRespoTime >= 60
                                  ? `Hour(s)`
                                  : highRespoTime >= 1
                                  ? `Minute(s)`
                                  : `Second(s)`}
                              </Text>
                            </>
                          )}
                          <Text className="font-pmedium text-white text-sm text-center">
                            {translate(filterWeekRange)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              </>
            ) : serviceMode === 'arriveTime' ? (
              <>
                <View className="w-full -top-[12%] items-center justify-center z-10">
                {/* Arrival Time Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-100 pb-3">
                  <View className="py-[5%] flex-row gap-x-[95px] justify-center">
                    <Text className="font-psemibold text-primary text-base left-[90%]">{"Arrival Statistics"}</Text>
                    {/* Filters */}
                    {showDate ? (
                      <TouchableOpacity className="h-8 px-[18px]" onPress={() => toggleDate(!showDate)}>
                        <View className="flex-row gap-x-2">
                          <Text className="font-pregular text-sm text-primary-hidden">{"FILTERS"}</Text>
                          <Image 
                            tintColor='#94A3B8'
                            source={icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity className="h-8 px-2" onPress={() => toggleDate(!showDate)}>
                        <View className="flex-row gap-x-2">
                          <Text className="font-pregular text-sm text-primary-hidden">{filterWeekRange === 'last_last_week' ? "FURTHER" : translate(filterWeekRange).toUpperCase()}</Text>
                          <Image 
                            tintColor='#94A3B8'
                            source={icons.filter2}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                  {dataPoints.length > 0 ? (
                    <LineChart
                      data={{
                        labels: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // Days of the Week
                        datasets: [
                          {
                            data: dataPoints, // Y-axis data: number of reports per day
                            color: (opacity = 1) => `rgba(87, 179, 120, 1)`,
                            strokeWidth: 2,
                          },
                        ],
                      }}
                      width={width - 40} // Adjust width to fit the screen
                      height={220}
                      yAxisInterval={1}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 2, // Show whole numbers (no decimal points)
                        color: (opacity = 1) => `rgba(87, 179, 120, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: { borderRadius: 10 },
                        style: {
                          borderRadius: 16,
                        },
                        propsForDots: {
                          r: '5',
                          strokeWidth: '2',
                          stroke: '#57b378',
                          fill: '#ffffff'
                        },
                      // Customize the y-axis scale
                      propsForBackgroundLines: {
                        strokeWidth: 1,
                        stroke: '#e3e3e3',
                      },
                      // Define y-axis minimum and maximum values
                      yAxisMin: 0,
                      yAxisMax: 25,
                    }}
                      bezier
                      style={{
                        marginVertical: 8,
                        borderRadius: 0,
                      }}
                    />
                  ) : (
                    <Text className="font-psemibold text-primary text-xl text-center">No data available for chart.</Text>
                  )}
                  {showDate && (
                    <View className="w-32 h-[146px] px-2 bg-primary/80 absolute right-8 top-12 z-10">
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("this_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "this_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"THIS WEEK"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "last_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"LAST WEEK"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("last_last_week")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={filterWeekRange === "last_last_week" ? icons.verified : icons.filter}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"FURTHER"}</Text>
                        </View>
                      </TouchableHighlight>
                      <View className="w-full h-[1px] bg-white"/>
                      <TouchableHighlight underlayColor={"#d9ffe6"} onPress={() => handleWeekFilterChange("calendar")}>
                        <View className="flex-row gap-x-2 py-2">
                          <Image 
                            tintColor='#ffffff'
                            source={icons.calendar}
                            className="w-5 h-5"
                            resizeMode='contain'
                          />
                          <Text className="font-pregular text-sm text-white">{"CALENDAR"}</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  )}
                  {showCalendar && (
                    <DateTimePicker
                      value={selectedWeek}
                      mode="date"
                      display="calendar"
                      onChange={(event, date) => {
                        toggleCalendar(false);
                        if (date) {
                          const pickedDate = new Date(date);
                        
                          // Calculate the start of the week (Sunday)
                          const currentDay = pickedDate.getDay();
                          const startOfWeek = new Date(pickedDate);
                          
                          startOfWeek.setDate(pickedDate.getDate() - currentDay);
                          startOfWeek.setHours(0, 0, 0, 0);
                        
                          // Update the selected week to start from Sunday
                          setSelectedWeek(startOfWeek); // This is the Sunday of the selected week
                        }
                      }}
                    />
                  )}
                </View>
                {/* Average Arrival Time */}
                <View className="w-[95%] pl-3">
                  <View className="h-16">
                    <View className="w-full flex-row">
                      {/* Average Arrival Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'AVERAGE\nArrival Time'}
                        </Text>
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          {/* Average Arrival Time Display */}
                          {aveArriveTime !== null && (
                            <>
                              <Text className="font-pblack text-white text-5xl pt-3 text-center">
                                {aveArriveTime >= 3600
                                  ? `${(aveArriveTime / 3600).toFixed(2)}`
                                  : aveArriveTime >= 60
                                  ? `${(aveArriveTime / 60).toFixed(2)}`
                                  : `${aveArriveTime.toFixed(2)}`}
                              </Text>
                              <Text className="font-pregular text-white text-xs text-center">
                                {aveArriveTime >= 60
                                  ? `Hour(s)`
                                  : aveArriveTime >= 1
                                  ? `Minute(s)`
                                  : `Second(s)`}
                              </Text>
                            </>
                          )}
                          <Text className="font-pmedium text-white text-sm text-center">
                            {translate(filterWeekRange)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                {/* Shortest and Longest */}
                <View className="w-[95%] top-[180px] pl-5 items-center justify-center">
                  <View className="h-16">
                    <View className="w-full flex-row">
                      {/* Shortest Arrival Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'SHORTEST\nArrival Time'}
                        </Text>
                        <TouchableOpacity className="w-full" onPress={() => console.log(lowArriveID)}>
                          <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                            {lowArriveTime !== null && (
                              <>
                                <View className="z-10 absolute -top-3 right-0 px-2 border-[1px] bg-primary border-white rounded-2xl">
                                  <Text className="text-base font-pregular text-white">
                                      {`${lowArriveDistance} km`}
                                  </Text>
                                </View>
                                <Text className="font-pblack text-white text-5xl pt-3 text-center">
                                  {lowArriveTime >= 3600
                                    ? `${(lowArriveTime / 3600).toFixed(2)}`
                                    : lowArriveTime >= 60
                                    ? `${(lowArriveTime / 60).toFixed(2)}`
                                    : `${lowArriveTime.toFixed(2)}`}
                                </Text>
                                <Text className="font-pregular text-white text-xs text-center">
                                  {lowArriveTime >= 60
                                    ? `Hour(s)`
                                    : lowArriveTime >= 1
                                    ? `Minute(s)`
                                    : `Second(s)`}
                                </Text>
                              </>
                            )}
                            <Text className="font-pmedium text-white text-sm text-center">
                              {translate(filterWeekRange)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      {/* Longest Arrival Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'LONGEST\nArrival Time'}
                        </Text>
                        <TouchableOpacity className="w-full" onPress={() => console.log(highArriveID)}>
                          <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                            {highArriveTime !== null && (
                              <>
                                <View className="z-10 absolute -top-3 right-0 px-2 border-[1px] bg-primary border-white rounded-2xl">
                                  <Text className="text-base font-pregular text-white">
                                      {`${highArriveDistance} km`}
                                  </Text>
                                </View>
                                <Text className="font-pblack text-white text-5xl pt-3 text-center">
                                  {highArriveTime >= 3600
                                    ? `${(highArriveTime / 3600).toFixed(2)}`
                                    : highArriveTime >= 60
                                    ? `${(highArriveTime / 60).toFixed(2)}`
                                    : `${highArriveTime.toFixed(2)}`}
                                </Text>
                                <Text className="font-pregular text-white text-xs text-center" numberOfLines={2} ellipsizeMode="tail">
                                  {highArriveTime >= 60
                                    ? `Hour(s)`
                                    : highArriveTime >= 1
                                    ? `Minute(s)`
                                    : `Second(s)`}
                                </Text>
                              </>
                            )}
                            <Text className="font-pmedium text-white text-sm text-center">
                              {translate(filterWeekRange)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              </>
            ) : (
              <>
                <Text className="font-psemibold text-primary text-6xl py-5 text-center">{"HOW'D YOU GET HERE?"}</Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
      {/* Status Bar */}
      <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  );
};

export default StatisticsScreen;
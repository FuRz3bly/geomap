import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, TouchableHighlight, Alert, ActivityIndicator, BackHandler, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

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
  const [highArriveID, setHighArriveID] = useState('') // Highest Arrival Time Report ID
  const [lowArriveTime, setLowArriveTime] = useState(0); // Lowest Arrival Time
  const [lowArriveID, setLowArriveID] = useState('') // Lowest Arrival Time Report ID
  const [aveArriveTime, setAveArriveTime] = useState(0); // Average Arrival Time

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
      setHighRespoTime(highestResponseTimes);
      setHighRespoID(highestResponseTimeId);
      setLowRespoTime(lowestResponseTimes);
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
    
        // Ensure both dates are available and valid
        if (receivedTime && arrivalTime && receivedTime >= startOfWeek && arrivalTime <= endOfWeek) {
          // Calculate the arrival time (in minutes)
          const arriveTimeInMinutes = (arrivalTime - receivedTime) / (1000 * 60); // Convert ms to minutes
    
          // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
          const receivedDay = arrivalTime.getDay(); // Use responder.arrival_time to determine the day
    
          // Sum up the arrival times and count reports for each day
          dayArriveSums[receivedDay] += arriveTimeInMinutes;
          totalArriveSum += arriveTimeInMinutes;
          dayReportCounts[receivedDay] += 1;
          totalReportsCount += 1; // Track total reports for all days

          // Check if this report has the highest arrival time
          if (arriveTimeInMinutes > highestArriveTime) {
            highestArriveTime = arriveTimeInMinutes;
            highestArriveTimeId = report.report_id;
          }

          // Check if this report has the lowest arrival time (and avoid 0 arrival time)
          if (arriveTimeInMinutes > 0 && arriveTimeInMinutes < lowestArriveTime) {
            lowestArriveTime = arriveTimeInMinutes;
            lowestArriveTimeId = report.report_id;
          }
        }
      });
    
      // Calculate the average arrive time for each day (Sunday to Saturday)
      const averageArriveTimes = dayArriveSums.map((sum, index) =>
        dayReportCounts[index] > 0 ? sum / dayReportCounts[index] : 0
      );

      const averageArriveTime = totalReportsCount > 0 ? totalArriveSum / totalReportsCount : 0;
    
      // Find the highest and lowest arrival times
      const filteredTimes = averageArriveTimes.filter(time => time > 0);
      const highestArriveTimes = filteredTimes.length > 0 ? Math.max(...filteredTimes) : 0;
      const lowestArriveTimes = filteredTimes.length > 0 ? Math.min(...filteredTimes) : 0;
    
      // Update the dataPoints state with average arrival times for each day
      setDataPoints(averageArriveTimes); // Each index represents Sunday to Saturday
      setTotalReports(totalReportsCount); // Update Total Reports
    
      // Set state for highest and lowest arrive times
      setHighArriveTime(highestArriveTimes);
      setHighArriveID(highestArriveTimeId);
      setLowArriveTime(lowestArriveTimes);
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
    
  return (
    <SafeAreaView className="w-full h-full top-[1%] overflow-hidden">
      <View className="w-full h-full bg-primary items-center">
        <ScrollView contentContainerStyle={{height: height, width: width}} showsVerticalScrollIndicator={false}>
          <View className="w-full bg-white" style={{ height: height, width: width }}>
            <View className="w-full bg-primary" style={{ height: '20%', width: width, zIndex: 10 }}/>
            {/* Service Selection Button */}
            <View className="w-full h-10 justify-center -top-[20%] items-center px-5 z-30">
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
            {serviceMode === 'reports' ? (
              <>
                <View className="w-full -top-[18%] items-center justify-center z-10">
                {/* Reports Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-200">
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
                        toggleCalendar(true);
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
                <View className="w-[95%] pl-6 items-center justify-center -top-[18%]">
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
                      <Text className="font-psemibold text-primary text-lg pb-3 pt-6">Total Per Report Type {`(${filterWeekRange === 'last_last_week' ? "FURTHER" : translate(filterWeekRange).toUpperCase()})`}</Text>
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
                <View className="w-full -top-[18%] items-center justify-center z-10">
                {/* Reports Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-200">
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
                <View className="w-full -top-[18%] items-center justify-center z-10">
                {/* Respond Time Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-200">
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
                      yAxisSuffix="M" // No suffix needed, but this can be modified if necessary
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
                <View className="w-full -top-[18%] items-center justify-center z-10">
                {/* Arrival Time Statistics */}
                <View className="bg-white items-center shadow-lg shadow-black-200">
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
                      yAxisSuffix="M" // No suffix needed, but this can be modified if necessary
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
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          {lowArriveTime !== null && (
                            <>
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
                      </View>
                      {/* Longest Arrival Time */}
                      <View className="w-[52%]">
                        <Text className="font-psemibold text-primary text-lg py-5">
                          {'LONGEST\nArrival Time'}
                        </Text>
                        <View className="w-[90%] h-[145px] bg-primary px-4 justify-center">
                          {highArriveTime !== null && (
                            <>
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
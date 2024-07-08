import React, { useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { getReports } from '../../../../constants/reports/static';
import { useUser } from '../../../../constants/users/UserContext';
// PAGE COMPONENTS
import MapCommunity from '../../../../components/map/view/map-c'; // Map Page
import MenuBar from '../../../../components/header/menu-bar'; // Header Bar
import Profile from '../details/profile'; // Profile Page
import Help from '../details/help'; // Help Page
import AboutUs from '../details/about-us'; // About Us Page
import Settings from '../settings/settings'; // Settings Page
import MapToolBar from '../../../../components/footer/map-toolbar'; // Map Toolbar - Expand Toolbar Arrow
import PrelimReport from '../report/prelim-report';
import Report from '../report/report-details';
// MODAL COMPONENTS
import { 
  ReportSuccess, 
  ReportFailed, 
  ReportRespond, 
  ReportReceived, 
  ResponderArrival 
} from '../../../../components/modals/reports';

export default function MapC() {
  // Import currentUser Details
  const { currentUser } = useUser();
  // Import reportform from router
  const { reportform } = useLocalSearchParams();
  // Import reports/static.js reports
  const reports = getReports();
  // Transfer reportform to reportData
  const reportData = reportform ? JSON.parse(reportform) : null;

  // For Changing Screens
  const [screenSelected, setScreenSelected] = useState('Map'); //Selected Screen Container 
  const handleScreenSelect = (screen) => {setScreenSelected(screen);} // Handler of Screen Selector
  // Map Components
  const [showTraffic, setShowTraffic] = useState(false); // Traffic Logic
  const handleTraffic = (bool) => {setShowTraffic(bool)}; // Boolean Traffic - If true from Map Tools, send True
  const [displayMarker, setDisplayMarker] = useState(false); // Markers Logic
  const handleMarkers = (bool) => {setDisplayMarker(bool)}; // Boolean Marker - If true from Map Tools, send True
  const [displayFilter, setDisplayFilter] = useState(false); // Markers Logic
  const handleFilters = (bool) => {setDisplayFilter(bool)}; // Boolean Marker - If true from Map Tools, send True
  const [selectedTheme, setSelectedTheme] = useState('default_theme'); // Selected Theme - Default Theme
  const handleThemeSelect = (theme) => {setSelectedTheme(theme)} // Change Theme when chosen from Map Themes Modal
  const [focus, setFocus] = useState(false); // Focus Boolean Container
  const handleFocus = (bool) => {setFocus(bool)} // Trigger When Button is Pressed
  const resetFocus = () => {setFocus(false)} // Trigger After Button is Pressed
  const [amenity, setAmenity] = useState(null) // Selected Amenity Chackpoint Container
  const handleSelectedAmenity = (amenity) => {setAmenity(amenity)} // Selected Amenity Container Logic
  const [toggleAmenity, setToggleAmenity] = useState(false) // Toggle Amenity Checkpoint Container
  const handleToggleAmenity = (bool) => {
    setShowToolBar(true)
    setToggleAmenity(bool)
  } // Toggle Amenity Container Logic
  const resetToggleAmenity = () => {setToggleAmenity(false)} // Reset Toggle After Button Press
  const [location, setLocation] = useState(null) // Location Container
  const handleLocation = (location) => {setLocation(location);}
  const [showNearest, setNearest] = useState(false); // Selected Amenity Chackpoint Container
  const toggleNearestAmenity = (bool) => {
    setShowToolBar(true)
    setNearest(bool)
  }; // Selected Amenity Container Logic
  const resetToggleNearest = () => {setNearest(false)}; // Reset Toggle Nearest Amenity After Button Press
  const [newReport, setNewReport] = useState(null);
  const handleSelectedReport = (report) => {setNewReport(report);};
  const [toggleShowReport, showToggleReport] = useState(false);
  const handleToggleReport = (bool) => {
      setShowToolBar(true);
      showToggleReport(bool);
      resetToggleAmenity()
  };
  const toggleReportTool = () => {showToggleReport(!toggleShowReport)}; // Report Tool Expand Logic
  const [showToolBar, setShowToolBar] = useState(false); // Toolbar Components Container
  const toggleToolBar = () => {setShowToolBar(!showToolBar)}; // Toolbar Expand Logic
  const enableToolBar = () => {setShowToolBar(true)}; // Toolbar Prevent Double Clicking
  // Showing when a Report is Successfully integrated
  const [modalShown, setModalShown] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const toggleReportSuccess = () => {setShowSuccess(false)};

  // TEMPORARY DISPLAY OTHER MODALS
  const [showReportFail, setReportFail] = useState(false);
  const toggleReportFail = () => {setReportFail(!showReportFail)};
  const [showReportReceived, setReportReceived] = useState(false);
  const toggleReportReceived = () => {setReportReceived(!showReportReceived)};
  const [showReportRespond, setReportRespond] = useState(false);
  const toggleReportRespond = () => {setReportRespond(!showReportRespond)};
  const [showResponderArrive, setResponderArrive] = useState(false);
  const toggleResponderArrive = () => {setResponderArrive(!showResponderArrive)};

  useEffect(() => {
    if (reportData && !modalShown) {
      setShowReportSuccess(true);
      setModalShown(true);
    }
  }, [reportData]);

  return (
    // Full Map Page View
    <SafeAreaView className="w-full h-full items-center">
      <View className="absolute">
        <ReportSuccess visible={showReportSuccess} onClose={toggleReportSuccess}/>
        <ReportFailed visible={showReportFail} onClose={toggleReportFail}/>
        <ReportReceived visible={showReportReceived} onClose={toggleReportReceived}/>
        <ReportRespond visible={showReportRespond} onClose={toggleReportRespond}/>
        <ResponderArrival visible={showResponderArrive} onClose={toggleResponderArrive}/>
      </View>
      <MenuBar screenSelect={handleScreenSelect} newScreen={screenSelected}/>
      {screenSelected && (
        <>
          <View className="absolute inset-0 bottom-0 w-full" style={screenSelected !== 'Map' ? styles.hidden : styles.visible}>
            <MapToolBar
              toggleToolBar={toggleToolBar}
              showToolBar={showToolBar}
              enableToolbar={enableToolBar}
              screenSelect={handleScreenSelect}
              showsTraffic={handleTraffic}
              showMarkers={handleMarkers}
              showsFilters={handleFilters}
              selectedTheme={handleThemeSelect}
              focus={handleFocus}
              userLocation={location}
              selectedAmenity={amenity}
              toggleAmenity={toggleAmenity}
              resetToggleAmenity={resetToggleAmenity}
              nearbyAmenity={toggleNearestAmenity}
              selectReport={newReport} // Pass The Selected Report
              showReport={toggleShowReport} // Pass the Toggle Report
              toggleReportTool={toggleReportTool}
              userDetails={currentUser}
            />
          </View>
          {screenSelected === 'Account' && <Profile/>}
          {screenSelected === 'Report' && <PrelimReport/>}
          {screenSelected === 'Help' && <Help/>}
          {screenSelected === 'About Us' && <AboutUs/>}
          {screenSelected === 'Settings' && <Settings/>}
          {screenSelected === 'Map' &&
          <>
            <View className="absolute top-[16%] left-[2%] w-[35%] h-[26%] z-20 justify-center items-center flex-col gap-y-3">
              <TouchableOpacity onPress={toggleReportFail} className="bg-emerald-400/70 w-full h-14 items-center justify-center">
                <Text className="font-pregular text-sm text-white/70">Report Failed</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleReportReceived} className="bg-emerald-400/70 w-full h-14 items-center justify-center">
                <Text className="font-pregular text-sm text-white/70">Report Received</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleReportRespond} className="bg-emerald-400/70 w-full h-14 items-center justify-center">
                <Text className="font-pregular text-sm text-white/70">Report Respond</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleResponderArrive} className="bg-emerald-400/70 w-full h-14 items-center justify-center">
                <Text className="font-pregular text-sm text-white/70">Responder Arrive</Text>
              </TouchableOpacity>
            </View>
            <MapCommunity
              showTraffic={showTraffic} 
              toggleMarkers={displayMarker}
              selectedTheme={selectedTheme} 
              focus={focus} 
              resetFocus={resetFocus}
              userLocation={handleLocation}
              selectedAmenity={handleSelectedAmenity} 
              toggleAmenity={handleToggleAmenity}
              toggleNearest={showNearest}
              resetToggleNearest={resetToggleNearest}
              report={reportData}
              selectedReport={handleSelectedReport}
              toggleReport={handleToggleReport}
            />
          </>
          }
        </>
      )}
      <StatusBar backgroundColor='#57b378' style={'light'}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hidden: {
    display: 'none',
  },
  visible: {
    flex: 1,
  },
});
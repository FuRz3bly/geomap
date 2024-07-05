import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, Alert, ScrollView, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { getDistance } from 'geolib';
import fetchNearbyAmenities from '../../../../components/fetchplaces';
import Modal from 'react-native-modal';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '../../../../constants/users/UserContext'

import { icons } from '../../../../constants'
import amenities_static from '../../../../constants/amenities/static'

// Map Themes and Styles
import defaultMode from '../../../../constants/map_styles/default_mode'
import nightMode from '../../../../constants/map_styles/night_mode'
import retroMode from '../../../../constants/map_styles/retro_mode'
import waspMode from '../../../../constants/map_styles/wasp_mode'
import elevationMode from '../../../../constants/map_styles/elevation_mode'

// Import Modals
import MenuC from '../../../../components/modals/menu/menu-c'
import Report from '../../../../components/modals/report'
import Amenity from '../../../../components/modals/amenity'
import ReportSucess from '../../../../components/modals/reports/report_success'

export default function MapC() {
  // User Details
  const { currentUser } = useUser();
  // Location of the User
  const [location, setLocation] = useState(null);
  // Error Message When Failed
  const [errorMsg, setErrorMsg] = useState(null);
  // Container of Amenity
  const [amenities, setAmenities] = useState([]);
  //  Container of Selected Amenity
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  // Nearest Amenity Container
  const [nearestAmenity, setNearestAmenity] = useState(null);
  // Filtered Dictionary
  const filteredWords = [
    'Barangay Hall', 
    'Municipal Hall', 
    'Townhall', 
    'Government Office', 
    'Police Station', 
    'Fire Station', 
    'Fire Department'
  ];
  // Initial Region when Map is Opened
  const [region, setRegion] = useState({
    latitude: 14.32212,
    longitude: 120.77134,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // Toggle Traffic Logic - Bottom Right Button with Two Cars (Traffic)
  const [showTraffic, setShowTraffic] = useState(false);
  const toggleTraffic = () => {setShowTraffic(!showTraffic)}
  // For Map Filter Logic - Bottom Left Button with Map and Pencil (Map Edit)
  const [showMapStyles, setShowMapStyles] = useState(false);
  const toggleMapStyles = () => {setShowMapStyles(!showMapStyles)}
  // Style Container
  const [theme, setTheme] = useState('default')
  // Confirmed Container
  const [selectedTheme, setSelectedTheme] = useState(null)
  // Choosing a Map Theme Logic
  const handleThemeSelect = (theme) => {setTheme(theme);}
  const handleThemeConfirm = (theme) => {
    setSelectedTheme(theme)
    toggleMapStyles();
  }
  // Showing when a Report is Successfully integrated
  const [successShown, setSuccessShown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const toggleReportSuccess = () => {
    setShowSuccess(false)
  }
  // Showing Report Button at the Bottom View - View Full Report ...
  const [showReport, setShowReport] = useState(false);
  const toggleReport = () => {
    setSelectedAmenity(null)
    setShowReport(true)
    setShowAmenity(false)
  }
  const [showAmenity, setShowAmenity] = useState(false);
  const toggleAmenity = (amenity) => {
    const distance = getDistance(
      { latitude: location.latitude, longitude: location.longitude }, 
      { latitude: amenity.lat, longitude: amenity.lon }
      ) / 1000; // Convert to kilometers
      setSelectedAmenity({ ...amenity, distance: distance.toFixed(2) });
    setShowReport(false)
    setShowAmenity(true)
  }
  // Toggling Report Modal - Full Report Details
  const [expandReport, setExpandReport] = useState(false);
  const toggleExpandReport = () => {setExpandReport(!expandReport)}
  // Toggling View Amenity Details
  const [expandAmenity, setExpandAmenity] = useState(false);
  const toggleExpandAmenity = () => {setExpandAmenity(!expandAmenity)}
  // Hide All Bottom Button
  const hideExpand = () => {
    setShowReport(false)
    setShowAmenity(false)
    setSelectedAmenity(null)
  };
  const navigateAmenity = () => {
    if (selectedAmenity && location) {
      const originName = encodeURIComponent('Your Location');
      const destinationName = encodeURIComponent(`${selectedAmenity.name} (${selectedAmenity.type})`);
      const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&origin_name=${originName}&destination=${destinationName}&destination_place_id=${selectedAmenity.name}`;
      // Open Google Maps with directions
      Linking.openURL(url).then(() => {
      // Guide the user to follow directions in Google Maps
      // After the user manually closes Google Maps, they will return to your app
      }).catch((err) => {
        console.error('Failed to open Google Maps:', err);
      });
    }
  };
  // Map Reference
  const mapRef = useRef(null);
  // Import reportform from router
  const { reportform } = useLocalSearchParams();
  // Transfer reportform to reportData
  const reportData = reportform ? JSON.parse(reportform) : null;
  // Amenity Types and Descriptions
  const types = [
    { query: 'fire_station', description: 'Fire Station' },
    { query: 'police', description: 'Police Station' },
    { query: 'government', description: 'Government Office' },
    { query: 'townhall', description: 'Municipal / City Hall' },
    { query: 'barangay_hall', description: 'Barangay Hall' }
  ];
  // All Emergency Types Translations to Descriptions
  const emergency_types = [
    // Fire Emergency Types
    {type: 'structural_fire', description: 'Structural Fire'},
    {type: 'vehicular_fire', description: 'Vehicular Fire'},
    {type: 'fire_rescue', description: 'Rescue'},
    {type: 'explosion', description: 'Explosion Incident'},
    {type: 'wildfire', description: 'Wildfire'},
    // Police Emergency Types
    {type: 'personal_safety', description: 'Personal Safety'},
    {type: 'traffic_accident', description: 'Traffic Accident'},
    {type: 'public_disturbance', description: 'Public Disturbance'},
    {type: 'theft', description: 'Theft & Burglary'},
    {type: 'assault', description: 'Assault & Battery'},
    {type: 'domestic_violence', description: 'Domestic Violence'},
    {type: 'active_shooting', description: 'Active Shooting'},
    // NDRRMO Emergency Types
    {type: 'search_and_rescue', description: 'Search & Rescue'},
    {type: 'industrial_accidents', description: 'Industrial Accident'},
    {type: 'disaster_accident', description: 'Disaster Accident'}
  ];
  // All Status Types Translations to Descriptions
  const status_types = [
    {status: 'preliminary', description: 'Filing the Report'},
    {status: 'waiting', description: 'Waiting for Response'},
    {status: 'receive', description: 'Help is on the Way'},
    {status: 'arrive', description: 'Responder Arrived'},
  ]
  // Emergency Type Translator
  const getEmergencyDescription = (type) => {
    const emergencyType = emergency_types.find((et) => et.type === type);
    return emergencyType ? emergencyType.description : '';
  };
  // Status Type Translator
  const getStatusDescription = (status) => {
    const statusType = status_types.find((st) => st.status === status);
    return statusType ? statusType.description : '';
  };
  // Marker Color Switcher
  const getMarkerColor = (type, isNearest = false) => {
    if (isNearest) {
      return 'yellow'
    }
    switch (type) {
      case 'Fire Station':
        return 'tomato';
      case 'Police Station':
        return 'blue';
      case 'Government Office':
        return 'green';
      case 'Townhall':
        return 'linen';
      case 'Municipal Hall':
        return 'tan';
      case 'Barangay Hall':
        return 'wheat';
      default:
        return 'red';
    }
  };
  // Get Amenity Type Color in Callout - Colored Square - Type: Barangay Hall
  const getAType = (type) => {
    switch (type) {
      case 'Fire Station':
        return 'bg-orange-300';
      case 'Police Station':
        return 'bg-blue-400';
      case 'Government Office':
        return 'bg-green-400';
      case 'Townhall':
        return 'bg-yellow-200';
      case 'Municipal Hall':
        return 'bg-amber-200';
      case 'Barangay Hall':
        return 'bg-amber-300';
      default:
        return 'bg-primary-50';
    }
  }
  // Change Marker Color Depending on the Handler
  const getMarkerTint = (handler) => {
    switch (handler) {
      case 'fire_station':
        return 'tomato';
      case 'police':
        return 'blue';
      case 'government':
        return 'green';
      default:
        return 'red';
    }
  };
  // Change Handler Type Color in Callout - Colored Square - Type: Structural Fire
  const typeColor = (handler) => {
    switch(handler) {
      case 'fire_station':
        return 'bg-orange-500';
      case 'police':
        return 'bg-blue-400';
      case 'government':
        return 'bg-green-600';
      default:
        return 'primary';
    };
  };
  const mapTheme = (theme) => {
    switch (theme) {
      case 'default':
        return defaultMode;
      case 'night':
        return nightMode;
      case 'retro':
        return retroMode;
      case 'wasp':
        return waspMode;
      case 'elevation':
        return elevationMode;
      case 'eim':
        return defaultMode;
      default:
        return null;
    }
  }

  {/*const getMarkerIcon = (type) => {
    switch (type) {
      case 'Fire Station':
        return icons.fireStation;
      case 'Police Station':
        return icons.policeStation;
      case 'Government Office':
        return icons.government;
      case 'Townhall':
        return icons.townHall;
      case 'Municipal Hall':
        return icons.municipalHall;
      case 'Barangay Hall':
        return icons.government;
      default:
        return null;
    }
  };
*/}
  // Menu Components - Set the Visibility to False
  const [isMenuVisible, setMenuVisible] = useState(false)
  // Menu Button Toggler
  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible)
  }
  // Report Button Handler
  const handleReport = () => {
    router.push("home/report/prelim-report"
    )}
  // Location Permission Checker
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.log(errorMsg)
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);
  useEffect(() => {
    if (reportData && !successShown) {
      setShowSuccess(true);
      setSuccessShown(true);
    }
  }, [reportData]);
  // Fetching All Nearby Amenities From the Location to Certain Distance
  useEffect(() => {
    if (location) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      }));

      const fetchData = async () => {
        let fetchedAmenities = [];
        for (const type of types) {
          const results = await fetchNearbyAmenities(location.latitude, location.longitude, type);
          results.forEach((amenity) => {
            amenity.name = cleanName(amenity.name);
          });
          fetchedAmenities = [...fetchedAmenities, ...results];
        }
        setAmenities(fetchedAmenities);

        // Calculate nearest amenity
        if (fetchedAmenities.length > 0) {
          const nearest = fetchedAmenities.reduce((prev, curr) => {
            const prevDistance = getDistance(
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: prev.lat, longitude: prev.lon }
            );
            const currDistance = getDistance(
              { latitude: location.latitude, longitude: location.longitude },
              { latitude: curr.lat, longitude: curr.lon }
            );
            return prevDistance < currDistance ? prev : curr;
          });
          setNearestAmenity(nearest);
        }
      };
      fetchData();
    }
  }, [location]);
  // Distance Range Calculator
  const getRangeDistance = (loc1, loc2) => {
    const toRad = (value) => value * Math.PI / 180;
    const lat1 = loc1.latitude;
    const lon1 = loc1.longitude;
    const lat2 = loc2.lat;
    const lon2 = loc2.lon;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };
  // Nearest Amenity
  const showNearestAmenity = () => {
    if (nearestAmenity) {
      mapRef.current.animateToRegion({
        latitude: nearestAmenity.lat,
        longitude: nearestAmenity.lon,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000); // 1000ms duration for the animation
      toggleAmenity(nearestAmenity);
    } else {
      Alert.alert('No amenities found');
    }
  };
  // Removed Filtered Words from Dictionary
  const cleanName = (name) => {
    let cleanedName = name;
    filteredWords.forEach((word) => {
      cleanedName = cleanedName.replace(new RegExp(word, 'gi'), '').trim();
    });
    return cleanedName;
  };
  // Refocus Region to User
  const refocus = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary items-center pt-20">
      <View className="absolute">
        <MenuC visible={isMenuVisible} onClose={toggleMenu}></MenuC>
        <Report visible={expandReport} onClose={toggleExpandReport} reportForm={reportData} userDetails={currentUser}></Report>
        <Amenity visible={expandAmenity} onClose={toggleExpandAmenity} selectData={selectedAmenity} navigate={navigateAmenity}></Amenity>
        <ReportSucess visible={showSuccess} onClose={toggleReportSuccess}></ReportSucess>
        {/* Theme Selection */}
        <Modal
          isVisible={showMapStyles}
          onBackdropPress={toggleMapStyles}
          backdropColor='black'
          backdropOpacity={0.4}
          hideModalContentWhileAnimating={true}
          backdropTransitionInTiming={0}
          backdropTransitionOutTiming={0}
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          animationInTiming={400}
          animationOutTiming={500}
        >
          <SafeAreaView className="absolute -right-5 bottom-[2.5%] w-[112%] h-full">
            <View className="w-full h-[30%] bg-primary pb-14">
              <View className="flex-row items-center pt-4">
                <Text className="font-psemibold text-xl text-white pl-3 py-2">Map Themes</Text>
                <View className="absolute right-4 top-6">
                  <Image
                    tintColor={"#ffffff"}
                    source={icons.mapStyle}
                    className="w-7 h-7"
                    resizeMode='contain'
                  />
                </View>
              </View>
              <View className="border-b-0.5 border-white" />
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View className="justify-center pt-4 flex-row gap-3 px-2">
                  {/* Default Theme Button */}
                  <TouchableOpacity onPress={() => handleThemeSelect('default')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "default" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "default" ? null : "#ffffff"}
                          source={icons.mapDefault}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "default" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Default</Text>
                      </View>
                  </TouchableOpacity>
                {/* Night Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('night')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "night" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "night" ? null : "#ffffff"}
                          source={icons.mapNight}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "night" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Night</Text>
                      </View>
                  </TouchableOpacity>
                {/* Retro Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('retro')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "retro" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "retro" ? null : "#ffffff"}
                          source={icons.mapVintage}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "retro" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Vintage</Text>
                      </View>
                  </TouchableOpacity>
                {/* Black and Yellow Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('wasp')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "wasp" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "wasp" ? null : "#ffffff"}
                          source={icons.mapWasp}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "wasp" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Wasp</Text>
                      </View>
                  </TouchableOpacity>
                {/* Elevation Theme Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('elevation')}>
                    <View className="w-20 items-center">
                      <View className={`w-16 h-16 rounded-full ${theme === "elevation" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                          <Image
                          tintColor={theme === "elevation" ? null : "#ffffff"}
                          source={icons.mapElevation}
                          className="w-8 h-8"
                          resizeMode='contain'
                          />
                      </View>
                      <Text className={`${theme === "elevation" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3`}>Elevation</Text>
                      </View>
                  </TouchableOpacity>
                {/* Emergency Intensity Map Button */}
                <TouchableOpacity onPress={() => handleThemeSelect('eim')}>
                  <View className="w-26 items-center">
                    <View className={`w-16 h-16 rounded-full ${theme === "eim" ? "bg-white/90 border-primary" : "bg-primary border-white"} justify-center items-center border-0.5`}>
                        <Image
                        tintColor={theme === "eim" ? null : "#ffffff"}
                        source={icons.mapEIM}
                        className="w-8 h-8"
                        resizeMode='contain'
                        />
                    </View>
                    <Text className={`${theme === "eim" ? "font-psemibold" : "font-pregular"} text-sm text-white pt-3 text-center`}>Intensity Map</Text>
                    </View>
                </TouchableOpacity>
                </View>
              </ScrollView>
              <View className="border-t-0.5 border-white" />
              <View className="absolute right-4 bottom-2 items-center justify-center">
                <TouchableOpacity onPress={() => handleThemeConfirm(theme)}>
                  <View className="bg-white px-8 py-2 rounded-full">
                    <Text className="font-pmedium text-primary text-sm">Apply</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          customMapStyle={mapTheme(selectedTheme)}
          initialRegion={{
            latitude: location ? location.latitude : 14.199630,
            longitude: location ? location.longitude : 120.880762,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          showsUserLocation={true}
          showsCompass={false}
          showsMyLocationButton={false}
          showsBuildings={true}
          showsTraffic={showTraffic}
          zoomControlEnabled={false}
          toolbarEnabled={false}
          onPress={hideExpand}
        >
          {reportData && reportData.latitude && reportData.longitude && (
          <Marker
            coordinate={{
              latitude: reportData.latitude,
              longitude: reportData.longitude,
            }}
            pinColor={getMarkerTint(reportData.handler)}
            onPress={toggleReport}
          >
          <Callout>
            <View className="w-50 h-30 justify-center">
              {/* Title */}
              <Text className="font-pbold text-sm text-primary py-2 text-center">Reported Emergency</Text>
              {/* Line Separator */}
              <View className="border-b-0.5 border-primary" />
              {/* Type Description */}
              <View className="flex-row pt-2">
                <View className={`w-2 h-6 ${typeColor(reportData.handler)} -top-[1%]`}><Text>{" "}</Text></View>
                <Text className="font-psemibold text-sm text-primary">{"  "}Type:{" "}</Text>
                <Text className="w-[80%] font-pregular text-sm text-primary">{getEmergencyDescription(reportData.type)}</Text>
              </View>
              {/* Status Description */}
              <View className="flex-row pt-2">
                <View className={`w-2 h-6 bg-yellow-300 -top-[1%]`}><Text>{" "}</Text></View>
                <Text className="font-psemibold text-sm text-primary pb-2">{"  "}Status:{" "}</Text>
                <Text className="w-[80%] font-pregular text-sm text-primary">{getStatusDescription(reportData.status)}</Text>
              </View>
            </View>
          </Callout>
          </Marker>
          )}
          {amenities_static.map((amenity) => (
            <Marker
              key={amenity.id}
              coordinate={{
                latitude: amenity.lat,
                longitude: amenity.lon
              }}
              pinColor={getMarkerColor(amenity.type)}
              onPress={() => toggleAmenity(amenity)}
            >
              <Callout>
              <View className="w-50 h-30 justify-center">
                {/* Name of Amenity */}
                <Text className="font-pbold text-sm text-primary py-2 text-center px-2">{amenity.name}</Text>
                {/* Line Separator */}
                <View className="border-b-0.5 border-primary" />
                {/* Type Description */}
                <View className="flex-row pt-2">
                  <View className={`w-2 h-6 ${getAType(amenity.type)} -top-[1%]`}><Text>{" "}</Text></View>
                  <Text className="font-psemibold text-sm text-primary">{"  "}Type:{" "}</Text>
                  <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.type}</Text>
                </View>
                 {/* Distance Description */}
                 {location && (
                <View className="flex-row pt-2">
                  <View className={`w-2 h-6 bg-primary-75 -top-[1%]`}><Text>{" "}</Text></View>
                  <Text className="font-psemibold text-sm text-primary">{"  "}Distance:{" "}</Text>
                  
                      <Text className="w-[80%] font-pregular text-sm text-primary">
                      {(getDistance(
                        { latitude: location.latitude, longitude: location.longitude },
                        { latitude: amenity.lat, longitude: amenity.lon }
                      ) / 1000).toFixed(2)} km
                    </Text>
                </View>
                )}
                {/* Address Description */}
                <View className="flex-row pt-2">
                  <View className={`w-2 h-6 bg-primary-50 -top-[1%]`}><Text>{" "}</Text></View>
                  <Text className="font-psemibold text-sm text-primary pb-2">{"  "}Address:{" "}</Text>
                  <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.address}</Text>
                </View>
              </View>
            </Callout>
            </Marker>
          ))}
          {amenities.map((amenity, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: amenity.lat,
              longitude: amenity.lon,
            }}
            // image={getMarkerIcon(amenity.type)}
            pinColor={getMarkerColor(amenity.type)}
            onPress={() => toggleAmenity(amenity)}
          >
            <Callout>
              <View className="w-50 h-30 justify-center">
                {/* Name of Amenity */}
                <Text className="font-pbold text-sm text-primary py-2 text-center px-2">{amenity.name}</Text>
                {/* Line Separator */}
                <View className="border-b-0.5 border-primary" />
                {/* Type Description */}
                <View className="flex-row pt-2">
                  <View className={`w-2 h-6 ${getAType(amenity.type)} -top-[1%]`}><Text>{" "}</Text></View>
                  <Text className="font-psemibold text-sm text-primary">{"  "}Type:{" "}</Text>
                  <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.type}</Text>
                </View>
                {/* Distance Description */}
                {location && (
                <View className="flex-row pt-2">
                  <View className={`w-2 h-6 bg-primary-75 -top-[1%]`}><Text>{" "}</Text></View>
                  <Text className="font-psemibold text-sm text-primary">{"  "}Distance:{" "}</Text>
                  <Text className="w-[80%] font-pregular text-sm text-primary">
                    {(getDistance(
                      { latitude: location.latitude, longitude: location.longitude },
                      { latitude: amenity.lat, longitude: amenity.lon }
                    ) / 1000).toFixed(2)} km
                  </Text>
                </View>
                )}
                {/* Address Description */}
                <View className="flex-row pt-2">
                  <View className={`w-2 h-6 bg-primary-50 -top-[1%]`}><Text>{" "}</Text></View>
                  <Text className="font-psemibold text-sm text-primary pb-2">{"  "}Address:{" "}</Text>
                  <Text className="w-[80%] font-pregular text-sm text-primary">{amenity.address}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
          ))}
        </MapView>
        {/* Menu Button */}
        <View className="absolute inset-0 top-0 bg-primary w-full h-28 justify-center items-center flex-row">
          <View className="w-1/2 items-center justify-center pt-8 pr-32">
            <TouchableOpacity onPress={() => setMenuVisible(!isMenuVisible)}>
              <Image 
                tintColor="#ffffff"
                source={icons.menu}
                className="w-10 h-10"
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
          <View className="absolute top-[50%] inset-0">
            <Text className="text-2xl font-psemibold text-white">Map</Text>
          </View>
          {/* Profile Button */}
          <View className="w-1/2 items-center justify-center pl-32 pt-8">
            <TouchableOpacity onPress={() => {router.push("home/details/profile")}}>
                <View className="rounded-full items-center justify-center bg-white w-10 h-10">
                    <Image 
                      tintColor="#57b378"
                      source={icons.profile}
                      className="w-6 h-6"
                      resizeMode='contain'
                    />
                  </View>
              </TouchableOpacity>
          </View>
        </View>
        {/* Report Button */}
        <View className="absolute inset-0 bottom-[11%] border-8 z-30 border-primary bg-primary rounded-full">
          <TouchableOpacity onPress={handleReport}>
            <View className="rounded-full items-center bg-white p-5">
                <Image 
                  tintColor="#57b378"
                  source={icons.report}
                  className="w-14 h-14"
                  resizeMode='contain'
                />  
            </View>
          </TouchableOpacity>
        </View>
        {/* Bottom Bar Container */}
        <View className="absolute inset-x-0 bottom-0 h-[20%] bg-primary">
          <View className="w-full">
            {/* Toggle Map Styles Button */}
            <View className={`absolute top-4 left-4 ${!showMapStyles ? "bg-primary border-white" : "bg-white border-primary"} rounded-full w-14 h-14 flex-row items-center justify-center px-2 border-0.5`}>
            <TouchableOpacity onPress={toggleMapStyles}>
              <View className="items-center justify-center">
                <Image 
                  tintColor={!showMapStyles ? "#ffffff" : "#57b378"}
                  source={icons.mapStyle}
                  className="w-8 h-8"
                  resizeMode='contain'
                />
              </View>
              </TouchableOpacity>
            </View>
            {/* Select Nearest Amenity Button */}
            <View className={`absolute top-4 left-[20%] bg-white border-white rounded-full w-14 h-14 flex-row items-center justify-center px-2 border-0.5`}>
            <TouchableOpacity onPress={showNearestAmenity}>
              <View className="items-center justify-center">
                <Image 
                  tintColor="#57b378"
                  source={icons.nearby}
                  className="w-8 h-8"
                  resizeMode='contain'
                />
              </View>
              </TouchableOpacity>
            </View>
            {/* Center User Amenity Button */}
            <View className={`absolute top-4 right-[20%] bg-white border-white rounded-full w-14 h-14 flex-row items-center justify-center px-2 border-0.5`}>
            <TouchableOpacity onPress={refocus}>
              <View className="items-center justify-center">
                <Image 
                  tintColor="#57b378"
                  source={icons.mapFocus}
                  className="w-8 h-8"
                  resizeMode='contain'
                />
              </View>
              </TouchableOpacity>
            </View>
            {/* Toggle Traffic Button */}
            <View className={`absolute top-4 right-4 ${!showTraffic ? "bg-primary" : "bg-white"} border-white rounded-full w-14 h-14 flex-row items-center justify-center px-2 border-0.5`}>
            <TouchableOpacity onPress={toggleTraffic}>
              <View className="items-center justify-center">
                <Image 
                  tintColor={!showTraffic ? "#ffffff" : "#57b378"}
                  source={icons.traffic}
                  className="w-8 h-8"
                  resizeMode='contain'
                />
              </View>
              </TouchableOpacity>
            </View>
            {showReport === false ? (
              <View></View>
            ) : (
              <View className="absolute top-[95px] inset-x-0 items-center">
                <TouchableOpacity className="bg-primary w-[96%] h-[200%] rounded-full flex-row justify-center items-center border-0.5 border-white" onPress={toggleExpandReport}>
                  <View className="items-center justify-center pr-3">
                    <Text className="font-psemibold text-sm text-white">Expand Report</Text>
                  </View>
                  <View className="items-center justify-center">
                    <Image 
                      tintColor="#ffffff"
                      source={icons.moreDetails}
                      className="w-5 h-5"
                      resizeMode='contain'
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            {showAmenity === false ? (
              <View></View>
            ) : (
            <View className="absolute top-[95px] inset-x-0 items-center">
              <TouchableOpacity className="bg-primary w-[96%] h-[200%] rounded-full flex-row justify-center items-center border-0.5 border-white" onPress={toggleExpandAmenity}>
                <View className="items-center justify-center pr-3">
                  <Text className="font-psemibold text-sm text-white">View More Details</Text>
                </View>
                <View className="items-center justify-center">
                  <Image 
                    tintColor="#ffffff"
                    source={icons.moreDetails}
                    className="w-5 h-5"
                    resizeMode='contain'
                  />
                </View>
              </TouchableOpacity>
            </View>
            )}
          </View>
        </View>
        <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '80%',
  },
});
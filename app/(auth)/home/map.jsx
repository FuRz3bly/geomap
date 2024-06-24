import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import fetchNearbyAmenities from '../../../components/fetchplaces';

import { icons } from '../../../constants'
import retroMode from '../../../constants/map_styles/retro_mode'
import nightMode from '../../../constants/map_styles/night_mode'

import Menu from '../../../components/modals/menu'

export default function Map() {
  // Location of the User
  const [location, setLocation] = useState(null);
  // Error Message When Failed
  const [errorMsg, setErrorMsg] = useState(null);
  // For Map Filter
  const [showFilter, setshowFilter] = useState(false)
  // Container of Amenity
  const [amenities, setAmenities] = useState([]);
  // Nearest Amenity Container
  const [nearestAmenity, setNearestAmenity] = useState(null);
  // Initial Region when Map is Opened
  const [region, setRegion] = useState({
    latitude: 14.32212,
    longitude: 120.77134,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // Map Reference
  const mapRef = useRef(null);
  // Import reportform from router
  const { reportform } = useLocalSearchParams();
  // Transfer reportform to Data
  const reportData = reportform ? JSON.parse(reportform) : null;
  // Amenity Types and Descriptions
  const types = [
    { query: 'fire_station', description: 'Fire Station' },
    { query: 'police', description: 'Police Station' },
    { query: 'government', description: 'Government Office' },
    { query: 'townhall', description: 'Municipal/City Hall' },
    { query: 'barangay_hall', description: 'Barangay Hall' },
  ];
  // All emergency types
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

  const status_types = [
    {status: 'preliminary', description: 'Filing the Report'},
    {status: 'waiting', description: 'Waiting for Response'},
    {status: 'receive', description: 'Help is on the Way'},
    {status: 'arrive', description: 'Responder Arrived'},
  ]

  const getEmergencyDescription = (type) => {
    const emergencyType = emergency_types.find((et) => et.type === type);
    return emergencyType ? emergencyType.description : '';
  };

  const getStatusDescription = (status) => {
    const statusType = status_types.find((st) => st.status === status);
    return statusType ? statusType.description : '';
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case 'Fire Station':
        return 'tomato';
      case 'Police Station':
        return 'blue';
      case 'Government Office':
        return 'green';
      case 'Townhall':
        return 'tan';
      case 'Municipal Hall':
        return 'wheat';
      case 'Barangay Hall':
        return 'linen';
      default:
        return 'red'; // Default color
    }
  };

  const getMarkerTint = (handler) => {
    switch (handler) {
      case 'fire_station':
        return 'tomato';
      case 'police':
        return 'blue';
      case 'government':
        return 'green';
      default:
        return 'red'; // Default color
    }
  };

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

  const mapStyle = (selectStyle) => {
    switch (selectStyle) {
      case 'retro':
        return retroMode;
      case 'night':
        return nightMode;
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
  const [isModalVisible, setModalVisible] = useState(false)
  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const handleReport = () => {
    router.push("home/report/prelim-report")
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      {/*console.log('Current Location:', location)*/}
      
    })();
  }, []);

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
          fetchedAmenities = [...fetchedAmenities, ...results];
        }
        setAmenities(fetchedAmenities);

        // Calculate nearest amenity
        if (fetchedAmenities.length > 0) {
          const nearest = fetchedAmenities.reduce((prev, curr) => {
            const prevDistance = getDistance(location, prev);
            const currDistance = getDistance(location, curr);
            return prevDistance < currDistance ? prev : curr;
          });
          setNearestAmenity(nearest);
        }
      };

      fetchData();
    }
  }, [location]);

  const getDistance = (loc1, loc2) => {
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

  const showNearestAmenity = () => {
    if (nearestAmenity) {
      Alert.alert(
        'Nearest Amenity',
        `Name: ${nearestAmenity.name}\nType: ${nearestAmenity.type}\nDistance: ${getDistance(location, nearestAmenity).toFixed(2)} km`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('No amenities found');
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary items-center pt-20">
      <View className="absolute">
        <Menu visible={isModalVisible} onClose={toggleModal}></Menu>
      </View>
        <MapView
          style={styles.map}
          customMapStyle={null}
          initialRegion={{
            latitude: location ? location.latitude : 14.199630,
            longitude: location ? location.longitude : 120.880762,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsBuildings={true}
          showsTraffic={true}
          zoomControlEnabled={true}
        >
          {reportData && reportData.latitude && reportData.longitude && (
          <Marker
            coordinate={{
              latitude: reportData.latitude,
              longitude: reportData.longitude,
            }}
            pinColor={getMarkerTint(reportData.handler)}
          >
          <Callout>
            <View className="w-50 h-30 justify-center">
              {/* Title */}
              <Text className="font-pbold text-sm text-primary py-2 text-center">Reported Incident</Text>
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
          {amenities.map((amenity, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: amenity.lat,
              longitude: amenity.lon,
            }}
            title={amenity.name}
            description={amenity.type}
            // image={getMarkerIcon(amenity.type)}
            pinColor={getMarkerColor(amenity.type)}
          />
        ))}
        </MapView>
        {/* Nearest Amenity Button */}
        <View className="absolute inset-0 bottom-48 left-2 z-10">
          <TouchableOpacity onPress={showNearestAmenity}>
            <View className="justify-center items-center bg-white/80 shadow-white-500 shadow-lg px-3 py-3 pt-2 flex-row">
              <Image 
                tintColor="#616161"
                source={icons.nearestArrow}
                className="w-5 h-5"
                resizeMode='contain' 
              />
              <Text className="pl-5 text-white-500 font-psemibold text-xs text-right">Nearest{"\n"}Amenity</Text>  
            </View>
          </TouchableOpacity>
        </View>
        <View className="absolute inset-0 top-0 bg-primary w-full h-28 justify-center items-center flex-row">
          <View className="w-1/2 items-center justify-center pt-8 pr-32">
            <TouchableOpacity onPress={() => setModalVisible(!isModalVisible)}>
              <Image 
                tintColor="#ffffff"
                source={icons.menu}
                className="w-10 h-10"
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
          <View className="w-1/2 items-center justify-center pl-32 pt-8">
            <TouchableOpacity onPress={() => {router.push("home/profile")}}>
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
        <View className="absolute inset-0 bottom-20 border-8 z-10 border-primary bg-primary rounded-full">
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
          <View>
            <View className="left-2 top-4 w-1/3">
              <TouchableOpacity onPress={() => setshowFilter(!showFilter)}>
                <View className="space-y-2 rounded-full h-8 w-full bg-slate-200 justify-center flex-row px-2">
                  <View className="justify-center pr-[35%]">
                    <Text className="text-slate-400 font-pmedium text-xs">Map Filter</Text>
                  </View>
                  <View>
                    <Image 
                        tintColor="#94A3B8"
                        source={!showFilter ? icons.arrowU : icons.arrowD}
                        className="w-4 h-4"
                        resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '80%',
  },
});
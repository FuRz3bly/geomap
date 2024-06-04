import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import fetchNearbyAmenities from '../../../components/fetchplaces';

export default function App() {
  const [location, setLocation] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [region, setRegion] = useState({
    latitude: 14.32212,
    longitude: 120.77134,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef(null);

  const types = [
    { query: 'fire_station', description: 'Fire Station' },
    { query: 'police', description: 'Police Station' },
    { query: 'government', description: 'Government Office' },
    { query: 'townhall', description: 'Municipal/City Hall' },
    { query: 'barangay_hall', description: 'Barangay Hall' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);

      let fetchedAmenities = [];
      for (const type of types) {
        const results = await fetchNearbyAmenities(coords.latitude, coords.longitude, type);
        fetchedAmenities = [...fetchedAmenities, ...results];
      }
      setAmenities(fetchedAmenities);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location]);

  {/*const refocusToUserLocation = async () => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation(coords);
  
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 2000); // 2000ms duration for the animation
      }
    } catch (error) {
      console.error('Error refocusing to user location:', error);
    }
  };*/}

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {amenities.map((amenity, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: amenity.lat,
              longitude: amenity.lon,
            }}
            title={amenity.name}
            description={amenity.type}
          />
        ))}
      </MapView>
      <View className="absolute inset-0 bottom-10">
        <View className="bg-primary rounded-xl py-3 px-3">
          <TouchableOpacity onPress={handleShowUserLocation}>
            <Text className="text-white font-pregular">Refocus to My Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
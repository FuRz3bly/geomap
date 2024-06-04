import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { icons } from '../../../constants'
import retroMapStyle from '../../../constants/mapStyles'

import Menu from '../../../components/modals/menu'

export default function Map() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showFilter, setshowFilter] = useState(false)

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

  return (
    <SafeAreaView className="w-full h-full bg-red-500 items-center pt-20">
      <View className="absolute">
        <Menu visible={isModalVisible} onClose={toggleModal}></Menu>
      </View>
        <MapView
          style={styles.map}
          customMapStyle={retroMapStyle}
          initialRegion={{
            latitude: location ? location.latitude : 14.199630,
            longitude: location ? location.longitude : 120.880762,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsBuildings={true}
          showsTraffic={true}
          zoomControlEnabled={true}
        >
          {location && (
            <Marker
              id="10"
              coordinate={location} 
              title="User Location"
              description='This was me'
            />
          )}
        </MapView>
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
          {/*
          <View className="w-1/3 pt-8 pr-3">
            <TouchableOpacity onPress={() => setshowFilter(!showFilter)}>
              <View className="space-y-2 rounded-full h-8 w-full bg-slate-200 justify-center flex-row px-2">
                <View className="justify-center pr-14">
                  <Text className="text-slate-400 font-pmedium text-xs">Filter</Text>
                </View>
                <View>
                  <Image 
                      tintColor="#94A3B8"
                      source={!showFilter ? icons.arrowD : icons.arrowU}
                      className="w-4 h-4"
                      resizeMode='contain'
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
          */}
            
        </View>
        {/* Report Button */}
        <View className="absolute inset-0 bottom-20 border-8 z-10 border-primary rounded-full">
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
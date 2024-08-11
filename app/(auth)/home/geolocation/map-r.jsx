import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { icons } from '../../../../constants'
import Menu from '../../../../components/header/modals/menu-c'
import { getReports } from '../../../../constants/reports/static'

export default function Map() {
  const reports = getReports();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showFilter, setshowFilter] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false)
  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const [respond, setRespond] = useState(null);
  const toggleRespond = () => {
    setRespond('receive');
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
    })();
  }, []);

  return (
    <SafeAreaView className="w-full h-full bg-secondary items-center pt-20">
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
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsBuildings={true}
          showsTraffic={true}
          zoomControlEnabled={true}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude
              }}
              title={report.type}
              description={`Status: ${report.status} - Handler: ${report.handler}`}
            >
            </Marker>
          ))}
        </MapView>
        <View className="absolute inset-0 top-0 bg-secondary w-full h-28 justify-center items-center flex-row">
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
            <TouchableOpacity onPress={() => {router.push("home/details/profile")}}>
                <View className="rounded-full items-center justify-center bg-white w-10 h-10">
                    <Image 
                      tintColor="#00B0F0"
                      source={icons.profile}
                      className="w-6 h-6"
                      resizeMode='contain'
                    />
                  </View>
              </TouchableOpacity>
          </View>         
        </View>
        <View className="absolute inset-0 bottom-3 w-full items-center justify-center">
          <TouchableOpacity onPress={toggleRespond} className="bg-emerald-400/70 w-[30%] h-14 items-center justify-center">
            <Text className="font-pbold text-base text-white/70">Respond</Text>
          </TouchableOpacity>
        </View>
        <StatusBar backgroundColor='#00B0F0' style={'light'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '90%',
  },
});
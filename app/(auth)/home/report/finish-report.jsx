import { StyleSheet, Text, TouchableOpacity, View, Image, Button, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../../constants';
import { images } from '../../../../constants';
import Terms from '../../../../components/modals/terms';

const FinishReport = () => {
  // Setting what camera face is used
  const [facing, setFacing] = useState('back');
  // Asking for Camera Permission
  const [permission, requestPermission] = useCameraPermissions();
  // Asking for Location Permission
  const [locationPermission, setLocationPermission] = useState(null);
  // Array of Photos
  const [photos, setPhotos] = useState([]);
  // Reference for CameraView
  const cameraRef = useRef(null);

  // Data storage for Address
  const [currentAddress, setCurrentAddress] = useState('...');
  // If error happened
  const [locationError, setLocationError] = useState(null);

  // If Terms is Visible (true / false)
  const [isModalVisible, setModalVisible] = useState(false)
  // Toggle Terms and Conditions
  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const [cameraFullScreen, setCameraFullScreen] = useState(false)
  const toggleFullScreen = () => {
    setCameraFullScreen(!cameraFullScreen)
  }

  const submitHandle = () => {
    router.push("home/report/photo-report")
  }

  // Getting Location and Separating Address
  useEffect(() => {
    const getLocation = async () => {
      {/* Checking for Location Permission if its accepted */}
      let { status } = await Location.requestForegroundPermissionsAsync();
      {/* If it isn't granted or not accepted */}
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      try {
        {/* Assigning location and address */}
        let location = await Location.getCurrentPositionAsync({});
        {/* Using Latitude and Longitude to find address */}
        let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        {/* Checking if address has data or more than the length */}
        if (address.length > 0) {
          {/* Splitting the address into street, city, region, postalCode and country */}
          const addressComponents = [
            address[0].street,
            address[0].city,
            address[0].region,
            address[0].postalCode,
            address[0].country,
          ];
          {/* Filtering the address combining components and adding comma to separate */}
          const filteredAddressComponents = addressComponents.filter(component => component);
          const formattedAddress = filteredAddressComponents.join(', ');

          {/* Record formattedAddress to currentAddress */}
          setCurrentAddress(formattedAddress);
        } else {
          {/* Display error */}
          setLocationError('Unable to retrieve address');
        }
      } catch (error) {
        setLocationError(error.message);
      }
    };

    getLocation();
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // If camera is not granted permission yet
    return (
      <View style={{ justifyContent: 'center' }}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (!locationPermission) {
    // if Location is not granted permission yet
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 120 }}>
        <Text style={{ textAlign: 'center' }}>We need your permission to access location</Text>
        <Button onPress={async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === 'granted');
        }} title="Grant Location Permission" />
      </View>
    );
  }

  // Switch Camera face
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Taking  a picture
  const takePicture = async () => {
    // If camera is active and shows photographs limit; three (3) photos
    if (cameraRef.current && photos.length < 3) {
      {/* Store photo if photo is taken */}
      const photo = await cameraRef.current.takePictureAsync();
      {/* To have the illusion of extracting metadata from Photos, use the current time and date of the Phone */}
      const currentDateTime = new Date().toLocaleString();
      {/* Taking the location of the user upon taking the photo to have illusion of extracting metadata */}
      const location = await Location.getCurrentPositionAsync({});
      {/* Collection of data of the Photo / Metadata */}
      const photoData = {
        uri: photo.uri,
        timestamp: currentDateTime,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      }
      {/* Setting the metadata and photos */}
      setPhotos([...photos, photoData]);
    }
  };

  // Backbutton handler
  const backHandle = () => {
    router.back()}

  return (
    <SafeAreaView className="bg-primary h-full w-full">
      <View className="absolute inset-0">
        <Terms visible={isModalVisible} onClose={toggleModal}></Terms>
      </View>
      {/* Back Button */}
      <View className="absolute left-0 top-6 py-3 pl-2 z-20">
        <TouchableOpacity onPress={backHandle}>
          <View className="flex-row justify-center items-center">
            <Image 
                tintColor="#57b378"
                source={icons.back}
                className="w-6 h-6"
                resizeMode='contain'
            />
            <Text className="text-xl text-primary font-pbold pt-1 pl-4">Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Title Container */}
      <View className="absolute inset-x-0 top-7 h-[20%] w-full justify-center bg-white z-10 border-b-2 border-primary">
        {/* Title */}
        <View className="items-center">
          <Text className="text-4xl text-primary text-semibold font-pbold pt-10 pb-3">SNAPSHOT{"  "}REPORT</Text>
        </View>
        <View className="absolute inset-0 left-6 top-32 bg-primary h-1 w-[88%] items-center"></View>
        {/* Page Indicators */}
        <View className="flex-row gap-40 items-center justify-center bottom-0">
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
          <View className="bg-white border-primary border-double border-4 h-4 w-4 rounded-full justify-center items-center">
          </View>
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
        </View>
      </View>

      <View className="pt-44 bg-white" />
        {/* Camera Container */}
        <View className="bg-white w-full h-full px-5">
          {/* Instructions */}
          <Text className="font-pregular text-sm text-primary py-2">Please take
          <Text className="font-pbold">{" "}3 photos{" "}</Text>of the Emergency / Incident.</Text>
          <TouchableOpacity className="pt-2" onPress={() => setModalVisible(!isModalVisible)}>
            <Text className="font-pregular text-sm text-primary py-2">
              Read our{" "}<Text className="font-pbold">Terms and Conditions</Text>{" "}here.
            </Text>
          </TouchableOpacity>

          <View className="pt-2">
            {/* Camera View */}
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <TouchableOpacity onPress={toggleFullScreen}>
                  <View className="justify-center items-center pt-48">
                    <Image 
                      tintColor="#ffffff"
                      source={icons.fullScreen}
                      className="w-10 h-10"
                      resizeMode='contain'
                    />
                    <Text className="font-pmedium text-sm text-center text-white pt-4">Press here to{"\n"}Full Screen</Text>
                  </View>
                </TouchableOpacity>
            </CameraView>
          </View>
          <View className="pl-2 pt-2">
            <TouchableOpacity className="w-44 h-12 bottom-0 left-48 bg-primary items-center justify-center rounded-3xl mt-2" onPress={submitHandle}>
              <Text className="text-white font-pbold text-xl pl-4">SUBMIT {"   >"}</Text>
            </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  )
}

export default FinishReport

const styles = StyleSheet.create({
  camera: {
    height: "75%",
    width: "100%"
  },
})
import { Text, TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../../constants';
import Terms from '../../../../components/modals/terms';

const PhotoReport = () => {
  const { reportform } = useLocalSearchParams(); // Access the reportform data
  const formatReportForm = JSON.parse(reportform); // Parse the JSON string to an object

  // Setting what camera face is used
  const [facing, setFacing] = useState('back');
  // Asking for Camera Permission
  const [permission, requestPermission] = useCameraPermissions();
  // Asking for Location Permission
  const [locationPermission, setLocationPermission] = useState('granted');
  // Array of Photos
  const [photos, setPhotos] = useState([]);
  // Preview Photo
  const [previewPhoto, setPreviewPhoto] = useState(null)
  // Photo Index for Next Picture
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  // Reference for CameraView
  const cameraRef = useRef(null);
  // Active Camera Picker
  const [activeCamera, setActiveCamera] = useState('camera1');

  // Data storage for Address
  const [currentAddress, setCurrentAddress] = useState('...');
  // If error happened
  const [locationError, setLocationError] = useState(null);

  // If Terms is Visible (true / false)
  const [isModalVisible, setModalVisible] = useState(false)
  // Toggle Terms and Conditions
  const toggleModal = () => {setModalVisible(!isModalVisible)}

  const [photoComplete, setPhotoComplete] = useState(false)

  const [cameraFullScreen, setCameraFullScreen] = useState(false)
  const toggleFullScreen = () => {
    setCameraFullScreen(!cameraFullScreen)
    setActiveCamera('camera2')}

  const submitHandle = () => {
    const updatedReportForm = {
      ...formatReportForm,
      status: 'waiting',
      photos: photos,
    };
    router.push({
      pathname: "home/geolocation/map-c",
      params: { reportform: JSON.stringify(updatedReportForm) },
    });
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

  // Switch Camera face
  function toggleCameraFacing() {setFacing(current => (current === 'back' ? 'front' : 'back'));}
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
      setPreviewPhoto(photoData);
      setCurrentPhotoIndex(photos.length);  // Display the newly taken photo

      if (photos.length + 1 === 3) {
        toggleFullScreen()
        setPhotoComplete(true)
      }
    } else {
      // Display the warning alert
      Alert.alert(
        "Capture Limit Reached",
        "The maximum number of images stored has been reached.",
        [{ text: "OK" }]
      );
    }
  };
  // Next Photo Button Logic
  const showNextImage = () => {
    if (photos.length > 0) {setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);}};
  // Previous Photo Button Logic
  const showPrevImage = () => {
    if (photos.length > 0) {setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);}};
  // Delete Current Photo Logic
  const deleteCurrentPhoto = () => {
    setPhotoComplete(false)
    if (photos.length > 0) {
      const updatedPhotos = photos.filter((_, index) => index !== currentPhotoIndex);
      setPhotos(updatedPhotos);
      setCurrentPhotoIndex(0);}};
  
  const retakePhoto = async () => {
    toggleFullScreen()
  };

  const retakeAllPhotos = () => {
    setPhotos([]);
    setPreviewPhoto(null);
    setCurrentPhotoIndex(0);
    toggleFullScreen()
  };

  // Backbutton handler
  const backHandle = () => {
    router.back()}

  return (
    <SafeAreaView className="bg-primary h-full w-full">
      {cameraFullScreen === false ? (
        <View>
          <View className="absolute inset-0">
            <Terms visible={isModalVisible} onClose={toggleModal}></Terms>
          </View>
          {/* Back Button */}
          <View className="absolute left-0 top-0 py-3 pl-2 z-20">
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
          <View className="absolute inset-x-0 -top-8 h-[20%] w-full justify-center bg-white z-10 border-b-2 border-primary">
            {/* Title */}
            <View className="items-center">
              <Text className="text-4xl text-primary text-semibold font-pbold pt-10 pb-2">SNAPSHOT{"  "}REPORT</Text>
            </View>
            <View className="absolute inset-0 left-6 top-36 bg-primary h-1 w-[88%] items-center"></View>
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

          <View className="pt-48 bg-white" />
        {/* Camera Container */}
        <View className="bg-white w-full h-full px-5">
          {/* Instructions */}
          {photos.length > 0 ? (
            <Text className="font-psemibold text-sm text-primary py-2">Check your photos below.</Text>
          ) : (
            <View>
              <Text className="font-pregular text-sm text-primary py-2">Please take
              <Text className="font-pbold">{" "}3 photos{" "}</Text>of the Emergency / Incident.</Text>
              <TouchableOpacity className="pt-2" onPress={() => setModalVisible(!isModalVisible)}>
              <Text className="font-pregular text-sm text-primary py-2">
                Read our{" "}<Text className="font-pbold">Terms and Conditions</Text>{" "}here.
              </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="pt-2">
            {/* Camera View */}
            {photos.length > 0 ? (
              <View className="bg-white h-[68%] w-full items-center shadow-md shadow-black">
                {/* Photos Container */}
                <View className="flex-row">
                  <View className={`justify-center items-center ${photos.length > 1 ? "pt-2" : "pt-8"}`}>
                    {photos.length > 1 && (
                      // Previous Image Button
                      <TouchableOpacity className="h-[87.5%] px-1.5 justify-center bg-primary/40" onPress={showPrevImage}>
                        <Image 
                          tintColor="#57b378"
                          source={icons.prevBtn}
                          className="w-6 h-8"
                          resizeMode='contain'
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {/* Photo Viewer */}
                  <View className={`justify-center items-center ${photos.length > 1 ? "pt-2" : "pt-8"}`}>
                    <Image source={{ uri: photos[currentPhotoIndex].uri }} style={{ height: 400, width: 300 }} resizeMode='contain' />
                    <View className="absolute bottom-[7%] right-[7%]">
                      <Text className="font-pbold text-3xl text-white">0{currentPhotoIndex + 1}</Text>
                    </View>
                  </View>
                  <View className={`justify-center items-center ${photos.length > 1 ? "pt-2" : "pt-8"}`}>
                    {photos.length > 1 && (
                      // Next Image Button
                      <TouchableOpacity className="h-[87.5%] px-1.5 justify-center bg-primary/40" onPress={showNextImage}>
                        <Image 
                          tintColor="#57b378"
                          source={icons.nextBtn}
                          className="w-6 h-8"
                          resizeMode='contain'
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {/* Buttons Container */}
                <View className={`absolute ${photos.length > 1 ? "bottom-[2%]" : "bottom-[3%]"} left-[2%] flex-row gap-2`}>
                  {/* Delete Photo Button */} 
                  <TouchableOpacity onPress={deleteCurrentPhoto}>
                    <View className="p-4 rounded-full">
                      <Image 
                        tintColor="#57b378"
                        source={icons.deletePhoto}
                        className="w-8 h-8"
                        resizeMode='contain'
                      />
                    </View>
                  </TouchableOpacity>
                  {photos.length === 3 ? (
                    // Retake Photo Button
                    <TouchableOpacity onPress={retakePhoto}>
                      <View className="p-4 rounded-full">
                        <Image 
                          tintColor="#57b378"
                          source={icons.retakePhoto}
                          className="w-8 h-8"
                          resizeMode='contain'
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    // Camera Button
                    <TouchableOpacity onPress={retakePhoto}>
                      <View className="p-4 rounded-full">
                        <Image 
                          tintColor="#57b378"
                          source={icons.camera}
                          className="w-8 h-8"
                          resizeMode='contain'
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                  {/* Retake All Photo Button */}
                  <View className="justify-center items-center absolute -right-[145%] bottom-4">
                    <TouchableOpacity onPress={retakeAllPhotos}>
                      <View className="bg-primary p-2 px-6 rounded-xl">
                        <Text className="font-pbold text-white text-sm">Retake All</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View className="bg-white-100 h-[60%] w-full">
                <TouchableOpacity onPress={toggleFullScreen}>
                  <View className="justify-center items-center pt-40">
                    <Image 
                      tintColor="#ffffff"
                      source={icons.camera}
                      className="w-10 h-10"
                      resizeMode='contain'
                    />
                    <Text className="font-pmedium text-sm text-center text-white pt-4">Please press here to{"\n"}enable Camera</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            <View className="pl-2 pt-4">
              <TouchableOpacity className={`w-44 h-12 bottom-0 left-48 ${photoComplete === true ? "bg-primary" : "bg-white-200"} items-center justify-center rounded-3xl mt-2`} 
              onPress={submitHandle} 
              disabled={!photoComplete}>
                <Text className="text-white font-pbold text-xl pl-4">SUBMIT {"   >"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </View>
      ) : (
        <View>
          {activeCamera === 'camera2' && (
            <CameraView style={{ height: '93%', width: '100%' }} facing={facing} ref={cameraRef}>
            {/* Camera Screen */}
            </CameraView>
          )}
          {/* Capture Photo Button and Border */}
          <View style={{ alignItems: 'center', position: 'absolute', bottom: '1%', left: '38%' }}>
            <View className="w-24 h-24 justify-center items-center bg-primary rounded-full z-20">
              <TouchableOpacity onPress={takePicture}>
                <Image 
                  tintColor={photos.length < 3 ? "#ffffff" : '#b5ffd0'}
                  source={icons.capture}
                  className="w-16 h-16"
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Flip Camera Button and Border */}
          <View className="absolute -left-10 bottom-8">
            <View className="w-32 h-14 pl-8 justify-center items-center bg-primary rounded-full z-20">
              <TouchableOpacity onPress={toggleCameraFacing}>
                  <Image 
                    tintColor="#ffffff"
                    source={icons.flipCamera}
                    className="w-8 h-8"
                    resizeMode='contain'
                  />
              </TouchableOpacity>
            </View>
          </View>
          {/* Photo Frame Template */}
          <View className="w-20 h-24 absolute right-2 bottom-6 bg-white items-center">
            {photos.length > 0 ? (
              <View className="w-16 h-16 bg-black top-2">
                {previewPhoto && (
                <Image source={{ uri: previewPhoto.uri }} style={{ width: 64, height: 64 }} />
                )}
              </View>
            ) : (
              <View className="w-16 h-16 items-center justify-center bg-white-100 top-2">
                <Image 
                    tintColor="#ffffff"
                    source={icons.camera}
                    className="w-5 h-5"
                    resizeMode='contain'
                  />
              </View>
            )}
            <Text className="pl-14 pt-2.5 bottom-0 font-pbold text-sm text-primary">{photos.length}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default PhotoReport
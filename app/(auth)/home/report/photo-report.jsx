import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState('granted');
  const [photos, setPhotos] = useState([]);
  const cameraRef = useRef(null);

  const [currentAddress, setCurrentAddress] = useState('Locating User...');
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address.length > 0) {
          const addressComponents = [
            address[0].street,
            address[0].city,
            address[0].region,
            address[0].postalCode,
            address[0].country,
          ];

          const filteredAddressComponents = addressComponents.filter(component => component);
          const formattedAddress = filteredAddressComponents.join(', ');

          setCurrentAddress(formattedAddress);
        } else {
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
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (!locationPermission) {
    // Location permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to access location</Text>
        <Button onPress={async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === 'granted');
        }} title="Grant Location Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current && photos.length < 3) {
      const photo = await cameraRef.current.takePictureAsync();
      const currentDateTime = new Date().toLocaleString();
      const location = await Location.getCurrentPositionAsync({});
      const photoData = {
        uri: photo.uri,
        timestamp: currentDateTime,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      }
      setPhotos([...photos, photoData]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <View style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <Text style={styles.timestamp}>Timestamp: {photo.timestamp}{"\n"}
              {`Latitude: ${photo.location.latitude}, Longitude: ${photo.location.longitude}`}{"\n"}
              Address: {locationError ? `Error: ${locationError}` : currentAddress}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  camera: {
    height: "80%",
    width: "100%"
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  photo: {
    width: 300,
    height: 300,
    margin: 5,
  },
  photoContainer: {
    alignItems: 'center',
    margin: 5,
  },
  photo: {
    width: 100,
    height: 100,
  },
  timestamp: {
    marginTop: 5,
    fontSize: 12,
    color: 'black',
  },
});
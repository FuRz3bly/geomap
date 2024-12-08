import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, TextInput, Dimensions, ScrollView, TouchableHighlight, Linking, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { translate } from '../../../components/ToolsContext';
import { Terms } from '../../../components/modals';

import * as Location from 'expo-location';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; 

import { images, icons } from '../../../constants';

const SettingsScreen = ({ changePage, backPage }) => {
  // Global Variables
  const { user } = useContext(UserContext); // Current User Data
  const { allowSounds, setAllowSounds } = useContext(ToolsContext); // Dictionary Container
  const version = Constants.expoConfig?.version || '1.0.0'; // GEOMAP Version
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'N/A';
  const runtimeEnvironment = Constants.executionEnvironment || 'N/A';
  const sessionId = Constants.sessionId;
  const deviceName = Constants.deviceName || 'Unknown Device Name';
  const systemVersion = Constants.systemVersion || 'Unknown OS Version'
  // Permission Variables
  const [locationPermission, setLocationPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useCameraPermissions();
  const [mediaPermission, setMediaPermission] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(null);
  // Modal Variables
  const [isTermsVisible, setTermsVisible] = useState(false);
  // Contact Us View Variables
  const [isContactVisible, setContactVisible] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', question: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  // Version Info Variables
  const [isVersionInfoVisible, setVersionInfoVisible] = useState(false);
  // About Us Variables
  const [isAboutVisible, setAboutVisible] = useState(false);

  // Allow the back button action when the component is mounted
  useEffect(() => {
    const backAction = () => {
        //changePage('home/homes');
        if (isContactVisible) {
          setContactVisible(false);
        } else if (isVersionInfoVisible) {
          setVersionInfoVisible(false);
        } else if (isAboutVisible) {
          setAboutVisible(false);
        } else {
          backPage();
        }
        return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, [isContactVisible, isVersionInfoVisible, isAboutVisible]);

  useEffect(() => {
    // Check the initial permission status
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Check the initial permission status
    (async () => {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      setMediaPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Check the initial permission status
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({ name: `${user.full_name.first_name} ${user.full_name.last_name}`, email: user.email });
    }
  }, [user, isContactVisible]);

  const toggleLocationPermission = async () => {
    if (locationPermission) {
      // Open device settings to manually disable location permission
      Alert.alert(
        'Disable Location Permission',
        'Please disable location permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
      );
    } else {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    }
  };

  const toggleCameraPermission = async () => {
    if (hasCameraPermission?.status === 'granted') {
      Alert.alert(
        'Disable Camera Permission',
        'Please disable camera permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
      );
    } else {
      await requestPermission();
    }
  };

  const toggleMediaPermission = async () => {
    if (mediaPermission) {
      // Open device settings to manually disable media permission
      Alert.alert(
        'Disable Media Permission',
        'Please disable media permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
      );
    } else {
      // Request media permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaPermission(status === 'granted');
    }
  };

  const toggleNotificationPermission = async () => {
    if (notificationPermission) {
      // Open device settings to manually disable media permission
      Alert.alert(
        'Disable Notification Permission',
        'Please disable notification permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: true }
      );
    } else {
      // Request media permission
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationPermission(status === 'granted');
    }
  };

  const closeTModal = () => {
    setTermsVisible(false)
  };

  const handleInputChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      // Reference to the 'questions' collection
    const questionsRef = collection(db, 'questions');
    setSubmitLoading(true);

    // Add a new document with form data
    const docRef = await addDoc(questionsRef, {
      uid: user.uid,
      name: form.name,
      email: form.email,
      question: form.question,
      createdAt: new Date() // optional: adds a timestamp
    });

    // Get the document ID and add it to the document
    await updateDoc(doc(db, 'questions', docRef.id), { id: docRef.id });
  
    // Optionally, reset the form after submission
    setForm({ name: '', email: '', question: '' });
    setSubmitLoading(false);
    setContactVisible(false);
    } catch (error) {
      console.error("Error submitting form: ", error);
      Alert.alert('Submission Failed', 'An error occurred while submitting your question.');
      setSubmitLoading(false);
      setContactVisible(false);
    }
  };
  
  return (
    <SafeAreaView className="w-full h-full bg-primary justify-center items-center">
      <Terms visible={isTermsVisible} onClose={closeTModal} onAccept={closeTModal} page={'view1'}/>
      {isContactVisible && (
        <View className="w-full h-[140%] justify-center absolute bg-black/40 z-20">
          <View className="w-full h-fit bg-white">
            {/* Title */}
            <View className="w-full h-16 justify-center">
              <Text className="font-pmedium text-xl text-slate-500 pt-[5%] pb-[3%] px-6">{'CONTACT US'}</Text>
            </View>
            <View className="w-12 h-12 absolute top-3 right-4">
              <TouchableOpacity className="w-full h-full justify-center items-center" onPress={() => setContactVisible(false)}>
                <Image 
                  tintColor={'#57b378'}
                  source={icons.close}
                  className="w-[50%] h-[50%]"
                  resizeMode='contain'
                />
              </TouchableOpacity>
            </View>
            {/* Forms */}
            <View className="w-full h-fit items-center px-6">
              {/* User Name */}
              <View className="w-full h-fit justify-center border-b-[1px] border-slate-400">
                <TextInput
                  placeholder="Your Name"
                  value={form.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  editable={true}
                  className="w-full h-16 text-base font-rbase text-black"
                />
              </View>
              {/* User Email */}
              <View className="w-full h-fit justify-center border-b-[1px] border-slate-400">
                <TextInput
                  placeholder="Your Email"
                  value={form.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  editable={true}
                  className="w-full h-16 text-base font-rbase text-black"
                />
              </View>
              {/* User Question */}
              <View className="w-full h-fit border-b-[1px] border-slate-400">
                <TextInput
                  placeholder="Your Question Here"
                  value={form.question}
                  onChangeText={(value) => handleInputChange('question', value)}
                  editable={true}
                  multiline={true}
                  numberOfLines={3}
                  className="w-full h-24 text-base font-rbase text-black"
                />
              </View>
              {/* Submit Forms */}
              <View className="w-full h-16 items-end justify-center mt-6">
                <TouchableHighlight 
                  underlayColor={"#d9ffe6"} 
                  className={`w-3/5 py-2 ${!form.name || !form.email || !form.question ? 'bg-primary-75' : 'bg-primary'} items-center justify-center rounded-3xl`} 
                  onPress={handleSubmit} 
                  disabled={(!form.name || !form.email || !form.question) || submitLoading}
                >
                  {submitLoading ? <ActivityIndicator size="large" color="#ffffff" /> : <Text className={`${!form.name || !form.email || !form.question ? 'text-primary-10' : 'text-white'} font-psemibold text-2xl`}>{'SUBMIT'}</Text>}
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </View>
      )}
      <View className="w-full h-full bg-white">
          {isVersionInfoVisible ? (
            <View className="w-full h-full bg-white">
              {/* Version Title */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 pt-[5%] pb-[3%] px-6">{'ABOUT'}</Text>
              </View>
              {/* App Version */}
              <View className="w-full h-fit flex-row px-6">
                <View className="w-[40%]">
                  <Text className="font-rbase text-base text-black pt-3">{'App Version'}</Text>
                </View>
                <View className="w-[60%]">
                  <Text className="font-rbase text-base text-black pt-3">{version}</Text>
                </View>
              </View>
              {/* Build Number */}
              <View className="w-full h-fit flex-row px-6">
                <View className="w-[40%]">
                  <Text className="font-rbase text-base text-black pt-3">{'Build Number'}</Text>
                </View>
                <View className="w-[60%]">
                  <Text className="font-rbase text-base text-black pt-3">{buildNumber}</Text>
                </View>
              </View>
              {/* Device Name */}
              <View className="w-full h-fit flex-row px-6">
                <View className="w-[40%]">
                  <Text className="font-rbase text-base text-black pt-3">{'Device Name'}</Text>
                </View>
                <View className="w-[60%]">
                  <Text className="font-rbase text-base text-black pt-3">{deviceName}</Text>
                </View>
              </View>
              {/* OS Version */}
              <View className="w-full h-fit flex-row px-6">
                <View className="w-[40%]">
                  <Text className="font-rbase text-base text-black pt-3">{'OS Version'}</Text>
                </View>
                <View className="w-[60%]">
                  <Text className="font-rbase text-base text-black pt-3">{systemVersion}</Text>
                </View>
              </View>
              {/* Runtime Environment */}
              <View className="w-full h-fit flex-row px-6">
                <View className="w-[40%]">
                  <Text className="font-rbase text-base text-black pt-3">{'Environment'}</Text>
                </View>
                <View className="w-[60%]">
                  <Text className="font-rbase text-base text-black pt-3">{runtimeEnvironment}</Text>
                </View>
              </View>
              {/* Session ID */}
              <View className="w-full h-fit flex-row px-6">
                <View className="w-[40%]">
                  <Text className="font-rbase text-base text-black pt-3">{'Session ID'}</Text>
                </View>
                <View className="w-[60%]">
                  <Text className="font-rbase text-base text-black pt-3">{sessionId}</Text>
                </View>
              </View>
            </View>
          ) : isAboutVisible ? (
            <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
              {/* About Us Title */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 pt-[5%] pb-[3%] px-6">{'ABOUT US'}</Text>
              </View>
              {/* Introduction */}
              <Text className="font-rbase text-base text-black text-justify py-2 px-5">
                {`  We are fourth year students taking up Bachelor of Science in Computer Science of Cavite State University Don Severino de las Alas Campus Indang, Cavite.\n\n  Currently, we are working on a research study called "GEOMAP: An Android-Based Geographic Emergency Reporting System." The objective of this study enables the community to request for assistance in the event of any emergency, while also allowing emergency responders to receive reports.\n\n  The project aims for a more efficient reporting, receiving and responding process.`}
              </Text>
              {/* Meet the researchers */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 px-6">{'MEET THE RESEARCHERS'}</Text>
              </View>
              {/* Researchers */}
              <View className="w-full h-48">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="w-full h-full"
                  contentContainerStyle={{
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Ivan */}
                  <View className="w-48 h-full items-center justify-center mr-4 ml-6">
                    <Image
                      source={images.ivan}
                      className="w-[60%] h-[65%]"
                      resizeMode='contain'
                    />
                    <Text className="font-pmedium text-sm text-black text-center">{'Blancaflor, Denielle Ivan L.'}</Text>
                    <Text className="font-pmedium text-xs text-slate-400 text-center">{'Student Researcher'}</Text>
                  </View>
                  {/* Jay */}
                  <View className="w-48 h-full items-center justify-center mr-4">
                    <Image
                      source={images.jay}
                      className="w-[60%] h-[65%]"
                      resizeMode='contain'
                    />
                    <Text className="font-pmedium text-sm text-black text-center">{'Cabildo, Jay Bryan C.'}</Text>
                    <Text className="font-pmedium text-xs text-slate-400 text-center">{'Student Researcher'}</Text>
                  </View>
                  {/* Nino */}
                  <View className="w-48 h-full items-center justify-center mr-4">
                    <Image
                      source={images.nino}
                      className="w-[60%] h-[65%]"
                      resizeMode='contain'
                    />
                    <Text className="font-pmedium text-sm text-black text-center">{'Castillo, Niño Angelo D.'}</Text>
                    <Text className="font-pmedium text-xs text-slate-400 text-center">{'Student Researcher'}</Text>
                  </View>
                  {/* Azy */}
                  <View className="w-36 h-full items-center justify-center mr-6">
                    <Image
                      source={images.azy}
                      className="w-[80%] h-[65%]"
                      resizeMode='contain'
                    />
                    <Text className="font-pmedium text-sm text-black text-center">{'Sumanting, Azel V.'}</Text>
                    <Text className="font-pmedium text-xs text-slate-400 text-center">{'Student Researcher'}</Text>
                  </View>
                </ScrollView>
              </View>
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 px-6">{'MISSION'}</Text>
              </View>
              <Text className="font-rbase text-base text-black text-justify py-2 px-5 mb-6">
                {`  Our mission is to create an efficient platform that helps users to swiftly report emergencies, accidents, and incidents through GEOMAP.\n\n   By following to the principles of Report, Receive, and Respond, we ensure timely and clear communication, enabling an effective response to every incident reported.\n\n   By facilitating clear communication between the community and emergency responders, we strive to enhance the effectiveness and speed of response, ensuring that help reaches those in need as quickly as possible.\n\n   Through our commitment to safety and communication, we aim to foster a more connected and safe community.\n\nSafeguarding Communities, One Report at a Time.`}
              </Text>
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
              {/* Category Title */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 pt-[5%] pb-[3%] px-6">{'GENERAL'}</Text>
              </View>
              {/* Menu Sounds */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={() => setAllowSounds(!allowSounds)}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                    <View className="w-[15%] items-center justify-center">
                      <Image 
                        tintColor={allowSounds ? '#57b378' : '#64748b'}
                        source={!allowSounds ? icons.soundOff : icons.soundOn}
                        className="w-[40%] h-[40%]"
                        resizeMode='contain'
                      />
                    </View>
                    <View className="w-[70%] py-4 justify-center">
                      <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Menu Sounds'}</Text>
                    </View>
                    <View className="w-[15%] items-center justify-center">
                      <Image 
                        tintColor={allowSounds ? '#57b378' : '#64748b'}
                        source={allowSounds ? icons.toggleOn : icons.toggleOff}
                        className="w-[80%] h-[80%]"
                        resizeMode='contain'
                      />
                    </View> 
                </View>
              </TouchableHighlight>
              {/* Category Title */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 py-[3%] px-6">{'PERMISSIONS'}</Text>
              </View>
              {/* Location Permission */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={toggleLocationPermission}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={locationPermission ? '#57b378' : '#64748b'}
                      source={locationPermission ? icons.locationOn : icons.locationOff}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Location'}</Text>
                  </View>
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={locationPermission ? '#57b378' : '#64748b'}
                      source={locationPermission ? icons.toggleOn : icons.toggleOff}
                      className="w-[80%] h-[80%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Camera Permission */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={toggleCameraPermission}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={hasCameraPermission ? '#57b378' : '#64748b'}
                      source={hasCameraPermission ? icons.camera : icons.cameraOff}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Camera'}</Text>
                  </View>
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={hasCameraPermission ? '#57b378' : '#64748b'}
                      source={hasCameraPermission ? icons.toggleOn : icons.toggleOff}
                      className="w-[80%] h-[80%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Media Permission */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={toggleMediaPermission}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={mediaPermission ? '#57b378' : '#64748b'}
                      source={mediaPermission ? icons.mediaOn : icons.mediaOff}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Media'}</Text>
                  </View>
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={mediaPermission ? '#57b378' : '#64748b'}
                      source={mediaPermission ? icons.toggleOn : icons.toggleOff}
                      className="w-[80%] h-[80%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Notification Permission */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={toggleNotificationPermission}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={notificationPermission ? '#57b378' : '#64748b'}
                      source={notificationPermission ? icons.notificationOn : icons.notificationOff}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Notifications'}</Text>
                  </View>
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor={notificationPermission ? '#57b378' : '#64748b'}
                      source={notificationPermission ? icons.toggleOn : icons.toggleOff}
                      className="w-[80%] h-[80%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Category Title */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 py-[3%] px-6">{'HELP & SUPPORT'}</Text>
              </View>
              {/* FAQ */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={() => changePage('home/helps')}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.faq}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'FAQ'}</Text>
                  </View>
                  <View className="w-[15%] items-end justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.nextBtn}
                      className="w-[30%] h-[30%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Contact US */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={() => setContactVisible(true)}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.support}
                      className="w-[50%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Contact Us'}</Text>
                  </View>
                  <View className="w-[15%] items-end justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.nextBtn}
                      className="w-[30%] h-[30%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Send Feedback */}
              {/* <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
                <View className="w-[15%] items-center justify-center">
                  <Image 
                    tintColor='#64748b'
                    source={icons.sendFeedback}
                    className="w-[40%] h-[40%]"
                    resizeMode='contain'
                  />
                </View>
                <View className="w-[70%] py-4 justify-center">
                  <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Send Feedback'}</Text>
                </View>
                <View className="w-[15%] items-end justify-center">
                  <Image 
                    tintColor='#64748b'
                    source={icons.nextBtn}
                    className="w-[30%] h-[30%]"
                    resizeMode='contain'
                  />
                </View> 
              </View> */}
              {/* Category Title */}
              <View className="w-full h-16 justify-center">
                <Text className="font-pmedium text-xl text-slate-500 py-[3%] px-6">{'ABOUT'}</Text>
              </View>
              {/* About Us */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={() => setAboutVisible(true)}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.aboutUsOff}
                      className="w-[50%] h-[50%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'About Us'}</Text>
                  </View>
                  <View className="w-[15%] items-end justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.nextBtn}
                      className="w-[30%] h-[30%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Version Information */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={() => setVersionInfoVisible(true)}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.information}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Version Information'}</Text>
                  </View>
                  <View className="w-[15%] items-end justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.nextBtn}
                      className="w-[30%] h-[30%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Terms and Conditions */}
              <TouchableHighlight underlayColor={'#fffd99'} className="w-full h-16" onPress={() => setTermsVisible(true)}>
                <View className="w-full h-full items-center border-b-[1px] border-slate-400 flex-row px-3">
                  <View className="w-[15%] items-center justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.terms}
                      className="w-[40%] h-[40%]"
                      resizeMode='contain'
                    />
                  </View>
                  <View className="w-[70%] py-4 justify-center">
                    <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Terms and Conditions'}</Text>
                  </View>
                  <View className="w-[15%] items-end justify-center">
                    <Image 
                      tintColor='#64748b'
                      source={icons.nextBtn}
                      className="w-[30%] h-[30%]"
                      resizeMode='contain'
                    />
                  </View> 
                </View>
              </TouchableHighlight>
              {/* Credits */}
              {/* <View className="w-full h-16 items-center border-b-[1px] border-slate-400 flex-row px-3">
                <View className="w-[15%] items-center justify-center">
                  <Image 
                    tintColor='#64748b'
                    source={icons.legends}
                    className="w-[40%] h-[40%]"
                    resizeMode='contain'
                  />
                </View>
                <View className="w-[70%] py-4 justify-center">
                  <Text className="font-rbase text-base text-slate-500 left-[5%]">{'Credits'}</Text>
                </View>
                <View className="w-[15%] items-end justify-center">
                  <Image 
                    tintColor='#64748b'
                    source={icons.nextBtn}
                    className="w-[30%] h-[30%]"
                    resizeMode='contain'
                  />
                </View> 
              </View> */}
            </ScrollView>
          )}
        </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
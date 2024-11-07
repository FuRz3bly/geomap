import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, TouchableHighlight, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import uuid from 'react-native-uuid';

import { app } from '../firebaseConfig';
import { images, icons } from '../constants';
import { Failed, Success } from '../components/modals';

const db = getFirestore(app);
const auth = getAuth(app);

export default function LogIn() {
  // Global Variables
  const router = useRouter(); // Using Expo Router
  const { out } = useLocalSearchParams(); // Logout Message Container
  // Local Variables
  const [form, setForm] = useState({ username: '', password: '' }); // Username and Password Form
  const [loading, setLoading] = useState(false); // Loading Variable
  const [showPassword, setshowPassword] = useState(true); // Toggle Show Password
  const [isShown, setShown] = useState(false); // Flag Tracker if Logout is Shown
  // Modal Variables
  const [isSuccessVisible, setSuccessVisible] = useState(false); // Success Variable Visibility
  const [successForm, setSuccessForm] = useState({ title: 'Login Success!', description: '' }); // Success Form and Data Container
  const [isFailedVisible, setFailedVisible] = useState(false); // Failed Variable Visibility
  const [failedForm, setFailedForm] = useState({ title: 'Login Failed!', description: '' }); // Failed Form and Data Container
  // Reference Variables
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Allow the back button action when the component is mounted
  useEffect(() => {
    const backAction = () => {
        router.push("/");
        return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    // Cleanup the event listener when the component unmounts
    return () => backHandler.remove();
  }, [router]);

  // Display Logout Pop-up and Flag it
  useEffect(() => {
    if (out && !isShown) {
      try {
        const parsedOut = JSON.parse(out);
        setSuccessForm(parsedOut);
        setSuccessVisible(true);
        setShown(true);
      } catch (error) {
        console.error('Failed to parse out parameter', error);
      }
    }
  }, [out]);

  // Input Text Function
  const handleInputChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // Login Button Function
  const submit = async () => {
    const { username, password } = form;
    setLoading(true);

    try {
      // Query Firestore to find the user document with the given username
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Extract the user's email and full name from the document
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userEmail = userData.email;
        const firstName = userData.full_name.first_name;

        // Check if the user already has an active session token
        {/* if (userData.session_token) {
          setFailedForm({ title: 'Login Failed!', description: 'This user is already logged in on\nanother device.' })
          setFailedVisible(true);
          setLoading(false);
          return;
        } */}

        // Authenticate with Firebase Auth using the user's email and provided password
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
        const user = userCredential.user;

        if (user) {
          // Generate a new session token
          const sessionToken = uuid.v4();

          // Update the user document with the new session token
          await updateDoc(doc(db, 'users', userDoc.id), { session_token: sessionToken });

          router.push({ pathname: 'home/homes', params: { name: firstName } });
          setLoading(false);
        } else {
          setFailedForm({ title: 'Login Failed!', description: 'Incorrect username or password.' });
          usernameRef.current.focus();
          setFailedVisible(true);
          setLoading(false);
        }
      } else {
        setFailedForm({ title: 'Login Failed!', description: 'Incorrect username\nno email available.' });
        usernameRef.current.focus();
        setFailedVisible(true);
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);

      // Handle specific network error and other error cases
      if (e.code === 'auth/network-request-failed') {
        setFailedForm({ title: 'Network Error!', description: 'Please check your internet\nconnection and try again.' });
        setFailedVisible(true);
      } 
      // Handle invalid credential error
      else if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        setFailedForm({ title: 'Login Failed!', description: 'Invalid email or password.\nPlease try again.' });
        usernameRef.current.focus();
        setFailedVisible(true);
      }
      // Handle user not found error
      else if (e.code === 'auth/user-not-found') {
        setFailedForm({ title: 'Login Failed!', description: 'No user found with this username.' });
        usernameRef.current.focus();
        setFailedVisible(true);
      } else {
        // Handle other errors, such as incorrect password or user not found
        setFailedForm({ title: 'Login Error!', description: e.message })
        setFailedVisible(true);
        console.error('Error logging in: ', e.message);
      }
    }
  };
  
  // Close Success Modal
  const closeSModal = () => {
    setSuccessVisible(false)
  };

  // Close Failed Modal
  const closeFModal = () => {
    setFailedVisible(false)
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      {/* Modals */}
      <Failed visible={isFailedVisible} onClose={closeFModal} title={failedForm.title} description={failedForm.description} />
      <Success visible={isSuccessVisible} onClose={closeSModal} title={successForm.title} description={successForm.description} />
      <ScrollView>
        <View className="w-full justify-center min-h-[90vh] px-4">
          {/* GEOMAP Title Card */}
          <View className="items-center">
            <Image 
                source={images.title_w}
                className="w-[295px] h-[74px]"
                resizeMode='contain'
            />
          </View>
          {/* Login Body */}
          <View className="pt-[7%]">
            {/* Username Input */}
            <Text className="font-rmedium text-base text-white pb-[2%]">Username</Text>
            <View className="w-full h-16 bg-white rounded-2xl justify-center items-center px-4">
              <TextInput
                ref={usernameRef}
                className="w-full text-base font-rbase text-black pb-1"
                placeholder='Username'
                placeholderTextColor='#94A3B8'
                value={form.username}
                onChangeText={(text) => handleInputChange('username', text.replace(/\s/g, ''))}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current.focus()}
              /> 
            </View>
            {/* Password Input */}
            <Text className="font-rmedium text-base text-white pt-[4%] pb-[2%]">Password</Text>
            <View className="w-full h-16 bg-white rounded-2xl justify-center items-center flex-row px-[8%]">
              <TextInput
                ref={passwordRef}
                className="w-full text-base font-rbase text-black pb-1"
                placeholder='Password'
                placeholderTextColor='#94A3B8'
                secureTextEntry={showPassword}
                value={form.password}
                returnKeyType='done'
                onChangeText={(text) => handleInputChange('password', text.replace(/\s/g, ''))}
                onSubmitEditing={submit}
              />
              {/* Visible Password Button */}
              <TouchableOpacity onPress={() => setshowPassword(!showPassword)}>
                <Image 
                    tintColor="#57b378"
                    source={showPassword ? icons.eye : icons.eyeHide}
                    className="w-6 h-6"
                    resizeMode='contain'
                />
              </TouchableOpacity>
            </View>
            <View className="pt-[17%] w-full items-center">
              <TouchableHighlight underlayColor={"#FDFFAE"} className="w-2/3 h-12 rounded-3xl bg-white items-center justify-center" onPress={submit} disabled={loading}>
                {loading ? (<ActivityIndicator size="large" color="#57b378" />) : (<Text className="text-primary font-psemibold text-2xl">LOGIN</Text>)}
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Status Bar */}
      <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  );
}

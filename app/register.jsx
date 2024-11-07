import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, ScrollView, TouchableOpacity, TouchableHighlight, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { app, auth, db } from '../firebaseConfig';

import { icons } from '../constants';
import { Failed, Success, Terms } from '../components/modals';

const Register = () => {
  const router = useRouter();
  const auth = getAuth();

  const [userForm, setUserForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    birthdate: '',
    email: '',
    username: '',
    password: '',
    confirmPass: ''
  });

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

  const [error, setError] = useState(null);
  const [showPassword, setshowPassword] = useState(false); // For Hiding Password Input
  const [date, setDate] = useState(new Date()); // Today's Date
  const [showDate, setShowDate] = useState(false); // For Date Picking
  const [registerReq, setRegisterReq] = useState([]); // Check for Missing Register Fields
  const [loading, setLoading] = useState(false); // Loading Variable
  const [passwordsMatch, setPasswordsMatch] = useState(true); // See if Passwords match
  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const [isFailedVisible, setFailedVisible] = useState(false);
  const [isTermsVisible, setTermsVisible] = useState(false);
  const [failedForm, setFailedForm] = useState({ title: 'Registration Failed!', description: '' });
  const [successForm, setSuccessForm] = useState({ title: 'Registration Success!', description: '' });
  const [isTermsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (userForm.password && userForm.confirmPass) {
      const match = userForm.password === userForm.confirmPass;
      setPasswordsMatch(match);

      if (match) {
        setRegisterReq((prevReq) => prevReq.filter(req => req !== 'password' && req !== 'confirmPass'));
      } else {
        if (!registerReq.includes('password')) {
          setRegisterReq((prevReq) => [...prevReq, 'password']);
        }
        if (!registerReq.includes('confirmPass')) {
          setRegisterReq((prevReq) => [...prevReq, 'confirmPass']);
        }
      }
    }
  }, [userForm.password, userForm.confirmPass]);

  const handleInputChange = (field, value) => {
    setUserForm({ ...userForm, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDate(false); // Hide the picker after selecting a date
    setDate(currentDate); // Update the state with the selected date
    handleInputChange('birthdate', currentDate); // Update userForm state
  };

  const toggleDate = () => {
    setShowDate(true);
  };

  const handleTermsAccept = async () => {
    setTermsAccepted(true);
    setTermsVisible(false);
    await registerUser(); // Proceed with submission
  };

  // Get Valid Date
  const getValidDate = (dateValue) => {
    if (!dateValue) {
        return new Date(); // Return current date if no date is provided
    }
    if (dateValue instanceof Date) {
        return dateValue; // Return if already a Date object
    } else if (dateValue?.toDate) {
        return dateValue.toDate(); // Firestore Timestamp, convert to Date object
    } else if (typeof dateValue === 'string') {
        return new Date(dateValue); // String date, convert to Date object
    } else {
        return new Date(); // Default to the current date
    }
  };

  const generateUserId = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userCount = usersSnapshot.size;
    return `100-000-${String(userCount + 1).padStart(3, '0')}`;
  };

  const registerUser = async () => {
    const { email, password, confirmPass, username, firstName, middleName, lastName, address, phoneNumber, birthdate } = userForm;
    setLoading(true);

    // Create an array to store missing fields
    const missingFields = [];

    // Check each form field and add missing fields to the array
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!username) missingFields.push('username');
    if (!firstName) missingFields.push('firstName');
    if (!middleName) missingFields.push('middleName');
    if (!lastName) missingFields.push('lastName');
    if (!address) missingFields.push('address');
    if (!phoneNumber) missingFields.push('phoneNumber');
    if (!birthdate) missingFields.push('birthdate');

    // If there are any missing fields, show an alert and stop the registration process
    if (missingFields.length > 0) {
      setFailedForm({ title: 'Missing Information!', description: `Please complete all the fields.` })
      setFailedVisible(true);
      setRegisterReq(missingFields);
      setLoading(false);
      return; // Stop execution if there are missing fields
    }

    // Check if password and confirm password match
    if (password !== confirmPass) {
      setFailedForm({ title: 'Password Mismatch!', description: `Passwords do not match,\nplease try again.` })
      setFailedVisible(true);
      setRegisterReq(['password', 'confirmPass']);
      setLoading(false);
      return; // Stop execution if passwords don't match
    }

    // Format birthdate to YYYY-MM-DD
    const formattedBirthdate = new Date(birthdate).toISOString().slice(0, 10); // Extracts the date part (YYYY-MM-DD)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newUserId = await generateUserId();

      await setDoc(doc(db, 'users', user.uid), {
        user_id: newUserId,
        uid: user.uid,
        type: "community",
        full_name: {
          last_name: lastName,
          first_name: firstName,
          middle_name: middleName,
        },
        username: username,
        address: address,
        phone_number: phoneNumber,
        birthdate: formattedBirthdate,
        email: email,
        photo_id: null,
        session_token: null,
        reports: 0
      });

      Alert.alert(`Welcome ${firstName}`, `Your username is ${username}`);
      // Clear all input fields
      setUserForm({
        email: '',
        password: '',
        username: '',
        firstName: '',
        middleName: '',
        lastName: '',
        address: '',
        phoneNumber: '',
        birthdate: '',
        confirmPass: ''
      });

      router.push('/log-in');
      setLoading(false);
    } catch (e) {
      setError(e.message);
      setFailedForm({ title: 'Registration Error!', description: e.message })
      setFailedVisible(true);
    }
  };

  const closeSModal = () => {setSuccessVisible(false)}
  const closeFModal = () => {setFailedVisible(false)}
  const closeTModal = () => {setTermsVisible(false)}

  return (
    <SafeAreaView className="w-full h-full bg-white">
      {/* Modals */}
      <Failed visible={isFailedVisible} onClose={closeFModal} title={failedForm.title} description={failedForm.description} />
      <Success visible={isSuccessVisible} onClose={closeSModal} title={successForm.title} description={successForm.description} />
      <Terms visible={isTermsVisible} onClose={closeTModal} onAccept={handleTermsAccept} page={'view2'} tab={'account'} />
      <ScrollView className="w-full h-full" contentContainerStyle={{ alignItems: 'center'}}>
        <View className="w-full h-full items-center">
          <Text className=" mt-10 mb-5 text-2xl text-primary text-semibold text-center font-pbold">REGISTRATION</Text>
          <View className="w-[93%] h-[0.2%] items-center justify-center bg-primary mb-5"/>
          <View className="w-[93%] justify-center">
            {/* First Name */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">First Name:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.firstName ? 'border-primary' : (registerReq.includes('firstName') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='First Name'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.firstName ? userForm.firstName : ''}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                />
            </View>
            {/* Middle Name */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Middle Name:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.middleName ? 'border-primary' : (registerReq.includes('middleName') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='Middle Name'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.middleName ? userForm.middleName : ''}
                    onChangeText={(value) => handleInputChange('middleName', value)}
                />
            </View>
            {/* Last Name */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Last Name:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.lastName ? 'border-primary' : (registerReq.includes('lastName') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='Last Name'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.lastName ? userForm.lastName : ''}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                />
            </View>
            {/* Address */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Address:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.address ? 'border-primary' : (registerReq.includes('address') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='Address'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.address ? userForm.address : ''}
                    onChangeText={(value) => handleInputChange('address', value)}
                />
            </View>
            {/* Birthdate */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Birthdate:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.birthdate ? 'border-primary' : (registerReq.includes('birthdate') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2 flex-row`}>
                <TextInput
                    className={`w-[95%] text-md font-pmedium ${!showDate ? "text-black" : "text-primary"}`}
                    placeholder='Birthdate'
                    editable={false}
                    placeholderTextColor='#94A3B8'
                    value={userForm?.birthdate
                        ? getValidDate(userForm.birthdate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '' } 
                />
                <TouchableOpacity onPress={toggleDate}>
                  <Image 
                    tintColor={userForm.birthdate ? "#57b378" : (registerReq.includes('birthdate') ? "#e11d47" : "#57b378")}
                    source={!showDate ? icons.editing : icons.edit}
                    className="w-6 h-6"
                    resizeMode='contain'
                  />
                </TouchableOpacity>
            </View>
            {showDate && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
            {/* Email */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Email:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.email ? 'border-primary' : (registerReq.includes('email') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='Email'
                    inputMode='email'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.email ? userForm.email : ''}
                    onChangeText={(value) => handleInputChange('email', value)}
                />
            </View>
            {/* Phone Number */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Phone Number:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.phoneNumber ? 'border-primary' : (registerReq.includes('phoneNumber') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='Phone Number'
                    inputMode='numeric'
                    maxLength={11}
                    placeholderTextColor='#94A3B8'
                    value={userForm?.phoneNumber ? userForm.phoneNumber : ''}
                    onChangeText={(value) => handleInputChange('phoneNumber', value)}
                />
            </View>
            {/* Username */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Username:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.username ? 'border-primary' : (registerReq.includes('username') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center px-4 mb-2`}>
                <TextInput
                    className="w-full text-md font-pmedium text-black"
                    placeholder='Username'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.username ? userForm.username : ''}
                    onChangeText={(value) => handleInputChange('username', value.replace(/\s/g, ''))}
                />
            </View>
            {/* Password */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Password:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.password ? (!passwordsMatch ? 'border-rose-600/75' : 'border-primary') : (registerReq.includes('password') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center flex-row px-4 mb-2`}>
                <TextInput
                    className="w-[95%] text-md font-pmedium text-black"
                    placeholder='Password'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.password ? userForm.password : ''}
                    onChangeText={(value) => handleInputChange('password', value.replace(/\s/g, ''))}
                    secureTextEntry={!showPassword}
                    textContentType='password'
                />
                <TouchableOpacity onPress={() => setshowPassword(!showPassword)}>
                    <Image 
                        tintColor={userForm.password ? (!passwordsMatch ? "#e11d47" : "#57b378") : (registerReq.includes('password') ? "#e11d47" : "#57b378")}
                        source={!showPassword ? icons.eye : icons.eyeHide}
                        className="w-6 h-6"
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>
            {/* Confirm Password */}
            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Confirm Password:</Text>
            <View className={`w-full h-16 bg-white rounded-2xl border-2 ${userForm.confirmPass ? (!passwordsMatch ? 'border-rose-600/75' : 'border-primary') : (registerReq.includes('confirmPass') ? 'border-rose-600/75' : 'border-primary')} justify-center items-center flex-row px-4 mb-2`}>
                <TextInput
                    className="w-[95%] text-md font-pmedium text-black"
                    placeholder='Confirm Password'
                    placeholderTextColor='#94A3B8'
                    value={userForm?.confirmPass ? userForm.confirmPass : ''}
                    onChangeText={(value) => handleInputChange('confirmPass', value.replace(/\s/g, ''))}
                    secureTextEntry={!showPassword}
                    textContentType='password'
                />
                <TouchableOpacity onPress={() => setshowPassword(!showPassword)}>
                    <Image 
                        tintColor={userForm.confirmPass ? (!passwordsMatch ? "#e11d47" : "#57b378") : (registerReq.includes('confirmPass') ? "#e11d47" : "#57b378")}
                        source={!showPassword ? icons.eye : icons.eyeHide}
                        className="w-6 h-6"
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>
          </View>
          {!passwordsMatch && <Text className="text-base text-rose-600/75 font-pregular">Please make sure passwords match</Text>}
          <View className="w-[93%] h-[0.2%] items-center justify-center bg-primary my-10"/>
          <TouchableHighlight underlayColor={"#86ebaa"} className="w-5/6 h-12 rounded-3xl bg-primary items-center justify-center mb-10" onPress={() => setTermsVisible(true)} disabled={loading}>
              {loading ? (<ActivityIndicator size="large" color="#ffffff" />) : (<Text className="text-white font-psemibold text-xl">REGISTER</Text>)}
          </TouchableHighlight>
        </View>
      </ScrollView>
      {/* Status Bar */}
      <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  );
};

export default Register;
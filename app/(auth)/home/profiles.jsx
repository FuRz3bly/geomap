import React, { useEffect, useContext, useState } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, TouchableHighlight, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from 'firebase/auth';
import { getStorage, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getFirestore, updateDoc, doc, getDoc, addDoc, getDocs, onSnapshot, collection, arrayUnion, query, where } from 'firebase/firestore';
import { storage, auth, db } from '../../../firebaseConfig'; 

import UserContext from '../../../components/UserContext';

import { images, icons } from '../../../constants';

const ProfileScreen = ({ changePage, backPage }) => {
    const { user, isResponder } = useContext(UserContext);
    const { width, height } = Dimensions.get('screen');
    const [amenity, setAmenity] = useState(null);
    const [profileOption, setProfileOption] = useState('profile');
    const [profileImage, setProfileImage] = useState(null);
    const [IDImage, setIDImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [applyRespo, setApplyRespo] = useState(false);
    const [date, setDate] = useState(new Date()); // Today's Date
    const [showDate, setShowDate] = useState(false); // For Date Picking
    const [userForm, setUserForm] = useState({
        user_id: '',
        rank: '',
        email: '',
        newEmail: '',
        password: '',
        username: '',
        password: '',
        full_name: {
            first_name: '',
            middle_name: '',
            last_name: ''
        },
        address: '',
        phone_number: '',
        birthdate: '',
        type: '',
        photo_id: null,
        // New fields
        amenity_id: '',
        amenity_key: null,
        on_duty: false,
    });
    const [allAmenity, setAllAmenity] = useState([]);
    const [filteredAmenities, setFilteredAmenities] = useState([]);
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [photoIDURI, setPhotoIDURI] = useState(null);
    const [editEmail, setEditEmail] = useState(false);
    const [hasRequested, setRequested] = useState(false);
    
    useEffect(() => {
        // Exit if `user` or `user.uid` is not defined
        if (!user || !user.uid) return;
    
        const db = getFirestore();
        const requestsRef = collection(db, 'request');
        const pendingQuery = query(
            requestsRef,
            where('user_uid', '==', user.uid),
            where('status', '==', 'pending')
        );
    
        // Set up a real-time listener for pending requests
        const unsubscribe = onSnapshot(
            pendingQuery,
            (querySnapshot) => {
                setRequested(!querySnapshot.empty); // `true` if pending requests exist
            },
            (error) => {
                console.error('Error checking pending requests:', error);
                setRequested(false); // Handle error case
            }
        );
    
        // Clean up the listener on component unmount or if user.uid changes
        return () => unsubscribe();
    }, [user]);    
    
    // Find User Amenity
    useEffect(() => {
        const user = auth.currentUser;
    
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const unsubscribeUser = onSnapshot(userRef, (userDoc) => {
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserForm(userData);
    
                    if (userData.profile) {
                        setProfileImage(userData.profile);
                    }

                    if (userData.photo_id) {
                        setIDImage(userData.photo_id);
                    }
    
                    if (userData.type === 'responder' && userData.amenity_id) {
                        const amenityRef = doc(db, 'amenity', userData.amenity_id);
                        const unsubscribeAmenity = onSnapshot(amenityRef, (doc) => {
                            if (doc.exists()) {
                                setAmenity(doc.data());
                            } else {
                                console.error("No such document!");
                            }
                        });
    
                        // Clean up amenity subscription
                        return () => unsubscribeAmenity();
                    }
                } else {
                    console.error("No such user document!");
                }
            });
    
            // Clean up user subscription
            return () => unsubscribeUser();
        }
    }, [auth]);

    useEffect(() => {
        // Real-time listener for all amenities
        const amenitiesRef = collection(db, 'amenity');
        const unsubscribeAmenities = onSnapshot(amenitiesRef, (snapshot) => {
            const amenitiesList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllAmenity(amenitiesList);
        });

        // Cleanup function
        return () => unsubscribeAmenities();
    }, [db]);

    useEffect(() => {
        const filtered = allAmenity.filter((amenity) =>
            amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amenity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amenity.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredAmenities(filtered);
    }, [searchQuery, allAmenity]);

    // Allow the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            if (applyRespo) {
                setApplyRespo(false);
                return true;
            } else {
                backPage();
                //changePage('home/homes');
            }
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, [applyRespo]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    const formatNumber = (phoneNumber) => {
        if (!phoneNumber) {
          return '';
        }

        let formattedNumber;

        // Check if the phone number starts with '0'
        if (phoneNumber.startsWith('0')) {
          formattedNumber = phoneNumber.replace(/^0/, '(+63)-');
        } else {
          formattedNumber = `(+63)-${phoneNumber}`;
        }
      
        // Insert hyphens at the desired positions
        return formattedNumber.replace(/(\d{3})[- ]?(\d{3})[- ]?(\d{4})/, '$1-$2-$3');
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0]);
        }
    };
    
    const uploadImage = async (asset) => {
        setUploading(true);
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const storageRef = ref(storage, `users/${user.uid}/profile`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        // Update the user's profile image URL in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { profile: url });

        setProfileImage(url);
        setUploading(false);
    };

    const handleIDPick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [856, 540], // Square aspect for ID card size
            quality: 1,
        });
    
        if (!result.canceled) {
            const pickedImageUri = result.assets[0].uri;
            const fileName = pickedImageUri.split('/').pop(); // Get file name from the URI
    
            // Update userForm with file name and prepare for upload
            setUserForm((prevState) => ({
                ...prevState,
                photo_id: fileName,
            }));
    
            // Prepare image for upload (store URI or other data if needed for upload)
            setPhotoIDURI(pickedImageUri);
        }
    };

    const handleInputChange = (field, value) => {
        setUserForm((prevState) => ({
            ...prevState,
            ...(field.includes('.') 
                ? { 
                    [field.split('.')[0]]: { 
                        ...prevState[field.split('.')[0]], 
                        [field.split('.')[1]]: value 
                    } 
                  }
                : { [field]: value }
            ),
        }));
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleSelectAmenity = (amenity) => {
        setSelectedAmenity(amenity);
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

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDate(false); // Hide the picker after selecting a date
        setDate(currentDate); // Update the state with the selected date
        handleInputChange('birthdate', currentDate); // Update userForm state
    };

    const registerResponder = async () => {
        const db = getFirestore();
    const storage = getStorage();

    try {
        const updatedUserId = userForm.user_id.replace(/^1/, '2'); // Replace starting '1' with '2'
        const updatedUsername = `${userForm.username}@respo`;
        const amenityID = selectedAmenity?.id;
        const { address, birthdate, full_name, phone_number, rank, newEmail, email, password } = userForm;

        // Upload photo_id if it exists and get the download URL
        let photoURL = null;
        if (photoIDURI) {
            const photoRef = ref(storage, `users/${updatedUserId}/id`);
            try {
                const response = await fetch(photoIDURI);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                await uploadBytes(photoRef, blob);
                photoURL = await getDownloadURL(photoRef);
            } catch (fetchError) {
                console.error('Error fetching photo ID:', fetchError);
                throw fetchError;
            }
        }

        // Create a request document in the "requests" collection
        await addDoc(collection(db, 'request'), {
            type: 'responder',
            user_id: updatedUserId,
            username: updatedUsername,
            address,
            birthdate,
            full_name,
            phone_number,
            rank,
            photo_id: photoURL,
            amenity_id: amenityID,
            amenity_key: null,
            on_duty: false,
            email: newEmail || email, // use newEmail if it's present
            status: 'pending', // Add a status field to track request state
            createdAt: new Date(),
            user_uid: userForm.uid // Keep reference to the user ID
        });

        setApplyRespo(false);
        console.log('Responder request created successfully.');

        } catch (error) {
            console.error('Error creating responder request:', error);
        }
    };

    return (
        <SafeAreaView className="bg-white w-full h-[110%] items-center -top-[5%]">
            {applyRespo ? (
                <>
                    <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                        <View className="w-full min-h-[90vh] items-center mt-[15%]">
                            <View className="w-[93%] justify-center">
                                {/* User Details */}
                                <Text className="font-pmedium text-lg text-black text-center">{'User Details'}</Text>
                                {/* First Name */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'First Name:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='First Name'
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.full_name?.first_name ? userForm.full_name.first_name : ''}
                                        onChangeText={(value) => handleInputChange('full_name.first_name', value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={userForm?.full_name?.first_name ? icons.check : null}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Middle Name */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Middle Name:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='Middle Name'
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.full_name?.middle_name ? userForm.full_name.middle_name : ''}
                                        onChangeText={(value) => handleInputChange('full_name.middle_name', value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={userForm?.full_name?.middle_name ? icons.check : null}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Last Name */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Last Name:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='Last Name'
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.full_name?.last_name ? userForm.full_name.last_name : ''}
                                        onChangeText={(value) => handleInputChange('full_name.last_name', value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={userForm?.full_name?.last_name ? icons.check : null}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Address */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Address:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='Address'
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.address ? userForm.address : ''}
                                        onChangeText={(value) => handleInputChange('address', value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={userForm?.address ? icons.check : null}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Birthdate */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Birthdate:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className={`w-[95%] text-base font-pregular ${!showDate ? "text-black" : "text-primary"}`}
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
                                    <TouchableOpacity onPress={() => setShowDate(true)}>
                                        <Image 
                                            tintColor={"#57b378"}
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
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Email:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 ${editEmail ? 'border-slate-400' : 'border-primary'} justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className={`w-[80%] text-base font-pregular ${editEmail ? 'text-slate-400' : 'text-black'}`}
                                        placeholder='Email'
                                        inputMode='email'
                                        editable={false}
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.email ? userForm.email : ''}
                                        onChangeText={(value) => handleInputChange('email', value)}
                                    />
                                    <View className="w-[10%] h-full items-center justify-center">
                                        <Image 
                                            tintColor={userForm?.email ? "#57b378" : "#ef4444"}
                                            source={userForm?.email && !editEmail ? icons.check : icons.important}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <TouchableOpacity onPress={() => setEditEmail(!editEmail)}>
                                            <Image 
                                                tintColor={"#57b378"}
                                                source={!editEmail ? icons.editing : icons.edit}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* Edit Email */}
                                {editEmail && (
                                    <>
                                        {/* New Email */}
                                        <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'New Email:'}</Text>
                                        <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                            <TextInput
                                                className="w-[90%] text-base font-pregular text-black"
                                                placeholder='Email'
                                                placeholderTextColor='#94A3B8'
                                                value={userForm?.newEmail ? userForm.newEmail : ''}
                                                onChangeText={(value) => handleInputChange('newEmail', value)}
                                            />
                                            <View className="w-[10%] h-full items-end justify-center">
                                                <Image 
                                                    tintColor={userForm?.newEmail ? "#57b378" : "#ef4444"}
                                                    source={userForm?.newEmail ? icons.check : icons.important}
                                                    className="w-[50%] h-[50%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                        </View>
                                        {/* Password */}
                                        <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Current Password:'}</Text>
                                        <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                            <TextInput
                                                className="w-[90%] text-base font-pregular text-black"
                                                placeholder='Password'
                                                placeholderTextColor='#94A3B8'
                                                value={userForm?.password ? userForm.password : ''}
                                                onChangeText={(value) => handleInputChange('password', value)}
                                            />
                                            <View className="w-[10%] h-full items-end justify-center">
                                                <Image 
                                                    tintColor={userForm?.password ? "#57b378" : "#ef4444"}
                                                    source={userForm?.password ? icons.check : icons.important}
                                                    className="w-[50%] h-[50%]"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}
                                {/* Phone Number */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Phone Number:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='Phone Number'
                                        inputMode='numeric'
                                        maxLength={11}
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.phone_number ? userForm.phone_number : ''}
                                        onChangeText={(value) => handleInputChange('phone_number', value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={userForm?.full_name?.last_name ? icons.check : null}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Username */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Username:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[65%] text-base font-pregular text-black"
                                        placeholder='Username'
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.username ? userForm.username : ''}
                                        onChangeText={(value) => handleInputChange('username', value.replace(/\s/g, ''))}
                                    />
                                    <View className="w-[25%] h-full items-end justify-center">
                                        <Text className="font-pregular text-base text-slate-400">{'@respo'}</Text>
                                    </View>
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={userForm?.full_name?.last_name ? icons.check : null}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Photo ID */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'ID Photo:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary mb-2`}>
                                    <TouchableOpacity className="w-full h-full rounded-2xl justify-center items-center px-4 flex-row" onPress={handleIDPick}>
                                        <TextInput
                                            className="w-[80%] text-base font-pregular text-black"
                                            placeholder='ID Photo'
                                            placeholderTextColor='#94A3B8'
                                            value={userForm?.photo_id ? userForm.photo_id : ''}
                                            editable={false}
                                            onChangeText={(value) => handleInputChange('photo_id', value.replace(/\s/g, ''))}
                                        />
                                        <View className="w-[10%] h-full items-center justify-center">
                                            <Image 
                                                tintColor={userForm?.photo_id ? "#57b378" : "#ef4444"}
                                                source={userForm?.photo_id ? icons.check : icons.important}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[10%] h-full items-end justify-center">
                                            <Image 
                                                tintColor={"#57b378"}
                                                source={icons.editing}
                                                className="w-[70%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View className="w-full h-[1px] items-center justify-center bg-primary my-4"/>
                                {/* Amenity Details */}
                                <Text className="font-pmedium text-lg text-black text-center mb-4">{'Amenity Details'}</Text>
                                {/* Rank */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Rank / Position:'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='Rank or Position'
                                        placeholderTextColor='#94A3B8'
                                        value={userForm?.rank ? userForm.rank : ''}
                                        onChangeText={(value) => handleInputChange('rank', value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={userForm?.rank ? "#57b378" : "#ef4444"}
                                            source={userForm?.rank ? icons.check : icons.important}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {/* Amenity Search */}
                                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Amenity Search'}</Text>
                                <View className={`w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center px-4 mb-2 flex-row`}>
                                    <TextInput
                                        className="w-[90%] text-base font-pregular text-black"
                                        placeholder='Search Amenity'
                                        placeholderTextColor='#94A3B8'
                                        value={searchQuery}
                                        onChangeText={(value) => handleSearchChange(value)}
                                    />
                                    <View className="w-[10%] h-full items-end justify-center">
                                        <Image 
                                            tintColor={"#57b378"}
                                            source={icons.search}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                                {searchQuery.length > 0 && (
                                    <>
                                        <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{`Results (${filteredAmenities.length})`}</Text>
                                        <View className="w-full h-48">
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center',}}>
                                                {filteredAmenities.length > 0 ? filteredAmenities.map((amenity) => (
                                                    <View key={amenity.id} className={`w-36 h-full ${selectedAmenity?.id === amenity?.id ? "bg-primary" : "bg-white border-2 border-primary"} rounded-2xl px-2 mr-1`}>
                                                        <TouchableOpacity className="w-full h-full justify-center" onPress={() => handleSelectAmenity(amenity)}>
                                                            {/* Name and Description */}
                                                            <Text className={`font-pbold text-sm ${selectedAmenity?.id === amenity?.id ? "text-white" : "text-black"}`}>{`${amenity.name} ${amenity.description}`}</Text>
                                                            {/* Address */}
                                                            <Text className={`font-pregular text-sm ${selectedAmenity?.id === amenity?.id ? "text-slate-200" : "text-slate-400"} mt-2`} numberOfLines={3} ellipsizeMode="tail">{amenity.address}</Text>
                                                            {/* Number of Responders */}
                                                            <Text className={`font-pregular text-sm ${selectedAmenity?.id === amenity?.id ? "text-white" : "text-slate-500"} mt-2`}>{`Responders: ${amenity.responders ? amenity.responders.length : 0}`}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )) : (
                                                    <View className="w-36 h-full bg-white border-2 border-primary rounded-2xl px-2 mr-1">
                                                        <TouchableOpacity className="w-full h-full justify-center">
                                                            <Text className="font-pmedium text-sm text-black">{'No Results'}</Text>
                                                            <Text className="font-pregular text-sm text-slate-400 mt-2" numberOfLines={3} ellipsizeMode='tail'>{'Register Your Amenity'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </ScrollView>
                                        </View>
                                    </>
                                )}
                                <View className="w-full h-36"/>
                            </View>
                        </View>
                    </ScrollView>
                    <View className="w-full h-[10%] absolute bottom-[5%] items-center justify-center border-t-[1px] border-primary bg-white flex-row">
                        {/* Back Button */}
                        <View className="w-[20%] h-full items-center justify-center">
                            <TouchableHighlight underlayColor={'#3b8a57'} className="w-[60%] h-[60%] items-center justify-center bg-primary rounded-full" onPress={() => setApplyRespo(false)}>
                                <Image 
                                    tintColor={"#ffffff"}
                                    source={icons.prevBtn}
                                    className="w-[40%] h-[40%]"
                                    resizeMode='contain'
                                />
                            </TouchableHighlight>
                        </View>
                        {/* Page Title */}
                        <View className="w-[60%] h-full items-center justify-center">
                            <Text className="text-2xl text-primary text-semibold text-center font-pbold">{'APPLICATION'}</Text>
                        </View>
                        {/* Submit Button */}
                        <View className="w-[20%] items-center justify-center h-full">
                            <TouchableHighlight 
                                underlayColor={'#3b8a57'} 
                                className={`w-[60%] h-[60%] items-center justify-center ${!userForm.email || !userForm.rank || !photoIDURI || !selectedAmenity ? 'bg-primary-hidden' : 'bg-primary'} rounded-full`}
                                disabled={!userForm.email || !userForm.rank || !photoIDURI || !selectedAmenity}
                                onPress={registerResponder}
                            >
                                <Image 
                                    tintColor={"#ffffff"}
                                    source={icons.check}
                                    className="w-[40%] h-[40%]"
                                    resizeMode='contain'
                                />
                            </TouchableHighlight>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    {/* Header Style */}
                    <View className={`absolute ${height < 900 ? "-top-[66%]" : "-top-[50%]"} inset-0 -z-10 w-[600px] h-[600px] bg-primary rounded-full`} />
                    {/* Profile Icon */}
                    <View className={`w-[80%] h-[19%] absolute ${profileOption === 'profile' ? 'top-[10%]' : 'top-[8%] justify-end'} inset-0 items-center`}>
                        {profileOption === 'profile' ? (
                            <View className={`${height < 900 ? "w-28 h-28" : "w-32 h-32"} z-20 bg-white rounded-full`}>
                                <TouchableOpacity className="w-full h-full items-center justify-center" onPress={pickImage} disabled={uploading}>
                                    {uploading ? (
                                        <ActivityIndicator size={'LARGE'} color="#57b378" />
                                    ) : (
                                        <>
                                            {profileImage ? (
                                                <Image
                                                    source={{ uri: profileImage }}
                                                    className={`w-full h-full rounded-full`}
                                                    resizeMode='cover'
                                                />
                                            ) : (
                                                <Image
                                                    tintColor="#57b378"
                                                    source={isResponder ? icons.profileRespo : icons.profile}
                                                    className={`w-[80%] h-[80%]`}
                                                    resizeMode='contain'
                                                />
                                            )}
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className={`w-[57%] h-[90%] z-10 bg-white border-8 border-white items-center justify-center`}>
                                {IDImage ? (
                                    <Image
                                        source={{ uri: IDImage }}
                                        className={`w-full h-full`}
                                        resizeMode='contain'
                                    />
                                ) : (
                                    <View className="w-full h-full items-center justify-center bg-primary">
                                        <Image
                                            tintColor="#ffffff"
                                            source={isResponder ? icons.profileIDRespo : icons.profileID}
                                            className={`w-[60%] h-[70%]`}
                                            resizeMode='contain'
                                        />
                                    </View>
                                )}
                                    
                            </View>
                        )}
                        {/* Border */}
                        {!profileImage && <View className={`${height < 900 ? "w-32 h-32" : "w-36 h-36"} absolute -top-[5%] items-center justify-center bg-primary rounded-full`} />}
                    </View>
                    {/* Change Profile Option */}
                    <View className={`w-14 h-14 absolute ${profileOption === 'profile' ? 'top-[20%] right-[30%]' : 'top-[21%] right-[18%]'} bg-white rounded-full items-center justify-center z-30`}>
                        <TouchableHighlight className="w-[70%] h-[70%] items-center justify-center bg-primary rounded-full" underlayColor={'#3b8a57'} onPress={() => setProfileOption(profileOption === 'profile' ? 'ID' : 'profile')}>
                            <Image 
                                tintColor="#ffffff"
                                source={icons.refresh}
                                className="w-[50%] h-[50%]"
                                resizeMode='contain'
                            />
                        </TouchableHighlight>
                    </View>
                    {/* User Full Name and ID */}
                    <View className="w-[60%] absolute top-[27%] inset-0 items-center">
                        {user ? (
                            <>
                                <Text className="text-xl font-rbold text-black" numberOfLines={1} ellipsizeMode='tail'>
                                    {user.full_name.first_name} {user.full_name.last_name}
                                </Text>
                                <Text className="text-sm font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                    {`RID #${user.user_id}`}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-xl font-rbold text-black" numberOfLines={1} ellipsizeMode='tail'>
                                    {'No User Found'}
                                </Text>
                            </>
                        )}
                    </View>
                    {!isResponder && (
                    <View className="w-2/5 h-[6%] absolute top-[35%] right-[2%] z-20 items-end justify-center">
                        {hasRequested ? (
                            <View className="bg-slate-400 px-4 py-1 rounded-2xl flex-row items-center">
                                <Image
                                    tintColor={'#ffffff'}
                                    source={icons.recentP}
                                    className="w-4 h-4 mr-2"
                                    resizeMode='contain'
                                />
                                <Text className="text-sm font-rbase text-white">{'Pending Request'}</Text>
                            </View>
                        ) : (
                            <TouchableHighlight className="bg-primary px-4 py-1 rounded-2xl" underlayColor={'#3b8a57'} onPress={() => setApplyRespo(true)} disabled={hasRequested}>
                                <Text className="text-sm font-rbase text-white">{'Apply as Responder'}</Text>
                            </TouchableHighlight>
                        )}
                    </View>
                    )}
                    {/* Body Container */}
                    {user ? (
                        <>
                            <View className={`w-full h-[62%] absolute top-[38%] inset-0 items-center`}>
                                <View className="z-10 absolute -top-3 left-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                    <Text className="text-base font-rmedium text-primary">USER DETAILS</Text>
                                </View>
                                <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Username */}
                                    <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row">
                                        <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                            <Text className="text-base font-rbase text-primary">Username</Text>
                                        </View>
                                        <View className="w-[25%] h-full items-center justify-center">
                                            <Image 
                                                tintColor="#57b378"
                                                source={icons.username}
                                                className="w-[35%] h-[35%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[75%] h-full justify-center">
                                            <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                {user.username}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Account Type */}
                                    <View className="w-full h-16 -z-10 border-y-0.5 border-y-primary items-center flex-row">
                                        <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                            <Text className="text-base font-rbase text-primary">{'Account Type'}</Text>
                                        </View>
                                        <View className="w-[25%] h-full items-center justify-center">
                                            <Image 
                                                tintColor="#57b378"
                                                source={icons.settings}
                                                className="w-[40%] h-[40%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[75%] h-full justify-center">
                                            <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Birthday */}
                                    <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row">
                                        <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                            <Text className="text-base font-rbase text-primary">Birthdate</Text>
                                        </View>
                                        <View className="w-[25%] h-full items-center justify-center">
                                            <Image 
                                                tintColor="#57b378"
                                                source={icons.birthdate}
                                                className="w-[30%] h-[30%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[75%] h-full justify-center">
                                            <Text className="text-lg font-pregular text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                {formatDate(user.birthdate)}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Email */}
                                    <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row">
                                        <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                            <Text className="text-base font-rbase text-primary">Email</Text>
                                        </View>
                                        <View className="w-[25%] h-full items-center justify-center">
                                            <Image 
                                                tintColor="#57b378"
                                                source={icons.email}
                                                className="w-[30%] h-[30%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[75%] h-full justify-center">
                                            <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                {user.email}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Phone Number */}
                                    <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row">
                                        <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                            <Text className="text-base font-rbase text-primary">Phone Number</Text>
                                        </View>
                                        <View className="w-[25%] h-full items-center justify-center">
                                            <Image 
                                                tintColor="#57b378"
                                                source={icons.phone}
                                                className="w-[40%] h-[40%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[75%] h-full justify-center">
                                            <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                {formatNumber(user.phone_number)}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Address */}
                                    <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row">
                                        <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                            <Text className="text-base font-rbase text-primary">Address</Text>
                                        </View>
                                        <View className="w-[25%] h-full items-center justify-center">
                                            <Image 
                                                tintColor="#57b378"
                                                source={icons.address}
                                                className="w-[40%] h-[40%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="w-[75%] h-full justify-center">
                                            <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                {user.address}
                                            </Text>
                                        </View>
                                    </View>
                                    {isResponder ? (
                                        <>
                                            {/* Amenity Name */}
                                            <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row mb-10">
                                                <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                                    <Text className="text-base font-rbase text-primary">{'Station'}</Text>
                                                </View>
                                                <View className="w-[25%] h-full items-center justify-center">
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={icons.onDuty}
                                                        className="w-[40%] h-[40%]"
                                                        resizeMode='contain'
                                                    />
                                                </View>
                                                <View className="w-[75%] h-full justify-center">
                                                    <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                        {amenity?.name}
                                                    </Text>
                                                </View>
                                            </View>
                                        </>
                                    ) : (
                                        <>
                                            {/* Reports */}
                                            <View className="w-full h-16 border-b-0.5 border-primary items-center flex-row mb-10">
                                                <View className="z-10 absolute -bottom-3 right-2 bg-white px-2 border-0.5 border-primary rounded-2xl">
                                                    <Text className="text-base font-rbase text-primary">{'Total Reports'}</Text>
                                                </View>
                                                <View className="w-[25%] h-full items-center justify-center">
                                                    <Image 
                                                        tintColor="#57b378"
                                                        source={icons.report}
                                                        className="w-[40%] h-[40%]"
                                                        resizeMode='contain'
                                                    />
                                                </View>
                                                <View className="w-[75%] h-full justify-center">
                                                    <Text className="text-lg font-rbase text-white-200" numberOfLines={1} ellipsizeMode='tail'>
                                                        {String(user.reports !== undefined ? user.reports : 0).padStart(3, '0')}
                                                    </Text>
                                                </View>
                                            </View>
                                        </>
                                    )}
                                </ScrollView>
                            </View>
                        </>
                    ) : (
                        <Text className="font-rbase text-white text-lg">No user is logged in.</Text>
                    )}
                </>
            )}
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    )
};

export default ProfileScreen;
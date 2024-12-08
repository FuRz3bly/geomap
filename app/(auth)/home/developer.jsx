import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Button, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';
import { Warning, Menu, Response, Arrival, Pins } from '../../../components/modals';
import { router } from 'expo-router';

import { images, icons } from '../../../constants';

import { collection, onSnapshot, getFirestore, doc, getDoc, addDoc, updateDoc, arrayUnion, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const DeveloperScreen = () => {
    const [requests, setRequests] = useState([]);
    const [requestVisible, setRequestVisible] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [questionVisible, setQuestionVisible] = useState(false);
    const [amenityForm, setAmenityForm] = useState({
        address: '',
        amenity_key: null,
        description: '',
        hours: {
            everyday: false
        },
        key_date: null,
        location: {
            latitude: 0,
            longitude: 0
        },
        name: '',
        phone: [''],
        responders: [],
        services: [
            { firetruck: false },
            { ambulance: false }
        ],
        type: ''
    });
    const [amenityVisible, setAmenityVisible] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setAmenityForm(prevState => ({
            ...prevState,
            location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }
            }));
        })();
    }, []);

    const formatTimestamp = (timestamp) => {
        if (!timestamp || typeof timestamp.seconds !== 'number' || typeof timestamp.nanoseconds !== 'number') {
          return 'Invalid date';
        }
        
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString(undefined, options);
    };

    // Back Button Functionality
    useEffect(() => {
        const backAction = () => {
            router.push('home/homes');
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, [router]);

    // Real-time listener on Request Collection
    useEffect(() => {
        const db = getFirestore();
        const requestsRef = collection(db, 'request');

        const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(fetchedRequests);
        }, (error) => {
            console.error("Error fetching requests:", error);
        });

        return () => unsubscribe();
    }, []);

    // Real-time listener on Questions Collection
    useEffect(() => {
        const db = getFirestore();
        const questionsRef = collection(db, 'questions');

        const unsubscribe = onSnapshot(questionsRef, (snapshot) => {
            const fetchedQuestions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQuestions(fetchedQuestions);
        }, (error) => {
            console.error("Error fetching questions:", error);
        });

        return () => unsubscribe();
    }, []);

    // Approve a request
    const handleApprove = async (request, requestId) => {
        const db = getFirestore();
        const requestRef = doc(db, 'request', requestId);
    
        try {
            // Approve the request
            await updateDoc(requestRef, { status: 'approved' });
            console.log(`Request ${requestId} approved.`);
    
            // Apply changes to the user based on request data
            await applyChangesToUser(request);
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    // Reject a request
    const handleReject = async (requestId) => {
        const db = getFirestore();
        const requestRef = doc(db, 'request', requestId);

        try {
            await updateDoc(requestRef, { status: 'rejected' });
            console.log(`Request ${requestId} rejected.`);
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const applyChangesToUser = async (request) => {
        const db = getFirestore();
        const userRef = doc(db, 'users', request.user_uid);

        try {
            // Update Firestore with the new fields from the request
            await updateDoc(userRef, {
                type: request.type,
                user_id: request.user_id,
                username: request.username,
                address: request.address,
                birthdate: request.birthdate,
                full_name: {
                    first_name: request.full_name.first_name,
                    middle_name: request.full_name.middle_name,
                    last_name: request.full_name.last_name
                },
                phone_number: request.phone_number,
                rank: request.rank,
                photo_id: request.photo_id,
                amenity_id: request.amenity_id,
                amenity_key: null,
                on_duty: false
            });

            // Update the responders list for the amenity if it exists
            if (request.amenity_id) {
                const amenityRef = doc(db, 'amenity', request.amenity_id);
                await updateDoc(amenityRef, {
                    responders: arrayUnion({
                        user_id: request.user_id,
                        uid: request.user_uid,
                        full_name: request.full_name,
                        username: request.username,
                        phone_number: request.phone_number,
                        email: request.email
                    })
                });
            }

            console.log('User updated successfully as a responder.');
        } catch (error) {
            console.error('Error updating responder details:', error);
        }
    };

    const handleAmenityInputChange = (field, value) => {
        setAmenityForm(prevState => ({
          ...prevState,
          [field]: value
        }));
    };

    const toggleEveryday = () => {
        setAmenityForm(prevState => ({
          ...prevState,
          hours: {
            ...prevState.hours,
            everyday: !prevState.hours.everyday
          }
        }));
    };

    const toggleService = (service) => {
        setAmenityForm(prevState => ({
            ...prevState,
            services: prevState.services.map(svc => {
                // Check if the service key in the object matches the selected service
                const key = Object.keys(svc)[0];
                return key === service ? { [key]: true } : { [key]: false };
            })
        }));
    };       

    const handlePhoneChange = (index, value) => {
        const updatedPhones = [...amenityForm.phone];
        updatedPhones[index] = value;
        setAmenityForm(prevState => ({
          ...prevState,
          phone: updatedPhones
        }));
    };
    
    const addPhoneField = () => {
        setAmenityForm(prevState => ({
            ...prevState,
            phone: [...prevState.phone, '']
        }));
    };
    
    const removePhoneField = (index) => {
        const updatedPhones = [...amenityForm.phone];
        updatedPhones.splice(index, 1);
        setAmenityForm(prevState => ({
          ...prevState,
          phone: updatedPhones
        }));
    };

    const selectType = (type) => {
        setAmenityForm(prevState => ({
          ...prevState,
          type: prevState.type === type ? '' : type
        }));
    };

    const submit = async () => {
        try {
            // Reference to the 'amenity' collection
            const amenityRef = collection(db, 'amenity');
    
            // Transform the `services` array to only include selected services
            const servicesData = amenityForm.services.reduce((acc, serviceObj) => {
                const key = Object.keys(serviceObj)[0];
                if (serviceObj[key]) acc.push({ [key]: true });
                return acc;
            }, []);
    
            // Add a new document with amenityForm data, using the transformed `services` array
            const docRef = await addDoc(amenityRef, {
                ...amenityForm,
                services: servicesData.length > 0 ? servicesData : amenityForm.services  // Preserve original format if no service is selected
            });
    
            // Update the document with its generated ID
            await updateDoc(doc(db, 'amenity', docRef.id), { amenity_id: docRef.id });
    
            // Reset amenityForm
            setAmenityForm({
                address: '',
                amenity_key: '',
                description: '',
                hours: {
                    everyday: false
                },
                key_date: null,
                location: {
                    latitude: 0,
                    longitude: 0
                },
                name: '',
                phone: [''],
                responders: [],
                services: [
                    { firetruck: false },
                    { ambulance: false }
                ],
                type: ''
            });
    
            console.log('Amenity added successfully with ID:', docRef.id);
        } catch (error) {
            console.error('Error adding amenity:', error);
        }
    };    

    return (
        <SafeAreaView className="w-full h-[110%] bg-white justify-center items-center">
            <View className="w-full h-full bg-white">
                <ScrollView showsVerticalScrollIndicator={true} className="w-full h-full bg-white" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                    {/* Title */}
                    <View className="w-full h-16 items-center mb-2 flex-row">
                        <Text className="w-[70%] font-pmedium text-xl text-black pt-[5%] pb-[3%] px-6">{'REQUESTS'}</Text>
                        <TouchableOpacity className="w-[30%] h-12 items-center justify-center" onPress={() => setRequestVisible(!requestVisible)}>
                            <Image 
                                tintColor={'#000000'}
                                source={requestVisible ? icons.expandUp : icons.expandDown}
                                className="w-[20%] h-[20%]"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Request Collection */}
                    {requestVisible && <View className="w-[95%] h-fit border-[1px] border-slate-500">
                        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-fit max-h-80" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {requests.map((request) => (
                                <View key={request.id} className="w-full border-b-[1px] border-slate-400 p-4 flex-row">
                                    <View className="w-[85%]">
                                        <Text className="text-black font-rmedium">{`${request.id}`}</Text>
                                        <Text className="text-black font-rbase">{`UID: ${request.user_uid}`}</Text>
                                        <Text className="text-black font-rbase">{`Status: ${request.status}`}</Text>
                                        <Text className="text-black font-rbase">{`Email: ${request.email}`}</Text>
                                        <Text className="text-black font-rbase">{`Phone Number: ${request.phone_number}`}</Text>
                                        <Text className="text-black font-rbase">{`Rank: ${request.rank}`}</Text>
                                        {request.photo_id && (
                                            <Image 
                                                source={{ uri: request.photo_id }}
                                                style={{ width: 200, height: 150, marginVertical: 10, borderRadius: 10 }}
                                                resizeMode="cover"
                                            />
                                        )}
                                    </View>
                                    {request.status === 'pending' ? (
                                        <View className="w-[15%] items-center justify-evenly">
                                            <View className="w-12 h-12 bg-green-400 rounded-full">
                                                <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => handleApprove(request, request.id)}>
                                                    <Image 
                                                        tintColor={'#ffffff'}
                                                        source={icons.check}
                                                        className="w-[50%] h-[50%]"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View className="w-12 h-12 bg-red-500 rounded-full">
                                                <TouchableOpacity className="w-full h-full items-center justify-center" onPress={() => handleReject(request.id)}>
                                                    <Image 
                                                        tintColor={'#ffffff'}
                                                        source={icons.close}
                                                        className="w-[50%] h-[50%]"
                                                        resizeMode='contain'
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <></>
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    </View>}
                    {/* Title */}
                    <View className="w-full h-16 items-center my-2 flex-row">
                        <Text className="w-[70%] font-pmedium text-xl text-black pt-[5%] pb-[3%] px-6">{'QUESTIONS'}</Text>
                        <TouchableOpacity className="w-[30%] h-12 items-center justify-center" onPress={() => setQuestionVisible(!questionVisible)}>
                            <Image 
                                tintColor={'#000000'}
                                source={questionVisible ? icons.expandUp : icons.expandDown}
                                className="w-[20%] h-[20%]"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Questions Collection */}
                    {questionVisible && <View className="w-[95%] h-fit border-[1px] border-slate-500">
                        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-fit max-h-80" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {questions.map((question) => (
                                <View key={question.id} className="w-full border-b-[1px] border-slate-400 p-4">
                                    <Text className="text-black font-rmedium">{`${question.id}`}</Text>
                                    <Text className="text-black font-rbase">{`Date: ${formatTimestamp(question.createdAt)}`}</Text>
                                    <Text className="text-black font-rbase">{`Name: ${question.name}`}</Text>
                                    <Text className="text-black font-rbase">{`UID: ${question.uid}`}</Text>
                                    <Text className="text-black font-rbase">{`Email: ${question.email}`}</Text>
                                    <Text className="text-black text-xl font-rmedium">{`${question.question}`}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>}
                    {/* Title */}
                    <View className="w-full h-16 justify-center my-2 flex-row">
                        <Text className="w-[70%] font-pmedium text-xl text-black pt-[5%] pb-[3%] px-6">{'ADD AMENITY'}</Text>
                        <TouchableOpacity className="w-[30%] h-12 items-center justify-center" onPress={() => setAmenityVisible(!amenityVisible)}>
                            <Image 
                                tintColor={'#000000'}
                                source={amenityVisible ? icons.expandUp : icons.expandDown}
                                className="w-[20%] h-[20%]"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Amenity Addition */}
                    {amenityVisible && <View className="w-[95%] h-fit border-[1px] border-slate-500">
                        <ScrollView showsVerticalScrollIndicator={true} className="w-full h-fit max-h-96" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {/* Name */}
                            <View className="w-full h-16 p-2 px-4 justify-center border-slate-400 border-b-[1px]">
                                {amenityForm.name && <Text className="text-black font-pmedium">{`Name`}</Text>}
                                <TextInput
                                    placeholder="Name"
                                    value={amenityForm.name}
                                    onChangeText={(value) => handleAmenityInputChange('name', value)}
                                    editable={true}
                                    className="text-base font-pregular text-black"
                                />
                            </View>
                            {/* Description */}
                            <View className="w-full h-16 p-2 px-4 justify-center border-slate-400 border-b-[1px]">
                                {amenityForm.description && <Text className="text-black font-pmedium">{`Description (Fire Substation / Police Substation)`}</Text>}
                                <TextInput
                                    placeholder="Description"
                                    value={amenityForm.description}
                                    onChangeText={(value) => handleAmenityInputChange('description', value)}
                                    editable={true}
                                    className="text-base font-pregular text-black"
                                />
                            </View>
                            {/* Address */}
                            <View className="w-full h-16 p-2 px-4 justify-center border-slate-400 border-b-[1px]">
                                {amenityForm.address && <Text className="text-black font-pmedium">{`Address`}</Text>}
                                <TextInput
                                    placeholder="Address"
                                    value={amenityForm.address}
                                    onChangeText={(value) => handleAmenityInputChange('address', value)}
                                    editable={true}
                                    className="text-base font-pregular text-black"
                                />
                            </View>
                            {/* Everyday */}
                            <View className="w-full h-16 p-2 px-4 items-center flex-row border-slate-400 border-b-[1px]">
                                <Text className="w-[60%] text-black font-pmedium">{`Is it Open 24/7?`}</Text>
                                <TouchableOpacity className="w-[40%] p-2 bg-primary rounded-3xl items-center justify-center" onPress={toggleEveryday}>
                                    <Text className="text-white text-base font-pmedium">{amenityForm.hours.everyday ? 'YES' : 'NO'}</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Service */}
                            <View className="w-full h-24 p-2 px-4 justify-center border-slate-400 border-b-[1px]">
                                <Text className="text-black font-pmedium">{`Services`}</Text>
                                <View className="w-full h-fit mt-2 flex-row items-center justify-between">
                                    <TouchableOpacity
                                        className={`w-[45%] p-2 ${amenityForm.services.find(svc => svc.firetruck)?.firetruck ? 'bg-primary' : 'bg-slate-400'} rounded-3xl items-center justify-center`}
                                        onPress={() => toggleService('firetruck')}
                                    >
                                        <Text className="text-white text-base font-pmedium">{'FIRETRUCK'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`w-[45%] p-2 ${amenityForm.services.find(svc => svc.ambulance)?.ambulance ? 'bg-primary' : 'bg-slate-400'} rounded-3xl items-center justify-center`}
                                        onPress={() => toggleService('ambulance')}
                                    >
                                        <Text className="text-white text-base font-pmedium">{'AMBULANCE'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {/* Phones Input */}
                            {amenityForm.phone.map((phone, index) => (
                            <View key={index} className="w-full h-16 p-2 px-4 border-slate-400 border-b-[1px] flex-row items-center">
                                <Text className="w-[20%] text-black font-pmedium">{`Phone ${index + 1}:`}</Text>
                                <TextInput
                                    placeholder={`Phone ${index + 1}`}
                                    value={phone}
                                    onChangeText={(value) => handlePhoneChange(index, value)}
                                    editable={true}
                                    className="w-[50%] text-base font-pregular text-black"
                                />
                                <TouchableOpacity className="w-[30%] p-2 bg-red-500 items-center justify-center rounded-3xl" onPress={() => removePhoneField(index)}>
                                    <Text className="text-white text-lg font-pmedium">{'REMOVE'}</Text>
                                </TouchableOpacity>
                            </View>
                            ))}
                            <TouchableOpacity onPress={addPhoneField} className="w-[96%] p-2 m-2 bg-primary items-center justify-center rounded-3xl">
                                <Text className="text-white text-lg font-rmedium">Add Phone</Text>
                            </TouchableOpacity>
                            <View className="w-full h-20 p-2 px-4 justify-center border-slate-400 border-b-[1px]">
                                <Text className="text-black font-rmedium">{`Type`}</Text>
                                <View className="w-full h-fit items-center justify-between">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center',}}>
                                        <TouchableOpacity className={`p-2 px-6 mr-3 ${amenityForm.type === 'fire_station' ? 'bg-primary' : 'bg-slate-400'} items-center justify-center rounded-3xl`} onPress={() => selectType('fire_station')}>
                                            <Text className="text-white text-sm font-pmedium">{'FIRE'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className={`p-2 px-6 mr-3 ${amenityForm.type === 'police' ? 'bg-primary' : 'bg-slate-400'} items-center justify-center rounded-3xl`} onPress={() => selectType('police')}>
                                            <Text className="text-white text-sm font-pmedium">{'POLICE'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className={`p-2 px-6 mr-3 ${amenityForm.type === 'disaster' ? 'bg-primary' : 'bg-slate-400'} items-center justify-center rounded-3xl`} onPress={() => selectType('disaster')}>
                                            <Text className="text-white text-sm font-pmedium">{'DISASTER'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className={`p-2 px-6 mr-3 ${amenityForm.type === 'barangay' ? 'bg-primary' : 'bg-slate-400'} items-center justify-center rounded-3xl`} onPress={() => selectType('barangay')}>
                                            <Text className="text-white text-sm font-pmedium">{'BARANGAY'}</Text>
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                            </View>
                            {/* Submit Button */}
                            <TouchableOpacity onPress={submit} className="w-[96%] p-2 m-2 bg-primary items-center justify-center rounded-3xl">
                                <Text className="text-white text-lg font-rmedium">{'SUBMIT'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

export default DeveloperScreen;
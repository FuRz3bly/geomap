import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import UserContext from '../../../components/UserContext';
import { translate } from '../../../components/ToolsContext';

import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../../../firebaseConfig';

const db = getFirestore(app);
const auth = getAuth(app);

import { images, icons } from '../../../constants';

const UserScreen = ({ data, changePage, backPage }) => {
    const { user, isResponder } = useContext(UserContext); // User Container
    const { width, height } = Dimensions.get('screen'); // Screen Width and Height
    // Local Variables
    const scrollRef = useRef(null); // Scroll View Reference
    const [expandDashboard, setExpandDashboard] = useState(false); // Expand Dashboard
    const [expandedStates, setExpandedStates] = useState(data.map(() => false));
    const [isEditing, setEditing] = useState(false); // Editing Function
    const [editUser, setEditUser] = useState(null); // Editing User
    const [updatedFields, setUpdatedFields] = useState({}); // Update User Fields
    const [showName, setShowName] = useState(false); // Display extra fields for First, Middle and Last Names
    const [showDate, setShowDate] = useState(false); // Display Birthdate Calendar Picker
    const [showType, setShowType] = useState(false); // Display Type Calendar Picker
    const [allAmenity, setAllAmenity] = useState([]);
    const [filteredAmenities, setFilteredAmenities] = useState([]);
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [saveLoading, setSaveLoading] = useState(false); // Save Loading
    const [showDisableOptions, setShowDisableOptions] = useState(false); // Visibility Disabled Options
    const [selectedDisableOptions, setSelectedDisableOptions] = useState('1-day'); // Days: 1-day, 2-days, 3-days
    const [resetLoading, setResetLoading] = useState(false); // If Reset Loading
    const [collapseActive, setCollapseActive] = useState(false); // Active Users Visibility
    const [collapseInactive, setCollapseInactive] = useState(false); // Inactive Users Visibility

    // Allow the back button action when the component is mounted
    useEffect(() => {
        const backAction = () => {
            if (isEditing) {
                setEditing(false);
                scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
                return true;
            } else {
                backPage();
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        // Cleanup the event listener when the component unmounts
        return () => backHandler.remove();
    }, [isEditing]);

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
    }, []);

    useEffect(() => {
        const filtered = allAmenity.filter((amenity) =>
            amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amenity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            amenity.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredAmenities(filtered);
    }, [searchQuery, allAmenity]);

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const handleSelectAmenity = (amenity) => {
        setSelectedAmenity(amenity);
    };

    // Enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Utility Functions
    // All Active Users
    const activeUsers = data
        .filter(user => user.session_token !== null)
        .sort((a, b) => a.full_name.last_name.localeCompare(b.full_name.last_name));
    // All Inactive Users
    const inactiveUsers = data
        .filter(user => user.session_token === null)
        .sort((a, b) => a.full_name.last_name.localeCompare(b.full_name.last_name));

    // All Users Sorted
    const sortedUsers = [...activeUsers, ...inactiveUsers];

    // Get Valid Date
    const getValidDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day);
    };

    // Button Functions
    // Template Buttons
    const handleOK = ( user ) => {
        console.log(user);
    };

    // Toggle Expand Per Users
    const toggleExpandDashboard = (uid) => {
        LayoutAnimation.configureNext({
            duration: 200,
            update: {
                type: LayoutAnimation.Types.linear,
                property: LayoutAnimation.Properties.scaleX
            },
        });
        setExpandedStates(prevStates => ({
            ...prevStates,
            [uid]: !prevStates[uid]
        }));
    };

    // Edit Function
    const handleEdit = (user) => {
        setEditing(true);
        setEditUser(user);
        setUpdatedFields(user);
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    };

    // Handle input change for nested fields
    const handleInputChange = (field, value) => {
        setUpdatedFields((prevFields) => {
            const fieldParts = field.split('.'); // Split nested fields
            let updatedObject = { ...prevFields }; // Create a copy of the current state

            // Iterate through the field parts and update the nested field
            fieldParts.reduce((acc, part, index) => {
                if (index === fieldParts.length - 1) {
                    acc[part] = value; // Set the value for the final field part
                } else {
                    acc[part] = { ...acc[part] }; // Keep the nested structure intact
                }
                return acc[part];
            }, updatedObject);

            return updatedObject; // Return the updated state
        });
    };

    // Function to handle date selection
    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || getValidDate(updatedFields.birthdate);
    
        // Hide the date picker
        setShowDate(false);
    
        setUpdatedFields((prevFields) => {
            // Add one day to the current date
            const adjustedDate = new Date(currentDate);
            adjustedDate.setDate(adjustedDate.getDate() + 1);
    
            return {
                ...prevFields,
                birthdate: adjustedDate.toISOString().split('T')[0], // Update birthdate field with adjusted Date object
            };
        });
    };

    // Saving Function
    const handleSave = async () => {
        setSaveLoading(true);
        if (updatedFields.uid) {
            try {
                // Reference the specific user document
                const userRef = doc(db, 'users', updatedFields.uid);
    
                // Update the document
                await updateDoc(userRef, {
                    ...updatedFields,
                    updatedAt: serverTimestamp(),
                });
    
                alert('User updated successfully!');
                setEditing(false);
                setSaveLoading(false);
                setUpdatedFields({});
                scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
            } catch (error) {
                console.error('Error updating user:', error);
                alert('Failed to update user. Please try again.');
            }
        } else {
            alert('User ID is missing.');
        }
    };

    // Delete Function
    const handleDelete = async (user) => {
        if (user.uid) {
            try {
                // Reference the specific user document
                const userRef = doc(db, 'users', user.uid);

                // Delete the document
                await deleteDoc(userRef);

                alert('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
            }
        } else {
            alert('User ID is missing.');
        }
    };

    // Disable Function
    const handleDisable = async (user, option) => {
        if (user.uid) {
            try {
                // Use the `option` parameter if provided, otherwise fall back to `selectedDisableOptions`
                const disableOption = option || selectedDisableOptions;
    
                // Determine the disable duration
                const disableDuration = {
                    '1-day': 1,
                    '2-days': 2,
                    '3-days': 3,
                }[disableOption] || 1; // Default to 1 day if the selection is invalid
    
                // Calculate the end disable time
                const disableUntil = new Date();
                disableUntil.setDate(disableUntil.getDate() + disableDuration);
    
                // Reference the user document
                const userRef = doc(db, 'users', user.uid);
    
                // Update the document with disableUntil, disabled flag, and clear the session_token
                await updateDoc(userRef, {
                    disabled: true,
                    disableUntil: disableUntil.toISOString(),
                    session_token: null // Clear the session token
                });
    
                alert(`User disabled for ${disableOption}.`);
                setShowDisableOptions(false);
            } catch (error) {
                console.error('Error disabling user:', error);
                alert('Failed to disable user. Please try again.');
            }
        } else {
            alert('User ID is missing.');
        }
    };    

    // Enable Function
    const handleEnable = async (user) => {
        if (user.uid) {
            try {
                // Reference the user document
                const userRef = doc(db, 'users', user.uid);
    
                // Update the document to set the 'disabled' field to false
                await updateDoc(userRef, { disabled: false });
    
                alert('User has been enabled successfully!');
            } catch (error) {
                console.error('Error enabling user:', error);
                alert('Failed to enable user. Please try again.');
            }
        } else {
            alert('User ID is missing.');
        }
    };

    // Reset Password Function
    const handleResetPassword = async (user) => {
        if (user.email) {
            try {
                // Send the password reset email
                await sendPasswordResetEmail(auth, user.email);
                alert(`A password reset email has been sent to ${user.email}.`);
            } catch (error) {
                console.error('Error sending password reset email:', error);
                alert('Failed to send password reset email. Please try again.');
            }
        } else {
            alert('Email address is missing. Cannot send reset password email.');
        }
    };

    // Reset All Session Token Function
    const handleResetTokens = async () => {
        try {
            setResetLoading(true);
            // Reference the users collection
            const usersRef = collection(db, 'users');
    
            // Query to find all users except admins
            const usersQuery = query(usersRef, where('type', '!=', 'admin'));
            const querySnapshot = await getDocs(usersQuery);
    
            if (!querySnapshot.empty) {
                // Initialize a batch
                const batch = writeBatch(db);
    
                // Loop through all non-admin users and set session_token to null
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { session_token: null });
                });
    
                // Commit the batch
                await batch.commit();
                alert('All session tokens have been reset for non-admin users.');
                setResetLoading(false);
            } else {
                alert('No non-admin users found.');
                setResetLoading(false);
            }
        } catch (error) {
            console.error('Error resetting session tokens:', error);
            alert('Failed to reset session tokens. Please try again.');
            setResetLoading(false);
        }
    };

    return (
        <SafeAreaView className="w-full h-full bg-white justify-center items-center">
            {isEditing && (
                <TouchableHighlight
                    underlayColor={"#86ebaa"} 
                    className="w-24 h-24 absolute bottom-[2%] right-[2%] bg-primary rounded-3xl z-10" 
                    onPress={handleSave}
                    disabled={saveLoading}
                >
                    <>
                        <View className="w-full h-full items-center justify-center">
                            {saveLoading ? (
                                <ActivityIndicator size="large" color="#ffffff" />
                            ) : (
                                <>
                                    <Image 
                                        tintColor='#ffffff'
                                        source={icons.check}
                                        className="w-[40%] h-[40%]"
                                        resizeMode='contain'
                                    />
                                    <Text className="text-xl text-white font-rmedium">SAVE</Text>
                                </>
                            )}
                        </View>
                    </>
                </TouchableHighlight>
            )}
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                {data.length === 0 ? (
                    <View className="w-[96%] h-fit">
                        <TouchableHighlight
                            underlayColor={'#fffd99'}
                            className={`w-full h-fit bg-white border-[1px] border-warn mt-4 rounded-3xl overflow-hidden`}
                            disabled
                        >
                            <>
                                {/* No Data Available */}
                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                        {'Missing Users'}
                                    </Text>
                                </View>
                                {/* Status */}
                                <View className={`mx-2 absolute top-[15%] right-[2%] bg-yellow-400 rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                    <View className="w-6 items-center justify-center">
                                        <Image
                                            tintColor={'#ffffff'}
                                            source={icons.missing}
                                            className="w-[70%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                        <Text className="text-white font-pregular text-xs">{'Missing'}</Text>
                                    </View>
                                </View>
                                {/* Missing Data */}
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{'No user data available.'}</Text>
                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image
                                                tintColor={'#64748b'}
                                                source={icons.missing}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center">
                                            <Text className="text-slate-500 font-pregular text-xs text-right">
                                                {'NaN'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        </TouchableHighlight>
                    </View>
                ) : (
                    <>
                        {isEditing ? (
                            <>
                                {/* Title */}
                                <Text className="font-pbold text-xl text-black py-[6%]">USER DETAILS</Text>
                                <View className="w-[93%] justify-center">
                                    {/* User ID */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">User ID:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-primary-hidden"
                                            placeholder='User ID'
                                            editable={false}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.user_id ? `#${updatedFields?.user_id}` : ''}
                                            onChangeText={(value) => handleInputChange('user_id', value)}
                                        />
                                    </View>
                                    {/* UID */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Database User ID:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-primary-hidden"
                                            placeholder='UID'
                                            editable={false}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.user_id ? updatedFields?.uid : ''}
                                            onChangeText={(value) => handleInputChange('uid', value)}
                                        />
                                    </View>
                                    {/* User Full Name */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Full Name:</Text>
                                    <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showName ? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                                        <TextInput
                                            className={`w-full text-md font-pmedium ${!showName ? "text-black" : "text-primary-hidden"} ml-4`}
                                            placeholder='User Full Name'
                                            editable={false}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.full_name ? `${updatedFields.full_name.first_name} ${updatedFields.full_name.middle_name} ${updatedFields.full_name.last_name}` : ''}
                                        />
                                        {/* Edit Full Name Button */}
                                        <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowName(!showName)}>
                                            <Image 
                                                tintColor="#57b378"
                                                source={!showName ? icons.editing : icons.edit}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                            />
                                        </TouchableHighlight>
                                    </View>
                                    {/* Edit Full Name */}
                                    {showName ? (<>
                                    {/* User First Name */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">First Name:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='User First Name'
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.full_name ? updatedFields.full_name.first_name : ''}
                                            onChangeText={(value) => handleInputChange('full_name.first_name', value)}
                                        />
                                    </View>
                                    {/* User Middle Name */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Middle Name:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='User Middle Name'
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.full_name ? updatedFields.full_name.middle_name : ''}
                                            onChangeText={(value) => handleInputChange('full_name.middle_name', value)}
                                        />
                                    </View>
                                    {/* User Last Name */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Last Name:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='User Last Name'
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.full_name ? updatedFields.full_name.last_name : ''}
                                            onChangeText={(value) => handleInputChange('full_name.last_name', value)}
                                        />
                                    </View>
                                    </>) : (<></>)}
                                    {/* Username */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Username:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='Username'
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.username ? updatedFields.username : ''}
                                            onChangeText={(value) => handleInputChange('username', value)}
                                        />
                                    </View>
                                    {/* User Type */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Type:</Text>
                                    <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showType? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                                        <TextInput
                                            className={`w-full text-md font-pmedium ${!showType ? "text-black" : "text-primary-hidden"} ml-4`}
                                            placeholder='Type'
                                            editable={false}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.type
                                                ? updatedFields.type.charAt(0).toUpperCase() + updatedFields.type.slice(1)
                                                : '' } 
                                        />
                                        {/* Edit User Type Button */}
                                        <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowType(!showType)}>
                                            <Image 
                                                tintColor="#57b378"
                                                source={!showType ? icons.editing : icons.edit}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                            />
                                        </TouchableHighlight>
                                    </View>
                                    {/* Edit User Type */}
                                    {showType ? (
                                        <>
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Change User Type:</Text>
                                            <View className="w-full h-16 justify-center items-center flex-row">
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                    {/* Community User */}
                                                    <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'community' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'community')}>
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="h-full justify-center">
                                                                <Text className={`${updatedFields?.type === 'community' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Community'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                    {/* Responder */}
                                                    <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'responder' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'responder')}>
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="h-full justify-center">
                                                                <Text className={`${updatedFields?.type === 'responder' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Responder'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                    {/* Admin */}
                                                    <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'admin' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'admin')}>
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="h-full justify-center">
                                                                <Text className={`${updatedFields?.type === 'admin' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Admin'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                </ScrollView>
                                            </View>
                                        </>
                                    ) : (<></>)}
                                    {/* User Address */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Address:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='User Address'
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.address ? updatedFields.address : ''}
                                            onChangeText={(value) => handleInputChange('address', value)}
                                        />
                                    </View>
                                    {/* User Phone Number */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Phone Number:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='User Phone Number'
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            keyboardType="numeric"
                                            value={updatedFields.phone_number ? `+63-${updatedFields.phone_number}` : ''}
                                            onChangeText={(value) => {
                                                const delPrefix = value.replace('+63-', ''); // Remove prefix before storing
                                                handleInputChange('phone_number', delPrefix);
                                            }}
                                        />
                                    </View>
                                    {/* Email */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Email:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-primary-hidden"
                                            placeholder='User ID'
                                            editable={false}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.email ? updatedFields.email : ''}
                                            onChangeText={(value) => handleInputChange('email', value)}
                                        />
                                    </View>
                                    {/* Birthdate */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Birthdate:</Text>
                                    <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showDate? "border-black" : "border-primary"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                                        <TextInput
                                            className={`w-full text-md font-pmedium ${!showDate ? "text-black" : "text-primary"} ml-4`}
                                            placeholder='Birthdate'
                                            editable={false}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.birthdate
                                                ? getValidDate(updatedFields?.birthdate).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : '' } 
                                        />
                                        {/* Edit Birthdate Button */}
                                        <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setShowDate(!showDate)}>
                                            <Image 
                                                tintColor="#57b378"
                                                source={!showDate ? icons.editing : icons.edit}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                            />
                                        </TouchableHighlight>
                                    </View>
                                    {showDate ? (<>
                                        <DateTimePicker
                                            mode="date"
                                            display="default"
                                            value={getValidDate(updatedFields?.birthdate)} // Initial value of the DatePicker
                                            onChange={handleDateChange}
                                            themeVariant='dark'
                                        />
                                    </>) : (<></>)}
                                    {/* Reports */}
                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Reports:</Text>
                                    <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                                        <TextInput
                                            className="w-full text-md font-pmedium text-black"
                                            placeholder='Reports'
                                            keyboardType="numeric"
                                            editable={true}
                                            placeholderTextColor='#94A3B8'
                                            value={updatedFields?.reports ? updatedFields.reports?.toString() : '0'}
                                            onChangeText={(value) => handleInputChange('reports', value)}
                                        />
                                    </View>
                                    {updatedFields.type === 'responder' ? (
                                        <>
                                            {/* Rank */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">{'Rank / Position:'}</Text>
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4 mb-2`}>
                                                <TextInput
                                                    className="w-full text-base font-pregular text-black"
                                                    placeholder='Rank or Position'
                                                    placeholderTextColor='#94A3B8'
                                                    value={updatedFields?.rank ? updatedFields.rank : ''}
                                                    onChangeText={(value) => handleInputChange('rank', value)}
                                                />
                                            </View>
                                            {/* Amenity Search */}
                                            <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Amenity Search'}</Text>
                                            <View className={`w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4 mb-2 flex-row`}>
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
                                                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">{'Results '}<Text className="font-pmedium">{`(${filteredAmenities.length})`}</Text></Text>
                                                    <View className="w-full h-48">
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center',}}>
                                                            {filteredAmenities.length > 0 ? filteredAmenities.map((amenity) => (
                                                                <View key={amenity.id} className={`w-36 h-full ${selectedAmenity?.id === amenity?.id ? "bg-primary" : "bg-white border-2 border-primary"} rounded-2xl px-2 mr-1`}>
                                                                    <TouchableOpacity className="w-full h-full justify-center" onPress={() => handleSelectAmenity(amenity)}>
                                                                        {/* Name and Description */}
                                                                        <Text className={`font-pbold text-sm ${selectedAmenity?.id === amenity?.id ? "text-white" : "text-black"}`}>{`${amenity.name} ${amenity.description}`}</Text>
                                                                        {/* Address */}
                                                                        <Text className={`font-pregular text-xs ${selectedAmenity?.id === amenity?.id ? "text-slate-200" : "text-slate-400"} mt-2`} numberOfLines={3} ellipsizeMode="tail">{amenity.address}</Text>
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
                                        </>
                                    ) : (<></>)}
                                    <View className="w-full mb-[6%]" />
                                </View>
                            </>
                        ) : (
                            <>
                            <View className="w-full h-12 justify-center mt-8 pl-4">
                                <Text className="text-xl text-black font-psemibold">{`ACTIVE USERS (${activeUsers.length})`}</Text>
                                <TouchableHighlight 
                                    className="w-14 h-12 bg-white rounded-3xl border-primary border-[1px] overflow-hidden absolute right-2" 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => setCollapseActive(!collapseActive)}
                                >
                                    <View className="w-full h-full justify-center items-center flex-row overflow-hidden">
                                        <Image
                                            tintColor={'#57b378'}
                                            source={collapseActive ? icons.expandUp : icons.expandDown}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {/* Log Out All Users */}
                            <View className="w-full h-12 items-center justify-center px-2 mt-2">
                                <TouchableHighlight 
                                    className="w-full h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6" 
                                    underlayColor={'#fffd99'} 
                                    onPress={handleResetTokens}
                                    disabled={resetLoading}
                                >
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        {resetLoading ? (
                                            <ActivityIndicator size="small" color="#000000" />
                                        ) : (
                                            <>
                                                <View className="w-6 h-full items-center justify-center">
                                                    <Image
                                                        tintColor={'#57b378'}
                                                        source={icons.refresh}
                                                        className="w-[80%] h-[80%]"
                                                        resizeMode='contain'
                                                    />
                                                </View>
                                                <View className="h-full justify-center pl-[4%]">
                                                    <Text className="text-black font-pregular text-sm">{'Reset Session Token'}</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {collapseActive && activeUsers.map((user) => (
                                !expandedStates[user.uid] ? (
                                    <View key={user.uid} className="w-[96%] h-fit">
                                        <TouchableHighlight
                                            underlayColor={'#86ebaa'}
                                            className="w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden"
                                            onPress={() => toggleExpandDashboard(user.uid)}
                                        >
                                            <>
                                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                                    <Text className={`${user.session_token !== null ? 'text-primary-300' : 'text-slate-500'} font-psemibold text-sm`}>
                                                        {`${user.full_name.last_name}, ${user.full_name.first_name} - ${user.username}`}
                                                    </Text>
                                                </View>
                                                <View className={`mx-2 absolute top-[15%] right-[2%] ${user.session_token !== null ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                                    <View className="w-6 items-center justify-center">
                                                        <Image
                                                            tintColor={'#ffffff'}
                                                            source={user.session_token !== null ? icons.verification : icons.failed}
                                                            className="w-[70%] h-[70%]"
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                                        <Text className="text-white font-pregular text-xs">{user.session_token !== null ? 'Active' : 'Inactive'}</Text>
                                                    </View>
                                                </View>
                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{user.email}</Text>
                                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                        <View className="w-[40%] h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#64748b'}
                                                                source={user.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center">
                                                            <Text className="text-slate-500 font-pregular text-xs text-right">
                                                                {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </>
                                        </TouchableHighlight>
                                    </View>
                                ) : (
                                    <View key={user.uid} className="w-[96%] h-fit items-center justify-center">
                                        {/* Expanded View */}
                                        <View className="w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden">
                                            <View className="w-full h-8 mt-[4%] mb-[2%] px-4">
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                    <View className="h-full ml-4 bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden px-2">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={user.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                                className="w-[60%] h-[60%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-white font-pregular text-xs">{user.user_id}</Text>
                                                        </View>
                                                    </View>
                                                    <View className={`h-full mx-2 ${user.session_token !== null ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                        <View className="w-6 items-center justify-center">
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={icons.verification}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[2%]">
                                                            <Text className="text-white font-pregular text-xs">{user.session_token !== null ? 'Active' : 'Inactive'}</Text>
                                                        </View>
                                                    </View>
                                                    {user.violation && (
                                                        <View className={`h-full mr-4 ${user.violation === 1 ? 'bg-warn' : user.violation === 2 ? 'bg-orange-500' : user.violation === 3 ? 'bg-red-600' : ''} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                            <View className="w-6 items-center justify-center">
                                                                <Image
                                                                    tintColor={'#ffffff'}
                                                                    source={icons.warning}
                                                                    className="w-[50%] h-[50%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[2%]">
                                                                <Text className="text-white font-pregular text-xs">{`Violation - ${user.violation.toString()}`}</Text>
                                                            </View>
                                                        </View>
                                                    )}
                                                </ScrollView>
                                            </View>
                                            <View className="w-[90%] h-fit mb-[1%] px-4">
                                                <Text className={`${user.session_token !== null ? 'text-primary-300' : 'text-slate-500'} font-psemibold text-sm`}>
                                                    {`${user.full_name.last_name}, ${user.full_name.first_name} ${user.full_name.middle_name} - ${user.username}`}
                                                </Text>
                                            </View>
                                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                <Text className="w-[80%] text-slate-500 font-pregular text-xs">{user.email}</Text>
                                            </View>
                                            <View className="w-full h-14 justify-center">
                                                <TouchableHighlight
                                                    underlayColor={'#86ebaa'}
                                                    className={`w-full h-full flex-row ${user.disabled ? 'bg-primary-hidden' : 'bg-primary'} items-center px-4`}
                                                    onPress={() => toggleExpandDashboard(user.uid)}
                                                >
                                                    <>
                                                        <View className="w-[10%] h-[80%] justify-center">
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={user.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="w-[90%] h-[80%] justify-center">
                                                            <Text className="text-white font-pregular text-xs">
                                                                {user.type.charAt(0).toUpperCase() + user.type.slice(1)} User {user.disabled ? ' - Account Disabled' : ''}
                                                            </Text>
                                                        </View>
                                                    </>
                                                </TouchableHighlight>
                                                <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                    {/* <TouchableHighlight
                                                        underlayColor={'#86ebaa'}
                                                        className="w-full h-full items-center justify-center rounded-2xl"
                                                        onPress={handleOK}
                                                    >
                                                        <Image
                                                            tintColor={'#ffffff'}
                                                            source={icons.nextArrowBtn}
                                                            className="w-[50%] h-[50%]"
                                                            resizeMode='contain'
                                                        />
                                                    </TouchableHighlight> */}
                                                </View>
                                            </View>
                                        </View>
                                        {/* Options */}
                                        <View className="w-full h-10 mt-3">
                                            <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                {/* Edit Button */}
                                                <TouchableHighlight className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2 ml-12" underlayColor={'#fffd99'} onPress={() => handleEdit(user)}>
                                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#57b378'}
                                                                source={icons.edit}
                                                                className="w-[80%] h-[80%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-black font-pregular text-sm">{'Edit'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                                {/* Reset Password Button */}
                                                <TouchableHighlight className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2" underlayColor={'#fffd99'} onPress={() => handleResetPassword(user)}>
                                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#1097e6'}
                                                                source={icons.resetPassword}
                                                                className="w-[80%] h-[80%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-black font-pregular text-sm">{'Reset Password'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                                {/* Disable / Enable Button */}
                                                {user.disabled ? (
                                                    <TouchableHighlight 
                                                        className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2" 
                                                        underlayColor={'#fffd99'} 
                                                        onPress={() => handleEnable(user)}
                                                    >
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="w-6 h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={'#57b378'}
                                                                    source={icons.verification}
                                                                    className="w-[70%] h-[70%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[4%]">
                                                                <Text className="text-black font-pregular text-sm">{'Enable'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                ) : (
                                                    <TouchableHighlight 
                                                        className={`h-full ${showDisableOptions ? 'bg-primary' : 'bg-white border-primary border-[1px]'} rounded-3xl overflow-hidden px-6 mr-2`}
                                                        underlayColor={'#fffd99'} 
                                                        onPress={() => setShowDisableOptions(!showDisableOptions)}
                                                    >
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="w-6 h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={showDisableOptions ? '#ffffff' : '#828282'}
                                                                    source={icons.disable}
                                                                    className="w-[70%] h-[70%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[4%]">
                                                                <Text className={`${showDisableOptions ? 'text-white' : 'text-black'} font-pregular text-sm`}>{'Disable'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                )}
                                                {showDisableOptions && (
                                                    <>
                                                        <TouchableHighlight 
                                                            className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-2 mr-2" 
                                                            underlayColor={'#fffd99'} 
                                                            onPress={() => handleDisable(user, '1-day')}
                                                        >
                                                            <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                <View className="w-6 h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#828282'}
                                                                        source={icons.disable}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center pl-[4%]">
                                                                    <Text className="text-black font-pregular text-sm">{'1 Day'}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableHighlight>
                                                        <TouchableHighlight 
                                                            className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-2 mr-2" 
                                                            underlayColor={'#fffd99'} 
                                                            onPress={() => handleDisable(user, '2-days')}
                                                        >
                                                            <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                <View className="w-6 h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#828282'}
                                                                        source={icons.disable}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center pl-[4%]">
                                                                    <Text className="text-black font-pregular text-sm">{'2 Days'}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableHighlight>
                                                        <TouchableHighlight 
                                                            className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-2 mr-2" 
                                                            underlayColor={'#fffd99'} 
                                                            onPress={() => handleDisable(user, '3-days')}
                                                        >
                                                            <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                <View className="w-6 h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#828282'}
                                                                        source={icons.disable}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center pl-[4%]">
                                                                    <Text className="text-black font-pregular text-sm">{'3 Days'}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableHighlight>
                                                    </>
                                                )}
                                                {/* Delete Button */}
                                                <TouchableHighlight className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-12" underlayColor={'#fffd99'} onPress={() => handleDelete(user)}>
                                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#e62210'}
                                                                source={icons.deletePhoto}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-black font-pregular text-sm">{'Delete'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                            </ScrollView>
                                        </View>
                                    </View>
                                )
                            ))}
                            <View className="w-full h-12 justify-center mt-4 pl-4">
                                <Text className="text-xl text-black font-psemibold">{`INACTIVE USERS (${inactiveUsers.length})`}</Text>
                                <TouchableHighlight 
                                    className="w-14 h-12 bg-white rounded-3xl border-primary border-[1px] overflow-hidden absolute right-2" 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => setCollapseInactive(!collapseInactive)}
                                >
                                    <View className="w-full h-full justify-center items-center flex-row overflow-hidden">
                                        <Image
                                            tintColor={'#57b378'}
                                            source={collapseInactive ? icons.expandUp : icons.expandDown}
                                            className="w-[50%] h-[50%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>
                            {collapseInactive && inactiveUsers.map((user) => (
                                !expandedStates[user.uid] ? (
                                    <View key={user.uid} className="w-[96%] h-fit">
                                        <TouchableHighlight
                                            underlayColor={'#86ebaa'}
                                            className="w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden"
                                            onPress={() => toggleExpandDashboard(user.uid)}
                                        >
                                            <>
                                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                                    <Text className={`${user.session_token !== null ? 'text-primary-300' : 'text-slate-500'} font-psemibold text-sm`}>
                                                        {`${user.full_name.last_name}, ${user.full_name.first_name} - ${user.username}`}
                                                    </Text>
                                                </View>
                                                <View className={`mx-2 absolute top-[15%] right-[2%] ${user.session_token !== null ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                                    <View className="w-6 items-center justify-center">
                                                        <Image
                                                            tintColor={'#ffffff'}
                                                            source={user.session_token !== null ? icons.verification : icons.failed}
                                                            className="w-[70%] h-[70%]"
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                                        <Text className="text-white font-pregular text-xs">{user.session_token !== null ? 'Active' : 'Inactive'}</Text>
                                                    </View>
                                                </View>
                                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{user.email}</Text>
                                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                                        <View className="w-[40%] h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#64748b'}
                                                                source={user.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center">
                                                            <Text className="text-slate-500 font-pregular text-xs text-right">
                                                                {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </>
                                        </TouchableHighlight>
                                    </View>
                                ) : (
                                    <View key={user.uid} className="w-[96%] h-fit items-center justify-center">
                                        {/* Expanded View */}
                                        <View className="w-full h-fit bg-white border-[1px] border-primary mt-4 rounded-3xl overflow-hidden">
                                            <View className="w-full h-8 mt-[4%] mb-[2%] px-4">
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                    <View className="h-full ml-4 bg-primary rounded-3xl justify-center items-center flex-row overflow-hidden px-2">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={user.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                                className="w-[60%] h-[60%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-white font-pregular text-xs">{user.user_id}</Text>
                                                        </View>
                                                    </View>
                                                    <View className={`h-full mx-2 ${user.session_token !== null ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                        <View className="w-6 items-center justify-center">
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={icons.verification}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[2%]">
                                                            <Text className="text-white font-pregular text-xs">{user.session_token !== null ? 'Active' : 'Inactive'}</Text>
                                                        </View>
                                                    </View>
                                                    {user.violation && (
                                                        <View className={`h-full mr-4 ${user.violation === 1 ? 'bg-warn' : user.violation === 2 ? 'bg-orange-500' : user.violation === 3 ? 'bg-red-600' : ''} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                                            <View className="w-6 items-center justify-center">
                                                                <Image
                                                                    tintColor={'#ffffff'}
                                                                    source={icons.warning}
                                                                    className="w-[50%] h-[50%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[2%]">
                                                                <Text className="text-white font-pregular text-xs">{`Violation - ${user.violation.toString()}`}</Text>
                                                            </View>
                                                        </View>
                                                    )}
                                                </ScrollView>
                                            </View>
                                            <View className="w-[90%] h-fit mb-[1%] px-4">
                                                <Text className={`${user.session_token !== null ? 'text-primary-300' : 'text-slate-500'} font-psemibold text-sm`}>
                                                    {`${user.full_name.last_name}, ${user.full_name.first_name} ${user.full_name.middle_name} - ${user.username}`}
                                                </Text>
                                            </View>
                                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                                <Text className="w-[80%] text-slate-500 font-pregular text-xs">{user.email}</Text>
                                            </View>
                                            <View className="w-full h-14 justify-center">
                                                <TouchableHighlight
                                                    underlayColor={'#86ebaa'}
                                                    className={`w-full h-full flex-row ${user.disabled ? 'bg-primary-hidden' : 'bg-primary'} items-center px-4`}
                                                    onPress={() => toggleExpandDashboard(user.uid)}
                                                >
                                                    <>
                                                        <View className="w-[10%] h-[80%] justify-center">
                                                            <Image
                                                                tintColor={'#ffffff'}
                                                                source={user.type === 'community' ? icons.profileBorder : icons.profileRespoBorder}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="w-[90%] h-[80%] justify-center">
                                                            <Text className="text-white font-pregular text-xs">
                                                                {user.type.charAt(0).toUpperCase() + user.type.slice(1)} User {user.disabled ? ' - Account Disabled' : ''}
                                                            </Text>
                                                        </View>
                                                    </>
                                                </TouchableHighlight>
                                                <View className="w-[20%] h-[80%] absolute right-2 z-30">
                                                    {/* <TouchableHighlight
                                                        underlayColor={'#86ebaa'}
                                                        className="w-full h-full items-center justify-center rounded-2xl"
                                                        onPress={handleOK}
                                                    >
                                                        <Image
                                                            tintColor={'#ffffff'}
                                                            source={icons.nextArrowBtn}
                                                            className="w-[50%] h-[50%]"
                                                            resizeMode='contain'
                                                        />
                                                    </TouchableHighlight> */}
                                                </View>
                                            </View>
                                        </View>
                                        {/* Options */}
                                        <View className="w-full h-10 mt-3">
                                            <ScrollView className='w-full h-full' horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                                {/* Edit Button */}
                                                <TouchableHighlight className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2 ml-12" underlayColor={'#fffd99'} onPress={() => handleEdit(user)}>
                                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#57b378'}
                                                                source={icons.edit}
                                                                className="w-[80%] h-[80%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-black font-pregular text-sm">{'Edit'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                                {/* Reset Password Button */}
                                                <TouchableHighlight className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2" underlayColor={'#fffd99'} onPress={() => handleResetPassword(user)}>
                                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#1097e6'}
                                                                source={icons.resetPassword}
                                                                className="w-[80%] h-[80%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-black font-pregular text-sm">{'Reset Password'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                                {/* Disable / Enable Button */}
                                                {user.disabled ? (
                                                    <TouchableHighlight 
                                                        className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-2" 
                                                        underlayColor={'#fffd99'} 
                                                        onPress={() => handleEnable(user)}
                                                    >
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="w-6 h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={'#57b378'}
                                                                    source={icons.verification}
                                                                    className="w-[70%] h-[70%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[4%]">
                                                                <Text className="text-black font-pregular text-sm">{'Enable'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                ) : (
                                                    <TouchableHighlight 
                                                        className={`h-full ${showDisableOptions ? 'bg-primary' : 'bg-white border-primary border-[1px]'} rounded-3xl overflow-hidden px-6 mr-2`}
                                                        underlayColor={'#fffd99'} 
                                                        onPress={() => setShowDisableOptions(!showDisableOptions)}
                                                    >
                                                        <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                            <View className="w-6 h-full items-center justify-center">
                                                                <Image
                                                                    tintColor={showDisableOptions ? '#ffffff' : '#828282'}
                                                                    source={icons.disable}
                                                                    className="w-[70%] h-[70%]"
                                                                    resizeMode='contain'
                                                                />
                                                            </View>
                                                            <View className="h-full justify-center pl-[4%]">
                                                                <Text className={`${showDisableOptions ? 'text-white' : 'text-black'} font-pregular text-sm`}>{'Disable'}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableHighlight>
                                                )}
                                                {showDisableOptions && (
                                                    <>
                                                        <TouchableHighlight 
                                                            className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-2 mr-2" 
                                                            underlayColor={'#fffd99'} 
                                                            onPress={() => handleDisable(user, '1-day')}
                                                        >
                                                            <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                <View className="w-6 h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#828282'}
                                                                        source={icons.disable}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center pl-[4%]">
                                                                    <Text className="text-black font-pregular text-sm">{'1 Day'}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableHighlight>
                                                        <TouchableHighlight 
                                                            className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-2 mr-2" 
                                                            underlayColor={'#fffd99'} 
                                                            onPress={() => handleDisable(user, '2-days')}
                                                        >
                                                            <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                <View className="w-6 h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#828282'}
                                                                        source={icons.disable}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center pl-[4%]">
                                                                    <Text className="text-black font-pregular text-sm">{'2 Days'}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableHighlight>
                                                        <TouchableHighlight 
                                                            className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-2 mr-2" 
                                                            underlayColor={'#fffd99'} 
                                                            onPress={() => handleDisable(user, '3-days')}
                                                        >
                                                            <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                                <View className="w-6 h-full items-center justify-center">
                                                                    <Image
                                                                        tintColor={'#828282'}
                                                                        source={icons.disable}
                                                                        className="w-[70%] h-[70%]"
                                                                        resizeMode='contain'
                                                                    />
                                                                </View>
                                                                <View className="h-full justify-center pl-[4%]">
                                                                    <Text className="text-black font-pregular text-sm">{'3 Days'}</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableHighlight>
                                                    </>
                                                )}
                                                {/* Delete Button */}
                                                <TouchableHighlight className="h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6 mr-12" underlayColor={'#fffd99'} onPress={() => handleDelete(user)}>
                                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                                        <View className="w-6 h-full items-center justify-center">
                                                            <Image
                                                                tintColor={'#e62210'}
                                                                source={icons.deletePhoto}
                                                                className="w-[50%] h-[50%]"
                                                                resizeMode='contain'
                                                            />
                                                        </View>
                                                        <View className="h-full justify-center pl-[4%]">
                                                            <Text className="text-black font-pregular text-sm">{'Delete'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                            </ScrollView>
                                        </View>
                                    </View>
                                )
                            ))}
                            <View className="w-full mb-6" />
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default UserScreen;
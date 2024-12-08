import React, { useEffect, useContext, useState, useRef } from 'react';
import { View, Image, Text, BackHandler, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserContext from '../../../components/UserContext';
import ToolsContext from '../../../components/ToolsContext';
import { translate } from '../../../components/ToolsContext';

import { images, icons } from '../../../constants';

import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch, Timestamp, addDoc, GeoPoint } from 'firebase/firestore';
import { app } from '../../../firebaseConfig';

const db = getFirestore(app);

const AmenityScreen = ({ data, changePage, backPage }) => {
  // Global Variables
  const { user, isResponder } = useContext(UserContext); // User Container
  const { dictionary } = useContext(ToolsContext); // Dictionary Container
  const { width, height } = Dimensions.get('screen'); // Screen Width and Height
  // Local Variables
  const [amenities, setAmenities] = useState([]);
  const scrollRef = useRef(null); // Scroll View Reference
  const [resetLoading, setResetLoading] = useState(false); // If Reset Loading
  const [saveLoading, setSaveLoading] = useState(false); // Save Loading
  const [expandedStates, setExpandedStates] = useState(data.map(() => false));
  const [collapseFire, setCollapseFire] = useState(false); // Fire Station / Amenities Visibility
  const [collapsePolice, setCollapsePolice] = useState(false); // Police Station / Amenities Visibility
  const [collapseDisaster, setCollapseDisaster] = useState(false); // Disaster Amenities Visibility
  const [collapseBarangay, setCollapseBarangay] = useState(false); // Barangay Amenities Visibility
  const [isEditing, setEditing] = useState(false); // Editing Function
  const [updatedFields, setUpdatedFields] = useState({}); // Update User Fields
  const [showLocation, setShowLocation] = useState(false); // Display Location
  const [showType, setShowType] = useState(false); // Display Type
  const [showService, setShowService] = useState(false); // Display Service

  const [isAdding, setIsAdding] = useState(false); // Add New Amenity
  const [amenityData, setAmenityData] = useState({}); // Add Amenity
  const [showNewLocation, setShowNewLocation] = useState(false); // Display Location
  const [showNewType, setNewShowType] = useState(false); // Display Type
  const [showNewService, setNewShowService] = useState(false); // Display Service
  const [addLoading, setAddLoading] = useState(false); // Add Loading

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

  // Real-time listener for Amenities
  useEffect(() => {
    if (data === null) {
      const unsubscribeAmenities = onSnapshot(collection(db, 'amenity'), (snapshot) => {
        const amenities = snapshot.docs.map(doc => doc.data());
        setAmenities(amenities); // Only set the data, not the count
      });
    
      // Cleanup listener on component unmount
      return () => {
        unsubscribeAmenities();
      };
    } else {
      return;
    }
  }, [data]);  

  // Passive Function
  // Format Key Date
  const formatKeyDate = (timestamp) => {
    let date;
    // Check if timestamp is a Firebase timestamp object
    if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string' || timestamp instanceof Date) {
      date = new Date(timestamp);
    } else {
      return ''; // Invalid timestamp
    }
  
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based index
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  // Check if Key Date is Still Valid
  const isValidKeyDate = (keyDate, today) => {
    const date1 = new Date(keyDate.seconds * 1000); // Convert Firebase Timestamp to JS Date
    return (
      date1.getFullYear() === today.getFullYear() &&
      date1.getMonth() === today.getMonth() &&
      date1.getDate() === today.getDate()
    );
  };  

  // Color Generator Function
  const colorGenerator = (key) => {
    const colorKey = dictionary[key + '_color'];
    return colorKey;
  };

  // Border Generator Function
  const borderGenerator = (key) => {
    const borderKey = dictionary[key + '_border'];
    return borderKey;
  };

  const sourceData = data || amenities || [];

  // All Fire Station Amenity
  const fireAmenities = sourceData
  .filter(amenity => amenity.type === 'fire_station')
  .sort((a, b) => a.name.localeCompare(b.name));

  // All Police Station Amenity
  const policeAmenities = sourceData
  .filter(amenity => amenity.type === 'police')
  .sort((a, b) => a.name.localeCompare(b.name));

  // All Disaster Amenity
  const disasterAmenities = sourceData
  .filter(amenity => amenity.type === 'disaster')
  .sort((a, b) => a.name.localeCompare(b.name));

  // All Barangay Amenity
  const barangayAmenities = sourceData
  .filter(amenity => amenity.type === 'barangay')
  .sort((a, b) => a.name.localeCompare(b.name));

  // Button Functions
  // Template Buttons
  const handleOK = ( data ) => {
    console.log(data);
  };

  // Enable LayoutAnimation on Android
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  // Toggle Expand Per Users
  const toggleExpandDashboard = (id) => {
    LayoutAnimation.configureNext({
        duration: 200,
        update: {
            type: LayoutAnimation.Types.linear,
            property: LayoutAnimation.Properties.scaleX
        },
    });
    setExpandedStates(prevStates => ({
        ...prevStates,
        [id]: !prevStates[id]
    }));
  };

  // Reset Amenity Key Function
  const handleResetKey = async (id) => {
    const db = getFirestore();
    const keyRef = doc(db, 'amenity', id);

    try {
        await updateDoc(keyRef, { 
          amenity_key: null,
          key_date: null
        });
        console.log(`Amenity Key ${id} resetted.`);
        alert('Amenity key resetted successfully!');
    } catch (error) {
        console.error("Error resetting key:", error);
    }
  };

  // Remake Amenity Key Function
  const handleRemakeKey = async (id) => {
    const db = getFirestore();
    const keyRef = doc(db, 'amenity', id);

    const newPin = Math.floor(1000 + Math.random() * 9000).toString()

    try {
        await updateDoc(keyRef, { 
          amenity_key: newPin,
          key_date: new Date()
        });
        console.log(`Amenity Key ${id} created`);
        alert('Amenity key created successfully!');
    } catch (error) {
        console.error("Error creating key:", error);
    }
  };

  // Delete Function
  const handleDelete = async (id) => {
    try {
      // Reference the specific user document
      const amenityRef = doc(db, 'amenity', id);

      // Delete the document
      await deleteDoc(amenityRef);

      alert('Amenity deleted successfully!');
    } catch (error) {
      console.error('Error deleting amenity:', error);
      alert('Failed to delete amenity. Please try again.');
    }
  };

  // Reset All Reset keys Function
  const handleResetAllKeys = async () => {
    const db = getFirestore();
    const amenityCollection = collection(db, 'amenity');
    setResetLoading(true);

    try {
        const snapshot = await getDocs(amenityCollection);
        const batch = writeBatch(db); // Use a batch to update all documents efficiently

        snapshot.forEach((doc) => {
            batch.update(doc.ref, {
                amenity_key: null,
                key_date: null
            });
        });

        await batch.commit(); // Commit the batch
        console.log('All amenity keys have been reset.');
        alert('All amenity keys have been reset successfully!');
        setResetLoading(false);
    } catch (error) {
        console.error('Error resetting all keys:', error);
        alert('An error occurred while resetting amenity keys. Please try again.');
        setResetLoading(false);
    }
  };

  // Edit Function
  const handleEdit = (amenity) => {
    setEditing(true);
    setUpdatedFields(amenity);
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  // Changing Text Fields
  const handleInputChange = (field, value) => {
    setUpdatedFields((prevFields) => {
      const fieldParts = field.split('.'); // Split nested fields
      const updatedObject = JSON.parse(JSON.stringify(prevFields)); // Deep copy the current state
  
      fieldParts.reduce((acc, part, index) => {
        if (index === fieldParts.length - 1) {
          if (Array.isArray(acc) && !isNaN(part)) {
            acc[parseInt(part)] = value; // Update the specific index in the array
          } else {
            acc[part] = value; // Update the field directly
          }
        } else {
          acc[part] = acc[part] || (isNaN(fieldParts[index + 1]) ? {} : []); // Ensure nested structure (array or object)
        }
        return acc[part];
      }, updatedObject);
  
      // If `amenity_key` is updated, set `key_date` to the current timestamp
      if (field === 'amenity_key') {
        updatedObject.key_date = Timestamp.now(); // Add or update `key_date`
      }
  
      return updatedObject;
    });
  };

  // Delete Phone Number
  const handleDeletePhone = (phoneToDelete) => {
    setUpdatedFields((prevFields) => {
      const updatedPhones = prevFields.phone.filter((phone) => phone !== phoneToDelete);
      return { ...prevFields, phone: updatedPhones };
    });
  };

  // Add Phone Number
  const handleAddPhone = () => {
    setUpdatedFields((prevFields) => {
      const updatedPhones = prevFields.phone ? [...prevFields.phone, ''] : [''];
      return { ...prevFields, phone: updatedPhones };
    });
  };

  const handleServiceToggle = (serviceType) => {
    setUpdatedFields((prevFields) => {
      // Replace the services array with only the selected service
      const services = [{ [serviceType]: true }];
  
      return { ...prevFields, services };
    });
  };  

  // Duplicate Services Based on Count
  const handleServiceCountChange = (value) => {
    // Always use only the last character entered
    const lastDigit = value.slice(-1).replace(/\D/g, ''); // Keep the last digit and sanitize input
    const newCount = lastDigit ? parseInt(lastDigit, 10) : 0;
  
    setUpdatedFields((prevFields) => {
      const services = prevFields.services?.filter(
        (service) => service.ambulance || service.firetruck
      ) || [];
      const serviceType = services.length > 0 ? Object.keys(services[0])[0] : 'ambulance'; // Default to 'ambulance'
  
      // Create the updated services array
      const newServices = Array(newCount).fill({ [serviceType]: true });
  
      return { ...prevFields, services: newServices };
    });
  };
  
  // Save Function
  const handleSave = async () => {
    setSaveLoading(true);
    if (updatedFields.id) {
      try {
        // Reference the specific amenity document
        const amenityRef = doc(db, 'amenity', updatedFields.id);
  
        // Update the document
        await updateDoc(amenityRef, {
          ...updatedFields,
          updatedAt: serverTimestamp(), // Firebase server timestamp for last update
        });
  
        alert('Amenity updated successfully!');
        setEditing(false);
        setSaveLoading(false);
        setUpdatedFields({});
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      } catch (error) {
        console.error('Error updating amenity:', error);
        alert('Failed to update amenity. Please try again.');
      }
    } else {
      alert('Amenity ID is missing.');
    }
  };

  const handleNewInputChange = (field, value) => {
    setAmenityData((prevFields) => {
      const fieldParts = field.split('.'); // Split nested fields
      const updatedObject = JSON.parse(JSON.stringify(prevFields)); // Deep copy the current state
  
      fieldParts.reduce((acc, part, index) => {
        if (index === fieldParts.length - 1) {
          if (Array.isArray(acc) && !isNaN(part)) {
            acc[parseInt(part)] = value; // Update the specific index in the array
          } else {
            acc[part] = value; // Update the field directly
          }
        } else {
          acc[part] = acc[part] || (isNaN(fieldParts[index + 1]) ? {} : []); // Ensure nested structure (array or object)
        }
        return acc[part];
      }, updatedObject);
  
      // If `amenity_key` is updated, set `key_date` to the current timestamp
      if (field === 'amenity_key') {
        updatedObject.key_date = Timestamp.now(); // Add or update `key_date`
      }
  
      return updatedObject;
    });
  };

  // Delete Phone Number
  const handleNewDeletePhone = (phoneToDelete) => {
    setAmenityData((prevFields) => {
      const updatedPhones = prevFields.phone.filter((phone) => phone !== phoneToDelete);
      return { ...prevFields, phone: updatedPhones };
    });
  };

  // Add Phone Number
  const handleNewAddPhone = () => {
    setAmenityData((prevFields) => {
      const updatedPhones = prevFields.phone ? [...prevFields.phone, ''] : [''];
      return { ...prevFields, phone: updatedPhones };
    });
  };

  const handleNewServiceToggle = (serviceType) => {
    setAmenityData((prevFields) => {
      // Replace the services array with only the selected service
      const services = [{ [serviceType]: true }];
  
      return { ...prevFields, services };
    });
  };  

  // Duplicate Services Based on Count
  const handleNewServiceCountChange = (value) => {
    // Always use only the last character entered
    const lastDigit = value.slice(-1).replace(/\D/g, ''); // Keep the last digit and sanitize input
    const newCount = lastDigit ? parseInt(lastDigit, 10) : 0;
  
    setAmenityData((prevFields) => {
      const services = prevFields.services?.filter(
        (service) => service.ambulance || service.firetruck
      ) || [];
      const serviceType = services.length > 0 ? Object.keys(services[0])[0] : 'ambulance'; // Default to 'ambulance'
  
      // Create the updated services array
      const newServices = Array(newCount).fill({ [serviceType]: true });
  
      return { ...prevFields, services: newServices };
    });
  };

  // Add Function
  const handleAdd = async () => {
    setAddLoading(true);
    try {
      // Reference the specific amenity collection
      const amenityRef = collection(db, 'amenity');
  
      // Convert location to GeoPoint
      const { latitude, longitude } = amenityData.location || {};
      const geoPointLocation = new GeoPoint(parseFloat(latitude), parseFloat(longitude));
  
      // Add the default values to amenityData
      const amenityDataWithDefaults = {
        ...amenityData,
        location: geoPointLocation,
        hours: {
          everday: true
        },
        amenity_key: null,
        key_date: null,
        responders: []
      };
  
      // Add a new document with amenityData including default values
      const docRef = await addDoc(amenityRef, amenityDataWithDefaults);
  
      // Update the document with its generated ID
      await updateDoc(doc(db, 'amenity', docRef.id), { id: docRef.id });
  
      alert('Amenity added successfully!');
      setIsAdding(false);
      setAddLoading(false);
      setAmenityData({});
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    } catch (error) {
      console.error('Error adding amenity:', error);
      alert('Failed to add amenity. Please try again.');
      setAddLoading(false);
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-white justify-center items-center">
        {isEditing ? (
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
        ) : isAdding ? (
          <TouchableHighlight
            underlayColor={"#86ebaa"} 
            className="w-24 h-24 absolute bottom-[2%] right-[2%] bg-primary rounded-3xl z-10" 
            onPress={handleAdd}
            disabled={addLoading}
          >
              <>
                  <View className="w-full h-full items-center justify-center">
                      {addLoading ? (
                          <ActivityIndicator size="large" color="#ffffff" />
                      ) : (
                          <>
                              <Image 
                                  tintColor='#ffffff'
                                  source={icons.add}
                                  className="w-[40%] h-[40%]"
                                  resizeMode='contain'
                              />
                              <Text className="text-xl text-white font-rmedium">ADD</Text>
                          </>
                      )}
                  </View>
              </>
          </TouchableHighlight>
        ) : (
          <></>
        )}
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={true} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
          {isEditing ? (
            <>
              {/* Title */}
              <Text className="font-pbold text-xl text-black py-[6%]">AMENITY DETAILS</Text>
              {/* Amenity Body */}
              <View className="w-[93%] justify-center">
                {/* Amenity ID */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%]">Amenity ID:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary-hidden justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-primary-hidden"
                        placeholder='Amenity ID'
                        editable={false}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.id ? updatedFields?.id : ''}
                        onChangeText={(value) => handleInputChange('id', value)}
                    />
                </View>
                {/* Name */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Name:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Name'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.name ? updatedFields.name : ''}
                        onChangeText={(value) => handleInputChange('name', value)}
                    />
                </View>
                {/* Description */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Description:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Name'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.description ? updatedFields.description : ''}
                        onChangeText={(value) => handleInputChange('description', value)}
                    />
                </View>
                {/* Address */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Address:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Address'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.address ? updatedFields.address : ''}
                        onChangeText={(value) => handleInputChange('address', value)}
                    />
                </View>
                {/* Location */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Location:</Text>
                <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showLocation ? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                    <TextInput
                      className={`w-full text-md font-pmedium ${!showLocation ? "text-black" : "text-primary-hidden"} ml-4`}
                      placeholder='Location'
                      editable={false}
                      placeholderTextColor='#94A3B8'
                      value={updatedFields?.location ? `${updatedFields.location.latitude}, ${updatedFields.location.longitude}` : ''}
                    />
                    {/* Edit Location Button */}
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4 rounded-full" onPress={() => setShowLocation(!showLocation)}>
                        <Image 
                          tintColor="#57b378"
                          source={!showLocation ? icons.editing : icons.edit}
                          className="w-6 h-6"
                          resizeMode='contain'
                        />
                    </TouchableHighlight>
                </View>
                {/* Edit Location */}
                {showLocation && (<>
                  {/* Latitude */}
                  <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Latitude:</Text>
                  <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                    <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder='Latitude'
                      inputMode='numeric'
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={String(updatedFields?.location?.latitude || '')}
                      onChangeText={(value) => handleInputChange('location.latitude', value)}
                    />
                  </View>
                  {/* Longitude */}
                  <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Longitude:</Text>
                  <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                    <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder='Longitude'
                      inputMode='numeric'
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={String(updatedFields?.location?.longitude || '')}
                      onChangeText={(value) => handleInputChange('location.longitude', value)}
                    />
                  </View>
                </>)}
                {/* Amenity Type */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Type:</Text>
                <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showType? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                    <TextInput
                        className={`w-full text-md font-pmedium ${!showType ? "text-black" : "text-primary-hidden"} ml-4`}
                        placeholder='Type'
                        editable={false}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.type
                            ? translate(updatedFields.type)
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
                {/* Edit Amenity Type */}
                {showType && (
                    <>
                        <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Change Amenity Type:</Text>
                        <View className="w-full h-16 justify-center items-center flex-row">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                {/* Fire Station */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'fire_station' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'fire_station')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${updatedFields?.type === 'fire_station' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Fire Station'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {/* Police Station */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'police' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'police')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${updatedFields?.type === 'police' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Police Station'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {/* Disaster */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'disaster' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'disaster')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${updatedFields?.type === 'disaster' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'DRRMO'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {/* Barangay */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.type === 'barangay' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleInputChange('type', 'barangay')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${updatedFields?.type === 'barangay' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Barangay'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </ScrollView>
                        </View>
                    </>
                )}
                {/* Phone Number */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Phone Number:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center flex-row px-[10%] overflow-hidden">
                  <TextInput
                    className="w-full text-md font-pmedium text-black ml-4"
                    placeholder='Phone Number 1'
                    inputMode='tel'
                    editable={true}
                    placeholderTextColor='#94A3B8'
                    value={updatedFields?.phone?.[0] || ''}
                    onChangeText={(value) => handleInputChange('phone.0', value)}
                  />
                  {/* Add Number Button */}
                  <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4 rounded-full" onPress={() => handleAddPhone()}>
                    <Image 
                      tintColor="#57b378"
                      source={icons.add}
                      className="w-6 h-6"
                      resizeMode='contain'
                    />
                  </TouchableHighlight>
                </View>
                {updatedFields?.phone?.length > 1 &&
                updatedFields.phone.slice(1).map((phone, index) => (
                  <View
                    key={index}
                    className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center flex-row px-[10%] overflow-hidden mt-[2%]">
                    <TextInput
                      className="w-full text-md font-pmedium text-black ml-4"
                      placeholder={`Phone Number ${index + 2}`}
                      inputMode='tel'
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={phone || ''}
                      onChangeText={(value) => handleInputChange(`phone.${index + 1}`, value)} // Adjust for index
                    />
                    {/* Delete Number Button */}
                    <TouchableHighlight underlayColor={"#ffb0ab"} className="p-4 rounded-full" onPress={() => handleDeletePhone(phone)}>
                        <Image 
                          tintColor="#ef4444"
                          source={icons.deletePhoto}
                          className="w-6 h-6"
                          resizeMode='contain'
                        />
                    </TouchableHighlight>
                  </View>
                ))}
                {/* Email */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Email:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Email'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.email ? updatedFields.email : ''}
                        onChangeText={(value) => handleInputChange('email', value)}
                    />
                </View>
                {/* Website */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Website:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Website'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={updatedFields?.website ? updatedFields.website : ''}
                        onChangeText={(value) => handleInputChange('website', value)}
                    />
                </View>
                {/* Services */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">{'Service(s)'}:</Text>
                <View className="w-full h-16 bg-white flex-row items-center justify-between">
                  {/* Service */}
                  <View className="w-[64%] h-full bg-white rounded-2xl border-2 border-black justify-center items-center flex-row px-[10%] overflow-hidden">
                    <TextInput
                      className="w-full text-md font-pmedium text-black ml-4"
                      placeholder='Service(s)'
                      editable={false}
                      placeholderTextColor='#94A3B8'
                      value={
                        updatedFields?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' :
                        updatedFields?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : ''
                      }
                    />
                    {/* Edit Service Button */}
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4 rounded-full" onPress={() => setShowService(!showService)}>
                      <Image 
                        tintColor="#57b378"
                        source={!showService ? icons.editing : icons.edit}
                        className="w-6 h-6"
                        resizeMode='contain'
                      />
                    </TouchableHighlight>
                  </View>
                  {/* Service Count */}
                  <View className="w-[34%] h-full bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder="Count"
                      inputMode="numeric"
                      maxLength={2} // Accept up to two digits but process only the latest one
                      editable={true}
                      placeholderTextColor="#94A3B8"
                      value={String(updatedFields?.services?.length || '')} // Reflect current service count
                      onChangeText={handleServiceCountChange}
                    />
                  </View>
                </View>
                {showService && (<>
                  <>
                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Change Service:</Text>
                    <View className="w-full h-16 justify-center items-center flex-row">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {/* Ambulance */}
                            <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.services?.some(service => service.ambulance !== undefined) ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleServiceToggle('ambulance')}>
                                <View className="h-full justify-center items-center flex-row overflow-hidden">
                                    <View className="h-full justify-center">
                                        <Text className={`${updatedFields?.services?.some(service => service.ambulance !== undefined) ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Ambulance'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                            {/*Firetruck */}
                            <TouchableHighlight className={`h-[70%] rounded-3xl ${updatedFields?.services?.some(service => service.firetruck !== undefined) ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleServiceToggle('firetruck')}>
                                <View className="h-full justify-center items-center flex-row overflow-hidden">
                                    <View className="h-full justify-center">
                                        <Text className={`${updatedFields?.services?.some(service => service.firetruck !== undefined) ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Firetruck'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </ScrollView>
                    </View>
                  </>
                </>)}
                {/* Amenity Key */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Amenity Key:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                  <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder='Amenity Key'
                      inputMode='numeric'
                      maxLength={4}
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={updatedFields?.amenity_key ? updatedFields.amenity_key : ''}
                      onChangeText={(value) => handleInputChange('amenity_key', value)}
                  />
                </View>
              </View>
              <View className="w-full mb-24"/>
            </>
          ) : isAdding ? (
            <>
              {/* Title */}
              <Text className="font-pbold text-xl text-black py-[6%]">ADD AMENITY</Text>
              {/* Amenity Body */}
              <View className="w-[93%] justify-center">
                {/* Name */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">{'Name:'}</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Name'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={amenityData?.name ? amenityData.name : ''}
                        onChangeText={(value) => handleNewInputChange('name', value)}
                    />
                </View>
                {/* Description */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">{'Description:'}</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Description'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={amenityData?.description ? amenityData.description : ''}
                        onChangeText={(value) => handleNewInputChange('description', value)}
                    />
                </View>
                {/* Address */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">{'Address:'}</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Address'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={amenityData?.address ? amenityData.address : ''}
                        onChangeText={(value) => handleNewInputChange('address', value)}
                    />
                </View>
                {/* Location */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Location:</Text>
                <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showNewLocation ? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                    <TextInput
                      className={`w-full text-md font-pmedium ${!showNewLocation ? "text-black" : "text-primary-hidden"} ml-4`}
                      placeholder='Location'
                      editable={false}
                      placeholderTextColor='#94A3B8'
                      value={amenityData?.location ? `${amenityData.location.latitude}, ${amenityData.location.longitude}` : ''}
                    />
                    {/* Edit Location Button */}
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4 rounded-full" onPress={() => setShowNewLocation(!showNewLocation)}>
                        <Image 
                          tintColor="#57b378"
                          source={!showNewLocation ? icons.editing : icons.edit}
                          className="w-6 h-6"
                          resizeMode='contain'
                        />
                    </TouchableHighlight>
                </View>
                {/* Edit Location */}
                {showNewLocation && (<>
                  {/* Latitude */}
                  <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Latitude:</Text>
                  <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                    <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder='Latitude'
                      inputMode='numeric'
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={String(amenityData?.location?.latitude || '')}
                      onChangeText={(value) => handleNewInputChange('location.latitude', value)}
                    />
                  </View>
                  {/* Longitude */}
                  <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Longitude:</Text>
                  <View className="w-full h-16 bg-white rounded-2xl border-2 border-primary justify-center items-center flex-row px-4">
                    <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder='Longitude'
                      inputMode='numeric'
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={String(amenityData?.location?.longitude || '')}
                      onChangeText={(value) => handleNewInputChange('location.longitude', value)}
                    />
                  </View>
                </>)}
                {/* Amenity Type */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Type:</Text>
                <View className={`w-full h-16 bg-white rounded-2xl border-2 ${!showNewType? "border-black" : "border-primary-hidden"} justify-center items-center flex-row px-[10%] overflow-hidden`}>
                    <TextInput
                        className={`w-full text-md font-pmedium ${!showNewType ? "text-black" : "text-primary-hidden"} ml-4`}
                        placeholder='Type'
                        editable={false}
                        placeholderTextColor='#94A3B8'
                        value={amenityData?.type
                            ? translate(amenityData.type)
                            : '' }
                    />
                    {/* Edit User Type Button */}
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4" onPress={() => setNewShowType(!showNewType)}>
                        <Image 
                            tintColor="#57b378"
                            source={!showNewType ? icons.editing : icons.edit}
                            className="w-6 h-6"
                            resizeMode='contain'
                        />
                    </TouchableHighlight>
                </View>
                {/* Edit Amenity Type */}
                {showNewType && (
                    <>
                        <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Change Amenity Type:</Text>
                        <View className="w-full h-16 justify-center items-center flex-row">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                {/* Fire Station */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${amenityData?.type === 'fire_station' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleNewInputChange('type', 'fire_station')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${amenityData?.type === 'fire_station' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Fire Station'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {/* Police Station */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${amenityData?.type === 'police' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleNewInputChange('type', 'police')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${amenityData?.type === 'police' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Police Station'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {/* Disaster */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${amenityData?.type === 'disaster' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleNewInputChange('type', 'disaster')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${amenityData?.type === 'disaster' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'DRRMO'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                {/* Barangay */}
                                <TouchableHighlight className={`h-[70%] rounded-3xl ${amenityData?.type === 'barangay' ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleNewInputChange('type', 'barangay')}>
                                    <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="h-full justify-center">
                                            <Text className={`${amenityData?.type === 'barangay' ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Barangay'}</Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </ScrollView>
                        </View>
                    </>
                )}
                {/* Phone Number */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Phone Number:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center flex-row px-[10%] overflow-hidden">
                  <TextInput
                    className="w-full text-md font-pmedium text-black ml-4"
                    placeholder='Phone Number 1'
                    inputMode='tel'
                    editable={true}
                    placeholderTextColor='#94A3B8'
                    value={amenityData?.phone?.[0] || ''}
                    onChangeText={(value) => handleNewInputChange('phone.0', value)}
                  />
                  {/* Add Number Button */}
                  <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4 rounded-full" onPress={() => handleNewAddPhone()}>
                    <Image 
                      tintColor="#57b378"
                      source={icons.add}
                      className="w-6 h-6"
                      resizeMode='contain'
                    />
                  </TouchableHighlight>
                </View>
                {amenityData?.phone?.length > 1 &&
                  amenityData.phone.slice(1).map((phone, index) => (
                  <View
                    key={index}
                    className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center flex-row px-[10%] overflow-hidden mt-[2%]">
                    <TextInput
                      className="w-full text-md font-pmedium text-black ml-4"
                      placeholder={`Phone Number ${index + 2}`}
                      inputMode='tel'
                      editable={true}
                      placeholderTextColor='#94A3B8'
                      value={phone || ''}
                      onChangeText={(value) => handleNewInputChange(`phone.${index + 1}`, value)} // Adjust for index
                    />
                    {/* Delete Number Button */}
                    <TouchableHighlight underlayColor={"#ffb0ab"} className="p-4 rounded-full" onPress={() => handleNewDeletePhone(phone)}>
                        <Image 
                          tintColor="#ef4444"
                          source={icons.deletePhoto}
                          className="w-6 h-6"
                          resizeMode='contain'
                        />
                    </TouchableHighlight>
                  </View>
                ))}
                {/* Email */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Email:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Email'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={amenityData?.email ? amenityData.email : ''}
                        onChangeText={(value) => handleNewInputChange('email', value)}
                    />
                </View>
                {/* Website */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Website:</Text>
                <View className="w-full h-16 bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                        className="w-full text-md font-pmedium text-black"
                        placeholder='Website'
                        editable={true}
                        placeholderTextColor='#94A3B8'
                        value={amenityData?.website ? amenityData.website : ''}
                        onChangeText={(value) => handleNewInputChange('website', value)}
                    />
                </View>
                {/* Services */}
                <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">{'Service(s)'}:</Text>
                <View className="w-full h-16 bg-white flex-row items-center justify-between">
                  {/* Service */}
                  <View className="w-[64%] h-full bg-white rounded-2xl border-2 border-black justify-center items-center flex-row px-[10%] overflow-hidden">
                    <TextInput
                      className="w-full text-md font-pmedium text-black ml-4"
                      placeholder='Service(s)'
                      editable={false}
                      placeholderTextColor='#94A3B8'
                      value={
                        amenityData?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' :
                        amenityData?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : ''
                      }
                    />
                    {/* Edit Service Button */}
                    <TouchableHighlight underlayColor={"#d9ffe6"} className="p-4 rounded-full" onPress={() => setNewShowService(!showNewService)}>
                      <Image 
                        tintColor="#57b378"
                        source={!showService ? icons.editing : icons.edit}
                        className="w-6 h-6"
                        resizeMode='contain'
                      />
                    </TouchableHighlight>
                  </View>
                  {/* Service Count */}
                  <View className="w-[34%] h-full bg-white rounded-2xl border-2 border-black justify-center items-center px-4">
                    <TextInput
                      className="w-full text-md font-pmedium text-black"
                      placeholder="Count"
                      inputMode="numeric"
                      maxLength={2} // Accept up to two digits but process only the latest one
                      editable={true}
                      placeholderTextColor="#94A3B8"
                      value={String(amenityData?.services?.length || '')} // Reflect current service count
                      onChangeText={handleNewServiceCountChange}
                    />
                  </View>
                </View>
                {showNewService && (<>
                  <>
                    <Text className="font-pregular text-base text-black pb-[2%] pl-[4%] pt-[2%]">Change Service:</Text>
                    <View className="w-full h-16 justify-center items-center flex-row">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                            {/* Ambulance */}
                            <TouchableHighlight className={`h-[70%] rounded-3xl ${amenityData?.services?.some(service => service.ambulance !== undefined) ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleNewServiceToggle('ambulance')}>
                                <View className="h-full justify-center items-center flex-row overflow-hidden">
                                    <View className="h-full justify-center">
                                        <Text className={`${amenityData?.services?.some(service => service.ambulance !== undefined) ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Ambulance'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                            {/*Firetruck */}
                            <TouchableHighlight className={`h-[70%] rounded-3xl ${amenityData?.services?.some(service => service.firetruck !== undefined) ? 'bg-primary' : 'bg-white border-primary border-[1px]'} overflow-hidden px-6 mr-2`} underlayColor={'#fffd99'} onPress={() => handleNewServiceToggle('firetruck')}>
                                <View className="h-full justify-center items-center flex-row overflow-hidden">
                                    <View className="h-full justify-center">
                                        <Text className={`${amenityData?.services?.some(service => service.firetruck !== undefined) ? 'text-white' : 'text-black'} font-pmedium text-sm`}>{'Firetruck'}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </ScrollView>
                    </View>
                  </>
                </>)}
              </View>
              <View className="w-full mb-24"/>
            </>
          ) : (
            <>
              {/* Reset All Amenity Keys */}
              <View className="w-full h-12 items-center justify-center px-2 mt-6">
                  <TouchableHighlight 
                      className="w-full h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6" 
                      underlayColor={'#fffd99'} 
                      onPress={handleResetAllKeys}
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
                                      <Text className="text-black font-pregular text-sm">{'Reset Amenity Keys'}</Text>
                                  </View>
                              </>
                          )}
                      </View>
                  </TouchableHighlight>
              </View>
              {/* Add Amenity */}
              <View className="w-full h-12 items-center justify-center px-2 my-2">
                  <TouchableHighlight 
                      className="w-full h-full bg-white rounded-3xl border-primary border-[1px] overflow-hidden px-6" 
                      underlayColor={'#fffd99'} 
                      onPress={() => setIsAdding(true)}
                  >
                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                        <View className="w-6 h-full items-center justify-center">
                            <Image
                                tintColor={'#57b378'}
                                source={icons.add}
                                className="w-[80%] h-[80%]"
                                resizeMode='contain'
                            />
                        </View>
                        <View className="h-full justify-center pl-[4%]">
                            <Text className="text-black font-pregular text-sm">{'Add Amenity'}</Text>
                        </View>
                      </View>
                  </TouchableHighlight>
              </View>
              {/* Fire Station Amenities */}
              {fireAmenities.length > 0 && 
              <View className="w-full h-12 justify-center mt-4 pl-4">
                <Text className="text-xl text-black font-psemibold">{`FIRE STATIONS (${fireAmenities?.length})`}</Text>
                <TouchableHighlight 
                    className="w-14 h-12 bg-white rounded-3xl border-primary border-[1px] overflow-hidden absolute right-2" 
                    underlayColor={'#fffd99'} 
                    onPress={() => setCollapseFire(!collapseFire)}
                >
                    <View className="w-full h-full justify-center items-center flex-row overflow-hidden">
                        <Image
                            tintColor={'#57b378'}
                            source={collapseFire ? icons.expandUp : icons.expandDown}
                            className="w-[50%] h-[50%]"
                            resizeMode='contain'
                        />
                    </View>
                </TouchableHighlight>
              </View>}
              {collapseFire && fireAmenities?.map((amenity) => (
                !expandedStates[amenity.id] ? (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit">
                        <TouchableHighlight
                            underlayColor={'#fffd99'}
                            className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}
                            onPress={() => toggleExpandDashboard(amenity.id)}
                        >
                            <>
                                {/* Amenity Name */}
                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                        {amenity.name}
                                        {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                                    </Text>
                                </View>
                                {/* Services */}
                                <View className={`mx-2 absolute top-[15%] right-[1%] ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                    {/* Service Icons */}
                                    <View className="w-6 items-center justify-center">
                                        <Image
                                            tintColor={'#ffffff'}
                                            source={
                                              amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                              icons.policeCar
                                            }
                                            className="w-[70%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    {/* Service Text */}
                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                        <Text className="text-white font-pregular text-xs">
                                          {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                          amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                        </Text>
                                    </View>
                                </View>
                                {/* Address */}
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                    {/* Responders Count */}
                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image
                                                tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                                source={icons.aboutUs}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center">
                                            <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-xs text-right`}>
                                                {amenity?.responders?.length}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        </TouchableHighlight>
                    </View>
                ) : (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit items-center justify-center">
                        {/* Expanded View */}
                        <View className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}>
                            {/* Status Top */}
                            <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Service Available */}
                                    <View className={`h-full ${amenity.key_date ? 'ml-4' : 'ml-2'} ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Service Icons */}
                                        <View className="w-6 h-full items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={
                                                  amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                                  amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                                  icons.policeCar
                                                }
                                                className="w-[60%] h-[60%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Service Text */}
                                        <View className="h-full justify-center pl-[4%]">
                                            <Text className="text-white font-pregular text-xs">
                                              {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Amenity Type */}
                                    <View className={`h-full mx-2 ${colorGenerator(amenity.type)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Type Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Type Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{translate(amenity.type)}</Text>
                                        </View>
                                    </View>
                                    {/* Amenity Key */}
                                    {amenity.key_date && 
                                      <View className={`h-full mr-4 ${isValidKeyDate(amenity.key_date, new Date()) ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Key Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={icons.key}
                                                className="w-[70%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Key Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{amenity.amenity_key}{amenity.key_date ? ` - ${formatKeyDate(amenity.key_date)}` : ''}</Text>
                                        </View>
                                      </View>
                                    }
                                </ScrollView>
                            </View>
                            {/* Amenity Name */}
                            <View className="w-[90%] h-fit mb-[1%] px-4">
                              <Text className={`text-primary-300 font-psemibold text-sm`}>
                                {amenity.name}
                                {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                              </Text>
                            </View>
                            {/* Amenity Address */}
                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                <Text className="w-[80%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                {/* Responder Count */}
                                <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                  <View className="w-[40%] h-full items-center justify-center">
                                      <Image
                                          tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                          source={icons.aboutUs}
                                          className="w-[70%] h-[70%]"
                                          resizeMode='contain'
                                      />
                                  </View>
                                  <View className="h-full justify-center">
                                      <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-sm text-right`}>{amenity?.responders?.length}</Text>
                                  </View>
                                </View>
                            </View>
                            {/* Expanded Stuff */}
                            <View className="w-full h-14 justify-center">
                                <TouchableHighlight
                                    underlayColor={'#fffd99'}
                                    className={`w-full h-full flex-row ${colorGenerator(amenity.type)} items-center px-4`}
                                    onPress={() => toggleExpandDashboard(amenity.id)}
                                >
                                    <>
                                      {/* Amenity Type Icon */}
                                      <View className="w-[10%] h-[80%] justify-center">
                                          <Image
                                              tintColor={'#ffffff'}
                                              source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                              className="w-[50%] h-[50%]"
                                              resizeMode='contain'
                                          />
                                      </View>
                                      {/* Amenity Description Text */}
                                      <View className="w-[90%] h-[80%] justify-center">
                                          <Text className="text-white font-pregular text-xs">
                                            {amenity.description}
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
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'ml-12' : 'ml-6'}`}
                                underlayColor={'#fffd99'} 
                                onPress={() => handleEdit(amenity)}
                              >
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
                              {amenity.amenity_key ? (
                                <>
                                  {/* Reset Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleResetKey(amenity.id)}
                                  >
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
                                          <Text className="text-black font-pregular text-sm">{'Reset Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                  {/* Remake Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mr-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Remake Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                </>
                              ) : <>
                                  {/* Create Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Create Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                              </>}
                              {/* Delete Button */}
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'mr-12' : 'mr-6'}`}
                                underlayColor={'#fffd99'}
                                onPress={() => handleDelete(amenity.id)}
                              >
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
              {/* Police Station Amenities */}
              {policeAmenities.length > 0 &&
              <View className="w-full h-12 justify-center mt-4 pl-4">
                <Text className="text-xl text-black font-psemibold">{`POLICE STATIONS (${policeAmenities?.length})`}</Text>
                <TouchableHighlight 
                    className="w-14 h-12 bg-white rounded-3xl border-primary border-[1px] overflow-hidden absolute right-2" 
                    underlayColor={'#fffd99'} 
                    onPress={() => setCollapsePolice(!collapsePolice)}
                >
                    <View className="w-full h-full justify-center items-center flex-row overflow-hidden">
                        <Image
                            tintColor={'#57b378'}
                            source={collapsePolice ? icons.expandUp : icons.expandDown}
                            className="w-[50%] h-[50%]"
                            resizeMode='contain'
                        />
                    </View>
                </TouchableHighlight>
              </View>}
              {collapsePolice && policeAmenities?.map((amenity) => (
                !expandedStates[amenity.id] ? (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit">
                        <TouchableHighlight
                            underlayColor={'#fffd99'}
                            className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}
                            onPress={() => toggleExpandDashboard(amenity.id)}
                        >
                            <>
                                {/* Amenity Name */}
                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                        {amenity.name}
                                        {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                                    </Text>
                                </View>
                                {/* Services */}
                                <View className={`mx-2 absolute top-[15%] right-[1%] ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                    {/* Service Icons */}
                                    <View className="w-6 items-center justify-center">
                                        <Image
                                            tintColor={'#ffffff'}
                                            source={
                                              amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                              icons.policeCar
                                            }
                                            className="w-[70%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    {/* Service Text */}
                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                        <Text className="text-white font-pregular text-xs">
                                          {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                          amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                        </Text>
                                    </View>
                                </View>
                                {/* Address */}
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                    {/* Responders Count */}
                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image
                                                tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                                source={icons.aboutUs}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center">
                                            <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-xs text-right`}>
                                                {amenity?.responders?.length}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        </TouchableHighlight>
                    </View>
                ) : (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit items-center justify-center">
                        {/* Expanded View */}
                        <View className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}>
                            {/* Status Top */}
                            <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Service Available */}
                                    <View className={`h-full ${amenity.key_date ? 'ml-4' : 'ml-2'} ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Service Icons */}
                                        <View className="w-6 h-full items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={
                                                  amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                                  amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                                  icons.policeCar
                                                }
                                                className="w-[60%] h-[60%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Service Text */}
                                        <View className="h-full justify-center pl-[4%]">
                                            <Text className="text-white font-pregular text-xs">
                                              {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Amenity Type */}
                                    <View className={`h-full mx-2 ${colorGenerator(amenity.type)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Type Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Type Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{translate(amenity.type)}</Text>
                                        </View>
                                    </View>
                                    {/* Amenity Key */}
                                    {amenity.key_date && 
                                      <View className={`h-full mr-4 ${isValidKeyDate(amenity.key_date, new Date()) ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Key Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={icons.key}
                                                className="w-[70%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Key Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{amenity.amenity_key}{amenity.key_date ? ` - ${formatKeyDate(amenity.key_date)}` : ''}</Text>
                                        </View>
                                      </View>
                                    }
                                </ScrollView>
                            </View>
                            {/* Amenity Name */}
                            <View className="w-[90%] h-fit mb-[1%] px-4">
                              <Text className={`text-primary-300 font-psemibold text-sm`}>
                                {amenity.name}
                                {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                              </Text>
                            </View>
                            {/* Amenity Address */}
                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                <Text className="w-[80%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                {/* Responder Count */}
                                <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                  <View className="w-[40%] h-full items-center justify-center">
                                      <Image
                                          tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                          source={icons.aboutUs}
                                          className="w-[70%] h-[70%]"
                                          resizeMode='contain'
                                      />
                                  </View>
                                  <View className="h-full justify-center">
                                      <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-sm text-right`}>{amenity?.responders?.length}</Text>
                                  </View>
                                </View>
                            </View>
                            {/* Expanded Stuff */}
                            <View className="w-full h-14 justify-center">
                                <TouchableHighlight
                                    underlayColor={'#fffd99'}
                                    className={`w-full h-full flex-row ${colorGenerator(amenity.type)} items-center px-4`}
                                    onPress={() => toggleExpandDashboard(amenity.id)}
                                >
                                    <>
                                      {/* Amenity Type Icon */}
                                      <View className="w-[10%] h-[80%] justify-center">
                                          <Image
                                              tintColor={'#ffffff'}
                                              source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                              className="w-[50%] h-[50%]"
                                              resizeMode='contain'
                                          />
                                      </View>
                                      {/* Amenity Description Text */}
                                      <View className="w-[90%] h-[80%] justify-center">
                                          <Text className="text-white font-pregular text-xs">
                                            {amenity.description}
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
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'ml-12' : 'ml-6'}`}
                                underlayColor={'#fffd99'} 
                                onPress={() => handleEdit(amenity)}
                              >
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
                              {amenity.amenity_key ? (
                                <>
                                  {/* Reset Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleResetKey(amenity.id)}
                                  >
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
                                          <Text className="text-black font-pregular text-sm">{'Reset Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                  {/* Remake Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mr-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Remake Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                </>
                              ) : <>
                                  {/* Create Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Create Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                              </>}
                              {/* Delete Button */}
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'mr-12' : 'mr-6'}`}
                                underlayColor={'#fffd99'}
                                onPress={() => handleDelete(amenity.id)}
                              >
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
              {/* Disaster Amenities */}
              {disasterAmenities.length > 0 &&
              <View className="w-full h-12 justify-center mt-4 pl-4">
                <Text className="text-xl text-black font-psemibold">{`DRRMO (${disasterAmenities?.length})`}</Text>
                <TouchableHighlight 
                    className="w-14 h-12 bg-white rounded-3xl border-primary border-[1px] overflow-hidden absolute right-2" 
                    underlayColor={'#fffd99'} 
                    onPress={() => setCollapseDisaster(!collapseDisaster)}
                >
                    <View className="w-full h-full justify-center items-center flex-row overflow-hidden">
                        <Image
                            tintColor={'#57b378'}
                            source={collapseDisaster ? icons.expandUp : icons.expandDown}
                            className="w-[50%] h-[50%]"
                            resizeMode='contain'
                        />
                    </View>
                </TouchableHighlight>
              </View>}
              {collapseDisaster && disasterAmenities?.map((amenity) => (
                !expandedStates[amenity.id] ? (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit">
                        <TouchableHighlight
                            underlayColor={'#fffd99'}
                            className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}
                            onPress={() => toggleExpandDashboard(amenity.id)}
                        >
                            <>
                                {/* Amenity Name */}
                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                        {amenity.name}
                                        {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                                    </Text>
                                </View>
                                {/* Services */}
                                <View className={`mx-2 absolute top-[15%] right-[1%] ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                    {/* Service Icons */}
                                    <View className="w-6 items-center justify-center">
                                        <Image
                                            tintColor={'#ffffff'}
                                            source={
                                              amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                              icons.policeCar
                                            }
                                            className="w-[70%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    {/* Service Text */}
                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                        <Text className="text-white font-pregular text-xs">
                                          {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                          amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                        </Text>
                                    </View>
                                </View>
                                {/* Address */}
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                    {/* Responders Count */}
                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image
                                                tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                                source={icons.aboutUs}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center">
                                            <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-xs text-right`}>
                                                {amenity?.responders?.length}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        </TouchableHighlight>
                    </View>
                ) : (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit items-center justify-center">
                        {/* Expanded View */}
                        <View className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}>
                            {/* Status Top */}
                            <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Service Available */}
                                    <View className={`h-full ${amenity.key_date ? 'ml-4' : 'ml-2'} ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Service Icons */}
                                        <View className="w-6 h-full items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={
                                                  amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                                  amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                                  icons.policeCar
                                                }
                                                className="w-[60%] h-[60%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Service Text */}
                                        <View className="h-full justify-center pl-[4%]">
                                            <Text className="text-white font-pregular text-xs">
                                              {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Amenity Type */}
                                    <View className={`h-full mx-2 ${colorGenerator(amenity.type)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Type Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Type Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{translate(amenity.type)}</Text>
                                        </View>
                                    </View>
                                    {/* Amenity Key */}
                                    {amenity.key_date && 
                                      <View className={`h-full mr-4 ${isValidKeyDate(amenity.key_date, new Date()) ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Key Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={icons.key}
                                                className="w-[70%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Key Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{amenity.amenity_key}{amenity.key_date ? ` - ${formatKeyDate(amenity.key_date)}` : ''}</Text>
                                        </View>
                                      </View>
                                    }
                                </ScrollView>
                            </View>
                            {/* Amenity Name */}
                            <View className="w-[90%] h-fit mb-[1%] px-4">
                              <Text className={`text-primary-300 font-psemibold text-sm`}>
                                {amenity.name}
                                {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                              </Text>
                            </View>
                            {/* Amenity Address */}
                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                <Text className="w-[80%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                {/* Responder Count */}
                                <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                  <View className="w-[40%] h-full items-center justify-center">
                                      <Image
                                          tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                          source={icons.aboutUs}
                                          className="w-[70%] h-[70%]"
                                          resizeMode='contain'
                                      />
                                  </View>
                                  <View className="h-full justify-center">
                                      <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-sm text-right`}>{amenity?.responders?.length}</Text>
                                  </View>
                                </View>
                            </View>
                            {/* Expanded Stuff */}
                            <View className="w-full h-14 justify-center">
                                <TouchableHighlight
                                    underlayColor={'#fffd99'}
                                    className={`w-full h-full flex-row ${colorGenerator(amenity.type)} items-center px-4`}
                                    onPress={() => toggleExpandDashboard(amenity.id)}
                                >
                                    <>
                                      {/* Amenity Type Icon */}
                                      <View className="w-[10%] h-[80%] justify-center">
                                          <Image
                                              tintColor={'#ffffff'}
                                              source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                              className="w-[50%] h-[50%]"
                                              resizeMode='contain'
                                          />
                                      </View>
                                      {/* Amenity Description Text */}
                                      <View className="w-[90%] h-[80%] justify-center">
                                          <Text className="text-white font-pregular text-xs">
                                            {amenity.description}
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
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'ml-12' : 'ml-6'}`}
                                underlayColor={'#fffd99'} 
                                onPress={() => handleEdit(amenity)}
                              >
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
                              {amenity.amenity_key ? (
                                <>
                                  {/* Reset Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleResetKey(amenity.id)}
                                  >
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
                                          <Text className="text-black font-pregular text-sm">{'Reset Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                  {/* Remake Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mr-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Remake Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                </>
                              ) : <>
                                  {/* Create Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Create Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                              </>}
                              {/* Delete Button */}
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'mr-12' : 'mr-6'}`}
                                underlayColor={'#fffd99'}
                                onPress={() => handleDelete(amenity.id)}
                              >
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
              {/*Barangay Amenities */}
              {barangayAmenities.length > 0 &&
              <View className="w-full h-12 justify-center mt-4 pl-4">
                <Text className="text-xl text-black font-psemibold">{`BARANGAYS (${barangayAmenities?.length})`}</Text>
                <TouchableHighlight 
                    className="w-14 h-12 bg-white rounded-3xl border-primary border-[1px] overflow-hidden absolute right-2" 
                    underlayColor={'#fffd99'} 
                    onPress={() => setCollapseBarangay(!collapseBarangay)}
                >
                    <View className="w-full h-full justify-center items-center flex-row overflow-hidden">
                        <Image
                            tintColor={'#57b378'}
                            source={collapseBarangay ? icons.expandUp : icons.expandDown}
                            className="w-[50%] h-[50%]"
                            resizeMode='contain'
                        />
                    </View>
                </TouchableHighlight>
              </View>}
              {collapseBarangay && barangayAmenities?.map((amenity) => (
                !expandedStates[amenity.id] ? (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit">
                        <TouchableHighlight
                            underlayColor={'#fffd99'}
                            className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}
                            onPress={() => toggleExpandDashboard(amenity.id)}
                        >
                            <>
                                {/* Amenity Name */}
                                <View className="w-[70%] h-fit mb-[1%] mt-[4%] px-4">
                                    <Text className={`text-primary-300 font-psemibold text-sm`}>
                                        {amenity.name}
                                        {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                                    </Text>
                                </View>
                                {/* Services */}
                                <View className={`mx-2 absolute top-[15%] right-[1%] ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden p-1 pr-2`}>
                                    {/* Service Icons */}
                                    <View className="w-6 items-center justify-center">
                                        <Image
                                            tintColor={'#ffffff'}
                                            source={
                                              amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                              icons.policeCar
                                            }
                                            className="w-[70%] h-[70%]"
                                            resizeMode='contain'
                                        />
                                    </View>
                                    {/* Service Text */}
                                    <View className="h-full justify-center pl-[2%] bottom-[1%]">
                                        <Text className="text-white font-pregular text-xs">
                                          {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                          amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                        </Text>
                                    </View>
                                </View>
                                {/* Address */}
                                <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                    <Text className="w-[68%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                    {/* Responders Count */}
                                    <View className="w-[25%] h-8 absolute right-4 flex-row justify-end">
                                        <View className="w-[40%] h-full items-center justify-center">
                                            <Image
                                                tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                                source={icons.aboutUs}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        <View className="h-full justify-center">
                                            <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-xs text-right`}>
                                                {amenity?.responders?.length}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        </TouchableHighlight>
                    </View>
                ) : (
                    <View key={amenity.id || amenity.amenity_id} className="w-[96%] h-fit items-center justify-center">
                        {/* Expanded View */}
                        <View className={`w-full h-fit bg-white border-[1px] ${borderGenerator(amenity.type)} mt-4 rounded-3xl overflow-hidden`}>
                            {/* Status Top */}
                            <View className="w-full h-8 mt-[4%] mb-[2%] px-2">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full h-full" contentContainerStyle={{ alignItems: 'center', justifyContent: 'center'}}>
                                    {/* Service Available */}
                                    <View className={`h-full ${amenity.key_date ? 'ml-4' : 'ml-2'} ${amenity?.services?.some(service => service.firetruck) ? colorGenerator(amenity.type) : amenity?.services?.some(service => service.ambulance) ? colorGenerator(amenity.type) : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Service Icons */}
                                        <View className="w-6 h-full items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={
                                                  amenity?.services?.some(service => service.firetruck !== undefined) ? icons.fireTruck : 
                                                  amenity?.services?.some(service => service.ambulance !== undefined) ? icons.ambulance :
                                                  icons.policeCar
                                                }
                                                className="w-[60%] h-[60%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Service Text */}
                                        <View className="h-full justify-center pl-[4%]">
                                            <Text className="text-white font-pregular text-xs">
                                              {amenity?.services?.some(service => service.firetruck !== undefined) ? 'Firetruck' : 
                                              amenity?.services?.some(service => service.ambulance !== undefined) ? 'Ambulance' : 'Not Available'}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Amenity Type */}
                                    <View className={`h-full mx-2 ${colorGenerator(amenity.type)} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Type Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                                className="w-[50%] h-[50%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Type Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{translate(amenity.type)}</Text>
                                        </View>
                                    </View>
                                    {/* Amenity Key */}
                                    {amenity.key_date && 
                                      <View className={`h-full mr-4 ${isValidKeyDate(amenity.key_date, new Date()) ? 'bg-primary' : 'bg-slate-400'} rounded-3xl justify-center items-center flex-row overflow-hidden px-2`}>
                                        {/* Amenity Key Icon */}
                                        <View className="w-6 items-center justify-center">
                                            <Image
                                                tintColor={'#ffffff'}
                                                source={icons.key}
                                                className="w-[70%] h-[70%]"
                                                resizeMode='contain'
                                            />
                                        </View>
                                        {/* Amenity Key Text */}
                                        <View className="h-full justify-center pl-[2%]">
                                            <Text className="text-white font-pregular text-xs">{amenity.amenity_key}{amenity.key_date ? ` - ${formatKeyDate(amenity.key_date)}` : ''}</Text>
                                        </View>
                                      </View>
                                    }
                                </ScrollView>
                            </View>
                            {/* Amenity Name */}
                            <View className="w-[90%] h-fit mb-[1%] px-4">
                              <Text className={`text-primary-300 font-psemibold text-sm`}>
                                {amenity.name}
                                {amenity?.description && !/(BFP|Barangay)/i.test(amenity.name) ? ` ${amenity.description}` : ''}
                              </Text>
                            </View>
                            {/* Amenity Address */}
                            <View className="w-full h-fit mb-[4%] px-4 justify-center">
                                <Text className="w-[80%] text-slate-500 font-pregular text-xs">{amenity.address}</Text>
                                {/* Responder Count */}
                                <View className="w-[20%] h-8 absolute right-4 flex-row justify-end">
                                  <View className="w-[40%] h-full items-center justify-center">
                                      <Image
                                          tintColor={amenity?.responders?.length > 0 ? '#57b378' : '#64748b'}
                                          source={icons.aboutUs}
                                          className="w-[70%] h-[70%]"
                                          resizeMode='contain'
                                      />
                                  </View>
                                  <View className="h-full justify-center">
                                      <Text className={`${amenity?.responders?.length > 0 ? 'text-primary' : 'text-slate-500'} font-pregular text-sm text-right`}>{amenity?.responders?.length}</Text>
                                  </View>
                                </View>
                            </View>
                            {/* Expanded Stuff */}
                            <View className="w-full h-14 justify-center">
                                <TouchableHighlight
                                    underlayColor={'#fffd99'}
                                    className={`w-full h-full flex-row ${colorGenerator(amenity.type)} items-center px-4`}
                                    onPress={() => toggleExpandDashboard(amenity.id)}
                                >
                                    <>
                                      {/* Amenity Type Icon */}
                                      <View className="w-[10%] h-[80%] justify-center">
                                          <Image
                                              tintColor={'#ffffff'}
                                              source={amenity.type === 'fire_station' ? icons.fireLogo : amenity.type === 'police' ? icons.policeLogo : amenity.type === 'disaster' ? icons.disasterLogo : icons.barangayLogo}
                                              className="w-[50%] h-[50%]"
                                              resizeMode='contain'
                                          />
                                      </View>
                                      {/* Amenity Description Text */}
                                      <View className="w-[90%] h-[80%] justify-center">
                                          <Text className="text-white font-pregular text-xs">
                                            {amenity.description}
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
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'ml-12' : 'ml-6'}`}
                                underlayColor={'#fffd99'} 
                                onPress={() => handleEdit(amenity)}
                              >
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
                              {amenity.amenity_key ? (
                                <>
                                  {/* Reset Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleResetKey(amenity.id)}
                                  >
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
                                          <Text className="text-black font-pregular text-sm">{'Reset Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                  {/* Remake Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mr-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Remake Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                                </>
                              ) : <>
                                  {/* Create Amenity Key Button */}
                                  <TouchableHighlight
                                    className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 mx-2`} 
                                    underlayColor={'#fffd99'} 
                                    onPress={() => handleRemakeKey(amenity.id)}
                                  >
                                      <View className="h-full justify-center items-center flex-row overflow-hidden">
                                        <View className="w-6 h-full items-center justify-center">
                                          <Image
                                              tintColor={'#1097e6'}
                                              source={icons.key}
                                              className="w-[80%] h-[80%]"
                                              resizeMode='contain'
                                          />
                                        </View>
                                        <View className="h-full justify-center pl-[4%]">
                                          <Text className="text-black font-pregular text-sm">{'Create Key'}</Text>
                                        </View>
                                      </View>
                                  </TouchableHighlight>
                              </>}
                              {/* Delete Button */}
                              <TouchableHighlight
                                className={`h-full bg-white rounded-3xl ${borderGenerator(amenity.type)} border-[1px] overflow-hidden px-6 ${amenity.amenity_key ? 'mr-12' : 'mr-6'}`}
                                underlayColor={'#fffd99'}
                                onPress={() => handleDelete(amenity.id)}
                              >
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
            </>
          )}
          <View className="w-full mb-[5%]"/>
        </ScrollView>
    </SafeAreaView>
  );
};

export default AmenityScreen;
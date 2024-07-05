import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../../../constants'
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useUser } from '../../../../constants/users/UserContext'

const PrelimReport = () => {
  const { currentUser } = useUser();
  const [description, setDescription] = useState(''); // New state variable for description
  const router = useRouter();

  const generateRandomId = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  const emergency_types = [
    // Fire Emergency Types
    {type: 'structural_fire', description: 'Structural Fire'},
    {type: 'vehicular_fire', description: 'Vehicular Fire'},
    {type: 'fire_rescue', description: 'Rescue'},
    {type: 'explosion', description: 'Explosion Incident'},
    {type: 'wildfire', description: 'Wildfire'},
    // Police Emergency Types
    {type: 'personal_safety', description: 'Personal Safety'},
    {type: 'traffic_accident', description: 'Traffic Accident'},
    {type: 'public_disturbance', description: 'Public Disturbance'},
    {type: 'theft', description: 'Theft & Burglary'},
    {type: 'assault', description: 'Assault & Battery'},
    {type: 'domestic_violence', description: 'Domestic Violence'},
    {type: 'active_shooting', description: 'Active Shooting'},
    // NDRRMO Emergency Types
    {type: 'search_and_rescue', description: 'Search & Rescue'},
    {type: 'industrial_accidents', description: 'Industrial Accident'},
    {type: 'disaster_accident', description: 'Disaster Accident'}
  ];

  const handleServiceChange = (service) => {
    setReportForm((prevForm) => {
      const newServices = prevForm.services.includes(service)
          ? prevForm.services.filter((s) => s !== service)
          : [...prevForm.services.filter(s => s.length > 0), service];
      return { ...prevForm, services: newServices };
    });
  };

  const handleService = (type, services, handler) => {
    const emergencyType = emergency_types.find((et) => et.type === type);
    const newDescription = emergencyType ? emergencyType.description : '';

    setReportForm((prevForm) => {
      return { ...prevForm, type, services, handler };
    });

    setDescription(newDescription); // Update description state
  };

  const date = new Date();
  // Format date to "YYYY-MM-DD"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns zero-based month
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`
  const [showDateDropdown, setshowDateDropdown] = useState(false)

  const [currentTime, setCurrentTime] = useState(new Date())
  const timeString = currentTime.toLocaleTimeString();
  const [showTimeDropdown, setshowTimeDropdown] = useState(false)

  const [currentAddress, setCurrentAddress] = useState('Locating User...');
  const [locationError, setLocationError] = useState(null);

  const [showServicesDropdown, setShowServicesDropdown] = useState(false)
  const [typeDropdown, setshowTypeDropdown] = useState(false)

  const dateDropdown = () => {
    setshowDateDropdown(!showDateDropdown)}
  const timeDropdown = () => {
    setshowTimeDropdown(!showTimeDropdown)}

  const toggletypeDropdown = () => {
    setshowTypeDropdown(!typeDropdown)}
    const servicesDropdown = () => {
      setShowServicesDropdown(!showServicesDropdown)}

  const handleLocation = () => {}

  const backHandle = () => {
    router.back()}

  const proceedHandle = () => {
    const updatedReportForm = {
      ...reportform,
      photos: [], // Initialize photos as empty array before passing to PhotoReport
    };
    router.push({
      pathname: "home/report/photo-report",
      params: { reportform: JSON.stringify(updatedReportForm) }, // Pass the reportform as a parameter
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const [reportform, setReportForm] = useState({
    id: generateRandomId(),
    user: {
      user_id: currentUser.user_id,
      username: currentUser.username,
      fullname: currentUser.fullname,
      address: currentUser.address,
      phone_number: currentUser.phone_number,
      email: currentUser.email,
      photo_id: currentUser.photo_id
    },
    status: "preliminary",
    date: dateString,
    time: timeString,
    latitude: null,
    longitude: null,
    handler: "",
    type: "",
    services: [],
  });

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
          setReportForm((prevForm) => ({
            ...prevForm,
            address: formattedAddress,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        }));
        } else {
          setLocationError('Unable to retrieve address');
        }
      } catch (error) {
        setLocationError(error.message);
      }
    };

    getLocation();
  }, []);

  const getColor = (handler) => {
    switch (handler) {
      case 'fire_station':
        return 'fire-100';
      case 'police':
        return 'police';
      case 'government':
        return 'drrmo-200';
      default:
        return 'primary';
    }
  }

  const getBorderColor = (handler) => {
    switch (handler) {
      case 'fire_station':
        return 'border-fire';
      case 'police':
        return 'border-police';
      case 'government':
        return 'border-drrmo';
      default:
        return 'border-primary';
    }
  }

  const getTintColor = (handler) => {
    switch (handler) {
      case 'fire_station':
        return '#ff7a45';
      case 'police':
        return '#676eeb';
      case 'government':
        return '#478a3f';
      default:
        return '#57b378';
    }
  }

  return (
    <SafeAreaView className="bg-primary h-full w-full">
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
          <Text className="text-4xl text-primary text-semibold font-pbold pt-10 pb-3">PRELIMINARY REPORT</Text>
        </View>
        <View className="absolute inset-0 left-6 top-32 bg-primary h-1 w-[88%] items-center"></View>
        {/* Page Indicators */}
        <View className="flex-row gap-40 items-center justify-center bottom-0">
          <View className="bg-white border-primary border-double border-4 h-4 w-4 rounded-full justify-center items-center">
          </View>
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
        </View>
      </View>

      <ScrollView className="h-full">
        {/* Spacing Top */}
        <View className="pt-44 bg-white" />

        {/* Dropdown Options Container */}
        <View className="bg-white w-full h-full px-5">
          {/* Instructions */}
          <Text className="font-pregular text-sm text-primary py-2">Please fillout all necessary fields.</Text>
          
          {/* Date Dropdown Menu */}
          <View className="flex-row w-full gap-1">
            <View className="w-1/3 border-primary border-2 rounded-l-xl justify-center">
              <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                Date
              </Text>
            </View>
            <View className="border-primary border-2 rounded-r-xl w-2/3">
              <TouchableOpacity onPress={dateDropdown}>
                <View className="flex-row">
                  <Text className="font-pregular text-sm text-primary pl-2 py-2">{dateString}
                  <Text className="text-slate-400">{" "}DEFAULT</Text>
                  </Text>
                  <View className="absolute inset-y-0 right-4 justify-center">
                    <Image 
                      tintColor="#57b378"
                      source={!showDateDropdown ? icons.arrowD : icons.arrowU}
                      className="w-3 h-3"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Dropdown Menu */}
          <View className="pt-2" />
            <View className="flex-row w-full gap-1">
              <View className="w-1/3 border-primary border-2 rounded-l-xl justify-center">
                <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                  Time
                </Text>
              </View>
              <View className="border-primary border-2 rounded-r-xl w-2/3">
                <TouchableOpacity onPress={timeDropdown}>
                  <View className="flex-row ">
                    <Text className="font-pregular text-sm text-primary pl-2 py-2">{timeString}
                    <Text className="text-slate-400">{" "}DEFAULT</Text>
                    </Text>
                    <View className="absolute inset-y-0 right-4 justify-center">
                      <Image 
                        tintColor="#57b378"
                        source={!showTimeDropdown ? icons.arrowD : icons.arrowU}
                        className="w-3 h-3"
                        resizeMode='contain'
                      />
                    </View>
                  </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Dropdown Menu */}
          <View className="pt-2" />
            <View className="flex-row w-full gap-1">
              <View className="w-1/3 border-primary border-2 rounded-l-xl justify-center">
                <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                  Location
                </Text>
              </View>
              <View className="border-primary border-2 rounded-r-xl w-2/3">
                <TouchableOpacity onPress={handleLocation}>
                  <View className="flex-row w-[90%]">
                    <Text className="font-pregular text-sm text-primary pl-2 py-2">{locationError ? `Error: ${locationError}` : currentAddress}
                    </Text>
                    <View className="absolute inset-y-0 -right-3 justify-center">
                      <Image 
                        tintColor="#57b378"
                        source={icons.mapFocus}
                        className="w-5 h-5"
                        resizeMode='contain'
                      />
                    </View>
                  </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Type of Incident Dropdown Menu */}
          <View className="pt-2" />
            {typeDropdown === false ? (
              <View className="w-full">
                <View className="flex-row w-full gap-1">
                  <View className={`w-full ${getBorderColor(reportform.handler)} border-2 rounded-xl justify-center`}>
                    <TouchableOpacity onPress={toggletypeDropdown}>
                      <Text className={`font-psemibold text-sm text-${getColor(reportform.handler)} pl-3 py-2`}>
                        {description || 'Type of Emergency'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="absolute inset-y-0 right-3 justify-center">
                    <Image 
                      tintColor={getTintColor(reportform.handler)}
                      source={!typeDropdown ? icons.arrowD : icons.arrowU}
                      className="w-3 h-3"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="w-full">
                <View className="flex-row w-full gap-1">
                  <View className={`w-full ${getBorderColor(reportform.handler)} border-2 rounded-t-xl justify-center`}>
                    <TouchableOpacity onPress={toggletypeDropdown}>
                      <Text className={`font-psemibold text-sm text-${getColor(reportform.handler)} pl-3 py-2`}>
                        Type of Emergency
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="absolute inset-y-0 right-3 justify-center">
                    <Image 
                      tintColor={getTintColor(reportform.handler)}
                      source={!typeDropdown ? icons.arrowD : icons.arrowU}
                      className="w-3 h-3"
                      resizeMode='contain'
                    />
                  </View>
                </View>

                  <View className={`w-full pt-2 ${getBorderColor(reportform.handler)} border-x-2 border-b-2 rounded-b-xl`}>
                    {/* Instructions */}
                     <Text className={`font-pregular text-sm text-${getColor(reportform.handler)} py-2 pl-3`}>Please choose what type of emergency.</Text>
                     {/* Help Button */}
                    <View className="absolute top-2 right-3">
                      <TouchableOpacity>
                        <Image 
                          tintColor={getTintColor(reportform.handler)}
                          source={icons.needHelp}
                          className="w-7 h-7"
                          resizeMode='contain'
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Categories Container */}
                    <View className="flex-row gap-2 items-center">
                    {/* Column 1 */}
                  <View className="flex-col">
                    {/* Structural Fire */}
                    <TouchableOpacity onPress={() => handleService('structural_fire', ['firetruck'], 'fire_station')}>
                      <View className="px-2 py-2 items-center justify-center">
                        <Image 
                          tintColor={reportform.type === 'structural_fire' ? "#ff7a45" : "#9c9c9c"}
                          source={icons.structuralFire}
                          className="w-20 h-20"
                          resizeMode='contain'
                        />
                        <Text className={reportform.type === 'structural_fire' ? 
                          "pt-2 font-psemibold text-xs text-fire-100 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                          Structural{"\n"}Fire
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Explosion Incident */}
                    <TouchableOpacity onPress={() => handleService('explosion', ['firetruck'], 'fire_station')}>
                      <View className="px-2 py-2 items-center justify-center">
                        <Image 
                          tintColor={reportform.type === 'explosion' ? "#ff7a45" : "#9c9c9c"}
                          source={icons.explosion}
                          className="w-24 h-20"
                          resizeMode='contain'
                        />
                        <Text className={reportform.type === 'explosion' ? 
                          "pt-2 font-psemibold text-xs text-fire-100 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Explosion{"\n"}Incident
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Traffic Accident */}
                    <TouchableOpacity onPress={() => handleService('traffic_accident', ['ambulance'], 'police')}>
                      <View className="px-2 py-2 items-center justify-center">
                        <Image 
                          tintColor={reportform.type === 'traffic_accident' ? "#676eeb" : "#9c9c9c"}
                          source={icons.vehicleCrash}
                          className="w-24 h-20"
                          resizeMode='contain'
                        />
                        <Text className={reportform.type === 'traffic_accident' ? 
                          "pt-2 font-psemibold text-xs text-police text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Traffic{"\n"}Accident
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Assault and Battery */}
                    <TouchableOpacity onPress={() => handleService('assault', ['ambulance'], 'police')}>
                      <View className="px-2 py-2 pt-2 items-center justify-center">
                        <Image 
                          tintColor={reportform.type === 'assault' ? "#676eeb" : "#9c9c9c"}
                          source={icons.assault}
                          className="w-24 h-24"
                          resizeMode='contain'
                        />
                        <Text className={reportform.type === 'assault' ? 
                          "pt-2 font-psemibold text-xs text-police text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>Assault &{"\n"}Battery</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Search and Rescue */}
                    <TouchableOpacity onPress={() => handleService('search_and_rescue', [''], 'government')}>
                      <View className="px-2 py-2 pt-2 items-center justify-center">
                        <Image 
                          tintColor={reportform.type === 'search_and_rescue' ? "#478a3f" : "#9c9c9c"}
                          source={icons.searchRescue}
                          className="w-24 h-24"
                          resizeMode='contain'
                        />
                        <Text className={reportform.type === 'search_and_rescue' ? 
                          "pt-2 font-psemibold text-xs text-drrmo-200 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>Search &{"\n"}Rescue</Text>
                      </View>
                    </TouchableOpacity>
                    </View>

                    {/* Categories Container - Column 2 */}
                    <View className="flex-col">
                      {/* Vehicular Fire */}
                      <TouchableOpacity onPress={() => handleService('vehicular_fire', ['firetruck'], 'fire_station')}>
                        <View className="px-2 py-2 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'vehicular_fire' ? "#ff7a45" : "#9c9c9c"}
                            source={icons.vehicularFire}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'vehicular_fire' ? 
                          "pt-2 font-psemibold text-xs text-fire-100 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Vehicular{"\n"}Fire
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Wildfire */}
                      <TouchableOpacity onPress={() => handleService('wildfire', ['firetruck'], 'fire_station')}>
                        <View className="px-2 py-2 pt-3 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'wildfire' ? "#ff7a45" : "#9c9c9c"}
                            source={icons.wildfire}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'wildfire' ? 
                          "pt-2 font-psemibold text-xs text-fire-100 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Wildfire
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Public Disturbance */}
                      <TouchableOpacity onPress={() => handleService('public_disturbance', [''], 'police')}>
                        <View className="px-2 py-2 pt-4 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'public_disturbance' ? "#676eeb" : "#9c9c9c"}
                            source={icons.publicDisturbance}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'public_disturbance' ? 
                          "pt-4 font-psemibold text-xs text-police text-center" 
                          : "pt-4 font-psemibold text-xs text-white-200 text-center"}>
                            Public{"\n"}Disturbance
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Domestic Violence */}
                      <TouchableOpacity onPress={() => handleService('domestic_violence', ['ambulance'], 'police')}>
                        <View className="px-2 py-2 pt-5 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'domestic_violence' ? "#676eeb" : "#9c9c9c"}
                            source={icons.abuse}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'domestic_violence' ? 
                          "pt-3 pb-2 font-psemibold text-xs text-police text-center" 
                          : "pt-3 pb-2 font-psemibold text-xs text-white-200 text-center"}>
                            Domestic{"\n"}Violence
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Industrial Accidents */}
                      <TouchableOpacity onPress={() => handleService('industrial_accidents', ['ambulance'], 'government')}>
                        <View className="px-2 py-2 pt-2 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'industrial_accidents' ? "#478a3f" : "#9c9c9c"}
                            source={icons.industrialAccident}
                            className="w-24 h-24"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'industrial_accidents' ? 
                          "pt-2 font-psemibold text-xs text-drrmo-200 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Industrial{"\n"}Accident
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Categories Container - Column 3 */}
                    <View className="flex-col">
                      {/* Rescue */}
                      <TouchableOpacity onPress={() => handleService('fire_rescue', ['ambulance', 'firetruck'], 'fire_station')}>
                        <View className="px-2 py-2 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'fire_rescue' ? "#ff7a45" : "#9c9c9c"}
                            source={icons.rescue}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'fire_rescue' ? 
                          "pt-2 font-psemibold text-xs text-fire-100 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Rescue
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Personal Safety */}
                      <TouchableOpacity onPress={() => handleService('personal_safety', [''], 'police')}>
                        <View className="px-2 py-2 pt-6 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'personal_safety' ? "#676eeb" : "#9c9c9c"}
                            source={icons.personalSafety}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'personal_safety' ? 
                          "pt-2 font-psemibold text-xs text-police text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Personal{"\n"}Safety
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Theft and Burglary */}
                      <TouchableOpacity onPress={() => handleService('theft', [''], 'police')}>
                        <View className="px-2 py-2 pt-2 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'theft' ? "#676eeb" : "#9c9c9c"}
                            source={icons.theft}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'theft' ? 
                          "pt-2 font-psemibold text-xs text-police text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Theft &{"\n"}Burglary
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Active Shooting */}
                      <TouchableOpacity onPress={() => handleService('active_shooting', ['ambulance'], 'police')}>
                        <View className="px-2 py-2 pt-5 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'active_shooting' ? "#676eeb" : "#9c9c9c"}
                            source={icons.murder}
                            className="w-24 h-24"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'active_shooting' ? 
                          "pb-2 font-psemibold text-xs text-police text-center" 
                          : "pb-2 font-psemibold text-xs text-white-200 text-center"}>
                            Active{"\n"}Shooting
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Disaster Accidents*/}
                      <TouchableOpacity onPress={() => handleService('disaster_accident', [''], 'government')}>
                        <View className="px-2 py-2 pt-2 items-center justify-center">
                          <Image 
                            tintColor={reportform.type === 'disaster_accident' ? "#478a3f" : "#9c9c9c"}
                            source={icons.disaster}
                            className="w-24 h-24"
                            resizeMode='contain'
                          />
                          <Text className={reportform.type === 'disaster_accident' ? 
                          "pt-2 font-psemibold text-xs text-drrmo-200 text-center" 
                          : "pt-2 font-psemibold text-xs text-white-200 text-center"}>
                            Disaster{"\n"}Accidents
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Services Needed Dropdown Menu */}
            <View className="pt-2" />
            {showServicesDropdown === false ? (
              <View className="h-10 w-full">
                <View className="flex-row w-full gap-1">
                  <View className="w-full border-primary border-2 rounded-xl justify-center">
                  <TouchableOpacity onPress={servicesDropdown}>
                    <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                      Services Needed
                    </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="absolute inset-y-0 right-3 justify-center">
                    <Image 
                      tintColor="#57b378"
                      source={!showServicesDropdown ? icons.arrowD : icons.arrowU}
                      className="w-3 h-3"
                      resizeMode='contain'
                    />
                  </View>
              </View>
            </View>
            ) : (
              <View className="w-full">
                <View className="flex-row w-full gap-1">
                  <View className="w-full border-primary border-2 rounded-t-xl justify-center">
                  <TouchableOpacity onPress={servicesDropdown}>
                    <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                      Services Needed
                    </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="absolute inset-y-0 right-3 justify-center">
                    <Image 
                      tintColor="#57b378"
                      source={!showServicesDropdown ? icons.arrowD : icons.arrowU}
                      className="w-3 h-3"
                      resizeMode='contain'
                    />
                  </View>
              </View>

              <View className="w-full pt-2 border-primary border-x-2 border-b-2 rounded-b-xl px-3">
                {/* Services Container*/}
                <View className="flex-row">
                  {/* Ambulance */}
                  <TouchableOpacity className="w-1/2 items-center justify-center" onPress={() => handleServiceChange('ambulance')}>
                    <View className="items-center">
                      <Image 
                        tintColor={reportform.services.includes('ambulance') ? "#57b378" : "#9c9c9c"}
                        source={icons.ambulance}
                        className="w-48 h-11"
                        resizeMode='contain'
                      />
                      <Text className={reportform.services.includes('ambulance') ? 
                      "font-pregular text-xs text-primary py-1" 
                      : "font-pregular text-xs text-white-200 py-1"}>
                        Ambulance
                      </Text>
                      </View>
                  </TouchableOpacity>

                  {/* Firetruck */}
                  <TouchableOpacity className="w-1/2 items-center justify-center" onPress={() => handleServiceChange('firetruck')}>
                    <View className="items-center">
                      <Image 
                        tintColor={reportform.services.includes('firetruck') ? "#57b378" : "#9c9c9c"}
                        source={icons.fireTruck}
                        className="w-48 h-12"
                        resizeMode='contain'
                      />
                      <Text className= {reportform.services.includes('firetruck') ? 
                      "font-pregular text-xs text-primary py-1" 
                      : "font-pregular text-xs text-white-200 py-1"}>
                        Fire Truck
                        </Text>
                    </View>
                </TouchableOpacity>
                </View>
              </View>
            </View>
            )}
            <View className="pl-2 pt-4">
              <TouchableOpacity className="w-44 h-12 bottom-0 left-48 bg-primary items-center justify-center rounded-3xl mt-2" onPress={proceedHandle}>
                <Text className="text-white font-pbold text-xl pl-4">PROCEED {"   >"}</Text>
              </TouchableOpacity>
            </View>
            <View className="pb-5" />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  )
}

export default PrelimReport 
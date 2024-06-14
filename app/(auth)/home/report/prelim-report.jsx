import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../../../constants'

import * as Location from 'expo-location';

const PrelimReport = () => {
  const [reportform, setReportForm] = useState({
    date: dateString,
    time: timeString,
    location: currentAddress,
    type: "",
    services: "",
    medical: toggleMedical
  })
  const date = new Date();
  const dateString = date.toLocaleDateString();
  const [showDateDropdown, setshowDateDropdown] = useState(false)

  const [currentTime, setCurrentTime] = useState(new Date())
  const timeString = currentTime.toLocaleTimeString();
  const [showTimeDropdown, setshowTimeDropdown] = useState(false)

  const [toggleMedical, setToggleMedical] = useState(false)
  const [toggleRescue, setToggleRescue] = useState(false)

  const [currentAddress, setCurrentAddress] = useState('Locating User...');
  const [locationError, setLocationError] = useState(null);

  const [showServicesDropdown, setShowServicesDropdown] = useState(false)
  const [typeDropdown, setshowTypeDropdown] = useState(false)

  const dateDropdown = () => {
    setshowDateDropdown(!showDateDropdown)}
  const timeDropdown = () => {
    setshowTimeDropdown(!showTimeDropdown)}
  const toggleMedicalSupport = () => {
    setToggleMedical(!toggleMedical)}
  const toggleRescueNeeded = () => {
    setToggleRescue(!toggleRescue)}
  const toggletypeDropdown = () => {
    setshowTypeDropdown(!typeDropdown)}
    const servicesDropdown = () => {
      setShowServicesDropdown(!showServicesDropdown)}

  const handleLocation = () => {}

  const backHandle = () => {
    router.back()}

  const proceedHandle = () => {
    router.push("home/report/finish-report")
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

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
                    {/*<Text className="text-slate-400">{" "}DEFAULT</Text>*/}
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
                  <View className="w-full border-primary border-2 rounded-xl justify-center">
                    <TouchableOpacity onPress={toggletypeDropdown}>
                      <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                        Type of Emergency
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="absolute inset-y-0 right-3 justify-center">
                    <Image 
                      tintColor="#57b378"
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
                  <View className="w-full border-primary border-2 rounded-t-xl justify-center">
                    <TouchableOpacity onPress={toggletypeDropdown}>
                      <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                        Type of Emergency
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="absolute inset-y-0 right-3 justify-center">
                    <Image 
                      tintColor="#57b378"
                      source={!typeDropdown ? icons.arrowD : icons.arrowU}
                      className="w-3 h-3"
                      resizeMode='contain'
                    />
                  </View>
                </View>

                  <View className="w-full pt-2 border-primary border-x-2 border-b-2 rounded-b-xl">
                    {/* Instructions */}
                     <Text className="font-pregular text-sm text-primary py-2 pl-3">Please choose what type of emergency.</Text>
                     {/* Help Button */}
                    <View className="absolute top-2 right-3">
                      <TouchableOpacity>
                        <Image 
                          tintColor="#57b378"
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
                    <TouchableOpacity>
                      <View className="px-2 py-2 items-center justify-center">
                        <Image 
                          tintColor="#ff7a45"
                          source={icons.structuralFire}
                          className="w-20 h-20"
                          resizeMode='contain'
                        />
                        <Text className="pt-2 font-psemibold text-xs text-fire-100 text-center">Structural{"\n"}Fire</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Explosion Incident */}
                    <TouchableOpacity>
                      <View className="px-2 py-2 items-center justify-center">
                        <Image 
                          tintColor="#ff7a45"
                          source={icons.explosion}
                          className="w-24 h-20"
                          resizeMode='contain'
                        />
                        <Text className="pt-2 font-psemibold text-xs text-fire-100 text-center">Explosion{"\n"}Incident</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Traffic Accident */}
                    <TouchableOpacity>
                      <View className="px-2 py-2 items-center justify-center">
                        <Image 
                          tintColor="#676eeb"
                          source={icons.vehicleCrash}
                          className="w-24 h-20"
                          resizeMode='contain'
                        />
                        <Text className="pt-2 font-psemibold text-xs text-police-25 text-center">Traffic{"\n"}Accident</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Assault and Battery */}
                    <TouchableOpacity>
                      <View className="px-2 py-2 pt-2 items-center justify-center">
                        <Image 
                          tintColor="#676eeb"
                          source={icons.assault}
                          className="w-24 h-24"
                          resizeMode='contain'
                        />
                        <Text className="pt-2 font-psemibold text-xs text-police-25 text-center">Assault &{"\n"}Battery</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Search and Rescue */}
                    <TouchableOpacity>
                      <View className="px-2 py-2 pt-2 items-center justify-center">
                        <Image 
                          tintColor="#478a3f"
                          source={icons.searchRescue}
                          className="w-24 h-24"
                          resizeMode='contain'
                        />
                        <Text className="pt-2 font-psemibold text-xs text-drrmo-200 text-center">Search &{"\n"}Rescue</Text>
                      </View>
                    </TouchableOpacity>
                    </View>

                    {/* Categories Container - Column 2 */}
                    <View className="flex-col">
                      {/* Vehicular Fire */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 items-center justify-center">
                          <Image 
                            tintColor="#ff7a45"
                            source={icons.vehicularFire}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-fire-100 text-center">Vehicular{"\n"}Fire</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Wildfire */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-3 items-center justify-center">
                          <Image 
                            tintColor="#ff7a45"
                            source={icons.wildfire}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-fire-100 text-center">Wildfire</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Public Disturbance */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-4 items-center justify-center">
                          <Image 
                            tintColor="#676eeb"
                            source={icons.publicDisturbance}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-4 font-psemibold text-xs text-police-25 text-center">Public{"\n"}Disturbance</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Domestic Violence */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-5 items-center justify-center">
                          <Image 
                            tintColor="#676eeb"
                            source={icons.abuse}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-3 pb-2 font-psemibold text-xs text-police-25 text-center">Domestic{"\n"}Violence</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Industrial Accidents */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-2 items-center justify-center">
                          <Image 
                            tintColor="#478a3f"
                            source={icons.industrialAccident}
                            className="w-24 h-24"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-drrmo-200 text-center">Industrial{"\n"}Accident</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Categories Container - Column 3 */}
                    <View className="flex-col">
                      {/* Rescue */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 items-center justify-center">
                          <Image 
                            tintColor="#ff7a45"
                            source={icons.rescue}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-fire-100 text-center">Rescue</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Personal Safety */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-6 items-center justify-center">
                          <Image 
                            tintColor="#676eeb"
                            source={icons.personalSafety}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-police-25 text-center">Personal{"\n"}Safety</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Theft and Burglary */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-2 items-center justify-center">
                          <Image 
                            tintColor="#676eeb"
                            source={icons.theft}
                            className="w-24 h-20"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-police-25 text-center">Theft &{"\n"}Burglary</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Active Shooting */}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-5 items-center justify-center">
                          <Image 
                            tintColor="#676eeb"
                            source={icons.murder}
                            className="w-24 h-24"
                            resizeMode='contain'
                          />
                          <Text className="pb-2 font-psemibold text-xs text-police-25 text-center">Active{"\n"}Shooting</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Disaster Accidents*/}
                      <TouchableOpacity>
                        <View className="px-2 py-2 pt-2 items-center justify-center">
                          <Image 
                            tintColor="#478a3f"
                            source={icons.disaster}
                            className="w-24 h-24"
                            resizeMode='contain'
                          />
                          <Text className="pt-2 font-psemibold text-xs text-drrmo-200 text-center">Disaster{"\n"}Accidents</Text>
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
                  <TouchableOpacity className="w-1/2 items-center justify-center">
                    <View className="items-center">
                      <Image 
                        tintColor="#57b378"
                        source={icons.ambulance}
                        className="w-48 h-11"
                        resizeMode='contain'
                      />
                      <Text className="font-pregular text-xs text-primary py-1">Ambulance</Text>
                      </View>
                  </TouchableOpacity>

                  {/* Firetruck */}
                  <TouchableOpacity className="w-1/2 items-center justify-center">
                    <View className="items-center">
                      <Image 
                        tintColor="#57b378"
                        source={icons.fireTruck}
                        className="w-48 h-12"
                        resizeMode='contain'
                      />
                      <Text className="font-pregular text-xs text-primary py-1">Fire Truck</Text>
                    </View>
                </TouchableOpacity>
                </View>
              </View>
            </View>
            )}

            {/* Medical Assistance Needed */}
            <View className="pt-2" />
            <View className="h-11 flex-row w-full gap-1">
              <View className="w-4/5 border-primary border-2 rounded-l-xl justify-center">
                <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                  Medical Assistance
                </Text>
              </View>
              <View className="border-primary border-2 rounded-r-xl w-1/5">
                <TouchableOpacity onPress={toggleMedicalSupport}>
                    <View className="items-center justify-center">
                      <Image 
                        tintColor="#57b378"
                        source={!toggleMedical ? icons.toggleOff : icons.toggleOn}
                        className="w-8 h-8"
                        resizeMode='contain'
                      />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Medical Assistance Needed */}
            <View className="pt-2" />
            <View className="h-11 flex-row w-full gap-1">
              <View className="w-4/5 border-primary border-2 rounded-l-xl justify-center">
                <Text className="font-psemibold text-sm text-primary pl-3 py-2">
                  Rescue Needed
                </Text>
              </View>
              <View className="border-primary border-2 rounded-r-xl w-1/5">
                <TouchableOpacity onPress={toggleRescueNeeded}>
                    <View className="items-center justify-center">
                      <Image 
                        tintColor="#57b378"
                        source={!toggleRescue ? icons.toggleOff : icons.toggleOn}
                        className="w-8 h-8"
                        resizeMode='contain'
                      />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View className="pl-2 pt-2">
              <TouchableOpacity className="w-44 h-12 bottom-0 left-48 bg-primary items-center justify-center rounded-3xl mt-2" onPress={proceedHandle}>
                <Text className="text-white font-pbold text-xl pl-4">PROCEED {"   >"}</Text>
              </TouchableOpacity>
            </View>
            <View className="pb-5" />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PrelimReport 
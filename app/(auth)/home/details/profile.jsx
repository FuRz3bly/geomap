import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from "../../../../constants"
import { useUser } from '../../../../constants/users/UserContext'
import { StatusBar } from 'expo-status-bar';

// Import Modals
import MenuC from '../../../../components/modals/menu/menu-c'

const Profile = () => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };
  const formatReport = (number, length) => {
    return number.toString().padStart(length, '0');
  }
  const { currentUser } = useUser();
  // Menu Components - Set the Visibility to False
  const [isMenuVisible, setMenuVisible] = useState(false)
  // Menu Button Toggler
  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible)
  }

  return (
    <SafeAreaView className="bg-white h-full w-full items-center">
      {/* Modals Container */}
      <View className="absolute">
        <MenuC visible={isMenuVisible} onClose={toggleMenu}></MenuC>
      </View>
      {/* Header Container */}
      <View className="absolute inset-0 top-0 z-20 bg-primary w-full h-28 justify-center items-center flex-row">
        {/* Menu Button */}
        <View className="absolute top-[45%] left-[5%]">
          <TouchableOpacity onPress={() => setMenuVisible(!isMenuVisible)}>
            <Image 
              tintColor="#ffffff"
              source={icons.menu}
              className="w-10 h-10"
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
        {/* Profile Title */}
        <View className="absolute top-[50%] inset-0">
          <Text className="text-2xl font-psemibold text-white">Profile</Text>
        </View>
      </View>
      {/* Header Style */}
      <View className="absolute -top-[36%] inset-0 -z-10 w-[590px] h-[500px] bg-primary rounded-full" />
      {/* Profile Icon */}
      <View className="absolute top-[14%] inset-0">
        <View className="w-32 h-32 items-center justify-center bg-white rounded-full border-8 border-primary">
          <Image 
            tintColor="#57b378"
            source={icons.profile}
            className="w-12 h-12"
            resizeMode='contain'
          />
        </View>
      </View>
      {/* Body Container */}
      {currentUser ? (
        <>
          <View className="absolute top-[33%] inset-0 w-full">
            {/* Fullname = First, Middle and Lastname */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {currentUser.fullname.firstname} {currentUser.fullname.middlename} {currentUser.fullname.lastname}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Birthday */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {formatDate(currentUser.birthdate)}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Username */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {currentUser.username}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Email */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {currentUser.email}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Phone Number */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {'(063)'}{currentUser.phone_number}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Address */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {currentUser.address}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Address */}
            <View className="left-[25%] py-4">
              <Text className="text-lg font-pregular text-white-200">
                {formatReport(currentUser.reports, 3)}
              </Text>
            </View>
            <View className="border-b-0.5 border-white-200" />
            {/* Icons Container */}
            <View className="absolute left-[8%] items-center justify-center">
              {/* Fullname Icon */}
              <View className="py-4">
                <Image 
                  tintColor="#57b378"
                  source={icons.profile}
                  className="w-6 h-6"
                  resizeMode='contain'
                />
              </View>
              {/* Birthdate Icon */}
              <View className="py-5">
                <Image 
                  tintColor="#57b378"
                  source={icons.birthdate}
                  className="w-7 h-7"
                  resizeMode='contain'
                />
              </View>
              {/* Username Icon */}
              <View className="py-3">
                <Image 
                  tintColor="#57b378"
                  source={icons.username}
                  className="w-7 h-7"
                  resizeMode='contain'
                />
              </View>
              {/* Email Icon */}
              <View className="py-5">
                <Image 
                  tintColor="#57b378"
                  source={icons.email}
                  className="w-7 h-7"
                  resizeMode='contain'
                />
              </View>
              {/* Phone Number Icon */}
              <View className="py-3">
                <Image 
                  tintColor="#57b378"
                  source={icons.phone}
                  className="w-7 h-7"
                  resizeMode='contain'
                />
              </View>
              {/* Address icon */}
              <View className="py-6">
                <Image 
                  tintColor="#57b378"
                  source={icons.address}
                  className="w-7 h-7"
                  resizeMode='contain'
                />
              </View>
              {/* Total Reports Icon */}
              <View className="py-2">
                <Image 
                  tintColor="#57b378"
                  source={icons.report}
                  className="w-7 h-7"
                  resizeMode='contain'
                />
              </View>
            </View>
          </View>
        </>
      ) : (
        <Text className="text-white text-lg">No user is logged in.</Text>
      )}
      <StatusBar backgroundColor='#57b378' style={'light'} />
    </SafeAreaView>
  )
}

export default Profile
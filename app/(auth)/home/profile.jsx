import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import {icons} from "../../../constants"

const Profile = () => {
  

  return (
    <SafeAreaView className="bg-white h-full items-center justify-center">
      <View><Text className="font-pbold text-xl">Profile</Text></View>
    </SafeAreaView>
  )
}

export default Profile
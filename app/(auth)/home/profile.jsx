import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  return (
    <SafeAreaView className="bg-white h-full items-center justify-center">
      <View><Text className="font-pbold text-xl">Profile</Text></View>
    </SafeAreaView>
  )
}

export default Profile
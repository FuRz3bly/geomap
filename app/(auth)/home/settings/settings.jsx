import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Settings = () => {
  return (
    <SafeAreaView className="bg-white h-[110%] w-full items-center justify-center">
      <View><Text className="font-pbold text-3xl">Settings</Text></View>
    </SafeAreaView>
  )
}

export default Settings;
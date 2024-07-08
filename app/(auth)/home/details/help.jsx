import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Help = () => {
  return (
    <SafeAreaView className="bg-white h-[110%] w-full items-center justify-center">
      <View><Text className="font-pbold text-3xl">Help</Text></View>
    </SafeAreaView>
  )
}

export default Help;
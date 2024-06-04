import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { icons } from '../../../../constants'

const PrelimReport = () => {

  const backHandle = () => {
    router.back()
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
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
          <View className="bg-primary h-4 w-4 rounded-full justify-center items-center">
          </View>
        </View>
      </View>
      <ScrollView>
        <View className="pt-44" />
        <View className="bg-white w-full px-2">
          {/* Instructions */}
          <Text className="font-pregular text-sm text-primary pl-4 py-4">Please fillout all necessary fields.{"\n"}</Text>
          {/* Type of Incident Dropdown Menu */}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default PrelimReport
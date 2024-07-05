import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

import { icons } from '../../../../constants'

import Terms from '../../../../components/modals/terms'

export default function SignupI() {
  const [image, setImage] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false)
  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-white">
      {/* Create Account Title */}
      <View className="absolute inset-x-0 top-0 h-32 w-full bg-white items-center justify-center z-10 border-2 border-b-2 border-primary">
        {/* Title */}
        <Text className="text-4xl text-primary text-semibold font-pbold pt-10">CREATE ACCOUNT</Text>
        {/* Subtitle */}
        <Text className="text-lg text-primary font-psemibold">As an Emergency Responder</Text>
      </View>

      {/* Terms and Conditions */}
      <View className="absolute inset-0">
          <Terms visible={isModalVisible} onClose={toggleModal}></Terms>
      </View>

      <ScrollView>
        <View className="pt-24"></View>
        <View className="bg-primary w-full pt-5 pb-5 px-2">
            <Text className="text-md font-psemibold text-xl text-white pb-3 pl-2">II. Identity Authentication</Text>
            <Text className="font-pregular text-sm text-white pl-2">Please upload your work indentification card.{"\n"}</Text>
            {image === null ? (
              <TouchableOpacity className="w-full" onPress={pickImage}>
                {/* Button ID Upload */}
                <View className="bg-white h-20 items-center justify-center flex-row rounded-xl">
                  <Image tintColor="#9CA3AF" source={icons.upload} className="w-5 h-5" resizeMode='contain' />
                  <Text className="font-pregular text-md text-gray-400">{'     '}Choose Identification Card To Upload</Text>
                </View>
              </TouchableOpacity>  
            ) : (
              <View className="bg-white items-center justify-center rounded-3xl px-2">
                {/* Replace Button ID Upload to Image */}
                {image && <Image source={{ uri: image }} className="h-[300px] w-[350px]" resizeMode='contain' />}
              </View>
              )}
            {/* Select Workplace Nearby */}
            <Text className="font-pregular text-sm text-white pl-2 pt-4">Select your workpace nearby.{"\n"}</Text>
            <View className="bg-white h-20 items-center justify-center flex-row rounded-xl"></View>
        </View>
            {/* Button and Terms Container */}
            <View className="pt-5 items-center bg-white">
              {/* Terms and Conditions */}
              <TouchableOpacity className="items-center" onPress={() => setModalVisible(!isModalVisible)}>
                <View className="flex-row">
                  <Text className="font-pregular text-sm text-primary">Please read and agree to the{" "}</Text>
                  <Text className="font-psemibold text-sm text-primary">Terms and Conditions</Text>
                </View>
                  <Text className="font-pregular text-sm text-primary">in order to use our Service.</Text>
              </TouchableOpacity>
              
              {/* Create My Account Button */}
              <TouchableOpacity className="w-4/5 h-12" style={styles.createButton} onPress={() => {router.push("register/responder/signup-verification")}}>
                <Text className="text-white font-psemibold text-xl">CREATE MY ACCOUNT</Text>
              </TouchableOpacity>
              <View className="pb-24"></View>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
  createButton: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#57b378"
},
});
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker'

import { icons } from '../../../constants'

import Terms from '../../../components/modals/terms'

export default function SignupI() {
  const [image, setImage] = useState(null);
  const [showView, setShowView] = useState(true);

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

    setShowView(!showView)

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setShowView(showView)
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-white">
      <ScrollView>
        <View className="items-center">
          <View className="absolute inset-0">
            <Terms visible={isModalVisible} onClose={toggleModal}></Terms>
          </View>
          <Text className="text-4xl text-primary text-semibold mt-12 font-pbold">CREATE ACCOUNT</Text>
            <Text className="text-lg text-primary mt-2 mb-5 font-psemibold">As a Community User</Text>
          </View>
          <View className="bg-primary w-full" style={{paddingVertical: 15, paddingHorizontal: 10}}>
            <Text className="flex-1 text-md font-psemibold text-xl text-white pb-3 pl-2">II. Identity Authentication</Text>
                {image === null ? (
                  <TouchableOpacity className="w-full" onPress={pickImage}>
                    <View className="bg-white h-20 items-center justify-center flex-row rounded-xl">
                      <Image tintColor="#9CA3AF" source={icons.upload} className="w-5 h-5" resizeMode='contain' />
                      <Text className="font-pregular text-md text-gray-400">{'     '}Choose Identification Card To Upload</Text>
                    </View>
                  </TouchableOpacity>  
                ) : (
                  <View className="bg-white items-center justify-center rounded-xl px-2">
                    {image && <Image source={{ uri: image }} className="h-[300px] w-[300px]" resizeMode='contain' />}
                  </View>
                )}
            </View>
            <View className="items-center pt-8">
              <TouchableOpacity className="items-center" onPress={() => setModalVisible(!isModalVisible)}>
                <View className="flex-row">
                  <Text className="font-pmedium text-primary">Please read and agree to the {" "}</Text>
                  <Text className="font-pbold text-primary">Terms and Conditions</Text>
                </View>
                  <Text className="font-pmedium text-primary">in order to use our Service.</Text>
              </TouchableOpacity>

                  <TouchableOpacity className="w-4/5 mt-5 h-12" style={styles.createButton} >
                    <Text className="text-white font-psemibold text-xl">CREATE MY ACCOUNT</Text>
                  </TouchableOpacity>
              
                <View style={{paddingBottom: 7}}></View>
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
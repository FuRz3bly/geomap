import { StyleSheet, ScrollView,  View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import { Link, router } from 'expo-router'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { icons } from '../../../../constants'

import Terms from '../../../../components/modals/terms'

const SignupP = () => {
  const [form, setForm] = useState({
    type: 'community',
    name: {
      last_name: '',
      first_name: '',
      middle_name: ''
    },
    username: '',
    address: '',
    phone_number: '',
    email: '',
    password: ''
  })

  const [showPassword, setshowPassword] = useState(false)
  const [isModalVisible, setModalVisible] = useState(false)
  const toggleModal = () => {
    setModalVisible(!isModalVisible)
  }

  const handleInputChange = (key, value) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleProceed = () => {
    // Implement signup logic here
    console.log('Signing up...');
    console.log('Form Data:', form);
    router.push("register/community/signup-image")
  };

  return (
    <SafeAreaView className="h-full w-full bg-white">
      <ScrollView>
        <View className="items-center">
          {/* Terms and Condition Pop-up */}
          <View className="absolute inset-0">
            <Terms visible={isModalVisible} onClose={toggleModal}></Terms>
          </View>
          {/* Create Account Title */}
          <Text className="text-4xl text-primary text-semibold mt-10 font-pbold">CREATE ACCOUNT</Text>
            {/* Subtitle */}
            <Text className="text-lg text-primary mt-2 mb-5 font-psemibold">As a Community User</Text>
          </View>
          {/* Text Input Container */}
          <View className="bg-primary w-full" style={{paddingVertical: 10, paddingHorizontal: 10}}>
            <Text className="text-md font-psemibold text-xl text-white pb-3 pl-2">I. Personal Details</Text>
            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput 
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Last Name'
                placeholderTextColor='#6a9c7c'
                autoFocus
                value={form.fullname.last_name}
                onChangeText={(text) => handleInputChange('fullname', {...form.fullname, last_name: text})}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput 
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='First Name'
                placeholderTextColor='#6a9c7c'
                autoCapitalize='sentences'
                value={form.fullname.first_name}
                onChangeText={(text) => handleInputChange('fullname', {...form.fullname, first_name: text})}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput 
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Middle Name'
                placeholderTextColor='#6a9c7c'
                autoCapitalize='sentences'
                value={form.fullname.middle_name}
                onChangeText={(text) => handleInputChange('fullname', {...form.fullname, middle_name: text})}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput 
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Address'
                placeholderTextColor='#6a9c7c'
                value={form.fullname.address}
                onChangeText={(text) => handleInputChange('address', text)}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput
                autoComplete='email' 
                inputMode='email'
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Email'
                placeholderTextColor='#6a9c7c'
                value={form.fullname.email}
                onChangeText={(text) => handleInputChange('email', text)}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput
                inputMode='numeric'
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Phone Number'
                placeholderTextColor='#6a9c7c'
                value={form.fullname.phone_number}
                onChangeText={(text) => handleInputChange('phone_number', text)}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Username'
                placeholderTextColor='#6a9c7c'
                value={form.fullname.username}
                onChangeText={(text) => handleInputChange('username', text)}>
              </TextInput>
            </View>
            <View style={{paddingBottom: 6}}></View>

            <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
              <TextInput
                className="flex-1 text-md font-pmedium text-primary"
                placeholder='Password'
                placeholderTextColor='#6a9c7c'
                value={form.fullname.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                textContentType='password'>
              </TextInput>
              <TouchableOpacity className="pb-2" onPress={() => setshowPassword(!showPassword)}>
                  <Image 
                      tintColor="#57b378"
                      source={!showPassword ? icons.eye : icons.eyeHide}
                      className="w-6 h-6"
                      resizeMode='contain'
                  />
              </TouchableOpacity>
            </View>
            <View style={{paddingBottom: 5}}></View>

        </View>
        <View className="items-center pt-5">
          <TouchableOpacity className="items-center" onPress={() => setModalVisible(!isModalVisible)}>
            <View className="flex-row gap-2">
              <Text className="font-pmedium text-primary">Please read and agree to the</Text>
              <Text className="font-pbold text-primary">Terms and Conditions</Text>
            </View>
              <Text className="font-pmedium text-primary">in order to use our Service.</Text>
            </TouchableOpacity>
          
            <TouchableOpacity className="w-2/3 mt-3 h-12" style={styles.createButton} onPress={handleProceed}>
                <Text className="text-white font-psemibold text-xl">PROCEED TO NEXT STEP {'>'}</Text>
            </TouchableOpacity>
            <View style={{paddingBottom: 7}}></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignupP

const styles = StyleSheet.create({
  createButton: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "#57b378"
},
image: {
  width: 200,
  height: 200
},
})
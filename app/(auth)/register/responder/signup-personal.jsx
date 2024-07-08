import { StyleSheet, ScrollView,  View, Text, TextInput, Image, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { icons } from '../../../../constants'

import Terms from '../../../../components/modals/terms'

const SignupP = () => {
  const [form, setForm] = useState({
    type: 'responder',
    fullname: {
      lastname: '',
      firstname: '',
      middlename: ''
    },
    rank: '',
    username: '',
    address: '',
    phoneNum: '',
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

  const handleBlur = () => {
    if (form.username && !form.username.endsWith('@respo')) {
      setForm(prevForm => ({
        ...prevForm,
        username: `${prevForm.username}@respo`
      }));
    }
  };

  const handleProceed = () => {
    // Implement signup logic here
    console.log('Signing up...');
    console.log('Form Data:', form);
  };

  return (
    <SafeAreaView className="h-full w-full bg-white">
      {/* Create Account Title */}
      <View className="absolute inset-x-0 top-0 h-32 w-full bg-white items-center justify-center z-10 border-2 border-b-2 border-primary">
        {/* Title */}
        <Text className="text-4xl text-primary text-semibold font-pbold pt-10">CREATE ACCOUNT</Text>
        {/* Subtitle */}
        <Text className="text-lg text-primary font-psemibold">As an Emergency Responder</Text>
      </View>

      {/* Terms and Condition Pop-up */}
      <View className="absolute inset-0">
        <Terms visible={isModalVisible} onClose={toggleModal}></Terms>
      </View>

      <ScrollView>
        <View className="pt-24"></View>
        <View className="bg-primary w-full pt-5 pb-5 px-2">
          <Text className="text-md font-psemibold text-xl text-white pb-3 pl-2">I. Personal Details</Text>
          <Text className="font-pregular text-sm text-white pl-2">Please fillout all necessary fields.{"\n"}</Text>
          {/* Last Name Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Last Name'
              placeholderTextColor='#94A3B8'
              autoFocus
              value={form.fullname.lastname}
              onChangeText={(text) => handleInputChange('fullname', {...form.fullname, lastname: text})}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* First Name Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='First Name'
              placeholderTextColor='#94A3B8'
              autoCapitalize='sentences'
              value={form.fullname.firstname}
              onChangeText={(text) => handleInputChange('fullname', {...form.fullname, firstname: text})}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Middle Name Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Middle Name'
              placeholderTextColor='#94A3B8'
              autoCapitalize='sentences'
              value={form.fullname.middlename}
              onChangeText={(text) => handleInputChange('fullname', {...form.fullname, middlename: text})}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Rank / Position Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Rank / Position'
              placeholderTextColor='#94A3B8'
              autoCapitalize='sentences'
              value={form.rank}
              onChangeText={(text) => handleInputChange('rank', text)}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Address Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Address'
              placeholderTextColor='#94A3B8'
              autoCapitalize='sentences'
              value={form.address}
              onChangeText={(text) => handleInputChange('address', text)}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Email Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Email'
              autoComplete='email' 
              inputMode='email'
              placeholderTextColor='#94A3B8'
              value={form.email}
              onChangeText={(text) => handleInputChange('email', text)}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Phone Number Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Phone Number'
              placeholderTextColor='#94A3B8'
              value={form.phoneNum}
              inputMode='numeric'
              onChangeText={(text) => handleInputChange('phoneNum', text)}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Username Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-full"
              placeholder='Username'
              placeholderTextColor='#94A3B8'
              value={form.username}
              onBlur={handleBlur}
              onChangeText={(text) => handleInputChange('username', text)}>
            </TextInput>
          </View>
          <View className="pb-3"></View>

          {/* Password Text Input */}
          <View className="space-y-2 px-4 w-full h-14 border-2 border-white bg-white focus:border-secondary-100 rounded-lg items-center flex-row">
            <TextInput 
              className="text-sm font-pmedium text-primary w-[94%]"
              placeholder='Password'
              placeholderTextColor='#94A3B8'
              value={form.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry={!showPassword}
              textContentType='password'>
            </TextInput>
            <TouchableOpacity className="pb-2" onPress={() => setshowPassword(!showPassword)}>
                <Image 
                    tintColor="#94A3B8"
                    source={!showPassword ? icons.eye : icons.eyeHide}
                    className="w-6 h-6"
                    resizeMode='contain'
                />
            </TouchableOpacity>
          </View>
          <View className="pb-6"></View>
        </View>

        {/* Terms and Conditions */}
        <View className="pt-5 items-center bg-white">
          <TouchableOpacity className="items-center" onPress={() => setModalVisible(!isModalVisible)}>
            <View className="flex-row">
              <Text className="font-pregular text-sm text-primary">Please read and agree to the{" "}</Text>
              <Text className="font-psemibold text-sm text-primary">Terms and Conditions</Text>
            </View>
              <Text className="font-pregular text-sm text-primary pb-3">in order to use our Service.</Text>
          </TouchableOpacity>

          {/* Proceed Button */}
          <TouchableOpacity className="w-4/5 mt-3 h-12" style={styles.createButton} onPress={handleProceed}>
            <Text className="text-white font-psemibold text-xl">PROCEED TO NEXT STEP {'>'}</Text>
          </TouchableOpacity>
          <View className="pb-24"></View>
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
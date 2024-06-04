import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';

import { images } from '../constants'
import { icons } from '../constants'

export default function App() {
    const [showPassword, setshowPassword] = useState(false)
    const [form, setForm] = useState({
        username: '',
        password: ''
    })

    const handleInputChange = (key, value) => {
        setForm({
          ...form,
          [key]: value,
        });
      };

    const submit = () => {
        console.log("Username: ", form.username)
        console.log("Password: ", form.password)
        router.push("home/map")
    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                {/* Login Container */}
                <View className="w-full justify-center items-center min-h-[100vh] px-4">
                    <View className="pb-9">
                        {/* GEOMAP Title Card */}
                        <Image 
                            source={images.title_w}
                            className="w-[295px] h-[74px]"
                            resizeMode='contain'
                        />
                    </View>
                    
                    {/* Username Input */}
                    <View className="space-y-2 px-4 w-full h-16 border-3 border-red bg-white focus:border-black rounded-2xl items-center flex-row">
                        <TextInput
                            className="w-full text-md font-pmedium text-primary"
                            placeholder='Username'
                            placeholderTextColor='#94A3B8'
                            value={form.username}
                            onChangeText={(text) => handleInputChange('username', text)}>
                        </TextInput>
                    </View>
                    {/* Spacing = PaddingBottom = 3 */}
                    <View className="pb-3"></View>

                    {/* Password Input */}
                    <View className="space-y-2 px-4 w-full h-16 border-3 border-red bg-white focus:border-black rounded-2xl items-center flex-row">
                        <TextInput
                            className="w-[93%] text-md font-pmedium text-primary"
                            placeholder='Password'
                            placeholderTextColor='#94A3B8'
                            secureTextEntry={!showPassword}
                            value={form.password}
                            onChangeText={(text) => handleInputChange('password', text)}>
                        </TextInput>
                        {/* Visible Password Button */}
                        <TouchableOpacity className="pb-2" onPress={() => setshowPassword(!showPassword)}>
                            <Image 
                                tintColor="#57b378"
                                source={!showPassword ? icons.eye : icons.eyeHide}
                                className="w-6 h-6"
                                resizeMode='contain'
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Spacing = PaddingBottom = 6 */}
                    <View className="pb-6"></View>

                    {/* Login Button */}
                    <TouchableOpacity className="w-2/3 mt-5 h-12 rounded-3xl bg-white items-center justify-center" onPress={submit}>
                        <Text className="text-primary font-psemibold text-2xl">LOGIN</Text>
                    </TouchableOpacity>

                    {/* Sign Up Button */}
                    <View className="justify-center pt-3 flex-row gap-1">
                        <Link href="/signup-choose">
                            <Text className="text-md text-white font-psemibold">Don't have account?</Text>
                            <Text className="text-md font-pbold text-secondary">{" "}Sign Up</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    );
}
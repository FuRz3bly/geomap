import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';

import { images } from '../constants'
import { icons } from '../constants'

export default function App() {
    return (
        <SafeAreaView className="bg-primary h-full">
                {/* Login Container */}
                <View className="w-full items-center min-h-[100vh] px-4">
                    {/* GEOMAP Title Card */}
                    <View className="absolute top-[20%] w-full items-center">
                        <Image 
                            source={images.title_w}
                            className="w-[350px] h-[150px]"
                            resizeMode='contain'
                        />
                    </View>
                    {/* Sign Up Button */}
                    <View className="absolute bottom-[10%] w-full items-center">
                        <TouchableOpacity className="w-5/6 h-12 py-2 rounded-3xl bg-white items-center justify-center" onPress={() => {router.push("/user-registration")}}>
                            <Text className="text-primary font-psemibold text-xl">SIGN UP</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity className="w-5/6 mt-6 h-12 py-2 rounded-3xl bg-primary-50 items-center justify-center" onPress={() => {router.push("/login")}}>
                            <Text className="text-white primary font-psemibold text-xl">LOGIN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            <StatusBar backgroundColor='#3b8a57' style={'light'} />
        </SafeAreaView>
    );
}
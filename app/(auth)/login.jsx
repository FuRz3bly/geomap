import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';

import { images } from '../../constants'
import { icons } from '../../constants'
import { useUser } from '../../constants/users/UserContext';

export default function Login() {
    // Password Visibility
    const [showPassword, setshowPassword] = useState(true)
    // Textbox Containers, username and password
    const [form, setForm] = useState({
        username: '',
        password: ''
    })
    // Users from users/static.js
    const { users, setCurrentUser } = useUser();
    // Input Text from Textbox to containers
    const handleInputChange = (key, value) => {
        setForm({
          ...form,
          [key]: value,
        });
      };
    // Login Button Logic
    const submit = () => {
        // Remove all spaces from input
        const processedUsername = form.username.replace(/\s+/g, '');
        const processedPassword = form.password.replace(/\s+/g, '');
        // Setting the formatted username and password
        setForm({
            username: processedUsername,
            password: processedPassword
        });
        // Check if the user is registered in the user static list
        const user = users.find(
        (user) => user.username === form.username && user.password === form.password
        );
        // If the user is on the list, allow to push into Map
        if (user) {
            setCurrentUser(user);
            // Check the first digit of user_id
            const checkID = user.user_id.charAt(0);
            if (user.username.includes('@respo') && user.type === 'responder' && checkID === '2') {
                router.push("home/geolocation/map-r");
                console.log("Username: ", form.username);
                console.log("Password: ", form.password);
            } else {
                router.push("home/geolocation/map-c");
                console.log("Username: ", form.username);
                console.log("Password: ", form.password);
            }
        } else {
            // If not block access
            Alert.alert(
                "Access Blocked",
                "Incorrect Username or Password.",
                [{ text: "OK" }]
            );
        }
    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                {/* Login Container */}
                <View className="w-full justify-center min-h-[100vh] px-4">
                    <View className="absolute top-[25%] left-[15%]">
                        {/* GEOMAP Title Card */}
                        <Image 
                            source={images.title_w}
                            className="w-[295px] h-[74px]"
                            resizeMode='contain'
                        />
                    </View>
                    {/* Username Input */}
                    <View className="pl-2 pb-2">
                      <Text className="font-psemibold text-base text-white">Username</Text>
                    </View>
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
                    <View className="pb-3" />

                    {/* Password Input */}
                    <View className="pl-2 py-2">
                      <Text className="font-psemibold text-base text-white">Password</Text>
                    </View>
                    <View className="space-y-2 px-4 w-full h-16 border-3 border-red bg-white focus:border-black rounded-2xl items-center flex-row">
                        <TextInput
                            className="w-[93%] text-md font-pmedium text-primary"
                            placeholder='Password'
                            placeholderTextColor='#94A3B8'
                            secureTextEntry={showPassword}
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
                    {/* Button Containers */}
                    <View className="absolute left-[4%] bottom-[15%] w-full items-center">
                      {/* Login Button */}
                      <TouchableOpacity className="w-2/3 h-12 rounded-3xl bg-white items-center justify-center" onPress={submit}>
                          <Text className="text-primary font-psemibold text-2xl">LOGIN</Text>
                      </TouchableOpacity>
                      {/* Sign Up Button */}
                      <View className="justify-center pt-4 flex-row gap-1">
                          <Link href="/user-registration">
                              <Text className="text-md text-white font-psemibold">Don't have account?</Text>
                              <Text className="text-md font-pbold text-secondary">{" "}Sign Up</Text>
                          </Link>
                      </View>
                    </View>
                </View>
            </ScrollView>
            {/* Status Bar */}
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    );
}
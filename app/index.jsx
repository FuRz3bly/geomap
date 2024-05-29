import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';

import { images } from '../constants'
import { icons } from '../constants'

export default function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const submit = () => {
        router.push("map")
    }

    const [showPassword, setshowPassword] = useState(false)

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                <View className="w-full justify-center items-center min-h-[100vh] px-4">
                    <View className="pb-2">
                        <Image 
                            source={images.title_w}
                            className="w-[295px] h-[74px]"
                            resizeMode='contain'
                        />
                    </View>
                    <Text className="text-2xl text-white text-semibold mt-10 font-psemibold" style={{ paddingBottom: 25 }}>Log in to GEOMAP</Text>

                    <View className="space-y-2 px-4 w-full h-16 border-3 border-red bg-white focus:border-black rounded-2xl items-center flex-row">
                        <TextInput
                            className="flex-1 text-md font-pmedium text-primary"
                            placeholder='Username'
                            placeholderTextColor='#CDCDE0'
                            onChangeText={(username => setUsername(username))}>
                        </TextInput>
                    </View>

                    <View style={{ paddingBottom: 30 }}></View>
                    <View className="space-y-2 px-4 w-full h-16 border-3 border-red bg-white focus:border-black rounded-2xl items-center flex-row">
                        <TextInput
                            className="flex-1 text-md font-pmedium text-primary"
                            placeholder='Password'
                            placeholderTextColor='#CDCDE0'
                            secureTextEntry={!showPassword}
                            onChangeText={(password => setPassword(password))}>
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

                    <TouchableOpacity className="w-2/3 mt-5 h-12" style={styles.loginButton} onPress={submit}>
                        <Text className="text-primary font-psemibold text-2xl">LOGIN</Text>
                    </TouchableOpacity>

                    <View className="justify-center pt-3 flex-row gap-1">
                        <Link href="/signup-choose">
                            <Text className="text-md text-white font-pregular">Don't have account?</Text>
                            <Text className="text-md font-psemibold text-secondary">{" "}Sign Up</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loginButton: {
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "white"
    }
})
import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, TouchableHighlight, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { images } from '../constants'
import { icons } from '../constants'

export default function App() {
    const [loading, setLoading] = useState(false);
    const [oloading, setOloading] = useState(false);

    const LogIn = () => {
        setLoading(true);
        router.push("/log-in");
        setLoading(false);
    };

    const Register = () => {
        setOloading(true);
        router.push("/register");
        setOloading(false);
    };

    // 
    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    return (
        <SafeAreaView className="bg-primary h-full">
            {/* Login Container */}
            <View className="w-full items-center min-h-[100vh] px-4">
                {/* GEOMAP Title Card */}
                <View className="absolute top-[20%] w-full h-[18%] items-center">
                    <Image 
                        source={images.title_w}
                        className="w-[100%] h-[100%]"
                        resizeMode='contain'
                    />
                </View>
                {/* Sign Up Button */}
                <View className="absolute bottom-[10%] w-full items-center">
                    <TouchableHighlight 
                        underlayColor={"#FDFFAE"} 
                        className="w-5/6 h-12 py-2 rounded-3xl bg-white items-center justify-center" 
                        onPress={LogIn} 
                        disabled={loading}
                    >
                        {loading ? (<ActivityIndicator size="large" color="#57b378" />) : (<Text className="text-primary font-psemibold text-xl">LOGIN</Text>)}
                    </TouchableHighlight>

                    {/* Register Button */}
                    <TouchableHighlight 
                        underlayColor={"#86ebaa"} 
                        className="w-5/6 mt-6 h-12 py-2 rounded-3xl bg-primary-75 items-center justify-center" 
                        onPress={Register} 
                        disabled={oloading}
                    >
                        {oloading ? (<ActivityIndicator size="large" color="#57b378" />) : (<Text className="text-white font-psemibold text-xl">REGISTER</Text>)}
                    </TouchableHighlight>
                </View>
            </View>
            <StatusBar backgroundColor='#57b378' style={'light'} />
        </SafeAreaView>
    );
}

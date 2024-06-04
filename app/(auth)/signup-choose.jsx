import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import { router } from 'expo-router'

import { images } from '../../constants'

const SignUpC = () => {

    const community = () => {
        router.push("community/signup-personal")
    }

    const responder = () => {
        router.push("responder/signup-personal")
    }

  return (
    <SafeAreaView className="bg-primary h-full">
        <ScrollView>
            <View className="w-full min-h-[95vh] justify-center items-center px-4">
                <Image 
                    source={images.title_w}
                    className="w-[440px] h-[90px]"
                    resizeMode='contain' />
                
                <View className="relative mt-5">
                    <Text className="text-xl text-white font-pbold text-center">Join, Report, and Contribute: {"\n"}
                    <Text className="text-secondary-200">Help Protect and Secure {"\n"} </Text>
                    <Text>Our Community.</Text>
                    </Text>
                </View>

                <Text className="text-sm font-pregular text-white mt-7 text-center">Safeguarding Communities, One Report at a Time: Your Emergency Response Partner.</Text>

                <View style={{paddingTop: 20}}></View>
                    <View className="relative w-full flex-row gap-1 pr-1">
                        <TouchableOpacity className="w-4/5 mt-7 h-20" style={styles.selectButton} onPress={community}>
                            <Text className="text-primary font-psemibold text-xl">Community User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="w-1/5 mt-7 h-20" style={styles.infoButton}>
                            <Text className="text-primary font-pbold text-2xl">?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{paddingTop: 15}}></View>
                    <View className="relative w-full flex-row gap-1 pr-1">
                        <TouchableOpacity className="w-4/5 mt-7 h-20" style={styles.selectButton} onPress={responder}>
                            <Text className="text-primary font-psemibold text-xl">Emergency Responder</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="w-1/5 mt-7 h-20" style={styles.infoButton}>
                            <Text className="text-primary font-pbold text-2xl">?</Text>
                        </TouchableOpacity>
                    </View>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default SignUpC

const styles = StyleSheet.create({
    selectButton: {
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "white"
    },
    infoButton: {
        borderTopRightRadius: 25,
        borderBottomRightRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        backgroundColor: "white"
    }
})
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { icons } from '../../../constants';
import { images } from '../../../constants';

const ReportFailed = ({ visible, onClose }) => {
    const handleDetails = () => {}
    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.6}
            hideModalContentWhileAnimating={true}
            backdropTransitionInTiming={0}
            backdropTransitionOutTiming={0}
            animationIn="fadeInUp"
            animationOut="fadeOutDown"
            animationInTiming={400}
            animationOutTiming={500} 
        >
            <SafeAreaView className="w-full h-full absolute top-[20%] left-[5%]">
                {/* Failed Report Modal */}
                <View className="bg-white items-center justify-center h-[55%] w-[90%]">
                    {/* Close Button */}
                    <View className="absolute top-5 right-6 flex-row gap-6 items-center">
                    <TouchableOpacity onPress={onClose}>
                        <Image
                        source={icons.moreDetails}
                        tintColor="#000000"
                        className="w-8 h-8"
                        resizeMode="contain"
                        />
                    </TouchableOpacity>
                    {/* Details Button */}
                    <TouchableOpacity onPress={handleDetails}>
                        <Image
                        source={icons.close}
                        tintColor={"#000000"}
                        className="w-6 h-6"
                        resizeMode="contain"
                        />
                    </TouchableOpacity>
                    </View>
                    {/* GEOMAP - Title */}
                    <View className="absolute top-[18%] items-center">
                    <Image
                        source={images.title_b}
                        className="w-[250 px] h-[70px]"
                        resizeMode="contain"
                    />
                    </View>
                    {/* Failed Icon */}
                    <View className="absolute top-[40%] items-center">
                    <Image
                        source={icons.failed}
                        tintColor={"#de4e55"}
                        className="w-[100px] h-[100px]"
                        resizeMode="contain"
                    />
                    </View>
                    {/* Report Failed */}
                    <View className="absolute bottom-[18%]">
                    <Text className="font-pbold text-2xl text-center text-black">
                        REPORT {"\n"} FAILED
                    </Text>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default ReportFailed
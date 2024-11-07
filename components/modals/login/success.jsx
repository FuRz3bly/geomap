import React, { useEffect, useContext, useState } from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../../constants';

const Success = ({ visible, onClose, title, description }) => {
    return (
        <Modal
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
            backdropColor='black'
            backdropOpacity={0.3}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={600}
            animationOutTiming={1000}
        >
            <SafeAreaView className="items-center justify-center">
            {/* Success Modal */}
            <View className="w-[85%] h-[70%] bg-white items-center justify-center rounded-3xl">
                {/* Icon */}
                <Image 
                    tintColor="#57b378"
                    source={icons.success}
                    className="w-20 h-20"
                    resizeMode='contain'
                />
                {/* Success Title */}
                <Text className="text-primary text-2xl font-psemibold py-8" numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
                {/* Success Description */}
                <Text className="w-[80%] text-slate-500 text-base font-pregular text-center pb-8" numberOfLines={3} ellipsizeMode='tail'>{description}</Text>
                {/* Buttons Available */}
                <TouchableHighlight className="py-3 px-4 bg-primary rounded-2xl" underlayColor={"#86ebaa"} onPress={onClose}>
                <Text className="text-white text-base font-pregular text-center">OK</Text>
                </TouchableHighlight>
            </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Success;

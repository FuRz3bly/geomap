import React, { useEffect, useContext, useState } from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../../constants';

const Warning = ({ visible, onClose, title, description, onProceed }) => {
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
                {/* Warning Modal */}
                <View className="w-[85%] h-[70%] bg-white items-center justify-center rounded-3xl">
                    {/* Icon */}
                    <Image 
                        tintColor="#ff845c"
                        source={icons.warning}
                        className="w-20 h-20"
                        resizeMode='contain'
                    />
                    {/* Warning Title */}
                    <Text className="text-warn text-2xl font-psemibold py-8" numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
                    {/* Warning Description */}
                    <Text className="w-[80%] text-slate-500 text-base font-pregular text-center pb-8" numberOfLines={3} ellipsizeMode='tail'>{description}</Text>
                    {/* Buttons Available */}
                    <View className="w-[80%] flex-row justify-evenly">
                    {/* Yes */}
                    <TouchableHighlight className="py-3 px-4 bg-warn-100 rounded-2xl" underlayColor={"#ffc484"} onPress={onProceed}>
                        <Text className="text-white text-base font-pregular text-center">YES</Text>
                    </TouchableHighlight>
                    {/* No */}
                    <TouchableHighlight className="py-3 px-4 bg-warn rounded-2xl" underlayColor={"#ffc484"} onPress={onClose}>
                        <Text className="text-white text-base font-pregular text-center">NO</Text>
                    </TouchableHighlight>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Warning;
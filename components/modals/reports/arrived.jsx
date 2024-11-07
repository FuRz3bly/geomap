import React, { useEffect, useContext, useState } from 'react';
import { View, Image, Text, TouchableHighlight, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '../../../constants';
import { translate } from '../../ToolsContext';

const Arrived = ({ visible, onClose, onProceed, report, respo }) => {
    const { width, height } = Dimensions.get('screen'); // Screen Width and Height
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
            {/* Arrived Modal */}
            <View className={`w-[85%] ${height <= 900 ? 'h-[80%]' : 'h-[74%]'} bg-white items-center justify-center rounded-3xl`}>
                {/* Icon */}
                <Image 
                    tintColor="#57b378"
                    source={icons.arrived}
                    className="w-20 h-20"
                    resizeMode='contain'
                />
                {/* Arrived Title */}
                <Text className="text-primary text-2xl font-psemibold py-6" numberOfLines={1} ellipsizeMode='tail'>{'ARRIVAL'}</Text>
                {/* Arrived Description */}
                <Text className="w-[80%] text-black text-base font-pregular text-center" numberOfLines={4} ellipsizeMode='tail'>
                    {'Responders have arrived.'}
                </Text>
                <View className="w-[80%] rounded-2xl border-2 border-primary items-center justify-center p-2 my-4">
                    {/* Report Type */}
                    <View className="w-full h-8 flex-row">
                        <View className="w-3/6 h-full">
                            <Text className="font-rbold text-base text-black text-justify">
                                {'Report:'}
                            </Text>
                        </View>
                        <View className="w-3/6 h-full">
                            <Text className="font-rbase text-base text-black" numberOfLines={1}>
                                {translate(report)}
                            </Text>
                        </View>
                    </View>
                    {/* Responder */}
                    <View className="w-full h-8 flex-row">
                        <View className="w-3/6 h-full">
                            <Text className="font-rbold text-base text-black text-justify">
                                {'Responder:'}
                            </Text>
                        </View>
                        <View className="w-3/6 h-full">
                            <Text className="font-rbase text-base text-black" numberOfLines={1}>
                                {respo}
                            </Text>
                        </View>
                    </View>
                </View>
                {/* Buttons Available */}
                <View className="w-[80%] flex-row justify-between">
                    {/* Details */}
                    <TouchableHighlight className="py-3 px-4 bg-white rounded-2xl border-2 border-primary" underlayColor={"#86ebaa"} onPress={onProceed}>
                        <Text className="text-primary text-base font-rmedium text-center">DETAILS</Text>
                    </TouchableHighlight>
                    {/* Ok */}
                    <TouchableHighlight className="py-3 px-4 bg-primary rounded-2xl" underlayColor={"#86ebaa"} onPress={onClose}>
                        <Text className="text-white text-base font-rbase text-center">OK</Text>
                    </TouchableHighlight>
                </View>
            </View>
            </SafeAreaView>
        </Modal>
    )
}

export default Arrived;
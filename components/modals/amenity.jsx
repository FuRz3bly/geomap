import { View, Text } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context'

const Amenity = ({ visible, onClose, selectData }) => {
    return (
        <Modal
        isVisible={visible}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
        backdropColor='black'
        backdropOpacity={0.4}
        hideModalContentWhileAnimating={true}
        backdropTransitionInTiming={0}
        backdropTransitionOutTiming={0}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={400}
        animationOutTiming={500} 
    >
    <SafeAreaView className="absolute -bottom-5 -inset-x-5">
        <View className="w-120 h-30 justify-center bg-primary py-4">
            {/* Line Separator */}
            <View className="border-t-0.5 border-white/40" />
            {selectData && (
            <>
                {/*Amenity Name*/}
                <Text className="font-pbold text-lg text-white pt-3 pl-2">{selectData.name}</Text>
                <View className="flex-row justify-evenly pt-3 pb-5">
                {/*Amenity Type*/}
                <View className="w-1/3 border-r-0.5 border-white/40 h-18 pl-4">
                    <View className="flex-col gap-1.5">
                    <Text className="font-pregular text-sm text-white">Type:</Text>
                    <Text className="w-[80%] font-psemibold text-sm text-white">{selectData.type}</Text>
                    </View>
                </View>
                {/* Amenity Type */}
                <View className="w-1/3 border-r-0.5 border-white/40 h-18 pl-4">
                    <View className="flex-col gap-1.5">
                    <Text className="font-pregular text-sm text-white">Distance:</Text>
                    <Text className="w-[80%] font-psemibold text-sm text-white">{selectData.distance} km</Text>
                    </View>
                </View>
                {/* Amenity Type */}
                <View className="w-2/5 border-r-0.5 border-white/40 h-18 pl-4">
                    <View className="flex-col gap-1.5">
                    <Text className="font-pregular text-sm text-white">Address:</Text>
                    <Text className="w-[80%] font-psemibold text-sm text-white">{selectData.address}</Text>
                    </View>
                </View>
                </View>
            </>
            )}
            {/* Line Separator */}
            <View className="border-t-0.5 border-white/40" />
        </View>
    </SafeAreaView>
    </Modal>
    )
}

export default Amenity
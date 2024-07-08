import { View, Text, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

import { icons } from '../../../constants'

const ReportTools = ({ selectedReport, toggleReport, onClose, userDetails }) => {
    // Profile Components
    const [showProfile, setShowProfile] = useState(false)
    // Toggle Profile
    const toggleProfile = () => {setShowProfile(!showProfile)}
    // Format id from ######### to ###-###-###
    const formatId = (id) => {return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6, 9)}`};
    // Format services to be Service, Service
    const formatServices = (services) => {
        const validServices = services.filter(service => service.length > 0);
        if (validServices.length === 0) return '';
        if (validServices.length === 1) return validServices[0].charAt(0).toUpperCase() + validServices[0].slice(1);
        return validServices.map(service => service.charAt(0).toUpperCase() + service.slice(1)).join(', ');
    };
    // Format Total Reports to 1 - 001
        const formatReport = (number, length) => {
        return number.toString().padStart(length, '0');
        }
    // All emergency types
    const emergency_types = [
        // Fire Emergency Types
        {type: 'structural_fire', description: 'Structural Fire'},
        {type: 'vehicular_fire', description: 'Vehicular Fire'},
        {type: 'fire_rescue', description: 'Rescue'},
        {type: 'explosion', description: 'Explosion Incident'},
        {type: 'wildfire', description: 'Wildfire'},
        // Police Emergency Types
        {type: 'personal_safety', description: 'Personal Safety'},
        {type: 'traffic_accident', description: 'Traffic Accident'},
        {type: 'public_disturbance', description: 'Public Disturbance'},
        {type: 'theft', description: 'Theft & Burglary'},
        {type: 'assault', description: 'Assault & Battery'},
        {type: 'domestic_violence', description: 'Domestic Violence'},
        {type: 'active_shooting', description: 'Active Shooting'},
        // NDRRMO Emergency Types
        {type: 'search_and_rescue', description: 'Search & Rescue'},
        {type: 'industrial_accidents', description: 'Industrial Accident'},
        {type: 'disaster_accident', description: 'Disaster Accident'}];

    const status_types = [
        // Responders Status Types
        {status: 'preliminary', description: 'Filing the Report'},
        {status: 'waiting', description: 'Waiting for Response'},
        {status: 'receive', description: 'Help is on the Way'},
        {status: 'arrive', description: 'Responder Arrived'},
    ]
    // Translate snake_case to proper Descriptions
    const getEmergency = (type) => {
        const emergencyType = emergency_types.find((et) => et.type === type);
        return emergencyType ? emergencyType.description : '';
    };
    // Translate snake_case to proper Descriptions
    const getStatus = (status) => {
        const statusType = status_types.find((st) => st.status === status);
        return statusType ? statusType.description : '';
    };
    if (!selectedReport) {
        return (
            <><View></View></>
        )
    }
    return (
        <Modal
          isVisible={toggleReport}
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
        <SafeAreaView className="w-full h-full -bottom-[1.5%] items-center justify-center">
            <View className="z-30 absolute inset-0 bottom-[79%] bg-primary border-[10px] border-primary rounded-full">
                    <TouchableOpacity onPress={onClose} className='w-12 h-12 bg-white border-white border-0.5 rounded-full flex-row items-center justify-center'>
                        <Image 
                            tintColor={"#57b378"}
                            source={icons.close}
                            className="w-6 h-6"
                            resizeMode='contain'
                        />
                    </TouchableOpacity>
            </View>
            <View className="w-[660px] h-[550px] bg-primary rounded-full">
                <View className="w-[60%] h-[0.2%] absolute top-[11.5%] left-[20%] bg-white" />
                <View className="w-[70%] h-[12%] absolute top-[12%] left-[18%] bg-primary">
                    <Text className="font-pbold text-xl text-white pt-[4%] pl-[6%]">Report Details</Text>
                </View>
                <View className="w-[60%] h-[0.2%] absolute top-[24%] left-[20%] bg-white" />
                <View className="absolute left-[20%] top-[25%] -z-10 w-full h-full">
                    {selectedReport && (
                        <>
                            <ScrollView showsVerticalScrollIndicator={false} className="flex-grow gap-3">
                                <View className="pt-3 pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Report ID:{"   "}</Text>
                                        #{formatId(selectedReport.id)}
                                    </Text>
                                </View>
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Status:{"   "}</Text>
                                        {getStatus(selectedReport.status)}
                                    </Text>
                                </View>
                                {showProfile === false ? (
                                    <TouchableOpacity onPress={toggleProfile}>
                                        <View className="border-y-[1px] border-white py-4">
                                            <View className="flex-row">
                                                <Text className="font-pregular text-base text-white pl-2">
                                                    <Text className="font-pbold">User:{"   "}</Text>
                                                    {selectedReport.user.fullname.firstname}{" "}{selectedReport.user.fullname.lastname}
                                                </Text>
                                                <View className="w-[5%] h-[120%] absolute right-[40%] pt-0.5">
                                                    <Image 
                                                        tintColor="#ffffff"
                                                        source={icons.moreDetails}
                                                        className="w-5 h-5"
                                                        resizeMode='contain'
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={toggleProfile}>
                                        <View className="border-y-[1px] border-white py-4">
                                            <Text className="font-pregular text-base text-white pl-2 pb-2">
                                                <Text className="font-pbold">Name:{"   "}</Text>
                                                {selectedReport.user.fullname.firstname}{" "}{selectedReport.user.fullname.middlename}{" "}{selectedReport.user.fullname.lastname}
                                            </Text>
                                            <Text className="font-pregular text-base text-white pl-2 pb-2">
                                                <Text className="font-pbold">Username:{"   "}</Text>
                                                {selectedReport.user.username}
                                            </Text>
                                            <View className="w-[40%] h-[120px] items-center justify-center bg-white/40 rounded-2xl left-2">
                                                <Image 
                                                    tintColor="#ffffff"
                                                    source={icons.camera}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                            </View>
                                            <Text className="font-pregular text-base text-white pl-2 pt-3 pb-2">
                                                <Text className="font-pbold">Address:{"   "}</Text>
                                                {selectedReport.user.address}
                                            </Text>
                                            <Text className="font-pregular text-base text-white pl-2 pb-2">
                                                <Text className="font-pbold">Phone Number:{"   "}</Text>
                                                {"(064)"}{selectedReport.user.phone_number}
                                            </Text>
                                            <Text className="font-pregular text-base text-white pl-2 pb-2">
                                                <Text className="font-pbold">Email:{"   "}</Text>
                                                {selectedReport.user.email}
                                            </Text>
                                            {userDetails && (
                                                <Text className="font-pregular text-base text-white pl-2 pb-2">
                                                    <Text className="font-pbold">Total Reports:{"   "}</Text>
                                                {formatReport(userDetails.reports, 3)}
                                            </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Date:{"   "}</Text>
                                            {selectedReport.date}
                                    </Text>
                                </View>
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Time:{"   "}</Text>
                                            {selectedReport.time}
                                    </Text>
                                </View>
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Location:{"   "}</Text>
                                            {(selectedReport.latitude).toFixed(3)}{"  "}{"|"}{"  "}{(selectedReport.longitude).toFixed(3)}
                                    </Text>
                                </View>
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Address:{"   "}</Text>
                                            {selectedReport.address}
                                    </Text>
                                </View>
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Type:{"   "}</Text>
                                            {getEmergency(selectedReport.type)}
                                    </Text>
                                </View>
                                <View className="pl-2">
                                    <Text className="font-pregular text-base text-white">
                                        <Text className="font-pbold">Services:{"   "}</Text>
                                            {formatServices(selectedReport.services)}
                                    </Text>
                                </View>
                                <View className="border-y-[1px] border-white py-4">
                                    <Text className="font-pbold text-base text-white pl-2 pb-4">Evidences:</Text>
                                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-4">
                                            <View className="w-[120px] h-[260px] items-center justify-center bg-white/50 rounded-2xl">
                                                <Image 
                                                tintColor="#ffffff"
                                                source={icons.camera}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <View className="w-[120px] h-[260px] items-center justify-center bg-white/50 rounded-2xl">
                                                <Image 
                                                tintColor="#ffffff"
                                                source={icons.camera}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            <View className="w-[120px] h-[260px] items-center justify-center bg-white/50 rounded-2xl">
                                                <Image 
                                                tintColor="#ffffff"
                                                source={icons.camera}
                                                className="w-6 h-6"
                                                resizeMode='contain'
                                                />
                                            </View>
                                            </View>
                                        </ScrollView>
                                </View>
                            </ScrollView>
                        </>
                    )}
                </View>
            </View>
            <View className="w-[660px] h-[550px] absolute inset-0 -bottom-[10%] -z-10 bg-primary">
            </View>
        </SafeAreaView>
    </Modal>
    )
}

export default ReportTools;
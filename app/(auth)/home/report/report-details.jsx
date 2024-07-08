import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../../../constants'
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useUser } from '../../../../constants/users/UserContext'

const Report = () => {
    // Type of Emergency Components
    const [isEmergencyTypeVisible, setEmergencyTypeVisible] = useState(false); /// Primary Emergency Type Logic
    const { currentUser } = useUser(); /// User Details
    // THE REPORT FORM
    const [reportform, setReportForm] = useState({
        id: '',
        user: {
          user_id: currentUser.user_id,
          username: currentUser.username,
          fullname: currentUser.fullname,
          address: currentUser.address,
          phone_number: currentUser.phone_number,
          email: currentUser.email,
          photo_id: currentUser.photo_id
        },
        status: "preliminary",
        date: '',
        time: timeString,
        latitude: null,
        longitude: null,
        handler: "",
        type: "",
        services: [],
    });
    // Time Dropdown Components
    const [isTimeVisible, setTimeVisible] = useState(false); /// Primary Time Dropdown Logic
    const [selectedTimeOption, setSelectedTimeOption] = useState('current'); /// Time Options Container
    const [currentTime, setCurrentTime] = useState(new Date()); /// Current Time Container
    /// Time Countdown
    useEffect(() => {
        const intervalId = setInterval(() => {
        setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);
    /// Format Time from 3:31:20 AM to 23:23:54
    const options = {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'};
    const timeString = currentTime.toLocaleTimeString('en-US', options); // Counting Down Time Display
    /// Preferred Communication Components
    const [isPreferComsVisible, setPreferComsVisible] = useState(false); /// Primary Preferred Communication Dropdown Logic
    const [selectedPreferComsOption, setSelectedPreferComsOption] = useState('personal'); /// Preferred Communication Options Container

    return (
      <SafeAreaView className="bg-primary h-full w-full items-center justify-center">
        <View className="h-[93%] w-[95%] bg-white top-[2%]">
            <Text className="font-pbold text-2xl text-primary pl-6 py-3">Preliminary Report</Text>
            <ScrollView>
                <View className="mx-5">
{/*-----------------------------------------------------------------------------------------------------Type-of-the-Emergency-Dropdown-*/}
                    <View className="pb-2">
                        {isEmergencyTypeVisible ? (
                            <>
                                <TouchableOpacity onPress={() => setEmergencyTypeVisible(!isEmergencyTypeVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">Type of Emergency</Text>
                                        <View className="absolute right-[5%] items-center justify-center">
                                            <Image 
                                                tintColor='#57b378'
                                                source={!isEmergencyTypeVisible ? icons.arrowD : icons.arrowU}
                                                className="w-3 h-3"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                                    <View className="w-full grid items-center justify-center py-7">
                                        <View className="flex-row gap-12">
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.personalSafety}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Personal{"\n"}Safety</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.structuralFire}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Structural{"\n"}Fire</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.traffic}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Traffic{"\n"}Accident</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-9 pt-4">
                                            <View className="items-center justify-center bottom-2.5">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.theft}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Theft</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.publicDisturbance}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Public{"\n"}Disturbance</Text>
                                            </View>
                                            <View className="justify-center bottom-2.5">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.rescue}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Rescue</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-12 pt-4">
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.vehicularFire}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Vehicular{"\n"}Fire</Text>
                                            </View>
                                            <View className="items-center justify-center bottom-2.5">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.wildfire}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Wildfire</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.explosion}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Explosion{"\n"}Incident</Text>
                                            </View>            
                                        </View>
                                        <View className="flex-row gap-12 pt-4">
                                            <View className="items-center justify-center bottom-2.5">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.burglary}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Robbery</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.assault}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Assault &{"\n"}Battery</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.abuse}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Domestic{"\n"}Violence</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-12 pt-4">
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.missingPerson}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Missing{"\n"}Person</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.murder}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Active{"\n"}Shooting</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-12 pt-4">
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.searchRescue}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Search &{"\n"}Rescue</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.industrialAccident}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Industrial{"\n"}Accident</Text>
                                            </View>
                                            <View className="items-center justify-center">
                                                <Image 
                                                    tintColor='#57b378'
                                                    source={icons.disaster}
                                                    className="w-16 h-16"
                                                    resizeMode='contain'
                                                />
                                                <Text className="pt-2 font-pregular text-sm text-center text-primary">Disaster{"\n"}Accident</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setEmergencyTypeVisible(!isEmergencyTypeVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">Type of Emergency</Text>
                                        <View className="absolute right-[5%] items-center justify-center">
                                            <Image 
                                                tintColor='#57b378'
                                                source={!isEmergencyTypeVisible ? icons.arrowD : icons.arrowU}
                                                className="w-3 h-3"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
{/*-----------------------------------------------------------------------------------------------------Time-of-the-Emergency-Dropdown-*/}
                    {isTimeVisible ? (
                        <>
                            <TouchableOpacity onPress={() => setTimeVisible(!isTimeVisible)}>
                                <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                                    <Text className="font-pregular text-base text-primary">When the Emergency Happened?</Text>
                                    <View className="absolute right-[5%] items-center justify-center">
                                        <Image 
                                            tintColor='#57b378'
                                            source={!isTimeVisible ? icons.arrowD : icons.arrowU}
                                            className="w-3 h-3"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                                <View className="pt-1">
                                    <TouchableOpacity onPress={() => setSelectedTimeOption('current')}>
                                        <View className="flex-row items-center py-2 pl-3">
                                            <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                {selectedTimeOption === 'current' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                            </View>
                                            <Text className="left-[80%] font-pregular text-base text-primary">Just Now</Text>
                                            <Text className="left-[100%] font-pregular text-base text-primary">{"("}{timeString}{")"}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setSelectedTimeOption('lessHour')}>
                                        <View className="flex-row items-center py-2 pl-3">
                                            <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                {selectedTimeOption !== 'current' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                            </View>
                                            <Text className="left-[80%] font-pregular text-base text-primary">Within the past hour</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {selectedTimeOption !== 'current' && 
                                    <View className="left-[11%]">
                                        <TouchableOpacity onPress={() => setSelectedTimeOption('quarterHour')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 items-center justify-center bottom-1">
                                                {(selectedTimeOption === 'lessHour' || selectedTimeOption === 'quarterHour') && (
                                                    <Image 
                                                        tintColor='#57b378'
                                                        source={icons.check}
                                                        className="w-5 h-5"
                                                        resizeMode='contain'
                                                    />
                                                )}
                                                </View>
                                                <Text className="left-[80%] bottom-1 font-pregular text-base text-primary">Less than 15 Minutes</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSelectedTimeOption('halfHour')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 items-center justify-center bottom-1">
                                                {selectedTimeOption === 'halfHour' && (
                                                    <Image 
                                                        tintColor='#57b378'
                                                        source={icons.check}
                                                        className="w-5 h-5"
                                                        resizeMode='contain'
                                                    />
                                                )}
                                                </View>
                                                <Text className="left-[80%] bottom-1 font-pregular text-base text-primary">Within 30 Minutes</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSelectedTimeOption('moreHalfHour')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 items-center justify-center bottom-1">
                                                {selectedTimeOption === 'moreHalfHour' && (
                                                    <Image 
                                                        tintColor='#57b378'
                                                        source={icons.check}
                                                        className="w-5 h-5"
                                                        resizeMode='contain'
                                                    />
                                                )}
                                                </View>
                                                <Text className="left-[80%] bottom-1 font-pregular text-base text-primary">More than 30 Minutes</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    }
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setTimeVisible(!isTimeVisible)}>
                                <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                                    <Text className="font-pregular text-base text-primary">Time of Emergency</Text>
                                    <View className="absolute right-[5%] items-center justify-center">
                                        <Image 
                                            tintColor='#57b378'
                                            source={!isTimeVisible ? icons.arrowD : icons.arrowU}
                                            className="w-3 h-3"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
{/*---------------------------------------------------------------------------------------------------Preferred-Communication-Dropdown-*/}
                    <View className="pt-2">
                        {isPreferComsVisible ? (
                            <>
                                <TouchableOpacity onPress={() => setPreferComsVisible(!isPreferComsVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">How do you want to Contacted?</Text>
                                        <View className="absolute right-[5%] items-center justify-center">
                                            <Image 
                                                tintColor='#57b378'
                                                source={!isPreferComsVisible ? icons.arrowD : icons.arrowU}
                                                className="w-3 h-3"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                                    <View className="pt-1">
                                        <TouchableOpacity onPress={() => setSelectedPreferComsOption('personal')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                    {selectedPreferComsOption === 'personal' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                                </View>
                                                <Text className="left-[80%] font-pregular text-base text-primary">Personal</Text>
                                                <Text className="left-[80%] font-pregular text-base text-primary">{" (Meet in location)"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSelectedPreferComsOption('text')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                    {selectedPreferComsOption === 'text' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                                </View>
                                                <Text className="left-[80%] font-pregular text-base text-primary">Text</Text>
                                                {currentUser && <Text className="left-[80%] font-pregular text-base text-primary">{` (${currentUser.phone_number})`}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSelectedPreferComsOption('call')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                    {selectedPreferComsOption === 'call' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                                </View>
                                                <Text className="left-[80%] font-pregular text-base text-primary">Call</Text>
                                                {currentUser && <Text className="left-[80%] font-pregular text-base text-primary">{` (${currentUser.phone_number})`}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setSelectedPreferComsOption('email')}>
                                            <View className="flex-row items-center py-2 pl-3">
                                                <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                    {selectedPreferComsOption === 'email' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                                </View>
                                                <Text className="left-[80%] font-pregular text-base text-primary">Email</Text>
                                                {currentUser && <Text className="w-[80%] left-[80%] font-pregular text-base text-primary">{` (${currentUser.email})`}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setPreferComsVisible(!isPreferComsVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">Preferred Communication</Text>
                                        <View className="absolute right-[5%] items-center justify-center">
                                            <Image 
                                                tintColor='#57b378'
                                                source={!isPreferComsVisible ? icons.arrowD : icons.arrowU}
                                                className="w-3 h-3"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    
                </View>
            </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
  
  export default Report;
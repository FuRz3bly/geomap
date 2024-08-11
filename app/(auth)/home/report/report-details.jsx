import { View, Text, Image, TouchableOpacity, PanResponder, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../../../constants'
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useUser } from '../../../../constants/users/UserContext';

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
        coordinates: {
            latitude: null,
            longitude: null
        },
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
    /// Takes all of the values and send it to Report Form
    const handleEType = (type, services, handler) => {
        setReportForm((prevForm) => {return { ...prevForm, type, services, handler };});};
    /// Takes Service Components
    const [isServiceVisible, setServiceVisible] = useState(false); /// Primary Service Dropdown Logic
    /// Injured Components
    const [isInjuredVisible, setInjuredVisible] = useState(false); /// Primary Injured Dropdown Logic
    const [isInjured, setInjured] = useState('no'); /// Is Injured Container
    const handleServiceChange = (service) => {
        setReportForm((prevForm) => {
            const newServices = prevForm.services.includes(service)
                ? prevForm.services.filter((s) => s !== service)
                : [...prevForm.services, service];

            if (newServices.includes('ambulance')) {setInjured('yes');} else {setInjured('no');}
            return { ...prevForm, services: newServices };
        });
    };
    const ETButton = ({ emergency_type, services, handler, icon, top_text, bottom_text}) => {
        return (
            <TouchableOpacity onPress={() => handleEType(emergency_type, services, handler)}>
                <View className={`items-center justify-center`}>
                    <Image 
                        tintColor={reportform.type === emergency_type ? '#57b378' : (reportform.type === '' ? '#57b378' : '#9c9c9c')}
                        source={icon}
                        className="w-16 h-16"
                        resizeMode='contain'
                    />
                    <Text className={`pt-2 font-pregular text-sm text-center ${reportform.type === emergency_type ? "text-primary" : (reportform.type === '' ? 'text-primary' : 'text-white-200')}`}>
                        {top_text}{'\n'}{bottom_text}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    };

    return (
      <SafeAreaView className="bg-primary h-full w-full items-center justify-center">
        <View className="h-[93%] w-[95%] bg-white top-[2%]">
            <Text className="font-pbold text-2xl text-primary pl-6 py-3">Preliminary Report</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mx-5">
{/*-----------------------------------------------------------------------------------------------------Type-of-the-Emergency-Dropdown-*/}
                    <View className="py-1">
                        {isEmergencyTypeVisible ? (
                            <>
                                <TouchableOpacity onPress={() => setEmergencyTypeVisible(!isEmergencyTypeVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">What is your Emergency?</Text>
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
                                        <View className="flex-row gap-8">
                                            {/*-------------------------------------------------------------------------Personal-Safety*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'personal_safety'} services={['']} handler={'police'} icon={icons.personalSafety} top_text={'Personal'} bottom_text={'Safety'}/>
                                            </View>
                                            {/*-------------------------------------------------------------------------Structural-Fire*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'structural_fire'} services={['firetruck']} handler={'fire_station'} icon={icons.structuralFire} top_text={'Structural'} bottom_text={'Fire'}/>
                                            </View>
                                            {/*------------------------------------------------------------------------Traffic-Accident*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'traffic_accident'} services={['ambulance']} handler={'police'} icon={icons.traffic} top_text={'Traffic'} bottom_text={'Accident'}/>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-7 pt-4">
                                            {/*-----------------------------------------------------------------------------------Theft*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'theft'} services={['']} handler={'barangay'} icon={icons.theft} top_text={'Theft'}/>
                                            </View>
                                            {/*----------------------------------------------------------------------Public-Disturbance*/}
                                            <View className="w-[25%]">
                                                <ETButton emergency_type={'public_disturbance'} services={['']} handler={'barangay'} icon={icons.publicDisturbance} top_text={'Public'} bottom_text={'Disturbance'}/>
                                            </View>
                                            {/*----------------------------------------------------------------------------------Rescue*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'fire_rescue'} services={['ambulance', 'firetruck']} handler={'fire_station'} icon={icons.rescue} top_text={'Rescue'}/>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-8 pt-4">
                                            {/*--------------------------------------------------------------------------Vehicular-Fire*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'vehicular_fire'} services={['firetruck']} handler={'fire_station'} icon={icons.vehicularFire} top_text={'Vehicular'} bottom_text={'Fire'}/>
                                            </View>
                                            {/*--------------------------------------------------------------------------------Wildfire*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'wildfire'} services={['firetruck']} handler={'fire_station'} icon={icons.wildfire} top_text={'Wildfire'}/>
                                            </View>
                                            {/*----------------------------------------------------------------------Explosion-Incident*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'explosion'} services={['firetruck']} handler={'fire_station'} icon={icons.explosion} top_text={'Explosion'} bottom_text={'Incident'}/>
                                            </View>         
                                        </View>
                                        <View className="flex-row gap-8 pt-4">
                                            {/*-------------------------------------------------------------------------Active-Shooting*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'active_shooting'} services={['ambulance']} handler={'police'} icon={icons.murder} top_text={'Active'} bottom_text={'Shooting'}/>
                                            </View>
                                            {/*-----------------------------------------------------------------------Assault-&-Battery*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'assault'} services={['ambulance']} handler={'police'} icon={icons.assault} top_text={'Assault'}/>
                                            </View>
                                            {/*-----------------------------------------------------------------------Domestic-Violence*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'domestic_violence'} services={['ambulance']} handler={'barangay'} icon={icons.abuse} top_text={'Domestic'} bottom_text={'Violence'}/>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-8 pt-4">
                                            {/*--------------------------------------------------------------------------Missing-Person*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'missing_person'} services={['']} handler={'police'} icon={icons.missingPerson} top_text={'Missing'} bottom_text={'Person'}/>
                                            </View>
                                            {/*--------------------------------------------------------------------------Alarming-Noise*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'noise'} services={['']} handler={'barangay'} icon={icons.noise} top_text={'Alarming'} bottom_text={'Noise'}/>
                                            </View>
                                            {/*---------------------------------------------------------------------------------Robbery*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'robbery'} services={['']} handler={'police'} icon={icons.burglary} top_text={'Robbery'}/>
                                            </View>
                                        </View>
                                        <View className="flex-row gap-8 pt-4">
                                            {/*-------------------------------------------------------------------------Search-&-Rescue*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'search_and_rescue'} services={['']} handler={'disaster'} icon={icons.searchRescue} top_text={'Search &'} bottom_text={'Rescue'}/>
                                            </View>
                                            {/*---------------------------------------------------------------------Industrial-Accident*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'industrial_accident'} services={['ambulance']} handler={'disaster'} icon={icons.industrialAccident} top_text={'Industrial'} bottom_text={'Accident'}/>
                                            </View>
                                            {/*-----------------------------------------------------------------------Disaster-Accident*/}
                                            <View className="w-[20%]">
                                                <ETButton emergency_type={'disaster_accident'} services={['']} handler={'disaster'} icon={icons.disaster} top_text={'Disaster'} bottom_text={'Accident'}/>
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
                    <View className="py-1">
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
                    </View>
{/*---------------------------------------------------------------------------------------------------Preferred-Communication-Dropdown-*/}
                    <View className="py-1">
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
{/*-----------------------------------------------------------------------------------------------------------Services-Needed-Dropdown-*/}
                    <View className="py-1">
                        {isServiceVisible ? (
                            <>
                                <TouchableOpacity onPress={() => setServiceVisible(!isServiceVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">What Services you require?</Text>
                                        <View className="absolute right-[5%] items-center justify-center">
                                            <Image 
                                                tintColor='#57b378'
                                                source={!isServiceVisible ? icons.arrowD : icons.arrowU}
                                                className="w-3 h-3"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                                    <View className="py-4 flex-row gap-8 justify-center items-center">
                                        {/*-----------------------------------------------------------------------------------Ambulance*/}
                                        <TouchableOpacity onPress={() => handleServiceChange('ambulance')}>
                                            <View className={`items-center justify-center`}>
                                                <Image 
                                                    tintColor={reportform.services.includes('ambulance') ? "#57b378" : "#9c9c9c"}
                                                    source={icons.ambulance}
                                                    className="w-28 h-11"
                                                    resizeMode='contain'
                                                />
                                                <Text className={`pt-2 font-pregular text-sm text-center ${reportform.services.includes('ambulance') ? "text-primary" : 'text-white-200'}`}>
                                                    Ambulance
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        {/*----------------------------------------------------------------------------------Fire-Truck*/}
                                        <TouchableOpacity onPress={() => handleServiceChange('firetruck')}>
                                            <View className={`items-center justify-center`}>
                                                <Image
                                                    tintColor={reportform.services.includes('firetruck') ? "#57b378" : "#9c9c9c"}
                                                    source={icons.fireTruck}
                                                    className="w-28 h-11"
                                                    resizeMode='contain'
                                                />
                                                <Text className={`pt-2 font-pregular text-sm text-center ${reportform.services.includes('firetruck') ? "text-primary" : 'text-white-200'}`}>
                                                    Fire Truck
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setServiceVisible(!isServiceVisible)}>
                                    <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                                        <Text className="font-pregular text-base text-primary">Services Needed</Text>
                                        <View className="absolute right-[5%] items-center justify-center">
                                            <Image 
                                                tintColor='#57b378'
                                                source={!isServiceVisible ? icons.arrowD : icons.arrowU}
                                                className="w-3 h-3"
                                                resizeMode='contain'
                                            />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    <View className="py-1">
                    {isInjuredVisible ? (
                        <>
                            <TouchableOpacity onPress={() => setInjuredVisible(!isInjuredVisible)}>
                                <View className="flex-row pl-3 py-2 rounded-t-xl border-2 border-primary items-center">
                                    <Text className="font-pregular text-base text-primary">Was Anyone Injured?</Text>
                                    <View className="absolute right-[5%] items-center justify-center">
                                        <Image 
                                            tintColor='#57b378'
                                            source={!isInjuredVisible ? icons.arrowD : icons.arrowU}
                                            className="w-3 h-3"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View className="border-b-2 border-x-2 border-primary rounded-b-xl">
                                    <View className="py-2">
                                        <TouchableOpacity onPress={() => setInjured('yes')}>
                                            <View className="flex-row items-center py-1 pl-3">
                                                <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                    {isInjured === 'yes' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                                </View>
                                                <Text className="left-[80%] font-pregular text-base text-primary">Yes</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setInjured('no')}>
                                            <View className="flex-row items-center py-1 pl-3">
                                                <View className="w-5 h-5 border-[2px] border-primary bg-white items-center justify-center rounded-full">
                                                    {isInjured === 'no' && <View className="w-3 h-3 border-[1.5px] border-white bg-primary rounded-full"/>}
                                                </View>
                                                <Text className="left-[80%] font-pregular text-base text-primary">No</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setInjuredVisible(!isInjuredVisible)}>
                                <View className="flex-row pl-3 py-2 rounded-xl border-2 border-primary items-center">
                                    <Text className="font-pregular text-base text-primary">Injuries</Text>
                                    <View className="absolute right-[5%] items-center justify-center">
                                        <Image 
                                            tintColor='#57b378'
                                            source={!isInjuredVisible ? icons.arrowD : icons.arrowU}
                                            className="w-3 h-3"
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                    </View>
                    <View className="py-1">
                        <Text className="py-1 pl-2 font-pregular text-base text-primary">How many are injured?</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
  
  export default Report;
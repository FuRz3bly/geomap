import { View, Text, Image } from 'react-native'
import { Tabs, Redirect } from 'expo-router';
import React from 'react'

import { icons } from '../../constants';

const TabIcon = ({ icon, color, name, focused }) => {
    return (
        <View className='items-center justify-center'>
            <Image 
                source={icon} 
                resizeMode='contain'
                tintColor={color}
                className="w-6 h-6"
            />
            <Text className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}>
                {name}
            </Text>
        </View>
    )
}

const TabsLayout = () => {
  return (
    <>
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#57b378',
                tabBarInactiveTintColor: '#efefef',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: 'white',
                    height: 52,
                }
            }}
        >
            <Tabs.Screen 
            name="map"
            options={{
                title: 'Map',
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                    <TabIcon
                        icon={icons.logo}
                        color={color}
                        name="Map"
                        focused={focused}
                    />
                )
            }}
            />
            <Tabs.Screen 
            name="report"
            options={{
                title: 'Report',
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                    <TabIcon
                        icon={icons.eye}
                        color={color}
                        name="Report"
                        focused={focused}
                    />
                )
            }}
            />
            <Tabs.Screen 
            name="profile"
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({ color, focused }) => (
                    <TabIcon
                        icon={icons.profile}
                        color={color}
                        name="Profile"
                        focused={focused}
                    />
                )
            }}
            />
        </Tabs>
    </>
  )
}

export default TabsLayout
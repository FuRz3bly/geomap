import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { UserProvider } from '../../components/UserContext'
import { ToolsProvider } from '../../components/ToolsContext'

const AuthLayout = () => {
  return (
    <UserProvider>
      <ToolsProvider>
        <>
          <Stack
            screenOptions={{
              // Default transition for all screens
              animation: 'slide_from_bottom'
            }}
          >
            <Stack.Screen 
              name="home/homes"
              options={{
                headerShown: false,
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen 
              name="home/reports"
              options={{
                headerShown: false,
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen 
              name="home/maps"
              options={{
                headerShown: false,
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen 
              name="home/profiles"
              options={{
                headerShown: false,
                animation: 'slide_from_left'
              }}
            />
            <Stack.Screen 
              name="home/charts"
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="home/documents"
              options={{
                headerShown: false,
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen 
              name="home/statistics"
              options={{
                headerShown: false,
                animation: 'slide_from_left'
              }}
            />
            <Stack.Screen 
              name="home/details"
              options={{
                headerShown: false,
                animation: 'slide_from_left'
              }}
            />
            <Stack.Screen 
              name="home/helps"
              options={{
                headerShown: false,
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen 
              name="home/settings"
              options={{
                headerShown: false,
                animation: 'slide_from_left'
              }}
            />
            <Stack.Screen 
              name="home/developer"
              options={{
                headerShown: false,
                animation: 'slide_from_left'
              }}
            />
          </Stack>
          <StatusBar backgroundColor='#57b378' style='light' />
        </>
      </ToolsProvider>
    </UserProvider>
  )
}

export default AuthLayout
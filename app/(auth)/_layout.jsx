import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { UserProvider } from '../../constants/users/UserContext'

const AuthLayout = () => {
  return (
    <UserProvider>
      <>
        <Stack>
          <Stack.Screen 
            name="login"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="user-registration"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="register/community/signup-personal"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="register/community/signup-image"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="register/community/signup-verification"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="register/responder/signup-personal"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/geolocation/map-c"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/geolocation/map-r"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/details/profile"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/details/help"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/details/about-us"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/settings/settings"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/report/report-details"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/report/prelim-report"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/report/photo-report"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="home/report/finish-report"
            options={{
              headerShown: false
            }}
          />
        </Stack>
        <StatusBar backgroundColor='#57b378' style='light' />
      </>
    </UserProvider>
  )
}

export default AuthLayout
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen 
          name="login"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="signup-choose"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="community/signup-personal"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="community/signup-image"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="community/signup-verification"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="responder/signup-personal"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="responder/signup-image"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="responder/signup-verification"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="home/map"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="home/profile"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="home/help"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="home/about-us"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="home/settings"
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
  )
}

export default AuthLayout
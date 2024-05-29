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
          name="terms"
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
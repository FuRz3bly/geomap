import { Slot, Stack } from 'expo-router';

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false}} />
      <Stack.Screen name="selectType" options={{ headerShown: false}} />
      <Stack.Screen name="signupPage/communitySignup" options={{ headerShown: false}} />
      <Stack.Screen name="signupPage/responderSignup" options={{ headerShown: false}} />
      <Stack.Screen name="Map-Page" options={{ headerShown: false}} />
    </Stack>
  )
}

export default RootLayout
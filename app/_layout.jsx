import { StyleSheet, Text, View } from 'react-native';
import { Slot, Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { Asset } from 'expo-asset';

SplashScreen.preventAutoHideAsync();

const iconsToPreload = [
  require("../assets/icons/fire-marker-color.png"),
  require("../assets/icons/police-marker-color.png"),
  require("../assets/icons/disaster-marker-color.png"),
  require("../assets/icons/barangay-marker-color.png")
];

const preloadIcons = async () => {
  return Promise.all(iconsToPreload.map(icon => Asset.loadAsync(icon)));
};

const RootLayout = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "OpenSans-ExtraBold": require("../assets/fonts/OpenSans-ExtraBold.ttf"),
    "OpenSans-Light": require("../assets/fonts/OpenSans-Light.ttf"),
    "OpenSans-Medium": require("../assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-SemiBold": require("../assets/fonts/OpenSans-SemiBold.ttf"),
    "Roboto-Black": require("../assets/fonts/Roboto-Black.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Light": require("../assets/fonts/Roboto-Light.ttf"),
    "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Thin": require("../assets/fonts/Roboto-Thin.ttf"),
  });

  const [splashHidden, setSplashHidden] = useState(false);
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        await preloadIcons(); // Preload icons
        setIconsLoaded(true); // Set iconsLoaded to true when done
      } catch (error) {
        console.error('Error preloading icons:', error);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    if (fontsLoaded && iconsLoaded) {
      SplashScreen.hideAsync().then(() => setSplashHidden(true));
    }
  }, [fontsLoaded, iconsLoaded]);

  useEffect(() => {
    const backAction = () => {
      router.push("/");
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [router]);

  if (!fontsLoaded || !iconsLoaded || !splashHidden) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
      <Stack.Screen name="log-in" options={{ headerShown: false }}/>
      <Stack.Screen name="register" options={{ headerShown: false }}/>
      <Stack.Screen name="respo-register" options={{ headerShown: false }}/>
    </Stack>
  );
};

export default RootLayout;
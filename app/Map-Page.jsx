import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Geolocation = () => {
  return (
    <View style={styles.container}>
      <Text>Geolocation</Text>
    </View>
  )
}

export default Geolocation

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
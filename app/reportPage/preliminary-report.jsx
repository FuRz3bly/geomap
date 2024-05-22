import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const preliminaryReport = () => {
  return (
    <View style={styles.container}>
      <Text>preliminaryReport</Text>
    </View>
  )
}

export default preliminaryReport

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
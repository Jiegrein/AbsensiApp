import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { BarCodeScanningResult, Camera } from 'expo-camera';

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(Boolean);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [scanned, setScanned] = useState(false);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ( result: BarCodeScanningResult ) => {
    setScanned(true);
    alert(`Bar code with type ${result.type} and data ${result.data} has been scanned!`);
  };

  const askForCameraPermission = () => {
    (async () => {      
      const status = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status.status === "granted");
    })()
  }

  useEffect(() => {
    (async () => {
      askForCameraPermission();
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <Text>Permission?</Text>
    );
  }
  else if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>)
  }
  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <Camera style={{ height: 500, width: 400 }} type={type} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
        </Camera>
      </View>
      {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato'
  }
});

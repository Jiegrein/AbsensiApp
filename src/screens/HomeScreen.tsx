import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanningResult, Camera, PermissionStatus } from 'expo-camera';
import ScanBarCodeService from '../services/ScanBarCodeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native'

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(Boolean);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [scanned, setScanned] = useState(false);
  const [working, setWorking] = useState(false);
  const [hasUuid, setHasUuid] = useState('');

  const isFocused = useIsFocused();

  // What happens when we scan the bar code
  const handleBarCodeScanned = (result: BarCodeScanningResult) => {
    setScanned(true);
    alert(`Bar code with type ${result.type} and data ${result.data} has been scanned!`);
  };

  const askForCameraPermission = () => {
    (async () => {
      const permission = await Camera.requestCameraPermissionsAsync();
      // Alert.alert('Simple Button pressed');
      // console.log("Permission : " + permission.status);
      // console.log(PermissionStatus.GRANTED);
      setHasPermission(permission.status === PermissionStatus.GRANTED);
    })()
  }

  // const isFocused = useIsFocused()

  useEffect(() => {
    (async () => {
      console.log("Home useEffect");
      askForCameraPermission();
      const workingStatus = await ScanBarCodeService.getAppState();
      setWorking(workingStatus);
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <Text>Izin tidak ada</Text>
    );
  }
  else if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Berikan app akses ke kamera</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>)
  }

  let kerjaText
  if (working) {
    kerjaText = <Text>lagi kerja boss</Text>
  }
  else {
    kerjaText = <Text>lagi nganggur boss</Text>
  }

  if (isFocused) {
    return (
      <View style={styles.container}>
        <View style={styles.barcodebox}>
          <Camera style={{ height: 500, width: 400 }} type={type} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
          </Camera>
        </View>
        {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />}

        {kerjaText}
      </View>
    );
  }
  else {
    return (
      <View style={styles.container}>
      </View>
    );
  }
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

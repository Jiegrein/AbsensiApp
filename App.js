import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button} from 'react-native';
import { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not Yet Scanned');

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }

  //Request Camera Permision
  useEffect(() => {
    askForCameraPermission();
  }, []);

  //What happens when we scan the bar code
  const handleBarCode = ({type},{data}) =>{
    setScanned(true);
    setText(data);
    console.log('Type: ' +type + '\nData' +data);
  }

  //Check permissions and return the screens
  if(hasPermission === null){
    return (
      <View style={styles.container}>
        <Text>Camera Permision Dood</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  else if(hasPermission === false){
    return (
      <View style={styles.container}>
        <Text>No permission dood Pepehands</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()}/>
        <StatusBar style="auto" />
      </View>
    );
  }

  else if(hasPermission === true){
    return (
      <View style={styles.container}>
        <Text>permission PogChamp</Text>
        <StatusBar style="auto" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text>Dood</Text>
      <StatusBar style="auto" />
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
});

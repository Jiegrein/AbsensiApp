import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';

import { StackParamList } from './StackParams';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScanEnum from '../Enum/ScanEnum';

type Props = NativeStackScreenProps<StackParamList, 'Home'>;

export default function HomeScreen({ route, navigation }: Props) {
  const { idParam, workStatusParam, breakStatusParam } = route.params;
  const [workStatus, setWorkStatus] = useState(workStatusParam);
  const [breakStatus, setBreakStatus] = useState(breakStatusParam);

  useEffect(() => {
    (async () => {
      console.log("Home useEffect");
      // const status: [boolean, boolean, boolean] = await HomeService.getAppState(idParam);

      console.log('id = ' + idParam);
      console.log('workStatus = ' + workStatusParam);
      console.log('breakStatus = ' + breakStatusParam);

      // if (status[0] === true) {
      //   console.log('masuk 0');
      //   setWorkStatus(status[1]);
      //   setBreakStatus(status[2]);
      // }
      // else {
      //   // Handle user not found
      //   console.log('masuk 1');
      // }
    })();
  }, []);

  if (workStatus === false) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.Start_Work })}>
          <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
        </Pressable>
        <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.Start_Break })}>
          <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
        </Pressable>
        <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.End_Break })}>
          <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
        </Pressable>
        <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.End_Work })}>
          <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
        </Pressable>
      </View>
    );
  }
  else {
    if (breakStatus === false) {
      return (
        <View style={styles.container}>
          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.Start_Work })}>
            <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.Start_Break })}>
            <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
          </Pressable>
          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.End_Break })}>
            <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.End_Work })}>
            <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
          </Pressable>
        </View>
      );
    }
    else {
      return (
        <View style={styles.container}>
          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.Start_Work })}>
            <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
          </Pressable>
          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.Start_Break })}>
            <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.End_Break })}>
            <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Scanner', { scanEnum: ScanEnum.End_Work })}>
            <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
          </Pressable>
        </View>
      );
    }
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
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';

import { StackParamList } from './StackParams';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScanEnum from '../Enum/ScanEnum';
import { useIsFocused } from '@react-navigation/native';

type Props = NativeStackScreenProps<StackParamList, 'Home'>;

export default function HomeScreen({ route, navigation }: Props) {
  const { idParam, workStatusParam, breakStatusParam } = route.params;
  const [workStatus, setWorkStatus] = useState(workStatusParam);
  const [breakStatus, setBreakStatus] = useState(breakStatusParam);

  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      console.log('id = ' + idParam);
      console.log('workStatus = ' + workStatusParam);
      console.log('breakStatus = ' + breakStatusParam);

      setWorkStatus(workStatusParam);
      setBreakStatus(breakStatusParam);
    })();
  }, [isFocused]);

  if (workStatus === false) {
    return (
      <View style={styles.container}>
        <Text>Work Status: {String(workStatus)}</Text>
        <Text>Break Status: {String(breakStatus)}</Text>

        <View style={styles.containerHori}>
          <Pressable onPress={() => navigation.navigate('Scanner', {
            idParam: idParam, scanEnumParam: ScanEnum.Start_Work,
            workStatusParam: workStatus, breakStatusParam: breakStatus
          })}>
            <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
          </Pressable>

          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
            idParam: idParam, scanEnumParam: ScanEnum.End_Work,
            workStatusParam: workStatus, breakStatusParam: breakStatus
          })}>
            <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
          </Pressable>
        </View>

        <View style={styles.containerHori}>
          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
            idParam: idParam, scanEnumParam: ScanEnum.Start_Break,
            workStatusParam: workStatus, breakStatusParam: breakStatus
          })}>
            <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
          </Pressable>

          <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
            idParam: idParam, scanEnumParam: ScanEnum.End_Break,
            workStatusParam: workStatus, breakStatusParam: breakStatus
          })}>
            <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
          </Pressable>
        </View>
      </View>
    );
  }
  else {
    if (breakStatus === false) {
      return (
        <View style={styles.container}>
          <Text>Work Status: {String(workStatus)}</Text>
          <Text>Break Status: {String(breakStatus)}</Text>

          <View style={styles.containerHori}>
            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.Start_Work,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.End_Work,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
            </Pressable>
          </View>

          <View style={styles.containerHori}>
            <Pressable onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.Start_Break,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
            </Pressable>

            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.End_Break,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
            </Pressable>
          </View>
        </View>
      );
    }
    else {
      return (
        <View style={styles.container}>
          <Text>Work Status: {String(workStatus)}</Text>
          <Text>Break Status: {String(breakStatus)}</Text>

          <View style={styles.containerHori}>
            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.Start_Work,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.End_Work,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
            </Pressable>
          </View>

          <View style={styles.containerHori}>
            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.Start_Break,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
            </Pressable>

            <Pressable onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.End_Break,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })}>
              <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
            </Pressable>
          </View>
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
  containerHori: {
    flexDirection: 'row',
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
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 150,
    height: 150,
  },
});

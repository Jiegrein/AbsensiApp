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
      setWorkStatus(workStatusParam);
      setBreakStatus(breakStatusParam);
    })();
  }, [isFocused]);

  const displayWorkBreakStatus = () => {
    if (breakStatus === false) {
      if (workStatus) {
        return <Text style={styles.text}>Sedang Bekerja</Text>
      }
      else {
        return <Text style={styles.text}>Tidak Bekerja</Text>;
      }
    }
    else {
      return <Text style={styles.text}>Sedang Istirahat</Text>;
    }
  }

  if (workStatus === false) {
    return (
      <View style={styles.container}>
        <View style={styles.containerStatus}>
        </View>

        <View style={styles.containerHori}>
          <View style={{ paddingHorizontal: 20 }}>
            <Pressable onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.Start_Work,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })} style={{ alignItems: "center" }}>
              <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
              <Text style={styles.textLogo}>Mulai Bekerja</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.End_Work,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })} style={{ alignItems: "center" }}>
              <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
              <Text style={styles.textLogo}>Selesai Bekerja</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.containerHori2}>
          <View style={{ paddingHorizontal: 20 }}>
            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.Start_Break,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })} style={{ alignItems: "center" }}>
              <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
              <Text style={styles.textLogo}>Mulai Istirahat</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
              idParam: idParam, scanEnumParam: ScanEnum.End_Break,
              workStatusParam: workStatus, breakStatusParam: breakStatus
            })} style={{ alignItems: "center" }}>
              <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
              <Text style={styles.textLogo}>Selesai Istirahat</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.containerStatus}>
          {displayWorkBreakStatus()}
        </View>
      </View >
    );
  }
  else {
    if (breakStatus === false) {
      return (
        <View style={styles.container}>
          <View style={styles.containerStatus}>
          </View>

          <View style={styles.containerHori}>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.Start_Work,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
              <Text style={styles.textLogo}>Mulai Bekerja</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Pressable onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.End_Work,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
              <Text style={styles.textLogo}>Selesai Bekerja</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.containerHori2}>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.Start_Break,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
              <Text style={styles.textLogo}>Mulai Istirahat</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.End_Break,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
              <Text style={styles.textLogo}>Selesai Istirahat</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.containerStatus}>
            {displayWorkBreakStatus()}
          </View>
        </View >
      );
    }
    else {
      return (
        <View style={styles.container}>
          <View style={styles.containerStatus}>
          </View>

          <View style={styles.containerHori}>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.Start_Work,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
              <Text style={styles.textLogo}>Mulai Bekerja</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Pressable onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.End_Work,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-stopwork.png')} />
              <Text style={styles.textLogo}>Selesai Bekerja</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.containerHori2}>
            <View style={{ paddingHorizontal: 20 }}>
              <Pressable disabled={true} onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.Start_Break,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-startbreak.png')} />
              <Text style={styles.textLogo}>Mulai Istirahat</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Pressable onPress={() => navigation.navigate('Scanner', {
                idParam: idParam, scanEnumParam: ScanEnum.End_Break,
                workStatusParam: workStatus, breakStatusParam: breakStatus
              })} style={styles.press}>
                <Image style={styles.logo} source={require('./../images/logo-startwork.png')} />
              <Text style={styles.textLogo}>Selesai Istirahat</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.containerStatus}>
            {displayWorkBreakStatus()}
          </View>
        </View >
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212"
  },
  containerHori: {
    flex: 7,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  containerHori2: {
    flex: 7,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 20,
  },
  containerStatus: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    flex: 1,
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
    fontSize: 24,
    color: 'white',
  },
  textLogo: {
    fontSize: 16,
    color: 'white',
  },
  logo: {
    width: 150,
    height: 150,
  },
  press: {
    alignItems: "center",
  }
});

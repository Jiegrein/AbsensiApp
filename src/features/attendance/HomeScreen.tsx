import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../../app/routes';
import { ScanEnum, WorkStatus } from './types';

type Props = NativeStackScreenProps<StackParamList, 'Home'>;

interface Action {
  scan: ScanEnum;
  label: string;
  image: ImageSourcePropType;
  enabled: (status: WorkStatus) => boolean;
}

// Rendered two per row, in this order.
const ACTIONS: Action[] = [
  { scan: ScanEnum.Start_Work, label: 'Mulai Bekerja', image: require('../../images/logo-startwork.png'), enabled: (s) => !s.workStatus },
  { scan: ScanEnum.End_Work, label: 'Selesai Bekerja', image: require('../../images/logo-stopwork.png'), enabled: (s) => s.workStatus && !s.breakStatus },
  { scan: ScanEnum.Start_Break, label: 'Mulai Istirahat', image: require('../../images/logo-startbreak.png'), enabled: (s) => s.workStatus && !s.breakStatus },
  { scan: ScanEnum.End_Break, label: 'Selesai Istirahat', image: require('../../images/logo-stopbreak.png'), enabled: (s) => s.workStatus && s.breakStatus },
];

const statusLabel = ({ workStatus, breakStatus }: WorkStatus): string => {
  if (breakStatus) return 'Sedang Istirahat';
  return workStatus ? 'Sedang Bekerja' : 'Tidak Bekerja';
};

export default function HomeScreen({ route, navigation }: Props) {
  const { idParam, workStatusParam, breakStatusParam } = route.params;
  const status: WorkStatus = { workStatus: workStatusParam, breakStatus: breakStatusParam };

  const openScanner = (scan: ScanEnum) =>
    navigation.navigate('Scanner', { idParam, scanEnumParam: scan, workStatusParam, breakStatusParam });

  const renderAction = (action: Action) => (
    <View key={action.scan} style={styles.actionSlot}>
      <Pressable disabled={!action.enabled(status)} onPress={() => openScanner(action.scan)} style={styles.press}>
        <Image style={styles.logo} source={action.image} />
        <Text style={styles.textLogo}>{action.label}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.containerStatus} />
      <View style={styles.containerHori}>{ACTIONS.slice(0, 2).map(renderAction)}</View>
      <View style={styles.containerHori2}>{ACTIONS.slice(2).map(renderAction)}</View>
      <View style={styles.containerStatus}>
        <Text style={styles.text}>{statusLabel(status)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionSlot: {
    paddingHorizontal: 20,
  },
  press: {
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
});

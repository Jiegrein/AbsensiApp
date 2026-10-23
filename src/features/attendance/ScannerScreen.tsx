import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { BarcodeScanningResult, Camera, CameraView, PermissionStatus } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../../app/routes';
import { performScan } from './scan';
import { WorkStatus } from './types';

type Props = NativeStackScreenProps<StackParamList, 'Scanner'>;

export default function ScannerScreen({ route, navigation }: Props) {
  const { idParam, scanEnumParam, workStatusParam, breakStatusParam } = route.params;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused();

  const goHome = (status: WorkStatus) =>
    navigation.navigate('Home', { idParam, workStatusParam: status.workStatus, breakStatusParam: status.breakStatus });

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    setScanned(true);
    const outcome = await performScan({
      workerId: idParam,
      scanEnum: scanEnumParam,
      scannedProjectId: data,
      current: { workStatus: workStatusParam, breakStatus: breakStatusParam },
    });
    Alert.alert(outcome.alert.title, outcome.alert.message, [
      { text: 'Return', style: 'cancel', onPress: () => goHome(outcome.home) },
    ]);
    if (outcome.immediateHome) goHome(outcome.immediateHome);
  };

  const requestPermission = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    setHasPermission(permission.status === PermissionStatus.GRANTED);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Berikan app akses ke kamera</Text>
        <Button title="Allow Camera" onPress={requestPermission} />
      </View>
    );
  }

  if (!hasPermission || !isFocused) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <CameraView style={styles.camera} facing="back" onBarcodeScanned={scanned ? undefined : handleScan} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato',
  },
  camera: {
    height: 500,
    width: 400,
  },
});

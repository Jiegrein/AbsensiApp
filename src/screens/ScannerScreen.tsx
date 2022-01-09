import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableHighlight } from 'react-native';
import { BarCodeScanningResult, Camera, PermissionStatus } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackParamList } from './StackParams';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScanEnum from '../Enum/ScanEnum';
import ScannerService from '../services/ScannerService';
import { format } from "date-fns";

type Props = NativeStackScreenProps<StackParamList, 'Scanner'>;

export default function ScannerScreen({ route, navigation }: Props) {
    const { idParam, scanEnumParam, workStatusParam, breakStatusParam } = route.params;

    const [hasPermission, setHasPermission] = useState(Boolean);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [scanned, setScanned] = useState(false);

    const isFocused = useIsFocused();

    // Store projectId 
    const getStorageKey = () => {
        var date = new Date();
        var formatedDate = format(date, "yyyyMMdd");
        return formatedDate;
    }

    // Store Log Id for today
    const storeLogId = async (logId: string) => {
        const key = getStorageKey();
        try {
            await AsyncStorage.setItem(key, logId)
        } catch (e) {
            // saving error
        }
    }
    // Get Log Id for today
    const getLogId = async () => {
        const key = getStorageKey();
        try {
            const value = await AsyncStorage.getItem(key)
            if (value !== null) {
                return value;
            }
        } catch (e) {
            return '';
        }
        return '';
    }

    // What happens when we scan the bar code and decide which one runs
    const handleBarCodeScanned = async (result: BarCodeScanningResult) => {
        setScanned(true);

        const model: LogModel = {
            workerId: idParam,
            projectId: result.data,
            scanEnumId: scanEnumParam
        };

        if (scanEnumParam === ScanEnum.Start_Work) {
            handleStartWorkingScan(model)
            navigation.navigate('Home', { idParam: idParam, workStatusParam: true, breakStatusParam: false });
        }
        else {
            setScanned(true);
            let logId = await getLogId();
            if (logId === '') {
                // Shouldn't be needed, but just in case
                Alert.alert('Belum mulai kerja', 'Scan mulai kerja terlebih dahulu',
                    [
                        {
                            text: "Return",
                            onPress: () => navigation.navigate('Home', { idParam: idParam, workStatusParam: false, breakStatusParam: breakStatusParam }),
                            style: "cancel"
                        }
                    ])
            }
            else {
                let response = await handleUpdateScan(logId, model);
                if (response) {
                    if (scanEnumParam === ScanEnum.Start_Break) {
                        navigation.navigate('Home', { idParam: idParam, workStatusParam: true, breakStatusParam: true });
                    }
                    else if (scanEnumParam === ScanEnum.End_Break) {
                        navigation.navigate('Home', { idParam: idParam, workStatusParam: true, breakStatusParam: false });
                    }
                    else {
                        navigation.navigate('Home', { idParam: idParam, workStatusParam: false, breakStatusParam: false });
                    }
                }
                else {
                    Alert.alert('Error', 'Lapor ke bos',
                        [
                            {
                                text: "Return",
                                onPress: () => navigation.navigate('Home', { idParam: idParam, workStatusParam: workStatusParam, breakStatusParam: breakStatusParam }),
                                style: "cancel"
                            }
                        ])
                }
            }
        }
    };

    // What when scan button is pressed
    const handleStartWorkingScan = async (model: LogModel) => {
        let logId = await ScannerService.createLogId(model);
        storeLogId(logId);
    };
    // Handle button other than Start_Work
    const handleUpdateScan = async (logId: string, model: LogModel) => {
        return await ScannerService.updateLogId(logId, model);
    };

    const askForCameraPermission = () => {
        (async () => {
            const permission = await Camera.requestCameraPermissionsAsync();
            setHasPermission(permission.status === PermissionStatus.GRANTED);
        })()
    }

    useEffect(() => {
        (async () => {
            askForCameraPermission();
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
            </View>
        );
    }

    if (isFocused) {
        return (
            <View style={styles.container}>
                <View style={styles.barcodebox}>
                    <Camera style={{ height: 500, width: 400 }} type={type} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
                    </Camera>
                </View>
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
        backgroundColor: '#121212',
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

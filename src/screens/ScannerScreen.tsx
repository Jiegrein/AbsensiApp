import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableHighlight } from 'react-native';
import { BarCodeScanningResult, Camera, PermissionStatus } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { StackParamList } from './StackParams';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScanEnum from '../Enum/ScanEnum';
import ScannerService from '../services/ScannerService';

type Props = NativeStackScreenProps<StackParamList, 'Scanner'>;

export default function ScannerScreen({ route, navigation }: Props) {
    const { idParam, scanEnumParam, workStatusParam, breakStatusParam } = route.params;

    const [hasPermission, setHasPermission] = useState(Boolean);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [scanned, setScanned] = useState(false);

    const isFocused = useIsFocused();

    // Store projectId 
    const getLogKey = () => {
        return 'LogId';
    }
    // Store Log Id for today    
    const storeLogId = async (value: string) => {
        const key = getLogKey();
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            // saving error
        }
    }
    // Get Log Id for today
    const getLogId = async () => {
        const key = getLogKey();
        try {
            const value = await SecureStore.getItemAsync(key);
            if (value !== null) {
                return value;
            }
            else {
                return '';
            }
        } catch (e) {
            return '';
        }
    }

    // Store ProjectId 
    const getProjectKey = () => {
        return 'ProjectId';
    }
    // Store Project Id for today
    const storeProjectId = async (value: string) => {
        const key = getProjectKey();
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            // saving error
        }
    }
    // Get Project Id for today
    const getProjectId = async () => {
        const key = getProjectKey();
        try {
            const value = await SecureStore.getItemAsync(key);
            if (value !== null) {
                return value;
            }
            else {
                return '';
            }
        } catch (e) {
            return '';
        }
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
            let success = await handleStartWorkingScan(model)
            if (success) {
                navigation.navigate('Home', { idParam: idParam, workStatusParam: true, breakStatusParam: false });
            }
            else {
                navigation.navigate('Home', { idParam: idParam, workStatusParam: false, breakStatusParam: false });
            }
        }
        else {
            setScanned(true);
            let storedLogId = await getLogId();
            let storedProjectId = await getProjectId();
            if (storedLogId === '') {
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
                if (storedProjectId !== result.data) {
                    Alert.alert('Error', 'Barcode yang di scan beda dengan yang pas mulai kerja',
                        [
                            {
                                text: "Return",
                                onPress: () => navigation.navigate('Home', { idParam: idParam, workStatusParam: workStatusParam, breakStatusParam: breakStatusParam }),
                                style: "cancel"
                            }
                        ])
                }
                else {
                    let response = await handleUpdateScan(storedLogId, model);
                    console.log("Cek res : ");
                    console.log(response);
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
                        // Shouldn't be needed, but just in case
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
        }
    };

    // What when scan button is pressed
    const handleStartWorkingScan = async (model: LogModel) => {
        let response = await ScannerService.createLogId(model);
        if (response.logId == '' || response.projectId == '' || response.message != '') {
            Alert.alert('Error', response.message,
                [
                    {
                        text: "Return",
                        onPress: () => navigation.navigate('Home', { idParam: idParam, workStatusParam: workStatusParam, breakStatusParam: breakStatusParam }),
                        style: "cancel"
                    }
                ])
            return false;
        }
        else {
            storeLogId(response.logId);
            storeProjectId(response.projectId);
            return true;
        }
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

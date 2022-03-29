import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Pressable } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import uuid from 'react-native-uuid';
import RegisterService from '../services/RegisterService';

// Used to navigate between pages https://benjaminwoojang.medium.com/react-navigation-with-typescript-270dfa8d5cad
import { useNavigation } from '@react-navigation/native';
import { StackParamList } from './StackParams';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TextInput } from 'react-native-gesture-handler';

type registerScreenProp = NativeStackNavigationProp<StackParamList, 'Register'>;

export default function RegisterScreen() {
    const [guid, setGuid] = useState('');
    const [needRegister, setNeedRegister] = useState(false);

    const [nama, setNama] = useState('');
    const [namaLengkap, setNamaLengkap] = useState('');

    const navigation = useNavigation<registerScreenProp>();

    const [butttonDisable, setButttonDisable] = useState(false);
    
    const getworkerPhoneIdKey = () => {
        return 'workerPhoneId';
    }
    
    const setUserPhoneUuid = async (value: string) => {
        const key = getworkerPhoneIdKey();
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            // saving error
            console.log(e);
        }
    }
    // Get Log Id for today
    const getWorkerPhoneUuid = async () => {
        const key = getworkerPhoneIdKey();
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

    const makeNewUuid = () => {
        (async () => {
            setButttonDisable(true);
            const newId = uuid.v4();

            const model: IRegisterWorkerAccount = {
                id: newId.toString(),
                name: nama,
                fullname: namaLengkap
            };
            let response = await RegisterService.postWorkerId(model);

            if (response) {
                setGuid(newId.toString())
                // store uuid yg di generate di Secure Storage buat simpen validasi next time
                setUserPhoneUuid(newId.toString());
            }
        })()
    }

    useEffect(() => {
        (async () => {
            // Get WorkerPhoneId stored in AsyncStorage
            const phoneId = await getWorkerPhoneUuid();

            if (phoneId !== '') {
                setNeedRegister(false);
                // Get IRegisterWorkerAccount by phoneId stored in Database
                let model = await RegisterService.getWorkerPhoneId(phoneId);

                if (model.id === '') {
                    setNeedRegister(false);
                }

                if (needRegister === false && phoneId === model.id) {
                    navigation.replace('Home', {
                        idParam: model.id,
                        workStatusParam: model.workStatus,
                        breakStatusParam: model.breakStatus
                    });
                }
                else {
                    setGuid(phoneId);
                }
            }
            else {
                setNeedRegister(true);
            }
        })();
    }, [makeNewUuid]);

    if (needRegister === false && guid === '') {
        return (
            <View style={styles.container}>
            </View>
        );
    }
    else {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Silahkan daftar terlebih dahulu</Text>

                <TextInput  style={styles.textInput}
                            placeholder='Nama'
                            value={nama}
                            onChangeText={setNama}></TextInput>

                <TextInput  style={styles.textInput}
                            placeholder='Nama Lengkap'
                            value={namaLengkap}
                            onChangeText={setNamaLengkap}></TextInput>

                <Pressable disabled={butttonDisable} style={styles.button} onPressIn={makeNewUuid}>
                    <Text style={styles.text}>Daftar</Text>
                </Pressable>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        color: '#fff',
        margin: 12
    },
    textInput: {
        color: '#fff',
        backgroundColor: '#5d5e63',
        alignSelf: 'stretch',
        marginHorizontal: 35,
        height: 40,
        padding: 12,
        margin: 10
    },
    button: {
        backgroundColor: '#3399FF',
        alignSelf: 'stretch',
        alignItems: 'center',
        marginHorizontal: 35,
        borderRadius: 10,
        margin: 12
    }
});

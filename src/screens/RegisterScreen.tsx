import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import RegisterService from '../services/RegisterService';

// Used to navigate between pages https://benjaminwoojang.medium.com/react-navigation-with-typescript-270dfa8d5cad
import { useNavigation } from '@react-navigation/native';
import { StackParamList } from './StackParams';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type registerScreenProp = NativeStackNavigationProp<StackParamList, 'Register'>;

export default function RegisterScreen() {
    const [guid, setGuid] = useState('');
    const [needRegister, setNeedRegister] = useState(false);

    const navigation = useNavigation<registerScreenProp>();

    // Store inital login
    const storeUserPhoneGuid = async (value: string) => {
        try {
            await AsyncStorage.setItem('workerPhoneId', value);
            //Store uuid ke db sekalian create data di table user
        } catch (e) {
            // saving error
            console.log(e);
        }
    }

    // Get inital login
    const getWorkerPhoneUuid = async () => {
        try {
            const value = await AsyncStorage.getItem('workerPhoneId');
            if (value !== null) {
                return value
            }
            else {
                return ''
            }
        } catch (e) {
            // error reading value
            return '';
        }
    }

    const makeNewUuid = () => {
        (async () => {
            const newId = uuid.v4();
            // store uuid yg di generate di Async Storage buat simpen validasi next time
            storeUserPhoneGuid(newId.toString());

            const model: IRegisterWorkerAccount = {
                id: newId.toString(),
                name: 'Yanto',
                fullname: 'Heriyanto'
            };
            let response = await RegisterService.postWorkerId(model);

            if(response){
                setGuid(newId.toString())
            }
        })()
    }

    useEffect(() => {
        (async () => {
            // Get WorkerPhoneId stored in AsyncStorage
            const phoneId = await getWorkerPhoneUuid();
            
            if(phoneId !== ''){
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
                else{
                    setGuid(phoneId);
                }
            }
            else{
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
                <Text>Name ui</Text>
                <Button title={'Register'} onPress={() => makeNewUuid()} />
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
    }
});

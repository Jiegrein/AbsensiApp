import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

// Used to navigate between pages https://benjaminwoojang.medium.com/react-navigation-with-typescript-270dfa8d5cad
import { useNavigation } from '@react-navigation/native';
import { RootDrawerParamList } from '../screens/RootDrawerParams';
import { DrawerNavigationProp } from "@react-navigation/drawer";
import ScanBarCodeService from '../services/ScanBarCodeService';
import RegisterService from '../services/RegisterService';
type registerScreenProp = DrawerNavigationProp<RootDrawerParamList, 'Register'>;

export default function RegisterScreen() {
    const [guid, setGuid] = useState('');
    const [needRegister, setNeedRegister] = useState(true);

    const navigation = useNavigation<registerScreenProp>();

    // Store inital login
    const storeUserPhoneGuid = async (value: string) => {
        try {
            await AsyncStorage.setItem('workerPhoneId', value);
            //Store uuid ke db sekalian create data di table user
        } catch (e) {
            // saving error
        }
    }

    // Get inital login
    const getWorkerPhoneUuid = async () => {
        try {
            const value = await AsyncStorage.getItem('workerPhoneId')
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
            console.log("Created GUID: " + newId);

            // store uuid yg di generate di Async Storage buat simpen validasi next time
            storeUserPhoneGuid(newId.toString());

            const model: IRegisterWorkerAccount = {
                guid: newId.toString(),
                name: 'Yanto',
                fullname: 'Heriyanto'
            };
            var response = await RegisterService.postWorkerId(model);
            
            if(response){
                setGuid(newId.toString())
            }
        })()
    }

    useEffect(() => {
        (async () => {
            console.log("use effect register");

            // Get WorkerPhoneId stored in AsyncStorage
            const phoneId = await getWorkerPhoneUuid();
            
            if(phoneId !== ''){
                // Get WorkerPhoneId stored in Database
                let apiWorkerPhoneId = await RegisterService.getWorkerPhoneId(phoneId);

                if (apiWorkerPhoneId != '') {
                    setNeedRegister(false);
                }

                if (needRegister === false && phoneId === apiWorkerPhoneId) {
                    navigation.navigate('Home');
                }
                else{
                    setGuid(phoneId);
                }
            }            
        })();
    }, [makeNewUuid]);

    if (needRegister === true && guid === '') {
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

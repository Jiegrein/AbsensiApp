import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

// Used to navigate between pages https://benjaminwoojang.medium.com/react-navigation-with-typescript-270dfa8d5cad
import { useNavigation } from '@react-navigation/native';
import { RootDrawerParamList } from '../screens/RootDrawerParams';
import { DrawerNavigationProp } from "@react-navigation/drawer";
type registerScreenProp = DrawerNavigationProp<RootDrawerParamList, 'Register'>;

export default function RegisterScreen() {
    const [hasUuid, setHasUuid] = useState('');
    const [needRegister, setNeedRegister] = useState(true);

    const navigation = useNavigation<registerScreenProp>();

    // Store inital login
    const storeUserPhoneUuid = async (value: string) => {
        try {
            await AsyncStorage.setItem('userPhoneId', value);
            //Store uuid ke db sekalian create data di table user
        } catch (e) {
            // saving error
        }
    }

    // Get inital login
    const getUserPhoneUuid = async () => {
        try {
            const value = await AsyncStorage.getItem('userPhoneId')
            if (value !== null) {
                return value
            }
            else {
                return 'notFound'
            }
        } catch (e) {
            // error reading value
            return 'notFound';
        }
    }

    const makeNewUuid = () => {
        (async () => {
            const newId = uuid.v4();
            console.log("Created UUID: " + newId);
            // store uuid yg di generate buat simpen validasi next time
            storeUserPhoneUuid(newId.toString())
            //api create user disini
            setHasUuid(newId.toString())
        })()
    }

    useEffect(() => {
        (async () => {
            console.log("use effect register");
            const phoneId = await getUserPhoneUuid();

            // Send uuid in phone storage and get API
            let apiReturn = '';
            apiReturn = phoneId; //simulasi balikan API

            //if api return somehting set needRegister to true set hasUuid = apiReturn
            if (apiReturn != '') {
                setNeedRegister(false);
            }

            if (needRegister === false && phoneId === apiReturn) {
                navigation.navigate('Home');
            }
            else{
                setHasUuid(phoneId);
            }
        })();
    }, [makeNewUuid]);

    if (needRegister === true && hasUuid === '') {
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

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

    const makeNewUuid = () => {
        (async () => {
            const newId = uuid.v4();
            console.log("Created UUID: " + newId);
            storeUserPhoneUuid(newId.toString())
            setHasUuid(newId.toString())
        })()
    }

    useEffect(() => {
        (async () => {
            // Get API terus isi ke hasUuid
        })();
    }, []);

    if (hasUuid === '') {
        return (
            <View style={styles.container}>
                <Text>Name ui</Text>
                <Button title={'Register'} onPress={() => makeNewUuid()} />
            </View>
        );
    }
    return(        
        <View style={styles.container}>
            <Text>Pindah</Text>
            <Button title={'Enter'} onPress={() => navigation.navigate('Home')} />
        </View>
    )
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

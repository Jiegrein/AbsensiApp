import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import uuid from 'react-native-uuid';
import { StackParamList } from '../../app/routes';
import { readStored, StorageKey, writeStored } from '../../shared/storage';
import { registerApi } from './registerApi';
import { Worker } from './types';

type Navigation = NativeStackNavigationProp<StackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Navigation>();
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openHome = (worker: Worker) =>
    navigation.replace('Home', { idParam: worker.id, workStatusParam: worker.workStatus, breakStatusParam: worker.breakStatus });

  /** A phone that registered before goes straight to Home; anything else shows the form. */
  const resumeSession = async () => {
    const storedId = await readStored(StorageKey.workerId);
    if (storedId === '') {
      setShowForm(true);
      return;
    }
    const worker = await registerApi.getWorker(storedId);
    if (worker.id === storedId) {
      openHome(worker);
    } else {
      setShowForm(true);
    }
  };

  // The button stays disabled after a failed attempt; re-enabling it is a separate, deliberate change.
  const register = async () => {
    setSubmitting(true);
    const id = uuid.v4().toString();
    const created = await registerApi.createWorker({ id, name: nama, fullname: namaLengkap });
    if (created) {
      await writeStored(StorageKey.workerId, id);
      await resumeSession();
    }
  };

  useEffect(() => {
    resumeSession();
  }, []);

  if (!showForm) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Silahkan daftar terlebih dahulu</Text>
      <TextInput style={styles.textInput} placeholder="Nama" value={nama} onChangeText={setNama} />
      <TextInput style={styles.textInput} placeholder="Nama Lengkap" value={namaLengkap} onChangeText={setNamaLengkap} />
      <Pressable disabled={submitting} style={styles.button} onPressIn={register}>
        <Text style={styles.text}>Daftar</Text>
      </Pressable>
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
  text: {
    color: '#fff',
    margin: 12,
  },
  textInput: {
    color: '#fff',
    backgroundColor: '#5d5e63',
    alignSelf: 'stretch',
    marginHorizontal: 35,
    height: 40,
    padding: 12,
    margin: 10,
  },
  button: {
    backgroundColor: '#3399FF',
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: 35,
    borderRadius: 10,
    margin: 12,
  },
});

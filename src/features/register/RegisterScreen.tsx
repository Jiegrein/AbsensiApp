import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [phone, setPhone] = useState('');
  const [fullname, setFullname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openHome = (worker: Worker) =>
    navigation.replace('Home', { idParam: worker.id, workStatusParam: worker.workStatus, breakStatusParam: worker.breakStatus });

  /**
   * A phone that registered before has an id and a token stored and goes straight to Home.
   * Anything else, including a token the backend no longer accepts, shows the form; registering
   * again with the same phone number returns the same worker with a fresh token.
   */
  const resumeSession = async () => {
    const storedId = await readStored(StorageKey.workerId);
    const storedToken = await readStored(StorageKey.token);
    if (storedId === '' || storedToken === '') {
      setShowForm(true);
      return;
    }
    try {
      const worker = await registerApi.getWorker(storedId);
      if (worker?.id === storedId) {
        openHome(worker);
        return;
      }
    } catch {
      // fall through to the form
    }
    setShowForm(true);
  };

  const register = async () => {
    setSubmitting(true);
    setError('');
    const registered = await registerApi.createWorker({ id: uuid.v4().toString(), fullname, phone });
    if (!registered) {
      setError('Pendaftaran gagal. Periksa nomor HP dan koneksi, lalu coba lagi.');
      setSubmitting(false);
      return;
    }
    await writeStored(StorageKey.workerId, registered.id);
    await writeStored(StorageKey.token, registered.token);
    openHome(registered);
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
      <TextInput
        style={styles.textInput}
        placeholder="Nomor HP"
        placeholderTextColor="#b9b3a7"
        keyboardType="number-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Nama Lengkap"
        placeholderTextColor="#b9b3a7"
        value={fullname}
        onChangeText={setFullname}
      />
      <Pressable disabled={submitting} style={styles.button} onPress={register}>
        <Text style={styles.text}>Daftar</Text>
      </Pressable>
      {error !== '' && <Text style={styles.error}>{error}</Text>}
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
  error: {
    color: '#e08b80',
    marginHorizontal: 35,
    textAlign: 'center',
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

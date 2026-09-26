import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorText, Field, PrimaryButton, Screen, Subtitle, Title } from '../../components/ui';
import { useApp } from '../../context/AppProvider';
import { space } from '../../theme';

export default function AddStaffScreen() {
  const router = useRouter();
  const { session, addStaff } = useApp();
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!session || session.role !== 'admin') {
    return <Redirect href="/" />;
  }

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const created = await addStaff(name, employeeId);
      Alert.alert(
        'Staff added',
        `Share these login details:\n\nUsername: ${created.username}\nPassword: ${created.password}`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Add staff</Title>
        <Subtitle>Name and employee ID only. A staff login is created on this phone automatically.</Subtitle>
      </View>
      <View style={styles.form}>
        <Field
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Priya Shah"
          autoCapitalize="words"
        />
        <Field
          label="Employee ID"
          value={employeeId}
          onChangeText={setEmployeeId}
          placeholder="EMP014"
        />
        <ErrorText message={error} />
        <PrimaryButton title="Save staff" onPress={() => void onSubmit()} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: space.sm,
    marginBottom: space.lg,
  },
  form: {
    gap: space.md,
  },
});

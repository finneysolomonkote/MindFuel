import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateProfile } from '../../store/slices/profileSlice';
import { ProfileStackParamList } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.profile);
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({ name, phone })).unwrap();
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarContainer}>
        <Avatar uri={profile?.avatar} name={name} size={100} />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </View>

      <Input
        label="Full Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone"
        keyboardType="phone-pad"
      />

      <Input
        label="Email"
        value={profile?.email || ''}
        editable={false}
        placeholder="Email cannot be changed"
      />

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={loading}
        style={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
  },
});

export default EditProfileScreen;

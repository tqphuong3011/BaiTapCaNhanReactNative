import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfile = () => {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailChange, setIsEmailChange] = useState(false);

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Upload ảnh lên Cloudinary
      const formData = new FormData();
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      formData.append('file', blob, 'profile-image.jpg');
      formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // Thay thế bằng upload preset của bạn

      try {
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', // Thay thế bằng cloud name của bạn
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        setUserData({ ...userData, avatar: data.secure_url });
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  // Hàm gửi OTP
  const sendOTP = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          type: isEmailChange ? 'email' : 'phone',
        }),
      });
      
      if (response.ok) {
        setShowOtpInput(true);
        Alert.alert('Success', 'OTP has been sent to your email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  // Hàm xác thực OTP
  const verifyOTP = async () => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          otp: otp,
          type: isEmailChange ? 'email' : 'phone',
        }),
      });

      if (response.ok) {
        if (isEmailChange) {
          setUserData({ ...userData, email: newEmail });
        } else {
          setUserData({ ...userData, phone: newPhone });
        }
        setShowOtpInput(false);
        setOtp('');
        Alert.alert('Success', 'Verification successful');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        <Image
          source={
            userData.avatar
              ? { uri: userData.avatar }
              : require('@/assets/images/default-avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={userData.fullName}
          onChangeText={(text) => setUserData({ ...userData, fullName: text })}
        />

        <Text style={styles.label}>Email</Text>
        <View style={styles.rowContainer}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder={userData.email}
          />
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => {
              setIsEmailChange(true);
              sendOTP();
            }}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Phone</Text>
        <View style={styles.rowContainer}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newPhone}
            onChangeText={setNewPhone}
            placeholder={userData.phone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => {
              setIsEmailChange(false);
              sendOTP();
            }}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        </View>

        {showOtpInput && (
          <View>
            <Text style={styles.label}>Enter OTP</Text>
            <View style={styles.rowContainer}>
              <TextInput
                style={[styles.input, styles.flex1]}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={verifyOTP}
              >
                <Text style={styles.verifyButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoText: {
    marginTop: 10,
    color: '#007AFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  flex1: {
    flex: 1,
    marginRight: 10,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: 80,
  },
  verifyButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile; 
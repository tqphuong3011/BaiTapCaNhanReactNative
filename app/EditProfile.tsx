import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const EditProfile = () => {
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    image: '',
  });

  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailChange, setIsEmailChange] = useState(false);

  // Thêm hàm fetchUserData
  const fetchUserData = async () => {
    try {
      
      // const userId = await AsyncStorage.getItem('userId');
      const userId = '67abac81f54e8b95ba411049';
      
      const response = await axios.get(`http://localhost:3000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });

      const user = response.data;
      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      });
      
      // // Cập nhật giá trị mặc định cho email và phone mới
      // setNewEmail(user.email);
      // setNewPhone(user.phone);
    } catch (err) {
      Alert.alert('Error:', err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Hàm gửi OTP
  const sendOTP = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        'YOUR_API_ENDPOINT/send-otp',
        {
          email: newEmail,
          type: isEmailChange ? 'email' : 'phone',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
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
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        'YOUR_API_ENDPOINT/verify-otp',
        {
          email: newEmail,
          otp: otp,
          type: isEmailChange ? 'email' : 'phone',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
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

  // Hàm upload ảnh
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const formData = new FormData();
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        formData.append('file', blob, 'profile-image.jpg');
        formData.append('upload_preset', 'YOUR_UPLOAD_PRESET');
        
        // const cloudinaryResponse = await axios.post(
        //   'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
        //   formData,
        //   {
        //     headers: {
        //       'Content-Type': 'multipart/form-data',
        //     },
        //   }
        // );
        
        // setUserData({ ...userData, image: cloudinaryResponse.data.secure_url });
        
        // console.log(response,"\n",blob,"\n",formData,"\n",cloudinaryResponse.data.secure_url)
        console.log(response,"\n",blob,"\n",formData)

        // Cập nhật avatar lên server của bạn
        const updateUser = userData;
        await axios.patch(
          `http://localhost:3000/users/67abac81f54e8b95ba411049`,updateUser);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        <Image
          source={
            userData.image
              ? { uri: userData.image }
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
          value={userData.name}
          onChangeText={(text) => setUserData({ ...userData, name: text })}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditProfile; 
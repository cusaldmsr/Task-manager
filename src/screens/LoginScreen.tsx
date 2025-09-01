import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserLoginRequest, UserRegistrationRequest } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { COLORS, APP_CONFIG } from '../utils/constants';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
    setIsLoggedIn: (val: boolean) => void;
}

const LoginScreen: React.FC<Props> = ({ navigation, setIsLoggedIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = (): boolean => {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (!validateEmail(loginEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateRegistrationForm = (): boolean => {
    if (!regUsername || !regEmail || !regPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (!validateEmail(regEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (regPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (regPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (regUsername.length > APP_CONFIG.MAX_USERNAME_LENGTH) {
      Alert.alert('Error', `Username must be less than ${APP_CONFIG.MAX_USERNAME_LENGTH} characters`);
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const loginData: UserLoginRequest = {
        email: loginEmail,
        password: loginPassword,
      };

      const response = await apiService.login(loginData);
      
      if (response.success && response.data) {
        await storageService.saveUserData(response.data.user);
        if (response.data.token) {
          await storageService.saveUserToken(response.data.token);
        }
        setIsLoggedIn(true);
        Alert.alert('Success', 'Login successful!');
        clearLoginForm();
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegistrationForm()) return;

    setLoading(true);
    try {
      const registerData: UserRegistrationRequest = {
        username: regUsername,
        email: regEmail,
        password: regPassword,
      };

      const response = await apiService.register(registerData);
      
      if (response.success) {
        Alert.alert('Success', 'Registration successful! Please login.');
        setIsLogin(true);
        clearRegistrationForm();
      } else {
        Alert.alert('Registration Failed', response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearLoginForm = () => {
    setLoginEmail('');
    setLoginPassword('');
  };

  const clearRegistrationForm = () => {
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setConfirmPassword('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearLoginForm();
    clearRegistrationForm();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Task Manager</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {isLogin ? (
            // Login Form
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Registration Form
            <>
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={regUsername}
                onChangeText={setRegUsername}
                maxLength={APP_CONFIG.MAX_USERNAME_LENGTH}
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={regEmail}
                onChangeText={setRegEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={APP_CONFIG.MAX_EMAIL_LENGTH}
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
                maxLength={APP_CONFIG.MAX_PASSWORD_LENGTH}
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                maxLength={APP_CONFIG.MAX_PASSWORD_LENGTH}
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton} disabled={loading}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.SECONDARY,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: COLORS.WHITE,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: COLORS.SECONDARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
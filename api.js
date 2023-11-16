/* eslint-disable prettier/prettier */
// api.js
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: BASE_URL,
});

export const setAuthToken = (token) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const isAuthTokenSet = async () => {
  try {
    const authDataJSON = await AsyncStorage.getItem('authData');
    // console.log('authDataJSON:', authDataJSON); // Log the retrieved data for debugging
    const authData = JSON.parse(authDataJSON);
    // console.log('authData:', authData); // Log the parsed data for debugging
    return !!authData && !!authData.token;
  } catch (error) {
    console.error('Error checking token in AsyncStorage:', error);
    return false;
  }
};

export default api;

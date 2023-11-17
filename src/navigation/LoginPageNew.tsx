/* eslint-disable prettier/prettier */
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  SafeAreaView,
  View,
  // Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {BASE_URL} from '@env';
import * as regex from '../constants/regex';
import api, {setAuthToken} from '../../api';
import {Block, Button, Image, Input, Text} from '../components';
import {useTheme} from '../hooks';
import InputField from '../components/inputField';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginContext, {loginSuccess} from '../hooks/LoginContext';
import {StackActions} from '@react-navigation/native';
import {Animated, Easing} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Lottie from 'lottie-react-native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Linking} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const isAndroid = Platform.OS === 'android';
interface IRegistration {
  name: string;
  last_name: string;
  email: string;
  number: string;
  password: string;
}
interface IRegistrationValidation {
  name: boolean;
  last_name: boolean;
  email: boolean;
  number: boolean;
  password: boolean;
}

const LoginScreenNew = ({navigation, route}) => {
  const {country} = route.params;
  console.log(country);
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  //   clientId:"261015350901-bda4mpjomi1u2nnshanmfl8kmjdmnavr.apps.googleusercontent.com",
  //   androidClientId: "261015350901-p80gpfnhi2kfbu93o8dab43ks88c7ji2.apps.googleusercontent.com",
  //   iosClientId: "261015350901-vstjf25m9r7c8ef8k3rqocbtelae949a.apps.googleusercontent.com",
  //   webClientId: "261015350901-vstjf25m9r7c8ef8k3rqocbtelae949a.apps.googleusercontent.com",

  // });
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      expoClientId:
        '261015350901-bda4mpjomi1u2nnshanmfl8kmjdmnavr.apps.googleusercontent.com',
      iosClientId:
        '261015350901-vstjf25m9r7c8ef8k3rqocbtelae949a.apps.googleusercontent.com',
      androidClientId:
        '261015350901-p80gpfnhi2kfbu93o8dab43ks88c7ji2.apps.googleusercontent.com',
      webClientId:
        '261015350901-vstjf25m9r7c8ef8k3rqocbtelae949a.apps.googleusercontent.com',
       
    },
    {
      projectNameForProxy: '@sandeepsanand/sandeep',
      
    },
    
  );
  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    console.log('user', user);
    if (!user) {
      if (response?.type === 'success') {
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log('loaded locally');
    }
  }
  const signUpGoogleHandler = async () => {
    const response = await promptAsync();
    if (response.type === 'success') {
      const {access_token} = response.params;
      console.log('res params ', access_token);
    }
    console.log('test123');
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    getRedirectResult(auth)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem('@user');
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      const user = await response.json();
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };
  // useEffect(() => {
  //   handleEffect();
  // }, [response, token]);

  // const [request ,response , promptAsync] = Google.useAuthRequest({
  //   androidClientId:
  //     '261015350901-p80gpfnhi2kfbu93o8dab43ks88c7ji2.apps.googleusercontent.com',
  //   iosClientId:
  //     '261015350901-vstjf25m9r7c8ef8k3rqocbtelae949a.apps.googleusercontent.com',
  //     scopes: ['profile', 'email'],
  // });
  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: '261015350901-p80gpfnhi2kfbu93o8dab43ks88c7ji2.apps.googleusercontent.com', // Use this property instead of expoClientId
  //   scopes: ['profile', 'email'],
  // });
  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { authentication } = response;
  //     // Handle the authentication response, e.g., call your backend with the token
  //     console.log('Authentication response:', authentication);
  //   }
  // }, [response]);

  // const handleSignIn = async () => {
  //   try {
  //     const result = await promptAsync();
  //     if (result?.type !== 'success') {
  //       // Handle the case where the user cancels or there's an error
  //       Alert.alert('Authentication failed');
  //     }
  //   } catch (error) {
  //     console.error('Error in Google authentication:', error);
  //   }
  // };

  // const signInWithGoogleAsync = async () => {
  //   try {
  //     const result = await Google.logInAsync({
  //       androidClientId: '261015350901-p80gpfnhi2kfbu93o8dab43ks88c7ji2.apps.googleusercontent.com',
  //       iosClientId: '261015350901-vstjf25m9r7c8ef8k3rqocbtelae949a.apps.googleusercontent.com',
  //       scopes: ['profile', 'email'],
  //     });

  //     if (result.type === 'success') {
  //       console.log('Google authentication successful', result.user);
  //       // Handle the successful login, e.g., set user state, navigate to another screen, etc.
  //     } else {
  //       console.log('Google authentication cancelled or failed');
  //     }
  //   } catch (error) {
  //     console.error('Error in Google authentication', error);
  //   }
  // };

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [buttonShow, setButtonShow] = useState(false);
  const [phoneShow, setPhoneShow] = useState(false);
  const [emailShow, setEmailShow] = useState(false);
  const [formShow, setFormShow] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const blockRef = useRef(null);
  const handleWebLink = useCallback((url) => Linking.openURL(url), []);

  // Function to start the animation
  const animateBlock = () => {
    if (blockRef.current) {
      blockRef.current.slideInUp(1000); // Adjust the duration as needed
    }
  };

  // Trigger the animation when the component mounts
  useEffect(() => {
    animateBlock();
  }, []);
  const animationProgress = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 15000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      name: regex.name.test(registration.name),
      last_name: regex.last_name.test(registration.last_name),
      email: regex.email.test(registration.email),
      number: regex.number.test(registration.number),
      password: regex.password.test(registration.password),
    }));
  }, [registration, setIsValid]);

  // console.log(userId, 'userId');

  const handleLogin = async () => {
    try {
      // Make the login request
      const response = await api.post('login', {email, password});
      console.log(response.data, 'data of login');

      if (response.data.success === false) {
        // If the server responds with a failed login message
        const errorMessage = response.data.data.error;
        alert(errorMessage);
        if (response.data.data.user_id) {
          const user_id = response.data.data.user_id;

          setButtonShow(true);
          setUserId(user_id);
        }
      } else {
        const {first_name, id, last_name} = response.data.data;

        // Create an object that combines token and formData
        const authData = {
          token: response.data.data.token,
          formData: {
            first_name,
            customer_id: id,
            last_name,
            // Add other formData properties here
          },
        };
        const customerId = authData.formData.customer_id;
        const formData = authData.formData;
        const token = authData.token;
        // Store the authData object as a JSON string in AsyncStorage
        await AsyncStorage.setItem('authData', JSON.stringify(authData));

        // Use the loginSuccess method from LoginContext
        setAuthToken(authData.token); // Set the token for future requests
        // loginSuccess(customerId, formData, token);
        // You can navigate to another screen or perform other actions here
        // navigation.navigate('Loading', {
        //   formData: authData.formData,
        // });
        navigation.reset({
          index: 0,
          routes: [{name: 'Frstpage', params: {formData: authData.formData}}],
        });
      }
    } catch (error) {
      // Handle login errors here
      console.error('Login Error:', error);
    }
  };
  const handleSignUp = useCallback(() => {
    setIsLoading(true); // Start loading

    axios
      .get(`${BASE_URL}login_personal_customer_account/${phoneNumber}`)
      .then((response) => {
        setIsLoading(false); // Stop loading

        // Handle response from server
        // setCustomerId(response.data.data.customer_id);

        const id = response.data.data.customer_id;
        const formDataCopy = {
          customer_id: id,
          mobile_number: phoneNumber,
        };
        console.log(formDataCopy, 'checking');

        navigation.setParams({formData: formDataCopy});
        navigation.navigate('OtpPage', {
          formData: formDataCopy,
        });
      })
      .catch((error) => {
        setIsLoading(false); // Stop loading
        console.log(error);
        // Handle error from server
        alert(error);
      });
  }, [phoneNumber, navigation]);

  const handleResend = async () => {
    try {
      console.log(userId, 'user iddsdasdasd');

      // Make the login request
      const response = await api.get(`resent_verification_email/${userId}`);
      console.log(response.data);

      if (response.data.success === true) {
        const errorMessage = response.data.message;
        alert(errorMessage);
      }
    } catch (error) {
      // Handle login errors here
      console.error('Login Error:', error);
    }
  };
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const [isValid, setIsValid] = useState<IRegistrationValidation>({
    name: false,
    last_name: false,
    email: false,
    number: false,
    password: false,
  });
  const [registration, setRegistration] = useState<IRegistration>({
    name: '',
    last_name: '',
    email: '',
    number: '',
    password: '',
  });
  console.log(registration);

  const {assets, colors, gradients, sizes} = useTheme();
  const handleChange = useCallback(
    (value) => {
      setRegistration((state) => ({...state, ...value}));
    },
    [setRegistration, registration],
  );
  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      name: regex.name.test(registration.name),
      last_name: regex.last_name.test(registration.last_name),
      email: regex.email.test(registration.email),
      number: regex.number.test(registration.number),
      password: regex.password.test(registration.password),
    }));
  }, [registration, setIsValid]);
  return (
    <Block safe marginTop={sizes.xl} style={{backgroundColor: '#ffff'}}>
      <Block scrollEnabled flex={1}>
        <Block flex={0} height={250}>
          <Image
            source={require('../assets/icons/fitaraise.png')}
            height={300}
            width={300}
            color={'gray'}
            style={{alignSelf: 'center'}}
          />
          {/* <Lottie
            style={
              {
                // position: 'relative'
              }
            }
            marginBottom={sizes.sm}
            source={require('../assets/json/bg.json')}
            progress={animationProgress.current}
          /> */}
        </Block>
        <View style={styles.container}>
          {!userInfo ? (
            <Button
              disabled={!request}
              onPress={() => {
                promptAsync();
              }}>
              <Text>Sign in with Google</Text>
            </Button>
          ) : (
            <View style={styles.card}>
              {userInfo?.picture && (
                <Image source={{uri: userInfo?.picture}} style={styles.image} />
              )}
              <Text style={styles.text}>Email: {userInfo.email}</Text>
              <Text style={styles.text}>
                Verified: {userInfo.verified_email ? 'yes' : 'no'}
              </Text>
              <Text style={styles.text}>Name: {userInfo.name}</Text>
              {/* <Text style={styles.text}>{JSON.stringify(userInfo, null, 2)}</Text> */}
            </View>
          )}
          <Button onPress={async () => await AsyncStorage.removeItem('@user')}>
            <Text>remove</Text>
          </Button>
        </View>

        <Animatable.View
          ref={blockRef}
          animation="slideInUp"
          duration={1000} // Adjust the duration as needed
          style={{
            // marginTop: -sizes.sm,
            borderTopRightRadius: 50,
            borderTopLeftRadius: 50,
            position: 'relative',
            flex: 1,
          }}>
          <Block
            marginTop={-sizes.sm}
            marginLeft={-sizes.sm}
            // color={'lightgreen'}
            style={{
              borderTopRightRadius: 25,
              borderTopLeftRadius: 25,
              zIndex: 10,
              position: 'absolute',
            }}>
            <Block padding={20}>
              {/* <Text center h4 primary bold>
                Welcome Back !
              </Text>
              <Text center secondary semibold size={14}>
                We missed you
              </Text> */}

              {formShow ? (
                <>
                  {phoneShow ? (
                    <>
                      <Block
                        flex={1}
                        paddingTop={30}
                        paddingHorizontal={sizes.sm}
                        style={{position: 'relative'}}>
                        <View style={styles.inputContainer}>
                          <Image
                            source={require('../assets/icons/Message.png')} // Replace with your icon source
                            style={styles.icon}
                          />
                          <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            placeholder="Enter text"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            placeholder="Email"
                          />
                        </View>
                        <View style={styles.inputContainer}>
                          <Image
                            source={require('../assets/icons/lock.png')} // Replace with your icon source
                            style={styles.icon}
                          />
                          <TextInput
                            secureTextEntry={!isPasswordVisible}
                            style={styles.input}
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            placeholder="Password"
                            autoCapitalize="none"
                          />
                          <TouchableOpacity onPress={togglePasswordVisibility}>
                            {isPasswordVisible ? (
                              <Image
                                color={'#ADA4A5'}
                                source={require('../assets/icons/show.png')}
                                style={styles.icon}
                              />
                            ) : (
                              <Image
                                color={'#ADA4A5'}
                                source={require('../assets/icons/hide.png')}
                                style={styles.icon}
                              />
                            )}
                          </TouchableOpacity>
                        </View>

                        <Button
                          gradient={gradients.primary}
                          shadow={!isAndroid}
                          marginVertical={sizes.s}
                          marginHorizontal={sizes.sm}
                          onPress={() => handleLogin()}>
                          <Text bold white style={{color: 'white'}}>
                            Login
                          </Text>
                        </Button>

                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            marginBottom: 30,
                          }}>
                          <Text>Forget password ?</Text>
                          <TouchableOpacity
                            onPress={() =>
                              handleWebLink(
                                'https://admin.fitaraise.com/password/reset',
                              )
                            }>
                            <Text
                              info
                              bold
                              style={{color: 'green', fontWeight: '700'}}>
                              {' '}
                              Reset
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </Block>

                      <Block
                        row
                        flex={0}
                        align="center"
                        justify="center"
                        marginBottom={sizes.sm}
                        marginTop={10}
                        paddingHorizontal={sizes.xxl}>
                        <Block
                          flex={0}
                          height={1}
                          width="50%"
                          end={[1, 0]}
                          start={[0, 1]}
                          // gradient={gradients.divider}
                        />
                        <Text center marginHorizontal={sizes.s}>
                          {/* or */}
                        </Text>
                        <Block
                          flex={0}
                          height={1}
                          width="50%"
                          end={[0, 1]}
                          start={[1, 0]}
                          // gradient={gradients.divider}
                        />
                      </Block>
                      <Block padding={10} margin={10} flex={0} height={100}>
                        <Block row center justify="space-evenly">
                          <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Image
                              source={assets.facebook}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button>
                          <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Image
                              source={assets.apple}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button>
                          <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Image
                              source={assets.google}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button>
                          {/* <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}
                            onPress={() => {
                              setFormShow(true);
                              setPhoneShow(false);
                              setEmailShow(true);
                            }}>
                            <Image
                              source={require('../assets/icons/fone.png')}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button> */}
                        </Block>
                      </Block>
                    </>
                  ) : (
                    <>
                      <Block
                        flex={1}
                        paddingHorizontal={sizes.sm}
                        style={{position: 'relative'}}>
                        <Block paddingTop={77}>
                          <Block row>
                            <Block flex={0} width={65}>
                              <Input disabled placeholder="+91"></Input>
                            </Block>
                            <Block flex={1} marginLeft={10}>
                              <Input
                                marginBottom={sizes.m}
                                // label="Phone Number"
                                placeholder="Enter phone number"
                                keyboardType="numeric"
                                maxLength={10}
                                // onChangeText={(value) => {{setPhoneNumber(value)}}}
                                onChangeText={(value) => {
                                  {
                                    {
                                      {
                                        setPhoneNumber(value);
                                      }
                                    }
                                    handleChange({number: value});
                                  }
                                }}
                                value={phoneNumber}
                                success={Boolean(
                                  registration.number && isValid.number,
                                )}
                                danger={Boolean(
                                  registration.number && !isValid.number,
                                )}
                              />
                            </Block>
                          </Block>
                        </Block>

                        <Button
                          gradient={gradients.primary}
                          shadow={!isAndroid}
                          marginVertical={sizes.s}
                          marginHorizontal={sizes.sm}
                          onPress={() => handleSignUp()}
                          disabled={!isValid.number}>
                          <Text bold white style={{color: 'white'}}>
                            Send otp
                          </Text>
                        </Button>
                      </Block>

                      <Block
                        row
                        flex={0}
                        align="center"
                        justify="center"
                        marginTop={20}
                        marginBottom={sizes.sm}
                        paddingHorizontal={sizes.xxl}>
                        <Block
                          flex={0}
                          height={1}
                          width="50%"
                          end={[1, 0]}
                          start={[0, 1]}
                          gradient={gradients.divider}
                        />
                        <Text center marginHorizontal={sizes.s}>
                          or
                        </Text>
                        <Block
                          flex={0}
                          height={1}
                          width="50%"
                          end={[0, 1]}
                          start={[1, 0]}
                          gradient={gradients.divider}
                        />
                      </Block>
                      <Block padding={10} margin={10} flex={0} height={100}>
                        <Block row center justify="space-evenly">
                          <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Image
                              source={assets.facebook}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button>
                          <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Image
                              source={assets.apple}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button>
                          <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}>
                            <Image
                              source={assets.google}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button>
                          {/* <Button
                            outlined
                            gray
                            shadow={!isAndroid}
                            style={{
                              justifyContent: 'center',
                              alignSelf: 'center',
                            }}
                            onPress={() => {
                              setFormShow(true);
                              setPhoneShow(true);
                              setEmailShow(true);
                            }}>
                            <Image
                              source={require('../assets/icons/mail.png')}
                              height={sizes.m}
                              width={sizes.m}
                              color={colors.icon}
                            />
                          </Button> */}
                        </Block>
                      </Block>
                    </>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginBottom: 30,
                    }}>
                    <Text>New to the app?</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('country')}>
                      <Text
                        primary
                        bold
                        style={{color: 'green', fontWeight: '700'}}>
                        {' '}
                        Register
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {country === 'IN' ? (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setFormShow(true);
                        setPhoneShow(false);
                        setEmailShow(true);
                      }}>
                      <Block
                        card
                        padding={10}
                        margin={10}
                        flex={0}
                        height={100}
                        color={'lightgreen'}
                        marginTop={20}>
                        <Block row height={85} center>
                          <Block
                            flex={0}
                            center
                            width={60}
                            height={60}
                            radius={50}
                            color={'#f0f0f8'}
                            paddingLeft={18}
                            marginTop={10}>
                            <Image
                              color={'green'}
                              width={25}
                              height={25}
                              source={require('../assets/icons/fone.png')}></Image>
                          </Block>
                          <Block flex={1} center>
                            <Block flex={0} center>
                              <Text p semibold center white>
                                Login With Mobile Number
                              </Text>
                              {/* <Text semibold secondary opacity={0.5} paddingTop={5} size={12}>
                    Share to your friends
                  </Text> */}
                            </Block>
                          </Block>
                          <Block flex={0} center paddingRight={10}></Block>
                        </Block>
                      </Block>
                    </TouchableWithoutFeedback>
                  ) : (
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setFormShow(true);
                        setPhoneShow(true);
                        setEmailShow(false);
                      }}>
                      <Block
                        card
                        color={'lightgreen'}
                        padding={10}
                        margin={10}
                        flex={0}
                        height={100}>
                        <Block row height={85} center>
                          <Block
                            flex={0}
                            center
                            width={60}
                            height={60}
                            radius={50}
                            color={'#f0f0f8'}
                            paddingLeft={18}
                            marginTop={10}>
                            <Image
                              color={'green'}
                              width={25}
                              height={25}
                              source={require('../assets/icons/mail.png')}></Image>
                          </Block>
                          <Block flex={1} center>
                            <Block flex={0} center>
                              <Text p semibold center white>
                                Login With Email
                              </Text>
                              {/* <Text semibold secondary opacity={0.5} paddingTop={5} size={12}>
Share to your friends
</Text> */}
                            </Block>
                          </Block>
                          <Block flex={0} center paddingRight={10}></Block>
                        </Block>
                      </Block>
                    </TouchableWithoutFeedback>
                  )}

                  <Block
                    row
                    flex={0}
                    align="center"
                    justify="center"
                    marginTop={sizes.sm}
                    marginBottom={sizes.sm}
                    paddingHorizontal={sizes.xxl}>
                    <Block
                      flex={0}
                      height={1}
                      width="50%"
                      end={[1, 0]}
                      start={[0, 1]}
                      gradient={gradients.divider}
                    />
                    <Text center marginHorizontal={sizes.s}>
                      or
                    </Text>
                    <Block
                      flex={0}
                      height={1}
                      width="50%"
                      end={[0, 1]}
                      start={[1, 0]}
                      gradient={gradients.divider}
                    />
                  </Block>
                  <Block padding={10} margin={10} flex={0} height={100}>
                    <Block row center justify="space-evenly">
                      {/* <Button
                        outlined
                        gray
                        shadow={!isAndroid}
                        style={{justifyContent: 'center', alignSelf: 'center'}}>
                        <Image
                          source={assets.facebook}
                          height={sizes.m}
                          width={sizes.m}
                          color={colors.icon}
                        />
                      </Button> */}
                      {/* <Button
                        outlined
                        gray
                        shadow={!isAndroid}
                        style={{justifyContent: 'center', alignSelf: 'center'}}>
                        <Image
                          source={assets.apple}
                          height={sizes.m}
                          width={sizes.m}
                          color={colors.icon}
                        />
                      </Button> */}
                      {/* <GoogleSigninButton
      style={{ width: 192, height: 48 }}
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={handleGoogleSignIn}
    /> */}
                      <Button
                        outlined
                        gray
                        shadow={!isAndroid}
                        style={{justifyContent: 'center', alignSelf: 'center'}}
                        onPress={signUpGoogleHandler}>
                        <Image
                          source={assets.google}
                          height={sizes.m}
                          width={sizes.m}
                          color={colors.icon}
                        />
                      </Button>
                    </Block>
                  </Block>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginBottom: 30,
                    }}>
                    <Text>New to the app?</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('login', {country})}>
                      <Text
                        primary
                        bold
                        style={{color: 'green', fontWeight: '700'}}>
                        {' '}
                        Register
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Block>
          </Block>
        </Animatable.View>

        {buttonShow && (
          <Button
            gradient={gradients.primary}
            shadow={!isAndroid}
            marginVertical={sizes.s}
            marginHorizontal={sizes.sm}
            onPress={() => handleResend()}>
            <Text bold white style={{color: 'white'}}>
              Resend Link
            </Text>
          </Button>
        )}
      </Block>
    </Block>
  );
};
const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'green',
    borderRadius: 15,
    borderWidth: 0.3,
    padding: 15,
    marginBottom: 10,
    paddingRight: 0,
  },
  icon: {
    width: 20, // Adjust icon width as needed
    height: 20, // Adjust icon height as needed
    marginRight: 10, // Adjust spacing between icon and input field as needed
  },
  input: {
    flex: 1, // Allow input field to expand to fill available space
  },
  ontainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default LoginScreenNew;

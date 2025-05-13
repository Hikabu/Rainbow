import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'



export function useAuth() {
  const router = useRouter()
  const loading = ref(false)
  const errors = ref([])

  const sendOTP = async (username) =>{
    loading.value = true
    errors.value = []

    try {   
      const optData = {username};
      const responseOTP = await axios.post('api/get-otp/', optData,{
          withCredentials: true 
        });
        if (responseOTP.status >= 200 && responseOTP.status < 300) {
          console.log('OTP Response:', responseOTP.data);
        } else {
          console.error('Failed to send OTP:', responseOTP.statusText);
          errors.value.push('Failed to send OTP');
        }
        return true;
    } catch (error) {
      handleError(error)
    }
  }
  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Unauthorized access
        errors.value.push('No such user or invalid credentials.')
        loading.value = false;
        return false;
      } else if (error.response.data?.error) {
        errors.value.push(error.response.data.error)
        loading.value = false;
      } else if (error.response.data?.message) {
        errors.value.push(error.response.data.message)
        loading.value = false;
      } else {
        errors.value.push('An unexpected error occurred. Please try again.')
        loading.value = false;
      }
    } else if (error.request) {
      errors.value.push('No response received from the server.')
      loading.value = false;
      return false;
    } else {
      //other errors
      errors.value.push('An unexpected error occurred. Please try again.')
      loading.value = false;
      return false;
    }
  }
  const checkOTP = async(username, password, otp) => {
    console.log('check OTP');
      try{
        const otpData = { username, otp };
        const responseOtp = await axios.post('/api/verify-otp/', otpData, {
            withCredentials: true,// Include cookies if needed
        });
        console.log('the status of verification is: ', responseOtp.status)
        const tokenData = {username, password };
        if (responseOtp.status >= 200 && responseOtp.status < 300 ) {
            const tokenResponse =  await axios.post('/api/token/', tokenData, {
            withCredentials: true, 
          });
            console.log('the status of token is: ', tokenResponse.status)
          if (tokenResponse.status >= 200 && tokenResponse.status < 300 ){
            console.log('JWT is set');
            router.push('/lobby')
          } 
        } 
      }
      catch (error) {
        console.error('wrong credentials (checking otp):', error);
      }
  }

  const handleOAuthLogin = async() => {

      console.log("OAuth login button clicked!"); 
      // const clientId = import.meta.env.VITE_CLIENT_ID;
      const redirectUri = 'http://localhost:8000/oauth/redirect/';
      const clientId = 'u-s4t2ud-e7591373bcd905efa4e3f14174d8608bd8a3b4ac1d6215f2dbd659f4c388ef87'
      const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public`;
      console.log(authUrl);
      window.location.href = authUrl;
      // const windowFeatures = "left=100,top=100,width=320,height=320";
      // const win = window.open(authUrl, "_blank", windowFeatures);
      // if (!win)
      //   console.log("enable js");
      //   return;
  };
  

  return {
    loading,
    errors,
    sendOTP,
    checkOTP,
    handleOAuthLogin,
  }
}

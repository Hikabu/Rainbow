<template>
  <div class="login">
    <!-- Background Image -->
    <img 
      src="@/pages/LoginPage/components/img/login-bg.png" 
      alt="background" 
      class="login__bg" 
    />
    <!-- Login Form -->
    <form class="login__form" @submit.prevent="handleSubmit">
      <h1 class="login__title">Login</h1>
      <!-- Input Fields -->
      <div class="login__inputs">
        <div class="login__box">
          <input 
            v-model="username" 
            type="username" 
            placeholder="username" 
            required 
            class="login__input" 
          />
          <i class="ri-mail-fill"></i>
        </div>

        <div class="login__box">
          <input 
            v-model="password" 
            type="password" 
            placeholder="Password" 
            required 
            class="login__input" 
          />
          <i class="ri-lock-2-fill"></i>
        </div>
      </div>

      <!-- Error Messages -->
      <div 
        v-if="errors.length" 
        class="bg-red-300 text-white rounded-lg p-6 mb-4"
      >
        <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="login__check">
        <div class="login__check-box">
          <input 
            id="remember-me" 
            v-model="rememberMe" 
            type="checkbox" 
            class="login__check-input" 
          />
          <label for="remember-me" class="login__check-label">Remember me</label>
        </div>
      </div>

      <!-- Buttons -->
      <div id="login__buttons" class="login__buttons">
        <button 
          type="submit" 
          class="login__button" 
          :disabled="loading" 
          @click="handleSubmit"
        >
          {{ loading ? 'Sending...' : 'Send Otp' }}
        </button>

        <!-- OTP Inputs -->
        <div class="otp">
          <input
            v-for="(digitInput, index) in otpLength"
            :key="index"
            v-model="otpArray[index]"
            type="text"
            maxlength="1"
            class="input"
            @keydown="handleEnter(index, $event)"
            @input="handleInput(index, $event)"
            @paste="handlePaste(index, $event)"
          />
        </div>
      </div>

      <!-- Verify OTP Button -->
      <button 
        v-if="isOTPSent" 
        type="button" 
        class="login__verify-otp-button" 
        :disabled="loading" 
        @click="verifyOTP"
      >
        Verify OTP
      </button>

      <!-- OAuth Login Button -->
      <button 
        type="button" 
        class="login__oauth-button" 
        :disabled="loading" 
        @click="handleOAuthLogin"
      >
        Login with 42
      </button>

      <!-- Register Link -->
      <div class="login__register">
        Don't have an account ?
        <router-link to="/register">Register</router-link>
      </div>
    </form>
  </div>
</template>


<script setup>
  
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { useAuth} from '@/pages/LoginPage/components/composables/useAuth'

  const router = useRouter()
  const username = ref('');
  const password = ref('');
  const rememberMe = ref(false)
  const isOTPSent = ref(false);
  const otpLength = ref(6); // Number of OTP digits
  const otpArray = ref(Array(otpLength.value).fill('')); // Array to hold OTP digits

  const { loading, errors,sendOTP, checkOTP,handleOAuthLogin } = useAuth()

//send otp
  const handleSubmit = async() => {
    try {
      console.log("validatig member...");
      console.log("sending OTP");
      loading.value = true;
      const otpSentSuccessfully = await sendOTP(username.value, password.value);
      if (otpSentSuccessfully) {
        isOTPSent.value = true;
        console.log(isOTPSent.value, "isOTPSent");
    } else {
        errors.value.push('Failed to send OTP. Please try again.');
       }
      console.log(isOTPSent.value, "isOTPSent");
    }
    catch (error) {
      console.error("failed ot send otp:", error);
      errors.value.push('Failed to send OTP. Please try again.');
    }
    loading.value = false;
    console.log("Loading state after OTP send:", loading.value);
  };
  const verifyOTP = async() =>{
    try{
      console.log("verifying OTP");
      const otp = otpArray.value.join(''); // make single string
      console.log("Entered OTP:", otp);
      const isVerified = await checkOTP(username.value, password.value, otp);
      if (isVerified){
        console.log("boooomba");
        router.push({ name: 'Game' });
      } else{
        errors.value.push('Invalid OTP. Please try again.');
      }
    } catch (error){
      console.error('OTP verification failed:', error);
      errors.value.push('rukopop')
    }
  };
  const handleInput = (index, event) => {
    const value = event.target.value;

    //only one character is entered
    if (value.length > 1) {
      otpArray.value[index] = value[0];
    } else {
      otpArray.value[index] = value;
    }
    //next input field
    if (value && index < otpLength.value - 1) {
      document.querySelectorAll('.input')[index + 1].focus();
    }
  };
  const handlePaste = (index, event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').trim();

    //populate the OTP fields with the pasted data
    for (let i = 0; i < pastedData.length && i < otpLength.value; i++) {
      otpArray.value[index + i] = pastedData[i];
    }

    //focus on the last populated field
    const lastPopulatedIndex = Math.min(index + pastedData.length, otpLength.value - 1);
    document.querySelectorAll('.input')[lastPopulatedIndex].focus();
  };
  const handleEnter = (index, event) => {
    if (event.key === 'Backspace' && !otpArray.value[index] && index > 0) {
      //move focus to the previous field if Backspace is pressed on an empty field
      otpArray.value[index - 1] = '';
      document.querySelectorAll('.input')[index - 1].focus();
    }
  };
</script>
<style scoped>
  @import "@/pages/LoginPage/components/css/styles.css";

</style>
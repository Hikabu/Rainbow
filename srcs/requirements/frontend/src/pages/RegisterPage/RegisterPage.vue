<template>
  <div class="register">
    <!-- Background Image -->
    <img 
      src="@/pages/RegisterPage/components/img/register-bg.png" 
      alt="background" 
      class="register__bg" 
    />

    <!-- Registration Form -->
    <form class="register__form" @submit.prevent="handleSubmit">
      <h1 class="register__title">Register</h1>

      <!-- Input Fields -->
      <div class="register__inputs">
        <!-- Username Field -->
        <div class="register__box">
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="Full username" 
            required 
            class="register__input"
          />
          <i class="ri-user-fill"></i>
        </div>

        <!-- Email Field -->
        <div class="register__box">
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Email ID" 
            required 
            class="register__input"
          />
          <i class="ri-mail-fill"></i>
        </div>

        <!-- Password Field -->
        <div class="register__box">
          <input 
            v-model="form.password1" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Password" 
            required 
            class="register__input"
          />
          <i 
            class="ri-eye-fill password-toggle" 
            @click="togglePasswordVisibility"
          ></i>
        </div>

        <!-- Confirm Password Field -->
        <div class="register__box">
          <input 
            v-model="form.password2" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Confirm Password" 
            required 
            class="register__input"
          />
          <i 
            class="ri-eye-fill password-toggle" 
            @click="togglePasswordVisibility"
          ></i>
        </div>
      </div>

      <!-- Error Messages -->
      <div 
        v-if="errors.length" 
        class="bg-red-300 text-white rounded-lg p-6 mb-4"
      >
        <p v-for="(error, index) in errors" :key="index">{{ error }}</p>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="register__button">
        Create Account
      </button>

      <!-- Login Link -->
      <div class="register__login">
        Already have an account? 
        <router-link to="/">Login</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
  username: '',
  email: '',
  password1: '',
  password2: ''
});

const errors = ref([]);
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSubmit = async () => {
  errors.value = [];
  
  // to sens one pas
  if (form.value.password1 !== form.value.password2) {
    errors.value.push("Passwords do not match!");
    return;
  }
  // Prepare data for backend
  const registrationData = {
    username: form.value.username,
    email: form.value.email,
    password: form.value.password1
  };
  try {
    const response = await axios.post('/api/signup/', registrationData);
    console.log('Server response:', response.data);
    router.push('/');
  } catch (error) {
    if (error.response?.data) {
      // Convert Django error object to array
      const backendErrors = error.response.data;
      for (const key in backendErrors) {
        backendErrors[key].forEach(err => {
          errors.value.push(`${key}: ${err}`);
        });
      }
    } else {
      errors.value.push("Registration failed. Please try again.");
    }
  }
};
</script>

<style scoped>
@import "@/pages/RegisterPage/components/css/register-styles.css";

</style>







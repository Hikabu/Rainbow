import { ref } from 'vue'
import axios from 'axios'

export const user = ref(null) //global user market

export async function fetchProfile() {
    try{
        const response = await axios.get('api/profiles/me/')
        user.value = response.data;

        user.value.displayName ||= user.value.username ?? user.value.intraLogin
        //put friends to reactivity to updte 
        if (user.value.friends && Array.isArray(user.value.friends)){
            //if every friend is reactive
            user.value.friends = user.value.friends.map(friend => ({...friend}));
        }
        console.log("the value in the store is ", user.value.friends)
        return user.value.displayName
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
} 
import { ref } from 'vue'

export const user = ref(null) //global user market

export async function fetchProfile() {
    try{
        const response = axios.get('api/profile/me')
        user.value = response.data;

        //put friends to reactivity to updte 
        if (user.friends && Array.isArray(user.friends)){
            user.friends = user.friends.map(f => ref(f) )
        }
        user.value.displayName ||= user.value.username ?? user.value.intraLogin

        return user.value.displayName
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
} 
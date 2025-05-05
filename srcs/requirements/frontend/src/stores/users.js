import { isReactive, reactive, isRef, ref } from 'vue'
import axios from 'axios'

export const user = reactive({
    id: null,
    username: '',
    email:  '',
    displayName: '',
    isOnline: false,
    friends: []

})//global user market
export async function fetchProfile() {
    try{
        const response = await axios.get('api/profiles/me/')
        user.id = response.data.id
        user.username = response.data.username
        user.avatar = response.data.avatar
        user.intra_avatar = response.data.intra_avatar
        user.email = response.data.email
        user.displayName ||= response.data.username ?? response.data.intraLogin
        user.intraLogin =  response.data.intraLogin
        // user.displayName = response.data.displayName || response.data.username || response.data.intraLogin
        user.isOnline = response.data.isOnline
        user.friends = response.data.friends?.map(friend =>
            reactive({...friend, isOnline: false })
        ) || []
            console.log("the value in the store is ", user.friends)
            console.log("the value in the store is ", user.isOnline)
            return user.displayName
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
        console.log("Is user reactive?", isReactive(user))
        console.log("Is user.friends[0] reactive?", isReactive(user.friends?.[0]))
    } 
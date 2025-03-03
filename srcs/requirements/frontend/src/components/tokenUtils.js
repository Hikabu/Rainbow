// import 

import VueCookies from 'vue-cookies';
export const setToken = async (token) => {
	VueCookies.set('access_token', token.access)
	VueCookies.set('refresh_token', token.refresh)
};

export const unsetToken = async () => {

	VueCookies.remove('access_token')
	VueCookies.remove('refresh_token')
}

export const getToken = async () => {
	return VueCookies.get('access_token');
}

export const getTokenPayload = () => {
    const token = VueCookies.get('access_token');
    if (!token) return null;

    try {
        const [, payloadBase64] = token.split('.');
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
export const isAuthenticated = () => {
    const payload = getTokenPayload();
    if (!payload) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime; // Check if the token is not expired
  };


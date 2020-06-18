import axios from 'axios';
import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER,
} from './types';

export const registerUser = async (dataToSubmit) => {
    const request = await axios.post(`/api/register`, dataToSubmit)
        .then(response => response.data);
    
    return {
        type: REGISTER_USER,
        payload: request
    }
}

export const loginUser = async (dataToSubmit) => {
    const request = await axios.post(`/api/login`, dataToSubmit)
                .then(response => response.data);

    return {
        type: LOGIN_USER,
        payload: request
    }
}

export const authUser = async () => {
    const request = await axios.get(`/api/auth`)
    .then(response => response.data);

    return {
        type: AUTH_USER,
        payload: request
    }
}

export const auth = async (code) => {
    const request = await axios.post(`/api/auth`, code)
    .then(response => response.data);

    return {
        type: AUTH_USER,
        payload: request
    }
}

export const logoutUser = async () => {
    const request = await axios.get(`/api/logout`)
    .then(response => response.data);

    return {
        type: LOGOUT_USER,
        payload: request
    }
}


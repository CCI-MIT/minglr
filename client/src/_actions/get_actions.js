import axios from 'axios';
import {
    GET_FOLLOWERS,
    GET_FOLLOWINGS,
} from './types';

export const getFollowers = async (data) => {
    const user_id = data.user_id;
    const request = await axios.get(`/api/${user_id}/followers`)
        .then(response => response.data);
    
    return {
        type: GET_FOLLOWERS,
        payload: request
    }
}

export const getFollowings = async (data) => { // followings + rest
    const user_id = data.user_id;
    const request = await axios.get(`/api/${user_id}/followings`)
        .then(response => response.data);
    
    return {
        type: GET_FOLLOWINGS,
        payload: request
    }
}

// export const getRest = async (data) => {
//     const user_id = data.user_id;
//     const request = await axios.get(`/api/${user_id}/rest`)
//         .then(response => response.data);
    
//     return {
//         type: GET_REST,
//         payload: request
//     }
// }

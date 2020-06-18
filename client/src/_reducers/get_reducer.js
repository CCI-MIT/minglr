import {
    GET_FOLLOWERS, 
    GET_FOLLOWINGS, 
    // GET_REST,
} from '../_actions/types';
 

export default function(state={},action){
    switch(action.type){
        case GET_FOLLOWERS:
            return {...state, register: action.payload }
        case GET_FOLLOWINGS:
            return { ...state, loginSucces: action.payload }
        // case GET_REST:
        //     return {...state, userData: action.payload }
        default:
            return state;
    }
}
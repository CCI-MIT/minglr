import { combineReducers } from 'redux';
import user from './user_reducer';
import get from './get_reducer';

const rootReducer = combineReducers({
    user,
    get,
});

export default rootReducer;
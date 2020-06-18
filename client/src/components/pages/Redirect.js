import React, {useEffect} from 'react';
import Cookies from 'js-cookie';

function Redirect(props) {
    useEffect(() => {
        console.log(Cookies.get("w_auth"));
        if (Cookies.get("w_auth")) {
            props.history.push('/home');
            window.location.reload();
        }

    }, [])

    return (
        <div>
            
        </div>
    )
}

export default Redirect

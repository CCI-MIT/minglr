/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import axios from "axios";

function GroupCreator(props) {

    const [clicked, setClicked] = useState(false);
    const [name, setName] = useState("");

    const handleClick = (e) => {
        setClicked(true);
    }

    const onChangeHandler = (e) => {
        setName(e.currentTarget.value);
    }

    const onSubmitHandler = async (e) => {
        await axios.post("/api/create_group", {
            name: name
        }).then(response => {
            console.log(response);
            if (response.data.success) {
                setClicked(false);
                window.location.reload();
            }
            else {
                alert(response.data.message);
            }
        })
    }

    useEffect(() => {
    }, [])

    return (
        <tr className="groupCreator">
            {clicked ?
                <td colSpan="3">
                    <form onSubmit={onSubmitHandler}>
                        <input type="text" placeholder="Group Name" onChange={onChangeHandler}/>
                        <button className="btn" type="submit">Create a Group</button>
                    </form>
                </td>
                :
                <td className="clickable" colSpan="3" onClick={handleClick}> 
                    <strong> + Create New Group </strong>
                </td>
            }
        </tr>
    )
}

export default GroupCreator;



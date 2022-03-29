import React, { useEffect, useState } from 'react';
import axios from "axios";
import {copyTextToClipboard} from "../../utils/copy";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function GroupEditor(props) {
    const [clicked, setClicked] = useState(false);
    //console.log("group.name: " + props.group.name)
    const [name, setName] = useState("");

    const handleClick = (e) => {
        setClicked(true);
        console.log("props.group.name: " + props.group.name)
        setName(props.group.name);
    }
    const handleDeleteClick= async (e) => {
        const resp = window.confirm("Are you sure you want to delete?");
        if(resp){
            await axios.post("/api/mark_group_deleted", {
                _id : props.group._id
            }).then(response => {
                //console.log(response);
                if (response.data.success) {
                    setClicked(false);
                    props.onGroupUpdate();
                }
                else {
                    alert(response.data.message);
                }
            })
        }
    }

    const onChangeHandler = (e) => {
        setName(e.currentTarget.value);
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        await axios.post("/api/update_group", {
            name: name,
            _id : props.group._id
        }).then(response => {
            //console.log(response);
            if (response.data.success) {
                setClicked(false);
                props.onGroupUpdate();
            }
            else {
                alert(response.data.message);
            }
        })
    }

    useEffect(() => {
    }, [])



    const protocol = window.location.protocol;
    const slashes = protocol.concat("//");
    const host = slashes.concat(window.location.hostname);
    const group = props.group;
    //console.log(JSON.stringify(group));

    if (group) {
        const link = "/group/" + group._id;
        return (
            <tr key={group._id}>
                { clicked ?
                    <>
                        <td colSpan="4">
                            <form onSubmit={onSubmitHandler}>
                                <input type="text" value={name} placeholder="Group Name" onChange={onChangeHandler}/>
                                <button className="btn" type="submit">Save Group</button>
                            </form>
                        </td>
                    </>
                    :
                    <>
                        {!group.isDeleted?
                            <>
                                <td>{group.name}</td>
                                <td>
                                    {props.enableEditDelete?
                                        <>
                                            <span className="btn lightgray" onClick={handleClick} alt="Edit"><FontAwesomeIcon title="Edit" icon={faEdit} /></span>
                                            <span className="btn btnDelete" alt="Delete"onClick={handleDeleteClick} ><FontAwesomeIcon title="Delete" icon={faTrash} /></span>
                                        </>
                                        : null}
                                </td>
                                <td>

                                    <div className="btn darkgray" onClick={() => {
                                        copyTextToClipboard((host + link))
                                    }}>Copy Link
                                    </div>
                                </td>
                                <td>
                                    <Link className="btn" to={link} id={`go_to_group_${group._id}`}>Go to this group</Link>
                                </td>
                            </>:(null)}
                    </>

            }</tr>
        )
    }
}

export default GroupEditor;
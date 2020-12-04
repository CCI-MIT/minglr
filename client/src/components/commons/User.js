import React from 'react'

function User(props) {
    const { firstname, lastname, affiliation, image, following, keywords, matched, id } = props.user;
    const kind = props.kind;
    return (
        <div>
            
            <div className="user_image">
                <img src={(image) ? image : require("../../images/default_user.jpeg")} alt={firstname} />
            </div>
            <div className="user_info">
                <strong id={`${kind}_${id}`}>
                    {firstname} {lastname} {props.me ? "(you)" : ""}
                    {matched ? <img className="talking" src={require("../../images/matched.png")} alt="talking" title="talking"/> : ""}
                </strong>
                <span>{affiliation} {keywords ? ` | ${keywords}`: ""}</span>
            </div>
            <span className="badge">{following ? "waiting..." : ""}</span>
        </div>
    )
}

export default User

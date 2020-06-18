import React from 'react';
import axios from 'axios';
import User from "../commons/User";
import Loader from "../commons/Loader";

class Show extends React.Component{
    _isMounted = false;
    
    constructor(props) {
      super(props);
      
      this.state = {
        isLoading: true,
        users: []
      }
    }

    getUserData = async (id) => {
        await axios.get('api/users/' + id)
        .then(response => {
            console.log(response);
            this.setState(prevState => ({
                isLoading: false,
                users: response.data.followers
            }))
        })
    }

    renderUserData = (user) => {
        return (
            <div key={user.id} className="no-hover user">
                <User
                    user={user}
                    me={false}
                />
            </div>
        )
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            const { user } = this.props;
            this.getUserData(user.id);
        }
    }

    render() {
        const { users, isLoading } = this.state;
        const { user, currentUser, handleClose } = this.props;

        const isNoOne = users.length <= 0 ? "No one yet." : "";

        console.log(user);
        return (
            <div className="user_data">
                <div className="show">
                    <div className="user_close" onClick={handleClose}>close X</div>
                    <div className="user_list">
                        <img src={(user.image) ? user.image : require("../../images/default_user.jpeg")} alt={user.firstname} />
                        <h3>{user.firstname} {user.lastname}</h3>
                        <p>{user.affiliation} {user.keywords ? ` | ${user.keywords}`: ""}</p>
                        {isLoading ? <Loader /> :(
                            <div className="show-container">
                                {/* <h4>{user.firstname} is now talking to...</h4> */}
                                <h4>People waiting for {user.firstname}...</h4>
                                {users.map(this.renderUserData)}
                                {user.following ?
                                    <div className="no-hover user me">
                                        <User
                                            user={currentUser}
                                            me={true}
                                        />
                                    </div>
                                    :
                                    isNoOne
                                }
                            </div>
                        )}
                        {user.following ?
                            <div className="btn" onClick={(e) => this.props.unfollow(e, user)}>Stop Waiting</div>
                            :
                            ""
                        }
                    </div>
                </div>
            </div>
    )};
}

export default Show;
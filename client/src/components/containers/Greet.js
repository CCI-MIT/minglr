import React from "react";
import User from "../commons/User";
import Loader from "../commons/Loader";
import axios from 'axios';

class Greet extends React.Component { 
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
          isLoading: true,
          firstname: localStorage.getItem("firstname") || "",
          lastname: localStorage.getItem("lastname") || "",
          userId: localStorage.getItem("id") || "",
          users: [],
        };
    }

    getUsers = async () => {
      await axios.get('/api/greet').then(response => {
          if (response.data.success) {
            const users = response.data.followers
            this.setState(prevState => ({ 
                ...prevState,
                isLoading: false,
                users: users,
            }))
          }
      })
      
    }

    match = (id) => {
        const { clickDisabled } = this.state;
        const { socket } = this.props;

        if (!clickDisabled) {
            socket.emit("match", {
                receiver: id
            });
        }
        
    }

    renderUsers = (user) => {
        return (
            <div key={user.id} onClick={() => this.match(user.id)} className="user">
                <User
                    user={user}
                    />
            </div>
        )
    };

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        this.getUsers();
        const { socket } = this.props;

        if (this._isMounted) {
            socket.on("matchFail", () => {
                alert("Sorry, this user is already talking to someone else.")
            });
            socket.on("greet", data => {
                console.log(data);
                if (data.type === "ADD" && !this.state.users.find(u => u.id === data.user.id)) {
                    const newUser = data.user;

                    this.setState(prevState => ({
                        ...prevState,
                        users: [...prevState.users, newUser],
                    }))
                }
                else if (data.type === "REMOVE") {
                    const newUsers = this.state.users.filter(u => u.id !== data.user_id);
                    if (this.state.users.length > newUsers.length) {
                        this.setState(prevState => ({
                            ...prevState,
                            users: newUsers,
                        }))
                    }
                    else {
                        setTimeout(() => {
                            this.setState(prevState => ({
                                ...prevState,
                                users: prevState.users.filter(u => u.id !== data.user_id),
                            }))
                        }, 2000);
                    }
                }
                else if (data.type === "UPDATE") {
                    const { users } = this.state; 
                    const index = users.findIndex(u => u._id === data._id);
                    if (index >= 0) {
                        const selected = users[index];
                        const nextUsers = [...users];
                        
                        nextUsers[index] = {
                            ...selected,
                            firstname: data.firstname,
                            lastname: data.lastname,
                            affiliation: data.affiliation,
                            keywords: data.keywords,
                        };

                        this.setState(prevState => ({
                            ...prevState,
                            users: nextUsers,
                        }))
                    }
                }
                else if (data.type === "UPDATE_IMAGE") {
                    const { users } = this.state; 
                    const index = users.findIndex(u => u._id === data._id);
                    if (index >= 0) {
                        const selected = users[index];
                        const nextUsers = [...users];
                        
                        nextUsers[index] = {
                            ...selected,
                            image: data.image,
                        };

                        this.setState(prevState => ({
                            ...prevState,
                            users: nextUsers,
                        }))
                    }
                }
            });

        }

    }

    render () {
        const { users, isLoading } = this.state;
        const { clickDisabled } = this.props;
        const greet = clickDisabled ? "greet disabled" : "greet";
        return (
            <div className={greet}>
                <div className="container">
                    {isLoading ? <Loader/> : (
                        <div className="user_list">
                            {clickDisabled ? <div className="disabled"></div> : ""}
                            <h2>People who want to talk to you...</h2>
                            <h4>Click to start a video chat</h4>
                            {
                                users.length <= 0 ? "No one yet.":
                                users.map(this.renderUsers)
                            }
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default Greet;
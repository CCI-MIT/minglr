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
      await axios.get(`/api/greet`).then(response => {
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

        console.log("MATCH CLICKED")
        if (!clickDisabled && window.JitsiMeetExternalAPI) {
            console.log("match emitted");
            socket.emit("match", {
                receiver: id
            }, (response) => {
                console.log(response);
                if (!response.success) {
                    alert(response.message);
                }
            });
        }
        else {
            alert("Please wait for a minute and try again.");
        }
        
    }

    renderUsers = (user) => {
        return (
            <div key={user.id} id={`greet_${user.id}`} onClick={() => this.match(user.id)} className="user">
                <User
                    user={user}
                    kind="greet"
                    />
            </div>
        )
    };

    componentWillUnmount() {
        this._isMounted = false;
    }

    addUser(data) {
        const newUser = data.user;

        this.setState(prevState => ({
            ...prevState,
            users: [...prevState.users, newUser],
        }))
    }

    removeUser(data) {
        const newUsers = this.state.users.filter(u => u.id !== data.user_id);
        // if the user exists in the list, remove immediately
        if (this.state.users.length > newUsers.length) {
            this.setState(prevState => ({
                ...prevState,
                users: newUsers,
            }))
        }
        // wait 2 seconds in case the user is not yet added back in the list
        else {
            setTimeout(() => {
                this.setState(prevState => ({
                    ...prevState,
                    users: prevState.users.filter(u => u.id !== data.user_id),
                }))
            }, 2000);
        }
    }

    updateUser(data) {
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

    updateUserImage(data) {
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

    componentDidMount() {
        this._isMounted = true;
        this.getUsers();
        const { socket } = this.props;

        if (this._isMounted) {
            socket.on("greet", data => {
                console.log(data);
                if (data.type === "ADD" && !this.state.users.find(u => u.id === data.user.id))
                    this.addUser(data)
                else if (data.type === "REMOVE")
                    this.removeUser(data)
                else if (data.type === "UPDATE")
                    this.updateUser(data)
                else if (data.type === "UPDATE_IMAGE")
                    this.updateUserImage(data)
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
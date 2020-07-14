import React from "react";
import axios from 'axios'
import Cookies from 'js-cookie';

import Show from './Show';
import User from "../commons/User";
import Loader from "../commons/Loader";
import Search from "../approach/Search";


class Approach extends React.Component { 
    _isMounted = false;

    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this)
        this.follow = this.follow.bind(this)
        this.unfollow = this.unfollow.bind(this)
        this.state = { 
          isLoading: true,
          users: [],
          currentUser: {
              id: Cookies.get("w_id"), //string
          }, 
          selectedUser: {
              id: -1,
          }
        };
    }

    // create & destroy wait 
    follow = async (e, user) => {
        e.preventDefault();
        const { users } = this.state;

        // set user shown
        this.handleClick(user)

        // create wait
        if (!user.following) {
            
            await axios.post('/api/follow/' + user.id).then(() => {
                const index = users.findIndex(u => u.id === user.id);
                if (index >= 0) {
                    const selected = users[index];
                    const nextUsers = [...users];
        
                    nextUsers[index] = { 
                        ...selected, 
                        following: true,
                    };
    
                    this.setState({
                        isLoading: false,
                        users: nextUsers,
                        selectedUser: nextUsers[index]
                    });
                }
            })
        }
    }

    unfollow = async (e, user) => {
        e.preventDefault();
        const { users } = this.state;

        // destroy wait
        if (user.following) {
            await axios.delete('/api/unfollow/' + user.id).then((res) => {
                if (res.data.success) {
                    const index = users.findIndex(u => u.id === user.id);
                    if (index >= 0) {
                        const selected = users[index];
                        const nextUsers = [...users];
            
                        nextUsers[index] = { 
                            ...selected, 
                            following: false,
                        };

                        this.setState({
                            isLoading: false,
                            users: nextUsers,
                            selectedUser: nextUsers[index],
                        });
                    }
                }
                else {
                    alert(res.data.message)
                }
            });
        }
    }

    // on click
    handleClick = (user) => {
        this.setState(prevState => ({
            users: [...prevState.users],
            isLoading: false,
            selectedUser: user,
        }));
    }

    handleClose = () => {
        this.setState(prevState => ({
            users: [...prevState.users],
            isLoading: false,
            selectedUser: {
                id: -1
            },
        }));
    }

    // get list of users
    getUsers = async () => {
        await axios.get(`/api/approach`).then(response => {
            if (response.data.success) {
                const newFollowings = response.data.followings.map(u => ({...u, following: true}));
                const newUsers = newFollowings.concat(response.data.rest);
        
                this.setState(prevState => ({
                    selectedUser: {...prevState.selectedUser},
                    isLoading: false,
                    users: newUsers,
                }))
            }
        });
    }

    renderUsers = (user) => {
        if (user) {
            const { selectedUser } = this.state;
            const isFollowing = user.following ? "gray" : "";
            const isSelected = (user.id === selectedUser.id) ? "dark" : "";
            const classes = "user " + isFollowing + " " + isSelected;

            return (
                <div key={user.id} onClick={(e) => {this.follow(e, user)}} className={classes}>
                    <User user={user}
                        />
                </div>
            );
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    addUser(data) {
        const { users } = this.state;
        const index = this.state.users.findIndex(u => u._id === data.user._id)
        if (index < 0) {
            const newUser = data.user;

            if (data.following === "following") {
                newUser.following = true;
                this.setState(prevState => ({
                    ...prevState,
                    users: [newUser, ...prevState.users],
                }));
            }
            else {
                this.setState(prevState => ({
                    ...prevState,
                    users: [...prevState.users, newUser],
                }));
            }
        }
        else if (data.following === "unfollowing" || data.matched === "unmatched") {
            const selected = users[index];
            const newUsers = users.filter((u, i) => i !== index)
            const newUser = {
                ...selected,
                following: (data.following && data.following !== "unfollowing"),
                matched: (data.matched && data.matched !== "unmatched") || data.user.matched,
            };

            this.setState(prevState => ({
                ...prevState,
                users: [...newUsers, newUser],
            }))
        }
    }

    removeUser(data) {
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

    matchUser(data) {
        const { users } = this.state;
        const index = users.findIndex(u => u._id === data._id);
        if (index >= 0) {
            const selected = users[index];
            const nextUsers = [...users];
            
            nextUsers[index] = {
                ...selected,
                matched: true,
            };

            this.setState(prevState => ({
                ...prevState,
                users: nextUsers,
            }))
        }
    }

    unmatchUser(data) {
        const { users } = this.state;
        const index = users.findIndex(u => u._id === data._id);
        if (index >= 0) {
            const selected = users[index];
            const nextUsers = [...users];
            
            nextUsers[index] = {
                ...selected,
                matched: false,
            };

            this.setState(prevState => ({
                ...prevState,
                users: nextUsers,
            }))
        }
    }

    componentDidMount() {
        this._isMounted = true;
        const { socket } = this.props;
        this.getUsers();

        if (this._isMounted) {
            socket.on("approach", data => {
                console.log(data);
                if (data.type === "ADD")
                    this.addUser(data);
                else if (data.type === "REMOVE")
                    this.removeUser(data);
                else if (data.type === "UPDATE")
                    this.updateUser(data);
                else if (data.type === "UPDATE_IMAGE")
                    this.updateUserImage(data);
                else if (data.type === "MATCHED")
                    this.matchUser(data);
                else if (data.type === "UNMATCHED")
                    this.unmatchUser(data);
            });
        }


    }
    render() {
        const { currentUser } = this.props;
        const { selectedUser, users, isLoading } = this.state;

        return(
            <div className="container absolute">
                {isLoading ? <Loader /> : (
                    <>
                    <div className="user_list searchable">
                        <h2>I'd like to talk to...</h2>
                        <Search/>
                        {users.map(this.renderUsers)}
                    </div>
                    {selectedUser.id < 0 ? 
                        <div className="user_data"></div>
                        :
                        <Show 
                            user={selectedUser} 
                            key={selectedUser.id} 
                            follow={this.follow}
                            unfollow={this.unfollow}
                            currentUser={currentUser}
                            handleClose={this.handleClose}/>
                    }
                    </>
                )}
            </div>
        )
    }
}

export default Approach;
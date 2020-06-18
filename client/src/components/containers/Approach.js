import React from "react";
import User from "../commons/User";
import axios from 'axios'
import Show from './Show';
import Loader from "../commons/Loader";
import Cookies from 'js-cookie';

let typingTimer;                //timer identifier

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

    searchHandler = (e) => {
        let value = e.target.value.toLowerCase().replace(/\s+/g, " ");
        let queries = value.split(" ");
        Array.from(document.querySelectorAll(".searchable .user_info")).forEach(function(ele) {
            let count = 0;
            queries.forEach(function(query) {
                if (ele.innerText.toLowerCase().includes(query))
                    count += 1;
            });

            if (count === queries.length)
                ele.parentElement.parentElement.classList.remove("invisible");
            else
                ele.parentElement.parentElement.classList.add("invisible");
        });
    }

    keyUpHandler = (e) => {
        clearTimeout(typingTimer);
        let val = e.target.value
        if (val) {
            typingTimer = setTimeout(function() {
                //do something
                axios.post('/api/search', {value: val}).then(response => {
                    console.log(response);
                })
            }, 5000);
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        const { socket } = this.props;
        this.getUsers();

        if (this._isMounted) {
            socket.on("approach", data => {
                console.log(data);
                if (data.type === "ADD") {
                    const { users } = this.state;
                    const index = this.state.users.findIndex(u => u._id === data.user._id)
                    if (index < 0) {
                        console.log(this.state.users);
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
                            following: data.following !== "unfollowing",
                            matched: (data.matched && data.matched !== "unmatched") || data.user.matched,
                        };

                        this.setState(prevState => ({
                            ...prevState,
                            users: [...newUsers, newUser],
                        }))
                    }
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
                else if (data.type === "MATCHED") {
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
                else if (data.type === "UNMATCHED") {
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
                        <div className="search-container">
                            <img src={require("../../images/search.png")} alt="search"/>
                            <input id="search" onChange={this.searchHandler} onKeyUp={this.keyUpHandler}/>
                        </div>
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
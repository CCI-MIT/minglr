import React, { Component } from 'react';
import NavBar from "../commons/NavBar";
import Loader from "../commons/Loader";
import GroupCreator from "../libs/GroupCreator";
import { Link } from "react-router-dom";
import { copyTextToClipboard } from "../../utils/copy";
import axios from 'axios';
import GroupEditor from "../libs/GroupEditor";


class Home extends Component {
    constructor(props) {
        super(props);
        this.state = { 
          isLoading: true,
          createdGroups: [],
          joinedGroups: [],
        };
        this.getGroups = this.getGroups.bind(this);
    }

    getGroups = async () => {
        await axios.get('/api/groups').then(response => {
            //console.log(response);
            if (response.data.success) {
                this.setState({ 
                    isLoading: false,
                    joinedGroups: response.data.joinedGroups,
                    createdGroups: response.data.createdGroups,
                });
            }
            else {
                alert(response.message);
            }
        })
    }

    renderGroups = (group, isCreate) => {
        if (group) {
            return (
                <GroupEditor key={group._id +"_" +group.isDeleted} group={group} onGroupUpdate={()=> {
                    this.setState({isLoading: true}, this.getGroups)

                }}enableEditDelete={isCreate}/>
            );
        }
    }

    renderTable(groups, isCreate) {
        const { isLoading } = this.state;
        return <>{isLoading ?
            <Loader />
            :
            <table>
                <thead>
                    <tr>
                        <th>Group name</th>
                        <th>{isCreate?"Group actions":""}</th>
                        <th>Group link</th>
                        <th>Go to group</th>
                    </tr>
                </thead>
                <tbody>
                    <>{groups.length === 0 ? 
                        <tr><td colSpan="4">None</td></tr>
                        : 
                        groups.map((g)=>this.renderGroups(g,isCreate))
                    }</>
                    <>{isCreate ?
                        <GroupCreator getGroups={this.getGroups}/>
                        :
                        null
                    }</>
                </tbody>
            </table>
        }</>
    }

    componentDidMount() {
        this.getGroups();
    }

    render() {
        const { createdGroups, joinedGroups } = this.state;

        return (
            <div>
                <NavBar {...this.props}/>
                <main className="home">
                    <div className="container full-width">
                        <h2>Groups you have joined</h2>
                        {this.renderTable(joinedGroups, false)}
                    </div>
                    <div className="container full-width">
                        <h2>Groups you have created</h2>
                        {this.renderTable(createdGroups, true)}
                    </div>
                </main>
            </div>
        )
    }
}

export default Home;
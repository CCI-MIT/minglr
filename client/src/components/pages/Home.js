import React, { Component } from 'react';
import NavBar from "../commons/NavBar";
import Loader from "../commons/Loader";
import GroupCreator from "../libs/GroupCreator";
import { Link } from "react-router-dom";
import { copyTextToClipboard } from "../../utils/copy";
import axios from 'axios';


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
            console.log(response);
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

    renderGroups = (group) => {
        var protocol = location.protocol;
        var slashes = protocol.concat("//");
        var host = slashes.concat(window.location.hostname);

        if (group) {
            const link = "/group/" + group._id;
            return (
                <tr key={group._id}>
                    <td>{group.name}</td>
                    <td>
                        <div className="btn darkgray" onClick={() => {copyTextToClipboard(host + link)}}>Copy Link</div>
                    </td>
                    <td>
                        <Link className="btn" to={link}>Go to this group</Link>
                    </td>
                </tr>
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
                        <th>Group link</th>
                        <th>Go to group</th>
                    </tr>
                </thead>
                <tbody>
                    <>{groups.length === 0 ? 
                        <tr><td colSpan="3">None</td></tr>
                        : 
                        groups.map(this.renderGroups)
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
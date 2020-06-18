import React from 'react';
import Approach from "../containers/Approach";
import Greet from "../containers/Greet";
import NavBar from "../commons/NavBar";
import Loader from "../commons/Loader";
import Modal from "../commons/Modal";
import axios from "axios";

class Home extends React.Component {

    _isWaiting = false;
    _isMounted = false;
    _isFinished = false;
    api = null;
    participantNum = 0;

    constructor(props) {
        super(props);
        let name = localStorage.getItem("name") && localStorage.getItem("name").length > 0;
        let room = localStorage.getItem("room") && localStorage.getItem("room").length > 0;
        
        this.state = {
            loading: true,
            modal:  localStorage.getItem("mode") === "modal",
            cancelled: localStorage.getItem("mode") === "cancelled",
            finished: localStorage.getItem("mode") === "finished",
            waiting: localStorage.getItem("mode") === "waiting",
            call: name && room,
        };
    }
    startConference = () => {
        try {
            const domain = 'meet.jit.si';

            const options = {
                roomName: localStorage.getItem("room"),
                height: 500,
                parentNode: this.refs.jitsiContainer,
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    MOBILE_APP_PROMO: false,
                    HIDE_INVITE_MORE_HEADER: true,
                    SHOW_CHROME_EXTENSION_BANNER: false,
                    DISPLAY_WELCOME_PAGE_CONTENT: false,
                    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                },
                configOverwrite: {
                    disableSimulcast: false,
                    disableDeepLinking: true,
                    useStunTurn: true,
                },
            };
            
            this.api = new window.JitsiMeetExternalAPI(domain, options);

            this.api.addEventListener('videoConferenceJoined', () => {
                this.setState(prevState => ({
                    ...prevState,
                    loading: false,
                }), () => {
                    axios.get("/api/calling");
                    let myName = localStorage.getItem("my_firstname") + " " + localStorage.getItem("my_lastname");
                    this.api.executeCommand('displayName', myName);
                });
            });
            this.api.addEventListener("participantJoined", () => {
                console.log(this.api.getNumberOfParticipants());
            })
            this.api.addEventListener("participantLeft", async (data) => {
                console.log(data)
                if (!this._isFinished) {
                    this._isFinished = true;
                    axios.get("/api/finish").then(() => {
                        this._isFinished = false;
                    });
                    // const { socket } = this.props;
                    // socket.emit("finish");

                    localStorage.setItem("mode", "finished")
                    localStorage.setItem("room", "")
                    if (this.api) this.api.dispose();

                    this.setState(prevState => ({
                        ...prevState,
                        call: false,
                        modal: false,
                        finished: true,
                    }));
                }
            });
            this.api.addEventListener("videoConferenceLeft", async (data) => {
                console.log("videoConferenceLeft");
                if (!this._isFinished) {
                    axios.get("/api/finish").then(() => {
                        this._isFinished = false;
                    });
                    // const { socket } = this.props;
                    // socket.emit("finish");

                    localStorage.setItem("mode", "finished")
                    localStorage.setItem("room", "")
                    if (this.api) this.api.dispose();

                    this.setState(prevState => ({
                        ...prevState,
                        call: false,
                        modal: false,
                        finished: true,
                    }));
                }
                
            });
        } catch (err) { console.error(err); }
    }

    handleProceed = async () => {
        localStorage.setItem("mode", "call");

        this.setState(prevState => ({
            ...prevState,
            modal: false,
            call: true,
        }), () => {
            this.startConference();
        });

        await axios.get("/api/proceed");
    }

    // handleFinish = async () => {
    //     await axios.get("/api/finish");
    // }

    handleFinishConfirm = () => {
        console.log("handleFinishConfirm")
        localStorage.setItem("mode", "")
        localStorage.setItem("name", "")
        
        this.setState(prevState => ({
            ...prevState,
            modal: false,
            call: false,
            finished: false,
        }));
    }

    // canceller
    handleCancel = async () => {
        const { modal, waiting } = this.state;
        if ((modal || waiting) && !this._isWaiting) {
            this._isWaiting = true;
            await axios.get("/api/cancel").then(response => {
                console.log(response);
                localStorage.setItem("mode", "")
                localStorage.setItem("room", "")

                this.setState(prevState => ({
                    ...prevState,
                    modal: false,
                    call: false,
                    waiting: false,
                }));
                this._isWaiting = false;
            })
        }
    }

    // cancellee
    handleCancelConfirm = async () => {
        const { cancelled, call } = this.state;
        if (cancelled || call) {
            await axios.get("/api/cancel_confirm").then(response => {
                console.log(response);

                localStorage.setItem("mode", "")
                localStorage.setItem("room", "")
                localStorage.setItem("name", "")

                this.setState(prevState => ({
                    ...prevState,
                    cancelled: false,
                    call: false,
                    waiting: false,
                    modal: false,
                }));
                console.log(this.state);

            })
        }
    }
    componentWillUnmount() {
        const { call } = this.state;
        this._isMounted = false;

        window.addEventListener("beforeunload", async function (e) {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';

            if (call && this._isFinished) {
                axios.get("/api/finish").then(() => {
                    this._isFinished = false;
                })
                // socket.emit("finish");

                localStorage.setItem("mode", "finished")
                localStorage.setItem("room", "")
                this.api.executeCommand('hangup');
                this.api.dispose();
            }

            await axios.get("/api/unavailable");
        });
    }

    componentDidMount() {
        this._isMounted = true;

        const { socket } = this.props;
        const { call, modal, cancelled } = this.state;

        if (this._isMounted) {

            window.addEventListener("beforeunload", async function (e) {
                // Cancel the event
                e.preventDefault();
                // Chrome requires returnValue to be set
                e.returnValue = '';

                if (call && this._isFinished) {
                    axios.get("/api/finish").then(() => {
                        this._isFinished = false;
                    })
                    // socket.emit("finish");

                    localStorage.setItem("mode", "finished")
                    localStorage.setItem("room", "")
                    this.api.executeCommand('hangup');
                    this.api.dispose();
                }

                await axios.get("/api/unavailable");
            });
            
            if (call && !modal && !cancelled) {
                this.startConference();
            }

            socket.on("finishCall", async () => {
                // const { socket } = this.props;
                // socket.emit("finish");
                localStorage.setItem("mode", "finished")
                localStorage.setItem("room", "")
                if (this.api) this.api.dispose();

                this.setState(prevState => ({
                    ...prevState,
                    waiting: false,
                    call: false,
                    modal: false,
                    finished: true,
                }));

                await axios.get("/api/finish");
            })

            socket.on("cancelled", () => {
                console.log("cancelled")

                localStorage.setItem("mode", "cancelled")
                localStorage.setItem("room", "")

                this.setState(prevState => ({
                    ...prevState,
                    cancelled: true,
                }));
            })
            socket.on("createCall", () => {
                console.log("createCall")
                // waiting -> call
                // modal -> call
                const { call } = this.state;
                try {
                    if (!call && window.JitsiMeetExternalAPI) {
                        this.setState(prevState => ({
                            ...prevState,
                            waiting: false,
                            call: true,
                        }), () => {
                            this.startConference();
                        });
                    }

                } catch (err) {console.error(err)}
            });

            socket.on("joinCall", data => {
                console.log(data)

                localStorage.setItem("name", data.name);
                localStorage.setItem("room", data.room);
                localStorage.setItem("mode", "modal");

                this.setState(prevState => ({
                    ...prevState,
                    modal: true,
                }));

                // click on approach tab
                document.getElementById("tab-1").checked = true
                document.getElementById("tab-2").checked = false
            });

            socket.on("waitCall", data => {
                console.log(data)
                const { waiting } = this.state
                try {
                    if (!waiting && window.JitsiMeetExternalAPI) {
                        localStorage.setItem("name", data.name)
                        localStorage.setItem("room", data.room)
                        localStorage.setItem("mode", "waiting");

                        this.setState(prevState => ({
                            ...prevState,
                            waiting: true,
                        }));

                        // click on approach tab
                        document.getElementById("tab-1").checked = true
                        document.getElementById("tab-2").checked = false
                    }
                    else alert('Please wait for a minute');

                } catch (err) {console.error(err)}
            });

        }
        
    }

    render () {
        const { call, modal, cancelled, finished, loading, waiting } = this.state;
        let returnThis = ""

        console.log(this.state);
        if (cancelled) {
            // show modal to alert cancel
            returnThis = <Modal mode="cancelled" handleCancelConfirm={this.handleCancelConfirm}/>
        }
        else if (finished) {
            returnThis = <Modal mode="finished" handleFinishConfirm={this.handleFinishConfirm}/>
        }
        else if (waiting) {
            returnThis = <Modal mode="waiting" handleCancel={this.handleCancel}/>
        }
        else if (call && !modal) {
            // show the video chat
            returnThis = <div className="jitsi">
                <strong className="jitsi-loader">{loading ? <div>Waiting for the other...<Loader /></div> : ""}</strong>
                <div className="jitsi-container" ref="jitsiContainer"></div>
            </div>
        }
        else if (modal) {
            //show modal to give choice
            returnThis = <Modal mode="modal" handleProceed={this.handleProceed} handleCancel={this.handleCancel} />
        }

        return (
            <div>
                <NavBar {...this.props}/>
                <main className="tabPanel-widget">
                    <label className="mobile-nav" htmlFor="tab-1" tabIndex="0"></label>
                    <input className="mobile-nav" id="tab-1" type="radio" name="tabs" defaultChecked aria-hidden="true"/>
                    <h2 className="mobile-nav" >
                        {call ? "You're on a call" : "I'd like to talk to"}
                    </h2>
                    
                    <div className="approach">
                        {returnThis}
                        <Approach {...this.props}/>
                    </div>
                    

                    <label className="mobile-nav" htmlFor="tab-2" tabIndex="0"></label>
                    <input className="mobile-nav" id="tab-2" type="radio" name="tabs" aria-hidden="true"/>
                    <h2 className="mobile-nav" >People who want to talk to you</h2>

                    <Greet {...this.props} clickDisabled={cancelled || modal || call || finished || waiting}/>
                </main>
            </div>
        );
    }
}

export default Home

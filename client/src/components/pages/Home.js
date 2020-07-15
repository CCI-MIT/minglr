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

    constructor(props) {
        super(props);
        
        this.state = {
            loading: true,
            mode: localStorage.getItem("mode") || "",
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

            // add listener 
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
            this.api.addEventListener("participantLeft", async () => {
                console.log("participantLeft")
                this.handleFinish();
            });
            this.api.addEventListener("videoConferenceLeft", async () => {
                console.log("videoConferenceLeft");
                this.handleFinish();
            });
        } catch (err) { console.error(err); }
    }

    handleProceed = async () => {
        localStorage.setItem("mode", "call");

        this.setState(prevState => ({
            ...prevState,
            mode: "call"
        }), () => {
            this.startConference();
        });

        await axios.get("/api/proceed");
    }

    // finisher
    handleFinish = () => {
        console.log("handleFinish")

        if (!this._isFinished) {
            this._isFinished = true;
            
            axios.get("/api/finish").then(() => {
                this._isFinished = false;
            });

            // update localstorage
            localStorage.setItem("mode", "finished")
            localStorage.setItem("room", "")

            if (this.api) this.api.dispose();

            // update state
            this.setState(prevState => ({
                ...prevState,
                mode: "finished"
            }));
        }
    }

    // finishee
    handleFinishConfirm = () => {
        console.log("handleFinishConfirm")

        // update localstorage
        localStorage.setItem("mode", "")
        localStorage.setItem("name", "")
        
        // update state
        this.setState(prevState => ({
            ...prevState,
            mode: "",
        }));
    }

    // canceller
    handleCancel = async () => {
        const { mode } = this.state;
        if ((mode === "modal" || mode === "waiting") && !this._isWaiting) {
            this._isWaiting = true;
            await axios.get("/api/cancel").then(response => {
                console.log(response);

                // update localstorage
                localStorage.setItem("mode", "")
                localStorage.setItem("room", "")

                // update state
                this.setState(prevState => ({
                    ...prevState,
                    mode: "",
                }));
                this._isWaiting = false;
            })
        }
    }

    // cancellee
    handleCancelConfirm = async () => {
        const { mode } = this.state;
        if (mode === "cancelled" || mode === "call") {
            await axios.get("/api/cancel_confirm").then(response => {
                console.log(response);

                // update localstorage
                localStorage.setItem("mode", "")
                localStorage.setItem("room", "")
                localStorage.setItem("name", "")

                // update state
                this.setState(prevState => ({
                    ...prevState,
                    mode: "",
                }));
            })
        }
    }
    componentWillUnmount() {
        this._isMounted = false;

        window.addEventListener("beforeunload", async function (e) {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';

            if (this.state.mode === "call") {
                if (this.api) this.api.executeCommand('hangup');
                this.handleFinish();
            }

            await axios.get("/api/unavailable");
        });
    }

    componentDidMount() {
        this._isMounted = true;

        const { socket } = this.props;
        const { mode } = this.state;

        if (this._isMounted) {

            window.addEventListener("beforeunload", async function (e) {
                // Cancel the event
                e.preventDefault();
                // Chrome requires returnValue to be set
                e.returnValue = '';

                if (this.state.mode === "call") {
                    if (this.api) this.api.executeCommand('hangup');
                    this.handleFinish();
                }
    
                await axios.get("/api/unavailable");
            });
            
            if (mode === "call") {
                this.startConference();
            }

            socket.on("finishCall", async () => {
                // call -> finished
                this.handleFinish();
            })

            socket.on("cancelled", () => {
                // waiting -> cancelled
                console.log("cancelled")

                localStorage.setItem("mode", "cancelled")
                localStorage.setItem("room", "")

                this.setState(prevState => ({
                    ...prevState,
                    mode: "cancelled"
                }));
            })

            socket.on("createCall", () => {
                console.log("createCall")
                // waiting -> call
                // modal -> call
                const { mode } = this.state;
                try {
                    if (mode !== "call" && window.JitsiMeetExternalAPI) {
                        this.setState(prevState => ({
                            ...prevState,
                            mode: "call",
                        }), () => {
                            this.startConference();
                        });
                    }

                } catch (err) {console.error(err)}
            });

            socket.on("joinCall", data => {
                // request -> other things -> modal
                console.log(data)

                localStorage.setItem("name", data.name);
                localStorage.setItem("room", data.room);
                localStorage.setItem("mode", "modal");

                this.setState(prevState => ({
                    ...prevState,
                    mode: "modal",
                }));

                // click on approach tab
                document.getElementById("tab-1").checked = true
                document.getElementById("tab-2").checked = false
            });

            socket.on("waitCall", data => {
                // accept request -> waiting
                console.log(data)
                const { waiting } = this.state
                try {
                    if (!waiting && window.JitsiMeetExternalAPI) {
                        localStorage.setItem("name", data.name)
                        localStorage.setItem("room", data.room)
                        localStorage.setItem("mode", "waiting");

                        this.setState(prevState => ({
                            ...prevState,
                            mode: "waiting",
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
        const { loading, mode } = this.state;
        let returnThis = ""

        console.log(this.state);
        if (mode === "cancelled") {
            // show modal to inform that the request got canceled
            returnThis = <Modal mode={mode} handleCancelConfirm={this.handleCancelConfirm}/>
        }
        else if (mode === "finished") {
            // show modal to inform that the call got finished
            returnThis = <Modal mode={mode} handleFinishConfirm={this.handleFinishConfirm}/>
        }
        else if (mode === "waiting") {
            // waiting for the counterpart to proceed/cancel
            returnThis = <Modal mode={mode} handleCancel={this.handleCancel}/>
        }
        else if (mode === "call") {
            // show the video chat
            returnThis = <div className="jitsi">
                <strong className="jitsi-loader">{loading ? <div>Waiting for the other...<Loader /></div> : ""}</strong>
                <div className="jitsi-container" ref="jitsiContainer"></div>
            </div>
        }
        else if (mode === "modal") {
            // show modal to give choice of proceed/cancel
            returnThis = <Modal mode={mode} handleProceed={this.handleProceed} handleCancel={this.handleCancel} />
        }

        return (
            <div>
                <NavBar {...this.props}/>
                <main className="tabPanel-widget">
                    <label className="mobile-nav" htmlFor="tab-1" tabIndex="0"></label>
                    <input className="mobile-nav" id="tab-1" type="radio" name="tabs" defaultChecked aria-hidden="true"/>
                    <h2 className="mobile-nav">
                        {mode === "call" ? "You're on a call" : "I'd like to talk to"}
                    </h2>
                    
                    <div className="approach">
                        {returnThis}
                        <Approach {...this.props}/>
                    </div>

                    <label className="mobile-nav" htmlFor="tab-2" tabIndex="0"></label>
                    <input className="mobile-nav" id="tab-2" type="radio" name="tabs" aria-hidden="true"/>
                    <h2 className="mobile-nav" >People who want to talk to you</h2>

                    <Greet {...this.props} clickDisabled={mode.length > 0}/>
                </main>
            </div>
        );
    }
}

export default Home

import React, {useState, useEffect} from 'react';
import axios from "axios";

function Settings(props) {

    const [initialized, setInitialized] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [affiliation, setAffiliation] = useState("");
    const [keywords, setKeywords] = useState("");
    const [image, setImage] = useState(require("../../images/default_user.jpeg"));

    useEffect(() => {
        if (!initialized && props.currentUser) {
            setInitialized(true);

            if (props.currentUser.firstname)
                setFirstname(props.currentUser.firstname);
            if (props.currentUser.lastname)
                setLastname(props.currentUser.lastname);
            if (props.currentUser.affiliation)
                setAffiliation(props.currentUser.affiliation);
            if (props.currentUser.keywords)
                setKeywords(props.currentUser.keywords);
            if (props.currentUser.image)
                setImage(props.currentUser.image);
        }
    })
    
    const onFirstnameHandler = (event) => {
        setFirstname(event.currentTarget.value)
    }
    const onLastnameHandler = (event) => {
        setLastname(event.currentTarget.value)
    }
    const onAffiliationHandler = (event) => {
        setAffiliation(event.currentTarget.value)
    }
    const onKeywordsHandler = (event) => {
        setKeywords(event.currentTarget.value)
    }
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const data = {firstname, lastname, affiliation, keywords}
        console.log(data)
        
        await axios.post("/api/update", data)
        .then(response => {
            console.log(response);
            alert("Saved!");
            props.settingsHandler();
        })

    }
    const onImageHandler = async (e) => {
        e.preventDefault();

        const file = e.currentTarget.files[0]
        if (checkFileType(file)) {
            const data = new FormData()
            data.append('image', file);
            setImage(require("../../images/loader.gif"));
    
            await axios.post("/api/update_image", data).then(response => {
                console.log(response);
                // receive two parameters: endpoint url, form data
                if (response.data.success) {
                    setImage(response.data.image);
                }
                else {
                    alert("Upload failed. Please try again.")
                }
            })
        }
        else {
            e.currentTarget.value = null;
            alert("Not allowed. Allowed extensions are jpg, jpeg, gif, and png.")
        }
        
    }
    const checkFileType = (file) => {
        //define message container
        let err = ''
        // list allow mime type
        const types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
        // compare file type find doesn't matach
        if (types.every(type => file.type !== type)) {
            // create error message and assign to container   
            err += file.type+' is not a supported format\n';
        }
        if (err !== '') { // if message not same old that mean has error 
            console.log(err)
            return false; 
        }
       return true;
    }
    return (
        <div className={`settings-body ${props.settings ? "" : "hidden"}`}>
            <h3>Your Information</h3>
            <div className="user_image">
                <img src={image} alt="profile image"/>
            </div>
            <form>
                <label className="label">Change Your Profile Image:</label>
                <input type='file' name='image' onChange={onImageHandler}/>
            </form>
            <form onSubmit={onSubmitHandler}>
                <label className="label">Your First Name</label>
                <input type="link" value={firstname} onChange={onFirstnameHandler} />
                <br />
                <label className="label">Your Last Name</label>
                <input type="link" value={lastname} onChange={onLastnameHandler} />
                <br />
                <label className="label">Your Affiliation</label>
                <input type="link" value={affiliation} onChange={onAffiliationHandler} />
                <br />
                <label className="label">Research Interest Keywords</label>
                <input type="link" value={keywords} onChange={onKeywordsHandler} />
                <button className="btn" type="submit">Save</button>
            </form>
        </div>
    )
}

export default Settings
import React, {useState} from 'react';
import axios from "axios";

function Settings(props) {

    const [firstname, setFirstname] = useState(localStorage.getItem("my_firstname") || "");
    const [lastname, setLastname] = useState(localStorage.getItem("my_lastname") || "");
    const [affiliation, setAffiliation] = useState(localStorage.getItem("affiliation") || "");
    const [keywords, setKeywords] = useState(localStorage.getItem("keywords") || "");
    
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
            localStorage.setItem("my_firstname", firstname);
            localStorage.setItem("my_lastname", lastname);
            localStorage.setItem("affiliation", affiliation);
            localStorage.setItem("keywords", keywords);
            // if (response.data.success) {
            //     window.location.reload();
            // }
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
            // data.append('file', file);
    
            await axios.post("/api/update_image", data, {
                // receive two parameters: endpoint url ,form data
            }).then(response => {
                if (response.success) {
                    console.log("profile photo successfully changed");
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
        <div className="settings-body">
            <h3>Your Information</h3>
            <div>
                Tell the others about you:
            </div>
            <form action='/api/images' method="post" encType="multipart/form-data">
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
import React from "react";
import axios from 'axios'

function Search(props) {

    let typingTimer;                //timer identifier

    const searchHandler = (e) => {
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

    const saveSearchHandler = (e) => {
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

    return (
        <div className="search-container">
            <img src={require("../../images/search.png")} alt="search"/>
            <input id="search" onChange={searchHandler} onKeyUp={saveSearchHandler}/>
        </div>
    )
}

export default Search
import React, { useState } from "react";
import { BsTrash } from "react-icons/bs"; // Import the trash bin icon from react-icons library
import DisplayData from "./DisplayData";

const TagsInput = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState([]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3333/get_rss_feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls: tags }),
    });

    const data = await res.json();
    setData(data.feedItems);
  };

  const getUrlFromDatabase = async () => {
    const res = await fetch("http://localhost:3333/fetchDataFromMySQL", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log(data);
    setData(data.feedItems);
  };

  return (
    <div className="container">
      
      <hr />
      <DisplayData data={data} />
      <hr>
      </hr>
      <button className="btn btn-primary m-3" onClick={getUrlFromDatabase}>
        {" "}
         Submit
      </button>

    </div>
  );
};

export default TagsInput;

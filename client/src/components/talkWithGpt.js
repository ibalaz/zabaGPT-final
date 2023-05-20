import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Axios from "axios";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Review from './review';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

function TalkWithGpt() {

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Error");
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("Explain me how to solve this problem in React.js <Issue>");
    const [issue, setIssue] = useState("How to pass value from children to parent component?");

    const [review, setReview] = useState("Witing for some juicy programming problem...");

    const getReview = () => {
        let fullPrompt = prompt.replace("<Issue>", issue);
        setLoading(true);
        Axios.post("http://localhost:3001/api/codeReview/review", {
            configuration: {
                temperature: "",
                requestType: "BASIC_PROMPT",
            },
            codeSnippet: "",
            basicPrompt: JSON.stringify(fullPrompt),
            codeIssue: ""
        })
            .then((res) => {

                if (res.data.success) {
                    setReview(res.data.review);
                    setLoading(false);
                    setError(false);
                } else {
                    setLoading(false);
                    setError(true);
                    setErrorMessage(res.data.error);
                }
            })
            .catch((error) => {
                setLoading(false);
                setError(true);
                setErrorMessage(error.message);
            });
    };

    return (
        <Grid container spacing={2}>
            <Grid xs={12}
                    mb="20px"
                    textAlign={"left"}>
                    <FormControl fullWidth>
        <InputLabel id="prompt-simple-select">Prompt Type</InputLabel>
        <Select
          labelId="prompt-simple-select"
          id="prompt-simple-select-id"
          label="Prompt Type"
          value={prompt}
          onChange={event =>{
            setPrompt(event.target.value)
          } }
        >
          <MenuItem value={"Explain me how to solve this problem in Java <Issue>"}>Explain me how to solve this problem in Java &#60;Issue&#62;</MenuItem>
          <MenuItem value={"Explain me how to solve this problem in React.js <Issue>"}>Explain me how to solve this problem in React.js &#60;Issue&#62; </MenuItem>
          <MenuItem value={"Explain me how to <Issue> in Java"}>Explain me how to &#60;Issue&#62; in Java</MenuItem>
          <MenuItem value={"Explain me how to <Issue> in React.js"}>Explain me how to &#60;Issue&#62; in React.js</MenuItem>
          <MenuItem value={"Explain me how to <Issue> in Git"}>Explain me how to &#60;Issue&#62; in Git</MenuItem>
          <MenuItem value={"Explain me how to <Issue>"}>Explain me how to &#60;Issue&#62;</MenuItem>
        </Select>
      </FormControl>
                </Grid>
            <Grid xs={4}>
                
                <Grid xs={12}>
                    <TextField
                        key="basic-prompt-input"
                        id="basic-prompt-multiline-static"
                        multiline
                        label="Issue"
                        rows={2}
                        value={issue}
                        fullWidth
                        onChange={event => {
                            setIssue(event.target.value)
                        }}
                    />
                </Grid>
                <Grid xs={12} mt='5px'>
                    <Button
                        size="medium"
                        variant="contained"
                        color="success"
                        endIcon={<SendIcon />}
                        onClick={() => {
                            console.log(prompt)
                            getReview();
                        }}
                    >
                        Send
                    </Button>
                </Grid>
            </Grid>
            <Divider
                orientation="vertical"
                flexItem
                sx={{ mr: "-2px" }}
            ></Divider>
            <Grid xs={8}>
                <Box sx={{ ml: 1 }}>
                    {!error && !loading && <Review value={review}></Review>}
                    {loading && <CircularProgress color="success" />}
                </Box>
            </Grid>
        </Grid >
    )
};

export default TalkWithGpt;
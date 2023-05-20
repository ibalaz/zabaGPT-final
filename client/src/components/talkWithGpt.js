import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Divider from "@mui/material/Divider";
import ReviewCode from './reviewCode';
import Box from "@mui/material/Box";
import Axios from "axios";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";

function TalkWithGpt() {

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Error");
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("Tell me your nameeee");

    const [review, setReview] = useState("Review");

    const getReview = () => {
        setLoading(true);
        Axios.post("http://localhost:3001/api/codeReview/review", {
            configuration: {
                temperature: "",
                requestType: "BASIC_PROMPT",
            },
            codeSnippet: "",
            basicPrompt: JSON.stringify(prompt),
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
            <Grid xs={6}>
                <Grid xs={12}>
                    <TextField
                        key="basic-prompt-input"
                        id="basic-prompt-multiline-static"
                        multiline
                        label="Issue"
                        rows={2}
                        value={prompt}
                        fullWidth
                        onChange={event => {
                            setPrompt(event.target.value)
                            console.log(event.target.value)
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
            <Grid xs={6}>
                <Box sx={{ ml: 1 }}>
                    {!error && !loading && <ReviewCode review={review}></ReviewCode>}
                    {loading && <CircularProgress color="success" />}
                </Box>
            </Grid>
        </Grid>
    )
};

export default TalkWithGpt;
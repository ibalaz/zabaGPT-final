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
import ReviewCode from './reviewCode';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import Editor from 'react-simple-code-editor';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function CodeTranslator() {

    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Error");
    const [loading, setLoading] = useState(false);

    const [translationType, setTranslationType] = useState("Rewrite following code from Groovy to Java");
    const [code, setCode] = useState("function add(a, b) {\n  return a + b;\n}");
    const [codeCounter, setCodeCounter] = React.useState(0);

    const [review, setReview] = useState("Witing for legacy code to translate it");

    const getReview = () => {
        let fullPrompt = translationType + "Code: " + code;
        setLoading(true);
        Axios.post("http://localhost:3001/api/codeReview/review", {
            configuration: {
                temperature: "",
                requestType: "BASIC_PROMPT",
            },
            codeSnippet: "",
            basicPrompt: fullPrompt,
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
                mb="5px"
                textAlign={"left"}>
                <FormControl fullWidth>
                    <InputLabel id="from-language-select" >Translation Types</InputLabel>
                    <Select fullWidth
                        labelId="from-language-select"
                        id="from-language-select-id"
                        label="From programming language"
                        value={translationType}
                        onChange={event => {
                            setTranslationType(event.target.value)
                        }}>
                        <MenuItem value={"Rewrite following code from Groovy to Java"}>Rewrite following code from Groovy to Java</MenuItem>
                        <MenuItem value={"Rewrite following code from Angular to React"}>Rewrite following code from Angular to React</MenuItem>
                        <MenuItem value={"Rewrite following code from EGL to PL/SQL"}>Rewrite following code from EGL to PL/SQL</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6} alignItems={"left"} textAlign={"left"}>
                <Grid xs={12}>
                    <Typography variant="button" gutterBottom fontWeight={"bold"}> CODE INPUT</Typography>
                    <span style={{ color: codeCounter > 3000 ? 'red' : 'black' }}>  [{codeCounter}  / 3000]</span>
                    <Tooltip title="Enter code in selected language, and ChatGPT will translate it into desired language. Be aware - max number of input characters is 3000. The rest will be discarded!"
                        placement='right'>
                        <IconButton>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Tooltip>
                    <Editor
                        value={code}
                        onValueChange={code => {
                            setCode(code);
                            setCodeCounter(code.length)
                        }}
                        highlight={code => highlight(code, languages.js)}
                        padding={0}
                        margin={0}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 16,
                            borderStyle: 'solid',
                            borderWidth: 'thin',
                            backgroundColor: 'white'
                        }}
                    />
                </Grid>
                <Grid xs={12} mt='7px' textAlign={"center"}>
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
            <Grid item xs={6} textAlign={"left"} mt={'7px'}>
                <Grid item xs={12}>
                    <Typography variant="button" display="block" gutterBottom fontWeight={"bold"}> TRANSLATED CODE</Typography>
                    <Box sx={{ ml: "3px", mt: "8px" }}>
                        {!error && !loading && <Editor
                        value={review}
                        readOnly
                        highlight={code => highlight(code, languages.js)}
                        padding={0}
                        margin={0}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 16,
                            borderStyle: 'solid',
                            borderWidth: 'thin',
                            backgroundColor: 'white'
                        }}
                    />}
                        {loading && <CircularProgress color="success" />}
                    </Box>
                </Grid>
            </Grid>
        </Grid >
    )
};

export default CodeTranslator;
import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/system';


function PromptEditor({ requestType, handleChange, handleBasicPromptChange, handleCodeIssueChange }) {

  //This is here so that component can remember its state after RB change
  const [code, setCode] = useState("function add(a, b) {\n  return a + b;\n}");
  const [codeIssue, setCodeIssue] = useState("Problem is that...");
  const [basicInput, setBasicInput] = useState("Čekam...");

  return (
    <Grid container spacing={2}>
      <Grid xs={12} textAlign={"left"}>
        <Typography variant="button" display="block" gutterBottom fontWeight={"bold"}> Code input</Typography>
      </Grid>
      {requestType == 'CODE_ISSUE_FIX' &&
      <Grid xs={12}>
      <TextField
          key="basic-prompt-input"
          id="basic-prompt-multiline-static"
          multiline
          label="Issue"
          rows={2}
          value={codeIssue}
          fullWidth
          onChange={event =>{
            setCodeIssue(event.target.value)
            handleCodeIssueChange(event.target.value);
          } }
        />
      </Grid>
}
      <Grid xs={12}>
        {(requestType == 'CODE_REVIEW' || requestType == 'CODE_REFACTOR' || requestType == 'CODE_ISSUE_FIX') &&
          <Editor
            value={code}
            onValueChange={code => {
              setCode(code);
              handleChange(code);
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
          />}
        {requestType == 'BASIC_PROMPT' && <TextField
          key="basic-prompt-input"
          id="basic-prompt-multiline-static"
          multiline
          rows={4}
          value={basicInput}
          fullWidth
          onChange={event =>{
            setBasicInput(event.target.value)
            handleBasicPromptChange(event.target.value);
          } }
        />}
      </Grid>
    </Grid>
  )
}

export default PromptEditor;
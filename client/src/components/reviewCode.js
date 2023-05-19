import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Grid from '@mui/material/Unstable_Grid2';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

function ReviewCode (props) {

    return (
        <Grid container spacing={2}>
        <Editor
            readOnly
            value={props.review}
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
    )
};

export default ReviewCode;
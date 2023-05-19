import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { textFieldClasses } from '@mui/material';

const temperatureSliderMarks = [
    {
        value: 0.2,
        label: '0.2',
    },
    {
        value: 0.4,
        label: '0.4',
    },
    {
        value: 0.6,
        label: '0.6',
    },
    {
        value: 0.8,
        label: '0.8',
    },
];


function Configurator({handleTemperatureChange, handleRequestTypeChange}) {

    return (
        <Grid container spacing={2}>
            <Grid xs={12} textAlign={"left"}>
                <Typography variant="button" display="block" gutterBottom fontWeight={"bold"}> Configurator</Typography>
            </Grid>
            <Grid xs={12} textAlign={"left"}> 
                <FormControl>
                    <Typography id="input-usage" gutterBottom></Typography>
                    <RadioGroup
                        row
                        aria-labelledby="radio-buttons-purpose-label"
                        name="radio-buttons-purpose-label"
                        onChange={event => {
                            handleRequestTypeChange(event.target.value);
                          }}
                    >
                        <FormControlLabel value="CODE_REVIEW" control={<Radio />} label="Code analysis" />
                        <FormControlLabel value="CODE_REFACTOR" control={<Radio />} label="Code refactor" />
                        <FormControlLabel value="CODE_ISSUE_FIX" control={<Radio />} label="Fix code issue" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            {/*<Grid xs={4}>
                <Typography id="input-slider" gutterBottom>Temperatura</Typography>
                <Slider 
                    min={0.2}
                    max={0.8}
                    step={0.2}
                    defaultValue={0.2}
                    aria-label="Temperatura"
                    valueLabelDisplay="auto"
                    marks={temperatureSliderMarks} 
                    onChange={event => {
                        handleTemperatureChange(event.target.value);
                      }}/>
            </Grid> */}
            
        </Grid>
    )
}

export default Configurator;
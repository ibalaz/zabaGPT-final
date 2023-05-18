import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

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
                <Typography variant="button" display="block" gutterBottom fontWeight={"bold"}> Konfigurator</Typography>
            </Grid>
            <Grid xs={8}>
                <FormControl>
                    <Typography id="input-usage" gutterBottom>Korištenje</Typography>
                    <RadioGroup
                        row
                        aria-labelledby="radio-buttons-purpose-label"
                        name="radio-buttons-purpose-label"
                        onChange={event => {
                            handleRequestTypeChange(event.target.value);
                          }}
                    >
                        <FormControlLabel value="CODE_REVIEW" control={<Radio />} label="Analiza koda" />
                        <FormControlLabel value="CODE_REFACTOR" control={<Radio />} label="Refaktoriranje koda" />
                        <FormControlLabel value="BASIC_PROMPT" control={<Radio />} label="Razgovor sa Chat GPT" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid xs={4}>
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
            </Grid>
        </Grid>
    )
}

export default Configurator;
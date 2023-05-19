import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Axios from "axios";
import Configurator from "./configurator";
import PromptEditor from "./promptEditor";
import Review from "./review";
import "../style/Home.css";
import { ListItemButton, TextField, List, ListItemText } from "@mui/material";

function Home() {
  //error and loading states
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Error");
  const [loading, setLoading] = useState(false);

  //configuration states
  const [temperature, setTemperature] = useState(0.2);
  const [requestType, setRequestType] = useState("CODE_REVIEW");

  //codeSnippet and input
  const [code, setCode] = useState(`function add(a, b) {\n  return a + b;\n}`);
  const [basicPrompt, setBasicPrompt] = useState("Tell me your name");

  // project url
  const [projectUrl, setProjectUrl] = useState("");

  // commits
  const [commits, setCommits] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();
  const [commitReview, setCommitReview] = useState("");
  const [addedLines, setAddedLines] = useState("");

  //review
  const [review, setReview] = useState(`Čekam primjer programskog koda...`);

  useEffect(() => {
    setError(false);
    setLoading(false);
  }, []);

  const handleSnippetEditorChange = (data) => {
    setCode(data);
  };

  const handleTemperatureChange = (temperature) => {
    setTemperature(temperature);
  };

  const handleRequestTypeChange = (requestType) => {
    setRequestType(requestType);
  };

  const handleBasicPromptChange = (prompt) => {
    console.log(JSON.stringify(prompt));
    setBasicPrompt(prompt);
  };

  const handleChangeUserUrl = (event) => {
    setProjectUrl(event.target.value);
  };

  const handleCommitListClick = (event, index, value) => {
    setSelectedIndex(index);
    getCommitReview(value);
  };

  const getReview = () => {
    setLoading(true);
    Axios.post("http://localhost:3001/api/codeReview/review", {
      configuration: {
        temperature: temperature,
        requestType: requestType,
      },
      codeSnippet: code,
      basicPrompt: basicPrompt,
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

  const getCommits = () => {
    setLoading(true);
    Axios.post("http://localhost:5001/commits", {
      url: projectUrl,
    })
      .then((res) => {
        if (res.data.success) {
          setCommits(res.data.commits);
          setLoading(false);
          setError(false);
        } else {
          setLoading(false);
          setError(true);
          setErrorMessage(res.error);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(true);
        setErrorMessage(error.message);
      });
  };

  const getCommitReview = (value) => {
    setLoading(true);
    Axios.post("http://localhost:5001/gpt_endpoint", {
      value: value,
      temperature: temperature,
    })
      .then((res) => {
        if (res.data.success) {
          setAddedLines(res.data.added_lines);
          setCommitReview(res.data.output_text);
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
    <Container className="home" maxWidth="lg">
      <Grid container spacing={2}>
        <Grid xs={12}>
          <Typography variant="h6" gutterBottom>
            ZabaGPT Hackaton
          </Typography>
        </Grid>
        <Grid xs={6}>
          <Box sx={{ mb: 2 }}>
            <Grid xs={12}>
              <Configurator
                handleTemperatureChange={handleTemperatureChange}
                handleRequestTypeChange={handleRequestTypeChange}
              ></Configurator>
            </Grid>
            <Grid xs={12}>
              <Divider></Divider>
            </Grid>
            <Grid xs={12}>
              <PromptEditor
                key="basic-prompt-input"
                requestType={requestType}
                handleChange={handleSnippetEditorChange}
                handleBasicPromptChange={handleBasicPromptChange}
              ></PromptEditor>
            </Grid>
            <Grid xs={12}>
              <Button
                size="medium"
                variant="contained"
                color="success"
                endIcon={<SendIcon />}
                onClick={() => {
                  getReview();
                }}
              >
                Pošalji
              </Button>
            </Grid>
          </Box>
        </Grid>
        <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }}></Divider>
        <Grid xs={6}>
          <Box sx={{ mb: 2 }}>
            <Grid xs={12} textAlign={"left"}>
              <Typography
                variant="button"
                display="block"
                gutterBottom
                fontWeight={"bold"}
              >
                {" "}
                AI ODGOVOR
              </Typography>
            </Grid>
            <Grid xs={12}>
              {!error && !loading && <Review value={review} readonly></Review>}
              {loading && <CircularProgress color="success" />}
              {error && !loading && (
                <Alert severity="error">{errorMessage}</Alert>
              )}
            </Grid>
          </Box>
        </Grid>

        {/* Commits part */}

        <Grid xs={6}>
          <Box sx={{ mb: 2 }}>
            <Grid xs={12}>
              <Divider></Divider>
            </Grid>
            <Grid xs={12}>
              <TextField
                id="projectUrl"
                label="Gitlab url projekta"
                value={projectUrl}
                onChange={handleChangeUserUrl}
              />
            </Grid>
            <Grid xs={12}>
              <Button
                size="medium"
                variant="contained"
                color="success"
                endIcon={<SendIcon />}
                onClick={() => {
                  getCommits();
                }}
              >
                Pošalji
              </Button>
            </Grid>
          </Box>
          {commits.length !== 0 && (
            <List dense="true" className="commit-list">
              {commits.map((element, index) => (
                <ListItemButton
                  key={index}
                  selected={selectedIndex === index}
                  onClick={(event) =>
                    handleCommitListClick(event, index, element.value)
                  }
                  className="commit-list-item"
                >
                  <ListItemText
                    primary={element.label}
                    value={element.value}
                    className="commit-list-item-text"
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Grid>
        <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }}></Divider>
        <Grid xs={6}>
          <Box sx={{ mb: 2 }}>
            <Grid xs={12} textAlign={"left"}>
              <Typography
                variant="button"
                display="block"
                gutterBottom
                fontWeight={"bold"}
              >
                {" "}
                ADDED LINES
              </Typography>
            </Grid>
            <Grid xs={12}>
              {!error && !loading && (
                <Review value={addedLines} readonly></Review>
              )}
              {loading && <CircularProgress color="success" />}

              <Grid xs={12} textAlign={"left"}>
                <Typography
                  variant="button"
                  display="block"
                  gutterBottom
                  fontWeight={"bold"}
                >
                  {" "}
                  AI ODGOVOR
                </Typography>
              </Grid>
              {!error && !loading && (
                <Review value={commitReview} readonly></Review>
              )}
              {loading && <CircularProgress color="success" />}
              {error && !loading && (
                <Alert severity="error">{errorMessage}</Alert>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;

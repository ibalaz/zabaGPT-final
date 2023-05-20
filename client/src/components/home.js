import { useState, useEffect } from "react";
import zabaLogo from '../resources/zaba_logo_2.jpg';
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
import ReviewCode from './reviewCode';
import TalkWithGpt from './talkWithGpt';
import Review from "./review";
import "../style/Home.css";
import { ListItemButton, TextField, List, ListItemText } from "@mui/material";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import PropTypes from "prop-types";
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

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
  const [codeIssue, setCodeIssue] = useState("Fix this code");
  const [basicPrompt, setBasicPrompt] = useState("Tell me your name");

  // project url
  const [projectUrl, setProjectUrl] = useState("");

  // merge
  const [mergeUrlLabel, setMergeUrlLabel] = useState("Gitlab url merge requesta");
  const [mergeUrl, setMergeUrl] = useState("");
  const [changelogInput, setChangelogInput] = useState("");
  const [changelog, setChangelog] = useState("");

  // commits
  const [commits, setCommits] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();
  const [commitReview, setCommitReview] = useState("");
  const [addedLines, setAddedLines] = useState("");
  const itemsPerPage = 5;
  const [page, setPage] = useState(0);

  const handleNext = () => {
    if (page < Math.floor(commits.length / itemsPerPage)) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  //review
  const [review, setReview] = useState(`Waiting for an example...`);

  // tabs
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    setError(false);
    setLoading(false);
  }, []);

  const handleSnippetEditorChange = (data) => {
    setCode(data);
  };

  const handleCodeIssueChange = (data) => {
    setCodeIssue(data);
  }

  const handleTemperatureChange = (temperature) => {
    setTemperature(temperature);
  };

  const handleRequestTypeChange = (requestType) => {
    setRequestType(requestType);
  };

  const handleBasicPromptChange = (prompt) => {
    setBasicPrompt(prompt);
  };

  const handleChangeUserUrl = (event) => {
    setProjectUrl(event.target.value);
  };

  const handleCommitListClick = (event, index, value) => {
    setSelectedIndex(index);
    getCommitReview(value);
  };

  const handleChangeMergeUrl = (event) => {
    setMergeUrl(event.target.value)
  }

  const getReview = () => {
    setLoading(true);
    Axios.post("http://localhost:3001/api/codeReview/review", {
      configuration: {
        temperature: temperature,
        requestType: requestType,
      },
      codeSnippet: code,
      basicPrompt: basicPrompt,
      codeIssue: codeIssue
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

  const getChangelog = () => {
    setLoading(true);
    Axios.post("http://localhost:5000/process_mr_url", {
      mr_url: mergeUrl,
    })
      .then((res) => {
        if (res.data.success) {
          setMergeUrlLabel("Gitlab url merge requesta " + res.data.mr_id);
          setChangelogInput(res.data.prompt);
          setChangelog(res.data.changelog);
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
  }

  return (
    <Container className="home" maxWidth="xl">
      <Grid container spacing={2}>
        <Grid xs={4} height="60px">
            <img src={zabaLogo} alt="ZABA logo"/>
        </Grid>
        <Grid xs={8} height="60px" textAlign={"left"} mt="15px">
          <Typography variant="h5">     ZaBaGPT Hackaton - AI Team Assistant</Typography>
        </Grid>
        </Grid>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
        centered
      >
        <Tab label="Code optimizer" {...a11yProps(0)} />
        <Tab label="Code translator" {...a11yProps(1)} />
        <Tab label="AI mentor" {...a11yProps(2)} />
        <Tab label="Code review" {...a11yProps(3)} />
        <Tab label="Commit review" {...a11yProps(4)} />
        <Tab label="Merge doc helper" {...a11yProps(5)} />
      </Tabs>
      <Grid xl={12} height="10px"></Grid>
      <Grid xl={12} height="10px">
        <Divider></Divider>
      </Grid>
      <Grid xl={12} height="10px"></Grid>
      {/*  Code optimizer (Mislav) */}
      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
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
                  handleCodeIssueChange={handleCodeIssueChange}
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
                  Send
                </Button>
              </Grid>
            </Box>
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mr: "-1px" }}
          ></Divider>
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
                  AI RESPONSE
                </Typography>
              </Grid>
              <Grid xs={12}>
                {!error && !loading && (requestType === 'CODE_REFACTOR' || requestType === 'CODE_ISSUE_FIX') && <ReviewCode review={review} readonly></ReviewCode>}
                {!error && !loading && (requestType === 'BASIC_PROMPT' || requestType === 'CODE_REVIEW') && <Review value={review} readonly></Review>}
                {loading && <CircularProgress color="success" />}
                {error && !loading && <Alert severity="error">{errorMessage}</Alert>}
              </Grid>

            </Box>
          </Grid>
        </Grid>
      </TabPanel>
      {/* Code translaator (Mislav) */}
      <TabPanel value={value} index={1}>
        <Grid container spacing={2}>
        </Grid>
      </TabPanel>
      {/* AI mentor (Mislav) */}
      <TabPanel value={value} index={2}>
        <TalkWithGpt></TalkWithGpt>
      </TabPanel>
      {/* Code review (Baki) */}
      <TabPanel value={value} index={3}>
        <Grid container spacing={2}>
        </Grid>
      </TabPanel>
      {/* Commit review (Baki) */}
      <TabPanel value={value} index={4}>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <Box sx={{ mb: 2 }}>
              <Grid xs={12}>
                <TextField
                  id="projectUrl"
                  label="Gitlab url projekta"
                  value={projectUrl}
                  onChange={handleChangeUserUrl}
                  fullWidth
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
                  Send
                </Button>
              </Grid>
            </Box>
            {commits.length !== 0 && (
              <>
                <List dense="true" className="commit-list">
                  {commits.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((element, index) => (
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
                <div className="pagination">
                  <IconButton onClick={handlePrev} disabled={page === 0}>
                    <ArrowBackIosIcon />
                  </IconButton>
                  <span>Page {page + 1}</span>
                  <IconButton onClick={handleNext} disabled={page === Math.floor(commits.length / itemsPerPage)}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </div>
              </>
            )}
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mr: "-1px" }}
          ></Divider>
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
                  PROMPT
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
                    AI RESPONSE
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
      </TabPanel>
      {/*  Merge Doc Helper (DanBi) */}
      <TabPanel value={value} index={5}>
        <Grid container spacing={2}>
          <Grid xs={6}>
            <Box sx={{ mb: 2 }}>
              <Grid xs={12}>
                <TextField
                  id="mergeUrl"
                  label={mergeUrlLabel}
                  value={mergeUrl}
                  onChange={handleChangeMergeUrl}
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <Button
                  size="medium"
                  variant="contained"
                  color="success"
                  endIcon={<SendIcon />}
                  onClick={() => {
                    getChangelog();
                  }}
                >
                  Send
                </Button>
              </Grid>
              <Grid xs={12}>
                <Divider></Divider>
              </Grid>
              <Grid xs={12} textAlign={"left"}>
                <Typography
                  variant="button"
                  display="block"
                  gutterBottom
                  fontWeight={"bold"}
                >
                  {" "}
                  PROMPT
                </Typography>
              </Grid>
              <Grid xs={12}>
                {!error && !loading && (
                  <Review value={changelogInput} readonly></Review>
                )}
                {loading && <CircularProgress color="success" />}
              </Grid>
            </Box>
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mr: "-1px" }}
          ></Divider>
          <Grid xs={6}>
            <Box sx={{ mb: 2 }}>
              <Grid xs={12}>
                <Grid xs={12} textAlign={"left"} height="142px">
                </Grid>
                <Grid xs={12} textAlign={"left"}>
                  <Typography
                    variant="button"
                    display="block"
                    gutterBottom
                    fontWeight={"bold"}
                  >
                    {" "}
                    AI RESPONSE
                  </Typography>
                </Grid>
                {!error && !loading && (
                  <Review value={changelog} readonly></Review>
                )}
                {loading && <CircularProgress color="success" />}
                {error && !loading && (
                  <Alert severity="error">{errorMessage}</Alert>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
}

export default Home;

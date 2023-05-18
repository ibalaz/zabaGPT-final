import TextareaAutosize from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

//border-radius: 12px 12px 0 12px;

function Review(props) {

  const StyledTextarea = styled(TextareaAutosize)(
    ({ theme }) => `
      font-family: IBM Plex Sans, sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 12px;
      color: #24292f;
      background: '#fff';
      border: 1px solid #6ab187;
    
      // firefox
      &:focus-visible {
        outline: 0;
      }
    `,
  );

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <StyledTextarea aria-label="empty textarea" placeholder="Empty" aria-multiline={true} minRows={3} maxRows={25} value={props.value} style={{ width: "100%" }} />
      </Grid>
    </Grid>
  );
}

export default Review;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalysisResult, PlateAnalysis } from '../types';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, ChipOwnProps, Container, IconButton, LinearProgress, useTheme } from '@mui/material';

const storage = getStorage();

const nutrientColorMap: Record<string, ChipOwnProps['color']> = {
  'carbohydrates': 'default',
  'fruit': 'warning',
  'fat': 'secondary',
  'vegetables': 'success',
  'protein': 'primary',
}
interface Prop {
  analysis: AnalysisResult;
}
const PlateAnalysisItem: React.FC<Prop> = ({ analysis }) => {

  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState<string>();

  const result = useMemo(() => {
    try {
      if (analysis.status?.state === 'COMPLETED') {
        return JSON.parse(analysis.output
          .replace(/```JSON/i, "")
          .replace("```", "")
          .replace(/\n/g, '')) as PlateAnalysis;
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [analysis]);

  const completed = analysis.status?.state === 'COMPLETED';
  const processing = analysis.status?.state === 'PROCESSING' || !result;
  const error = analysis.status?.state === 'ERRORED';
  const nutritionInfos = result?.nutrition_info.sort((a, b) => b.percentage - a.percentage);
  console.log('result', result);
  const downloadImage = useCallback(async () => {
    const storageRef = ref(storage, analysis.imagePath);
    const url = await getDownloadURL(storageRef);

    setImageUrl(url);
  }, [analysis.output])

  useEffect(() => {
    downloadImage();
  }, [downloadImage])

  return (
    // <Card sx={{ maxWidth: {
    //   xs: 345,
    //   sm: '100%',
    // }, display: {
    //   xs: 'block',
    //   sm: 'flex'
    // } }}>
    //   <CardActionArea>
    //   <CardMedia
    //     component="img"
    //     sx={{ width: {
    //       xs: '100%',
    //       sm: 151,
    //     }, height: 151 }}
    //     image={imageUrl}
    //     alt={result?.meal ?? 'picture of meal'}
    //     loading="lazy"
    //   />
    //     <CardContent>
    //       <Typography gutterBottom variant="h5" component="div">
    //         Lizard
    //       </Typography>
    //       <Typography variant="body2" color="text.secondary">
    //         Lizards are a widespread group of squamate reptiles, with over 6,000
    //         species, ranging across all continents except Antarctica
    //       </Typography>
    //     </CardContent>
    //   </CardActionArea>
    // </Card>
  

    <Card sx={{ maxWidth: {
      xs: 345,
      sm: '100%',
    }, display: {
      xs: 'block',
      sm: 'flex'
    } }}>
      <CardActionArea sx={{ display: {
        xs: 'block',
        sm: 'flex'
      } }}>
      <CardMedia
        component="img"
        sx={{ width: {
          xs: '100%',
          sm: 151,
        }, height: 151 }}
        image={imageUrl}
        alt={result?.meal ?? 'picture of meal'}
        loading="lazy"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 100%' }}>
          {error && <Typography color="error" variant="h5" component="div">
            Error
          </Typography>}
          
          {completed && !processing && <><Typography component="div" variant="h5">
            {result?.meal}
          </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {result?.meets_recommendation ? '✅ Meets recommendation' : '❌ Does not meet recommendation'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1, flexWrap: 'wrap' }}>
              {nutritionInfos?.map((nutrient, index) => (
                <Chip key={index} label={`${nutrient.type}:${Math.ceil(nutrient.percentage * 1000) / 10}%`}
                  color={nutrientColorMap[nutrient.type] ?? "primary"} variant="outlined" />
              ))}
            </Box>
            </>}
            {processing &&!error &&  <LinearProgress color="secondary" />}
        </CardContent>

      </Box>
      </CardActionArea>
    </Card>

    // <Grid container spacing={2}>
    //   <Grid xs={4} item>
    //     <Container>
    //       <img style={{ width: '100%' }} src={imageUrl} alt={result?.meal ?? 'picture of meal'} loading="lazy" />
    //     </Container>
    //   </Grid>
    //   <Grid xs={8} item>
    //     {completed && !processing && <Container>
    //       <Typography variant="h6" gutterBottom>
    //         {result?.meal}
    //       </Typography>
    //       {result?.meets_recommendation && <Chip label="Meets recommendation" color="success" variant="filled" />}
    //       {!result?.meets_recommendation && <Chip label="Does not meet recommendation" color="error" variant="filled" />}
    //       <Typography variant="subtitle1" gutterBottom>
    //         Nutrition Info
    //       </Typography>
    //       {nutritionInfos?.map((nutrient, index) => (
    //         <Chip key={index} label={`${nutrient.type}:${Math.ceil(nutrient.percentage * 1000) / 10}%`}
    //           color={nutrientColorMap[nutrient.type] ?? "primary"} variant="outlined" />
    //       ))}
    //     </Container>}
    //     {processing && <Container >

    //       <LinearProgress color="secondary" />
    //     </Container>}
    //   </Grid>
    // </Grid>

  );
};

export default PlateAnalysisItem;

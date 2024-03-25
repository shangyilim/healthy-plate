import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalysisResult, PlateAnalysis } from '../types';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Typography from '@mui/material/Typography';
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, ChipOwnProps, Container, IconButton, LinearProgress, Paper, useTheme } from '@mui/material';
import NutritionChips from './NutritionChips';

const storage = getStorage();

interface Prop {
  analysis: AnalysisResult;
  onClick: (item: PlateAnalysis, itemImgSrc: string) => void;
}
const PlateAnalysisItem: React.FC<Prop> = ({ analysis, onClick }) => {


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

  const downloadImage = useCallback(async () => {
    const storageRef = ref(storage, analysis.imagePath);
    const url = await getDownloadURL(storageRef);

    setImageUrl(url);
  }, [analysis.output])

  const handleItemClick = () => {
    if (!result || !imageUrl) {
      return;
    }
    onClick(result, imageUrl);
  }
  useEffect(() => {
    downloadImage();
  }, [downloadImage])

  return (
    <Card component={Paper} sx={{
      maxWidth: {
        xs: 345,
        sm: '100%',
      }, 
      display: {
        xs: 'block',
        sm: 'flex'
      },
      marginBottom: 1,
    }}>
      <CardActionArea sx={{
        display: {
          xs: 'block',
          sm: 'flex'
        }
      }} onClick={handleItemClick}>
        <CardMedia
          component="img"
          sx={{
            width: {
              xs: '100%',
              sm: 160,
              md: 200,
              lg: 280,
            }, height: {
              xs: 151,
              sm: 200,
            }
          }}
          image={imageUrl}
          alt={result?.meal ?? 'picture of meal'}
          loading="lazy"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column'  }}>
          <CardContent sx={{ flex: '1 0 100%' }}>
            {error && <Typography color="error" variant="h5" component="div">
              Error
            </Typography>}

            {completed && !processing && <>
              <Typography component="div" variant="h5">
                {result?.meal}
              </Typography>
              <Typography variant="subtitle2" component="div" gutterBottom>
                {result?.meets_recommendation ? '✅ Meets recommendation' : '❌ Does not meet recommendation'}
              </Typography>
              <NutritionChips nutritionInfos={nutritionInfos} />

              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </>
            }
            {processing && !error && <LinearProgress color="secondary" />}


          </CardContent>

        </Box>
      </CardActionArea>
    </Card>

  );
};

export default PlateAnalysisItem;

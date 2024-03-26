import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalysisResult, PlateAnalysis } from '../types';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import Typography from '@mui/material/Typography';
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, IconButton, LinearProgress, Paper, useTheme } from '@mui/material';
import NutritionChips from './NutritionChips';
import CloseIcon from '@mui/icons-material/Close';


const storage = getStorage();

interface Prop {
  analysis: AnalysisResult;
  onClick: (item: PlateAnalysis, itemImgSrc: string) => void;
  onDelete:(id: string)=> void;
}
const PlateAnalysisItem: React.FC<Prop> = ({ analysis, onClick, onDelete }) => {


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

  const handleItemDelete = () => {
    onDelete(analysis.docId);
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
              sm: 230,
            }
          }}
          image={imageUrl}
          alt={result?.meal ?? 'picture of meal'}
          loading="lazy"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>  
        <IconButton
        aria-label="close"
        onClick={handleItemDelete}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
          <CardContent sx={{ flex: '1 0 100%', paddingTop:5 }}>
          
            {error && <Typography color="error" variant="h5" component="div">
              Error
            </Typography>}

            {completed && !processing && <>
              <Typography component="div" variant="h5" gutterBottom>
                {result?.meal}
              </Typography>
              {result?.meets_recommendation  && typeof result.meets_recommendation === 'boolean' && <Typography variant="subtitle2" component="div" gutterBottom>
                {result.meets_recommendation ? '✅ Meets recommendation' : '❌ Does not meet recommendation'}
              </Typography>}
              <NutritionChips nutritionInfos={nutritionInfos} />

              <CardActions>
                <Button size="small" onClick={handleItemClick}>Learn More</Button>
              </CardActions>
            </>
            }
            {processing && !error && <LinearProgress color="secondary" />}


          </CardContent>

        </Box>
    </Card>

  );
};

export default PlateAnalysisItem;

import Box from '@mui/material/Box';
import React from 'react';
import { PlateAnalysis } from '../types';
import Chip, { ChipOwnProps } from '@mui/material/Chip';
import { ArrowDownwardRounded, ArrowUpwardRounded, CheckCircleOutlineRounded, ErrorOutlineRounded, ThumbUpAltRounded } from '@mui/icons-material';

interface Props {
  nutritionInfos?: PlateAnalysis['nutrition_info']
  recommend?: boolean;
}

const nutrientColorMap: Record<string, ChipOwnProps['color']> = {
  'carbohydrates': 'primary',
  'fat': 'default',
  'vegetables and fruit': 'secondary',
  'protein': 'warning',
}

const NutritionChips: React.FC<Props> = ({ nutritionInfos, recommend = false }) => {

  const checkNutritionRecommended = (nutrient: PlateAnalysis['nutrition_info'][0]) =>{
    const difference = Math.abs(getNutritionDifference(nutrient));
    return difference >= 0 && difference <= 5;
  }
   
  const getNutritionDifference = (nutrient: PlateAnalysis['nutrition_info'][0]) =>
    nutrient.recommended_percentage - nutrient.percentage;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pb: 1, flexWrap: 'wrap' }}>
      {nutritionInfos?.map((nutrient, index) => {

        const nutritionDiff = getNutritionDifference(nutrient);

        if (nutritionDiff >=0  && nutritionDiff <5 &&  recommend) {
          return <Chip
            key={index}
            label={`${nutrient.type}`}
            sx={{ mr: 0.5, mb: 0.5 }}
            color="success"
            variant="filled"
            icon={<ThumbUpAltRounded fontSize='small' />}
          />
        }
        return (recommend ?
          <Chip
            key={index}
            label={`${Math.abs(nutritionDiff)}% ${nutrient.type}`}
            sx={{ mr: 0.5, mb: 0.5 }}
            color={nutrientColorMap[nutrient.type.toLowerCase()] ?? "primary"}
            variant="outlined"
            icon={nutritionDiff < 0 ?
              <ArrowDownwardRounded /> :
              <ArrowUpwardRounded />}
          /> : <Chip
            key={index}
            label={`${nutrient.percentage}%  ${nutrient.type}`}
            sx={{ mr: 0.5, mb: 0.5 }}
            color={nutrientColorMap[nutrient.type.toLowerCase()] ?? "primary"}
            variant="outlined"
            icon={checkNutritionRecommended(nutrient) ?
              <CheckCircleOutlineRounded /> :
              <ErrorOutlineRounded />}
          />)
      })}
    </Box>
  );
};

export default NutritionChips;

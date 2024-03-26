import { FC, useEffect, useMemo, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { PlateAnalysis } from '../types';
import { Box, Card, CardContent, CardMedia, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import NutritionChips from './NutritionChips';

interface Props {
  open: boolean;
  item?: PlateAnalysis;
  itemImgSrc?: string;
  onClose: () => void;
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
export const PlateAnalysisItemModal: FC<Props> = ({ open, item, itemImgSrc, onClose }) => {

  const contentElementRef = useRef<HTMLDivElement>(null);
  const ingredientsGroupByType = useMemo(() => {

    if (!item?.ingredients) {
      return [];
    }

    return Object.entries(item.ingredients.reduce<Record<string, string>>((acc, ingredient) => {
      const type = ingredient.type;
      if (!acc[type]) {
        acc[type] = ingredient.name;
        return acc;
      }

      acc[type] = `${acc[type]}, ${ingredient.name}`;
      return acc;
    }, {}));

  }, [item?.ingredients]);




  useEffect(() => {
    if (open) {
      const { current: contentElement } = contentElementRef;
      if (contentElement !== null) {
        contentElement.focus();
      }
    }
  }, [open]);

  return <>
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      scroll='paper'

    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[900],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent style={{ padding: "0px" }} ref={contentElementRef} tabIndex={-1}>
        <Card sx={{
          maxWidth: {
            xs: 345,
            sm: '100%',
          }, display: 'block'
        }}>

          <CardMedia
            component="img"
            sx={{
              width: '100%', height: {
                xs: 151,
                sm: 230,
                md: 280,
                
              }
            }}
            image={itemImgSrc}
            alt={item?.meal ?? 'picture of meal'}
            loading="lazy"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: '1 0 100%' }}>


              <Typography component="div" variant="h5" gutterBottom>
                {item?.meal}
              </Typography>
              <Typography variant="subtitle1" component="div">
                {item?.meets_recommendation ? '✅ Meets recommendation' : '❌ Does not meet recommendation'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {item?.conclusion}
              </Typography>
              <Typography variant="subtitle2" component="div" paddingTop={1} gutterBottom >
                Nutrition composition
              </Typography>
              <NutritionChips nutritionInfos={item?.nutrition_info} />
              <Typography variant="subtitle2" component="div" paddingTop={1} gutterBottom >
                Recommended intake
              </Typography>
              <NutritionChips nutritionInfos={item?.nutrition_info} recommend />
              <Typography variant="subtitle2" component="div" paddingTop={1} gutterBottom >
                Whats on the plate
              </Typography>
              <TableContainer component="div">
                <Table sx={{
                  width: '100%', display: {
                    xs: 'none',
                    sm: 'table',
                  }
                }} aria-label="ingredients table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="left">Ingredients</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ingredientsGroupByType.map(([type, ingredients]) => (
                      <TableRow
                        key={type}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize' }}>
                          {type}
                        </TableCell>
                        <TableCell align="left">{ingredients}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{
                display: {
                  xs: 'block',
                  sm: 'none',
                }
              }}>
                {ingredientsGroupByType.map(([type, ingredients]) => (
                  <Box>
                    <Typography variant="caption"  component="div" sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </Typography>
                    <Typography variant="subtitle2"
                      component="div"
                      color="text.secondary" 
                      sx={{ textTransform: 'capitalize' }} 
                      gutterBottom>
                      {ingredients}
                    </Typography>
                  </Box>

                ))}</Box>
            </CardContent>

          </Box>
        </Card>
      </DialogContent>

    </BootstrapDialog>
  </>;
};

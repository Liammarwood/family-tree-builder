import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Modal,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import Cropper from 'react-easy-crop';

// Utility: Crop the image from the Cropper
async function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return canvas.toDataURL('image/png');
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export default function ImageModal({cropSrc, open, onClose, saveImage}: {cropSrc: string | undefined; open: boolean; onClose: () => void; saveImage: (img: string) => void;}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSaveCropped = useCallback(async () => {
    if (!cropSrc || !croppedAreaPixels) return;

    const cropped = await getCroppedImg(cropSrc, croppedAreaPixels);
    saveImage(cropped);
    onClose();
  }, [cropSrc, croppedAreaPixels]);

  return (
    <Modal
      open={open}
      onClose={() => onClose()}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 6,
          width: 400,
          p: 2,
        }}
      >
        <Typography variant="h6" mb={1}>
          Crop your avatar
        </Typography>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 300,
            bgcolor: 'black',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {cropSrc && (
            <Cropper
              image={cropSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Zoom</Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, z) => setZoom(z as number)}
          />
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
          <Button onClick={() => onClose()}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCropped}>
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

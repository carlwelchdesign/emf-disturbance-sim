'use client';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, IconButton } from '@mui/material';
import { ControlPanel } from '../ControlPanel/ControlPanel';

interface ControlPanelRailProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function ControlPanelRail({ open, onOpen, onClose }: ControlPanelRailProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: open ? 320 : 48,
        minWidth: open ? 320 : 48,
        maxWidth: open ? 320 : 48,
        flexShrink: 0,
        zIndex: 30,
        pointerEvents: 'auto',
      }}
    >
      {open ? (
        <>
          <ControlPanel />
          <IconButton
            aria-label="Hide control panel"
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 20,
              bgcolor: 'rgba(2, 6, 23, 0.72)',
              color: 'rgba(226, 232, 240, 0.95)',
              '&:hover': {
                bgcolor: 'rgba(2, 6, 23, 0.88)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <Box
          sx={{
            width: 48,
            height: '100%',
            borderLeft: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            pt: 1,
            bgcolor: 'background.default',
          }}
        >
          <IconButton
            aria-label="Show control panel"
            onClick={onOpen}
            sx={{
              bgcolor: 'rgba(2, 6, 23, 0.72)',
              color: 'rgba(226, 232, 240, 0.95)',
              '&:hover': {
                bgcolor: 'rgba(2, 6, 23, 0.88)',
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
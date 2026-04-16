'use client';

import { PropsWithChildren, KeyboardEvent, ReactNode } from 'react';
import { Box, Collapse, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SidebarSectionId } from '../../types/store.types';
import { getSectionHeaderId, getNextSectionId, getPreviousSectionId, focusSectionHeader } from '../../lib/sidebar-a11y';

export interface SectionPanelProps extends PropsWithChildren {
  sectionId: SidebarSectionId;
  title: string;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  ariaDescription?: string;
  headerActions?: ReactNode;
}

export function SectionPanel({
  sectionId,
  title,
  expanded = true,
  onToggleExpanded,
  ariaDescription,
  headerActions,
  children,
}: SectionPanelProps) {
  const isCollapsible = Boolean(onToggleExpanded);

  const handleHeaderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusSectionHeader(getNextSectionId(sectionId));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusSectionHeader(getPreviousSectionId(sectionId));
    } else if ((event.key === 'Enter' || event.key === ' ') && isCollapsible) {
      event.preventDefault();
      onToggleExpanded?.();
    }
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        px: 2,
        py: 1.5,
      }}
      data-testid={`section-panel-${sectionId}`}
    >
      <Box
        id={getSectionHeaderId(sectionId)}
        tabIndex={0}
        role="heading"
        aria-level={2}
        aria-label={ariaDescription ?? title}
        onKeyDown={handleHeaderKeyDown}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          outline: 'none',
          borderRadius: 1,
          '&:focus-visible': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {headerActions}
          {isCollapsible && (
            <IconButton
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
              size="small"
              onClick={onToggleExpanded}
              sx={{
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 150ms ease',
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {isCollapsible ? <Collapse in={expanded}>{children}</Collapse> : children}
    </Box>
  );
}

import { SidebarSectionId } from '../types/store.types';

export const SIDEBAR_SECTION_ORDER: SidebarSectionId[] = [
  'simulation-setup',
  'active-entities',
  'selected-entity',
  'visualization-controls',
  'analysis-measurements',
  'system-view',
];

export const SIDEBAR_SECTION_TITLES: Record<SidebarSectionId, string> = {
  'simulation-setup': 'Simulation Setup',
  'active-entities': 'Active Entities',
  'selected-entity': 'Selected Entity',
  'visualization-controls': 'Visualization Controls',
  'analysis-measurements': 'Analysis / Measurements',
  'system-view': 'System / View',
};

export const SIDEBAR_SECTION_DEFAULT_EXPANDED: Record<SidebarSectionId, boolean> = {
  'simulation-setup': true,
  'active-entities': true,
  'selected-entity': true,
  'visualization-controls': true,
  'analysis-measurements': true,
  'system-view': true,
};

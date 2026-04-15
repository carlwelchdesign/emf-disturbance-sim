import { SidebarSectionId } from '../types/store.types';
import { SIDEBAR_SECTION_ORDER } from './sidebar-layout';

export function getNextSectionId(sectionId: SidebarSectionId): SidebarSectionId {
  const index = SIDEBAR_SECTION_ORDER.indexOf(sectionId);
  if (index === -1 || index === SIDEBAR_SECTION_ORDER.length - 1) {
    return SIDEBAR_SECTION_ORDER[0];
  }

  return SIDEBAR_SECTION_ORDER[index + 1];
}

export function getPreviousSectionId(sectionId: SidebarSectionId): SidebarSectionId {
  const index = SIDEBAR_SECTION_ORDER.indexOf(sectionId);
  if (index <= 0) {
    return SIDEBAR_SECTION_ORDER[SIDEBAR_SECTION_ORDER.length - 1];
  }

  return SIDEBAR_SECTION_ORDER[index - 1];
}

export function getSectionHeaderId(sectionId: SidebarSectionId): string {
  return `sidebar-section-header-${sectionId}`;
}

export function focusSectionHeader(sectionId: SidebarSectionId) {
  const target = document.getElementById(getSectionHeaderId(sectionId));
  target?.focus();
}

import { ComponentType } from 'react';

export interface GameInfo {
  id: string;
  title: string;
  description: string;
  href: string;
  thumbnail: ComponentType;
  desktopOnly?: boolean;
}

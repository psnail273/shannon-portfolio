export interface GalleryImageType {
  src: string;
  alt: string;
  slug: string;
  name: string;
  description: string;
  date: string;
  width: number;
  height: number;
  types: string[];
  extras?: string[];
}

export interface ProjectImageType {
  src: string;
  alt: string;
  width: number;
  height: number;
  order: number;
}

export interface ProjectType {
  slug: string;
  title: string;
  description: string;
  date: string;
  protected: boolean;
  types: string[];
  images: ProjectImageType[];
}
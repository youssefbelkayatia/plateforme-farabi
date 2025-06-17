import { Injectable } from '@angular/core';

export interface GalleryImage {
  path: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor() { }
  
  getGalleryImages(): GalleryImage[] {
    return [
      { path: './assets/images/f0.jpg', title: 'Club Farabi' },
      { path: './assets/images/f1.jpg', title: 'Club Farabi' },
      { path: './assets/images/f2.jpg', title: 'Performance' },
      { path: './assets/images/f3.jpg', title: 'Concert' },
      { path: './assets/images/f4.jpg', title: 'Festival' },
      { path: './assets/images/f5.jpg', title: 'Événement' }
    ];
  }
}


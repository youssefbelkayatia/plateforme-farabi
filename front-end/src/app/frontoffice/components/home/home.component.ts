import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { ImageService, GalleryImage } from '../../../services/image.service';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Property to track if the timeline is expanded
  isTimelineExpanded = false;
  
  // Gallery images
  galleryImages: GalleryImage[] = [];
  
  // Carousel properties
  currentImageIndex = 0;
  
  // Lightbox properties
  showLightbox = false;
  currentImage = '';
  
  constructor(private imageService: ImageService) {}
  
  ngOnInit(): void {
    this.galleryImages = this.imageService.getGalleryImages();
  }
  
  // Method to toggle timeline expansion
  toggleTimelineExpand() {
    this.isTimelineExpanded = !this.isTimelineExpanded;
  }
  
  // Carousel navigation methods
  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
  }
  
  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }
  
  // Method to open the lightbox
  openLightbox(imageSrc: string) {
    this.currentImage = imageSrc;
    this.showLightbox = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  }
  
  // Method to close the lightbox
  closeLightbox() {
    this.showLightbox = false;
    document.body.style.overflow = ''; // Re-enable scrolling
  }
}

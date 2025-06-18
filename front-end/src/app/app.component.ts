import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'front-end';
  isIOSSafari = false;
  
  ngOnInit() {
    // Detect iOS Safari for special handling
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    this.isIOSSafari = isIOS && isSafari;
    
    if (this.isIOSSafari) {
      console.log('iOS Safari detected in app component');
      // Add iOS-specific body class
      document.body.classList.add('ios-safari');
    }
    
    // Log application initialization
    console.log('App component initialized');
  }
}

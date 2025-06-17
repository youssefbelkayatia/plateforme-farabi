import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { ChansonService } from '../../../services/ChansonService';
import { InstrumentalService } from '../../../services/instrumental.service';
import { Chanson } from '../../../Model/chanson';
import { Instrumental } from '../../../Model/Instrumental';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';



// SafePipe for sanitizing URLs
@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(url: string | SafeResourceUrl): SafeResourceUrl {
    if (typeof url === 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return url;
  }
}

interface Song {
  id: number;
  title: string;
  composer: string;
  singer: string;
  lyricist: string;
  year: number;
  category: string;
  duration: string;
  origin: string;
  audioUrl: string;
  lyricsImageUrl: string;
  partitionUrl: string;
}

@Component({
  selector: 'app-repertoire-musical',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, HttpClientModule],
  templateUrl: './repertoire-musical.component.html',
  styleUrl: './repertoire-musical.component.css',
  providers: [ChansonService, InstrumentalService]
})
export class RepertoireMusicalComponent implements OnInit, AfterViewInit {
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedOrigin: string = '';
  showLyricsModal: boolean = false;
  currentLyricsImage: string = '';
  currentLyricsTitle: string = '';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  
  songs: Song[] = [];
  chansons: Chanson[] = [];
  instrumentals: Song[] = [];
  instrumentalData: Instrumental[] = [];
  
  // Tab selection
  activeTab: 'chansons' | 'instrumentals' = 'chansons';
  
  categories: string[] = [];
  origins: string[] = [];

  // Audio player properties
  showAudioModal: boolean = false;
  currentAudioUrl: string = '';
  currentAudioTitle: string = '';
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  volume: number = 1.0;
  isMuted: boolean = false;
  previousVolume: number = 1.0;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  // Added properties
  currentPartition: any;



  constructor(
    private chansonService: ChansonService,
    private instrumentalService: InstrumentalService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.loadChansons();
    this.loadInstrumentals();
  }

  ngAfterViewInit() {
    // Any initialization that requires the view to be ready
  }

  loadChansons(): void {
    this.chansonService.getAllChansons().subscribe({
      next: (data) => {
        this.chansons = data;
        console.log('Chansons loaded:', this.chansons);
        
        if (this.chansons && this.chansons.length > 0) {
          // Map Chanson objects to Song objects if API returns data
          this.mapChansonsToSongs();
        } else {
          // Use fallback data if API returns empty
          console.log('Using fallback song data');
         
        }
        
        // Update categories and origins
        this.updateCategoriesAndOrigins();
      },
      error: (error) => {
        console.error('Error loading chansons:', error);
        // Use fallback data on error
        console.log('Using fallback song data due to API error');
        
        this.updateCategoriesAndOrigins();
      }
    });
  }

  loadInstrumentals(): void {
    this.instrumentalService.getAllInstrumentals().subscribe({
      next: (data) => {
        console.log('Instrumentals loaded:', data);
        
        // Convert instrumentals to Song format
        const instrumentalSongs = data.map(item => {
          return {
            id: item.id || 0,
            title: item.titre || '',
            composer: item.compositeur || 'Inconnu',
            singer: '-',
            lyricist: '-',
            year: item.annee || 0,
            category: 'Instrumental',
            duration: '5:00',
            origin: 'Tunisien',
            audioUrl: item.audio ? `data:audio/mp3;base64,${item.audio}` : '',
            lyricsImageUrl: '',
            partitionUrl: item.fichierPartition ? `data:application/pdf;base64,${item.fichierPartition}` : ''
          };
        });
        
        this.instrumentals = instrumentalSongs;
        this.updateCategoriesAndOrigins();
      },
      error: (error) => {
        console.error('Error loading instrumentals:', error);
      }
    });
  }

  mapChansonsToSongs(): void {
    this.songs = this.chansons.map(chanson => {
      // Prepare URLs for media files
      let audioUrl = '';
      let lyricsImageUrl = '';
      let partitionUrl = '';
      
      // Handle audio file
      if (chanson.audio) {
        audioUrl = `data:audio/mp3;base64,${chanson.audio}`;
      }
      
      // Handle lyrics image
      if (chanson.paroles) {
        lyricsImageUrl = `data:image/jpeg;base64,${chanson.paroles}`;
      }
      
      // Handle partition PDF
      if (chanson.fichierPartition) {
        partitionUrl = `data:application/pdf;base64,${chanson.fichierPartition}`;
      }
      
      // Create a song object with all required properties
      const song: Song = {
        id: chanson.idDemande || 0,
        title: chanson.titre || '',
        composer: chanson.compositeur || 'Inconnu',
        singer: chanson.chanteur || 'Inconnu',
        lyricist: chanson.parolier || 'Inconnu',
        year: chanson.annee || 0,
        category: chanson.type || 'Non classé',
        duration: '5:00', // Default duration
        origin: 'Tunisien', // Default origin
        audioUrl: audioUrl,
        lyricsImageUrl: lyricsImageUrl,
        partitionUrl: partitionUrl
      };
      
      return song;
    });
    
    // Filter out instrumentals from the main songs array
    this.songs = this.songs.filter(song => {
      const songData = this.chansons.find(c => c.idDemande === song.id);
      return songData && songData.type !== 'Instrumental';
    });
    
    this.updateCategoriesAndOrigins();
  }

  mapInstrumentalsToSongs(): void {
    this.instrumentals = this.instrumentalData.map(instrumental => {
      // Prepare URLs for media files
      let audioUrl = '';
      let partitionUrl = '';
      
      // Handle audio file
      if (instrumental.audio) {
        audioUrl = `data:audio/mp3;base64,${instrumental.audio}`;
      }
      
      // Handle partition PDF
      if (instrumental.fichierPartition) {
        partitionUrl = `data:application/pdf;base64,${instrumental.fichierPartition}`;
      }
      
      const song: Song = {
        id: instrumental.id || 0,
        title: instrumental.titre || '',
        composer: instrumental.compositeur || 'Inconnu',
        singer: '-', // Not applicable for instrumentals
        lyricist: '-', // Not applicable for instrumentals
        year: instrumental.annee || 0,
        category: 'Instrumental', // Fixed category for instrumentals
        duration: '5:00', // Default duration
        origin: 'Tunisien', // Default origin
        audioUrl: audioUrl,
        lyricsImageUrl: '', // No lyrics for instrumentals
        partitionUrl: partitionUrl
      };
      
      return song;
    });
  }

  updateCategoriesAndOrigins(): void {
    // Combine songs and instrumentals for categories and origins
    const allItems = [...this.songs, ...this.instrumentals];
    
    // Update categories based on available songs
    this.categories = [...new Set(allItems.map(song => song.category))];
    this.origins = [...new Set(allItems.map(song => song.origin))];
  }

  get filteredSongs(): Song[] {
    // Choose the correct array based on active tab
    const sourceArray = this.activeTab === 'chansons' ? this.songs : this.instrumentals;
    
    return sourceArray.filter(song => {
      // Filter by search term
      const matchesSearch = this.searchTerm === '' || 
        song.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        song.composer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (this.activeTab === 'chansons' && song.singer.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (this.activeTab === 'chansons' && song.lyricist.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      // Filter by category
      const matchesCategory = this.selectedCategory === '' || song.category === this.selectedCategory;
      
      // Filter by origin
      const matchesOrigin = this.selectedOrigin === '' || song.origin === this.selectedOrigin;
      
      return matchesSearch && matchesCategory && matchesOrigin;
    });
  }

  get paginatedSongs(): Song[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSongs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredSongs.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Scroll to top of the song list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // For backward compatibility with existing code
  prevPage(): void {
    // Keep this empty method for backward compatibility
  }
  
  nextPage(): void {
    // Keep this empty method for backward compatibility
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedOrigin = '';
    this.currentPage = 1; // Reset to first page when filters change
    // Keep the active tab as is
  }

  openLyricsModal(imageUrl: string, title: string): void {
    this.currentLyricsImage = imageUrl;
    this.currentLyricsTitle = title;
    this.showLyricsModal = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  closeLyricsModal(): void {
    this.showLyricsModal = false;
    document.body.style.overflow = ''; // Restore scrolling
  }

  downloadLyrics(): void {
    // Check if the image URL is a base64 string or a file path
    if (this.currentLyricsImage.startsWith('data:')) {
      // For base64 data from API
    const link = document.createElement('a');
    link.href = this.currentLyricsImage;
    link.download = `paroles-${this.currentLyricsTitle.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    } else {
      // For file paths from fallback data
      fetch(this.currentLyricsImage)
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `paroles-${this.currentLyricsTitle.toLowerCase().replace(/\s+/g, '-')}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch(error => {
          console.error('Error downloading lyrics:', error);
        });
    }
  }

  playAudio(audioUrl: string, title: string): void {
    this.currentAudioUrl = audioUrl;
    this.currentAudioTitle = title;
    this.showAudioModal = true;
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    
    // Reset audio state
    this.isPlaying = false;
    this.currentTime = 0;
    
    // We'll initialize the audio element in the modal after it's shown
    setTimeout(() => {
      if (this.audioPlayer) {
        this.audioPlayer.nativeElement.load();
      }
    }, 100);
  }
  
  closeAudioModal(): void {
    // Stop audio playback
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.pause();
    }
    this.showAudioModal = false;
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  togglePlayPause(): void {
    if (!this.audioPlayer) return;
    
    if (this.isPlaying) {
      this.audioPlayer.nativeElement.pause();
    } else {
      this.audioPlayer.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }
  
  skipForward(): void {
    if (!this.audioPlayer) return;
    this.audioPlayer.nativeElement.currentTime += 5;
  }
  
  skipBackward(): void {
    if (!this.audioPlayer) return;
    this.audioPlayer.nativeElement.currentTime -= 5;
  }
  
  updateProgress(): void {
    if (!this.audioPlayer) return;
    this.currentTime = this.audioPlayer.nativeElement.currentTime;
    this.duration = this.audioPlayer.nativeElement.duration || 0;
  }
  
  setProgress(event: any): void {
    if (!this.audioPlayer || !this.duration) return;
    const progressBar = event.target;
    const clickPosition = event.offsetX / progressBar.offsetWidth;
    this.audioPlayer.nativeElement.currentTime = clickPosition * this.duration;
  }
  
  formatTime(time: number): string {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  onAudioEnded(): void {
    this.isPlaying = false;
    this.currentTime = 0;
  }

  // Get a specific chanson by ID from the API
  getChansonDetails(id: number): void {
    this.chansonService.getChansonById(id).subscribe({
      next: (chanson) => {
        console.log('Chanson details:', chanson);
        // You can use this data to show more details or perform other actions
      },
      error: (error) => {
        console.error('Error fetching chanson details:', error);
      }
    });
  }

  // Load a specific song by ID
  loadSongById(id: number): void {
    this.chansonService.getChansonById(id).subscribe({
      next: (chanson) => {
        // Create a Song object from the Chanson data
        const song: Song = {
          id: chanson.idDemande || 0,
          title: chanson.titre,
          composer: chanson.compositeur || 'Unknown',
          singer: chanson.chanteur,
          lyricist: chanson.parolier || 'Unknown',
          year: chanson.annee || 0,
          category: chanson.type || 'Unknown',
          duration: '0:00', // This info is not available in the Chanson model
          origin: 'Unknown', // This info is not available in the Chanson model
          audioUrl: chanson.audio ? `data:audio/mp3;base64,${chanson.audio}` : '',
          lyricsImageUrl: chanson.paroles ? `data:image/jpeg;base64,${chanson.paroles}` : '',
          partitionUrl: chanson.fichierPartition ? `data:application/pdf;base64,${chanson.fichierPartition}` : ''
        };
        
        // Use the song object - for example, display it or add it to the songs array
        console.log('Loaded song by ID:', song);
        
        // If audio is available, play it
        if (song.audioUrl) {
          this.playAudio(song.audioUrl, song.title);
        }
        
        // If lyrics are available, you might want to show them
        if (song.lyricsImageUrl) {
          this.openLyricsModal(song.lyricsImageUrl, song.title);
        }
      },
      error: (error) => {
        console.error('Error loading song:', error);
      }
    });
  }

  // Method to switch between tabs
  setActiveTab(tab: 'chansons' | 'instrumentals'): void {
    this.activeTab = tab;
    this.currentPage = 1; // Reset to first page when switching tabs
  }

  // Method to open partition in a new tab/window
  openPartitionModal(partitionUrl: string, title: string): void {
    if (partitionUrl) {
      if (partitionUrl.startsWith('data:application/pdf;base64,')) {
        // Extract base64 data
        const base64Data = partitionUrl.split(',')[1];
        
        try {
          // Convert base64 to binary
          const binaryData = atob(base64Data);
          
          // Create array buffer
          const arrayBuffer = new ArrayBuffer(binaryData.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Fill array with binary data
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }
          
          // Create blob and object URL
          const blob = new Blob([uint8Array], { type: 'application/pdf' });
          const objectUrl = URL.createObjectURL(blob);
          
          // Open in new tab
          window.open(objectUrl, '_blank');
        } catch (error) {
          console.error('Error processing PDF data:', error);
        }
      } else {
        // Regular URL, open directly
        window.open(partitionUrl, '_blank');
      }
    } else {
      console.log('No partition available for:', title);
    }
  }
}
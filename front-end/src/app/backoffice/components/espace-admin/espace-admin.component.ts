import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChansonService } from '../../../services/ChansonService';
import { InstrumentalService } from '../../../services/instrumental.service';
import { Chanson } from '../../../Model/chanson';
import { Instrumental } from '../../../Model/Instrumental';
import { MakamType } from '../../../Model/MakamType.enum';
import { ChansonType } from '../../../Model/ChansonType.enum';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartitionService } from '../../../services/partition.service';

@Component({
  selector: 'app-espace-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './espace-admin.component.html',
  styleUrl: './espace-admin.component.css',
  providers: [ChansonService, InstrumentalService, PartitionService]
})
export class EspaceAdminComponent implements OnInit {
  chansons: Chanson[] = [];
  instrumentals: Chanson[] = []; // Instrumentals converted to Chanson format for display
  selectedChanson: Chanson | null = null;
  selectedInstrumental: Instrumental | null = null;
  isEditing: boolean = false;
  isAdding: boolean = false;
  isAddingInstrumental: boolean = false;
  isEditingInstrumental: boolean = false;
  chansonForm: FormGroup;
  instrumentalForm: FormGroup;
  
  // Tab selection
  activeTab: 'chansons' | 'instrumentals' = 'chansons';
  
  // File inputs
  parolesFile: File | null = null;
  partitionFile: File | null = null;
  audioFile: File | null = null;
  
  // Filter and search
  searchTerm: string = '';
  selectedType: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Properties for multiple partition images
  isMultiplePartitionImages: boolean = false;
  partitionImages: File[] = [];
  partitionImagesPreview: string[] = [];
  partitionPdfTitle: string = '';
  
  // Properties for modal success message
  modalSuccessMessage: string = '';
  showModalSuccess: boolean = false;
  
  // Properties for modal error message
  modalErrorMessage: string = '';
  showModalError: boolean = false;
  
  constructor(
    private chansonService: ChansonService,
    private instrumentalService: InstrumentalService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private partitionService: PartitionService
  ) {
    this.chansonForm = this.fb.group({
      titre: ['', Validators.required],
      chanteur: ['', Validators.required],
      compositeur: [''],
      parolier: [''],
      type: [''],
      annee: [null],
      rythme: [''],
      makam: ['']
    });
    
    this.instrumentalForm = this.fb.group({
      titre: ['', Validators.required],
      compositeur: [''],
      annee: [null],
      rythme: [''],
      makam: [''],
      type: [ChansonType.Instrumental]
    });
  }
  
  // Get all available makam types
  get makamTypes(): string[] {
    return Object.values(MakamType);
  }
  
  // Get all available chanson types
  get chansonTypes(): string[] {
    return Object.values(ChansonType);
  }
  
  ngOnInit(): void {
    this.loadChansons();
  }
  
  loadChansons(): void {
    this.isLoading = true;
    this.chansonService.getAllChansons().subscribe({
      next: (data) => {
        // Filter out instrumentals if they were included in chansons
        this.chansons = data.filter(chanson => chanson.type !== ChansonType.Instrumental);
        this.loadInstrumentals();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des chansons';
        console.error('Error loading songs:', error);
        this.isLoading = false;
      }
    });
  }
  
  loadInstrumentals(): void {
    this.instrumentalService.getAllInstrumentals().subscribe({
      next: (data) => {
        // Convert instrumentals to chanson format for display in the same list
        this.instrumentals = data.map(instrumental => {
          return {
            idDemande: instrumental.id,
            titre: instrumental.titre,
            chanteur: '', // Instrumentals don't have a singer
            compositeur: instrumental.compositeur,
            type: ChansonType.Instrumental,
            annee: instrumental.annee,
            rythme: instrumental.rythme,
            makam: instrumental.makam
          };
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des instrumentaux';
        console.error('Error loading instrumentals:', error);
        this.isLoading = false;
      }
    });
  }

  // Change active tab
  setActiveTab(tab: 'chansons' | 'instrumentals'): void {
    this.activeTab = tab;
    this.currentPage = 1; // Reset to first page when changing tabs
    this.resetFilters();
  }
  
  get filteredItems(): Chanson[] {
    // Determine which array to filter based on active tab
    const items = this.activeTab === 'chansons' ? this.chansons : this.instrumentals;
    
    return items.filter(item => {
      const matchesSearch = this.searchTerm === '' || 
        item.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.chanteur && item.chanteur.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (item.compositeur && item.compositeur.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesType = this.selectedType === '' || item.type === this.selectedType;
      
      return matchesSearch && matchesType;
    });
  }
  
  get paginatedItems(): Chanson[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredItems.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }
  
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.currentPage = 1;
  }
  
  selectChanson(chanson: Chanson): void {
    if (this.activeTab === 'chansons') {
      this.selectedChanson = chanson;
      this.isEditing = true;
      this.isAdding = false;
      this.initChansonForm(chanson);
      this.preventBodyScroll(true);
    } else if (this.activeTab === 'instrumentals') {
      this.selectInstrumental(chanson);
    }
  }

  selectInstrumental(chanson: Chanson): void {
    if (!chanson.idDemande) {
      this.errorMessage = 'ID d\'instrumental invalide';
      return;
    }

    this.isLoading = true;
    
    // Get the full instrumental data
    this.instrumentalService.getInstrumentalById(chanson.idDemande).subscribe({
      next: (instrumental) => {
        this.selectedInstrumental = instrumental;
        this.isEditingInstrumental = true;
        this.isAddingInstrumental = true; // To show the modal
        this.isEditing = false;
        this.isAdding = false;
        
        // Fill the form with instrumental data
        this.instrumentalForm.patchValue({
          titre: instrumental.titre,
          compositeur: instrumental.compositeur || '',
          annee: instrumental.annee || null,
          rythme: instrumental.rythme || '',
          makam: instrumental.makam || '',
          type: ChansonType.Instrumental
        });
        
        // Reset file inputs
        this.partitionFile = null;
        this.audioFile = null;
        
        // Add modal-open class to body
        this.renderer.addClass(document.body, 'modal-open');
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement de l\'instrumental';
        console.error('Error loading instrumental:', error);
        this.isLoading = false;
      }
    });
  }
  
  startAddChanson(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.selectedChanson = null;
    this.initChansonForm();
    this.preventBodyScroll(true);
  }
  
  cancelEdit(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.isAddingInstrumental = false;
    this.isEditingInstrumental = false;
    this.selectedChanson = null;
    this.selectedInstrumental = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.showModalSuccess = false;
    this.modalSuccessMessage = '';
    this.showModalError = false;
    this.modalErrorMessage = '';
    this.parolesFile = null;
    this.partitionFile = null;
    this.audioFile = null;
    this.isMultiplePartitionImages = false;
    this.partitionImages = [];
    this.partitionImagesPreview = [];
    this.partitionPdfTitle = '';
    this.renderer.removeClass(document.body, 'modal-open');
    this.preventBodyScroll(false);
  }
  
  startAddInstrumental(): void {
    this.isAddingInstrumental = true;
    this.isEditingInstrumental = false;
    this.isAdding = false;
    this.isEditing = false;
    this.selectedChanson = null;
    this.selectedInstrumental = null;
    
    this.instrumentalForm.reset();
    this.instrumentalForm.patchValue({ type: ChansonType.Instrumental });
    
    // Reset file inputs
    this.parolesFile = null;
    this.partitionFile = null;
    this.audioFile = null;
    
    // Add modal-open class to body
    this.renderer.addClass(document.body, 'modal-open');
  }
  
  onParolesFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.parolesFile = event.target.files[0];
    }
  }
  
  onPartitionFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.partitionFile = event.target.files[0];
    }
  }
  
  onAudioFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.audioFile = event.target.files[0];
    }
  }
  
  // Method to handle selection of multiple partition images
  onPartitionImagesChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Clear previous selections
      this.partitionImages = [];
      this.partitionImagesPreview = [];
      
      // Add new files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.includes('image/')) {
          this.partitionImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.partitionImagesPreview.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }
  
  // Method to remove a partition image
  removePartitionImage(index: number): void {
    this.partitionImages.splice(index, 1);
    this.partitionImagesPreview.splice(index, 1);
  }
  
  // Helper method to process saving chanson after handling partition images
  private processSaveChanson(chansonData: any): void {
    if (this.isAdding) {
      // Check if required files are selected
      if (!this.parolesFile || !this.partitionFile) {
        this.showModalError = true;
        this.modalErrorMessage = 'Veuillez sélectionner les fichiers requis (paroles et partition)';
        this.isLoading = false;
        return;
      }
      
      // Create new chanson
      this.chansonService.createChansonWithFiles(
        chansonData,
        this.parolesFile,
        this.partitionFile,
        this.audioFile || undefined
      ).subscribe({
        next: (response) => {
          // Show success message in the modal
          this.showModalSuccess = true;
          this.modalSuccessMessage = 'Chanson ajoutée avec succès';
          this.showModalError = false;
          this.isLoading = false;
          
          // Close the modal after 3 seconds
          setTimeout(() => {
            this.isAdding = false;
            this.showModalSuccess = false;
            this.modalSuccessMessage = '';
            this.loadChansons();
          }, 3000);
        },
        error: (error) => {
          this.showModalError = true;
          this.modalErrorMessage = 'Erreur lors de l\'ajout de la chanson';
          console.error('Error adding song:', error);
          this.isLoading = false;
        }
      });
    } else if (this.isEditing && this.selectedChanson) {
      // Update existing chanson
      const id = this.selectedChanson.idDemande;
      
      if (!id) {
        this.showModalError = true;
        this.modalErrorMessage = 'ID de chanson invalide';
        this.isLoading = false;
        return;
      }
      
      this.chansonService.updateChansonWithFiles(
        id,
        chansonData,
        this.parolesFile || undefined,
        this.partitionFile || undefined,
        this.audioFile || undefined
      ).subscribe({
        next: (response) => {
          // Show success message in the modal
          this.showModalSuccess = true;
          this.modalSuccessMessage = 'Chanson mise à jour avec succès';
          this.showModalError = false;
          this.isLoading = false;
          
          // Close the modal after 3 seconds
          setTimeout(() => {
            this.isEditing = false;
            this.selectedChanson = null;
            this.showModalSuccess = false;
            this.modalSuccessMessage = '';
            this.loadChansons();
          }, 3000);
        },
        error: (error) => {
          this.showModalError = true;
          this.modalErrorMessage = 'Erreur lors de la mise à jour de la chanson';
          console.error('Error updating song:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  deleteChanson(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      this.isLoading = true;
      
      // Check if it's an instrumental or a chanson based on the active tab
      if (this.activeTab === 'instrumentals') {
        // Delete instrumental
        this.instrumentalService.deleteInstrumental(id).subscribe({
          next: () => {
            this.successMessage = 'Instrumental supprimé avec succès';
            this.isLoading = false;
            this.loadChansons();
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors de la suppression de l\'instrumental';
            console.error('Error deleting instrumental:', error);
            this.isLoading = false;
          }
        });
      } else {
        // Delete chanson
        this.chansonService.deleteChanson(id).subscribe({
          next: () => {
            this.successMessage = 'Chanson supprimée avec succès';
            this.isLoading = false;
            this.loadChansons();
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors de la suppression de la chanson';
            console.error('Error deleting song:', error);
            this.isLoading = false;
          }
        });
      }
    }
  }
  
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  saveInstrumental(): void {
    if (this.instrumentalForm.invalid) {
      this.showModalError = true;
      this.modalErrorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    const instrumentalData = {
      titre: this.instrumentalForm.value.titre,
      compositeur: this.instrumentalForm.value.compositeur,
      annee: this.instrumentalForm.value.annee,
      rythme: this.instrumentalForm.value.rythme,
      makam: this.instrumentalForm.value.makam
    };
    
    this.isLoading = true;
    
    // Handle multiple partition images if selected
    if (this.isMultiplePartitionImages && this.partitionImages.length > 0) {
      this.partitionService.combineImagesToPDF(this.partitionImages, this.partitionPdfTitle).subscribe({
        next: (pdfBlob: Blob) => {
          // Create a File object from the Blob
          const pdfFile = new File([pdfBlob], this.partitionPdfTitle ? `${this.partitionPdfTitle}.pdf` : 'partition.pdf', { type: 'application/pdf' });
          this.partitionFile = pdfFile;
          
          // Continue with normal save process
          this.processSaveInstrumental(instrumentalData);
        },
        error: (error: any) => {
          this.showModalError = true;
          this.modalErrorMessage = 'Erreur lors de la création du PDF à partir des images';
          console.error('Error creating PDF:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Continue with normal save process if not using multiple images
      this.processSaveInstrumental(instrumentalData);
    }
  }
  
  // Helper method to process saving instrumental after handling partition images
  private processSaveInstrumental(instrumentalData: any): void {
    if (this.isEditingInstrumental && this.selectedInstrumental) {
      // Update existing instrumental
      const id = this.selectedInstrumental.id;
      
      if (!id) {
        this.showModalError = true;
        this.modalErrorMessage = 'ID d\'instrumental invalide';
        this.isLoading = false;
        return;
      }
      
      this.instrumentalService.updateInstrumentalWithFiles(
        id,
        instrumentalData,
        this.partitionFile || undefined,
        this.audioFile || undefined
      ).subscribe({
        next: (response) => {
          // Show success message in the modal
          this.showModalSuccess = true;
          this.modalSuccessMessage = 'Instrumental mis à jour avec succès';
          this.showModalError = false;
          this.isLoading = false;
          
          // Close the modal after 3 seconds
          setTimeout(() => {
            this.isEditingInstrumental = false;
            this.isAddingInstrumental = false;
            this.selectedInstrumental = null;
            this.showModalSuccess = false;
            this.modalSuccessMessage = '';
            this.renderer.removeClass(document.body, 'modal-open');
            this.loadChansons();
          }, 3000);
        },
        error: (error) => {
          this.showModalError = true;
          this.modalErrorMessage = 'Erreur lors de la mise à jour de l\'instrumental';
          console.error('Error updating instrumental:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Add new instrumental
      // Check if required files are selected (audio is optional)
      if (!this.partitionFile) {
        this.showModalError = true;
        this.modalErrorMessage = 'Veuillez sélectionner le fichier partition requis';
        this.isLoading = false;
        return;
      }
      
      // Create new instrumental using the instrumental service
      this.instrumentalService.createInstrumentalWithFiles(
        instrumentalData,
        this.partitionFile,
        this.audioFile || undefined
      ).subscribe({
        next: (response) => {
          // Show success message in the modal
          this.showModalSuccess = true;
          this.modalSuccessMessage = 'Instrumental ajouté avec succès';
          this.showModalError = false;
          this.isLoading = false;
          
          // Close the modal after 3 seconds
          setTimeout(() => {
            this.isAddingInstrumental = false;
            this.showModalSuccess = false;
            this.modalSuccessMessage = '';
            this.renderer.removeClass(document.body, 'modal-open');
            this.loadChansons();
          }, 3000);
        },
        error: (error) => {
          this.showModalError = true;
          this.modalErrorMessage = 'Erreur lors de l\'ajout de l\'instrumental';
          console.error('Error adding instrumental:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  // Method to close modal when clicking on the background overlay
  closeModalOnBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.cancelEdit();
    }
  }
  
  // Function to prevent body scrolling when modal is open
  preventBodyScroll(prevent: boolean): void {
    if (prevent) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
  
  initChansonForm(chanson?: Chanson): void {
    if (chanson) {
      this.chansonForm.patchValue({
        titre: chanson.titre,
        chanteur: chanson.chanteur,
        compositeur: chanson.compositeur || '',
        parolier: chanson.parolier || '',
        type: chanson.type || '',
        annee: chanson.annee || null,
        rythme: chanson.rythme || '',
        makam: chanson.makam || ''
      });
    } else {
      this.chansonForm.reset();
    }
    
    // Reset file inputs
    this.parolesFile = null;
    this.partitionFile = null;
    this.audioFile = null;
    this.isMultiplePartitionImages = false;
    this.partitionImages = [];
    this.partitionImagesPreview = [];
    this.partitionPdfTitle = '';
  }

  // Update saveChanson method to handle form validation errors
  saveChanson(): void {
    if (this.chansonForm.invalid) {
      this.showModalError = true;
      this.modalErrorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    const chansonData = {
      titre: this.chansonForm.value.titre,
      chanteur: this.chansonForm.value.chanteur,
      compositeur: this.chansonForm.value.compositeur,
      parolier: this.chansonForm.value.parolier,
      type: this.chansonForm.value.type,
      annee: this.chansonForm.value.annee,
      rythme: this.chansonForm.value.rythme,
      makam: this.chansonForm.value.makam
    };
    
    this.isLoading = true;
    
    // Handle multiple partition images if selected
    if (this.isMultiplePartitionImages && this.partitionImages.length > 0) {
      this.partitionService.combineImagesToPDF(this.partitionImages, this.partitionPdfTitle).subscribe({
        next: (pdfBlob: Blob) => {
          // Create a File object from the Blob
          const pdfFile = new File([pdfBlob], this.partitionPdfTitle ? `${this.partitionPdfTitle}.pdf` : 'partition.pdf', { type: 'application/pdf' });
          this.partitionFile = pdfFile;
          
          // Continue with normal save process
          this.processSaveChanson(chansonData);
        },
        error: (error: any) => {
          this.showModalError = true;
          this.modalErrorMessage = 'Erreur lors de la création du PDF à partir des images';
          console.error('Error creating PDF:', error);
          this.isLoading = false;
        }
      });
    } else {
      // Continue with normal save process if not using multiple images
      this.processSaveChanson(chansonData);
    }
  }
}

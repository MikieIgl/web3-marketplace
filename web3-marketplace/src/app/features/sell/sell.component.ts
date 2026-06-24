import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../core/services/contract.service';
import { WalletService } from '../../core/services/wallet.service';
import { ethers } from 'ethers';

function urlValidator(control: any) {
  const value = control.value;
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return { url: true };
  }
}

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.less'],
})
export class SellComponent {
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  readonly walletService = inject(WalletService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  itemForm: FormGroup;
  loading = false;
  error: string | null = null;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  imageMode: 'url' | 'file' = 'url';
  imageError: string | null = null;

  constructor() {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      imageUrl: ['', [Validators.required, urlValidator]],
      price: ['', [Validators.required, Validators.min(0.0001)]],
    });

    this.itemForm.get('imageUrl')?.valueChanges.subscribe((url) => {
      if (this.imageMode === 'url') {
        this.previewUrl = url || null;
      }
    });
  }

  setImageMode(mode: 'url' | 'file'): void {
    this.imageMode = mode;
    this.imageError = null;

    if (mode === 'url') {
      this.itemForm.get('imageUrl')?.setValidators([Validators.required, urlValidator]);
      this.selectedFile = null;
      this.previewUrl = this.itemForm.get('imageUrl')?.value || null;
    } else {
      this.itemForm.get('imageUrl')?.clearValidators();
      this.previewUrl = null;
    }
    this.itemForm.get('imageUrl')?.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    this.imageError = null;

    if (!file.type.startsWith('image/')) {
      this.imageError = 'Please select an image file';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.imageError = 'File size must be less than 5MB';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.onerror = () => {
      this.imageError = 'Failed to read file';
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async connectWallet(): Promise<void> {
    try {
      await this.walletService.connect();
    } catch (error: any) {
      alert(`Failed to connect wallet:\n${error.message || error}`);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.walletService.isConnected()) {
      return;
    }

    if (this.imageMode === 'url') {
      this.itemForm.get('imageUrl')?.setValidators([Validators.required, urlValidator]);
    } else {
      this.itemForm.get('imageUrl')?.clearValidators();
    }
    this.itemForm.get('imageUrl')?.updateValueAndValidity();

    if (this.itemForm.invalid) {
      return;
    }

    let imageUrl = this.itemForm.get('imageUrl')?.value;
    if (this.imageMode === 'file' && this.selectedFile) {
      imageUrl = this.previewUrl;
    }

    if (!imageUrl) {
      this.error = 'Image is required';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const { name, description, price } = this.itemForm.value;
      const priceWei = ethers.parseEther(price.toString());

      await this.contractService.listItem(name, description, imageUrl, priceWei);

      alert('Item listed successfully!');
      this.router.navigate(['/marketplace']);
    } catch (err: any) {
      this.error = `Failed to list item: ${err.message}`;
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/marketplace']);
  }
}

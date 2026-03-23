import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-user',
  standalone: false,
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css'
})
export class AddUserComponent {
  @Output() userAdded = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  newUser = {
    name: '',
    role: ''
  };

  touchedFields = {
    name: false,
    role: false
  };
  private readonly nameRegex = /^[A-Za-z\s.-]+$/;
  private readonly allowedCharsRegex = /^[A-Za-z\s.-]*$/;
  private readonly allowedSpecialKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
    'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Shift', 'Control', 'Alt', 'CapsLock', 'Meta'
  ];

  validateNameInput(event: any): void {
    const input = event.target;
    let value = input.value;

    const filteredValue = value.split('').filter((char: string) => 
      this.allowedCharsRegex.test(char)
    ).join('');
    
    if (value !== filteredValue) {
      this.newUser.name = filteredValue;
    }
  }

  preventInvalidKeys(event: KeyboardEvent): void {
    // Allow control keys and navigation keys
    if (this.allowedSpecialKeys.includes(event.key)) {
      return;
    }

    if (event.key.length === 1) {
      const isLetter = /^[A-Za-z]$/.test(event.key);
      const isSpace = event.key === ' ';
      const isDot = event.key === '.';
      const isHyphen = event.key === '-';
      
      if (!isLetter && !isSpace && !isDot && !isHyphen) {
        event.preventDefault();
      }
    }
  }

  showNameError(): boolean {
    if (!this.touchedFields.name) return false;
    if (!this.newUser.name) return true;
    return !this.isNameValid();
  }

  isNameValid(): boolean {
    if (!this.newUser.name) return false;
    
    if (this.newUser.name.length > 100 || this.newUser.name.length < 5) {
      return false;
    }
    
    return this.allowedCharsRegex.test(this.newUser.name) && 
           /[A-Za-z]/.test(this.newUser.name);
  }

  getNameErrorMessage(): string {
    if (!this.newUser.name) {
      return 'Name is required';
    }
    if (this.newUser.name.length < 5) {
      return 'Name must be at least 5 characters long';
    }
    if (this.newUser.name.length > 100) {
      return 'Name must not exceed 100 characters';
    }
    if (!this.allowedCharsRegex.test(this.newUser.name)) {
      return 'Name can only contain letters, spaces, dots, and hyphens';
    }
    if (!/[A-Za-z]/.test(this.newUser.name)) {
      return 'Name must contain at least one letter';
    }
    return 'Please enter a valid name';
  }

  showRoleError(): boolean {
    return this.touchedFields.role && !this.newUser.role;
  }

  validateField(fieldName: string): void {
    if (fieldName === 'name') {
      this.touchedFields.name = true;
    } else if (fieldName === 'role') {
      this.touchedFields.role = true;
    }
  }

  get isFormTouched(): boolean {
    return this.touchedFields.name || this.touchedFields.role;
  }

  isFormValid(): boolean {
    return this.isNameValid() && this.newUser.role !== '';
  }

  isFormInvalid(): boolean {
    return !this.isFormValid();
  }

  addUser() {
    this.touchedFields.name = true;
    this.touchedFields.role = true;
    
    if (this.isFormValid()) {
      const userData = {
        ...this.newUser,
        name: this.newUser.name.replace(/\s+/g, ' ').trim()
      };
      this.userAdded.emit(userData);
      this.resetForm();
      this.closeModal.emit();
    }
  }

  resetForm() {
    this.newUser = {
      name: '',
      role: ''
    };
    this.touchedFields = {
      name: false,
      role: false
    };
  }

  close() {
    this.resetForm();
    this.closeModal.emit();
  }
}
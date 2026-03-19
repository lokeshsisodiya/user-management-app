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

  showNameError(): boolean {
    return this.touchedFields.name && !this.newUser.name;
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
    return this.newUser.name?.trim() !== '' && this.newUser.role !== '';
  }

  isFormInvalid(): boolean {
    return !this.isFormValid();
  }

  addUser() {
    this.touchedFields.name = true;
    this.touchedFields.role = true;
    
    if (this.isFormValid()) {
      this.userAdded.emit(this.newUser);
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
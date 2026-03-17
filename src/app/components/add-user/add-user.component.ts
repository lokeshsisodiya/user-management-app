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


  addUser() {
    if (this.newUser.name && this.newUser.role) {
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
  }

  close() {
    this.resetForm();
    this.closeModal.emit();
  }
}

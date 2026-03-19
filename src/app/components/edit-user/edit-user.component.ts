import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-edit-user',
  standalone: false,
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent {
  @Input() user: User | null = null;
  @Output() userUpdated = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  editUser = {
    name: '',
    role: ''
  };

  ngOnChanges(): void {
    if (this.user) {
      this.editUser = {
        name: this.user.name,
        role: this.user.role
      };
    }
  }

  updateUser() {
    if (this.editUser.name && this.editUser.role) {
      this.userUpdated.emit(this.editUser);
    }
  }

  close() {
    this.closeModal.emit();
  }
}

import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

export interface User {
  id: number;
  name: string;
  role: string;
  addedOn?: string;
  lastModified?: string;
}

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchText: string = '';
  sortAscending: boolean = true;
  showAddUserModal: boolean = false;
  showUserDetailModal: boolean = false;
  selectedUser: User | null = null;
  isLoadingDetail: boolean = false;
  detailError: string = '';
  showEditUserModal: boolean = false;
  userToEdit: User | null = null;
  isUpdating: boolean = false;
  editError: string = '';

  isLoading: boolean = false;
  isAdding: boolean = false;
  isDeleting: boolean = false;
  loadingError: string = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadingError = '';
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.loadingError = 'Failed to load users. Please try again.';
      }
    });
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.showUserDetailModal = true;
  }

  loadUserDetails(userId: number): void {
    this.isLoadingDetail = true;
    this.detailError = '';
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (user) {
          this.selectedUser = user;
        }
        this.isLoadingDetail = false;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.isLoadingDetail = false;
        this.detailError = 'Failed to load user details.';
      }
    });
  }

  closeUserDetail(): void {
    this.showUserDetailModal = false;
    this.selectedUser = null;
    this.detailError = '';
  }
  openEditModal(): void {
    if (this.selectedUser) {
      this.userToEdit = { ...this.selectedUser };
      this.showEditUserModal = true;
      this.showUserDetailModal = false;
    }
  }


  editUserDirectly(user: User, event: Event): void {
    event.stopPropagation();
    this.userToEdit = { ...user };
    this.showEditUserModal = true;
  }

  closeEditModal(): void {
    this.showEditUserModal = false;
    this.userToEdit = null;
    this.editError = '';
  }

  updateUser(updatedData: { name: string; role: string }): void {
    if (!this.userToEdit) return;
    
    this.isUpdating = true;
    this.editError = '';
    
    this.userService.updateUser(this.userToEdit.id, updatedData).subscribe({
      next: (success) => {
        if (success) {
          this.loadUsers();
          this.isUpdating = false;
          this.closeEditModal();
          
          console.log('User updated successfully');
        } else {
          this.isUpdating = false;
          this.editError = 'Failed to update user.';
        }
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.isUpdating = false;
        this.editError = 'An error occurred. Please try again.';
      }
    });
  }

  deleteUserFromDetail(): void {
    if (!this.selectedUser) return;
    
    if (confirm('Are you sure you want to delete this user?')) {
      this.isDeleting = true;
      
      this.userService.deleteUser(this.selectedUser.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadUsers();
            this.closeUserDetail();
          }
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.isDeleting = false;
          alert('Failed to delete user.');
        }
      });
    }
  }

  deleteUser(id: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this user?')) {
      this.isDeleting = true;
      
      this.userService.deleteUser(id).subscribe({
        next: (success) => {
          if (success) {
            this.loadUsers();
          }
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.isDeleting = false;
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  openAddUserModal() {
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
  }

  addNewUser(userData: any) {
    this.isAdding = true;
    
    this.userService.addUser(userData).subscribe({
      next: (newUser) => {
        this.loadUsers();
        this.isAdding = false;
        this.closeAddUserModal();
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.isAdding = false;
        alert('Failed to add user. Please try again.');
      }
    });
  }

  searchUsers(): void {
    if (this.searchText) {
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  sortUsers(): void {
    this.sortAscending = !this.sortAscending;
    this.filteredUsers.sort((a, b) => {
      if (this.sortAscending) {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }

  calculateAccountAge(addedOn: string): string {
    if (!addedOn) return 'N/A';
    
    try {
      const addedDate = new Date(addedOn);
      const today = new Date();
      
      const diffTime = Math.abs(today.getTime() - addedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} days`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        const remainingMonths = Math.floor((diffDays % 365) / 30);
        return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? remainingMonths + ' month' + (remainingMonths > 1 ? 's' : '') : ''}`;
      }
    } catch (e) {
      return 'Unknown';
    }
  }
}
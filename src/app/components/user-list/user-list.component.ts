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
  isLoading: boolean = false;
  isAdding: boolean = false;
  isDeleting: boolean = false;
  loadingError: string = '';
  showUserDetailModal: boolean = false;
  selectedUser: User | null = null;
  isLoadingDetail: boolean = false;
  detailError: string = '';   

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
        console.log('Users loaded:', users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.loadingError = 'Failed to load users. Please try again.';
      }
    });
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

  deleteUser(id: number): void {
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

  searchUsers(): void {
    if (this.searchText) {
      this.filteredUsers = this.users.filter(user => 
        user.name.toLowerCase().includes(this.searchText.toLowerCase())
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

    filterByRole(role: string): void {
    this.userService.getUsersByRole(role).subscribe({
      next: (filtered) => {
        this.filteredUsers = filtered;
      },
      error: (error) => {
        console.error('Error filtering by role:', error);
      }
    });
  }

    viewUserDetails(user: User): void {
    console.log('Viewing user:', user);
    this.selectedUser = user;
    this.showUserDetailModal = true;
    this.loadUserDetails(user.id);
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
    setTimeout(() => {
    }, 300);
  }

}
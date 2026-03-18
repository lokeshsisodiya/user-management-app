import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
interface User {
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
  users: User[] = [];
  filteredUsers: User[] = [];
  searchText: string = '';
  sortAscending: boolean = true;
  showAddUserModal: boolean = false;
  isLoading: boolean = false;
  isAdding: boolean = false;
  isSearching: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
        console.log('Users loaded successfully:', users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        alert('Failed to load users. Please try again.');
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
        console.log('User added successfully:', newUser);
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
    if (this.searchText.trim()) {
      this.isSearching = true;
      
      this.userService.searchUsers(this.searchText).subscribe({
        next: (filtered) => {
          this.filteredUsers = filtered;
          this.isSearching = false;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.isSearching = false;
          this.localSearch();
        }
      });
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  private localSearch(): void {
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  sortUsers(): void {
    this.sortAscending = !this.sortAscending;
    
    this.filteredUsers = [...this.filteredUsers].sort((a, b) => {
      if (this.sortAscending) {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: (success) => {
          if (success) {
            console.log('User deleted successfully');
            this.loadUsers(); 
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
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
}
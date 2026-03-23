import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

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
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'role', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchText: string = '';
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

  // Pagination options
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageSize: number = 10;

  // Custom sort properties
  sortByNameAsc: boolean = true;
  isCustomSortActive: boolean = false;
  originalData: User[] = [];

  constructor(
    private userService: UserService,
    private liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.sortChange.subscribe((sort: Sort) => {
        if (sort.active !== 'name') {
          this.isCustomSortActive = false;
        }
      });
    }
    
    this.dataSource.sortingDataAccessor = (item: User, property: string): string | number => {
      switch(property) {
        case 'role': 
          return item.role.toLowerCase();
        default: 
          return (item as any)[property];
      }
    };
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadingError = '';
    
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.originalData = [...users];
        this.dataSource.data = users;
        this.isLoading = false;
        this.isCustomSortActive = false;
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.loadingError = 'Failed to load users. Please try again.';
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  toggleSortByName(): void {
    this.sortByNameAsc = !this.sortByNameAsc;
    this.isCustomSortActive = true;
    let dataToSort = this.dataSource.filteredData.length > 0 
      ? [...this.dataSource.filteredData] 
      : [...this.dataSource.data];
    dataToSort.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      if (this.sortByNameAsc) {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    this.dataSource.data = dataToSort;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.liveAnnouncer.announce(
      `Users sorted by name ${this.sortByNameAsc ? 'A to Z' : 'Z to A'}`, 
      'polite'
    );
  }

  clearSort(): void {
    if (!this.isCustomSortActive) return;
    const filteredOriginal = this.originalData.filter(user => {
      const searchTerm = this.dataSource.filter;
      if (!searchTerm) return true;
      
      return user.name.toLowerCase().includes(searchTerm) ||
             user.role.toLowerCase().includes(searchTerm);
    });
    
    this.dataSource.data = filteredOriginal;
    this.isCustomSortActive = false;
    if (this.sort) {
      this.sort.active = '';
      this.sort.direction = '';
    }
    this.liveAnnouncer.announce('Sort cleared, returning to original order', 'polite');
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.showUserDetailModal = true;
  }

  loadUserDetails(userId: number): void {
    this.isLoadingDetail = true;
    this.detailError = '';
    
    this.userService.getUserById(userId).subscribe({
      next: (user: User | undefined) => {
        if (user) {
          this.selectedUser = user;
        }
        this.isLoadingDetail = false;
      },
      error: (error: any) => {
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
      next: (success: boolean) => {
        if (success) {
          this.loadUsers();
          this.isUpdating = false;
          this.closeEditModal();
          this.liveAnnouncer.announce('User updated successfully', 'polite');
        } else {
          this.isUpdating = false;
          this.editError = 'Failed to update user.';
        }
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
        this.isUpdating = false;
        this.editError = 'An error occurred. Please try again.';
      }
    });
  }

  deleteUserFromDetail(): void {
    if (!this.selectedUser) return;
    const fakeEvent = new Event('click');
    this.deleteUser(this.selectedUser.id, fakeEvent);
  }

  deleteUser(id: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this user?')) {
      this.isDeleting = true;
      
      this.userService.deleteUser(id).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.loadUsers();
            this.liveAnnouncer.announce('User deleted successfully', 'assertive');
          }
          this.isDeleting = false;
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
          this.isDeleting = false;
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  openAddUserModal(): void {
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
  }

  addNewUser(userData: any): void {
    this.isAdding = true;
    
    this.userService.addUser(userData).subscribe({
      next: (newUser: User) => {
        this.loadUsers();
        this.isAdding = false;
        this.closeAddUserModal();
        this.liveAnnouncer.announce('User added successfully', 'polite');
      },
      error: (error: any) => {
        console.error('Error adding user:', error);
        this.isAdding = false;
        alert('Failed to add user. Please try again.');
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
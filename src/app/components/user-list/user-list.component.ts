import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

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

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.users = this.userService.getUsers();
    this.filteredUsers = [...this.users];
  }
  openAddUserModal() {
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
  }

  addNewUser(userData: any) {
    this.userService.addUser(userData);
    this.users = this.userService.getUsers();
    this.filteredUsers = [...this.users];
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
}

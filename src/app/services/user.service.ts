import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name: string;
  role: string;
  addedOn?: string;
  lastModified?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private storageKey = 'user_management_data';
  private lastIdKey = 'last_user_id';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.storageKey)) {
      const defaultUsers = [
        { id: 1, name: 'Rahul Sharma', role: 'Developer', addedOn: new Date().toLocaleString() },
        { id: 2, name: 'Priya Patel', role: 'Designer', addedOn: new Date().toLocaleString() },
        { id: 3, name: 'Amit Kumar', role: 'Manager', addedOn: new Date().toLocaleString() },
        { id: 4, name: 'Neha Singh', role: 'Tester', addedOn: new Date().toLocaleString() },
        { id: 5, name: 'Vikram Verma', role: 'Developer', addedOn: new Date().toLocaleString() }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaultUsers));
      localStorage.setItem(this.lastIdKey, '5');
    }
  }

  private getNextId(): number {
    const lastId = localStorage.getItem(this.lastIdKey);
    const nextId = lastId ? parseInt(lastId) + 1 : 6;
    localStorage.setItem(this.lastIdKey, nextId.toString());
    return nextId;
  }

  getUsers(): User[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }

  getUserById(id: number): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  addUser(user: { name: string; role: string }): User {
    const users = this.getUsers();
    const newUser: User = {
      id: this.getNextId(),
      name: user.name,
      role: user.role,
      addedOn: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString()
    };
    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: number, updatedData: Partial<User>): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { 
        ...users[index], 
        ...updatedData,
        lastModified: new Date().toLocaleString() 
      };
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      return true;
    }
    return false;
  }

  deleteUser(id: number): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    if (filteredUsers.length < users.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));
      return true;
    }
    return false;
  }

  searchUsers(searchTerm: string): User[] {
    const users = this.getUsers();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  getUsersByRole(role: string): User[] {
    const users = this.getUsers();
    return users.filter(user => user.role === role);
  }

  getTotalCount(): number {
    return this.getUsers().length;
  }

  clearAllUsers(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.lastIdKey);
    this.initializeStorage();
  }

  exportUsers(): string {
    return JSON.stringify(this.getUsers(), null, 2);
  }

  importUsers(usersJson: string): boolean {
    try {
      const users = JSON.parse(usersJson);
      if (Array.isArray(users)) {
        localStorage.setItem(this.storageKey, usersJson);
        const maxId = Math.max(...users.map(u => u.id));
        localStorage.setItem(this.lastIdKey, maxId.toString());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
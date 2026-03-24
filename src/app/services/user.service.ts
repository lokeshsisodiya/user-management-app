import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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
      const defaultUsers: User[] = [];    
      localStorage.setItem(this.storageKey, JSON.stringify(defaultUsers));
      localStorage.setItem(this.lastIdKey, '0');
    }
  }

  private getNextId(): number {
    const lastId = localStorage.getItem(this.lastIdKey);
    const nextId = lastId ? parseInt(lastId) + 1 : 1;
    localStorage.setItem(this.lastIdKey, nextId.toString());
    return nextId;
  }
    hasUsers(): Observable<boolean> {
    return this.getUsers().pipe(
      map(users => users.length > 0)
    );
  }

  getUsers(): Observable<User[]> {
    const users = localStorage.getItem(this.storageKey);
    const userArray = users ? JSON.parse(users) : [];
    return of(userArray).pipe(delay(1000));
  }

  getUserById(id: number): Observable<User | undefined> {
    const users = localStorage.getItem(this.storageKey);
    const userArray = users ? JSON.parse(users) : [];
    const user = userArray.find((u: User) => u.id === id);
    return of(user).pipe(delay(800));
  }
  addUser(user: { name: string; role: string }): Observable<User> {
    const usersJson = localStorage.getItem(this.storageKey);
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    const newUser: User = {
      id: this.getNextId(),
      name: user.name,
      role: user.role,
      addedOn: new Date().toLocaleString(),
      lastModified: new Date().toLocaleString()
    };
    
    users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    
    return of(newUser).pipe(delay(1200));
  }

  updateUser(id: number, updatedData: Partial<User>): Observable<boolean> {
    const usersJson = localStorage.getItem(this.storageKey);
    const users = usersJson ? JSON.parse(usersJson) : [];
    const index = users.findIndex((u: User) => u.id === id);
    
    if (index !== -1) {
      users[index] = { 
        ...users[index], 
        ...updatedData,
        lastModified: new Date().toLocaleString() 
      };
      localStorage.setItem(this.storageKey, JSON.stringify(users));
      return of(true).pipe(delay(1000));
    }
    
    return of(false).pipe(delay(1000));
  }

  deleteUser(id: number): Observable<boolean> {
    const usersJson = localStorage.getItem(this.storageKey);
    const users = usersJson ? JSON.parse(usersJson) : [];
    const filteredUsers = users.filter((u: User) => u.id !== id);
    
    if (filteredUsers.length < users.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));
      return of(true).pipe(delay(800));
    }
    
    return of(false).pipe(delay(800));
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => 
        users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => user.role === role))
    );
  }

  getTotalCount(): Observable<number> {
    return this.getUsers().pipe(
      map(users => users.length)
    );
  }

  clearAllUsers(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.lastIdKey);
    this.initializeStorage();
  }

  exportUsers(): string {
    const users = localStorage.getItem(this.storageKey);
    const userArray = users ? JSON.parse(users) : [];
    return JSON.stringify(userArray, null, 2);
  }

  importUsers(usersJson: string): boolean {
    try {
      const users = JSON.parse(usersJson);
      if (Array.isArray(users)) {
        localStorage.setItem(this.storageKey, usersJson);
        const maxId = Math.max(...users.map((u: User) => u.id));
        localStorage.setItem(this.lastIdKey, maxId.toString());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
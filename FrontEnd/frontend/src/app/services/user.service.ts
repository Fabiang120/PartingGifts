// ------------------------------
// UserService (user.service.ts)
// ------------------------------
import { Injectable } from '@angular/core';

/*
  UserService is used to store and share the current user's username across components.
  It is provided at the root level, so it is a singleton accessible throughout the application.
*/
@Injectable({
  providedIn: 'root'
})
export class UserService {
  public username: string = ''; // Holds the current user's username.

  constructor() { }
}

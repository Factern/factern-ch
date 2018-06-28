/*
 * app.component.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { Component } from '@angular/core';

import { AuthService } from './service/auth.service';

@Component({
  selector: 'erchl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public title = 'app';

  public constructor(private authService: AuthService) {
  }

  public login() {
    this.authService.login();
  }

  public logout() {
    this.authService.logout();
  }

  public loggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get profileName(): string {
    return this.authService.profileName;
  }
}

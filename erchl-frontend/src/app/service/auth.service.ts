/*
 * auth.service.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import * as superagent from 'superagent';

import { Injectable } from '@angular/core';

import * as auth0 from 'auth0-js';
import { environment } from './../../environments/environment';
import { Router } from '@angular/router';

(window as any).global = window;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Create Auth0 web auth instance
  auth0 = new auth0.WebAuth({
    clientID: environment.auth.clientId,
    domain: environment.auth.domain,
    responseType: environment.auth.responseType,
    redirectUri: environment.auth.redirect,
    audience: environment.auth.audience,
    scope: environment.auth.scope
  });
  // Store authentication data
  expiresAt: number;
  userProfile: any;
  accessToken: string;
  idToken: string;
  authenticated: boolean;
  loginNodeId: string;

  constructor(private router: Router) {
    this.getAccessToken();
  }

  login() {
    // Auth0 authorize request
    this.auth0.authorize();
  }

  handleLoginCallback() {
    // When Auth0 hash parsed, get profile
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken) {
        window.location.hash = '';
        this.getUserInfo(authResult);
      } else if (err) {
        console.error(`Error: ${err.error}`);
      }
      this.router.navigate(['/']);
    });
  }

  getAccessToken() {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken) {
        this.getUserInfo(authResult);
      }
    });
  }

  getUserInfo(authResult) {
    // Use access token to retrieve user's profile and set session
    this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
      }
    });
  }

  private _setSession(authResult, profile) {
    // Save authentication data and update login status subject
    console.log(authResult);
    this.expiresAt = authResult.expiresIn * 1000 + Date.now();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.userProfile = profile;
    superagent
      .post('http://localhost:3000/profile')
      .send({
        accessToken: this.accessToken
      }).then((res) => {
        const response: any = JSON.parse(res.text);
        this.loginNodeId = response.node.nodeId;
        this.authenticated = true;
      });
  }

  logout() {
    // Remove auth data and update login status
    this.expiresAt = undefined;
    this.userProfile = undefined;
    this.accessToken = undefined;
    this.loginNodeId = undefined;
    this.authenticated = false;
    this.auth0.logout({
      returnTo: 'http://localhost:4200/main',
      clientID: environment.auth.clientId
    });
  }

  get isLoggedIn(): boolean {
    // Check if current date is before token
    // expiration and user is signed in locally
    return Date.now() < this.expiresAt && this.authenticated;
  }

  get loginId(): string {
    return this.loginNodeId;
  }

  get profileName(): string {
    return this.authenticated ? this.userProfile.name : '';
  }
}

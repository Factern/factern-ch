/*
 * app.module.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';

import { AppComponent } from './app.component';
import { ListComponent } from './list/list.component';
import { MainComponent } from './main/main.component';
import { DetailsComponent } from './details/details.component';
import { CallbackComponent } from './auth/callback.component';

import { AuthService } from './service/auth.service';

const appRoutes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent, pathMatch: 'full' },
  { path: 'details/:id', component: DetailsComponent },
  { path: 'callback', component: CallbackComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    MainComponent,
    DetailsComponent,
    CallbackComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true, onSameUrlNavigation: 'reload' }
    ),
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(apollo: Apollo, httpLink: HttpLink, auth: AuthService) {
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          Authorization: auth.isLoggedIn ? `${auth.accessToken}` : '',
          'X-Factern-Login': auth.isLoggedIn ? auth.loginId : ''
        }
      };
    });
    const gqlLink = httpLink.create({ uri: 'http://localhost:3000/graphql' });
    apollo.create({
      link: authLink.concat(gqlLink),
      cache: new InMemoryCache()
    });
  }
}

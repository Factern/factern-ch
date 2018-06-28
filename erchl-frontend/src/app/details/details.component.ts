/*
 * details.component.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { CompanyProfile, CompanyProfileSearchQL, AddCommentQL, AddResponseQL } from '../graphql/companies';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';

import { AuthService } from '../service/auth.service';

@Component({
  selector: 'erchl-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  private id: string;
  private paramSub: any;
  public searching = false;
  public companyProfileAsync: Observable<CompanyProfile>;

  public commentFormGroup = new FormGroup({
    comment: new FormControl()
  });

  constructor(private route: ActivatedRoute, private apollo: Apollo, private auth: AuthService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.paramSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.search();
    });
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
  }

  addComment(company_number: string, comment: string, privacy: boolean) {
    this.addCommentMutation(company_number, comment, privacy !== undefined ? privacy : false);
  }

  addResponse(id: string, comment: string, privacy: boolean) {
    this.addResponseMutation(id, comment, privacy !== undefined ? privacy : false);
  }

  public get isAuthenticated(): boolean {
    return this.auth.authenticated;
  }

  public get loggedInId(): string {
    return this.auth.loginId;
  }

  public search() {
    this.searching = true;
    this.query(this.id);
  }

  private query(company_number: string) {
    this.companyProfileAsync = this.apollo.watchQuery<CompanyProfile>({
      variables: {
        company_number: company_number
      },
      query: CompanyProfileSearchQL
    })
    .valueChanges
    .pipe(
      map(result => {
        this.searching = false;
        return result.data['companyDetails'];
      })
    );
  }

  private addCommentMutation(company_number: string, comment: string, privacy: boolean) {
    this.apollo.mutate<string>({
      variables: {
        number: company_number,
        comment: comment,
        isPrivate: privacy
      },
      mutation: AddCommentQL,
      refetchQueries: [{
        query: CompanyProfileSearchQL,
        variables: {
          company_number: company_number
        }
      }]
    }).subscribe(result => {
      console.log(result);
      this.query(this.id);
      // location.reload();
    });
  }

  private addResponseMutation(commentId: string, comment: string, privacy: boolean) {
    this.apollo.mutate<string>({
      variables: {
        commentId: commentId,
        comment: comment,
        isPrivate: privacy
      },
      mutation: AddResponseQL,
      refetchQueries: [{
        query: CompanyProfileSearchQL,
        variables: {
          company_number: this.id
        }
      }]
    }).subscribe(result => {
      console.log(result);
      this.query(this.id);
      // location.reload();
    });
  }

}

/*
 * main.component.ts
 *
 * Copyright (C) 2018 Finovertech
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { CompanySearchQL, CompanySearchResults, Company, CompanyList } from '../graphql/companies';

@Component({
  selector: 'erchl-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public searching = false;
  public companyListAsync: Observable<CompanyList>;

  public searchFormGroup = new FormGroup({
    name: new FormControl()
  });

  public constructor(private apollo: Apollo) {
  }

  public ngOnInit() {
  }

  public search() {
    this.searching = true;
    this.query(this.searchFormGroup.value['name']);
  }

  private query(name: string) {

    this.companyListAsync = this.apollo.watchQuery<CompanySearchResults>({
      variables: {
        name: name
      },
      query: CompanySearchQL
    })
    .valueChanges
    .pipe(
      map(result => {
        this.searching = false;
        return result.data.companies;
      })
    );
  }

}

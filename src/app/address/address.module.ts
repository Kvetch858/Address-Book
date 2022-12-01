import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AddressGridComponent } from './address-grid/address-grid.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { AddressFormDialogComponent } from './address-form-dialog/address-form-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    AddressGridComponent,
    AddressFormDialogComponent
  ],
  imports: [
    BrowserModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [],
  exports: [ AddressGridComponent ]
})
export class AddressModule { }

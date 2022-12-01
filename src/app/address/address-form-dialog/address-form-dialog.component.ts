import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Address } from '../address-grid/models/address.model';
const { v4: uuidv4 } = require('uuid');

@Component({
  selector: 'app-address-form-dialog',
  templateUrl: './address-form-dialog.component.html',
  styleUrls: ['./address-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormDialogComponent {

  nameControl: FormControl;
  surnameControl: FormControl;
  phoneNumberControl: FormControl;
  form: FormGroup;
  title: string;

  constructor(
    private dialogRef: MatDialogRef<AddressFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Address) {

  }

  ngOnInit() {
      this.title = this.data?.name? `Editing ${this.data.name} ${this.data.surname}`: "Add New Entry";
      this.nameControl = new FormControl(this.data?.name, Validators.required);
      this.surnameControl = new FormControl(this.data?.surname, Validators.required);
      //would add better regex for phone number, and error messages if I was making this for real 
      this.phoneNumberControl = new FormControl(this.data?.phoneNumber, Validators.pattern(/^[0-9]+$/)); 

      this.form = new FormGroup({
        name: this.nameControl,
        surname: this.surnameControl,
        phoneNumber: this.phoneNumberControl
      })
  }

  save() {
      this.dialogRef.close({
        id: this.data?.id || uuidv4(),
        name: this.form.value.name,
        surname: this.form.value.surname,
        phoneNumber: this.form.value.phoneNumber
      });
  }

  close() {
      this.dialogRef.close();
  }

}

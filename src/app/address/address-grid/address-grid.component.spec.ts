import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { AddressGridComponent } from './address-grid.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddressBookService } from '../services/address-book.service';  
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Address } from './models/address.model';
import { AddressFormDialogComponent } from '../address-form-dialog/address-form-dialog.component';

const mockAddresses: Address[] = [
  {id: "1", name: "Ash", surname: "Ketchum", phoneNumber: "07812378410"},
  {id: "2", name: "Spongebob", surname: "SquarePants", phoneNumber: "9992221112"},
  {id: "3", name: "Patrick", surname: "Star", phoneNumber: "9992221112"},
];
const addressBookServiceMock = jasmine.createSpyObj('addressBookService', ['getAddresses', 'updateAddress', 'addAddress', 'deleteAddress']);

describe('AddressGridComponent', () => {
  let component: AddressGridComponent;
  let fixture: ComponentFixture<AddressGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatPaginatorModule, ReactiveFormsModule, MatInputModule, BrowserAnimationsModule, MatDialogModule],
      declarations: [ AddressGridComponent, AddressFormDialogComponent ],
      providers: [{provide: AddressBookService, useValue: addressBookServiceMock}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it("should retrieve the data on init", async () => {
    const getAddressesSpy = addressBookServiceMock.getAddresses.and.returnValue(of(mockAddresses));
    component.ngOnInit();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.addresses).toBe(mockAddresses);  
      expect(getAddressesSpy).toHaveBeenCalled();
    });
  });

    // const openDialogSpy = spyOn(component.dialog,'open').and.returnValue({afterClosed: () => of(true)} as any)
  it('should open the dialog when clicking the add new entry button', () => {
    const openDialogSpy = spyOn(component.dialog,'open')
    let button = fixture.debugElement.nativeElement.querySelector('#addNewAddressButton');
    button.click();
    expect(openDialogSpy).toHaveBeenCalled();
  });

  it('should update the address list when an existing record has been edited', () => {
    component.addresses = mockAddresses;
    const updatedAddress = {id: "1", name: "Ash2", surname: "Ketchum", phoneNumber: "07812378410"};
    const updateAddressSpy = addressBookServiceMock.updateAddress.and.returnValue(EMPTY);
    const openDialogSpy = spyOn(component.dialog,'open').and.returnValue({afterClosed: () => of(updatedAddress)} as any);
    component.openAddressForm("1");
    expect(updateAddressSpy).toHaveBeenCalled();
  });

  it('should add a new address when the user has added a new address entry', () => {
    component.addresses = mockAddresses
    const newAddress = {id: "99", name: "new", surname: "new", phoneNumber: "07812378410"};
    const addAddressSpy = addressBookServiceMock.addAddress.and.returnValue(EMPTY);
    const openDialogSpy = spyOn(component.dialog,'open').and.returnValue({afterClosed: () => of(newAddress)} as any);
    component.openAddressForm("99");
    expect(addAddressSpy).toHaveBeenCalled();
  });

  it('should delete an address entry when the user has clicked the delete button', () => {
    component.addresses = mockAddresses
    const deleteAddressSpy = addressBookServiceMock.deleteAddress.and.returnValue(EMPTY);
    component.deleteAddress("1")
    expect(deleteAddressSpy).toHaveBeenCalled();
  });

});

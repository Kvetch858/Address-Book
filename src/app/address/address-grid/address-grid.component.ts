import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { filter, Observable, Subject, switchMap, tap } from 'rxjs';
import { SubSink } from 'subsink';
import { AddressBookService } from '../services/address-book.service';
import { Address } from './models/address.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddressFormDialogComponent } from '../address-form-dialog/address-form-dialog.component';
import { FormControl } from '@angular/forms';

interface Column {
  header: string;
  field: string,
  sortable?: boolean;
  sortOrder?: SortOrder,
  sortFunction?: (col: Column) => void
}
type SortOrder = 'asc' | 'desc' | 'none';

@Component({
  selector: 'app-address-grid',
  templateUrl: './address-grid.component.html',
  styleUrls: ['./address-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddressGridComponent {

  readonly requestData$ = new Subject<void>(); // used so we can set up a loading spinner while we wait for the http request to complete
  subs = new SubSink(); //lets you destroy all subscriptions at once
  addresses: Address[] = [];
  data$: Observable<any>;
  dataSource = new MatTableDataSource<Address>([]);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  searchNameControl: FormControl = new FormControl('');
  columnHeaders: Column[] = [];
  
  constructor(
    private cd: ChangeDetectorRef,
    private addressBookService: AddressBookService,
    public dialog: MatDialog) {

  }

  ngOnInit() {
    // In reality, would probably be using ag-grid or similar, as it comes with inbuilt search, sort and pagination
    this.setUpColumnHeaders();
    this.setUpPagination();
    this.setupFormControls();
    this.setupSubs();
    this.refreshData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setUpColumnHeaders(){
    this.columnHeaders = [
      {
        header: "Name",
        field: "name",
        sortable: true,
        sortOrder: 'none',
        sortFunction: (col) => { this.sortColumn(col)}
      },
      {
        header: "Surname",
        field: "surname",
        sortable: true,
        sortOrder: 'none',
        sortFunction: (col) => { this.sortColumn(col) }
      },
      {
        header: "Phone Number",
        field: "phoneNumber",
      },
      {
        header: "Edit",
        field: "edit"
      },
      {
        header: "Delete",
        field: "delete"
      }
    ]
  }

  setUpPagination(){
    const paginatorIntl = this.paginator._intl;
    paginatorIntl.nextPageLabel = '';
    paginatorIntl.previousPageLabel = '';
    this.dataSource.paginator = this.paginator;
  }

  setupFormControls(){
    this.subs.sink = this.searchNameControl.valueChanges.subscribe((v: string) => {
      if(!v) {
        //remove filter
        this.dataSource.data = this.getResortedData(this.addresses);
      }
      else {
        this.searchByName(v);
      }
    });
  }

  setupSubs() {
    this.data$ = this.dataSource.connect();
    this.subs.sink = this.requestData$
    .pipe(
      tap(() => {
        // would show the loading spinner in the grid here, if I implemented one
      }),
      switchMap(() => 
        this.addressBookService.getAddresses()
      ),
    )
    .subscribe({
      next: (addresses) => {
        // would hide the loading spinner here, if I implemented one
        this.addresses = addresses;
        // need to reapply the sort;
        this.dataSource.data = this.getResortedData(addresses);
        this.cd.markForCheck();
      },
      error: () => {
      // handle error as appropriate
      // e.g in ag-grid we can display an "unable to retrieve data" message within the grid
      }
   });

  }

  refreshData() {
    this.requestData$.next();
  }

  openAddressForm(id: string | undefined = undefined){
    const config = new MatDialogConfig();
    const addressEntry = this.addresses.find(ad => ad.id === id);
    config.data = addressEntry;
    config.minWidth = "300px";
    const dialogRef = this.dialog.open(AddressFormDialogComponent, config);
    this.subs.sink = dialogRef.afterClosed().pipe(
      filter((data) => data)
    ) .subscribe({
      next: (address: Address) => {
       addressEntry ? this.updateAddress(address): this.addNewAddress(address);
      },
      error: () => {
        //handle error as appropriate e.g. error dialog
      }
    });
  }

  updateAddress(address: Address) {
    this.subs.sink = this.addressBookService.updateAddress(address)
    .subscribe({
      next: () => {
        this.refreshData();
      },
      error: () => {
      // handle error as appropriate
      }
    });
  }

  addNewAddress(address: Address) {
    this.subs.sink = this.addressBookService.addAddress(address)
    .subscribe({
      next: () => {
        this.refreshData();
      },
      error: () => {
      // handle error as appropriate
      }
    });
  }

  deleteAddress(id: string){
    // would usually add a confirmation dialog here
    this.subs.sink = this.addressBookService.deleteAddress(id)
    .subscribe({
      next: () => {
        this.refreshData();
      },
      error: () => {
      // handle error as appropriate
      }
    });
  }

  sortColumn(column: Column) {
    const newDirection = this.getSortDirection(column.sortOrder as SortOrder);
    (this.columnHeaders.find(c => c.field === column.field) as Column).sortOrder = newDirection;
    const key = column.field as Exclude<keyof Address, "phoneNumber">
    if(newDirection === 'asc') {
      this.dataSource.data = [...this.addresses].sort((a, b) => a[key].toLowerCase().localeCompare(b[key].toLowerCase()));

    }
    else if (newDirection === 'desc'){
      this.dataSource.data = [...this.addresses].sort((a, b) => b[key].toLowerCase().localeCompare(a[key].toLowerCase()));
    }
    else {
      this.dataSource.data = this.addresses;
    }
    if(newDirection === 'asc' || newDirection === 'desc'){
      //unset sort for other columns
      this.columnHeaders.filter(c => c.field !== column.field).forEach((c) => {
        c.sortOrder = 'none';
      });
    }
    this.cd.markForCheck();
  }

  getSortDirection(existingSortDirection: SortOrder): SortOrder {
    if(existingSortDirection === 'asc') {
      return 'desc';
    }
    else if(existingSortDirection === 'desc') {
      return 'none'
    }
    //sort order set to none
    else {
      return 'asc'
    }
  }

  getResortedData(addresses:Address[]) {
    const sortedColumn = this.columnHeaders.find(c => c.sortOrder && c.sortOrder !== 'none');
    if(sortedColumn) {
      const key = sortedColumn.field as Exclude<keyof Address, "phoneNumber">
      const sortDirection = sortedColumn.sortOrder;
      if(sortDirection === 'asc') {
        return addresses.sort((a, b) => a[key].toLowerCase().localeCompare(b[key].toLowerCase()));
      }
      else {
        return addresses.sort((a, b) => b[key].toLowerCase().localeCompare(a[key].toLowerCase()));
      }
    }
    else {
      return addresses;
    }
  }

  searchByName(searchString: string){
    const filteredData = this.addresses.filter(ad => ad.name.toLowerCase().includes(searchString) || ad.surname.toLowerCase().includes(searchString));
    this.dataSource.data = this.getResortedData(filteredData);
  }

}

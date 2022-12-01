import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Address } from '../address-grid/models/address.model';
const { v4: uuidv4 } = require('uuid');

@Injectable({
  providedIn: 'root'
})
export class AddressBookService {

  private addresses: Address[] = [
    {id: uuidv4(), name: "Ash", surname: "Ketchum", phoneNumber: "07812378410"},
    {id: uuidv4(), name: "Spongebob", surname: "SquarePants", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Patrick", surname: "Star", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Samus", surname: "Aran", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Ronald", surname: "Weasley", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Howl", surname: "Pendragon", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Adol", surname: "Kristin"},
    {id: uuidv4(), name: "Frodo", surname: "Baggins", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Hiccup", surname: "Horrendous", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Nancy", surname: "Wheeler", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Toph", surname: "Beifong", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Clark", surname: "Kent", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Mario", surname: "Mario", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Thor", surname: "Odinson", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Dionysus", surname: "Zagreus", phoneNumber: "9992221112"},
    {id: uuidv4(), name: "Nyota", surname: "Uhura", phoneNumber: "9992221112"}
  ];

  getAddresses(): Observable<Address[]> {
    return of(this.addresses);
  }

  updateAddress(updatedAddress: Address) {
    const index = this.addresses.findIndex(add => add.id === updatedAddress.id);
    this.addresses[index] = updatedAddress;
    // post this.addresses to the api if we had one
    return of({}); // returns something if post is successful 
  }

  addAddress(address: Address) {
    this.addresses.unshift(address);
    return of({}); // returns something if post is successful 
  }

  deleteAddress(id: string) {
    this.addresses = this.addresses.filter(ad => ad.id !== id);
    return of({}); // returns something if post is successful 
  }


  constructor() { }
}

import { Component } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { map, filter, tap } from 'rxjs/operators';
import 'rxjs/add/observable/of';

class Book {
  constructor(public title: string) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  booksRef: AngularFireList<Book>;
  books: Observable<Book[]>;

  private bookCounter = 0;

  afRef: AngularFireStorageReference;
  afTask: AngularFireUploadTask;
  uploadProgress: Observable<number>;
  downloadUrl: Observable<string>;
  uploadState: Observable<string>;

  constructor(private afStorage: AngularFireStorage, private afDb: AngularFireDatabase) { 
    this.booksRef = afDb.list('books');
    this.books = this.booksRef.valueChanges();
  }

  addBook() {
    let newBook = new Book(`Sample Book #${this.bookCounter++}`);
    this.booksRef.push(newBook);
  }

  upload(event) {
    const fileName = Math.random().toString(36).substring(2);
    console.log(`id: ${fileName}`);
    
    this.afRef = this.afStorage.ref(fileName);
    this.afTask = this.afRef.put(event.target.files[0]);
    this.uploadState = this.afTask.snapshotChanges().pipe(map(s => s.state), tap(x => console.log(`State: ${x}`)));
    this.uploadProgress = this.afTask.percentageChanges();
    //this.uploadProgress = this.afTask.percentageChanges().pipe(tap(x => console.log(`Progress: ${x}`)));
    this.downloadUrl = this.afTask.downloadURL();
  }

  cancelUpload() {
    this.afTask.cancel();
    this.uploadState = Observable.of('');
    this.uploadProgress = Observable.of(0);
  }
}

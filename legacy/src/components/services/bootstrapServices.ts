import { httpService } from './httpService'
import { authService } from './authService'
import { embedlyService } from './embedlyService';
import { FirebaseStorageService } from './firebaseStorageService';
import { SearchBarService } from './searchBar';

export const ApplicationServices: Array<any> = [
    httpService,
    authService,
    embedlyService,
    FirebaseStorageService,
    SearchBarService
];
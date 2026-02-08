import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

    
@Injectable({providedIn: 'root'})
export class ApiService {
    constructor(private http: HttpClient) {}

    createApplication(application: any) {
        return this.http.post('/ApplicationManager/CreateApplication', application);
    }
    
    getApplications() {
        return this.http.get('/ApplicationManager/GetApplications');
    }

    getApplication(applicationNumber: string) {
        return this.http.get(`/ApplicationManager/GetApplication/${applicationNumber}`);
    }

    updateApplication(applicationNumber: string, application: any) {
        return this.http.put(`/ApplicationManager/UpdateApplication/${applicationNumber}`, application);
    }

    deleteApplication(applicationNumber: string) {
        return this.http.delete(`/ApplicationManager/DeleteApplication/${applicationNumber}`);
    }
}
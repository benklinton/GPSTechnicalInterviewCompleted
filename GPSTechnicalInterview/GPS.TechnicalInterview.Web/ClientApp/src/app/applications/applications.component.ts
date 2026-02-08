import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../api.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit {

  public displayedColumns: Array<string> = ['applicationNumber', 'amount', 'dateApplied', 'status', 'actions']; 
  public applications: any[] = [];

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.apiService.getApplications().subscribe({
      next: (data: any) => {
        console.log('Loaded applications:', data);
        this.applications = data;
      },
      error: (error: any) => {
        console.error('Error loading applications:', error);
        // considered adding a snackbar here to notify user of load failure, but since this is the main screen and we want to avoid overwhelming them with errors, we'll just log it for now.
      }
    });
  }

  getStatusName(status: number): string {
    const statusNames: { [key: number]: string } = { 0: 'New', 1: 'Approved', 2: 'Funded' };
    return statusNames[status] || 'Unknown';
  }

  editApplication(application: any) {
    this.router.navigate(['/edit-application', application.applicationNumber]);
  }

  deleteApplication(application: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Application',
        message: `Are you sure you want to delete application ${application.applicationNumber}? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.apiService.deleteApplication(application.applicationNumber).subscribe({
          next: (response: any) => {
            this.snackBar.open(response?.message || 'Application deleted successfully!', 'Close', { duration: 3000 });
            this.loadApplications(); // Reload the list
          },
          error: (error: any) => {
            console.error('Error deleting application:', error);
            this.snackBar.open(error?.message || 'Failed to delete application.', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}

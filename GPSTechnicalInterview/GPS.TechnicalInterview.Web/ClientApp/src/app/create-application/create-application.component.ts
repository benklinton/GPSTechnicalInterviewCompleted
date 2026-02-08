import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-application',
  templateUrl: './create-application.component.html',
  styleUrls: ['./create-application.component.scss']
})
export class CreateApplicationComponent {

  public applicationForm: FormGroup;
  public statuses: Array<string> = ['New', 'Approved', 'Funded'];

  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) {
    this.applicationForm = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: [null, [Validators.required, Validators.email]],
      applicationNumber: [null, [Validators.required]],
      status: ['New', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(1)]],
      monthlyPayAmount: [null, [Validators.min(0)]],
      terms: [null, [Validators.required, Validators.min(1)]],
    });
  }
  saveApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.applicationForm.value;
    const statusMap: { [key: string]: number } = { 'New': 0, 'Approved': 1, 'Funded': 2 };

    // payload structure should match the expected format on the backend (square block goes into square hole)
    const payload = {
      applicationNumber: formValue.applicationNumber,
      personalInformation: {
        name: {
          first: formValue.firstName,
          last: formValue.lastName
        },
        phoneNumber: formValue.phoneNumber,
        email: formValue.email
      },
      loanTerms: {
        amount: formValue.amount,
        monthlyPaymentAmount: formValue.monthlyPayAmount,
        term: formValue.terms
      },
      status: statusMap[formValue.status] ?? 0
    };

    this.apiService.createApplication(payload).subscribe({
      next: (response: any) => {
        this.snackBar.open(response?.message, 'Close', { duration: 3000 });
        this.router.navigate(['/application-list']);
      },
      error: (error: any) => {
        this.snackBar.open(error?.message || 'Failed to save application. Please try again.', 'Close', { duration: 5000 });
        // The error message should ideally come from the backend but I also added a fallback in case it doesn't
      }
    });
  }
}

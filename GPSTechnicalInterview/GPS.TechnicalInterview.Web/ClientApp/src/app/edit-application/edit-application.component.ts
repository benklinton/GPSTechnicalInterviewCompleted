import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-application',
  templateUrl: './edit-application.component.html',
  styleUrls: ['./edit-application.component.scss']
})

export class EditApplicationComponent implements OnInit {
    public applicationEditForm: FormGroup;
    public statuses: Array<string> = ['New', 'Approved', 'Funded'];
    private applicationNumber: string = '';

    constructor(
        private formBuilder: FormBuilder, 
        private apiService: ApiService, 
        private snackBar: MatSnackBar, 
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.applicationEditForm = this.formBuilder.group({
            firstName: [null, [Validators.required]],
            lastName: [null, [Validators.required]],
            phoneNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            email: [null, [Validators.required, Validators.email]],
            applicationNumber: [{ value: null, disabled: true }, [Validators.required]],
            status: ['New', [Validators.required]],
            amount: [null, [Validators.required, Validators.min(1)]],
            monthlyPayAmount: [null, [Validators.min(0)]],
            terms: [null, [Validators.required, Validators.min(1)]],
        });
    }

    ngOnInit(): void {
        this.applicationNumber = this.route.snapshot.params['id'];
        this.loadApplication();
    }

    loadApplication(): void {
        this.apiService.getApplication(this.applicationNumber).subscribe({
            next: (data: any) => {
                const statusNames: { [key: number]: string } = { 0: 'New', 1: 'Approved', 2: 'Funded' };
                
                this.applicationEditForm.patchValue({
                    firstName: data.personalInformation?.name?.first,
                    lastName: data.personalInformation?.name?.last,
                    phoneNumber: data.personalInformation?.phoneNumber,
                    email: data.personalInformation?.email,
                    applicationNumber: data.applicationNumber,
                    status: statusNames[data.status] || 'New',
                    amount: data.loanTerms?.amount,
                    monthlyPayAmount: data.loanTerms?.monthlyPaymentAmount,
                    terms: data.loanTerms?.term
                });
            },
            error: (error) => {
                console.error('Error loading application:', error);
                // Again considered adding a snackbar here, but decided to play it safe in the end
            }
        });
    }

    updateApplication(): void {
        if (this.applicationEditForm.invalid) {
            this.applicationEditForm.markAllAsTouched();
            // A snackbar feels more appropriate here since the user is actively trying to save changes and needs immediate feedback.
            this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
            return;
        }

        const formValue = this.applicationEditForm.getRawValue();
        const statusMap: { [key: string]: number } = { 'New': 0, 'Approved': 1, 'Funded': 2 };

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

        this.apiService.updateApplication(this.applicationNumber, payload).subscribe({
            next: (response: any) => {
                this.snackBar.open(response?.message, 'Close', { duration: 3000 });
                this.router.navigate(['/applications']);
            },
            error: (error: any) => {
                console.error('Error updating application:', error);
                this.snackBar.open(error?.message || 'Failed to update application. Please try again.', 'Close', { duration: 5000 });
                // Again another snackbar for immediate user feedback but at this point I think im overthinking the error handling a bit.
            }
        });
    }
}
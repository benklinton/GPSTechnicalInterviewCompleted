import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  public headerTitle: string = '';
  public currentRoute: string = '';

  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.updateTitle();
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle(): void {
    this.currentRoute = this.router.url;
    
    // Check if it's an edit route
    if (this.currentRoute.startsWith('/edit-application/')) {
      const id = this.currentRoute.split('/').pop();
      this.headerTitle = `Edit Application - ${id}`;
    } else if (this.currentRoute === '/create-application') {
      this.headerTitle = 'Create Application';
    } else {
      this.headerTitle = 'Application Manager';
    }
  }
}

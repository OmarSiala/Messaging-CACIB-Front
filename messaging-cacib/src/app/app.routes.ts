import { Routes } from '@angular/router';
import { MessagingDashboardComponent } from './features/messaging/pages/messaging-dashboard.component';

export const routes: Routes = [
	{
		path: '',
		component: MessagingDashboardComponent
	},
	{
		path: '**',
		redirectTo: ''
	}
];

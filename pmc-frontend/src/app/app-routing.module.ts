import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MailsComponent } from './components/mails/mails.component';
import { AuthRedirectGuard } from './interfaces/auth/auth-redirect.guard';
import { AuthGuard } from './interfaces/auth/auth.guard';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthRedirectGuard] },
  { path: 'mails', component: MailsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' } // Fallback für nicht existierende Routen
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,           // Wenn auf true gesetzt, wird Hash-basierte Navigation verwendet (#)
    onSameUrlNavigation: 'reload', // Bei Navigation zur gleichen URL neu laden
    scrollPositionRestoration: 'enabled', // Scrollposition wiederherstellen
    urlUpdateStrategy: 'eager'  // URL sofort aktualisieren, nicht verzögert
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

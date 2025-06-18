import { Routes } from '@angular/router';
import { HomeComponent } from './frontoffice/components/home/home.component';
import { RepertoireMusicalComponent } from './frontoffice/components/repertoire-musical/repertoire-musical.component';
import { LoginComponent } from './frontoffice/components/login/login.component';
import { EspaceAdminComponent } from './backoffice/components/espace-admin/espace-admin.component';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './frontoffice/components/register/register.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'repertoire',
        component: RepertoireMusicalComponent,
        canActivate: [AuthGuard],
        data: { 
            requiresMembre: true,
            requiresAcceptedStatus: true
        }
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'espace-admin',
        component: EspaceAdminComponent,
        canActivate: [AuthGuard],
        data: { 
            requiresAdmin: true,
            requiresAcceptedStatus: true
        }
    },

    {
        path: 'register',
        component: RegisterComponent,
        
    },


    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    }
];

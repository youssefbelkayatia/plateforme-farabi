import { Routes } from '@angular/router';
import { HomeComponent } from './frontoffice/components/home/home.component';
import { RepertoireMusicalComponent } from './frontoffice/components/repertoire-musical/repertoire-musical.component';
import { LoginComponent } from './frontoffice/components/login/login.component';
import { EspaceAdminComponent } from './backoffice/components/espace-admin/espace-admin.component';
export const routes: Routes = [

    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'repertoire',
        component: RepertoireMusicalComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'espace-admin',
        component: EspaceAdminComponent,
    },


    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      }




];

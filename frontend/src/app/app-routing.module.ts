import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TechnologiesComponent } from './technology/technologies/technologies.component';
import { TechnologyDetailsComponent } from './technology/technology-details/technology-details.component';
import { AuthGuard } from './auth.guard';
import { AddViewComponent } from './technology/add-view/add-view.component';
import { EditViewComponent } from './technology/edit-view/edit-view.component';
import { BugReportViewComponent } from './contact/bug-report-view/bug-report-view.component';
import { FeatureRequestViewComponent } from './contact/feature-request-view/feature-request-view.component';
import { FeedbackViewComponent } from './contact/feedback-view/feedback-view.component';
import { ReportFormComponent } from './reports/report-form/report-form.component';
import { CanDeactivateGuard } from './technology/add-view-can-deactivate-guard.service';
import { AddSubscriptionComponent } from './subscription/add-subscription/add-subscription.component';
import { SubscriptionOverviewComponent } from './subscription/subscription-overview/subscription-overview.component';
import { EditSubscriptionComponent } from './subscription/edit-subscription/edit-subscription.component';
import { AddProjectComponent } from './project/add-project/add-project.component';
import { subscriptionOwnerGuard } from './subscription-owner.guard';
import { EditProjectComponent } from './project/edit-project/edit-project.component';
import { ProjectReferenceComponent } from './project/project-reference/project-reference.component';
import { ProjectDetailPageComponent } from './project/project-detail-page/project-detail-page.component';
import { ProjectsComponent } from './project/projects/projects.component';
import { ProjectHistoryComponent } from './project/project-history/project-history.component';
import { RadarContainerComponent } from './radar-container/radar-container.component';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { UserManagementComponent } from './admin-page/user-management/user-management.component';
import { FeatureFlagManagementComponent } from './admin-page/feature-flag-management/feature-flag-management.component';
import { DeepExpertManagementComponent } from './admin-page/deep-expert-management/deep-expert-management.component';
import { HistoryComponent } from './technology/history/history.component';
import { CertificateViewComponent } from './technology/certificate-view/certificate-view.component';
import { ErrorPageComponent } from './utils/error-page/error-page.component';
import { MaintenancePageComponent } from './utils/maintenance-page/maintenance-page.component';
import { TecswapPageComponent } from './tecswap/tecswap-page/tecswap-page.component';

const routes: Routes = [
  { path: '', component: RadarContainerComponent, canActivate: [AuthGuard] },
  {
    path: 'technologies',
    component: TechnologiesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'detail/:id',
    component: TechnologyDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'technologies/add',
    component: AddViewComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'detail/:id/edit',
    component: EditViewComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'technology/:id/history',
    component: HistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'kontakt/feature-request',
    component: FeatureRequestViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'kontakt/bug-report',
    component: BugReportViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'kontakt/feedback',
    component: FeedbackViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'report',
    component: ReportFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'subscription',
    component: AddSubscriptionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'subscription/overview',
    component: SubscriptionOverviewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'subscription/:id/edit',
    component: EditSubscriptionComponent,
    canActivate: [AuthGuard, subscriptionOwnerGuard],
  },
  {
    path: 'projects/add',
    component: AddProjectComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'project/:id/edit',
    component: EditProjectComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: 'projects/reference',
    component: ProjectReferenceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project/:id',
    component: ProjectDetailPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'project/:id/history',
    component: ProjectHistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'certificates',
    component: CertificateViewComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'tecswaps',
    component: TecswapPageComponent,
    canActivate: [AuthGuard],
    data: { roles: ['TECSWAP'] },
  },
  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/user-management',
    component: UserManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/feature-flag-management',
    component: FeatureFlagManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'admin/deep-expert-management',
    component: DeepExpertManagementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'maintenance',
    component: MaintenancePageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

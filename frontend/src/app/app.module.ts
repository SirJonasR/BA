import { NgModule, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { RemoveDialogComponent } from './utils/remove-dialog/remove-dialog.component';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { LoggingInterceptor } from './logging-interceptor';
import { ErrorPageComponent } from './utils/error-page/error-page.component';
import { MatCardModule } from '@angular/material/card';
import { SearchbarComponent } from './header/searchbar/searchbar.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NavigationComponent } from './header/navigation/navigation.component';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatureRequestComponent } from './contact/feature-request/feature-request.component';
import { BugReportComponent } from './contact/bug-report/bug-report.component';
import { FeedbackComponent } from './contact/feedback/feedback.component';
import { BugReportViewComponent } from './contact/bug-report-view/bug-report-view.component';
import { FeatureRequestViewComponent } from './contact/feature-request-view/feature-request-view.component';
import { FeedbackViewComponent } from './contact/feedback-view/feedback-view.component';
import { TechnologyTileComponent } from './tile-view/technology-tile/technology-tile.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { TileViewComponent } from './tile-view/tile-view.component';
import { ReportFormComponent } from './reports/report-form/report-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { TechSearchbarComponent } from './reports/tech-searchbar/tech-searchbar.component';
import { SubscriptionFormComponent } from './subscription/subscription-form/subscription-form.component';
import { AddSubscriptionComponent } from './subscription/add-subscription/add-subscription.component';
import { SubscriptionOverviewComponent } from './subscription/subscription-overview/subscription-overview.component';
import { EditSubscriptionComponent } from './subscription/edit-subscription/edit-subscription.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CustomerSearchbarComponent } from './reports/customer-searchbar/customer-searchbar.component';
import { AddProjectComponent } from './project/add-project/add-project.component';
import { TechnologyFormDialogComponent } from './project/project-form/technology-form-dialog/technology-form-dialog.component';
import { EditProjectComponent } from './project/edit-project/edit-project.component';
import { ProjectFormComponent } from './project/project-form/project-form.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ProjectReferenceComponent } from './project/project-reference/project-reference.component';
import { ProjectDetailPageComponent } from './project/project-detail-page/project-detail-page.component';
import { ProjectsComponent } from './project/projects/projects.component';
import { ProjectSearchfieldComponent } from './project/project-searchfield/project-searchfield.component';
import { PopupInfoComponent } from './utils/popup-info/popup-info.component';
import { ProjectHistoryComponent } from './project/project-history/project-history.component';

import { RadarContainerModule } from './radar-container/radar-container.module';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { UserManagementComponent } from './admin-page/user-management/user-management.component';
import { MatListModule } from '@angular/material/list';
import { CommentDialogComponent } from './tecswap/comment-dialog/comment-dialog.component';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { FeatureFlagManagementComponent } from './admin-page/feature-flag-management/feature-flag-management.component';
import { DeepExpertManagementComponent } from './admin-page/deep-expert-management/deep-expert-management.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TechnologiesComponent } from './technology/technologies/technologies.component';
import { TechnologyDetailsComponent } from './technology/technology-details/technology-details.component';
import { EditFormComponent } from './technology/edit-form/edit-form.component';
import { AddViewComponent } from './technology/add-view/add-view.component';
import { EditViewComponent } from './technology/edit-view/edit-view.component';
import { HistoryComponent } from './technology/history/history.component';
import { CurrentCharactersCounterComponent } from './technology/current-characters-counter/current-characters-counter.component';
import { TagsComponent } from './technology/edit-form/tags/tags.component';
import { UndefinedDialogComponent } from './technology/undefined-dialog/undefined-dialog.component';
import { CertificateFieldComponent } from './technology/edit-form/certificate-field/certificate-field.component';
import { CertificateViewComponent } from './technology/certificate-view/certificate-view.component';
import { CertificateSearchfieldComponent } from './technology/edit-form/certificate-field/certificate-searchfield/certificate-searchfield.component';
import { TecswapPageComponent } from './tecswap/tecswap-page/tecswap-page.component';
import { ViewCommentsDialogComponent } from './tecswap/view-comments-dialog/view-comments-dialog.component';
import { CanDeactivateGuard } from './technology/add-view-can-deactivate-guard.service';
import { IndustrySearchfieldComponent } from './project/industry-searchfield/industry-searchfield.component';
import { ToolListComponent } from './utils/list-view/tool-list/tool-list.component';
import { DatePickerRangeComponent } from './utils/date-picker-range/date-picker-range.component';
import { DeepExpertTableComponent } from './utils/deep-expert-table/deep-expert-table.component';
import { FilterGroupComponent } from './utils/filter-group/filter-group.component';
import { TechnologyService } from './services/technology.service';
import { MailService } from './services/mail.service';
import { UserHandlingService } from './services/user-handling.service';
import { UserSubscriptionService } from './services/user-subscription.service';
import { MaintenancePageComponent } from './utils/maintenance-page/maintenance-page.component';

function initializeKeycloak(keycloak: KeycloakService): () => Promise<boolean> {
  return () =>
    keycloak.init({
      config: environment.keycloak,
      loadUserProfileAtStartUp: true,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
      },
    });
}

registerLocaleData(localeDe);
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TechnologiesComponent,
    TechnologyDetailsComponent,
    ToolListComponent,
    EditFormComponent,
    AddViewComponent,
    EditViewComponent,
    RemoveDialogComponent,
    HistoryComponent,
    CurrentCharactersCounterComponent,
    ErrorPageComponent,
    SearchbarComponent,
    NavigationComponent,
    FeatureRequestComponent,
    BugReportComponent,
    FeedbackComponent,
    BugReportViewComponent,
    FeatureRequestViewComponent,
    FeedbackViewComponent,
    TechnologyTileComponent,
    TileViewComponent,
    TagsComponent,
    ReportFormComponent,
    TechSearchbarComponent,
    DatePickerRangeComponent,
    CustomerSearchbarComponent,
    SubscriptionFormComponent,
    AddSubscriptionComponent,
    SubscriptionOverviewComponent,
    EditSubscriptionComponent,
    UndefinedDialogComponent,
    AddProjectComponent,
    TechnologyFormDialogComponent,
    EditProjectComponent,
    ProjectFormComponent,
    ProjectReferenceComponent,
    CertificateFieldComponent,
    ProjectDetailPageComponent,
    ProjectsComponent,
    ProjectSearchfieldComponent,
    CertificateViewComponent,
    PopupInfoComponent,
    CertificateSearchfieldComponent,
    ProjectHistoryComponent,
    TecswapPageComponent,
    AdminPageComponent,
    UserManagementComponent,
    CommentDialogComponent,
    ViewCommentsDialogComponent,
    FeatureFlagManagementComponent,
    DeepExpertManagementComponent,
    DeepExpertTableComponent,
    FilterGroupComponent,
    IndustrySearchfieldComponent,
    MaintenancePageComponent,
  ],
  imports: [
    MatPaginatorModule,
    MatSortModule,
    BrowserAnimationsModule,
    MatTableModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    KeycloakAngularModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    LMarkdownEditorModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSidenavModule,
    MatChipsModule,
    MatRadioModule,
    MatSlideToggleModule,
    RadarContainerModule,
    MatListModule,
    MatProgressBarModule,
  ],
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    { provide: LOCALE_ID, useValue: 'de' },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 2500, horizontalPosition: 'right' },
    },
    TechnologyService,
    MailService,
    UserHandlingService,
    CanDeactivateGuard,
    UserSubscriptionService,
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import {ClipboardModule} from '@angular/cdk/clipboard';
import {CdkTreeModule} from '@angular/cdk/tree';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSortModule} from '@angular/material/sort';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTreeModule} from '@angular/material/tree';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';

import {ApiModule} from '../../../lib/api/module';
import {CopyButtonModule} from '../../helpers/copy_button/copy_button_module';
import {DrawerLinkModule} from '../../helpers/drawer_link/drawer_link_module';
import {TimestampModule} from '../../timestamp/module';
import {HelpersModule} from '../helpers/module';

import {ArtifactCollectorFlowDetails} from './artifact_collector_flow_details';
import {CollectBrowserHistoryDetails} from './collect_browser_history_details';
import {CollectFilesByKnownPathDetails} from './collect_files_by_known_path_details';
import {CollectMultipleFilesDetails} from './collect_multiple_files_details';
import {CollectSingleFileDetails} from './collect_single_file_details';
import {DefaultDetails} from './default_details';
import {ExecutePythonHackDetails} from './execute_python_hack_details';
import {FileFinderDetails} from './file_finder_details';
import {InterrogateDetails} from './interrogate_details';
import {LaunchBinaryDetails} from './launch_binary_details';
import {ListDirectoryDetails} from './list_directory_details';
import {ListProcessesDetails} from './list_processes_details';
import {MultiGetFileDetails} from './multi_get_file_details';
import {NetstatDetails} from './netstat_details';
import {OnlineNotificationDetails} from './online_notification_details';
import {OsqueryDetails} from './osquery_details';
import {ReadLowLevelDetails} from './read_low_level_details';
import {TimelineDetails} from './timeline_details';


const COMPONENTS = [
  ArtifactCollectorFlowDetails,
  CollectBrowserHistoryDetails,
  CollectFilesByKnownPathDetails,
  CollectMultipleFilesDetails,
  CollectSingleFileDetails,
  DefaultDetails,
  ExecutePythonHackDetails,
  FileFinderDetails,
  InterrogateDetails,
  LaunchBinaryDetails,
  ListDirectoryDetails,
  ListProcessesDetails,
  MultiGetFileDetails,
  NetstatDetails,
  OnlineNotificationDetails,
  OsqueryDetails,
  ReadLowLevelDetails,
  TimelineDetails,
];

/**
 * Module for the flow_picker details component.
 */
@NgModule({
  imports: [
    ApiModule,
    BrowserAnimationsModule,
    ClipboardModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CdkTreeModule,
    MatButtonModule,
    MatCardModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatTreeModule,

    CopyButtonModule,
    DrawerLinkModule,
    HelpersModule,
    TimestampModule,
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  entryComponents: COMPONENTS
})
export class PluginsModule {
}

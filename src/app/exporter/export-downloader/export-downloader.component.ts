import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../alert/alert.component';
import { ExporterService } from '../exporter.service';

@Component({
  selector: 'app-export-downloader',
  templateUrl: './export-downloader.component.html',
  styleUrls: ['./export-downloader.component.css']
})
export class ExportDownloaderComponent implements OnInit, AfterViewInit {
  /**
   * An informational alert
   */
  @ViewChild('alert')
  alert: AlertComponent;
  /**
   * Determines if an error has occurred
   */
  error: boolean;
  /**
   * The filename to download
   */
  filename: string;

  constructor(private exportService: ExporterService, 
    private route: ActivatedRoute, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.filename = this.route.snapshot.queryParams['filename'];
  }

  ngAfterViewInit(): void {
    if (!this.filename) {
      this.alert.displayMessage('You need to specify a filename in the URL', true);
    } else {
      this.download();
      this.cd.detectChanges();
    }
  }

  download() {
    this.error = false;
    this.alert.displayMessage('File downloading...');

    this.exportService.downloadExported(this.filename)
      .subscribe({
        next: file => {
          file.save();
          this.alert.displayMessage('File downloaded successfully');
        },
        error: e => {
          this.alert.displayMessage(e, true);
          this.error = true;
        }
      });
  }
}

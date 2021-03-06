import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
} from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';

import { DPCellDefinitionDirective } from './cell-definition/cell-definition.directive';
import { IDPRowExpandableConfig } from './row-expandable/row-expandable.component';

@Component({
  selector: 'dp-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class DPTableComponent<T> implements OnInit, OnDestroy, AfterViewInit {

  @ContentChildren(DPCellDefinitionDirective)
    public definedTemplates!: QueryList<DPCellDefinitionDirective>;

  public cellTemplates: object = {};
  public templatesLoaded = false;

  @ViewChild(MatTable) table: MatTable<T>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @Input() public data: Observable<T[]>;
  @Input() public columns: IDPTableColumnConfig[] = [];
  @Input() public expandableConfig: IDPRowExpandableConfig;
  @Input() public mobileColumns: string[];
  @Input() public mobile: boolean;

  private columnNames: string[];

  public dataSource: MatTableDataSource<T>;
  public dataLength: number;

  private subs: Subscription[] = [];

  get definedCellTemplates() {
    return this.cellTemplates ? Object.keys(this.cellTemplates) : '';
  }

  get displayedColumns(): string[] {
    return this.mobile ?
      this.columnNames.filter(c => this.mobileColumns.includes(c)) :
      this.columnNames;
  }

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Detaching here, and reattaching in ngAfterViewInit prevents the
    // ExpressionChangedAfterItHasBeenCheckedError error. That error was happening
    // because we were changing important data in the view immediately after it was
    // initiated and checked.
    this.ref.detach();

    this.columnNames = this.columns.map(c => c.property);

    this.subs.push(
      this.data
        .subscribe(this.dataHandler.bind(this))
    );
  }

  dataHandler(data: T[]) {
    this.dataLength = data.length;
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.definedTemplates.forEach(t => {
      this.cellTemplates[t.getColumn()] = t.templateRef;
    });

    this.ref.reattach();
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}

/*****************************
 * Table Interfaces
 *****************************/
export interface IDPTableColumnConfig {
  property: string;
  header: string;
  cellFormat?: string;
}

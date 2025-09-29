import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FishTable } from './fish-table';

describe('FishTable', () => {
  let component: FishTable;
  let fixture: ComponentFixture<FishTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FishTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FishTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

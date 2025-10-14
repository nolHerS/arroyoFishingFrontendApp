import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCapture } from './create-capture';

describe('CreateCapture', () => {
  let component: CreateCapture;
  let fixture: ComponentFixture<CreateCapture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCapture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCapture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

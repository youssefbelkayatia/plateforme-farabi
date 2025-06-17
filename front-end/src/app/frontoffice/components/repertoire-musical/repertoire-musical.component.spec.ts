import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepertoireMusicalComponent } from './repertoire-musical.component';

describe('RepertoireMusicalComponent', () => {
  let component: RepertoireMusicalComponent;
  let fixture: ComponentFixture<RepertoireMusicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepertoireMusicalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepertoireMusicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

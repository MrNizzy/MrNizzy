import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectShowcaseComponent } from './project-showcase.component';

describe('ProjectShowcaseComponent', () => {
  let component: ProjectShowcaseComponent;
  let fixture: ComponentFixture<ProjectShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

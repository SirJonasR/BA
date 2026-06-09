import { of } from 'rxjs';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { TagsComponent } from './tags.component';
import { CertificateForm } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';

// Passe ggf. den Import-Pfad an deine FormValues-Definition an
export type FormValues = {
  name: string | null;
  description: string | null;
  shortDescription: string | null;
  tags: string[];
  categoryId: number | null;
  lifecycleId: number | null;
  pictureData: File | string | null;
  isNewPic: boolean;
  certificates: CertificateForm[];
  projectIds: number[];
  connectedTechnologyIds: number[];
  priority: boolean;
};

describe('TagsComponent (simple input)', () => {
  let component: TagsComponent;
  let fixture: ComponentFixture<TagsComponent>;
  let technologyService: jasmine.SpyObj<TechnologyService>;

  const makeValues = (tags: string[] = []): FormValues => ({
    name: null,
    description: null,
    shortDescription: null,
    tags,
    categoryId: null,
    lifecycleId: null,
    pictureData: null,
    isNewPic: false,
    certificates: [],
    projectIds: [],
    connectedTechnologyIds: [],
    priority: false,
  });

  beforeEach(async () => {
    // Spy für den Service anlegen
    technologyService = jasmine.createSpyObj<TechnologyService>(
      'TechnologyService',
      ['getTagSelection'],
    );

    // Default-Return: Observable<string[]>
    technologyService.getTagSelection.and.callFake(
      (_q?: string) => of(['java', 'angular', 'docker']), // <-- dein String-Array
    );

    await TestBed.configureTestingModule({
      declarations: [TagsComponent],
      imports: [
        FormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatAutocompleteModule, // wichtig statt Trigger/Event
      ],
      providers: [{ provide: TechnologyService, useValue: technologyService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsComponent);
    component = fixture.componentInstance;

    // Erst jetzt das @Input setzen, damit der Spy schon existiert
    component.values = makeValues();
    fixture.detectChanges();
  });

  function getInputEl(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;
  }

  function getRenderedTags(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('.tag-pill'))
      .map((de) => de.nativeElement as HTMLElement);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders initial tags', () => {
    component.values = makeValues(['one', 'two']);
    fixture.detectChanges();

    const pills = getRenderedTags();
    expect(pills.length).toBe(2);
    expect(pills[0].textContent).toContain('one');
    expect(pills[1].textContent).toContain('two');
  });

  it('adds a tag on Enter and clears the input', fakeAsync(() => {
    const spyEmit = spyOn(component.tagsChange, 'emit');

    const input = getInputEl();
    input.value = 'alpha';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const evt = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(evt);
    fixture.detectChanges();
    tick();

    expect(component.values.tags).toEqual(['alpha']);
    expect(spyEmit).toHaveBeenCalledWith(['alpha']);
    expect(input.value).toBe('');
  }));

  it('adds a tag on blur (if etwas im Feld steht)', fakeAsync(() => {
    const input = getInputEl();
    input.value = 'beta';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    tick();

    expect(component.values.tags.includes('beta')).toBeTrue();
  }));

  it('removes a tag via remove button', () => {
    component.values = makeValues(['alpha', 'beta']);
    fixture.detectChanges();

    const before = getRenderedTags();
    expect(before.length).toBe(2);

    // Klicke das erste "x"
    const removeBtn = fixture.debugElement.queryAll(
      By.css('.tag-pill button'),
    )[0];
    removeBtn.triggerEventHandler('click', {});
    fixture.detectChanges();

    const after = getRenderedTags();
    expect(after.length).toBe(1);
    expect(component.values.tags).toEqual(['beta']);
  });

  it('emits tagsChange when removing', () => {
    component.values = makeValues(['x', 'y']);
    fixture.detectChanges();

    const spyEmit = spyOn(component.tagsChange, 'emit');
    component.removeTag('x');
    expect(component.values.tags).toEqual(['y']);
    expect(spyEmit).toHaveBeenCalledWith(['y']);
  });

  it('trackByValue returns the tag string', () => {
    expect(component.trackByValue(0, 'hello')).toBe('hello');
  });

  it('ignores empty/whitespace-only entries', fakeAsync(() => {
    const input = getInputEl();
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    tick();

    expect(component.values.tags.length).toBe(0);
  }));

  it('trims and limits long tags to maxTagLength', fakeAsync(() => {
    component.maxTagLength = 5;
    fixture.detectChanges();

    const input = getInputEl();
    input.value = '   verylongtag   ';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    tick();

    expect(component.values.tags).toEqual(['veryl']); // 5 Zeichen
  }));
});

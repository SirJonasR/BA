import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';

import {
  HistoryDialogData,
  ViewCommentsDialogComponent,
} from './view-comments-dialog.component';
import { CommentResponse } from 'src/app/models/comment';

describe('ViewCommentsDialogComponent', () => {
  let component: ViewCommentsDialogComponent;
  let fixture: ComponentFixture<ViewCommentsDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ViewCommentsDialogComponent>>;

  const mockDialogDataEmpty: HistoryDialogData = {
    comments: [],
  };

  const mockCommentsData: CommentResponse[] = [
    {
      text: 'This is a test comment',
      authorUsername: 'testuser1',
      date: '2024-01-15T10:30:00',
      changes: {
        status: 'draft -> published',
        priority: 'low -> high',
        isActive: 'false -> true',
      },
    },
    {
      text: 'Another test comment',
      authorUsername: 'testuser2',
      date: '2024-01-16T14:45:00',
      changes: {
        name: 'old name -> new name',
        category: 'tools -> platforms',
      },
    },
  ];

  const mockCommentsDataWithBooleanChanges: CommentResponse[] = [
    {
      text: 'Comment with boolean changes',
      authorUsername: 'testuser3',
      date: '2024-01-17T09:15:00',
      changes: {
        isEnabled: 'true -> false',
        isVisible: 'false -> true',
        name: 'old name -> new name', // non-boolean for comparison
      },
    },
  ];

  const mockDialogDataWithComments: HistoryDialogData = {
    comments: mockCommentsData,
  };

  const mockDialogDataWithBooleanComments: HistoryDialogData = {
    comments: mockCommentsDataWithBooleanChanges,
  };

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
  });

  function createComponent(dialogData: HistoryDialogData): void {
    TestBed.configureTestingModule({
      declarations: [ViewCommentsDialogComponent],
      imports: [
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        MatSlideToggleModule,
        MatButtonModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    });
    fixture = TestBed.createComponent(ViewCommentsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponent(mockDialogDataEmpty);
    expect(component).toBeTruthy();
  });

  describe('when comments are provided', () => {
    beforeEach(() => {
      createComponent(mockDialogDataWithComments);
    });

    it('should display comment cards when comments are provided', () => {
      const commentCards = fixture.debugElement.queryAll(
        By.css('.comment-card'),
      );
      expect(commentCards.length).toBe(2);
    });

    it('should display comment text correctly', () => {
      const commentTexts = fixture.debugElement.queryAll(
        By.css('mat-card-content p'),
      );
      expect(commentTexts[0].nativeElement.textContent.trim()).toBe(
        'This is a test comment',
      );
      expect(commentTexts[1].nativeElement.textContent.trim()).toBe(
        'Another test comment',
      );
    });

    it('should display author usernames correctly', () => {
      const cardTitles = fixture.debugElement.queryAll(
        By.css('mat-card-title'),
      );
      expect(cardTitles[0].nativeElement.textContent.trim()).toBe('testuser1');
      expect(cardTitles[1].nativeElement.textContent.trim()).toBe('testuser2');
    });

    it('should display formatted dates correctly', () => {
      const dateSubtitles = fixture.debugElement.queryAll(
        By.css('mat-card-subtitle'),
      );
      expect(dateSubtitles[0].nativeElement.textContent.trim()).toContain(
        '15.01.2024',
      );
      expect(dateSubtitles[1].nativeElement.textContent.trim()).toContain(
        '16.01.2024',
      );
    });

    it('should display changes for each comment', () => {
      const changeContainers = fixture.debugElement.queryAll(
        By.css('.change-container'),
      );
      expect(changeContainers.length).toBe(2);

      // First comment should have 3 changes
      const firstCommentChanges = changeContainers[0].queryAll(
        By.css('.change-row'),
      );
      expect(firstCommentChanges.length).toBe(3);

      // Second comment should have 2 changes
      const secondCommentChanges = changeContainers[1].queryAll(
        By.css('.change-row'),
      );
      expect(secondCommentChanges.length).toBe(2);
    });

    it('should display change keys correctly', () => {
      const changeKeys = fixture.debugElement.queryAll(By.css('.change-key'));
      expect(changeKeys[0].nativeElement.textContent.trim()).toBe('status');
      expect(changeKeys[1].nativeElement.textContent.trim()).toBe('priority');
      expect(changeKeys[2].nativeElement.textContent.trim()).toBe('isActive');
    });

    it('should not display no-comments message when comments exist', () => {
      const noCommentsBox = fixture.debugElement.query(
        By.css('.no-comments-box'),
      );
      expect(noCommentsBox).toBeFalsy();
    });
  });

  describe('when no comments are provided', () => {
    beforeEach(() => {
      createComponent(mockDialogDataEmpty);
    });

    it('should display no comments message when comments array is empty', () => {
      const noCommentsBox = fixture.debugElement.query(
        By.css('.no-comments-box'),
      );
      expect(noCommentsBox).toBeTruthy();
    });

    it('should display correct no comments title and description', () => {
      const title = fixture.debugElement.query(By.css('.no-comments-title'));
      const description = fixture.debugElement.query(
        By.css('.no-comments-desc'),
      );

      expect(title.nativeElement.textContent.trim()).toBe(
        'Keine Kommentare gefunden',
      );
      expect(description.nativeElement.textContent.trim()).toContain(
        'Für dieses Element wurden noch keine Änderungs-Kommentare hinterlegt',
      );
    });

    it('should not display comment cards when no comments exist', () => {
      const commentCards = fixture.debugElement.queryAll(
        By.css('.comment-card'),
      );
      expect(commentCards.length).toBe(0);
    });
  });

  describe('when comments contain boolean changes', () => {
    beforeEach(() => {
      createComponent(mockDialogDataWithBooleanComments);
    });

    it('should display slide toggles for boolean changes (true -> false)', () => {
      // Check that slide toggles are displayed for boolean changes
      const slideToggles = fixture.debugElement.queryAll(
        By.css('mat-slide-toggle'),
      );

      // Should have 4 slide toggles (2 boolean changes × 2 toggles each - before/after)
      expect(slideToggles.length).toBe(4);

      // Verify all slide toggles are disabled (read-only display)
      slideToggles.forEach((toggle) => {
        expect(toggle.componentInstance.disabled).toBe(true);
      });
    });

    it('should not display text chips for boolean changes', () => {
      // For boolean changes, there should be no chip elements
      const booleanRows = fixture.debugElement.queryAll(
        By.css('.change-row.boolean-row'),
      );
      expect(booleanRows.length).toBe(2); // Two boolean changes: isEnabled and isVisible

      // Within boolean rows, there should be no chip elements
      booleanRows.forEach((row) => {
        const chips = row.queryAll(By.css('.chip'));
        expect(chips.length).toBe(0);
      });
    });

    it('should display text chips for non-boolean changes', () => {
      // Non-boolean changes should still display as chips
      const nonBooleanRows = fixture.debugElement.queryAll(
        By.css('.change-row:not(.boolean-row)'),
      );
      expect(nonBooleanRows.length).toBe(1); // One non-boolean change: name

      // Within non-boolean rows, there should be chip elements
      const chips = nonBooleanRows[0].queryAll(By.css('.chip'));
      expect(chips.length).toBe(2); // Before and after chips
    });

    it('should correctly set slide toggle checked states for boolean values', () => {
      const slideToggles = fixture.debugElement.queryAll(
        By.css('mat-slide-toggle'),
      );

      // First boolean change: isEnabled 'true -> false'
      // Before toggle (true) should be checked
      expect(slideToggles[0].componentInstance.checked).toBe(true);
      // After toggle (false) should be unchecked
      expect(slideToggles[1].componentInstance.checked).toBe(false);

      // Second boolean change: isVisible 'false -> true'
      // Before toggle (false) should be unchecked
      expect(slideToggles[2].componentInstance.checked).toBe(false);
      // After toggle (true) should be checked
      expect(slideToggles[3].componentInstance.checked).toBe(true);
    });

    it('should apply boolean-row class when both before and after values are boolean', () => {
      const booleanRows = fixture.debugElement.queryAll(
        By.css('.change-row.boolean-row'),
      );
      expect(booleanRows.length).toBe(2);

      // Verify the change keys for boolean rows
      const booleanChangeKeys = booleanRows.map((row) =>
        row.query(By.css('.change-key')).nativeElement.textContent.trim(),
      );
      expect(booleanChangeKeys).toContain('isEnabled');
      expect(booleanChangeKeys).toContain('isVisible');
    });
  });

  describe('component methods', () => {
    beforeEach(() => {
      createComponent(mockDialogDataEmpty);
    });

    it('should close dialog when close method is called', () => {
      component.close();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should correctly identify boolean strings', () => {
      expect(component.isBoolean('true')).toBe(true);
      expect(component.isBoolean('false')).toBe(true);
      expect(component.isBoolean('yes')).toBe(false);
      expect(component.isBoolean('no')).toBe(false);
    });

    it('should correctly parse before and after values', () => {
      expect(component.getBeforeValue('technology -> method')).toBe(
        'technology',
      );
      expect(component.getAfterValue('technology -> method')).toBe('method');
    });
  });
});

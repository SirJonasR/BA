import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadarVisualizationComponent } from './radar-visualization.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RadarDataService } from './services/radar-data.service';
import { RadarMathService } from './services/radar-math.service';
import { RadarNavigationService } from './services/radar-navigation.service';
import { PictureService } from 'src/app/services/picture.service';

type RadarVisualizationPrivate = {
  radarWrapper: { nativeElement: HTMLDivElement };
  setupScrollPassthrough: () => void;
  cleanupScrollPassthrough: () => void;
  scrollPassthroughListener: EventListener | null;
};

type WindowWithScrollSpy = Window &
  typeof globalThis & {
    scrollBy: jasmine.Spy;
  };

describe('RadarVisualizationComponent', () => {
  let component: RadarVisualizationComponent;
  let fixture: ComponentFixture<RadarVisualizationComponent>;
  let privateComponent: RadarVisualizationPrivate;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RadarVisualizationComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [
        RadarDataService,
        RadarMathService,
        RadarNavigationService,
        PictureService,
      ],
    });
    fixture = TestBed.createComponent(RadarVisualizationComponent);
    component = fixture.componentInstance;
    privateComponent = component as unknown as RadarVisualizationPrivate;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('Scroll passthrough', () => {
    it('should register a wheel event listener on the wrapper element after view init', () => {
      const wrapperEl = privateComponent.radarWrapper.nativeElement;
      const addEventSpy = spyOn(
        wrapperEl,
        'addEventListener',
      ).and.callThrough();

      privateComponent.setupScrollPassthrough();

      const calls = addEventSpy.calls.all();
      const wheelCall = calls.find((c) => c.args[0] === 'wheel');
      expect(wheelCall).toBeTruthy();
    });

    it('should call window.scrollBy when a wheel event is fired on the wrapper', () => {
      (window as WindowWithScrollSpy).scrollBy = jasmine.createSpy('scrollBy');

      privateComponent.setupScrollPassthrough();

      const wrapperEl = privateComponent.radarWrapper.nativeElement;
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 120,
        deltaX: 0,
        bubbles: true,
        cancelable: true,
      });

      wrapperEl.dispatchEvent(wheelEvent);

      expect((window as WindowWithScrollSpy).scrollBy).toHaveBeenCalledWith({
        top: 120,
        left: 0,
        behavior: 'auto',
      });
    });

    it('should prevent default scroll behavior on wheel events over the wrapper', () => {
      privateComponent.setupScrollPassthrough();

      const wrapperEl = privateComponent.radarWrapper.nativeElement;
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100,
        bubbles: true,
        cancelable: true,
      });

      spyOn(wheelEvent, 'preventDefault');
      wrapperEl.dispatchEvent(wheelEvent);

      expect(window.scrollBy).toBeDefined();
    });

    it('should remove the wheel event listener on destroy', () => {
      const wrapperEl = privateComponent.radarWrapper.nativeElement;
      privateComponent.setupScrollPassthrough();

      const removeEventSpy = spyOn(
        wrapperEl,
        'removeEventListener',
      ).and.callThrough();

      privateComponent.cleanupScrollPassthrough();

      const calls = removeEventSpy.calls.all();
      const wheelCall = calls.find((c) => c.args[0] === 'wheel');
      expect(wheelCall).toBeTruthy();
      expect(privateComponent.scrollPassthroughListener).toBeNull();
    });
  });
});

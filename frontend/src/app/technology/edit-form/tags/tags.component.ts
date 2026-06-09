import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { TechnologyService } from 'src/app/services/technology.service';

// Importiere den Typ aus deinem Projekt, falls er in einem anderen Pfad liegt
import { FormValues } from '../edit-form.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'], // optional
})
export class TagsComponent implements OnInit {
  /**
   * Werte der übergeordneten Edit-Form. Wir mutieren hier nur values.tags.
   */
  @Input({ required: true }) values!: FormValues;

  @Input() maxTags = 10;
  @Input() maxTagLength = 25;
  @Input() allowDuplicates = false;
  @Output() tagsChange = new EventEmitter<string[]>();

  @ViewChild(MatAutocompleteTrigger, { static: false })
  private autocompleteTrigger?: MatAutocompleteTrigger;

  /**
   * Modell für das Eingabefeld
   */
  newTag = '';

  /**
   * Gesamte bekannte Tag-Auswahl (kommt vom Backend/Service)
   */
  TagSelectionArray: string[] = [];

  @ViewChild('tagInput', { static: false })
  tagInput?: ElementRef<HTMLInputElement>;

  constructor(private technologyService: TechnologyService) {}

  ngOnInit(): void {
    this.technologyService.getTagSelection().subscribe(
      (response) => {
        // Erwartet: string[]
        this.TagSelectionArray = Array.isArray(response) ? response : [];
        this.tagInit();
      },
      (error) => {
        console.error('Error:', error);
      },
    );
  }

  /**
   * Kannst du für initiale Vorbelegung/Mapping nutzen (falls nötig)
   */
  tagInit(): void {
    // Platzhalter – bei Bedarf initiale Logik ergänzen
  }

  get tags(): string[] {
    return this.values?.tags ?? [];
  }

  get tagsExceeded(): boolean {
    return (this.values?.tags?.length ?? 0) > this.maxTags;
  }

  /**
   * Gefilterte Vorschläge auf Basis der Eingabe.
   * - Case-insensitive
   * - Keine bereits gewählten Tags (sofern allowDuplicates = false)
   * - Sortiert: StartsWith vor Contains
   * - Maximal 8 Vorschläge
   */
  get filteredSuggestions(): string[] {
    const q = (this.newTag || '').trim().toLowerCase();

    let candidates = this.TagSelectionArray || [];

    if (!this.allowDuplicates && this.values?.tags?.length) {
      const selectedSet = new Set(this.values.tags.map((t) => t.toLowerCase()));
      candidates = candidates.filter((t) => !selectedSet.has(t.toLowerCase()));
    }

    if (!q) {
      return candidates.slice(0, 8);
    }

    const startsWith: string[] = [];
    const contains: string[] = [];
    for (const t of candidates) {
      const tl = t.toLowerCase();
      if (tl.startsWith(q)) startsWith.push(t);
      else if (tl.includes(q)) contains.push(t);
    }
    return [...startsWith, ...contains].slice(0, 8);
  }

  /**
   * Fügt den aktuellen Inhalt von `newTag` als Tag hinzu.
   */
  addTagFromInput(): void {
    const raw = this.newTag ?? '';
    const prepared = this.prepare(raw);
    if (!prepared) return;

    this.pushTag(prepared);
    this.resetInput();
  }

  /**
   * Auswahl aus den Autocomplete-Optionen -> direkt hinzufügen + Feld leeren
   */
  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const value = (event.option?.value ?? '') as string;
    if (!value) return;

    // Optional: Sicherheits-Trim + Längencheck
    const prepared = this.prepare(value);
    if (!prepared) return;

    this.pushTag(prepared);

    event.option.deselect();
    this.resetInput();

    if (this.tagInput?.nativeElement) {
      this.tagInput.nativeElement.value = '';
    }
  }

  /**
   * Entfernt ein Tag.
   */
  removeTag(tag: string): void {
    if (!this.values?.tags) return;
    const i = this.values.tags.indexOf(tag);
    if (i >= 0) {
      this.values.tags.splice(i, 1);
      this.tagsChange.emit([...this.values.tags]);
    }
  }

  /**
   * Keydown-Handler, um bei ENTER oder Komma direkt hinzuzufügen.
   */
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // verhindert Zeilenumbruch/Komma im Input
      this.addTagFromInput();
    }
  }

  /**
   * Optional: füge beim Verlassen des Felds hinzu (falls gewünscht).
   */
  onBlur(): void {
    // Wenn du das nicht willst, einfach aus dem Template entfernen.
    this.addTagFromInput();
  }

  /**
   * Helfer: Normalisieren/Validieren eines eingegebenen Tags.
   */
  private prepare(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.length > this.maxTagLength)
      return trimmed.slice(0, this.maxTagLength);
    return trimmed;
  }

  /**
   * Zentrale Routine zum Hinzufügen (beachtet Limits und Duplikate)
   */
  private pushTag(prepared: string): void {
    if (!this.values.tags) this.values.tags = [];
    if (this.values.tags.length >= this.maxTags) return;

    if (this.allowDuplicates || !this.values.tags.includes(prepared)) {
      this.values.tags.push(prepared);
      this.values.tags.sort((a, b) =>
        a.localeCompare(b, 'de', { sensitivity: 'base' }),
      );
      this.tagsChange.emit([...this.values.tags]);
    }
  }

  trackByValue(_index: number, item: string): string {
    return item;
  }

  private resetInput(): void {
    this.newTag = '';
    // Cursor wieder ins Feld setzen (UX).
    if (this.tagInput?.nativeElement) {
      this.tagInput.nativeElement.focus();
    }
  }
}

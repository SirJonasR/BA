import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-current-characters-counter',
  templateUrl: './current-characters-counter.component.html',
  styleUrls: ['./current-characters-counter.component.css'],
})
/**
 * CurrentCharacter Component
 *
 * Component that displays the amount of characters
 */
export class CurrentCharactersCounterComponent {
  @Input() maxCharacters = 0;
  @Input() currentCharacterCount = 0;
}

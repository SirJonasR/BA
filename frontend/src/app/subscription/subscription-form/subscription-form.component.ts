import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category, Lifecycle, Technology } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import { UserHandlingService } from 'src/app/services/user-handling.service';
import { MatSelectChange } from '@angular/material/select';
import { SubscriptionItemType } from 'src/app/models/subscription';

export type ItemValues = {
  type: SubscriptionItemType;
  values: Lifecycle | Technology | Category | undefined;
};

export type FormValues = {
  name: string | null;
  selectedItems: ItemValues[];
  timespan: number | null;
  email: string | null;
};

@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css'],
})
export class SubscriptionFormComponent {
  @Input() values!: FormValues;
  @Input() isSubmitting = false;
  @Input() hasError = false;
  @Output() submitForm: EventEmitter<void> = new EventEmitter<void>();

  optionSelected: number | undefined;

  categories!: Category[];
  lifecycles!: Lifecycle[];

  constructor(
    private technologyService: TechnologyService,
    private userHandlingService: UserHandlingService,
  ) {
    this.categories = this.technologyService.categories;
    this.lifecycles = this.technologyService.lifecycles;
  }

  onSelect = async (id: number): Promise<void> => {
    this.technologyService.getTechnology(id).subscribe((technology) => {
      const technologyValues = {
        type: SubscriptionItemType.TECHNOLOGY,
        values: technology,
      };
      if (
        !this.values.selectedItems.some((item) => {
          if (item.values) {
            return item.values.name === technologyValues.values.name;
          }
          return false;
        })
      ) {
        this.values.selectedItems.push(technologyValues);
      }
    });
  };

  onSelectCategory(id: MatSelectChange): void {
    const categoryValues = {
      type: SubscriptionItemType.CATEGORY,
      values: this.technologyService.getCategoryById(id.value),
    };
    if (
      !this.values.selectedItems.some((item) => {
        if (item.values) {
          return item.values.name === categoryValues?.values?.name;
        }
        return false;
      })
    ) {
      this.values.selectedItems.push(categoryValues);
    }
  }

  onSelectLifecycle(id: MatSelectChange): void {
    const lifecycleValues = {
      type: SubscriptionItemType.LIFECYCLE,
      values: this.technologyService.getLifecycleById(id.value),
    };
    if (
      !this.values.selectedItems.some((item) => {
        if (item.values) {
          return item.values.name === lifecycleValues?.values?.name;
        }
        return false;
      })
    ) {
      this.values.selectedItems.push(lifecycleValues);
    }
  }

  removeItem(item: ItemValues): void {
    const index = this.values.selectedItems.indexOf(item);
    this.values.selectedItems.splice(index, 1);
  }

  get userEmail(): string {
    return this.userHandlingService.getUserEmail();
  }

  async onFormSubmit(): Promise<void> {
    if (this.values.email == null) {
      this.values.email = this.userEmail;
    }

    if (this.values.selectedItems.length === 0) {
      alert(
        'Mindestens ein Element, dass abonniert werden soll, muss ausgewählt sein!',
      );
      return;
    }
    this.submitForm.emit();
  }
}

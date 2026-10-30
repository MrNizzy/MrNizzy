import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  ButtonSize,
  ButtonVariant,
  CardPadding,
  CardVariant,
  ICON_NAMES,
  IconSize,
  UiButtonDirective,
  UiCardDirective,
  UiChipDirective,
  UiDialog,
  UiIconComponent,
  UiInputDirective,
  UiLinkDirective,
  UiSectionHeadingComponent,
  UiSelectComponent,
} from '@shared/ui';
import {
  DemoDialogResult,
  UiKitDemoDialogComponent,
} from './ui-kit-demo-dialog.component';

/**
 * Development-only catalogue of the design system primitives.
 *
 * It is only routed outside production (see `app.routes.ts`). The same
 * showcase renders twice: once with the active theme and once inside a
 * `data-theme="light"` wrapper, so both token sets can be reviewed while the
 * light theme is globally disabled.
 */
@Component({
  selector: 'app-ui-kit',
  imports: [
    NgTemplateOutlet,
    UiButtonDirective,
    UiCardDirective,
    UiChipDirective,
    UiIconComponent,
    UiInputDirective,
    UiLinkDirective,
    UiSectionHeadingComponent,
    UiSelectComponent,
  ],
  templateUrl: './ui-kit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiKitComponent {
  private readonly dialog = inject(UiDialog);

  protected readonly icons = ICON_NAMES;
  protected readonly iconSizes: readonly IconSize[] = [16, 20, 24];
  protected readonly buttonVariants: readonly ButtonVariant[] = [
    'primary',
    'secondary',
    'ghost',
  ];
  protected readonly buttonSizes: readonly ButtonSize[] = ['sm', 'md'];
  protected readonly cardVariants: readonly CardVariant[] = ['surface', 'glass'];
  protected readonly cardPaddings: readonly CardPadding[] = [
    'none',
    'sm',
    'md',
    'lg',
  ];

  protected readonly topics = ['Angular', 'NestJS', 'Tailwind', 'Testing'];
  protected readonly activeTopics = signal<ReadonlySet<string>>(
    new Set(['Angular'])
  );

  protected toggleTopic(topic: string): void {
    this.activeTopics.update((current) => {
      const next = new Set(current);
      if (!next.delete(topic)) next.add(topic);
      return next;
    });
  }

  protected readonly selectedTopic = signal('Angular');
  protected readonly dialogResult = signal<DemoDialogResult | 'dismissed' | null>(
    null
  );

  protected openDialog(): void {
    this.dialog
      .open<DemoDialogResult, unknown, UiKitDemoDialogComponent>(
        UiKitDemoDialogComponent
      )
      .closed.subscribe((result) => this.dialogResult.set(result ?? 'dismissed'));
  }
}

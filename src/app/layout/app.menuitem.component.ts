import { ChangeDetectorRef, Component, Host, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from './app.menu.service';
import { LayoutService } from './service/app.layout.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menuitem]',
  template: `
<ng-container *ngIf="isLoading; else content">
  <p-skeleton width="12rem" height="2rem" />
</ng-container>

<ng-template #content>
  <div *ngIf="root && item.visible !== false" class="layout-menuitem-root-text">
    {{ item.label }}
  </div>
  <a *ngIf="(!item.routerLink || item.items) && item.visible !== false" [attr.href]="item.url" (click)="itemClick($event)" [ngClass]="item.class" [attr.target]="item.target" tabindex="0" pRipple>
    <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
    <span class="layout-menuitem-text">{{ item.label }}</span>
    <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items"></i>
  </a>
  <a *ngIf="item.routerLink && !item.items && item.visible !== false" (click)="itemClick($event)" [ngClass]="item.class" [routerLink]="item.routerLink" routerLinkActive="active-route" [routerLinkActiveOptions]="item.routerLinkActiveOptions || { paths: 'subset', queryParams: 'ignored', matrixParams: 'ignored', fragment: 'ignored' }" [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling" [preserveFragment]="item.preserveFragment" [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state" [queryParams]="item.queryParams" [attr.target]="item.target" tabindex="0" [trackBy]="item.label" pRipple>
    <i [ngClass]="item.icon" class="layout-menuitem-icon"></i>
    <span [badgeDisabled]="item.badge > 30" pBadge severity="danger" class="layout-menuitem-text">{{ item.label }}</span>
    <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items"></i>
  </a>

  <ul *ngIf="item.items && item.visible !== false" [@children]="submenuAnimation">
    <ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
      <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
    </ng-template>
  </ul>
</ng-template>

  `,
  animations: [
    trigger('children', [
      state(
        'collapsed',
        style({
          height: '0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition(
        'collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class AppMenuitemComponent implements OnInit, OnDestroy {
  @Input() item: any;
  @Input() index!: number;
  @Input() @HostBinding('class.layout-root-menuitem') root!: boolean;
  @Input() parentKey!: string;

  active = false;
  isLoading = true; // Loading state

  menuSourceSubscription: Subscription;
  menuResetSubscription: Subscription;
  menuChangeSubscription: Subscription;

  key: string = '';

  constructor(
    public layoutService: LayoutService,
    private cd: ChangeDetectorRef,
    public router: Router,
    private menuService: MenuService
  ) {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe((value) => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          this.active = value.key === this.key || value.key.startsWith(this.key + '-');
        } else {
          if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
            this.active = false;
          }
        }
      });
    });

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      this.active = false;
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((params) => {
      if (this.item.routerLink) {
        this.updateActiveStateFromRoute();
      }
    });
  }

  ngOnInit() {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

    if (this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }
    setTimeout(() => {
      this.isLoading = false;
      this.cd.detectChanges();
    }, 200);
  }

  updateActiveStateFromRoute() {
    let activeRoute = this.router.isActive(this.item.routerLink[0], {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });

    if (activeRoute) {
      this.menuService.onMenuStateChange({ key: this.key, routeEvent: true });
    }
  }

  itemClick(event: Event) {
    if (this.item.routerLink !== undefined && this.item.routerLink[0] !== this.router.url) {
      localStorage.removeItem('search_history');
    }

    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    if (this.item.items) {
      this.active = !this.active;
    }

    this.menuService.onMenuStateChange({ key: this.key });
  }

  get submenuAnimation() {
    return this.root ? 'expanded' : this.active ? 'expanded' : 'collapsed';
  }

  @HostBinding('class.active-menuitem')
  get activeClass() {
    return this.active && !this.root;
  }

  ngOnDestroy() {
    if (this.menuSourceSubscription) {
      this.menuSourceSubscription.unsubscribe();
    }

    if (this.menuResetSubscription) {
      this.menuResetSubscription.unsubscribe();
    }
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftSenderComponent } from './gift-sender.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('GiftSenderComponent', () => {
    let component: GiftSenderComponent;
    let fixture: ComponentFixture<GiftSenderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GiftSenderComponent, HttpClientTestingModule, RouterTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(GiftSenderComponent);
        component = fixture.componentInstance;
        // Simulate receiving a username from router state
        component.username = 'testuser';
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should display the username', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('p')?.textContent).toContain('testuser');
    });
});

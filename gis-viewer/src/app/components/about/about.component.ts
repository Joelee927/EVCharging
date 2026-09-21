import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="about-overlay" (click)="onBackdropClick($event)">
      <div class="about-card">
        <button class="close-btn" (click)="close()" aria-label="Close modal">×</button>
        
        <div class="about-header">
          <!-- 1. Profile Picture Placeholder -->
          <div class="profile-avatar">
            <img src="assets/JoeLee.jpg" alt="Joe Lee" class="profile-img" />
          </div>
          <h2><a href="https://linkedin.com/in/joelee927">Joe Lee</a></h2>
          <p class="subtitle">Senior GIS Developer</p>
        </div>

        <div class="about-body">
          <!-- 2. Career Highlights -->
          <section class="about-section">
            <h3>Career Highlights</h3>
            <ul class="highlight-list">
              <li>Developed and supported web mapping applications utilizing ArcGIS Maps SDK and React/Angular.</li>
              <li>Managed and upgraded GIS infrastructure with ArcGIS Enterprise in government organization.</li>
              <li>Optimized field operation by deploying Field Maps and Survey123 mobile application.</li>
            </ul>
          </section>

          <!-- 3. Technical Skills -->
          <section class="about-section">
            <h3>Technical Skills</h3>
            <div class="skills-grid">
              <span class="skill-tag">C# / .NET</span>
              <span class="skill-tag">React / Angular</span>
              <span class="skill-tag">TypeScript / JavaScript</span>
              <span class="skill-tag">Python / ArcPy</span>
              <span class="skill-tag">GIS & Spatial Analysis</span>
              <span class="skill-tag">HTML5 / CSS3 / SCSS</span>
              <span class="skill-tag">SQL</span>
              <span class="skill-tag">REST APIs</span>
              <span class="skill-tag">Azure</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .about-overlay {
      position: fixed;
      top: 56px;
      left: 0;
      width: 100vw;
      height: calc(100vh - 56px);
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 300;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      box-sizing: border-box;
    }

    .about-card {
      position: relative;
      background: #ffffff;
      width: 100%;
      max-width: 620px;
      max-height: 85vh;
      overflow-y: auto;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: 32px;
      box-sizing: border-box;
    }

    .close-btn {
      position: absolute;
      top: 16px;
      right: 20px;
      background: none;
      border: none;
      font-size: 28px;
      color: #64748b;
      cursor: pointer;
      line-height: 1;
    }

    .close-btn:hover {
      color: #0f172a;
    }

    .about-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      margin: 0 auto 16px auto;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #0284c7;
      background: #f1f5f9;
    }

    .profile-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .about-header h2 {
      margin: 0;
      color: #0f172a;
      font-size: 24px;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .about-section {
      margin-top: 24px;
    }

    .about-section h3 {
      font-size: 16px;
      color: #1e293b;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .highlight-list {
      margin: 0;
      padding-left: 20px;
      color: #334155;
      font-size: 14px;
      line-height: 1.6;
    }

    .highlight-list li {
      margin-bottom: 8px;
    }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .skill-tag {
      background: #e0f2fe;
      color: #0369a1;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 20px;
    }
  `]
})
export class AboutComponent {
  @Output() closeEvent = new EventEmitter<void>();

  close() {
    this.closeEvent.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('about-overlay')) {
      this.close();
    }
  }
}
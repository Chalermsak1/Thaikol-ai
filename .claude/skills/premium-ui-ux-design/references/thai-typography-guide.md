# 🇹🇭 Thai Typography & Multilingual UI Guide

This reference document outlines the engineering and design rules for rendering Thai script cleanly in modern web applications.

---

## 1. Font Stacks

Always specify Thai-capable fonts before generic sans-serif fallbacks.

### Modern SaaS & Clean Tech Stack
```css
font-family:
  'Inter',
  'Prompt',
  'Noto Sans Thai',
  'Sarabun',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  sans-serif;
```

### Editorial / Premium Humanist Stack
```css
font-family:
  'Plus Jakarta Sans',
  'Noto Sans Thai Looped',
  'Thonburi',
  sans-serif;
```

---

## 2. Preventing Glyph Clipping (Vowels & Tone Marks)

Thai script contains multi-tiered vertical glyphs:
- **Top Tone Marks & Vowels:** ไม้เอก (  ่ ), ไม้โท (  ้ ), ไม้ตรี (  ๊ ), ไม้จัตวา (  ๋ ), สระอิ (  ิ ), สระอี (  ี ), การันต์ (  ์ )
- **Bottom Vowels:** สระอุ (  ุ ), สระอู (  ู )

### Rules:
1. **Never use `line-height: 1` or `leading-none`** on Thai text.
   - Body text: minimum `line-height: 1.6` (e.g. `leading-relaxed` or `leading-loose`).
   - Headings: minimum `line-height: 1.35` to `1.45` (e.g. `leading-snug` or `leading-normal`).
2. **Container Vertical Padding:**
   - Always allow at least `py-0.5` or `py-1` on badges, buttons, and input fields.
   - If an element uses `overflow-hidden`, tone marks near the edge will be sliced off. Use `overflow-y: visible` or sufficient inner padding.
3. **Ascender / Descender Optical Balance:**
   - Thai characters without loops (like Prompt) have a slightly taller x-height than standard Latin. Balance font sizes by scaling Thai labels to match Latin visual optical weight (e.g., `text-sm` for Thai is visually equivalent to `text-[13px]` in some Latin typefaces).

---

## 3. Word Breaking & Hyphenation

Thai script does not use spaces between words. Browsers need proper word breaking rules:

```css
.thai-text {
  word-break: break-word;
  overflow-wrap: break-word;
  text-wrap: pretty; /* Modern browsers: avoids single-word orphans */
}
```

---

## 4. Optical Sizing & Weight Guidelines

| Weight | Latin Equivalent | Recommended Use in Thai UI |
| :--- | :--- | :--- |
| **Light (300)** | Avoid | Avoid for Thai UI; strokes become too thin to read tone marks |
| **Regular (400)** | Regular | Default body text, descriptions, table cells |
| **Medium (500)** | Medium | Button labels, table headers, active navigation items |
| **SemiBold (600)** | SemiBold | Section headings, card titles, key metric numbers |
| **Bold (700)** | Bold | Page titles (H1), hero banners, primary stats |

---
version: alpha
name: Ali Xeeshan Empire
description: A high-end luxury bridal and formal wear e-commerce experience characterized by a sophisticated "Theater Studio" aesthetic, utilizing stark contrast and editorial-grade photography.
colors:
  primary: "#111111"
  background: "#ffffff"
  accent: "#b08b57"
  border: "#000000"
  text-body: "#000000"
  text-muted: "#333333"
  modal-overlay: "rgba(230, 230, 230, 0.6)"
typography:
  family-primary: "Cabin, sans-serif"
  size-header: "33px"
  size-base: "16px"
  weight-header: 400
  weight-base: 400
  line-height-base: 1.2
spacing:
  grid-gutter: "17px"
  drawer-gutter: "20px"
  page-max-width: "1500px"
rounded:
  buttons: "0px"
  cards: "16px"
  inputs: "0px"
components:
  button-primary:
    background: "{colors.primary}"
    color: "#ffffff"
    radius: "{rounded.buttons}"
    padding: "11px 20px"
    text-transform: "uppercase"
  product-card:
    aspect-ratio: "140%"
    border-radius: "{rounded.cards}"
    meta-padding: "10px"
---

## Overview
The Ali Xeeshan Empire visual language is one of theatrical luxury and curated drama. It avoids the typical soft palette of bridal sites in favor of a bold, high-contrast environment. The design is deeply editorial, relying on large-scale photography and generous whitespace to elevate fashion as art. Transitions are fluid, utilizing fade-in animations for imagery to mimic the unveiling of a collection. The overall tone is regal yet modern, mixing traditional craftsmanship with minimalist digital architecture.

## Colors
The palette is dominated by a core triad of Stark White (#ffffff), Deep Charcoal/Black (#111111), and a metallic-adjacent Ocher/Gold (#b08b57) for semantic highlights.
- **Primary Backgrounds**: Pure white creates a gallery-like atmosphere.
- **Typography & Borders**: Black is used for all structural lines and primary text, ensuring a "ink-on-paper" feel.
- **Accents**: The ocher yellow is reserved for "luxury stories" and subtle eyebrow text to denote prestige.
- **Overlays**: Translucent greys are used for modals to maintain depth without obscuring the background context.

## Typography
Cabin serves as the universal typeface, providing a clean, humanist sans-serif look that remains legible even at small tracking levels.
- **Headings**: Large, uppercase, and often centered to signal section transitions. They maintain a light weight (400) to avoid feeling heavy.
- **Body**: Set at 16px with a tight 1.2 line height, reflecting an efficient, modern data density.
- **Subheadings**: Frequently utilize letter-spacing (0.3em) and uppercase styling to denote categorization and hierarchy.

## Layout
The site utilizes a flexible grid system with a maximum container width of 1500px.
- **Grid Rhythm**: A standard 17px gutter provides a consistent gap between high-fashion product shots.
- **Product Grids**: Typically arranged in a 4-column layout on desktop, transitioning to a 2-column or single-column stack on mobile.
- **Hierarchy**: Alternates between full-width hero sections and uniform product grids to break visual fatigue.

## Elevation & Depth
Depth is communicated through layering and shadows rather than skeuomorphism.
- **Modals**: Utilize a box shadow (`0 10px 20px #00000017`) and a semi-transparent backdrop.
- **Product Cards**: On the "Luxury Story" sections, cards use a subtle `0 10px 30px rgba(0,0,0,0.03)` shadow.
- **Sticky Header**: A delicate `0 0 1px rgba(0,0,0,0.2)` shadow ensures the navigation remains distinct during scroll.

## Shapes
The design uses sharp, square edges for interactive elements (buttons and inputs) to convey precision and formality. However, the modern "Luxury Story" sections introduce softer `16px` and `18px` radii for containers and cards, creating a friendlier, contemporary "app-like" feel within the long-form content areas.

## Components
- **Navigation**: A multi-tiered menu featuring a top-level toolbar for social icons and a centered primary logo.
- **Product Grid**: Images feature a "secondary image hover" effect where the model or garment angle switches on mouse-over.
- **Buttons**: Stark, rectangular blocks with uppercase text. The secondary variant uses a border-only approach with no fill.
- **FAQ Cards**: Specialized containers with `fcfbf8` backgrounds and `1px` subtle borders for high-density information.

## Do's and Don'ts
- **Do**: Use high-resolution, professional photography with minimal background clutter.
- **Do**: Maintain strict vertical alignment between product titles and their respective images.
- **Don't**: Introduce rounded corners to primary call-to-action buttons; keep them strictly rectangular.
- **Don't**: Use vibrant primary colors like blue or green; stick to the monochrome and gold palette.

## Accessibility
- **Contrast**: High-contrast black-on-white text ensures readability for primary content.
- **Interactive Cues**: Hover states for images and underline effects for links provide visual feedback.
- **Focus**: A custom skip-link is implemented to allow keyboard users to bypass navigation.
- **Structure**: Semantic HTML (h1-h6) is used to maintain a logical document outline for screen readers.

## Assets
- **Image**: http://alixeeshanempire.com/cdn/shop/files/ALI-XEESHAN-TS---Logo---Ocher-Yellow-on-Dark-Grey_copy_180x_2x_e5c6acd7-1518-4950-b869-f696f7ea07ab.png?v=1684494926
- **Image**: https://alixeeshanempire.com/270
- **Image**: https://alixeeshanempire.com/360
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_i4.0a521b11d0b69adfc41e22a263eec7c02aecfe99.woff
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_i4.d89c1b32b09ecbc46c12781fcf7b2085f17c0be9.woff2
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_i6.5b37bf1fce036a7ee54dbf8fb86341d9c8883ee1.woff
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_i6.f09e39e860dd73a664673caf87e5a0b93b584340.woff2
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_n4.8c16611b00f59d27f4b27ce4328dfe514ce77517.woff
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_n4.cefc6494a78f87584a6f312fea532919154f66fe.woff2
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_n6.6c2e65d54c893ad9f1390da3b810b8e6cf976a4f.woff
- **Font**: https://alixeeshanempire.com/cdn/fonts/cabin/cabin_n6.c6b1e64927bbec1c65aab7077888fb033480c4f7.woff2
- **Background**: https://alixeeshanempire.com/cdn/s/assets/gift-card/icon-print-164daa1ae32d10d1f9b83ac21b6f2c70.png
- **Image**: https://alixeeshanempire.com/cdn/shop/files/11255.webp?v=1738570292&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/11255.webp?v=1738570292&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/11255.webp?v=1738570292&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/11255.webp?v=1738570292&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/11255.webp?v=1738570292&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/34324_912eeb50-6839-460b-a47f-8c11f8de056c.webp?v=1738569654&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/34324_912eeb50-6839-460b-a47f-8c11f8de056c.webp?v=1738569654&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/34324_912eeb50-6839-460b-a47f-8c11f8de056c.webp?v=1738569654&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/34324_912eeb50-6839-460b-a47f-8c11f8de056c.webp?v=1738569654&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/34324_912eeb50-6839-460b-a47f-8c11f8de056c.webp?v=1738569654&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/435435.webp?v=1738569609&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/435435.webp?v=1738569609&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/435435.webp?v=1738569609&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/435435.webp?v=1738569609&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/435435.webp?v=1738569609&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/66_0bb6cd7d-bd57-4f78-bf21-6e0bbd50209e.webp?v=1738569705&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/66_0bb6cd7d-bd57-4f78-bf21-6e0bbd50209e.webp?v=1738569705&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/66_0bb6cd7d-bd57-4f78-bf21-6e0bbd50209e.webp?v=1738569705&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/66_0bb6cd7d-bd57-4f78-bf21-6e0bbd50209e.webp?v=1738569705&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/66_0bb6cd7d-bd57-4f78-bf21-6e0bbd50209e.webp?v=1738569705&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/8_e035b72d-0ab0-454d-a1e7-a42177761a51.webp?v=1738569539&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/8_e035b72d-0ab0-454d-a1e7-a42177761a51.webp?v=1738569539&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/8_e035b72d-0ab0-454d-a1e7-a42177761a51.webp?v=1738569539&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/8_e035b72d-0ab0-454d-a1e7-a42177761a51.webp?v=1738569539&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/8_e035b72d-0ab0-454d-a1e7-a42177761a51.webp?v=1738569539&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/ALI-XEESHAN-TS---Logo---Ocher-Yellow-on-Dark-Grey_copy_180x_2x_a6bbb3bc-d642-4427-8eda-8893f01b9458.webp?v=1684742000&amp;width=120
- **Image**: https://alixeeshanempire.com/cdn/shop/files/ALI-XEESHAN-TS---Logo---Ocher-Yellow-on-Dark-Grey_copy_180x_2x_a6bbb3bc-d642-4427-8eda-8893f01b9458.webp?v=1684742000&amp;width=200
- **Image**: https://alixeeshanempire.com/cdn/shop/files/ALI-XEESHAN-TS---Logo---Ocher-Yellow-on-Dark-Grey_copy_180x_2x_a6bbb3bc-d642-4427-8eda-8893f01b9458.webp?v=1684742000&amp;width=400
- **Image**: https://alixeeshanempire.com/cdn/shop/files/ALI-XEESHAN-TS---Logo---Ocher-Yellow-on-Dark-Grey_copy_180x_2x_a6bbb3bc-d642-4427-8eda-8893f01b9458.webp?v=1684742000&amp;width=60
- **Image**: https://alixeeshanempire.com/cdn/shop/files/ALI-XEESHAN-TS---Logo---Ocher-Yellow-on-Dark-Grey_copy_180x_2x_e5c6acd7-1518-4950-b869-f696f7ea07ab.png?v=1684494926
- **Image**: https://alixeeshanempire.com/cdn/shop/files/alixeeshan_36771584-d31c-4381-8618-10ad08a30d44.png?v=1724756850&amp;width=120
- **Image**: https://alixeeshanempire.com/cdn/shop/files/alixeeshan_36771584-d31c-4381-8618-10ad08a30d44.png?v=1724756850&amp;width=200
- **Image**: https://alixeeshanempire.com/cdn/shop/files/alixeeshan_36771584-d31c-4381-8618-10ad08a30d44.png?v=1724756850&amp;width=400
- **Image**: https://alixeeshanempire.com/cdn/shop/files/alixeeshan_36771584-d31c-4381-8618-10ad08a30d44.png?v=1724756850&amp;width=60
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01706.webp?v=1738568814&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01706.webp?v=1738568814&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01706.webp?v=1738568814&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01706.webp?v=1738568814&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01706.webp?v=1738568814&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01732.jpg?v=1738568814&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01732.jpg?v=1738568814&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01732.jpg?v=1738568814&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP01732.jpg?v=1738568814&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02013.jpg?v=1738568882&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02013.jpg?v=1738568882&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02013.jpg?v=1738568882&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02013.jpg?v=1738568882&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02247.webp?v=1738568882&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02247.webp?v=1738568882&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02247.webp?v=1738568882&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02247.webp?v=1738568882&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/BMP02247.webp?v=1738568882&amp;width=900
- **Icon**: https://alixeeshanempire.com/cdn/shop/files/monkey_32x32_458b4d8b-46b2-4336-af59-07e83998182f_32x32.png?v=1724827182
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08496.jpg?v=1738569042&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08496.jpg?v=1738569042&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08496.jpg?v=1738569042&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08496.jpg?v=1738569042&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08684.webp?v=1738569042&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08684.webp?v=1738569042&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08684.webp?v=1738569042&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08684.webp?v=1738569042&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08684.webp?v=1738569042&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08967.webp?v=1738568967&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08967.webp?v=1738568967&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08967.webp?v=1738568967&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08967.webp?v=1738568967&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB08967.webp?v=1738568967&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB09023.jpg?v=1738568967&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB09023.jpg?v=1738568967&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB09023.jpg?v=1738568967&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/files/MTB09023.jpg?v=1738568967&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/12335.jpg?v=1738570292&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/products/12335.jpg?v=1738570292&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/12335.jpg?v=1738570292&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/12335.jpg?v=1738570292&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/3431.jpg?v=1738569654&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/products/3431.jpg?v=1738569654&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/3431.jpg?v=1738569654&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/3431.jpg?v=1738569654&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/434.jpg?v=1603270447&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/products/434.jpg?v=1603270447&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/434.jpg?v=1603270447&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/434.jpg?v=1603270447&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/452252.jpg?v=1603270447&amp;width=1080
- **Image**: https://alixeeshanempire.com/cdn/shop/products/452252.jpg?v=1603270447&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/452252.jpg?v=1603270447&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/452252.jpg?v=1603270447&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/452252.jpg?v=1603270447&amp;width=900
- **Image**: https://alixeeshanempire.com/cdn/shop/products/53645.jpg?v=1738569609&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/products/53645.jpg?v=1738569609&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/53645.jpg?v=1738569609&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/53645.jpg?v=1738569609&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/6_9aa102c5-600c-4f85-88a5-a37c78be4871.jpg?v=1738569539&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/products/6_9aa102c5-600c-4f85-88a5-a37c78be4871.jpg?v=1738569539&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/6_9aa102c5-600c-4f85-88a5-a37c78be4871.jpg?v=1738569539&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/6_9aa102c5-600c-4f85-88a5-a37c78be4871.jpg?v=1738569539&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/products/65.jpg?v=1738569705&amp;width=1000
- **Image**: https://alixeeshanempire.com/cdn/shop/products/65.jpg?v=1738569705&amp;width=360
- **Image**: https://alixeeshanempire.com/cdn/shop/products/65.jpg?v=1738569705&amp;width=540
- **Image**: https://alixeeshanempire.com/cdn/shop/products/65.jpg?v=1738569705&amp;width=720
- **Image**: https://alixeeshanempire.com/cdn/shop/t/15/assets/ico-select-footer.svg
- **Image**: https://alixeeshanempire.com/cdn/shop/t/15/assets/ico-select-white.svg
- **Image**: https://alixeeshanempire.com/cdn/shop/t/15/assets/ico-select.svg
- **Embed**: https://www.googletagmanager.com/ns.html?id=GTM-5VXCCSV
import os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

os.makedirs('public/icons', exist_ok=True)

# Base satay skewer image
base_img = Image.open('public/images/satay_skewer.jpg').convert('RGBA')

def create_pwa_icon(size, is_maskable=False):
    # Create canvas
    canvas = Image.new('RGBA', (size, size), (12, 10, 9, 255)) # Dark background #0c0a09
    draw = ImageDraw.Draw(canvas)
    
    # Outer ambient glow
    padding = int(size * 0.1) if is_maskable else int(size * 0.05)
    inner_size = size - (padding * 2)
    
    # Crop center square from satay image
    w, h = base_img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    cropped = base_img.crop((left, top, left + min_dim, top + min_dim))
    resample_filter = getattr(Image, 'Resampling', Image).LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS
    resized_satay = cropped.resize((inner_size, inner_size), resample_filter)
    
    # Rounded mask for satay image
    mask = Image.new('L', (inner_size, inner_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_radius = int(inner_size * 0.22) if not is_maskable else int(inner_size * 0.18)
    mask_draw.rounded_rectangle([(0, 0), (inner_size, inner_size)], radius=corner_radius, fill=255)
    
    # Paste satay with mask
    canvas.paste(resized_satay, (padding, padding), mask)
    
    # Add stylish border
    draw.rounded_rectangle(
        [(padding, padding), (padding + inner_size, padding + inner_size)],
        radius=corner_radius,
        outline=(234, 88, 12, 255), # Orange #ea580c
        width=max(2, int(size * 0.02))
    )
    
    # Bottom banner for branding
    banner_h = int(inner_size * 0.24)
    banner_y = padding + inner_size - banner_h
    banner_mask = Image.new('L', (inner_size, banner_h), 0)
    b_draw = ImageDraw.Draw(banner_mask)
    # rounded bottom corners
    b_draw.rounded_rectangle([(0, -corner_radius), (inner_size, banner_h)], radius=corner_radius, fill=220)
    
    banner = Image.new('RGBA', (inner_size, banner_h), (20, 16, 14, 230))
    canvas.paste(banner, (padding, banner_y), banner_mask)
    
    # Draw simple text / accent
    line_y = banner_y
    draw.line([(padding, line_y), (padding + inner_size, line_y)], fill=(249, 115, 22, 255), width=max(1, int(size * 0.01)))
    
    return canvas

# Generate all required icons
icon_192 = create_pwa_icon(192, is_maskable=False)
icon_192.save('public/icons/icon-192.png', 'PNG')

icon_512 = create_pwa_icon(512, is_maskable=False)
icon_512.save('public/icons/icon-512.png', 'PNG')

icon_maskable_192 = create_pwa_icon(192, is_maskable=True)
icon_maskable_192.save('public/icons/icon-maskable-192.png', 'PNG')

icon_maskable_512 = create_pwa_icon(512, is_maskable=True)
icon_maskable_512.save('public/icons/icon-maskable-512.png', 'PNG')

apple_icon = create_pwa_icon(180, is_maskable=False)
apple_icon.save('public/icons/apple-touch-icon.png', 'PNG')

favicon = create_pwa_icon(64, is_maskable=False)
favicon.save('public/icons/favicon.png', 'PNG')
favicon.save('public/favicon.ico', 'ICO')

print("PWA PNG icons generated successfully!")

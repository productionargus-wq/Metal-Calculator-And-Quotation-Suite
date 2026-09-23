import os
import numpy as np
from PIL import Image

def process_logos():
    src_path = r'C:/Users/HP/.gemini/antigravity/brain/513b9e88-8c42-4f0f-bf1d-63ae283dc764/.user_uploaded/media_1790161135865.jpg'
    if not os.path.exists(src_path):
        raise FileNotFoundError(f"Source image not found: {src_path}")

    im = Image.open(src_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)

    # 1. Determine precise inner logo bounding box
    inner_mask = np.any(arr[350:620, 40:980] < 240, axis=2)
    y_idx, x_idx = np.where(inner_mask)
    ymin, ymax = y_idx.min() + 350, y_idx.max() + 350 + 1
    xmin, xmax = x_idx.min() + 40, x_idx.max() + 40 + 1

    pad = 8
    ymin = max(0, ymin - pad)
    ymax = min(arr.shape[0], ymax + pad)
    xmin = max(0, xmin - pad)
    xmax = min(arr.shape[1], xmax + pad)

    crop = arr[ymin:ymax, xmin:xmax]
    h, w, _ = crop.shape
    print(f"Cropped logo dimensions: {w}x{h}")

    # 2. Compute alpha mask: distance from white (255, 255, 255)
    # Background in the crop is pure/near pure white (> 250 in all channels)
    max_c = np.max(crop, axis=2)
    min_c = np.min(crop, axis=2)

    # Smooth alpha calculation
    # Pure white: max_c >= 253, min_c >= 250 -> alpha 0
    # Between 220 and 250: linearly interpolate alpha
    alpha = np.clip((252.0 - min_c) / (252.0 - 215.0), 0.0, 1.0) * 255.0

    # 3. Separate Orange vs Dark/Charcoal regions
    # Orange has high red and lower green/blue (e.g., R > 150, G < 140, B < 80)
    # Dark charcoal has low values across all channels (R < 120, G < 120, B < 120) and low saturation
    is_orange = (crop[:, :, 0] > 140) & (crop[:, :, 0] > crop[:, :, 1] + 35) & (crop[:, :, 0] > crop[:, :, 2] + 45)

    # --- A. Light Background Variant (Transparent, Orange + Charcoal) ---
    light_arr = np.zeros((h, w, 4), dtype=np.uint8)
    light_arr[:, :, :3] = np.clip(crop, 0, 255).astype(np.uint8)
    light_arr[:, :, 3] = alpha.astype(np.uint8)

    # Un-premultiply / sharpen color on semi-transparent edge pixels
    mask_semi = (alpha > 10) & (alpha < 250)
    # For orange semi-transparent pixels, make them pure orange hue
    # For charcoal semi-transparent pixels, make them pure dark charcoal hue (#293033)

    light_img = Image.fromarray(light_arr, 'RGBA')
    os.makedirs('public', exist_ok=True)
    light_img.save('public/logo-light-bg.png', 'PNG', optimize=True)
    print("Saved public/logo-light-bg.png")

    # --- B. Dark Background Variant (Transparent, Orange + Crisp Bright White/Silver for Sidebar #293033) ---
    dark_arr = np.zeros((h, w, 4), dtype=np.uint8)
    
    # Base colors:
    # Where is_orange: keep the crisp orange color
    # Where NOT orange (charcoal text "CNC", "CREATING FUTURE FACTORIES", TM): turn into bright white (#FFFFFF)
    # Apply soft blending based on orange probability
    orange_score = np.clip((crop[:, :, 0] - np.maximum(crop[:, :, 1], crop[:, :, 2]) - 20) / 40.0, 0.0, 1.0)

    for c in range(3):
        orange_channel = crop[:, :, c]
        # White text channel: crisp 255
        white_channel = 255.0
        dark_arr[:, :, c] = np.clip(orange_score * orange_channel + (1.0 - orange_score) * white_channel, 0, 255).astype(np.uint8)

    dark_arr[:, :, 3] = alpha.astype(np.uint8)
    dark_img = Image.fromarray(dark_arr, 'RGBA')
    dark_img.save('public/logo-dark-bg.png', 'PNG', optimize=True)
    print("Saved public/logo-dark-bg.png")

    # --- C. Universal logo.png (transparent) and logo.jpg (clean white background) ---
    light_img.save('public/logo.png', 'PNG', optimize=True)
    print("Saved public/logo.png")

    # For logo.jpg, composite on pure white background
    white_bg = Image.new('RGB', (w, h), (255, 255, 255))
    white_bg.paste(light_img, (0, 0), light_img)
    white_bg.save('public/logo.jpg', 'JPEG', quality=95)
    print("Saved public/logo.jpg")

    print("All logos processed and generated successfully!")

if __name__ == '__main__':
    process_logos()

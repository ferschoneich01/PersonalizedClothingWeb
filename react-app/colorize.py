import os
try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Dependencies not installed yet.")
    exit(1)

COLORS = {
    'black': (68, 68, 68),
    'gray': (160, 160, 160),
    'pink': (255, 180, 195)
}

files_to_process = [
    ('crewneck_white_front_1779694027745.png', {'pink': COLORS['pink']}),
    ('tshirt_mockup_back.png', COLORS),
    ('hoodie_mockup_back.png', COLORS),
    ('tshirt_mockup_sleeve.png', COLORS)
]

def process_image(img_name, colors_dict):
    input_path = f"public/img/{img_name}"
    if not os.path.exists(input_path):
        print(f"Skipping {img_name}, not found.")
        return

    print(f"Processing {img_name}...")
    original_img = Image.open(input_path).convert("RGBA")
    
    print("Removing background...")
    # rembg automatically extracts the foreground
    img_no_bg = remove(original_img)
    
    # We want to tint ONLY the foreground, keeping original shadows/highlights (multiply mode)
    # img_no_bg contains the garment with transparent background
    
    for color_name, rgb in colors_dict.items():
        print(f"Generating {color_name}...")
        
        # Create a solid color image
        color_layer = Image.new("RGBA", img_no_bg.size, (rgb[0], rgb[1], rgb[2], 255))
        
        # Multiply blend mode: (A * B) / 255
        # We manually multiply the pixels
        colored_fg = Image.new("RGBA", img_no_bg.size)
        
        # Optimize using load()
        pixels_fg = colored_fg.load()
        pixels_no_bg = img_no_bg.load()
        
        for x in range(img_no_bg.width):
            for y in range(img_no_bg.height):
                r, g, b, a = pixels_no_bg[x, y]
                if a > 0:
                    new_r = int((r * rgb[0]) / 255)
                    new_g = int((g * rgb[1]) / 255)
                    new_b = int((b * rgb[2]) / 255)
                    # We keep the alpha of the extracted foreground
                    pixels_fg[x, y] = (new_r, new_g, new_b, a)
                else:
                    pixels_fg[x, y] = (0, 0, 0, 0)
                    
        # Now paste the colored foreground onto a white background
        final_img = Image.new("RGBA", img_no_bg.size, (255, 255, 255, 255))
        # Paste using colored_fg as mask
        final_img.paste(colored_fg, (0, 0), colored_fg)
        
        # Determine output name
        out_name = ""
        if "crewneck" in img_name:
            out_name = img_name.replace("white", color_name).replace("_1779694027745", "")
        elif "tshirt_mockup_back" in img_name:
            out_name = f"tshirt_{color_name}_back.png"
        elif "hoodie_mockup_back" in img_name:
            out_name = f"hoodie_{color_name}_back.png"
        elif "tshirt_mockup_sleeve" in img_name:
            out_name = f"tshirt_{color_name}_sleeve.png"
            
        final_img.save(f"public/img/{out_name}")
        print(f"Saved {out_name}")

for img_name, colors_dict in files_to_process:
    process_image(img_name, colors_dict)

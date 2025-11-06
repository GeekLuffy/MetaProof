#!/usr/bin/env python3
"""
Simple script to create placeholder icons for the Chrome extension.
Requires: pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Icon sizes required
SIZES = [16, 32, 48, 128]

# Colors (Indigo/Purple theme)
BG_COLOR = (99, 102, 241)  # Primary indigo
TEXT_COLOR = (255, 255, 255)  # White

def create_icon(size):
    """Create a simple icon with 'POA' text"""
    # Create image with background color
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Add text
    text = "POA"
    
    # Try to use a nice font, fallback to default
    try:
        font_size = size // 4
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=TEXT_COLOR, font=font)
    
    # Save icon
    filename = f"icon{size}.png"
    img.save(filename, 'PNG')
    print(f"✓ Created {filename}")

def main():
    print("Creating Proof of Art extension icons...")
    print("-" * 40)
    
    for size in SIZES:
        create_icon(size)
    
    print("-" * 40)
    print("✓ All icons created successfully!")
    print("\nNote: These are placeholder icons.")
    print("For production, create professional icons using a design tool.")

if __name__ == "__main__":
    main()


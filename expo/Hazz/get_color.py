from PIL import Image

img = Image.open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/.user_uploaded/media_1788404799976.png')
# Get a pixel from the left side of the banner (it's a dark green solid background there)
width, height = img.size
pixel = img.getpixel((50, height // 2))
print(f"#{pixel[0]:02x}{pixel[1]:02x}{pixel[2]:02x}")

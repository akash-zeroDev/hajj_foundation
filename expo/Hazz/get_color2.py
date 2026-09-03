from PIL import Image

img = Image.open('/Users/apple/.gemini/antigravity/brain/97b9ce32-64bc-4963-a46f-a96452204519/.user_uploaded/media_1788404799976.png')
width, height = img.size
pixel1 = img.getpixel((width // 4, height // 2))
pixel2 = img.getpixel((width // 2, height // 2))
print(f"#{pixel1[0]:02x}{pixel1[1]:02x}{pixel1[2]:02x}")
print(f"#{pixel2[0]:02x}{pixel2[1]:02x}{pixel2[2]:02x}")

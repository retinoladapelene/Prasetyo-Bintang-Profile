import sys

src_path = r"c:\Users\Prase\Downloads\WEB\portofolio_web_backup\src\components\sections\ArchiveGallery.tsx"
effect_path = r"c:\Users\Prase\Downloads\WEB\portofolio_web_backup\scratch\effect.txt"

with open(src_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(effect_path, 'r', encoding='utf-8') as f:
    effect_content = f.read()

# We know the indices exactly now.
# line 507 in file is index 506 (starts with `  useEffect(() => {\n`)
# line 830 in file is index 829 (ends with `  }, [activeIndex, clampedActiveIndex, clampedWallIndex, isWallPanel, galleryItems.length, syncTick]);\n`)

new_lines = lines[:506] + [effect_content + "\n"] + lines[830:]

with open(src_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully replaced lines 507 to 830.")


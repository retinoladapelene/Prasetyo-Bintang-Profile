import sys

src_path = r"c:\Users\Prase\Downloads\WEB\portofolio_web_backup\src\components\sections\ArchiveGallery.tsx"
effect_path = r"c:\Users\Prase\Downloads\WEB\portofolio_web_backup\scratch\effect.txt"

with open(src_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(effect_path, 'r', encoding='utf-8') as f:
    effect_content = f.read()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if line.startswith("  useEffect(() => {"):
        # Check if the preceding lines match our target area
        if i > 0 and "wallIndexRef.current" in "".join(lines[i-5:i]):
            start_idx = i
            break

for i in range(start_idx, len(lines)):
    if "  }, [activeIndex, clampedActiveIndex, clampedWallIndex, isWallPanel, galleryItems.length, syncTick]);" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [effect_content + "\n"] + lines[end_idx + 1:]
    with open(src_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Replaced lines {start_idx+1} to {end_idx+1}.")
else:
    print(f"Failed to find block. start_idx={start_idx}, end_idx={end_idx}")


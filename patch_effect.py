import sys
import re

path = r"c:\Users\Prase\Downloads\WEB\portofolio_web_backup\scratch\effect.txt"
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the initial condition
text = text.replace(
    '    if (typeof window !== "undefined" && (window as any).lenis) {\n      const lenis = (window as any).lenis;\n      const st = ScrollTrigger.getById("galleryTrigger");',
    '    if (typeof window === "undefined") return;\n\n      const getLenis = () => (window as any).lenis;\n      const getSt = () => ScrollTrigger.getById("galleryTrigger");'
)

# Replace doSnap signature
text = text.replace(
    '      const doSnap = (idx: number, isWall: boolean) => {\n        if (!st || isSnappingRef.current) return;',
    '      const doSnap = (idx: number, isWall: boolean) => {\n        const lenis = getLenis();\n        const st = getSt();\n        if (!lenis || !st || isSnappingRef.current) return;'
)

# Remove `if (st) {` wrapper (lines 75-76 in the text)
text = text.replace('      if (st) {\n        if (!isWallPanel) {', '      if (true) {\n        if (!isWallPanel) {')

# Fix references in the handlers
text = text.replace('const st = ScrollTrigger.getById("galleryTrigger");', 'const st = getSt();')
text = text.replace('const lenis = (window as any).lenis;', 'const lenis = getLenis();')

# Need to ensure that `lenis` is defined where `lenis.scrollTo` or `lenis.scroll` is called in the handlers (other than doSnap).
# In `handleWheel` for the carousel phase, there is no local `lenis` defined!
# Let's fix that by simply injecting `const lenis = getLenis();` at the beginning of the handlers.
text = re.sub(
    r'const handleWheel = \(e: WheelEvent\) => \{',
    'const handleWheel = (e: WheelEvent) => {\n            const lenis = getLenis();\n            const st = getSt();\n            if (!lenis || !st) return;',
    text
)

text = re.sub(
    r'const handleTouchStart = \(e: TouchEvent\) => \{',
    'const handleTouchStart = (e: TouchEvent) => {\n            const lenis = getLenis();\n            const st = getSt();\n            if (!lenis || !st) return;',
    text
)

text = re.sub(
    r'const handleTouchMove = \(e: TouchEvent\) => \{',
    'const handleTouchMove = (e: TouchEvent) => {\n            const lenis = getLenis();\n            const st = getSt();\n            if (!lenis || !st) return;',
    text
)

# Also fix `(window as any).lenis?.scroll` 
text = text.replace('(window as any).lenis?.scroll', 'lenis.scroll')

# Now clean up the end brackets. 
# We replaced `if (typeof window !== "undefined" && (window as any).lenis) {` with an early return, 
# so we have one too many `}` at the end.
# We also changed `if (st) {` to `if (true) {` so the number of braces is still correct for that.
# So we only need to remove the very last `}`.
text = text.replace('      }\n    }\n  }, [', '      }\n  }, [')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Effect patched successfully.")

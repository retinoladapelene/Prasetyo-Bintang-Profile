import re

filepath = r"c:\Users\Prase\Downloads\WEB\portofolio_web_backup\src\components\sections\ArchiveGallery.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We want to remove the condition `if (typeof window !== "undefined" && (window as any).lenis)` 
# and `if (st)` wrapping the event listeners.
# Actually, it's easier to just do a smart string replacement for the `useEffect` body.

def replace_effect(match):
    body = match.group(0)
    
    # 1. Replace the initial `if (typeof window !== ...)` with an early return
    body = body.replace(
        'if (typeof window !== "undefined" && (window as any).lenis) {\n      const lenis = (window as any).lenis;\n      const st = ScrollTrigger.getById("galleryTrigger");',
        'if (typeof window === "undefined") return;\n\n      const lenis = (window as any).lenis;\n      const st = ScrollTrigger.getById("galleryTrigger");'
    )
    
    # 2. Inside doSnap, fetch lenis and st dynamically
    body = body.replace(
        'const doSnap = (idx: number, isWall: boolean) => {\n        if (!st || isSnappingRef.current) return;',
        'const doSnap = (idx: number, isWall: boolean) => {\n        const lenis = (window as any).lenis;\n        const st = ScrollTrigger.getById("galleryTrigger");\n        if (!lenis || !st || isSnappingRef.current) return;'
    )
    
    # 3. Remove `if (st) {` wrapper around the listener registration
    body = body.replace('if (st) {\n        if (!isWallPanel) {', 'if (!isWallPanel) {')
    # and we need to remove the closing bracket for `if (st)` at the end of the block.
    # It was at line 828, right before `    }` (for the `if(typeof window)`).
    # Since we replaced the first `if(typeof window...) {` with early return, we have 2 extra closing braces at the end.
    
    # The end of the block was:
    #           };
    #         }
    #       }
    #     }
    #   }, [activeIndex...
    
    # We want it to be:
    #           };
    #         }
    #   }, [activeIndex...
    body = body.replace('        }\n      }\n    }\n  }, [', '        }\n  }, [')
    
    # Wait, there's another closing brace. Let's do it with regex.
    body = re.sub(r'\s*\}\s*\}\s*\}\s*\}, \[activeIndex', '\n  }, [activeIndex', body)
    
    # 4. Fetch lenis dynamically inside handlers that use it.
    body = body.replace('const currentScrollY = (window as any).lenis?.scroll || window.scrollY;', 'const lenis = (window as any).lenis;\n            const currentScrollY = lenis?.scroll || window.scrollY;')
    # We might have `lenis.scrollTo` in the handlers. We need to make sure `lenis` is defined.
    # It's already defined inside `doSnap`.
    # But in `handleWheel` (for Carousel):
    # `lenis.scrollTo(st.start - window.innerHeight * 0.5, { duration: 1 });`
    # We need to ensure `lenis` is available there.
    
    return body

# Actually, the python script approach using simple replace might be fragile. 
# Let me use the `multi_replace_file_content` directly.

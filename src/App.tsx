import portraitCg from "../portrait-cg.webp"

import portraitReal from "../portrait-real.webp"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react"
import { createPortal } from "react-dom"
import { useVideoPlayback, type PlaybackStatus } from "./useVideoPlayback"

import {

  ArrowUpRight,

  Fullscreen,

  Pause,

  Play,

  RotateCcw,

  Star,

  X,
} from "lucide-react"

type Theme = {
  id: string
  image: string
  video: string
  name: { zh: string; en: string }
  category: { zh: string; en: string }
  year: string
  description: { zh: string; en: string }
  quoteExclusion?: QuoteExclusion
  palette: { background: string; accent: string; foreground: string; hairline: string }
}

const themes: readonly Theme[] = [

  {
    id: "01",

    image: "/media/palace-hero.webp",

    video: "/media/palace-loop-1080.mp4",

    name: { zh: "王国公主", en: "Kingdom Princess" },

    category: { zh: "AIGC概念艺术", en: "AIGC Concept Art" },

    year: "2026",
    description: {
      zh: "在古老王国与机械文明的交界，光掠过金属、织物与静默的宫殿。以日系幻想的角色和电影化 CG 场景，构筑一个介于现实与梦境之间的世界。",
      en: "At the meeting point of an ancient kingdom and a mechanical civilization, light moves across metal, fabric, and a silent palace. A cinematic CG reverie shaped by Japanese fantasy, suspended between reality and a dream.",
    },
    quoteExclusion: [.42, .17, .13, .23],
    palette: { background: "#171512", accent: "#c9a46a", foreground: "#f2eadc", hairline: "rgba(242,234,220,.3)" },

  },
]

const portfolioWorks: readonly [] = []

const scene = themes[0]

type Language = "zh" | "en"

const copy = {

  zh: {
    documentTitle: "陈彦辉｜个人作品",
    heroLabel: "陈彦辉个人作品首页",
    filmLabel: "王国公主幻想动画",
    languageButton: "切换为英文",
    languageMark: "EN",
    name: "陈彦辉",
    subtitle: "个人作品",
    page: "首页",
    sceneName: scene.name.zh,
    themeCategory: scene.category.zh,
    mainNav: "主要导航",
    sceneLabel: "在此切换主题",
    sceneArchive: "场景目录",
    available: "1 个场景",
    currentScene: "当前场景",
    sceneStillAlt: "王国公主场景剧照",
    previewScene: "预览场景",
    imageError: "场景图片载入失败，请取消后重试。",
    previewReady: "主题预览已展开",
    confirmTheme: "确认当前主题",
    cancelPreview: "取消预览",
    intro: "画面介绍",
    introClose: "收起介绍",
    introKicker: "关于此刻的世界",
    work: "作品",
    about: "关于",
    contact: "联系",
    aboutHint: "三维动画 / 生成式设计",
    contactHint: "联系信息",
    manifesto: "人是某种应当被超越的东西",
    attribution: "— 尼采",
    pause: "暂停影片",
    play: "播放影片",
    explore: "向下探索",
    nextChapter: "下一章 / 作品选集",
    returnHome: "向上返回",
    cinema: "观影模式",
    restore: "恢复界面",
    close: "关闭",
    aboutPanel: "关于 / 02",
    aboutTitleA: "陈彦辉",
    aboutTitleB: "三维动画 · AIGC 设计师",
    aboutBody: "2023级本科 · 动画专业",
    aboutSoftwareTitle: "精通软件",
    contactPanel: "联系 / 03",
    contactTitleA: "从一个想法，",
    contactTitleB: "开始对话。",
    contactBody: "项目合作、创意交流，欢迎联系。",
    selectedWork: "作品选集 / 2026",
    workIndex: "作品索引",
    workIntro: "第一幕之后，世界继续展开。",
    workType: "幻想影像 / 世界构建",
    emptyWork: "作品待上新",
  },
  en: {
    documentTitle: "Chen Yanhui | Selected Works",
    heroLabel: "Chen Yanhui selected works home page",
    filmLabel: "Kingdom Princess fantasy animation",
    languageButton: "Switch to Chinese",
    languageMark: "中",
    name: "Chen Yanhui",
    subtitle: "Selected Works",
    page: "Home",
    sceneName: scene.name.en,
    themeCategory: scene.category.en,
    mainNav: "Main navigation",
    sceneLabel: "Switch theme here",
    sceneArchive: "Scene Archive",
    available: "1 Scene",
    currentScene: "Current Scene",
    sceneStillAlt: "Kingdom Princess scene still",
    previewScene: "Preview Scene",
    imageError: "Scene image failed to load. Cancel and try again.",
    previewReady: "Theme preview expanded",
    confirmTheme: "Confirm This Theme",
    cancelPreview: "Cancel Preview",
    intro: "Scene Notes",
    introClose: "Close Notes",
    introKicker: "Inside This World",
    work: "Work",
    about: "About",
    contact: "Contact",
    aboutHint: "3D Animation / Generative Design",
    contactHint: "Contact details",
    manifesto: "Man is something that shall be overcome.",
    attribution: "— Friedrich Nietzsche",
    pause: "Pause film",
    play: "Play film",
    explore: "Explore",
    nextChapter: "Next / Selected Works",
    returnHome: "Return to Top",
    cinema: "Cinema Mode",
    restore: "Restore Interface",
    close: "Close",
    aboutPanel: "Profile / 02",
    aboutTitleA: "Chen Yanhui",
    aboutTitleB: "3D Animation · AIGC Designer",
    aboutBody: "Animation undergraduate · 2023 intake",
    aboutSoftwareTitle: "Software expertise",
    contactPanel: "Contact / 03",
    contactTitleA: "Every idea",
    contactTitleB: "starts a conversation.",
    contactBody:
      "For project collaborations or creative conversations, get in touch.",
    selectedWork: "Selected Works / 2026",
    workIndex: "Work Index",
    workIntro: "Beyond the first act, the world continues to unfold.",
    workType: "Fantasy Film / World Building",
    emptyWork: "New work coming soon",
  },
} as const

type Copy = { [Key in keyof typeof copy.zh]: typeof copy.zh[Key] extends readonly string[] ? readonly string[] : string }

function SceneMenu({ select, text, language, activeId, onOpenChange }: {
  select: (index: number) => void
  text: Copy
  language: Language
  activeId: string
  onOpenChange: (open: boolean) => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [browsing, setBrowsing] = useState(0)
  const open = !dismissed && (hovered || focused || pinned)
  const candidate = themes[browsing]

  useEffect(() => { onOpenChange(open) }, [open, onOpenChange])
  const close = useCallback(() => {
    setPinned(false)
    setHovered(false)
    setFocused(false)
    setDismissed(true)
  }, [])

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close()
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    document.addEventListener("pointerdown", outside, true)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", outside, true)
      document.removeEventListener("keydown", escape)
    }
  }, [close])

  const choose = () => {
    close()
    ;(document.activeElement as HTMLElement | null)?.blur()
    select(browsing)
  }

  return (
    <div ref={root} className={`scene-picker ${open ? "open" : ""}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return
        setHovered(true)
        setDismissed(false)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => { if (!dismissed) setFocused(true) }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}>
      <button className="scene-trigger" type="button"
        aria-expanded={open} aria-controls="scene-menu" aria-label={text.sceneLabel}
        onClick={() => { setPinned(true); setDismissed(false) }}>
        <span className="ticks" aria-hidden="true"><i /><i /><i /></span>
        <span className="scene-line" aria-hidden="true" />
        <span className="vertical-label" aria-hidden="true">
          <span className="scene-hint-phrase">
            {[...text.sceneLabel].map((character, index) => (
              <span className="scene-hint-character" key={`${language}-${index}`}
                style={{ "--hint-index": index } as React.CSSProperties}>
                {character === " " ? "\u00a0" : character}
              </span>
            ))}
          </span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div id="scene-menu" className="scene-menu"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.4 }}>
            <nav className="scene-chapters" aria-label={text.sceneArchive}
              onKeyDown={(event) => {
                if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return
                event.preventDefault()
                const next = event.key === "Home" ? 0 : event.key === "End" ? themes.length - 1
                  : (browsing + (event.key === "ArrowDown" ? 1 : -1) + themes.length) % themes.length
                setBrowsing(next)
                root.current?.querySelector<HTMLButtonElement>(`[data-scene-index="${next}"]`)?.focus({ preventScroll: true })
              }}>
              {themes.map((theme, index) => (
                <button type="button" key={theme.id} data-scene-index={index}
                  className={`scene-tick ${index === browsing ? "is-browsing" : ""}`}
                  aria-label={theme.name[language]} aria-current={theme.id === activeId ? "true" : undefined}
                  onPointerEnter={() => setBrowsing(index)} onFocus={() => setBrowsing(index)}
                  onClick={() => setBrowsing(index)}>
                  <i aria-hidden="true" /><span>{theme.id}</span>
                </button>
              ))}
            </nav>
            <div className="scene-still">
              <header><span>{text.sceneArchive}</span><span>{candidate.id} / {String(themes.length).padStart(2, "0")}</span></header>
              <button className="scene-card" type="button" onClick={choose}
                aria-label={`${text.previewScene} ${candidate.name[language]}`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img key={candidate.id} src={candidate.image} alt={candidate.name[language]}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0.1 : 0.25 }} />
                </AnimatePresence>
                <span className="card-shade" />
                <span className="still-corner corner-a" aria-hidden="true" />
                <span className="still-corner corner-b" aria-hidden="true" />
                <ArrowUpRight size={16} strokeWidth={1.2} />
              </button>
              <div className="scene-caption"><b>{candidate.name[language]}</b><span>{candidate.year}</span></div>
              <small className="scene-category">{candidate.category[language]}</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
function ThemePreview({ phase, theme, language, onReady, onConfirm, onCancel, text }: {
  phase: "opening" | "ready"

  theme: Theme

  language: Language

  onReady: () => void

  onConfirm: () => void

  onCancel: () => void

  text: Copy

}) {
  const reduced = useReducedMotion()

  const dialog = useRef<HTMLDivElement>(null)

  const [imageReady, setImageReady] = useState(false)

  const [imageError, setImageError] = useState(false)

  const readyAt = useRef(Infinity)

  useEffect(() => { dialog.current?.querySelector<HTMLButtonElement>(".preview-close")?.focus({ preventScroll: true }) }, [])

  useEffect(() => { if (phase === "ready") readyAt.current = performance.now() }, [phase])

  return createPortal(

    <motion.div ref={dialog} className={`scene-preview is-${phase}`}

      style={{ "--scene-bg": theme.palette.background, "--gold": theme.palette.accent,

        "--ivory": theme.palette.foreground, "--hair": theme.palette.hairline } as React.CSSProperties}

      role="dialog" aria-modal="true" aria-label={`${text.previewScene} ${theme.name[language]}`}

      initial={{ opacity: 1 }} exit={{ opacity: 0 }}

      transition={{ duration: reduced ? 0.12 : 0.65 }}

      onKeyDown={(event) => {

        if (event.key !== "Tab") return

        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"))

        const first = buttons[0], last = buttons[buttons.length - 1]

        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }

        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }

      }}>
      <motion.img className="preview-image" src={theme.image} alt=""

        onLoad={() => setImageReady(true)} onError={() => setImageError(true)}

        initial={{ opacity: 0 }} animate={{ opacity: imageReady ? 1 : 0 }}

        transition={{ duration: reduced ? 0.15 : 1.2, ease: [0.4, 0, 0.2, 1] }}

        onAnimationComplete={() => { if (imageReady && phase === "opening") onReady() }} />

      <div className="preview-vignette" aria-hidden="true" />

      <button type="button" className="preview-close" onClick={onCancel} aria-label={text.cancelPreview}>

        <X size={18} strokeWidth={1.2} />

      </button>

      {imageError && <p className="preview-error" role="alert">{text.imageError}</p>}

      <motion.div className="preview-caption" initial={{ opacity: 0 }}

        animate={{ opacity: imageReady ? 1 : 0 }} transition={{ duration: 0.6, delay: reduced ? 0 : 0.5 }}>

        <small>{theme.id} / {String(themes.length).padStart(2, "0")}</small>

        <h2>{theme.name[language]}</h2><span>{theme.category[language]} / {theme.year}</span>

      </motion.div>
      {phase === "ready" && (
        <motion.div className="preview-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <span>{text.previewReady}</span>
          <button type="button" onKeyDown={(event) => { if (event.repeat) event.preventDefault() }}
            onClick={(event) => {
              if (event.detail > 1 || performance.now() - readyAt.current < 250) return
              onConfirm()
            }}>
            {text.confirmTheme}<ArrowUpRight size={15} strokeWidth={1.2} />
          </button>
        </motion.div>
      )}
    </motion.div>, document.body
  )
}

function NavAction({
  type,
  label,
  hint,
  number,
  onClick,
}: {
  type: "work" | "about" | "contact"
  label: string
  hint?: string
  number: string
  onClick: () => void
}) {
  return (
    <button className={`nav-action ${type}`} onClick={onClick}>
      <small>{number}</small>
      <span className="nav-symbol">
        {type === "work" && (
          <Star className="work-star" size={13} strokeWidth={1.2} />
        )}
        {type === "about" && (
          <>
            <i />
            <i />
          </>
        )}
        {type === "contact" && <ArrowUpRight size={17} strokeWidth={1.15} />}
      </span>
      <b>{label}</b>
      {hint && <em>{hint}</em>}
    </button>
  )
}

function PlaybackControl({
  videoRef,
  text,
  language,
  still,
  status,
  onStill,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
  text: Copy
  language: Language
  still: boolean
  status: PlaybackStatus
  onStill: () => void
}) {
  const progressCircle = useRef<SVGCircleElement>(null)
  const radius = 21
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const video = videoRef.current
    const circle = progressCircle.current
    if (!video || !circle) return

    let handle: number | null = null
    let disposed = false
    const supportsVideoFrames =
      typeof video.requestVideoFrameCallback === "function" &&
      typeof video.cancelVideoFrameCallback === "function"

    const updateProgress = () => {
      const ratio =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.min(1, Math.max(0, video.currentTime / video.duration))
          : 0
      circle.style.strokeDashoffset = String(circumference * (1 - ratio))
    }
    const schedule = () => {
      if (disposed || video.paused || video.ended || handle !== null) return
      handle = supportsVideoFrames
        ? video.requestVideoFrameCallback(frame)
        : window.requestAnimationFrame(frame)
    }
    const frame = () => {
      handle = null
      if (disposed) return
      updateProgress()
      schedule()
    }
    const start = () => {
      updateProgress()
      schedule()
    }
    const stop = () => {
      if (handle !== null) {
        if (supportsVideoFrames) video.cancelVideoFrameCallback(handle)
        else window.cancelAnimationFrame(handle)
        handle = null
      }
      updateProgress()
    }
    const progressEvents = ["timeupdate", "loadedmetadata", "durationchange", "seeked", "emptied"] as const
    const stopEvents = ["pause", "waiting", "ended", "emptied"] as const

    start()
    progressEvents.forEach((event) => video.addEventListener(event, updateProgress))
    stopEvents.forEach((event) => video.addEventListener(event, stop))
    video.addEventListener("playing", start)
    return () => {
      disposed = true
      stop()
      progressEvents.forEach((event) => video.removeEventListener(event, updateProgress))
      stopEvents.forEach((event) => video.removeEventListener(event, stop))
      video.removeEventListener("playing", start)
    }
  }, [circumference, videoRef])

  const zh = language === "zh"
  const loading = status === "loading"
  const retry = status === "error"
  const action = retry ? (zh ? "重新加载影片" : "Reload film") : still ? text.play : text.pause
  const label = loading
    ? (zh ? "影片缓冲中" : "Buffering film")
    : status === "blocked" ? (zh ? "点击播放影片" : "Click to play")
    : retry ? (zh ? "加载失败，点击重试" : "Failed to load · retry")
    : still ? (zh ? "画面已定格" : "Frozen") : (zh ? "画面流动中" : "In motion")
  return (
    <button
      data-playback={status}
      className={`playback-still ${still ? "is-paused is-on" : "is-playing"}`}
      type="button"
      onClick={onStill}
      aria-pressed={still}
      aria-label={action}
      title={action}
    >
      <span className="playback-gauge" aria-hidden="true">
        <svg className="playback-progress" viewBox="0 0 48 48">
          <circle className="ring-track" cx="24" cy="24" r={radius} />
          <circle ref={progressCircle} className="ring-progress" cx="24" cy="24" r={radius}
            style={{ strokeDasharray: circumference, strokeDashoffset: circumference }} />
        </svg>
        <span className="still-frame">
          <i /><i /><i /><i />
          {still ? <Play size={12} strokeWidth={1.2} /> : <Pause size={12} strokeWidth={1.2} />}
        </span>
      </span>
      <span className="widget-copy">
        <small>{zh ? "静帧" : "Still frame"}</small>
        <b role="status">{label}</b>
      </span>
    </button>
  )
}

function InteractiveText({

  text,

  reduced,
  subtle = false,

  className = "",

}: {
  text: string

  reduced: boolean

  subtle?: boolean

  className?: string

}) {
  const [hovered, setHovered] = useState<number | null>(null)

  let index = 0

  const hasSpaces = text.includes(" ")
  const words = hasSpaces ? text.split(" ") : [...text]

  const motionFor = (characterIndex: number) => {
    if (reduced || hovered === null) return { y: 0, scale: 1 }

    const distance = Math.abs(characterIndex - hovered)

    if (distance === 0)

      return subtle ? { y: -4, scale: 1.1 } : { y: -9, scale: 1.16 }

    if (distance === 1)

      return subtle ? { y: -2, scale: 1.04 } : { y: -5, scale: 1.07 }

    if (distance === 2)

      return subtle ? { y: -0.8, scale: 1.015 } : { y: -2, scale: 1.025 }

    return { y: 0, scale: 1 }

  }

  return (
    <span
      className={`interactive-text ${className}`}

      role="text"

      aria-label={text}

      onPointerLeave={() => setHovered(null)}

    >
      <span className="sr-only">{text}</span>

      <span className="wave-visual" aria-hidden="true">

        {words.map((word, wordIndex) => (

          <span className="wave-word" key={`${word}-${wordIndex}`}>

            {[...word].map((character) => {

              const characterIndex = index++

              return (
                <span
                  className="wave-hit"

                  key={`${character}-${characterIndex}`}

                  onPointerEnter={() => setHovered(characterIndex)}

                >
                  <motion.span
                    className="wave-char"

                    animate={motionFor(characterIndex)}

                    transition={

                      reduced
                        ? { duration: 0 }

                        : {
                            type: "spring",

                            stiffness: subtle ? 300 : 360,

                            damping: subtle ? 26 : 23,

                            mass: 0.65,

                          }
                    }
                  >
                    {character}
                  </motion.span>

                </span>

              )
            })}
            {hasSpaces && wordIndex < words.length - 1 && (

              <span className="wave-space">&nbsp;</span>

            )}
          </span>

        ))}
      </span>

    </span>

  )
}

type QuoteExclusion = readonly [number, number, number, number]

function QuoteFlight({ sourceRef, bundleRef, text, run, mode, returnRequest, held, enabled, reduced, exclusion, onActiveChange }: {
  sourceRef: React.RefObject<HTMLButtonElement | null>
  bundleRef: React.RefObject<HTMLDivElement | null>
  text: string
  run: number
  mode: "click" | "ambient"
  returnRequest: number
  held: boolean
  enabled: boolean
  reduced: boolean
  exclusion?: QuoteExclusion
  onActiveChange: (active: boolean) => void
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const lastRun = useRef(0)
  const returnNow = useRef<(() => void) | null>(null)
  const holdNow = useRef<(() => void) | null>(null)
  const heldRef = useRef(held)
  const enabledRef = useRef(enabled)
  useLayoutEffect(() => { enabledRef.current = enabled }, [enabled])
  // Holding is a live command, not a dependency that destroys the flight.
  useLayoutEffect(() => {
    heldRef.current = held
    if (held) holdNow.current?.()
    else returnNow.current?.()
  }, [held])

  useLayoutEffect(() => {
    if (!run || run === lastRun.current) return
    const layer = layerRef.current
    const source = sourceRef.current
    const bundle = bundleRef.current
    const hero = layer?.parentElement
    if (reduced || !layer || !source || !bundle || !hero) return

    type Part = "main" | "german" | "author" | "line" | "diamond"
    const selector = text.includes(" ") ? ".wave-word" : ".wave-hit"
    const main = Array.from(source.querySelectorAll<HTMLElement>(selector))
    const german = Array.from(bundle.querySelectorAll<HTMLElement>("blockquote p .wave-word"))
    const author = bundle.querySelector<HTMLElement>("blockquote footer > span")
    const line = bundle.querySelector<HTMLElement>(".quote-rule i")
    const diamond = bundle.querySelector<HTMLElement>(".quote-rule b")
    if (!main.length || !german.length || !author || !line || !diamond) return
    lastRun.current = run
    const entries: { original: HTMLElement; kind: Part; word: string; baseOpacity: number; baseRotation: number }[] = [
      ...main.map((original) => ({ original, kind: "main" as const, word: original.textContent ?? "", baseOpacity: 1, baseRotation: 0 })),
      ...german.map((original) => ({ original, kind: "german" as const, word: original.textContent ?? "", baseOpacity: 1, baseRotation: 0 })),
      { original: author, kind: "author", word: author.textContent ?? "", baseOpacity: Number(getComputedStyle(author.parentElement!).opacity), baseRotation: 0 },
      { original: line, kind: "line", word: "", baseOpacity: 1, baseRotation: 0 },
      { original: diamond, kind: "diamond", word: "", baseOpacity: 1, baseRotation: 45 },
    ]
    const originals = entries.map((entry) => entry.original)
    const words = entries.map((entry) => entry.word)
    const mainCount = main.length
    const fragment = document.createDocumentFragment()
    // Paint above the largest displayed scale, then downsample. This prevents
    // transformed text and ornaments from enlarging a small cached texture.
    const renderScale = 3
    const scaledPixels = (value: string) => /^-?[\d.]+px$/.test(value) ? `${parseFloat(value) * renderScale}px` : value
    // Read each source's own typography. The German line and signature must not
    // inherit the much larger Chinese headline font.
    const letters = entries.map((entry) => {
      const clone = document.createElement("span")
      const style = getComputedStyle(entry.original)
      clone.className = `quote-flight-glyph quote-flight-${entry.kind}${/超|越|overcome/.test(entry.word) ? " is-emphasis" : ""}`
      clone.textContent = entry.word
      clone.style.font = style.font
      clone.style.fontSize = scaledPixels(style.fontSize)
      clone.style.lineHeight = scaledPixels(style.lineHeight)
      clone.style.letterSpacing = scaledPixels(style.letterSpacing)
      clone.style.textTransform = style.textTransform
      clone.style.color = style.color
      clone.style.opacity = String(entry.baseOpacity)
      if (entry.kind === "line" || entry.kind === "diamond") {
        clone.style.width = scaledPixels(style.width)
        clone.style.height = scaledPixels(style.height)
        clone.style.border = style.border
        clone.style.borderWidth = style.borderWidth.split(" ").map(scaledPixels).join(" ")
        clone.style.background = style.background
        clone.style.boxSizing = style.boxSizing
      }
      fragment.appendChild(clone)
      return clone
    })
    layer.replaceChildren(fragment)
    const bounds = hero.getBoundingClientRect()
    const { width, height } = bounds
    const origin = (index: number) => {
      const rect = originals[index].getBoundingClientRect()
      const box = hero.getBoundingClientRect()
      return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 }
    }
    const starts = originals.map((_, i) => origin(i))
    const sizes = originals.map((letter) => letter.getBoundingClientRect())
    let currentSource = source
    let currentBundle = bundle
    const refreshOriginals = () => {
      const nextSource = sourceRef.current
      const nextBundle = bundleRef.current
      if (!nextSource || !nextBundle) return false
      if (nextSource !== currentSource || nextBundle !== currentBundle) {
        const liveMain = Array.from(nextSource.querySelectorAll<HTMLElement>(selector))
        const liveGerman = Array.from(nextBundle.querySelectorAll<HTMLElement>("blockquote p .wave-word"))
        const liveAuthor = nextBundle.querySelector<HTMLElement>("blockquote footer > span")
        const liveLine = nextBundle.querySelector<HTMLElement>(".quote-rule i")
        const liveDiamond = nextBundle.querySelector<HTMLElement>(".quote-rule b")
        if (liveMain.length !== mainCount || liveGerman.length !== german.length || !liveAuthor || !liveLine || !liveDiamond) return false
        originals.splice(0, originals.length, ...liveMain, ...liveGerman, liveAuthor, liveLine, liveDiamond)
        currentSource = nextSource
        currentBundle = nextBundle
        currentBundle.dataset.quoteFlying = "true"
      }
      return true
    }
    let ambient = mode === "ambient"
    const compact = width < 1000
    const shortViewport = height < 600
    const shortLandscape = width > height && shortViewport
    const columns = compact ? Math.min(text.includes(" ") ? shortLandscape ? 4 : 3 : shortLandscape && height < 480 ? 6 : 5, mainCount) : mainCount
    const rows = Math.ceil(mainCount / columns)
    const germanColumns = compact ? (shortLandscape ? 4 : width < 600 ? 3 : 4) : german.length
    const germanRows = Math.ceil(german.length / germanColumns)
    const left = width < 600 ? 45 : compact ? 110 : 140
    const right = width < 600 ? width - 45 : width - 165
    const top = shortViewport ? Math.max(76, height * .23) : Math.min(height * .38, Math.max(190, height * .25))
    // Allocate the entire short-viewport stack together. A fixed German band can
    // spill into the signature when the quote wraps to two or three rows.
    const groupGap = shortViewport ? 10 : 12
    const authorHeight = shortViewport ? 24 : 36
    const authorBottom = shortViewport ? height - 62 : height - 93
    const authorTop = authorBottom - authorHeight
    const compactLane = (authorTop - top - groupGap * 2) / (rows * 1.35 + germanRows)
    const bottom = shortViewport ? top + rows * compactLane * 1.35 : Math.max(top + 45, height - 285)
    const rowHeight = (bottom - top) / rows
    const secondaryTop = shortViewport ? bottom + groupGap : Math.max(bottom + 38, height * .68)
    const secondaryBottom = shortViewport ? authorTop - groupGap : height - 142
    const germanLaneHeight = (secondaryBottom - secondaryTop) / germanRows
    const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max))
    const ease = (n: number) => { const t = clamp(n, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10) }
    const mix = (a: number, b: number, t: number) => a + (b - a) * t
    const rotatedSize = (index: number, degrees: number) => {
      const angle = degrees * Math.PI / 180
      const cosine = Math.abs(Math.cos(angle))
      const sine = Math.abs(Math.sin(angle))
      return { width: sizes[index].width * cosine + sizes[index].height * sine,
        height: sizes[index].height * cosine + sizes[index].width * sine }
    }

    // The focal area belongs to the theme image and follows its cover crop.
    const image = hero.querySelector<HTMLImageElement>(".media img.still")
    let protectedArea: { left: number; top: number; right: number; bottom: number } | null = null
    if (exclusion && image?.naturalWidth && image.naturalHeight) {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const renderedWidth = image.naturalWidth * scale
      const renderedHeight = image.naturalHeight * scale
      const objectPosition = getComputedStyle(image).objectPosition.split(" ").map(parseFloat)
      const offsetX = (width - renderedWidth) * (objectPosition[0] / 100)
      const offsetY = (height - renderedHeight) * (objectPosition[1] / 100)
      protectedArea = {
        left: offsetX + exclusion[0] * renderedWidth,
        top: offsetY + exclusion[1] * renderedHeight,
        right: offsetX + (exclusion[0] + exclusion[2]) * renderedWidth,
        bottom: offsetY + (exclusion[1] + exclusion[3]) * renderedHeight,
      }
    }
    const safePoint = (x: number, y: number, radius: number, radiusY = radius, rowTop = top, rowBottom = bottom, columnLeft = left, columnRight = right) => {
      x = clamp(x, columnLeft + radius, columnRight - radius)
      y = clamp(y, rowTop + radiusY, rowBottom - radiusY)
      if (protectedArea && x > protectedArea.left - radius - 18 && x < protectedArea.right + radius + 18 &&
          y > protectedArea.top - radiusY - 18 && y < protectedArea.bottom + radiusY + 18) {
        y = clamp(protectedArea.bottom + radiusY + 22, rowTop + radiusY, rowBottom - radiusY)
      }
      return { x, y }
    }
    const makeMainTargets = (ambient: boolean) => letters.slice(0, mainCount).map((_, i) => {
      const row = Math.floor(i / columns)
      const rowLength = Math.min(columns, mainCount - row * columns)
      const column = i % columns
      const t = (column + .5) / rowLength
      const u = compact && row % 2 ? 1 - t : t
      const highlight = /超|越|overcome/.test(words[i])
      const gap = (right - left) / rowLength
      const rotation = 7
      const rotated = rotatedSize(i, rotation)
      const verticalPadding = shortViewport ? 3 : 12
      const scale = Math.min(highlight ? 2.5 : 1.35 + (i % 3) * .15,
        gap * .72 / Math.max(1, rotated.width * 1.035), compact ? 1.7 : 2.5,
        compact ? Math.max(1, rowHeight - verticalPadding * 2) / (rotated.height * 1.035) : Infinity)
      const radius = rotated.width * scale * 1.035 / 2 + 4
      const radiusY = rotated.height * scale * 1.035 / 2 + verticalPadding
      const rowTop = compact ? top + row * rowHeight : top
      const rowBottom = compact ? rowTop + rowHeight : bottom
      const availableY = Math.max(0, (rowBottom - rowTop) / 2 - radiusY)
      const x = mix(left, right, u)
      const columnLeft = x - gap / 2
      const columnRight = x + gap / 2
      const y = compact
        ? (rowTop + rowBottom) / 2 + Math.sin(t * Math.PI) * (row % 2 ? -1 : 1) * Math.min(18, availableY * .45)
        : mix(top, bottom, ambient ? (((i * 5) % mainCount) + .5) / mainCount : .5 + Math.sin(t * Math.PI * 2 - .8) * .34)
      return { ...safePoint(x, y, radius, radiusY, rowTop, rowBottom, columnLeft, columnRight), scale, radius, radiusY, rowTop, rowBottom, columnLeft, columnRight,
        driftY: compact ? Math.min(15, availableY * .35) : 15, highlight, rotation }
    })
    const secondaryTargets = letters.slice(mainCount).map((_, local) => {
      const i = mainCount + local
      const entry = entries[i]
      const rotation = entry.kind === "line" ? 12 : entry.kind === "author" ? 2 : shortViewport ? 4 : 7
      const rotated = rotatedSize(i, entry.baseRotation + rotation)
      let x: number, y: number, scale: number, columnLeft = left, columnRight = right
      let rowTop = secondaryTop, rowBottom = secondaryBottom
      if (entry.kind === "german") {
        const row = Math.floor(local / germanColumns)
        const count = Math.min(germanColumns, german.length - row * germanColumns)
        const column = local % germanColumns
        const gap = (right - left) / count
        x = left + (column + .5) * gap
        columnLeft = x - gap / 2
        columnRight = x + gap / 2
        const laneHeight = germanLaneHeight
        rowTop = secondaryTop + row * laneHeight
        rowBottom = rowTop + laneHeight
        y = (rowTop + rowBottom) / 2
        scale = Math.min(compact ? 1.2 : 1.65, (gap - 8) / Math.max(1, rotated.width * 1.035),
          Math.max(1, laneHeight - 8) / Math.max(1, rotated.height * 1.035))
      } else if (entry.kind === "author") {
        x = width * .52
        rowTop = authorTop
        rowBottom = authorBottom
        y = (rowTop + rowBottom) / 2
        scale = Math.min(1.35, (right - left) * .8 / Math.max(1, rotated.width * 1.035),
          (authorHeight - 8) / Math.max(1, rotated.height * 1.035))
      } else {
        // The short gold ray follows its diamond as a single guide motif.
        x = width * .5 + (entry.kind === "line" ? -26 : 18)
        y = top - (shortViewport ? 10 : 28)
        rowTop = y - 22
        rowBottom = y + 22
        scale = entry.kind === "line" ? .48 : 2.8
      }
      const radius = rotated.width * scale * 1.035 / 2 + 3
      const radiusY = rotated.height * scale * 1.035 / 2 + 4
      return { ...safePoint(x, y, radius, radiusY, rowTop, rowBottom, columnLeft, columnRight), scale, radius, radiusY, rowTop, rowBottom, columnLeft, columnRight, driftY: entry.kind === "german" ? 4 : 6, highlight: false, rotation }
    })
    let targets = [...makeMainTargets(ambient), ...secondaryTargets]
    // A relay uses one route per typographic layer. Each fragment arrives
    // from its own tangent, follows the route, then leaves toward its source.
    // Delaying the whole route, rather than angular slots, prevents a ring
    // from ever assembling as one rigid object.
    const fullTurn = Math.PI * 2
    const orbitCenter = { x: width * .5, y: height * .48 }
    const outerRadius = Math.max(28, Math.min(width * .31, (height - (shortViewport ? 108 : 160)) * .40))
    const orbitTilt = -.16
    const sweep = fullTurn + Math.PI * .16
    const relayDelay = entries.map((entry, i) => entry.kind === "main"
      ? i / Math.max(1, mainCount - 1) * 3.2
      : entry.kind === "german"
        ? .28 + (i - mainCount) / Math.max(1, german.length - 1) * 2.92
        : entry.kind === "author" ? 1.2 : entry.kind === "line" ? .48 : .68)
    const entrySeconds = 1.1
    const orbitSeconds = 3.25
    const exitSeconds = 1.45
    const returnSeconds = Math.max(...relayDelay) + entrySeconds + orbitSeconds + exitSeconds
    type Point = { x: number; y: number }
    const cubic = (a: Point, b: Point, c: Point, d: Point, t: number): Point => {
      const u = 1 - t
      return { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
        y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y }
    }
    const orbitConfig = entries.map((entry) => ({
      radius: outerRadius * (entry.kind === "main" ? 1 : entry.kind === "german" ? .52 : entry.kind === "author" ? .19 : .31),
      phase: entry.kind === "main" ? -2.55 : entry.kind === "german" ? -2.25 : entry.kind === "author" ? -2.15 : -2.8,
      scale: entry.kind === "main" ? 1.22 : entry.kind === "german" ? 1.08 : entry.kind === "author" ? 1.25 : entry.kind === "line" ? .45 : 2.2,
    }))
    const orbitPoint = (i: number, angle: number) => {
      const radius = orbitConfig[i].radius
      const rawX = Math.cos(angle) * radius
      const rawY = Math.sin(angle) * radius * .58
      const depth = Math.sin(angle) * radius * .82
      const perspective = 900 / (900 - depth)
      return { x: orbitCenter.x + (rawX * Math.cos(orbitTilt) - rawY * Math.sin(orbitTilt)) * perspective,
        y: orbitCenter.y + (rawX * Math.sin(orbitTilt) + rawY * Math.cos(orbitTilt)) * perspective,
        depth,
        scale: orbitConfig[i].scale * perspective,
        opacity: entries[i].baseOpacity * (.8 + Math.sin(angle) * .16),
        blur: 0,
        rotate: entries[i].baseRotation + Math.sin(angle) * (entries[i].kind === "line" ? 14 : 2.2) }
    }
    // Fit measured glyph bounds, including perspective and rotation. One scale
    // per typographic layer preserves the relay's shared route and hierarchy;
    // squeezing sampled positions against the viewport would bend its tangents.
    const orbitFit = new Map<Part, number>()
    const orbitEdge = width < 600 ? 18 : 24
    let radiusFit = 1
    for (let pass = 0; pass < 7; pass++) {
      orbitFit.clear()
      entries.forEach((entry, i) => {
        let fit = orbitFit.get(entry.kind) ?? 1
        for (let sample = 0; sample < 128; sample++) {
          const point = orbitPoint(i, fullTurn * sample / 128)
          const box = rotatedSize(i, point.rotate)
          const horizontalRoom = Math.min(point.x - orbitEdge, width - orbitEdge - point.x)
          const verticalRoom = Math.min(point.y - orbitEdge, height - orbitEdge - point.y)
          fit = Math.min(fit, horizontalRoom / Math.max(1, box.width * point.scale / 2),
            verticalRoom / Math.max(1, box.height * point.scale / 2))
        }
        orbitFit.set(entry.kind, fit)
      })
      if (Math.min(...orbitFit.values()) >= .76 || radiusFit <= .55) break
      // Tighten all rings together before reducing type size. The German and
      // signature routes therefore remain inside the main text's outer route.
      const nextRadiusFit = Math.max(.55, radiusFit * .88)
      orbitConfig.forEach((config) => { config.radius *= nextRadiusFit / radiusFit })
      radiusFit = nextRadiusFit
    }
    orbitConfig.forEach((config, i) => {
      const fit = orbitFit.get(entries[i].kind) ?? 1
      // Reserve a small sampling margin only when the viewport requires a fit.
      config.scale *= fit < 1 ? fit * .97 : 1
    })
    // Numerical derivatives of the projected route keep its entrance and exit
    // tangent-continuous even with perspective and the tilted orbital plane.
    const orbitVelocity = (i: number, angle: number) => {
      const epsilon = .001
      const before = orbitPoint(i, angle - epsilon)
      const after = orbitPoint(i, angle + epsilon)
      const angularRate = sweep / orbitSeconds * 1.4
      return { x: (after.x - before.x) / (2 * epsilon) * angularRate,
        y: (after.y - before.y) / (2 * epsilon) * angularRate }
    }
    const poses = starts.map((point, i) => ({ ...point, scale: 1, rotate: entries[i].baseRotation,
      opacity: entries[i].baseOpacity, depth: 0, blur: 0 }))
    let returnPoses: typeof poses | null = null
    let returningAt: number | null = null
    let frame = 0
    let disposed = false
    // Animation time advances only while the original scene is available.
    // Overlay and cinema transitions hide this layer without discarding poses.
    let timeline = 0
    let previousStamp = performance.now()
    let start = 0
    let launchPoses = poses.map((pose) => ({ ...pose }))
    const pointer = { x: -10000, y: -10000, active: false }
    const push = letters.map(() => ({ x: 0, y: 0 }))
    const beginReturn = () => {
      if (returningAt !== null || disposed || heldRef.current) return
      returningAt = timeline
      returnPoses = poses.map((pose) => ({ ...pose }))
      layer.dataset.phase = "returning"
    }
    returnNow.current = beginReturn
    holdNow.current = () => {
      if (disposed) return
      // Continue from the visible pose, including a half-finished return.
      launchPoses = poses.map((pose) => ({ ...pose }))
      start = timeline
      ambient = true
      targets = [...makeMainTargets(true), ...secondaryTargets]
      returningAt = null
      returnPoses = null
      delete layer.dataset.returnStage
      layer.dataset.mode = "ambient"
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !enabledRef.current || document.hidden) return
      const box = hero.getBoundingClientRect()
      pointer.x = event.clientX - box.left
      pointer.y = event.clientY - box.top
      pointer.active = true
    }
    const leave = () => { pointer.active = false }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && enabledRef.current) beginReturn()
    }
    const onVisibility = () => { previousStamp = performance.now(); pointer.active = false }
    const cleanup = () => {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      returnNow.current = null
      holdNow.current = null
      layer.style.visibility = "hidden"
      delete bundle.dataset.quoteFlying
      delete currentBundle.dataset.quoteFlying
      if (bundleRef.current) delete bundleRef.current.dataset.quoteFlying
      layer.replaceChildren()
      layer.dataset.phase = "idle"
      delete layer.dataset.returnStage
      onActiveChange(false)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("pointerout", leave)
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("visibilitychange", onVisibility)
    }
    const draw = (now: number) => {
      if (disposed) return
      const delta = Math.max(0, now - previousStamp)
      previousStamp = now
      if (!enabledRef.current || document.hidden || !refreshOriginals()) {
        layer.style.visibility = "hidden"
        pointer.active = false
        frame = requestAnimationFrame(draw)
        return
      }
      timeline += delta
      layer.style.visibility = "visible"
      const elapsed = (timeline - start) / 1000
      if (!heldRef.current && elapsed >= (ambient ? 9 : 5.9) && returningAt === null) beginReturn()
      layer.dataset.phase = returningAt !== null ? "returning" : elapsed < (ambient ? 3.1 : 2.1) ? "unfolding" : "floating"
      letters.forEach((letter, i) => {
        const target = targets[i]
        const entry = entries[i]
        const lag = ambient
          ? entry.kind === "diamond" ? 0 : entry.kind === "line" ? .05 : entry.kind === "main" ? i * .11 : entry.kind === "german" ? 1.1 + (i - mainCount) * .08 : 1.9
          : entry.kind === "main" ? i * .035 : entry.kind === "diamond" ? 0 : entry.kind === "line" ? .06 : .26 + (i - mainCount) * .045
        const progress = ease((elapsed - lag) / (ambient ? 1.35 : 1.8))
        let pose = poses[i]
        let depth = pose.depth
        let blur = pose.blur
        if (returningAt !== null && returnPoses) {
          const home = origin(i)
          const from = returnPoses[i]
          const returningSeconds = (timeline - returningAt) / 1000
          const local = returningSeconds - relayDelay[i]
          const config = orbitConfig[i]
          const entryPoint = orbitPoint(i, config.phase)
          const exitPoint = orbitPoint(i, config.phase + sweep)
          if (local < 0) {
            const waiting = clamp(returningSeconds / Math.max(.001, relayDelay[i]), 0, 1)
            const breathing = Math.sin(waiting * Math.PI) ** 2
            pose = { ...from, x: from.x + Math.sin(returningSeconds * .8 + i) * breathing * 5,
              y: from.y + Math.cos(returningSeconds * .7 + i * .6) * breathing * 4 }
            depth = from.depth
            blur = from.blur
          } else if (local < entrySeconds) {
            const t = local / entrySeconds
            const tangent = orbitVelocity(i, config.phase)
            const point = cubic(from, from, { x: entryPoint.x - tangent.x * entrySeconds / 3,
              y: entryPoint.y - tangent.y * entrySeconds / 3 }, entryPoint, t)
            const blend = ease(t)
            depth = mix(from.depth, entryPoint.depth, blend)
            blur = mix(from.blur, entryPoint.blur, blend)
            pose = { ...point, scale: mix(from.scale, entryPoint.scale, blend),
              rotate: mix(from.rotate, entryPoint.rotate, blend), opacity: mix(from.opacity, entryPoint.opacity, blend), depth, blur }
          } else if (local < entrySeconds + orbitSeconds) {
            const t = (local - entrySeconds) / orbitSeconds
            // Fast tangent crossings open into a slower foreground passage.
            // The derivative stays positive (.36–1.4) and equals 1.4 at both
            // ends, matching the entrance and exit Bezier velocities.
            const arc = t + .52 * Math.sin(fullTurn * t) / fullTurn - .12 * Math.sin(2 * fullTurn * t) / (2 * fullTurn)
            const point = orbitPoint(i, config.phase + sweep * arc)
            depth = point.depth
            blur = point.blur
            pose = { x: point.x, y: point.y, scale: point.scale, rotate: point.rotate, opacity: point.opacity, depth, blur }
          } else if (local < entrySeconds + orbitSeconds + exitSeconds) {
            const t = (local - entrySeconds - orbitSeconds) / exitSeconds
            const tangent = orbitVelocity(i, config.phase + sweep)
            const point = cubic(exitPoint, { x: exitPoint.x + tangent.x * exitSeconds / 3,
              y: exitPoint.y + tangent.y * exitSeconds / 3 }, home, home, t)
            const blend = ease(t)
            depth = exitPoint.depth * (1 - blend)
            blur = exitPoint.blur * (1 - blend)
            pose = { ...point, scale: mix(exitPoint.scale, 1, blend),
              rotate: mix(exitPoint.rotate, entry.baseRotation, blend), opacity: mix(exitPoint.opacity, entry.baseOpacity, blend), depth, blur }
          } else {
            depth = 0
            blur = 0
            pose = { ...home, scale: 1, rotate: entry.baseRotation, opacity: entry.baseOpacity, depth, blur }
          }
          layer.dataset.returnStage = "tangent-relay"

        } else {
          const dx = target.x - pointer.x
          const dy = target.y - pointer.y
          const distance = Math.hypot(dx, dy)
          const force = pointer.active ? Math.max(0, 1 - distance / 140) * 24 : 0
          push[i].x = mix(push[i].x, dx / Math.max(distance, 1) * force, .055)
          push[i].y = mix(push[i].y, dy / Math.max(distance, 1) * force, .055)
          const drift = Math.sin(elapsed * .85 + i * .75)
          const point = safePoint(target.x + Math.cos(elapsed * .55 + i) * 11 + push[i].x,
            target.y + drift * target.driftY + push[i].y, target.radius, target.radiusY, target.rowTop, target.rowBottom, target.columnLeft, target.columnRight)
          pose = { x: mix(launchPoses[i].x, point.x, progress) + (ambient ? Math.sin(progress * Math.PI) * (i % 2 ? 18 : -18) : 0),
            y: mix(launchPoses[i].y, point.y, progress) - Math.sin(progress * Math.PI) * (ambient ? Math.min(height * .25, 180) : 18 + i % 3 * 8),
            scale: mix(launchPoses[i].scale, target.scale * (1 + drift * .035), progress),
            rotate: mix(launchPoses[i].rotate, entry.baseRotation + Math.sin(elapsed * .55 + i * .8) * target.rotation * (i % 2 ? -1 : 1), progress),
            opacity: mix(launchPoses[i].opacity, entry.baseOpacity * (target.highlight ? 1 : .78 + (i % 3) * .07), progress), depth, blur }
        }
        // The returning Bezier handles are tangent-continuous. Clamping their
        // sampled positions would introduce corners, so only the free scatter
        // is constrained to its safe area.
        if (returningAt === null) {
          const frameBox = rotatedSize(i, pose.rotate)
          const halfWidth = frameBox.width * pose.scale / 2 + 12
          const halfHeight = frameBox.height * pose.scale / 2 + 12
          pose.x = clamp(pose.x, halfWidth, width - halfWidth)
          pose.y = clamp(pose.y, halfHeight, height - halfHeight)
          const distanceCue = Math.sin(elapsed * .45 + i * .73)
          depth = mix(launchPoses[i].depth, distanceCue * (entry.kind === "main" ? 45 : 24), progress)
          blur = 0
        }
        poses[i] = { ...pose, depth, blur }
        letter.style.transform = `translate3d(${pose.x}px,${pose.y}px,0) translate(-50%,-50%) rotate(${pose.rotate}deg) scale(${pose.scale / renderScale})`
        letter.style.opacity = String(pose.opacity)
        letter.style.zIndex = String(500 + Math.round(depth))
        letter.style.filter = "none"
        letter.dataset.depth = depth > 12 ? "near" : depth < -12 ? "far" : "middle"
      })
      if (returningAt !== null && timeline - returningAt > (returnSeconds * 1000 + 120)) { cleanup(); return }
      frame = requestAnimationFrame(draw)
    }
    draw(performance.now())
    bundle.dataset.quoteFlying = "true"
    onActiveChange(true)
    window.addEventListener("pointermove", onPointer, { passive: true })
    window.addEventListener("pointerout", leave, { passive: true })
    window.addEventListener("keydown", onKey)
    document.addEventListener("visibilitychange", onVisibility)
    return cleanup
  }, [run, mode, reduced, text, exclusion, sourceRef, bundleRef, onActiveChange])

  useEffect(() => { if (returnRequest) returnNow.current?.() }, [returnRequest])

  return <div ref={layerRef} className="quote-flight" aria-hidden="true" data-phase="idle" data-mode={mode} data-held={held || undefined} />
}

function QuoteCycle({

  videoRef,

  reduced,

  children,

}: {
  videoRef: React.RefObject<HTMLVideoElement | null>

  reduced: boolean

  children: React.ReactNode

}) {
  const cycle = useRef<HTMLDivElement>(null)

  useEffect(() => {

    const video = videoRef.current

    const element = cycle.current

    if (!video || !element || reduced) {

      if (element) element.style.transform = ""

      return
    }

    const compact = window.matchMedia("(max-width: 600px)")

    let handle: number | null = null

    const applyPhase = () => {

      if (!video.duration || !Number.isFinite(video.duration)) return

      const phase = (video.currentTime / video.duration) * Math.PI * 2

      const x = Math.cos(phase) * (compact.matches ? 6 : 12)

      const y = Math.sin(phase) * (compact.matches ? 9 : 14)

      const tilt = Math.sin(phase - Math.PI / 3) * 0.32

      element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`

    }

    const supportsVideoFrames =

      typeof video.requestVideoFrameCallback === "function"

    const frame = () => {

      if (video.paused || video.ended) { handle = null; return }

      applyPhase()

      handle = supportsVideoFrames

        ? video.requestVideoFrameCallback(frame)

        : requestAnimationFrame(frame)

    }
    const start = () => {

      if (handle === null) frame()

    }
    const stop = () => {

      if (handle === null) return

      if (supportsVideoFrames) video.cancelVideoFrameCallback(handle)

      else cancelAnimationFrame(handle)

      handle = null

      applyPhase()

    }

    applyPhase()
    if (!video.paused) start()
    video.addEventListener("playing", start)
    video.addEventListener("pause", stop)
    video.addEventListener("waiting", stop)
    video.addEventListener("seeked", applyPhase)
    video.addEventListener("loadedmetadata", applyPhase)

    return () => {
      stop()
      video.removeEventListener("playing", start)
      video.removeEventListener("pause", stop)
      video.removeEventListener("waiting", stop)
      video.removeEventListener("seeked", applyPhase)
      video.removeEventListener("loadedmetadata", applyPhase)
    }
  }, [reduced, videoRef])

  return (
    <div ref={cycle} className="quote-cycle">
      {children}
    </div>
  )
}

// Public contact details. Replace wechatUrl and qrImage together if the WeChat QR is reset.
const CONTACT = {
  "email": "cyh20050527@gmail.com",
  "phone": "13705532400",
  "wechatUrl": "https://u.wechat.com/MJ5U3NR5UVi0fkAohdvY0rE",
  "qrImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUgAAAFIAQAAAAAab1qeAAACRklEQVR4nO1aS24sIQx0We/+V67IP+hkxfTigROsUYeZLil2yR9sAGVRdBUoF7kiuoQyucgV0SWUyUWuiC6h/jrynz0Qa9qCoP0Q6/lG2lik+/kUL0oPMgkBBeB4I20s0gP4FHdGEXBSCCHmG2ljkZ7AZwnMM21hXJqzTulikZ6EpJFJD3qP+v/733+Pf9KfHuzmovF5vJHdemorPlFfLYEaoVaZPNyni3axSLci8S1HmluGY8ZWiQ0t0v1IeD23PZI7JaPGexa9/vmCT9r+Pfh7Rnj+ILj7T/mwP0KRGmJrZ9h8FpEBulikByBJb43CNZNVi3/vO4lj9GyCZOzj6X9zR1+Firc/ko/jnVGBvC4FlUT6Jcptu1ikByARD5rEVslKfSCQDnqCnl2QtFwZjhiTJdJypyUA4UF6dkFi+GMM7DLEx2zpFD37IPlsjfxZ02XceiQf9pvIOXJKUFhzeslOvotFuhWJmB77CGQwOzr5yay0sUi3IjEmdWOMPKJ8ksvtemq/+SflB6ffJ3a6VU9td75JP4fzAyTnceRU3vM4/QzJJ30Z/Hm4OT30AD275E/kMCRrU21CK/Dl1iN5NZ+Hx3btQx9XG7hdT+14P4ROYmXPGo3g+qe+ux+Cx1B59Er0VLpbT+14P4QzZwav4aK89V1e3Q9BXWIIt6yyjxvv8opPViUKB81eVG7/ru/uh0jeZ8j5sq9Zb7tYpOfcD0GOlC3o4yAp90+yXU9teT/kN1ikF7kgugJyucgV0SWUyUWuSBfkFx3l9p7c3T1uAAAAAElFTkSuQmCC",
  "wechatLogo": "M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z",
  "gmailLogo": "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
} as const

function ContactDetails({ language }: { language: Language }) {
  const zh = language === "zh"
  const [wechatOpen, setWechatOpen] = useState(false)
  const [copied, setCopied] = useState<"email" | "phone" | null>(null)
  const [copyFailed, setCopyFailed] = useState(false)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (resetRef.current) clearTimeout(resetRef.current)
  }, [])

  async function copyContact(kind: "email" | "phone") {
    if (resetRef.current) clearTimeout(resetRef.current)
    setCopyFailed(false)
    try {
      await navigator.clipboard.writeText(CONTACT[kind])
      setCopied(kind)
      resetRef.current = setTimeout(() => setCopied(null), 3000)
    } catch {
      setCopied(null)
      setCopyFailed(true)
    }
  }

  return (
    <div className="contact-methods">
      <button
        type="button"
        className={`contact-method ${wechatOpen ? "is-open" : ""}`}
        onClick={() => setWechatOpen((open) => !open)}
        aria-expanded={wechatOpen}
        aria-controls="wechat-card"
      >
        <span className="contact-brand" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d={CONTACT.wechatLogo} /></svg>
        </span>
        <span className="contact-method-text">
          <span className="contact-method-name">{zh ? "微信" : "WeChat"}</span>
          <span className="contact-method-detail">{zh ? "扫码，开启一段对话" : "Scan to start a conversation"}</span>
        </span>
        <span className="contact-method-action" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d={wechatOpen ? "M5 12h14" : "M5 12h14M12 5v14"} />
          </svg>
        </span>
      </button>

      {wechatOpen && (
        <div className="wechat-card" id="wechat-card">
          <img className="wechat-qr" src={CONTACT.qrImage} width="180" height="180"
            alt={zh ? "微信个人名片二维码" : "WeChat personal contact QR code"} />
          <p className="wechat-caption">{zh ? "扫码查看最新微信资料并添加好友" : "Scan for my current profile and add me"}</p>
          <a className="wechat-profile-link" href={CONTACT.wechatUrl} target="_blank" rel="noopener noreferrer">
            {zh ? "打开微信名片" : "Open WeChat profile"} <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a className="wechat-save" href={CONTACT.qrImage} download="wechat-contact.png">
            {zh ? "保存二维码" : "Save QR code"}
          </a>
          <p className="wechat-help">{zh ? "手机上可保存二维码，在微信「扫一扫」中从相册打开。" : "On mobile, save the QR code, then select it from your album in WeChat Scan."}</p>
          <div className="wechat-phone">
            <span>{zh ? "或通过手机号添加" : "Or add by phone"}</span>
            <span className="contact-selectable">{CONTACT.phone}</span>
            <button type="button" onClick={() => void copyContact("phone")}>
              {copied === "phone" ? (zh ? "已复制" : "Copied") : (zh ? "复制号码" : "Copy number")}
            </button>
          </div>
        </div>
      )}

      <button type="button" className="contact-method contact-email" onClick={() => void copyContact("email")}
        aria-label={zh ? `复制邮箱 ${CONTACT.email}` : `Copy email ${CONTACT.email}`}>
        <span className="contact-brand" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d={CONTACT.gmailLogo} /></svg>
        </span>
        <span className="contact-method-text">
          <span className="contact-method-name">Gmail</span>
          <span className="contact-method-detail contact-selectable">{CONTACT.email}</span>
        </span>
        <span className="contact-method-action" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            {copied === "email" ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M15 8V4H4v11h4" /></>}
          </svg>
        </span>
        <span className="contact-copy-hint">{copied === "email" ? (zh ? "已复制" : "Copied") : (zh ? "点击复制" : "Click to copy")}</span>
      </button>
      <p className="contact-feedback" role="status" aria-live="polite">
        {copyFailed
          ? (zh ? "浏览器未允许复制，请选中邮箱或号码手动复制。" : "Clipboard access was denied. Select the email or phone number to copy manually.")
          : copied
            ? (zh ? `${copied === "email" ? "邮箱" : "手机号"}已复制` : `${copied === "email" ? "Email" : "Phone number"} copied`)
            : ""}
      </p>
    </div>
  )
}

const CLOCK_ZONES = [
  { id: "Asia/Shanghai", zh: "北京", en: "Beijing", code: "BJS" },
  { id: "America/New_York", zh: "纽约", en: "New York", code: "NYC" },
] as const

function getZonedClock(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, hourCycle: "h23",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    month: "2-digit", day: "2-digit", timeZoneName: "shortOffset",
  }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)!.value
  return {
    hour: value("hour"), minute: value("minute"), second: value("second"),
    month: value("month"), day: value("day"),
    offset: value("timeZoneName").replace("GMT", "UTC"),
  }
}

function IdleWidgets({ language, held, enabled, reduced, returnDuration = 9 }: {
  language: Language
  held: boolean
  enabled: boolean
  reduced: boolean
  returnDuration?: number
}) {
  type ClockPhase = "home" | "approach" | "burst" | "scattered" | "rejoin" | "retreat"
  type ShardPose = { x: number; y: number; scale: number; rotate: number; opacity: number; depth: number }
  type Timeline = { phase: ClockPhase; at: number; from: ShardPose[]; spin: number; windFrom: number }
  const [now, setNow] = useState(() => new Date())
  const [zoneIndex, setZoneIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<ClockPhase>("home")
  const [host, setHost] = useState<Element | null>(null)
  const [activeShard, setActiveShard] = useState<number | null>(null)
  const corner = useRef<HTMLButtonElement>(null)
  const cloud = useRef<HTMLDivElement>(null)
  const shardNodes = useRef<(HTMLButtonElement | null)[]>([])
  const shardLabel = useRef<HTMLSpanElement>(null)
  const visibleRef = useRef(false)
  const hover = useRef(false)
  const gather = useRef(0)
  const hoveredShard = useRef<number | null>(null)
  const hoveredPose = useRef<ShardPose | null>(null)
  const releasedPoses = useRef<Record<number, { from: ShardPose; at: number }>>({})
  const clockRef = useRef({ hours: 0, minutes: 0, seconds: 0 })
  const poses = useRef<ShardPose[]>([])
  const handWind = useRef(0)
  const pausedAt = useRef<number | null>(null)
  const pausedTotal = useRef(0)
  const timeline = useRef<Timeline>({ phase: "home", at: 0, from: [], spin: 0, windFrom: 0 })
  // Fourteen pieces, all cut from the very same SVG used by the corner clock.
  const shards = useRef(Array.from({ length: 14 }, (_, index) => {
    const angle = (index * 60 - 63) * Math.PI / 180
    const u = [.26, .65, .42, .79, .33, .71, .54, .19, .81, .44, .62, .27, .76, .50][index]
    const v = [.28, .24, .70, .61, .48, .78, .36, .67, .35, .19, .56, .80, .43, .86][index]
    return {
      index, u, v, angle,
      cx: index < 6 ? 44 + Math.cos(angle) * 33 : index === 7 ? 57 : 44,
      cy: index < 6 ? 44 + Math.sin(angle) * 33 : index === 7 ? 31 : index === 11 ? 4 : 44,
      width: index < 6 ? 48 : [64, 38, 52, 60, 72, 18, 88, 12][index - 6],
      depth: [-.55, .60, -.28, .78, -.40, .22, -.18, .46, .68, -.35, .32, -.46, .12, .48][index],
      twist: ((index * 71) % 160) - 80,
    }
  })).current

  const logicalNow = useCallback((stamp = performance.now()) => (pausedAt.current ?? stamp) - pausedTotal.current, [])
  const clearHover = useCallback(() => {
    hover.current = false
    hoveredShard.current = null
    hoveredPose.current = null
    releasedPoses.current = {}
    setActiveShard(null)
  }, [])
  const startPhase = useCallback((next: ClockPhase, at = logicalNow()) => {
    const rotations = poses.current.map((pose) => pose.rotate)
    const currentSpin = rotations[0] || 0
    const spin = next === "approach" ? Math.ceil(Math.max(0, ...rotations) / 360) * 360 + 1440 :
      next === "rejoin" ? Math.floor(Math.min(0, ...rotations) / 360) * 360 - 1080 :
      next === "retreat" ? Math.round(currentSpin / 360) * 360 - 1080 : timeline.current.spin
    timeline.current = { phase: next, at, from: poses.current.map((pose) => ({ ...pose })), spin, windFrom: handWind.current }
    if (next !== "scattered") clearHover()
    setPhase(next)
  }, [clearHover, logicalNow])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const zh = language === "zh"
  const zone = CLOCK_ZONES[zoneIndex]
  const nextZone = CLOCK_ZONES[1 - zoneIndex]
  const clock = getZonedClock(now, zone.id)
  const seconds = Number(clock.second)
  const minutes = Number(clock.minute) + seconds / 60
  const hours = Number(clock.hour) % 12 + minutes / 60
  clockRef.current = { hours, minutes, seconds }
  const time = `${clock.hour}:${clock.minute}:${clock.second}`
  const action = zh ? `切换至${nextZone.zh}时间` : `Switch to ${nextZone.en} time`
  const switchZone = () => setZoneIndex((current) => 1 - current)
  const releaseShardHover = (index: number) => {
    if (hoveredShard.current !== index) return
    const from = hoveredPose.current || poses.current[index]
    if (from) releasedPoses.current[index] = { from: { ...from }, at: logicalNow() }
    hover.current = false
    hoveredShard.current = null
    hoveredPose.current = null
    setActiveShard(null)
  }
  const beginShardHover = (index: number) => {
    if (timeline.current.phase !== "scattered") return
    const previous = hoveredShard.current
    if (previous !== null && previous !== index) releaseShardHover(previous)
    hover.current = true
    hoveredShard.current = index
    if (!hoveredPose.current && poses.current[index]) hoveredPose.current = { ...poses.current[index] }
    delete releasedPoses.current[index]
    setActiveShard(index)
  }

  useLayoutEffect(() => {
    const stamp = performance.now()
    // An overlay or the second screen suspends this clock; it does not restart it.
    if (!enabled) {
      if (pausedAt.current === null) pausedAt.current = stamp
      clearHover()
      return
    }
    if (pausedAt.current !== null) {
      pausedTotal.current += stamp - pausedAt.current
      pausedAt.current = null
    }
    if (reduced) {
      visibleRef.current = false
      setVisible(false)
      timeline.current = { phase: "home", at: logicalNow(stamp), from: [], spin: 0, windFrom: 0 }
      handWind.current = 0
      clearHover()
      setPhase("home")
      return
    }
    if (held) {
      if (visibleRef.current && !["rejoin", "retreat"].includes(timeline.current.phase)) return
      const parent = corner.current?.closest(".hero")
      const instrument = corner.current?.querySelector(".clock-instrument")
      if (!parent || !instrument) return
      const box = instrument.getBoundingClientRect()
      const frame = parent.getBoundingClientRect()
      setHost(parent)
      if (!visibleRef.current) {
        poses.current = shards.map((shard) => ({
          x: box.left - frame.left + box.width / 2 + (shard.cx - 44) * box.width / 88,
          y: box.top - frame.top + box.height / 2 + (shard.cy - 44) * box.width / 88,
          scale: box.width / 88, rotate: 0, opacity: 1, depth: 0,
        }))
      }
      visibleRef.current = true
      setVisible(true)
      startPhase("approach", logicalNow(stamp))
    } else if (visibleRef.current && !["rejoin", "retreat"].includes(timeline.current.phase)) {
      startPhase("rejoin", logicalNow(stamp))
    }
  }, [held, enabled, reduced, shards, startPhase, logicalNow, clearHover])

  useLayoutEffect(() => {
    if (!visible || !enabled || reduced || !host || !cloud.current) return
    let frameId = 0
    let last = logicalNow()
    let protectedAt = -Infinity
    let protectedBoxes: { left: number; right: number; top: number; bottom: number }[] = []
    const clamp = (n: number) => Math.max(0, Math.min(1, n))
    const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t) }
    const easeOut = (n: number) => 1 - (1 - clamp(n)) ** 3
    const mix = (a: number, b: number, t: number) => a + (b - a) * t
    const tau = Math.PI * 2
    const interpolate = (a: ShardPose, b: ShardPose, t: number): ShardPose => ({
      x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), scale: mix(a.scale, b.scale, t),
      rotate: mix(a.rotate, b.rotate, t), opacity: mix(a.opacity, b.opacity, t), depth: mix(a.depth, b.depth, t),
    })
    const rejoinSeconds = returnDuration * .74
    const retreatSeconds = returnDuration - rejoinSeconds
    const draw = (rawStamp: number) => {
      if (!visibleRef.current || pausedAt.current !== null) return
      const stamp = logicalNow(rawStamp)
      const dt = Math.min(.05, Math.max(0, (stamp - last) / 1000))
      last = stamp
      const width = host.clientWidth
      const height = host.clientHeight
      const cx = width * .5, cy = height * .48
      const dialScale = Math.min(3.4, width / 290, height / 220)
      const rect = corner.current?.querySelector(".clock-instrument")?.getBoundingClientRect()
      const parentRect = host.getBoundingClientRect()
      if (stamp - protectedAt > 250) {
        protectedAt = stamp
        protectedBoxes = Array.from(host.querySelectorAll<HTMLElement>(".ui button, .ui a"))
          .filter((node) => node !== corner.current && !node.closest("[inert]") && node.getClientRects().length > 0)
          .map((node) => {
            const box = node.getBoundingClientRect()
            return { left: box.left - parentRect.left - 9, right: box.right - parentRect.left + 9,
              top: box.top - parentRect.top - 9, bottom: box.bottom - parentRect.top + 9 }
          })
      }
      const homeX = rect ? rect.left - parentRect.left + rect.width / 2 : width * .8
      const homeY = rect ? rect.top - parentRect.top + rect.height / 2 : height * .25
      const homeScale = rect ? rect.width / 88 : .9
      const current = timeline.current
      const stage = current.phase
      const elapsed = (stamp - current.at) / 1000
      gather.current += ((hover.current ? 1 : 0) - gather.current) * (1 - Math.exp(-dt * 5))
      const assembly = (index: number, x: number, y: number, scale: number, rotate = 0): ShardPose => {
        const shard = shards[index]
        const a = rotate * Math.PI / 180
        const dx = (shard.cx - 44) * scale, dy = (shard.cy - 44) * scale
        return { x: x + dx * Math.cos(a) - dy * Math.sin(a), y: y + dx * Math.sin(a) + dy * Math.cos(a),
          scale, rotate, opacity: 1, depth: 0 }
      }
      // The six outer sectors have a symmetric centroid, so this remains correct mid-return.
      const sourceSectors = current.from.slice(0, 6)
      const sourceX = sourceSectors.reduce((sum, pose) => sum + pose.x, 0) / 6 || homeX
      const sourceY = sourceSectors.reduce((sum, pose) => sum + pose.y, 0) / 6 || homeY
      const sourceScale = sourceSectors.reduce((sum, pose) => sum + pose.scale, 0) / 6 || homeScale
      const sourceRotate = current.from[0]?.rotate || 0
      let wind = 0
      if (stage === "approach") wind = mix(current.windFrom, Math.ceil(current.windFrom / 3600) * 3600 + 3600, clamp(elapsed / 2.05) ** 3)
      else if (stage === "burst") wind = mix(current.windFrom, Math.ceil(current.windFrom / 3600) * 3600 + 3600, easeOut(elapsed / 1.55))
      else if (stage === "rejoin") wind = mix(current.windFrom, Math.floor(current.windFrom / 3600) * 3600 - 7200, smooth(elapsed / rejoinSeconds))
      else if (stage === "retreat") wind = mix(current.windFrom, Math.floor(current.windFrom / 3600) * 3600 - 3600, smooth(elapsed / retreatSeconds))
      handWind.current = wind

      const nextPoses = shards.map((shard, index) => {
        const from = current.from[index] || assembly(index, homeX, homeY, homeScale)
        if (stage === "approach" || stage === "retreat") {
          const returning = stage === "retreat"
          const t = clamp(elapsed / (returning ? retreatSeconds : 2.05))
          const travel = smooth(t)
          const turn = returning ? easeOut(t) : t * t * t
          const centerX = mix(sourceX, returning ? homeX : cx, travel)
          const centerY = mix(sourceY, returning ? homeY : cy, travel) - Math.sin(Math.PI * travel) * Math.min(75, height * .09)
          const scale = mix(sourceScale, returning ? homeScale : dialScale, travel)
          const rotation = mix(sourceRotate, current.spin, turn)
          const pose = assembly(index, centerX, centerY, scale, rotation)
          const original = assembly(index, sourceX, sourceY, sourceScale, sourceRotate)
          pose.x += (from.x - original.x) * (1 - travel)
          pose.y += (from.y - original.y) * (1 - travel)
          pose.rotate += (from.rotate - sourceRotate) * (1 - travel)
          pose.opacity = mix(from.opacity, 1, travel)
          // A short, shared mechanical tremor; the silhouette never changes.
          const tremor = returning ? 0 : Math.sin(Math.PI * t) * t * t * 1.65
          pose.x += Math.sin(t * 151) * tremor
          pose.y += Math.cos(t * 127) * tremor
          return pose
        }

        const spread = 1 - (hoveredShard.current === index ? 0 : gather.current * .085)
        const driftTime = stamp / 1000
        const depthScale = 1 / (1 - shard.depth * .4)
        const final: ShardPose = {
          x: cx + (shard.u * width - cx) * spread + Math.sin(driftTime * (.24 + index * .005) + index) * (8 + 6 * shard.depth),
          y: cy + (shard.v * height - cy) * spread + Math.cos(driftTime * (.19 + index * .004) + index * 1.7) * 10,
          scale: dialScale * .48 * depthScale * (1 - gather.current * .025),
          rotate: current.spin + 360 + shard.twist + Math.sin(driftTime * .15 + index) * 5,
          opacity: .52 + (shard.depth + 1) * .20,
          depth: shard.depth * (1 - gather.current * .10),
        }
        if (stage === "burst") {
          const t = easeOut((elapsed - index * .018) / 1.25)
          const pose = interpolate(from, final, t)
          const armX = from.x - cx, armY = from.y - cy
          // A tangential release carries the spinning dial into its scattered arrangement.
          pose.x += -armY * Math.sin(t * Math.PI) * .62
          pose.y += armX * Math.sin(t * Math.PI) * .62
          return pose
        }
        if (stage === "scattered") {
          if (hoveredShard.current === index) {
            if (!hoveredPose.current) hoveredPose.current = { ...(poses.current[index] || final) }
            return hoveredPose.current
          }
          const released = releasedPoses.current[index]
          if (released) {
            const t = smooth((stamp - released.at) / 650)
            if (t < 1) return interpolate(released.from, final, t)
            delete releasedPoses.current[index]
          }
          return final
        }
        if (stage === "rejoin") {
          const delay = index * .024
          const t = smooth((elapsed - delay) / (rejoinSeconds - delay))
          const target = assembly(index, cx, cy, dialScale * .78, current.spin)
          const dx = from.x - cx, dy = from.y - cy
          const startAngle = Math.atan2(dy, dx)
          const endAngle = Math.atan2(target.y - cy, target.x - cx)
          const ccwDelta = -(((startAngle - endAngle) % tau + tau) % tau) - tau
          const angle = startAngle + ccwDelta * t
          const radius = mix(Math.hypot(dx, dy), Math.hypot(target.x - cx, target.y - cy), t)
          return {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            scale: mix(from.scale, target.scale, t), rotate: mix(from.rotate, current.spin, t),
            opacity: mix(from.opacity, 1, t), depth: mix(from.depth, 0, t),
          }
        }
        return assembly(index, homeX, homeY, homeScale)
      })
      poses.current = nextPoses
      nextPoses.forEach((pose, index) => {
        const node = shardNodes.current[index]
        if (!node) return
        // Resize the SVG viewport itself; a composited bitmap is never scaled up.
        const pixels = shards[index].width * pose.scale
        node.style.width = `${Math.max(30, pixels)}px`
        node.style.height = `${Math.max(30, pixels)}px`
        const svg = node.firstElementChild as SVGSVGElement | null
        if (svg) { svg.style.width = `${pixels}px`; svg.style.height = `${pixels}px` }
        node.style.transform = `translate(${pose.x}px,${pose.y}px) translate(-50%,-50%) rotate(${pose.rotate}deg)`
        const hitRadius = Math.max(15, pixels * .5) + 8
        const coversControl = protectedBoxes.some((box) => pose.x + hitRadius > box.left && pose.x - hitRadius < box.right &&
          pose.y + hitRadius > box.top && pose.y - hitRadius < box.bottom)
        node.style.opacity = String(pose.opacity * (coversControl ? .3 : 1))
        node.style.setProperty("--clock-shard-color", `color-mix(in srgb, var(--ivory) ${Math.max(0, pose.depth) * 70}%, var(--gold))`)
        node.style.zIndex = coversControl || pose.depth < -.12 ? "8" : "11"
        const interactive = stage === "scattered" && !coversControl
        node.style.pointerEvents = interactive ? "auto" : "none"
        node.tabIndex = interactive ? 0 : -1
        const rotor = node.querySelector<SVGGElement>(".clock-shared-rotor")
        if (rotor) {
          const hand = index - 8
          const angles = [clockRef.current.hours * 30, clockRef.current.minutes * 6, clockRef.current.seconds * 6]
          rotor.setAttribute("transform", `rotate(${angles[hand] + wind * [1, 3, 8][hand]} 44 44)`)
        }
      })
      if (shardLabel.current && hoveredShard.current !== null) {
        const pose = nextPoses[hoveredShard.current]
        const x = Math.max(90, Math.min(width - 90, pose.x))
        const y = Math.max(70, pose.y - shards[hoveredShard.current].width * pose.scale * .42 - 16)
        shardLabel.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`
      }
      if (stage === "approach" && elapsed >= 2.05) startPhase("burst", stamp)
      else if (stage === "burst" && elapsed >= 1.55) startPhase("scattered", stamp)
      else if (stage === "rejoin" && elapsed >= rejoinSeconds) startPhase("retreat", stamp)
      else if (stage === "retreat" && elapsed >= retreatSeconds) {
        visibleRef.current = false
        setVisible(false)
        setPhase("home")
        timeline.current.phase = "home"
        handWind.current = 0
        return
      }
      frameId = requestAnimationFrame(draw)
    }
    // Paint before React releases the first frame, so no piece flashes at (0,0).
    draw(performance.now())
    const leave = () => {
      const index = hoveredShard.current
      if (index !== null) {
        const from = hoveredPose.current || poses.current[index]
        if (from) releasedPoses.current[index] = { from: { ...from }, at: logicalNow() }
      }
      hover.current = false
      hoveredShard.current = null
      hoveredPose.current = null
      setActiveShard(null)
    }
    window.addEventListener("blur", leave)
    return () => { cancelAnimationFrame(frameId); window.removeEventListener("blur", leave) }
  }, [visible, enabled, reduced, host, shards, startPhase, logicalNow, returnDuration])

  const fragmentArt = (index: number) => {
    if (index < 6) return <g transform={`rotate(${index * 60} 44 44)`}>
      <path className="clock-shared-rim" transform="rotate(-90 44 44)" d="M83.945 46.093A40 40 0 0 1 65.786 77.547" />
      {Array.from({ length: 10 }, (_, tick) => <line key={tick} className={tick % 5 === 0 ? "clock-shared-major" : "clock-shared-minor"}
        x1="44" y1="7" x2="44" y2={tick % 5 === 0 ? 13 : 9} transform={`rotate(${tick * 6} 44 44)`} />)}
    </g>
    if (index === 6) return <g className="clock-shared-celestial">
      <ellipse cx="44" cy="44" rx="27" ry="15" transform="rotate(-32 44 44)" />
      <circle cx="44" cy="44" r="27" /><path d="M44 14v5M74 44h-5M44 74v-5M14 44h5" />
    </g>
    if (index === 7) return <g className="clock-shared-orbit"><path d="M44 17a27 27 0 0 1 27 27" />
      <circle className="clock-shared-jewel" cx="44" cy="17" r="1.6" /></g>
    if (index < 11) return <g className={`clock-shared-rotor clock-shared-hand-${index - 8}`}
      transform={`rotate(${[hours * 30, minutes * 6, seconds * 6][index - 8]} 44 44)`}>
      {index === 8 ? <path d="M44 23l2.5 18-2.5 6-2.5-6z" /> : index === 9 ?
        <path d="M44 17l1.4 26-1.4 7-1.4-7z" /> : <g><line x1="44" y1="52" x2="44" y2="11" /><circle cx="44" cy="29" r="1.6" /></g>}
    </g>
    if (index === 11) return <g><path className="clock-shared-bracket" d="M39 1h10" />
      <path className="clock-shared-cardinal" d="M44 3l2 2-2 2-2-2z" /></g>
    if (index === 12) return <g>{[1, 2, 3].map((part) => <path key={part} className="clock-shared-bracket"
      d="M39 1h10" transform={`rotate(${part * 90} 44 44)`} />)}</g>
    return <circle className="clock-shared-pin" cx="44" cy="44" r="2.5" />
  }

  return <>
    <button ref={corner} type="button" className="idle-widget astrolabe"
      data-zone={zone.code} data-space-state={phase}
      style={{ opacity: visible || !enabled ? 0 : undefined, pointerEvents: visible || !enabled ? "none" : undefined }}
      tabIndex={visible || !enabled ? -1 : undefined} aria-hidden={visible || !enabled || undefined}
      onClick={switchZone} aria-label={`${zh ? zone.zh : zone.en} ${time} · ${action}`}>
      <span className="clock-instrument" aria-hidden="true">
        <svg viewBox="0 0 88 88"><g className="clock-dial-system clock-shared-dial">
          {shards.map((shard) => <g key={shard.index}>{fragmentArt(shard.index)}</g>)}
        </g></svg>
      </span>
      <span className="widget-copy clock-copy" key={zone.id} aria-hidden="true">
        <span className="clock-zone"><span>{zh ? zone.zh : zone.en}</span><small>{clock.offset}</small></span>
        <b className="clock-time">{clock.hour}<span className="clock-colon">:</span>{clock.minute}<span className="clock-seconds">{clock.second}</span></b>
        <span className="clock-route"><span>{clock.month}·{clock.day}</span><span className="clock-destination">{nextZone.code}<i>↗</i></span></span>
      </span>
    </button>
    {visible && host && createPortal(
      <div ref={cloud} className="clock-space" data-state={phase} data-zone={zone.code}
        style={{ visibility: enabled ? "visible" : "hidden" }} aria-hidden={!enabled || undefined}
        aria-label={zh ? "散落的时间" : "Time fragments"}>
        {shards.map((shard, index) => <button key={index} type="button" ref={(node) => { shardNodes.current[index] = node }}
          className="clock-space-shard" tabIndex={-1}
          onPointerEnter={() => beginShardHover(index)} onPointerLeave={() => releaseShardHover(index)}
          onFocus={() => beginShardHover(index)} onBlur={() => releaseShardHover(index)}
          onClick={switchZone} aria-label={`${zh ? zone.zh : zone.en} ${time} · ${action}`}>
          <svg viewBox={`${shard.cx - shard.width / 2} ${shard.cy - shard.width / 2} ${shard.width} ${shard.width}`} aria-hidden="true">
            {fragmentArt(index)}
          </svg>
        </button>)}
        <span ref={shardLabel} className="clock-space-label" data-visible={activeShard !== null && phase === "scattered" && enabled}
          aria-hidden="true"><b>{time}</b><span>{zh ? zone.zh : zone.en}<i> · </i>{nextZone.code} ↗</span></span>
      </div>, host
    )}
  </>
}

// Insert before App; uses the existing React useEffect/useRef imports.
function StarGearCursor({ cinema = false }: { cinema?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const needleRef = useRef<HTMLSpanElement>(null)
  const haloRef = useRef<HTMLSpanElement>(null)
  const rippleRef = useRef<HTMLSpanElement>(null)
  const cinemaRef = useRef(cinema)
  cinemaRef.current = cinema

  useEffect(() => {
    const root = rootRef.current
    const needle = needleRef.current
    const halo = haloRef.current
    if (!root || !needle || !halo) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const nativeSelector = "input, textarea, select, iframe, [contenteditable]:not([contenteditable='false']), [data-cursor='native']"
    const controlSelector = "button:not(:disabled), a[href], [role='button']:not([aria-disabled='true']), [data-cursor='link']"
    const clockSelector = ".astrolabe, .clock-space-shard"
    const quoteSelector = ".quote-trigger:not(:disabled), .quote-flight-glyph"
    const html = document.documentElement
    let active = false
    let frame = 0
    let lastFrame = 0
    let lastMove = 0
    let x = 0
    let y = 0
    let hx = 0
    let hy = 0
    let vx = 0
    let vy = 0
    let rotation = 0
    let pulse: Animation | null = null

    const hide = () => {
      active = false
      root.dataset.visible = "false"
      root.dataset.pressed = "false"
      root.dataset.idle = "false"
      html.classList.remove("custom-cursor-active")
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      lastFrame = 0
      pulse?.cancel()
    }

    const classify = (element: Element | null) => {
      if (!element || element.closest(nativeSelector)) return false
      let state = "default"
      if (element.closest(clockSelector)) state = "clock"
      else if (element.closest(quoteSelector)) state = "quote"
      else if (element.closest(controlSelector)) state = "link"
      else if (element.closest("p, h1, h2, h3, h4, blockquote, [data-cursor='text']")) state = "text"
      if (root.dataset.state !== state) root.dataset.state = state
      return true
    }

    const draw = (now: number) => {
      frame = 0
      if (!active) return
      const dt = Math.min(lastFrame ? (now - lastFrame) / 1000 : 1 / 60, .05)
      lastFrame = now
      const amount = reduced.matches ? 1 : 1 - Math.exp(-dt * 24)
      hx += (x - hx) * amount
      hy += (y - hy) * amount
      vx *= Math.exp(-dt * 11)
      vy *= Math.exp(-dt * 11)
      const speed = Math.min(1, Math.hypot(vx, vy) / 950)
      const isIdle = now - lastMove > 1600
      root.dataset.idle = isIdle ? "true" : "false"
      // The small 8-tooth wheel is driven by the 16-tooth main wheel.
      if (!reduced.matches) rotation = (rotation + dt * (isIdle ? 6 : 12 + speed * 85)) % 360
      halo.style.transform = `translate3d(${hx}px, ${hy}px, 0)`
      root.style.setProperty("--sg-rotation", `${rotation}deg`)
      root.style.setProperty("--sg-counter-rotation", `${-rotation * 2}deg`)
      root.style.setProperty("--sg-lean", `${reduced.matches ? 0 : Math.max(-8, Math.min(8, vx / 110))}deg`)
      root.style.setProperty("--sg-stretch", `${reduced.matches ? 1 : 1 + speed * .055}`)
      // In cinema the ornament is collapsed immediately; the pinpoint fades later.
      root.dataset.cinema = cinemaRef.current ? "true" : "false"
      if (!(isIdle && cinemaRef.current)) frame = requestAnimationFrame(draw)
    }

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !fine.matches || document.hidden ||
        !classify(event.target instanceof Element ? event.target : null)) {
        hide()
        return
      }
      const now = performance.now()
      const elapsed = Math.max((now - lastMove) / 1000, .008)
      vx = (event.clientX - x) / elapsed
      vy = (event.clientY - y) / elapsed
      x = event.clientX
      y = event.clientY
      lastMove = now
      // Direct update keeps the visual hotspot exact, independent of halo inertia.
      needle.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (!active) {
        hx = x
        hy = y
        vx = 0
        vy = 0
        halo.style.transform = `translate3d(${x}px, ${y}px, 0)`
        active = true
        html.classList.add("custom-cursor-active")
      }
      root.dataset.cinema = cinemaRef.current ? "true" : "false"
      root.dataset.visible = "true"
      root.dataset.idle = "false"
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const down = (event: PointerEvent) => {
      if (!active || event.pointerType !== "mouse" || event.button !== 0) return
      root.dataset.pressed = "true"
      pulse?.cancel()
    }
    const up = (event: PointerEvent) => {
      if (event.button !== 0 || !active || root.dataset.pressed !== "true") return
      root.dataset.pressed = "false"
      const ripple = rippleRef.current
      if (!reduced.matches && !cinemaRef.current && ripple) {
        pulse = ripple.animate([
          { transform: "scale(.55)", opacity: .65 },
          { transform: "scale(1.45)", opacity: .2, offset: .45 },
          { transform: "scale(1.9)", opacity: 0 },
        ], { duration: 440, easing: "cubic-bezier(.16,1,.3,1)" })
      }
    }
    const out = (event: PointerEvent) => {
      const next = event.relatedTarget
      if (!next || (next instanceof Element && next.closest(nativeSelector))) hide()
    }
    const refreshTarget = () => {
      if (active && !classify(document.elementFromPoint(x, y))) hide()
    }
    const visibility = () => { if (document.hidden) hide() }
    const capability = () => { if (!fine.matches) hide() }
    const keyboard = () => hide()
    document.addEventListener("pointermove", move, { passive: true })
    document.addEventListener("pointerdown", down, { passive: true })
    document.addEventListener("pointerup", up, { passive: true })
    document.addEventListener("pointercancel", hide, { passive: true })
    document.addEventListener("pointerout", out, { passive: true })
    document.addEventListener("visibilitychange", visibility)
    document.addEventListener("scroll", refreshTarget, { passive: true, capture: true })
    document.addEventListener("keydown", keyboard)
    window.addEventListener("blur", hide)
    fine.addEventListener("change", capability)
    return () => {
      hide()
      document.removeEventListener("pointermove", move)
      document.removeEventListener("pointerdown", down)
      document.removeEventListener("pointerup", up)
      document.removeEventListener("pointercancel", hide)
      document.removeEventListener("pointerout", out)
      document.removeEventListener("visibilitychange", visibility)
      document.removeEventListener("scroll", refreshTarget, true)
      document.removeEventListener("keydown", keyboard)
      window.removeEventListener("blur", hide)
      fine.removeEventListener("change", capability)
    }
  }, [])

  return (
    <div ref={rootRef} className="star-gear-cursor" aria-hidden="true"
      data-state="default" data-visible="false" data-pressed="false"
      data-idle="false" data-cinema={cinema ? "true" : "false"}>
      <span ref={haloRef} className="sgc-halo">
        <span className="sgc-assembly">
          <svg className="sgc-mechanism" width="64" height="64" viewBox="-32 -32 64 64" fill="none">
            <g className="sgc-main-wheel">
              <circle r="12.5" />
              <circle className="sgc-inner-rim" r="9.5" />
              {Array.from({ length: 16 }, (_, index) => (
                <path key={index} d="M-1.35 -12.8 L-1.1 -15.1 L1.1 -15.1 L1.35 -12.8"
                  transform={`rotate(${index * 22.5})`} />
              ))}
              <path className="sgc-spokes" d="M0 -9.5V-6 M9.5 0H6 M0 9.5V6 M-9.5 0H-6" />
            </g>
            <g className="sgc-satellite-position">
              <g className="sgc-satellite-wheel">
                <circle r="4.7" />
                {Array.from({ length: 8 }, (_, index) => (
                  <path key={index} d="M-.8 -4.8 L-.7 -6.3 L.7 -6.3 L.8 -4.8"
                    transform={`rotate(${index * 45})`} />
                ))}
                <path d="M-1.5 0H1.5 M0 -1.5V1.5" />
              </g>
            </g>
            <g className="sgc-open-arcs">
              <path d="M-19 -7 A20 20 0 0 1-6 -19 M19 7 A20 20 0 0 1 6 19" />
              <path className="sgc-arc-ends" d="M-20 -7h3 M-6 -20v3 M20 7h-3 M6 20v-3" />
            </g>
          </svg>
          <span ref={rippleRef} className="sgc-ripple" />
        </span>
      </span>
      <span ref={needleRef} className="sgc-needle">
        <svg className="sgc-star" width="20" height="24" viewBox="-10 -12 20 24" fill="none">
          <path className="sgc-star-face" d="M0 -9 1.8 -1.8 6.5 0 1.8 1.8 0 8.5 -1.8 1.8 -6.5 0 -1.8 -1.8Z" />
          <path className="sgc-star-facet" d="M0 -9V8.5 M-6.5 0H6.5" />
          <circle className="sgc-hotspot" r="1.15" />
        </svg>
        <span className="sgc-caret" />
      </span>
    </div>
  )
}

const aboutSoftware = [
  {
    id: "blender",
    label: "Blender",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626" />
      </svg>
    ),
  },
  {
    id: "unreal",
    label: "Unreal Engine",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M12 0a12 12 0 1012 12A12 12 0 0012 0zm0 23.52A11.52 11.52 0 1123.52 12 11.52 11.52 0 0112 23.52zm7.13-9.791c-.206.997-1.126 3.557-4.06 4.942l-1.179-1.325-1.988 2a7.338 7.338 0 01-5.804-2.978 2.859 2.859 0 00.65.123c.326.006.678-.114.678-.66v-5.394a.89.89 0 00-1.116-.89c-.92.212-1.656 2.509-1.656 2.509a7.304 7.304 0 012.528-5.597 7.408 7.408 0 013.73-1.721c-1.006.573-1.57 1.507-1.57 2.29 0 1.262.76 1.109.984.923v7.28a1.157 1.157 0 00.148.256 1.075 1.075 0 00.88.445c.76 0 1.747-.868 1.747-.868V9.172c0-.6-.452-1.324-.905-1.572 0 0 .838-.149 1.484.346a5.537 5.537 0 01.387-.425c1.508-1.48 2.929-1.902 4.112-2.112 0 0-2.151 1.69-2.151 3.96 0 1.687.043 5.801.043 5.801.799.771 1.986-.342 3.059-1.441Z" />
      </svg>
    ),
  },
  {
    id: "nuke",
    label: "Nuke",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M12.293.004c6.625.162 11.865 5.664 11.703 12.29-.162 6.625-5.664 11.865-12.29 11.703C5.081 23.835-.159 18.333.003 11.707l.001-.025C.18 5.066 5.678-.158 12.293.004zm0 1.238c-5.941-.164-10.89 4.52-11.054 10.461s4.52 10.89 10.461 11.054c5.941.164 10.89-4.52 11.054-10.461l.001-.025c.15-5.932-4.53-10.866-10.462-11.029zm5.842 8.302h2.4c.976 0 .682-.873.682-.873a9.587 9.587 0 0 0-2.111-3.431l-.005.011a10.052 10.052 0 0 0-3.355-2.329.612.612 0 0 0-.894.622c-.044.802-.142 2.395-.142 2.395s.016.769-.627.769c-.813.011-1.489-.044-1.489-.044a2.314 2.314 0 0 1-1.255-.545L8.868 3.511a1.09 1.09 0 0 0-1.407-.196 9.758 9.758 0 0 0-4.713 5.384c-.256.714.333.806.731.806h6a2.086 2.086 0 0 1 1.68.627c.785.824 1.331 1.369 1.331 1.369s.48.54 1.26 1.358c.431.459.632 1.089.545 1.713 0 0-.295 5.744-.295 6-.027.398.038.993.769.775a9.756 9.756 0 0 0 5.618-4.424 1.091 1.091 0 0 0-.12-1.418l-2.471-2.607a2.303 2.303 0 0 1-.496-1.282s-.022-.682.033-1.489c.044-.643.802-.583.802-.583zm-2.362 1.374c-.475.469-1.484.229-2.22-.545-.736-.775-.924-1.801-.45-2.254.475-.453 1.502-.239 2.239.536.737.774.906 1.794.431 2.263z" />
      </svg>
    ),
  },
  {
    id: "midjourney",
    label: "Midjourney",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" focusable="false">
        <path d="M22.369 17.676c-1.387 1.259-3.17 2.378-5.332 3.417.044.03.086.057.13.083l.018.01.019.012c.216.123.42.184.641.184.222 0 .426-.061.642-.184l.018-.011.019-.011c.14-.084.266-.178.492-.366l.178-.148c.279-.232.426-.342.625-.456.304-.174.612-.266.949-.266.337 0 .645.092.949.266l.023.014c.188.109.334.219.602.442l.178.148c.221.184.346.278.483.36l.028.017.018.01c.21.12.407.181.62.185h.022a.31.31 0 110 .618c-.337 0-.645-.092-.95-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.02-.014a5.356 5.356 0 01-.49-.377l-.159-.132a3.836 3.836 0 00-.483-.36l-.027-.017-.019-.01a1.256 1.256 0 00-.641-.185c-.222 0-.426.061-.641.184l-.02.011-.018.011c-.14.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.51.39l-.022.014-.022.014-.09.054a1.868 1.868 0 01-.95.266c-.337 0-.644-.092-.949-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.026-.017a4.881 4.881 0 01-.425-.325.308.308 0 01-.12-.1l-.098-.081a3.836 3.836 0 00-.483-.36l-.027-.017-.019-.01a1.256 1.256 0 00-.641-.185c-.222 0-.426.061-.642.184l-.018.011-.019.011c-.14.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.51.39l-.023.014-.022.014-.09.054A1.868 1.868 0 0112 22c-.337 0-.645-.092-.949-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.021-.014a5.356 5.356 0 01-.49-.377l-.158-.132a3.836 3.836 0 00-.483-.36l-.028-.017-.018-.01a1.256 1.256 0 00-.642-.185c-.221 0-.425.061-.641.184l-.019.011-.018.011c-.141.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.511.39l-.022.014-.022.014-.09.054a1.868 1.868 0 01-.986.264c-.746-.09-1.319-.38-1.89-.866l-.035-.03c-.047-.041-.118-.106-.192-.174l-.196-.181-.107-.1-.011-.01a1.531 1.531 0 00-.336-.253.313.313 0 00-.095-.03h-.005c-.119.022-.238.059-.361.11a.308.308 0 01-.077.061l-.008.005a.309.309 0 01-.126.034 5.66 5.66 0 00-.774.518l-.416.324-.055.043a6.542 6.542 0 01-.324.236c-.305.207-.552.315-.8.315a.31.31 0 01-.01-.618h.01c.09 0 .235-.062.438-.198l.04-.027c.077-.054.163-.117.27-.199l.385-.301.06-.047c.268-.206.506-.373.73-.505l-.633-1.21a.309.309 0 01.254-.451l20.287-1.305a.309.309 0 01.228.537zm-1.118.14L2.369 19.03l.423.809c.128-.045.256-.078.388-.1a.31.31 0 01.052-.005c.132 0 .26.032.386.093.153.073.294.179.483.35l.016.015.092.086.144.134.097.089c.065.06.125.114.16.144.485.418.948.658 1.554.736h.011a1.25 1.25 0 00.6-.172l.021-.011.019-.011.018-.011c.141-.084.266-.178.492-.366l.178-.148c.279-.232.426-.342.625-.456.305-.174.612-.266.95-.266.336 0 .644.092.948.266l.023.014c.188.109.335.219.603.442l.177.148c.222.184.346.278.484.36l.027.017.019.01c.215.124.42.185.641.185.222 0 .426-.061.641-.184l.019-.011.018-.011c.141-.084.267-.178.493-.366l.177-.148c.28-.232.427-.342.626-.456.304-.174.612-.266.949-.266.337 0 .644.092.949.266l.025.015c.187.109.334.22.603.443 1.867-.878 3.448-1.811 4.73-2.832l.02-.016zM3.653 2.026C6.073 3.06 8.69 4.941 10.8 7.258c2.46 2.7 4.109 5.828 4.637 9.149a.31.31 0 01-.421.335c-2.348-.945-4.54-1.258-6.59-1.02-1.739.2-3.337.792-4.816 1.703-.294.182-.62-.182-.405-.454 1.856-2.355 2.581-4.99 2.343-7.794-.195-2.292-1.031-4.61-2.284-6.709a.31.31 0 01.388-.442zM10.04 4.45c1.778.543 3.892 2.102 5.782 4.243 1.984 2.248 3.552 4.934 4.347 7.582a.31.31 0 01-.401.38l-.022-.01-.386-.154a10.594 10.594 0 00-.291-.112l-.016-.006c-.68-.247-1.199-.291-1.944-.101a.31.31 0 01-.375-.218C15.378 11.123 13.073 7.276 9.775 5c-.291-.201-.072-.653.266-.55zM4.273 2.996l.008.015c1.028 1.94 1.708 4.031 1.885 6.113.213 2.513-.31 4.906-1.673 7.092l-.02.031.003-.001c1.198-.581 2.47-.969 3.825-1.132l.055-.006c1.981-.23 4.083.029 6.309.837l.066.025-.007-.039c-.593-2.95-2.108-5.737-4.31-8.179l-.07-.078c-1.785-1.96-3.944-3.6-6.014-4.65l-.057-.028zm7.92 3.238l.048.048c2.237 2.295 3.885 5.431 4.974 9.191l.038.132.022-.004c.71-.133 1.284-.063 1.963.18l.027.01.066.024.046.018-.025-.073c-.811-2.307-2.208-4.62-3.936-6.594l-.058-.065c-1.02-1.155-2.103-2.132-3.15-2.856l-.015-.011z" />
      </svg>
    ),
  },
  {
    id: "stable-diffusion",
    label: "Stable Diffusion",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" focusable="false">
        <path d="M7.223 21c4.252 0 7.018-2.22 7.018-5.56 0-2.59-1.682-4.236-4.69-4.918l-1.93-.571c-1.694-.375-2.683-.825-2.45-1.975.194-.957.773-1.497 2.122-1.497 4.285 0 5.873 1.497 5.873 1.497v-3.6S11.62 3 7.293 3C3.213 3 1 5.07 1 8.273c0 2.59 1.534 4.097 4.645 4.812l.334.083c.473.144 1.112.335 1.916.572 1.59.375 1.999.773 1.999 1.966 0 1.09-1.15 1.71-2.67 1.71C2.841 17.416 1 15.231 1 15.231v3.989S2.152 21 7.223 21z" /><path d="M20.374 20.73c1.505 0 2.626-1.073 2.626-2.526 0-1.484-1.089-2.526-2.626-2.526-1.505 0-2.594 1.042-2.594 2.526 0 1.484 1.089 2.526 2.594 2.526z" />
      </svg>
    ),
  },
  {
    id: "painter",
    label: "Substance Painter",
    icon: (
      <svg viewBox="0 0 234 234" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M192.03,0H41.97C18.79,0,0,18.79,0,41.97v150.06c0,23.18,18.79,41.97,41.97,41.97h150.06c23.18,0,41.97-18.79,41.97-41.97V41.97c0-23.18-18.79-41.97-41.97-41.97ZM88.27,139.71h-14.81v30.27h-29.94V62.11h42.18-.01c30.59,0,47.82,14.33,47.82,38.32,0,28.01-23.34,39.28-45.24,39.28ZM178.89,171.6c-18.35,0-29.14-8.69-29.14-29.3v-33.17h-12.07v-22.38h12.07v-21.09h28.17v21.09h15.47v22.38h-15.46v28.66c0,7.73,3.22,10.63,8.69,10.63,1.77,0,4.35-.32,6.76-1.13l.16,22.22c-3.54,1.29-7.41,2.09-14.65,2.09ZM102.28,101.07c0,9.34-6.44,13.04-15.62,13.04h-13.2v-26.4h13.85c9.5,0,14.97,4.83,14.97,13.36Z" />

      </svg>
    ),
  },
  {
    id: "cascadeur",
    label: "Cascadeur",
    icon: (
      <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M47.8816 3.8211C47.6878 2.81979 47.3325 2.39988 47.1387 2.17378C46.7511 1.78618 46.3635 1.62468 46.1374 1.56008C45.8467 1.43088 45.4268 1.33398 44.6839 1.33398C44.4255 1.33398 43.4565 1.36628 41.9384 1.78619C41.357 1.94769 40.9048 2.10919 40.5172 2.27069C40.4203 2.30299 40.2911 2.36759 40.1942 2.39989C39.9681 2.49679 39.096 2.8521 37.9978 3.4335C36.8996 4.0149 36.1243 4.53171 35.8659 4.69321C35.2845 5.08081 34.5739 5.59761 33.831 6.24362C33.6695 6.14672 33.4757 6.01751 33.3142 5.92061C30.1165 4.0795 26.4343 3.01359 22.4936 3.01359C21.1047 3.01359 19.7158 3.1428 18.3915 3.4012C15.8398 3.8857 13.4173 4.82241 11.2532 6.14672C9.76734 5.24231 8.44304 4.5963 7.44173 4.1441C5.37451 3.20739 3.9856 2.81979 2.53209 2.91669C1.65998 2.9813 1.14318 3.2074 0.787876 3.5627C0.303373 4.0472 0.174168 4.66091 0.0772672 5.04851C0.0126667 5.33922 -0.0196277 5.59762 0.0126726 6.14672C0.0126726 7.27723 0.174176 8.14933 0.206476 8.47233C0.400278 9.69974 0.658675 10.6688 0.787876 11.121C1.14318 12.413 1.56309 13.6081 1.82149 14.4156C1.85379 14.4802 1.88608 14.5771 1.88608 14.5771C2.07988 15.1585 2.30599 15.7722 2.53209 16.3536C1.82148 18.0655 1.30468 19.8743 1.07858 21.78C0.949376 22.7167 0.884773 23.6858 0.884773 24.6548C0.884773 25.6884 0.949378 26.6897 1.11088 27.691C2.40289 36.832 9.37974 44.1641 18.3915 45.9083C19.7481 46.1667 21.137 46.2959 22.5582 46.2959C33.4757 46.2959 42.5198 38.1886 44.0056 27.6587C44.1348 26.6574 44.2317 25.6561 44.2317 24.6225C44.2317 24.0734 44.1994 23.5242 44.1671 23.0074C44.1348 22.5875 44.1025 22.1676 44.0379 21.7477C43.941 20.9725 43.7795 20.1973 43.5857 19.4221C43.7149 19.196 43.8764 18.873 44.0379 18.4854C44.3286 17.904 45.0715 16.3536 45.9113 13.9957C46.2666 12.9944 46.6542 11.8639 47.0095 10.5718C47.0095 10.5718 47.4617 9.05374 47.9139 6.37282C47.9462 6.01751 48.1077 5.01621 47.8816 3.8211ZM17.1964 6.37282C15.9367 9.89354 15.0646 13.8019 14.5801 17.9363C14.5155 18.4208 14.4832 18.9053 14.4186 19.3575C10.6395 19.7128 7.05412 20.2942 3.6949 21.1017C3.7595 20.7787 3.8241 20.4234 3.921 20.1004C5.56832 13.4789 10.6717 8.21393 17.1964 6.37282ZM28.4369 22.9752C28.8891 23.0075 29.3413 23.0397 29.7612 23.072C31.0209 23.1689 32.216 23.2659 33.3142 23.3951C38.2239 23.9765 41.4216 24.9132 41.4216 25.9791C41.4216 27.3034 36.5443 28.4339 29.6643 28.9184C29.7289 27.5941 29.7935 26.2052 29.7935 24.784C29.7935 24.6548 29.7935 24.5579 29.7935 24.4287C29.3413 24.3964 28.8891 24.3964 28.4692 24.3641C28.4692 24.461 28.4692 24.5902 28.4692 24.6871C28.4692 26.1729 28.4369 27.5941 28.34 28.983C26.4989 29.0799 24.5286 29.1445 22.4936 29.1445C21.46 29.1445 20.4587 29.1445 19.4574 29.1122C19.4897 29.5967 19.522 30.0812 19.5543 30.5334C20.5233 30.5657 21.4923 30.598 22.4613 30.598C24.3993 30.598 26.3374 30.5334 28.2108 30.4042C27.5648 38.0271 25.6268 43.615 23.3012 43.7442C23.2689 43.7442 23.2366 43.7442 23.2043 43.7442C20.8786 43.7442 18.876 38.1563 18.1977 30.4688C18.1654 30.0166 18.1331 29.5321 18.1008 29.0476C18.0039 27.6587 17.9716 26.1729 17.9716 24.6871C17.9716 24.3964 17.9716 24.138 17.9716 23.8473C17.9716 23.5243 17.9716 23.2013 18.0039 22.8783C18.4561 22.846 18.9083 22.8459 19.3605 22.8459C20.3941 22.8136 21.4277 22.8137 22.4936 22.8137C24.5286 22.8137 26.5312 22.8783 28.4369 22.9752ZM2.27369 10.1519C2.04759 9.31214 1.85378 8.47234 1.75688 7.60023C1.69228 6.95423 1.46618 5.75911 2.04758 5.27461C2.27369 5.08081 2.62899 5.08081 2.91969 5.11311C3.3073 5.17771 3.6626 5.33922 4.0179 5.53302C4.2763 5.66222 4.5024 5.82372 4.7608 5.98522C4.9869 6.14672 5.21301 6.30822 5.43911 6.46972C5.89131 6.79272 6.34352 7.14802 6.79572 7.50332C7.21563 7.82633 7.60322 8.18163 7.99083 8.53694C6.18201 10.1519 4.6639 12.0254 3.5011 14.1572C3.04889 12.8652 2.62899 11.5086 2.27369 10.1519ZM3.7595 28.4662C6.69883 29.1768 9.79965 29.6936 13.0297 30.0812C12.9974 29.629 12.9651 29.1768 12.9328 28.7246C7.28022 28.1755 3.5011 27.1742 3.5011 25.9791C3.5011 24.9132 6.69882 23.9442 11.6085 23.3951C12.4483 23.2981 13.3204 23.2013 14.2248 23.1367C14.2248 23.2982 14.2248 23.4919 14.2248 23.6534C14.2248 24.0411 14.2248 24.4287 14.2248 24.8163C14.2248 26.1729 14.2571 27.5295 14.354 28.8538C14.3863 29.306 14.4186 29.7582 14.4509 30.2427C14.8708 34.8616 15.8075 39.1899 17.1641 43.0659C10.3488 41.0633 5.14841 35.4753 3.7595 28.4662ZM26.079 43.4535C27.7586 41.5155 29.0506 36.5736 29.5674 30.3073C33.6695 29.9843 37.5456 29.3383 41.1632 28.4662C39.6451 36.0245 33.6695 41.9677 26.079 43.4535ZM46.202 6.21131C46.0082 7.60022 45.5883 8.95685 45.1038 10.2812C44.7162 11.3794 44.2963 12.4453 43.8441 13.5112C43.4242 14.5771 42.972 15.6107 42.5521 16.6766C42.1968 15.8045 41.8092 14.9647 41.357 14.1572L41.3247 14.1895C40.6464 14.8032 40.3234 15.643 40.2588 16.5151C40.1942 17.6779 40.6141 18.7438 40.9371 19.842C41.0017 20.1004 41.0663 20.3588 41.0986 20.6172C41.0986 20.6495 41.2278 21.134 41.1955 21.134C37.5778 20.2619 33.6695 19.6482 29.5674 19.2929C29.1152 19.2606 28.663 19.2283 28.2108 19.196C26.3374 19.0668 24.3994 19.0022 22.429 19.0022C21.46 19.0022 20.491 19.0022 19.522 19.0668C19.0698 19.0668 18.6176 19.0991 18.1654 19.1314C18.1977 18.6792 18.2623 18.1947 18.2946 17.7425C19.0698 10.6688 20.9432 5.66222 23.1719 5.66222C23.2688 5.66222 23.3658 5.66222 23.4627 5.69452C25.5622 6.08212 27.3387 10.9918 28.0816 17.8071C28.5338 17.8394 28.986 17.8717 29.4382 17.8717C28.8568 12.0577 27.5325 7.56793 25.9175 5.95292C28.2431 6.37282 30.4072 7.21263 32.3452 8.40774C32.1514 9.63515 32.4098 10.7979 33.185 11.5409C33.6695 11.0241 34.154 10.5396 34.6708 10.0551C35.2845 9.44135 35.8982 8.85994 36.5443 8.27854C36.9642 7.89093 37.4164 7.50333 37.8686 7.14803C39.2575 6.01752 40.7756 5.04851 42.4229 4.3379C42.7782 4.1764 43.1012 4.04721 43.4565 3.918C44.1025 3.6919 45.2976 3.3043 45.9113 3.8534C46.1051 4.0149 46.1697 4.30561 46.202 4.53171C46.3312 5.08081 46.2666 5.66221 46.202 6.21131Z" fill="currentColor" />

      </svg>
    ),
  },
  {
    id: "codex",
    label: "Codex",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" focusable="false">
        <path clipRule="evenodd" d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z" />
      </svg>
    ),
  },
  {
    id: "daz",
    label: "Daz Studio",
    icon: (
      <svg viewBox="0 0 168 50" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M16.4346 0.0704346C24.7637 0.0704346 30.186 1.72811 34.4903 4.62904C40.9187 9.08404 44.8876 16.2846 44.8876 24.3139C44.8876 32.3433 40.9187 39.5438 34.4903 43.9988C30.2419 46.8997 24.7637 48.5574 16.4346 48.5574H0V0.0704346H16.4346ZM30.9686 13.7981C28.0618 10.3791 23.8134 8.41061 17.5526 8.41061H10.1179V40.3208H17.6085C23.8134 40.3208 28.0618 38.3006 31.0245 34.9334C33.4282 32.1361 34.8257 28.4063 34.8257 24.4175C34.7698 20.2733 33.3723 16.5436 30.9686 13.7981Z" fill="currentColor" />
    <path d="M84.5211 48.556H75.1858V45.8623C72.1673 48.2452 68.7574 49.2812 65.068 49.2812C59.7016 49.2812 54.6147 47.0537 51.3725 43.583C48.5216 40.5266 46.7328 36.3825 46.7328 31.772C46.7328 21.8778 54.6706 14.2111 64.5649 14.2111C68.7015 14.2111 72.335 15.4543 75.1858 17.63V14.9363H84.5211V48.556ZM74.7945 26.7472C72.7822 24.2607 69.54 22.603 65.7947 22.603C60.0929 22.603 56.4594 26.9544 56.4594 31.8239C56.4594 37.1077 60.596 40.9929 66.0183 40.9929C69.7077 40.9929 72.894 39.3352 74.7945 36.8487V26.7472Z" fill="currentColor" />
    <path d="M120.073 20.4766L102.52 40.9385H121.582V48.5534H89.4395V43.0106L106.768 22.5487H90.8929V14.9337H120.073V20.4766Z" fill="currentColor" />
    <path d="M127.117 16.8358C128.123 18.338 129.968 19.3223 132.316 19.3223C135.67 19.3223 137.85 16.8876 137.85 14.0384C137.85 11.0339 135.279 8.75459 131.925 8.75459C130.695 8.75459 129.968 8.9618 129.633 9.06541V7.97756L135.558 1.65767H126.67V0H138.521V1.08785L132.819 7.20052C136.844 7.45953 139.806 10.4123 139.806 14.0902C139.806 17.82 136.788 21.0317 132.372 21.0317C129.409 21.0317 127.005 19.8403 125.664 17.7682L127.117 16.8358Z" fill="currentColor" />
    <path d="M157.023 18.7524C155.178 19.9957 152.886 20.7209 149.308 20.7209H142.936V0H149.308C152.83 0 155.178 0.725232 157.023 1.96849C159.762 3.88517 161.439 6.94151 161.439 10.3605C161.439 13.7794 159.762 16.8876 157.023 18.7524ZM156.016 3.41895C154.395 2.2793 152.327 1.65767 149.197 1.65767H144.836V19.0115H149.197C152.327 19.0115 154.395 18.4416 156.016 17.2502C158.196 15.6443 159.538 13.106 159.538 10.3087C159.538 7.56314 158.252 5.02483 156.016 3.41895Z" fill="currentColor" />
    <path d="M164.289 15.6602C165.798 15.6602 167.084 16.7998 167.084 18.2503C167.084 19.6489 165.854 20.8404 164.289 20.8404C162.78 20.8404 161.494 19.7007 161.494 18.2503C161.494 16.7998 162.724 15.6602 164.289 15.6602ZM164.289 20.426C165.631 20.426 166.693 19.4417 166.693 18.1985C166.693 16.9552 165.631 15.971 164.289 15.971C162.948 15.971 161.886 16.9552 161.886 18.1985C161.886 19.4417 162.948 20.426 164.289 20.426ZM165.072 19.5971L164.066 18.1985H163.674V19.5971H163.283V16.7998H164.345C164.736 16.7998 164.904 16.9034 165.072 17.007C165.239 17.1624 165.295 17.3178 165.295 17.525C165.295 17.7322 165.184 17.8877 165.072 18.0431C164.96 18.1467 164.792 18.1985 164.513 18.2503L165.519 19.6489H165.072V19.5971ZM164.289 17.8877C164.569 17.8877 164.68 17.8359 164.792 17.7322C164.848 17.6804 164.904 17.5768 164.904 17.4732C164.904 17.3696 164.848 17.266 164.792 17.2142C164.736 17.1106 164.625 17.0588 164.289 17.0588H163.618V17.8359H164.289V17.8877Z" fill="currentColor" />

      </svg>
    ),
  }
] as const

function AboutPortrait({ language }: { language: Language }) {
  const [showReal, setShowReal] = useState(false)
  const label = language === "zh"
    ? (showReal ? "切换为 CG 肖像" : "切换为真人照片")
    : (showReal ? "Show CG portrait" : "Show real portrait")

  return (
    <button
      type="button"
      className={`about-portrait ${showReal ? "is-real" : "is-cg"}`}
      onClick={() => setShowReal((current) => !current)}
      aria-label={label}
      aria-pressed={showReal}
    >
      <img className="about-portrait-image about-portrait-cg" src={portraitCg} alt="" aria-hidden="true" draggable={false} />
      <img className="about-portrait-image about-portrait-real" src={portraitReal} alt="" aria-hidden="true" draggable={false} />
    </button>
  )
}

export default function App() {
  const quoteSource = useRef<HTMLButtonElement>(null)
  const quoteBundle = useRef<HTMLDivElement>(null)
  const [quoteRun, setQuoteRun] = useState(0)
  const [quoteMode, setQuoteMode] = useState<"click" | "ambient">("click")
  const [quoteReturn, setQuoteReturn] = useState(0)
  const [quoteActive, setQuoteActive] = useState(false)
  const [quoteHeld, setQuoteHeld] = useState(false)
  const quoteActiveRef = useRef(false)
  const quoteHoldIntent = useRef(false)
  const playbackRequest = useRef(0)
  const onQuoteActiveChange = useCallback((active: boolean) => {
    quoteActiveRef.current = active
    setQuoteActive(active)
  }, [])
  const video = useRef<HTMLVideoElement>(null)
  const [activeIndex, setActiveIndex] = useState(() => Math.floor(Math.random() * themes.length))
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const scene = themes[activeIndex]
  const reduced = useReducedMotion()
  const [language, setLanguage] = useState<Language>("zh")
  const [cinema, setCinema] = useState(false)
  const { status: playbackStatus, ready, paused: still, play: playFilm, pause: pauseFilm } = useVideoPlayback(video, scene.video)
  const toggleStill = useCallback(async () => {
    const element = video.current
    if (!element) return
    const request = ++playbackRequest.current
    if (!element.paused && playbackStatus !== "error") {
      quoteHoldIntent.current = true
      setQuoteHeld(true)
      if (!quoteActiveRef.current) {
        setQuoteMode("ambient")
        setQuoteRun((value) => value + 1)
      }
      pauseFilm()
      return
    }
    const started = await playFilm()
    if (!started || request !== playbackRequest.current || element !== video.current || element.paused) return
    quoteHoldIntent.current = false
    setQuoteHeld(false)
  }, [playFilm, pauseFilm, playbackStatus])
  useEffect(() => {
    playbackRequest.current += 1
    quoteHoldIntent.current = false
    setQuoteHeld(false)
  }, [activeIndex])
  const [sceneMenuOpen, setSceneMenuOpen] = useState(false)
  const [about, setAbout] = useState(false)
  const [contact, setContact] = useState(false)
  const [intro, setIntro] = useState(false)
  const [previewPhase, setPreviewPhase] = useState<"opening" | "ready" | null>(
    null,
  )
  const [chapter, setChapter] = useState<"home" | "work">("home")
  const finishPreviewOpening = useCallback(
    () =>
      setPreviewPhase((current) => (current === "opening" ? "ready" : current)),
    [],
  )
  const closePreview = useCallback(() => setPreviewPhase(null), [])
  const text = { ...copy[language], sceneName: scene.name[language], themeCategory: scene.category[language] }
  const previewVisible = previewIndex !== null
  const quoteEnabled = chapter === "home" && !about && !contact && !cinema && !previewVisible && !sceneMenuOpen && !intro
  // The 30-second cycle only runs when the quote is not held by the still control.
  useEffect(() => {
    if (!quoteEnabled || reduced || quoteActive || quoteHeld) return
    let timer: number | undefined
    const schedule = () => {
      window.clearTimeout(timer)
      if (document.visibilityState !== "visible") return
      timer = window.setTimeout(() => {
        setQuoteMode("ambient")
        setQuoteRun((value) => value + 1)
      }, 30000)
    }
    schedule()
    document.addEventListener("visibilitychange", schedule)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", schedule)
    }
  }, [quoteEnabled, reduced, quoteActive, quoteHeld, activeIndex, language])

  const restoreSceneFocus = useRef(false)
  useEffect(() => {
    if (!previewVisible) {
      if (restoreSceneFocus.current) {
        document.querySelector<HTMLButtonElement>(".scene-trigger")?.focus({ preventScroll: true })
        restoreSceneFocus.current = false
      }
      return
    }
    restoreSceneFocus.current = true
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousPadding = document.body.style.paddingRight
    const gutter = window.innerWidth - root.clientWidth
    root.style.overflow = "hidden"
    if (gutter > 0) document.body.style.paddingRight = String(gutter) + "px"
    return () => {
      root.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
    }
  }, [previewVisible])
  const environment = themes[previewPhase && previewIndex !== null ? previewIndex : activeIndex]
  const beginPreview = (index: number) => {
    setIntro(false)
    setPreviewIndex(index)
    setPreviewPhase("opening")
  }
  const confirmPreview = () => {
    if (previewIndex !== null) {
      setActiveIndex(previewIndex)
    }
    setPreviewPhase(null)
  }
  const finishPreviewExit = () => {
    setPreviewIndex(null)
  }

  const chapterMotion = useRef<ReturnType<typeof animate> | null>(null)
  const chapterLock = useRef(false)
  const chapterTarget = useRef<number | null>(null)
  const workTop = () => {
    const zone = document.querySelector<HTMLElement>(".chapter-zone")
    return zone ? Math.max(0, zone.offsetTop - 56) : null
  }
  const glideTo = useCallback((top: number) => {
    setIntro(false)
    chapterMotion.current?.stop()
    if (reduced) {
      window.scrollTo({ top, behavior: "instant" })
      return
    }
    chapterLock.current = true
    chapterTarget.current = top
    chapterMotion.current = animate(window.scrollY, top, {
      duration: 0.82,
      ease: [0.76, 0, 0.24, 1],
      onUpdate: (value) => window.scrollTo({ top: value, behavior: "instant" }),
      onComplete: () => {
        window.setTimeout(() => {
          if (chapterTarget.current === top) {
            chapterLock.current = false
            chapterTarget.current = null
          }
        }, 420)
      },
    })
  }, [reduced])
  const toWork = () => {
    const top = workTop()
    if (top !== null) glideTo(top)
  }
  const toHome = () => glideTo(0)

  useEffect(() => {
    if (about || contact || cinema || previewVisible) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return
      const top = workTop()
      if (top === null) return
      const y = window.scrollY
      const down = e.deltaY > 0 && y < top - 2
      const up = e.deltaY < 0 && y > 2 && y <= top + 2
      if (!down && !up) return
      e.preventDefault()
      if (Math.abs(e.deltaY) < 4) return
      const next = down ? top : 0
      // 同方向的惯性滚动忽略；反方向随时打断并掉头
      if (chapterLock.current && chapterTarget.current === next) return
      glideTo(next)
    }
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => window.removeEventListener("wheel", onWheel)
  }, [about, contact, cinema, previewVisible, glideTo])
  useEffect(() => () => chapterMotion.current?.stop(), [])

  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbout(false)
        setContact(false)
        setIntro(false)
        setCinema(false)
        setPreviewPhase(null)
      }
    }
    window.addEventListener("keydown", escape)
    return () => window.removeEventListener("keydown", escape)
  }, [])

  useEffect(() => {
    const updateChapter = () => {
      const zone = document.querySelector<HTMLElement>(".chapter-zone")
      if (!zone) return
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      const enterBoundary = Math.min(
        zone.offsetTop - window.innerHeight * 0.2,
        maxScroll - 20,
      )
      const returnBoundary = zone.offsetTop - window.innerHeight * 0.45
      setChapter((current) => {
        if (current === "home" && window.scrollY > enterBoundary) return "work"
        if (current === "work" && window.scrollY < returnBoundary) return "home"
        return current
      })
    }
    updateChapter()
    window.addEventListener("scroll", updateChapter, { passive: true })
    window.addEventListener("resize", updateChapter)
    return () => {
      window.removeEventListener("scroll", updateChapter)
      window.removeEventListener("resize", updateChapter)
    }
  }, [])

  useEffect(() => {
    if (chapter !== "home" || about || contact || cinema || previewVisible || sceneMenuOpen) setIntro(false)
  }, [chapter, about, contact, cinema, previewVisible, sceneMenuOpen])

  useEffect(() => {
    document.title = text.documentTitle
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en"
  }, [language, text.documentTitle])

  return (
    <main data-language={language} style={{
      "--scene-bg": environment.palette.background,
      "--gold": environment.palette.accent,
      "--ivory": environment.palette.foreground,
      "--hair": environment.palette.hairline,
      color: environment.palette.foreground,
      backgroundColor: environment.palette.background,
    } as React.CSSProperties}>
      <section
        id="top"
        className={`hero ${cinema ? "cinema" : ""} ${previewVisible ? "is-preview" : ""} ${still ? "is-still" : ""} ${ready ? "has-video-frame" : ""} ${chapter === "work" ? "is-work-chapter" : ""}`}
        aria-label={text.heroLabel}
      >
        <div className="media">
          <img className="still" src={scene.image} alt="" fetchPriority="high" decoding="async" />
          <motion.video
            ref={video}
            poster={scene.image}
            muted
            loop
            playsInline
            preload="auto"
            aria-label={text.filmLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{
              duration: reduced ? 0 : 1.7,
              delay: 0,
            }}
          />
          <div className="grade" />
          <div className="grain" />
        </div>

        <QuoteFlight sourceRef={quoteSource} bundleRef={quoteBundle} text={text.manifesto} run={quoteRun} mode={quoteMode}
          returnRequest={quoteReturn} held={quoteHeld} enabled={quoteEnabled} reduced={Boolean(reduced)}
          exclusion={scene.quoteExclusion} onActiveChange={onQuoteActiveChange} />

        <AnimatePresence onExitComplete={finishPreviewExit}>
          {previewPhase && previewIndex !== null && (
            <ThemePreview
              key="theme-preview"
              phase={previewPhase}
              onReady={finishPreviewOpening}
              theme={themes[previewIndex]}
              language={language}
              onConfirm={confirmPreview}
              onCancel={closePreview}
              text={text}
            />
          )}
        </AnimatePresence>

            <motion.div
              className="ui"
              inert={previewVisible || cinema}
              aria-hidden={previewVisible || cinema}
              key="ui"
              initial={{ opacity: 0 }}
              animate={{ opacity: cinema ? 0 : 1 }}
              style={{ pointerEvents: previewVisible || cinema ? "none" : undefined }}
              exit={{ opacity: 0 }}
            >
              <motion.header
                className="topbar"
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1.2,
                  delay: reduced ? 0 : 2.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="brand">
                  <button
                    className="language-toggle"
                    type="button"
                    aria-label={text.languageButton}
                    title={text.languageButton}
                    onClick={() =>
                      setLanguage((current) => (current === "zh" ? "en" : "zh"))
                    }
                  >
                    {text.languageMark}
                  </button>
                  <span>
                    <b>{text.name}</b>
                    <small>{text.subtitle}</small>
                  </span>
                </div>
                <div className="page-info">
                  <i />
                  <span>
                    <small>{text.page}</small>
                    <b>{text.sceneName}</b>
                  </span>
                  <i />
                </div>
                <div className="meta">
                  <span>{text.themeCategory}</span>
                  <span>{scene.year}</span>
                </div>
              </motion.header>

              <motion.button
                type="button"
                className={`scene-intro-trigger ${intro ? "is-open" : ""}`}
                aria-expanded={intro}
                aria-controls="scene-introduction"
                aria-label={intro ? text.introClose : text.intro}
                inert={chapter !== "home" || about || contact || previewVisible}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: chapter === "home" ? 1 : 0, y: chapter === "home" ? 0 : -8 }}
                transition={{ duration: reduced ? 0 : .55 }}
                onClick={() => setIntro((current) => !current)}
              >
                <span>{intro ? text.introClose : text.intro}</span>
                <span className="intro-symbol" aria-hidden="true"><i /><b /><i /></span>
              </motion.button>

              <motion.aside
                className="left-rail"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.1, delay: reduced ? 0 : 2.4 }}
              >
                <SceneMenu
                  select={beginPreview}
                  text={text}
                  language={language}
                  activeId={scene.id}
                  onOpenChange={setSceneMenuOpen}
                />
              </motion.aside>

              <motion.nav
                className="right-rail"
                aria-label={text.mainNav}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 1.1, delay: reduced ? 0 : 2.5 }}
              >
                <NavAction
                  type="work"
                  label={text.work}
                  number="01"
                  onClick={toWork}
                />
                <NavAction
                  type="about"
                  label={text.about}
                  hint={text.aboutHint}
                  number="02"
                  onClick={() => setAbout(true)}
                />
                <NavAction
                  type="contact"
                  label={text.contact}
                  hint={text.contactHint}
                  number="03"
                  onClick={() => setContact(true)}
                />
              </motion.nav>

              <motion.div
                ref={quoteBundle}
                className={`manifesto ${quoteActive ? "is-quote-flying" : ""}`}
                inert={intro || chapter !== "home"}
                aria-hidden={intro || chapter !== "home"}
                initial={
                  reduced
                    ? { opacity: 1 }
                    : {
                        opacity: 0,
                        x: -80,
                        scale: 1.13,
                        clipPath: "inset(-40px 100% -40px -40px)",
                      }
                }
                animate={{
                  opacity: intro || chapter !== "home" ? 0 : 1,
                  y: intro ? 18 : 0,
                  x: 0,
                  scale: 1,
                  clipPath: "inset(-40px -40px -40px -40px)",
                  transitionEnd: { clipPath: "none" },
                }}
                transition={{
                  opacity: { duration: reduced ? 0 : .65, delay: 0 },
                  y: { duration: reduced ? 0 : .65, delay: 0 },
                  duration: reduced ? 0 : 2.4,
                  delay: reduced ? 0 : 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <QuoteCycle videoRef={video} reduced={Boolean(reduced)}>
                  <h1>
                    <button ref={quoteSource} type="button"
                      className={`quote-trigger ${quoteActive ? "is-flying" : ""}`}
                      aria-label={language === "zh" ? `${text.manifesto}。${quoteHeld ? "播放影片后文字归位" : quoteActive ? "点击收拢文字" : "点击展开文字"}` : `${text.manifesto} ${quoteHeld ? "Play the film to return the words" : quoteActive ? "Return the words" : "Unfold the words"}`}
                      aria-pressed={quoteActive} disabled={!quoteEnabled || Boolean(reduced)}
                      onClick={() => {
                        if (quoteHeld) return
                        if (quoteActive) setQuoteReturn((value) => value + 1)
                        else {
                          setQuoteMode("click")
                          setQuoteRun((value) => value + 1)
                        }
                      }}>
                      <InteractiveText text={text.manifesto} reduced={Boolean(reduced) || quoteActive} />
                      {!reduced && <span className="quote-flight-hint" aria-hidden="true">
                        <i />{language === "zh" ? (quoteHeld ? "播放影片 · 文字归位" : quoteActive ? "再次点击 · 归位" : "点击 · 展开文字") : (quoteHeld ? "PLAY FILM TO RETURN" : quoteActive ? "CLICK TO RETURN" : "CLICK TO UNFOLD")}
                      </span>}
                    </button>
                  </h1>
                  <div className="quote-rule">
                    <i />
                    <b />
                  </div>
                  <blockquote>
                    <p>
                      <InteractiveText
                        text="Der Mensch ist Etwas, das überwunden werden soll."
                        reduced={Boolean(reduced) || quoteActive}
                        subtle
                      />
                    </p>
                    <footer><span style={{ display: "inline-block" }}>{text.attribution}</span></footer>
                  </blockquote>
                </QuoteCycle>
              </motion.div>

              <AnimatePresence>
                {intro && chapter === "home" && (
                  <motion.section
                    key={`intro-${scene.id}`}
                    id="scene-introduction"
                    className="scene-intro"
                    aria-label={text.intro}
                    initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                    transition={{ duration: reduced ? 0 : .7, ease: [.16, 1, .3, 1] }}
                  >
                    <small>{text.introKicker}</small>
                    <h2>{scene.name[language]}<span>{scene.year}</span></h2>
                    <div className="intro-rule" aria-hidden="true"><i /><b /><i /></div>
                    <p>{scene.description[language]}</p>
                  </motion.section>
                )}
              </AnimatePresence>

              <motion.div
                className="idle-layer"
                inert={chapter !== "home"}
                aria-hidden={chapter !== "home"}
                initial={{ opacity: 0 }}
                animate={{ opacity: chapter === "home" ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : .6 }}
              >
                <IdleWidgets language={language} held={quoteHeld} enabled={quoteEnabled} reduced={Boolean(reduced)} />
              </motion.div>
              <motion.footer
                className="bottombar"
                inert={chapter !== "home"}
                aria-hidden={chapter !== "home"}
                initial={{ y: 26, opacity: 0 }}
                animate={{ y: chapter === "home" ? 0 : 18, opacity: chapter === "home" ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : .6 }}
              >
                <PlaybackControl videoRef={video} text={text}
                  language={language} still={still} status={playbackStatus} onStill={toggleStill} />
                <button
                  className="cinema-button"
                  onClick={() => setCinema(true)}
                >
                  {text.cinema} <Fullscreen size={17} strokeWidth={1.1} />
                </button>
              </motion.footer>
            </motion.div>
        <AnimatePresence>
          {cinema && (
            <motion.button
              className="restore"
              key="restore"
              onClick={() => setCinema(false)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <RotateCcw size={17} strokeWidth={1.1} /> {text.restore}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(about || contact) && (
            <motion.div
              key="panel-scrim"
              className="panel-scrim"
              aria-hidden="true"
              onClick={() => {
                setAbout(false)
                setContact(false)
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: "fixed", inset: 0, zIndex: 29, background: "rgba(8, 6, 5, 0.22)", cursor: "default" }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {about && (
            <motion.aside
              className="about-panel has-portrait"
              data-language={language}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                className="close"
                onClick={() => setAbout(false)}
                aria-label={text.close}
              >
                <X size={18} />
              </button>
              <small>{text.aboutPanel}</small>
              <h2>{text.aboutTitleA}</h2>
              <p className="about-role">{text.aboutTitleB}</p>
              <p className="about-education">{text.aboutBody}</p>
              <section className="about-software" aria-label={text.aboutSoftwareTitle}>
                <h3>{text.aboutSoftwareTitle}</h3>
                <ul className="about-software-grid">
                  {aboutSoftware.map((software) => (
                    <li key={software.id} title={software.id === "stable-diffusion" ? "Stable Diffusion · Stability AI" : software.label}>
                      <span className={`about-software-logo is-${software.id}`}>{software.icon}</span>
                      <span>{software.label}</span>
                      {software.id === "stable-diffusion" && <span className="sr-only">Stability AI</span>}
                    </li>
                  ))}
                </ul>
              </section>
              <AboutPortrait language={language} />
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {contact && (
            <motion.aside
              className="about-panel contact-panel"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              aria-label={text.contact}
            >
              <button
                className="close"
                onClick={() => setContact(false)}
                aria-label={text.close}
              >
                <X size={18} />
              </button>
              <small>{text.contactPanel}</small>
              <h2>
                {text.contactTitleA}
                <br />
                {text.contactTitleB}

              </h2>
              <p>{text.contactBody}</p>
              <ContactDetails language={language} />
            </motion.aside>
          )}
        </AnimatePresence>
      </section>

      <div className={`chapter-zone ${cinema ? "is-cinema" : ""}`}>
        <div id="chapter-boundary" className="chapter-boundary"
          inert={cinema || sceneMenuOpen || previewVisible}
          aria-hidden={cinema || sceneMenuOpen || previewVisible}>
          <motion.button
            className={`chapter-control ${
              chapter === "home" ? "is-down" : "is-up"
            }`}
            type="button"
            onClick={chapter === "home" ? toWork : toHome}
            aria-label={chapter === "home" ? text.explore : text.returnHome}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1.1,
              delay: reduced ? 0 : 2.7,

              ease: [0.16, 1, 0.3, 1],

            }}
          >
            <span className="chapter-label">{chapter === "home" ? text.explore : text.returnHome}</span>
            <span className="chapter-direction" aria-hidden="true">
              <svg className="chapter-arrow" width="20" height="26" viewBox="0 0 24 30" fill="none">
                <path d="M12 4v22M6 20l6 6 6-6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <small>{chapter === "home" ? text.nextChapter : text.page}</small>

          </motion.button>

        </div>

        <section id="work-index" className="work-index" inert={previewVisible} aria-hidden={previewVisible}>

          <header>

            <small>{text.selectedWork}</small>

            <h2>{text.workIndex}</h2>

            <p>{text.workIntro}</p>

          </header>

          {portfolioWorks.length === 0 && (

            <div className="work-empty">

              <i />
              <p>{text.emptyWork}</p>

            </div>

          )}
        </section>

      </div>

      <StarGearCursor cinema={cinema} />
    </main>

  )
}

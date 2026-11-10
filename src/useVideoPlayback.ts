import { useCallback, useEffect, useRef, useState } from "react"

export type PlaybackStatus = "loading" | "playing" | "paused" | "blocked" | "error"

export function useVideoPlayback(videoRef: React.RefObject<HTMLVideoElement | null>, source: string) {
  const [status, setStatus] = useState<PlaybackStatus>("loading")
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(true)
  const wantsPlayback = useRef(true)
  const request = useRef(0)
  const pending = useRef(false)
  const loadSource = useRef<() => void>(() => {})

  const play = useCallback(async () => {
    const video = videoRef.current
    if (!video) return false
    wantsPlayback.current = true
    if (!video.getAttribute("src") || video.error) {
      loadSource.current()
      return false
    }
    if (document.hidden) return false
    const id = ++request.current
    pending.current = true
    setStatus("loading")
    // Set the DOM property before play(), including browsers with stricter autoplay policies.
    video.muted = true
    try {
      await video.play()
      return request.current === id && !video.paused
    } catch (error) {
      if (request.current !== id) return false
      wantsPlayback.current = false
      setPaused(video.paused)
      setStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "blocked" : "error")
      return false
    } finally {
      if (request.current === id) pending.current = false
    }
  }, [videoRef])

  const pause = useCallback(() => {
    wantsPlayback.current = false
    request.current += 1
    pending.current = false
    videoRef.current?.pause()
    setPaused(true)
    setStatus("paused")
  }, [videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    wantsPlayback.current = true
    pending.current = false
    let disposed = false
    let loading = false
    let objectUrl: string | undefined
    const controller = new AbortController()
    video.removeAttribute("src")
    video.load()
    setReady(false)
    setPaused(video.paused)
    setStatus("loading")

    const startWhenReady = () => {
      if (!wantsPlayback.current || pending.current || document.hidden || !video.paused || video.error) return
      if (video.getAttribute("src")) void play()
    }
    const load = async () => {
      if (loading || disposed) return
      loading = true
      setStatus("loading")
      setReady(false)
      try {
        // Native preload can stop after the first frame on slow connections.
        // Fetch this short theme loop once before decoding so playback never
        // competes with a connection slower than its high-quality bitrate.
        const response = await fetch(source, { signal: controller.signal, priority: "low" })
        if (!response.ok) throw new Error(`Film request failed: ${response.status}`)
        const blob = await response.blob()
        if (disposed) return
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        objectUrl = URL.createObjectURL(blob)
        video.src = objectUrl
        video.load()
        startWhenReady()
      } catch {
        if (!disposed) { setPaused(true); setStatus("error") }
      } finally {
        loading = false
      }
    }
    loadSource.current = () => { void load() }
    const onPlay = () => { setPaused(false); setStatus("loading") }
    const onPlaying = () => { setPaused(false); setReady(true); setStatus("playing") }
    const onPause = () => {
      setPaused(true)
      if (video.error) setStatus("error")
      else if (!document.hidden) setStatus(wantsPlayback.current ? "blocked" : "paused")
    }
    const onWaiting = () => { if (wantsPlayback.current) setStatus("loading") }
    const onError = () => { request.current += 1; pending.current = false; setReady(false); setPaused(video.paused); setStatus("error") }
    const onVisibility = () => {
      if (document.hidden) {
        request.current += 1
        pending.current = false
        video.pause()
      } else if (wantsPlayback.current) {
        setStatus("loading")
        startWhenReady()
      }
    }
    video.addEventListener("play", onPlay)
    video.addEventListener("playing", onPlaying)
    video.addEventListener("pause", onPause)
    video.addEventListener("waiting", onWaiting)
    video.addEventListener("error", onError)
    document.addEventListener("visibilitychange", onVisibility)
    void load()
    return () => {
      disposed = true
      controller.abort()
      loadSource.current = () => {}
      request.current += 1
      pending.current = false
      video.removeEventListener("play", onPlay)
      video.removeEventListener("playing", onPlaying)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("waiting", onWaiting)
      video.removeEventListener("error", onError)
      document.removeEventListener("visibilitychange", onVisibility)
      video.pause()
      video.removeAttribute("src")
      video.load()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [videoRef, source, play])

  return { status, ready, paused, play, pause }
}

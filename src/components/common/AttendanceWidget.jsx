import React, { useState, useEffect, useRef } from "react"
import { Box, Button, Text, HStack, useToast, useColorModeValue } from "@chakra-ui/react"
import ApiService from "../../services/apiService"

const getUserKey = () => {
    // Try to get user from localStorage (assumes user object is stored as JSON)
    const userRaw = localStorage.getItem("user")
    if (!userRaw) return "anon"
    try {
        const user = JSON.parse(userRaw)
        // Prefer id, fallback to email or username
        return user.id ? `user_${user.id}` : user.email ? `user_${user.email}` : user.username ? `user_${user.username}` : "anon"
    } catch {
        return "anon"
    }
}

const AttendanceWidget = () => {
    const toast = useToast()
    const userKey = getUserKey()
    // Use userKey for all localStorage keys
    const [checkInTime, setCheckInTime] = useState(() => localStorage.getItem(`${userKey}_checkInTime`))
    const [checkOutInfo, setCheckOutInfo] = useState(() => {
        const info = localStorage.getItem(`${userKey}_checkOutInfo`)
        return info ? JSON.parse(info) : null
    })
    const [elapsed, setElapsed] = useState("00:00:00")
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [isDoneForToday, setIsDoneForToday] = useState(() => {
        const stored = localStorage.getItem(`${userKey}_attendanceDoneDate`)
        const today = new Date().toISOString().slice(0, 10)
        return stored === today
    })
    const timerRef = useRef(null)
    const [isCheckingIn, setIsCheckingIn] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    // helper to parse time like HH:MM:SS or HH:MM:SS.ssssss into a Date today
    const parseTimeToday = (timeStr) => {
        if (!timeStr) return null
        const [hms] = timeStr.split(".") // strip fractional seconds if present
        const [h, m, s] = hms.split(":").map(Number)
        const d = new Date()
        d.setHours(h || 0, m || 0, s || 0, 0)
        return d
    }

    // Start timer when checked in and not checked out
    useEffect(() => {
        if (checkInTime && !checkOutInfo && !isDoneForToday) {
            const start = parseTimeToday(checkInTime)
            if (!start) return
            timerRef.current && clearInterval(timerRef.current)
            timerRef.current = setInterval(() => {
                const now = new Date()
                const diff = Math.max(0, now - start)
                const hrs = Math.floor(diff / 3600000)
                const mins = Math.floor((diff % 3600000) / 60000)
                const secs = Math.floor((diff % 60000) / 1000)
                const pad = (n) => n.toString().padStart(2, "0")
                setElapsed(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`)
            }, 1000)
            return () => clearInterval(timerRef.current)
        } else if (checkInTime && checkOutInfo) {
            // Show worked time as difference between checkInTime and checkOutTime
            const start = parseTimeToday(checkInTime)
            const end = parseTimeToday(checkOutInfo.check_out_time)
            if (start && end) {
                const diff = Math.max(0, end - start)
                const hrs = Math.floor(diff / 3600000)
                const mins = Math.floor((diff % 3600000) / 60000)
                const secs = Math.floor((diff % 60000) / 1000)
                const pad = (n) => n.toString().padStart(2, "0")
                setElapsed(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`)
            }
            clearInterval(timerRef.current)
        } else {
            clearInterval(timerRef.current)
        }
    }, [checkInTime, checkOutInfo, isDoneForToday])

    // Initialize isCheckedIn from storage on mount
    useEffect(() => {
        setIsCheckedIn(Boolean(checkInTime) && !checkOutInfo && !isDoneForToday)
    }, [])

    // Reset done-for-today flag if a new day starts
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        const stored = localStorage.getItem(`${userKey}_attendanceDoneDate`)
        if (stored !== today) {
            localStorage.removeItem(`${userKey}_attendanceDoneDate`)
            setIsDoneForToday(false)
            localStorage.removeItem(`${userKey}_checkInTime`)
            localStorage.removeItem(`${userKey}_checkOutInfo`)
            setCheckInTime(null)
            setCheckOutInfo(null)
            setElapsed("00:00:00")
        }
    }, [])

    const handleCheckIn = async () => {
        if (isDoneForToday) return
        if (isCheckingIn) return
        setIsCheckingIn(true)
        try {
            const res = await ApiService.apiCall("/api/attendance/check-in/", { method: "POST" })
            if (res.detail === "Already checked out.") {
                const today = new Date().toISOString().slice(0, 10)
                localStorage.setItem(`${userKey}_attendanceDoneDate`, today)
                setIsDoneForToday(true)
                setCheckOutInfo({ check_out_time: res.check_out_time, total_hours: res.total_hours })
                localStorage.setItem(`${userKey}_checkOutInfo`, JSON.stringify({ check_out_time: res.check_out_time, total_hours: res.total_hours }))
                toast({ title: res.detail, status: "info", duration: 3000, isClosable: true })
                return
            }
            if (res.detail === "Already checked in.") {
                const time = res.check_in_time || res.time
                const normalized = (time || "").split(".")[0] // HH:MM:SS
                localStorage.setItem(`${userKey}_checkInTime`, normalized)
                setCheckInTime(normalized)
                localStorage.removeItem(`${userKey}_checkOutInfo`)
                setCheckOutInfo(null)
                setIsCheckedIn(true)
                toast({ title: res.detail, status: "info", duration: 3000, isClosable: true })
                return
            }
            const time = res.check_in_time || res.time
            if (time) {
                const normalized = (time || "").split(".")[0]
                localStorage.setItem(`${userKey}_checkInTime`, normalized)
                setCheckInTime(normalized)
                localStorage.removeItem(`${userKey}_checkOutInfo`)
                setCheckOutInfo(null)
                setIsCheckedIn(true)
            }
            toast({ title: res.detail, status: "success", duration: 3000, isClosable: true })
        } catch (err) {
            const data = err.data || {}
            if (data.detail === "Already checked out.") {
                const today = new Date().toISOString().slice(0, 10)
                localStorage.setItem(`${userKey}_attendanceDoneDate`, today)
                setIsDoneForToday(true)
                setCheckOutInfo({ check_out_time: data.check_out_time, total_hours: data.total_hours })
                localStorage.setItem(`${userKey}_checkOutInfo`, JSON.stringify({ check_out_time: data.check_out_time, total_hours: data.total_hours }))
                toast({ title: data.detail, status: "info", duration: 3000, isClosable: true })
                return
            }
            if (data.detail === "Already checked in.") {
                const time = data.check_in_time || data.time
                const normalized = (time || "").split(".")[0]
                if (normalized) {
                    localStorage.setItem(`${userKey}_checkInTime`, normalized)
                    setCheckInTime(normalized)
                    localStorage.removeItem(`${userKey}_checkOutInfo`)
                    setCheckOutInfo(null)
                    setIsCheckedIn(true)
                    toast({ title: data.detail, status: "info", duration: 3000, isClosable: true })
                    return
                }
            }
            toast({ title: err.message || "Check-in failed", status: "error", duration: 3000, isClosable: true })
        } finally {
            setIsCheckingIn(false)
        }
    }

    const handleCheckOut = async () => {
        if (isDoneForToday) return
        if (isCheckingOut) return
        setIsCheckingOut(true)
        try {
            const res = await ApiService.apiCall("/api/attendance/check-out/", { method: "POST" })
            if (res.detail === "Already checked out.") {
                const today = new Date().toISOString().slice(0, 10)
                localStorage.setItem(`${userKey}_attendanceDoneDate`, today)
                setIsDoneForToday(true)
                setCheckOutInfo({ check_out_time: res.check_out_time, total_hours: res.total_hours })
                localStorage.setItem(`${userKey}_checkOutInfo`, JSON.stringify({ check_out_time: res.check_out_time, total_hours: res.total_hours }))
                toast({ title: res.detail, description: res.total_hours ? `Total hours: ${res.total_hours}` : null, status: "info", duration: 3000, isClosable: true })
            } else {
                const today = new Date().toISOString().slice(0, 10)
                localStorage.setItem(`${userKey}_attendanceDoneDate`, today)
                setIsDoneForToday(true)
                setCheckOutInfo({ check_out_time: res.time, total_hours: res.total_hours })
                localStorage.setItem(`${userKey}_checkOutInfo`, JSON.stringify({ check_out_time: res.time, total_hours: res.total_hours }))
                toast({ title: res.detail, description: res.total_hours ? `Total hours: ${res.total_hours}` : null, status: "success", duration: 3000, isClosable: true })
            }
            clearInterval(timerRef.current)
            localStorage.removeItem(`${userKey}_checkInTime`)
            setCheckInTime(null)
            setIsCheckedIn(false)
        } catch (err) {
            const data = err.data || {}
            if (data.detail === "Already checked out.") {
                const today = new Date().toISOString().slice(0, 10)
                localStorage.setItem(`${userKey}_attendanceDoneDate`, today)
                setIsDoneForToday(true)
                setCheckOutInfo({ check_out_time: data.check_out_time, total_hours: data.total_hours })
                localStorage.setItem(`${userKey}_checkOutInfo`, JSON.stringify({ check_out_time: data.check_out_time, total_hours: data.total_hours }))
                toast({ title: data.detail, description: data.total_hours ? `Total hours: ${data.total_hours}` : null, status: "info", duration: 3000, isClosable: true })
                clearInterval(timerRef.current)
                setCheckInTime(null)
                setIsCheckedIn(false)
                return
            }
            toast({ title: err.message || "Check-out failed", status: "error", duration: 3000, isClosable: true })
        } finally {
            setIsCheckingOut(false)
        }
    }

    const bg = useColorModeValue("gray.100", "gray.700")

    return (
        <Box bg={bg} p={4} borderRadius="md" mb={4}>
            {checkInTime && !checkOutInfo && !isDoneForToday ? (
                <HStack justify="space-between">
                    <Text fontSize="sm">Checked in at {checkInTime.split(".")[0]} | Working: {elapsed}</Text>
                    <Button size="sm" colorScheme="red" onClick={handleCheckOut} isLoading={isCheckingOut} isDisabled={isCheckingOut || isDoneForToday}>
                        Check Out
                    </Button>
                </HStack>
            ) : checkOutInfo ? (
                <HStack justify="space-between">
                    <Text fontSize="sm">Checked out at {checkOutInfo.check_out_time?.split(".")[0]} | Worked: {elapsed} hours</Text>
                    <Button size="sm" colorScheme="gray" disabled>
                        Check In (Done for today)
                    </Button>
                </HStack>
            ) : (
                <Button size="sm" colorScheme="green" onClick={handleCheckIn} isLoading={isCheckingIn} isDisabled={isCheckingIn || isDoneForToday}>
                    Check In
                </Button>
            )}
        </Box>
    )
}

export default AttendanceWidget

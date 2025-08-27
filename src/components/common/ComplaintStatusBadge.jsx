"use client"
import { Badge } from "@chakra-ui/react"

const colorMap = {
    open: "yellow",
    in_review: "blue",
    resolved: "green",
    dismissed: "red",
}

export default function ComplaintStatusBadge({ status }) {
    const s = (status || "").toLowerCase()
    const colorScheme = colorMap[s] || "gray"
    const label = s.replace(/_/g, " ") || "unknown"
    return (
        <Badge colorScheme={colorScheme} variant="subtle" textTransform="capitalize">
            {label}
        </Badge>
    )
}

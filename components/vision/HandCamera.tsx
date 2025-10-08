"use client"

import dynamic from "next/dynamic"

const HandCamera = dynamic(() => import("./HandCameraImpl"), { ssr: false })

export default HandCamera

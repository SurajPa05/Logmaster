"use client"

import { useState } from "react"
import api from "@/lib/api"

type Log = {
  source: string
  priority: number
  message: string
}

type source_array = {
  source: string
}

export default function Home() {
  const [logs, setLogs] = useState<Log[]>([])

  const fetchLogs = async () => {
    try {
      const res = await api.get<Log[]>("/logs")
      console.log("DATA:", res.data)
      setLogs(res.data)
    } catch (err) {
      console.error("ERROR:", err)
    }
  }

   const [source_array, sourceupdate] = useState<source_array[]>([])
   const sourcelist = async () => {
    try{
      const res = await api.get<source_array[]>("/sourcelist")
      sourceupdate(res.data)
    }catch(err){
      console.error("ERROR:",err)
    }
   }
  


  return (
    <div style={{ padding: "20px" }}>
      <button onClick={fetchLogs}>
        Fetch Logs :
      </button>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
      <button onClick={sourcelist}>
        source list Logs :
      </button>
      <pre>{JSON.stringify(source_array, null, 2)}</pre>
    </div>
  )
}
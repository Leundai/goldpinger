import { useState, useEffect } from 'react'
import { GoldpingerData, NetworkData } from '../types/goldpinger'
import { transformToNetworkData } from '../utils/dataTransformers'

export function useNetworkData() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, load from static JSON file
      const response = await fetch('/raw_data.json')
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }
      
      const goldpingerData: GoldpingerData = await response.json()
      const networkData = transformToNetworkData(goldpingerData)
      setData(networkData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load network data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    loading,
    error,
    reload: loadData
  }
}
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 관리자 전역 설정(key-value). 현재는 equal_mode만 있음
export function useAppSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('app_settings').select('key, value')
    if (!error) {
      const map = {}
      for (const row of data) map[row.key] = row.value
      setSettings(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const setSetting = useCallback(async (key, value) => {
    const { error } = await supabase.from('app_settings').upsert({ key, value })
    if (!error) await refetch()
    return { error }
  }, [refetch])

  return { settings, loading, refetch, setSetting }
}

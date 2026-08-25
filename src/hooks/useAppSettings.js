import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 관리자가 토글하는 사이트 전역 설정(key-value)을 관리. 지금은 equal_mode 하나뿐이지만
// 나중에 다른 스위치가 추가돼도 테이블/훅 구조를 그대로 재사용할 수 있게 일반화해둠
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

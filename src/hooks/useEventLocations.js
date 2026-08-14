import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useEventLocations() {
  const [locations, setLocations] = useState([])

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.from('event_locations').select('name').order('name', { ascending: true })
    if (!error) setLocations(data.map((row) => row.name))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { locations, refetchLocations: refetch }
}

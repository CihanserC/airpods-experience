import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import type { PartRefs } from './useProductPose'

export function usePartRefs(): PartRefs {
  const caseRef = useRef<Group>(null)
  const lidRef = useRef<Group>(null)
  const budLeftRef = useRef<Group>(null)
  const budRightRef = useRef<Group>(null)
  return useMemo(
    () => ({
      case: caseRef,
      lid: lidRef,
      budLeft: budLeftRef,
      budRight: budRightRef,
    }),
    [],
  )
}

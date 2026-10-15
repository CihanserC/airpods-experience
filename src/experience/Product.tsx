import { Suspense, type MutableRefObject } from 'react'
import { ModelBoundary } from '../models/ModelBoundary'
import { SingleProduct } from '../models/loadProduct'

type ProductProps = {
  progress: MutableRefObject<number>
  mobile: boolean
}

export function Product({ progress, mobile }: ProductProps) {
  return (
    <ModelBoundary fallback={null}>
      <Suspense fallback={null}>
        <SingleProduct progress={progress} mobile={mobile} />
      </Suspense>
    </ModelBoundary>
  )
}

import React from 'react'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Product, Product as ProductType } from '../../../../payload/payload-types'
import { fetchDoc } from '../../../_api/fetchDoc'
import { fetchDocs } from '../../../_api/fetchDocs'
import { Blocks } from '../../../_components/Blocks'
import { PaywallBlocks } from '../../../_components/PaywallBlocks'
import { ProductHero } from '../../../_heros/Product'
import { generateMeta } from '../../../_utilities/generateMeta'

// Force this page to be dynamic so that Next.js does not cache it
// See the note in '../../../[slug]/page.tsx' about this
export const dynamic = 'force-dynamic'

export default async function Product({ params: { slug } }) {
  const { isEnabled: isDraftMode } = draftMode()

  let product: Product | null = null

  try {
    product = await fetchDoc<Product>({
      collection: 'products',
      slug,
      draft: isDraftMode,
    })
  } catch (error) {
    console.error(error) // eslint-disable-line no-console
  }

  if (!product) {
    notFound()
  }

  const { relatedProducts } = product

  return (
    <>
      <ProductHero product={product} />
      {product?.enablePaywall && <PaywallBlocks productSlug={slug as string} disableTopPadding />}
      <Blocks
        disableTopPadding
        blocks={[
          {
            blockType: 'relatedProducts',
            blockName: 'Related Product',
            relationTo: 'products',
            introContent: [
              {
                type: 'h3',
                children: [
                  {
                    text: 'Related Products',
                  },
                ],
              },
            ],
            docs: relatedProducts,
          },
        ]}
      />
    </>
  )
}

// export async function generateStaticParams() {
//   try {
//     const products = await fetchDocs<ProductType>('products')
//     return products?.map(({ slug }) => slug)
//   } catch (error) {
//     return []
//   }
// }

export async function generateStaticParams() {
  try {
    const products = await fetchDocs<ProductType>('products')

    if (!Array.isArray(products)) return []

    return products
      .filter((product): product is ProductType => {
        return (
          typeof product === 'object' &&
          product !== null &&
          'slug' in product &&
          typeof (product as any).slug === 'string' &&
          'id' in product &&
          'title' in product
        )
      })
      .map(product => ({ slug: product.slug }))
  } catch (error) {
    console.error('Error in generateStaticParams for products:', error)
    return []
  }
}
// export async function generateStaticParams() {
//   try {
//     const products = await fetchDocs<ProductType>('products')

//     return products.filter(p => typeof p === 'object' && 'slug' in p).map(p => ({ slug: p.slug }))
//   } catch (error) {
//     return []
//   }
// }

export async function generateMetadata({ params: { slug } }): Promise<Metadata> {
  const { isEnabled: isDraftMode } = draftMode()

  let product: Product | null = null

  try {
    product = await fetchDoc<Product>({
      collection: 'products',
      slug,
      draft: isDraftMode,
    })
  } catch (error) {}

  return generateMeta({ doc: product })
}

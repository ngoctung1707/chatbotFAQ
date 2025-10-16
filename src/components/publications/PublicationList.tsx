'use client'
import React, { useCallback, useEffect, useState } from 'react'
import PublicationCard from './PublicationCard'
import Pagination from './Pagination'
import { Publication } from '@/payload-types'

interface NewsPostProps {
  showItem: number
  publications: Publication[]
}

export default function PublicationList({ showItem, publications }: NewsPostProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const showLimit = showItem,
    paginationItem = 4
  const data = publications
  const [pagination, setPagination] = useState<number[]>([])
  const [limit] = useState(showLimit)
  const [pages, setPages] = useState(Math.ceil(data.length / limit))

  const cratePagination = useCallback(() => {
    // set pagination
    const arr = new Array(Math.ceil(data.length / limit)).fill(0).map((_, idx) => idx + 1)

    setPagination(arr)
    setPages(Math.ceil(data.length / limit))
  }, [data.length, limit])

  useEffect(() => {
    cratePagination()
  }, [cratePagination, limit, pages])

  const startIndex = currentPage * limit - limit
  const endIndex = startIndex + limit
  const getPaginatedProducts = data.sort((p1, p2) => p1.year - p2.year).slice(startIndex, endIndex)

  const start = Math.floor((currentPage - 1) / paginationItem) * paginationItem
  const end = start + paginationItem
  const getPaginationGroup = pagination.slice(start, end)

  const next = () => {
    setCurrentPage((page) => page + 1)
  }

  const prev = () => {
    setCurrentPage((page) => page - 1)
  }

  const handleActive = (item: number) => {
    setCurrentPage(item)
  }
  return (
    <>
      {getPaginatedProducts.length === 0 && <h3>No Publication</h3>}
      {getPaginatedProducts.map((item) => (
        <PublicationCard item={item} key={item.link} />
      ))}
      <Pagination
        getPaginationGroup={getPaginationGroup}
        currentPage={currentPage}
        pages={pages}
        next={next}
        prev={prev}
        handleActive={handleActive}
      />
    </>
  )
}

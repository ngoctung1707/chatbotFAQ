'use client'
import React, { useEffect, useState } from 'react'
import data from '@/util/blog.json'
import NewsCard from './NewsCard'
import Pagination from './Pagination'

interface NewsPostProps {
  style: number
  showItem: number
  showPagination: boolean
}

export default function NewsList({ style, showItem, showPagination }: NewsPostProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const showLimit = showItem,
    paginationItem = 4

  const [pagination, setPagination] = useState<number[]>([])
  const [limit] = useState(showLimit)
  const [pages, setPages] = useState(Math.ceil(data.length / limit))

  useEffect(() => {
    cratePagination()
  }, [limit, pages])

  const cratePagination = () => {
    // set pagination
    const arr = new Array(Math.ceil(data.length / limit)).fill(0).map((_, idx) => idx + 1)

    setPagination(arr)
    setPages(Math.ceil(data.length / limit))
  }

  const startIndex = currentPage * limit - limit
  const endIndex = startIndex + limit
  const getPaginatedProducts = data.slice(startIndex, endIndex)

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
      {getPaginatedProducts.length === 0 && <h3>No Products Found </h3>}

      {getPaginatedProducts.map((item) => (
        <React.Fragment key={item.id}>
          {!style && <NewsCard item={item} />}
          {style === 1 && <NewsCard item={item} />}
        </React.Fragment>
      ))}

      {showPagination && (
        <Pagination
          getPaginationGroup={getPaginationGroup}
          currentPage={currentPage}
          pages={pages}
          next={next}
          prev={prev}
          handleActive={handleActive}
        />
      )}
    </>
  )
}

'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PublicationCard from './PublicationCard'
import Pagination from './Pagination'
import { Publication } from '@/payload-types'

interface NewsPostProps {
  showItem: number
  publications: Publication[]
}

export default function PublicationList({ showItem, publications }: NewsPostProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All')

  const showLimit = showItem,
    paginationItem = 4

  const years = useMemo(
    () => Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a),
    [publications],
  )

  const filteredData = useMemo(() => {
    if (selectedYear === 'All') return publications
    return publications.filter((p) => p.year === selectedYear)
  }, [publications, selectedYear])

  const dataSortedDesc = useMemo(
    () => [...filteredData].sort((a, b) => b.year - a.year),
    [filteredData],
  )

  const [pagination, setPagination] = useState<number[]>([])
  const [limit] = useState(showLimit)
  const [pages, setPages] = useState(Math.ceil(dataSortedDesc.length / limit))

  const cratePagination = useCallback(() => {
    // set pagination
    const arr = new Array(Math.ceil(dataSortedDesc.length / limit)).fill(0).map((_, idx) => idx + 1)

    setPagination(arr)
    setPages(Math.ceil(dataSortedDesc.length / limit))
  }, [dataSortedDesc.length, limit])

  useEffect(() => {
    // reset to first page whenever filter changes
    setCurrentPage(1)
  }, [selectedYear])

  useEffect(() => {
    cratePagination()
  }, [cratePagination, limit, pages])

  const startIndex = currentPage * limit - limit
  const endIndex = startIndex + limit
  const getPaginatedProducts = dataSortedDesc.slice(startIndex, endIndex)

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
      <div className="d-flex justify-content-end align-items-center mb-20" style={{ gap: 12 }}>
        <label className="mb-0" htmlFor="pub-year-filter">
          Filter by year
        </label>
        <select
          id="pub-year-filter"
          className="form-select"
          style={{ maxWidth: 160 }}
          value={selectedYear === 'All' ? 'All' : String(selectedYear)}
          onChange={(e) => {
            const value = e.target.value
            setSelectedYear(value === 'All' ? 'All' : Number(value))
          }}
        >
          <option value="All">All</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
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
